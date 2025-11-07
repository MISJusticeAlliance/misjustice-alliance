import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

const SESSION_TIMEOUT_KEY = 'sessionTimeout';
const DEFAULT_TIMEOUT_MINUTES = 60; // 1 hour default
const WARNING_TIME_MINUTES = 5; // Warn 5 minutes before timeout

export function useSessionTimeout() {
  const { isAuthenticated, logout } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Get timeout from localStorage or use default
  const getTimeoutMinutes = useCallback(() => {
    const stored = localStorage.getItem(SESSION_TIMEOUT_KEY);
    return stored ? parseInt(stored, 10) : DEFAULT_TIMEOUT_MINUTES;
  }, []);

  // Set timeout minutes
  const setTimeoutMinutes = useCallback((minutes: number) => {
    localStorage.setItem(SESSION_TIMEOUT_KEY, minutes.toString());
    resetTimeout();
  }, []);

  // Reset the timeout timer
  const resetTimeout = useCallback(() => {
    if (!isAuthenticated) return;

    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);

    const timeoutMinutes = getTimeoutMinutes();
    const timeoutMs = timeoutMinutes * 60 * 1000;
    const warningMs = (timeoutMinutes - WARNING_TIME_MINUTES) * 60 * 1000;

    // Set warning timeout
    warningRef.current = setTimeout(() => {
      toast.warning(
        `Your session will expire in ${WARNING_TIME_MINUTES} minutes due to inactivity. Move your mouse to stay logged in.`,
        {
          duration: WARNING_TIME_MINUTES * 60 * 1000,
        }
      );
    }, warningMs);

    // Set logout timeout
    timeoutRef.current = setTimeout(async () => {
      await logout();
      toast.error('Your session has expired due to inactivity. Please log in again.');
    }, timeoutMs);

    lastActivityRef.current = Date.now();
  }, [isAuthenticated, getTimeoutMinutes, logout]);

  // Track user activity
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleActivity = () => {
      resetTimeout();
    };

    // Listen for user activity
    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    // Initial timeout setup
    resetTimeout();

    return () => {
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('touchstart', handleActivity);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
    };
  }, [isAuthenticated, resetTimeout]);

  return {
    getTimeoutMinutes,
    setTimeoutMinutes,
    resetTimeout,
  };
}
