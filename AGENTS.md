# AGENTS.md

Rules for AI agents in this repo. Details not listed here: read the code.

## Project

BSZZ Dojo: the archery club's results app, an installable PWA. German UI, Swiss spelling ("ss",
never "ß"). Archers record rounds ("Scores"), compare on leaderboards, and view profiles with
their club badge ("Abzeichen") and tournament placings ("Auszeichnungen"), both self-recorded.
Admins manage users. Turborepo, npm workspaces, Node 22.

- `apps/api`: NestJS 11, REST under `/api` (Swagger UI `/api`, JSON `/api-json`), TypeORM +
  Postgres (Neon).
- `apps/web`: Angular 21 zoneless, NgRx SignalStore, Panda CSS, `@angular/service-worker`. Dev
  server :4200 proxies `/api` to :3000.
- `packages/shared` (`@bszz-dojo/shared`): types, DTOs, constants and pure domain rules for both
  apps; tsup to CJS + ESM. Plain TypeScript only: no decorators, no `@nestjs/*`, `@angular/*`,
  `class-validator`, `class-transformer` imports.

## Commands

From the root: `npm run dev` (runs pending migrations first), `build`, `typecheck`, `lint`,
`lint:fix`, `format`; one workspace: `npx turbo run <task> --filter=api|web|@bszz-dojo/shared`.
npm only; never hand-edit `package-lock.json`. If CI lacks a platform package
(`@esbuild/linux-x64`, `@rollup/rollup-linux-*`), regenerate the lockfile:
`rm -rf node_modules package-lock.json && npm install`. API config is `apps/api/.env`
(`.env.example`); never commit `.env` files or secrets.

## Code rules (Oxlint in CI, `--deny-warnings`)

- Every function and method declares its return type (callbacks to typed parameters exempt).
- No `any`, also implicit (`JSON.parse`, caught errors): use `unknown` and narrow.
- No `oxlint-disable` without a written reason.
- Comments only for what code can't say (why, constraints, units, old PHP app behaviour); no
  restating names. JSDoc on `*.body.ts` / `*.query.ts` / `*.response.ts` fields and controller
  methods stays (Swagger).
- Prettier: single quotes, 100 columns.

## API ↔ client contract

- Every object crossing the network (bodies, query params, responses, errors) has a shared type
  exported from `packages/shared/src/index.ts`. No inline types in controllers or HTTP calls;
  never redefine a shared type in an app. Change the shared type first, then both apps.
- Rules the forms and the API share live in shared (`scoreErrors`, `isValidUsername`,
  `ACCOUNT_FIELD_ERRORS`, …), so both give the same German message.

## Domain

- **Bow types** (`BOW_TYPES`): handicap in integer percent (`factorPercent`), `adjustedResult`
  rounds down.
- **Leaderboards** (`rankings/leaderboard.ts`): only `LEADERBOARD_DISTANCES` (18, 8, 30m; first is
  default) with `LEADERBOARD_ARROWS` (30); each archer's best adjusted round, top 10, ties to who
  shot it first. "Monthly" = calendar month in `CLUB_TIME_ZONE` (Europe/Zurich) by day shot.
- **Medals**: gold 3, silver 2, bronze 1 per Auszeichnung (`BADGE_PLACE_POINTS`), top 10.
- **Profiles** (`GET /api/profiles/:username`, usernames matched ignoring case): stats, top 3 per
  distance, progress chart, Auszeichnungen, last `PROFILE_HISTORY_SIZE` (15) rounds; "Mehr laden"
  pages via `/history?offset=…`. Going back from a round restores the scroll position and loaded
  pages (`restoreScrollWhen`, `ProfileHistoryMemory`).
- **Scores**: entered as totals or arrow by arrow on the target (tab, default). On the target the
  arrow count divides by `arrowsPerEnd` (6 at 30m, else 3); `shots` (`Shot`, face units, centre 0,
  edge 1) determine tens, nines and result (`shotPoints`: spot only rings 6–10; compound: only X
  counts 10). The API checks they match. Placed arrows lock `SETUP_FIELDS`. The form starts from
  the last round's setup (localStorage, `scores/score-setup.ts`).
- **Score page** (`/scores/:id`): compares with the archer's rounds of same bow, distance and
  arrows (`ScoreComparison`); for target rounds shows arrows, group in cm (`shotGroup`,
  `OUTLIER_SHARE`), end totals, ring distribution (`target-stats.ts`) and scorecard. Share button
  in the header (share sheet, else copy link), not for rounds waiting for upload.
- Dates: `shotOn` is an `IsoDate` (`YYYY-MM-DD`), never a timestamp; format with
  `formatGermanDate`; today is `todayInClub()`.
