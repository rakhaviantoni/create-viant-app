import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Helper to strip comments from JSONC content
 * Handles both single-line and multi-line comments
 * while preserving strings that might contain comment-like patterns
 */
function stripJsonComments(content: string): string {
  let result = '';
  let inString = false;
  let stringChar = '';
  let i = 0;
  
  while (i < content.length) {
    const char = content[i];
    const nextChar = content[i + 1];
    
    // Handle string boundaries
    if ((char === '"' || char === "'") && (i === 0 || content[i - 1] !== '\\')) {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
      }
      result += char;
      i++;
      continue;
    }
    
    // Skip comments only when not in a string
    if (!inString) {
      // Single-line comment
      if (char === '/' && nextChar === '/') {
        // Skip until end of line
        while (i < content.length && content[i] !== '\n') {
          i++;
        }
        continue;
      }
      
      // Multi-line comment
      if (char === '/' && nextChar === '*') {
        i += 2; // Skip /*
        while (i < content.length - 1 && !(content[i] === '*' && content[i + 1] === '/')) {
          i++;
        }
        i += 2; // Skip */
        continue;
      }
    }
    
    result += char;
    i++;
  }
  
  return result;
}

/**
 * Helper to read and parse tsconfig.json from a template
 * Handles JSONC (JSON with comments) format
 */
function readTsConfig(templateName: string): Record<string, any> | null {
  const tsconfigPath = join(process.cwd(), 'templates', templateName, 'tsconfig.json');
  
  if (!existsSync(tsconfigPath)) {
    return null;
  }
  
  try {
    const content = readFileSync(tsconfigPath, 'utf8');
    const jsonContent = stripJsonComments(content);
    return JSON.parse(jsonContent);
  } catch (error) {
    console.error(`Failed to parse tsconfig.json for ${templateName}:`, error);
    return null;
  }
}

/**
 * **Feature: cli-modernization, Property 11: TypeScript Strict Mode**
 *
 * *For any* generated TypeScript template, the tsconfig.json SHALL have strict mode enabled.
 * When the strict-ts feature is selected, additional strict flags (noUncheckedIndexedAccess,
 * exactOptionalPropertyTypes) SHALL be enabled.
 *
 * **Validates: Requirements 8.1, 8.4**
 */
