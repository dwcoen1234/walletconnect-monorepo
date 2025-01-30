import type { AppKitOptions } from "@reown/appkit";
import type { WalletConnectModalConfig } from "./types";
import type { EthereumProviderOptions } from "./EthereumProvider";

function convertThemeVariables(
  wcmTheme?: WalletConnectModalConfig["themeVariables"],
): AppKitOptions["themeVariables"] | undefined {
  if (!wcmTheme) return undefined;

  return {
    "--w3m-font-family": wcmTheme["--wcm-font-family"],
    "--w3m-accent": wcmTheme["--wcm-accent-color"],
    "--w3m-color-mix": wcmTheme["--wcm-background-color"],
    "--w3m-z-index": wcmTheme["--wcm-z-index"] ? Number(wcmTheme["--wcm-z-index"]) : undefined,

    "--w3m-qr-color": wcmTheme["--wcm-accent-color"],

    "--w3m-font-size-master": wcmTheme["--wcm-text-medium-regular-size"],
    "--w3m-border-radius-master": wcmTheme["--wcm-container-border-radius"],
    "--w3m-color-mix-strength": 8,
  };
}

export function convertWCMToAppKitOptions(
  wcmConfig: WalletConnectModalConfig & { metadata?: EthereumProviderOptions["metadata"] },
): AppKitOptions {
  const networkIds = wcmConfig.chains?.map((chain) => Number(chain.split(":")[1])) as [
    number,
    ...number[],
  ];

  const appKitOptions: AppKitOptions = {
    projectId: wcmConfig.projectId,
    networkIds,
    themeMode: wcmConfig.themeMode,
    themeVariables: convertThemeVariables(wcmConfig.themeVariables),
    chainImages: wcmConfig.chainImages,
    connectorImages: wcmConfig.walletImages,
    metadata: {
      ...wcmConfig.metadata,
      name: wcmConfig.metadata?.name || "WalletConnect",
      description: wcmConfig.metadata?.description || "Connect to WalletConnect-compatible wallets",
      url: wcmConfig.metadata?.url || "https://walletconnect.org",
      icons: wcmConfig.metadata?.icons || ["https://walletconnect.org/walletconnect-logo.png"],
    },
    showWallets: true,
    // Explorer options mapping
    featuredWalletIds:
      wcmConfig.explorerRecommendedWalletIds === "NONE"
        ? []
        : Array.isArray(wcmConfig.explorerRecommendedWalletIds)
        ? wcmConfig.explorerRecommendedWalletIds
        : [],

    excludeWalletIds:
      wcmConfig.explorerExcludedWalletIds === "ALL"
        ? []
        : Array.isArray(wcmConfig.explorerExcludedWalletIds)
        ? wcmConfig.explorerExcludedWalletIds
        : [],

    // Additional AppKit-specific options that don't have direct WCM equivalents
    enableEIP6963: false, // Disable 6963 by default
    enableInjected: false, // Disable injected by default
    enableCoinbase: true, // Default to true
    enableWalletConnect: true, // Default to true,
    features: {
      email: false,
      socials: false,
    },
  };

  // Add mobile and desktop wallets as custom wallets if provided
  if (wcmConfig.mobileWallets?.length || wcmConfig.desktopWallets?.length) {
    const customWallets = [
      ...(wcmConfig.mobileWallets || []).map((wallet) => ({
        id: wallet.id,
        name: wallet.name,
        links: wallet.links,
      })),
      ...(wcmConfig.desktopWallets || []).map((wallet) => ({
        id: wallet.id,
        name: wallet.name,
        links: {
          native: wallet.links.native,
          universal: wallet.links.universal,
        },
      })),
    ];

    const allWallets = [
      ...(appKitOptions.featuredWalletIds || []),
      ...(appKitOptions.excludeWalletIds || []),
    ];

    // Only add a custom wallet if it's not on the other lists
    const uniqueCustomWallets = customWallets.filter((wallet) => !allWallets.includes(wallet.id));

    if (uniqueCustomWallets.length) {
      appKitOptions.customWallets = uniqueCustomWallets;
    }
  }

  return appKitOptions;
}
