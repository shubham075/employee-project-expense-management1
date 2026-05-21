import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { api, authStore } from "../api/client";

const AuthContext = createContext(null);

const roleHome = {
  Admin: "/admin/dashboard",
  Manager: "/manager/dashboard",
  Employee: "/employee/dashboard",
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("currentUser");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(Boolean(authStore.accessToken));

  useEffect(() => {
    let mounted = true;
    async function loadUser() {
      if (!authStore.accessToken) {
        setLoading(false);
        return;
      }
      try {
        const current = await api.auth.me();
        if (mounted) {
          setUser(current);
          localStorage.setItem("currentUser", JSON.stringify(current));
        }
      } catch {
        authStore.clear();
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadUser();
    return () => {
      mounted = false;
    };
  }, []);

  async function login(credentials) {
    const tokens = await api.auth.login(credentials);
    authStore.setTokens(tokens);
    const current = await api.auth.me();
    setUser(current);
    localStorage.setItem("currentUser", JSON.stringify(current));
    return roleHome[current?.role?.name] || "/profile";
  }

  async function logout() {
    try {
      if (authStore.refreshToken) {
        await api.auth.logout(authStore.refreshToken);
      }
    } finally {
      authStore.clear();
      setUser(null);
    }
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user && authStore.accessToken),
      role: user?.role?.name,
      login,
      logout,
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}

export { roleHome };

