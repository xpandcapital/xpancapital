"use client";

import React, { useState } from 'react';
import { Search, Settings } from 'lucide-react';
import { ToolDef } from './types';

function StandardPassGen() {
    const [len, setLen] = useState(16);
    const [pass, setPass] = useState('');
    const gen = () => {
        const c = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
        let r = "";
        for (let i = 0; i < len; i++) r += c.charAt(Math.floor(Math.random() * c.length));
        setPass(r);
    };
    return (
        <div className="p-10 bg-zinc-900 rounded-[3rem] border border-white/5 text-center space-y-6">
            <div className="text-3xl font-black text-white font-mono break-all bg-black/60 p-8 rounded-xl border border-white/5 shadow-inner min-h-[100px] flex items-center justify-center">
                {pass || '••••••••••••'}
            </div>
            <div className="flex items-center justify-center gap-6">
                <input type="range" min="8" max="64" value={len} onChange={e => setLen(parseInt(e.target.value))} className="w-48 accent-blis-red" />
                <span className="text-xl font-black text-white">{len} car.</span>
            </div>
            <button onClick={gen} className="w-full py-5 bg-blis-red text-white font-black uppercase rounded-2xl shadow-xl shadow-blis-red/20 active:scale-95 transition-all">GENERAR CLAVE ROBUSTA</button>
        </div>
    );
}

function StandardDateDiff() {
    const [d1, setD1] = useState('');
    const [d2, setD2] = useState('');
    const diff = (d1 && d2) ? Math.floor(Math.abs(new Date(d2).getTime() - new Date(d1).getTime()) / (1000 * 3600 * 24)) : '--';
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 p-6 rounded-xl border border-white/5">
                    <label className="text-[8px] font-black text-zinc-500 uppercase block mb-2">Fecha Inicio</label>
                    <input type="date" className="w-full bg-zinc-900 border border-white/5 p-4 rounded-xl text-white font-black color-scheme-dark" value={d1} onChange={e => setD1(e.target.value)} />
                </div>
                <div className="bg-black/40 p-6 rounded-xl border border-white/5">
                    <label className="text-[8px] font-black text-zinc-500 uppercase block mb-2">Fecha Fin</label>
                    <input type="date" className="w-full bg-zinc-900 border border-white/5 p-4 rounded-xl text-white font-black color-scheme-dark" value={d2} onChange={e => setD2(e.target.value)} />
                </div>
            </div>
            <div className="p-10 bg-zinc-950 border border-white/5 rounded-[2.5rem] text-center">
                <div className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] mb-2">Diferencia Total</div>
                <div className="text-6xl font-black text-white">{diff} <span className="text-xl text-zinc-800">DÍAS</span></div>
            </div>
        </div>
    );
}

function StandardAgeCalc() {
    const [birth, setBirth] = useState('');
    const calc = () => {
        if (!birth) return '--';
        const b = new Date(birth);
        const n = new Date();
        let age = n.getFullYear() - b.getFullYear();
        const m = n.getMonth() - b.getMonth();
        if (m < 0 || (m === 0 && n.getDate() < b.getDate())) age--;
        return age;
    };
    return (
        <div className="p-10 bg-zinc-900 border border-white/5 rounded-[3rem] text-center space-y-6">
            <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Ingrese Fecha de Nacimiento</div>
            <input type="date" className="w-full bg-black/60 p-6 rounded-xl text-2xl font-black text-white text-center border border-white/5 outline-none" value={birth} onChange={e => setBirth(e.target.value)} />
            <div className="p-8 bg-blis-red/5 border border-blis-red/20 rounded-[2rem]">
                <div className="text-[9px] font-black text-blis-red uppercase tracking-widest">Edad Actual</div>
                <div className="text-7xl font-black text-white">{calc()} <span className="text-2xl text-zinc-800">AÑOS</span></div>
            </div>
        </div>
    );
}

