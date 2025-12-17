#!/usr/bin/env node

import { execSync, spawn } from 'child_process';
import { existsSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'fs';
import pkg from 'fs-extra';
const { copySync } = pkg;
import { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Command } from 'commander';
import prompts from 'prompts';
import chalk from 'chalk';
import ora from 'ora';
// Removed figlet import - using custom ASCII art instead
import gradient from 'gradient-string';
// @ts-ignore
import validateProjectName from 'validate-npm-package-name';
import * as readline from 'readline';
import { stdin, stdout, exit } from 'process';
import { detectPackageManagers } from './src/detectPackageManagers.js';
import { VERSIONS } from './src/versions.js';
import {
  ProjectGenerationError,
  ERROR_CODES,
  cleanupProject,
  formatErrorForDisplay,
  wrapError,
} from './src/errorHandling.js';

// Get the directory where this script is located (package installation directory)
// This is needed to find the templates directory when installed globally via npm
const __filename = fileURLToPath(import.meta.url);
const __scriptDir = dirname(__filename);
// Templates are in the parent directory of dist/ (where the bundled CLI lives)
const __dirname = resolve(__scriptDir, '..');

// Enhanced ASCII Art Banner with gradients
const createBanner = () => {
  // Use a simple text banner instead of figlet to avoid font file dependencies
  const viantText = `
██╗   ██╗██╗ █████╗ ███╗   ██╗████████╗
██║   ██║██║██╔══██╗████╗  ██║╚══██╔══╝
██║   ██║██║███████║██╔██╗ ██║   ██║   
╚██╗ ██╔╝██║██╔══██║██║╚██╗██║   ██║   
 ╚████╔╝ ██║██║  ██║██║ ╚████║   ██║   
  ╚═══╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝   
`;
  
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

// detectPackageManagers is imported from ./src/detectPackageManagers.js

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
      this.spinner.fail('❌ Failed to create project');
      
      // Format and display the error with enhanced messaging
      const wrappedError = error instanceof ProjectGenerationError 
        ? error 
        : wrapError(error, 'Project generation failed');
      
      console.error(formatErrorForDisplay(wrappedError));
      
      // Perform cleanup and report result
      this.cleanup();
      
      process.exit(1);
    }
  }

  /**
   * Validate project directory
   */
  private validateProjectDir(): void {
    if (existsSync(this.projectPath)) {
      throw new ProjectGenerationError(
        `Directory "${this.options.name}" already exists`,
        ERROR_CODES.DIR_EXISTS,
        {
          recoverable: false,
          hint: 'Please choose a different project name or remove the existing directory.',
        }
      );
    }
    
    try {
      mkdirSync(this.projectPath, { recursive: true });
    } catch (error: any) {
      if (error.code === 'EACCES') {
        throw new ProjectGenerationError(
          `Permission denied when creating directory "${this.options.name}"`,
          ERROR_CODES.PERMISSION_DENIED,
          {
            recoverable: false,
            hint: 'Please check your file system permissions or try a different location.',
            cause: error,
          }
        );
      }
      throw error;
    }
  }

  /**
   * Copy template files
   */
  private async copyTemplateFiles(): Promise<void> {
    this.spinner.text = `Copying ${this.options.template} template files...`;
    
    // Check if template exists
    if (!existsSync(this.templatePath)) {
      throw new ProjectGenerationError(
        `Template "${this.options.template}" not found`,
        ERROR_CODES.TEMPLATE_NOT_FOUND,
        {
          recoverable: false,
          hint: 'Please check the template name and try again. Available templates: react-ts, react-js, vue-ts, vue-js, svelte-ts, svelte-js, solid-ts, solid-js, preact-ts, preact-js, vanilla-ts, vanilla-js',
        }
      );
    }
    
    try {
      copySync(this.templatePath, this.projectPath);
      
      const stylingPath = join(__dirname, 'templates', 'styles', this.options.styling);
      if (existsSync(stylingPath)) {
        copySync(stylingPath, this.projectPath);
      }
      
      // Ensure project structure is correct
      this.ensureProjectStructure();
      
      // Generate .gitignore file
      this.generateGitignore();
    } catch (error: any) {
      if (error instanceof ProjectGenerationError) {
        throw error;
      }
      
      throw new ProjectGenerationError(
        `Failed to copy template files: ${error.message}`,
        ERROR_CODES.COPY_FAILED,
        {
          recoverable: false,
          hint: 'Please check file permissions and available disk space.',
          cause: error,
        }
      );
    }
  }

  /**
   * Ensure project structure has required directories
   * Creates src/ directory with appropriate subdirectories if they don't exist
   */
  private ensureProjectStructure(): void {
    const srcPath = join(this.projectPath, 'src');
    
    // Ensure src directory exists
    if (!existsSync(srcPath)) {
      mkdirSync(srcPath, { recursive: true });
    }
    
    // Define subdirectories based on framework
    const subdirectories: string[] = [];
    
    switch (this.options.framework) {
      case 'react':
      case 'preact':
      case 'solid':
        subdirectories.push('components', 'hooks', 'utils');
        if (this.options.typescript) {
          subdirectories.push('types');
        }
        break;
      case 'vue':
        subdirectories.push('components', 'composables', 'utils');
        if (this.options.typescript) {
          subdirectories.push('types');
        }
        break;
      case 'svelte':
        subdirectories.push('lib', 'components', 'utils');
        if (this.options.typescript) {
          subdirectories.push('types');
        }
        break;
      case 'vanilla':
        subdirectories.push('utils');
        if (this.options.typescript) {
          subdirectories.push('types');
        }
        break;
    }
    
    // Create subdirectories if they don't exist
    for (const subdir of subdirectories) {
      const subdirPath = join(srcPath, subdir);
      if (!existsSync(subdirPath)) {
        mkdirSync(subdirPath, { recursive: true });
        // Add a .gitkeep file to preserve empty directories
        writeFileSync(join(subdirPath, '.gitkeep'), '');
      }
    }
  }

  /**
   * Generate .gitignore file for the project
   */
  private generateGitignore(): void {
    const gitignorePath = join(this.projectPath, '.gitignore');
    
    // Don't overwrite if .gitignore already exists
    if (existsSync(gitignorePath)) {
      return;
    }
    
    const gitignoreContent = `# Dependency directories
node_modules/

# Build output
dist/
build/

# Environment variables
.env
.env.local
.env.development
.env.test
.env.production
.env*.local

# IDE and editor files
.vscode/
.idea/
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Debug logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Lock files (uncomment if you want to ignore)
# bun.lockb
# pnpm-lock.yaml
# package-lock.json
# yarn.lock

# Test coverage
coverage/
.nyc_output/

# Vite cache
.vite/

# TypeScript cache
*.tsbuildinfo

# Temporary files
*.tmp
*.bak
*.temp
`;

    writeFileSync(gitignorePath, gitignoreContent);
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
   * Ensures all required fields are present, "type": "module" is set,
   * and validates JSON structure before writing.
   */
  private customizePackageJson(): void {
    const packageJsonPath = join(this.projectPath, 'package.json');
    
    if (existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
        
        // Ensure required fields are present
        packageJson.name = this.options.name;
        packageJson.version = packageJson.version || '1.0.0';
        packageJson.type = 'module'; // Always ensure ESM modules
        packageJson.scripts = packageJson.scripts || {};
        packageJson.dependencies = packageJson.dependencies || {};
        packageJson.devDependencies = packageJson.devDependencies || {};
        
        // Add optional metadata fields if not present
        if (!packageJson.description) {
          packageJson.description = `Modern ${this.options.framework} app built with Viant CLI`;
        }
        if (!packageJson.license) {
          packageJson.license = 'MIT';
        }
        
        this.addStylingDependencies(packageJson);
        this.addFeatureDependencies(packageJson);
        
        // Validate JSON structure before writing
        const jsonString = JSON.stringify(packageJson, null, 2);
        this.validatePackageJson(packageJson);
        
        writeFileSync(packageJsonPath, jsonString);
      } catch (error: any) {
        if (error instanceof ProjectGenerationError) {
          throw error;
        }
        
        throw new ProjectGenerationError(
          `Failed to customize package.json: ${error.message}`,
          ERROR_CODES.PACKAGE_JSON_INVALID,
          {
            recoverable: false,
            hint: 'The package.json file may be corrupted or have invalid JSON syntax.',
            cause: error,
          }
        );
      }
    }
  }

  /**
   * Validate package.json structure
   * Ensures all required fields are present and valid
   */
  private validatePackageJson(pkg: any): void {
    const requiredFields = ['name', 'version', 'type', 'scripts', 'dependencies', 'devDependencies'];
    
    for (const field of requiredFields) {
      if (pkg[field] === undefined) {
        throw new Error(`Missing required field in package.json: ${field}`);
      }
    }
    
    // Validate name is a non-empty string
    if (typeof pkg.name !== 'string' || pkg.name.trim() === '') {
      throw new Error('package.json name must be a non-empty string');
    }
    
    // Validate version is a string
    if (typeof pkg.version !== 'string') {
      throw new Error('package.json version must be a string');
    }
    
    // Validate type is "module"
    if (pkg.type !== 'module') {
      throw new Error('package.json type must be "module" for ESM support');
    }
    
    // Validate scripts, dependencies, and devDependencies are objects
    if (typeof pkg.scripts !== 'object' || pkg.scripts === null) {
      throw new Error('package.json scripts must be an object');
    }
    
    if (typeof pkg.dependencies !== 'object' || pkg.dependencies === null) {
      throw new Error('package.json dependencies must be an object');
    }
    
    if (typeof pkg.devDependencies !== 'object' || pkg.devDependencies === null) {
      throw new Error('package.json devDependencies must be an object');
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
        // Tailwind CSS 4 uses CSS-first configuration - no postcss/autoprefixer needed
        pkg.dependencies.clsx = '^2.0.0';
        pkg.devDependencies.tailwindcss = VERSIONS.tailwindcss;
        break;
        
      case 'styled-components':
        pkg.dependencies['styled-components'] = VERSIONS.styledComponents;
        if (this.options.typescript) {
          pkg.devDependencies['@types/styled-components'] = '^5.1.32';
        }
        break;
        
      case 'emotion':
        pkg.dependencies['@emotion/react'] = VERSIONS.emotion;
        pkg.dependencies['@emotion/styled'] = VERSIONS.emotionStyled;
        if (this.options.framework === 'react') {
          pkg.devDependencies['@emotion/babel-plugin'] = '^11.11.0';
        }
        break;
        
      case 'sass':
        pkg.devDependencies.sass = VERSIONS.sass;
        break;
        
      case 'less':
        pkg.devDependencies.less = '^4.2.0';
        break;
        
      case 'stylus':
        pkg.devDependencies.stylus = '^0.62.0';
        break;
        
      case 'vanilla-extract':
        pkg.devDependencies['@vanilla-extract/css'] = VERSIONS.vanillaExtract;
        pkg.devDependencies['@vanilla-extract/vite-plugin'] = VERSIONS.vanillaExtractVitePlugin;
        break;
        
      case 'unocss':
        pkg.devDependencies.unocss = VERSIONS.unocss;
        pkg.devDependencies['@unocss/reset'] = VERSIONS.unocss;
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
      pkg.devDependencies['vite-plugin-pwa'] = VERSIONS.vitePluginPWA;
    }
    
    if (this.options.features.includes('analyzer')) {
      pkg.devDependencies['rollup-plugin-visualizer'] = VERSIONS.rollupPluginVisualizer;
      pkg.scripts.analyze = 'vite build --mode analyze';
    }
    
    if (this.options.features.includes('vitest')) {
      pkg.devDependencies.vitest = VERSIONS.vitest;
      pkg.devDependencies['@vitest/ui'] = VERSIONS.vitestUi;
      pkg.scripts.test = 'vitest';
      pkg.scripts['test:ui'] = 'vitest --ui';
    }
    
    if (this.options.features.includes('playwright')) {
      pkg.devDependencies['@playwright/test'] = VERSIONS.playwright;
      pkg.scripts['test:e2e'] = 'playwright test';
    }
    
    if (this.options.features.includes('linting')) {
      pkg.devDependencies['@biomejs/biome'] = VERSIONS.biome;
      pkg.scripts.lint = 'biome lint .';
      pkg.scripts['lint:fix'] = 'biome lint --write .';
      pkg.scripts.format = 'biome format --write .';
    }
    
    if (this.options.features.includes('storybook')) {
      const storybookFramework = this.getStorybookFramework();
      Object.assign(pkg.devDependencies, {
        [`@storybook/${storybookFramework}`]: VERSIONS.storybook,
        [`@storybook/${storybookFramework}-vite`]: VERSIONS.storybook,
        '@storybook/addon-essentials': VERSIONS.storybook
      });
      pkg.scripts.storybook = 'storybook dev -p 6006';
      pkg.scripts['build-storybook'] = 'storybook build';
    }
    
    if (this.options.features.includes('husky')) {
      pkg.devDependencies.husky = VERSIONS.husky;
      pkg.devDependencies['lint-staged'] = VERSIONS.lintStaged;
      pkg.scripts.prepare = 'husky install';
    }

    // Internationalization (i18n)
    if (this.options.features.includes('i18n')) {
      this.addI18nDependencies(pkg);
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
        pkg.dependencies.react = VERSIONS.react;
        pkg.dependencies['react-dom'] = VERSIONS.reactDom;
        pkg.devDependencies['@vitejs/plugin-react-swc'] = VERSIONS.vitePluginReactSWC;
        if (this.options.typescript) {
          pkg.devDependencies['@types/react'] = VERSIONS.typesReact;
          pkg.devDependencies['@types/react-dom'] = VERSIONS.typesReactDom;
        }
        break;
        
      case 'preact':
        pkg.dependencies.preact = VERSIONS.preact;
        pkg.devDependencies['@preact/preset-vite'] = VERSIONS.preactPresetVite;
        if (this.options.typescript) {
          pkg.devDependencies['@types/node'] = VERSIONS.typesNode;
        }
        break;
        
      case 'vue':
        pkg.dependencies.vue = VERSIONS.vue;
        pkg.devDependencies['@vitejs/plugin-vue'] = VERSIONS.vitePluginVue;
        if (this.options.typescript) {
          pkg.devDependencies['vue-tsc'] = VERSIONS.vueTsc;
        }
        break;
        
      case 'svelte':
        pkg.dependencies.svelte = VERSIONS.svelte;
        pkg.devDependencies['@sveltejs/vite-plugin-svelte'] = VERSIONS.vitePluginSvelte;
        if (this.options.typescript) {
          pkg.devDependencies['@tsconfig/svelte'] = VERSIONS.tsconfigSvelte;
          pkg.devDependencies.tslib = VERSIONS.tslib;
          pkg.devDependencies['svelte-check'] = VERSIONS.svelteCheck;
        }
        break;
        
      case 'solid':
        pkg.dependencies['solid-js'] = VERSIONS.solid;
        pkg.devDependencies['vite-plugin-solid'] = VERSIONS.vitePluginSolid;
        if (this.options.typescript) {
          pkg.devDependencies['@types/node'] = VERSIONS.typesNode;
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
        pkg.dependencies['@reduxjs/toolkit'] = VERSIONS.reduxToolkit;
        pkg.dependencies['react-redux'] = VERSIONS.reactRedux;
        break;
      case 'zustand':
        pkg.dependencies.zustand = VERSIONS.zustand;
        break;
      case 'jotai':
        pkg.dependencies.jotai = VERSIONS.jotai;
        break;
      case 'valtio':
        pkg.dependencies.valtio = VERSIONS.valtio;
        break;
      case 'pinia':
        pkg.dependencies.pinia = VERSIONS.pinia;
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
        pkg.dependencies.axios = VERSIONS.axios;
        break;
      case 'tanstack-query':
        pkg.dependencies['@tanstack/react-query'] = VERSIONS.tanstackQuery;
        pkg.devDependencies['@tanstack/react-query-devtools'] = VERSIONS.tanstackQueryDevtools;
        break;
      case 'swr':
        pkg.dependencies.swr = VERSIONS.swr;
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
   * Add internationalization (i18n) dependencies based on framework
   */
  private addI18nDependencies(pkg: any): void {
    switch (this.options.framework) {
      case 'react':
      case 'preact':
        pkg.dependencies['react-i18next'] = VERSIONS.reactI18next;
        pkg.dependencies['i18next'] = VERSIONS.i18next;
        break;
      case 'vue':
        pkg.dependencies['vue-i18n'] = VERSIONS.vueI18n;
        break;
      case 'svelte':
        pkg.dependencies['svelte-i18n'] = '^4.0.1';
        break;
      case 'solid':
        // Solid uses a simple custom implementation, no external dependency needed
        // Or can use @solid-primitives/i18n
        pkg.dependencies['@solid-primitives/i18n'] = '^2.1.1';
        break;
      default:
        // Vanilla JS - no external dependency needed, uses custom implementation
        break;
    }
  }

  /**
   * Add styling configurations
   */
  private addStylingConfigs(): void {
    const configExt = 'ts';
    const cssPath = join(this.projectPath, 'src/index.css');
    
    // Tailwind CSS 4 uses CSS-first configuration - no postcss.config needed
    // Only add postcss config for non-tailwind styling options that need it
    if (['css-modules', 'sass'].includes(this.options.styling)) {
      const configContent = `import type { Config } from 'postcss-load-config';
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
        // Tailwind CSS 4 uses CSS-first configuration
        // No tailwind.config.js needed - configuration is done in CSS
        writeFileSync(cssPath, `@import "tailwindcss";

/* Custom styles can be added below */
/* Tailwind CSS 4 uses CSS-first configuration */
/* See: https://tailwindcss.com/docs/v4-beta */
`);
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
    if (this.options.features.includes('pwa')) {
      this.addPWAConfig();
    }

    if (this.options.features.includes('analyzer')) {
      this.addBundleAnalyzerConfig();
    }

    if (this.options.features.includes('i18n')) {
      this.addI18nConfig();
    }

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

    // Add strict TypeScript configuration when strict-ts feature is selected
    if (this.options.features.includes('strict-ts') && this.options.typescript) {
      this.addStrictTypeScriptConfig();
    }
  }

  /**
   * Add strict TypeScript configuration
   * Adds noUncheckedIndexedAccess and exactOptionalPropertyTypes to tsconfig.json
   */
  private addStrictTypeScriptConfig(): void {
    const tsconfigPath = join(this.projectPath, 'tsconfig.json');
    
    if (existsSync(tsconfigPath)) {
      try {
        const tsconfigContent = readFileSync(tsconfigPath, 'utf8');
        const tsconfig = JSON.parse(tsconfigContent);
        
        // Ensure compilerOptions exists
        tsconfig.compilerOptions = tsconfig.compilerOptions || {};
        
        // Add additional strict flags
        tsconfig.compilerOptions.noUncheckedIndexedAccess = true;
        tsconfig.compilerOptions.exactOptionalPropertyTypes = true;
        
        writeFileSync(
          tsconfigPath,
          JSON.stringify(tsconfig, null, 2)
        );
      } catch (error: any) {
        console.warn(`Warning: Could not update tsconfig.json with strict-ts settings: ${error.message}`);
      }
    }
  }

  /**
   * Add PWA configuration with Workbox for offline support
   * Configures vite-plugin-pwa with service worker and manifest
   */
  private addPWAConfig(): void {
    // Create PWA manifest file
    const manifestContent = {
      name: this.options.name,
      short_name: this.options.name,
      description: `${this.options.name} - A Progressive Web App`,
      theme_color: '#ffffff',
      background_color: '#ffffff',
      display: 'standalone',
      scope: '/',
      start_url: '/',
      icons: [
        {
          src: '/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        },
        {
          src: '/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ]
    };

    const publicDir = join(this.projectPath, 'public');
    if (!existsSync(publicDir)) {
      mkdirSync(publicDir, { recursive: true });
    }

    writeFileSync(
      join(publicDir, 'manifest.json'),
      JSON.stringify(manifestContent, null, 2)
    );

    // Update vite.config to include PWA plugin
    this.updateViteConfigForPWA();
  }

  /**
   * Update vite.config file to include PWA plugin configuration
   */
  private updateViteConfigForPWA(): void {
    const ext = this.options.typescript ? 'ts' : 'js';
    const viteConfigPath = join(this.projectPath, `vite.config.${ext}`);

    if (!existsSync(viteConfigPath)) {
      return;
    }

    try {
      let viteConfig = readFileSync(viteConfigPath, 'utf8');

      // Add PWA import if not present
      if (!viteConfig.includes('vite-plugin-pwa')) {
        // Add import at the top after other imports
        const importStatement = `import { VitePWA } from 'vite-plugin-pwa';\n`;
        
        // Find the last import statement and add after it
        const importRegex = /^import .+ from .+;?\n/gm;
        let lastImportMatch: RegExpExecArray | null = null;
        let match: RegExpExecArray | null;
        
        while ((match = importRegex.exec(viteConfig)) !== null) {
          lastImportMatch = match;
        }

        if (lastImportMatch) {
          const insertPosition = lastImportMatch.index + lastImportMatch[0].length;
          viteConfig = viteConfig.slice(0, insertPosition) + importStatement + viteConfig.slice(insertPosition);
        } else {
          // No imports found, add at the beginning
          viteConfig = importStatement + viteConfig;
        }

        // Add PWA plugin to the plugins array
        const pwaPluginConfig = `
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: '${this.options.name}',
        short_name: '${this.options.name}',
        description: '${this.options.name} - A Progressive Web App',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\\/\\/fonts\\.googleapis\\.com\\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\\/\\/fonts\\.gstatic\\.com\\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    }),`;

        // Find the plugins array and add PWA plugin
        const pluginsRegex = /plugins:\s*\[/;
        const pluginsMatch = viteConfig.match(pluginsRegex);
        
        if (pluginsMatch && pluginsMatch.index !== undefined) {
          const insertPosition = pluginsMatch.index + pluginsMatch[0].length;
          viteConfig = viteConfig.slice(0, insertPosition) + pwaPluginConfig + viteConfig.slice(insertPosition);
        }

        writeFileSync(viteConfigPath, viteConfig);
      }
    } catch (error: any) {
      console.warn(`Warning: Could not update vite.config for PWA: ${error.message}`);
    }
  }

  /**
   * Add bundle analyzer configuration
   * Configures rollup-plugin-visualizer for bundle analysis
   */
  private addBundleAnalyzerConfig(): void {
    const ext = this.options.typescript ? 'ts' : 'js';
    const viteConfigPath = join(this.projectPath, `vite.config.${ext}`);

    if (!existsSync(viteConfigPath)) {
      return;
    }

    try {
      let viteConfig = readFileSync(viteConfigPath, 'utf8');

      // Add visualizer import if not present
      if (!viteConfig.includes('rollup-plugin-visualizer')) {
        const importStatement = `import { visualizer } from 'rollup-plugin-visualizer';\n`;
        
        // Find the last import statement and add after it
        const importRegex = /^import .+ from .+;?\n/gm;
        let lastImportMatch: RegExpExecArray | null = null;
        let match: RegExpExecArray | null;
        
        while ((match = importRegex.exec(viteConfig)) !== null) {
          lastImportMatch = match;
        }

        if (lastImportMatch) {
          const insertPosition = lastImportMatch.index + lastImportMatch[0].length;
          viteConfig = viteConfig.slice(0, insertPosition) + importStatement + viteConfig.slice(insertPosition);
        } else {
          viteConfig = importStatement + viteConfig;
        }

        // Add visualizer plugin to the plugins array (only in analyze mode)
        const visualizerPluginConfig = `
    ...(process.env.ANALYZE === 'true' ? [visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap'
    })] : []),`;

        // Find the plugins array and add visualizer plugin
        const pluginsRegex = /plugins:\s*\[/;
        const pluginsMatch = viteConfig.match(pluginsRegex);
        
        if (pluginsMatch && pluginsMatch.index !== undefined) {
          const insertPosition = pluginsMatch.index + pluginsMatch[0].length;
          viteConfig = viteConfig.slice(0, insertPosition) + visualizerPluginConfig + viteConfig.slice(insertPosition);
        }

        writeFileSync(viteConfigPath, viteConfig);
      }
    } catch (error: any) {
      console.warn(`Warning: Could not update vite.config for bundle analyzer: ${error.message}`);
    }
  }

  /**
   * Add internationalization (i18n) configuration
   * Configures appropriate i18n library based on framework
   */
  private addI18nConfig(): void {
    const srcPath = join(this.projectPath, 'src');
    const i18nDir = join(srcPath, 'i18n');
    const localesDir = join(i18nDir, 'locales');

    // Create i18n directories
    mkdirSync(localesDir, { recursive: true });

    // Create default locale files
    const enTranslations = {
      common: {
        welcome: 'Welcome',
        hello: 'Hello',
        goodbye: 'Goodbye'
      },
      app: {
        title: this.options.name,
        description: `Welcome to ${this.options.name}`
      }
    };

    const esTranslations = {
      common: {
        welcome: 'Bienvenido',
        hello: 'Hola',
        goodbye: 'Adiós'
      },
      app: {
        title: this.options.name,
        description: `Bienvenido a ${this.options.name}`
      }
    };

    writeFileSync(
      join(localesDir, 'en.json'),
      JSON.stringify(enTranslations, null, 2)
    );

    writeFileSync(
      join(localesDir, 'es.json'),
      JSON.stringify(esTranslations, null, 2)
    );

    // Create framework-specific i18n configuration
    switch (this.options.framework) {
      case 'react':
      case 'preact':
        this.createReactI18nConfig(i18nDir);
        break;
      case 'vue':
        this.createVueI18nConfig(i18nDir);
        break;
      case 'svelte':
        this.createSvelteI18nConfig(i18nDir);
        break;
      case 'solid':
        this.createSolidI18nConfig(i18nDir);
        break;
      default:
        this.createVanillaI18nConfig(i18nDir);
        break;
    }
  }

  /**
   * Create React/Preact i18n configuration using react-i18next
   */
  private createReactI18nConfig(i18nDir: string): void {
    const ext = this.options.typescript ? 'ts' : 'js';
    
    const i18nConfig = `import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import es from './locales/es.json';

const resources = {
  en: { translation: en },
  es: { translation: es }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
`;

    writeFileSync(join(i18nDir, `index.${ext}`), i18nConfig);

    // Create a hook for using translations
    const useTranslationHook = this.options.typescript
      ? `import { useTranslation as useI18nTranslation } from 'react-i18next';

export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return { t, i18n, changeLanguage };
};
`
      : `import { useTranslation as useI18nTranslation } from 'react-i18next';

export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();
  
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return { t, i18n, changeLanguage };
};
`;

    const hooksDir = join(this.projectPath, 'src', 'hooks');
    if (!existsSync(hooksDir)) {
      mkdirSync(hooksDir, { recursive: true });
    }
    writeFileSync(join(hooksDir, `useTranslation.${ext}`), useTranslationHook);
  }

  /**
   * Create Vue i18n configuration using vue-i18n
   */
  private createVueI18nConfig(i18nDir: string): void {
    const ext = this.options.typescript ? 'ts' : 'js';
    
    const i18nConfig = `import { createI18n } from 'vue-i18n';

