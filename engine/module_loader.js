// Tiny module loader for engine/modules/*
export async function loadModules(engine, moduleList) {
  moduleList = moduleList || [];
  const loaded = {};
  for (const m of moduleList) {
    try {
      const modPath = `./modules/${m.name}/${m.entry}`;
      const mod = await import(modPath);
      if (mod && typeof mod.init === 'function') {
        loaded[m.name] = await mod.init(engine, m.options || {});
        console.log(`[module_loader] loaded ${m.name}`);
      } else {
        console.warn(`[module_loader] module ${m.name} has no init()`);
      }
    } catch (e) {
      console.error('[module_loader] failed to load', m, e);
    }
  }
  return loaded;
}

// convenience: load modules based on modules/modules.json manifest
export async function autoLoadAll(engine) {
  try {
    const res = await fetch('./modules/modules.json');
    const list = await res.json();
    // enrich with default options
    return await loadModules(engine, list.map(x=>Object.assign({}, x, { options: x.options||{} })));
  } catch(e) { console.error('[module_loader] autoLoadAll failed', e); return {}; }
}
