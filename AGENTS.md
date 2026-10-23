# AGENTS.md

Guidance for AI coding agents working in this repo. Read this before making changes.

## Project

Turborepo monorepo using npm workspaces, Node 22.

BSZZ Dojo is the archery club's results app (German UI, Swiss spelling: "ss", never "ß"). Archers
log in with username and password, record their rounds ("Scores"), compare themselves on the
leaderboards and look at each other's profiles with their club badge ("Abzeichen") and
tournament placings ("Auszeichnungen"), both recorded by the archers themselves. Admins manage
users. It's an installable PWA.

- `apps/api`: NestJS 11. REST under the global prefix `/api` (Swagger UI at `/api`, OpenAPI JSON
  at `/api-json`), Postgres through TypeORM. The database is Neon (Vercel Postgres).
- `apps/web`: Angular 21, zoneless, standalone components, NgRx SignalStore for app-wide state,
  Panda CSS for styling, `@angular/service-worker` for the PWA. Dev server on :4200 proxies `/api`
  to :3000.
- `packages/shared`: `@bszz-dojo/shared`, the types, DTOs, constants and pure domain rules used by
  both apps (bow types and their handicap, score validation, dates in the club's time zone).
  Built with tsup to CJS + ESM.

## Commands

Run from the repo root:

- `npm run dev`: shared package plus both apps in watch mode (the API runs pending migrations first)
- `npm run build` / `npm run typecheck` / `npm run lint` / `npm run lint:fix`
- A single workspace: `npx turbo run <task> --filter=api` (or `web`, `@bszz-dojo/shared`)

Use **npm only** (no pnpm or yarn). Don't hand-edit `package-lock.json`. If CI fails because a
platform-specific package (e.g. `@esbuild/linux-x64`, `@rollup/rollup-linux-*`) is missing, the
lockfile lost other platforms' entries (an npm bug when installing over an existing
`node_modules`): regenerate it with `rm -rf node_modules package-lock.json && npm install`.

The API reads its configuration from `apps/api/.env` (see `apps/api/.env.example`). Never commit
`.env` files or put secrets anywhere else in the repo.

## TypeScript rules (enforced by Oxlint in CI)

- **Every function and method declares its return type**, including `void` and `Promise<void>`.
  Callbacks passed to an already-typed parameter (e.g. `subscribe((user) => ...)`) are exempt.
- **Never use `any`.** Use `unknown` and narrow it, a generic, or a proper type. This also applies
  to values that are `any` without being written (`JSON.parse`, caught errors): annotate them as
  `unknown`.
- Don't silence the linter with `oxlint-disable` comments unless the reason is written next to it.

## Comments

- Only comment what the code can't say itself: why something is done, a non-obvious constraint,
  units or a time base, or how the old PHP app behaved when that explains a decision.
- Don't restate names or signatures ("Returns the profile"). If a comment is needed to explain
  _what_ code does, prefer a clearer name.
- JSDoc on `*.body.ts` / `*.query.ts` / `*.response.ts` fields and controller methods stays:
  Swagger shows it.

## API ↔ client contract

- **Every object that crosses the network has a shared type** in `packages/shared/src`, exported
  from `index.ts`: request bodies, query params, route responses and error payloads alike.
  No inline object types in controllers or HTTP calls, and no `Record<string, any>` payloads.
- `packages/shared` contains plain TypeScript only: no decorators and no imports from
  `@nestjs/*`, `@angular/*`, `class-validator` or `class-transformer`.
- Never redefine a shared type inside an app; import it.
- To change a payload, change the shared type first, then update both apps.
- Validation rules that the forms and the API both need live in shared (`scoreErrors`,
  `isValidUsername`, `ACCOUNT_FIELD_ERRORS`, …), so the form shows the same German message the
  API would answer with. User-facing messages from the API are German and shown as they are.

## Domain rules

