"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLandingCMS } from './LandingCMSContext';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    sku?: string;
    category?: string;
    discount?: number;
    discountType?: 'percent' | 'fixed';
}

export interface LicenciaConducir {
    tipo?: string;
    numero?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    puntos?: number;
    estado?: string;
    infracciones?: Array<{
        fecha?: string;
        tipo?: string;
        descripcion?: string;
        multa?: string;
        estado?: string;
    }>;
}

export interface Customer {
    id: string; // DNI or RUC
    name: string;
    phone?: string;
    cellphone?: string;
    email?: string;
    address?: string;
    houseNumber?: string;
    department?: string;
    province?: string;
    district?: string;
    country?: string;
    status?: string;
    condition?: string;
    birthDate?: string;
    lastUpdate?: string;
    type: 'natural' | 'juridica';
    representative?: {
        id: string;
        name: string;
        birthDate?: string;
    };
    // Extended Ecuador Registro Civil fields
    gender?: string;
    nationality?: string;
    bloodType?: string;
    maritalStatus?: string;
    spouseName?: string;
    motherName?: string;
    fatherName?: string;
    birthPlace?: string;
    education?: string;
    profession?: string;
    conditionCedulado?: string;
    cedulaDate?: string;
    deathDate?: string;
    // Disability
    disability?: string;
    disabilityType?: string;
    disabilityPct?: number;
    conadisCard?: string;
    // Driver's license
    licencia?: LicenciaConducir;
}

export type TransactionType = 'venta' | 'cotizacion';
export type DocumentType = 'ticket' | 'boleta' | 'factura';

export interface Transaction {
    id: string;
    date: string;
    type: TransactionType;
    docType: DocumentType;
    customer: Customer | null;
    items: CartItem[];
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    status: 'completada' | 'pendiente' | 'cancelada';
}

interface SalesContextType {
    cart: CartItem[];
    addToCart: (product: any) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    updateItemDiscount: (productId: string, discount: number, type: 'percent' | 'fixed') => void;
    clearCart: () => void;
    total: number;
    subtotal: number;
    tax: number;
    globalDiscount: number;

    // Enterprise features
    customer: Customer | null;
    setCustomer: React.Dispatch<React.SetStateAction<Customer | null>>;
    transactionType: TransactionType;
    setTransactionType: React.Dispatch<React.SetStateAction<TransactionType>>;
    documentType: DocumentType;
    setDocumentType: React.Dispatch<React.SetStateAction<DocumentType>>;
    globalDiscountAmount: number;
    setGlobalDiscountAmount: (val: number) => void;
    globalDiscountType: 'percent' | 'fixed';
    setGlobalDiscountType: (type: 'percent' | 'fixed') => void;
    couponCode: string;
    setCouponCode: (code: string) => void;
    history: Transaction[];
    saveTransaction: () => void;
    loadQuote: (quoteId: string) => void;
    shippingCost: number;
    setShippingCost: (val: number) => void;

    // Localization
    currency: string;
    taxName: string;
    taxRate: number;
    country: string;
    setCountry: (c: string) => void;
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export const SalesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [transactionType, setTransactionType] = useState<TransactionType>('venta');
    const [documentType, setDocumentType] = useState<DocumentType>('ticket');
    const [history, setHistory] = useState<Transaction[]>([]);

    // Global Discounts
    const [globalDiscountAmount, setGlobalDiscountAmount] = useState(0);
    const [globalDiscountType, setGlobalDiscountType] = useState<'percent' | 'fixed'>('fixed');
    const [couponCode, setCouponCode] = useState('');
    const [shippingCost, setShippingCost] = useState(0);

    const [total, setTotal] = useState(0);
    const [subtotal, setSubtotal] = useState(0);
    const [tax, setTax] = useState(0);

    // Localization state
    const [currency, setCurrency] = useState('S/');
    const [taxName, setTaxName] = useState('IGV');
    const [taxRate, setTaxRate] = useState(18);
    const [country, setCountry] = useState('PE');
    
    const { cmsData } = useLandingCMS();

    // País: localStorage manda. Si no hay nada guardado, default PE.
    useEffect(() => {
        if (typeof window === 'undefined') return
        const saved = localStorage.getItem('blis_pos_country')
        if (saved) setCountry(saved)
    }, [])

