import { Button } from "@/components/ui/button";
import { core } from "@/core";
import { useState } from "react";
import { Text } from "react-native";
import { PerformanceMonitor } from "react-native-reanimated";

export default function Test() {
  const [memoryHogs, setMemoryHogs] = useState<Array<any>>([]);

  const stressTest = () => {
    // Create frame drops by blocking the main thread
    const startTime = Date.now();
    let count = 0;

    // CPU intensive operation to cause frame drops
    while (Date.now() - startTime < 500) { // Block for 500ms
      count += Math.random() * Math.sqrt(count + 1);
    }

    // Create memory pressure by allocating large arrays
    const newMemoryHogs = [];
    for (let i = 0; i < 10; i++) {
      // Create large arrays to increase RAM usage
      const largeArray = new Array(10000).fill(0).map((_, index) => ({
        id: index,
        data: new Array(100).fill(Math.random()),
        timestamp: Date.now(),
        randomString: Math.random().toString(36).repeat(100)
      }));
      newMemoryHogs.push(largeArray);
    }

    setMemoryHogs(prev => [...prev, ...newMemoryHogs]);
    console.log(`Stress test completed. Memory hogs count: ${memoryHogs.length + newMemoryHogs.length}`);
  };

  const clearMemory = () => {
    setMemoryHogs([]);
    console.log('Memory cleared');
  };

  return (
    <>
      <PerformanceMonitor />
      <Text>Test</Text>
      <Button onPress={() => {
        core.debugger.inspector.getLayout().then((layout) => {
          console.log(layout);
        });
      }}>
        <Text>
          Get Layout
        </Text>
      </Button>
      <Button onPress={() => {
        core.debugger.performance.monitor.startMonitoring((metrics) => {
          console.log(metrics);
        });
      }}>
        <Text>Start Monitoring</Text>
      </Button>
      <Button onPress={() => {
        core.debugger.performance.monitor.stopMonitoring();
      }}>
        <Text>Stop Monitoring</Text>
      </Button>
      <Button onPress={stressTest}>
        <Text>Stress Test (Drop Frames + RAM)</Text>
      </Button>
      <Button onPress={clearMemory}>
        <Text>Clear Memory</Text>
      </Button>
      <Text>Memory objects: {memoryHogs.length}</Text>
    </>
  )
}