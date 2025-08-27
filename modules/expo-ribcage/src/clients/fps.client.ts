import { FPSClientInterface, JSFPSCallback, MonitoringOptions, UIFPSCallback } from "../expo-performance.types";
import { SharedValue, makeMutable, runOnUI } from "react-native-reanimated";


type CircularBuffer = ReturnType<typeof createCircularDoublesBuffer>;
function createCircularDoublesBuffer(size: number) {
  'worklet';

  return {
    next: 0 as number,
    buffer: new Float32Array(size),
    size,
    count: 0 as number,

    push(value: number): number | null {
      const oldValue = this.buffer[this.next];
      const oldCount = this.count;
      this.buffer[this.next] = value;

      this.next = (this.next + 1) % this.size;
      this.count = Math.min(this.size, this.count + 1);
      return oldCount === this.size ? oldValue : null;
    },

    front(): number | null {
      const notEmpty = this.count > 0;
      if (notEmpty) {
        const current = this.next - 1;
        const index = current < 0 ? this.size - 1 : current;
        return this.buffer[index];
      }
      return null;
    },

    back(): number | null {
      const notEmpty = this.count > 0;
      return notEmpty ? this.buffer[this.next] : null;
    },
  };
}

function loopAnimationFrame(fn: (lastTime: number, time: number) => void) {
  let lastTime = 0;

  function loop() {
    requestAnimationFrame((time) => {
      if (lastTime > 0) {
        fn(lastTime, time);
      }
      lastTime = time;
      requestAnimationFrame(loop);
    });
  }

  loop();
}

function getFps(renderTimeInMs: number): number {
  'worklet';
  return 1000 / renderTimeInMs;
}

function completeBufferRoutine(
  buffer: CircularBuffer,
  timestamp: number
): number {
  'worklet';
  timestamp = Math.round(timestamp);

  const droppedTimestamp = buffer.push(timestamp) ?? timestamp;

  const measuredRangeDuration = timestamp - droppedTimestamp;

  return getFps(measuredRangeDuration / buffer.count);
}

export class FPSClient implements FPSClientInterface {

  private smoothingFrames: number = 20;

  private jsBuffer: CircularBuffer = createCircularDoublesBuffer(this.smoothingFrames);
  private uiBuffer: CircularBuffer = createCircularDoublesBuffer(this.smoothingFrames);

  private jsCallbacks: Set<JSFPSCallback> = new Set();
  private uiCallbacks: Set<UIFPSCallback> = new Set();

  private JS_FPS = makeMutable("0");
  private UI_FPS = makeMutable("0");

  private isCurrentlyMonitoring: boolean = false;


  constructor() {
    runOnUI(() => {
      this.JS_FPS.addListener(1, (fps) => {
        'worklet';
        console.log('JS_FPS', fps);
        this.jsCallbacks.forEach(callback => callback(Number(fps)));
      }); 
    })

  }

  getCurrentJSFPS(): number {
    return Number(this.JS_FPS.get());
  }
  getCurrentUIFPS(): number {
    return Number(this.UI_FPS.get());
  }

  onJSFPSUpdate(callback: JSFPSCallback): () => void {
    this.jsCallbacks.add(callback);
    return () => {
      this.jsCallbacks.delete(callback);
    };
  }
  onUIFPSUpdate(callback: UIFPSCallback): () => void {
    this.uiCallbacks.add(callback);
    return () => {
      this.uiCallbacks.delete(callback);
    };
  }
  startMonitoring(options: MonitoringOptions): void {
    const { intervalMs } = options;
    this.isCurrentlyMonitoring = true;

    this.initJsLoop();
  }

  private initJsLoop(): void {
    loopAnimationFrame((_, time) => {
      if (!this.isCurrentlyMonitoring) {
        return;
      }

      const currentFps = completeBufferRoutine(this.jsBuffer, time);

      if (currentFps == null || currentFps === 0) {
        return;
      }
      
      // JS fps have to be measured every 2nd frame,
      // thus 2x multiplication has to occur here
      const actualFps = (currentFps * 2).toFixed(0)
      this.JS_FPS.set(actualFps);
    });
  }

  stopMonitoring(): void {
    this.isCurrentlyMonitoring = false;
  }

  isMonitoring(): boolean {
    return this.isCurrentlyMonitoring;
  }

}