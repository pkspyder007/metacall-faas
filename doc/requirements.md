# Requirements

## Runtime

- **Node.js** — Version per `package.json` engines (e.g. `>=20.1.0` or `>=18.17.0`).
- **npm** — `>=10.0.0` (per engines).

## MetaCall

- **MetaCall CLI** — The server spawns workers with `metacall <path-to-worker/index.js>`. The `metacall` binary must be installed and on your `PATH`.
- Workers use MetaCall’s Node port to load configurations and run functions (e.g. `metacall_load_from_configuration_export`, `metacall_inspect`, `metacall_execution_path`). Install MetaCall according to [MetaCall documentation](https://github.com/metacall/install).

## Optional (for full workflows)

- **Git** — Required for repository-based deployments (`/api/repository/add`, branch list, file list).
- **metacall-deploy** — The `@metacall/deploy` CLI is not required to run the server, but is the typical way to deploy and manage applications when using this FaaS as a local backend (e.g. with `--dev` or similar flag pointing to your local URL).
