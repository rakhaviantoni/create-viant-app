#!/usr/bin/env node

import { execSync, spawn } from 'child_process';
import { existsSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'fs';
import pkg from 'fs-extra';
const { copySync } = pkg;
import { resolve, join, dirname } from 'path';
import { Command } from 'commander';
import prompts from 'prompts';
import chalk from 'chalk';
import ora from 'ora';
import figlet from 'figlet';
import gradient from 'gradient-string';
// @ts-ignore
import validateProjectName from 'validate-npm-package-name';
import * as readline from 'readline';
import { stdin, stdout, exit } from 'process';

// Get current directory using process.cwd() as fallback
const __dirname = process.cwd();

// Enhanced ASCII Art Banner with gradients
const createBanner = () => {
  const viantText = figlet.textSync('VIANT', {
    font: 'Slant',
  });
  
  return gradient.pastel(viantText) + 
    '\n' + gradient.vice('⚡ Modern web apps, instantly. Multi-framework support.') + 
    '\n' + chalk.cyan('🚀 React • Vue • Svelte • Solid • Preact • Vanilla') + 
    '\n' + chalk.cyan('✨ TypeScript/JavaScript • Multiple styling options • Rich features') + '\n';
};

// Template definitions
interface Template {
  [key: string]: string;
}

const templates: Template = {
  'react-ts': 'React with TypeScript: A comprehensive Vite-powered setup. Optional Tailwind CSS & PWA. (recommended)',
  'react-js': 'React with JavaScript: A minimal Vite-powered setup. Optional Tailwind CSS & PWA.',
  'preact-ts': 'Preact with TypeScript: Lightweight React alternative (3KB). Fast and modern.',
  'preact-js': 'Preact with JavaScript: Lightweight React alternative with minimal bundle size.',
  'vue-ts': 'Vue 3 with TypeScript: Progressive framework with Composition API and excellent DX.',
  'vue-js': 'Vue 3 with JavaScript: Approachable, performant & versatile framework.',
  'svelte-ts': 'Svelte with TypeScript: Compile-time optimized framework with no virtual DOM.',
  'svelte-js': 'Svelte with JavaScript: Truly reactive framework with minimal runtime.',
  'solid-ts': 'Solid with TypeScript: Fine-grained reactivity with JSX. React-like but faster.',
  'solid-js': 'Solid with JavaScript: High-performance reactive framework with JSX.',
  'vanilla-ts': 'Vanilla TypeScript: Pure TypeScript with Vite for maximum control.',
  'vanilla-js': 'Vanilla JavaScript: Pure JavaScript with Vite for lightweight projects.',
};

interface StylingOptions {
  [key: string]: string;
}

const stylingOptions: StylingOptions = {
  tailwind: 'Utility-first CSS framework (recommended)',
  'styled-components': 'CSS-in-JS library (React/Preact only)',
  'emotion': 'Performant CSS-in-JS library',
  'css-modules': 'Scoped CSS with local class names',
  sass: 'CSS preprocessor with variables and mixins',
  less: 'CSS preprocessor with dynamic behavior',
  stylus: 'Expressive, dynamic CSS preprocessor',
  'vanilla-extract': 'Zero-runtime CSS-in-TypeScript',
  unocss: 'Instant on-demand atomic CSS engine',
  none: 'No styling framework (plain CSS)'
};

// Feature options
interface FeatureOption {
  name: string;
  value: string;
}

const featureOptions: FeatureOption[] = [
  { name: 'PWA Support', value: 'pwa' },
  { name: 'Bundle Analyzer', value: 'analyzer' },
  { name: 'GitHub Actions CI/CD', value: 'github-actions' },
  { name: 'Docker Configuration', value: 'docker' },
  { name: 'Storybook', value: 'storybook' },
  { name: 'Husky Git Hooks', value: 'husky' },
  { name: 'Vitest Testing', value: 'vitest' },
  { name: 'Playwright E2E Testing', value: 'playwright' },
  { name: 'ESLint + Prettier', value: 'linting' },
  { name: 'TypeScript Strict Mode', value: 'strict-ts' },
  { name: 'Component Library Setup', value: 'component-lib' },
  { name: 'Internationalization (i18n)', value: 'i18n' },
  { name: 'State Management', value: 'state-management' },
  { name: 'API Client Setup', value: 'api-client' }
];

// Project options interface
interface ProjectOptions {
  name: string;
  template: string;
  styling: string;
  packageManager: string;
  features: string[];
  installDeps: boolean;
  initGit: boolean;
  typescript: boolean;
  runDev?: boolean;
  framework: string;
  stateManagement?: string;
  apiClient?: string;
}

/**
 * Create a synchronous question helper
 */
function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: stdin,
    output: stdout,
  });

  return new Promise(resolve => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

/**
 * Detect available package managers
 */
function detectPackageManagers(): string[] {
  const managers: string[] = [];
  const commands = ['bun', 'pnpm', 'yarn', 'npm'];
  
  for (const cmd of commands) {
    try {
      execSync(`${cmd} --version`, { stdio: 'ignore' });
      managers.push(cmd);
    } catch {
      // Manager not available
    }
  }
  
  return managers.length > 0 ? managers : ['npm'];
}

/**
 * Validate project name
 */
function validateName(name: string): boolean | string {
  if (!name) return 'Project name is required';
  
  const validation = validateProjectName(name);
  if (validation.validForNewPackages) {
    return true;
  }
  
  const errors = [...(validation.errors || []), ...(validation.warnings || [])];
  return `Invalid project name: ${errors.join(', ')}`;
}

/**
 * Get project options through interactive prompts
 */
async function getProjectOptions(projectName?: string): Promise<ProjectOptions> {
  console.log(createBanner());
  
  const availableManagers = detectPackageManagers();
  
  // Prepare prompts
  const questions: any[] = [];

  // Project name
  if (!projectName) {
    questions.push({
      type: 'text',
      name: 'name',
      message: chalk.bold('Project name:'),
      initial: 'my-viant-app',
      validate: validateName
    });
  }

  // Framework selection
  const frameworks = {
    'react': 'React - A library for building user interfaces',
    'vue': 'Vue - The Progressive JavaScript Framework',
    'svelte': 'Svelte - Cybernetically enhanced web apps',
    'solid': 'Solid - Simple and performant reactivity',
    'preact': 'Preact - Fast 3kB alternative to React',
    'vanilla': 'Vanilla - Pure JavaScript/TypeScript'
  };

  questions.push({
    type: 'select',
    name: 'framework',
    message: chalk.bold('Choose a framework:'),
    choices: Object.entries(frameworks).map(([value, description]) => ({
      title: value,
      description,
      value
    })),
    initial: 0
  });

  // TypeScript selection
  questions.push({
    type: 'confirm',
    name: 'typescript',
    message: chalk.bold('Use TypeScript?'),
    initial: true
  });

  // Styling solution (conditional based on framework)
  questions.push({
    type: 'select',
    name: 'styling',
    message: chalk.bold('Which styling solution would you prefer?'),
    choices: (prev: any) => {
      const framework = prev.framework;
      let availableOptions = Object.entries(stylingOptions);
      
      // Filter out framework-specific options
      if (!['react', 'preact'].includes(framework)) {
        availableOptions = availableOptions.filter(([key]) => key !== 'styled-components');
      }
      
      return availableOptions.map(([value, description]) => ({
        title: value,
        description,
        value
      }));
    },
    initial: 0
  });

  // Package manager
  questions.push({
    type: 'select',
    name: 'packageManager',
    message: chalk.bold('Package manager:'),
    choices: availableManagers.map(manager => ({
      title: manager,
      value: manager
    })),
    initial: 0
  });

  // Additional features
  questions.push({
    type: 'multiselect',
    name: 'features',
    message: chalk.bold('Select additional features:'),
    choices: featureOptions,
    instructions: false,
    hint: '- Space to select. Return to submit'
  });

  // Install dependencies
  questions.push({
    type: 'confirm',
    name: 'installDeps',
    message: chalk.bold('Install dependencies?'),
    initial: true
  });

  // Initialize git
  questions.push({
    type: 'confirm',
    name: 'initGit',
    message: chalk.bold('Initialize git repository?'),
    initial: true
  });

  // Run dev server
  questions.push({
    type: 'confirm',
    name: 'runDev',
    message: chalk.bold('Start development server after setup?'),
    initial: true
  });

  // State management (conditional)
  questions.push({
    type: (prev: any) => prev.features?.includes('state-management') ? 'select' : null,
    name: 'stateManagement',
    message: chalk.bold('Choose state management solution:'),
    choices: (prev: any) => {
      const framework = prev.framework as string;
      const options: Record<string, { title: string; value: string }[]> = {
        react: [
          { title: 'Redux Toolkit', value: 'redux-toolkit' },
          { title: 'Zustand', value: 'zustand' },
          { title: 'Jotai', value: 'jotai' },
          { title: 'Valtio', value: 'valtio' }
        ],
        vue: [
          { title: 'Pinia', value: 'pinia' },
          { title: 'Vuex', value: 'vuex' }
        ],
        svelte: [
          { title: 'Svelte Stores', value: 'svelte-stores' },
          { title: 'Zustand', value: 'zustand' }
        ],
        solid: [
          { title: 'Solid Store', value: 'solid-store' },
          { title: 'Zustand', value: 'zustand' }
        ],
        preact: [
          { title: 'Zustand', value: 'zustand' },
          { title: 'Valtio', value: 'valtio' }
        ]
      };
      return options[framework] || [{ title: 'None', value: 'none' }];
    }
  });

  // API Client (conditional)
  questions.push({
    type: (prev: any) => prev.features?.includes('api-client') ? 'select' : null,
    name: 'apiClient',
    message: chalk.bold('Choose API client:'),
    choices: [
      { title: 'Axios', value: 'axios' },
      { title: 'TanStack Query', value: 'tanstack-query' },
      { title: 'SWR', value: 'swr' },
      { title: 'tRPC', value: 'trpc' },
      { title: 'Fetch (native)', value: 'fetch' }
    ]
  });

  const response = await prompts(questions, {
    onCancel: () => {
      console.log(chalk.red('\n✖ Operation cancelled'));
      process.exit(1);
    }
  });

  // Generate template name based on framework and TypeScript choice
  const template = `${response.framework}-${response.typescript ? 'ts' : 'js'}`;

  return {
    name: projectName || response.name,
    template,
    framework: response.framework,
    styling: response.styling,
    packageManager: response.packageManager,
    features: response.features || [],
    installDeps: response.installDeps,
    initGit: response.initGit,
    typescript: response.typescript,
    runDev: response.runDev,
    stateManagement: response.stateManagement,
    apiClient: response.apiClient
  };
}

/**
 * Project generator class
 */
class ProjectGenerator {
  private options: ProjectOptions;
  private projectPath: string;
  private templatePath: string;
  private spinner: any;

  constructor(options: ProjectOptions) {
    this.options = options;
    this.projectPath = resolve(process.cwd(), options.name);
    this.templatePath = join(__dirname, 'templates', options.template);
    this.spinner = ora();
  }

  /**
   * Generate the project
   */
  async generate(): Promise<void> {
    console.log(chalk.magenta(`→ Creating your project in: ${chalk.bold(this.options.name)}\n`));
    
    this.spinner.start('Creating project structure...');
    
    try {
      // Validate project directory
      this.validateProjectDir();
      
      // Copy template files
      await this.copyTemplateFiles();
      
      // Customize files based on options
      await this.customizeFiles();
      
      // Initialize git if requested
      if (this.options.initGit) {
        await this.initializeGit();
      }
      
      this.spinner.succeed('✅ Project structure created successfully!');
      
      // Install dependencies if requested
      if (this.options.installDeps) {
        await this.installDependencies();
      }
      
      // Show completion message
      this.showCompletionMessage();
      
      // Run dev server if requested
      if (this.options.runDev && this.options.installDeps) {
        await this.runDevServer();
      }
      
    } catch (error: any) {
      this.spinner.fail(`❌ Failed to create project: ${error.message}`);
      this.cleanup();
      process.exit(1);
    }
  }

  /**
   * Validate project directory
   */
  private validateProjectDir(): void {
    if (existsSync(this.projectPath)) {
      throw new Error(`Directory ${this.options.name} already exists!`);
    }
    
    mkdirSync(this.projectPath, { recursive: true });
  }

  /**
   * Copy template files
   */
  private async copyTemplateFiles(): Promise<void> {
    this.spinner.text = `Copying ${this.options.template} template files...`;
    
    try {
      copySync(this.templatePath, this.projectPath);
      
      const stylingPath = join(__dirname, 'templates', 'styles', this.options.styling);
      if (existsSync(stylingPath)) {
        copySync(stylingPath, this.projectPath);
      }
    } catch (error: any) {
      throw new Error(`Failed to copy template files: ${error.message}`);
    }
  }

  /**
   * Customize files based on options
   */
  private async customizeFiles(): Promise<void> {
    this.spinner.text = 'Customizing project files...';
    
    this.customizePackageJson();
    
    if (this.options.styling && this.options.styling !== 'css-modules') {
      this.addStylingConfigs();
    }
    
    if (this.options.features && this.options.features.length > 0) {
      this.addFeatureConfigs();
    }
  }

  /**
   * Customize package.json
   */
  private customizePackageJson(): void {
    const packageJsonPath = join(this.projectPath, 'package.json');
    
    if (existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
        
        packageJson.name = this.options.name;
        this.addStylingDependencies(packageJson);
        this.addFeatureDependencies(packageJson);
        
        writeFileSync(
          packageJsonPath,
          JSON.stringify(packageJson, null, 2)
        );
      } catch (error: any) {
        throw new Error(`Failed to customize package.json: ${error.message}`);
      }
    }
  }

  /**
   * Add styling dependencies to package.json
   */
  private addStylingDependencies(pkg: any): void {
    pkg.devDependencies = pkg.devDependencies || {};
    pkg.dependencies = pkg.dependencies || {};
    
    if (this.options.typescript) {
      pkg.devDependencies['ts-node'] = '^10.9.1';
    }
    
    switch (this.options.styling) {
      case 'tailwind':
        pkg.dependencies.clsx = '^2.0.0';
        pkg.devDependencies.tailwindcss = '^3.3.6';
        pkg.devDependencies.autoprefixer = '^10.4.16';
        pkg.devDependencies.postcss = '^8.4.32';
        break;
        
      case 'styled-components':
        pkg.dependencies['styled-components'] = '^6.1.0';
        if (this.options.typescript) {
          pkg.devDependencies['@types/styled-components'] = '^5.1.32';
        }
        break;
        
      case 'emotion':
        pkg.dependencies['@emotion/react'] = '^11.11.1';
        pkg.dependencies['@emotion/styled'] = '^11.11.0';
        if (this.options.framework === 'react') {
          pkg.devDependencies['@emotion/babel-plugin'] = '^11.11.0';
        }
        break;
        
      case 'sass':
        pkg.devDependencies.sass = '^1.69.5';
        break;
        
      case 'less':
        pkg.devDependencies.less = '^4.2.0';
        break;
        
      case 'stylus':
        pkg.devDependencies.stylus = '^0.62.0';
        break;
        
      case 'vanilla-extract':
        pkg.devDependencies['@vanilla-extract/css'] = '^1.14.0';
        pkg.devDependencies['@vanilla-extract/vite-plugin'] = '^3.9.0';
        break;
        
      case 'unocss':
        pkg.devDependencies.unocss = '^0.57.7';
        pkg.devDependencies['@unocss/reset'] = '^0.57.7';
        break;
    }
  }

  /**
   * Add feature dependencies to package.json
   */
  private addFeatureDependencies(pkg: any): void {
    pkg.dependencies = pkg.dependencies || {};
    pkg.devDependencies = pkg.devDependencies || {};
    pkg.scripts = pkg.scripts || {};
    
    // Framework-specific dependencies
    this.addFrameworkDependencies(pkg);
    
    if (this.options.features.includes('pwa')) {
      pkg.devDependencies['vite-plugin-pwa'] = '^0.17.4';
    }
    
    if (this.options.features.includes('analyzer')) {
      pkg.devDependencies['vite-bundle-analyzer'] = '^0.7.0';
      pkg.scripts.analyze = 'vite-bundle-analyzer dist';
    }
    
    if (this.options.features.includes('vitest')) {
      pkg.devDependencies.vitest = '^1.0.4';
      pkg.devDependencies['@vitest/ui'] = '^1.0.4';
      pkg.scripts.test = 'vitest';
      pkg.scripts['test:ui'] = 'vitest --ui';
    }
    
    if (this.options.features.includes('playwright')) {
      pkg.devDependencies['@playwright/test'] = '^1.40.1';
      pkg.scripts['test:e2e'] = 'playwright test';
    }
    
    if (this.options.features.includes('linting')) {
      pkg.devDependencies.eslint = '^8.55.0';
      pkg.devDependencies.prettier = '^3.1.0';
      pkg.devDependencies['eslint-config-prettier'] = '^9.1.0';
      pkg.scripts.lint = 'eslint . --ext .js,.jsx,.ts,.tsx';
      pkg.scripts['lint:fix'] = 'eslint . --ext .js,.jsx,.ts,.tsx --fix';
      pkg.scripts.format = 'prettier --write .';
    }
    
    if (this.options.features.includes('storybook')) {
      const storybookFramework = this.getStorybookFramework();
      Object.assign(pkg.devDependencies, {
        [`@storybook/${storybookFramework}`]: '^7.5.0',
        [`@storybook/${storybookFramework}-vite`]: '^7.5.0',
        '@storybook/addon-essentials': '^7.5.0'
      });
      pkg.scripts.storybook = 'storybook dev -p 6006';
      pkg.scripts['build-storybook'] = 'storybook build';
    }
    
    if (this.options.features.includes('husky')) {
      pkg.devDependencies.husky = '^8.0.3';
      pkg.devDependencies['lint-staged'] = '^15.2.0';
      pkg.scripts.prepare = 'husky install';
    }
    
    // State management
    if (this.options.stateManagement) {
      this.addStateManagementDependencies(pkg);
    }
    
    // API client
    if (this.options.apiClient) {
      this.addApiClientDependencies(pkg);
    }
  }
  
  /**
   * Add framework-specific dependencies
   */
  private addFrameworkDependencies(pkg: any): void {
    switch (this.options.framework) {
      case 'react':
        pkg.dependencies.react = '^18.2.0';
        pkg.dependencies['react-dom'] = '^18.2.0';
        pkg.devDependencies['@vitejs/plugin-react'] = '^4.2.0';
        if (this.options.typescript) {
          pkg.devDependencies['@types/react'] = '^18.2.43';
          pkg.devDependencies['@types/react-dom'] = '^18.2.17';
        }
        break;
        
      case 'preact':
        pkg.dependencies.preact = '^10.19.2';
        pkg.devDependencies['@preact/preset-vite'] = '^2.7.0';
        if (this.options.typescript) {
          pkg.devDependencies['@types/node'] = '^20.10.4';
        }
        break;
        
      case 'vue':
        pkg.dependencies.vue = '^3.3.8';
        pkg.devDependencies['@vitejs/plugin-vue'] = '^4.5.2';
        if (this.options.typescript) {
          pkg.devDependencies['vue-tsc'] = '^1.8.25';
        }
        break;
        
      case 'svelte':
        pkg.dependencies.svelte = '^4.2.8';
        pkg.devDependencies['@sveltejs/vite-plugin-svelte'] = '^3.0.1';
        if (this.options.typescript) {
          pkg.devDependencies['@tsconfig/svelte'] = '^5.0.2';
          pkg.devDependencies.tslib = '^2.6.2';
          pkg.devDependencies['svelte-check'] = '^3.6.2';
        }
        break;
        
      case 'solid':
        pkg.dependencies['solid-js'] = '^1.8.7';
        pkg.devDependencies['vite-plugin-solid'] = '^2.8.0';
        if (this.options.typescript) {
          pkg.devDependencies['@types/node'] = '^20.10.4';
        }
        break;
    }
  }
  
  /**
   * Get Storybook framework name
   */
  private getStorybookFramework(): string {
    const frameworkMap: { [key: string]: string } = {
      'react': 'react',
      'preact': 'preact',
      'vue': 'vue3',
      'svelte': 'svelte',
      'solid': 'solid'
    };
    return frameworkMap[this.options.framework] || 'react';
  }
  
  /**
   * Add state management dependencies
   */
  private addStateManagementDependencies(pkg: any): void {
    switch (this.options.stateManagement) {
      case 'redux-toolkit':
        pkg.dependencies['@reduxjs/toolkit'] = '^2.0.1';
        pkg.dependencies['react-redux'] = '^9.0.4';
        break;
      case 'zustand':
        pkg.dependencies.zustand = '^4.4.7';
        break;
      case 'jotai':
        pkg.dependencies.jotai = '^2.6.0';
        break;
      case 'valtio':
        pkg.dependencies.valtio = '^1.12.1';
        break;
      case 'pinia':
        pkg.dependencies.pinia = '^2.1.7';
        break;
      case 'vuex':
        pkg.dependencies.vuex = '^4.1.0';
        break;
    }
  }
  
  /**
   * Add API client dependencies
   */
  private addApiClientDependencies(pkg: any): void {
    switch (this.options.apiClient) {
      case 'axios':
        pkg.dependencies.axios = '^1.6.2';
        break;
      case 'tanstack-query':
        pkg.dependencies['@tanstack/react-query'] = '^5.12.2';
        pkg.devDependencies['@tanstack/react-query-devtools'] = '^5.13.3';
        break;
      case 'swr':
        pkg.dependencies.swr = '^2.2.4';
        break;
      case 'trpc':
        pkg.dependencies['@trpc/client'] = '^10.45.0';
        pkg.dependencies['@trpc/server'] = '^10.45.0';
        if (this.options.framework === 'react') {
          pkg.dependencies['@trpc/react-query'] = '^10.45.0';
        }
        break;
    }
  }

  /**
   * Add styling configurations
   */
  private addStylingConfigs(): void {
    const configExt = 'ts';
    const cssPath = join(this.projectPath, 'src/index.css');
    
    if (['tailwind', 'css-modules', 'sass'].includes(this.options.styling)) {
      const configContent = this.options.styling === 'tailwind' 
        ? `import type { Config } from 'postcss-load-config';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

const config: Config = {
  plugins: [
    tailwindcss,
    autoprefixer,
  ],
};

export default config;`
        : `import type { Config } from 'postcss-load-config';
import autoprefixer from 'autoprefixer';

const config: Config = {
  plugins: [
    autoprefixer,
  ],
};

export default config;`;
        
      writeFileSync(
        join(this.projectPath, `postcss.config.${configExt}`),
        configContent
      );
    }
    
    switch (this.options.styling) {
      case 'tailwind':
        writeFileSync(
          join(this.projectPath, `tailwind.config.${configExt}`),
          `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: { extend: {} },
  plugins: [],
}`
        );
        
        writeFileSync(cssPath, `@tailwind base;
@tailwind components;
@tailwind utilities;`);
        break;
        
      case 'styled-components':
        if (existsSync(cssPath)) {
          rmSync(cssPath);
        }
        break;
        
      case 'css-modules':
        writeFileSync(cssPath, `/* CSS Modules - automatically scoped */
.container {
  margin: 0 auto;
  max-width: 1200px;
  padding: 1rem;
}

/* Global styles (not scoped) */
:global(body) {
  margin: 0;
  font-family: system-ui, sans-serif;
}`);
        break;
        
      case 'sass':
        const scssPath = join(this.projectPath, 'src/index.scss');
        writeFileSync(scssPath, `// Sass variables
$primary-color: #3498db;
$secondary-color: #2ecc71;
$spacing-unit: 1rem;

// Mixins
@mixin container {
  margin: 0 auto;
  max-width: 1200px;
  padding: $spacing-unit;
}

// Main styles
.container {
  @include container;
  color: $primary-color;
}

.header {
  background: $secondary-color;
}`);
        
        if (existsSync(cssPath)) {
          rmSync(cssPath);
        }
        break;
    }
  }

  /**
   * Add feature configurations
   */
  private addFeatureConfigs(): void {
    if (this.options.features.includes('github-actions')) {
      const workflowsDir = join(this.projectPath, '.github/workflows');
      mkdirSync(workflowsDir, { recursive: true });
      
      const workflow = `name: CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: 18
    - run: ${this.options.packageManager} install
    - run: ${this.options.packageManager} run lint
    - run: ${this.options.packageManager} run build`;

      writeFileSync(join(workflowsDir, 'ci.yml'), workflow);
    }

    if (this.options.features.includes('docker')) {
      const dockerfile = `FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN ${this.options.packageManager === 'npm' ? 'npm ci' : 
            this.options.packageManager === 'yarn' ? 'yarn install --frozen-lockfile' :
            this.options.packageManager === 'pnpm' ? 'pnpm install --frozen-lockfile' :
            'bun install'}
COPY . .
RUN ${this.options.packageManager} run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`;

      writeFileSync(join(this.projectPath, 'Dockerfile'), dockerfile);

      const dockerIgnore = `node_modules
.git
.gitignore
README.md
Dockerfile
.dockerignore
npm-debug.log`;

      writeFileSync(join(this.projectPath, '.dockerignore'), dockerIgnore);
    }
  }

  /**
   * Initialize git repository
   */
  private async initializeGit(): Promise<void> {
    const gitSpinner = ora('Initializing git repository...').start();
    
    try {
    //   await $`git init`.cwd(this.projectPath);
    //   await $`git add .`.cwd(this.projectPath);
    //   await $`git commit -m "Initial commit from Viant CLI"`.cwd(this.projectPath);
      execSync('git init', {
        cwd: this.projectPath,
        stdio: 'pipe',
        maxBuffer: 1024 * 1024 * 10 // 10MB buffer
      });
      
      // Create initial commit
      execSync('git add .', { cwd: this.projectPath, stdio: 'pipe' });
      execSync('git commit -m "Initial commit from Viant CLI"', { 
        cwd: this.projectPath, 
        stdio: 'pipe',
        env: { ...process.env, GIT_COMMITTER_NAME: 'Viant CLI', GIT_COMMITTER_EMAIL: 'viant@example.com' }
      });
      gitSpinner.succeed('🧼 Git repository initialized.');
    } catch (error: any) {
      gitSpinner.fail('❌ Git initialization failed.');
      console.log(chalk.yellow(`Note: ${error.message}`));
    }
  }

  /**
   * Install dependencies
   */
  private async installDependencies(): Promise<void> {
    const installSpinner = ora(`Installing dependencies with ${this.options.packageManager}...`).start();
    
    return new Promise((resolve, reject) => {
      try {
        const installProcess = spawn(this.options.packageManager, ['install'], {
          cwd: this.projectPath,
          stdio: 'pipe'
        });

        installProcess.on('error', (error) => {
          installSpinner.fail('❌ Failed to start dependency installation.');
          console.error(chalk.red('Error details:'), error);
          this.logManualInstallCommand();
          reject(error);
        });

        installProcess.on('close', (code) => {
          if (code === 0) {
            installSpinner.succeed('📦 Dependencies installed successfully!');
            resolve();
          } else {
            installSpinner.fail('❌ Failed to install dependencies.');
            this.logManualInstallCommand();
            reject(new Error(`Dependency installation failed with code ${code}`));
          }
        });
      } catch (error: any) {
        installSpinner.fail('❌ Failed to install dependencies.');
        console.error(chalk.red('Error details:'), error.message);
        this.logManualInstallCommand();
        reject(error);
      }
    });
  }

  private logManualInstallCommand(): void {
    console.log(chalk.yellow('\nAlternatively, you can install them manually by running:'));
    console.log(chalk.cyan(`cd ${this.options.name} && ${this.options.packageManager} install`));
  }

  /**
   * Run development server
   */
  private async runDevServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(chalk.greenBright('\n🚀 Starting development server...'));
      console.log(chalk.gray('(Press Ctrl+C to stop)'));

      try {
        const devServerProcess = spawn(this.options.packageManager, ['run', 'dev'], {
          cwd: this.projectPath,
          stdio: 'inherit', // 'inherit' will show server output directly in the console
        });

        devServerProcess.on('spawn', () => {
          // It's tricky to know exactly when a dev server is "ready"
          // For now, we'll consider it started once the process spawns.
          // More robust solutions might involve parsing stdout for a specific message.
          console.log(chalk.cyanBright('Development server process has started.'));
          // We don't resolve here immediately, as the server is a long-running process.
          // The user will typically Ctrl+C to stop it.
        });

        devServerProcess.on('error', (error) => {
          this.spinner.fail('❌ Failed to start development server.');
          console.error(chalk.red('Error details:'), error);
          reject(error); // Reject the promise on error
        });

        devServerProcess.on('close', (code) => {
          if (code === 0 || code === null) { // null can indicate successful exit after Ctrl+C
            this.spinner.succeed('👋 Development server closed.');
            resolve(); // Resolve the promise when the server is closed gracefully
          } else {
            this.spinner.fail(`❌ Development server exited with code ${code}.`);
            reject(new Error(`Development server exited with code ${code}`));
          }
        });
      } catch (error: any) {
        this.spinner.fail('❌ Failed to initiate development server.');
        console.error(chalk.red('Error details:'), error.message);
        reject(error); // Reject the promise on initial catch
      }
    });
  }

  /**
   * Show completion message
   */
  private showCompletionMessage(): void {
    console.log(`
${gradient.rainbow('🎉 Success!')} Created ${chalk.cyan(this.options.name)} at ${chalk.cyan(this.projectPath)}
`);
    
    console.log(gradient.vice('Next steps:'));
    console.log(chalk.cyan(`  cd ${this.options.name}`));
    if (!this.options.installDeps) {
      console.log(chalk.cyan(`  ${this.options.packageManager} install`));
    }
    if (!this.options.runDev) {
      console.log(chalk.cyan(`  ${this.options.packageManager} run dev`));
    }
    
    console.log(`\n${chalk.bold('Available commands:')}`);
    console.log(chalk.green(`  ${this.options.packageManager} run dev`).padEnd(30) + 'Start development server');
    console.log(chalk.green(`  ${this.options.packageManager} run build`).padEnd(30) + 'Build for production');
    console.log(chalk.green(`  ${this.options.packageManager} run preview`).padEnd(30) + 'Preview production build');
    console.log(chalk.green(`  ${this.options.packageManager} run lint`).padEnd(30) + 'Lint code');
    
    console.log(`\n${chalk.bold('Documentation:')}`);
    console.log('📚 Check out the docs in the docs/ folder\n');
    
    console.log(gradient.rainbow('Happy coding! 🚀'));
  }

  /**
   * Cleanup on failure
   */
  private cleanup(): void {
    if (existsSync(this.projectPath)) {
      try {
        rmSync(this.projectPath, { recursive: true, force: true });
      } catch (error: any) {
        console.error(`Failed to clean up: ${error.message}`);
      }
    }
  }
}

