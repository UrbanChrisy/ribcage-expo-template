import ExpoModulesCore
import Foundation
import QuartzCore
import UIKit

// Memory metrics structure
public struct MemoryMetrics: Record {
  @Field public var ramUsageInMB: Double = 0.0
  @Field public var timestamp: Double = 0.0

  public init() {
    // Empty initializer for Record protocol compliance
  }
}

// CPU metrics structure
public struct CPUMetrics: Record {
  @Field public var cpuUsage: Double = 0.0
  @Field public var timestamp: Double = 0.0

  public init() {
    // Empty initializer for Record protocol compliance
  }
}

public class ExpoPerformanceModule: Module {
  // Module definition
  public func definition() -> ModuleDefinition {
    Name("ExpoPerformance")

    // Events for native monitoring
    Events("MEMORY_UPDATE", "CPU_UPDATE")

    // Native monitoring functions
    Function("startMonitoring") { (intervalMs: Int) in
      self.startMonitoring(intervalMs: intervalMs)
    }

    Function("stopMonitoring") {
      self.stopMonitoring()
    }

    Function("pauseMonitoring") {
      self.pauseMonitoring()
    }

    Function("resumeMonitoring") {
      self.resumeMonitoring()
    }

    Function("getMonitoringState") { () -> [String: Any] in
      return self.getMonitoringState()
    }

    // Simple data functions - no events
    Function("getTotalMemory") { () -> Double in
      return self.getTotalMemory()
    }

    Function("getCurrentMemory") { () -> Double in
      return self.getCurrentMemory()
    }

    Function("getCurrentCPU") { () -> Double in
      return self.getCurrentCPU()
    }

    Function("getTotalCPU") { () -> Int in
      return self.getTotalCPU()
    }

    // Advanced functions
    Function("getDetailedMemoryInfo") { () -> [String: Any] in
      return self.getDetailedMemoryInfo()
    }

    Function("getSystemInfo") { () -> [String: Any] in
      return self.getSystemInfo()
    }

    Function("forceGarbageCollection") {
      self.forceGarbageCollection()
    }

    Function("getPerformanceAnalysis") { () -> [String: Any] in
      return self.analyzePerformance()
    }

    // Module lifecycle
    OnCreate {
      self.setupModule()
    }

    OnDestroy {
      self.cleanup()
    }
  }

  // MARK: - Private Properties

  // CPU tracking
  private var lastCPUTime: Double = 0
  private var lastSystemTime: Double = 0

  // Cache for expensive system calls
  private var cachedMemoryInfo: (value: Double, timestamp: CFAbsoluteTime) = (0, 0)
  private var cachedCPUInfo: (value: Double, timestamp: CFAbsoluteTime) = (0, 0)
  private let cacheTimeout: CFAbsoluteTime = 0.1  // Cache for 100ms

  // Native monitoring properties
  private var monitoringTimer: Timer?
  private var isMonitoring: Bool = false
  private var isPaused: Bool = false
  private var monitoringInterval: TimeInterval = 1.0
  private let minMonitoringInterval: TimeInterval = 0.1
  private let maxMonitoringInterval: TimeInterval = 60.0

  // MARK: - Module Setup

  private func setupModule() {
    // Initialize any required components
  }

  // MARK: - Public Methods

  private func getTotalMemory() -> Double {
    let totalMemory = ProcessInfo.processInfo.physicalMemory
    return Double(totalMemory) / (1024.0 * 1024.0)  // Convert to MB
  }

  private func getCurrentMemory() -> Double {
    return getMemoryUsage()
  }

  private func getCurrentCPU() -> Double {
    return getCPUUsage()
  }

  private func getTotalCPU() -> Int {
    return ProcessInfo.processInfo.processorCount
  }

  // MARK: - FPS Monitoring removed - now handled by Reanimated

  // MARK: - Memory Monitoring

  private func getMemoryUsage() -> Double {
    let now = CFAbsoluteTimeGetCurrent()

    // Return cached value if still valid
    if now - cachedMemoryInfo.timestamp < cacheTimeout {
      return cachedMemoryInfo.value
    }

    var info = mach_task_basic_info()
    var count = mach_msg_type_number_t(MemoryLayout<mach_task_basic_info>.size) / 4

    let kerr: kern_return_t = withUnsafeMutablePointer(to: &info) {
      $0.withMemoryRebound(to: integer_t.self, capacity: 1) {
        task_info(
          mach_task_self_,
          task_flavor_t(MACH_TASK_BASIC_INFO),
          $0,
          &count)
      }
    }

    let memoryUsage: Double
    if kerr == KERN_SUCCESS {
      memoryUsage = Double(info.resident_size) / (1024.0 * 1024.0)
    } else {
      memoryUsage = 0.0
    }

    // Update cache
    cachedMemoryInfo = (value: memoryUsage, timestamp: now)
    return memoryUsage
  }

