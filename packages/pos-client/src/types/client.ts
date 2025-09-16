import { EventEmitter } from "events";
import { IPOSClientEngine } from "./engine";

export declare namespace POSClientTypes {
  type Event =
    | "qr_ready"
    | "connection_rejected"
    | "connection_failed"
    | "connected"
    | "payment_requested"
    | "payment_rejected"
    | "payment_broadcasted"
    | "payment_failed"
    | "payment_successful"
    | "disconnected";

  interface EventArguments {
    qr_ready: { uri: string };
    connection_rejected: any;
    connection_failed: { error: { message: string; code: number } };
    connected: any;
    payment_requested: any;
    payment_rejected: any;
    payment_broadcasted: any;
    payment_failed: any;
    payment_successful: any;
    disconnected: any;
  }

  interface Options {
    projectId: string;
    deviceId: string;
    metadata: Metadata;
    storageOptions?: {
      databaseName: string;
    };
    loggerOptions?: {
      posLevel?: "info" | "debug" | "warn" | "error" | "silent";
      signLevel?: "info" | "debug" | "warn" | "error" | "silent";
    };
  }

  type Metadata = {
    merchantName: string;
    description: string;
    url: string;
    logoIcon: string;
  };

  type Network = {
    name: string;
    chainId: string;
  };

  type Token = {
    network: Network;
    symbol: string;
    standard: string;
    address: string;
  };

  type PaymentIntent = {
    token: Token;
    amount: string;
    recipient: string;
  };
}

export abstract class IPOSClient {
  public abstract readonly name: string;
  public abstract engine: IPOSClientEngine;
  public abstract events: EventEmitter;
  public abstract metadata: POSClientTypes.Metadata;

  constructor(public opts: POSClientTypes.Options) {}

  // ---------- Public Methods ----------------------------------------------- //

  public abstract setTokens: IPOSClientEngine["setTokens"];
  public abstract createPaymentIntent: IPOSClientEngine["createPaymentIntent"];
  public abstract restart: IPOSClientEngine["restart"];

  // ---------- Event Handlers ----------------------------------------------- //
  public abstract on: <E extends POSClientTypes.Event>(
    event: E,
    listener: (args: POSClientTypes.EventArguments[E]) => void,
  ) => EventEmitter;

  public abstract once: <E extends POSClientTypes.Event>(
    event: E,
    listener: (args: POSClientTypes.EventArguments[E]) => void,
  ) => EventEmitter;

  public abstract off: <E extends POSClientTypes.Event>(
    event: E,
    listener: (args: POSClientTypes.EventArguments[E]) => void,
  ) => EventEmitter;

  public abstract removeListener: <E extends POSClientTypes.Event>(
    event: E,
    listener: (args: POSClientTypes.EventArguments[E]) => void,
  ) => EventEmitter;
}
