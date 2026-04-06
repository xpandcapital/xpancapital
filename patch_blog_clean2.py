import os
import re

file_path = 'app/blog/page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    orig_code = f.read()

# 1. Strip ALL "RUTAS DE APRENDIZAJE..." between Flash News Ticker and ARTICULOS VISUALIZACION
# We look for the exact end of Flash News: `from-black to-transparent z-10"></div>\n                </div>\n            </div>`
# And the exact start of ARTICULOS: `{/* ARTICULOS VISUALIZACION (MAGAZINE COMPACT LAYOUT 70/30) */}`

pattern_strip = r'(<div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black to-transparent z-10"></div>\s*</div>\s*</div>).*?(\{/\* ARTICULOS VISUALIZACION \(MAGAZINE COMPACT LAYOUT 70/30\) \*/\})'

clean_rutas = """

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
                                <div key={route.id} className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 hover:border-emerald-500/50 rounded-3xl p-6 md:p-8 transition-all duration-300 group shadow-lg flex flex-col min-h-[300px]">
                                    {route.isAI && (
                                        <div className="inline-flex max-w-max items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full mb-4 border border-emerald-500/20">
                                            <Sparkles className="w-3 h-3" /> Sugerencia IA
                                        </div>
                                    )}
                                    <h3 className="text-xl md:text-2xl font-black text-white mb-3 uppercase tracking-tight">{route.name}</h3>
                                    <p className="text-sm text-gray-400 mb-6 line-clamp-2 leading-relaxed">{route.description}</p>
                                    
                                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                                        <div className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                            <Library className="w-4 h-4" /> {route.articles?.length || 0} Artículos
                                        </div>
                                        <Link href={`/blog/ruta/${route.id}`} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                            Ver Hoja de Ruta <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            """

if re.search(pattern_strip, orig_code, flags=re.DOTALL):
    new_code = re.sub(pattern_strip, r'\1' + clean_rutas + r'\2', orig_code, flags=re.DOTALL)
else:
    print("Could not find blocks to strip")
    new_code = orig_code

# Make sure NO OTHER instances of `Rutas de Estudio Estratégicas` appear below
# We just stripped them all by using .*? between the two reliable markers! Oh wait, `.*?` is non-greedy, maybe it left some remaining blocks? Let's fix that.
# Remove ALL `RUTAS DE APRENDIZAJE ESTRATÉGICO` blocks globally first!
glob_remove = r'\{/\* RUTAS DE APRENDIZAJE ESTRATÉGICO \*/\}.*?</section>\s*\}\)\s*'
new_code = re.sub(glob_remove, '', new_code, flags=re.DOTALL)

# Then inject once at exactly `        {/* ARTICULOS VISUALIZACION (MAGAZINE COMPACT LAYOUT 70/30) */}`
new_code = new_code.replace(
    '{/* ARTICULOS VISUALIZACION (MAGAZINE COMPACT LAYOUT 70/30) */}',
    clean_rutas + '{/* ARTICULOS VISUALIZACION (MAGAZINE COMPACT LAYOUT 70/30) */}'
)

# Fix ALL broken `<Link ...</button>` globally just in case
new_code = re.sub(r'(<Link[^>]*>.*?)</button>', r'\1</Link>', new_code, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_code)
