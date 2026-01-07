/**
 * Client types for WalletConnect Pay SDK
 */

import type { Logger } from "@walletconnect/logger";

/**
 * Application metadata
 */
export interface AppMetadata {
  /** Application name */
  name: string;
  /** Application bundle ID */
  bundleId: string;
  /** Application description (optional) */
  description?: string;
  /** Application URL (optional) */
  url?: string;
  /** Application icon URLs (optional) */
  icons?: string[];
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
  metadata: AppMetadata;
  /** Custom base URL (defaults to production) */
  baseUrl?: string;
  /** Custom logger instance */
  logger?: Logger | string;
}
