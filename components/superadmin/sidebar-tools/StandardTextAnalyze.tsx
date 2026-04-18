"use client";

import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { ToolDef } from './types';

function StandardTextAnalyze({ tool }: { tool: ToolDef }) {
    const [text, setText] = useState('');
    const chars = text.length;
    const words = text.trim().split(/\s+/).filter(w => w).length;
    return (
        <div className="space-y-6">
            <textarea className="w-full bg-black/40 border border-white/5 p-8 rounded-[2.5rem] text-sm text-white min-h-[220px] outline-none focus:border-blis-red/20 transition-all font-medium" placeholder={`Escribe para ${tool.name}...`} value={text} onChange={e => setText(e.target.value)} />
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-900/60 p-6 rounded-xl border border-white/5 text-center">
                    <div className="text-[8px] font-black text-zinc-600 uppercase mb-1">Caracteres</div>
                    <div className="text-2xl font-black text-white">{chars}</div>
                </div>
                <div className="bg-zinc-900/60 p-6 rounded-xl border border-white/5 text-center">
                    <div className="text-[8px] font-black text-zinc-600 uppercase mb-1">Palabras</div>
                    <div className="text-2xl font-black text-white">{words}</div>
                </div>
            </div>
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-xl text-[10px] text-zinc-500 italic">
                {tool.name}: Modo manual optimizado para edición y conteo local. La IA (Modo IA) es requerida para generación creativa.
            </div>
        </div>
    );
};

function StandardCodeTools({ tool }: { tool: ToolDef }) {
    const [code, setCode] = useState('');
    const fmt = () => {
        try {
            if (tool.id === 'json_fmt') setCode(JSON.stringify(JSON.parse(code), null, 4));
        } catch (e) { }
    };
    return (
        <div className="space-y-6">
            <textarea className="w-full bg-zinc-950 border border-white/10 p-6 rounded-xl text-[11px] text-emerald-500/80 font-mono h-64 resize-none" value={code} onChange={e => setCode(e.target.value)} placeholder={`// Ingresa ${tool.name} aquí...`} />
            <div className="flex gap-4">
                <button onClick={fmt} className="flex-1 py-4 bg-zinc-800 text-white font-black uppercase text-[10px] rounded-xl border border-white/5">Formatear</button>
                <button onClick={() => setCode('')} className="py-4 px-6 bg-rose-500/10 text-rose-500 rounded-xl"><Trash2 className="w-4 h-4" /></button>
            </div>
        </div>
    );
};

export { StandardTextAnalyze, StandardCodeTools };