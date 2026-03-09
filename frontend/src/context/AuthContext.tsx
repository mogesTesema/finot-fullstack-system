import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../lib/api";
import { AuthUser } from "../types";

interface AuthContextType {
  user: AuthUser | null;
  setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (userData: any) => Promise<any>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');

      // Only attempt to restore session if tokens exist
      if (accessToken || refreshToken) {
        try {
          // api.getUser() returns Promise<AuthUser>
          const userData = await api.getUser();
          setUser(userData);
        } catch (error) {
          console.error("Failed to restore session:", error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password);
    setUser(response.user);
    return response;
  };

  const register = async (userData: any) => {
    const response = await api.register(userData);
    setUser(response.user);
    return response;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    window.location.reload();
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {!loading ? children : (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-primary"></div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
