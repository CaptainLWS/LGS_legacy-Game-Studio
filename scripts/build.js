#!/usr/bin/env node

/**
 * Legacy Engine Build Script
 * 
 * Bundles engine modules and generates distribution files.
 * Usage: node scripts/build.js [--prod]
 */

const fs = require('fs');
const path = require('path');

const isDev = !process.argv.includes('--prod');
const srcDir = path.join(__dirname, '..');
const distDir = path.join(srcDir, 'dist');

console.log(`Building Legacy Engine (${isDev ? 'development' : 'production'})...`);

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Read engine core
const engineCore = fs.readFileSync(path.join(srcDir, 'engine.js'), 'utf8');

// Bundle output
let bundle = `
/**
 * Legacy Engine - v1.0.0
 * Modular, JavaScript-based game engine
 * Built: ${new Date().toISOString()}
 */

`;

bundle += engineCore;

// Write bundle
fs.writeFileSync(
  path.join(distDir, 'legacy-engine.js'),
  bundle
);

if (!isDev) {
  // Minify for production (simple version)
  const minified = bundle
    .replace(/\/\/.*$/gm, '') // Remove comments
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
    .replace(/\s+/g, ' ') // Collapse whitespace
    .trim();

  fs.writeFileSync(
    path.join(distDir, 'legacy-engine.min.js'),
    minified
  );
}

console.log('✓ Build complete');
console.log(`  Output: ${distDir}`);
