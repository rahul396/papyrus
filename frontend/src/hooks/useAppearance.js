import { useEffect, useState } from "react";

const STORAGE_KEY = "papyrus.appearance";

export const THEMES = ["system", "light", "dark"];
// Hues live in app.css ([data-accent="…"]); this is just the list to offer.
export const ACCENTS = ["blue", "violet", "rose", "orange", "green", "teal"];

function load() {
  try {
    return { theme: "system", accent: "blue", ...JSON.parse(localStorage.getItem(STORAGE_KEY)) };
  } catch {
    return { theme: "system", accent: "blue" };
  }
}

export default function useAppearance() {
  const [appearance, setAppearance] = useState(load);

  useEffect(() => {
    const root = document.documentElement;
    if (appearance.theme === "system") delete root.dataset.theme;
    else root.dataset.theme = appearance.theme;
    root.dataset.accent = appearance.accent;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appearance));
    } catch {}
  }, [appearance]);

  return {
    ...appearance,
    setTheme: (theme) => setAppearance((a) => ({ ...a, theme })),
    setAccent: (accent) => setAppearance((a) => ({ ...a, accent })),
  };
}
