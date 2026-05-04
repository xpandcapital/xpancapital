import type { ApiIdeas } from '../_types'

export const API_IDEAS: Record<string, ApiIdeas> = {
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
}

export const APP_IDEAS_MAP: Record<string, string> = {
    'notion': 'notion',
    'planifyx': 'planifyx', 'whatsapp': 'planifyx', 'twilio': 'planifyx',
    'brand2social': 'brand2social',
    'cpanel': 'cpanel',
    'gemini': 'ia_llm', 'openai': 'ia_llm', 'groq': 'ia_llm', 'anthropic': 'ia_llm', 'opencodego': 'ia_llm', 'opengozen': 'ia_llm',
    'replicate': 'multimedia', 'stability': 'multimedia', 'elevenlabs': 'multimedia', 'freepik': 'multimedia', 'huggingface': 'multimedia',
    'stripe': 'pagos_tarjeta', 'mercadopago': 'pagos_tarjeta', 'paypal': 'pagos_tarjeta', 'payu_col': 'pagos_tarjeta', 'epayco': 'pagos_tarjeta', 'wompi': 'pagos_tarjeta', 'bancolombia': 'pagos_tarjeta', 'izipay': 'pagos_tarjeta', 'culqi': 'pagos_tarjeta', 'paymentez': 'pagos_tarjeta', 'placetopay': 'pagos_tarjeta',
    'yape_plin': 'pagos_qr',
    'google_maps': 'mapas', 'mapbox': 'mapas', 'locationiq': 'mapas', 'openstreetmap': 'mapas',
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

export function getAppIdeas(appId: string): ApiIdeas | null {
    const key = APP_IDEAS_MAP[appId] || 'basedatos'
    return API_IDEAS[key] || null
}