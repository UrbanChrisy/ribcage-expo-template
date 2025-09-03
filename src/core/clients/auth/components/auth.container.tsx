import { type FC, type PropsWithChildren, useEffect, useState } from "react";
import { core } from "@/core";
import type { AuthState } from "../../../core/auth.client";
import { AuthStateContext } from "../auth.context";

export const AuthContainer: FC<PropsWithChildren> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState | null>(
    core.auth.getAuthState(),
  );

  useEffect(() => {
    const unsubscribe = core.auth.onAuthStateChange((authState) => {
      setAuthState(authState);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (authState === null) {
    return null;
  }

  return (
    <AuthStateContext.Provider value={authState}>
      {children}
    </AuthStateContext.Provider>
  );
};
