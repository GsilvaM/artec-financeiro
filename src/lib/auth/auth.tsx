import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export interface AuthUser {
  username: string;
  name: string;
  role: "admin" | "user";
}

interface AuthContextType {
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (data: Partial<AuthUser>) => void;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AUTH_USER_KEY = "artec-auth-user";
const AUTH_CRED_KEY = "artec-auth-creds";

function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getCredentials(): Record<string, string> {
  try {
    const raw = localStorage.getItem(AUTH_CRED_KEY);
    return raw ? JSON.parse(raw) : { admin: "admin123" };
  } catch {
    return { admin: "admin123" };
  }
}

function saveCredentials(creds: Record<string, string>) {
  localStorage.setItem(AUTH_CRED_KEY, JSON.stringify(creds));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    const creds = getCredentials();
    if (creds[username] && creds[username] === password) {
      const authUser: AuthUser = {
        username,
        name: username === "admin" ? "Administrador" : username,
        role: username === "admin" ? "admin" : "user",
      };
      setUser(authUser);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(AUTH_USER_KEY);
  }, []);

  const updateUser = useCallback((data: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const changePassword = useCallback(
    async (oldPassword: string, newPassword: string): Promise<boolean> => {
      const creds = getCredentials();
      if (user && creds[user.username] === oldPassword) {
        creds[user.username] = newPassword;
        saveCredentials(creds);
        return true;
      }
      return false;
    },
    [user],
  );

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
