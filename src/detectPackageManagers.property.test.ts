import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  orderPackageManagers,
  PACKAGE_MANAGER_ORDER,
} from './detectPackageManagers';

/**
 * **Feature: cli-modernization, Property 1: Package Manager Detection Order**
 *
 * *For any* set of available package managers on a system, the detectPackageManagers
 * function SHALL return them in the order: bun, pnpm, yarn, npm (filtered by availability).
 *
 * **Validates: Requirements 1.5**
 */
describe('Property 1: Package Manager Detection Order', () => {
  // Arbitrary for generating subsets of package managers
  const packageManagerSubsetArb = fc.subarray(
    [...PACKAGE_MANAGER_ORDER],
    { minLength: 0 }
  );

  it('should return package managers in preference order (bun > pnpm > yarn > npm)', () => {
    fc.assert(
      fc.property(packageManagerSubsetArb, (availableManagers) => {
        const availableSet = new Set(availableManagers);
        const result = orderPackageManagers(availableSet);

        // Verify the result only contains available managers (or npm as fallback)
        if (availableManagers.length === 0) {
          expect(result).toEqual(['npm']);
          return;
        }

        // Verify all returned managers were in the available set
        for (const pm of result) {
          expect(availableSet.has(pm)).toBe(true);
        }

        // Verify the order matches the preference order
        const expectedOrder = PACKAGE_MANAGER_ORDER.filter((pm) =>
          availableSet.has(pm)
        );
        expect(result).toEqual(expectedOrder);
      }),
      { numRuns: 100 }
    );
  });

  it('should always return npm as fallback when no managers are available', () => {
    fc.assert(
      fc.property(fc.constant(new Set<string>()), (emptySet) => {
        const result = orderPackageManagers(emptySet);
        expect(result).toEqual(['npm']);
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve relative order for any subset of managers', () => {
    fc.assert(
      fc.property(packageManagerSubsetArb, (availableManagers) => {
        if (availableManagers.length === 0) return; // Skip empty case

        const availableSet = new Set(availableManagers);
        const result = orderPackageManagers(availableSet);

        // For any two managers in the result, their relative order should match PACKAGE_MANAGER_ORDER
        for (let i = 0; i < result.length; i++) {
          for (let j = i + 1; j < result.length; j++) {
            const indexI = PACKAGE_MANAGER_ORDER.indexOf(
              result[i] as (typeof PACKAGE_MANAGER_ORDER)[number]
            );
            const indexJ = PACKAGE_MANAGER_ORDER.indexOf(
              result[j] as (typeof PACKAGE_MANAGER_ORDER)[number]
            );
            expect(indexI).toBeLessThan(indexJ);
          }
        }
      }),
      { numRuns: 100 }
    );
  });
});
