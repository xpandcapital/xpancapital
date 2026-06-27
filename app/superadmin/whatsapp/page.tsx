"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { Send, Plus, Trash2, Play, Pause, BarChart3, Clock, Image, MessageSquare, Users, Filter, Phone, X, Check, ChevronDown, ChevronUp } from "lucide-react";

export default function WhatsAppPage() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [nombre, setNombre] = useState("");
  const [mensajes, setMensajes] = useState("");
  const [variablesTexto, setVariablesTexto] = useState("{}");
  const [mediaUrl, setMediaUrl] = useState("");
  const [minDelay, setMinDelay] = useState(60);
  const [maxDelay, setMaxDelay] = useState(180);

  // Contact selection
  const [contactMode, setContactMode] = useState<"leads" | "manual">("leads");
  const [leadEstado, setLeadEstado] = useState("");
  const [leadCampanaId, setLeadCampanaId] = useState("");
  const [manualPhones, setManualPhones] = useState("");
  const [leadCount, setLeadCount] = useState(0);
  const [campanasList, setCampanasList] = useState<any[]>([]);

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

  const countLeads = async () => {
    if (contactMode === "manual") {
      const phones = manualPhones.split(/[\n,]+/).filter(p => p.trim());
      setLeadCount(phones.length);
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

  useEffect(() => { countLeads(); }, [contactMode, leadEstado, leadCampanaId, manualPhones]);

  const handleCreate = async () => {
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
      } else {
        filter.manual_phones = manualPhones.split(/[\n,]+/).map(p => p.trim()).filter(Boolean);
      }

      const r = await fetch("/api/campanas/whatsapp", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          nombre, mensajes: msgList, variables: vars,
          media_url: mediaUrl || null,
          min_delay_seconds: minDelay, max_delay_seconds: maxDelay,
          lead_filter: filter,
        }),
      });
      const d = await r.json();
      if (d.success) {
        showToast("Campaña creada", "success");
        setShowForm(false);
        setNombre(""); setMensajes(""); setVariablesTexto("{}");
        setMediaUrl(""); setMinDelay(60); setMaxDelay(180);
        setManualPhones(""); setLeadEstado(""); setLeadCampanaId("");
        loadCampaigns();
      } else { showToast(d.error || "Error", "error"); }
    } catch { showToast("Error", "error"); }
    setSaving(false);
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

  const statusColor = (s: string) => {
    const map: Record<string, string> = { sending: "text-emerald-400 bg-emerald-400/10", completed: "text-blue-400 bg-blue-400/10", scheduled: "text-amber-400 bg-amber-400/10", paused: "text-yellow-400 bg-yellow-400/10" };
    return map[s] || "text-gray-400 bg-gray-400/10";
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-emerald-400" /> WhatsApp Marketing
            </h1>
            <p className="text-gray-500 text-xs mt-1">Campañas masivas con variables aleatorias, multimedia y delays humanos</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-5 py-3 bg-emerald-600 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-emerald-500 transition-colors"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? "Cerrar" : "Nueva Campaña"}
          </button>
        </div>

        {/* Campaign Form */}
        {showForm && (
          <div className="bg-zinc-900/50 border border-emerald-500/20 rounded-2xl p-6 space-y-5">
            <h3 className="text-white font-bold text-sm flex items-center gap-2"><Plus className="w-4 h-4 text-emerald-400" /> Nueva Campaña WhatsApp</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Nombre *</label>
                <input value={nombre} onChange={e => setNombre(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white mt-1" placeholder="Remarketing Julio 2026" />
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Media</label>
                  <input value={mediaUrl} onChange={e => setMediaUrl(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white mt-1" placeholder="URL de imagen/video/PDF" />
                </div>
                <Image className="w-5 h-5 text-gray-500 mb-2" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button onClick={() => setContactMode("leads")} className={`p-3 rounded-xl border text-left transition-all ${contactMode === "leads" ? "bg-emerald-500/10 border-emerald-500/30" : "bg-white/[0.02] border-white/5 hover:border-white/10"}`}>
                <Users className="w-4 h-4 text-emerald-400 mb-1" />
                <p className="text-xs font-bold text-white">Leads existentes</p>
                <p className="text-[9px] text-gray-500">Filtrar por estado o campaña</p>
              </button>
              <button onClick={() => setContactMode("manual")} className={`p-3 rounded-xl border text-left transition-all ${contactMode === "manual" ? "bg-emerald-500/10 border-emerald-500/30" : "bg-white/[0.02] border-white/5 hover:border-white/10"}`}>
                <Phone className="w-4 h-4 text-emerald-400 mb-1" />
                <p className="text-xs font-bold text-white">Manual</p>
                <p className="text-[9px] text-gray-500">Pega números de teléfono</p>
              </button>
              <div className="flex items-center justify-center p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <div className="text-center">
                  <p className="text-2xl font-black text-emerald-400">{leadCount}</p>
                  <p className="text-[9px] text-gray-500">{contactMode === "leads" ? "leads" : "números"}</p>
                </div>
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
                  <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Campaña</label>
                  <SearchableSelect options={campanasList.map((c: any) => ({ value: c.id, label: c.nombre }))} value={leadCampanaId} onChange={setLeadCampanaId} placeholder="Todas" searchPlaceholder="Buscar campaña..." />
                </div>
              </div>
            )}

            {contactMode === "manual" && (
              <div>
                <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Números <span className="text-gray-600 normal-case">(1 por línea o separados por comas)</span></label>
                <textarea value={manualPhones} onChange={e => setManualPhones(e.target.value)} rows={3} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white mt-1 resize-none" placeholder="+51999999999&#10;+593939011068&#10;+573001234567" />
              </div>
            )}

            <div>
              <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Variantes de mensaje * <span className="text-gray-600 normal-case">(1 por línea, se elige aleatoriamente)</span></label>
              <textarea value={mensajes} onChange={e => setMensajes(e.target.value)} rows={3} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white mt-1 resize-none" placeholder={`{saludo} oferta inmobiliaria 🏠\n{cierre} ¿te interesa?`} />
            </div>

            <div>
              <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Variables <span className="text-gray-600 normal-case">(JSON {'{variable: ["opcion1","opcion2"]}'})</span></label>
              <textarea value={variablesTexto} onChange={e => setVariablesTexto(e.target.value)} rows={2} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white mt-1 resize-none font-mono" placeholder='{"saludo": ["Hola 👋","Hey 😊"], "cierre": ["Avísame 👍","OK 📩"]}' />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Delay min (seg)</label><input type="number" value={minDelay} onChange={e => setMinDelay(parseInt(e.target.value) || 30)} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white mt-1" /></div>
              <div><label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Delay max (seg)</label><input type="number" value={maxDelay} onChange={e => setMaxDelay(parseInt(e.target.value) || 120)} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white mt-1" /></div>
            </div>

            <button onClick={handleCreate} disabled={saving} className="w-full py-3 bg-emerald-600 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-500 transition-colors disabled:opacity-50">
              <Send className="w-4 h-4" /> {saving ? "Creando..." : `Crear Campaña (${leadCount} destinatarios)`}
            </button>
          </div>
        )}

        {/* Campaigns List */}
        {loading ? (
          <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-white/[0.02] rounded-xl animate-pulse" />)}</div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900/20 border border-white/5 rounded-2xl">
            <Send className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Sin campañas de WhatsApp</p>
            <p className="text-gray-700 text-xs mt-1">Crea una nueva campaña para empezar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {campaigns.map((wc: any) => (
              <div key={wc.id} className="bg-zinc-900/30 border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${wc.status === "sending" ? "bg-emerald-500 animate-pulse" : wc.status === "completed" ? "bg-blue-500" : wc.status === "scheduled" ? "bg-amber-500" : wc.status === "paused" ? "bg-yellow-500" : "bg-gray-600"}`} />
                      <h3 className="text-white font-bold truncate">{wc.nombre}</h3>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${statusColor(wc.status)}`}>{wc.status}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" /> {wc.sent_count}/{wc.total_recipients} enviados</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {wc.min_delay_seconds}s-{wc.max_delay_seconds}s</span>
                      {wc.scheduled_for && <span><Clock className="w-3 h-3 inline" /> {new Date(wc.scheduled_for).toLocaleString("es-MX")}</span>}
                      {wc.media_url && <span className="flex items-center gap-1"><Image className="w-3 h-3" /> Media</span>}
                    </div>

                    {/* Progress bar */}
                    {wc.total_recipients > 0 && (
                      <div className="mt-3 w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${wc.total_recipients > 0 ? (wc.sent_count / wc.total_recipients) * 100 : 0}%` }} />
                      </div>
                    )}

                    {/* Message preview */}
                    <div className="mt-2 text-[10px] text-gray-600 truncate">
                      {(wc.mensajes || [wc.mensaje]).slice(0, 2).map((m: string, i: number) => (
                        <span key={i} className="block truncate">{m}</span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-1.5 shrink-0">
                    {(wc.status === "draft") && (
                      <button onClick={() => handleAction(wc.id, "start")} className="px-3 py-2 bg-emerald-600 rounded-lg text-white text-[10px] font-bold flex items-center gap-1 hover:bg-emerald-500">
                        <Play className="w-3 h-3" /> Iniciar
                      </button>
                    )}
                    {wc.status === "sending" && (
                      <button onClick={() => handleAction(wc.id, "pause")} className="px-3 py-2 bg-amber-600 rounded-lg text-white text-[10px] font-bold flex items-center gap-1 hover:bg-amber-500">
                        <Pause className="w-3 h-3" /> Pausar
                      </button>
                    )}
                    <button onClick={() => { if (confirm("¿Eliminar campaña?")) handleAction(wc.id, "delete"); }} className="px-3 py-2 bg-red-500/10 rounded-lg text-red-400 text-[10px] font-bold hover:bg-red-500/20">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
