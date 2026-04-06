
import fs from 'fs';

const content = fs.readFileSync('c:\\Users\\kevin\\.gemini\\antigravity\\scratch\\blis-corp\\components\\superadmin\\POSManager.tsx', 'utf8');
const lines = content.split('\n');

let stack = [];
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Very basic finding of <div> and </div>
    // This doesn't handle everything but might help
    const openMatches = line.matchAll(/<div(\s|>)/g);
    for (const match of openMatches) {
        stack.push({ type: 'div', line: i + 1 });
    }
    const closeMatches = line.matchAll(/<\/div>/g);
    for (const match of closeMatches) {
        if (stack.length > 0 && stack[stack.length - 1].type === 'div') {
            stack.pop();
        } else {
            console.log(`Extra </div> at line ${i + 1}`);
        }
    }
}

console.log('Unclosed tags:');
stack.forEach(s => console.log(`${s.type} opened at line ${s.line}`));