- **Abzeichen** (`RANKS`, `users.rank`): one per user, set in settings, no approval.
- **Auszeichnungen** (`badges.ts`): placings 1–3, self-recorded and deleted, no approval. Year,
  bow type, age category (`AGE_CATEGORIES`); other fields depend on the kind
  (`BADGE_KIND_FIELDS`, `normalizeBadgeInput`, `badgeFieldErrors`). Imported old ones only have
  name, year and place, so details are nullable; render with `badgeTitle` / `badgeDetails`.
- **Duels** (match play, `packages/shared/src/duels.ts`, `apps/api/src/duels/`): the challenger
  picks format (`sets`: 3 arrows a set, 2/1/0 set points, first to 6, shoot-off at 5:5; `total`: 5
  ends, shoot-off when level) and the distance for both; bow and face (`DuelFace`) each archer picks
  for themselves, the opponent when accepting. Every end is compared as points × `factorPercent`
  (`weighted`) when the bows differ. Both upload their ends (`duel_ends`, a row per side and end);
  the other side's next end stays hidden until both shot it, and `duelProgress` decides sets,
  shoot-off and winner on both sides. The shoot-off arrow is placed on the target, closest to the
  center wins. The app polls (duel page 2.5s, `DuelsStore` 20s for invitations); invitations lapse
  after 24h, idle duels after 2h, checked on read. Giving up is a loss. Duels are separate from
  scores and leaderboards.
- **Friends** (`friends` table, `/api/users/me/friends`, `/friends`): one-sided like following:
  anyone can add anyone with the icon button on their profile, without a confirmation and without
  appearing in the other's list; the own profile's button opens the list. `FriendsStore` holds
  the logged-in user's list.

## Auth

- Access JWT (15 min, `JWT_ACCESS_SECRET`, sub = user id) in memory only (`AuthStore`), sent as
  Bearer. Refresh token `<id>.<secret>`, sha256-hashed in `refresh_tokens` (per device, 30 days),
  only as httpOnly cookie `bszz_refresh` on `/api/auth`, rotated on each refresh; logout deletes
  the device's row, a password change all. Never expose it to JS.
- Routes: `@UseGuards(JwtAuthGuard)` + `@CurrentUser()`; admin routes add `AdminGuard` (role from
  DB). Web: `authGuard` (→ `/login?returnUrl=…`), `adminGuard` only hides pages; the session is
  restored in `provideAppInitializer` before guards.
- No emails. Username (3–30 of letters, digits, `.`, `_`, `-`; unique ignoring case via
  `usernameKey()`) for login and URLs; optional `displayName` (≤ 40). Render names with
  `shownName()` / the `shownName` pipe, link with `username`; shared types with names extend
  `UserName`.
- bcrypt, old `$2y$` hashes accepted (`compatibleHash`). No self-service reset; admins reset to
  `RESET_PASSWORD`, which logs the user out everywhere.

## Database

- Schema changes only via migrations (`synchronize` off): change the entity, run
  `npm run migration:generate -w api -- src/database/migrations/<Name>`, review, commit together.
  Migrations never run on app start: `npm run dev` locally, `migration:deploy` in the Vercel build.
- Entities listed explicitly in `ENTITIES`. Explicit snake_case names for columns, indexes and
  constraints. User-owned rows reference the user `ON DELETE CASCADE`.
- Two databases: dev (local + previews) and prod. Never point local development at prod.

## API (`apps/api`)

- One module per feature folder; helpers in `common/`. Errors are Nest HTTP exceptions with a
  German message.
- Request DTOs `*.body.ts` / `*.query.ts` (class-validator, `implements` the shared type);
  responses `*.response.ts` classes returned by controllers. These suffixes are required by the
  Swagger plugin (`nest-cli.json`); document fields with JSDoc, not `@ApiProperty()`.
  `src/metadata.ts` is generated (`swagger:metadata`), never edit it.
- `src/main.ts` is the Vercel entrypoint and must call `app.listen`. Serverless: stateless, small
  pool, pure-JS packages.

## Web (`apps/web`)

- Standalone, `OnPush`, signals (`input`, `model`, `computed`, `linkedSignal`, `resource`,
  `effect`), `inject()`, `@if` / `@for`, no zone.js.
- Folders: `pages/` (one per route; params as `input()`s), features (`auth/`, `settings/`,
  `dashboard/`, `profile/`, `scores/`, `duels/`, `friends/`, `admin/`), `layout/` (header, search, footer, toasts),
  `ui/`, `core/` (API services, helpers).
