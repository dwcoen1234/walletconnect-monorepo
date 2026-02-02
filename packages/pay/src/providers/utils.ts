/**
 * Shared utilities for Pay providers
 */

import type {
  GetPaymentOptionsParams,
  GetRequiredPaymentActionsParams,
  ConfirmPaymentParams,
  PaymentOptionsResponse,
  ConfirmPaymentResponse,
  Action,
} from "../types/index.js";
import { PayError } from "../types/index.js";

/**
 * Build JSON request string for getPaymentOptions
 */
export function buildPaymentOptionsRequest(params: GetPaymentOptionsParams): string {
  return JSON.stringify({
    paymentLink: params.paymentLink,
    accounts: params.accounts,
    includePaymentInfo: params.includePaymentInfo ?? false,
  });
}

/**
 * Build JSON request string for getRequiredPaymentActions
 */
export function buildRequiredActionsRequest(params: GetRequiredPaymentActionsParams): string {
  return JSON.stringify({
    paymentId: params.paymentId,
    optionId: params.optionId,
  });
}

/**
 * Build JSON request string for confirmPayment
 */
export function buildConfirmPaymentRequest(params: ConfirmPaymentParams): string {
  return JSON.stringify({
    paymentId: params.paymentId,
    optionId: params.optionId,
    signatures: params.signatures,
    collectedData: params.collectedData,
  });
}

/**
 * Parse payment options response from JSON
 */
export function parsePaymentOptionsResponse(responseJson: string): PaymentOptionsResponse {
  return JSON.parse(responseJson) as PaymentOptionsResponse;
}

/**
 * Parse required actions response from JSON
 */
export function parseRequiredActionsResponse(responseJson: string): Action[] {
  return JSON.parse(responseJson) as Action[];
}

/**
 * Parse confirm payment response from JSON
 */
export function parseConfirmPaymentResponse(responseJson: string): ConfirmPaymentResponse {
  return JSON.parse(responseJson) as ConfirmPaymentResponse;
}

/**
 * Wrap provider errors with PayError
 */
export function wrapProviderError(error: unknown): never {
  throw PayError.fromNativeError(error);
}
