"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Award, Plus, Edit2, Trash2, Save, X, Star, Crown, Zap, Users, ChevronDown
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface NivelCliente {
  id: string;
  nombre: string;
  slug: string;
  color: string;
  icono: string;
  orden: number;
  compras_minimas: number;
  coins_minimos: number;
  referidos_minimos: number;
  monto_minimo: number;
  descuento_porcentaje: number;
  coins_bonus_porcentaje: number;
  envio_gratis: boolean;
  soporte_prioritario: boolean;
  acceso_eventos: boolean;
  comision_porcentaje: number;
  comision_tipo: string;
}

interface RolUsuario {
  nombre: string;
  label: string;
  descripcion: string;
  color: string;
  permisos: string[];
}

const ROLES: RolUsuario[] = [
  { nombre: 'usuario', label: 'Usuario', descripcion: 'Usuario básico registrado', color: 'gray', permisos: ['ver_productos', 'comprar'] },
  { nombre: 'cliente', label: 'Cliente', descripcion: 'Cliente con historial de compras', color: 'blue', permisos: ['ver_productos', 'comprar', 'ver_historial', 'favoritos'] },
  { nombre: 'editor', label: 'Editor', descripcion: 'Puede editar contenido', color: 'purple', permisos: ['ver_productos', 'comprar', 'ver_historial', 'favoritos', 'editar_contenido', 'crear_posts'] },
  { nombre: 'admin', label: 'Admin', descripcion: 'Administrador de empresa', color: 'amber', permisos: ['ver_productos', 'comprar', 'ver_historial', 'favoritos', 'editar_contenido', 'crear_posts', 'gestionar_productos', 'ver_analiticas', 'gestionar_usuarios'] },
  { nombre: 'superadmin', label: 'Super Admin', descripcion: 'Administrador global', color: 'red', permisos: ['*'] },
];

const ICONOS_DISPONIBLES = ['Award', 'Star', 'Crown', 'Zap', 'Users', 'Shield'];
const COLORES_DISPONIBLES = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];

