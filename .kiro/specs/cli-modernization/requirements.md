# Requirements Document

## Introduction

This document specifies the requirements for modernizing the `create-viant-app` CLI tool. The modernization effort focuses on updating all dependencies to their latest stable versions, ensuring the CLI works correctly across all supported package managers, enhancing templates with modern technologies and plugins, and improving the overall developer experience. The goal is to make this CLI a competitive, comprehensive scaffolding tool that rivals established alternatives.

## Glossary

- **CLI**: Command Line Interface - the `create-viant-app` tool that scaffolds new projects
- **Template**: A pre-configured project structure for a specific framework (React, Vue, Svelte, Solid, Preact, Vanilla)
- **Package Manager**: Tools for managing dependencies (npm, pnpm, yarn, bun)
- **Vite**: The build tool used by all templates for fast development and optimized production builds
- **PWA**: Progressive Web App - web applications that can work offline and be installed
- **HMR**: Hot Module Replacement - instant updates during development without full page reload
- **Tailwind CSS**: A utility-first CSS framework
- **Biome**: A fast, modern linter and formatter replacing ESLint/Prettier
- **Vitest**: A Vite-native testing framework

## Requirements

### Requirement 1

**User Story:** As a developer, I want to install and run the CLI tool using any modern package manager, so that I can scaffold projects regardless of my preferred tooling.

#### Acceptance Criteria

1. WHEN a user runs `npm create viant-app` THEN the CLI SHALL launch the interactive project setup wizard
2. WHEN a user runs `pnpm create viant-app` THEN the CLI SHALL launch the interactive project setup wizard
3. WHEN a user runs `yarn create viant-app` THEN the CLI SHALL launch the interactive project setup wizard
4. WHEN a user runs `bun create viant-app` THEN the CLI SHALL launch the interactive project setup wizard
5. WHEN the CLI detects available package managers THEN the CLI SHALL list all detected managers in order of preference (bun, pnpm, yarn, npm)

### Requirement 2

**User Story:** As a developer, I want all CLI dependencies to be at their latest stable versions, so that I benefit from bug fixes, security patches, and new features.

#### Acceptance Criteria

1. WHEN the CLI is built THEN the CLI SHALL use Commander.js version 13.x or later for argument parsing
2. WHEN the CLI is built THEN the CLI SHALL use Chalk version 5.x or later for terminal styling
3. WHEN the CLI is built THEN the CLI SHALL use Prompts version 2.4.x or later for interactive prompts
4. WHEN the CLI is built THEN the CLI SHALL use Ora version 8.x or later for spinner animations
5. WHEN the CLI is built THEN the CLI SHALL use fs-extra version 11.x or later for file operations
6. WHEN the CLI is built THEN the CLI SHALL use TypeScript version 5.7.x or later for compilation

### Requirement 3

**User Story:** As a developer, I want all generated templates to use the latest stable framework versions, so that my new projects start with current best practices.

#### Acceptance Criteria

1. WHEN generating a React template THEN the CLI SHALL configure React version 19.x and React DOM version 19.x
2. WHEN generating a Vue template THEN the CLI SHALL configure Vue version 3.5.x or later
3. WHEN generating a Svelte template THEN the CLI SHALL configure Svelte version 5.x or later
4. WHEN generating a Solid template THEN the CLI SHALL configure Solid.js version 1.9.x or later
5. WHEN generating a Preact template THEN the CLI SHALL configure Preact version 10.25.x or later
6. WHEN generating any template THEN the CLI SHALL configure Vite version 6.x or later as the build tool
7. WHEN generating a TypeScript template THEN the CLI SHALL configure TypeScript version 5.7.x or later

### Requirement 4

**User Story:** As a developer, I want modern development tooling in my generated projects, so that I have fast linting, formatting, and testing out of the box.

#### Acceptance Criteria

1. WHEN the user selects linting feature THEN the CLI SHALL configure Biome version 1.9.x or later for linting and formatting
2. WHEN the user selects testing feature THEN the CLI SHALL configure Vitest version 3.x or later for unit testing
3. WHEN the user selects E2E testing feature THEN the CLI SHALL configure Playwright version 1.49.x or later
4. WHEN the user selects Storybook feature THEN the CLI SHALL configure Storybook version 8.x or later
5. WHEN the user selects git hooks feature THEN the CLI SHALL configure Husky version 9.x or later

### Requirement 5

**User Story:** As a developer, I want modern styling options in my generated projects, so that I can use current CSS technologies and frameworks.

#### Acceptance Criteria

1. WHEN the user selects Tailwind CSS THEN the CLI SHALL configure Tailwind CSS version 4.x with the new CSS-first configuration
2. WHEN the user selects UnoCSS THEN the CLI SHALL configure UnoCSS version 0.65.x or later
3. WHEN the user selects vanilla-extract THEN the CLI SHALL configure vanilla-extract version 1.16.x or later
4. WHEN the user selects Sass THEN the CLI SHALL configure Sass version 1.83.x or later
5. WHEN the user selects styled-components THEN the CLI SHALL configure styled-components version 6.1.x or later

