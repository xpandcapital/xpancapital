"use client";

import { Check, X } from 'lucide-react';
import { useAIConnectivity } from './use-ai-connectivity';

const CompactAIStatus = ({ isCollapsed }: { isCollapsed: boolean }) => {
    const { gemini, gpt, groq, loading, geminiModel, gptModel, groqModel } = useAIConnectivity();
    const isAllSync = gemini && gpt && groq;
    const isPartial = (gemini || gpt || groq) && !isAllSync;

    if (isCollapsed) {
        return (
            <div className="py-4 border-b border-white/5 flex flex-col items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${isAllSync ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : isPartial ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(230,0,50,0.5)]'}`} />
                <div className="space-y-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${gemini ? 'bg-purple-500 shadow-[0_0_5px_rgba(168,85,247,0.4)]' : 'bg-zinc-800'}`} />
                    <div className={`w-1.5 h-1.5 rounded-full ${gpt ? 'bg-cyan-500 shadow-[0_0_5px_rgba(6,182,212,0.4)]' : 'bg-zinc-800'}`} />
                    <div className={`w-1.5 h-1.5 rounded-full ${groq ? 'bg-orange-500 shadow-[0_0_5px_rgba(249,115,22,0.4)]' : 'bg-zinc-800'}`} />
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 border-b border-white/5 bg-black/20">
            <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex flex-col">
                    <span className="text-[7px] font-black text-zinc-600 uppercase tracking-[0.2em]">IA REDUNDANTE</span>
                    <span className="text-[9px] font-black text-white uppercase italic tracking-tighter">Control de Sincronía</span>
                </div>
                <div className={`w-2 h-2 rounded-full animate-pulse ${isAllSync ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : isPartial ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(230,0,50,0.4)]'}`} />
            </div>

            <div className="grid grid-cols-1 gap-1.5">
                <div className="flex items-center gap-2 bg-zinc-900/30 p-1.5 rounded-lg border border-white/5 group hover:border-purple-500/20 transition-all">
                    <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 ${gemini ? 'bg-purple-500/10 text-purple-500' : 'bg-zinc-800 text-zinc-700'}`}>
                        {gemini ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
                    </div>
                    <div className="flex flex-col truncate">
                        <span className="text-[5px] font-black text-zinc-600 uppercase tracking-tighter shrink-0">Google AI</span>
                        <span className={`text-[7px] font-bold uppercase truncate leading-none ${gemini ? 'text-zinc-300' : 'text-zinc-600'}`}>{loading ? 'Detectando...' : geminiModel}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-zinc-900/30 p-1.5 rounded-lg border border-white/5 group hover:border-cyan-500/20 transition-all">
                    <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 ${gpt ? 'bg-cyan-500/10 text-cyan-500' : 'bg-zinc-800 text-zinc-700'}`}>
                        {gpt ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
                    </div>
                    <div className="flex flex-col truncate">
                        <span className="text-[5px] font-black text-zinc-600 uppercase tracking-tighter shrink-0">OpenAI Platform</span>
                        <span className={`text-[7px] font-bold uppercase truncate leading-none ${gpt ? 'text-zinc-300' : 'text-zinc-600'}`}>{loading ? 'Detectando...' : gptModel}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-zinc-900/30 p-1.5 rounded-lg border border-white/5 group hover:border-orange-500/20 transition-all">
                    <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 ${groq ? 'bg-orange-500/10 text-orange-500' : 'bg-zinc-800 text-zinc-700'}`}>
                        {groq ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
                    </div>
                    <div className="flex flex-col truncate">
                        <span className="text-[5px] font-black text-zinc-600 uppercase tracking-tighter shrink-0">Groq Fast Cloud</span>
                        <span className={`text-[7px] font-bold uppercase truncate leading-none ${groq ? 'text-zinc-300' : 'text-zinc-600'}`}>{loading ? 'Detectando...' : groqModel}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export { CompactAIStatus };