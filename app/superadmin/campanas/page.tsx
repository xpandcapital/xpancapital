"use client";

import { useState } from "react";
import { useCampanas } from "@/lib/hooks/useCampanas";
import { useToast } from "@/components/ui/Toast";
import { useActionGuard } from '@/hooks/useActionGuard'
import { Plus, Edit2, Trash2, Megaphone, Users, Mail, Phone, X, Check, Settings } from "lucide-react";

export default function CampanasPage() {
  const { campanas, loading, error, create, update, delete: deleteCampana, refetch } = useCampanas();
  const { showToast } = useToast();
  const { guard } = useActionGuard();
  
  const [showModal, setShowModal] = useState(false);
  const [editingCampana, setEditingCampana] = useState<any>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    estado: "activa",
    notificar_email: true,
    notificar_whatsapp: false,
    emails_notificacion: [] as string[],
    whatsapp_notificacion: [] as string[],
    notion_database_id: "",
    notion_sync: false
  });
  const [newEmail, setNewEmail] = useState("");
  const [newWhatsapp, setNewWhatsapp] = useState("");

  const handleOpenModal = (campana?: any) => {
    if (campana) {
      if (!guard('campanas', 'editar')) return
      setEditingCampana(campana);
      setFormData({
        nombre: campana.nombre || "",
        descripcion: campana.descripcion || "",
        estado: campana.estado || "activa",
        notificar_email: campana.notificar_email ?? true,
        notificar_whatsapp: campana.notificar_whatsapp ?? false,
        emails_notificacion: campana.emails_notificacion || [],
        whatsapp_notificacion: campana.whatsapp_notificacion || [],
        notion_database_id: campana.notion_database_id || "",
        notion_sync: campana.notion_sync ?? false
      });
    } else {
      if (!guard('campanas', 'crear')) return
      setEditingCampana(null);
      setFormData({
        nombre: "",
        descripcion: "",
        estado: "activa",
        notificar_email: true,
        notificar_whatsapp: false,
        emails_notificacion: [],
        whatsapp_notificacion: [],
        notion_database_id: "",
        notion_sync: false
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCampana) {
        const success = await update(editingCampana.id, formData);
        if (success) {
          showToast("Campaña actualizada correctamente", "success");
          setShowModal(false);
          refetch();
        } else {
          showToast("Error al actualizar campaña", "error");
        }
      } else {
        const result = await create(formData);
        if (result) {
          showToast("Campaña creada correctamente", "success");
          setShowModal(false);
          refetch();
        } else {
          showToast("Error al crear campaña", "error");
        }
      }
    } catch {
      showToast("Error al guardar campaña", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!guard('campanas', 'eliminar')) return
    if (!confirm("¿Estás seguro de eliminar esta campaña?")) return;
    
    const success = await deleteCampana(id);
    if (success) {
      showToast("Campaña eliminada correctamente", "success");
      refetch();
    } else {
      showToast("Error al eliminar campaña", "error");
    }
  };

  const addEmail = () => {
    if (newEmail && !formData.emails_notificacion.includes(newEmail)) {
      setFormData({
        ...formData,
        emails_notificacion: [...formData.emails_notificacion, newEmail]
      });
      setNewEmail("");
    }
  };

  const removeEmail = (email: string) => {
    setFormData({
      ...formData,
      emails_notificacion: formData.emails_notificacion.filter(e => e !== email)
    });
  };

  const addWhatsapp = () => {
    if (newWhatsapp && !formData.whatsapp_notificacion.includes(newWhatsapp)) {
      setFormData({
        ...formData,
        whatsapp_notificacion: [...formData.whatsapp_notificacion, newWhatsapp]
      });
      setNewWhatsapp("");
    }
  };

  const removeWhatsapp = (phone: string) => {
    setFormData({
      ...formData,
      whatsapp_notificacion: formData.whatsapp_notificacion.filter(p => p !== phone)
    });
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activa': return 'bg-emerald-500/20 text-emerald-400';
      case 'pausada': return 'bg-amber-500/20 text-amber-400';
      case 'finalizada': return 'bg-gray-500/20 text-gray-400';
      case 'borrador': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black">Campañas</h1>
            <p className="text-gray-400 text-sm mt-1">Gestiona las campañas de marketing y sus notificaciones</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="px-5 py-3 bg-blis-red text-white rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform"
          >
            <Plus className="w-5 h-5" />
            Nueva Campaña
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blis-red"></div>
          </div>
        )}

        {/* Grid */}
        {!loading && campanas && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campanas.map((campana: any) => (
              <div
                key={campana.id}
                className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 hover:border-blis-red/50 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blis-red/20 flex items-center justify-center">
                      <Megaphone className="w-6 h-6 text-blis-red" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{campana.nombre}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getEstadoColor(campana.estado)}`}>
                        {campana.estado}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(campana)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(campana.id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>

                {campana.descripcion && (
                  <p className="text-gray-400 text-sm mb-4">{campana.descripcion}</p>
                )}

                <div className="space-y-2 text-sm">
                  {campana.asesor && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Users className="w-4 h-4" />
                      <span>Asesor: {campana.asesor.nombre}</span>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    {campana.notificar_email && (
                      <span className="flex items-center gap-1 text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                        <Mail className="w-3 h-3" />
                        Email
                      </span>
                    )}
                    {campana.notificar_whatsapp && (
                      <span className="flex items-center gap-1 text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full">
                        <Phone className="w-3 h-3" />
                        WhatsApp
                      </span>
                    )}
                    {campana.notion_sync && (
                      <span className="flex items-center gap-1 text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">
                        <Settings className="w-3 h-3" />
                        Notion
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && campanas && campanas.length === 0 && (
          <div className="text-center py-12">
            <Megaphone className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No hay campañas registradas</p>
            <button
              onClick={() => handleOpenModal()}
              className="mt-4 text-blis-red hover:text-blis-red/80"
            >
              Crear la primera campaña
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-lg my-8">
            <div className="flex justify-between items-center p-6 border-b border-white/10 sticky top-0 bg-zinc-900 z-10">
              <h2 className="text-xl font-bold">
                {editingCampana ? "Editar Campaña" : "Nueva Campaña"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                  Nombre de la Campaña *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blis-red outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blis-red outline-none resize-none"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                  Estado
                </label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blis-red outline-none"
                >
                  <option value="borrador">Borrador</option>
                  <option value="activa">Activa</option>
                  <option value="pausada">Pausada</option>
                  <option value="finalizada">Finalizada</option>
                </select>
              </div>

              {/* Notificaciones */}
              <div className="border-t border-white/10 pt-4">
                <h3 className="text-sm font-bold text-white mb-3">Notificaciones</h3>
                
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.notificar_email}
                      onChange={(e) => setFormData({ ...formData, notificar_email: e.target.checked })}
                      className="w-5 h-5 rounded"
                    />
                    <span className="text-sm text-white flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Notificar por Email
                    </span>
                  </label>

                  {formData.notificar_email && (
                    <div className="pl-7 space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder="email@ejemplo.com"
                          className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                        />
                        <button
                          type="button"
                          onClick={addEmail}
                          className="px-3 py-2 bg-blis-red/20 text-blis-red rounded-lg text-sm"
                        >
                          Agregar
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.emails_notificacion.map((email, idx) => (
                          <span key={idx} className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-lg text-xs">
                            {email}
                            <button type="button" onClick={() => removeEmail(email)}>
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.notificar_whatsapp}
                      onChange={(e) => setFormData({ ...formData, notificar_whatsapp: e.target.checked })}
                      className="w-5 h-5 rounded"
                    />
                    <span className="text-sm text-white flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Notificar por WhatsApp
                    </span>
                  </label>

                  {formData.notificar_whatsapp && (
                    <div className="pl-7 space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newWhatsapp}
                          onChange={(e) => setNewWhatsapp(e.target.value)}
                          placeholder="51999999999"
                          className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                        />
                        <button
                          type="button"
                          onClick={addWhatsapp}
                          className="px-3 py-2 bg-blis-red/20 text-blis-red rounded-lg text-sm"
                        >
                          Agregar
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.whatsapp_notificacion.map((phone, idx) => (
                          <span key={idx} className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-lg text-xs">
                            {phone}
                            <button type="button" onClick={() => removeWhatsapp(phone)}>
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notion Integration */}
              <div className="border-t border-white/10 pt-4">
                <h3 className="text-sm font-bold text-white mb-3">Integración con Notion</h3>
                
                <label className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    checked={formData.notion_sync}
                    onChange={(e) => setFormData({ ...formData, notion_sync: e.target.checked })}
                    className="w-5 h-5 rounded"
                  />
                  <span className="text-sm text-white">Sincronizar leads con Notion</span>
                </label>

                {formData.notion_sync && (
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                      Notion Database ID
                    </label>
                    <input
                      type="text"
                      value={formData.notion_database_id}
                      onChange={(e) => setFormData({ ...formData, notion_database_id: e.target.value })}
                      placeholder="1234567890abcdef1234567890abcdef"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blis-red outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 bg-white/10 rounded-xl font-bold hover:bg-white/20 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blis-red rounded-xl font-bold hover:bg-blis-red/80 transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  {editingCampana ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}