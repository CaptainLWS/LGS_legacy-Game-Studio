# Networking Module

Responsibilities:
- Multiplayer hooks and state replication adapters.
- Provide a Spider-Frame-compatible adapter for non-blocking sync.

Public API sketch:
- init(engineContext, options)
- connect(url)
- sendState(state)
- onRemoteState(callback)

