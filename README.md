# Cartesia Monorepo

Estructura monorepo para una app tipo roadmap.sh con Angular (frontend) y Go (backend).

## Estructura

- `frontend/`: Angular 20 + PrimeNG + Tailwind + X6
- `backend/`: Go (Fiber + GORM + SQLite)

## Desarrollo

Frontend:

```bash
cd frontend
npm install
npm start # o ng serve
```

Abre `http://localhost:4200/`.

Backend:

```bash
cd backend
go run ./cmd/server
```

Variables por defecto:
- `PORT=8080`
- `DB_PATH=./data/app.db`
- `ALLOWED_ORIGINS=http://localhost:4200`

## Rutas iniciales

- `GET /api/v1/health` → salud del backend
- `GET /api/v1/roadmaps` → lista básica (placeholder)

## Notas

- El archivo SQLite se guarda en `backend/data/app.db` y está ignorado por git.
- La API está versionada bajo `/api/v1`.
