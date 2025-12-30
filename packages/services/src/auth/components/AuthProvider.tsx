import { useEffect, type ReactNode } from "react";
import { authApi } from "../api";
import { useAuthStore } from "../store";
import { AuthContext } from "./AuthContext";
import type { AuthProviderProps } from "../types";

export const AuthProvider = ({
  children,
  loginPath = "/login",
  onAuthError,
}: AuthProviderProps): ReactNode => {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await authApi.getMe();
        setUser(user);
      } catch (error) {
        setUser(null);
        if (onAuthError && error instanceof Error) {
          onAuthError(error);
        }
      }
    };

    initAuth();
  }, [setUser, setLoading, onAuthError]);

  return <AuthContext.Provider value={{ loginPath }}>{children}</AuthContext.Provider>;
};
