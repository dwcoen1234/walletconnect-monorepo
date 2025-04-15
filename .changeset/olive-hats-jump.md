---
"@walletconnect/ethereum-provider": minor
---
Replace WalletConnectModal with AppKitCore.
For those using EthereumProvider with `showQrModal: true` the UI is now re-skinned.

EthereumProvider must now be strictly isolated to client-side components in SSR frameworks like Next.js; see https://www.npmjs.com/package/@walletconnect/ethereum-provider for implementation details.
