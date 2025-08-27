import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Alert, ScrollView } from 'react-native';
import {
  ExpoPerformanceClient,
  PerformanceMonitor,
  usePerformanceMonitor,
  MemoryMetrics,
  CPUMetrics
} from './src';

// Component that uses the performance monitor
const PerformanceTestComponent: React.FC = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentMemoryUsage, setCurrentMemoryUsage] = useState<number | null>(null);
  const [currentCpuUsage, setCurrentCpuUsage] = useState<number | null>(null);
  const [totalMemory, setTotalMemory] = useState<number | null>(null);
  const [currentJSFPS, setCurrentJSFPS] = useState<number>(0);
  const [currentUIFPS, setCurrentUIFPS] = useState<number>(0);

  // Create performance client instance
  const [client] = useState(() => new ExpoPerformanceClient());

  useEffect(() => {
    // Get initial values
    const updateCurrentValues = () => {
      try {
        const memUsage = client.memory.getCurrentMemory();
        const cpuUsage = client.cpu.getCurrentCPU();
        const totalMem = client.memory.getTotalMemory();

        setCurrentMemoryUsage(memUsage);
        setCurrentCpuUsage(cpuUsage);
        setTotalMemory(totalMem);
      } catch (error) {
        console.error('Failed to get current values:', error);
      }
    };

    // Get initial values immediately
    updateCurrentValues();

    // Set up memory monitoring
    const unsubscribeMemory = client.onMemoryUpdate((metrics) => {
      setCurrentMemoryUsage(metrics.ramUsageInMB);
    });

    // Set up CPU monitoring
    const unsubscribeCPU = client.onCPUUpdate((metrics) => {
      setCurrentCpuUsage(metrics.cpuUsage);
    });

    // Set up FPS monitoring
    const unsubscribeJSFPS = client.fps.onJSFPSUpdate((fps) => {
      setCurrentJSFPS(fps);
      console.log('JS FPS Update:', fps);
    });

    const unsubscribeUIFPS = client.fps.onUIFPSUpdate((fps) => {
      setCurrentUIFPS(fps);
      console.log('UI FPS Update:', fps);
    });

    // Update current values periodically even when not monitoring
    // (for when user hasn't started monitoring yet)
    const valueUpdateInterval = setInterval(() => {
      if (!isMonitoring) {
        updateCurrentValues();
      }
    }, 2000);

    // Cleanup on unmount
    return () => {
      unsubscribeMemory();
      unsubscribeCPU();
      unsubscribeJSFPS();
      unsubscribeUIFPS();
      clearInterval(valueUpdateInterval);
      client.destroy();
    };
  }, [client, isMonitoring]);

  const startMonitoring = () => {
    try {
      client.startMonitoring({ intervalMs: 2000 });
      setIsMonitoring(true);
      console.log('Started monitoring with 2 second intervals');
    } catch (error) {
      console.error('Failed to start monitoring:', error);
    }
  };

  const stopMonitoring = () => {
    try {
      client.stopMonitoring();
      setIsMonitoring(false);
      console.log('Stopped monitoring');
    } catch (error) {
      console.error('Failed to stop monitoring:', error);
    }
  };

  const getInstantMetrics = () => {
    const summary = client.getPerformanceSummary();
    console.log('Performance Summary:', summary);

    const memoryInfo = client.getDetailedMemoryInfo();
    console.log('Detailed Memory Info:', memoryInfo);

    Alert.alert(
      'Performance Summary',
      `Overall Score: ${summary.overallScore}\n` +
      `Status: ${summary.status}\n` +
      `Memory: ${summary.memory.current.toFixed(1)}MB (${summary.memory.percentage.toFixed(1)}%)\n` +
      `CPU: ${summary.cpu.current.toFixed(1)}% (${summary.cpu.category})\n\n` +
      `Recommendations:\n${summary.recommendations.join('\n')}`
    );
  };


  // Helper function to get memory percentage
  const getMemoryPercentage = () => {
    if (currentMemoryUsage && totalMemory && totalMemory > 0) {
      return ((currentMemoryUsage / totalMemory) * 100).toFixed(1);
    }
    return 'N/A';
  };

  // Helper function to get CPU status color
  const getCpuStatusColor = (usage: number | null) => {
    if (usage === null) return '#999';
    if (usage < 20) return '#4CAF50'; // Green
    if (usage < 50) return '#FF9800'; // Orange
    if (usage < 80) return '#F44336'; // Red
    return '#9C27B0'; // Purple for very high
  };

  // Helper function to get memory status color
  const getMemoryStatusColor = (percentage: string) => {
    if (percentage === 'N/A') return '#999';
    const pct = parseFloat(percentage);
    if (pct < 30) return '#4CAF50'; // Green
    if (pct < 60) return '#FF9800'; // Orange
    if (pct < 85) return '#F44336'; // Red
    return '#9C27B0'; // Purple for very high
  };

  // Helper function to get FPS status color
  const getFPSStatusColor = (fps: number) => {
    if (fps >= 55) return '#4CAF50'; // Green - excellent
    if (fps >= 45) return '#8BC34A'; // Light green - good
    if (fps >= 30) return '#FFC107'; // Yellow - fair
    if (fps >= 20) return '#FF9800'; // Orange - poor
    if (fps >= 10) return '#F44336'; // Red - bad
    return '#9C27B0'; // Purple - very poor
  };

  // Helper function to get FPS status text
  const getFPSStatusText = (fps: number) => {
    if (fps >= 55) return 'Excellent';
    if (fps >= 45) return 'Good';
    if (fps >= 30) return 'Fair';
    if (fps >= 20) return 'Poor';
    if (fps >= 10) return 'Bad';
    return 'Very Poor';
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Expo Performance Monitor Test</Text>

      {/* Real-time Usage Display */}
      <View style={styles.usageSection}>
        <Text style={styles.usageSectionTitle}>📊 Current System Usage</Text>

        <View style={styles.usageRow}>
          <View style={styles.usageCard}>
            <Text style={styles.usageLabel}>🧠 RAM Usage</Text>
            <Text style={[styles.usageValue, { color: getMemoryStatusColor(getMemoryPercentage()) }]}>
              {currentMemoryUsage ? `${currentMemoryUsage.toFixed(1)} MB` : 'Loading...'}
            </Text>
            <Text style={styles.usageSubtext}>
              {getMemoryPercentage()}% of {totalMemory ? `${totalMemory.toFixed(0)} MB` : 'N/A'}
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: getMemoryPercentage() !== 'N/A' ? `${Math.min(100, parseFloat(getMemoryPercentage()))}%` : '0%',
                    backgroundColor: getMemoryStatusColor(getMemoryPercentage())
                  }
                ]}
              />
            </View>
          </View>

          <View style={styles.usageCard}>
            <Text style={styles.usageLabel}>⚡ CPU Usage</Text>
            <Text style={[styles.usageValue, { color: getCpuStatusColor(currentCpuUsage) }]}>
              {currentCpuUsage !== null ? `${currentCpuUsage.toFixed(1)}%` : 'Loading...'}
            </Text>
            <Text style={styles.usageSubtext}>
              {currentCpuUsage !== null ? (
                currentCpuUsage < 20 ? 'Low' :
                  currentCpuUsage < 50 ? 'Moderate' :
                    currentCpuUsage < 80 ? 'High' : 'Very High'
              ) : 'N/A'}
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: currentCpuUsage !== null ? `${Math.min(100, currentCpuUsage)}%` : '0%',
                    backgroundColor: getCpuStatusColor(currentCpuUsage)
                  }
                ]}
              />
            </View>
          </View>
        </View>

        <Text style={styles.updateInfo}>
          {isMonitoring ? '🔄 Real-time updates active' : '📱 Tap "Start Monitoring" for real-time updates'}
        </Text>
      </View>

      {/* FPS Display Section */}
      <View style={styles.fpsSection}>
        <Text style={styles.fpsSectionTitle}>🎯 Frame Rate Performance</Text>

        <View style={styles.fpsRow}>
          <View style={styles.fpsCard}>
            <Text style={styles.fpsLabel}>🚀 JavaScript FPS</Text>
            <Text style={[styles.fpsValue, { color: getFPSStatusColor(currentJSFPS) }]}>
              {currentJSFPS.toFixed(1)}
            </Text>
            <Text style={styles.fpsSubtext}>
              {getFPSStatusText(currentJSFPS)}
            </Text>
            <View style={styles.fpsBar}>
              <View
                style={[
                  styles.fpsFill,
                  {
                    width: `${Math.min(100, (currentJSFPS / 60) * 100)}%`,
                    backgroundColor: getFPSStatusColor(currentJSFPS)
                  }
                ]}
              />
            </View>
          </View>

          <View style={styles.fpsCard}>
            <Text style={styles.fpsLabel}>🎨 UI Thread FPS</Text>
            <Text style={[styles.fpsValue, { color: getFPSStatusColor(currentUIFPS) }]}>
              {currentUIFPS.toFixed(1)}
            </Text>
            <Text style={styles.fpsSubtext}>
              {getFPSStatusText(currentUIFPS)}
            </Text>
            <View style={styles.fpsBar}>
              <View
                style={[
                  styles.fpsFill,
                  {
                    width: `${Math.min(100, (currentUIFPS / 60) * 100)}%`,
                    backgroundColor: getFPSStatusColor(currentUIFPS)
                  }
                ]}
              />
            </View>
          </View>
        </View>

        <Text style={styles.fpsInfo}>
          Target: 60 FPS • {isMonitoring ? 'Live tracking active' : 'Start monitoring for live updates'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Controls</Text>
        <View style={styles.buttonRow}>
          <Button
            title={isMonitoring ? "Stop Monitoring" : "Start Monitoring"}
            onPress={isMonitoring ? stopMonitoring : startMonitoring}
            color={isMonitoring ? "#ff4444" : "#4CAF50"}
          />
        </View>
        <View style={styles.buttonRow}>
          <Button
            title="Get Instant Metrics"
            onPress={getInstantMetrics}
            color="#2196F3"
          />
        </View>
      </View>

    </ScrollView>
  );
};

