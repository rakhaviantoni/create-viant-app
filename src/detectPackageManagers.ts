import { execSync } from 'child_process';

/**
 * Detect available package managers on the system.
 * Returns them in order of preference: bun > pnpm > yarn > npm
 */
export function detectPackageManagers(): string[] {
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
 * The expected order of package managers by preference.
 * This is the canonical order that detectPackageManagers should return.
 */
export const PACKAGE_MANAGER_ORDER = ['bun', 'pnpm', 'yarn', 'npm'] as const;

export type PackageManager = (typeof PACKAGE_MANAGER_ORDER)[number];

/**
 * Filter and order package managers based on availability.
 * This is a pure function that can be tested without system dependencies.
 * @param availableManagers - Set of package managers available on the system
 * @returns Array of available managers in preference order
 */
export function orderPackageManagers(availableManagers: Set<string>): string[] {
  const ordered = PACKAGE_MANAGER_ORDER.filter((pm) =>
    availableManagers.has(pm)
  );
  return ordered.length > 0 ? ordered : ['npm'];
}
