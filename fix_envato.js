const fs = require('fs');
let code = fs.readFileSync('C:/Users/kevin/.gemini/antigravity/scratch/blis-corp/app/superadmin/mails/Mails.js', 'utf8');

// Modificar handleLoadTemplate
const loadTemplateCode = `  const handleLoadTemplate = async (templateId) => {
    try {
      const template = await getTemplates();
      const found = template?.find(t => t.id === templateId);
      if (found) {
        const blks = typeof found.blocks === 'string' ? JSON.parse(found.blocks) : found.blocks;
        const sets = typeof found.settings === 'string' ? JSON.parse(found.settings) : found.settings;
        setBlocks(blks || []);
        setSettings(sets || INITIAL_SETTINGS);
        setCurrentTemplateId(found.id);
        setTemplateName(found.nombre);
        setShowTemplatesModal(false);
        setSelectedBlockId(null);
      } else {
        alert("No se pudo cargar la plantilla.");
      }
    } catch (e) {
      console.error(e);
      alert("Error al cargar la plantilla.");
    }
  };`;
code = code.replace(/  const handleLoadTemplate = async \(templateId\) => \{[\s\S]*?setSelectedBlockId\(null\);\n    \}\n  \};/m, loadTemplateCode);

// Modificar modo oscuro: Forzar clases de tailwind en el div global de React si es posible, o usar clase manual.
code = code.replace(/<div className=\{\`flex flex-col h-screen font-sans overflow-hidden transition-colors duration-300 \$\{theme === 'dark' \? 'dark bg-\[#0a0a0a\] text-gray-200' : 'bg-gray-100 text-gray-800'\}\`\}>/g, 
  '<div id="blismail-cms-root" className={`flex flex-col h-screen font-sans overflow-hidden transition-colors duration-300 ${theme === \'dark\' ? \'dark bg-[#0a0a0a] text-gray-200\' : \'bg-gray-100 text-gray-800\'}`}>');

// Reemplazar la sección Envato
const envatoSection = `{activeTab === 'envato' && (
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
                      e.target.value = ''; // reset
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
                  Nota: El código HTML importado funcionará como un solo bloque grande en nuestro editor visual. Puedes usar las opciones de "Añadir Bloque" arriba y abajo para extenderlo usando nuestras herramientas nativas.
                </div>
              </div>
            )}`;

code = code.replace(/\{activeTab === 'envato' && \([\s\S]*?Nota: El código HTML importado funcionará como un solo bloque grande[\s\S]*?\}\)/m, envatoSection);

fs.writeFileSync('C:/Users/kevin/.gemini/antigravity/scratch/blis-corp/app/superadmin/mails/Mails.js', code);
