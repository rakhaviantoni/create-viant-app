#!/usr/bin/env node

import { execSync, spawn } from 'child_process';
import { existsSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'fs';
import pkg from 'fs-extra';
const { copySync } = pkg;
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';

import { Command } from 'commander';
import prompts from 'prompts';
import kleur from 'kleur';
// import degitPkg from 'degit';
// const degit = degitPkg;
import ora from 'ora';
import validateProjectName from 'validate-npm-package-name';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// ASCII Art Banner
const banner = kleur.magenta(`
██╗   ██╗██╗ █████╗ ███╗   ██╗████████╗
██║   ██║██║██╔══██╗████╗  ██║╚══██╔══╝
██║   ██║██║███████║██╔██╗ ██║   ██║   
╚██╗ ██╔╝██║██╔══██║██║╚██╗██║   ██║   
 ╚████╔╝ ██║██║  ██║██║ ╚████║   ██║   
  ╚═══╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝   
`) + kleur.cyan('\nCreate modern React apps with zero configuration\n');

// Template definitions
const templates = {
  default: 'Full-featured template with TypeScript, Tailwind, and testing',
  // typescript: 'TypeScript-only template with minimal dependencies',
  minimal: 'Bare minimum React + Vite setup',
  // fullstack: 'Full-stack template with backend API structure'
};

// Styling options
const stylingOptions = {
  tailwind: 'Utility-first CSS framework',
  'styled-components': 'CSS-in-JS library',
  'css-modules': 'Scoped CSS',
  sass: 'CSS preprocessor'
};

// Feature options
const featureOptions = [
  { name: 'PWA Support', value: 'pwa' },
  { name: 'Bundle Analyzer', value: 'analyzer' },
  { name: 'GitHub Actions CI/CD', value: 'github-actions' },
  { name: 'Docker Configuration', value: 'docker' },
  { name: 'Storybook', value: 'storybook' },
  { name: 'Husky Git Hooks', value: 'husky' }
];

/**
 * Detect available package managers
 * @returns {string[]} Array of available package managers
 */
function detectPackageManagers() {
  const managers = [];
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
 * @param {string} name - Project name to validate
 * @returns {boolean|string} - True if valid, error message if invalid
 */
function validateName(name) {
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
 * @param {string} [projectName] - Optional project name from command line
 * @returns {Promise<Object>} Project options
 */
async function getProjectOptions(projectName) {
  console.log(banner);
  
  const availableManagers = detectPackageManagers();
  
  // Prepare prompts
  const questions = [];

  // Project name
  if (!projectName) {
    questions.push({
      type: 'text',
      name: 'name',
      message: 'Project name:',
      initial: 'my-viant-app',
      validate: validateName
    });
  }

  // Template selection
  questions.push({
    type: 'select',
    name: 'template',
    message: 'Choose a template:',
    choices: Object.entries(templates).map(([value, description]) => ({
      title: value,
      description,
      value
    })),
    initial: 0
  });

  // Styling solution (only for non-minimal templates)
  questions.push({
    type: 'select',
    name: 'styling',
    message: 'Which styling solution would you prefer?',
    choices: Object.entries(stylingOptions).map(([value, description]) => ({
      title: value,
      description,
      value
    })),
    initial: 0,
    onRender(kleur) {
      this.msg = this.template === 'minimal' 
        ? kleur.yellow('Which styling solution would you prefer? (minimal template will have basic CSS)') 
        : 'Which styling solution would you prefer?';
    }
  });

  // Package manager
  questions.push({
    type: 'select',
    name: 'packageManager',
    message: 'Package manager:',
    choices: availableManagers.map(manager => ({
      title: manager,
      value: manager
    })),
    initial: 0
  });

  // Additional features (for non-minimal templates)
  questions.push({
    type: 'multiselect',
    name: 'features',
    message: 'Select additional features:',
    choices: featureOptions,
    instructions: false,
    hint: '- Space to select. Return to submit',
    skip: () => false
  });

  // Install dependencies
  questions.push({
    type: 'confirm',
    name: 'installDeps',
    message: 'Install dependencies?',
    initial: true
  });

  // Initialize git
  questions.push({
    type: 'confirm',
    name: 'initGit',
    message: 'Initialize git repository?',
    initial: true
  });

  const response = await prompts(questions, {
    onCancel: () => {
      console.log(kleur.red('\n✖ Operation cancelled'));
      process.exit(1);
    }
  });

  return {
    name: projectName || response.name,
    template: response.template,
    styling: response.styling,
    packageManager: response.packageManager,
    features: response.features || [],
    installDeps: response.installDeps,
    initGit: response.initGit,
    typescript: true // Always use TypeScript for now
  };
}

/**
 * Project generator class
 */
class ProjectGenerator {
  /**
   * @param {Object} options - Project options
   */
  constructor(options) {
    this.options = options;
    this.projectPath = resolve(process.cwd(), options.name);
    this.templatePath = join(__dirname, 'templates', options.template);
    this.spinner = ora();
  }

  /**
   * Generate the project
   */
  async generate() {
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
      
      this.spinner.succeed('Project structure created successfully!');
      
      // Install dependencies if requested
      if (this.options.installDeps) {
        await this.installDependencies();
      }
      
      // Show completion message
      this.showCompletionMessage();
      
    } catch (error) {
      this.spinner.fail(`Failed to create project: ${error.message}`);
      
      // Cleanup on failure
      this.cleanup();
      
      process.exit(1);
    }
  }

  /**
   * Validate project directory
   */
  validateProjectDir() {
    if (existsSync(this.projectPath)) {
      throw new Error(`Directory ${this.options.name} already exists!`);
    }
    
    mkdirSync(this.projectPath, { recursive: true });
  }

  /**
   * Copy template files
   */
  async copyTemplateFiles() {
    this.spinner.text = `Copying ${this.options.template} template files...`;
    
    try {
      // Copy base template files
      copySync(this.templatePath, this.projectPath);
      
      // Only copy styling-specific files if they exist
      const stylingPath = join(__dirname, 'templates', 'styles', this.options.styling);
      if (existsSync(stylingPath)) {
        copySync(stylingPath, this.projectPath);
      }
    } catch (error) {
      throw new Error(`Failed to copy template files: ${error.message}`);
    }
  }

  /**
   * Customize files based on options
   */
  async customizeFiles() {
    this.spinner.text = 'Customizing project files...';
    
    // Customize package.json
    this.customizePackageJson();
    
    // Add styling configurations
    if (this.options.styling && this.options.styling !== 'css-modules') {
      this.addStylingConfigs();
    }
    
    // Add feature configurations
    if (this.options.features && this.options.features.length > 0) {
      this.addFeatureConfigs();
    }
  }

  /**
   * Customize package.json
   */
  customizePackageJson() {
    const packageJsonPath = join(this.projectPath, 'package.json');
    
    if (existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
        
        // Update package name
        packageJson.name = this.options.name;
        
        // Add styling dependencies
        this.addStylingDependencies(packageJson);
        
        // Add feature dependencies
        this.addFeatureDependencies(packageJson);
        
        // Write updated package.json
        writeFileSync(
          packageJsonPath,
          JSON.stringify(packageJson, null, 2)
        );
      } catch (error) {
        throw new Error(`Failed to customize package.json: ${error.message}`);
      }
    }
  }

  /**
   * Add styling dependencies to package.json
   * @param {Object} pkg - Package.json object
   */
  addStylingDependencies(pkg) {
    pkg.devDependencies = pkg.devDependencies || {};
    
    // Only add ts-node if TypeScript is enabled
    if (this.options.typescript) {
      pkg.devDependencies['ts-node'] = '^10.9.1';
    }
    
    switch (this.options.styling) {
      case 'tailwind':
        pkg.dependencies = pkg.dependencies || {};
        pkg.devDependencies = pkg.devDependencies || {};
        
        pkg.dependencies.clsx = '^2.0.0';
        pkg.devDependencies.tailwindcss = '^3.3.6';
        pkg.devDependencies.autoprefixer = '^10.4.16';
        pkg.devDependencies.postcss = '^8.4.32';
        break;
        
      case 'styled-components':
        pkg.dependencies = pkg.dependencies || {};
        pkg.devDependencies = pkg.devDependencies || {};
        
        pkg.dependencies['styled-components'] = '^6.1.0';
        pkg.devDependencies['@types/styled-components'] = '^5.1.32';
        break;
        
      case 'sass':
        pkg.devDependencies = pkg.devDependencies || {};
        pkg.devDependencies.sass = '^1.69.5';
        break;
    }
  }

  /**
   * Add feature dependencies to package.json
   * @param {Object} pkg - Package.json object
   */
  addFeatureDependencies(pkg) {
    pkg.dependencies = pkg.dependencies || {};
    pkg.devDependencies = pkg.devDependencies || {};
    pkg.scripts = pkg.scripts || {};
    
    if (this.options.features.includes('pwa')) {
      pkg.devDependencies['vite-plugin-pwa'] = '^0.17.4';
    }
    
    if (this.options.features.includes('analyzer')) {
      pkg.devDependencies['vite-bundle-analyzer'] = '^0.7.0';
      pkg.scripts.analyze = 'vite-bundle-analyzer dist';
    }
    
    if (this.options.features.includes('storybook')) {
      Object.assign(pkg.devDependencies, {
        '@storybook/react': '^7.5.0',
        '@storybook/react-vite': '^7.5.0',
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
  }

  /**
   * Add styling configurations
   */
  addStylingConfigs() {
    const configExt = 'ts';
    const cssPath = join(this.projectPath, 'src/index.css');
    
    // Only generate PostCSS config for styling solutions that need it
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
        // Tailwind config remains the same
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
          
          writeFileSync(
            join(this.projectPath, `postcss.config.${configExt}`),
            `import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default {
  plugins: [
    tailwindcss,
    autoprefixer,
  ],
};`
          );
          
          // Update CSS file with Tailwind directives
          writeFileSync(cssPath, `@tailwind base;
    @tailwind components;
    @tailwind utilities;`);
          break;
          
        case 'styled-components':
          // Remove CSS file if it exists
          if (existsSync(cssPath)) {
            rmSync(cssPath);
          }
          break;
          
        case 'css-modules':
          // Enhanced CSS Modules setup
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
          // Enhanced Sass setup
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
          
          // Remove CSS file if it exists
          if (existsSync(cssPath)) {
            rmSync(cssPath);
          }
          break;
    }
  }

  /**
   * Add feature configurations
   */
  addFeatureConfigs() {
    // GitHub Actions
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

    // Docker
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
  async initializeGit() {
    this.spinner.text = 'Initializing git repository...';
    
    try {
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
    } catch (error) {
      // Git initialization is optional, so just log the error
      console.log(kleur.yellow(`\nNote: Git initialization failed: ${error.message}`));
    }
  }

  /**
   * Install dependencies
   */
  async installDependencies() {
    return new Promise((resolve) => {
      this.spinner.start(`Installing dependencies with ${this.options.packageManager}...`);
      
      const install = spawn(this.options.packageManager, ['install'], {
        cwd: this.projectPath,
        stdio: 'pipe'
      });
      
      install.on('close', (code) => {
        if (code === 0) {
          this.spinner.succeed('Dependencies installed successfully!');
        } else {
          this.spinner.fail('Failed to install dependencies');
          console.log(kleur.yellow('\nYou can install them manually by running:'));
          console.log(kleur.cyan(`cd ${this.options.name} && ${this.options.packageManager} install`));
        }
        resolve();
      });
    });
  }

  /**
   * Show completion message
   */
  showCompletionMessage() {
    console.log(`
${kleur.green('🎉 Success!')} Created ${kleur.cyan(this.options.name)} at ${kleur.cyan(this.projectPath)}

${kleur.bold('Next steps:')}
  ${kleur.cyan(`cd ${this.options.name}`)}
  ${kleur.cyan(`${this.options.packageManager} run dev`)}

${kleur.bold('Available commands:')}
  ${kleur.green(`${this.options.packageManager} run dev`)}        Start development server
  ${kleur.green(`${this.options.packageManager} run build`)}      Build for production
  ${kleur.green(`${this.options.packageManager} run preview`)}    Preview production build
  ${kleur.green(`${this.options.packageManager} run lint`)}       Lint code

${kleur.bold('Documentation:')}
  📚 Check out the docs in the docs/ folder

${kleur.yellow('Happy coding! 🚀')}
`);
  }

  /**
   * Cleanup on failure
   */
  cleanup() {
    if (existsSync(this.projectPath)) {
      try {
        rmSync(this.projectPath, { recursive: true, force: true });
      } catch (error) {
        console.error(`Failed to clean up: ${error.message}`);
      }
    }
  }
}

/**
 * Main CLI function
 */
async function main() {
  // Set up command line interface
  const program = new Command();

  program
    .name('create-viant-app')
    .description('Create a new Viant app with zero configuration')
    .version('1.0.0')
    .argument('[project-name]', 'name of the project')
    .option('-t, --template <template>', 'template to use (default, minimal)')
    .option('-s, --styling <styling>', 'styling solution (tailwind, styled-components, css-modules, sass)')
    .option('-pm, --package-manager <pm>', 'package manager to use (bun, npm, pnpm, yarn)')
    .option('--skip-install', 'skip dependency installation')
    .option('--skip-git', 'skip git initialization')
    .action(async (projectName, options) => {
      try {
        let projectOptions;

        if (projectName && options.template && options.styling && options.packageManager) {
          // Non-interactive mode with command line arguments
          projectOptions = {
            name: projectName,
            template: options.template,
            styling: options.styling,
            packageManager: options.packageManager,
            features: [],
            installDeps: !options.skipInstall,
            initGit: !options.skipGit,
            typescript: true
          };
        } else {
          // Interactive mode
          projectOptions = await getProjectOptions(projectName);
        }

        const generator = new ProjectGenerator(projectOptions);
        await generator.generate();
        
      } catch (error) {
        console.error(kleur.red('Error:'), error.message);
        process.exit(1);
      }
    });

  program.parse();
}

// Run the CLI
main().catch(error => {
  console.error(kleur.red('Unexpected error:'), error);
  process.exit(1);
});