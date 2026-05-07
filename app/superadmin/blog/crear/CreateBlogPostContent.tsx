'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Save, Send, Sparkles, Loader2,
  Eye, CheckCircle2, Link2, Copy, Check, X
} from 'lucide-react';
import RichTextEditor from '@/components/superadmin/RichTextEditor';
import { CoverImagePanel, SeoPanel, AccessPanel, ShortLinkPanel, ConfigPanel, TagsPanel } from './_components';

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
  contrasena: string;
  visibilidad: 'publico' | 'oculto';
  sin_recompensa: boolean;
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
  const [saveSuccess, setSaveSuccess] = useState<{ published: boolean; slug: string } | null>(null);
  const [shortLink, setShortLink] = useState<string | null>(null);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [shortCode, setShortCode] = useState('');
  const [shortCodeEditing, setShortCodeEditing] = useState(false);
  const [shortCodeSaving, setShortCodeSaving] = useState(false);

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
    contrasena: '',
    visibilidad: 'publico',
    sin_recompensa: false,
    seo_title: '',
    seo_description: '',
    tags: [],
  });

  const [tagInput, setTagInput] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverFileRef = useRef<HTMLInputElement>(null);

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
                contrasena: p.contrasena || '',
                visibilidad: p.visibilidad || 'publico',
                sin_recompensa: p.sin_recompensa || false,
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

  useEffect(() => {
    if (!post.slug) return;
    const checkShortLink = async () => {
      try {
        const fullUrl = `https://www.blis-corp.com/blog/articulo/${post.slug}`;
        const res = await fetch('/api/short-links', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: fullUrl }) });
        const data = await res.json();
        if (data.success && data.codigo && !data.existente) {
          await fetch(`/api/short-links?codigo=${data.codigo}`, { method: 'DELETE' });
        } else if (data.success && data.existente) {
          setShortCode(data.codigo);
        }
      } catch {}
    };
    checkShortLink();
  }, [post.slug]);

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
        contrasena: post.contrasena || null,
        visibilidad: post.visibilidad || 'publico',
        sin_recompensa: post.sin_recompensa || false,
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
        const isPublished = publish;
        const slug = data.data?.slug || post.slug || '';
        setSaveSuccess({ published: isPublished, slug });
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
  }, [categories]);

  const handleCancelAIGenerate = () => {
    setGenerating(false);
  };

  const handleImageSearch = () => {
    window.open('/superadmin/utilidades?tab=imagenes', '_blank');
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setMessage({ text: 'La imagen excede el límite de 10MB', type: 'error' });
      return;
    }
    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'blog-covers');
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        updateField('imagen_portada', data.url);
        setMessage({ text: 'Imagen subida correctamente', type: 'success' });
      } else {
        setMessage({ text: data.error || 'Error al subir imagen', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Error de red al subir imagen', type: 'error' });
    } finally {
      setUploadingCover(false);
      if (coverFileRef.current) coverFileRef.current.value = '';
    }
  };

  const generateShortLink = async () => {
    if (!saveSuccess?.slug) return;
    setGeneratingLink(true);
    try {
      const fullUrl = `https://www.blis-corp.com/blog/articulo/${saveSuccess.slug}`;
      const res = await fetch('/api/short-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: fullUrl }),
      });
      const data = await res.json();
      if (data.success) {
        setShortLink(`blis-corp.com/s/${data.codigo}`);
      }
    } catch {} finally {
      setGeneratingLink(false);
    }
  };

  const copyShortLink = () => {
    if (!shortLink) return;
    navigator.clipboard.writeText(`https://${shortLink}`);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const saveShortCode = async () => {
    if (!post.slug || !shortCode.trim()) return;
    setShortCodeSaving(true);
    try {
      const fullUrl = `https://www.blis-corp.com/blog/articulo/${post.slug}`;
      const res = await fetch('/api/short-links', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: fullUrl, nuevo_codigo: shortCode.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (data.success) {
        setShortCode(data.codigo);
        setShortCodeEditing(false);
        setMessage({ text: 'Enlace corto actualizado', type: 'success' });
      } else {
        setMessage({ text: data.error || 'Error al guardar', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Error de red', type: 'error' });
    } finally {
      setShortCodeSaving(false);
    }
  };

  const handleCopyShortCode = () => {
    navigator.clipboard.writeText(`https://blis-corp.com/s/${shortCode}`);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleDeleteShortCode = async () => {
    await fetch(`/api/short-links?codigo=${shortCode}`, { method: 'DELETE' });
    setShortCode('');
  };

  const handleCancelShortCodeEdit = () => {
    setShortCodeEditing(false);
    setShortCode('');
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

        {saveSuccess && (
          <div className="mb-6 p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-bold text-emerald-400">
                {saveSuccess.published ? '¡Artículo publicado con éxito!' : 'Borrador guardado correctamente'}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {saveSuccess.published && saveSuccess.slug && (
                <>
                  <a
                    href={`/blog/articulo/${saveSuccess.slug}`}
                    target="_blank"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> Ver artículo
                  </a>
                  {!shortLink ? (
                    <button
                      onClick={generateShortLink}
                      disabled={generatingLink}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/10 text-white text-xs font-bold hover:bg-white/20 transition-colors disabled:opacity-50"
                    >
                      {generatingLink ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
                      Generar enlace corto
                    </button>
                  ) : (
                    <button
                      onClick={copyShortLink}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-black text-xs font-bold hover:bg-gray-200 transition-colors"
                    >
                      {linkCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {linkCopied ? 'Copiado!' : shortLink}
                    </button>
                  )}
                </>
              )}
              <Link
                href="/superadmin/blog"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/10 text-white text-xs font-bold hover:bg-white/20 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Ir al blog
              </Link>
              <button
                onClick={() => { setSaveSuccess(null); setShortLink(null); }}
                className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
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
            <SeoPanel
              seoTitle={post.seo_title || ''}
              seoDescription={post.seo_description || ''}
              onSeoTitleChange={v => updateField('seo_title', v)}
              onSeoDescriptionChange={v => updateField('seo_description', v)}
            />

            <CoverImagePanel
              imagen_portada={post.imagen_portada || ''}
              imagen_alt={post.imagen_alt || ''}
              uploadingCover={uploadingCover}
              coverFileRef={coverFileRef}
              onImageUrlChange={v => updateField('imagen_portada', v)}
              onAltChange={v => updateField('imagen_alt', v)}
              onRemoveImage={() => updateField('imagen_portada', '')}
              onFileUpload={handleCoverUpload}
            />

            <AccessPanel
              contrasena={post.contrasena}
              visibilidad={post.visibilidad}
              onContrasenaChange={v => updateField('contrasena', v)}
              onVisibilidadChange={v => updateField('visibilidad', v)}
            />

            {post.slug && (
              <ShortLinkPanel
                shortCode={shortCode}
                shortCodeEditing={shortCodeEditing}
                shortCodeSaving={shortCodeSaving}
                linkCopied={linkCopied}
                onShortCodeChange={setShortCode}
                onSaveShortCode={saveShortCode}
                onStartEditing={() => setShortCodeEditing(true)}
                onCancelEditing={handleCancelShortCodeEdit}
                onDelete={handleDeleteShortCode}
                onCopy={handleCopyShortCode}
              />
            )}

            <ConfigPanel
              es_premium={post.es_premium}
              precio_coins={post.precio_coins}
              sin_recompensa={post.sin_recompensa}
              estado={post.estado}
              onPremiumChange={v => updateField('es_premium', v)}
              onPrecioCoinsChange={v => updateField('precio_coins', v)}
              onSinRecompensaChange={v => updateField('sin_recompensa', v)}
              onEstadoChange={v => updateField('estado', v)}
            />

            <TagsPanel
              tags={post.tags || []}
              tagInput={tagInput}
              onTagInputChange={setTagInput}
              onAddTag={addTag}
              onRemoveTag={removeTag}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
