import React, { createContext, useContext, useState } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { User as AppUser } from "@/types/user";

interface AuthContextType {
  user: FirebaseUser | null;      // Firebase auth user
  appUser: AppUser | null;        // vår egen DB-profil
  setUser: (u: FirebaseUser | null) => void;
  setAppUser: (u: AppUser | null) => void;
  kindergardenId: string;
  setKindergardenId: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [kindergardenId, setKindergardenId] = useState("");

  return (
    <AuthContext.Provider value={{ user, appUser, setUser, setAppUser, kindergardenId, setKindergardenId }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
