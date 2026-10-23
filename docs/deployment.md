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
| Production  | Vercel, deployed for every release       | `prod`   |
| Preview     | Vercel, every other branch and PR        | `dev`    |
| Development | locally (`npm run dev`, `apps/api/.env`) | `dev`    |

Never point local development or previews at the prod database.

## Releases deploy production

1. Merging a feature PR into `main` doesn't deploy anything: `vercel.json` turns off Vercel's
   automatic deploys for `main` (`git.deploymentEnabled`). release-please updates its release PR.
2. Merging the release PR (`chore: release x.y.z`) creates the `vX.Y.Z` tag and GitHub Release.
3. The same **Release** workflow then runs **Deploy** (`.github/workflows/deploy.yml`), which calls
   the project's Vercel Deploy Hook. Vercel builds the latest `main`, i.e. the release commit, as
   a production deployment.

To redeploy, run **Deploy** by hand (Actions → Deploy → Run workflow); it builds the latest
`main`. To go back to an older release, use **Instant Rollback** in the Vercel dashboard.

The hook URL is the secret `VERCEL_DEPLOY_HOOK_URL` in the GitHub environment `production`.
