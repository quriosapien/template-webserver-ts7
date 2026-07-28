# Contributing

## Prerequisites

- Node.js >= 26 — run `nvm use` to pick up the version pinned in `.nvmrc`.

## Setup

```bash
nvm use
npm install                  # also installs git hooks via lefthook (the "prepare" script)
cp .env.example .env.local   # edit values if needed; defaults work for local dev
npm run dev                  # http://localhost:3000/api/health
```

## Local dev loop

- `npm run dev` — watch-mode dev server.
- `npm test` — run the test suite once, no coverage (fast, for iterating).
- `npm run test:watch` — Vitest UI/watch mode.

## Before pushing

Run the same checks CI runs, in order:

```bash
npm run lint         # Biome: lint + format + import order
npm run typecheck    # tsgo --noEmit
npm run build        # tsup, catches bundling issues typecheck alone won't
npm run test:coverage
```

`lefthook` runs `biome check --write` on staged files automatically at commit time, so most style
issues are fixed before you even get to `npm run lint`.

## What CI checks

`.github/workflows/ci.yml` runs, on every push to `main` and every PR: lint → typecheck → build →
test with coverage thresholds enforced (see `vitest.config.ts`).

## PR checklist

- [ ] Tests added/updated (this repo follows TDD — see [CLAUDE.md](CLAUDE.md)).
- [ ] `docs/openapi.yaml` updated if you added or changed an endpoint.
- [ ] Clear, descriptive commit messages.

## Validating the OpenAPI spec

No dependency is installed for this (kept out of scope to avoid a lint-only devDependency for a
2-endpoint spec), but you can validate or preview it with `npx` and nothing installed:

```bash
npx @redocly/cli lint docs/openapi.yaml
npx @redocly/cli preview-docs docs/openapi.yaml
```
