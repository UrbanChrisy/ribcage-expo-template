import { InspectorClient } from './inspector';
import { PerformanceClient } from './performance';
import { WebSocketClient } from './websocket.client';

export interface DebuggerConfig {

}

export class DebuggerClient {

  websocket: WebSocketClient;
  inspector: InspectorClient;
  performance: PerformanceClient;
  
  constructor() {
    this.websocket = new WebSocketClient();
    this.inspector = new InspectorClient();
    this.performance = new PerformanceClient(this.websocket);
  }

  initialize(): void {
    this.websocket.connect();
  }

  shutdown(): void {
    this.websocket.disconnect();
  }
}
