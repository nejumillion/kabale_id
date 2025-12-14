import React, { createContext, useContext } from 'react';

type UserRole = 'SYSTEM_ADMIN' | 'KABALE_ADMIN' | 'CITIZEN' | null;

export interface AuthUser {
  id: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  kabaleId?: string | null; // Only present for KABALE_ADMIN or CITIZEN
  isProfileComplete?: boolean;
}

export interface AuthContextValue {
  user: AuthUser | null;
  isLoggedIn: boolean;
  isSystemAdmin: boolean;
  isKabaleAdmin: boolean;
  isCitizen: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoggedIn: false,
  isSystemAdmin: false,
  isKabaleAdmin: false,
  isCitizen: false,
});

export function AuthProvider({
  user,
  children,
}: {
  user: AuthUser | null;
  children: React.ReactNode;
}) {
  const isLoggedIn = !!user;
  const isSystemAdmin = user?.role === 'SYSTEM_ADMIN';
  const isKabaleAdmin = user?.role === 'KABALE_ADMIN';
  const isCitizen = user?.role === 'CITIZEN';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        isSystemAdmin,
        isKabaleAdmin,
        isCitizen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
