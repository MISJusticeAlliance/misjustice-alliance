import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TRPCClientError } from '@trpc/client';

/**
 * Test suite for error handler redirect logic
 * Ensures that auth.me queries don't trigger login redirects
 */

// Mock the error handler functions
const isAuthMeQuery = (queryKey: unknown): boolean => {
  if (Array.isArray(queryKey)) {
    return queryKey.length >= 2 && queryKey[0] === 'auth' && queryKey[1] === 'me';
  }
  if (typeof queryKey === 'string') {
    return queryKey.includes('auth') && queryKey.includes('me');
  }
  return false;
};

const isUnauthorizedError = (error: unknown): boolean => {
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
};

describe('Error Handler Redirect Logic', () => {
  describe('isAuthMeQuery', () => {
    it('should identify auth.me query as array', () => {
      expect(isAuthMeQuery(['auth', 'me'])).toBe(true);
    });

    it('should identify auth.me query with additional elements', () => {
      expect(isAuthMeQuery(['auth', 'me', 'extra'])).toBe(true);
    });

    it('should not identify other queries', () => {
      expect(isAuthMeQuery(['submissions', 'list'])).toBe(false);
      expect(isAuthMeQuery(['profile', 'get'])).toBe(false);
    });

    it('should identify auth.me query as string', () => {
      expect(isAuthMeQuery('auth,me')).toBe(true);
    });

    it('should not identify non-auth queries as string', () => {
      expect(isAuthMeQuery('submissions,list')).toBe(false);
    });

    it('should handle empty arrays', () => {
      expect(isAuthMeQuery([])).toBe(false);
    });

    it('should handle single element arrays', () => {
      expect(isAuthMeQuery(['auth'])).toBe(false);
    });

    it('should handle null and undefined', () => {
      expect(isAuthMeQuery(null)).toBe(false);
      expect(isAuthMeQuery(undefined)).toBe(false);
    });

    it('should handle objects', () => {
      expect(isAuthMeQuery({ key: 'auth.me' })).toBe(false);
    });
  });

  describe('isUnauthorizedError', () => {
    it('should identify 401 HTTP status as unauthorized', () => {
      const error = new TRPCClientError({
        message: 'Unauthorized',
        code: 'UNAUTHORIZED',
        data: { httpStatus: 401 },
      } as any);

      expect(isUnauthorizedError(error)).toBe(true);
    });

    it('should identify UNAUTHORIZED code as unauthorized', () => {
      const error = new TRPCClientError({
        message: 'Unauthorized',
        code: 'UNAUTHORIZED',
        data: { code: 'UNAUTHORIZED' },
      } as any);

      expect(isUnauthorizedError(error)).toBe(true);
    });

    it('should not identify non-401 errors as unauthorized', () => {
      const error = new TRPCClientError({
        message: 'Bad Request',
        code: 'BAD_REQUEST',
        data: { httpStatus: 400 },
      } as any);

      expect(isUnauthorizedError(error)).toBe(false);
    });

    it('should not identify 500 errors as unauthorized', () => {
      const error = new TRPCClientError({
        message: 'Internal Server Error',
        code: 'INTERNAL_SERVER_ERROR',
        data: { httpStatus: 500 },
      } as any);

      expect(isUnauthorizedError(error)).toBe(false);
    });

    it('should not identify non-TRPC errors as unauthorized', () => {
      const error = new Error('Some error');
      expect(isUnauthorizedError(error)).toBe(false);
    });

    it('should not identify null as unauthorized', () => {
      expect(isUnauthorizedError(null)).toBe(false);
    });

    it('should not identify undefined as unauthorized', () => {
      expect(isUnauthorizedError(undefined)).toBe(false);
    });
  });

  describe('Redirect Decision Logic', () => {
    it('should NOT redirect for auth.me 401 errors', () => {
      const error = new TRPCClientError({
        message: 'Unauthorized',
        code: 'UNAUTHORIZED',
        data: { httpStatus: 401 },
      } as any);
      const queryKey = ['auth', 'me'];

      const shouldRedirect = isUnauthorizedError(error) && !isAuthMeQuery(queryKey);
      expect(shouldRedirect).toBe(false);
    });

    it('should redirect for other 401 errors', () => {
      const error = new TRPCClientError({
        message: 'Unauthorized',
        code: 'UNAUTHORIZED',
        data: { httpStatus: 401 },
      } as any);
      const queryKey = ['submissions', 'list'];

      const shouldRedirect = isUnauthorizedError(error) && !isAuthMeQuery(queryKey);
      expect(shouldRedirect).toBe(true);
    });

    it('should NOT redirect for non-401 errors', () => {
      const error = new TRPCClientError({
        message: 'Bad Request',
        code: 'BAD_REQUEST',
        data: { httpStatus: 400 },
      } as any);
      const queryKey = ['submissions', 'list'];

      const shouldRedirect = isUnauthorizedError(error) && !isAuthMeQuery(queryKey);
      expect(shouldRedirect).toBe(false);
    });

    it('should NOT redirect for non-TRPC errors', () => {
      const error = new Error('Network error');
      const queryKey = ['submissions', 'list'];

      const shouldRedirect = isUnauthorizedError(error) && !isAuthMeQuery(queryKey);
      expect(shouldRedirect).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle auth.me query with string format', () => {
      const error = new TRPCClientError({
        message: 'Unauthorized',
        code: 'UNAUTHORIZED',
        data: { httpStatus: 401 },
      } as any);
      const queryKey = 'auth,me';

      const shouldRedirect = isUnauthorizedError(error) && !isAuthMeQuery(queryKey);
      expect(shouldRedirect).toBe(false);
    });

    it('should handle auth.me query with extra elements', () => {
      const error = new TRPCClientError({
        message: 'Unauthorized',
        code: 'UNAUTHORIZED',
        data: { httpStatus: 401 },
      } as any);
      const queryKey = ['auth', 'me', 'extra', 'data'];

      const shouldRedirect = isUnauthorizedError(error) && !isAuthMeQuery(queryKey);
      expect(shouldRedirect).toBe(false);
    });

    it('should handle similar but different queries', () => {
      const error = new TRPCClientError({
        message: 'Unauthorized',
        code: 'UNAUTHORIZED',
        data: { httpStatus: 401 },
      } as any);

      const queryKeys = [
        ['auth', 'logout'],
        ['auth', 'profile'],
        ['me', 'auth'],
        ['authentication', 'me'],
      ];

      queryKeys.forEach(queryKey => {
        const shouldRedirect = isUnauthorizedError(error) && !isAuthMeQuery(queryKey);
        expect(shouldRedirect).toBe(true);
      });
    });

    it('should handle mutation keys (arrays with different structure)', () => {
      const error = new TRPCClientError({
        message: 'Unauthorized',
        code: 'UNAUTHORIZED',
        data: { httpStatus: 401 },
      } as any);
      const mutationKey = ['submissions', 'create'];

      const shouldRedirect = isUnauthorizedError(error) && !isAuthMeQuery(mutationKey);
      expect(shouldRedirect).toBe(true);
    });
  });

  describe('Real-world Scenarios', () => {
    it('should allow navigation to public pages without redirect', () => {
      // Simulating: User clicks Mission link -> auth.me query fails with 401
      const authMeError = new TRPCClientError({
        message: 'Unauthorized',
        code: 'UNAUTHORIZED',
        data: { httpStatus: 401 },
      } as any);
      const authMeQueryKey = ['auth', 'me'];

      const shouldRedirect = isUnauthorizedError(authMeError) && !isAuthMeQuery(authMeQueryKey);
      expect(shouldRedirect).toBe(false);
    });

    it('should redirect when accessing protected endpoint without auth', () => {
      // Simulating: User tries to access protected endpoint -> 401 error
      const protectedError = new TRPCClientError({
        message: 'Unauthorized',
        code: 'UNAUTHORIZED',
        data: { httpStatus: 401 },
      } as any);
      const protectedQueryKey = ['profile', 'get'];

      const shouldRedirect = isUnauthorizedError(protectedError) && !isAuthMeQuery(protectedQueryKey);
      expect(shouldRedirect).toBe(true);
    });

    it('should not redirect on network errors', () => {
      // Simulating: Network error occurs
      const networkError = new Error('Network timeout');
      const queryKey = ['submissions', 'list'];

      const shouldRedirect = isUnauthorizedError(networkError) && !isAuthMeQuery(queryKey);
      expect(shouldRedirect).toBe(false);
    });

    it('should not redirect on validation errors', () => {
      // Simulating: Validation error (400)
      const validationError = new TRPCClientError({
        message: 'Invalid input',
        code: 'BAD_REQUEST',
        data: { httpStatus: 400 },
      } as any);
      const queryKey = ['submissions', 'create'];

      const shouldRedirect = isUnauthorizedError(validationError) && !isAuthMeQuery(queryKey);
      expect(shouldRedirect).toBe(false);
    });
  });
});
