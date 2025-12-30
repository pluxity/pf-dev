import { useAuthStore } from "../store";
import type { AuthState } from "../types";

export interface UseAuthReturn extends AuthState {
  isAuthenticated: boolean;
}

export const useAuth = (): UseAuthReturn => {
  const { user, isLoading } = useAuthStore();

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
};