- App-wide state in SignalStores (`*.store.ts`, root); only stores call `patchState`. Page data via
  `resource()`; lists in `<app-loading-frame>` (skeleton shaped like the rows, never "Wird
  geladen…"); empty lists `<app-empty-state>Keine … vorhanden.</app-empty-state>`.
- HTTP via `*-api.service.ts`, `HttpClient` + `apiUrl()`, shared types, Promises.
- Forms (`forms/`): reactive, `novalidate`; each control in `<app-form-field label>` with
  `appFieldControl`; validators from `forms/validators.ts` wrapping shared rules; whole-form rules
  `formRule(…)` + `revalidateOnChange(form)`; on submit `checkForm(form)`, else toast
  `INVALID_FORM`. Long forms in `<app-dialog>`.
- Messages are toasts (`ToastStore`), never banners; API errors via `errorMessage()`, resource
  errors via `toastErrors()`. Buttons `<button appButton [pending]>`.
- Icons: Font Awesome solid via `<app-icon>`, re-exported from `ui/icons.ts` (custom ones there
  too); interactive icons need an accessible name.
- Detail pages put a back link and their buttons in the header:
  `<ng-template appPageHeader [back] label backLabel>` (`layout/page-header.ts`), buttons styled
  `siteHeader().link`.
- Theme: dark default, light per account (`UserSettings.theme`) as `data-theme` on `<html>`.
  localStorage only for per-device conveniences (theme cache for first paint, install hint, score
  and duel setup, recent searches), the last user for offline starts, and offline queues; never tokens.
- `public/` assets are the old app's; keep their paths.
- **PWA / offline**: the service worker caches the shell and read-only API routes everyone may see
  (rankings, profiles, scores; network first, cache after 5s). `navigationUrls` must exclude
  `/api`, `/api/**`, `/api-json`. Without a connection `AuthStore` goes `offline` with the last
  user; the header shows a status pill (offline / syncing) instead of toasts. Rounds saved or
  deleted offline wait in `PendingScoresStore` and sync on reconnect, app focus and every 30s;
  pages merge them in (`scores/pending-merge.ts`, dimmed via `data-pending`). Each carries a client
  UUID so a repeated upload isn't duplicated. `AppUpdateService` toasts new versions;
  `InstallService` shows the install dialog once on phones.

## Styling (Panda CSS)

- `styled-system/` is generated (git-ignored). Templates can't call `css()`: create styles in the
  class and bind `[class]`. Style objects must be static literals; for runtime variants call the
  recipe per variant up front.
- Theme in `apps/web/theme/`: `tokens.ts` (raw, never used directly in components),
  `semantic-tokens.ts` (what components use; light theme only as `_light` values here),
  text/layer styles, `global-css.ts`, `recipes/`. Extend a recipe rather than repeating `css()`.
- No hard-coded colors, `!important` or `[...]` escape hatches (canvas target face excepted;
  charts read colors via `chartColors()`). Logical properties only. Breakpoints are Bootstrap 3's
  (`sm` 768, `md` 992, `lg` 1200).
- Lint: Oxlint loads the Panda plugin via `oxlint-panda-plugin.mjs` (one rule context per file),
  single-threaded. All Panda rules on except `no-margin-properties`, `prefer-longhand-properties`,
  `prefer-atomic-properties`, `prefer-composite-properties`.

## Storybook

Storybook 10 (`apps/web/.storybook/`), built in CI. Every reusable component in `ui/`, `forms/`,
`profile/`, `dashboard/`, `scores/`, `duels/`, `friends/` has a `*.stories.ts` with one story per meaningful state;
pages and layout have none. Stories follow the app rules (no inline styles). `routerLink` needs
the `withRouter` decorator, charts `withHttp` (`.storybook/decorators.ts`). New
semantic tokens go in `src/stories/colors.mdx`. Keep its peers `@angular/animations` and
`@angular/platform-browser-dynamic` on the Angular major.

## Git

- Conventional Commits: `<type>(<scope>): <summary>`; types `feat fix refactor perf test docs
  style build ci chore`; scopes `api web shared ci deps` (none for cross-repo); imperative,
  lowercase, no period, < 72 chars; breaking: `!` + `BREAKING CHANGE:` in the body. Body: what,
  why, how.
- Branches `<type>/<kebab-description>`. Never push to `main`; PRs are squash-merged, one logical
  change each, title in commit format, description with What / Why / How, testing, follow-ups.

## Releases & deployment

- release-please: one repo version (root `package.json`, `APP_VERSION`); `fix` → patch, `feat` →
  minor, `!` → major. Never edit versions, `CHANGELOG.md` or the manifest by hand.
- One Vercel project, services `web` (static) and `api` (function); `/api/*` → API on the same
  domain. Production deploys only via the release workflow's deploy hook; branches and PRs get
  previews (dev DB). Secrets only in Vercel env vars. Details: `docs/deployment.md`.

## Before you finish

`npm run lint` (zero warnings), `npm run typecheck` and `npm run build` pass; work on a branch
and open a PR.
