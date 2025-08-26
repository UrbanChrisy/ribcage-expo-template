package expo.modules.performance

import android.app.ActivityManager
import android.content.Context
import android.os.Debug
import android.os.Handler
import android.os.Looper
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import java.io.BufferedReader
import java.io.FileReader
import java.io.IOException
import java.util.*
import java.util.Collections
import java.util.concurrent.atomic.AtomicBoolean
import java.util.concurrent.atomic.AtomicLong
import kotlin.math.min
import kotlin.math.sqrt

// Memory metrics data class
class MemoryMetrics : Record {
    @Field
    var ramUsageInMB: Double = 0.0
    
    @Field
    var timestamp: Double = 0.0
}

// CPU metrics data class
class CPUMetrics : Record {
    @Field
    var cpuUsage: Double = 0.0
    
    @Field
    var timestamp: Double = 0.0
}

class ExpoPerformanceModule : Module() {
    
    companion object {
        private const val MEMORY_ROUNDING_256MB = 256.0
        private const val MEMORY_ROUNDING_128MB = 128.0
        private const val MEMORY_ROUNDING_64MB = 64.0
        private const val MEMORY_CACHE_DURATION = 5000L // 5 seconds
        private const val MIN_MONITORING_INTERVAL = 100L
        private const val MAX_MONITORING_INTERVAL = 60000L
    }
    
    // Module definition
    override fun definition() = ModuleDefinition {
        Name("ExpoPerformance")
        
        // Simple data functions - no events
        Function("getTotalMemory") {
            getTotalMemory()
        }
        
        Function("getCurrentMemory") {
            getCurrentMemory()
        }
        
        Function("getCurrentCPU") {
            getCurrentCPU()
        }
        
        Function("getTotalCPU") {
            getTotalCPU()
        }
        
        // Advanced functions
        Function("getDetailedMemoryInfo") {
            getDetailedMemoryInfo()
        }
        
        Function("getSystemInfo") {
            getSystemInfo()
        }
        
        Function("forceGarbageCollection") {
            forceGarbageCollection()
        }
        
        Function("getPerformanceAnalysis") {
            analyzePerformance()
        }
        
        // Module lifecycle
        OnCreate {
            setupModule()
        }
        
        OnDestroy {
            cleanup()
        }
    }
    
    // MARK: - Private Properties
    
    private val context: Context by lazy { appContext.reactContext ?: appContext.currentActivity!! }
    
    // CPU tracking
    private var lastCpuTime = 0L
    private var lastSystemTime = 0L
    
    // Memory tracking with caching
    private val activityManager: ActivityManager by lazy {
        context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
    }
    private var lastDetailedMemoryInfo: Map<String, Any>? = null
    private var lastMemoryInfoTime = 0L
    
    
    // MARK: - Module Setup
    
    private fun setupModule() {
        // Initialize components
    }
    
    private fun cleanup() {
        // Clear cached memory info
        lastDetailedMemoryInfo = null
        lastMemoryInfoTime = 0L
    }
    
    // MARK: - Public Methods
    
    private fun getTotalMemory(): Double {
        val memInfo = ActivityManager.MemoryInfo()
        activityManager.getMemoryInfo(memInfo)
        return memInfo.totalMem / (1024.0 * 1024.0) // Convert to MB
    }
    
    private fun getCurrentMemory(): Double {
        return getMemoryUsage()
    }
    
    private fun getCurrentCPU(): Double {
        return getCPUUsage()
    }
    
    private fun getTotalCPU(): Int {
        return Runtime.getRuntime().availableProcessors()
    }
    
    // MARK: - FPS Monitoring removed - now handled by Reanimated
    
    // MARK: - Memory Monitoring
    
    private fun getMemoryUsage(): Double {
        val runtime = Runtime.getRuntime()
        val usedMemory = runtime.totalMemory() - runtime.freeMemory()
        return usedMemory / 1024.0 / 1024.0 // Convert to MB
    }
    
