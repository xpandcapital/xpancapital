const fs = require('fs');
const code = fs.readFileSync('components/superadmin/POSManager.tsx', 'utf8');
const lines = code.split('\n');

const header = lines.slice(0, 435).join('\n');
const left = lines.slice(438, 674).join('\n'); // Content inside Left
const right = lines.slice(678, 1326).join('\n'); // Content inside Right
const modal = lines.slice(1330, 1536).join('\n');
const ticket = lines.slice(1537).filter(l => !l.includes('</>')).join('\n');

const final = header + '\n' +
    '        <>\n' +
    '            <div className="flex flex-col lg:flex-row h-screen lg:h-[calc(100vh-80px)] bg-black overflow-hidden">\n' +
    '                {/* COL 1: TERMINAL */}\n' +
    '                <div className="flex-1 flex flex-col border-r border-white/5 lg:overflow-hidden">\n' +
    left + '\n' +
    '                </div>\n' +
    '\n' +
    '                {/* COL 2: SIDEBAR */}\n' +
    '                <div className="w-full lg:w-[480px] flex flex-col bg-zinc-950 border-l border-white/5 lg:overflow-y-auto p-8 space-y-6">\n' +
    right + '\n' +
    '                </div>\n' +
    '            </div>\n' +
    '\n' +
    modal + '\n' +
    ticket + '\n' +
    '        <style jsx>{\` .no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; } \`}</style>\n' +
    '        </>\n' +
    '    );\n' +
    '};\n';

fs.writeFileSync('components/superadmin/POSManager.tsx', final);
console.log('RECONSTRUCTION COMPLETE V2');
