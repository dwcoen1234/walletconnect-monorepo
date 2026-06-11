---
"@walletconnect/sign-client": patch
"@walletconnect/core": patch
---

Reject plaintext TYPE_2 envelopes delivered over the relay transport. TYPE_2 payloads are now only handled in link mode in the sign engine (`onRelayMessage`) and pairing (`registerRelayerEvents`) relay handlers.
