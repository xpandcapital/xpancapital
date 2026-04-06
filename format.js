const fs = require('fs');
let code = fs.readFileSync('C:/Users/kevin/.gemini/antigravity/scratch/blis-corp/app/superadmin/mails/Mails.js', 'utf8');
code = code.replace(/function PropertyGroup.*?\}\)\}\<\/select\>\<\/div\>\; \}/g, (match) => match.replace(/\<\/div\>\;/g, '</div>;'));
fs.writeFileSync('C:/Users/kevin/.gemini/antigravity/scratch/blis-corp/app/superadmin/mails/Mails.js', code);
