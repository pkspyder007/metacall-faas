# MetaCall FaaS Documentation

This folder contains the [VitePress](https://vitepress.dev/) documentation for MetaCall FaaS.

## Structure

-   **Overview** — What FaaS is, features, high-level flow
-   **Requirements** — Node, MetaCall CLI, optional Git and deploy CLI
-   **How to Run** — Build, start, env vars, CLI flags, docs commands
-   **Architecture in Detail** — Process model, core types, directory layout, bootstrap, layers, config
-   **API Routes** — All HTTP routes (health, call, static, package, repository, deploy, inspect, billing)
-   **Data Flow** — Deploy and call flows (with sequence diagrams)
-   **IPC and MetaCall Process** — Message types, worker lifecycle, MetaCall APIs
-   **metacall-deploy Usage** — Using the deploy CLI with this server

## Commands

From the **project root**:

-   **`npm run docs`** — Start the VitePress dev server.
-   **`npm run docs:build`** — Build static site into `doc/.vitepress/dist`.
