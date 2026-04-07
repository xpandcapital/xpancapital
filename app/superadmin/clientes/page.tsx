"use client";

import { useState, useEffect } from "react";
import {
    Users, Search, Filter, Download, User,
    Coins, DollarSign, Calendar, TrendingUp,
    Ticket, History, MoreVertical, X,
    CheckCircle2, Mail, ExternalLink,
    PieChart, Activity, Briefcase,
    Edit3, Key, Send, Shield, ShoppingBag,
    Star, Award, Smartphone, MapPin, Save,
    MessageCircle, Bell, Newspaper, ListTodo,
    ChevronRight, CreditCard, Clock, Eye,
    Lock, Unlock, ArrowRightLeft, Timer,
    FileText, ShoppingCart, Receipt, Zap,
    Percent, BadgeDollarSign, Trash2, Camera,
    Building2, UserCog, Cake, Plus, MapPinned,
    Scale, GraduationCap, Heart, Info, Trophy, LayoutGrid,
    AlertTriangle, Brain, Map, Gift, Link2, ShieldCheck,
    LayoutList, FileSpreadsheet, FileStack, UserCircle, Wallet, Minus, ArrowRight, Snowflake, GitMerge, FileDown, Sparkles, QrCode, ArrowRightLeft as ArrowRightLeftIcon,
    Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/Toast";
import { fetchDniData, fetchRucData } from "@/lib/peru-apis";
import { fetchEcuadorData } from "@/lib/ecuador-apis";

interface DbProfile {id: string;
    empresa_id: string;
    email: string;
    nombre: string | null;
    apellido: string | null;
    avatar_url: string | null;
    telefono: string | null;
    rol: string;
    blis_coins: number;
    total_compras: number;
    total_gastado_usd: number;
    total_referidos: number;
    creado_en: string;
    pais: string | null;
    region: string | null;
    ciudad: string | null;
    tipo_cuenta: string;
    empresa_nombre: string | null;
    empresa_ruc: string | null;
    empresa_rep_legal: string | null;
    tipo_documento: string | null;
    numero_documento: string | null;
    fecha_nacimiento: string | null;
    estado_civil: string | null;
    profesion: string | null;
    educacion: string | null;
    verificado: boolean;
    verificado_en: string | null;
    nivel_id: string | null;
    coins_totales_ganados: number;
    coins_totales_gastados: number;
    coins_expiran: string | null;
    ha_comprado: boolean;
    recibir_newsletter: boolean;
    recibir_push: boolean;
    idioma: string;
    tema: string;
    courier_preferido: string;
    codigo_referido: string | null;
    referido_por: string | null;
    notas_internas: string | null;
    es_caso_dificil: boolean;
    cumpleanos_auto_regalo: boolean;
    recordatorio_inactividad: boolean;
    cuenta_congelada: boolean;
    cuenta_fusionada_con: string | null;
    ultimo_login: string | null;
    addresses: DbAddress[];
}

interface DbAddress {
    id: string;
    tipo: string;
    etiqueta: string;
    direccion: string;
    ciudad: string;
    region: string | null;
    es_principal: boolean;
    acceso_dificil: boolean;
}

// --- Types ---
interface Address { id: string; type: 'Envio' | 'Facturacion' | 'Oficina'; label: string; address: string; city: string; }
interface AuditLog { id: string; date: string; action: string; user: string; details: string; }
interface Transaction { id: string; date: string; amount: number; type: 'Ganancia' | 'Gasto' | 'Ajuste'; description: string; reason?: string; }
interface OrderItem { id: string; name: string; quantity: number; price: number; }
interface Order { id: string; date: string; total: number; status: 'Pagado' | 'Pendiente' | 'Cancelado'; items: number; type: 'Venta' | 'Cotizacion'; products?: OrderItem[]; }

interface Client {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar: string;
    role: 'Cliente' | 'Admin' | 'Moderador' | 'Staff';
    blisCoins: number;
    purchases: number;
    income: number;
    lastActive: string;
    status: string;
    joined: string;
    birthday: string;
    phone: string;
    tier: string;
    country: string;
    region: string;
    documentType: 'DNI' | 'RUC' | 'Cedula' | 'Pasaporte';
    dni: string;
    maritalStatus?: string;
    profession?: string;
    education?: string;
    condition?: string;
    address?: string;
    city?: string;
    isCompany: boolean;
    companyName: string;
    legalRep: string;
    addresses: Address[];
    auditLogs: AuditLog[];
    internalNotes: string;
    isNewsletterSubscribed: boolean;
    isPushEnabled: boolean;
    isAccountFrozen: boolean;
    creditLimit: number;
    transactions: Transaction[];
    orders: Order[];
    abandonedCart: { items: number; total: number; date: string } | null;
    coinsExpiration: string;
    academicProgress: { 
        course: string; 
        progress: number; 
        grade?: number; 
        attempts: number; 
        maxAttempts: number; 
        examStatus: 'open' | 'failed_blocked' | 'passed';
        examReleaseDate?: string;
    }[];
    certificates: { id: string; name: string; date: string }[];
    privateEvents: { id: string; name: string; date: string; access: boolean }[];
    managedEmployees?: { id: string; name: string; role: string; joined: string }[];
    aiTags: string[];
    heatMap: { page: string; visits: number; section: 'Blog' | 'Tienda' }[];
    npsScore: number;
    churnRisk: 'low' | 'medium' | 'high';
    recommendedProducts: { id: string; name: string; match: number }[];
    supportTickets: { id: string; subject: string; status: 'open' | 'closed' }[];
    courierPreference: 'PickUp' | 'Home' | 'Office';
    isDifficultAccess: boolean;
    restockAlerts: string[];
    referralCount: number;
    referrals: { 
        id: string; 
        name: string; 
        bonus: number; 
        avatarColor?: string;
        lastPurchase?: { name: string; price: number };
        commissionCash?: number;
        commissionBC?: number;
        commissionPercent?: number;
    }[];
    isBirthdayAutoGift: boolean;
    inactivityReminderSent: boolean;
    lastLoginDate: string;
    isAccountMerged?: boolean;
    mergedWithId?: string;
}

function mapDbToClient(profile: DbProfile): Client {
    const tierMap: Record<string, string> = {
        'platinum': 'Platinum Member',
        'gold': 'Gold Member',
        'silver': 'Silver Member',
        'bronze': 'Bronze Member'
    };
    const docTypeMap: Record<string, 'DNI' | 'RUC' | 'Cedula' | 'Pasaporte'> = {
        'DNI': 'DNI',
        'RUC': 'RUC',
        'Cedula': 'Cedula',
        'Pasaporte': 'Pasaporte',
        'CE': 'Pasaporte',
        'RUT': 'RUC',
        'CURP': 'Pasaporte',
        'RFC': 'RUC',
        'NIT': 'RUC',
        'TI': 'Cedula',
        'CC': 'Cedula',
        'CPF': 'Pasaporte',
        'CI': 'Cedula'
    };
    const docType = docTypeMap[profile.tipo_documento || 'DNI'] || 'DNI';
    let status = 'Socio';
    if (profile.verificado) status = 'Verificado';
    else if (profile.ha_comprado) status = 'Premium';
    const roleMap: Record<string, 'Cliente' | 'Admin' | 'Moderador' | 'Staff'> = {
        'usuario': 'Cliente',
        'cliente': 'Cliente',
        'editor': 'Staff',
        'admin': 'Admin',
        'superadmin': 'Admin'
    };

    return {
        id: profile.id,
        firstName: profile.nombre || '',
        lastName: profile.apellido || '',
        email: profile.email,
        avatar: (profile.nombre?.charAt(0) || profile.email.charAt(0)).toUpperCase(),
        role: roleMap[profile.rol] || 'Cliente',
        blisCoins: profile.blis_coins || 0,
        purchases: profile.total_compras || 0,
        income: Number(profile.total_gastado_usd) || 0,
        lastActive: profile.ultimo_login ? `Hace ${Math.floor((Date.now() - new Date(profile.ultimo_login).getTime()) / 3600000)} horas` : 'Nunca',
        status,
        joined: new Date(profile.creado_en).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        birthday: profile.fecha_nacimiento || '',
        phone: profile.telefono || '',
        tier: profile.nivel_id ? (tierMap[profile.nivel_id] || 'Bronze Member') : 'Bronze Member',
        country: profile.pais || 'PE',
        region: profile.region || '',
        documentType: docType,
        dni: profile.numero_documento || '',
        maritalStatus: profile.estado_civil || '',
        profession: profile.profesion || '',
        education: profile.educacion || '',
        condition: '',
        address: '',
        city: profile.ciudad || '',
        isCompany: profile.tipo_cuenta === 'empresa',
        companyName: profile.empresa_nombre || '',
        legalRep: profile.empresa_rep_legal || '',
        addresses: (profile.addresses || []).map(addr => ({
            id: addr.id,
            type: addr.tipo === 'envio' ? 'Envio' : addr.tipo === 'facturacion' ? 'Facturacion' : 'Oficina',
            label: addr.etiqueta || '',
            address: addr.direccion,
            city: addr.ciudad
        })),
        auditLogs: [],
        internalNotes: profile.notas_internas || '',
        isNewsletterSubscribed: profile.recibir_newsletter ?? true,
        isPushEnabled: profile.recibir_push ?? true,
        isAccountFrozen: profile.cuenta_congelada ?? false,
        creditLimit: 500,
        transactions: [],
        orders: [],
        abandonedCart: null,
        coinsExpiration: profile.coins_expiran || '2024-12-31',
        academicProgress: [],
        certificates: [],
        privateEvents: [],
        managedEmployees: [],
        aiTags: [],
        heatMap: [],
        npsScore: 8,
        churnRisk: 'low',
        recommendedProducts: [],
        supportTickets: [],
        courierPreference: (profile.courier_preferido?.charAt(0).toUpperCase() + profile.courier_preferido?.slice(1)) as 'PickUp' | 'Home' | 'Office' || 'Home',
        isDifficultAccess: false,
        restockAlerts: [],
        referralCount: profile.total_referidos || 0,
        referrals: [],
        isBirthdayAutoGift: profile.cumpleanos_auto_regalo ?? true,
        inactivityReminderSent: profile.recordatorio_inactividad ?? false,
        lastLoginDate: profile.ultimo_login || ''
    };
}

// --- Components ---
const CustomSelect = ({ value, label, options, onChange, icon: Icon, className = "" }: { value: string; label?: string; options: { value: string; label: string }[]; onChange: (v: string) => void; icon?: any; className?: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className={`relative ${label ? 'space-y-2' : ''} ${className}`}>
            {label && <label className="text-[10px] text-gray-600 font-black uppercase ml-1">{label}</label>}
            <button onClick={() => setIsOpen(!isOpen)} className={`w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-xs text-left text-white flex justify-between items-center group hover:border-blis-red transition-all shadow-xl ${!label ? 'py-4' : ''}`}>
                <div className="flex items-center gap-2">
                    {Icon && <Icon className="w-3.5 h-3.5 text-gray-400 group-hover:text-blis-red transition-all" />}
                    <span>{options.find(o => o.value === value)?.label || value}</span>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : 'rotate-0'}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-[10002]" onClick={() => setIsOpen(false)} />
                        <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute left-0 right-0 top-full mt-2 z-[10003] bg-[#0f0f0f] border border-white/10 rounded-2xl overflow-hidden shadow-4xl backdrop-blur-xl min-w-[180px]">
                            {options.map((opt, i) => (
                                <button key={i} onClick={() => { onChange(opt.value); setIsOpen(false); }} className={`w-full text-left px-5 py-3 text-xs font-bold transition-all hover:bg-blis-red hover:text-white ${value === opt.value ? 'bg-white/5 text-blis-red' : 'text-gray-400'}`}>{opt.label}</button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

const CustomDatePicker = ({ value, label, onChange }: { value: string; label: string; onChange: (v: string) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(new Date(value || '2000-01-01'));
    const [viewMode, setViewMode] = useState<'days' | 'months' | 'years'>('days');

    const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
    const firstDay = (y: number, m: number) => new Date(y, m, 1).getDay();

    const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const days = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"];

    const handleDateSelect = (d: number) => {
        const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), d);
        onChange(date.toISOString().split('T')[0]);
        setIsOpen(false);
    };

    const changeMonth = (inc: number) => {
        const d = new Date(viewDate);
        d.setMonth(d.getMonth() + inc);
        setViewDate(d);
    };

    const currentYear = viewDate.getFullYear();
    const yearStart = currentYear - (currentYear % 12);
    const years = Array.from({ length: 12 }, (_, i) => yearStart + i);

    return (
        <div className="relative space-y-2">
            <label className="text-[10px] text-gray-600 font-black uppercase ml-1">{label}</label>
            <button onClick={() => setIsOpen(!isOpen)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-xs text-left text-white flex justify-between items-center group hover:border-blis-red transition-all shadow-xl">
                <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-gray-400 group-hover:text-blis-red transition-all" />
                    <span>{value || "Seleccionar Fecha"}</span>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : 'rotate-0'}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-[10002]" onClick={() => setIsOpen(false)} />
                        <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute left-0 right-0 top-full mt-2 z-[10003] bg-[#0f0f0f] border border-white/10 rounded-[2rem] p-4 shadow-4xl backdrop-blur-xl w-72 mx-auto lg:mx-0">
                            <div className="flex justify-between items-center mb-4 px-2">
                                <button onClick={() => viewMode === 'days' ? changeMonth(-1) : setViewDate(new Date(viewDate.getFullYear() - 12, 0))} className="p-2 hover:bg-white/5 rounded-xl transition-all"><ChevronRight className="rotate-180 w-4 h-4" /></button>
                                <button onClick={() => setViewMode(viewMode === 'days' ? 'months' : viewMode === 'months' ? 'years' : 'days')} className="text-[10px] font-black uppercase hover:text-blis-red transition-all">
                                    {viewMode === 'days' ? `${months[viewDate.getMonth()]} ${viewDate.getFullYear()}` : viewMode === 'months' ? viewDate.getFullYear() : `${years[0]} - ${years[11]}`}
                                </button>
                                <button onClick={() => viewMode === 'days' ? changeMonth(1) : setViewDate(new Date(viewDate.getFullYear() + 12, 0))} className="p-2 hover:bg-white/5 rounded-xl transition-all"><ChevronRight className="w-4 h-4" /></button>
                            </div>

                            {viewMode === 'days' && (
                                <div className="grid grid-cols-7 gap-1 text-center">
                                    {days.map(d => <span key={d} className="text-[8px] font-black text-gray-600 uppercase py-1">{d}</span>)}
                                    {Array(firstDay(viewDate.getFullYear(), viewDate.getMonth())).fill(0).map((_, i) => <div key={`empty-${i}`} />)}
                                    {Array.from({ length: daysInMonth(viewDate.getFullYear(), viewDate.getMonth()) }, (_, i) => i + 1).map(d => {
                                        const isSelected = value === new Date(viewDate.getFullYear(), viewDate.getMonth(), d).toISOString().split('T')[0];
                                        return <button key={d} onClick={() => handleDateSelect(d)} className={`text-[10px] py-2 rounded-xl transition-all ${isSelected ? 'bg-blis-red text-white font-black' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>{d}</button>
                                    })}
                                </div>
                            )}

                            {viewMode === 'months' && (
                                <div className="grid grid-cols-3 gap-2">
                                    {months.map((m, i) => (
                                        <button key={m} onClick={() => { setViewDate(new Date(viewDate.getFullYear(), i, 1)); setViewMode('days'); }} className={`text-[9px] font-black uppercase py-4 rounded-xl transition-all ${viewDate.getMonth() === i ? 'bg-white/10 text-white font-black' : 'text-gray-500 hover:bg-white/5'}`}>{m.substring(0, 3)}</button>
                                    ))}
                                </div>
                            )}

                            {viewMode === 'years' && (
                                <div className="grid grid-cols-3 gap-2">
                                    {years.map(y => (
                                        <button key={y} onClick={() => { setViewDate(new Date(y, viewDate.getMonth(), 1)); setViewMode('months'); }} className={`text-[9px] font-black uppercase py-4 rounded-xl transition-all ${viewDate.getFullYear() === y ? 'bg-white/10 text-white font-black' : 'text-gray-500 hover:bg-white/5'}`}>{y}</button>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function AdminClientes() {
    const { showToast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");
    const [activityFilter, setActivityFilter] = useState("Todos");
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'economy' | 'sales' | 'referrals' | 'comms' | 'addresses' | 'academia' | 'ai_insights' | 'automations' | 'history'>('profile');
    const [isRankingView, setIsRankingView] = useState(false);
    const [confirmationModal, setConfirmationModal] = useState<{
        isOpen: boolean; title: string; message: string; onConfirm: () => void; type: 'danger' | 'warning' 
    }>({ isOpen: false, title: '', message: '', onConfirm: () => {}, type: 'danger' });
    
    const [noticeContent, setNoticeContent] = useState({ title: '', message: '', template: 'custom' });
    const [coinAdjustmentReason, setCoinAdjustmentReason] = useState("");
    const [coinAdjustmentAmount, setCoinAdjustmentAmount] = useState<string>("0");
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [orderViewMode, setOrderViewMode] = useState<'Venta' | 'Cotizacion'>('Venta');
    const [isConfiguringCoupon, setIsConfiguringCoupon] = useState(false);
    const [selectedReferral, setSelectedReferral] = useState<any>(null);
    const [couponForm, setCouponForm] = useState({ code: 'VIP-OFFER', discount: 15, type: 'Percentage' });
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [newAddress, setNewAddress] = useState<Partial<Address>>({ type: 'Envio', label: '', address: '', city: '' });
    const [mergeTargetId, setMergeTargetId] = useState("");
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [selectedClients, setSelectedClients] = useState<number[]>([]);

    const [isMounted, setIsMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        setIsMounted(true);
        fetchClients();
    }, []);
    
    const fetchClients = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/clientes');
            const data = await res.json();
            if (data.success && data.data) {
                const mappedClients = data.data.map(mapDbToClient);
                setClients(mappedClients);
            }
        } catch (error) {
            console.error('Error fetching clients:', error);
            showToast('Error al cargar clientes', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        if (!isMounted) return amount.toString();
        return amount.toLocaleString();
    };

    const [clients, setClients] = useState<Client[]>([]);

    const filteredClients = clients.filter(c => {
        const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
        return (fullName.includes(searchTerm.toLowerCase()) || c.email.toLowerCase().includes(searchTerm.toLowerCase())) && (activityFilter === "Todos" || c.status === activityFilter);
    });

    const handleUpdateClient = async (fields: Partial<Client>, silent = true) => {
        if (!selectedClient) return;
        const updated = { ...selectedClient, ...fields };
        setClients(prev => prev.map(c => c.id === selectedClient.id ? updated : c));
        setSelectedClient(updated);
        
        try {
            const dbUpdate: Record<string, unknown> = {};
            if (fields.firstName !== undefined) dbUpdate.nombre = fields.firstName;
            if (fields.lastName !== undefined) dbUpdate.apellido = fields.lastName;
            if (fields.email !== undefined) dbUpdate.email = fields.email;
            if (fields.phone !== undefined) dbUpdate.telefono = fields.phone;
            if (fields.tier !== undefined) {
                const tierMap: Record<string, string> = {
                    'Platinum Member': 'platinum',
                    'Gold Member': 'gold',
                    'Silver Member': 'silver',
                    'Bronze Member': 'bronze'
                };
                dbUpdate.nivel_id = tierMap[fields.tier] || 'bronze';
            }
            if (fields.documentType !== undefined) dbUpdate.tipo_documento = fields.documentType;
            if (fields.dni !== undefined) dbUpdate.numero_documento = fields.dni;
            if (fields.birthday !== undefined) dbUpdate.fecha_nacimiento = fields.birthday;
            if (fields.maritalStatus !== undefined) dbUpdate.estado_civil = fields.maritalStatus;
            if (fields.profession !== undefined) dbUpdate.profesion = fields.profession;
            if (fields.education !== undefined) dbUpdate.educacion = fields.education;
            if (fields.internalNotes !== undefined) dbUpdate.notas_internas = fields.internalNotes;
            if (fields.isNewsletterSubscribed !== undefined) dbUpdate.recibir_newsletter = fields.isNewsletterSubscribed;
            if (fields.isPushEnabled !== undefined) dbUpdate.recibir_push = fields.isPushEnabled;
            if (fields.isAccountFrozen !== undefined) dbUpdate.cuenta_congelada = fields.isAccountFrozen;
            if (fields.blisCoins !== undefined) dbUpdate.blis_coins = fields.blisCoins;
            
            if (Object.keys(dbUpdate).length > 0) {
                await fetch('/api/admin/clientes', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: selectedClient.id, ...dbUpdate })
                });
            }
        } catch (error) {
            console.error('Error updating client:', error);
        }
        
        if (!silent) showToast("Cambios guardados", "success");
    };

    const handleReleaseExam = (courseName: string) => {
        if (!selectedClient) return;
        const newProgress = selectedClient.academicProgress.map(p => p.course === courseName ? { ...p, attempts: 0, examStatus: 'open' as const } : p);
        handleUpdateClient({ academicProgress: newProgress });
        showToast("Examen liberado", "success");
    };

    const handleDeleteCertificate = (id: string) => {
        if (!selectedClient) return;
        handleUpdateClient({ certificates: selectedClient.certificates.filter(c => c.id !== id) });
        showToast("Certificado eliminado", "success");
    };

    const validateIdentity = async () => {
        if (!selectedClient) return;
        
        const id = selectedClient.dni;
        if (!id) return showToast("Ingrese un número de documento (DNI/RUC/Cédula)", "warning");

        const token = localStorage.getItem('peru_api_token') || localStorage.getItem('blis_ai_config');
        if (!token) {
            showToast("Verificación: Usando Token de Servidor (Configuración Local ausente)", "info");
        }

        showToast(`Verificando: ${selectedClient.documentType || 'Doc'} ${id}...`, "info");
        
        try {
            let data: any;
            if (id.length === 8) data = await fetchDniData(id);
            else if (id.length === 11) data = await fetchRucData(id);
            else if (id.length === 10 || id.length === 13) data = await fetchEcuadorData(id);
            else {
                showToast("Longitud no reconocida (8, 10, 11 o 13)", "warning");
                return;
            }

            if (data && data.success) {
                showToast(`Verificación Exitosa: ${data.name}`, "success");
                
                // Mapeo inteligente de nombres si la API no los trae separados
                // Muchas bases oficiales (RENIEC/SRI) devuelven: APELLIDOS NOMBRES
                let fName = data.firstName;
                let lName = data.lastName;
                
                if (!fName && data.name) {
                    const parts = data.name.trim().split(/\s+/).filter(Boolean);
                    if (parts.length >= 3) {
                        // Formato estándar APELLIDOS NOMBRES (RENIEC/SRI)
                        // Tomamos los 2 primeros como apellidos y el resto como nombres
                        lName = parts.slice(0, 2).join(' ');
                        fName = parts.slice(2).join(' ');
                    } else if (parts.length === 2) {
                        lName = parts[0];
                        fName = parts[1];
                    } else {
                        fName = data.name;
                        lName = "";
                    }
                }

                const updates: Partial<Client> = {
                    status: 'Verificado',
                    firstName: fName || selectedClient.firstName,
                    lastName: lName || selectedClient.lastName,
                    isCompany: data.type === 'juridica',
                    companyName: data.type === 'juridica' ? data.name : selectedClient.companyName,
                    birthday: data.birthDate || selectedClient.birthday,
                    profession: data.profession || selectedClient.profession,
                    education: data.education || selectedClient.education,
                    maritalStatus: data.maritalStatus || selectedClient.maritalStatus,
                    phone: data.phone || data.cellphone || selectedClient.phone,
                    email: data.email || selectedClient.email
                };

                // Si viene dirección, la agregamos como primaria si no tiene
                if (data.address) {
                    const hasMainAddr = selectedClient.addresses.some(a => a.type === 'Facturacion' || a.label === 'Principal');
                    if (!hasMainAddr) {
                        updates.addresses = [
                            ...selectedClient.addresses,
                            { 
                                id: Date.now().toString(), 
                                type: 'Facturacion', 
                                label: 'Principal (API)', 
                                address: data.address,
                                city: `${data.district || ''}, ${data.province || ''}`.trim() || 'Desconocida'
                            }
                        ];
                    }
                }

                // Actualizar localmente
                handleUpdateClient(updates);
            } else {
                showToast(data?.message || "Servicio no disponible o ID inexistente", "error");
            }
        } catch (error: any) {
            showToast("Error crítico en la consulta de APIs", "error");
            console.error(error);
        }
    };

    const handleAdjustCoins = (amount: number) => {
        if (!selectedClient || !coinAdjustmentReason) return showToast("Falta razon", "error");
        handleUpdateClient({ 
            blisCoins: selectedClient.blisCoins + amount,
            transactions: [{ id: `TX-${Date.now()}`, date: new Date().toLocaleDateString(), amount, type: 'Ajuste', description: 'Ajuste de Saldo', reason: coinAdjustmentReason }, ...selectedClient.transactions]
        }, false);
        setCoinAdjustmentReason("");
        setCoinAdjustmentAmount("0");
        showToast("Saldo actualizado", "success");
    };

    const handleAddAddress = () => {
        if (!selectedClient || !newAddress.address) return;
        handleUpdateClient({ addresses: [{ id: `AD-${Date.now()}`, ...newAddress } as Address, ...selectedClient.addresses] }, false);
        setIsAddingAddress(false);
        setNewAddress({ type: 'Envio', label: '', address: '', city: '' });
    };

    const sendCoupon = () => {
        showToast("Cupon VIP enviado", "success");
    };

    const deleteAccount = () => {
        if (!selectedClient) return;
        setConfirmationModal({
            isOpen: true, title: 'Eliminar Socio', message: '¿Confirmas la eliminacion definitiva?', type: 'danger',
            onConfirm: async () => {
                try {
                    await fetch(`/api/admin/clientes?id=${selectedClient.id}`, { method: 'DELETE' });
                    setClients(prev => prev.filter(c => c.id !== selectedClient.id));
                    setIsDetailModalOpen(false);
                    setConfirmationModal(prev => ({ ...prev, isOpen: false }));
                    showToast("Cuenta eliminada", "error");
                } catch (error) {
                    showToast("Error al eliminar", "error");
                }
            }
        });
    };

    const handleInviteToEvent = (eventName: string) => {
        if (!selectedClient) return;
        const newEvents = selectedClient.privateEvents.map(ev => ev.name === eventName ? { ...ev, access: true } : ev);
        handleUpdateClient({ privateEvents: newEvents }, false);
        showToast(`Invitación confirmada para ${eventName}`, "success");
    };

    const handleSwitchTier = (tier: string) => {
        handleUpdateClient({ tier });
        showToast(`Nivel cambiado a ${tier}`, "success");
    };

    const handleTransferSim = () => {
        if(!selectedClient) return;
        showToast(`Simulando transferencia de 10 BC a ID-999...`, "info");
        setTimeout(() => {
            handleUpdateClient({ blisCoins: selectedClient.blisCoins - 10 });
            showToast("Transferencia completada", "success");
        }, 1500);
    };

    const handleResetPassword = () => {
        showToast("Enlace de reseteo enviado por email", "success");
    };

    return (
        <div className="space-y-6 w-full mx-auto pb-20 px-4 md:px-8 pt-8 text-white">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-10">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-blis-red font-black text-[10px] uppercase tracking-[0.4em] mb-1 animate-pulse"><Shield className="w-3.5 h-3.5" /> COMUNIDAD BLIS CORP PRO</div>
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">Administracion de Socios</h1>
                    <p className="text-gray-500 text-sm font-medium max-w-2xl">Gestiona el ecosistema de socios y monitorea el flujo de BlisCoins.</p>
                </div>                <div className="flex items-center gap-4">
                    <button onClick={() => setIsRankingView(!isRankingView)} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${isRankingView ? 'bg-amber-500 text-black' : 'bg-white/5 text-gray-400'}`}><Trophy className="w-4 h-4" /> Ranking</button>
                    <button className="px-8 py-4 bg-blis-red text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl"><Plus className="w-5 h-5" /></button>
                </div>
            </div>

            {/* Global KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {[
                    { label: 'Total Socios', val: clients.length, icon: Users, color: 'text-white' },
                    { label: 'Boveda Global', val: clients.reduce((acc, c) => acc + c.blisCoins, 0), icon: Coins, color: 'text-amber-500', unit: 'BC' },
                    { label: 'Recaudacion Mes', val: clients.reduce((acc, c) => acc + c.income, 0), icon: TrendingUp, color: 'text-emerald-500', unit: '$' },
                    { label: 'Churn Risk Avg', val: 'Low', icon: Brain, color: 'text-indigo-500' }
                ].map((kpi, i) => (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} className="p-8 bg-zinc-950 border border-white/5 rounded-[2.5rem] shadow-4xl group hover:border-white/20 transition-all flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{kpi.label}</span>
                            <div className={`text-3xl font-black ${kpi.color}`}>{kpi.unit === '$' ? '$' : ''}{kpi.val}{kpi.unit === 'BC' ? ' BC' : ''}</div>
                        </div>
                        <div className={`w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${kpi.color}`}><kpi.icon className="w-7 h-7" /></div>
                    </motion.div>
                ))}
            </div>

            {/* List/Grid Section */}
            <div className="bg-zinc-950 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-4xl mb-12">
                <div className="p-8 border-b border-white/5 flex flex-col lg:flex-row gap-8 items-center justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-600" />
                        <input type="text" placeholder="Buscar socio..." className="w-full bg-black/50 border-2 border-white/5 rounded-2xl pl-14 pr-6 py-4 text-xs outline-none focus:border-blis-red transition-all" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-black/40 p-1.5 rounded-2xl border border-white/10 flex gap-2">
                            <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-xl ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-600'}`}><LayoutList className="w-4.5 h-4.5" /></button>
                            <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-xl ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-600'}`}><LayoutGrid className="w-4.5 h-4.5" /></button>
                        </div>
                        <CustomSelect 
                            value={activityFilter} 
                            options={[
                                { value: "Todos", label: "Toda la Red" },
                                { value: "Premium", label: "Socio Premium" },
                                { value: "Socio", label: "Socio Activo" },
                                { value: "Verificado", label: "Verificados" }
                            ]} 
                            onChange={setActivityFilter} 
                            icon={Filter}
                            className="w-48"
                        />
                    </div>
                </div>

                {isRankingView && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="px-8 pb-8 flex flex-wrap gap-4 border-b border-white/5">
                        <div className="flex-1 min-w-[200px] p-6 bg-amber-500/10 border border-amber-500/20 rounded-[2rem] flex items-center gap-4">
                            <div className="text-2xl font-black text-amber-500">#1</div>
                            <div className="flex flex-col"><span className="text-[10px] font-black uppercase text-amber-500/60">Top Compras</span><span className="text-sm font-black">Carlos Perez</span></div>
                        </div>
                        <div className="flex-1 min-w-[200px] p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-[2rem] flex items-center gap-4">
                            <div className="text-2xl font-black text-indigo-500">#1</div>
                            <div className="flex flex-col"><span className="text-[10px] font-black uppercase text-indigo-500/60">Top Academia</span><span className="text-sm font-black">Ana Garcia</span></div>
                        </div>
                        <div className="flex-1 min-w-[200px] p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] flex items-center gap-4">
                            <div className="text-2xl font-black text-emerald-500">#1</div>
                            <div className="flex flex-col"><span className="text-[10px] font-black uppercase text-emerald-500/60">Top Referidos</span><span className="text-sm font-black">Luis Torres</span></div>
                        </div>
                    </motion.div>
                )}

                {viewMode === 'list' ? (
                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 animate-spin text-blis-red" />
                                <span className="ml-3 text-gray-500">Cargando socios...</span>
                            </div>
                        ) : filteredClients.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                                <Users className="w-12 h-12 mb-4 opacity-30" />
                                <span className="text-sm font-black uppercase">No se encontraron socios</span>
                            </div>
                        ) : (
                        <table className="w-full text-left">
                            <thead className="bg-zinc-900 font-black text-[10px] text-gray-500 uppercase tracking-[0.4em]">
                                <tr>
                                    <th className="px-8 py-6">Socio & Perfil</th>
                                    <th className="px-6 py-6 text-center">Nivel / Tier</th>
                                    <th className="px-6 py-6 text-center">Estado Ops</th>
                                    <th className="px-6 py-6 text-center">Boveda (BC)</th>
                                    <th className="px-6 py-6 text-center">Total Compra</th>
                                    <th className="px-6 py-6 text-right">Acciones Directas</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredClients.map(c => (
                                    <tr key={c.id} className="group hover:bg-white/[0.01] transition-all cursor-pointer" onClick={() => { setSelectedClient(c); setIsDetailModalOpen(true); }}>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="relative group">
                                                    <div className="w-12 h-12 rounded-2xl bg-zinc-900 border-2 border-white/5 flex items-center justify-center text-blis-red text-lg font-black shadow-xl group-hover:scale-105 transition-transform">{c.avatar}</div>
                                                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-black ${c.isAccountFrozen ? 'bg-rose-500' : 'bg-emerald-500'}`} title={c.isAccountFrozen ? 'Cuenta Congelada' : 'Cuenta Activa'} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black group-hover:text-blis-red transition-all">{c.firstName} {c.lastName}</span>
                                                    <span className="text-[10px] text-gray-600 font-black uppercase tracking-tight">{c.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <span className={`text-[9px] font-black uppercase px-4 py-1.5 rounded-full border ${
                                                c.tier.includes('Platinum') ? 'bg-neutral-900 border-neutral-700 text-neutral-300' :
                                                c.tier.includes('Gold') ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                                                c.tier.includes('Silver') ? 'bg-zinc-300/10 border-zinc-300/20 text-zinc-400' :
                                                'bg-white/5 border-white/10 text-gray-500'
                                            }`}>{c.tier}</span>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <span className={`text-[9px] font-black uppercase px-4 py-1.5 rounded-full border ${
                                                c.status === 'Verificado' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-lg shadow-emerald-500/10' :
                                                c.status === 'Premium' ? 'bg-blis-red/10 border-blis-red/20 text-blis-red shadow-lg shadow-blis-red/10 animate-pulse' :
                                                'bg-white/5 border-white/10 text-gray-500'
                                            }`}>{c.status}</span>
                                        </td>
                                        <td className="px-6 py-6 text-center font-black text-amber-500 text-xs tracking-widest">{formatCurrency(c.blisCoins)} BC</td>
                                        <td className="px-6 py-6 text-center font-black text-white text-xs">${formatCurrency(c.income)}</td>
                                        <td className="px-8 py-6 text-right" onClick={e => e.stopPropagation()}>
                                            <div className="flex justify-end gap-2">
                                                <a href={`https://wa.me/${c.phone.replace(/\+/g, '').replace(/\s/g, '')}?text=Hola%20${c.firstName},%20un%20gusto%20saludarte.`} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-emerald-600/10 text-emerald-500 border border-emerald-500/10 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-xl shadow-emerald-900/10"><Smartphone className="w-4 h-4" /></a>
                                                <button onClick={() => { setSelectedClient(c); setIsDetailModalOpen(true); }} className="p-2.5 bg-white/5 text-gray-500 border border-white/10 rounded-xl hover:bg-blis-red hover:text-white transition-all shadow-xl"><Edit3 className="w-4 h-4" /></button>
                                                <button className="p-2.5 bg-white/5 text-gray-800 border border-white/10 rounded-xl hover:bg-white hover:text-black transition-all shadow-xl"><ChevronRight className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        )}
                    </div>
                ) : (
                    <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {isLoading ? (
                            <div className="col-span-full flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 animate-spin text-blis-red" />
                                <span className="ml-3 text-gray-500">Cargando socios...</span>
                            </div>
                        ) : filteredClients.length === 0 ? (
                            <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500">
                                <Users className="w-12 h-12 mb-4 opacity-30" />
                                <span className="text-sm font-black uppercase">No se encontraron socios</span>
                            </div>
                        ) : (
                        filteredClients.map(c => (
                            <div key={c.id} onClick={() => { setSelectedClient(c); setIsDetailModalOpen(true); }} className="relative p-8 bg-zinc-900 border border-white/5 rounded-[3rem] hover:border-blis-red/50 transition-all cursor-pointer group flex flex-col items-center text-center space-y-4 shadow-3xl hover:shadow-blis-red/5">
                                <div className="absolute top-6 right-6">
                                    <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-lg border ${
                                        c.tier.includes('Gold') ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                                        c.tier.includes('Platinum') ? 'bg-neutral-800 border-neutral-700 text-neutral-300' :
                                        'bg-white/5 border-white/10 text-gray-500'
                                    }`}>{c.tier.replace(' Member', '')}</span>
                                </div>
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-[2rem] bg-zinc-950 border-2 border-white/10 flex items-center justify-center text-4xl font-black text-blis-red transition-transform group-hover:scale-110 shadow-2xl">{c.avatar}</div>
                                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-zinc-900 ${c.isAccountFrozen ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-black text-lg text-white group-hover:text-blis-red transition-colors">{c.firstName} {c.lastName}</h3>
                                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{c.email}</p>
                                </div>
                                <div className="flex flex-col gap-2 pt-2 w-full">
                                    <div className="text-emerald-500 font-black text-lg">{formatCurrency(c.blisCoins)} <span className="text-[10px]">BC</span></div>
                                    <span className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-xl border self-center ${
                                        c.status === 'Verificado' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                                        c.status === 'Premium' ? 'bg-blis-red/10 border-blis-red/20 text-blis-red' :
                                        'bg-white/5 border-white/10 text-gray-400'
                                    }`}>{c.status}</span>
                                </div>
                            </div>
                        ))
                        )}
                    </div>
                )}
            </div>

            {/* Admin Detail Modal */}
            <AnimatePresence>
                {isDetailModalOpen && selectedClient && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDetailModalOpen(false)} className="absolute inset-0 bg-black/95 backdrop-blur-2xl" />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-6xl bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] shadow-4xl overflow-hidden h-[90vh] flex flex-col lg:flex-row">
                            
                            <div className="w-full lg:w-72 border-r border-white/5 bg-black/40 p-6 flex flex-col shrink-0 overflow-y-auto scrollbar-hide">
                                <div className="flex flex-col items-center mb-10 px-4">
                                    <div className="w-20 h-20 rounded-[1.5rem] bg-zinc-900 border-2 border-white/10 flex items-center justify-center text-3xl font-black text-blis-red shadow-2xl mb-4">{selectedClient.isCompany ? selectedClient.companyName.charAt(0) : selectedClient.avatar}</div>
                                    <h2 className="text-center font-black uppercase text-white text-base leading-tight break-words w-full">{selectedClient.isCompany ? selectedClient.companyName : `${selectedClient.firstName} ${selectedClient.lastName}`}</h2>
                                    <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-2">{selectedClient.role}</span>
                                </div>
                                <nav className="space-y-1.5 flex-1 p-2">
                                    {[
                                        { id: 'profile', label: 'Info Socio', icon: UserCog },
                                        { id: 'economy', label: 'Boveda', icon: BadgeDollarSign },
                                        { id: 'sales', label: 'Ventas', icon: ShoppingCart },
                                        { id: 'referrals', label: 'Red & Referidos', icon: Users },
                                        { id: 'comms', label: 'Comunica', icon: MessageCircle },
                                        { id: 'addresses', label: 'Ubicacion', icon: MapPin },
                                        { id: 'academia', label: 'Academia', icon: GraduationCap },
                                        { id: 'ai_insights', label: 'AI Insights', icon: Brain },
                                        { id: 'automations', label: 'Automatiza', icon: Zap },
                                        { id: 'history', label: 'Auditoria', icon: Clock }
                                    ].map(tab => (
                                        <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full flex items-center gap-3 px-5 py-3 rounded-2xl text-[11px] font-black uppercase transition-all ${activeTab === tab.id ? 'bg-blis-red text-white shadow-xl translate-x-1' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
                                            <tab.icon className="w-4 h-4" /> {tab.label}
                                        </button>
                                    ))}
                                </nav>
                                <div className="p-6 border-t border-white/5 mt-6 space-y-3">
                                    <button 
                                        onClick={() => {
                                            handleUpdateClient({ isAccountFrozen: !selectedClient.isAccountFrozen });
                                            showToast(selectedClient.isAccountFrozen ? "Cuenta reactivada" : "Cuenta congelada temporalmente", "info");
                                        }} 
                                        className={`w-full py-3 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all border ${selectedClient.isAccountFrozen ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                                    >
                                        <Snowflake className="w-3.5 h-3.5" />
                                        {selectedClient.isAccountFrozen ? "Cuenta Congelada" : "Congelar Cuenta"}
                                    </button>
                                    
                                    <button 
                                        onClick={() => {
                                            // Simulación de toggle destacado
                                            showToast("Estado VIP actualizado", "success");
                                        }} 
                                        className="w-full py-3 rounded-2xl text-[10px] font-black uppercase bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all border border-white/5 flex items-center justify-center gap-2"
                                    >
                                        <Sparkles className="w-3.5 h-3.5" /> Socio Destacado
                                    </button>

                                    <button onClick={() => showToast("Iniciando fusión segura...", "info")} className="w-full py-3 rounded-2xl text-[10px] font-black uppercase bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all border border-white/5 flex items-center justify-center gap-2">
                                        <GitMerge className="w-3.5 h-3.5" /> Fusionar Cuentas
                                    </button>

                                    <button onClick={() => showToast("Generando QR de acceso...", "info")} className="w-full py-3 rounded-2xl text-[10px] font-black uppercase bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all border border-white/5 flex items-center justify-center gap-2">
                                        <QrCode className="w-3.5 h-3.5" /> Descargar QR
                                    </button>

                                    <div className="h-4" />
                                    <button onClick={deleteAccount} className="w-full py-4 rounded-2xl text-[10px] font-black uppercase bg-rose-600 text-white hover:bg-rose-500 transition-all shadow-xl shadow-rose-950/20 flex items-center justify-center gap-2">
                                        <Trash2 className="w-4 h-4" /> Eliminar Socio
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto scrollbar-hide relative p-8 md:p-12">
                                <AnimatePresence mode="wait">
                                    {activeTab === 'profile' && (
                                        <motion.div key="p" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                            <div className="flex justify-between items-center border-b border-white/5 pb-6">
                                                <div><h3 className="text-lg font-black uppercase tracking-tighter">Expediente del Socio</h3><p className="text-[10px] text-gray-500 uppercase font-black">ID: BLIS-{selectedClient.id.toString().padStart(4,'0')} • Miembro desde {selectedClient.joined}</p></div>
                                                <div className="flex gap-3">
                                                    <a href={`https://wa.me/${selectedClient.phone.replace(/\+/g, '').replace(/\s/g, '')}?text=Hola%20${selectedClient.firstName},%20un%20gusto%20saludarte.`} target="_blank" rel="noopener noreferrer" className="p-3 bg-emerald-600/10 text-emerald-500 border border-emerald-500/20 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all shadow-xl shadow-emerald-900/10"><Smartphone className="w-5 h-5" /></a>
                                                    <button onClick={handleResetPassword} className="p-3 bg-blue-600/10 text-blue-500 border border-blue-500/20 rounded-2xl hover:bg-blue-500 hover:text-white transition-all shadow-xl shadow-blue-900/10"><Key className="w-5 h-5" /></button>
                                                    <button onClick={validateIdentity} className="px-6 py-2 bg-zinc-950 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase hover:bg-white hover:text-black transition-all shadow-xl">Verificar Identidad</button>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-10">
                                                {/* Grupo 1: Información Básica */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    <div className="space-y-2"><label className="text-[10px] text-gray-600 font-black uppercase ml-1">Nombre</label><input type="text" value={selectedClient.firstName} onChange={e => handleUpdateClient({ firstName: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-black outline-none focus:border-blis-red transition-all" /></div>
                                                    <div className="space-y-2"><label className="text-[10px] text-gray-600 font-black uppercase ml-1">Apellidos</label><input type="text" value={selectedClient.lastName} onChange={e => handleUpdateClient({ lastName: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-black outline-none focus:border-blis-red transition-all" /></div>
                                                    <div className="space-y-2"><label className="text-[10px] text-gray-600 font-black uppercase ml-1">Email Principal</label><input type="text" value={selectedClient.email} onChange={e => handleUpdateClient({ email: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-blis-red transition-all" /></div>
                                                </div>

                                                {/* Grupo 2: Nivel y Documento */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
                                                    <CustomSelect 
                                                        label="Nivel Socio" 
                                                        value={selectedClient.tier} 
                                                        options={[
                                                            { value: "Bronze Member", label: "Bronze Member" },
                                                            { value: "Silver Member", label: "Silver Member" },
                                                            { value: "Gold Member", label: "Gold Member" },
                                                            { value: "Platinum Member", label: "Platinum Member" }
                                                        ]} 
                                                        onChange={handleSwitchTier} 
                                                        icon={Star}
                                                    />
                                                    <CustomSelect 
                                                        label="Tipo Doc." 
                                                        value={selectedClient.documentType || "DNI"} 
                                                        options={[
                                                            { value: "DNI", label: "DNI (8 d)" },
                                                            { value: "RUC", label: "RUC (11 d)" },
                                                            { value: "Cedula", label: "Cédula (10)" },
                                                            { value: "Pasaporte", label: "Pasaporte" }
                                                        ]} 
                                                        onChange={(v) => handleUpdateClient({ documentType: v as any })} 
                                                        icon={Shield}
                                                    />
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] text-gray-600 font-black uppercase ml-1">Número Identidad</label>
                                                        <div className="relative">
                                                            <input type="text" value={selectedClient.dni} onChange={e => handleUpdateClient({ dni: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-black outline-none focus:border-blis-red transition-all pr-12" placeholder="Número..." />
                                                            <button onClick={validateIdentity} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-blis-red/20 text-blis-red rounded-xl hover:bg-blis-red hover:text-white transition-all"><Search className="w-4 h-4" /></button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Grupo 3: Datos Personales */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                                                    <CustomDatePicker 
                                                        label="Fecha Nacimiento" 
                                                        value={selectedClient.birthday} 
                                                        onChange={v => handleUpdateClient({ birthday: v })} 
                                                    />
                                                    <CustomSelect 
                                                        label="Estado Civil" 
                                                        value={selectedClient.maritalStatus || "Soltero"} 
                                                        options={[
                                                            { value: "Soltero", label: "Soltero/a" },
                                                            { value: "Casado", label: "Casado/a" },
                                                            { value: "Divorciado", label: "Divorciado/a" },
                                                            { value: "Viudo", label: "Viudo/a" }
                                                        ]} 
                                                        onChange={(v) => handleUpdateClient({ maritalStatus: v })} 
                                                        icon={User}
                                                    />
                                                    <div className="space-y-2"><label className="text-[10px] text-gray-600 font-black uppercase ml-1">Profesión</label><input type="text" value={selectedClient.profession} onChange={e => handleUpdateClient({ profession: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:border-blis-red transition-all" /></div>
                                                    <div className="space-y-2"><label className="text-[10px] text-gray-600 font-black uppercase ml-1">Grado Académico</label><input type="text" value={selectedClient.education} onChange={e => handleUpdateClient({ education: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:border-blis-red transition-all" /></div>
                                                </div>

                                                <div className="space-y-2"><label className="text-[10px] text-gray-600 font-black uppercase ml-1">Notas Internas Ops</label><textarea value={selectedClient.internalNotes} onChange={e => handleUpdateClient({ internalNotes: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-4 text-xs outline-none focus:border-blis-red transition-all min-h-[100px]" placeholder="Observaciones críticas de gestión..." /></div>
                                            </div>

                                            {selectedClient.isCompany && (
                                                <div className="p-10 bg-gradient-to-br from-zinc-900/50 to-black/30 border border-white/5 rounded-[3.5rem] space-y-8">
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center gap-3 text-blis-red"><Building2 className="w-6 h-6" /><h4 className="text-sm font-black uppercase tracking-widest">Estructura Corporativa: {selectedClient.companyName}</h4></div>
                                                        <span className="text-[9px] font-black px-4 py-1.5 bg-blis-red/10 text-blis-red rounded-full border border-blis-red/20 uppercase tracking-widest">Cuenta RUC Activa</span>
                                                    </div>
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-left">
                                                            <thead className="bg-white/5 font-black text-[9px] text-gray-500 uppercase tracking-widest">
                                                                <tr>
                                                                    <th className="px-6 py-4">Colaborador</th>
                                                                    <th className="px-6 py-4">Rol</th>
                                                                    <th className="px-6 py-4">Antigüedad</th>
                                                                    <th className="px-6 py-4 text-right">Acción</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-white/5">
                                                                {selectedClient.managedEmployees?.map((emp, i) => (
                                                                    <tr key={i} className="group hover:bg-white/[0.02]">
                                                                        <td className="px-6 py-4 text-xs font-bold text-white">{emp.name}</td>
                                                                        <td className="px-6 py-4 text-[10px] text-gray-400 font-black uppercase">{emp.role}</td>
                                                                        <td className="px-6 py-4 text-[10px] text-gray-500 uppercase">{emp.joined}</td>
                                                                        <td className="px-6 py-4 text-right"><button className="p-2 opacity-0 group-hover:opacity-100 transition-all text-gray-600 hover:text-white"><Eye className="w-4 h-4" /></button></td>
                                                                    </tr>
                                                                ))}
                                                                {(!selectedClient.managedEmployees || selectedClient.managedEmployees.length === 0) && (
                                                                    <tr><td colSpan={4} className="px-6 py-10 text-center text-[10px] text-gray-700 font-black uppercase italic tracking-widest">No hay colaboradores registrados en esta nómina.</td></tr>
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase hover:bg-white/10 transition-all">+ Dar de Alta Colaborador</button>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}

                                    {activeTab === 'economy' && (
                                        <motion.div key="economy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                                            <div className="relative group">
                                                <div className="p-10 bg-gradient-to-br from-zinc-900 to-black border border-white/5 rounded-[3rem] text-center space-y-4 shadow-3xl">
                                                    <div className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em]">Saldo Disponible</div>
                                                    <div className={`text-7xl font-black transition-all ${selectedClient.isAccountFrozen ? 'text-gray-600' : 'text-white'}`}>{formatCurrency(selectedClient.blisCoins)} <span className="text-3xl text-amber-500">BC</span></div>
                                                    {selectedClient.isAccountFrozen && <div className="text-[9px] font-black text-rose-500 uppercase flex items-center justify-center gap-1"><Lock className="w-3 h-3" /> FONDOS CONGELADOS</div>}
                                                </div>
                                                <div className="absolute top-6 right-8 flex gap-3">
                                                    <button onClick={() => handleUpdateClient({ isAccountFrozen: !selectedClient.isAccountFrozen })} className={`p-3 rounded-2xl border transition-all ${selectedClient.isAccountFrozen ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'}`}><Lock className="w-4 h-4" /></button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                                                {/* Card 1: Formulario de Ajuste */}
                                                <div className="p-8 bg-zinc-900 border border-white/5 rounded-[3rem] space-y-6 shadow-2xl h-full">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20"><BadgeDollarSign className="w-5 h-5 text-amber-500" /></div>
                                                            <h4 className="text-sm font-black uppercase tracking-tighter">Ajuste de Bóveda</h4>
                                                        </div>
                                                        <div className="flex items-center gap-2 px-4 py-2 bg-black/40 rounded-xl border border-white/5">
                                                            <Calendar className="w-3.5 h-3.5 text-gray-600" />
                                                            <input type="date" value={selectedClient.coinsExpiration} onChange={e => handleUpdateClient({ coinsExpiration: e.target.value })} className="bg-transparent text-[10px] font-black uppercase outline-none w-28 text-white" />
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] text-gray-600 font-black uppercase ml-1">Monto de Ajuste</label>
                                                            <input type="number" placeholder="0" value={coinAdjustmentAmount} onChange={e => setCoinAdjustmentAmount(e.target.value)} className="w-full bg-black/60 border border-white/5 rounded-2xl px-6 py-4 text-sm font-black outline-none focus:border-amber-500 transition-all placeholder:text-gray-800" />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] text-gray-600 font-black uppercase ml-1">Límite Crédito</label>
                                                            <div className="relative">
                                                                <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                                                <input type="number" value={selectedClient.creditLimit} onChange={e => handleUpdateClient({ creditLimit: Number(e.target.value) })} className="w-full bg-black/60 border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-sm font-black outline-none focus:border-blue-500 transition-all" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] text-gray-600 font-black uppercase ml-1">Razón del Movimiento</label>
                                                        <textarea placeholder="Explica el motivo del cambio..." value={coinAdjustmentReason} onChange={e => setCoinAdjustmentReason(e.target.value)} className="w-full bg-black/60 border border-white/5 rounded-2xl px-6 py-4 text-xs min-h-[100px] outline-none focus:border-white/20 transition-all" />
                                                    </div>

                                                    <div className="grid grid-cols-3 gap-3">
                                                        <button onClick={() => handleAdjustCoins(Number(coinAdjustmentAmount))} className="py-4 bg-emerald-600/10 text-emerald-500 border border-emerald-500/20 rounded-2xl font-black uppercase text-[9px] hover:bg-emerald-600 hover:text-white transition-all shadow-lg hover:shadow-emerald-500/20">+ Abonar</button>
                                                        <button onClick={() => handleAdjustCoins(-Number(coinAdjustmentAmount))} className="py-4 bg-rose-600/10 text-rose-500 border border-rose-500/20 rounded-2xl font-black uppercase text-[9px] hover:bg-rose-600 hover:text-white transition-all shadow-lg hover:shadow-rose-500/20">- Retirar</button>
                                                        <button onClick={handleTransferSim} className="py-4 bg-blue-600/10 text-blue-500 border border-blue-500/20 rounded-2xl font-black uppercase text-[9px] hover:bg-blue-600 hover:text-white transition-all shadow-lg hover:shadow-blue-500/20 flex items-center justify-center gap-2"><ArrowRightLeftIcon className="w-3.5 h-3.5" /> Enviar</button>
                                                    </div>
                                                </div>

                                                {/* Card 2: Historial de Movimientos */}
                                                <div className="p-8 bg-zinc-900 border border-white/5 rounded-[3rem] shadow-4xl flex flex-col h-full max-h-[500px] overflow-hidden">
                                                    <div className="flex items-center gap-4 mb-8 shrink-0">
                                                        <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20 shadow-lg shadow-amber-900/10"><History className="w-6 h-6 text-amber-500" /></div>
                                                        <div className="flex flex-col"><h4 className="text-xs font-black uppercase tracking-widest text-white">Historial Bóveda</h4><p className="text-[9px] text-gray-600 font-bold uppercase">Últimos movimientos registrados</p></div>
                                                    </div>
                                                    <div className="space-y-4 overflow-y-auto scrollbar-hide flex-1 pr-1 pb-4">
                                                        {selectedClient.transactions.length === 0 ? (
                                                            <div className="flex flex-col items-center justify-center p-16 opacity-10 border-2 border-dashed border-white/5 rounded-[2.5rem]"><History className="w-16 h-16 mb-4" /><span className="text-[10px] font-black uppercase">Sin actividad</span></div>
                                                        ) : (
                                                            selectedClient.transactions.map(tx => (
                                                                <div key={tx.id} className="p-5 bg-black/40 border border-white/5 rounded-[1.8rem] flex justify-between items-center group hover:border-amber-500/30 hover:bg-white/[0.05] transition-all shrink-0 cursor-default">
                                                                    <div className="flex flex-col gap-1">
                                                                        <span className="text-xs font-black text-white group-hover:text-amber-500 transition-all leading-none">{tx.description}</span>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-[9px] text-gray-600 font-black uppercase tracking-wider">{tx.date}</span>
                                                                            <span className="w-1 h-1 rounded-full bg-white/10" />
                                                                            <span className="text-[8px] text-gray-700 font-black uppercase">{tx.type}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className={`px-4 py-2 rounded-xl text-xs font-black shadow-xl ${tx.amount >= 0 ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10' : 'bg-rose-500/20 text-rose-500 border border-rose-500/10'}`}>{tx.amount >= 0 ? '+' : ''}{tx.amount} <span className="text-[9px]">BC</span></div>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'sales' && (
                                        <motion.div key="sales" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                            <div className="flex flex-col md:flex-row justify-between items-center border-b border-white/5 pb-8 gap-6">
                                                <div className="flex flex-col"><h3 className="text-sm font-black uppercase tracking-widest mb-1">Actividad Comercial</h3><p className="text-[10px] text-gray-500 uppercase">{selectedClient.purchases} Operaciones registradas</p></div>
                                                <div className="bg-black/40 p-1.5 rounded-2xl border border-white/10 flex gap-2">
                                                    <button onClick={() => setOrderViewMode('Venta')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${orderViewMode === 'Venta' ? 'bg-blis-red text-white' : 'text-gray-500 hover:text-white'}`}>Ventas</button>
                                                    <button onClick={() => setOrderViewMode('Cotizacion')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${orderViewMode === 'Cotizacion' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-white'}`}>Cotizaciones</button>
                                                </div>
                                            </div>

                                            {selectedClient.abandonedCart && (
                                                <div className="p-6 md:p-8 bg-amber-500/10 border border-amber-500/20 rounded-[2.5rem] relative overflow-hidden transition-all duration-500">
                                                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-14 h-14 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500 shadow-xl shadow-amber-950/30"><ShoppingCart className="w-6 h-6" /></div>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-black text-amber-500 uppercase tracking-tighter">Carrito Abandonado</span>
                                                                <span className="text-[11px] text-gray-400 font-bold uppercase">{selectedClient.abandonedCart.items} items por ${selectedClient.abandonedCart.total.toFixed(2)}</span>
                                                            </div>
                                                        </div>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); setIsConfiguringCoupon(!isConfiguringCoupon); }} 
                                                            className={`px-8 py-4 rounded-2xl font-black uppercase text-[10px] transition-all flex items-center gap-2 z-10 shadow-2xl ${isConfiguringCoupon ? 'bg-white/10 text-white' : 'bg-amber-500 text-black hover:scale-105 active:scale-95'}`}
                                                        >
                                                            <Ticket className="w-4 h-4" /> 
                                                            {isConfiguringCoupon ? 'Cerrar Opción' : 'Lanzar Cupón VIP'}
                                                        </button>
                                                    </div>
                                                    
                                                    <AnimatePresence>
                                                        {isConfiguringCoupon && (
                                                            <motion.div 
                                                                initial={{ height: 0, opacity: 0, marginTop: 0 }} 
                                                                animate={{ height: 'auto', opacity: 1, marginTop: 24 }} 
                                                                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="p-6 bg-black/40 rounded-[2rem] border border-white/5 flex flex-col lg:flex-row items-end gap-6 shadow-4xl">
                                                                    <div className="flex-1 w-full space-y-2">
                                                                        <label className="text-[9px] font-black uppercase text-gray-600 ml-1 tracking-widest">Código Personalizado</label>
                                                                        <input type="text" value={couponForm.code} onChange={e => setCouponForm({...couponForm, code: e.target.value})} className="w-full bg-white/5 border-2 border-white/5 rounded-xl px-5 py-3 text-xs font-bold outline-none focus:border-amber-500 transition-all" placeholder="EJ: VIP-PROMO" />
                                                                    </div>
                                                                    <div className="w-full lg:w-40 space-y-2">
                                                                        <label className="text-[9px] font-black uppercase text-gray-600 ml-1 tracking-widest">Descuento %</label>
                                                                        <input type="number" value={couponForm.discount} onChange={e => setCouponForm({...couponForm, discount: Number(e.target.value)})} className="w-full bg-white/5 border-2 border-white/5 rounded-xl px-5 py-3 text-xs font-bold outline-none focus:border-amber-500 transition-all text-center" />
                                                                    </div>
                                                                    <button 
                                                                        onClick={() => { showToast(`¡Cupón ${couponForm.code} enviado con éxito!`, "success"); setIsConfiguringCoupon(false); }} 
                                                                        className="w-full lg:w-auto px-10 py-4 bg-emerald-500 text-black rounded-xl font-black uppercase text-[10px] hover:bg-emerald-400 active:scale-95 transition-all shadow-xl shadow-emerald-950/30 whitespace-nowrap"
                                                                    >
                                                                        Enviar Oferta Ahora
                                                                    </button>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 gap-4">
                                                {selectedClient.orders.filter(o => o.type === orderViewMode).length === 0 ? (
                                                    <div className="p-12 text-center border-2 border-dashed border-white/5 rounded-[2.5rem] opacity-30 flex flex-col items-center"><FileText className="w-12 h-12 mb-4" /><span className="text-[10px] font-black uppercase">No se hallaron registros de {orderViewMode}</span></div>
                                                ) : (
                                                    selectedClient.orders.filter(o => o.type === orderViewMode).map(order => (
                                                        <div key={order.id} onClick={() => setSelectedOrder(order)} className="p-6 bg-zinc-900 border border-white/5 rounded-3xl flex justify-between items-center hover:border-blue-500/30 cursor-pointer transition-all group">
                                                            <div className="flex items-center gap-4">
                                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${order.type === 'Venta' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-400'}`}><FileText className="w-6 h-6" /></div>
                                                                <div className="flex flex-col"><span className="text-xs font-black uppercase group-hover:text-blue-400 transition-colors">{order.id}</span><span className="text-[9px] text-gray-600 uppercase">{order.date}</span></div>
                                                            </div>
                                                            <div className="flex items-center gap-8">
                                                                <div className="hidden md:flex flex-col items-end"><span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">{order.items} Producto(s)</span><div className="flex gap-1.5 mt-1">{[1,2,3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-white/10" />)}</div></div>
                                                                <div className="flex flex-col items-end"><span className="text-sm font-black text-white">${order.total.toFixed(2)}</span><span className={`text-[8px] font-black px-2.5 py-1 rounded-lg uppercase ${order.status === 'Pagado' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/20 text-amber-500'}`}>{order.status}</span></div>
                                                                <ChevronRight className="w-5 h-5 text-gray-800 group-hover:text-white transition-all group-hover:translate-x-1" />
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'addresses' && (
                                        <motion.div key="addresses" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                            <div className="flex justify-between items-center"><h3 className="text-sm font-black uppercase">Direcciones Guardadas</h3><button onClick={() => setIsAddingAddress(!isAddingAddress)} className="p-2 bg-white/5 rounded-xl">{isAddingAddress ? <X /> : <Plus />}</button></div>
                                            {isAddingAddress && (
                                                <div className="p-8 bg-zinc-900 border border-white/10 rounded-3xl space-y-4">
                                                    <input placeholder="Etiqueta..." className="w-full bg-black/40 border p-4 rounded-xl text-xs" value={newAddress.label} onChange={e => setNewAddress({...newAddress, label: e.target.value})} />
                                                    <input placeholder="Direccion..." className="w-full bg-black/40 border p-4 rounded-xl text-xs" value={newAddress.address} onChange={e => setNewAddress({...newAddress, address: e.target.value})} />
                                                    <button onClick={handleAddAddress} className="w-full py-4 bg-blis-red text-white rounded-xl font-black uppercase text-[10px]">Guardar</button>
                                                </div>
                                            )}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {selectedClient.addresses.map(addr => (
                                                    <div key={addr.id} className="p-6 bg-zinc-900 border border-white/5 rounded-3xl hover:border-white/20 transition-all">
                                                        <div className="text-[9px] font-black text-gray-600 uppercase mb-2">{addr.type}</div>
                                                        <h4 className="font-black text-sm uppercase mb-1">{addr.label}</h4>
                                                        <p className="text-[10px] text-gray-500 truncate">{addr.address}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'comms' && (
                                        <motion.div key="comms" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                            <div className="bg-zinc-900 border border-white/5 rounded-[2.5rem] p-8 space-y-8">
                                                <div className="flex justify-between items-center"><h3 className="text-sm font-black uppercase">Lanzar Notificacion Omnicanal</h3><div className="flex gap-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" /><span className="text-[8px] font-black uppercase text-emerald-500">Live Backend</span></div></div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] text-gray-600 font-black uppercase ml-1">Template</label>
                                                        <select value={noticeContent.template} onChange={e => {
                                                            const val = e.target.value;
                                                            if(val === 'welcome') setNoticeContent({ template: val, title: '¡Bienvenido a Blis Corp!', message: `Hola ${selectedClient.firstName}, es un gusto tenerte con nosotros.` });
                                                            else if(val === 'offer') setNoticeContent({ template: val, title: 'Oferta Exclusiva Gold', message: 'Tienes un 20% de descuento en tu siguiente curso.' });
                                                            else setNoticeContent({ template: 'custom', title: '', message: '' });
                                                        }} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-xs outline-none focus:border-blis-red transition-all">
                                                            <option value="custom">Mensaje Personalizado</option>
                                                            <option value="welcome">Bienvenida Standard</option>
                                                            <option value="offer">Promocion de Temporada</option>
                                                            <option value="alert">Alerta de Seguridad</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] text-gray-600 font-black uppercase ml-1">Asunto</label>
                                                        <input placeholder="Asunto del mensaje..." className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-xs outline-none focus:border-blis-red transition-all" value={noticeContent.title} onChange={e => setNoticeContent({...noticeContent, title: e.target.value})} />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] text-gray-600 font-black uppercase ml-1">Cuerpo del Mensaje</label>
                                                    <textarea placeholder="Escribe el contenido aqui..." className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-xs min-h-[140px] outline-none focus:border-blis-red transition-all" value={noticeContent.message} onChange={e => setNoticeContent({...noticeContent, message: e.target.value})} />
                                                </div>
                                                <div className="flex gap-4">
                                                    <button onClick={() => { showToast("Mensaje enviado", "success"); setNoticeContent({template:'custom', title:'', message:''}) }} className="flex-1 py-4 bg-blis-red text-white rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-blis-red/20"><Send className="w-4 h-4" /> Despachar Notificacion</button>
                                                    <button onClick={() => showToast("Test enviado a tu terminal", "info")} className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase text-[10px] hover:bg-white/10 transition-all">Prueba</button>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="p-6 bg-zinc-900 border border-white/5 rounded-3xl space-y-4">
                                                    <h4 className="text-[10px] font-black uppercase text-gray-500">Eventos Privados</h4>
                                                    <div className="space-y-2">
                                                        {selectedClient.privateEvents.map(ev => (
                                                            <div key={ev.id} className="flex justify-between items-center p-3 bg-black/30 rounded-xl">
                                                                <span className="text-[10px] font-bold">{ev.name}</span>
                                                                <button onClick={() => handleInviteToEvent(ev.name)} className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${ev.access ? 'bg-emerald-500 text-black' : 'bg-white/5 text-gray-500 hover:text-white'}`}>{ev.access ? 'Invitado' : 'Invitar'}</button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="p-6 bg-zinc-900 border border-white/5 rounded-3xl flex items-center justify-between">
                                                    <div className="flex flex-col"><h4 className="text-[10px] font-black uppercase text-gray-500">Suscripcion News</h4><p className="text-xs font-bold">{selectedClient.isNewsletterSubscribed ? 'Activa' : 'Desactivada'}</p></div>
                                                    <button onClick={() => handleUpdateClient({ isNewsletterSubscribed: !selectedClient.isNewsletterSubscribed })} className={`w-12 h-6 rounded-full transition-all relative ${selectedClient.isNewsletterSubscribed ? 'bg-blis-red' : 'bg-zinc-800'}`}><div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${selectedClient.isNewsletterSubscribed ? 'left-7' : 'left-1'}`} /></button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'academia' && (
                                        <motion.div key="academia" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                <div className="space-y-6">
                                                    <div className="flex justify-between items-center"><h3 className="text-sm font-black uppercase">Progreso en Cursos</h3><GraduationCap className="w-5 h-5 text-indigo-500" /></div>
                                                    <div className="space-y-4">
                                                        {selectedClient.academicProgress.map((course, idx) => (
                                                            <div key={idx} className="p-6 bg-zinc-900 border border-white/5 rounded-3xl space-y-3">
                                                                <div className="flex justify-between items-start">
                                                                    <div className="flex flex-col"><span className="text-[11px] font-black uppercase leading-tight max-w-[200px]">{course.course}</span><span className="text-[9px] text-gray-500">Nota Final: {course.grade || 'Pendiente'}</span></div>
                                                                    {course.examStatus === 'failed_blocked' && <button onClick={() => handleReleaseExam(course.course)} className="px-3 py-1 bg-rose-500 text-black text-[8px] font-black uppercase rounded-lg hover:bg-rose-600 transition-all flex items-center gap-1"><Unlock className="w-2.5 h-2.5" /> Liberar</button>}
                                                                </div>
                                                                <div className="w-full h-2 bg-black rounded-full overflow-hidden flex"><motion.div initial={{ width: 0 }} animate={{ width: `${course.progress}%` }} className={`h-full ${course.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} /></div>
                                                                <div className="flex justify-between text-[8px] font-black uppercase text-gray-600"><span>{course.progress}% Completado</span><span>{course.attempts}/{course.maxAttempts} Intentos</span></div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="space-y-6">
                                                    <h3 className="text-sm font-black uppercase">Certificaciones</h3>
                                                    <div className="grid grid-cols-1 gap-4">
                                                        {selectedClient.certificates.length === 0 ? (
                                                            <div className="p-12 border-2 border-dashed border-white/5 rounded-[2.5rem] text-center opacity-20"><Award className="w-12 h-12 mx-auto mb-2" /><span className="text-[10px] font-black uppercase">Sin certificados</span></div>
                                                        ) : (
                                                            selectedClient.certificates.map(cert => (
                                                                <div key={cert.id} className="p-5 bg-zinc-900 border border-emerald-500/20 rounded-2xl flex justify-between items-center group">
                                                                    <div className="flex items-center gap-4"><div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500"><Award className="w-5 h-5" /></div><div className="flex flex-col"><span className="text-[10px] font-black uppercase max-w-[150px] truncate">{cert.name}</span><span className="text-[8px] text-gray-500">{cert.date}</span></div></div>
                                                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                                        <button className="p-2 bg-white/5 rounded-lg hover:bg-white/10"><Download className="w-3.5 h-3.5" /></button>
                                                                        <button onClick={() => handleDeleteCertificate(cert.id)} className="p-2 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white"><Trash2 className="w-3.5 h-3.5" /></button>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                    <div className="p-8 bg-indigo-600/10 border border-indigo-500/20 rounded-[2.5rem] space-y-4">
                                                        <h4 className="text-[10px] font-black uppercase text-indigo-400">Generar Diplomas</h4>
                                                        <p className="text-[9px] text-gray-500">Otorga un certificado manual a este socio por su participacion en programas especiales.</p>
                                                        <button className="w-full py-4 bg-indigo-500 text-black rounded-2xl font-black uppercase text-[10px] hover:bg-indigo-400">Crear Certificado</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'referrals' && (
                                        <motion.div key="referrals" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                            <div className="p-10 bg-indigo-600/10 border border-indigo-500/20 rounded-[3rem] text-center space-y-3 shadow-2xl">
                                                <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Red de Referidos</div>
                                                <div className="text-6xl font-black text-white">{selectedClient.referralCount} <span className="text-2xl text-indigo-500">Socios</span></div>
                                                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Contribuidores directos al crecimiento de Blis Corp</p>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4">
                                                <h4 className="text-sm font-black uppercase ml-2 flex items-center gap-2"><Users className="w-4 h-4 text-indigo-500" /> Socios Referidos</h4>
                                                {selectedClient.referrals.length === 0 ? (
                                                    <div className="p-12 border-2 border-dashed border-white/5 rounded-[2.5rem] text-center opacity-20"><UserCircle className="w-12 h-12 mx-auto mb-2" /><span className="text-[10px] font-black uppercase">Sin referidos directos</span></div>
                                                ) : (
                                                    selectedClient.referrals.map(ref => (
                                                        <div key={ref.id} onClick={() => setSelectedReferral(selectedReferral?.id === ref.id ? null : ref)} className="p-6 bg-zinc-900 border border-white/5 rounded-3xl flex flex-col gap-6 group hover:border-indigo-500/30 transition-all cursor-pointer overflow-hidden shadow-xl">
                                                            <div className="flex justify-between items-center w-full">
                                                                <div className="flex items-center gap-4">
                                                                    <div className={`w-12 h-12 ${ref.avatarColor || 'bg-indigo-500/10'} rounded-2xl flex items-center justify-center text-white font-black shadow-lg`}>{ref.name.charAt(0)}</div>
                                                                    <div className="flex flex-col"><span className="text-sm font-black text-white group-hover:text-indigo-400 transition-all">{ref.name}</span><span className="text-[9px] text-gray-600 uppercase tracking-widest font-black">{ref.id}</span></div>
                                                                </div>
                                                                <div className="flex flex-col items-end">
                                                                    <div className="flex items-center gap-2 flex-wrap justify-end">
                                                                         {ref.commissionBC && <span className="text-sm font-black text-amber-500 tracking-tighter">+{ref.commissionBC} BC</span>}
                                                                        {ref.commissionCash && (
                                                                            <span className="text-sm font-black text-emerald-500 flex items-center gap-1.5 px-3 py-1 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                                                                                +${ref.commissionCash.toFixed(2)} 
                                                                                {ref.commissionPercent && <span className="text-[9px] opacity-40">| {ref.commissionPercent}%</span>}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <span className="text-[8px] text-gray-700 font-black uppercase tracking-tighter mt-1">Comisión Pendiente de Pago</span>
                                                                </div>
                                                            </div>
                                                            
                                                            <AnimatePresence>
                                                                {selectedReferral?.id === ref.id && (
                                                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="pt-8 border-t border-white/5 space-y-6">
                                                                        <div className="flex justify-between items-start">
                                                                            <div className="flex flex-col">
                                                                                <h5 className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-1 items-center flex gap-2"><ShoppingBag className="w-3 h-3" /> Última Compra del Referido</h5>
                                                                                <span className="text-xs font-black text-white">{ref.lastPurchase?.name || 'Producto Desconocido'}</span>
                                                                            </div>
                                                                            <div className="flex flex-col items-end">
                                                                                <span className="text-[9px] text-gray-600 uppercase font-black">Precio del Curso</span>
                                                                                <span className="text-lg font-black text-white">${ref.lastPurchase?.price.toFixed(2)}</span>
                                                                            </div>
                                                                        </div>

                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                            {ref.commissionCash && (
                                                                                <button onClick={(e) => { e.stopPropagation(); showToast(`Pago de $${ref.commissionCash} procesado`, "success"); }} className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-[1.8rem] flex flex-col items-center gap-2 group/btn hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-950/20">
                                                                                    <div className="flex flex-col items-center">
                                                                                        <span className="text-[9px] font-black uppercase text-emerald-500 group-hover/btn:text-white">Pagar Efectivo</span>
                                                                                        {ref.commissionPercent && <span className="text-[8px] text-gray-500 group-hover/btn:text-emerald-100 uppercase font-black">({ref.commissionPercent}% del costo)</span>}
                                                                                    </div>
                                                                                    <span className="text-xl font-black text-white">${ref.commissionCash.toFixed(2)}</span>
                                                                                </button>
                                                                            )}
                                                                            {ref.commissionBC && (
                                                                                <button onClick={(e) => { e.stopPropagation(); showToast(`Pago de ${ref.commissionBC} BC procesado`, "success"); }} className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-[1.8rem] flex flex-col items-center gap-2 group/btn hover:bg-amber-500 transition-all shadow-xl shadow-amber-950/20">
                                                                                    <span className="text-[9px] font-black uppercase text-amber-500 group-hover/btn:text-white">Pagar en BlisCoins</span>
                                                                                    <span className="text-xl font-black text-white">{ref.commissionBC} BC</span>
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                            
                                            <div className="p-8 bg-black/40 border border-white/5 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-6">
                                                <div className="flex flex-col"><h4 className="text-xs font-black uppercase">Marketing de Afiliados</h4><p className="text-[10px] text-gray-500 uppercase">Genera un enlace tracker para aumentar su red.</p></div>
                                                <button className="px-8 py-4 bg-indigo-500 text-black rounded-2xl text-[10px] font-black uppercase hover:scale-105 transition-all flex items-center gap-2"><Link2 className="w-4 h-4" /> Copiar Link Tracker</button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'ai_insights' && (
                                        <motion.div key="ai_insights" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="p-8 bg-zinc-900 border border-white/5 rounded-3xl flex flex-col justify-between h-[200px]">
                                                    <div className="flex justify-between items-start"><span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Churn Risk (Fuga)</span><Brain className="w-5 h-5 text-purple-500" /></div>
                                                    <div className="flex flex-col">
                                                        <span className={`text-4xl font-black uppercase tracking-tighter ${selectedClient.churnRisk === 'low' ? 'text-emerald-500' : selectedClient.churnRisk === 'medium' ? 'text-amber-500' : 'text-rose-500'}`}>{selectedClient.churnRisk}</span>
                                                        <span className="text-[9px] text-gray-600 font-bold uppercase mt-1">Probabilidad de inactividad</span>
                                                    </div>
                                                </div>
                                                <div className="p-8 bg-zinc-900 border border-white/5 rounded-3xl flex flex-col justify-between h-[200px]">
                                                    <div className="flex justify-between items-start"><span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Lealtad (NPS)</span><Heart className="w-5 h-5 text-rose-500" /></div>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-7xl font-black text-white">{selectedClient.npsScore}</span>
                                                        <div className="flex-1 h-3 bg-black rounded-full overflow-hidden self-end mb-2"><div className="h-full bg-rose-500" style={{ width: `${selectedClient.npsScore * 10}%` }} /></div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h4 className="text-sm font-black uppercase ml-2 flex items-center gap-2"><Activity className="w-4 h-4 text-purple-500" /> Heatmap de Navegación</h4>
                                                <div className="bg-black/40 border border-white/5 rounded-3xl overflow-hidden">
                                                    <table className="w-full text-left">
                                                        <thead className="bg-white/5 font-black text-[9px] text-gray-500 uppercase tracking-widest">
                                                            <tr>
                                                                <th className="px-6 py-4">Página / Sección</th>
                                                                <th className="px-6 py-4">Categoría</th>
                                                                <th className="px-6 py-4 text-right">Visitas</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-white/5">
                                                            {selectedClient.heatMap.map((hm, i) => (
                                                                <tr key={i}>
                                                                    <td className="px-6 py-4 text-xs font-bold text-white uppercase">{hm.page}</td>
                                                                    <td className="px-6 py-4 text-[10px] text-gray-500 font-black uppercase">{hm.section}</td>
                                                                    <td className="px-6 py-4 text-right"><span className="text-xs font-black text-purple-400">{hm.visits}</span></td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            <div className="p-8 bg-zinc-900/50 border border-white/5 rounded-[2.5rem] space-y-6">
                                                <h4 className="text-sm font-black uppercase tracking-widest text-gray-400">Ofertas Sugeridas por IA</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {selectedClient.recommendedProducts.map(prod => (
                                                        <div key={prod.id} className="p-6 bg-black/40 border border-white/5 rounded-2xl flex justify-between items-center group hover:border-purple-500/30 transition-all">
                                                            <div className="flex flex-col"><span className="text-xs font-bold text-white">{prod.name}</span><span className="text-[9px] text-gray-600 font-black uppercase">{prod.match}% Match AI</span></div>
                                                            <button className="px-5 py-2 bg-purple-600/10 text-purple-500 rounded-xl text-[9px] font-black uppercase group-hover:bg-purple-600 group-hover:text-white transition-all shadow-xl">Promover</button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {selectedClient.aiTags.map((tag, i) => (
                                                    <span key={i} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-400"># {tag}</span>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'automations' && (
                                        <motion.div key="automations" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {[
                                                    { id: 'newsletter', label: 'Newsletter Semanal', desc: 'Envío de novedades y blog', state: selectedClient.isNewsletterSubscribed, icon: Newspaper, action: () => handleUpdateClient({ isNewsletterSubscribed: !selectedClient.isNewsletterSubscribed }) },
                                                    { id: 'push', label: 'Alertas Real-Time', desc: 'Notificaciones en navegador', state: selectedClient.isPushEnabled, icon: Bell, action: () => handleUpdateClient({ isPushEnabled: !selectedClient.isPushEnabled }) },
                                                    { id: 'bday', label: 'Regalo Cumpleaños', desc: 'Abono 5 BC automático', state: selectedClient.isBirthdayAutoGift, icon: Gift, action: () => handleUpdateClient({ isBirthdayAutoGift: !selectedClient.isBirthdayAutoGift }) },
                                                    { id: 'frozen', label: 'Freeze Account', desc: 'Pausa operativa total', state: selectedClient.isAccountFrozen, icon: ShieldCheck, action: () => handleUpdateClient({ isAccountFrozen: !selectedClient.isAccountFrozen }) }
                                                ].map(auto => (
                                                    <div key={auto.id} className="p-6 bg-zinc-900 border border-white/5 rounded-3xl flex items-center justify-between group hover:border-amber-500/20 transition-all">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${auto.state ? 'bg-amber-500/10 text-amber-500' : 'bg-zinc-950 text-gray-700'}`}><auto.icon className="w-5 h-5" /></div>
                                                            <div className="flex flex-col"><span className="text-xs font-bold text-white">{auto.label}</span><span className="text-[9px] text-gray-500 uppercase font-black">{auto.desc}</span></div>
                                                        </div>
                                                        <button onClick={auto.action} className={`w-12 h-6 rounded-full transition-all relative ${auto.state ? 'bg-amber-500' : 'bg-zinc-800'}`}><div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${auto.state ? 'left-7' : 'left-1'}`} /></button>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="p-8 bg-zinc-900/50 border border-white/5 rounded-[2.5rem] space-y-6">
                                                <h4 className="text-sm font-black uppercase tracking-widest text-gray-400">Workflows Activos</h4>
                                                <div className="space-y-4">
                                                    <div className="p-5 bg-black/40 border-l-4 border-l-blue-500 rounded-2xl flex justify-between items-center">
                                                        <div className="flex flex-col"><span className="text-[10px] font-black text-blue-400 uppercase">Agotamiento de Stock</span><span className="text-xs font-bold">{selectedClient.restockAlerts.length} Productos monitoreados</span></div>
                                                        <button className="px-4 py-2 bg-white/5 rounded-xl text-[9px] font-black uppercase">Configurar</button>
                                                    </div>
                                                    <div className="p-5 bg-black/40 border-l-4 border-l-amber-500 rounded-2xl flex justify-between items-center">
                                                        <div className="flex flex-col"><span className="text-[10px] font-black text-amber-400 uppercase">Recordatorio Inactividad</span><span className="text-xs font-bold">{selectedClient.inactivityReminderSent ? 'Disparado hace poco' : 'En cola de envío'}</span></div>
                                                        <button onClick={() => showToast("Reminder Triggered", "info")} className="px-4 py-2 bg-white/5 rounded-xl text-[9px] font-black uppercase">Forzar Ahora</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'history' && (
                                        <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                            <div className="flex justify-between items-center"><h3 className="text-sm font-black uppercase tracking-widest">Auditoria de Seguridad</h3><div className="flex items-center gap-2 text-[9px] font-black uppercase text-gray-600"><AlertTriangle className="w-4 h-4 text-amber-500" /> Registros de Acceso</div></div>
                                            <div className="space-y-4">
                                                {selectedClient.auditLogs.map(log => (
                                                    <div key={log.id} className="p-6 bg-zinc-900/50 border border-white/5 rounded-3xl flex items-start gap-6 group hover:border-white/20 transition-all">
                                                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex flex-col items-center justify-center shrink-0">
                                                            <span className="text-[10px] font-black text-gray-600 leading-none">{log.date.split(' ')[0].split('-')[2]}</span>
                                                            <span className="text-[8px] font-black uppercase text-gray-700">{log.date.split(' ')[0].split('-')[1]}</span>
                                                        </div>
                                                        <div className="flex-1 space-y-1">
                                                            <div className="flex justify-between"><span className="text-xs font-black uppercase group-hover:text-blis-red transition-all">{log.action}</span><span className="text-[9px] text-gray-600">{log.date.split(' ')[1]}</span></div>
                                                            <p className="text-[10px] text-gray-500 leading-relaxed">{log.details}</p>
                                                            <div className="flex items-center gap-1.5 pt-2"><User className="w-3 h-3 text-gray-700" /><span className="text-[8px] font-black uppercase text-gray-600">Usuario: {log.user}</span></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="p-8 border border-white/5 bg-zinc-900 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-6">
                                                <div className="flex flex-col"><h4 className="text-xs font-black uppercase">Logs de Sistema</h4><p className="text-[10px] text-gray-500 uppercase">Exportar para cumplimiento legal o revision tecnica.</p></div>
                                                <button className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase hover:bg-white/10 transition-all flex items-center gap-2"><FileSpreadsheet className="w-4 h-4" /> Exportar a CSV</button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <button onClick={() => setIsDetailModalOpen(false)} className="absolute top-6 right-6 p-3 bg-black/40 hover:bg-white/10 rounded-2xl transition-all"><X className="w-6 h-6" /></button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Invoices Overlay */}
            <AnimatePresence>
                {selectedOrder && (
                    <motion.div key="invoice-overlay" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }} className="fixed inset-y-0 right-0 w-full max-w-lg z-[10000] bg-black/95 backdrop-blur-xl p-8 border-l border-white/10 shadow-4xl flex flex-col">
                        <div className="flex justify-between items-center mb-10 border-b border-white/10 pb-6">
                            <h3 className="text-lg font-black uppercase">Factura {selectedOrder.id}</h3>
                            <button onClick={() => setSelectedOrder(null)} className="p-3 bg-white/5 rounded-2xl"><X /></button>
                        </div>
                        <div className="flex-1 space-y-8 overflow-y-auto pr-2 scrollbar-hide">
                            <div className="bg-zinc-900 rounded-[2.5rem] p-8 space-y-2 border border-white/5 shadow-2xl">
                                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Total de la Operación</div>
                                <div className="text-6xl font-black text-emerald-500 tracking-tighter">${selectedOrder.total.toFixed(2)}</div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase text-gray-600 ml-2 tracking-widest">Detalle de Productos</h4>
                                <div className="space-y-3">
                                    {(selectedOrder.products || []).map((prod: any, idx: number) => (
                                        <div key={idx} className="p-6 bg-white/5 border border-white/5 rounded-3xl flex justify-between items-center">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-white">{prod.name}</span>
                                                <span className="text-[10px] text-gray-500 uppercase font-black">{prod.quantity} Uni • ${prod.price.toFixed(2)} c/u</span>
                                            </div>
                                            <div className="text-sm font-black">${(prod.price * prod.quantity).toFixed(2)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="pt-8 border-t border-white/5 space-y-3">
                                <div className="flex justify-between text-[10px] font-black uppercase text-gray-500"><span>Subtotal</span><span>${(selectedOrder.products || []).reduce((acc: number, p: any) => acc + (p.price * p.quantity), 0).toFixed(2)}</span></div>
                                <div className="flex justify-between text-[10px] font-black uppercase text-gray-500"><span>I.G.V. / Impuestos (18%)</span><span>Incluido</span></div>
                                <div className="flex justify-between items-center py-4 border-t border-white/10">
                                    <span className="text-sm font-black uppercase text-white">Total Final</span>
                                    <span className="text-2xl font-black text-emerald-500">${selectedOrder.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="pt-8 border-t border-white/10 flex gap-4">
                            <button className="flex-1 py-5 bg-white/5 text-white border border-white/10 rounded-2xl font-black uppercase text-[10px] hover:bg-white/10 transition-all flex items-center justify-center gap-2"><Download className="w-4 h-4" /> Bajar PDF</button>
                            <button className="flex-1 py-5 bg-blis-red text-white rounded-2xl font-black uppercase text-[10px] hover:scale-[1.02] transition-all shadow-xl shadow-blis-red/20 flex items-center justify-center gap-2"><Send className="w-4 h-4" /> Re-Enviar</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {confirmationModal.isOpen && (
                    <div key="confirmation-wrapper" className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirmationModal(prev => ({...prev, isOpen: false}))} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                        <motion.div key="confirmation-modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-[#0f0f0f] border border-white/10 p-8 rounded-[3rem] shadow-4xl w-full max-w-xs text-center">
                            <h3 className="text-xl font-black uppercase mb-4">{confirmationModal.title}</h3>
                            <p className="text-xs text-gray-500 mb-8">{confirmationModal.message}</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={confirmationModal.onConfirm} className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black uppercase text-[10px]">Confirmar</button>
                                <button onClick={() => setConfirmationModal(prev => ({...prev, isOpen: false}))} className="w-full py-4 bg-white/5 text-gray-400 rounded-2xl font-black uppercase text-[10px]">Cancelar</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
