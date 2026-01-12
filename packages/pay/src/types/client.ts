/**
 * Client types for WalletConnect Pay SDK
 */

import type { Logger } from "@walletconnect/logger";

/**
 * Application metadata
 */
export interface AppMetadata {
  /** Application bundle ID */
  bundleId: string;
}

/**
 * Options for initializing the Pay client
 */
export interface PayClientOptions {
  /** WalletConnect Project ID */
  projectId: string;
  /** API key for Pay service */
  apiKey: string;
  /** Application metadata */
  metadata?: AppMetadata;
  /** Custom base URL (defaults to production) */
  baseUrl?: string;
  /** Custom logger instance */
  logger?: Logger | string;
}
