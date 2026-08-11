"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import {
    LayoutDashboard, Users, FileText, Image as ImageIcon,
    Settings, LogOut, Activity, UserCircle, ShoppingBag,
    Coins, ChevronLeft, GraduationCap, Award, Cloud,
    ShoppingCart, Boxes, CandlestickChart, Scale, BarChart3, Store,
    Building2, UsersRound, FolderOpen, ChevronRight, Wrench,
    FileSignature, TrendingUp, Layout, Shield, Mail, UserPlus, Briefcase,
    CalendarDays, Megaphone, ClipboardList, BookOpenCheck, Package, Bell,
    MessageCircle, Library, DollarSign, Inbox, Server, Radio
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { LucideProps } from "lucide-react"
import { usePermissions } from "@/hooks/usePermissions"
import { SECTION_PERMISSIONS, hasPermission, type Permission } from "@/lib/auth/permissions"

type SubItem = {
    icon: React.ComponentType<LucideProps>
    label: string
    href: string
    permission?: string
}

type NavItem = {
    icon: React.ComponentType<LucideProps>
    label: string
    href?: string
    subItems?: SubItem[]
    permission?: string
}

type Section = {
    title: string
    items: NavItem[]
}

const ALL_SECTIONS: Section[] = [
    {
        title: "Principal",
        items: [
            { icon: LayoutDashboard, label: "Dashboard", href: "/superadmin", permission: "dashboard:ver" },
        ]
    },
    {
        title: "Ventas",
        items: [
            {
                icon: ShoppingCart,
                label: "Punto de Venta",
                subItems: [
                    { icon: Store, label: "Tienda", href: "/tienda" },
                    { icon: ShoppingCart, label: "Historial de Ventas", href: "/superadmin/ventas", permission: "ventas:ver" },
                    { icon: Settings, label: "Formas de Pago", href: "/superadmin/formasdepago", permission: "formasdepago:ver" },
                    { icon: ShoppingBag, label: "Productos", href: "/superadmin/productos", permission: "productos:ver" },
                    { icon: Package, label: "Entregas Digitales", href: "/superadmin/productos/entregas", permission: "productos:ver" },
                    { icon: Coins, label: "Clientes", href: "/superadmin/clientes", permission: "clientes:ver" },
                    { icon: Settings, label: "Ajustes del Comercio", href: "/superadmin/ajustes/comercio", permission: "ajustes:ver" },
                ]
            },
            {
                icon: GraduationCap,
                label: "Academia",
                subItems: [
                    { icon: GraduationCap, label: "Cursos", href: "/superadmin/cursos", permission: "cursos:ver" },
                    { icon: Library, label: "Biblioteca", href: "/superadmin/biblioteca", permission: "biblioteca:ver" },
                    { icon: BookOpenCheck, label: "Mis cursos", href: "/superadmin/mis-capacitaciones", permission: "capacitaciones:ver" },
                    { icon: Award, label: "Certificados", href: "/superadmin/certificados", permission: "certificados:ver" },
                    { icon: TrendingUp, label: "Gamificación", href: "/superadmin/gamificacion", permission: "certificados:ver" },
                ]
            },
            {
                icon: TrendingUp,
                label: "Trading",
                href: "/superadmin/trading",
                permission: "trading:ver"
            },
        ]
    },
    {
        title: "Contenido",
        items: [
            {
                icon: Mail,
                label: "Comunicación",
                subItems: [
                    { icon: Mail, label: "Correos", href: "/superadmin/mails", permission: "mails:ver" },
                    { icon: Inbox, label: "Correo IMAP", href: "/superadmin/correo", permission: "correo:ver" },
                    { icon: Bell, label: "Notificaciones", href: "/superadmin/notificaciones", permission: "notificaciones:ver" },
                    { icon: Radio, label: "Transmisiones", href: "/superadmin/transmisiones", permission: "transmisiones:ver" },
                    { icon: MessageCircle, label: "WhatsApp", href: "/superadmin/whatsapp", permission: "campanas:ver" },
                ]
            },
            {
                icon: FileText,
                label: "Blog",
                subItems: [
                    { icon: FileText, label: "Entradas", href: "/superadmin/blog", permission: "blog:ver" },
                ]
            },
        ]
    },
    {
        title: "Sistema",
        items: [
            {
                icon: Users,
                label: "Personal",
                subItems: [
                    { icon: Users, label: "Equipo", href: "/superadmin/usuarios?equipo=true", permission: "equipo:ver" },
                    { icon: UserPlus, label: "Postulantes", href: "/superadmin/postulantes", permission: "postulantes:ver" },
                    { icon: Briefcase, label: "Puestos", href: "/superadmin/postulantes/puestos", permission: "postulantes:ver" },
                    { icon: ClipboardList, label: "Preguntas", href: "/superadmin/postulantes/preguntas", permission: "postulantes:ver" },
                ]
            },
            {
                icon: Settings,
                label: "Configuración",
                subItems: [
                    { icon: Cloud, label: "APIs y Nube", href: "/superadmin/api-nube", permission: "api-nube:ver" },
                    { icon: Activity, label: "Métricas y SEO", href: "/superadmin/analiticas", permission: "analiticas:ver" },
                    { icon: ShoppingCart, label: "Comercio", href: "/superadmin/ajustes/comercio", permission: "ajustes:ver" },
                    { icon: Shield, label: "Roles y Niveles", href: "/superadmin/ajustes/roles", permission: "roles:ver" },
                    { icon: Shield, label: "Seguridad", href: "/superadmin/configuracion/seguridad", permission: "configuracion:ver" },
                    { icon: Server, label: "Config Correo", href: "/superadmin/configuracion/correo", permission: "configuracion:ver" },
                ]
            },
            { icon: UserCircle, label: "Mi Perfil", href: "/superadmin/perfil", permission: "perfil:ver" },
        ]
    }
]

