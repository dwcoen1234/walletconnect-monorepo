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

No longer awaits `cleanupPendingPairings` when initiating a connection in `universal-provider` to avoid delaying/blocking the pairing flow
