# @walletconnect/universal-provider

## 2.21.0

### Minor Changes

- [#6667](https://github.com/WalletConnect/walletconnect-monorepo/pull/6667) [`cf81bfa705bc91084fefba51f53bfa0f009b9649`](https://github.com/WalletConnect/walletconnect-monorepo/commit/cf81bfa705bc91084fefba51f53bfa0f009b9649) Thanks [@ganchoradkov](https://github.com/ganchoradkov)! - Deprecating `requiredNamespaces`. If the `requiredNamespaces` are used, the values are automatically assigned to `optionalNamespaces` instead.

### Patch Changes

- [#6668](https://github.com/WalletConnect/walletconnect-monorepo/pull/6668) [`d51e82482246cf37781c4ffd72fb306fa33c433a`](https://github.com/WalletConnect/walletconnect-monorepo/commit/d51e82482246cf37781c4ffd72fb306fa33c433a) Thanks [@ganchoradkov](https://github.com/ganchoradkov)! - the wallet_getCapabilities cache in universal-provider now takes the chainIds as well as the address to decide if the request should be sent to the wallet

- Updated dependencies [[`d51e82482246cf37781c4ffd72fb306fa33c433a`](https://github.com/WalletConnect/walletconnect-monorepo/commit/d51e82482246cf37781c4ffd72fb306fa33c433a), [`cf81bfa705bc91084fefba51f53bfa0f009b9649`](https://github.com/WalletConnect/walletconnect-monorepo/commit/cf81bfa705bc91084fefba51f53bfa0f009b9649)]:
  - @walletconnect/sign-client@2.21.0
  - @walletconnect/types@2.21.0
  - @walletconnect/utils@2.21.0

## 2.20.3

### Patch Changes

- [#6302](https://github.com/WalletConnect/walletconnect-monorepo/pull/6302) [`2d9648ab4d3892a4903ceec52472420b3009f3c7`](https://github.com/WalletConnect/walletconnect-monorepo/commit/2d9648ab4d3892a4903ceec52472420b3009f3c7) Thanks [@ganchoradkov](https://github.com/ganchoradkov)! - Added new dedicated build of `ethereum-provider` for `react-native` that doesn't try to import `Appkit`

- [#6304](https://github.com/WalletConnect/walletconnect-monorepo/pull/6304) [`b566edcc1448b31c2ab8fa469e8a19c976ce74f8`](https://github.com/WalletConnect/walletconnect-monorepo/commit/b566edcc1448b31c2ab8fa469e8a19c976ce74f8) Thanks [@ganchoradkov](https://github.com/ganchoradkov)! - Added new dedicated build of `ethereum-provider` for `react-native` that doesn't try to import `Appkit`

- Updated dependencies [[`2d9648ab4d3892a4903ceec52472420b3009f3c7`](https://github.com/WalletConnect/walletconnect-monorepo/commit/2d9648ab4d3892a4903ceec52472420b3009f3c7), [`9c58e1e8d62e55ba22b8b1924a8128e9358a1195`](https://github.com/WalletConnect/walletconnect-monorepo/commit/9c58e1e8d62e55ba22b8b1924a8128e9358a1195), [`b566edcc1448b31c2ab8fa469e8a19c976ce74f8`](https://github.com/WalletConnect/walletconnect-monorepo/commit/b566edcc1448b31c2ab8fa469e8a19c976ce74f8)]:
  - @walletconnect/utils@2.20.3
  - @walletconnect/sign-client@2.20.3
  - @walletconnect/types@2.20.3

## 2.20.2

### Patch Changes

- [#6279](https://github.com/WalletConnect/walletconnect-monorepo/pull/6279) [`f2847e2511243846a422ec0495f9d56a88376a1c`](https://github.com/WalletConnect/walletconnect-monorepo/commit/f2847e2511243846a422ec0495f9d56a88376a1c) Thanks [@ganchoradkov](https://github.com/ganchoradkov)! - fixed auto bumping relayer version on release

- [#6282](https://github.com/WalletConnect/walletconnect-monorepo/pull/6282) [`060eb7cc8d9d03c224a0dc29c9ce71d15763d544`](https://github.com/WalletConnect/walletconnect-monorepo/commit/060eb7cc8d9d03c224a0dc29c9ce71d15763d544) Thanks [@ganchoradkov](https://github.com/ganchoradkov)! - fixed changeset release script

- Updated dependencies [[`f2847e2511243846a422ec0495f9d56a88376a1c`](https://github.com/WalletConnect/walletconnect-monorepo/commit/f2847e2511243846a422ec0495f9d56a88376a1c), [`060eb7cc8d9d03c224a0dc29c9ce71d15763d544`](https://github.com/WalletConnect/walletconnect-monorepo/commit/060eb7cc8d9d03c224a0dc29c9ce71d15763d544)]:
  - @walletconnect/sign-client@2.20.2
  - @walletconnect/types@2.20.2
  - @walletconnect/utils@2.20.2

## 2.20.1

### Patch Changes

- [#6277](https://github.com/WalletConnect/walletconnect-monorepo/pull/6277) [`baac2ac8ff62d1e98596440dd86bcefadf771b4d`](https://github.com/WalletConnect/walletconnect-monorepo/commit/baac2ac8ff62d1e98596440dd86bcefadf771b4d) Thanks [@ganchoradkov](https://github.com/ganchoradkov)! - fixed a bug where calling `subscriber.onDisable` multiple times was overriding the `cached` subscriptions with an empty array

- [#6275](https://github.com/WalletConnect/walletconnect-monorepo/pull/6275) [`c1d656f4bbbec09914ecbc9af959f5933ae6f292`](https://github.com/WalletConnect/walletconnect-monorepo/commit/c1d656f4bbbec09914ecbc9af959f5933ae6f292) Thanks [@ganchoradkov](https://github.com/ganchoradkov)! - fixes a race condition in the `relayer` where `toEstablishConnection` could trigger new ws connection even though one already exists and enter into a loop

- Updated dependencies [[`baac2ac8ff62d1e98596440dd86bcefadf771b4d`](https://github.com/WalletConnect/walletconnect-monorepo/commit/baac2ac8ff62d1e98596440dd86bcefadf771b4d), [`c1d656f4bbbec09914ecbc9af959f5933ae6f292`](https://github.com/WalletConnect/walletconnect-monorepo/commit/c1d656f4bbbec09914ecbc9af959f5933ae6f292)]:
  - @walletconnect/sign-client@2.20.1
  - @walletconnect/types@2.20.1
  - @walletconnect/utils@2.20.1

## 2.20.0

### Patch Changes

- Updated dependencies []:
  - @walletconnect/utils@2.20.0
  - @walletconnect/sign-client@2.20.0
  - @walletconnect/types@2.20.0

## 2.19.4

### Patch Changes

- Updated dependencies []:
  - @walletconnect/utils@2.19.4
  - @walletconnect/sign-client@2.19.4
  - @walletconnect/types@2.19.4

## 2.19.3

### Patch Changes

- Updated dependencies []:
  - @walletconnect/utils@2.19.3
  - @walletconnect/sign-client@2.19.3
  - @walletconnect/types@2.19.3
