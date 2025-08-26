import type { HealthCheckConfig, WebSocketConnectionState } from "./types";

export class HealthMonitor {
	private config: HealthCheckConfig;
	private pingInterval?: NodeJS.Timeout;
	private pongTimeout?: NodeJS.Timeout;
	private lastPongTime: number = 0;
	private onPing?: () => void;
	private onHealthChange?: (health: 'healthy' | 'warning' | 'unhealthy') => void;
	private currentHealth: 'healthy' | 'warning' | 'unhealthy' = 'healthy';

	constructor(
		config: Partial<HealthCheckConfig> = {},
		callbacks: {
			onPing?: () => void;
			onHealthChange?: (health: 'healthy' | 'warning' | 'unhealthy') => void;
		} = {}
	) {
		this.config = {
			pingInterval: 30000,
			pongTimeout: 5000,
			unhealthyThreshold: 60000,
			warningThreshold: 45000,
			...config,
		};

		this.onPing = callbacks.onPing;
		this.onHealthChange = callbacks.onHealthChange;
		this.lastPongTime = Date.now();
	}

	start(): void {
		this.stop();
		this.lastPongTime = Date.now();
		this.updateHealth('healthy');

		this.pingInterval = setInterval(() => {
			this.sendPing();
			this.checkHealth();
		}, this.config.pingInterval);

		this.checkHealth();
	}

	stop(): void {
		if (this.pingInterval) {
			clearInterval(this.pingInterval);
			this.pingInterval = undefined;
		}

		if (this.pongTimeout) {
			clearTimeout(this.pongTimeout);
			this.pongTimeout = undefined;
		}
	}

	onPongReceived(): void {
		this.lastPongTime = Date.now();
		
		if (this.pongTimeout) {
			clearTimeout(this.pongTimeout);
			this.pongTimeout = undefined;
		}

		this.checkHealth();
	}

	getHealth(): 'healthy' | 'warning' | 'unhealthy' {
		return this.currentHealth;
	}

	getLastPongTime(): number {
		return this.lastPongTime;
	}

	getTimeSinceLastPong(): number {
		return Date.now() - this.lastPongTime;
	}

	updateConnectionState(state: WebSocketConnectionState): WebSocketConnectionState {
		return {
			...state,
			lastPong: this.lastPongTime,
			connectionHealth: this.currentHealth,
		};
	}

	private sendPing(): void {
		this.pongTimeout = setTimeout(() => {
			console.warn('[HealthMonitor] Pong timeout - connection may be stale');
			this.checkHealth();
		}, this.config.pongTimeout);

		this.onPing?.();
	}

	private checkHealth(): void {
		const timeSinceLastPong = this.getTimeSinceLastPong();
		let newHealth: 'healthy' | 'warning' | 'unhealthy';

		if (timeSinceLastPong >= this.config.unhealthyThreshold) {
			newHealth = 'unhealthy';
		} else if (timeSinceLastPong >= this.config.warningThreshold) {
			newHealth = 'warning';
		} else {
			newHealth = 'healthy';
		}

		this.updateHealth(newHealth);
	}

	private updateHealth(newHealth: 'healthy' | 'warning' | 'unhealthy'): void {
		if (this.currentHealth !== newHealth) {
			console.log(`[HealthMonitor] Health changed: ${this.currentHealth} -> ${newHealth}`);
			this.currentHealth = newHealth;
			this.onHealthChange?.(newHealth);
		}
	}
}