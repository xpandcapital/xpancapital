"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Bot } from 'lucide-react';
import { callAI } from './call-ai';

const StandardCalculator = ({ className = "" }: { className?: string }) => {
    const [input, setInput] = useState('0');
    const [liveResult, setLiveResult] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const safeEval = (expr: string) => {
        try {
            const clean = expr.replace(/[+\-*/]$/, '').replace(/[^0-9. +\-*/()]/g, '');
            if (!clean) return null;
            // eslint-disable-next-line no-eval
            const res = eval(clean);
            return isFinite(res) ? String(Number(res.toFixed(8))) : null;
        } catch { return null; }
    };

    const handleInput = (val: string) => {
        setInput(prev => {
            let next = prev;
            if (val === 'C') return '0';
            if (val === 'DEL') return prev.length > 1 ? prev.slice(0, -1) : '0';
            if (val === '=') {
                const res = safeEval(prev);
                return res || prev;
            }
            if (prev === '0' && !['+', '-', '*', '/', '.'].includes(val)) next = val;
            else next = prev + val;

            return next;
        });
    };

    useEffect(() => {
        const res = safeEval(input);
        setLiveResult((res !== input && /[+\-*/]/.test(input)) ? res : null);
    }, [input]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

            const key = e.key;
            if (/[0-9]/.test(key)) handleInput(key);
            else if (['+', '-', '*', '/', '.', '(', ')'].includes(key)) handleInput(key);
            else if (key === 'Enter' || key === '=') handleInput('=');
            else if (key === 'Backspace') handleInput('DEL');
            else if (key === 'Escape' || key === 'c' || key === 'C') handleInput('C');
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const buttons = [
        ['(', ')', 'C', '/'],
        ['7', '8', '9', '*'],
        ['4', '5', '6', '-'],
        ['1', '2', '3', '+'],
        ['0', '.', 'DEL', '=']
    ];

    return (
        <div
            ref={containerRef}
            tabIndex={0}
            className={`p-4 bg-zinc-900 border border-white/5 rounded-xl shadow-2xl focus:ring-1 focus:ring-blis-red/20 outline-none w-[350px] h-[380px] ${className} flex flex-col justify-between overflow-hidden`}
        >
            <div className="bg-black/40 p-4 rounded-[1.5rem] text-right border border-white/5 shadow-inner flex flex-col justify-end h-[85px] group shrink-0 relative overflow-hidden">
                <div className="absolute top-2 left-4 flex items-center gap-2">
                    <span className="text-[7px] font-black text-zinc-700 uppercase tracking-widest">Consola</span>
                    <button
                        onClick={async () => {
                            const res = await callAI(`Analiza este cálculo: ${input}. Dame un insight de negocio de una línea.`);
                            alert(res);
                        }}
                        className="p-1.5 bg-white/5 rounded-lg hover:bg-blis-red/20 transition-all group/ia"
                    >
                        <Bot className="w-2.5 h-2.5 text-zinc-500 group-hover/ia:text-blis-red" />
                    </button>
                </div>
                <div className="text-white text-5xl font-black tracking-tighter break-all leading-none">{input}</div>
                {liveResult && (
                    <div className="text-emerald-500/40 text-base font-bold mt-1 animate-pulse tracking-tight">= {liveResult}</div>
                )}
            </div>

            <div className="grid grid-cols-4 gap-2.5 mt-2 flex-1 pt-1">
                {buttons.flat().map(btn => (
                    <button
                        key={btn}
                        onClick={() => handleInput(btn)}
                        className={`h-[42px] rounded-2xl flex items-center justify-center font-black text-xl active:scale-95 transition-all shadow-sm
                            ${btn === '=' ? 'bg-blis-red text-white' :
                                btn === 'C' ? 'bg-rose-500/10 text-rose-500' :
                                    ['+', '-', '*', '/', '(', ')'].includes(btn) ? 'bg-zinc-800 text-zinc-400' :
                                        'bg-zinc-950 text-white hover:bg-zinc-800'}
                        `}
                    >
                        {btn}
                    </button>
                ))}
            </div>

            <div className="py-2 text-center shrink-0">
                <span className="text-[9px] font-black text-zinc-800 uppercase tracking-[0.6em]">Integrated Compute System</span>
            </div>
        </div>
    );
};

export { StandardCalculator };