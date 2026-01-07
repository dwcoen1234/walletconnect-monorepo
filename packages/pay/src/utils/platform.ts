/**
 * Platform detection utilities for WalletConnect Pay SDK
 */

import { isIos, isAndroid, isReactNative, isBrowser, isNode } from "@walletconnect/utils";

/**
 * Get the SDK platform based on the current environment
 * @returns Platform string: rn-ios, rn-android, browser, node, or unknown
 */
export function getSdkPlatform(): string {
  if (isReactNative()) {
    if (isIos()) return "rn-ios";
    if (isAndroid()) return "rn-android";
  }
  if (isBrowser()) return "browser";
  if (isNode()) return "node";

  if (isIos()) return "ios";
  if (isAndroid()) return "android";

  return "unknown";
}