  private func getDetailedMemoryInfo() -> [String: Any] {
    var info = task_vm_info_data_t()
    var count = mach_msg_type_number_t(MemoryLayout<task_vm_info_data_t>.size) / 4

    let kerr = task_info(
      mach_task_self_, task_flavor_t(TASK_VM_INFO),
      withUnsafeMutablePointer(to: &info) {
        $0.withMemoryRebound(to: integer_t.self, capacity: 1) { $0 }
      }, &count)

    let totalMemory = ProcessInfo.processInfo.physicalMemory

    if kerr == KERN_SUCCESS {
      // Security: Round memory values to prevent precise fingerprinting
      let privateDirtyMB = round(Double(info.phys_footprint) / (1024.0 * 1024.0))
      let heapUsedMB = round(Double(info.virtual_size) / (1024.0 * 1024.0))
      let systemTotalMB = round(Double(totalMemory) / (1024.0 * 1024.0 * 256.0)) * 256.0  // Round to nearest 256MB

      return [
        "privateDirtyMB": privateDirtyMB,
        "privateCleanMB": 0.0,  // Not easily available on iOS
        "sharedDirtyMB": 0.0,  // Not easily available on iOS
        "heapUsedMB": heapUsedMB,
        "heapSizeMB": heapUsedMB,
        "heapMaxMB": systemTotalMB,
        "systemAvailableMB": max(systemTotalMB - privateDirtyMB, 0.0),
        "systemTotalMB": systemTotalMB,
        "isLowMemory": ProcessInfo.processInfo.isLowPowerModeEnabled,
      ]
    }

    return [:]
  }

  // MARK: - CPU Monitoring

  private func getCPUUsage() -> Double {
    let now = CFAbsoluteTimeGetCurrent()

    // Return cached value if still valid
    if now - cachedCPUInfo.timestamp < cacheTimeout {
      return cachedCPUInfo.value
    }

    var info = task_basic_info()
    var count = mach_msg_type_number_t(
      MemoryLayout<task_basic_info>.size / MemoryLayout<integer_t>.size)

    let kerr: kern_return_t = withUnsafeMutablePointer(to: &info) {
      $0.withMemoryRebound(to: integer_t.self, capacity: 1) {
        task_info(mach_task_self_, task_flavor_t(TASK_BASIC_INFO), $0, &count)
      }
    }

    var cpuPercentage = 0.0
    if kerr == KERN_SUCCESS {
      let userTime =
        Double(info.user_time.seconds) + Double(info.user_time.microseconds) / 1_000_000.0
      let systemTime =
        Double(info.system_time.seconds) + Double(info.system_time.microseconds) / 1_000_000.0
      let totalTime = userTime + systemTime

      // Calculate CPU percentage based on time difference
      let timeDiff = now - lastSystemTime
      let cpuDiff = totalTime - lastCPUTime

      if timeDiff > 0 && lastSystemTime > 0 {
        cpuPercentage = (cpuDiff / timeDiff) * 100.0
      }

      lastCPUTime = totalTime
      lastSystemTime = now

      cpuPercentage = min(cpuPercentage, 100.0)
    }

    // Update cache
    cachedCPUInfo = (value: cpuPercentage, timestamp: now)
    return cpuPercentage
  }

  // MARK: - System Information

  private func getSystemInfo() -> [String: Any] {
    let totalMemory = ProcessInfo.processInfo.physicalMemory
    let processorCount = ProcessInfo.processInfo.processorCount

    // Security: Sanitize system information to prevent fingerprinting
    let totalMemoryMB = Double(totalMemory) / (1024.0 * 1024.0)
    let availableMemoryMB = Double(totalMemory) / (1024.0 * 1024.0)

    return [
      "availableProcessors": min(processorCount, 16),  // Cap at reasonable limit
      "totalMemoryMB": round(totalMemoryMB / 256.0) * 256.0,  // Round to nearest 256MB
      "availableMemoryMB": round(availableMemoryMB / 256.0) * 256.0,  // Round to prevent exact fingerprinting
      "lowMemoryThresholdMB": 100.0,
      "isLowMemory": ProcessInfo.processInfo.isLowPowerModeEnabled,
      "memoryClass": 0,  // Android concept, not applicable to iOS
      "largeMemoryClass": 0,  // Android concept, not applicable to iOS
      "thermalState": getThermalState(),
      "batteryInfo": getBatteryInfo(),
      "memoryPressure": getMemoryPressure(),
    ]
  }

  // MARK: - Utility Functions

  private func forceGarbageCollection() {
    // Perform multiple autorelease pool cycles to ensure cleanup
    for _ in 0..<3 {
      autoreleasepool {
        // Force memory cleanup by creating and releasing temporary objects
        let _ = Array(0..<100)
      }
    }
  }

  // MARK: - Performance Analysis

  private func analyzePerformance() -> [String: Any] {
    let _ = getDetailedMemoryInfo()
    let currentMemory = getMemoryUsage()
    let currentCPU = getCPUUsage()

    // Performance scoring (0-100) - FPS analysis removed
    let memoryScore = memoryScore(for: currentMemory)
    let cpuScore = cpuScore(for: currentCPU)

    let overallScore = (memoryScore + cpuScore) / 2

    return [
      "overallScore": overallScore,
      "memoryScore": memoryScore,
      "cpuScore": cpuScore,
      "currentCPU": currentCPU,
      "recommendations": generateRecommendations(memoryScore: memoryScore, cpuScore: cpuScore),
    ]
  }

