---
"@walletconnect/core": patch
---

Fixed batch subscribe silently swallowing errors and marking topics as subscribed when the RPC failed. Failed topics are now kept in pending for retry, and connection_stalled triggers a transport restart with exponential backoff.