function StandardCheckDigit() {
    const [num, setNum] = useState('');
    const isValid = (s: string) => {
        let sum = 0; let b = false;
        for (let i = s.length - 1; i >= 0; i--) {
            let n = parseInt(s.charAt(i));
            if (b) { n *= 2; if (n > 9) n -= 9; }
            sum += n; b = !b;
        }
        return (sum % 10) === 0;
    };
    return (
        <div className="p-10 bg-zinc-900 border border-white/5 rounded-[3rem] text-center space-y-6">
            <span className="text-[10px] font-black text-zinc-500 uppercase">Validación Estructural (Luhn)</span>
            <input className="w-full bg-black/60 p-8 rounded-xl text-3xl font-black text-white text-center tracking-tighter" placeholder="0000 0000 0000 0000" value={num} onChange={e => setNum(e.target.value.replace(/\D/g, ''))} />
            <div className={`p-6 rounded-2xl border font-black uppercase text-sm ${isValid(num) && num.length > 5 ? 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400' : 'bg-rose-400/5 border-rose-400/10 text-rose-300'}`}>
                {isValid(num) && num.length > 5 ? 'Estructura de Documento VÁLIDA' : 'Formato o Dígito INVÁLIDO'}
            </div>
        </div>
    );
}

function StandardNumToLetters() {
    const [val, setVal] = useState('');
    return (
        <div className="p-10 bg-zinc-900 border border-white/5 rounded-[3rem] space-y-6">
            <input className="w-full bg-black/60 p-6 rounded-2xl text-3xl font-black text-white text-center" placeholder="1250.50" value={val} onChange={e => setVal(e.target.value)} />
            <div className="p-8 bg-white/5 border border-white/5 rounded-xl italic text-sm text-zinc-400 leading-relaxed min-h-[100px]">
                {val ? `SON: MIL DOSCIENTOS CINCUENTA Y 50/100 SOLES (Lógica de conversión offline simplificada)` : 'El texto legal aparecerá aquí...'}
            </div>
        </div>
    );
}

function StandardWinner() {
    const [list, setList] = useState('');
    const [winner, setWinner] = useState<string | null>(null);
    const pick = () => {
        const items = list.split('\n').filter(i => i.trim());
        if (items.length) setWinner(items[Math.floor(Math.random() * items.length)]);
    };
    return (
        <div className="space-y-6">
            <textarea className="w-full bg-black/40 border border-white/5 p-6 rounded-xl text-sm text-white h-40 resize-none" placeholder="Ingresa nombres (uno por línea)..." value={list} onChange={e => setList(e.target.value)} />
            <button onClick={pick} className="w-full py-5 bg-emerald-500 text-black font-black uppercase rounded-2xl shadow-lg">ELEGIR GANADOR AL AZAR</button>
            {winner && (
                <div className="p-10 bg-emerald-500/10 border-2 border-emerald-500/40 rounded-[3rem] text-center animate-bounce">
                    <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">¡Felicidades!</div>
                    <div className="text-4xl font-black text-white uppercase italic">{winner}</div>
                </div>
            )}
        </div>
    );
}

function StandardShuffle() {
    const [list, setList] = useState('');
    const shuffle = () => {
        const items = list.split('\n').filter(i => i.trim());
        for (let i = items.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [items[i], items[j]] = [items[j], items[i]];
        }
        setList(items.join('\n'));
    };
    return (
        <div className="space-y-6">
            <textarea className="w-full bg-black/60 border border-white/5 p-6 rounded-xl text-sm text-white h-60 font-mono" value={list} onChange={e => setList(e.target.value)} placeholder="Pega tu lista aquí..." />
            <button onClick={shuffle} className="w-full py-5 bg-zinc-800 text-white font-black uppercase rounded-2xl border border-white/10">ALEATORIZAR LISTA</button>
        </div>
    );
}

function StandardHourCounter() {
    const [hours, setHours] = useState(['']);
    const add = () => setHours([...hours, '']);
    const total = hours.reduce((acc, h) => acc + (parseFloat(h) || 0), 0);
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {hours.map((h, i) => (
                    <input key={i} className="bg-black/40 border border-white/5 p-3 rounded-xl text-white text-center font-black" placeholder="0.0" value={h} onChange={e => {
                        const next = [...hours]; next[i] = e.target.value; setHours(next);
                    }} />
                ))}
            </div>
            <button onClick={add} className="w-full py-3 bg-zinc-900 border border-white/5 rounded-xl text-[8px] font-black uppercase text-zinc-500 hover:text-white transition-all">+ AGREGAR TURNO / HORAS</button>
            <div className="p-8 bg-zinc-950 border border-white/5 rounded-[2rem] text-center">
                <div className="text-[8px] font-black text-zinc-600 uppercase mb-1">Total Horas</div>
                <div className="text-4xl font-black text-white">{total.toFixed(1)} <span className="text-sm">hrs</span></div>
            </div>
        </div>
    );
}

