import { ExpoPerformance } from '../expo-performance.module';
import {
  CPUCallback,
  CPUMetrics,
  DetailedMemoryInfo,
  MemoryCallback,
  MemoryMetrics,
  MonitoringOptions,
  PerformanceAnalysis,
  SystemInfo,
} from '../expo-performance.types';
import { CPUClient } from './cpu.client';
import { MemoryClient } from './memory.client';


export class ExpoPerformanceClient {
  public readonly memory: MemoryClient;
  public readonly cpu: CPUClient;

  constructor() {
    this.memory = new MemoryClient();
    this.cpu = new CPUClient();
  }

  /**
   * Start monitoring both memory and CPU with specified options
   */
  startMonitoring(options: MonitoringOptions = {}): void {
    this.memory.startMonitoring(options);
    this.cpu.startMonitoring(options);
  }

  /**
   * Stop monitoring both memory and CPU
   */
  stopMonitoring(): void {
    this.memory.stopMonitoring();
    this.cpu.stopMonitoring();
  }

  /**
   * Check if either memory or CPU monitoring is active
   */
  isMonitoring(): boolean {
    return this.memory.isMonitoring() || this.cpu.isMonitoring();
  }

  /**
   * Start only memory monitoring
   */
  startMemoryMonitoring(options: MonitoringOptions = {}): void {
    this.memory.startMonitoring(options);
  }

  /**
   * Start only CPU monitoring
   */
  startCPUMonitoring(options: MonitoringOptions = {}): void {
    this.cpu.startMonitoring(options);
  }

  /**
   * Stop only memory monitoring
   */
  stopMemoryMonitoring(): void {
    this.memory.stopMonitoring();
  }

  /**
   * Stop only CPU monitoring
   */
  stopCPUMonitoring(): void {
    this.cpu.stopMonitoring();
  }

  /**
   * Get current memory metrics
   */
  getCurrentMemoryMetrics(): MemoryMetrics {
    return this.memory.getCurrentMetrics();
  }

  /**
   * Get current CPU metrics
   */
  getCurrentCPUMetrics(): CPUMetrics {
    return this.cpu.getCurrentMetrics();
  }

  /**
   * Get both current memory and CPU metrics
   */
  getCurrentMetrics(): { memory: MemoryMetrics; cpu: CPUMetrics } {
    return {
      memory: this.getCurrentMemoryMetrics(),
      cpu: this.getCurrentCPUMetrics(),
    };
  }

  /**
   * Register callback for memory updates
   */
  onMemoryUpdate(callback: MemoryCallback): () => void {
    return this.memory.onUpdate(callback);
  }

  /**
   * Register callback for CPU updates
   */
  onCPUUpdate(callback: CPUCallback): () => void {
    return this.cpu.onUpdate(callback);
  }

  /**
   * Register callbacks for both memory and CPU updates
   */
  onUpdate(callbacks: {
    memory?: MemoryCallback;
    cpu?: CPUCallback;
  }): () => void {
    const unsubscribers: (() => void)[] = [];

    if (callbacks.memory) {
      unsubscribers.push(this.memory.onUpdate(callbacks.memory));
    }

    if (callbacks.cpu) {
      unsubscribers.push(this.cpu.onUpdate(callbacks.cpu));
    }

    // Return function that unsubscribes from all
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }

  /**
   * Get detailed memory information
   */
  getDetailedMemoryInfo(): DetailedMemoryInfo | null {
    return this.memory.getDetailedInfo();
  }

  /**
   * Get system information
   */
  getSystemInfo(): SystemInfo | null {
    try {
      return ExpoPerformance.getSystemInfo();
    } catch (error) {
      console.error('Failed to get system info:', error);
      return null;
    }
  }

  /**
   * Force garbage collection
   */
  forceGarbageCollection(): void {
    try {
      ExpoPerformance.forceGarbageCollection();
    } catch (error) {
      console.warn('Garbage collection not available:', error);
    }
  }

  /**
   * Get performance analysis with recommendations
   */
  async getPerformanceAnalysis(): Promise<PerformanceAnalysis | null> {
    try {
      const analysis = ExpoPerformance.getPerformanceAnalysis();
      
      if (!analysis || typeof analysis !== 'object') {
        throw new Error('Invalid analysis data received from native module');
      }
      
      return analysis;
    } catch (error) {
      console.error('Failed to get performance analysis:', error);
      return null;
    }
  }

  /**
   * Get overall performance score (0-100)
   */
  getOverallPerformanceScore(): number {
    const memoryScore = this.memory.isMemoryCritical() ? 0 : this.memory.isMemoryHigh() ? 40 : 80;
    const cpuScore = this.cpu.getCPUScore();
    
    return Math.round((memoryScore + cpuScore) / 2);
  }

  /**
   * Check if system performance is healthy
   */
  isPerformanceHealthy(): boolean {
    return this.getOverallPerformanceScore() >= 60;
  }

  /**
   * Get performance status as string
   */
  getPerformanceStatus(): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' {
    const score = this.getOverallPerformanceScore();
    
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 60) return 'fair';
    if (score >= 40) return 'poor';
    return 'critical';
  }

  /**
   * Get performance recommendations
   */
  getPerformanceRecommendations(): string[] {
    const recommendations: string[] = [];
    
    if (this.memory.isMemoryHigh()) {
      recommendations.push('Memory usage is high - consider optimizing images and data structures');
    }
    
    if (this.cpu.isCPUHigh()) {
      recommendations.push('CPU usage is high - look for expensive operations');
    }
    
    if (this.memory.isMemoryCritical()) {
      recommendations.push('Memory usage is critical - force garbage collection or reduce memory footprint');
    }
    
    if (this.cpu.isCPUCritical()) {
      recommendations.push('CPU usage is critical - consider deferring non-essential operations');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Performance looks good!');
    }
    
    return recommendations;
  }

  /**
   * Get comprehensive performance summary
   */
  getPerformanceSummary(): {
    overallScore: number;
    status: string;
    memory: {
      current: number;
      total: number;
      percentage: number;
      isHigh: boolean;
      isCritical: boolean;
    };
    cpu: {
      current: number;
      total: number;
      category: string;
      score: number;
      isHigh: boolean;
      isCritical: boolean;
    };
    recommendations: string[];
  } {
    return {
      overallScore: this.getOverallPerformanceScore(),
      status: this.getPerformanceStatus(),
      memory: {
        current: this.memory.getCurrentMemory(),
        total: this.memory.getTotalMemory(),
        percentage: this.memory.getMemoryUsagePercentage(),
        isHigh: this.memory.isMemoryHigh(),
        isCritical: this.memory.isMemoryCritical(),
      },
      cpu: {
        current: this.cpu.getCurrentCPU(),
        total: this.cpu.getTotalCPU(),
        category: this.cpu.getCPUCategory(),
        score: this.cpu.getCPUScore(),
        isHigh: this.cpu.isCPUHigh(),
        isCritical: this.cpu.isCPUCritical(),
      },
      recommendations: this.getPerformanceRecommendations(),
    };
  }

  /**
   * Clean up all resources
   */
  destroy(): void {
    this.memory.destroy();
    this.cpu.destroy();
  }
}