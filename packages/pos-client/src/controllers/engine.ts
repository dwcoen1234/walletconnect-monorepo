import { SignClient } from "@walletconnect/sign-client";
import { ISignClient, ProposalTypes } from "@walletconnect/types";
import { payloadId } from "@walletconnect/jsonrpc-utils";
import { parseChainId } from "@walletconnect/utils";
import { pino } from "@walletconnect/logger";

import { IPOSClientEngine, POSClientEngineTypes, POSClientTypes, UtilsTypes } from "../types";
import { isValidPaymentIntent, isValidToken } from "../utils";
import { DEFAULT_NAMESPACES } from "../constants/chains";
import {
  CLIENT_STORAGE_OPTIONS,
  MAX_TRANSACTION_STATUS_CHECKS,
  POS_CLIENT_VERSION,
} from "../constants";

export class Engine extends IPOSClientEngine {
  public signClient: ISignClient;

  public tokens: POSClientTypes.Token[] = [];

  // map to keep track of pending payment intents
  private paymentIntentsMap: Map<number, POSClientTypes.PaymentIntent[]> = new Map();
  // map to keep track of payment intents with their transaction ids
  private paymentIntentToTransactionsMap: Map<number, POSClientEngineTypes.Transaction[]> =
    new Map();

  private supportedNamespaces: UtilsTypes.SupportedNamespaces = DEFAULT_NAMESPACES;
  private logger: pino.Logger;

  constructor(client: IPOSClientEngine["client"]) {
    super(client);
    // initialized in init()
    this.signClient = {} as any;
    this.logger = pino({ name: this.client.name, level: this.client.opts.loggerOptions?.posLevel });
    this.setupEventHandlers();
  }

  public init = async () => {
    this.signClient = await SignClient.init({
      projectId: this.client.opts.projectId,
      metadata: {
        name: this.client.metadata.merchantName,
        description: this.client.metadata.description,
        url: this.client.metadata.url,
        icons: [this.client.metadata.logoIcon],
      },
      storageOptions: {
        database: this.client.opts.storageOptions?.databaseName || CLIENT_STORAGE_OPTIONS.database,
      },
      logger: this.client.opts.loggerOptions?.signLevel,
    });

    try {
      this.logger.debug("Fetching supported namespaces/networks");
      const supportedNamespaces =
        await this.fetchRpcRequest<POSClientEngineTypes.RPCSupportedNetworksResult>(
          JSON.stringify({
            id: payloadId(),
            jsonrpc: "2.0",
            method: "wc_pos_supportedNetworks",
            params: {},
          }),
        );
      this.logger.debug("Received supported namespaces/networks", {
        supportedNamespaces: supportedNamespaces.result.namespaces,
      });
      this.supportedNamespaces = supportedNamespaces.result.namespaces;
    } catch (error) {
      this.logger.error("Failed to fetch supported namespaces/networks", error);
    }
  };

  public setTokens: IPOSClientEngine["setTokens"] = async (params) => {
    const { tokens } = params;
    this.logger.debug("Setting tokens", { tokens });
    tokens.forEach((token) => {
      if (!isValidToken({ token, supportedNamespaces: this.supportedNamespaces })) {
        throw new Error(`Invalid token: ${JSON.stringify(token)}`);
      }
    });
    await new Promise<void>((resolve) => {
      this.tokens = tokens;
      resolve();
    });

    this.logger.debug("Tokens set", { tokens });
  };

  public createPaymentIntent: IPOSClientEngine["createPaymentIntent"] = async (params) => {
    const { paymentIntents } = params;
    this.logger.debug("Creating payment intent", { paymentIntents });

    if (paymentIntents.length === 0) {
      throw new Error("No payment intents provided");
    }

    paymentIntents.forEach((paymentIntent) => {
      if (!isValidPaymentIntent({ paymentIntent, supportedNamespaces: this.supportedNamespaces })) {
        throw new Error(`Invalid payment intent: ${JSON.stringify(paymentIntent)}`);
      }
    });
    this.logger.debug("Payment intent validation success", { paymentIntents });
    const namespaces = this.composeNamespaces(paymentIntents);
    const { uri, approval } = await this.signClient.connect({
      optionalNamespaces: namespaces,
    });
    this.logger.debug("Connected to the WalletConnect network", { uri });
    if (!uri) {
      this.client.events.emit("connection_failed", {
        error: {
          message: "Failed to connect to the WalletConnect network",
          code: 4001,
        },
      });
      throw new Error("Failed to connect to the WalletConnect network");
    }
    const intentId = payloadId();
    this.paymentIntentsMap.set(intentId, paymentIntents);
    this.logger.debug("Payment intents map set", { intentId, paymentIntents });
    this.emit("await_approval", { approval, intentId });
    this.logger.debug("Emitted await_approval event", { intentId });
    this.emit("qr_ready", { uri });
    this.logger.debug("Emitted qr_ready event", { uri });
  };

