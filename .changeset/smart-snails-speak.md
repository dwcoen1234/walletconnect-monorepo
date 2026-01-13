---
"@walletconnect/universal-provider": patch
---

fix: invalidate wallet_getCapabilities cache on chain switch

When `wallet_getCapabilities` is called without explicit `chainIds` parameter, the cache key now includes the current active chainId. This ensures the cache is properly invalidated when switching chains, triggering a new request to the wallet instead of returning stale cached capabilities.
