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

## Production

```bash
cp .env.prod.example .env.prod   # set a real POSTGRES_PASSWORD
docker compose -f docker-compose-PROD.yml --env-file .env.prod up -d --build
```

- The frontend is built into static files and served by nginx on `APP_PORT` (default 80). nginx proxies `/api/*` to the backend.
- The backend and Postgres are not published to the host; data lives in the `papyrus-prod_db_data` volume.
- Always pass `--env-file .env.prod`: without it Compose falls back to the dev `.env`.
- No TLS is configured — put it behind a TLS-terminating proxy (Caddy, Traefik, a load balancer, …) for HTTPS.

Update: `git pull && docker compose -f docker-compose-PROD.yml --env-file .env.prod up -d --build`
