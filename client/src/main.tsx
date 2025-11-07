import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";

const queryClient = new QueryClient();

/**
 * Check if a query key belongs to the auth.me query
 */
const isAuthMeQuery = (queryKey: unknown): boolean => {
  if (Array.isArray(queryKey)) {
    // Check if it's ['auth', 'me']
    return queryKey.length >= 2 && queryKey[0] === 'auth' && queryKey[1] === 'me';
  }
  if (typeof queryKey === 'string') {
    // Fallback for string format
    return queryKey.includes('auth') && queryKey.includes('me');
  }
  return false;
};

/**
 * Check if error is a 401 Unauthorized error
 * Handles both TRPC errors and HTTP status codes
 */
const isUnauthorizedError = (error: unknown): boolean => {
  if (!(error instanceof TRPCClientError)) {
    return false;
  }

  // Check by HTTP status code (most reliable)
  if (error.data?.httpStatus === 401) {
    return true;
  }

  // Fallback: check error message
  if (error.message === UNAUTHED_ERR_MSG) {
    return true;
  }

  // Check if it's an unauthorized TRPC error code
  if (error.data?.code === 'UNAUTHORIZED') {
    return true;
  }

  return false;
};

/**
 * Redirect to login if unauthorized, but skip for auth.me queries
 */
const redirectToLoginIfUnauthorized = (error: unknown, queryKey?: unknown) => {
  if (typeof window === "undefined") return;

  // Don't redirect if it's not an unauthorized error
  if (!isUnauthorizedError(error)) {
    console.debug('[Auth] Not an unauthorized error, skipping redirect', {
      error: error instanceof TRPCClientError ? error.message : String(error),
    });
    return;
  }

  // Don't redirect for auth.me queries - it's normal for public pages to check auth status
  if (isAuthMeQuery(queryKey)) {
    console.debug('[Auth] Skipping redirect for auth.me query (401 is expected for unauthenticated users)', {
      queryKey,
    });
    return;
  }

  console.warn('[Auth] REDIRECTING TO LOGIN - Unauthorized error detected', {
    queryKey,
    error: error instanceof TRPCClientError ? {
      message: error.message,
      code: error.data?.code,
      httpStatus: error.data?.httpStatus,
    } : String(error),
  });

  // Only redirect if we're not already on the login page
  if (!window.location.href.includes('manus.im') && !window.location.href.includes('login')) {
    window.location.href = getLoginUrl();
  }
};

/**
 * Subscribe to query cache errors
 */
queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    const queryKey = event.query.queryKey;

    // Log all errors for debugging
    console.debug("[API Query Error Event]", {
      queryKey,
      error: error instanceof TRPCClientError ? {
        message: error.message,
        code: error.data?.code,
        httpStatus: error.data?.httpStatus,
      } : String(error),
    });

    redirectToLoginIfUnauthorized(error, queryKey);
  }
});

/**
 * Subscribe to mutation cache errors
 */
queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    const mutationKey = event.mutation.options.mutationKey;

    // Log all errors for debugging
    console.debug("[API Mutation Error Event]", {
      mutationKey,
      error: error instanceof TRPCClientError ? {
        message: error.message,
        code: error.data?.code,
        httpStatus: error.data?.httpStatus,
      } : String(error),
    });

    redirectToLoginIfUnauthorized(error, mutationKey);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
