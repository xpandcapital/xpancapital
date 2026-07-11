import {
  Type, Image as ImageIcon, MousePointerClick, Minus, Layout,
  AlignLeft, Columns, Video, Share2, Maximize, Code, Grid
} from 'lucide-react';

export const X_ICON_BASE64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAGrSURBVGhD7dnLroNAEAXgM/v8P2ztoIW1lY1oYxOwsJBgIeIb2NgoKAhKmxQ21mLHB1hYKBCs0gRLK0F6O7+F4S7rzu7cM/PBRxyYnJw7uzs7s0NERERkvwAAUAMoAhGQP/BrbWwBvwCugS6wMefm5eQFwAGwkCrz67SyDtKCPIe+UmR+Hbix6OUQcAxMOmT8AcpAbtTJOuDSMfP3wKX1Re/DOfDqoOk74EmtizZwCuSnGeQBOFLr4gFYtzHIC7Cu1kUHWBgxSANYN9nyN7BmY5DHJtzeAswwBnkA3G0xiNdd+g9jEAMwg4iIiEgA/b9/7jD2o/8QfT+O2Sj0Y0wQ2mHMR6EfY4LQDtP8iYiIiIiISG5h7Ee1v+t+D2OD0A6j/YmIiIiIiMRgbBDaYbQ/ERERERGRGIwNQjuM9iciIiIiIhKDsUFoh9H+REREREREItC/Zt4w9qPaX/9b5o0NQjuM+fR/zbyxQWiHaX6PiIiISD/AxgahHcb8jIiIiPSDYz+q/YmIiIiISB6h/4ZEREQkpwAA/AG1R2N11HhYpwAAAABJRU5ErkJggg==";

export const SOCIAL_CONFIG = {
  facebook: { iconName: "facebook-f", defaultBg: "#1877F2", label: 'Facebook' },
  twitter: { iconName: "twitterx--v1", defaultBg: "#000000", label: 'X (Twitter)' },
  instagram: { iconName: "instagram-new", defaultBg: "#E1306C", label: 'Instagram' },
  linkedin: { iconName: "linkedin", defaultBg: "#0077B5", label: 'LinkedIn' },
  youtube: { iconName: "youtube-play", defaultBg: "#FF0000", label: 'YouTube' },
  tiktok: { iconName: "tiktok", defaultBg: "#000000", label: 'TikTok' },
  pinterest: { iconName: "pinterest-p", defaultBg: "#E60023", label: 'Pinterest' },
  whatsapp: { iconName: "whatsapp--v1", defaultBg: "#25D366", label: 'WhatsApp' },
  telegram: { iconName: "telegram-app", defaultBg: "#0088CC", label: 'Telegram' },
  reddit: { iconName: "reddit", defaultBg: "#FF4500", label: 'Reddit' },
  github: { iconName: "github", defaultBg: "#333333", label: 'GitHub' }
};

export const DEFAULT_PALETTES = [
  { id: 'xpancapital-dark', name: 'XpandCapital Dark', bodyBg: '#181818', containerBg: '#181818', text: '#e5e7eb', primary: '#e11d48' },
  { id: 'xpancapital-light', name: 'XpandCapital Light', bodyBg: '#F3F4F6', containerBg: '#FFFFFF', text: '#333333', primary: '#e11d48' }
];

export const FONTS = [
  { value: 'Arial, Helvetica, sans-serif', label: 'Arial' },
  { value: '"Arial Black", Arial, sans-serif', label: 'Arial Black' },
  { value: 'Helvetica, Arial, sans-serif', label: 'Helvetica' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: '"Times New Roman", Times, serif', label: 'Times New Roman' },
  { value: 'Verdana, Geneva, sans-serif', label: 'Verdana' },
  { value: '"Courier New", Courier, monospace', label: 'Courier New' },
  { value: '"Trebuchet MS", Helvetica, sans-serif', label: 'Trebuchet MS' },
  { value: 'Impact, "Arial Black", sans-serif', label: 'Impact' },
  { value: '"Comic Sans MS", cursive, sans-serif', label: 'Comic Sans MS' },
  { value: 'Tahoma, Geneva, sans-serif', label: 'Tahoma' },
  { value: 'Geneva, Tahoma, sans-serif', label: 'Geneva' }
];