    private fun getDetailedMemoryInfo(): Map<String, Any> {
        val currentTime = System.currentTimeMillis()
        if (lastDetailedMemoryInfo != null && (currentTime - lastMemoryInfoTime) < MEMORY_CACHE_DURATION) {
            return lastDetailedMemoryInfo!!
        }
        
        val memoryInfo = Debug.MemoryInfo()
        Debug.getMemoryInfo(memoryInfo)
        
        val runtime = Runtime.getRuntime()
        val activityMemoryInfo = ActivityManager.MemoryInfo()
        activityManager.getMemoryInfo(activityMemoryInfo)
        
        // Security: Round memory values to prevent precise fingerprinting
        val privateDirtyMB = kotlin.math.round(memoryInfo.totalPrivateDirty / 1024.0)
        val heapUsedMB = kotlin.math.round((runtime.totalMemory() - runtime.freeMemory()) / (1024.0 * 1024.0))
        val systemTotalMB = kotlin.math.round(activityMemoryInfo.totalMem / (1024.0 * 1024.0 * MEMORY_ROUNDING_256MB)) * MEMORY_ROUNDING_256MB
        
        val result = mapOf(
            "privateDirtyMB" to privateDirtyMB,
            "privateCleanMB" to kotlin.math.round(memoryInfo.totalPrivateClean / 1024.0),
            "sharedDirtyMB" to kotlin.math.round(memoryInfo.totalSharedDirty / 1024.0),
            "heapUsedMB" to heapUsedMB,
            "heapSizeMB" to kotlin.math.round(runtime.totalMemory() / (1024.0 * 1024.0)),
            "heapMaxMB" to kotlin.math.round(runtime.maxMemory() / (1024.0 * 1024.0 * MEMORY_ROUNDING_128MB)) * MEMORY_ROUNDING_128MB,
            "systemAvailableMB" to kotlin.math.round(activityMemoryInfo.availMem / (1024.0 * 1024.0 * MEMORY_ROUNDING_64MB)) * MEMORY_ROUNDING_64MB,
            "systemTotalMB" to systemTotalMB,
            "isLowMemory" to activityMemoryInfo.lowMemory
        )
        
        lastDetailedMemoryInfo = result
        lastMemoryInfoTime = currentTime
        return result
    }
    
    // MARK: - CPU Monitoring
    
    private fun getCPUUsage(): Double {
        return try {
            FileReader("/proc/self/stat").use { reader ->
                BufferedReader(reader).use { bufferedReader ->
                    val stats = bufferedReader.readLine()?.split(" ")
                    
                    if (stats != null && stats.size >= 15) {
                        val utime = stats[13].toLongOrNull() ?: 0L
                        val stime = stats[14].toLongOrNull() ?: 0L
                        val totalTime = utime + stime
                        
                        val currentSystemTime = System.currentTimeMillis()
                        val timeDiff = currentSystemTime - lastSystemTime
                        val cpuDiff = totalTime - lastCpuTime
                        
                        var cpuPercentage = 0.0
                        if (timeDiff > 0 && lastSystemTime > 0) {
                            // Convert jiffies to percentage (simplified calculation)
                            cpuPercentage = (cpuDiff.toDouble() / timeDiff) * 100.0
                        }
                        
                        lastCpuTime = totalTime
                        lastSystemTime = currentSystemTime
                        
                        min(cpuPercentage, 100.0)
                    } else {
                        0.0
                    }
                }
            }
        } catch (e: IOException) {
            0.0
        }
    }
    
    private fun getSystemCPUUsage(): Double {
        return try {
            FileReader("/proc/stat").use { reader ->
                BufferedReader(reader).use { bufferedReader ->
                    val line = bufferedReader.readLine()
                    
                    if (line.startsWith("cpu ")) {
                        val values = line.split("\\s+".toRegex()).drop(1).map { it.toLongOrNull() ?: 0L }
                        if (values.size >= 4) {
                            val idle = values[3]
                            val total = values.sum()
                            val usage = ((total - idle).toDouble() / total) * 100.0
                            return min(usage, 100.0)
                        }
                    }
                    0.0
                }
            }
        } catch (e: IOException) {
            0.0
        }
    }
    
    // MARK: - System Information
    
