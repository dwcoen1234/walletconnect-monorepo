---
"@walletconnect/core": patch
---

fix: prevent infinite loop and memory exhaustion in relayer reconnection

- Eliminate `new Promise(async executor)` antipattern in `connect()` and `subscribe()` so background tasks no longer spawn unsupervised connection attempts
- Serialize connection attempts via `connectPromise` in both `transportOpen()` and `toEstablishConnection()` to prevent concurrent `connect()` calls
- Keep `connectionAttemptInProgress` guard up during the entire retry loop to block `restartTransport()` from spawning parallel connections
- Reset `reconnectInProgress` on early returns in `onProviderDisconnect()` to prevent the flag from getting permanently stuck
- Close old WebSocket in `createProvider()` before creating a new one to prevent connection and listener leaks
- Wrap `subscriber.stop()` in try/catch in `onProviderDisconnect()` to prevent `reconnectInProgress` from getting stuck on throw
- Reset `stalledRestartBackoff` on successful connection so recovery latency doesn't degrade after repeated stall/recover cycles
