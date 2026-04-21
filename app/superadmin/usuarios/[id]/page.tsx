"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft, Shield, CheckCircle2, X, Loader2, Pencil, Mail, User,
    ToggleLeft, Save, KeyRound, Send, Eye, EyeOff, GraduationCap,
    Plus, Trash2, Copy
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

const ROLE_OPTIONS = [
    { value: 'superadmin', label: 'Super Admin', desc: 'Acceso completo a todas las empresas' },
    { value: 'admin', label: 'Admin', desc: 'Acceso completo a su empresa' },
    { value: 'empleado', label: 'Empleado', desc: 'Capacitaciones y funciones básicas' },
    { value: 'editor', label: 'Editor', desc: 'Puede editar contenido' },
    { value: 'vendedor', label: 'Vendedor', desc: 'Gestión de leads y ventas' },
    { value: 'cliente', label: 'Cliente', desc: 'Cursos comprados y perfil' },
];

const ROLE_BADGES: Record<string, string> = {
    'superadmin': 'bg-blis-red/20 text-blis-red border-blis-red/30',
    'admin': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'empleado': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    'editor': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'vendedor': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'cliente': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

const ESTADO_COLORS: Record<string, string> = {
    asignado: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    en_progreso: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    completado: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
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

interface AssignedCourse {
    id: string;
    curso_id: string;
    progreso: number;
    estado: string;
    lecciones_completadas: string[];
    asignado_en: string;
    cursos: { id: string; nombre: string; imagen_principal: string | null; para_equipo: boolean } | null;
}

interface AvailableCourse {
    id: string;
    nombre: string;
    imagen_principal: string | null;
    para_equipo: boolean;
    precio_usd: number;
    activo: boolean;
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

    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [resettingPassword, setResettingPassword] = useState(false);
    const [sendingResetEmail, setSendingResetEmail] = useState(false);
    const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

    const [assignedCourses, setAssignedCourses] = useState<AssignedCourse[]>([]);
    const [availableCourses, setAvailableCourses] = useState<AvailableCourse[]>([]);
    const [advisorId, setAdvisorId] = useState<string | null>(null);
    const [loadingCourses, setLoadingCourses] = useState(false);
    const [showAddCourse, setShowAddCourse] = useState(false);
    const [assigning, setAssigning] = useState<string | null>(null);
    const [removing, setRemoving] = useState<string | null>(null);

    useEffect(() => { fetchUser(); }, [userId]);

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
                fetchCourses(userId);
            } else {
                showToast('Usuario no encontrado', 'error');
                router.push('/superadmin/usuarios');
            }
        } catch {
            showToast('Error al cargar usuario', 'error');
        } finally { setLoading(false); }
    };

    const fetchCourses = async (uid: string) => {
        setLoadingCourses(true);
        try {
            const res = await fetch(`/api/admin/users/courses?userId=${uid}`);
            const data = await res.json();
            if (data.success) {
                setAssignedCourses(data.assigned || []);
                setAvailableCourses(data.available || []);
                setAdvisorId(data.advisorId);
            }
        } catch {}
        finally { setLoadingCourses(false); }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: userId, nombre, apellido, email, rol }),
            });
            const data = await res.json();
            if (data.success) {
                showToast('Usuario actualizado exitosamente');
                fetchUser();
            } else {
                showToast(data.error || 'Error al actualizar', 'error');
            }
        } catch { showToast('Error al actualizar', 'error'); }
        finally { setSaving(false); }
    };

    const handleChangePassword = async () => {
        if (!newPassword.trim()) { showToast('Ingresa una contraseña', 'error'); return; }
        setResettingPassword(true);
        try {
            const res = await fetch('/api/admin/users/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, password: newPassword }),
            });
            const data = await res.json();
            if (data.success) {
                showToast('Contraseña actualizada exitosamente');
                setNewPassword('');
                setShowPasswordSection(false);
            } else {
                showToast(data.error || 'Error al cambiar contraseña', 'error');
            }
        } catch { showToast('Error al cambiar contraseña', 'error'); }
        finally { setResettingPassword(false); }
    };

    const handleSendResetEmail = async () => {
        setSendingResetEmail(true);
        try {
            const res = await fetch('/api/admin/users/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, sendEmail: true }),
            });
            const data = await res.json();
            if (data.success) {
                showToast('Email de restablecimiento enviado');
            } else {
                showToast(data.error || 'Error al enviar email', 'error');
            }
        } catch { showToast('Error al enviar email', 'error'); }
        finally { setSendingResetEmail(false); }
    };

    const handleAssignCourse = async (courseId: string) => {
        setAssigning(courseId);
        try {
            const res = await fetch('/api/equipo-cursos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ curso_id: courseId, email: user?.email }),
            });
            const data = await res.json();
            if (data.success) {
                showToast('Curso asignado exitosamente');
                fetchCourses(userId);
                setShowAddCourse(false);
            } else {
                showToast(data.error || 'Error al asignar curso', 'error');
            }
        } catch { showToast('Error al asignar curso', 'error'); }
        finally { setAssigning(null); }
    };

    const handleRemoveCourse = async (equipoCursoId: string) => {
        setRemoving(equipoCursoId);
        try {
            const res = await fetch(`/api/equipo-cursos?id=${equipoCursoId}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                showToast('Curso removido exitosamente');
                setAssignedCourses(prev => prev.filter(c => c.id !== equipoCursoId));
            } else {
                showToast(data.error || 'Error al remover curso', 'error');
            }
        } catch { showToast('Error al remover curso', 'error'); }
        finally { setRemoving(null); }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-8 h-8 text-blis-red animate-spin" /></div>;
    }

    if (!user) return null;

    const currentRole = ROLE_OPTIONS.find(r => r.value === rol);
    const assignedCourseIds = new Set(assignedCourses.map(c => c.curso_id).filter(Boolean));

    return (
        <div className="w-full mx-auto px-4 md:px-8 pt-8 pb-20">
            <button onClick={() => router.push('/superadmin/usuarios')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-bold uppercase tracking-widest">Volver a usuarios</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Editar Usuario */}
                    <div className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden">
                        <div className="px-6 py-5 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blis-red/10 text-blis-red border border-blis-red/20 flex items-center justify-center"><Pencil className="w-5 h-5" /></div>
                                <div>
                                    <h2 className="text-white font-black uppercase tracking-wider text-sm">Editar Usuario</h2>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Modifica los datos del usuario</p>
                                </div>
                            </div>
                            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-blis-red text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-blis-red/20">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Guardar
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2"><User className="w-3 h-3" /> Nombre</label>
                                    <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blis-red/50 transition-colors text-sm" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2"><User className="w-3 h-3" /> Apellido</label>
                                    <input type="text" value={apellido} onChange={(e) => setApellido(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blis-red/50 transition-colors text-sm" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2"><Mail className="w-3 h-3" /> Email</label>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blis-red/50 transition-colors text-sm" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2"><Shield className="w-3 h-3" /> Rol</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {ROLE_OPTIONS.map(r => (
                                        <button key={r.value} type="button" onClick={() => setRol(r.value)} className={`p-3 rounded-xl border text-left transition-all ${rol === r.value ? 'bg-blis-red/10 border-blis-red/30 text-white' : 'bg-white/[0.02] border-white/5 text-gray-400 hover:border-white/10 hover:text-white'}`}>
                                            <p className="text-xs font-bold">{r.label}</p>
                                            <p className="text-[9px] text-gray-500 mt-0.5 leading-tight">{r.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-white font-bold flex items-center gap-2"><ToggleLeft className="w-4 h-4" /> Estado de la cuenta</p>
                                    <p className="text-[11px] text-gray-500 mt-1">{activo ? 'El usuario puede iniciar sesión' : 'El usuario no puede iniciar sesión'}</p>
                                </div>
                                <button type="button" onClick={() => setActivo(!activo)} className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors shrink-0 ${activo ? 'bg-emerald-500' : 'bg-gray-600'}`}>
                                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${activo ? 'translate-x-8' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Contraseña */}
                    <div className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden">
                        <button onClick={() => setShowPasswordSection(!showPasswordSection)} className="w-full px-6 py-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center"><KeyRound className="w-5 h-5" /></div>
                                <div className="text-left">
                                    <h3 className="text-white font-black uppercase tracking-wider text-sm">Seguridad</h3>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Cambiar o restablecer contraseña</p>
                                </div>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showPasswordSection ? 'rotate-180' : ''}`} />
                        </button>
                        {showPasswordSection && (
                            <div className="px-6 pb-6 space-y-4 border-t border-white/5 pt-5">
                                <button onClick={handleSendResetEmail} disabled={sendingResetEmail} className="w-full flex items-center gap-3 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl hover:bg-blue-500/10 transition-colors disabled:opacity-50">
                                    <Send className="w-5 h-5 text-blue-400" />
                                    <div className="text-left flex-1">
                                        <p className="text-white text-sm font-bold">Enviar email de restablecimiento</p>
                                        <p className="text-[10px] text-gray-500">Se enviará un email a {email} con un enlace para cambiar su contraseña</p>
                                    </div>
                                    {sendingResetEmail && <Loader2 className="w-4 h-4 animate-spin text-blue-400" />}
                                </button>

                                <div className="flex items-center gap-4">
                                    <div className="flex-1 h-px bg-white/5" />
                                    <span className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">o cambiar manualmente</span>
                                    <div className="flex-1 h-px bg-white/5" />
                                </div>

                                <div className="space-y-3">
                                    <div className="relative">
                                        <input type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nueva contraseña" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white focus:outline-none focus:border-blis-red/50 transition-colors text-sm" />
                                        <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-white transition-colors">
                                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <button onClick={handleChangePassword} disabled={resettingPassword || !newPassword.trim()} className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 transition-colors disabled:opacity-30 flex items-center justify-center gap-2">
                                        {resettingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                                        Cambiar Contraseña
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Capacitaciones */}
                    <div className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden">
                        <div className="px-6 py-5 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center"><GraduationCap className="w-5 h-5" /></div>
                                <div>
                                    <h3 className="text-white font-black uppercase tracking-wider text-sm">Capacitaciones</h3>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{assignedCourses.length} curso(s) asignado(s)</p>
                                </div>
                            </div>
                            <button onClick={() => setShowAddCourse(!showAddCourse)} className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-500/20 transition-colors">
                                <Plus className="w-4 h-4" /> Asignar
                            </button>
                        </div>

                        {showAddCourse && (
                            <div className="border-b border-white/5 p-4 bg-white/[0.01]">
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-3">Cursos disponibles para asignar</p>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {availableCourses.filter(c => !assignedCourseIds.has(c.id)).length === 0 ? (
                                        <p className="text-gray-500 text-sm py-3 text-center">Todos los cursos ya están asignados</p>
                                    ) : (
                                        availableCourses.filter(c => !assignedCourseIds.has(c.id)).map(course => (
                                            <div key={course.id} className="flex items-center justify-between p-3 bg-black/30 border border-white/5 rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    {course.imagen_principal ? (
                                                        <img src={course.imagen_principal} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center"><GraduationCap className="w-5 h-5 text-gray-600" /></div>
                                                    )}
                                                    <p className="text-white text-sm font-bold">{course.nombre}</p>
                                                </div>
                                                <button onClick={() => handleAssignCourse(course.id)} disabled={assigning === course.id} className="px-3 py-1.5 bg-blis-red text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center gap-1">
                                                    {assigning === course.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                                                    Asignar
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="p-4">
                            {loadingCourses ? (
                                <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 text-emerald-400 animate-spin" /></div>
                            ) : assignedCourses.length === 0 ? (
                                <div className="text-center py-8">
                                    <GraduationCap className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                                    <p className="text-gray-500 text-sm">Sin capacitaciones asignadas</p>
                                    <p className="text-gray-600 text-xs mt-1">Asigna cursos de equipo para este usuario</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {assignedCourses.map(course => (
                                        <div key={course.id} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl group hover:border-white/10 transition-colors">
                                            <div className="flex items-center gap-3 min-w-0">
                                                {course.cursos?.imagen_principal ? (
                                                    <img src={course.cursos.imagen_principal} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0"><GraduationCap className="w-5 h-5 text-gray-500" /></div>
                                                )}
                                                <div className="min-w-0">
                                                    <p className="text-white text-sm font-bold truncate">{course.cursos?.nombre || 'Curso'}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-lg border ${ESTADO_COLORS[course.estado] || ESTADO_COLORS.asignado}`}>
                                                            {course.estado === 'en_progreso' ? 'En progreso' : course.estado === 'completado' ? 'Completado' : 'Sin iniciar'}
                                                        </span>
                                                        <span className="text-[9px] text-gray-600">{course.progreso}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button onClick={() => handleRemoveCourse(course.id)} disabled={removing === course.id} className="p-2 hover:bg-red-500/10 rounded-lg text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50">
                                                {removing === course.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
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
                                <Shield className="w-3 h-3" />{currentRole?.label || rol}
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
                                    <CheckCircle2 className="w-3 h-3" />{activo ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>
                            <div className="w-full h-px bg-white/5" />
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">ID</span>
                                <code className="text-[10px] text-gray-400 bg-white/5 px-2 py-1 rounded">{userId.slice(0, 8)}...</code>
                            </div>
                            <div className="w-full h-px bg-white/5" />
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Capacitaciones</span>
                                <span className="text-white font-medium">{assignedCourses.length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ChevronDown({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="m6 9 6 6 6-6" />
        </svg>
    );
}