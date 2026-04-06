import re
path = "components/superadmin/POSManager.tsx"
with open(path, "r", encoding="utf-8") as f:
    code = f.read()

def get_depth(c):
    opens = len(re.findall(r'<div(?!\w)(?![^>]*\/>)', c))
    closes = len(re.findall(r'</div>', c))
    return opens - closes

depth = get_depth(code)
print(f"Depth: {depth}")

if depth > 0:
    parts = code.split('            {isCheckoutOpen && (')
    if len(parts) > 1:
        before = parts[0]
        after = '            {isCheckoutOpen && (' + parts[1]
        insertion = "            </div>\n" * depth
        code = before + insertion + after

with open(path, "w", encoding="utf-8") as f:
    f.write(code)
print("Balanced!")
