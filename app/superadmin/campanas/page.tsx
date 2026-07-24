"use client";

import { useState, useEffect } from "react";
import { useCampanas } from "@/lib/hooks/useCampanas";
import { useToast } from "@/components/ui/Toast";
import { useActionGuard } from '@/hooks/useActionGuard'
import { SearchableSelect } from "@/components/ui/SearchableSelect"
import { Plus, Edit2, Trash2, Megaphone, Users, Mail, Phone, X, Check, Settings, Send, MessageSquare, Image, Clock, Play, Pause, BarChart3 } from "lucide-react";

export default function CampanasPage() {
  const { campanas, loading, error, create, update, delete: deleteCampana, refetch } = useCampanas();
  const { showToast } = useToast();
  const { guard } = useActionGuard();
  
  const [showModal, setShowModal] = useState(false);
  const [editingCampana, setEditingCampana] = useState<any>(null);
  const [formData, setFormData] = useState({
    nombre: "", descripcion: "", estado: "activa",
    asesor_id: "", tipo_captura: "solo_formulario",
    formulario_id: "", calendario_id: "", producto_id: "",
    notificar_email: true, notificar_whatsapp: false,
    emails_notificacion: [] as string[],
    whatsapp_notificacion: [] as string[],
    notion_database_id: "", notion_sync: false
  });
  const [formularios, setFormularios] = useState<any[]>([])
  const [calendarios, setCalendarios] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [newEmail, setNewEmail] = useState("");
  const [newWhatsapp, setNewWhatsapp] = useState("");

  // WhatsApp Remarketing
  const [showWAModal, setShowWAModal] = useState(false)
  const [waCampaigns, setWaCampaigns] = useState<any[]>([])
  const [waForm, setWaForm] = useState({
    nombre: '', mensajes: [''], variablesTexto: '{}',
    media_url: '', filename: '',
    min_delay_seconds: 60, max_delay_seconds: 180,
    lead_filter_estado: '', lead_filter_campana_id: '',
  })
  const [waLoading, setWaLoading] = useState(false)

  const loadWaCampaigns = async () => {
    const r = await fetch('/api/campanas/whatsapp')
    const d = await r.json()
    if (d.success) setWaCampaigns(d.data || [])
  }

  useEffect(() => { loadWaCampaigns() }, [])

  useEffect(() => {
    fetch('/api/formularios?all=true').then(r=>r.json()).then(d=>{ if(d.success) setFormularios(d.data||[]) })
    fetch('/api/calendarios').then(r=>r.json()).then(d=>{ if(d.success) setCalendarios(d.data||d.calendarios||[]) })
    fetch('/api/productos?all=true&limit=500').then(r=>r.json()).then(d=>{ if(d.success) setProductos(d.data||d.productos||[]) })
  }, [])

  const handleOpenModal = (campana?: any) => {
    if (campana) {
      if (!guard('campanas', 'editar')) return
      setEditingCampana(campana);
      setFormData({
        nombre: campana.nombre || "",
        descripcion: campana.descripcion || "",
        estado: campana.estado || "activa",
        asesor_id: campana.asesor_id || "",
        tipo_captura: campana.tipo_captura || "solo_formulario",
        formulario_id: campana.formulario_id || "",
        calendario_id: campana.calendario_id || "",
        producto_id: campana.producto_id || "",
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
        asesor_id: "",
        tipo_captura: "solo_formulario",
        formulario_id: "",
        calendario_id: "",
        producto_id: "",
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
    
    try {
      const res = await fetch(`/api/campanas?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        showToast("Campaña eliminada correctamente", "success");
        refetch();
      } else {
        showToast("Error al eliminar campaña", "error");
      }
    } catch {
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
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black">Campañas</h1>
            <p className="text-gray-400 text-sm mt-1">Gestiona las campañas de marketing y sus notificaciones</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="px-5 py-3 bg-blis-red text-white rounded-xl font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform"
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
                      <span className="text-[10px] text-gray-500">{campana.leads_count || 0} leads</span>
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
                  className="w-full" buttonClassName="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blis-red outline-none"
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
                  className="w-full" buttonClassName="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blis-red outline-none resize-none"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                  Estado
                </label>
                <SearchableSelect
                  value={formData.estado}
                  onChange={(value) => setFormData({ ...formData, estado: value })}
                  options={[
                    { value: "borrador", label: "Borrador" },
                    { value: "activa", label: "Activa" },
                    { value: "pausada", label: "Pausada" },
                    { value: "finalizada", label: "Finalizada" },
                  ]}
                  className="w-full" buttonClassName="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blis-red outline-none"
                />
              </div>

              {/* Tipo de Captura */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                  Tipo de Captura
                </label>
                <div className="flex gap-1 bg-black/50 border border-white/10 rounded-xl p-1">
                  {[
                    { value: "solo_formulario", label: "Solo Formulario" },
                    { value: "solo_calendario", label: "Solo Calendario" },
                    { value: "formulario_calendario", label: "Formulario → Calendario" },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, tipo_captura: opt.value })}
                      className={`flex-1 px-3 py-2 text-xs font-bold rounded-lg transition-colors ${
                        formData.tipo_captura === opt.value
                          ? "bg-blis-red text-white"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Formulario (visible si tipo incluye formulario) */}
              {(formData.tipo_captura === "solo_formulario" || formData.tipo_captura === "formulario_calendario") && (
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                    Formulario
                  </label>
                  <SearchableSelect
                    value={formData.formulario_id}
                    onChange={(value) => setFormData({ ...formData, formulario_id: value })}
                    options={formularios.map(f => ({ value: f.id, label: f.nombre }))}
                    className="w-full" buttonClassName="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blis-red outline-none"
                  />
                </div>
              )}

              {/* Calendario (visible si tipo incluye calendario) */}
              {(formData.tipo_captura === "solo_calendario" || formData.tipo_captura === "formulario_calendario") && (
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                    Calendario
                  </label>
                  <SearchableSelect
                    value={formData.calendario_id}
                    onChange={(value) => setFormData({ ...formData, calendario_id: value })}
                    options={calendarios.map(c => ({ value: c.id, label: c.nombre }))}
                    className="w-full" buttonClassName="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blis-red outline-none"
                  />
                </div>
              )}

              {/* Producto (visible si tipo incluye calendario) */}
              {(formData.tipo_captura === "solo_calendario" || formData.tipo_captura === "formulario_calendario") && (
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                    Producto
                  </label>
                  <SearchableSelect
                    value={formData.producto_id}
                    onChange={(value) => setFormData({ ...formData, producto_id: value })}
                    options={productos.map(p => ({ value: p.id, label: p.nombre, image: p.imagen_principal }))}
                    className="w-full" buttonClassName="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blis-red outline-none"
                  />
                </div>
              )}

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
                      className="w-full" buttonClassName="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blis-red outline-none"
                    />
          </div>
        )}

        {/* ── WhatsApp Remarketing Section ── */}
        <div className="mt-12 mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-black flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                WhatsApp Remarketing
              </h2>
              <p className="text-gray-500 text-xs mt-1">Campañas masivas con variables aleatorias y delays configurables</p>
            </div>
            <button onClick={() => setShowWAModal(true)} className="px-4 py-2.5 bg-emerald-600 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-emerald-500 transition-colors">
              <Plus className="w-4 h-4" /> Nueva Campaña WhatsApp
            </button>
          </div>

          {waCampaigns.length === 0 ? (
            <div className="text-center py-8 bg-zinc-900/30 border border-white/5 rounded-2xl">
              <Send className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Sin campañas de WhatsApp</p>
            </div>
          ) : (
            <div className="space-y-3">
              {waCampaigns.map((wc: any) => (
                <div key={wc.id} className="bg-zinc-900/30 border border-white/5 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                      wc.status === 'sending' ? 'bg-emerald-500 animate-pulse' :
                      wc.status === 'completed' ? 'bg-blue-500' :
                      wc.status === 'scheduled' ? 'bg-amber-500' :
                      wc.status === 'paused' ? 'bg-yellow-500' : 'bg-gray-600'
                    }`} />
                    <div className="min-w-0">
                      <p className="text-white text-sm font-bold truncate">{wc.nombre}</p>
                      <div className="flex items-center gap-3 text-[10px] text-gray-500 mt-0.5">
                        <span>{wc.status}</span>
                        <BarChart3 className="w-3 h-3" />
                        <span>{wc.sent_count}/{wc.total_recipients}</span>
                        {wc.scheduled_for && <span><Clock className="w-3 h-3 inline" /> {new Date(wc.scheduled_for).toLocaleString('es-MX')}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {wc.status === 'draft' && (
                      <button onClick={async () => {
                        await fetch('/api/campanas/whatsapp', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({action:'start',id:wc.id}) })
                        loadWaCampaigns()
                        showToast('Envío iniciado', 'success')
                      }} className="px-3 py-1.5 bg-emerald-600 rounded-lg text-white text-[10px] font-bold flex items-center gap-1 hover:bg-emerald-500">
                        <Play className="w-3 h-3" /> Iniciar
                      </button>
                    )}
                    {wc.status === 'sending' && (
                      <button onClick={async () => {
                        await fetch('/api/campanas/whatsapp', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({action:'pause',id:wc.id}) })
                        loadWaCampaigns()
                      }} className="px-3 py-1.5 bg-amber-600 rounded-lg text-white text-[10px] font-bold flex items-center gap-1 hover:bg-amber-500">
                        <Pause className="w-3 h-3" /> Pausar
                      </button>
                    )}
                    <button onClick={async () => {
                      if (!confirm('¿Eliminar campaña?')) return
                      await fetch('/api/campanas/whatsapp', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({action:'delete',id:wc.id}) })
                      loadWaCampaigns()
                      showToast('Eliminada', 'success')
                    }} className="px-3 py-1.5 bg-red-500/10 rounded-lg text-red-400 text-[10px] font-bold hover:bg-red-500/20">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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

      {/* WhatsApp Campaign Modal */}
      {showWAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-black text-lg flex items-center gap-2"><Send className="w-5 h-5 text-emerald-400" /> Campaña WhatsApp</h3>
              <button onClick={() => setShowWAModal(false)} className="p-2 hover:bg-white/10 rounded-xl text-gray-400"><X className="w-4 h-4" /></button>
            </div>

            <div>
              <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Nombre *</label>
              <input value={waForm.nombre} onChange={e => setWaForm(p => ({...p, nombre: e.target.value}))} className="w-full" buttonClassName="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white mt-1" placeholder="Remarketing Julio 2026" />
            </div>

            <div>
              <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                Variantes de mensaje * <span className="text-gray-600 normal-case">(1 por línea, se elige aleatoriamente para cada lead)</span>
              </label>
              <textarea
                value={waForm.mensajes.join('\n')}
                onChange={e => setWaForm(p => ({...p, mensajes: e.target.value.split('\n').filter(l => l.trim())}))}
                rows={4}
                className="w-full" buttonClassName="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white mt-1 resize-none"
                placeholder={`{saludo} oferta inmobiliaria 🏠\n{cierre} ¿te interesa?\nHey, vi que te gustó nuestro proyecto 👀`}
              />
              <p className="text-[9px] text-gray-600 mt-1">Usa {'{saludo}'}, {'{cierre}'}, etc. — se reemplazan con opciones aleatorias de abajo</p>
            </div>

            <div>
              <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Variables <span className="text-gray-600 normal-case">(JSON: {"{variable: ['opcion1','opcion2']}"})</span></label>
              <textarea
                value={waForm.variablesTexto}
                onChange={e => setWaForm(p => ({...p, variablesTexto: e.target.value}))}
                rows={3}
                className="w-full" buttonClassName="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white mt-1 resize-none font-mono"
                placeholder='{"saludo": ["Hola, ¿qué tal? 👋","¡Hey! ¿Cómo te va? 😊"], "cierre": ["¿Te interesa? 👍","Avísame 📩"]}'
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Delay mínimo (seg)</label>
                <input type="number" value={waForm.min_delay_seconds} onChange={e => setWaForm(p => ({...p, min_delay_seconds: parseInt(e.target.value)||30}))} className="w-full" buttonClassName="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white mt-1" />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Delay máximo (seg)</label>
                <input type="number" value={waForm.max_delay_seconds} onChange={e => setWaForm(p => ({...p, max_delay_seconds: parseInt(e.target.value)||120}))} className="w-full" buttonClassName="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white mt-1" />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Media URL <span className="text-gray-600 normal-case">(imagen, video, PDF)</span></label>
              <input value={waForm.media_url} onChange={e => setWaForm(p => ({...p, media_url: e.target.value}))} className="w-full" buttonClassName="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white mt-1" placeholder="https://..." />
            </div>

            <div>
              <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Filtrar leads por</label>
              <div className="flex gap-2 mt-1">
                <select value={waForm.lead_filter_estado} onChange={e => setWaForm(p => ({...p, lead_filter_estado: e.target.value}))} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white">
                  <option value="">Todos los estados</option>
                  <option value="nuevo">Nuevo</option>
                  <option value="contactado">Contactado</option>
                  <option value="calificado">Calificado</option>
                  <option value="cliente">Cliente</option>
                </select>
                <SearchableSelect
                  options={(campanas||[]).map((c:any) => ({value:c.id, label:c.nombre}))}
                  value={waForm.lead_filter_campana_id}
                  onChange={v => setWaForm(p => ({...p, lead_filter_campana_id: v}))}
                  placeholder="Por campaña"
                  className="flex-1"
                />
              </div>
            </div>

            {waLoading && <div className="text-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-t-2 border-emerald-500 mx-auto" /></div>}

            <button
              onClick={async () => {
                if (!waForm.nombre || waForm.mensajes.length === 0) { showToast('Nombre y al menos 1 mensaje', 'error'); return }
                setWaLoading(true)
                try {
                  let vars: Record<string, string[]> = {}
                  try { vars = JSON.parse(waForm.variablesTexto) } catch {}
                  const body = {
                    action: 'create',
                    nombre: waForm.nombre,
                    mensajes: waForm.mensajes,
                    variables: vars,
                    media_url: waForm.media_url || null,
                    min_delay_seconds: waForm.min_delay_seconds,
                    max_delay_seconds: waForm.max_delay_seconds,
                    lead_filter: {
                      estado: waForm.lead_filter_estado || undefined,
                      campana_id: waForm.lead_filter_campana_id || undefined,
                    },
                  }
                  const r = await fetch('/api/campanas/whatsapp', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) })
                  const d = await r.json()
                  if (d.success) {
                    showToast('Campaña creada', 'success')
                    setShowWAModal(false)
                    setWaForm({ nombre:'', mensajes:[''], variablesTexto:'{}', media_url:'', filename:'', min_delay_seconds:60, max_delay_seconds:180, lead_filter_estado:'', lead_filter_campana_id:'' })
                    loadWaCampaigns()
                  } else {
                    showToast(d.error || 'Error', 'error')
                  }
                } catch { showToast('Error', 'error') }
                setWaLoading(false)
              }}
              disabled={waLoading}
              className="w-full" buttonClassName="py-3 bg-emerald-600 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-500 transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {waLoading ? 'Creando...' : 'Crear Campaña'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}