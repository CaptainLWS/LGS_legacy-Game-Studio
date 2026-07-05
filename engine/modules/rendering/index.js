export function init(engine, options = {}) {
  console.log('[rendering] init', options);
  // minimal renderer uses engine.ctx
  return {
    createCamera: () => ({ x:0,y:0,zoom:1 }),
    registerDrawable: (entityId, drawCallback) => {
      // in a full implementation you'd store callbacks; here we just log
      console.log('[rendering] registerDrawable', entityId);
    }
  };
}
