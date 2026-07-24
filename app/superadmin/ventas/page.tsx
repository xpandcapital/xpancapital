"use client";

import { useState, useEffect, useCallback } from "react";
import {
    DollarSign, Clock, CheckCircle2, AlertCircle, Loader2,
    Search, Trash2, Plus, ShoppingBag,
    Banknote, CreditCard, History, ShieldCheck,
    Coins, Clock3, GraduationCap, Calendar
} from "lucide-react";
import { SearchableSelect, type SearchableOption } from "@/components/ui/SearchableSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useShop } from "@/context/ShopContext";

interface Venta {
    id: string;
    user_id: string;
    producto_id: string;
    metodo_pago: string;
    monto_usd: number;
    monto_coins: number;
    estado: string;
    creado_en: string;
    cliente?: { id: string; nombre: string; email: string; avatar_url: string | null };
    producto?: { id: string; nombre: string; imagen_principal: string | null; tipo: string; curso_id?: string | null; curso?: { id: string; nombre: string } | null; categoria?: { nombre: string } | null };
}

interface LogEntry {
    id: string;
    compra_id: string;
    user_id: string;
    estado_anterior: string;
    estado_nuevo: string;
    notas: string | null;
    creado_en: string;
    admin?: { id: string; nombre: string };
}

export default function VentasAdminPage() {
    const { coinsEnabled } = useShop();
    const [ventas, setVentas] = useState<Venta[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [modalNueva, setModalNueva] = useState(false);
    const [modalVerificar, setModalVerificar] = useState<Venta | null>(null);
    const [modalHistorial, setModalHistorial] = useState<string | null>(null);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [notasVerificacion, setNotasVerificacion] = useState("");
    const [subTipoPago, setSubTipoPago] = useState("");
    const [guardando, setGuardando] = useState(false);
    
    const [formNueva, setFormNueva] = useState({ user_email: "", producto_id: "", metodo_pago: "transferencia", monto_usd: 0, monto_coins: 0 });
    const [clientes, setClientes] = useState<any[]>([]);
    const [productos, setProductos] = useState<any[]>([]);

    const cargar = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams({ page: page.toString(), limit: "50" });
        if (filtroEstado) params.set("estado", filtroEstado);
        if (search) params.set("search", search);
        const res = await fetch(`/api/admin/ventas?${params}`);
        const d = await res.json();
        if (d.success) { setVentas(d.ventas || []); setTotal(d.total || 0); }
        setLoading(false);
    }, [page, filtroEstado, search]);

    useEffect(() => { cargar(); }, [cargar]);

    // Debounced search: resetea a página 1 al escribir
    useEffect(() => {
        if (page !== 1) { setPage(1); return; }
        const timer = setTimeout(() => { cargar(); }, 400);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        fetch("/api/admin/clientes?limit=200").then(r => r.json()).then(d => {
            if (d.success) setClientes(d.data || d.clientes || []);
        }).catch(() => {});
        fetch("/api/productos?all=true&limit=200").then(r => r.json()).then(d => {
            if (d.success) setProductos(d.data || d.productos || []);
        }).catch(() => {});
    }, []);

    const cargarLogs = async (compraId: string) => {
        const res = await fetch(`/api/admin/ventas?logs_compra_id=${compraId}`);
        const d = await res.json();
        if (d.success) setLogs(d.logs || []);
    };

    const actualizarEstado = async (id: string, estado: string, notas?: string, subTipo?: string) => {
        setGuardando(true);
        const body: any = { id, estado, ...(notas ? { notas } : {}) }
        if (subTipo) body.sub_tipo_pago = subTipo
        const res = await fetch("/api/admin/ventas", {
            method: "PUT", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        if (res.ok && data.success) {
            setVentas(prev => prev.map(v => v.id === id ? { ...v, estado } : v));
            setModalVerificar(null);
            setNotasVerificacion("");
            setSubTipoPago("");
        } else {
            alert(data.error || 'Error al actualizar estado');
        }
        setGuardando(false);
    };

    const eliminar = async (id: string) => {
        if (!confirm("¿Eliminar esta venta permanentemente?")) return;
        await fetch(`/api/admin/ventas?id=${id}`, { method: "DELETE" });
        setVentas(prev => prev.filter(v => v.id !== id));
    };

    const registrarVentaOffline = async () => {
        if (!formNueva.user_email || !formNueva.producto_id) return;
        setGuardando(true);
        const cliente = clientes.find(c => c.email?.toLowerCase() === formNueva.user_email.toLowerCase());
        const res = await fetch("/api/admin/ventas", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: cliente?.id,
                producto_id: formNueva.producto_id,
                metodo_pago: formNueva.metodo_pago,
                monto_usd: formNueva.metodo_pago === "bliscoins" ? 0 : (formNueva.monto_usd || 0),
                monto_coins: formNueva.metodo_pago === "bliscoins" ? (formNueva.monto_coins || 0) : 0,
            }),
        });
        if (res.ok) {
            setModalNueva(false);
            setFormNueva({ user_email: "", producto_id: "", metodo_pago: "transferencia", monto_usd: 0, monto_coins: 0 });
            await cargar();
        }
        setGuardando(false);
    };

    const handleSearch = () => { setPage(1); cargar(); };

    const montoTotal = ventas.reduce((sum, v) => sum + (v.monto_usd || 0), 0);

    const estadoBadge = (estado: string) => {
        const map: Record<string, { color: string; label: string; icon: any }> = {
            completado: { color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", label: "Completado", icon: CheckCircle2 },
            pendiente: { color: "bg-amber-500/10 text-amber-400 border-amber-500/20", label: "Pendiente", icon: Clock },
            cancelado: { color: "bg-red-500/10 text-red-400 border-red-500/20", label: "Cancelado", icon: AlertCircle },
            reembolsado: { color: "bg-blue-500/10 text-blue-400 border-blue-500/20", label: "Reembolsado", icon: Clock3 },
        };
        const b = map[estado] || { color: "bg-gray-500/10 text-gray-400 border-gray-500/20", label: estado, icon: Clock };
        return <Badge className={`${b.color} border text-[10px] font-bold flex items-center gap-1`}><b.icon className="w-3 h-3" /> {b.label}</Badge>;
    };

    const metodoPagoLabel = (metodo: string) => {
        if (metodo === 'transfer' || metodo === 'transferencia') return 'Transferencia';
        if (metodo === 'efectivo') return 'Efectivo';
        if (metodo === 'crypto_manual') return 'Cripto';
        return metodo || 'N/A';
    };

    const metodoIcon = (metodo: string) => {
        if (metodo === 'bliscoins' && coinsEnabled) return <Coins className="w-3 h-3 text-amber-400" />;
        if (metodo === 'transfer' || metodo === 'transferencia') return <Banknote className="w-3 h-3" />;
        if (metodo === 'crypto_manual') return <Banknote className="w-3 h-3" />;
        return <CreditCard className="w-3 h-3" />;
    };

    const formatFecha = (dateStr: string) => {
        if (!dateStr) return { fecha: '-', hora: '' };
        const d = new Date(dateStr);
        return {
            fecha: d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' }),
            hora: d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
        };
    };

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter">Ventas</h1>
                        <p className="text-gray-400 text-sm mt-1">{total} transacciones registradas</p>
                    </div>
                    <Button onClick={() => setModalNueva(true)} className="bg-emerald-600 hover:bg-emerald-600/90 text-white font-black uppercase tracking-wider text-xs">
                        <Plus className="w-4 h-4 mr-2" /> Registrar Venta
                    </Button>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: "Total Ventas", value: total, icon: ShoppingBag, color: "text-white" },
                        { label: "Completadas", value: ventas.filter(v => v.estado === "completado").length, icon: CheckCircle2, color: "text-emerald-400" },
                        { label: "Pendientes", value: ventas.filter(v => v.estado === "pendiente").length, icon: Clock, color: "text-amber-400" },
                        { label: "Monto Total", value: `$${montoTotal.toLocaleString()}`, icon: DollarSign, color: "text-blis-red", isText: true },
                    ].map(stat => (
                        <div key={stat.label} className="bg-zinc-900/50 border border-white/10 rounded-2xl p-4">
                            <div className="flex items-center justify-between">
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                <span className={`text-2xl font-black ${stat.isText ? 'text-sm sm:text-lg' : ''}`}>{stat.value}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{stat.label}</p>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar por cliente, email o producto..." className="bg-zinc-900/50 border-white/10 text-white placeholder:text-gray-600 rounded-xl pl-10" />
                    </div>
                    <SearchableSelect value={filtroEstado} onChange={v => { setFiltroEstado(v); setPage(1); }}
                        options={[
                            { value: 'completado', label: 'Completado' },
                            { value: 'pendiente', label: 'Pendiente' },
                            { value: 'cancelado', label: 'Cancelado' },
                            { value: 'reembolsado', label: 'Reembolsado' },
                        ]}
                        placeholder="Todos los estados"
                        className="px-4 py-2.5 bg-zinc-900/50 border border-white/10 rounded-xl text-sm text-white cursor-pointer appearance-none focus:outline-none focus:border-blis-red/30 transition-all" />
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blis-red" /></div>
                ) : ventas.length === 0 ? (
                    <p className="text-center py-12 text-gray-500">No se encontraron ventas</p>
                ) : (
                    <>
                        {/* Mobile: tarjetas */}
                        <div className="lg:hidden space-y-3">
                            {ventas.map(venta => {
                                const { fecha, hora } = formatFecha(venta.creado_en);
                                return (
                                    <div key={venta.id} className="bg-zinc-900/50 border border-white/10 rounded-2xl p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                    {venta.cliente?.nombre?.[0] || (venta as any).metadata?.nombre_cliente?.[0] || "U"}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-white truncate">
                                                        {venta.cliente?.nombre || (venta as any).metadata?.nombre_cliente || "Invitado"}
                                                    </p>
                                                    <p className="text-[10px] text-gray-500 truncate">
                                                        {venta.cliente?.email || (venta as any).metadata?.email_cliente || ""}
                                                    </p>
                                                </div>
                                            </div>
                                            {estadoBadge(venta.estado)}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <GraduationCap className="w-3.5 h-3.5 text-blis-red flex-shrink-0" />
                                            <span className="text-sm text-white truncate">{venta.producto?.nombre || "Producto"}</span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                                            <span className="text-gray-500">Método</span>
                                            <span className="text-gray-500">Monto</span>
                                            <span className="text-white flex items-center gap-1">
                                                {metodoIcon(venta.metodo_pago)}
                                                {metodoPagoLabel(venta.metodo_pago)}
                                            </span>
                                            <span className="text-white font-mono font-bold">
                                                {venta.monto_coins > 0 && coinsEnabled
                                                    ? <span className="text-amber-400">{venta.monto_coins.toLocaleString()} XPAND</span>
                                                    : `$${venta.monto_usd?.toLocaleString() || '0'}`}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Calendar className="w-3 h-3" />
                                            <span>{fecha}</span>
                                            <Clock className="w-3 h-3 ml-1" />
                                            <span>{hora}</span>
                                        </div>

                                        <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                                            {venta.estado === "pendiente" && (
                                                <button onClick={() => { setModalVerificar(venta); setNotasVerificacion(""); setSubTipoPago(""); }}
                                                    className="p-2 hover:bg-emerald-500/10 rounded-lg text-gray-400 hover:text-emerald-400 transition-colors"
                                                    title="Verificar pago">
                                                    <ShieldCheck className="w-4 h-4" />
                                                </button>
                                            )}
                                            {venta.estado === "completado" && (
                                                <button onClick={() => actualizarEstado(venta.id, "reembolsado")}
                                                    className="p-2 hover:bg-blue-500/10 rounded-lg text-gray-400 hover:text-blue-400 transition-colors"
                                                    title="Reembolsar">
                                                    <Clock3 className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button onClick={async () => { setModalHistorial(venta.id); await cargarLogs(venta.id); }}
                                                className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                                title="Historial">
                                                <History className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => eliminar(venta.id)}
                                                className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors ml-auto"
                                                title="Eliminar">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Desktop: tabla */}
                        <div className="hidden lg:block bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full" buttonClassName="text-left text-sm">
                                    <thead className="bg-white/[0.02] text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                                        <tr>
                                            <th className="p-4">Cliente</th>
                                            <th className="p-4">Producto</th>
                                            <th className="p-4">Método</th>
                                            <th className="p-4">Monto</th>
                                            <th className="p-4">Fecha / Hora</th>
                                            <th className="p-4">Estado</th>
                                            <th className="p-4 w-32">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.02]">
                                        {ventas.map(venta => {
                                            const { fecha, hora } = formatFecha(venta.creado_en);
                                            return (
                                                <tr key={venta.id} className="hover:bg-white/[0.02] transition-colors">
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold">
                                                                {venta.cliente?.nombre?.[0] || (venta as any).metadata?.nombre_cliente?.[0] || "U"}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-white">
                                                                    {venta.cliente?.nombre || (venta as any).metadata?.nombre_cliente || "N/A"}
                                                                </p>
                                                                <p className="text-[10px] text-gray-500">
                                                                    {venta.cliente?.email || (venta as any).metadata?.email_cliente || ""}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="text-sm text-white">{venta.producto?.nombre || "Producto"}</span>
                                                        {venta.producto?.curso_id && (
                                                            <Badge className="ml-2 bg-purple-500/10 text-purple-400 border-purple-500/20 text-[9px]">
                                                                <GraduationCap className="w-2.5 h-2.5 mr-0.5" />
                                                                {venta.producto?.curso?.nombre || 'Curso'}
                                                            </Badge>
                                                        )}
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="flex items-center gap-1 text-xs text-gray-400">
                                                            {metodoIcon(venta.metodo_pago)}
                                                            {metodoPagoLabel(venta.metodo_pago)}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 font-mono font-bold text-white">
                                                        {venta.monto_coins > 0 && coinsEnabled ? (
                                                            <span className="text-amber-400">{venta.monto_coins.toLocaleString()} XPAND</span>
                                                        ) : `$${venta.monto_usd?.toLocaleString() || '0'}`}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="text-xs">
                                                            <p className="text-white">{fecha}</p>
                                                            <p className="text-gray-500 text-[10px]">{hora}</p>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">{estadoBadge(venta.estado)}</td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-1">
                                                            {venta.estado === "pendiente" && (
                                                                <button onClick={() => { setModalVerificar(venta); setNotasVerificacion(""); setSubTipoPago(""); }}
                                                                    className="p-2 hover:bg-emerald-500/10 rounded-lg text-gray-400 hover:text-emerald-400 transition-colors"
                                                                    title="Verificar pago y dar acceso">
                                                                    <ShieldCheck className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                            {venta.estado === "completado" && (
                                                                <button onClick={() => actualizarEstado(venta.id, "reembolsado")}
                                                                    className="p-2 hover:bg-blue-500/10 rounded-lg text-gray-400 hover:text-blue-400 transition-colors"
                                                                    title="Reembolsar">
                                                                    <Clock3 className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                            <button onClick={async () => { setModalHistorial(venta.id); await cargarLogs(venta.id); }}
                                                                className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                                                title="Historial de cambios">
                                                                <History className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => eliminar(venta.id)}
                                                                className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                                                                title="Eliminar">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {total > 50 && (
                    <div className="flex justify-center gap-2 mt-6">
                        <Button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} variant="outline" className="border-white/10 text-gray-400">Anterior</Button>
                        <span className="px-4 py-2 text-sm text-gray-400">Página {page} de {Math.ceil(total / 50)}</span>
                        <Button onClick={() => setPage(p => p + 1)} disabled={page * 50 >= total} variant="outline" className="border-white/10 text-gray-400">Siguiente</Button>
                    </div>
                )}
            </div>

            {/* Modal Nueva Venta */}
            <Dialog open={modalNueva} onOpenChange={setModalNueva}>
                <DialogContent className="bg-[#111] border-white/10 text-white max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-sm font-black uppercase tracking-wider">Registrar Venta</DialogTitle>
                        <p className="text-xs text-gray-500 mt-1">Para pagos por transferencia, efectivo, XPANDCOINS u otros.</p>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        <div>
                            <label className="text-xs text-gray-400 uppercase font-bold block mb-2">Email del Cliente *</label>
                            <Input value={formNueva.user_email} onChange={e => setFormNueva({ ...formNueva, user_email: e.target.value })}
                                placeholder="cliente@email.com" className="bg-white/5 border-white/10 text-white" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 uppercase font-bold block mb-2">Producto *</label>
                            <SearchableSelect
                                options={productos.map((p: any): SearchableOption => ({
                                    value: p.id,
                                    label: p.nombre,
                                    sublabel: p.categoria?.nombre || p.tipo || undefined,
                                    image: p.imagen_principal || undefined,
                                }))}
                                value={formNueva.producto_id}
                                onChange={(v) => setFormNueva({ ...formNueva, producto_id: v })}
                                placeholder="Seleccionar producto..."
                                searchPlaceholder="Buscar producto..."
                                emptyText="No se encontraron productos"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 uppercase font-bold block mb-2">Método de Pago</label>
                            <SearchableSelect
                                value={formNueva.metodo_pago}
                                onChange={(v) => setFormNueva({ ...formNueva, metodo_pago: v })}
                                options={[
                                    { value: 'transferencia', label: 'Transferencia' },
                                    { value: 'efectivo', label: 'Efectivo' },
                                    { value: 'tarjeta', label: 'Tarjeta' },
                                    ...(coinsEnabled ? [{ value: 'bliscoins', label: 'XPANDCOINS' }] : []),
                                    { value: 'otro', label: 'Otro' },
                                ]}
                                className="w-full"
                            />
                        </div>
                        {formNueva.metodo_pago === "bliscoins" && coinsEnabled ? (
                            <div>
                                <label className="text-xs text-gray-400 uppercase font-bold block mb-2">Monto XPANDCOINS</label>
                                <Input type="number" value={formNueva.monto_coins || ""} onChange={e => setFormNueva({ ...formNueva, monto_coins: parseInt(e.target.value) || 0 })}
                                    placeholder="0" className="bg-white/5 border-white/10 text-white" />
                            </div>
                        ) : (
                            <div>
                                <label className="text-xs text-gray-400 uppercase font-bold block mb-2">Monto USD</label>
                                <Input type="number" value={formNueva.monto_usd || ""} onChange={e => setFormNueva({ ...formNueva, monto_usd: parseFloat(e.target.value) || 0 })}
                                    placeholder="0" className="bg-white/5 border-white/10 text-white" />
                            </div>
                        )}
                        <Button onClick={registrarVentaOffline} disabled={guardando || !formNueva.user_email || !formNueva.producto_id}
                            className="w-full" buttonClassName="bg-emerald-600 hover:bg-emerald-600/90 text-white font-bold">
                            {guardando ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Registrar Venta
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal Verificar Pago */}
            <Dialog open={!!modalVerificar} onOpenChange={() => setModalVerificar(null)}>
                <DialogContent className="bg-[#111] border-white/10 text-white max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-sm font-black uppercase tracking-wider">Verificar Pago</DialogTitle>
                        <p className="text-xs text-gray-500 mt-1">
                            {modalVerificar?.cliente?.nombre} — {modalVerificar?.producto?.nombre}
                        </p>
                        <p className="text-xs text-amber-400 mt-1 font-bold">
                            Método: {modalVerificar?.metodo_pago} — {modalVerificar?.monto_coins ? `${modalVerificar.monto_coins} XPAND` : `$${modalVerificar?.monto_usd || 0}`}
                        </p>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        {modalVerificar?.metodo_pago === 'whatsapp' && (
                            <div>
                                <label className="text-xs text-gray-400 uppercase font-bold block mb-2">Sub-tipo de pago</label>
                                <SearchableSelect
                                    value={subTipoPago}
                                    onChange={setSubTipoPago}
                                    options={[
                                        { value: 'transferencia', label: 'Transferencia Bancaria' },
                                        { value: 'billetera_digital', label: 'Billetera Digital (Yape/Plin)' },
                                        { value: 'efectivo', label: 'Efectivo' },
                                        { value: 'otro', label: 'Otro' },
                                    ]}
                                    placeholder="Seleccionar..."
                                    className="w-full"
                                />
                            </div>
                        )}
                        <div>
                            <label className="text-xs text-gray-400 uppercase font-bold block mb-2">Nota de verificación</label>
                            <textarea value={notasVerificacion} onChange={e => setNotasVerificacion(e.target.value)}
                                placeholder="Ej: Transferencia recibida, comprobante #1234" rows={3}
                                className="w-full" buttonClassName="bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white resize-none" />
                        </div>
                        <Button onClick={() => actualizarEstado(modalVerificar!.id, "completado", notasVerificacion, subTipoPago)}
                            disabled={guardando}
                            className="w-full" buttonClassName="bg-emerald-600 hover:bg-emerald-600/90 text-white font-bold disabled:opacity-50">
                            {guardando ? <Loader2 className="w-4 h-4 animate-spin mr-2 inline" /> : <ShieldCheck className="w-4 h-4 mr-2 inline" />}
                            {guardando ? 'Procesando...' : 'Confirmar Pago y Dar Acceso'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal Historial de Cambios */}
            <Dialog open={!!modalHistorial} onOpenChange={() => setModalHistorial(null)}>
                <DialogContent className="bg-[#111] border-white/10 text-white max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-sm font-black uppercase tracking-wider">Historial de Cambios</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4 space-y-3 max-h-80 overflow-y-auto">
                        {logs.length === 0 ? (
                            <p className="text-center py-8 text-gray-500 text-sm">Sin registros de cambios.</p>
                        ) : (
                            logs.map(log => (
                                <div key={log.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs flex-shrink-0">
                                        <History className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${log.estado_anterior === 'pendiente' ? 'bg-amber-500/10 text-amber-400' : log.estado_anterior === 'completado' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400'}`}>
                                                {log.estado_anterior}
                                            </span>
                                            <span className="text-gray-600 text-xs">→</span>
                                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${log.estado_nuevo === 'completado' ? 'bg-emerald-500/10 text-emerald-400' : log.estado_nuevo === 'reembolsado' ? 'bg-blue-500/10 text-blue-400' : 'bg-gray-500/10 text-gray-400'}`}>
                                                {log.estado_nuevo}
                                            </span>
                                            <span className="text-[10px] text-gray-500 ml-auto">
                                                {new Date(log.creado_en).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        {log.notas && <p className="text-xs text-gray-500 mt-1 italic">"{log.notas}"</p>}
                                        <p className="text-[10px] text-gray-600 mt-0.5">por {log.admin?.nombre || "Admin"}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

