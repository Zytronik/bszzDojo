# Deployment

Everything runs on Vercel, in one project:

| Part     | Where                                          | Notes                                 |
| -------- | ---------------------------------------------- | ------------------------------------- |
| Web      | Vercel service `web` (static Angular build)    | everything except `/api/*`            |
| API      | Vercel service `api` (NestJS, Vercel Function) | `/api/*`                              |
| Database | Neon Postgres via the Vercel Marketplace       | `dev` and `prod`, one per environment |

```
browser ──▶ Vercel ──/api/*──▶ api service (NestJS function) ──▶ Neon (prod or dev)
                └────/*──────▶ web service (index.html, assets, service worker)
```

- The services are defined in the root `vercel.json` ([Vercel Services](https://vercel.com/docs/services),
  currently in beta). Both share one domain, so the refresh-token cookie is first-party and the
  API needs no CORS in production.
- The API is a single Vercel Function on Fluid compute. `apps/api/src/main.ts` is its entrypoint
  (NestJS zero-config); Vercel bundles it, so the Nest CLI's Swagger plugin doesn't run there and
  Swagger UI is only served locally.
- The `api` build runs `migration:deploy` against the environment's database, so a deployment only
  goes live after its migrations ran. The app itself never migrates on a cold start.

## Environments and databases

| Vercel environment | Deploys from                             | Database |
| ------------------ | ---------------------------------------- | -------- |
| Production         | `main` (the production branch)           | `prod`   |
| Preview            | every other branch and PR                | `dev`    |
| Development        | `vercel env pull` / `vercel dev` locally | `dev`    |

While `next` is the integration branch for the rewrite, its pushes are previews on the dev
database. Once `next` is merged into `main`, `main` deploys production.

## One-time setup

### 1. Project

1. Vercel → **Add New → Project** → import `Zytronik/bszzDojo`.
2. Keep the **Root Directory** at the repository root. Vercel reads `vercel.json` and builds both
   services; leave the framework and build settings alone.
3. Settings → Git: **Production Branch** `main`.

### 2. Databases

Vercel → **Storage → Create Database → Neon (Postgres)**, twice:

1. `bszz-dojo-prod`: connect it to the project for **Production** only.
2. `bszz-dojo-dev`: connect it for **Preview** and **Development**.

Each connection adds `DATABASE_URL` (pooled) and `DATABASE_URL_UNPOOLED` (direct, used for
migrations) to those environments. Make sure no environment ends up with both databases.

### 3. Environment variables

Project → Settings → Environment Variables:

| Name                | Environments                   | Value                                                   |
| ------------------- | ------------------------------ | ------------------------------------------------------- |
| `JWT_ACCESS_SECRET` | Production                     | `openssl rand -base64 48`                               |
| `JWT_ACCESS_SECRET` | Preview, Development           | a different `openssl rand -base64 48`                   |
| `APP_URL`           | Production                     | the production URL, e.g. `https://bszz-dojo.vercel.app` |
| `SMTP_URL`          | Production (optional: Preview) | e.g. `smtps://user:app-password@smtp.gmail.com:465`     |
| `MAIL_FROM`         | where `SMTP_URL` is set        | `BSZZ Dojo <omar.oberholzer@gmail.com>`                 |

- Without `APP_URL`, reset links use the deployment's own URL (`VERCEL_BRANCH_URL` /
  `VERCEL_URL`), which is right for previews.
- Without `SMTP_URL`, reset mails are only written to the function log.
- `COOKIE_SECURE` and `CORS_ORIGIN` are only for local development; leave them unset on Vercel.

### 4. First deploy and data import

1. Push or redeploy: the build runs the migrations, then the deployment goes live.
   `https://<domain>/api/health` answers `{"status":"ok",…}`.
2. To bring over the old PHP app's data, run the importer once against the **prod** database
   (it refuses to run if there are users already):

   ```bash
   # apps/api/.env: DATABASE_URL_UNPOOLED=<prod unpooled URL>, LEGACY_MYSQL_URL=mysql://…
   npm run legacy:import -w api
   ```

   Passwords keep working (the bcrypt hashes are copied); everyone stays logged out until they
   log in once. Afterwards put the dev URL back into `apps/api/.env`.

3. Make yourself admin if the import didn't (new databases have no admin):

   ```sql
   UPDATE users SET role = 'admin' WHERE username_key = 'omar';
   ```

## Local development

```bash
cp apps/api/.env.example apps/api/.env   # then fill in, or:
npx vercel env pull apps/api/.env --environment=development   # dev DATABASE_URL and JWT secret
npm install
npm run dev
```

`vercel env pull` overwrites the file, so add the local-only values (`COOKIE_SECURE=false`,
`CORS_ORIGIN`, `APP_URL=http://localhost:4200`) afterwards. A local Postgres works as well:
`DATABASE_URL=postgresql://user@localhost:5432/bszz_dojo`.

## Rollback

Vercel → Deployments → pick the last good production deployment → **Instant Rollback**. Migrations
are not rolled back; write a new migration if a schema change has to be undone.
