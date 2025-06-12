---
"@walletconnect/sign-client": patch
"@walletconnect/types": patch
"@walletconnect/core": patch
"@walletconnect/react-native-compat": patch
"@walletconnect/utils": patch
"@walletconnect/ethereum-provider": patch
"@walletconnect/signer-connection": patch
"@walletconnect/universal-provider": patch
---

Fixed a bug where reusing pairing URI second time was not providing correct verify context in session_proposal
