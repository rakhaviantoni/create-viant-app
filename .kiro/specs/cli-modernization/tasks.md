# Implementation Plan

- [x] 1. Update CLI dependencies and setup testing infrastructure
  - [x] 1.1 Update package.json with latest CLI dependencies
    - Update commander to ^13.0.0
    - Update chalk to ^5.4.1
    - Update ora to ^8.1.1
    - Update prompts to ^2.4.2
    - Update fs-extra to ^11.2.0
    - Update typescript to ^5.7.2
    - Add fast-check ^3.23.2 for property-based testing
    - Add vitest ^3.0.2 for testing
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 1.2 Create VERSIONS constant file with all dependency versions
    - Create src/versions.ts with centralized version management
    - Include all framework versions (React 19, Vue 3.5, Svelte 5, etc.)
    - Include all tooling versions (Vite 6, TypeScript 5.7, etc.)
    - Include all styling versions (Tailwind 4, UnoCSS 0.65, etc.)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 1.3 Setup Vitest configuration for testing
    - Create vitest.config.ts with node environment
    - Configure test patterns for unit and property tests
    - _Requirements: 9.5_

  - [x] 1.4 Write property test for package manager detection order
    - **Property 1: Package Manager Detection Order**
    - **Validates: Requirements 1.5**

- [x] 2. Refactor CLI core with updated dependencies
  - [x] 2.1 Update detectPackageManagers function
    - Ensure correct ordering: bun > pnpm > yarn > npm
    - Add proper error handling for detection
    - _Requirements: 1.5_

  - [x] 2.2 Update ProjectGenerator class to use VERSIONS constant
    - Import versions from src/versions.ts
    - Replace hardcoded versions with VERSIONS constant references
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [x] 2.3 Write property test for framework version correctness
    - **Property 2: Framework Version Correctness**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

  - [x] 2.4 Write property test for build tool version correctness
    - **Property 3: Build Tool Version Correctness**
    - **Validates: Requirements 3.6, 3.7**

- [x] 3. Update feature dependency configuration
  - [x] 3.1 Update addFeatureDependencies method with latest versions
    - Update Biome to ^1.9.4
    - Update Vitest to ^3.0.2
    - Update Playwright to ^1.49.1
    - Update Storybook to ^8.5.0
    - Update Husky to ^9.1.7
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 3.2 Write property test for feature dependency correctness
    - **Property 4: Feature Dependency Correctness**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**

- [x] 4. Update styling configuration
  - [x] 4.1 Update addStylingDependencies method with latest versions
    - Update Tailwind CSS to ^4.0.0 with new CSS-first config
    - Update UnoCSS to ^0.65.3
    - Update vanilla-extract to ^1.16.1
    - Update Sass to ^1.83.1
    - Update styled-components to ^6.1.14
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 4.2 Update addStylingConfigs method for Tailwind CSS 4
    - Tailwind 4 uses CSS-first configuration (no tailwind.config.js needed)
    - Update CSS file with @import "tailwindcss" syntax
    - _Requirements: 5.1_

  - [x] 4.3 Write property test for styling dependency correctness
    - **Property 5: Styling Dependency Correctness**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**

- [x] 5. Update state management and API client configuration
  - [x] 5.1 Update addStateManagementDependencies method
    - Update Redux Toolkit to ^2.5.0
    - Update Zustand to ^5.0.2
    - Update Jotai to ^2.11.0
    - Update Pinia to ^2.3.0
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 5.2 Update addApiClientDependencies method
    - Update TanStack Query to ^5.64.1
    - Update SWR to ^2.3.0
    - Update Axios to ^1.7.9
    - _Requirements: 6.5, 7.4_

  - [x] 5.3 Write property test for state management dependency correctness
    - **Property 6: State Management Dependency Correctness**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5**

