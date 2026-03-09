import type { AuthUser } from "../types";
import type { Dispatch, ReactElement, ReactNode, SetStateAction } from "react";

export interface AuthContextType {
  user: AuthUser | null;
  setUser: Dispatch<SetStateAction<AuthUser | null>>;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (userData: any) => Promise<any>;
  logout: () => void;
}

export const AuthProvider: ({ children }: { children: ReactNode }) => ReactElement;
export const useAuth: () => AuthContextType;
