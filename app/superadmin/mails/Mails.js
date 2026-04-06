'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import JSZip from 'jszip';
import { 
  Type, Image as ImageIcon, MousePointerClick, Minus, Layout, 
  AlignLeft, AlignCenter, AlignRight, Trash2, ArrowUp, ArrowDown, 
  Code, Monitor, Smartphone, X, Copy, Check, Settings, Download, 
  Upload, Layers, Share2, Maximize, Columns, Video, Sparkles, ImagePlus,
  Moon, Sun, Plus, MoveUp, MoveDown, MoveLeft, MoveRight, Palette, Save, Pencil,
  PlusSquare, Database, FolderOpen, Send, Mail, Paperclip, Server, Star, CheckCircle, Zap, AlertCircle, Loader2, Grid, Play,
  Search
} from 'lucide-react';
import { useEmailTemplates, useEmailPalettes } from '@/lib/hooks/useEmailTemplates';
import { useEmailSenders } from '@/lib/hooks/useEmailSenders';
import { useEmailMedia } from '@/lib/hooks/useEmailMedia';
import BlockRenderer from './components/BlockRenderer';
import { PropertyGroup, PropertyInput, PropertyTextarea, PropertySelect, PropertyColor, PropertyAlignment, PropertyFileOrUrl, BlockActions, PropertyBackgroundImage } from './components/PropertyComponents';

const X_ICON_BASE64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAGrSURBVGhD7dnLroNAEAXgM/v8P2ztoIW1lY1oYxOwsJBgIeIb2NgoKAhKmxQ21mLHB1hYKBCs0gRLK0F6O7+F4S7rzu7cM/PBRxyYnJw7uzs7s0NERERkvwAAUAMoAhGQP/BrbWwBvwCugS6wMefm5eQFwAGwkCrz67SyDtKCPIe+UmR+Hbix6OUQcAxMOmT8AcpAbtTJOuDSMfP3wKX1Re/DOfDqoOk74EmtizZwCuSnGeQBOFLr4gFYtzHIC7Cu1kUHWBgxSANYN9nyN7BmY5DHJtzeAswwBnkA3G0xiNdd+g9jEAMwg4iIiEgA/b9/7jD2o/8QfT+O2Sj0Y0wQ2mHMR6EfY4LQDtP8iYiIiIiISG5h7Ee1v+t+D2OD0A6j/YmIiIiIiMRgbBDaYbQ/ERERERGRGIwNQjuM9iciIiIiIhKDsUFoh9H+REREREREItC/Zt4w9qPaX/9b5o0NQjuM+fR/zbyxQWiHaX6PiIiISD/AxgahHcb8jIiIiPSDYz+q/YmIiIiISB6h/4ZEREQkpwAA/AG1R2N11HhYpwAAAABJRU5ErkJggg==";

