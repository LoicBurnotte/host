# Host App — Module Federation

React + TypeScript + Vite **host** application using **@originjs/vite-plugin-federation**. The host loads remote apps (e.g. **projectA**) and exposes components/config to those remotes.

---

## Overview & Summary

| Concept     | Description                                                                                                                                                      |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Host**    | This app. It owns the shell: layout, main router, and loads **remotes** (other apps) at build/runtime.                                                           |
| **Remote**  | A separate app (e.g. projectA) that is **consumed** by the host. The host loads the remote’s `remoteEntry.js` and imports exposed modules (e.g. `projectA/App`). |
| **Exposes** | Modules this host **exposes** to remotes. Remotes can `import ... from 'host/Header'` or `'host/config'`.                                                        |
| **Remotes** | Apps this host **consumes**. Configured by URL to each remote’s `remoteEntry.js` (from `.env` or default).                                                       |

**Flow:**

- Host builds and serves `remoteEntry.js` (from `exposes`).
- Host loads each remote’s `remoteEntry.js` from the URL in `remotes` (e.g. `VITE_PROJECT_A_URL`).
- Remotes can import exposed host modules (Header, config, types) so the host acts as both consumer and provider.

**Important:** `remoteEntry.js` is generated only at **build** time. For local dev with federation you must use **build + preview**, not the Vite dev server.

---

## Environment Variables

| Variable             | Required         | Description                                                                                                  |
| -------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------ |
| `VITE_PROJECT_A_URL` | No (has default) | Base URL of **projectA** build (no trailing slash). Host loads `{VITE_PROJECT_A_URL}/assets/remoteEntry.js`. |

**Examples:**

- **Local (default):** leave unset or set `VITE_PROJECT_A_URL=http://localhost:3001/build`
- **Production:** set to the deployed projectA URL, e.g. `VITE_PROJECT_A_URL=https://project-a.example.com/build`

Use `.env.local` for local overrides; add `.env.example` with documented variables (no secrets).

---

## Vite config — Federation

In `vite.config.ts`:

1. **Remote URL from env**  
   Read the remote base URL from `process.env.VITE_PROJECT_A_URL` and append the path to `remoteEntry.js` (under `build/assets/` after Vite build):

```ts
const projectAUrl = (process.env.VITE_PROJECT_A_URL ?? '').replace(/\/$/, '') || 'http://localhost:3001/build'
```

2. **Plugin: `name`**  
   Unique federation name for this app (e.g. `'host'`). Remotes use this when importing: `import ... from 'host/Header'`.

3. **Plugin: `filename`**  
   Output file name for this app’s federated entry (e.g. `'remoteEntry.js'`). Remotes will load `{remoteBaseUrl}/assets/remoteEntry.js`.

4. **Plugin: `remotes`**  
   Map of remote names to the **full URL** of their `remoteEntry.js`:

```ts
remotes: {
  projectA: `${projectAUrl}/assets/remoteEntry.js`,
}
```

5. **Plugin: `exposes`**  
   Map of public names to local modules so remotes can import them:

```ts
exposes: {
  './Header': './src/components/Header.tsx',
  './config': './src/config.ts',
  './models/Link.model': './models/Link.model.ts',
}
```

You can use a JSON file (e.g. `federation-exposes.json`) and import it to keep `vite.config.ts` clean.

6. **Plugin: `shared`**  
   List of dependencies shared with remotes (same versions recommended): e.g. `['react', 'react-dom', 'react-router-dom']`.

7. **CORS**  
   In dev/preview, remotes (e.g. projectA on another origin) need to fetch this host’s `remoteEntry.js`. Add a small CORS middleware so `Access-Control-Allow-Origin` (and related headers) are set for the build assets.

8. **Build settings**  
   Federation often works best with:

- `build.outDir`: e.g. `'build'` (so URLs are `.../build/assets/remoteEntry.js`)
- `build.target`: `'esnext'` (or as needed)
- `build.cssCodeSplit`: `false` if you want remotes to load a single CSS bundle

---

## Step-by-Step: Implement the Host (or Add a New Remote/Expose)

### 1. Install the plugin

```bash
npm i -D @originjs/vite-plugin-federation
```

### 2. Add environment variable (for remote URL)

