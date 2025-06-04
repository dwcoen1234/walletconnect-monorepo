import { AuthTypes } from "@walletconnect/types";
import { describe, expect, it } from "vitest";
import {
  extractSolanaTransactionId,
  getNearTransactionIdFromSignedTransaction,
  getSuiDigest,
  isValidEip191Signature,
  verifySignature,
} from "../src";

describe("utils/signature", () => {
  describe("EIP-1271 signatures", () => {
    const chainId = "eip155:1";
    const projectId = process.env.TEST_PROJECT_ID!;
    const address = "0x2faf83c542b68f1b4cdc0e770e8cb9f567b08f71";
    const reconstructedMessage = `localhost wants you to sign in with your Ethereum account:
0x2faf83c542b68f1b4cdc0e770e8cb9f567b08f71

URI: http://localhost:3000/
Version: 1
Chain ID: 1
Nonce: 1665443015700
Issued At: 2022-10-10T23:03:35.700Z
Expiration Time: 2022-10-11T23:03:35.700Z`;

    it("passes for a valid signature", async () => {
      const cacaoSignature: AuthTypes.CacaoSignature = {
        t: "eip1271",
        s: "0xc1505719b2504095116db01baaf276361efd3a73c28cf8cc28dabefa945b8d536011289ac0a3b048600c1e692ff173ca944246cf7ceb319ac2262d27b395c82b1c",
      };

      const isValid = await verifySignature(
        address,
        reconstructedMessage,
        cacaoSignature,
        chainId,
        projectId,
      );
      expect(isValid).to.be.true;
    });
    it("fails for a bad signature", async () => {
      const cacaoSignature: AuthTypes.CacaoSignature = {
        t: "eip1271",
        s: "0xdead5719b2504095116db01baaf276361efd3a73c28cf8cc28dabefa945b8d536011289ac0a3b048600c1e692ff173ca944246cf7ceb319ac2262d27b395c82b1c",
      };

      const isValid = await verifySignature(
        address,
        reconstructedMessage,
        cacaoSignature,
        chainId,
        projectId,
      );
      expect(isValid).toBe(false);
    });
    it("fails for a bad chainid", async () => {
      const cacaoSignature: AuthTypes.CacaoSignature = {
        t: "eip1271",
        s: "0xdead5719b2504095116db01baaf276361efd3a73c28cf8cc28dabefa945b8d536011289ac0a3b048600c1e692ff173ca944246cf7ceb319ac2262d27b395c82b1c",
      };
      const invalidChainIdOne = "1";
      await expect(
        verifySignature(
          address,
          reconstructedMessage,
          cacaoSignature,
          invalidChainIdOne,
          projectId,
        ),
      ).rejects.toThrow(
        `isValidEip1271Signature failed: chainId must be in CAIP-2 format, received: ${invalidChainIdOne}`,
      );
      const invalidChainIdTwo = ":1";
      await expect(
        verifySignature(
          address,
          reconstructedMessage,
          cacaoSignature,
          invalidChainIdTwo,
          projectId,
        ),
      ).rejects.toThrow(
        `isValidEip1271Signature failed: chainId must be in CAIP-2 format, received: ${invalidChainIdTwo}`,
      );
      const invalidChainIdThree = "1:";
      await expect(
        verifySignature(
          address,
          reconstructedMessage,
          cacaoSignature,
          invalidChainIdThree,
          projectId,
        ),
      ).rejects.toThrow(
        `isValidEip1271Signature failed: chainId must be in CAIP-2 format, received: ${invalidChainIdThree}`,
      );
    });
  });
  describe("EIP-191 signatures", () => {
    it("should validate a valid signature", async () => {
      const address = "0x13A2Ff792037AA2cd77fE1f4B522921ac59a9C52";
      const message = `Hello AppKit!`;
      const signature =
        "0xd7ec09eb8ecb1ba9af45380e14d3ef1a1ec2376e0adfc0a9b591e7c3519a00d702cbe063aa55ff681265eed2d1646a217f0bf23f12ab4cd326455ab4134e12691b";
      const isValid = await isValidEip191Signature(address, message, signature);
      expect(isValid).toBe(true);
    });
    it("should fail to validate an invalid signature", async () => {
      const address = "0x13A2Ff792037AA2cd77fE1f4B522921ac59a9C52";
      const message = `Hello AppKit!`;
      const signature = "0xd7ec09eb8ecb1ba9af45380e14d3ef1a1ec2376e0adfc0a9b591e";
      await expect(isValidEip191Signature(address, message, signature)).rejects.toThrow();
    });
    it("should fail to validate a valid signature with wrong address", async () => {
      const address = "0x13A2Ff792037AA2cd77fE1f4B522921ac59a9C54";
      const message = `Hello AppKit!`;
      const signature = "0xd7ec09eb8ecb1ba9af45380e14d3ef1a1ec2376e0adfc0a9b591e";
      await expect(isValidEip191Signature(address, message, signature)).rejects.toThrow();
    });
    it("should fail to validate an valid signature with wrong message", async () => {
      const address = "0x13A2Ff792037AA2cd77fE1f4B522921ac59a9C52";
      const message = `Hello AppKit! 0xyadayada`;
      const signature = "0xd7ec09eb8ecb1ba9af45380e14d3ef1a1ec2376e0adfc0a9b591e";
      await expect(isValidEip191Signature(address, message, signature)).rejects.toThrow();
    });
  });
  describe("tvf", () => {
    it("should extract the transaction id from a solana transaction", () => {
      const transaction =
        "AeJw688VKMWEeOHsYhe03By/2rqJHTQeq6W4L1ZLdbT2l/Nim8ctL3erMyH9IWPsQP73uaarRmiVfanEJHx7uQ4BAAIDb3ObYkq6BFd46JrMFy1h0Q+dGmyRGtpelqTKkIg82isAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMGRm/lIRcy/+ytunLDm+e8jOW7xfcSayxDmzpAAAAAtIy17v5fs39LuoitzpBhVrg8ZIQF/3ih1N9dQ+X3shEDAgAFAlgCAAABAgAADAIAAACghgEAAAAAAAIACQMjTgAAAAAAAA==";
      const expectedTransactionId =
        "5XanD5KnkqzH3RjyqHzPCSRrNXYW2ADH4bge4oMi9KnDBrkFvugagH3LytFZFmBhZEEcyxPsZqeyF4cgLpEXVFR7";
      const transactionId = extractSolanaTransactionId(transaction);
      expect(transactionId).toBe(expectedTransactionId);
    });
    it("should fail to extract the transaction id from an invalid solana transaction", () => {
      const transaction =
        "+dGmyRGtpelqTKkIg82isAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMGRm/lIRcy/+ytunLDm+e8jOW7xfcSayxDmzpAAAAAtIy17v5fs39LuoitzpBhVrg8ZIQF/3ih1N9dQ+X3shEDAgAFAlgCAAABAgAADAIAAACghgEAAAAAAAIACQMjTgAAAAAAAA==";
      expect(() => extractSolanaTransactionId(transaction)).to.throw();
    });
    it("should extract the digest from a sui transaction", () => {
      const expectedDigest = "C98G1Uwh5soPMtZZmjUFwbVzWLMoAHzi5jrX2BtABe8v";
      const base64Tx =
        "AAACAAhkAAAAAAAAAAAg1fZH7bd9T9ox0DBFBkR/s8kuVar3e8XtS3fDMt1GBfoCAgABAQAAAQEDAAAAAAEBANX2R+23fU/aMdAwRQZEf7PJLlWq93vF7Ut3wzLdRgX6At/pRJzj2VpZgqXpSvEtd3GzPvt99hR8e/yOCGz/8nbRmA7QFAAAAAAgBy5vStJizn76LmJTBlDiONdR/2rSuzzS4L+Tp/Zs4hZ8cBxYkcSlxBD6QXvgS11E6d+DNek8LiA/beba6iH3l5gO0BQAAAAAIMpdmZjiqJ5GG9di1MAgD4S3uRr2gaMC7S1WsaeBwNIx1fZH7bd9T9ox0DBFBkR/s8kuVar3e8XtS3fDMt1GBfroAwAAAAAAAECrPAAAAAAAAA==";
      const digest = getSuiDigest(base64Tx);
      expect(digest).toBe(expectedDigest);
    });
    it("should extract the transaction hash from a near signed transaction bytes", () => {
      const signedTransaction = new Uint8Array([
        16, 0, 0, 0, 48, 120, 103, 97, 110, 99, 104, 111, 46, 116, 101, 115, 116, 110, 101, 116, 0,
        243, 74, 204, 31, 29, 80, 146, 149, 102, 175, 8, 83, 231, 187, 5, 120, 41, 115, 247, 22,
        197, 120, 182, 242, 120, 135, 73, 137, 166, 246, 171, 103, 77, 243, 34, 42, 212, 180, 0, 0,
        16, 0, 0, 0, 48, 120, 103, 97, 110, 99, 104, 111, 46, 116, 101, 115, 116, 110, 101, 116, 5,
        233, 95, 227, 45, 10, 101, 176, 111, 124, 190, 86, 106, 27, 143, 54, 148, 125, 132, 252, 25,
        71, 125, 78, 60, 242, 100, 219, 40, 168, 65, 3, 1, 0, 0, 0, 3, 0, 0, 0, 161, 237, 204, 206,
        27, 194, 211, 0, 0, 0, 0, 0, 0,
      ]);

      const expectedTransactionId = "EpHx79wKAn6br4G9aKaCGLpdzNc8YjrthiFonXQgskAx";
      const transactionId = getNearTransactionIdFromSignedTransaction(signedTransaction);
      expect(transactionId).toBe(expectedTransactionId);
    });

    it("should extract the transaction hash from a near signed transaction stringified bytes", () => {
      const signedTransaction = {
        0: 16,
        1: 0,
        2: 0,
        3: 0,
        4: 48,
        5: 120,
        6: 103,
        7: 97,
        8: 110,
        9: 99,
        10: 104,
        11: 111,
        12: 46,
        13: 116,
        14: 101,
        15: 115,
        16: 116,
        17: 110,
        18: 101,
        19: 116,
        20: 0,
        21: 243,
        22: 74,
        23: 204,
        24: 31,
        25: 29,
        26: 80,
        27: 146,
        28: 149,
        29: 102,
        30: 175,
        31: 8,
        32: 83,
        33: 231,
        34: 187,
        35: 5,
        36: 120,
        37: 41,
        38: 115,
        39: 247,
        40: 22,
        41: 197,
        42: 120,
        43: 182,
        44: 242,
        45: 120,
        46: 135,
        47: 73,
        48: 137,
        49: 166,
        50: 246,
        51: 171,
        52: 103,
        53: 77,
        54: 243,
        55: 34,
        56: 42,
        57: 212,
        58: 180,
        59: 0,
        60: 0,
        61: 16,
        62: 0,
        63: 0,
        64: 0,
        65: 48,
        66: 120,
        67: 103,
        68: 97,
        69: 110,
        70: 99,
        71: 104,
        72: 111,
        73: 46,
        74: 116,
        75: 101,
        76: 115,
        77: 116,
        78: 110,
        79: 101,
        80: 116,
        81: 5,
        82: 233,
        83: 95,
        84: 227,
        85: 45,
        86: 10,
        87: 101,
        88: 176,
        89: 111,
        90: 124,
        91: 190,
        92: 86,
        93: 106,
        94: 27,
        95: 143,
        96: 54,
        97: 148,
        98: 125,
        99: 132,
        100: 252,
        101: 25,
        102: 71,
        103: 125,
        104: 78,
        105: 60,
        106: 242,
        107: 100,
        108: 219,
        109: 40,
        110: 168,
        111: 65,
        112: 3,
        113: 1,
        114: 0,
        115: 0,
        116: 0,
        117: 3,
        118: 0,
        119: 0,
        120: 0,
        121: 161,
        122: 237,
        123: 204,
        124: 206,
        125: 27,
        126: 194,
        127: 211,
        128: 0,
        129: 0,
        130: 0,
        131: 0,
        132: 0,
        133: 0,
      };

      const expectedTransactionId = "EpHx79wKAn6br4G9aKaCGLpdzNc8YjrthiFonXQgskAx";
      const transactionId = getNearTransactionIdFromSignedTransaction(signedTransaction);
      expect(transactionId).toBe(expectedTransactionId);
    });

    it("should extract the transaction hash from a near signed transaction buffer object", () => {
      const signedTransaction = {
        type: "buffer",
        data: {
          0: 16,
          1: 0,
          2: 0,
          3: 0,
          4: 48,
          5: 120,
          6: 103,
          7: 97,
          8: 110,
          9: 99,
          10: 104,
          11: 111,
          12: 46,
          13: 116,
          14: 101,
          15: 115,
          16: 116,
          17: 110,
          18: 101,
          19: 116,
          20: 0,
          21: 243,
          22: 74,
          23: 204,
          24: 31,
          25: 29,
          26: 80,
          27: 146,
          28: 149,
          29: 102,
          30: 175,
          31: 8,
          32: 83,
          33: 231,
          34: 187,
          35: 5,
          36: 120,
          37: 41,
          38: 115,
          39: 247,
          40: 22,
          41: 197,
          42: 120,
          43: 182,
          44: 242,
          45: 120,
          46: 135,
          47: 73,
          48: 137,
          49: 166,
          50: 246,
          51: 171,
          52: 103,
          53: 77,
          54: 243,
          55: 34,
          56: 42,
          57: 212,
          58: 180,
          59: 0,
          60: 0,
          61: 16,
          62: 0,
          63: 0,
          64: 0,
          65: 48,
          66: 120,
          67: 103,
          68: 97,
          69: 110,
          70: 99,
          71: 104,
          72: 111,
          73: 46,
          74: 116,
          75: 101,
          76: 115,
          77: 116,
          78: 110,
          79: 101,
          80: 116,
          81: 5,
          82: 233,
          83: 95,
          84: 227,
          85: 45,
          86: 10,
          87: 101,
          88: 176,
          89: 111,
          90: 124,
          91: 190,
          92: 86,
          93: 106,
          94: 27,
          95: 143,
          96: 54,
          97: 148,
          98: 125,
          99: 132,
          100: 252,
          101: 25,
          102: 71,
          103: 125,
          104: 78,
          105: 60,
          106: 242,
          107: 100,
          108: 219,
          109: 40,
          110: 168,
          111: 65,
          112: 3,
          113: 1,
          114: 0,
          115: 0,
          116: 0,
          117: 3,
          118: 0,
          119: 0,
          120: 0,
          121: 161,
          122: 237,
          123: 204,
          124: 206,
          125: 27,
          126: 194,
          127: 211,
          128: 0,
          129: 0,
          130: 0,
          131: 0,
          132: 0,
          133: 0,
        },
      };

      const expectedTransactionId = "EpHx79wKAn6br4G9aKaCGLpdzNc8YjrthiFonXQgskAx";
      const transactionId = getNearTransactionIdFromSignedTransaction(signedTransaction);
      expect(transactionId).toBe(expectedTransactionId);
    });
  });
});
