import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import { authService, type User, type LoginCredentials } from "./auth";

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<User>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      authService.initializeAuth();
      const token = authService.getToken();
      if (token) {
        try {
          const userData = await authService.me();
          setUser(userData);
        } catch (error) {
          console.error("Failed to get user data:", error);
          authService.removeToken();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<User> => {
    const userData = await authService.login(credentials);
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      isLoading,
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
