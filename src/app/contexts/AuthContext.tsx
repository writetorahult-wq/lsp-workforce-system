import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "../../lib/supabase";

export type UserRole = "employee" | "team_leader" | "hr_admin";

interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  position?: string;
  team?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<UserRole>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const roleFromEmail = (email: string): UserRole => {
  return "employee";
};

const defaultDepartment = (role: UserRole) => {
  if (role === "hr_admin") return "Executive";
  if (role === "team_leader") return "Manufacturing";
  return "Operations";
};

const defaultPosition = (role: UserRole) => {
  if (role === "hr_admin") return "HR Administrator";
  if (role === "team_leader") return "Team Leader";
  return "Employee";
};

async function getUserFromEmail(email: string): Promise<User | null> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return null;
  }

  const { data, error } = await supabase
    .from("employees")
    .select("id, name, email, role, department, position, team")
    .eq("email", normalizedEmail)
    .maybeSingle();

  const role = roleFromEmail(normalizedEmail);

  if (error) {
    console.warn("[Supabase] Error fetching employee record:", error.message);
  }

  if (data && data.email) {
    return {
      id: data.id,
      name: data.name || normalizedEmail,
      email: data.email,
      role: (data.role as UserRole) || role,
      department: data.department || defaultDepartment(role),
      position: data.position || defaultPosition(role),
      team: data.team ?? (role === "team_leader" ? "Leadership" : undefined),
    };
  }

  return {
    id: 0,
    name: normalizedEmail,
    email: normalizedEmail,
    role,
    department: defaultDepartment(role),
    position: defaultPosition(role),
    team: role === "team_leader" ? "Leadership" : undefined,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const setUserFromSession = async (sessionUser: any) => {
    if (!sessionUser?.email) {
      setUser(null);
      return;
    }

    const authUser = await getUserFromEmail(sessionUser.email);
    setUser(authUser);
  };

  useEffect(() => {
    let isMounted = true;
    let loadTimeout: ReturnType<typeof setTimeout> | null = null;

    const loadSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!isMounted) return;

        await setUserFromSession(data.session?.user ?? null);
      } catch (error) {
        console.warn("[Auth] Failed to load session", error);
        if (!isMounted) return;
        setUser(null);
      } finally {
        if (isMounted) {
          setLoading(false);
          if (loadTimeout) {
            clearTimeout(loadTimeout);
          }
        }
      }
    };

    loadTimeout = setTimeout(() => {
      if (isMounted) {
        console.warn("[Auth] Session load timed out, falling back to unauthenticated state.");
        setLoading(false);
      }
    }, 3000);

    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;

      try {
        await setUserFromSession(session?.user ?? null);
      } catch (error) {
        console.warn("[Auth] Error handling auth state change", error);
        setUser(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      if (loadTimeout) {
        clearTimeout(loadTimeout);
      }
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<UserRole> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.session?.user) {
      throw error ?? new Error("Login failed. Please check your credentials.");
    }

    const authUser = await getUserFromEmail(data.session.user.email || email);
    setUser(authUser);
    setLoading(false);
    return authUser?.role ?? roleFromEmail(email);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        loading,
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
