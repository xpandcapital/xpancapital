"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Search as SearchIcon, Instagram, Youtube, Facebook, Music2, ShoppingCart, Bell, Heart, LogOut, LayoutDashboard, User, ShieldCheck, ChevronDown } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { useShop } from "@/context/ShopContext"
import { useLandingCMS } from "@/context/LandingCMSContext"
import { stripHtml } from "@/lib/strip-html"
import { NotificationBell } from "@/components/superadmin/NotificationBell"

interface HeaderProps {
    searchProps?: {
        value: string;
        onChange: (val: string) => void;
    };
    logoHorizontal?: string;
    logoVertical?: string;
}

export function Header({ searchProps, logoHorizontal, logoVertical }: HeaderProps = {}) {
    const pathname = usePathname()
    const router = useRouter()
    const [isScrolled, setIsScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
    const { user, logout, loading } = useAuth()
    const { cart, favorites, blisCoins, openCart, coinsEnabled } = useShop()
    const { templateData, siteConfig } = useLandingCMS()
    const isDashboard = pathname?.startsWith('/superadmin') || pathname?.startsWith('/miembros')

    const [searchQuery, setSearchQuery] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const navLinks = [
        { name: "Inicio", href: "/" },
        { name: "Blog", href: "/blog" },
        { name: "Tienda", href: "/tienda" },
        { name: "Academia", href: "/tienda#cursos" },
        { name: "Contacto", href: "#footer" }
    ]

    const socialLinks = [
        { icon: Facebook, href: "#", label: "Facebook" },
        { icon: Instagram, href: "#", label: "Instagram" },
        { icon: Youtube, href: "#", label: "YouTube" },
        { icon: Music2, href: "#", label: "TikTok" },
    ]

    const isActiveLink = (href: string) => {
        if (href === '/' && pathname === '/') return true;
        if (href !== '/' && href.startsWith('/') && pathname.startsWith(href)) return true;
        return false;
    };


    const allContent = [
        { title: "Nuestra Trayectoria", href: "/#about", type: "web" },
        { title: "Calculadora de Plusvalía", href: "/#calculadora", type: "web" },
        { title: "Catálogo de Inversiones", href: "/#catalog", type: "web" },
        { title: "Preguntas Frecuentes", href: "/#faq", type: "web" },
        { title: "Nuestro Equipo Lider", href: "/#team", type: "web" },
        { title: "Contratos Legales Definitivos", href: "/tienda#contratos", type: "shop" },
        { title: "Kits para Desarrolladores", href: "/tienda#desarrolladores", type: "shop" },
        { title: "Arsenal para Agentes VIP", href: "/tienda#kits", type: "shop" },
        { title: "Ebooks para Propietarios", href: "/tienda#ebooks", type: "shop" },
        { title: "Mentoría Premium 1 a 1", href: "/tienda#mentoria", type: "shop" },
        { title: "El nuevo CBD de Quito: Inversión", href: "/blog", type: "blog" },
        { title: "¿Por qué invertir en plano?", href: "/blog", type: "blog" }
    ];

    const resultsWeb = allContent.filter(c => c.type === 'web' && c.title.toLowerCase().includes(searchQuery.toLowerCase()));
    const resultsShop = allContent.filter(c => c.type === 'shop' && c.title.toLowerCase().includes(searchQuery.toLowerCase()));
    const resultsBlog = allContent.filter(c => c.type === 'blog' && c.title.toLowerCase().includes(searchQuery.toLowerCase()));

    const handleSearchChange = (val: string) => {
        setSearchQuery(val);
        if (searchProps) searchProps.onChange(val);
        setShowDropdown(val.length > 1);
    };

    const handleNavigation = (href: string) => {
        setMobileMenuOpen(false)
        if (href.startsWith('/#') && pathname === '/') {
            const id = href.substring(2)
            const element = document.getElementById(id) || document.querySelector(`#${id}`)
            if (element) {
                const offsetTop = element.getBoundingClientRect().top + window.scrollY - 80
                window.scrollTo({ top: offsetTop, behavior: "smooth" })
            }
        } else {
            router.push(href)
        }
    }

    const handleLinkClick = (e: React.MouseEvent, href: string) => {
        setMobileMenuOpen(false)
        if (href.startsWith('#') && pathname === '/') {
            e.preventDefault()
            const id = href.substring(1)
            const element = document.getElementById(id) || document.querySelector(`#${id}`)
            if (element) {
                const offsetTop = element.getBoundingClientRect().top + window.scrollY - 80
                window.scrollTo({ top: offsetTop, behavior: "smooth" })
            }
        } else if (href.startsWith('/#') && pathname === '/') {
            e.preventDefault()
            const id = href.substring(2)
            const element = document.getElementById(id) || document.querySelector(`#${id}`)
            if (element) {
                const offsetTop = element.getBoundingClientRect().top + window.scrollY - 80
                window.scrollTo({ top: offsetTop, behavior: "smooth" })
            }
        }
    }

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-[150] ${(isScrolled || isDashboard)
                    ? "bg-black/80 backdrop-blur-lg border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
                    : "bg-transparent"
                    }`}
            >
                {/* Neon Red Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] max-w-3xl bg-blis-red/15 rounded-full blur-[120px] pointer-events-none -translate-y-1/2" />

                <div className="w-full px-4 lg:px-8 xl:px-10 relative z-10">
                    <div className="flex items-center h-20 relative">


                        {/* ---- MOBILE LAYOUT ---- */}
                        {/* Left: Search icon */}
                        <button
                            className="lg:hidden text-white p-2 z-20"
                            onClick={() => { setMobileSearchOpen(!mobileSearchOpen); setMobileMenuOpen(false); }}
                            aria-label="Buscar"
                        >
                            <SearchIcon className={`w-5 h-5 transition-colors ${mobileSearchOpen ? 'text-blis-red' : 'text-white'}`} />
                        </button>

{/* Logo */}
                          <div
                              className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 w-auto flex-shrink-0 cursor-pointer z-20"
                              onClick={() => handleNavigation('/#hero')}
                          >
                          {(logoHorizontal || siteConfig?.logoHorizontal || templateData?.config?.branding?.logoHorizontal) ? (
                              <img
                                  src={logoHorizontal || siteConfig?.logoHorizontal || templateData?.config?.branding?.logoHorizontal}
                                  alt="Blis Corp Logo"
                                  className="h-12 sm:h-14 lg:h-14 xl:h-16 w-auto object-contain drop-shadow-[0_0_15px_rgba(213,193,8,0.5)] mx-auto lg:ml-0"
                              />
                          ) : (
                              <span className="text-xl font-black text-white tracking-wider">BLIS CORP</span>
                          )}
                          </div>



                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex items-center justify-center gap-4 lg:gap-6 xl:gap-8 z-10 flex-1 relative transition-all duration-500">

                            {navLinks.map((link) => {
                                const active = isActiveLink(link.href);
                                return (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        onClick={(e) => handleLinkClick(e, link.href)}
                                        className={`text-[10px] lg:text-xs xl:text-sm 2xl:text-base font-black tracking-tighter lg:tracking-wide xl:tracking-widest uppercase transition-all duration-300 relative group
                                            ${active
                                                ? 'text-blis-red drop-shadow-[0_0_8px_rgba(213,193,8,0.8)]'
                                                : 'text-gray-300 hover:text-white'}`
                                        }
                                    >
                                        {link.name}
                                        <span className={`absolute -bottom-2 left-0 h-0.5 bg-blis-red shadow-[0_0_10px_rgba(213,193,8,0.8)] transition-all duration-300 
                                            ${active ? 'w-full' : 'w-0 group-hover:w-full'}`}
                                        />
                                    </Link>
                                );
                            })}
                        </nav>

                         {/* Desktop: Search + Login */}
                         <div className="hidden lg:flex items-center justify-end gap-2 lg:gap-3 xl:gap-4 z-20 w-auto ml-auto flex-shrink-0">


                            {(searchProps || pathname !== '/superadmin') && (
                                <div className="relative flex items-center group">
                                    <div className="hidden lg:flex items-center relative group">
                                        <SearchIcon className="absolute left-3 w-4 h-4 text-gray-400 group-focus-within:text-blis-red transition-colors z-10" />
                                        <input
                                            type="text"
                                            placeholder="Buscar..."
                                            value={searchProps ? searchProps.value : searchQuery}
                                            onChange={(e) => handleSearchChange(e.target.value)}
                                            onFocus={() => { if ((searchProps ? searchProps.value : searchQuery).length > 2) setShowDropdown(true) }}
                                            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                                            className="w-36 lg:w-44 xl:w-56 2xl:w-72 pl-9 pr-4 py-2.5 bg-black/40 backdrop-blur-md border border-white/20 text-white rounded-full text-xs xl:text-sm font-semibold tracking-wider placeholder:text-gray-500 focus:outline-none focus:border-blis-red focus:bg-black/80 shadow-[inset_0_1px_4px_rgba(0,0,0,0.5)] transition-all duration-300"
                                        />
                                    </div>
                                    <button className="lg:hidden p-2 text-gray-400 hover:text-white" onClick={() => setMobileSearchOpen(true)}>
                                        <SearchIcon size={18} />
                                    </button>
                                    <AnimatePresence>
                                        {showDropdown && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute top-14 right-0 w-[550px] bg-[#0A0D11]/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)] overflow-hidden"
                                            >
                                                <div className="p-4 flex gap-4">
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-3 pb-2 border-b border-white/5">Website</h4>
                                                        <ul className="space-y-2">
                                                            {resultsWeb.length > 0 ? resultsWeb.map((res, i) => (
                                                                <li key={i}><a href={res.href} className="text-[11px] text-gray-300 hover:text-blis-red transition-colors block py-0.5 font-medium truncate" onClick={() => setShowDropdown(false)}>{res.title}</a></li>
                                                            )) : <li className="text-[11px] text-gray-600 italic">Sin resultados</li>}
                                                        </ul>
                                                    </div>
                                                    <div className="w-[1px] bg-white/5 mx-1"></div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-[10px] text-[#209f89] font-bold uppercase tracking-widest mb-3 pb-2 border-b border-[#209f89]/20">Tienda de Inversión</h4>
                                                        <ul className="space-y-2">
                                                            {resultsShop.length > 0 ? resultsShop.map((res, i) => (
                                                                <li key={i}><a href={res.href} className="text-[11px] text-white hover:text-[#209f89] transition-colors block py-0.5 font-medium truncate" onClick={() => setShowDropdown(false)}>{res.title}</a></li>
                                                            )) : <li className="text-[11px] text-gray-600 italic">Sin resultados</li>}
                                                        </ul>
                                                    </div>
                                                    <div className="w-[1px] bg-white/5 mx-1"></div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-3 pb-2 border-b border-white/5">Noticias</h4>
                                                        <ul className="space-y-2">
                                                            {resultsBlog.length > 0 ? resultsBlog.map((res, i) => (
                                                                <li key={i}><a href={res.href} className="text-[11px] text-gray-300 hover:text-blis-red transition-colors block py-0.5 font-medium truncate" onClick={() => setShowDropdown(false)}>{res.title}</a></li>
                                                            )) : <li className="text-[11px] text-gray-600 italic">Sin resultados</li>}
                                                        </ul>
                                                    </div>
                                                </div>
                                                <div className="bg-black/50 p-3 text-center border-t border-white/5">
                                                    <span className="text-[10px] text-blis-red uppercase tracking-widest font-bold">Buscando: &ldquo;{searchQuery}&rdquo;</span>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

{/* Action Icons - Always visible */}
                             <div className="hidden lg:flex items-center gap-3 lg:gap-4 xl:gap-6 border-r border-white/10 pr-4 lg:pr-6 mr-1">
                                {/* Cart Dropdown */}
                                <div className="relative group/cart">
                                    <button className="relative text-gray-400 hover:text-white transition-colors">
                                        <ShoppingCart className="w-5 h-5" />
                                        {cart.length > 0 && (
                                            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-blis-red rounded-full border-2 border-black flex items-center justify-center text-[8px] font-black text-white">
                                                {cart.length}
                                            </span>
                                        )}
                                    </button>

                                    {/* Cart Mini-Menu */}
                                    <div className="absolute top-full right-0 pt-4 w-80 scale-95 opacity-0 pointer-events-none group-hover/cart:scale-100 group-hover/cart:opacity-100 group-hover/cart:pointer-events-auto transition-all duration-300 origin-top-right z-50">
                                        <div className="bg-[#0A0D11]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
                                            <div className="p-4 border-b border-white/5">
                                                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Carrito ({cart.length})</h3>
                                            </div>
                                            <div className="max-h-72 overflow-y-auto p-3">
                                                {cart.length > 0 ? cart.map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors">
                                                        <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-white/5">
                                                            <img src={item.image} className="w-full h-full object-cover" alt="" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-bold text-white truncate">{stripHtml(item.title)}</p>
                                                            <p className="text-sm font-black text-blis-red font-mono">${item.price}</p>
                                                        </div>
                                                    </div>
                                                )) : (
                                                    <div className="py-8 text-center">
                                                        <ShoppingCart className="w-10 h-10 text-white/5 mx-auto mb-2" />
                                                        <p className="text-xs text-gray-600 uppercase font-bold">Carrito vacío</p>
                                                    </div>
                                                )}
                                            </div>
                                            {cart.length > 0 && (
                                                <div className="p-3 bg-black/50 border-t border-white/5">
                                                    <button onClick={() => { openCart(); }}
                                                        className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-widest transition-all">
                                                        Ir al Carrito
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Favorites Dropdown */}
                                <div className="relative group/favs">
                                    <button className="relative text-gray-400 hover:text-blis-red transition-colors">
                                        <Heart className={`w-5 h-5 ${favorites.length > 0 ? 'fill-blis-red text-blis-red' : ''}`} />
                                        {favorites.length > 0 && (
                                            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white rounded-full border-2 border-black flex items-center justify-center text-[8px] font-black text-blis-red">
                                                {favorites.length}
                                            </span>
                                        )}
                                    </button>

                                    {/* Favs Mini-Menu */}
                                    <div className="absolute top-full right-0 pt-4 w-72 scale-95 opacity-0 pointer-events-none group-hover/favs:scale-100 group-hover/favs:opacity-100 group-hover/favs:pointer-events-auto transition-all duration-300 origin-top-right z-50">
                                        <div className="bg-[#0A0D11]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
                                            <div className="p-4 border-b border-white/5">
                                                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Mis Favoritos ({favorites.length})</h3>
                                            </div>
                                            <div className="max-h-60 overflow-y-auto p-2 space-y-1">
                                                {favorites.length > 0 ? favorites.map(fav => (
                                                    <div key={fav.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors group/item">
                                                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                                                            <img src={fav.image} className="w-full h-full object-cover" alt="" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[10px] font-bold text-white truncate">{stripHtml(fav.title)}</p>
                                                            <p className="text-[9px] text-blis-red font-black font-mono">${fav.price}</p>
                                                        </div>
                                                    </div>
                                                )) : (
                                                    <div className="py-8 text-center">
                                                        <Heart className="w-8 h-8 text-white/5 mx-auto mb-2" />
                                                        <p className="text-[10px] text-gray-600 uppercase font-bold">No hay favoritos</p>
                                                    </div>
                                                )}
                                            </div>
                                            {favorites.length > 0 && (
                                                <div className="p-3 bg-black/50 border-t border-white/5">
                                                    <button
                                                        onClick={() => {
                                                            const text = `¡Hola! Mira estos productos de Blis Corp que me gustaron: \n${favorites.map(f => `- ${f.title}`).join('\n')}\n\nAyúdame a elegir en bliscorp.com`;
                                                            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                                                        }}
                                                        className="w-full py-2.5 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] text-[9px] font-black uppercase tracking-widest hover:bg-[#25D366] hover:text-white transition-all flex items-center justify-center gap-2"
                                                    >
                                                        Compartir por WhatsApp
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                             {/* Login Button / Profile */}
                             {loading ? (
                                <div className="flex-shrink-0 w-20 h-10 rounded-full bg-white/5 animate-pulse" />
                             ) : user ? (
                                <div className="flex items-center gap-6">
                                    {/* BlisCoins */}
                                    {coinsEnabled && (
                                    <div className="hidden lg:flex items-center gap-2 px-3 xl:px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 max-w-[120px] xl:max-w-none">
                                        <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                                            <motion.div
                                                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                                                transition={{ duration: 3, repeat: Infinity }}
                                            >
                                                <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_5px_white]" />
                                            </motion.div>
                                        </div>
                                        <span className="text-[11px] font-black uppercase tracking-wider">{blisCoins.toLocaleString()} BLISCOINS</span>
                                    </div>
                                    )}

                                    {/* Notification Dropdown - Only for logged users */}
                                    <NotificationBell />

                                    {/* User Profile Dropdown */}
                                    <div className="relative group/user">
                                        <button className="flex items-center gap-4 text-left group">
                                            <div className="hidden sm:block">
                                                <p className="text-[13px] font-black text-white uppercase tracking-tighter leading-none mb-0.5 group-hover:text-blis-red transition-colors">
                                                    {stripHtml(user.name) || 'Usuario'}
                                                </p>
                                                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                    {user.role === 'superadmin' ? 'SUPER ADMIN' : user.role === 'admin' ? 'ADMIN' : 'MIEMBRO'}
                                                </p>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blis-red to-red-900 border border-white/20 flex items-center justify-center text-white font-black text-sm shadow-[0_4px_15px_rgba(213,193,8,0.4)] group-hover:scale-105 transition-all overflow-hidden shrink-0">
                                                {user.profilePic ? (
                                                    <img src={user.profilePic} alt="Avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    (user.name || '').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'U'
                                                )}
                                            </div>
                                        </button>

                                        {/* Dropdown Menu */}
                                        <div className="absolute top-full right-0 pt-4 w-56 scale-95 opacity-0 pointer-events-none group-hover/user:scale-100 group-hover/user:opacity-100 group-hover/user:pointer-events-auto transition-all duration-300 origin-top-right z-50">
                                            <div className="bg-[#0A0D11]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
                                                <div className="py-2">
                                                    <button onClick={() => handleNavigation(['superadmin', 'admin', 'editor'].includes(user.role) ? '/superadmin/perfil' : '/miembros/perfil')} className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                                                        <User className="w-4 h-4 text-blis-red" /> MI PERFIL
                                                    </button>
                                                    <button onClick={() => handleNavigation('/miembros')} className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                                                        <LayoutDashboard className="w-4 h-4 text-blis-red" /> ÁREA DE MIEMBROS
                                                    </button>
                                                    {['superadmin', 'admin', 'editor'].includes(user.role) && (
                                                        <button onClick={() => handleNavigation('/superadmin')} className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-white hover:bg-blis-red/10 transition-colors">
                                                            <ShieldCheck className="w-4 h-4 text-blis-red" /> SUPER ADMIN
                                                        </button>
                                                    )}
                                                    {user.role === 'empleado' && (
                                                        <button onClick={() => handleNavigation('/superadmin/mis-capacitaciones')} className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-white hover:bg-blis-red/10 transition-colors">
                                                            <ShieldCheck className="w-4 h-4 text-blis-red" /> COLABORADORES
                                                        </button>
                                                    )}
                                                    <div className="h-px bg-white/5 my-1 mx-4"></div>
                                                    <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-red-500 hover:bg-red-500/10 transition-colors">
                                                        <LogOut className="w-4 h-4" /> CERRAR SESIÓN
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : !loading ? (
                                <button
                                    onClick={() => router.push('/login')}
                                    className="flex-shrink-0 px-5 py-2.5 rounded-full bg-blis-red/15 border border-blis-red/40 text-blis-red text-xs font-black uppercase tracking-widest hover:bg-blis-red hover:text-white hover:border-blis-red transition-all duration-300 shadow-[0_0_20px_rgba(213,193,8,0.15)] hover:shadow-[0_0_25px_rgba(213,193,8,0.4)]"
                                >
                                    Ingresar
                                </button>
                            ) : null}
                        </div>

                        {/* Right: Hamburger (mobile only) */}
                        <button
                            className="lg:hidden text-white p-2 z-20 ml-auto"
                            onClick={() => { setMobileMenuOpen(!mobileMenuOpen); setMobileSearchOpen(false); }}
                            aria-label="Menú"
                        >
                            <div className="flex flex-col gap-1.5 w-5">
                                <motion.span
                                    animate={mobileMenuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                                    className="block h-0.5 w-full bg-white rounded-full origin-center"
                                />
                                <motion.span
                                    animate={mobileMenuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                                    className="block h-0.5 w-full bg-white rounded-full"
                                />
                                <motion.span
                                    animate={mobileMenuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                                    className="block h-0.5 w-full bg-white rounded-full origin-center"
                                />
                            </div>
                        </button>
                    </div>
                </div>

                {/* Mobile Search Bar (slides down) */}
                <AnimatePresence>
                    {mobileSearchOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className={`lg:hidden bg-black/95 backdrop-blur-3xl border-t border-white/10 overflow-hidden ${isDashboard ? 'pl-16 sm:pl-20' : ''}`}
                        >
                            <div className="px-4 py-3 relative">
                                <SearchIcon className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="¿Qué estás buscando?..."
                                    autoFocus
                                    value={searchQuery}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className="w-full pl-9 pr-4 py-3 bg-white/5 border border-white/10 text-white rounded-2xl text-sm placeholder:text-gray-500 focus:outline-none focus:border-blis-red transition-all"
                                />

                                {/* Advanced Mobile Search Results */}
                                {searchQuery.length > 0 ? (
                                    <div className="mt-4 bg-[#0A0D11]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 max-h-[60vh] overflow-y-auto">
                                        {[
                                            { label: "Información Web", items: resultsWeb, color: "text-gray-500", icon: LayoutDashboard },
                                            { label: "Oportunidades Inversión", items: resultsShop, color: "text-[#209f89]", icon: ShoppingCart },
                                            { label: "Noticias y Blog", items: resultsBlog, color: "text-red-400", icon: Music2 },
                                        ].map(({ label, items, color, icon: Icon }) => items.length > 0 && (
                                            <div key={label} className="mb-4 last:mb-0">
                                                <div className="flex items-center gap-2 px-3 mb-2">
                                                    <Icon className={`w-3 h-3 ${color}`} />
                                                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${color}`}>{label}</p>
                                                </div>
                                                <div className="grid grid-cols-1 gap-1">
                                                    {items.slice(0, 4).map((res, i) => (
                                                        <a 
                                                            key={i} 
                                                            href={res.href} 
                                                            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all"
                                                            onClick={() => { setShowDropdown(false); setMobileSearchOpen(false); }}
                                                        >
                                                            <div className={`w-1.5 h-1.5 rounded-full ${color.replace('text-', 'bg-')}`}></div>
                                                            <span className="text-xs text-white font-medium">{res.title}</span>
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="mt-4 px-2">
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Categorías Rápidas</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { label: "Inversiones", icon: ShoppingCart, href: "/tienda" },
                                                { label: "Blog", icon: Music2, href: "/blog" },
                                                { label: "Academia", icon: LayoutDashboard, href: "/tienda#cursos" },
                                                { label: "Contacto", icon: Facebook, href: "#footer" }
                                            ].map((cat, i) => (
                                                <button 
                                                    key={i}
                                                    onClick={() => handleNavigation(cat.href)}
                                                    className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-blis-red/20 transition-all"
                                                >
                                                    <cat.icon className="w-4 h-4" />
                                                    <span className="text-xs font-bold uppercase tracking-tighter">{cat.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>


            {/* ======================== */}
            {/* MOBILE DRAWER MENU       */}
            {/* ======================== */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[199] bg-black/60 backdrop-blur-sm lg:hidden"
                            onClick={() => setMobileMenuOpen(false)}
                        />

                        {/* Drawer Panel */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                             exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="fixed top-0 right-0 bottom-0 z-[200] w-[78%] max-w-sm bg-[#0a0a0a] border-l border-white/10 shadow-[-20px_0_60px_rgba(0,0,0,0.8)] lg:hidden flex flex-col overflow-y-auto"
                        >
                            {/* Close button */}
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="absolute top-5 left-5 p-2 rounded-full bg-blis-red/20 border border-blis-red/40 text-blis-red hover:bg-blis-red hover:text-white transition-all z-10"
                            >
                                <X className="w-4 h-4" />
                            </button>

{/* Logo */}
                             <div className={`flex flex-col items-center border-b border-white/8 ${user ? 'pt-8 pb-3' : 'pt-14 pb-6'}`}>
                             {(logoVertical || siteConfig?.logoVertical || templateData?.config?.branding?.logoVertical) ? (
                                 <img
                                     src={logoVertical || siteConfig?.logoVertical || templateData?.config?.branding?.logoVertical}
                                     alt="Blis Corporation"
                                     className={`w-auto object-contain drop-shadow-[0_0_20px_rgba(213,193,8,0.4)] ${user ? 'h-20 mb-2' : 'h-28 mb-4'}`}
                                 />
                             ) : (
                                 <span className={`font-black text-white tracking-wider ${user ? 'text-2xl mb-2' : 'text-3xl mb-4'}`}>BLIS CORP</span>
                             )}
                             </div>

                            {/* User Profile Mobile */}
                            {user && (
                                <div className="px-6 py-3 border-b border-white/8 bg-white/[0.02]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blis-red to-red-900 border border-white/20 flex items-center justify-center text-white font-black text-sm shadow-lg shrink-0 overflow-hidden">
                                            {user?.profilePic ? (
                                                <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                (user?.name || '').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'U'
                                            )}
                                        </div>
                                        <div className="text-left overflow-hidden">
                                            <p className="text-sm font-black text-white uppercase tracking-tighter leading-none mb-1 truncate">
                                                {stripHtml(user?.name) || 'Usuario'}
                                            </p>
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">
                                                    {user?.role === 'superadmin' ? 'SUPER ADMIN' : ['admin', 'editor'].includes(user?.role || '') ? 'ADMIN' : 'MIEMBRO'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex gap-2">
                                        {coinsEnabled && (
                                        <div className="flex-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center">
                                            <p className="text-[7px] font-bold uppercase tracking-widest opacity-60 leading-none mb-1">BLISCOINS</p>
                                            <p className="text-xs font-black">{user?.blis_coins?.toLocaleString() || '0'}</p>
                                        </div>
                                        )}
                                        <div className="flex-1 px-3 py-1.5 rounded-lg bg-blis-red/10 border border-blis-red/20 text-blis-red text-center">
                                            <p className="text-[7px] font-bold uppercase tracking-widest opacity-60 leading-none mb-1">Favoritos</p>
                                            <p className="text-xs font-black">{favorites.length}</p>
                                        </div>
                                        <div className="flex items-center justify-center">
                                            <NotificationBell />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Navegación */}
                            <div className={`flex-1 px-6 transition-all duration-300 ${user ? 'pt-6' : 'pt-10'}`}>
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500 mb-2 pb-2 border-b border-white/8">
                                    Navegación
                                </p>
                                <nav className="flex flex-col gap-1">
                                    {navLinks.map((link, i) => {
                                        const active = isActiveLink(link.href);
                                        return (
                                            <motion.div
                                                key={link.name}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.04 }}
                                                className={`w-full rounded-lg tracking-wide transition-all duration-300 group relative
                                            ${user ? 'px-3 py-2 text-[15px] font-bold' : 'px-4 py-3 text-base font-black'}
                                            ${active
                                                        ? 'text-blis-red bg-blis-red/10 border border-blis-red/20'
                                                        : 'text-gray-200 hover:text-white hover:bg-white/5'
                                                    }`}
                                            >
                                                <Link
                                                    href={link.href}
                                                    onClick={(e) => handleLinkClick(e, link.href)}
                                                    className="w-full flex items-center justify-center gap-3"
                                                >
                                                    <span>{link.name}</span>
                                                    {active && <span className="absolute right-4 w-1.5 h-1.5 rounded-full bg-blis-red shadow-[0_0_8px_rgba(213,193,8,0.8)]" />}
                                                    {active && <span className="absolute left-4 w-1.5 h-1.5 rounded-full bg-blis-red shadow-[0_0_8px_rgba(213,193,8,0.8)]" />}
                                                </Link>
                                            </motion.div>
                                        );
                                    })}
                                </nav>

                                {/* Dashboards Buttons */}
                                {user && (
                                    <div className="mt-3 space-y-2">
                                        {['superadmin', 'admin', 'editor'].includes(user?.role || '') && (
                                            <button
                                                onClick={() => handleNavigation('/superadmin')}
                                                className="w-full py-3 rounded-lg bg-blis-red text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-[0_6px_15px_rgba(213,193,8,0.2)]"
                                            >
                                                Panel Administrativo
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleNavigation('/miembros')}
                                            className="w-full py-3 rounded-lg bg-white/5 border border-white/10 text-white font-black uppercase tracking-[0.2em] text-[10px] hover:bg-white/10 transition-all"
                                        >
                                            Área de Miembros
                                        </button>
                                        <button
                                            onClick={() => { logout?.(); setMobileMenuOpen(false); }}
                                            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-red-500/20 text-red-500 font-bold uppercase tracking-widest text-[10px] hover:bg-red-500/10 transition-all"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Cerrar Sesión
                                        </button>
                                    </div>
                                )}
                                {!user && !loading && (
                                    <button
                                        onClick={() => { setMobileMenuOpen(false); router.push('/login'); }}
                                        className="w-full mt-8 py-4 rounded-xl bg-blis-red/15 border border-blis-red/40 text-blis-red font-bold uppercase tracking-widest text-xs hover:bg-blis-red hover:text-white transition-all shadow-[0_0_20px_rgba(213,193,8,0.15)]"
                                    >
                                        Iniciar Sesión
                                    </button>
                                )}
                            </div>

                            {/* Redes Sociales */}
                            <div className="px-6 pb-6 pt-4 border-t border-white/8 mt-auto bg-black/40 backdrop-blur-md flex flex-col items-center text-center">
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">
                                    Conecta con nosotros
                                </p>
                                <div className="flex justify-center gap-3">
                                    {socialLinks.map(({ icon: Icon, href, label }) => (
                                        <a
                                            key={label}
                                            href={href}
                                            aria-label={label}
                                            className="w-9 h-9 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:border-blis-red/50 hover:bg-blis-red/10 transition-all duration-200"
                                        >
                                            <Icon className="w-3.5 h-3.5" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}

