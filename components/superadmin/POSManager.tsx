"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, AlertCircle,
    Search, Plus, Minus, Trash2, ShoppingCart, User, CreditCard,
    Banknote, Coins, X, CheckCircle2, ChevronRight, Filter,
    FileText, Receipt, History, TrendingUp, Package, Users,
    ScanLine, ArrowRightLeft, Save, Printer, Edit3, ClipboardList,
    Calendar, ChevronLeft, Percent, Tag, Ticket, MessageSquare, Truck, MapPin,
    ShieldCheck
} from 'lucide-react';
import { useSales } from '@/context/SalesContext';
import { fetchDniData, fetchRucData } from '@/lib/peru-apis';
import { fetchEcuadorData, mapCartToEcuadorInvoice } from '@/lib/ecuador-apis';
import { stripHtml } from '@/lib/strip-html';
import { POSAIUpsell } from './POSAIUpsell';
import { useProducts, Producto } from '@/lib/hooks/useProducts';

// Re-map the Supabase product so POS works without major refactoring
function mapSupabaseToPosProduct(p: Producto) {
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

const formatDateInput = (value: string) => {
    const digits = value.replace(/\D/g, '');
    let formatted = digits;
    if (digits.length > 2) formatted = digits.substring(0, 2) + '/' + digits.substring(2);
    if (digits.length > 4) formatted = formatted.substring(0, 5) + '/' + digits.substring(4, 8);
    return formatted.substring(0, 10);
};

const calculateAge = (birthDate: string | undefined): string => {
    if (!birthDate) return '---';
    const parts = birthDate.split('/');
    if (parts.length !== 3) return '---';
    const [d, m, y] = parts;
    const birth = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    if (isNaN(birth.getTime())) return '---';
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age.toString() + ' AÑOS';
};

// --- Custom Date Picker Component ---
const CustomDatePicker = ({ value, onChange, label }: { value: string, onChange: (val: string) => void, label: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const [viewDate, setViewDate] = useState(() => {
        if (value && value.includes('/')) {
            const [d, m, y] = value.split('/');
            return new Date(parseInt(y), parseInt(m) - 1, 1);
        }
        return new Date();
    });

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    const handlePrevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    const handleNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setViewDate(new Date(parseInt(e.target.value), viewDate.getMonth(), 1));
    };

    const selectDate = (day: number) => {
        const d = day.toString().padStart(2, '0');
        const m = (viewDate.getMonth() + 1).toString().padStart(2, '0');
        const y = viewDate.getFullYear();
        onChange(`${d}/${m}/${y}`);
        setIsOpen(false);
    };

    const years = [];
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= 1940; i--) years.push(i);

    return (
        <div className="space-y-1 relative" ref={containerRef}>
            <div className="text-[8px] text-gray-600 font-black uppercase tracking-widest">{label}</div>
            <div className="relative group">
                <input
                    type="text"
                    className="w-full bg-black/40 border border-white/5 p-2.5 rounded-xl text-[9px] font-black outline-none focus:border-blis-red/50 transition-all pr-10"
                    value={value}
                    onChange={(e) => onChange(formatDateInput(e.target.value))}
                    placeholder="DD/MM/AAAA"
                />
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-blis-red transition-colors"
                >
                    <Calendar className="w-3.5 h-3.5" />
                </button>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute bottom-full mb-4 left-0 right-0 z-[1000] bg-zinc-950 border border-white/10 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.8)] p-4"
                        style={{ minWidth: '240px' }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <button onClick={handlePrevMonth} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                            <div className="flex gap-2 items-center">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white">{months[viewDate.getMonth()]}</span>
                                <select
                                    className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none text-blis-red cursor-pointer"
                                    value={viewDate.getFullYear()}
                                    onChange={handleYearChange}
                                >
                                    {years.map(y => <option key={y} value={y} className="bg-zinc-950 text-white">{y}</option>)}
                                </select>
                            </div>
                            <button onClick={handleNextMonth} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"><ChevronRight className="w-4 h-4" /></button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 text-center mb-3">
                            {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d, i) => (
                                <span key={`${d}-${i}`} className="text-[8px] font-black text-gray-600 uppercase">{d}</span>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: firstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth()) }).map((_, i) => (
                                <div key={`empty-${i}`} />
                            ))}
                            {Array.from({ length: daysInMonth(viewDate.getFullYear(), viewDate.getMonth()) }).map((_, i) => {
                                const day = i + 1;
                                const isSelected = value === `${day.toString().padStart(2, '0')}/${(viewDate.getMonth() + 1).toString().padStart(2, '0')}/${viewDate.getFullYear()}`;
                                return (
                                    <button
                                        key={day}
                                        onClick={() => selectDate(day)}
                                        className={`p-2 text-[9px] font-black rounded-lg transition-all hover:bg-blis-red/20 ${isSelected ? 'bg-blis-red text-white shadow-lg shadow-blis-red/20' : 'text-gray-400'}`}
                                    >
                                        {day}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const POSManager = () => {
    const salesContext = useSales();
    const { products: dbProducts, fetchProducts } = useProducts();

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const products = dbProducts || [];

    // Safety guard for context
    if (!salesContext) {
        return <div className="p-10 text-center font-black uppercase text-blis-red">Error: SalesContext no disponible</div>;
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

    const docLabels = {
        dni: country === 'PE' ? 'DNI' : (country === 'MX' ? 'CURP' : (country === 'CO' || country === 'EC' ? 'Cédula' : (country === 'CL' ? 'RUT' : 'ID Personal'))),
        ruc: country === 'PE' ? 'RUC' : (country === 'MX' ? 'RFC' : (country === 'CO' ? 'NIT' : (country === 'CL' || country === 'EC' ? 'RUC' : 'ID Fiscal'))),
    };

    useEffect(() => {
        const override = typeof window !== 'undefined' ? localStorage.getItem('blis_pos_country') : null
        if (!override && country === 'EC') {
            setCountry('PE')
        }
    }, [country, setCountry]);

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
    const [emitSunat, setEmitSunat] = useState(false);
    const [isIssuingInvoice, setIsIssuingInvoice] = useState(false);
    const [invoiceResult, setInvoiceResult] = useState<{ success: boolean; msg: string; detail?: string } | null>(null);
    const [emitElectronicInvoice, setEmitElectronicInvoice] = useState(false);

    // Focus search bar on mount/reset
    const searchRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        if (view === 'pos') searchRef.current?.focus();
    }, [view]);

    const filteredSearchProducts = (products || []).filter((p: any) =>
        (p?.nombre || p?.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p?.id || "").toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);

    const handleQuickAdd = (p: any) => {
        addToCart({
            id: p.id,
            name: stripHtml(p.nombre || p.title),
            price: p.precio_usd || p.price,
            image: p.imagen_principal || p.image || '/images/placeholder-product.jpg',
            sku: p.id,
            category: p.categoria?.nombre || p.category
        });
        setSearchQuery('');
        searchRef.current?.focus();
    };

    const handleCustomerSearch = async () => {
        if (!dniSearch) return;
        setIsSearchingCustomer(true);

        const isPeru = country === 'PE';
        const isEcuador = country === 'EC';

        const isRuc = isPeru ? dniSearch.length === 11 : (isEcuador ? dniSearch.length === 13 : false);
        const isDni = isPeru ? dniSearch.length === 8 : (isEcuador ? dniSearch.length === 10 : false);

        try {
            const savedCustomers = JSON.parse(localStorage.getItem('blis_customers_cache') || '{}');
            const cached = savedCustomers[dniSearch];

            if (cached && cached.name) {
                // Si la caché no tiene la data completa (ej: la cargamos parcialmente como representante), forzamos consulta
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
            let result: any;
            if (isPeru) {
                result = await (isRuc ? fetchRucData(dniSearch) : fetchDniData(dniSearch));
            } else if (isEcuador) {
                result = await fetchEcuadorData(dniSearch);
            } else {
                setIsSearchingCustomer(false);
                return;
            }

            if (result.success) {
                const savedCustomers = JSON.parse(localStorage.getItem('blis_customers_cache') || '{}');
                const cached = savedCustomers[dniSearch] || {};

                let mappedBirthDate = result.birthDate || cached.birthDate;
                if (mappedBirthDate && mappedBirthDate.includes('-')) {
                    const [y, m, d] = mappedBirthDate.split('-');
                    mappedBirthDate = `${d}/${m}/${y}`;
                }

                const newCustomer = {
                    ...cached,
                    id: dniSearch,
                    name: result.name,
                    type: result.type,
                    address: result.address || cached.address || "",
                    houseNumber: result.houseNumber || cached.houseNumber,
                    department: result.department || cached.department,
                    province: result.province || cached.province,
                    district: result.district || cached.district,
                    country: result.country || cached.country || (isPeru ? 'PERÚ' : 'ECUADOR'),
                    status: result.status || cached.status,
                    condition: result.condition || cached.condition,
                    birthDate: mappedBirthDate,
                    lastUpdate: result.lastUpdate || cached.lastUpdate,
                    // Extended Ecuador fields
                    gender: result.gender || cached.gender,
                    nationality: result.nationality || cached.nationality,
                    bloodType: result.bloodType || cached.bloodType,
                    maritalStatus: result.maritalStatus || cached.maritalStatus,
                    spouseName: result.spouseName || cached.spouseName,
                    motherName: result.motherName || cached.motherName,
                    fatherName: result.fatherName || cached.fatherName,
                    birthPlace: result.birthPlace || cached.birthPlace,
                    education: result.education || cached.education,
                    profession: result.profession || cached.profession,
                    conditionCedulado: result.conditionCedulado || cached.conditionCedulado,
                    cedulaDate: result.cedulaDate || cached.cedulaDate,
                    deathDate: result.deathDate || cached.deathDate,
                    // Disability
                    disability: result.disability || cached.disability,
                    disabilityType: result.disabilityType || cached.disabilityType,
                    disabilityPct: result.disabilityPct || cached.disabilityPct,
                    conadisCard: result.conadisCard || cached.conadisCard,
                    // Driver license
                    licencia: result.licencia || cached.licencia,
                };

                setCustomer({ ...newCustomer, lastUpdate: new Date().toISOString() } as any);

                try {
                    savedCustomers[dniSearch] = { ...newCustomer, lastUpdate: new Date().toISOString() };
                    localStorage.setItem('blis_customers_cache', JSON.stringify(savedCustomers));
                } catch (e) {
                    console.error('Error saving cache', e);
                }

                // Colapsar vista al encontrar
                setIsCustomerExpanded(false);
            } else {
                if (result.message && (result.message.includes('Token incorrecto') || result.message.includes('saldo') || result.message.includes('Token') || result.message.includes('API'))) {
                    // Notificación especial si parece un error de saldo/token
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

        // Remove from cache to force HTTP fetch
        try {
            const savedCustomers = JSON.parse(localStorage.getItem('blis_customers_cache') || '{}');
            delete savedCustomers[customer.id];
            localStorage.setItem('blis_customers_cache', JSON.stringify(savedCustomers));
        } catch (e) { }

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
            const savedCustomers = JSON.parse(localStorage.getItem('blis_customers_cache') || '{}');
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
        } catch (e) { }

        try {
            let result: any;
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
                    const cache = JSON.parse(localStorage.getItem('blis_customers_cache') || '{}');
                    cache[repDniSearch] = { ...repData, type: 'natural', country: isPeru ? 'PERÚ' : 'ECUADOR' };
                    localStorage.setItem('blis_customers_cache', JSON.stringify(cache));
                } catch (e) { }
            } else {
                alert(`No se encontró el documento (${docLabels.dni}) del representante`);
            }
        } catch (error) {
            alert('Error consultando representante');
        } finally {
            setIsSearchingRep(false);
        }
    };

    const updateCustomerFields = (fields: any) => {
        setCustomer(prev => {
            const updated = prev ? { ...prev, ...fields } : { id: '0', name: '', type: 'natural', ...fields };
            if (updated.id && updated.id !== '0') {
                const cache = JSON.parse(localStorage.getItem('blis_customers_cache') || '{}');
                cache[updated.id] = updated;
                localStorage.setItem('blis_customers_cache', JSON.stringify(cache));
            }
            return updated as any;
        });
    };

    return (
        <>
            <div className="flex flex-col lg:flex-row lg:h-full flex-1 w-full lg:overflow-hidden bg-black text-white font-sans">
                <div className="w-full lg:flex-1 flex flex-col border-r border-white/5 lg:overflow-hidden h-auto lg:h-full">
                    <div className="flex items-center justify-between p-4 lg:p-6 border-b border-white/5 bg-zinc-950/20">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em]">Terminal Activa</span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setView('pos')}
                                className={`px-6 py-3 rounded-2xl transition-all flex items-center gap-3 ${view === 'pos' ? 'bg-blis-red text-white shadow-lg shadow-blis-red/20' : 'bg-zinc-900 text-gray-400 hover:bg-zinc-800'}`}
                            >
                                <ShoppingCart className="w-4 h-4" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Terminal</span>
                            </button>
                            <button
                                onClick={() => setView('history')}
                                className={`px-6 py-3 rounded-2xl transition-all flex items-center gap-3 ${view === 'history' ? 'bg-blis-red text-white shadow-lg shadow-blis-red/20' : 'bg-zinc-900 text-gray-400 hover:bg-zinc-800'}`}
                            >
                                <History className="w-4 h-4" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Reportes</span>
                            </button>
                        </div>
                    </div>

                    {view === 'pos' ? (
                        <div className="lg:flex-1 flex flex-col p-4 lg:p-6 space-y-4 lg:space-y-6 lg:overflow-hidden h-auto lg:h-full">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex bg-zinc-900/50 p-1 rounded-xl lg:rounded-2xl border border-white/5 h-10 lg:h-14">
                                    <button
                                        onClick={() => setTransactionType('venta')}
                                        className={`px-4 lg:px-8 rounded-lg lg:rounded-xl text-[8px] lg:text-[10px] font-black uppercase tracking-widest transition-all ${transactionType === 'venta' ? 'bg-zinc-800 text-white shadow-xl' : 'text-gray-500 hover:text-white'}`}
                                    >
                                        VENTA
                                    </button>
                                    <button
                                        onClick={() => setTransactionType('cotizacion')}
                                        className={`px-4 lg:px-8 rounded-lg lg:rounded-xl text-[8px] lg:text-[10px] font-black uppercase tracking-widest transition-all ${transactionType === 'cotizacion' ? 'bg-zinc-800 text-white shadow-xl' : 'text-gray-500 hover:text-white'}`}
                                    >
                                        COTIZA
                                    </button>
                                </div>

                                <div className="flex gap-2">
                                    {['ticket', 'boleta', 'factura'].map(doc => (
                                        <button
                                            key={doc}
                                            onClick={() => setDocumentType(doc as any)}
                                            className={`px-3 lg:px-6 py-2 lg:py-4 rounded-xl lg:rounded-2xl text-[8px] lg:text-[10px] font-black uppercase tracking-widest border transition-all ${documentType === doc
                                                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500'
                                                : 'bg-zinc-900/50 border-white/5 text-gray-500 hover:border-white/20'}`}
                                        >
                                            {doc}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col lg:flex-row gap-4 lg:items-center relative z-[100]">
                                <div className="flex-1 flex items-center gap-2 lg:gap-4 bg-zinc-950 border-2 border-white/5 rounded-2xl lg:rounded-[2rem] p-2 lg:p-3 focus-within:border-blis-red/50 transition-all shadow-2xl">
                                    <div className="w-8 h-8 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-zinc-900 flex items-center justify-center shrink-0">
                                        <ScanLine className="w-4 h-4 lg:w-6 lg:h-6 text-blis-red" />
                                    </div>
                                    <input
                                        ref={searchRef}
                                        type="text"
                                        placeholder="ESCANEE O BUSQUE..."
                                        className="flex-1 bg-transparent text-sm lg:text-lg font-black uppercase tracking-tighter outline-none placeholder:text-zinc-900"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <div className="hidden sm:block px-5 py-2 rounded-xl bg-zinc-900/50 text-[9px] font-black text-gray-500 uppercase tracking-widest border border-white/5">
                                        F1 - BUSCAR
                                    </div>
                                </div>

                                <div className="bg-emerald-600 px-6 lg:px-10 py-2 lg:py-3 rounded-2xl lg:rounded-[2rem] shadow-[0_15px_30px_rgba(5,150,105,0.3)] border border-white/10 shrink-0 flex flex-col items-center justify-center">
                                    <div className="text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-0.5">Total {transactionType}</div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-sm lg:text-xl font-black text-white/60">{currency}</span>
                                        <span className="text-2xl lg:text-5xl font-black text-white tracking-tighter leading-none">{(total || 0).toLocaleString()}</span>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {searchQuery && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute top-full left-0 right-0 lg:left-4 lg:right-[220px] mt-2 bg-zinc-900 border border-white/10 rounded-2xl lg:rounded-[2.5rem] shadow-3xl overflow-hidden z-[110]"
                                        >
                                            {(filteredSearchProducts || []).length > 0 ? (
                                                filteredSearchProducts.map((p: any) => (
                                                    <button
                                                        key={p.id}
                                                        onClick={() => handleQuickAdd(p)}
                                                        className="w-full flex items-center gap-6 p-5 hover:bg-white/[0.03] text-left border-b border-white/[0.02] last:border-0 group transition-all"
                                                    >
                                                        <div className="w-14 h-14 bg-black rounded-xl overflow-hidden shrink-0">
                                                            <img src={p.imagen_principal || p.image || '/images/placeholder-product.jpg'} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="text-[11px] font-black uppercase tracking-tighter mb-1">{stripHtml(p.nombre || p.title)}</div>
                                                            <div className="flex gap-4">
                                                                <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">SKU: {p.id.substring(0, 8)}</span>
                                                            </div>
                                                        </div>
                                                        <div className="text-xl font-black mr-4">{currency}{(p.precio_usd || p.price || 0).toLocaleString()}</div>
                                                        <Plus className="w-5 h-5 text-blis-red opacity-0 group-hover:opacity-100 transition-all mr-2" />
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="p-10 text-center text-gray-500 font-bold uppercase tracking-widest text-[10px]">Sin resultados</div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="lg:flex-1 lg:overflow-y-auto h-auto lg:h-full bg-zinc-900/20 rounded-[2.5rem] border border-white/5 flex flex-col scrollbar-thin scrollbar-thumb-white/5">
                                <div className="p-8 pb-4 flex items-center justify-between sticky top-0 bg-black/40 backdrop-blur-md z-10 border-b border-white/5">
                                    <div className="grid grid-cols-12 w-full gap-2 lg:gap-4 text-[7px] lg:text-[10px] font-black text-gray-600 uppercase tracking-widest">
                                        <div className="col-span-1">#</div>
                                        <div className="col-span-4">Descripción</div>
                                        <div className="col-span-2 text-center">Cant.</div>
                                        <div className="col-span-3 text-center">Dscto.</div>
                                        <div className="col-span-2 text-right">Sub.</div>
                                    </div>
                                </div>

                                <div className="flex-1 p-4 pt-2 space-y-1.5 flex flex-col">
                                    {(cart || []).length === 0 ? (
                                        <div className="flex-1 flex flex-col items-center justify-center opacity-10 py-12">
                                            <Package className="w-16 h-16 mb-4" />
                                            <h3 className="text-xs font-black uppercase tracking-[0.4em]">Terminal Lista</h3>
                                            <p className="text-[9px] font-bold uppercase mt-1">Agregue productos para iniciar</p>
                                        </div>
                                    ) : (
                                        cart.map((item, idx) => (
                                            <motion.div
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                key={item.id}
                                                className="grid grid-cols-12 w-full gap-3 items-center bg-black/20 p-3 rounded-2xl border border-white/[0.02] hover:border-white/5 transition-all group"
                                            >
                                                <div className="col-span-1 font-black text-zinc-800 text-[10px]">{idx + 1}</div>
                                                <div className="col-span-4 flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-black rounded-lg overflow-hidden shrink-0">
                                                        {item.image && <img src={item.image} className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all" />}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-[10px] font-black uppercase tracking-tighter truncate leading-tight mb-0.5">{stripHtml(item.name)}</div>
                                                        <div className="text-[8px] font-bold text-gray-600 uppercase tracking-widest leading-none">${(item.price || 0).toLocaleString()}</div>
                                                    </div>
                                                </div>
                                                <div className="col-span-2 flex justify-center">
                                                    <div className="flex items-center gap-2.5 bg-black/40 px-2.5 py-1 rounded-lg border border-white/5">
                                                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="hover:text-blis-red transition-colors"><Minus className="w-2.5 h-2.5" /></button>
                                                        <span className="text-[10px] font-black min-w-[16px] text-center">{item.quantity}</span>
                                                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="hover:text-blis-red transition-colors"><Plus className="w-2.5 h-2.5" /></button>
                                                    </div>
                                                </div>
                                                <div className="col-span-3 flex justify-center gap-1.5">
                                                    <div className="flex bg-black/40 rounded-lg border border-white/5 overflow-hidden">
                                                        <button
                                                            onClick={() => updateItemDiscount(item.id, item.discount || 0, 'percent')}
                                                            className={`p-1.5 ${item.discountType === 'percent' ? 'bg-blis-red/20 text-blis-red' : 'text-gray-600'}`}
                                                        >
                                                            <Percent className="w-2.5 h-2.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => updateItemDiscount(item.id, item.discount || 0, 'fixed')}
                                                            className={`p-1.5 ${item.discountType === 'fixed' ? 'bg-blis-red/20 text-blis-red' : 'text-gray-600'}`}
                                                        >
                                                            <Banknote className="w-2.5 h-2.5" />
                                                        </button>
                                                    </div>
                                                    <input
                                                        type="number"
                                                        value={item.discount || ''}
                                                        placeholder="0"
                                                        onChange={(e) => updateItemDiscount(item.id, parseFloat(e.target.value) || 0, item.discountType || 'fixed')}
                                                        className="w-14 bg-black/40 border border-white/5 rounded-lg text-[10px] font-black text-center outline-none focus:border-blis-red/30"
                                                    />
                                                </div>
                                                <div className="col-span-2 text-right font-black text-[11px] flex items-center justify-end gap-2 pr-1">
                                                    <div className="flex flex-col items-end">
                                                        {item.discount && item.discount > 0 && (
                                                            <span className="text-[7px] text-blis-red line-through decoration-blis-red/40">{currency}{(item.price * item.quantity).toLocaleString()}</span>
                                                        )}
                                                        <span>{currency}{((item.price * item.quantity) - (item.discountType === 'percent' ? (item.price * item.quantity * (item.discount || 0) / 100) : (item.discount || 0))).toLocaleString()}</span>
                                                    </div>
                                                    <button onClick={() => removeFromCart(item.id)} className="p-1.5 opacity-0 group-hover:opacity-100 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col p-8 space-y-8 overflow-y-auto">
                            <h2 className="text-3xl font-black uppercase tracking-tighter">Historial de Actividad</h2>
                            <div className="space-y-4">
                                {(history || []).map(tx => (
                                    <div key={tx.id} className="bg-zinc-900/30 border border-white/5 p-8 rounded-[2.5rem] flex items-center justify-between group hover:bg-zinc-900/50 transition-all">
                                        <div className="flex items-center gap-6">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${tx.type === 'venta' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                {tx.type === 'venta' ? <CheckCircle2 className="w-7 h-7" /> : <ClipboardList className="w-7 h-7" />}
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-1">{(tx.date || "").split('T')[0]} - {tx.id}</div>
                                                <div className="text-lg font-black uppercase tracking-tighter">{stripHtml(tx.customer?.name) || 'Venta de Pasillo'}</div>
                                                <div className="flex gap-4 mt-1">
                                                    <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${tx.type === 'venta' ? 'bg-emerald-500 text-black' : 'bg-amber-500 text-black'}`}>{tx.type}</span>
                                                    <span className="text-[9px] font-black uppercase border border-white/10 px-3 py-1 rounded-full text-gray-400">{tx.docType}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-black mb-2">{currency}{(tx.total || 0).toLocaleString()}</div>
                                            {tx.type === 'cotizacion' && (
                                                <button
                                                    onClick={() => {
                                                        loadQuote(tx.id);
                                                        setView('pos');
                                                    }}
                                                    className="text-[10px] font-black text-blis-red uppercase tracking-widest hover:underline flex items-center gap-2"
                                                >
                                                    CONVERTIR A VENTA <ArrowRightLeft className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="w-full lg:w-[480px] flex flex-col bg-zinc-950 p-6 lg:p-8 space-y-6 relative h-auto lg:h-full lg:overflow-y-auto scrollbar-thin scrollbar-thumb-white/5 border-t lg:border-t-0 lg:border-l border-white/5">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-500">Documento & Cliente</h2>
                        <div className="px-3 py-1 bg-blis-red/20 text-blis-red rounded-full text-[8px] font-black uppercase tracking-widest">
                            Sesión: Admin
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div className="space-y-2">
                            <div className="flex items-end justify-between ml-1">
                                <label className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Documento ({docLabels.dni} / {docLabels.ruc})</label>
                                {dniSearch.length > 0 && (
                                    <span className={`text-[9px] font-black tracking-widest ${dniSearch.length === (country === 'EC' ? (dniSearch.length > 10 ? 13 : 10) : (dniSearch.length > 8 ? 11 : 8))
                                        ? 'text-emerald-500'
                                        : (dniSearch.length > (country === 'EC' ? 13 : 11) ? 'text-rose-500' : 'text-amber-500')
                                        }`}>
                                        {dniSearch.length} / {country === 'EC' ? (dniSearch.length > 10 ? 13 : 10) : (dniSearch.length > 8 ? 11 : 8)}
                                    </span>
                                )}
                            </div>
                            <div className="relative group">
                                <input
                                    type="text"
                                    className={`w-full bg-black/60 border-2 p-5 rounded-3xl font-black text-lg outline-none transition-all placeholder:text-zinc-900 ${dniSearch.length > 0 && dniSearch.length !== (country === 'EC' ? (dniSearch.length > 10 ? 13 : 10) : (dniSearch.length > 8 ? 11 : 8))
                                        ? 'border-amber-500/30 focus:border-amber-500/60'
                                        : 'border-white/5 focus:border-blis-red/50'
                                        }`}
                                    placeholder={country === 'PE' ? "EJ: 44332211" : (country === 'EC' ? "EJ: 0900000000" : "00000000")}
                                    value={dniSearch}
                                    onChange={(e) => setDniSearch(e.target.value)}
                                />
                                <button
                                    onClick={handleCustomerSearch}
                                    disabled={isSearchingCustomer}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-blis-red text-white rounded-2xl shadow-lg shadow-blis-red/20 hover:scale-110 active:scale-95 transition-all text-[10px] font-black uppercase"
                                >
                                    {isSearchingCustomer ? '...' : 'CONSULTAR'}
                                </button>
                            </div>
                        </div>

                        <div className="bg-zinc-900 border border-white/5 p-5 rounded-[2rem] space-y-4 shadow-2xl relative group h-fit overflow-visible">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="text-[9px] text-blis-red font-black uppercase tracking-[0.2em] mb-1">
                                        {customer?.id && customer.id !== '0' ? 'Cliente Identificado' : 'Nuevo Cliente / Venta General'}
                                    </div>
                                    <input
                                        type="text"
                                        className="w-full bg-transparent text-xl font-black uppercase tracking-tighter leading-tight outline-none placeholder:text-zinc-800"
                                        placeholder="NOMBRE O RAZÓN SOCIAL..."
                                        value={customer?.name || ''}
                                        onChange={(e) => updateCustomerFields({ name: e.target.value })}
                                    />
                                    {customer?.id && customer.id !== '0' && (
                                        <div className="text-[10px] text-gray-500 font-bold uppercase mt-1">
                                            {customer.type === 'natural' ? 'Persona Natural' : 'Persona Jurídica'} - {customer.id}
                                        </div>
                                    )}
                                </div>
                                {customer?.id && customer.id !== '0' && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleForceRefreshCustomer}
                                            disabled={isSearchingCustomer}
                                            className="p-2 bg-black/40 hover:bg-blis-red/20 text-gray-500 hover:text-blis-red rounded-xl transition-all"
                                            title="Actualizar datos desde RENIEC/SRI"
                                        >
                                            <History className={`w-4 h-4 ${isSearchingCustomer ? 'animate-spin' : ''}`} />
                                        </button>
                                        <button onClick={() => setCustomer(null)} className="p-2 bg-black/40 hover:bg-rose-500/20 text-gray-500 hover:text-rose-500 rounded-xl transition-all">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {customer?.lastUpdate && (
                                <div className="absolute right-5 top-14 text-[8px] font-black uppercase text-gray-600 tracking-widest flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                    <span className="hidden sm:inline">ACTUALIZADO:</span> {new Date(customer.lastUpdate).toLocaleDateString()}
                                </div>
                            )}

                            {customer?.type === 'juridica' && (
                                <div className="p-4 bg-black/20 rounded-2xl border border-white/5 space-y-3 animate-in fade-in duration-500">
                                    <div className="flex items-end justify-between">
                                        <label className="text-[8px] text-blis-red font-black uppercase tracking-widest">Persona Autorizada (Representante)</label>
                                        {repDniSearch.length > 0 && (
                                            <span className={`text-[9px] font-black tracking-widest ${repDniSearch.length === (country === 'EC' ? 10 : 8)
                                                ? 'text-emerald-500'
                                                : 'text-amber-500'
                                                }`}>
                                                {repDniSearch.length} / {country === 'EC' ? 10 : 8}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <input
                                                type="text"
                                                className={`w-full bg-black border border-white/5 p-3 rounded-xl text-[10px] font-black outline-none transition-all placeholder:text-zinc-900 ${repDniSearch.length > 0 && repDniSearch.length !== (country === 'EC' ? 10 : 8)
                                                    ? 'border-amber-500/30 focus:border-amber-500/60'
                                                    : 'focus:border-blis-red/30'
                                                    }`}
                                                placeholder={country === 'PE' ? "EJ: 44332211" : (country === 'EC' ? "EJ: 0900000000" : "00000000")}
                                                value={repDniSearch}
                                                onChange={(e) => setRepDniSearch(e.target.value)}
                                            />
                                            <User className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-800" />
                                        </div>
                                        <button
                                            onClick={handleRepSearch}
                                            disabled={isSearchingRep}
                                            className="px-4 bg-zinc-800 hover:bg-blis-red text-[8px] font-black uppercase rounded-xl transition-all"
                                        >
                                            {isSearchingRep ? '...' : 'BUSCAR'}
                                        </button>
                                    </div>

                                    {customer.representative && (
                                        <div className="p-4 bg-blis-red/5 rounded-xl border border-blis-red/10 animate-in slide-in-from-left-2 duration-300 space-y-3 relative overflow-visible">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="text-[7px] text-gray-500 font-black uppercase">Persona Autorizada</div>
                                                    <div className="text-[10px] font-black uppercase text-white truncate">{stripHtml(customer.representative?.name)}</div>
                                                    <div className="text-[8px] text-blis-red/60 font-black uppercase">{customer.representative.id}</div>
                                                </div>
                                                <button onClick={() => updateCustomerFields({ representative: undefined })} className="p-1 hover:text-rose-500 transition-colors">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>

                                            {/* IMPORTANT: Use a component that ensures the calendar isn't cut off */}
                                            <div className="relative z-50">
                                                <CustomDatePicker
                                                    label="Cumpleaños / Nacimiento"
                                                    value={customer.representative.birthDate || ''}
                                                    onChange={(val) => updateCustomerFields({
                                                        representative: { ...customer.representative, birthDate: val }
                                                    })}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="space-y-1 relative group">
                                    <div className="text-[8px] text-gray-600 font-black uppercase tracking-widest flex items-center gap-2">
                                        <MessageSquare className="w-3 h-3 text-emerald-500" /> WhatsApp
                                    </div>
                                    <input
                                        type="text"
                                        className="w-full bg-black/40 border border-white/5 p-3 rounded-xl text-[10px] font-black outline-none focus:border-emerald-500/30 transition-all placeholder:text-zinc-800"
                                        value={customer?.phone || ''}
                                        placeholder="900 000 000"
                                        onChange={(e) => updateCustomerFields({ phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1 group">
                                    <div className="text-[8px] text-gray-600 font-black uppercase tracking-widest flex items-center gap-2">
                                        <MapPin className="w-3 h-3 text-blue-500" /> Dirección (Envío)
                                    </div>
                                    <input
                                        type="text"
                                        className="w-full bg-black/40 border border-white/5 p-3 rounded-xl text-[10px] font-black outline-none focus:border-blue-500/30 transition-all placeholder:text-zinc-800"
                                        value={customer?.address || ''}
                                        placeholder="Jr. Las Begonias..."
                                        onChange={(e) => updateCustomerFields({ address: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <div className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Correo Electrónico</div>
                                    <input
                                        type="text"
                                        className="w-full bg-black/40 border border-white/5 p-3 rounded-xl text-[10px] font-black outline-none focus:border-blis-red/30 transition-all placeholder:text-zinc-800"
                                        value={customer?.email || ''}
                                        placeholder="cliente@mail.com"
                                        onChange={(e) => updateCustomerFields({ email: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* EXPANDABLE SECTION */}
                        <AnimatePresence>
                            {isCustomerExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden space-y-4 pt-2 border-t border-white/5"
                                >
                                    {(customer?.status || customer?.condition) && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <div className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Condición (SUNAT/SRI)</div>
                                                <div className={`p-3 rounded-xl text-[9px] font-black uppercase border flex items-center gap-2 ${customer.status?.includes('HABIDO') || customer.status?.includes('ACTIVO') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${customer.status?.includes('HABIDO') || customer.status?.includes('ACTIVO') ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                                                    {customer.status || 'SIN DATOS'}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Estado</div>
                                                <div className={`p-3 rounded-xl text-[9px] font-black uppercase border flex items-center gap-2 ${customer.condition === 'ACTIVO' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'}`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${customer.condition === 'ACTIVO' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                                    {customer.condition || 'SIN DATOS'}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-4 gap-2 h-fit overflow-visible relative">
                                        <div className="space-y-1">
                                            <div className="text-[8px] text-gray-600 font-black uppercase tracking-widest">País</div>
                                            <input
                                                type="text"
                                                className="w-full bg-black/40 border border-white/5 p-2.5 rounded-xl text-[9px] font-black outline-none"
                                                value={customer?.country || 'PERÚ'}
                                                onChange={(e) => updateCustomerFields({ country: e.target.value })}
                                            />
                                        </div>
                                        <div className={`${customer?.type === 'juridica' ? 'col-span-3' : 'col-span-2'} relative z-30 overflow-visible`}>
                                            {customer?.type === 'juridica' ? (
                                                <div className="space-y-1">
                                                    <label className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Inscripción / Inicio</label>
                                                    <input
                                                        type="text"
                                                        className="w-full bg-black/40 border border-white/5 p-2.5 rounded-xl text-[9px] font-black outline-none"
                                                        value={customer?.birthDate || ''}
                                                        placeholder="DD/MM/AAAA"
                                                        onChange={(e) => updateCustomerFields({ birthDate: e.target.value })}
                                                    />
                                                </div>
                                            ) : (
                                                <CustomDatePicker
                                                    label="Fecha Nacimiento"
                                                    value={customer?.birthDate || ''}
                                                    onChange={(val) => updateCustomerFields({ birthDate: val })}
                                                />
                                            )}
                                        </div>
                                        {customer?.type !== 'juridica' && (
                                            <div className="space-y-1">
                                                <div className="text-[8px] text-gray-600 font-black uppercase tracking-widest text-center">Edad</div>
                                                <div className="w-full bg-black/40 border border-white/5 p-2.5 rounded-xl text-[9px] font-black text-center text-blis-red uppercase">
                                                    {calculateAge(customer?.birthDate)}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="space-y-1">
                                            <div className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Dpto.</div>
                                            <input
                                                type="text"
                                                className="w-full bg-black/40 border border-white/5 p-2.5 rounded-xl text-[9px] font-black outline-none"
                                                value={customer?.department || ''}
                                                onChange={(e) => updateCustomerFields({ department: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Prov.</div>
                                            <input
                                                type="text"
                                                className="w-full bg-black/40 border border-white/5 p-2.5 rounded-xl text-[9px] font-black outline-none"
                                                value={customer?.province || ''}
                                                onChange={(e) => updateCustomerFields({ province: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Dist.</div>
                                            <input
                                                type="text"
                                                className="w-full bg-black/40 border border-white/5 p-2.5 rounded-xl text-[9px] font-black outline-none"
                                                value={customer?.district || ''}
                                                onChange={(e) => updateCustomerFields({ district: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Dirección Comercial / Fiscal / Extensa</div>
                                        <textarea
                                            className="w-full bg-black/40 border border-white/5 p-3 rounded-xl text-[10px] font-bold outline-none focus:border-blis-red/30 transition-all resize-none h-14 placeholder:text-zinc-800"
                                            value={customer?.address || ''}
                                            placeholder="CALLE / AVENIDA / NÚMERO / DEPTO..."
                                            onChange={(e) => updateCustomerFields({ address: e.target.value })}
                                        />
                                    </div>

                                    {/* FICHA CIUDADANA - Datos extendidos Ecuador */}
                                    {country === 'EC' && customer?.type === 'natural' && (
                                        customer?.maritalStatus || customer?.motherName || customer?.fatherName ||
                                        customer?.nationality || customer?.education || customer?.profession ||
                                        customer?.gender || customer?.bloodType || customer?.birthPlace ||
                                        customer?.licencia || customer?.disability || customer?.conditionCedulado
                                    ) && (
                                            <div className="mt-3 rounded-2xl border border-white/8 overflow-hidden">
                                                {/* Header */}
                                                <div className="bg-blis-red/10 border-b border-blis-red/20 px-3 py-2 flex items-center gap-2">
                                                    <ShieldCheck className="w-3.5 h-3.5 text-blis-red" />
                                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-blis-red">Ficha Ciudadana · Registro Civil</span>
                                                    {customer?.conditionCedulado && (
                                                        <span className="ml-auto text-[7px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase">{customer.conditionCedulado}</span>
                                                    )}
                                                </div>
                                                <div className="p-3 space-y-3 bg-black/20">

                                                    {/* ─ BIO GRID ─ */}
                                                    <div className="grid grid-cols-3 gap-1.5">
                                                        {customer?.gender && (
                                                            <div className="bg-black/40 px-2 py-1.5 rounded-lg">
                                                                <div className="text-[7px] text-gray-600 font-black uppercase">Género</div>
                                                                <div className="text-[8px] font-black text-white uppercase mt-0.5">{customer.gender}</div>
                                                            </div>
                                                        )}
                                                        {customer?.nationality && (
                                                            <div className="bg-black/40 px-2 py-1.5 rounded-lg">
                                                                <div className="text-[7px] text-gray-600 font-black uppercase">Nac.</div>
                                                                <div className="text-[8px] font-black text-white uppercase mt-0.5">{customer.nationality}</div>
                                                            </div>
                                                        )}
                                                        {customer?.bloodType && (
                                                            <div className="bg-black/40 px-2 py-1.5 rounded-lg border border-rose-500/20">
                                                                <div className="text-[7px] text-gray-600 font-black uppercase">Sangre</div>
                                                                <div className="text-[8px] font-black text-rose-400 uppercase mt-0.5">{customer.bloodType}</div>
                                                            </div>
                                                        )}
                                                        {customer?.maritalStatus && (
                                                            <div className="bg-black/40 px-2 py-1.5 rounded-lg border border-amber-500/20">
                                                                <div className="text-[7px] text-gray-600 font-black uppercase">Est. Civil</div>
                                                                <div className="text-[8px] font-black text-amber-400 uppercase mt-0.5">{customer.maritalStatus}</div>
                                                            </div>
                                                        )}
                                                        {customer?.education && (
                                                            <div className="bg-black/40 px-2 py-1.5 rounded-lg">
                                                                <div className="text-[7px] text-gray-600 font-black uppercase">Instrucción</div>
                                                                <div className="text-[8px] font-black text-white uppercase mt-0.5">{customer.education}</div>
                                                            </div>
                                                        )}
                                                        {customer?.profession && (
                                                            <div className="bg-black/40 px-2 py-1.5 rounded-lg">
                                                                <div className="text-[7px] text-gray-600 font-black uppercase">Profesión</div>
                                                                <div className="text-[8px] font-black text-white uppercase mt-0.5">{customer.profession}</div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* ─ CÓNYUGE ─ */}
                                                    {customer?.spouseName && (
                                                        <div className="bg-emerald-500/5 border border-emerald-500/20 px-3 py-2 rounded-xl flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                                                            <div>
                                                                <div className="text-[7px] text-gray-600 font-black uppercase">Cónyuge / Conviviente</div>
                                                                <div className="text-[9px] font-black text-emerald-400 uppercase">{customer.spouseName}</div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {/* ─ PADRES ─ */}
                                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                                        {customer?.motherName && (
                                                            <div className="border border-white/5 bg-black/40 px-2.5 py-2 rounded-lg">
                                                                <div className="text-[7px] text-gray-500 font-black uppercase tracking-widest">Madre</div>
                                                                <div className="text-[8px] font-black text-gray-300 uppercase mt-0.5">{customer.motherName}</div>
                                                            </div>
                                                        )}
                                                        {customer?.fatherName && (
                                                            <div className="border border-white/5 bg-black/40 px-2.5 py-2 rounded-lg">
                                                                <div className="text-[7px] text-gray-500 font-black uppercase tracking-widest">Padre</div>
                                                                <div className="text-[8px] font-black text-gray-300 uppercase mt-0.5">{customer.fatherName}</div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* ─ EXTRAS (LICENCIA, DISCAPACIDAD, NACIMIENTO) ─ */}
                                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                                        {customer?.birthPlace && (
                                                            <div className="border border-blue-500/10 bg-blue-500/5 px-2.5 py-2 rounded-lg">
                                                                <div className="text-[7px] text-blue-500/80 font-black uppercase tracking-widest">Lugar Nacim.</div>
                                                                <div className="text-[8px] font-black text-blue-400 uppercase mt-0.5">{customer.birthPlace}</div>
                                                            </div>
                                                        )}
                                                        {customer?.licencia && (
                                                            <div className="border border-amber-500/10 bg-amber-500/5 px-2.5 py-2 rounded-lg">
                                                                <div className="text-[7px] text-amber-500/80 font-black uppercase tracking-widest">Licencia Conducir</div>
                                                                <div className="text-[8px] font-black text-amber-500 uppercase mt-0.5">{typeof customer.licencia === "string" ? customer.licencia : "Si"}</div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* ─ CONADIS / MUERTE ─ */}
                                                    {customer?.disability === 'SI' && (
                                                        <div className="bg-blis-red/10 border border-blis-red/20 p-2.5 rounded-lg flex items-start gap-2">
                                                            <div className="p-1 bg-blis-red/20 rounded-md shrink-0">
                                                                <Users className="w-3.5 h-3.5 text-blis-red" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-[8px] font-black text-blis-red uppercase tracking-widest">Carnet CONADIS</span>
                                                                    <span className="text-[9px] font-black bg-blis-red text-white px-2 py-0.5 rounded-full">{customer.disabilityPct}%</span>
                                                                </div>
                                                                <div className="text-[7px] text-blis-red/70 font-black uppercase mt-1">Tipo: {customer.disabilityType || 'NO ESPECIFICADO'}</div>
                                                                {customer.conadisCard && <div className="text-[7px] text-blis-red/50 uppercase font-black">N° {customer.conadisCard}</div>}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {customer?.deathDate && (
                                                        <div className="bg-zinc-900 border border-zinc-700 p-2.5 rounded-lg flex items-center gap-3">
                                                            <AlertCircle className="w-5 h-5 text-gray-500 shrink-0" />
                                                            <div>
                                                                <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Fecha Defunción</div>
                                                                <div className="text-[10px] font-black text-gray-200 uppercase tracking-widest line-through">{customer.deathDate}</div>
                                                            </div>
                                                        </div>
                                                    )}

                                                </div>
                                            </div>
                                        )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* TOGGLE EXPAND BUTTON */}
                        <button
                            onClick={() => setIsCustomerExpanded(!isCustomerExpanded)}
                            className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-gray-500 hover:text-white rounded-[1.5rem] text-[9px] font-black uppercase tracking-widest transition-all border border-white/5 hover:border-white/10 flex items-center justify-center gap-2"
                        >
                            {isCustomerExpanded ? 'OCULTAR DETALLES' : 'VER TODOS LOS DETALLES'}
                            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isCustomerExpanded ? '-rotate-90' : 'rotate-90'}`} />
                        </button>
                    </div>

                    {/* --- AI UPSELL ASSISTANT --- */}
                    <div className="shrink-0">
                        <POSAIUpsell
                            cart={cart}
                            catalog={products as any[]}
                            onAddProduct={handleQuickAdd}
                        />
                    </div>

                    {/* --- GLOBAL COUPONS & DISCOUNTS --- */}
                    <div className="p-6 bg-zinc-900/50 rounded-[2rem] border border-white/5 space-y-4 shrink-0">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center justify-between">
                            Beneficios & Descuentos Globales
                        </h3>

                        {/* Cupones */}
                        <div className="space-y-2">
                            <label className="text-[8px] font-black text-gray-600 uppercase tracking-[0.2em]">Aplicar Cupón</label>
                            <div className="relative group/coupon">
                                <input
                                    type="text"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    className="w-full bg-black/40 border border-white/5 pl-10 pr-4 py-3 rounded-2xl text-[11px] font-black text-white uppercase outline-none focus:border-emerald-500/50 transition-all placeholder:text-zinc-800"
                                    placeholder="EJ: BLACKFRIDAY24"
                                />
                                <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within/coupon:text-emerald-500 transition-colors" />
                                {couponCode && (
                                    <button onClick={() => setCouponCode('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-500 hover:scale-110 transition-transform">
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Descuento Global Directo */}
                        <div className="space-y-2 pt-2 border-t border-white/5 min-w-0">
                            <label className="text-[8px] font-black text-gray-600 uppercase tracking-[0.2em] flex items-center justify-between">
                                <span>Descuento Manual Fijo</span>
                                {globalDiscountAmount > 0 && (
                                    <button onClick={() => setGlobalDiscountAmount(0)} className="text-rose-500 hover:underline">Borrar</button>
                                )}
                            </label>
                            <div className="flex gap-2">
                                <div className="flex bg-black/40 rounded-xl border border-white/5 overflow-hidden shrink-0">
                                    <button
                                        onClick={() => setGlobalDiscountType('percent')}
                                        className={`px-3 py-2 ${globalDiscountType === 'percent' ? 'bg-emerald-500/20 text-emerald-500' : 'text-gray-500 hover:text-white'}`}
                                    >
                                        <Percent className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setGlobalDiscountType('fixed')}
                                        className={`px-3 py-2 ${globalDiscountType === 'fixed' ? 'bg-emerald-500/20 text-emerald-500' : 'text-gray-500 hover:text-white'}`}
                                    >
                                        <Banknote className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="relative flex-1 group/disc">
                                    <input
                                        type="number"
                                        value={globalDiscountAmount || ''}
                                        onChange={(e) => setGlobalDiscountAmount(parseFloat(e.target.value) || 0)}
                                        className="w-full h-full bg-black/40 border border-white/5 px-4 rounded-xl text-[14px] font-black text-white outline-none focus:border-emerald-500/50 transition-all text-right placeholder:text-zinc-800"
                                        placeholder="0.00"
                                    />
                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within/disc:text-emerald-500" />
                                </div>
                            </div>
                        </div>

                        {/* Envío */}
                        <div className="space-y-2 pt-2 border-t border-white/5">
                            <label className="text-[8px] font-black text-gray-600 uppercase tracking-[0.2em] flex items-center justify-between">
                                <span>Costo de Envío</span>
                            </label>
                            <div className="relative group/ship">
                                <input
                                    type="number"
                                    value={shippingCost || ''}
                                    onChange={(e) => setShippingCost(parseFloat(e.target.value) || 0)}
                                    className="w-full bg-black/40 border border-white/5 pl-10 pr-4 py-3 rounded-2xl text-[14px] font-black text-amber-500 outline-none focus:border-amber-500/50 transition-all placeholder:text-zinc-800"
                                    placeholder="0.00"
                                />
                                <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within/ship:text-amber-500 transition-colors" />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-zinc-700">{currency}</span>
                            </div>
                            <button
                                onClick={() => {
                                    alert('Módulo de Courrier Olva / Shalom se abrirá en la Siguiente Actualización...');
                                }}
                                className="w-full py-3 bg-amber-600/10 border border-amber-600/30 rounded-xl flex items-center justify-center gap-3 group hover:bg-amber-600/20 transition-all"
                            >
                                <Truck className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                                <span className="text-[9px] font-black uppercase text-amber-500 tracking-widest">Cotizar Envío Olva Courier</span>
                            </button>
                        </div>
                    </div>

                    {/* --- TOTAL BOX MOVED INSIDE RIGHT COLUMN --- */}
                    <div className="mt-auto pt-6 space-y-6 shrink-0 relative z-20">
                        <div className="bg-zinc-950 border-2 border-white/10 p-8 rounded-[3rem] space-y-4 shadow-3xl">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-[11px] font-black text-gray-600 uppercase tracking-widest">
                                    <span>Subtotal</span>
                                    <span>{currency}{(subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between items-center text-[11px] font-black text-gray-600 uppercase tracking-widest">
                                    <div className="flex items-center gap-2">
                                        <span>{taxName} ({taxRate}%)</span>
                                        {documentType === 'ticket' && <span className="bg-blis-red/20 text-blis-red px-2 py-0.5 rounded text-[7px]">EXENTO</span>}
                                    </div>
                                    <span>{currency}{(tax || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>

                                {globalDiscountAmount > 0 && (
                                    <div className="flex justify-between items-center text-[11px] font-black text-emerald-500 uppercase tracking-widest animate-pulse">
                                        <span>Dscto. Aplicado</span>
                                        <div className="flex items-center gap-1">
                                            <span>-</span>
                                            <span>{currency}{(globalDiscountType === 'percent' ? (subtotal * (1 + taxRate / 100) * globalDiscountAmount / 100) : globalDiscountAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="pt-5 border-t border-white/10 flex flex-col xl:flex-row justify-between xl:items-end gap-5">
                                    <div className="flex-1">
                                        <div className="text-[10px] font-black text-blis-red uppercase tracking-[0.2em] mb-1.5 flex items-center gap-2">
                                            {documentType === 'ticket' ? <Ticket className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                                            Total {transactionType}
                                        </div>
                                        <div className="flex items-baseline gap-1.5 min-w-0 pr-2">
                                            <span className="text-2xl font-black text-zinc-700">{currency}</span>
                                            <div className="text-4xl xl:text-5xl font-black tracking-tighter text-white truncate">{(total || 0).toLocaleString()}</div>
                                        </div>
                                    </div>
                                    <div className="shrink-0">
                                        {transactionType === 'cotizacion' ? (
                                            <button
                                                onClick={saveTransaction}
                                                className="px-5 py-6 xl:p-6 bg-amber-500 text-black rounded-3xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-3 hover:scale-105 w-full xl:w-auto justify-center"
                                            >
                                                <Save className="w-5 h-5" /> <span className="hidden xl:inline">GUARDAR</span>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => setIsCheckoutOpen(true)}
                                                disabled={(cart || []).length === 0}
                                                className="px-5 py-6 xl:p-6 bg-emerald-500 text-black rounded-[2rem] font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-3 disabled:opacity-20 shadow-[0_20px_40px_rgba(16,185,129,0.2)] hover:scale-105 active:scale-95 w-full xl:w-auto justify-center"
                                            >
                                                <span className="hidden xl:inline">COBRAR</span> <ChevronRight className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {isCheckoutOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-black/95 backdrop-blur-3xl"
                        onClick={() => {
                            setIsCheckoutOpen(false);
                            setInvoiceResult(null);
                        }}
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        className="bg-zinc-950 border border-white/10 p-12 rounded-[4rem] w-full max-w-6xl relative z-10 shadow-3xl flex gap-10 overflow-hidden"
                    >
                        {/* LEFT COLUMN: Items & Summary or Success Message */}
                        <div className="flex-1 space-y-10 min-w-0">
                            {!invoiceResult ? (
                                <>
                                    <div>
                                        <h2 className="text-4xl font-black uppercase tracking-tighter text-white">Finalizar Venta</h2>
                                        <div className="flex gap-4 mt-2 items-center">
                                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Doc: {documentType}</span>
                                            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">|</span>
                                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Cliente: {stripHtml(customer?.name) || 'Venta General'}</span>

                                            <button 
                                                onClick={() => {
                                                    const phone = customer?.phone || customer?.cellphone;
                                                    if (!phone) {
                                                        alert('El cliente no tiene un número de celular configurado.');
                                                        return;
                                                    }
                                                    const text = encodeURIComponent(`Hola ${customer?.name || ''}, adjunto tu comprobante de venta por ${currency}${total}. Gracias por tu compra.`);
                                                    window.open(`https://wa.me/${phone.replace(/\s+/g, '')}?text=${text}`, '_blank');
                                                }}
                                                className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full ml-auto hover:bg-emerald-500/20 transition-all"
                                            >
                                                <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                                                <span className="text-[8px] font-black uppercase text-emerald-500 tracking-widest">WhatsApp</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { id: 'cash', icon: Banknote, label: 'Efectivo', desc: country === 'EC' ? 'Saldo físico / caja' : 'Pago físico', color: 'emerald' },
                                            { id: 'card', icon: CreditCard, label: 'Tarjeta', desc: country === 'EC' ? 'Datafast / Medianet' : 'IziPay / Niubiz', color: 'blue' },
                                            { id: 'bliscoins', icon: Coins, label: 'BlisCoins', desc: 'Canje de Puntos', color: 'amber' },
                                            { id: 'transfer', icon: ArrowRightLeft, label: country === 'EC' ? 'Deuna / Pichincha' : 'Transferencia', desc: country === 'EC' ? 'Interbancario' : 'Yape / Plin', color: 'purple' }
                                        ].map(method => (
                                            <button
                                                key={method.id}
                                                onClick={() => setPaymentMethod(method.id as any)}
                                                className={`group relative p-6 rounded-[2.5rem] border-2 transition-all flex items-center gap-6 ${paymentMethod === method.id ? 'bg-emerald-500/10 border-emerald-500 shadow-2xl' : 'bg-black/40 border-white/5 hover:border-white/10'}`}
                                            >
                                                <div className={`w-14 h-14 rounded-2xl bg-black border border-white/5 flex items-center justify-center shrink-0 transition-all ${paymentMethod === method.id ? 'text-emerald-500' : 'text-zinc-700'}`}>
                                                    <method.icon className="w-7 h-7" />
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-[12px] font-black uppercase text-white mb-1">{method.label}</div>
                                                    <div className="text-[8px] font-bold text-gray-500 uppercase truncate">{method.desc}</div>
                                                </div>
                                                {paymentMethod === method.id && <CheckCircle2 className="absolute top-4 right-4 w-5 h-5 text-emerald-500" />}
                                            </button>
                                        ))}
                                    </div>

                                    {(country === 'PE' || country === 'EC') && (
                                        <div className="pt-6 border-t border-white/5">
                                            <button
                                                onClick={() => setEmitElectronicInvoice(!emitElectronicInvoice)}
                                                className={`w-full p-8 rounded-[3rem] border-2 transition-all flex items-center justify-between group overflow-hidden relative ${emitElectronicInvoice ? 'bg-emerald-500/10 border-emerald-500 shadow-2xl' : 'bg-black/40 border-white/5'}`}
                                            >
                                                <div className="flex items-center gap-5 relative z-10">
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${emitElectronicInvoice ? 'bg-emerald-500 text-black' : 'bg-zinc-900 text-zinc-700'}`}>
                                                        <ShieldCheck className="w-7 h-7" />
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="text-sm font-black uppercase text-white tracking-widest leading-none mb-1">Facturación Electrónica {country === 'PE' ? 'SUNAT' : 'SRI'}</div>
                                                        <div className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">Enviar comprobante legal {country === 'PE' ? 'a ApiSunat' : 'vía ApiConsult'}</div>
                                                    </div>
                                                </div>
                                                <div className={`w-14 h-7 rounded-full relative transition-all border-2 shrink-0 ${emitElectronicInvoice ? 'bg-emerald-500 border-emerald-500' : 'bg-zinc-900 border-white/10'}`}>
                                                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-300 ${emitElectronicInvoice ? 'left-8' : 'left-0.5'}`} />
                                                </div>
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center space-y-10 py-12">
                                    <div className="relative">
                                        <div className="w-28 h-28 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 animate-pulse">
                                            <CheckCircle2 className="w-16 h-16" />
                                        </div>
                                        <div className="absolute -top-2 -right-2 bg-emerald-500 text-black p-1.5 rounded-full shadow-lg">
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-3xl font-black uppercase text-white tracking-widest italic">Venta Exitosa</h3>
                                        <p className="text-emerald-500/60 text-xs font-bold uppercase tracking-[0.2em]">{invoiceResult?.msg}</p>
                                    </div>

                                    {invoiceResult?.detail && (
                                        <div className="bg-emerald-500/5 p-8 rounded-[2.5rem] border border-emerald-500/20 w-full space-y-4 shadow-2xl relative overflow-hidden">
                                            <div className="flex items-center justify-between text-left">
                                                <div>
                                                    <span className="text-[9px] font-black text-emerald-500/70 uppercase tracking-[0.3em]">Clave de Acceso {country === 'EC' ? 'SRI' : 'SUNAT'}</span>
                                                </div>
                                                <span className="text-[8px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 uppercase">Autorizado</span>
                                            </div>
                                            <div className="text-[11px] font-mono text-white break-all leading-relaxed bg-black/60 p-6 rounded-3xl border border-white/10 select-all transition-all cursor-pointer group relative">
                                                {invoiceResult.detail}
                                                <div className="absolute top-2 right-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                                    <Copy className="w-3 h-3 text-emerald-500" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-4 w-full">
                                        <button onClick={() => window.print()} className="flex-1 py-6 bg-zinc-900 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-[2rem] border border-white/10 hover:bg-zinc-800 transition-all flex items-center justify-center gap-2">
                                            <Printer className="w-4 h-4" /> Comprobante
                                        </button>
                                        <button onClick={() => { setInvoiceResult(null); setIsCheckoutOpen(false); }} className="flex-[2] py-6 bg-white text-black text-[11px] font-black uppercase tracking-[0.4em] rounded-[2rem] hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-white/10">
                                            Continuar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT COL: PAYMENT */}
                        {!invoiceResult && (
                            <div className="w-[450px] space-y-8 flex flex-col justify-between">
                                <div className="bg-zinc-900/40 p-12 rounded-[4rem] border border-white/5 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-2xl">
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-emerald-500/5 blur-[100px]" />
                                    <div className="w-full space-y-4 relative z-10">
                                        <div className="text-[11px] text-zinc-500 font-black uppercase tracking-[0.3em]">Total a Cobrar</div>
                                        <div className="flex items-center justify-center gap-4">
                                            <span className="text-4xl font-black text-zinc-800 tracking-tighter">{currency}</span>
                                            <div className="text-8xl font-black tracking-tighter text-white animate-in slide-in-from-bottom-4 duration-700">
                                                {(total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="relative group">
                                        <input
                                            type="number"
                                            value={receivedAmount}
                                            onChange={(e) => setReceivedAmount(e.target.value)}
                                            className="w-full bg-zinc-900 border-2 border-white/10 py-10 px-8 rounded-[2.5rem] text-4xl font-black text-white text-center outline-none focus:border-emerald-500 transition-all placeholder:text-zinc-800"
                                            placeholder="0.00"
                                        />
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-black px-5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl">Monto Recibido</div>
                                    </div>

                                    {parseFloat(receivedAmount) > total && (
                                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl animate-in fade-in zoom-in duration-300">
                                            <div className="text-[10px] text-emerald-500 font-black uppercase mb-1">Cambio a Entregar</div>
                                            <div className="text-2xl font-black text-emerald-500">{currency}{(parseFloat(receivedAmount) - total).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                        </div>
                                    )}

                                    <button
                                        onClick={async () => {
                                            if (total <= 0) { alert('El total debe ser mayor a 0'); return; }
                                            if (receivedAmount && parseFloat(receivedAmount) < total) { alert('Monto insuficiente'); return; }
                                            
                                            if (emitElectronicInvoice) {
                                                setIsIssuingInvoice(true);
                                                if (country === 'PE') {
                                                    const token = localStorage.getItem('apisunat_token');
                                                    const env = localStorage.getItem('apisunat_env') || 'sandbox';
                                                    if (!token) { alert('Falta Token'); setIsIssuingInvoice(false); return; }
                                                    const mappedItems = (cart || []).map(item => ({ unidad_de_medida: item.category === 'cursos' ? 'ZZ' : 'NIU', descripcion: item.name, cantidad: item.quantity.toString(), valor_unitario: (item.price / (1 + (taxRate / 100))).toFixed(6), porcentaje_igv: taxRate.toString(), codigo_tipo_afectacion_igv: "10", nombre_tributo: taxName }));
                                                    const sunatDoc = { documento: documentType, serie: documentType === 'factura' ? (localStorage.getItem('apisunat_serie_f') || 'F001') : (localStorage.getItem('apisunat_serie_b') || 'B001'), numero: Math.floor(Math.random() * 9999), fecha_de_emision: new Date().toISOString().split('T')[0], cliente_tipo_de_documento: documentType === 'factura' ? '6' : '1', cliente_numero_de_documento: customer?.id || "00000000", cliente_denominacion: customer?.name || "CLIENTE GENERAL", items: mappedItems, total: (total || 0).toFixed(2) };
                                                    try {
                                                        const res = await fetch('/api/issue-invoice', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ document: sunatDoc, token, env }) });
                                                        if (res.ok) alert('✅ SUNAT OK'); else alert('❌ Error SUNAT');
                                                    } catch (e) {}
                                                } else if (country === 'EC') {
                                                    const token = localStorage.getItem('apiconsult_token');
                                                    const env = localStorage.getItem('apiconsult_env') || 'pruebas';
                                                    const p12 = localStorage.getItem('apiconsult_p12_base64');
                                                    const password = localStorage.getItem('apiconsult_p12');
                                                    if (!token || !p12) { alert('Faltan credenciales EC'); setIsIssuingInvoice(false); return; }
                                                    const ecuadorDoc = mapCartToEcuadorInvoice(cart, customer, total, subtotal, tax, taxRate, { env, ruc: localStorage.getItem('blis_store_ruc'), razonSocial: localStorage.getItem('blis_store_name'), address: localStorage.getItem('blis_store_address') });
                                                    try {
                                                        const res = await fetch('/api/ecuador-api', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-apiconsult-token': token }, body: JSON.stringify({ p12, password, env: env === 'produccion' ? '2' : '1', comprobante: ecuadorDoc }) });
                                                        const result = await res.json();
                                                        if (res.ok) { setInvoiceResult({ success: true, msg: 'SRI Aprobado', detail: result.claveAcceso || result.authorizationCode }); saveTransaction(); return; }
                                                    } catch (e) {}
                                                }
                                                setIsIssuingInvoice(false);
                                            }
                                            saveTransaction();
                                            setInvoiceResult({ success: true, msg: 'Venta registrada.' });
                                            setReceivedAmount('');
                                            setEmitElectronicInvoice(false);
                                        }}
                                        disabled={isIssuingInvoice}
                                        className="w-full py-10 bg-emerald-500 text-black text-[13px] font-black uppercase tracking-[0.4em] rounded-[3.5rem] shadow-[0_25px_50px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                                    >
                                        {isIssuingInvoice ? 'PROCESANDO...' : 'FINALIZAR VENTA'} <CheckCircle2 className="w-8 h-8" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
            
            {/* --- IMPRESIÓN --- */}
            <div className="hidden print:block fixed inset-0 bg-white font-mono text-black text-[10px] p-4 leading-relaxed tracking-tight z-[9999999] overflow-visible break-inside-avoid">
                <div className="w-[80mm] mx-auto break-inside-avoid">
                    <div className="text-center font-black mb-1 leading-none text-xl">{typeof window !== 'undefined' ? stripHtml(localStorage.getItem('blis_store_name')) || 'BLIS CORP' : 'BLIS CORP'}</div>
                    <div className="text-center text-[7px] mb-0.5 leading-none">RUC: {typeof window !== 'undefined' ? stripHtml(localStorage.getItem('blis_store_ruc')) || '20000000001' : '20000000001'}</div>
                    <div className="text-center text-[7px] mb-2 leading-tight uppercase max-w-[80%] mx-auto">{typeof window !== 'undefined' ? stripHtml(localStorage.getItem('blis_store_address')) || 'LIMA - PERÚ' : 'LIMA - PERÚ'}</div>
                    <div className="border-t border-dashed border-black my-2"></div>
                    <div className="text-center font-black text-sm uppercase leading-none tracking-widest">{docLabels.ruc} / {docLabels.dni} - ELECTRÓNICA</div>
                    <div className="text-center text-[8px] mt-0.5 leading-none">{documentType === 'factura' ? 'FACTURA' : (documentType === 'boleta' ? 'BOLETA' : 'TICKET COMPROBANTE')}</div>
                    <div className="border-t border-dashed border-black my-2"></div>
                    
                    <div className="space-y-0.5 mt-2">
                        <div className="flex justify-between">
                            <span className="font-bold">FECHA:</span>
                            <span>{new Date().toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-bold">CLIENTE:</span>
                            <span className="text-right ml-2 line-clamp-1">{stripHtml(customer?.name) || 'Venta General'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-bold">{(customer?.id?.length || 0) > 8 ? docLabels.ruc : docLabels.dni}:</span>
                            <span>{customer?.id || '00000000'}</span>
                        </div>
                    </div>

                    <div className="border-t border-dashed border-black my-2"></div>
                    
                    <div className="text-[9px] mb-1 font-bold">DESCRIPCIÓN</div>
                    <div className="space-y-2 mt-1">
                        {(cart || []).map((item, idx) => (
                            <div key={idx} className="flex justify-between items-start leading-tight">
                                <div className="flex-1 pr-2">
                                    <div className="font-bold uppercase break-words line-clamp-2">{stripHtml(item.name)}</div>
                                    <div className="text-[8px] text-gray-500">
                                        {item.quantity} x {currency}{item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        {item.discount && item.discount > 0 && ` (-${item.discount}${item.discountType === 'percent' ? '%' : ''})`}
                                    </div>
                                </div>
                                <div className="text-right shrink-0 mt-0.5 font-bold">
                                    {currency}{((item.price * item.quantity) - (item.discountType === 'percent' ? (item.price * item.quantity * (item.discount || 0) / 100) : (item.discount || 0))).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-dashed border-black my-2"></div>
                    
                    <div className="space-y-1 mt-2 text-[10px]">
                        <div className="flex justify-between">
                            <span>SUBTOTAL:</span>
                            <span>{currency}{(subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>{taxName || 'IGV'} ({taxRate || 18}%):</span>
                            <span>{currency}{(tax || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        {globalDiscountAmount > 0 && (
                            <div className="flex justify-between font-bold">
                                <span>DESCUENTO:</span>
                                <span>-{currency}{(globalDiscountType === 'percent' ? (subtotal * (1 + taxRate / 100) * globalDiscountAmount / 100) : globalDiscountAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-black text-sm pt-1 mt-1 border-t border-black">
                            <span>TOTAL:</span>
                            <span>{currency}{(total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        {receivedAmount && parseFloat(receivedAmount) > 0 && (
                            <>
                                <div className="flex justify-between text-[9px] mt-1 pt-1 border-t border-dashed border-black">
                                    <span>RECIBIDO:</span>
                                    <span>{currency}{parseFloat(receivedAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between text-[9px]">
                                    <span>CAMBIO:</span>
                                    <span>{currency}{Math.max(0, parseFloat(receivedAmount) - (total || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="text-center mt-6 text-[8px] font-bold">
                        <div>GRACIAS POR TU COMPRA</div>
                        <div className="mt-1">Generado por Blis Corp</div>
                    </div>
                </div>
            </div>
            
        </>
    );
};
