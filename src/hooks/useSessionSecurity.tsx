import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from './useAuth';
import api from '@/lib/api';

const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutos sem atividade

export function useSessionSecurity() {
  const { admin, signOut } = useAuth();
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const resetInactivityTimer = useCallback(() => {
    lastActivityRef.current = Date.now();

    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    if (!admin) return;

    inactivityTimerRef.current = setTimeout(() => {
      signOut();
      window.location.href = '/login?reason=inactivity';
    }, INACTIVITY_TIMEOUT);
  }, [admin, signOut]);

  useEffect(() => {
    if (!admin) return;

    // Disable right-click
    const disableRightClick = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable F12 and other dev keys
    const disableDevKeys = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        signOut();
        window.location.href = '/login';
        return false;
      }
      // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) {
        e.preventDefault();
        signOut();
        window.location.href = '/login';
        return false;
      }
      // Ctrl+U (view source)
      if (e.ctrlKey && e.key.toUpperCase() === 'U') {
        e.preventDefault();
        return false;
      }
    };

    // Validate session against database - single session enforcement
    const validateSession = async () => {
      if (!admin?.session_token) return;

      try {
        const data = await api.auth.validateSession(admin.id, admin.session_token);

        // If session token doesn't match, someone else logged in
        if (!data.valid) {
          signOut();
          window.location.href = '/login?reason=session_expired';
        }
      } catch (error) {
        console.error('Session validation error:', error);
      }
    };

    // Activity events that reset the inactivity timer
    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];

    const handleActivity = () => resetInactivityTimer();

    // Add event listeners
    document.addEventListener('contextmenu', disableRightClick);
    document.addEventListener('keydown', disableDevKeys);
    activityEvents.forEach(evt => window.addEventListener(evt, handleActivity, { passive: true }));

    // Start inactivity timer
    resetInactivityTimer();

    // Check session every 5 seconds
    checkIntervalRef.current = setInterval(validateSession, 5000);

    return () => {
      document.removeEventListener('contextmenu', disableRightClick);
      document.removeEventListener('keydown', disableDevKeys);
      activityEvents.forEach(evt => window.removeEventListener(evt, handleActivity));
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [admin, signOut, resetInactivityTimer]);
}
