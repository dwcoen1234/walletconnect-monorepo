# @walletconnect/ethereum-provider

## 2.20.0

### Minor Changes

- [#5564](https://github.com/WalletConnect/walletconnect-monorepo/pull/5564) [`ba1199abb51d0b3845a127e2d155aa1a623b6dad`](https://github.com/WalletConnect/walletconnect-monorepo/commit/ba1199abb51d0b3845a127e2d155aa1a623b6dad) Thanks [@tomiir](https://github.com/tomiir)! - Replace WalletConnectModal with AppKitCore.
  For those using EthereumProvider with `showQrModal: true` the UI is now re-skinned.

  EthereumProvider must now be strictly isolated to client-side components in SSR frameworks like Next.js; see https://www.npmjs.com/package/@walletconnect/ethereum-provider for implementation details.

### Patch Changes

- Updated dependencies []:
  - @walletconnect/utils@2.20.0
  - @walletconnect/sign-client@2.20.0
  - @walletconnect/types@2.20.0
  - @walletconnect/universal-provider@2.20.0

## 2.19.4

### Patch Changes

- [#6189](https://github.com/WalletConnect/walletconnect-monorepo/pull/6189) [`8c0f86db13dc83ce7caa7b5b84d66e31a0d24b5a`](https://github.com/WalletConnect/walletconnect-monorepo/commit/8c0f86db13dc83ce7caa7b5b84d66e31a0d24b5a) Thanks [@ganchoradkov](https://github.com/ganchoradkov)! - removed test log that was used to test changeset release

- Updated dependencies []:
  - @walletconnect/utils@2.19.4
  - @walletconnect/sign-client@2.19.4
  - @walletconnect/types@2.19.4
  - @walletconnect/universal-provider@2.19.4

## 2.19.3

### Patch Changes

- [#6157](https://github.com/WalletConnect/walletconnect-monorepo/pull/6157) [`083ee297282f0cd1dbb30956ce51d6ebc8912f2c`](https://github.com/WalletConnect/walletconnect-monorepo/commit/083ee297282f0cd1dbb30956ce51d6ebc8912f2c) Thanks [@ganchoradkov](https://github.com/ganchoradkov)! - added log to test changeset release

- Updated dependencies []:
  - @walletconnect/utils@2.19.3
  - @walletconnect/sign-client@2.19.3
  - @walletconnect/types@2.19.3
  - @walletconnect/universal-provider@2.19.3
