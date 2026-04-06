
import re

with open('c:/Users/kevin/.gemini/antigravity/scratch/blis-corp/components/superadmin/POSManager.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

def check_simple_tags(text, tag_name):
    opens = len(re.findall(rf'<{tag_name}[\s>]', text))
    closes = text.count(f'</{tag_name}>')
    print(f"Tag <{tag_name}>: {opens} opens, {closes} closes")

check_simple_tags(text, 'div')
check_simple_tags(text, 'button')
check_simple_tags(text, 'motion.div')
check_simple_tags(text, 'span')
check_simple_tags(text, 'p')
check_simple_tags(text, 'h1')
check_simple_tags(text, 'h2')
check_simple_tags(text, 'h3')
