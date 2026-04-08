---
"@walletconnect/core": patch
---

Strip bare `new TextEncoder,new TextDecoder;` side-effect from UMD bundles that crashed React Native / Hermes on import
