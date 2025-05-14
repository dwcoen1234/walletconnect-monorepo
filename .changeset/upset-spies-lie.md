---
"@walletconnect/ethereum-provider": patch
"@walletconnect/utils": patch
"@walletconnect/core": patch
"@walletconnect/react-native-compat": patch
"@walletconnect/sign-client": patch
"@walletconnect/types": patch
"@walletconnect/signer-connection": patch
"@walletconnect/universal-provider": patch
---

Added polyfills so `ethereum-provider` can be used in React Native expo environments. The polyfills are required because `@reown/appkit` is now part of the bundle in place of the deprecated WCM
