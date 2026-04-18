"use client";

import React, { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';

function NoteTool() {
    const [note, setNote] = useState('');
    const [phone, setPhone] = useState('');
    const [prefix, setPrefix] = useState('51');

    const countries = [
        { code: '51', flag: 'pe', name: 'Perú' },
        { code: '593', flag: 'ec', name: 'Ecuador' },
        { code: '57', flag: 'co', name: 'Colombia' },
        { code: '56', flag: 'cl', name: 'Chile' },
        { code: '1', flag: 'us', name: 'USA/Int' }
    ];

    const sendWa = () => {
        if (!note || !phone) return;
        const cleanPhone = phone.replace(/\D/g, '');
        window.open(`https://wa.me/${prefix}${cleanPhone}?text=${encodeURIComponent(note)}`, '_blank');
    };

    return (
        <div className="space-y-6 p-8 bg-zinc-900/30 rounded-xl border border-white/5 max-w-2xl mx-auto shadow-2xl">
            <div className="flex items-center justify-between mb-2">
                <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Centro de Comunicaciones Express</h4>
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <MessageSquare className="w-5 h-5 text-emerald-500" />
                </div>
            </div>
            <textarea
                className="w-full bg-black/60 border border-white/5 p-8 rounded-[2rem] text-[15px] font-bold text-white outline-none resize-none h-48 focus:border-emerald-500/30 transition-all placeholder:text-zinc-900 shadow-inner"
                placeholder="Escribe el mensaje que deseas enviar al cliente vía WhatsApp..."
                value={note}
                onChange={e => setNote(e.target.value)}
            />
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-[0.4] relative group">
                    <select
                        value={prefix}
                        onChange={(e) => setPrefix(e.target.value)}
                        className="w-full h-full bg-black/60 border border-white/5 p-6 pl-14 rounded-[2rem] text-sm font-black text-white outline-none appearance-none cursor-pointer focus:border-emerald-500/30 transition-all"
                    >
                        {countries.map(c => (
                            <option key={c.code} value={c.code} className="bg-zinc-900">+{c.code} ({c.name})</option>
                        ))}
                    </select>
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none">
                        <img
                            src={`https://flagcdn.com/w20/${countries.find(c => c.code === prefix)?.flag}.png`}
                            className="w-5 h-3.5 rounded-sm"
                            alt="flag"
                        />
                    </div>
                </div>
                <div className="flex-1 relative">
                    <input
                        placeholder="Nº de Celular (Ej: 987654321)"
                        className="w-full bg-black/60 border border-white/5 p-6 rounded-[2rem] text-sm font-black text-white outline-none focus:border-emerald-500/30 transition-all placeholder:text-zinc-900"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                    />
                </div>
                <button
                    onClick={sendWa}
                    className="px-10 py-6 bg-emerald-500 text-zinc-950 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] hover:scale-[1.03] active:scale-95 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3"
                >
                    ENVIAR <Send className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export { NoteTool };