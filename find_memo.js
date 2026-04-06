const fs = require('fs');
let code = fs.readFileSync('C:/Users/kevin/.gemini/antigravity/scratch/blis-corp/app/superadmin/mails/Mails.js', 'utf8');
const lines = code.split('\n');
for (let i = 1170; i < lines.length; i++) {
  console.log((i+1)+':', lines[i]);
}
