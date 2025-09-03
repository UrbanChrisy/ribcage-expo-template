declare namespace NodeJS {
  type ProcessEnv = {
    /** Debug credentials for development environment */
    EXPO_PUBLIC_DEBUG_EMAIL_DEV?: string | null;
    /** Debug credentials for development environment */
    EXPO_PUBLIC_DEBUG_PASSWORD_DEV?: string | null;
    /** Debug credentials for staging environment */
    EXPO_PUBLIC_DEBUG_EMAIL_STAGING?: string | null;
    /** Debug credentials for staging environment */
    EXPO_PUBLIC_DEBUG_PASSWORD_STAGING?: string | null;
    /** Debug credentials for production environment */
    EXPO_PUBLIC_DEBUG_EMAIL_PROD?: string | null;
    /** Debug credentials for production environment */
    EXPO_PUBLIC_DEBUG_PASSWORD_PROD?: string | null;
  };
}
