import { useEffect, useState } from "react";
import { createSong, getSong, updateSong } from "../api/songs";

// Lines are edited as plain text, one song line per row:
//   "Em7 G | Today is the day"   chords, then lyric
//   "Em7 G |"                    chords only (instrumental)
//   "Just a lyric"               lyric with no chords
function linesToText(lines) {
  return lines
    .map(({ chords, line_text }) =>
      chords.length ? `${chords.join(" ")} | ${line_text}`.trimEnd() : line_text
    )
    .join("\n");
}

function textToLines(text) {
  return text.split("\n").map((row) => {
    if (!row.includes("|")) return { chords: [], line_text: row.trim() };
    const [chords, ...rest] = row.split("|");
    return {
      chords: chords.trim().split(/\s+/).filter(Boolean),
      line_text: rest.join("|").trim(),
    };
  });
}

const EMPTY = { title: "", artist: "", album: "", year: "", bpm: 120, lines: "" };

export default function SongForm({ uuid, onSaved, onCancel }) {
  const [form, setForm] = useState(uuid ? null : EMPTY);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!uuid) return;
    getSong(uuid)
      .then((song) =>
        setForm({
          title: song.title,
          artist: song.artist,
          album: song.album,
          year: song.year ?? "",
          bpm: song.bpm,
          lines: linesToText(song.song_lines),
        })
      )
      .catch((e) => setError(e.message));
  }, [uuid]);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    const song = {
      title: form.title.trim(),
      artist: form.artist.trim() || "Unknown",
      album: form.album.trim() || "Unknown",
      year: form.year === "" ? null : Number(form.year),
      bpm: Number(form.bpm),
      song_lines: textToLines(form.lines),
    };
    setSaving(true);
    setError(null);
    try {
      const saved = uuid ? await updateSong(uuid, song) : await createSong(song);
      onSaved(saved.uuid ?? uuid);
    } catch (e) {
      setError(e.message);
      setSaving(false);
    }
  }

  if (!form) return error ? <p className="error">{error}</p> : <p>Loading…</p>;

  return (
    <form className="song-form" onSubmit={handleSubmit}>
      <h2>{uuid ? "Edit song" : "New song"}</h2>
      <label>
        Title
        <input value={form.title} onChange={set("title")} required />
      </label>
      <div className="row">
        <label>
          Artist
          <input value={form.artist} onChange={set("artist")} placeholder="Unknown" />
        </label>
        <label>
          Album
          <input value={form.album} onChange={set("album")} placeholder="Unknown" />
        </label>
      </div>
      <div className="row">
        <label>
          Year
          <input type="number" value={form.year} onChange={set("year")} />
        </label>
        <label>
          BPM
          <input type="number" min="1" value={form.bpm} onChange={set("bpm")} required />
        </label>
      </div>
      <label>
        Lines
        <span className="hint">
          One line per row: <code>Em7 G | lyric text</code>. Leave out the <code>|</code> for
          lyrics with no chords; a row with chords and nothing after <code>|</code> is
          instrumental.
        </span>
        <textarea rows="14" value={form.lines} onChange={set("lines")} />
      </label>
      {error && <p className="error">{error}</p>}
      <div className="actions">
        <button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
