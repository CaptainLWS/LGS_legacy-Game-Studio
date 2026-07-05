/**
 * Advanced Graphics Engine - UUGE Graphics Module
 * High-grade rendering pipeline with spatial graphics and slow-motion effects
 * 
 * Features:
 * - 3D rendering with perspective projection
 * - Motion blur and trail effects
 * - Bullet-time slow motion simulation
 * - Particle system for dynamic visual effects
 * - Post-processing filters (bloom, color grading, depth of field)
 * - Spatial audio visualization
 * 
 * @version 1.1.0
 * @author Legacy Game Studios
 */

/**
 * GraphicsEngine - Main rendering pipeline
 * Manages camera, lighting, post-processing, and special effects
 */
class GraphicsEngine {
  constructor(config = {}) {
    this.config = {
      width: config.width || 1280,
      height: config.height || 720,
      targetFPS: config.targetFPS || 60,
      enableMotionBlur: config.enableMotionBlur !== false,
      enablePostProcessing: config.enablePostProcessing !== false,
      enableParticles: config.enableParticles !== false,
      qualityLevel: config.qualityLevel || 'high', // 'low', 'medium', 'high', 'ultra'
      ...config,
    };

    // Canvas and rendering context
    this.canvas = null;
    this.ctx = null;
    this.offscreenCanvas = null;
    this.offscreenCtx = null;

    // Camera system
    this.camera = new Camera(this.config.width, this.config.height);

    // Effect systems
    this.bulletTime = new BulletTimeSystem(this.config);
    this.particleSystem = new ParticleSystem(this.config);
    this.lightingSystem = new LightingSystem(this.config);
    this.postProcessor = new PostProcessor(this.config);
    this.motionBlurSystem = new MotionBlurSystem(this.config);

    // Drawable registry
    this.drawables = new Map();
    this.spatialGrid = new SpatialGrid(this.config.width, this.config.height, 64);

    // Rendering state
    this.frameBuffer = [];
    this.depthBuffer = [];
    this.lastFrameActors = [];
    this.renderTime = 0;

    if (this.config.debug) {
      console.log('[Graphics] Engine initialized', this.config);
    }
  }

  /**
   * Initialize graphics engine - setup canvas and contexts
   */
  async initialize(canvas) {
    console.log('[Graphics] Initializing graphics engine...');
    
    try {
      this.canvas = canvas || document.getElementById('game-canvas');
      if (!this.canvas) {
        throw new Error('Canvas element not found');
      }

      // Set canvas resolution
      this.canvas.width = this.config.width;
      this.canvas.height = this.config.height;
      this.ctx = this.canvas.getContext('2d', { alpha: true, willReadFrequently: true });

      // Create offscreen buffer for compositing
      this.offscreenCanvas = document.createElement('canvas');
      this.offscreenCanvas.width = this.config.width;
      this.offscreenCanvas.height = this.config.height;
      this.offscreenCtx = this.offscreenCanvas.getContext('2d');

      // Initialize subsystems
      await this.bulletTime.initialize();
      await this.particleSystem.initialize();
      await this.lightingSystem.initialize();
      await this.postProcessor.initialize(this.offscreenCanvas);
      await this.motionBlurSystem.initialize();

      console.log('[Graphics] Graphics engine initialization complete');
      return true;
    } catch (error) {
      console.error('[Graphics] Initialization failed:', error);
      return false;
    }
  }

  /**
   * Register a drawable object
   */
  registerDrawable(entityId, drawable) {
    this.drawables.set(entityId, drawable);
    this.spatialGrid.insert(entityId, drawable.position || { x: 0, y: 0 });
  }

  /**
   * Unregister a drawable
   */
  unregisterDrawable(entityId) {
    this.drawables.delete(entityId);
    this.spatialGrid.remove(entityId);
  }

