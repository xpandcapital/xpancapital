"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Shield, CheckCircle2, X, Loader2, Pencil, Mail, User, ToggleLeft, Save } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/Toast";

const ROLE_OPTIONS = [
    { value: 'superadmin', label: 'Super Admin', desc: 'Acceso completo a todas las empresas y configuraciones' },
    { value: 'admin', label: 'Admin', desc: 'Acceso completo a su empresa' },
    { value: 'empleado', label: 'Empleado', desc: 'Acceso a capacitaciones y funciones básicas' },
    { value: 'editor', label: 'Editor', desc: 'Puede editar contenido pero no configuración' },
    { value: 'vendedor', label: 'Vendedor', desc: 'Gestión de leads y ventas' },
    { value: 'cliente', label: 'Cliente', desc: 'Acceso a cursos comprados y perfil' },
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
    blis_coins?: number;
    telefono?: string;
}

export default function EditarUsuarioPage() {
    const params = useParams();
    const router = useRouter();
    const { showToast } = useToast();
    const userId = params.id as string;

    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [email, setEmail] = useState('');
    const [rol, setRol] = useState('empleado');
    const [activo, setActivo] = useState(true);

    useEffect(() => {
        fetchUser();
    }, [userId]);

    const fetchUser = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/users?id=${userId}`);
            const data = await res.json();
            if (data.success && data.data) {
                const u = data.data;
                setUser(u);
                setNombre(u.nombre || '');
                setApellido(u.apellido || '');
                setEmail(u.email || '');
                setRol(u.rol || 'empleado');
                setActivo(u.activo !== false);
            } else {
                showToast('Usuario no encontrado', 'error');
                router.push('/superadmin/usuarios');
            }
        } catch {
            showToast('Error al cargar usuario', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: userId,
                    nombre,
                    apellido,
                    email,
                    rol,
                    activo,
                }),
            });
            const data = await res.json();
            if (data.success) {
                showToast('Usuario actualizado exitosamente');
                fetchUser();
            } else {
                showToast(data.error || 'Error al actualizar', 'error');
            }
        } catch {
            showToast('Error al actualizar', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="w-8 h-8 text-blis-red animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    const currentRole = ROLE_OPTIONS.find(r => r.value === rol);

    return (
        <div className="w-full mx-auto px-4 md:px-8 pt-8 pb-20">
            <button
                onClick={() => router.push('/superadmin/usuarios')}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-bold uppercase tracking-widest">Volver a usuarios</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden">
                        <div className="px-6 py-5 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blis-red/10 text-blis-red border border-blis-red/20 flex items-center justify-center">
                                    <Pencil className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-white font-black uppercase tracking-wider text-sm">Editar Usuario</h2>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Modifica los datos del usuario</p>
                                </div>
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 px-5 py-2.5 bg-blis-red text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-blis-red/20"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Guardar Cambios
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                        <User className="w-3 h-3" /> Nombre
                                    </label>
                                    <input
                                        type="text"
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blis-red/50 transition-colors text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                        <User className="w-3 h-3" /> Apellido
                                    </label>
                                    <input
                                        type="text"
                                        value={apellido}
                                        onChange={(e) => setApellido(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blis-red/50 transition-colors text-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                    <Mail className="w-3 h-3" /> Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blis-red/50 transition-colors text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                    <Shield className="w-3 h-3" /> Rol
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {ROLE_OPTIONS.map(r => (
                                        <button
                                            key={r.value}
                                            type="button"
                                            onClick={() => setRol(r.value)}
                                            className={`p-3 rounded-xl border text-left transition-all ${
                                                rol === r.value
                                                    ? 'bg-blis-red/10 border-blis-red/30 text-white'
                                                    : 'bg-white/[0.02] border-white/5 text-gray-400 hover:border-white/10 hover:text-white'
                                            }`}
                                        >
                                            <p className="text-xs font-bold">{r.label}</p>
                                            <p className="text-[9px] text-gray-500 mt-0.5 leading-tight">{r.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-white font-bold flex items-center gap-2">
                                        <ToggleLeft className="w-4 h-4" />
                                        Estado de la cuenta
                                    </p>
                                    <p className="text-[11px] text-gray-500 mt-1">
                                        {activo ? 'El usuario puede iniciar sesión y acceder a la plataforma' : 'El usuario no puede iniciar sesión'}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setActivo(!activo)}
                                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors shrink-0 ${activo ? 'bg-emerald-500' : 'bg-gray-600'}`}
                                >
                                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${activo ? 'translate-x-8' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-zinc-950 border border-white/5 rounded-2xl p-6">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Perfil del Usuario</h3>
                        <div className="flex flex-col items-center text-center">
                            <div className={`w-20 h-20 rounded-2xl ${ROLE_BADGES[rol]?.split(' ')[0] || 'bg-gray-500/20'} ${ROLE_BADGES[rol]?.split(' ')[1] || 'text-gray-400'} border border-white/5 flex items-center justify-center text-3xl font-black mb-4`}>
                                {(nombre?.charAt(0) || '?').toUpperCase()}
                            </div>
                            <h4 className="text-white font-black text-lg">{nombre} {apellido}</h4>
                            <p className="text-gray-500 text-sm mt-1">{email}</p>
                            <span className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-bold border ${ROLE_BADGES[rol] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                                <Shield className="w-3 h-3" />
                                {currentRole?.label || rol}
                            </span>
                        </div>
                    </div>

                    <div className="bg-zinc-950 border border-white/5 rounded-2xl p-6 space-y-4">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Información</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Registrado</span>
                                <span className="text-white font-medium">{new Date(user.creado_en).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                            <div className="w-full h-px bg-white/5" />
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Estado</span>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${activo ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                    <CheckCircle2 className="w-3 h-3" />
                                    {activo ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>
                            <div className="w-full h-px bg-white/5" />
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">ID</span>
                                <code className="text-[10px] text-gray-400 bg-white/5 px-2 py-1 rounded">{userId.slice(0, 8)}...</code>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}