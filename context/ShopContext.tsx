"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";

interface Product {
    id: string;
    title: string;
    image: string;
    price: number;
    originalPrice?: number;
    category?: string;
    productType?: string;
    precio_coins?: number;
    precio_usd?: number;
}

interface ShopContextType {
    cart: Product[];
    favorites: Product[];
    blisCoins: number;
    isCartOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
    addToCart: (product: Product) => void;
    toggleFavorite: (product: Product) => void;
    removeFromCart: (id: string) => void;
    clearCart: () => void;
    earnBlisCoins: (amount: number) => Promise<boolean>;
    redeemBlisCoins: (amount: number) => Promise<boolean>;
    getCartTotal: () => number;
    getCartCount: () => number;
    isLoaded: boolean;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<Product[]>([]);
    const [favorites, setFavorites] = useState<Product[]>([]);
    const [blisCoins, setBlisCoins] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const openCart = useCallback(() => setIsCartOpen(true), []);
    const closeCart = useCallback(() => setIsCartOpen(false), []);
    const { user } = useAuth();
    const { showToast } = useToast();
    const userRef = useRef(user);

    // Keep user ref updated
    useEffect(() => {
        userRef.current = user;
    }, [user]);

    // Sync functions with ref to avoid dependency issues
    const syncCartToSupabase = useCallback(async (cartItems: Product[]) => {
        const currentUser = userRef.current;
        if (!currentUser) return;
        
        try {
            await fetch('/api/shop/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: currentUser.id, items: cartItems })
            });
        } catch (e) {
            // Silent fail - localStorage is the primary storage
        }
    }, []);

    const syncFavoritesToSupabase = useCallback(async (favoriteItems: Product[]) => {
        const currentUser = userRef.current;
        if (!currentUser) return;
        
        try {
            await fetch('/api/shop/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: currentUser.id, products: favoriteItems.map(f => f.id) })
            });
        } catch (e) {
            // Silent fail - localStorage is the primary storage
        }
    }, []);

    // Load from localStorage on mount
    useEffect(() => {
        if (typeof window === "undefined") return;

        try {
            const savedCart = localStorage.getItem("blis_cart");
            const savedFavorites = localStorage.getItem("blis_favorites");

            if (savedCart) setCart(JSON.parse(savedCart));
            if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
        } catch (e) {
            console.error("Error loading shop data:", e);
        }

        setIsLoaded(true);
    }, []);

    // Load coins from user profile
    useEffect(() => {
        if (user) {
            setBlisCoins(user.blis_coins || 0);
        }
    }, [user]);

    // Sync cart to localStorage and Supabase
    useEffect(() => {
        if (!isLoaded || typeof window === "undefined") return;
        
        localStorage.setItem("blis_cart", JSON.stringify(cart));
        
        if (userRef.current) {
            syncCartToSupabase(cart).catch(() => {});
        }
    }, [cart, isLoaded, syncCartToSupabase]);

    // Sync favorites to localStorage and Supabase
    useEffect(() => {
        if (!isLoaded || typeof window === "undefined") return;
        
        localStorage.setItem("blis_favorites", JSON.stringify(favorites));
        
        if (userRef.current) {
            syncFavoritesToSupabase(favorites).catch(() => {});
        }
    }, [favorites, isLoaded, syncFavoritesToSupabase]);

    const addToCart = useCallback((product: Product) => {
        setCart((prev) => {
            const exists = prev.find((p) => p.id === product.id);
            if (exists) return prev;
            return [...prev, product];
        });
    }, []);

    const removeFromCart = useCallback((id: string) => {
        setCart((prev) => prev.filter((p) => p.id !== id));
    }, []);

    const clearCart = useCallback(() => {
        setCart([]);
    }, []);

    const toggleFavorite = useCallback((product: Product) => {
        setFavorites((prev) => {
            const exists = prev.find((p) => p.id === product.id);
            if (exists) return prev.filter((p) => p.id !== product.id);
            return [...prev, product];
        });
    }, []);

    const earnBlisCoins = useCallback(async (amount: number): Promise<boolean> => {
        if (!user) return false;

        try {
            const response = await fetch("/api/coins/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: user.id,
                    monto: amount,
                    tipo: "recompensa",
                    descripcion: "Recompensa por actividad",
                }),
            });

            const data = await response.json();
            if (data.success) {
                setBlisCoins((prev) => prev + amount);
                return true;
            }
            return false;
        } catch (e) {
            console.error("Error earning coins:", e);
            return false;
        }
    }, [user]);

    const redeemBlisCoins = useCallback(async (amount: number): Promise<boolean> => {
        if (!user || blisCoins < amount) return false;

        try {
            const response = await fetch("/api/coins/spend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: user.id,
                    monto: amount,
                    tipo: "canje",
                    descripcion: "Canje por producto",
                }),
            });

            const data = await response.json();
            if (data.success) {
                setBlisCoins((prev) => prev - amount);
                return true;
            }
            return false;
        } catch (e) {
            console.error("Error redeeming coins:", e);
            return false;
        }
    }, [user, blisCoins]);

    const getCartTotal = useCallback(() => {
        return cart.reduce((total, item) => total + (item.price || item.precio_usd || 0), 0);
    }, [cart]);

    const getCartCount = useCallback(() => {
        return cart.length;
    }, [cart]);

    return (
        <ShopContext.Provider
            value={{
                cart,
                favorites,
                blisCoins,
                isCartOpen,
                openCart,
                closeCart,
                addToCart,
                toggleFavorite,
                removeFromCart,
                clearCart,
                earnBlisCoins,
                redeemBlisCoins,
                getCartTotal,
                getCartCount,
                isLoaded,
            }}
        >
            {children}
        </ShopContext.Provider>
    );
}

export function useShop() {
    const context = useContext(ShopContext);
    if (!context) {
        throw new Error("useShop must be used within a ShopProvider");
    }
    return context;
}