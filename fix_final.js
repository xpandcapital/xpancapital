const fs = require('fs');
let code = fs.readFileSync('C:/Users/kevin/.gemini/antigravity/scratch/blis-corp/app/superadmin/mails/Mails.js', 'utf8');

// 1. Arreglar "handleLoadTemplate" para usar "getTemplate(templateId)" (singular!) en lugar de "getTemplates()"
const loadOld = `  const handleLoadTemplate = async (templateId) => {
    try {
      const template = await getTemplates();
      const found = template?.find(t => t.id === templateId);
      if (found) {`;
const loadNew = `  const handleLoadTemplate = async (templateId) => {
    try {
      const found = await getTemplate(templateId); // <-- llama al singular para traer settings y blocks
      if (found) {`;
code = code.replace(loadOld, loadNew);

// 1.5. Asegurar que extraemos getTemplate del hook
const hookOld = `const { getTemplates, saveTemplate: saveTemplateToDb, deleteTemplate: deleteTemplateFromDb, loading: templatesLoading } = useEmailTemplates();`;
const hookNew = `const { getTemplates, getTemplate, saveTemplate: saveTemplateToDb, deleteTemplate: deleteTemplateFromDb, loading: templatesLoading } = useEmailTemplates();`;
code = code.replace(hookOld, hookNew);

// 2. Arreglar importador de HTML para rellenar imágenes rotas con Placeholders
const envatoRegex = /const bodyMatch = htmlCode\.match\(\/<body\[\^>\]\*>\(\[\s\S\]\*\?\)<\/body>\/i\);\n                    const finalCode = bodyMatch \? bodyMatch\[1\] : htmlCode;/;
const envatoNew = `const bodyMatch = htmlCode.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
                    let finalCode = bodyMatch ? bodyMatch[1] : htmlCode;
                    
                    // REPARAR IMAGENES ROTAS DE ENVATO (paths relativos)
                    finalCode = finalCode.replace(/src=["'](?!http)(.*?)["']/gi, (match, p1) => {
                        return \`src="https://placehold.co/600x400/222222/FFF?text=Imagen+Local+No+Subida"\`;
                    });
                    finalCode = finalCode.replace(/background=["'](?!http)(.*?)["']/gi, (match, p1) => {
                        return \`background="https://placehold.co/600x400/222222/FFF?text=Fondo+Local+No+Subido"\`;
                    });`;
code = code.replace(envatoRegex, envatoNew);

// 3. Arreglar "document.getElementById('envato-import-sidebar').click()" para asegurarse que vacíe el valor antes
code = code.replace(/e\.target\.value = '';/g, `// e.target.value = '';`);

fs.writeFileSync('C:/Users/kevin/.gemini/antigravity/scratch/blis-corp/app/superadmin/mails/Mails.js', code);
console.log("Applied fixes to Mails.js");