    // Moneda / impuesto desde CMS (no afectan país)
    useEffect(() => {
        if (cmsData?.commercial) {
            const currMap: Record<string, string> = {
                'USD': '$',
                'PEN': 'S/',
                'MXN': '$',
                'EUR': '€',
                'COP': '$',
                'CLP': '$'
            };
            setCurrency(currMap[cmsData.commercial.currency] || cmsData.commercial.currency);
            setTaxName(cmsData.commercial.taxName || 'IGV');
            setTaxRate(cmsData.commercial.taxRate || 18);
        }
    }, [cmsData]);

    const handleSetCountry = (c: string) => {
        setCountry(c)
        if (typeof window !== 'undefined') {
            localStorage.setItem('blis_pos_country', c)
        }
    }

    useEffect(() => {
        // 1. Calculate items total applying item discounts
        let currentSubtotal = cart.reduce((acc, item) => {
            const itemBasePrice = item.price * item.quantity;
            let itemDiscount = 0;
            if (item.discount) {
                if (item.discountType === 'percent') {
                    itemDiscount = itemBasePrice * (item.discount / 100);
                } else {
                    itemDiscount = Math.min(item.discount, itemBasePrice);
                }
            }
            return acc + (itemBasePrice - itemDiscount);
        }, 0);

        // 2. Apply global discount
        let appliedGlobalDiscount = 0;
        if (globalDiscountAmount > 0) {
            if (globalDiscountType === 'percent') {
                appliedGlobalDiscount = currentSubtotal * (globalDiscountAmount / 100);
            } else {
                appliedGlobalDiscount = Math.min(globalDiscountAmount, currentSubtotal);
            }
        }

        const finalAmount = Math.max(0, currentSubtotal - appliedGlobalDiscount);

        // 3. Tax & Shipping Logic
        if (documentType === 'ticket') {
            setSubtotal(finalAmount);
            setTax(0);
            setTotal(finalAmount + shippingCost);
        } else {
            const divisor = 1 + (taxRate / 100);
            const base = finalAmount / divisor;
            setSubtotal(base);
            setTax(finalAmount - base);
            setTotal(finalAmount + shippingCost);
        }
    }, [cart, globalDiscountAmount, globalDiscountType, documentType, taxRate, shippingCost]);

    const addToCart = (product: any) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1, discount: 0, discountType: 'fixed' }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setCart(prev => prev.map(item =>
            item.id === productId ? { ...item, quantity } : item
        ));
    };

    const updateItemDiscount = (productId: string, discount: number, type: 'percent' | 'fixed') => {
        setCart(prev => prev.map(item =>
            item.id === productId ? { ...item, discount, discountType: type } : item
        ));
    };

    const clearCart = () => {
        setCart([]);
        setCustomer(null);
        setTransactionType('venta');
        setDocumentType('ticket');
        setGlobalDiscountAmount(0);
        setGlobalDiscountType('fixed');
        setCouponCode('');
        setShippingCost(0);
    };

    const saveTransaction = () => {
        if (cart.length === 0) return;

        const newTransaction: Transaction = {
            id: `TX-${Date.now()}`,
            date: new Date().toISOString(),
            type: transactionType,
            docType: documentType,
            customer,
            items: [...cart],
            subtotal,
            tax,
            discount: globalDiscountAmount, // and item discounts? maybe just global for history
            total,
            status: transactionType === 'venta' ? 'completada' : 'pendiente'
        };

        setHistory(prev => [newTransaction, ...prev].slice(0, 50));
        clearCart();
    };

    const loadQuote = (quoteId: string) => {
        const quote = history.find(tx => tx.id === quoteId && tx.type === 'cotizacion');
        if (quote) {
            setCart(quote.items);
            setCustomer(quote.customer);
            setTransactionType('venta');
            setDocumentType(quote.docType);
        }
    };

    return (
        <SalesContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            updateItemDiscount,
            clearCart,
            total,
            subtotal,
            tax,
            globalDiscount: globalDiscountAmount,
            customer,
            setCustomer,
            transactionType,
            setTransactionType,
            documentType,
            setDocumentType,
            globalDiscountAmount,
            setGlobalDiscountAmount,
            globalDiscountType,
            setGlobalDiscountType,
            couponCode,
            setCouponCode,
            history,
            saveTransaction,
            loadQuote,
            currency,
            taxName,
            taxRate,
            country,
            setCountry: handleSetCountry,
            shippingCost,
            setShippingCost
        }}>
            {children}
        </SalesContext.Provider>
    );
};

export const useSales = () => {
    const context = useContext(SalesContext);
    if (context === undefined) {
        throw new Error('useSales must be used within a SalesProvider');
    }
    return context;
};
