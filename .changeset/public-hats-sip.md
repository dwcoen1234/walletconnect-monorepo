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

fixed a bug that caused `universal-provider` to throw unhandled when it tried to create sub provider for a namespace without accounts
