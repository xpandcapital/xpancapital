const fs = require('fs');
const code = fs.readFileSync('tmp_POSManager.tsx', 'utf8');
const searchStr = "{view === 'pos' ? (";
const startPos = code.indexOf(searchStr);

if (startPos === -1) {
    console.log("Could not find start");
    process.exit(1);
}

console.log("Found start at pos", startPos);

let bracketDepth = 0;
for (let j = startPos; j < code.length; j++) {
    if (code[j] === '{') bracketDepth++;
    if (code[j] === '}') bracketDepth--;
    if (bracketDepth === 0) {
        const endOfFirstPart = j;
        console.log("Found end of block at pos", endOfFirstPart);
        const nextColon = code.indexOf(") : (", endOfFirstPart);
        if (nextColon !== -1) {
            console.log("Found next colon at", nextColon);
            console.log("Snippet near colon:", code.substring(nextColon - 20, nextColon + 50));
        } else {
            console.log("Could NOT find next colon!");
        }
        break;
    }
}