/**
 * Main CLI function
 */
async function main(): Promise<void> {
  const program = new Command();

  program
    .name('create-viant-app')
    .description('Create a new Viant app with zero configuration')
    .version('2.0.0')
    .argument('[project-name]', 'name of the project')
    .option('-t, --template <template>', 'template to use (default, minimal)')
    .option('-s, --styling <styling>', 'styling solution (tailwind, styled-components, css-modules, sass)')
    .option('-pm, --package-manager <pm>', 'package manager to use (bun, npm, pnpm, yarn)')
    .option('--skip-install', 'skip dependency installation')
    .option('--skip-git', 'skip git initialization')
    .option('--skip-dev', 'skip starting development server')
    .action(async (projectName: string | undefined, options: any) => {
      try {
        let projectOptions: ProjectOptions;

        if (projectName && options.template && options.styling && options.packageManager) {
          // Non-interactive mode
          const framework = options.template.split('-')[0];
          projectOptions = {
            name: projectName,
            template: options.template,
            framework: framework,
            styling: options.styling,
            packageManager: options.packageManager,
            features: [],
            installDeps: !options.skipInstall,
            initGit: !options.skipGit,
            typescript: options.template.includes('-ts'),
            runDev: !options.skipDev
          };
        } else {
          // Interactive mode
          projectOptions = await getProjectOptions(projectName);
        }

        // Ensure framework is set for non-interactive mode
        if (!projectOptions.framework && projectOptions.template) {
          projectOptions.framework = projectOptions.template.split('-')[0];
        }

        const generator = new ProjectGenerator(projectOptions);
        await generator.generate();
        
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  program.parse();
}

// Run the CLI
main().catch(error => {
  console.error(chalk.red('Unexpected error:'), error);
  process.exit(1);
});