
with open('c:/Users/kevin/.gemini/antigravity/scratch/blis-corp/components/superadmin/POSManager.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

open_braces = 0
close_braces = 0
open_parens = 0
close_parens = 0
open_tags = 0
close_tags = 0

for i, line in enumerate(lines):
    line_num = i + 1
    if line_num < 1400: continue
    
    open_braces += line.count('{')
    close_braces += line.count('}')
    open_parens += line.count('(')
    close_parens += line.count(')')
    
    # Simple tag counting (won't handle all cases but gives a hint)
    open_tags += line.count('<div') + line.count('<motion.div') + line.count('<button')
    close_tags += line.count('</div>') + line.count('</motion.div>') + line.count('</button>')

print(f"Braces: {open_braces} vs {close_braces}")
print(f"Parens: {open_parens} vs {close_parens}")
print(f"Tags (div/button): {open_tags} vs {close_tags}")
