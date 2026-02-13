/**
 * Provider exports for WalletConnect Pay SDK
 *
 * WASM provider is loaded dynamically to avoid pulling in TextDecoder-dependent
 * code in React Native debug builds where TextDecoder is unavailable.
 */

import { isReactNative } from "@walletconnect/utils";
import type { PayProvider, PayProviderConfig, PayProviderType } from "../types/index.js";
import { createNativeProvider, isNativeProviderAvailable } from "./native.js";

export * from "./native.js";

function isWasmProviderAvailable(): boolean {
  return !isReactNative() && typeof WebAssembly !== "undefined";
}

export { isWasmProviderAvailable };

async function loadWasmProvider(config: PayProviderConfig): Promise<PayProvider> {
  const { createWasmProvider } = await import("./wasm.js");
  return createWasmProvider(config);
}

/**
 * Detect the best available provider type for the current environment
 * Priority: Native (React Native) > WASM (Browser/Node.js)
 */
export function detectProviderType(): PayProviderType | null {
  if (isNativeProviderAvailable()) {
    return "native";
  }

  if (isWasmProviderAvailable()) {
    return "wasm";
  }

  return null;
}

/**
 * Create a provider based on auto-detection.
 * Returns a Promise because the WASM provider is loaded dynamically.
 */
export function createProvider(config: PayProviderConfig): Promise<PayProvider> {
  return new Promise((resolve, reject) => {
    const providerType = detectProviderType();

    if (!providerType) {
      reject(
        new Error(
          "No Pay provider available. Make sure you are running in React Native with the native module installed, or in a browser/Node.js environment with WebAssembly support.",
        ),
      );
      return;
    }

    switch (providerType) {
      case "native":
        resolve(createNativeProvider(config));
        break;
      case "wasm":
        resolve(loadWasmProvider(config));
        break;
      default:
        reject(new Error(`Unknown provider type: ${providerType}`));
    }
  });
}

/**
 * Check if any provider is available
 */
export function isProviderAvailable(): boolean {
  return detectProviderType() !== null;
}
