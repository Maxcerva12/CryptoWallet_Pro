import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import authService from "../services/auth.service";
import type { User } from "../services/auth.service";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar usuario del localStorage al iniciar
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      setUser(response.user);

      // Recargar el usuario completo después del login para asegurar que tenga toda la info
      try {
        const currentUserResponse = await authService.fetchCurrentUser();
        if (currentUserResponse.success && currentUserResponse.user) {
          setUser(currentUserResponse.user);
          localStorage.setItem(
            "user",
            JSON.stringify(currentUserResponse.user)
          );
        }
      } catch (err) {
        console.error("Error al recargar usuario:", err);
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: any) => {
    try {
      const response = await authService.register(data);
      setUser(response.user);

      // Recargar el usuario completo después del registro para asegurar que tenga toda la info
      try {
        const currentUserResponse = await authService.fetchCurrentUser();
        if (currentUserResponse.success && currentUserResponse.user) {
          setUser(currentUserResponse.user);
          localStorage.setItem(
            "user",
            JSON.stringify(currentUserResponse.user)
          );
        }
      } catch (err) {
        console.error("Error al recargar usuario:", err);
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const currentUserResponse = await authService.fetchCurrentUser();
      if (currentUserResponse.success && currentUserResponse.user) {
        setUser(currentUserResponse.user);
        localStorage.setItem("user", JSON.stringify(currentUserResponse.user));
      }
    } catch (error) {
      console.error("Error al refrescar usuario:", error);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
