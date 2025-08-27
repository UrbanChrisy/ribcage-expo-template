import { EventSubscription } from 'expo-modules-core';
import { ExpoPerformance } from '../expo-performance.module';
import {
  CPUCallback,
  CPUClientInterface,
  CPUMetrics,
  CPUUpdateEvent,
  MonitoringOptions,
} from '../expo-performance.types';

export class CPUClient implements CPUClientInterface {
  private callbacks: Set<CPUCallback> = new Set();
  private isCurrentlyMonitoring: boolean = false;
  private eventSubscription: EventSubscription | null = null;

  constructor() {
    // Empty constructor
  }

  /**
   * Start monitoring CPU usage with specified interval
   * Uses native event emitter for performance updates
   */
  startMonitoring(options: MonitoringOptions): void {
    const { intervalMs } = options;
    
    // Input validation
    if (typeof intervalMs !== 'number' || intervalMs < 10 || intervalMs > 60000) {
      throw new Error('Interval must be a number between 10 and 60000 milliseconds');
    }
    
    // Stop any existing monitoring first
    if (this.isCurrentlyMonitoring) {
      this.stopMonitoring();
    }
    
    this.isCurrentlyMonitoring = true;

    // Set up event listener for native CPU updates
    this.eventSubscription = ExpoPerformance.addListener('CPU_UPDATE', (event: CPUUpdateEvent) => {
      this.handleNativeCPUUpdate(event);
    });

    // Start native monitoring
    ExpoPerformance.startMonitoring(intervalMs);
  }

  /**
   * Stop CPU monitoring
   */
  stopMonitoring(): void {
    this.isCurrentlyMonitoring = false;
    
    // Remove event listener
    if (this.eventSubscription) {
      this.eventSubscription.remove();
      this.eventSubscription = null;
    }
    
    // Stop native monitoring
    ExpoPerformance.stopMonitoring();
  }

  /**
   * Check if monitoring is currently active
   */
  isMonitoring(): boolean {
    return this.isCurrentlyMonitoring;
  }

  /**
   * Get current CPU usage percentage
   */
  getCurrentCPU(): number {
    try {
      const usage = ExpoPerformance.getCurrentCPU();
      // Clamp CPU usage between 0 and 100
      return typeof usage === 'number' ? Math.min(Math.max(usage, 0), 100) : 0;
    } catch (error) {
      console.error('Failed to get current CPU usage:', error);
      return 0;
    }
  }

  /**
   * Get total CPU cores/processors available
   */
  getTotalCPU(): number {
    try {
      const total = ExpoPerformance.getTotalCPU();
      return typeof total === 'number' && total > 0 ? total : 1;
    } catch (error) {
      console.error('Failed to get total CPU count:', error);
      return 1;
    }
  }

  /**
   * Register a callback for CPU updates
   * Returns an unsubscribe function
   */
  onUpdate(callback: CPUCallback): () => void {
    this.callbacks.add(callback);

    // Return unsubscribe function
    return () => {
      this.callbacks.delete(callback);
    };
  }

  /**
   * Get current CPU metrics with timestamp
   */
  getCurrentMetrics(): CPUMetrics {
    return {
      cpuUsage: this.getCurrentCPU(),
      timestamp: Date.now(),
    };
  }

  /**
   * Check if CPU usage is considered high (>80%)
   */
  isCPUHigh(): boolean {
    return this.getCurrentCPU() > 80;
  }

  /**
   * Check if CPU usage is considered critical (>95%)
   */
  isCPUCritical(): boolean {
    return this.getCurrentCPU() > 95;
  }

  /**
   * Get CPU usage category as string
   */
  getCPUCategory(): 'low' | 'moderate' | 'high' | 'critical' {
    const usage = this.getCurrentCPU();
    
    if (usage < 20) return 'low';
    if (usage < 60) return 'moderate';
    if (usage < 90) return 'high';
    return 'critical';
  }

  /**
   * Get CPU performance score (0-100, where 100 is best)
   */
  getCPUScore(): number {
    const usage = this.getCurrentCPU();
    
    // Simple scoring: lower CPU usage = higher score
    if (usage < 20) return 100;
    if (usage < 40) return 80;
    if (usage < 60) return 60;
    if (usage < 80) return 40;
    return 20;
  }

  /**
   * Get CPU utilization per core (estimated)
   */
  getCPUPerCore(): number {
    const totalUsage = this.getCurrentCPU();
    const totalCores = this.getTotalCPU();
    
    return totalUsage / totalCores;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stopMonitoring();
    this.callbacks.clear();
  }

  /**
   * Handle native CPU update events
   */
  private handleNativeCPUUpdate(event: CPUUpdateEvent): void {
    if (this.callbacks.size === 0) return;

    try {
      const metrics: CPUMetrics = {
        cpuUsage: event.cpuUsage,
        timestamp: event.timestamp,
      };
      
      // Call all registered callbacks
      this.callbacks.forEach(callback => {
        try {
          callback(metrics);
        } catch (error) {
          console.error('Error in CPU callback:', error);
        }
      });
    } catch (error) {
      console.error('Failed to handle native CPU update:', error);
    }
  }
}