export const FONT_WEIGHTS = [
  { value: 'normal', label: 'Normal' },
  { value: 'bold', label: 'Negrita' },
  { value: '100', label: 'Thin (100)' },
  { value: '200', label: 'Extra Light (200)' },
  { value: '300', label: 'Light (300)' },
  { value: '400', label: 'Regular (400)' },
  { value: '500', label: 'Medium (500)' },
  { value: '600', label: 'Semi Bold (600)' },
  { value: '700', label: 'Bold (700)' },
  { value: '800', label: 'Extra Bold (800)' },
  { value: '900', label: 'Black (900)' }
];

export const PLATFORM_LABELS_MAP = { mailchimp:'MailChimp', stampready:'StampReady', campaignmonitor:'Campaign Monitor', sendgrid:'SendGrid', freshmail:'FreshMail', activecampaign:'ActiveCampaign', mymail:'MyMail', icontact:'iContact', generic:'HTML Genérico' };

export const MERCURY_MODULE_MAP = {
  'mercury-preheader': null, 'mercury-menu': 'header', 'mercury-header': 'hero',
  'mercury-services': 'columns', 'mercury-skills': 'columns', 'mercury-features': 'columns',
  'mercury-team': 'columns', 'mercury-price': 'columns', 'mercury-portfolio': 'columns',
  'mercury-blog': 'columns', 'mercury-event': 'html_module', 'mercury-miscellaneous': 'html_module',
  'mercury-fp': 'columns', 'mercury-quote': 'text', 'mercury-brands': 'columns',
  'mercury-socials': 'social', 'mercury-footer': 'footer', 'mercury-unsubscribe': 'footer',
};

export const RECEIPT_DEMO = {
  producto_1_nombre: 'Masterclass Inteligencia Competitiva', producto_1_categoria: 'Cursos', producto_1_precio: '249.00',
  producto_1_imagen: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=80&q=80',
  producto_2_nombre: 'Kit Legal Completo de Agentes', producto_2_categoria: 'Contratos', producto_2_precio: '89.00',
  producto_2_imagen: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=80&q=80',
  producto_3_nombre: 'Ebook: Técnicas de Cierre', producto_3_categoria: 'Ebooks', producto_3_precio: '29.00',
  producto_3_imagen: 'https://images.unsplash.com/photo-1542382257-80dedb725088?w=80&q=80',
  subtotal: '367.00', descuento_monto: '29.00', cupon: 'XPAND40', total: '338.00',
  metodo_pago: 'Tarjeta de Crédito', fecha: new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' }),
};

export const INITIAL_SETTINGS = {
  bodyBg: '#F3F4F6', containerBg: '#FFFFFF', width: 600, fontFamily: 'Verdana, Geneva, sans-serif',
  sectionGap: 0, activePaletteId: 'xpancapital-light', palettes: DEFAULT_PALETTES, subject: '', previewText: '', evento: 'ninguno'
};

let _uidCounter = 0;
export const getUniqueId = (type) => `${type}-${Date.now()}-${++_uidCounter}-${Math.floor(Math.random() * 9999)}`;

