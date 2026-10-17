import { useEffect, useState } from "react";
import { listSongs } from "../api/songs";

export default function SongList({ onOpen, onNew }) {
  const [songs, setSongs] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    listSongs().then(setSongs).catch((e) => setError(e.message));
  }, []);

  return (
    <section>
      <div className="toolbar">
        <h2>Library</h2>
        <button onClick={onNew}>+ Add song</button>
      </div>
      {error && <p className="error">Couldn't load songs ({error})</p>}
      {!songs && !error && <p>Loading…</p>}
      {songs && songs.length === 0 && <p>No songs yet.</p>}
      {songs && songs.length > 0 && (
        <ul className="song-list">
          {songs.map((song) => (
            <li key={song.uuid} onClick={() => onOpen(song.uuid)}>
              <strong>{song.title}</strong>
              <span>{song.artist}</span>
              <span className="muted">{song.bpm} BPM</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
