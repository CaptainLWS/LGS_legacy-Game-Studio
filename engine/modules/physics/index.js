export function init(engine, options = {}) {
  console.log('[physics] init', options);
  const colliders = new Map();
  return {
    addCollider(entityId, collider) { colliders.set(entityId, collider); },
    removeCollider(entityId) { colliders.delete(entityId); },
    stepPhysics(dt) {
      // very small placeholder
      // Real impl would detect & resolve collisions here
    }
  };
}
