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
    curso_id?: string;
    slug?: string;
}

interface ShopContextType {
    cart: Product[];
    favorites: Product[];
    purchasedProducts: Product[];
    blisCoins: number;
    isCartOpen: boolean;
    coinsEnabled: boolean;
    openCart: () => void;
    closeCart: () => void;
    addToCart: (product: Product) => void;
    toggleFavorite: (product: Product) => void;
    removeFromCart: (id: string) => void;
    clearCart: () => void;
    earnBlisCoins: (amount: number) => Promise<boolean>;
    redeemBlisCoins: (amount: number) => Promise<boolean>;
    redeemAndCheckout: (product: Product) => Promise<{ success: boolean; error?: string }>;
    getCartTotal: () => number;
    getCartCount: () => number;
    isLoaded: boolean;
    fetchPurchasedProducts: () => Promise<void>;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<Product[]>([]);
    const [favorites, setFavorites] = useState<Product[]>([]);
    const [purchasedProducts, setPurchasedProducts] = useState<Product[]>([]);
    const [blisCoins, setBlisCoins] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [coinsEnabled, setCoinsEnabled] = useState(false); // false por defecto — evita flash al cargar
    const openCart = useCallback(() => setIsCartOpen(true), []);
    const closeCart = useCallback(() => setIsCartOpen(false), []);
    const { user, loading: authLoading } = useAuth();
    const { showToast } = useToast();
    const userRef = useRef(user);
    const syncInProgress = useRef(false);

    const fetchPurchasedProducts = useCallback(async () => {
        if (!userRef.current || authLoading) return;
        try {
            const response = await fetch(`/api/compras?user_id=${userRef.current.id}`);
            if (response.ok) {
                const data = await response.json();
                const purchases = data.data || [];
                const purchased = purchases
                    .filter((c: any) => c.estado === 'completado')
                    .flatMap((c: any) => (c.items || []).map((item: any) => ({
                        id: item.producto?.id || c.id,
                        title: item.producto?.nombre || 'Producto',
                        image: item.producto?.imagen_principal || '',
                        price: item.precio_unitario || 0,
                        curso_id: item.producto?.curso_id || null,
                        slug: item.producto?.slug || '',
                    })));
                setPurchasedProducts(purchased);
            }
        } catch {
            // Silent fail
        }
    }, [authLoading]);

    // Keep user ref updated
    useEffect(() => {
        userRef.current = user;
    }, [user]);

    // Sync functions with ref to avoid dependency issues
    const syncCartToSupabase = useCallback(async (cartItems: Product[]) => {
        const currentUser = userRef.current;
        if (!currentUser || authLoading || syncInProgress.current) return;
        syncInProgress.current = true;
        try {
            await fetch('/api/shop/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: currentUser.id, items: cartItems })
            });
        } catch {
            // Silent fail - localStorage is the primary storage
        } finally {
            syncInProgress.current = false;
        }
    }, []);

    const syncFavoritesToSupabase = useCallback(async (favoriteItems: Product[]) => {
        const currentUser = userRef.current;
        if (!currentUser || authLoading) return;
        
        try {
            await fetch('/api/shop/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: currentUser.id, products: favoriteItems.map(f => f.id) })
            });
        } catch {
            // Silent fail - localStorage is the primary storage
        }
    }, []);

    // Check if BLISCOINS is globally enabled
    useEffect(() => {
        fetch("/api/admin/formas-pago?public=1")
            .then(r => r.json())
            .then(d => {
                if (d.formas) {
                    const coins = d.formas.find((f: any) => f.slug === 'coins');
                    setCoinsEnabled(coins ? coins.activo !== false : false);
                }
            })
            .catch(() => {});
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
            fetchPurchasedProducts();
        }
    }, [user, fetchPurchasedProducts]);

    // Sync cart to localStorage and Supabase (debounced)
    const cartSyncTimer = useRef<NodeJS.Timeout | null>(null);
    useEffect(() => {
        if (!isLoaded || typeof window === "undefined") return;
        
        localStorage.setItem("blis_cart", JSON.stringify(cart));
        
        if (userRef.current && !authLoading) {
            if (cartSyncTimer.current) clearTimeout(cartSyncTimer.current);
            cartSyncTimer.current = setTimeout(() => {
                syncCartToSupabase(cart);
            }, 2000);
        }

        return () => {
            if (cartSyncTimer.current) clearTimeout(cartSyncTimer.current);
        }
    }, [cart, isLoaded, syncCartToSupabase]);

    // Sync favorites to localStorage and Supabase (debounced)
    const favSyncTimer = useRef<NodeJS.Timeout | null>(null);
    useEffect(() => {
        if (!isLoaded || typeof window === "undefined") return;
        
        localStorage.setItem("blis_favorites", JSON.stringify(favorites));
        
        if (userRef.current && !authLoading) {
            if (favSyncTimer.current) clearTimeout(favSyncTimer.current);
            favSyncTimer.current = setTimeout(() => {
                syncFavoritesToSupabase(favorites);
            }, 2000);
        }

        return () => {
            if (favSyncTimer.current) clearTimeout(favSyncTimer.current);
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

    const redeemAndCheckout = useCallback(async (product: Product): Promise<{ success: boolean; error?: string }> => {
        if (!user) return { success: false, error: 'Usuario no autenticado' };

        const coinPrice = product.precio_coins || Math.round((product.price || 0) * 10);
        if (blisCoins < coinPrice) return { success: false, error: 'Saldo insuficiente de BLIS Coins' };

        try {
            // 1. Llamar checkout con método coins - crea orden, asigna cursos, envía email
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    empresa_id: '6186f014-c8c7-4027-9f08-8acf2bae3eae',
                    user_id: user.id,
                    nombre: user.name || user.email || '',
                    email: user.email || '',
                    telefono: user.phone || '',
                    productos: [{
                        producto_id: product.id,
                        cantidad: 1,
                        precio_unitario: product.price || 0,
                        nombre: product.title,
                        precio_coins: coinPrice,
                        productType: product.productType,
                    }],
                    metodo_pago: 'coins',
                    monto_coins: coinPrice,
                    monto_usd: 0,
                    tiene_fisicos: product.productType === 'pack',
                    direccion_envio: null,
                }),
            });

            const data = await res.json();

            if (!data.success) {
                return { success: false, error: data.error || 'Error en el checkout' };
            }

            // 2. Deducir coins del perfil
            await fetch("/api/coins/spend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: user.id,
                    monto: coinPrice,
                    tipo: "canje",
                    descripcion: `Canje: ${product.title}`,
                    referencia_id: data.ordenId,
                    referencia_tipo: 'compra',
                }),
            });

            // 3. Actualizar balance local
            setBlisCoins((prev) => prev - coinPrice);

            return { success: true };
        } catch (e) {
            console.error("Error redeemAndCheckout:", e);
            return { success: false, error: 'Error interno' };
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
                purchasedProducts,
                blisCoins,
                isCartOpen,
                openCart,
                closeCart,
                coinsEnabled,
                addToCart,
                toggleFavorite,
                removeFromCart,
                clearCart,
                earnBlisCoins,
                redeemBlisCoins,
                redeemAndCheckout,
                getCartTotal,
                getCartCount,
                isLoaded,
                fetchPurchasedProducts,
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