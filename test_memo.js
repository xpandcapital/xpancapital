const fs = require('fs');
const code = fs.readFileSync('C:/Users/kevin/.gemini/antigravity/scratch/blis-corp/app/superadmin/mails/Mails.js', 'utf8');
const searchStr1 = `const { getTemplates, saveTemplate: saveTemplateToDb, loading: templatesLoading } = useEmailTemplates();`;
const replaceStr1 = `const { getTemplates, saveTemplate: saveTemplateToDb, deleteTemplate: deleteTemplateFromDb, loading: templatesLoading } = useEmailTemplates();`;

const searchStr2 = `const { deleteTemplate } = useEmailTemplates();\n                          await deleteTemplate(t.id);`;
const replaceStr2 = `await deleteTemplateFromDb(t.id);`;

let newCode = code.replace(searchStr1, replaceStr1).replace(searchStr2, replaceStr2);

const searchStr3 = `function BlockRenderer({ block, settings, selectedBlockId, setSelectedBlockId, updateTree }) {`;
const replaceStr3 = `const BlockRenderer = React.memo(({ block, settings, selectedBlockId, setSelectedBlockId, updateTree }) => {`;

const searchStr4 = `return null;\n}`;
const replaceStr4 = `return null;\n}, (prevProps, nextProps) => {
  return prevProps.block === nextProps.block && 
         prevProps.settings === nextProps.settings && 
         (prevProps.selectedBlockId === nextProps.selectedBlockId || 
          (prevProps.selectedBlockId !== nextProps.block.id && nextProps.selectedBlockId !== nextProps.block.id));
});`;

newCode = newCode.replace(searchStr3, replaceStr3).replace(searchStr4, replaceStr4);

fs.writeFileSync('C:/Users/kevin/.gemini/antigravity/scratch/blis-corp/app/superadmin/mails/Mails.js', newCode);
console.log('Done!');
