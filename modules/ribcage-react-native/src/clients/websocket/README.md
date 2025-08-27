# @ribcage/websocket

Typed WebSocket client package for Ribcage applications, providing clean APIs for mobile and dashboard clients with full type safety.

## Features

- **Type Safety**: Full TypeScript support with Zod schema validation
- **Clean APIs**: Separate optimized clients for mobile and dashboard use cases  
- **Connection Management**: Automatic reconnection, health monitoring, and message queuing
- **Client Management**: Track connected clients and manage multiple connections
- **Message Validation**: Automatic payload parsing and validation

## Installation

```bash
bun add @ribcage/websocket
```

## Usage

### Mobile Client

Simple API for mobile apps that broadcast to all dashboards:

```typescript
import { MobileWebSocketClient } from "@ribcage/websocket";

const mobileClient = new MobileWebSocketClient({
  host: "localhost",
  port: 8080,
  clientId: "mobile-device-1",
  onMessageReceived: (payload) => {
    console.log("Received:", payload);
  }
});

await mobileClient.connect();

// Send typed messages
await mobileClient.sendMessage("MEMORY_UPDATE", {
  ramUsageInMB: 512,
  deviceId: "phone-1"
});

// Or use convenience methods
await mobileClient.sendMemoryUpdate(512, "phone-1");
await mobileClient.sendCpuUpdate(45.2, "phone-1");
await mobileClient.sendFpsUiUpdate(60, "phone-1");
```

### Dashboard Client  

Multi-source client for dashboards that can send to specific targets:

```typescript
import { DashboardWebSocketClient } from "@ribcage/websocket";

const dashboardClient = new DashboardWebSocketClient({
  host: "localhost", 
  port: 8080,
  clientId: "dashboard-1",
  onMessageReceived: (from, payload) => {
    console.log(`Message from ${from}:`, payload);
  },
  onClientConnected: (client) => {
    console.log("Client connected:", client);
  }
});

await dashboardClient.connect();

// Send to specific mobile client
await dashboardClient.sendToClient("mobile-device-1", "CPU_UPDATE", {
  cpuUsage: 25.5
});

// Broadcast to all mobile clients
await dashboardClient.broadcastToMobileClients("MEMORY_UPDATE", {
  ramUsageInMB: 1024
});

// Get connected clients
const clients = dashboardClient.getClients();
const mobileClients = dashboardClient.getClientsByType("mobile");
```

## Configuration

```typescript
interface WebSocketConfig {
  host: string;                    // WebSocket server host
  port: number;                    // WebSocket server port
  reconnectInterval: number;       // Reconnection attempt interval (ms)
  maxReconnectAttempts: number;    // Maximum reconnection attempts
  pingInterval: number;            // Ping interval for health checks (ms)
  pongTimeout: number;             // Pong timeout (ms)
}

const config: Partial<WebSocketConfig> = {
  host: 'localhost',
  port: 9001,
  reconnectInterval: 5000,
  maxReconnectAttempts: 10,
  pingInterval: 30000,
  pongTimeout: 5000,
};
```

## API Reference

### WebSocketDashboardClient

- `initialize()`: Initialize the client and start WebSocket server (Tauri)
- `disconnect()`: Disconnect from the server
- `sendToClient(clientId, payload)`: Send message to specific client
- `broadcast(payload)`: Broadcast message to all connected clients
- `getConnectedClients()`: Get list of connected clients
- `getConnectionState()`: Get current connection state
- `subscribe(callback)`: Subscribe to connection state changes

### WebSocketMobileClient

- `connect()`: Connect to the WebSocket server
- `disconnect()`: Disconnect from the server
- `sendMessage(payload)`: Send a message
- `sendEvent(eventType, data)`: Send a typed event
- `sendToClient(clientId, payload)`: Send message to specific client
- `broadcast(payload)`: Broadcast message to all clients
- `getConnectionState()`: Get current connection state

### React Hooks

- `useWebSocket(options)`: Dashboard WebSocket hook
- `useMobileWebSocket(options)`: Mobile WebSocket hook
- `useWebSocketMessages()`: Message management hook
- `useConnectedClients()`: Connected clients management hook

## Architecture

The package is organized into several layers:

- **Core**: Base WebSocket functionality (connection, health monitoring, message handling)
- **Clients**: Platform-specific implementations (Dashboard, Mobile)
- **Hooks**: React integration layer

This architecture ensures code reuse while allowing for platform-specific optimizations and features.

## License

MIT