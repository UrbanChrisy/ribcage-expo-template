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

// Native module event types
export interface MemoryUpdateEvent {
  ramUsageInMB: number;
  timestamp: number;
}

export interface CPUUpdateEvent {
  cpuUsage: number;
  timestamp: number;
}

// Event subscription types
export type MemoryUpdateSubscription = {
  remove: () => void;
};

export type CPUUpdateSubscription = {
  remove: () => void;
};

// Native monitoring state
export interface MonitoringState {
  isMonitoring: boolean;
  intervalMs: number;
  isPaused: boolean;
}

export type MemoryCallback = (metrics: MemoryMetrics) => void;
export type CPUCallback = (metrics: CPUMetrics) => void;
export type JSFPSCallback = (fps: number) => void;
export type UIFPSCallback = (fps: number) => void;

// Client interfaces
export interface MonitoringOptions {
  intervalMs: number;
}

export interface ClientBase {
  startMonitoring(options: MonitoringOptions): void;
  stopMonitoring(): void;
  isMonitoring(): boolean;
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

export interface FPSClientInterface extends ClientBase {
  getCurrentJSFPS(): number;
  getCurrentUIFPS(): number;
  onJSFPSUpdate(callback: JSFPSCallback): () => void;
  onUIFPSUpdate(callback: UIFPSCallback): () => void;
}

// Native module monitoring interface
export interface NativeMonitoringInterface {
  startMonitoring(intervalMs: number): void;
  stopMonitoring(): void;
  pauseMonitoring(): void;
  resumeMonitoring(): void;
  getMonitoringState(): MonitoringState;
}
