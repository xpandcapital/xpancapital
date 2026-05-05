import {
  Briefcase, Video, MapPin, Database, Cloud, Key, FileText,
  CreditCard, TrendingUp, BarChart3, Megaphone, Coins, Globe,
  Calendar, Zap, MessageSquare, Bell, Palette, FileCheck,
  Users, Sparkles, Mail, Image, Link2, Building2, Send,
  Mail as MailIcon, Phone, Brain, Lightbulb
} from "lucide-react"
import type { ApiCategory, ApiApp, ApiField } from "../_types"

export type { ApiCategory, ApiApp, ApiField }

export const API_IDEAS: Record<string, { title: string; ideas: { category: string; items: string[] }[] }> = {
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
  "ia_llm": {
    "title": "💡 Ideas para Modelos de IA (Gemini, OpenAI, Claude)",
    "ideas": [
      {
        "category": "🤖 Asistentes Virtuales Inmobiliarios",
        "items": [
          "Chatbot 24/7 entrenado con toda la información de tus proyectos (precios, planos, amenidades) para calificar leads y responder dudas técnicas.",
          "Redacción mágica de descripciones: Generar textos SEO-friendly, persuasivos y atractivos para cada nuevo lote o proyecto con un solo clic.",
          "Análisis de sentimiento: Procesar las transcripciones de las llamadas o chats de los vendedores para saber por qué se caen las ventas (objeciones más comunes).",
          "Traducción automática perfecta para atraer a inversionistas extranjeros que no hablan español (ej.mercado norteamericano o europeo).",
          "Agente de Up-Selling: Si un cliente pregunta por un lote de 200m2, la IA analiza su perfil y le sugiere sutilmente invertir en uno de 300m2 premium."
        ]
      }
    ]
  }
}

export function getAppIdeas(appId: string) {
  const map: Record<string, string> = {
    'notion': 'notion',
    'planifyx': 'planifyx', 'whatsapp': 'planifyx', 'twilio': 'planifyx',
    'brand2social': 'brand2social',
    'cpanel': 'cpanel',
    'gemini': 'ia_llm', 'openai': 'ia_llm', 'groq': 'ia_llm', 'anthropic': 'ia_llm', 'opencodego': 'ia_llm', 'opengozen': 'ia_llm',
    'replicate': 'ia_llm', 'stability': 'ia_llm', 'elevenlabs': 'ia_llm', 'freepik': 'ia_llm', 'huggingface': 'ia_llm',
    'stripe': 'pagos_tarjeta', 'mercadopago': 'pagos_tarjeta', 'paypal': 'pagos_tarjeta', 'payu_col': 'pagos_tarjeta', 'epayco': 'pagos_tarjeta', 'wompi': 'pagos_tarjeta', 'bancolombia': 'pagos_tarjeta', 'izipay': 'pagos_tarjeta', 'culqi': 'pagos_tarjeta', 'paymentez': 'pagos_tarjeta', 'placetopay': 'pagos_tarjeta', 'helio': 'pagos_tarjeta',
    'yape_plin': 'pagos_qr',
    'google_maps': 'mapas', 'mapbox': 'mapas', 'locationiq': 'mapas', 'openstreetmap': 'mapas',
    'open_meteo': 'clima', 'countries_api': 'clima', 'tipo_cambio_publico': 'clima',
    'decolecta': 'identidad', 'reniec': 'identidad', 'registro_civil_ec': 'identidad', 'datauno': 'identidad',
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
  }
  const key = map[appId] || 'basedatos'
  return API_IDEAS[key] || API_IDEAS['ia_llm']
}