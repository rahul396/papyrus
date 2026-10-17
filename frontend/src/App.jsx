import { useState } from "react";
import SongList from "./pages/SongList";
import SongView from "./pages/SongView";
import SongForm from "./pages/SongForm";
import AppearanceMenu from "./components/AppearanceMenu";
import "./styles/app.css";

export default function App() {
  // { name: "list" } | { name: "view", uuid } | { name: "new" } | { name: "edit", uuid }
  const [view, setView] = useState({ name: "list" });
  const showList = () => setView({ name: "list" });
  const showSong = (uuid) => setView({ name: "view", uuid });

  return (
    <div className="app">
      <header className="app-header">
        <h1 onClick={showList}>Papyrus</h1>
        <AppearanceMenu />
      </header>
      <main>
        {view.name === "list" && (
          <SongList onOpen={showSong} onNew={() => setView({ name: "new" })} />
        )}
        {view.name === "view" && (
          <SongView
            uuid={view.uuid}
            onBack={showList}
            onEdit={() => setView({ name: "edit", uuid: view.uuid })}
            onDeleted={showList}
          />
        )}
        {view.name === "new" && <SongForm onSaved={showSong} onCancel={showList} />}
        {view.name === "edit" && (
          <SongForm
            uuid={view.uuid}
            onSaved={showSong}
            onCancel={() => showSong(view.uuid)}
          />
        )}
      </main>
    </div>
  );
}
