import os

text = ''
for f in ['part1.txt', 'part2.txt', 'part3.txt']:
    with open(f, 'r', encoding='utf-8') as file:
        text += file.read()

text = text.replace('import {\n    Search', 'import { Copy, AlertCircle,\n    Search')
text = text.replace('TombstoneIcon', 'AlertCircle')
text = text.replace('{customer.licencia}', '{typeof customer.licencia === "string" ? customer.licencia : "Si"}')
text = text.replace('customer?.id?.length > 8 ?', '(customer?.id?.length || 0) > 8 ?')

with open('components/superadmin/POSManager.tsx', 'w', encoding='utf-8') as fout:
    fout.write(text)
