# Legacy Engine Core Spec

This document describes the high-level architecture and conventions for the "Legacy Engine" used by Legacy Game Studios. It establishes an Unreal-like modular system, an ECS-style runtime model, and rules for how engine modules interact and are versioned.

## Goals

- Provide a lightweight, browser-capable engine core for demos and internal tooling.
- Define clear module boundaries so subsystems can be swapped, versioned, and tested independently.
- Offer a minimal plugin architecture so external projects can extend engine behavior.

## Runtime Model: Entity / Component / System (ECS-style)

- Entity: A lightweight identifier (object with an id) that represents a game object. Entities themselves hold no behavior or data directly — they are keys that aggregate Components.

- Component: Plain data containers (POJOs) attached to Entities. Examples: Transform, Velocity, Sprite, Collider, AudioSource, InputBinding.

- System: Logic that queries entities with required components and operates on those components each frame or on events. Systems are update-driven and may run in phases: input -> physics -> gameplay -> animation -> rendering -> audio -> networking.

Example:
- Transform component: { x, y, rotation, scale }
- Velocity component: { vx, vy }
- MovementSystem: finds entities with Transform + Velocity and integrates position.

## Module Boundaries

Each module is a separately-addressable folder that exposes a public interface (API) and an initialization hook. Modules should not directly mutate other module internals — interactions happen through defined APIs, events, or the ECS data model.

Core modules (each under engine/modules/*):
- rendering: scenes, camera, materials, render targets. Exposes: createScene(), createCamera(), registerDrawable(), renderer.init(canvas).
- physics: movement integrator, collision detection and resolution, physics substeps. Exposes: addCollider(), stepPhysics(dt).
- audio: sound playback, spatialization, sound events. Exposes: playSound(id, opts), registerAudioSource(entityId, props).
- input: keyboard/mouse/controller mapping, action binding. Exposes: bindAction(actionName, callback), getActionState(actionName).
- ui: HUD and overlay systems, UI layout primitives. Exposes: createHUD(container), registerWidget(widget).
- networking: multiplayer hooks, state replication, Spider‑Frame-ready adapters. Exposes: connect(endpoint), sendReliable(message), onRemoteState(handler).

Modules must include a version identifier in a module manifest (simple JSON) and support initialization with a common Engine context object.

Module manifest example (engine/modules/rendering/module.json):
{
  "name": "rendering",
  "version": "0.1.0",
  "description": "Rendering module (Canvas/ WebGL fallback)",
  "entry": "index.js"
}

## Plugin Architecture

- Plugins are small packages that register with the Engine at initialization.
- Plugins receive a reference to the engine context and may register systems, components, or tools.
- Plugins declare compatibility ranges for core modules (semver-style) and may be enabled/disabled at runtime.

API sketch:

engine.registerPlugin({
  id: 'lgs.debug-tools',
  version: '0.0.1',
  init: (engine) => { /* register systems/components */ }
});

## Versioning

- Each module is versioned independently. Breaking changes increment major version in manifest.
- Engine has a core version tying together compatible module ranges.

## Initialization Flow

1. Create Engine context with config (canvas, targetFPS, enabled modules).
2. Engine loads requested modules, passing them the context.
3. Modules initialize and register systems/components.
4. Engine enters main loop: input -> systems -> physics -> scripts -> rendering -> audio -> networking.

## Conventions

- Keep Components purely data-oriented.
- Systems should be idempotent per-frame where possible.
- Avoid cross-module direct state mutation; prefer well-defined APIs and events.

## Minimal Browser Integration

The repository includes a small runtime (engine/engine.js) that demonstrates a tiny ECS, a game loop, and simple input handling so the studio has a reference implementation.

---

Document created as part of the engine structure initiative.
