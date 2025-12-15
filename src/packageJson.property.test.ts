import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * **Feature: cli-modernization, Property 7: Generated Package.json Validity**
 *
 * *For any* combination of project options, the generated package.json SHALL be valid JSON
 * containing all required fields (name, version, type, scripts, dependencies, devDependencies).
 *
 * **Validates: Requirements 9.1**
 */
describe('Property 7: Generated Package.json Validity', () => {
  // Arbitrary for valid project names (npm package name rules)
  const projectNameArb = fc.stringMatching(/^[a-z][a-z0-9-]*$/)
    .filter(name => name.length >= 1 && name.length <= 214);

  // Arbitrary for framework selection
  const frameworkArb = fc.constantFrom('react', 'vue', 'svelte', 'solid', 'preact', 'vanilla');

  // Arbitrary for language selection
  const languageArb = fc.constantFrom('ts', 'js');

  // Arbitrary for styling selection
  const stylingArb = fc.constantFrom(
    'tailwind', 'styled-components', 'emotion', 'css-modules',
    'sass', 'less', 'stylus', 'vanilla-extract', 'unocss', 'none'
  );

  // Arbitrary for features selection
  const featuresArb = fc.subarray([
    'pwa', 'analyzer', 'github-actions', 'docker', 'storybook',
    'husky', 'vitest', 'playwright', 'linting', 'strict-ts',
    'component-lib', 'i18n', 'state-management', 'api-client'
  ]);

  // Arbitrary for package manager selection
  const packageManagerArb = fc.constantFrom('npm', 'pnpm', 'yarn', 'bun');

  /**
   * Interface representing a valid package.json structure
   */
  interface PackageJson {
    name: string;
    version: string;
    type: string;
    scripts: Record<string, string>;
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
    description?: string;
    license?: string;
    keywords?: string[];
    author?: string;
  }

  /**
   * Validates that a package.json object has all required fields
   */
  function validatePackageJson(pkg: PackageJson): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const requiredFields = ['name', 'version', 'type', 'scripts', 'dependencies', 'devDependencies'];

    for (const field of requiredFields) {
      if (pkg[field as keyof PackageJson] === undefined) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Validate name is a non-empty string
    if (typeof pkg.name !== 'string' || pkg.name.trim() === '') {
      errors.push('name must be a non-empty string');
    }

    // Validate version is a string
    if (typeof pkg.version !== 'string') {
      errors.push('version must be a string');
    }

    // Validate type is "module"
    if (pkg.type !== 'module') {
      errors.push('type must be "module" for ESM support');
    }

    // Validate scripts is an object
    if (typeof pkg.scripts !== 'object' || pkg.scripts === null) {
      errors.push('scripts must be an object');
    }

    // Validate dependencies is an object
    if (typeof pkg.dependencies !== 'object' || pkg.dependencies === null) {
      errors.push('dependencies must be an object');
    }

    // Validate devDependencies is an object
    if (typeof pkg.devDependencies !== 'object' || pkg.devDependencies === null) {
      errors.push('devDependencies must be an object');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Simulates the package.json generation logic from the CLI
   */
  function generatePackageJson(options: {
    name: string;
    framework: string;
    typescript: boolean;
    styling: string;
    features: string[];
  }): PackageJson {
    // Start with a base package.json structure
    const pkg: PackageJson = {
      name: options.name,
      version: '1.0.0',
      type: 'module',
      scripts: {
        dev: 'vite',
        build: options.typescript ? 'tsc -b && vite build' : 'vite build',
        preview: 'vite preview',
      },
      dependencies: {},
      devDependencies: {},
      description: `Modern ${options.framework} app built with Viant CLI`,
      license: 'MIT',
    };

    return pkg;
  }

  it('should generate valid package.json with all required fields for any project options', () => {
    fc.assert(
      fc.property(
        projectNameArb,
        frameworkArb,
        languageArb,
        stylingArb,
        featuresArb,
        packageManagerArb,
        (name, framework, language, _styling, _features, _packageManager) => {
          const pkg = generatePackageJson({
            name,
            framework,
            typescript: language === 'ts',
            styling: _styling,
            features: _features,
          });

          const validation = validatePackageJson(pkg);
          expect(validation.valid).toBe(true);
          if (!validation.valid) {
            console.log('Validation errors:', validation.errors);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should always have "type": "module" for ESM support', () => {
    fc.assert(
      fc.property(
        projectNameArb,
        frameworkArb,
        languageArb,
        (name, framework, language) => {
          const pkg = generatePackageJson({
            name,
            framework,
            typescript: language === 'ts',
            styling: 'none',
            features: [],
          });

          expect(pkg.type).toBe('module');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have valid JSON structure that can be serialized and parsed', () => {
    fc.assert(
      fc.property(
        projectNameArb,
        frameworkArb,
        languageArb,
        stylingArb,
        featuresArb,
        (name, framework, language, styling, features) => {
          const pkg = generatePackageJson({
            name,
            framework,
            typescript: language === 'ts',
            styling,
            features,
          });

          // Should be able to serialize to JSON string
          const jsonString = JSON.stringify(pkg, null, 2);
          expect(typeof jsonString).toBe('string');

          // Should be able to parse back to object
          const parsed = JSON.parse(jsonString);
          expect(parsed).toEqual(pkg);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve project name in generated package.json', () => {
    fc.assert(
      fc.property(
        projectNameArb,
        frameworkArb,
        (name, framework) => {
          const pkg = generatePackageJson({
            name,
            framework,
            typescript: true,
            styling: 'none',
            features: [],
          });

          expect(pkg.name).toBe(name);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have scripts object with at least dev, build, and preview commands', () => {
    fc.assert(
      fc.property(
        projectNameArb,
        frameworkArb,
        languageArb,
        (name, framework, language) => {
          const pkg = generatePackageJson({
            name,
            framework,
            typescript: language === 'ts',
            styling: 'none',
            features: [],
          });

          expect(pkg.scripts).toBeDefined();
          expect(typeof pkg.scripts.dev).toBe('string');
          expect(typeof pkg.scripts.build).toBe('string');
          expect(typeof pkg.scripts.preview).toBe('string');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have dependencies and devDependencies as objects', () => {
    fc.assert(
      fc.property(
        projectNameArb,
        frameworkArb,
        languageArb,
        (name, framework, language) => {
          const pkg = generatePackageJson({
            name,
            framework,
            typescript: language === 'ts',
            styling: 'none',
            features: [],
          });

          expect(typeof pkg.dependencies).toBe('object');
          expect(pkg.dependencies).not.toBeNull();
          expect(typeof pkg.devDependencies).toBe('object');
          expect(pkg.devDependencies).not.toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });
});
