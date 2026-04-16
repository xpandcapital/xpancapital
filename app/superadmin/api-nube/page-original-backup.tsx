"use client";

import React, { useState, useEffect } from "react";
import {
    Cloud, Key, ShieldCheck, Sparkles, Video,
    Image, Mail, Eye, EyeOff, CheckCircle2,
    Loader2, ChevronDown, ChevronUp,
    Building2, CreditCard, TrendingUp, BarChart3, Megaphone,
    Coins, Globe, MapPin, FileText, Database, FolderOpen,
    Calendar, Zap, MessageSquare, Bell, Palette,
    FileCheck, Users, Briefcase, Send, Phone, Link2,
    Brain, Lightbulb, X, Star, Copy, Search, Filter,
    Download, Upload, AlertCircle, Check, XCircle,
    Clock, ExternalLink, ChevronRight, ToggleLeft, ToggleRight,
    Plus, Trash2, GripVertical, RefreshCw, Settings
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";

type ApiField = {
    id: string;
    label: string;
    type?: "password" | "text" | "file" | "database_selector";
    description: string;
    getFrom: string;
    accessType: "Pública" | "Privada";
    cost: "gratis" | "freemium" | "pagado";
    docsUrl?: string;
    testEndpoint?: string;
    testMethod?: 'GET' | 'POST';
};

type ApiApp = {
    id: string;
    name: string;
    icon: any;
    color: string;
    bg: string;
    description: string;
    website: string;
    docsUrl?: string;
    fields: ApiField[];
    fallbackGroup?: string;
};

type ApiCategory = {
    id: string;
    title: string;
    icon: any;
    color: string;
    description: string;
    apps: ApiApp[];
};

type ApiStatus = 'untested' | 'testing' | 'success' | 'error' | 'limit';

type Environment = 'development' | 'production';

type ApiConfig = {
    values: Record<string, string>;
    notes: Record<string, string>;
    favorites: Set<string>;
    status: Record<string, ApiStatus>;
    environment: Environment;
    lastUpdated: Record<string, string>;
};

// Ideas detalladas para cada API
const API_IDEAS: Record<string, { title: string; ideas: { category: string; items: string[] }[] }> = {
    "notion": {
        "title": "💡 Ideas para Notion",
        "ideas": [
            {
                "category": "📊 Gestión de Proyectos Inmobiliarios",
                "items": [
                    "Sincronizar leads calificados desde la web directamente a un pipeline de ventas (Kanban) en Notion.",
                    "Crear un CRM colaborativo donde los agentes inmobiliarios actualicen el estado (contacto, visita, cierre) de cada cliente.",
                    "Generar reportes semanales automáticos de ventas y comisiones, guardándolos en una base de datos central.",
                    "Mantener un repositorio de documentación (planos, permisos, contratos tipo) accesible para todo el equipo.",
                    "Crear un tracker de gastos de obra, donde cada factura subida se sincronice con el presupuesto del proyecto."
                ]
            }
        ]
    },
    "planifyx": {
        "title": "💡 Ideas para Planifyx (WhatsApp QR)",
        "ideas": [
            {
                "category": "📱 WhatsApp Marketing Cero Costo",
                "items": [
                    "Enviar brochures y promociones de nuevos lanzamientos de lotes a bases de datos antiguas sin pagar el alto costo de la API oficial de Meta.",
                    "Automatizar recordatorios de pago: 'Hola [Nombre], tu cuota del lote [Número] vence en 3 días. Págalo aquí: [Link]'.",
                    "Crear un bot simple de pre-calificación que pregunte el presupuesto del cliente antes de pasarlo a un vendedor real.",
                    "Enviar mensajes de 'Feliz Cumpleaños' o 'Aniversario de tu Compra' automáticamente para fidelización.",
                    "Integrar con Supabase para enviar una alerta automática por WhatsApp a tu equipo de ventas cada vez que entre un nuevo lead por la web."
                ]
            }
        ]
    },
    "brand2social": {
        "title": "💡 Ideas para Brand2Social",
        "ideas": [
            {
                "category": "📢 Marketing Inmobiliario Automatizado",
                "items": [
                    "Programar la grilla de contenido mensual (fotos de avances de obra) para que se publique en Facebook, Instagram y LinkedIn simultáneamente.",
                    "Automatizar campañas de 'Teaser': programar una cuenta regresiva para el lanzamiento de un nuevo proyecto inmobiliario.",
                    "Publicar automáticamente un post en redes sociales cada vez que se agrega un nuevo lote o propiedad destacada a tu base de datos.",
                    "Reciclar contenido evergreen (consejos de inversión en bienes raíces) publicándolo en horarios de alto tráfico automáticamente.",
                    "Sincronizar con el CRM para detener publicaciones publicitarias masivas si el proyecto ya alcanzó el 100% de ventas."
                ]
            }
        ]
    },
    "pagos_qr": {
        "title": "💡 Ideas para Pagos QR (Yape/Plin vía Mercado Pago)",
        "ideas": [
            {
                "category": "💸 Separaciones Low-Cost",
                "items": [
                    "Generar un código QR dinámico en pantalla para que el cliente pague los $50 o $100 de separación del terreno al instante desde Yape o Plin.",
                    "Evitar las altas comisiones (4-5%) de procesadores de tarjetas de crédito para montos pequeños usando la red de transferencias inmediatas locales.",
                    "Webhooks en tiempo real: cuando el cliente escanea y paga el QR, el sistema automáticamente marca el lote como 'Separado' en el mapa interactivo.",
                    "Conciliación bancaria automática: asociar cada pago QR con el DNI del cliente en la base de datos sin revisar la cuenta del banco manualmente.",
                    "Generar links de pago por WhatsApp para clientes que no están frente a la computadora, permitiendo reservar su lote en 2 minutos."
                ]
            }
        ]
    },
    "identidad": {
        "title": "💡 Ideas para Validación de Identidad",
        "ideas": [
            {
                "category": "✅ KYC y Contratos Zero-Error",
                "items": [
                    "Autollenado inteligente: El vendedor ingresa el DNI o Cédula, y la API extrae Nombres, Apellidos y Estado Civil para el contrato de compraventa.",
                    "Validación B2B: Al ingresar un RUC de inversionistas, validar si la empresa está 'Habida/Activa' y quién es el representante legal vigente.",
                    "Prevención de fraudes: Evitar que se generen separaciones falsas validando que el documento de identidad realmente exista y corresponda a la persona.",
                    "Enriquecimiento de CRM: Completar automáticamente los perfiles de los leads en Supabase con datos demográficos reales obtenidos por la API.",
                    "Generación de 'Promesas de Compraventa' en PDF automáticamente sin errores de tipeo en los nombres o apellidos."
                ]
            }
        ]
    },
    "cpanel": {
        "title": "💡 Ideas para cPanel / Hosting",
        "ideas": [
            {
                "category": "🌐 Infraestructura y Archivos Pesados",
                "items": [
                    "Despliegue dinámico de Landing Pages: Crear automáticamente un subdominio (ej: valle.bliscorp.com) vía API al crear un nuevo proyecto en el sistema.",
                    "Storage de Planos 4K: Subir archivos muy pesados (renders de 500MB o DWG de AutoCAD) directamente vía FTP para no saturar la base principal.",
                    "Creación de correos corporativos temporales o por proyecto (ventas-valle@bliscorp.com) de manera programática.",
                    "Automatizar respaldos de la base de datos y archivos críticos enviándolos a una carpeta encriptada del servidor mediante un script.",
                    "Servir brochures en PDF pesados mediante el ancho de banda del hosting tradicional, reduciendo costos de transferencia en la nube (AWS/Supabase)."
                ]
            }
        ]
    },
    "ia_llm": {
        "title": "💡 Ideas para Modelos de IA (Gemini, OpenAI, Claude)",
        "ideas": [
            {
                "category": "🤖 Asistentes Virtuales Inmobiliarios",
                "items": [
                    "Chatbot 24/7 entrenado con toda la información de tus proyectos (precios, planos, amenidades) para calificar leads y responder dudas técnicas.",
                    "Redacción mágica de descripciones: Generar textos SEO-friendly, persuasivos y atractivos para cada nuevo lote o proyecto con un solo clic.",
                    "Análisis de sentimiento: Procesar las transcripciones de las llamadas o chats de los vendedores para saber por qué se caen las ventas (objeciones más comunes).",
                    "Traducción automática perfecta para atraer a inversionistas extranjeros que no hablan español (ej. mercado norteamericano o europeo).",
                    "Agente de Up-Selling: Si un cliente pregunta por un lote de 200m2, la IA analiza su perfil y le sugiere sutilmente invertir en uno de 300m2 premium."
                ]
            }
        ]
    },
    "mapas": {
        "title": "💡 Ideas para Mapas y Geolocation",
        "ideas": [
            {
                "category": "🗺️ Mapas de Lotización Interactivos",
                "items": [
                    "Renderizar el plano general del proyecto usando polígonos vectoriales (Mapbox) donde cada lote cambia de color (verde=libre, rojo=vendido) en tiempo real.",
                    "Inteligencia de ubicación: Mostrar al cliente a cuántos minutos exactos (en auto) queda el proyecto de colegios, supermercados o la playa más cercana.",
                    "Geocodificación: Cuando el cliente ingresa su dirección en el formulario de contrato, la API autocompleta el distrito, provincia y código postal correctamente.",
                    "Rutas optimizadas para los asesores inmobiliarios: Calcular el mejor camino para dar un tour por 4 propiedades diferentes en un solo día.",
                    "Mapas de calor (Heatmaps) internos para ver cuáles son las zonas del proyecto más clickeadas o deseadas por los clientes en la web."
                ]
            }
        ]
    },
    "pagos_tarjeta": {
        "title": "💡 Ideas para Pasarelas de Tarjetas",
        "ideas": [
            {
                "category": "💳 Pagos y Cuotas Automatizadas",
                "items": [
                    "Cobro de cuotas mensuales de financiamiento directo (suscripciones): cargar automáticamente la cuota a la tarjeta del cliente cada mes (tokenización).",
                    "Split Payments: Dividir el pago automáticamente entre el desarrollador del proyecto (90%) y la comisión del broker inmobiliario (10%).",
                    "Bloqueo de seguridad: Evitar chargebacks pidiendo autenticación 3D Secure para compras altas.",
                    "Dashboards en tiempo real: Ver el flujo de caja del proyecto desde la aplicación administrativa conectada al dashboard de Stripe/Niubiz.",
                    "Links de pago por SMS/Email para que clientes morosos se pongan al día con un solo clic sin tener que loguearse a una plataforma compleja."
                ]
            }
        ]
    },
    "facturacion": {
        "title": "💡 Ideas para Facturación Electrónica",
        "ideas": [
            {
                "category": "🧾 Facturación Zero-Touch",
                "items": [
                    "Emisión automática de boletas/facturas en el instante en que el webhook de la pasarela de pagos confirma que la cuota de financiamiento fue exitosa.",
                    "Envío del XML y PDF oficial de la factura electrónica por correo al cliente de manera silenciosa (background process).",
                    "Sincronización mensual contable: Exportar un reporte de todas las facturas emitidas por el API directamente para el contador.",
                    "Generación automática de notas de crédito si una reserva/separación es cancelada y devuelta dentro del plazo legal.",
                    "Validación en tiempo real del RUC o Cédula con el ente tributario (SUNAT, SRI, DIAN) para evitar emitir facturas con datos inválidos."
                ]
            }
        ]
    },
    "basedatos": {
        "title": "💡 Ideas para Bases de Datos y Cloud",
        "ideas": [
            {
                "category": "⚡ Arquitectura Backend Robusta",
                "items": [
                    "WebSockets / Realtime: Si el vendedor A y el vendedor B están viendo el mismo lote y A lo vende, en la pantalla de B aparece como 'Vendido' al instante sin recargar la página.",
                    "RLS (Row Level Security): Garantizar que un cliente solo pueda ver sus propios contratos y estado de cuenta, mientras que el admin ve todo.",
                    "Storage encriptado: Guardar contratos firmados digitalmente o escaneos de DNI en buckets seguros con acceso limitado por tokens temporales.",
                    "Autenticación sin contraseñas (Magic Links) para que los inversionistas mayores entren a ver sus reportes sin tener que recordar claves.",
                    "Edge Functions: Correr lógicas complejas (como calcular intereses moratorios de 500 lotes a la vez) en servidores distribuidos geográficamente."
                ]
            }
        ]
    },
    "documentos": {
        "title": "💡 Ideas para Documentos y Firmas",
        "ideas": [
            {
                "category": "📄 Contratos Digitales Automatizados",
                "items": [
                    "Generar automáticamente la 'Promesa de Compraventa' inyectando el nombre del cliente, precio y número de lote en una plantilla (Template) perfecta.",
                    "Enviar el contrato vía API (PandaDoc/DocuSign) para que el cliente y el gerente legal firmen con el dedo desde la pantalla de sus celulares.",
                    "Generar constancias de separación formales en PDF, con el logo de la empresa y un sello de agua de seguridad.",
                    "Crear estados de cuenta mensuales personalizados en PDF para cada cliente mostrando sus cuotas pagadas, saldo pendiente e intereses.",
                    "Automatizar la adición de anexos (planos del lote específico) al final del contrato principal sin intervención manual."
                ]
            }
        ]
    },
    "automatizacion": {
        "title": "💡 Ideas para Make, Zapier, n8n",
        "ideas": [
            {
                "category": "⚙️ Workflow Engine",
                "items": [
                    "Flujo de Leads: Lead de Facebook Ads -> Guardar en Supabase -> Crear Tarea en Notion -> Enviar Email de Bienvenida -> Mandar WhatsApp (Planifyx).",
                    "Conciliación de pagos manuales: Alguien deposita por banco -> Asistente aprueba -> Make genera la Factura Electrónica -> Envía el PDF por email.",
                    "Notificar en el grupo de Slack o Discord interno de la empresa inmediatamente cada vez que se cierra una venta grande de un lote premium.",
                    "Sincronizar el catálogo de lotes disponibles con hojas de cálculo (Google Sheets) para los asesores externos o brokers que no usan la plataforma principal."
                ]
            }
        ]
    },
    "email": {
        "title": "💡 Ideas para Correos Transaccionales",
        "ideas": [
            {
                "category": "📧 Comunicación Confiable (Emails)",
                "items": [
                    "Usar React Email + Resend para enviar recibos de pago con un diseño moderno, asegurando 99% de entrega en la bandeja principal (no spam).",
                    "Envío masivo del 'Boletín de Avance de Obra' mensual a los 500 clientes del proyecto con fotos de los tractores y permisos aprobados.",
                    "Alertas de seguridad (OTP): Enviar códigos de 6 dígitos para validar la cuenta o firmar contratos críticos.",
                    "Seguimiento de apertura (Open Tracking): Ver en el CRM si el cliente ya abrió el correo donde se le envió el contrato de compraventa."
                ]
            }
        ]
    },
    "analytics": {
        "title": "💡 Ideas para Analítica y Comportamiento",
        "ideas": [
            {
                "category": "📊 Business Intelligence y UX",
                "items": [
                    "Análisis de Embudos (Funnels): Descubrir en qué paso se caen los clientes (ej. llenan datos personales pero no terminan de poner la tarjeta).",
                    "Grabación de Sesiones (Hotjar): Ver videos de la pantalla de usuarios anónimos navegando por el mapa de lotes para entender si la interfaz es confusa.",
                    "Atribución de Marketing: Saber exactamente si el cliente que compró el lote #42 vino por un anuncio de Facebook, una búsqueda en Google o referido.",
                    "Retención y Engagement: Medir con qué frecuencia los clientes entran a revisar su estado de cuenta mensual en la plataforma."
                ]
            }
        ]
    },
    "multimedia": {
        "title": "💡 Ideas para Diseño, Video y Stock",
        "ideas": [
            {
                "category": "🎨 Recursos Visuales Automáticos",
                "items": [
                    "Generar portadas de landing pages dinámicas insertando fotos de stock premium de familias felices (Unsplash/Pexels) según la demografía del proyecto.",
                    "Alojar los videos 4K de los recorridos con drones de los terrenos en plataformas privadas (Adilo) sin marca de agua ni anuncios de YouTube.",
                    "Crear automáticamente banners de '¡Lote Vendido!' con el nombre del cliente superpuesto usando la API de Canva para publicarlos en redes.",
                    "Procesamiento masivo de iconos vectoriales para la interfaz gráfica del sistema."
                ]
            }
        ]
    },
    "calendarios": {
        "title": "💡 Ideas para Calendarios y Citas",
        "ideas": [
            {
                "category": "📅 Agendamiento de Tours Inmobiliarios",
                "items": [
                    "Embeber un calendario público para que los prospectos reserven solos un 'Tour por el Terreno' el fin de semana según la disponibilidad de los agentes.",
                    "Round Robin: Asignar las citas de visita equitativamente entre los 5 vendedores del equipo de forma automática.",
                    "Recordatorios automáticos por WhatsApp y Email 24h y 2h antes de la cita para reducir el 'No Show' (cancelaciones fantasma).",
                    "Sincronizar el horario agendado directamente en Google Calendar del asesor y generar el enlace de Google Meet si la cita es virtual."
                ]
            }
        ]
    },
    "logistica": {
        "title": "💡 Ideas para Logística y Envíos",
        "ideas": [
            {
                "category": "🚚 Entregas Físicas (Contratos y Merch)",
                "items": [
                    "Si regalas un llavero o botella de vino al cliente por comprar un lote, generar automáticamente la orden de recojo de Olva/Serpost vía API.",
                    "Mostrar el estado de envío (Tracking: En almacén, En ruta, Entregado) del contrato físico notariado directamente en el portal del cliente.",
                    "Cotizar el precio del envío de documentos legales a provincias en tiempo real antes de cobrarle al cliente final."
                ]
            }
        ]
    },
    "crypto": {
        "title": "💡 Ideas para Crypto Exchanges",
        "ideas": [
            {
                "category": "💱 Pagos Transfronterizos (Cross-Border)",
                "items": [
                    "Cobrar cuotas iniciales o financiadas usando USDT (Tether) o USDC para inversionistas extranjeros, mitigando fricciones de transferencias SWIFT.",
                    "Verificar automáticamente el hash de transacción (TXID) en Binance para confirmar que el cliente depositó correctamente los fondos a la wallet de la empresa.",
                    "Obtener el tipo de cambio de cripto-a-fiat en tiempo real para convertir el precio del lote (ej. $20,000 USD) a fracciones de Bitcoin/Ethereum en el checkout."
                ]
            }
        ]
    },
    "trading": {
        "title": "💡 Ideas para Trading y Bots",
        "ideas": [
            {
                "category": "📈 Gráficos Financieros y Mercados",
                "items": [
                    "Embeber gráficos interactivos de TradingView en tu dashboard interno para ver el rendimiento histórico del tipo de cambio USD a moneda local.",
                    "Si el grupo inmobiliario maneja fondos de inversión, mostrar a los clientes el rendimiento de sus carteras en gráficos profesionales."
                ]
            }
        ]
    },
    "verificacion_bio": {
        "title": "💡 Ideas para Validación Biométrica",
        "ideas": [
            {
                "category": "🛡️ Onboarding y Prevención de Fraude",
                "items": [
                    "Requerir que el cliente suba una foto de su DNI frontal y reverso, y luego se tome una selfie en tiempo real. La IA valida que la persona sea la misma.",
                    "Cumplir con las normativas internacionales de Prevención de Lavado de Activos (AML) para compras de alto valor en bienes raíces.",
                    "Firma de contratos sin notario físico presencial, asegurando mediante biometría legalmente vinculante la intención de compra."
                ]
            }
        ]
    },
    "push": {
        "title": "💡 Ideas para Sockets y Push",
        "ideas": [
            {
                "category": "🔔 Notificaciones Inmediatas",
                "items": [
                    "Enviar notificaciones push al celular de tus vendedores (App / Web) instantáneamente en el segundo que un lead rellena un formulario de interés.",
                    "Notificar a los administradores: 'Pago recibido exitosamente por Lote 45' mediante un popup de sistema usando WebSockets.",
                    "Chat en vivo interno entre asesores y la gerencia de ventas para aprobaciones de descuentos sobre lotes."
                ]
            }
        ]
    },
    "publicidad": {
        "title": "💡 Ideas para Píxeles y Publicidad",
        "ideas": [
            {
                "category": "🎯 Retargeting Avanzado",
                "items": [
                    "Si un usuario vio la información del 'Proyecto Playa' pero no separó el lote, disparar el Meta Pixel para mostrarle anuncios en Instagram al día siguiente.",
                    "Optimizar campañas de Google Ads registrando 'Conversiones' server-side solo cuando el cliente paga la reserva (evitando clics falsos o rebotes).",
                    "Crear audiencias similares (Lookalike) en TikTok Ads basadas en los correos electrónicos de los clientes que ya compraron lotes."
                ]
            }
        ]
    },
    "almacenamiento": {
        "title": "💡 Ideas para Storage y CDN",
        "ideas": [
            {
                "category": "☁️ Carga Ultrarrápida de Renders",
                "items": [
                    "Guardar los renders arquitectónicos 4K de los departamentos en AWS S3 y distribuirlos mediante CloudFront para que carguen rápido a nivel mundial.",
                    "Compresión al vuelo (Cloudinary): Si el usuario entra desde un celular 3G, la API reduce inteligentemente la calidad y tamaño de la foto del plano para que cargue en milisegundos.",
                    "Marcas de agua automáticas en todas las imágenes de avance de obra con el logo de BLIS Corp para evitar robos de identidad visual."
                ]
            }
        ]
    },
    "gamificacion": {
        "title": "💡 Ideas para Gamificación",
        "ideas": [
            {
                "category": "🏆 Fidelización y Referidos",
                "items": [
                    "Sistema de puntos (Coins): Otorgar puntos a los clientes cada vez que pagan su cuota mensual a tiempo. Luego pueden canjear esos puntos por mejoras en su terreno o pagos administrativos.",
                    "Programa de embajadores: Si un cliente trae a un amigo y este compra, el sistema le asigna '10,000 Blis Coins' automáticamente.",
                    "Leaderboard de ventas: Premiar a los asesores comerciales con medallas virtuales o bonuses financieros al alcanzar metas de separaciones mensuales."
                ]
            }
        ]
    }
};

export default function AdminCloudPage() {
    const [showKeys, setShowKeys] = useState<{[key: string]: boolean}>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
    const [expandedApps, setExpandedApps] = useState<Set<string>>(new Set());
    const [ideasModal, setIdeasModal] = useState<{ appId: string; appName: string } | null>(null);

    const toggleCategory = (categoryId: string) => {
        setExpandedCategories(prev => {
            const next = new Set(prev);
            if (next.has(categoryId)) next.delete(categoryId);
            else next.add(categoryId);
            return next;
        });
    };

    const toggleApp = (appId: string) => {
        setExpandedApps(prev => {
            const next = new Set(prev);
            if (next.has(appId)) next.delete(appId);
            else next.add(appId);
            return next;
        });
    };

    const openIdeasModal = (appId: string, appName: string) => {
        setIdeasModal({ appId, appName });
    };

    const closeIdeasModal = () => {
        setIdeasModal(null);
    };

    const getAppIdeas = (appId: string) => {
        const map: Record<string, string> = {
            'notion': 'notion',
            'planifyx': 'planifyx', 'whatsapp': 'planifyx', 'twilio': 'planifyx',
            'brand2social': 'brand2social',
            'cpanel': 'cpanel',
            'gemini': 'ia_llm', 'openai': 'ia_llm', 'groq': 'ia_llm', 'anthropic': 'ia_llm', 'opencodego': 'ia_llm', 'opengozen': 'ia_llm',
            'replicate': 'multimedia', 'stability': 'multimedia', 'elevenlabs': 'multimedia', 'freepik': 'multimedia', 'huggingface': 'multimedia',
            'stripe': 'pagos_tarjeta', 'mercadopago': 'pagos_tarjeta', 'paypal': 'pagos_tarjeta', 'payu_col': 'pagos_tarjeta', 'epayco': 'pagos_tarjeta', 'wompi': 'pagos_tarjeta', 'bancolombia': 'pagos_tarjeta', 'izipay': 'pagos_tarjeta', 'culqi': 'pagos_tarjeta', 'paymentez': 'pagos_tarjeta', 'placetopay': 'pagos_tarjeta',
            'yape_plin': 'pagos_qr',
            'google_maps': 'mapas', 'mapbox': 'mapas', 'locationiq': 'mapas', 'openstreetmap': 'mapas',
            'peruapi': 'identidad', 'reniec': 'identidad', 'registro_civil_ec': 'identidad', 'datauno': 'identidad',
            'apisunat': 'facturacion', 'sri': 'facturacion', 'dian': 'facturacion', 'apiconsult': 'facturacion',
            'olva': 'logistica', 'serpost': 'logistica',
            'binance': 'crypto', 'coinbase': 'crypto', 'kraken': 'crypto', 'bybit': 'crypto', 'okx': 'crypto', 'coinmarketcap': 'crypto', 'coingecko': 'crypto',
            'tradingview': 'trading', 'metatrader': 'trading', 'ibkr': 'trading', 'alpaca': 'trading', 'threecommas': 'trading', 'cryptohopper': 'trading', 'quantconnect': 'trading', 'ccxt': 'trading',
            'resend': 'email', 'sendgrid': 'email', 'mailgun': 'email',
            'pusher': 'push', 'onesignal': 'push', 'pushwoosh': 'push', 'fcm': 'push',
            'canva': 'multimedia', 'adilo': 'multimedia', 'unsplash': 'multimedia', 'pexels': 'multimedia', 'pixabay': 'multimedia', 'brandfetch': 'multimedia', 'envato': 'multimedia', 'iconfinder': 'multimedia', 'flaticon': 'multimedia',
            'youtube': 'multimedia', 'vimeo': 'multimedia',
            'pdfmonkey': 'documentos', 'docspring': 'documentos', 'pandadoc': 'documentos',
            'onfido': 'verificacion_bio', 'jumio': 'verificacion_bio', 'authenteq': 'verificacion_bio',
            'supabase': 'basedatos', 'firebase': 'basedatos', 'mongodb': 'basedatos', 'planetscale': 'basedatos', 'upstash': 'basedatos',
            'adsense': 'publicidad', 'google_ads': 'publicidad', 'meta_pixel': 'publicidad', 'tiktok_pixel': 'publicidad',
            'google_analytics': 'analytics', 'mixpanel': 'analytics', 'hotjar': 'analytics', 'plausible': 'analytics', 'amplitude': 'analytics',
            'pabbly': 'automatizacion', 'make': 'automatizacion', 'n8n': 'automatizacion', 'zapier': 'automatizacion',
            'calendly': 'calendarios', 'calcom': 'calendarios', 'flaxxa': 'calendarios',
            'cloudinary': 'almacenamiento', 'aws_s3': 'almacenamiento',
            'blis_config': 'gamificacion'
        };
        const key = map[appId] || 'basedatos';
        return API_IDEAS[key];
    };

    const [categoryOrder, setCategoryOrder] = useState<number[]>([]);

    useEffect(() => {
        setCategoryOrder(categories.map((_, i) => i));
    }, []);

    const moveCategory = (index: number, direction: 'up' | 'down') => {
        const newOrder = [...categoryOrder];
        if (direction === 'up' && index > 0) {
            [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
        } else if (direction === 'down' && index < newOrder.length - 1) {
            [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
        }
        setCategoryOrder(newOrder);
    };

    // New states for enhanced features
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCost, setFilterCost] = useState<string | null>(null);
    const [filterAccess, setFilterAccess] = useState<string | null>(null);
    const [filterCountry, setFilterCountry] = useState<string | null>(null);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [apiStatus, setApiStatus] = useState<Record<string, ApiStatus>>({});
    const [apiNotes, setApiNotes] = useState<Record<string, string>>({});
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [environment, setEnvironment] = useState<Environment>('production');
    const [lastUpdated, setLastUpdated] = useState<Record<string, string>>({});
    const [showFilters, setShowFilters] = useState(false);
    const [fallbackModal, setFallbackModal] = useState<{ groupId: string; apps: ApiApp[] } | null>(null);
    const [appOrder, setAppOrder] = useState<Record<string, string[]>>({});

    // Toggle favorite
    const toggleFavorite = (appId: string) => {
        const newFavs = new Set(favorites);
        if (newFavs.has(appId)) newFavs.delete(appId);
        else newFavs.add(appId);
        setFavorites(newFavs);
        localStorage.setItem('api_favorites', JSON.stringify([...newFavs]));
    };

    // Copy to clipboard
    const copyToClipboard = async (id: string, value: string) => {
        try {
            await navigator.clipboard.writeText(value);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch {
            console.error('Failed to copy');
        }
    };

    // Test API connection
    const testApiConnection = async (app: ApiApp, field: ApiField) => {
        const key = environment === 'production' ? field.id : `${field.id}_dev`;
        const value = apiValues[key] || apiValues[field.id];
        
        if (!value) {
            setApiStatus(prev => ({ ...prev, [key]: 'error' }));
            return;
        }

        setApiStatus(prev => ({ ...prev, [key]: 'testing' }));

        try {
            if (field.testEndpoint) {
                const headers: Record<string, string> = {
                    'Content-Type': 'application/json',
                };

                if (field.id.includes('key') || field.id.includes('token') || field.id.includes('secret')) {
                    headers['Authorization'] = `Bearer ${value}`;
                } else {
                    headers['X-API-Key'] = value;
                }

                const response = await fetch(field.testEndpoint, {
                    method: field.testMethod || 'GET',
                    headers,
                });

                if (response.ok) {
                    setApiStatus(prev => ({ ...prev, [key]: 'success' }));
                } else if (response.status === 429) {
                    setApiStatus(prev => ({ ...prev, [key]: 'limit' }));
                } else {
                    setApiStatus(prev => ({ ...prev, [key]: 'error' }));
                }
            } else {
                setApiStatus(prev => ({ ...prev, [key]: 'success' }));
            }
        } catch {
            setApiStatus(prev => ({ ...prev, [key]: 'error' }));
        }
    };

    // Get working fallback API
    const getWorkingFallback = (groupId: string) => {
        const groupApps = appOrder[groupId] || [];
        for (const appId of groupApps) {
            const status = apiStatus[appId];
            if (status === 'success') return appId;
        }
        return null;
    };

    // Export configuration
    const exportConfig = () => {
        const config = {
            version: 1,
            environment,
            values: apiValues,
            notes: apiNotes,
            favorites: [...favorites],
            lastUpdated,
            exportedAt: new Date().toISOString(),
        };
        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `blis-apis-config-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Import configuration
    const importConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const config = JSON.parse(event.target?.result as string);
                if (config.values) setApiValues(config.values);
                if (config.notes) setApiNotes(config.notes);
                if (config.favorites) setFavorites(new Set(config.favorites));
                if (config.environment) setEnvironment(config.environment);
                if (config.lastUpdated) setLastUpdated(config.lastUpdated);
                alert('Configuración importada correctamente');
            } catch {
                alert('Error al importar configuración');
            }
        };
        reader.readAsText(file);
    };

    // Save note for an app
    const saveNote = (appId: string, note: string) => {
        setApiNotes(prev => ({ ...prev, [appId]: note }));
        const now = new Date().toISOString();
        setLastUpdated(prev => ({ ...prev, [appId]: now }));
    };

    // Update field value


    // Load saved data from localStorage
    useEffect(() => {
        const savedFavs = localStorage.getItem('api_favorites');
        if (savedFavs) setFavorites(new Set(JSON.parse(savedFavs)));

        const savedNotes = localStorage.getItem('api_notes');
        if (savedNotes) setApiNotes(JSON.parse(savedNotes));

        const savedEnv = localStorage.getItem('api_environment');
        if (savedEnv) setEnvironment(savedEnv as Environment);

        const savedOrder = localStorage.getItem('api_app_order');
        if (savedOrder) setAppOrder(JSON.parse(savedOrder));
    }, []);

    // Save notes to localStorage when changed
    useEffect(() => {
        localStorage.setItem('api_notes', JSON.stringify(apiNotes));
    }, [apiNotes]);

    useEffect(() => {
        localStorage.setItem('api_environment', environment);
    }, [environment]);

    useEffect(() => {
        localStorage.setItem('api_app_order', JSON.stringify(appOrder));
    }, [appOrder]);

    const [apiValues, setApiValues] = useState<{[key: string]: string}>({
        notion_api_key: '',
        notion_version: '2022-06-28',
        brand2social_api_key: '',
        brand2social_user_id: '',
        cpanel_host: '',
        cpanel_username: '',
        cpanel_api_token: '',
        youtube_key: '',
        vimeo_token: '',
        vimeo_client_id: '',
        vimeo_client_secret: '',
        google_maps_key: '',
        mapbox_token: '',
        locationiq_key: '',
        openstreetmap_endpoint: 'https://nominatim.openstreetmap.org',
        supabase_url: '',
        supabase_anon_key: '',
        supabase_service_key: '',
        supabase_db_password: '',
        firebase_api_key: '',
        firebase_auth_domain: '',
        firebase_project_id: '',
        firebase_storage_bucket: '',
        firebase_messaging_sender_id: '',
        firebase_app_id: '',
        cloudinary_cloud_name: '',
        cloudinary_api_key: '',
        cloudinary_api_secret: '',
        s3_bucket: '',
        aws_access_key: '',
        aws_secret_key: '',
        aws_region: '',
        peru_api_token: '',
        tipo_cambio_api: '',
        apisunat_token: '',
        apisunat_env: '',
        apisunat_serie_f: '',
        apisunat_serie_b: '',
        olva_user: '',
        olva_password: '',
        serpost_tracking_url: '',
        reniec_api_token: '',
        apiconsult_token: '',
        apiconsult_p12: '',
        apiconsult_p12_base64: '',
        apiconsult_env: '',
        sri_api_key: '',
        tipo_cambio_ecuador: '',
        registro_civil_ec_token: '',
        dian_api_key: '',
        dian_certificate: '',
        tipo_cambio_colombia: '',
        payu_merchant_id: '',
        payu_api_key: '',
        payu_api_login: '',
        epayco_public_key: '',
        epayco_private_key: '',
        wompi_public_key: '',
        wompi_private_key: '',
        wompi_integrity_key: '',
        bancolombia_client_id: '',
        bancolombia_client_secret: '',
        datauno_api_key: '',
        validaruc_api_key: '',
        gemini_key: '',
        openai_key: '',
        groq_key: '',
        anthropic_key: '',
        huggingface_key: '',
        replicate_key: '',
        stability_key: '',
        elevenlabs_key: '',
        opencodego_key: '',
        opengozen_key: '',
        freepik_key: '',
        freepik_ai_key: '',
        flaxxa_api_key: '',
        flaxxa_auth_token: '',
        flaxxa_webhook_url: '',
        calendly_api_key: '',
        calendly_webhook_url: '',
        calcom_api_key: '',
        calcom_webhook_url: '',
        pabbly_api_key: '',
        make_api_key: '',
        make_team_id: '',
        n8n_api_url: '',
        n8n_api_key: '',
        n8n_webhook_url: '',
        zapier_webhook_url: '',
        izipay_merchant_id: '',
        izipay_public_key: '',
        izipay_client_secret: '',
        culqi_public_key: '',
        culqi_secret_key: '',
        plin_api: '',
        yape_api: '',
        paymentez_key: '',
        placetopay_key: '',
        stripe_public_key: '',
        stripe_secret_key: '',
        stripe_webhook_secret: '',
        mercadopago_access_token: '',
        mercadopago_public_key: '',
        paypal_client_id: '',
        paypal_secret: '',
        binance_api_key: '',
        binance_secret_key: '',
        coinbase_api_key: '',
        coinbase_secret: '',
        kraken_api_key: '',
        kraken_secret: '',
        bybit_api_key: '',
        bybit_secret_key: '',
        okx_api_key: '',
        okx_secret_key: '',
        okx_passphrase: '',
        coinmarketcap_key: '',
        coingecko_key: '',
        tradingview_key: '',
        metatrader_server: '',
        metatrader_login: '',
        metatrader_password: '',
        ibkr_api_key: '',
        ibkr_account_id: '',
        alpaca_api_key: '',
        alpaca_secret_key: '',
        threecommas_api_key: '',
        threecommas_secret: '',
        cryptohopper_api_key: '',
        quantconnect_api_key: '',
        ccxt_exchange: '',
        ccxt_api_key: '',
        ccxt_secret: '',
        planifyx_access_token: '',
        planifyx_instance_id: '',
        planifyx_webhook_url: '',
        twilio_account_sid: '',
        twilio_auth_token: '',
        twilio_phone_number: '',
        whatsapp_token: '',
        whatsapp_phone_id: '',
        whatsapp_business_id: '',
        resend_key: '',
        sendgrid_key: '',
        mailgun_key: '',
        pusher_app_id: '',
        pusher_key: '',
        pusher_secret: '',
        pusher_cluster: '',
        onesignal_app_id: '',
        onesignal_api_key: '',
        pushwoosh_app_id: '',
        pushwoosh_api_key: '',
        fcm_server_key: '',
        fcm_sender_id: '',
        canva_api_key: '',
        adilo_api_key: '',
        adilo_account_id: '',
        pdfmonkey_api_key: '',
        docspring_api_key: '',
        docspring_secret: '',
        pandadoc_api_key: '',
        onfido_api_key: '',
        onfido_webhook_token: '',
        jumio_api_key: '',
        jumio_api_secret: '',
        authenteq_api_key: '',
        mongodb_uri: '',
        mongodb_api_key: '',
        planetscale_api_key: '',
        planetscale_service_token: '',
        upstash_url: '',
        upstash_token: '',
        unsplash_access_key: '',
        unsplash_secret_key: '',
        pexels_api_key: '',
        pixabay_api_key: '',
        brandfetch_api_key: '',
        envato_api_key: '',
        envato_personal_token: '',
        envato_elements_email: '',
        envato_elements_password: '',
        iconfinder_api_key: '',
        flaticon_api_key: '',
        adsense_client_id: '',
        adsense_slot_id: '',
        google_ads_id: '',
        meta_pixel_id: '',
        tiktok_pixel_id: '',
        google_analytics_id: '',
        mixpanel_token: '',
        hotjar_id: '',
        plausible_domain: '',
        amplitude_key: '',
        blis_blog_time: '60',
        blis_blog_coins: '5',
    });

    useEffect(() => { loadApiKeys(); }, []);

    const loadApiKeys = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.from('api_keys').select('key_name, key_value');
            if (error) throw error;
            if (data) {
                const newValues = {...apiValues};
                data.forEach((row: { key_name: string; key_value: string }) => {
                    if (row.key_name in newValues) (newValues as Record<string, string>)[row.key_name] = row.key_value || '';
                });
                setApiValues(newValues);
            }
        } catch {
            const newValues = {...apiValues};
            Object.keys(apiValues).forEach(key => {
                const val = localStorage.getItem(key);
                if (val) (newValues as Record<string, string>)[key] = val;
            });
            setApiValues(newValues);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyChange = (id: string, value: string) => {
        setApiValues(prev => ({...prev, [id]: value}));
        const now = new Date().toISOString();
        setLastUpdated(prev => ({ ...prev, [id]: now }));
    };

    const handleFileChange = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target?.result as string;
            const cleanBase64 = base64.split(',')[1] || base64;
            setApiValues(prev => ({...prev, [id]: cleanBase64}));
        };
        reader.readAsDataURL(file);
    };

    const handleSaveAll = async () => {
        setIsSaving(true);
        try {
            let count = 0;
            for (const [key_name, key_value] of Object.entries(apiValues)) {
                const { error } = await supabase.from('api_keys').upsert({key_name, key_value: key_value || '', updated_at: new Date().toISOString()}, {onConflict: 'key_name'});
                if (!error) count++;
            }
            Object.entries(apiValues).forEach(([k, v]) => localStorage.setItem(k, v));
            localStorage.setItem("blis_ai_config", JSON.stringify({gemini_key: apiValues.gemini_key, openai_key: apiValues.openai_key}));
            window.dispatchEvent(new CustomEvent('blis_config_updated'));
            alert(`✅ ${count} claves guardadas correctamente`);
        } catch {
            Object.entries(apiValues).forEach(([k, v]) => localStorage.setItem(k, v));
            alert("⚠️ Guardado en localStorage (error en Supabase)");
        } finally {
            setIsSaving(false);
        }
    };

    const categories: ApiCategory[] = [
        {
            id: "productividad",
            title: "Productividad",
            icon: Briefcase,
            color: "text-purple-400",
            description: "Notion, gestión de redes sociales, hosting y herramientas de productividad.",
            apps: [
                {
                    id: "notion",
                    name: "Notion",
                    icon: FileText,
                    color: "text-white",
                    bg: "bg-white/10",
                    description: "Base de datos, documentos y wiki de la empresa. Sincroniza información con tu sistema.",
                    website: "notion.so",
                    fields: [
                        { id: "notion_api_key", label: "API Key", type: "password", description: "Token de integración de Notion. Permite leer y escribir en bases de datos.", getFrom: "notion.so → Settings → Integrations → Develop an integration → Create new integration → Secret Token", accessType: "Privada", cost: "gratis" },
                        { id: "notion_version", label: "API Version", type: "text", description: "Versión de la API de Notion a usar. Recomendado: 2022-06-28", getFrom: "Mantener por defecto", accessType: "Pública", cost: "gratis" },
                        { id: "notion_databases", label: "Bases de Datos Conectadas", type: "database_selector", description: "Selecciona y guarda las bases de datos de Notion para usarlas en el sistema.", getFrom: "Se obtienen con tu API Key", accessType: "Privada", cost: "gratis" },
                    ]
                },
                {
                    id: "brand2social",
                    name: "Brand2Social",
                    icon: MessageSquare,
                    color: "text-blue-400",
                    bg: "bg-blue-500/10",
                    description: "Programador y publicador automatizado de contenido para múltiples redes sociales.",
                    website: "brand2social.com",
                    fields: [
                        { id: "brand2social_api_key", label: "API Key", type: "password", description: "Clave de acceso a la API de Brand2Social.", getFrom: "brand2social.com → Settings → API", accessType: "Privada", cost: "pagado" },
                        { id: "brand2social_user_id", label: "User ID", type: "text", description: "Identificador de usuario en Brand2Social.", getFrom: "brand2social.com → Dashboard → Profile", accessType: "Pública", cost: "pagado" },
                    ]
                },
                {
                    id: "cpanel",
                    name: "cPanel / Hosting",
                    icon: Database,
                    color: "text-orange-400",
                    bg: "bg-orange-500/10",
                    description: "Gestión de FTP, archivos pesados y creación automática de subdominios para proyectos.",
                    website: "asurahosting.com",
                    fields: [
                        { id: "cpanel_host", label: "Host", type: "text", description: "Hostname del servidor cPanel (ej: server.asurahosting.com).", getFrom: "cPanel → Home → Server Information → Hostname", accessType: "Pública", cost: "pagado" },
                        { id: "cpanel_username", label: "Username", type: "text", description: "Usuario de acceso a cPanel.", getFrom: "Credenciales proporcionadas por AsuraHosting", accessType: "Pública", cost: "pagado" },
                        { id: "cpanel_api_token", label: "API Token", type: "password", description: "Token para API de cPanel. Generar en: cPanel → Security → Manage API Tokens.", getFrom: "cPanel → Security → Manage API Tokens → Create Token", accessType: "Privada", cost: "gratis" },
                    ]
                },
            ]
        },
        {
            id: "academia",
            title: "Academia",
            icon: Video,
            color: "text-blis-red",
            description: "Plataformas de video y streaming para cursos online y contenido educativo.",
            apps: [
                {
                    id: "youtube",
                    name: "YouTube Data API",
                    icon: Video,
                    color: "text-red-400",
                    bg: "bg-red-500/10",
                    description: "API de YouTube para buscar videos, obtener información de canales, playlists y estadísticas.",
                    website: "console.cloud.google.com/apis/library/youtube.googleapis.com",
                    fields: [
                        { id: "youtube_key", label: "API Key", type: "password", description: "Clave para acceder a YouTube Data API v3. Permite buscar videos, obtener metadatos, etc.", getFrom: "Google Cloud Console → APIs & Services → Credentials → Create API Key", accessType: "Pública", cost: "gratis" },
                    ]
                },
                {
                    id: "vimeo",
                    name: "Vimeo",
                    icon: Video,
                    color: "text-blue-400",
                    bg: "bg-blue-500/10",
                    description: "Plataforma de video profesional. API para upload, gestión y streaming de videos.",
                    website: "developer.vimeo.com",
                    fields: [
                        { id: "vimeo_token", label: "Access Token", type: "password", description: "Token de acceso para la API de Vimeo. Permite subir y gestionar videos.", getFrom: "developer.vimeo.com → My Apps → Create App → Generate Token", accessType: "Privada", cost: "freemium" },
                        { id: "vimeo_client_id", label: "Client ID", type: "text", description: "Identificador de cliente OAuth para autenticación.", getFrom: "developer.vimeo.com → My Apps → Tu App → Client Identifier", accessType: "Pública", cost: "gratis" },
                        { id: "vimeo_client_secret", label: "Client Secret", type: "password", description: "Secreto del cliente OAuth. ⚠️ No exponer en frontend.", getFrom: "developer.vimeo.com → My Apps → Tu App → Client Secret", accessType: "Privada", cost: "gratis" },
                    ]
                },
            ]
        },
        {
            id: "mapas",
            title: "Mapas",
            icon: MapPin,
            color: "text-emerald-400",
            description: "Servicios de mapas, geocodificación y ubicación. Alternativas a Google Maps.",
            apps: [
                {
                    id: "google_maps",
                    name: "Google Maps",
                    icon: MapPin,
                    color: "text-blue-400",
                    bg: "bg-blue-500/10",
                    description: "Maps JavaScript API, Geocoding, Places, Directions. El estándar de la industria.",
                    website: "console.cloud.google.com/apis/library",
                    fields: [
                        { id: "google_maps_key", label: "Maps API Key", type: "password", description: "Clave para usar Google Maps JavaScript API, Geocoding, Places y más.", getFrom: "Console → APIs & Services → Credentials → Create Credentials → API Key", accessType: "Pública", cost: "freemium" },
                    ]
                },
                {
                    id: "mapbox",
                    name: "Mapbox",
                    icon: MapPin,
                    color: "text-purple-400",
                    bg: "bg-purple-500/10",
                    description: "Mapas personalizables y SDK de navegación. Excelente para apps con estilo propio.",
                    website: "mapbox.com",
                    fields: [
                        { id: "mapbox_token", label: "Access Token", type: "password", description: "Token de acceso a Mapbox. Geocoding, directions, maps SDK. 50k requests/mes gratis.", getFrom: "mapbox.com → Account → Access Tokens → Create Primary Token", accessType: "Pública", cost: "freemium" },
                    ]
                },
                {
                    id: "locationiq",
                    name: "LocationIQ",
                    icon: MapPin,
                    color: "text-orange-400",
                    bg: "bg-orange-500/10",
                    description: "Geocodificación gratuita con alto límite. Alternativa económica a Google.",
                    website: "locationiq.com",
                    fields: [
                        { id: "locationiq_key", label: "API Key", type: "password", description: "Clave para LocationIQ API. 5,000 requests/día gratis.", getFrom: "locationiq.com → Free API Key → Register → Get Key", accessType: "Pública", cost: "freemium" },
                    ]
                },
                {
                    id: "openstreetmap",
                    name: "OpenStreetMap (Nominatim)",
                    icon: Globe,
                    color: "text-green-400",
                    bg: "bg-green-500/10",
                    description: "Mapas y geocodificación 100% gratuita. Sin API key, limitado a 1 req/segundo.",
                    website: "nominatim.openstreetmap.org",
                    fields: [
                        { id: "openstreetmap_endpoint", label: "API Endpoint", type: "text", description: "URL base de Nominatim. Por defecto: https://nominatim.openstreetmap.org", getFrom: "Usar endpoint público o instalar tu propia instancia", accessType: "Pública", cost: "gratis" },
                    ]
                },
            ]
        },
        {
            id: "inmobiliaria",
            title: "Inmobiliaria",
            icon: Building2,
            color: "text-emerald-400",
            description: "Bases de datos, autenticación, almacenamiento y servicios en la nube para proyectos.",
            apps: [
                {
                    id: "supabase",
                    name: "Supabase",
                    icon: Database,
                    color: "text-emerald-400",
                    bg: "bg-emerald-500/10",
                    description: "Base de datos PostgreSQL, autenticación, almacenamiento y funciones serverless. Alternativa open-source a Firebase.",
                    website: "supabase.com",
                    fields: [
                        { id: "supabase_url", label: "URL del Proyecto", type: "text", description: "URL base de tu proyecto Supabase. Se usa para todas las llamadas API.", getFrom: "Dashboard → Proyecto → Settings → API → Project URL", accessType: "Pública", cost: "gratis" },
                        { id: "supabase_anon_key", label: "Anon Key", type: "password", description: "Clave pública para operaciones desde el frontend. Tiene permisos limitados por RLS.", getFrom: "Dashboard → Proyecto → Settings → API → Project API keys → anon public", accessType: "Pública", cost: "gratis" },
                        { id: "supabase_service_key", label: "Service Role Key", type: "password", description: "Clave secreta con permisos totales. ⚠️ NUNCA exponer en frontend, solo backend.", getFrom: "Dashboard → Proyecto → Settings → API → Project API keys → service_role (secret)", accessType: "Privada", cost: "gratis" },
                        { id: "supabase_db_password", label: "DB Password", type: "password", description: "Contraseña de la base de datos PostgreSQL. Necesaria para conexiones directas.", getFrom: "Se establece al crear el proyecto", accessType: "Privada", cost: "gratis" },
                    ]
                },
                {
                    id: "firebase",
                    name: "Firebase",
                    icon: Sparkles,
                    color: "text-amber-400",
                    bg: "bg-amber-500/10",
                    description: "Plataforma de desarrollo de Google. Autenticación, base de datos en tiempo real, hosting y storage.",
                    website: "firebase.google.com",
                    fields: [
                        { id: "firebase_api_key", label: "API Key", type: "password", description: "Clave pública de tu proyecto Firebase para inicializar el SDK.", getFrom: "Console → Project Settings → General → Web API Key", accessType: "Pública", cost: "freemium" },
                        { id: "firebase_auth_domain", label: "Auth Domain", type: "text", description: "Dominio de autenticación para login con proveedores sociales.", getFrom: "Console → Project Settings → General → Default domain", accessType: "Pública", cost: "gratis" },
                        { id: "firebase_project_id", label: "Project ID", type: "text", description: "Identificador único del proyecto Firebase.", getFrom: "Console → Project Settings → General → Project ID", accessType: "Pública", cost: "gratis" },
                        { id: "firebase_storage_bucket", label: "Storage Bucket", type: "text", description: "Bucket de almacenamiento para archivos y multimedia.", getFrom: "Console → Storage → Get started → gs://...", accessType: "Pública", cost: "freemium" },
                    ]
                },
                {
                    id: "cloudinary",
                    name: "Cloudinary",
                    icon: Image,
                    color: "text-purple-400",
                    bg: "bg-purple-500/10",
                    description: "CDN y transformación de imágenes en tiempo real. Upload, resize, optimización y entrega.",
                    website: "cloudinary.com/console",
                    fields: [
                        { id: "cloudinary_cloud_name", label: "Cloud Name", type: "text", description: "Nombre de tu cloud, visible en todas las URLs de imagen.", getFrom: "Console → Dashboard → Cloud Name", accessType: "Pública", cost: "freemium" },
                        { id: "cloudinary_api_key", label: "API Key", type: "password", description: "Clave para autenticar operaciones de upload y admin.", getFrom: "Console → Dashboard → API Key", accessType: "Pública", cost: "freemium" },
                        { id: "cloudinary_api_secret", label: "API Secret", type: "password", description: "Secreto para firmar requests. ⚠️ No exponer en frontend.", getFrom: "Console → Dashboard → API Secret", accessType: "Privada", cost: "freemium" },
                    ]
                },
                {
                    id: "aws_s3",
                    name: "AWS S3",
                    icon: Cloud,
                    color: "text-orange-400",
                    bg: "bg-orange-500/10",
                    description: "Almacenamiento de objetos en la nube de Amazon. Ideal para backups y archivos estáticos grandes.",
                    website: "console.aws.amazon.com/s3",
                    fields: [
                        { id: "s3_bucket", label: "Bucket Name", type: "text", description: "Nombre único del bucket S3 donde se guardan los archivos.", getFrom: "S3 Console → Create bucket o usar existente", accessType: "Pública", cost: "pagado" },
                        { id: "aws_access_key", label: "Access Key ID", type: "password", description: "Identificador de acceso para autenticación AWS.", getFrom: "IAM Console → Users → Create Access Key", accessType: "Privada", cost: "pagado" },
                        { id: "aws_secret_key", label: "Secret Access Key", type: "password", description: "Clave secreta del Access Key. ⚠️ Solo se muestra una vez.", getFrom: "IAM Console → Users → Create Access Key → Guardar inmediatamente", accessType: "Privada", cost: "pagado" },
                        { id: "aws_region", label: "Region", type: "text", description: "Región del bucket (ej: us-east-1, sa-east-1).", getFrom: "S3 Console → Bucket → Properties → Region", accessType: "Pública", cost: "gratis" },
                    ]
                },
            ]
        },
        {
            id: "peru",
            title: "APIs Perú",
            icon: MapPin,
            color: "text-blis-red",
            description: "SUNAT, RENIEC, tipo de cambio, logística y servicios gubernamentales para Perú.",
            apps: [
                {
                    id: "peruapi",
                    name: "PeruAPI",
                    icon: Key,
                    color: "text-blis-red",
                    bg: "bg-blis-red/10",
                    description: "API para consultar RUC, DNI y datos de empresas/personas directamente de SUNAT y RENIEC. Útil para validar clientes.",
                    website: "peruapis.dev",
                    fields: [
                        { id: "peru_api_token", label: "Bearer Token", type: "password", description: "Token de autenticación para consultas RUC/DNI. 10 consultas gratis/día en plan gratuito.", getFrom: "peruapis.dev → Registrarse → Dashboard → API Token", accessType: "Privada", cost: "freemium" },
                    ]
                },
                {
                    id: "tipo_cambio",
                    name: "Tipo de Cambio",
                    icon: TrendingUp,
                    color: "text-green-400",
                    bg: "bg-green-500/10",
                    description: "API gratuita para obtener el tipo de cambio SUNAT actual (compra y venta).",
                    website: "apis.net.pe/tipo-cambio",
                    fields: [
                        { id: "tipo_cambio_api", label: "API Token (opcional)", type: "text", description: "Token para aumentar límite de consultas. Sin token: 100/día, con token: más.", getFrom: "apis.net.pe → Registrarse → Obtener token", accessType: "Pública", cost: "gratis" },
                    ]
                },
                {
                    id: "apisunat",
                    name: "ApiSunat",
                    icon: FileText,
                    color: "text-blue-400",
                    bg: "bg-blue-500/10",
                    description: "Servicio de facturación electrónica. Emite comprobantes (facturas, boletas, notas) y envía a SUNAT automáticamente.",
                    website: "apisunat.com",
                    fields: [
                        { id: "apisunat_token", label: "Token de Acceso", type: "password", description: "Token para autenticar emisión de comprobantes.", getFrom: "apisunat.com → Login → Mi Cuenta → API Token", accessType: "Privada", cost: "pagado" },
                        { id: "apisunat_env", label: "Entorno", type: "text", description: "sandbox para pruebas, produccion para emisión real.", getFrom: "apisunat.com → Settings → Environment", accessType: "Pública", cost: "gratis" },
                        { id: "apisunat_serie_f", label: "Serie Facturas", type: "text", description: "Serie por defecto para facturas (ej: F001).", getFrom: "SUNAT → Configuración de series", accessType: "Pública", cost: "gratis" },
                        { id: "apisunat_serie_b", label: "Serie Boletas", type: "text", description: "Serie por defecto para boletas (ej: B001).", getFrom: "SUNAT → Configuración de series", accessType: "Pública", cost: "gratis" },
                    ]
                },
                {
                    id: "olva",
                    name: "Olva Courier",
                    icon: Globe,
                    color: "text-amber-400",
                    bg: "bg-amber-500/10",
                    description: "API de tracking y gestión de envíos con Olva Courier. Estados de paquetes, cotizaciones y más.",
                    website: "olva.com.pe",
                    fields: [
                        { id: "olva_user", label: "Usuario", type: "text", description: "Usuario de la cuenta comercial de Olva.", getFrom: "Contactar comercial@olva.com.pe", accessType: "Privada", cost: "pagado" },
                        { id: "olva_password", label: "Contraseña", type: "password", description: "Contraseña de la cuenta comercial.", getFrom: "Asignada por Olva al crear cuenta", accessType: "Privada", cost: "pagado" },
                    ]
                },
                {
                    id: "serpost",
                    name: "Serpost",
                    icon: Globe,
                    color: "text-red-400",
                    bg: "bg-red-500/10",
                    description: "Seguimiento de envíos del correo nacional del Perú (Serpost).",
                    website: "serpost.com.pe",
                    fields: [
                        { id: "serpost_tracking_url", label: "Endpoint Tracking", type: "text", description: "URL para consultar el estado de los envíos de Serpost. Por defecto: http://websrv.serpost.com.pe/WebAvisoLlegada/ConsultaEnvio.aspx", getFrom: "Es una URL pública y gratuita", accessType: "Pública", cost: "gratis" },
                    ]
                },
                {
                    id: "reniec",
                    name: "RENIEC",
                    icon: Users,
                    color: "text-red-400",
                    bg: "bg-red-500/10",
                    description: "Consultas directas al Registro Nacional de Identificación y Estado Civil. Validación de DNI.",
                    website: "reniec.gob.pe",
                    fields: [
                        { id: "reniec_api_token", label: "API Token", type: "password", description: "Token para consultas a la API de RENIEC. Requiere convenio con la entidad.", getFrom: "Solicitar acceso en RENIEC como entidad desarrolladora", accessType: "Privada", cost: "pagado" },
                    ]
                },
            ]
        },
        {
            id: "ecuador",
            title: "APIs Ecuador",
            icon: MapPin,
            color: "text-yellow-400",
            description: "SRI, Registro Civil, tipo de cambio y servicios gubernamentales para Ecuador.",
            apps: [
                {
                    id: "apiconsult",
                    name: "ApiConsult",
                    icon: FileText,
                    color: "text-blue-400",
                    bg: "bg-blue-500/10",
                    description: "Servicio de facturación electrónica para Ecuador. Emite comprobantes y envía al SRI.",
                    website: "apiconsult.net",
                    fields: [
                        { id: "apiconsult_token", label: "Token API", type: "password", description: "Token de autenticación para el servicio de facturación.", getFrom: "apiconsult.net → Login → API Keys", accessType: "Privada", cost: "pagado" },
                        { id: "apiconsult_p12", label: "Contraseña .p12", type: "password", description: "Contraseña del certificado de firma electrónica (.p12).", getFrom: "Obtenido al comprar firma electrónica", accessType: "Privada", cost: "pagado" },
                        { id: "apiconsult_p12_base64", label: "Archivo .p12", type: "file", description: "Certificado de firma electrónica en base64. Necesario para firmar documentos.", getFrom: "Descargar desde la autoridad certificadora", accessType: "Privada", cost: "pagado" },
                        { id: "apiconsult_env", label: "Entorno", type: "text", description: "pruebas para desarrollo, produccion para emisión real.", getFrom: "apiconsult.net → Settings", accessType: "Pública", cost: "gratis" },
                    ]
                },
                {
                    id: "sri",
                    name: "SRI Directo",
                    icon: Key,
                    color: "text-red-400",
                    bg: "bg-red-500/10",
                    description: "Conexión directa con el SRI (Servicio de Rentas Internas). Consulta de RUC y comprobantes.",
                    website: "sri.gob.ec",
                    fields: [
                        { id: "sri_api_key", label: "API Key", type: "password", description: "Clave de acceso directo al SRI (requiere autorización especial).", getFrom: "Contactar al SRI para acceso como desarrollador", accessType: "Privada", cost: "pagado" },
                    ]
                },
                {
                    id: "registro_civil_ec",
                    name: "Registro Civil Ecuador",
                    icon: Users,
                    color: "text-amber-400",
                    bg: "bg-amber-500/10",
                    description: "Validación de cédulas de identidad ecuatorianas. Consultas al Registro Civil.",
                    website: "registrocivil.gob.ec",
                    fields: [
                        { id: "registro_civil_ec_token", label: "API Token", type: "password", description: "Token para consultas a la API del Registro Civil.", getFrom: "Solicitar acceso como entidad desarrolladora", accessType: "Privada", cost: "pagado" },
                    ]
                },
                {
                    id: "tipo_cambio_ec",
                    name: "Tipo de Cambio",
                    icon: TrendingUp,
                    color: "text-green-400",
                    bg: "bg-green-500/10",
                    description: "API gratuita para obtener tipo de cambio a USD.",
                    website: "exchangerate-api.com",
                    fields: [
                        { id: "tipo_cambio_ecuador", label: "API Endpoint", type: "text", description: "URL de la API gratuita. Por defecto: https://api.exchangerate-api.com/v4/latest/USD", getFrom: "Pública y gratuita", accessType: "Pública", cost: "gratis" },
                    ]
                },
            ]
        },
        {
            id: "colombia",
            title: "APIs Colombia",
            icon: MapPin,
            color: "text-amber-400",
            description: "DIAN, pasarelas de pago, identificación de ciudadanos y servicios para Colombia.",
            apps: [
                {
                    id: "dian",
                    name: "DIAN",
                    icon: FileText,
                    color: "text-yellow-400",
                    bg: "bg-yellow-500/10",
                    description: "Dirección de Impuestos y Aduanas Nacionales. Facturación electrónica colombiana.",
                    website: "dian.gov.co",
                    fields: [
                        { id: "dian_api_key", label: "API Key", type: "password", description: "Clave para emisión de facturas electrónicas ante la DIAN.", getFrom: "DIAN → Habilitación como facturador electrónico", accessType: "Privada", cost: "pagado" },
                        { id: "dian_certificate", label: "Certificado Digital", type: "password", description: "Certificado de firma digital en base64. Requerido para firmar facturas.", getFrom: "Autoridad certificadora autorizada por DIAN", accessType: "Privada", cost: "pagado" },
                    ]
                },
                {
                    id: "payu_col",
                    name: "PayU Colombia",
                    icon: CreditCard,
                    color: "text-orange-400",
                    bg: "bg-orange-500/10",
                    description: "Pasarela de pago líder en LatAm. Soporta tarjetas, PSE, Baloto y más.",
                    website: "payu.com",
                    fields: [
                        { id: "payu_merchant_id", label: "Merchant ID", type: "text", description: "Identificador único del comercio en PayU.", getFrom: "PayU LatAm → Dashboard → Configuration → Merchant ID", accessType: "Pública", cost: "pagado" },
                        { id: "payu_api_key", label: "API Key", type: "password", description: "Clave de API para procesar pagos.", getFrom: "PayU LatAm → Dashboard → Configuration → API Key", accessType: "Privada", cost: "pagado" },
                        { id: "payu_api_login", label: "API Login", type: "text", description: "Login de API para autenticación.", getFrom: "PayU LatAm → Dashboard → Configuration → API Login", accessType: "Pública", cost: "pagado" },
                    ]
                },
                {
                    id: "epayco",
                    name: "ePayco",
                    icon: CreditCard,
                    color: "text-blue-400",
                    bg: "bg-blue-500/10",
                    description: "Pasarela de pago colombiana. Múltiples métodos: tarjetas, PSE, Nequi, Daviplata.",
                    website: "epayco.co",
                    fields: [
                        { id: "epayco_public_key", label: "Public Key", type: "text", description: "Clave pública para integración frontend.", getFrom: "ePayco → Dashboard → Configuración → Llaves API", accessType: "Pública", cost: "pagado" },
                        { id: "epayco_private_key", label: "Private Key", type: "password", description: "Clave privada para backend.", getFrom: "ePayco → Dashboard → Configuración → Llaves API", accessType: "Privada", cost: "pagado" },
                    ]
                },
                {
                    id: "wompi",
                    name: "Wompi",
                    icon: CreditCard,
                    color: "text-pink-400",
                    bg: "bg-pink-500/10",
                    description: "Pasarela moderna colombiana. Soporta QR, tarjetas, PSE y wallets digitales.",
                    website: "wompi.co",
                    fields: [
                        { id: "wompi_public_key", label: "Public Key", type: "text", description: "Clave pública para integraciones frontend.", getFrom: "Wompi → Developer Portal → Credentials", accessType: "Pública", cost: "pagado" },
                        { id: "wompi_private_key", label: "Private Key", type: "password", description: "Clave privada para backend.", getFrom: "Wompi → Developer Portal → Credentials", accessType: "Privada", cost: "pagado" },
                        { id: "wompi_integrity_key", label: "Integrity Key", type: "password", description: "Clave para verificar integridad de transacciones.", getFrom: "Wompi → Developer Portal → Credentials", accessType: "Privada", cost: "pagado" },
                    ]
                },
                {
                    id: "bancolombia",
                    name: "Bancolombia",
                    icon: CreditCard,
                    color: "text-yellow-400",
                    bg: "bg-yellow-500/10",
                    description: "API de transferencias y pagos con cuenta Bancolombia. Transacciones ACH y PSE.",
                    website: "bancolombia.com",
                    fields: [
                        { id: "bancolombia_client_id", label: "Client ID", type: "text", description: "ID de cliente para API de Bancolombia.", getFrom: "Bancolombia → Portal Desarrolladores → Crear App", accessType: "Pública", cost: "pagado" },
                        { id: "bancolombia_client_secret", label: "Client Secret", type: "password", description: "Secreto del cliente para autenticación OAuth.", getFrom: "Bancolombia → Portal Desarrolladores → Crear App", accessType: "Privada", cost: "pagado" },
                    ]
                },
                {
                    id: "datauno",
                    name: "DataUNO",
                    icon: Database,
                    color: "text-green-400",
                    bg: "bg-green-500/10",
                    description: "Datos de personas y empresas en Colombia. Validación de información.",
                    website: "datauno.co",
                    fields: [
                        { id: "datauno_api_key", label: "API Key", type: "password", description: "Clave para acceder a datos de DataUNO.", getFrom: "datauno.co → Registrarse → API Key", accessType: "Privada", cost: "pagado" },
                    ]
                },
                {
                    id: "colombia_tr_tipo_cambio",
                    name: "Tipo de Cambio TRM",
                    icon: TrendingUp,
                    color: "text-green-400",
                    bg: "bg-green-500/10",
                    description: "Tasa Representativa del Mercado oficial de Colombia (Datos Abiertos).",
                    website: "datos.gov.co",
                    fields: [
                        { id: "tipo_cambio_colombia", label: "API Endpoint", type: "text", description: "URL de la API gratuita. Por defecto: https://www.datos.gov.co/resource/32sa-8pi3.json", getFrom: "Socrata API (Pública y gratuita)", accessType: "Pública", cost: "gratis" },
                    ]
                },
            ]
        },
        {
            id: "ia",
            title: "Inteligencia Artificial",
            icon: Sparkles,
            color: "text-purple-400",
            description: "Modelos de lenguaje, generación de imágenes, texto a voz y automatización con IA.",
            apps: [
                {
                    id: "gemini",
                    name: "Google Gemini",
                    icon: Sparkles,
                    color: "text-purple-400",
                    bg: "bg-purple-500/10",
                    description: "Modelo de lenguaje de Google. Generación de texto, análisis de imágenes, código. Tiene capa generosa gratuita.",
                    website: "aistudio.google.com",
                    fields: [
                        { id: "gemini_key", label: "API Key", type: "password", description: "Clave para Gemini API. 15 RPM gratis, hasta 1500 RPD. Ideal para chatbots y análisis.", getFrom: "aistudio.google.com → Get API Key → Create API Key", accessType: "Pública", cost: "gratis" },
                    ]
                },
                {
                    id: "openai",
                    name: "OpenAI",
                    icon: Sparkles,
                    color: "text-green-400",
                    bg: "bg-green-500/10",
                    description: "GPT-4, GPT-4o, DALL-E, Whisper. Líder en modelos de lenguaje y generación de imágenes.",
                    website: "platform.openai.com",
                    fields: [
                        { id: "openai_key", label: "API Key", type: "password", description: "Clave de acceso a todos los modelos de OpenAI. Pago por uso (tokens).", getFrom: "platform.openai.com → API Keys → Create new secret key", accessType: "Privada", cost: "pagado" },
                    ]
                },
                {
                    id: "groq",
                    name: "Groq",
                    icon: TrendingUp,
                    color: "text-blue-400",
                    bg: "bg-blue-500/10",
                    description: "Inferencia ultra-rápida de modelos open source (Llama, Mixtral). API compatible con OpenAI.",
                    website: "console.groq.com",
                    fields: [
                        { id: "groq_key", label: "API Key", type: "password", description: "Clave para Groq Cloud. Tier gratuito generoso, respuesta en milisegundos.", getFrom: "console.groq.com → API Keys → Create API Key", accessType: "Pública", cost: "gratis" },
                    ]
                },
                {
                    id: "anthropic",
                    name: "Anthropic",
                    icon: Sparkles,
                    color: "text-orange-400",
                    bg: "bg-orange-500/10",
                    description: "Claude - modelo de lenguaje con razonamiento avanzado y ventana de contexto muy grande.",
                    website: "console.anthropic.com",
                    fields: [
                        { id: "anthropic_key", label: "API Key", type: "password", description: "Clave para Claude API. $5 crédito inicial, luego pago por tokens.", getFrom: "console.anthropic.com → API Keys → Create Key", accessType: "Privada", cost: "pagado" },
                    ]
                },
                {
                    id: "huggingface",
                    name: "Hugging Face",
                    icon: Sparkles,
                    color: "text-yellow-400",
                    bg: "bg-yellow-500/10",
                    description: "Hub de modelos de IA open source. APIs para NLP, visión por computadora, audio y más.",
                    website: "huggingface.co",
                    fields: [
                        { id: "huggingface_key", label: "Access Token", type: "password", description: "Token para acceder a modelos privados y API Inference.", getFrom: "huggingface.co → Settings → Access Tokens → New token", accessType: "Pública", cost: "gratis" },
                    ]
                },
                {
                    id: "replicate",
                    name: "Replicate",
                    icon: Image,
                    color: "text-pink-400",
                    bg: "bg-pink-500/10",
                    description: "Ejecuta modelos de IA en la nube sin configurar servidores. Generación de imágenes, video, audio.",
                    website: "replicate.com",
                    fields: [
                        { id: "replicate_key", label: "API Token", type: "password", description: "Token para ejecutar modelos en Replicate. Pago por segundo de GPU.", getFrom: "replicate.com → Account → API Token", accessType: "Privada", cost: "pagado" },
                    ]
                },
                {
                    id: "stability",
                    name: "Stability AI",
                    icon: Image,
                    color: "text-purple-400",
                    bg: "bg-purple-500/10",
                    description: "Stable Diffusion y otros modelos de generación de imágenes. Alta calidad y personalización.",
                    website: "platform.stability.ai",
                    fields: [
                        { id: "stability_key", label: "API Key", type: "password", description: "Clave para Stability API. Generación de imágenes con Stable Diffusion.", getFrom: "platform.stability.ai → Account → API Keys", accessType: "Privada", cost: "pagado" },
                    ]
                },
                {
                    id: "elevenlabs",
                    name: "ElevenLabs",
                    icon: Video,
                    color: "text-blue-400",
                    bg: "bg-blue-500/10",
                    description: "Text-to-speech de alta calidad con voces realistas y clonación de voz.",
                    website: "elevenlabs.io",
                    fields: [
                        { id: "elevenlabs_key", label: "API Key", type: "password", description: "Clave para síntesis de voz. 10k caracteres gratis/mes en starter.", getFrom: "elevenlabs.io → Profile → API Key", accessType: "Privada", cost: "freemium" },
                    ]
                },
                {
                    id: "opencodego",
                    name: "Open Code Go",
                    icon: Sparkles,
                    color: "text-emerald-400",
                    bg: "bg-emerald-500/10",
                    description: "Asistente de IA para programación. Generación de código, refactorización, debugging y explicaciones.",
                    website: "opencode.ai",
                    fields: [
                        { id: "opencodego_key", label: "API Key", type: "password", description: "Clave de acceso a Open Code Go. Permite generar código, explicar errores y refactorizar.", getFrom: "opencode.ai → Sign Up → API Keys", accessType: "Privada", cost: "freemium" },
                    ]
                },
                {
                    id: "opengozen",
                    name: "OpenGo Zen",
                    icon: Sparkles,
                    color: "text-cyan-400",
                    bg: "bg-cyan-500/10",
                    description: "Modelo de IA enfocado en razonamiento profundo y tareas complejas. Ideal para análisis e investigación.",
                    website: "opencode.ai",
                    fields: [
                        { id: "opengozen_key", label: "API Key", type: "password", description: "Clave para OpenGo Zen. Modelo especializado en razonamiento y tareas analíticas.", getFrom: "opencode.ai → Dashboard → Zen API Key", accessType: "Privada", cost: "pagado" },
                    ]
                },
                {
                    id: "freepik",
                    name: "Freepik",
                    icon: Image,
                    color: "text-purple-400",
                    bg: "bg-purple-500/10",
                    description: "Plataforma de recursos gráficos con IA. Generación de imágenes, vectores, plantillas y más.",
                    website: "freepik.com",
                    fields: [
                        { id: "freepik_key", label: "API Key", type: "password", description: "Clave para acceder a la API de Freepik. Descarga de assets y recursos gráficos.", getFrom: "freepik.com → Account → API Settings", accessType: "Privada", cost: "freemium" },
                        { id: "freepik_ai_key", label: "Freepik AI Key", type: "password", description: "Clave específica para Freepik AI. Generación de imágenes con IA a partir de texto.", getFrom: "freepik.com → AI Tools → API Access", accessType: "Privada", cost: "pagado" },
                    ]
                },
            ]
        },
        {
            id: "calendar",
            title: "Calendar & Scheduling",
            icon: Calendar,
            color: "text-blue-400",
            description: "Gestión de citas, scheduling y calendario para agendar visitas y reuniones.",
            apps: [
                {
                    id: "flaxxa",
                    name: "Flaxxa Calendar",
                    icon: Calendar,
                    color: "text-purple-400",
                    bg: "bg-purple-500/10",
                    description: "Calendario con API completa. Contactos, eventos, reprogramación y gestión de citas.",
                    website: "flaxxa.com",
                    fields: [
                        { id: "flaxxa_api_key", label: "API Key", type: "password", description: "Clave de API para Flaxxa Calendar.", getFrom: "flaxxa.com → Settings → API → Generate Key", accessType: "Privada", cost: "pagado" },
                        { id: "flaxxa_auth_token", label: "Auth Token", type: "password", description: "Token Bearer para autenticar requests a la API.", getFrom: "flaxxa.com → Settings → API → Auth Token", accessType: "Privada", cost: "pagado" },
                        { id: "flaxxa_webhook_url", label: "Webhook URL", type: "text", description: "URL para recibir eventos de calendario (nuevas citas, cancelaciones).", getFrom: "Configurar en tu servidor o usar webhook.site para pruebas", accessType: "Pública", cost: "gratis" },
                    ]
                },
                {
                    id: "calendly",
                    name: "Calendly",
                    icon: Calendar,
                    color: "text-blue-400",
                    bg: "bg-blue-500/10",
                    description: "Plataforma de scheduling popular. Permite agendar reuniones sin emails来回.",
                    website: "calendly.com",
                    fields: [
                        { id: "calendly_api_key", label: "API Key", type: "password", description: "Clave para Calendly API. Acceso a eventos, scheduling y usuarios.", getFrom: "calendly.com → Integrations → API → Your API Key", accessType: "Privada", cost: "freemium" },
                        { id: "calendly_webhook_url", label: "Webhook URL", type: "text", description: "URL para recibir webhooks de Calendly (invitee created, canceled).", getFrom: "calendly.com → Webhooks → Add Webhook", accessType: "Pública", cost: "gratis" },
                    ]
                },
                {
                    id: "calcom",
                    name: "Cal.com",
                    icon: Calendar,
                    color: "text-emerald-400",
                    bg: "bg-emerald-500/10",
                    description: "Alternativa open-source a Calendly. Self-hosted o cloud. API completa.",
                    website: "cal.com",
                    fields: [
                        { id: "calcom_api_key", label: "API Key", type: "password", description: "Clave para Cal.com API. Auto-hospedado o cloud.", getFrom: "cal.com → Settings → API Keys → Create Key", accessType: "Privada", cost: "gratis" },
                        { id: "calcom_webhook_url", label: "Webhook URL", type: "text", description: "URL para recibir eventos de Cal.com.", getFrom: "cal.com → Settings → Webhooks → Add", accessType: "Pública", cost: "gratis" },
                    ]
                },
            ]
        },
        {
            id: "automatizacion",
            title: "Automatización",
            icon: Zap,
            color: "text-amber-400",
            description: "Conecta apps y automatiza flujos de trabajo sin código. Zapier, Make, n8n, Pabbly.",
            apps: [
                {
                    id: "pabbly",
                    name: "Pabbly Connect",
                    icon: Link2,
                    color: "text-red-400",
                    bg: "bg-red-500/10",
                    description: "Automatización con límite de tareas ilimitado. Versión lifetime disponible. Compatible con 500+ apps.",
                    website: "pabbly.com/connect",
                    fields: [
                        { id: "pabbly_api_key", label: "API Key", type: "password", description: "Clave para acceder a Pabbly API. Permite crear automatizaciones via API.", getFrom: "pabbly.com → Dashboard → API → API Key", accessType: "Privada", cost: "pagado" },
                    ]
                },
                {
                    id: "make",
                    name: "Make (Integromat)",
                    icon: Link2,
                    color: "text-orange-400",
                    bg: "bg-orange-500/10",
                    description: "Plataforma de automatización visual. Scenarios, modules y webhooks para conectar apps.",
                    website: "make.com",
                    fields: [
                        { id: "make_api_key", label: "API Key", type: "password", description: "Clave para Make API. Acceso a scenarios y ejecuciones.", getFrom: "make.com → Settings → API → Create API Key", accessType: "Privada", cost: "freemium" },
                        { id: "make_team_id", label: "Team ID", type: "text", description: "ID del equipo en Make para organizar workspaces.", getFrom: "make.com → Settings → Team → Team ID", accessType: "Pública", cost: "gratis" },
                    ]
                },
                {
                    id: "n8n",
                    name: "n8n",
                    icon: Link2,
                    color: "text-purple-400",
                    bg: "bg-purple-500/10",
                    description: "Automatización open-source. Self-hosted o cloud. Código abierto y extensible.",
                    website: "n8n.io",
                    fields: [
                        { id: "n8n_api_url", label: "Instance URL", type: "text", description: "URL de tu instancia de n8n (ej: https://tu-n8n.com).", getFrom: "URL de tu instalación de n8n", accessType: "Pública", cost: "gratis" },
                        { id: "n8n_api_key", label: "API Key", type: "password", description: "Clave para n8n API. Gestión de workflows y ejecuciones.", getFrom: "n8n → Settings → API → Create API Key", accessType: "Privada", cost: "gratis" },
                        { id: "n8n_webhook_url", label: "Webhook URL", type: "text", description: "URL base para recibir webhooks en n8n.", getFrom: "n8n → Settings → Webhooks", accessType: "Pública", cost: "gratis" },
                    ]
                },
                {
                    id: "zapier",
                    name: "Zapier",
                    icon: Link2,
                    color: "text-orange-400",
                    bg: "bg-orange-500/10",
                    description: "Automatización clásica. Zaps para conectar apps y automatizar tareas repetitivas.",
                    website: "zapier.com",
                    fields: [
                        { id: "zapier_webhook_url", label: "Webhook URL", type: "text", description: "URL de webhook para recibir datos de Zaps entrantes.", getFrom: "Zapier → My Zaps → Webhook → Your unique webhook URL", accessType: "Pública", cost: "freemium" },
                    ]
                },
            ]
        },
        {
            id: "pagos_peru",
            title: "Pagos Perú",
            icon: CreditCard,
            color: "text-pink-400",
            description: "Pasarelas de pago locales para Perú: tarjetas, Yape, Plin, QR.",
            apps: [
                {
                    id: "izipay",
                    name: "Izipay",
                    icon: CreditCard,
                    color: "text-blue-400",
                    bg: "bg-blue-500/10",
                    description: "Pasarela de pago peruana. Soporta tarjetas, Yape, Plin, PagoEfectivo. Integración fácil.",
                    website: "izipay.pe",
                    fields: [
                        { id: "izipay_merchant_id", label: "Merchant ID", type: "text", description: "Identificador único de tu comercio en Izipay.", getFrom: "izipay.pe → Dashboard → Configuración → Comercio", accessType: "Pública", cost: "pagado" },
                        { id: "izipay_public_key", label: "Public Key", type: "password", description: "Clave pública para integración frontend.", getFrom: "izipay.pe → Dashboard → API Keys → Public Key", accessType: "Pública", cost: "pagado" },
                        { id: "izipay_client_secret", label: "Client Secret", type: "password", description: "Secreto para backend. ⚠️ Nunca exponer en frontend.", getFrom: "izipay.pe → Dashboard → API Keys → Secret Key", accessType: "Privada", cost: "pagado" },
                    ]
                },
                {
                    id: "culqi",
                    name: "Culqi",
                    icon: CreditCard,
                    color: "text-green-400",
                    bg: "bg-green-500/10",
                    description: "Pasarela de pago peruana pionera. Tarjetas, Yape, Cuotealo (pago en cuotas).",
                    website: "culqi.com",
                    fields: [
                        { id: "culqi_public_key", label: "Public Key", type: "password", description: "Clave pública para crear tokens de tarjetas en frontend.", getFrom: "panel.culqi.com → Integración → API Keys → Public Key", accessType: "Pública", cost: "pagado" },
                        { id: "culqi_secret_key", label: "Secret Key", type: "password", description: "Clave secreta para crear cargos y gestión. ⚠️ Solo backend.", getFrom: "panel.culqi.com → Integración → API Keys → Secret Key", accessType: "Privada", cost: "pagado" },
                    ]
                },
                {
                    id: "yape_plin",
                    name: "Yape / Plin",
                    icon: CreditCard,
                    color: "text-purple-400",
                    bg: "bg-purple-500/10",
                    description: "Integración de cobros QR (ej. vía Mercado Pago) para evitar altas comisiones de procesadores de tarjetas.",
                    website: "mercadopago.pe/qr",
                    fields: [
                        { id: "yape_api", label: "Token Mercado Pago QR", type: "password", description: "Token para generar QRs dinámicos.", getFrom: "Mercado Pago → Tu Negocio → Locales y Cajas", accessType: "Privada", cost: "pagado" },
                        { id: "plin_api", label: "Webhook Secret (Plin/Yape)", type: "password", description: "Verifica notificaciones de pago exitoso.", getFrom: "Mercado Pago → Notificaciones → Webhooks", accessType: "Privada", cost: "pagado" },
                    ]
                },
            ]
        },
        {
            id: "pagos_ecuador",
            title: "Pagos Ecuador",
            icon: CreditCard,
            color: "text-blue-400",
            description: "Pasarelas de pago para Ecuador: Paymentez, PlaceToPay.",
            apps: [
                {
                    id: "paymentez",
                    name: "Paymentez",
                    icon: CreditCard,
                    color: "text-blue-400",
                    bg: "bg-blue-500/10",
                    description: "Pasarela de pago para Latinoamérica. Popular en Ecuador y México. Tarjetas y bancarios.",
                    website: "paymentez.com",
                    fields: [
                        { id: "paymentez_key", label: "API Key", type: "password", description: "Clave de acceso a Paymentez API.", getFrom: "paymentez.com → Developers → API Keys", accessType: "Privada", cost: "pagado" },
                    ]
                },
                {
                    id: "placetopay",
                    name: "PlaceToPay",
                    icon: CreditCard,
                    color: "text-green-400",
                    bg: "bg-green-500/10",
                    description: "Pasarela de pago vanca. Usada por bancos ecuatorianos. Soporta múltiples bancos.",
                    website: "placetopay.com",
                    fields: [
                        { id: "placetopay_key", label: "API Key", type: "password", description: "Clave de acceso a PlaceToPay.", getFrom: "placetopay.com → Configuración → Credenciales", accessType: "Privada", cost: "pagado" },
                    ]
                },
            ]
        },
        {
            id: "pagos_intl",
            title: "Pagos Internacionales",
            icon: CreditCard,
            color: "text-purple-400",
            description: "Pasarelas de pago globales: Stripe, PayPal, MercadoPago.",
            apps: [
                {
                    id: "stripe",
                    name: "Stripe",
                    icon: CreditCard,
                    color: "text-purple-400",
                    bg: "bg-purple-500/10",
                    description: "Pasarela líder mundial. Tarjetas, Apple Pay, Google Pay, subscripciones, marketplace.",
                    website: "dashboard.stripe.com",
                    fields: [
                        { id: "stripe_public_key", label: "Publishable Key", type: "password", description: "Clave pública para crear tokens de pago en frontend.", getFrom: "dashboard.stripe.com → Developers → API Keys → Publishable key", accessType: "Pública", cost: "pagado" },
                        { id: "stripe_secret_key", label: "Secret Key", type: "password", description: "Clave secreta para crear cargos, refunds, etc. ⚠️ Solo backend.", getFrom: "dashboard.stripe.com → Developers → API Keys → Secret key", accessType: "Privada", cost: "pagado" },
                        { id: "stripe_webhook_secret", label: "Webhook Secret", type: "password", description: "Secreto para verificar webhooks de Stripe (pagos exitosos, etc).", getFrom: "dashboard.stripe.com → Developers → Webhooks → Tu webhook → Signing secret", accessType: "Privada", cost: "gratis" },
                    ]
                },
                {
                    id: "mercadopago",
                    name: "MercadoPago",
                    icon: CreditCard,
                    color: "text-blue-400",
                    bg: "bg-blue-500/10",
                    description: "Pasarela de Mercado Libre. Popular en LatAm. Tarjetas, efectivo, financiamiento.",
                    website: "mercadopago.com/developers",
                    fields: [
                        { id: "mercadopago_access_token", label: "Access Token", type: "password", description: "Token para crear preferencias y pagos. ⚠️ Solo backend.", getFrom: "mercadopago.com/developers → Credentials → Access Token", accessType: "Privada", cost: "pagado" },
                        { id: "mercadopago_public_key", label: "Public Key", type: "password", description: "Clave pública para integración frontend.", getFrom: "mercadopago.com/developers → Credentials → Public Key", accessType: "Pública", cost: "pagado" },
                    ]
                },
                {
                    id: "paypal",
                    name: "PayPal",
                    icon: CreditCard,
                    color: "text-blue-400",
                    bg: "bg-blue-500/10",
                    description: "Pasarela global con checkout familiar. Soporta subscripciones y pagos internacionales.",
                    website: "developer.paypal.com",
                    fields: [
                        { id: "paypal_client_id", label: "Client ID", type: "text", description: "ID público de tu app PayPal para frontend.", getFrom: "developer.paypal.com → Dashboard → My Apps → Tu app → Client ID", accessType: "Pública", cost: "pagado" },
                        { id: "paypal_secret", label: "Client Secret", type: "password", description: "Secreto de tu app PayPal. ⚠️ Solo backend.", getFrom: "developer.paypal.com → Dashboard → My Apps → Tu app → Secret", accessType: "Privada", cost: "pagado" },
                    ]
                },
            ]
        },
        {
            id: "crypto",
            title: "Crypto",
            icon: Coins,
            color: "text-yellow-400",
            description: "Exchanges de criptomonedas y datos de mercado para trading.",
            apps: [
                {
                    id: "binance",
                    name: "Binance",
                    icon: TrendingUp,
                    color: "text-yellow-400",
                    bg: "bg-yellow-500/10",
                    description: "Exchange más grande del mundo por volumen. API completa para spot, futures, staking y más.",
                    website: "binance.com/en/my/settings/api-management",
                    fields: [
                        { id: "binance_api_key", label: "API Key", type: "password", description: "Clave para acceder a Binance API. Crear con permisos limitados (solo lectura o trading sin retiro).", getFrom: "binance.com → Profile → API Management → Create API", accessType: "Privada", cost: "gratis" },
                        { id: "binance_secret_key", label: "Secret Key", type: "password", description: "Secreto para firmar requests. ⚠️ Guardar inmediatamente, no se vuelve a mostrar.", getFrom: "Se muestra solo al crear la API Key", accessType: "Privada", cost: "gratis" },
                    ]
                },
                {
                    id: "coinbase",
                    name: "Coinbase",
                    icon: Coins,
                    color: "text-blue-400",
                    bg: "bg-blue-500/10",
                    description: "Exchange popular para principiantes. API para compra/venta y consulta de precios.",
                    website: "coinbase.com/settings/api",
                    fields: [
                        { id: "coinbase_api_key", label: "API Key", type: "password", description: "Clave de acceso a Coinbase API.", getFrom: "coinbase.com → Settings → API → New API Key", accessType: "Privada", cost: "gratis" },
                        { id: "coinbase_secret", label: "API Secret", type: "password", description: "Secreto para firmar requests de Coinbase.", getFrom: "Se muestra solo al crear la API Key", accessType: "Privada", cost: "gratis" },
                    ]
                },
                {
                    id: "kraken",
                    name: "Kraken",
                    icon: TrendingUp,
                    color: "text-green-400",
                    bg: "bg-green-500/10",
                    description: "Exchange con excelente seguridad y soporte para margin trading. API robusta.",
                    website: "kraken.com/u/settings/api",
                    fields: [
                        { id: "kraken_api_key", label: "API Key", type: "password", description: "Clave para Kraken API. Configurar permisos necesarios.", getFrom: "kraken.com → Settings → API → Generate New Key", accessType: "Privada", cost: "gratis" },
                        { id: "kraken_secret", label: "Private Key", type: "password", description: "Secreto para firmar requests de Kraken.", getFrom: "Se muestra solo al crear la key", accessType: "Privada", cost: "gratis" },
                    ]
                },
                {
                    id: "bybit",
                    name: "Bybit",
                    icon: TrendingUp,
                    color: "text-orange-400",
                    bg: "bg-orange-500/10",
                    description: "Exchange popular para derivatives. API para futures, options y spot trading.",
                    website: "bybit.com",
                    fields: [
                        { id: "bybit_api_key", label: "API Key", type: "password", description: "Clave para Bybit API. Usado para trading y consulta de cuenta.", getFrom: "bybit.com → Perfil → API → Create New API Key", accessType: "Privada", cost: "gratis" },
                        { id: "bybit_secret_key", label: "Secret Key", type: "password", description: "Secreto para firmar requests de Bybit.", getFrom: "Se muestra solo al crear la API Key", accessType: "Privada", cost: "gratis" },
                    ]
                },
                {
                    id: "okx",
                    name: "OKX",
                    icon: TrendingUp,
                    color: "text-white",
                    bg: "bg-white/10",
                    description: "Exchange global con soporte para spot, derivatives, DeFi y NFTs.",
                    website: "okx.com",
                    fields: [
                        { id: "okx_api_key", label: "API Key", type: "password", description: "Clave para OKX API. Acceso a trading y consulta de cuenta.", getFrom: "okx.com → Perfil → API → Create API Key", accessType: "Privada", cost: "gratis" },
                        { id: "okx_secret_key", label: "Secret Key", type: "password", description: "Secreto para firmar requests de OKX.", getFrom: "Se muestra solo al crear la API Key", accessType: "Privada", cost: "gratis" },
                        { id: "okx_passphrase", label: "Passphrase", type: "password", description: "Frase de seguridad creada por ti al configurar la API.", getFrom: "La eliges tú al crear la API Key", accessType: "Privada", cost: "gratis" },
                    ]
                },
                {
                    id: "coinmarketcap",
                    name: "CoinMarketCap",
                    icon: BarChart3,
                    color: "text-blue-400",
                    bg: "bg-blue-500/10",
                    description: "Datos de mercado crypto más usados. Precios, capitalización, volumen, trending.",
                    website: "coinmarketcap.com/api",
                    fields: [
                        { id: "coinmarketcap_key", label: "API Key", type: "password", description: "Clave para CoinMarketCap API. Plan gratis: 10k llamadas/mes.", getFrom: "coinmarketcap.com/api → Sign Up → Create API Key", accessType: "Pública", cost: "freemium" },
                    ]
                },
                {
                    id: "coingecko",
                    name: "CoinGecko",
                    icon: BarChart3,
                    color: "text-green-400",
                    bg: "bg-green-500/10",
                    description: "API gratuita de datos crypto. Precios, charts, trending. Tier gratuito generoso.",
                    website: "coingecko.com/en/api",
                    fields: [
                        { id: "coingecko_key", label: "API Key", type: "password", description: "Clave para CoinGecko API. Plan gratis disponible sin key.", getFrom: "coingecko.com/en/api/pricing → Free tier no requiere key, Demo incluye key", accessType: "Pública", cost: "gratis" },
                    ]
                },
            ]
        },
        {
            id: "trading",
            title: "📈 Trading & Bots",
            icon: TrendingUp,
            color: "text-emerald-400",
            description: "Plataformas de trading algorítmico, bots y herramientas de análisis técnico.",
            apps: [
                {
                    id: "tradingview",
                    name: "TradingView",
                    icon: TrendingUp,
                    color: "text-blue-400",
                    bg: "bg-blue-500/10",
                    description: "Plataforma de análisis técnico líder. Charts en tiempo real, Pine Script para estrategias, alertas.",
                    website: "tradingview.com",
                    fields: [
                        { id: "tradingview_key", label: "API Key", type: "password", description: "Clave para TradingView API. Acceso a charts, indicadores y señales.", getFrom: "tradingview.com → Account → Settings → API Keys", accessType: "Privada", cost: "freemium" },
                    ]
                },
                {
                    id: "metatrader",
                    name: "MetaTrader 4/5",
                    icon: TrendingUp,
                    color: "text-orange-400",
                    bg: "bg-orange-500/10",
                    description: "Plataforma de trading estándar para forex y CFDs. Bots con MQL4/MQL5, backtesting y VPS.",
                    website: "metatrader4.com",
                    fields: [
                        { id: "metatrader_server", label: "Broker Server", type: "text", description: "Nombre del servidor del broker (ej: MetaQuotes-Demo).", getFrom: "Tu broker provee el nombre del servidor", accessType: "Pública", cost: "gratis" },
                        { id: "metatrader_login", label: "Account Login", type: "text", description: "Número de cuenta de trading proporcionado por el broker.", getFrom: "Tu broker → Datos de cuenta", accessType: "Pública", cost: "gratis" },
                        { id: "metatrader_password", label: "Password", type: "password", description: "Contraseña de la cuenta de trading. ⚠️ No compartir.", getFrom: "Tu broker → Datos de cuenta", accessType: "Privada", cost: "gratis" },
                    ]
                },
                {
                    id: "ibkr",
                    name: "Interactive Brokers",
                    icon: TrendingUp,
                    color: "text-green-400",
                    bg: "bg-green-500/10",
                    description: "Broker profesional con API completa. TWS API para bots, datos de mercado, múltiples activos.",
                    website: "interactivebrokers.com",
                    fields: [
                        { id: "ibkr_api_key", label: "API Key", type: "password", description: "Clave para IBKR API. Permite trading automatizado.", getFrom: "interactivebrokers.com → Account Management → API Settings", accessType: "Privada", cost: "pagado" },
                        { id: "ibkr_account_id", label: "Account ID", type: "text", description: "Tu número de cuenta IBKR (formato: DU1234567).", getFrom: "IBKR Portal → Account Information", accessType: "Pública", cost: "gratis" },
                    ]
                },
                {
                    id: "alpaca",
                    name: "Alpaca",
                    icon: TrendingUp,
                    color: "text-purple-400",
                    bg: "bg-purple-500/10",
                    description: "Broker API-first para acciones y crypto. Ideal para bots, backtesting y paper trading gratis.",
                    website: "alpaca.markets",
                    fields: [
                        { id: "alpaca_api_key", label: "API Key", type: "password", description: "Clave para Alpaca API. Acceso a trading de acciones y crypto.", getFrom: "alpaca.markets → Paper/Live Trading → API Keys", accessType: "Pública", cost: "gratis" },
                        { id: "alpaca_secret_key", label: "Secret Key", type: "password", description: "Secreto para firmar requests de Alpaca.", getFrom: "alpaca.markets → API Keys → Create New Key", accessType: "Privada", cost: "gratis" },
                    ]
                },
                {
                    id: "threecommas",
                    name: "3Commas",
                    icon: TrendingUp,
                    color: "text-blue-400",
                    bg: "bg-blue-500/10",
                    description: "Plataforma de bots de trading para crypto. DCA bots, grid bots, smart trades, señales.",
                    website: "3commas.io",
                    fields: [
                        { id: "threecommas_api_key", label: "API Key", type: "password", description: "Clave para 3Commas API. Controla bots y cuentas conectadas.", getFrom: "3commas.io → Profile → API Keys → Create Key", accessType: "Privada", cost: "pagado" },
                        { id: "threecommas_secret", label: "Secret", type: "password", description: "Secreto para firmar requests de 3Commas.", getFrom: "Se muestra solo al crear la API Key", accessType: "Privada", cost: "pagado" },
                    ]
                },
                {
                    id: "cryptohopper",
                    name: "Cryptohopper",
                    icon: TrendingUp,
                    color: "text-teal-400",
                    bg: "bg-teal-500/10",
                    description: "Bot de trading automático para crypto. Estrategias, señales, market making y arbitraje.",
                    website: "cryptohopper.com",
                    fields: [
                        { id: "cryptohopper_api_key", label: "API Key", type: "password", description: "Clave para Cryptohopper API. Controla bots y configuraciones.", getFrom: "cryptohopper.com → Account → API Settings", accessType: "Privada", cost: "pagado" },
                    ]
                },
                {
                    id: "quantconnect",
                    name: "QuantConnect",
                    icon: BarChart3,
                    color: "text-emerald-400",
                    bg: "bg-emerald-500/10",
                    description: "Plataforma de quant research y backtesting. Python/C#, datos históricos, cloud hosting.",
                    website: "quantconnect.com",
                    fields: [
                        { id: "quantconnect_api_key", label: "API Key", type: "password", description: "Clave para QuantConnect API. Acceso a datos y ejecución de algoritmos.", getFrom: "quantconnect.com → Account → API Keys", accessType: "Privada", cost: "freemium" },
                    ]
                },
                {
                    id: "ccxt",
                    name: "CCXT",
                    icon: Sparkles,
                    color: "text-yellow-400",
                    bg: "bg-yellow-500/10",
                    description: "Librería open-source que unifica APIs de 100+ exchanges crypto. Python, JS, PHP, C#.",
                    website: "ccxt.trade",
                    fields: [
                        { id: "ccxt_exchange", label: "Exchange", type: "text", description: "Nombre del exchange a conectar (ej: binance, kraken, coinbase).", getFrom: "Especificar cualquiera de los 100+ exchanges soportados", accessType: "Pública", cost: "gratis" },
                        { id: "ccxt_api_key", label: "API Key", type: "password", description: "Clave del exchange a usar con CCXT.", getFrom: "Obtener del exchange correspondiente", accessType: "Privada", cost: "gratis" },
                        { id: "ccxt_secret", label: "Secret Key", type: "password", description: "Secreto del exchange para CCXT.", getFrom: "Obtener del exchange correspondiente", accessType: "Privada", cost: "gratis" },
                    ]
                },
            ]
        },
        {
            id: "comunicaciones",
            title: "Comunicaciones",
            icon: Mail,
            color: "text-blue-400",
            description: "WhatsApp, email, SMS, push notifications y chat en vivo.",
            apps: [
                {
                    id: "planifyx",
                    name: "Planifyx Social Poster",
                    icon: MessageSquare,
                    color: "text-green-400",
                    bg: "bg-green-500/10",
                    description: "WhatsApp API completa. Bulk campaigns, chatbots, envío de mensajes, grupos y más. IA integrada.",
                    website: "socialposter.planifyx.com",
                    fields: [
                        { id: "planifyx_access_token", label: "Access Token", type: "password", description: "Token de acceso a Planifyx API. Usado en todos los requests.", getFrom: "socialposter.planifyx.com → Dashboard → API Access Token", accessType: "Privada", cost: "pagado" },
                        { id: "planifyx_instance_id", label: "Instance ID", type: "text", description: "ID de la instancia de WhatsApp conectada.", getFrom: "socialposter.planifyx.com → Instances → Tu Instance ID", accessType: "Pública", cost: "pagado" },
                        { id: "planifyx_webhook_url", label: "Webhook URL", type: "text", description: "URL para recibir eventos de WhatsApp (mensajes, estados, etc).", getFrom: "Configurar en tu servidor para recibir eventos", accessType: "Pública", cost: "gratis" },
                    ]
                },
                {
                    id: "twilio",
                    name: "Twilio",
                    icon: Globe,
                    color: "text-red-400",
                    bg: "bg-red-500/10",
                    description: "Plataforma de comunicaciones. SMS, voz, video, WhatsApp Business.",
                    website: "twilio.com/console",
                    fields: [
                        { id: "twilio_account_sid", label: "Account SID", type: "text", description: "Identificador de cuenta Twilio.", getFrom: "twilio.com/console → Dashboard → Account SID", accessType: "Pública", cost: "pagado" },
                        { id: "twilio_auth_token", label: "Auth Token", type: "password", description: "Token de autenticación para API de Twilio.", getFrom: "twilio.com/console → Dashboard → Auth Token (click reveal)", accessType: "Privada", cost: "pagado" },
                        { id: "twilio_phone_number", label: "Phone Number", type: "text", description: "Número de teléfono comprado en Twilio para enviar SMS.", getFrom: "twilio.com/console → Phone Numbers → Manage → Buy a Number", accessType: "Pública", cost: "pagado" },
                    ]
                },
                {
                    id: "whatsapp",
                    name: "WhatsApp Business API",
                    icon: MessageSquare,
                    color: "text-green-400",
                    bg: "bg-green-500/10",
                    description: "API oficial de WhatsApp para empresas. Enviar mensajes masivos y automatizados.",
                    website: "developers.facebook.com/docs/whatsapp",
                    fields: [
                        { id: "whatsapp_token", label: "Access Token", type: "password", description: "Token de acceso permanente para WhatsApp Business API.", getFrom: "developers.facebook.com → Tu App → WhatsApp → Settings → Token", accessType: "Privada", cost: "pagado" },
                        { id: "whatsapp_phone_id", label: "Phone Number ID", type: "text", description: "ID del número de teléfono de WhatsApp Business.", getFrom: "developers.facebook.com → Tu App → WhatsApp → Phone Number ID", accessType: "Pública", cost: "pagado" },
                        { id: "whatsapp_business_id", label: "Business Account ID", type: "text", description: "ID de tu cuenta de WhatsApp Business.", getFrom: "developers.facebook.com → Tu App → WhatsApp → Business Account ID", accessType: "Pública", cost: "gratis" },
                    ]
                },
                {
                    id: "resend",
                    name: "Resend",
                    icon: Mail,
                    color: "text-blue-400",
                    bg: "bg-blue-500/10",
                    description: "Email transaccional moderno. API simple, excelente deliverability. 3k emails/mes gratis.",
                    website: "resend.com",
                    fields: [
                        { id: "resend_key", label: "API Key", type: "password", description: "Clave para enviar emails con Resend. Incluye dominio verificado.", getFrom: "resend.com → API Keys → Create API Key", accessType: "Privada", cost: "freemium" },
                    ]
                },
                {
                    id: "sendgrid",
                    name: "SendGrid",
                    icon: Mail,
                    color: "text-blue-400",
                    bg: "bg-blue-500/10",
                    description: "Email service de Twilio. Marketing y transaccional. 100 emails/día gratis.",
                    website: "sendgrid.com",
                    fields: [
                        { id: "sendgrid_key", label: "API Key", type: "password", description: "Clave para SendGrid API. Permisos: Mail Send.", getFrom: "sendgrid.com → Settings → API Keys → Create API Key", accessType: "Privada", cost: "freemium" },
                    ]
                },
                {
                    id: "mailgun",
                    name: "Mailgun",
                    icon: Mail,
                    color: "text-blue-400",
                    bg: "bg-blue-500/10",
                    description: "Email API para desarrolladores. Tracking, logs, validación de emails.",
                    website: "mailgun.com",
                    fields: [
                        { id: "mailgun_key", label: "API Key", type: "password", description: "Clave privada de Mailgun para enviar emails.", getFrom: "mailgun.com → Dashboard → API Keys → Private API Key", accessType: "Privada", cost: "pagado" },
                    ]
                },
                {
                    id: "pusher",
                    name: "Pusher",
                    icon: Sparkles,
                    color: "text-orange-400",
                    bg: "bg-orange-500/10",
                    description: "WebSockets as a service. Realtime para chat, notificaciones, live updates.",
                    website: "pusher.com",
                    fields: [
                        { id: "pusher_app_id", label: "App ID", type: "text", description: "ID de tu app Pusher.", getFrom: "pusher.com → Dashboard → Tu App → App ID", accessType: "Pública", cost: "freemium" },
                        { id: "pusher_key", label: "Key", type: "password", description: "Clave pública para conectar desde frontend.", getFrom: "pusher.com → Dashboard → Tu App → Key", accessType: "Pública", cost: "freemium" },
                        { id: "pusher_secret", label: "Secret", type: "password", description: "Secreto para autenticar desde backend.", getFrom: "pusher.com → Dashboard → Tu App → Secret", accessType: "Privada", cost: "freemium" },
                        { id: "pusher_cluster", label: "Cluster", type: "text", description: "Región del servidor (ej: us2, eu, mt1).", getFrom: "pusher.com → Dashboard → Tu App → Cluster", accessType: "Pública", cost: "gratis" },
                    ]
                },
                {
                    id: "onesignal",
                    name: "OneSignal",
                    icon: Bell,
                    color: "text-orange-400",
                    bg: "bg-orange-500/10",
                    description: "Push notifications para web, iOS y Android. SDKs fáciles de integrar.",
                    website: "onesignal.com",
                    fields: [
                        { id: "onesignal_app_id", label: "App ID", type: "text", description: "ID de tu app en OneSignal.", getFrom: "onesignal.com → Settings → Keys & IDs → OneSignal App ID", accessType: "Pública", cost: "freemium" },
                        { id: "onesignal_api_key", label: "API Key", type: "password", description: "Clave para enviar notificaciones via API.", getFrom: "onesignal.com → Settings → Keys & IDs → API Key", accessType: "Privada", cost: "freemium" },
                    ]
                },
                {
                    id: "pushwoosh",
                    name: "Pushwoosh",
                    icon: Bell,
                    color: "text-purple-400",
                    bg: "bg-purple-500/10",
                    description: "Push notifications cross-platform. Web, mobile, email y SMS.",
                    website: "pushwoosh.com",
                    fields: [
                        { id: "pushwoosh_app_id", label: "App ID", type: "text", description: "ID de tu app en Pushwoosh.", getFrom: "pushwoosh.com → Settings → Application Settings", accessType: "Pública", cost: "freemium" },
                        { id: "pushwoosh_api_key", label: "API Key", type: "password", description: "Clave para Pushwoosh API.", getFrom: "pushwoosh.com → Settings → API Access", accessType: "Privada", cost: "freemium" },
                    ]
                },
                {
                    id: "fcm",
                    name: "Firebase Cloud Messaging",
                    icon: Bell,
                    color: "text-amber-400",
                    bg: "bg-amber-500/10",
                    description: "Push notifications gratis de Google. Altamente confiable y escalable.",
                    website: "firebase.google.com/docs/cloud-messaging",
                    fields: [
                        { id: "fcm_server_key", label: "Server Key", type: "password", description: "Clave del servidor para enviar mensajes via FCM.", getFrom: "Firebase Console → Project Settings → Cloud Messaging → Server Key", accessType: "Privada", cost: "gratis" },
                        { id: "fcm_sender_id", label: "Sender ID", type: "text", description: "ID del remitente para identificar tu proyecto.", getFrom: "Firebase Console → Project Settings → Cloud Messaging → Sender ID", accessType: "Pública", cost: "gratis" },
                    ]
                },
            ]
        },
        {
            id: "diseno_video",
            title: "Diseño & Video",
            icon: Palette,
            color: "text-pink-400",
            description: "Canva y Adilo para crear diseños y alojar videos.",
            apps: [
                {
                    id: "canva",
                    name: "Canva",
                    icon: Palette,
                    color: "text-purple-400",
                    bg: "bg-purple-500/10",
                    description: "Diseño gráfico con API. Genera imágenes, presentaciones, logos automáticamente.",
                    website: "canva.com/developers",
                    fields: [
                        { id: "canva_api_key", label: "API Key", type: "password", description: "Clave para Canva API. Requiere aprobación de desarrollador.", getFrom: "canva.com/developers → Register → Create App → API Key", accessType: "Privada", cost: "pagado" },
                    ]
                },
                {
                    id: "adilo",
                    name: "Adilo",
                    icon: Video,
                    color: "text-blue-400",
                    bg: "bg-blue-500/10",
                    description: "Hosting de video profesional. Sube, codifica y reproduce videos en tu web.",
                    website: "adilo.com",
                    fields: [
                        { id: "adilo_api_key", label: "API Key", type: "password", description: "Clave para Adilo API. Gestión de videos y broadcasts.", getFrom: "adilo.com → Settings → API → Generate Key", accessType: "Privada", cost: "pagado" },
                        { id: "adilo_account_id", label: "Account ID", type: "text", description: "ID de tu cuenta Adilo.", getFrom: "adilo.com → Dashboard → Account ID", accessType: "Pública", cost: "pagado" },
                    ]
                },
            ]
        },
        {
            id: "recursos_stock",
            title: "Recursos & Stock",
            icon: Image,
            color: "text-cyan-400",
            description: "Bancos de imágenes, videos, iconos y recursos gráficos para diseño.",
            apps: [
                {
                    id: "unsplash",
                    name: "Unsplash",
                    icon: Image,
                    color: "text-white",
                    bg: "bg-black/20",
                    description: "Fotos HD gratuitas de alta calidad. API para búsqueda y descarga automática.",
                    website: "unsplash.com/developers",
                    fields: [
                        { id: "unsplash_access_key", label: "Access Key", type: "password", description: "Clave de acceso para Unsplash API. 50 requests/hora gratis.", getFrom: "unsplash.com/developers → Create Application → Access Key", accessType: "Pública", cost: "gratis" },
                        { id: "unsplash_secret_key", label: "Secret Key", type: "password", description: "Clave secreta para autenticación OAuth.", getFrom: "unsplash.com/developers → Create Application → Secret Key", accessType: "Privada", cost: "gratis" },
                    ]
                },
                {
                    id: "pexels",
                    name: "Pexels",
                    icon: Video,
                    color: "text-emerald-400",
                    bg: "bg-emerald-500/10",
                    description: "Fotos y videos gratuitos. API para búsqueda y descarga. 200 requests/hora gratis.",
                    website: "pexels.com/api",
                    fields: [
                        { id: "pexels_api_key", label: "API Key", type: "password", description: "Clave para Pexels API. Acceso a fotos y videos gratis.", getFrom: "pexels.com/api → Get Started → API Key", accessType: "Pública", cost: "gratis" },
                    ]
                },
                {
                    id: "pixabay",
                    name: "Pixabay",
                    icon: Image,
                    color: "text-green-400",
                    bg: "bg-green-500/10",
                    description: "Imágenes, vectores, ilustraciones y videos gratuitos. 5000 requests/hora.",
                    website: "pixabay.com/api/docs",
                    fields: [
                        { id: "pixabay_api_key", label: "API Key", type: "password", description: "Clave para Pixabay API. Acceso ilimitado a recursos gratis.", getFrom: "pixabay.com/api/docs → Get API Key", accessType: "Pública", cost: "gratis" },
                    ]
                },
                {
                    id: "brandfetch",
                    name: "Brandfetch",
                    icon: Globe,
                    color: "text-blue-400",
                    bg: "bg-blue-500/10",
                    description: "Logos de empresas y marcas. Obtén logos, colores y fuentes automáticamente.",
                    website: "brandfetch.com",
                    fields: [
                        { id: "brandfetch_api_key", label: "API Key", type: "password", description: "Clave para Brandfetch API. 100 requests/mes gratis.", getFrom: "brandfetch.com → Sign Up → API Key", accessType: "Pública", cost: "freemium" },
                    ]
                },
                {
                    id: "envato",
                    name: "Envato Elements",
                    icon: Sparkles,
                    color: "text-green-400",
                    bg: "bg-green-500/10",
                    description: "Suscripción mensual con descargas ilimitadas: plantillas, fotos, videos, gráficos, fuentes, audio.",
                    website: "elements.envato.com",
                    fields: [
                        { id: "envato_api_key", label: "API Key", type: "password", description: "Clave para Envato API. Acceso a catálogo completo con suscripción.", getFrom: "envato.com → Build → Create App → API Key", accessType: "Privada", cost: "pagado" },
                        { id: "envato_personal_token", label: "Personal Token", type: "password", description: "Token personal para autenticación OAuth con Envato.", getFrom: "build.envato.com → My Apps → Create Token", accessType: "Privada", cost: "pagado" },
                        { id: "envato_elements_email", label: "Email de Elements", type: "text", description: "Email de tu cuenta de Envato Elements para descarga automática de plantillas.", getFrom: "Tu email de login en elements.envato.com", accessType: "Privada", cost: "pagado" },
                        { id: "envato_elements_password", label: "Contraseña de Elements", type: "password", description: "Contraseña de tu cuenta de Envato Elements para descarga automática de plantillas.", getFrom: "Tu contraseña de login en elements.envato.com", accessType: "Privada", cost: "pagado" },
                    ]
                },
                {
                    id: "iconfinder",
                    name: "IconFinder",
                    icon: Image,
                    color: "text-orange-400",
                    bg: "bg-orange-500/10",
                    description: "Iconos y logos de alta calidad. Búsqueda de iconos para UI, logos de marcas.",
                    website: "developer.iconfinder.com",
                    fields: [
                        { id: "iconfinder_api_key", label: "API Key", type: "password", description: "Clave para IconFinder API. Búsqueda y descarga de iconos.", getFrom: "iconfinder.com → Settings → API → Create Key", accessType: "Pública", cost: "freemium" },
                    ]
                },
                {
                    id: "flaticon",
                    name: "Flaticon",
                    icon: Image,
                    color: "text-yellow-400",
                    bg: "bg-yellow-500/10",
                    description: "Base de datos de iconos más grande. Parte del grupo Freepik.",
                    website: "flaticon.com",
                    fields: [
                        { id: "flaticon_api_key", label: "API Key", type: "password", description: "Clave para Flaticon API. Acceso a millones de iconos.", getFrom: "flaticon.com → Profile → API Key", accessType: "Pública", cost: "freemium" },
                    ]
                },
            ]
        },
        {
            id: "documentos",
            title: "Documentos & PDF",
            icon: FileCheck,
            color: "text-red-400",
            description: "Generadores de documentos PDF, contratos y firmas digitales.",
            apps: [
                {
                    id: "pdfmonkey",
                    name: "PDFMonkey",
                    icon: FileCheck,
                    color: "text-blue-400",
                    bg: "bg-blue-500/10",
                    description: "Genera PDFs dinámicos desde plantillas. Ideal para facturas, contratos, reportes.",
                    website: "pdfmonkey.io",
                    fields: [
                        { id: "pdfmonkey_api_key", label: "API Key", type: "password", description: "Clave para PDFMonkey API. Generación de PDFs desde plantillas.", getFrom: "pdfmonkey.io → Dashboard → API → API Key", accessType: "Privada", cost: "freemium" },
                    ]
                },
                {
                    id: "docspring",
                    name: "DocSpring",
                    icon: FileCheck,
                    color: "text-purple-400",
                    bg: "bg-purple-500/10",
                    description: "PDF templates con datos dinámicos. Completa plantillas y genera PDFs.",
                    website: "docspring.com",
                    fields: [
                        { id: "docspring_api_key", label: "API Key", type: "password", description: "Clave para DocSpring API.", getFrom: "docspring.com → Settings → API Keys", accessType: "Privada", cost: "pagado" },
                        { id: "docspring_secret", label: "Secret", type: "password", description: "Secreto para firmar requests.", getFrom: "docspring.com → Settings → API Keys", accessType: "Privada", cost: "pagado" },
                    ]
                },
                {
                    id: "pandadoc",
                    name: "PandaDoc",
                    icon: FileCheck,
                    color: "text-green-400",
                    bg: "bg-green-500/10",
                    description: "Propuestas, contratos y documentos con firma electrónica integrada.",
                    website: "pandadoc.com",
                    fields: [
                        { id: "pandadoc_api_key", label: "API Key", type: "password", description: "Clave para PandaDoc API. Crea y envía documentos.", getFrom: "pandadoc.com → Settings → Integrations → API", accessType: "Privada", cost: "pagado" },
                    ]
                },
            ]
        },
        {
            id: "verificacion",
            title: "Verificación de Identidad",
            icon: Users,
            color: "text-amber-400",
            description: "KYC y verificación de identidad para prevenir fraude.",
            apps: [
                {
                    id: "onfido",
                    name: "Onfido",
                    icon: Users,
                    color: "text-blue-400",
                    bg: "bg-blue-500/10",
                    description: "Verificación de identidad con documento y selfie. KYC global con alta precisión.",
                    website: "onfido.com",
                    fields: [
                        { id: "onfido_api_key", label: "API Key", type: "password", description: "Clave para Onfido API. Solicitudes de verificación.", getFrom: "onfido.com → Dashboard → API → API Key", accessType: "Privada", cost: "pagado" },
                        { id: "onfido_webhook_token", label: "Webhook Token", type: "password", description: "Token para verificar webhooks de Onfido.", getFrom: "onfido.com → Dashboard → Webhooks → Token", accessType: "Privada", cost: "gratis" },
                    ]
                },
                {
                    id: "jumio",
                    name: "Jumio",
                    icon: Users,
                    color: "text-green-400",
                    bg: "bg-green-500/10",
                    description: "Verificación de identidad con IA. Document ID verification y liveness check.",
                    website: "jumio.com",
                    fields: [
                        { id: "jumio_api_key", label: "API Key", type: "password", description: "Clave para Jumio API.", getFrom: "jumio.com → Account → API Credentials", accessType: "Privada", cost: "pagado" },
                        { id: "jumio_api_secret", label: "API Secret", type: "password", description: "Secreto para Jumio API.", getFrom: "jumio.com → Account → API Credentials", accessType: "Privada", cost: "pagado" },
                    ]
                },
                {
                    id: "authenteq",
                    name: "Authenteq",
                    icon: Users,
                    color: "text-teal-400",
                    bg: "bg-teal-500/10",
                    description: "Verificación de identidad automatizada. KYC rápido y seguro.",
                    website: "authenteq.com",
                    fields: [
                        { id: "authenteq_api_key", label: "API Key", type: "password", description: "Clave para Authenteq API.", getFrom: "authenteq.com → Developer → API Key", accessType: "Privada", cost: "pagado" },
                    ]
                },
            ]
        },
        {
            id: "bases_datos",
            title: "Bases de Datos",
            icon: Database,
            color: "text-orange-400",
            description: "Bases de datos adicionales: MongoDB, PlanetScale, Redis para caching.",
            apps: [
                {
                    id: "mongodb",
                    name: "MongoDB Atlas",
                    icon: Database,
                    color: "text-green-400",
                    bg: "bg-green-500/10",
                    description: "Base de datos NoSQL en la nube. Flexible, escalable, fácil de usar.",
                    website: "mongodb.com/atlas",
                    fields: [
                        { id: "mongodb_uri", label: "Connection URI", type: "password", description: "URI de conexión a MongoDB Atlas (mongodb+srv://...).", getFrom: "MongoDB Atlas → Clusters → Connect → Connect your application", accessType: "Privada", cost: "freemium" },
                        { id: "mongodb_api_key", label: "API Key", type: "password", description: "Clave API para administración de clusters.", getFrom: "MongoDB Atlas → Security → Database Access → Add New User", accessType: "Privada", cost: "gratis" },
                    ]
                },
                {
                    id: "planetscale",
                    name: "PlanetScale",
                    icon: Database,
                    color: "text-purple-400",
                    bg: "bg-purple-500/10",
                    description: "MySQL serverless. Branching de bases de datos, sin operationes, escalable.",
                    website: "planetscale.com",
                    fields: [
                        { id: "planetscale_api_key", label: "API Key", type: "password", description: "Clave para PlanetScale API.", getFrom: "planetscale.com → Settings → API Tokens → Create New Token", accessType: "Privada", cost: "freemium" },
                        { id: "planetscale_service_token", label: "Service Token", type: "password", description: "Token para acceso service-to-service.", getFrom: "planetscale.com → Settings → Service Tokens", accessType: "Privada", cost: "gratis" },
                    ]
                },
                {
                    id: "upstash",
                    name: "Upstash Redis",
                    icon: Database,
                    color: "text-red-400",
                    bg: "bg-red-500/10",
                    description: "Redis serverless. Cache ultrarrápido para tu aplicación. Ideal para funciones serverless.",
                    website: "upstash.com",
                    fields: [
                        { id: "upstash_url", label: "Redis URL", type: "text", description: "URL de tu base de datos Redis en Upstash.", getFrom: "upstash.com → Console → Tu Database → REST API → URL", accessType: "Pública", cost: "freemium" },
                        { id: "upstash_token", label: "REST Token", type: "password", description: "Token para autenticación con Upstash Redis.", getFrom: "upstash.com → Console → Tu Database → REST API → Token", accessType: "Privada", cost: "freemium" },
                    ]
                },
            ]
        },
        {
            id: "publicidad",
            title: "Publicidad",
            icon: Megaphone,
            color: "text-amber-400",
            description: "Plataformas de publicidad y tracking: AdSense, Meta Pixel, TikTok.",
            apps: [
                {
                    id: "adsense",
                    name: "Google AdSense",
                    icon: Megaphone,
                    color: "text-yellow-400",
                    bg: "bg-yellow-500/10",
                    description: "Monetización con anuncios de Google. Muestra anuncios relevantes en tu sitio.",
                    website: "adsense.google.com",
                    fields: [
                        { id: "adsense_client_id", label: "Publisher ID", type: "text", description: "ID de tu cuenta AdSense (ca-pub-XXXX).", getFrom: "adsense.google.com → Account → Publisher ID", accessType: "Pública", cost: "gratis" },
                        { id: "adsense_slot_id", label: "Ad Slot ID", type: "text", description: "ID del espacio de anuncio específico.", getFrom: "adsense.google.com → Ads → By ad unit → Tu anuncio → Slot ID", accessType: "Pública", cost: "gratis" },
                    ]
                },
                {
                    id: "google_ads",
                    name: "Google Ads",
                    icon: Megaphone,
                    color: "text-blue-400",
                    bg: "bg-blue-500/10",
                    description: "Plataforma de publicidad de Google. Campañas, remarketing, conversions.",
                    website: "ads.google.com",
                    fields: [
                        { id: "google_ads_id", label: "Customer ID", type: "text", description: "ID de tu cuenta de Google Ads (XXX-XXX-XXXX).", getFrom: "ads.google.com → Arriba a la derecha → Customer ID", accessType: "Pública", cost: "pagado" },
                    ]
                },
                {
                    id: "meta_pixel",
                    name: "Meta Pixel",
                    icon: Megaphone,
                    color: "text-blue-400",
                    bg: "bg-blue-500/10",
                    description: "Pixel de Facebook/Instagram para tracking de conversions y remarketing.",
                    website: "business.facebook.com",
                    fields: [
                        { id: "meta_pixel_id", label: "Pixel ID", type: "text", description: "ID del pixel de Meta para tracking.", getFrom: "business.facebook.com → Events Manager → Data Sources → Tu Pixel → ID", accessType: "Pública", cost: "gratis" },
                    ]
                },
                {
                    id: "tiktok_pixel",
                    name: "TikTok Pixel",
                    icon: Megaphone,
                    color: "text-pink-400",
                    bg: "bg-pink-500/10",
                    description: "Pixel de TikTok para tracking de conversions y optimización de campañas.",
                    website: "ads.tiktok.com",
                    fields: [
                        { id: "tiktok_pixel_id", label: "Pixel Code", type: "text", description: "ID del pixel de TikTok Ads.", getFrom: "ads.tiktok.com → Assets → Events → website Pixel → ID", accessType: "Pública", cost: "gratis" },
                    ]
                },
            ]
        },
        {
            id: "analytics",
            title: "Analytics",
            icon: BarChart3,
            color: "text-blue-400",
            description: "Herramientas de análisis y tracking de comportamiento de usuarios.",
            apps: [
                {
                    id: "google_analytics",
                    name: "Google Analytics",
                    icon: BarChart3,
                    color: "text-blue-400",
                    bg: "bg-blue-500/10",
                    description: "Analytics gratuito de Google. Tracking de visitas, conversión, comportamiento.",
                    website: "analytics.google.com",
                    fields: [
                        { id: "google_analytics_id", label: "Measurement ID", type: "text", description: "ID de tu propiedad GA4 (G-XXXXXXXXXX).", getFrom: "analytics.google.com → Admin → Data Streams → Tu stream → Measurement ID", accessType: "Pública", cost: "gratis" },
                    ]
                },
                {
                    id: "mixpanel",
                    name: "Mixpanel",
                    icon: BarChart3,
                    color: "text-purple-400",
                    bg: "bg-purple-500/10",
                    description: "Analytics de producto con funnels, retención y cohorts. Endpoint tracking.",
                    website: "mixpanel.com",
                    fields: [
                        { id: "mixpanel_token", label: "Project Token", type: "password", description: "Token para enviar eventos a Mixpanel.", getFrom: "mixpanel.com → Settings → Project Setup → Token", accessType: "Pública", cost: "freemium" },
                    ]
                },
                {
                    id: "hotjar",
                    name: "Hotjar",
                    icon: BarChart3,
                    color: "text-red-400",
                    bg: "bg-red-500/10",
                    description: "Heatmaps, recordings y feedback tools. Entiende cómo usan tu sitio.",
                    website: "hotjar.com",
                    fields: [
                        { id: "hotjar_id", label: "Site ID", type: "text", description: "ID de tu sitio en Hotjar.", getFrom: "hotjar.com → Sites → Tu sitio → Site ID", accessType: "Pública", cost: "freemium" },
                    ]
                },
                {
                    id: "plausible",
                    name: "Plausible",
                    icon: BarChart3,
                    color: "text-blue-400",
                    bg: "bg-blue-500/10",
                    description: "Analytics simple y privacy-friendly. Sin cookies, GDPR compliant.",
                    website: "plausible.io",
                    fields: [
                        { id: "plausible_domain", label: "Domain", type: "text", description: "Dominio a trackear en Plausible.", getFrom: "plausible.io → Add a website → tu dominio", accessType: "Pública", cost: "pagado" },
                    ]
                },
                {
                    id: "amplitude",
                    name: "Amplitude",
                    icon: BarChart3,
                    color: "text-purple-400",
                    bg: "bg-purple-500/10",
                    description: "Analytics de producto para B2B y B2C. Segmentation, cohorts, experiments.",
                    website: "amplitude.com",
                    fields: [
                        { id: "amplitude_key", label: "API Key", type: "password", description: "Clave para enviar eventos a Amplitude.", getFrom: "amplitude.com → Settings → Projects → API Key", accessType: "Privada", cost: "freemium" },
                    ]
                },
            ]
        },
        {
            id: "gamificacion",
            title: "Gamificación",
            icon: Coins,
            color: "text-emerald-400",
            description: "Sistema de puntos y recompensas para Blis Corp.",
            apps: [
                {
                    id: "blis_config",
                    name: "Configuración Blis",
                    icon: Coins,
                    color: "text-emerald-400",
                    bg: "bg-emerald-500/10",
                    description: "Parámetros del sistema de gamificación de Blis Corp (puntos, coins, recompensas).",
                    website: "Interno",
                    fields: [
                        { id: "blis_blog_time", label: "Tiempo de Lectura (seg)", type: "text", description: "Segundos que el usuario debe estar en un artículo para ganar coins.", getFrom: "Configuración interna", accessType: "Pública", cost: "gratis" },
                        { id: "blis_blog_coins", label: "Coins por Lectura", type: "text", description: "Cantidad de coins otorgados después del tiempo de lectura.", getFrom: "Configuración interna", accessType: "Pública", cost: "gratis" },
                    ]
                },
            ]
        },
    ];

    const totalKeys = Object.keys(apiValues).length;
    const filledKeys = Object.values(apiValues).filter(v => v && v.trim() !== '').length;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-blis-red animate-spin" />
                    <p className="text-gray-400">Cargando configuración...</p>
                </div>
            </div>
        );
    }

    const ideasData = ideasModal ? getAppIdeas(ideasModal.appId) : null;

    return (
        <>
            {/* Ideas Modal */}
            <AnimatePresence>
                {ideasModal && ideasData && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={closeIdeasModal}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-6 border-b border-white/10">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-purple-500/20 rounded-xl">
                                        <Lightbulb className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">{ideasData.title}</h2>
                                        <p className="text-sm text-gray-500">Ideas y posibilidades de implementacion</p>
                                    </div>
                                </div>
                                <button onClick={closeIdeasModal} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                    <X className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {ideasData.ideas.map((cat, idx) => (
                                    <div key={idx} className="space-y-3">
                                        <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">{cat.category}</h3>
                                        <ul className="space-y-2">
                                            {cat.items.map((item, itemIdx) => (
                                                <li key={itemIdx} className="flex gap-3 text-sm text-gray-300">
                                                    <span className="text-purple-400 mt-1">-</span>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 border-t border-white/10 bg-black/20">
                                <button onClick={closeIdeasModal} className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold transition-colors">
                                    Cerrar
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="w-full mx-auto px-4 md:px-12 py-6 md:py-10 pb-24">
            
            {/* Enhanced Header with Stats and Controls */}
            <header className="mb-6 md:mb-8">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 md:gap-6">
                    {/* Left - Title */}
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="p-3 md:p-4 bg-gradient-to-br from-blis-red/20 to-blis-red/5 rounded-2xl border border-blis-red/20">
                            <Cloud className="w-8 h-8 md:w-10 md:h-10 text-blis-red" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">APIs & Cloud</h1>
                            <p className="text-xs md:text-sm text-gray-400 mt-0.5 md:mt-1">Gestión centralizada de servicios externos</p>
                        </div>
                    </div>

                    {/* Environment Toggle */}
                    <div className="flex items-center w-full lg:w-auto mt-2 lg:mt-0">
                        <div className="flex items-center justify-center w-full lg:w-auto gap-1 md:gap-2 bg-white/5 rounded-xl p-1">
                            <button
                                onClick={() => setEnvironment('development')}
                                className={`flex-1 lg:flex-none px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${
                                    environment === 'development' 
                                        ? 'bg-amber-500/20 text-amber-400' 
                                        : 'text-gray-500 hover:text-white'
                                }`}
                            >
                                <Settings className="w-3 h-3 md:w-4 md:h-4 inline mr-1" />
                                Desarrollo
                            </button>
                            <button
                                onClick={() => setEnvironment('production')}
                                className={`flex-1 lg:flex-none px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${
                                    environment === 'production' 
                                        ? 'bg-emerald-500/20 text-emerald-400' 
                                        : 'text-gray-500 hover:text-white'
                                }`}
                            >
                                <ShieldCheck className="w-3 h-3 md:w-4 md:h-4 inline mr-1" />
                                Producción
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mt-6">
                    <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-xl p-3 md:p-4">
                        <div className="flex items-center gap-1.5 md:gap-2 text-gray-400 text-xs md:text-sm">
                            <Key className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            Configuradas
                        </div>
                        <p className="text-xl md:text-2xl font-bold text-white mt-1">{filledKeys} <span className="text-gray-500 text-sm md:text-base">/ {totalKeys}</span></p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-xl p-3 md:p-4">
                        <div className="flex items-center gap-1.5 md:gap-2 text-emerald-400 text-xs md:text-sm">
                            <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            Activas
                        </div>
                        <p className="text-xl md:text-2xl font-bold text-emerald-400 mt-1">
                            {Object.values(apiStatus).filter(s => s === 'success').length}
                        </p>
                    </div>
                    <div className="bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/20 rounded-xl p-3 md:p-4">
                        <div className="flex items-center gap-1.5 md:gap-2 text-red-400 text-xs md:text-sm">
                            <XCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            Error
                        </div>
                        <p className="text-xl md:text-2xl font-bold text-red-400 mt-1">
                            {Object.values(apiStatus).filter(s => s === 'error').length}
                        </p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 rounded-xl p-3 md:p-4">
                        <div className="flex items-center gap-1.5 md:gap-2 text-amber-400 text-xs md:text-sm">
                            <AlertCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            Límite
                        </div>
                        <p className="text-xl md:text-2xl font-bold text-amber-400 mt-1">
                            {Object.values(apiStatus).filter(s => s === 'limit').length}
                        </p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-xl p-3 md:p-4 col-span-2 md:col-span-1">
                        <div className="flex items-center justify-center md:justify-start gap-1.5 md:gap-2 text-purple-400 text-xs md:text-sm">
                            <Star className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            Favoritas
                        </div>
                        <p className="text-xl md:text-2xl font-bold text-purple-400 mt-1 text-center md:text-left">{favorites.size}</p>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="mt-6 space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Buscar APIs por nombre o categoría..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 md:pl-12 pr-4 py-2.5 md:py-3 text-sm md:text-base text-white placeholder-gray-500 focus:outline-none focus:border-blis-red/30 transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                            >
                                <X className="w-4 h-4 md:w-5 md:h-5" />
                            </button>
                        )}
                    </div>

                    {/* Filter Chips */}
                    <div className="flex flex-wrap items-center gap-2 md:gap-3">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
                                showFilters ? 'bg-blis-red/20 text-blis-red border border-blis-red/30' : 'bg-white/5 text-gray-400 border border-white/10 hover:text-white'
                            }`}
                        >
                            <Filter className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            Filtros
                        </button>

                        <button
                            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                            className={`flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
                                showFavoritesOnly ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-white/5 text-gray-400 border border-white/10 hover:text-white'
                            }`}
                        >
                            <Star className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            Favoritas
                        </button>

                        <div className="hidden md:block h-6 w-px bg-white/10" />

                        {/* Cost Filter */}
                        <div className="flex items-center gap-1 w-full md:w-auto mt-2 md:mt-0">
                            <span className="text-[10px] md:text-xs text-gray-500 uppercase mr-1">Costo:</span>
                            {['gratis', 'freemium', 'pagado'].map(cost => (
                                <button
                                    key={cost}
                                    onClick={() => setFilterCost(filterCost === cost ? null : cost)}
                                    className={`px-2 py-1 md:px-3 md:py-1 rounded-lg text-[10px] md:text-xs font-bold transition-all ${
                                        filterCost === cost 
                                            ? cost === 'gratis' ? 'bg-emerald-500/20 text-emerald-400' 
                                            : cost === 'freemium' ? 'bg-amber-500/20 text-amber-400'
                                            : 'bg-red-500/20 text-red-400'
                                            : 'bg-white/5 text-gray-400 hover:text-white'
                                    }`}
                                >
                                    {cost}
                                </button>
                            ))}
                        </div>

                        <div className="hidden md:block h-6 w-px bg-white/10" />

                        {/* Access Filter */}
                        <div className="flex items-center gap-1 w-full md:w-auto">
                            <span className="text-[10px] md:text-xs text-gray-500 uppercase mr-1">Acceso:</span>
                            {['Pública', 'Privada'].map(access => (
                                <button
                                    key={access}
                                    onClick={() => setFilterAccess(filterAccess === access ? null : access)}
                                    className={`px-2 py-1 md:px-3 md:py-1 rounded-lg text-[10px] md:text-xs font-bold transition-all ${
                                        filterAccess === access 
                                            ? access === 'Pública' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'
                                            : 'bg-white/5 text-gray-400 hover:text-white'
                                    }`}
                                >
                                    {access}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 hidden lg:block" />

                        {/* Export/Import */}
                        <div className="flex w-full lg:w-auto gap-2 mt-2 lg:mt-0">
                            <button
                                onClick={exportConfig}
                                className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-bold bg-white/5 text-gray-400 border border-white/10 hover:text-white transition-all"
                                title="Exportar configuración"
                            >
                                <Download className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                Exportar
                            </button>
                            <label className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-bold bg-white/5 text-gray-400 border border-white/10 hover:text-white transition-all cursor-pointer">
                                <Upload className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                Importar
                                <input type="file" accept=".json" onChange={importConfig} className="hidden" />
                            </label>
                        </div>
                    </div>
                </div>
            </header>

            {/* Save All Button */}
            <div className="flex justify-end mb-6">
                <button
                    onClick={handleSaveAll}
                    disabled={isSaving}
                    className={`w-full md:w-auto px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2
                        ${isSaving ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-blis-red text-white hover:bg-blis-red/90'}`}
                >
                    {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : <><CheckCircle2 className="w-4 h-4" /> Guardar Todo</>}
                </button>
            </div>

            {/* Categories */}
            <div className="space-y-6">
                {(() => {
                    const displayCategories: (ApiCategory & { isVirtual?: boolean; originalIndex?: number })[] = [];
                    
                    // Always calculate favorite apps first
                    const allFavApps = categories.flatMap(c => c.apps).filter(app => favorites.has(app.id));
                    
                    // Add Favorites Category if not searching and not showing favorites only (since that just filters normal categories)
                    if (allFavApps.length > 0 && !searchQuery && !showFavoritesOnly) {
                        displayCategories.push({
                            id: 'favorites-section',
                            title: "Favoritos",
                            icon: Star,
                            color: "text-purple-400",
                            description: "Tus APIs y servicios marcados como favoritos para acceso rápido.",
                            apps: allFavApps,
                            isVirtual: true,
                            originalIndex: -1
                        });
                    }

                    // Add the regular categories
                    categoryOrder.forEach((catIdx, originalIndex) => {
                        displayCategories.push({
                            ...categories[catIdx],
                            isVirtual: false,
                            originalIndex
                        });
                    });

                    return displayCategories.map((category, displayIndex) => {
                        // Filter apps based on search, filters, and favorites
                        const filteredApps = category.apps.filter(app => {
                            // Search filter
                            if (searchQuery) {
                                const query = searchQuery.toLowerCase();
                                const matchesName = app.name.toLowerCase().includes(query);
                                const matchesDesc = app.description.toLowerCase().includes(query);
                                const matchesCategory = category.title.toLowerCase().includes(query);
                                if (!matchesName && !matchesDesc && !matchesCategory) return false;
                            }
                            
                            // Favorites filter
                            if (showFavoritesOnly && !favorites.has(app.id)) return false;
                            
                            // Cost filter
                            if (filterCost) {
                                const hasCost = app.fields.some(f => f.cost === filterCost);
                                if (!hasCost) return false;
                            }
                            
                            // Access filter
                            if (filterAccess) {
                                const hasAccess = app.fields.some(f => f.accessType === filterAccess);
                                if (!hasAccess) return false;
                            }
                            
                            return true;
                        });
                        
                        // Skip category if no apps match
                        if (filteredApps.length === 0) return null;
                        
                        // Use a persistent id for state (e.g. expanding) but keep the map key unique
                        const isCatExpanded = expandedCategories.has(category.id);
                        const catAppCount = filteredApps.length;
                        const catFieldCount = filteredApps.reduce((acc, app) => acc + app.fields.length, 0);
                        
                        return (
                            <div key={`${category.id}-${displayIndex}`} className="space-y-3">
                                {/* Category Header */}
                                <div className={`flex flex-col md:flex-row md:items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl border transition-all ${
                                    category.isVirtual 
                                        ? 'bg-gradient-to-r from-purple-500/10 to-transparent border-purple-500/20' 
                                        : 'bg-gradient-to-r from-white/[0.05] to-transparent border-white/5 hover:border-white/10'
                                }`}>
                                    <div className="flex items-center gap-3 w-full">
                                        {/* Reorder Buttons - Vertical (only for real categories, hidden on small mobile if preferred, but let's keep them) */}
                                        {!category.isVirtual && (
                                            <div className="flex flex-col gap-1 mr-1">
                                                <button
                                                    type="button"
                                                    onClick={() => moveCategory(category.originalIndex!, 'up')}
                                                    disabled={category.originalIndex === 0}
                                                    className="p-1 md:p-1.5 hover:bg-white/10 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronUp className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => moveCategory(category.originalIndex!, 'down')}
                                                    disabled={category.originalIndex === categoryOrder.length - 1}
                                                    className="p-1 md:p-1.5 hover:bg-white/10 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
                                                </button>
                                            </div>
                                        )}

                                        {/* Main Header - Clickable */}
                                        <button
                                            type="button"
                                            onClick={() => toggleCategory(category.id)}
                                            className="flex-1 flex flex-col md:flex-row md:items-center justify-between group gap-3"
                                        >
                                            <div className="flex items-center gap-3 md:gap-4 text-left">
                                                <div className={`p-2.5 md:p-3 rounded-xl ${category.color.replace('text-', 'bg-')}/10 flex-shrink-0`}>
                                                    <category.icon className={`w-5 h-5 md:w-6 md:h-6 ${category.color}`} />
                                                </div>
                                                <div>
                                                    <h2 className="text-lg md:text-xl font-bold text-white">{category.title}</h2>
                                                    <p className="text-sm md:text-base text-gray-500 mt-0.5 md:mt-1">{category.description}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center self-end md:self-auto gap-3 md:gap-4 mt-1 md:mt-0">
                                                <span className="text-xs md:text-base text-gray-500 bg-white/5 px-2 py-1 md:px-3 md:py-1.5 rounded-lg whitespace-nowrap">
                                                    {catAppCount} {catAppCount === 1 ? 'app' : 'apps'} <span className="hidden sm:inline">· {catFieldCount} {catFieldCount === 1 ? 'clave' : 'claves'}</span>
                                                </span>
                                                {isCatExpanded ? <ChevronUp className="w-4 h-4 md:w-5 md:h-5 text-gray-400" /> : <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />}
                                            </div>
                                        </button>
                                    </div>
                                </div>

                            {/* Apps Grid */}
                            <AnimatePresence>
                                {isCatExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                        className="overflow-hidden"
                                    >
                                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
                                            {filteredApps.map(app => {
                                                const isAppExpanded = expandedApps.has(app.id);
                                                const costs = [...new Set(app.fields.map(f => f.cost))];
                                                const accesses = [...new Set(app.fields.map(f => f.accessType))];
                                                const costLabel = costs.length === 1 ? costs[0] : 'mixto';
                                                const accessLabel = accesses.length === 1 ? accesses[0] : 'mixto';
                                                const isFavorite = favorites.has(app.id);
                                                const appStatus = Object.keys(app.fields).some(fId => {
                                                    const status = apiStatus[app.fields[parseInt(fId)].id];
                                                    return status === 'success';
                                                }) ? 'success' : Object.keys(app.fields).some(fId => apiStatus[app.fields[parseInt(fId)].id] === 'error') ? 'error' : 'untested';
                                                
                                                return (
                                                    <div key={app.id} className="bg-[#0a0a0a] border border-white/5 rounded-xl overflow-hidden">
                                                        {/* App Header */}
                                                        <div className="p-3 md:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4 hover:bg-white/[0.02] transition-colors">
                                                            <div className="flex items-start sm:items-center gap-2 md:gap-3 w-full">
                                                                {/* Left Controls */}
                                                                <div className="flex items-center gap-2 mt-1 sm:mt-0">
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => { e.stopPropagation(); toggleFavorite(app.id); }}
                                                                        className={`transition-colors ${isFavorite ? 'text-purple-400' : 'text-gray-600 hover:text-purple-400'}`}
                                                                    >
                                                                        <Star className={`w-4 h-4 md:w-5 md:h-5 ${isFavorite ? 'fill-current' : ''}`} />
                                                                    </button>
                                                                    <div className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full flex-shrink-0 ${
                                                                        appStatus === 'success' ? 'bg-emerald-400' :
                                                                        appStatus === 'error' ? 'bg-red-400' :
                                                                        appStatus === 'testing' as any ? 'bg-amber-400 animate-pulse' :
                                                                        'bg-gray-600'
                                                                    }`} title={`Estado: ${appStatus}`} />
                                                                </div>
                                                                
                                                                {/* Icon */}
                                                                <div className={`p-1.5 md:p-2 rounded-lg ${app.bg} flex-shrink-0`}>
                                                                    <app.icon className={`w-4 h-4 md:w-5 md:h-5 ${app.color}`} />
                                                                </div>
                                                                
                                                                {/* Info */}
                                                                <div className="text-left flex-1 min-w-0">
                                                                    <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                                                                        <h3 className="text-sm md:text-base font-bold text-white truncate max-w-[150px] sm:max-w-full">{app.name}</h3>
                                                                        <span className={`text-[9px] md:text-xs font-bold uppercase px-1.5 py-0.5 md:px-2 md:py-0.5 rounded whitespace-nowrap
                                                                            ${costLabel === 'gratis' ? 'bg-emerald-500/10 text-emerald-400' :
                                                                              costLabel === 'freemium' ? 'bg-amber-500/10 text-amber-400' :
                                                                              costLabel === 'mixto' ? 'bg-blue-500/10 text-blue-400' :
                                                                              'bg-red-500/10 text-red-400'}`}>
                                                                            {costLabel}
                                                                        </span>
                                                                        <span className={`text-[9px] md:text-xs font-bold uppercase px-1.5 py-0.5 md:px-2 md:py-0.5 rounded whitespace-nowrap
                                                                            ${accessLabel === 'Pública' ? 'bg-blue-500/10 text-blue-400' :
                                                                              accessLabel === 'mixto' ? 'bg-purple-500/10 text-purple-400' :
                                                                              'bg-orange-500/10 text-orange-400'}`}>
                                                                            {accessLabel}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-xs md:text-sm text-gray-500 line-clamp-2 mt-0.5 md:mt-1">{app.description}</p>
                                                                </div>
                                                            </div>

                                                            {/* Actions Right */}
                                                            <div className="flex items-center self-end sm:self-auto gap-1 md:gap-2 bg-black/20 sm:bg-transparent p-1 sm:p-0 rounded-lg">
                                                                <span className="text-[10px] md:text-sm text-gray-600 bg-white/5 px-1.5 py-0.5 md:px-2 md:py-1 rounded hidden sm:inline-block">
                                                                    {app.fields.length} <span className="hidden lg:inline">campos</span>
                                                                </span>
                                                                
                                                                {/* Copy Button */}
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        const firstKey = app.fields[0]?.id;
                                                                        if (firstKey && apiValues[firstKey]) {
                                                                            copyToClipboard(firstKey, apiValues[firstKey]);
                                                                        }
                                                                    }}
                                                                    className={`p-1.5 md:p-2 rounded-lg transition-colors ${
                                                                        copiedId && copiedId === app.fields[0]?.id
                                                                            ? 'bg-emerald-500/20 text-emerald-400'
                                                                            : 'text-gray-500 hover:text-white hover:bg-white/10'
                                                                    }`}
                                                                    title="Copiar primer valor"
                                                                >
                                                                    {copiedId && copiedId === app.fields[0]?.id ? <Check className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Copy className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                                                                </button>
                                                                
                                                                {/* Test Button */}
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        app.fields.forEach(f => testApiConnection(app, f));
                                                                    }}
                                                                    className="p-1.5 md:p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
                                                                    title="Probar conexión"
                                                                >
                                                                    <RefreshCw className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                                </button>
                                                                
                                                                {/* Ideas Button */}
                                                                <div
                                                                    onClick={(e) => { e.stopPropagation(); openIdeasModal(app.id, app.name); }}
                                                                    className="text-purple-400 hover:text-purple-300 transition-colors p-1.5 md:p-2 cursor-pointer rounded-lg hover:bg-white/10"
                                                                    title="Ideas de uso"
                                                                >
                                                                    <Brain className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                                </div>
                                                                
                                                                {/* Docs Link */}
                                                                {app.docsUrl && (
                                                                    <a
                                                                        href={app.docsUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        className="text-gray-500 hover:text-white transition-colors p-1.5 md:p-2 rounded-lg hover:bg-white/10"
                                                                        title="Documentación"
                                                                    >
                                                                        <ExternalLink className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                                    </a>
                                                                )}
                                                                
                                                                {/* Website Link */}
                                                                <a
                                                                    href={`https://${app.website}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    className="text-gray-500 hover:text-white transition-colors p-1.5 md:p-2 rounded-lg hover:bg-white/10"
                                                                    title="Sitio web"
                                                                >
                                                                    <Globe className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                                </a>
                                                                
                                                                {/* Expand Button */}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleApp(app.id)}
                                                                    className="p-1.5 md:p-2 rounded-lg hover:bg-white/10 transition-colors"
                                                                >
                                                                    {isAppExpanded ? <ChevronUp className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" />}
                                                                </button>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Click to expand hint */}
                                                        {!isAppExpanded && (
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleApp(app.id)}
                                                                className="w-full py-2 text-xs text-gray-600 hover:text-gray-400 hover:bg-white/5 transition-colors border-t border-white/5"
                                                            >
                                                                Click para ver {app.fields.length} campo{app.fields.length > 1 ? 's' : ''}
                                                            </button>
                                                        )}

                                                            {/* App Fields */}
                                                        <AnimatePresence>
                                                            {isAppExpanded && (
                                                                <motion.div
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: "auto", opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                    transition={{ duration: 0.1 }}
                                                                    className="overflow-hidden"
                                                                >
                                                                    <div className="px-3 md:px-4 pb-3 md:pb-4 space-y-3 md:space-y-4">
                                                                        {/* Action buttons */}
                                                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                                                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                                                                <button
                                                                                    onClick={() => app.fields.forEach(f => testApiConnection(app, f))}
                                                                                    className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs md:text-sm font-bold transition-all"
                                                                                >
                                                                                    <RefreshCw className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                                                    Probar todas
                                                                                </button>
                                                                                {app.fallbackGroup && (
                                                                                    <button
                                                                                        onClick={() => setFallbackModal({ groupId: app.fallbackGroup!, apps: categories.flatMap(c => c.apps).filter(a => a.fallbackGroup === app.fallbackGroup) })}
                                                                                        className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-xl text-purple-400 text-xs md:text-sm font-bold transition-all"
                                                                                    >
                                                                                        <Zap className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                                                        <span className="hidden sm:inline">Configurar </span>Fallback
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                            {lastUpdated[app.fields[0]?.id] && (
                                                                                <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-gray-500">
                                                                                    <Clock className="w-3 h-3" />
                                                                                    Act: {new Date(lastUpdated[app.fields[0]?.id]).toLocaleDateString()}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        
                                                                        {/* Fields */}
                                                                        {app.fields.map(field => {
                                                                            const fieldStatus = apiStatus[field.id] || 'untested';
                                                                            const hasValue = apiValues[field.id] && apiValues[field.id].trim() !== '';
                                                                            return (
                                                                            <div key={field.id} className="space-y-2.5 md:space-y-3 bg-white/[0.02] p-3 md:p-4 rounded-xl border border-white/5">
                                                                                {/* Field Header */}
                                                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                                                    <div className="flex items-center gap-2 md:gap-3">
                                                                                        <label className="text-sm md:text-base font-bold text-gray-300">{field.label}</label>
                                                                                        {/* Status Badge */}
                                                                                        <span className={`text-[9px] md:text-xs font-bold uppercase px-1.5 md:px-2 py-0.5 rounded ${
                                                                                            fieldStatus === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                                                                                            fieldStatus === 'error' ? 'bg-red-500/20 text-red-400' :
                                                                                            fieldStatus === 'testing' ? 'bg-amber-500/20 text-amber-400' :
                                                                                            fieldStatus === 'limit' ? 'bg-orange-500/20 text-orange-400' :
                                                                                            'bg-gray-500/20 text-gray-400'
                                                                                        }`}>
                                                                                        {fieldStatus === 'untested' ? 'sin probar' : fieldStatus}
                                                                                        </span>
                                                                                    </div>
                                                                                    <div className="flex items-center gap-1.5 md:gap-2">
                                                                                        {/* Copy Button */}
                                                                                        {hasValue && (
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() => copyToClipboard(field.id, apiValues[field.id])}
                                                                                                className={`p-1 md:p-1.5 rounded-lg transition-colors ${
                                                                                                    copiedId === field.id
                                                                                                        ? 'bg-emerald-500/20 text-emerald-400'
                                                                                                        : 'text-gray-500 hover:text-white hover:bg-white/10'
                                                                                                }`}
                                                                                                title="Copiar valor"
                                                                                            >
                                                                                                {copiedId === field.id ? <Check className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Copy className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                                                                                            </button>
                                                                                        )}
                                                                                        
                                                                                        {/* Test Button */}
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => testApiConnection(app, field)}
                                                                                            disabled={fieldStatus === 'testing' || !hasValue}
                                                                                            className="p-1 md:p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                                                                                            title="Probar conexión"
                                                                                        >
                                                                                            <RefreshCw className={`w-3.5 h-3.5 md:w-4 md:h-4 ${fieldStatus === 'testing' ? 'animate-spin' : ''}`} />
                                                                                        </button>
                                                                                        
                                                                                        {/* Show/Hide Button */}
                                                                                        {field.type === 'password' && hasValue && (
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() => setShowKeys(prev => ({...prev, [field.id]: !prev[field.id]}))}
                                                                                                className="text-gray-500 hover:text-white transition-colors p-1 md:p-1.5"
                                                                                            >
                                                                                                {showKeys[field.id] ? <EyeOff className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                                                                                            </button>
                                                                                        )}
                                                                                    </div>
                                                                                </div>

                                                                                {/* Description */}
                                                                                <p className="text-xs md:text-sm text-gray-400 leading-relaxed">{field.description}</p>
                                                                                <p className="text-[10px] md:text-sm text-gray-500">
                                                                                    <span className="font-bold text-gray-600">Obtener en:</span> {field.getFrom}
                                                                                </p>

                                                                                {/* Input */}
                                                                                {field.type === 'database_selector' ? (
                                                                                    <div className="space-y-3">
                                                                                        {(() => {
                                                                                            let databases = [];
                                                                                            try {
                                                                                                databases = JSON.parse(apiValues[field.id] || '[]');
                                                                                            } catch (e) {
                                                                                                databases = [];
                                                                                            }
                                                                                            return databases.map((db: any, i: number) => (
                                                                                                <div key={i} className="flex items-center justify-between bg-white/5 p-2 md:p-3 rounded border border-white/10 text-xs md:text-sm">
                                                                                                    <div className="min-w-0 pr-2">
                                                                                                        <span className="font-bold text-white block truncate">{db.name}</span>
                                                                                                        <p className="text-[10px] md:text-xs text-gray-500 font-mono truncate">{db.id}</p>
                                                                                                    </div>
                                                                                                    <button 
                                                                                                        type="button"
                                                                                                        onClick={() => {
                                                                                                            const current = [...databases];
                                                                                                            current.splice(i, 1);
                                                                                                            handleKeyChange(field.id, JSON.stringify(current));
                                                                                                        }}
                                                                                                        className="text-red-400 hover:text-red-300 p-1 md:p-1.5 transition-colors flex-shrink-0"
                                                                                                        title="Eliminar base de datos"
                                                                                                    >
                                                                                                        <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                                                                    </button>
                                                                                                </div>
                                                                                            ));
                                                                                        })()}
                                                                                        <div className="flex flex-col md:flex-row gap-2 items-start pt-2">
                                                                                            <input 
                                                                                                id={`${field.id}_name`}
                                                                                                type="text" 
                                                                                                placeholder="Nombre (Ej: Leads)" 
                                                                                                className="w-full md:w-1/3 bg-white/[0.03] border border-white/10 rounded px-2.5 py-1.5 md:px-3 md:py-2 text-xs md:text-sm text-gray-300 focus:outline-none focus:border-purple-500/50 transition-all"
                                                                                            />
                                                                                            <input 
                                                                                                id={`${field.id}_id`}
                                                                                                type="text" 
                                                                                                placeholder="ID de Base de Datos" 
                                                                                                className="flex-1 w-full bg-white/[0.03] border border-white/10 rounded px-2.5 py-1.5 md:px-3 md:py-2 text-xs md:text-sm font-mono text-gray-300 focus:outline-none focus:border-purple-500/50 transition-all"
                                                                                            />
                                                                                            <button 
                                                                                                type="button"
                                                                                                onClick={() => {
                                                                                                    const nameInput = document.getElementById(`${field.id}_name`) as HTMLInputElement;
                                                                                                    const idInput = document.getElementById(`${field.id}_id`) as HTMLInputElement;
                                                                                                    if (nameInput?.value && idInput?.value) {
                                                                                                        let current = [];
                                                                                                        try {
                                                                                                            current = JSON.parse(apiValues[field.id] || '[]');
                                                                                                        } catch(e) {
                                                                                                            current = [];
                                                                                                        }
                                                                                                        current.push({ name: nameInput.value, id: idInput.value });
                                                                                                        handleKeyChange(field.id, JSON.stringify(current));
                                                                                                        nameInput.value = '';
                                                                                                        idInput.value = '';
                                                                                                    }
                                                                                                }}
                                                                                                className="w-full md:w-auto px-3 py-1.5 md:px-4 md:py-2 bg-purple-500/20 text-purple-400 rounded-lg border border-purple-500/30 text-xs md:text-sm font-bold flex items-center justify-center gap-1.5 md:gap-2 hover:bg-purple-500/30 transition-colors"
                                                                                            >
                                                                                                <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" /> Agregar
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>
                                                                                ) : field.type === 'file' ? (
                                                                                    <div className="flex gap-2">
                                                                                        <input
                                                                                            type="text"
                                                                                            readOnly
                                                                                            placeholder="Sin archivo"
                                                                                            value={apiValues[field.id] ? "✓ Archivo cargado" : ""}
                                                                                            className={`flex-1 bg-white/[0.03] border border-white/10 rounded px-2.5 py-1.5 md:px-3 md:py-2 text-xs md:text-sm font-mono
                                                                                                ${apiValues[field.id] ? 'text-emerald-400' : 'text-gray-500'}`}
                                                                                        />
                                                                                        <label className="cursor-pointer px-2.5 py-1.5 md:px-3 md:py-2 bg-blis-red/10 border border-blis-red/20 rounded text-blis-red text-[10px] md:text-sm font-bold uppercase hover:bg-blis-red/20 transition-all flex items-center justify-center">
                                                                                            <input type="file" className="hidden" accept=".p12" onChange={(e) => handleFileChange(field.id, e)} />
                                                                                            {apiValues[field.id] ? 'Cambiar' : 'Subir'}
                                                                                        </label>
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="relative">
                                                                                        <input
                                                                                            type={field.type === 'password' && !showKeys[field.id] ? 'password' : 'text'}
                                                                                            value={apiValues[field.id] || ''}
                                                                                            onChange={(e) => handleKeyChange(field.id, e.target.value)}
                                                                                            placeholder="••••••••••"
                                                                                            className="w-full bg-white/[0.03] border border-white/10 rounded px-2.5 py-1.5 md:px-3 md:py-2 pr-16 md:pr-20 text-xs md:text-sm font-mono text-gray-300 focus:outline-none focus:border-blis-red/30 transition-all"
                                                                                        />
                                                                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                                                                            {hasValue && (
                                                                                                <span className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full mt-0.5 ${
                                                                                                    apiValues[field.id]?.length > 20 ? 'bg-emerald-400' :
                                                                                                    apiValues[field.id]?.length > 10 ? 'bg-amber-400' :
                                                                                                    'bg-gray-500'
                                                                                                }`} title="Longitud de la key" />
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                                
                                                                                {/* Last Updated */}
                                                                                {lastUpdated[field.id] && (
                                                                                    <p className="text-xs text-gray-600 flex items-center gap-1">
                                                                                        <Clock className="w-3 h-3" />
                                                                                        Actualizado: {new Date(lastUpdated[field.id]).toLocaleDateString('es-ES', { 
                                                                                            day: '2-digit', month: 'short', year: 'numeric',
                                                                                            hour: '2-digit', minute: '2-digit'
                                                                                        })}
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                            );
                                                                        })}
                                                                        
                                                                        {/* Notes Section */}
                                                                        <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5">
                                                                            <div className="flex items-center justify-between mb-2">
                                                                                <label className="text-base font-bold text-gray-300">Notas</label>
                                                                            </div>
                                                                            <textarea
                                                                                value={apiNotes[app.id] || ''}
                                                                                onChange={(e) => saveNote(app.id, e.target.value)}
                                                                                placeholder="Agrega notas sobre esta API..."
                                                                                className="w-full bg-white/[0.03] border border-white/10 rounded px-3 py-2 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blis-red/30 transition-all resize-none"
                                                                                rows={2}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                });
                })()}
            </div>

            {/* Footer */}
            <footer className="mt-8 md:mt-10 bg-gradient-to-r from-emerald-500/10 to-blis-red/5 border border-emerald-500/10 p-4 md:p-5 rounded-xl flex items-start sm:items-center gap-3 md:gap-4 flex-col sm:flex-row">
                <div className="p-2.5 md:p-3 bg-emerald-500/10 rounded-lg">
                    <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />
                </div>
                <div className="flex-1 text-left">
                    <h3 className="text-xs md:text-sm font-bold text-emerald-400">Base de Datos Segura</h3>
                    <p className="text-[10px] md:text-xs text-gray-400 mt-0.5">
                        Todas las claves se guardan en Supabase con encriptación y backup automático.
                    </p>
                </div>
            </footer>
        </div>
        </>
    );
}