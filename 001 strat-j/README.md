# STRAT-J

Personal strategic journal with a TypeScript monorepo:
- contracts: shared DTOs + runtime validation (zod)
- storage: SQLite (better-sqlite3) with local file storage
- server: Express API with CORS
- client: Vite + React UI

The project is ready to install and run locally with pnpm.

## Requirements
- Node.js 18+ (tested with Node 24)
- pnpm 9+

## Install and Run
```bash
cd strat-j
pnpm install
pnpm dev
```

Client: http://localhost:5173  
Server: http://localhost:8787

## Build
```bash
pnpm build
```

## API checks (PowerShell)
```powershell
curl -X POST http://localhost:8787/api/entries ^
  -H "Content-Type: application/json" ^
  -d "{\"type\":\"LOG\",\"text\":\"Daily review\",\"tags\":[\"review\",\"ops\"],\"stateEnergy\":3,\"stateFocus\":4,\"stateTension\":2}"
```

```powershell
curl "http://localhost:8787/api/entries?from=2025-01-01T00:00:00.000Z&to=2025-12-31T23:59:59.999Z&q=review&type=LOG&tag=ops"
```

```powershell
curl "http://localhost:8787/api/tags"
```

## Project Notes
- DB file location: `packages/storage/data/strat-j.sqlite`
- Server binds to `0.0.0.0:8787` (LAN-friendly)
- Client dev server runs on `5173` and proxies `/api` to the server

## Monorepo structure
```
strat-j/
  package.json
  pnpm-workspace.yaml
  packages/
    contracts/
    storage/
    server/
    client/
```

## API summary
- POST `/api/entries` -> `{ ok: true, entry }`
- GET `/api/entries?from=&to=&q=&type=&tag=` -> `{ ok: true, items }`
- GET `/api/tags` -> `{ ok: true, items }`

## Troubleshooting
- If the server cannot load `@strat-j/contracts`, run `pnpm install` in the repo root.
- If SQLite native module fails to install, use an LTS Node.js version (18 or 20) and reinstall.

If you want, I can also add sample data seeding or a simple export/import feature.
