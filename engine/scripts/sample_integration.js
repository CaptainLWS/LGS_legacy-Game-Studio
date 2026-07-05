// Sample integration hooks for demos
export function onEngineStart(engine) {
  console.log('[engine] integration hook: engine started', engine.getDiagnostics());
}

export function onEngineStop(engine) {
  console.log('[engine] integration hook: engine stopped');
}
