"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "@/components/ui/Toast";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { getSupabase } from "@/lib/supabase";
import { Send, Plus, Trash2, Play, Pause, Copy, BarChart3, Clock, Image, MessageSquare, Users, Phone, X, Upload, FileText, ShoppingBag, Briefcase, Edit2, Eye, ChevronDown, ChevronUp, Search, Check, Loader2, Clipboard } from "lucide-react";

const STORAGE_BUCKET = "whatsapp-media";

export default function WhatsAppPage() {
  const { showToast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const csvRef = useRef<HTMLInputElement>(null);
  const groupFileRefs = useRef<(HTMLInputElement | null)[]>([]);
  const activeTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [messageGroups, setMessageGroups] = useState<any[]>([{ texts: "", media_url: "", filename: "" }]);
  const [vars, setVars] = useState<{ name: string; options: string }[]>([]);
  const [minDelay, setMinDelay] = useState(60);
  const [maxDelay, setMaxDelay] = useState(180);
  const [delayBetweenMessages, setDelayBetweenMessages] = useState(30);

  const [contactMode, setContactMode] = useState<"leads" | "manual" | "csv" | "clientes" | "empleados" | "phone_list">("leads");
  const [leadEstado, setLeadEstado] = useState("");
  const [leadCampanaId, setLeadCampanaId] = useState("");
  const [manualPhones, setManualPhones] = useState("");
  const [csvPhones, setCsvPhones] = useState<string[]>([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [leadCount, setLeadCount] = useState(0);
  const [campanasList, setCampanasList] = useState<any[]>([]);
  const [productosList, setProductosList] = useState<any[]>([]);

  const [selectedProductId, setSelectedProductId] = useState("");
  const [buyers, setBuyers] = useState<any[]>([]);
  const [selectedBuyerIds, setSelectedBuyerIds] = useState<string[]>([]);
  const [buyerSearch, setBuyerSearch] = useState("");
  const [selectedRol, setSelectedRol] = useState("");
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [phoneLists, setPhoneLists] = useState<any[]>([]);
  const [selectedPhoneListId, setSelectedPhoneListId] = useState("");

  // Templates
  const [varTemplates, setVarTemplates] = useState<any[]>([]);
  const [msgTemplates, setMsgTemplates] = useState<any[]>([]);

  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);
  const [campaignDetail, setCampaignDetail] = useState<any>(null);
  const [campaignRecipients, setCampaignRecipients] = useState<any[]>([]);
  const [recipientsPolling, setRecipientsPolling] = useState(false);
  const [sendingIds, setSendingIds] = useState<Set<string>>(new Set());
  const [sendingProgress, setSendingProgress] = useState<Record<string, string>>({});

  // Load data
  const loadCampaigns = async () => {
    setLoading(true); try { const r = await fetch("/api/campanas/whatsapp"); const d = await r.json(); if (d.success) setCampaigns(d.data || []); } catch {} setLoading(false);
  };
  useEffect(() => { loadCampaigns(); }, []);
  useEffect(() => { fetch("/api/campanas").then(r => r.json()).then(d => { if (d.success) setCampanasList(d.data || []); }); }, []);
  useEffect(() => { fetch("/api/productos?all=true&limit=500").then(r => r.json()).then(d => { if (d.success) setProductosList(d.data || d.productos || []); }); }, []);
  useEffect(() => { fetch("/api/campanas/whatsapp?action=variable_templates").then(r => r.json()).then(d => setVarTemplates(d.templates || [])); }, []);
  useEffect(() => { fetch("/api/campanas/whatsapp?action=message_templates").then(r => r.json()).then(d => setMsgTemplates(d.templates || [])); }, []);
  useEffect(() => { fetch("/api/campanas/whatsapp?action=phone_lists").then(r => r.json()).then(d => setPhoneLists(d.lists || [])); }, []);

  // Cascade loaders
  useEffect(() => {
    if (contactMode !== "clientes" || !selectedProductId) { setBuyers([]); return; }
    fetch(`/api/campanas/whatsapp?action=buyers&producto_id=${selectedProductId}`).then(r => r.json()).then(d => { if (d.success) { setBuyers(d.buyers || []); setSelectedBuyerIds([]); } });
  }, [selectedProductId, contactMode]);
  useEffect(() => {
    if (contactMode !== "empleados" || !selectedRol) { setEmployees([]); return; }
    fetch(`/api/campanas/whatsapp?action=employees&rol=${selectedRol}`).then(r => r.json()).then(d => { if (d.success) { setEmployees(d.employees || []); setSelectedEmployeeIds([]); } });
  }, [selectedRol, contactMode]);

  // Polling de recipients para live tracking
  useEffect(() => {
    if (!recipientsPolling || !expandedCampaign) return;
    const interval = setInterval(async () => {
      const r = await fetch(`/api/campanas/whatsapp?id=${expandedCampaign}&recipients=true`);
      const d = await r.json();
      if (d.success) setCampaignRecipients(d.recipients || []);
      // Stop polling if campaign is done
      const c = campaigns.find(c => c.id === expandedCampaign);
      if (c && (c.status === 'completed' || c.status === 'failed')) { setRecipientsPolling(false); clearInterval(interval); }
    }, 30000);
    return () => clearInterval(interval);
  }, [recipientsPolling, expandedCampaign, campaigns]);

  // File upload
  const handleGroupFile = async (gIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try {
      const supabase = getSupabase(); if (!supabase) return;
      const path = `${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file);
      if (error) { showToast("Error al subir", "error"); return; }
      const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
      setMessageGroups(prev => prev.map((g, i) => i === gIdx ? { ...g, media_url: urlData.publicUrl, filename: file.name } : g));
      showToast("Archivo subido", "success");
    } catch { showToast("Error", "error"); }
    setUploading(false);
  };
  const removeGroupFile = (gIdx: number) => setMessageGroups(prev => prev.map((g, i) => i === gIdx ? { ...g, media_url: "", filename: "" } : g));

  // CSV
  const handleCsvImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const text = await file.text(); setCsvFileName(file.name);
    const lines = text.split("\n").filter(l => l.trim());
    const header = lines[0].split(/[;,]/).map(h => h.trim().toLowerCase());
    const phoneCol = header.findIndex(h => /telefono|phone|celular|whatsapp|cel|tel|movil/.test(h));
    const phones: string[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(/[;,]/); const p = phoneCol >= 0 ? cols[phoneCol]?.trim() : cols[0]?.trim();
      if (p && /[\d]{7,}/.test(p.replace(/\D/g, ""))) phones.push(p.replace(/\D/g, ""));
    }
    setCsvPhones(phones); showToast(`${phones.length} importados`, "success");
    if (csvRef.current) csvRef.current.value = "";
  };

  const countLeads = useCallback(async () => {
    if (contactMode === "manual") { setLeadCount(manualPhones.split(/[\n,]+/).filter(p => p.trim()).length); return; }
    if (contactMode === "csv") { setLeadCount(csvPhones.length); return; }
    if (contactMode === "clientes") { setLeadCount(selectedBuyerIds.length || buyers.length); return; }
    if (contactMode === "empleados") { setLeadCount(selectedEmployeeIds.length || employees.length); return; }
    if (contactMode === "phone_list" && selectedPhoneListId) {
      const list = phoneLists.find(l => l.id === selectedPhoneListId);
      setLeadCount(list?.phones?.length || 0); return;
    }
    try {
      const params = new URLSearchParams(); if (leadEstado) params.set("estado", leadEstado); if (leadCampanaId) params.set("campana_id", leadCampanaId);
      const r = await fetch(`/api/leads?${params}&limit=1`); const d = await r.json();
      setLeadCount(d.total || d.data?.length || 0);
    } catch { setLeadCount(0); }
  }, [contactMode, leadEstado, leadCampanaId, manualPhones, csvPhones, selectedBuyerIds, buyers, selectedEmployeeIds, employees, selectedPhoneListId, phoneLists]);
  useEffect(() => { countLeads(); }, [countLeads]);

  // Click-to-insert variable
  const insertVariable = (name: string) => {
    const ta = activeTextareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart || 0; const end = ta.selectionEnd || 0;
    const text = ta.value; const before = text.substring(0, start); const after = text.substring(end);
    const newText = `${before}{${name}}${after}`;
    // Find which group textarea this is
    const gIdx = parseInt(ta.dataset.groupIdx || "0");
    setMessageGroups(prev => prev.map((g, i) => i === gIdx ? { ...g, texts: newText } : g));
    setTimeout(() => { ta.focus(); ta.selectionStart = start + name.length + 2; ta.selectionEnd = start + name.length + 2; }, 0);
  };

  const resetForm = () => {
    setNombre(""); setCategoria(""); setMessageGroups([{ texts: "", media_url: "", filename: "" }]); setVars([]);
    setMinDelay(60); setMaxDelay(180); setDelayBetweenMessages(30);
    setManualPhones(""); setLeadEstado(""); setLeadCampanaId("");
    setCsvPhones([]); setCsvFileName(""); setEditingId(null); setLeadCount(0);
    setSelectedProductId(""); setBuyers([]); setSelectedBuyerIds([]);
    setSelectedRol(""); setEmployees([]); setSelectedEmployeeIds([]);
    setSelectedPhoneListId("");
  };

  const cleanGroup = (g: any) => ({ texts: (g.texts || "").split("\n").map((l: string) => l.trim()).filter(Boolean), media_url: g.media_url || null, filename: g.filename || null });

  const handleCreate = async (startNow = false) => {
    if (!nombre) { showToast("Nombre requerido", "error"); return; }
    const groups = messageGroups.map(cleanGroup);
    if (groups.every((g: any) => g.texts.length === 0)) { showToast("Al menos un mensaje requerido", "error"); return; }
    setSaving(true);
    try {
      const varsObj: Record<string, string[]> = {};
      for (const v of vars) { if (v.name && v.options.trim()) varsObj[v.name] = v.options.split("\n").map(o => o.trim()).filter(o => o); }
      const filter: any = { source: contactMode };
      if (contactMode === "leads") { if (leadEstado) filter.estado = leadEstado; if (leadCampanaId) filter.campana_id = leadCampanaId; }
      else if (contactMode === "clientes") { if (selectedProductId) filter.producto_id = selectedProductId; if (selectedBuyerIds.length > 0) filter.selected_ids = selectedBuyerIds; }
      else if (contactMode === "empleados") { if (selectedRol) filter.rol = selectedRol; if (selectedEmployeeIds.length > 0) filter.selected_ids = selectedEmployeeIds; }
      else if (contactMode === "csv") filter.csv_phones = csvPhones;
      else if (contactMode === "phone_list" && selectedPhoneListId) {
        const list = phoneLists.find(l => l.id === selectedPhoneListId);
        filter.phone_list = true; filter.phones = list?.phones || [];
      }
      else filter.manual_phones = manualPhones.split(/[\n,]+/).map(p => p.trim()).filter(Boolean);

      const body: any = {
        action: editingId ? "update" : "create",
        nombre, categoria: categoria || null, message_groups: groups, variables: varsObj,
        min_delay_seconds: minDelay, max_delay_seconds: maxDelay,
        delay_between_messages: delayBetweenMessages, lead_filter: filter,
      };
      if (editingId) body.id = editingId;

      const r = await fetch("/api/campanas/whatsapp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = await r.json();
      if (d.success) {
        showToast(editingId ? "Actualizada" : "Creada", "success");
        if (startNow && (d.data?.id || editingId)) {
          const cid = d.data?.id || editingId;
          const sr = await fetch("/api/campanas/whatsapp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "start", id: cid }) });
          const sd = await sr.json();
          if (sd.success && sd.total > 0) { startBatchLoop(cid); showToast(`Envío (${sd.total} msgs)`, "success"); }
          else showToast(sd.error || "Sin destinatarios", "error");
        }
        setShowForm(false); resetForm(); loadCampaigns();
      } else showToast(d.error || "Error", "error");
    } catch { showToast("Error", "error"); }
    setSaving(false);
  };

  const startBatchLoop = async (campaignId: string) => {
    setSendingIds(prev => new Set(prev).add(campaignId));
    let retries = 0;
    const loop = async () => {
      try {
        const r = await fetch("/api/campanas/whatsapp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "process_batch", id: campaignId }) });
        const d = await r.json();
        if (d.success) {
          setSendingProgress(prev => ({ ...prev, [campaignId]: `${d.remaining} restantes` }));
          if (d.done) { setSendingIds(prev => { const n = new Set(prev); n.delete(campaignId); return n; }); loadCampaigns(); return; }
          retries = 0;
          setTimeout(loop, 2000);
        } else { retries++; if (retries > 3) { setSendingIds(prev => { const n = new Set(prev); n.delete(campaignId); return n; }); return; } setTimeout(loop, 3000); }
      } catch { retries++; if (retries > 3) { setSendingIds(prev => { const n = new Set(prev); n.delete(campaignId); return n; }); return; } setTimeout(loop, 3000); }
    };
    setTimeout(loop, 500);
  };

  const handleAction = async (id: string, action: string) => {
    if (action === "start") {
      const r = await fetch("/api/campanas/whatsapp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "start", id }) });
      const d = await r.json();
      if (d.success && d.total > 0) { startBatchLoop(id); showToast("Envío iniciado", "success"); loadCampaigns(); }
      else showToast(d.message || "Sin destinatarios", "error");
      return;
    }
    if (action === "duplicate") {
      const r = await fetch("/api/campanas/whatsapp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "duplicate", id }) });
      const d = await r.json();
      if (d.success) { showToast("Duplicada", "success"); loadCampaigns(); }
      else showToast(d.error || "Error", "error");
      return;
    }
    await fetch("/api/campanas/whatsapp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, id }) });
    showToast(action === "delete" ? "Eliminada" : "Pausada", "success");
    loadCampaigns();
  };

  const handleEdit = (wc: any) => {
    setEditingId(wc.id); setNombre(wc.nombre || ""); setCategoria(wc.categoria || "");
    const groups = wc.message_groups && wc.message_groups.length > 0 ? wc.message_groups : [{ texts: [wc.mensaje || ""], media_url: wc.media_url || null, filename: wc.filename || null }];
    setMessageGroups(groups.map((g: any) => ({ texts: (g.texts || [g.text || ""]).join("\n"), media_url: g.media_url || "", filename: g.filename || "" })));
    const v = wc.variables || {}; setVars(Object.entries(v).map(([name, opts]: [string, any]) => ({ name, options: Array.isArray(opts) ? opts.join("\n") : "" })));
    setMinDelay(wc.min_delay_seconds || 60); setMaxDelay(wc.max_delay_seconds || 180);
    setDelayBetweenMessages(wc.delay_between_messages || 30);
    const f = wc.lead_filter || {}; setContactMode(f.source || "leads"); setLeadEstado(f.estado || ""); setLeadCampanaId(f.campana_id || "");
    setSelectedProductId(f.producto_id || ""); setSelectedRol(f.rol || ""); setLeadCount(wc.total_recipients || 0);
    setShowForm(true);
  };

  const handleViewDetail = async (id: string) => {
    if (expandedCampaign === id) { setExpandedCampaign(null); setCampaignDetail(null); setCampaignRecipients([]); setRecipientsPolling(false); return; }
    setExpandedCampaign(id); setRecipientsPolling(true);
    const [cr, rr] = await Promise.all([
      fetch(`/api/campanas/whatsapp?id=${id}`).then(r => r.json()),
      fetch(`/api/campanas/whatsapp?id=${id}&recipients=true`).then(r => r.json()),
    ]);
    if (cr.success) setCampaignDetail(cr.data);
    if (rr.success) setCampaignRecipients(rr.recipients || []);
  };

  const saveVars = async () => {
    if (!vars.length) return;
    const nombre = prompt("Nombre de la plantilla:");
    if (!nombre) return;
    const varsObj: Record<string, string[]> = {};
    for (const v of vars) { if (v.name && v.options.trim()) varsObj[v.name] = v.options.split("\n").map(o => o.trim()).filter(o => o); }
    await fetch("/api/campanas/whatsapp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "save_variables", nombre, variables: varsObj }) });
    showToast("Plantilla guardada", "success");
    const r = await fetch("/api/campanas/whatsapp?action=variable_templates"); const d = await r.json(); setVarTemplates(d.templates || []);
  };
  const loadVars = (t: any) => {
    const entries = Object.entries(t.variables || {}).map(([name, opts]: [string, any]) => ({ name, options: Array.isArray(opts) ? opts.join("\n") : String(opts) }));
    setVars(entries);
    showToast("Plantilla cargada", "success");
  };
  const saveMsg = async () => {
    const nombre = prompt("Nombre de la plantilla:");
    if (!nombre) return;
    const groups = messageGroups.map(cleanGroup);
    await fetch("/api/campanas/whatsapp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "save_message_template", nombre, message_groups: groups }) });
    showToast("Plantilla guardada", "success");
    const r = await fetch("/api/campanas/whatsapp?action=message_templates"); const d = await r.json(); setMsgTemplates(d.templates || []);
  };
  const loadMsg = (t: any) => {
    const groups = t.message_groups || [{ texts: [""], media_url: null, filename: null }];
    setMessageGroups(groups.map((g: any) => ({ texts: (g.texts || [g.text || ""]).join("\n"), media_url: g.media_url || "", filename: g.filename || "" })));
    showToast("Plantilla cargada", "success");
  };
  const savePhoneList = async () => {
    const nombre = prompt("Nombre de la lista:");
    if (!nombre) return;
    const phones = manualPhones.split(/[\n,]+/).map(p => p.trim()).filter(Boolean);
    await fetch("/api/campanas/whatsapp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "save_phone_list", nombre, phones }) });
    showToast("Lista guardada", "success");
    const r = await fetch("/api/campanas/whatsapp?action=phone_lists"); const d = await r.json(); setPhoneLists(d.lists || []);
  };

  const toggleAllBuyers = () => setSelectedBuyerIds(prev => prev.length === buyers.length ? [] : buyers.map(b => b.id));
  const toggleAllEmployees = () => setSelectedEmployeeIds(prev => prev.length === employees.length ? [] : employees.map(e => e.id));
  const filteredBuyers = buyers.filter(b => !buyerSearch || b.nombre?.toLowerCase().includes(buyerSearch.toLowerCase()) || b.email?.toLowerCase().includes(buyerSearch.toLowerCase()));
  const filteredEmployees = employees.filter(e => !employeeSearch || e.nombre?.toLowerCase().includes(employeeSearch.toLowerCase()) || e.email?.toLowerCase().includes(employeeSearch.toLowerCase()));

  const statusColor = (s: string) => ({ sending: "text-emerald-400 bg-emerald-400/10", completed: "text-blue-400 bg-blue-400/10", scheduled: "text-amber-400 bg-amber-400/10", paused: "text-yellow-400 bg-yellow-400/10", failed: "text-red-400 bg-red-400/10" } as any)[s] || "text-gray-400 bg-gray-400/10";
  const contactTabs = [
    { id: "leads" as const, icon: Users, label: "Leads" }, { id: "manual" as const, icon: Phone, label: "Manual" },
    { id: "csv" as const, icon: FileText, label: "CSV" }, { id: "clientes" as const, icon: ShoppingBag, label: "Clientes" },
    { id: "empleados" as const, icon: Briefcase, label: "Empleados" }, { id: "phone_list" as const, icon: Clipboard, label: "Listas" },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div><h1 className="text-3xl font-black flex items-center gap-2"><MessageSquare className="w-6 h-6 text-emerald-400" /> WhatsApp Marketing</h1><p className="text-gray-500 text-xs mt-1">Grupos de mensajes · Variables · Delays · Tracking en vivo</p></div>
          <button onClick={() => { resetForm(); setShowForm(!showForm); }} className={`px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors ${showForm ? "bg-white/10" : "bg-emerald-600 hover:bg-emerald-500"}`}>{showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}{showForm ? "Cerrar" : "Nueva Campaña"}</button>
        </div>

        {showForm && (
          <div className="bg-zinc-900/50 border border-emerald-500/20 rounded-2xl p-6 space-y-5">
            <h3 className="text-white font-bold text-sm flex items-center gap-2">{editingId ? <Edit2 className="w-4 h-4 text-amber-400" /> : <Plus className="w-4 h-4 text-emerald-400" />}{editingId ? "Editar Campaña" : "Nueva Campaña WhatsApp"}</h3>

            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs text-gray-400 uppercase tracking-widest font-bold">Nombre *</label><input value={nombre} onChange={e => setNombre(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-3 text-sm text-white mt-1" placeholder="Oferta Julio 2026" /></div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-widest font-bold">Categoría</label>
                <input value={categoria} onChange={e => setCategoria(e.target.value)} list="categoria-list" className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-3 text-sm text-white mt-1" placeholder="Montebello, Curso, Villa Victoria..." />
                <datalist id="categoria-list">
                  {[...new Set(campaigns.map((c: any) => c.categoria).filter(Boolean))].map((cat: any) => <option key={cat} value={cat} />)}
                </datalist>
              </div>
            </div>

            {/* Message Groups */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-gray-400 uppercase tracking-widest font-bold">Mensajes</label>
                <div className="flex gap-2">
                  <div className="relative">
                    <select onChange={e => { if (e.target.value) loadMsg(msgTemplates.find(t => t.id === e.target.value)); e.target.value = ""; }} className="bg-black/50 border border-white/10 rounded px-3 py-1.5 text-xs text-gray-400">
                      <option value="">Cargar plantilla...</option>
                      {msgTemplates.map((t: any) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                    </select>
                  </div>
                  <button onClick={saveMsg} className="text-xs text-blue-400 font-bold hover:text-blue-300">💾 Guardar</button>
                </div>
              </div>
              {messageGroups.map((g, gIdx) => (
                <div key={gIdx} className="bg-black/30 border border-white/5 rounded-xl p-3 mb-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-bold">📝 Mensaje {gIdx + 1}</span>
                    {messageGroups.length > 1 && <button onClick={() => setMessageGroups(prev => prev.filter((_, i) => i !== gIdx))} className="text-red-400 hover:text-red-300"><X className="w-3.5 h-3.5" /></button>}
                  </div>
                  <textarea
                    value={g.texts} onChange={e => setMessageGroups(prev => prev.map((mg, i) => i === gIdx ? { ...mg, texts: e.target.value } : mg))}
                    onFocus={e => { e.currentTarget.dataset.groupIdx = String(gIdx); activeTextareaRef.current = e.currentTarget; }}
                    data-group-idx={gIdx}
                    rows={3} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-3 text-sm text-white resize-none"
                    placeholder={`Variantes (1 por línea):\n{saludo} oferta 🏠\nHey, mira esto 👀`}
                  />
                  <div className="flex items-center gap-2">
                    <input ref={el => { groupFileRefs.current[gIdx] = el; }} type="file" accept="image/*,video/*,.pdf" onChange={e => handleGroupFile(gIdx, e)} className="hidden" />
                    {g.media_url ? (
                      <div className="flex items-center gap-1 bg-emerald-500/10 rounded-lg px-3 py-1.5">
                        <Image className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-sm text-emerald-400 truncate max-w-[150px]">{g.filename || "Archivo"}</span>
                        <button onClick={() => removeGroupFile(gIdx)} className="text-red-400 hover:text-red-300"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => groupFileRefs.current[gIdx]?.click()} disabled={uploading} className="text-xs text-gray-500 hover:text-white flex items-center gap-1"><Upload className="w-3.5 h-3.5" />Subir archivo</button>
                    )}
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => setMessageGroups(prev => [...prev, { texts: "", media_url: "", filename: "" }])} className="text-xs text-emerald-400 font-bold flex items-center gap-1 hover:text-emerald-300"><Plus className="w-3.5 h-3.5" /> Agregar mensaje</button>
            </div>

            {/* Variables */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-gray-400 uppercase tracking-widest font-bold">Variables</label>
                <div className="flex gap-2">
                  <div className="relative">
                    <select onChange={e => { if (e.target.value) loadVars(varTemplates.find(t => t.id === e.target.value)); e.target.value = ""; }} className="bg-black/50 border border-white/10 rounded px-3 py-1.5 text-xs text-gray-400">
                      <option value="">Cargar plantilla...</option>
                      {varTemplates.map((t: any) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                    </select>
                  </div>
                  <button onClick={saveVars} className="text-xs text-blue-400 font-bold hover:text-blue-300">💾 Guardar</button>
                </div>
              </div>
              {vars.map((vr, i) => (
                <div key={i} className="mt-2 p-3 bg-black/30 border border-white/5 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <button onClick={() => insertVariable(vr.name)} className="p-1 text-xs bg-blue-500/10 border border-blue-500/20 rounded text-blue-400 hover:bg-blue-500/20 font-bold" title="Insertar en mensaje activo">📋</button>
                    <span className="text-xs text-gray-500 font-mono">{`{ `}</span>
                    <input value={vr.name} onChange={e => setVars(prev => prev.map((pv, j) => j === i ? { ...pv, name: e.target.value } : pv))} className="flex-1 bg-black/50 border border-white/10 rounded px-3 py-1.5 text-xs text-white" placeholder="saludo" />
                    <span className="text-xs text-gray-500 font-mono">{` }`}</span>
                    <button onClick={() => setVars(prev => prev.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-300"><X className="w-3.5 h-3.5" /></button>
                  </div>
                  <textarea value={vr.options} onChange={e => setVars(prev => prev.map((pv, j) => j === i ? { ...pv, options: e.target.value } : pv))} rows={2} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white resize-none" placeholder="Una opción por línea" />
                </div>
              ))}
              <button type="button" onClick={() => setVars(prev => [...prev, { name: "", options: "" }])} className="mt-2 text-xs text-blue-400 font-bold flex items-center gap-1 hover:text-blue-300"><Plus className="w-3.5 h-3.5" /> Agregar variable</button>
            </div>

            {/* Contacts */}
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2 block">Destinatarios</label>
              <div className="flex gap-1.5 flex-wrap">
                {contactTabs.map(tab => (
                  <button key={tab.id} onClick={() => { setContactMode(tab.id); setSelectedProductId(""); setSelectedRol(""); setSelectedBuyerIds([]); setSelectedEmployeeIds([]); setSelectedPhoneListId(""); }}
                    className={`p-2 rounded-lg border text-center transition-all ${contactMode === tab.id ? "bg-emerald-500/10 border-emerald-500/30" : "bg-white/[0.02] border-white/5 hover:border-white/10"}`}>
                    <tab.icon className={`w-4 h-4 mx-auto mb-0.5 ${contactMode === tab.id ? "text-emerald-400" : "text-gray-500"}`} /><p className="text-sm font-bold text-white">{tab.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {contactMode === "leads" && <div className="grid grid-cols-2 gap-3"><div><label className="text-xs text-gray-400 uppercase tracking-widest font-bold">Estado</label><select value={leadEstado} onChange={e => setLeadEstado(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-3 text-sm text-white mt-1"><option value="">Todos</option><option value="nuevo">Nuevo</option><option value="contactado">Contactado</option><option value="calificado">Calificado</option><option value="cliente">Cliente</option></select></div><div><label className="text-xs text-gray-400 uppercase tracking-widest font-bold">Campaña</label><SearchableSelect options={campanasList.map((c: any) => ({ value: c.id, label: c.nombre }))} value={leadCampanaId} onChange={setLeadCampanaId} placeholder="Todas" /></div></div>}
            {contactMode === "manual" && <div><textarea value={manualPhones} onChange={e => setManualPhones(e.target.value)} rows={3} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-3 text-sm text-white mt-1 resize-none" placeholder="+51999999999&#10;+593939011068&#10;o: +51..., +593..." /></div>}
            {contactMode === "csv" && <div><input ref={csvRef} type="file" accept=".csv" onChange={handleCsvImport} className="hidden" /><button onClick={() => csvRef.current?.click()} className="w-full flex items-center gap-3 p-4 bg-black/50 border border-dashed border-white/10 rounded-lg hover:border-emerald-500/30"><Upload className="w-5 h-5 text-gray-500" /><div className="text-left"><p className="text-sm text-white">{csvFileName || "Importar CSV"}</p><p className="text-xs text-gray-500">Columna: telefono/phone/celular</p></div></button>{csvPhones.length > 0 && <div className="mt-2 flex gap-2"><span className="text-xs text-emerald-400">{csvPhones.length} teléfonos</span><button onClick={() => { setCsvPhones([]); setCsvFileName(""); }} className="text-xs text-red-400">Limpiar</button></div>}</div>}
            {contactMode === "clientes" && <div className="space-y-3"><div><label className="text-xs text-gray-400 uppercase tracking-widest font-bold">Producto</label><SearchableSelect options={productosList.map((p: any) => ({ value: p.id, label: p.nombre, image: p.imagen_principal }))} value={selectedProductId} onChange={setSelectedProductId} placeholder="Seleccionar producto..." /></div>{buyers.length > 0 && <div className="bg-black/30 border border-white/5 rounded-xl p-3 space-y-2"><div className="flex items-center justify-between"><button onClick={toggleAllBuyers} className="text-xs font-bold text-gray-400 hover:text-white flex items-center gap-1"><Check className="w-3.5 h-3.5" />{selectedBuyerIds.length === buyers.length ? "Deseleccionar" : "Seleccionar"} ({buyers.length})</button><div className="flex items-center gap-2 flex-1 max-w-[200px]"><Search className="w-3.5 h-3.5 text-gray-500" /><input value={buyerSearch} onChange={e => setBuyerSearch(e.target.value)} placeholder="Filtrar..." className="w-full bg-transparent text-xs text-white placeholder-gray-600 outline-none" /></div></div><div className="max-h-48 overflow-y-auto space-y-0.5">{filteredBuyers.map(b => { const sel = selectedBuyerIds.includes(b.id); return <button key={b.id} onClick={() => setSelectedBuyerIds(prev => prev.includes(b.id) ? prev.filter(id => id !== b.id) : [...prev, b.id])} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${sel ? "bg-emerald-500/10" : "hover:bg-white/[0.02]"}`}><div className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[10px] shrink-0 ${sel ? "bg-emerald-500 border-emerald-500 text-white" : "border-white/10"}`}>{sel ? "✓" : ""}</div><div className="min-w-0"><p className={`text-sm font-bold truncate ${sel ? "text-white" : "text-gray-400"}`}>{b.nombre}</p><p className="text-sm text-gray-600 truncate">{b.email} {b.telefono ? `· ${b.telefono}` : ""}</p></div></button> })}</div></div>}</div>}
            {contactMode === "empleados" && <div className="space-y-3"><div><label className="text-xs text-gray-400 uppercase tracking-widest font-bold">Rol</label><select value={selectedRol} onChange={e => setSelectedRol(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-3 text-sm text-white mt-1"><option value="">Seleccionar...</option><option value="superadmin">Super Admin</option><option value="admin">Admin</option><option value="editor">Editor</option><option value="empleado">Empleado</option></select></div>{employees.length > 0 && <div className="bg-black/30 border border-white/5 rounded-xl p-3 space-y-2"><div className="flex items-center justify-between"><button onClick={toggleAllEmployees} className="text-xs font-bold text-gray-400 hover:text-white flex items-center gap-1"><Check className="w-3.5 h-3.5" />{selectedEmployeeIds.length === employees.length ? "Deseleccionar" : "Seleccionar"} ({employees.length})</button><div className="flex items-center gap-2 flex-1 max-w-[200px]"><Search className="w-3.5 h-3.5 text-gray-500" /><input value={employeeSearch} onChange={e => setEmployeeSearch(e.target.value)} placeholder="Filtrar..." className="w-full bg-transparent text-xs text-white placeholder-gray-600 outline-none" /></div></div><div className="max-h-48 overflow-y-auto space-y-0.5">{filteredEmployees.map(e => { const sel = selectedEmployeeIds.includes(e.id); return <button key={e.id} onClick={() => setSelectedEmployeeIds(prev => prev.includes(e.id) ? prev.filter(id => id !== e.id) : [...prev, e.id])} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${sel ? "bg-emerald-500/10" : "hover:bg-white/[0.02]"}`}><div className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[10px] shrink-0 ${sel ? "bg-emerald-500 border-emerald-500 text-white" : "border-white/10"}`}>{sel ? "✓" : ""}</div><div className="min-w-0"><p className={`text-sm font-bold truncate ${sel ? "text-white" : "text-gray-400"}`}>{e.nombre}</p><p className="text-sm text-gray-600 truncate">{e.email} {e.telefono ? `· ${e.telefono}` : ""}</p></div></button> })}</div></div>}</div>}
            {contactMode === "phone_list" && <div className="space-y-3"><div><label className="text-xs text-gray-400 uppercase tracking-widest font-bold">Lista guardada</label><select value={selectedPhoneListId} onChange={e => setSelectedPhoneListId(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-3 text-sm text-white mt-1"><option value="">Seleccionar...</option>{phoneLists.map((l: any) => <option key={l.id} value={l.id}>{l.nombre} ({l.phones?.length || 0})</option>)}</select></div>{selectedPhoneListId && <div><span className="text-xs text-emerald-400">{phoneLists.find(l => l.id === selectedPhoneListId)?.phones?.length || 0} números</span></div>}</div>}

            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10"><span className="text-xs text-gray-400 uppercase tracking-widest font-bold">Destinatarios</span><span className="text-xl font-black text-emerald-400">{leadCount}</span></div>

            <div className="grid grid-cols-3 gap-3">
              <div><label className="text-xs text-gray-400 uppercase tracking-widest font-bold">Entre mensajes (seg)</label><input type="number" value={delayBetweenMessages} onChange={e => setDelayBetweenMessages(parseInt(e.target.value) || 30)} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-3 text-sm text-white mt-1" /></div>
              <div><label className="text-xs text-gray-400 uppercase tracking-widest font-bold">Delay min (seg)</label><input type="number" value={minDelay} onChange={e => setMinDelay(parseInt(e.target.value) || 30)} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-3 text-sm text-white mt-1" /></div>
              <div><label className="text-xs text-gray-400 uppercase tracking-widest font-bold">Delay max (seg)</label><input type="number" value={maxDelay} onChange={e => setMaxDelay(parseInt(e.target.value) || 120)} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-3 text-sm text-white mt-1" /></div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => handleCreate(false)} disabled={saving} className="flex-1 py-3 bg-white/10 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/20 transition-colors disabled:opacity-50"><Eye className="w-4 h-4" />Guardar Borrador</button>
              <button onClick={() => handleCreate(true)} disabled={saving} className="flex-[2] py-3 bg-emerald-600 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-500 transition-colors disabled:opacity-50"><Send className="w-4 h-4" />Crear y Enviar ({leadCount})</button>
            </div>
          </div>
        )}

        {/* History */}
        {loading ? <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-white/[0.02] rounded-xl animate-pulse" />)}</div>
        : campaigns.length === 0 ? <div className="text-center py-16 bg-zinc-900/20 border border-white/5 rounded-2xl"><Send className="w-12 h-12 text-gray-700 mx-auto mb-4" /><p className="text-gray-500 text-sm">Sin campañas</p></div>
        : <>
          <h2 className="text-xl font-black flex items-center gap-2"><Clock className="w-5 h-5 text-gray-500" /> Historial</h2>
          {/* Filtro categoría */}
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setCategoria("")} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${!categoria ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-gray-500 hover:text-white"}`}>📁 Todas</button>
            {[...new Set(campaigns.map((c: any) => c.categoria).filter(Boolean))].map((cat: any) => (
              <button key={cat} onClick={() => setCategoria(cat)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${categoria === cat ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-gray-500 hover:text-white"}`}>📁 {cat}</button>
            ))}
          </div>
          <div className="space-y-3">
            {campaigns.filter((wc: any) => !categoria || wc.categoria === categoria).map((wc: any) => (
              <div key={wc.id} className="bg-zinc-900/30 border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-colors">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full shrink-0 ${wc.status === "sending" || sendingIds.has(wc.id) ? "bg-emerald-500 animate-pulse" : wc.status === "completed" ? "bg-blue-500" : wc.status === "failed" ? "bg-red-500" : wc.status === "paused" ? "bg-yellow-500" : "bg-gray-600"}`} />
                        <h3 className="text-white font-bold truncate">{wc.nombre}</h3>
                        <span className={`text-sm px-2 py-0.5 rounded-full font-bold uppercase ${statusColor(sendingIds.has(wc.id) ? "sending" : wc.status)}`}>{sendingIds.has(wc.id) ? "sending" : wc.status}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500">
                        <span><BarChart3 className="w-3.5 h-3.5 inline mr-1" />{wc.sent_count}/{wc.total_recipients}</span>
                        {sendingProgress[wc.id] && <span className="text-emerald-400"><Loader2 className="w-3.5 h-3.5 inline animate-spin mr-1" />{sendingProgress[wc.id]}</span>}
                        <span className="text-gray-600">{new Date(wc.creado_en).toLocaleDateString("es-MX")}</span>
                      </div>
                      {wc.total_recipients > 0 && <div className="mt-3 w-full bg-white/5 rounded-full h-1.5 overflow-hidden"><div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${(wc.sent_count / wc.total_recipients) * 100}%` }} /></div>}
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      {wc.status === "draft" && !sendingIds.has(wc.id) && (<><button onClick={() => handleEdit(wc)} className="px-3 py-2.5 bg-white/10 rounded-lg text-gray-400 text-xs font-bold hover:text-white"><Edit2 className="w-3.5 h-3.5" /></button><button onClick={() => handleAction(wc.id, "start")} className="px-3 py-2 bg-emerald-600 rounded-lg text-white text-xs font-bold flex items-center gap-1 hover:bg-emerald-500"><Play className="w-3.5 h-3.5" /> Iniciar</button></>)}
                      {wc.status === "sending" && <button onClick={() => handleAction(wc.id, "pause")} className="px-3 py-2 bg-amber-600 rounded-lg text-white text-xs font-bold flex items-center gap-1 hover:bg-amber-500"><Pause className="w-3.5 h-3.5" /> Pausar</button>}
                      <button onClick={() => handleAction(wc.id, "duplicate")} className="px-3 py-2.5 bg-white/10 rounded-lg text-gray-400 text-xs font-bold hover:text-white"><Copy className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleViewDetail(wc.id)} className="px-3 py-2.5 bg-white/10 rounded-lg text-gray-400 text-xs font-bold hover:text-white">{expandedCampaign === wc.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}</button>
                      <button onClick={() => { if (confirm("¿Eliminar?")) handleAction(wc.id, "delete"); }} className="px-3 py-2.5 bg-red-500/10 rounded-lg text-red-400 text-xs font-bold hover:bg-red-500/20"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
                {/* Expanded: Live Tracking Table */}
                {expandedCampaign === wc.id && (
                  <div className="border-t border-white/5 px-5 py-4 bg-black/20 space-y-3">
                    {campaignRecipients.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead><tr className="text-gray-500 border-b border-white/5"><th className="text-left py-2 font-bold uppercase tracking-wider text-sm">Teléfono</th><th className="text-left py-2 font-bold uppercase tracking-wider text-sm">Grupo</th><th className="text-left py-2 font-bold uppercase tracking-wider text-sm">Estado</th><th className="text-left py-2 font-bold uppercase tracking-wider text-sm">Hora</th><th className="text-left py-2 font-bold uppercase tracking-wider text-sm">Error</th></tr></thead>
                          <tbody>
                            {campaignRecipients.map((r: any) => (
                              <tr key={r.id} className="border-b border-white/[0.02]">
                                <td className="py-1.5 text-gray-300">{r.phone}</td>
                                <td className="py-1.5 text-gray-500">{r.group_index != null ? `#${r.group_index + 1}` : "-"}</td>
                                <td className="py-1.5">{r.status === "sent" ? <span className="text-emerald-400 font-bold">✅</span> : r.status === "failed" ? <span className="text-red-400 font-bold">❌</span> : r.status === "pending" ? <span className="text-gray-500">⬜</span> : <span className="text-yellow-400 animate-pulse">⏳</span>}</td>
                                <td className="py-1.5 text-gray-600">{r.sent_at ? new Date(r.sent_at).toLocaleTimeString("es-MX") : "-"}</td>
                                <td className="py-1.5 text-red-400/70 truncate max-w-[150px]">{r.error || ""}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : <p className="text-xs text-gray-600">No hay registros de envío</p>}
                    {recipientsPolling && <p className="text-sm text-gray-700 flex items-center gap-1"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Actualizando cada 30s</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>}
      </div>
    </div>
  );
}