- [x] 6. Checkpoint - Make sure all tests are passing
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Update template files
  - [x] 7.1 Update react-ts template
    - Update package.json with React 19, Vite 6, TypeScript 5.7
    - Update vite.config.ts with @vitejs/plugin-react-swc ^3.7.2
    - Update tsconfig.json with strict mode and path aliases
    - _Requirements: 3.1, 3.6, 3.7, 7.5, 8.1, 8.2, 12.4_

  - [x] 7.2 Update react-js template
    - Update package.json with React 19, Vite 6
    - Update vite.config.js with @vitejs/plugin-react-swc ^3.7.2
    - _Requirements: 3.1, 3.6, 12.4_

  - [x] 7.3 Update vue-ts template
    - Update package.json with Vue 3.5, Vite 6, TypeScript 5.7
    - Update vite.config.ts with @vitejs/plugin-vue ^5.2.1
    - Update tsconfig.json with strict mode and path aliases
    - _Requirements: 3.2, 3.6, 3.7, 7.5, 8.1, 8.2_

  - [x] 7.4 Update vue-js template
    - Update package.json with Vue 3.5, Vite 6
    - Update vite.config.js with @vitejs/plugin-vue ^5.2.1
    - _Requirements: 3.2, 3.6_

  - [x] 7.5 Update svelte-ts template
    - Update package.json with Svelte 5, Vite 6, TypeScript 5.7
    - Update vite.config.ts with @sveltejs/vite-plugin-svelte ^5.0.3
    - Update tsconfig.json with strict mode and path aliases
    - _Requirements: 3.3, 3.6, 3.7, 7.5, 8.1, 8.2_

  - [x] 7.6 Update svelte-js template
    - Update package.json with Svelte 5, Vite 6
    - Update vite.config.js with @sveltejs/vite-plugin-svelte ^5.0.3
    - _Requirements: 3.3, 3.6_

  - [x] 7.7 Update solid-ts template
    - Update package.json with Solid 1.9, Vite 6, TypeScript 5.7
    - Update vite.config.ts with vite-plugin-solid ^2.11.0
    - Update tsconfig.json with strict mode and path aliases
    - _Requirements: 3.4, 3.6, 3.7, 7.5, 8.1, 8.2_

  - [x] 7.8 Update solid-js template
    - Update package.json with Solid 1.9, Vite 6
    - Update vite.config.js with vite-plugin-solid ^2.11.0
    - _Requirements: 3.4, 3.6_

  - [x] 7.9 Update preact-ts template
    - Update package.json with Preact 10.25, Vite 6, TypeScript 5.7
    - Update vite.config.ts with @preact/preset-vite ^2.9.4
    - Update tsconfig.json with strict mode and path aliases
    - _Requirements: 3.5, 3.6, 3.7, 7.5, 8.1, 8.2_

  - [x] 7.10 Update preact-js template
    - Update package.json with Preact 10.25, Vite 6
    - Update vite.config.js with @preact/preset-vite ^2.9.4
    - _Requirements: 3.5, 3.6_

  - [x] 7.11 Update vanilla-ts template
    - Update package.json with Vite 6, TypeScript 5.7
    - Update tsconfig.json with strict mode and path aliases
    - _Requirements: 3.6, 3.7, 7.5, 8.1, 8.2_

  - [x] 7.12 Update vanilla-js template
    - Update package.json with Vite 6
    - _Requirements: 3.6_

- [x] 8. Add TypeScript configuration enhancements
  - [x] 8.1 Update TypeScript template configurations
    - Add moduleResolution: "bundler" for ESM
    - Add path aliases (@/* -> ./src/*)
    - Enable strict mode by default
    - _Requirements: 8.1, 8.2, 8.3, 7.5_

  - [x] 8.2 Add strict-ts feature configuration
    - Add noUncheckedIndexedAccess: true
    - Add exactOptionalPropertyTypes: true
    - _Requirements: 8.4_

  - [x] 8.3 Write property test for TypeScript strict mode
    - **Property 11: TypeScript Strict Mode**
    - **Validates: Requirements 8.1, 8.4**

  - [x] 8.4 Write property test for path alias configuration
    - **Property 10: Path Alias Configuration**
    - **Validates: Requirements 7.5**

- [x] 9. Checkpoint - Make sure all tests are passing
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Update project generation and validation
  - [x] 10.1 Update customizePackageJson to ensure valid output
    - Ensure all required fields are present
    - Ensure "type": "module" is set
    - Validate JSON structure before writing
    - _Requirements: 9.1, 12.3_

  - [x] 10.2 Write property test for generated package.json validity
    - **Property 7: Generated Package.json Validity**
    - **Validates: Requirements 9.1**

  - [x] 10.3 Update project structure generation
    - Ensure src/ directory with appropriate subdirectories
    - Ensure .gitignore is properly configured
    - _Requirements: 12.1, 12.2_

  - [x] 10.4 Write property test for project structure correctness
    - **Property 9: Project Structure Correctness**
    - **Validates: Requirements 12.1, 12.2, 12.3**

- [x] 11. Update CLI flags and non-interactive mode
  - [x] 11.1 Verify CLI flag handling
    - Ensure --template flag works correctly
    - Ensure --styling flag works correctly
    - Ensure --skip-install skips node_modules creation
    - Ensure --skip-git skips .git creation
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

  - [x] 11.2 Write property test for CLI flag effects
    - **Property 8: CLI Flag Effect Correctness**
    - **Validates: Requirements 11.2, 11.3, 11.4, 11.5**

- [x] 12. Update error handling and cleanup
  - [x] 12.1 Enhance error handling with proper cleanup
    - Ensure cleanup removes partial project on error
    - Add clear error messages for common failures
    - _Requirements: 10.4_

  - [x] 12.2 Write property test for error cleanup
    - **Property 12: Error Cleanup**
    - **Validates: Requirements 10.4**

- [x] 13. Update additional plugins configuration
  - [x] 13.1 Update PWA plugin configuration
    - Update vite-plugin-pwa to ^0.21.1
    - Configure Workbox for offline support
    - _Requirements: 7.1_

  - [x] 13.2 Update bundle analyzer configuration
    - Update to rollup-plugin-visualizer ^5.14.0
    - _Requirements: 7.2_

  - [x] 13.3 Add internationalization support
    - Add react-i18next for React templates
    - Add vue-i18n for Vue templates
    - Add appropriate i18n libraries for other frameworks
    - _Requirements: 7.3_

- [x] 14. Update Vite configuration for optimized builds
  - [x] 14.1 Update vite.config templates with build optimizations
    - Add code splitting configuration
    - Add tree shaking optimization
    - Configure proper chunk naming
    - _Requirements: 12.5_

- [x] 15. Final Checkpoint - Make sure all tests are passing
  - Ensure all tests pass, ask the user if questions arise.
