import { requireNativeModule } from 'expo';
import {
  DetailedMemoryInfo,
  PerformanceAnalysis,
  SystemInfo
} from './expo-performance.types';

// Native module interface for direct access to native functions
interface ExpoPerformanceNativeModule {
  getTotalMemory(): number;
  getCurrentMemory(): number;
  getCurrentCPU(): number;
  getTotalCPU(): number;
  getDetailedMemoryInfo(): DetailedMemoryInfo | null;
  getSystemInfo(): SystemInfo | null;
  forceGarbageCollection(): void;
  getPerformanceAnalysis(): PerformanceAnalysis;
}

// Export the native module for direct access if needed
export const ExpoPerformance = requireNativeModule<ExpoPerformanceNativeModule>('ExpoPerformance');
