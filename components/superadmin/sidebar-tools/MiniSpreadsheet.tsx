"use client";

import React, { useState } from 'react';
import { Table as TableIcon } from 'lucide-react';

function MiniSpreadsheet() {
    const [data, setData] = useState(Array(10).fill(0).map(() => Array(3).fill('')));
    const [activeCell, setActiveCell] = useState<{ r: number, c: number } | null>(null);

    const updateCell = (r: number, c: number, v: string) => {
        const n = [...data];
        n[r][c] = v;
        setData(n);
    };

    const handleCellClick = (r: number, c: number) => {
        if (activeCell && data[activeCell.r][activeCell.c].startsWith('=') && (activeCell.r !== r || activeCell.c !== c)) {
            const cellRef = `${String.fromCharCode(65 + c)}${r + 1}`;
            const currentVal = data[activeCell.r][activeCell.c];
            updateCell(activeCell.r, activeCell.c, currentVal + cellRef);
            return;
        }
        setActiveCell({ r, c });
    };

    const evaluate = (val: string) => {
        if (typeof val !== 'string' || !val.startsWith('=')) return val;
        try {
            let f = val.substring(1).toUpperCase();
            f = f.replace(/([A-C])([1-9]|10)/g, (m, c, r) => {
                const cellVal = data[parseInt(r) - 1][c.charCodeAt(0) - 65];
                return cellVal && !cellVal.startsWith('=') ? (parseFloat(cellVal) || 0).toString() : '0';
            });
            // eslint-disable-next-line no-eval
            const result = eval(f);
            return isFinite(result) ? result.toString() : "ERR";
        } catch { return "ERR"; }
    };

    return (
        <div className="p-6 bg-zinc-900/60 rounded-xl border border-white/5 space-y-4 max-w-5xl mx-auto shadow-2xl backdrop-blur-md overflow-hidden">
            <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <TableIcon className="w-4 h-4 text-emerald-500" />
                    </div>
                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Blis Sheets v2.0</h4>
                </div>
                <button
                    onClick={() => { setData(Array(10).fill(0).map(() => Array(3).fill(''))); setActiveCell(null); }}
                    className="text-[8px] font-black text-zinc-600 hover:text-rose-500 transition-colors uppercase tracking-[0.2em]"
                >
                    Limpiar Todo
                </button>
            </div>

            <div className="flex items-center gap-2 bg-black/40 border border-white/5 p-2 rounded-xl">
                <div className="px-3 py-1 bg-zinc-800 rounded-lg text-[10px] font-black text-zinc-500 border border-white/5 min-w-[50px] text-center">
                    {activeCell ? `${String.fromCharCode(65 + activeCell.c)}${activeCell.r + 1}` : '--'}
                </div>
                <div className="text-zinc-700 font-bold text-sm italic">ƒx</div>
                <input
                    className="flex-1 bg-transparent text-sm font-medium text-white outline-none placeholder:text-zinc-800"
                    placeholder="Ingrese valor o formula (=A1+B1)"
                    value={activeCell ? data[activeCell.r][activeCell.c] : ''}
                    onChange={e => activeCell && updateCell(activeCell.r, activeCell.c, e.target.value)}
                />
            </div>

            <div className="bg-black/20 rounded-2xl border border-white/5 p-1">
                <div className="grid grid-cols-[40px_1fr_1fr_1fr] gap-[1px] bg-white/5">
                    <div className="bg-zinc-950 p-2 border-b border-white/5"></div>
                    {['A', 'B', 'C'].map(c => (
                        <div key={c} className="bg-zinc-900 p-2 text-center text-[9px] font-black text-zinc-600 uppercase border-b border-white/5">
                            {c}
                        </div>
                    ))}

                    {[...Array(10)].map((_, ri) => (
                        <React.Fragment key={ri}>
                            <div className="bg-zinc-900 p-2 text-center text-[9px] font-black text-zinc-700 flex items-center justify-center border-r border-white/5">
                                {ri + 1}
                            </div>
                            {[0, 1, 2].map(ci => {
                                const isActive = activeCell?.r === ri && activeCell?.c === ci;
                                const rawValue = data[ri][ci];
                                const isFormula = rawValue.startsWith('=');
                                return (
                                    <div key={ci} className="bg-zinc-950 min-h-[40px] relative">
                                        <input
                                            className={`w-full h-full p-2 text-xs text-center border-0 outline-none transition-all
                                                ${isActive ? 'bg-zinc-800 text-white ring-1 ring-emerald-500/50 z-10' : 'bg-transparent text-zinc-400'}
                                                ${isFormula && !isActive ? 'font-bold text-emerald-400' : ''}
                                            `}
                                            value={isActive ? rawValue : evaluate(rawValue)}
                                            onChange={e => updateCell(ri, ci, e.target.value)}
                                            onFocus={() => setActiveCell({ r: ri, c: ci })}
                                            onClick={() => handleCellClick(ri, ci)}
                                            spellCheck={false}
                                        />
                                        {isFormula && !isActive && (
                                            <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-emerald-500 opacity-20" />
                                        )}
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3 px-1 mt-2">
                {['A', 'B', 'C'].map((col, ci) => (
                    <div key={col} className="bg-emerald-500/[0.03] border border-emerald-500/10 p-3 rounded-xl flex justify-between items-center group">
                        <span className="text-[7px] font-black text-emerald-500/40 uppercase tracking-widest">SUMA {col}</span>
                        <span className="text-xs font-black text-white">
                            {evaluate(`=${col}1+${col}2+${col}3+${col}4+${col}5+${col}6+${col}7+${col}8+${col}9+${col}10`)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export { MiniSpreadsheet };