---
"@walletconnect/sign-client": patch
---

Enforce controller authorization on session update. Incoming `wc_sessionUpdate` requests are now rejected (`UNAUTHORIZED_UPDATE_REQUEST`) unless the sending peer is the session controller, and the public `update()` method now throws when called by a non-controller. This prevents a non-controller peer (e.g. a dApp using a custom SDK) from mutating a session's namespaces.
