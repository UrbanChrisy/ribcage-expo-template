import { AnalyticsClient } from "./clients/analytics/analytics.client";
import { AuthClient } from "./clients/auth/auth.client";
import { DevClient } from "./clients/dev/dev.client";
import { EnvironmentClient } from "./clients/environment";
import { HapticsClient } from "./clients/haptics/haptics.client";
import { Logger, LoggingClient } from "./clients/logging/logging.client";
import { NotificationsClient } from "./clients/notifications/notifications.client";
import { PreferencesClient } from "./clients/preferences/preferences.client";
import { QueriesClient } from "./clients/queries/queries.client";
import { StorageClient } from "./clients/storage/storage.client";
import { SupabaseClient } from "./clients/supabase/supabase.client";

export class Core {
	public readonly logging: LoggingClient;
	public readonly logger: Logger;
	public readonly storage: StorageClient;
	public readonly haptics: HapticsClient;
	public readonly env: EnvironmentClient;
	public readonly dev: DevClient;
	public readonly queries: QueriesClient;
	public readonly preferences: PreferencesClient;
	public readonly supabase: SupabaseClient;
	public readonly analytics: AnalyticsClient;
	public readonly auth: AuthClient;
	public readonly notifications: NotificationsClient;

	constructor() {
		this.logging = new LoggingClient();
		this.storage = new StorageClient(this.logging);

		this.logger = this.logging.createLogger({ name: "Core" });

		this.logger.debug("Setting up core");

		this.haptics = new HapticsClient();
		this.env = new EnvironmentClient(this.storage);
		this.dev = new DevClient(this.env);
		this.queries = new QueriesClient(this.storage);
		this.preferences = new PreferencesClient(this.storage);
		this.supabase = new SupabaseClient(this.env, this.logging, this.storage);
		this.auth = new AuthClient(
			this.env,
			this.supabase,
			this.queries,
			this.logging,
		);
		this.analytics = new AnalyticsClient(this.auth, this.env, this.logging);
		this.notifications = new NotificationsClient(
			this.auth,
			this.api,
			this.logging,
		);
		this.logger.debug("Core setup complete");
	}
}