### Requirement 6

**User Story:** As a developer, I want modern state management options, so that I can choose the best solution for my application architecture.

#### Acceptance Criteria

1. WHEN the user selects Redux Toolkit for React THEN the CLI SHALL configure @reduxjs/toolkit version 2.5.x or later
2. WHEN the user selects Zustand THEN the CLI SHALL configure Zustand version 5.x or later
3. WHEN the user selects Jotai THEN the CLI SHALL configure Jotai version 2.11.x or later
4. WHEN the user selects Pinia for Vue THEN the CLI SHALL configure Pinia version 2.3.x or later
5. WHEN the user selects TanStack Query THEN the CLI SHALL configure @tanstack/react-query version 5.64.x or later

### Requirement 7

**User Story:** As a developer, I want additional modern plugins and technologies available, so that my projects include cutting-edge tooling.

#### Acceptance Criteria

1. WHEN the user selects PWA support THEN the CLI SHALL configure vite-plugin-pwa version 0.21.x or later with Workbox
2. WHEN the user selects bundle analyzer THEN the CLI SHALL configure rollup-plugin-visualizer version 5.x or later
3. WHEN the user selects internationalization THEN the CLI SHALL configure the appropriate i18n library for the selected framework
4. WHEN the user selects API client THEN the CLI SHALL offer TanStack Query, SWR version 2.3.x, Axios version 1.7.x, or native fetch options
5. WHEN generating any template THEN the CLI SHALL configure path aliases using the @ symbol for src directory imports

### Requirement 8

**User Story:** As a developer, I want the generated project to have proper TypeScript configuration, so that I get maximum type safety and IDE support.

#### Acceptance Criteria

1. WHEN generating a TypeScript template THEN the CLI SHALL configure strict mode with all strict checks enabled
2. WHEN generating a TypeScript template THEN the CLI SHALL configure proper module resolution for ESM
3. WHEN generating a TypeScript template THEN the CLI SHALL include framework-specific type definitions
4. WHEN the user selects strict TypeScript mode feature THEN the CLI SHALL enable additional strict flags (noUncheckedIndexedAccess, exactOptionalPropertyTypes)

### Requirement 9

**User Story:** As a developer, I want the CLI to generate valid, working projects, so that I can start development immediately without fixing configuration issues.

#### Acceptance Criteria

1. WHEN a project is generated THEN the generated package.json SHALL contain valid JSON with all required fields
2. WHEN a project is generated with dependencies THEN the CLI SHALL successfully install all dependencies without errors
3. WHEN a project is generated THEN the development server SHALL start successfully with the `dev` script
4. WHEN a project is generated THEN the build command SHALL complete successfully with the `build` script
5. WHEN a project is generated with tests THEN the test command SHALL execute without configuration errors

### Requirement 10

**User Story:** As a developer, I want the CLI to provide clear feedback during project creation, so that I understand what is happening at each step.

#### Acceptance Criteria

1. WHEN the CLI starts THEN the CLI SHALL display an ASCII art banner with the tool name
2. WHEN the CLI is processing a step THEN the CLI SHALL display a spinner with a description of the current operation
3. WHEN an operation completes successfully THEN the CLI SHALL display a success indicator with a completion message
4. IF an error occurs during project creation THEN the CLI SHALL display a clear error message and clean up partial files
5. WHEN project creation completes THEN the CLI SHALL display next steps including commands to start development

### Requirement 11

**User Story:** As a developer, I want the CLI to support non-interactive mode, so that I can use it in scripts and CI/CD pipelines.

#### Acceptance Criteria

1. WHEN all required options are provided via command line flags THEN the CLI SHALL skip interactive prompts and generate the project directly
2. WHEN the `--template` flag is provided THEN the CLI SHALL use the specified template without prompting
3. WHEN the `--styling` flag is provided THEN the CLI SHALL use the specified styling solution without prompting
4. WHEN the `--skip-install` flag is provided THEN the CLI SHALL skip dependency installation
5. WHEN the `--skip-git` flag is provided THEN the CLI SHALL skip git repository initialization

### Requirement 12

**User Story:** As a developer, I want the generated projects to follow modern best practices, so that my codebase is maintainable and scalable.

#### Acceptance Criteria

1. WHEN generating a project THEN the CLI SHALL create a logical folder structure with separate directories for components, hooks, utils, and types
2. WHEN generating a project THEN the CLI SHALL include a properly configured .gitignore file
3. WHEN generating a project THEN the CLI SHALL configure ESM modules with `"type": "module"` in package.json
4. WHEN generating a React/Preact project THEN the CLI SHALL use the SWC compiler plugin for faster builds
5. WHEN generating any project THEN the CLI SHALL configure Vite with optimized build settings including code splitting
