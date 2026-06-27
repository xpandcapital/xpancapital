"use client";

// Types ────────────────────────────────────────────────────────────────────────
import type { Customer, CartItem } from '@/context/SalesContext';
import type { Producto } from '@/lib/hooks/useProducts';
import type { PeruCustomerData } from '@/lib/peru-apis';
import type { EcuadorCustomerData } from '@/lib/ecuador-apis';

export interface POSProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number | undefined;
  discountPercentage: number;
  bliscoins: number;
  isBlisCoinsOnly: boolean;
  stock: number;
  status: string;
  image: string;
  description: string;
  currencyCode: string;
  isPerishable: boolean;
}

type CustomerSearchResult = PeruCustomerData | EcuadorCustomerData;

type WhatsAppStatusResult = { success: boolean; hasWhatsApp?: boolean };

interface POSReturnValue {
  cart: CartItem[];
  addToCart: (product: { id: string; name: string; price: number; image?: string; sku?: string; category?: string }) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateItemDiscount: (productId: string, discount: number, type: 'percent' | 'fixed') => void;
  clearCart: () => void;
  total: number;
  subtotal: number;
  tax: number;
  customer: Customer | null;
  setCustomer: React.Dispatch<React.SetStateAction<Customer | null>>;
  transactionType: 'venta' | 'cotizacion';
  setTransactionType: React.Dispatch<React.SetStateAction<'venta' | 'cotizacion'>>;
  documentType: 'ticket' | 'boleta' | 'factura';
  setDocumentType: React.Dispatch<React.SetStateAction<'ticket' | 'boleta' | 'factura'>>;
  history: import('@/context/SalesContext').Transaction[];
  saveTransaction: () => void;
  loadQuote: (quoteId: string) => void;
  globalDiscountAmount: number;
  setGlobalDiscountAmount: (v: number) => void;
  globalDiscountType: 'percent' | 'fixed';
  setGlobalDiscountType: (v: 'percent' | 'fixed') => void;
  couponCode: string;
  setCouponCode: (v: string) => void;
  shippingCost: number;
  setShippingCost: (v: number) => void;
  currency: string;
  taxName: string;
  taxRate: number;
  country: string;
  setCountry: (c: string) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  filteredSearchProducts: Producto[];
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (v: boolean) => void;
  view: 'pos' | 'history';
  setView: (v: 'pos' | 'history') => void;
  dniSearch: string;
  setDniSearch: (v: string) => void;
  isSearchingCustomer: boolean;
  isCustomerExpanded: boolean;
  setIsCustomerExpanded: (v: boolean) => void;
  repDniSearch: string;
  setRepDniSearch: (v: string) => void;
  isSearchingRep: boolean;
  paymentMethod: 'cash' | 'card' | 'bliscoins' | 'transfer';
  setPaymentMethod: (v: 'cash' | 'card' | 'bliscoins' | 'transfer') => void;
  receivedAmount: string;
  setReceivedAmount: (v: string) => void;
  isIssuingInvoice: boolean;
  setIsIssuingInvoice: (v: boolean) => void;
  invoiceResult: { success: boolean; msg: string; detail?: string } | null;
  setInvoiceResult: (v: { success: boolean; msg: string; detail?: string } | null) => void;
  emitElectronicInvoice: boolean;
  setEmitElectronicInvoice: (v: boolean) => void;
  handleQuickAdd: (p: Producto) => void;
  handleCustomerSearch: () => void;
  handleForceRefreshCustomer: () => void;
  handleRepSearch: () => void;
  updateCustomerFields: (fields: Partial<Customer>) => void;
  searchRef: React.RefObject<HTMLInputElement | null>;
  docLabels: { dni: string; ruc: string };
  products: Producto[];
}

interface POSErrorReturn {
  error: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Implementation
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSales } from '@/context/SalesContext';
import { fetchDniData, fetchRucData, fetchWhatsAppStatus as fetchWhatsAppPeru } from '@/lib/peru-apis';
import { fetchEcuadorData, mapCartToEcuadorInvoice, fetchWhatsAppStatus } from '@/lib/ecuador-apis';
import { stripHtml } from '@/lib/strip-html';
import { useProducts } from '@/lib/hooks/useProducts';

