# TeachMatch

A verified, matched hiring marketplace connecting Indian schools and teachers — web app for search/apply, mobile app for swipe-based matching.

## Stack

- **API** — Express + Prisma (Postgres, via the `pg` adapter), TypeScript
- **Web** — React + Vite
- **Mobile** — Expo (React Native)
- **Monorepo** — pnpm workspaces + Turborepo, with shared types in `packages/shared`

## Project structure

```
apps/
  api/       Express backend + Prisma schema
  web/       React + Vite web app
  mobile/    Expo mobile app
  e2e/       Playwright end-to-end tests (run against apps/web)
packages/
  shared/    Types shared across api/web/mobile
```

`apps/api/src` is organized by concern, not one flat folder:

```
src/
  config/    env-driven setup (db client, ...)
  domain/    business logic (matching, salary badge, ...)
  routes/    HTTP route handlers
```

Tests live next to what they test (`foo.ts` + `foo.test.ts`).

## Prerequisites

- Node.js 20+
- pnpm (`corepack enable` or `npm i -g pnpm`)
- Docker (for local/test Postgres)

## Setup

```bash
pnpm install
cp apps/api/.env.example apps/api/.env   # then fill in DATABASE_URL if needed
docker compose up -d postgres
pnpm --filter @teachmatch/api prisma:migrate
```

## Running things

Each app can run on its own:

```bash
pnpm dev:api      # API on :4000
pnpm dev:web      # web on :5173
pnpm dev:mobile   # Expo dev server
```

Or run everything at once with `pnpm dev`.

For any other per-app command (build, lint, etc.), use `pnpm --filter @teachmatch/<name> <script>` — e.g. `pnpm --filter @teachmatch/web build`.

### WebStorm

Shared run/debug configurations are checked into `.run/` and load automatically — look for **API: dev**, **Web: dev**, **Web: debug (Chrome)**, and **Mobile: start** in the run configuration dropdown. Click Debug (not Run) to attach a debugger.

## Testing

```bash
pnpm test           # unit + integration tests across all apps
pnpm test:e2e        # Playwright end-to-end tests
```

The API's database integration tests run against a real Postgres, not a mock:

```bash
docker compose up -d postgres-test
pnpm --filter @teachmatch/api test:db:migrate   # first time only
pnpm --filter @teachmatch/api test
```

## Environment variables

| App | File | Notes |
|---|---|---|
| api | `apps/api/.env` | `DATABASE_URL`, `PORT` — copy from `.env.example` |
| api (tests) | `apps/api/.env.test` | points at the `postgres-test` docker service, already committed (no secrets) |
