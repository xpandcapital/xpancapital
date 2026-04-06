const fs = require('fs');
const code = fs.readFileSync('components/superadmin/POSManager.tsx', 'utf8');
const lines = code.split('\n');
let depth = 0;
lines.forEach((line, i) => {
    const openings = (line.match(/<div(?!\w)/g) || []).length;
    const closings = (line.match(/<\/div>/g) || []).length;
    depth += openings - closings;
    if (depth < 0) {
        console.log(`IMBALANCE at line ${i + 1}: depth ${depth}`);
        console.log(line);
        depth = 0; // reset to keep searching
    }
});
console.log("Final depth:", depth);
