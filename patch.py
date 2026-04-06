import os
path = "components/superadmin/POSManager.tsx"
with open(path, "r", encoding="utf-8") as f:
    lines = f.readlines()

# Line 1328 in 1-based is index 1327
if "</div>" in lines[1327]:
    print("Found extra div at 1328, removing...")
    lines.pop(1327)

# Prepend {isCheckoutOpen && before the fixed inset (which was at 1331, now 1330)
# Index 1329 is line 1330.
lines.insert(1329, "            {isCheckoutOpen && (\n")

# Closing tag for the modal: find line with thermal ticket
for i, line in enumerate(lines):
    if "{/* THERMAL TICKET */}" in line:
        lines.insert(i, "            )}\n")
        break

with open(path, "w", encoding="utf-8") as f:
    f.writelines(lines)
print("Patch applied.")
