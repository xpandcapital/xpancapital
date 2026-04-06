import os
import re

file_path = 'app/blog/page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    orig_code = f.read()

# Add the ArticleReader component just before export default function BlogMagazinePage()
reader_component = """
const ArticleReader = ({ article, onClose }: { article: any, onClose: () => void }) => {
    const [timeLeft, setTimeLeft] = useState(60);
    const [reward, setReward] = useState(5);
    const [claimed, setClaimed] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedTime = parseInt(localStorage.getItem('blis_blog_time') || '60', 10);
            const savedReward = parseInt(localStorage.getItem('blis_blog_coins') || '5', 10);
            setTimeLeft(savedTime);
            setReward(savedReward);

            const claimedArticles = JSON.parse(localStorage.getItem('blis_claimed_articles') || '[]');
            if (claimedArticles.includes(article.title)) {
                setClaimed(true);
            }
        }
    }, [article]);

    useEffect(() => {
        if (claimed || timeLeft <= 0) return;
        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    let currentCoins = parseInt(localStorage.getItem('blis_coins') || '0', 10);
                    localStorage.setItem('blis_coins', (currentCoins + reward).toString());
                    const claimedArticles = JSON.parse(localStorage.getItem('blis_claimed_articles') || '[]');
                    claimedArticles.push(article.title);
                    localStorage.setItem('blis_claimed_articles', JSON.stringify(claimedArticles));
                    setClaimed(true);
                    window.dispatchEvent(new Event('storage'));
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [timeLeft, claimed, reward, article]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-3xl overflow-y-auto"
        >
            <div className="max-w-4xl mx-auto min-h-screen bg-zinc-950 border-x border-white/5 flex flex-col pt-20 pb-20 relative px-4 md:px-0 mt-0">
                <button
                    onClick={onClose}
                    className="fixed top-6 right-6 p-4 bg-white/10 hover:bg-blis-red text-white rounded-full transition-colors z-[1050] backdrop-blur-md shadow-2xl"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Floating Timer Badge */}
                <div className={`fixed top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full flex items-center gap-3 backdrop-blur-md transition-all shadow-2xl z-[1050] border ${claimed ? 'bg-amber-500/20 text-amber-500 border-amber-500/50' : 'bg-black/60 text-white border-white/10'}`}>
                    <Coins className="w-5 h-5" />
                    <span className="font-black tracking-widest uppercase text-xs md:text-sm">
                        {claimed ? `+${reward} BLIS COINS GANADOS` : `LEE ${timeLeft}S PARA GANAR ${reward} COINS`}
                    </span>
                </div>

                {/* Article Header */}
                <div className="px-6 md:px-10 pb-10 border-b border-white/5">
                    <div className="flex flex-wrap items-center gap-4 text-[10px] md:text-sm font-bold text-gray-400 mb-6 uppercase tracking-wider">
                        <span className="bg-blis-red/20 text-blis-red px-3 py-1 rounded">{article.category}</span>
                        <span className="flex items-center gap-2"><CalendarIcon className="w-4 h-4" /> {article.date}</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl lg:text-5xl font-black uppercase text-white leading-tight mb-8">
                        {article.title}
                    </h1>
                    <div className="w-full aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                        <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
                    </div>
                </div>

                {/* Article Content */}
                <div className="px-6 md:px-10 py-12 prose prose-invert prose-lg max-w-none text-gray-300">
                    <p className="text-lg md:text-xl font-light leading-relaxed text-gray-400 mb-10 border-l-4 border-blis-red pl-6">
                        {article.excerpt}
                    </p>
                    <div className="space-y-6 opacity-80 text-base md:text-lg">
                        <p>Nuestra Inteligencia Inmobiliaria ha analizado las tendencias del mercado para traerte información crucial de cara al próximo trimestre y cómo esto impactará directamente tus proyecciones como inversionista estratégico. Adquirir conocimientos en este rubro representa una de las mejores defensas contra la devaluación sistémica.</p>
                        <p>Para maximizar tu rentabilidad o conocer el entorno legal, es esencial dominar estos conceptos que a menudo los asesores tradicionales pasan por alto. Con Blis Corp tienes acceso a la primera fila de la innovación financiera basada en activos sólidos como la tierra y las propiedades de alta plusvalía garantizada matemáticamente.</p>
                        <h2 className="text-xl md:text-2xl font-bold text-white mt-12 mb-6 uppercase tracking-widest">¿Por qué es clave actuar ahora?</h2>
                        <p>Las regulaciones urbanas están cambiando. En el desarrollo de lotes campestres, la oportunidad se cierra ventana a ventana. Las plusvalías que antes demoraban décadas, ahora se materializan en ventanas de 36 a 48 meses debido al inminente crecimiento poblacional periférico.</p>
                        <p>Revisa siempre la situación legal de tu predio, si tiene una sucesión intestada, copropiedad, o garantías hipotecarias pendientes, el saneamiento será el primer gran muro que tus fondos enfrentarán. ¡Estar advertido es estar armado!</p>
                        <h2 className="text-xl md:text-2xl font-bold text-white mt-12 mb-6 uppercase tracking-widest">Visión Estratégica</h2>
                        <p>En el panorama macroeconómico, contar con propiedades se ha transformado en el nuevo "Oro sólido" gracias a la tangibilidad y la resiliencia innata del suelo frente a crisis cambiarias o inflacionarias. Al acumular metros cuadrados comerciales o recreativos premium, no solo construyes una herencia, construyes soberanía.</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default function BlogMagazinePage() {
"""

