"use client";

import { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { getSupabase } from "@/lib/supabase";
import { Send, Plus, Trash2, Play, Pause, BarChart3, Clock, Image, MessageSquare, Users, Phone, X, Upload, FileText, ShoppingBag, Briefcase, Edit2, Eye, ChevronDown, ChevronUp } from "lucide-react";

const STORAGE_BUCKET = "whatsapp-media";

export default function WhatsAppPage() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const csvRef = useRef<HTMLInputElement>(null);

  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Form
  const [nombre, setNombre] = useState("");
  const [mensajes, setMensajes] = useState("");
  const [variablesTexto, setVariablesTexto] = useState("{}");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaFileName, setMediaFileName] = useState("");
  const [minDelay, setMinDelay] = useState(60);
  const [maxDelay, setMaxDelay] = useState(180);

  // Contact
  const [contactMode, setContactMode] = useState<"leads" | "manual" | "csv" | "clientes" | "empleados">("leads");
  const [leadEstado, setLeadEstado] = useState("");
  const [leadCampanaId, setLeadCampanaId] = useState("");
  const [manualPhones, setManualPhones] = useState("");
  const [csvPhones, setCsvPhones] = useState<string[]>([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [leadCount, setLeadCount] = useState(0);
  const [campanasList, setCampanasList] = useState<any[]>([]);
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);
  const [campaignDetail, setCampaignDetail] = useState<any>(null);

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/campanas/whatsapp");
      const d = await r.json();
      if (d.success) setCampaigns(d.data || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadCampaigns(); }, []);
  useEffect(() => {
    fetch("/api/campanas").then(r => r.json()).then(d => {
      if (d.success) setCampanasList(d.data || []);
    });
  }, []);

  // Upload file to Supabase Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const supabase = getSupabase();
      if (!supabase) { showToast("Error de conexión", "error"); return; }
      const path = `${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file);
      if (error) { showToast("Error al subir archivo", "error"); return; }
      const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
      setMediaUrl(urlData.publicUrl);
      setMediaFileName(file.name);
      showToast("Archivo subido", "success");
    } catch { showToast("Error al subir", "error"); }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  // CSV Import
  const handleCsvImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setCsvFileName(file.name);
    // Buscar columna de teléfono
    const lines = text.split("\n").filter(l => l.trim());
    const header = lines[0].split(/[;,]/).map(h => h.trim().toLowerCase());
    const phoneCol = header.findIndex(h => h.includes("telefono") || h.includes("phone") || h.includes("celular") || h.includes("whatsapp") || h.includes("cel") || h.includes("tel") || h.includes("movil"));
    const phones: string[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(/[;,]/);
      const p = phoneCol >= 0 ? cols[phoneCol]?.trim() : cols[0]?.trim(); // fallback: primera columna
      if (p && /[\d]{7,}/.test(p.replace(/\D/g, ""))) {
        phones.push(p.replace(/\D/g, ""));
      }
    }
    setCsvPhones(phones);
    setLeadCount(phones.length);
    showToast(`${phones.length} contactos importados`, "success");
    if (csvRef.current) csvRef.current.value = "";
  };

  const countLeads = async () => {
    if (contactMode === "manual") {
      const phones = manualPhones.split(/[\n,]+/).filter(p => p.trim());
      setLeadCount(phones.length);
      return;
    }
    if (contactMode === "csv") {
      setLeadCount(csvPhones.length);
      return;
    }
    if (contactMode === "clientes") {
      // Approximate count
      setLeadCount(leadEstado ? 50 : 200);
      return;
    }
    if (contactMode === "empleados") {
      setLeadCount(leadEstado ? 10 : 50);
      return;
    }
    try {
      const params = new URLSearchParams();
      if (leadEstado) params.set("estado", leadEstado);
      if (leadCampanaId) params.set("campana_id", leadCampanaId);
      const r = await fetch(`/api/leads?${params}&limit=1`);
      const d = await r.json();
      setLeadCount(d.total || d.data?.length || 0);
    } catch { setLeadCount(0); }
  };

  useEffect(() => { countLeads(); }, [contactMode, leadEstado, leadCampanaId, manualPhones, csvPhones]);

  const resetForm = () => {
    setNombre(""); setMensajes(""); setVariablesTexto("{}"); setMediaUrl(""); setMediaFileName("");
    setMinDelay(60); setMaxDelay(180); setManualPhones(""); setLeadEstado(""); setLeadCampanaId("");
    setCsvPhones([]); setCsvFileName(""); setEditingId(null); setLeadCount(0);
  };

  const handleCreate = async (startNow = false) => {
    if (!nombre || !mensajes.trim()) { showToast("Nombre y mensajes requeridos", "error"); return; }
    setSaving(true);
    try {
      let vars: Record<string, string[]> = {};
      try { vars = JSON.parse(variablesTexto); } catch {}
      const msgList = mensajes.split("\n").filter(l => l.trim());
      const filter: any = {};

      if (contactMode === "leads") {
        if (leadEstado) filter.estado = leadEstado;
        if (leadCampanaId) filter.campana_id = leadCampanaId;
      } else if (contactMode === "clientes") {
        filter.source = "clientes";
        if (leadEstado) filter.producto_categoria = leadEstado;
      } else if (contactMode === "empleados") {
        filter.source = "empleados";
        if (leadEstado) filter.rol = leadEstado;
      } else if (contactMode === "csv") {
        filter.manual_phones = csvPhones;
      } else {
        filter.manual_phones = manualPhones.split(/[\n,]+/).map(p => p.trim()).filter(Boolean);
      }

      const action = editingId ? "update" : "create";
      const body: any = {
        action,
        nombre, mensajes: msgList, variables: vars,
        media_url: mediaUrl || null,
        filename: mediaFileName || undefined,
        min_delay_seconds: minDelay, max_delay_seconds: maxDelay,
        lead_filter: filter,
      };
      if (editingId) body.id = editingId;

      const r = await fetch("/api/campanas/whatsapp", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (d.success) {
        showToast(editingId ? "Campaña actualizada" : "Campaña creada", "success");
        if (startNow && d.data?.id) {
          await fetch("/api/campanas/whatsapp", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "start", id: d.data.id }),
          });
          showToast("Envío iniciado", "success");
        }
        setShowForm(false);
        resetForm();
        loadCampaigns();
      } else { showToast(d.error || "Error", "error"); }
    } catch { showToast("Error", "error"); }
    setSaving(false);
  };

  const handleEdit = (wc: any) => {
    setEditingId(wc.id);
    setNombre(wc.nombre || "");
    setMensajes((wc.mensajes || [wc.mensaje]).join("\n"));
    setVariablesTexto(JSON.stringify(wc.variables || {}, null, 0));
    setMediaUrl(wc.media_url || "");
    setMediaFileName(wc.filename || "");
    setMinDelay(wc.min_delay_seconds || 60);
    setMaxDelay(wc.max_delay_seconds || 180);
    setContactMode("leads");
    setLeadEstado(wc.lead_filter?.estado || "");
    setLeadCampanaId(wc.lead_filter?.campana_id || "");
    setLeadCount(wc.total_recipients || 0);
    setShowForm(true);
  };

  const handleAction = async (id: string, action: string) => {
    try {
      await fetch("/api/campanas/whatsapp", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, id }),
      });
      showToast(action === "delete" ? "Eliminada" : action === "start" ? "Envío iniciado" : "Pausada", "success");
      loadCampaigns();
    } catch { showToast("Error", "error"); }
  };

  const handleViewDetail = async (id: string) => {
    if (expandedCampaign === id) { setExpandedCampaign(null); setCampaignDetail(null); return; }
    setExpandedCampaign(id);
    const r = await fetch(`/api/campanas/whatsapp?id=${id}`);
    const d = await r.json();
    if (d.success) setCampaignDetail(d.data);
  };

  const statusColor = (s: string) => {
    const map: Record<string, string> = { sending: "text-emerald-400 bg-emerald-400/10", completed: "text-blue-400 bg-blue-400/10", scheduled: "text-amber-400 bg-amber-400/10", paused: "text-yellow-400 bg-yellow-400/10" };
    return map[s] || "text-gray-400 bg-gray-400/10";
  };

  const contactTabs = [
    { id: "leads" as const, icon: Users, label: "Leads", desc: "Filtrar por estado o campaña" },
    { id: "manual" as const, icon: Phone, label: "Manual", desc: "Pega números de teléfono" },
    { id: "csv" as const, icon: FileText, label: "CSV", desc: "Importar desde archivo" },
    { id: "clientes" as const, icon: ShoppingBag, label: "Clientes", desc: "Por producto comprado" },
    { id: "empleados" as const, icon: Briefcase, label: "Empleados", desc: "Por rol o categoría" },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2"><MessageSquare className="w-6 h-6 text-emerald-400" /> WhatsApp Marketing</h1>
            <p className="text-gray-500 text-xs mt-1">Campañas masivas · Variables aleatorias · Multimedia · Delays humanos</p>
          </div>
          <button onClick={() => { resetForm(); setShowForm(!showForm); }} className={`px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors ${showForm ? "bg-white/10 hover:bg-white/20" : "bg-emerald-600 hover:bg-emerald-500"}`}>
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? "Cerrar" : "Nueva Campaña"}
          </button>
        </div>

        {/* Campaign Form */}
        {showForm && (
          <div className="bg-zinc-900/50 border border-emerald-500/20 rounded-2xl p-6 space-y-5">
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              {editingId ? <Edit2 className="w-4 h-4 text-amber-400" /> : <Plus className="w-4 h-4 text-emerald-400" />}
              {editingId ? "Editar Campaña" : "Nueva Campaña WhatsApp"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Nombre *</label>
                <input value={nombre} onChange={e => setNombre(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white mt-1" placeholder="Remarketing Julio 2026" />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Imagen (opcional)</label>
                <div className="flex gap-2 mt-1">
                  <input ref={fileRef} type="file" accept="image/*,video/*,.pdf" onChange={handleFileUpload} className="hidden" />
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="flex-1 flex items-center gap-2 bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50">
                    <Upload className="w-4 h-4 shrink-0" />
                    <span className="truncate">{uploading ? "Subiendo..." : mediaFileName || "Seleccionar archivo"}</span>
                  </button>
                  {mediaUrl && (
                    <button onClick={() => { setMediaUrl(""); setMediaFileName(""); }} className="px-2 py-2.5 bg-red-500/10 rounded-lg text-red-400 hover:bg-red-500/20">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Tabs */}
            <div>
              <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2 block">Destinatarios</label>
              <div className="grid grid-cols-5 gap-1.5">
                {contactTabs.map(tab => (
                  <button key={tab.id} onClick={() => setContactMode(tab.id)}
                    className={`p-2 rounded-lg border text-center transition-all ${contactMode === tab.id ? "bg-emerald-500/10 border-emerald-500/30" : "bg-white/[0.02] border-white/5 hover:border-white/10"}`}>
                    <tab.icon className={`w-4 h-4 mx-auto mb-0.5 ${contactMode === tab.id ? "text-emerald-400" : "text-gray-500"}`} />
                    <p className="text-[9px] font-bold text-white">{tab.label}</p>
                  </button>
                ))}
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-[10px] text-gray-600">{contactTabs.find(t => t.id === contactMode)?.desc}</p>
                <span className="text-lg font-black text-emerald-400">{leadCount} <span className="text-[9px] text-gray-500 font-normal">destinatarios</span></span>
              </div>
            </div>

            {contactMode === "leads" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Estado</label>
                  <select value={leadEstado} onChange={e => setLeadEstado(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white mt-1">
                    <option value="">Todos</option>
                    <option value="nuevo">Nuevo</option>
                    <option value="contactado">Contactado</option>
                    <option value="calificado">Calificado</option>
                    <option value="cliente">Cliente</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Campaña origen</label>
                  <SearchableSelect options={campanasList.map((c: any) => ({ value: c.id, label: c.nombre }))} value={leadCampanaId} onChange={setLeadCampanaId} placeholder="Todas" searchPlaceholder="Buscar..." />
                </div>
              </div>
            )}

            {contactMode === "manual" && (
              <div>
                <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Números <span className="text-gray-600 normal-case">(1 por línea o separados por comas)</span></label>
                <textarea value={manualPhones} onChange={e => setManualPhones(e.target.value)} rows={3} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white mt-1 resize-none" placeholder="+51999999999&#10;+593939011068" />
              </div>
            )}

            {contactMode === "csv" && (
              <div>
                <input ref={csvRef} type="file" accept=".csv" onChange={handleCsvImport} className="hidden" />
                <button type="button" onClick={() => csvRef.current?.click()} className="w-full flex items-center gap-3 p-4 bg-black/50 border border-dashed border-white/10 rounded-lg hover:border-emerald-500/30 transition-colors">
                  <Upload className="w-5 h-5 text-gray-500" />
                  <div className="text-left">
                    <p className="text-sm text-white">{csvFileName || "Importar CSV"}</p>
                    <p className="text-[10px] text-gray-500">El archivo debe tener una columna de teléfono/phone/celular</p>
                  </div>
                </button>
                {csvPhones.length > 0 && (
                  <div className="mt-2 flex gap-2">
                    <span className="text-[10px] text-emerald-400">{csvPhones.length} teléfonos importados</span>
                    <button onClick={() => { setCsvPhones([]); setCsvFileName(""); }} className="text-[10px] text-red-400 hover:text-red-300">Limpiar</button>
                  </div>
                )}
              </div>
            )}

            {contactMode === "clientes" && (
              <div>
                <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Filtrar por</label>
                <select value={leadEstado} onChange={e => setLeadEstado(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white mt-1">
                  <option value="">Todos los clientes</option>
                  <option value="Cursos">Compraron Cursos</option>
                  <option value="Ebooks">Compraron Ebooks</option>
                  <option value="Kits">Compraron Kits</option>
                  <option value="Mentoring">Compraron Mentoring</option>
                </select>
              </div>
            )}

            {contactMode === "empleados" && (
              <div>
                <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Filtrar por rol</label>
                <select value={leadEstado} onChange={e => setLeadEstado(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white mt-1">
                  <option value="">Todos los empleados</option>
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="empleado">Empleado</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>
            )}

            <div>
              <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Variantes de mensaje * <span className="text-gray-600 normal-case">(1 por línea, aleatorio)</span></label>
              <textarea value={mensajes} onChange={e => setMensajes(e.target.value)} rows={3} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white mt-1 resize-none" placeholder={`{saludo} oferta inmobiliaria 🏠\n{cierre} ¿te interesa?`} />
            </div>

            <div>
              <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Variables <span className="text-gray-600 normal-case">(JSON)</span></label>
              <textarea value={variablesTexto} onChange={e => setVariablesTexto(e.target.value)} rows={2} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white mt-1 resize-none font-mono" placeholder='{"saludo": ["Hola 👋","Hey 😊"]}' />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Delay min (seg)</label><input type="number" value={minDelay} onChange={e => setMinDelay(parseInt(e.target.value) || 30)} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white mt-1" /></div>
              <div><label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Delay max (seg)</label><input type="number" value={maxDelay} onChange={e => setMaxDelay(parseInt(e.target.value) || 120)} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white mt-1" /></div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => handleCreate(false)} disabled={saving} className="flex-1 py-3 bg-white/10 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/20 transition-colors disabled:opacity-50">
                <Eye className="w-4 h-4" /> {saving ? "..." : editingId ? "Actualizar Borrador" : "Guardar Borrador"}
              </button>
              <button onClick={() => handleCreate(true)} disabled={saving} className="flex-[2] py-3 bg-emerald-600 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-500 transition-colors disabled:opacity-50">
                <Send className="w-4 h-4" /> {saving ? "..." : `Crear y Enviar (${leadCount})`}
              </button>
            </div>
          </div>
        )}

        {/* Campaign History */}
        {loading ? (
          <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-white/[0.02] rounded-xl animate-pulse" />)}</div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900/20 border border-white/5 rounded-2xl">
            <Send className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Sin campañas de WhatsApp</p>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-black flex items-center gap-2"><Clock className="w-5 h-5 text-gray-500" /> Historial de Campañas</h2>
            <div className="space-y-3">
              {campaigns.map((wc: any) => (
                <div key={wc.id} className="bg-zinc-900/30 border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-colors">
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${wc.status === "sending" ? "bg-emerald-500 animate-pulse" : wc.status === "completed" ? "bg-blue-500" : wc.status === "scheduled" ? "bg-amber-500" : wc.status === "paused" ? "bg-yellow-500" : "bg-gray-600"}`} />
                          <h3 className="text-white font-bold truncate">{wc.nombre}</h3>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${statusColor(wc.status)}`}>{wc.status}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500">
                          <span><BarChart3 className="w-3 h-3 inline mr-1" />{wc.sent_count}/{wc.total_recipients} enviados</span>
                          <span><Clock className="w-3 h-3 inline mr-1" />{wc.min_delay_seconds}s-{wc.max_delay_seconds}s</span>
                          {wc.media_url && <span><Image className="w-3 h-3 inline mr-1" />Media</span>}
                          <span className="text-gray-600">{new Date(wc.creado_en).toLocaleDateString("es-MX")}</span>
                        </div>
                        {wc.total_recipients > 0 && (
                          <div className="mt-3 w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${(wc.sent_count / wc.total_recipients) * 100}%` }} />
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        {wc.status === "draft" && (
                          <>
                            <button onClick={() => handleEdit(wc)} className="px-2.5 py-2 bg-white/10 rounded-lg text-gray-400 text-[10px] font-bold hover:text-white"><Edit2 className="w-3 h-3" /></button>
                            <button onClick={() => handleAction(wc.id, "start")} className="px-3 py-2 bg-emerald-600 rounded-lg text-white text-[10px] font-bold flex items-center gap-1 hover:bg-emerald-500"><Play className="w-3 h-3" /> Iniciar</button>
                          </>
                        )}
                        {wc.status === "sending" && (
                          <button onClick={() => handleAction(wc.id, "pause")} className="px-3 py-2 bg-amber-600 rounded-lg text-white text-[10px] font-bold flex items-center gap-1 hover:bg-amber-500"><Pause className="w-3 h-3" /> Pausar</button>
                        )}
                        <button onClick={() => handleViewDetail(wc.id)} className="px-2.5 py-2 bg-white/10 rounded-lg text-gray-400 text-[10px] font-bold hover:text-white">
                          {expandedCampaign === wc.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                        <button onClick={() => { if (confirm("¿Eliminar?")) handleAction(wc.id, "delete"); }} className="px-2.5 py-2 bg-red-500/10 rounded-lg text-red-400 text-[10px] font-bold hover:bg-red-500/20"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {expandedCampaign === wc.id && campaignDetail && (
                    <div className="border-t border-white/5 px-5 py-4 bg-black/20 space-y-3">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-white/[0.02] rounded-lg p-3"><p className="text-2xl font-black text-emerald-400">{campaignDetail.sent_count || 0}</p><p className="text-[9px] text-gray-500">Enviados</p></div>
                        <div className="bg-white/[0.02] rounded-lg p-3"><p className="text-2xl font-black text-blue-400">{campaignDetail.delivered_count || 0}</p><p className="text-[9px] text-gray-500">Entregados</p></div>
                        <div className="bg-white/[0.02] rounded-lg p-3"><p className="text-2xl font-black text-purple-400">{campaignDetail.read_count || 0}</p><p className="text-[9px] text-gray-500">Leídos</p></div>
                      </div>
                      {(campaignDetail.mensajes || []).length > 0 && (
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Mensajes</p>
                          {(campaignDetail.mensajes || [campaignDetail.mensaje]).filter(Boolean).slice(0, 3).map((m: string, i: number) => (
                            <p key={i} className="text-xs text-gray-400 truncate">• {m}</p>
                          ))}
                        </div>
                      )}
                      {campaignDetail.media_url && (
                        <div className="flex items-center gap-2">
                          <Image className="w-4 h-4 text-gray-500" />
                          <a href={campaignDetail.media_url} target="_blank" rel="noopener" className="text-xs text-emerald-400 hover:underline truncate">{campaignDetail.filename || campaignDetail.media_url}</a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
