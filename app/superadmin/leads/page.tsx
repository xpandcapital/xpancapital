"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/Toast";
import { Search, Filter, Download, User, Mail, Phone, Calendar, ChevronDown, X, Check, Eye } from "lucide-react";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

interface Lead {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  whatsapp?: string;
  ciudad?: string;
  presupuesto?: string;
  interes?: string;
  mensaje?: string;
  estado: string;
  etiquetas: string[];
  origen?: string;
  creado_en: string;
  campana_id?: string;
  asesor_id?: string;
  campana?: { id: string; nombre: string };
  asesor?: { id: string; nombre: string };
}

const ESTADOS = [
  { value: 'nuevo', label: 'Nuevo', color: 'bg-blue-500/20 text-blue-400' },
  { value: 'contactado', label: 'Contactado', color: 'bg-amber-500/20 text-amber-400' },
  { value: 'calificado', label: 'Calificado', color: 'bg-emerald-500/20 text-emerald-400' },
  { value: 'cliente', label: 'Cliente', color: 'bg-green-500/20 text-green-400' },
  { value: 'perdido', label: 'Perdido', color: 'bg-red-500/20 text-red-400' },
];

export default function LeadsPage() {
  const { showToast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<string>("");
  const [campanaFilter, setCampanaFilter] = useState<string>("");
  const [campanas, setCampanas] = useState<any[]>([]);
  const [asesorFilter, setAsesorFilter] = useState("");
  const [asesores, setAsesores] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    fetchLeads();
    fetchCampanas();
    fetchAsesores();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (estadoFilter) params.append('estado', estadoFilter);
      if (campanaFilter) params.append('campana_id', campanaFilter);
      if (asesorFilter) params.append('asesor_id', asesorFilter);
      if (search) params.append('search', search);

      const response = await fetch(`/api/leads?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setLeads(data.data || []);
      } else {
        showToast("Error al cargar leads", "error");
      }
    } catch {
      showToast("Error al cargar leads", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchCampanas = async () => {
    try {
      const response = await fetch('/api/campanas');
      const data = await response.json();
      if (data.success) {
        setCampanas(data.data || []);
      }
    } catch {
      // Error silencioso
    }
  };

  const fetchAsesores = async () => {
    try {
      const response = await fetch('/api/asesores');
      const data = await response.json();
      if (data.success) {
        setAsesores(data.data || []);
      }
    } catch {
      // Error silencioso
    }
  };

  const updateLeadEstado = async (id: string, nuevoEstado: string) => {
    try {
      const response = await fetch('/api/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, estado: nuevoEstado })
      });
      const data = await response.json();
      
      if (data.success) {
        setLeads(leads.map(l => l.id === id ? { ...l, estado: nuevoEstado } : l));
        showToast("Estado actualizado", "success");
      } else {
        showToast("Error al actualizar", "error");
      }
    } catch {
      showToast("Error al actualizar", "error");
    }
  };

  const exportCSV = () => {
    const headers = ['Nombre', 'Email', 'Teléfono', 'WhatsApp', 'Ciudad', 'Presupuesto', 'Interés', 'Estado', 'Campaña', 'Asesor', 'Fecha'];
    const rows = leads.map(l => [
      l.nombre,
      l.email || '',
      l.telefono || '',
      l.whatsapp || '',
      l.ciudad || '',
      l.presupuesto || '',
      l.interes || '',
      l.estado,
      l.campana?.nombre || '',
      l.asesor?.nombre || '',
      new Date(l.creado_en).toLocaleDateString()
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getEstadoColor = (estado: string) => {
    return ESTADOS.find(e => e.value === estado)?.color || 'bg-gray-500/20 text-gray-400';
  };

  const filteredLeads = leads.filter(l => {
    if (search) {
      const s = search.toLowerCase();
      if (!l.nombre.toLowerCase().includes(s) && 
          !(l.email?.toLowerCase().includes(s)) && 
          !(l.telefono?.includes(s))) {
        return false;
      }
    }
    return true;
  });

  const openLeadDetail = (lead: Lead) => {
    setSelectedLead(lead);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black">Leads</h1>
            <p className="text-gray-400 text-sm mt-1">Gestiona los leads capturados en formularios</p>
          </div>
          <button
            onClick={exportCSV}
            className="px-5 py-3 bg-white/10 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-white/20 transition-colors"
          >
            <Download className="w-5 h-5" />
            Exportar CSV
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, email o teléfono..."
                className="w-full bg-zinc-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:border-blis-red outline-none"
                onKeyDown={(e) => e.key === 'Enter' && fetchLeads()}
              />
            </div>
          </div>

          <SearchableSelect
            value={estadoFilter}
            onChange={setEstadoFilter}
            placeholder="Todos los estados"
            options={ESTADOS}
          />

          <SearchableSelect
            options={campanas.map((c: any) => ({ value: c.id, label: c.nombre }))}
            value={campanaFilter}
            onChange={setCampanaFilter}
            placeholder="Todas las campañas"
            searchPlaceholder="Buscar campaña..."
            emptyText="Sin campañas"
          />

          <SearchableSelect
            options={asesores.map((a: any) => ({ value: a.id, label: a.nombre }))}
            value={asesorFilter}
            onChange={setAsesorFilter}
            placeholder="Todos los asesores"
            searchPlaceholder="Buscar asesor..."
            emptyText="Sin asesores"
          />

          <button
            onClick={fetchLeads}
            className="px-4 py-3 bg-blis-red text-white rounded-xl font-bold hover:bg-blis-red/80 transition-colors"
          >
            Filtrar
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {ESTADOS.map(e => {
            const count = leads.filter(l => l.estado === e.value).length;
            return (
              <div key={e.value} className="bg-zinc-900/50 border border-white/10 rounded-xl p-4">
                <span className={`text-xs px-2 py-0.5 rounded-full ${e.color}`}>{e.label}</span>
                <p className="text-2xl font-bold mt-2">{count}</p>
              </div>
            );
          })}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blis-red"></div>
          </div>
        )}

        {/* Table */}
        {!loading && (
          <div className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-xs font-bold text-gray-400 uppercase p-4">Lead</th>
                    <th className="text-left text-xs font-bold text-gray-400 uppercase p-4">Contacto</th>
                    <th className="text-left text-xs font-bold text-gray-400 uppercase p-4 hidden md:table-cell">Campaña</th>
                    <th className="text-left text-xs font-bold text-gray-400 uppercase p-4">Estado</th>
                    <th className="text-left text-xs font-bold text-gray-400 uppercase p-4 hidden md:table-cell">Fecha</th>
                    <th className="text-left text-xs font-bold text-gray-400 uppercase p-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blis-red/20 flex items-center justify-center">
                            <User className="w-5 h-5 text-blis-red" />
                          </div>
                          <div>
                            <p className="font-bold text-white">{lead.nombre}</p>
                            {lead.interes && (
                              <p className="text-xs text-gray-400">{lead.interes}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          {lead.email && (
                            <div className="flex items-center gap-1 text-sm text-gray-400">
                              <Mail className="w-3 h-3" />
                              {lead.email}
                            </div>
                          )}
                          {lead.telefono && (
                            <div className="flex items-center gap-1 text-sm text-gray-400">
                              <Phone className="w-3 h-3" />
                              {lead.telefono}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <span className="text-sm text-gray-400">
                          {lead.campana?.nombre || 'Sin campaña'}
                        </span>
                      </td>
                      <td className="p-4">
                        <SearchableSelect
                          value={lead.estado}
                          onChange={(v) => updateLeadEstado(lead.id, v)}
                          options={ESTADOS}
                          className={`text-xs px-2 py-1 rounded-full border border-white/10 cursor-pointer ${getEstadoColor(lead.estado)}`}
                        />
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <div className="flex items-center gap-1 text-sm text-gray-400">
                          <Calendar className="w-4 h-4" />
                          {new Date(lead.creado_en).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => openLeadDetail(lead)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4 text-gray-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredLeads.length === 0 && (
              <div className="text-center py-12">
                <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No hay leads que coincidan con los filtros</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de detalle */}
      {showModal && selectedLead && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-lg my-8">
            <div className="flex justify-between items-center p-6 border-b border-white/10">
              <h2 className="text-xl font-bold">Detalle del Lead</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blis-red/20 flex items-center justify-center">
                  <User className="w-8 h-8 text-blis-red" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedLead.nombre}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getEstadoColor(selectedLead.estado)}`}>
                    {ESTADOS.find(e => e.value === selectedLead.estado)?.label}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedLead.email && (
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Email</label>
                    <p className="text-white">{selectedLead.email}</p>
                  </div>
                )}
                {selectedLead.telefono && (
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Teléfono</label>
                    <p className="text-white">{selectedLead.telefono}</p>
                  </div>
                )}
                {selectedLead.ciudad && (
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Ciudad</label>
                    <p className="text-white">{selectedLead.ciudad}</p>
                  </div>
                )}
                {selectedLead.presupuesto && (
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Presupuesto</label>
                    <p className="text-white">{selectedLead.presupuesto}</p>
                  </div>
                )}
              </div>

              {selectedLead.mensaje && (
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Mensaje</label>
                  <p className="text-white bg-white/5 rounded-lg p-3">{selectedLead.mensaje}</p>
                </div>
              )}

              <div className="border-t border-white/10 pt-4">
                <h4 className="text-sm font-bold text-white mb-3">Información Adicional</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  {selectedLead.campana && (
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Campaña</label>
                      <p className="text-white">{selectedLead.campana.nombre}</p>
                    </div>
                  )}
                  {selectedLead.asesor && (
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Asesor</label>
                      <p className="text-white">{selectedLead.asesor.nombre}</p>
                    </div>
                  )}
                  {selectedLead.origen && (
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Origen</label>
                      <p className="text-white">{selectedLead.origen}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Fecha</label>
                    <p className="text-white">{new Date(selectedLead.creado_en).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {selectedLead.etiquetas && selectedLead.etiquetas.length > 0 && (
                <div className="border-t border-white/10 pt-4">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Etiquetas</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedLead.etiquetas.map((tag, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blis-red/20 text-blis-red text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}