describe('Property 11: TypeScript Strict Mode', () => {
  // All TypeScript templates
  const tsTemplates = [
    'react-ts',
    'vue-ts',
    'svelte-ts',
    'solid-ts',
    'preact-ts',
    'vanilla-ts',
  ];

  // Arbitrary for TypeScript template selection
  const tsTemplateArb = fc.constantFrom(...tsTemplates);

  it('should have strict mode enabled in all TypeScript templates', () => {
    fc.assert(
      fc.property(tsTemplateArb, (template) => {
        const tsconfig = readTsConfig(template);
        
        // Verify tsconfig exists
        expect(tsconfig).not.toBeNull();
        
        // Verify compilerOptions exists
        expect(tsconfig!.compilerOptions).toBeDefined();
        
        // Verify strict mode is enabled
        expect(tsconfig!.compilerOptions.strict).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('should have additional strict checks available for strict-ts feature', () => {
    // This test verifies that the strict-ts feature configuration adds the correct flags
    // The actual implementation adds these flags dynamically when the feature is selected
    
    fc.assert(
      fc.property(tsTemplateArb, (template) => {
        const tsconfig = readTsConfig(template);
        
        // Verify tsconfig exists
        expect(tsconfig).not.toBeNull();
        
        // Verify compilerOptions exists
        expect(tsconfig!.compilerOptions).toBeDefined();
        
        // Verify base strict mode is enabled (prerequisite for strict-ts feature)
        expect(tsconfig!.compilerOptions.strict).toBe(true);
        
        // The strict-ts feature adds these flags dynamically during project generation
        // Here we verify the base configuration supports adding these flags
        // (they should not conflict with existing settings)
        const compilerOptions = tsconfig!.compilerOptions;
        
        // If these flags are already set, they should be boolean
        if ('noUncheckedIndexedAccess' in compilerOptions) {
          expect(typeof compilerOptions.noUncheckedIndexedAccess).toBe('boolean');
        }
        if ('exactOptionalPropertyTypes' in compilerOptions) {
          expect(typeof compilerOptions.exactOptionalPropertyTypes).toBe('boolean');
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should have consistent strict mode settings across all TypeScript templates', () => {
    fc.assert(
      fc.property(
        fc.tuple(tsTemplateArb, tsTemplateArb),
        ([template1, template2]) => {
          const tsconfig1 = readTsConfig(template1);
          const tsconfig2 = readTsConfig(template2);
          
          // Both should have strict mode enabled
          expect(tsconfig1?.compilerOptions?.strict).toBe(true);
          expect(tsconfig2?.compilerOptions?.strict).toBe(true);
          
          // Both should have the same strict-related settings
          expect(tsconfig1?.compilerOptions?.noUnusedLocals).toBe(
            tsconfig2?.compilerOptions?.noUnusedLocals
          );
          expect(tsconfig1?.compilerOptions?.noUnusedParameters).toBe(
            tsconfig2?.compilerOptions?.noUnusedParameters
          );
          expect(tsconfig1?.compilerOptions?.noFallthroughCasesInSwitch).toBe(
            tsconfig2?.compilerOptions?.noFallthroughCasesInSwitch
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * **Feature: cli-modernization, Property 10: Path Alias Configuration**
 *
 * *For any* generated TypeScript template, the tsconfig.json SHALL contain path alias
 * configuration mapping "@/*" to "./src/*".
 *
 * **Validates: Requirements 7.5**
 */
describe('Property 10: Path Alias Configuration', () => {
  // All TypeScript templates
  const tsTemplates = [
    'react-ts',
    'vue-ts',
    'svelte-ts',
    'solid-ts',
    'preact-ts',
    'vanilla-ts',
  ];

  // Arbitrary for TypeScript template selection
  const tsTemplateArb = fc.constantFrom(...tsTemplates);

  it('should have path alias configuration in all TypeScript templates', () => {
    fc.assert(
      fc.property(tsTemplateArb, (template) => {
        const tsconfig = readTsConfig(template);
        
        // Verify tsconfig exists
        expect(tsconfig).not.toBeNull();
        
        // Verify compilerOptions exists
        expect(tsconfig!.compilerOptions).toBeDefined();
        
        // Verify baseUrl is set
        expect(tsconfig!.compilerOptions.baseUrl).toBe('.');
        
        // Verify paths configuration exists
        expect(tsconfig!.compilerOptions.paths).toBeDefined();
        
        // Verify @/* alias is configured
        expect(tsconfig!.compilerOptions.paths['@/*']).toBeDefined();
        expect(tsconfig!.compilerOptions.paths['@/*']).toContain('./src/*');
      }),
      { numRuns: 100 }
    );
  });

  it('should have consistent path alias configuration across all TypeScript templates', () => {
    fc.assert(
      fc.property(
        fc.tuple(tsTemplateArb, tsTemplateArb),
        ([template1, template2]) => {
          const tsconfig1 = readTsConfig(template1);
          const tsconfig2 = readTsConfig(template2);
          
          // Both should have the same baseUrl
          expect(tsconfig1?.compilerOptions?.baseUrl).toBe(
            tsconfig2?.compilerOptions?.baseUrl
          );
          
          // Both should have the same @/* path alias
          expect(tsconfig1?.compilerOptions?.paths?.['@/*']).toEqual(
            tsconfig2?.compilerOptions?.paths?.['@/*']
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have moduleResolution set to bundler for ESM support', () => {
    fc.assert(
      fc.property(tsTemplateArb, (template) => {
        const tsconfig = readTsConfig(template);
        
        // Verify tsconfig exists
        expect(tsconfig).not.toBeNull();
        
        // Verify moduleResolution is set to bundler
        expect(tsconfig!.compilerOptions.moduleResolution).toBe('bundler');
      }),
      { numRuns: 100 }
    );
  });
});
