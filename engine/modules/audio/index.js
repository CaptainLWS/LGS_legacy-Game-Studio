export function init(engine, options = {}) {
  console.log('[audio] init', options);
  return {
    playSound(id, opts = {}) { console.log('[audio] playSound', id, opts); return Math.random().toString(36).slice(2); },
    stopSound(instanceId) { console.log('[audio] stopSound', instanceId); },
    registerAudioSource(entityId, props) { console.log('[audio] registerAudioSource', entityId, props); }
  };
}
