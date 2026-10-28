# TeachMatch

A verified, matched hiring marketplace connecting Indian schools and teachers — web app for search/browse/apply, mobile app for swipe-based matching.

## Stack

- **API** — Express + Prisma (Postgres, via the `pg` adapter), TypeScript, Better-Auth (email/password), Scalar API docs
- **Web** — React + Vite, Ant Design, TanStack Query, react-router — "Chalkboard" theme (dark, chalk-on-board look)
- **Mobile** — Expo (React Native) + NativeWind, Better-Auth's Expo client, TanStack Query, `react-native-deck-swiper` — same Chalkboard theme
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
  config/      env-driven setup (db client, better-auth, ...)
  domain/      pure business logic (matching score, salary badge, ...)
  services/    side-effecting helpers used by routes (match sync, notify, ...)
  middleware/  auth/permission guards
  routes/      HTTP route handlers
```

`apps/web/src/routes` holds one file per screen (plain components, not nested route files); `apps/mobile/src` mirrors it with `screens/`, `navigation/`, and `lib/`.

Tests live next to what they test (`foo.ts` + `foo.test.ts`, or `foo.integration.test.ts` for anything hitting a real Postgres).

## Prerequisites

- Node.js 24 LTS (`nvm use`, or whatever reads `.nvmrc`)
- pnpm (`corepack enable` or `npm i -g pnpm`)
- Docker (for local/test Postgres)
- Expo Go app on your phone, or an iOS/Android simulator, if you want to run the mobile app

## Setup

```bash
pnpm install

cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp apps/mobile/.env.example apps/mobile/.env

docker compose up -d postgres
pnpm --filter @teachmatch/api prisma:migrate
```

The defaults in each `.env.example` work as-is for local dev — the only one worth changing is `BETTER_AUTH_SECRET` (generate one with `openssl rand -base64 32`) before anything resembling production use.

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

Shared run/debug configurations are checked into `.run/` and load automatically — look for **API: dev**, **Web: dev**, **Web: debug (Chrome)**, **Mobile: start**, and the **Full App** / **Web: dev + debug** compound configs in the run configuration dropdown. Click Debug (not Run) to attach a debugger.

## API docs

With the API running, open **http://localhost:4000/docs** for a browsable Scalar reference of every route (auto-generated from the Better-Auth schema plus the hand-written REST endpoints).

## Admin access

There's no self-serve way to become an admin (an account granting itself review permissions would be a privilege-escalation hole). Sign up a normal account, then grant it from the command line:

```bash
pnpm --filter @teachmatch/api admin:grant you@example.com
```

That unlocks the verification queue at `/admin/verifications` in the web app — approving a school or teacher profile is what makes their postings/applications visible to everyone else (`isHidden` defaults to `true` until then).

## Testing

```bash
pnpm test           # unit + integration tests across all apps
pnpm test:e2e        # Playwright end-to-end tests
```

The API's integration tests run against a real Postgres, not a mock:

```bash
docker compose up -d postgres-test
pnpm --filter @teachmatch/api test:db:migrate   # first time only
pnpm --filter @teachmatch/api test
```

## Connecting a DB client (DBeaver, etc.)

The dev Postgres runs on **port 5434**, not the default 5432 — deliberately, to avoid clashing with a native Postgres install some machines already have running there.

| Field | Value |
|---|---|
| Host | `localhost` |
| Port | `5434` |
| Database | `teachmatch` |
| Username | `teachmatch` |
| Password | `teachmatch` |

(Local dev credentials only, defined in `docker-compose.yml` — not meant for anything beyond your machine.)

## Environment variables

| App | File | Notes |
|---|---|---|
| api | `apps/api/.env` | `DATABASE_URL`, `PORT`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `WEB_ORIGIN` — copy from `.env.example` |
| api (tests) | `apps/api/.env.test` | points at the `postgres-test` docker service, already committed (no secrets) |
| web | `apps/web/.env` | `VITE_API_URL` — copy from `.env.example` |
| mobile | `apps/mobile/.env` | `EXPO_PUBLIC_API_URL` — copy from `.env.example`; on a physical device over Expo Go, swap `localhost` for your machine's LAN IP |
