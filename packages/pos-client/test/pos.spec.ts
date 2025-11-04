/* eslint-disable no-console */

import { expect, describe, it, beforeAll, afterEach } from "vitest";
import { Core } from "@walletconnect/core";
import { formatJsonRpcResult } from "@walletconnect/jsonrpc-utils";
import { parseUri } from "@walletconnect/utils";
import { SignClient } from "@walletconnect/sign-client";
import { ISignClient } from "@walletconnect/types";

import { POSClient, IPOSClient, POSClientTypes, RPC_ERROR_CODES } from "../src/index.js";
import { TEST_METADATA } from "./shared/values.js";
import { TEST_CORE_OPTIONS } from "./shared/index.js";

const connectSession = async ({
  pos,
  wallet,
  address,
}: {
  pos: IPOSClient;
  wallet: ISignClient;
  address: string;
}) => {
  await Promise.all([
    new Promise<void>((resolve) => {
      pos.once("qr_ready", async ({ uri }) => {
        await wallet.pair({ uri });
        resolve();
      });
    }),
    new Promise<void>((resolve) => {
      wallet.events.once("session_proposal", async (sessionProposal) => {
        const optionalNamespaces = sessionProposal.params.optionalNamespaces;
        await wallet.approve({
          id: sessionProposal.id,
          namespaces: Object.entries(optionalNamespaces).reduce((acc, [key, value]) => {
            acc[key] = {
              ...value,
              accounts: value.chains?.map((chain) => `${chain}:${address}`),
            };
            return acc;
          }, {}),
        });
        resolve();
      });
    }),
  ]);
};

