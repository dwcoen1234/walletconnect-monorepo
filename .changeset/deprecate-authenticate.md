---
"@walletconnect/sign-client": patch
"@walletconnect/types": patch
---

Deprecate the `authenticate` method on Sign Client. It is marked `@deprecated` in the type definitions and logs a runtime warning when called. Use `connect()`'s `authentication` parameter instead to establish an authenticated session.
