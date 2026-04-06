const fs = require('fs');
let code = fs.readFileSync('C:/Users/kevin/.gemini/antigravity/scratch/blis-corp/app/superadmin/mails/Mails.js', 'utf8');

// Replace icons list adding Send
code = code.replace(/import { Plus, Trash2, ArrowUp, ArrowDown, Type, Image, Video, Layout, MousePointerClick, Square, Minus, AlignLeft, Settings, Database, FolderOpen, Code, X, Copy, Check, Save, Layers, Upload, Monitor, Smartphone, Sun, Moon, MoveLeft, MoveRight, Pencil, Sparkles, Share2, AlignCenter, AlignRight } from 'lucide-react';/g, 
"import { Plus, Trash2, ArrowUp, ArrowDown, Type, Image, Video, Layout, MousePointerClick, Square, Minus, AlignLeft, Settings, Database, FolderOpen, Code, X, Copy, Check, Save, Layers, Upload, Monitor, Smartphone, Sun, Moon, MoveLeft, MoveRight, Pencil, Sparkles, Share2, AlignCenter, AlignRight, Send } from 'lucide-react';");

// Insert Send Modal Button
const buttonSaveStr = `<button onClick={() => setShowSaveModal(true)} title="Guardar Plantilla" className="p-2 flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white rounded-md">
            <Database size={18} />
          </button>`;
const buttonSendStr = `<button onClick={() => setShowSaveModal(true)} title="Guardar Plantilla" className="p-2 flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white rounded-md">
            <Database size={18} />
          </button>
          
          <button onClick={() => setShowSendModal(true)} title="Enviar Campaña" className="p-2 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
            <Send size={18} />
          </button>`;

code = code.replace(buttonSaveStr, buttonSendStr);
fs.writeFileSync('C:/Users/kevin/.gemini/antigravity/scratch/blis-corp/app/superadmin/mails/Mails.js', code);
console.log("Fixed buttons");
