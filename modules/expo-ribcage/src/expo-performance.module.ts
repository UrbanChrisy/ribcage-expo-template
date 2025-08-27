import { NativeModule, requireNativeModule } from 'expo';
import {
  CPUUpdateEvent,
  DetailedMemoryInfo,
  MemoryUpdateEvent,
  PerformanceAnalysis,
  SystemInfo
} from './expo-performance.types';

type ExpoPerformanceNativeModuleEvents = {
  MEMORY_UPDATE: (event: MemoryUpdateEvent) => void;
  CPU_UPDATE: (event: CPUUpdateEvent) => void;
}

declare class ExpoPerformanceNativeModule extends NativeModule<ExpoPerformanceNativeModuleEvents> {
  getTotalMemory(): number;
  getCurrentMemory(): number;
  getCurrentCPU(): number;
  getTotalCPU(): number;
  getDetailedMemoryInfo(): DetailedMemoryInfo | null;
  getSystemInfo(): SystemInfo | null;
  forceGarbageCollection(): void;
  getPerformanceAnalysis(): PerformanceAnalysis;
}

export const ExpoPerformance = requireNativeModule<ExpoPerformanceNativeModule>('ExpoPerformance');
