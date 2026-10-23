# BSZZ Dojo

The archery club's results app: record your rounds, compare yourself on the leaderboards and look at
the other archers' profiles. Installable as an app (PWA) on phones.

Built as a [Turborepo](https://turborepo.com) monorepo: a NestJS API with TypeORM and Postgres, an
Angular frontend styled with Panda CSS, and a shared package for types and domain rules.

```
apps/
  api/        NestJS 11 + TypeORM          → http://localhost:3000/api (Swagger UI)
  web/        Angular 21 + Panda CSS, PWA  → http://localhost:4200
packages/
  shared/     @bszz-dojo/shared — types, DTOs, bow types, score rules, dates
```

## Features

- Accounts with username, email and password; password reset by email; stays logged in for 30 days.
- Record rounds (bow type, target face, spot, date, distance, arrows, 10s, 9s, result).
- Leaderboards: all time and this month at 18m and 8m (30 arrows, with the bow type's handicap),
  and the medal table of tournament placings.
- Profiles with average per arrow, personal bests per distance, a progress chart per bow type,
  placings and the latest rounds (deletable on your own profile).
- User search, light and dark theme (saved in the account).
- Request a placing from the admins. Admins approve or reject requests, hand out club badges
  ("Abzeichen") and placings, delete users and can force an app update.

## Getting started

1. Create `apps/api/.env` from `apps/api/.env.example`: a Postgres `DATABASE_URL` (the dev
   database or a local Postgres) and a random `JWT_ACCESS_SECRET` (`openssl rand -base64 48`).
2. Install and run:

```bash
npm install
npm run dev
```

`npm run dev` builds `@bszz-dojo/shared`, runs pending migrations and starts everything in watch
mode. The Angular dev server proxies `/api/*` to the API. Make your account an admin with
`UPDATE users SET role = 'admin' WHERE username_key = '<your name, lowercase>';`.

## Scripts (run from the root)

| Command             | What it does                                 |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | Run all apps in watch mode                   |
| `npm run build`     | Build everything (shared → api, web)         |
| `npm run typecheck` | Type-check every workspace                   |
| `npm run lint`      | Lint every workspace (`lint:fix` to autofix) |
| `npm run format`    | Format with Prettier                         |
| `npm run clean`     | Remove build output                          |

Run a single app with a filter, e.g. `npx turbo run dev --filter=api`.

Database migrations:

```bash
npm run migration:generate -w api -- src/database/migrations/AddSomething
npm run migration:run -w api
```

## Styling

[Panda CSS](https://panda-css.com) with the theme in `apps/web/theme/`: base tokens (the old
app's colors, spacing and sizes), semantic tokens (with the light theme), text styles, layer
styles and recipes for the recurring pieces (buttons, inputs, tabs, list rows, dialogs, …).
Components build their classes with `css()` and the recipes; `panda codegen` generates
`styled-system/`.

## Linting

[Oxlint](https://oxc.rs/docs/guide/usage/linter) lints every workspace (root `.oxlintrc.json`,
extended per workspace). The web app also runs the
[Panda CSS lint rules](https://panda-css.com/docs/guides/eslint) (`@pandacss/eslint-plugin`) as an
Oxlint JS plugin: no hard-coded colors, no `!important`, no escape hatches, only valid tokens.
Every function must declare its return type and `any` is not allowed. CI fails on warnings too.

## Deployment

Web, API and database are all on Vercel: one project with two
[services](https://vercel.com/docs/services) and a Neon Postgres database each for dev (local and
previews) and prod. See [docs/deployment.md](docs/deployment.md).

## AI agents

`AGENTS.md` holds the conventions for AI coding agents; `CLAUDE.md` imports it.
