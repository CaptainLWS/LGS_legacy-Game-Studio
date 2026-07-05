# Spider‑Frame Protocol Specification

## Overview

Spider‑Frame is Legacy Game Studios' binary network protocol for real-time multiplayer game synchronization across distributed nodes (Earth, Mars, Luna, etc.).

**Design Goals**:
- Low-latency multiplayer gameplay
- Bandwidth-efficient state replication
- Distributed authority for interplanetary play
- Resilient routing across high-latency links (Mars: ~22 minute delay)
- Security-first: encrypted credentials, anomaly detection

---

## Protocol Structure

### Message Format
┌─────────────────────────────────────────────────────────┐ │ Frame Header (16 bytes) │ ├─────────────────────────────────────────────────────────┤ │ 1. Magic Number (2 bytes) = 0x5346 ('SF') │ │ 2. Version (1 byte) = 1 │ │ 3. Message Type (1 byte) │ │ 4. Sequence Number (4 bytes) - Packet ordering │ │ 5. Timestamp (8 bytes) - Milliseconds since epoch │ ├─────────────────────────────────────────────────────────┤ │ Credential Token (32 bytes) │ │ - JWT signature of player identity │ ├─────────────────────────────────────────────────────────┤ │ Payload (variable) │ │ - Length-prefixed (4 bytes) │ │ - Gzip-compressed JSON or binary │ ├─────────────────────────────────────────────────────────┤ │ Checksum (4 bytes) - CRC32 │ └─────────────────────────────────────────────────────────┘

### Message Types

| Type | Value | Purpose | Direction |
|------|-------|---------|----------|
| `HEARTBEAT` | 0x01 | Keep-alive, latency measurement | Bidirectional |
| `LOGIN` | 0x02 | Player authentication | Client → Server |
| `LOGOUT` | 0x03 | Disconnect signal | Client → Server |
| `STATE_UPDATE` | 0x04 | Game state synchronization | Bidirectional |
| `ACTION` | 0x05 | Player input/action | Client → Server |
| `EVENT` | 0x06 | Gameplay event (kill, spawn, etc) | Bidirectional |
| `ERROR` | 0x07 | Error notification | Bidirectional |
| `ORBIT_SYNC` | 0x08 | Interplanetary sync | Server → Server |
| `ANOMALY_REPORT` | 0x09 | Security alert | Server ↔ Security |

---

## Credential Token Format
JWT Header: { "alg": "HS256", "typ": "JWT", "kid": "spider-frame-v1" }

JWT Payload: { "sub": "player_uuid_v4", "session_id": "session_uuid_v4", "orbit": "earth", // earth | mars | luna | cosmic "iat": 1688169600, "exp": 1688256000, "scopes": ["gameplay", "voice_chat"] }

Signature: HMAC_SHA256(header.payload, SERVER_SECRET_KEY)

---

## State Update Packet Example

```json
{
  "type": "STATE_UPDATE",
  "seq": 12345,
  "timestamp": 1688169734523,
  "orbit": "earth",
  "gameState": {
    "playerPosition": {
      "x": 100.5,
      "y": 250.3,
      "z": 0.0
    },
    "playerRotation": {
      "yaw": 45.0,
      "pitch": 0.0,
      "roll": 0.0
    },
    "velocity": {
      "x": 5.0,
      "y": 0.0,
      "z": 0.0
    },
    "health": 100,
    "ammo": {
      "type": "plasma",
      "count": 45
    },
    "timestamp": 1688169734500
  },
  "actors": [
    {
      "id": "actor_001",
      "type": "enemy",
      "position": { "x": 300.0, "y": 150.0, "z": 0.0 },
      "state": "attacking"
    },
    {
      "id": "actor_002",
      "type": "item",
      "position": { "x": 50.0, "y": 100.0, "z": 0.0 },
      "subtype": "health_pack"
    }
  ]
}
Failure Matrix & Resilience
Network Failure Detection
Code
Latency Bucket | Action | Max Retries | Timeout
─────────────────────────────────────────────────
0-50ms         | Send   | 3           | 500ms
50-200ms       | Send   | 2           | 1000ms
200-500ms      | Send   | 1           | 2000ms (Mars)
500ms+         | Queue  | 0           | Adaptive
Multi-Orbit Routing
Code
Earth Network:
- Primary latency: 0-50ms
- Fallback: TCP/HTTP long-poll

Mars Network:
- Primary latency: ~22 minutes one-way
- Strategy: Event-driven, not frame-sync
- State: Replicated, eventual consistency

Luna Network:
- Primary latency: 1-3 seconds
- Strategy: Hybrid frame-sync

Cosmic Network (Future):
- Federation protocol
- Cross-orbit message routing
Security Layer
Encryption
Channel: TLS 1.3 over WebSocket or native TCP
Payload: AES-256-GCM (optional, for sensitive game state)
Token: HMAC-SHA256
Anomaly Detection
Code
Rules:
1. Duplicate sequence numbers → Drop packet, log
2. Timestamp deviation > 5s → Reject, sync clock
3. State changes violating physics → Rollback, rewind
4. Rapid position delta (teleport) → Verify, flag
5. Token expiration → Force re-auth
6. Invalid checksum → Drop, request retransmit
LLM-Based Analysis
Server-side LLM monitors packet patterns for:

Account takeover attempts
Cheat detection (impossible moves)
DDoS patterns
Exploit signatures
Example: Login Flow
Code
Client → Server: LOGIN packet
  {
    "username": "player_name",
    "password_hash": "sha256(...)",
    "device_id": "device_uuid"
  }
  
Server → Client: LOGIN_RESPONSE
  {
    "status": "success",
    "session_id": "session_uuid",
    "token": "eyJhbGc...",
    "orbit": "earth",
    "server_time": 1688169734523
  }

Client ↔ Server: Begin STATE_UPDATE exchanges
  Frequency: 30 packets/sec
  Sequence: Numbered
  Timestamp: Synchronized
Performance Targets
Metric	Target	Notes
Latency (E→E)	<50ms	Earth-to-Earth
Latency (E→M)	1-3 minutes	Physical limit
Throughput	100-500 Kbps/player	Compressed state
Packet Loss Tolerance	<2%	With retry logic
Clock Skew Tolerance	±5s	Auto-correct
Max Players/Server	256	With load balancing
Future Extensions
WebRTC Data Channel: Ultra-low latency for critical updates
Quantum-Resistant Crypto: Post-quantum key exchange
Cross-Dimensional Routing: Cosmic OS integration
Hierarchical Authority: Distributed gamestate ownership
Time Dilation: Relativistic physics simulation
Reference Implementation
See UUGE_core.js → NetworkingLayer class for JavaScript implementation.

Document Version: 1.0
Last Updated: July 2026
Maintained by: Legacy Game Studios Engineering
