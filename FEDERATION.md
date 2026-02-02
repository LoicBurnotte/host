# Federation: sharing config and components with remotes

The host exposes **components**, **config**, and **models** to remote projects (e.g. projectA) via `@originjs/vite-plugin-federation`. Remotes import them with `import … from 'host/…'`.

---

## What the host exposes (current)

| Remote import            | Description                          |
| ------------------------ | ------------------------------------ |
| `host/Header`            | Header component                     |
| `host/config`            | App config (API URL, features, etc.) |
| `host/models/Link.model` | Link type                            |

---

## Adding more from the host

### 1. Expose a new module

1. **Add to `federation-exposes.json`** (same keys as in vite federation):

   ```json
   {
     "./Header": "./src/components/Header.tsx",
     "./config": "./src/config.ts",
     "./Footer": "./src/components/Footer.tsx",
     "./models/Link.model": "./src/models/Link.model.ts"
   }
   ```

2. **Rebuild the host** so the new entry is in `remoteEntry.js`.

3. **(Optional) Regenerate types** for remotes:

   ```bash
   npm run generate:remote-types
   ```

   Then publish or share the `host-remote-types` package so remotes get TypeScript types.

### 2. Exposing components

- Add the component path to `federation-exposes.json` as above.
- In the remote: `import * as HostFooter from 'host/Footer'` then `const { Footer } = HostFooter`, or use the pattern you use for `host/Header`.

### 3. Exposing config

- **`host/config`** is already exposed and exports `appConfig` (and type `AppConfig`).
- In the remote: `import { appConfig } from 'host/config'` and use `appConfig.apiBaseUrl`, `appConfig.features`, etc.
- Edit `src/config.ts` in the host to add or change values; remotes will get them after a host rebuild.

### 4. Exposing models / types

- Add the model file to `federation-exposes.json` (e.g. `"./models/Your.model": "./src/models/Your.model.ts"`).
- In the remote: `import type { YourType } from 'host/models/Your.model'`.
- Run `generate:remote-types` so the types package includes the new module.

---

## Using host config/components in a remote (projectA)

**Config:**

```ts
import { appConfig } from 'host/config'

// e.g. use appConfig.apiBaseUrl for API calls, appConfig.features for feature flags
console.log(appConfig.appName, appConfig.apiBaseUrl)
```

**Components** (same pattern as Header):

```ts
import * as hostFooter from 'host/Footer'
const { Footer } = hostFooter
// use <Footer /> in JSX
```

**Types/models:**

```ts
import type { Link } from 'host/models/Link.model'
```

---

## Summary

- **Host**: Add entries to `federation-exposes.json` → rebuild → optionally run `generate:remote-types` and publish the types package.
- **Remotes**: Import from `host/…` (config, components, models). No access to the host repo; they use the built host remoteEntry and, if you use it, the published `host-remote-types` package.
