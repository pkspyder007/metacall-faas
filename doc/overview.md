# Overview

MetaCall FaaS is a **local Function-as-a-Service (FaaS) platform** reimplemented in TypeScript. It lets you deploy and run polyglot applications (Node.js, Python, Ruby, C#) on your machine using the [MetaCall](https://metacall.io) runtime, with a REST API compatible with MetaCall Hub and the `@metacall/deploy` CLI.

## What it does

- **Deploy** — Upload a zip package or clone a repository; the server unpacks it under `~/.metacall/faas/apps/<suffix>`, installs dependencies (e.g. `npm i`, `pip install`), and starts a **worker process** that loads your functions via MetaCall.
- **Call** — HTTP requests to `/:prefix/:suffix/:version/call/:func` are forwarded to the worker; the function runs inside MetaCall and the result is returned.
- **Manage** — Inspect deployments, delete them (stops the worker and removes files), serve static assets, and expose stub billing endpoints for CLI compatibility.

## Features

- **Polyglot** — One deployment can mix Node.js, Python, and other runtimes; MetaCall Core loads `metacall.json` (or equivalent) and exposes exported functions.
- **Local-first** — No cloud account; run the server and use the deploy CLI with a dev/local target.
- **Protocol-compatible** — Same API shape as MetaCall Hub so tools like `metacall-deploy` work against this server.
- **Persistence** — Deployments live on disk; on server restart, existing apps under the apps directory are auto-deployed (workers started again).

## High-level flow

1. **Deploy**: Package upload or repo clone → unpack under `apps/<suffix>` → register in registry → install deps → spawn worker via `metacall worker/index.js` → worker loads deployment → sends back metadata → server stores process and deployment.
2. **Call**: Request to call route → lookup app by suffix → push invocation to queue → send `Invoke` to worker → worker runs function in MetaCall → sends `InvokeResult` → server resolves promise and responds to HTTP client.
3. **Delete**: Stops the worker process, removes from registry, deletes the app directory from disk.
