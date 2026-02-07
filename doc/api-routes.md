# API Routes

All routes are registered in `src/api.ts`. The **prefix** (default: hostname) is used in call and static URLs.

## Health and validation

| Method | Path | Description |
|--------|------|-------------|
| GET | `/readiness` | Readiness probe; returns 200. |
| GET | `/validate` | Validation endpoint (e.g. for deploy CLI). |
| GET | `/api/account/deploy-enabled` | Same as validate; used to check if deploy is enabled. |

## Call and static

| Method | Path | Description |
|--------|------|-------------|
| GET, POST | `/:prefix/:suffix/:version/call/:func` | Invoke function `func` for deployment `suffix`/`version`. Request body (e.g. JSON array) is passed as function arguments. |
| GET | `/:prefix/:suffix/:version/static/.metacall/faas/apps/:file` | Serve a static file from the deployment directory. |

## Package and repository

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/package/create` | Upload a zip package; creates app directory under apps, registers in registry, returns `{ id }`. |
| POST | `/api/repository/branchlist` | List branches (repository integration). |
| POST | `/api/repository/filelist` | List files (repository integration). |
| POST | `/api/repository/add` | Clone repository and register deployment. |

## Deploy and inspect

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/deploy/create` | Create deployment: body has `suffix`, optional `env`; runs install, spawns worker, loads app; returns `{ prefix, suffix, version }`. |
| POST | `/api/deploy/logs` | Get deployment logs. |
| POST | `/api/deploy/delete` | Delete deployment: stops worker, removes from registry, deletes app directory. Body typically includes deployment identifier. |
| GET | `/api/inspect` | Inspect deployments; returns metadata for registered applications. |

## Billing (stubs)

| Method | Path | Description |
|--------|------|-------------|
| GET, POST | `/api/billing/list-subscriptions` | Returns mock data (e.g. `['Essential', 'Essential']`). |
| GET, POST | `/api/billing/list-subscriptions-deploys` | Returns mock data (e.g. `[]`). |

These exist for compatibility with the deploy CLI.

## Fallback and errors

- **`app.all('*')`** — Any unmatched route calls `next(AppError)` with message `Can't find <url> on this server!` and status **404**.
- **Global error handler** — Catches errors passed to `next()`; uses `statusCode` and message from `AppError` (or similar) for the response. Typical client errors: 404 (missing deployment, missing function name, unknown route), 500 (invoke or internal failure).
