import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

const BEATS_PER_BAR = 4;

// Each chord holds for one bar; a line with no chords still holds for one bar.
function buildTimeline(lines, bpm) {
  const barMs = (BEATS_PER_BAR * 60000) / bpm;
  let t = 0;
  const starts = lines.map((line) => {
    const start = t;
    t += Math.max(1, line.chords.length) * barMs;
    return start;
  });
  return { starts, barMs, total: t };
}

const noFocus = (e) => e.preventDefault(); // keep Space for play/pause, not "click focused button"

export default function PerformCanvas({ song, bpm, onExit }) {
  const lines = song.song_lines;
  const { starts, barMs, total } = useMemo(() => buildTimeline(lines, bpm), [lines, bpm]);

  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(true);
  const elapsedRef = useRef(0);
  const originRef = useRef(0);

  const index = Math.max(0, starts.findLastIndex((start) => start <= elapsed));
  const chordIndex = Math.floor((elapsed - starts[index]) / barMs);
  const done = elapsed >= total;

  function seek(t) {
    const clamped = Math.min(Math.max(t, 0), total);
    elapsedRef.current = clamped;
    originRef.current = performance.now() - clamped;
    setElapsed(clamped);
  }

  function toggle() {
    if (done) {
      seek(0);
      setPlaying(true);
    } else {
      setPlaying((p) => !p);
    }
  }

  const prev = () => seek(starts[index - 1] ?? 0);
  const next = () => seek(starts[index + 1] ?? total);

  // Clock: advances while playing, resumes from where it was paused.
  useEffect(() => {
    if (!playing) return;
    originRef.current = performance.now() - elapsedRef.current;
    let frame;
    const tick = (now) => {
      const t = Math.min(now - originRef.current, total);
      elapsedRef.current = t;
      setElapsed(t);
      if (t >= total) {
        setPlaying(false);
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, total]);

  // Drop focus from whatever opened the canvas so Space doesn't type or click.
  useEffect(() => document.activeElement?.blur(), []);

  // Keyboard: Space play/pause, ←/→ previous/next line, Esc exit.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === " ") {
        e.preventDefault();
        toggle();
      } else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "Escape") onExit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // Slide the track so the current line sits in the middle of the viewport.
  const viewportRef = useRef(null);
  const lineRefs = useRef([]);
  const [offset, setOffset] = useState(0);
  const [, setResizeTick] = useState(0);

  useLayoutEffect(() => {
    const line = lineRefs.current[index];
    const viewport = viewportRef.current;
    if (line && viewport) {
      setOffset(viewport.clientHeight / 2 - (line.offsetTop + line.offsetHeight / 2));
    }
  });

  useEffect(() => {
    const onResize = () => setResizeTick((n) => n + 1);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const lineProgress = done ? 1 : (elapsed - starts[index]) / ((starts[index + 1] ?? total) - starts[index]);

  return (
    <div className="perform">
      <div className="perform-header">
        <span>
          <strong>{song.title}</strong> · {song.artist}
        </span>
        <span className="muted">
          {bpm} BPM · line {index + 1}/{lines.length}
        </span>
      </div>

      <div className="perform-viewport" ref={viewportRef}>
        <div className="perform-track" style={{ transform: `translateY(${offset}px)` }}>
          {lines.map((line, i) => (
            <div
              key={i}
              ref={(el) => (lineRefs.current[i] = el)}
              className={`perform-line${i === index ? " current" : ""}`}
            >
              <div className="perform-chords">
                {line.chords.length === 0 && " "}
                {line.chords.map((chord, c) => (
                  <span
                    key={c}
                    className={i === index && c === chordIndex && !done ? "active" : ""}
                  >
                    {chord}
                  </span>
                ))}
              </div>
              <div className="perform-lyric">{line.line_text || " "}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="perform-progress">
        <div style={{ width: `${lineProgress * 100}%` }} />
      </div>

      <div className="perform-controls">
        <button onMouseDown={noFocus} onClick={() => seek(0)}>⏮ Restart</button>
        <button onMouseDown={noFocus} onClick={prev}>◀ Prev</button>
        <button onMouseDown={noFocus} onClick={toggle} className="primary">
          {done ? "↻ Replay" : playing ? "⏸ Pause" : "▶ Play"}
        </button>
        <button onMouseDown={noFocus} onClick={next}>Next ▶</button>
        <button onMouseDown={noFocus} onClick={onExit}>✕ Exit</button>
      </div>
    </div>
  );
}
