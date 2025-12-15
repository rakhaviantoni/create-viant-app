/**
 * Centralized version management for all dependencies used in generated projects.
 * This file serves as the single source of truth for all dependency versions.
 */

export const VERSIONS = {
  // Frameworks
  react: '^19.0.0',
  reactDom: '^19.0.0',
  vue: '^3.5.13',
  svelte: '^5.16.0',
  solid: '^1.9.4',
  preact: '^10.25.4',

  // Build Tools
  vite: '^6.0.7',
  typescript: '^5.7.2',

  // Vite Plugins
  vitePluginReact: '^4.3.4',
  vitePluginReactSWC: '^3.7.2',
  vitePluginVue: '^5.2.1',
  vitePluginSvelte: '^5.0.3',
  vitePluginSolid: '^2.11.0',
  preactPresetVite: '^2.9.4',
  vitePluginPWA: '^0.21.1',

  // Styling
  tailwindcss: '^4.0.0',
  unocss: '^0.65.3',
  vanillaExtract: '^1.16.1',
  vanillaExtractVitePlugin: '^3.9.0',
  sass: '^1.83.1',
  styledComponents: '^6.1.14',
  emotion: '^11.14.0',
  emotionStyled: '^11.14.0',
  autoprefixer: '^10.4.20',
  postcss: '^8.4.49',

  // Testing
  vitest: '^3.0.2',
  vitestUi: '^3.0.2',
  playwright: '^1.49.1',
  testingLibraryReact: '^16.2.0',

  // Linting
  biome: '^1.9.4',

  // State Management
  reduxToolkit: '^2.5.0',
  reactRedux: '^9.2.0',
  zustand: '^5.0.2',
  jotai: '^2.11.0',
  pinia: '^2.3.0',
  valtio: '^2.1.2',

  // API Clients
  tanstackQuery: '^5.64.1',
  tanstackQueryDevtools: '^5.64.1',
  swr: '^2.3.0',
  axios: '^1.7.9',

  // Utilities
  husky: '^9.1.7',
  lintStaged: '^15.3.0',
  storybook: '^8.5.0',

  // Type Definitions
  typesReact: '^19.0.2',
  typesReactDom: '^19.0.2',
  typesNode: '^22.10.2',

  // Vue specific
  vueTsc: '^2.2.0',

  // Svelte specific
  tsconfigSvelte: '^5.0.4',
  tslib: '^2.8.1',
  svelteCheck: '^4.1.1',

  // Bundle analyzer
  rollupPluginVisualizer: '^5.14.0',

  // i18n
  reactI18next: '^15.1.3',
  i18next: '^24.2.0',
  vueI18n: '^10.0.5',
} as const;

/**
 * Type for the VERSIONS object keys
 */
export type VersionKey = keyof typeof VERSIONS;

/**
 * Helper function to get a version by key
 */
export function getVersion(key: VersionKey): string {
  return VERSIONS[key];
}
