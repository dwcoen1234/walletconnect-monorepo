---
"@walletconnect/utils": patch
---

Reject SIWE/CAIP-122 statements containing line breaks in `formatMessage`. Per EIP-4361 the statement is a single line, and embedded `\r`/`\n` (from a caller-supplied statement or untrusted recap-derived text) could forge other fields (URI, Nonce, etc.) in the signed message. The check runs on the final statement after recap formatting, and `validateSignedCacao` now returns `false` for such malformed payloads instead of throwing.
