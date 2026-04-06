'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, Download, X, Sparkles, Image as ImageIcon, AlertCircle, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageResult {
  id: string;
  type: string;
  title: string;
  thumbnail: string;
  preview: string;
  source: string;
  author?: string;
}

interface ImageSearchProps {
  onSelect: (url: string) => void;
  onClose: () => void;
}

export default function ImageSearch({ onSelect, onClose }: ImageSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ImageResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<'all' | 'unsplash' | 'pexels' | 'pixabay' | 'freepik' | 'envato' | 'brandfetch'>('all');
  const [selectedImage, setSelectedImage] = useState<ImageResult | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [mode, setMode] = useState<'search' | 'generate'>('search');
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [apiStatus, setApiStatus] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [generator, setGenerator] = useState<'auto' | 'dalle' | 'gemini' | 'stability' | 'replicate'>('auto');
  const [aspectRatio, setAspectRatio] = useState<'square' | 'landscape' | 'portrait'>('landscape');
  const [editingUrl, setEditingUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/images?action=status')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setApiStatus(data.keys);
        }
      });
  }, []);

  const searchImages = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setResults([]);
    setErrors([]);
    
    try {
      const res = await fetch(
        `/api/images?action=search&query=${encodeURIComponent(searchQuery)}&source=${source}`
      );
      const data = await res.json();
      
      if (data.success) {
        setResults(data.results);
        if (data.results.length === 0) {
          setErrors(['No se encontraron imágenes. Intenta con otros términos.']);
        }
      } else {
        setErrors([data.error || 'Error buscando imágenes']);
      }
    } catch (error) {
      console.error('Search error:', error);
      setErrors(['Error de conexión.']);
    } finally {
      setLoading(false);
    }
  };

  const generateImage = async () => {
    if (!prompt.trim()) return;
    
    setGenerating(true);
    setResults([]);
    setErrors([]);
    
    try {
      const res = await fetch(
        `/api/images?action=generate&prompt=${encodeURIComponent(prompt)}&generator=${generator}&size=${aspectRatio}`
      );
      const data = await res.json();
      
      if (data.success && data.images) {
        setResults(data.images);
      } else {
        setErrors([data.error || 'Error generando imagen']);
      }
    } catch (error) {
      console.error('Generate error:', error);
      setErrors(['Error de conexión.']);
    } finally {
      setGenerating(false);
    }
  };

  const handleSelect = (image: ImageResult) => {
    setEditingUrl(image.preview || image.thumbnail);
    setSelectedImage(image);
  };

  const handleDownload = async () => {
    if (!selectedImage) return;
    setDownloading(true);
    
    try {
      const imageUrl = selectedImage.preview || selectedImage.thumbnail;
      const res = await fetch(
        `/api/images?action=download&url=${encodeURIComponent(imageUrl)}&filename=${selectedImage.id}-${Date.now()}.jpg`
      );
      const data = await res.json();
      
      if (data.success && data.url) {
        onSelect(data.url);
        onClose();
      } else {
        setErrors([data.error || 'Error descargando imagen']);
      }
    } catch (error) {
      console.error('Download error:', error);
      setErrors(['Error descargando imagen']);
    } finally {
      setDownloading(false);
    }
  };

  const getSourceBadge = (src: string) => {
    const styles: Record<string, string> = {
      unsplash: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      pexels: 'bg-green-500/20 text-green-400 border-green-500/30',
      pixabay: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      freepik: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      envato: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
      brandfetch: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      dalle: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      stability: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      replicate: 'bg-pink-500/20 text-pink-400 border-pink-500/30'
    };
    return styles[src] || 'bg-gray-500/20 text-gray-400';
  };

  const hasSearchKey = apiStatus.unsplash || apiStatus.pexels || apiStatus.pixabay || apiStatus.freepik || apiStatus.envato || apiStatus.brandfetch;
  const hasGenerateKey = apiStatus.openai || apiStatus.stability || apiStatus.replicate;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-xl flex flex-col"
    >
      {/* Header */}
      <div className="sticky top-0 bg-zinc-950 border-b border-white/10 p-4 z-10">
        <div className="max-w-6xl mx-auto space-y-4">
          {/* Mode Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMode('search')}
              className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                mode === 'search' ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <Search className="w-4 h-4" /> Buscar
            </button>
            <button
              onClick={() => setMode('generate')}
              className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                mode === 'generate' ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <Sparkles className="w-4 h-4" /> Generar IA
            </button>
            
            <div className="flex-1" />
            
            <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          
          {/* Search Mode */}
          {mode === 'search' ? (
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchImages(query)}
                  placeholder="Buscar imágenes..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50"
                  autoFocus
                />
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                {(['all', 'unsplash', 'pexels', 'pixabay', 'freepik', 'envato', 'brandfetch'] as const).map((s) => {
                  const hasKey = s === 'all' || apiStatus[s];
                  const labels: Record<string, string> = {
                    all: 'Todas',
                    unsplash: 'Unsplash',
                    pexels: 'Pexels',
                    pixabay: 'Pixabay',
                    freepik: 'Freepik',
                    envato: 'Envato',
                    brandfetch: 'Brandfetch'
                  };
                  return (
                    <button
                      key={s}
                      onClick={() => hasKey && setSource(s)}
                      disabled={!hasKey}
                      className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                        source === s
                          ? 'bg-purple-500 text-white'
                          : hasKey
                            ? 'bg-white/5 text-gray-400 hover:bg-white/10'
                            : 'bg-white/5 text-gray-600 cursor-not-allowed'
                      }`}
                      title={!hasKey ? 'API key required' : ''}
                    >
                      {labels[s]}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => searchImages(query)}
                disabled={loading || !query.trim()}
                className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold text-sm disabled:opacity-50 whitespace-nowrap"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Buscar'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px] relative">
                  <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe la imagen..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50"
                  />
                </div>
                
                <button
                  onClick={generateImage}
                  disabled={generating || !prompt.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-bold text-sm disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generar
                    </>
                  )}
                </button>
              </div>
              
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 uppercase">Motor:</span>
                  {[
                    { id: 'auto', label: 'Auto', available: true },
                    { id: 'dalle', label: 'DALL-E', available: apiStatus.openai },
                    { id: 'stability', label: 'Stable Diffusion', available: apiStatus.stability },
                    { id: 'replicate', label: 'Flux', available: apiStatus.replicate }
                  ].map((g) => (
                    <button
                      key={g.id}
                      onClick={() => g.available && setGenerator(g.id as any)}
                      disabled={!g.available}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                        generator === g.id
                          ? 'bg-purple-500 text-white'
                          : g.available
                            ? 'bg-white/5 text-gray-400 hover:bg-white/10'
                            : 'bg-white/5 text-gray-600 cursor-not-allowed'
                      }`}
                      title={!g.available ? 'API key required' : ''}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 uppercase">Tamaño:</span>
                  {[
                    { id: 'square', label: '1:1' },
                    { id: 'landscape', label: '16:9' },
                    { id: 'portrait', label: '9:16' }
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setAspectRatio(s.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                        aspectRatio === s.id
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* API Status */}
          <div className="flex items-center gap-4 text-xs flex-wrap">
            <span className="text-gray-500 uppercase tracking-wider">APIs:</span>
            <span className={apiStatus.unsplash ? 'text-blue-400' : 'text-gray-600'}>Unsplash {apiStatus.unsplash ? '✓' : '✗'}</span>
            <span className={apiStatus.pexels ? 'text-green-400' : 'text-gray-600'}>Pexels {apiStatus.pexels ? '✓' : '✗'}</span>
            <span className={apiStatus.pixabay ? 'text-yellow-400' : 'text-gray-600'}>Pixabay {apiStatus.pixabay ? '✓' : '✗'}</span>
            <span className={apiStatus.freepik ? 'text-purple-400' : 'text-gray-600'}>Freepik {apiStatus.freepik ? '✓' : '✗'}</span>
            <span className={apiStatus.envato ? 'text-teal-400' : 'text-gray-600'}>Envato {apiStatus.envato ? '✓' : '✗'}</span>
            <span className={apiStatus.brandfetch ? 'text-orange-400' : 'text-gray-600'}>Brandfetch {apiStatus.brandfetch ? '✓' : '✗'}</span>
            <span className="text-gray-500">|</span>
            <span className={apiStatus.openai ? 'text-orange-400' : 'text-gray-600'}>DALL-E {apiStatus.openai ? '✓' : '✗'}</span>
            <span className={apiStatus.stability ? 'text-indigo-400' : 'text-gray-600'}>Stability {apiStatus.stability ? '✓' : '✗'}</span>
            <span className={apiStatus.replicate ? 'text-pink-400' : 'text-gray-600'}>Replicate {apiStatus.replicate ? '✓' : '✗'}</span>
          </div>
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="max-w-6xl mx-auto p-4">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-red-400 text-sm">
              {errors.map((err, i) => <p key={i}>{err}</p>)}
              <a href="/superadmin/api-nube" className="text-purple-400 underline block mt-2">Configurar API Keys →</a>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">
          {!hasSearchKey && mode === 'search' && !hasGenerateKey ? (
            <div className="text-center py-20">
              <Cpu className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-white font-bold text-lg mb-2">Configura tus API Keys</h3>
              <p className="text-gray-400 mb-6">
                Ve a <span className="text-purple-400">Superadmin → API Nube</span> para agregar tus API keys.
              </p>
              <a href="/superadmin/api-nube" className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold inline-block">
                Ir a API Nube
              </a>
            </div>
          ) : loading || generating ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
              <p className="text-gray-400 text-sm">{generating ? 'Generando imagen con IA...' : 'Buscando imágenes...'}</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-20">
              <ImageIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500">
                {mode === 'search' 
                  ? hasSearchKey ? 'Escribe un término de búsqueda' : 'Configura una API key para buscar'
                  : hasGenerateKey ? 'Escribe un prompt para generar imágenes' : 'Configura una API key de IA para generar'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {results.map((image) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-zinc-900 border border-white/5 hover:border-purple-500/50 transition-all cursor-pointer"
                  onClick={() => handleSelect(image)}
                >
                  <img
                    src={image.thumbnail}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23333" width="100" height="100"/><text fill="%23666" x="50" y="50" text-anchor="middle">Error</text></svg>';
                    }}
                  />
                  <div className="absolute top-2 left-2 z-10">
                    <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase border ${getSourceBadge(image.source)}`}>
                      {image.source}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-8"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl w-full bg-zinc-900 rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={editingUrl || selectedImage.preview || selectedImage.thumbnail}
                alt={selectedImage.title}
                className="w-full max-h-[60vh] object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = selectedImage.thumbnail;
                }}
              />
              
              <div className="p-6 border-t border-white/10">
                <h3 className="text-white font-bold mb-2">{selectedImage.title}</h3>
                {selectedImage.author && <p className="text-gray-400 text-sm mb-4">Por: {selectedImage.author}</p>}
                
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase border ${getSourceBadge(selectedImage.source)}`}>
                    {selectedImage.source}
                  </span>
                  
                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-xl font-bold uppercase text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {downloading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Descargando...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Usar Imagen
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}