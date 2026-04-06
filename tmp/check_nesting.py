
with open('c:/Users/kevin/.gemini/antigravity/scratch/blis-corp/components/superadmin/POSManager.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

nesting = 0
for i, line in enumerate(lines):
    line_num = i + 1
    if line_num < 460: continue
    
    delta = line.count('{') - line.count('}')
    nesting += delta
    if delta != 0 or line_num > 1830:
        print(f"{line_num}: delta={delta}, nesting={nesting} | {line.strip()}")
