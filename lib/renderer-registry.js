import { flipperRenderer } from './renderers/flipper-renderer.js';
import { duckyRenderer } from './renderers/ducky-renderer.js';

const registry = new Map([
  [flipperRenderer.id, flipperRenderer],
  [duckyRenderer.id, duckyRenderer],
]);

export function getRenderer(id) {
  const renderer = registry.get(id);
  if (!renderer) throw new Error(`Unknown renderer: ${id}`);
  return renderer;
}

export function listRenderers() {
  return [...registry.keys()];
}