export function mapSupabaseToPosProduct(p: Producto): POSProduct {
    return {
        id: p.id,
        name: p.nombre,
        category: p.categoria?.nombre || 'General',
        price: p.precio_usd || 0,
        originalPrice: p.precio_usd ? p.precio_usd * 1.3 : undefined,
        discountPercentage: 0,
        bliscoins: p.precio_coins || 0,
        isBlisCoinsOnly: p.metodo_pago === 'coins',
        stock: p.stock_ilimitado ? 999 : p.stock,
        status: p.stock_ilimitado || p.stock > 0 ? 'Disponible' : 'Agotado',
        image: p.imagen_principal || '/images/blog-1.jpg',
        description: p.descripcion || '',
        currencyCode: 'USD',
        isPerishable: false
    };
}

export function usePOS(): POSReturnValue | POSErrorReturn {
    const salesContext = useSales();
    const { products: dbProducts, fetchProducts } = useProducts();

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const products = dbProducts || [];

    if (!salesContext) {
        return { error: 'SalesContext no disponible' };
    }

    const {
        cart, addToCart, removeFromCart, updateQuantity, updateItemDiscount,
        total, subtotal, tax, clearCart,
        customer, setCustomer, transactionType, setTransactionType,
        documentType, setDocumentType, history, saveTransaction, loadQuote,
        globalDiscountAmount, setGlobalDiscountAmount,
        globalDiscountType, setGlobalDiscountType,
        couponCode, setCouponCode,
        shippingCost, setShippingCost,
        currency, taxName, taxRate, country, setCountry
    } = salesContext;

    const docLabels = useMemo(() => ({
        dni: country === 'PE' ? 'DNI' : (country === 'MX' ? 'CURP' : (country === 'CO' || country === 'EC' ? 'Cédula' : (country === 'CL' ? 'RUT' : 'ID Personal'))),
        ruc: country === 'PE' ? 'RUC' : (country === 'MX' ? 'RFC' : (country === 'CO' ? 'NIT' : (country === 'CL' || country === 'EC' ? 'RUC' : 'ID Fiscal'))),
    }), [country]);

    const [searchQuery, setSearchQuery] = useState('');
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [view, setView] = useState<'pos' | 'history'>('pos');
    const [dniSearch, setDniSearch] = useState('');
    const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
    const [isCustomerExpanded, setIsCustomerExpanded] = useState(false);

    const [repDniSearch, setRepDniSearch] = useState('');
    const [isSearchingRep, setIsSearchingRep] = useState(false);

    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'bliscoins' | 'transfer'>('cash');
    const [receivedAmount, setReceivedAmount] = useState<string>('');
    const [isIssuingInvoice, setIsIssuingInvoice] = useState(false);
    const [invoiceResult, setInvoiceResult] = useState<{ success: boolean; msg: string; detail?: string } | null>(null);
    const [emitElectronicInvoice, setEmitElectronicInvoice] = useState(false);

    const searchRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        if (view === 'pos') searchRef.current?.focus();
    }, [view]);

    const filteredSearchProducts = useMemo(() =>
        (products || []).filter((p: Producto) =>
            (p?.nombre || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p?.id || "").toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 5),
        [products, searchQuery]
    );

    const handleQuickAdd = (p: Producto) => {
        addToCart({
            id: p.id,
            name: stripHtml(p.nombre),
            price: p.precio_usd || 0,
            image: p.imagen_principal || '/images/placeholder-product.jpg',
            sku: p.id,
            category: p.categoria?.nombre
        });
        setSearchQuery('');
        searchRef.current?.focus();
    };

    const updateCustomerFields = (fields: Partial<Customer>) => {
        setCustomer(prev => {
            const updated: Customer = prev
                ? { ...prev, ...fields }
                : { id: '0', name: '', type: 'natural', ...fields };
            if (updated.id && updated.id !== '0') {
                const cache = JSON.parse(localStorage.getItem('blis_customers_cache') || '{}') as Record<string, Customer>;
                cache[updated.id] = updated;
                localStorage.setItem('blis_customers_cache', JSON.stringify(cache));
            }
            return updated;
        });
    };

    const handleCustomerSearch = async () => {
        if (!dniSearch) return;
        setIsSearchingCustomer(true);

        const isPeru = country === 'PE';
        const isEcuador = country === 'EC';

        const isRuc = isPeru ? dniSearch.length === 11 : (isEcuador ? dniSearch.length === 13 : false);
        const isDni = isPeru ? dniSearch.length === 8 : (isEcuador ? dniSearch.length === 10 : false);

        try {
            const savedCustomers = JSON.parse(localStorage.getItem('blis_customers_cache') || '{}') as Record<string, Customer>;
            const cached = savedCustomers[dniSearch];

            if (cached && cached.name) {
                const needsEssentialData = isRuc ? !cached.lastUpdate : (isDni ? (!cached.birthDate || cached.address === undefined) : false);
                if (!needsEssentialData) {
                    setCustomer(cached);
                    setIsSearchingCustomer(false);
                    return;
                }
            }
        } catch (e) {
            console.error('Error reading cache', e);
        }

        try {
            let result: CustomerSearchResult;
            if (isPeru) {
                result = await (isRuc ? fetchRucData(dniSearch) : fetchDniData(dniSearch));
            } else if (isEcuador) {
                result = await fetchEcuadorData(dniSearch);
            } else {
                setIsSearchingCustomer(false);
                return;
            }

            if (result.success) {
                const savedCustomers = JSON.parse(localStorage.getItem('blis_customers_cache') || '{}') as Record<string, Customer>;
                const cached = savedCustomers[dniSearch] || {} as Partial<Customer>;

                let mappedBirthDate = result.birthDate || cached.birthDate;
                if (mappedBirthDate && mappedBirthDate.includes('-')) {
                    const [y, m, d] = mappedBirthDate.split('-');
                    mappedBirthDate = `${d}/${m}/${y}`;
                }

                const newCustomer: Customer = {
                    ...(cached || {}),
                    id: dniSearch,
                    name: result.name,
                    type: result.type,
                    address: result.address || cached.address || "",
                    houseNumber: 'houseNumber' in result ? result.houseNumber || cached.houseNumber : cached.houseNumber,
                    department: result.department || cached.department,
                    province: result.province || cached.province,
                    district: result.district || cached.district,
                    country: (result as any).country || cached.country || (isPeru ? 'PERÚ' : 'ECUADOR'),
                    status: result.status || cached.status,
                    condition: result.condition || cached.condition,
                    birthDate: mappedBirthDate,
                    lastUpdate: (result as any).lastUpdate || cached.lastUpdate,
                    gender: 'gender' in result ? result.gender || cached.gender : cached.gender,
                    nationality: 'nationality' in result ? result.nationality || cached.nationality : cached.nationality,
                    bloodType: 'bloodType' in result ? result.bloodType || cached.bloodType : cached.bloodType,
                    maritalStatus: result.maritalStatus || cached.maritalStatus,
                    spouseName: 'spouseName' in result ? result.spouseName || cached.spouseName : cached.spouseName,
                    motherName: 'motherName' in result ? result.motherName || cached.motherName : cached.motherName,
                    fatherName: 'fatherName' in result ? result.fatherName || cached.fatherName : cached.fatherName,
                    birthPlace: 'birthPlace' in result ? result.birthPlace || cached.birthPlace : cached.birthPlace,
                    education: result.education || cached.education,
                    profession: 'profession' in result ? result.profession || cached.profession : cached.profession,
                    conditionCedulado: 'conditionCedulado' in result ? result.conditionCedulado || cached.conditionCedulado : cached.conditionCedulado,
                    cedulaDate: 'cedulaDate' in result ? result.cedulaDate || cached.cedulaDate : cached.cedulaDate,
                    deathDate: 'deathDate' in result ? result.deathDate || cached.deathDate : cached.deathDate,
                    disability: 'disability' in result ? result.disability || cached.disability : cached.disability,
                    disabilityType: 'disabilityType' in result ? result.disabilityType || cached.disabilityType : cached.disabilityType,
                    disabilityPct: 'disabilityPct' in result ? result.disabilityPct || cached.disabilityPct : cached.disabilityPct,
                    conadisCard: 'conadisCard' in result ? result.conadisCard || cached.conadisCard : cached.conadisCard,
                    licencia: 'licencia' in result ? result.licencia || cached.licencia : cached.licencia,
                };

                setCustomer({ ...newCustomer, lastUpdate: new Date().toISOString() });

                try {
                    savedCustomers[dniSearch] = { ...newCustomer, lastUpdate: new Date().toISOString() };
                    localStorage.setItem('blis_customers_cache', JSON.stringify(savedCustomers));
                } catch (e) {
                    console.error('Error saving cache', e);
                }

                const phone = (result as any).cellphone || (result as any).phone;
                if (phone) {
                    const checker = isPeru ? fetchWhatsAppPeru : fetchWhatsAppStatus;
                    checker(phone).then((r: WhatsAppStatusResult) => {
                        if (r.success && r.hasWhatsApp !== undefined) {
                            updateCustomerFields({ hasWhatsApp: r.hasWhatsApp });
                        }
                    }).catch(() => {});
                }

                setIsCustomerExpanded(false);
            } else {
                if (result.message && (result.message.includes('Token incorrecto') || result.message.includes('saldo') || result.message.includes('Token') || result.message.includes('API'))) {
                    alert(`🚨 ERROR DE CONEXIÓN CON EL RUC:\n\n${result.message}\n\nRevisa el panel "APIs & Cloud" o recarga tu saldo.`);
                } else {
                    alert(result.message || 'No se encontró información');
                }
            }
        } catch (error) {
            console.error('Error searching customer:', error);
            alert('Error en la conexión con el servicio de datos externos. Puede que el proveedor esté caído o sin saldo.');
        } finally {
            setIsSearchingCustomer(false);
        }
    };

    const handleForceRefreshCustomer = async () => {
        if (!customer || !customer.id || customer.id === '0') return;

        try {
            const savedCustomers = JSON.parse(localStorage.getItem('blis_customers_cache') || '{}') as Record<string, Customer>;
            delete savedCustomers[customer.id];
            localStorage.setItem('blis_customers_cache', JSON.stringify(savedCustomers));
        } catch { /* ignore */ }

        const originalDni = dniSearch;
        setDniSearch(customer.id);
        await handleCustomerSearch();
        setDniSearch(originalDni);
    };

    const handleRepSearch = async () => {
        if (!repDniSearch) return;
        setIsSearchingRep(true);

        const isPeru = country === 'PE';
        const isEcuador = country === 'EC';

        try {
            const savedCustomers = JSON.parse(localStorage.getItem('blis_customers_cache') || '{}') as Record<string, { name: string; birthDate?: string; type?: string }>;
            const cached = savedCustomers[repDniSearch];
            if (cached && cached.name && cached.birthDate) {
                updateCustomerFields({
                    representative: {
                        id: repDniSearch,
                        name: cached.name,
                        birthDate: cached.birthDate
                    }
                });
                setIsSearchingRep(false);
                return;
            }
        } catch { /* ignore */ }

        try {
            let result: CustomerSearchResult;
            if (isPeru) {
                result = await fetchDniData(repDniSearch);
            } else if (isEcuador) {
                result = await fetchEcuadorData(repDniSearch);
            } else {
                setIsSearchingRep(false);
                return;
            }

            if (result.success) {
                let mappedBirthDate = result.birthDate;
                if (mappedBirthDate && mappedBirthDate.includes('-')) {
                    const [y, m, d] = mappedBirthDate.split('-');
                    mappedBirthDate = `${d}/${m}/${y}`;
                }

                const repData = {
                    id: repDniSearch,
                    name: result.name,
                    birthDate: mappedBirthDate
                };
                updateCustomerFields({ representative: repData });

                try {
                    const cache = JSON.parse(localStorage.getItem('blis_customers_cache') || '{}') as Record<string, { name: string; birthDate?: string; type?: string; country?: string }>;
                    cache[repDniSearch] = { ...repData, type: 'natural', country: isPeru ? 'PERÚ' : 'ECUADOR' };
                    localStorage.setItem('blis_customers_cache', JSON.stringify(cache));
                } catch { /* ignore */ }
            } else {
                alert(`No se encontró el documento (${docLabels.dni}) del representante`);
            }
        } catch {
            alert('Error consultando representante');
        } finally {
            setIsSearchingRep(false);
        }
    };

    return {
        cart, addToCart, removeFromCart, updateQuantity, updateItemDiscount, clearCart,
        total, subtotal, tax,
        customer, setCustomer, transactionType, setTransactionType,
        documentType, setDocumentType, history, saveTransaction, loadQuote,
        globalDiscountAmount, setGlobalDiscountAmount,
        globalDiscountType, setGlobalDiscountType,
        couponCode, setCouponCode, shippingCost, setShippingCost,
        currency, taxName, taxRate, country, setCountry,

        searchQuery, setSearchQuery,
        filteredSearchProducts,
        isCheckoutOpen, setIsCheckoutOpen,
        view, setView,
        dniSearch, setDniSearch,
        isSearchingCustomer,
        isCustomerExpanded, setIsCustomerExpanded,
        repDniSearch, setRepDniSearch,
        isSearchingRep,
        paymentMethod, setPaymentMethod,
        receivedAmount, setReceivedAmount,
        isIssuingInvoice, setIsIssuingInvoice,
        invoiceResult, setInvoiceResult,
        emitElectronicInvoice, setEmitElectronicInvoice,

        handleQuickAdd,
        handleCustomerSearch,
        handleForceRefreshCustomer,
        handleRepSearch,
        updateCustomerFields,

        searchRef,

        docLabels,

        products,
    };
}
