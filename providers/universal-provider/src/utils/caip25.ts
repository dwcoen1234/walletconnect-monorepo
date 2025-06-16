import { SessionTypes } from "@walletconnect/types";
import { isValidObject } from "@walletconnect/utils";

const EIP155_PREFIX = "eip155";

const hexToDecimal = (hex?: string) => {
  return hex && hex.startsWith("0x") ? BigInt(hex).toString(10) : hex;
};

const decimalToHex = (decimal: string) => {
  return decimal && decimal.startsWith("0x") ? decimal : `0x${BigInt(decimal).toString(16)}`;
};

const filterCaip10AccountsFromObject = (object: Record<string, any>) => {
  const keysToPreserve = Object.keys(object).filter((item) => {
    const parts = item.split(":");
    return parts.length !== 3;
  });

  return keysToPreserve.reduce(
    (acc, key) => {
      acc[key] = object[key];
      return acc;
    },
    {} as Record<string, any>,
  );
};

export const extractCapabilitiesFromSession = (
  session: SessionTypes.Struct,
  address: string,
  chainIds: string[],
) => {
  const { scopedProperties } = session;
  const result: Record<string, any> = {};

  if (!isValidObject(scopedProperties)) {
    console.warn("No scoped properties found in session");
    return;
  }

  for (const chain of chainIds) {
    const chainId = hexToDecimal(chain);
    if (!chainId) {
      continue;
    }

    const chainCapabilities = scopedProperties?.[`${EIP155_PREFIX}:${chainId}`];

    if (chainCapabilities) {
      const addressSpecificCapabilities =
        chainCapabilities?.[`${EIP155_PREFIX}:${chainId}:${address}`];

      // check for specific capabilities for the address
      if (addressSpecificCapabilities) {
        result[decimalToHex(chainId)] = addressSpecificCapabilities;
      } else {
        // remove all other address specific capabilities
        const chainSpecificCapabilities = filterCaip10AccountsFromObject(chainCapabilities);
        if (Object.keys(chainSpecificCapabilities).length > 0) {
          result[decimalToHex(chainId)] = chainSpecificCapabilities;
        }
      }
    }
  }

  return result;
};
