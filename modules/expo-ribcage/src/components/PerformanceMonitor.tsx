import React, { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import { AppState, AppStateStatus } from 'react-native';

interface PerformanceMonitorContextType {
  isMonitoring: boolean;
  startMonitoring: (intervalMs?: number) => void;
  stopMonitoring: () => void;
  pauseMonitoring: () => void;
  resumeMonitoring: () => void;
}

const PerformanceMonitorContext = createContext<PerformanceMonitorContextType | undefined>(undefined);

export interface PerformanceMonitorProps {
  children: ReactNode;
  autoStart?: boolean;
  intervalMs?: number;
  pauseOnBackground?: boolean;
  stopOnUnmount?: boolean;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  children,
  autoStart = false,
  intervalMs = 1000,
  pauseOnBackground = true,
  stopOnUnmount = true,
}) => {
  const isMonitoringRef = useRef(false);
  const wasMonitoringBeforeBackground = useRef(false);
  const currentIntervalMs = useRef(intervalMs);

  const startMonitoring = (newIntervalMs: number = intervalMs) => {
    try {
      currentIntervalMs.current = newIntervalMs;
      // For now, native monitoring is not yet fully implemented
      // The individual clients will handle their own monitoring
      isMonitoringRef.current = true;
      console.log(`Performance monitoring context started with ${newIntervalMs}ms interval`);
    } catch (error) {
      console.error('Failed to start performance monitoring:', error);
    }
  };

  const stopMonitoring = () => {
    try {
      // For now, native monitoring is not yet fully implemented
      // The individual clients will handle their own monitoring
      isMonitoringRef.current = false;
      wasMonitoringBeforeBackground.current = false;
      console.log('Performance monitoring context stopped');
    } catch (error) {
      console.error('Failed to stop performance monitoring:', error);
    }
  };

  const pauseMonitoring = () => {
    if (isMonitoringRef.current) {
      try {
        // For now, native monitoring is not yet fully implemented
        console.log('Performance monitoring context paused');
      } catch (error) {
        console.error('Failed to pause performance monitoring:', error);
      }
    }
  };

  const resumeMonitoring = () => {
    if (isMonitoringRef.current) {
      try {
        // For now, native monitoring is not yet fully implemented
        console.log('Performance monitoring context resumed');
      } catch (error) {
        console.error('Failed to resume performance monitoring:', error);
      }
    }
  };

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (!pauseOnBackground) return;

    if (nextAppState === 'background' || nextAppState === 'inactive') {
      // App is going to background
      if (isMonitoringRef.current) {
        wasMonitoringBeforeBackground.current = true;
        pauseMonitoring();
        console.log('App backgrounded - pausing performance monitoring');
      }
    } else if (nextAppState === 'active') {
      // App is coming to foreground
      if (wasMonitoringBeforeBackground.current && isMonitoringRef.current) {
        resumeMonitoring();
        wasMonitoringBeforeBackground.current = false;
        console.log('App foregrounded - resuming performance monitoring');
      }
    }
  };

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, [pauseOnBackground]);

  // Handle component mount/unmount and development mode refreshes
  useEffect(() => {
    // Auto-start monitoring if requested
    if (autoStart) {
      startMonitoring(intervalMs);
    }

    // Cleanup function for unmount or hot reload
    return () => {
      if (stopOnUnmount && isMonitoringRef.current) {
        stopMonitoring();
        console.log('PerformanceMonitor unmounted - stopping monitoring');
      }
    };
  }, [autoStart, intervalMs, stopOnUnmount]);

  // Handle development mode hot reloads by checking if monitoring should be restored
  useEffect(() => {
    // This effect runs on every render, but only acts on mount
    // In development mode, this helps detect if we need to restart monitoring
    const checkAndRestoreMonitoring = async () => {
      try {
        // For now, native monitoring is not yet fully implemented
        // This is where we would check native state in the future
        console.log('Monitoring context initialized');
      } catch (error) {
        // Native method might not be available yet, ignore
      }
    };

    checkAndRestoreMonitoring();
  }, []);

  const contextValue: PerformanceMonitorContextType = {
    isMonitoring: isMonitoringRef.current,
    startMonitoring,
    stopMonitoring,
    pauseMonitoring,
    resumeMonitoring,
  };

  return (
    <PerformanceMonitorContext.Provider value={contextValue}>
      {children}
    </PerformanceMonitorContext.Provider>
  );
};

export const usePerformanceMonitor = (): PerformanceMonitorContextType => {
  const context = useContext(PerformanceMonitorContext);
  if (!context) {
    throw new Error('usePerformanceMonitor must be used within a PerformanceMonitor');
  }
  return context;
};

// HOC for easier integration
export interface WithPerformanceMonitorProps extends PerformanceMonitorProps {
  component: React.ComponentType<any>;
}

export const withPerformanceMonitor = <P extends object>(
  Component: React.ComponentType<P>,
  monitorProps: Omit<PerformanceMonitorProps, 'children'> = {}
): React.FC<P> => {
  return (props: P) => (
    <PerformanceMonitor {...monitorProps}>
      <Component {...props} />
    </PerformanceMonitor>
  );
};

export default PerformanceMonitor;