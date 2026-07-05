# Physics Module

Responsibilities:
- Movement integration, collision detection and resolution.
- Physics substep handling and deterministic updates (where possible).

Public API sketch:
- init(engineContext, options)
- addCollider(entityId, collider)
- removeCollider(entityId)
- stepPhysics(dt)

