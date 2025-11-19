/**
 * Architecture documentation exports
 * @module core/architecture
 */

/**
 * Layer definitions for the frontend architecture
 */
export const ARCHITECTURE_LAYERS = {
  CORE: 'core',
  DOMAIN: 'domain',
  FEATURE: 'feature',
  SHARED: 'shared',
  INFRASTRUCTURE: 'infrastructure',
} as const;

/**
 * Layer dependencies (which layers can depend on which)
 */
export const LAYER_DEPENDENCIES = {
  [ARCHITECTURE_LAYERS.CORE]: [],
  [ARCHITECTURE_LAYERS.DOMAIN]: [ARCHITECTURE_LAYERS.CORE],
  [ARCHITECTURE_LAYERS.FEATURE]: [
    ARCHITECTURE_LAYERS.CORE,
    ARCHITECTURE_LAYERS.DOMAIN,
  ],
  [ARCHITECTURE_LAYERS.SHARED]: [], // Can be used by all
  [ARCHITECTURE_LAYERS.INFRASTRUCTURE]: [ARCHITECTURE_LAYERS.CORE],
} as const;

/**
 * Check if layer dependency is valid
 */
export function isValidLayerDependency(
  from: string,
  to: string
): boolean {
  if (from === ARCHITECTURE_LAYERS.SHARED) return true;
  if (to === ARCHITECTURE_LAYERS.SHARED) return true;

  const allowedDeps = LAYER_DEPENDENCIES[from as keyof typeof LAYER_DEPENDENCIES];
  return allowedDeps?.includes(to) || false;
}

