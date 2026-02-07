# How to Run

## Build and start the server

```bash
npm run build
npm start
```

Or in one step:

```bash
npm start
```

This compiles TypeScript, then runs `node dist/index.js`. The server listens on the port from config (default **9000**).

## Environment variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | HTTP server port | `9000` |

Config is loaded from `src/config`; the apps directory is derived from the platform config directory (e.g. `~/.metacall/faas/apps` on Unix). A `.env` file in the project root is loaded via `dotenv` at startup.

## CLI flags

- **`--version`** — Print version and exit (no server start).
- **`--prune`** — Before starting, clear the apps directory (removes all deployed applications). Use with care.

Examples:

```bash
node dist/index.js --version
node dist/index.js --prune
```

## Running the documentation

From the project root:

- **`npm run docs`** — Start VitePress dev server for the `doc/` site.
- **`npm run docs:build`** — Build the static documentation into `doc/.vitepress/dist`.

## Global binary

If the package is installed globally (e.g. `npm install -g`), you can run:

```bash
metacall-faas
```

The `bin` entry in `package.json` points to `dist/index.js`.
