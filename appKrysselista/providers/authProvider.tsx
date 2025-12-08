import React, { createContext, useContext, useState } from "react";
import { User } from "firebase/auth";

interface AuthContextType {
    user: User | null;
    setUser: (u: User | null) => void;
    kindergardenId: string;
    setKindergardenId: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children}: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [kindergardenId, setKindergardenId] = useState("");

    return (
        <AuthContext.Provider
            value={{ user, setUser, kindergardenId, setKindergardenId }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if(!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
};