export const getDefaultContent = (type, activePalette = DEFAULT_PALETTES[1]) => {
  switch (type) {
    case 'header': return { logoUrl: 'https://via.placeholder.com/150x50?text=LOGO', bgColor: '#181818', bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', padding: 0, align: 'center', logoWidth: 600 };
case 'text': return { text: 'Escribe tu texto aquí...', textColor: activePalette.text, fontSize: 16, fontWeight: 'normal', align: 'center', bgColor: 'transparent', bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', padding: 0, paddingTop: null, paddingRight: null, paddingBottom: null, paddingLeft: null, lineHeight: 1.5, fontFamily: 'Verdana, Geneva, sans-serif' };
    case 'image': return { imageUrl: 'https://via.placeholder.com/600x250?text=IMAGEN', altText: 'Imagen', linkUrl: '', bgColor: 'transparent', bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', padding: 0, borderRadius: 0, width: 100, align: 'center' };
    case 'video': return { type: 'url', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', coverUrl: 'https://via.placeholder.com/600x337?text=PORTADA+VIDEO', bgColor: 'transparent', bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', padding: 0, borderRadius: 8, align: 'center' };
    case 'columns': return { colCount: 2, bgColor: 'transparent', bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', padding: 0, align: 'top', cols: [[], [], [], []] };
    case 'button': return { text: 'Haz clic aquí', url: '#', buttonBgColor: activePalette.primary, containerBgColor: 'transparent', bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', textColor: '#ffffff', align: 'center', paddingY: 15, paddingX: 30, borderRadius: 6, fontSize: 16, fontWeight: 'bold', fontFamily: 'Verdana, Geneva, sans-serif', width: 'auto', borderStyle: 'none', borderWidth: 0, borderColor: activePalette.primary, padding: 0 };
    case 'divider': return { color: '#e5e7eb', height: 1, borderStyle: 'solid', bgColor: 'transparent', bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', padding: 0 };
    case 'social': return { align: 'center', bgColor: 'transparent', bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', padding: 0, iconSize: 24, borderRadius: 8, networks: [ { id: getUniqueId('net'), network: 'facebook', url: 'https://facebook.com/xpancapital', iconColor: '#ffffff', bgColor: '#1877F2' }, { id: getUniqueId('net'), network: 'instagram', url: 'https://instagram.com/xpancapital', iconColor: '#ffffff', bgColor: '#E1306C' }, { id: getUniqueId('net'), network: 'linkedin', url: 'https://linkedin.com/company/xpancapital', iconColor: '#ffffff', bgColor: '#0077B5' }, { id: getUniqueId('net'), network: 'youtube', url: 'https://youtube.com/@xpancapital', iconColor: '#ffffff', bgColor: '#FF0000' }, { id: getUniqueId('net'), network: 'whatsapp', url: 'https://wa.me/51999999999', iconColor: '#ffffff', bgColor: '#25D366' }, { id: getUniqueId('net'), network: 'tiktok', url: 'https://tiktok.com/@xpancapital', iconColor: '#ffffff', bgColor: '#000000' } ] };
    case 'footer': return { text: '© 2026 Mi Empresa. Todos los derechos reservados.', bgColor: 'transparent', bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', textColor: '#9ca3af', padding: 0, fontSize: 12, fontFamily: 'Verdana, Geneva, sans-serif', align: 'center' };
    default: return {};
  }
};

const activePal = DEFAULT_PALETTES[1];
export const INITIAL_BLOCKS = [
  { id: getUniqueId('header'), type: 'header', content: { ...getDefaultContent('header', activePal), logoUrl: 'https://cloud.xpancapital.org/d/ucnxd3PrBf1kMBJNb7sE09KUO8Nh6Y/MTMxfHBhZGRpbg.png', bgColor: '#181818', padding: 0, logoWidth: 600, align: 'center' } },
  { id: getUniqueId('video'), type: 'video', content: { ...getDefaultContent('video', activePal), type: 'embed', embedCode: '<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; border-radius: 8px;"><iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" allowtransparency="true" src="https://adilo.bigcommand.com/watch/9qAchxvC" frameborder="0" allowfullscreen scrolling="no"></iframe></div>', padding: 0, bgColor: 'transparent' } },
  { id: getUniqueId('text'), type: 'text', content: { ...getDefaultContent('text', activePal), text: 'Desarrollo inmobiliario de alta precisión y rentabilidad.', fontSize: 20, fontWeight: 'bold', padding: 0, align: 'center' } },
  { id: getUniqueId('text'), type: 'text', content: { ...getDefaultContent('text', activePal), text: 'El futuro de las inversiones, hoy.', fontSize: 16, fontWeight: 'normal', padding: 0, align: 'center' } },
  { id: getUniqueId('button'), type: 'button', content: { ...getDefaultContent('button', activePal), text: 'Visita Nuestra Web', url: 'https://xpancapital.org/', borderRadius: 8, paddingY: 15, paddingX: 40, align: 'center' } },
  { id: getUniqueId('spacer'), type: 'spacer', content: { height: 0, bgColor: 'transparent' } },
  { id: getUniqueId('columns'), type: 'columns', content: { colCount: 2, bgColor: 'transparent', padding: 0, align: 'top', cols: [
    [ { id: getUniqueId('image'), type: 'image', content: { ...getDefaultContent('image', activePal), imageUrl: 'https://cloud.xpancapital.org/d/U8IMTGWOIWDocWpLEV8UBqILeC1rd4/MTIxfHBhZGRpbg.jpg', width: 100, borderRadius: 8, padding: 0 } }, { id: getUniqueId('text'), type: 'text', content: { ...getDefaultContent('text', activePal), text: 'Academia XpandCapital', fontSize: 18, fontWeight: 'bold', padding: 0, align: 'left' } }, { id: getUniqueId('text'), type: 'text', content: { ...getDefaultContent('text', activePal), text: 'Accede a nuestros cursos y plataforma de aprendizaje integral.', fontSize: 14, padding: 0, align: 'left', textColor: '#6b7280' } }, { id: getUniqueId('button'), type: 'button', content: { ...getDefaultContent('button', activePal), text: 'Campus Virtual', url: 'https://campus.xpancapital.org/', width: 'full', padding: 0, borderRadius: 6 } } ],
    [ { id: getUniqueId('image'), type: 'image', content: { ...getDefaultContent('image', activePal), imageUrl: 'https://cloud.xpancapital.org/d/EfP8HeSuCuPi4gXCGMC70uhWknu7XB/MTIzfHBhZGRpbg.png', width: 100, borderRadius: 8, padding: 0 } }, { id: getUniqueId('text'), type: 'text', content: { ...getDefaultContent('text', activePal), text: 'Kevin Valdez', fontSize: 18, fontWeight: 'bold', padding: 0, align: 'right' } }, { id: getUniqueId('text'), type: 'text', content: { ...getDefaultContent('text', activePal), text: 'Master Admin. Gestión de proyectos y utilidades CRM.', fontSize: 14, padding: 0, align: 'right', textColor: '#6b7280' } }, { id: getUniqueId('button'), type: 'button', content: { ...getDefaultContent('button', activePal), text: 'Revista Oficial', url: 'https://revista.xpancapital.org/', width: 'full', padding: 0, buttonBgColor: '#181818', borderRadius: 6 } } ]
  ] } },
  { id: getUniqueId('html'), type: 'html', content: { ...getDefaultContent('html', activePal), code: '<iframe src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d4477.301976500339!2d-78.64392665094853!3d-1.2807081613055047!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1ses!2sec!4v1773959115276!5m2!1ses!2sec" width="100%" height="250" style="border:0; border-radius: 8px;" allowfullscreen="" loading="lazy"></iframe>', padding: 0 } },
  { id: getUniqueId('social'), type: 'social', content: { ...getDefaultContent('social', activePal), iconSize: 28, padding: 0, align: 'center', bgColor: '#FFFFFF', borderRadius: 8, networks: [
    { id: getUniqueId('net'), network: 'facebook', url: 'https://www.facebook.com/XpandCapital', iconColor: '#ffffff', bgColor: '#181818' },
    { id: getUniqueId('net'), network: 'instagram', url: 'https://www.instagram.com/kevinvaldezdelacruz/', iconColor: '#ffffff', bgColor: '#e11d48' },
    { id: getUniqueId('net'), network: 'twitter', url: 'https://x.com/kevinVdlc/', iconColor: '#ffffff', bgColor: '#000000' },
    { id: getUniqueId('net'), network: 'whatsapp', url: 'https://wa.me/51934111007', iconColor: '#ffffff', bgColor: '#e11d48' },
    { id: getUniqueId('net'), network: 'youtube', url: 'https://www.youtube.com/c/XpandCapital', iconColor: '#ffffff', bgColor: '#181818' }
  ] } },
  { id: getUniqueId('footer'), type: 'footer', content: { ...getDefaultContent('footer', activePal), text: '© 2026 XpandCapital. Todos los derechos reservados.\nDesarrollo inmobiliario de alta precisión y rentabilidad.', padding: 0, textColor: '#9ca3af', fontSize: 12, align: 'center' } },
  { id: getUniqueId('image'), type: 'image', content: { ...getDefaultContent('image', activePal), imageUrl: 'https://cloud.xpancapital.org/d/cIVlsARe6fHQu1wRMInI2YkUwjV2Va/MTMwfHBhZGRpbg.png', width: 40, borderRadius: 0, padding: 0, align: 'center' } }
];

export const AVAILABLE_BLOCKS = [
  { type: 'header', Icon: Layout, label: 'Encabezado' },
  { type: 'text', Icon: Type, label: 'Texto' },
  { type: 'image', Icon: ImageIcon, label: 'Imagen/GIF' },
  { type: 'video', Icon: Video, label: 'Video' },
  { type: 'columns', Icon: Columns, label: 'Columnas' },
  { type: 'button', Icon: MousePointerClick, label: 'Botón' },
  { type: 'divider', Icon: Minus, label: 'Separador' },
  { type: 'spacer', Icon: Maximize, label: 'Espacio' },
  { type: 'social', Icon: Share2, label: 'Social' },
  { type: 'html', Icon: Code, label: 'HTML Custom' },
  { type: 'receipt', Icon: Grid, label: 'Productos' },
  { type: 'footer', Icon: AlignLeft, label: 'Pie de pág.' }
];


