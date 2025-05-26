#!/usr/bin/env node

import { execSync, spawn } from 'child_process';
import { existsSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'fs';
import pkg from 'fs-extra';
const { copySync } = pkg;
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';

import { Command } from 'commander';
import prompts from 'prompts';
import chalk from 'chalk';
import ora from 'ora';
import figlet from 'figlet';
import gradient from 'gradient-string';
import validateProjectName from 'validate-npm-package-name';
import * as readline from 'readline';
import { stdin, stdout, exit } from 'process';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Enhanced ASCII Art Banner with gradients
const createBanner = () => {
  const viantText = figlet.textSync('VIANT', {
    font: 'Slant',
  });
  
  return gradient.pastel(viantText) + 
    '\n' + gradient.vice('⚡ Modern React apps, instantly. Powered by Vite.') + 
    '\n' + chalk.cyan('🚀 TypeScript/JavaScript • Optional: Tailwind CSS • PWA Support') + '\n';
};

// Template definitions
interface Template {
  [key: string]: string;
}

const templates: Template = {
  'react-ts': 'React with TypeScript: A comprehensive Vite-powered setup. Optional Tailwind CSS & PWA. (recommended)',
  'react-js': 'React with JavaScript: A minimal Vite-powered setup. Optional Tailwind CSS & PWA.',
};

interface StylingOptions {
  [key: string]: string;
}

const stylingOptions: StylingOptions = {
  tailwind: 'Utility-first CSS framework',
  'styled-components': 'CSS-in-JS library',
  'css-modules': 'Scoped CSS',
  sass: 'CSS preprocessor'
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
  { name: 'Husky Git Hooks', value: 'husky' }
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

  // Template selection
  questions.push({
    type: 'select',
    name: 'template',
    message: chalk.bold('Choose a template:'),
    choices: Object.entries(templates).map(([value, description]) => ({
      title: value,
      description,
      value
    })),
    initial: 0
  });

  // Styling solution
  questions.push({
    type: 'select',
    name: 'styling',
    message: chalk.bold('Which styling solution would you prefer?'),
    choices: Object.entries(stylingOptions).map(([value, description]) => ({
      title: value,
      description,
      value
    })),
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

  const response = await prompts(questions, {
    onCancel: () => {
      console.log(chalk.red('\n✖ Operation cancelled'));
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
    typescript: true, // Always use TypeScript
    runDev: response.runDev
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
    
    if (this.options.typescript) {
      pkg.devDependencies['ts-node'] = '^10.9.1';
    }
    
    switch (this.options.styling) {
      case 'tailwind':
        pkg.dependencies = pkg.dependencies || {};
        pkg.dependencies.clsx = '^2.0.0';
        pkg.devDependencies.tailwindcss = '^3.3.6';
        pkg.devDependencies.autoprefixer = '^10.4.16';
        pkg.devDependencies.postcss = '^8.4.32';
        break;
        
      case 'styled-components':
        pkg.dependencies = pkg.dependencies || {};
        pkg.dependencies['styled-components'] = '^6.1.0';
        pkg.devDependencies['@types/styled-components'] = '^5.1.32';
        break;
        
      case 'sass':
        pkg.devDependencies.sass = '^1.69.5';
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
          projectOptions = {
            name: projectName,
            template: options.template,
            styling: options.styling,
            packageManager: options.packageManager,
            features: [],
            installDeps: !options.skipInstall,
            initGit: !options.skipGit,
            typescript: true,
            runDev: !options.skipDev
          };
        } else {
          // Interactive mode
          projectOptions = await getProjectOptions(projectName);
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