"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Plus, Search, Edit2, Trash2, Image as ImageIcon, ChevronDown, ChevronUp, DollarSign, LayoutGrid, Globe, MapPin, Upload, UsersRound, FolderOpen, RefreshCw, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export type ProjectLot = {
  id: string;
  project_id: string;
  lot_number: string;
  lot_area: number;
  client_name: string;
  total_price: number;
  status: string;
  created_at: string;
};

export type Project = {
  id: string;
  name: string;
  status: string;
  website: string | null;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string | null;
  is_active: boolean;
  created_at: string;
  lots?: ProjectLot[];
};

const STATUS_OPTIONS = [
  'EN PLANOS',
  'PREVENTA',
  'VENTA CON ESCRITURA',
  'VENTA FINALIZADA',
  'PROYECTO ENTREGADO'
];

const LOT_STATUS_OPTIONS = [
  'Disponible',
  'Reservado',
  'Vendido',
  'Desistido'
];

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showLotModal, setShowLotModal] = useState(false);
  const [editingLot, setEditingLot] = useState<ProjectLot | null>(null);
  const [showMassCreate, setShowMassCreate] = useState(false);
  const [massCreateData, setMassCreateData] = useState({ projectId: '', prefix: '', start: 1, count: 10, price: '', metraje: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; type: 'project' | 'lot'; id: string; projectId?: string }>({ isOpen: false, type: 'project', id: '' });

  const [formData, setFormData] = useState({
    name: '',
    id: '',
    status: 'EN PLANOS',
    website: '',
    location: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    logo_url: '',
    primary_color: '#be0b3c',
    secondary_color: ''
  });

  const [lotFormData, setLotFormData] = useState({
    lot_number: '',
    lot_area: 0,
    client_name: '',
    total_price: 0,
    status: 'Disponible'
  });

  const loadProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;

      const projectsWithLots = await Promise.all(
        (projectsData || []).map(async (project) => {
          const { data: lots } = await supabase
            .from('project_lots')
            .select('*')
            .eq('project_id', project.id)
            .order('lot_number');
          return { ...project, lots: lots || [] };
        })
      );

      setProjects(projectsWithLots);
      setError(null);
    } catch (err) {
      console.error('Error loading projects:', err);
      setError(err instanceof Error ? err.message : 'Error loading projects');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const calculateUptime = (startDate: string, endDate?: string) => {
    if (!startDate) return 'Sin fecha';
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();
    if (days < 0) { months--; days += new Date(end.getFullYear(), end.getMonth(), 0).getDate(); }
    if (months < 0) { years--; months += 12; }
    const parts = [];
    if (years > 0) parts.push(`${years} ${years === 1 ? 'año' : 'años'}`);
    if (months > 0) parts.push(`${months} ${months === 1 ? 'mes' : 'meses'}`);
    if (days > 0 || parts.length === 0) parts.push(`${days} ${days === 1 ? 'día' : 'días'}`);
    return parts.join(', ');
  };

  const handleSaveProject = async () => {
    if (!formData.name || !formData.id) return;

    try {
      const projectData = {
        id: formData.id.toUpperCase(),
        name: formData.name,
        status: formData.status,
        website: formData.website || null,
        location: formData.location || null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        logo_url: formData.logo_url || null,
        primary_color: formData.primary_color || '#be0b3c',
        secondary_color: formData.secondary_color || null,
        is_active: true
      };

      if (editingProject) {
        const { error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', editingProject.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('projects')
          .insert([projectData]);
        if (error) throw error;
      }

      await loadProjects();
      setShowModal(false);
      setEditingProject(null);
      setFormData({
        name: '', id: '', status: 'EN PLANOS', website: '', location: '',
        start_date: new Date().toISOString().split('T')[0], end_date: '',
        logo_url: '', primary_color: '#be0b3c', secondary_color: ''
      });
    } catch (err) {
      console.error('Error saving project:', err);
      alert('Error al guardar el proyecto');
    }
  };

  const handleDeleteProject = async () => {
    if (!deleteConfirm.id) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', deleteConfirm.id);

      if (error) throw error;
      await loadProjects();
    } catch (err) {
      console.error('Error deleting project:', err);
      alert('Error al eliminar el proyecto');
    } finally {
      setDeleteConfirm({ isOpen: false, type: 'project', id: '' });
    }
  };

  const handleSaveLot = async () => {
    if (!lotFormData.lot_number || !expandedProject) return;

    try {
      const lotData = {
        project_id: expandedProject,
        lot_number: lotFormData.lot_number,
        lot_area: lotFormData.lot_area || 0,
        client_name: lotFormData.client_name || null,
        total_price: lotFormData.total_price || 0,
        status: lotFormData.status
      };

      if (editingLot) {
        const { error } = await supabase
          .from('project_lots')
          .update(lotData)
          .eq('id', editingLot.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('project_lots')
          .insert([lotData]);
        if (error) throw error;
      }

      await loadProjects();
      setShowLotModal(false);
      setEditingLot(null);
      setLotFormData({ lot_number: '', lot_area: 0, client_name: '', total_price: 0, status: 'Disponible' });
    } catch (err) {
      console.error('Error saving lot:', err);
      alert('Error al guardar el lote');
    }
  };

  const handleDeleteLot = async () => {
    if (!deleteConfirm.id) return;

    try {
      const { error } = await supabase
        .from('project_lots')
        .delete()
        .eq('id', deleteConfirm.id);

      if (error) throw error;
      await loadProjects();
    } catch (err) {
      console.error('Error deleting lot:', err);
      alert('Error al eliminar el lote');
    } finally {
      setDeleteConfirm({ isOpen: false, type: 'lot', id: '' });
    }
  };

  const handleMassCreate = async () => {
    if (!massCreateData.projectId || !massCreateData.prefix) return;

    try {
      const newLots = Array.from({ length: massCreateData.count }, (_, i) => ({
        project_id: massCreateData.projectId,
        lot_number: `${massCreateData.prefix}-${(massCreateData.start + i).toString().padStart(2, '0')}`,
        lot_area: parseFloat(massCreateData.metraje) || 0,
        total_price: parseFloat(massCreateData.price) || 0,
        status: 'Disponible',
        client_name: null
      }));

      const { error } = await supabase
        .from('project_lots')
        .insert(newLots);

      if (error) throw error;
      await loadProjects();
      setShowMassCreate(false);
      setMassCreateData({ projectId: '', prefix: '', start: 1, count: 10, price: '', metraje: '' });
    } catch (err) {
      console.error('Error creating lots:', err);
      alert('Error al crear lotes');
    }
  };

  const openEditProject = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      id: project.id,
      status: project.status,
      website: project.website || '',
      location: project.location || '',
      start_date: project.start_date || new Date().toISOString().split('T')[0],
      end_date: project.end_date || '',
      logo_url: project.logo_url || '',
      primary_color: project.primary_color || '#be0b3c',
      secondary_color: project.secondary_color || ''
    });
    setShowModal(true);
  };

  const openEditLot = (lot: ProjectLot) => {
    setEditingLot(lot);
    setLotFormData({
      lot_number: lot.lot_number,
      lot_area: lot.lot_area || 0,
      client_name: lot.client_name || '',
      total_price: lot.total_price || 0,
      status: lot.status || 'Disponible'
    });
    setShowLotModal(true);
  };

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin w-8 h-8 border-2 border-blis-red border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
              Portafolio de Proyectos
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Gestiona proyectos y sus lotes. La información se sincroniza con Gestión de Lotes.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={loadProjects}
              className="bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Sincronizar
            </button>
            <a
              href="/superadmin/montebello"
              className="bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <FolderOpen className="w-4 h-4" />
              Gestión de Lotes
            </a>
            <a
              href="/superadmin/asesores"
              className="bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <UsersRound className="w-4 h-4" />
              Asesores
            </a>
            <button
              onClick={() => {
                setEditingProject(null);
                setFormData({
                  name: '', id: '', status: 'EN PLANOS', website: '', location: '',
                  start_date: new Date().toISOString().split('T')[0], end_date: '',
                  logo_url: '', primary_color: '#be0b3c', secondary_color: ''
                });
                setShowModal(true);
              }}
              className="bg-blis-red text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:scale-105 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nuevo Proyecto
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar proyectos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-blis-red/50 transition-colors"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Projects List */}
        <div className="space-y-4">
          {filteredProjects.map((project) => {
            const lots = project.lots || [];
            const totalLots = lots.length;
            const availableLots = lots.filter(l => l.status === 'Disponible').length;
            const reservedLots = lots.filter(l => l.status === 'Reservado').length;
            const soldLots = lots.filter(l => l.status === 'Vendido').length;
            const totalIncome = lots
              .filter(l => l.status === 'Vendido' || l.status === 'Reservado')
              .reduce((acc, l) => acc + (l.total_price || 0), 0);
            const potentialTotal = lots.reduce((acc, l) => acc + (l.total_price || 0), 0);

            return (
              <div key={project.id} className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden">
                {/* Project Header */}
                <div
                  className="p-4 md:p-6 cursor-pointer hover:bg-white/[0.02] transition-colors"
                  onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
                >
                  <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
                    {/* Left: Branding & Status */}
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                        {project.logo_url ? (
                          <img src={project.logo_url} alt={project.name} className="w-full h-full object-contain p-1.5" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h2 className="text-lg font-black text-white">{project.name}</h2>
                          {!project.end_date && (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[9px] font-bold uppercase">
                              Activo
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            project.status === 'EN PLANOS' ? 'bg-blue-400/10 text-blue-400' :
                            project.status === 'PREVENTA' ? 'bg-amber-400/10 text-amber-400' :
                            project.status === 'VENTA CON ESCRITURA' ? 'bg-emerald-400/10 text-emerald-400' :
                            project.status === 'VENTA FINALIZADA' ? 'bg-purple-400/10 text-purple-400' :
                            'bg-zinc-400/10 text-zinc-400'
                          }`}>
                            {project.status}
                          </span>
                          <span className="text-gray-600 text-[10px] font-mono">ID: {project.id}</span>
                        </div>
                      </div>
                    </div>

                    {/* Center: Stats */}
                    <div className="flex gap-8 flex-1 justify-center">
                      <div className="text-center">
                        <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Ingresos</p>
                        <p className="text-xl font-black text-white font-mono">
                          ${totalIncome.toLocaleString()}
                          <span className="text-gray-500 text-sm"> / ${potentialTotal.toLocaleString()}</span>
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Disponibles</p>
                        <p className="text-xl font-black text-blue-400">{availableLots} <span className="text-gray-500 text-sm">/ {totalLots}</span></p>
                      </div>
                      <div className="text-center">
                        <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Reservados</p>
                        <p className="text-xl font-black text-amber-400">{reservedLots}</p>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); openEditProject(project); }}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ isOpen: true, type: 'project', id: project.id }); }}
                        className="p-2 bg-white/5 hover:bg-blis-red/20 rounded-lg text-gray-400 hover:text-blis-red transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {expandedProject === project.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Lots Expansion */}
                <AnimatePresence>
                  {expandedProject === project.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/5 bg-black/50"
                    >
                      <div className="p-4 md:p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-sm font-bold text-white uppercase tracking-widest">Lotes ({totalLots})</h3>
                          <div className="flex gap-2">
                            <Link
                              href={`/superadmin/montebello?project=${project.id}`}
                              className="text-[10px] font-bold uppercase px-3 py-1.5 rounded-lg bg-blis-red/10 text-blis-red border border-blis-red/20 hover:bg-blis-red/20 transition-all flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" /> Ver en Gestión
                            </Link>
                            <button
                              onClick={() => { setEditingLot(null); setLotFormData({ lot_number: '', lot_area: 0, client_name: '', total_price: 0, status: 'Disponible' }); setShowLotModal(true); }}
                              className="text-[10px] font-bold uppercase px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" /> Agregar Lote
                            </button>
                            <button
                              onClick={() => { setMassCreateData(prev => ({ ...prev, projectId: project.id })); setShowMassCreate(true); }}
                              className="text-[10px] font-bold uppercase px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 border border-white/10 hover:text-white transition-all"
                            >
                              Crear Masiva
                            </button>
                          </div>
                        </div>

                        {lots.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <p>No hay lotes en este proyecto.</p>
                            <p className="text-xs mt-1">Usa "Crear Masiva" para agregar múltiples lotes de una vez.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                            {lots.map((lot) => (
                              <div
                                key={lot.id}
                                className={`p-3 rounded-lg border ${
                                  lot.status === 'Disponible' ? 'bg-emerald-500/5 border-emerald-500/20' :
                                  lot.status === 'Reservado' ? 'bg-amber-500/5 border-amber-500/20' :
                                  lot.status === 'Vendido' ? 'bg-red-500/5 border-red-500/20' :
                                  'bg-gray-500/5 border-gray-500/20'
                                }`}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <span className="text-[10px] font-black text-white">{lot.lot_number}</span>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => openEditLot(lot)}
                                      className="p-1 hover:bg-white/10 rounded text-gray-500 hover:text-white"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                                <p className="text-xs font-bold text-white">${(lot.total_price || 0).toLocaleString()}</p>
                                <p className="text-[9px] text-gray-500 truncate">{lot.client_name || 'Sin cliente'}</p>
                                <span className={`text-[8px] font-bold uppercase ${
                                  lot.status === 'Disponible' ? 'text-emerald-400' :
                                  lot.status === 'Reservado' ? 'text-amber-400' :
                                  lot.status === 'Vendido' ? 'text-red-400' :
                                  'text-gray-400'
                                }`}>
                                  {lot.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Project Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-lg p-6">
              <h2 className="text-xl font-black text-white mb-6">
                {editingProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 font-bold uppercase tracking-widest">ID del Proyecto</label>
                  <input
                    type="text"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value.toUpperCase() })}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white mt-1"
                    placeholder="MONTANA"
                    disabled={!!editingProject}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-bold uppercase tracking-widest">Nombre</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white mt-1"
                    placeholder="Residencial Montana"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-bold uppercase tracking-widest">Estado</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white mt-1"
                  >
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 font-bold uppercase tracking-widest">Fecha Inicio</label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-bold uppercase tracking-widest">Fecha Fin</label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white mt-1"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-white/5 text-gray-400 rounded-xl font-bold text-sm hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveProject}
                  className="flex-1 py-3 bg-blis-red text-white rounded-xl font-bold text-sm hover:scale-105 transition-all"
                >
                  {editingProject ? 'Guardar Cambios' : 'Crear Proyecto'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lot Modal */}
        {showLotModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-lg p-6">
              <h2 className="text-xl font-black text-white mb-6">
                {editingLot ? 'Editar Lote' : 'Nuevo Lote'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 font-bold uppercase tracking-widest">Número de Lote</label>
                  <input
                    type="text"
                    value={lotFormData.lot_number}
                    onChange={(e) => setLotFormData({ ...lotFormData, lot_number: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white mt-1"
                    placeholder="M-01"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 font-bold uppercase tracking-widest">Precio</label>
                    <input
                      type="number"
                      value={lotFormData.total_price}
                      onChange={(e) => setLotFormData({ ...lotFormData, total_price: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white mt-1"
                      placeholder="15000"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-bold uppercase tracking-widest">Área (m²)</label>
                    <input
                      type="number"
                      value={lotFormData.lot_area}
                      onChange={(e) => setLotFormData({ ...lotFormData, lot_area: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white mt-1"
                      placeholder="300"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-bold uppercase tracking-widest">Cliente</label>
                  <input
                    type="text"
                    value={lotFormData.client_name}
                    onChange={(e) => setLotFormData({ ...lotFormData, client_name: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white mt-1"
                    placeholder="Nombre del cliente (opcional)"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-bold uppercase tracking-widest">Estado</label>
                  <select
                    value={lotFormData.status}
                    onChange={(e) => setLotFormData({ ...lotFormData, status: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white mt-1"
                  >
                    {LOT_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowLotModal(false)}
                  className="flex-1 py-3 bg-white/5 text-gray-400 rounded-xl font-bold text-sm hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveLot}
                  className="flex-1 py-3 bg-blis-red text-white rounded-xl font-bold text-sm hover:scale-105 transition-all"
                >
                  {editingLot ? 'Guardar Cambios' : 'Crear Lote'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mass Create Modal */}
        {showMassCreate && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-lg p-6">
              <h2 className="text-xl font-black text-white mb-6">Creación Masiva de Lotes</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 font-bold uppercase tracking-widest">Prefijo</label>
                    <input
                      type="text"
                      value={massCreateData.prefix}
                      onChange={(e) => setMassCreateData({ ...massCreateData, prefix: e.target.value.toUpperCase() })}
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white mt-1"
                      placeholder="M"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-bold uppercase tracking-widest">Inicio</label>
                    <input
                      type="number"
                      value={massCreateData.start}
                      onChange={(e) => setMassCreateData({ ...massCreateData, start: parseInt(e.target.value) || 1 })}
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white mt-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-bold uppercase tracking-widest">Cantidad de Lotes</label>
                  <input
                    type="number"
                    value={massCreateData.count}
                    onChange={(e) => setMassCreateData({ ...massCreateData, count: parseInt(e.target.value) || 10 })}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 font-bold uppercase tracking-widest">Precio</label>
                    <input
                      type="number"
                      value={massCreateData.price}
                      onChange={(e) => setMassCreateData({ ...massCreateData, price: e.target.value })}
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white mt-1"
                      placeholder="15000"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-bold uppercase tracking-widest">Metraje (m²)</label>
                    <input
                      type="number"
                      value={massCreateData.metraje}
                      onChange={(e) => setMassCreateData({ ...massCreateData, metraje: e.target.value })}
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white mt-1"
                      placeholder="300"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowMassCreate(false)}
                  className="flex-1 py-3 bg-white/5 text-gray-400 rounded-xl font-bold text-sm hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleMassCreate}
                  className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:scale-105 transition-all"
                >
                  Crear {massCreateData.count} Lotes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirm Modal */}
        {deleteConfirm.isOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-md p-6">
              <h2 className="text-xl font-black text-white mb-4">Confirmar Eliminación</h2>
              <p className="text-gray-400 mb-6">
                ¿Estás seguro de que deseas eliminar este {deleteConfirm.type === 'project' ? 'proyecto y todos sus lotes' : 'lote'}?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm({ isOpen: false, type: 'project', id: '' })}
                  className="flex-1 py-3 bg-white/5 text-gray-400 rounded-xl font-bold text-sm hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={deleteConfirm.type === 'project' ? handleDeleteProject : handleDeleteLot}
                  className="flex-1 py-3 bg-blis-red text-white rounded-xl font-bold text-sm hover:scale-105 transition-all"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}