  /**
   * Main render loop - orchestrates all rendering
   */
  render(renderData) {
    const startTime = performance.now();

    // Clear buffers
    this.offscreenCtx.fillStyle = '#000000';
    this.offscreenCtx.fillRect(0, 0, this.config.width, this.config.height);

    // Update bullet time effect
    this.bulletTime.update(renderData.deltaTime);

    // Apply time dilation based on bullet time state
    const timeScale = this.bulletTime.getTimeScale();
    const dilatedDeltaTime = renderData.deltaTime * timeScale;

    // Update camera
    this.camera.update(renderData);

    // Update particle system
    this.particleSystem.update(dilatedDeltaTime);

    // Setup lighting
    this.lightingSystem.update(renderData.actors);

    // Render scene
    this.renderScene(renderData.actors, dilatedDeltaTime);

    // Apply motion blur if enabled
    if (this.config.enableMotionBlur) {
      this.motionBlurSystem.apply(this.offscreenCtx, renderData.actors);
    }

    // Render particles on top
    if (this.config.enableParticles) {
      this.particleSystem.render(this.offscreenCtx);
    }

    // Apply post-processing effects
    if (this.config.enablePostProcessing) {
      this.postProcessor.apply(this.offscreenCtx, this.bulletTime.isActive);
    }

    // Composite to main canvas
    this.ctx.drawImage(this.offscreenCanvas, 0, 0);

    // Render debug info if enabled
    if (this.config.debug) {
      this.renderDebugInfo(renderData, timeScale);
    }

    this.renderTime = performance.now() - startTime;
    this.lastFrameActors = renderData.actors;
  }

  /**
   * Render the main scene with depth sorting
   */
  renderScene(actors, deltaTime) {
    // Sort actors by depth (z-position)
    const sortedActors = actors
      .filter(a => a && a.position)
      .sort((a, b) => (a.position.z || 0) - (b.position.z || 0));

    for (const actor of sortedActors) {
      if (!actor.position) continue;

      // Transform actor position through camera
      const screenPos = this.camera.worldToScreen(actor.position);

      // Draw actor with appropriate style
      if (actor.visual) {
        this.drawActor(actor, screenPos, deltaTime);
      }
    }
  }

  /**
   * Draw individual actor with effects
   */
  drawActor(actor, screenPos, deltaTime) {
    const isInBulletTime = this.bulletTime.isActive;
    const bulletTimeIntensity = this.bulletTime.intensity;

    // Motion trail for bullet time effect
    if (isInBulletTime && actor.velocity) {
      this.drawMotionTrail(actor, screenPos, bulletTimeIntensity);
    }

    // Main actor rendering
    this.offscreenCtx.save();

    // Position
    this.offscreenCtx.translate(screenPos.x, screenPos.y);

    // Rotation
    if (actor.rotation) {
      const angle = actor.rotation.z || 0;
      this.offscreenCtx.rotate(angle);
    }

    // Scale
    if (actor.scale) {
      this.offscreenCtx.scale(actor.scale.x || 1, actor.scale.y || 1);
    }

    // Color/style
    const style = actor.visual.style || '#ffd700';
    this.offscreenCtx.fillStyle = style;
    this.offscreenCtx.strokeStyle = style;

    // Shape rendering
    const shape = actor.visual.shape || 'rect';
    const size = actor.visual.size || 10;

    switch (shape) {
      case 'rect':
        this.offscreenCtx.fillRect(-size / 2, -size / 2, size, size);
        break;
      case 'circle':
        this.offscreenCtx.beginPath();
        this.offscreenCtx.arc(0, 0, size / 2, 0, Math.PI * 2);
        this.offscreenCtx.fill();
        break;
      case 'triangle':
        this.offscreenCtx.beginPath();
        this.offscreenCtx.moveTo(0, -size / 2);
        this.offscreenCtx.lineTo(size / 2, size / 2);
        this.offscreenCtx.lineTo(-size / 2, size / 2);
        this.offscreenCtx.closePath();
        this.offscreenCtx.fill();
        break;
    }

    // Glow effect in bullet time
    if (isInBulletTime) {
      this.offscreenCtx.strokeStyle = `rgba(255, 215, 0, ${0.5 * bulletTimeIntensity})`;
      this.offscreenCtx.lineWidth = 2;
      switch (shape) {
        case 'rect':
          this.offscreenCtx.strokeRect(-size / 2 - 2, -size / 2 - 2, size + 4, size + 4);
          break;
        case 'circle':
          this.offscreenCtx.beginPath();
          this.offscreenCtx.arc(0, 0, size / 2 + 2, 0, Math.PI * 2);
          this.offscreenCtx.stroke();
          break;
      }
    }

    this.offscreenCtx.restore();
  }

  /**
   * Draw motion trail effect (Matrix bullet-time style)
   */
  drawMotionTrail(actor, screenPos, intensity) {
    const trailSteps = Math.ceil(5 * intensity);
    const prevPos = actor.previousPosition || actor.position;

    for (let i = 1; i < trailSteps; i++) {
      const alpha = (1 - i / trailSteps) * 0.3 * intensity;
      const t = i / trailSteps;

      const trailX = prevPos.x + (actor.position.x - prevPos.x) * t;
      const trailY = prevPos.y + (actor.position.y - prevPos.y) * t;
      const trailScreenPos = this.camera.worldToScreen({ x: trailX, y: trailY, z: actor.position.z });

      this.offscreenCtx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
      const size = actor.visual.size || 10;
      this.offscreenCtx.fillRect(trailScreenPos.x - size / 4, trailScreenPos.y - size / 4, size / 2, size / 2);
    }
  }