if 'const ArticleReader =' not in orig_code:
    new_code = orig_code.replace('export default function BlogMagazinePage() {', reader_component)

    state_injection = "    const [currentHeroSlide, setCurrentHeroSlide] = useState(0);\n    const [readingArticle, setReadingArticle] = useState<any>(null);"
    new_code = new_code.replace("    const [currentHeroSlide, setCurrentHeroSlide] = useState(0);", state_injection)

    modal_code = """
            {/* Article Reader Modal */}
            <AnimatePresence>
                {readingArticle && (
                    <ArticleReader article={readingArticle} onClose={() => setReadingArticle(null)} />
                )}
            </AnimatePresence>
        </main>
    """
    new_code = new_code.replace('        </main>', modal_code)

    new_code = new_code.replace('<AutoSlider articles={', '<AutoSlider onArticleClick={setReadingArticle} articles={')
    new_code = new_code.replace(
        'import { ArrowRight, Sparkles, Clock, Bookmark, ChevronRight, ChevronLeft, Search, Bot, Calendar as CalendarIcon, User, X, Check, Map, MessageSquare } from "lucide-react";',
        'import { ArrowRight, Sparkles, Clock, Bookmark, ChevronRight, ChevronLeft, Search, Bot, Calendar as CalendarIcon, User, X, Check, Map, MessageSquare, Coins } from "lucide-react";'
    )

    # 1. Hook Hero button
    new_code = re.sub(
        r'(<button)( className="group relative px-6 py-3 bg-emerald-600[^>]*>\s*Leer Art.*?culo)',
        r'\1 onClick={() => setReadingArticle(featuredArticles[currentHeroSlide])}\2',
        new_code,
        flags=re.DOTALL
    )

    # 2. Hook Deck Inversiones (static top)
    new_code = re.sub(
        r'(<button)( className="flex items-center gap-2 text-blis-red group-hover:text-blis-red/80 transition-colors uppercase">\s*Leer Mǭs|Leer Más)',
        r'\1 onClick={() => setReadingArticle(deckInversiones[0])}\2',
        new_code,
        flags=re.DOTALL
    )

    # 3. Hook Deck Arquitectura (static top)
    new_code = re.sub(
        r'(<button)( className="flex items-center gap-2 text-blis-red group-hover:text-blis-red/80 transition-colors uppercase">\s*Visualizar)',
        r'\1 onClick={() => setReadingArticle(deckArquitectura[0])}\2',
        new_code,
        flags=re.DOTALL
    )

    # 4. Hook Deck Legal (static top)
    new_code = re.sub(
        r'(<button)( className="flex items-center gap-2 text-blis-red group-hover:text-blis-red/80 transition-colors uppercase">\s*Consultor..?a)',
        r'\1 onClick={() => setReadingArticle(deckLegal[0])}\2',
        new_code,
        flags=re.DOTALL
    )

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_code)
