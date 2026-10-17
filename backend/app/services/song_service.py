from typing import Optional, Sequence

from sqlalchemy import select

from app.db.connection import get_session
from app.models.db_models import Song
from app.models.pydantic_models import Song as SongIn, SongUpdate


async def _find(session, song_uuid: str) -> Optional[Song]:
    result = await session.execute(select(Song).where(Song.uuid == song_uuid))
    return result.scalar_one_or_none()

async def list_songs() -> Sequence[Song]:
    async with get_session() as session:
        result = await session.execute(select(Song).order_by(Song.title))
        return result.scalars().all()

async def get_song_by_uuid(song_uuid: str) -> Optional[Song]:
    async with get_session() as session:
        return await _find(session, song_uuid)

async def create_song(song_data: SongIn) -> Song:
    async with get_session() as session:
        song = Song(**song_data.model_dump())
        session.add(song)
        await session.commit()
        await session.refresh(song)
        return song

async def patch_song(song_uuid: str, song_data: SongUpdate) -> Optional[Song]:
    async with get_session() as session:
        song = await _find(session, song_uuid)
        if song is None:
            return None
        for key, value in song_data.model_dump(exclude_unset=True).items():
            setattr(song, key, value)
        await session.commit()
        await session.refresh(song)
        return song

async def delete_song(song_uuid: str) -> bool:
    async with get_session() as session:
        song = await _find(session, song_uuid)
        if song is None:
            return False
        await session.delete(song)
        await session.commit()
        return True
