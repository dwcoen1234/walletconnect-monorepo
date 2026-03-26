---
"@walletconnect/utils": patch
---

fix: replace Node.js Buffer with browser-safe alternatives to fix "Buffer is not defined" in browser environments

- Replace `Buffer.from`/`Buffer.concat` with `Uint8Array`, `btoa`/`atob`, `TextEncoder`/`TextDecoder`, and `uint8arrays` helpers across `misc.ts`, `crypto.ts`, `cacao.ts`, `signatures.ts`, and `polkadot.ts`
- Add `scripts/verify-no-buffer.mjs` to verify UMD bundles contain no unguarded Buffer usage
