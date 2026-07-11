"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, Trash2, Plus, Minus, Coins, CreditCard } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useShop } from "@/context/ShopContext";
import { useAuth } from "@/hooks/useAuth";

export function CartSidebar() {
    const { cart, blisCoins, removeFromCart, getCartTotal, getCartCount, isCartOpen: isOpen, closeCart: onClose, coinsEnabled } = useShop();
    const { user } = useAuth();
    const router = useRouter();

    const totalUSD = getCartTotal();
    const totalItems = getCartCount();
    const totalCoins = cart.reduce((sum, item) => sum + (item.precio_coins || Math.round((item.price || 0) * 10)), 0);

    const handleCheckout = () => {
        onClose();
        router.push("/tienda/checkout");
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
                    />

                    {/* Sidebar */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full max-w-lg bg-zinc-950 border-l border-white/5 z-[101] flex flex-col shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blis-red/10 flex items-center justify-center border border-blis-red/20">
                                    <ShoppingCart className="w-5 h-5 text-blis-red" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-white uppercase tracking-tight">Carrito</h2>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                        {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center">
                                    <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
                                        <ShoppingCart className="w-10 h-10 text-gray-600" />
                                    </div>
                                    <h3 className="text-xl font-black text-white mb-2">Carrito Vacío</h3>
                                    <p className="text-gray-500 text-sm mb-6">Agrega productos para comenzar</p>
                                    <button
                                        onClick={onClose}
                                        className="px-6 py-3 bg-white text-black font-black uppercase text-xs rounded-xl hover:bg-blis-red hover:text-white transition-all"
                                    >
                                        Ver Productos
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {cart.map((item, index) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5"
                                        >
                                            {/* Image */}
                                            <div className="w-24 h-24 rounded-xl overflow-hidden border border-white/10 flex-shrink-0 bg-zinc-900">
                                                <img
                                                    src={item.image}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-base font-bold text-white line-clamp-2 mb-1">
                                                    {item.title}
                                                </h4>
                                                <p className="text-[11px] text-gray-500 uppercase tracking-widest mb-2">
                                                    {item.category}
                                                </p>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl font-black text-white">
                                                        ${(item.price || item.precio_usd || 0).toFixed(2)}
                                                    </span>
                                                    {coinsEnabled && (item.precio_coins || item.price) && (
                                                        <span className="text-[10px] text-amber-500 font-bold flex items-center gap-1">
                                                            <Coins className="w-3 h-3" />
                                                            {item.precio_coins || Math.round((item.price || 0) * 10)} COINS
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Remove */}
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center hover:bg-red-500/20 transition-colors self-start"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-400" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {cart.length > 0 && (
                            <div className="p-6 border-t border-white/5 space-y-4">
                                {/* Summary */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-400">Subtotal</span>
                                        <span className="text-white font-bold">${totalUSD.toFixed(2)}</span>
                                    </div>
                                    {coinsEnabled && user && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-400 flex items-center gap-1">
                                                <Coins className="w-3.5 h-3.5 text-amber-500" />
                                                Tu saldo
                                            </span>
                                            <span className="text-amber-500 font-bold">{blisCoins.toLocaleString()} COINS</span>
                                        </div>
                                    )}
                                    <div className="h-px bg-white/5" />
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400 font-bold">Total</span>
                                        <div className="text-right">
                                            <span className="text-2xl font-black text-white">${totalUSD.toFixed(2)}</span>
                                            {coinsEnabled && totalCoins > 0 && (
                                                <p className="text-[10px] text-amber-500 font-bold">
                                                    o {totalCoins.toLocaleString()} XPAND COINS
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="space-y-2">
                                    <button
                                        onClick={handleCheckout}
                                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-sm rounded-xl transition-all flex items-center justify-center gap-2"
                                    >
                                        <CreditCard className="w-4 h-4" />
                                        Proceder al Pago
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="w-full py-3 bg-white/5 text-gray-400 font-bold uppercase text-xs rounded-xl hover:bg-white/10 transition-all"
                                    >
                                        Seguir Comprando
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export default CartSidebar;
