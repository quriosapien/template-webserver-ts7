# template-ts7

Production-grade **Node.js 26 + TypeScript** backend template: Express 5, a strict
`routes → controller → service → repository` layering, manual dependency injection, fast modern
tooling, per-stage environment config, and stubbed clients for five datastores.

## Toolchain

| Concern        | Tool                                          | Why |
| -------------- | --------------------------------------------- | --- |
| Type-checking  | **tsgo** (`@typescript/native-preview`)       | The Go-based TypeScript compiler — very fast, `--noEmit` only. |
| Lint + format  | **Biome** (single Rust binary)                | Replaces ESLint **and** Prettier — one tool, one config. |
| Dev server     | **tsx watch** (esbuild)                        | Runs TS directly, restarts on change. |
| Prod build     | **tsup** (esbuild)                             | Bundles `src/` → a single `dist/index.js`. |
| Tests          | **Vitest**                                     | Fast, great mocking for isolated unit tests. |
| Git hooks      | **lefthook** (Go binary)                       | Pre-commit Biome run so style never drifts across PRs. |

## Requirements

- **Node.js >= 26** (`.nvmrc` pins `26`; run `nvm use`).

## Getting started

```bash
nvm use                 # selects Node 26
npm install             # installs deps + git hooks (lefthook)
cp .env.example .env.local   # then edit values (already provided for local dev)
npm run dev             # http://localhost:3000/api/health
```

## Scripts

| Script              | Description |
| ------------------- | ----------- |
| `npm run dev`       | Watch-mode dev server (tsx). |
| `npm run build`     | Bundle to `dist/` (tsup). |
| `npm start`         | Run the built server (`node dist/index.js`). |
| `npm run typecheck` | Type-check with tsgo. |
| `npm run lint`      | Biome check (lint + format + import order). |
| `npm run lint:fix`  | Biome check with autofix. |
| `npm run format`    | Biome format only. |
| `npm test`          | Run unit tests once. |
| `npm run test:watch`| Vitest watch mode. |

## Environment configuration

The active config file is chosen by **`APP_ENV`** (`local` | `development` | `test` | `staging` |
`production`, default `local`). On boot, `src/config/env.ts` loads `.env.<APP_ENV>`, validates every
variable against a **Zod schema**, and exports a typed, frozen `config`. Invalid/missing values fail
fast with a readable error. **Nothing else in the app reads `process.env` directly.**

```bash
APP_ENV=test npm start      # loads .env.test
```

Only `.env.example` is committed; the per-stage files are git-ignored.

## Project structure

```
src/
├── index.ts            # entrypoint: wire graph → connect stores → listen → graceful shutdown
├── cluster.ts          # CLUSTER_ENABLED → fork one worker per core; else single process
├── server.ts           # Express 5 app assembly (security, parsing, routes, error handling)
├── container.ts        # composition root — the ONLY place dependencies are constructed
├── config/             # per-stage, Zod-validated, typed config
├── constants/          # shared constants (*.constant.ts)
├── utils/              # logger, AppError (*.util.ts)
├── helpers/            # response envelopes (*.helper.ts)
├── middlewares/        # request-context, error-handler, not-found (*.middleware.ts)
├── db/                 # datastore clients: postgres / mongo / redis / kafka / elasticsearch (STUBS)
├── routes/             # mounts module routers under /api
└── modules/
    └── health/         # reference feature: *.route / *.controller / *.service / *.repository / *.types / *.test
```

### Layering & dependency injection

Each layer depends on an **interface** and receives the concrete instance through its **constructor**.
`src/container.ts` is the single composition root that wires everything top-down
(`db clients → repository → service → controller`). Because no layer constructs its own dependencies,
every unit is testable in isolation — see [`health.service.test.ts`](src/modules/health/health.service.test.ts),
which exercises the service against a fully mocked repository.

### File suffix convention

Files are named by role: `*.route.ts`, `*.controller.ts`, `*.service.ts`, `*.repository.ts`,
`*.types.ts`, `*.middleware.ts`, `*.constant.ts`, `*.util.ts`, `*.helper.ts`, `*.client.ts`,
`*.test.ts`.

## Datastores (stubbed)

`src/db/*.client.ts` provide PostgreSQL, MongoDB, Redis, Kafka, and Elasticsearch clients. They
implement a common `connect()` / `disconnect()` lifecycle (wired into startup/shutdown) and expose the
idiomatic methods for each store (e.g. `query`, `find`/`insert`, `get`/`set`, `produce`/`consume`,
`index`/`search`). **Bodies are stubs marked `// TODO`** — real connection logic is intentionally
deferred. The drivers (`pg`, `mongodb`, `ioredis`, `kafkajs`, `@elastic/elasticsearch`) are already
installed.

## Running across all CPU cores

A single Node process uses one core. To use them all:

- **Containers / k8s:** keep `CLUSTER_ENABLED=false` and run multiple replicas (recommended).
- **Single VM / bare host:** set `CLUSTER_ENABLED=true` — `src/cluster.ts` forks one worker per core
  (via `os.availableParallelism()`) and restarts any that die.

```bash
CLUSTER_ENABLED=true npm start
```

## Code style consistency

Style is enforced in three layers so no PR competes over formatting:

1. `.vscode/settings.json` — Biome as default formatter, format + organize-imports on save.
2. `.vscode/extensions.json` — recommends the Biome extension.
3. **lefthook pre-commit** runs `biome check --write` on staged files (the guarantee), with
   `npm run lint:ci` (`biome ci .`) as the CI backstop.
