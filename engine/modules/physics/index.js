export function init(engine, options = {}) {
  console.log('[physics] init', options);
  const colliders = new Map();

  function circleCircleCollision(a, b) {
    const dx = a.position.x - b.position.x;
    const dy = a.position.y - b.position.y;
    const r = (a.collider.radius || 0) + (b.collider.radius || 0);
    return dx*dx + dy*dy <= r*r;
  }

  function resolveSimpleBounce(a, b) {
    // simple velocity swap for demo purposes
    const tmpX = a.velocity.x; const tmpY = a.velocity.y;
    a.velocity.x = b.velocity.x; a.velocity.y = b.velocity.y;
    b.velocity.x = tmpX; b.velocity.y = tmpY;
  }

  return {
    addCollider(entityId, collider) { colliders.set(entityId, collider); },
    removeCollider(entityId) { colliders.delete(entityId); },
    stepPhysics(dt) {
      // basic integration for entities that have position + velocity
      for (const e of engine.entities.values()) {
        if (e.position && e.velocity) {
          e.position.x += e.velocity.x * dt;
          e.position.y += e.velocity.y * dt;
        }
      }

      // simple pairwise collision detection for circle colliders
      const ids = Array.from(engine.entities.keys());
      for (let i = 0; i < ids.length; i++) {
        for (let j = i+1; j < ids.length; j++) {
          const a = engine.entities.get(ids[i]);
          const b = engine.entities.get(ids[j]);
          if (!a || !b) continue;
          if (!a.collider && !b.collider) continue;
          if (a.collider?.type === 'circle' && b.collider?.type === 'circle') {
            if (circleCircleCollision(a, b)) {
              resolveSimpleBounce(a, b);
            }
          }
        }
      }

      // keep entities inside canvas bounds
      const w = engine.canvas.width, h = engine.canvas.height;
      for (const e of engine.entities.values()) {
        if (!e.position) continue;
        if (e.position.x < 0) e.position.x = 0;
        if (e.position.x > w) e.position.x = w;
        if (e.position.y < 0) e.position.y = 0;
        if (e.position.y > h) e.position.y = h;
      }
    }
  };
}
