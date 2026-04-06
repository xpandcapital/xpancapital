import React from 'react';
import { 
  AlertTriangle, Bot, Bell, BellOff, Settings, Server, 
  MousePointer, Minus, Pencil, Eraser, Trash2 
} from 'lucide-react';

// ==========================================
// ESTILOS GLOBALES RE-ADAPTADOS AL TEMA BLIS-CORP
// ==========================================
export const globalStyles = `
  @keyframes scanLine { 
    0% { left: 0%; opacity: 0; } 
    10% { opacity: 0.8; } 
    90% { opacity: 0.8; } 
    100% { left: 100%; opacity: 0; } 
  }
  .scanner-beam { 
    position: absolute; top: 0; bottom: 0; width: 2px; 
    background: #be0b3c; box-shadow: 0 0 20px 5px rgba(190, 11, 60, 0.5); 
    animation: scanLine 3s linear infinite; z-index: 5; pointer-events: none; 
  }
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  .trading-main { background: #050505 !important; }
  .trading-main .chat-selectable { user-select: text; -webkit-user-select: text; cursor: text; }
  .bg-signal-green { background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.4) 100%); border: 1px solid rgba(16, 185, 129, 0.5); }
  .bg-signal-expired { background: rgba(55, 65, 81, 0.1); border: 1px solid rgba(107, 114, 128, 0.1); opacity: 0.7; }
  svg { display: block; }
  * { scrollbar-color: #be0b3c transparent; }
`;

export const safeText = (val: any) => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') {
      try { return val.message || JSON.stringify(val); } catch (e) { return '[Error de Datos]'; }
  }
  return String(val);
};

// Componentes secundarios protegidos
export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: any) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#111419] text-blis-red p-10 font-mono text-center">
          <AlertTriangle size={64} className="mb-4 text-blis-red" />
          <h1 className="text-2xl font-bold mb-4">Error de Renderizado Detectado</h1>
          <p className="mb-4 text-gray-400">El escudo anti-crashes de la terminal ha detenido la ejecución para evitar la pérdida de datos.</p>
          <button onClick={() => window.location.reload()} className="mt-8 bg-blis-red text-white font-bold px-6 py-3 rounded-xl hover:bg-blis-red/80 transition-colors shadow-lg">REINICIAR TERMINAL</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export const SidebarIcon = ({ icon, label, badge, onClick, active }: any) => (
  <button onClick={onClick} data-tooltip={label} className={`relative flex items-center justify-center w-full py-2 cursor-pointer transition-all ${active ? 'text-blis-red-neon' : 'text-gray-500 hover:text-white'}`}>
    {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blis-red-neon rounded-r-full shadow-[2px_0_10px_rgba(255,30,86,0.5)] pointer-events-none"></div>}
    <div className="pointer-events-none">{icon}</div>
    {badge > 0 && <span className="absolute top-0 right-2 bg-blis-red text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full pointer-events-none">{badge}</span>}
  </button>
);

export const ToolButton = ({ icon, active, onClick, hoverColor = "hover:bg-blis-red/20 hover:text-blis-red-neon", title }: any) => (
  <button 
    data-tooltip={title}
    onMouseUp={(e) => e.currentTarget.blur()}
    onClick={onClick} 
    className={`p-2.5 md:p-2 rounded-xl transition-all active:scale-95 border ${active ? 'bg-blis-red/30 text-blis-red-neon border-blis-red-neon/40 shadow-[0_0_15px_rgba(255,30,86,0.2)]' : `border-transparent text-gray-500 ${hoverColor}`}`}>
      <div className="pointer-events-none">{icon}</div>
  </button>
);
