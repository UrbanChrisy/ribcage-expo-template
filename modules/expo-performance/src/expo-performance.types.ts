export interface MemoryMetrics {
  ramUsageInMB: number;
  timestamp: number;
}

export interface CPUMetrics {
  cpuUsage: number;
  timestamp: number;
}

export interface PerformanceAnalysis {
  overallScore: number;
  memoryScore: number;
  cpuScore: number;
  currentCPU: number;
  currentMemory?: number;
  recommendations: string[];
}

export interface DetailedMemoryInfo {
  privateDirtyMB: number;
  privateCleanMB: number;
  sharedDirtyMB: number;
  heapUsedMB: number;
  heapSizeMB: number;
  heapMaxMB: number;
  systemAvailableMB: number;
  systemTotalMB: number;
  isLowMemory: boolean;
}

export interface SystemInfo {
  availableProcessors: number;
  totalMemoryMB: number;
  availableMemoryMB: number;
  lowMemoryThresholdMB: number;
  isLowMemory: boolean;
  memoryClass: number;
  largeMemoryClass: number;
}

export type MemoryCallback = (metrics: MemoryMetrics) => void;
export type CPUCallback = (metrics: CPUMetrics) => void;

// Client interfaces
export interface MonitoringOptions {
  intervalMs?: number;
}

export interface ClientBase {
  startMonitoring(options?: MonitoringOptions): void;
  stopMonitoring(): void;
  isMonitoring(): boolean;
  onUpdate(callback: (metrics: any) => void): () => void;
}

export interface MemoryClientInterface extends ClientBase {
  getCurrentMemory(): number;
  getTotalMemory(): number;
  getDetailedInfo(): DetailedMemoryInfo | null;
  onUpdate(callback: MemoryCallback): () => void;
}

export interface CPUClientInterface extends ClientBase {
  getCurrentCPU(): number;
  getTotalCPU(): number;
  onUpdate(callback: CPUCallback): () => void;
}
