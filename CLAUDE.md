# CLAUDE.md

Guidance for Claude Code (or any future contributor) working in this repo.

## What this repo is

A **scaffold**, not a product. `health` (`GET /api/health`) is the only real reference feature,
demonstrating the full `controller → service → repository` layering. `echo` (`POST /api/echo`) is a
second, deliberately thin endpoint that exists only to demonstrate `validate.middleware.ts` in
context — don't copy its shape when adding a real feature; copy `health`'s.

## Layering rule

`routes → controller → service → repository → db client`. Each layer depends on an **interface**
and receives its concrete dependency through the **constructor**. `src/container.ts` is the *only*
place `new` is called to wire the graph — no layer constructs its own dependencies. When adding a
feature, wire it into `container.ts` and `src/routes/index.ts` the same way `health`/`echo` are
wired.

## File-suffix convention

When adding a file, use the suffix matching its role — don't invent new ones:

| Suffix | Role |
| --- | --- |
| `*.route.ts` | Express router factory |
| `*.controller.ts` | HTTP <-> service translation, no business logic |
| `*.service.ts` | Business logic, depends on repository interfaces |
| `*.repository.ts` | Data access |
| `*.types.ts` | DTOs, Zod schemas, interfaces |
| `*.middleware.ts` | Express middleware |
| `*.constant.ts` | Shared constants |
| `*.util.ts` | Stateless helpers |
| `*.helper.ts` | Response envelopes and similar |
| `*.client.ts` | Datastore client wrapper |

## Config rule

Never read `process.env` outside `src/config/env.ts`. Adding a new env var requires all of:
1. A Zod schema entry in `src/config/env.ts`.
2. An entry in `.env.example` with a comment.
3. If the var is consumed by code exercised in tests, an entry in `vitest.config.ts`'s `test.env`.

## Testing rule

Two distinct layers, don't blur them:
- **Unit tests** (`src/tests/**`, mirroring `src/`): hand-rolled `vi.fn()` mocks
  (`src/tests/support/express-mocks.ts`, `src/tests/support/fake-logger.ts`) isolate one layer at a
  time. Use these for business logic, branching, and error paths — they're fast and precise.
- **Integration tests** (`src/tests/integration/**`, `*.integration.test.ts`): drive the real
  assembled app (`createServer(buildContainer())`) with `supertest`. Use these only when the thing
  under test is an interaction between middleware/layers that a mock would hide — e.g. middleware
  ordering, real HTTP status codes, rate-limit behavior. Don't reach for supertest to test pure logic
  a mock can isolate faster.

This project follows **test-driven development**: write the failing test first, watch it fail for
the expected reason, then write the minimal code to pass.

## Known intentional states — not bugs

- Health checks report `status: 'unknown'` for every datastore, not `'healthy'`. This is honest: no
  connectivity pings are implemented yet (see `src/repositories/health.repository.ts`). Don't
  "fix" this by hardcoding `'healthy'`; implement real pings if that's ever explicitly requested.
- `src/db/*.client.ts` are stubs (`connect()`/`disconnect()` just log). Don't wire up real
  connections without being asked.

## Out of scope — don't add without being asked

- Authentication (no passport/JWT/session pattern exists or is implied).
- Docker / docker-compose.
- Real datastore connectivity.
- `dotenv` (env loading uses Node's native `process.loadEnvFile`).
- ESLint or Prettier (Biome replaces both).

## Pointers

- [README.md](README.md) — toolchain, setup, project structure.
- [CONTRIBUTING.md](CONTRIBUTING.md) — local dev loop, required checks before pushing.
- [docs/openapi.yaml](docs/openapi.yaml) — API spec; update it when adding/changing an endpoint.
