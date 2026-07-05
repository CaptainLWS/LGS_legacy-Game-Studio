# Legacy Engine

A modular, JavaScript-based game engine for browser-based and hybrid games.

## Quick Start

### Using the Engine in a Game

```html
<canvas id="gameCanvas" width="1280" height="720"></canvas>
<script src="engine/engine.js"></script>
<script>
  const canvas = document.getElementById('gameCanvas');
  const engine = new LegacyEngine();
  
  engine.init({
    rendering: { width: 1280, height: 720 },
    physics: { gravity: 980 }
  }, canvas);

  // Create an entity
  const player = engine.createEntity();
  player.addComponent(TransformComponent);
  player.addComponent(SpriteComponent);
  player.addComponent(PhysicsComponent);

  // Configure
  const transform = player.getComponent(TransformComponent);
  transform.x = 640;
  transform.y = 360;

  // Run
  engine.run();
</script>
Architecture
Entity-Component-System (ECS) — Flexible data-driven design
Modular Systems — Rendering, Physics, Audio, Input, UI, Networking
Plugin Architecture — Extend without modifying core
See CORE_SPEC.md for detailed architecture documentation.

Module Structure
Code
engine/
├── engine.js              — Core ECS implementation
├── CORE_SPEC.md           — Architecture specification
├── modules/               — Subsystem modules
│   ├── rendering/
│   ├── physics/
│   ├── audio/
│   ├── input/
│   ├── ui/
│   └── networking/
├── examples/              — Working demos
│   ├── entity-system.html
│   ├── input-handling.html
│   ├── physics-collision.html
│   └── (more coming)
├── scripts/               — Build and utility scripts
│   └── build.js
└── dist/                  — Built distribution files
    ├── legacy-engine.js
    └── legacy-engine.min.js
Examples
Try the interactive demos:

entity-system.html — ECS fundamentals with moving entities
input-handling.html — Keyboard input and player control
physics-collision.html — Gravity, velocity, and collision detection
bash
# Run examples locally
python3 -m http.server 8000
# Visit http://localhost:8000/engine/examples/
Building
bash
# Development build
node engine/scripts/build.js

# Production build (minified)
node engine/scripts/build.js --prod
Output: engine/dist/legacy-engine.js (and .min.js for production)

Components
TransformComponent
Position, rotation, and scale.

JavaScript
const transform = entity.getComponent(TransformComponent);
transform.x = 100;
transform.y = 50;
transform.rotation = Math.PI / 4;
SpriteComponent
Visual representation.

JavaScript
const sprite = entity.getComponent(SpriteComponent);
sprite.color = '#FF0000';
sprite.width = 32;
sprite.height = 32;
PhysicsComponent
Velocity, acceleration, and mass.

JavaScript
const physics = entity.getComponent(PhysicsComponent);
physics.velocityX = 100;
physics.velocityY = 200;
physics.mass = 1.0;
InputComponent
Mapped keyboard/gamepad actions.

JavaScript
const input = entity.getComponent(InputComponent);
if (input.actions.moveLeft) {
  // Handle movement
}
Systems
Systems process entities that have specific components.

Creating a Custom System
JavaScript
class MyCustomSystem extends System {
  constructor(engine) {
    super(engine);
    this.enabled = true;
  }

  update(deltaTime) {
    // Query entities
    const entities = this.queryEntities(TransformComponent, SpriteComponent);
    
    for (const entity of entities) {
      // Process
    }
  }
}

engine.addSystem(new MyCustomSystem(engine));
Configuration
Pass a config object to engine.init():

JavaScript
const config = {
  rendering: {
    width: 1280,
    height: 720,
    pixelArt: true,
    targetFPS: 60
  },
  physics: {
    gravity: 980,
    fixedTimestep: 1/60
  },
  audio: {
    masterVolume: 1.0
  },
  input: {
    enableGamepad: true,
    enableTouch: true
  }
};

engine.init(config, canvas);
API Reference
Engine
init(config, canvas) — Initialize engine with config and canvas
createEntity() — Create a new entity
destroyEntity(entity) — Mark entity for destruction
addSystem(system) — Register a system
run() — Start the game loop
stop() — Stop the game loop
Entity
addComponent(ComponentClass) — Add a component
getComponent(ComponentClass) — Retrieve a component
hasComponent(ComponentClass) — Check if component exists
removeComponent(ComponentClass) — Remove a component
System
update(deltaTime) — Called each frame
queryEntities(...componentClasses) — Find matching entities
Performance
Object Pooling: Reuse frequently created objects
Spatial Partitioning: Quadtree for collision queries
Component Caching: Query results cached per system
Dirty Flags: Only re-render changed entities
Roadmap
 v1.0 — Core ECS, Rendering, Physics, Input, Audio (current)
 v1.1 — UI Module, Networking
 v1.2 — Post-processing effects, particles
 v1.3 — Advanced audio (spatial, 3D)
 v2.0 — WebGPU rendering, advanced physics
Integration
Spider-Frame: Networking module routes through Spider-Frame for auth
Kid-Safe Games: Engine powers KSG catalog
Demo Game Catalog: Used across all demo projects
License
Part of Legacy Game Studio development ecosystem.

Support
For issues, questions, or contributions, see the main repository documentation.
