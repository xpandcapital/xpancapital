import {
  Briefcase, Video, MapPin, Database, Cloud, Key, FileText,
  CreditCard, TrendingUp, BarChart3, Megaphone, Coins, Globe,
  Calendar, Zap, MessageSquare, Bell, Palette, FileCheck,
  Users, Sparkles, Mail, Image, Link2, Building2
} from "lucide-react"
import type { ApiCategory, ApiApp, ApiField, ApiFieldType, ApiAccessType, ApiCostType } from '../_types'

export const API_IDEAS: Record<string, { title: string; ideas: { category: string; items: string[] }[] }> = {
  "notion": {
    title: "💡 Ideas para Notion",
    ideas: [{ category: "📊 Gestión de Proyectos Inmobiliarios", items: ["Sincronizar leads calificados desde la web directamente a un pipeline de ventas (Kanban) en Notion.", "Crear un CRM colaborativo donde los agentes inmobiliarios actualicen el estado (contacto, visita, cierre) de cada cliente.", "Generar reportes semanales automáticos de ventas y comisiones, guardándolos en una base de datos central.", "Mantener un repositorio de documentación (planos, permisos, contratos tipo) accesible para todo el equipo.", "Crear un tracker de gastos de obra, donde cada factura subida se sincronice con el presupuesto del proyecto."] }]
  },
  "ia_llm": {
    title: "💡 Ideas para Modelos de IA (Gemini, OpenAI, Claude)",
    ideas: [{ category: "🤖 Asistentes Virtuales Inmobiliarios", items: ["Chatbot 24/7 entrenado con toda la información de tus proyectos (precios, planos, amenidades) para calificar leads y responder dudas técnicas.", "Redacción mágica de descripciones: Generar textos SEO-friendly, persuasivos y atractivos para cada nuevo lote o proyecto con un solo clic.", "Análisis de sentimiento: Procesar las transcripciones de las llamadas o chats de los vendedores para saber por qué se caen las ventas (objeciones más comunes).", "Traducción automática perfecta para atraer a inversionistas extranjeros que no hablan español.", "Agente de Up-Selling: Si un cliente pregunta por un lote de 200m2, la IA analiza su perfil y le sugiere sutilmente invertir en uno de 300m2 premium."] }]
  },
  "pagos_tarjeta": {
    title: "💡 Ideas para Pasarelas de Tarjetas",
    ideas: [{ category: "💳 Pagos y Cuotas Automatizadas", items: ["Cobro de cuotas mensuales de financiamiento directo (suscripciones): cargar automáticamente la cuota a la tarjeta del cliente cada mes (tokenización).", "Split Payments: Dividir el pago automáticamente entre el desarrollador del proyecto (90%) y la comisión del broker inmobiliario (10%).", "Bloqueo de seguridad: Evitar chargebacks pidiendo autenticación 3D Secure para compras altas.", "Dashboards en tiempo real: Ver el flujo de caja del proyecto desde la aplicación administrativa conectada al dashboard de Stripe/Niubiz.", "Links de pago por SMS/Email para que clientes morosos se pongan al día con un solo clic sin tener que loguearse a una plataforma compleja."] }]
  }
}

export function getAppIdeas(appId: string) {
  const map: Record<string, string> = {
    'notion': 'notion', 'planifyx': 'planifyx', 'whatsapp': 'planifyx', 'twilio': 'planifyx',
    'brand2social': 'brand2social', 'cpanel': 'cpanel',
    'gemini': 'ia_llm', 'openai': 'ia_llm', 'groq': 'ia_llm', 'anthropic': 'ia_llm', 'opencodego': 'ia_llm', 'opengozen': 'ia_llm',
    'replicate': 'ia_llm', 'stability': 'ia_llm', 'elevenlabs': 'ia_llm', 'freepik': 'ia_llm', 'huggingface': 'ia_llm',
    'stripe': 'pagos_tarjeta', 'mercadopago': 'pagos_tarjeta', 'paypal': 'pagos_tarjeta', 'payu_col': 'pagos_tarjeta',
    'izipay': 'pagos_tarjeta', 'culqi': 'pagos_tarjeta', 'paymentez': 'pagos_tarjeta', 'placetopay': 'pagos_tarjeta',
    'supabase': 'ia_llm', 'firebase': 'ia_llm', 'mongodb': 'ia_llm',
  }
  return API_IDEAS[map[appId]] || API_IDEAS['ia_llm']
}

