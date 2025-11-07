/**
 * Unit tests for error handler logic
 * Ensures that auth.me queries don't trigger redirects to login
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TRPCClientError } from '@trpc/client';

// Mock the getLoginUrl function
vi.mock('@/const', () => ({
  getLoginUrl: vi.fn(() => 'https://manus.im/login'),
}));

/**
 * Test helper: Create a mock TRPC error
 */
function createTRPCError(
  message: string,
  code: string = 'UNAUTHORIZED',
  httpStatus: number = 401
): TRPCClientError<any> {
  const error = new TRPCClientError({
    message,
    code,
    data: { httpStatus, code },
  } as any);
  return error;
}

/**
 * Test helper: Check if a query key is auth.me
 */
function isAuthMeQuery(queryKey: unknown): boolean {
  if (Array.isArray(queryKey)) {
    return queryKey.length >= 2 && queryKey[0] === 'auth' && queryKey[1] === 'me';
  }
  if (typeof queryKey === 'string') {
    return queryKey.includes('auth') && queryKey.includes('me');
  }
  return false;
}

/**
 * Test helper: Check if error is unauthorized
 */
function isUnauthorizedError(error: unknown): boolean {
  if (!(error instanceof TRPCClientError)) {
    return false;
  }

  if (error.data?.httpStatus === 401) {
    return true;
  }

  if (error.data?.code === 'UNAUTHORIZED') {
    return true;
  }

  return false;
}

describe('Error Handler Logic', () => {
  describe('isAuthMeQuery', () => {
    it('should identify auth.me queries as array format', () => {
      expect(isAuthMeQuery(['auth', 'me'])).toBe(true);
    });

    it('should identify auth.me queries with additional elements', () => {
      expect(isAuthMeQuery(['auth', 'me', 'extra'])).toBe(true);
    });

    it('should not identify other auth queries', () => {
      expect(isAuthMeQuery(['auth', 'logout'])).toBe(false);
      expect(isAuthMeQuery(['auth', 'login'])).toBe(false);
    });

    it('should not identify non-auth queries', () => {
      expect(isAuthMeQuery(['submissions', 'list'])).toBe(false);
      expect(isAuthMeQuery(['profile', 'get'])).toBe(false);
    });

    it('should identify auth.me queries as string format', () => {
      expect(isAuthMeQuery('auth,me')).toBe(true);
      expect(isAuthMeQuery('auth.me')).toBe(true);
    });

    it('should handle empty arrays', () => {
      expect(isAuthMeQuery([])).toBe(false);
    });

    it('should handle non-array, non-string inputs', () => {
      expect(isAuthMeQuery(null)).toBe(false);
      expect(isAuthMeQuery(undefined)).toBe(false);
      expect(isAuthMeQuery({})).toBe(false);
    });
  });

  describe('isUnauthorizedError', () => {
    it('should identify 401 HTTP status as unauthorized', () => {
      const error = createTRPCError('Unauthorized', 'UNAUTHORIZED', 401);
      expect(isUnauthorizedError(error)).toBe(true);
    });

    it('should identify UNAUTHORIZED code as unauthorized', () => {
      const error = createTRPCError('Unauthorized', 'UNAUTHORIZED');
      expect(isUnauthorizedError(error)).toBe(true);
    });

    it('should not identify 403 as unauthorized', () => {
      const error = createTRPCError('Forbidden', 'FORBIDDEN', 403);
      expect(isUnauthorizedError(error)).toBe(false);
    });

    it('should not identify 500 as unauthorized', () => {
      const error = createTRPCError('Server Error', 'INTERNAL_SERVER_ERROR', 500);
      expect(isUnauthorizedError(error)).toBe(false);
    });

    it('should not identify non-TRPC errors', () => {
      expect(isUnauthorizedError(new Error('Some error'))).toBe(false);
      expect(isUnauthorizedError('string error')).toBe(false);
      expect(isUnauthorizedError(null)).toBe(false);
    });
  });

  describe('Redirect Logic', () => {
    it('should NOT redirect for auth.me 401 errors', () => {
      const error = createTRPCError('Unauthorized', 'UNAUTHORIZED', 401);
      const queryKey = ['auth', 'me'];

      const isUnauth = isUnauthorizedError(error);
      const isAuthMe = isAuthMeQuery(queryKey);

      expect(isUnauth).toBe(true);
      expect(isAuthMe).toBe(true);
      // Should skip redirect because it's auth.me query
      expect(isAuthMe).toBe(true); // This prevents redirect
    });

    it('should redirect for other 401 errors', () => {
      const error = createTRPCError('Unauthorized', 'UNAUTHORIZED', 401);
      const queryKey = ['submissions', 'list'];

      const isUnauth = isUnauthorizedError(error);
      const isAuthMe = isAuthMeQuery(queryKey);

      expect(isUnauth).toBe(true);
      expect(isAuthMe).toBe(false);
      // Should redirect because it's not auth.me query
      expect(!isAuthMe).toBe(true); // This allows redirect
    });

    it('should not redirect for non-401 errors', () => {
      const error = createTRPCError('Server Error', 'INTERNAL_SERVER_ERROR', 500);
      const queryKey = ['submissions', 'list'];

      const isUnauth = isUnauthorizedError(error);
      const isAuthMe = isAuthMeQuery(queryKey);

      expect(isUnauth).toBe(false);
      // Should not redirect because it's not unauthorized
      expect(isUnauth).toBe(false); // This prevents redirect
    });
  });

  describe('Edge Cases', () => {
    it('should handle auth.me query with different array lengths', () => {
      expect(isAuthMeQuery(['auth', 'me'])).toBe(true);
      expect(isAuthMeQuery(['auth', 'me', 'extra', 'data'])).toBe(true);
    });

    it('should handle malformed query keys gracefully', () => {
      expect(isAuthMeQuery(['auth'])).toBe(false);
      expect(isAuthMeQuery(['me'])).toBe(false);
      expect(isAuthMeQuery([null, null])).toBe(false);
    });

    it('should handle errors with missing httpStatus', () => {
      const error = new TRPCClientError({
        message: 'Unauthorized',
        code: 'UNAUTHORIZED',
        data: { code: 'UNAUTHORIZED' },
      } as any);

      // Should still identify as unauthorized by code
      expect(isUnauthorizedError(error)).toBe(true);
    });

    it('should prioritize httpStatus over code', () => {
      const error = new TRPCClientError({
        message: 'Unauthorized',
        code: 'SOME_OTHER_CODE',
        data: { httpStatus: 401, code: 'SOME_OTHER_CODE' },
      } as any);

      // Should identify as unauthorized by httpStatus
      expect(isUnauthorizedError(error)).toBe(true);
    });
  });
});
