"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface User {
    id: string;
    role: "admin" | "user";
    email: string;
    phone?: string;
    name?: string;
    profilePic?: string | null;
    blis_coins?: number;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (id: string, pass: string) => "admin" | "user" | null;
    loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signUp: (email: string, password: string, nombre?: string, apellido?: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    updateProfile: (data: { name?: string; profilePic?: string | null; email?: string; phone?: string }) => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Lazy Supabase client - solo se crea en el cliente
let supabaseInstance: ReturnType<typeof import("@supabase/supabase-js").createClient> | null = null;

function getSupabase() {
    if (typeof window === 'undefined') return null;
    if (supabaseInstance) return supabaseInstance;
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) return null;
    
    const { createClient } = require("@supabase/supabase-js");
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    return supabaseInstance;
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchProfile = async (userId: string): Promise<User | null> => {
        const supabase = getSupabase();
        if (!supabase) return null;
        
        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("id, email, nombre, apellido, avatar_url, blis_coins, rol")
                .eq("id", userId)
                .single();

            if (error || !data) return null;

            const profile = data as {
                id: string;
                email?: string;
                nombre?: string;
                apellido?: string;
                avatar_url?: string;
                blis_coins?: number;
                rol?: string;
            };

            return {
                id: profile.id,
                email: profile.email || "",
                name: `${profile.nombre || ""} ${profile.apellido || ""}`.trim(),
                profilePic: profile.avatar_url,
                blis_coins: profile.blis_coins || 0,
                role: profile.rol === "admin" ? "admin" : "user",
                phone: undefined,
            };
        } catch {
            return null;
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            try {
                const supabase = getSupabase();
                
                if (supabase) {
                    const { data: { session } } = await supabase.auth.getSession();
                    
                    if (session?.user) {
                        const profile = await fetchProfile(session.user.id);
                        if (profile) {
                            setUser(profile);
                            setLoading(false);
                            return;
                        }
                    }
                }
            } catch {
                // Fallback to mock auth
            }

            if (typeof window !== 'undefined') {
                const stored = localStorage.getItem("blis_auth");
                if (stored) {
                    setUser(JSON.parse(stored));
                }
            }
            
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = (id: string, pass: string) => {
        // Demo credentials disabled - use real authentication only
        // if (id === "admin" && pass === "admin") {
        //     const adminUser: User = {
        //         id: "admin",
        //         role: "admin",
        //         email: "admin@bliscorp.com",
        //         name: "Admin BlisCorp",
        //         blis_coins: 1000,
        //     };
        //     setUser(adminUser);
        //     localStorage.setItem("blis_auth", JSON.stringify(adminUser));
        //     return "admin";
        // } else if (id === "user" && pass === "user") {
        //     const normalUser: User = {
        //         id: "user",
        //         role: "user",
        //         email: "kevin.inv@bliscorp.com",
        //         name: "Kevin Valdez",
        //         blis_coins: 500,
        //     };
        //     setUser(normalUser);
        //     localStorage.setItem("blis_auth", JSON.stringify(normalUser));
        //     return "user";
        // }
        return null;
    };

    const loginWithEmail = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        const supabase = getSupabase();
        if (!supabase) {
            return { success: false, error: "Supabase no está configurado" };
        }
        
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            
            if (error) {
                return { success: false, error: error.message };
            }

            if (data.user) {
                const profile = await fetchProfile(data.user.id);
                if (profile) {
                    setUser(profile);
                    return { success: true };
                }
                const basicUser: User = {
                    id: data.user.id,
                    email: data.user.email || email,
                    role: "user",
                    blis_coins: 0,
                };
                setUser(basicUser);
                return { success: true };
            }

            return { success: false, error: "No se pudo obtener el perfil" };
        } catch (err) {
            return { success: false, error: err instanceof Error ? err.message : "Error desconocido" };
        }
    };

    const signUp = async (email: string, password: string, nombre?: string, apellido?: string): Promise<{ success: boolean; error?: string }> => {
        const supabase = getSupabase();
        if (!supabase) {
            return { success: false, error: "Supabase no está configurado" };
        }
        
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        nombre,
                        apellido,
                    },
                },
            });

            if (error) {
                return { success: false, error: error.message };
            }

            return { success: true };
        } catch (err) {
            return { success: false, error: err instanceof Error ? err.message : "Error desconocido" };
        }
    };

    const logout = async () => {
        const supabase = getSupabase();
        if (supabase) {
            await supabase.auth.signOut();
        }
        setUser(null);
        if (typeof window !== 'undefined') {
            localStorage.removeItem("blis_auth");
        }
        router.push("/");
    };

    const updateProfile = (data: { name?: string; profilePic?: string | null; email?: string; phone?: string }) => {
        if (!user) return;
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        if (typeof window !== 'undefined') {
            localStorage.setItem("blis_auth", JSON.stringify(updatedUser));
        }
    };

    const refreshUser = async () => {
        if (!user) return;
        const profile = await fetchProfile(user.id);
        if (profile) {
            setUser(profile);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, loginWithEmail, signUp, logout, updateProfile, refreshUser }}>
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