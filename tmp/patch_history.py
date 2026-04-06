
import sys

def patch():
    path = r"c:\Users\kevin\.gemini\antigravity\scratch\blis-corp\app\superadmin\trading\TerminalLogic.tsx"
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # 1. Add historyFilter state
    for i, line in enumerate(lines):
        if 'const [balance, setBalance]' in line:
            lines.insert(i+1, "  const [historyFilter, setHistoryFilter] = useState<'ALL' | 'REAL' | 'PAPER'>('ALL');\n")
            break

    # 2. Update Historial tab UI (filter + wipe button)
    hist_start = 0
    for i, line in enumerate(lines):
        if "{terminalTab === 'historial' && (" in line:
            hist_start = i
            break
            
    if hist_start:
        # We replace the table start with a div containing the filter and then the table
        # Searching for the table opening
        for i in range(hist_start, len(lines)):
            if '<table class' in lines[i].lower():
                # Wrap the table
                filter_ui = [
                    "                    <div className=\"flex flex-col h-full\">\n",
                    "                        <div className=\"flex flex-wrap justify-between items-center px-6 py-3 border-b border-white/5 bg-black/20 gap-4\">\n",
                    "                            <div className=\"flex gap-4\">\n",
                    "                                <button onClick={()=>setHistoryFilter('ALL')} className={`text-[9px] font-black uppercase tracking-widest transition-all ${historyFilter === 'ALL' ? 'text-white border-b border-white' : 'text-gray-500 hover:text-gray-300'}`}>Todos</button>\n",
                    "                                <button onClick={()=>setHistoryFilter('REAL')} className={`text-[9px] font-black uppercase tracking-widest transition-all ${historyFilter === 'REAL' ? 'text-white border-b border-white' : 'text-gray-500 hover:text-gray-300'}`}>Real</button>\n",
                    "                                <button onClick={()=>setHistoryFilter('PAPER')} className={`text-[9px] font-black uppercase tracking-widest transition-all ${historyFilter === 'PAPER' ? 'text-white border-b border-white' : 'text-gray-500 hover:text-gray-300'}`}>Simulador</button>\n",
                    "                            </div>\n",
                    "                            <button onClick={wipeAllData} className=\"text-[9px] font-black text-blis-red-neon uppercase tracking-widest hover:text-white transition-all bg-blis-red/10 px-3 py-1 rounded-full border border-blis-red/20\">Limpiar Todo el Rastro</button>\n",
                    "                        </div>\n"
                ]
                lines[i:i] = filter_ui
                
                # Now we need to find the </table> and close the div
                for k in range(i + len(filter_ui), len(lines)):
                    if '</table>' in lines[k]:
                        lines.insert(k+1, "                    </div>\n")
                        break
                
                # And update the map filter
                for k in range(i + len(filter_ui), len(lines)):
                    if '{[...tradeHistory].map((t, i) => (' in lines[k]:
                        lines[k] = lines[k].replace('{[...tradeHistory].map((t, i) => (', '{[...tradeHistory].filter(t => historyFilter === \"ALL\" || t.tradeMode === historyFilter).map((t, i) => (')
                        break
                break

    # 3. Update Memoria tab UI (Add wipe button)
    for i, line in enumerate(lines):
        if "Vaciar Memoria" in line:
            # Add after the current button
            lines.insert(i+2, "                          <button onClick={wipeAllData} className=\"text-[9px] font-black text-blis-red-neon hover:text-white transition-all bg-blis-red/10 px-3 py-1 rounded-full border border-blis-red/20 uppercase tracking-widest ml-4\">\n")
            lines.insert(i+3, "                             Limpiar Todo el Sistema\n")
            lines.insert(i+4, "                          </button>\n")
            break

    with open(path, 'w', encoding='utf-8') as f:
        f.writelines(lines)

if __name__ == "__main__":
    patch()
