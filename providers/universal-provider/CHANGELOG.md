# @walletconnect/universal-provider

## 2.21.6

### Patch Changes

- [#6814](https://github.com/WalletConnect/walletconnect-monorepo/pull/6814) [`743fdadd794e31ef3db278836d0e4bbabb3beebb`](https://github.com/WalletConnect/walletconnect-monorepo/commit/743fdadd794e31ef3db278836d0e4bbabb3beebb) Thanks [@ganchoradkov](https://github.com/ganchoradkov)! - Fixed an unhandled exception when setting default chain of a generic subProvider in `universal-provider`

- [#6647](https://github.com/WalletConnect/walletconnect-monorepo/pull/6647) [`b74edc105d8f2ce31d7b328147c5404042b97517`](https://github.com/WalletConnect/walletconnect-monorepo/commit/b74edc105d8f2ce31d7b328147c5404042b97517) Thanks [@ganchoradkov](https://github.com/ganchoradkov)! - Implemented new relay methods `wc_proposeSession` and `wc_approveSession`

- [#6813](https://github.com/WalletConnect/walletconnect-monorepo/pull/6813) [`c9a87a87e28ea252dd56a1de61c0dddf1f6d0a08`](https://github.com/WalletConnect/walletconnect-monorepo/commit/c9a87a87e28ea252dd56a1de61c0dddf1f6d0a08) Thanks [@ganchoradkov](https://github.com/ganchoradkov)! - No longer awaits `cleanupPendingPairings` when initiating a connection in `universal-provider` to avoid delaying/blocking the pairing flow

- Updated dependencies [[`743fdadd794e31ef3db278836d0e4bbabb3beebb`](https://github.com/WalletConnect/walletconnect-monorepo/commit/743fdadd794e31ef3db278836d0e4bbabb3beebb), [`b74edc105d8f2ce31d7b328147c5404042b97517`](https://github.com/WalletConnect/walletconnect-monorepo/commit/b74edc105d8f2ce31d7b328147c5404042b97517), [`c9a87a87e28ea252dd56a1de61c0dddf1f6d0a08`](https://github.com/WalletConnect/walletconnect-monorepo/commit/c9a87a87e28ea252dd56a1de61c0dddf1f6d0a08)]:
  - @walletconnect/sign-client@2.21.6
  - @walletconnect/types@2.21.6
  - @walletconnect/utils@2.21.6

## 2.21.5

### Patch Changes

- [#6806](https://github.com/WalletConnect/walletconnect-monorepo/pull/6806) [`8dc0a08ffcaeadee11d38a9af131388cdb2c6df0`](https://github.com/WalletConnect/walletconnect-monorepo/commit/8dc0a08ffcaeadee11d38a9af131388cdb2c6df0) Thanks [@ganchoradkov](https://github.com/ganchoradkov)! - fixed a bug that caused `universal-provider` to throw unhandled when it tried to create sub provider for a namespace without accounts

- [#6799](https://github.com/WalletConnect/walletconnect-monorepo/pull/6799) [`f32d8fea0a37da7dd54d58da166d133238f7ed93`](https://github.com/WalletConnect/walletconnect-monorepo/commit/f32d8fea0a37da7dd54d58da166d133238f7ed93) Thanks [@arein](https://github.com/arein)! - Updated the `skipped transport open due to no topics` relayer log message level to `info`

- [#6807](https://github.com/WalletConnect/walletconnect-monorepo/pull/6807) [`c3c9bf7b4cc01a4099482648605f4a2278c90441`](https://github.com/WalletConnect/walletconnect-monorepo/commit/c3c9bf7b4cc01a4099482648605f4a2278c90441) Thanks [@ganchoradkov](https://github.com/ganchoradkov)! - fixed a bug within `buildApprovedNamespaces` that didn't discard namespace when there were no matching chains or accounts

- Updated dependencies [[`8dc0a08ffcaeadee11d38a9af131388cdb2c6df0`](https://github.com/WalletConnect/walletconnect-monorepo/commit/8dc0a08ffcaeadee11d38a9af131388cdb2c6df0), [`f32d8fea0a37da7dd54d58da166d133238f7ed93`](https://github.com/WalletConnect/walletconnect-monorepo/commit/f32d8fea0a37da7dd54d58da166d133238f7ed93), [`c3c9bf7b4cc01a4099482648605f4a2278c90441`](https://github.com/WalletConnect/walletconnect-monorepo/commit/c3c9bf7b4cc01a4099482648605f4a2278c90441)]:
  - @walletconnect/sign-client@2.21.5
  - @walletconnect/types@2.21.5
  - @walletconnect/utils@2.21.5

## 2.21.4

### Patch Changes

- [#6778](https://github.com/WalletConnect/walletconnect-monorepo/pull/6778) [`664a9d4a6fcd56ed67620081d9c2ebb1a8053433`](https://github.com/WalletConnect/walletconnect-monorepo/commit/664a9d4a6fcd56ed67620081d9c2ebb1a8053433) Thanks [@ganchoradkov](https://github.com/ganchoradkov)! - Fixed a bug where duplicate session_request was emitted after client restart affecting sign-client instances with disabled session request queue.

- [#6762](https://github.com/WalletConnect/walletconnect-monorepo/pull/6762) [`e608240d51cfe347de69e4c43ca63b2ed8c8101f`](https://github.com/WalletConnect/walletconnect-monorepo/commit/e608240d51cfe347de69e4c43ca63b2ed8c8101f) Thanks [@ganchoradkov](https://github.com/ganchoradkov)! - Implemented the new 5792 handling in universal-provider according to ChainAgnostic/namespaces#139

- Updated dependencies [[`664a9d4a6fcd56ed67620081d9c2ebb1a8053433`](https://github.com/WalletConnect/walletconnect-monorepo/commit/664a9d4a6fcd56ed67620081d9c2ebb1a8053433), [`e608240d51cfe347de69e4c43ca63b2ed8c8101f`](https://github.com/WalletConnect/walletconnect-monorepo/commit/e608240d51cfe347de69e4c43ca63b2ed8c8101f)]:
  - @walletconnect/sign-client@2.21.4
  - @walletconnect/types@2.21.4
  - @walletconnect/utils@2.21.4

## 2.21.3

### Patch Changes

- [#6759](https://github.com/WalletConnect/walletconnect-monorepo/pull/6759) [`5b7e95a02b7471cad07a18acff44c4198d9d0cfd`](https://github.com/WalletConnect/walletconnect-monorepo/commit/5b7e95a02b7471cad07a18acff44c4198d9d0cfd) Thanks [@ganchoradkov](https://github.com/ganchoradkov)! - Relayer init no longer awaits transportOpen

- [#6743](https://github.com/WalletConnect/walletconnect-monorepo/pull/6743) [`f482c9105a12136f79eab3c730feada9c326f1bf`](https://github.com/WalletConnect/walletconnect-monorepo/commit/f482c9105a12136f79eab3c730feada9c326f1bf) Thanks [@ganchoradkov](https://github.com/ganchoradkov)! - Fixed a bug where reusing pairing URI second time was not providing correct verify context in session_proposal

- [#6738](https://github.com/WalletConnect/walletconnect-monorepo/pull/6738) [`8b6e3c0d187e2f47876bb81d7094fc7794b90e4e`](https://github.com/WalletConnect/walletconnect-monorepo/commit/8b6e3c0d187e2f47876bb81d7094fc7794b90e4e) Thanks [@ganchoradkov](https://github.com/ganchoradkov)! - deletes expirer entry after the wallet responds to a session proposal

- [#6746](https://github.com/WalletConnect/walletconnect-monorepo/pull/6746) [`f011c4ae16fa41a4bf17c532da79e17e841ab573`](https://github.com/WalletConnect/walletconnect-monorepo/commit/f011c4ae16fa41a4bf17c532da79e17e841ab573) Thanks [@ganchoradkov](https://github.com/ganchoradkov)! - Fixed a bug in the 1271 signature validator that was causing multi sig to fail due to hardcoded signature length

- Updated dependencies [[`5b7e95a02b7471cad07a18acff44c4198d9d0cfd`](https://github.com/WalletConnect/walletconnect-monorepo/commit/5b7e95a02b7471cad07a18acff44c4198d9d0cfd), [`f482c9105a12136f79eab3c730feada9c326f1bf`](https://github.com/WalletConnect/walletconnect-monorepo/commit/f482c9105a12136f79eab3c730feada9c326f1bf), [`8b6e3c0d187e2f47876bb81d7094fc7794b90e4e`](https://github.com/WalletConnect/walletconnect-monorepo/commit/8b6e3c0d187e2f47876bb81d7094fc7794b90e4e), [`f011c4ae16fa41a4bf17c532da79e17e841ab573`](https://github.com/WalletConnect/walletconnect-monorepo/commit/f011c4ae16fa41a4bf17c532da79e17e841ab573)]:
  - @walletconnect/sign-client@2.21.3
  - @walletconnect/types@2.21.3
  - @walletconnect/utils@2.21.3

## 2.21.2

### Patch Changes

- [#6678](https://github.com/WalletConnect/walletconnect-monorepo/pull/6678) [`d6eda498d24afb650e49df32f717b1d0db863753`](https://github.com/WalletConnect/walletconnect-monorepo/commit/d6eda498d24afb650e49df32f717b1d0db863753) Thanks [@ganchoradkov](https://github.com/ganchoradkov)! - Extended TVF to cover more chains

- Updated dependencies [[`d6eda498d24afb650e49df32f717b1d0db863753`](https://github.com/WalletConnect/walletconnect-monorepo/commit/d6eda498d24afb650e49df32f717b1d0db863753)]:
  - @walletconnect/sign-client@2.21.2
  - @walletconnect/utils@2.21.2
  - @walletconnect/types@2.21.2

## 2.21.1

### Patch Changes

- [#6680](https://github.com/WalletConnect/walletconnect-monorepo/pull/6680) [`fd9386811ea91ee7ee9fd8a333024f980c6c0b41`](https://github.com/WalletConnect/walletconnect-monorepo/commit/fd9386811ea91ee7ee9fd8a333024f980c6c0b41) Thanks [@ganchoradkov](https://github.com/ganchoradkov)! - updated `@reown/appkit` version to `1.7.8` in `@walletconnect/ethereum-provider`

- Updated dependencies [[`fd9386811ea91ee7ee9fd8a333024f980c6c0b41`](https://github.com/WalletConnect/walletconnect-monorepo/commit/fd9386811ea91ee7ee9fd8a333024f980c6c0b41)]:
  - @walletconnect/sign-client@2.21.1
  - @walletconnect/types@2.21.1
  - @walletconnect/utils@2.21.1

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
