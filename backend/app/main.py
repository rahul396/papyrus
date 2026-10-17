from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import songs
from app.core.config import settings
from app.db import Base
from app.db.connection import engine
import app.models.db_models  # noqa: F401  (registers tables on Base.metadata)


@asynccontextmanager
async def lifespan(_: FastAPI):
    # No migrations yet: create any missing tables on startup.
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(songs.router)


@app.get("/health")
def health():
    return {"status": "ok"}
