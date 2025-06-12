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

Fixed a bug in the 1271 signature validator that was causing multi sig to fail due to hardcoded signature length
