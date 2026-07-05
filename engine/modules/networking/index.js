export function init(engine, options = {}) {
  console.log('[networking] init', options);
  const handlers = [];
  return {
    connect(url) { console.log('[networking] connect', url); },
    sendState(state) { console.log('[networking] sendState', state); },
    onRemoteState(cb) { handlers.push(cb); }
  };
}
