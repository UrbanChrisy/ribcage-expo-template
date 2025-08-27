import type { EventSubscription } from "expo-modules-core";
import { CPUMetrics, ExpoPerformanceClient, MemoryMetrics } from "../../../../../expo-ribcage";
import type { WebSocketClient } from "../websocket.client";


export class PerformanceClient {

  public monitor: ExpoPerformanceClient;
  private onConnectSubscription: EventSubscription;
  private onDisconnectSubscription: EventSubscription;
  private isMonitoring: boolean = false;
  private memoryUnsubscribe: (() => void) | null = null;
  private cpuUnsubscribe: (() => void) | null = null;
  private jsFpsUnsubscribe: (() => void) | null = null;
  private uiFpsUnsubscribe: (() => void) | null = null;

  constructor(private readonly websocket: WebSocketClient) {
    this.monitor = new ExpoPerformanceClient();

    this.onConnectSubscription = this.websocket.onConnected(this.onConnected.bind(this));
    this.onDisconnectSubscription = this.websocket.onDisconnected(this.onDisconnected.bind(this));

    // Set up performance metric listeners
    this.setupPerformanceListeners();
  }

  /**
   * Set up performance metric event listeners
   */
  private setupPerformanceListeners(): void {
    // Listen for memory updates
    this.memoryUnsubscribe = this.monitor.memory.onUpdate((metrics: MemoryMetrics) => {
      // console.log('[PerformanceClient] Memory update:', metrics);
      this.websocket.client.sendMemoryUpdate(metrics.ramUsageInMB, this.websocket.getClientId(), Date.now());
    });

    // Listen for CPU updates
    this.cpuUnsubscribe = this.monitor.cpu.onUpdate((metrics: CPUMetrics) => {
      // console.log('[PerformanceClient] CPU update:', metrics);
      this.websocket.client.sendCpuUpdate(metrics.cpuUsage, this.websocket.getClientId(), Date.now());
    });

    // Listen for FPS updates
    this.jsFpsUnsubscribe = this.monitor.fps.onJSFPSUpdate((fps: number) => {
      // console.log('[PerformanceClient] JS FPS update:', fps);
      this.websocket.client.sendFpsJsUpdate(fps, this.websocket.getClientId(), Date.now());
    });

    this.uiFpsUnsubscribe = this.monitor.fps.onUIFPSUpdate((fps: number) => {
      // console.log('[PerformanceClient] UI FPS update:', fps);
      this.websocket.client.sendFpsUiUpdate(fps, this.websocket.getClientId(), Date.now());
    });
  }

  private onConnected(): void {
    console.log('[PerformanceClient] onConnected');
    this.startMonitoring(500);
  } 

  private onDisconnected(): void {
    console.log('[PerformanceClient] onDisconnected');
    this.stopMonitoring();
  }

  startMonitoring(intervalMs: number = 1000): void {
    console.log('[PerformanceClient] startMonitoring', intervalMs);
    if (this.isMonitoring) {
      console.warn('[PerformanceClient] Already monitoring, stopping current session');
      this.stopMonitoring();
    }

    try {
      console.log('[PerformanceClient] Starting performance monitoring');
      this.monitor.startMonitoring({ intervalMs });
      this.isMonitoring = true;
      console.log('[PerformanceClient] Performance monitoring started successfully');
    } catch (error) {
      console.error('[PerformanceClient] Error starting performance monitoring:', error);
    }
  }

  stopMonitoring(): void {
    if (!this.isMonitoring) {
      return;
    }

    try {
      console.log('[PerformanceClient] Stopping performance monitoring');
      this.monitor.stopMonitoring();
      this.isMonitoring = false;
      console.log('[PerformanceClient] Performance monitoring stopped');
    } catch (error) {
      console.error('[PerformanceClient] Error stopping performance monitoring:', error);
    }
  }

  /**
   * Get current metrics synchronously
   */
  getCurrentMetrics() {
    return this.monitor.getCurrentMetrics();
  }

  /**
   * Get detailed system information
   */
  getSystemInfo() {
    return this.monitor.getSystemInfo();
  }

  /**
   * Get detailed memory information
   */
  getDetailedMemoryInfo() {
    return this.monitor.memory.getDetailedInfo();
  }

  /**
   * Force garbage collection
   */
  forceGarbageCollection(): void {
    this.monitor.forceGarbageCollection();
  }

  /**
   * Get performance analysis
   */
  async getPerformanceAnalysis() {
    return this.monitor.getPerformanceAnalysis();
  }

  shutdown(): void {
    this.stopMonitoring();
    this.onConnectSubscription.remove();
    this.onDisconnectSubscription.remove();
    
    // Unsubscribe from performance listeners
    if (this.memoryUnsubscribe) {
      this.memoryUnsubscribe();
      this.memoryUnsubscribe = null;
    }
    if (this.cpuUnsubscribe) {
      this.cpuUnsubscribe();
      this.cpuUnsubscribe = null;
    }
    if (this.jsFpsUnsubscribe) {
      this.jsFpsUnsubscribe();
      this.jsFpsUnsubscribe = null;
    }
    if (this.uiFpsUnsubscribe) {
      this.uiFpsUnsubscribe();
      this.uiFpsUnsubscribe = null;
    }
    
    // Clean up monitor resources
    this.monitor.destroy();
  }

}