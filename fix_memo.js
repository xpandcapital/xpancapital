const fs = require('fs');
let code = fs.readFileSync('C:/Users/kevin/.gemini/antigravity/scratch/blis-corp/app/superadmin/mails/Mails.js', 'utf8');

code = code.replace(/const BlockRenderer = React\.memo\(function BlockRenderer\(\{ block, settings, selectedBlockId, setSelectedBlockId, updateTree \}\) \{/g, 'const BlockRenderer = React.memo(({ block, settings, selectedBlockId, setSelectedBlockId, updateTree }) => {');

code = code.replace(/return null;\n\}\);/g, `return null;
}, (prevProps, nextProps) => {
  return prevProps.block === nextProps.block && 
         prevProps.settings === nextProps.settings && 
         (prevProps.selectedBlockId === nextProps.selectedBlockId || 
          (prevProps.selectedBlockId !== prevProps.block.id && nextProps.selectedBlockId !== nextProps.block.id));
});`);

fs.writeFileSync('C:/Users/kevin/.gemini/antigravity/scratch/blis-corp/app/superadmin/mails/Mails.js', code);
