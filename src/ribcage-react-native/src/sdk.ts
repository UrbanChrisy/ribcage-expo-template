import { DebuggerClient } from './clients/debugger';
import { HapticsClient } from './clients/haptics/haptics.client';
export { DebuggerClient } from './clients/debugger';
export type { DebuggerConfig } from './clients/debugger';

export class RibcageSDK {

  private initialized = false;

  public haptics: HapticsClient;
  public debugger: DebuggerClient;
  
  public constructor() {
    this.debugger = new DebuggerClient();
    this.haptics = new HapticsClient();
  }

  public init(): void {
    if (this.initialized) {
      console.warn('[RibcageSDK] SDK already initialized');
      return;
    }

    console.log('[RibcageSDK] Initializing SDK...');

    try {
      this.debugger.initialize();
      this.initialized = true;
      console.log('[RibcageSDK] SDK initialized successfully');
    } catch (error) {
      console.error('[RibcageSDK] Failed to initialize SDK:', error);
      throw error;
    }
  }

  get isInitialized(): boolean {
    return this.initialized;
  }

}
