export function init(engine, options = {}) {
  console.log('[input] init', options);
  const bindings = new Map();
  return {
    bindAction(actionName, binding) { bindings.set(actionName, binding); },
    getActionState(actionName) { return { pressed: false }; },
    on(actionName, cb) { /* placeholder */ }
  };
}
