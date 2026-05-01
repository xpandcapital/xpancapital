"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Plus, Search, Edit2, Trash2, Image as ImageIcon, ChevronDown, ChevronUp, DollarSign, LayoutGrid, Globe, MapPin, Upload, UsersRound, FolderOpen, RefreshCw, ExternalLink, Table2, Save, X, Link2, Loader2, Download, List, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import logger from '@/lib/utils/logger';
import { useActionGuard } from '@/hooks/useActionGuard';

export type ProjectLot = {
  id: string;
  project_id: string;
  lot_number: string;
  lot_area: number;
  client_name: string;
  total_price: number;
  status: string;
  created_at: string;
  payments?: Array<{ month: string; actual: number; expected: number; paymentDate?: string }>;
  initial_payments?: Array<{ description: string; expected: number; actual: number; paymentDate?: string }>;
};

export type Project = {
  id: string;
  name: string;
  status: string;
  website: string | null;
  location: string | null;
  description: string | null;
  cover_image: string | null;
  gallery_images: string[];
  start_date: string | null;
  end_date: string | null;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string | null;
  is_active: boolean;
  order_index: number | null;
  created_at: string;
  notion_database_id?: string | null;
  notion_receipts_database_id?: string | null;
  notion_last_sync?: string | null;
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

const getLotRealStatus = (lot: ProjectLot): string => {
  if (lot.client_name && lot.client_name !== 'No especificado' && lot.client_name !== '' && lot.client_name !== 'No especificado ') {
    return 'Vendido';
  }
  if (lot.status === 'Reservado') {
    return 'Reservado';
  }
  if (lot.status === 'Desistido') {
    return 'Desistido';
  }
  return 'Disponible';
};

const getFirstPaymentDate = (lot: ProjectLot): string | null => {
  if (lot.initial_payments && lot.initial_payments.length > 0) {
    const firstInitial = lot.initial_payments.find(p => p.paymentDate && p.actual > 0);
    if (firstInitial?.paymentDate) {
      return firstInitial.paymentDate;
    }
  }
  if (lot.payments && lot.payments.length > 0) {
    const firstPayment = lot.payments.find(p => p.paymentDate && p.actual > 0);
    if (firstPayment?.paymentDate) {
      return firstPayment.paymentDate;
    }
  }
  return null;
};

// Helper para convertir nombre de proyecto a slug
const getProjectSlug = (name: string) => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

export default function AdminProjects() {
  const router = useRouter();
  const { guard } = useActionGuard();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    id: '',
    status: 'EN PLANOS',
    website: '',
    location: '',
    description: '',
    cover_image: '',
    gallery_images: [] as string[],
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    logo_url: '',
    primary_color: '#be0b3c',
    secondary_color: ''
  });

  // ── Vista y exportación ───────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const exportCSV = () => {
    const headers = ['Proyecto', 'ID', 'Estado', 'Ubicación', 'Lotes Total', 'Vendidos', 'Disponibles', 'Inicio', 'Fin'];
    const rows = filteredProjects.map(p => {
      const lots = (p.lots || []).filter((l: any) => !l.lot_number?.toLowerCase().includes('desistido') && l.status !== 'Desistido');
      const sold = lots.filter((l: any) => l.status === 'Vendido' || (l.client_name && l.client_name !== 'No especificado')).length;
      return [p.name, p.id, p.status, p.location || '', lots.length, sold, lots.length - sold, p.start_date || '', p.end_date || ''];
    });
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `proyectos-${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

// ── Notion sync state ────────────────────────────────────────────────────────
const [notionModal, setNotionModal] = useState<Project | null>(null);
const [notionDbId, setNotionDbId] = useState('');
const [notionReceiptsDbId, setNotionReceiptsDbId] = useState('');
const [notionSyncing, setNotionSyncing] = useState(false);
const [notionResult, setNotionResult] = useState<any>(null);
const [notionReceiptsResult, setNotionReceiptsResult] = useState<any>(null);
const [aiParsing, setAiParsing] = useState(false);
const [aiParseResult, setAiParseResult] = useState<any>(null);
  
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const uploadImage = async (file: File, folder: string = 'projects'): Promise<string | null> => {
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('folder', folder);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload
      });
      
      const data = await response.json();
      if (data.success && data.url) {
        return data.url;
      }
      throw new Error(data.error || 'Upload failed');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error al subir la imagen');
      return null;
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingCover(true);
    const url = await uploadImage(file, 'projects');
    if (url) {
      setFormData({ ...formData, cover_image: url });
    }
    setUploadingCover(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingLogo(true);
    const url = await uploadImage(file, 'projects');
    if (url) {
      setFormData({ ...formData, logo_url: url });
    }
    setUploadingLogo(false);
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploadingGallery(true);
    const newUrls: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const url = await uploadImage(files[i], 'projects');
      if (url) {
        newUrls.push(url);
      }
    }
    
    setFormData({ 
      ...formData, 
      gallery_images: [...formData.gallery_images, ...newUrls] 
    });
    setUploadingGallery(false);
  };

const loadProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/projects');
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Error loading projects');
      const projectsWithLots = (json.data || []).map((p: any) => ({
        ...p,
        lots: p.lots || [],
        gallery_images: p.gallery_images || [],
      }));
      setProjects(projectsWithLots);
      setError(null);
    } catch (err) {
      logger.error('[Proyectos] Error loading projects:', err);
      setError(err instanceof Error ? err.message : 'Error loading projects');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleSaveProject = async () => {
    if (!guard('proyectos', editingProject ? 'editar' : 'crear')) return;
    if (!formData.name || !formData.id) return;

    try {
      const projectData = {
        id: formData.id.toUpperCase(),
        name: formData.name,
        status: formData.status,
        website: formData.website || null,
        location: formData.location || null,
        description: formData.description || null,
        cover_image: formData.cover_image || null,
        gallery_images: formData.gallery_images,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        logo_url: formData.logo_url || null,
        primary_color: formData.primary_color || '#be0b3c',
        secondary_color: formData.secondary_color || null,
        is_active: true,
        order_index: editingProject ? editingProject.order_index : 0,
      };

      const res = await fetch(`/api/admin/projects${editingProject ? `/${editingProject.id}` : ''}`, {
        method: editingProject ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Error al guardar');

      await loadProjects();
      setShowModal(false);
      setEditingProject(null);
      setFormData({
        name: '', id: '', status: 'EN PLANOS', website: '', location: '',
        description: '', cover_image: '', gallery_images: [],
        start_date: new Date().toISOString().split('T')[0], end_date: '',
        logo_url: '', primary_color: '#be0b3c', secondary_color: ''
      });
    } catch (err) {
      console.error('Error saving project:', err);
      alert('Error al guardar el proyecto');
    }
  };

  const openEditProject = (project: Project) => {
    if (!guard('proyectos', 'editar')) return;
    setEditingProject(project);
    setFormData({
      name: project.name,
      id: project.id,
      status: project.status,
      website: project.website || '',
      location: project.location || '',
      description: project.description || '',
      cover_image: project.cover_image || '',
      gallery_images: project.gallery_images || [],
      start_date: project.start_date || new Date().toISOString().split('T')[0],
      end_date: project.end_date || '',
      logo_url: project.logo_url || '',
      primary_color: project.primary_color || '#be0b3c',
      secondary_color: project.secondary_color || ''
    });
    setShowModal(true);
  };

const extractNotionId = (input: string): string | null => {
let id = input.trim();
const idMatch = id.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})|([a-f0-9]{32})/i);
if (idMatch) {
id = idMatch[0].replace(/-/g, '');
return `${id.slice(0,8)}-${id.slice(8,12)}-${id.slice(12,16)}-${id.slice(16,20)}-${id.slice(20)}`;
}
return null;
};

const handleNotionSync = async () => {
if (!notionModal) return;
if (!notionDbId.trim()) {
setNotionResult({ success: false, error: 'Ingresa el ID de la base de datos de Lotes' });
return;
}
setNotionSyncing(true);
setNotionResult(null);
setNotionReceiptsResult(null);
try {
const dbId = extractNotionId(notionDbId);
if (!dbId) {
setNotionResult({ success: false, error: 'ID de base de datos inválido' });
setNotionSyncing(false);
return;
}

// Sincronizar lotes
const res = await fetch('/api/notion/sync', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ project_id: notionModal.id, database_id: dbId }),
});
const data = await res.json();
setNotionResult(data);

// Sincronizar recibos si hay database ID de recibos
      if (notionReceiptsDbId.trim()) {
        setNotionResult((prev: any) => ({ ...prev, message: 'Sincronizando recibos...' }));
        const receiptsDbId = extractNotionId(notionReceiptsDbId);
        if (receiptsDbId) {
          try {
            const receiptsRes = await fetch('/api/notion/sync-receipts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ project_id: notionModal.id, receipts_database_id: receiptsDbId }),
            });
            const receiptsData = await receiptsRes.json();
            setNotionReceiptsResult(receiptsData);
            
            // Si los recibos se sincronizaron bien, sincronizar pagos
            if (receiptsData.success && receiptsData.linked > 0) {
              setNotionResult((prev: any) => ({ ...prev, message: 'Mapeando pagos a lotes...' }));
              const paymentsRes = await fetch('/api/notion/sync-lot-payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ project_id: notionModal.id }),
              });
              const paymentsData = await paymentsRes.json();
              
              if (paymentsData.success) {
                setNotionReceiptsResult((prev: any) => ({
                  ...prev,
                  payments_mapped: paymentsData.lots_updated,
                  message: `${paymentsData.lots_updated} lotes actualizados con pagos`
                }));
              }
            }
          } catch (err: any) {
            setNotionReceiptsResult({ success: false, error: err.message });
          }
        }
      }

if (data.success) {
        // Guardar IDs de Notion en Supabase
        try {
          await supabase
            .from('projects')
            .update({
              notion_database_id: dbId,
              notion_receipts_database_id: notionReceiptsDbId.trim() ? extractNotionId(notionReceiptsDbId) : null,
              notion_last_sync: new Date().toISOString()
            })
            .eq('id', notionModal.id);
        } catch (e) {
          console.error('Error guardando IDs de Notion:', e);
        }
        loadProjects();
}
} catch (err: any) {
setNotionResult({ success: false, error: err.message });
}
setNotionSyncing(false);
};

// ── Análisis AI del campo "Forma de Pago" ─────────────────────────────────────
const handleAIParse = async () => {
  if (!notionModal) return;
  
  // Obtener API key de múltiples fuentes
  let geminiKey = localStorage.getItem('gemini_key');
  
  if (!geminiKey) {
    const configStr = localStorage.getItem('blis_ai_config');
    if (configStr) {
      try {
        const config = JSON.parse(configStr);
        geminiKey = config.gemini_key || config.gemini || null;
      } catch {}
    }
  }
  
  // También intentar desde blis_config (formato usado en api-nube)
  if (!geminiKey) {
    const configStr = localStorage.getItem('blis_config');
    if (configStr) {
      try {
        const config = JSON.parse(configStr);
        geminiKey = config.gemini_key || null;
      } catch {}
    }
  }
  
if (!geminiKey || geminiKey.trim() === '') {
     setAiParseResult({ 
       success: false, 
       error: 'No tienes configurada una API Key de Gemini. Ve a Configuración → API Keys → Gemini, ingresa tu key y guarda.' 
     });
     return;
   }
   
   logger.debug('[AI Parse] Usando API key:', geminiKey.substring(0, 15) + '...');
  
  setAiParsing(true);
  setAiParseResult(null);
  
  try {
    const res = await fetch('/api/notion/parse-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        project_id: notionModal.id,
        gemini_api_key: geminiKey
      }),
});
     
     const data = await res.json();
     logger.debug('[AI Parse] Respuesta:', data);
     setAiParseResult(data);
    
    // Si fue exitoso, recargar los proyectos para ver los cambios
    if (data.success) {
      loadProjects();
    }
  } catch (err: any) {
    logger.error('[AI Parse] Error:', err);
    setAiParseResult({ success: false, error: err.message });
  }
  
  setAiParsing(false);
};

  const handleDeleteProject = async (project: Project) => {
    if (!guard('proyectos', 'eliminar')) return;
    if (!confirm(`¿Eliminar el proyecto "${project.name}"?\n\nEsta acción eliminará también todos sus lotes y no se puede deshacer.`)) return;
    try {
      const res = await fetch(`/api/admin/projects/${project.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Error al eliminar');
      setProjects(prev => prev.filter(p => p.id !== project.id));
    } catch (err: any) {
      alert('Error al eliminar: ' + (err.message || 'Error desconocido'));
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'EN PLANOS': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'PREVENTA': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'VENTA CON ESCRITURA': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'VENTA FINALIZADA': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'PROYECTO ENTREGADO': return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
      default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  const getLotStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Vendido': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'Disponible':
      case 'Activo': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Reservado': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Desistido': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  const addGalleryImage = (url: string) => {
    if (url && !formData.gallery_images.includes(url)) {
      setFormData({ ...formData, gallery_images: [...formData.gallery_images, url] });
    }
  };

  const removeGalleryImage = (index: number) => {
    setFormData({
      ...formData,
      gallery_images: formData.gallery_images.filter((_, i) => i !== index)
    });
  };

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-white/10 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-[1800px] mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-3 font-medium">Administración</p>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-3">
                Portafolio de <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">Proyectos</span>
              </h1>
              <p className="text-white/40 text-sm max-w-xl">
                Gestiona proyectos inmobiliarios: imágenes, descripciones y colores para la landing.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={loadProjects} className="group px-5 py-3 bg-[#0a0a0a] border border-white/5 rounded-2xl text-white/60 hover:text-white hover:border-white/10 transition-all duration-300 flex items-center gap-2.5">
                <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Sincronizar</span>
              </button>
              <Link href="/superadmin/gestion-lotes/_none_" className="px-5 py-3 bg-[#0a0a0a] border border-white/5 rounded-2xl text-white/60 hover:text-white hover:border-white/10 transition-all duration-300 flex items-center gap-2.5">
                <FolderOpen className="w-4 h-4" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Gestión de Lotes</span>
              </Link>
              {/* Toggle vista */}
              <div className="flex bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden">
                <button onClick={() => setViewMode('grid')} className={`px-4 py-3 transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'}`} title="Vista cuadrícula">
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button onClick={() => setViewMode('list')} className={`px-4 py-3 transition-all ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'}`} title="Vista lista">
                  <Table2 className="w-4 h-4" />
                </button>
              </div>
              {/* Exportar CSV */}
              <button onClick={exportCSV} className="px-5 py-3 bg-[#0a0a0a] border border-white/5 rounded-2xl text-white/60 hover:text-white hover:border-white/10 transition-all flex items-center gap-2.5">
                <Download className="w-4 h-4" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Exportar</span>
              </button>
              <button onClick={() => { setEditingProject(null); setFormData({ name: '', id: '', status: 'EN PLANOS', website: '', location: '', description: '', cover_image: '', gallery_images: [], start_date: new Date().toISOString().split('T')[0], end_date: '', logo_url: '', primary_color: '#be0b3c', secondary_color: '' }); router.push('/superadmin/proyectos/new'); }} className="px-6 py-3 bg-blis-red rounded-2xl text-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center gap-2.5 shadow-lg shadow-blis-red/20">
                <Plus className="w-4 h-4" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Nuevo Proyecto</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-white/30 group-focus-within:text-white/50 transition-colors" />
            </div>
            <input type="text" placeholder="Buscar proyectos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#0a0a0a] border border-white/5 rounded-3xl pl-14 pr-6 py-4 text-white placeholder-white/30 focus:outline-none focus:border-white/10 focus:bg-[#0c0c0c] transition-all duration-300 text-sm" />
          </div>
        </div>

        {/* Vista Lista */}
        {viewMode === 'list' && (
          <div className="mb-6 overflow-hidden rounded-3xl border border-white/5">
            <table className="w-full">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  {['Proyecto', 'Estado', 'Ubicación', 'Lotes', 'Vendidos', 'Disponibles', 'Acciones'].map(h => (
                    <th key={h} className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-widest text-white/30">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {filteredProjects.map(project => {
                  const lots = (project.lots || []).filter((l: any) =>
                    !l.lot_number?.toLowerCase().includes('desistido') &&
                    !l.lot_number?.toLowerCase().includes('cancelado') &&
                    l.status !== 'Desistido'
                  );
                  const sold = lots.filter((l: any) => l.status === 'Vendido' || (l.client_name && l.client_name !== 'No especificado' && l.client_name !== '')).length;
                  const available = lots.length - sold;
                  return (
                    <tr key={project.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {project.cover_image && <img src={project.cover_image} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />}
                          <div>
                            <p className="text-sm font-bold text-white">{project.name}</p>
                            <p className="text-[10px] text-white/30 font-mono">{project.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase ${getStatusBadgeColor(project.status)}`}>{project.status}</span>
                      </td>
                      <td className="px-5 py-4 text-sm text-white/50">{project.location || '—'}</td>
                      <td className="px-5 py-4 text-sm font-black text-white">{lots.length}</td>
                      <td className="px-5 py-4 text-sm font-black text-emerald-400">{sold}</td>
                      <td className="px-5 py-4 text-sm font-black text-amber-400">{available}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => router.push(`/superadmin/proyectos/${project.id}`)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all" title="Editar"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => {
                            const slug = getProjectSlug(project.name);
                            router.push(`/superadmin/gestion-lotes/${slug}`);
                          }} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all" title="Gestión de lotes"><FolderOpen className="w-3.5 h-3.5" /></button>
                          <button onClick={() => { setNotionModal(project); setNotionDbId((project as any).notion_database_id || ''); setNotionReceiptsDbId((project as any).notion_receipts_database_id || ''); setNotionResult(null); setNotionReceiptsResult(null); }} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all" title="Sincronizar Notion"><RefreshCw className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDeleteProject(project)} className="p-2 rounded-xl bg-red-500/5 hover:bg-red-500/10 text-red-500/50 hover:text-red-400 transition-all" title="Eliminar"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Projects Grid */}
        {viewMode === 'grid' && <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
  const lots = (project.lots || []).filter((l: ProjectLot) =>
    // Excluir lotes de control interno (desistidos, cancelados, etc.)
    !l.lot_number?.toLowerCase().includes('desistido') &&
    !l.lot_number?.toLowerCase().includes('cancelado') &&
    l.status !== 'Desistido'
  );
  const soldLots = lots.filter((l: ProjectLot) =>
    l.status === 'Vendido' || (
      l.client_name &&
      l.client_name !== 'No especificado' &&
      l.client_name !== ''
    )
  ).length;
  const totalLots = lots.length;
            
            return (
              <motion.div key={project.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden hover:border-white/10 transition-all duration-500 group">
                {/* Cover Image */}
                <div className="relative h-48 bg-gradient-to-br from-white/5 to-white/[0.02] overflow-hidden">
                  {project.cover_image ? (
                    <img src={project.cover_image} alt={project.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-white/10" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider ${getStatusBadgeColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg border border-white/20" style={{ backgroundColor: project.primary_color }} title="Color primario" />
                      {project.secondary_color && <div className="w-6 h-6 rounded-lg border border-white/20" style={{ backgroundColor: project.secondary_color }} title="Color secundario" />}
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-white">{project.name}</h3>
                      <p className="text-xs text-white/40 font-mono">ID: {project.id}</p>
                    </div>
                    {project.logo_url && (
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center overflow-hidden">
                        <img src={project.logo_url} alt={project.name} className="w-full h-full object-contain p-1" />
                      </div>
                    )}
                  </div>
                  
                  {project.description && (
                    <p className="text-sm text-white/50 mb-4 line-clamp-2">{project.description}</p>
                  )}
                  
                  {/* Gallery Preview */}
                  {(project.gallery_images?.length || 0) > 0 && (
                    <div className="flex gap-1.5 mb-4 overflow-hidden">
                      {project.gallery_images.slice(0, 4).map((img, i) => (
                        <div key={i} className="w-12 h-12 rounded-lg bg-white/5 overflow-hidden flex-shrink-0">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                      {project.gallery_images.length > 4 && (
                        <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs text-white/40">+{project.gallery_images.length - 4}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1">
                      <p className="text-[9px] uppercase tracking-widest text-white/30 mb-1">Vendidos</p>
                      <p className="text-xl font-black text-white">{soldLots}<span className="text-white/30 text-sm">/{totalLots}</span></p>
                    </div>
                    {project.location && (
                      <div className="flex-1">
                        <p className="text-[9px] uppercase tracking-widest text-white/30 mb-1">Ubicación</p>
                        <p className="text-sm text-white/70 truncate">{project.location}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button onClick={() => router.push(`/superadmin/proyectos/${project.id}`)} className="flex-1 py-2.5 bg-white/5 border border-white/5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 hover:border-white/10 transition-all duration-300 flex items-center justify-center gap-2">
                      <Edit2 className="w-3.5 h-3.5" />
                      <span className="text-[10px] uppercase tracking-widest font-bold">Editar</span>
                    </button>
                    {project.website && (
                      <a href={project.website} target="_blank" rel="noopener noreferrer" className="py-2.5 px-3 bg-white/5 border border-white/5 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all duration-300">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button onClick={() => {
                      const slug = getProjectSlug(project.name);
                      router.push(`/superadmin/gestion-lotes/${slug}`);
                    }} className="py-2.5 px-3 bg-white/5 border border-white/5 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all duration-300">
                      <FolderOpen className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => { setNotionModal(project); setNotionDbId((project as any).notion_database_id || ''); setNotionReceiptsDbId((project as any).notion_receipts_database_id || ''); setNotionResult(null); setNotionReceiptsResult(null); }}
                      className="py-2.5 px-3 bg-white/5 border border-white/5 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all duration-300"
                      title="Sincronizar con Notion"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project)}
                      className="py-2.5 px-3 bg-red-500/5 border border-red-500/10 rounded-xl text-red-500/50 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all duration-300"
                      title="Eliminar proyecto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>}

        {/* Empty State */}
        {filteredProjects.length === 0 && !isLoading && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/5">
              <LayoutGrid className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No se encontraron proyectos</h3>
            <p className="text-white/40 text-sm">{searchTerm ? 'Intenta con otra búsqueda' : 'Comienza creando tu primer proyecto'}</p>
          </div>
        )}

        {/* Project Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#0a0a0a] border border-white/5 rounded-3xl w-full max-w-4xl my-8 shadow-2xl">
              {/* Modal Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white">{editingProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}</h2>
                  <p className="text-white/40 text-sm mt-1">Configura el proyecto para mostrar en la landing</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 bg-white/5 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Modal Body - Horizontal Layout */}
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {/* Basic Info */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                      <h4 className="text-xs uppercase tracking-widest text-white/40 mb-4 font-bold">Información Básica</h4>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] uppercase tracking-widest text-white/40 font-medium block mb-2">ID del Proyecto</label>
                            <input type="text" value={formData.id} onChange={(e) => setFormData({ ...formData, id: e.target.value.toUpperCase() })} className="w-full bg-[#050505] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/10 transition-colors placeholder-white/20" placeholder="MONTANA" />
                            {editingProject && <p className="text-[9px] text-amber-400/60 mt-1">⚠️ Cambiar el ID creará un nuevo proyecto</p>}
                          </div>
                          <div>
                            <label className="text-[10px] uppercase tracking-widest text-white/40 font-medium block mb-2">Estado</label>
                            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full bg-[#050505] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/10 transition-colors appearance-none">
                              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-[10px] uppercase tracking-widest text-white/40 font-medium block mb-2">Nombre</label>
                          <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-[#050505] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/10 transition-colors placeholder-white/20" placeholder="Residencial Montana" />
                        </div>
                        
                        <div>
                          <label className="text-[10px] uppercase tracking-widest text-white/40 font-medium block mb-2">Descripción</label>
                          <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full bg-[#050505] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/10 transition-colors placeholder-white/20 resize-none" placeholder="Descripción corta para mostrar en la landing..." />
                        </div>
                      </div>
                    </div>
                    
                    {/* Links */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                      <h4 className="text-xs uppercase tracking-widest text-white/40 mb-4 font-bold">Enlaces</h4>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] uppercase tracking-widest text-white/40 font-medium block mb-2"><Globe className="w-3 h-3 inline mr-1" /> Website</label>
                          <input type="url" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} className="w-full bg-[#050505] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/10 transition-colors placeholder-white/20" placeholder="https://blis.estate/montana" />
                        </div>
                        
                        <div>
                          <label className="text-[10px] uppercase tracking-widest text-white/40 font-medium block mb-2"><MapPin className="w-3 h-3 inline mr-1" /> Ubicación (Maps)</label>
                          <input type="url" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full bg-[#050505] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/10 transition-colors placeholder-white/20" placeholder="https://maps.google.com/?q=..." />
                        </div>
                      </div>
                    </div>
                    
                    {/* Colors */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                      <h4 className="text-xs uppercase tracking-widest text-white/40 mb-4 font-bold">Colores del Proyecto</h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] uppercase tracking-widest text-white/40 font-medium block mb-2">Color Primario</label>
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <input type="color" value={formData.primary_color || '#be0b3c'} onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })} className="w-14 h-14 rounded-xl border border-white/5 cursor-pointer bg-transparent" />
                              <div className="absolute inset-0 rounded-xl border-2 border-white/10 pointer-events-none" />
                            </div>
                            <div className="flex-1">
                              <input type="text" value={formData.primary_color} onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })} className="w-full bg-[#050505] border border-white/5 rounded-xl px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-white/10 transition-colors" placeholder="#be0b3c" />
                              <div className="mt-1.5 h-6 rounded-lg border border-white/5" style={{ backgroundColor: formData.primary_color || '#be0b3c' }} />
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] uppercase tracking-widest text-white/40 font-medium block mb-2">Color Secundario</label>
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <input type="color" value={formData.secondary_color || '#000000'} onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })} className="w-14 h-14 rounded-xl border border-white/5 cursor-pointer bg-transparent" />
                              <div className="absolute inset-0 rounded-xl border-2 border-white/10 pointer-events-none" />
                            </div>
                            <div className="flex-1">
                              <input type="text" value={formData.secondary_color || ''} onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })} className="w-full bg-[#050505] border border-white/5 rounded-xl px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-white/10 transition-colors" placeholder="#000000" />
                              <div className="mt-1.5 h-6 rounded-lg border border-white/5" style={{ backgroundColor: formData.secondary_color || '#000000' }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Column */}
                  <div className="space-y-4">
{/* Images */}
                     <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                       <h4 className="text-xs uppercase tracking-widest text-white/40 mb-4 font-bold">Imágenes</h4>
                       
                       <div className="space-y-4">
                         {/* Logo */}
                         <div>
                           <label className="text-[10px] uppercase tracking-widest text-white/40 font-medium block mb-2">Logo</label>
                           <div className="flex gap-2 items-center">
                             <input type="url" value={formData.logo_url || ''} onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })} className="flex-1 bg-[#050505] border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/10 transition-colors placeholder-white/20" placeholder="URL o subir archivo" />
                             <label className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-all flex items-center gap-2">
                               {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin text-white/60" /> : <Upload className="w-4 h-4 text-white/60" />}
                               <span className="text-[10px] text-white/60">Subir</span>
                               <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" disabled={uploadingLogo} />
                             </label>
                             {formData.logo_url && (
                               <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 overflow-hidden flex-shrink-0">
                                 <img src={formData.logo_url} alt="Logo" className="w-full h-full object-contain p-1" />
                               </div>
                             )}
                           </div>
                         </div>
                         
                         {/* Cover Image */}
                         <div>
                           <label className="text-[10px] uppercase tracking-widest text-white/40 font-medium block mb-2">Imagen de Portada</label>
                           <div className="flex gap-2 items-center">
                             <input type="url" value={formData.cover_image || ''} onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })} className="flex-1 bg-[#050505] border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/10 transition-colors placeholder-white/20" placeholder="URL o subir archivo" />
                             <label className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-all flex items-center gap-2">
                               {uploadingCover ? <Loader2 className="w-4 h-4 animate-spin text-white/60" /> : <Upload className="w-4 h-4 text-white/60" />}
                               <span className="text-[10px] text-white/60">Subir</span>
                               <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" disabled={uploadingCover} />
                             </label>
                             {formData.cover_image && (
                               <div className="w-20 h-12 rounded-xl bg-white/5 border border-white/5 overflow-hidden flex-shrink-0">
                                 <img src={formData.cover_image} alt="Cover" className="w-full h-full object-cover" />
                               </div>
                             )}
                           </div>
                         </div>
                         
                         {/* Gallery */}
                         <div>
                           <label className="text-[10px] uppercase tracking-widest text-white/40 font-medium block mb-2">Galería de Imágenes ({formData.gallery_images?.length || 0})</label>
                           
                           {/* Upload multiple files */}
                           <div className="flex gap-2 mb-3">
                             <input type="url" id="gallery-input" placeholder="URL de imagen para agregar..." className="flex-1 bg-[#050505] border border-white/5 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-white/10 transition-colors placeholder-white/20" onKeyDown={(e) => { if (e.key === 'Enter') { const input = e.target as HTMLInputElement; addGalleryImage(input.value); input.value = ''; } }} />
                             <label className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-all flex items-center gap-2">
                               {uploadingGallery ? <Loader2 className="w-4 h-4 animate-spin text-white/60" /> : <Upload className="w-4 h-4 text-white/60" />}
                               <span className="text-[10px] text-white/60">Subir</span>
                               <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" disabled={uploadingGallery} />
                             </label>
                             <button onClick={() => { const input = document.getElementById('gallery-input') as HTMLInputElement; addGalleryImage(input.value); input.value = ''; }} className="px-4 py-2.5 bg-blis-red/20 border border-blis-red/30 rounded-xl text-blis-red hover:bg-blis-red/30 transition-all">
                               <Plus className="w-4 h-4" />
                             </button>
                           </div>
                           
                           {/* Gallery Grid */}
                           <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                             {(formData.gallery_images || []).map((img, i) => (
                               <div key={i} className="relative group">
                                 <div className="aspect-square rounded-xl bg-white/5 border border-white/5 overflow-hidden">
                                   <img src={img} alt="" className="w-full h-full object-cover" />
                                 </div>
                                 <button onClick={() => removeGalleryImage(i)} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                               </div>
                             ))}
                             {(!formData.gallery_images || formData.gallery_images.length === 0) && (
                               <div className="col-span-4 py-8 text-center text-white/20 text-sm">
                                 Sube archivos o agrega URLs de imágenes para la galería
                               </div>
                             )}
                           </div>
                         </div>
                       </div>
                     </div>
                    
                    {/* Dates */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                      <h4 className="text-xs uppercase tracking-widest text-white/40 mb-4 font-bold">Fechas</h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] uppercase tracking-widest text-white/40 font-medium block mb-2">Fecha Inicio</label>
                          <input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className="w-full bg-[#050505] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/10 transition-colors" />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase tracking-widest text-white/40 font-medium block mb-2">Fecha Fin</label>
                          <input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} className="w-full bg-[#050505] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/10 transition-colors" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Modal Footer */}
              <div className="p-6 border-t border-white/5 flex gap-3">
                <button onClick={() => setShowModal(false)} className="flex-1 py-3 bg-white/5 border border-white/5 rounded-2xl text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300 font-bold text-[11px] uppercase tracking-[0.2em]">
                  Cancelar
                </button>
                <button onClick={handleSaveProject} className="flex-1 py-3 bg-blis-red rounded-2xl text-white hover:scale-[1.01] transition-all duration-300 font-bold text-[11px] uppercase tracking-[0.2em]">
                  {editingProject ? 'Guardar Cambios' : 'Crear Proyecto'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
{/* ── MODAL SINCRONIZACIÓN NOTION ───────────────────────────────────────── */}
{notionModal && (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={() => !notionSyncing && setNotionModal(null)}>
<div className="bg-[#0a0a0a] border border-white/10 rounded-3xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
{/* Header */}
<div className="flex items-center justify-between px-5 py-4 border-b border-white/5shrink-0">
<div>
<p className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Notion Sync</p>
<h3 className="text-sm font-black text-white">{notionModal.name}</h3>
</div>
<button onClick={() => !notionSyncing && setNotionModal(null)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 disabled:opacity-50" disabled={notionSyncing}>
<X className="w-4 h-4" />
</button>
</div>

<div className="p-5 space-y-4 overflow-y-auto">
{/* Inputs */}
<div className="space-y-3">
<div>
<label className="text-[9px] uppercase tracking-widest text-white/40 font-bold block mb-1.5">URL de Lotes *</label>
<input
value={notionDbId}
onChange={e => setNotionDbId(e.target.value)}
placeholder="https://notion.so/Lotes-..."
className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 outline-none focus:border-white/20 font-mono"
disabled={notionSyncing}
/>
</div>
<div>
<label className="text-[9px] uppercase tracking-widest text-white/40 font-bold block mb-1.5">URL de Recibos (opcional)</label>
<input
value={notionReceiptsDbId}
onChange={e => setNotionReceiptsDbId(e.target.value)}
placeholder="https://notion.so/Recibos-..."
className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 outline-none focus:border-white/20 font-mono"
disabled={notionSyncing}
/>
</div>
</div>

{/* Syncing Animation */}
{notionSyncing && (
<div className="flex flex-col items-center justify-center py-6 space-y-3">
<Loader2 className="w-8 h-8 text-blis-red animate-spin" />
<p className="text-xs text-white/60">Sincronizando con Notion...</p>
</div>
)}

{/* Resultado Lotes */}
{notionResult && !notionSyncing && (
<div className={`rounded-xl p-3 border ${notionResult.success ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
{notionResult.success ? (
        <div>
          <p className="text-emerald-400 font-black text-sm">✅ {notionResult.message}</p>
          <div className="grid grid-cols-3 gap-3 mt-2">
            <div className="bg-white/5 rounded-xl p-2.5 text-center">
              <p className="text-xl font-black text-white">{notionResult.synced}</p>
              <p className="text-[9px] text-white/40 uppercase">Sincronizados</p>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5 text-center">
              <p className="text-xl font-black text-white">{notionResult.total}</p>
              <p className="text-[9px] text-white/40 uppercase">En Notion</p>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5 text-center">
              <p className={`text-xl font-black ${notionResult.errors > 0 ? 'text-red-400' : 'text-white'}`}>{notionResult.errors}</p>
              <p className="text-[9px] text-white/40 uppercase">Errores</p>
            </div>
          </div>
          {/* Botón para ir a Gestión de Lotes */}
          <button
            onClick={() => {
              const slug = getProjectSlug(notionModal?.name || '');
              router.push(`/superadmin/gestion-lotes/${slug}`);
            }}
            className="w-full mt-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-xl text-emerald-400 font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
          >
            <List className="w-4 h-4" /> Ver Lotes en Gestión
          </button>
          
          {/* Botón de Análisis AI */}
          <button
            onClick={handleAIParse}
            disabled={aiParsing}
            className="w-full mt-2 py-2 bg-purple-500/20 hover:bg-purple-500/30 disabled:opacity-50 border border-purple-500/30 rounded-xl text-purple-400 font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
          >
            {aiParsing ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Analizando con AI...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Analizar "Forma de Pago" con AI</>
            )}
          </button>
          
          {/* Resultado del análisis AI */}
          {aiParseResult && (
            <div className={`mt-2 rounded-lg p-2 text-[10px] ${aiParseResult.success ? 'bg-purple-500/10 text-purple-400' : 'bg-red-500/10 text-red-400'}`}>
              {aiParseResult.success ? (
                <p>✓ {aiParseResult.message || `${aiParseResult.processed} lotes analizados`}</p>
              ) : (
                <p>❌ {aiParseResult.error}</p>
              )}
            </div>
          )}
        </div>
      ) : (
<div>
<p className="text-red-400 font-bold text-xs">❌ Error</p>
<p className="text-red-400/70 text-[10px] mt-1">{notionResult.error}</p>
</div>
)}
</div>
)}

{/* Resultado Recibos */}
{notionReceiptsResult && !notionSyncing && (
<div className={`rounded-xl p-3 border ${notionReceiptsResult.success ? 'bg-blue-500/5 border-blue-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
{notionReceiptsResult.success ? (
<div>
<div className="flex items-center justify-between mb-2">
<p className="text-blue-400 font-bold text-xs">💳 Recibos</p>
<span className="text-[10px] text-white/40">{notionReceiptsResult.synced} total</span>
</div>
<div className="grid grid-cols-4 gap-2">
<div className="bg-white/5 rounded-lg p-2 text-center">
<p className="text-base font-black text-white">{notionReceiptsResult.synced}</p>
<p className="text-[7px] text-white/40 uppercase">Recibos</p>
</div>
<div className="bg-white/5 rounded-lg p-2 text-center">
<p className="text-base font-black text-emerald-400">{notionReceiptsResult.linked}</p>
<p className="text-[7px] text-white/40 uppercase">Vinculados</p>
</div>
<div className="bg-white/5 rounded-lg p-2 text-center">
<p className="text-base font-black text-amber-400">{notionReceiptsResult.unlinked || 0}</p>
<p className="text-[7px] text-white/40 uppercase">Sin vínculo</p>
</div>
<div className="bg-white/5 rounded-lg p-2 text-center">
<p className="text-base font-black text-red-400">{notionReceiptsResult.desistido || 0}</p>
<p className="text-[7px] text-white/40 uppercase">Desistidos</p>
</div>
</div>
{notionReceiptsResult.payments_mapped !== undefined && (
<div className="mt-2 p-2 bg-emerald-500/10 rounded-lg">
<p className="text-[8px] text-emerald-400">✓ {notionReceiptsResult.payments_mapped} lotes actualizados con pagos</p>
</div>
)}
{notionReceiptsResult.unlinked > 0 && notionReceiptsResult.unlinked_sample && (
<div className="mt-2 p-2 bg-amber-500/10 rounded-lg">
<p className="text-[8px] text-amber-400/80">Algunos recibos no tienen lote asociado. Verifica el campo "Lotes y Cuotas" en Notion.</p>
</div>
)}
</div>
) : (
<p className="text-red-400 text-xs">{notionReceiptsResult.error || 'Error al sincronizar recibos'}</p>
)}
</div>
)}
</div>

{/* Footer */}
<div className="px-5 py-4 border-t border-white/5 flex gap-2 shrink-0">
<button onClick={() => !notionSyncing && setNotionModal(null)} className="flex-1 py-2.5 bg-white/5 border border-white/5 rounded-xl text-white/60 hover:bg-white/10 transition-all font-bold text-[10px] uppercase tracking-widest" disabled={notionSyncing}>
Cerrar
</button>
<button
onClick={handleNotionSync}
disabled={notionSyncing || !notionDbId.trim()}
className="flex-1 py-2.5 bg-blis-red hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
>
{notionSyncing ? <><Loader2 className="w-4 h-4 animate-spin" /> Sincronizando...</> : <><RefreshCw className="w-4 h-4" /> Sincronizar</>}
</button>
</div>
</div>
</div>
)}
      </div>
    </div>
  );
}