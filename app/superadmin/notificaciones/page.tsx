"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/Toast";
import {
  Bell, Send, Search, X, Clock, Users, User, ChevronDown,
  Filter, RotateCcw, Eye, Trash2, CheckCircle2, AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";

interface Profile {
  id: string;
  nombre: string;
  email: string;
  rol: string;
}

interface Notificacion {
  id: string;
  titulo: string;
  mensaje: string;
  tipo: string;
  link?: string;
  user_id?: string;
  destinatario_tipo?: string;
  destinatario_ids?: string[];
  leida: boolean;
  creado_en: string;
  enviado_por?: string;
  enviado_por_profile?: {
    id: string;
    nombre: string;
    email: string;
    rol: string;
  } | null;
}

const ROLES = [
  { value: "admin", label: "Admin" },
  { value: "editor", label: "Editor" },
  { value: "empleado", label: "Empleado" },
];

const DESTINATARIO_TIPOS = [
  { value: "todos", label: "Todos los miembros" },
  { value: "por_rol", label: "Por rol" },
  { value: "miembro", label: "Miembro específico" },
  { value: "grupo", label: "Grupo personalizado" },
];

export default function NotificacionesPage() {
  const { showToast } = useToast();

  const [historial, setHistorial] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [miembros, setMiembros] = useState<Profile[]>([]);
  const [miembroSearch, setMiembroSearch] = useState("");
  const [showMiembroDropdown, setShowMiembroDropdown] = useState(false);

  const [titulo, setTitulo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [link, setLink] = useState("");
  const [destinatarioTipo, setDestinatarioTipo] = useState("todos");
  const [destinatarioRoles, setDestinatarioRoles] = useState<string[]>([]);
  const [destinatarioMiembro, setDestinatarioMiembro] = useState<Profile | null>(null);
  const [destinatarioGrupo, setDestinatarioGrupo] = useState<string[]>([]);

  useEffect(() => {
    fetchHistorial();
    fetchMiembros();
  }, []);

  const fetchHistorial = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/notificaciones?admin=true&limit=100");
      const data = await response.json();
      if (data.success) {
        setHistorial(data.data || []);
      } else {
        showToast("Error al cargar historial", "error");
      }
    } catch {
      showToast("Error al cargar historial", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchMiembros = async () => {
    try {
      const response = await fetch("/api/admin/empresa/usuarios");
      const data = await response.json();
      if (data.success) {
        setMiembros(data.users || []);
      }
    } catch {
      // Silencioso
    }
  };

  const filteredMiembros = miembros.filter((m) => {
    if (!miembroSearch) return true;
    const s = miembroSearch.toLowerCase();
    return (
      m.nombre?.toLowerCase().includes(s) ||
      m.email?.toLowerCase().includes(s) ||
      m.rol?.toLowerCase().includes(s)
    );
  });

  const toggleRol = (rol: string) => {
    setDestinatarioRoles((prev) =>
      prev.includes(rol) ? prev.filter((r) => r !== rol) : [...prev, rol]
    );
  };

  const toggleGrupoMiembro = (id: string) => {
    setDestinatarioGrupo((prev) =>
      prev.includes(id) ? prev.filter((mid) => mid !== id) : [...prev, id]
    );
  };

  const resetForm = () => {
    setTitulo("");
    setMensaje("");
    setLink("");
    setDestinatarioTipo("todos");
    setDestinatarioRoles([]);
    setDestinatarioMiembro(null);
    setDestinatarioGrupo([]);
  };

  const handleDeleteNotificacion = async (id: string) => {
    try {
      await fetch(`/api/notificaciones?id=${id}`, { method: 'DELETE' });
      setHistorial(prev => prev.filter(n => n.id !== id));
      showToast("Notificación eliminada", "success");
    } catch {
      showToast("Error al eliminar", "error");
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('¿Eliminar todas las notificaciones del historial?')) return;
    try {
      await fetch('/api/notificaciones?all=true', { method: 'DELETE' });
      setHistorial([]);
      showToast("Historial limpiado", "success");
    } catch {
      showToast("Error al limpiar", "error");
    }
  };

  const handleSend = async () => {
    if (!titulo.trim() || !mensaje.trim()) {
      showToast("Título y mensaje son requeridos", "error");
      return;
    }

    if (destinatarioTipo === "por_rol" && destinatarioRoles.length === 0) {
      showToast("Selecciona al menos un rol", "error");
      return;
    }

    if (destinatarioTipo === "miembro" && !destinatarioMiembro) {
      showToast("Selecciona un miembro", "error");
      return;
    }

    if (destinatarioTipo === "grupo" && destinatarioGrupo.length === 0) {
      showToast("Selecciona al menos un miembro para el grupo", "error");
      return;
    }

    setSending(true);
    try {
      const payload: Record<string, unknown> = {
        titulo: titulo.trim(),
        mensaje: mensaje.trim(),
        destinatario_tipo: destinatarioTipo,
      };

      if (link.trim()) {
        payload.link = link.trim();
      }

      if (destinatarioTipo === "por_rol") {
        payload.destinatario_roles = destinatarioRoles;
      }

      if (destinatarioTipo === "miembro") {
        payload.destinatario_ids = [destinatarioMiembro!.id];
      }

      if (destinatarioTipo === "grupo") {
        payload.destinatario_ids = destinatarioGrupo;
      }

      const response = await fetch("/api/notificaciones/enviar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        showToast(data.message || "Notificación enviada correctamente", "success");
        resetForm();
        fetchHistorial();
      } else {
        showToast(data.error || "Error al enviar", "error");
      }
    } catch {
      showToast("Error al enviar la notificación", "error");
    } finally {
      setSending(false);
    }
  };

  const getDestinatarioLabel = (n: Notificacion): string => {
    if (n.destinatario_tipo === "todos") return "Todos los miembros";
    if (n.destinatario_tipo === "por_rol") {
      return `Roles: ${(n.destinatario_ids || []).join(", ")}`;
    }
    if (n.destinatario_tipo === "miembro") return "Miembro específico";
    if (n.destinatario_tipo === "grupo") return `Grupo (${(n.destinatario_ids || []).length})`;
    if (!n.destinatario_tipo && n.user_id) return "Usuario específico";
    return n.destinatario_tipo || "Sistema";
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const selectedMiembros = miembros.filter((m) => destinatarioGrupo.includes(m.id));

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black">Notificaciones</h1>
          <p className="text-gray-400 text-sm mt-1">
            Envía y gestiona notificaciones del sistema
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Sección 1: Enviar Notificación */}
          <div className="lg:col-span-2">
            <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 sticky top-28">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blis-red/20 flex items-center justify-center">
                  <Send className="w-5 h-5 text-blis-red" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Enviar Notificación</h2>
                  <p className="text-xs text-gray-500">Crea y envía una notificación push</p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Destinatarios */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                    Destinatarios
                  </label>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {DESTINATARIO_TIPOS.map((dt) => (
                      <button
                        key={dt.value}
                        onClick={() => {
                          setDestinatarioTipo(dt.value);
                          setShowMiembroDropdown(false);
                        }}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                          destinatarioTipo === dt.value
                            ? "bg-blis-red text-white shadow-lg shadow-blis-red/20"
                            : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        {dt.label}
                      </button>
                    ))}
                  </div>

                  {destinatarioTipo === "por_rol" && (
                    <div className="flex flex-wrap gap-2">
                      {ROLES.map((rol) => (
                        <button
                          key={rol.value}
                          onClick={() => toggleRol(rol.value)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            destinatarioRoles.includes(rol.value)
                              ? "bg-blis-red text-white"
                              : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          {rol.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {destinatarioTipo === "miembro" && (
                    <div className="relative">
                      <button
                        onClick={() => setShowMiembroDropdown(!showMiembroDropdown)}
                        className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 hover:border-white/20 transition-colors"
                      >
                        <span>{destinatarioMiembro ? `${destinatarioMiembro.nombre} (${destinatarioMiembro.rol})` : "Buscar miembro..."}</span>
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      </button>

                      {showMiembroDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden">
                          <div className="p-3 border-b border-white/10">
                            <div className="relative">
                              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                              <input
                                type="text"
                                value={miembroSearch}
                                onChange={(e) => setMiembroSearch(e.target.value)}
                                placeholder="Buscar por nombre, email o rol..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blis-red outline-none"
                                autoFocus
                              />
                            </div>
                          </div>
                          <div className="max-h-48 overflow-y-auto">
                            {filteredMiembros.length === 0 ? (
                              <div className="p-4 text-center text-sm text-gray-500">
                                No se encontraron miembros
                              </div>
                            ) : (
                              filteredMiembros.map((m) => (
                                <button
                                  key={m.id}
                                  onClick={() => {
                                    setDestinatarioMiembro(m);
                                    setShowMiembroDropdown(false);
                                    setMiembroSearch("");
                                  }}
                                  className={`w-full text-left px-4 py-3 hover:bg-white/5 transition-colors flex items-center gap-3 ${
                                    destinatarioMiembro?.id === m.id ? "bg-blis-red/10" : ""
                                  }`}
                                >
                                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                                    <User className="w-4 h-4 text-gray-400" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-white">{m.nombre}</p>
                                    <p className="text-xs text-gray-500">
                                      {m.email} &middot; {m.rol}
                                    </p>
                                  </div>
                                  {destinatarioMiembro?.id === m.id && (
                                    <CheckCircle2 className="w-4 h-4 text-blis-red ml-auto flex-shrink-0" />
                                  )}
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {destinatarioTipo === "grupo" && (
                    <div className="space-y-2">
                      <div className="relative">
                        <button
                          onClick={() => setShowMiembroDropdown(!showMiembroDropdown)}
                          className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 hover:border-white/20 transition-colors"
                        >
                          <span>Agregar miembros al grupo...</span>
                          <Users className="w-4 h-4 text-gray-500" />
                        </button>

                        {showMiembroDropdown && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden">
                            <div className="p-3 border-b border-white/10">
                              <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                  type="text"
                                  value={miembroSearch}
                                  onChange={(e) => setMiembroSearch(e.target.value)}
                                  placeholder="Buscar miembro..."
                                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blis-red outline-none"
                                  autoFocus
                                />
                              </div>
                            </div>
                            <div className="max-h-48 overflow-y-auto">
                              {filteredMiembros.length === 0 ? (
                                <div className="p-4 text-center text-sm text-gray-500">
                                  No se encontraron miembros
                                </div>
                              ) : (
                                filteredMiembros.map((m) => (
                                  <button
                                    key={m.id}
                                    onClick={() => toggleGrupoMiembro(m.id)}
                                    className={`w-full text-left px-4 py-3 hover:bg-white/5 transition-colors flex items-center gap-3 ${
                                      destinatarioGrupo.includes(m.id) ? "bg-blis-red/10" : ""
                                    }`}
                                  >
                                    <div className="w-6 h-6 rounded border border-white/20 flex items-center justify-center flex-shrink-0">
                                      {destinatarioGrupo.includes(m.id) && (
                                        <CheckCircle2 className="w-4 h-4 text-blis-red" />
                                      )}
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-white">{m.nombre}</p>
                                      <p className="text-xs text-gray-500">{m.rol}</p>
                                    </div>
                                  </button>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {selectedMiembros.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {selectedMiembros.map((m) => (
                            <span
                              key={m.id}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blis-red/20 text-blis-red text-xs rounded-full"
                            >
                              {m.nombre}
                              <button
                                onClick={() => toggleGrupoMiembro(m.id)}
                                className="hover:text-white transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Título */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                    Título
                  </label>
                  <input
                    type="text"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ej: Nueva actualización del sistema"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blis-red outline-none text-sm"
                  />
                </div>

                {/* Mensaje */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                    Mensaje
                  </label>
                  <textarea
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    placeholder="Escribe el contenido de la notificación..."
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blis-red outline-none text-sm resize-none"
                  />
                </div>

                {/* URL opcional */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                    URL (opcional)
                  </label>
                  <input
                    type="text"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="/superadmin/dashboard"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blis-red outline-none text-sm"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Ruta a la que se redirigirá al hacer clic en la notificación
                  </p>
                </div>

                {/* Botón enviar */}
                <button
                  onClick={handleSend}
                  disabled={sending}
                  className="w-full py-3.5 bg-blis-red text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blis-red/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blis-red/20"
                >
                  {sending ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  {sending ? "Enviando..." : "Enviar notificación"}
                </button>

                <button
                  onClick={resetForm}
                  className="w-full py-2.5 bg-white/5 text-gray-400 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-white/10 hover:text-white transition-all text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  Limpiar formulario
                </button>
              </div>
            </div>
          </div>

          {/* Sección 2: Historial de Notificaciones */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-400" />
                Historial de Notificaciones
              </h2>
              <div className="flex items-center gap-2">
                {historial.length > 0 && (
                  <button onClick={handleDeleteAll} className="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/20 transition-all">
                    <Trash2 className="w-3.5 h-3.5 inline mr-1" /> Limpiar todo
                  </button>
                )}
                <button onClick={fetchHistorial} className="px-3 py-1.5 bg-white/5 text-gray-400 rounded-lg text-xs font-medium hover:bg-white/10 hover:text-white transition-all">
                  Actualizar
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blis-red" />
              </div>
            ) : (
              <div className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left text-xs font-bold text-gray-400 uppercase p-4">Fecha</th>
                        <th className="text-left text-xs font-bold text-gray-400 uppercase p-4">Título</th>
                        <th className="text-left text-xs font-bold text-gray-400 uppercase p-4">Tipo</th>
                        <th className="text-left text-xs font-bold text-gray-400 uppercase p-4">Destinatarios</th>
                        <th className="text-left text-xs font-bold text-gray-400 uppercase p-4">Estado</th>
                        <th className="text-right text-xs font-bold text-gray-400 uppercase p-4 w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {historial.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center">
                            <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400">
                              No hay notificaciones en el historial
                            </p>
                          </td>
                        </tr>
                      ) : (
                        historial.map((n) => (
                          <tr
                            key={n.id}
                            className="border-b border-white/5 hover:bg-white/5 transition-colors"
                          >
                            <td className="p-4">
                              <span className="text-xs text-gray-400">
                                {formatDate(n.creado_en)}
                              </span>
                            </td>
                            <td className="p-4">
                              <div>
                                <p className="text-sm font-bold text-white">{n.titulo}</p>
                                {n.mensaje && (
                                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                    {n.mensaje}
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${
                                  n.tipo === "sistema"
                                    ? "bg-blue-500/20 text-blue-400"
                                    : "bg-gray-500/20 text-gray-400"
                                }`}
                              >
                                {n.tipo === "sistema" ? "Sistema" : n.tipo}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className="text-xs text-gray-400">
                                {getDestinatarioLabel(n)}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${n.leida ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                                {n.leida ? "Leída" : "Pendiente"}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => handleDeleteNotificacion(n.id)}
                                className="p-1.5 hover:bg-red-500/20 rounded-lg text-gray-500 hover:text-red-400 transition-colors"
                                title="Eliminar"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
