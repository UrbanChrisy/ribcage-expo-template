import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { Mutex } from "async-mutex";
import { EventEmitter } from "expo";
import { jwtDecode } from "jwt-decode";
import type { EnvironmentClient } from "../environment/environment.client";
import { Logger, LoggingClient } from "../logging/logging.client";
import type { QueriesClient } from "../queries/queries.client";
import type { SupabaseClient } from "../supabase";

export type AuthenticatorAssuranceLevels = "aal1" | "aal2";

export type Factor = {
  id: string;
  status: "verified" | "unverified";
};

export type RequiredClaims = {
  aal: AuthenticatorAssuranceLevels;
  exp: number;
};

export type AuthState =
  | { type: "signed-out" }
  | { type: "signed-in"; session: Session }
  | { type: "mfa-required"; session: Session };

export type AuthStateChangeEvents = {
  AUTH_STATE_CHANGED: (authState: AuthState) => void;
};

export class AuthClient {
  
  private readonly logger: Logger;
  private emitter = new EventEmitter<AuthStateChangeEvents>();
  private authState: AuthState | null = null;
  private refreshMutex = new Mutex();

  constructor(
    private readonly env: EnvironmentClient,
    private readonly supabase: SupabaseClient,
    private readonly queries: QueriesClient,
    logging: LoggingClient
  ) {
    this.logger = logging.createLogger({ name: "AuthClient" });
    this.setupAuthStateChangeListener();
  }

  private async setupAuthStateChangeListener() {
    this.supabase.client.auth.onAuthStateChange(async (event, session) => {
      const authState = await this.convertToAuthState(event, session);
      this.authState = authState;
      this.emitter.emit("AUTH_STATE_CHANGED", authState);
    });
  }

  private async convertToAuthState(
    event: AuthChangeEvent,
    session: Session | null,
  ): Promise<AuthState> {
    switch (event) {
      case "INITIAL_SESSION":
        return this.onInitialSession(session);
      case "SIGNED_IN":
        return this.onSignedIn(session);
      case "SIGNED_OUT":
        return this.onSignedOut();
      case "TOKEN_REFRESHED":
        return this.onTokenRefreshed(session);
      case "MFA_CHALLENGE_VERIFIED":
        return this.onMFAChallengeVerified(session);
      default:
        return { type: "signed-out" };
    }
  }

  private async onInitialSession(session: Session | null): Promise<AuthState> {
    if (!session) {
      return { type: "signed-out" };
    }

    return this.onUserSession(session);
  }

  private async onSignedIn(session: Session | null): Promise<AuthState> {
    if (!session) {
      return { type: "signed-out" };
    }

    return this.onUserSession(session);
  }

  private async onSignedOut(): Promise<AuthState> {
    return { type: "signed-out" };
  }

  private async onTokenRefreshed(session: Session | null): Promise<AuthState> {
    if (!session) {
      return { type: "signed-out" };
    }

    return this.onUserSession(session);
  }

  private async onMFAChallengeVerified(
    session: Session | null,
  ): Promise<AuthState> {
    if (!session) {
      return { type: "signed-out" };
    }

    return this.onUserSession(session);
  }

  private async onUserSession(session: Session): Promise<AuthState> {
    const decoded = jwtDecode<RequiredClaims>(session.access_token);
    if (decoded == null) {
      this.logger.error("Failed to decode access token", {
        access_token: session.access_token,
      });
      return { type: "signed-out" };
    }

    let currentLevel: AuthenticatorAssuranceLevels | null = null;
    if (decoded) {
      currentLevel = decoded.aal;
    }

    let nextLevel: AuthenticatorAssuranceLevels | null = currentLevel;
    const verifiedFactors =
      session.user.factors?.filter(
        (factor: Factor) => factor.status === "verified",
      ) ?? [];
    if (verifiedFactors.length > 0) {
      nextLevel = "aal2";
    }

    const mfaRequired = currentLevel !== nextLevel;
    if (mfaRequired) {
      this.logger.info("MFA required", {
        currentLevel,
        nextLevel,
        mfaRequired,
      });

      return {
        type: "mfa-required",
        session,
      };
    }

    return {
      type: "signed-in",
      session,
    };
  }

