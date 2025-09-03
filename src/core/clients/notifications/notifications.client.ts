import { useQuery } from "@tanstack/react-query";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { Platform } from "react-native";
import type { ApiClient } from "../api/api.client";
import type { AuthClient, AuthState } from "../auth/auth.client";
import { Logger, LoggingClient } from "../logging/logging.client";

export class NotificationsClient {
  private pushTokenLock: Promise<void> | null = null;
  private logger: Logger;
  
  constructor(
    auth: AuthClient,
    api: ApiClient,
    logging: LoggingClient,
  ) {
    this.logger = logging.createLogger({ name: "NotificationsClient" });
    auth.onAuthStateChange(this.onAuthStateChange.bind(this));
  }

  onAuthStateChange(authState: AuthState) {
    switch (authState.type) {
      case "signed-in":
        this.onSignedIn();
        break;
      case "signed-out":
        break;
      case "mfa-required":
        break;
    }
  }

  private async onSignedIn() {
    await this.uploadPushToken();
  }

  async uploadPushToken() {
    if (this.pushTokenLock) {
      this.logger.info("Push token upload already in progress, skipping");
      return;
    }

    this.pushTokenLock = (async () => {
      const permissions = await Notifications.getPermissionsAsync();

      if (permissions.status !== "granted") {
        this.logger.info("Push permission not granted, skipping upload");
        return;
      }

      const pushToken = await Notifications.getExpoPushTokenAsync();
      if (pushToken == null) {
        this.logger.info("Push token not found, skipping upload");
        return;
      }

      this.logger.info("Push token", { pushToken });
    })();

    await this.pushTokenLock;
    this.pushTokenLock = null;
  }

  usePermission({ requestOnMount = false }: { requestOnMount?: boolean } = {}) {
    const permission = useQuery({
      queryKey: ["notifications", "permission"],
      queryFn: () => Notifications.getPermissionsAsync(),
    });

    useEffect(() => {
      if (!requestOnMount || permission.data == null) {
        return;
      }

      if (
        permission.data.granted ||
        permission.data.status === "denied" ||
        !permission.data.canAskAgain
      ) {
        return;
      }

      Notifications.requestPermissionsAsync()
        .then((result) => {
          this.logger.info("Notifications permission requested", {
            result,
          });
          permission.refetch();

          if (result.status === "granted") {
            this.uploadPushToken();
          }
        })
        .catch((error) => {
          this.logger.error("Error requesting notifications permission", {
            error,
          });
        });
    }, [permission.data, requestOnMount]);

    const canAskAgain = permission.data?.canAskAgain ?? false;
    const status = permission.data?.status ?? "undetermined";
    const granted = permission.data?.granted ?? false;
    const expires = permission.data?.expires ?? "never";

    return {
      permission: permission.data ?? null,
      canAskAgain,
      status,
      granted,
      expires,
    };
  }
}
