# CI/CD & Deploy

Monorepo with two independently pipelined apps: `apps/api` (NestJS) and `apps/web` (React + Vite).

## Pipelines

`.github/workflows/backend.yml` and `.github/workflows/frontend.yml` run on every push/PR to `main`
that touches their respective app (path-filtered, so changing one app doesn't trigger the other's
pipeline). Each pipeline has 4 stages, each gated on the previous one passing:

1. **Lint** — `npm run lint`
2. **Test** — unit tests (`npm test`) and, for the API, e2e tests (`npm run test:e2e`)
3. **Build** — production build, uploaded as a workflow artifact
4. **Deploy** — only on push to `main`, and only if the relevant secrets are configured (otherwise
   the job logs a warning and skips, it never hard-fails a PR or an unconfigured fork)

## Backend deploy (Render)

`render.yaml` at the repo root is a [Render Blueprint](https://render.com/docs/blueprint-spec)
that defines the API as a free-tier Node web service rooted at `apps/api`.

Setup:

1. In the Render dashboard: **New > Blueprint**, point it at this repo. Render reads `render.yaml`
   and creates the service. This alone gives you auto-deploy on push via Render's own GitHub
   integration — the steps below are only needed if you also want the explicit "Deploy" stage in
   the GitHub Actions pipeline to trigger it.
2. On the created service, set the `CORS_ORIGIN` env var to your deployed frontend's URL (e.g.
   `https://gerenciador-alunos.vercel.app`). The API uses `app.enableCors()` and reads this var
   from `apps/api/src/main.ts`; comma-separate multiple origins if needed.
3. Service > Settings > Deploy Hook, copy the URL.
4. Repo Settings > Secrets and variables > Actions, add `RENDER_DEPLOY_HOOK_URL` with that value.

## Frontend deploy (Vercel)

`apps/web/vercel.json` configures the Vite build for that project.

Setup:

1. `npx vercel link` locally from `apps/web` (or import the repo in the Vercel dashboard with
   **Root Directory** set to `apps/web`).
2. This creates `.vercel/project.json` locally with `orgId` and `projectId` — copy those values.
3. Create a token at vercel.com/account/tokens.
4. Repo Settings > Secrets and variables > Actions, add:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

As with Render, connecting the repo via the Vercel dashboard already gives auto-deploy on push;
the secrets above are only needed for the explicit Actions deploy step.

## Notes

- Both apps run entirely in-memory (no database), so CI needs no service containers.
- Node 22 is used in both pipelines, matching `engines`-free local dev; bump `NODE_VERSION` in the
  workflow files if that changes.
- Branch protection on `main` requiring the lint/test/build jobs to pass is recommended but not
  configured here (it's a repo setting, not something expressible in the workflow YAML).
