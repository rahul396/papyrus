import os

# Point the app at a dedicated test database *before* anything imports
# app.core.config, so tests never touch the dev data. Overrides the
# DATABASE_URL that docker-compose sets on the backend container.
TEST_DATABASE_URL = os.environ.get(
    "TEST_DATABASE_URL",
    "postgresql+asyncpg://papyrus:papyrus@db:5432/papyrus_test",
)
os.environ["DATABASE_URL"] = TEST_DATABASE_URL

import asyncpg  # noqa: E402
import httpx  # noqa: E402
import pytest  # noqa: E402
from sqlalchemy.engine import make_url  # noqa: E402

_database_ready = False


async def _ensure_test_database():
    global _database_ready
    if _database_ready:
        return
    url = make_url(TEST_DATABASE_URL)
    conn = await asyncpg.connect(
        user=url.username,
        password=url.password,
        host=url.host,
        port=url.port or 5432,
        database="postgres",
    )
    try:
        exists = await conn.fetchval(
            "SELECT 1 FROM pg_database WHERE datname = $1", url.database
        )
        if not exists:
            await conn.execute(f'CREATE DATABASE "{url.database}"')
    finally:
        await conn.close()
    _database_ready = True


@pytest.fixture
async def client():
    from app.db import Base
    from app.db.connection import engine
    import app.models.db_models  # noqa: F401  (registers tables on Base.metadata)
    from app.main import app

    await _ensure_test_database()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as c:
        yield c

    # Pooled asyncpg connections are bound to this test's event loop.
    await engine.dispose()
