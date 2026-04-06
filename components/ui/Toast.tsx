"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, X, Info, Bell } from "lucide-react";
import { useEffect, useState, createContext, useContext, useCallback } from "react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = "success") => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed top-24 right-4 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
                <AnimatePresence mode="popLayout">
                    {toasts.map((toast) => (
                        <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
    const icons = {
        success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
        error: <AlertCircle className="w-5 h-5 text-blis-red" />,
        info: <Info className="w-5 h-5 text-blue-500" />,
        warning: <Bell className="w-5 h-5 text-amber-500" />,
    };

    const colors = {
        success: "border-emerald-500/20 bg-emerald-500/5",
        error: "border-blis-red/20 bg-blis-red/5",
        info: "border-blue-500/20 bg-blue-500/5",
        warning: "border-amber-500/20 bg-amber-500/5",
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9, transition: { duration: 0.2 } }}
            className={`pointer-events-auto flex items-start gap-4 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl ${colors[toast.type]}`}
        >
            <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
            <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-white leading-snug">{toast.message}</p>
            </div>
            <button
                onClick={onRemove}
                className="flex-shrink-0 p-1 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-all"
            >
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}
