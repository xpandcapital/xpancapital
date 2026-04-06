import os
import re

file_path = 'app/blog/page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    orig_code = f.read()

# Remove Modals (Route Timeline Modal and Article Reader Modal)
# We can do this safely by removing everything from `            {/* Route Timeline Modal */}` down to `            <FeatureNewsArticles />` or something below the modals.

# Let's import the data from lib
# Find the end of imports, which is before `// AI-Generated / Scraped Mock Data`
old_imports = 'import { SideAnchorNav } from "@/components/ui/SideAnchorNav";\n\n// AI-Generated / Scraped Mock Data'
new_imports = 'import { SideAnchorNav } from "@/components/ui/SideAnchorNav";\nimport { allArticles, normalizeString, fuzzyMatch, convertToSlug } from "@/lib/data/blog";\nimport Link from "next/link";\n\n// AI-Generated / Scraped Mock Data'

new_code = orig_code.replace(old_imports, new_imports)

# Delete local `allArticles`, `normalizeString`, and `fuzzyMatch` definitions.
# We remove lines from `const allArticles = [` up to `    return searchWords.every(word => normText.includes(word));\n};\n`
regex_data = r'const allArticles = \[.*?\];\n\n// Normalize strings for fuzzy search.*?return searchWords\.every\(word => normText\.includes\(word\)\);\n\};'
new_code = re.sub(regex_data, '', new_code, flags=re.DOTALL)

# Delete ArticleReader completely
regex_reader = r'const ArticleReader = \(\{ article, onClose \}: \{ article: any, onClose: \(\) => void \}\) => \{.*?// CTA block if unregistered and reading a free article.*?\}\);\n\};'
new_code = re.sub(regex_reader, '', new_code, flags=re.DOTALL)

# Remove `readingArticle` and `selectedRoute` state from BlogMagazinePage
new_code = new_code.replace('const [readingArticle, setReadingArticle] = useState<any>(null);', '')
new_code = new_code.replace('const [selectedRoute, setSelectedRoute] = useState<any>(null);', '')

# Remove Modals entirely (search for Route Timeline Modal up to end of Animate Presence for Article Reader Modal)
regex_modals = r'\{/\* Route Timeline Modal \*/\}.*?\{/\* Article Reader Modal \*/\}.*?\}\)\n\s*\}\n\s*</AnimatePresence>'
new_code = re.sub(regex_modals, '', new_code, flags=re.DOTALL)

# Now, we need to change all `onClick={() => setReadingArticle(art)}` into regular links!
# But AutoSlider uses `onArticleClick={setReadingArticle}`. It should use generic routing now or `onArticleClick={(art) => router.push(`/blog/articulo/${convertToSlug(art.title)}`)}`
# For that I need `useRouter`.
new_code = new_code.replace('import Link from "next/link";', 'import Link from "next/link";\nimport { useRouter } from "next/navigation";')
new_code = new_code.replace('export default function BlogMagazinePage() {\n', 'export default function BlogMagazinePage() {\n    const router = useRouter();\n')

# Convert `setReadingArticle`
new_code = new_code.replace('setReadingArticle', '(art) => router.push(`/blog/articulo/${convertToSlug(art?.title || "")}`)')

# Convert `setSelectedRoute(route)`
new_code = new_code.replace('onClick={() => setSelectedRoute(route)}', 'href={`/blog/ruta/${route.id}`} className="mt-auto inline-block" ')
# Fix button rendering inside link
new_code = new_code.replace(
    '<button href={`/blog/ruta/${route.id}`} className="mt-auto inline-block"  className=',
    '<Link href={`/blog/ruta/${route.id}`} className='
)
new_code = new_code.replace(
    '<button href={`/blog/ruta/${route.id}`} className="mt-auto inline-block"',
    '<Link href={`/blog/ruta/${route.id}`}'
)
new_code = new_code.replace(
    '</button>\n                                </div>\n                            ))}',
    '</Link>\n                                </div>\n                            ))}'
)


# Remove duplicates of RUTAS DE APRENDIZAJE ESTRATÉGICO
# I'll just remove ALL of them and cleanly put one back where it belongs!
regex_rutas = r'\{/\* RUTAS DE APRENDIZAJE ESTRATÉGICO \*/\}.*?</section>\n\s*\}'
new_code = re.sub(regex_rutas, '', new_code, flags=re.DOTALL)

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

target_split = '        {/* ARTICULOS VISUALIZACION (MAGAZINE COMPACT LAYOUT 70/30) */}'
new_code = new_code.replace(target_split, clean_rutas + '\n' + target_split)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_code)
