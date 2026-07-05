# Rendering Module

Responsibilities:
- Scene management, cameras, materials and draw lists.
- Provide an API for registering drawable components.
- Provide a simple canvas 2D renderer and a WebGL adapter in the future.

Public API sketch:
- init(canvas, options)
- createCamera()
- registerDrawable(entityId, drawCallback)
- unregisterDrawable(entityId)

