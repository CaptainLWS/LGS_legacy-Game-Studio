# UUGE Game Engine Module

> **UUGE** — Unified Unreal Game Engine  
> Legacy Game Studios' custom, modular game engine for web, VR, and interplanetary play.

## Quick Start

### Installation

```bash
npm install @lgs/uuge
```

### Hello World

```javascript
import { UUGEEngine, Actor } from '@lgs/uuge';

// Create engine instance
const engine = new UUGEEngine({
  targetFPS: 60,
  debug: true,
});

// Initialize
await engine.initialize();

// Spawn an actor
const player = engine.spawnActor(Actor, {
  position: { x: 0, y: 0, z: 0 },
});

// Start the game loop
engine.start();

// Get diagnostics
console.log(engine.getDiagnostics());
```

## Architecture

### Core Subsystems

1. **PhysicsEngine** - Gravity simulation, collision detection
2. **NetworkingLayer** - Spider‑Frame protocol, multiplayer sync
3. **RenderingCoordinator** - Canvas/WebGL output
4. **AISubsystem** - Behavior trees, NPC logic
5. **AudioEngine** - Spatial audio, voice chat

### Game Objects (Actors)

All gameplay elements inherit from the `Actor` base class:

```javascript
class Player extends Actor {
  update(deltaTime) {
    // Custom player logic
    this.position.x += this.velocity.x * deltaTime;
  }
}

const player = engine.spawnActor(Player, {
  position: { x: 100, y: 100, z: 0 },
});
```

## Networking

### Spider‑Frame Protocol

Multiplayer synchronization via Spider‑Frame:

```javascript
engine.networking.updateLocalState({
  position: player.position,
  rotation: player.rotation,
  gameState: { health: 100, ammo: 45 },
});
```

See [spider-frame-protocol.md](./spider-frame-protocol.md) for full spec.

## Physics

### Gravity Simulation

```javascript
// Earth (default)
engine.physics.gravity = { x: 0, y: 0, z: -9.81 };

// Moon (1/6 Earth gravity)
engine.physics.gravity = { x: 0, y: 0, z: -1.62 };

// Mars (38% Earth gravity)
engine.physics.gravity = { x: 0, y: 0, z: -3.71 };

// Zero-G (Ender's Game mode)
engine.physics.gravity = { x: 0, y: 0, z: 0 };
```

## Performance Monitoring

```javascript
const diagnostics = engine.getDiagnostics();
console.log(`FPS: ${diagnostics.fps}`);
console.log(`Frame Time: ${diagnostics.avgFrameTime} ms`);
console.log(`Actors: ${diagnostics.actorCount}`);
console.log(`Network Latency: ${diagnostics.networkLatency} ms`);
```

## Configuration

```javascript
const engine = new UUGEEngine({
  targetFPS: 60,                  // Target frame rate
  physicsFrameRate: 60,           // Physics substeps
  networkUpdateRate: 30,          // State sync frequency
  maxPlayers: 32,                 // Max concurrent players
  debug: false,                   // Enable console logs
});
```

## Examples

### Example 1: Basic Game Loop

See `examples/basic-game.js`

### Example 2: Multiplayer Session

See `examples/multiplayer-session.js`

### Example 3: Zero-Gravity Physics

See `examples/zero-gravity-trainer.js`

## API Reference

### UUGEEngine

| Method | Returns | Description |
|--------|---------|-------------|
| `initialize()` | Promise<bool> | Setup subsystems |
| `start()` | void | Begin game loop |
| `stop()` | void | Pause game loop |
| `spawnActor(Class, transform, props)` | Actor | Create new actor |
| `destroyActor(id)` | void | Remove actor |
| `getDiagnostics()` | Object | Performance metrics |
| `getEstimatedFPS()` | number | Current FPS |
| `getAverageFrameTime()` | number | Avg ms/frame |

### Actor

| Property | Type | Description |
|----------|------|-------------|
| `position` | {x,y,z} | World position |
| `rotation` | {x,y,z} | Euler angles (radians) |
| `scale` | {x,y,z} | 3D scale factor |
| `velocity` | {x,y,z} | Velocity vector |
| `mass` | number | Physics mass |
| `active` | boolean | Is actor enabled |
| `id` | number | Unique identifier |

| Method | Returns | Description |
|--------|---------|-------------|
| `update(deltaTime)` | void | Per-frame update |
| `destroy()` | void | Mark for deletion |
| `getNetworkState()` | Object | Replication state |

## Roadmap

- [ ] Full 3D rendering (WebGL/Three.js)
- [ ] Advanced physics (Rapier.rs integration)
- [ ] Behavior tree editor UI
- [ ] VR/WebXR support
- [ ] Persistent world (save/load)
- [ ] Replays & telemetry
- [ ] Dedicated server deployment
- [ ] Mars OS / Cosmic OS layers

## Contributing

Contributions welcome! See [CONTRIBUTING.md](../CONTRIBUTING.md)

## License

Copyright © 2024 Legacy Game Studios. All rights reserved.