const createField = (id: string, label: string, description: string, getFrom: string, type: ApiFieldType = 'password', accessType: ApiAccessType = 'Privada', cost: ApiCostType = 'pagado', docsUrl?: string): ApiField => ({
  id, label, type, description, getFrom, accessType, cost, docsUrl
})

export const API_CATEGORIES: ApiCategory[] = [
  {
    id: "productividad",
    title: "Productividad",
    icon: Briefcase,
    color: "text-purple-400",
    description: "Notion, gestión de redes sociales, hosting y herramientas de productividad.",
    apps: [
      {
        id: "notion", name: "Notion", icon: FileText, color: "text-white", bg: "bg-white/10",
        description: "Base de datos, documentos y wiki de la empresa. Sincroniza información con tu sistema.",
        website: "notion.so",
        fields: [
          createField("notion_api_key", "API Key", "Token de integración de Notion. Permite leer y escribir en bases de datos.", "notion.so → Settings → Integrations → Develop an integration → Create new integration → Secret Token", 'password', 'Privada', 'gratis'),
          createField("notion_version", "API Version", "Versión de la API de Notion a usar. Recomendado: 2022-06-28", "Mantener por defecto", 'text', 'Pública', 'gratis'),
        ]
      },
      {
        id: "brand2social", name: "Brand2Social", icon: MessageSquare, color: "text-blue-400", bg: "bg-blue-500/10",
        description: "Programador y publicador automatizado de contenido para múltiples redes sociales.",
        website: "brand2social.com",
        fields: [
          createField("brand2social_api_key", "API Key", "Clave de acceso a la API de Brand2Social.", "brand2social.com → Settings → API", 'password', 'Privada', 'pagado'),
          createField("brand2social_user_id", "User ID", "Identificador de usuario en Brand2Social.", "brand2social.com → Dashboard → Profile", 'text', 'Pública', 'pagado'),
        ]
      },
      {
        id: "cpanel", name: "cPanel / Hosting", icon: Database, color: "text-orange-400", bg: "bg-orange-500/10",
        description: "Gestión de FTP, archivos pesados y creación automática de subdominios para proyectos.",
        website: "asurahosting.com",
        fields: [
          createField("cpanel_host", "Host", "Hostname del servidor cPanel (ej: server.asurahosting.com).", "cPanel → Home → Server Information → Hostname", 'text', 'Pública', 'pagado'),
          createField("cpanel_username", "Username", "Usuario de acceso a cPanel.", "Credenciales proporcionadas por AsuraHosting", 'text', 'Pública', 'pagado'),
          createField("cpanel_api_token", "API Token", "Token para API de cPanel. Generar en: cPanel → Security → Manage API Tokens.", "cPanel → Security → Manage API Tokens → Create Token", 'password', 'Privada', 'gratis'),
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
        id: "gemini", name: "Google Gemini", icon: Sparkles, color: "text-purple-400", bg: "bg-purple-500/10",
        description: "Modelo de lenguaje de Google. Generación de texto, análisis de imágenes, código. Tiene capa generosa gratuita.",
        website: "aistudio.google.com",
        fields: [createField("gemini_key", "API Key", "Clave para Gemini API. 15 RPM gratis, hasta 1500 RPD. Ideal para chatbots y análisis.", "aistudio.google.com → Get API Key → Create API Key", 'password', 'Pública', 'gratis')]
      },
      {
        id: "openai", name: "OpenAI", icon: Sparkles, color: "text-green-400", bg: "bg-green-500/10",
        description: "GPT-4, GPT-4o, DALL-E, Whisper. Líder en modelos de lenguaje y generación de imágenes.",
        website: "platform.openai.com",
        fields: [createField("openai_key", "API Key", "Clave de acceso a todos los modelos de OpenAI. Pago por uso (tokens).", "platform.openai.com → API Keys → Create new secret key", 'password', 'Privada', 'pagado')]
      },
      {
        id: "groq", name: "Groq", icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-500/10",
        description: "Inferencia ultra-rápida de modelos open source (Llama, Mixtral). API compatible con OpenAI.",
        website: "console.groq.com",
        fields: [createField("groq_key", "API Key", "Clave para Groq Cloud. Tier gratuito generoso, respuesta en milisegundos.", "console.groq.com → API Keys → Create API Key", 'password', 'Pública', 'gratis')]
      },
      {
        id: "anthropic", name: "Anthropic", icon: Sparkles, color: "text-orange-400", bg: "bg-orange-500/10",
        description: "Claude - modelo de lenguaje con razonamiento avanzado y ventana de contexto muy grande.",
        website: "console.anthropic.com",
        fields: [createField("anthropic_key", "API Key", "Clave para Claude API. $5 crédito inicial, luego pago por tokens.", "console.anthropic.com → API Keys → Create Key", 'password', 'Privada', 'pagado')]
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
        id: "supabase", name: "Supabase", icon: Database, color: "text-emerald-400", bg: "bg-emerald-500/10",
        description: "Base de datos PostgreSQL, autenticación, almacenamiento y funciones serverless. Alternativa open-source a Firebase.",
        website: "supabase.com",
        fields: [
          createField("supabase_url", "URL del Proyecto", "URL base de tu proyecto Supabase. Se usa para todas las llamadas API.", "Dashboard → Proyecto → Settings → API → Project URL", 'text', 'Pública', 'gratis'),
          createField("supabase_anon_key", "Anon Key", "Clave pública para operaciones desde el frontend. Tiene permisos limitados por RLS.", "Dashboard →Proyecto → Settings → API → Project API keys → anon public", 'password', 'Pública', 'gratis'),
          createField("supabase_service_key", "Service Role Key", "Clave secreta con permisos totales. ⚠️ NUNCA exponer en frontend, solo backend.", "Dashboard → Proyecto → Settings → API → Project API keys → service_role (secret)", 'password', 'Privada', 'gratis'),
        ]
      },
      {
        id: "firebase", name: "Firebase", icon: Sparkles, color: "text-amber-400", bg: "bg-amber-500/10",
        description: "Plataforma de desarrollo de Google. Autenticación, base de datos en tiempo real, hosting y storage.",
        website: "firebase.google.com",
        fields: [
          createField("firebase_api_key", "API Key", "Clave pública de tu proyecto Firebase para inicializar el SDK.", "Console → Project Settings → General → Web API Key", 'password', 'Pública', 'freemium'),
          createField("firebase_auth_domain", "Auth Domain", "Dominio de autenticación para login con proveedores sociales.", "Console → Project Settings → General → Default domain", 'text', 'Pública', 'gratis'),
          createField("firebase_project_id", "Project ID", "Identificador único del proyecto Firebase.", "Console → Project Settings → General → Project ID", 'text', 'Pública', 'gratis'),
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
        id: "resend", name: "Resend", icon: Mail, color: "text-blue-400", bg: "bg-blue-500/10",
        description: "Email transaccional moderno. API simple, excelente deliverability. 3k emails/mes gratis.",
        website: "resend.com",
        fields: [createField("resend_key", "API Key", "Clave para enviar emails con Resend. Incluye dominio verificado.", "resend.com → API Keys → Create API Key", 'password', 'Privada', 'freemium')]
      },
      {
        id: "sendgrid", name: "SendGrid", icon: Mail, color: "text-blue-400", bg: "bg-blue-500/10",
        description: "Email service de Twilio. Marketing y transaccional. 100 emails/día gratis.",
        website: "sendgrid.com",
        fields: [createField("sendgrid_key", "API Key", "Clave para SendGrid API. Permisos: Mail Send.", "sendgrid.com → Settings → API Keys → Create API Key", 'password', 'Privada', 'freemium')]
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
        id: "stripe", name: "Stripe", icon: CreditCard, color: "text-purple-400", bg: "bg-purple-500/10",
        description: "Pasarela líder mundial. Tarjetas, Apple Pay, Google Pay, subscripciones, marketplace.",
        website: "dashboard.stripe.com",
        fields: [
          createField("stripe_public_key", "Publishable Key", "Clave pública para crear tokens de pago en frontend.", "dashboard.stripe.com → Developers → API Keys → Publishable key", 'password', 'Pública', 'pagado'),
          createField("stripe_secret_key", "Secret Key", "Clave secreta para crear cargos, refunds, etc.⚠️ Solo backend.", "dashboard.stripe.com → Developers → API Keys → Secret key", 'password', 'Privada', 'pagado'),
          createField("stripe_webhook_secret", "Webhook Secret", "Secreto para verificar webhooks de Stripe (pagos exitosos, etc).", "dashboard.stripe.com → Developers → Webhooks → Tu webhook → Signing secret", 'password', 'Privada', 'gratis'),
        ]
      },
      {
        id: "mercadopago", name: "MercadoPago", icon: CreditCard, color: "text-blue-400", bg: "bg-blue-500/10",
        description: "Pasarela de Mercado Libre. Popular en LatAm. Tarjetas, efectivo, financiamiento.",
        website: "mercadopago.com/developers",
        fields: [
          createField("mercadopago_access_token", "Access Token", "Token para crear preferencias y pagos. ⚠️ Solo backend.", "mercadopago.com/developers → Credentials → Access Token", 'password', 'Privada', 'pagado'),
          createField("mercadopago_public_key", "Public Key", "Clave pública para integración frontend.", "mercadopago.com/developers → Credentials → Public Key", 'password', 'Pública', 'pagado'),
        ]
      },
    ]
  },
  {
    id: "storage",
    title: "Storage & CDN",
    icon: Cloud,
    color: "text-cyan-400",
    description: "Almacenamiento de archivos, imágenes y CDN para recursos estáticos.",
    apps: [
      {
        id: "cloudinary", name: "Cloudinary", icon: Image, color: "text-purple-400", bg: "bg-purple-500/10",
        description: "CDN y transformación de imágenes en tiempo real. Upload, resize, optimización y entrega.",
        website: "cloudinary.com/console",
        fields: [
          createField("cloudinary_cloud_name", "Cloud Name", "Nombre de tu cloud, visible en todas las URLs de imagen.", "Console → Dashboard → Cloud Name", 'text', 'Pública', 'freemium'),
          createField("cloudinary_api_key", "API Key", "Clave para autenticar operaciones de upload y admin.", "Console → Dashboard → API Key", 'password', 'Pública', 'freemium'),
          createField("cloudinary_api_secret", "API Secret", "Secreto para firmar requests. ⚠️ No exponer en frontend.", "Console → Dashboard → API Secret", 'password', 'Privada', 'freemium'),
        ]
      },
      {
        id: "aws_s3", name: "AWS S3", icon: Cloud, color: "text-orange-400", bg: "bg-orange-500/10",
        description: "Almacenamiento de objetos en la nube de Amazon. Ideal para backups y archivos estáticos grandes.",
        website: "console.aws.amazon.com/s3",
        fields: [
          createField("s3_bucket", "Bucket Name", "Nombre único del bucket S3 donde se guardan los archivos.", "S3 Console → Create bucket o usar existente", 'text', 'Pública', 'pagado'),
          createField("aws_access_key", "Access Key ID", "Identificador de acceso para autenticación AWS.", "IAM Console → Users → Create Access Key", 'password', 'Privada', 'pagado'),
          createField("aws_secret_key", "Secret Access Key", "Clave secreta del Access Key. ⚠️ Solo se muestra una vez.", "IAM Console → Users → Create Access Key → Guardar inmediatamente", 'password', 'Privada', 'pagado'),
          createField("aws_region", "Region", "Región del bucket (ej: us-east-1, sa-east-1).", "S3 Console → Bucket → Properties → Region", 'text', 'Pública', 'gratis'),
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
        id: "google_analytics", name: "Google Analytics", icon: BarChart3, color: "text-blue-400", bg: "bg-blue-500/10",
        description: "Analytics gratuito de Google. Tracking de visitas, conversión, comportamiento.",
        website: "analytics.google.com",
        fields: [createField("google_analytics_id", "Measurement ID", "ID de tu propiedad GA4 (G-XXXXXXXXXX).", "analytics.google.com → Admin → Data Streams → Tu stream → Measurement ID", 'text', 'Pública', 'gratis')]
      },
      {
        id: "mixpanel", name: "Mixpanel", icon: BarChart3, color: "text-purple-400", bg: "bg-purple-500/10",
        description: "Analytics de producto con funnels, retención y cohorts. Endpoint tracking.",
        website: "mixpanel.com",
        fields: [createField("mixpanel_token", "Project Token", "Token para enviar eventos a Mixpanel.", "mixpanel.com → Settings → Project Setup → Token", 'password', 'Pública', 'freemium')]
      },
    ]
  },
]