export default function RolesNivelesPage() {
  const { showToast } = useToast();
  const [niveles, setNiveles] = useState<NivelCliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<NivelCliente>>({});

  useEffect(() => {
    fetchNiveles();
  }, []);

  const fetchNiveles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/context/niveles-cliente');
      const data = await response.json();
      if (data.success) {
        setNiveles(data.data || []);
      }
    } catch {
      showToast('Error al cargar niveles', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNivel = async (id: string) => {
    try {
      const response = await fetch(`/api/context/niveles-cliente/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });
      const data = await response.json();
      if (data.success) {
        setNiveles(prev => prev.map(n => n.id === id ? { ...n, ...editData } : n));
        setEditingId(null);
        setEditData({});
        showToast('Nivel actualizado exitosamente', 'success');
      } else {
        showToast(data.error || 'Error al actualizar', 'error');
      }
    } catch {
      showToast('Error al actualizar nivel', 'error');
    }
  };

  const handleCreateNivel = async () => {
    try {
      const response = await fetch('/api/context/niveles-cliente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: 'Nuevo Nivel',
          slug: 'nuevo-nivel',
          color: '#6B7280',
          icono: 'Award',
          orden: niveles.length,
          compras_minimas: 0,
          coins_minimos: 0,
          referidos_minimos: 0,
          monto_minimo: 0,
          descuento_porcentaje: 0,
          coins_bonus_porcentaje: 0,
          envio_gratis: false,
          soporte_prioritario: false,
          acceso_eventos: false,
          comision_porcentaje: 0,
          comision_tipo: 'porcentaje'
        })
      });
      const data = await response.json();
      if (data.success) {
        setNiveles(prev => [...prev, data.data]);
        setEditingId(data.data.id);
        setEditData(data.data);
        showToast('Nivel creado exitosamente', 'success');
      } else {
        showToast(data.error || 'Error al crear', 'error');
      }
    } catch {
      showToast('Error al crear nivel', 'error');
    }
  };

  const handleDeleteNivel = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este nivel?')) return;
    try {
      const response = await fetch(`/api/context/niveles-cliente/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        setNiveles(prev => prev.filter(n => n.id !== id));
        showToast('Nivel eliminado', 'success');
      }
    } catch {
      showToast('Error al eliminar nivel', 'error');
    }
  };

  const getIconComponent = (icono: string) => {
    switch (icono) {
      case 'Star': return Star;
      case 'Crown': return Crown;
      case 'Zap': return Zap;
      case 'Users': return Users;
      case 'Shield': return Shield;
      default: return Award;
    }
  };

  return (
    <div className="space-y-8 w-full mx-auto pb-20 px-4 md:px-8 pt-8 bg-black min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-0">
        <div className="w-full sm:w-auto">
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter leading-none sm:leading-tight">
            Roles y Niveles
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-2 font-light max-w-xl">
            Configura los roles de usuario y los niveles de cliente con sus beneficios.
          </p>
        </div>
      </div>

      <div className="bg-zinc-950 border border-white/5 rounded-[2rem] p-8 shadow-4xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <Shield className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-wide">Roles de Usuario</h2>
            <p className="text-gray-500 text-sm">Permisos predefinidos por tipo de usuario</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {ROLES.map((rol) => (
            <div
              key={rol.nombre}
              className={`p-4 rounded-2xl border ${rol.color === 'red' ? 'bg-red-500/10 border-red-500/30' :
                rol.color === 'amber' ? 'bg-amber-500/10 border-amber-500/30' :
                rol.color === 'purple' ? 'bg-purple-500/10 border-purple-500/30' :
                rol.color === 'blue' ? 'bg-blue-500/10 border-blue-500/30' :
                'bg-gray-500/10 border-gray-500/30'
              }`}
            >
              <h3 className="font-bold text-white text-sm">{rol.label}</h3>
              <p className="text-gray-400 text-xs mt-1">{rol.descripcion}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {rol.permisos.slice(0, 3).map((p, i) => (
                  <span key={i} className="text-[9px] px-2 py-0.5 bg-white/10 rounded-full text-gray-300">
                    {p.replace('_', ' ')}
                  </span>
                ))}
                {rol.permisos.length > 3 && (
                  <span className="text-[9px] px-2 py-0.5 bg-white/10 rounded-full text-gray-400">
                    +{rol.permisos.length - 3}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-zinc-950 border border-white/5 rounded-[2rem] overflow-hidden shadow-4xl">
        <div className="flex items-center justify-between p-8 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <Award className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-wide">Niveles de Cliente</h2>
              <p className="text-gray-500 text-sm">Sistema de recompensas por fidelidad</p>
            </div>
          </div>
          <button
            onClick={handleCreateNivel}
            className="px-4 py-2 bg-blis-red text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:scale-105 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nuevo Nivel
          </button>
        </div>

        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            <AnimatePresence>
              {niveles.map((nivel, index) => {
                const isEditing = editingId === nivel.id;
                const IconComponent = getIconComponent(isEditing ? (editData.icono || nivel.icono) : nivel.icono);

                return (
                  <motion.div
                    key={nivel.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-6 hover:bg-white/[0.02] transition-colors"
                  >
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Nombre</label>
                            <input
                              type="text"
                              value={editData.nombre || nivel.nombre}
                              onChange={(e) => setEditData(prev => ({ ...prev, nombre: e.target.value }))}
                              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Color</label>
                            <div className="flex gap-2">
                              {COLORES_DISPONIBLES.map(color => (
                                <button
                                  key={color}
                                  onClick={() => setEditData(prev => ({ ...prev, color }))}
                                  className={`w-8 h-8 rounded-lg ${editData.color === color ? 'ring-2 ring-white' : ''}`}
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Ícono</label>
                            <div className="flex gap-2">
                              {ICONOS_DISPONIBLES.map(icono => {
                                const Icon = getIconComponent(icono);
                                return (
                                  <button
                                    key={icono}
                                    onClick={() => setEditData(prev => ({ ...prev, icono }))}
                                    className={`p-2 rounded-lg border ${editData.icono === icono ? 'border-white' : 'border-white/10'}`}
                                  >
                                    <Icon className="w-5 h-5" style={{ color: editData.color || nivel.color }} />
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Compras mínimas</label>
<input
                              type="number"
                              value={editData.compras_minimas ?? nivel.compras_minimas}
                              onChange={(e) => setEditData(prev => ({ ...prev, compras_minimas: parseInt(e.target.value) || 0 }))}
                              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Coins mínimos</label>
                            <input
                              type="number"
                              value={editData.coins_minimos ?? nivel.coins_minimos}
                              onChange={(e) => setEditData(prev => ({ ...prev, coins_minimos: parseInt(e.target.value) || 0 }))}
                              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Descuento (%)</label>
                            <input
                              type="number"
                              value={editData.descuento_porcentaje ?? nivel.descuento_porcentaje}
                              onChange={(e) => setEditData(prev => ({ ...prev, descuento_porcentaje: parseFloat(e.target.value) || 0 }))}
                              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Comisión referidos (%)</label>
                            <input
                              type="number"
                              value={editData.comision_porcentaje ?? nivel.comision_porcentaje}
                              onChange={(e) => setEditData(prev => ({ ...prev, comision_porcentaje: parseFloat(e.target.value) || 0 }))}
                              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white"
                            />
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4">
                          {[
                            { key: 'envio_gratis', label: 'Envío gratis' },
                            { key: 'soporte_prioritario', label: 'Soporte prioritario' },
                            { key: 'acceso_eventos', label: 'Acceso a eventos' }
                          ].map(({ key, label }) => (
                            <label key={key} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={(editData[key as keyof NivelCliente] ?? nivel[key as keyof NivelCliente]) as boolean}
                                onChange={(e) => setEditData(prev => ({ ...prev, [key]: e.target.checked }))}
                                className="w-4 h-4 rounded border-white/20 bg-black/50"
                              />
                              <span className="text-sm text-gray-300">{label}</span>
                            </label>
                          ))}
                        </div>

                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => { setEditingId(null); setEditData({}); }}
                            className="px-4 py-2 bg-white/5 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-white/10 transition-colors flex items-center gap-2"
                          >
                            <X className="w-4 h-4" />
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleSaveNivel(nivel.id)}
                            className="px-4 py-2 bg-blis-red text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:scale-105 transition-all flex items-center gap-2"
                          >
                            <Save className="w-4 h-4" />
                            Guardar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: `${nivel.color}20`, borderColor: `${nivel.color}50`, borderWidth: 1 }}
                          >
                            <IconComponent className="w-6 h-6" style={{ color: nivel.color }} />
                          </div>
                          <div>
                            <h3 className="font-bold text-white">{nivel.nombre}</h3>
                            <p className="text-gray-500 text-xs">
                              {nivel.descuento_porcentaje}% descuento • {nivel.comision_porcentaje}% comisión referidos
                            </p>
                          </div>
                          <div className="hidden md:flex gap-2">
                            {nivel.envio_gratis && (
                              <span className="text-[9px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/30">
                                Envío gratis
                              </span>
                            )}
                            {nivel.soporte_prioritario && (
                              <span className="text-[9px] px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/30">
                                Soporte prioritario
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setEditingId(nivel.id); setEditData(nivel); }}
                            className="p-2 hover:bg-white/5 rounded-xl transition-colors text-gray-400 hover:text-white"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteNivel(nivel.id)}
                            className="p-2 hover:bg-red-500/10 rounded-xl transition-colors text-gray-400 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}