"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  UsersRound, Plus, Search, Edit2, Trash2, 
  Phone, Mail, FileText, Percent, DollarSign,
  ChevronDown, ChevronUp, X, Check, Loader2,
  UserCheck, AlertCircle, BookOpen
} from 'lucide-react';
import { AssignmentModal } from './_components/AssignmentModal';

type Advisor = {
  id: string;
  name: string;
  email: string;
  phone: string;
  phone_code: string;
  document_id: string;
  commission_type: 'percentage' | 'fixed';
  commission_value: number;
  commission_trigger_percent: number;
  is_active: boolean;
  created_at: string;
  notes: string;
};

export default function AsesoresPage() {
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAdvisor, setEditingAdvisor] = useState<Advisor | null>(null);
  const [expandedAdvisor, setExpandedAdvisor] = useState<string | null>(null);
  const [assigningAdvisor, setAssigningAdvisor] = useState<Advisor | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ isOpen: boolean; advisor: Advisor | null }>({
    isOpen: false,
    advisor: null
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    phone_code: '+593',
    document_id: '',
    commission_type: 'percentage' as 'percentage' | 'fixed',
    commission_value: 0,
    commission_trigger_percent: 30,
    is_active: true,
    notes: ''
  });

  useEffect(() => {
    loadAdvisors();
  }, []);

  const loadAdvisors = async () => {
    try {
      const { data, error } = await supabase
        .from('advisors')
        .select('*')
        .order('name');

      if (error) throw error;
      setAdvisors(data || []);
    } catch (error) {
      console.error('Error loading advisors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (advisor?: Advisor) => {
    if (advisor) {
      setEditingAdvisor(advisor);
      setFormData({
        name: advisor.name,
        email: advisor.email || '',
        phone: advisor.phone || '',
        phone_code: advisor.phone_code || '+593',
        document_id: advisor.document_id || '',
        commission_type: advisor.commission_type || 'percentage',
        commission_value: advisor.commission_value || 0,
        commission_trigger_percent: advisor.commission_trigger_percent || 30,
        is_active: advisor.is_active,
        notes: advisor.notes || ''
      });
    } else {
      setEditingAdvisor(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        phone_code: '+593',
        document_id: '',
        commission_type: 'percentage',
        commission_value: 0,
        commission_trigger_percent: 30,
        is_active: true,
        notes: ''
      });
    }
    setShowModal(true);
  };

  const handleSaveAdvisor = async () => {
    try {
      if (editingAdvisor) {
        const { error } = await supabase
          .from('advisors')
          .update(formData)
          .eq('id', editingAdvisor.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('advisors')
          .insert([formData]);

        if (error) throw error;
      }

      await loadAdvisors();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving advisor:', error);
      alert('Error al guardar el asesor');
    }
  };

  const handleDeleteAdvisor = async () => {
    if (!showDeleteConfirm.advisor) return;

    try {
      const { error } = await supabase
        .from('advisors')
        .delete()
        .eq('id', showDeleteConfirm.advisor.id);

      if (error) throw error;
      
      await loadAdvisors();
      setShowDeleteConfirm({ isOpen: false, advisor: null });
    } catch (error) {
      console.error('Error deleting advisor:', error);
      alert('Error al eliminar el asesor');
    }
  };

  const toggleAdvisorStatus = async (advisor: Advisor) => {
    try {
      const { error } = await supabase
        .from('advisors')
        .update({ is_active: !advisor.is_active })
        .eq('id', advisor.id);

      if (error) throw error;
      await loadAdvisors();
    } catch (error) {
      console.error('Error toggling advisor status:', error);
    }
  };

  const filteredAdvisors = advisors.filter(advisor =>
    advisor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    advisor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    advisor.document_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)]">
        <Loader2 className="w-8 h-8 text-blis-red animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
            Gestión de Asesores
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Administra el equipo de asesores y vendedores inmobiliarios.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blis-red text-white px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-blis-red/30"
        >
          <Plus className="w-4 h-4" />
          Nuevo Asesor
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Buscar por nombre, email o cédula..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-sm focus:outline-none focus:border-blis-red/50 transition-colors"
        />
      </div>

      {/* Advisors Grid */}
      <div className="grid gap-4">
        {filteredAdvisors.map((advisor) => (
          <div
            key={advisor.id}
            className={`bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden transition-all ${
              advisor.is_active ? '' : 'opacity-60'
            }`}
          >
            {/* Advisor Header */}
            <div
              className="p-4 md:p-6 cursor-pointer hover:bg-white/[0.02] transition-colors flex flex-col lg:flex-row gap-4 justify-between items-center"
              onClick={() => setExpandedAdvisor(expandedAdvisor === advisor.id ? null : advisor.id)}
            >
              <div className="flex items-center gap-4 w-full lg:w-auto">
                <div className="w-12 h-12 rounded-xl bg-blis-red/10 border border-blis-red/20 flex items-center justify-center">
                  <UsersRound className="w-6 h-6 text-blis-red" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-bold truncate">{advisor.name}</h3>
                    {!advisor.is_active && (
                      <span className="px-2 py-0.5 rounded bg-gray-500/10 text-gray-400 text-[10px] font-bold uppercase">
                        Inactivo
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-xs truncate">
                    {advisor.email || 'Sin email'} • {advisor.phone || 'Sin teléfono'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 w-full lg:w-auto justify-between">
                {/* Commission Info */}
                <div className="flex gap-4 text-center">
                  <div>
                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                      Comisión
                    </p>
                    <p className="text-white font-mono font-bold">
                      {advisor.commission_type === 'percentage' 
                        ? `${advisor.commission_value}%` 
                        : `$${advisor.commission_value}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                      Activa al
                    </p>
                    <p className="text-white font-mono font-bold">
                      {advisor.commission_trigger_percent}%
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAdvisorStatus(advisor);
                    }}
                    className={`p-2 rounded-lg transition-all ${
                      advisor.is_active
                        ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                        : 'bg-gray-500/10 text-gray-400 hover:bg-gray-500/20'
                    }`}
                    title={advisor.is_active ? 'Desactivar' : 'Activar'}
                  >
                    <UserCheck className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenModal(advisor);
                    }}
                    className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setAssigningAdvisor(advisor);
                    }}
                    className="p-2 bg-blis-red/10 hover:bg-blis-red/20 text-blis-red rounded-lg transition-all"
                    title="Asignar cursos y productos"
                  >
                    <BookOpen className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteConfirm({ isOpen: true, advisor });
                    }}
                    className="p-2 bg-white/5 hover:bg-blis-red/20 text-gray-400 hover:text-blis-red rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-white transition-colors">
                    {expandedAdvisor === advisor.id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedAdvisor === advisor.id && (
              <div className="border-t border-white/5 bg-black/50 p-4 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Teléfono
                    </p>
                    <p className="text-white font-mono">
                      {advisor.phone_code} {advisor.phone || 'No registrado'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest flex items-center gap-1">
                      <FileText className="w-3 h-3" /> Cédula / RUC
                    </p>
                    <p className="text-white font-mono">
                      {advisor.document_id || 'No registrado'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest flex items-center gap-1">
                      <Mail className="w-3 h-3" /> Correo
                    </p>
                    <p className="text-white font-mono">
                      {advisor.email || 'No registrado'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest flex items-center gap-1">
                      <Percent className="w-3 h-3" /> Tipo de Comisión
                    </p>
                    <p className="text-white font-mono capitalize">
                      {advisor.commission_type === 'percentage' ? 'Porcentaje' : 'Monto Fijo'}
                    </p>
                  </div>
                </div>
                {advisor.notes && (
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-1">
                      Observaciones
                    </p>
                    <p className="text-gray-400 text-sm">{advisor.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {filteredAdvisors.length === 0 && (
          <div className="text-center py-12">
            <UsersRound className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm ? 'No se encontraron asesores con ese criterio de búsqueda.' : 'No hay asesores registrados.'}
            </p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-black text-white uppercase tracking-tight">
                {editingAdvisor ? 'Editar Asesor' : 'Nuevo Asesor'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blis-red/50 transition-colors"
                  placeholder="Ej: Juan Carlos Pérez"
                />
              </div>

              {/* Document ID */}
              <div className="space-y-2">
                <label className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                  Cédula / RUC
                </label>
                <input
                  type="text"
                  value={formData.document_id}
                  onChange={(e) => setFormData({ ...formData, document_id: e.target.value })}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blis-red/50 transition-colors"
                  placeholder="Ej: 1712345678"
                />
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blis-red/50 transition-colors"
                    placeholder="juan@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                    Teléfono
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formData.phone_code}
                      onChange={(e) => setFormData({ ...formData, phone_code: e.target.value })}
                      className="bg-black border border-white/10 rounded-xl px-2 py-3 text-white focus:outline-none focus:border-blis-red/50 transition-colors"
                    >
                      <option value="+593">+593</option>
                      <option value="+1">+1</option>
                      <option value="+34">+34</option>
                      <option value="+57">+57</option>
                      <option value="+51">+51</option>
                      <option value="+52">+52</option>
                      <option value="+54">+54</option>
                      <option value="+56">+56</option>
                    </select>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blis-red/50 transition-colors"
                      placeholder="0991234567"
                    />
                  </div>
                </div>
              </div>

              {/* Commission Settings */}
              <div className="border-t border-white/5 pt-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">
                  Configuración de Comisión
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                      Tipo de Comisión
                    </label>
                    <select
                      value={formData.commission_type}
                      onChange={(e) => setFormData({ ...formData, commission_type: e.target.value as 'percentage' | 'fixed' })}
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blis-red/50 transition-colors"
                    >
                      <option value="percentage">Porcentaje (%)</option>
                      <option value="fixed">Monto Fijo ($)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                      Valor de Comisión
                    </label>
                    <div className="relative">
                      {formData.commission_type === 'percentage' ? (
                        <Percent className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                      ) : (
                        <DollarSign className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                      )}
                      <input
                        type="number"
                        value={formData.commission_value}
                        onChange={(e) => setFormData({ ...formData, commission_value: parseFloat(e.target.value) || 0 })}
                        className={`w-full bg-black border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-blis-red/50 transition-colors ${
                          formData.commission_type === 'percentage' ? '' : ''
                        }`}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                      Liberar al (%) Pagado
                    </label>
                    <input
                      type="number"
                      value={formData.commission_trigger_percent}
                      onChange={(e) => setFormData({ ...formData, commission_trigger_percent: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blis-red/50 transition-colors"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                  Observaciones
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blis-red/50 transition-colors resize-none"
                  placeholder="Notas adicionales sobre el asesor..."
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    formData.is_active ? 'bg-emerald-500' : 'bg-gray-600'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                      formData.is_active ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
                <span className="text-white text-sm font-medium">
                  {formData.is_active ? 'Asesor Activo' : 'Asesor Inactivo'}
                </span>
              </div>
            </div>

            <div className="p-6 border-t border-white/5 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all font-medium text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveAdvisor}
                disabled={!formData.name.trim()}
                className="px-6 py-2.5 bg-blis-red rounded-xl text-white font-bold text-sm hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                {editingAdvisor ? 'Guardar Cambios' : 'Crear Asesor'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm.isOpen && showDeleteConfirm.advisor && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-blis-red/10 border border-blis-red/20 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-blis-red" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight">
                  Eliminar Asesor
                </h2>
                <p className="text-gray-400 text-sm">
                  Esta acción no se puede deshacer
                </p>
              </div>
            </div>

            <p className="text-gray-300 mb-6">
              ¿Estás seguro de que deseas eliminar al asesor{' '}
              <span className="text-white font-bold">{showDeleteConfirm.advisor.name}</span>? 
              Todos los datos asociados se perderán permanentemente.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm({ isOpen: false, advisor: null })}
                className="px-6 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all font-medium text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAdvisor}
                className="px-6 py-2.5 bg-blis-red rounded-xl text-white font-bold text-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {assigningAdvisor && (
        <AssignmentModal
          advisor={assigningAdvisor}
          onClose={() => setAssigningAdvisor(null)}
        />
      )}
    </div>
  );
}