- **Bow types** (`BOW_TYPES`): Recurve, Compound, Traditionell, Langbogen, Barebow, each with a
  handicap in integer percent (`factorPercent`), applied by `adjustedResult` and rounded down.
- **Leaderboards** (`GET /api/rankings`, built in `rankings/leaderboard.ts`): only rounds at the
  `LEADERBOARD_DISTANCES` (18m, 8m) with exactly `LEADERBOARD_ARROWS` (30) arrows count. Each
  archer's best round by _adjusted_ result, top 10; ties go to whoever shot it first. "Monthly"
  is the current calendar month in `CLUB_TIME_ZONE` (Europe/Zurich), by the day it was shot.
- **Medals**: gold 3, silver 2, bronze 1 point per Auszeichnung (`BADGE_PLACE_POINTS`), top 10.
- **Profiles** (`GET /api/profiles/:username`): stats, the top 3 rounds per distance, the progress
  chart (one line per bow type per distance), Auszeichnungen and the last 15 rounds. Usernames in
  URLs are matched ignoring case.
- A round's day (`shotOn`) is a calendar date (`IsoDate`, `YYYY-MM-DD`), never a timestamp; format
  dates with `formatGermanDate`. "Today" is `todayInClub()`.
- **Abzeichen** (`RANKS`, `users.rank`): at most one per user, picked by the user in the settings
  (`PATCH /api/users/me`), no admin approval.
- **Auszeichnungen** (`badges`, `packages/shared/src/badges.ts`): placings 1–3 users record in the
  settings and delete on their own profile (`/api/users/me/badges`), no admin approval and no
  requests. Every placing has a year, bow type and age category (`AGE_CATEGORIES`: U11 … 50+).
  The kind decides the rest (`BADGE_KIND_FIELDS`):
  - **SM**: tournament type (`TOURNAMENT_TYPES`: FITA, Indoor, 3D, Field, Team), location and a
    team flag, which isn't asked for when the type is "Team".
  - **Nationales Turnier** (`tournament`): like SM plus the event name, without the team flag.
  - **Clubturnier**: event name and distance.

  `normalizeBadgeInput` clears what the kind doesn't use and `badgeFieldErrors` validates in the
  form and the API. Placings from the old app are a "Nationales Turnier" with only the old name
  (as `eventName`), year and place, so the details are nullable. Show them with `badgeTitle` /
  `badgeDetails` (`BadgeRow`).

## Auth

- Access token: JWT, 15 minutes, signed with `JWT_ACCESS_SECRET`, subject = user id. The web app
  keeps it **in memory only** (`AuthStore`) and sends it as `Authorization: Bearer`
  (`auth.interceptor.ts`).
- Refresh token: random `<id>.<secret>` (`common/secret-token.ts`), stored as a sha256 hash in
  `refresh_tokens` (one row per device, 30 days), sent only as the httpOnly cookie
  `bszz_refresh` scoped to `/api/auth`. It's rotated on every `POST /api/auth/refresh`; logout
  deletes that device's row; a password change deletes all of them. Never expose it to
  JavaScript.
- Protect REST routes with `@UseGuards(JwtAuthGuard)` and read the user with `@CurrentUser()`.
  Admin routes add `AdminGuard`, which reads the role from the database, not the token.
- No email addresses: an account is a **username** and a password. The username is for logging in
  and profile URLs: 3–30 characters of letters, digits, `.`, `_` and `-` (`USERNAME_PATTERN`),
  unique ignoring case (`username_key` = `usernameKey()`), so `Zytronik` and `zYtRoNik` are the
  same account. The optional **display name** (`displayName`, up to 40 characters, spaces allowed)
  is shown instead wherever it's set: always render names with `shownName()` (the `shownName`
  pipe in templates) and link with `username`. Every shared type with a user name extends
  `UserName`.
- Passwords are bcrypt hashes; `$2y$` hashes from the old PHP app are accepted (`compatibleHash`).
  There's no self-service reset (no mail); changing the password needs the current one.