import en from './locales/en.json';
import es from './locales/es.json';

const messages = {
  en,
  es
};

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages
});

export default i18n;
`;

    writeFileSync(join(i18nDir, `index.${ext}`), i18nConfig);

    // Create a composable for using translations
    const useI18nComposable = this.options.typescript
      ? `import { useI18n as useVueI18n } from 'vue-i18n';

export const useTranslation = () => {
  const { t, locale } = useVueI18n();
  
  const changeLanguage = (lng: string) => {
    locale.value = lng;
  };

  return { t, locale, changeLanguage };
};
`
      : `import { useI18n as useVueI18n } from 'vue-i18n';

export const useTranslation = () => {
  const { t, locale } = useVueI18n();
  
  const changeLanguage = (lng) => {
    locale.value = lng;
  };

  return { t, locale, changeLanguage };
};
`;

    const composablesDir = join(this.projectPath, 'src', 'composables');
    if (!existsSync(composablesDir)) {
      mkdirSync(composablesDir, { recursive: true });
    }
    writeFileSync(join(composablesDir, `useTranslation.${ext}`), useI18nComposable);
  }

  /**
   * Create Svelte i18n configuration using svelte-i18n
   */
  private createSvelteI18nConfig(i18nDir: string): void {
    const ext = this.options.typescript ? 'ts' : 'js';
    
    const i18nConfig = `import { addMessages, init, getLocaleFromNavigator } from 'svelte-i18n';

