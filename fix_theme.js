const fs = require('fs');
let code = fs.readFileSync('C:/Users/kevin/.gemini/antigravity/scratch/blis-corp/app/superadmin/mails/Mails.js', 'utf8');

const useEffectCode = `  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);`;

code = code.replace(/  const \[theme, setTheme\] = useState\('dark'\);/, `  const [theme, setTheme] = useState('dark');\n\n${useEffectCode}`);

fs.writeFileSync('C:/Users/kevin/.gemini/antigravity/scratch/blis-corp/app/superadmin/mails/Mails.js', code);
