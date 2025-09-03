

export enum Environment {
  /** Production environment - live user data, optimized performance */
  Production = "production",
  /** Staging environment - pre-production testing, mirrors production */
  Staging = "staging",
  /** Development environment - local/dev testing, debug features enabled */
  Development = "development",
}

export type EnvironmentConfig= {
  /** Current environment type */
  environment: Environment;
  /** Human-readable environment name */
  name: string;
  /** Whether this environment is active/enabled */
  enabled: boolean;
  /** Base API URL for this environment */
  api_url: string;
  /** Base webapp URL for this environment */
  webapp_url: string;
  /** Supabase configuration for this environment */
  supabase: {
    url: string;
    publishable_key: string;
  };
  /** Debug configuration for this environment */
  debug: {
    email: string | null;
    password: string | null;
  };
} 

export type Environments<T extends EnvironmentConfig> = {
  [K in Environment]: T;
};

export interface EnvironmentClientInterface<Config extends EnvironmentConfig> {
  /** 
   * Get the currently active environment.
   * Should be resolved from storage, defaults, or runtime detection.
   * 
   * @returns Current environment type
   */
  get environment(): Environment; 
  
  /** 
   * Get configuration for the current environment.
   * Should return type-safe configuration object.
   * 
   * @returns Environment-specific configuration
   */
  get config(): Config; 
}