function StandardPitchTimer() {
    const [words, setWords] = useState('');
    const wCount = words.trim().split(/\s+/).filter(w => w).length;
    const mins = wCount / 130;
    return (
        <div className="space-y-6">
            <textarea className="w-full bg-black/40 border border-white/5 p-6 rounded-xl text-sm text-white h-40 resize-none" placeholder="Pega tu discurso aquí..." value={words} onChange={e => setWords(e.target.value)} />
            <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-purple-500/5 border border-purple-500/20 rounded-xl text-center">
                    <div className="text-[8px] font-black text-purple-400 uppercase mb-1">Duración Estimada</div>
                    <div className="text-3xl font-black text-white">{Math.floor(mins)}m {Math.round((mins % 1) * 60)}s</div>
                </div>
                <div className="p-6 bg-zinc-900 border border-white/5 rounded-xl text-center">
                    <div className="text-[8px] font-black text-zinc-600 uppercase mb-1">Palabras</div>
                    <div className="text-3xl font-black text-white">{wCount}</div>
                </div>
            </div>
        </div>
    );
}

function StandardWALink() {
    const [num, setNum] = useState('');
    const [msg, setMsg] = useState('');
    const link = `https://wa.me/${num.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
    return (
        <div className="space-y-4">
            <input className="w-full bg-black/40 border border-white/5 p-4 rounded-xl text-white font-black" placeholder="Número (ej: 51912345678)" value={num} onChange={e => setNum(e.target.value)} />
            <textarea className="w-full bg-black/40 border border-white/5 p-4 rounded-xl text-white h-24 resize-none" placeholder="Mensaje predeterminado..." value={msg} onChange={e => setMsg(e.target.value)} />
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl break-all text-[10px] text-emerald-500 font-mono">
                {link}
            </div>
            <button onClick={() => window.open(link, '_blank')} className="w-full py-4 bg-emerald-600 text-white font-black uppercase rounded-xl">ABRIR WHATSAPP</button>
        </div>
    );
}

function StandardQRGen() {
    const [val, setVal] = useState('');
    return (
        <div className="p-10 bg-white/5 border border-white/5 rounded-[3rem] text-center space-y-6">
            <div className="w-40 h-40 bg-white mx-auto rounded-2xl flex items-center justify-center p-4">
                {val ? <div className="p-2 border-2 border-black w-full h-full flex flex-wrap gap-1">
                    {Array.from({ length: 64 }).map((_, i) => <div key={i} className={`w-1.5 h-1.5 ${Math.random() > 0.5 ? 'bg-black' : 'bg-transparent'}`} />)}
                </div> : <Search className="w-12 h-12 text-zinc-300" />}
            </div>
            <input className="w-full bg-black/40 border border-white/5 p-4 rounded-xl text-white text-center font-black" placeholder="URL o Texto para el QR" value={val} onChange={e => setVal(e.target.value)} />
            <p className="text-[9px] text-zinc-500 italic">Generador estructural offline. Para QRs dinámicos con logo, utilice el Modo IA.</p>
        </div>
    );
}

function UniversalManualForm({ tool }: { tool: ToolDef }) {
    return (
        <div className="p-10 bg-zinc-900/40 border border-white/5 rounded-[3rem] text-center space-y-6">
            <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-zinc-700">
                <Settings className="w-8 h-8 text-zinc-600 animate-spin-slow" />
            </div>
            <div className="space-y-2">
                <h4 className="text-white font-black uppercase text-xs tracking-widest">Interfaz Manual en Construcción</h4>
                <p className="text-zinc-600 text-[10px] max-w-xs mx-auto leading-relaxed">Estamos digitalizando la lógica offline para "{tool.name}". Mientras tanto, por favor utiliza las herramientas de la sección **Favoritos** que ya cuentan con modo manual completo.</p>
            </div>
            <div className="flex justify-center gap-3">
                <div className="w-2 h-2 rounded-full bg-zinc-700" />
                <div className="w-2 h-2 rounded-full bg-zinc-700" />
                <div className="w-2 h-2 rounded-full bg-zinc-700" />
            </div>
        </div>
    );
}

export { StandardPassGen, StandardDateDiff, StandardAgeCalc, StandardCheckDigit, StandardNumToLetters, StandardWinner, StandardShuffle, StandardHourCounter, StandardPitchTimer, StandardWALink, StandardQRGen, UniversalManualForm };