// Main test component wrapped with PerformanceMonitor
export const PerformanceTest: React.FC = () => {
  return (
    <PerformanceMonitor
      autoStart={false}
      intervalMs={1000}
      pauseOnBackground={true}
      stopOnUnmount={true}
    >
      <PerformanceTestComponent />
    </PerformanceMonitor>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  buttonRow: {
    marginVertical: 5,
  },
  // New styles for usage display
  usageSection: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    marginVertical: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  usageSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  usageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  usageCard: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  usageLabel: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 8,
    fontWeight: '600',
  },
  usageValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  usageSubtext: {
    fontSize: 12,
    color: '#999',
    marginBottom: 10,
    textAlign: 'center',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#444',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    minWidth: 2,
  },
  updateInfo: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
    marginTop: 15,
    fontStyle: 'italic',
  },
  // FPS display styles
  fpsSection: {
    backgroundColor: '#0a1929',
    padding: 20,
    marginVertical: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#1e3a8a',
  },
  fpsSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#60a5fa',
    textAlign: 'center',
    marginBottom: 20,
  },
  fpsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  fpsCard: {
    flex: 1,
    backgroundColor: '#1e293b',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  fpsLabel: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 8,
    fontWeight: '600',
  },
  fpsValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  fpsSubtext: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: '500',
  },
  fpsBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fpsFill: {
    height: '100%',
    borderRadius: 4,
    minWidth: 2,
  },
  fpsInfo: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 15,
    fontStyle: 'italic',
  },
});

export default PerformanceTest;