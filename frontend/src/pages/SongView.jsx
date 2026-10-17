import { useEffect, useState } from "react";
import { deleteSong, getSong } from "../api/songs";
import PerformCanvas from "../components/PerformCanvas";

export default function SongView({ uuid, onBack, onEdit, onDeleted }) {
  const [song, setSong] = useState(null);
  const [error, setError] = useState(null);
  const [bpm, setBpm] = useState("");
  const [performing, setPerforming] = useState(false);

  useEffect(() => {
    getSong(uuid)
      .then((song) => {
        setSong(song);
        setBpm(song.bpm);
      })
      .catch((e) => setError(e.message));
  }, [uuid]);

  async function handleDelete() {
    if (!window.confirm(`Delete "${song.title}"?`)) return;
    try {
      await deleteSong(uuid);
      onDeleted();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <section>
      <div className="toolbar">
        <button onClick={onBack}>← Library</button>
        {song && (
          <div className="actions">
            <button onClick={onEdit}>Edit</button>
            <button className="danger" onClick={handleDelete}>Delete</button>
          </div>
        )}
      </div>
      {error && <p className="error">{error}</p>}
      {!song && !error && <p>Loading…</p>}
      {song && (
        <>
          <h2>{song.title}</h2>
          <p className="muted">
            {song.artist} · {song.album}
            {song.year ? ` · ${song.year}` : ""} · {song.bpm} BPM
          </p>
          <div className="perform-bar">
            <label>
              BPM
              <input
                type="number"
                min="1"
                value={bpm}
                onChange={(e) => setBpm(e.target.value)}
              />
            </label>
            <button
              className="primary"
              onClick={() => setPerforming(true)}
              disabled={song.song_lines.length === 0 || !(Number(bpm) > 0)}
            >
              ▶ Perform
            </button>
          </div>
          <div className="lines">
            {song.song_lines.map((line, i) => (
              <div className="line" key={i}>
                <div className="chords">{line.chords.join("  ") || " "}</div>
                <div>{line.line_text || " "}</div>
              </div>
            ))}
          </div>
          {performing && (
            <PerformCanvas song={song} bpm={Number(bpm)} onExit={() => setPerforming(false)} />
          )}
        </>
      )}
    </section>
  );
}