- The session is restored at startup (`provideAppInitializer`) before guards run. Routes that need
  a user use `authGuard`, which redirects to `/login?returnUrl=…`; `adminGuard` only hides pages.

## Database

- TypeORM with Postgres (`DATABASE_URL`; migrations prefer `DATABASE_URL_UNPOOLED`); options in
  `src/database/typeorm-options.ts`, shared by the app and the CLI (`src/database/data-source.ts`).
  Entities are listed explicitly (`ENTITIES`), not globbed, so Vercel's bundler finds them.
- **Schema changes only through migrations** in `src/database/migrations/`; `synchronize` stays off.
  After changing an entity, run `npm run migration:generate -w api -- src/database/migrations/<Name>`,
  review the SQL, and commit it with the entity change.
- Migrations never run on app startup (a serverless cold start must not migrate): `npm run dev`
  runs them locally, and the Vercel build runs `migration:deploy` against the environment's
  database before the deployment goes live.
- Give columns, indexes and constraints explicit snake_case names in the entity decorators.
- Everything that belongs to a user references it with `ON DELETE CASCADE`.
- There are two databases: **dev** (local development and Vercel preview deployments) and
  **prod** (the production deployment). Never point local development at prod.
- `npm run legacy:import -w api` copies the old PHP app's MySQL data into an empty database once
  (`src/database/legacy-import.ts`).

## API conventions (`apps/api`)

- Request DTOs are `*.body.ts` (or `*.query.ts`) classes with `class-validator` decorators
  that `implements` the shared DTO.
- Responses are `*.response.ts` classes that `implements` the shared type. Controller methods
  return these classes so Swagger can document them.
- Those file suffixes are required: the `@nestjs/swagger` CLI plugin only reads those files
  (see `nest-cli.json`; add new suffixes there). Document fields with JSDoc comments instead of
  `@ApiProperty()`.
- Vercel bundles `src/main.ts` without the Nest CLI, so the plugin's output is generated into
  `src/metadata.ts` (`npm run swagger:metadata -w api`, run by `dev`, `build` and `typecheck`;
  git-ignored) and loaded in `src/swagger.ts`. Never edit it by hand.
- One module per feature folder (`auth/`, `users/`, `scores/`, `rankings/`, `profiles/`,
  `badges/`, `admin/`, `health/`); cross-cutting helpers in `common/`.
- Errors are Nest HTTP exceptions with a German message the web app can show as is.
- `src/main.ts` is the Vercel entrypoint (NestJS zero-config): it must call `app.listen`.

## Web conventions (`apps/web`)

- Standalone components, `ChangeDetectionStrategy.OnPush`, signals everywhere (`input()`,
  `model()`, `computed`, `linkedSignal`, `resource`, `effect`), `inject()` (no constructor
  injection), and `@if` / `@for` control flow. No `zone.js`.
- **State:** app-wide state lives in NgRx SignalStores (`*.store.ts`, `providedIn: 'root'`):
  `AuthStore`, `SettingsStore`. Components read store signals and call store methods; only stores
  call `patchState`. Page data is loaded with `resource()` in the page; lists sit in
  `<app-loading-frame>`, which shows a skeleton shaped like their rows while loading (`chart` for
  the progress chart) and keeps it invisible afterwards, so the area never shrinks below it and
  the page doesn't jump. Never a plain "Wird geladen…". An empty list shows
  `<app-empty-state>Keine … vorhanden.</app-empty-state>`, a centered panel that fills that area.
- **Layout:** `pages/` holds one component per route; route params and query params arrive as
  `input()`s (`withComponentInputBinding`). Feature code lives in `auth/`, `settings/`,
  `dashboard/`, `profile/`, `scores/`, `admin/`; the frame (header, search, footer, update
  banner) in `layout/`; reusable pieces in `ui/`; API services and helpers in `core/`.
