---
"@walletconnect/utils": patch
"@walletconnect/core": patch
"@walletconnect/react-native-compat": patch
"@walletconnect/sign-client": patch
"@walletconnect/types": patch
"@walletconnect/ethereum-provider": patch
"@walletconnect/signer-connection": patch
"@walletconnect/universal-provider": patch
---

Implemented heartbeat connection checker to avoid cases where unreliable browser network state can cause the SDK to stay without active ws connection
