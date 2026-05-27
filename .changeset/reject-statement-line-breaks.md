---
"@walletconnect/utils": patch
---

Reject SIWE/CAIP-122 statements containing line breaks in `formatMessage`. Per EIP-4361 the statement is a single line, and embedded `\r`/`\n` could forge other fields (URI, Nonce, etc.) in the signed message.
