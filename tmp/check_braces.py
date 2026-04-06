
with open('c:/Users/kevin/.gemini/antigravity/scratch/blis-corp/components/superadmin/POSManager.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

stack = []
for i, line in enumerate(text.split('\n')):
    for char in line:
        if char == '{':
            stack.append(i+1)
        elif char == '}':
            if stack:
                stack.pop()
            else:
                print(f"Extra closing brace on line {i+1}")

for line in stack:
    print(f"Unclosed brace from line {line}")