  private func memoryScore(for memory: Double) -> Int {
    switch memory {
    case 0..<50: return 100
    case 50..<100: return 80
    case 100..<200: return 60
    case 200..<300: return 40
    default: return 20
    }
  }

  private func cpuScore(for cpu: Double) -> Int {
    switch cpu {
    case 0..<20: return 100
    case 20..<40: return 80
    case 40..<60: return 60
    case 60..<80: return 40
    default: return 20
    }
  }

  private func generateRecommendations(memoryScore: Int, cpuScore: Int) -> [String] {
    var recommendations: [String] = []

    if memoryScore < 60 {
      recommendations.append(
        "Memory usage is high - consider optimizing images and data structures")
    }

    if cpuScore < 60 {
      recommendations.append("CPU usage is high - look for expensive operations")
    }

    if recommendations.isEmpty {
      recommendations.append("Performance looks good!")
    }

    return recommendations
  }

  // MARK: - Cleanup

  // MARK: - Native Monitoring Implementation

  private func startMonitoring(intervalMs: Int) {
    // Input validation
    let intervalSeconds = max(
      minMonitoringInterval, min(maxMonitoringInterval, Double(intervalMs) / 1000.0))

    if isMonitoring {
      // Already monitoring, restart with new interval
      stopMonitoring()
    }

    monitoringInterval = intervalSeconds
    isMonitoring = true
    isPaused = false

    // Create and start timer
    monitoringTimer = Timer.scheduledTimer(withTimeInterval: monitoringInterval, repeats: true) {
      [weak self] _ in
      self?.emitPerformanceUpdates()
    }
  }

  private func stopMonitoring() {
    isMonitoring = false
    isPaused = false

    monitoringTimer?.invalidate()
    monitoringTimer = nil
  }

  private func pauseMonitoring() {
    if isMonitoring {
      isPaused = true
      monitoringTimer?.invalidate()
      monitoringTimer = nil
    }
  }

  private func resumeMonitoring() {
    if isMonitoring && isPaused {
      isPaused = false
      monitoringTimer = Timer.scheduledTimer(withTimeInterval: monitoringInterval, repeats: true) {
        [weak self] _ in
        self?.emitPerformanceUpdates()
      }
    }
  }

  private func getMonitoringState() -> [String: Any] {
    return [
      "isMonitoring": isMonitoring,
      "intervalMs": Int(monitoringInterval * 1000),
      "isPaused": isPaused,
    ]
  }

  private func emitPerformanceUpdates() {
    if isMonitoring && !isPaused {
      // Emit memory update
      let memoryUsage = getMemoryUsage()
      let timestamp = Date().timeIntervalSince1970 * 1000

      let memoryData: [String: Any] = [
        "ramUsageInMB": memoryUsage,
        "timestamp": timestamp,
      ]
      sendEvent("MEMORY_UPDATE", memoryData)

      // Emit CPU update
      let cpuUsage = getCPUUsage()

      let cpuData: [String: Any] = [
        "cpuUsage": cpuUsage,
        "timestamp": timestamp,
      ]
      sendEvent("CPU_UPDATE", cpuData)
    }
  }

  private func cleanup() {
    // Stop monitoring if active
    stopMonitoring()

    // Clear caches to free memory
    cachedMemoryInfo = (0, 0)
    cachedCPUInfo = (0, 0)
  }

  deinit {
    // Stop monitoring and clear caches on cleanup
    cleanup()
  }
}

// MARK: - Additional Performance Utilities

extension ExpoPerformanceModule {
  // Get system-wide memory pressure
  private func getMemoryPressure() -> String {
    // This is a simplified approach - in practice you'd want to maintain this source
    return "normal"  // Could be "warning" or "critical"
  }

  // Get thermal state
  private func getThermalState() -> String {
    if #available(iOS 11.0, *) {
      switch ProcessInfo.processInfo.thermalState {
      case .nominal:
        return "nominal"
      case .fair:
        return "fair"
      case .serious:
        return "serious"
      case .critical:
        return "critical"
      @unknown default:
        return "unknown"
      }
    }
    return "unknown"
  }

  // Get battery state (affects performance)
  private func getBatteryInfo() -> [String: Any] {
    UIDevice.current.isBatteryMonitoringEnabled = true

    return [
      "level": UIDevice.current.batteryLevel,
      "state": batteryStateString(),
      "lowPowerMode": ProcessInfo.processInfo.isLowPowerModeEnabled,
    ]
  }

  private func batteryStateString() -> String {
    switch UIDevice.current.batteryState {
    case .unknown:
      return "unknown"
    case .unplugged:
      return "unplugged"
    case .charging:
      return "charging"
    case .full:
      return "full"
    @unknown default:
      return "unknown"
    }
  }
}
