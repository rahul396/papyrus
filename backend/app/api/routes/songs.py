from fastapi import APIRouter, HTTPException
from app.services import song_service
from app.models.pydantic_models import Song, SongRead, SongUpdate

router = APIRouter(
    prefix="/songs",
    tags=["songs"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=list[SongRead])
async def list_songs():
    return await song_service.list_songs()

@router.get("/{song_uuid}", response_model=SongRead)
async def get_song(song_uuid: str):
    song = await song_service.get_song_by_uuid(song_uuid)
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    return song

@router.post("/", response_model=SongRead)
async def create_song(song: Song):
    return await song_service.create_song(song)

@router.patch("/{song_uuid}", response_model=SongRead)
async def patch_song(song_uuid: str, song_data: SongUpdate):
    song = await song_service.patch_song(song_uuid, song_data)
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    return song

@router.delete("/{song_uuid}", status_code=204)
async def delete_song(song_uuid: str):
    if not await song_service.delete_song(song_uuid):
        raise HTTPException(status_code=404, detail="Song not found")
