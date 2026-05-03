'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Save, Send, Sparkles, Loader2, Image as ImageIcon,
  Tag, Eye, Trash2, RotateCcw, CheckCircle2
} from 'lucide-react';
import RichTextEditor from '@/components/superadmin/RichTextEditor';

interface Category {
  id: string;
  nombre: string;
  slug: string;
}

interface BlogPost {
  id: string;
  titulo: string;
  slug: string;
  contenido: string;
  extracto?: string;
  imagen_portada?: string;
  imagen_alt?: string;
  categoria_id?: string;
  estado: string;
  es_premium: boolean;
  precio_coins: number;
  seo_title?: string;
  seo_description?: string;
  tags?: string[];
}

export default function CreateBlogPostContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const editId = searchParams.get('id');

  const [empresaId, setEmpresaId] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [post, setPost] = useState<BlogPost>({
    id: '',
    titulo: '',
    slug: '',
    contenido: '',
    extracto: '',
    imagen_portada: '',
    imagen_alt: '',
    categoria_id: '',
    estado: 'borrador',
    es_premium: false,
    precio_coins: 0,
    seo_title: '',
    seo_description: '',
    tags: [],
  });

  const [tagInput, setTagInput] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Load empresa and categories
  useEffect(() => {
    const loadInitial = async () => {
      try {
        const empresaRes = await fetch('/api/empresas?slug=blis-corp');
        const empresaData = await empresaRes.json();
        if (empresaData.success && empresaData.data?.id) {
          const eid = empresaData.data.id;
          setEmpresaId(eid);

          const catRes = await fetch(`/api/blog/categorias?empresa_id=${eid}`);
          const catData = await catRes.json();
          if (catData.success && catData.data) {
            setCategories(catData.data);
          }

          // If editing, load post
          if (editId) {
            const postRes = await fetch(`/api/blog?id=${editId}`);
            const postData = await postRes.json();
            if (postData.success && postData.data?.[0]) {
              const p = postData.data[0];
              setPost({
                id: p.id,
                titulo: p.titulo || '',
                slug: p.slug || '',
                contenido: p.contenido || '',
                extracto: p.extracto || '',
                imagen_portada: p.imagen_portada || '',
                imagen_alt: p.imagen_alt || '',
                categoria_id: p.categoria_id || '',
                estado: p.estado || 'borrador',
                es_premium: p.es_premium || false,
                precio_coins: p.precio_coins || 0,
                seo_title: p.seo_title || '',
                seo_description: p.seo_description || '',
                tags: p.tags?.map((t: any) => t.nombre) || [],
              });
            }
          }
        }
      } catch (err) {
        console.error('Error loading initial data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadInitial();
  }, [editId]);

  const updateField = (field: keyof BlogPost, value: any) => {
    setPost(prev => ({ ...prev, [field]: value }));
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setPost(prev => ({
      ...prev,
      titulo: title,
      slug: prev.slug && !editId ? generateSlug(title) : prev.slug,
      seo_title: prev.seo_title || title,
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !post.tags?.includes(tagInput.trim())) {
      setPost(prev => ({ ...prev, tags: [...(prev.tags || []), tagInput.trim()] }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setPost(prev => ({ ...prev, tags: prev.tags?.filter(t => t !== tag) || [] }));
  };

  const handleSave = async (publish = false) => {
    if (!post.titulo || !post.contenido) {
      setMessage({ text: 'Título y contenido son obligatorios', type: 'error' });
      return;
    }
    if (!empresaId) {
      setMessage({ text: 'Error: no se pudo obtener empresa_id', type: 'error' });
      return;
    }

    if (publish) setPublishing(true); else setSaving(true);
    setMessage(null);

    try {
      const body = {
        empresa_id: empresaId,
        titulo: post.titulo,
        slug: post.slug || generateSlug(post.titulo),
        contenido: post.contenido,
        extracto: post.extracto || post.contenido.replace(/<[^>]+>/g, '').substring(0, 200),
        seo_title: post.seo_title || post.titulo,
        seo_description: post.seo_description || post.extracto || post.contenido.replace(/<[^>]+>/g, '').substring(0, 160),
        imagen_portada: post.imagen_portada,
        imagen_alt: post.imagen_alt,
        categoria_id: post.categoria_id || null,
        estado: publish ? 'publicado' : 'borrador',
        es_premium: post.es_premium,
        precio_coins: post.precio_coins,
        tags: post.tags,
      };

      let res;
      if (editId) {
        res = await fetch('/api/blog', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editId, ...body }),
        });
      } else {
        res = await fetch('/api/blog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }

      const data = await res.json();
      if (data.success) {
        setMessage({ text: publish ? '¡Artículo publicado!' : 'Borrador guardado', type: 'success' });
        if (!editId && data.data?.id) {
          router.replace(`/superadmin/blog/crear?id=${data.data.id}`);
        }
      } else {
        setMessage({ text: data.error || 'Error al guardar', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Error de red al guardar', type: 'error' });
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  };

  const handleAIGenerate = useCallback(async (title: string, idea: string) => {
    setGenerating(true);
    setMessage(null);
    try {
      const res = await fetch('/api/generate-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, idea }),
      });
      const data = await res.json();
      if (data.title) {
        // Fix: cerrar blockquotes no cerrados
        let fixedContent = data.content || ''
        if (fixedContent) {
          const openBq = (fixedContent.match(/<blockquote[^>]*>/gi) || []).length
          const closeBq = (fixedContent.match(/<\/blockquote>/gi) || []).length
          if (openBq > closeBq) {
            for (let i = closeBq; i < openBq; i++) {
              fixedContent += '</blockquote>'
            }
          }
        }

        // Hacer match de categoría por nombre (case-insensitive)
        let matchedCategoryId = ''
        if (data.category && categories.length > 0) {
          const catLower = data.category.toLowerCase().trim()
          const match = categories.find(c => 
            c.nombre.toLowerCase() === catLower || 
            c.nombre.toLowerCase().includes(catLower) ||
            catLower.includes(c.nombre.toLowerCase())
          )
          if (match) matchedCategoryId = match.id
        }

        setPost(prev => ({
          ...prev,
          titulo: data.title || prev.titulo,
          slug: generateSlug(data.title || prev.titulo),
          contenido: fixedContent || prev.contenido,
          extracto: data.excerpt || prev.extracto,
          imagen_portada: data.coverImage || prev.imagen_portada,
          tags: data.tags || prev.tags,
          seo_title: data.seoTitle || prev.seo_title,
          seo_description: data.seoDescription || prev.seo_description,
          categoria_id: matchedCategoryId || prev.categoria_id,
        }));
        setMessage({ text: '¡Artículo generado con IA!', type: 'success' });
      } else if (data.error) {
        setMessage({ text: data.error, type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Error generando contenido con IA', type: 'error' });
    } finally {
      setGenerating(false);
    }
  }, []);

  const handleCancelAIGenerate = () => {
    setGenerating(false);
  };

  const handleImageSearch = () => {
    // Open image search modal or redirect to image search
    window.open('/superadmin/utilidades?tab=imagenes', '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Link href="/superadmin/blog" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{editId ? 'Editar artículo' : 'Nuevo artículo'}</h1>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
                {post.estado === 'publicado' ? 'Publicado' : 'Borrador'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-bold transition-colors"
            >
              <Eye className="w-4 h-4" />
              {showPreview ? 'Editar' : 'Vista previa'}
            </button>
            <button
              onClick={() => handleSave(false)}
              disabled={saving || publishing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-bold transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar borrador
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={saving || publishing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black hover:bg-gray-200 text-sm font-bold transition-colors disabled:opacity-50"
            >
              {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Publicar
            </button>
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg text-sm font-bold ${message.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="xl:col-span-2 space-y-6">
            {!showPreview ? (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Título</label>
                  <input
                    type="text"
                    value={post.titulo}
                    onChange={e => handleTitleChange(e.target.value)}
                    placeholder="Título del artículo"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 text-lg font-bold"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Slug</label>
                    <input
                      type="text"
                      value={post.slug}
                      onChange={e => updateField('slug', e.target.value)}
                      placeholder="url-amigable-del-articulo"
                      className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Categoría</label>
                    <select
                      value={post.categoria_id || ''}
                      onChange={e => updateField('categoria_id', e.target.value || null)}
                      className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-white/30"
                    >
                      <option value="" className="bg-[#1a1a1a]">Sin categoría</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id} className="bg-[#1a1a1a]">{cat.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Extracto</label>
                  <textarea
                    value={post.extracto}
                    onChange={e => updateField('extracto', e.target.value)}
                    placeholder="Breve descripción del artículo (aparece en listados)"
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 text-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Contenido</label>
                  <RichTextEditor
                    value={post.contenido}
                    onChange={(val) => updateField('contenido', val)}
                    placeholder="Escribe el contenido de tu artículo aquí..."
                    onAIGenerate={handleAIGenerate}
                    isGeneratingAI={generating}
                    onCancelAIGenerate={handleCancelAIGenerate}
                    onImageSearch={handleImageSearch}
                    minHeight="500px"
                  />
                </div>
              </>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 min-h-[500px]">
                <h1 className="text-3xl font-black text-white mb-4">{post.titulo || 'Sin título'}</h1>
                {post.imagen_portada && (
                  <img src={post.imagen_portada} alt={post.imagen_alt || post.titulo} className="w-full h-64 object-cover rounded-2xl mb-6" />
                )}
                <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: post.contenido || '<p class="text-gray-500">Sin contenido</p>' }} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* SEO */}
            <div className="p-5 rounded-xl bg-white/5 border border-white/10">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                <Eye className="w-4 h-4 text-gray-400" />
                SEO
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">SEO Title</label>
                  <input
                    type="text"
                    value={post.seo_title || ''}
                    onChange={e => updateField('seo_title', e.target.value)}
                    placeholder="Título para buscadores"
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">SEO Description</label>
                  <textarea
                    value={post.seo_description || ''}
                    onChange={e => updateField('seo_description', e.target.value)}
                    placeholder="Descripción para buscadores"
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 text-sm resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Portada */}
            <div className="p-5 rounded-xl bg-white/5 border border-white/10">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-gray-400" />
                Imagen de portada
              </h3>
              <div className="space-y-4">
                {post.imagen_portada && (
                  <div className="relative rounded-xl overflow-hidden border border-white/10">
                    <img src={post.imagen_portada} alt="Portada" className="w-full h-40 object-cover" />
                    <button
                      onClick={() => updateField('imagen_portada', '')}
                      className="absolute top-2 right-2 p-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/40 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                <input
                  type="text"
                  value={post.imagen_portada || ''}
                  onChange={e => updateField('imagen_portada', e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 text-sm"
                />
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Alt text</label>
                  <input
                    type="text"
                    value={post.imagen_alt || ''}
                    onChange={e => updateField('imagen_alt', e.target.value)}
                    placeholder="Descripción de la imagen"
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Configuración */}
            <div className="p-5 rounded-xl bg-white/5 border border-white/10">
              <h3 className="text-sm font-bold mb-4">Configuración</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="es_premium"
                    checked={post.es_premium}
                    onChange={e => updateField('es_premium', e.target.checked)}
                    className="w-4 h-4 rounded border-white/30 bg-white/5"
                  />
                  <label htmlFor="es_premium" className="text-sm font-bold">Contenido Premium</label>
                </div>

                {post.es_premium && (
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Precio (BLIS Coins)</label>
                    <input
                      type="number"
                      value={post.precio_coins}
                      onChange={e => updateField('precio_coins', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-white/30 text-sm"
                    />
                  </div>
                )}

                <div className="pt-2 border-t border-white/5">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Estado</label>
                  <div className="flex items-center gap-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      post.estado === 'publicado' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'
                    }`}>
                      {post.estado === 'publicado' ? 'Publicado' : 'Borrador'}
                    </span>
                    {post.estado === 'publicado' && (
                      <button
                        onClick={() => updateField('estado', 'borrador')}
                        className="text-xs text-gray-500 hover:text-white transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="p-5 rounded-xl bg-white/5 border border-white/10">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                <Tag className="w-4 h-4 text-gray-400" />
                Tags
              </h3>
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Agregar tag..."
                  className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 text-sm"
                />
                <button
                  onClick={addTag}
                  className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
                >
                  +
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {post.tags?.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-xs font-bold">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="text-gray-400 hover:text-white">×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
