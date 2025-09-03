import { createContext, use } from "react";
import type { AuthState } from "../../core/auth.client";

export const AuthStateContext = createContext<AuthState | null>(null);

export const useAuthState = () => {
  const value = use(AuthStateContext);

  if (value == null) {
    throw new Error("Auth state should only be used in AuthContainer");
  }

  return value;
};
