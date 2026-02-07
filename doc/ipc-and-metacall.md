# IPC and MetaCall Process Usage

## IPC channel

The main process and workers communicate over **Node.js IPC**: `child_process` with `stdio: [..., 'ipc']` and `process.send()` / `process.on('message')`. Messages are JSON-serializable objects with a `type` and `data` field.

## Message types

Defined in `src/worker/protocol.ts`:

| Type             | Direction     | Description                                                                                             |
| ---------------- | ------------- | ------------------------------------------------------------------------------------------------------- |
| **Install**      | (reserved)    | Install dependencies — currently install is done in the main process before spawn.                      |
| **Load**         | Main → Worker | Tells the worker to load a deployment. `data` is a `Resource` (id, path, jsons, runners).               |
| **MetaData**     | Worker → Main | Sent after load completes. `data` is a `Deployment` (status, prefix, suffix, version, packages, ports). |
| **Invoke**       | Main → Worker | Request to call a function. `data`: `{ id, name, args }`.                                               |
| **InvokeResult** | Worker → Main | Result of a function call. `data`: `{ id, result }`.                                                    |

## Worker process lifecycle

1. **Spawn** — Main process runs `spawn('metacall', [pathToWorkerIndexJs], { stdio: [..., 'pipe', 'pipe', 'pipe', 'ipc'], env })`. The worker is the Node entry point run **inside** the MetaCall runtime, so MetaCall’s C/Node port is available.
2. **Load** — Main sends **Load** with `Resource`. Worker:
    - Optionally writes extra `metacall-<language>.json` files if `resource.jsons` is non-empty.
    - Uses `@metacall/protocol` to find files and `metacall.json` (or equivalent) paths.
    - For each config: `metacall_execution_path(language_id, path)`, then `metacall_load_from_configuration_export(jsonPath)` to load the script and get exported functions.
    - Builds a `Deployment` and sends **MetaData**.
3. **Invoke** — Main sends **Invoke** with `id`, function `name`, and `args`. Worker looks up the function in an in-memory map (filled during load) and calls it with `args`, then sends **InvokeResult** with the same `id` and the return value.
4. **Exit** — If the worker process exits (e.g. crash), the main process’s `proc.on('exit')` fires and the deploy promise is rejected; the application may be left in a bad state until redeploy or restart.

## MetaCall APIs used in the worker

From the `metacall` package (Node port of MetaCall):

-   **`metacall_execution_path(tag, path)`** — Sets the execution path for a language/runtime.
-   **`metacall_load_from_configuration_export(path)`** — Loads a configuration file (e.g. `metacall.json`) and returns the exported callables (functions).
-   **`metacall_inspect()`** — Returns inspection metadata for loaded runtimes (used to fill `deployment.packages`).

The worker stores the exported functions in a local map and invokes them by name when it receives **Invoke**.

## Main process: handling worker messages

In `deployProcess` (`src/utils/deploy.ts`):

-   **MetaData** — Get `Application` from registry by `resource.id`, set `application.proc = proc`, `application.deployment = payload.data`, then resolve the deploy promise so the deploy API can return.
-   **InvokeResult** — `invokeQueue.get(invokeResult.id)` returns the pending invocation (with resolve/reject); call `invoke.resolve(JSON.stringify(invokeResult.result))` so the HTTP handler can send the response. (Errors from the function are not yet sent as a separate message type; the worker only sends a result.)

## One worker per deployment

Each deployment (suffix) has exactly one child process. The registry maps suffix → `Application` → `proc`. All invocations for that suffix go to the same process. When the deployment is deleted, the main process kills that child and removes the entry from the registry.
