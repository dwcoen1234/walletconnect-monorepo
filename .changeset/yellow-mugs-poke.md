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

fixed a bug within `buildApprovedNamespaces` that didn't discard namespace when there were no matching chains or accounts
