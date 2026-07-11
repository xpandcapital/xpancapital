const fs = require('fs');
let code = fs.readFileSync('C:/Users/kevin/.gemini/antigravity/scratch/xpancapital/app/superadmin/mails/Mails.js', 'utf8');

// 1. Add state variables for Send Modal
const stateInsert = `  const [showExportHtml, setShowExportHtml] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendTab, setSendTab] = useState('destinatarios');
  const [campaignConfig, setCampaignConfig] = useState({ subject: '', preview: '', type: 'manual', emails: '', smtpHost: '', smtpPort: '465', smtpUser: '', smtpPass: '', fromName: '', fromEmail: '', provider: 'smtp' });`;
code = code.replace(/  const \[showExportHtml, setShowExportHtml\] = useState\(false\);/, stateInsert);

// 2. Add Send button to header
const buttonInsert = `          <button onClick={() => setShowSaveModal(true)} title="Guardar Plantilla" className="p-2 flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white rounded-md">
            <Database size={18} />
          </button>
          
          <button onClick={() => setShowSendModal(true)} title="Enviar Campaña" className="p-2 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
            <Send size={18} />
          </button>`;
code = code.replace(/          <button onClick=\{\(\) => setShowSaveModal\(true\)\} title="Guardar Plantilla" className="p-2 flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white rounded-md">\s*<Database size=\{18\} \/>\s*<\/button>/, buttonInsert);

// 3. Import Send icon
code = code.replace(/Code, X, Copy, Check, Save, Layers/g, 'Code, X, Copy, Check, Save, Layers, Send');

// 4. Add the Modal UI
const modalUI = `      {/* MODAL EXPORT HTML */}
      {showExportHtml && (`;

const sendModalCode = `      {/* MODAL ENVIAR CORREO */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#333] rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-[#222]">
              <h3 className="font-bold flex items-center gap-2 text-gray-900 dark:text-white text-lg">
                <Send className="text-blue-500"/> Enviar Campaña
              </h3>
              <button onClick={() => setShowSendModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-md bg-gray-100 dark:bg-[#222]"><X size={18}/></button>
            </div>
            
            <div className="flex border-b border-gray-200 dark:border-[#222] bg-gray-50 dark:bg-[#161616]">
              <button onClick={() => setSendTab('destinatarios')} className={\`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors \$\{sendTab === 'destinatarios' ? 'border-b-2 border-blue-500 text-blue-500 bg-white dark:bg-[#111111]' : 'text-gray-500 hover:text-gray-700'\}\`}>
                1. Destinatarios
              </button>
              <button onClick={() => setSendTab('smtp')} className={\`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors \$\{sendTab === 'smtp' ? 'border-b-2 border-blue-500 text-blue-500 bg-white dark:bg-[#111111]' : 'text-gray-500 hover:text-gray-700'\}\`}>
                2. Remitente / SMTP
              </button>
              <button onClick={() => setSendTab('envio')} className={\`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors \$\{sendTab === 'envio' ? 'border-b-2 border-blue-500 text-blue-500 bg-white dark:bg-[#111111]' : 'text-gray-500 hover:text-gray-700'\}\`}>
                3. Campaña
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              {sendTab === 'destinatarios' && (
                <div className="space-y-5 animate-fadeIn">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Método de Selección</label>
                    <div className="grid grid-cols-3 gap-3">
                      <button onClick={() => setCampaignConfig({...campaignConfig, type: 'manual'})} className={\`p-3 border rounded-xl flex flex-col items-center gap-2 transition-all \$\{campaignConfig.type === 'manual' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500' : 'border-gray-200 dark:border-[#333] text-gray-500 hover:border-gray-300 dark:hover:border-[#444]'\}\`}>
                        <Code size={20} />
                        <span className="text-xs font-bold">Manual (Comas)</span>
                      </button>
                      <button onClick={() => setCampaignConfig({...campaignConfig, type: 'individual'})} className={\`p-3 border rounded-xl flex flex-col items-center gap-2 transition-all \$\{campaignConfig.type === 'individual' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500' : 'border-gray-200 dark:border-[#333] text-gray-500 hover:border-gray-300 dark:hover:border-[#444]'\}\`}>
                        <MousePointerClick size={20} />
                        <span className="text-xs font-bold">Usuarios/Leads</span>
                      </button>
                      <button onClick={() => setCampaignConfig({...campaignConfig, type: 'grupos'})} className={\`p-3 border rounded-xl flex flex-col items-center gap-2 transition-all \$\{campaignConfig.type === 'grupos' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500' : 'border-gray-200 dark:border-[#333] text-gray-500 hover:border-gray-300 dark:hover:border-[#444]'\}\`}>
                        <Layers size={20} />
                        <span className="text-xs font-bold">Por Grupos</span>
                      </button>
                    </div>
                  </div>

                  {campaignConfig.type === 'manual' && (
                    <div className="bg-gray-50 dark:bg-[#161616] p-4 rounded-xl border border-gray-200 dark:border-[#333]">
                      <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">Correos Electrónicos (Separados por coma)</label>
                      <textarea 
                        rows={4}
                        placeholder="cliente1@gmail.com, empleado2@empresa.com, lead3@hotmail.com"
                        value={campaignConfig.emails}
                        onChange={(e) => setCampaignConfig({...campaignConfig, emails: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-[#444] rounded-lg bg-white dark:bg-[#0a0a0a] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                      <p className="text-[10px] text-gray-500 mt-2">Ideal para pruebas rápidas o bases de datos externas pequeñas.</p>
                    </div>
                  )}

                  {campaignConfig.type === 'individual' && (
                    <div className="bg-gray-50 dark:bg-[#161616] p-4 rounded-xl border border-gray-200 dark:border-[#333] text-center py-8">
                      <MousePointerClick size={32} className="mx-auto text-gray-400 mb-3 opacity-50" />
                      <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">Selección de CRM</h4>
                      <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">Selecciona destinatarios individuales desde tu lista de Asesores o Leads (Esta función requiere conexión con el módulo CRM).</p>
                      <button className="mt-4 px-4 py-2 bg-white dark:bg-[#222] border border-gray-200 dark:border-[#444] rounded-lg text-xs font-bold text-gray-700 dark:text-gray-300 shadow-sm">
                        + Cargar Lista de Contactos
                      </button>
                    </div>
                  )}

                  {campaignCon