import en from './locales/en.json';
import es from './locales/es.json';

addMessages('en', en);
addMessages('es', es);

init({
  fallbackLocale: 'en',
  initialLocale: getLocaleFromNavigator()
});
`;

    writeFileSync(join(i18nDir, `index.${ext}`), i18nConfig);
  }

  /**
   * Create Solid i18n configuration using @solid-primitives/i18n
   */
  private createSolidI18nConfig(i18nDir: string): void {
    const ext = this.options.typescript ? 'ts' : 'js';
    
    const i18nConfig = this.options.typescript
      ? `import { createSignal } from 'solid-js';
import en from './locales/en.json';
import es from './locales/es.json';

type Locale = 'en' | 'es';
type TranslationKey = string;

const translations: Record<Locale, Record<string, any>> = {
  en,
  es
};

const [locale, setLocale] = createSignal<Locale>('en');

export const t = (key: TranslationKey): string => {
  const keys = key.split('.');
  let value: any = translations[locale()];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
};

export const changeLanguage = (lng: Locale) => {
  setLocale(lng);
};

export { locale };
`
      : `import { createSignal } from 'solid-js';
import en from './locales/en.json';
import es from './locales/es.json';

const translations = {
  en,
  es
};

const [locale, setLocale] = createSignal('en');

