"use client";

import { useState } from 'react';
import { useAsesores, useRoles } from './_hooks';
import { Advisor } from './_types';
import { 
  UsersRound, Plus, Search, Edit2, Trash2,
  ChevronDown, ChevronUp, Loader2, UserCheck,
  BookOpen, KeyRound, Shield
} from 'lucide-react';
import { EmployeeModal } from './_components/EmployeeModal';
import { AssignmentModal } from './_components/AssignmentModal';
import { useActionGuard } from '@/hooks/useActionGuard'

export default function AsesoresPage() {
  const { advisors, loading, refetch } = useAsesores();
  const { roles } = useRoles();
  const { guard } = useActionGuard();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingAdvisor, setEditingAdvisor] = useState<Advisor | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [expandedAdvisor, setExpandedAdvisor] = useState<string | null>(null);
  const [assigningAdvisor, setAssigningAdvisor] = useState<Advisor | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ isOpen: boolean; advisor: Advisor | null }>({ isOpen: false, advisor: null });

  const filteredAdvisors = advisors.filter(a =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.document_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.puesto?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (rol?: string) => {
    const colors: Record<string, string> = {
      superadmin: 'bg-blis-red/10 text-blis-red border-blis-red/20',
      admin: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      editor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      cliente: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      usuario: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    };
    return colors[rol || 'editor'] || colors.editor;
  };

  const getRoleLabel = (rol?: string) => {
    const labels: Record<string, string> = {
      superadmin: 'Super Admin',
      admin: 'Admin',
      editor: 'Editor',
      cliente: 'Cliente',
      usuario: 'Usuario',
    };
    return labels[rol || 'editor'] || rol || 'Editor';
  };

  const handleDeleteAdvisor = async () => {
    if (!guard('asesores', 'eliminar')) return;
    if (!showDeleteConfirm.advisor) return;
    try {
      await fetch(`/api/admin/equipo?id=${showDeleteConfirm.advisor.id}`, { method: 'DELETE' });
      await refetch();
      setShowDeleteConfirm({ isOpen: false, advisor: null });
    } catch { alert('Error al eliminar'); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)]">
        <Loader2 className="w-8 h-8 text-blis-red animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">Equipo</h1>
          <p className="text-gray-400 text-sm mt-1">Gestiona miembros, roles, cursos y permisos del equipo.</p>
        </div>
        <button
          onClick={() => { if (!guard('asesores', 'crear')) return; setCreatingNew(true); setEditingAdvisor(null); }}
          className="bg-blis-red text-white px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-blis-red/30"
        >
          <Plus className="w-4 h-4" /> Nuevo Empleado
        </button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Buscar por nombre, email, cédula o puesto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-sm focus:outline-none focus:border-blis-red/50 transition-colors"
        />
      </div>

      <div className="grid gap-3">
        {filteredAdvisors.map((advisor) => (
          <div
            key={advisor.id}
            className={`bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden transition-all ${advisor.is_active ? '' : 'opacity-60'}`}
          >
            <div
              className="p-4 md:p-5 cursor-pointer hover:bg-white/[0.02] transition-colors flex flex-col lg:flex-row gap-3 justify-between items-center"
              onClick={() => setExpandedAdvisor(expandedAdvisor === advisor.id ? null : advisor.id)}
            >
              <div className="flex items-center gap-4 w-full lg:w-auto">
                <div className="w-11 h-11 rounded-xl bg-blis-red/10 border border-blis-red/20 flex items-center justify-center shrink-0">
                  <UsersRound className="w-5 h-5 text-blis-red" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-white font-bold truncate">{advisor.name}</h3>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${getRoleColor(advisor.rol)}`}>
                      {getRoleLabel(advisor.rol)}
                    </span>
                    {!advisor.is_active && <span className="px-2 py-0.5 rounded bg-gray-500/10 text-gray-400 text-[9px] font-bold uppercase">Inactivo</span>}
                    {advisor.puesto && <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded">{advisor.puesto}</span>}
                  </div>
                  <p className="text-gray-500 text-xs truncate">{advisor.email || 'Sin email'} • {advisor.phone || 'Sin teléfono'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={(e) => { e.stopPropagation(); setAssigningAdvisor(advisor); }} className="p-2 bg-blis-red/10 hover:bg-blis-red/20 text-blis-red rounded-lg transition-all" title="Cursos y productos">
                  <BookOpen className="w-4 h-4" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); if (!guard('asesores', 'editar')) return; setEditingAdvisor(advisor); setCreatingNew(false); }} className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all" title="Editar">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); if (!guard('asesores', 'eliminar')) return; setShowDeleteConfirm({ isOpen: true, advisor }); }} className="p-2 bg-white/5 hover:bg-blis-red/20 text-gray-400 hover:text-blis-red rounded-lg transition-all" title="Eliminar">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button className="p-1 text-gray-600 hover:text-white transition-colors">
                  {expandedAdvisor === advisor.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {expandedAdvisor === advisor.id && (
              <div className="border-t border-white/5 bg-black/50 px-4 md:px-5 py-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div><p className="text-gray-600 font-bold uppercase tracking-widest mb-1 flex items-center gap-1"><Shield className="w-3 h-3" /> Rol</p><p className={`font-bold px-2 py-1 rounded border inline-block ${getRoleColor(advisor.rol)}`}>{getRoleLabel(advisor.rol)}</p></div>
                  {advisor.document_id && <div><p className="text-gray-600 font-bold uppercase tracking-widest mb-1">Cédula</p><p className="text-white font-mono">{advisor.document_id}</p></div>}
                  {advisor.lugar_residencia && <div><p className="text-gray-600 font-bold uppercase tracking-widest mb-1">Residencia</p><p className="text-white">{advisor.lugar_residencia}</p></div>}
                  {advisor.nivel_estudios && <div><p className="text-gray-600 font-bold uppercase tracking-widest mb-1">Estudios</p><p className="text-white">{advisor.nivel_estudios}</p></div>}
                  {advisor.commission_type && <div><p className="text-gray-600 font-bold uppercase tracking-widest mb-1">Comisión</p><p className="text-white font-mono">{advisor.commission_type === 'percentage' ? `${advisor.commission_value}%` : `$${advisor.commission_value}`}</p></div>}
                  {advisor.aspiracion_salarial && <div><p className="text-gray-600 font-bold uppercase tracking-widest mb-1">Aspiración</p><p className="text-white">{advisor.aspiracion_salarial}</p></div>}
                  {advisor.herramientas && advisor.herramientas.length > 0 && <div className="col-span-2 md:col-span-4"><p className="text-gray-600 font-bold uppercase tracking-widest mb-1">Herramientas</p><div className="flex flex-wrap gap-1">{advisor.herramientas.map((h, i) => <span key={i} className="bg-white/5 text-gray-300 px-2 py-0.5 rounded text-[10px]">{h}</span>)}</div></div>}
                </div>
              </div>
            )}
          </div>
        ))}

        {filteredAdvisors.length === 0 && (
          <div className="text-center py-12">
            <UsersRound className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500">{searchTerm ? 'No se encontraron miembros.' : 'No hay miembros del equipo. Crea el primero.'}</p>
          </div>
        )}
      </div>

      {(creatingNew || editingAdvisor) && (
        <EmployeeModal
          advisor={editingAdvisor}
          roles={roles}
          onClose={() => { setEditingAdvisor(null); setCreatingNew(false); refetch(); }}
        />
      )}

      {assigningAdvisor && (
        <AssignmentModal advisor={assigningAdvisor} onClose={() => setAssigningAdvisor(null)} />
      )}

      {showDeleteConfirm.isOpen && showDeleteConfirm.advisor && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-black text-white mb-2">Eliminar Miembro</h2>
            <p className="text-gray-300 mb-6">¿Eliminar a <span className="text-white font-bold">{showDeleteConfirm.advisor.name}</span>?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteConfirm({ isOpen: false, advisor: null })} className="px-6 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm">Cancelar</button>
              <button onClick={handleDeleteAdvisor} className="px-6 py-2.5 bg-blis-red rounded-xl text-white font-bold text-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-2"><Trash2 className="w-4 h-4" />Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}