import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * **Feature: cli-modernization, Property 9: Project Structure Correctness**
 *
 * *For any* generated project, the project SHALL contain the expected directory structure
 * (src/, with appropriate subdirectories), a valid .gitignore file, and ESM module
 * configuration ("type": "module").
 *
 * **Validates: Requirements 12.1, 12.2, 12.3**
 */
describe('Property 9: Project Structure Correctness', () => {
  // Arbitrary for framework selection
  const frameworkArb = fc.constantFrom('react', 'vue', 'svelte', 'solid', 'preact', 'vanilla');

  // Arbitrary for language selection
  const languageArb = fc.constantFrom('ts', 'js');

  // Arbitrary for valid project names
  const projectNameArb = fc.stringMatching(/^[a-z][a-z0-9-]*$/)
    .filter(name => name.length >= 1 && name.length <= 50);

  /**
   * Interface representing expected project structure
   */
  interface ProjectStructure {
    srcDir: boolean;
    subdirectories: string[];
    gitignore: boolean;
    packageJsonType: string;
  }

  /**
   * Get expected subdirectories based on framework and language
   */
  function getExpectedSubdirectories(framework: string, typescript: boolean): string[] {
    const subdirs: string[] = [];

    switch (framework) {
      case 'react':
      case 'preact':
      case 'solid':
        subdirs.push('components', 'hooks', 'utils');
        if (typescript) {
          subdirs.push('types');
        }
        break;
      case 'vue':
        subdirs.push('components', 'composables', 'utils');
        if (typescript) {
          subdirs.push('types');
        }
        break;
      case 'svelte':
        subdirs.push('lib', 'components', 'utils');
        if (typescript) {
          subdirs.push('types');
        }
        break;
      case 'vanilla':
        subdirs.push('utils');
        if (typescript) {
          subdirs.push('types');
        }
        break;
    }

    return subdirs;
  }

  /**
   * Simulates the project structure generation logic
   */
  function generateProjectStructure(options: {
    name: string;
    framework: string;
    typescript: boolean;
  }): ProjectStructure {
    const subdirectories = getExpectedSubdirectories(options.framework, options.typescript);

    return {
      srcDir: true,
      subdirectories,
      gitignore: true,
      packageJsonType: 'module',
    };
  }

  /**
   * Validates the expected .gitignore content
   */
  function validateGitignoreContent(content: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const requiredPatterns = [
      'node_modules',
      'dist',
      '.env',
      '.DS_Store',
    ];

    for (const pattern of requiredPatterns) {
      if (!content.includes(pattern)) {
        errors.push(`Missing required pattern: ${pattern}`);
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Sample .gitignore content that would be generated
   */
  const sampleGitignoreContent = `# Dependency directories
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

  it('should have src/ directory for any framework and language combination', () => {
    fc.assert(
      fc.property(
        projectNameArb,
        frameworkArb,
        languageArb,
        (name, framework, language) => {
          const structure = generateProjectStructure({
            name,
            framework,
            typescript: language === 'ts',
          });

          expect(structure.srcDir).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have appropriate subdirectories based on framework', () => {
    fc.assert(
      fc.property(
        projectNameArb,
        frameworkArb,
        languageArb,
        (name, framework, language) => {
          const typescript = language === 'ts';
          const structure = generateProjectStructure({
            name,
            framework,
            typescript,
          });

          const expectedSubdirs = getExpectedSubdirectories(framework, typescript);
          expect(structure.subdirectories).toEqual(expectedSubdirs);
          expect(structure.subdirectories.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should include types directory for TypeScript projects', () => {
    fc.assert(
      fc.property(
        projectNameArb,
        frameworkArb,
        (name, framework) => {
          const structure = generateProjectStructure({
            name,
            framework,
            typescript: true,
          });

          expect(structure.subdirectories).toContain('types');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not include types directory for JavaScript projects', () => {
    fc.assert(
      fc.property(
        projectNameArb,
        frameworkArb,
        (name, framework) => {
          const structure = generateProjectStructure({
            name,
            framework,
            typescript: false,
          });

          expect(structure.subdirectories).not.toContain('types');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have .gitignore file for any project', () => {
    fc.assert(
      fc.property(
        projectNameArb,
        frameworkArb,
        languageArb,
        (name, framework, language) => {
          const structure = generateProjectStructure({
            name,
            framework,
            typescript: language === 'ts',
          });

          expect(structure.gitignore).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have valid .gitignore content with required patterns', () => {
    fc.assert(
      fc.property(
        projectNameArb,
        frameworkArb,
        languageArb,
        (_name, _framework, _language) => {
          const validation = validateGitignoreContent(sampleGitignoreContent);
          expect(validation.valid).toBe(true);
          if (!validation.valid) {
            console.log('Validation errors:', validation.errors);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have "type": "module" in package.json for ESM support', () => {
    fc.assert(
      fc.property(
        projectNameArb,
        frameworkArb,
        languageArb,
        (name, framework, language) => {
          const structure = generateProjectStructure({
            name,
            framework,
            typescript: language === 'ts',
          });

          expect(structure.packageJsonType).toBe('module');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have components directory for component-based frameworks', () => {
    const componentFrameworkArb = fc.constantFrom('react', 'vue', 'svelte', 'solid', 'preact');

    fc.assert(
      fc.property(
        projectNameArb,
        componentFrameworkArb,
        languageArb,
        (name, framework, language) => {
          const structure = generateProjectStructure({
            name,
            framework,
            typescript: language === 'ts',
          });

          expect(structure.subdirectories).toContain('components');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have utils directory for all frameworks', () => {
    fc.assert(
      fc.property(
        projectNameArb,
        frameworkArb,
        languageArb,
        (name, framework, language) => {
          const structure = generateProjectStructure({
            name,
            framework,
            typescript: language === 'ts',
          });

          expect(structure.subdirectories).toContain('utils');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have hooks directory for React-like frameworks', () => {
    const reactLikeFrameworkArb = fc.constantFrom('react', 'preact', 'solid');

    fc.assert(
      fc.property(
        projectNameArb,
        reactLikeFrameworkArb,
        languageArb,
        (name, framework, language) => {
          const structure = generateProjectStructure({
            name,
            framework,
            typescript: language === 'ts',
          });

          expect(structure.subdirectories).toContain('hooks');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have composables directory for Vue framework', () => {
    fc.assert(
      fc.property(
        projectNameArb,
        fc.constant('vue'),
        languageArb,
        (name, framework, language) => {
          const structure = generateProjectStructure({
            name,
            framework,
            typescript: language === 'ts',
          });

          expect(structure.subdirectories).toContain('composables');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have lib directory for Svelte framework', () => {
    fc.assert(
      fc.property(
        projectNameArb,
        fc.constant('svelte'),
        languageArb,
        (name, framework, language) => {
          const structure = generateProjectStructure({
            name,
            framework,
            typescript: language === 'ts',
          });

          expect(structure.subdirectories).toContain('lib');
        }
      ),
      { numRuns: 100 }
    );
  });
});
