/* eslint-disable no-console */

import { expect, describe, it, beforeAll } from "vitest";
import { Core } from "@walletconnect/core";
import { formatJsonRpcResult } from "@walletconnect/jsonrpc-utils";
import { parseUri } from "@walletconnect/utils";
import { SignClient } from "@walletconnect/sign-client";
import { ISignClient } from "@walletconnect/types";

import { POSClient, IPOSClient, POSClientTypes } from "../src";
import { TEST_METADATA } from "./shared/values";
import { TEST_CORE_OPTIONS } from "./shared";

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
    });
    wallet = await SignClient.init({
      core: new Core(TEST_CORE_OPTIONS),
      name: "wallet",
      metadata: TEST_METADATA,
    });
  });

  it("should initialize a POS client", async () => {
    expect(pos).to.be.exist;
    expect(pos.engine.signClient).to.be.exist;
    expect(pos.engine.signClient.core).to.be.exist;
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

    expect(pos.engine.tokens).to.be.exist;
    expect(pos.engine.tokens.length).to.be.equal(Object.keys(tokens).length);
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
    await new Promise((resolve) => setTimeout(resolve, 1000));
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

    await Promise.all([
      new Promise<void>((resolve) => {
        pos.once("payment_successful", () => {
          console.log("payment_successful");
          resolve();
        });
      }),
      new Promise<void>((resolve) => {
        pos.once("payment_requested", () => {
          console.log("payment_requested");
          resolve();
        });
      }),
      new Promise<void>((resolve) => {
        pos.once("payment_broadcasted", ({ result }) => {
          console.log("payment_broadcasted", JSON.stringify(result, null, 2));
          resolve();
        });
      }),
      new Promise<void>((resolve) => {
        wallet.events.once("session_request", async (sessionRequest) => {
          console.log("session_request", JSON.stringify(sessionRequest, null, 2));
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
          console.log("session_proposal", JSON.stringify(sessionProposal, null, 2));
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
          console.log("connected");
          resolve();
        });
      }),
      new Promise<void>((resolve) => {
        pos.once("qr_ready", async ({ uri }) => {
          console.log("qr_ready", uri);
          await wallet.pair({ uri });
          resolve();
        });
      }),
      pos.createPaymentIntent({ paymentIntents }),
    ]);
  });
});
