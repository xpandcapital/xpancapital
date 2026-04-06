const fs = require('fs');
let code = fs.readFileSync('C:/Users/kevin/.gemini/antigravity/scratch/blis-corp/app/superadmin/mails/Mails.js', 'utf8');

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

// Buscar la funcion existente y reemplazarla
const startIdx = code.indexOf('const handleLoadTemplate = async (templateId) => {');
if (startIdx !== -1) {
  let endIdx = code.indexOf('};', startIdx) + 2;
  // encontrar la llave de cierre real
  let openBraces = 0;
  for (let i = startIdx; i < code.length; i++) {
    if (code[i] === '{') openBraces++;
    if (code[i] === '}') {
      openBraces--;
      if (openBraces === 0) {
        endIdx = i + 1;
        break;
      }
    }
  }
  code = code.substring(0, startIdx) + loadTemplateCode + code.substring(endIdx);
  fs.writeFileSync('C:/Users/kevin/.gemini/antigravity/scratch/blis-corp/app/superadmin/mails/Mails.js', code);
  console.log("Success replacing handleLoadTemplate");
} else {
  console.log("Could not find handleLoadTemplate");
}
