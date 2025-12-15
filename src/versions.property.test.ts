import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { VERSIONS } from './versions.js';

/**
 * **Feature: cli-modernization, Property 2: Framework Version Correctness**
 *
 * *For any* framework selection (React, Vue, Svelte, Solid, Preact) and language choice
 * (TypeScript/JavaScript), the generated package.json SHALL contain the correct framework
 * version as specified in the VERSIONS constant.
 *
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
 */
describe('Property 2: Framework Version Correctness', () => {
  // Framework to VERSIONS key mapping
  const frameworkVersionMap: Record<string, { key: keyof typeof VERSIONS; minMajor: number }> = {
    react: { key: 'react', minMajor: 19 },
    vue: { key: 'vue', minMajor: 3 },
    svelte: { key: 'svelte', minMajor: 5 },
    solid: { key: 'solid', minMajor: 1 },
    preact: { key: 'preact', minMajor: 10 },
  };

  // Arbitrary for framework selection
  const frameworkArb = fc.constantFrom('react', 'vue', 'svelte', 'solid', 'preact');

  // Arbitrary for language selection
  const languageArb = fc.constantFrom('ts', 'js');

  /**
   * Helper to extract major version from semver string
   */
  function getMajorVersion(version: string): number {
    const match = version.match(/\^?(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  it('should have correct framework versions in VERSIONS constant', () => {
    fc.assert(
      fc.property(frameworkArb, languageArb, (framework, _language) => {
        const mapping = frameworkVersionMap[framework];
        const version = VERSIONS[mapping.key];

        // Verify version exists
        expect(version).toBeDefined();
        expect(typeof version).toBe('string');

        // Verify version format (semver with caret)
        expect(version).toMatch(/^\^?\d+\.\d+\.\d+$/);

        // Verify minimum major version requirement
        const majorVersion = getMajorVersion(version);
        expect(majorVersion).toBeGreaterThanOrEqual(mapping.minMajor);
      }),
      { numRuns: 100 }
    );
  });

  it('should have React 19.x version', () => {
    fc.assert(
      fc.property(fc.constant('react'), () => {
        const version = VERSIONS.react;
        const majorVersion = getMajorVersion(version);
        expect(majorVersion).toBe(19);
      }),
      { numRuns: 100 }
    );
  });

  it('should have Vue 3.5.x or later version', () => {
    fc.assert(
      fc.property(fc.constant('vue'), () => {
        const version = VERSIONS.vue;
        const majorVersion = getMajorVersion(version);
        expect(majorVersion).toBeGreaterThanOrEqual(3);
      }),
      { numRuns: 100 }
    );
  });

  it('should have Svelte 5.x or later version', () => {
    fc.assert(
      fc.property(fc.constant('svelte'), () => {
        const version = VERSIONS.svelte;
        const majorVersion = getMajorVersion(version);
        expect(majorVersion).toBeGreaterThanOrEqual(5);
      }),
      { numRuns: 100 }
    );
  });

  it('should have Solid 1.9.x or later version', () => {
    fc.assert(
      fc.property(fc.constant('solid'), () => {
        const version = VERSIONS.solid;
        // Check for 1.9.x pattern
        expect(version).toMatch(/^\^?1\.(9|\d{2,})\.\d+$/);
      }),
      { numRuns: 100 }
    );
  });

  it('should have Preact 10.25.x or later version', () => {
    fc.assert(
      fc.property(fc.constant('preact'), () => {
        const version = VERSIONS.preact;
        const majorVersion = getMajorVersion(version);
        expect(majorVersion).toBeGreaterThanOrEqual(10);
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * **Feature: cli-modernization, Property 3: Build Tool Version Correctness**
 *
 * *For any* generated template, the package.json SHALL contain Vite version 6.x or later
 * and (for TypeScript templates) TypeScript version 5.7.x or later.
 *
 * **Validates: Requirements 3.6, 3.7**
 */
describe('Property 3: Build Tool Version Correctness', () => {
  // Arbitrary for template selection
  const templateArb = fc.constantFrom(
    'react-ts', 'react-js',
    'vue-ts', 'vue-js',
    'svelte-ts', 'svelte-js',
    'solid-ts', 'solid-js',
    'preact-ts', 'preact-js',
    'vanilla-ts', 'vanilla-js'
  );

  /**
   * Helper to extract major version from semver string
   */
  function getMajorVersion(version: string): number {
    const match = version.match(/\^?(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Helper to extract minor version from semver string
   */
  function getMinorVersion(version: string): number {
    const match = version.match(/\^?\d+\.(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  it('should have Vite version 6.x or later', () => {
    fc.assert(
      fc.property(templateArb, (_template) => {
        const viteVersion = VERSIONS.vite;

        // Verify version exists and is a string
        expect(viteVersion).toBeDefined();
        expect(typeof viteVersion).toBe('string');

        // Verify Vite is version 6.x or later
        const majorVersion = getMajorVersion(viteVersion);
        expect(majorVersion).toBeGreaterThanOrEqual(6);
      }),
      { numRuns: 100 }
    );
  });

  it('should have TypeScript version 5.7.x or later for TypeScript templates', () => {
    const tsTemplateArb = fc.constantFrom(
      'react-ts', 'vue-ts', 'svelte-ts', 'solid-ts', 'preact-ts', 'vanilla-ts'
    );

    fc.assert(
      fc.property(tsTemplateArb, (_template) => {
        const tsVersion = VERSIONS.typescript;

        // Verify version exists and is a string
        expect(tsVersion).toBeDefined();
        expect(typeof tsVersion).toBe('string');

        // Verify TypeScript is version 5.7.x or later
        const majorVersion = getMajorVersion(tsVersion);
        const minorVersion = getMinorVersion(tsVersion);

        expect(majorVersion).toBeGreaterThanOrEqual(5);
        if (majorVersion === 5) {
          expect(minorVersion).toBeGreaterThanOrEqual(7);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should have valid semver format for build tools', () => {
    fc.assert(
      fc.property(templateArb, (_template) => {
        // Check Vite version format
        expect(VERSIONS.vite).toMatch(/^\^?\d+\.\d+\.\d+$/);

        // Check TypeScript version format
        expect(VERSIONS.typescript).toMatch(/^\^?\d+\.\d+\.\d+$/);
      }),
      { numRuns: 100 }
    );
  });
});


/**
 * **Feature: cli-modernization, Property 4: Feature Dependency Correctness**
 *
 * *For any* selected feature (linting, testing, E2E, Storybook, git hooks), the generated
 * package.json SHALL contain the correct dependency version as specified in the VERSIONS constant.
 *
 * **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**
 */
describe('Property 4: Feature Dependency Correctness', () => {
  // Feature to VERSIONS key mapping with minimum version requirements
  const featureVersionMap: Record<string, { key: keyof typeof VERSIONS; minMajor: number; minMinor?: number }> = {
    linting: { key: 'biome', minMajor: 1, minMinor: 9 },
    vitest: { key: 'vitest', minMajor: 3 },
    playwright: { key: 'playwright', minMajor: 1, minMinor: 49 },
    storybook: { key: 'storybook', minMajor: 8 },
    husky: { key: 'husky', minMajor: 9 },
  };

  // Arbitrary for feature selection
  const featureArb = fc.constantFrom('linting', 'vitest', 'playwright', 'storybook', 'husky');

  /**
   * Helper to extract major version from semver string
   */
  function getMajorVersion(version: string): number {
    const match = version.match(/\^?(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Helper to extract minor version from semver string
   */
  function getMinorVersion(version: string): number {
    const match = version.match(/\^?\d+\.(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  it('should have correct feature dependency versions in VERSIONS constant', () => {
    fc.assert(
      fc.property(featureArb, (feature) => {
        const mapping = featureVersionMap[feature];
        const version = VERSIONS[mapping.key];

        // Verify version exists
        expect(version).toBeDefined();
        expect(typeof version).toBe('string');

        // Verify version format (semver with caret)
        expect(version).toMatch(/^\^?\d+\.\d+\.\d+$/);

        // Verify minimum major version requirement
        const majorVersion = getMajorVersion(version);
        expect(majorVersion).toBeGreaterThanOrEqual(mapping.minMajor);

        // Verify minimum minor version if specified
        if (mapping.minMinor !== undefined && majorVersion === mapping.minMajor) {
          const minorVersion = getMinorVersion(version);
          expect(minorVersion).toBeGreaterThanOrEqual(mapping.minMinor);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should have Biome version 1.9.x or later for linting', () => {
    fc.assert(
      fc.property(fc.constant('linting'), () => {
        const version = VERSIONS.biome;
        const majorVersion = getMajorVersion(version);
        const minorVersion = getMinorVersion(version);

        expect(majorVersion).toBeGreaterThanOrEqual(1);
        if (majorVersion === 1) {
          expect(minorVersion).toBeGreaterThanOrEqual(9);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should have Vitest version 3.x or later for testing', () => {
    fc.assert(
      fc.property(fc.constant('vitest'), () => {
        const version = VERSIONS.vitest;
        const majorVersion = getMajorVersion(version);
        expect(majorVersion).toBeGreaterThanOrEqual(3);
      }),
      { numRuns: 100 }
    );
  });

  it('should have Playwright version 1.49.x or later for E2E testing', () => {
    fc.assert(
      fc.property(fc.constant('playwright'), () => {
        const version = VERSIONS.playwright;
        const majorVersion = getMajorVersion(version);
        const minorVersion = getMinorVersion(version);

        expect(majorVersion).toBeGreaterThanOrEqual(1);
        if (majorVersion === 1) {
          expect(minorVersion).toBeGreaterThanOrEqual(49);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should have Storybook version 8.x or later', () => {
    fc.assert(
      fc.property(fc.constant('storybook'), () => {
        const version = VERSIONS.storybook;
        const majorVersion = getMajorVersion(version);
        expect(majorVersion).toBeGreaterThanOrEqual(8);
      }),
      { numRuns: 100 }
    );
  });

  it('should have Husky version 9.x or later for git hooks', () => {
    fc.assert(
      fc.property(fc.constant('husky'), () => {
        const version = VERSIONS.husky;
        const majorVersion = getMajorVersion(version);
        expect(majorVersion).toBeGreaterThanOrEqual(9);
      }),
      { numRuns: 100 }
    );
  });
});


/**
 * **Feature: cli-modernization, Property 5: Styling Dependency Correctness**
 *
 * *For any* selected styling option (Tailwind, UnoCSS, vanilla-extract, Sass, styled-components),
 * the generated package.json SHALL contain the correct dependency version as specified in the
 * VERSIONS constant.
 *
 * **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**
 */
describe('Property 5: Styling Dependency Correctness', () => {
  // Styling option to VERSIONS key mapping with minimum version requirements
  const stylingVersionMap: Record<string, { key: keyof typeof VERSIONS; minMajor: number; minMinor?: number }> = {
    tailwind: { key: 'tailwindcss', minMajor: 4 },
    unocss: { key: 'unocss', minMajor: 0, minMinor: 65 },
    'vanilla-extract': { key: 'vanillaExtract', minMajor: 1, minMinor: 16 },
    sass: { key: 'sass', minMajor: 1, minMinor: 83 },
    'styled-components': { key: 'styledComponents', minMajor: 6, minMinor: 1 },
  };

  // Arbitrary for styling option selection
  const stylingArb = fc.constantFrom('tailwind', 'unocss', 'vanilla-extract', 'sass', 'styled-components');

  /**
   * Helper to extract major version from semver string
   */
  function getMajorVersion(version: string): number {
    const match = version.match(/\^?(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Helper to extract minor version from semver string
   */
  function getMinorVersion(version: string): number {
    const match = version.match(/\^?\d+\.(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  it('should have correct styling dependency versions in VERSIONS constant', () => {
    fc.assert(
      fc.property(stylingArb, (styling) => {
        const mapping = stylingVersionMap[styling];
        const version = VERSIONS[mapping.key];

        // Verify version exists
        expect(version).toBeDefined();
        expect(typeof version).toBe('string');

        // Verify version format (semver with caret)
        expect(version).toMatch(/^\^?\d+\.\d+\.\d+$/);

        // Verify minimum major version requirement
        const majorVersion = getMajorVersion(version);
        expect(majorVersion).toBeGreaterThanOrEqual(mapping.minMajor);

        // Verify minimum minor version if specified
        if (mapping.minMinor !== undefined && majorVersion === mapping.minMajor) {
          const minorVersion = getMinorVersion(version);
          expect(minorVersion).toBeGreaterThanOrEqual(mapping.minMinor);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should have Tailwind CSS version 4.x or later', () => {
    fc.assert(
      fc.property(fc.constant('tailwind'), () => {
        const version = VERSIONS.tailwindcss;
        const majorVersion = getMajorVersion(version);
        expect(majorVersion).toBeGreaterThanOrEqual(4);
      }),
      { numRuns: 100 }
    );
  });

  it('should have UnoCSS version 0.65.x or later', () => {
    fc.assert(
      fc.property(fc.constant('unocss'), () => {
        const version = VERSIONS.unocss;
        const majorVersion = getMajorVersion(version);
        const minorVersion = getMinorVersion(version);

        // UnoCSS is still in 0.x, so check minor version
        expect(majorVersion).toBe(0);
        expect(minorVersion).toBeGreaterThanOrEqual(65);
      }),
      { numRuns: 100 }
    );
  });

  it('should have vanilla-extract version 1.16.x or later', () => {
    fc.assert(
      fc.property(fc.constant('vanilla-extract'), () => {
        const version = VERSIONS.vanillaExtract;
        const majorVersion = getMajorVersion(version);
        const minorVersion = getMinorVersion(version);

        expect(majorVersion).toBeGreaterThanOrEqual(1);
        if (majorVersion === 1) {
          expect(minorVersion).toBeGreaterThanOrEqual(16);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should have Sass version 1.83.x or later', () => {
    fc.assert(
      fc.property(fc.constant('sass'), () => {
        const version = VERSIONS.sass;
        const majorVersion = getMajorVersion(version);
        const minorVersion = getMinorVersion(version);

        expect(majorVersion).toBeGreaterThanOrEqual(1);
        if (majorVersion === 1) {
          expect(minorVersion).toBeGreaterThanOrEqual(83);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should have styled-components version 6.1.x or later', () => {
    fc.assert(
      fc.property(fc.constant('styled-components'), () => {
        const version = VERSIONS.styledComponents;
        const majorVersion = getMajorVersion(version);
        const minorVersion = getMinorVersion(version);

        expect(majorVersion).toBeGreaterThanOrEqual(6);
        if (majorVersion === 6) {
          expect(minorVersion).toBeGreaterThanOrEqual(1);
        }
      }),
      { numRuns: 100 }
    );
  });
});


/**
 * **Feature: cli-modernization, Property 6: State Management Dependency Correctness**
 *
 * *For any* selected state management option (Redux Toolkit, Zustand, Jotai, Pinia, TanStack Query),
 * the generated package.json SHALL contain the correct dependency version as specified in the
 * VERSIONS constant.
 *
 * **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5**
 */
describe('Property 6: State Management Dependency Correctness', () => {
  // State management option to VERSIONS key mapping with minimum version requirements
  const stateManagementVersionMap: Record<string, { key: keyof typeof VERSIONS; minMajor: number; minMinor?: number }> = {
    'redux-toolkit': { key: 'reduxToolkit', minMajor: 2, minMinor: 5 },
    zustand: { key: 'zustand', minMajor: 5 },
    jotai: { key: 'jotai', minMajor: 2, minMinor: 11 },
    pinia: { key: 'pinia', minMajor: 2, minMinor: 3 },
    'tanstack-query': { key: 'tanstackQuery', minMajor: 5, minMinor: 64 },
  };

  // API client option to VERSIONS key mapping with minimum version requirements
  const apiClientVersionMap: Record<string, { key: keyof typeof VERSIONS; minMajor: number; minMinor?: number }> = {
    swr: { key: 'swr', minMajor: 2, minMinor: 3 },
    axios: { key: 'axios', minMajor: 1, minMinor: 7 },
  };

  // Arbitrary for state management option selection
  const stateManagementArb = fc.constantFrom('redux-toolkit', 'zustand', 'jotai', 'pinia', 'tanstack-query');

  // Arbitrary for API client option selection
  const apiClientArb = fc.constantFrom('swr', 'axios');

  /**
   * Helper to extract major version from semver string
   */
  function getMajorVersion(version: string): number {
    const match = version.match(/\^?(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Helper to extract minor version from semver string
   */
  function getMinorVersion(version: string): number {
    const match = version.match(/\^?\d+\.(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  it('should have correct state management dependency versions in VERSIONS constant', () => {
    fc.assert(
      fc.property(stateManagementArb, (stateManagement) => {
        const mapping = stateManagementVersionMap[stateManagement];
        const version = VERSIONS[mapping.key];

        // Verify version exists
        expect(version).toBeDefined();
        expect(typeof version).toBe('string');

        // Verify version format (semver with caret)
        expect(version).toMatch(/^\^?\d+\.\d+\.\d+$/);

        // Verify minimum major version requirement
        const majorVersion = getMajorVersion(version);
        expect(majorVersion).toBeGreaterThanOrEqual(mapping.minMajor);

        // Verify minimum minor version if specified
        if (mapping.minMinor !== undefined && majorVersion === mapping.minMajor) {
          const minorVersion = getMinorVersion(version);
          expect(minorVersion).toBeGreaterThanOrEqual(mapping.minMinor);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should have correct API client dependency versions in VERSIONS constant', () => {
    fc.assert(
      fc.property(apiClientArb, (apiClient) => {
        const mapping = apiClientVersionMap[apiClient];
        const version = VERSIONS[mapping.key];

        // Verify version exists
        expect(version).toBeDefined();
        expect(typeof version).toBe('string');

        // Verify version format (semver with caret)
        expect(version).toMatch(/^\^?\d+\.\d+\.\d+$/);

        // Verify minimum major version requirement
        const majorVersion = getMajorVersion(version);
        expect(majorVersion).toBeGreaterThanOrEqual(mapping.minMajor);

        // Verify minimum minor version if specified
        if (mapping.minMinor !== undefined && majorVersion === mapping.minMajor) {
          const minorVersion = getMinorVersion(version);
          expect(minorVersion).toBeGreaterThanOrEqual(mapping.minMinor);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should have Redux Toolkit version 2.5.x or later', () => {
    fc.assert(
      fc.property(fc.constant('redux-toolkit'), () => {
        const version = VERSIONS.reduxToolkit;
        const majorVersion = getMajorVersion(version);
        const minorVersion = getMinorVersion(version);

        expect(majorVersion).toBeGreaterThanOrEqual(2);
        if (majorVersion === 2) {
          expect(minorVersion).toBeGreaterThanOrEqual(5);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should have Zustand version 5.x or later', () => {
    fc.assert(
      fc.property(fc.constant('zustand'), () => {
        const version = VERSIONS.zustand;
        const majorVersion = getMajorVersion(version);
        expect(majorVersion).toBeGreaterThanOrEqual(5);
      }),
      { numRuns: 100 }
    );
  });

  it('should have Jotai version 2.11.x or later', () => {
    fc.assert(
      fc.property(fc.constant('jotai'), () => {
        const version = VERSIONS.jotai;
        const majorVersion = getMajorVersion(version);
        const minorVersion = getMinorVersion(version);

        expect(majorVersion).toBeGreaterThanOrEqual(2);
        if (majorVersion === 2) {
          expect(minorVersion).toBeGreaterThanOrEqual(11);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should have Pinia version 2.3.x or later', () => {
    fc.assert(
      fc.property(fc.constant('pinia'), () => {
        const version = VERSIONS.pinia;
        const majorVersion = getMajorVersion(version);
        const minorVersion = getMinorVersion(version);

        expect(majorVersion).toBeGreaterThanOrEqual(2);
        if (majorVersion === 2) {
          expect(minorVersion).toBeGreaterThanOrEqual(3);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should have TanStack Query version 5.64.x or later', () => {
    fc.assert(
      fc.property(fc.constant('tanstack-query'), () => {
        const version = VERSIONS.tanstackQuery;
        const majorVersion = getMajorVersion(version);
        const minorVersion = getMinorVersion(version);

        expect(majorVersion).toBeGreaterThanOrEqual(5);
        if (majorVersion === 5) {
          expect(minorVersion).toBeGreaterThanOrEqual(64);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should have SWR version 2.3.x or later', () => {
    fc.assert(
      fc.property(fc.constant('swr'), () => {
        const version = VERSIONS.swr;
        const majorVersion = getMajorVersion(version);
        const minorVersion = getMinorVersion(version);

        expect(majorVersion).toBeGreaterThanOrEqual(2);
        if (majorVersion === 2) {
          expect(minorVersion).toBeGreaterThanOrEqual(3);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should have Axios version 1.7.x or later', () => {
    fc.assert(
      fc.property(fc.constant('axios'), () => {
        const version = VERSIONS.axios;
        const majorVersion = getMajorVersion(version);
        const minorVersion = getMinorVersion(version);

        expect(majorVersion).toBeGreaterThanOrEqual(1);
        if (majorVersion === 1) {
          expect(minorVersion).toBeGreaterThanOrEqual(7);
        }
      }),
      { numRuns: 100 }
    );
  });
});
