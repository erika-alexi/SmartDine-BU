import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import { supabase } from "../lib/supabase";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "faculty" | "staff" | "admin";
  studentId?: string;
}

interface AuthContextType {
  user: User | null;
  login: (
    email: string,
    password: string,
    role: "user" | "admin",
  ) => Promise<boolean>;
  register: (
    name: string,
    email: string,
    password: string,
    studentId?: string,
  ) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<
  AuthContextType | undefined
>(undefined);

const buEmailPattern =
  /^[a-z]{2,4}\d{4}-\d{4}-\d{5}@bicol-u\.edu\.ph$/i;

function toAppUser(profile: any, authUser?: any): User {
  return {
    id: profile?.id || authUser?.id || `user-${Date.now()}`,
    name: profile?.full_name || authUser?.user_metadata?.full_name || profile?.name || "SmartDine User",
    email: profile?.email || authUser?.email || "",
    role: profile?.role || "student",
    studentId: profile?.student_id || profile?.studentId,
  };
}

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      if (supabase) {
        const { data } = await supabase.auth.getSession();
        const authUser = data.session?.user;
        if (authUser) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", authUser.id)
            .maybeSingle();

          if (mounted) {
            const restoredUser = toAppUser(profile, authUser);
            setUser(restoredUser);
            localStorage.setItem("smartdine_user", JSON.stringify(restoredUser));
          }
          return;
        }
      }

      const savedUser = localStorage.getItem("smartdine_user");
      if (savedUser && mounted) {
        setUser(JSON.parse(savedUser));
      }
    }

    restoreSession();
    return () => {
      mounted = false;
    };
  }, []);

  const login = async (
    email: string,
    password: string,
    role: "user" | "admin",
  ): Promise<boolean> => {
    if (role === "admin") {
      if (supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!error && data.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .maybeSingle();

          if (profile?.role === "admin") {
            const adminUser = toAppUser(profile, data.user);
            setUser(adminUser);
            localStorage.setItem("smartdine_user", JSON.stringify(adminUser));
            return true;
          }
        }
      }

      return false;
    }

    if (!buEmailPattern.test(email)) {
      return false;
    }

    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error && data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .maybeSingle();
        const signedInUser = toAppUser(profile, data.user);
        setUser(signedInUser);
        localStorage.setItem("smartdine_user", JSON.stringify(signedInUser));
        return true;
      }

      return false;
    }

    const users = JSON.parse(
      localStorage.getItem("smartdine_users") || "[]",
    );
    const foundUser = users.find(
      (u: any) => u.email === email && u.password === password,
    );

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem(
        "smartdine_user",
        JSON.stringify(userWithoutPassword),
      );
      return true;
    }

    return false;
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    studentId?: string,
  ): Promise<boolean> => {
    if (!buEmailPattern.test(email)) {
      return false;
    }

    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: studentId ? "student" : "faculty",
            student_id: studentId || null,
          },
        },
      });

      if (!error && data.user) {
        const profile = {
          id: data.user.id,
          full_name: name,
          email,
          role: studentId ? "student" : "faculty",
          student_id: studentId || null,
        };
        await supabase.from("profiles").upsert(profile);

        let authUser = data.session?.user || data.user;

        if (!data.session) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (signInError || !signInData.user) {
            return false;
          }

          authUser = signInData.user;
        }

        const signedUpUser = toAppUser(profile, authUser);
        setUser(signedUpUser);
        localStorage.setItem("smartdine_user", JSON.stringify(signedUpUser));
        return true;
      }

      return false;
    }

    const users = JSON.parse(
      localStorage.getItem("smartdine_users") || "[]",
    );
    const existingUser = users.find(
      (u: any) => u.email === email,
    );

    if (existingUser) {
      return false;
    }

    const newUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      password,
      role: studentId ? "student" : "faculty",
      studentId,
    };

    users.push(newUser);
    localStorage.setItem(
      "smartdine_users",
      JSON.stringify(users),
    );

    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem(
      "smartdine_user",
      JSON.stringify(userWithoutPassword),
    );

    return true;
  };

  const logout = () => {
    if (supabase) {
      supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem("smartdine_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
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
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