  public onAuthStateChange(listener: (authState: AuthState) => void) {
    this.emitter.addListener("AUTH_STATE_CHANGED", listener);

    return () => {
      this.emitter.removeListener("AUTH_STATE_CHANGED", listener);
    };
  }

  public async getSession(): Promise<Session | null> {
    const { data } = await this.supabase.client.auth.getSession();
    return data.session;
  }

  public async getAuthToken(): Promise<string | null> {
    const session = await this.getSession();
    const accessToken = session?.access_token ?? null;
    if (accessToken == null) {
      return null;
    }

    const decoded = jwtDecode<RequiredClaims>(accessToken);
    if (decoded == null) {
      return null;
    }

    if (await this.checkTokenExpiration(accessToken)) {
      return await this.refreshTokenIfNeeded();
    }

    return accessToken;
  }

  private checkTokenExpiration(accessToken: string): boolean {
    const decoded = jwtDecode<RequiredClaims>(accessToken);
    if (decoded == null) {
      return false;
    }

    const FIVE_MINUTES = 5 * 60;
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp != null && decoded.exp - now < FIVE_MINUTES;
  }

  private async refreshTokenIfNeeded(): Promise<string | null> {
    return this.refreshMutex.runExclusive(async () => {
      const session = await this.getSession();
      if (session == null) {
        return null;
      }

      const accessToken = session.access_token;
      if (accessToken == null) {
        return null;
      }

      if (this.checkTokenExpiration(accessToken)) {
        return await this.performTokenRefresh();
      }

      return accessToken;
    });
  }

  private async performTokenRefresh(): Promise<string | null> {
    this.logger.info(
      "Access token expires in less than 5 minutes, refreshing",
    );
    await this.supabase.client.auth.refreshSession();
    const refreshedSession = await this.getSession();
    const refreshedAccessToken = refreshedSession?.access_token ?? null;
    if (refreshedAccessToken == null) {
      return null;
    }
    return refreshedAccessToken;
  }

  public getAuthState(): AuthState | null {
    return this.authState;
  }

  async sendPasswordResetEmail(email: string) {
    return this.supabase.client.auth.resetPasswordForEmail(email, {
      redirectTo: `${this.env.config.webapp_url}/reset`,
    });
  }

  async signInWithEmailAndPassword(email: string, password: string) {
    return this.supabase.client.auth.signInWithPassword({
      email,
      password,
    });
  }

  async signInWithOtp(email: string) {
    return this.supabase.client.auth.signInWithOtp({
      email,
    });
  }

  async verifyOtp(email: string, code: string) {
    return this.supabase.client.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });
  }

  async verifyMFACode(code: string) {
    // Get MFA factors
    const { data: factors, error: factorsError } =
      await this.supabase.client.auth.mfa.listFactors();
    if (factorsError) {
      throw factorsError;
    }

    // Find the verified TOTP factor
    const totpFactor = factors.totp?.find(
      (factor) => factor.status === "verified",
    );
    if (!totpFactor) {
      throw new Error("No verified TOTP factor found");
    }

    // Challenge and verify the MFA code
    const { data, error } =
      await this.supabase.client.auth.mfa.challengeAndVerify({
        factorId: totpFactor.id,
        code,
      });

    if (error) {
      throw error;
    }

    return data;
  }

  async signOut() {
    this.logger.info("Signing out");
    const { error } = await this.supabase.client.auth.signOut();
    if (error) {
      this.logger.error("Error signing out", {
        error: JSON.stringify(error),
      });
    } else {
      this.logger.info("Signed out");
    }

    this.logger.info("Clearing storage");
    this.queries.clear();
    this.supabase.storage.clear();

    // Protected routes will automatically redirect to the login screen
  }

  public shutdown() {
    this.emitter.removeAllListeners("AUTH_STATE_CHANGED");
  }
}
