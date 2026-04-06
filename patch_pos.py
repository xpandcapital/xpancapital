
import os

filepath = r'c:\Users\kevin\.gemini\antigravity\scratch\blis-corp\components\superadmin\POSManager.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: Double closing at customer section
content = content.replace('                            )}\n\n                            )}', '                            )}')

# Fix 2: Corrupted checkout transition
old_block = """                                        </div>
                                     )                                     <div className="w-[450px] bg-zinc-900/40 p-12 rounded-[4rem] border border-white/5 flex flex-col items-center justify-between text-center overflow-hidden relative shadow-2xl">"""
new_block = """                                            </div>
                                        </div>
                                    )}
                                </div>

                                {!invoiceResult && (
                                    <div className="w-[450px] bg-zinc-900/40 p-12 rounded-[4rem] border border-white/5 flex flex-col items-center justify-between text-center overflow-hidden relative shadow-2xl">"""

content = content.replace(old_block, new_block)

# Fix 3: Garbage text ng()}
garbage = """                                        </div>
ng()}
                                         </div>
                                     </div>"""
fixed_garbage = """                                        </div>
                                    </div>"""

content = content.replace(garbage, fixed_garbage)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("File patched successfully")
