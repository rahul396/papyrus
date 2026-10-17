const BASE = "/api/songs";

async function request(path, options = {}) {
  const response = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const detail = typeof body.detail === "string" ? body.detail : response.statusText;
    throw new Error(`${response.status}: ${detail}`);
  }
  return response.status === 204 ? null : response.json();
}

export const listSongs = () => request("/");
export const getSong = (uuid) => request(`/${uuid}`);
export const createSong = (song) =>
  request("/", { method: "POST", body: JSON.stringify(song) });
export const updateSong = (uuid, song) =>
  request(`/${uuid}`, { method: "PATCH", body: JSON.stringify(song) });
export const deleteSong = (uuid) => request(`/${uuid}`, { method: "DELETE" });
