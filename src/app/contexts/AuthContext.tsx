import { createContext, useContext, useState, ReactNode } from "react";
import { fakeUsers } from "../components/fakeUsers";

export type UserRole = "employee" | "team_leader" | "hr_admin";

interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  team?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<UserRole>;
  logout: () => void;
  isAuthenticated: boolean;
}

interface FakeUser {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department: string;
  team?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Initialize from localStorage
    const savedUser = localStorage.getItem("currentUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const authenticateUser = (email: string, password: string): FakeUser | null => {
    const normalizedEmail = email.toLowerCase();
    return (
      fakeUsers.find(
        (demoUser) => demoUser.email.toLowerCase() === normalizedEmail && demoUser.password === password
      ) || null
    );
  };

  const login = async (email: string, password: string): Promise<UserRole> => {
    const matchedUser = authenticateUser(email, password);

    if (!matchedUser) {
      throw new Error("Invalid email or password");
    }

    const authenticatedUser: User = {
      id: matchedUser.id,
      name: matchedUser.name,
      email: matchedUser.email,
      role: matchedUser.role,
      department: matchedUser.department,
      team: matchedUser.team,
    };

    setUser(authenticatedUser);
    localStorage.setItem("currentUser", JSON.stringify(authenticatedUser));

    return matchedUser.role;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
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
