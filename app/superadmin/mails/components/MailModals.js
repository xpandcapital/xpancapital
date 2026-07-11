'use client';
import React, { useState } from 'react';
import { X, Send, FolderOpen, Database, Code, Check, CheckCircle, Server, Star, Pencil, AlertCircle, Loader2, Paperclip, Trash2, Upload, Grid, Mail, Layers, Search, Plus, Users, Save } from 'lucide-react';

export function ExportHtmlModal({ show, onClose, generateHTML, copied, setCopied }) {
  if (!show) return null;
  const html = generateHTML();
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#333] rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col h-[85vh]">
        <div className="flex justify-between p-5 border-b border-gray-100 dark:border-[#222]">
          <h3 className="font-bold flex gap-2 text-gray-900 dark:text-white"><Code className="text-[#e11d48]"/> Código HTML para Correo</h3>
          <button onClick={onClose} className="text-gray-400"><X/></button>
        </div>
        <div className="p-5 flex-1 bg-gray-900 overflow-hidden relative">
          <textarea readOnly className="w-full h-full bg-transparent text-emerald-400 font-mono text-sm resize-none outline-none custom-scrollbar" value={html} />
          <button onClick={() => { navigator.clipboard.writeText(html); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className={`absolute bottom-6 right-6 text-white px-6 py-3 rounded-xl shadow-lg flex gap-2 font-bold ${copied ? 'bg-green-600' : 'bg-[#e11d48]'}`}>
            {copied ? <Check size={18} /> : <Copy size={18} />} {copied ? 'Copiado' : 'Copiar Código'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function SaveTemplateModal({ show, onClose, templateName, setTemplateName, currentTemplateId, saveAsNew, onSave, templatesLoading }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#333] rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex justify-between p-5 border-b border-gray-100 dark:border-[#222]">
          <h3 className="font-bold flex gap-2 text-gray-900 dark:text-white"><Save className="text-emerald-500"/> {saveAsNew ? 'Guardar como Nueva Plantilla' : 'Guardar Plantilla'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X/></button>
        </div>
        <div className="p-5 space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre de la plantilla</label><input type="text" value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder={saveAsNew ? 'Ej: Mi Newsletter Personalizado' : 'Ej: Newsletter Enero 2026'} className="w-full px-4 py-2 border border-gray-300 dark:border-[#333] rounded-lg bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#e11d48]" /></div>
          {saveAsNew ? (
            <button onClick={() => onSave(true)} disabled={templatesLoading} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50"><Plus size={18} /> {templatesLoading ? 'Creando...' : 'Crear Nueva Plantilla'}</button>
          ) : currentTemplateId ? (
            <div className="grid grid-cols-2 gap-3"><button onClick={() => onSave(false)} disabled={templatesLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 13 17 13"/></svg> Actualizar</button><button onClick={() => onSave(true)} disabled={templatesLoading} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50 text-sm"><Save size={18} /> Guardar Como</button></div>
          ) : (
            <button onClick={() => onSave(true)} disabled={templatesLoading} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50"><Save size={18} /> {templatesLoading ? 'Guardando...' : 'Guardar Plantilla'}</button>
          )}
        </div>
      </div>
    </div>
  );
}

export function TemplatesModal({ show, onClose, savedTemplates, onLoadTemplate, onDeleteTemplate }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#333] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex justify-between p-5 border-b border-gray-100 dark:border-[#222]">
          <h3 className="font-bold flex gap-2 text-gray-900 dark:text-white"><FolderOpen className="text-[#e11d48]"/> Plantillas Guardadas</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X/></button>
        </div>
        <div className="p-5 overflow-y-auto flex-1">
          {savedTemplates.length === 0 ? (<div className="text-center text-gray-500 py-10"><FolderOpen size={48} className="mx-auto mb-4 opacity-30" /><p>No hay plantillas guardadas</p><p className="text-sm">Crea una nueva plantilla y guárdala</p></div>) : (<div className="grid gap-3">{savedTemplates.map((t) => (<div key={t.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#161616] rounded-xl border border-gray-200 dark:border-[#333] hover:border-[#e11d48] cursor-pointer transition-colors" onClick={() => onLoadTemplate(t.id)}><div><h4 className="font-bold text-gray-900 dark:text-white">{t.nombre}</h4><p className="text-xs text-gray-500">{new Date(t.creado_en).toLocaleDateString()}</p></div><button onClick={async (e) => { e.stopPropagation(); if (confirm('¿Eliminar esta plantilla?')) await onDeleteTemplate(t.id); }} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 size={18} /></button></div>))}</div>)}
        </div>
      </div>
    </div>
  );
}

export function SendModal({ show, onClose, campaignConfig, setCampaignConfig, senders, sendTab, setSendTab, sendingEmail, onSend, attachments, setAttachments }) {
  const [crmSearch, setCrmSearch] = useState('');
  const [crmContacts, setCrmContacts] = useState([]);
  const [crmLoading, setCrmLoading] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [grupos, setGrupos] = useState(() => { try { return JSON.parse(localStorage.getItem('blis_email_grupos') || '[]'); } catch { return []; } });
  const [nuevoGrupo, setNuevoGrupo] = useState('');

  const buscarCRM = async (q) => {
    setCrmSearch(q);
    if (q.length < 2) { setCrmContacts([]); return; }
    setCrmLoading(true);
    try {
      const res = await fetch(`/api/admin/contactos?search=${encodeURIComponent(q)}&limit=20`);
      const d = await res.json();
      if (d.success) setCrmContacts(d.contactos || []);
    } catch { setCrmContacts([]); }
    setCrmLoading(false);
  };

  const toggleContacto = (c) => {
    setSelectedContacts(prev => prev.find(p => p.id === c.id) ? prev.filter(p => p.id !== c.id) : [...prev, c]);
  };

  const agregarSeleccionados = () => {
    const emails = selectedContacts.map(c => c.email).filter(Boolean).join(', ');
    setCampaignConfig(prev => ({ ...prev, emails: prev.emails ? prev.emails + ', ' + emails : emails, type: 'manual' }));
    setSelectedContacts([]);
  };

  const crearGrupo = () => {
    if (!nuevoGrupo.trim()) return;
    const g = [...grupos, { id: Date.now().toString(), nombre: nuevoGrupo.trim(), contactos: selectedContacts.map(c => ({ id: c.id, email: c.email, nombre: c.nombre })) }];
    setGrupos(g);
    localStorage.setItem('blis_email_grupos', JSON.stringify(g));
    setNuevoGrupo('');
    setSelectedContacts([]);
  };

  const eliminarGrupo = (id) => {
    const g = grupos.filter(gr => gr.id !== id);
    setGrupos(g);
    localStorage.setItem('blis_email_grupos', JSON.stringify(g));
  };

  const usarGrupo = (grupo) => {
    const emails = grupo.contactos.map(c => c.email).join(', ');
    setCampaignConfig(prev => ({ ...prev, emails, type: 'manual' }));
  };

  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#333] rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-[#222]"><h3 className="font-bold flex items-center gap-2 text-gray-900 dark:text-white text-lg"><Send className="text-blue-500"/> Enviar Campaña</h3><button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-md bg-gray-100 dark:bg-[#222]"><X size={18}/></button></div>
        <div className="flex border-b border-gray-200 dark:border-[#222] bg-gray-50 dark:bg-[#161616]">
          <button onClick={() => setSendTab('destinatarios')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${sendTab === 'destinatarios' ? 'border-b-2 border-blue-500 text-blue-500 bg-white dark:bg-[#111111]' : 'text-gray-500 hover:text-gray-700'}`}>1. Destinatarios</button>
          <button onClick={() => setSendTab('envio')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${sendTab === 'envio' ? 'border-b-2 border-blue-500 text-blue-500 bg-white dark:bg-[#111111]' : 'text-gray-500 hover:text-gray-700'}`}>2. Enviar</button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {sendTab === 'destinatarios' && (
            <div className="space-y-5">
              <div><label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Método de Selección</label><div className="grid grid-cols-3 gap-3">
                <button onClick={() => setCampaignConfig({...campaignConfig, type: 'manual'})} className={`p-3 border rounded-xl flex flex-col items-center gap-2 transition-all ${campaignConfig.type === 'manual' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500' : 'border-gray-200 dark:border-[#333] text-gray-500 hover:border-gray-300 dark:hover:border-[#444]'}`}><Code size={20} /><span className="text-xs font-bold">Manual</span></button>
                <button onClick={() => setCampaignConfig({...campaignConfig, type: 'leads'})} className={`p-3 border rounded-xl flex flex-col items-center gap-2 transition-all ${campaignConfig.type === 'leads' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500' : 'border-gray-200 dark:border-[#333] text-gray-500 hover:border-gray-300 dark:hover:border-[#444]'}`}><Database size={20} /><span className="text-xs font-bold">Desde CRM</span></button>
                <button onClick={() => setCampaignConfig({...campaignConfig, type: 'grupos'})} className={`p-3 border rounded-xl flex flex-col items-center gap-2 transition-all ${campaignConfig.type === 'grupos' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500' : 'border-gray-200 dark:border-[#333] text-gray-500'}`}><Layers size={20} /><span className="text-xs font-bold">Grupos</span></button>
              </div></div>
              {campaignConfig.type === 'manual' && (<div className="bg-gray-50 dark:bg-[#161616] p-4 rounded-xl border border-gray-200 dark:border-[#333]"><label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">Correos Electrónicos (separados por coma)</label><textarea rows={4} placeholder="cliente1@gmail.com, usuario2@empresa.com" value={campaignConfig.emails} onChange={(e) => setCampaignConfig({...campaignConfig, emails: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-[#444] rounded-lg bg-white dark:bg-[#0a0a0a] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" /><p className="text-[10px] text-gray-500 mt-2">Cada correo irá en copia oculta (BCC)</p></div>)}
              {campaignConfig.type === 'leads' && (<div className="bg-gray-50 dark:bg-[#161616] p-4 rounded-xl border border-gray-200 dark:border-[#333] space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Buscar por nombre o email..." value={crmSearch} onChange={e => buscarCRM(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-[#444] rounded-lg bg-white dark:bg-[#0a0a0a] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                {crmLoading && <div className="text-center py-4"><Loader2 size={20} className="animate-spin mx-auto text-blue-500" /></div>}
                {!crmLoading && crmContacts.length > 0 && (
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {crmContacts.map(c => (
                      <label key={c.id} className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${selectedContacts.find(s => s.id === c.id) ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-300' : 'hover:bg-gray-100 dark:hover:bg-[#222] border border-transparent'}`}>
                        <input type="checkbox" checked={!!selectedContacts.find(s => s.id === c.id)} onChange={() => toggleContacto(c)} className="rounded" />
                        <div className="flex-1 min-w-0"><p className="text-sm font-bold truncate">{c.nombre}</p><p className="text-xs text-gray-500 truncate">{c.email}</p></div>
                        <span className="text-[10px] text-gray-400 uppercase">{c.rol}</span>
                      </label>
                    ))}
                  </div>
                )}
                {!crmLoading && crmContacts.length === 0 && crmSearch.length >= 2 && <p className="text-xs text-gray-500 text-center py-4">Sin resultados</p>}
                {selectedContacts.length > 0 && (
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-[#333]">
                    <span className="text-xs text-gray-500">{selectedContacts.length} seleccionados</span>
                    <button onClick={agregarSeleccionados} className="ml-auto px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700">Agregar al envío</button>
                    <button onClick={() => { const n = prompt('Nombre del grupo:'); if (n) { const g = [...grupos, { id: Date.now().toString(), nombre: n.trim(), contactos: selectedContacts.map(c => ({ id: c.id, email: c.email, nombre: c.nombre })) }]; setGrupos(g); localStorage.setItem('blis_email_grupos', JSON.stringify(g)); setSelectedContacts([]); } }} className="px-3 py-1.5 bg-white dark:bg-[#222] border border-gray-200 dark:border-[#444] text-xs font-bold rounded-lg"><Users size={12} className="inline mr-1" /> Crear Grupo</button>
                  </div>
                )}
              </div>)}
              {campaignConfig.type === 'grupos' && (<div className="bg-gray-50 dark:bg-[#161616] p-4 rounded-xl border border-gray-200 dark:border-[#333] space-y-3">
                {grupos.length === 0 ? (
                  <div className="text-center py-6">
                    <Users size={32} className="mx-auto text-gray-400 mb-3 opacity-50" />
                    <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">Sin grupos</h4>
                    <p className="text-xs text-gray-500 mt-1">Selecciona contactos en "Desde CRM" y crea un grupo</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {grupos.map(g => (
                      <div key={g.id} className="flex items-center justify-between bg-white dark:bg-[#0a0a0a] p-3 rounded-lg border border-gray-200 dark:border-[#333]">
                        <div>
                          <p className="text-sm font-bold">{g.nombre}</p>
                          <p className="text-[10px] text-gray-500">{g.contactos?.length || 0} contactos</p>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => usarGrupo(g)} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded">Usar</button>
                          <button onClick={() => eliminarGrupo(g.id)} className="px-2 py-1 text-red-500 hover:bg-red-50 rounded"><Trash2 size={12} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>)}
              <div className="bg-gray-50 dark:bg-[#161616] p-4 rounded-xl border border-gray-200 dark:border-[#333]"><label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2"><Paperclip size={14} /> Archivos Adjuntos</label><input type="file" multiple onChange={(e) => { const files = Array.from(e.target.files || []); setAttachments([...attachments, ...files]); }} className="w-full text-xs text-gray-500 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 dark:file:bg-blue-900/20 file:text-blue-600 dark:file:text-blue-400 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/30" />{attachments.length > 0 && (<div className="mt-3 space-y-2">{attachments.map((file, idx) => (<div key={idx} className="flex items-center justify-between bg-white dark:bg-[#0a0a0a] p-2 rounded border border-gray-200 dark:border-[#333]"><span className="text-xs truncate flex-1">{file.name}</span><button onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))} className="text-red-500 ml-2"><X size={14} /></button></div>))}</div>)}</div>
            </div>
          )}
          {sendTab === 'envio' && (
            <div className="space-y-4">
              <div><label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Remitente</label>
                {senders.length === 0 ? (<div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 p-4 rounded-xl"><p className="text-xs text-yellow-700 dark:text-yellow-500">No hay remitentes configurados.</p></div>) : (<div className="grid gap-2">{senders.map(sender => (<button key={sender.id} onClick={() => setCampaignConfig({...campaignConfig, selectedSenderId: sender.id})} className={`p-3 border rounded-xl flex items-center justify-between transition-all ${campaignConfig.selectedSenderId === sender.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-gray-200 dark:border-[#333] hover:border-gray-300'}`}><div className="text-left"><div className="flex items-center gap-2"><span className="font-bold text-sm text-gray-900 dark:text-white">{sender.nombre}</span>{sender.is_default && <span className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded">DEFAULT</span>}</div><p className="text-xs text-gray-500">{sender.from_name} &lt;{sender.from_email}&gt;</p><p className="text-[10px] text-gray-400 uppercase">{sender.provider}</p></div>{campaignConfig.selectedSenderId === sender.id && <CheckCircle size={18} className="text-blue-500" />}</button>))}</div>)}
              </div>
              <div><label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Asunto del Correo</label><input type="text" placeholder="¡No te pierdas esta increíble oferta!" value={campaignConfig.subject} onChange={(e) => setCampaignConfig({...campaignConfig, subject: e.target.value})} className="w-full px-4 py-3 border border-gray-300 dark:border-[#333] rounded-xl bg-white dark:bg-[#0a0a0a] text-base focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Texto de Previsualización</label><input type="text" placeholder="Este texto aparece junto al asunto en la bandeja de entrada..." value={campaignConfig.preview} onChange={(e) => setCampaignConfig({...campaignConfig, preview: e.target.value})} className="w-full px-4 py-2 border border-gray-300 dark:border-[#333] rounded-lg bg-white dark:bg-[#0a0a0a] text-sm text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500" /></div>
            </div>
          )}
        </div>
        <div className="p-5 border-t border-gray-100 dark:border-[#222] flex justify-between bg-gray-50 dark:bg-[#161616] rounded-b-2xl">
          <button onClick={() => { if (sendTab === 'envio') { setSendTab('destinatarios'); } else { onClose(); } }} className="px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#222] rounded-lg transition-colors">{sendTab === 'destinatarios' ? 'Cancelar' : 'Atrás'}</button>
          <button onClick={sendTab === 'destinatarios' ? () => setSendTab('envio') : onSend} disabled={sendingEmail} className="px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {sendingEmail ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Enviando...</>) : (sendTab === 'envio' ? <><Send size={16}/> Enviar Campaña</> : <><Send size={16}/> Continuar</>)}
          </button>
        </div>
      </div>
    </div>
  );
}

export function MediaModal({ show, onClose, media, mediaLoading, mediaTab, setMediaTab, uploadMedia, deleteMedia, mediaCallbackRef }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#333] rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-[#222]"><h3 className="font-bold flex items-center gap-2 text-gray-900 dark:text-white text-lg"><Grid className="text-purple-500"/> Galería de Medios</h3><div className="flex items-center gap-2"><label className="cursor-pointer px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white text-xs font-bold rounded-lg flex items-center gap-1"><Upload size={14} /> Subir<input type="file" accept="image/*,.gif,.png,.jpg,.jpeg,.svg,.webp" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { await uploadMedia(f, f.name); e.target.value = ''; } }} /></label><button onClick={() => { onClose(); mediaCallbackRef.current = null; }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-md bg-gray-100 dark:bg-[#222]"><X size={18} /></button></div></div>
        <div className="flex border-b border-gray-200 dark:border-[#222] bg-gray-50 dark:bg-[#161616]">
          <button onClick={() => setMediaTab('all')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${mediaTab === 'all' ? 'border-b-2 border-purple-500 text-purple-500 bg-white dark:bg-[#111111]' : 'text-gray-500 hover:text-gray-700'}`}>Todos</button>
          <button onClick={() => setMediaTab('image')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${mediaTab === 'image' ? 'border-b-2 border-purple-500 text-purple-500 bg-white dark:bg-[#111111]' : 'text-gray-500 hover:text-gray-700'}`}>Imágenes</button>
          <button onClick={() => setMediaTab('gif')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${mediaTab === 'gif' ? 'border-b-2 border-purple-500 text-purple-500 bg-white dark:bg-[#111111]' : 'text-gray-500 hover:text-gray-700'}`}>GIFs</button>
          <button onClick={() => setMediaTab('icon')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${mediaTab === 'icon' ? 'border-b-2 border-purple-500 text-purple-500 bg-white dark:bg-[#111111]' : 'text-gray-500 hover:text-gray-700'}`}>Iconos</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {media.length === 0 ? (<div className="text-center py-10"><Grid size={48} className="mx-auto text-gray-300 mb-3" /><p className="text-gray-500">No hay medios cargados</p><p className="text-xs text-gray-400 mt-1">Sube imágenes para usarlas en tus plantillas</p></div>) : (<div className="grid grid-cols-4 gap-3">{media.filter(m => mediaTab === 'all' || m.tipo === mediaTab).map((m) => (<div key={m.id} className="relative group aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-purple-500 transition-all cursor-pointer bg-gray-100 dark:bg-[#222]"><img src={m.url} alt={m.nombre} className="w-full h-full object-contain" onError={(e) => { e.currentTarget.src = 'https://placehold.co/150/333/FFF?text=Error'; }} /><div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center" onClick={() => { if (mediaCallbackRef.current) { mediaCallbackRef.current(m.url); onClose(); mediaCallbackRef.current = null; } else { alert('Primero selecciona el campo donde quieres insertar la imagen'); } }}><span className="text-white font-bold opacity-0 group-hover:opacity-100 transition-all pointer-events-none">Usar</span></div><div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 text-[10px] text-white truncate pointer-events-none">{m.nombre}</div><button type="button" onClick={async (e) => { e.stopPropagation(); if (confirm('¿Eliminar este medio?')) await deleteMedia(m.id); }} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-all z-10"><Trash2 size={12} /></button></div>))}</div>)}
        </div>
      </div>
    </div>
  );
}

export function SettingsModal({ show, onClose, senders, editingSender, setEditingSender, saveSender, deleteSender, testingConnection, testResult, setTestResult, settingsTab, setSettingsTab }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#333] rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-[#222]"><h3 className="font-bold flex items-center gap-2 text-gray-900 dark:text-white text-lg"><Server className="text-purple-500"/> Configuración de Remitentes</h3><button onClick={() => { onClose(); setEditingSender(null); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-md bg-gray-100 dark:bg-[#222]"><X size={18}/></button></div>
        <div className="flex border-b border-gray-200 dark:border-[#222] bg-gray-50 dark:bg-[#161616]">
          <button onClick={() => setSettingsTab('senders')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${settingsTab === 'senders' ? 'border-b-2 border-purple-500 text-purple-500 bg-white dark:bg-[#111111]' : 'text-gray-500 hover:text-gray-700'}`}>Remitentes</button>
          <button onClick={() => setSettingsTab('smtp')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${settingsTab === 'smtp' ? 'border-b-2 border-purple-500 text-purple-500 bg-white dark:bg-[#111111]' : 'text-gray-500 hover:text-gray-700'}`}>Guía SMTP</button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {settingsTab === 'senders' && (<SenderManagement senders={senders} editingSender={editingSender} setEditingSender={setEditingSender} saveSender={saveSender} deleteSender={deleteSender} testingConnection={testingConnection} testResult={testResult} setTestResult={setTestResult} />)}
          {settingsTab === 'smtp' && (<SmtpGuide />)}
        </div>
      </div>
    </div>
  );
}

function SenderManagement({ senders, editingSender, setEditingSender, saveSender, deleteSender, testingConnection, testResult, setTestResult }) {
  return (
    <div className="space-y-4">
      {!editingSender && senders.length > 0 && (<div className="space-y-2">{senders.map(sender => (<div key={sender.id} className={`p-4 border rounded-xl flex items-center justify-between ${sender.is_default ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/10' : 'border-gray-200 dark:border-[#333]'}`}><div><div className="flex items-center gap-2"><span className="font-bold text-gray-900 dark:text-white">{sender.nombre}</span>{sender.is_default && <span className="text-[10px] bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded">DEFAULT</span>}</div><p className="text-sm text-gray-500">{sender.from_name} &lt;{sender.from_email}&gt;</p><p className="text-xs text-gray-400 uppercase">{sender.provider} {sender.smtp_host && `· ${sender.smtp_host}:${sender.smtp_port}`}</p></div><div className="flex items-center gap-2">{!sender.is_default && (<button onClick={() => saveSender({ ...sender, is_default: true })} title="Establecer como default" className="p-2 text-gray-400 hover:text-yellow-500"><Star size={16} /></button>)}<button onClick={() => { setTestResult(null); setEditingSender(sender); }} className="p-2 text-gray-400 hover:text-blue-500"><Pencil size={16} /></button><button onClick={async () => { if(confirm('¿Eliminar este remitente?')) await deleteSender(sender.id); }} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button></div></div>))}</div>)}
      {editingSender && (<SenderForm editingSender={editingSender} setEditingSender={setEditingSender} saveSender={saveSender} setTestResult={setTestResult} testingConnection={testingConnection} testResult={testResult} senders={senders} />)}
      {!editingSender && (<button onClick={() => { setTestResult(null); setEditingSender({ nombre: '', from_name: '', from_email: '', provider: 'smtp', smtp_port: 465, is_default: senders.length === 0 }); }} className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-[#444] rounded-xl text-sm font-bold text-gray-500 hover:border-purple-500 hover:text-purple-500 transition-colors">+ Añadir Nuevo Remitente</button>)}
    </div>
  );
}

function SenderForm({ editingSender, setEditingSender, saveSender, setTestResult, testingConnection, testResult, senders }) {
  return (
    <div className="bg-gray-50 dark:bg-[#161616] p-4 rounded-xl border border-gray-200 dark:border-[#333] space-y-4">
      <div className="grid grid-cols-2 gap-3"><div><label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Nombre del Remitente</label><input type="text" placeholder="Ej: Marketing XPAND" value={editingSender.nombre || ''} onChange={(e) => setEditingSender({...editingSender, nombre: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-[#444] rounded-lg bg-white dark:bg-[#0a0a0a] text-sm focus:outline-none focus:ring-1 focus:ring-purple-500" /></div><div><label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Mostrar como</label><input type="text" placeholder="Ej: Ventas Xpand Capital" value={editingSender.from_name || ''} onChange={(e) => setEditingSender({...editingSender, from_name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-[#444] rounded-lg bg-white dark:bg-[#0a0a0a] text-sm focus:outline-none focus:ring-1 focus:ring-purple-500" /></div></div>
      <div><label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Email Remitente</label><input type="email" placeholder="contacto@tuempresa.com" value={editingSender.from_email || ''} onChange={(e) => setEditingSender({...editingSender, from_email: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-[#444] rounded-lg bg-white dark:bg-[#0a0a0a] text-sm focus:outline-none focus:ring-1 focus:ring-purple-500" /></div>
      <div className="border-t border-gray-200 dark:border-[#333] pt-4"><label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">Proveedor de Correo</label><div className="grid grid-cols-3 gap-2">{['smtp', 'resend', 'sendgrid'].map(p => (<button key={p} onClick={() => setEditingSender({...editingSender, provider: p})} className={`p-2 border rounded-lg text-xs font-bold transition-all ${editingSender.provider === p ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600' : 'border-gray-200 dark:border-[#444] text-gray-500 hover:border-gray-300'}`}>{p.toUpperCase()}</button>))}</div></div>
      {editingSender.provider === 'smtp' && (<div className="grid grid-cols-2 gap-3"><div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Servidor SMTP</label><input type="text" placeholder="smtp.gmail.com" value={editingSender.smtp_host || ''} onChange={(e) => setEditingSender({...editingSender, smtp_host: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-[#444] rounded-md bg-white dark:bg-[#0a0a0a] text-sm" /></div><div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Puerto</label><input type="number" placeholder="465" value={editingSender.smtp_port || ''} onChange={(e) => setEditingSender({...editingSender, smtp_port: parseInt(e.target.value) || 465})} className="w-full px-3 py-2 border border-gray-300 dark:border-[#444] rounded-md bg-white dark:bg-[#0a0a0a] text-sm" /></div><div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Usuario</label><input type="text" placeholder="tu@email.com" value={editingSender.smtp_user || ''} onChange={(e) => setEditingSender({...editingSender, smtp_user: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-[#444] rounded-md bg-white dark:bg-[#0a0a0a] text-sm" /></div><div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Contraseña</label><input type="password" placeholder="••••••••" value={editingSender.smtp_pass || ''} onChange={(e) => setEditingSender({...editingSender, smtp_pass: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-[#444] rounded-md bg-white dark:bg-[#0a0a0a] text-sm" /></div></div>)}
      {editingSender.provider !== 'smtp' && (<div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">API Key ({editingSender.provider})</label><input type="password" placeholder="sk_live_..." value={editingSender.api_key || ''} onChange={(e) => setEditingSender({...editingSender, api_key: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-[#444] rounded-md bg-white dark:bg-[#0a0a0a] text-sm font-mono" /></div>)}
      <div className="flex gap-2"><button onClick={() => { setTestResult(null); setEditingSender(null); }} className="flex-1 py-2 border border-gray-300 dark:border-[#444] rounded-lg text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#222]">Cancelar</button><button onClick={async () => { if(!editingSender.nombre || !editingSender.from_email) { alert('Completa nombre y email'); return; } await saveSender(editingSender); setTestResult(null); setEditingSender(null); }} className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-bold">{editingSender.id ? 'Actualizar' : 'Guardar'}</button></div>
    </div>
  );
}

function SmtpGuide() {
  return (
    <div className="space-y-4"><div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 p-4 rounded-xl"><h4 className="text-sm font-bold text-blue-700 dark:text-blue-400 mb-2">Configuración SMTP Común</h4><div className="space-y-3 text-xs text-gray-600 dark:text-gray-400"><div className="grid grid-cols-3 gap-2 p-2 bg-white dark:bg-[#0a0a0a] rounded border border-gray-200 dark:border-[#333]"><div className="font-bold">Gmail</div><div>smtp.gmail.com:587</div><div className="text-gray-400">Requiere App Password</div></div><div className="grid grid-cols-3 gap-2 p-2 bg-white dark:bg-[#0a0a0a] rounded border border-gray-200 dark:border-[#333]"><div className="font-bold">Outlook</div><div>smtp.office365.com:587</div><div className="text-gray-400">Requiere App Password</div></div><div className="grid grid-cols-3 gap-2 p-2 bg-white dark:bg-[#0a0a0a] rounded border border-gray-200 dark:border-[#333]"><div className="font-bold">SendGrid</div><div>smtp.sendgrid.net:587</div><div className="text-gray-400">API Key como password</div></div><div className="grid grid-cols-3 gap-2 p-2 bg-white dark:bg-[#0a0a0a] rounded border border-gray-200 dark:border-[#333]"><div className="font-bold">Mailgun</div><div>smtp.mailgun.org:587</div><div className="text-gray-400">Usuario + Password</div></div></div></div><p className="text-xs text-gray-500 italic">Tu contraseña SMTP se guarda encriptada en nuestra base de datos. Solo se usa para conectar con el servidor de correo.</p></div>
  );
}

export function ZipModal({ show, onClose, zipFiles, onImport }) {
  const [previewIdx, setPreviewIdx] = useState(0);
  if (!show || !zipFiles || zipFiles.length === 0) return null;
  const active = zipFiles[previewIdx];
  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/90 backdrop-blur-md p-4" onClick={() => onClose()}>
      <div className="bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 flex-shrink-0">
          <div><p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">ZIP importado · {zipFiles.length} variante{zipFiles.length !== 1 ? 's' : ''}</p><h3 className="text-sm font-black text-white uppercase">Elige la versión a convertir</h3></div>
          <button onClick={() => onClose()} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 transition-all"><X size={15} /></button>
        </div>
        <div className="flex flex-1 overflow-hidden">
          <div className="w-56 flex-shrink-0 border-r border-white/5 overflow-y-auto p-2 space-y-1">{zipFiles.map((f, i) => (<button key={i} onClick={() => setPreviewIdx(i)} className={`w-full text-left p-3 rounded-xl transition-all ${previewIdx === i ? 'bg-[#82b440]/15 border border-[#82b440]/40' : 'hover:bg-white/[0.03] border border-transparent'}`}><div className="flex items-center gap-1.5 mb-0.5"><p className={`text-[11px] font-black truncate flex-1 ${previewIdx === i ? 'text-[#82b440]' : 'text-white'}`}>{f.name}</p>{f.isRecommended && (<span className="text-[8px] bg-[#82b440] text-black font-black px-1.5 py-0.5 rounded-full flex-shrink-0">✓</span>)}</div><p className="text-[9px] text-gray-500 uppercase tracking-widest">{f.platformLabel}</p>{f.variantCount > 1 && (<p className="text-[9px] text-gray-600 mt-0.5">{f.variantCount} archivos similares</p>)}</button>))}</div>
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.01] flex-shrink-0">
              <div className="flex items-center gap-3"><div className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${active?.platform === 'generic' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'}`}>{active?.platformLabel}</div><p className="text-[11px] text-gray-400 font-mono">{active?.path}</p></div>
              <button onClick={() => onImport(active.htmlContent, active.platformLabel)} className="flex items-center gap-2 px-4 py-2 bg-[#82b440] hover:bg-[#6c9635] text-white rounded-xl text-[11px] font-black uppercase tracking-wide transition-all"><Zap size={12} /> Usar esta versión</button>
            </div>
            <div className="flex-1 overflow-hidden bg-white">{active && (<iframe key={previewIdx} srcDoc={active.previewHtml} className="w-full h-full border-0" sandbox="allow-same-origin" title={active.name} style={{ transform: 'scale(0.75)', transformOrigin: 'top left', width: '133.33%', height: '133.33%' }} />)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Zap({ size }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>;
}

