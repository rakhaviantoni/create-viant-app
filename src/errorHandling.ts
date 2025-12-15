/**
 * Error handling utilities for the CLI
 * Provides structured error types and cleanup functionality
 */

import { existsSync, rmSync } from 'fs';
import chalk from 'chalk';

/**
 * Error codes for different failure scenarios
 */
export const ERROR_CODES = {
  INVALID_NAME: 'INVALID_NAME',
  DIR_EXISTS: 'DIR_EXISTS',
  TEMPLATE_NOT_FOUND: 'TEMPLATE_NOT_FOUND',
  COPY_FAILED: 'COPY_FAILED',
  INSTALL_FAILED: 'INSTALL_FAILED',
  GIT_FAILED: 'GIT_FAILED',
  PACKAGE_JSON_INVALID: 'PACKAGE_JSON_INVALID',
  CONFIG_FAILED: 'CONFIG_FAILED',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  DISK_FULL: 'DISK_FULL',
  UNKNOWN: 'UNKNOWN',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

/**
 * Custom error class for project generation errors
 * Provides structured error information with codes and recovery hints
 */
export class ProjectGenerationError extends Error {
  public readonly code: ErrorCode;
  public readonly recoverable: boolean;
  public readonly hint?: string;

  constructor(
    message: string,
    code: ErrorCode,
    options?: {
      recoverable?: boolean;
      hint?: string;
      cause?: Error;
    }
  ) {
    super(message);
    this.name = 'ProjectGenerationError';
    this.code = code;
    this.recoverable = options?.recoverable ?? false;
    this.hint = options?.hint;
    
    if (options?.cause) {
      this.cause = options.cause;
    }
  }
}

/**
 * Error messages for common failure scenarios
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ERROR_CODES.INVALID_NAME]: 'The project name is invalid. Please use a valid npm package name.',
  [ERROR_CODES.DIR_EXISTS]: 'A directory with this name already exists. Please choose a different name or remove the existing directory.',
  [ERROR_CODES.TEMPLATE_NOT_FOUND]: 'The specified template could not be found. Please check the template name.',
  [ERROR_CODES.COPY_FAILED]: 'Failed to copy template files. Please check file permissions and disk space.',
  [ERROR_CODES.INSTALL_FAILED]: 'Failed to install dependencies. Please try running the install command manually.',
  [ERROR_CODES.GIT_FAILED]: 'Failed to initialize git repository. Please ensure git is installed and configured.',
  [ERROR_CODES.PACKAGE_JSON_INVALID]: 'Failed to generate a valid package.json file.',
  [ERROR_CODES.CONFIG_FAILED]: 'Failed to generate configuration files.',
  [ERROR_CODES.PERMISSION_DENIED]: 'Permission denied. Please check your file system permissions.',
  [ERROR_CODES.DISK_FULL]: 'Disk is full. Please free up some space and try again.',
  [ERROR_CODES.UNKNOWN]: 'An unexpected error occurred.',
};

/**
 * Get a user-friendly error message for a given error code
 */
export function getErrorMessage(code: ErrorCode): string {
  return ERROR_MESSAGES[code] || ERROR_MESSAGES[ERROR_CODES.UNKNOWN];
}

/**
 * Cleanup result interface
 */
export interface CleanupResult {
  success: boolean;
  path: string;
  existed: boolean;
  error?: string;
}

/**
 * Cleanup a partially created project directory
 * Removes the directory and all its contents if it exists
 * 
 * @param projectPath - The path to the project directory to clean up
 * @returns CleanupResult indicating success or failure
 */
export function cleanupProject(projectPath: string): CleanupResult {
  const existed = existsSync(projectPath);
  
  if (!existed) {
    return {
      success: true,
      path: projectPath,
      existed: false,
    };
  }

  try {
    rmSync(projectPath, { recursive: true, force: true });
    
    // Verify the directory was actually removed
    const stillExists = existsSync(projectPath);
    
    return {
      success: !stillExists,
      path: projectPath,
      existed: true,
      error: stillExists ? 'Directory still exists after cleanup attempt' : undefined,
    };
  } catch (error: any) {
    return {
      success: false,
      path: projectPath,
      existed: true,
      error: error.message,
    };
  }
}

/**
 * Format an error for display to the user
 * Provides a clear, user-friendly error message with optional hints
 */
export function formatErrorForDisplay(error: Error | ProjectGenerationError): string {
  const lines: string[] = [];
  
  if (error instanceof ProjectGenerationError) {
    lines.push(chalk.red(`❌ Error [${error.code}]: ${error.message}`));
    
    if (error.hint) {
      lines.push(chalk.yellow(`💡 Hint: ${error.hint}`));
    }
    
    if (error.recoverable) {
      lines.push(chalk.gray('This error may be recoverable. Please try again.'));
    }
  } else {
    lines.push(chalk.red(`❌ Error: ${error.message}`));
  }
  
  return lines.join('\n');
}

/**
 * Determine the error code from a generic error
 * Analyzes the error message to categorize it
 */
export function categorizeError(error: Error): ErrorCode {
  const message = error.message.toLowerCase();
  
  if (message.includes('eexist') || message.includes('already exists')) {
    return ERROR_CODES.DIR_EXISTS;
  }
  
  if (message.includes('enoent') || message.includes('not found') || message.includes('no such file')) {
    return ERROR_CODES.TEMPLATE_NOT_FOUND;
  }
  
  if (message.includes('eacces') || message.includes('permission denied')) {
    return ERROR_CODES.PERMISSION_DENIED;
  }
  
  if (message.includes('enospc') || message.includes('no space left') || message.includes('disk full')) {
    return ERROR_CODES.DISK_FULL;
  }
  
  if (message.includes('copy') || message.includes('failed to copy')) {
    return ERROR_CODES.COPY_FAILED;
  }
  
  if (message.includes('install') || message.includes('npm') || message.includes('yarn') || message.includes('pnpm')) {
    return ERROR_CODES.INSTALL_FAILED;
  }
  
  if (message.includes('git')) {
    return ERROR_CODES.GIT_FAILED;
  }
  
  if (message.includes('package.json') || message.includes('json')) {
    return ERROR_CODES.PACKAGE_JSON_INVALID;
  }
  
  if (message.includes('config') || message.includes('configuration')) {
    return ERROR_CODES.CONFIG_FAILED;
  }
  
  return ERROR_CODES.UNKNOWN;
}

/**
 * Wrap an error with a ProjectGenerationError
 * Provides additional context and categorization
 */
export function wrapError(error: Error, context?: string): ProjectGenerationError {
  const code = categorizeError(error);
  const baseMessage = getErrorMessage(code);
  const message = context ? `${context}: ${error.message}` : error.message;
  
  return new ProjectGenerationError(message, code, {
    recoverable: code === ERROR_CODES.INSTALL_FAILED || code === ERROR_CODES.GIT_FAILED,
    hint: baseMessage,
    cause: error,
  });
}
