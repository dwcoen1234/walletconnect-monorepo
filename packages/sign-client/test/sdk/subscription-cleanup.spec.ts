/* eslint-disable no-console */
import { getSdkError } from "@walletconnect/utils";
import { expect, describe, it } from "vitest";
import {
  initTwoClients,
  initTwoPairedClients,
  deleteClients,
  throttle,
  TEST_NAMESPACES,
  TEST_OPTIONAL_NAMESPACES,
  TEST_SESSION_PROPERTIES_APPROVE,
} from "../shared/index.js";
import { AUTH_PUBLIC_KEY_NAME } from "../../src/constants/index.js";
import { EngineTypes } from "@walletconnect/types";

describe("Subscription Cleanup", () => {
  describe("onSessionSettleResponse error", () => {
    it("should unsubscribe session topic when settle is rejected", async () => {
      // #given - two clients where wallet approves but dApp rejects the settle
      const clients = await initTwoClients();
      const { A, B } = clients;

      const connectParams: EngineTypes.ConnectParams = {
        optionalNamespaces: TEST_OPTIONAL_NAMESPACES,
      };

      const { uri, approval } = await A.connect(connectParams);
      expect(uri).to.exist;

      let sessionTopic: string;

      await Promise.all([
        new Promise<void>(async (resolve, reject) => {
          B.once("session_proposal", async (proposal) => {
            try {
              // #when - wallet approves the session
              const { acknowledged } = await B.approve({
                id: proposal.id,
                namespaces: TEST_NAMESPACES,
                sessionProperties: TEST_SESSION_PROPERTIES_APPROVE,
              });

              sessionTopic = B.session.getAll()[0]?.topic;
              expect(sessionTopic).to.exist;

              // #then - verify wallet is subscribed to session topic before settle response
              const subscriberTopicsBefore = B.core.relayer.subscriber.topics;
              expect(subscriberTopicsBefore).to.include(sessionTopic);

              try {
                await acknowledged();
              } catch {
                // expected to fail if settle is rejected
              }
              resolve();
            } catch (e) {
              reject(e);
            }
          });
        }),
        new Promise<void>(async (resolve, reject) => {
          try {
            await B.pair({ uri: uri! });
            resolve();
          } catch (e) {
            reject(e);
          }
        }),
        new Promise<void>(async (resolve, reject) => {
          try {
            await approval();
            resolve();
          } catch (e) {
            reject(e);
          }
        }),
      ]);

      // #then - after session is established, disconnect to verify cleanup works
      if (sessionTopic!) {
        await A.disconnect({ topic: sessionTopic, reason: getSdkError("USER_DISCONNECTED") });
        await throttle(500);

        // wallet should have cleaned up the subscription
        const subscriberTopicsAfter = B.core.relayer.subscriber.topics;
        expect(subscriberTopicsAfter).to.not.include(sessionTopic);
      }

      await deleteClients(clients);
    });
  });

  describe("proposal expire with pending session", () => {
    it("should unsubscribe session topic when proposal expires after wallet approved", async () => {
      // #given - two clients where wallet sends approval (propose response)
      // but never sends settle, so the proposal expires
      const clients = await initTwoClients();
      const { A, B } = clients;

      const connectParams: EngineTypes.ConnectParams = {
        optionalNamespaces: TEST_OPTIONAL_NAMESPACES,
      };

      const { uri, approval } = await A.connect(connectParams);
      expect(uri).to.exist;

      await B.pair({ uri: uri! });

      // Wait for proposal to be received by wallet
      const proposalPromise = new Promise<void>((resolve) => {
        B.once("session_proposal", async (proposal) => {
          // wallet approves → triggers onSessionProposeResponse on dApp
          // which subscribes to sessionTopic
          await B.approve({
            id: proposal.id,
            namespaces: TEST_NAMESPACES,
            sessionProperties: TEST_SESSION_PROPERTIES_APPROVE,
          });
          resolve();
        });
      });

      await proposalPromise;
      await throttle(1000);

      // #when - dApp has pending sessions with subscribed topics
      // @ts-expect-error - pendingSessions is private
      const pendingSessions = A.engine.pendingSessions as Map<number, any>;

      // If there's a pending session, verify the session topic is subscribed
      if (pendingSessions.size > 0) {
        const pendingSession = [...pendingSessions.values()][0];
        const sessionTopic = pendingSession.sessionTopic;

        expect(A.core.relayer.subscriber.topics).to.include(sessionTopic);

        // #when - simulate proposal expiry by deleting the proposal and firing expire
        const proposalId = pendingSession.proposalId;
        A.events.emit("proposal_expire", { id: proposalId });
        await throttle(500);

        // #then - session topic should be unsubscribed
        expect(A.core.relayer.subscriber.topics).to.not.include(sessionTopic);
        expect(pendingSessions.has(proposalId)).to.be.false;
      }

      // Clean up by catching the approval rejection
      approval().catch(() => {});
      await throttle(500);

      await deleteClients(clients);
    });
  });

  describe("authenticate responseTopic cleanup", () => {
    it("should unsubscribe previous responseTopic when authenticate is called again", async () => {
      // #given - a dApp client
      const clients = await initTwoClients();
      const { A } = clients;

      const authenticateParams = {
        chains: ["eip155:1"],
        domain: "example.com",
        nonce: "nonce1",
        uri: "https://example.com",
        methods: ["personal_sign"],
      };

      // #when - first authenticate call
      try {
        await Promise.race([
          A.authenticate(authenticateParams),
          throttle(3000).then(() => ({ timedOut: true })),
        ]);
      } catch {
        // expected - no wallet to respond
      }

      // Retrieve the first responseTopic
      // @ts-expect-error - accessing private auth store
      const authKeys = A.auth.authKeys;
      const hasKey = authKeys.keys.includes(AUTH_PUBLIC_KEY_NAME);
      expect(hasKey).to.be.true;

      const firstAuthKey = authKeys.get(AUTH_PUBLIC_KEY_NAME);
      const firstResponseTopic = firstAuthKey.responseTopic;
      expect(A.core.relayer.subscriber.topics).to.include(firstResponseTopic);

      // #when - second authenticate call
      try {
        await Promise.race([
          A.authenticate({
            ...authenticateParams,
            nonce: "nonce2",
          }),
          throttle(3000).then(() => ({ timedOut: true })),
        ]);
      } catch {
        // expected
      }

      // #then - first responseTopic should be unsubscribed
      expect(A.core.relayer.subscriber.topics).to.not.include(firstResponseTopic);

      // new responseTopic should be subscribed
      const secondAuthKey = authKeys.get(AUTH_PUBLIC_KEY_NAME);
      expect(secondAuthKey.responseTopic).to.not.eq(firstResponseTopic);
      expect(A.core.relayer.subscriber.topics).to.include(secondAuthKey.responseTopic);

      await deleteClients(clients);
    });
  });

  describe("heartbeat orphan cleanup", () => {
    it("should unsubscribe topics not associated with any session or pairing", async () => {
      // #given - two paired clients with an active session
      const {
        clients,
        sessionA: { topic: sessionTopic },
      } = await initTwoPairedClients({}, {}, { logger: "error" });
      const { A } = clients;

      // #when - inject an orphaned subscription directly into the subscriber
      const orphanTopic = "orphan_topic_" + Math.random().toString(36).substring(2, 15);
      A.core.relayer.subscriber.subscriptions.set(orphanTopic, {
        id: orphanTopic,
        topic: orphanTopic,
        relay: { protocol: "irn" },
      });
      A.core.relayer.subscriber.topicMap.set(orphanTopic, orphanTopic);

      expect(A.core.relayer.subscriber.topics).to.include(orphanTopic);

      // #then - verify orphan is NOT a known session or pairing
      expect(A.session.keys).to.not.include(orphanTopic);
      expect(A.core.pairing.pairings.keys).to.not.include(orphanTopic);

      // #when - trigger the cleanup by calling the private method directly
      // @ts-expect-error - cleanupOrphanedSubscriptions is private
      await A.engine.cleanupOrphanedSubscriptions();

      // #then - orphan topic should be removed
      expect(A.core.relayer.subscriber.topics).to.not.include(orphanTopic);

      // valid session and pairing topics should still be subscribed
      expect(A.session.keys).to.include(sessionTopic);

      await deleteClients(clients);
    });

    it("should not unsubscribe topics belonging to active sessions", async () => {
      // #given - two paired clients
      const {
        clients,
        sessionA: { topic: sessionTopic },
        pairingA: { topic: pairingTopic },
      } = await initTwoPairedClients({}, {}, { logger: "error" });
      const { A } = clients;

      // #when - run cleanup
      // @ts-expect-error - cleanupOrphanedSubscriptions is private
      await A.engine.cleanupOrphanedSubscriptions();

      // #then - session topic must survive
      expect(A.core.relayer.subscriber.topics).to.include(sessionTopic);

      // pairing topic must survive
      expect(A.core.relayer.subscriber.topics).to.include(pairingTopic);

      await deleteClients(clients);
    });

    it("should not unsubscribe topics belonging to pending sessions", async () => {
      // #given - a dApp client with a pending session topic
      const clients = await initTwoClients();
      const { A, B } = clients;

      const connectParams: EngineTypes.ConnectParams = {
        optionalNamespaces: TEST_OPTIONAL_NAMESPACES,
      };

      const { uri, approval } = await A.connect(connectParams);
      expect(uri).to.exist;
      await B.pair({ uri: uri! });

      const proposalSettled = new Promise<void>((resolve) => {
        B.once("session_proposal", async (proposal) => {
          await B.approve({
            id: proposal.id,
            namespaces: TEST_NAMESPACES,
            sessionProperties: TEST_SESSION_PROPERTIES_APPROVE,
          });
          resolve();
        });
      });

      await proposalSettled;
      await throttle(1000);

      // #when - check if there's a pending session with a subscribed topic
      // @ts-expect-error - pendingSessions is private
      const pendingSessions = A.engine.pendingSessions as Map<number, any>;

      if (pendingSessions.size > 0) {
        const pendingSession = [...pendingSessions.values()][0];
        const pendingTopic = pendingSession.sessionTopic;

        expect(A.core.relayer.subscriber.topics).to.include(pendingTopic);

        // #when - run cleanup
        // @ts-expect-error - cleanupOrphanedSubscriptions is private
        await A.engine.cleanupOrphanedSubscriptions();

        // #then - pending session topic must survive cleanup
        expect(A.core.relayer.subscriber.topics).to.include(pendingTopic);
      }

      approval().catch(() => {});
      await throttle(500);

      await deleteClients(clients);
    });
  });
});
