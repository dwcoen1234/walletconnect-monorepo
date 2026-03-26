---
"@walletconnect/core": patch
---

fix: prevent Node.js crypto module from leaking into browser bundles

- Fix Rollup external config to handle subpath imports (e.g. `uint8arrays/from-string`), preventing transitive bundling of `multiformats` and its Node.js `crypto` import in ESM/CJS outputs
- Add browser field override plugin to redirect `multiformats` internal `sha2.js` to `sha2-browser.js` (Web Crypto API) in UMD bundles
- Add build-time guard that fails the UMD build if any Node.js built-in module is referenced
