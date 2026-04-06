
import os

filepath = r'c:\Users\kevin\.gemini\antigravity\scratch\blis-corp\components\superadmin\POSManager.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Line 1585 is lines[1584] (0-indexed)
lines[1584] = '                                    )}\n                                </div>\n\n                                {!invoiceResult && (\n                                    <div className="w-[450px] bg-zinc-900/40 p-12 rounded-[4rem] border border-white/5 flex flex-col items-center justify-between text-center overflow-hidden relative shadow-2xl">\n'

# Line 1597 is lines[1596]
lines[1596] = '                                        </div>\n'
lines[1597] = '                                    </div>\n'
lines[1598] = '\n' # Empty line

with open(filepath, 'w', encoding='utf-8', newline='\n') as f:
    f.writelines(lines)

print("File patched by line index successfully")