    private fun getSystemInfo(): Map<String, Any> {
        val memInfo = ActivityManager.MemoryInfo()
        activityManager.getMemoryInfo(memInfo)
        
        // Security: Sanitize system information to prevent fingerprinting
        val totalMemoryMB = (memInfo.totalMem / (1024.0 * 1024.0))
        val availableMemoryMB = (memInfo.availMem / (1024.0 * 1024.0))
        val processorsCount = Runtime.getRuntime().availableProcessors()
        
        return mapOf(
            "availableProcessors" to minOf(processorsCount, 16), // Cap at reasonable limit
            "totalMemoryMB" to kotlin.math.round(totalMemoryMB / MEMORY_ROUNDING_256MB) * MEMORY_ROUNDING_256MB,
            "availableMemoryMB" to kotlin.math.round(availableMemoryMB / MEMORY_ROUNDING_128MB) * MEMORY_ROUNDING_128MB,
            "lowMemoryThresholdMB" to (memInfo.threshold / (1024.0 * 1024.0)),
            "isLowMemory" to memInfo.lowMemory,
            "memoryClass" to activityManager.memoryClass,
            "largeMemoryClass" to activityManager.largeMemoryClass,
            "thermalState" to getThermalState(),
            "batteryInfo" to getBatteryInfo(),
            "memoryPressure" to getMemoryPressure()
        )
    }
    
    // MARK: - Additional Performance Utilities (matching iOS patterns)
    
    private fun getMemoryPressure(): String {
        // Android equivalent of iOS memory pressure
        val memInfo = ActivityManager.MemoryInfo()
        activityManager.getMemoryInfo(memInfo)
        
        return when {
            memInfo.lowMemory -> "critical"
            memInfo.availMem < (memInfo.threshold * 1.5) -> "warning" 
            else -> "normal"
        }
    }
    
    private fun getThermalState(): String {
        // Android doesn't have direct thermal state like iOS, but we can approximate
        return try {
            // This is a simplified approach - Android thermal APIs are more complex
            val thermalService = context.getSystemService("thermalservice")
            if (thermalService != null) {
                // Would need more complex thermal API integration for real implementation
                "nominal"
            } else {
                "unknown"
            }
        } catch (e: Exception) {
            "unknown"
        }
    }
    
    private fun getBatteryInfo(): Map<String, Any> {
        return try {
            // Android battery info - simplified version
            mapOf(
                "level" to -1.0, // Would need BatteryManager integration
                "state" to "unknown",
                "lowPowerMode" to false // Android has different power saving modes
            )
        } catch (e: Exception) {
            mapOf(
                "level" to -1.0,
                "state" to "unknown", 
                "lowPowerMode" to false
            )
        }
    }
    
    
    // MARK: - Utility Functions
    
    private fun forceGarbageCollection() {
        try {
            // Create an autorelease-pool like cleanup by forcing immediate GC
            System.gc()
            Runtime.getRuntime().gc()
            
            // Force finalization of unreferenced objects
            System.runFinalization()
            
            android.util.Log.d("ExpoPerformance", "Garbage collection completed successfully")
        } catch (e: Exception) {
            // Log error but don't crash - matches iOS behavior
            android.util.Log.w("ExpoPerformance", "Garbage collection failed: ${e.message}")
        }
    }
    
    
    // MARK: - Performance Analysis
    
    private fun analyzePerformance(): Map<String, Any> {
        val memoryInfo = getDetailedMemoryInfo()
        val currentMemory = getMemoryUsage()
        val currentCPU = getCPUUsage()
        
        // Performance scoring (0-100) - FPS analysis removed
        val memoryScore = getMemoryScore(currentMemory)
        val cpuScore = getCpuScore(currentCPU)
        
        val overallScore = (memoryScore + cpuScore) / 2
        
        return mapOf(
            "overallScore" to overallScore,
            "memoryScore" to memoryScore,
            "cpuScore" to cpuScore,
            "currentCPU" to currentCPU,
            "currentMemory" to currentMemory,
            "recommendations" to generateRecommendations(memoryScore, cpuScore)
        )
    }
    
    private fun getMemoryScore(memory: Double): Int {
        return when {
            memory < 50 -> 100
            memory < 100 -> 80
            memory < 200 -> 60
            memory < 300 -> 40
            else -> 20
        }
    }
    
    private fun getCpuScore(cpu: Double): Int {
        return when {
            cpu < 20 -> 100
            cpu < 40 -> 80
            cpu < 60 -> 60
            cpu < 80 -> 40
            else -> 20
        }
    }
    
    private fun generateRecommendations(memoryScore: Int, cpuScore: Int): List<String> {
        val recommendations = mutableListOf<String>()
        
        if (memoryScore < 60) {
            recommendations.add("Memory usage is high - consider optimizing images and data structures")
        }
        
        if (cpuScore < 60) {
            recommendations.add("CPU usage is high - look for expensive operations")
        }
        
        if (recommendations.isEmpty()) {
            recommendations.add("Performance looks good!")
        }
        
        return recommendations
    }
}