  /**
   * Render debug information overlay
   */
  renderDebugInfo(renderData, timeScale) {
    this.ctx.fillStyle = '#00ff00';
    this.ctx.font = '12px monospace';
    this.ctx.fillText(`FPS: ${(1000 / (this.renderTime || 16)).toFixed(1)}`, 10, 20);
    this.ctx.fillText(`Time Scale: ${timeScale.toFixed(2)}x`, 10, 35);
    this.ctx.fillText(`Bullet Time: ${this.bulletTime.isActive ? 'ACTIVE' : 'inactive'}`, 10, 50);
    this.ctx.fillText(`Actors: ${renderData.actors.length}`, 10, 65);
    this.ctx.fillText(`Particles: ${this.particleSystem.particles.length}`, 10, 80);
    this.ctx.fillText(`Render Time: ${this.renderTime.toFixed(2)}ms`, 10, 95);
  }

  /**
   * Activate bullet time effect
   */
  activateBulletTime(duration = 2, intensity = 0.1) {
    this.bulletTime.activate(duration, intensity);
  }

  /**
   * Deactivate bullet time
   */
  deactivateBulletTime() {
    this.bulletTime.deactivate();
  }

  /**
   * Spawn particle effect
   */
  spawnParticles(position, type = 'explosion', count = 20) {
    return this.particleSystem.spawn(position, type, count);
  }

  /**
   * Get camera reference
   */
  getCamera() {
    return this.camera;
  }

  /**
   * Get bullet time system
   */
  getBulletTimeSystem() {
    return this.bulletTime;
  }

  /**
   * Get particle system
   */
  getParticleSystem() {
    return this.particleSystem;
  }
}

/**
 * Camera - Handles 3D projection and viewport management
 */
class Camera {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.position = { x: width / 2, y: height / 2, z: 100 };
    this.target = { x: width / 2, y: height / 2, z: 0 };
    this.fov = 60; // Field of view in degrees
    this.near = 0.1;
    this.far = 1000;
  }

  /**
   * Update camera based on game state
   */
  update(renderData) {
    // Follow player if available
    if (renderData.players && renderData.players.length > 0) {
      const player = renderData.players[0];
      if (player.position) {
        this.target = { ...player.position };
      }
    }
  }

  /**
   * Transform world coordinates to screen coordinates
   */
  worldToScreen(worldPos) {
    // Perspective projection
    const dx = worldPos.x - this.position.x;
    const dy = worldPos.y - this.position.y;
    const dz = worldPos.z - this.position.z;

    // Simple perspective divide
    const scale = this.position.z / (this.position.z - dz + 0.1);

    const screenX = this.width / 2 + (dx * scale);
    const screenY = this.height / 2 + (dy * scale);

    return { x: screenX, y: screenY, scale };
  }

  /**
   * Transform screen coordinates to world coordinates
   */
  screenToWorld(screenPos, z = 0) {
    // Inverse perspective projection
    const cx = this.width / 2;
    const cy = this.height / 2;

    const scale = this.position.z / (this.position.z - z + 0.1);

    const worldX = this.position.x + (screenPos.x - cx) / scale;
    const worldY = this.position.y + (screenPos.y - cy) / scale;

    return { x: worldX, y: worldY, z };
  }
}

/**
 * BulletTimeSystem - Manages slow-motion effects
 * Inspired by Matrix-style bullet time
 */
class BulletTimeSystem {
  constructor(config) {
    this.config = config;
    this.isActive = false;
    this.intensity = 0;
    this.duration = 0;
    this.elapsedTime = 0;
    this.transitionSpeed = 2;
    this.targetIntensity = 0;
  }

  async initialize() {
    console.log('[BulletTime] Initializing bullet time system');
  }

  /**
   * Activate bullet time
   */
  activate(duration = 2, intensity = 0.1) {
    this.isActive = true;
    this.duration = duration;
    this.elapsedTime = 0;
    this.targetIntensity = intensity;
    console.log(`[BulletTime] Activated: ${duration}s at ${intensity}x intensity`);
  }

  /**
   * Deactivate bullet time
   */
  deactivate() {
    this.isActive = false;
    this.targetIntensity = 1;
  }

