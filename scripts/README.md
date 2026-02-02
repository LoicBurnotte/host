# Host scripts

The **Host app** is deployed elsewhere (e.g. Vercel). Remotes (projectA, etc.) are in separate repos and **never** access the host repo. They get types only by installing the **published** `host-remote-types` package (npm or tarball URL).

---

## generate-remote-types.mjs

Generates the **host-remote-types** package so the host team can **publish** it. Remotes then add it as a normal dependency; no path to the host repo.

### Usage (host repo only)

From the **host** project (where the Host app lives):

```bash
npm run generate:remote-types
```

This will:

1. Emit `.d.ts` files for `src/` into **dist-types/**.
2. Populate **packages/host-remote-types/** with `host-remote.d.ts` and **dist-types/**.

That folder is what you **publish** (to npm or as a tarball). Remotes never see the host repo; they only install the published package.

### Adding new exposes

1. Edit **federation-exposes.json** (same keys as in vite federation config).
2. Run `npm run generate:remote-types` again.
3. Publish a new version of **host-remote-types** so remotes can upgrade.

---

## How remotes get types (Host not accessible)

Remotes do **not** have the host repo. They depend on the **package** `host-remote-types`, which must be available from a **registry or URL**.

### 1. Publish to npm (or private registry)

In the **host** repo (or in CI):

```bash
cd packages/host-remote-types
npm version 0.0.1
npm publish
```

In **any remote** repo (different repo, no host access):

```json
"devDependencies": {
  "host-remote-types": "^0.0.1"
}
```

Then in the remote’s **vite-env.d.ts** (or any global `.d.ts`):

```ts
/// <reference types="vite/client" />
/// <reference types="host-remote-types" />
```

Run `npm install` in the remote. Types resolve from `node_modules/host-remote-types`; the Host app and host repo are not involved.

(Use a scoped name like `@myorg/host-remote-types` if you prefer; update `name` in `packages/host-remote-types/package.json` and reference that in remotes.)

### 2. Tarball URL (no npm publish)

Host CI runs `npm run generate:remote-types`, then:

```bash
cd packages/host-remote-types && npm pack
```

Upload the generated `.tgz` (e.g. to GitHub Releases or an internal URL). In the **remote** repo:

```json
"devDependencies": {
  "host-remote-types": "https://your-org.com/releases/host-remote-types-0.0.0.tgz"
}
```

Remote runs `npm install` and gets the package from that URL. No host repo access.

---

## Summary

- **Host**: Deployed elsewhere. Repo runs `generate:remote-types` and **publishes** `packages/host-remote-types` (npm or tarball URL).
- **Remotes**: Different repos, no access to the host. They add `"host-remote-types": "^0.0.0"` (or the tarball URL) and `/// <reference types="host-remote-types" />`. Types come only from the published package.

**Local dev** (same machine as host repo): you can still run `npm pack` in `packages/host-remote-types` and in the remote run `npm install /path/to/host-remote-types-0.0.0.tgz` so the remote uses the built package without publishing. For any environment where the host repo is not present, use the published package or URL only.
