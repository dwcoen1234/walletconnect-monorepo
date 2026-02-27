---
"@walletconnect/utils": patch
---

Updated `createDelayedPromise` expiry rejection to also contain a proper error code from `getInternalError("EXPIRED")` with a value of `6`
