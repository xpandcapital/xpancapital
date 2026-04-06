const fs = require('fs');
let code = fs.readFileSync('C:/Users/kevin/.gemini/antigravity/scratch/blis-corp/app/globals.css', 'utf8');

if (!code.includes('@custom-variant dark')) {
  code = `@custom-variant dark (&:is(.dark *));\n` + code;
  fs.writeFileSync('C:/Users/kevin/.gemini/antigravity/scratch/blis-corp/app/globals.css', code);
  console.log("Updated globals.css with custom dark variant");
} else {
  console.log("Already has custom dark variant");
}
