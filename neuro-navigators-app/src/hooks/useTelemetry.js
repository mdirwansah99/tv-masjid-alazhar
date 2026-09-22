import { useCallback } from 'react';

export function useTelemetry() {
  const logEvent = useCallback((eventType, data) => {
    const payload = {
      sessionId: 'session-' + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      eventType,
      data
    };
    // In a real app, this would POST to a backend database
    console.log(`%c[TELEMETRY] ${eventType}`, 'color: #66fcf1; font-weight: bold;', payload);
  }, []);

  return { logEvent };
}
