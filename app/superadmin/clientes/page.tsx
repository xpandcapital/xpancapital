"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Users, Search, Filter, Download,
    Coins, TrendingUp, Brain, Trophy,
    Plus, LayoutGrid, LayoutList, Shield,
    Edit3, Smartphone, ChevronRight, Loader2,
    ArrowRightLeft as ArrowRightLeftIcon, Trash2
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/Toast";
import { useActionGuard } from '@/hooks/useActionGuard';
import { CustomSelect } from './_components/CustomSelect';

interface DbProfile {
    id: string;
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
    puntos: number;
    puntos_nivel: number;
    puntos_cursos: number;
    puntos_comunidad: number;
    puntos_blog: number;
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

interface Address { id: string; type: 'Envio' | 'Facturacion' | 'Oficina'; label: string; address: string; city: string; }

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
    puntos: number;
    puntosNivel: number;
    puntosCursos: number;
    puntosComunidad: number;
    puntosBlog: number;
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

interface AuditLog { id: string; date: string; action: string; user: string; details: string; }
interface Transaction { id: string; date: string; amount: number; type: 'Ganancia' | 'Gasto' | 'Ajuste'; description: string; reason?: string; }
interface OrderItem { id: string; name: string; quantity: number; price: number; }
interface Order { id: string; date: string; total: number; status: 'Pagado' | 'Pendiente' | 'Cancelado'; items: number; type: 'Venta' | 'Cotizacion'; products?: OrderItem[]; }

function mapDbToClient(profile: DbProfile): Client {
    const tierMap: Record<string, string> = {
        'platinum': 'Platinum Member',
        'gold': 'Gold Member',
        'silver': 'Silver Member',
        'bronze': 'Bronze Member'
    };
    const docTypeMap: Record<string, 'DNI' | 'RUC' | 'Cedula' | 'Pasaporte'> = {
        'DNI': 'DNI', 'RUC': 'RUC', 'Cedula': 'Cedula', 'Pasaporte': 'Pasaporte',
        'CE': 'Pasaporte', 'RUT': 'RUC', 'CURP': 'Pasaporte', 'RFC': 'RUC',
        'NIT': 'RUC', 'TI': 'Cedula', 'CC': 'Cedula', 'CPF': 'Pasaporte', 'CI': 'Cedula'
    };
    const docType = docTypeMap[profile.tipo_documento || 'DNI'] || 'DNI';
    let status = 'Socio';
    if (profile.verificado) status = 'Verificado';
    else if (profile.ha_comprado) status = 'Premium';
    const roleMap: Record<string, 'Cliente' | 'Admin' | 'Moderador' | 'Staff'> = {
        'usuario': 'Cliente', 'cliente': 'Cliente', 'editor': 'Staff', 'admin': 'Admin', 'superadmin': 'Admin'
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
        puntos: profile.puntos || 0,
        puntosNivel: profile.puntos_nivel || 1,
        puntosCursos: profile.puntos_cursos || 0,
        puntosComunidad: profile.puntos_comunidad || 0,
        puntosBlog: profile.puntos_blog || 0,
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

export default function AdminClientes() {
    const { showToast } = useToast();
    const { guard } = useActionGuard();
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [activityFilter, setActivityFilter] = useState("Todos");
    const [isRankingView, setIsRankingView] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [isMounted, setIsMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [clients, setClients] = useState<Client[]>([]);

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

    const handleDelete = async (clientId: string, clientName: string) => {
        if (!confirm(`¿Eliminar permanentemente a "${clientName}"?\n\nEsta acción no se puede deshacer.`)) return;
        try {
            const res = await fetch(`/api/admin/clientes?id=${clientId}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setClients(prev => prev.filter(c => c.id !== clientId));
                showToast('Cliente eliminado', 'error');
            } else {
                showToast(data.error || 'Error al eliminar', 'error');
            }
        } catch {
            showToast('Error al eliminar cliente', 'error');
        }
    };

    const filteredClients = clients.filter(c => {
        const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
        return (fullName.includes(searchTerm.toLowerCase()) || c.email.toLowerCase().includes(searchTerm.toLowerCase())) && (activityFilter === "Todos" || c.status === activityFilter);
    });

    return (
        <div className="space-y-6 w-full mx-auto pb-20 px-4 md:px-8 pt-8 text-white">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-10">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-blis-red font-black text-[10px] uppercase tracking-[0.4em] mb-1 animate-pulse"><Shield className="w-3.5 h-3.5" /> COMUNIDAD XPAND CORP PRO</div>
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">Administracion de Socios</h1>
                    <p className="text-gray-500 text-sm font-medium max-w-2xl">Gestiona el ecosistema de socios y monitorea el flujo de BlisCoins.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => setIsRankingView(!isRankingView)} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${isRankingView ? 'bg-amber-500 text-black' : 'bg-white/5 text-gray-400'}`}><Trophy className="w-4 h-4" /> Ranking</button>
                    <button className="px-8 py-4 bg-blis-red text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl"><Plus className="w-5 h-5" /></button>
                </div>
            </div>

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
                                        <th className="px-4 md:px-8 py-4 md:py-6">Socio & Perfil</th>
                                        <th className="px-3 md:px-6 py-4 md:py-6 text-center hidden md:table-cell">Nivel / Tier</th>
                                        <th className="px-3 md:px-6 py-4 md:py-6 text-center hidden md:table-cell">Estado Ops</th>
                                        <th className="px-3 md:px-6 py-4 md:py-6 text-center hidden md:table-cell">Boveda (BC)</th>
                                        <th className="px-3 md:px-6 py-4 md:py-6 text-center hidden md:table-cell">Pts (Nivel)</th>
                                        <th className="px-3 md:px-6 py-4 md:py-6 text-center hidden md:table-cell">Total Compra</th>
                                        <th className="px-4 md:px-8 py-4 md:py-6 text-right">Acciones Directas</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredClients.map(c => (
                                        <tr key={c.id} className="group hover:bg-white/[0.01] transition-all cursor-pointer" onClick={() => router.push(`/superadmin/clientes/${c.id}`)}>
                                            <td className="px-4 md:px-8 py-4 md:py-6">
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
                                            <td className="px-3 md:px-6 py-4 md:py-6 text-center hidden md:table-cell">
                                                <span className={`text-[9px] font-black uppercase px-4 py-1.5 rounded-full border ${
                                                    c.tier.includes('Platinum') ? 'bg-neutral-900 border-neutral-700 text-neutral-300' :
                                                    c.tier.includes('Gold') ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                                                    c.tier.includes('Silver') ? 'bg-zinc-300/10 border-zinc-300/20 text-zinc-400' :
                                                    'bg-white/5 border-white/10 text-gray-500'
                                                }`}>{c.tier}</span>
                                            </td>
                                            <td className="px-3 md:px-6 py-4 md:py-6 text-center hidden md:table-cell">
                                                <span className={`text-[9px] font-black uppercase px-4 py-1.5 rounded-full border ${
                                                    c.status === 'Verificado' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-lg shadow-emerald-500/10' :
                                                    c.status === 'Premium' ? 'bg-blis-red/10 border-blis-red/20 text-blis-red shadow-lg shadow-blis-red/10 animate-pulse' :
                                                    'bg-white/5 border-white/10 text-gray-500'
                                                }`}>{c.status}</span>
                                            </td>
                                            <td className="px-3 md:px-6 py-4 md:py-6 text-center hidden md:table-cell font-black text-amber-500 text-xs tracking-widest">{formatCurrency(c.blisCoins)} BC</td>
                                            <td className="px-3 md:px-6 py-4 md:py-6 text-center hidden md:table-cell">
                                              <span className="font-black text-white text-xs">{c.puntos.toLocaleString()}</span>
                                              <span className="text-[9px] text-gray-500 block">Nv.{c.puntosNivel} · C:{c.puntosCursos} Co:{c.puntosComunidad} B:{c.puntosBlog}</span>
                                            </td>
                                            <td className="px-3 md:px-6 py-4 md:py-6 text-center hidden md:table-cell font-black text-white text-xs">${formatCurrency(c.income)}</td>
                                            <td className="px-4 md:px-8 py-4 md:py-6 text-right" onClick={e => e.stopPropagation()}>
                                                <div className="flex justify-end gap-2">
                                                    <a href={`https://wa.me/${c.phone.replace(/\+/g, '').replace(/\s/g, '')}?text=Hola%20${c.firstName},%20un%20gusto%20saludarte.`} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-emerald-600/10 text-emerald-500 border border-emerald-500/10 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-xl shadow-emerald-900/10"><Smartphone className="w-4 h-4" /></a>
                                                    <button onClick={() => handleDelete(c.id, `${c.firstName} ${c.lastName}`)} className="p-2.5 bg-red-500/10 text-red-500 border border-red-500/10 rounded-xl hover:bg-red-500 hover:text-white transition-all" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                                                    <button onClick={() => router.push(`/superadmin/clientes/${c.id}`)} className="p-2.5 bg-white/5 text-gray-500 border border-white/10 rounded-xl hover:bg-blis-red hover:text-white transition-all shadow-xl"><Edit3 className="w-4 h-4" /></button>
                                                    <button onClick={() => router.push(`/superadmin/clientes/${c.id}`)} className="p-2.5 bg-white/5 text-gray-800 border border-white/10 rounded-xl hover:bg-white hover:text-black transition-all shadow-xl"><ChevronRight className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                ) : (
                    <div className="p-4 md:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
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
                                <div key={c.id} onClick={() => router.push(`/superadmin/clientes/${c.id}`)} className="relative p-8 bg-zinc-900 border border-white/5 rounded-[3rem] hover:border-blis-red/50 transition-all cursor-pointer group flex flex-col items-center text-center space-y-4 shadow-3xl hover:shadow-blis-red/5">
                                    <div className="absolute top-4 right-4 flex gap-1">
                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(c.id, `${c.firstName} ${c.lastName}`); }} className="p-1.5 bg-red-500/10 text-red-500 border border-red-500/10 rounded-lg hover:bg-red-500 hover:text-white transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100" title="Eliminar"><Trash2 className="w-3.5 h-3.5" /></button>
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
                                        <div className="text-white font-bold text-sm">{c.puntos.toLocaleString()} <span className="text-[10px] text-gray-500">pts Nv.{c.puntosNivel}</span></div>
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
        </div>
    );
}