- In **host** root, create or edit `.env.example`:

```env
# Optional. Default: http://localhost:3001/build
VITE_PROJECT_A_URL=http://localhost:3001/build
```

- Copy to `.env.local` and set `VITE_PROJECT_A_URL` when pointing to a different URL (e.g. production).

### 3. Configure `vite.config.ts`

- Import the plugin and (optionally) your exposes config:

```ts
import federation from '@originjs/vite-plugin-federation'
import exposes from './federation-exposes.json'
```

- Derive the remote base URL from env:

```ts
const projectAUrl = (process.env.VITE_PROJECT_A_URL ?? '').replace(/\/$/, '') || 'http://localhost:3001/build'
```

- Add CORS middleware so remotes can load this host’s `remoteEntry.js` (implement `corsForFederation()` or equivalent and register it in `configureServer` and `configurePreviewServer`).

- Register the federation plugin **after** React (or other transform plugins):

```ts
federation({
  name: 'host',
  filename: 'remoteEntry.js',
  remotes: {
    projectA: `${projectAUrl}/assets/remoteEntry.js`,
  },
  exposes,
  shared: ['react', 'react-dom', 'react-router-dom'],
})
```

- Set `build.outDir` (e.g. `'build'`) so the remote URL `{VITE_PROJECT_A_URL}/assets/remoteEntry.js` matches the built file.

### 4. Define exposes

- Either in config:

```ts
exposes: {
  './Header': './src/components/Header.tsx',
  './config': './src/config.ts',
}
```

- Or in `federation-exposes.json`:

```json
{
  "./Header": "./src/components/Header.tsx",
  "./config": "./src/config.ts",
  "./models/Link.model": "./src/models/Link.model.ts"
}
```

### 5. Consume the remote in the host

- In host code, use dynamic import so the remote is loaded from its `remoteEntry.js`:

```ts
const ProjectA = lazy(() => import('projectA/App'))
```

- Declare the module for TypeScript (e.g. in `src/vite-env.d.ts`):

```ts
declare module 'projectA/App' {
  import type { FC } from 'react'
  const App: FC
  export default App
}
```

### 6. Run with federation locally

Because `remoteEntry.js` is emitted only at build time:

1. **Terminal 1 — host**

   ```bash
   npm run build
   npm run preview
   ```

2. **Terminal 2 — projectA** (or other remote)

   ```bash
   cd projectA
   npm run build
   npm run preview
   ```

3. Open the host URL (e.g. `http://localhost:3000`). The host will load projectA from the URL defined by `VITE_PROJECT_A_URL` (or default).

If you see _Failed to fetch …/remoteEntry.js_, ensure the app that serves that URL is running with `npm run preview` (or equivalent), not `npm run dev`.

### 7. Add another remote (e.g. projectB)

- Add `VITE_PROJECT_B_URL` (and optional default) in `vite.config.ts`.
- Add to `remotes`: `projectB: `${projectBUrl}/assets/remoteEntry.js``.
- Use in code: `lazy(() => import('projectB/App'))` and add a `declare module 'projectB/App'` in `vite-env.d.ts`.

---

## Project structure (federation-related)

```
host/
├── .env.example          # VITE_PROJECT_A_URL (optional)
├── .env.local            # Local overrides (e.g. production remote URL)
├── federation-exposes.json  # Exposes map (Header, config, models)
├── vite.config.ts        # federation plugin: name, remotes, exposes, shared + CORS
├── src/
│   ├── vite-env.d.ts     # declare module 'projectA/App'
│   ├── routes.tsx        # lazy(() => import('projectA/App'))
│   └── ...
└── README.md             # This file
```

---

## Quick reference

| Task                              | Where                                                                               |
| --------------------------------- | ----------------------------------------------------------------------------------- |
| Change projectA URL               | `VITE_PROJECT_A_URL` in `.env.local` or `vite.config.ts` default                    |
| Expose a new module               | Add entry to `federation-exposes.json` (or `exposes` in config)                     |
| Add a new remote                  | Add URL env, add to `remotes`, use `import('remoteName/Expose')` + type declaration |
| Fix “Failed to fetch remoteEntry” | Run that app with `npm run build && npm run preview` (not dev server)               |