export const t = (key) => {
  const keys = key.split('.');
  let value = translations[locale()];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
};

export const changeLanguage = (lng) => {
  setLocale(lng);
};

export { locale };
`;

    writeFileSync(join(i18nDir, `index.${ext}`), i18nConfig);
  }

  /**
   * Create Vanilla JS i18n configuration
   */
  private createVanillaI18nConfig(i18nDir: string): void {
    const ext = this.options.typescript ? 'ts' : 'js';
    
    const i18nConfig = this.options.typescript
      ? `import en from './locales/en.json';
import es from './locales/es.json';

type Locale = 'en' | 'es';

const translations: Record<Locale, Record<string, any>> = {
  en,
  es
};

let currentLocale: Locale = 'en';

export const t = (key: string): string => {
  const keys = key.split('.');
  let value: any = translations[currentLocale];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
};

export const changeLanguage = (lng: Locale) => {
  currentLocale = lng;
};

export const getLocale = (): Locale => currentLocale;
`
      : `import en from './locales/en.json';
import es from './locales/es.json';

const translations = {
  en,
  es
};

let currentLocale = 'en';

export const t = (key) => {
  const keys = key.split('.');
  let value = translations[currentLocale];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
};

export const changeLanguage = (lng) => {
  currentLocale = lng;
};

export const getLocale = () => currentLocale;
`;

    writeFileSync(join(i18nDir, `index.${ext}`), i18nConfig);
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
   * Removes the partially created project directory and reports the result
   */
  private cleanup(): void {
    const result = cleanupProject(this.projectPath);
    
    if (result.existed) {
      if (result.success) {
        console.log(chalk.yellow(`\n🧹 Cleaned up partial project at: ${this.projectPath}`));
      } else {
        console.error(chalk.red(`\n⚠️ Failed to clean up partial project at: ${this.projectPath}`));
        if (result.error) {
          console.error(chalk.red(`   Error: ${result.error}`));
        }
        console.log(chalk.yellow(`   Please manually remove the directory: rm -rf "${this.projectPath}"`));
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
    .version('1.0.0')
    .argument('[project-name]', 'name of the project')
    .option('-t, --template <template>', 'template to use (default, minimal)')
    .option('-s, --styling <styling>', 'styling solution (tailwind, styled-components, css-modules, sass)')
    .option('-p, --package-manager <pm>', 'package manager to use (bun, npm, pnpm, yarn)')
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