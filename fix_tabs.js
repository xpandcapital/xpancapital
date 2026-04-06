const fs = require('fs');
let code = fs.readFileSync('C:/Users/kevin/.gemini/antigravity/scratch/blis-corp/app/superadmin/mails/Mails.js', 'utf8');

const broken = `                </div>
              </div>
            )}} />
                      <div className="grid grid-cols-2 gap-2">`;

const fixed = `                </div>
              </div>
            )}

            {activeTab === 'global' && (
              <div className="space-y-6">
                <PropertyGroup title="Todas las Paletas">
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {currentPalettes.map((p, index) => (
                      <div key={p.id} className={\`relative flex flex-col rounded border-2 overflow-hidden \$\{settings.activePaletteId === p.id ? 'border-[#e11d48] bg-[#e11d48]/10 text-[#e11d48]' : 'border-gray-200 dark:border-[#333] text-gray-500'\}\`}>
                        <button onClick={() => applyPalette(p.id)} className="w-full text-xs font-bold pt-2 pb-6 px-1">
                          <div className="flex justify-center gap-1 mb-1">
                            <span className="w-3 h-3 rounded-full border" style={{background: p.bodyBg}}></span>
                            <span className="w-3 h-3 rounded-full border" style={{background: p.containerBg}}></span>
                            <span className="w-3 h-3 rounded-full" style={{background: p.primary}}></span>
                          </div>
                          {p.name}
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/5 p-1 flex justify-center items-center border-t border-gray-200 dark:border-[#333]">
                           <button onClick={(e) => movePalette(index, 'up', e)} disabled={index === 0} className="px-1 text-gray-400 hover:text-gray-600"><MoveLeft size={12}/></button>
                           <button onClick={(e) => movePalette(index, 'down', e)} disabled={index === currentPalettes.length - 1} className="px-1 text-gray-400 hover:text-gray-600"><MoveRight size={12}/></button>
                           <button onClick={(e) => startEditPalette(p, e)} className="px-1 text-gray-400 hover:text-blue-500"><Pencil size={12}/></button>
                           <button onClick={(e) => deletePalette(p.id, e)} className="px-1 text-gray-400 hover:text-red-500"><Trash2 size={12}/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={toggleCreatePalette} className="w-full py-1.5 bg-gray-100 dark:bg-[#222] text-xs font-bold rounded border-dashed border-2 border-gray-300 dark:border-[#444]">
                    {isEditingPalette && !editingPaletteId ? '- Cancelar' : '+ Añadir Nueva Paleta'}
                  </button>
                  {isEditingPalette && (
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-[#0a0a0a] border rounded-lg">
                      <PropertyInput label="Nombre" value={paletteForm.name} onChange={(v) => setPaletteForm({...paletteForm, name: v})} />
                      <div className="grid grid-cols-2 gap-2">`;

code = code.replace(broken, fixed);
fs.writeFileSync('C:/Users/kevin/.gemini/antigravity/scratch/blis-corp/app/superadmin/mails/Mails.js', code);
console.log("Fixed!");
