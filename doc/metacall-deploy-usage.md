# metacall-deploy Usage

The MetaCall FaaS server is designed to work with the **[@metacall/deploy](https://www.npmjs.com/package/@metacall/deploy)** CLI (often referred to as `metacall-deploy`). The CLI expects a backend that implements the same API surface as MetaCall Hub; this server provides that surface locally.

## Typical workflow

1. **Start the FaaS server** (e.g. on port 9000):

    ```bash
    npm start
    ```

2. **Point the deploy CLI at your local server** — Use the option that sets the API base URL to your local instance (e.g. `--dev` or an environment variable like `METACALL_API_URL=http://localhost:9000`). Consult the deploy CLI docs for the exact flag or env name.

3. **Deploy an application** — From your project directory (with a valid `metacall.json` or equivalent), run the deploy command. The CLI will:

    - Call `/validate` or `/api/account/deploy-enabled` to check the backend.
    - Upload a package via `/api/package/create` or use repository endpoints.
    - Call `/api/deploy/create` with the deployment id (suffix) and optional env.

4. **Call functions** — The CLI or your own HTTP client can then call:

    ```http
    GET/POST http://localhost:9000/<prefix>/<suffix>/v1/call/<function_name>
    ```

    with optional JSON body as the function arguments. `<prefix>` is usually your hostname (configurable).

5. **Inspect / delete** — Use the CLI’s inspect and delete commands; they hit `/api/inspect` and `/api/deploy/delete`.

## API compatibility

The server implements:

-   Health and validation: `/readiness`, `/validate`, `/api/account/deploy-enabled`
-   Package: `/api/package/create`
-   Repository: `/api/repository/branchlist`, `/api/repository/filelist`, `/api/repository/add`
-   Deploy: `/api/deploy/create`, `/api/deploy/logs`, `/api/deploy/delete`
-   Inspect: `/api/inspect`
-   Call: `/:prefix/:suffix/:version/call/:func`
-   Static: `/:prefix/:suffix/:version/static/.metacall/faas/apps/:file`
-   Billing stubs: `/api/billing/list-subscriptions`, `/api/billing/list-subscriptions-deploys`

So the deploy CLI can target this server instead of the cloud Hub for local development and testing.

## Local development

-   Deployments are stored under `~/.metacall/faas/apps/<suffix>` (or your configured apps directory). Restarting the server will **auto-deploy** existing directories, so previously deployed apps come back without re-running the CLI deploy.
-   Use **`--prune`** when starting the server to clear the apps directory if you want a clean state.

For exact CLI flags and environment variables, see the [@metacall/deploy](https://www.npmjs.com/package/@metacall/deploy) package documentation.
