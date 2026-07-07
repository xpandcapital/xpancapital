
import fs from 'fs';

const content = fs.readFileSync('c:\\Users\\kevin\\.gemini\\antigravity\\scratch\\blis-corp\\components\\superadmin\\POSManager.tsx', 'utf8');

function findUnclosed(text) {
    const lines = text.split('\n');
    let stack = [];
    
    // Improved regex to handle common JSX cases
    // Note: This is still a heuristic but better than before
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        // Remove strings and comments to avoid false positives
        line = line.replace(/\/\/.*/g, '');
        line = line.replace(/"[^"]*"/g, '""');
        line = line.replace(/'[^']*'/g, "''");
        line = line.replace(/`[^`]*`/g, "``");
        
        // Find all tags
        const tags = line.matchAll(/<(\/?[a-zA-Z][a-zA-Z0-9]*)|(\/>)/g);
        for (const match of tags) {
            const tagName = match[1];
            if (match[2]) { // Self-closing />
                // Don't push anything
            } else if (tagName.startsWith('/')) {
                const name = tagName.substring(1).toLowerCase();
                // Find matching opening tag in stack
                let found = false;
                for (let j = stack.length - 1; j >= 0; j--) {
                    if (stack[j].name === name) {
                        stack.splice(j, 1);
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    console.log(`Unexpected closing tag </${name}> at line ${i + 1}`);
                }
            } else {
                const name = tagName.toLowerCase();
                // Skip common self-closing HTML tags unless they have a closing tag in JSX
                // In React, tags like <img />, <input /> are common. 
                // But if they are like <img> (no slash), they might still be treated as self-closing or not.
                // For JSX, we assume if it doesn't end in />, it needs a </img>
                // EXCEPT for some standard ones that people often forget.
                if (['img', 'input', 'hr', 'br'].includes(name)) {
                     // Check if same line has />
                     if (!line.includes('/>', match.index)) {
                         // It's technically unclosed in HTML, but JSX usually requires /> or </img>
                         // Let's assume they are meant to be self-closing if they are these types
                         // and we see them on a line without closure.
                     } else {
                         // Already handled by match[2] if it was very simple, but let's be safe.
                     }
                } else {
                    stack.push({ name, line: i + 1 });
                }
            }
        }
    }
    
    console.log('Unclosed tags at end:');
    stack.forEach(s => console.log(`${s.name} at line ${s.line}`));
}

findUnclosed(content);
