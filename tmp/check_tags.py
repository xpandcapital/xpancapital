
import re

with open('c:/Users/kevin/.gemini/antigravity/scratch/blis-corp/components/superadmin/POSManager.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove comments
content = re.sub(r'\{/\*.*?\*/\}', '', content, flags=re.DOTALL)
content = re.sub(r'//.*', '', content)

stack = []
# Find all <tag, </tag, and self-closing tags
# This is a very rough regex but might find simple imbalances
tags = re.findall(r'<([a-zA-Z0-9\.]+)[\s>/>]|</([a-zA-Z0-9\.]+)>|<(/>|>)', content)

# Wait, regex for tags in TSX is hard. 
# Let's just look at the specific ones I know: div, button, motion.div, Fragment (<>).

def check_tags(content):
    stack = []
    # simplified: find <div, <button, <motion.div, <>, </div, </button, </motion.div, </>
    # and self-closing <CheckCircle2 ... />
    
    # We'll just look for the main ones.
    lines = content.split('\n')
    for i, line in enumerate(lines):
        # find matching tags
        matches = re.finditer(r'<(div|button|motion\.div|Ticket|FileText|ShoppingCart|History|CheckCircle2|CheckCircle|X|Plus|Minus|Trash2|User|CreditCard|Banknote|Coins|ChevronRight|Filter|Receipt|TrendingUp|Package|Users|ScanLine|ArrowRightLeft|Save|Printer|Edit3|ClipboardList|Calendar|ChevronLeft|Percent|Tag|MessageSquare|Truck|MapPin|ShieldCheck|Copy|AnimatePresence|POSAIUpsell|style|h1|h2|h3|p|span|label|table|thead|tbody|tr|th|td|img|input|a|main|section|header|footer|nav|ul|li|strong|b|i|em|br|hr|Fragment|>)(\s|/?>)|</(div|button|motion\.div|Ticket|FileText|ShoppingCart|History|CheckCircle2|CheckCircle|X|Plus|Minus|Trash2|User|CreditCard|Banknote|Coins|ChevronRight|Filter|Receipt|TrendingUp|Package|Users|ScanLine|ArrowRightLeft|Save|Printer|Edit3|ClipboardList|Calendar|ChevronLeft|Percent|Tag|MessageSquare|Truck|MapPin|ShieldCheck|Copy|AnimatePresence|POSAIUpsell|style|h1|h2|h3|p|span|label|table|thead|tbody|tr|th|td|img|input|a|main|section|header|footer|nav|ul|li|strong|b|i|em|br|hr|Fragment|>)(\s|>)', line)
        
        for m in matches:
            tag = m.group(1) or m.group(4)
            full_match = m.group(0)
            
            if full_match.startswith('</'):
                if not stack:
                    print(f"Extra closing tag {tag} on line {i+1}")
                    continue
                open_tag, open_line = stack.pop()
                if tag != open_tag:
                    if tag == 'Fragment' and open_tag == '>': pass # <> matches </>
                    elif tag == '>' and open_tag == 'Fragment': pass
                    else:
                        print(f"Mismatch: <{open_tag}> (L{open_line}) with </{tag}> (L{i+1})")
            elif full_match.endswith('/>'):
                continue # self-closing
            else:
                stack.append((tag, i+1))
    
    while stack:
        tag, line = stack.pop()
        print(f"Unclosed tag <{tag}> from line {line}")

check_tags(content)
