import { useCallback } from 'react';

const isVibrationSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;

/**
 * Hook for haptic feedback using the Vibration API.
 * Falls back gracefully on unsupported devices.
 */
export function useHaptics() {
  /**
   * Trigger a short haptic pulse (success feedback).
   * Pattern: [50ms vibration, 30ms pause, 50ms vibration] creates a "double tap" feel.
   */
  const triggerSuccess = useCallback(() => {
    if (isVibrationSupported) {
      navigator.vibrate([50, 30, 50]);
    }
  }, []);

  /**
   * Trigger a gentle haptic pulse (milestone feedback).
   */
  const triggerMilestone = useCallback(() => {
    if (isVibrationSupported) {
      navigator.vibrate([80, 40, 80]);
    }
  }, []);

  /**
   * Trigger a brief haptic tap (light feedback).
   */
  const triggerTap = useCallback(() => {
    if (isVibrationSupported) {
      navigator.vibrate(30);
    }
  }, []);

  /**
   * Cancel any ongoing vibration.
   */
  const cancel = useCallback(() => {
    if (isVibrationSupported) {
      navigator.vibrate(0);
    }
  }, []);

  return {
    triggerSuccess,
    triggerMilestone,
    triggerTap,
    cancel,
    isSupported: isVibrationSupported,
  };
}
