const fs = require('fs');
let code = fs.readFileSync('C:/Users/kevin/.gemini/antigravity/scratch/blis-corp/app/superadmin/mails/Mails.js', 'utf8');

code = code.replace(/return null;\n\}\n\n\/\/ --- SUB-COMPONENTES DE PROPIEDADES ---/g, `return null;\n});\n\n// --- SUB-COMPONENTES DE PROPIEDADES ---`);

fs.writeFileSync('C:/Users/kevin/.gemini/antigravity/scratch/blis-corp/app/superadmin/mails/Mails.js', code);
