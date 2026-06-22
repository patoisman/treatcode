import { createContext, useState, type ReactNode } from "react";
import { DUMMY_USER, DUMMY_ADMIN_USER } from "@/data/dummy";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  resetPassword: (newPassword: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

// Toggle these to test different states in the UI:
const MOCK_AUTHENTICATED = true;
const MOCK_IS_ADMIN = false;

export function AuthProvider({ children }: { children: ReactNode }) {
  const mockUser = MOCK_IS_ADMIN ? DUMMY_ADMIN_USER : DUMMY_USER;

  const [user, setUser] = useState<User | null>(
    MOCK_AUTHENTICATED ? mockUser : null
  );
  const [isLoading] = useState(false);

  const signIn = async (_email: string, _password: string) => {
    setUser(mockUser);
  };

  const signUp = async (
    _email: string,
    _password: string,
    _fullName: string
  ) => {
    setUser(mockUser);
  };

  const signOut = async () => {
    setUser(null);
  };

  const signInWithGoogle = async () => {
    setUser(mockUser);
  };

  const sendPasswordResetEmail = async (_email: string) => {
    // no-op in mock
  };

  const resetPassword = async (_newPassword: string) => {
    // no-op in mock
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut,
        signInWithGoogle,
        sendPasswordResetEmail,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
