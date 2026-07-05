export function init(engine, options = {}) {
  console.log('[rendering] init', options);
  // minimal renderer uses engine.ctx
  const drawCallbacks = new Map();
  return {
    createCamera: () => ({ x:0,y:0,zoom:1 }),
    registerDrawable: (entityId, drawCallback) => {
      drawCallbacks.set(entityId, drawCallback);
      console.log('[rendering] registerDrawable', entityId);
      return () => drawCallbacks.delete(entityId);
    },
    _drawAll() {
      // used by engine.RenderSystem if desired
      for (const [id, cb] of drawCallbacks) {
        try { cb(engine.ctx, engine.entities.get(id)); } catch(e){ console.error('draw callback error', e); }
      }
    }
  };
}