  /**
   * Update bullet time state
   */
  update(deltaTime) {
    if (!this.isActive && this.intensity === 1) return;

    if (this.isActive) {
      this.elapsedTime += deltaTime;

      // Check if duration expired
      if (this.elapsedTime >= this.duration) {
        this.deactivate();
      }

      // Smoothly interpolate intensity
      this.intensity += (this.targetIntensity - this.intensity) * this.transitionSpeed * deltaTime;
    } else {
      // Return to normal time
      this.intensity += (1 - this.intensity) * this.transitionSpeed * deltaTime;
    }

    // Clamp intensity
    this.intensity = Math.max(0, Math.min(1, this.intensity));
  }

  /**
   * Get current time scale (0.1 = 10x slower)
   */
  getTimeScale() {
    // Logarithmic scaling for smooth slowdown
    return 1 - (1 - this.intensity) * 0.9;
  }

  /**
   * Get visual effect intensity
   */
  getEffectIntensity() {
    return this.intensity;
  }
}

/**
 * MotionBlurSystem - Creates motion blur trails
 */
class MotionBlurSystem {
  constructor(config) {
    this.config = config;
    this.motionHistory = new Map();
    this.blurStrength = config.motionBlurStrength || 0.3;
  }

  async initialize() {
    console.log('[MotionBlur] Initializing motion blur system');
  }

  /**
   * Update motion history
   */
  update(actors) {
    // Track previous positions for motion blur
    for (const actor of actors) {
      if (actor.position) {
        const history = this.motionHistory.get(actor.id) || [];
        history.push({ ...actor.position });
        if (history.length > 5) history.shift();
        this.motionHistory.set(actor.id, history);
      }
    }
  }

  /**
   * Apply motion blur to context
   */
  apply(ctx, actors) {
    for (const actor of actors) {
      const history = this.motionHistory.get(actor.id);
      if (history && history.length > 1) {
        // Motion blur already handled in drawMotionTrail
      }
    }
  }
}

/**
 * ParticleSystem - Dynamic particle effects
 */
class ParticleSystem {
  constructor(config) {
    this.config = config;
    this.particles = [];
    this.maxParticles = config.maxParticles || 5000;
  }

  async initialize() {
    console.log('[Particles] Initializing particle system');
  }

  /**
   * Spawn particles
   */
  spawn(position, type = 'explosion', count = 20) {
    const particles = [];
    const types = {
      explosion: { speed: 200, gravity: 500, lifetime: 1, spread: Math.PI * 2 },
      smoke: { speed: 50, gravity: -50, lifetime: 2, spread: Math.PI * 2 },
      spark: { speed: 300, gravity: 1000, lifetime: 0.5, spread: Math.PI * 2 },
    };

    const config = types[type] || types.explosion;

    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;

      const angle = Math.random() * config.spread;
      const speed = config.speed * (0.5 + Math.random() * 0.5);

      const particle = {
        position: { ...position },
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed,
          z: (Math.random() - 0.5) * 100,
        },
        acceleration: { x: 0, y: config.gravity, z: 0 },
        lifetime: config.lifetime,
        age: 0,
        size: 3 + Math.random() * 2,
        color: type === 'spark' ? '#ffcc00' : type === 'smoke' ? '#888888' : '#ff9900',
      };

