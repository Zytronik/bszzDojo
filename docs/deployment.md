# Deployment

Everything runs on Vercel, in one project:

| Part     | Where                                          | Notes                       |
| -------- | ---------------------------------------------- | --------------------------- |
| Web      | Vercel service `web` (static Angular build)    | everything except `/api*`   |
| API      | Vercel service `api` (NestJS, Vercel Function) | `/api*`                     |
| Database | Neon Postgres via the Vercel Marketplace       | `prod` and `dev`, see below |

```
browser ──▶ Vercel ──/api*──▶ api service (NestJS function) ──▶ Neon (prod or dev)
                └────/*─────▶ web service (index.html, assets, service worker)
```

- The services are defined in the root `vercel.json` ([Vercel Services](https://vercel.com/docs/services),
  currently in beta). Both share one domain, so the refresh-token cookie is first-party and the
  API needs no CORS in production.
- The API is a single Vercel Function on Fluid compute; `apps/api/src/main.ts` is its entrypoint
  (NestJS zero-config).
- The `api` build runs `migration:deploy` against the environment's database, so a deployment only
  goes live after its migrations ran. The app itself never migrates on a cold start.

## Environments and databases

| Environment | Runs                                     | Database |
| ----------- | ---------------------------------------- | -------- |
| Production  | Vercel, deployed from `main`             | `prod`   |
| Preview     | Vercel, every other branch and PR        | `dev`    |
| Development | locally (`npm run dev`, `apps/api/.env`) | `dev`    |

Never point local development or previews at the prod database.
