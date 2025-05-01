---
"@walletconnect/core": patch
"@walletconnect/react-native-compat": patch
"@walletconnect/sign-client": patch
"@walletconnect/types": patch
"@walletconnect/utils": patch
"@walletconnect/ethereum-provider": patch
"@walletconnect/signer-connection": patch
"@walletconnect/universal-provider": patch
---

fixes a race condition in the `relayer` where `toEstablishConnection` could trigger new ws connection even though one already exists and enter into a loop
