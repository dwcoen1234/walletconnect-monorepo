---
"@walletconnect/sign-client": patch
"@walletconnect/types": patch
"@walletconnect/utils": patch
"@walletconnect/core": patch
"@walletconnect/react-native-compat": patch
"@walletconnect/ethereum-provider": patch
"@walletconnect/signer-connection": patch
"@walletconnect/universal-provider": patch
---

Fixed a bug where duplicate session_request was emitted after client restart affecting sign-client instances with disabled session request queue.