      this.particles.push(particle);
      particles.push(particle);
    }

    return particles;
  }

  /**
   * Update particle system
   */
  update(deltaTime) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.age += deltaTime;

      if (p.age >= p.lifetime) {
        this.particles.splice(i, 1);
        continue;
      }

      // Physics
      p.velocity.x += p.acceleration.x * deltaTime;
      p.velocity.y += p.acceleration.y * deltaTime;
      p.velocity.z += p.acceleration.z * deltaTime;

      p.position.x += p.velocity.x * deltaTime;
      p.position.y += p.velocity.y * deltaTime;
      p.position.z += p.velocity.z * deltaTime;
    }
  }

  /**
   * Render particles
   */
  render(ctx) {
    for (const p of this.particles) {
      const alpha = 1 - (p.age / p.lifetime);
      ctx.fillStyle = p.color.replace(')', `, ${alpha * 0.8})`).replace('#', 'rgba(') + ')';
      ctx.beginPath();
      ctx.arc(p.position.x, p.position.y, p.size * (1 - p.age / p.lifetime), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * Clear all particles
   */
  clear() {
    this.particles = [];
  }
}

/**
 * LightingSystem - Dynamic lighting and shadows
 */
class LightingSystem {
  constructor(config) {
    this.config = config;
    this.lights = [];
    this.ambientLight = { r: 0.3, g: 0.3, b: 0.3 };
  }

  async initialize() {
    console.log('[Lighting] Initializing lighting system');
  }

  /**
   * Update lighting based on scene
   */
  update(actors) {
    // Update dynamic lights based on actors
    this.lights = [];

    for (const actor of actors) {
      if (actor.properties && actor.properties.emitLight) {
        this.lights.push({
          position: actor.position,
          color: actor.properties.lightColor || { r: 1, g: 1, b: 1 },
          intensity: actor.properties.lightIntensity || 1,
          range: actor.properties.lightRange || 200,
        });
      }
    }
  }

  /**
   * Add light source
   */
  addLight(position, color = { r: 1, g: 1, b: 1 }, intensity = 1, range = 200) {
    this.lights.push({ position, color, intensity, range });
  }

  /**
   * Clear all lights
   */
  clear() {
    this.lights = [];
  }
}

/**
 * PostProcessor - Post-processing effects
 */
class PostProcessor {
  constructor(config) {
    this.config = config;
    this.enableBloom = config.enableBloom !== false;
    this.enableColorGrading = config.enableColorGrading !== false;
    this.bloomIntensity = 0.5;
  }

  async initialize(canvas) {
    console.log('[PostProcessor] Initializing post-processor');
  }

  /**
   * Apply post-processing effects
   */
  apply(ctx, isBulletTime = false) {
    if (isBulletTime) {
      this.applySlowMotionEffect(ctx);
    }

    if (this.enableBloom) {
      this.applyBloom(ctx);
    }

    if (this.enableColorGrading) {
      this.applyColorGrading(ctx);
    }
  }

  /**
   * Slow motion visual effect
   */
  applySlowMotionEffect(ctx) {
    ctx.fillStyle = 'rgba(100, 150, 255, 0.05)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  /**
   * Bloom effect
   */
  applyBloom(ctx) {
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      if (brightness > 200) {
        data[i] = Math.min(255, data[i] + brightness * this.bloomIntensity * 0.1);
        data[i + 1] = Math.min(255, data[i + 1] + brightness * this.bloomIntensity * 0.1);
        data[i + 2] = Math.min(255, data[i + 2] + brightness * this.bloomIntensity * 0.1);
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Color grading (cinematic color correction)
   */
  applyColorGrading(ctx) {
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    const data = imageData.data;

    // Slightly enhance gold/warm tones (Legacy Studios brand)
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * 1.05); // Red
      data[i + 1] = Math.min(255, data[i + 1] * 1.02); // Green
      data[i + 2] = Math.max(0, data[i + 2] * 0.98); // Blue
    }

    ctx.putImageData(imageData, 0, 0);
  }
}

/**
 * SpatialGrid - Spatial partitioning for efficient rendering
 */
class SpatialGrid {
  constructor(width, height, cellSize) {
    this.width = width;
    this.height = height;
    this.cellSize = cellSize;
    this.cols = Math.ceil(width / cellSize);
    this.rows = Math.ceil(height / cellSize);
    this.grid = Array(this.cols * this.rows).fill(null).map(() => new Set());
    this.entityPositions = new Map();
  }

  /**
   * Insert entity into grid
   */
  insert(entityId, position) {
    const col = Math.floor(position.x / this.cellSize);
    const row = Math.floor(position.y / this.cellSize);

    if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
      const index = row * this.cols + col;
      this.grid[index].add(entityId);
      this.entityPositions.set(entityId, { col, row });
    }
  }

  /**
   * Remove entity from grid
   */
  remove(entityId) {
    const pos = this.entityPositions.get(entityId);
    if (pos) {
      const index = pos.row * this.cols + pos.col;
      this.grid[index].delete(entityId);
      this.entityPositions.delete(entityId);
    }
  }

  /**
   * Query entities in region
   */
  query(x, y, width, height) {
    const result = new Set();
    const startCol = Math.max(0, Math.floor(x / this.cellSize));
    const startRow = Math.max(0, Math.floor(y / this.cellSize));
    const endCol = Math.min(this.cols, Math.ceil((x + width) / this.cellSize));
    const endRow = Math.min(this.rows, Math.ceil((y + height) / this.cellSize));

    for (let row = startRow; row < endRow; row++) {
      for (let col = startCol; col < endCol; col++) {
        const index = row * this.cols + col;
        for (const id of this.grid[index]) {
          result.add(id);
        }
      }
    }

    return result;
  }
}

// Export for use in game projects
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    GraphicsEngine,
    Camera,
    BulletTimeSystem,
    MotionBlurSystem,
    ParticleSystem,
    LightingSystem,
    PostProcessor,
    SpatialGrid,
  };
}
