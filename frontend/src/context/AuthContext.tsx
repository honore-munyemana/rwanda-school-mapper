import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  profile_photo?: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("ssevms_token"));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const logout = () => {
    localStorage.removeItem("ssevms_token");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setLoading(false);
  };

  const refreshUser = async () => {
    const storedToken = localStorage.getItem("ssevms_token");
    if (!storedToken) return;
    try {
      const res = await fetch("http://localhost:5000/auth/me", {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      });
      if (res.ok) {
        const userData = await res.json();
        setUser({
          id: userData.id,
          name: userData.name || userData.email.split("@")[0],
          email: userData.email,
          role: userData.role,
          profile_photo: userData.profile_photo,
        });
      }
    } catch (error) {
      console.error("Error refreshing user in AuthContext:", error);
    }
  };

  const login = async (email: string, password: string) => {
    const res = await fetch("http://localhost:5000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      throw new Error("Invalid credentials");
    }

    const data = await res.json();
    localStorage.setItem("ssevms_token", data.token);
    setToken(data.token);
    setUser(data.user);
    setIsAuthenticated(true);
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("ssevms_token");
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/auth/me", {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (res.ok) {
          const userData = await res.json();
          setUser({
            id: userData.id,
            name: userData.name || userData.email.split("@")[0],
            email: userData.email,
            role: userData.role,
            profile_photo: userData.profile_photo,
          });
          setIsAuthenticated(true);
        } else {
          // Token is invalid/expired -> clear session
          logout();
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
