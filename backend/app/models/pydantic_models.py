from typing import List, Optional
from pydantic import BaseModel

class SongLine(BaseModel):
    line_text: Optional[str] = "" # Blank lines mean just music i.e maybe the gap between intro and verse
    chords: List[str] = []

class Song(BaseModel):
    title: str
    artist: Optional[str] = "Unknown"
    album: Optional[str] = "Unknown"
    year: Optional[int] = None
    bpm: int = 120
    song_lines: List[SongLine] = []

class SongRead(Song):
    model_config = {"from_attributes": True}

    uuid: str

class SongUpdate(BaseModel):
    title: Optional[str] = None
    artist: Optional[str] = None
    album: Optional[str] = None
    year: Optional[int] = None
    bpm: Optional[int] = None
    song_lines: Optional[List[SongLine]] = None
