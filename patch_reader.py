import os
import re

file_path = 'app/blog/page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    orig_code = f.read()

# 1. Add Premium tags to a few articles
orig_code = orig_code.replace(
    'author: "Equipo Legal" }',
    'author: "Equipo Legal", isPremium: true, price: 15 }'
)
orig_code = orig_code.replace(
    'author: "Mercado Inmobiliario" }',
    'author: "Mercado Inmobiliario", isPremium: true, price: 50 }'
)

# 2. Add Lock icon import
orig_code = orig_code.replace(
    'import { ArrowRight, Sparkles, Clock, Bookmark, ChevronRight, ChevronLeft, Search, Bot, Calendar as CalendarIcon, User, X, Check, Map, MessageSquare, Coins } from "lucide-react";',
    'import { ArrowRight, Sparkles, Clock, Bookmark, ChevronRight, ChevronLeft, Search, Bot, Calendar as CalendarIcon, User, X, Check, Map, MessageSquare, Coins, Lock, Unlock } from "lucide-react";'
)

# 3. Rewrite ArticleReader
old_reader_match = re.search(r'const ArticleReader = .*?export default function BlogMagazinePage\(\) \{', orig_code, flags=re.DOTALL)

new_reader = """
const ArticleReader = ({ article, onClose }: { article: any, onClose: () => void }) => {
    const [timeLeft, setTimeLeft] = useState(60);
    const [reward, setReward] = useState(5);
    const [claimed, setClaimed] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    
    // Premium States
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [showInsufficientCoins, setShowInsufficientCoins] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedTime = parseInt(localStorage.getItem('blis_blog_time') || '60', 10);
            const savedReward = parseInt(localStorage.getItem('blis_blog_coins') || '5', 10);
            setTimeLeft(savedTime);
            setReward(savedReward);

            // Mock auth check
            setIsRegistered(localStorage.getItem('blis_auth_token') === 'true');

            // Unlock Check
            const unlockedList = JSON.parse(localStorage.getItem('blis_unlocked_premium') || '[]');
            if (!article.isPremium || unlockedList.includes(article.title)) {
                setIsUnlocked(true);
            }

            const claimedArticles = JSON.parse(localStorage.getItem('blis_claimed_articles') || '[]');
            if (claimedArticles.includes(article.title)) {
                setClaimed(true);
            }
        }
    }, [article]);

    useEffect(() => {
        if (!isUnlocked || article.isPremium) return; // Premium articles don't give read rewards
        if (claimed || timeLeft <= 0) return;
        
        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    
                    if (isRegistered) {
                        let currentCoins = parseInt(localStorage.getItem('blis_coins') || '0', 10);
                        localStorage.setItem('blis_coins', (currentCoins + reward).toString());
                        const claimedArticles = JSON.parse(localStorage.getItem('blis_claimed_articles') || '[]');
                        claimedArticles.push(article.title);
                        localStorage.setItem('blis_claimed_articles', JSON.stringify(claimedArticles));
                        window.dispatchEvent(new Event('storage'));
                    } else {
                        // Pending coins for unregistered
                        let pending = parseInt(localStorage.getItem('blis_pending_coins') || '0', 10);
                        localStorage.setItem('blis_pending_coins', (pending + reward).toString());
                        const claimedArticles = JSON.parse(localStorage.getItem('blis_pending_articles') || '[]');
                        claimedArticles.push({ title: article.title, coins: reward });
                        localStorage.setItem('blis_pending_articles', JSON.stringify(claimedArticles));
                    }
                    
                    setClaimed(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [timeLeft, claimed, reward, article, isRegistered, isUnlocked]);

    const unlockPremiumArticle = () => {
        let currentCoins = parseInt(localStorage.getItem('blis_coins') || '0', 10);
        if (currentCoins >= article.price) {
            localStorage.setItem('blis_coins', (currentCoins - article.price).toString());
            const unlockedList = JSON.parse(localStorage.getItem('blis_unlocked_premium') || '[]');
            unlockedList.push(article.title);
            localStorage.setItem('blis_unlocked_premium', JSON.stringify(unlockedList));
            setIsUnlocked(true);
            window.dispatchEvent(new Event('storage'));
        } else {
            setShowInsufficientCoins(true);
            setTimeout(() => setShowInsufficientCoins(false), 3000);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-3xl overflow-y-auto"
        >
            <div className={`max-w-4xl mx-auto min-h-screen bg-zinc-950 border-x border-white/5 flex flex-col pt-20 pb-20 relative px-4 md:px-0 mt-0 ${!isUnlocked && 'overflow-hidden max-h-screen'}`}>
                <button
                    onClick={onClose}
                    className="fixed top-6 right-6 p-4 bg-white/10 hover:bg-blis-red text-white rounded-full transition-colors z-[1050] backdrop-blur-md shadow-2xl"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Floating Timer Badge (Only for non-premium) */}
                {isUnlocked && !article.isPremium && (
                    <div className={`fixed top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full flex items-center gap-3 backdrop-blur-md transition-all shadow-2xl z-[1050] border ${claimed ? (isRegistered ? 'bg-amber-500/20 text-amber-500 border-amber-500/50' : 'bg-blue-600/20 text-blue-400 border-blue-500/50 cursor-pointer hover:bg-blue-600/40') : 'bg-black/60 text-white border-white/10'}`}
                         onClick={() => { if (claimed && !isRegistered) window.location.href = "/tienda/login"; }}
                    >
                        <Coins className="w-5 h-5" />
                        <span className="font-black tracking-widest uppercase text-xs md:text-sm">
                            {claimed 
                                ? (isRegistered ? `+${reward} BLIS COINS GANADOS` : `GANASTE +${reward} COINS. ¡REGÍSTRATE GRATIS PARA RECLAMARLOS!`) 
                                : `LEE ${timeLeft}S PARA GANAR ${reward} COINS`}
                        </span>
                    </div>
                )}

                {/* Premium Badge Identifier */}
                {article.isPremium && (
                     <div className="fixed top-6 left-6 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black uppercase text-xs rounded-full flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.5)] z-[1050]">
                         <Sparkles className="w-4 h-4" /> B-Premium
                     </div>
                )}

                {/* Article Header */}
                <div className="px-6 md:px-10 pb-10 border-b border-white/5 relative z-10">
                    <div className="flex flex-wrap items-center gap-4 text-[10px] md:text-sm font-bold text-gray-400 mb-6 uppercase tracking-wider">
                        <span className="bg-blis-red/20 text-blis-red px-3 py-1 rounded">{article.category}</span>
                        <span className="flex items-center gap-2"><CalendarIcon className="w-4 h-4" /> {article.date}</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl lg:text-5xl font-black uppercase text-white leading-tight mb-8">
                        {article.title}
                    </h1>
                    <div className="w-full aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative">
                        <img src={article.image} alt={article.title} className={`w-full h-full object-cover transition-all duration-700 ${!isUnlocked && 'blur-xl scale-110 saturate-50'}`} />
                        {!isUnlocked && <div className="absolute inset-0 bg-black/50" />}
                    </div>
                </div>

                {/* Locked Access Block */}
                {!isUnlocked ? (
                    <div className="px-6 md:px-10 py-20 flex flex-col items-center justify-center text-center relative z-20 -mt-32">
                        <div className="w-24 h-24 bg-amber-500/10 border border-amber-500/30 rounded-3xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                            <Lock className="w-10 h-10 text-amber-500" />
                        </div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-4">Artículo Premium</h2>
                        <p className="text-gray-400 mb-8 max-w-lg text-lg">Este análisis profundo de mercado está reservado para billeteras exclusivas. Desbloquéalo y descubre el secreto de los grandes inversores.</p>
                        
                        <button 
                            onClick={unlockPremiumArticle}
                            className={`flex items-center gap-3 px-8 py-4 rounded-xl font-black tracking-widest uppercase transition-all ${showInsufficientCoins ? 'bg-red-500 text-white' : 'bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]'}`}
                        >
                            {showInsufficientCoins ? (
                                <><X className="w-5 h-5"/> Saldo Insuficiente</>
                            ) : (
                                <><Unlock className="w-5 h-5"/> Desbloquear por {article.price} Coins</>
                            )}
                        </button>
                    </div>
                ) : (
                    /* Unlocked Content */
                    <div className="px-6 md:px-10 py-12 prose prose-invert prose-lg max-w-none text-gray-300">
                        <p className="text-lg md:text-xl font-light leading-relaxed text-gray-400 mb-10 border-l-4 border-blis-red pl-6">
                            {article.excerpt}
                        </p>
                        <div className="space-y-6 opacity-80 text-base md:text-lg">
                            <p>Nuestra Inteligencia Inmobiliaria ha analizado las tendencias del mercado para traerte información crucial de cara al próximo trimestre y cómo esto impactará directamente tus proyecciones como inversionista estratégico. Adquirir conocimientos en este rubro representa una de las mejores defensas contra la devaluación sistémica.</p>
                            <p>Para maximizar tu rentabilidad o conocer el entorno legal, es esencial dominar estos conceptos que a menudo los asesores tradicionales pasan por alto. Con Blis Corp tienes acceso a la primera fila de la innovación financiera basada en activos sólidos como la tierra y las propiedades de alta plusvalía garantizada matemáticamente.</p>
                            
                            {/* CTA block if unregistered and reading a free article */}
                            {!isRegistered && !article.isPremium && (
                                <div className="my-10 p-8 rounded-2xl bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/30 flex flex-col items-center text-center">
                                    <User className="w-10 h-10 text-blue-400 mb-4" />
                                    <h3 className="text-2xl font-black text-white mb-2 uppercase">NO TE PIERDAS TUS COINS</h3>
                                    <p className="text-blue-200 mb-6 text-sm">Registrarte en Blis Corp es totalmente gratis. Al hacerlo ahora, reclamarás instantáneamente todas las monedas de los artículos que ya leíste y podrás usarlas para desbloquear blogs Premium o tener descuentos en inmuebles.</p>
                                    <button onClick={() => window.location.href="/tienda/login"} className="bg-blue-500 hover:bg-blue-400 text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest text-sm transition-colors shadow-lg shadow-blue-500/30">
                                        Crear mi Cuenta Gratis
                                    </button>
                                </div>
                            )}

                            <h2 className="text-xl md:text-2xl font-bold text-white mt-12 mb-6 uppercase tracking-widest">¿Por qué es clave actuar ahora?</h2>
                            <p>Las regulaciones urbanas están cambiando. En el desarrollo de lotes campestres, la oportunidad se cierra ventana a ventana. Las plusvalías que antes demoraban décadas, ahora se materializan en ventanas de 36 a 48 meses debido al inminente crecimiento poblacional periférico.</p>
                            <p>Revisa siempre la situación legal de tu predio, si tiene una sucesión intestada, copropiedad, o garantías hipotecarias pendientes, el saneamiento será el primer gran muro que tus fondos enfrentarán. ¡Estar advertido es estar armado!</p>
                            <h2 className="text-xl md:text-2xl font-bold text-white mt-12 mb-6 uppercase tracking-widest">Visión Estratégica</h2>
                            <p>En el panorama macroeconómico, contar con propiedades se ha transformado en el nuevo "Oro sólido" gracias a la tangibilidad y la resiliencia innata del suelo frente a crisis cambiarias o inflacionarias. Al acumular metros cuadrados comerciales o recreativos premium, no solo construyes una herencia, construyes soberanía.</p>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default function BlogMagazinePage() {
"""

if old_reader_match:
    new_code = orig_code.replace(old_reader_match.group(0), new_reader)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_code)
        
