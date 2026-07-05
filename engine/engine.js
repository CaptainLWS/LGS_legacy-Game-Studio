// Minimal browser engine core: ECS-style, simple loop, input handling

class Engine {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.targetFPS = opts.targetFPS || 60;
    this.entities = new Map();
    this.systems = [];
    this.nextEntityId = 1;

    this._lastTime = 0;
    this._accumulator = 0;
    this._running = false;

    this.input = new InputHandler();

    this.diagnostics = { fps: 0, frameTime: 0 };
  }

  addSystem(sys) { this.systems.push(sys); }

  addEntity(componentBag) {
    const id = this.nextEntityId++;
    this.entities.set(id, Object.assign({ id }, componentBag));
    return id;
  }

  removeEntity(id) { this.entities.delete(id); }

  getEntitiesWith(...components) {
    const out = [];
    for (const e of this.entities.values()) {
      let ok = true;
      for (const c of components) if (!(c in e)) { ok = false; break; }
      if (ok) out.push(e);
    }
    return out;
  }

  start() {
    this._running = true;
    this._lastTime = performance.now();
    requestAnimationFrame(this._frame.bind(this));
  }

  stop() { this._running = false; }

  _frame(now) {
    const dt = (now - this._lastTime) / 1000;
    this._lastTime = now;
    this.diagnostics.frameTime = dt * 1000;
    this.diagnostics.fps = 1 / Math.max(dt, 1/120);

    // Update systems
    for (const s of this.systems) { try { s.update(this, dt); } catch(e){ console.error('system error', e) } }

    // Render (last system should be renderer)
    // HUD update
    const fpsEl = document.getElementById('fps');
    const entsEl = document.getElementById('ents');
    if (fpsEl) fpsEl.textContent = Math.round(this.diagnostics.fps);
    if (entsEl) entsEl.textContent = this.entities.size;

    if (this._running) requestAnimationFrame(this._frame.bind(this));
  }

  getDiagnostics() { return Object.assign({}, this.diagnostics, { entityCount: this.entities.size }); }
}

class InputHandler {
  constructor() {
    this.keys = new Set();
    window.addEventListener('keydown', (e)=>{ this.keys.add(e.key); });
    window.addEventListener('keyup', (e)=>{ this.keys.delete(e.key); });
  }
  isDown(key) { return this.keys.has(key); }
}

// Simple systems: MovementSystem and RenderSystem
const MovementSystem = {
  update(engine, dt) {
    const ents = engine.getEntitiesWith('position','velocity');
    for (const e of ents) {
      e.position.x += e.velocity.x * dt;
      e.position.y += e.velocity.y * dt;
      // simple bounds wrap
      const w = engine.canvas.width, h = engine.canvas.height;
      if (e.position.x < 0) e.position.x += w;
      if (e.position.x > w) e.position.x -= w;
      if (e.position.y < 0) e.position.y += h;
      if (e.position.y > h) e.position.y -= h;
    }
  }
};

const PlayerControlSystem = {
  update(engine, dt) {
    const ents = engine.getEntitiesWith('player','velocity');
    for (const e of ents) {
      const speed = e.speed || 120;
      e.velocity.x = 0; e.velocity.y = 0;
      if (engine.input.isDown('ArrowLeft') || engine.input.isDown('a')) e.velocity.x = -speed;
      if (engine.input.isDown('ArrowRight') || engine.input.isDown('d')) e.velocity.x = speed;
      if (engine.input.isDown('ArrowUp') || engine.input.isDown('w')) e.velocity.y = -speed;
      if (engine.input.isDown('ArrowDown') || engine.input.isDown('s')) e.velocity.y = speed;
    }
  }
};

const RenderSystem = {
  update(engine, dt) {
    const ctx = engine.ctx;
    ctx.clearRect(0,0,engine.canvas.width, engine.canvas.height);
    // draw all entities with position + sprite or shape
    for (const e of engine.entities.values()) {
      if (e.position) {
        ctx.save();
        ctx.translate(e.position.x, e.position.y);
        if (e.color) {
          ctx.fillStyle = e.color;
          ctx.beginPath(); ctx.arc(0,0, e.radius||8, 0, Math.PI*2); ctx.fill();
        } else if (e.sprite) {
          // placeholder
          ctx.fillStyle = '#fff'; ctx.fillRect(-8,-8,16,16);
        }
        ctx.restore();
      }
    }
  }
};

// Expose a global createEngine helper to simplify demo bootstrapping
export function createEngine(canvasId) {
  const canvas = document.getElementById(canvasId || 'game');
  const engine = new Engine(canvas, { targetFPS: 60 });
  engine.addSystem(PlayerControlSystem);
  engine.addSystem(MovementSystem);
  engine.addSystem(RenderSystem);

  // demo entities
  const playerId = engine.addEntity({ player:true, position:{x:100,y:100}, velocity:{x:0,y:0}, color:'#ffd700', radius:10, speed:160 });
  // spawn some NPCs
  for (let i=0;i<12;i++) {
    engine.addEntity({ position:{x:Math.random()*canvas.width, y:Math.random()*canvas.height}, velocity:{x:(Math.random()-0.5)*60, y:(Math.random()-0.5)*60}, color:'#9bd', radius:6 });
  }

  // expose for debugging
  window._engine = engine;
  engine.start();
  return engine;
}

// auto-start when loaded as module in demo.html
if (typeof document !== 'undefined') {
  // small delay so the canvas exists
  window.addEventListener('load', ()=>{ try { createEngine('game'); } catch(e){ console.error(e); } });
}
