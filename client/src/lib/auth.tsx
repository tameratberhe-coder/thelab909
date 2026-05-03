import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { apiRequest, setAuthToken } from "./queryClient";
import { queryClient } from "./queryClient";

export type AuthUser = {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  role: "member" | "admin" | string;
};

type AuthCtx = {
  user: AuthUser | null;
  isLoading: boolean;
  signup: (data: { email: string; password: string; fullName: string; phone?: string }) => Promise<void>;
  login: (data: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const signup = useCallback(async (data: { email: string; password: string; fullName: string; phone?: string }) => {
    setIsLoading(true);
    try {
      const res = await apiRequest("POST", "/api/auth/signup", data);
      const json = await res.json();
      setAuthToken(json.token);
      setUser(json.user);
      queryClient.clear();
    } finally { setIsLoading(false); }
  }, []);

  const login = useCallback(async (data: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const res = await apiRequest("POST", "/api/auth/login", data);
      const json = await res.json();
      setAuthToken(json.token);
      setUser(json.user);
      queryClient.clear();
    } finally { setIsLoading(false); }
  }, []);

  const logout = useCallback(async () => {
    try { await apiRequest("POST", "/api/auth/logout"); } catch {}
    setAuthToken(null);
    setUser(null);
    queryClient.clear();
  }, []);

  return <Ctx.Provider value={{ user, isLoading, signup, login, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
