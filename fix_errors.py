import os
fp = 'components/superadmin/POSManager.tsx'
with open(fp, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('import {\\n    Search', 'import {\\n    Copy, AlertCircle,\\n    Search')
text = text.replace('TombstoneIcon', 'AlertCircle')
text = text.replace('{customer.licencia}', '{typeof customer.licencia === "string" ? customer.licencia : "Si"}')
text = text.replace('customer?.id?.length > 8 ?', '(customer?.id?.length || 0) > 8 ?')

with open(fp, 'w', encoding='utf-8') as f:
    f.write(text)
