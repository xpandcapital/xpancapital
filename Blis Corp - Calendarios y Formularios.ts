import React, { useState, useEffect } from 'react';
import { 
  Settings, Calendar as CalendarIcon, Clock, MapPin, 
  Plus, Copy, Trash2, Edit, ChevronLeft, ChevronRight, 
  Link as LinkIcon, User, Mail, Phone, AlignLeft, 
  ArrowLeft, Check, Palette, X, Users, Repeat, BookOpen, Flag, Briefcase, ChevronDown, ChevronUp, Info,
  Layout, CalendarDays, FileText, Bell, UsersRound, ToggleLeft, ToggleRight, Trash,
  Image as ImageIcon, Video, PhoneCall, Code, CalendarPlus, Share2, ExternalLink,
  UploadCloud, PlusCircle, GripVertical, Hexagon, BarChart3, Activity, Globe, Type,
  List, CheckSquare, CircleDot, Send, Link as Link2, MousePointerClick, Calendar as CalendarDate, ArrowUp, ArrowDown,
  Mail as MailIcon, MessageSquare, Database, Columns, DivideSquare, FileDigit
} from 'lucide-react';

// --- CONFIGURACIÓN DE TEMA BLIS CORP ---
const theme = {
  accent: '#f00a4a', 
  bgMain: '#050505', 
  bgCard: '#111111', 
  bgInput: '#1a1a1a', 
  border: '#222222', 
  textMain: '#ffffff',
  textMuted: '#888888'
};

// --- DATOS MOCK ---
const mockTeamMembers = [
  { id: 'usr_1', name: 'Kevin Valdez', email: 'kevin@blis-corp.com' },
  { id: 'usr_2', name: 'Ana Gómez', email: 'ana@blis-corp.com' }
];

// --- ESTRUCTURAS BASE ---
const defaultSchedule = {
  monday: { active: true, start: '09:00', end: '17:00' },
  tuesday: { active: true, start: '09:00', end: '17:00' },
  wednesday: { active: true, start: '09:00', end: '17:00' },
  thursday: { active: true, start: '09:00', end: '17:00' },
  friday: { active: true, start: '09:00', end: '17:00' },
  saturday: { active: false, start: '10:00', end: '14:00' },
  sunday: { active: false, start: '10:00', end: '14:00' },
};

const defaultFormFields = [
  { id: 'f_name', label: 'Nombre', type: 'text', required: true, system: true },
  { id: 'f_email', label: 'Correo electrónico', type: 'email', required: true, system: true }
];

const initialCalendars = [
  {
    id: '1', name: 'Entrevistas Villa Victoria', slug: 'entrevistas-villavictoria', type: 'personal',
    description: 'Esta entrevista sólo se realizará 1 día y no habrá reprogramación.',
    locationType: 'presencial', locationDetails: 'Villa Victoria - Pujilí', logo: '', backgroundColor: '#f8fafc',
    scheduleType: 'specific', specificDates: [{ date: '2026-04-20', start: '10:00', end: '15:00' }],
    primaryColor: '#f00a4a', buttonText: 'Programar reunión', assignedUsers: ['usr_1'], specificConfig: {},
    duration: 55, interval: 60, minNotice: 4, bufferBefore: 0, bufferAfter: 0, schedule: { ...defaultSchedule },
    formFields: [...defaultFormFields], allowGuests: false, requireConsent: true
  }
];

const initialForms = [
  {
    id: 'form_1', name: 'Montebello VSL', slug: 'montebello-vsl', status: 'Live', views: 72, responseCount: 2,
    fields: [
      { id: '1', type: 'text', label: 'Nombre Completo', placeholder: 'Tu nombre...', required: true },
      { id: '2', type: 'phone', label: 'Celular', placeholder: '+593...', required: true },
      { id: 'pb_1', type: 'page_break', label: 'Salto de Página' },
      { id: '3', type: 'dropdown', label: 'Motivo del contacto', required: true, options: ['Llámenme urgente', 'Quiero visitar el lote'] },
      { id: '4', type: 'textarea', label: 'Comentario', placeholder: 'Escribe aquí...', required: false }
    ],
    appearance: { 
      primaryColor: '#2dd4bf', 
      buttonTextColor: '#ffffff',
      backgroundColor: '#ffffff', 
      backgroundOpacity: 100,
      textColor: '#111111',
      inputBgColor: '#ffffff',
      inputBorderColor: '#e5e7eb',
      inputTextColor: '#111111',
      placeholderColor: '#9ca3af',
      focusColor: '#2dd4bf',
      borderRadius: '12',
      paddingTop: '32',
      paddingBottom: '32',
      paddingLeft: '24',
      paddingRight: '24',
      showButton: true
    },
    flowSteps: [
      { id: 'fs_2', type: 'webhook', title: 'Webhook Pabbly', url: 'https://connect.pabbly.com/...' },
      { id: 'fs_3', type: 'redirect', title: 'WhatsApp Redirect', url: 'https://wa.me/593939...' }
    ],
    submitText: 'Contáctenme'
  }
];

// --- FUNCIONES AUXILIARES ---
const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

