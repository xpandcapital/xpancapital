import os
import re

file_path = 'app/blog/page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    orig_code = f.read()

# I want to inject the "Rutas de Aprendizaje" UI right after the "Flash News Ticker" (which ends at `</div>\n            </div>\n\n            {/* ARTICULOS VISUALIZACION`).
# Wait, "Flash News Ticker" ends with:
#                 <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black to-transparent z-10"></div>
#             </div>
#         </div>

# The new block will be:

routes_code = """
            {/* RUTAS DE APRENDIZAJE ESTRATÉGICO */}
            {!(debouncedSearch.length > 1 && activeArticles.length === 0) && routes.length > 0 && (
                <section className="bg-[#020202] py-16 px-4 md:px-8 xl:px-16 border-b border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-900/10 blur-[120px] rounded-full pointer-events-none" />
                    <div className="max-w-[1600px] mx-auto relative z-10">
                        <div className="mb-10 flex items-end justify-between border-b border-white/10 pb-4">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-1 flex items-center gap-2 uppercase">
                                    <Route className="w-6 h-6 text-emerald-500" />
                                    Rutas de Estudio Estratégicas
                                </h2>
                                <p className="text-gray-400 font-medium text-sm">Playlists educativas creadas por expertos y la IA.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {routes.map((route: any) => (
                                <div key={route.id} className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 hover:border-emerald-500/50 rounded-3xl p-6 md:p-8 transition-all duration-300 group shadow-lg">
                                    {route.isAI && (
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full mb-4 border border-emerald-500/20">
                                            <Sparkles className="w-3 h-3" /> Sugerencia IA
                                        </div>
                                    )}
                                    <h3 className="text-xl md:text-2xl font-black text-white mb-3 uppercase tracking-tight">{route.name}</h3>
                                    <p className="text-sm text-gray-400 mb-6 line-clamp-2 leading-relaxed">{route.description}</p>
                                    
                                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                                        <div className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                            <Library className="w-4 h-4" /> {route.articles?.length || 0} Artículos
                                        </div>
                                        <button onClick={() => setSelectedRoute(route)} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                            Ver Hoja de Ruta <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}
"""

route_viewer_modal = """
            {/* Route Timeline Modal */}
            <AnimatePresence>
                {selectedRoute && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed inset-0 z-[900] bg-black/98 backdrop-blur-3xl overflow-y-auto"
                    >
                        <div className="max-w-5xl mx-auto min-h-screen bg-zinc-950 border-x border-white/5 flex flex-col pt-16 pb-20 relative px-4 md:px-0">
                            <button
                                onClick={() => setSelectedRoute(null)}
                                className="fixed top-6 right-6 p-3 bg-white/10 hover:bg-white text-white hover:text-black rounded-full transition-all z-[1000] backdrop-blur-md"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            
                            <div className="px-6 md:px-16 pt-10 pb-8 border-b border-white/5 relative z-10 text-center">
                                <Route className="w-12 h-12 text-emerald-500 mx-auto mb-6" />
                                <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">{selectedRoute.name}</h2>
                                <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">{selectedRoute.description}</p>
                            </div>

                            <div className="px-6 md:px-16 py-12 relative">
                                <div className="absolute left-6 md:left-1/2 top-12 bottom-12 w-1 bg-gradient-to-b from-emerald-500/50 via-emerald-500/10 to-transparent -translate-x-1/2 rounded-full" />
                                
                                <div className="space-y-12 relative z-10">
                                    {selectedRoute.articles?.map((artTitle: string, idx: number) => {
                                        const foundArt = allArticles.find(a => a.title === artTitle);
                                        const isEven = idx % 2 === 0;
                                        
                                        if (!foundArt) return null;
                                        
                                        return (
                                            <div key={`step-${idx}`} className={`flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 w-full ${isEven ? 'md:flex-row-reverse' : ''}`}>
                                                
                                                <div className="hidden md:block flex-1" />
                                                
                                                {/* Timeline Node */}
                                                <div className="absolute left-0 md:left-1/2 w-10 h-10 bg-black border-4 border-emerald-500 rounded-full flex items-center justify-center font-black text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)] -translate-x-1/2 shrink-0 z-20">
                                                    {idx + 1}
                                                </div>

                                                <div className={`flex-1 w-full pl-12 md:pl-0 ${isEven ? 'md:text-left' : 'md:text-right'}`}>
                                                    <div className="bg-white/5 backdrop-blur-md border border-white/10 hover:border-emerald-500/50 rounded-3xl p-6 transition-all group overflow-hidden relative cursor-pointer" onClick={() => { setReadingArticle(foundArt); }}>
                                                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full group-hover:bg-emerald-500/20 transition-all" />
                                                        <div className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-3 ${isEven ? 'justify-start' : 'justify-start md:justify-end'}`}>
                                                            {foundArt.isPremium && <Sparkles className="w-3 h-3 text-amber-500" />}
                                                            {foundArt.category} <span className="text-white/20">•</span> <Clock className="w-3 h-3" /> {foundArt.readTime}
                                                        </div>
                                                        <h4 className="text-lg md:text-xl font-bold text-white mb-2 leading-tight group-hover:text-emerald-400 transition-colors">{foundArt.title}</h4>
                                                        <p className="text-xs text-gray-400 line-clamp-2">{foundArt.excerpt}</p>
                                                    </div>
                                                </div>

                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
"""

# Apply modifications
if 'const [routes, setRoutes]' not in orig_code:
    new_code = orig_code.replace(
        'const [readingArticle, setReadingArticle] = useState<any>(null);',
        'const [readingArticle, setReadingArticle] = useState<any>(null);\n    const [routes, setRoutes] = useState<any[]>([]);\n    const [selectedRoute, setSelectedRoute] = useState<any>(null);\n\n    useEffect(() => {\n        if (typeof window !== "undefined") {\n            const saved = localStorage.getItem("blis_blog_routes");\n            if (saved) setRoutes(JSON.parse(saved));\n        }\n    }, []);'
    )

    new_code = new_code.replace(
        'import { ArrowRight, Sparkles, Clock, Bookmark, ChevronRight, ChevronLeft, Search, Bot, Calendar as CalendarIcon, User, X, Check, Map, MessageSquare, Coins, Lock, Unlock } from "lucide-react";',
        'import { ArrowRight, Sparkles, Clock, Bookmark, ChevronRight, ChevronLeft, Search, Bot, Calendar as CalendarIcon, User, X, Check, Map, MessageSquare, Coins, Lock, Unlock, Route, Library } from "lucide-react";'
    )

    # Inject routes_code after Flash News Ticker
    # Search for exactly }</div>\n            </div>\n\n            {/* ARTICULOS VISUALIZACION
    target_split = '            </div>\n        </div>\n\n        {/* ARTICULOS VISUALIZACION'
    if target_split in new_code:
        new_code = new_code.replace(target_split, '            </div>\n        </div>\n\n' + routes_code + '\n        {/* ARTICULOS VISUALIZACION')
    else:
        # fuzzy search
        new_code = re.sub(r'(</div>\s*</div>\s*\{/\*\s*ARTICULOS\s*VISUALIZACION)', 
                          r'</div>\n        </div>\n' + routes_code + r'\n        {/* ARTICULOS VISUALIZACION', 
                          new_code, flags=re.DOTALL)

    # Inject Timeline Modal just before existing Article Reader Modal
    new_code = new_code.replace('{/* Article Reader Modal */}', route_viewer_modal + '\n            {/* Article Reader Modal */}')

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_code)