describe("Sign Integration", () => {
  let wallet: ISignClient;
  let pos: IPOSClient;

  const projectId = TEST_CORE_OPTIONS.projectId;
  const deviceId = "test device id";
  const merchantName = "test merchant name";
  const url = "example.com";
  const description = "test description";
  const logoIcon = "https://example.com/logo.png";

  beforeAll(async () => {
    pos = await POSClient.init({
      projectId,
      deviceId,
      metadata: {
        merchantName,
        url,
        description,
        logoIcon,
      },
      loggerOptions: {
        posLevel: "error",
      },
    });
    wallet = await SignClient.init({
      core: new Core(TEST_CORE_OPTIONS),
      name: "wallet",
      metadata: TEST_METADATA,
    });
  });

  afterEach((meta) => {
    console.log(
      meta.task.name,
      meta.task.result?.state,
      meta.task.result?.state === "pass" ? "✅" : "❌",
    );
  });

  it("should initialize a POS client", async () => {
    expect(pos).to.exist;
    expect(pos.engine.signClient).to.exist;
    expect(pos.engine.signClient.core).to.exist;
    expect(pos.engine.signClient.core.projectId).to.be.equal(projectId);
    expect(pos.metadata.merchantName).to.be.equal(merchantName);
    expect(pos.metadata.url).to.be.equal(url);
    expect(pos.metadata.description).to.be.equal(description);
    expect(pos.metadata.logoIcon).to.be.equal(logoIcon);
  });

  it("should set tokens", async () => {
    const networks: Record<string, POSClientTypes.Network> = {
      ethereum: { name: "Ethereum", chainId: "eip155:1" },
      arbitrum: { name: "Arbitrum", chainId: "eip155:42161" },
      avalanche: { name: "Avalanche", chainId: "eip155:43114" },
    };
    const tokens: POSClientTypes.Token[] = [
      {
        network: networks.ethereum,
        symbol: "ETH",
        standard: "ERC20",
        address: "0x13A2Ff792037AA2cd77fE1f4B522921ac59a9C52",
      },
      {
        network: networks.arbitrum,
        symbol: "ARB",
        standard: "ERC20",
        address: "0x13A2Ff792037AA2cd77fE1f4B522921ac59a9C52",
      },
      {
        network: networks.avalanche,
        symbol: "AVAX",
        standard: "ERC20",
        address: "0x13A2Ff792037AA2cd77fE1f4B522921ac59a9C52",
      },
    ];
    await pos.setTokens({ tokens });

    expect(pos.engine.tokens).to.exist;
    expect(pos.engine.tokens.length).to.be.equal(tokens.length);
    expect(pos.engine.tokens).to.deep.equal(tokens);
    expect(pos.engine.tokens[0]).to.deep.equal(tokens[0]);
    expect(pos.engine.tokens[1]).to.deep.equal(tokens[1]);
    expect(pos.engine.tokens[2]).to.deep.equal(tokens[2]);
  });

  it("should reject tokens with invalid chainId", async () => {
    const networks: Record<string, POSClientTypes.Network> = {
      ethereum: { name: "Ethereum", chainId: "eip155" },
      arbitrum: { name: "Arbitrum", chainId: "42161" },
      avalanche: { name: "Avalanche", chainId: "43114" },
    };
    const tokens: POSClientTypes.Token[] = [
      {
        network: networks.ethereum,
        symbol: "ETH",
        standard: "ERC20",
        address: "0x13A2Ff792037AA2cd77fE1f4B522921ac59a9C52",
      },
      {
        network: networks.arbitrum,
        symbol: "ARB",
        standard: "ERC20",
        address: "0x13A2Ff792037AA2cd77fE1f4B522921ac59a9C52",
      },
      {
        network: networks.avalanche,
        symbol: "AVAX",
        standard: "ERC20",
        address: "0x13A2Ff792037AA2cd77fE1f4B522921ac59a9C52",
      },
    ];
    await expect(pos.setTokens({ tokens })).rejects.toThrow();
  });

  it("should reject tokens with unsupported namespace", async () => {
    const network: POSClientTypes.Network = { name: "something", chainId: "something" };
    const token: POSClientTypes.Token = {
      network,
      symbol: "SOL",
      standard: "SOL",
      address: "0x13A2Ff792037AA2cd77fE1f4B522921ac59a9C52",
    };
    await expect(pos.setTokens({ tokens: [token] })).rejects.toThrow();
  });

  it("should create a payment intent", async () => {
    const network: POSClientTypes.Network = { name: "Ethereum", chainId: "eip155:1" };
    const token: POSClientTypes.Token = {
      network,
      symbol: "ETH",
      standard: "ERC20",
      address: "0x13A2Ff792037AA2cd77fE1f4B522921ac59a9C52",
    };

    const paymentIntents: POSClientTypes.PaymentIntent[] = [
      {
        token,
        amount: "1",
        recipient: "0x13A2Ff792037AA2cd77fE1f4B522921ac59a9C52",
      },
    ];

    await Promise.all([
      new Promise<void>((resolve) => {
        pos.once("qr_ready", ({ uri }) => {
          // validate the uri
          parseUri(uri);
          resolve();
        });
      }),
      pos.createPaymentIntent({ paymentIntents }),
    ]);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  it("should reject payment intents with invalid amount", async () => {
    const network: POSClientTypes.Network = { name: "Ethereum", chainId: "eip155" };
    const token: POSClientTypes.Token = {
      network,
      symbol: "ETH",
      standard: "ERC20",
      address: "0x13A2Ff792037AA2cd77fE1f4B522921ac59a9C52",
    };

    const paymentIntents: POSClientTypes.PaymentIntent[] = [
      {
        token,
        amount: "",
        recipient: "0x13A2Ff792037AA2cd77fE1f4B522921ac59a9C52",
      },
    ];
    await expect(pos.createPaymentIntent({ paymentIntents })).rejects.toThrow();
  });

  it("should establish a session, prepare transaction, send to wallet, receive response and await confirmation", async () => {
    const tokenChainId = "eip155:8453";

    const paymentIntents: POSClientTypes.PaymentIntent[] = [
      {
        token: {
          network: { name: "Ethereum", chainId: tokenChainId },
          symbol: "USDC",
          standard: "ERC20",
          address: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`,
        },
        amount: "1",
        recipient: `${tokenChainId}:0x13A2Ff792037AA2cd77fE1f4B522921ac59a9C52`,
      },
    ];
    expect(pos.session).to.not.exist;
    await Promise.all([
      new Promise<void>((resolve) => {
        pos.once("payment_successful", () => {
          resolve();
        });
      }),
      new Promise<void>((resolve) => {
        pos.once("payment_requested", () => {
          resolve();
        });
      }),
      new Promise<void>((resolve) => {
        pos.once("payment_broadcasted", (result) => {
          resolve();
        });
      }),
      new Promise<void>((resolve) => {
        wallet.events.once("session_request", async (sessionRequest) => {
          await wallet.respond({
            topic: sessionRequest.topic,
            response: formatJsonRpcResult(
              sessionRequest.id,
              "0xff16b7197277088039a45f9e23ccbb32077ebeec1e56e49b24b2f3731e1bd452",
            ),
          });
          resolve();
        });
      }),
      new Promise<void>((resolve) => {
        wallet.events.once("session_proposal", async (sessionProposal) => {
          await wallet.approve({
            id: sessionProposal.id,
            namespaces: {
              eip155: {
                ...sessionProposal.params.optionalNamespaces.eip155,
                accounts: [`${tokenChainId}:0x13A2Ff792037AA2cd77fE1f4B522921ac59a9C52`],
              },
            },
          });
          resolve();
        });
      }),
      new Promise<void>((resolve) => {
        pos.once("connected", () => {
          resolve();
        });
      }),
      new Promise<void>((resolve) => {
        pos.once("qr_ready", async ({ uri }) => {
          await wallet.pair({ uri });
          resolve();
        });
      }),
      pos.createPaymentIntent({ paymentIntents }),
    ]);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    expect(pos.session).to.not.exist;
  });

  it("should reuse existing session to send multiple payments", async () => {
    await pos.disconnect();
    const tokenChainId = "eip155:8453";

    const paymentIntents: POSClientTypes.PaymentIntent[] = [
      {
        token: {
          network: { name: "Ethereum", chainId: tokenChainId },
          symbol: "USDC",
          standard: "ERC20",
          address: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`,
        },
        amount: "1",
        recipient: `${tokenChainId}:0x13A2Ff792037AA2cd77fE1f4B522921ac59a9C52`,
      },
    ];
    expect(pos.session).to.not.exist;
    let numPaymentSuccessful = 0;
    let numPaymentRequested = 0;
    let numPaymentBroadcasted = 0;
    let numConnected = 0;
    let numQrReady = 0;
    let numSessionRequest = 0;
    let numSessionProposal = 0;
    pos.on("payment_successful", () => {
      numPaymentSuccessful++;
    });
    pos.on("payment_requested", () => {
      numPaymentRequested++;
    });
    pos.on("payment_broadcasted", (result) => {
      numPaymentBroadcasted++;
    });
    pos.on("connected", () => {
      numConnected++;
    });
    pos.on("qr_ready", async ({ uri }) => {
      numQrReady++;
      await wallet.pair({ uri });
    });
    const onSessionRequest = async (sessionRequest) => {
      console.log("session request", numSessionRequest);
      numSessionRequest++;
      await wallet.respond({
        topic: sessionRequest.topic,
        response: formatJsonRpcResult(
          sessionRequest.id,
          "0xff16b7197277088039a45f9e23ccbb32077ebeec1e56e49b24b2f3731e1bd452",
        ),
      });
    };

    const onSessionProposal = async (sessionProposal) => {
      console.log("session proposal", numSessionProposal);
      numSessionProposal++;
      await wallet.approve({
        id: sessionProposal.id,
        namespaces: {
          eip155: {
            ...sessionProposal.params.optionalNamespaces.eip155,
            accounts: [`${tokenChainId}:0x13A2Ff792037AA2cd77fE1f4B522921ac59a9C52`],
          },
        },
      });
    };

    wallet.events.on("session_request", onSessionRequest);
    wallet.events.on("session_proposal", onSessionProposal);
    await pos.createPaymentIntent({ paymentIntents, manualControl: true });
    console.log("created payment intent 1");
    await pos.sendPaymentsToWallet();
    expect(pos.session).to.exist;
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await pos.createPaymentIntent({ paymentIntents, manualControl: true });
    await pos.sendPaymentsToWallet();
    await new Promise((resolve) => setTimeout(resolve, 5000));
    expect(pos.session).to.exist;

    wallet.events.off("session_request", onSessionRequest);
    wallet.events.off("session_proposal", onSessionProposal);

    expect(numSessionRequest).to.be.equal(2);
    expect(numPaymentSuccessful).to.be.equal(2);
    expect(numPaymentRequested).to.be.equal(2);
    expect(numPaymentBroadcasted).to.be.equal(2);
    expect(numConnected).to.be.equal(1);
    expect(numQrReady).to.be.equal(1);

    await pos.disconnect();
    expect(pos.session).to.not.exist;
  });

  it("should accept multiple payment intents, establish a session, prepare transactions, send all requests to wallet, receive responses and await confirmations", async () => {
    const evmChainId = "eip155:8453";
    const solanaChainId = "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp";

    const evmToken: POSClientTypes.Token = {
      network: { name: "Ethereum", chainId: evmChainId },
      symbol: "USDC",
      standard: "ERC20",
      address: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`,
    };
    const solanaToken: POSClientTypes.Token = {
      network: { name: "Solana", chainId: solanaChainId },
      symbol: "USDC",
      standard: "token",
      address: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`,
    };

    pos.setTokens({ tokens: [evmToken, solanaToken] });

    const paymentIntents: POSClientTypes.PaymentIntent[] = [
      {
        token: evmToken,
        amount: "1",
        recipient: `${evmChainId}:0x13A2Ff792037AA2cd77fE1f4B522921ac59a9C52`,
      },
      {
        token: solanaToken,
        amount: "1",
        recipient: `${solanaChainId}:4r33xEKAD2cNMrC9NyJy8nb4XmruUKebZ6LZZm65PVUZ`,
      },
    ];
    let numPaymentSuccessful = 0;
    let numPaymentRequested = 0;
    let numPaymentBroadcasted = 0;
    await Promise.all([
      new Promise<void>((resolve) => {
        pos.on("payment_successful", ({ transaction, result }) => {
          expect(transaction).to.exist;
          expect(result).to.exist;
          numPaymentSuccessful++;
          if (numPaymentSuccessful === paymentIntents.length) {
            resolve();
          }
        });
      }),
      new Promise<void>((resolve) => {
        pos.on("payment_requested", ({ paymentIntent, transaction }) => {
          expect(paymentIntent).to.exist;
          expect(transaction).to.exist;
          numPaymentRequested++;
          if (numPaymentRequested === paymentIntents.length) {
            resolve();
          }
        });
      }),
      new Promise<void>((resolve) => {
        pos.on("payment_broadcasted", ({ paymentIntent, transaction, result }) => {
          expect(paymentIntent).to.exist;
          expect(transaction).to.exist;
          expect(result).to.exist;
          numPaymentBroadcasted++;
          if (numPaymentBroadcasted === paymentIntents.length) {
            resolve();
          }
        });
      }),
      new Promise<void>((resolve) => {
        wallet.events.on("session_request", async (sessionRequest) => {
          if (sessionRequest.params.chainId === evmChainId) {
            await wallet.respond({
              topic: sessionRequest.topic,
              response: formatJsonRpcResult(
                sessionRequest.id,
                "0xff16b7197277088039a45f9e23ccbb32077ebeec1e56e49b24b2f3731e1bd452",
              ),
            });
          } else if (sessionRequest.params.chainId === solanaChainId) {
            await wallet.respond({
              topic: sessionRequest.topic,
              response: formatJsonRpcResult(sessionRequest.id, {
                signature:
                  "2P1voPUU3txxMXpdFqyX4ggEQcthsvimmnoRNJV2tdKM9iiE2mUjMzFjpX3SJKEJaFG5QXKGABG2AebRihUVYx6z",
              }),
            });
          }
          resolve();
        });
      }),
      new Promise<void>((resolve) => {
        wallet.events.once("session_proposal", async (sessionProposal) => {
          await wallet.approve({
            id: sessionProposal.id,
            namespaces: {
              eip155: {
                ...sessionProposal.params.optionalNamespaces.eip155,
                accounts: [`${evmChainId}:0x13A2Ff792037AA2cd77fE1f4B522921ac59a9C52`],
              },
              solana: {
                ...sessionProposal.params.optionalNamespaces.solana,
                accounts: [`${solanaChainId}:4r33xEKAD2cNMrC9NyJy8nb4XmruUKebZ6LZZm65PVUZ`],
              },
            },
          });
          resolve();
        });
      }),
      new Promise<void>((resolve) => {
        pos.once("connected", ({ session }) => {
          expect(session).to.exist;
          const walletSession = wallet.session.get(session.topic);
          expect(walletSession).to.exist;
          expect(walletSession.topic).to.be.equal(session.topic);
          expect(walletSession.pairingTopic).to.be.equal(session.pairingTopic);
          resolve();
        });
      }),
      new Promise<void>((resolve) => {
        pos.once("qr_ready", async ({ uri }) => {
          await wallet.pair({ uri });
          resolve();
        });
      }),
      pos.createPaymentIntent({ paymentIntents }),
    ]);
    expect(paymentIntents.length).to.be.greaterThan(0);
    expect(numPaymentSuccessful).to.be.equal(paymentIntents.length);
    expect(numPaymentRequested).to.be.equal(paymentIntents.length);
    expect(numPaymentBroadcasted).to.be.equal(paymentIntents.length);
  });

  it("should initiate a new session when the existing one doesn't satisfy the payment intents chains", async () => {
    expect(pos.session).to.exist;
    expect(pos.session?.namespaces.bip122).does.not.exist;
    const bip122 = "bip122:000000000019d6689c085ae165831e93";
    pos.engine.supportedNamespaces.push({
      name: "bip122",
      assetNamespaces: ["bip122"],
      capabilities: null,
      events: [],
      methods: ["bip122_signTransaction"],
    });

    const bip122Token: POSClientTypes.Token = {
      network: { name: "BIP122", chainId: bip122 },
      symbol: "BIP122",
      standard: "bip122",
      address: `0x2`,
    };

    await pos.setTokens({ tokens: [bip122Token] });

    const paymentIntents: POSClientTypes.PaymentIntent[] = [
      {
        token: bip122Token,
        amount: "1",
        recipient: `${bip122}:0x1`,
      },
    ];
    await Promise.all([
      connectSession({ pos, wallet, address: `0x1` }),
      pos.createPaymentIntent({ paymentIntents, manualControl: true }),
    ]);
    await pos.disconnect();
  });

  it("should set tokens with invalid address", async () => {
    const networks: Record<string, POSClientTypes.Network> = {
      ethereum: { name: "Ethereum", chainId: "eip155:1" },
      arbitrum: { name: "Arbitrum", chainId: "eip155:42161" },
      avalanche: { name: "Avalanche", chainId: "eip155:43114" },
    };
    const tokens: POSClientTypes.Token[] = [
      {
        network: networks.ethereum,
        symbol: "ETH",
        standard: "ERC20",
        address: "0x13A2Ff792037AA2cd77fE1f4B522921ac59a9C52",
      },
      {
        network: networks.arbitrum,
        symbol: "ARB",
        standard: "ERC20",
        address: "0x13A2Ff792037AA2cd77fE1f4B522921ac59a9C52",
      },
      {
        network: networks.avalanche,
        symbol: "AVAX",
        standard: "ERC20",
        address: "0x13A2Ff792037AA2cd77fE1f4B522921ac59a9C52",
      },
    ];
    const paymentIntents: POSClientTypes.PaymentIntent[] = [
      {
        token: tokens[0],
        amount: "1",
        recipient: "0x13A2Ff792037AA2cd77fE1f4B522921ac59a9C52",
      },
    ];
    await pos.setTokens({ tokens });

    await Promise.all([
      new Promise<void>((resolve) => {
        pos.on("payment_failed", (result) => {
          expect(result.error?.code).to.be.equal(-18902);
          resolve();
        });
      }),
      connectSession({
        pos,
        wallet,
        address: `0x13A2Ff792037AA2cd77fE1f4B522921ac59a9C52`,
      }),
      pos.createPaymentIntent({ paymentIntents, manualControl: true }),
    ]);
    await new Promise((resolve) => setTimeout(resolve, 2000));
  });

  it("should establish a session, prepare transaction, send to wallet, receive response and await confirmation - manual control", async () => {
    // @ts-expect-error - testing private property
    expect(pos.engine.manualControl).to.be.false;
    const tokenChainId = "eip155:8453";

    const paymentIntents: POSClientTypes.PaymentIntent[] = [
      {
        token: {
          network: { name: "Ethereum", chainId: tokenChainId },
          symbol: "USDC",
          standard: "ERC20",
          address: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`,
        },
        amount: "1",
        recipient: `${tokenChainId}:0x13A2Ff792037AA2cd77fE1f4B522921ac59a9C52`,
      },
    ];

    await Promise.all([
      new Promise<void>((resolve) => {
        pos.once("payment_successful", () => {
          resolve();
        });
      }),
      new Promise<void>((resolve) => {
        pos.once("payment_requested", () => {
          resolve();
        });
      }),
      new Promise<void>((resolve) => {
        pos.once("payment_broadcasted", (result) => {
          resolve();
        });
      }),
      new Promise<void>((resolve) => {
        wallet.events.once("session_request", async (sessionRequest) => {
          await wallet.respond({
            topic: sessionRequest.topic,
            response: formatJsonRpcResult(
              sessionRequest.id,
              "0xff16b7197277088039a45f9e23ccbb32077ebeec1e56e49b24b2f3731e1bd452",
            ),
          });
          resolve();
        });
      }),
      new Promise<void>((resolve) => {
        wallet.events.once("session_proposal", async (sessionProposal) => {
          await wallet.approve({
            id: sessionProposal.id,
            namespaces: {
              eip155: {
                ...sessionProposal.params.optionalNamespaces.eip155,
                accounts: [`${tokenChainId}:0x13A2Ff792037AA2cd77fE1f4B522921ac59a9C52`],
              },
            },
          });
          resolve();
        });
      }),
      new Promise<void>((resolve) => {
        pos.once("connected", async ({ session }) => {
          expect(session).to.exist;
          await pos.sendPaymentsToWallet();
          resolve();
        });
      }),
      new Promise<void>((resolve) => {
        pos.once("qr_ready", async ({ uri }) => {
          await wallet.pair({ uri });
          resolve();
        });
      }),
      pos.createPaymentIntent({ paymentIntents, manualControl: true }),
    ]);
    // @ts-expect-error - testing private property
    await pos.engine.cleanup();
  });
  it("should create payment intent with manual control", async () => {
    const paymentIntents: POSClientTypes.PaymentIntent[] = [
      {
        token: {
          network: { name: "Ethereum", chainId: "eip155:8453" },
          symbol: "USDC",
          standard: "ERC20",
          address: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`,
        },
        amount: "1",
        recipient: `eip155:8453:0x13A2Ff792037AA2cd77fE1f4B522921ac59a9C52`,
      },
    ];
    // @ts-expect-error - testing private property
    expect(pos.engine.manualControl).to.be.false;
    await pos.createPaymentIntent({ paymentIntents, manualControl: true });
    // @ts-expect-error - testing private property
    expect(pos.engine.manualControl).to.be.true;
  });

  it("should reject multiple calls to send payments to wallet", async () => {
    // @ts-expect-error - testing private property
    pos.engine.paymentsSendingInProgress = true;
    await expect(pos.sendPaymentsToWallet()).rejects.toThrow();
    // @ts-expect-error - testing private property
    pos.engine.paymentsSendingInProgress = false;
  });
});
