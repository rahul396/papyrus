# Papyrus

A sliding lyrics & chords canvas for live performance.

- **Library** of songs with lyrics and per-line chord annotations, each with a default BPM (adjustable before starting the canvas).
- **Add songs** to the library from the UI.

## Structure

```
papyrus/
├── backend/            # FastAPI
│   ├── app/
│   │   ├── api/routes/ # HTTP route modules
│   │   ├── core/       # settings / config
│   │   ├── db/         # DB session & setup
│   │   ├── models/     # ORM models
│   │   ├── schemas/    # Pydantic request/response schemas
│   │   ├── services/   # business logic
│   │   └── main.py     # app entrypoint
│   └── tests/
├── frontend/           # React (Vite)
│   └── src/
│       ├── api/        # API client
│       ├── components/ # reusable UI pieces
│       ├── pages/      # library, song editor, canvas
│       ├── hooks/
│       └── styles/
└── docker-compose.yml
```

## Running

```bash
cp .env.example .env
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:8000 (docs at `/docs`)
- Postgres: localhost:5432

Host ports can be changed in `.env` (`BACKEND_PORT`, `FRONTEND_PORT`, `DB_PORT`).

Both backend and frontend hot-reload from the mounted source.

The frontend calls the API through Vite's dev proxy (`/api/*` → `http://backend:8000/*`), so no CORS setup is needed. When running Vite outside Docker, set `API_PROXY_TARGET=http://localhost:8000`.