// --- CONFIGURACIÓN DE REDES SOCIALES ---
const SOCIAL_CONFIG = {
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

// --- PALETAS POR DEFECTO ---
const DEFAULT_PALETTES = [
  { id: 'bliscorp-dark', name: 'BlisCorp Dark', bodyBg: '#181818', containerBg: '#181818', text: '#e5e7eb', primary: '#e11d48' },
  { id: 'bliscorp-light', name: 'BlisCorp Light', bodyBg: '#F3F4F6', containerBg: '#FFFFFF', text: '#333333', primary: '#e11d48' }
];

const FONTS = [
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

const FONT_WEIGHTS = [
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

let _uidCounter = 0;
const getUniqueId = (type) => `${type}-${Date.now()}-${++_uidCounter}-${Math.floor(Math.random() * 9999)}`;

const getDefaultContent = (type, activePalette = DEFAULT_PALETTES[1]) => {
  switch (type) {
    case 'header': return { logoUrl: 'https://via.placeholder.com/150x50?text=LOGO', bgColor: '#181818', bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', padding: 0, align: 'center', logoWidth: 600 };
    case 'text': return { text: 'Escribe tu texto aquí...', textColor: activePalette.text, fontSize: 16, fontWeight: 'normal', align: 'center', bgColor: 'transparent', bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', padding: 20, paddingTop: null, paddingRight: null, paddingBottom: null, paddingLeft: null, lineHeight: 1.5, fontFamily: 'Verdana, Geneva, sans-serif' };
    case 'image': return { imageUrl: 'https://via.placeholder.com/600x250?text=IMAGEN', altText: 'Imagen', linkUrl: '', bgColor: 'transparent', bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', padding: 0, borderRadius: 0, width: 100, align: 'center' };
    case 'video': return { type: 'url', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', coverUrl: 'https://via.placeholder.com/600x337?text=PORTADA+VIDEO', bgColor: 'transparent', bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', padding: 20, borderRadius: 8, align: 'center' };
    case 'columns': return { colCount: 2, bgColor: 'transparent', bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', padding: 20, align: 'top', cols: [[], [], [], []] }; 
    case 'button': return { text: 'Haz clic aquí', url: '#', buttonBgColor: activePalette.primary, containerBgColor: 'transparent', bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', textColor: '#ffffff', align: 'center', paddingY: 15, paddingX: 30, borderRadius: 6, fontSize: 16, fontWeight: 'bold', fontFamily: 'Verdana, Geneva, sans-serif', width: 'auto', borderStyle: 'none', borderWidth: 0, borderColor: activePalette.primary, padding: 10 };
    case 'divider': return { color: '#e5e7eb', height: 1, borderStyle: 'solid', bgColor: 'transparent', bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', padding: 20 };
    case 'spacer': return { height: 30, bgColor: 'transparent', bgImageUrl: '', bgSize: 'cover', bgPosition: 'center' };
    case 'social': return { align: 'center', bgColor: 'transparent', bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', padding: 20, iconSize: 24, borderRadius: 8, networks: [ { id: getUniqueId('net'), network: 'facebook', url: 'https://facebook.com', iconColor: '#ffffff', bgColor: '#1877F2' }, { id: getUniqueId('net'), network: 'instagram', url: 'https://instagram.com', iconColor: '#ffffff', bgColor: '#E1306C' } ] };
    case 'html': return { code: '<div style="text-align: center; padding: 20px;">\n  <strong>HTML Personalizado</strong>\n</div>', bgColor: 'transparent', bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', padding: 0 };
    case 'receipt': return {
      bgColor: '#111111',
      accentColor: '#4ade80',
      headerBg: '#1a1a1a',
      rowBg1: '#141414',
      rowBg2: '#111111',
      totalBg: '#0a1a0f',
      padding: '24px',
      showDiscount: true,
      items: [
        { nombre: '{{producto_1_nombre}}', categoria: '{{producto_1_categoria}}', precio: '{{producto_1_precio}}', imagen: '{{producto_1_imagen}}' },
        { nombre: '{{producto_2_nombre}}', categoria: '{{producto_2_categoria}}', precio: '{{producto_2_precio}}', imagen: '{{producto_2_imagen}}' },
        { nombre: '{{producto_3_nombre}}', categoria: '{{producto_3_categoria}}', precio: '{{producto_3_precio}}', imagen: '{{producto_3_imagen}}' },
      ],
      subtotalVar: '{{subtotal}}',
      descuentoVar: '{{descuento_monto}}',
      cuponVar: '{{cupon}}',
      totalVar: '{{total}}',
      metodoPagoVar: '{{metodo_pago}}',
      fechaVar: '{{fecha}}',
    };
    case 'footer': return { text: '© 2026 Mi Empresa. Todos los derechos reservados.', bgColor: 'transparent', bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', textColor: '#9ca3af', padding: 30, fontSize: 12, fontFamily: 'Verdana, Geneva, sans-serif', align: 'center' };
    default: return {};
  }
};

const INITIAL_SETTINGS = {
  bodyBg: '#F3F4F6',
  containerBg: '#FFFFFF',
  width: 600,
  fontFamily: 'Verdana, Geneva, sans-serif',
  sectionGap: 0,
  activePaletteId: 'bliscorp-light',
  palettes: DEFAULT_PALETTES,
  subject: '',
  previewText: ''
};

// --- PLANTILLA DEFINITIVA ---
const activePal = DEFAULT_PALETTES[1];

const INITIAL_BLOCKS = [
  // 1. Header Oficial BlisCorp
  { id: getUniqueId('header'), type: 'header', content: { ...getDefaultContent('header', activePal), logoUrl: 'https://cloud.blis-corp.com/d/ucnxd3PrBf1kMBJNb7sE09KUO8Nh6Y/MTMxfHBhZGRpbg.png', bgColor: '#181818', padding: 0, logoWidth: 600, align: 'center' } },
  
  // 2. Video ADILO
  { id: getUniqueId('video'), type: 'video', content: { ...getDefaultContent('video', activePal), type: 'embed', embedCode: '<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; border-radius: 8px;"><iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" allowtransparency="true" src="https://adilo.bigcommand.com/watch/9qAchxvC" frameborder="0" allowfullscreen scrolling="no"></iframe></div>', padding: 20, bgColor: 'transparent' } },
  
  // 3. Título Principal
  { id: getUniqueId('text'), type: 'text', content: { ...getDefaultContent('text', activePal), text: 'Desarrollo inmobiliario de alta precisión y rentabilidad.', fontSize: 20, fontWeight: 'bold', padding: 10, align: 'center' } },
  
  // 4. Subtítulo
  { id: getUniqueId('text'), type: 'text', content: { ...getDefaultContent('text', activePal), text: 'El futuro de las inversiones, hoy.', fontSize: 16, fontWeight: 'normal', padding: 10, align: 'center' } },
  
  // 5. Botón de Acción Principal
  { id: getUniqueId('button'), type: 'button', content: { ...getDefaultContent('button', activePal), text: 'Visita Nuestra Web', url: 'https://blis-corp.com/', borderRadius: 8, paddingY: 15, paddingX: 40, align: 'center' } },
  
  // 6. Espaciador
  { id: getUniqueId('spacer'), type: 'spacer', content: { height: 20, bgColor: 'transparent' } },
  
  // 7. Columnas Informativas
  { id: getUniqueId('columns'), type: 'columns', content: {
      colCount: 2, bgColor: 'transparent', padding: 20, align: 'top',
      cols: [
        [
          { id: getUniqueId('image'), type: 'image', content: { ...getDefaultContent('image', activePal), imageUrl: 'https://cloud.blis-corp.com/d/U8IMTGWOIWDocWpLEV8UBqILeC1rd4/MTIxfHBhZGRpbg.jpg', width: 100, borderRadius: 8, padding: 5 } },
          { id: getUniqueId('text'), type: 'text', content: { ...getDefaultContent('text', activePal), text: 'Academia BlisCorp', fontSize: 18, fontWeight: 'bold', padding: 5, align: 'left' } },
          { id: getUniqueId('text'), type: 'text', content: { ...getDefaultContent('text', activePal), text: 'Accede a nuestros cursos y plataforma de aprendizaje integral.', fontSize: 14, padding: 5, align: 'left', textColor: '#6b7280' } },
          { id: getUniqueId('button'), type: 'button', content: { ...getDefaultContent('button', activePal), text: 'Campus Virtual', url: 'https://campus.blis-corp.com/', width: 'full', padding: 5, borderRadius: 6 } }
        ],
        [
          { id: getUniqueId('image'), type: 'image', content: { ...getDefaultContent('image', activePal), imageUrl: 'https://cloud.blis-corp.com/d/EfP8HeSuCuPi4gXCGMC70uhWknu7XB/MTIzfHBhZGRpbg.png', width: 100, borderRadius: 8, padding: 5 } },
          { id: getUniqueId('text'), type: 'text', content: { ...getDefaultContent('text', activePal), text: 'Kevin Valdez', fontSize: 18, fontWeight: 'bold', padding: 5, align: 'right' } },
          { id: getUniqueId('text'), type: 'text', content: { ...getDefaultContent('text', activePal), text: 'Master Admin. Gestión de proyectos y utilidades CRM.', fontSize: 14, padding: 5, align: 'right', textColor: '#6b7280' } },
          { id: getUniqueId('button'), type: 'button', content: { ...getDefaultContent('button', activePal), text: 'Revista Oficial', url: 'https://revista.blis-corp.com/', width: 'full', padding: 5, buttonBgColor: '#181818', borderRadius: 6 } }
        ]
      ]
    }
  },
  
  // 8. Mapa de Google
  { id: getUniqueId('html'), type: 'html', content: { ...getDefaultContent('html', activePal), code: '<iframe src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d4477.301976500339!2d-78.64392665094853!3d-1.2807081613055047!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1ses!2sec!4v1773959115276!5m2!1ses!2sec" width="100%" height="250" style="border:0; border-radius: 8px;" allowfullscreen="" loading="lazy"></iframe>', padding: 20 } },
  
  // 9. Bloque Social
  { id: getUniqueId('social'), type: 'social', content: { ...getDefaultContent('social', activePal), iconSize: 28, padding: 20, align: 'center', bgColor: '#FFFFFF', borderRadius: 8, networks: [
    { id: getUniqueId('net'), network: 'facebook', url: 'https://www.facebook.com/BlisCorp', iconColor: '#ffffff', bgColor: '#181818' },
    { id: getUniqueId('net'), network: 'instagram', url: 'https://www.instagram.com/kevinvaldezdelacruz/', iconColor: '#ffffff', bgColor: '#e11d48' },
    { id: getUniqueId('net'), network: 'twitter', url: 'https://x.com/kevinVdlc/', iconColor: '#ffffff', bgColor: '#000000' },
    { id: getUniqueId('net'), network: 'whatsapp', url: 'https://wa.me/51934111007', iconColor: '#ffffff', bgColor: '#e11d48' },
    { id: getUniqueId('net'), network: 'youtube', url: 'https://www.youtube.com/c/BlisCorp', iconColor: '#ffffff', bgColor: '#181818' }
  ] } },
  
  // 10. Footer Texto
  { id: getUniqueId('footer'), type: 'footer', content: { ...getDefaultContent('footer', activePal), text: '© 2026 BlisCorp. Todos los derechos reservados.\nDesarrollo inmobiliario de alta precisión y rentabilidad.', padding: 30, textColor: '#9ca3af', fontSize: 12, align: 'center' } },
  
  // 11. Logo Footer
  { id: getUniqueId('image'), type: 'image', content: { ...getDefaultContent('image', activePal), imageUrl: 'https://cloud.blis-corp.com/d/cIVlsARe6fHQu1wRMInI2YkUwjV2Va/MTMwfHBhZGRpbg.png', width: 40, borderRadius: 0, padding: 10, align: 'center' } }
];

const AVAILABLE_BLOCKS = [
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

export default function App() {
  const { getTemplates, getTemplate, saveTemplate: saveTemplateToDb, deleteTemplate: deleteTemplateFromDb, loading: templatesLoading } = useEmailTemplates();
  const { getPalettes: getPalettesFromDb, savePalette: savePaletteToDb, deletePalette: deletePaletteFromDb, loading: palettesLoading } = useEmailPalettes();
  const { senders, loading: sendersLoading, getSenders, saveSender, deleteSender } = useEmailSenders();
  const { media, loading: mediaLoading, getMedia, uploadMedia, deleteMedia } = useEmailMedia();
  const [templates, setTemplates] = useState([]);
  const [currentTemplateId, setCurrentTemplateId] = useState(null);
  
  const [blocks, setBlocks] = useState([]);
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [previewMode, setPreviewMode] = useState('desktop');
  const [activeTab, setActiveTab] = useState('blocks');
  const [demoData, setDemoData] = useState({
    nombre: 'Juan Pérez',
    email: 'juan@email.com',
    password: 'Blis2024X',
    telefono: '+51 999 888 777',
    productos: '✅ Masterclass Inteligencia Competitiva\n✅ Kit Legal de Agentes\n✅ Ebook: Técnicas de Cierre',
    total: '338.00',
    metodo_pago: 'Tarjeta de Crédito',
    fecha: new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' }),
    empresa: 'BLIS Corp',
    ciudad: 'Lima',
    campana: 'Oferta Black Friday',
    descuento: '40%',
    cupon: 'BLIS40',
    vencimiento: '31 de diciembre 2025',
    enlace_acceso: 'https://blis-corp.com/miembros',
    enlace_baja: 'https://blis-corp.com/baja',
    whatsapp: '+51 999 000 111',
    subtotal: '367.00',
    descuento_monto: '29.00',
  });
  const [previewWithDemo, setPreviewWithDemo] = useState(false);
  const [theme, setTheme] = useState('dark');
  const PLATFORM_LABELS_MAP = { mailchimp:'MailChimp', stampready:'StampReady', campaignmonitor:'Campaign Monitor', sendgrid:'SendGrid', freshmail:'FreshMail', activecampaign:'ActiveCampaign', mymail:'MyMail', icontact:'iContact', generic:'HTML Genérico' };
  const [zipModal, setZipModal] = useState(false);
  const [zipFiles, setZipFiles] = useState([]);
  const [zipLoading, setZipLoading] = useState(false);
  const [showEnvatoPanel, setShowEnvatoPanel] = useState(false);
  const [envatoStatus, setEnvatoStatus] = useState(null); // null=loading, {connected,username,method}
  const [envatoQuery, setEnvatoQuery] = useState('email template');
  const [envatoResults, setEnvatoResults] = useState([]);
  const [envatoLoading, setEnvatoLoading] = useState(false);
  const [envatoDownloading, setEnvatoDownloading] = useState(null); // id del item descargando
  const [leftPanelTab, setLeftPanelTab] = useState('blocks'); // 'blocks' | 'envato'

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]); 
  
  const [isEditingPalette, setIsEditingPalette] = useState(false);
  const [editingPaletteId, setEditingPaletteId] = useState(null);
  const [paletteForm, setPaletteForm] = useState({ name: 'Nueva Paleta', bodyBg: '#0a0a0a', containerBg: '#111111', text: '#e5e7eb', primary: '#e11d48' });

  const [showExportHtml, setShowExportHtml] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsTab, setSettingsTab] = useState('senders');
  const [sendTab, setSendTab] = useState('destinatarios');
  const [campaignConfig, setCampaignConfig] = useState({ subject: '', preview: '', type: 'manual', emails: '', selectedSenderId: '' });
const [attachments, setAttachments] = useState([]);
  const [editingSender, setEditingSender] = useState(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const mediaCallbackRef = useRef(null);
  const [mediaTab, setMediaTab] = useState('all');
  const [templateName, setTemplateName] = useState('');
const [savedTemplates, setSavedTemplates] = useState([]);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);
  const mediaUploadRef = useRef(null);

  // Cargar plantillas guardadas
  useEffect(() => {
    const loadTemplates = async () => {
      const templates = await getTemplates();
      if (templates) setSavedTemplates(templates);
    };
    loadTemplates();
  }, []);

  // Cargar remitentes
  useEffect(() => {
    getSenders();
  }, [getSenders]);

  // Cargar medios
  useEffect(() => {
    getMedia();
  }, [getMedia]);

  // Cargar paletas desde la base de datos al iniciar
  useEffect(() => {
    const loadPalettes = async () => {
      const dbPalettes = await getPalettesFromDb();
      if (dbPalettes && dbPalettes.length > 0) {
        const mapped = dbPalettes.map(p => ({
          id: p.id,
          name: p.nombre,
          bodyBg: p.body_bg,
          containerBg: p.container_bg,
          text: p.text,
          primary: p.primary_color
        }));
        setSettings(prev => ({
          ...prev,
          palettes: [...DEFAULT_PALETTES, ...mapped.filter(dp => !DEFAULT_PALETTES.some(dp2 => dp2.id === dp.id))]
        }));
      }
    };
    loadPalettes();
  }, []);

  const currentPalettes = settings.palettes && settings.palettes.length > 0 ? settings.palettes : DEFAULT_PALETTES;
  const activePalette = currentPalettes.find(p => p.id === settings.activePaletteId) || currentPalettes[0] || DEFAULT_PALETTES[0];

  const findBlockInfo = (blocksArray, id, parentId = null, colIndex = null) => {
    for (let i = 0; i < blocksArray.length; i++) {
      if (blocksArray[i].id === id) return { block: blocksArray[i], parentId, colIndex, index: i, array: blocksArray };
      if (blocksArray[i].type === 'columns') {
        for (let j = 0; j < blocksArray[i].content.cols.length; j++) {
          const found = findBlockInfo(blocksArray[i].content.cols[j], id, blocksArray[i].id, j);
          if (found) return found;
        }
      }
    }
    return null;
  };

  const addBlock = (type) => {
    const newBlock = { id: getUniqueId(type), type, content: getDefaultContent(type, activePalette) };
    const info = selectedBlockId ? findBlockInfo(blocks, selectedBlockId) : null;
    
    if (info && info.parentId) {
      updateBlockTree(blocks, info.parentId, 'add_to_col', { colIndex: info.colIndex, newBlock, insertAfter: info.index });
    } else {
      setBlocks([...blocks, newBlock]);
    }
    setSelectedBlockId(newBlock.id);
    setActiveTab('blocks');
  };

  const addBlockToSpecificColumn = (parentId, colIndex, type) => {
    const newBlock = { id: getUniqueId(type), type, content: getDefaultContent(type, activePalette) };
    setBlocks(updateBlockTree(blocks, parentId, 'append_to_col', { colIndex, newBlock }));
    setSelectedBlockId(newBlock.id);
  };

  const updateBlockTree = (currentBlocks, targetId, action, payload) => {
    const newBlocks = [...currentBlocks];
    for (let i = 0; i < newBlocks.length; i++) {
      if (newBlocks[i].id === targetId) {
        if (action === 'update_content') {
          newBlocks[i] = { ...newBlocks[i], content: { ...newBlocks[i].content, [payload.key]: payload.value } };
        } else if (action === 'append_to_col') {
          const newCols = [...newBlocks[i].content.cols];
          newCols[payload.colIndex] = [...newCols[payload.colIndex], payload.newBlock];
          newBlocks[i] = { ...newBlocks[i], content: { ...newBlocks[i].content, cols: newCols } };
        } else if (action === 'add_to_col') {
           const newCols = [...newBlocks[i].content.cols];
           newCols[payload.colIndex].splice(payload.insertAfter + 1, 0, payload.newBlock);
           newBlocks[i] = { ...newBlocks[i], content: { ...newBlocks[i].content, cols: newCols } };
        }
        return newBlocks;
      }
      if (newBlocks[i].type === 'columns') {
        const updatedCols = newBlocks[i].content.cols.map(col => updateBlockTree(col, targetId, action, payload));
        newBlocks[i] = { ...newBlocks[i], content: { ...newBlocks[i].content, cols: updatedCols } };
      }
    }
    return newBlocks;
  };

  const handleUpdateContent = useCallback((key, value) => {
    if(!selectedBlockId) return;
    setBlocks(prev => {
      const updateRecursive = (arr) => arr.map(b => {
        if (b.id === selectedBlockId) {
          return { ...b, content: { ...b.content, [key]: value } };
        }
        if (b.type === 'columns') {
          return { ...b, content: { ...b.content, cols: b.content.cols.map(c => updateRecursive(c)) } };
        }
        return b;
      });
      return updateRecursive(prev);
    });
  }, [selectedBlockId]);

  const updateSetting = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const removeBlock = useCallback((id, e) => {
    if(e) e.stopPropagation();
    setBlocks(prev => {
      const removeRecursive = (arr) => {
        return arr.filter(b => b.id !== id).map(b => {
          if(b.type === 'columns') return { ...b, content: { ...b.content, cols: b.content.cols.map(c => removeRecursive(c)) } };
          return b;
        });
      };
      return removeRecursive(prev);
    });
    setSelectedBlockId(prev => prev === id ? null : prev);
  }, []);

  const moveBlock = useCallback((id, direction, e) => {
    if(e) e.stopPropagation();
    
    setBlocks(prev => {
      const info = findBlockInfo(prev, id);
      if (!info) return prev;

      const moveInArray = (arr, idx, dir) => {
        const newArr = [...arr];
        if (dir === 'up' && idx > 0) [newArr[idx - 1], newArr[idx]] = [newArr[idx], newArr[idx - 1]];
        if (dir === 'down' && idx < arr.length - 1) [newArr[idx + 1], newArr[idx]] = [newArr[idx], newArr[idx + 1]];
        return newArr;
      };

      if (info.parentId === null) {
        return moveInArray(prev, info.index, direction);
      } else {
        const updateParentCol = (currBlocks) => {
          return currBlocks.map(b => {
            if (b.id === info.parentId) {
              const newCols = [...b.content.cols];
              newCols[info.colIndex] = moveInArray(newCols[info.colIndex], info.index, direction);
              return { ...b, content: { ...b.content, cols: newCols } };
            }
            if (b.type === 'columns') return { ...b, content: { ...b.content, cols: b.content.cols.map(c => updateParentCol(c)) } };
            return b;
          });
        };
        return updateParentCol(prev);
      }
    });
  }, [blocks]);

  const toggleCreatePalette = () => {
    if (isEditingPalette && !editingPaletteId) {
      setIsEditingPalette(false);
    } else {
      setEditingPaletteId(null);
      setPaletteForm({ name: 'Nueva Paleta', bodyBg: '#0a0a0a', containerBg: '#111111', text: '#e5e7eb', primary: '#e11d48' });
      setIsEditingPalette(true);
    }
  };

  const startEditPalette = (palette, e) => {
    e.stopPropagation();
    setEditingPaletteId(palette.id);
    setPaletteForm({ ...palette });
    setIsEditingPalette(true);
  };

  const deletePalette = async (id, e) => {
    e.stopPropagation();
    if (currentPalettes.length <= 1) {
      alert("No puedes eliminar la última paleta.");
      return;
    }
    const newPalettes = currentPalettes.filter(p => p.id !== id);
    setSettings(prev => ({ ...prev, palettes: newPalettes }));
    
    if (settings.activePaletteId === id) {
      applyPalette(newPalettes[0].id, newPalettes[0]); 
    }
    if (editingPaletteId === id) {
      setIsEditingPalette(false);
    }
    
    // Eliminar de la BD si no es una paleta por defecto
    if (!id.startsWith('bliscorp-')) {
      await deletePaletteFromDb(id);
    }
  };

  const movePalette = (index, dir, e) => {
    e.stopPropagation();
    const newPalettes = [...currentPalettes];
    if (dir === 'up' && index > 0) {
      [newPalettes[index - 1], newPalettes[index]] = [newPalettes[index], newPalettes[index - 1]];
    } else if (dir === 'down' && index < newPalettes.length - 1) {
      [newPalettes[index + 1], newPalettes[index]] = [newPalettes[index], newPalettes[index + 1]];
    }
    setSettings(prev => ({ ...prev, palettes: newPalettes }));
  };

  const applyPalette = (paletteId, explicitPaletteObj = null) => {
    const paletteToApply = explicitPaletteObj || currentPalettes.find(x => x.id === paletteId);
    if(!paletteToApply) return;

    const oldPalette = currentPalettes.find(p => p.id === settings.activePaletteId) || currentPalettes[0];

    setSettings(prev => ({ 
      ...prev, 
      activePaletteId: paletteToApply.id, 
      bodyBg: paletteToApply.bodyBg, 
      containerBg: paletteToApply.containerBg 
    }));

    const updateBlockColorsRecursively = (blockArray) => {
      return blockArray.map(b => {
         let newContent = { ...b.content };
         
         if (newContent.textColor && newContent.textColor.toLowerCase() === oldPalette.text.toLowerCase()) {
            newContent.textColor = paletteToApply.text;
         }
         if (b.type === 'button') {
            if (newContent.buttonBgColor && newContent.buttonBgColor.toLowerCase() === oldPalette.primary.toLowerCase()) {
               newContent.buttonBgColor = paletteToApply.primary;
            }
            if (newContent.borderColor && newContent.borderColor.toLowerCase() === oldPalette.primary.toLowerCase()) {
               newContent.borderColor = paletteToApply.primary;
            }
         }
         if (b.type === 'columns') {
            newContent.cols = newContent.cols.map(colArr => updateBlockColorsRecursively(colArr));
         }
         return { ...b, content: newContent };
      });
    };
    
    setBlocks(prevBlocks => updateBlockColorsRecursively(prevBlocks));
  };

  const savePalette = () => {
    if (editingPaletteId) {
      const updatedPal = { ...paletteForm, id: editingPaletteId };
      setSettings(prev => ({
        ...prev,
        palettes: prev.palettes.map(p => p.id === editingPaletteId ? updatedPal : p)
      }));
      applyPalette(editingPaletteId, updatedPal);
      // Guardar en BD
      savePaletteToDb({
        id: editingPaletteId,
        nombre: paletteForm.name,
        body_bg: paletteForm.bodyBg,
        container_bg: paletteForm.containerBg,
        text: paletteForm.text,
        primary_color: paletteForm.primary
      });
    } else {
      const newId = `palette-${Date.now()}`;
      const pal = { ...paletteForm, id: newId };
      setSettings(prev => ({ 
        ...prev, 
        palettes: [...(prev.palettes || []), pal] 
      }));
      applyPalette(newId, pal);
      // Guardar en BD
      savePaletteToDb({
        nombre: paletteForm.name,
        body_bg: paletteForm.bodyBg,
        container_bg: paletteForm.containerBg,
        text: paletteForm.text,
        primary_color: paletteForm.primary
      });
    }
    setIsEditingPalette(false);
  };

  // Guardar plantilla en la base de datos
  const saveTemplate = async (nombre = 'Nueva Plantilla', isNew = true) => {
    const saved = await saveTemplateToDb({
      id: isNew ? undefined : currentTemplateId,
      nombre,
      settings,
      blocks
    });
    if (saved) {
      setCurrentTemplateId(saved.id);
      alert(isNew ? 'Plantilla guardada correctamente' : 'Plantilla actualizada correctamente');
    }
    return saved;
  };

  const handleSaveTemplate = async (isNew = true) => {
    if (!templateName.trim()) {
      alert('Por favor ingresa un nombre para la plantilla');
      return;
    }
    const saved = await saveTemplate(templateName, isNew);
    if (saved) {
      setShowSaveModal(false);
      // Recargar plantillas
      const templates = await getTemplates();
      if (templates) setSavedTemplates(templates);
    }
  };

  // Cargar plantilla desde BD
    const handleLoadTemplate = async (templateId) => {
    try {
      const found = await getTemplate(templateId); // <-- llama al singular para traer settings y blocks
      if (found) {
        const blks = typeof found.blocks === 'string' ? JSON.parse(found.blocks) : found.blocks;
        const sets = typeof found.settings === 'string' ? JSON.parse(found.settings) : found.settings;
        setBlocks(blks || []);
        setSettings(sets || INITIAL_SETTINGS);
        setCurrentTemplateId(found.id);
        setTemplateName(found.nombre);
        setShowTemplatesModal(false);
        setSelectedBlockId(null);
        // Activar demo automáticamente si hay bloque receipt
        const hasReceipt = (blks || []).some(b => b.type === 'receipt');
        if (hasReceipt) setPreviewWithDemo(true);
      } else {
        alert("No se pudo cargar la plantilla.");
      }
    } catch (e) {
      console.error(e);
      alert("Error al cargar la plantilla.");
    }
  };;

  // Nueva plantilla
  const handleNewTemplate = () => {
    setBlocks([]);
    setSettings(INITIAL_SETTINGS);
    setCurrentTemplateId(null);
    setTemplateName('');
    setSelectedBlockId(null);
  };

  const exportTemplate = () => {
    const templateData = JSON.stringify({ settings, blocks }, null, 2);
    const blob = new Blob([templateData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plantilla-bliscorp-${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ── MOTOR DE CONVERSIÓN ENVATO → BLOQUES NATIVOS ─────────────────────────────
  // Mapa de módulos Mercury → tipo de bloque nativo
  const MERCURY_MODULE_MAP = {
    'mercury-preheader':     null,           // ignorar (texto oculto)
    'mercury-menu':          'header',       // menú superior → header
    'mercury-header':        'hero',         // hero con imagen grande
    'mercury-services':      'columns',      // iconos en columnas
    'mercury-skills':        'columns',      // columnas de skills
    'mercury-features':      'columns',      // features en columnas
    'mercury-team':          'columns',      // equipo en columnas
    'mercury-price':         'columns',      // precios en columnas
    'mercury-portfolio':     'columns',      // portfolio en columnas
    'mercury-blog':          'columns',      // blog en columnas
    'mercury-event':         'html_module',  // evento (complejo)
    'mercury-miscellaneous': 'html_module',  // módulos misceláneos
    'mercury-fp':            'columns',      // feature points
    'mercury-quote':         'text',         // cita/testimonio
    'mercury-brands':        'columns',      // logos de marcas
    'mercury-socials':       'social',       // iconos sociales
    'mercury-footer':        'footer',       // pie de página
    'mercury-unsubscribe':   'footer',       // unsubscribe → footer
  };

  // Detectar la plataforma/formato del HTML de Envato
  const detectEnvatoPlatform = (htmlString) => {
    const h = htmlString.toLowerCase();
    if (h.includes('mc:edit') || h.includes('mc:repeatable') || h.includes('mailchimp')) return 'mailchimp';
    if (h.includes('stampready') || h.includes('stamp-ready') || h.includes('sr:')) return 'stampready';
    if (h.includes('campaign monitor') || h.includes('campaignmonitor') || h.includes('cm:') || h.includes('editable')) return 'campaignmonitor';
    if (h.includes('sendgrid')) return 'sendgrid';
    if (h.includes('freshmail')) return 'freshmail';
    if (h.includes('activecampaign')) return 'activecampaign';
    if (h.includes('mymail') || h.includes('my-mail')) return 'mymail';
    if (h.includes('icontact')) return 'icontact';
    return 'generic'; // HTML genérico o Responsive
  };

  // Pre-procesar HTML según plataforma para normalizar antes del parsing
  const preprocessHTML = (htmlString, platform) => {
    let html = htmlString;
    switch (platform) {
      case 'mailchimp':
        // Remover atributos MailChimp que confunden el parser
        html = html.replace(/mc:edit="[^"]*"/gi, '');
        html = html.replace(/mc:repeatable="[^"]*"/gi, '');
        html = html.replace(/mc:hideable="[^"]*"/gi, '');
        html = html.replace(/mc:variant="[^"]*"/gi, '');
        // Los merge tags de MailChimp *|FNAME|* → dejar como texto
        html = html.replace(/\*\|([^|]+)\|\*/g, '{{$1}}');
        break;
      case 'stampready':
        // StampReady usa atributos sr: y módulos
        html = html.replace(/sr:[a-z-]+="[^"]*"/gi, '');
        html = html.replace(/data-sr-[a-z-]+="[^"]*"/gi, '');
        break;
      case 'campaignmonitor':
        // Campaign Monitor usa clases "editable" y atributos "label"
        html = html.replace(/ editable(?=[\s>])/gi, '');
        html = html.replace(/ label="[^"]*"/gi, '');
        break;
      default:
        break;
    }
    // Normalización común: quitar comentarios condicionales de Outlook pero preservar estructura
    html = html.replace(/<!--\[if[^\]]*\]>[\s\S]*?<!\[endif\]-->/gi, '');
    // Preservar comentarios que NO son condicionales (pueden tener contenido)
    return html;
  };

  // ── Parser por secciones HTML (fiel al original) ─────────────────────────────
  // Divide por comentarios <!-- NAME STARTS --> ... <!-- NAME ENDS -->
  // Cada sección se convierte en un bloque html editable
  const parseByHTMLSections = (htmlString) => {
    // Extraer estilos del <head> para incluirlos en cada sección
    const headStyles = (() => {
      const styleMatches = htmlString.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
      return styleMatches.join('\n');
    })();

    const wrapSection = (html, name) => {
      // Envolver con los estilos del head para que se vea correcto
      const wrapped = `<html><head><meta charset="utf-8">${headStyles}</head><body style="margin:0;padding:0;background:#ffffff;">${html}</body></html>`;
      return {
        id: getUniqueId('html'),
        type: 'html',
        content: {
          code: html.trim(),
          bgColor: 'transparent',
          bgImageUrl: '',
          bgSize: 'cover',
          bgPosition: 'center',
          padding: 0,
          _sectionName: name, // metadata para mostrar el nombre
        }
      };
    };

    // Patrón: <!-- SOMETHING STARTS --> ... <!-- SOMETHING ENDS -->
    const sectionPattern = /<!--\s*([A-Z][A-Z\s0-9\-]+?)\s*STARTS\s*-->([\s\S]*?)<!--\s*\1\s*ENDS\s*-->/gi;
    const blocks = [];
    let match;
    
    while ((match = sectionPattern.exec(htmlString)) !== null) {
      const name = match[1].trim();
      const content = match[2].trim();
      if (content.length > 10) {
        blocks.push(wrapSection(match[0], name));
      }
    }

    // Si no encontró patrón STARTS/ENDS, intentar con data-module
    if (blocks.length === 0) return null;

    return blocks;
  };

  const parseEnvatoHTML = (htmlString) => {
    const platform = detectEnvatoPlatform(htmlString);
    const cleanedHTML = preprocessHTML(htmlString, platform);
    
    // ── ESTRATEGIA 1: data-module (Mercury style) ──────────────────────────────
    const moduleMatches = cleanedHTML.match(/data-module="([^"]+)"/g);
    if (moduleMatches && moduleMatches.length > 0) {
      const result = parseByModules(cleanedHTML, platform);
      console.log('parseByModules result:', result.length, 'blocks');
      if (result.length > 0) return result;
    }

    // ── ESTRATEGIA 2: MailChimp mc:repeatable ──────────────────────────────────
    if (platform === 'mailchimp' && cleanedHTML.includes('mc:repeatable')) {
      return parseByMailChimpModules(cleanedHTML);
    }

    // ── ESTRATEGIA 3: Pennyblack / Medical style con comentarios STARTS/ENDS ────
    const hasSectionComments = /<!--\s*[A-Z][A-Z\s0-9\-]+\s*STARTS\s*-->/i.test(cleanedHTML);
    if (hasSectionComments) {
      const result = parsePennyblackSections(cleanedHTML);
      if (result && result.length > 0) {
        console.log('parsePennyblackSections result:', result.length, 'blocks');
        return result;
      }
    }

    // ── ESTRATEGIA 4: Tabla principal con filas como secciones ─────────────────
    return parseByRows(cleanedHTML);
    // eslint-disable-next-line no-unreachable
    const parser = new DOMParser();
    const doc = parser.parseFromString(cleanedHTML, 'text/html');
    const blocks = [];

    // Extraer estilos inline del <style> para resolver clases
    const styleRules = {};
    doc.querySelectorAll('style').forEach(styleEl => {
      const css = styleEl.textContent || '';
      const rules = css.match(/\.([a-zA-Z0-9_-]+)\s*\{([^}]+)\}/g) || [];
      rules.forEach(rule => {
        const m = rule.match(/\.([a-zA-Z0-9_-]+)\s*\{([^}]+)\}/);
        if (m) styleRules[m[1]] = m[2];
      });
    });

    // Resolver estilos de un elemento (inline + clases)
    const getElStyle = (el) => {
      let style = el.getAttribute('style') || '';
      const classes = (el.getAttribute('class') || '').split(/\s+/);
      classes.forEach(cls => { if (styleRules[cls]) style += ';' + styleRules[cls]; });
      const parse = (prop) => {
        const m = style.match(new RegExp(prop + '\\s*:\\s*([^;]+)', 'i'));
        return m ? m[1].trim() : null;
      };
      return { raw: style, get: parse };
    };

    // Reemplazar paths relativos de imágenes
    const fixSrc = (src) => {
      if (!src) return '';
      if (src.startsWith('http') || src.startsWith('//') || src.startsWith('data:')) return src;
      return 'https://placehold.co/600x200/1a1a1a/555555?text=Imagen';
    };

    // Detectar color de fondo dominante de un elemento y sus padres
    const getBgColor = (el) => {
      let cur = el;
      for (let i = 0; i < 5; i++) {
        if (!cur) break;
        const s = getElStyle(cur);
        const bg = s.get('background-color') || s.get('background');
        if (bg && bg !== 'transparent' && bg !== 'inherit' && !bg.includes('url(')) return bg;
        cur = cur.parentElement;
      }
      return null;
    };

    // ── Detectores de tipo de sección ───────────────────────────────────────────

    // HEADER: primera sección con logo (img pequeña + fondo oscuro o de color)
    const isHeader = (td) => {
      const imgs = td.querySelectorAll('img');
      const text = td.textContent.trim();
      const style = getElStyle(td);
      const bg = getBgColor(td);
      const isTop = blocks.length === 0;
      // Logo suele ser img pequeña sin texto largo
      if (imgs.length === 1 && text.length < 100 && isTop) return true;
      if (imgs.length === 1 && imgs[0].getAttribute('width') && parseInt(imgs[0].getAttribute('width')) < 300 && isTop) return true;
      return false;
    };

    // HERO IMAGE: imagen grande que ocupa todo el ancho
    const isHeroImage = (td) => {
      const imgs = td.querySelectorAll('img');
      const text = td.textContent.trim();
      if (imgs.length === 1 && text.length < 20) {
        const img = imgs[0];
        const w = parseInt(img.getAttribute('width') || '0');
        if (w >= 400 || !img.getAttribute('width')) return true;
      }
      return false;
    };

    // IMAGEN SIMPLE: celda con solo una imagen
    const isImageBlock = (td) => {
      const imgs = td.querySelectorAll('img');
      const text = td.textContent.trim();
      return imgs.length >= 1 && text.length < 50;
    };

    // BUTTON: celda con link/botón prominente y poco texto
    const isButton = (td) => {
      const links = td.querySelectorAll('a');
      const text = td.textContent.trim();
      if (links.length === 0) return false;
      // Un botón suele tener background-color en el link o en un td anidado
      for (const link of links) {
        const s = getElStyle(link);
        const bg = s.get('background-color') || s.get('background') || getBgColor(link);
        if (bg && bg !== 'transparent') return true;
        // O si el texto es corto y hay display:inline-block
        if (text.length < 60 && s.raw.includes('inline-block')) return true;
      }
      return false;
    };

    // SOCIAL: celda con múltiples imágenes pequeñas alineadas (iconos sociales)
    const isSocial = (td) => {
      const imgs = td.querySelectorAll('img');
      if (imgs.length < 2) return false;
      const allSmall = Array.from(imgs).every(img => {
        const w = parseInt(img.getAttribute('width') || '99');
        return w <= 50;
      });
      return allSmall && imgs.length >= 2;
    };

    // DIVIDER: celda con solo una línea horizontal
    const isDivider = (td) => {
      const text = td.textContent.trim();
      const hr = td.querySelector('hr');
      const style = getElStyle(td);
      const hasBorderTop = style.raw.includes('border-top') || style.raw.includes('border-bottom');
      return (hr !== null || hasBorderTop) && text.length < 5;
    };

    // FOOTER: última sección con texto legal pequeño (unsubscribe, copyright, etc.)
    const isFooter = (td) => {
      const text = td.textContent.toLowerCase();
      const hasLegal = text.includes('unsubscribe') || text.includes('copyright') ||
        text.includes('©') || text.includes('privacy') || text.includes('baja') ||
        text.includes('derechos') || text.includes('política');
      const style = getElStyle(td);
      const fontSize = parseInt(style.get('font-size') || '16');
      return hasLegal || (fontSize <= 12 && text.length > 20 && text.length < 500);
    };

    // COLUMNS: fila con múltiples TDs de contenido en paralelo
    const isColumns = (tr) => {
      const tds = tr.querySelectorAll(':scope > td');
      return tds.length >= 2 && tds.length <= 4;
    };

    // TEXT: celda con solo texto (sin imágenes)
    const isText = (td) => {
      const imgs = td.querySelectorAll('img');
      const text = td.textContent.trim();
      return imgs.length === 0 && text.length > 0;
    };

    // ── Convertir TD a bloque nativo ────────────────────────────────────────────
    const tdToBlock = (td, forceType = null) => {
      const type = forceType || detectType(td);
      const style = getElStyle(td);
      const bg = getBgColor(td) || 'transparent';
      const id = getUniqueId(type);

      switch (type) {
        case 'header': {
          const img = td.querySelector('img');
          const logoUrl = fixSrc(img?.getAttribute('src') || '');
          const align = style.get('text-align') || td.getAttribute('align') || 'center';
          return {
            id, type: 'header',
            content: {
              logoUrl, logoAlt: img?.getAttribute('alt') || 'Logo',
              logoWidth: parseInt(img?.getAttribute('width') || '150'),
              logoAlign: align, bgColor: bg || '#111111', padding: '20px 24px',
            }
          };
        }

        case 'image': {
          const imgs = td.querySelectorAll('img');
          const img = imgs[0];
          const link = img?.closest('a')?.getAttribute('href') || '';
          const align = style.get('text-align') || td.getAttribute('align') || 'center';
          return {
            id, type: 'image',
            content: {
              imageUrl: fixSrc(img?.getAttribute('src') || ''),
              altText: img?.getAttribute('alt') || '',
              linkUrl: link, bgColor: bg || 'transparent',
              bgImageUrl: '', bgSize: 'cover', bgPosition: 'center',
              padding: 0, borderRadius: 0, width: 100, align,
            }
          };
        }

        case 'button': {
          const link = td.querySelector('a');
          const btnBg = (() => {
            const s = getElStyle(link || td);
            return s.get('background-color') || s.get('background') || getBgColor(link) || '#e11d48';
          })();
          const textColor = (() => {
            const s = getElStyle(link || td);
            return s.get('color') || '#ffffff';
          })();
          const fontSize = parseInt(getElStyle(link || td).get('font-size') || '16');
          const align = style.get('text-align') || td.getAttribute('align') || 'center';
          return {
            id, type: 'button',
            content: {
              text: link?.textContent?.trim() || 'Ver más',
              url: link?.getAttribute('href') || '#',
              buttonBgColor: btnBg, containerBgColor: bg || 'transparent',
              bgImageUrl: '', bgSize: 'cover', bgPosition: 'center',
              textColor, align, paddingY: 15, paddingX: 30,
              borderRadius: 6, fontSize: Math.max(fontSize, 12),
              fontWeight: 'bold', fontFamily: 'Arial, sans-serif',
              width: 'auto', borderStyle: 'none', borderWidth: 0,
              borderColor: btnBg, padding: 10,
            }
          };
        }

        case 'divider': {
          const hr = td.querySelector('hr');
          const color = (() => {
            if (hr) return getElStyle(hr).get('color') || getElStyle(hr).get('border-color') || '#e5e7eb';
            const s = getElStyle(td);
            const bt = s.get('border-top');
            if (bt) { const m = bt.match(/#[0-9a-f]{3,6}|rgb\([^)]+\)/i); return m ? m[0] : '#e5e7eb'; }
            return '#e5e7eb';
          })();
          return {
            id, type: 'divider',
            content: { color, height: 1, borderStyle: 'solid', bgColor: bg || 'transparent', padding: 20 }
          };
        }

        case 'footer': {
          const text = td.textContent.trim().replace(/\s+/g, ' ');
          const fontSize = parseInt(style.get('font-size') || '12');
          const textColor = style.get('color') || '#9ca3af';
          const align = style.get('text-align') || td.getAttribute('align') || 'center';
          return {
            id, type: 'footer',
            content: {
              text, bgColor: bg || 'transparent', bgImageUrl: '', bgSize: 'cover',
              bgPosition: 'center', textColor, padding: 30,
              fontSize: Math.min(fontSize, 14), fontFamily: 'Arial, sans-serif', align,
            }
          };
        }

        case 'text':
        default: {
          // Extraer texto con saltos de línea preservados
          const extractText = (el) => {
            let result = '';
            el.childNodes.forEach(node => {
              if (node.nodeType === 3) { result += node.textContent; }
              else if (node.nodeName === 'BR') { result += '\n'; }
              else if (['P','DIV','TR','LI'].includes(node.nodeName)) {
                const inner = extractText(node);
                if (inner.trim()) result += inner + '\n';
              } else { result += extractText(node); }
            });
            return result;
          };
          const text = extractText(td).trim();
          const fontSize = parseInt(style.get('font-size') || '16');
          const fontWeight = style.get('font-weight') || 'normal';
          const textColor = style.get('color') || '#333333';
          const align = style.get('text-align') || td.getAttribute('align') || 'left';
          const lineHeight = parseFloat(style.get('line-height') || '1.5');
          return {
            id, type: 'text',
            content: {
              text: text || '[Texto vacío]',
              textColor, fontSize: Math.max(Math.min(fontSize, 36), 10),
              fontWeight: fontWeight.includes('bold') || parseInt(fontWeight) >= 700 ? 'bold' : 'normal',
              align, bgColor: bg || 'transparent', bgImageUrl: '', bgSize: 'cover', bgPosition: 'center',
              padding: 20, lineHeight: isNaN(lineHeight) ? 1.5 : lineHeight,
              fontFamily: 'Arial, sans-serif',
            }
          };
        }
      }
    };

    const detectType = (td) => {
      if (blocks.length === 0 && isHeader(td)) return 'header';
      if (isDivider(td)) return 'divider';
      if (isSocial(td)) return 'social_raw'; // ver abajo
      if (isButton(td)) return 'button';
      if (isHeroImage(td) || isImageBlock(td)) return 'image';
      if (isFooter(td)) return 'footer';
      if (isText(td)) return 'text';
      return 'text';
    };

    // El código de parsing por filas ahora vive en parseByRows()
    return parseByRows(cleanedHTML);
  };

  // ── Procesar ZIP de Envato ────────────────────────────────────────────────────
  const processZipFile = async (file) => {
    setZipLoading(true);
    try {
      const zip = new JSZip();
      const contents = await zip.loadAsync(file);
      const imageMap = {};
      const imageExts = ['.jpg','.jpeg','.png','.gif','.svg','.webp'];
      await Promise.all(Object.entries(contents.files).map(async ([path, entry]) => {
        if (entry.dir) return;
        if (!imageExts.some(ext => path.toLowerCase().endsWith(ext))) return;
        try {
          const blob = await entry.async('blob');
          const ext = path.toLowerCase().split('.').pop();
          const mimeMap = { jpg:'image/jpeg', jpeg:'image/jpeg', png:'image/png', gif:'image/gif', svg:'image/svg+xml', webp:'image/webp' };
          const dataUrl = await new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.readAsDataURL(new Blob([blob], { type: mimeMap[ext] || 'image/png' }));
          });
          const filename = path.split('/').pop();
          imageMap[path] = dataUrl;
          imageMap[filename] = dataUrl;
          imageMap['images/' + filename] = dataUrl;
        } catch {}
      }));
      // Construir índice por nombre de archivo para búsqueda rápida
      const imageByFilename = {};
      Object.entries(imageMap).forEach(([path, dataUrl]) => {
        const fn = path.split('/').pop();
        if (!imageByFilename[fn]) imageByFilename[fn] = dataUrl;
      });

      const resolveImage = (src) => {
        if (!src || src.startsWith('http') || src.startsWith('data:') || src.startsWith('//') || src.startsWith('mailto:') || src === '#' || src.startsWith('cid:')) return null;
        // Normalizar: quitar ../ y ./
        const clean = src.replace(/^(\.\.\/)+/, '').replace(/^\.\//, '');
        const fn = clean.split('/').pop();
        if (!fn || fn === '') return null;
        return imageMap[src] ||
               imageMap[clean] ||
               imageMap[fn] ||
               imageByFilename[fn] ||    // búsqueda por nombre en todo el ZIP
               null;
      };
      const fixImages = (html) => html
        .replace(/src=["']([^"']+)["']/gi, (m, src) => {
          const resolved = resolveImage(src);
          if (resolved) return `src="${resolved}"`;
          if (!src.startsWith('http') && !src.startsWith('data:') && !src.startsWith('//') && !src.startsWith('#')) {
            const fn = src.split('/').pop();
            return `src="https://placehold.co/600x200/1a1a1a/444?text=${encodeURIComponent(fn || 'img')}"`;
          }
          return m;
        })
        .replace(/background=["']([^"']+)["']/gi, (m, src) => {
          const resolved = resolveImage(src);
          return resolved ? `background="${resolved}"` : m;
        })
        .replace(/url\(['"]?([^'")]+)['"]?\)/gi, (m, src) => {
          const resolved = resolveImage(src);
          return resolved ? `url("${resolved}")` : m;
        });
      const PLABELS = { mailchimp:'MailChimp', stampready:'StampReady', campaignmonitor:'Campaign Monitor', sendgrid:'SendGrid', freshmail:'FreshMail', activecampaign:'ActiveCampaign', mymail:'MyMail', icontact:'iContact', generic:'HTML Genérico' };
      
      // Palabras clave que indican plataformas específicas (no son la versión genérica)
      const PLATFORM_KEYWORDS = ['mailchimp', 'mail-chimp', 'campaign-monitor', 'campaignmonitor', 'stampready', 'stamp-ready', 'sendgrid', 'freshmail', 'activecampaign', 'mymail', 'icontact'];
      
      const htmlEntries = Object.entries(contents.files)
        .filter(([p, e]) => {
          if (e.dir) return false;
          if (!p.toLowerCase().endsWith('.html')) return false;
          const lower = p.toLowerCase();
          const parts = lower.split('/');
          // Excluir si está en una carpeta de documentación
          if (parts.some(part => ['documentation', 'docs', 'doc', 'readme', 'guide', 'help', 'open-this-folder-first'].includes(part))) return false;
          // Excluir si el archivo es claramente documentación por su contenido (se verificará luego)
          return true;
        })
        .sort(([a], [b]) => a.localeCompare(b));
        
      if (htmlEntries.length === 0) { alert('No se encontraron archivos HTML en el ZIP.'); setZipLoading(false); return; }
      
      const processed = await Promise.all(htmlEntries.map(async ([path, entry]) => {
        const raw = await entry.async('string');
        const htmlContent = fixImages(raw);
        const platform = detectEnvatoPlatform(htmlContent);
        const filename = path.split('/').pop().replace('.html','');
        const pathLower = path.toLowerCase();
        
        // Detectar si es una versión de plataforma específica por el nombre del archivo/carpeta
        const isPlatformVariant = PLATFORM_KEYWORDS.some(kw => pathLower.includes(kw));
        // Detectar si es un index (versión principal)
        const isIndex = filename.toLowerCase() === 'index' || filename.toLowerCase().includes('index');
        // Detectar la carpeta padre (variante del template)
        const parts = path.split('/').filter(Boolean);
        const folder = parts.length > 1 ? parts[parts.length - 2] : 'Principal';
        
        return {
          path,
          name: filename,
          folder,
          htmlContent,
          platform,
          platformLabel: PLABELS[platform] || 'HTML Genérico',
          isPlatformVariant,
          isIndex,
          // Preview: primeras 2000 chars del body para renderizar
          previewHtml: htmlContent,
        };
      }));
      
      // Prioridad de selección automática:
      // 1. raw.html (HTML puro sin plataforma)
      // 2. index.html genérico
      // 3. El primer archivo con platform === 'generic'
      const RAW_NAMES = ['raw', 'index', 'main', 'email', 'template', 'newsletter'];
      const SKIP_NAMES = ['stampready', 'stamp-ready', 'mailchimp', 'mail-chimp', 
                          'campaign-monitor', 'campaignmonitor', 'mymail', 'sendgrid',
                          'freshmail', 'activecampaign', 'icontact'];
      
      // Filtrar plataformas específicas — son las que tienen nombre reconocible
      const platformFiles = processed.filter(f => 
        SKIP_NAMES.some(s => f.name.toLowerCase().includes(s)) || f.isPlatformVariant
      );
      const genericFiles = processed.filter(f => 
        !SKIP_NAMES.some(s => f.name.toLowerCase().includes(s)) && !f.isPlatformVariant
      );
      
      // Intentar selección automática del raw/genérico
      const autoSelect = 
        genericFiles.find(f => f.name.toLowerCase() === 'raw') ||
        genericFiles.find(f => RAW_NAMES.includes(f.name.toLowerCase())) ||
        genericFiles.find(f => f.platform === 'generic') ||
        genericFiles[0];
      
      // Si hay un candidato claro y los demás son solo variantes de plataforma → importar directo
      if (autoSelect && genericFiles.length === 1) {
        importFromHTML(autoSelect.htmlContent, autoSelect.platformLabel);
        setZipLoading(false);
        return;
      }
      
      // Si solo hay un archivo genérico pero también hay plataformas → importar el genérico directo
      if (autoSelect && genericFiles.length <= 2 && platformFiles.length > 0) {
        importFromHTML(autoSelect.htmlContent, autoSelect.platformLabel);
        setZipLoading(false);
        return;
      }

      // Si hay múltiples versiones genéricas o ambigüedad → mostrar modal
      // Agrupar por plataforma para no mostrar duplicados
      const byPlatform = {};
      processed.forEach(f => {
        const key = f.isPlatformVariant ? f.platform : 'generic_' + f.name;
        if (!byPlatform[key]) byPlatform[key] = [];
        byPlatform[key].push(f);
      });
      const toShow = Object.values(byPlatform).map(group => ({
        ...group[0],
        variantCount: group.length,
        allVariants: group,
      }));
      
      if (toShow.length === 1) {
        importFromHTML(toShow[0].htmlContent, toShow[0].platformLabel);
      } else {
        // Marcar el recomendado
        const recommended = toShow.find(f => f.name.toLowerCase() === 'raw') ||
                            toShow.find(f => f.name.toLowerCase().includes('-html')) ||
                            toShow.find(f => f.platform === 'generic' && !f.name.toLowerCase().includes('index')) ||
                            toShow.find(f => f.platform === 'generic') ||
                            toShow[0];
        if (recommended) recommended.isRecommended = true;

        // Ordenar: recomendado primero, index al final
        const sorted = [
          ...toShow.filter(f => f.isRecommended),
          ...toShow.filter(f => !f.isRecommended && !f.name.toLowerCase().includes('index')),
          ...toShow.filter(f => f.name.toLowerCase().includes('index')),
        ];

        setZipFiles(sorted);
        setZipModal(true);
      }
    } catch (err) {
      console.error('Error ZIP:', err);
      alert('Error al procesar el ZIP.');
    }
    setZipLoading(false);
  };

  // ── Verificar estado de conexión Envato ──────────────────────────────────────
  const checkEnvatoStatus = async () => {
    try {
      const res = await fetch('/api/envato/status');
      const data = await res.json();
      setEnvatoStatus(data);
    } catch {
      setEnvatoStatus({ connected: false });
    }
  };

  // Verificar al abrir tab Envato + detectar callback OAuth
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('envato_connected')) {
      setLeftPanelTab('envato');
      checkEnvatoStatus();
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (params.get('envato_error')) {
      alert('Error al conectar con Envato: ' + params.get('envato_error'));
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const [envatoNeedsSession, setEnvatoNeedsSession] = useState(false);

  // ── Buscar plantillas en Envato ELEMENTS ─────────────────────────────────────
  const searchEnvato = async (q) => {
    setEnvatoLoading(true);
    setEnvatoResults([]);
    setEnvatoNeedsSession(false);
    try {
      const res = await fetch(`/api/envato/elements?q=${encodeURIComponent(q)}&page=1`);
      const data = await res.json();
      if (data.success) {
        setEnvatoResults(data.results || []);
      } else if (data.needsSession) {
        setEnvatoNeedsSession(true);
      } else {
        console.error('Elements error:', data.error);
      }
    } catch (err) {
      console.error('Elements search error:', err);
    }
    setEnvatoLoading(false);
  };

  const pasteEnvatoSession = async () => {
    const cookie = prompt(
      '📋 Cómo obtener las cookies:\n\n' +
      '1. Ve a https://app.envato.com e inicia sesión\n' +
      '2. Presiona F12 → tab "Network"\n' +
      '3. Recarga la página (F5)\n' +
      '4. Clic en cualquier request a app.envato.com\n' +
      '5. En "Request Headers" copia el valor de "Cookie:"\n\n' +
      'Pega aquí ese valor:'
    );
    if (!cookie?.trim()) return;
    const res = await fetch('/api/envato/set-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session: cookie.trim() }),
    });
    const data = await res.json();
    if (data.success) {
      setEnvatoNeedsSession(false);
      searchEnvato(envatoQuery);
    } else {
      alert('Error guardando sesión: ' + data.error);
    }
  };

  // ── Descargar ZIP de Envato Elements ─────────────────────────────────────────
  const downloadEnvatoItem = async (item) => {
    setEnvatoDownloading(item.id);
    try {
      // Usar endpoint de Elements si el item viene de Elements, si no usar Market
      const endpoint = item.isElements ? '/api/envato/elements-download' : '/api/envato/download';
      const body = item.isElements
        ? { item_slug: item.slug || String(item.id), item_url: item.url }
        : { item_id: String(item.id || item.envatoId || '').replace(/^envato-/i, '') };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!data.success) {
        if (data.needsCredentials) {
          alert('Credenciales no configuradas:\n\nVe a Supabase → tabla api_keys y agrega:\n- envato_elements_email\n- envato_elements_password');
        } else {
          const goManual = window.confirm(
            `⚠️ ${data.error}\n\n¿Abrir el item en Envato Elements para descargarlo manualmente?\nLuego súbelo con "Subir .zip descargado".`
          );
          if (goManual) window.open(item.url || 'https://elements.envato.com/email-templates', '_blank');
        }
        setEnvatoDownloading(null);
        return;
      }

      if (data.htmlFiles?.length > 0) {
        if (data.htmlFiles.length === 1) {
          importFromHTML(data.htmlFiles[0].htmlContent, data.htmlFiles[0].platformLabel);
        } else {
          setZipFiles(data.htmlFiles);
          setZipModal(true);
        }
      } else {
        alert('No se encontraron plantillas HTML en este item.');
      }
    } catch (err) {
      alert('Error al descargar: ' + err.message);
    }
    setEnvatoDownloading(null);
  };

  const importFromHTML = (htmlContent, platformLabel) => {
    try {
      const parsed = parseEnvatoHTML(htmlContent);
      if (parsed && parsed.length > 0) {
        setBlocks(parsed);
        setSelectedBlockId(null);
        setActiveTab('blocks');
        setZipModal(false);
      } else {
        // Fallback: cargar como referencia visual (un solo bloque HTML)
        const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        const bodyContent = bodyMatch ? bodyMatch[1] : htmlContent;
        setBlocks([{ id: getUniqueId('html'), type: 'html', content: { ...getDefaultContent('html', activePalette), code: bodyContent } }]);
        setSelectedBlockId(null);
        setActiveTab('blocks');
        setZipModal(false);
      }
    } catch (err) {
      console.error('importFromHTML error:', err);
      alert('Error al procesar el archivo: ' + err.message);
    }
  };

  // El parser genérico por filas ya está implementado dentro de parseEnvatoHTML
  // parseByRows es un wrapper que usa el mismo código pero sin módulos
  const parseByRows = (htmlString) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const styleRules = {};
    doc.querySelectorAll('style').forEach(styleEl => {
      const css = styleEl.textContent || '';
      const rules = css.match(/\.([a-zA-Z0-9_-]+)\s*\{([^}]+)\}/g) || [];
      rules.forEach(rule => {
        const m = rule.match(/\.([a-zA-Z0-9_-]+)\s*\{([^}]+)\}/);
        if (m) styleRules[m[1]] = m[2];
      });
    });
    const getElStyle = (el) => {
      let style = el.getAttribute('style') || '';
      (el.getAttribute('class') || '').split(/\s+/).forEach(cls => { if (styleRules[cls]) style += ';' + styleRules[cls]; });
      return { raw: style, get: (prop) => { const m = style.match(new RegExp(prop + '\\s*:\\s*([^;]+)', 'i')); return m ? m[1].trim() : null; } };
    };
    const fixSrc = (src) => {
      if (!src) return '';
      if (src.startsWith('http') || src.startsWith('//') || src.startsWith('data:')) return src;
      return 'https://placehold.co/600x200/1a1a1a/555?text=Imagen';
    };
    const getBgColor = (el) => {
      let cur = el;
      for (let i = 0; i < 5; i++) {
        if (!cur) break;
        const s = getElStyle(cur);
        const bg = s.get('background-color') || s.get('background');
        const bgAttr = cur.getAttribute?.('bgcolor');
        if (bgAttr && bgAttr !== 'transparent') return bgAttr;
        if (bg && bg !== 'transparent' && bg !== 'inherit' && !bg.includes('url(')) return bg;
        cur = cur.parentElement;
      }
      return null;
    };
    // Tabla principal
    const mainTable = (() => {
      const byWidth = Array.from(doc.querySelectorAll('table[width]')).find(t => { const w = parseInt(t.getAttribute('width') || '0'); return w >= 500 && w <= 900; });
      if (byWidth) return byWidth;
      const all = Array.from(doc.querySelectorAll('table'));
      return all.sort((a,b) => b.querySelectorAll('tr').length - a.querySelectorAll('tr').length)[0] || doc.body;
    })();
    const blocks = [];
    const processed = new Set();
    const extractText = (el) => {
      let r = '';
      el.childNodes.forEach(n => {
        if (n.nodeType === 3) r += n.textContent;
        else if (n.nodeName === 'BR') r += '\n';
        else if (['P','DIV','TR','LI'].includes(n.nodeName)) { const i = extractText(n); if (i.trim()) r += i + '\n'; }
        else r += extractText(n);
      });
      return r;
    };
    const tdToBlock = (td) => {
      const s = getElStyle(td);
      const bg = getBgColor(td) || 'transparent';
      const imgs = td.querySelectorAll('img');
      const text = td.textContent.trim();
      const links = td.querySelectorAll('a');
      // Footer
      const isFooter = ['unsubscribe','copyright','©','baja','derechos'].some(k => text.toLowerCase().includes(k));
      if (isFooter) return { id: getUniqueId('footer'), type: 'footer', content: { text: text.replace(/\s+/g,' '), bgColor: bg, bgImageUrl:'', bgSize:'cover', bgPosition:'center', textColor: s.get('color') || '#9ca3af', padding: 30, fontSize: 12, fontFamily:'Arial,sans-serif', align:'center' } };
      // Divider
      if (td.querySelector('hr') || (s.raw.includes('border-top') && text.length < 5)) return { id: getUniqueId('divider'), type: 'divider', content: { color: '#e5e7eb', height: 1, borderStyle: 'solid', bgColor: bg, padding: 20 } };
      // Social
      if (imgs.length >= 2 && Array.from(imgs).every(i => parseInt(i.getAttribute('width') || '99') <= 50)) {
        const networks = [];
        links.forEach(lnk => {
          const href = lnk.getAttribute('href') || '';
          const net = href.includes('facebook') ? 'facebook' : href.includes('instagram') ? 'instagram' : href.includes('twitter') || href.includes('x.com') ? 'twitter' : href.includes('linkedin') ? 'linkedin' : href.includes('youtube') ? 'youtube' : href.includes('tiktok') ? 'tiktok' : null;
          if (net) networks.push({ id: getUniqueId('net'), network: net, url: href, iconColor: '#ffffff', bgColor: SOCIAL_CONFIG[net]?.defaultBg || '#333' });
        });
        if (networks.length) return { id: getUniqueId('social'), type: 'social', content: { align:'center', bgColor: bg, bgImageUrl:'', bgSize:'cover', bgPosition:'center', padding:20, iconSize:28, borderRadius:8, networks } };
      }
      // Button
      for (const lnk of links) {
        const ls = getElStyle(lnk);
        const lbg = ls.get('background-color') || ls.get('background') || getBgColor(lnk);
        if (lbg && lbg !== 'transparent' && text.length < 80) {
          return { id: getUniqueId('button'), type: 'button', content: { text: lnk.textContent.trim(), url: lnk.getAttribute('href') || '#', buttonBgColor: lbg, containerBgColor: bg, bgImageUrl:'', bgSize:'cover', bgPosition:'center', textColor: ls.get('color') || '#fff', align: 'center', paddingY:14, paddingX:30, borderRadius:6, fontSize:15, fontWeight:'bold', fontFamily:'Arial,sans-serif', width:'auto', borderStyle:'none', borderWidth:0, borderColor:lbg, padding:10 } };
        }
      }
      // Image
      if (imgs.length === 1 && text.length < 30) { const img = imgs[0]; return { id: getUniqueId('image'), type: 'image', content: { imageUrl: fixSrc(img.getAttribute('src') || ''), altText: img.getAttribute('alt') || '', linkUrl: img.closest('a')?.getAttribute('href') || '', bgColor: bg, bgImageUrl:'', bgSize:'cover', bgPosition:'center', padding:0, borderRadius:0, width:100, align:'center' } }; }
      // Header (logo)
      if (imgs.length === 1 && blocks.length === 0) { const img = imgs[0]; return { id: getUniqueId('header'), type: 'header', content: { logoUrl: fixSrc(img.getAttribute('src') || ''), logoAlt: img.getAttribute('alt') || 'Logo', logoWidth: parseInt(img.getAttribute('width') || '150'), logoAlign: 'center', bgColor: bg || '#111', padding: '20px 24px' } }; }
      // Text
      const t = extractText(td).trim();
      if (t.length > 1) { const fs = parseInt(s.get('font-size') || '15'); const fw = s.get('font-weight') || 'normal'; return { id: getUniqueId('text'), type: 'text', content: { text: t, textColor: s.get('color') || '#333', fontSize: Math.max(Math.min(fs, 36), 10), fontWeight: fw.includes('bold') || parseInt(fw) >= 700 ? 'bold' : 'normal', align: s.get('text-align') || 'left', bgColor: bg, bgImageUrl:'', bgSize:'cover', bgPosition:'center', padding:20, lineHeight:1.5, fontFamily:'Arial,sans-serif' } }; }
      return null;
    };
    const processRow = (tr) => {
      if (processed.has(tr)) return;
      processed.add(tr);
      const tds = Array.from(tr.querySelectorAll(':scope > td'));
      if (tds.length === 0) return;
      if (tds.length >= 2 && tds.length <= 4) {
        const cols = tds.map(td => { const b = tdToBlock(td); return b ? [b] : []; });
        if (cols.some(c => c.length > 0)) blocks.push({ id: getUniqueId('columns'), type: 'columns', content: { colCount: tds.length, bgColor: getBgColor(tr) || 'transparent', bgImageUrl:'', bgSize:'cover', bgPosition:'center', padding:10, align:'top', cols } });
        return;
      }
      if (tds.length === 1) {
        const td = tds[0];
        const sub = td.querySelector(':scope > table');
        if (sub) { Array.from(sub.querySelectorAll(':scope > tbody > tr, :scope > tr')).forEach(r => processRow(r)); return; }
        const b = tdToBlock(td);
        if (b) blocks.push(b);
      }
    };
    const rows = mainTable.querySelectorAll(':scope > tbody > tr, :scope > tr');
    (rows.length > 0 ? rows : doc.querySelectorAll('tr')).forEach(tr => processRow(tr));
    return blocks.filter(b => {
      if (b.type === 'text' && (!b.content.text || b.content.text.trim().length < 2)) return false;
      if (b.type === 'columns' && b.content.cols.every(c => c.length === 0)) return false;
      return true;
    });
  };

  // ── Parser por data-module (Mercury / Envato con módulos marcados) ────────────
  const parseByModules = (htmlString, platform) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const resultBlocks = [];

    // Detectar fuente principal del template
    const googleFont = (() => {
      const link = doc.querySelector('link[href*="fonts.googleapis.com"]');
      if (!link) return 'Arial, sans-serif';
      const m = link.getAttribute('href').match(/family=([^:&]+)/);
      return m ? `'${m[1].replace(/\+/g, ' ')}', Arial, sans-serif` : 'Arial, sans-serif';
    })();

    // ── Helpers ───────────────────────────────────────────────────────────────
    const styleRules = {};
    doc.querySelectorAll('style').forEach(s => {
      (s.textContent || '').match(/\.([a-zA-Z0-9_-]+)\s*\{([^}]+)\}/g)?.forEach(r => {
        const m = r.match(/\.([a-zA-Z0-9_-]+)\s*\{([^}]+)\}/);
        if (m) styleRules[m[1]] = m[2];
      });
    });
    const css = (el) => {
      if (!el) return { get: () => null, raw: '' };
      let s = el.getAttribute?.('style') || '';
      (el.getAttribute?.('class') || '').split(/\s+/).forEach(c => { if (styleRules[c]) s += ';' + styleRules[c]; });
      return { raw: s, get: (p) => { const m = s.match(new RegExp(p + '\\s*:\\s*([^;!]+)', 'i')); return m ? m[1].trim() : null; } };
    };
    const fixSrc = (src) => {
      if (!src) return '';
      if (src.startsWith('http') || src.startsWith('//') || src.startsWith('data:')) return src;
      return 'https://placehold.co/600x300/1a1a1a/555?text=Imagen';
    };
    const getBg = (el) => {
      for (let cur = el, i = 0; cur && cur !== doc.body && i < 7; cur = cur.parentElement, i++) {
        const bg = cur.getAttribute?.('bgcolor') || css(cur).get('background-color') || css(cur).get('background');
        if (bg && bg !== 'transparent' && bg !== 'inherit' && !bg.includes('url(') && !bg.includes('gradient')) return bg;
      }
      return null;
    };
    const getTextColor = (el) => css(el).get('color') || null;
    const getFontSize = (el) => parseInt(css(el).get('font-size') || '0') || null;

    // Extrae texto limpio de un elemento Mercury (ignora spacers nbsp)
    const cleanText = (el) => {
      let t = '';
      el.childNodes.forEach(n => {
        if (n.nodeType === 3) { const v = n.textContent.trim(); if (v && v !== '\xa0') t += (t ? ' ' : '') + v; }
        else if (['SINGLELINE','DIV','SPAN','STRONG','EM','A','P'].includes(n.nodeName)) t += (t ? ' ' : '') + cleanText(n);
        else if (n.nodeName === 'BR') t += '\n';
      });
      return t.trim();
    };

    // Convierte una TD de Mercury en bloques nativos
    const tdToNativeBlocks = (td, containerBg) => {
      const blocks = [];
      // Imagen principal
      const imgs = Array.from(td.querySelectorAll('img')).filter(i => {
        const w = parseInt(i.getAttribute('width') || '0');
        return w > 20 || !i.getAttribute('width'); // excluir gaps de 1px
      });
      imgs.forEach(img => {
        const src = fixSrc(img.getAttribute('src') || '');
        if (!src) return;
        blocks.push({
          id: getUniqueId('image'), type: 'image',
          content: { imageUrl: src, altText: img.getAttribute('alt') || '', linkUrl: img.closest('a')?.getAttribute('href') || '', bgColor: 'transparent', bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', padding: 5, borderRadius: parseInt(css(img).get('border-radius') || '0'), width: 100, align: css(td).get('text-align') || 'center' }
        });
      });
      // Textos editables (data-text-edit, singleline, o celdas con texto real)
      const textEls = td.querySelectorAll('[data-text-edit], singleline, [mc\\:edit]');
      const processed = new Set();
      textEls.forEach(el => {
        if (processed.has(el)) return;
        processed.add(el);
        const t = cleanText(el);
        if (!t || t.length < 2) return;
        const s = css(el.parentElement || el);
        const fs = getFontSize(el.parentElement || el) || getFontSize(el) || 14;
        const fw = css(el.parentElement || el).get('font-weight') || 'normal';
        const color = getTextColor(el.parentElement || el) || getTextColor(el) || '#333333';
        blocks.push({
          id: getUniqueId('text'), type: 'text',
          content: { text: t, textColor: color, fontSize: Math.min(Math.max(fs, 10), 48), fontWeight: fw.includes('bold') || parseInt(fw) >= 700 ? 'bold' : 'normal', align: s.get('text-align') || 'center', bgColor: 'transparent', bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', padding: 5, lineHeight: 1.5, fontFamily: googleFont }
        });
      });
      // Si no hay text-edit, extraer texto de TDs con estilo de texto
      if (textEls.length === 0) {
        const styledTds = td.querySelectorAll('td[style*="font-size"]');
        styledTds.forEach(el => {
          const t = cleanText(el);
          if (!t || t.length < 2 || processed.has(el)) return;
          processed.add(el);
          const fs = getFontSize(el) || 14;
          const color = getTextColor(el) || '#333333';
          blocks.push({
            id: getUniqueId('text'), type: 'text',
            content: { text: t, textColor: color, fontSize: Math.min(Math.max(fs, 10), 48), fontWeight: css(el).get('font-weight')?.includes('bold') ? 'bold' : 'normal', align: css(el).get('text-align') || 'center', bgColor: 'transparent', bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', padding: 5, lineHeight: parseFloat(css(el).get('line-height') || '1.5') || 1.5, fontFamily: googleFont }
          });
        });
      }
      // Botón (link con borde o background)
      const btnLinks = td.querySelectorAll('a[style*="border"], td[style*="border-radius"] a, a[style*="display:inline-block"]');
      btnLinks.forEach(link => {
        const t = link.textContent.trim();
        if (!t) return;
        const parentTd = link.closest('td');
        const borderStyle = css(parentTd || link).get('border');
        const btnBg = css(parentTd || link).get('background-color') || css(link).get('background-color');
        const textCol = getTextColor(link) || '#ffffff';
        if (t.length < 50) {
          blocks.push({
            id: getUniqueId('button'), type: 'button',
            content: { text: t, url: link.getAttribute('href') || '#', buttonBgColor: btnBg || 'transparent', containerBgColor: 'transparent', bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', textColor: textCol, align: 'center', paddingY: 12, paddingX: 24, borderRadius: 6, fontSize: 15, fontWeight: 'bold', fontFamily: googleFont, width: 'auto', borderStyle: borderStyle ? 'solid' : 'none', borderWidth: 2, borderColor: textCol, padding: 10 }
          });
        }
      });
      return blocks;
    };

    // Detectar columnas Mercury: usa tablas align="left" flotantes en paralelo
    // Busca todas las tablas con align="left" o "right" dentro de una celda contenedora
    const detectMercuryColumns = (container) => {
      // Buscar tabla que tenga hijos directos que sean tablas con align
      const allTables = Array.from(container.querySelectorAll('table[align="left"], table[align="right"]'));
      if (allTables.length >= 2) {
        // Filtrar tablas que sean hermanas (mismo padre)
        const parentMap = new Map();
        allTables.forEach(t => {
          const p = t.parentElement;
          if (!parentMap.has(p)) parentMap.set(p, []);
          parentMap.get(p).push(t);
        });
        for (const [parent, siblings] of parentMap) {
          // Ignorar tablas de 1px gap
          const realCols = siblings.filter(t => parseInt(t.getAttribute('width') || '0') > 30);
          if (realCols.length >= 2) return realCols;
        }
      }
      return null;
    };

    // Procesar cada módulo data-module
    const modules = Array.from(doc.querySelectorAll('[data-module]'));
    console.log('📦 Módulos encontrados en DOM:', modules.length, modules.map(m => m.getAttribute('data-module')));

    modules.forEach(mod => {
      const name = mod.getAttribute('data-module') || '';
      if (name.includes('preheader')) return;

      const modBg = getBg(mod) || '#ffffff';

      // ── UNSUBSCRIBE: solo texto legal → footer ──────────────────────────────
      if (name.includes('unsubscribe')) {
        const t = mod.textContent.trim().replace(/\s+/g, ' ');
        resultBlocks.push({ id: getUniqueId('footer'), type: 'footer', content: { text: t, bgColor: modBg, bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', textColor: '#9ca3af', padding: 20, fontSize: 11, fontFamily: googleFont, align: 'center' } });
        return;
      }

      // ── MENU: logo en la izquierda → header ────────────────────────────────
      if (name.includes('menu')) {
        const logoImg = mod.querySelector('img[src*="logo" i], img[alt*="logo" i], img[data-label*="logo" i]');
        if (logoImg) {
          resultBlocks.push({ id: getUniqueId('header'), type: 'header', content: { logoUrl: fixSrc(logoImg.getAttribute('src') || ''), logoAlt: logoImg.getAttribute('alt') || 'Logo', logoWidth: Math.min(parseInt(logoImg.getAttribute('width') || '150'), 300), logoAlign: 'left', bgColor: getBg(logoImg) || modBg, padding: '16px 24px' } });
        }
        return;
      }

      // ── HEADER: imagen grande + texto con fondo de imagen ──────────────────
      if (name.includes('header')) {
        // Imagen principal (section-1)
        const mainImg = mod.querySelector('img[width="600"], img[src*="header" i], img[src*="hero" i], img[src*="banner" i]');
        if (mainImg) {
          resultBlocks.push({ id: getUniqueId('image'), type: 'image', content: { imageUrl: fixSrc(mainImg.getAttribute('src') || ''), altText: mainImg.getAttribute('alt') || '', linkUrl: mainImg.closest('a')?.getAttribute('href') || '', bgColor: modBg, bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', padding: 0, borderRadius: 0, width: 100, align: 'center' } });
        }
        // Imagen de fondo del hero + textos (section-2)
        const bgImgTd = mod.querySelector('td[background]');
        const heroText = mod.querySelector('[data-element*="headline"], [data-label*="Headline"]');
        const heroBtn = mod.querySelector('[data-element*="button"], [data-label*="Button"]');
        const bgImgSrc = bgImgTd?.getAttribute('background') || '';
        if (heroText) {
          const headline = cleanText(heroText);
          if (headline) {
            const color = getTextColor(heroText.querySelector('td') || heroText) || '#ffffff';
            const fs = getFontSize(heroText.querySelector('td') || heroText) || 36;
            resultBlocks.push({ id: getUniqueId('text'), type: 'text', content: { text: headline, textColor: color, fontSize: Math.min(fs, 48), fontWeight: 'bold', align: 'center', bgColor: bgImgSrc ? 'transparent' : (getBg(bgImgTd || mod) || modBg), bgImageUrl: fixSrc(bgImgSrc), bgSize: 'cover', bgPosition: 'center', padding: 50, lineHeight: 1.3, fontFamily: googleFont } });
          }
        }
        // Párrafo del hero
        const heroPara = mod.querySelector('[data-element*="paragraph"], [data-label*="Paragraph"]');
        if (heroPara) {
          const t = cleanText(heroPara);
          if (t) resultBlocks.push({ id: getUniqueId('text'), type: 'text', content: { text: t, textColor: '#ffffff', fontSize: 14, fontWeight: 'normal', align: 'center', bgColor: 'transparent', bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', padding: 10, lineHeight: 1.7, fontFamily: googleFont } });
        }
        // Botón del hero
        if (heroBtn) {
          const link = heroBtn.querySelector('a');
          if (link) {
            const parentTd = link.closest('td[style*="border"]') || link.closest('td');
            const borderColor = getTextColor(link) || '#ffffff';
            resultBlocks.push({ id: getUniqueId('button'), type: 'button', content: { text: link.textContent.trim(), url: link.getAttribute('href') || '#', buttonBgColor: 'transparent', containerBgColor: 'transparent', bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', textColor: borderColor, align: 'center', paddingY: 12, paddingX: 28, borderRadius: 6, fontSize: 15, fontWeight: 'bold', fontFamily: googleFont, width: 'auto', borderStyle: 'solid', borderWidth: 2, borderColor, padding: 20 } });
          }
        }
        return;
      }

      // ── SOCIALS: detecta por data-element o por td class ───────────────────
      if (name.includes('social')) {
        // Headline primero
        const headline = mod.querySelector('[data-element*="headline"], [data-label*="Headline"]');
        if (headline) {
          const t = cleanText(headline);
          if (t) { const fs = getFontSize(headline.querySelector('td') || headline) || 28; const color = getTextColor(headline.querySelector('td') || headline) || '#333333'; resultBlocks.push({ id: getUniqueId('text'), type: 'text', content: { text: t, textColor: color, fontSize: Math.min(fs, 40), fontWeight: 'bold', align: 'center', bgColor: modBg, bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', padding: 20, lineHeight: 1.3, fontFamily: googleFont } }); }
        }
        // Redes sociales — detecta por data-element individual
        const networks = [];
        const socialTds = mod.querySelectorAll('[data-element*="facebook"], [data-element*="twitter"], [data-element*="instagram"], [data-element*="linkedin"], [data-element*="youtube"], [data-element*="tiktok"], [data-element*="pinterest"], [data-element*="dribbble"]');
        socialTds.forEach(td => {
          const el = td.getAttribute('data-element') || td.getAttribute('data-label') || '';
          const net = el.includes('facebook') ? 'facebook' : el.includes('twitter') ? 'twitter' : el.includes('instagram') ? 'instagram' : el.includes('linkedin') ? 'linkedin' : el.includes('youtube') ? 'youtube' : el.includes('tiktok') ? 'tiktok' : el.includes('pinterest') ? 'pinterest' : null;
          if (net && !networks.find(n => n.network === net)) {
            const link = td.querySelector('a');
            networks.push({ id: getUniqueId('net'), network: net, url: link?.getAttribute('href') || '#', iconColor: '#ffffff', bgColor: SOCIAL_CONFIG[net]?.defaultBg || '#333333' });
          }
        });
        // Fallback: detectar por href
        if (networks.length === 0) {
          mod.querySelectorAll('a[href]').forEach(a => {
            const href = a.getAttribute('href') || '';
            const net = href.includes('facebook') ? 'facebook' : href.includes('instagram') ? 'instagram' : href.includes('twitter') || href.includes('x.com') ? 'twitter' : href.includes('linkedin') ? 'linkedin' : href.includes('youtube') ? 'youtube' : href.includes('tiktok') ? 'tiktok' : href.includes('pinterest') ? 'pinterest' : null;
            if (net && !networks.find(n => n.network === net)) networks.push({ id: getUniqueId('net'), network: net, url: href, iconColor: '#ffffff', bgColor: SOCIAL_CONFIG[net]?.defaultBg || '#333333' });
          });
        }
        if (networks.length > 0) resultBlocks.push({ id: getUniqueId('social'), type: 'social', content: { align: 'center', bgColor: modBg, bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', padding: 20, iconSize: 32, borderRadius: 8, networks } });
        return;
      }

      // ── FOOTER: columnas de contacto → columns nativas ─────────────────────
      if (name.includes('footer')) {
        const floatCols = detectMercuryColumns(mod);
        if (floatCols && floatCols.length >= 2) {
          const cols = floatCols.map(col => tdToNativeBlocks(col, modBg));
          const validCols = cols.filter(c => c.length > 0);
          if (validCols.length >= 2) {
            resultBlocks.push({ id: getUniqueId('columns'), type: 'columns', content: { colCount: validCols.length, bgColor: modBg, bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', padding: 30, align: 'top', cols: validCols } });
            return;
          }
        }
        // Fallback footer texto
        const t = mod.textContent.trim().replace(/\s+/g, ' ');
        resultBlocks.push({ id: getUniqueId('footer'), type: 'footer', content: { text: t, bgColor: modBg, bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', textColor: getTextColor(mod.querySelector('td[style*="color"]') || mod) || '#666666', padding: 30, fontSize: 12, fontFamily: googleFont, align: 'center' } });
        return;
      }

      // ── QUOTE: cita/testimonial ────────────────────────────────────────────
      if (name.includes('quote')) {
        const quoteTd = mod.querySelector('[data-element*="quote"], [data-label*="Quote"], td[style*="font-size"]');
        const t = quoteTd ? cleanText(quoteTd) : mod.textContent.trim().replace(/\s+/g, ' ');
        const fs = getFontSize(quoteTd || mod.querySelector('td[style*="font"]') || mod) || 20;
        const color = getTextColor(quoteTd || mod.querySelector('td[style*="color"]') || mod) || '#333333';
        if (t) resultBlocks.push({ id: getUniqueId('text'), type: 'text', content: { text: '"' + t + '"', textColor: color, fontSize: Math.min(fs, 32), fontWeight: 'normal', align: 'center', bgColor: modBg, bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', padding: 40, lineHeight: 1.7, fontFamily: googleFont } });
        return;
      }

      // ── MÓDULOS CON COLUMNAS (services, skills, features, team, blog, portfolio, price, brands, fp, miscellaneous) ──
      // Estrategia: detectar tablas flotantes align="left" que son las columnas reales
      const floatCols = detectMercuryColumns(mod);

      if (floatCols && floatCols.length >= 2) {
        // Encontrar el headline del módulo (fuera de las columnas)
        const headline = mod.querySelector('[data-element*="headline"], [data-label*="Headline"]');
        if (headline) {
          const t = cleanText(headline);
          if (t) {
            const fs = getFontSize(headline.querySelector('td') || headline) || 28;
            const color = getTextColor(headline.querySelector('td') || headline) || '#333333';
            resultBlocks.push({ id: getUniqueId('text'), type: 'text', content: { text: t, textColor: color, fontSize: Math.min(fs, 44), fontWeight: 'bold', align: 'center', bgColor: modBg, bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', padding: 20, lineHeight: 1.3, fontFamily: googleFont } });
          }
        }
        // Convertir cada columna flotante a bloques nativos
        const cols = floatCols.map(col => tdToNativeBlocks(col, modBg)).filter(c => c.length > 0);
        if (cols.length >= 2) {
          resultBlocks.push({ id: getUniqueId('columns'), type: 'columns', content: { colCount: cols.length, bgColor: modBg, bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', padding: 20, align: 'top', cols } });
          return;
        }
      }

      // ── FALLBACK: imagen grande + textos + botones ─────────────────────────
      // Buscar imagen principal del módulo
      const bigImg = mod.querySelector('img[width="600"], img[width="800"], img[data-label*="Picture" i], img[data-label*="Background" i]');
      if (bigImg) {
        const bgTd = mod.querySelector('td[background]');
        resultBlocks.push({ id: getUniqueId('image'), type: 'image', content: { imageUrl: fixSrc(bigImg.getAttribute('src') || ''), altText: bigImg.getAttribute('alt') || '', linkUrl: bigImg.closest('a')?.getAttribute('href') || '', bgColor: modBg, bgImageUrl: fixSrc(bgTd?.getAttribute('background') || ''), bgSize: 'cover', bgPosition: 'center', padding: 0, borderRadius: 0, width: 100, align: 'center' } });
      }
      // Textos del módulo
      const modTextEls = mod.querySelectorAll('[data-text-edit], singleline, [data-label*="Headline"], [data-label*="Paragraph"]');
      const seenTexts = new Set();
      modTextEls.forEach(el => {
        const t = cleanText(el);
        if (!t || t.length < 2 || seenTexts.has(t)) return;
        seenTexts.add(t);
        const fs = getFontSize(el.closest('td[style*="font-size"]') || el) || 14;
        const color = getTextColor(el.closest('td[style*="color"]') || el) || '#333333';
        resultBlocks.push({ id: getUniqueId('text'), type: 'text', content: { text: t, textColor: color, fontSize: Math.min(Math.max(fs, 10), 44), fontWeight: fs > 20 ? 'bold' : 'normal', align: 'center', bgColor: bigImg ? 'transparent' : modBg, bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', padding: fs > 20 ? 10 : 5, lineHeight: 1.5, fontFamily: googleFont } });
      });
      // Botones del módulo
      mod.querySelectorAll('[data-label*="Button"] a, [data-element*="button"] a').forEach(link => {
        const t = link.textContent.trim();
        if (!t) return;
        const parentTd = link.closest('td[style*="border"]') || link.closest('td');
        const borderColor = getTextColor(link) || '#ffffff';
        resultBlocks.push({ id: getUniqueId('button'), type: 'button', content: { text: t, url: link.getAttribute('href') || '#', buttonBgColor: css(parentTd || link).get('background-color') || 'transparent', containerBgColor: 'transparent', bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', textColor: borderColor, align: 'center', paddingY: 12, paddingX: 28, borderRadius: 6, fontSize: 14, fontWeight: 'bold', fontFamily: googleFont, width: 'auto', borderStyle: 'solid', borderWidth: 2, borderColor, padding: 20 } });
      });

    });

    return resultBlocks.filter(b => {
      if (b.type === 'text' && (!b.content.text || b.content.text.trim().length < 2)) return false;
      if (b.type === 'columns' && b.content.cols.every(col => col.length === 0)) return false;
      return true;
    });
  };

  // ── Parser para MailChimp mc:repeatable ──────────────────────────────────────
  // ── Converter pennyblack → bloques nativos ───────────────────────────────────
  // Analiza cada sección por su nombre y estructura DOM conocida
  const parsePennyblackSections = (htmlString) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const blocks = [];

    // Helpers
    const getCss = (el) => {
      if (!el) return { get: () => null, raw: '' };
      let s = el.getAttribute?.('style') || '';
      return { raw: s, get: (p) => { const m = s.match(new RegExp(p + '\\s*:\\s*([^;!]+)', 'i')); return m ? m[1].trim() : null; } };
    };
    const getBg = (el) => {
      for (let cur = el, i = 0; cur && i < 5; cur = cur.parentElement, i++) {
        const bg = cur.getAttribute?.('bgcolor') || getCss(cur).get('background-color');
        if (bg && bg !== 'transparent' && bg !== 'inherit' && !bg.includes('gradient')) return bg;
      }
      return '#ffffff';
    };
    const cleanText = (el) => {
      if (!el) return '';
      let t = '';
      el.childNodes.forEach(n => {
        if (n.nodeType === 3) { const v = n.textContent.replace(/\s+/g, ' ').trim(); if (v && v !== '\xa0') t += (t ? ' ' : '') + v; }
        else if (['BR'].includes(n.nodeName)) t += '\n';
        else if (['SPAN','STRONG','EM','B','I','FONT','A'].includes(n.nodeName)) { const inner = cleanText(n); if (inner) t += (t ? ' ' : '') + inner; }
        else if (['TD','P','DIV'].includes(n.nodeName)) { const inner = cleanText(n); if (inner) t += '\n' + inner; }
      });
      return t.trim();
    };
    const getImg = (container) => {
      const img = container?.querySelector('img');
      if (!img) return null;
      const w = parseInt(img.getAttribute('width') || '0');
      if (w > 0 && w <= 5) return null; // spacer
      return { src: img.getAttribute('src') || '', alt: img.getAttribute('alt') || '', link: img.closest('a')?.getAttribute('href') || '', w };
    };
    const getBtn = (container) => {
      // Buscar TD con bgcolor + enlace, o <a> con color de fondo
      const btnTd = container?.querySelector('td[bgcolor] a, table[bgcolor] a, td[style*="background-color"] a');
      if (!btnTd) return null;
      const text = btnTd.textContent.trim();
      if (!text || text.length > 60) return null;
      const bgEl = btnTd.closest('td[bgcolor]') || btnTd.closest('table[bgcolor]') || btnTd.closest('td[style*="background-color"]');
      const bg = bgEl?.getAttribute('bgcolor') || getCss(bgEl).get('background-color') || '#0396A6';
      const color = getCss(btnTd).get('color') || '#ffffff';
      return { text, bg, color, href: btnTd.getAttribute('href') || '#' };
    };
    const makeTxtBlock = (text, opts = {}) => ({
      id: getUniqueId('text'), type: 'text',
      content: { text, textColor: opts.color || '#333333', fontSize: opts.size || 14, fontWeight: opts.bold ? 'bold' : 'normal', align: opts.align || 'center', bgColor: opts.bg || 'transparent', bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', padding: opts.pad !== undefined ? opts.pad : 8, lineHeight: opts.lh || 1.6, fontFamily: 'Arial, sans-serif' }
    });
    const makeImgBlock = (img, opts = {}) => {
      // Si la URL es una imagen demo de pennyblack (bloqueada), generar placeholder con dimensiones reales
      let src = img.src || '';
      if (src && !src.startsWith('data:')) {
        // Extraer dimensiones del nombre del archivo (ej: 272x290.jpg → 272×290)
        const dimMatch = src.match(/\/(\d+)x(\d+)(?:x\d+)?(?:\.|\b)/i);
        if (dimMatch) {
          const w = dimMatch[1], h = dimMatch[2];
          // Usar placehold.co con dimensiones reales y color del template médico
          src = `https://placehold.co/${w}x${h}/e8f4f4/0396A6?text=${encodeURIComponent(img.alt || `${w}x${h}`)}`;
        } else if (!src.startsWith('http')) {
          src = `https://placehold.co/600x300/e8f4f4/0396A6?text=Imagen`;
        }
      }
      return {
        id: getUniqueId('image'), type: 'image',
        content: { imageUrl: src, altText: img.alt, linkUrl: img.link, bgColor: opts.bg || 'transparent', bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', padding: opts.pad !== undefined ? opts.pad : 0, borderRadius: opts.radius || 0, width: 100, align: opts.align || 'center' }
      };
    };
    const makeBtnBlock = (btn, containerBg = 'transparent') => ({
      id: getUniqueId('button'), type: 'button',
      content: { text: btn.text, url: btn.href, buttonBgColor: btn.bg, containerBgColor: containerBg, bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', textColor: btn.color, align: 'center', paddingY: 10, paddingX: 24, borderRadius: 4, fontSize: 13, fontWeight: 'bold', fontFamily: 'Arial, sans-serif', width: 'auto', borderStyle: 'none', borderWidth: 0, borderColor: btn.bg, padding: 12 }
    });
    const makeDivider = (color = '#e5e7eb') => ({
      id: getUniqueId('divider'), type: 'divider',
      content: { color, height: 1, borderStyle: 'solid', bgColor: 'transparent', padding: 0 }
    });
    const makeSpacer = (h = 16, bg = 'transparent') => ({
      id: getUniqueId('spacer'), type: 'spacer',
      content: { height: h, bgColor: bg }
    });

    // Extraer secciones por comentarios STARTS/ENDS
    const sectionPattern = /<!--\s*([A-Z][A-Z0-9\s\-]+?)\s*STARTS\s*-->([\s\S]*?)<!--\s*\1\s*ENDS\s*-->/gi;
    let match;
    const sections = [];
    while ((match = sectionPattern.exec(htmlString)) !== null) {
      sections.push({ name: match[1].trim(), html: match[2] });
    }

    sections.forEach(({ name, html }) => {
      // Parsear la sección
      const secDoc = parser.parseFromString(`<html><body>${html}</body></html>`, 'text/html');
      const body = secDoc.body;
      const sectionBg = body.querySelector('table')?.getAttribute('bgcolor') || getBg(body.querySelector('td')) || '#ffffff';

      // ── VIEW IN BROWSER ──────────────────────────────────────────────────────
      if (name.includes('VIEW IN BROWSER')) return; // Omitir

      // ── MENU ────────────────────────────────────────────────────────────────
      if (name === 'MENU') {
        const logoImg = getImg(body);
        const navLinks = Array.from(body.querySelectorAll('a')).filter(a => !a.querySelector('img') && a.textContent.trim().length < 20);
        const btn = getBtn(body);
        const innerBg = body.querySelector('table table')?.getAttribute('bgcolor') || '#f6f6f6';
        blocks.push({
          id: getUniqueId('header'), type: 'header',
          content: { logoUrl: logoImg?.src || '', logoAlt: 'Logo', logoWidth: Math.min(logoImg?.w || 150, 200), logoAlign: 'left', bgColor: innerBg, padding: '12px 20px' }
        });
        return;
      }

      // ── HEADERS (Hero con imagen de fondo) ───────────────────────────────────
      if (name.match(/^HEADER/)) {
        // Extraer imagen de fondo del TD o estilos inline
        const bgTd = body.querySelector('td[background]');
        const bgImgUrl = bgTd?.getAttribute('background') || '';
        // Heading
        const headingTd = body.querySelector('td[style*="38px"], td[style*="36px"], td[style*="30px"]');
        const headingText = headingTd ? cleanText(headingTd) : '';
        // Párrafo
        const paraEl = body.querySelector('td[style*="14px"][style*="color"]');
        const paraText = paraEl ? cleanText(paraEl) : '';
        // Botón
        const btn = getBtn(body);
        // Overlay color
        const overlayTd = body.querySelector('td[bgcolor*="#"]');
        const overlayBg = overlayTd?.getAttribute('bgcolor') || sectionBg;

        if (headingText) {
          blocks.push(makeTxtBlock(headingText, { color: '#ffffff', size: 32, bold: true, bg: bgImgUrl ? 'transparent' : overlayBg, pad: bgImgUrl ? 40 : 20 }));
        }
        if (paraText && paraText !== headingText) {
          blocks.push(makeTxtBlock(paraText, { color: '#f0f0f0', size: 14, bg: 'transparent', pad: 8 }));
        }
        if (btn) blocks.push(makeBtnBlock(btn, 'transparent'));
        if (bgImgUrl) {
          // Insertar imagen de fondo como imagen normal si no hay overlay
          // (ya manejada por los textos con bgImageUrl)
        }
        return;
      }

      // ── EMERGENCY CALL ───────────────────────────────────────────────────────
      if (name.includes('EMERGENCY')) {
        const texts = Array.from(body.querySelectorAll('td[style*="font-size"]')).map(cleanText).filter(t => t.length > 2);
        const allText = texts.join(' · ');
        if (allText) blocks.push(makeTxtBlock(allText, { color: '#ffffff', size: 18, bold: true, bg: '#0396A6', pad: 20, align: 'center' }));
        return;
      }

      // ── ABOUT, SUCCESSFUL SURGERY, THE NETWORK (imagen + texto 2 col) ────────
      if (name.includes('ABOUT') || name.includes('SUCCESSFUL') || name.includes('NETWORK')) {
        const img = getImg(body);
        const headingTd = body.querySelector('td[style*="22px"], td[style*="20px"], td[style*="18px"]');
        const headingText = headingTd ? cleanText(headingTd) : '';
        const paras = Array.from(body.querySelectorAll('td[style*="14px"]')).map(cleanText).filter(t => t.length > 10).slice(0, 2);
        const btn = getBtn(body);
        const cols = [];
        if (img) cols.push([makeImgBlock(img, { bg: sectionBg })]);
        const textCol = [];
        if (headingText) textCol.push(makeTxtBlock(headingText, { color: '#333333', size: 20, bold: true, bg: 'transparent', pad: 8, align: 'left' }));
        paras.forEach(p => textCol.push(makeTxtBlock(p, { color: '#666666', size: 14, bg: 'transparent', pad: 5, align: 'left' })));
        if (btn) textCol.push(makeBtnBlock(btn));
        if (textCol.length) cols.push(textCol);
        if (cols.length >= 2) {
          blocks.push({ id: getUniqueId('columns'), type: 'columns', content: { colCount: 2, bgColor: sectionBg, bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', padding: 20, align: 'top', cols } });
        } else {
          if (headingText) blocks.push(makeTxtBlock(headingText, { color: '#333333', size: 20, bold: true, bg: sectionBg }));
          paras.forEach(p => blocks.push(makeTxtBlock(p, { color: '#666666', bg: sectionBg })));
          if (btn) blocks.push(makeBtnBlock(btn, sectionBg));
        }
        return;
      }

      // ── OUR SERVICES (grid de tarjetas icono + texto) ─────────────────────────
      if (name.includes('SERVICES') || name.includes('PACKAGES') || name.includes('DEPARTMENTS')) {
        // Título de sección
        const titleTd = body.querySelector('td[style*="30px"], td[style*="28px"]');
        const title = titleTd ? cleanText(titleTd) : name.replace(/-/g, ' ');
        if (title) blocks.push(makeTxtBlock(title, { color: '#333333', size: 24, bold: true, bg: sectionBg, pad: 16, align: 'center' }));

        // Buscar columnas inline-block
        const inlineDivs = Array.from(body.querySelectorAll('div[style*="inline-block"]'))
          .filter(d => { const s = d.getAttribute('style') || ''; const m = s.match(/max-width\s*:\s*(\d+)px/i); return m && parseInt(m[1]) > 80; });

        if (inlineDivs.length >= 2) {
          const cols = inlineDivs.map(div => {
            const colBlocks = [];
            const img = getImg(div);
            if (img) colBlocks.push(makeImgBlock(img, { pad: 10, align: 'center' }));
            const headEl = div.querySelector('td[style*="font-size"]');
            const text = headEl ? cleanText(headEl) : cleanText(div);
            if (text.length > 2) colBlocks.push(makeTxtBlock(text, { color: '#333333', size: 14, bg: 'transparent', pad: 5, align: 'center' }));
            const btn = getBtn(div);
            if (btn) colBlocks.push(makeBtnBlock(btn));
            return colBlocks;
          }).filter(c => c.length > 0);

          if (cols.length >= 2) {
            // Si hay muchas columnas, dividir en grupos de 3 o 4
            const chunkSize = cols.length <= 3 ? cols.length : (cols.length % 2 === 0 ? 2 : 3);
            for (let i = 0; i < cols.length; i += chunkSize) {
              const chunk = cols.slice(i, i + chunkSize);
              if (chunk.length >= 2) {
                blocks.push({ id: getUniqueId('columns'), type: 'columns', content: { colCount: chunk.length, bgColor: sectionBg, bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', padding: 12, align: 'top', cols: chunk } });
              }
            }
          }
        }

        const btn = getBtn(body);
        if (btn) blocks.push(makeBtnBlock(btn, sectionBg));
        return;
      }

      // ── HEALTH CARE SPECIALITY, SPECIALIZED TEAM (columnas con imagen+texto) ──
      if (name.includes('SPECIALITY') || name.includes('TEAM') || name.includes('IMPORTANT')) {
        const titleTd = body.querySelector('td[style*="30px"], td[style*="28px"]');
        const title = titleTd ? cleanText(titleTd) : name.replace(/-/g, ' ');
        if (title) blocks.push(makeTxtBlock(title, { color: '#333333', size: 24, bold: true, bg: sectionBg, pad: 16, align: 'center' }));

        const inlineDivs = Array.from(body.querySelectorAll('div[style*="inline-block"]'))
          .filter(d => { const s = d.getAttribute('style') || ''; const m = s.match(/max-width\s*:\s*(\d+)px/i); return m && parseInt(m[1]) > 80; });

        if (inlineDivs.length >= 2) {
          const cols = inlineDivs.map(div => {
            const colBlocks = [];
            const imgs = Array.from(div.querySelectorAll('img')).filter(i => parseInt(i.getAttribute('width') || '0') > 20);
            if (imgs.length > 0) colBlocks.push(makeImgBlock({ src: imgs[0].getAttribute('src') || '', alt: imgs[0].getAttribute('alt') || '', link: imgs[0].closest('a')?.getAttribute('href') || '' }, { pad: 8, align: 'center' }));
            const textEl = div.querySelector('td[style*="font-size"]');
            const text = textEl ? cleanText(textEl) : cleanText(div);
            if (text.length > 2) colBlocks.push(makeTxtBlock(text, { color: '#333333', size: 13, bg: 'transparent', pad: 5, align: 'center' }));
            return colBlocks;
          }).filter(c => c.length > 0);

          const chunkSize = Math.min(cols.length, 3);
          for (let i = 0; i < cols.length; i += chunkSize) {
            const chunk = cols.slice(i, i + chunkSize);
            if (chunk.length >= 2) blocks.push({ id: getUniqueId('columns'), type: 'columns', content: { colCount: chunk.length, bgColor: sectionBg, bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', padding: 12, align: 'top', cols: chunk } });
            else if (chunk.length === 1) chunk[0].forEach(b => blocks.push(b));
          }
        }
        return;
      }

      // ── COLUMNAS 2-COLUMN / HEALTH NEWS / LATEST NEWS ────────────────────────
      if (name.match(/^2-COLUMN/) || name.includes('NEWS') || name.includes('TESTIMONIAL')) {
        const titleTd = body.querySelector('td[style*="30px"], td[style*="28px"], td[style*="24px"]');
        const title = titleTd ? cleanText(titleTd) : '';
        if (title) blocks.push(makeTxtBlock(title, { color: '#333333', size: 22, bold: true, bg: sectionBg, pad: 12, align: 'center' }));

        const inlineDivs = Array.from(body.querySelectorAll('div[style*="inline-block"]'))
          .filter(d => { const s = d.getAttribute('style') || ''; const m = s.match(/max-width\s*:\s*(\d+)px/i); return m && parseInt(m[1]) > 100; });

        if (inlineDivs.length >= 2) {
          const cols = inlineDivs.slice(0, 2).map(div => {
            const colBlocks = [];
            const img = getImg(div);
            if (img) colBlocks.push(makeImgBlock(img, { pad: 0, align: 'center' }));
            const textEls = Array.from(div.querySelectorAll('td[style*="font-size"]'));
            const seen = new Set();
            textEls.forEach(el => {
              const t = cleanText(el);
              if (!t || t.length < 3 || seen.has(t)) return;
              seen.add(t);
              const fs = parseInt(getCss(el).get('font-size') || '14') || 14;
              const color = getCss(el).get('color') || '#333333';
              colBlocks.push(makeTxtBlock(t, { color, size: Math.min(fs, 24), bg: 'transparent', pad: 5, align: 'left' }));
            });
            return colBlocks;
          }).filter(c => c.length > 0);

          if (cols.length >= 2) blocks.push({ id: getUniqueId('columns'), type: 'columns', content: { colCount: 2, bgColor: sectionBg, bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', padding: 16, align: 'top', cols } });
        }
        return;
      }

      // ── FIND A DOCTOR / VIDEO / EXPERIENCED SURGEONS (centrado) ──────────────
      if (name.includes('FIND') || name.includes('VIDEO') || name.includes('SURGEON') || name.includes('EXPERIENCED')) {
        const titleTd = body.querySelector('td[style*="30px"], td[style*="28px"]');
        const title = titleTd ? cleanText(titleTd) : '';
        if (title) blocks.push(makeTxtBlock(title, { color: '#333333', size: 24, bold: true, bg: sectionBg, pad: 16, align: 'center' }));
        const img = getImg(body);
        if (img) blocks.push(makeImgBlock(img, { bg: sectionBg }));
        const paras = Array.from(body.querySelectorAll('td[style*="14px"]')).map(cleanText).filter(t => t.length > 10 && t !== title).slice(0, 2);
        paras.forEach(p => blocks.push(makeTxtBlock(p, { color: '#666666', size: 14, bg: sectionBg, pad: 8, align: 'center' })));
        const btn = getBtn(body);
        if (btn) blocks.push(makeBtnBlock(btn, sectionBg));
        return;
      }

      // ── CTA (imagen de fondo + texto + botón) ────────────────────────────────
      if (name === 'CTA') {
        const bgTd = body.querySelector('td[background]');
        const bgImg = bgTd?.getAttribute('background') || '';
        const headingTd = body.querySelector('td[style*="38px"], td[style*="36px"]');
        const headingText = headingTd ? cleanText(headingTd) : 'Make An Appointment';
        const btn = getBtn(body);
        blocks.push(makeTxtBlock(headingText, { color: '#ffffff', size: 32, bold: true, bg: bgImg ? '#333333' : sectionBg, pad: 40, align: 'center' }));
        if (btn) blocks.push(makeBtnBlock(btn, 'transparent'));
        return;
      }

      // ── OUR PRICING ──────────────────────────────────────────────────────────
      if (name.includes('PRICING')) {
        const titleTd = body.querySelector('td[style*="30px"]');
        const title = titleTd ? cleanText(titleTd) : 'Our Pricing';
        if (title) blocks.push(makeTxtBlock(title, { color: '#333333', size: 24, bold: true, bg: sectionBg, pad: 16, align: 'center' }));

        const inlineDivs = Array.from(body.querySelectorAll('div[style*="inline-block"]'))
          .filter(d => { const s = d.getAttribute('style') || ''; const m = s.match(/max-width\s*:\s*(\d+)px/i); return m && parseInt(m[1]) > 100; });

        const cols = inlineDivs.map(div => {
          const colBlocks = [];
          const headBg = div.querySelector('table[bgcolor], td[bgcolor]');
          const planName = cleanText(div.querySelector('td[style*="font-size"]') || div).split('\n')[0];
          const priceEl = div.querySelector('td[style*="40px"], td[style*="36px"], td[style*="30px"]');
          const price = priceEl ? cleanText(priceEl) : '';
          const features = Array.from(div.querySelectorAll('td[style*="14px"]')).map(cleanText).filter(t => t.length > 2 && t !== planName && t !== price).slice(0, 4);
          const btn = getBtn(div);

          if (planName) colBlocks.push(makeTxtBlock(planName, { color: '#ffffff', size: 16, bold: true, bg: headBg?.getAttribute('bgcolor') || '#2f3439', pad: 12, align: 'center' }));
          if (price) colBlocks.push(makeTxtBlock(price, { color: '#0396A6', size: 36, bold: true, bg: '#ffffff', pad: 12, align: 'center' }));
          features.forEach(f => colBlocks.push(makeTxtBlock(f, { color: '#666666', size: 13, bg: '#ffffff', pad: 5, align: 'center' })));
          if (btn) colBlocks.push(makeBtnBlock(btn));
          return colBlocks;
        }).filter(c => c.length > 0);

        if (cols.length >= 2) blocks.push({ id: getUniqueId('columns'), type: 'columns', content: { colCount: cols.length, bgColor: sectionBg, bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', padding: 16, align: 'top', cols } });
        return;
      }

      // ── OUR GALLERY ──────────────────────────────────────────────────────────
      if (name.includes('GALLERY')) {
        const titleTd = body.querySelector('td[style*="30px"]');
        const title = titleTd ? cleanText(titleTd) : 'Our Gallery';
        if (title) blocks.push(makeTxtBlock(title, { color: '#333333', size: 24, bold: true, bg: sectionBg, pad: 16, align: 'center' }));

        const imgs = Array.from(body.querySelectorAll('img')).filter(i => parseInt(i.getAttribute('width') || '0') > 50);
        if (imgs.length >= 2) {
          const chunkSize = 3;
          for (let i = 0; i < imgs.length; i += chunkSize) {
            const chunk = imgs.slice(i, i + chunkSize);
            const cols = chunk.map(img => [makeImgBlock({ src: img.getAttribute('src') || '', alt: img.getAttribute('alt') || '', link: img.closest('a')?.getAttribute('href') || '' }, { pad: 4, align: 'center' })]);
            if (cols.length >= 2) blocks.push({ id: getUniqueId('columns'), type: 'columns', content: { colCount: cols.length, bgColor: sectionBg, bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', padding: 4, align: 'top', cols } });
          }
        }
        const btn = getBtn(body);
        if (btn) blocks.push(makeBtnBlock(btn, sectionBg));
        return;
      }

      // ── FOOTER ───────────────────────────────────────────────────────────────
      if (name.includes('FOOTER')) {
        // Redes sociales
        const socialLinks = Array.from(body.querySelectorAll('a[href]')).filter(a => {
          const h = a.getAttribute('href') || '';
          return ['facebook','twitter','instagram','linkedin','youtube','tiktok','pinterest'].some(s => h.includes(s));
        });
        if (socialLinks.length > 0) {
          const networks = [];
          socialLinks.forEach(a => {
            const h = a.getAttribute('href') || '';
            const net = h.includes('facebook') ? 'facebook' : h.includes('twitter') || h.includes('x.com') ? 'twitter' : h.includes('instagram') ? 'instagram' : h.includes('linkedin') ? 'linkedin' : h.includes('youtube') ? 'youtube' : h.includes('tiktok') ? 'tiktok' : null;
            if (net && !networks.find(n => n.network === net)) networks.push({ id: getUniqueId('net'), network: net, url: h, iconColor: '#ffffff', bgColor: '#333333' });
          });
          if (networks.length) blocks.push({ id: getUniqueId('social'), type: 'social', content: { align: 'center', bgColor: sectionBg, bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', padding: 20, iconSize: 28, borderRadius: 4, networks } });
        }
        const texts = Array.from(body.querySelectorAll('td[style*="font-size"]')).map(cleanText).filter(t => t.length > 5);
        const footerText = texts.join('\n').substring(0, 400);
        if (footerText) blocks.push({ id: getUniqueId('footer'), type: 'footer', content: { text: footerText, bgColor: sectionBg, bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', textColor: sectionBg.includes('2f3439') || sectionBg.includes('333') ? '#e5e5e5' : '#666666', padding: 24, fontSize: 12, fontFamily: 'Arial, sans-serif', align: 'center' } });
        return;
      }

      // ── FALLBACK: texto genérico + botón ─────────────────────────────────────
      const titleTd = body.querySelector('td[style*="30px"], td[style*="28px"], td[style*="22px"]');
      const title = titleTd ? cleanText(titleTd) : '';
      if (title) blocks.push(makeTxtBlock(title, { color: '#333333', size: 20, bold: true, bg: sectionBg, pad: 16, align: 'center' }));
      const img = getImg(body);
      if (img) blocks.push(makeImgBlock(img, { bg: sectionBg }));
      const paras = Array.from(body.querySelectorAll('td[style*="14px"]')).map(cleanText).filter(t => t.length > 10 && t !== title).slice(0, 2);
      paras.forEach(p => blocks.push(makeTxtBlock(p, { color: '#666666', bg: sectionBg, pad: 8 })));
      const btn = getBtn(body);
      if (btn) blocks.push(makeBtnBlock(btn, sectionBg));
    });

    return blocks.filter(b => {
      if (b.type === 'text' && (!b.content.text || b.content.text.trim().length < 2)) return false;
      if (b.type === 'columns' && b.content.cols.every(c => c.length === 0)) return false;
      return true;
    });
  };

  // ── Parser por comentarios HTML (pennyblack / pennyblacktemplates style) ─────
  // Estos templates usan <!-- Header --> <!-- Banner --> como separadores de sección
  const parseByCommentSections = (htmlString, platform) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const blocks = [];

    const styleRules = {};
    doc.querySelectorAll('style').forEach(s => {
      (s.textContent || '').match(/\.([a-zA-Z0-9_-]+)\s*\{([^}]+)\}/g)?.forEach(r => {
        const m = r.match(/\.([a-zA-Z0-9_-]+)\s*\{([^}]+)\}/);
        if (m) styleRules[m[1]] = m[2];
      });
    });

    const getCss = (el) => {
      if (!el) return { get: () => null, raw: '' };
      let s = el.getAttribute?.('style') || '';
      (el.getAttribute?.('class') || '').split(/\s+/).forEach(c => { if (styleRules[c]) s += ';' + styleRules[c]; });
      return { raw: s, get: (p) => { const m = s.match(new RegExp(p + '\\s*:\\s*([^;!]+)', 'i')); return m ? m[1].trim() : null; } };
    };

    const getBg = (el) => {
      for (let cur = el, i = 0; cur && cur !== doc.body && i < 6; cur = cur.parentElement, i++) {
        const bg = cur.getAttribute?.('bgcolor') || getCss(cur).get('background-color') || getCss(cur).get('background');
        if (bg && bg !== 'transparent' && bg !== 'inherit' && !bg.includes('url(') && !bg.includes('gradient')) return bg;
      }
      return null;
    };

    const fixSrc = (src) => {
      if (!src) return '';
      if (src.startsWith('http') || src.startsWith('//') || src.startsWith('data:')) return src;
      return '';
    };

    const cleanText = (el) => {
      let t = '';
      el.childNodes.forEach(n => {
        if (n.nodeType === 3) { const v = n.textContent.trim(); if (v && v !== '\xa0') t += (t ? ' ' : '') + v; }
        else if (['SPAN','STRONG','EM','A','B','I','FONT'].includes(n.nodeName)) t += (t ? ' ' : '') + cleanText(n);
        else if (n.nodeName === 'BR') t += '\n';
        else if (['P','DIV'].includes(n.nodeName)) { const inner = cleanText(n); if (inner.trim()) t += '\n' + inner; }
      });
      return t.trim();
    };

    // Obtener todas las tablas de nivel superior (las que son secciones del email)
    // En pennyblack: hay una tabla wrapper 100% que contiene sub-tablas de 800px
    // Cada sub-tabla de 800px es una sección del email
    const mainWrapper = doc.querySelector('table[width="100%"]') || 
                        doc.querySelector('table') || 
                        doc.body;

    // Buscar todas las tablas de 800px (o con clase device-width) que son las secciones
    const sectionTables = Array.from(doc.querySelectorAll(
      'table[width="800"], table.device-width, table[style*="max-width:800"], table[style*="max-width: 800"]'
    )).filter(t => {
      // Excluir tablas que solo son spacers (solo &nbsp; o altura pequeña)
      const text = t.textContent.replace(/\s|\u00a0/g, '');
      if (text.length === 0) return false;
      // Excluir tablas que están anidadas dentro de otra tabla de 800px (solo queremos nivel raíz)
      const parent = t.parentElement?.closest('table[width="800"], table.device-width');
      if (parent) return false;
      return true;
    });

    if (sectionTables.length === 0) {
      // Fallback: usar todas las TRs de la tabla principal
      return parseByRows(htmlString);
    }

    sectionTables.forEach((table, idx) => {
      const bg = getBg(table) || '#ffffff';
      const imgs = Array.from(table.querySelectorAll('img')).filter(i => {
        const w = parseInt(i.getAttribute('width') || '0');
        return w > 20 || !i.getAttribute('width');
      });
      const allText = table.textContent.trim().replace(/\s+/g, ' ');
      const hasText = allText.length > 5;

      // ── Detectar si es footer/unsubscribe ────────────────────────────────────
      const textLow = allText.toLowerCase();
      if (textLow.includes('unsubscribe') || textLow.includes('privacy policy') ||
          (textLow.includes('©') && allText.length < 300)) {
        blocks.push({
          id: getUniqueId('footer'), type: 'footer',
          content: { text: allText, bgColor: bg, bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', textColor: getCss(table.querySelector('td[style*="color"]') || table).get('color') || '#666666', padding: 24, fontSize: 12, fontFamily: 'Arial, sans-serif', align: 'center' }
        });
        return;
      }

      // ── Detectar si es social icons ─────────────────────────────────────────
      const links = Array.from(table.querySelectorAll('a[href]'));
      const socialLinks = links.filter(a => {
        const h = a.getAttribute('href') || '';
        return ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'tiktok', 'pinterest'].some(s => h.includes(s));
      });
      if (socialLinks.length >= 2 && imgs.length >= 2) {
        const networks = [];
        socialLinks.forEach(a => {
          const href = a.getAttribute('href') || '';
          const net = href.includes('facebook') ? 'facebook' : href.includes('instagram') ? 'instagram' : href.includes('twitter') || href.includes('x.com') ? 'twitter' : href.includes('linkedin') ? 'linkedin' : href.includes('youtube') ? 'youtube' : href.includes('tiktok') ? 'tiktok' : href.includes('pinterest') ? 'pinterest' : null;
          if (net && !networks.find(n => n.network === net)) {
            networks.push({ id: getUniqueId('net'), network: net, url: href, iconColor: '#ffffff', bgColor: '#333333' });
          }
        });
        if (networks.length) {
          blocks.push({ id: getUniqueId('social'), type: 'social', content: { align: 'center', bgColor: bg, bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', padding: 20, iconSize: 28, borderRadius: 8, networks } });
          return;
        }
      }

      // ── Imagen grande sola (hero/banner) ─────────────────────────────────────
      if (imgs.length === 1 && allText.length < 30) {
        const img = imgs[0];
        const src = fixSrc(img.getAttribute('src') || '') || img.getAttribute('src') || '';
        blocks.push({
          id: getUniqueId('image'), type: 'image',
          content: { imageUrl: src, altText: img.getAttribute('alt') || '', linkUrl: img.closest('a')?.getAttribute('href') || '', bgColor: bg, bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', padding: 0, borderRadius: 0, width: 100, align: 'center' }
        });
        return;
      }

      // ── Detectar columnas ────────────────────────────────────────────────────
      // Método 1: divs inline-block con max-width (pennyblack Medical style)
      // <div style="display:inline-block; max-width:Xpx; ...">...</div>
      const inlineBlockDivs = Array.from(table.querySelectorAll('div[style*="inline-block"]'))
        .filter(d => {
          const s = d.getAttribute('style') || '';
          const mw = s.match(/max-width\s*:\s*(\d+)px/i);
          return mw && parseInt(mw[1]) > 50 && parseInt(mw[1]) < 600;
        });

      // Agrupar divs inline-block del mismo padre
      const divParentMap = new Map();
      inlineBlockDivs.forEach(d => {
        const p = d.parentElement;
        if (!divParentMap.has(p)) divParentMap.set(p, []);
        divParentMap.get(p).push(d);
      });
      
      let floatCols = null;
      for (const [, siblings] of divParentMap) {
        if (siblings.length >= 2) { floatCols = siblings; break; }
      }

      // Método 2: tablas flotantes align="left" (Mercury style)
      if (!floatCols) {
        const floatTables = Array.from(table.querySelectorAll('table[align="left"], table[align="right"]'))
          .filter(t => parseInt(t.getAttribute('width') || '0') > 30);
        const tableParentMap = new Map();
        floatTables.forEach(t => {
          const p = t.parentElement;
          if (!tableParentMap.has(p)) tableParentMap.set(p, []);
          tableParentMap.get(p).push(t);
        });
        for (const [, siblings] of tableParentMap) {
          if (siblings.length >= 2) { floatCols = siblings; break; }
        }
      }

      // Método 3: TDs directas en una fila
      if (!floatCols) {
        const allRows = Array.from(table.querySelectorAll('tr'));
        let maxTdRow = null, maxTds = 0;
        allRows.forEach(tr => {
          const tds = tr.querySelectorAll(':scope > td');
          if (tds.length > maxTds && tds.length >= 2 && tds.length <= 4) { maxTds = tds.length; maxTdRow = tr; }
        });
        if (maxTdRow && maxTds >= 2) {
          floatCols = Array.from(maxTdRow.querySelectorAll(':scope > td'))
            .filter(td => parseInt(td.getAttribute('width') || '0') > 30 || td.textContent.trim().length > 2);
        }
      }

      // Convertir columnas a bloques
      const tdToColBlocks = (td) => {
        const colBlocks = [];
        const colImgs = Array.from(td.querySelectorAll('img')).filter(i => parseInt(i.getAttribute('width') || '0') > 20 || !i.getAttribute('width'));
        if (colImgs.length > 0) {
          const img = colImgs[0];
          const src = img.getAttribute('src') || '';
          if (src) colBlocks.push({ id: getUniqueId('image'), type: 'image', content: { imageUrl: src, altText: img.getAttribute('alt') || '', linkUrl: img.closest('a')?.getAttribute('href') || '', bgColor: 'transparent', bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', padding: 5, borderRadius: parseInt(getCss(img).get('border-radius') || '0'), width: 100, align: 'center' } });
        }
        // Textos con estilo
        const textEls = Array.from(td.querySelectorAll('td[style*="font-size"], p[style*="font"], span[style*="font"]'));
        const processed = new Set();
        (textEls.length > 0 ? textEls : [td]).forEach(el => {
          const t = cleanText(el);
          if (!t || t.length < 2 || processed.has(t)) return;
          processed.add(t);
          const s = getCss(el);
          const fs = parseInt(s.get('font-size') || '14') || 14;
          colBlocks.push({ id: getUniqueId('text'), type: 'text', content: { text: t, textColor: s.get('color') || '#333333', fontSize: Math.min(Math.max(fs, 10), 40), fontWeight: s.get('font-weight')?.includes('bold') || parseInt(s.get('font-weight') || '0') >= 700 ? 'bold' : 'normal', align: s.get('text-align') || 'center', bgColor: 'transparent', bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', padding: 5, lineHeight: 1.5, fontFamily: 'Arial, sans-serif' } });
        });
        // Botón
        const btn = td.querySelector('a[style*="background"], td[style*="background-color"] a');
        if (btn) {
          const btnBg = getCss(btn.closest('td') || btn).get('background-color') || '#333333';
          if (btnBg && btnBg !== 'transparent') colBlocks.push({ id: getUniqueId('button'), type: 'button', content: { text: btn.textContent.trim(), url: btn.getAttribute('href') || '#', buttonBgColor: btnBg, containerBgColor: 'transparent', bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', textColor: getCss(btn).get('color') || '#ffffff', align: 'center', paddingY: 10, paddingX: 24, borderRadius: 6, fontSize: 13, fontWeight: 'bold', fontFamily: 'Arial, sans-serif', width: 'auto', borderStyle: 'none', borderWidth: 0, borderColor: btnBg, padding: 8 } });
        }
        return colBlocks;
      };

      if (floatCols && floatCols.length >= 2) {
        const cols = floatCols.map(tdToColBlocks).filter(c => c.length > 0);
        if (cols.length >= 2) {
          blocks.push({ id: getUniqueId('columns'), type: 'columns', content: { colCount: cols.length, bgColor: bg, bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', padding: 20, align: 'top', cols } });
          return;
        }
      }

      // ── Imagen + textos + botones (sección mixta) ────────────────────────────
      if (imgs.length > 0) {
        const img = imgs[0];
        const src = fixSrc(img.getAttribute('src') || '') || img.getAttribute('src') || '';
        if (src) {
          blocks.push({ id: getUniqueId('image'), type: 'image', content: { imageUrl: src, altText: img.getAttribute('alt') || '', linkUrl: img.closest('a')?.getAttribute('href') || '', bgColor: bg, bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', padding: 0, borderRadius: 0, width: 100, align: 'center' } });
        }
      }

      // Textos de la sección
      const styledTds = Array.from(table.querySelectorAll('td[style*="font-size"]'));
      const seenTexts = new Set();
      styledTds.forEach(el => {
        const t = cleanText(el);
        if (!t || t.length < 2 || seenTexts.has(t)) return;
        seenTexts.add(t);
        const s = getCss(el);
        const fs = parseInt(s.get('font-size') || '15') || 15;
        blocks.push({ id: getUniqueId('text'), type: 'text', content: { text: t, textColor: s.get('color') || '#333333', fontSize: Math.min(Math.max(fs, 10), 44), fontWeight: s.get('font-weight')?.includes('bold') || parseInt(s.get('font-weight') || '0') >= 700 ? 'bold' : 'normal', align: s.get('text-align') || 'center', bgColor: imgs.length > 0 ? 'transparent' : bg, bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', padding: 10, lineHeight: 1.6, fontFamily: 'Arial, sans-serif' } });
      });

      // Botones
      const btnLinks = Array.from(table.querySelectorAll('a[style*="background"], td[style*="background-color"] a'));
      btnLinks.forEach(a => {
        const t = a.textContent.trim();
        if (!t || t.length > 60 || seenTexts.has(t)) return;
        seenTexts.add(t);
        const parentTd = a.closest('td');
        const btnBg = getCss(parentTd || a).get('background-color') || getCss(a).get('background-color') || '#333333';
        blocks.push({ id: getUniqueId('button'), type: 'button', content: { text: t, url: a.getAttribute('href') || '#', buttonBgColor: btnBg, containerBgColor: 'transparent', bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', textColor: getCss(a).get('color') || '#ffffff', align: 'center', paddingY: 12, paddingX: 28, borderRadius: 6, fontSize: 14, fontWeight: 'bold', fontFamily: 'Arial, sans-serif', width: 'auto', borderStyle: 'none', borderWidth: 0, borderColor: btnBg, padding: 10 } });
      });

      // Si no se extrajo nada pero hay texto, hacer bloque de texto genérico
      if (blocks.length === 0 || (imgs.length === 0 && styledTds.length === 0 && hasText)) {
        if (allText.length > 5 && !seenTexts.has(allText)) {
          blocks.push({ id: getUniqueId('text'), type: 'text', content: { text: allText.substring(0, 500), textColor: '#333333', fontSize: 14, fontWeight: 'normal', align: 'center', bgColor: bg, bgImageUrl: '', bgSize: 'cover', bgPosition: 'center', padding: 20, lineHeight: 1.6, fontFamily: 'Arial, sans-serif' } });
        }
      }
    });

    return blocks.filter(b => {
      if (b.type === 'text' && (!b.content.text || b.content.text.trim().length < 2)) return false;
      if (b.type === 'columns' && b.content.cols.every(c => c.length === 0)) return false;
      return true;
    });
  };

  const parseByMailChimpModules = (htmlString) => {
    // MailChimp usa mc:repeatable para marcar secciones editables
    // Cada mc:repeatable es un módulo independiente
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    // MailChimp ya fue preprocesado, los módulos quedan como tablas normales
    // Reutilizar el parser genérico de filas
    return parseByRows(htmlString);
  };

  const importTemplate = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.blocks && data.settings) {
          setBlocks(data.blocks);
          setSettings(data.settings);
          setSelectedBlockId(null);
        } else { alert('Formato de archivo incorrecto.'); }
      } catch (err) { alert('Error al importar el archivo.'); }
    };
    reader.readAsText(file);
    e.target.value = null; 
  };

  // Reemplaza {{variable}} con datos demo en el HTML generado
  const applyDemoData = (html) => {
    let result = html;
    Object.entries(demoData).forEach(([key, value]) => {
      result = result.replaceAll(`{{${key}}}`, value);
    });
    return result;
  };

  // Datos demo extendidos para receipt
  const RECEIPT_DEMO = {
    producto_1_nombre: 'Masterclass Inteligencia Competitiva',
    producto_1_categoria: 'Cursos',
    producto_1_precio: '249.00',
    producto_1_imagen: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=80&q=80',
    producto_2_nombre: 'Kit Legal Completo de Agentes',
    producto_2_categoria: 'Contratos',
    producto_2_precio: '89.00',
    producto_2_imagen: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=80&q=80',
    producto_3_nombre: 'Ebook: Técnicas de Cierre',
    producto_3_categoria: 'Ebooks',
    producto_3_precio: '29.00',
    producto_3_imagen: 'https://images.unsplash.com/photo-1542382257-80dedb725088?w=80&q=80',
    subtotal: '367.00',
    descuento_monto: '29.00',
    cupon: 'BLIS40',
    total: '338.00',
    metodo_pago: 'Tarjeta de Crédito',
    fecha: new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' }),
  };

  // Clona bloques reemplazando variables en campos de texto (para preview visual)
  const applyDemoToBlocks = (blocksList) => {
    const allDemo = { ...demoData, ...RECEIPT_DEMO };
    const replaceVars = (str) => {
      if (typeof str !== 'string') return str;
      let r = str;
      Object.entries(allDemo).forEach(([k, v]) => {
        r = r.replaceAll(`{{${k}}}`, v);
      });
      return r;
    };
    const processBlock = (b) => {
      const newContent = { ...b.content };
      if (newContent.text) newContent.text = replaceVars(newContent.text);
      if (newContent.src) newContent.src = replaceVars(newContent.src);
      if (newContent.link) newContent.link = replaceVars(newContent.link);
      // Reemplazar variables en receipt
      if (b.type === 'receipt') {
        newContent.items = (newContent.items || []).map((item, i) => ({
          ...item,
          nombre: replaceVars(item.nombre),
          categoria: replaceVars(item.categoria),
          precio: replaceVars(item.precio),
          imagen: item.imagen || replaceVars(`{{producto_${i+1}_imagen}}`),
        }));
        newContent.subtotalVar = replaceVars(newContent.subtotalVar || '{{subtotal}}');
        newContent.descuentoVar = replaceVars(newContent.descuentoVar || '{{descuento_monto}}');
        newContent.cuponVar = replaceVars(newContent.cuponVar || '{{cupon}}');
        newContent.totalVar = replaceVars(newContent.totalVar || '{{total}}');
        newContent.metodoPagoVar = replaceVars(newContent.metodoPagoVar || '{{metodo_pago}}');
        newContent.fechaVar = replaceVars(newContent.fechaVar || '{{fecha}}');
      }
      if (newContent.cols) {
        newContent.cols = newContent.cols.map(col =>
          Array.isArray(col) ? col.map(processBlock) : col
        );
      }
      return { ...b, content: newContent };
    };
    return blocksList.map(processBlock);
  };

  const displayBlocks = previewWithDemo ? applyDemoToBlocks(blocks) : blocks;

  const handleNetworkUpdate = (netId, key, value) => {
    const selBlock = findBlockInfo(blocks, selectedBlockId)?.block;
    if(!selBlock) return;
    let newNetworks;
    if (typeof key === 'object') {
      newNetworks = selBlock.content.networks.map(n => n.id === netId ? { ...n, ...key } : n);
    } else {
      newNetworks = selBlock.content.networks.map(n => n.id === netId ? { ...n, [key]: value } : n);
    }
    handleUpdateContent('networks', newNetworks);
  };

  const addNetwork = () => {
    const selBlock = findBlockInfo(blocks, selectedBlockId)?.block;
    if(!selBlock) return;
    const newNetwork = { id: `net-${Date.now()}`, network: 'facebook', url: 'https://', iconColor: '#ffffff', bgColor: '#1877F2' };
    handleUpdateContent('networks', [...selBlock.content.networks, newNetwork]);
  };

  const generateHTML = () => {
    const { bodyBg, containerBg, width, fontFamily, sectionGap } = settings;
    const safeWidth = Math.min(Math.max(parseInt(width) || 600, 300), 800);
    const safeFontFamily = fontFamily || 'Arial, sans-serif';
    const safeGap = Math.max(parseInt(sectionGap) || 0, 0);

    // Helper para estilo de fondo compatible con Gmail
    const getBgStyle = (content) => {
      let style = `background-color: ${content.bgColor || 'transparent'};`;
      if (content.bgImageUrl) {
        style += ` background-image: url('${content.bgImageUrl}');`;
        style += ` background-size: ${content.bgSize || 'cover'};`;
        style += ` background-position: ${content.bgPosition || 'center'};`;
        style += ` background-repeat: no-repeat;`;
      }
      return style;
    };

    const renderBlockHTML = (block) => {
      const { type, content } = block;
      const bFont = content.fontFamily && content.fontFamily !== 'inherit' ? content.fontFamily : safeFontFamily;
      const fontSize = Math.max(parseInt(content.fontSize) || 16, 12);
      const padding = parseInt(content.padding) || 20;
      const gap = safeGap;

      let blockHtml = '';

      switch (type) {
        case 'header':
          const logoWidth = Math.min(parseInt(content.logoWidth) || 600, safeWidth);
          const headerAlign = content.align || 'center';
          const headerBgStyle = getBgStyle(content);
          const headerBgAttr = content.bgImageUrl ? ` background="${content.bgImageUrl}"` : '';
          blockHtml = `
            <tr>
              <td ${headerBgAttr} align="${headerAlign}" style="${headerBgStyle} padding: ${padding}px;">
                <table border="0" cellspacing="0" cellpadding="0" align="${headerAlign}">
                  <tr>
                    <td>
                      <img src="${content.logoUrl}" alt="Logo" width="${logoWidth}" style="display: block; max-width: ${logoWidth}px; width: 100%; height: auto; border: 0;" />
                    </td>
                  </tr>
                </table>
              </td>
            </tr>`;
          break;

case 'text':
          const textFont = (content.fontFamily && content.fontFamily !== 'inherit') ? content.fontFamily : bFont;
          const textColor = content.textColor || '#333333';
          const textSize = Math.max(parseInt(content.fontSize) || 16, 14);
          const textWeight = content.fontWeight || 'normal';
          const textAlign = content.align || 'center';
          const textLineHeight = content.lineHeight || 1.5;
          const textBgStyle = getBgStyle(content);
          const textBgAttr = content.bgImageUrl ? ` background="${content.bgImageUrl}"` : '';
          const textPaddingTop = content.paddingTop ?? content.padding ?? 20;
          const textPaddingRight = content.paddingRight ?? content.padding ?? 20;
          const textPaddingBottom = content.paddingBottom ?? content.padding ?? 20;
          const textPaddingLeft = content.paddingLeft ?? content.padding ?? 20;
          
          blockHtml = `
            <tr>
              <td ${textBgAttr} align="${textAlign}" style="${textBgStyle} padding-top: ${textPaddingTop}px; padding-right: ${textPaddingRight}px; padding-bottom: ${textPaddingBottom}px; padding-left: ${textPaddingLeft}px;">
                <p align="${textAlign}" style="color: ${textColor}; font-size: ${textSize}px; font-weight: ${textWeight}; text-align: ${textAlign}; margin: 0; font-family: ${textFont}; line-height: ${textLineHeight};">
                  ${content.text ? content.text.replace(/\n/g, '<br/>') : ''}
                </p>
              </td>
            </tr>`;
          break;

        case 'image':
          const imgWidthPx = Math.floor((safeWidth * (parseInt(content.width) || 100)) / 100);
          const imgRadius = parseInt(content.borderRadius) || 0;
          const imgAlign = content.align || 'center';
          const imgBgStyle = getBgStyle(content);
          const imgBgAttr = content.bgImageUrl ? ` background="${content.bgImageUrl}"` : '';
          blockHtml = `
            <tr>
              <td ${imgBgAttr} align="${imgAlign}" style="${imgBgStyle} padding: ${padding}px;">
                <table border="0" cellspacing="0" cellpadding="0" align="${imgAlign}">
                  <tr>
                    <td>
                      ${content.linkUrl ? `<a href="${content.linkUrl}" target="_blank" style="display: block; border: 0;">` : ''}
                      <img src="${content.imageUrl}" alt="${content.altText || 'Imagen'}" width="${imgWidthPx}" style="display: block; max-width: ${imgWidthPx}px; width: 100%; height: auto; border: 0; border-radius: ${imgRadius}px;" />
                      ${content.linkUrl ? '</a>' : ''}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>`;
          break;

case 'video':
           const videoRadius = parseInt(content.borderRadius) || 0;
           const videoAlign = content.align || 'center';
           const videoBgStyle = getBgStyle(content);
           const videoBgAttr = content.bgImageUrl ? ` background="${content.bgImageUrl}"` : '';
           
           let videoThumb = content.coverUrl || '';
           const videoUrl = content.videoUrl || '';
           
           const ytMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
           if (ytMatch && ytMatch[1]) {
             videoThumb = videoThumb || `https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg`;
           }
           
           const vimeoMatch = videoUrl.match(/vimeo\.com\/(\d+)/);
           if (vimeoMatch && vimeoMatch[1] && !videoThumb) {
             videoThumb = `https://vumbnail.com/${vimeoMatch[1]}.jpg`;
           }
           
           if (!videoThumb) {
             videoThumb = 'https://placehold.co/600x338/181818/ffffff?text=▶+Click+para+ver';
           }
           
           blockHtml = `
             <tr>
               <td ${videoBgAttr} align="${videoAlign}" style="${videoBgStyle} padding: ${padding}px;">
                 <table border="0" cellspacing="0" cellpadding="0" align="${videoAlign}">
                   <tr>
                     <td>
                       <a href="${videoUrl || '#'}" target="_blank" style="display: block; border: 0; text-decoration: none;">
                         <img src="${videoThumb}" alt="Video" style="display: block; max-width: 100%; border-radius: ${videoRadius}px; border: 0;" />
                       </a>
                     </td>
                   </tr>
                 </table>
               </td>
            </tr>`;
           break;

        case 'columns':
           const colCount = Math.max(Math.min(parseInt(content.colCount) || 2, 4), 1);
           const colWidth = Math.floor(100 / colCount);
           const cellPadding = parseInt(content.padding) || 20;
           const colsBgStyle = getBgStyle(content);
           const colsBgAttr = content.bgImageUrl ? ` background="${content.bgImageUrl}"` : '';
           
           let colsInner = '';
           for (let i = 0; i < colCount; i++) {
             let colContent = '';
             if (content.cols && content.cols[i]) {
               colContent = content.cols[i].map(b => `<tr><td style="padding: 10px 0;">${renderNestedBlock(b, bFont)}</td></tr>`).join('');
             }
             colsInner += `
               <td width="${colWidth}%" style="width: ${colWidth}%; vertical-align: ${content.align === 'middle' ? 'middle' : content.align === 'bottom' ? 'bottom' : 'top'}; padding: ${cellPadding}px;">
                 <table width="100%" border="0" cellspacing="0" cellpadding="0">
                   ${colContent}
                 </table>
               </td>`;
           }
           
           blockHtml = `
             <tr>
               <td ${colsBgAttr} style="${colsBgStyle} padding: 0;">
                 <table width="100%" border="0" cellspacing="0" cellpadding="0" style="width: 100% !important;">
                   <tr>
                     ${colsInner}
                   </tr>
                 </table>
               </td>
            </tr>`;
           break;

case 'button':
           const btnRadius = parseInt(content.borderRadius) || 6;
           const btnPaddingY = parseInt(content.paddingY) || 15;
           const btnPaddingX = parseInt(content.paddingX) || 30;
           const btnFontSize = Math.max(parseInt(content.fontSize) || 16, 14);
           const btnAlign = content.align || 'center';
           const btnFontFamily = (content.fontFamily && content.fontFamily !== 'inherit') ? content.fontFamily : 'Arial, sans-serif';
           const btnTextColor = content.textColor || '#ffffff';
           const btnBgColor = content.buttonBgColor || '#e11d48';
           const btnText = content.text || 'Botón';
           const btnUrl = content.url || '#';
           const btnWeight = content.fontWeight === 'bold' ? 'bold' : 'normal';
           const btnPadding = parseInt(content.padding) || 10;
           const btnContainerBgStyle = getBgStyle({ bgColor: content.containerBgColor, bgImageUrl: content.bgImageUrl, bgSize: content.bgSize, bgPosition: content.bgPosition });
           const btnBgAttr = content.bgImageUrl ? ` background="${content.bgImageUrl}"` : '';
           
           blockHtml = `
             <tr>
               <td ${btnBgAttr} align="${btnAlign}" style="${btnContainerBgStyle} padding: ${btnPadding}px;">
                 <table border="0" cellspacing="0" cellpadding="0" align="${btnAlign}">
                   <tr>
                     <td style="background-color: ${btnBgColor}; border-radius: ${btnRadius}px; -webkit-border-radius: ${btnRadius}px; -moz-border-radius: ${btnRadius}px;">
                       <table border="0" cellspacing="0" cellpadding="0">
                         <tr>
                           <td style="padding: ${btnPaddingY}px ${btnPaddingX}px; background-color: ${btnBgColor}; border-radius: ${btnRadius}px; -webkit-border-radius: ${btnRadius}px; -moz-border-radius: ${btnRadius}px;">
                             <a href="${btnUrl}" target="_blank" style="display: inline-block; background-color: ${btnBgColor}; color: ${btnTextColor}; font-family: ${btnFontFamily}; font-size: ${btnFontSize}px; font-weight: ${btnWeight}; text-decoration: none; border-radius: ${btnRadius}px;">
                               <!--[if mso]>
                               <span style="color: ${btnTextColor}; font-family: Arial, sans-serif; font-size: ${btnFontSize}px; font-weight: ${btnWeight};">${btnText}</span>
                               <![endif]-->
                               <![if !mso]>
                               <span style="color: ${btnTextColor}; font-family: ${btnFontFamily}; font-size: ${btnFontSize}px; font-weight: ${btnWeight};">${btnText}</span>
                               <![endif]>
                             </a>
                           </td>
                         </tr>
                       </table>
                     </td>
                   </tr>
                 </table>
               </td>
            </tr>`;
           break;

        case 'divider':
           const divHeight = Math.max(parseInt(content.height) || 1, 1);
           const divBgStyle = getBgStyle(content);
           const divBgAttr = content.bgImageUrl ? ` background="${content.bgImageUrl}"` : '';
           blockHtml = `
             <tr>
               <td ${divBgAttr} style="${divBgStyle} padding: ${padding}px;">
                 <table width="100%" border="0" cellspacing="0" cellpadding="0">
                   <tr>
                     <td style="border-top: ${divHeight}px ${content.borderStyle || 'solid'} ${content.color || '#e5e7eb'}; font-size: 1px; line-height: 1px; height: ${divHeight}px;">&nbsp;</td>
                   </tr>
                 </table>
               </td>
            </tr>`;
           break;

        case 'spacer':
           const spacerHeight = Math.max(parseInt(content.height) || 30, 10);
           const spacerBgStyle = getBgStyle(content);
           const spacerBgAttr = content.bgImageUrl ? ` background="${content.bgImageUrl}"` : '';
           blockHtml = `
             <tr>
               <td ${spacerBgAttr} style="${spacerBgStyle} height: ${spacerHeight}px; font-size: 1px; line-height: ${spacerHeight}px;">&nbsp;</td>
            </tr>`;
           break;

case 'social':
           const iconSize = Math.max(parseInt(content.iconSize) || 24, 16);
           const socialRadius = parseInt(content.borderRadius) || 8;
           const socialAlign = content.align || 'center';
           const socialBgStyle = getBgStyle(content);
           const socialBgAttr = content.bgImageUrl ? ` background="${content.bgImageUrl}"` : '';
           
           let socialIcons = '';
           if (content.networks && content.networks.length > 0) {
             content.networks.forEach(n => {
               const cfg = SOCIAL_CONFIG[n.network];
               if (cfg) {
                 const colorHex = (n.iconColor || '#ffffff').replace('#', '');
                 socialIcons += `
                   <td style="padding: 5px;">
                     <a href="${n.url}" target="_blank">
                       <table border="0" cellspacing="0" cellpadding="0">
                         <tr>
                           <td width="${iconSize + 16}" height="${iconSize + 16}" style="background-color: ${n.bgColor || cfg.defaultBg}; border-radius: ${socialRadius}px; text-align: center; vertical-align: middle;">
                             <img src="https://img.icons8.com/ios-filled/50/${colorHex}/${cfg.iconName}.png" width="${iconSize}" height="${iconSize}" style="display: block; margin: 8px auto;" alt="${cfg.label}" />
                           </td>
                         </tr>
                       </table>
                     </a>
                   </td>`;
               }
             });
           }

           blockHtml = `
             <tr>
               <td ${socialBgAttr} align="${socialAlign}" style="${socialBgStyle} padding: ${padding}px;">
                 <table border="0" cellspacing="0" cellpadding="0" align="${socialAlign}">
                   <tr>
                     ${socialIcons}
                   </tr>
                 </table>
               </td>
            </tr>`;
           break;

         case 'html':
           let htmlContent = content.code || '';
           // Si es una sección completa importada de Envato, extraer solo el body
           if (htmlContent.includes('<!DOCTYPE') || htmlContent.includes('<html')) {
             const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
             htmlContent = bodyMatch ? bodyMatch[1].trim() : htmlContent;
           }
           const mapMatch = htmlContent.match(/google\.com\/maps\/embed\?pb=([^"'\s]+)/);
           const htmlBgStyle = getBgStyle(content);
           const htmlBgAttr = content.bgImageUrl ? ` background="${content.bgImageUrl}"` : '';
           
           if (mapMatch || htmlContent.includes('google.com/maps')) {
             blockHtml = `
               <tr>
                 <td ${htmlBgAttr} align="center" style="${htmlBgStyle} padding: ${padding}px;">
                   <a href="https://www.google.com/maps" target="_blank" style="display: block; border: 0; text-decoration: none;">
                     <table border="0" cellspacing="0" cellpadding="0">
                       <tr>
                         <td style="background-color: #E8F4E8; padding: 30px; border-radius: ${parseInt(content.borderRadius) || 8}px; text-align: center;">
                           <img src="https://maps.gstatic.com/tactile/icons/geo_pinlet-2x.png" alt="Mapa" style="display: block; margin: 0 auto 15px auto;" />
                           <p style="color: #1a7f1a; font-size: 16px; font-family: Arial, sans-serif; margin: 0; font-weight: bold;">📍 Ver ubicación en Google Maps</p>
                         </td>
                       </tr>
                     </table>
                   </a>
                 </td>
               </tr>`;
           } else {
              // Renderizar el HTML directamente (secciones de Envato, HTML custom, etc.)
              blockHtml = `
                <tr>
                  <td ${htmlBgAttr} style="${htmlBgStyle} padding: 0;">
                    ${htmlContent}
                  </td>
                </tr>`;
           }
           break;

         case 'receipt': {
           const rc = content;
           const bg = rc.bgColor || '#111111';
           const accent = rc.accentColor || '#4ade80';
           const hBg = rc.headerBg || '#1a1a1a';
           const r1 = rc.rowBg1 || '#141414';
           const r2 = rc.rowBg2 || '#111111';
           const tBg = rc.totalBg || '#0a1a0f';
           const items = rc.items || [];
           const rowsHtml = items.map((item, i) => {
             const bg_ = i % 2 === 0 ? r1 : r2;
             const imgHtml = item.imagen
               ? `<img src="${item.imagen}" alt="${item.nombre}" width="40" height="40" style="display:inline-block;vertical-align:middle;border-radius:8px;object-fit:cover;border:1px solid #333333;margin-right:10px;" />`
               : '';
             return `
               <tr style="background-color:${bg_};">
                 <td style="padding:12px 16px;border-top:1px solid #222222;font-family:Arial,sans-serif;">
                   <table border="0" cellspacing="0" cellpadding="0"><tr>
                     ${item.imagen ? `<td style="padding-right:10px;vertical-align:middle;">${imgHtml}</td>` : ''}
                     <td style="vertical-align:middle;">
                       <p style="margin:0;font-size:13px;font-weight:700;color:#ffffff;font-family:Arial,sans-serif;">${item.nombre}</p>
                       <p style="margin:3px 0 0;font-size:11px;color:#6b7280;font-family:Arial,sans-serif;">${item.categoria}</p>
                     </td>
                   </tr></table>
                 </td>
                 <td style="padding:12px 16px;text-align:center;font-size:13px;color:#9ca3af;border-top:1px solid #222222;font-family:Arial,sans-serif;">1</td>
                 <td style="padding:12px 16px;text-align:right;font-size:14px;font-weight:900;color:${accent};border-top:1px solid #222222;font-family:Arial,sans-serif;">$${item.precio}</td>
               </tr>`;
           }).join('');
           const discountRow = rc.showDiscount ? `
             <tr style="background-color:${hBg};">
               <td colspan="2" style="padding:6px 16px 12px;font-size:12px;color:#f59e0b;text-align:right;font-family:Arial,sans-serif;">Descuento (${rc.cuponVar || '{{cupon}}'})</td>
               <td style="padding:6px 16px 12px;text-align:right;font-size:13px;font-weight:700;color:#f59e0b;font-family:Arial,sans-serif;">-$${rc.descuentoVar || '{{descuento_monto}}'}</td>
             </tr>` : '';
           blockHtml = `
             <tr>
               <td style="background-color:${bg};padding:${rc.padding || '24px'};">
                 <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-family:Arial,sans-serif;">
                   <tr style="background-color:${hBg};">
                     <td style="padding:10px 16px;font-size:10px;font-weight:900;color:#6b7280;letter-spacing:2px;text-transform:uppercase;width:55%;">Producto</td>
                     <td style="padding:10px 16px;font-size:10px;font-weight:900;color:#6b7280;letter-spacing:2px;text-transform:uppercase;text-align:center;width:15%;">Cant.</td>
                     <td style="padding:10px 16px;font-size:10px;font-weight:900;color:#6b7280;letter-spacing:2px;text-transform:uppercase;text-align:right;width:30%;">Precio</td>
                   </tr>
                   ${rowsHtml}
                   <tr style="background-color:${hBg};">
                     <td colspan="2" style="padding:12px 16px;font-size:12px;color:#6b7280;text-align:right;border-top:1px solid #222222;font-family:Arial,sans-serif;">Subtotal</td>
                     <td style="padding:12px 16px;text-align:right;font-size:13px;font-weight:700;color:#9ca3af;border-top:1px solid #222222;font-family:Arial,sans-serif;">$${rc.subtotalVar || '{{subtotal}}'}</td>
                   </tr>
                   ${discountRow}
                   <tr style="background-color:${tBg};">
                     <td colspan="2" style="padding:16px;font-size:11px;font-weight:900;color:${accent};letter-spacing:2px;text-transform:uppercase;text-align:right;font-family:Arial,sans-serif;">TOTAL PAGADO</td>
                     <td style="padding:16px;text-align:right;font-size:22px;font-weight:900;color:${accent};font-family:Arial,sans-serif;">$${rc.totalVar || '{{total}}'}</td>
                   </tr>
                 </table>
                 <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top:10px;font-family:Arial,sans-serif;">
                   <tr>
                     <td width="49%" style="padding:14px 16px;background-color:#161616;border-radius:10px;">
                       <p style="margin:0;font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:2px;font-weight:900;font-family:Arial,sans-serif;">Método de Pago</p>
                       <p style="margin:6px 0 0;font-size:13px;font-weight:700;color:#ffffff;font-family:Arial,sans-serif;">${rc.metodoPagoVar || '{{metodo_pago}}'}</p>
                     </td>
                     <td width="2%"></td>
                     <td width="49%" style="padding:14px 16px;background-color:#161616;border-radius:10px;">
                       <p style="margin:0;font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:2px;font-weight:900;font-family:Arial,sans-serif;">Fecha</p>
                       <p style="margin:6px 0 0;font-size:13px;font-weight:700;color:#ffffff;font-family:Arial,sans-serif;">${rc.fechaVar || '{{fecha}}'}</p>
                     </td>
                   </tr>
                 </table>
               </td>
             </tr>`;
           break;
         }

         case 'footer':
           const footerFontSize = Math.max(parseInt(content.fontSize) || 12, 10);
           const footerFont = content.fontFamily && content.fontFamily !== 'inherit' ? content.fontFamily : bFont;
           const footerAlign = content.align || 'center';
           const footerBgStyle = getBgStyle(content);
           const footerBgAttr = content.bgImageUrl ? ` background="${content.bgImageUrl}"` : '';
           blockHtml = `
             <tr>
               <td ${footerBgAttr} align="${footerAlign}" style="${footerBgStyle} padding: ${padding}px;">
                 <p align="${footerAlign}" style="color: ${content.textColor || '#6b7280'}; font-size: ${footerFontSize}px; font-family: ${footerFont}, Arial, sans-serif; margin: 0; line-height: 1.5; text-align: ${footerAlign};">
                   ${content.text ? content.text.replace(/\n/g, '<br/>') : ''}
                 </p>
               </td>
            </tr>`;
           break;

        default:
          blockHtml = '';
      }

      return blockHtml;
    };

    const renderNestedBlock = (block, parentFont) => {
      const { type, content } = block;
      // Email clients only support web-safe fonts reliably
      const bFont = (content.fontFamily && content.fontFamily !== 'inherit') 
        ? content.fontFamily 
        : (parentFont && parentFont !== 'inherit' ? parentFont : 'Arial, Helvetica, sans-serif');

      switch (type) {
        case 'text':
          const nestTextAlign = content.align || 'left';
          const nestTextSize = Math.max(parseInt(content.fontSize) || 14, 12);
          const nestTextColor = content.textColor || '#333333';
          const nestTextWeight = content.fontWeight || 'normal';
          return `<p align="${nestTextAlign}" style="color: ${nestTextColor}; font-size: ${nestTextSize}px; font-weight: ${nestTextWeight}; text-align: ${nestTextAlign}; margin: 0 0 10px 0; font-family: ${bFont}; line-height: 1.4;">${content.text ? content.text.replace(/\n/g, '<br/>') : ''}</p>`;
        
        case 'image':
          const nestImgW = Math.min(parseInt(content.width) || 100, 100);
          const nestImgRadius = parseInt(content.borderRadius) || 0;
          const nestImgAlign = content.align || 'center';
          return `<table border="0" cellspacing="0" cellpadding="0" align="${nestImgAlign}" style="width: ${nestImgW}%;">
            <tr>
              <td>
                ${content.linkUrl ? `<a href="${content.linkUrl}" target="_blank" style="display: block; border: 0;">` : ''}
                <img src="${content.imageUrl}" alt="${content.altText || ''}" style="display: block; max-width: 100%; height: auto; border: 0; border-radius: ${nestImgRadius}px;" />
                ${content.linkUrl ? '</a>' : ''}
              </td>
            </tr>
          </table>`;
        
        case 'button':
          const btnPdY = parseInt(content.paddingY) || 10;
          const btnPdX = parseInt(content.paddingX) || 20;
          const btnFs = Math.max(parseInt(content.fontSize) || 14, 12);
          const nestBtnAlign = content.align || 'center';
          const nestBtnFont = (content.fontFamily && content.fontFamily !== 'inherit') ? content.fontFamily : 'Arial, sans-serif';
          const nestBtnColor = content.textColor || '#ffffff';
          const nestBtnBg = content.buttonBgColor || '#e11d48';
          const nestBtnText = content.text || 'Botón';
          const nestBtnWeight = content.fontWeight === 'bold' ? 'bold' : 'normal';
          
          return `<table border="0" cellspacing="0" cellpadding="0" align="${nestBtnAlign}" style="width: 100%;">
            <tr>
              <td align="center" style="background-color: ${nestBtnBg}; border-radius: ${parseInt(content.borderRadius) || 6}px; padding: ${btnPdY}px ${btnPdX}px;">
                <a href="${content.url || '#'}" target="_blank" style="display: inline-block; background-color: ${nestBtnBg}; color: ${nestBtnColor}; font-family: ${nestBtnFont}; font-size: ${btnFs}px; font-weight: ${nestBtnWeight}; text-decoration: none;">
                  ${nestBtnText}
                </a>
              </td>
            </tr>
          </table>`;
        
        case 'video':
          return `<a href="${content.videoUrl || '#'}" target="_blank" style="display: block;">
            <img src="${content.coverUrl}" alt="Video" style="display: block; max-width: 100%; height: auto; border-radius: ${parseInt(content.borderRadius) || 0}px;" />
          </a>`;
        
        case 'social':
          return `<p style="font-size: 12px; color: #666;">[Bloque Social]</p>`;
        
        case 'divider':
          return `<div style="border-top: ${parseInt(content.height) || 1}px ${content.borderStyle || 'solid'} ${content.color || '#e5e7eb'}; margin: 10px 0;"></div>`;
        
        default:
          return '';
      }
    };

    const blocksHtml = blocks.map(b => renderBlockHTML(b)).join('\n');

    return `<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title></title>
  <style>
    /* CLIENT-SPECIFIC STYLES */
    body, table, td, p, a, li { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }
    @media only screen and (max-width: 480px) {
      .mobile-padding { padding: 20px 10px !important; }
      .mobile-full { width: 100% !important; display: block !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${bodyBg}; font-family: ${safeFontFamily};">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: ${bodyBg};">
    <tr>
      <td align="center" style="padding: 20px 10px;">
        <table width="${safeWidth}" border="0" cellspacing="0" cellpadding="0" style="max-width: ${safeWidth}px; width: 100%; background-color: ${containerBg}; border-radius: 8px;">
          ${blocksHtml}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  };

  const selInfo = selectedBlockId ? findBlockInfo(blocks, selectedBlockId) : null;
  const selectedBlock = selInfo ? selInfo.block : null;

  return (
    <div id="blismail-cms-root" className={`flex flex-col h-screen font-sans overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'dark bg-[#0a0a0a] text-gray-200' : 'bg-gray-100 text-gray-800'}`}>
      
      {/* HEADER CMS */}
      <header className="flex items-center justify-between px-4 py-3 bg-white dark:bg-[#111111] border-b border-gray-200 dark:border-[#222222] shadow-sm z-20 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-[#e11d48] rounded-lg flex items-center justify-center shadow-md">
            <Mail className="text-white w-5 h-5" />
          </div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">BlisMail <span className="text-[#e11d48] font-black">CMS</span></h1>
        </div>

        <div className="hidden md:flex bg-gray-100 dark:bg-[#161616] p-1 rounded-lg border border-gray-200 dark:border-[#262626]">
          <button onClick={() => setPreviewMode('desktop')} title="Escritorio" className={`p-2 rounded-md flex items-center justify-center transition-all ${previewMode === 'desktop' ? 'bg-white dark:bg-[#222222] shadow-sm text-[#e11d48]' : 'text-gray-500'}`}>
            <Monitor size={18} />
          </button>
          <button onClick={() => setPreviewMode('mobile')} title="Móvil" className={`p-2 rounded-md flex items-center justify-center transition-all ${previewMode === 'mobile' ? 'bg-white dark:bg-[#222222] shadow-sm text-[#e11d48]' : 'text-gray-500'}`}>
            <Smartphone size={18} />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} title={theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'} className="p-2 rounded-full bg-gray-100 dark:bg-[#161616] border border-gray-200 dark:border-[#262626] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#222]">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <button onClick={() => setShowSettingsModal(true)} title="Configuración de Remitentes" className="p-2 rounded-full bg-gray-100 dark:bg-[#161616] border border-gray-200 dark:border-[#262626] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#222]">
            <Settings size={18} />
          </button>
          
          <button onClick={handleNewTemplate} title="Nueva Plantilla en Blanco" className="p-2 flex items-center justify-center bg-white dark:bg-[#161616] border border-gray-300 dark:border-[#262626] text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-[#222]">
            <Plus size={18} />
          </button>
          
          <button onClick={() => setShowTemplatesModal(true)} title="Cargar Plantillas" className="p-2 flex items-center justify-center bg-white dark:bg-[#161616] border border-gray-300 dark:border-[#262626] text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-[#222]">
            <FolderOpen size={18} />
          </button>
          
          <input type="file" ref={fileInputRef} onChange={importTemplate} accept=".json" className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} title="Importar JSON" className="p-2 flex items-center justify-center bg-white dark:bg-[#161616] border border-gray-300 dark:border-[#262626] text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-[#222]">
            <Upload size={18} />
          </button>
          
          <button onClick={() => setShowSaveModal(true)} title="Guardar Plantilla" className="p-2 flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white rounded-md">
            <Database size={18} />
          </button>
          
          <button onClick={() => setShowExportHtml(true)} title="Exportar HTML" className="p-2 flex items-center justify-center bg-[#e11d48] hover:bg-[#be123c] text-white rounded-md transition-colors">
            <Code size={18} />
          </button>
          
          <button onClick={() => setShowSendModal(true)} title="Enviar Campaña" className="p-2 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
            <Send size={18} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        
        {/* PANEL IZQUIERDO */}
        <aside className="w-64 bg-white dark:bg-[#111111] border-r border-gray-200 dark:border-[#222222] flex flex-col flex-shrink-0 z-10">

          {/* Tabs superiores */}
          <div className="flex border-b border-gray-200 dark:border-[#222222] bg-gray-50 dark:bg-[#161616]">
            <button
              onClick={() => setLeftPanelTab('blocks')}
              className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-colors ${leftPanelTab === 'blocks' ? 'border-[#e11d48] text-[#e11d48] bg-white dark:bg-[#111111]' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              <Layers size={13} /> Bloques
            </button>
            <button
              onClick={() => { setLeftPanelTab('envato'); if (envatoResults.length === 0) searchEnvato(envatoQuery); if (!envatoStatus) checkEnvatoStatus(); }}
              className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-colors ${leftPanelTab === 'envato' ? 'border-[#82b440] text-[#82b440] bg-white dark:bg-[#111111]' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              <FolderOpen size={13} /> Envato
            </button>
          </div>

          {/* ── TAB BLOQUES ── */}
          {leftPanelTab === 'blocks' && (
            <div className="p-2 grid grid-cols-3 gap-1 overflow-y-auto custom-scrollbar flex-1" style={{ gridAutoRows: '48px' }}>
              {AVAILABLE_BLOCKS.map(block => {
                const IconComp = block.Icon;
                return (
                  <button
                    key={block.type}
                    onClick={() => addBlock(block.type)}
                    title={block.label}
                    className="flex flex-col items-center justify-center h-full bg-gray-50 dark:bg-[#161616] border border-gray-200 dark:border-[#262626] hover:border-[#e11d48] hover:bg-red-50 dark:hover:bg-[#1a0a0a] text-gray-500 dark:text-gray-400 hover:text-[#e11d48] rounded-lg transition-all group"
                  >
                    <IconComp size={14} className="mb-0.5 group-hover:text-[#e11d48]" />
                    <span className="text-[9px] font-bold leading-none">{block.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* ── TAB ENVATO ── */}
          {leftPanelTab === 'envato' && (
            <div className="flex flex-col flex-1 p-3 gap-3">

              {/* 1. Ir a Envato Elements con filtro */}
              <button
                onClick={() => window.open('https://app.envato.com/search?itemType=web-templates&term=&filter.categories=Email+Templates&sort=popular', '_blank')}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#82b440] hover:bg-[#6c9635] text-white rounded-xl text-[11px] font-black uppercase tracking-wide transition-all shadow"
              >
                <FolderOpen size={13} /> Abrir Envato Elements
              </button>

              <div className="text-center">
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  Descarga el <b className="text-gray-300">.zip</b> de la plantilla y súbelo abajo
                </p>
              </div>

              {/* 2. Subir ZIP */}
              <input
                type="file" accept=".html,.zip,.rar" id="envato-import-sidebar" className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  e.target.value = '';
                  if (file.name.toLowerCase().endsWith('.zip')) { processZipFile(file); return; }
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    const html = ev.target.result;
                    if (!html) return;
                    importFromHTML(html, PLATFORM_LABELS_MAP[detectEnvatoPlatform(html)] || 'HTML Genérico');
                  };
                  reader.readAsText(file);
                }}
              />
              <button
                onClick={() => document.getElementById('envato-import-sidebar').click()}
                disabled={zipLoading}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-[#82b440]/50 hover:border-[#82b440] text-[#82b440] hover:bg-[#82b440]/5 disabled:opacity-60 rounded-xl text-[11px] font-bold transition-all"
              >
                {zipLoading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                {zipLoading ? 'Procesando...' : 'Subir .zip / .html'}
              </button>

            </div>
          )}
        </aside>

        {/* LIENZO CENTRAL */}
        <main className="flex-1 overflow-y-auto bg-gray-200 dark:bg-[#16161a] custom-scrollbar-main relative" onClick={() => setSelectedBlockId(null)}>
          <div className="flex flex-col items-center min-h-full pb-20 pt-10" style={{ backgroundColor: settings.bodyBg }}>
            
            {/* Banner modo demo */}
            {previewWithDemo && (
              <div className="w-full max-w-[600px] mb-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-2.5 flex items-center gap-2 text-amber-400 text-xs font-bold">
                <Play size={12} className="flex-shrink-0" />
                Vista previa con datos demo activa — las variables muestran valores de ejemplo
              </div>
            )}

            {blocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[50vh] text-gray-400 opacity-60">
                <Layers size={64} className="mb-4" />
                <h3 className="text-xl font-bold">Lienzo en Blanco</h3>
                <p className="text-sm">Arrastra o haz clic en un elemento del panel izquierdo para comenzar.</p>
              </div>
            ) : (
              <div 
                className={`shadow-2xl transition-all duration-300 relative bg-white dark:bg-[#111111]`}
                style={{ 
                  fontFamily: settings.fontFamily,
                  width: previewMode === 'mobile' ? '375px' : `${settings.width}px`,
                  minHeight: '600px',
                  backgroundColor: settings.containerBg,
                  borderRadius: previewMode === 'mobile' ? '30px' : '8px',
                  border: previewMode === 'mobile' ? '12px solid #222222' : 'none',
                  overflow: 'hidden'
                }}
              >
                {displayBlocks.map((block, index) => (
                  <div 
                    key={block.id} 
                    className={`relative group border-2 transition-colors ${selectedBlockId === block.id ? 'border-[#e11d48] z-10' : 'border-transparent hover:border-[#e11d48]/40'}`}
                    onClick={(e) => { e.stopPropagation(); setSelectedBlockId(block.id); setActiveTab('blocks'); }}
                    style={{ marginBottom: index < displayBlocks.length - 1 ? `${settings.sectionGap}px` : 0 }}
                  >
                    <div className={`absolute right-0 top-0 translate-x-full ml-1 flex-col space-y-1 bg-white dark:bg-[#161616] p-1 rounded-lg shadow-xl border border-gray-200 dark:border-[#333333] z-50 ${selectedBlockId === block.id ? 'flex' : 'hidden group-hover:flex'}`}>
                      <button onClick={(e) => moveBlock(block.id, 'up', e)} className="p-1 text-gray-500 hover:text-[#e11d48]" disabled={index === 0}><ArrowUp size={16} /></button>
                      <button onClick={(e) => moveBlock(block.id, 'down', e)} className="p-1 text-gray-500 hover:text-[#e11d48]" disabled={index === blocks.length - 1}><ArrowDown size={16} /></button>
                      <button onClick={(e) => removeBlock(block.id, e)} className="p-1 text-red-500"><Trash2 size={16} /></button>
                    </div>
                    <BlockRenderer block={block} settings={settings} selectedBlockId={selectedBlockId} setSelectedBlockId={setSelectedBlockId} updateTree={updateBlockTree} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* PANEL DERECHO - PROPIEDADES */}
        <aside className="w-80 bg-white dark:bg-[#111111] border-l border-gray-200 dark:border-[#222222] flex flex-col flex-shrink-0 z-10">
          <div className="flex border-b border-gray-200 dark:border-[#222222] bg-gray-50 dark:bg-[#161616]">
            <button onClick={() => setActiveTab('blocks')} className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'blocks' ? 'border-[#e11d48] text-[#e11d48] bg-white dark:bg-[#111111]' : 'border-transparent text-gray-500'}`}>
              <MousePointerClick size={16} /> Edición
            </button>
            <button onClick={() => { setActiveTab('global'); setSelectedBlockId(null); }} className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'global' ? 'border-[#e11d48] text-[#e11d48] bg-white dark:bg-[#111111]' : 'border-transparent text-gray-500'}`}>
              <Settings size={16} /> Global
            </button>
            <button onClick={() => { setActiveTab('variables'); setSelectedBlockId(null); }} className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'variables' ? 'border-[#f59e0b] text-[#f59e0b] bg-white dark:bg-[#111111]' : 'border-transparent text-gray-500'}`}>
              <Database size={16} /> Variables
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
            {activeTab === 'envato' && (
              <div className="space-y-6">
                <div className="bg-[#82b440]/10 border border-[#82b440]/30 rounded-lg p-4 mb-4 text-center">
                  <h3 className="text-[#82b440] font-bold text-sm mb-2 flex items-center justify-center gap-2">
                    <FolderOpen size={16} /> Envato Market
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                    Importa tu plantilla de Envato directamente seleccionando el archivo .html que descargaste.
                  </p>
                  
                  <input 
                    type="file" 
                    accept=".html" 
                    id="envato-import" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const htmlCode = event.target.result;
                        if(htmlCode) {
                          const newBlock = { id: getUniqueId('html'), type: 'html', content: { ...getDefaultContent('html', activePalette), code: htmlCode } };
                          setBlocks([...blocks, newBlock]);
                          setSelectedBlockId(newBlock.id);
                          setActiveTab('blocks');
                        }
                      };
                      reader.readAsText(file);
                      // e.target.value = ''; // reset
                    }} 
                  />
                  <button 
                    onClick={() => document.getElementById('envato-import').click()}
                    className="w-full bg-[#82b440] hover:bg-[#6c9635] text-white py-2 rounded font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <Upload size={14} /> Importar Archivo .HTML
                  </button>
                </div>
                
                <div className="text-xs text-gray-500 dark:text-gray-400 italic text-center">
                  Nota: El código HTML importado funcionará como un solo bloque grande en nuestro editor visual. Puedes usar las opciones de &quot;Añadir Bloque&quot; arriba y abajo para extenderlo usando nuestras herramientas nativas.
                </div>
              </div>
            )}

            {activeTab === 'variables' && (
              <div className="space-y-5">
                {/* Header */}
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                  <h3 className="text-amber-400 font-black text-xs uppercase tracking-widest mb-1 flex items-center gap-2">
                    <Database size={14} /> Variables Disponibles
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Haz clic en una variable para copiarla. Escríbela en cualquier bloque de texto con <code className="text-amber-400 bg-black/40 px-1 rounded">{'{{nombre}}'}</code> y se reemplazará automáticamente al enviar.
                  </p>
                </div>

                {/* Toggle vista previa demo */}
                <div className="flex items-center justify-between bg-gray-100 dark:bg-[#1a1a1a] rounded-xl p-3">
                  <div>
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-200">Vista previa con datos demo</p>
                    <p className="text-[10px] text-gray-500">Ver cómo se verá el email con datos reales</p>
                  </div>
                  <button
                    onClick={() => setPreviewWithDemo(p => !p)}
                    className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${previewWithDemo ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${previewWithDemo ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>

                {/* Grupos de variables */}
                {[
                  {
                    label: '👤 Cliente',
                    color: 'text-sky-400',
                    bg: 'bg-sky-500/10 border-sky-500/20',
                    vars: [
                      { key: 'nombre', desc: 'Nombre completo del cliente' },
                      { key: 'email', desc: 'Email del cliente' },
                      { key: 'telefono', desc: 'Teléfono / WhatsApp' },
                      { key: 'ciudad', desc: 'Ciudad del cliente' },
                    ]
                  },
                  {
                    label: '🔐 Acceso y Cuenta',
                    color: 'text-emerald-400',
                    bg: 'bg-emerald-500/10 border-emerald-500/20',
                    vars: [
                      { key: 'password', desc: 'Contraseña temporal generada' },
                      { key: 'enlace_acceso', desc: 'URL para acceder a la cuenta' },
                      { key: 'enlace_baja', desc: 'URL para darse de baja' },
                    ]
                  },
                  {
                    label: '🛒 Compra',
                    color: 'text-blis-red',
                    bg: 'bg-red-500/10 border-red-500/20',
                    vars: [
                      { key: 'total', desc: 'Monto total pagado (sin $)' },
                      { key: 'subtotal', desc: 'Subtotal antes de descuento' },
                      { key: 'descuento_monto', desc: 'Monto del descuento' },
                      { key: 'metodo_pago', desc: 'Método de pago usado' },
                      { key: 'fecha', desc: 'Fecha de la compra' },
                    ]
                  },
                  {
                    label: '📦 Productos (Recibo)',
                    color: 'text-orange-400',
                    bg: 'bg-orange-500/10 border-orange-500/20',
                    vars: [
                      { key: 'producto_1_nombre', desc: 'Nombre del producto 1' },
                      { key: 'producto_1_categoria', desc: 'Categoría del producto 1' },
                      { key: 'producto_1_precio', desc: 'Precio del producto 1' },
                      { key: 'producto_1_imagen', desc: 'URL imagen miniatura producto 1' },
                      { key: 'producto_2_nombre', desc: 'Nombre del producto 2' },
                      { key: 'producto_2_categoria', desc: 'Categoría del producto 2' },
                      { key: 'producto_2_precio', desc: 'Precio del producto 2' },
                      { key: 'producto_2_imagen', desc: 'URL imagen miniatura producto 2' },
                      { key: 'producto_3_nombre', desc: 'Nombre del producto 3' },
                      { key: 'producto_3_categoria', desc: 'Categoría del producto 3' },
                      { key: 'producto_3_precio', desc: 'Precio del producto 3' },
                      { key: 'producto_3_imagen', desc: 'URL imagen miniatura producto 3' },
                    ]
                  },
                  {
                    label: '🎁 Ofertas y Campañas',
                    color: 'text-amber-400',
                    bg: 'bg-amber-500/10 border-amber-500/20',
                    vars: [
                      { key: 'campana', desc: 'Nombre de la campaña' },
                      { key: 'descuento', desc: 'Porcentaje de descuento' },
                      { key: 'cupon', desc: 'Código de cupón' },
                      { key: 'vencimiento', desc: 'Fecha de vencimiento de oferta' },
                    ]
                  },
                  {
                    label: '🏢 Empresa',
                    color: 'text-purple-400',
                    bg: 'bg-purple-500/10 border-purple-500/20',
                    vars: [
                      { key: 'empresa', desc: 'Nombre de la empresa' },
                      { key: 'whatsapp', desc: 'WhatsApp de contacto' },
                    ]
                  },
                ].map(group => (
                  <div key={group.label} className={`rounded-xl border p-3 ${group.bg}`}>
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${group.color}`}>{group.label}</p>
                    <div className="space-y-1">
                      {group.vars.map(v => (
                        <button
                          key={v.key}
                          onClick={() => {
                            navigator.clipboard.writeText(`{{${v.key}}}`);
                          }}
                          title={`Clic para copiar {{${v.key}}}`}
                          className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-black/20 hover:bg-black/40 transition-colors group text-left"
                        >
                          <div className="min-w-0">
                            <code className={`text-[11px] font-black ${group.color}`}>{`{{${v.key}}}`}</code>
                            <p className="text-[10px] text-gray-500 truncate">{v.desc}</p>
                          </div>
                          <Copy size={11} className="text-gray-600 group-hover:text-gray-300 transition-colors flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Datos demo editables */}
                <div className="border border-white/10 rounded-xl overflow-hidden">
                  <div className="bg-[#1a1a1a] px-4 py-2.5 flex items-center justify-between">
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400">Datos de Demostración</p>
                    <p className="text-[9px] text-gray-600">Edita para previsualizar</p>
                  </div>
                  <div className="p-3 space-y-2 max-h-72 overflow-y-auto">
                    {Object.entries(demoData).map(([key, value]) => (
                      <div key={key}>
                        <label className="text-[9px] text-gray-600 uppercase font-bold mb-0.5 block">{key}</label>
                        {key === 'productos' ? (
                          <textarea
                            value={value}
                            onChange={e => setDemoData(d => ({ ...d, [key]: e.target.value }))}
                            rows={3}
                            className="w-full bg-[#111] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-500/50 resize-none font-mono"
                          />
                        ) : (
                          <input
                            value={value}
                            onChange={e => setDemoData(d => ({ ...d, [key]: e.target.value }))}
                            className="w-full bg-[#111] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-500/50 font-mono"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Botón ver previa HTML */}
                <button
                  onClick={() => {
                    const html = applyDemoData(generateHTML());
                    const win = window.open('', '_blank');
                    if (win) {
                      win.document.write(html);
                      win.document.close();
                    }
                  }}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase text-xs tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  <Play size={14} /> Ver Email con Datos Demo
                </button>
              </div>
            )}

            {activeTab === 'global' && (
              <div className="space-y-6">
                <PropertyGroup title="Asunto y Previsualización">
                  <PropertyInput label="Asunto del Correo" value={settings.subject || ''} onChange={(v) => updateSetting('subject', v)} placeholder="Ej: ¡Oferta especial para ti!" />
                  <PropertyInput label="Texto de Previsualización" value={settings.previewText || ''} onChange={(v) => updateSetting('previewText', v)} placeholder="Aparece junto al asunto en la bandeja..." />
                  <p className="text-[10px] text-gray-500 mt-1">Estos valores se usarán al enviar la plantilla.</p>
                </PropertyGroup>

                <PropertyGroup title="Todas las Paletas">
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {currentPalettes.map((p, index) => (
                      <div key={p.id} className={`relative flex flex-col rounded border-2 overflow-hidden ${settings.activePaletteId === p.id ? 'border-[#e11d48] bg-[#e11d48]/10 text-[#e11d48]' : 'border-gray-200 dark:border-[#333] text-gray-500'}`}>
                        <button onClick={() => applyPalette(p.id)} className="w-full text-xs font-bold pt-2 pb-6 px-1">
                          <div className="flex justify-center gap-1 mb-1">
                            <span className="w-3 h-3 rounded-full border" style={{background: p.bodyBg}}></span>
                            <span className="w-3 h-3 rounded-full border" style={{background: p.containerBg}}></span>
                            <span className="w-3 h-3 rounded-full" style={{background: p.primary}}></span>
                          </div>
                          {p.name}
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/5 p-1 flex justify-center items-center border-t border-gray-200 dark:border-[#333]">
                           <button onClick={(e) => movePalette(index, 'up', e)} disabled={index === 0} className="px-1 text-gray-400 hover:text-gray-600"><MoveLeft size={12}/></button>
                           <button onClick={(e) => movePalette(index, 'down', e)} disabled={index === currentPalettes.length - 1} className="px-1 text-gray-400 hover:text-gray-600"><MoveRight size={12}/></button>
                           <button onClick={(e) => startEditPalette(p, e)} className="px-1 text-gray-400 hover:text-blue-500"><Pencil size={12}/></button>
                           <button onClick={(e) => deletePalette(p.id, e)} className="px-1 text-gray-400 hover:text-red-500"><Trash2 size={12}/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={toggleCreatePalette} className="w-full py-1.5 bg-gray-100 dark:bg-[#222] text-xs font-bold rounded border-dashed border-2 border-gray-300 dark:border-[#444]">
                    {isEditingPalette && !editingPaletteId ? '- Cancelar' : '+ Añadir Nueva Paleta'}
                  </button>
                  {isEditingPalette && (
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-[#0a0a0a] border rounded-lg">
                      <PropertyInput label="Nombre" value={paletteForm.name} onChange={(v) => setPaletteForm({...paletteForm, name: v})} />
                      <div className="grid grid-cols-2 gap-2">
                        <PropertyColor label="Body" value={paletteForm.bodyBg} onChange={(v) => setPaletteForm({...paletteForm, bodyBg: v})} />
                        <PropertyColor label="Cont." value={paletteForm.containerBg} onChange={(v) => setPaletteForm({...paletteForm, containerBg: v})} />
                        <PropertyColor label="Primario" value={paletteForm.primary} onChange={(v) => setPaletteForm({...paletteForm, primary: v})} />
                        <PropertyColor label="Texto" value={paletteForm.text} onChange={(v) => setPaletteForm({...paletteForm, text: v})} />
                      </div>
                      <button onClick={savePalette} className="w-full mt-3 py-2 bg-[#e11d48] text-white text-xs font-bold rounded flex items-center justify-center gap-2">
                        <Save size={14} /> Guardar Paleta
                      </button>
                    </div>
                  )}
                </PropertyGroup>

                <PropertyGroup title="Estructura General">
                  <PropertyInput label="Ancho Correo (px)" type="number" value={settings.width} onChange={(v) => updateSetting('width', v)} />
                  <PropertySelect label="Tipografía Global" value={settings.fontFamily} onChange={(v) => updateSetting('fontFamily', v)} options={FONTS} />
                  <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 p-2 rounded text-[10px] text-yellow-700 dark:text-yellow-500">
                    ⚠️ <b>Fuentes web:</b> Solo Arial, Helvetica, Georgia, Verdana y Times New Roman funcionan en todos los clientes. Montserrat puede no aparecer en Outlook/Gmail.
                  </div>
                  <PropertyInput label="Separación de Secciones (px)" type="number" value={settings.sectionGap} onChange={(v) => updateSetting('sectionGap', parseInt(v)||0)} />
                </PropertyGroup>
              </div>
            )}

            {activeTab === 'blocks' && (
              <div className="space-y-6">
                {!selectedBlockId ? (
                  <div className="text-center text-gray-400 mt-10">
                    <MousePointerClick size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="text-sm font-medium">Selecciona un bloque para editar</p>
                  </div>
                ) : (
                  <div className="animate-fadeIn">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-[#262626] mb-4">
                      <span className="text-xs font-bold text-[#e11d48] uppercase tracking-wider bg-red-50 dark:bg-[#2a0e16] px-2 py-1 rounded">
                        Sección: {selectedBlock?.type}
                      </span>
                      <div className="flex items-center gap-1">
                        <button onClick={(e) => { e.stopPropagation(); moveBlock(selectedBlockId, 'up', e); }} className="p-1.5 text-gray-400 hover:text-[#e11d48] hover:bg-gray-100 dark:hover:bg-[#222] rounded" title="Subir">
                          <ArrowUp size={14} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); moveBlock(selectedBlockId, 'down', e); }} className="p-1.5 text-gray-400 hover:text-[#e11d48] hover:bg-gray-100 dark:hover:bg-[#222] rounded" title="Bajar">
                          <ArrowDown size={14} />
                        </button>
                        <button onClick={(e) => removeBlock(selectedBlockId, e)} className="p-1.5 bg-red-50 text-red-500 rounded" title="Eliminar">
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    </div>

                    {/* CONFIGURACIÓN DE HEADER */}
                    {selectedBlock?.type === 'header' && (
                      <PropertyGroup title="Logo">
                        <PropertyFileOrUrl 
                          label="URL del Logo" 
                          value={selectedBlock.content.logoUrl} 
                          onChange={(v) => handleUpdateContent('logoUrl', v)} 
                          onOpenGallery={() => { setShowMediaModal(true); mediaCallbackRef.current = (url) => handleUpdateContent('logoUrl', url); }}
                        />
                        <PropertyInput label="Ancho (px)" type="number" value={selectedBlock.content.logoWidth} onChange={(v) => handleUpdateContent('logoWidth', v)} />
                        <PropertyColor label="Fondo" value={selectedBlock.content.bgColor} onChange={(v) => handleUpdateContent('bgColor', v)} />
                        <PropertyInput label="Padding (px)" type="number" value={selectedBlock.content.padding} onChange={(v) => handleUpdateContent('padding', v)} />
                        <PropertyAlignment value={selectedBlock.content.align} onChange={(v) => handleUpdateContent('align', v)} />
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-[#333]">
                          <PropertyBackgroundImage 
                            bgImageUrl={selectedBlock.content.bgImageUrl}
                            bgSize={selectedBlock.content.bgSize}
                            bgPosition={selectedBlock.content.bgPosition}
                            onChange={(key, value) => handleUpdateContent(key, value)}
                            onOpenGallery={() => { setShowMediaModal(true); mediaCallbackRef.current = (url) => handleUpdateContent('bgImageUrl', url); }}
                          />
                        </div>
                      </PropertyGroup>
                    )}

                    {/* CONFIGURACIÓN DE TEXTO */}
                    {selectedBlock?.type === 'text' && (
                      <PropertyGroup title="Texto">
                        <AIGenerator blockId={selectedBlockId} currentText={selectedBlock.content.text} onGenerate={(text) => handleUpdateContent('text', text)} />
                        <PropertyTextarea label="Contenido" value={selectedBlock.content.text} onChange={(v) => handleUpdateContent('text', v)} />
                        <div className="grid grid-cols-2 gap-3">
                          <PropertyInput label="Tamaño (px)" type="number" value={selectedBlock.content.fontSize} onChange={(v) => handleUpdateContent('fontSize', v)} />
                          <PropertySelect label="Peso" value={selectedBlock.content.fontWeight} onChange={(v) => handleUpdateContent('fontWeight', v)} options={FONT_WEIGHTS} />
                        </div>
                        <PropertyColor label="Color del texto" value={selectedBlock.content.textColor} onChange={(v) => handleUpdateContent('textColor', v)} />
                        <PropertyColor label="Color de fondo" value={selectedBlock.content.bgColor} onChange={(v) => handleUpdateContent('bgColor', v)} />
                        <PropertyAlignment value={selectedBlock.content.align} onChange={(v) => handleUpdateContent('align', v)} />
                        
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-[#333]">
                          <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-2">Padding (espaciado interno)</label>
                          <div className="grid grid-cols-4 gap-2">
                            <div>
                              <label className="block text-[9px] text-gray-500 text-center">Arriba</label>
                              <input type="number" value={selectedBlock.content.paddingTop || 0} onChange={(e) => handleUpdateContent('paddingTop', parseInt(e.target.value) || 0)} className="w-full px-2 py-1 text-center text-xs border border-gray-300 dark:border-[#444] rounded bg-white dark:bg-[#0a0a0a]" />
                            </div>
                            <div>
                              <label className="block text-[9px] text-gray-500 text-center">Derecha</label>
                              <input type="number" value={selectedBlock.content.paddingRight || 0} onChange={(e) => handleUpdateContent('paddingRight', parseInt(e.target.value) || 0)} className="w-full px-2 py-1 text-center text-xs border border-gray-300 dark:border-[#444] rounded bg-white dark:bg-[#0a0a0a]" />
                            </div>
                            <div>
                              <label className="block text-[9px] text-gray-500 text-center">Abajo</label>
                              <input type="number" value={selectedBlock.content.paddingBottom || 0} onChange={(e) => handleUpdateContent('paddingBottom', parseInt(e.target.value) || 0)} className="w-full px-2 py-1 text-center text-xs border border-gray-300 dark:border-[#444] rounded bg-white dark:bg-[#0a0a0a]" />
                            </div>
                            <div>
                              <label className="block text-[9px] text-gray-500 text-center">Izquierda</label>
                              <input type="number" value={selectedBlock.content.paddingLeft || 0} onChange={(e) => handleUpdateContent('paddingLeft', parseInt(e.target.value) || 0)} className="w-full px-2 py-1 text-center text-xs border border-gray-300 dark:border-[#444] rounded bg-white dark:bg-[#0a0a0a]" />
                            </div>
                          </div>
                          <button onClick={() => {
                            const val = selectedBlock.content.paddingTop || selectedBlock.content.padding || 20;
                            handleUpdateContent('paddingTop', val);
                            handleUpdateContent('paddingRight', val);
                            handleUpdateContent('paddingBottom', val);
                            handleUpdateContent('paddingLeft', val);
                          }} className="mt-2 text-[10px] text-purple-600 hover:text-purple-700">
                            Igualar todos ({selectedBlock.content.padding || selectedBlock.content.paddingTop || 20}px)
                          </button>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-[#333]">
                          <PropertyBackgroundImage 
                            bgImageUrl={selectedBlock.content.bgImageUrl}
                            bgSize={selectedBlock.content.bgSize}
                            bgPosition={selectedBlock.content.bgPosition}
                            onChange={(key, value) => handleUpdateContent(key, value)}
                            onOpenGallery={() => { setShowMediaModal(true); mediaCallbackRef.current = (url) => handleUpdateContent('bgImageUrl', url); }}
                          />
                        </div>
                      </PropertyGroup>
                    )}

                    {/* CONFIGURACIÓN DE IMAGEN */}
                    {selectedBlock?.type === 'image' && (
                      <PropertyGroup title="Imagen / GIF">
                        <PropertyFileOrUrl 
                          label="URL de Imagen" 
                          value={selectedBlock.content.imageUrl} 
                          onChange={(v) => handleUpdateContent('imageUrl', v)} 
                          onOpenGallery={() => { setShowMediaModal(true); mediaCallbackRef.current = (url) => handleUpdateContent('imageUrl', url); }}
                        />
                        <PropertyInput label="Ancho (%)" type="number" value={selectedBlock.content.width} onChange={(v) => handleUpdateContent('width', v)} />
                        <PropertyInput label="Redondeo (px)" type="number" value={selectedBlock.content.borderRadius} onChange={(v) => handleUpdateContent('borderRadius', v)} />
                        <PropertyAlignment value={selectedBlock.content.align} onChange={(v) => handleUpdateContent('align', v)} />
                      </PropertyGroup>
                    )}

{/* CONFIGURACIÓN DE VIDEO */}
                    {selectedBlock?.type === 'video' && (
                      <PropertyGroup title="Video">
                        <PropertySelect 
                          label="Tipo de Video" 
                          value={selectedBlock.content.type} 
                          onChange={(v) => handleUpdateContent('type', v)} 
                          options={[{value:'url', label:'URL (Youtube)'},{value:'embed', label:'Embed HTML'}]} 
                        />
                        {selectedBlock.content.type === 'url' ? (
                          <>
                            <PropertyInput label="URL de Video" value={selectedBlock.content.videoUrl} onChange={(v) => handleUpdateContent('videoUrl', v)} />
                            <PropertyFileOrUrl 
                              label="URL de Portada" 
                              value={selectedBlock.content.coverUrl} 
                              onChange={(v) => handleUpdateContent('coverUrl', v)} 
                              onOpenGallery={() => { setShowMediaModal(true); mediaCallbackRef.current = (url) => handleUpdateContent('coverUrl', url); }}
                            />
                          </>
                        ) : (
                          <PropertyTextarea label="Código Embed (Iframe)" value={selectedBlock.content.embedCode} onChange={(v) => handleUpdateContent('embedCode', v)} />
                        )}
                        <PropertyInput label="Redondeo (px)" type="number" value={selectedBlock.content.borderRadius} onChange={(v) => handleUpdateContent('borderRadius', v)} />
                        <PropertyAlignment value={selectedBlock.content.align} onChange={(v) => handleUpdateContent('align', v)} />
                        <PropertyColor label="Fondo" value={selectedBlock.content.bgColor} onChange={(v) => handleUpdateContent('bgColor', v)} />
                        <PropertyInput label="Padding (px)" type="number" value={selectedBlock.content.padding} onChange={(v) => handleUpdateContent('padding', parseInt(v)||0)} />
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-[#333]">
                          <PropertyBackgroundImage 
                            bgImageUrl={selectedBlock.content.bgImageUrl}
                            bgSize={selectedBlock.content.bgSize}
                            bgPosition={selectedBlock.content.bgPosition}
                            onChange={(key, value) => handleUpdateContent(key, value)}
                            onOpenGallery={() => { setShowMediaModal(true); mediaCallbackRef.current = (url) => handleUpdateContent('bgImageUrl', url); }}
                          />
                        </div>
</PropertyGroup>
                    )}

                    {/* CONFIGURACIÓN DE COLUMNAS */}
                    {selectedBlock?.type === 'columns' && (
                      <div className="space-y-4">
                        <PropertyGroup title="Configuración de Columnas">
                          <PropertySelect 
                            label="Número de Columnas" 
                            value={selectedBlock.content.colCount} 
                            onChange={(v) => handleUpdateContent('colCount', Number(v))} 
                            options={[{value:1,label:'1 Columna'},{value:2,label:'2 Columnas'},{value:3,label:'3 Columnas'},{value:4,label:'4 Columnas'}]} 
                          />
                          <PropertyColor label="Color de Fondo" value={selectedBlock.content.bgColor} onChange={(v) => handleUpdateContent('bgColor', v)} />
                          <PropertyInput label="Padding (px)" type="number" value={selectedBlock.content.padding} onChange={(v) => handleUpdateContent('padding', parseInt(v)||0)} />
                          <PropertySelect 
                            label="Alineación Vertical" 
                            value={selectedBlock.content.align} 
                            onChange={(v) => handleUpdateContent('align', v)} 
                            options={[{value:'top',label:'Superior'},{value:'middle',label:'Centrado'},{value:'bottom',label:'Inferior'}]} 
                          />
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-[#333]">
                            <PropertyBackgroundImage 
                              bgImageUrl={selectedBlock.content.bgImageUrl}
                              bgSize={selectedBlock.content.bgSize}
                              bgPosition={selectedBlock.content.bgPosition}
                              onChange={(key, value) => handleUpdateContent(key, value)}
                              onOpenGallery={() => { setShowMediaModal(true); mediaCallbackRef.current = (url) => handleUpdateContent('bgImageUrl', url); }}
                            />
                          </div>
                        </PropertyGroup>

                        <PropertyGroup title="Contenido de Columnas">
                           <div className="space-y-4">
                              {[...Array(selectedBlock.content.colCount)].map((_, colIdx) => {
                                const colBlocks = selectedBlock.content.cols?.[colIdx] || [];
                                const BLOCK_ICONS = { text: Type, image: ImageIcon, button: MousePointerClick, video: Video, divider: Minus, social: Share2, html: Code, header: Layout, footer: AlignLeft };
                                return (
                                  <div key={colIdx} className="border border-gray-200 dark:border-[#333] rounded-xl overflow-hidden">
                                    {/* Header columna */}
                                    <div className="flex items-center justify-between px-3 py-2 bg-gray-100 dark:bg-[#1a1a1a]">
                                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Columna {colIdx + 1}</span>
                                      <span className="text-[9px] text-gray-600">{colBlocks.length} bloque{colBlocks.length !== 1 ? 's' : ''}</span>
                                    </div>

                                    {/* Bloques existentes en la columna */}
                                    {colBlocks.length > 0 && (
                                      <div className="divide-y divide-gray-100 dark:divide-[#222]">
                                        {colBlocks.map((childBlock, blockIdx) => {
                                          const IconComp = BLOCK_ICONS[childBlock.type] || Code;
                                          // Preview del contenido
                                          const preview = childBlock.content?.text?.substring(0, 30) || childBlock.content?.imageUrl?.split('/').pop()?.substring(0, 20) || childBlock.content?.url?.substring(0, 20) || childBlock.type;
                                          return (
                                            <div key={childBlock.id || blockIdx} className="group">
                                              {/* Fila del bloque — click para editar */}
                                              <button
                                                onClick={() => setSelectedBlockId(childBlock.id)}
                                                className={`w-full flex items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-blue-50 dark:hover:bg-[#1e2a3a] ${selectedBlockId === childBlock.id ? 'bg-blue-50 dark:bg-[#1a2535] border-l-2 border-[#e11d48]' : ''}`}
                                              >
                                                <IconComp size={12} className="text-[#e11d48] flex-shrink-0" />
                                                <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 capitalize flex-1 truncate">{childBlock.type}</span>
                                                <span className="text-[10px] text-gray-400 truncate max-w-[80px]">{preview}</span>
                                              </button>

                                              {/* Panel de edición inline cuando está seleccionado */}
                                              {selectedBlockId === childBlock.id && (
                                                <div className="px-3 pb-3 pt-1 bg-blue-50/50 dark:bg-[#111c2a] border-t border-blue-100 dark:border-[#1e2a3a] space-y-2">
                                                  {/* TEXTO */}
                                                  {childBlock.type === 'text' && (<>
                                                    <textarea
                                                      value={childBlock.content.text || ''}
                                                      onChange={e => {
                                                        const newCols = selectedBlock.content.cols.map((col, ci) =>
                                                          ci === colIdx ? col.map((b, bi) => bi === blockIdx ? { ...b, content: { ...b.content, text: e.target.value } } : b) : col
                                                        );
                                                        handleUpdateContent('cols', newCols);
                                                      }}
                                                      rows={3}
                                                      className="w-full bg-white dark:bg-[#0d0d0d] border border-gray-200 dark:border-[#333] rounded-lg px-2 py-1.5 text-xs text-gray-800 dark:text-white outline-none focus:border-[#e11d48] resize-none"
                                                      placeholder="Texto..."
                                                    />
                                                    <div className="grid grid-cols-2 gap-1.5">
                                                      <div>
                                                        <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Color</label>
                                                        <input type="color" value={childBlock.content.textColor || '#333333'}
                                                          onChange={e => { const newCols = selectedBlock.content.cols.map((col, ci) => ci === colIdx ? col.map((b, bi) => bi === blockIdx ? { ...b, content: { ...b.content, textColor: e.target.value } } : b) : col); handleUpdateContent('cols', newCols); }}
                                                          className="w-full h-7 rounded border border-gray-200 dark:border-[#333] cursor-pointer" />
                                                      </div>
                                                      <div>
                                                        <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Tamaño</label>
                                                        <input type="number" value={childBlock.content.fontSize || 14} min={8} max={72}
                                                          onChange={e => { const newCols = selectedBlock.content.cols.map((col, ci) => ci === colIdx ? col.map((b, bi) => bi === blockIdx ? { ...b, content: { ...b.content, fontSize: parseInt(e.target.value) || 14 } } : b) : col); handleUpdateContent('cols', newCols); }}
                                                          className="w-full bg-white dark:bg-[#0d0d0d] border border-gray-200 dark:border-[#333] rounded-lg px-2 py-1 text-xs outline-none focus:border-[#e11d48]" />
                                                      </div>
                                                    </div>
                                                    <select value={childBlock.content.fontWeight || 'normal'}
                                                      onChange={e => { const newCols = selectedBlock.content.cols.map((col, ci) => ci === colIdx ? col.map((b, bi) => bi === blockIdx ? { ...b, content: { ...b.content, fontWeight: e.target.value } } : b) : col); handleUpdateContent('cols', newCols); }}
                                                      className="w-full bg-white dark:bg-[#0d0d0d] border border-gray-200 dark:border-[#333] rounded-lg px-2 py-1 text-xs outline-none focus:border-[#e11d48]">
                                                      <option value="normal">Normal</option>
                                                      <option value="bold">Bold</option>
                                                    </select>
                                                  </>)}

                                                  {/* IMAGEN */}
                                                  {childBlock.type === 'image' && (<>
                                                    <div>
                                                      <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">URL de Imagen</label>
                                                      <div className="flex gap-1">
                                                        <input type="text" value={childBlock.content.imageUrl || ''}
                                                          onChange={e => { const newCols = selectedBlock.content.cols.map((col, ci) => ci === colIdx ? col.map((b, bi) => bi === blockIdx ? { ...b, content: { ...b.content, imageUrl: e.target.value } } : b) : col); handleUpdateContent('cols', newCols); }}
                                                          className="flex-1 bg-white dark:bg-[#0d0d0d] border border-gray-200 dark:border-[#333] rounded-lg px-2 py-1 text-xs outline-none focus:border-[#e11d48]"
                                                          placeholder="https://..." />
                                                        <button onClick={() => { setShowMediaModal(true); mediaCallbackRef.current = (url) => { const newCols = selectedBlock.content.cols.map((col, ci) => ci === colIdx ? col.map((b, bi) => bi === blockIdx ? { ...b, content: { ...b.content, imageUrl: url } } : b) : col); handleUpdateContent('cols', newCols); }; }} className="px-2 py-1 bg-gray-200 dark:bg-[#222] rounded-lg text-xs hover:bg-gray-300 dark:hover:bg-[#333]">
                                                          <ImageIcon size={12} />
                                                        </button>
                                                      </div>
                                                    </div>
                                                    {childBlock.content.imageUrl && (
                                                      <img src={childBlock.content.imageUrl} alt="preview" className="w-full h-16 object-cover rounded-lg border border-gray-200 dark:border-[#333]" />
                                                    )}
                                                    <div>
                                                      <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Enlace (Link)</label>
                                                      <input type="text" value={childBlock.content.linkUrl || ''}
                                                        onChange={e => { const newCols = selectedBlock.content.cols.map((col, ci) => ci === colIdx ? col.map((b, bi) => bi === blockIdx ? { ...b, content: { ...b.content, linkUrl: e.target.value } } : b) : col); handleUpdateContent('cols', newCols); }}
                                                        className="w-full bg-white dark:bg-[#0d0d0d] border border-gray-200 dark:border-[#333] rounded-lg px-2 py-1 text-xs outline-none focus:border-[#e11d48]"
                                                        placeholder="https://..." />
                                                    </div>
                                                  </>)}

                                                  {/* BOTÓN */}
                                                  {childBlock.type === 'button' && (<>
                                                    <input type="text" value={childBlock.content.text || ''}
                                                      onChange={e => { const newCols = selectedBlock.content.cols.map((col, ci) => ci === colIdx ? col.map((b, bi) => bi === blockIdx ? { ...b, content: { ...b.content, text: e.target.value } } : b) : col); handleUpdateContent('cols', newCols); }}
                                                      className="w-full bg-white dark:bg-[#0d0d0d] border border-gray-200 dark:border-[#333] rounded-lg px-2 py-1 text-xs outline-none focus:border-[#e11d48]"
                                                      placeholder="Texto del botón..." />
                                                    <input type="text" value={childBlock.content.url || ''}
                                                      onChange={e => { const newCols = selectedBlock.content.cols.map((col, ci) => ci === colIdx ? col.map((b, bi) => bi === blockIdx ? { ...b, content: { ...b.content, url: e.target.value } } : b) : col); handleUpdateContent('cols', newCols); }}
                                                      className="w-full bg-white dark:bg-[#0d0d0d] border border-gray-200 dark:border-[#333] rounded-lg px-2 py-1 text-xs outline-none focus:border-[#e11d48]"
                                                      placeholder="https://..." />
                                                    <div className="grid grid-cols-2 gap-1.5">
                                                      <div>
                                                        <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Fondo</label>
                                                        <input type="color" value={childBlock.content.buttonBgColor || '#e11d48'}
                                                          onChange={e => { const newCols = selectedBlock.content.cols.map((col, ci) => ci === colIdx ? col.map((b, bi) => bi === blockIdx ? { ...b, content: { ...b.content, buttonBgColor: e.target.value } } : b) : col); handleUpdateContent('cols', newCols); }}
                                                          className="w-full h-7 rounded border border-gray-200 dark:border-[#333] cursor-pointer" />
                                                      </div>
                                                      <div>
                                                        <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Texto</label>
                                                        <input type="color" value={childBlock.content.textColor || '#ffffff'}
                                                          onChange={e => { const newCols = selectedBlock.content.cols.map((col, ci) => ci === colIdx ? col.map((b, bi) => bi === blockIdx ? { ...b, content: { ...b.content, textColor: e.target.value } } : b) : col); handleUpdateContent('cols', newCols); }}
                                                          className="w-full h-7 rounded border border-gray-200 dark:border-[#333] cursor-pointer" />
                                                      </div>
                                                    </div>
                                                  </>)}

                                                  {/* Acciones: eliminar */}
                                                  <button
                                                    onClick={() => { const newCols = selectedBlock.content.cols.map((col, ci) => ci === colIdx ? col.filter((_, bi) => bi !== blockIdx) : col); handleUpdateContent('cols', newCols); setSelectedBlockId(selectedBlock.id); }}
                                                    className="w-full py-1 text-[10px] text-red-400 hover:text-red-300 font-bold uppercase tracking-widest border border-red-400/20 rounded-lg hover:bg-red-400/5 transition-all"
                                                  >
                                                    Eliminar bloque
                                                  </button>
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}

                                    {/* Agregar nuevo bloque a la columna */}
                                    <div className="p-2 bg-gray-50 dark:bg-[#0a0a0a]">
                                      <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold mb-1.5">Agregar</p>
                                      <div className="grid grid-cols-4 gap-1">
                                        <ColToolBtn icon={Type} label="Texto" onClick={() => addBlockToSpecificColumn(selectedBlock.id, colIdx, 'text')} />
                                        <ColToolBtn icon={ImageIcon} label="Imagen" onClick={() => addBlockToSpecificColumn(selectedBlock.id, colIdx, 'image')} />
                                        <ColToolBtn icon={MousePointerClick} label="Botón" onClick={() => addBlockToSpecificColumn(selectedBlock.id, colIdx, 'button')} />
                                        <ColToolBtn icon={Video} label="Video" onClick={() => addBlockToSpecificColumn(selectedBlock.id, colIdx, 'video')} />
                                        <ColToolBtn icon={Minus} label="Separador" onClick={() => addBlockToSpecificColumn(selectedBlock.id, colIdx, 'divider')} />
                                        <ColToolBtn icon={Share2} label="Social" onClick={() => addBlockToSpecificColumn(selectedBlock.id, colIdx, 'social')} />
                                        <ColToolBtn icon={Code} label="HTML" onClick={() => addBlockToSpecificColumn(selectedBlock.id, colIdx, 'html')} />
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                           </div>
                        </PropertyGroup>
                      </div>
                    )}

                    {/* CONFIGURACIÓN DE BOTÓN */}
                    {selectedBlock?.type === 'button' && (
                      <PropertyGroup title="Botón">
                        <PropertyInput label="Texto del Botón" value={selectedBlock.content.text} onChange={(v) => handleUpdateContent('text', v)} />
                        <PropertyInput label="Enlace (Link)" value={selectedBlock.content.url} onChange={(v) => handleUpdateContent('url', v)} />
                        <div className="grid grid-cols-2 gap-2">
                           <PropertyColor label="Fondo Botón" value={selectedBlock.content.buttonBgColor} onChange={(v) => handleUpdateContent('buttonBgColor', v)} />
                           <PropertyColor label="Texto" value={selectedBlock.content.textColor} onChange={(v) => handleUpdateContent('textColor', v)} />
                        </div>
                        <PropertyInput label="Redondeo (px)" type="number" value={selectedBlock.content.borderRadius} onChange={(v) => handleUpdateContent('borderRadius', v)} />
                        <PropertyAlignment value={selectedBlock.content.align} onChange={(v) => handleUpdateContent('align', v)} />
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-[#333]">
                          <PropertyColor label="Fondo Contenedor" value={selectedBlock.content.containerBgColor} onChange={(v) => handleUpdateContent('containerBgColor', v)} />
                          <PropertyBackgroundImage 
                            bgImageUrl={selectedBlock.content.bgImageUrl}
                            bgSize={selectedBlock.content.bgSize}
                            bgPosition={selectedBlock.content.bgPosition}
                            onChange={(key, value) => handleUpdateContent(key, value)}
                            onOpenGallery={() => { setShowMediaModal(true); mediaCallbackRef.current = (url) => handleUpdateContent('bgImageUrl', url); }}
                          />
                        </div>
                      </PropertyGroup>
                    )}

                    {/* CONFIGURACIÓN DE SEPARADOR */}
                    {selectedBlock?.type === 'divider' && (
                      <PropertyGroup title="Separador">
                        <PropertyColor label="Color de Línea" value={selectedBlock.content.color} onChange={(v) => handleUpdateContent('color', v)} />
                        <PropertyInput label="Grosor (px)" type="number" value={selectedBlock.content.height} onChange={(v) => handleUpdateContent('height', v)} />
                        <PropertySelect label="Estilo" value={selectedBlock.content.borderStyle} onChange={(v) => handleUpdateContent('borderStyle', v)} options={[{value:'solid',label:'Sólido'},{value:'dashed',label:'Guiones'},{value:'dotted',label:'Puntos'}]} />
                        <PropertyInput label="Padding (px)" type="number" value={selectedBlock.content.padding} onChange={(v) => handleUpdateContent('padding', v)} />
                        <PropertyColor label="Fondo" value={selectedBlock.content.bgColor} onChange={(v) => handleUpdateContent('bgColor', v)} />
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-[#333]">
                          <PropertyBackgroundImage 
                            bgImageUrl={selectedBlock.content.bgImageUrl}
                            bgSize={selectedBlock.content.bgSize}
                            bgPosition={selectedBlock.content.bgPosition}
                            onChange={(key, value) => handleUpdateContent(key, value)}
                            onOpenGallery={() => { setShowMediaModal(true); mediaCallbackRef.current = (url) => handleUpdateContent('bgImageUrl', url); }}
                          />
                        </div>
                      </PropertyGroup>
                    )}

                    {/* CONFIGURACIÓN DE ESPACIO */}
                    {selectedBlock?.type === 'spacer' && (
                      <PropertyGroup title="Espaciado">
                        <PropertyInput label="Altura (px)" type="number" value={selectedBlock.content.height} onChange={(v) => handleUpdateContent('height', v)} />
                        <PropertyColor label="Fondo" value={selectedBlock.content.bgColor} onChange={(v) => handleUpdateContent('bgColor', v)} />
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-[#333]">
                          <PropertyBackgroundImage 
                            bgImageUrl={selectedBlock.content.bgImageUrl}
                            bgSize={selectedBlock.content.bgSize}
                            bgPosition={selectedBlock.content.bgPosition}
                            onChange={(key, value) => handleUpdateContent(key, value)}
                            onOpenGallery={() => { setShowMediaModal(true); mediaCallbackRef.current = (url) => handleUpdateContent('bgImageUrl', url); }}
                          />
                        </div>
                      </PropertyGroup>
                    )}

                    {/* CONFIGURACIÓN SOCIAL */}
                    {selectedBlock?.type === 'social' && (
                      <PropertyGroup title="Redes Sociales">
                        <div className="space-y-3">
                          {selectedBlock.content.networks.map((net) => (
                            <div key={net.id} className="p-2 border rounded bg-gray-50 dark:bg-[#0a0a0a] dark:border-[#333]">
                               <div className="flex justify-between items-center mb-1">
                                  <select 
                                    value={net.network} 
                                    onChange={(e) => {
                                      const newNet = e.target.value;
                                      const defaultBg = SOCIAL_CONFIG[newNet].defaultBg;
                                      handleNetworkUpdate(net.id, { network: newNet, bgColor: defaultBg });
                                    }}
                                    className="text-[10px] font-bold uppercase bg-transparent outline-none cursor-pointer border-b border-dashed border-gray-400"
                                  >
                                    {Object.keys(SOCIAL_CONFIG).map(k => (
                                      <option key={k} value={k}>{SOCIAL_CONFIG[k].label}</option>
                                    ))}
                                  </select>
                                  <button onClick={() => {
                                    const newNets = selectedBlock.content.networks.filter(n => n.id !== net.id);
                                    handleUpdateContent('networks', newNets);
                                  }} className="text-red-500"><Trash2 size={12}/></button>
                               </div>
                               <input type="text" value={net.url} onChange={(e) => handleNetworkUpdate(net.id, 'url', e.target.value)} className="w-full text-xs p-1 border rounded dark:bg-[#161616] mb-1" />
                               <div className="grid grid-cols-2 gap-1">
                                  <PropertyColor label="Icono" value={net.iconColor} onChange={(v) => handleNetworkUpdate(net.id, 'iconColor', v)} />
                                  <PropertyColor label="Fondo" value={net.bgColor} onChange={(v) => handleNetworkUpdate(net.id, 'bgColor', v)} />
                                </div>
                            </div>
                          ))}
                          <button onClick={addNetwork} className="w-full py-1 text-xs bg-gray-100 dark:bg-[#222] font-bold">+ Añadir Red</button>
                        </div>
                      </PropertyGroup>
                    )}

                    {/* CONFIGURACIÓN HTML CUSTOM */}
                    {selectedBlock?.type === 'html' && (
                      <PropertyGroup title="Código HTML">
                        <PropertyTextarea label="Código" value={selectedBlock.content.code} onChange={(v) => handleUpdateContent('code', v)} />
                      </PropertyGroup>
                    )}

                    {/* CONFIGURACIÓN FOOTER */}
                    {selectedBlock?.type === 'footer' && (
                      <PropertyGroup title="Pie de Página">
                        <PropertyTextarea label="Texto Legal" value={selectedBlock.content.text} onChange={(v) => handleUpdateContent('text', v)} />
                        <PropertyColor label="Color de Texto" value={selectedBlock.content.textColor} onChange={(v) => handleUpdateContent('textColor', v)} />
                        <PropertyInput label="Tamaño (px)" type="number" value={selectedBlock.content.fontSize} onChange={(v) => handleUpdateContent('fontSize', v)} />
                        <PropertyAlignment value={selectedBlock.content.align} onChange={(v) => handleUpdateContent('align', v)} />
</PropertyGroup>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* MODAL ENVIAR CORREO */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#333] rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-[#222]">
              <h3 className="font-bold flex items-center gap-2 text-gray-900 dark:text-white text-lg">
                <Send className="text-blue-500"/> Enviar Campaña
              </h3>
              <button onClick={() => setShowSendModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-md bg-gray-100 dark:bg-[#222]"><X size={18}/></button>
            </div>
            
            <div className="flex border-b border-gray-200 dark:border-[#222] bg-gray-50 dark:bg-[#161616]">
              <button onClick={() => setSendTab('destinatarios')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${sendTab === 'destinatarios' ? 'border-b-2 border-blue-500 text-blue-500 bg-white dark:bg-[#111111]' : 'text-gray-500 hover:text-gray-700'}`}>
                1. Destinatarios
              </button>
              <button onClick={() => setSendTab('envio')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${sendTab === 'envio' ? 'border-b-2 border-blue-500 text-blue-500 bg-white dark:bg-[#111111]' : 'text-gray-500 hover:text-gray-700'}`}>
                2. Enviar
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              {sendTab === 'destinatarios' && (
                <div className="space-y-5 animate-fadeIn">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Método de Selección</label>
                    <div className="grid grid-cols-3 gap-3">
                      <button onClick={() => setCampaignConfig({...campaignConfig, type: 'manual'})} className={`p-3 border rounded-xl flex flex-col items-center gap-2 transition-all ${campaignConfig.type === 'manual' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500' : 'border-gray-200 dark:border-[#333] text-gray-500 hover:border-gray-300 dark:hover:border-[#444]'}`}>
                        <Code size={20} />
                        <span className="text-xs font-bold">Manual</span>
                      </button>
                      <button onClick={() => setCampaignConfig({...campaignConfig, type: 'leads'})} className={`p-3 border rounded-xl flex flex-col items-center gap-2 transition-all ${campaignConfig.type === 'leads' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500' : 'border-gray-200 dark:border-[#333] text-gray-500 hover:border-gray-300 dark:hover:border-[#444]'}`}>
                        <Database size={20} />
                        <span className="text-xs font-bold">Desde CRM</span>
                      </button>
                      <button onClick={() => setCampaignConfig({...campaignConfig, type: 'grupos'})} className={`p-3 border rounded-xl flex flex-col items-center gap-2 transition-all ${campaignConfig.type === 'grupos' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500' : 'border-gray-200 dark:border-[#333] text-gray-500 hover:border-gray-300 dark:hover:border-[#444]'}`}>
                        <Layers size={20} />
                        <span className="text-xs font-bold">Grupos</span>
                      </button>
                    </div>
                  </div>

                  {campaignConfig.type === 'manual' && (
                    <div className="bg-gray-50 dark:bg-[#161616] p-4 rounded-xl border border-gray-200 dark:border-[#333]">
                      <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">Correos Electrónicos (separados por coma)</label>
                      <textarea 
                        rows={4}
                        placeholder="cliente1@gmail.com, usuario2@empresa.com, lead3@hotmail.com"
                        value={campaignConfig.emails}
                        onChange={(e) => setCampaignConfig({...campaignConfig, emails: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-[#444] rounded-lg bg-white dark:bg-[#0a0a0a] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                      <p className="text-[10px] text-gray-500 mt-2">Cada correo irá en copia oculta (BCC)</p>
                    </div>
                  )}

                  {campaignConfig.type === 'leads' && (
                    <div className="bg-gray-50 dark:bg-[#161616] p-4 rounded-xl border border-gray-200 dark:border-[#333] text-center py-8">
                      <Database size={32} className="mx-auto text-gray-400 mb-3 opacity-50" />
                      <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">Desde CRM</h4>
                      <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">Selecciona leads o contactos desde tu base de datos. (Requiere integración CRM)</p>
                      <button className="mt-4 px-4 py-2 bg-white dark:bg-[#222] border border-gray-200 dark:border-[#444] rounded-lg text-xs font-bold text-gray-700 dark:text-gray-300 shadow-sm">
                        + Cargar Contactos
                      </button>
                    </div>
                  )}

                  {campaignConfig.type === 'grupos' && (
                    <div className="bg-gray-50 dark:bg-[#161616] p-4 rounded-xl border border-gray-200 dark:border-[#333] text-center py-8">
                      <Layers size={32} className="mx-auto text-gray-400 mb-3 opacity-50" />
                      <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">Envío por Grupos</h4>
                      <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">Envía a segmentos predefinidos.</p>
                      <select className="mt-4 w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-[#444] rounded-lg bg-white dark:bg-[#0a0a0a] text-sm mx-auto block">
                        <option value="">Selecciona un grupo...</option>
                        <option value="todos">Todos los Leads</option>
                        <option value="clientes">Clientes Activos</option>
                        <option value="suscritos">Suscriptores Newsletter</option>
                      </select>
                    </div>
                  )}

                  {/* ADJUNTOS */}
                  <div className="bg-gray-50 dark:bg-[#161616] p-4 rounded-xl border border-gray-200 dark:border-[#333]">
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                      <Paperclip size={14} /> Archivos Adjuntos
                    </label>
                    <input 
                      type="file" 
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setAttachments([...attachments, ...files]);
                      }}
                      className="w-full text-xs text-gray-500 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 dark:file:bg-blue-900/20 file:text-blue-600 dark:file:text-blue-400 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/30"
                    />
                    {attachments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {attachments.map((file, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-white dark:bg-[#0a0a0a] p-2 rounded border border-gray-200 dark:border-[#333]">
                            <span className="text-xs truncate flex-1">{file.name}</span>
                            <button onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))} className="text-red-500 ml-2">
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {sendTab === 'envio' && (
                <div className="space-y-4 animate-fadeIn">
                  {/* SELECCIÓN DE REMITENTE */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Remitente</label>
                    {senders.length === 0 ? (
                      <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 p-4 rounded-xl">
                        <p className="text-xs text-yellow-700 dark:text-yellow-500">No hay remitentes configurados.</p>
                        <button onClick={() => { setShowSendModal(false); setShowSettingsModal(true); }} className="mt-2 text-xs font-bold text-yellow-700 dark:text-yellow-400 underline">
                          Configurar remitentes →
                        </button>
                      </div>
                    ) : (
                      <div className="grid gap-2">
                        {senders.map(sender => (
                          <button
                            key={sender.id}
                            onClick={() => setCampaignConfig({...campaignConfig, selectedSenderId: sender.id})}
                            className={`p-3 border rounded-xl flex items-center justify-between transition-all ${campaignConfig.selectedSenderId === sender.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-gray-200 dark:border-[#333] hover:border-gray-300'}`}
                          >
                            <div className="text-left">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-gray-900 dark:text-white">{sender.nombre}</span>
                                {sender.is_default && <span className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded">DEFAULT</span>}
                              </div>
                              <p className="text-xs text-gray-500">{sender.from_name} &lt;{sender.from_email}&gt;</p>
                              <p className="text-[10px] text-gray-400 uppercase">{sender.provider}</p>
                            </div>
                            {campaignConfig.selectedSenderId === sender.id && <CheckCircle size={18} className="text-blue-500" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Asunto del Correo</label>
                    <input type="text" placeholder="¡No te pierdas esta increíble oferta!" value={campaignConfig.subject} onChange={(e) => setCampaignConfig({...campaignConfig, subject: e.target.value})} className="w-full px-4 py-3 border border-gray-300 dark:border-[#333] rounded-xl bg-white dark:bg-[#0a0a0a] text-base focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Texto de Previsualización</label>
                    <input type="text" placeholder="Este texto aparece junto al asunto en la bandeja de entrada..." value={campaignConfig.preview} onChange={(e) => setCampaignConfig({...campaignConfig, preview: e.target.value})} className="w-full px-4 py-2 border border-gray-300 dark:border-[#333] rounded-lg bg-white dark:bg-[#0a0a0a] text-sm text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                  
                  {/* RESUMEN */}
                  <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 p-4 rounded-xl mt-4">
                    <h4 className="text-xs font-bold text-yellow-700 dark:text-yellow-500 flex items-center gap-2 mb-2">
                      <Settings size={14}/> Resumen de Envío
                    </h4>
                    <ul className="text-xs text-yellow-800 dark:text-yellow-600 space-y-1">
                      <li><strong>Plantilla:</strong> {templateName || 'SinGuardar'}</li>
                      <li><strong>Destinatarios:</strong> {campaignConfig.type === 'manual' ? (campaignConfig.emails ? campaignConfig.emails.split(',').filter(e=>e.trim()).length + ' correos' : '0') : campaignConfig.type}</li>
                      <li><strong>Remitente:</strong> {senders.find(s => s.id === campaignConfig.selectedSenderId)?.nombre || 'No seleccionado'}</li>
                      <li><strong>Adjuntos:</strong> {attachments.length} archivo(s)</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-5 border-t border-gray-100 dark:border-[#222] flex justify-between bg-gray-50 dark:bg-[#161616] rounded-b-2xl">
              <button 
                onClick={() => {
                  if(sendTab === 'envio') setSendTab('destinatarios');
                  else setShowSendModal(false);
                }} 
                className="px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#222] rounded-lg transition-colors"
              >
                {sendTab === 'destinatarios' ? 'Cancelar' : 'Atrás'}
              </button>
              
              <button 
                onClick={async () => {
                  if(sendTab === 'destinatarios') setSendTab('envio');
                  else {
                    const sender = senders.find(s => s.id === campaignConfig.selectedSenderId);
                    if(!sender) { alert('Selecciona un remitente'); return; }
                    
                    const finalSubject = campaignConfig.subject || settings.subject || 'Sin asunto';
                    const finalPreview = campaignConfig.preview || settings.previewText || '';
                    
                    if(campaignConfig.type === 'manual' && !campaignConfig.emails) { 
                      alert('Ingresa al menos un correo'); 
                      return; 
                    }
                    
                    setSendingEmail(true);
                    try {
                      const html = generateHTML();
                      
                      // Convertir adjuntos a base64
                      let attachmentsData = [];
                      if (attachments.length > 0) {
                        const filePromises = attachments.map(file => {
                          return new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onload = () => {
                              resolve({
                                filename: file.name,
                                content: reader.result.split(',')[1],
                                contentType: file.type
                              });
                            };
                            reader.readAsDataURL(file);
                          });
                        });
                        attachmentsData = await Promise.all(filePromises);
                      }
                      
                      const res = await fetch('/api/send-email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          senderId: sender.id,
                          to: campaignConfig.type === 'manual' ? campaignConfig.emails : [],
                          subject: finalSubject,
                          html: html,
                          preview: finalPreview,
                          attachments: attachmentsData
                        })
                      });
                      const data = await res.json();
                      
                      if(data.success) {
                        alert(`✅ Correo enviado exitosamente a ${data.recipients} destinatario(s)${attachments.length > 0 ? ` con ${attachments.length} adjunto(s)` : ''}`);
                        setShowSendModal(false);
                        setCampaignConfig({ subject: '', preview: '', type: 'manual', emails: '', selectedSenderId: '' });
                        setAttachments([]);
                      } else {
                        alert(`❌ Error: ${data.error || 'No se pudo enviar el correo'}`);
                      }
                    } catch (e) {
                      console.error(e);
                      alert('❌ Error de conexión con el servidor');
                    } finally {
                      setSendingEmail(false);
                    }
                  }
                }}
                disabled={sendingEmail}
                className="px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingEmail ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Enviando...
                  </>
                ) : (
                  sendTab === 'envio' ? <><Send size={16}/> Enviar Campaña</> : 'Continuar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EXPORT HTML */}
      {showExportHtml && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#333] rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col h-[85vh]">
          <div className="flex justify-between p-5 border-b border-gray-100 dark:border-[#222]">
            <h3 className="font-bold flex gap-2 text-gray-900 dark:text-white"><Code className="text-[#e11d48]"/> Código HTML para Correo</h3>
            <button onClick={() => setShowExportHtml(false)} className="text-gray-400"><X/></button>
          </div>
          <div className="p-5 flex-1 bg-gray-900 overflow-hidden relative">
            <textarea readOnly className="w-full h-full bg-transparent text-emerald-400 font-mono text-sm resize-none outline-none custom-scrollbar" value={generateHTML()} />
            <button onClick={() => { navigator.clipboard.writeText(generateHTML()); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className={`absolute bottom-6 right-6 text-white px-6 py-3 rounded-xl shadow-lg flex gap-2 font-bold ${copied ? 'bg-green-600' : 'bg-[#e11d48]'}`}>
              {copied ? <Check size={18} /> : <Copy size={18} />} {copied ? 'Copiado' : 'Copiar Código'}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* MODAL GUARDAR PLANTILLA */}
    {showSaveModal && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#333] rounded-2xl shadow-2xl w-full max-w-md">
          <div className="flex justify-between p-5 border-b border-gray-100 dark:border-[#222]">
            <h3 className="font-bold flex gap-2 text-gray-900 dark:text-white"><Database className="text-emerald-500"/> Guardar Plantilla</h3>
            <button onClick={() => setShowSaveModal(false)} className="text-gray-400 hover:text-gray-600"><X/></button>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre de la plantilla</label>
              <input 
                type="text" 
                value={templateName} 
                onChange={(e) => setTemplateName(e.target.value)} 
                placeholder="Ej: Newsletter Enero 2026"
                className="w-full px-4 py-2 border border-gray-300 dark:border-[#333] rounded-lg bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#e11d48]"
              />
            </div>
            
            {currentTemplateId ? (
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => handleSaveTemplate(false)} 
                  disabled={templatesLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save size={18} /> Actualizar
                </button>
                <button 
                  onClick={() => handleSaveTemplate(true)} 
                  disabled={templatesLoading}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                >
                  <Database size={18} /> Guardar Como
                </button>
              </div>
            ) : (
              <button 
                onClick={() => handleSaveTemplate(true)} 
                disabled={templatesLoading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Database size={18} /> {templatesLoading ? 'Guardando...' : 'Guardar en la Nube'}
              </button>
            )}
          </div>
        </div>
      </div>
    )}

    {/* MODAL PLANTILLAS GUARDADAS */}
    {showTemplatesModal && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#333] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
          <div className="flex justify-between p-5 border-b border-gray-100 dark:border-[#222]">
            <h3 className="font-bold flex gap-2 text-gray-900 dark:text-white"><FolderOpen className="text-[#e11d48]"/> Plantillas Guardadas</h3>
            <button onClick={() => setShowTemplatesModal(false)} className="text-gray-400 hover:text-gray-600"><X/></button>
          </div>
          <div className="p-5 overflow-y-auto flex-1">
            {savedTemplates.length === 0 ? (
              <div className="text-center text-gray-500 py-10">
                <FolderOpen size={48} className="mx-auto mb-4 opacity-30" />
                <p>No hay plantillas guardadas</p>
                <p className="text-sm">Crea una nueva plantilla y guárdala para verla aquí</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {savedTemplates.map((t) => (
                  <div 
                    key={t.id} 
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#161616] rounded-xl border border-gray-200 dark:border-[#333] hover:border-[#e11d48] cursor-pointer transition-colors"
                    onClick={() => handleLoadTemplate(t.id)}
                  >
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">{t.nombre}</h4>
                      <p className="text-xs text-gray-500">{new Date(t.creado_en).toLocaleDateString()}</p>
                    </div>
                    <button 
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (confirm('¿Eliminar esta plantilla?')) {
                          await deleteTemplateFromDb(t.id);
                          const templates = await getTemplates();
                          if (templates) setSavedTemplates(templates);
                        }
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )}

    {/* MODAL CONFIGURACIÓN DE REMITENTES */}
    {showSettingsModal && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#333] rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
          <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-[#222]">
            <h3 className="font-bold flex items-center gap-2 text-gray-900 dark:text-white text-lg">
              <Server className="text-purple-500"/> Configuración de Remitentes
            </h3>
            <button onClick={() => { setShowSettingsModal(false); setEditingSender(null); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-md bg-gray-100 dark:bg-[#222]"><X size={18}/></button>
          </div>

          <div className="flex border-b border-gray-200 dark:border-[#222] bg-gray-50 dark:bg-[#161616]">
            <button onClick={() => setSettingsTab('senders')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${settingsTab === 'senders' ? 'border-b-2 border-purple-500 text-purple-500 bg-white dark:bg-[#111111]' : 'text-gray-500 hover:text-gray-700'}`}>
              Remitentes
            </button>
            <button onClick={() => setSettingsTab('smtp')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${settingsTab === 'smtp' ? 'border-b-2 border-purple-500 text-purple-500 bg-white dark:bg-[#111111]' : 'text-gray-500 hover:text-gray-700'}`}>
              Guía SMTP
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
            {settingsTab === 'senders' && (
              <div className="space-y-4 animate-fadeIn">
                {!editingSender && senders.length === 0 && (
                  <div className="text-center py-10">
                    <Server size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">No hay remitentes configurados</p>
                    <p className="text-xs text-gray-400 mt-1">Añade un remitente para empezar a enviar correos</p>
                  </div>
                )}

                {!editingSender && senders.length > 0 && (
                  <div className="space-y-2">
                    {senders.map(sender => (
                      <div key={sender.id} className={`p-4 border rounded-xl flex items-center justify-between ${sender.is_default ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/10' : 'border-gray-200 dark:border-[#333]'}`}>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 dark:text-white">{sender.nombre}</span>
                            {sender.is_default && <span className="text-[10px] bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded">DEFAULT</span>}
                          </div>
                          <p className="text-sm text-gray-500">{sender.from_name} &lt;{sender.from_email}&gt;</p>
                          <p className="text-xs text-gray-400 uppercase">{sender.provider} {sender.smtp_host && `· ${sender.smtp_host}:${sender.smtp_port}`}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {!sender.is_default && (
                            <button onClick={() => saveSender({ ...sender, is_default: true })} title="Establecer como default" className="p-2 text-gray-400 hover:text-yellow-500">
                              <Star size={16} />
                            </button>
                          )}
                          <button onClick={() => { setTestResult(null); setEditingSender(sender); }} className="p-2 text-gray-400 hover:text-blue-500">
                            <Pencil size={16} />
                          </button>
                          <button onClick={async () => { if(confirm('¿Eliminar este remitente?')) await deleteSender(sender.id); }} className="p-2 text-gray-400 hover:text-red-500">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {editingSender && (
                  <div className="bg-gray-50 dark:bg-[#161616] p-4 rounded-xl border border-gray-200 dark:border-[#333] space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Nombre del Remitente</label>
                        <input type="text" placeholder="Ej: Marketing BLIS" value={editingSender.nombre || ''} onChange={(e) => setEditingSender({...editingSender, nombre: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-[#444] rounded-lg bg-white dark:bg-[#0a0a0a] text-sm focus:outline-none focus:ring-1 focus:ring-purple-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Mostrar como</label>
                        <input type="text" placeholder="Ej: Ventas BLIS Corp" value={editingSender.from_name || ''} onChange={(e) => setEditingSender({...editingSender, from_name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-[#444] rounded-lg bg-white dark:bg-[#0a0a0a] text-sm focus:outline-none focus:ring-1 focus:ring-purple-500" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Email Remitente</label>
                      <input type="email" placeholder="contacto@tuempresa.com" value={editingSender.from_email || ''} onChange={(e) => setEditingSender({...editingSender, from_email: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-[#444] rounded-lg bg-white dark:bg-[#0a0a0a] text-sm focus:outline-none focus:ring-1 focus:ring-purple-500" />
                    </div>
                    
                    <div className="border-t border-gray-200 dark:border-[#333] pt-4">
                      <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">Proveedor de Correo</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['smtp', 'resend', 'sendgrid'].map(p => (
                          <button key={p} onClick={() => setEditingSender({...editingSender, provider: p})} className={`p-2 border rounded-lg text-xs font-bold transition-all ${editingSender.provider === p ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600' : 'border-gray-200 dark:border-[#444] text-gray-500 hover:border-gray-300'}`}>
                            {p.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    {editingSender.provider === 'smtp' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Servidor SMTP</label>
                          <input type="text" placeholder="smtp.gmail.com" value={editingSender.smtp_host || ''} onChange={(e) => setEditingSender({...editingSender, smtp_host: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-[#444] rounded-md bg-white dark:bg-[#0a0a0a] text-sm" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Puerto</label>
                          <input type="number" placeholder="465" value={editingSender.smtp_port || ''} onChange={(e) => setEditingSender({...editingSender, smtp_port: parseInt(e.target.value) || 465})} className="w-full px-3 py-2 border border-gray-300 dark:border-[#444] rounded-md bg-white dark:bg-[#0a0a0a] text-sm" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Usuario</label>
                          <input type="text" placeholder="tu@email.com" value={editingSender.smtp_user || ''} onChange={(e) => setEditingSender({...editingSender, smtp_user: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-[#444] rounded-md bg-white dark:bg-[#0a0a0a] text-sm" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Contraseña</label>
                          <input type="password" placeholder="••••••••" value={editingSender.smtp_pass || ''} onChange={(e) => setEditingSender({...editingSender, smtp_pass: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-[#444] rounded-md bg-white dark:bg-[#0a0a0a] text-sm" />
                        </div>
                      </div>
                    )}

                    {editingSender.provider !== 'smtp' && (
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">API Key ({editingSender.provider})</label>
                        <input type="password" placeholder="sk_live_..." value={editingSender.api_key || ''} onChange={(e) => setEditingSender({...editingSender, api_key: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-[#444] rounded-md bg-white dark:bg-[#0a0a0a] text-sm font-mono" />
                      </div>
                    )}

                    {/* BOTÓN PROBAR CONEXIÓN */}
                    <div className="border-t border-gray-200 dark:border-[#333] pt-4">
                      <button 
                        onClick={async () => {
                          setTestingConnection(true);
                          setTestResult(null);
                          try {
                            const res = await fetch('/api/email-senders/test', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                provider: editingSender.provider,
                                smtp_host: editingSender.smtp_host,
                                smtp_port: editingSender.smtp_port,
                                smtp_user: editingSender.smtp_user,
                                smtp_pass: editingSender.smtp_pass,
                                api_key: editingSender.api_key
                              })
                            });
                            const data = await res.json();
                            setTestResult(data);
                          } catch (e) {
                            setTestResult({ success: false, message: 'Error de conexión con el servidor' });
                          } finally {
                            setTestingConnection(false);
                          }
                        }}
                        disabled={testingConnection || (editingSender.provider === 'smtp' && (!editingSender.smtp_host || !editingSender.smtp_user))}
                        className="w-full py-2 border border-purple-500 text-purple-600 dark:text-purple-400 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {testingConnection ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Probando conexión...
                          </>
                        ) : (
                          <>
                            <Zap size={16} />
                            Probar Conexión
                          </>
                        )}
                      </button>
                      
                      {testResult && (
                        <div className={`mt-3 p-3 rounded-lg flex items-start gap-2 ${testResult.success ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
                          {testResult.success ? (
                            <CheckCircle size={16} className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                          ) : (
                            <AlertCircle size={16} className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                          )}
                          <span className={`text-xs ${testResult.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                            {testResult.message}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="is_default" checked={editingSender.is_default || false} onChange={(e) => setEditingSender({...editingSender, is_default: e.target.checked})} className="w-4 h-4 rounded border-gray-300" />
                      <label htmlFor="is_default" className="text-xs text-gray-600 dark:text-gray-400">Establecer como remitente predeterminado</label>
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => { setTestResult(null); setEditingSender(null); }} className="flex-1 py-2 border border-gray-300 dark:border-[#444] rounded-lg text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#222]">
                        Cancelar
                      </button>
                      <button onClick={async () => {
                        if(!editingSender.nombre || !editingSender.from_email) { alert('Completa nombre y email'); return; }
                        await saveSender(editingSender);
                        setTestResult(null);
                        setEditingSender(null);
                      }} className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-bold">
                        {editingSender.id ? 'Actualizar' : 'Guardar'}
                      </button>
                    </div>
                  </div>
                )}

                {!editingSender && (
                  <button onClick={() => { setTestResult(null); setEditingSender({ nombre: '', from_name: '', from_email: '', provider: 'smtp', smtp_port: 465, is_default: senders.length === 0 }); }} className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-[#444] rounded-xl text-sm font-bold text-gray-500 hover:border-purple-500 hover:text-purple-500 transition-colors">
                    + Añadir Nuevo Remitente
                  </button>
                )}
              </div>
            )}

            {settingsTab === 'smtp' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 p-4 rounded-xl">
                  <h4 className="text-sm font-bold text-blue-700 dark:text-blue-400 mb-2">Configuración SMTP Común</h4>
                  <div className="space-y-3 text-xs text-gray-600 dark:text-gray-400">
                    <div className="grid grid-cols-3 gap-2 p-2 bg-white dark:bg-[#0a0a0a] rounded border border-gray-200 dark:border-[#333]">
                      <div className="font-bold">Gmail</div>
                      <div>smtp.gmail.com:587</div>
                      <div className="text-gray-400">Requiere App Password</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 p-2 bg-white dark:bg-[#0a0a0a] rounded border border-gray-200 dark:border-[#333]">
                      <div className="font-bold">Outlook</div>
                      <div>smtp.office365.com:587</div>
                      <div className="text-gray-400">Requiere App Password</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 p-2 bg-white dark:bg-[#0a0a0a] rounded border border-gray-200 dark:border-[#333]">
                      <div className="font-bold">SendGrid</div>
                      <div>smtp.sendgrid.net:587</div>
                      <div className="text-gray-400">API Key como password</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 p-2 bg-white dark:bg-[#0a0a0a] rounded border border-gray-200 dark:border-[#333]">
                      <div className="font-bold">Mailgun</div>
                      <div>smtp.mailgun.org:587</div>
                      <div className="text-gray-400">Usuario + Password</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 p-2 bg-white dark:bg-[#0a0a0a] rounded border border-gray-200 dark:border-[#333]">
                      <div className="font-bold">Amazon SES</div>
                      <div>email-smtp.region.amazonaws.com:465</div>
                      <div className="text-gray-400">SMTP Credentials</div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 italic">
                  Tu contraseña SMTP se guarda encriptada en nuestra base de datos. Solo se usa para conectar con el servidor de correo.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    )}

    {/* MODAL GALERÍA DE MEDIOS */}
    {showMediaModal && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#333] rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh]">
          <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-[#222]">
            <h3 className="font-bold flex items-center gap-2 text-gray-900 dark:text-white text-lg">
              <Grid className="text-purple-500"/> Galería de Medios
            </h3>
            <button onClick={() => { setShowMediaModal(false); mediaCallbackRef.current = null; }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-md bg-gray-100 dark:bg-[#222]">
              <X size={18} />
            </button>
          </div>

          <div className="flex border-b border-gray-200 dark:border-[#222] bg-gray-50 dark:bg-[#161616]">
            <button onClick={() => setMediaTab('all')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${mediaTab === 'all' ? 'border-b-2 border-purple-500 text-purple-500 bg-white dark:bg-[#111111]' : 'text-gray-500 hover:text-gray-700'}`}>
              Todos
            </button>
            <button onClick={() => setMediaTab('image')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${mediaTab === 'image' ? 'border-b-2 border-purple-500 text-purple-500 bg-white dark:bg-[#111111]' : 'text-gray-500 hover:text-gray-700'}`}>
              Imágenes
            </button>
            <button onClick={() => setMediaTab('gif')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${mediaTab === 'gif' ? 'border-b-2 border-purple-500 text-purple-500 bg-white dark:bg-[#111111]' : 'text-gray-500 hover:text-gray-700'}`}>
              GIFs
            </button>
            <button onClick={() => setMediaTab('icon')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${mediaTab === 'icon' ? 'border-b-2 border-purple-500 text-purple-500 bg-white dark:bg-[#111111]' : 'text-gray-500 hover:text-gray-700'}`}>
              Iconos
            </button>
          </div>

          <div className="p-4 border-b border-gray-200 dark:border-[#222] bg-gray-50 dark:bg-[#161616]">
            <input
              type="file"
              ref={mediaUploadRef}
              accept="image/*,.gif"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const nombre = file.name.replace(/\.[^/.]+$/, '');
                await uploadMedia(file, nombre);
              }}
              className="hidden"
            />
            <button
              onClick={() => mediaUploadRef.current?.click()}
              disabled={mediaLoading}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {mediaLoading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
              {mediaLoading ? 'Subiendo...' : 'Subir Nueva Imagen/GIF'}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {media.length === 0 ? (
              <div className="text-center py-10">
                <Grid size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No hay medios cargados</p>
                <p className="text-xs text-gray-400 mt-1">Sube imágenes para usarlas en tus plantillas</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3">
                {media
                  .filter(m => mediaTab === 'all' || m.tipo === mediaTab)
                  .map((m) => (
                    <div
                      key={m.id}
                      className="relative group aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-purple-500 transition-all cursor-pointer bg-gray-100 dark:bg-[#222]"
                    >
                      <img
                        src={m.url}
                        alt={m.nombre}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.src = 'https://placehold.co/150/333/FFF?text=Error';
                        }}
                      />
                      <div 
                        className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center"
                        onClick={() => {
                          console.log('Media clicked:', m.url, 'Callback:', !!mediaCallbackRef.current);
                          if (mediaCallbackRef.current) {
                            console.log('Calling mediaCallback with URL:', m.url);
                            mediaCallbackRef.current(m.url);
                            setShowMediaModal(false);
                            mediaCallbackRef.current = null;
                          } else {
                            console.error('No mediaCallback set!');
                            alert('Primero selecciona el campo donde quieres insertar la imagen');
                          }
                        }}
                      >
                        <span className="text-white font-bold opacity-0 group-hover:opacity-100 transition-all pointer-events-none">Usar</span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 text-[10px] text-white truncate pointer-events-none">
                        {m.nombre}
                      </div>
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (confirm('¿Eliminar este medio?')) {
                            await deleteMedia(m.id);
                          }
                        }}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-all z-10"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )}

    <style dangerouslySetInnerHTML={{__html: `
      .custom-scrollbar::-webkit-scrollbar { width: 5px; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
      .custom-scrollbar-main::-webkit-scrollbar { width: 8px; }
      .custom-scrollbar-main::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
      .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    `}} />

      {/* ── MODAL SELECCIÓN DE PLANTILLA ZIP ─────────────────────────────────── */}
      {zipModal && (() => {
        const ZipModal = () => {
          const [previewIdx, setPreviewIdx] = React.useState(0);
          const active = zipFiles[previewIdx];
          return (
            <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/90 backdrop-blur-md p-4" onClick={() => setZipModal(false)}>
              <div className="bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 flex-shrink-0">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">ZIP importado · {zipFiles.length} variante{zipFiles.length !== 1 ? 's' : ''}</p>
                    <h3 className="text-sm font-black text-white uppercase">Elige la versión a convertir</h3>
                  </div>
                  <button onClick={() => setZipModal(false)} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 transition-all">
                    <X size={15} />
                  </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                  {/* Panel izquierdo — lista de variantes */}
                  <div className="w-56 flex-shrink-0 border-r border-white/5 overflow-y-auto p-2 space-y-1">
                    {zipFiles.map((f, i) => (
                      <button
                        key={i}
                        onClick={() => setPreviewIdx(i)}
                        className={`w-full text-left p-3 rounded-xl transition-all ${previewIdx === i ? 'bg-[#82b440]/15 border border-[#82b440]/40' : 'hover:bg-white/[0.03] border border-transparent'}`}
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <p className={`text-[11px] font-black truncate flex-1 ${previewIdx === i ? 'text-[#82b440]' : 'text-white'}`}>{f.name}</p>
                          {f.isRecommended && (
                            <span className="text-[8px] bg-[#82b440] text-black font-black px-1.5 py-0.5 rounded-full flex-shrink-0">✓</span>
                          )}
                        </div>
                        <p className="text-[9px] text-gray-500 uppercase tracking-widest">{f.platformLabel}</p>
                        {f.variantCount > 1 && (
                          <p className="text-[9px] text-gray-600 mt-0.5">{f.variantCount} archivos similares</p>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Panel derecho — preview */}
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Info de la variante activa */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.01] flex-shrink-0">
                      <div className="flex items-center gap-3">
                        <div className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                          active?.platform === 'generic' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                        }`}>
                          {active?.platformLabel}
                        </div>
                        <p className="text-[11px] text-gray-400 font-mono">{active?.path}</p>
                      </div>
                      <button
                        onClick={() => importFromHTML(active.htmlContent, active.platformLabel)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#82b440] hover:bg-[#6c9635] text-white rounded-xl text-[11px] font-black uppercase tracking-wide transition-all"
                      >
                        <Zap size={12} /> Usar esta versión
                      </button>
                    </div>

                    {/* iframe preview */}
                    <div className="flex-1 overflow-hidden bg-white">
                      {active && (
                        <iframe
                          key={previewIdx}
                          srcDoc={active.previewHtml}
                          className="w-full h-full border-0"
                          sandbox="allow-same-origin"
                          title={active.name}
                          style={{ transform: 'scale(0.75)', transformOrigin: 'top left', width: '133.33%', height: '133.33%' }}
                        />
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          );
        };
        return <ZipModal />;
      })()}
  </div>
  );
}

// --- SUB-COMPONENTES DE PROPIEDADES ---
function ColToolBtn({ icon: Icon, label, onClick }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center p-2 hover:bg-white dark:hover:bg-[#222] rounded transition-colors border border-transparent hover:border-[#e11d48]/30">
      <Icon size={14} className="mb-1 text-gray-500" />
      <span className="text-[8px] font-bold text-gray-600 dark:text-gray-400">{label}</span>
    </button>
  );
}

function AIGenerator({ blockId, currentText, onGenerate }) {
  const [loading, setLoading] = useState(false);
  const handleAI = async () => {
    setLoading(true);
    const apiKey = ""; 
    try {
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: `Reescribe de forma profesional y persuasiva para un email marketing: "${currentText}". Responde solo con el texto mejorado.` }] }] })
      });
      const data = await resp.json();
      const txt = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if(txt) onGenerate(txt.trim());
    } catch(e) { console.error(e); }
    setLoading(false);
  };
  return <button onClick={handleAI} disabled={loading} className="w-full mb-3 bg-red-50 dark:bg-[#2a0e16] border border-[#e11d48]/30 text-[#e11d48] text-[10px] font-bold py-1.5 rounded flex items-center justify-center gap-2"><Sparkles size={12}/> {loading ? 'Generando...' : 'Optimizar con IA'}</button>;
}
function MailIcon({ className }) { return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>; }