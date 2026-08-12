"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UserPlus, Shield, Download, Search, Filter, User, CheckCircle2, X, Loader2, Eye, EyeOff, Copy, KeyRound, Pencil, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/Toast";
import { useActionGuard } from '@/hooks/useActionGuard';
import { SearchableSelect } from "@/components/ui/SearchableSelect";

const ROLE_OPTIONS = [
    { value: 'Equipo', label: 'Equipo (sin clientes)' },
    { value: 'superadmin', label: 'Super Admin' },
    { value: 'admin', label: 'Admin' },
    { value: 'empleado', label: 'Empleado' },
    { value: 'editor', label: 'Editor' },
    { value: 'vendedor', label: 'Vendedor' },
    { value: 'cliente', label: 'Cliente' },
    { value: 'Todos', label: 'Todos' },
];

const ROLE_BADGES: Record<string, string> = {
    'superadmin': 'bg-blis-red/20 text-blis-red border-blis-red/30',
    'admin': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'empleado': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    'editor': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'vendedor': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'cliente': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

interface UserProfile {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
    rol: string;
    activo: boolean;
    creado_en: string;
    empresa_id: string;
}

export default function AdminUsers() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const esEquipo = searchParams.get('equipo') === 'true';
    const { showToast } = useToast();
    const { guard } = useActionGuard();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newUserName, setNewUserName] = useState('');
    const [newUserApellido, setNewUserApellido] = useState('');
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserRole, setNewUserRole] = useState('empleado');
    const [showPassword, setShowPassword] = useState(false);
    const [creatingUser, setCreatingUser] = useState(false);
    const [createdPassword, setCreatedPassword] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState(esEquipo ? "Equipo" : "Todos");
    const [statusFilter, setStatusFilter] = useState("Todos");
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [quickPassUser, setQuickPassUser] = useState<UserProfile | null>(null)
    const [quickPassPassword, setQuickPassPassword] = useState('')
    const [quickPassLoading, setQuickPassLoading] = useState(false)

    const handleQuickPassword = async (user: UserProfile) => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$'
        let pass = ''
        for (let i = 0; i < 16; i++) pass += chars[Math.floor(Math.random() * chars.length)]
        setQuickPassPassword(pass)
        setQuickPassUser(user)
        setQuickPassLoading(true)
        try {
            await fetch('/api/admin/users/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, password: pass }),
            })
        } catch { showToast('Error al cambiar contraseña', 'error') }
        finally { setQuickPassLoading(false) }
    }

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/users?per_page=1000');
            const data = await response.json();
            if (data.success && data.data) {
                setUsers(data.data);
            }
        } catch {
            showToast('Error al cargar usuarios', 'error');
        } finally {
            setLoading(false);
        }
    };

    const exportUsers = () => {
        const headers = ["Nombre,Apellido,Email,Rol,Estado,Fecha de Registro\n"];
        const data = users.map(u => 
            `${u.nombre},${u.apellido},${u.email},${u.rol},${isActivo(u) ? 'Activo' : 'Inactivo'},${new Date(u.creado_en).toLocaleDateString()}`
        ).join("\n");
        const blob = new Blob([headers + data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `usuarios_xpancapital_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const filteredUsers = users.filter(user => {
        const fullName = `${user.nombre} ${user.apellido}`.toLowerCase();
        const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === "Todos" || (roleFilter === "Equipo" ? (user.rol !== 'cliente' && user.rol !== 'usuario') : user.rol === roleFilter);
        const matchesStatus = statusFilter === "Todos" || 
            (statusFilter === "Activo" && isActivo(user)) || 
            (statusFilter === "Inactivo" && !isActivo(user));
        return matchesSearch && matchesRole && matchesStatus;
    });

    const getRoleBadge = (rol: string) => {
        return ROLE_BADGES[rol] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    };

    const isActivo = (user: UserProfile) => user.activo !== false;

    return (
        <div className="space-y-8 w-full mx-auto pb-10 px-4 md:px-8 pt-8 md:pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-0">
                <div className="flex-1 w-full sm:w-auto">
                    <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter leading-none sm:leading-tight">
                        Usuarios & Miembros{" "}
                        <span className="text-blis-red text-[10px] sm:text-sm align-middle ml-2 bg-blis-red/10 px-2 py-0.5 rounded-full border border-blis-red/20">
                            {users.length}
                        </span>
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-400 mt-2 font-light max-w-xl leading-tight">
                        Gestiona el staff y clientes de la plataforma.
                    </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                    <button
                        onClick={exportUsers}
                        className="flex-1 sm:flex-none bg-white/5 border border-white/10 text-white px-3 sm:px-5 py-3 sm:py-4 rounded-xl font-bold uppercase tracking-wider text-[10px] sm:text-xs hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                    >
                        <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Exportar CSV</span>
                        <span className="sm:hidden">Exportar</span>
                    </button>
                    <button
                        onClick={() => { if (!guard('equipo', 'crear')) return; setIsModalOpen(true); }}
                        className="flex-1 sm:flex-none bg-blis-red text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-bold uppercase tracking-wider text-[10px] sm:text-xs hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(213,193,8,0.3)]"
                    >
                        <UserPlus className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline">Nuevo Usuario</span>
                        <span className="sm:hidden">Nuevo</span>
                    </button>
                </div>
            </div>

            <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-2xl flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        className="w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex flex-col md:flex-row gap-4 min-w-max">
                    <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-xl px-4 py-2">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <SearchableSelect
                            value={roleFilter}
                            onChange={(value) => setRoleFilter(value)}
                            options={ROLE_OPTIONS}
                            className="min-w-[160px]"
                            buttonClassName="bg-transparent text-sm text-white border-none focus:outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-xl px-4 py-2">
                        <CheckCircle2 className="w-4 h-4 text-gray-500" />
                        <SearchableSelect
                            value={statusFilter}
                            onChange={(value) => setStatusFilter(value)}
                            options={[
                                { value: "Todos", label: "Todos los estados" },
                                { value: "Activo", label: "Activos" },
                                { value: "Inactivo", label: "Inactivos" },
                            ]}
                            className="bg-white/5 text-sm text-white focus:outline-none appearance-none pr-6 rounded-lg cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-blis-red" />
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className="bg-zinc-900 border border-white/5 rounded-2xl p-12 text-center">
                    <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No se encontraron usuarios</p>
                </div>
            ) : (
                <div className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-white/[0.02] text-gray-300 uppercase font-semibold text-[10px] tracking-widest border-b border-white/5">
                                <tr>
                                    <th className="px-6 py-5">Usuario</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Rol</th>
                                    <th className="px-6 py-4">Estado</th>
                                    <th className="px-6 py-4">Fecha</th>
                                    <th className="px-6 py-4">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-white/[0.03] transition-colors">
                                        <td className="px-6 py-5 font-semibold text-white">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl ${user.rol === 'cliente' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blis-red/10 text-blis-red'} border border-white/5 flex items-center justify-center font-black`}>
                                                    {user.nombre?.charAt(0) || <User className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <div className="text-white">{user.nombre} {user.apellido}</div>
                                                    <div className="text-[10px] text-gray-500">{user.rol}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-gray-300">{user.email}</td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-bold border ${getRoleBadge(user.rol)}`}>
                                                <Shield className="w-3 h-3" />
                                                {ROLE_OPTIONS.find(r => r.value === user.rol)?.label || user.rol}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${isActivo(user) ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                                <CheckCircle2 className="w-3 h-3" />
                                                {isActivo(user) ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-gray-500">
                                            {new Date(user.creado_en).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => { if (!guard('equipo', 'editar')) return; router.push(`/superadmin/usuarios/${user.id}`) }}
                                                className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-all"
                                                title="Editar usuario"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleQuickPassword(user)}
                                                className="p-2 hover:bg-amber-500/10 rounded-lg text-gray-400 hover:text-amber-400 transition-all"
                                                title="Generar contraseña"
                                            >
                                                <KeyRound className="w-4 h-4" />
                                            </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={() => { setIsModalOpen(false); setCreatedPassword(null); }}
                    >
                        <div className="absolute inset-0 bg-black/80" />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative bg-zinc-950 border border-white/10 rounded-2xl p-6 w-full max-w-md"
                        >
                            <button
                                onClick={() => { setIsModalOpen(false); setCreatedPassword(null); }}
                                className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-lg"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                            
                            {createdPassword ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                            <KeyRound className="w-5 h-5 text-emerald-400" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-white">Usuario Creado</h2>
                                            <p className="text-xs text-gray-400">Comparte estas credenciales</p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-2">
                                        <div className="flex items-center gap-2 bg-black/50 border border-white/10 rounded-lg p-2">
                                            <span className="text-[10px] text-gray-500 uppercase font-bold w-12">Email</span>
                                            <code className="flex-1 text-emerald-300 font-mono text-xs">{newUserEmail}</code>
                                        </div>
                                        <div className="flex items-center gap-2 bg-black/50 border border-white/10 rounded-lg p-2">
                                            <span className="text-[10px] text-gray-500 uppercase font-bold w-12">Clave</span>
                                            <code className="flex-1 text-emerald-300 font-mono text-xs break-all">{createdPassword}</code>
                                            <button onClick={() => navigator.clipboard.writeText(createdPassword)} className="p-1 hover:bg-white/5 rounded">
                                                <Copy className="w-3.5 h-3.5 text-gray-400" />
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => { setIsModalOpen(false); setCreatedPassword(null); }}
                                        className="w-full"
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <h2 className="text-xl font-bold text-white mb-4">Nuevo Usuario</h2>
                                    <div className="space-y-2">
                                        <label className="text-xs text-gray-400 font-bold uppercase tracking-widest">Nombre *</label>
                                        <input
                                            type="text"
                                            value={newUserName}
                                            onChange={(e) => setNewUserName(e.target.value)}
                                            className="w-full"
                                            placeholder="Kevin"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-gray-400 font-bold uppercase tracking-widest">Apellido</label>
                                        <input
                                            type="text"
                                            value={newUserApellido}
                                            onChange={(e) => setNewUserApellido(e.target.value)}
                                            className="w-full"
                                            placeholder="Pérez"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-gray-400 font-bold uppercase tracking-widest">Email *</label>
                                        <input
                                            type="email"
                                            value={newUserEmail}
                                            onChange={(e) => setNewUserEmail(e.target.value)}
                                            className="w-full"
                                            placeholder="correo@ejemplo.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-gray-400 font-bold uppercase tracking-widest">Contraseña</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={newUserPassword}
                                                onChange={(e) => setNewUserPassword(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-blis-red/50 transition-all"
                                                placeholder="Dejar vacío para generar automáticamente"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-white transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-gray-600 uppercase tracking-widest">Se genera automáticamente si se deja vacío</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-gray-400 font-bold uppercase tracking-widest">Rol</label>
                                        <SearchableSelect
                                            value={newUserRole}
                                            onChange={(value) => setNewUserRole(value)}
                                            options={ROLE_OPTIONS}
                                            className="w-full"
                                        />
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={() => { setIsModalOpen(false); setCreatedPassword(null); }}
                                            className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 font-bold hover:bg-white/10 transition-colors text-sm"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (!newUserName.trim() || !newUserEmail.trim()) {
                                                    showToast('Nombre y email son obligatorios', 'error');
                                                    return;
                                                }
                                                setCreatingUser(true);
                                                try {
                                                    const res = await fetch('/api/admin/create-user', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({
                                                            nombre: newUserName,
                                                            apellido: newUserApellido,
                                                            email: newUserEmail,
                                                            password: newUserPassword || undefined,
                                                            rol: newUserRole,
                                                        }),
                                                    });
                                                    const data = await res.json();
                                                    if (data.success) {
                                                        if (data.generatedPassword) {
                                                            setCreatedPassword(data.generatedPassword);
                                                        }
                                                        showToast('Usuario creado exitosamente');
                                                        fetchUsers();
                                                        setTimeout(() => {
                                                            setIsModalOpen(false);
                                                            setCreatedPassword(null);
                                                            setNewUserName('');
                                                            setNewUserEmail('');
                                                            setNewUserPassword('');
                                                        }, 2000);
                                                    } else {
                                                        showToast(data.error || 'Error al crear usuario', 'error');
                                                    }
                                                } catch {
                                                    showToast('Error al crear usuario', 'error');
                                                } finally {
                                                    setCreatingUser(false);
                                                }
                                            }}
                                            disabled={creatingUser || !newUserName.trim() || !newUserEmail.trim()}
                                            className="flex-1 py-3 bg-blis-red rounded-xl text-white font-bold hover:scale-[1.02] active:scale-[0.98] transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {creatingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                                            Crear Usuario
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Quick Password Modal */}
            <AnimatePresence>
                {quickPassUser && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => { setQuickPassUser(null); setQuickPassPassword('') }}>
                        <div className="absolute inset-0 bg-black/80" />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="relative bg-zinc-950 border border-white/10 rounded-2xl p-6 w-full max-w-md">
                            <button onClick={() => { setQuickPassUser(null); setQuickPassPassword('') }} className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center"><KeyRound className="w-5 h-5 text-amber-400" /></div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Credenciales</h2>
                                        <p className="text-xs text-gray-400">{quickPassUser.nombre} {quickPassUser.apellido}</p>
                                    </div>
                                </div>
                                {quickPassLoading ? (
                                    <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-amber-400" /></div>
                                ) : (
                                    <>
                                        <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-2">
                                            <div className="flex items-center gap-2 bg-black/50 border border-white/10 rounded-lg p-2">
                                                <span className="text-[10px] text-gray-500 uppercase font-bold w-12">Email</span>
                                                <code className="flex-1 text-amber-300 font-mono text-xs">{quickPassUser.email}</code>
                                            </div>
                                            <div className="flex items-center gap-2 bg-black/50 border border-white/10 rounded-lg p-2">
                                                <span className="text-[10px] text-gray-500 uppercase font-bold w-12">Clave</span>
                                                <code className="flex-1 text-amber-300 font-mono text-xs break-all">{quickPassPassword}</code>
                                                <button onClick={() => { navigator.clipboard.writeText(quickPassPassword); showToast('Contraseña copiada') }} className="p-1 hover:bg-white/5 rounded"><Copy className="w-3.5 h-3.5 text-gray-400" /></button>
                                            </div>
                                        </div>
                                        {quickPassUser.telefono && (
                                            <button onClick={async () => {
                                                try {
                                                    const res = await fetch('/api/whatsapp/credenciales', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ phone: quickPassUser.telefono?.replace(/\D/g, ''), password: quickPassPassword, email: quickPassUser.email, nombre: quickPassUser.nombre }),
                                                    })
                                                    if (res.ok) showToast('Enviado por WhatsApp')
                                                    else showToast('Error al enviar', 'error')
                                                } catch { showToast('Error al enviar', 'error') }
                                            }} className="w-full py-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-500/20 transition-colors flex items-center justify-center gap-2">
                                                <MessageCircle className="w-4 h-4" /> Enviar por WhatsApp
                                            </button>
                                        )}
                                        <button onClick={() => { setQuickPassUser(null); setQuickPassPassword('') }} className="w-full py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-bold text-xs hover:bg-white/10 transition-colors">Cerrar</button>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

