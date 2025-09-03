import type { Session } from "@supabase/supabase-js";
import { Platform } from "react-native";
import type { AuthClient, AuthState } from "../auth/auth.client";
import type { EnvironmentClient } from "../environment";
import type { LoggingClient, Logger } from "../logging/logging.client";

export class AnalyticsClient {

  private logger: Logger;

  constructor(
    private auth: AuthClient,
    private env: EnvironmentClient,
    logging: LoggingClient,
  ) {
    this.logger = logging.createLogger({ name: "AnalyticsClient" });
    auth.onAuthStateChange(this.onAuthStateChange.bind(this));
  }

  private onAuthStateChange(authState: AuthState) {
    switch (authState.type) {
      case "signed-in":
        this.onSignedIn(authState.session);
        break;
      case "signed-out":
        this.onSignedOut();
        break;
      case "mfa-required":
        // Handle MFA required analytics
        break;
    }
  }

  private async onSignedIn(session: Session | null) {
    if (session?.user.id == null) {
      return;
    }

    // TODO: Implement user sign in on analytics tool
  }

  private async onSignedOut() {
    // TODO: Implement user sign out on analytics tool
  }

  track(event: string, properties?: Record<string, unknown>) {
    this.logger.info(event, properties);
    // TODO: Implement analytics tracking
  }
}
