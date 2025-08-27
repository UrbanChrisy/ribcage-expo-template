import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { RibcageSDK } from "modules/ribcage-react-native";
import { ScrollView } from "react-native";
import PerformanceTest from "modules/expo-ribcage/test-performance";

export default function Test() {
  const [sdk] = useState(() => new RibcageSDK());
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [isPerformanceMonitoring, setIsPerformanceMonitoring] = useState(false);

  useEffect(() => {
    sdk.debugger.websocket.onConnected(() => {
      setIsReconnecting(false);
      setIsConnected(true);
    });

    sdk.debugger.websocket.onDisconnected(() => {
      setIsReconnecting(false);
      setIsConnected(false);
    });

    sdk.debugger.websocket.onReconnecting(() => {
      setIsReconnecting(true);
    });

    sdk.debugger.websocket.onMessage((message) => {
      // console.log('message', message);
    });

    sdk.debugger.websocket.onError((error) => {
      console.log('error', error);
    });

    sdk.init();

    return () => {
      sdk.debugger.shutdown();
    };
  }, [sdk]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.debugStatusContainer}>
        <Text style={styles.title}>Ribcage Debug Status</Text>

        <View style={styles.statusContainer}>
          <Text style={styles.label}>WebSocket Connection:</Text>
          <View style={[styles.indicator, isConnected ? styles.connected : styles.disconnected]} />
          <Text style={[styles.status, isConnected ? styles.connectedText : styles.disconnectedText]}>
            {isReconnecting ? "reconnecting" : isConnected ? "connected" : "disconnected"}
          </Text>
        </View>

        <View style={styles.statusContainer}>
          <Text style={styles.label}>Performance Monitoring:</Text>
          <View style={[styles.indicator, isPerformanceMonitoring ? styles.connected : styles.disconnected]} />
          <Text style={[styles.status, isPerformanceMonitoring ? styles.connectedText : styles.disconnectedText]}>
            {isPerformanceMonitoring ? "active" : "inactive"}
          </Text>
        </View>
      </View>
      <PerformanceTest />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  debugStatusContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    color: '#333',
  },
  indicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  connected: {
    backgroundColor: '#4CAF50',
  },
  disconnected: {
    backgroundColor: '#f44336',
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
    minWidth: 80,
    textAlign: 'right',
  },
  connectedText: {
    color: '#4CAF50',
  },
  disconnectedText: {
    color: '#f44336',
  },
});