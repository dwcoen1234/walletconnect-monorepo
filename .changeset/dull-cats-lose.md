---
"@walletconnect/universal-provider": patch
"@walletconnect/core": patch
"@walletconnect/react-native-compat": patch
"@walletconnect/sign-client": patch
"@walletconnect/types": patch
"@walletconnect/utils": patch
"@walletconnect/ethereum-provider": patch
"@walletconnect/signer-connection": patch
---

Fixed a bug in `universal-provider` where `logger` wasn't imported correctly due to esm/cjs mismatch in some environments
