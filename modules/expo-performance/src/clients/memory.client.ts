import { ExpoPerformance } from '../expo-performance.module';
import {
  DetailedMemoryInfo,
  MemoryCallback,
  MemoryClientInterface,
  MemoryMetrics,
  MonitoringOptions,
} from '../expo-performance.types';
  
export class MemoryClient implements MemoryClientInterface {
  private intervalTimer: NodeJS.Timeout | null = null;
  private callbacks: Set<MemoryCallback> = new Set();
  private currentIntervalMs: number = 1000;

  constructor() {
    // Empty constructor
  }

  /**
   * Start monitoring memory usage with specified interval
   */
  startMonitoring(options: MonitoringOptions = {}): void {
    const { intervalMs = 1000 } = options;
    
    // Input validation
    if (typeof intervalMs !== 'number' || intervalMs < 10 || intervalMs > 60000) {
      throw new Error('Interval must be a number between 10 and 60000 milliseconds');
    }

    if (this.intervalTimer) {
      console.warn('Memory monitoring is already active. Stopping current monitoring first.');
      this.stopMonitoring();
    }

    this.currentIntervalMs = intervalMs;

    this.intervalTimer = setInterval(() => {
      this.emitMemoryUpdate();
    }, intervalMs);
  }

  /**
   * Stop memory monitoring
   */
  stopMonitoring(): void {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
  }

  /**
   * Check if monitoring is currently active
   */
  isMonitoring(): boolean {
    return this.intervalTimer !== null;
  }

  /**
   * Get current memory usage in MB
   */
  getCurrentMemory(): number {
    try {
      const usage = ExpoPerformance.getCurrentMemory();
      return typeof usage === 'number' && usage >= 0 ? usage : 0;
    } catch (error) {
      console.error('Failed to get current memory usage:', error);
      return 0;
    }
  }

  /**
   * Get total device memory in MB
   */
  getTotalMemory(): number {
    try {
      const total = ExpoPerformance.getTotalMemory();
      return typeof total === 'number' && total >= 0 ? total : 0;
    } catch (error) {
      console.error('Failed to get total memory:', error);
      return 0;
    }
  }

  /**
   * Get detailed memory information
   */
  getDetailedInfo(): DetailedMemoryInfo | null {
    try {
      return ExpoPerformance.getDetailedMemoryInfo();
    } catch (error) {
      console.error('Failed to get detailed memory info:', error);
      return null;
    }
  }

  /**
   * Register a callback for memory updates
   * Returns an unsubscribe function
   */
  onUpdate(callback: MemoryCallback): () => void {
    this.callbacks.add(callback);

    // Return unsubscribe function
    return () => {
      this.callbacks.delete(callback);
    };
  }

  /**
   * Force garbage collection (if available on platform)
   */
  forceGarbageCollection(): void {
    try {
      ExpoPerformance.forceGarbageCollection();
    } catch (error) {
      console.warn('Garbage collection not available:', error);
    }
  }

  /**
   * Get current memory metrics with timestamp
   */
  getCurrentMetrics(): MemoryMetrics {
    return {
      ramUsageInMB: this.getCurrentMemory(),
      timestamp: Date.now(),
    };
  }

  /**
   * Get memory usage percentage (current/total * 100)
   */
  getMemoryUsagePercentage(): number {
    const current = this.getCurrentMemory();
    const total = this.getTotalMemory();
    
    if (total === 0) return 0;
    return Math.min((current / total) * 100, 100);
  }

  /**
   * Check if memory usage is considered high (>80%)
   */
  isMemoryHigh(): boolean {
    return this.getMemoryUsagePercentage() > 80;
  }

  /**
   * Check if memory usage is considered critical (>95%)
   */
  isMemoryCritical(): boolean {
    return this.getMemoryUsagePercentage() > 95;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stopMonitoring();
    this.callbacks.clear();
  }

  /**
   * Emit memory update to all registered callbacks
   */
  private emitMemoryUpdate(): void {
    if (this.callbacks.size === 0) return;

    try {
      const metrics = this.getCurrentMetrics();
      
      // Call all registered callbacks
      this.callbacks.forEach(callback => {
        try {
          callback(metrics);
        } catch (error) {
          console.error('Error in memory callback:', error);
        }
      });
    } catch (error) {
      console.error('Failed to emit memory update:', error);
    }
  }
}