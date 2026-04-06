const fs = require('fs');
let code = fs.readFileSync('C:/Users/kevin/.gemini/antigravity/scratch/blis-corp/app/superadmin/mails/Mails.js', 'utf8');

code = code.replace(/const { deleteTemplate } = useEmailTemplates\(\);\s*await deleteTemplate\(t\.id\);/g, 'await deleteTemplateFromDb(t.id);');

// Y para el memo
code = code.replace(/function BlockRenderer\({ block, settings, selectedBlockId, setSelectedBlockId, updateTree }\) \{/g, 'const BlockRenderer = React.memo(function BlockRenderer({ block, settings, selectedBlockId, setSelectedBlockId, updateTree }) {');
code = code.replace(/return null;\n}/g, 'return null;\n});');

fs.writeFileSync('C:/Users/kevin/.gemini/antigravity/scratch/blis-corp/app/superadmin/mails/Mails.js', code);
