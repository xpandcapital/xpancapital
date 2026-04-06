const fs = require('fs');
let code = fs.readFileSync('C:/Users/kevin/.gemini/antigravity/scratch/blis-corp/app/superadmin/mails/Mails.js', 'utf8');

// Fix PropertyColor
const oldColor = `function PropertyColor({ label, value, onChange }) { return <div className="mb-3"><label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">{label}</label><div className="flex items-center space-x-2"><input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-8 h-8 rounded border p-0.5 cursor-pointer" /><input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-[#333] bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-200 rounded text-sm font-mono uppercase" /></div></div>; }`;

const newColor = `function PropertyColor({ label, value, onChange }) { 
  return (
    <div className="mb-3">
      <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <div className="relative w-8 h-8 rounded-md border border-gray-200 dark:border-[#333] shadow-sm overflow-hidden shrink-0 bg-white">
          <input type="color" value={value || '#000000'} onChange={(e) => onChange(e.target.value)} className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer" />
        </div>
        <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} className="flex-1 w-full min-w-0 px-2 py-1.5 border border-gray-300 dark:border-[#333] bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white rounded text-xs font-mono uppercase" />
      </div>
    </div>
  ); 
}`;

code = code.replace(oldColor, newColor);

// Fix Twitter icon
code = code.replace(/twitter: \{ iconName: "twitter-x"/, 'twitter: { iconName: "twitterx--v1"');
code = code.replace(/if \(n\.network === 'twitter' && colorHex\.toLowerCase\(\) === 'ffffff'\) iconUrl = X_ICON_BASE64;/g, 
  "// Usamos el icono oficial de Icons8 para twitterx--v1 en lugar de la imagen en base64 para evitar errores");

fs.writeFileSync('C:/Users/kevin/.gemini/antigravity/scratch/blis-corp/app/superadmin/mails/Mails.js', code);
console.log("Fixed Color and Icon!");
