
import os

filepath = r'c:\Users\kevin\.gemini\antigravity\scratch\blis-corp\components\superadmin\POSManager.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

open_div = content.count('<div')
close_div = content.count('</div')
open_frag = content.count('<>')
close_frag = content.count('</>')

print(f"Divs: {open_div} / {close_div}")
print(f"Fragments: {open_frag} / {close_frag}")

# Count { and }
o_brace = content.count('{')
c_brace = content.count('}')
print(f"Braces: {o_brace} / {c_brace}")
