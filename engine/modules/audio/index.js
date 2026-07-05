let _audioCtx = null;
let _instances = new Map();

function ensureAudioContext() {
  if (!_audioCtx) {
    _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return _audioCtx;
}

export function init(engine, options = {}) {
  console.log('[audio] init', options);
  return {
    playSound(id, opts = {}) {
      // For demo: create a short oscillator-based sound
      const ctx = ensureAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = opts.type || 'sine';
      osc.frequency.value = opts.freq || 440;
      gain.gain.value = opts.gain || 0.05;
      osc.connect(gain); gain.connect(ctx.destination);
      const now = ctx.currentTime;
      osc.start(now);
      osc.stop(now + (opts.duration || 0.15));
      const idInstance = Math.random().toString(36).slice(2);
      _instances.set(idInstance, { osc, gain });
      // cleanup
      setTimeout(()=>{ _instances.delete(idInstance); }, ((opts.duration||0.15)+0.1)*1000);
      return idInstance;
    },
    stopSound(instanceId) {
      const inst = _instances.get(instanceId);
      if (inst) { try { inst.osc.stop(); } catch(e){} _instances.delete(instanceId); }
    },
    registerAudioSource(entityId, props) { console.log('[audio] registerAudioSource', entityId, props); }
  };
}