  public restart: IPOSClientEngine["restart"] = async (params) => {
    this.logger.debug("Restarting", { params });
    if (params?.reinit) {
      this.tokens = [];
      this.paymentIntentsMap.clear();
      this.paymentIntentToTransactionsMap.clear();
      this.logger.debug(
        "Restarted: Cleared payment intents map and payment intent to transactions map",
      );
      return;
    }
    // restart the payment intent flow from the beginning
    const paymentIntents = Array.from(this.paymentIntentsMap.values()).flat();
    await this.createPaymentIntent({ paymentIntents });
    this.logger.debug("Restarted: Created payment intent flow from the beginning", {
      paymentIntents,
    });
  };

  // ---------- Event Handlers ----------------------------------------------- //

  public emit: IPOSClientEngine["emit"] = (event, args) => {
    this.logger.debug("Emit", { event, args });
    return this.client.events.emit(event, args);
  };

  public on: IPOSClientEngine["on"] = (event, listener) => {
    this.logger.debug("On", { event, listener });
    return this.client.events.on(event, listener);
  };

  public once: IPOSClientEngine["once"] = (event, listener) => {
    this.logger.debug("Once", { event, listener });
    return this.client.events.once(event, listener);
  };

  public off: IPOSClientEngine["off"] = (event, listener) => {
    this.logger.debug("Off", { event, listener });
    return this.client.events.off(event, listener);
  };

  public removeListener: IPOSClientEngine["removeListener"] = (event, listener) => {
    this.logger.debug("Remove listener", { event, listener });
    return this.client.events.removeListener(event, listener);
  };

  // ---------- Private ----------------------------------------------- //

  private composeNamespaces(
    paymentIntents: POSClientTypes.PaymentIntent[],
  ): ProposalTypes.OptionalNamespaces {
    this.logger.debug("Composing namespaces", { paymentIntents });
    const namespaces: ProposalTypes.OptionalNamespaces = {};
    paymentIntents.forEach((paymentIntent) => {
      const {
        token: { network },
      } = paymentIntent;
      const { namespace } = parseChainId(network.chainId);
      const namespaceDetails = this.supportedNamespaces.find((ns) => ns.name === namespace);
      if (!namespaceDetails) {
        throw new Error(`Namespace not supported: ${namespace}`);
      }

      namespaces[namespace] = {
        methods: namespaceDetails.methods,
        chains: [...(namespaces[namespace]?.chains || []), network.chainId],
        events: namespaceDetails.events,
      };
    });
    this.logger.debug("Composed namespaces", { namespaces });
    return namespaces;
  }

  prepareTransactionsFromPaymentIntents: IPOSClientEngine["prepareTransactionsFromPaymentIntents"] =
    async (params) => {
      this.logger.debug("Preparing transactions from payment intents", {
        intentId: params.intentId,
        sessionTopic: params.session.topic,
      });
      const { intentId, session } = params;
      const paymentIntents = this.paymentIntentsMap.get(intentId);
      if (!paymentIntents) {
        throw new Error(`Payment intents not found for id: ${intentId}`);
      }

      const intents: POSClientEngineTypes.RPCPaymentIntent[] = [];
      for (const paymentIntent of paymentIntents) {
        const { token, amount, recipient } = paymentIntent;
        const { namespace } = parseChainId(token.network.chainId);
        // gets the first address that matches the token network chain id
        const account = session.namespaces[namespace].accounts.find((account) =>
          account.includes(`${token.network.chainId}:`),
        );
        if (!account) {
          throw new Error(
            `Address not found in session for chain id: ${
              token.network.chainId
            }, approved addresses: ${session.namespaces[namespace].accounts.join(", ")}`,
          );
        }

        intents.push({
          asset: `${token.network.chainId}/${token.standard.toLowerCase()}:${token.address}`,
          recipient,
          amount,
          sender: account,
        });
      }

      this.logger.debug("Prepared transactions from payment intents", {
        intentId: params.intentId,
        sessionTopic: params.session.topic,
        transactions: intents,
      });

      const payload = {
        id: payloadId(),
        jsonrpc: "2.0",
        method: "wc_pos_buildTransactions",
        params: {
          paymentIntents: intents,
        },
      };

      this.logger.debug("Fetching wc_pos_buildTransactions", { payload });
      const response = await this.fetchRpcRequest<POSClientEngineTypes.RPCTransactions>(
        JSON.stringify(payload),
      );
      this.logger.debug("Received wc_pos_buildTransactions", { response });
      const transactions = response.result.transactions;
      this.paymentIntentToTransactionsMap.set(intentId, transactions);
      this.logger.debug("Payment intent to transactions map set", {
        intentId: params.intentId,
        transactions,
      });
      return transactions;
    };

  onSessionConnected: IPOSClientEngine["onSessionConnected"] = async (params) => {
    const { intentId, session } = params;
    this.logger.debug("On session connected", { intentId, sessionTopic: session.topic });
    this.emit("connected", {});
    this.logger.debug("Emitted connected event");
    const transactions = await this.prepareTransactionsFromPaymentIntents({ intentId, session });
    this.logger.debug("Transactions prepared", { transactions });
    this.sendTransactionsToWallet({ transactions, session, intentId });
  };

