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

the wallet_getCapabilities cache in universal-provider now takes the chainIds as well as the address to decide if the request should be sent to the wallet
