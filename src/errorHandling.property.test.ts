import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import {
  cleanupProject,
  ProjectGenerationError,
  ERROR_CODES,
  categorizeError,
  getErrorMessage,
  wrapError,
  formatErrorForDisplay,
} from './errorHandling.js';

/**
 * **Feature: cli-modernization, Property 12: Error Cleanup**
 *
 * *For any* error that occurs during project generation after the project directory
 * is created, the cleanup function SHALL remove the partially created project directory.
 *
 * **Validates: Requirements 10.4**
 */
describe('Property 12: Error Cleanup', () => {
  // Base temp directory for tests
  let testBaseDir: string;

  beforeEach(() => {
    // Create a unique test directory for each test run
    testBaseDir = join(tmpdir(), `viant-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(testBaseDir, { recursive: true });
  });

  afterEach(() => {
    // Clean up the test base directory
    if (existsSync(testBaseDir)) {
      rmSync(testBaseDir, { recursive: true, force: true });
    }
  });

  // Arbitrary for valid project names (safe for file system)
  const projectNameArb = fc.stringMatching(/^[a-z][a-z0-9-]{0,20}$/)
    .filter(name => name.length >= 1 && name.length <= 21);

  // Arbitrary for file content
  const fileContentArb = fc.string({ minLength: 0, maxLength: 1000 });

  // Arbitrary for number of files to create
  const fileCountArb = fc.integer({ min: 0, max: 10 });

  // Arbitrary for subdirectory depth
  const depthArb = fc.integer({ min: 0, max: 3 });

  /**
   * Helper to create a project directory with random content
   */
  function createProjectWithContent(
    basePath: string,
    projectName: string,
    fileCount: number,
    depth: number,
    content: string
  ): string {
    const projectPath = join(basePath, projectName);
    mkdirSync(projectPath, { recursive: true });

    // Create files at root level
    for (let i = 0; i < fileCount; i++) {
      writeFileSync(join(projectPath, `file-${i}.txt`), content);
    }

    // Create nested directories with files
    let currentPath = projectPath;
    for (let d = 0; d < depth; d++) {
      currentPath = join(currentPath, `subdir-${d}`);
      mkdirSync(currentPath, { recursive: true });
      for (let i = 0; i < Math.min(fileCount, 3); i++) {
        writeFileSync(join(currentPath, `nested-file-${i}.txt`), content);
      }
    }

    return projectPath;
  }

  it('should remove existing project directory on cleanup', () => {
    fc.assert(
      fc.property(
        projectNameArb,
        fileCountArb,
        depthArb,
        fileContentArb,
        (projectName, fileCount, depth, content) => {
          // Create a project directory with content
          const projectPath = createProjectWithContent(
            testBaseDir,
            projectName,
            fileCount,
            depth,
            content
          );

          // Verify the directory exists before cleanup
          expect(existsSync(projectPath)).toBe(true);

          // Perform cleanup
          const result = cleanupProject(projectPath);

          // Verify cleanup was successful
          expect(result.success).toBe(true);
          expect(result.existed).toBe(true);
          expect(existsSync(projectPath)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle cleanup of non-existent directory gracefully', () => {
    fc.assert(
      fc.property(
        projectNameArb,
        (projectName) => {
          const projectPath = join(testBaseDir, projectName);

          // Ensure directory does not exist
          if (existsSync(projectPath)) {
            rmSync(projectPath, { recursive: true, force: true });
          }

          // Perform cleanup on non-existent directory
          const result = cleanupProject(projectPath);

          // Should succeed but indicate directory didn't exist
          expect(result.success).toBe(true);
          expect(result.existed).toBe(false);
          expect(result.error).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should remove all nested content during cleanup', () => {
    fc.assert(
      fc.property(
        projectNameArb,
        fc.integer({ min: 1, max: 5 }),
        fc.integer({ min: 1, max: 3 }),
        fileContentArb,
        (projectName, fileCount, depth, content) => {
          // Create a project with nested structure
          const projectPath = createProjectWithContent(
            testBaseDir,
            projectName,
            fileCount,
            depth,
            content
          );

          // Verify nested structure exists
          expect(existsSync(projectPath)).toBe(true);

          // Perform cleanup
          const result = cleanupProject(projectPath);

          // Verify complete removal
          expect(result.success).toBe(true);
          expect(existsSync(projectPath)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Additional tests for error handling utilities
 */
describe('Error Handling Utilities', () => {
  describe('ProjectGenerationError', () => {
    it('should create error with correct properties', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }),
          fc.constantFrom(...Object.values(ERROR_CODES)),
          fc.boolean(),
          fc.option(fc.string({ minLength: 1, maxLength: 100 })),
          (message, code, recoverable, hint) => {
            const error = new ProjectGenerationError(message, code, {
              recoverable,
              hint: hint ?? undefined,
            });

            expect(error.message).toBe(message);
            expect(error.code).toBe(code);
            expect(error.recoverable).toBe(recoverable);
            expect(error.hint).toBe(hint ?? undefined);
            expect(error.name).toBe('ProjectGenerationError');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('categorizeError', () => {
    it('should categorize errors based on message content', () => {
      const testCases = [
        { message: 'EEXIST: file already exists', expected: ERROR_CODES.DIR_EXISTS },
        { message: 'Directory already exists', expected: ERROR_CODES.DIR_EXISTS },
        { message: 'ENOENT: no such file or directory', expected: ERROR_CODES.TEMPLATE_NOT_FOUND },
        { message: 'Template not found', expected: ERROR_CODES.TEMPLATE_NOT_FOUND },
        { message: 'EACCES: permission denied', expected: ERROR_CODES.PERMISSION_DENIED },
        { message: 'Permission denied', expected: ERROR_CODES.PERMISSION_DENIED },
        { message: 'ENOSPC: no space left on device', expected: ERROR_CODES.DISK_FULL },
        { message: 'Disk full', expected: ERROR_CODES.DISK_FULL },
        { message: 'Failed to copy files', expected: ERROR_CODES.COPY_FAILED },
        { message: 'npm install failed', expected: ERROR_CODES.INSTALL_FAILED },
        { message: 'yarn install error', expected: ERROR_CODES.INSTALL_FAILED },
        { message: 'pnpm install failed', expected: ERROR_CODES.INSTALL_FAILED },
        { message: 'git init failed', expected: ERROR_CODES.GIT_FAILED },
        { message: 'Invalid package.json', expected: ERROR_CODES.PACKAGE_JSON_INVALID },
        { message: 'Configuration error', expected: ERROR_CODES.CONFIG_FAILED },
        { message: 'Some random error', expected: ERROR_CODES.UNKNOWN },
      ];

      for (const { message, expected } of testCases) {
        const error = new Error(message);
        expect(categorizeError(error)).toBe(expected);
      }
    });
  });

  describe('getErrorMessage', () => {
    it('should return appropriate message for each error code', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...Object.values(ERROR_CODES)),
          (code) => {
            const message = getErrorMessage(code);
            expect(typeof message).toBe('string');
            expect(message.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: Object.values(ERROR_CODES).length }
      );
    });
  });

  describe('wrapError', () => {
    it('should wrap errors with appropriate context', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }),
          fc.option(fc.string({ minLength: 1, maxLength: 50 })),
          (errorMessage, context) => {
            const originalError = new Error(errorMessage);
            const wrappedError = wrapError(originalError, context ?? undefined);

            expect(wrappedError).toBeInstanceOf(ProjectGenerationError);
            expect(wrappedError.cause).toBe(originalError);
            
            if (context) {
              expect(wrappedError.message).toContain(context);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('formatErrorForDisplay', () => {
    it('should format ProjectGenerationError with all details', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }),
          fc.constantFrom(...Object.values(ERROR_CODES)),
          fc.boolean(),
          fc.option(fc.string({ minLength: 1, maxLength: 100 })),
          (message, code, recoverable, hint) => {
            const error = new ProjectGenerationError(message, code, {
              recoverable,
              hint: hint ?? undefined,
            });

            const formatted = formatErrorForDisplay(error);

            expect(typeof formatted).toBe('string');
            expect(formatted.length).toBeGreaterThan(0);
            // Should contain the error code
            expect(formatted).toContain(code);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should format regular Error', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }),
          (message) => {
            const error = new Error(message);
            const formatted = formatErrorForDisplay(error);

            expect(typeof formatted).toBe('string');
            expect(formatted.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