  sendTransactionsToWallet: IPOSClientEngine["sendTransactionsToWallet"] = async (params) => {
    const { transactions, session, intentId } = params;
    this.logger.debug("Sending transactions to wallet", {
      transactions,
      sessionTopic: session.topic,
      intentId,
    });
    const paymentIntents = this.paymentIntentsMap.get(intentId);
    if (!paymentIntents) {
      throw new Error(`Payment intents not found for id: ${intentId}`);
    }
    for (let i = 0; i < transactions.length; i++) {
      const transaction = transactions[i];
      const paymentIntent = paymentIntents[i];
      try {
        this.emit("payment_requested", {});
        this.logger.debug("Emitted payment_requested event", {
          transactionId: transaction.id,
        });
        let result;
        try {
          result = await this.signClient.request({
            topic: session.topic,
            request: {
              method: transaction.method,
              params: transaction.params,
            },
            chainId: transaction.chainId,
          });
          this.logger.debug("Wallet responded to payment request", {
            transactionId: transaction.id,
            result,
          });
        } catch (error) {
          this.logger.error("error", error);
          this.emit("payment_rejected", {
            error: {
              message: (error as Error)?.message,
              code: 4001,
            },
            paymentIntent,
          });
          throw error;
        }
        this.emit("payment_broadcasted", result);
        this.logger.debug("Emitted payment_broadcasted event", {
          transactionId: transaction.id,
        });
        this.awaitPaymentConfirmed({ transactionId: transaction.id, result });
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        this.logger.error("error", error);
      }
    }
  };

  awaitPaymentConfirmed: IPOSClientEngine["awaitPaymentConfirmed"] = async (params) => {
    try {
      const { transactionId, result } = params;
      this.logger.debug("Awaiting payment confirmed", { transactionId, result });
      const payload = {
        id: payloadId(),
        jsonrpc: "2.0",
        method: "wc_pos_checkTransaction",
        params: {
          id: transactionId,
          sendResult: typeof result === "string" ? result : JSON.stringify(result),
        },
      };

      let numCheckAttempts = 0;
      let transactionResult;
      while (!transactionResult) {
        if (numCheckAttempts >= MAX_TRANSACTION_STATUS_CHECKS) {
          throw new Error(`Transaction status not found for id: ${transactionId}`);
        }
        numCheckAttempts++;

        const response = await this.fetchRpcRequest<POSClientEngineTypes.RPCCheckTransactionResult>(
          JSON.stringify(payload),
        );
        this.logger.debug("Received wc_pos_checkTransaction", { transactionId, response });
        if (response.result.status === "CONFIRMED") {
          this.logger.debug("Transaction status confirmed", { response });
          this.emit("payment_successful", {
            transaction: result,
          });
          transactionResult = response.result;
          break;
        } else if (response.result.status === "FAILED") {
          this.logger.debug("Transaction failed", { response });
          this.emit("payment_failed", {
            error: {
              message: response.result.error,
              code: 4001,
            },
            transaction: result,
          });
          transactionResult = response.result;
          break;
        } else if (response.result.status === "PENDING") {
          this.logger.debug("Transaction pending", { response });
          await new Promise((resolve) => setTimeout(resolve, response.result.checkIn || 1000));
        }
      }
    } catch (error) {
      this.logger.error("Error while awaiting payment confirmations", error);
    }
  };

  private setupEventHandlers = () => {
    this.on("await_approval", async ({ approval, intentId }) => {
      try {
        this.logger.debug("On await_approval", { intentId });
        const session = await approval();
        this.onSessionConnected({ intentId, session });
      } catch (error) {
        this.logger.error("Error while awaiting approval", error);
        this.emit("connection_rejected", {
          error: {
            message: (error as Error)?.message,
            code: 4001,
          },
        });
      }
    });
  };

  private fetchRpcRequest = async <T>(payload: string): Promise<T> => {
    this.logger.debug("Fetching RPC request", { url: this.getRpcUrl(), payload });
    const result = await fetch(this.getRpcUrl(), {
      method: "POST",
      body: payload,
    });

    if (!result.ok) {
      throw new Error(`Failed to fetch RPC request: ${result.statusText}`);
    }

    const data = await result.json();

    this.logger.debug("Received RPC request response", { data });

    if (data.error) {
      this.emit("payment_failed", {
        error: {
          message: data.error?.message,
          code: 4001,
        },
        transaction: "",
      });
      throw new Error(`Failed to fetch RPC request: ${data.error?.message}`);
    }
    return data as T;
  };

  private getRpcUrl = () => {
    return `https://rpc.walletconnect.org/v1/json-rpc?projectId=${this.client.opts.projectId}&st=node&sv=js-pos-${POS_CLIENT_VERSION}`;
  };
}