const hexToRgba = (hex, opacity) => {
  let c;
  if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
    c= hex.substring(1).split('');
    if(c.length== 3){
      c= [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c= '0x'+c.join('');
    return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+','+(opacity/100)+')';
  }
  return hex;
};

const calendarTypeLabels = {
  'personal': 'Reserva personal',
  'rotacion': 'Rotación',
  'clases': 'Reserva de clases',
  'colectiva': 'Reserva colectiva',
  'eventos': 'Calendario de eventos',
  'servicio': 'Reserva de servicio'
};

// Fallback de Copiar al Portapapeles (Evita problemas de permisos en iframes)
const copyTextToClipboard = (text) => {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";
  document.body.appendChild(textArea);
  textArea.select();
  try {
    document.execCommand('copy');
  } catch (err) {
    console.error('Error al copiar', err);
  }
  document.body.removeChild(textArea);
};

// --- COMPONENTE PRINCIPAL ---
export default function App() {
  const [activeModule, setActiveModule] = useState('forms');
  
  // Estado Calendarios
  const [calendars, setCalendars] = useState(initialCalendars);
  const [currentCalView, setCurrentCalView] = useState('list'); 
  const [activeCalendarId, setActiveCalendarId] = useState(null);
  const [showCalTypeModal, setShowCalTypeModal] = useState(false);
  
  // Estado Formularios
  const [forms, setForms] = useState(initialForms);
  const [currentFormView, setCurrentFormView] = useState('list');
  const [activeFormId, setActiveFormId] = useState(null);

  const activeCalendar = calendars.find(c => c.id === activeCalendarId);
  const activeForm = forms.find(f => f.id === activeFormId);

  const handleCreateCal = (type) => {
    const newCalendar = {
      id: Date.now().toString(), name: 'Nuevo Calendario', slug: `calendario-${Date.now().toString().slice(-4)}`,
      type: type, description: '', locationType: 'videoconferencia', locationDetails: '', logo: '', backgroundColor: '#f8fafc',
      scheduleType: 'weekly', specificDates: [], primaryColor: '#f00a4a', buttonText: 'Programar', assignedUsers: [], specificConfig: {},
      duration: 30, interval: 30, minNotice: 4, bufferBefore: 0, bufferAfter: 0, schedule: { ...defaultSchedule },
      formFields: [...defaultFormFields], allowGuests: false, requireConsent: false
    };
    setCalendars([...calendars, newCalendar]);
    setActiveCalendarId(newCalendar.id);
    setShowCalTypeModal(false);
    setCurrentCalView('edit');
  };

  const handleCreateForm = () => {
    const newForm = {
      id: `form_${Date.now()}`, name: 'Nuevo Formulario', slug: `form-${Date.now().toString().slice(-4)}`, status: 'Draft', views: 0, responseCount: 0,
      fields: [ { id: 'f1', type: 'text', label: 'Nombre Completo', placeholder: 'Tu nombre...', required: true } ],
      appearance: { 
        primaryColor: '#f00a4a', buttonTextColor: '#ffffff', backgroundColor: '#ffffff', backgroundOpacity: 100,
        textColor: '#111111', inputBgColor: '#f9fafb', inputBorderColor: '#e5e7eb', inputTextColor: '#111111',
        placeholderColor: '#9ca3af', focusColor: '#f00a4a',
        borderRadius: '12', paddingTop: '24', paddingBottom: '24', paddingLeft: '24', paddingRight: '24', showButton: true
      },
      flowSteps: [],
      submitText: 'Enviar'
    };
    setForms([...forms, newForm]);
    setActiveFormId(newForm.id);
    setCurrentFormView('edit');
  };

  if (activeModule === 'calendars' && currentCalView === 'public' && activeCalendar) {
    return <PublicBookingView calendar={activeCalendar} onClose={() => setCurrentCalView('list')} />;
  }
  if (activeModule === 'calendars' && currentCalView === 'edit' && activeCalendar) {
    return <AdminEditor calendar={activeCalendar} onSave={(c) => setCalendars(calendars.map(x => x.id === c.id ? c : x))} onBack={() => setCurrentCalView('list')} />;
  }
  if (activeModule === 'forms' && currentFormView === 'public' && activeForm) {
    return <PublicFormView form={activeForm} onClose={() => setCurrentFormView('list')} />;
  }
  if (activeModule === 'forms' && currentFormView === 'edit' && activeForm) {
    return <FormEditor form={activeForm} onSave={(f) => setForms(forms.map(x => x.id === f.id ? f : x))} onBack={() => setCurrentFormView('list')} />;
  }

  return (
    <div className="flex h-screen bg-[#050505] font-sans text-gray-200 selection:bg-[#f00a4a] selection:text-white">
      {/* Sidebar Lateral */}
      <div className="w-64 bg-[#0a0a0a] border-r border-[#1a1a1a] flex flex-col hidden md:flex z-10">
        <div className="h-20 flex items-center px-6 border-b border-[#1a1a1a]">
          <div className="flex items-center gap-3 text-xl font-bold text-white tracking-widest uppercase">
            <Hexagon size={28} className="text-[#f00a4a] fill-[#f00a4a]/20" />
            BLIS <span className="text-gray-500 font-light">CORP</span>
          </div>
        </div>
        <div className="p-4 flex-1 overflow-y-auto mt-4 space-y-6">
          <div>
            <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3 px-2">Gestión Pro</div>
            <nav className="space-y-1">
              <button onClick={() => setActiveModule('calendars')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold ${activeModule === 'calendars' ? 'bg-[#f00a4a]/10 text-[#f00a4a] border border-[#f00a4a]/20 shadow-inner' : 'text-gray-400 hover:text-white hover:bg-[#111111] border border-transparent'}`}>
                <CalendarIcon size={18} /> Calendarios
              </button>
              <button onClick={() => setActiveModule('forms')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold ${activeModule === 'forms' ? 'bg-[#f00a4a]/10 text-[#f00a4a] border border-[#f00a4a]/20 shadow-inner' : 'text-gray-400 hover:text-white hover:bg-[#111111] border border-transparent'}`}>
                <FileText size={18} /> Formularios
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#050505]">
        {activeModule === 'calendars' && (
          <>
            <header className="h-20 border-b border-[#1a1a1a] flex items-center justify-between px-8 z-10 bg-[#0a0a0a]">
              <h1 className="text-xl font-black text-white tracking-wide uppercase flex items-center gap-3">
                <CalendarDays size={20} className="text-[#f00a4a]" /> Calendarios
              </h1>
              <button onClick={() => setShowCalTypeModal(true)} className="bg-[#f00a4a] hover:bg-[#d0003a] text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(240,10,74,0.2)] transition-all">
                <Plus size={18} /> Nuevo Calendario
              </button>
            </header>
            <main className="flex-1 overflow-y-auto p-8">
               <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {calendars.map(calendar => (
                  <div key={calendar.id} className="bg-[#111111] rounded-2xl border border-[#222222] p-6 hover:border-[#f00a4a]/50 transition-all flex flex-col relative shadow-lg">
                    <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: calendar.primaryColor }}></div>
                    <div className="flex items-start justify-between mb-5 mt-2">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border border-white/5" style={{ backgroundColor: '#1a1a1a', color: calendar.primaryColor }}>
                           {calendar.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-lg">{calendar.name}</h3>
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{calendar.type}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-[#222]">
                      <button onClick={() => { setActiveCalendarId(calendar.id); setCurrentCalView('edit'); }} className="p-2 text-gray-400 hover:text-white hover:bg-[#222] rounded-lg"><Edit size={16}/></button>
                      <button onClick={() => { setActiveCalendarId(calendar.id); setCurrentCalView('public'); }} className="text-xs font-bold text-white bg-[#1a1a1a] hover:bg-[#222] border border-[#333] px-4 py-2 rounded-lg">VER PÚBLICO</button>
                    </div>
                  </div>
                ))}
              </div>
            </main>
          </>
        )}

        {activeModule === 'forms' && (
          <>
            <header className="h-20 border-b border-[#1a1a1a] flex items-center justify-between px-8 z-10 bg-[#0a0a0a]">
              <h1 className="text-xl font-black text-white tracking-wide uppercase flex items-center gap-3">
                <FileText size={20} className="text-[#f00a4a]" /> Formularios
              </h1>
              <button onClick={handleCreateForm} className="bg-[#f00a4a] hover:bg-[#d0003a] text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(240,10,74,0.2)] transition-all">
                <Plus size={18} /> Nuevo Formulario
              </button>
            </header>
            <main className="flex-1 overflow-y-auto p-8">
              <div className="max-w-7xl mx-auto mb-10">
                <div className="grid grid-cols-4 gap-6">
                  <div className="bg-[#111] border border-[#222] p-6 rounded-2xl shadow-lg">
                    <p className="text-xs text-gray-500 font-bold uppercase mb-2">Visitantes</p>
                    <p className="text-3xl font-black text-white flex items-end gap-3">
                      {forms.reduce((a, b) => a + b.views, 0)} <span className="text-xs text-emerald-500 mb-1 flex items-center"><Activity size={12}/> +12%</span>
                    </p>
                  </div>
                  <div className="bg-[#111] border border-[#222] p-6 rounded-2xl shadow-lg">
                    <p className="text-xs text-gray-500 font-bold uppercase mb-2">Respuestas</p>
                    <p className="text-3xl font-black text-white flex items-end gap-3">
                      {forms.reduce((a, b) => a + b.responseCount, 0)} <span className="text-xs text-emerald-500 mb-1 flex items-center"><Activity size={12}/> +5%</span>
                    </p>
                  </div>
                  <div className="bg-[#111] border border-[#222] p-6 rounded-2xl shadow-lg">
                    <p className="text-xs text-gray-500 font-bold uppercase mb-2">Conversión</p>
                    <p className="text-3xl font-black text-white flex items-end gap-3">
                      {forms.reduce((a, b) => a + b.views, 0) > 0 ? Math.round((forms.reduce((a, b) => a + b.responseCount, 0) / forms.reduce((a, b) => a + b.views, 0)) * 100) : 0}%
                    </p>
                  </div>
                  <div className="bg-[#111] border border-[#222] p-6 rounded-2xl shadow-lg">
                    <p className="text-xs text-gray-500 font-bold uppercase mb-2">Límite Mensual</p>
                    <p className="text-xl font-bold text-gray-300 mt-2"><span className="text-white">957</span> / 10k</p>
                    <div className="w-full bg-[#222] h-1.5 rounded-full mt-3 overflow-hidden"><div className="bg-[#f00a4a] h-full" style={{ width: '9.5%' }}></div></div>
                  </div>
                </div>
              </div>

              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {forms.map(form => (
                    <div key={form.id} className="bg-[#111111] rounded-2xl border border-[#222222] p-6 hover:border-[#f00a4a]/50 transition-all flex flex-col relative shadow-lg group">
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{form.status}</span>
                          </div>
                          <h3 className="font-bold text-white text-xl">{form.name}</h3>
                          <p className="text-xs text-gray-500 mt-1">/f/{form.slug}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-[#222]">
                        <button onClick={() => { setActiveFormId(form.id); setCurrentFormView('edit'); }} className="bg-white text-black px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors">
                          Editar Formulario
                        </button>
                        <div className="flex gap-1">
                          <button onClick={() => { setActiveFormId(form.id); setCurrentFormView('public'); }} className="p-2 text-gray-400 hover:text-white hover:bg-[#222] rounded-lg" title="Ver Público">
                            <ExternalLink size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </main>
          </>
        )}

        {showCalTypeModal && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#0a0a0a] border border-[#222] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-[#222] bg-[#0a0a0a]">
                <h2 className="text-xl font-black text-white uppercase tracking-wide">Elige el tipo</h2>
                <button onClick={() => setShowCalTypeModal(false)} className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-[#222]"><X size={24} /></button>
              </div>
              <div className="p-8 grid grid-cols-2 gap-4">
                 <button onClick={() => handleCreateCal('personal')} className="p-6 border border-[#222] hover:border-[#f00a4a] rounded-xl text-left bg-[#111]">
                   <h3 className="text-lg font-bold text-white">Personal</h3>
                   <p className="text-sm text-gray-400 mt-2">Reuniones 1 a 1.</p>
                 </button>
                 <button onClick={() => handleCreateCal('clases')} className="p-6 border border-[#222] hover:border-[#f00a4a] rounded-xl text-left bg-[#111]">
                   <h3 className="text-lg font-bold text-white">Reserva de Clases</h3>
                   <p className="text-sm text-gray-400 mt-2">Múltiples asistentes por evento.</p>
                 </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// MÓDULO FORMULARIOS: EDITOR (AVANZADO)
// ==========================================
function FormEditor({ form, onSave, onBack }) {
  const [formData, setFormData] = useState({ ...form });
  const [activeTab, setActiveTab] = useState('build'); // build, flow, responses, share
  const [activeFieldId, setActiveFieldId] = useState(null);
  const [showNodeMenu, setShowNodeMenu] = useState(false);

  const activeField = formData.fields.find(f => f.id === activeFieldId);

  const handleUpdateField = (id, updates) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(f => f.id === id ? { ...f, ...updates } : f)
    }));
  };

  const handleUpdateAppearance = (key, value) => {
    setFormData(prev => ({ ...prev, appearance: { ...prev.appearance, [key]: value } }));
  };

  const handleAddField = (type) => {
    const newField = { 
      id: `f_${Date.now()}`, 
      type, 
      label: type === 'page_break' ? 'Salto de Página' : `Nuevo campo`, 
      required: false,
      placeholder: 'Escribe aquí...',
      options: (type === 'dropdown' || type === 'radio' || type === 'checkbox') ? ['Opción 1', 'Opción 2'] : undefined
    };
    setFormData(prev => ({ ...prev, fields: [...prev.fields, newField] }));
    if(type !== 'page_break') setActiveFieldId(newField.id);
  };

  const handleDeleteField = (id) => {
    setFormData(prev => ({ ...prev, fields: prev.fields.filter(f => f.id !== id) }));
    if (activeFieldId === id) setActiveFieldId(null);
  };

  const handleMoveField = (index, direction) => {
    const newFields = [...formData.fields];
    if (direction === 'up' && index > 0) {
      [newFields[index - 1], newFields[index]] = [newFields[index], newFields[index - 1]];
    } else if (direction === 'down' && index < newFields.length - 1) {
      [newFields[index + 1], newFields[index]] = [newFields[index], newFields[index + 1]];
    }
    setFormData(prev => ({ ...prev, fields: newFields }));
  };

  const handleAddFlowStep = (type, title) => {
    const newStep = { id: `fs_${Date.now()}`, type, title, url: '' };
    setFormData(prev => ({ ...prev, flowSteps: [...prev.flowSteps, newStep] }));
    setShowNodeMenu(false);
  };

  const handleUpdateFlowStep = (id, url) => {
    setFormData(prev => ({
      ...prev,
      flowSteps: prev.flowSteps.map(fs => fs.id === id ? { ...fs, url } : fs)
    }));
  };

  const handleDeleteFlowStep = (id) => {
    setFormData(prev => ({ ...prev, flowSteps: prev.flowSteps.filter(fs => fs.id !== id) }));
  };

  // Cálculo de páginas para la pestaña Flow
  const formPages = [];
  let currPage = [];
  formData.fields.forEach(f => {
    if(f.type === 'page_break') { formPages.push(currPage); currPage = []; }
    else { currPage.push(f); }
  });
  formPages.push(currPage);

  return (
    <div className="flex flex-col h-screen bg-[#050505] font-sans text-gray-200">
      {/* HEADER */}
      <header className="h-16 bg-[#0a0a0a] border-b border-[#222] flex items-center justify-between px-6 flex-shrink-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-8 h-8 flex items-center justify-center bg-[#f00a4a] text-white rounded shadow-lg hover:bg-[#d0003a]">
             <FileText size={16} />
          </button>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <input 
              type="text" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              className="bg-transparent text-white font-bold outline-none border-b border-transparent hover:border-[#333] focus:border-[#f00a4a] transition-colors"
            />
          </div>
        </div>

        <div className="flex bg-[#111] rounded-lg p-1 border border-[#222]">
          <button onClick={() => setActiveTab('build')} className={`px-6 py-1.5 rounded-md text-sm font-bold transition-colors ${activeTab === 'build' ? 'bg-[#222] text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}>Constructor</button>
          <button onClick={() => setActiveTab('flow')} className={`px-6 py-1.5 rounded-md text-sm font-bold transition-colors ${activeTab === 'flow' ? 'bg-[#222] text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}>Flujo</button>
          <button onClick={() => setActiveTab('responses')} className={`px-6 py-1.5 rounded-md text-sm font-bold transition-colors ${activeTab === 'responses' ? 'bg-[#222] text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}>Respuestas</button>
          <button onClick={() => setActiveTab('share')} className={`px-6 py-1.5 rounded-md text-sm font-bold transition-colors ${activeTab === 'share' ? 'bg-[#222] text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}>Compartir</button>
        </div>

        <button onClick={() => { onSave(formData); onBack(); }} className="bg-white text-black hover:bg-gray-200 px-6 py-2 rounded-lg font-bold text-sm transition-all shadow-[0_0_10px_rgba(255,255,255,0.2)]">
          Guardar
        </button>
      </header>

      {/* CONSTRUCTOR (BUILDER) */}
      {activeTab === 'build' && (
        <div className="flex flex-1 overflow-hidden">
          {/* LEFT PANEL: ELEMENTOS & DISEÑO GLOBAL */}
          <div className="w-[320px] bg-[#0a0a0a] border-r border-[#222] flex flex-col p-5 overflow-y-auto custom-scrollbar-dark shrink-0">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 mt-2 flex items-center gap-2"><PlusCircle size={14}/> Agregar Campos</h3>
            <div className="grid grid-cols-2 gap-2">
              <BuilderButton icon={Type} label="Texto" onClick={() => handleAddField('text')} />
              <BuilderButton icon={AlignLeft} label="Área de Texto" onClick={() => handleAddField('textarea')} />
              <BuilderButton icon={Mail} label="Email" onClick={() => handleAddField('email')} />
              <BuilderButton icon={Phone} label="Teléfono" onClick={() => handleAddField('phone')} />
              <BuilderButton icon={ChevronDown} label="Desplegable" onClick={() => handleAddField('dropdown')} />
              <BuilderButton icon={CircleDot} label="Única opc." onClick={() => handleAddField('radio')} />
              <BuilderButton icon={CheckSquare} label="Casillas" onClick={() => handleAddField('checkbox')} />
              <BuilderButton icon={CalendarDate} label="Fecha" onClick={() => handleAddField('date')} />
              <BuilderButton icon={Clock} label="Hora" onClick={() => handleAddField('time')} />
              <BuilderButton icon={Link2} label="Enlace URL" onClick={() => handleAddField('url')} />
              <div className="col-span-2">
                 <button onClick={() => handleAddField('page_break')} className="w-full flex items-center justify-center gap-2 bg-[#111] hover:bg-[#1a1a1a] border border-[#222] hover:border-[#f00a4a] text-gray-400 hover:text-white p-3 rounded-xl transition-all">
                    <DivideSquare size={16} /> <span className="text-[10px] font-bold uppercase tracking-wider">Salto de Página</span>
                 </button>
              </div>
            </div>

            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 mt-10 flex items-center gap-2"><Palette size={14}/> Diseño Global</h3>
            <div className="space-y-5 bg-[#111] p-4 rounded-xl border border-[#222]">
              <div>
                <label className="text-[11px] text-gray-400 font-bold mb-2 block">Fondo del Contenedor</label>
                <div className="flex gap-2 mb-2">
                  <input type="color" value={formData.appearance.backgroundColor} onChange={e => handleUpdateAppearance('backgroundColor', e.target.value)} className="h-8 w-8 rounded cursor-pointer border border-[#333] p-0 bg-transparent" />
                  <input type="text" value={formData.appearance.backgroundColor} onChange={e => handleUpdateAppearance('backgroundColor', e.target.value)} className="flex-1 bg-[#1a1a1a] border border-[#333] text-white rounded px-2 text-xs uppercase" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-gray-500">Opacidad</span>
                  <input type="range" min="0" max="100" value={formData.appearance.backgroundOpacity} onChange={e => handleUpdateAppearance('backgroundOpacity', e.target.value)} className="flex-1 accent-[#f00a4a]" />
                  <span className="text-[10px] text-gray-400 w-6 text-right">{formData.appearance.backgroundOpacity}%</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-gray-400 font-bold mb-2 block">Paddings (Espaciado interno)</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center bg-[#1a1a1a] border border-[#333] rounded px-2">
                    <span className="text-[9px] text-gray-500 w-4">Top</span>
                    <input type="number" value={formData.appearance.paddingTop} onChange={e => handleUpdateAppearance('paddingTop', e.target.value)} className="w-full bg-transparent text-white py-1.5 text-xs text-right outline-none" />
                  </div>
                  <div className="flex items-center bg-[#1a1a1a] border border-[#333] rounded px-2">
                    <span className="text-[9px] text-gray-500 w-4">Bot</span>
                    <input type="number" value={formData.appearance.paddingBottom} onChange={e => handleUpdateAppearance('paddingBottom', e.target.value)} className="w-full bg-transparent text-white py-1.5 text-xs text-right outline-none" />
                  </div>
                  <div className="flex items-center bg-[#1a1a1a] border border-[#333] rounded px-2">
                    <span className="text-[9px] text-gray-500 w-4">Izq</span>
                    <input type="number" value={formData.appearance.paddingLeft} onChange={e => handleUpdateAppearance('paddingLeft', e.target.value)} className="w-full bg-transparent text-white py-1.5 text-xs text-right outline-none" />
                  </div>
                  <div className="flex items-center bg-[#1a1a1a] border border-[#333] rounded px-2">
                    <span className="text-[9px] text-gray-500 w-4">Der</span>
                    <input type="number" value={formData.appearance.paddingRight} onChange={e => handleUpdateAppearance('paddingRight', e.target.value)} className="w-full bg-transparent text-white py-1.5 text-xs text-right outline-none" />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-[11px] text-gray-400 font-bold mb-2 block">Redondeo (Border Radius)</label>
                <input type="number" value={formData.appearance.borderRadius} onChange={e => handleUpdateAppearance('borderRadius', e.target.value)} className="w-full bg-[#1a1a1a] border border-[#333] text-white rounded px-2 py-1.5 text-xs" />
              </div>

              <div className="border-t border-[#333] pt-4">
                <label className="text-[11px] text-gray-400 font-bold mb-2 block">Estilo de Textos</label>
                <div className="flex gap-2 items-center mb-2">
                  <span className="text-[10px] text-gray-500 w-16">Etiquetas</span>
                  <input type="color" value={formData.appearance.textColor} onChange={e => handleUpdateAppearance('textColor', e.target.value)} className="h-6 w-6 rounded cursor-pointer border border-[#333] p-0" />
                  <input type="text" value={formData.appearance.textColor} onChange={e => handleUpdateAppearance('textColor', e.target.value)} className="flex-1 bg-[#1a1a1a] border border-[#333] text-white rounded px-2 text-[10px] uppercase" />
                </div>
                <div className="flex gap-2 items-center">
                  <span className="text-[10px] text-gray-500 w-16">Placeholder</span>
                  <input type="color" value={formData.appearance.placeholderColor} onChange={e => handleUpdateAppearance('placeholderColor', e.target.value)} className="h-6 w-6 rounded border border-[#333] p-0" />
                  <input type="text" value={formData.appearance.placeholderColor} onChange={e => handleUpdateAppearance('placeholderColor', e.target.value)} className="flex-1 bg-[#1a1a1a] border border-[#333] text-white rounded px-2 text-[10px] uppercase" />
                </div>
              </div>

              <div className="border-t border-[#333] pt-4">
                <label className="text-[11px] text-gray-400 font-bold mb-2 block">Diseño de Inputs</label>
                <div className="space-y-2">
                  <div className="flex gap-2 items-center">
                    <span className="text-[10px] text-gray-500 w-16">Fondo</span>
                    <input type="color" value={formData.appearance.inputBgColor} onChange={e => handleUpdateAppearance('inputBgColor', e.target.value)} className="h-6 w-6 rounded border border-[#333] p-0" />
                    <input type="text" value={formData.appearance.inputBgColor} onChange={e => handleUpdateAppearance('inputBgColor', e.target.value)} className="flex-1 bg-[#1a1a1a] border border-[#333] text-white rounded px-2 text-[10px] uppercase" />
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="text-[10px] text-gray-500 w-16">Borde normal</span>
                    <input type="color" value={formData.appearance.inputBorderColor} onChange={e => handleUpdateAppearance('inputBorderColor', e.target.value)} className="h-6 w-6 rounded border border-[#333] p-0" />
                    <input type="text" value={formData.appearance.inputBorderColor} onChange={e => handleUpdateAppearance('inputBorderColor', e.target.value)} className="flex-1 bg-[#1a1a1a] border border-[#333] text-white rounded px-2 text-[10px] uppercase" />
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="text-[10px] text-gray-500 w-16">Seleccionado</span>
                    <input type="color" value={formData.appearance.focusColor} onChange={e => handleUpdateAppearance('focusColor', e.target.value)} className="h-6 w-6 rounded border border-[#333] p-0" />
                    <input type="text" value={formData.appearance.focusColor} onChange={e => handleUpdateAppearance('focusColor', e.target.value)} className="flex-1 bg-[#1a1a1a] border border-[#333] text-white rounded px-2 text-[10px] uppercase" />
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="text-[10px] text-gray-500 w-16">Texto inside</span>
                    <input type="color" value={formData.appearance.inputTextColor} onChange={e => handleUpdateAppearance('inputTextColor', e.target.value)} className="h-6 w-6 rounded border border-[#333] p-0" />
                    <input type="text" value={formData.appearance.inputTextColor} onChange={e => handleUpdateAppearance('inputTextColor', e.target.value)} className="flex-1 bg-[#1a1a1a] border border-[#333] text-white rounded px-2 text-[10px] uppercase" />
                  </div>
                </div>
              </div>

              <div className="border-t border-[#333] pt-4">
                 <div className="flex items-center justify-between mb-3">
                   <label className="text-[11px] text-gray-400 font-bold block">Botón Final</label>
                   <label className="flex items-center gap-2 cursor-pointer">
                     <span className="text-[10px] text-gray-500">Mostrar</span>
                     <div className={`w-8 h-4 rounded-full relative transition-colors ${formData.appearance.showButton ? 'bg-[#f00a4a]' : 'bg-[#333]'}`}>
                       <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all ${formData.appearance.showButton ? 'left-4.5 right-0.5' : 'left-0.5'}`}></div>
                       <input type="checkbox" checked={formData.appearance.showButton} onChange={(e) => handleUpdateAppearance('showButton', e.target.checked)} className="hidden" />
                     </div>
                   </label>
                 </div>
                 {formData.appearance.showButton && (
                   <div className="space-y-3">
                     <div className="flex gap-2 items-center">
                        <span className="text-[10px] text-gray-500 w-12">Fondo</span>
                        <input type="color" value={formData.appearance.primaryColor} onChange={e => handleUpdateAppearance('primaryColor', e.target.value)} className="h-6 w-6 rounded border border-[#333] p-0" />
                     </div>
                     <div className="flex gap-2 items-center">
                        <span className="text-[10px] text-gray-500 w-12">Texto</span>
                        <input type="color" value={formData.appearance.buttonTextColor} onChange={e => handleUpdateAppearance('buttonTextColor', e.target.value)} className="h-6 w-6 rounded border border-[#333] p-0" />
                     </div>
                     <input type="text" value={formData.submitText} onChange={e => setFormData({...formData, submitText: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#333] text-white rounded px-3 py-2 text-xs outline-none focus:border-[#f00a4a]" placeholder="Texto del botón" />
                   </div>
                 )}
              </div>
            </div>
          </div>

          {/* CENTER PANEL: CANVAS (LIENZO) CORREGIDO SCROLL */}
          <div className="flex-1 bg-[#111111] overflow-y-auto relative custom-scrollbar-dark">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
             
             <div className="min-h-full py-10 px-4 md:px-10 flex flex-col items-center">
               
               <div 
                 className="w-full max-w-xl shadow-2xl flex flex-col z-10 transition-all duration-300 relative border border-[#333]" 
                 style={{ 
                   backgroundColor: hexToRgba(formData.appearance.backgroundColor, formData.appearance.backgroundOpacity),
                   borderRadius: `${formData.appearance.borderRadius}px`,
                   backdropFilter: formData.appearance.backgroundOpacity < 100 ? 'blur(10px)' : 'none',
                   overflow: 'visible' 
                 }}
               >
                 <div className="h-2 w-full absolute top-0 left-0 right-0 z-20" style={{ backgroundColor: formData.appearance.primaryColor, borderTopLeftRadius: `${formData.appearance.borderRadius}px`, borderTopRightRadius: `${formData.appearance.borderRadius}px` }}></div>
                 
                 <div className="flex-1 flex flex-col gap-6 relative z-10" style={{ 
                    paddingTop: `${formData.appearance.paddingTop}px`,
                    paddingBottom: `${formData.appearance.paddingBottom}px`,
                    paddingLeft: `${formData.appearance.paddingLeft}px`,
                    paddingRight: `${formData.appearance.paddingRight}px`
                 }}>
                   
                   {formData.fields.length === 0 ? (
                     <div className="flex-1 flex items-center justify-center border-2 border-dashed border-[#444] rounded-xl p-10 text-gray-500 text-center flex-col gap-3">
                       <PlusCircle size={32} className="opacity-50" />
                       <p className="text-sm font-medium">El formulario está vacío.<br/>Añade elementos desde el panel izquierdo.</p>
                     </div>
                   ) : (
                     formData.fields.map((field, index) => {
                       
                       if (field.type === 'page_break') {
                         return (
                           <div key={field.id} className="relative group my-4">
                              <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t-2 border-dashed border-[#f00a4a]/40"></div></div>
                              <div className="relative flex justify-center">
                                <span className="bg-[#111] px-4 text-xs font-bold text-[#f00a4a] tracking-widest uppercase rounded-full border border-[#f00a4a]/40">Salto de Página</span>
                              </div>
                              <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#111] shadow-xl border border-[#333] rounded-lg flex overflow-hidden z-20">
                               <button onClick={(e) => { e.stopPropagation(); handleMoveField(index, 'up'); }} disabled={index === 0} className="p-2 text-gray-400 hover:text-white hover:bg-[#222] disabled:opacity-30"><ArrowUp size={14}/></button>
                               <button onClick={(e) => { e.stopPropagation(); handleMoveField(index, 'down'); }} disabled={index === formData.fields.length - 1} className="p-2 text-gray-400 hover:text-white hover:bg-[#222] border-x border-[#333] disabled:opacity-30"><ArrowDown size={14}/></button>
                               <button onClick={(e) => { e.stopPropagation(); handleDeleteField(field.id); }} className="p-2 text-gray-400 hover:text-[#f00a4a] hover:bg-[#f00a4a]/10"><Trash2 size={14}/></button>
                             </div>
                           </div>
                         );
                       }

                       return (
                         <div 
                           key={field.id} 
                           onClick={() => setActiveFieldId(field.id)}
                           className={`relative p-3 -mx-3 rounded-xl cursor-pointer transition-all border-2 ${activeFieldId === field.id ? 'border-[#f00a4a] bg-black/20' : 'border-transparent hover:border-[#333] hover:bg-black/10'}`}
                         >
                           <label className="block text-sm font-bold mb-2 transition-colors" style={{ color: formData.appearance.textColor }}>
                             {field.label} {field.required && <span className="text-[#f00a4a] ml-1">*</span>}
                           </label>

                           {/* MOCK UI PARA CAMPOS */}
                           <div 
                             className="w-full border rounded-lg px-3 py-2.5 text-sm flex items-center gap-2 overflow-hidden transition-colors"
                             style={{ 
                               backgroundColor: formData.appearance.inputBgColor, 
                               borderColor: activeFieldId === field.id ? formData.appearance.focusColor : formData.appearance.inputBorderColor,
                               color: formData.appearance.inputTextColor,
                               minHeight: field.type === 'textarea' ? '80px' : 'auto'
                             }}
                           >
                             {field.type === 'phone' && <span className="font-medium pr-2 border-r opacity-60" style={{ borderColor: formData.appearance.inputBorderColor }}>🇪🇨 +593</span>}
                             {field.type === 'dropdown' ? (
                               <div className="flex justify-between items-center w-full"><span style={{color: formData.appearance.placeholderColor}}>{field.placeholder || 'Selecciona una opción'}</span><ChevronDown size={16}/></div>
                             ) : field.type === 'file' ? (
                               <div className="w-full text-center flex flex-col items-center gap-1 py-2" style={{color: formData.appearance.placeholderColor}}><UploadCloud size={16} /> Cargar archivo</div>
                             ) : field.type === 'date' ? (
                               <div className="flex justify-between items-center w-full"><span style={{color: formData.appearance.placeholderColor}}>dd/mm/aaaa</span><CalendarDate size={16}/></div>
                             ) : field.type === 'time' ? (
                               <div className="flex justify-between items-center w-full"><span style={{color: formData.appearance.placeholderColor}}>--:--</span><Clock size={16}/></div>
                             ) : field.type === 'url' ? (
                               <div className="flex items-center w-full gap-2"><Link2 size={16}/><span style={{color: formData.appearance.placeholderColor}}>{field.placeholder || 'https://...'}</span></div>
                             ) : (
                               <span style={{color: formData.appearance.placeholderColor}}>{field.placeholder || 'Escribe aquí...'}</span>
                             )}
                           </div>

                           {/* Action Overlay */}
                           {activeFieldId === field.id && (
                             <div className="absolute right-0 -top-6 bg-[#111] shadow-xl border border-[#333] rounded-lg flex overflow-hidden z-20">
                               <button onClick={(e) => { e.stopPropagation(); handleMoveField(index, 'up'); }} disabled={index === 0} className="p-2 text-gray-400 hover:text-white hover:bg-[#222] disabled:opacity-30 disabled:hover:bg-transparent"><ArrowUp size={16}/></button>
                               <button onClick={(e) => { e.stopPropagation(); handleMoveField(index, 'down'); }} disabled={index === formData.fields.length - 1} className="p-2 text-gray-400 hover:text-white hover:bg-[#222] border-x border-[#333] disabled:opacity-30 disabled:hover:bg-transparent"><ArrowDown size={16}/></button>
                               <button onClick={(e) => { e.stopPropagation(); handleDeleteField(field.id); }} className="p-2 text-gray-400 hover:text-[#f00a4a] hover:bg-[#f00a4a]/10"><Trash2 size={16}/></button>
                             </div>
                           )}
                         </div>
                       )
                     })
                   )}

                   {formData.appearance.showButton && (
                     <div className="mt-2">
                       <button className="w-full py-3.5 rounded-lg font-bold text-sm shadow-lg transition-transform hover:scale-[1.02]" style={{ backgroundColor: formData.appearance.primaryColor, color: formData.appearance.buttonTextColor, borderRadius: `${formData.appearance.borderRadius}px` }}>
                         {formData.submitText}
                       </button>
                     </div>
                   )}
                 </div>
               </div>
             </div>
          </div>

          {/* RIGHT PANEL: PROPIEDADES DEL CAMPO ACTIVO */}
          <div className="w-[320px] bg-[#0a0a0a] border-l border-[#222] flex flex-col p-6 overflow-y-auto custom-scrollbar-dark shrink-0">
            <h3 className="text-[12px] font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2"><Settings size={16} className="text-[#f00a4a]"/> Propiedades del Campo</h3>
            
            {activeField ? (
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Etiqueta (Pregunta)</label>
                  <input type="text" value={activeField.label} onChange={(e) => handleUpdateField(activeField.id, { label: e.target.value })} className="w-full bg-[#1a1a1a] border border-[#333] text-white rounded-lg px-3 py-2.5 outline-none focus:border-[#f00a4a] text-sm" />
                </div>
                
                {['text', 'textarea', 'email', 'phone', 'url'].includes(activeField.type) && (
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Texto de ejemplo (Placeholder)</label>
                    <input type="text" value={activeField.placeholder || ''} onChange={(e) => handleUpdateField(activeField.id, { placeholder: e.target.value })} className="w-full bg-[#1a1a1a] border border-[#333] text-white rounded-lg px-3 py-2.5 outline-none focus:border-[#f00a4a] text-sm" />
                  </div>
                )}

                {['dropdown', 'radio', 'checkbox'].includes(activeField.type) && (
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 block flex items-center justify-between">
                      Opciones
                      <button onClick={() => handleUpdateField(activeField.id, { options: [...activeField.options, `Opción ${activeField.options.length + 1}`] })} className="text-[#f00a4a] hover:text-white flex items-center gap-1 bg-[#1a1a1a] px-2 py-1 rounded"><Plus size={12}/> Añadir</button>
                    </label>
                    <div className="space-y-2">
                      {activeField.options.map((opt, i) => (
                        <div key={i} className="flex gap-2">
                          <input type="text" value={opt} onChange={(e) => {
                            const newOpts = [...activeField.options]; newOpts[i] = e.target.value;
                            handleUpdateField(activeField.id, { options: newOpts });
                          }} className="flex-1 bg-[#1a1a1a] border border-[#333] text-white rounded-md px-3 py-2 outline-none focus:border-[#f00a4a] text-sm" />
                          <button onClick={() => {
                            const newOpts = activeField.options.filter((_, idx) => idx !== i);
                            handleUpdateField(activeField.id, { options: newOpts });
                          }} className="text-gray-500 hover:text-[#f00a4a] p-2 bg-[#1a1a1a] rounded-md border border-[#333]"><Trash2 size={14}/></button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-6 border-t border-[#222]">
                  <label className="flex items-center gap-3 cursor-pointer p-4 bg-[#111] rounded-xl border border-[#333] hover:border-[#555] transition-colors">
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${activeField.required ? 'bg-[#f00a4a]' : 'bg-[#333]'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${activeField.required ? 'left-5.5 right-0.5' : 'left-0.5'}`}></div>
                      <input type="checkbox" checked={activeField.required} onChange={(e) => handleUpdateField(activeField.id, { required: e.target.checked })} className="hidden" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-white block">Campo Obligatorio</span>
                      <span className="text-[10px] text-gray-500 block">El usuario debe llenarlo.</span>
                    </div>
                  </label>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 text-sm mt-16 p-6 border-2 border-dashed border-[#222] rounded-xl bg-[#0a0a0a]">
                <MousePointerClick size={32} className="mx-auto mb-4 opacity-30 text-[#f00a4a]" />
                Haz clic en un campo del lienzo central para editar sus propiedades aquí.
              </div>
            )}
          </div>
        </div>
      )}

      {/* FLUJO (FLOW AUTOMATION) MULTI-PAGE CONNECTED */}
      {activeTab === 'flow' && (
        <div className="flex-1 bg-[#050505] p-10 overflow-y-auto relative custom-scrollbar-dark">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
          
          <div className="max-w-4xl mx-auto flex flex-col items-center gap-0 relative z-10 py-10">
            
            {/* RENDER PAGES DYNAMICALLY FROM FIELDS */}
            {formPages.map((pageFields, pageIdx) => (
              <React.Fragment key={`page_${pageIdx}`}>
                <div className="w-80 bg-[#111] border-2 border-blue-500 rounded-2xl shadow-xl flex flex-col overflow-hidden">
                  <div className="p-4 border-b flex items-center justify-between bg-blue-500/10 border-blue-500/30">
                    <div className="flex items-center gap-3">
                      <FileDigit className="text-blue-500" size={20} />
                      <h4 className="font-bold text-white text-sm">Formulario - Página {pageIdx + 1}</h4>
                    </div>
                  </div>
                  <div className="p-5 bg-[#0a0a0a] space-y-3">
                    <div className="text-xs text-gray-500 font-bold uppercase">Campos en esta página:</div>
                    <div className="flex flex-col gap-2">
                      {pageFields.length === 0 ? (
                        <span className="text-xs italic text-gray-600">No hay campos.</span>
                      ) : (
                        pageFields.map(f => (
                          <span key={f.id} className="bg-[#1a1a1a] px-3 py-2 rounded-md text-[11px] text-gray-300 border border-[#333] flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> {f.label}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
                {/* Conector a la siguiente pagina o a las acciones */}
                <div className="h-10 w-px bg-blue-500 border-l-2 border-dashed border-blue-500/50"></div>
              </React.Fragment>
            ))}

            {formData.flowSteps.map((step, index) => (
              <React.Fragment key={step.id}>
                {/* NODO DE ACCION */}
                <div className={`w-80 bg-[#111] border-2 rounded-2xl shadow-xl flex flex-col overflow-hidden transition-colors ${step.type === 'webhook' ? 'border-purple-500' : step.type === 'email' ? 'border-amber-500' : 'border-emerald-500'}`}>
                  
                  <div className="p-4 border-b flex items-center justify-between bg-[#1a1a1a] border-[#333]">
                    <div className="flex items-center gap-3">
                      {step.type === 'webhook' && <Send className="text-purple-500" size={20} />}
                      {step.type === 'email' && <MailIcon className="text-amber-500" size={20} />}
                      {step.type === 'redirect' && <Globe className="text-emerald-500" size={20} />}
                      <h4 className="font-bold text-white text-sm">{step.title}</h4>
                    </div>
                    <button onClick={() => handleDeleteFlowStep(step.id)} className="text-gray-500 hover:text-red-500"><Trash2 size={16}/></button>
                  </div>
                  
                  <div className="p-5 bg-[#0a0a0a] space-y-3">
                    {step.type === 'email' ? (
                      <>
                         <label className="text-[10px] text-gray-500 font-bold uppercase block">Destinatario</label>
                         <input type="text" value={step.url} onChange={(e) => handleUpdateFlowStep(step.id, e.target.value)} placeholder="admin@empresa.com" className="w-full bg-[#1a1a1a] border border-[#333] text-white rounded px-3 py-2 outline-none focus:border-amber-500 text-sm" />
                      </>
                    ) : step.type === 'redirect' ? (
                      <>
                         <label className="text-[10px] text-gray-500 font-bold uppercase block">URL Destino (WhatsApp/Gracias)</label>
                         <textarea value={step.url} onChange={(e) => handleUpdateFlowStep(step.id, e.target.value)} placeholder="https://..." rows="2" className="w-full bg-[#1a1a1a] border border-[#333] text-white rounded px-3 py-2 outline-none focus:border-emerald-500 text-sm resize-none" />
                      </>
                    ) : (
                      <>
                         <label className="text-[10px] text-gray-500 font-bold uppercase block">Endpoint URL</label>
                         <input type="text" value={step.url} onChange={(e) => handleUpdateFlowStep(step.id, e.target.value)} placeholder="https://hook.make.com/..." className="w-full bg-[#1a1a1a] border border-[#333] text-white rounded px-3 py-2 outline-none focus:border-purple-500 text-sm" />
                      </>
                    )}
                  </div>
                </div>

                {/* LINEA CONECTORA Y BOTON MÁS */}
                <div className="flex flex-col items-center relative my-0 py-2">
                   <div className="h-6 w-px bg-[#444]"></div>
                   
                   <div className="relative">
                     <button onClick={() => setShowNodeMenu(showNodeMenu === index ? null : index)} className="w-6 h-6 rounded-full bg-[#222] border border-[#444] text-white flex items-center justify-center hover:bg-[#f00a4a] hover:border-[#f00a4a] transition-colors z-20 relative shadow-lg">
                       <Plus size={14} />
                     </button>
                     
                     {showNodeMenu === index && (
                       <div className="absolute left-10 -top-10 w-48 bg-[#111] border border-[#333] rounded-xl shadow-2xl overflow-hidden z-30 animate-fade-in">
                         <div className="text-[10px] font-bold text-gray-500 uppercase px-4 py-2 bg-[#1a1a1a] border-b border-[#333]">Añadir Acción</div>
                         <button onClick={() => handleAddFlowStep('webhook', 'Enviar Webhook')} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-[#1a1a1a] text-left border-b border-[#222]"><Send size={16} className="text-purple-500"/> Webhook (API)</button>
                         <button onClick={() => handleAddFlowStep('email', 'Enviar Email')} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-[#1a1a1a] text-left border-b border-[#222]"><MailIcon size={16} className="text-amber-500"/> Notificación Email</button>
                         <button onClick={() => handleAddFlowStep('redirect', 'Redirección URL')} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-[#1a1a1a] text-left"><Globe size={16} className="text-emerald-500"/> Redirigir Usuario</button>
                       </div>
                     )}
                   </div>

                   <div className="h-6 w-px bg-[#444]"></div>
                </div>
              </React.Fragment>
            ))}
            
            {/* FIN DEL FLUJO */}
            {formData.flowSteps.length === 0 && (
               <div className="flex flex-col items-center relative my-0 py-2">
                 <div className="relative">
                     <button onClick={() => setShowNodeMenu('empty')} className="w-6 h-6 rounded-full bg-[#222] border border-[#444] text-white flex items-center justify-center hover:bg-[#f00a4a] hover:border-[#f00a4a] transition-colors z-20 relative shadow-lg">
                       <Plus size={14} />
                     </button>
                     {showNodeMenu === 'empty' && (
                       <div className="absolute left-10 -top-10 w-48 bg-[#111] border border-[#333] rounded-xl shadow-2xl overflow-hidden z-30 animate-fade-in">
                         <div className="text-[10px] font-bold text-gray-500 uppercase px-4 py-2 bg-[#1a1a1a] border-b border-[#333]">Añadir Acción</div>
                         <button onClick={() => handleAddFlowStep('webhook', 'Enviar Webhook')} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-[#1a1a1a] text-left border-b border-[#222]"><Send size={16} className="text-purple-500"/> Webhook (API)</button>
                         <button onClick={() => handleAddFlowStep('email', 'Enviar Email')} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-[#1a1a1a] text-left border-b border-[#222]"><MailIcon size={16} className="text-amber-500"/> Notificación Email</button>
                         <button onClick={() => handleAddFlowStep('redirect', 'Redirección URL')} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-[#1a1a1a] text-left"><Globe size={16} className="text-emerald-500"/> Redirigir Usuario</button>
                       </div>
                     )}
                 </div>
                 <div className="h-6 w-px bg-[#444]"></div>
               </div>
            )}
            <div className="w-24 py-2 bg-[#111] border border-[#333] rounded-full text-center text-xs font-bold text-gray-500 uppercase shadow-lg">Fin</div>
          </div>
        </div>
      )}

      {/* COMPARTIR */}
      {activeTab === 'share' && (
        <div className="flex-1 bg-[#050505] p-10 overflow-y-auto">
           <div className="max-w-4xl mx-auto space-y-8">
              <div className="bg-[#111] p-8 rounded-2xl border border-[#222]">
                <h3 className="text-lg font-black text-white mb-2 uppercase tracking-wide">Enlace directo</h3>
                <p className="text-sm text-gray-500 mb-6">Comparte este enlace por email o redes.</p>
                <div className="flex flex-col md:flex-row gap-3">
                  <input readOnly value={`https://tu-dominio.com/f/${formData.slug}`} className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-white outline-none text-sm font-medium" />
                  <button onClick={(e) => { 
                    copyTextToClipboard(`https://tu-dominio.com/f/${formData.slug}`);
                    const btn = e.currentTarget;
                    const original = btn.innerText;
                    btn.innerText = "¡Copiado!";
                    setTimeout(() => btn.innerText = original, 2000); 
                  }} className="bg-white text-black px-6 py-3 rounded-lg text-sm font-bold transition-colors">Copiar enlace</button>
                </div>
              </div>

              <div className="bg-[#111] p-8 rounded-2xl border border-[#222]">
                <h3 className="text-lg font-black text-white mb-2 uppercase tracking-wide">Incrustar (Iframe)</h3>
                <p className="text-sm text-gray-500 mb-6">Incrusta el formulario renderizado con todos tus estilos visuales directamente en tu web.</p>
                <textarea readOnly value={`<iframe src="https://tu-dominio.com/f/${formData.slug}" width="100%" height="800px" frameborder="0" style="background: transparent;"></iframe>`} rows="3" className="w-full bg-[#0a0a0a] border border-[#333] text-emerald-400 font-mono text-xs p-5 rounded-xl outline-none resize-none mb-4" />
                <button onClick={(e) => { 
                  copyTextToClipboard(`<iframe src="https://tu-dominio.com/f/${formData.slug}" width="100%" height="800px" frameborder="0"></iframe>`); 
                  const btn = e.currentTarget;
                  const original = btn.innerText;
                  btn.innerText = "¡Copiado!";
                  setTimeout(() => btn.innerText = original, 2000); 
                }} className="bg-[#222] hover:bg-[#333] text-white border border-[#444] px-6 py-3 rounded-lg text-sm font-bold transition-colors">Copiar código html</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

function BuilderButton({ icon: Icon, label, onClick }) {
  return (
    <button onClick={onClick} className="flex items-center gap-3 bg-[#111111] hover:bg-[#1a1a1a] border border-[#222] hover:border-[#f00a4a] text-gray-400 hover:text-white p-3 rounded-xl transition-all group">
      <Icon size={16} className="group-hover:text-[#f00a4a] transition-colors" />
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}

// ==========================================
// VISTA PÚBLICA DEL FORMULARIO (Renderiza estilos y MULTIPASO)
// ==========================================
function PublicFormView({ form, onClose }) {
  const [submitted, setSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Divide los campos en páginas basado en 'page_break'
  const formPages = [];
  let currPage = [];
  form.fields.forEach(f => {
    if(f.type === 'page_break') { formPages.push(currPage); currPage = []; }
    else { currPage.push(f); }
  });
  formPages.push(currPage);

  const bgColor = hexToRgba(form.appearance.backgroundColor, form.appearance.backgroundOpacity);

  const handleNext = (e) => {
    e.preventDefault();
    if (currentStep < formPages.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans relative" style={{ backgroundColor: bgColor }}>
      
      {/* Inyección de CSS Dinámico para Focus Rings y Placeholders */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-form-container input::placeholder, 
        .custom-form-container textarea::placeholder {
           color: ${form.appearance.placeholderColor};
           opacity: 1;
        }
        .custom-form-container input:focus, 
        .custom-form-container textarea:focus, 
        .custom-form-container select:focus {
           border-color: ${form.appearance.focusColor} !important;
           outline: none;
           box-shadow: 0 0 0 3px ${hexToRgba(form.appearance.focusColor, 20)};
        }
      `}} />

      <button onClick={onClose} className="absolute top-6 left-6 bg-black/10 hover:bg-black/20 text-gray-800 px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-sm z-50 mix-blend-difference text-white">
        <ArrowLeft size={16} /> Volver
      </button>

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl mx-auto relative z-10 py-10 px-4">
        
        <div 
          className="w-full shadow-2xl overflow-hidden flex flex-col transition-all duration-300 custom-form-container" 
          style={{ 
            backgroundColor: hexToRgba(form.appearance.backgroundColor, form.appearance.backgroundOpacity),
            borderRadius: `${form.appearance.borderRadius}px`,
            border: form.appearance.backgroundOpacity < 100 ? '1px solid rgba(255,255,255,0.1)' : 'none',
            backdropFilter: form.appearance.backgroundOpacity < 100 ? 'blur(20px)' : 'none'
          }}
        >
          <div className="h-2 w-full" style={{ backgroundColor: form.appearance.primaryColor }}></div>
          
          {submitted ? (
            <div className="flex flex-col items-center text-center" style={{ 
               paddingTop: `${form.appearance.paddingTop}px`, paddingBottom: `${form.appearance.paddingBottom}px`,
               paddingLeft: `${form.appearance.paddingLeft}px`, paddingRight: `${form.appearance.paddingRight}px`
            }}>
               <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg" style={{ backgroundColor: form.appearance.primaryColor, color: form.appearance.buttonTextColor }}>
                  <Check size={40} />
               </div>
               <h2 className="text-3xl font-black mb-2" style={{ color: form.appearance.textColor }}>¡Gracias!</h2>
               <p className="opacity-70" style={{ color: form.appearance.textColor }}>Hemos recibido tu información correctamente.</p>
               {form.flowSteps.some(s => s.type === 'redirect') && (
                 <p className="text-sm mt-6 font-bold" style={{ color: form.appearance.primaryColor }}>Redirigiendo al siguiente paso...</p>
               )}
            </div>
          ) : (
            <form onSubmit={handleNext} className="flex flex-col gap-6" style={{ 
               paddingTop: `${form.appearance.paddingTop}px`, paddingBottom: `${form.appearance.paddingBottom}px`,
               paddingLeft: `${form.appearance.paddingLeft}px`, paddingRight: `${form.appearance.paddingRight}px`
            }}>
              
              <div className="text-center mb-2">
                <h1 className="text-3xl font-black" style={{ color: form.appearance.textColor }}>{form.name}</h1>
                {formPages.length > 1 && (
                  <p className="text-sm mt-2 opacity-60 font-medium" style={{ color: form.appearance.textColor }}>
                    Paso {currentStep + 1} de {formPages.length}
                  </p>
                )}
              </div>

              {formPages[currentStep].map((field) => (
                <div key={field.id}>
                  <label className="block text-sm font-bold mb-2 transition-colors" style={{ color: form.appearance.textColor }}>
                    {field.label} {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  
                  {field.type === 'textarea' ? (
                    <textarea 
                      required={field.required} placeholder={field.placeholder} rows="3" 
                      className="w-full rounded-xl px-4 py-3.5 transition-all" 
                      style={{ backgroundColor: form.appearance.inputBgColor, color: form.appearance.inputTextColor, borderColor: form.appearance.inputBorderColor, borderWidth: '1px' }}
                    ></textarea>
                  ) : field.type === 'phone' ? (
                    <div className="flex rounded-xl overflow-hidden border transition-all" style={{ backgroundColor: form.appearance.inputBgColor, borderColor: form.appearance.inputBorderColor }}>
                      <div className="px-4 py-3.5 border-r font-medium flex items-center gap-2" style={{ color: form.appearance.placeholderColor, borderColor: form.appearance.inputBorderColor }}>🇪🇨 +593</div>
                      <input required={field.required} type="tel" placeholder={field.placeholder} className="flex-1 px-4 py-3.5 bg-transparent" style={{ color: form.appearance.inputTextColor }} />
                    </div>
                  ) : field.type === 'dropdown' ? (
                    <div className="relative rounded-xl">
                      <select required={field.required} defaultValue="" className="w-full rounded-xl px-4 py-3.5 transition-shadow appearance-none cursor-pointer border" style={{ backgroundColor: form.appearance.inputBgColor, color: form.appearance.inputTextColor, borderColor: form.appearance.inputBorderColor }}>
                        <option value="" disabled>Selecciona una opción</option>
                        {field.options?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-4 pointer-events-none" size={18} style={{ color: form.appearance.placeholderColor }} />
                    </div>
                  ) : field.type === 'radio' || field.type === 'checkbox' ? (
                    <div className="space-y-3 mt-2">
                      {field.options?.map((opt, i) => (
                        <label key={i} className="flex items-center gap-3 cursor-pointer">
                           <input required={field.required} type={field.type} name={`grp_${field.id}`} className="w-5 h-5 rounded-full" style={{ accentColor: form.appearance.primaryColor }} />
                           <span className="font-medium text-sm" style={{ color: form.appearance.textColor }}>{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : field.type === 'file' ? (
                     <input required={field.required} type="file" className="w-full border-dashed rounded-xl px-4 py-8 text-center text-sm border-2 cursor-pointer" style={{ backgroundColor: form.appearance.inputBgColor, color: form.appearance.inputTextColor, borderColor: form.appearance.inputBorderColor }} />
                  ) : (
                    <input 
                      required={field.required} type={field.type} placeholder={field.placeholder} 
                      className="w-full rounded-xl px-4 py-3.5 transition-shadow border" 
                      style={{ backgroundColor: form.appearance.inputBgColor, color: form.appearance.inputTextColor, borderColor: form.appearance.inputBorderColor }} 
                    />
                  )}
                </div>
              ))}

              <div className="mt-4 flex gap-4">
                {currentStep > 0 && (
                   <button type="button" onClick={() => setCurrentStep(currentStep - 1)} className="flex-1 py-4 rounded-lg font-bold text-sm shadow-xl transition-transform hover:scale-[1.02]" style={{ backgroundColor: form.appearance.inputBgColor, color: form.appearance.textColor, border: `1px solid ${form.appearance.inputBorderColor}`, borderRadius: `${form.appearance.borderRadius}px` }}>
                     Atrás
                   </button>
                )}
                {form.appearance.showButton && (
                  <button type="submit" className="flex-1 py-4 rounded-lg font-bold text-sm shadow-xl hover:scale-[1.02] transition-transform" style={{ backgroundColor: form.appearance.primaryColor, color: form.appearance.buttonTextColor, borderRadius: `${form.appearance.borderRadius}px` }}>
                    {currentStep < formPages.length - 1 ? 'Siguiente' : form.submitText}
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// --- COMPONENTE EDITOR DE CALENDARIO ---
function AdminEditor({ calendar, onSave, onBack }) {
  const [formData, setFormData] = useState({ ...calendar });
  const [activeTab, setActiveTab] = useState('basico');
  const [newSpecificDate, setNewSpecificDate] = useState({ date: '', start: '09:00', end: '17:00' });
  const [newField, setNewField] = useState({ label: '', type: 'text', required: false });

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, logo: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleAddField = () => {
    if (!newField.label) return;
    setFormData(prev => ({
      ...prev,
      formFields: [...(prev.formFields || defaultFormFields), { ...newField, id: 'f_' + Date.now(), system: false }]
    }));
    setNewField({ label: '', type: 'text', required: false });
  };

  const handleRemoveField = (id) => {
    setFormData(prev => ({
      ...prev,
      formFields: prev.formFields.filter(f => f.id !== id)
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleNestedChange = (category, field, value) => {
    setFormData(prev => ({
      ...prev,
      [category]: { ...prev[category], [field]: value }
    }));
  };

  const handleToggleUser = (userId) => {
    setFormData(prev => {
      const assigned = prev.assignedUsers.includes(userId)
        ? prev.assignedUsers.filter(id => id !== userId)
        : [...prev.assignedUsers, userId];
      return { ...prev, assignedUsers: assigned };
    });
  };

  const daysOfWeek = [
    { key: 'monday', label: 'Lunes' }, { key: 'tuesday', label: 'Martes' },
    { key: 'wednesday', label: 'Miércoles' }, { key: 'thursday', label: 'Jueves' },
    { key: 'friday', label: 'Viernes' }, { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' }
  ];

  const inputClass = "w-full bg-[#1a1a1a] border border-[#333] text-white rounded-lg px-4 py-2.5 outline-none focus:border-[#f00a4a] transition-colors";

  return (
    <div className="flex flex-col h-screen bg-[#050505] font-sans text-gray-200" color-scheme="dark">
      <header className="h-20 bg-[#0a0a0a] border-b border-[#222] flex items-center justify-between px-8 flex-shrink-0 z-10">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="text-gray-400 hover:text-white flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#222] border border-[#333] px-4 py-2 rounded-lg text-sm font-bold transition-colors">
            <ArrowLeft size={16} /> Volver
          </button>
          <div className="h-8 w-px bg-[#333]"></div>
          <div>
             <h1 className="text-xl font-black text-white uppercase tracking-wide flex items-center gap-3">
               Editar: {formData.name}
             </h1>
             <span className="text-[10px] font-bold text-[#f00a4a] uppercase tracking-widest">
               {calendarTypeLabels[formData.type]}
             </span>
          </div>
        </div>
        <button onClick={() => { onSave(formData); onBack(); }} className="bg-[#f00a4a] hover:bg-[#d0003a] text-white px-6 py-2.5 rounded-lg font-bold transition-all shadow-[0_0_15px_rgba(240,10,74,0.3)]">
          Guardar Configuración
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sub-Sidebar Navigation */}
        <div className="w-64 bg-[#0a0a0a] border-r border-[#222] flex flex-col py-6 hidden md:flex flex-shrink-0 z-0">
          <nav className="space-y-1 px-4">
            <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3 px-2">General</div>
            <SidebarButton icon={Layout} label="Detalles básicos" isActive={activeTab==='basico'} onClick={() => setActiveTab('basico')} />
            <SidebarButton icon={UsersRound} label="Equipo & Asignación" isActive={activeTab==='equipo'} onClick={() => setActiveTab('equipo')} />
            
            <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-8 mb-3 px-2">Disponibilidad</div>
            <SidebarButton icon={CalendarDays} label="Horarios de trabajo" isActive={activeTab==='horarios'} onClick={() => setActiveTab('horarios')} />
            <SidebarButton icon={Clock} label="Reglas de reserva" isActive={activeTab==='reglas'} onClick={() => setActiveTab('reglas')} />
            
            <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-8 mb-3 px-2">Experiencia</div>
            <SidebarButton icon={FileText} label="Formularios" isActive={activeTab==='form'} onClick={() => setActiveTab('form')} />
            <SidebarButton icon={Palette} label="Apariencia" isActive={activeTab==='apariencia'} onClick={() => setActiveTab('apariencia')} />
            
            <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-8 mb-3 px-2">Publicar</div>
            <SidebarButton icon={Share2} label="Compartir" isActive={activeTab==='compartir'} onClick={() => setActiveTab('compartir')} />
          </nav>
        </div>

        {/* Editor Area Main */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#050505] custom-scrollbar-dark">
          <div className="max-w-4xl mx-auto bg-[#111111] border border-[#222] rounded-2xl shadow-xl min-h-[600px]">
            
            {/* TABS CONTENT */}
            {activeTab === 'basico' && (
              <div className="p-8 animate-fade-in">
                <div className="border-b border-[#222] pb-4 mb-8">
                  <h2 className="text-2xl font-black text-white uppercase tracking-wide">Detalles básicos</h2>
                  <p className="text-gray-400 text-sm mt-1">Identidad visual y descripción de la reunión.</p>
                </div>
                
                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Nombre del calendario *</label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass} />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">URL Personalizada</label>
                      <div className="flex rounded-lg overflow-hidden border border-[#333]">
                        <span className="inline-flex items-center px-4 bg-[#1a1a1a] text-gray-500 sm:text-sm border-r border-[#333]">/calendario/</span>
                        <input type="text" name="slug" value={formData.slug} onChange={handleChange} className="flex-1 block w-full bg-[#0a0a0a] text-white px-3 py-2.5 outline-none focus:bg-[#111]" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Logo del Calendario</label>
                    <div className="flex gap-6 items-center bg-[#0a0a0a] p-4 rounded-xl border border-[#222]">
                      {formData.logo ? (
                        <img src={formData.logo} alt="Logo" className="w-20 h-20 rounded-xl object-cover border border-[#333] shadow-md" />
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-[#1a1a1a] flex items-center justify-center text-gray-500 border border-[#333]">
                          <ImageIcon size={28} />
                        </div>
                      )}
                      <div className="flex-1 space-y-3">
                        <label className="cursor-pointer bg-[#1a1a1a] hover:bg-[#222] border border-[#333] text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-colors inline-flex items-center gap-2">
                          <UploadCloud size={18} className="text-[#f00a4a]" /> Subir imagen
                          <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                        </label>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wide">O ingresa una URL web:</p>
                        <input type="text" name="logo" value={formData.logo || ''} onChange={handleChange} placeholder="https://ejemplo.com/logo.png" className={inputClass} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Descripción</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className={`${inputClass} resize-none`} placeholder="Instrucciones para tus clientes..." />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Ubicación de la reunión</label>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <button onClick={() => setFormData(prev => ({ ...prev, locationType: 'presencial' }))} className={`py-3 px-4 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-colors ${formData.locationType === 'presencial' ? 'bg-[#f00a4a]/10 border-[#f00a4a] text-[#f00a4a]' : 'bg-[#1a1a1a] border-[#333] text-gray-400 hover:text-white'}`}>
                        <MapPin size={16} /> Presencial
                      </button>
                      <button onClick={() => setFormData(prev => ({ ...prev, locationType: 'videoconferencia' }))} className={`py-3 px-4 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-colors ${formData.locationType === 'videoconferencia' ? 'bg-[#f00a4a]/10 border-[#f00a4a] text-[#f00a4a]' : 'bg-[#1a1a1a] border-[#333] text-gray-400 hover:text-white'}`}>
                        <Video size={16} /> Video
                      </button>
                      <button onClick={() => setFormData(prev => ({ ...prev, locationType: 'telefonica' }))} className={`py-3 px-4 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-colors ${formData.locationType === 'telefonica' ? 'bg-[#f00a4a]/10 border-[#f00a4a] text-[#f00a4a]' : 'bg-[#1a1a1a] border-[#333] text-gray-400 hover:text-white'}`}>
                        <PhoneCall size={16} /> Llamada
                      </button>
                    </div>
                    <input type="text" name="locationDetails" value={formData.locationDetails || ''} onChange={handleChange} placeholder={formData.locationType === 'presencial' ? 'Dirección física...' : formData.locationType === 'videoconferencia' ? 'Enlace de Zoom/Meet...' : 'Número de teléfono o instrucciones...'} className={inputClass} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'equipo' && (
              <div className="p-8 animate-fade-in">
                <div className="border-b border-[#222] pb-4 mb-8">
                  <h2 className="text-2xl font-black text-white uppercase tracking-wide">Equipo & Asignación</h2>
                  <p className="text-gray-400 text-sm mt-1">Configura quiénes atenderán estas reservas basándote en el tipo de calendario.</p>
                </div>

                <div className="mb-8 p-6 bg-[#0a0a0a] border border-[#222] rounded-xl">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Info size={16} className="text-[#f00a4a]" /> Lógica para: {calendarTypeLabels[formData.type]}
                  </h3>
                  
                  {formData.type === 'personal' && (
                    <p className="text-sm text-gray-400">Selecciona el miembro único del equipo para este calendario.</p>
                  )}
                  
                  {formData.type === 'rotacion' && (
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Método de distribución</label>
                      <select 
                        value={formData.specificConfig.logic || 'round_robin'} 
                        onChange={(e) => handleNestedChange('specificConfig', 'logic', e.target.value)}
                        className={inputClass}
                      >
                        <option value="round_robin">Equitativo (Round Robin estricto)</option>
                        <option value="availability">Maximizar disponibilidad</option>
                      </select>
                    </div>
                  )}

                  {formData.type === 'clases' && (
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Capacidad máxima</label>
                      <input 
                        type="number" 
                        value={formData.specificConfig.maxAttendees || 1} 
                        onChange={(e) => handleNestedChange('specificConfig', 'maxAttendees', parseInt(e.target.value))}
                        className="w-32 bg-[#1a1a1a] border border-[#333] text-white rounded-lg px-4 py-2 outline-none focus:border-[#f00a4a]"
                      />
                    </div>
                  )}
                </div>

                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Miembros disponibles</h3>
                <div className="space-y-3">
                  {mockTeamMembers.map(user => (
                    <label key={user.id} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${formData.assignedUsers.includes(user.id) ? 'border-[#f00a4a] bg-[#f00a4a]/5' : 'border-[#222] bg-[#1a1a1a] hover:border-[#444]'}`}>
                      <input 
                        type={formData.type === 'personal' ? 'radio' : 'checkbox'} 
                        name="teamAssignment"
                        checked={formData.assignedUsers.includes(user.id)}
                        onChange={() => {
                          if (formData.type === 'personal') {
                            setFormData(prev => ({ ...prev, assignedUsers: [user.id] }));
                          } else {
                            handleToggleUser(user.id);
                          }
                        }}
                        className="w-4 h-4 accent-[#f00a4a]"
                      />
                      <div className="w-10 h-10 rounded-full bg-[#0a0a0a] border border-[#333] flex items-center justify-center text-white font-bold text-sm">
                        {user.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-white">{user.name}</div>
                        <div className="text-xs text-gray-400">{user.email}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'horarios' && (
              <div className="p-8 animate-fade-in">
                 <div className="border-b border-[#222] pb-4 mb-8">
                  <h2 className="text-2xl font-black text-white uppercase tracking-wide">Horarios de Trabajo</h2>
                  <p className="text-gray-400 text-sm mt-1">Establece tu disponibilidad para este evento.</p>
                </div>

                <div className="mb-8 p-6 bg-[#0a0a0a] border border-[#222] rounded-xl">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Modo de Disponibilidad</label>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <label className={`flex-1 flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${formData.scheduleType !== 'specific' ? 'border-[#f00a4a] bg-[#f00a4a]/10' : 'bg-[#1a1a1a] border-[#333] hover:border-[#555]'}`}>
                      <input type="radio" name="scheduleType" value="weekly" checked={formData.scheduleType !== 'specific'} onChange={handleChange} className="w-4 h-4 accent-[#f00a4a]" />
                      <div>
                        <span className="block font-bold text-sm text-white">Recurrente (Semanal)</span>
                        <span className="block text-[11px] text-gray-400 mt-1">Disponibilidad repite todas las semanas.</span>
                      </div>
                    </label>
                    <label className={`flex-1 flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${formData.scheduleType === 'specific' ? 'border-[#f00a4a] bg-[#f00a4a]/10' : 'bg-[#1a1a1a] border-[#333] hover:border-[#555]'}`}>
                      <input type="radio" name="scheduleType" value="specific" checked={formData.scheduleType === 'specific'} onChange={handleChange} className="w-4 h-4 accent-[#f00a4a]" />
                      <div>
                        <span className="block font-bold text-sm text-white">Fechas específicas</span>
                        <span className="block text-[11px] text-gray-400 mt-1">Bloquea todo excepto fechas configuradas.</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className={`space-y-3 transition-opacity ${formData.scheduleType === 'specific' ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                  {daysOfWeek.map(day => {
                    const schedule = formData.schedule[day.key];
                    return (
                      <div key={day.key} className="flex items-center gap-4 p-4 hover:bg-[#1a1a1a] rounded-xl border border-transparent hover:border-[#333] transition-colors">
                        <div className="w-36 flex items-center gap-3">
                          <button 
                            onClick={() => setFormData(prev => ({ ...prev, schedule: { ...prev.schedule, [day.key]: { ...schedule, active: !schedule.active } } }))}
                            className={`text-3xl ${schedule.active ? 'text-[#f00a4a]' : 'text-gray-600'}`}
                          >
                            {schedule.active ? <ToggleRight /> : <ToggleLeft />}
                          </button>
                          <span className={`text-sm font-bold ${schedule.active ? 'text-white' : 'text-gray-500'}`}>{day.label}</span>
                        </div>
                        
                        {schedule.active ? (
                          <div className="flex items-center gap-3 flex-1">
                            <input 
                              type="time" 
                              value={schedule.start} 
                              onChange={(e) => setFormData(prev => ({ ...prev, schedule: { ...prev.schedule, [day.key]: { ...schedule, start: e.target.value } } }))}
                              className="bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-[#f00a4a]" 
                            />
                            <span className="text-gray-500">-</span>
                            <input 
                              type="time" 
                              value={schedule.end} 
                              onChange={(e) => setFormData(prev => ({ ...prev, schedule: { ...prev.schedule, [day.key]: { ...schedule, end: e.target.value } } }))}
                              className="bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-[#f00a4a]" 
                            />
                          </div>
                        ) : (
                          <div className="text-sm text-gray-600 font-medium flex-1">Cerrado</div>
                        )}
                      </div>
                    )
                  })}
                </div>

                <div className="mt-10 pt-8 border-t border-[#222]">
                  <h3 className="text-lg font-bold text-white mb-2">Fechas específicas</h3>
                  <p className="text-gray-400 text-sm mb-6">Añade o sobrescribe disponibilidad para días concretos.</p>
                  
                  <div className="flex items-center gap-3 mb-6 bg-[#0a0a0a] p-4 rounded-xl border border-[#222] flex-wrap md:flex-nowrap">
                    <input type="date" value={newSpecificDate.date} onChange={e => setNewSpecificDate(prev => ({...prev, date: e.target.value}))} className="bg-[#1a1a1a] border border-[#333] text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-[#f00a4a] flex-1" />
                    <input type="time" value={newSpecificDate.start} onChange={e => setNewSpecificDate(prev => ({...prev, start: e.target.value}))} className="bg-[#1a1a1a] border border-[#333] text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-[#f00a4a]" />
                    <span className="text-gray-500">-</span>
                    <input type="time" value={newSpecificDate.end} onChange={e => setNewSpecificDate(prev => ({...prev, end: e.target.value}))} className="bg-[#1a1a1a] border border-[#333] text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-[#f00a4a]" />
                    <button onClick={() => {
                      if(newSpecificDate.date) {
                        setFormData(prev => ({ ...prev, specificDates: [...(prev.specificDates || []), { ...newSpecificDate }] }));
                        setNewSpecificDate({ date: '', start: '09:00', end: '17:00' });
                      }
                    }} className="bg-white text-black hover:bg-gray-200 px-5 py-2 rounded-lg text-sm font-bold transition-colors w-full md:w-auto">
                      Agregar
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.specificDates && formData.specificDates.length > 0 ? (
                      formData.specificDates.map((sd, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-[#1a1a1a] border border-[#333] rounded-xl">
                          <div className="flex items-center gap-4">
                            <span className="font-bold text-white bg-[#0a0a0a] px-3 py-1 rounded border border-[#222]">{sd.date}</span>
                            <span className="text-sm text-[#f00a4a] font-bold">{sd.start} - {sd.end}</span>
                          </div>
                          <button onClick={() => {
                            setFormData(prev => ({ ...prev, specificDates: prev.specificDates.filter((_, i) => i !== idx) }));
                          }} className="text-gray-500 hover:text-[#f00a4a] p-2 hover:bg-[#0a0a0a] rounded-lg transition-colors">
                            <Trash size={16} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500 italic bg-[#0a0a0a] p-6 rounded-xl text-center border border-dashed border-[#333]">No hay fechas específicas configuradas.</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reglas' && (
              <div className="p-8 animate-fade-in">
                <div className="border-b border-[#222] pb-4 mb-8">
                  <h2 className="text-2xl font-black text-white uppercase tracking-wide">Reglas de reserva</h2>
                  <p className="text-gray-400 text-sm mt-1">Configura duraciones y márgenes para tus reuniones.</p>
                </div>
                
                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Duración (minutos)</label>
                    <input type="number" name="duration" value={formData.duration} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Intervalo de visualización</label>
                    <input type="number" name="interval" value={formData.interval} onChange={handleChange} className={inputClass} />
                    <p className="text-[11px] text-gray-500 mt-2">Ej. Opciones cada {formData.interval} min.</p>
                  </div>
                </div>

                <div className="bg-[#0a0a0a] p-8 rounded-xl border border-[#222]">
                  <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Condiciones de programación</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-2">Aviso mínimo de programación (Horas)</label>
                      <input type="number" name="minNotice" value={formData.minNotice} onChange={handleChange} className="w-full md:w-1/2 bg-[#1a1a1a] border border-[#333] text-white rounded-lg px-4 py-2 outline-none focus:border-[#f00a4a]" />
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-6 border-t border-[#222]">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 mb-2">Margen antes (Min)</label>
                        <input type="number" name="bufferBefore" value={formData.bufferBefore} onChange={handleChange} className="w-full bg-[#1a1a1a] border border-[#333] text-white rounded-lg px-4 py-2 outline-none focus:border-[#f00a4a]" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 mb-2">Margen después (Min)</label>
                        <input type="number" name="bufferAfter" value={formData.bufferAfter} onChange={handleChange} className="w-full bg-[#1a1a1a] border border-[#333] text-white rounded-lg px-4 py-2 outline-none focus:border-[#f00a4a]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'form' && (
              <div className="p-8 animate-fade-in">
                <div className="border-b border-[#222] pb-4 mb-8">
                  <h2 className="text-2xl font-black text-white uppercase tracking-wide">Formularios</h2>
                  <p className="text-gray-400 text-sm mt-1">Configura qué información pides al agendar.</p>
                </div>
                
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Layout size={16} /> Campos a solicitar
                    </h3>
                    <div className="bg-[#0a0a0a] rounded-xl border border-[#222] overflow-hidden">
                      <div className="p-0">
                        {(formData.formFields || defaultFormFields).map((field, idx) => (
                          <div key={field.id} className="flex items-center justify-between p-4 bg-[#111111] border-b border-[#222] last:border-0 hover:bg-[#1a1a1a] transition-colors">
                            <div className="flex items-center gap-4">
                              <GripVertical size={16} className="text-gray-500 cursor-grab" />
                              <div>
                                <span className="font-bold text-sm text-white">{field.label}</span>
                                <div className="flex items-center gap-2 mt-1.5">
                                  <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 bg-[#0a0a0a] px-2 py-0.5 rounded border border-[#333]">
                                    {field.type === 'textarea' ? 'Texto largo' : field.type === 'text' ? 'Texto corto' : field.type}
                                  </span>
                                  {field.required && <span className="text-[9px] font-bold text-[#f00a4a] bg-[#f00a4a]/10 px-2 py-0.5 rounded border border-[#f00a4a]/30">Obligatorio</span>}
                                  {field.system && <span className="text-[9px] font-bold text-gray-300 bg-gray-800 px-2 py-0.5 rounded border border-gray-600">Sistema</span>}
                                </div>
                              </div>
                            </div>
                            {!field.system && (
                              <button onClick={() => handleRemoveField(field.id)} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors tooltip-trigger" title="Eliminar campo">
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      <div className="p-5 bg-[#0a0a0a] border-t border-[#222]">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Añadir nuevo campo</p>
                        <div className="flex flex-col xl:flex-row gap-3">
                          <input type="text" value={newField.label} onChange={e => setNewField({...newField, label: e.target.value})} placeholder="Ej. Tu usuario de Instagram..." className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-[#f00a4a]" />
                          <select value={newField.type} onChange={e => setNewField({...newField, type: e.target.value})} className="bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-[#f00a4a]">
                            <option value="text">Texto corto</option>
                            <option value="textarea">Texto largo</option>
                            <option value="tel">Teléfono</option>
                            <option value="number">Número</option>
                          </select>
                          <label className="flex items-center justify-center gap-2 text-sm text-white bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2.5 cursor-pointer hover:bg-[#222]">
                            <input type="checkbox" checked={newField.required} onChange={e => setNewField({...newField, required: e.target.checked})} className="rounded bg-black border-[#555] accent-[#f00a4a] w-4 h-4" />
                            Requerido
                          </label>
                          <button onClick={handleAddField} className="bg-white text-black hover:bg-gray-200 px-6 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2">
                            <PlusCircle size={16} /> Añadir
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-[#222]">
                    <label className="flex items-start gap-4 cursor-pointer group">
                      <input type="checkbox" name="allowGuests" checked={formData.allowGuests} onChange={handleChange} className="mt-1 w-5 h-5 accent-[#f00a4a] rounded bg-[#1a1a1a] border-[#333]" />
                      <div>
                        <span className="block text-sm font-bold text-white group-hover:text-[#f00a4a] transition-colors">Permitir añadir invitados</span>
                        <span className="block text-xs text-gray-500 mt-1">El cliente podrá añadir correos para que reciban invitación.</span>
                      </div>
                    </label>

                    <label className="flex items-start gap-4 cursor-pointer group">
                      <input type="checkbox" name="requireConsent" checked={formData.requireConsent} onChange={handleChange} className="mt-1 w-5 h-5 accent-[#f00a4a] rounded bg-[#1a1a1a] border-[#333]" />
                      <div>
                        <span className="block text-sm font-bold text-white group-hover:text-[#f00a4a] transition-colors">Casilla de consentimiento (Privacidad)</span>
                        <span className="block text-xs text-gray-500 mt-1">Añade checkbox obligatorio para aceptar términos antes de reservar.</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'apariencia' && (
              <div className="p-8 animate-fade-in">
                <div className="border-b border-[#222] pb-4 mb-8">
                  <h2 className="text-2xl font-black text-white uppercase tracking-wide">Apariencia</h2>
                  <p className="text-gray-400 text-sm mt-1">Ajusta los colores para alinearse con tu marca.</p>
                </div>
                
                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Color principal (Botones)</label>
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <input type="color" name="primaryColor" value={formData.primaryColor} onChange={handleChange} className="opacity-0 absolute inset-0 w-full h-full cursor-pointer" />
                          <div className="h-12 w-12 rounded-xl border border-[#333] shadow-inner" style={{ backgroundColor: formData.primaryColor }}></div>
                        </div>
                        <input type="text" name="primaryColor" value={formData.primaryColor} onChange={handleChange} className="w-28 bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2.5 text-white outline-none uppercase font-mono text-sm focus:border-[#f00a4a]" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Color de fondo (Pública)</label>
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <input type="color" name="backgroundColor" value={formData.backgroundColor || '#f8fafc'} onChange={handleChange} className="opacity-0 absolute inset-0 w-full h-full cursor-pointer" />
                          <div className="h-12 w-12 rounded-xl border border-[#333] shadow-inner" style={{ backgroundColor: formData.backgroundColor || '#f8fafc' }}></div>
                        </div>
                        <input type="text" name="backgroundColor" value={formData.backgroundColor || '#f8fafc'} onChange={handleChange} className="w-28 bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2.5 text-white outline-none uppercase font-mono text-sm focus:border-[#f00a4a]" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Texto del botón final</label>
                    <input type="text" name="buttonText" value={formData.buttonText} onChange={handleChange} className="w-full md:w-2/3 bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-white outline-none focus:border-[#f00a4a]" />
                  </div>

                  {/* Vista previa mock estática Modo Día */}
                  <div className="mt-10 pt-10 border-t border-[#222]">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-6 flex items-center gap-2">
                      <Layout size={16} className="text-white" /> Vista previa en vivo
                    </h3>
                    <div className="rounded-2xl overflow-hidden border border-[#222] flex flex-col items-center justify-center p-10 transition-colors duration-500 shadow-2xl relative" style={{ backgroundColor: formData.backgroundColor || '#f8fafc' }}>
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                      
                      <div className="mb-6 z-10">
                        {formData.logo ? (
                          <img src={formData.logo} alt="Logo" className="w-20 h-20 rounded-2xl object-cover shadow-2xl border-4 border-white/50 bg-white" />
                        ) : (
                          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-2xl border-4 border-white/50">
                             <span className="text-2xl font-black" style={{ color: formData.primaryColor }}>
                               {formData.name.substring(0, 2).toUpperCase()}
                             </span>
                          </div>
                        )}
                      </div>

                      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col sm:flex-row overflow-hidden border border-gray-100 z-10">
                        <div className="sm:w-5/12 p-6 bg-gray-50 border-b sm:border-b-0 sm:border-r border-gray-100 text-left">
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">{calendarTypeLabels[formData.type]}</p>
                          <h4 className="text-base font-bold text-gray-900 mb-3 leading-snug">{formData.name || 'Nombre del calendario'}</h4>
                          <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                            <Clock size={12} className="text-gray-400" /> {formData.duration} min
                          </div>
                        </div>
                        <div className="sm:w-7/12 p-6 flex flex-col justify-center items-center bg-white">
                           <button className="w-full py-3 rounded-xl text-white text-sm font-bold shadow-lg transition-transform hover:scale-105" style={{ backgroundColor: formData.primaryColor }}>
                             {formData.buttonText || 'Programar reunión'}
                           </button>
                           <p className="text-[10px] text-gray-400 mt-4 text-center uppercase tracking-wider">Así se verá tu botón principal</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'compartir' && (
              <div className="p-8 animate-fade-in">
                <div className="border-b border-[#222] pb-4 mb-8">
                  <h2 className="text-2xl font-black text-white uppercase tracking-wide">Compartir y Publicar</h2>
                  <p className="text-gray-400 text-sm mt-1">Comparte el enlace o incrusta el calendario.</p>
                </div>
                
                <div className="space-y-8">
                  <div className="bg-[#0a0a0a] p-8 rounded-2xl border border-[#222]">
                    <label className="block text-sm font-bold text-white mb-2 flex items-center gap-2 uppercase tracking-wide">
                      <ExternalLink size={18} className="text-[#f00a4a]" /> Enlace directo
                    </label>
                    <p className="text-sm text-gray-500 mb-6">Comparte este enlace por email, WhatsApp o redes.</p>
                    <div className="flex flex-col md:flex-row gap-3">
                      <input readOnly value={`https://tu-dominio.com/calendario/${formData.slug}`} className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-white outline-none text-sm font-medium" />
                      <button onClick={(e) => {
                        copyTextToClipboard(`https://tu-dominio.com/calendario/${formData.slug}`);
                        const btn = e.currentTarget;
                        const originalText = btn.innerText;
                        btn.innerText = "¡Copiado!";
                        setTimeout(() => btn.innerText = originalText, 2000);
                      }} className="bg-white text-black px-6 py-3 rounded-lg text-sm font-bold transition-colors whitespace-nowrap hover:bg-gray-200">
                        Copiar enlace
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#0a0a0a] p-8 rounded-2xl border border-[#222]">
                    <label className="block text-sm font-bold text-white mb-2 flex items-center gap-2 uppercase tracking-wide">
                      <Code size={18} className="text-[#f00a4a]" /> Incrustar código (Iframe)
                    </label>
                    <p className="text-sm text-gray-500 mb-6">Añade este código HTML a tu página web (WordPress, HTML).</p>
                    <div className="relative">
                      <textarea readOnly value={`<iframe src="https://tu-dominio.com/calendario/${formData.slug}" width="100%" height="700px" frameborder="0" style="border-radius: 12px; background: transparent;"></iframe>`} rows="3" className="w-full bg-[#111111] border border-[#333] text-emerald-400 font-mono text-xs p-5 rounded-xl outline-none resize-none" />
                      <button onClick={(e) => {
                        copyTextToClipboard(`<iframe src="https://tu-dominio.com/calendario/${formData.slug}" width="100%" height="700px" frameborder="0" style="border-radius: 12px; background: transparent;"></iframe>`);
                        const btn = e.target;
                        const originalText = btn.innerText;
                        btn.innerText = "¡Copiado!";
                        setTimeout(() => btn.innerText = originalText, 2000);
                      }} className="absolute top-4 right-4 bg-[#222] hover:bg-[#333] text-white border border-[#444] px-4 py-2 rounded-lg text-xs font-bold transition-colors">
                        Copiar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}

// --- COMPONENTE PÚBLICO (RESERVA DEL CLIENTE - MODO DÍA) ---
function PublicBookingView({ calendar, onClose }) {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay === 0 ? 6 : firstDay - 1 }, (_, i) => i);
  
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const dayNames = ["Lun.", "Mar.", "Mié.", "Jue.", "Vie.", "Sáb.", "Dom."];

  const generateDayTimeSlots = (startStr, endStr, duration, interval) => {
    if (!startStr || !endStr) return [];
    const slots = [];
    const parseTime = (str) => { const [h, m] = str.split(':').map(Number); return h * 60 + m; };
    let currentMinute = parseTime(startStr);
    const endMinute = parseTime(endStr);
    
    while (currentMinute + duration <= endMinute) {
      const h = Math.floor(currentMinute / 60);
      const m = currentMinute % 60;
      const isPM = h >= 12;
      const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
      slots.push(`${displayH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${isPM ? 'PM' : 'AM'}`);
      currentMinute += interval;
    }
    return slots;
  };

  let dynamicTimeSlots = [];
  if (selectedDate) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
    const specificOverride = calendar.specificDates?.find(sd => sd.date === dateStr);
    
    if (specificOverride) {
      dynamicTimeSlots = generateDayTimeSlots(specificOverride.start, specificOverride.end, calendar.duration, calendar.interval);
    } else {
      const dateObj = new Date(currentYear, currentMonth, selectedDate);
      const weekDayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const daySchedule = calendar.schedule[weekDayMap[dateObj.getDay()]];
      if (daySchedule && daySchedule.active) {
        dynamicTimeSlots = generateDayTimeSlots(daySchedule.start, daySchedule.end, calendar.duration, calendar.interval);
      }
    }
  }

  const handleSubmit = (e) => { e.preventDefault(); setStep(3); };

  const bgStyle = calendar.backgroundColor ? { backgroundColor: calendar.backgroundColor } : { backgroundColor: '#f8fafc' };

  return (
    <div className="min-h-screen flex flex-col font-sans relative text-gray-800 transition-colors duration-500" style={bgStyle}>
      <button onClick={onClose} className="absolute top-6 left-6 bg-white/20 hover:bg-white/30 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 border border-white/30 shadow-lg z-50 backdrop-blur-sm mix-blend-difference">
        <ArrowLeft size={16} /> Volver al Admin
      </button>

      <div className="flex-1 flex flex-col items-center justify-center p-4 py-20 relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>

        <div className="mb-8 flex flex-col items-center z-10">
          {calendar.logo ? (
            <img src={calendar.logo} alt={calendar.name} className="w-24 h-24 rounded-2xl object-cover shadow-2xl border-4 border-white/50 mb-4 bg-white" />
          ) : (
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-2xl border-4 border-white/50 mb-4">
               <span className="text-3xl font-black" style={{ color: calendar.primaryColor }}>
                 {calendar.name.substring(0, 2).toUpperCase()}
               </span>
            </div>
          )}
        </div>

        <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden w-full max-w-[1050px] flex flex-col md:flex-row relative border border-gray-100 z-10">
          
          <div className="md:w-1/3 p-10 border-b md:border-b-0 md:border-r border-gray-100 bg-gray-50/50">
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-white mb-8 transition-colors shadow-sm">
                <ArrowLeft size={18} />
              </button>
            )}
            
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{calendarTypeLabels[calendar.type]}</p>
            <h2 className="text-3xl font-black text-gray-900 mb-8 tracking-wide leading-tight">{calendar.name}</h2>
            
            <div className="space-y-5 mb-10">
              <div className="flex items-center gap-4 text-gray-600 font-medium">
                <Clock size={20} className="text-gray-400" />
                <span>{calendar.duration} min</span>
              </div>
              
              {(selectedDate && selectedTime) && (
                <div className="flex items-center gap-4 text-gray-600 font-medium">
                  <CalendarIcon size={20} className="text-gray-400" />
                  <span>{selectedTime}, {selectedDate} {monthNames[currentMonth]}</span>
                </div>
              )}

              {calendar.locationDetails && (
                <div className="flex items-start gap-4 text-gray-600">
                  {calendar.locationType === 'presencial' && <MapPin size={20} className="mt-0.5 text-gray-400 flex-shrink-0" />}
                  {calendar.locationType === 'videoconferencia' && <Video size={20} className="mt-0.5 text-gray-400 flex-shrink-0" />}
                  {calendar.locationType === 'telefonica' && <PhoneCall size={20} className="mt-0.5 text-gray-400 flex-shrink-0" />}
                  <span className="leading-snug">{calendar.locationDetails}</span>
                </div>
              )}
            </div>
            
            <p className="text-sm text-gray-500 leading-relaxed border-t border-gray-200 pt-6">{calendar.description}</p>
          </div>

          <div className="md:w-2/3 p-6 md:p-10 bg-white">
            {step === 1 && (
              <div className="animate-fade-in">
                <h3 className="text-xl font-black text-gray-900 mb-8 uppercase tracking-wide">Seleccione Fecha y Hora</h3>
                
                <div className="flex flex-col lg:flex-row gap-10">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-6">
                      <button onClick={() => { if(currentMonth>0) setCurrentMonth(currentMonth-1) }} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                        <ChevronLeft size={20} />
                      </button>
                      <span className="font-bold text-gray-900 text-lg">{monthNames[currentMonth]} {currentYear}</span>
                      <button onClick={() => { if(currentMonth<11) setCurrentMonth(currentMonth+1) }} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                        <ChevronRight size={20} />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-2 text-center mb-4">
                      {dayNames.map(day => <div key={day} className="text-[10px] font-bold text-gray-400 uppercase tracking-wider py-2">{day}</div>)}
                    </div>
                    
                    <div className="grid grid-cols-7 gap-2 text-center">
                      {blanks.map((_, i) => <div key={`b-${i}`} className="p-2"></div>)}
                      {days.map(day => {
                        const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const specificOverride = calendar.specificDates?.find(sd => sd.date === dateString);
                        const isSpecificDate = !!specificOverride;
                        
                        const dateObj = new Date(currentYear, currentMonth, day);
                        const weekDayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                        const daySchedule = calendar.schedule[weekDayMap[dateObj.getDay()]];
                        const isWeeklyActive = daySchedule?.active;
                        
                        const isPast = dateObj.setHours(0,0,0,0) < new Date().setHours(0,0,0,0);
                        
                        let isAvailable = false;
                        if (calendar.scheduleType === 'specific') {
                          isAvailable = isSpecificDate;
                        } else {
                          isAvailable = isSpecificDate || isWeeklyActive;
                        }
                        
                        const isDisabled = isPast || !isAvailable;
                        const isSelected = selectedDate === day;
                        
                        return (
                          <div key={day} className="p-1 relative">
                            <button
                              disabled={isDisabled}
                              onClick={() => { if(!isDisabled){ setSelectedDate(day); setSelectedTime(null); }}}
                              className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold transition-all border
                                ${isSelected ? 'text-white shadow-lg scale-110 border-transparent' : isDisabled ? 'text-gray-300 border-transparent cursor-not-allowed opacity-50' : 'text-gray-700 border-gray-100 hover:bg-gray-50 hover:border-gray-200'}
                              `}
                              style={isSelected ? { backgroundColor: calendar.primaryColor, borderColor: calendar.primaryColor } : {}}
                            >
                              {day}
                            </button>
                            {isSpecificDate && !isSelected && !isDisabled && <div className="absolute top-1 right-1 w-2 h-2 rounded-full border border-white" style={{backgroundColor: calendar.primaryColor}}></div>}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className={`w-full lg:w-56 transition-all duration-300 ${selectedDate ? 'opacity-100' : 'opacity-0 pointer-events-none hidden lg:block'}`}>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6 text-center lg:text-left">{selectedDate} de {monthNames[currentMonth]}</p>
                    <div className="h-[350px] overflow-y-auto pr-3 space-y-3 custom-scrollbar">
                      {dynamicTimeSlots.length > 0 ? dynamicTimeSlots.map(time => (
                        <div key={time} className="flex gap-2">
                          <button
                            onClick={() => setSelectedTime(time)}
                            className={`flex-1 py-3.5 px-4 rounded-xl border text-sm font-bold transition-all duration-300
                              ${selectedTime === time ? 'text-white w-1/2 border-transparent' : 'border-gray-200 text-gray-700 hover:border-blue-200 bg-white'}`}
                            style={selectedTime === time ? { backgroundColor: '#4b5563' } : {}}
                          >
                            {time}
                          </button>
                          {selectedTime === time && (
                            <button onClick={() => setStep(2)} className="flex-1 py-3.5 px-4 rounded-xl font-bold text-sm text-white animate-fade-in shadow-lg hover:scale-[1.02] transition-transform" style={{ backgroundColor: calendar.primaryColor }}>
                              Siguiente
                            </button>
                          )}
                        </div>
                      )) : (
                        <div className="text-sm text-gray-500 text-center py-10 font-medium bg-gray-50 rounded-xl border border-gray-100">No hay horas disponibles.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-fade-in">
                <h3 className="text-xl font-black text-gray-900 mb-8 uppercase tracking-wide">Detalles de Contacto</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(calendar.formFields || []).map(field => (
                      <div key={field.id} className={field.type === 'textarea' ? 'col-span-1 md:col-span-2' : ''}>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        {field.type === 'textarea' ? (
                          <textarea required={field.required} rows="3" className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3.5 text-gray-900 focus:ring-2 focus:outline-none resize-none transition-colors shadow-sm" style={{ '--tw-ring-color': calendar.primaryColor }}></textarea>
                        ) : (
                          <input required={field.required} type={field.type} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3.5 text-gray-900 focus:ring-2 focus:outline-none transition-colors shadow-sm" style={{ '--tw-ring-color': calendar.primaryColor }} />
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {calendar.allowGuests && (
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Correos de invitados (Opcional)</label>
                      <input type="text" placeholder="Separar múltiples correos con comas" className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3.5 text-gray-900 focus:ring-2 focus:outline-none transition-colors shadow-sm" style={{ '--tw-ring-color': calendar.primaryColor }} />
                    </div>
                  )}

                  {calendar.requireConsent && (
                    <label className="flex items-start gap-4 mt-6 bg-gray-50 p-5 rounded-xl border border-gray-200">
                      <input required type="checkbox" className="mt-1 w-5 h-5 rounded border-gray-300" style={{ accentColor: calendar.primaryColor }} />
                      <span className="text-sm text-gray-600 leading-snug">Al proceder, confirmas que has leído y aceptas nuestros términos y condiciones de privacidad.</span>
                    </label>
                  )}

                  <div className="pt-8 border-t border-gray-100 flex justify-end">
                    <button type="submit" className="px-10 py-4 rounded-xl text-white font-bold text-sm hover:scale-[1.02] transition-transform shadow-lg w-full md:w-auto" style={{ backgroundColor: calendar.primaryColor }}>
                      {calendar.buttonText}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col items-center justify-center text-center h-full animate-fade-in py-12">
                <div className="w-24 h-24 rounded-full flex items-center justify-center text-white mb-8 shadow-lg border-4 border-white" style={{ backgroundColor: calendar.primaryColor }}>
                  <Check size={48} />
                </div>
                <h3 className="text-4xl font-black text-gray-900 mb-4 uppercase tracking-wide">¡Cita Confirmada!</h3>
                <p className="text-gray-600 mb-10 text-lg max-w-md">
                  Estás agendado para el <strong className="text-gray-900 bg-gray-100 px-2 py-1 rounded">{selectedDate} de {monthNames[currentMonth]} a las {selectedTime}</strong>.
                </p>
                <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 w-full max-w-md mb-10 text-left">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Se ha enviado una invitación a:</p>
                  <p className="text-gray-900 font-bold mb-6 text-lg">tu-correo@ejemplo.com</p>
                  
                  <div className="space-y-4 border-t border-gray-200 pt-6">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Añadir a mi calendario</p>
                    <div className="flex gap-3">
                      <a href="#" className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white border border-gray-300 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                        <CalendarPlus size={18} className="text-blue-500" /> Google
                      </a>
                      <a href="#" className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white border border-gray-300 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                        <CalendarPlus size={18} className="text-sky-500" /> Outlook
                      </a>
                    </div>
                  </div>
                </div>
                <button onClick={() => window.location.reload()} className="font-bold border border-gray-300 text-gray-600 bg-white px-8 py-3.5 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                  Agendar otra cita
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}