- **Networking:** HTTP goes through a `*-api.service.ts` using `HttpClient` with `apiUrl()`
  (relative `/api/...`), typed with the shared types, returning Promises (`firstValueFrom`).
- **Forms** (`app/forms/`): reactive forms (`NonNullableFormBuilder`) with `novalidate`.
  - Every input or select sits in `<app-form-field label="…">` and carries `appFieldControl`:
    that links the label, styles it and shows the control's error below it (otherwise the
    `hint`) once the field was touched.
  - Validators come from `forms/validators.ts` (`required`, `rule`, `messageFrom`) and answer
    with the German message to show; wrap the shared rules (`isValidUsername`,
    `scoreFieldErrors`, …) instead of writing new ones. Rules that compare fields re-validate
    their siblings on changes.
  - On submit, `checkForm(form)` marks everything touched; if it's invalid, show `INVALID_FORM`
    in the form's `<app-feedback-message>`, which also shows the API's answer (success or error).
  - Buttons are `<button appButton [pending]="…">`: disabled with a spinner while their request
    runs (also the confirm button of `<app-confirm-dialog>`).
- **Icons:** Font Awesome solid icons as inline SVG through `<app-icon>`; re-export new ones from
  `ui/icons.ts`. Interactive icons need an accessible name (`label` or the button's `aria-label`).
- **Assets** in `public/` (logo, rank icons, favicons, iOS splash screens, the Avenir font) are
  the old app's; keep their paths, `index.html` and the manifest reference them.
- **Theme:** dark by default, light as an account setting (`UserSettings.theme`, saved by
  `SettingsStore`). It's applied as `data-theme` on `<html>`. The last theme is cached in
  localStorage only so `index.html` can apply it before the first paint; don't use localStorage
  for anything else tied to the user.
- **PWA:** `ngsw-config.json` caches the app shell and assets; `/api` is never cached.
  `navigationUrls` must exclude every server page (`/api`, `/api/**`, `/api-json`), or the service
  worker answers them with the app, which redirects to `/`.
  `AppUpdateService` shows a banner when a new version is ready. The footer shows `APP_VERSION`.

## Styling (Panda CSS)

- Panda generates `styled-system/` (`panda codegen`, run by the `dev`, `build` and `typecheck`
  scripts; git-ignored) and its PostCSS plugin fills the layers declared in `src/styles.css`.
- Templates can't call `css()`, so styles are created in the component class and bound with
  `[class]`. Panda extracts them statically: style objects must be literal, never built from
  runtime values. For variants picked at runtime, call the recipe once per variant up front
  (see `FeedbackMessage`, `RankBadge`).
- The theme lives in `apps/web/theme/`:
  - `tokens.ts`: raw values only (the old app's colors, its 5px spacing grid, Bootstrap 3
    container widths). Components never use raw color tokens.
  - `semantic-tokens.ts`: what components use (`bg.canvas`, `bg.surface`, `fg.default`,
    `accent.default`, `status.*`, `medal.*`, `rank.*`, spacing like `gutter`, `section`, `stack`).
    The light theme is a `_light` value here, nowhere else.
  - `text-styles.ts` (headings, body), `layer-styles.ts` (surface, canvas, divider, muted,
    backdrop, skeleton) and `global-css.ts`.
  - `recipes/`: `button`, `container`, `emptyState`, `input`, `medal`, `message`, `rankBadge`, `spinner` and the slot
    recipes `checkbox`, `field`, `modal`, `record` (every list row), `searchOverlay`,
    `siteHeader`, `skeleton`, `tabs`. Prefer extending a recipe over one-off `css()` when a style repeats.
- No hard-coded colors, `!important` or escape hatches (`[...]` values): the Panda lint rules
  reject them. The canvas target face is the exception, since canvas can't read CSS tokens.
- Breakpoints are Bootstrap 3's (`sm` 768px, `md` 992px, `lg` 1200px) so the layout matches
  the old app.

## Linting

- Oxlint everywhere (root `.oxlintrc.json`, extended per workspace). The web app also loads
  `@pandacss/eslint-plugin` as an Oxlint JS plugin through `apps/web/oxlint-panda-plugin.mjs`,
  which gives every file its own rule context: the plugin caches imports per context and Oxlint
  reuses one, so without the wrapper the Panda rules silently skip most files.
- Every Panda rule of the installed plugin is on except `no-margin-properties` (the layout
  follows the old app's margins) and the style pairs we don't use: `prefer-longhand-properties`
  (we prefer shorthands), `prefer-atomic-properties` and `prefer-composite-properties`. Use
  logical properties (`paddingBlockStart`, `insetEnd`, …, `no-physical-properties`).
- The web lint runs single-threaded: every Oxlint thread would load its own Panda context.
- CI runs `npx turbo run lint -- --deny-warnings`: warnings fail the build too.
- Prettier formats (`npm run format`): single quotes, 100 columns.

## Git: branches, commits and PRs

Follow [Conventional Commits](https://www.conventionalcommits.org).

- **Format:** `<type>(<scope>): <summary>`, e.g. `feat(api): add score export`
  - **Types:** `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `style`, `build`, `ci`, `chore`
  - **Scopes** (optional): `api`, `web`, `shared`, `ci`, `deps`. Leave the scope out for changes
    across the repo.
  - **Summary:** imperative mood ("add", not "added"), lowercase, no trailing period, under ~72
    characters.
  - **Breaking changes:** add `!` after the type/scope and explain in the body under
    `BREAKING CHANGE:`.
- **Commit body** (optional for trivial changes): **what** changed, **why** it was needed and
  **how** it was done if it isn't obvious from the diff, wrapped at ~72 characters.
- **Branches:** `<type>/<short-kebab-description>`, e.g. `feat/score-export`.
- **PRs:**
  - Always **squash-merged**: every PR becomes exactly one commit. Never use merge commits or
    rebase-merging, and never push to `main` directly.
  - The title uses the commit message format; the description has **What**, **Why** and **How**
    sections plus how it was tested and any follow-up steps.
  - Keep one logical change per PR.

## Releases

- Versioning is automated with release-please (`release-please-config.json`,
  `.github/workflows/release-please.yml`): one version for the whole repo, the root
  `package.json` and `APP_VERSION` in `packages/shared/src/version.ts` (an `extra-files` entry
  with the `x-release-please-version` marker).
  After every merge to `main` it updates a release PR with the version bump and `CHANGELOG.md`;
  merging that creates the `vX.Y.Z` tag and GitHub Release.
- `fix` → patch, `feat` → minor, breaking (`!`) → major. That's why PR titles must follow
  Conventional Commits.
- Never edit versions, `CHANGELOG.md` or `.release-please-manifest.json` by hand.

## Deployment

- Everything runs on Vercel in **one project** with two services (`vercel.json`): `web` (the
  Angular build, static) and `api` (NestJS as a Vercel Function). Requests to `/api/*` go to the
  API, everything else to the web app, so both share one domain and the refresh cookie is
  first-party. Details in `docs/deployment.md`.
- Production deploys only for releases: Vercel doesn't deploy `main` on push
  (`git.deploymentEnabled`); the release workflow calls a Vercel Deploy Hook once release-please
  created a release (`.github/workflows/deploy.yml`). Every other branch and PR gets a preview
  deployment (dev database). Never deploy production any other way.
- The API runs as a serverless function: keep it stateless (no in-memory sessions or caches that
  must survive a request), keep the connection pool small, and prefer pure-JS packages.
- Production secrets live only in the Vercel project's environment variables.

## Before you finish

1. `npm run lint` passes with **zero warnings**.
2. `npm run typecheck` and `npm run build` pass.
3. Work on a branch and open a pull request.
