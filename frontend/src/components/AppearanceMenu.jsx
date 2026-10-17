import useAppearance, { ACCENTS, THEMES } from "../hooks/useAppearance";

const THEME_LABELS = { system: "Auto", light: "Light", dark: "Dark" };

export default function AppearanceMenu() {
  const { theme, accent, setTheme, setAccent } = useAppearance();

  return (
    <details className="appearance">
      <summary aria-label="Appearance">◐</summary>
      <div className="appearance-panel">
        <div className="appearance-label">Theme</div>
        <div className="segmented">
          {THEMES.map((t) => (
            <button
              key={t}
              className={t === theme ? "selected" : ""}
              onClick={() => setTheme(t)}
            >
              {THEME_LABELS[t]}
            </button>
          ))}
        </div>
        <div className="appearance-label">Accent</div>
        <div className="swatches">
          {ACCENTS.map((a) => (
            <button
              key={a}
              data-accent={a}
              className={`swatch${a === accent ? " selected" : ""}`}
              aria-label={a}
              title={a}
              onClick={() => setAccent(a)}
            />
          ))}
        </div>
      </div>
    </details>
  );
}
