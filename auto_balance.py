import os, re
path = "components/superadmin/POSManager.tsx"
with open(path, "r", encoding="utf-8") as f:
    code = f.read()

def get_depth(c):
    opens = len(re.findall(r'<div(?!\w)(?![^>]*\/>)', c))
    closes = len(re.findall(r'</div>', c))
    return opens - closes

depth = get_depth(code)
print(f"Initial depth: {depth}")

if depth < 0:
    for _ in range(abs(depth)):
        parts = code.split('            {isCheckoutOpen && (')
        if len(parts) > 1:
            before = parts[0]
            after = '            {isCheckoutOpen && (' + parts[1]
            last_div_idx = before.rfind('</div>')
            if last_div_idx != -1:
                # Find the whole line containing this </div>
                line_start = before.rfind('\n', 0, last_div_idx)
                if line_start == -1: line_start = 0
                before = before[:line_start] + before[last_div_idx+6:]
                code = before + after

print(f"Final depth: {get_depth(code)}")
with open(path, "w", encoding="utf-8") as f:
    f.write(code)