function itemHasAccess(permisos: Set<string> | null, permission: string | undefined): boolean {
    if (!permission) return true
    if (!permisos) return false
    return hasPermission(permisos, permission as Permission)
}

function filterItem(item: NavItem, permisos: Set<string> | null): NavItem | null {
    if (item.subItems && item.subItems.length > 0) {
        const filteredSubs = item.subItems.filter(sub => itemHasAccess(permisos, sub.permission))
        if (filteredSubs.length === 0) return null
        return { ...item, subItems: filteredSubs }
    }

    if (!itemHasAccess(permisos, item.permission)) return null
    return item
}

export function SuperadminSidebar() {
    const [isCollapsed, setIsCollapsed] = useState(true)
    const [isHoverExpanded, setIsHoverExpanded] = useState(false)
    const [sidebarWidth, setSidebarWidth] = useState(64)
    const pathname = usePathname()
    const router = useRouter()
    const { effectivePermissions, loading: permLoading, isAdmin } = usePermissions()
    const { user, logout } = useAuth()
    const roleLabel = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Usuario'
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
    const isExpanded = !isCollapsed || isHoverExpanded

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }))
    }

    const handleSidebarMouseEnter = () => {
        if (isCollapsed) setIsHoverExpanded(true)
    }

    const handleSidebarMouseLeave = () => {
        setIsHoverExpanded(false)
    }

    useEffect(() => {
        const handleResize = () => {
            const isMobile = window.innerWidth < 1024
            setSidebarWidth(isMobile ? 56 : 64)
        }
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    useEffect(() => {
        const w = isExpanded ? '260px' : `${sidebarWidth}px`
        document.documentElement.style.setProperty('--sidebar-width', w)
    }, [isExpanded, sidebarWidth])

    useEffect(() => {
        const initialExpanded: Record<string, boolean> = {}
        ALL_SECTIONS.forEach(section => {
            section.items.forEach(item => {
                if (item.subItems) {
                    const hasActiveChild = item.subItems.some(sub => pathname === sub.href)
                    if (hasActiveChild) {
                        initialExpanded[item.label] = true
                    }
                }
            })
        })
        setExpandedSections(initialExpanded)
    }, [pathname])

    const filteredSections = useMemo(() => {
        if (isAdmin && user?.role !== 'empleado') return ALL_SECTIONS

        if (permLoading || effectivePermissions === null) {
            return []
        }

        return ALL_SECTIONS
            .map(section => ({
                ...section,
                items: section.items
                    .map(item => filterItem(item, effectivePermissions))
                    .filter((item): item is NavItem => item !== null)
            }))
            .filter(section => section.items.length > 0)
    }, [permLoading, effectivePermissions, isAdmin])

    const showSkeleton = permLoading || effectivePermissions === null

    return (
        <>
            <motion.aside
                initial={false}
                animate={{
                    width: isExpanded ? 260 : sidebarWidth,
                }}
                onMouseEnter={handleSidebarMouseEnter}
                onMouseLeave={handleSidebarMouseLeave}
                className="flex flex-col bg-zinc-950 border-r border-white/5 h-[calc(100vh-80px)] fixed top-20 left-0 overflow-hidden shadow-[15px_0_40px_rgba(0,0,0,0.8)] z-30"
                style={{ pointerEvents: 'auto' }}
            >
                <div className={`pt-6 pb-4 px-4 flex items-center ${!isExpanded ? 'justify-center px-0' : 'justify-between'}`}>
                    <AnimatePresence mode="wait">
                        {isExpanded && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="px-2 min-w-0"
                            >
                                <p className="text-[10px] text-gray-500 font-medium mt-0.5 truncate">{roleLabel || 'Usuario'}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className={`p-2 hover:bg-white/5 rounded-xl text-gray-400 transition-colors ${isCollapsed ? 'hover:text-blis-red' : ''}`}
                        >
                            <ChevronLeft className={`w-5 h-5 transition-transform duration-500 ${isCollapsed ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                </div>

                <nav className="flex-1 px-3 space-y-6 overflow-y-auto scrollbar-hide py-4">
                    {showSkeleton ? (
                        <div className="space-y-2 animate-pulse px-1">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                <div key={i} className="h-9 bg-white/5 rounded-xl" />
                            ))}
                        </div>
                    ) : filteredSections.length === 0 ? (
                        <div className="text-gray-600 text-xs text-center py-8 px-4">Sin permisos asignados</div>
                    ) : (
                        filteredSections.map((section, idx) => (
                            <div key={idx} className="space-y-1">
                                {isExpanded && (
                                    <motion.h3
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="px-3 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-3"
                                    >
                                        {section.title}
                                    </motion.h3>
                                )}
                                {!isExpanded && (
                                    <div className="h-px bg-white/5 mx-2 my-4" />
                                )}
                                <div className="space-y-1">
                                    {section.items.map((item, i) => {
                                        const typedItem = item as NavItem
                                        if (typedItem.subItems) {
                                            const hasActiveChild = typedItem.subItems.some(sub => pathname === sub.href)
                                            const expanded = expandedSections[typedItem.label]
                                            return (
                                                <div key={i}>
                                                    <button
                                                        onClick={() => toggleSection(typedItem.label)}
                                                        className={`w-full flex items-center gap-4 px-3 py-2.5 rounded-xl transition-all group font-medium relative ${hasActiveChild
                                                            ? 'bg-blis-red text-white shadow-lg shadow-blis-red/20'
                                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                                            } ${!isExpanded ? 'justify-center px-0' : ''}`}
                                                        title={!isExpanded ? typedItem.label : ""}
                                                    >
                                                        <typedItem.icon className={`w-5 h-5 flex-shrink-0 transition-colors ${hasActiveChild ? 'text-white' : 'group-hover:text-blis-red'}`} />
                                                        <AnimatePresence>
                                                            {isExpanded && (
                                                                <motion.span
                                                                    initial={{ opacity: 0, x: -10 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    exit={{ opacity: 0, x: -10 }}
                                                                    className="tracking-wide text-[13px] whitespace-nowrap flex-1 text-left"
                                                                >
                                                                    {typedItem.label}
                                                                </motion.span>
                                                            )}
                                                        </AnimatePresence>
                                                        <AnimatePresence>
                                                            {isExpanded && (
                                                                <motion.span
                                                                    initial={{ opacity: 0, rotate: 0 }}
                                                                    animate={{ opacity: 1, rotate: expandedSections[typedItem.label] ? 90 : 0 }}
                                                                    exit={{ opacity: 0, rotate: 0 }}
                                                                    className="text-[10px] ml-auto"
                                                                >
                                                                    <ChevronRight className="w-4 h-4" />
                                                                </motion.span>
                                                            )}
                                                        </AnimatePresence>
                                                    </button>
                                                    <AnimatePresence>
                                                        {expanded && isExpanded && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="overflow-hidden ml-4 pl-4 border-l border-white/10 mt-1 space-y-1"
                                                            >
                                                                {typedItem.subItems.map((subItem: SubItem, subIdx: number) => {
                                                                    const isActive = pathname === subItem.href
                                                                    return (
                                                                        <Link
                                                                            key={subIdx}
                                                                            href={subItem.href}
                                                                            onClick={() => window.innerWidth < 1024 && setIsCollapsed(true)}
                                                                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all group font-medium relative ${isActive
                                                                                ? 'bg-white/10 text-white'
                                                                                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                                                                }`}
                                                                        >
                                                                            <subItem.icon className={`w-4 h-4 flex-shrink-0 transition-colors ${isActive ? 'text-blis-red' : 'group-hover:text-blis-red'}`} />
                                                                            <span className="tracking-wide text-[12px] whitespace-nowrap">
                                                                                {subItem.label}
                                                                            </span>
                                                                            {isActive && (
                                                                                <motion.div
                                                                                    layoutId="active-indicator-sub"
                                                                                    className="absolute left-0 w-1 h-4 bg-blis-red rounded-r-full"
                                                                                />
                                                                            )}
                                                                        </Link>
                                                                    )
                                                                })}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            )
                                        }
                                        const isActive = pathname === item.href
                                        return (
                                            <Link
                                                key={i}
                                                href={item.href!}
                                                onClick={() => window.innerWidth < 1024 && setIsCollapsed(true)}
                                                className={`flex items-center gap-4 px-3 py-2.5 rounded-xl transition-all group font-medium relative ${isActive
                                                    ? 'bg-blis-red text-white shadow-lg shadow-blis-red/20'
                                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                                    } ${!isExpanded ? 'justify-center px-0' : ''}`}
                                                title={!isExpanded ? item.label : ""}
                                            >
                                                <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'group-hover:text-blis-red'}`} />
                                                <AnimatePresence>
                                                    {isExpanded && (
                                                        <motion.span
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            exit={{ opacity: 0, x: -10 }}
                                                            className="tracking-wide text-[13px] whitespace-nowrap"
                                                        >
                                                            {item.label}
                                                        </motion.span>
                                                    )}
                                                </AnimatePresence>
                                                {isActive && isExpanded && (
                                                    <motion.div
                                                        layoutId="active-indicator"
                                                        className="absolute left-0 w-1 h-6 bg-white rounded-r-full"
                                                    />
                                                )}
                                            </Link>
                                        )
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </nav>
                {/* Botón Cerrar Sesión */}
                <div className="px-3 pb-4">
                    <button
                        onClick={async () => { await logout(); router.push('/') }}
                        className={`flex items-center gap-4 px-3 py-2.5 rounded-xl transition-all group font-medium w-full text-red-400 hover:bg-red-500/10 hover:text-red-300 ${!isExpanded ? 'justify-center px-0' : ''}`}
                        title={!isExpanded ? "Cerrar Sesión" : ""}
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        {isExpanded && <span className="tracking-wide text-[13px] whitespace-nowrap">Cerrar Sesión</span>}
                    </button>
                </div>
            </motion.aside>
        </>
    )
}