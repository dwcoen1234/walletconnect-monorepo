---
"@walletconnect/sign-client": patch
---

fix: clean up orphaned subscriber topics to prevent indefinite persistence

- Fix `onSessionSettleResponse` error path to fully clean up session topic (unsubscribe, delete keys, remove expiry)
- Fix `proposalExpireHandler` to unsubscribe session topic when proposal expires after wallet approval
- Fix `authenticate()` to unsubscribe previous auth response topic before subscribing to a new one
- Add heartbeat-based reconciliation that removes subscriber topics not associated with any active session, pairing, or pending session
