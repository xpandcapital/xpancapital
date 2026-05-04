import {
    Cloud, Key, Video, Image, Mail,
    Building2, CreditCard, TrendingUp, BarChart3, Megaphone,
    Coins, Globe, MapPin, FileText, Database,
    Calendar, Zap, MessageSquare, Bell, Palette,
    FileCheck, Users, Briefcase, Link2, Sparkles,
    CloudSun, Flag
} from 'lucide-react'
import type { ApiCategory } from '../_types'

export const categories: ApiCategory[] = [
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
                    { id: "notion_api_key", label: "API Key", type: "password", description: "Token de integración de Notion. Permite leer y escribir en bases de datos.", getFrom: "notion.so → Settings → Integrations → Develop an integration → Secret Token", accessType: "Privada", cost: "gratis" },
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
        id: "clima_geo",
        title: "Clima y Geografía",
        icon: CloudSun,
        color: "text-sky-400",
        description: "Clima, pronóstico, geolocalización y datos de países. APIs 100% gratuitas y sin autenticación.",
        apps: [
            {
                id: "open_meteo",
                name: "Open-Meteo",
                icon: Cloud,
                color: "text-sky-400",
                bg: "bg-sky-500/10",
                description: "API gratuita de pronóstico del clima. Sin API key, sin límites. Temperatura, viento, lluvia.",
                website: "open-meteo.com",
                fields: [
                    { id: "openmeteo_endpoint", label: "API Endpoint", type: "text", description: "URL base. Por defecto: https://api.open-meteo.com/v1/forecast", getFrom: "open-meteo.com → API Docs", accessType: "Pública", cost: "gratis" },
                    { id: "openmeteo_lat", label: "Latitud Default", type: "text", description: "Latitud por defecto (ej: -12.046 para Lima)", getFrom: "Obtener de Google Maps o Nominatim", accessType: "Pública", cost: "gratis" },
                    { id: "openmeteo_lon", label: "Longitud Default", type: "text", description: "Longitud por defecto (ej: -77.042 para Lima)", getFrom: "Obtener de Google Maps o Nominatim", accessType: "Pública", cost: "gratis" },
                ]
            },
            {
                id: "countries_api",
                name: "REST Countries",
                icon: Flag,
                color: "text-indigo-400",
                bg: "bg-indigo-500/10",
                description: "Info de todos los países: banderas, monedas, idiomas, población, códigos ISO. Gratis.",
                website: "restcountries.com",
                fields: [
                    { id: "countries_endpoint", label: "API Endpoint", type: "text", description: "URL base. Por defecto: https://restcountries.com/v3.1", getFrom: "restcountries.com → Docs", accessType: "Pública", cost: "gratis" },
                ]
            },
            {
                id: "tipo_cambio_publico",
                name: "Tipo de Cambio Público",
                icon: TrendingUp,
                color: "text-green-400",
                bg: "bg-green-500/10",
                description: "Tipo de cambio gratuito SUNAT (Perú) y exchangerate-api (global). Sin token.",
                website: "exchangerate-api.com",
                fields: [
                    { id: "tipocambio_sunat_endpoint", label: "Endpoint SUNAT (PE)", type: "text", description: "URL SUNAT. Por defecto: https://api.apis.net.pe/v1/tipo-cambio-sunat", getFrom: "Pública y gratuita", accessType: "Pública", cost: "gratis" },
                    { id: "tipocambio_global_endpoint", label: "Endpoint Global", type: "text", description: "URL exchangerate-api. Por defecto: https://api.exchangerate-api.com/v4/latest/USD", getFrom: "exchangerate-api.com → Docs", accessType: "Pública", cost: "gratis" },
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
                id: "decolecta",
                name: "Decolecta API",
                icon: Key,
                color: "text-blis-red",
                bg: "bg-blis-red/10",
                description: "API para consultar RUC (SUNAT), DNI (RENIEC) y tipo de cambio (SBS). Sin restricción de IP, autenticación vía Bearer Token.",
                website: "decolecta.com",
                docsUrl: "https://decolecta.gitbook.io/docs",
                fields: [
                    { id: "peru_api_token", label: "Bearer Token", type: "password", description: "Token de autenticación para consultas RUC/DNI/Tipo de Cambio. Se genera en decolecta.com/profile.", getFrom: "decolecta.com → Registrarse → Profile → API Token", accessType: "Privada", cost: "freemium" },
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
                    { id: "serpost_tracking_url", label: "Endpoint Tracking", type: "text", description: "URL para consultar el estado de los envíos de Serpost.", getFrom: "Es una URL pública y gratuita", accessType: "Pública", cost: "gratis" },
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
                description: "API para Ecuador: consulta de cédula/RUC, facturación electrónica SRI, firma digital y verificación gratuita de WhatsApp.",
                website: "apiconsult.zampisoft.com",
                docsUrl: "https://apiconsult.zampisoft.com",
                fields: [
                    { id: "apiconsult_token", label: "Token API", type: "password", description: "Token de autenticación para consultas, facturación y verificación WhatsApp. Se genera en apiconsult.zampisoft.com.", getFrom: "apiconsult.zampisoft.com → Registrarse → Dashboard → API Token", accessType: "Privada", cost: "freemium" },
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
                description: "Conexión directa con el SRI (Servicio de Rentas Internas). Consulta de RUC y comprobables.",
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
                description: "Plataforma de scheduling popular. Permite agendar reuniones sin emails back-and-forth.",
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
            {
                id: "cryptomus",
                name: "Cryptomus",
                icon: Coins,
                color: "text-yellow-400",
                bg: "bg-yellow-500/10",
                description: "Pasarela de pago crypto. Acepta tarjetas y criptomonedas. Convierte automáticamente a USDT. Webhooks y facturas.",
                website: "cryptomus.com",
                fields: [
                    { id: "cryptomus_merchant_id", label: "ID del Comerciante (Merchant UUID)", type: "text", description: "UUID de tu comercio en Cryptomus. Visible en el dashboard.", getFrom: "cryptomus.com → Configuración → ID del Comerciante", accessType: "Pública", cost: "pagado" },
                    { id: "cryptomus_api_key", label: "Clave API para pagos", type: "password", description: "Clave para crear facturas y recibir pagos. Es la misma para todos los comerciantes.", getFrom: "cryptomus.com → Configuración → Clave API para pagos", accessType: "Privada", cost: "pagado" },
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
            { id: "tradingview", name: "TradingView", icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-500/10", description: "Plataforma de análisis técnico líder. Charts en tiempo real, Pine Script para estrategias, alertas.", website: "tradingview.com", fields: [{ id: "tradingview_key", label: "API Key", type: "password", description: "Clave para TradingView API. Acceso a charts, indicadores y señales.", getFrom: "tradingview.com → Account → Settings → API Keys", accessType: "Privada", cost: "freemium" }] },
            { id: "metatrader", name: "MetaTrader 4/5", icon: TrendingUp, color: "text-orange-400", bg: "bg-orange-500/10", description: "Plataforma de trading estándar para forex y CFDs. Bots con MQL4/MQL5, backtesting y VPS.", website: "metatrader4.com", fields: [{ id: "metatrader_server", label: "Broker Server", type: "text", description: "Nombre del servidor del broker (ej: MetaQuotes-Demo).", getFrom: "Tu broker provee el nombre del servidor", accessType: "Pública", cost: "gratis" }, { id: "metatrader_login", label: "Account Login", type: "text", description: "Número de cuenta de trading proporcionado por el broker.", getFrom: "Tu broker → Datos de cuenta", accessType: "Pública", cost: "gratis" }, { id: "metatrader_password", label: "Password", type: "password", description: "Contraseña de la cuenta de trading. ⚠️ No compartir.", getFrom: "Tu broker → Datos de cuenta", accessType: "Privada", cost: "gratis" }] },
            { id: "ibkr", name: "Interactive Brokers", icon: TrendingUp, color: "text-green-400", bg: "bg-green-500/10", description: "Broker profesional con API completa. TWS API para bots, datos de mercado, múltiples activos.", website: "interactivebrokers.com", fields: [{ id: "ibkr_api_key", label: "API Key", type: "password", description: "Clave para IBKR API. Permite trading automatizado.", getFrom: "interactivebrokers.com → Account Management → API Settings", accessType: "Privada", cost: "pagado" }, { id: "ibkr_account_id", label: "Account ID", type: "text", description: "Tu número de cuenta IBKR (formato: DU1234567).", getFrom: "IBKR Portal → Account Information", accessType: "Pública", cost: "gratis" }] },
            { id: "alpaca", name: "Alpaca", icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-500/10", description: "Broker API-first para acciones y crypto. Ideal para bots, backtesting y paper trading gratis.", website: "alpaca.markets", fields: [{ id: "alpaca_api_key", label: "API Key", type: "password", description: "Clave para Alpaca API. Acceso a trading de acciones y crypto.", getFrom: "alpaca.markets → Paper/Live Trading → API Keys", accessType: "Pública", cost: "gratis" }, { id: "alpaca_secret_key", label: "Secret Key", type: "password", description: "Secreto para firmar requests de Alpaca.", getFrom: "alpaca.markets → API Keys → Create New Key", accessType: "Privada", cost: "gratis" }] },
            { id: "threecommas", name: "3Commas", icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-500/10", description: "Plataforma de bots de trading para crypto. DCA bots, grid bots, smart trades, señales.", website: "3commas.io", fields: [{ id: "threecommas_api_key", label: "API Key", type: "password", description: "Clave para 3Commas API. Controla bots y cuentas conectadas.", getFrom: "3commas.io → Profile → API Keys → Create Key", accessType: "Privada", cost: "pagado" }, { id: "threecommas_secret", label: "Secret", type: "password", description: "Secreto para firmar requests de 3Commas.", getFrom: "Se muestra solo al crear la API Key", accessType: "Privada", cost: "pagado" }] },
            { id: "cryptohopper", name: "Cryptohopper", icon: TrendingUp, color: "text-teal-400", bg: "bg-teal-500/10", description: "Bot de trading automático para crypto. Estrategias, señales, market making y arbitraje.", website: "cryptohopper.com", fields: [{ id: "cryptohopper_api_key", label: "API Key", type: "password", description: "Clave para Cryptohopper API. Controla bots y configuraciones.", getFrom: "cryptohopper.com → Account → API Settings", accessType: "Privada", cost: "pagado" }] },
            { id: "quantconnect", name: "QuantConnect", icon: BarChart3, color: "text-emerald-400", bg: "bg-emerald-500/10", description: "Plataforma de quant research y backtesting. Python/C#, datos históricos, cloud hosting.", website: "quantconnect.com", fields: [{ id: "quantconnect_api_key", label: "API Key", type: "password", description: "Clave para QuantConnect API. Acceso a datos y ejecución de algoritmos.", getFrom: "quantconnect.com → Account → API Keys", accessType: "Privada", cost: "freemium" }] },
            { id: "ccxt", name: "CCXT", icon: Sparkles, color: "text-yellow-400", bg: "bg-yellow-500/10", description: "Librería open-source que unifica APIs de 100+ exchanges crypto. Python, JS, PHP, C#.", website: "ccxt.trade", fields: [{ id: "ccxt_exchange", label: "Exchange", type: "text", description: "Nombre del exchange a conectar (ej: binance, kraken, coinbase).", getFrom: "Especificar cualquiera de los 100+ exchanges soportados", accessType: "Pública", cost: "gratis" }, { id: "ccxt_api_key", label: "API Key", type: "password", description: "Clave del exchange a usar con CCXT.", getFrom: "Obtener del exchange correspondiente", accessType: "Privada", cost: "gratis" }, { id: "ccxt_secret", label: "Secret Key", type: "password", description: "Secreto del exchange para CCXT.", getFrom: "Obtener del exchange correspondiente", accessType: "Privada", cost: "gratis" }] },
        ]
    },
    {
        id: "comunicaciones",
        title: "Comunicaciones",
        icon: Mail,
        color: "text-blue-400",
        description: "WhatsApp, email, SMS, push notifications y chat en vivo.",
        apps: [
            { id: "planifyx", name: "Planifyx Social Poster", icon: MessageSquare, color: "text-green-400", bg: "bg-green-500/10", description: "WhatsApp API completa. Bulk campaigns, chatbots, envío de mensajes, grupos y más. IA integrada.", website: "socialposter.planifyx.com", fields: [{ id: "planifyx_access_token", label: "Access Token", type: "password", description: "Token de acceso a Planifyx API. Usado en todos los requests.", getFrom: "socialposter.planifyx.com → Dashboard → API Access Token", accessType: "Privada", cost: "pagado" }, { id: "planifyx_instance_id", label: "Instance ID", type: "text", description: "ID de la instancia de WhatsApp conectada.", getFrom: "socialposter.planifyx.com → Instances → Tu Instance ID", accessType: "Pública", cost: "pagado" }, { id: "planifyx_webhook_url", label: "Webhook URL", type: "text", description: "URL para recibir eventos de WhatsApp (mensajes, estados, etc).", getFrom: "Configurar en tu servidor para recibir eventos", accessType: "Pública", cost: "gratis" }] },
            { id: "twilio", name: "Twilio", icon: Globe, color: "text-red-400", bg: "bg-red-500/10", description: "Plataforma de comunicaciones. SMS, voz, video, WhatsApp Business.", website: "twilio.com/console", fields: [{ id: "twilio_account_sid", label: "Account SID", type: "text", description: "Identificador de cuenta Twilio.", getFrom: "twilio.com/console → Dashboard → Account SID", accessType: "Pública", cost: "pagado" }, { id: "twilio_auth_token", label: "Auth Token", type: "password", description: "Token de autenticación para API de Twilio.", getFrom: "twilio.com/console → Dashboard → Auth Token (click reveal)", accessType: "Privada", cost: "pagado" }, { id: "twilio_phone_number", label: "Phone Number", type: "text", description: "Número de teléfono comprado en Twilio para enviar SMS.", getFrom: "twilio.com/console → Phone Numbers → Manage → Buy a Number", accessType: "Pública", cost: "pagado" }] },
            { id: "whatsapp", name: "WhatsApp Business API", icon: MessageSquare, color: "text-green-400", bg: "bg-green-500/10", description: "API oficial de WhatsApp para empresas. Enviar mensajes masivos y automatizados.", website: "developers.facebook.com/docs/whatsapp", fields: [{ id: "whatsapp_token", label: "Access Token", type: "password", description: "Token de acceso permanente para WhatsApp Business API.", getFrom: "developers.facebook.com → Tu App → WhatsApp → Settings → Token", accessType: "Privada", cost: "pagado" }, { id: "whatsapp_phone_id", label: "Phone Number ID", type: "text", description: "ID del número de teléfono de WhatsApp Business.", getFrom: "developers.facebook.com → Tu App → WhatsApp → Phone Number ID", accessType: "Pública", cost: "pagado" }, { id: "whatsapp_business_id", label: "Business Account ID", type: "text", description: "ID de tu cuenta de WhatsApp Business.", getFrom: "developers.facebook.com → Tu App → WhatsApp → Business Account ID", accessType: "Pública", cost: "gratis" }] },
            { id: "resend", name: "Resend", icon: Mail, color: "text-blue-400", bg: "bg-blue-500/10", description: "Email transaccional moderno. API simple, excelente deliverability. 3k emails/mes gratis.", website: "resend.com", fields: [{ id: "resend_key", label: "API Key", type: "password", description: "Clave para enviar emails con Resend. Incluye dominio verificado.", getFrom: "resend.com → API Keys → Create API Key", accessType: "Privada", cost: "freemium" }] },
            { id: "sendgrid", name: "SendGrid", icon: Mail, color: "text-blue-400", bg: "bg-blue-500/10", description: "Email service de Twilio. Marketing y transaccional. 100 emails/día gratis.", website: "sendgrid.com", fields: [{ id: "sendgrid_key", label: "API Key", type: "password", description: "Clave para SendGrid API. Permisos: Mail Send.", getFrom: "sendgrid.com → Settings → API Keys → Create API Key", accessType: "Privada", cost: "freemium" }] },
            { id: "mailgun", name: "Mailgun", icon: Mail, color: "text-blue-400", bg: "bg-blue-500/10", description: "Email API para desarrolladores. Tracking, logs, validación de emails.", website: "mailgun.com", fields: [{ id: "mailgun_key", label: "API Key", type: "password", description: "Clave privada de Mailgun para enviar emails.", getFrom: "mailgun.com → Dashboard → API Keys → Private API Key", accessType: "Privada", cost: "pagado" }] },
            { id: "pusher", name: "Pusher", icon: Sparkles, color: "text-orange-400", bg: "bg-orange-500/10", description: "WebSockets as a service. Realtime para chat, notificaciones, live updates.", website: "pusher.com", fields: [{ id: "pusher_app_id", label: "App ID", type: "text", description: "ID de tu app Pusher.", getFrom: "pusher.com → Dashboard → Tu App → App ID", accessType: "Pública", cost: "freemium" }, { id: "pusher_key", label: "Key", type: "password", description: "Clave pública para conectar desde frontend.", getFrom: "pusher.com → Dashboard → Tu App → Key", accessType: "Pública", cost: "freemium" }, { id: "pusher_secret", label: "Secret", type: "password", description: "Secreto para autenticar desde backend.", getFrom: "pusher.com → Dashboard → Tu App → Secret", accessType: "Privada", cost: "freemium" }, { id: "pusher_cluster", label: "Cluster", type: "text", description: "Región del servidor (ej: us2, eu, mt1).", getFrom: "pusher.com → Dashboard → Tu App → Cluster", accessType: "Pública", cost: "gratis" }] },
            { id: "onesignal", name: "OneSignal", icon: Bell, color: "text-orange-400", bg: "bg-orange-500/10", description: "Push notifications para web, iOS y Android. SDKs fáciles de integrar.", website: "onesignal.com", fields: [{ id: "onesignal_app_id", label: "App ID", type: "text", description: "ID de tu app en OneSignal.", getFrom: "onesignal.com → Settings → Keys & IDs → OneSignal App ID", accessType: "Pública", cost: "freemium" }, { id: "onesignal_api_key", label: "API Key", type: "password", description: "Clave para enviar notificaciones via API.", getFrom: "onesignal.com → Settings → Keys & IDs → API Key", accessType: "Privada", cost: "freemium" }] },
            { id: "pushwoosh", name: "Pushwoosh", icon: Bell, color: "text-purple-400", bg: "bg-purple-500/10", description: "Push notifications cross-platform. Web, mobile, email y SMS.", website: "pushwoosh.com", fields: [{ id: "pushwoosh_app_id", label: "App ID", type: "text", description: "ID de tu app en Pushwoosh.", getFrom: "pushwoosh.com → Settings → Application Settings", accessType: "Pública", cost: "freemium" }, { id: "pushwoosh_api_key", label: "API Key", type: "password", description: "Clave para Pushwoosh API.", getFrom: "pushwoosh.com → Settings → API Access", accessType: "Privada", cost: "freemium" }] },
            { id: "fcm", name: "Firebase Cloud Messaging", icon: Bell, color: "text-amber-400", bg: "bg-amber-500/10", description: "Push notifications gratis de Google. Altamente confiable y escalable.", website: "firebase.google.com/docs/cloud-messaging", fields: [{ id: "fcm_server_key", label: "Server Key", type: "password", description: "Clave del servidor para enviar mensajes via FCM.", getFrom: "Firebase Console → Project Settings → Cloud Messaging → Server Key", accessType: "Privada", cost: "gratis" }, { id: "fcm_sender_id", label: "Sender ID", type: "text", description: "ID del remitente para identificar tu proyecto.", getFrom: "Firebase Console → Project Settings → Cloud Messaging → Sender ID", accessType: "Pública", cost: "gratis" }] },
        ]
    },
    {
        id: "diseno_video",
        title: "Diseño & Video",
        icon: Palette,
        color: "text-pink-400",
        description: "Canva y Adilo para crear diseños y alojar videos.",
        apps: [
            { id: "canva", name: "Canva", icon: Palette, color: "text-purple-400", bg: "bg-purple-500/10", description: "Diseño gráfico con API. Genera imágenes, presentaciones, logos automáticamente.", website: "canva.com/developers", fields: [{ id: "canva_api_key", label: "API Key", type: "password", description: "Clave para Canva API. Requiere aprobación de desarrollador.", getFrom: "canva.com/developers → Register → Create App → API Key", accessType: "Privada", cost: "pagado" }] },
            { id: "adilo", name: "Adilo", icon: Video, color: "text-blue-400", bg: "bg-blue-500/10", description: "Hosting de video profesional. Sube, codifica y reproduce videos en tu web.", website: "adilo.com", fields: [{ id: "adilo_api_key", label: "API Key", type: "password", description: "Clave para Adilo API. Gestión de videos y broadcasts.", getFrom: "adilo.com → Settings → API → Generate Key", accessType: "Privada", cost: "pagado" }, { id: "adilo_account_id", label: "Account ID", type: "text", description: "ID de tu cuenta Adilo.", getFrom: "adilo.com → Dashboard → Account ID", accessType: "Pública", cost: "pagado" }] },
        ]
    },
    {
        id: "recursos_stock",
        title: "Recursos & Stock",
        icon: Image,
        color: "text-cyan-400",
        description: "Bancos de imágenes, videos, iconos y recursos gráficos para diseño.",
        apps: [
            { id: "unsplash", name: "Unsplash", icon: Image, color: "text-white", bg: "bg-black/20", description: "Fotos HD gratuitas de alta calidad. API para búsqueda y descarga automática.", website: "unsplash.com/developers", fields: [{ id: "unsplash_access_key", label: "Access Key", type: "password", description: "Clave de acceso para Unsplash API. 50 requests/hora gratis.", getFrom: "unsplash.com/developers → Create Application → Access Key", accessType: "Pública", cost: "gratis" }, { id: "unsplash_secret_key", label: "Secret Key", type: "password", description: "Clave secreta para autenticación OAuth.", getFrom: "unsplash.com/developers → Create Application → Secret Key", accessType: "Privada", cost: "gratis" }] },
            { id: "pexels", name: "Pexels", icon: Video, color: "text-emerald-400", bg: "bg-emerald-500/10", description: "Fotos y videos gratuitos. API para búsqueda y descarga. 200 requests/hora gratis.", website: "pexels.com/api", fields: [{ id: "pexels_api_key", label: "API Key", type: "password", description: "Clave para Pexels API. Acceso a fotos y videos gratis.", getFrom: "pexels.com/api → Get Started → API Key", accessType: "Pública", cost: "gratis" }] },
            { id: "pixabay", name: "Pixabay", icon: Image, color: "text-green-400", bg: "bg-green-500/10", description: "Imágenes, vectores, ilustraciones y videos gratuitos. 5000 requests/hora.", website: "pixabay.com/api/docs", fields: [{ id: "pixabay_api_key", label: "API Key", type: "password", description: "Clave para Pixabay API. Acceso ilimitado a recursos gratis.", getFrom: "pixabay.com/api/docs → Get API Key", accessType: "Pública", cost: "gratis" }] },
            { id: "brandfetch", name: "Brandfetch", icon: Globe, color: "text-blue-400", bg: "bg-blue-500/10", description: "Logos de empresas y marcas. Obtén logos, colores y fuentes automáticamente.", website: "brandfetch.com", fields: [{ id: "brandfetch_api_key", label: "API Key", type: "password", description: "Clave para Brandfetch API. 100 requests/mes gratis.", getFrom: "brandfetch.com → Sign Up → API Key", accessType: "Pública", cost: "freemium" }] },
            { id: "envato", name: "Envato Elements", icon: Sparkles, color: "text-green-400", bg: "bg-green-500/10", description: "Suscripción mensual con descargas ilimitadas: plantillas, fotos, videos, gráficos, fuentes, audio.", website: "elements.envato.com", fields: [{ id: "envato_api_key", label: "API Key", type: "password", description: "Clave para Envato API. Acceso a catálogo completo con suscripción.", getFrom: "envato.com → Build → Create App → API Key", accessType: "Privada", cost: "pagado" }, { id: "envato_personal_token", label: "Personal Token", type: "password", description: "Token personal para autenticación OAuth con Envato.", getFrom: "build.envato.com → My Apps → Create Token", accessType: "Privada", cost: "pagado" }, { id: "envato_elements_email", label: "Email de Elements", type: "text", description: "Email de tu cuenta de Envato Elements para descarga automática de plantillas.", getFrom: "Tu email de login en elements.envato.com", accessType: "Privada", cost: "pagado" }, { id: "envato_elements_password", label: "Contraseña de Elements", type: "password", description: "Contraseña de tu cuenta de Envato Elements para descarga automática de plantillas.", getFrom: "Tu contraseña de login en elements.envato.com", accessType: "Privada", cost: "pagado" }] },
            { id: "iconfinder", name: "IconFinder", icon: Image, color: "text-orange-400", bg: "bg-orange-500/10", description: "Iconos y logos de alta calidad. Búsqueda de iconos para UI, logos de marcas.", website: "developer.iconfinder.com", fields: [{ id: "iconfinder_api_key", label: "API Key", type: "password", description: "Clave para IconFinder API. Búsqueda y descarga de iconos.", getFrom: "iconfinder.com → Settings → API → Create Key", accessType: "Pública", cost: "freemium" }] },
            { id: "flaticon", name: "Flaticon", icon: Image, color: "text-yellow-400", bg: "bg-yellow-500/10", description: "Base de datos de iconos más grande. Parte del grupo Freepik.", website: "flaticon.com", fields: [{ id: "flaticon_api_key", label: "API Key", type: "password", description: "Clave para Flaticon API. Acceso a millones de iconos.", getFrom: "flaticon.com → Profile → API Key", accessType: "Pública", cost: "freemium" }] },
        ]
    },
    {
        id: "documentos",
        title: "Documentos & PDF",
        icon: FileCheck,
        color: "text-red-400",
        description: "Generadores de documentos PDF, contratos y firmas digitales.",
        apps: [
            { id: "pdfmonkey", name: "PDFMonkey", icon: FileCheck, color: "text-blue-400", bg: "bg-blue-500/10", description: "Genera PDFs dinámicos desde plantillas. Ideal para facturas, contratos, reportes.", website: "pdfmonkey.io", fields: [{ id: "pdfmonkey_api_key", label: "API Key", type: "password", description: "Clave para PDFMonkey API. Generación de PDFs desde plantillas.", getFrom: "pdfmonkey.io → Dashboard → API → API Key", accessType: "Privada", cost: "freemium" }] },
            { id: "docspring", name: "DocSpring", icon: FileCheck, color: "text-purple-400", bg: "bg-purple-500/10", description: "PDF templates con datos dinámicos. Completa plantillas y genera PDFs.", website: "docspring.com", fields: [{ id: "docspring_api_key", label: "API Key", type: "password", description: "Clave para DocSpring API.", getFrom: "docspring.com → Settings → API Keys", accessType: "Privada", cost: "pagado" }, { id: "docspring_secret", label: "Secret", type: "password", description: "Secreto para firmar requests.", getFrom: "docspring.com → Settings → API Keys", accessType: "Privada", cost: "pagado" }] },
            { id: "pandadoc", name: "PandaDoc", icon: FileCheck, color: "text-green-400", bg: "bg-green-500/10", description: "Propuestas, contratos y documentos con firma electrónica integrada.", website: "pandadoc.com", fields: [{ id: "pandadoc_api_key", label: "API Key", type: "password", description: "Clave para PandaDoc API. Crea y envía documentos.", getFrom: "pandadoc.com → Settings → Integrations → API", accessType: "Privada", cost: "pagado" }] },
        ]
    },
    {
        id: "verificacion",
        title: "Verificación de Identidad",
        icon: Users,
        color: "text-amber-400",
        description: "KYC y verificación de identidad para prevenir fraude.",
        apps: [
            { id: "onfido", name: "Onfido", icon: Users, color: "text-blue-400", bg: "bg-blue-500/10", description: "Verificación de identidad con documento y selfie. KYC global con alta precisión.", website: "onfido.com", fields: [{ id: "onfido_api_key", label: "API Key", type: "password", description: "Clave para Onfido API. Solicitudes de verificación.", getFrom: "onfido.com → Dashboard → API → API Key", accessType: "Privada", cost: "pagado" }, { id: "onfido_webhook_token", label: "Webhook Token", type: "password", description: "Token para verificar webhooks de Onfido.", getFrom: "onfido.com → Dashboard → Webhooks → Token", accessType: "Privada", cost: "gratis" }] },
            { id: "jumio", name: "Jumio", icon: Users, color: "text-green-400", bg: "bg-green-500/10", description: "Verificación de identidad con IA. Document ID verification y liveness check.", website: "jumio.com", fields: [{ id: "jumio_api_key", label: "API Key", type: "password", description: "Clave para Jumio API.", getFrom: "jumio.com → Account → API Credentials", accessType: "Privada", cost: "pagado" }, { id: "jumio_api_secret", label: "API Secret", type: "password", description: "Secreto para Jumio API.", getFrom: "jumio.com → Account → API Credentials", accessType: "Privada", cost: "pagado" }] },
            { id: "authenteq", name: "Authenteq", icon: Users, color: "text-teal-400", bg: "bg-teal-500/10", description: "Verificación de identidad automatizada. KYC rápido y seguro.", website: "authenteq.com", fields: [{ id: "authenteq_api_key", label: "API Key", type: "password", description: "Clave para Authenteq API.", getFrom: "authenteq.com → Developer → API Key", accessType: "Privada", cost: "pagado" }] },
        ]
    },
    {
        id: "bases_datos",
        title: "Bases de Datos",
        icon: Database,
        color: "text-orange-400",
        description: "Bases de datos adicionales: MongoDB, PlanetScale, Redis para caching.",
        apps: [
            { id: "mongodb", name: "MongoDB Atlas", icon: Database, color: "text-green-400", bg: "bg-green-500/10", description: "Base de datos NoSQL en la nube. Flexible, escalable, fácil de usar.", website: "mongodb.com/atlas", fields: [{ id: "mongodb_uri", label: "Connection URI", type: "password", description: "URI de conexión a MongoDB Atlas (mongodb+srv://...).", getFrom: "MongoDB Atlas → Clusters → Connect → Connect your application", accessType: "Privada", cost: "freemium" }, { id: "mongodb_api_key", label: "API Key", type: "password", description: "Clave API para administración de clusters.", getFrom: "MongoDB Atlas → Security → Database Access → Add New User", accessType: "Privada", cost: "gratis" }] },
            { id: "planetscale", name: "PlanetScale", icon: Database, color: "text-purple-400", bg: "bg-purple-500/10", description: "MySQL serverless. Branching de bases de datos, sin operationes, escalable.", website: "planetscale.com", fields: [{ id: "planetscale_api_key", label: "API Key", type: "password", description: "Clave para PlanetScale API.", getFrom: "planetscale.com → Settings → API Tokens → Create New Token", accessType: "Privada", cost: "freemium" }, { id: "planetscale_service_token", label: "Service Token", type: "password", description: "Token para acceso service-to-service.", getFrom: "planetscale.com → Settings → Service Tokens", accessType: "Privada", cost: "gratis" }] },
            { id: "upstash", name: "Upstash Redis", icon: Database, color: "text-red-400", bg: "bg-red-500/10", description: "Redis serverless. Cache ultrarrápido para tu aplicación. Ideal para funciones serverless.", website: "upstash.com", fields: [{ id: "upstash_url", label: "Redis URL", type: "text", description: "URL de tu base de datos Redis en Upstash.", getFrom: "upstash.com → Console → Tu Database → REST API → URL", accessType: "Pública", cost: "freemium" }, { id: "upstash_token", label: "REST Token", type: "password", description: "Token para autenticación con Upstash Redis.", getFrom: "upstash.com → Console → Tu Database → REST API → Token", accessType: "Privada", cost: "freemium" }] },
        ]
    },
    {
        id: "publicidad",
        title: "Publicidad",
        icon: Megaphone,
        color: "text-amber-400",
        description: "Plataformas de publicidad y tracking: AdSense, Meta Pixel, TikTok.",
        apps: [
            { id: "adsense", name: "Google AdSense", icon: Megaphone, color: "text-yellow-400", bg: "bg-yellow-500/10", description: "Monetización con anuncios de Google. Muestra anuncios relevantes en tu sitio.", website: "adsense.google.com", fields: [{ id: "adsense_client_id", label: "Publisher ID", type: "text", description: "ID de tu cuenta AdSense (ca-pub-XXXX).", getFrom: "adsense.google.com → Account → Publisher ID", accessType: "Pública", cost: "gratis" }, { id: "adsense_slot_id", label: "Ad Slot ID", type: "text", description: "ID del espacio de anuncio específico.", getFrom: "adsense.google.com → Ads → By ad unit → Tu anuncio → Slot ID", accessType: "Pública", cost: "gratis" }] },
            { id: "google_ads", name: "Google Ads", icon: Megaphone, color: "text-blue-400", bg: "bg-blue-500/10", description: "Plataforma de publicidad de Google. Campañas, remarketing, conversions.", website: "ads.google.com", fields: [{ id: "google_ads_id", label: "Customer ID", type: "text", description: "ID de tu cuenta de Google Ads (XXX-XXX-XXXX).", getFrom: "ads.google.com → Arriba a la derecha → Customer ID", accessType: "Pública", cost: "pagado" }] },
            { id: "meta_pixel", name: "Meta Pixel", icon: Megaphone, color: "text-blue-400", bg: "bg-blue-500/10", description: "Pixel de Facebook/Instagram para tracking de conversions y remarketing.", website: "business.facebook.com", fields: [{ id: "meta_pixel_id", label: "Pixel ID", type: "text", description: "ID del pixel de Meta para tracking.", getFrom: "business.facebook.com → Events Manager → Data Sources → Tu Pixel → ID", accessType: "Pública", cost: "gratis" }] },
            { id: "tiktok_pixel", name: "TikTok Pixel", icon: Megaphone, color: "text-pink-400", bg: "bg-pink-500/10", description: "Pixel de TikTok para tracking de conversions y optimización de campañas.", website: "ads.tiktok.com", fields: [{ id: "tiktok_pixel_id", label: "Pixel Code", type: "text", description: "ID del pixel de TikTok Ads.", getFrom: "ads.tiktok.com → Assets → Events → website Pixel → ID", accessType: "Pública", cost: "gratis" }] },
        ]
    },
    {
        id: "analytics",
        title: "Analytics",
        icon: BarChart3,
        color: "text-blue-400",
        description: "Herramientas de análisis y tracking de comportamiento de usuarios.",
        apps: [
            { id: "google_analytics", name: "Google Analytics", icon: BarChart3, color: "text-blue-400", bg: "bg-blue-500/10", description: "Analytics gratuito de Google. Tracking de visitas, conversión, comportamiento.", website: "analytics.google.com", fields: [{ id: "google_analytics_id", label: "Measurement ID", type: "text", description: "ID de tu propiedad GA4 (G-XXXXXXXXXX).", getFrom: "analytics.google.com → Admin → Data Streams → Tu stream → Measurement ID", accessType: "Pública", cost: "gratis" }] },
            { id: "mixpanel", name: "Mixpanel", icon: BarChart3, color: "text-purple-400", bg: "bg-purple-500/10", description: "Analytics de producto con funnels, retención y cohorts. Endpoint tracking.", website: "mixpanel.com", fields: [{ id: "mixpanel_token", label: "Project Token", type: "password", description: "Token para enviar eventos a Mixpanel.", getFrom: "mixpanel.com → Settings → Project Setup → Token", accessType: "Pública", cost: "freemium" }] },
            { id: "hotjar", name: "Hotjar", icon: BarChart3, color: "text-red-400", bg: "bg-red-500/10", description: "Heatmaps, recordings y feedback tools. Entiende cómo usan tu sitio.", website: "hotjar.com", fields: [{ id: "hotjar_id", label: "Site ID", type: "text", description: "ID de tu sitio en Hotjar.", getFrom: "hotjar.com → Sites → Tu sitio → Site ID", accessType: "Pública", cost: "freemium" }] },
            { id: "plausible", name: "Plausible", icon: BarChart3, color: "text-blue-400", bg: "bg-blue-500/10", description: "Analytics simple y privacy-friendly. Sin cookies, GDPR compliant.", website: "plausible.io", fields: [{ id: "plausible_domain", label: "Domain", type: "text", description: "Dominio a trackear en Plausible.", getFrom: "plausible.io → Add a website → tu dominio", accessType: "Pública", cost: "pagado" }] },
            { id: "amplitude", name: "Amplitude", icon: BarChart3, color: "text-purple-400", bg: "bg-purple-500/10", description: "Analytics de producto para B2B y B2C. Segmentation, cohorts, experiments.", website: "amplitude.com", fields: [{ id: "amplitude_key", label: "API Key", type: "password", description: "Clave para enviar eventos a Amplitude.", getFrom: "amplitude.com → Settings → Projects → API Key", accessType: "Privada", cost: "freemium" }] },
        ]
    },
    {
        id: "gamificacion",
        title: "Gamificación",
        icon: Coins,
        color: "text-emerald-400",
        description: "Sistema de puntos y recompensas para Blis Corp.",
        apps: [
            { id: "blis_config", name: "Configuración Blis", icon: Coins, color: "text-emerald-400", bg: "bg-emerald-500/10", description: "Parámetros del sistema de gamificación de Blis Corp (puntos, coins, recompensas).", website: "Interno", fields: [{ id: "blis_blog_time", label: "Tiempo de Lectura (seg)", type: "text", description: "Segundos que el usuario debe estar en un artículo para ganar coins.", getFrom: "Configuración interna", accessType: "Pública", cost: "gratis" }, { id: "blis_blog_coins", label: "Coins por Lectura", type: "text", description: "Cantidad de coins otorgados después del tiempo de lectura.", getFrom: "Configuración interna", accessType: "Pública", cost: "gratis" }] },
        ]
    },
]