
with open('c:/Users/kevin/.gemini/antigravity/scratch/blis-corp/components/superadmin/POSManager.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

def check_balance(text):
    stack = []
    lines = text.split('\n')
    for i, line in enumerate(lines):
        for char in line:
            if char in '{[(':
                stack.append((char, i+1))
            elif char in '}])':
                if not stack:
                    print(f"Extra closing {char} on line {i+1}")
                    continue
                open_char, open_line = stack.pop()
                if (char == '}' and open_char != '{') or \
                   (char == ']' and open_char != '[') or \
                   (char == ')' and open_char != '('):
                    print(f"Mismatch: {open_char} (L{open_line}) with {char} (L{i+1})")
    
    while stack:
        char, line = stack.pop()
        print(f"Unclosed {char} from line {line}")

check_balance(text)
