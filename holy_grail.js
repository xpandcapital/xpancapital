const fs = require('fs');
let code = fs.readFileSync('components/superadmin/POSManager.tsx', 'utf8');
const lines = code.split('\n');

const header = lines.slice(0, 435).join('\n');
const left = lines.slice(437, 675).join('\n');
const right = lines.slice(676, 1327).join('\n');
const modal = lines.slice(1330, 1536).join('\n');
const ticket = lines.slice(1537).filter(l => !l.includes('</>')).join('\n');

const final = \`\${header}
        <>
            <div className="flex flex-col lg:flex-row h-screen lg:h-[calc(100vh-80px)] bg-black overflow-hidden">
                {/* COL 1: TERMINAL */}
                <div className="flex-1 flex flex-col border-r border-white/5 overflow-hidden">
                    \${left}
                </div>

                {/* COL 2: SIDEBAR */}
                <div className="w-full lg:w-[480px] flex flex-col bg-zinc-950 border-white/5 overflow-y-auto">
                    \${right}
                </div>
            </div>

            \${modal}
            \${ticket}
        </>
    );
};
\`;

fs.writeFileSync('components/superadmin/POSManager.tsx', final);
console.log('RECONSTRUCTION COMPLETE');
