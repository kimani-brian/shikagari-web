"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { User } from "@/types";
import api from "@/lib/api";

interface AuthContextValue {
  user:       User | null;
  token:      string | null;
  isLoading:  boolean;
  isLoggedIn: boolean;
  login:      (token: string, user: User) => void;
  logout:     () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,      setUser]      = useState<User | null>(null);
  const [token,     setToken]     = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("shikagari_token");
    const storedUser  = localStorage.getItem("shikagari_user");

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("shikagari_token");
        localStorage.removeItem("shikagari_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((newToken: string, newUser: User) => {
    localStorage.setItem("shikagari_token", newToken);
    localStorage.setItem("shikagari_user",  JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("shikagari_token");
    localStorage.removeItem("shikagari_user");
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get("/users/me");
      const updated = res.data.data as User;
      setUser(updated);
      localStorage.setItem("shikagari_user", JSON.stringify(updated));
    } catch {
      // Silently fail — interceptor handles 401
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isLoggedIn: !!token && !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}