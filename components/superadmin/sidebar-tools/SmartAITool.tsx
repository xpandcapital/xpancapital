"use client";

import React, { useState, useEffect } from 'react';
import { History, Sparkles, Lightbulb, Wand2, Lock, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ToolDef } from './types';
import { callAI } from './call-ai';
import { StandardROI, StandardDiscount, StandardMarkup, StandardLoan, StandardCommission, StandardTips, StandardUnitPrice } from './StandardFinancial';
import { StandardBreakEven, StandardTax, StandardWaste, StandardFuel } from './StandardLogistics';
import { StandardPassGen, StandardDateDiff, StandardAgeCalc, StandardCheckDigit, StandardNumToLetters, StandardWinner, StandardShuffle, StandardHourCounter, StandardPitchTimer, StandardWALink, StandardQRGen, UniversalManualForm } from './StandardOffice';
import { StandardVideoConverter } from './StandardVideoConverter';
import { StandardPdfConverter } from './StandardPdfConverter';
import { StandardTextAnalyze, StandardCodeTools } from './StandardTextAnalyze';
import { YouTubeBatchDownloader } from './YouTubeBatchDownloader';
import { CurrencyConverter } from './CurrencyConverter';
import { UnitConverter } from './UnitConverter';
import { TaskTimer } from './TaskTimer';
import { IgvTool } from './IgvTool';
import { NoteTool } from './NoteTool';
import { MiniSpreadsheet } from './MiniSpreadsheet';
import { PercentageTool, AverageTool, FractionTool, NumberGenerator } from './MathMiniTools';

const SmartAITool = ({ tool }: { tool: ToolDef }) => {
    const [input, setInput] = useState('');
    const [result, setResult] = useState<string | null>(null);
    const [lastModel, setLastModel] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<'ia' | 'manual'>(tool.isIA !== false ? 'ia' : 'manual');
    const [history, setHistory] = useState<{ id: string, title: string, input: string, result: string, model: string, date: string }[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem(`ai_history_${tool.id}`);
        if (saved) setHistory(JSON.parse(saved));
    }, [tool.id]);

    const saveToHistory = (title: string, inputTxt: string, resTxt: string, modelUsed: string) => {
        const newItem = {
            id: Date.now().toString(),
            title: title.replace(/["'#]/g, '').slice(0, 40),
            input: inputTxt,
            result: resTxt,
            model: modelUsed,
            date: new Date().toLocaleString()
        };
        const updated = [newItem, ...history].slice(0, 20);
        setHistory(updated);
        localStorage.setItem(`ai_history_${tool.id}`, JSON.stringify(updated));
    };

    const handleExecute = async () => {
        if (!input.trim()) return;
        setLoading(true);
        const prompt = `Actúa como un CONSULTOR ESTRATÉGICO DE ÉLITE en ${tool.cat} para Blis Corp. 
        Tu tarea es procesar: "${input}" usando la herramienta "${tool.name}".
        
        ESTILO DE RESPUESTA REQUERIDO:
        1. SÉ EXTREMADAMENTE CONCISO (CRÍTICO): Evita introducciones largas o explicaciones innecesarias. Ve directo al grano. Máximo 2 párrafos de contexto técnico y luego el resultado.
        2. TÍTULO CORTO: Inicia tu respuesta con una línea que diga "TÍTULO: [Resumen de 3-5 palabras]" y luego un salto de línea doble.
        3. ESTRUCTURA VISUAL: Usa bloques Quote (>) para notas de riesgo o estrategia.
        4. TABLAS: Usa tablas solo si hay 3 o más datos comparativos. Si es uno solo, usa un bloque de código 'info'.
        5. RESALTADO: Usa MAYÚSCULAS para conceptos vitales y negrita para montos (**S/ 00.00**).
        6. IDENTIFICACIÓN: Indica claramente qué IA respondió (Gemini o GPT).
        7. INSIGHTS: Finaliza con la sección "⚡ PERSPECTIVA BLIS CORP" con 3 puntos de acción inmediata.

        IMPORTANTE: La legibilidad debe ser absoluta. Usa saltos de línea dobles entre secciones.`;

        const res = await callAI(prompt);

        let finalizedText = res.text;
        if (res.modelUsed.toLowerCase().includes('gpt')) {
            finalizedText = finalizedText.replace(/GOOGLE GEMINI 1\.5/gi, 'OPENAI GPT-4o');
            finalizedText = finalizedText.replace(/GEMINI 1\.5/gi, 'GPT-4o');
        } else {
            finalizedText = finalizedText.replace(/OPENAI GPT-4o/gi, 'GOOGLE GEMINI 1.5');
            finalizedText = finalizedText.replace(/GPT-4o/gi, 'GEMINI 1.5');
        }

        setResult(finalizedText);
        setLastModel(res.modelUsed);

        const titleMatch = finalizedText.match(/TÍTULO:\s*(.*)/i);
        const displayTitle = titleMatch ? titleMatch[1] : input.slice(0, 30) + '...';

        saveToHistory(displayTitle, input, finalizedText, res.modelUsed);
        setLoading(false);
    };

    const loadFromHistory = (item: any) => {
        setInput(item.input);
        setResult(item.result);
        setLastModel(item.model);
    };

    const isOfflineError = result?.startsWith('ERROR_OFFLINE:');

    return (
        <div className={`p-[2px] rounded-xl transition-all duration-700 ${mode === 'ia' ? 'bg-gradient-to-br from-purple-500/40 via-cyan-500/40 to-blis-red/40 shadow-[0_0_80px_rgba(168,85,247,0.2)]' : 'bg-white/10'} w-full max-w-6xl mx-auto`}>
            <div className={`bg-zinc-950 rounded-xl border w-full h-[800px] shadow-2xl flex relative transition-colors duration-500 overflow-hidden ${mode === 'ia' ? 'border-purple-500/30' : 'border-white/5'}`}>

                {mode === 'ia' && history.length > 0 && (
                    <div className="w-64 border-r border-white/5 bg-black/40 flex flex-col shrink-0 animate-in slide-in-from-left duration-500">
                        <div className="p-6 border-b border-white/5">
                            <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                <History className="w-3 h-3 text-purple-500" />
                                Historial Reciente
                            </h4>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                            {history.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => loadFromHistory(item)}
                                    className="w-full text-left p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-purple-500/30 hover:bg-white/[0.05] transition-all group"
                                >
                                    <div className="text-[9px] font-black text-white/90 uppercase leading-tight group-hover:text-purple-400 transition-colors line-clamp-2">{item.title}</div>
                                    <div className="text-[7px] text-zinc-600 mt-2 font-bold uppercase tracking-tighter">{item.date}</div>
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => { setHistory([]); localStorage.removeItem(`ai_history_${tool.id}`); }}
                            className="p-4 text-[7px] font-black text-zinc-700 uppercase hover:text-rose-500 transition-colors border-t border-white/5"
                        >
                            Limpiar Historial
                        </button>
                    </div>
                )}

                <div className="flex-1 p-12 space-y-10 relative overflow-y-auto custom-scrollbar min-w-0 h-full">

                    {mode === 'ia' && (
                        <div className="absolute inset-0 pointer-events-none overflow-visible">
                            <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] bg-purple-600/20 blur-[100px] rounded-full animate-pulse" />
                            <div className="absolute bottom-[-20%] left-[-20%] w-[60%] h-[60%] bg-cyan-600/20 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                        </div>
                    )}

                    <div className="absolute top-8 right-10 flex bg-black/60 p-1 rounded-xl border border-white/10 z-10 backdrop-blur-md">
                        <button
                            onClick={() => setMode('ia')}
                            className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all flex items-center gap-2 ${mode === 'ia' ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-400'}`}
                        >
                            {mode === 'ia' && <Sparkles className="w-2.5 h-2.5" />}
                            Motor IA
                        </button>
                        <button
                            onClick={() => setMode('manual')}
                            className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${mode === 'manual' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-400'}`}
                        >
                            Modo Manual
                        </button>
                    </div>

                    <div className="flex items-center gap-5 border-b border-white/5 pb-8 pr-32 relative">
                        <div className={`p-4 rounded-2xl transition-all duration-500 ${mode === 'ia' ? 'bg-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.2)]' : 'bg-blis-red/10'}`}>
                            <tool.icon className={`w-8 h-8 transition-colors ${mode === 'ia' ? 'text-purple-400' : 'text-blis-red'}`} />
                        </div>
                        <div>
                            <h3 className={`text-2xl font-black uppercase italic tracking-tighter leading-none transition-colors ${mode === 'ia' ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-cyan-200' : 'text-white'}`}>{tool.name}</h3>
                            <p className="text-zinc-500 text-[11px] uppercase font-black tracking-[0.2em] mt-2">{tool.description}</p>
                        </div>
                    </div>

                    <div className="space-y-6 relative">
                        {mode === 'manual' ? (
                            <div className="animate-in fade-in zoom-in-95 duration-300">
                                {tool.id === 'roi' ? <StandardROI /> :
                                    tool.id === 'tax' ? <StandardTax /> :
                                        tool.id === 'loan' ? <StandardLoan /> :
                                            tool.id === 'commission' ? <StandardCommission /> :
                                                tool.id === 'fuel' ? <StandardFuel /> :
                                                    tool.id === 'tips' ? <StandardTips /> :
                                                        tool.id === 'unitprice' ? <StandardUnitPrice /> :
                                                            tool.id === 'date_diff' ? <StandardDateDiff /> :
                                                                tool.id === 'age_calc' ? <StandardAgeCalc /> :
                                                                    tool.id === 'pass_gen' ? <StandardPassGen /> :
                                                                        tool.id === 'num_to_letters' ? <StandardNumToLetters /> :
                                                                            tool.id === 'breakeven' ? <StandardBreakEven /> :
                                                                                tool.id === 'waste' ? <StandardWaste /> :
                                                                                    tool.id === 'hour_counter' ? <StandardHourCounter /> :
                                                                                        tool.id === 'pitch_timer' ? <StandardPitchTimer /> :
                                                                                            tool.id === 'wa_link' ? <StandardWALink /> :
                                                                                                tool.id === 'qr_gen' ? <StandardQRGen /> :
                                                                                                    tool.id === 'check_digit' ? <StandardCheckDigit /> :
                                                                                                        tool.id === 'winner_gen' ? <StandardWinner /> :
                                                                                                            tool.id === 'shuffle' ? <StandardShuffle /> :
                                                                                                                tool.id === 'video_converter' ? <StandardVideoConverter /> :
                                                                                                                    tool.id === 'pdf_converter' ? <StandardPdfConverter /> :
                                                                                                                    tool.id === 'youtube_batch' ? <YouTubeBatchDownloader /> :
                                                                                                                    tool.id === 'margin' || tool.id === 'markup' || tool.id === 'sku_profit' ? <StandardMarkup /> :
                                                                                                                    tool.id === 'percentage' ? <PercentageTool /> :
                                                                                                                        tool.id === 'average' ? <AverageTool /> :
                                                                                                                            tool.id === 'fraction' ? <FractionTool /> :
                                                                                                                                tool.id === 'measurements' ? <UnitConverter /> :
                                                                                                                                    tool.id === 'currency_converter' ? <CurrencyConverter /> :
                                                                                                                                        tool.id === 'task_timer' ? <TaskTimer /> :
                                                                                                                                            tool.id === 'igv_calc' ? <IgvTool /> :
                                                                                                                                                tool.id === 'note_tool' ? <NoteTool /> :
                                                                                                                                                    tool.id === 'spreadsheet' ? <MiniSpreadsheet /> :
                                                                                                                                                        (tool.id === 'discount' || tool.id === 'tiered_discount' || tool.id === 'volume_discount') ? <StandardDiscount /> :
                                                                                                                                                            (['diff', 'read_time', 'user_gen', 'emoji_search', 'word_counter', 'char_counter'].includes(tool.id)) ? <StandardTextAnalyze tool={tool} /> :
                                                                                                                                                                (['json_fmt', 'xml_fmt', 'url_encode', 'base64_encode'].includes(tool.id)) ? <StandardCodeTools tool={tool} /> :
                                                                                                                                                                    <UniversalManualForm tool={tool} />}
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {tool.help && (
                                    <div className="p-5 bg-white/[0.02] border border-white/5 rounded-xl space-y-4 relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="flex items-center gap-2 text-[10px] font-black text-zinc-600 uppercase tracking-widest relative">
                                            <Lightbulb className="w-3.5 h-3.5 text-purple-500" />
                                            Guía de Uso Inteligente
                                        </div>
                                        <p className="text-zinc-400 text-[11px] font-medium leading-relaxed italic relative">{tool.help}</p>

                                        {tool.examples && (
                                            <div className="grid grid-cols-1 gap-3 pt-2 relative">
                                                <button
                                                    onClick={() => setInput(tool.examples?.simple || '')}
                                                    className="w-full text-left p-3 rounded-xl bg-black/40 border border-white/5 hover:border-cyan-500/30 transition-all group/btn"
                                                >
                                                    <div className="text-[7px] font-black text-cyan-500 uppercase mb-1">Ejemplo Básico</div>
                                                    <div className="text-[10px] text-zinc-500 group-hover/btn:text-zinc-300 leading-tight">{tool.examples.simple}</div>
                                                </button>
                                                <button
                                                    onClick={() => setInput(tool.examples?.advanced || '')}
                                                    className="w-full text-left p-3 rounded-xl bg-black/40 border border-white/5 hover:border-purple-500/30 transition-all group/btn"
                                                >
                                                    <div className="text-[7px] font-black text-purple-500 uppercase mb-1 flex items-center gap-1">
                                                        <Sparkles className="w-2 h-2" />
                                                        Ejemplo Avanzado (IA Full)
                                                    </div>
                                                    <div className="text-[10px] text-zinc-500 group-hover/btn:text-zinc-300 leading-tight">{tool.examples.advanced}</div>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-[1.6rem] blur opacity-10 group-focus-within:opacity-30 transition duration-500" />
                                    <textarea
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder={`Describe tu requerimiento mágico para ${tool.name}...`}
                                        className="w-full bg-black/50 border border-white/5 rounded-xl p-6 text-sm text-white placeholder:text-zinc-800 outline-none focus:border-purple-500/20 transition-all min-h-[140px] resize-none font-medium relative"
                                    />
                                    <div className="absolute right-6 bottom-6 flex gap-2">
                                        <Sparkles className="w-5 h-5 text-purple-500/20 animate-pulse" />
                                    </div>
                                </div>

                                <button
                                    onClick={handleExecute}
                                    disabled={loading}
                                    className="w-full relative group overflow-hidden bg-white text-black font-black uppercase text-[11px] tracking-[0.3em] py-5 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <span className="relative z-10 group-hover:text-white transition-colors flex items-center gap-3">
                                        {loading ? (
                                            <>
                                                <RefreshCcw className="w-4 h-4 animate-spin" />
                                                Invocando Red Neuronal...
                                            </>
                                        ) : (
                                            <>
                                                <Wand2 className="w-5 h-5" />
                                                Generar con Inteligencia Mágica
                                            </>
                                        )}
                                    </span>
                                </button>

                                {result && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`p-1 rounded-xl ${isOfflineError ? 'bg-rose-500/20' : 'bg-gradient-to-r from-purple-500/30 to-cyan-500/30 shadow-[0_20px_50px_rgba(168,85,247,0.1)]'}`}
                                    >
                                        <div className={`p-8 border rounded-xl space-y-4 relative overflow-hidden ${isOfflineError ? 'bg-zinc-950 border-rose-500/20' : 'bg-zinc-950 border-white/10'}`}>
                                            <div className="absolute top-0 right-0 p-4">
                                                <div className={`w-2 h-2 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)] ${isOfflineError ? 'bg-rose-500' : 'bg-purple-500'}`} />
                                            </div>
                                            <div className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] ${isOfflineError ? 'text-rose-500' : 'text-cyan-400'}`}>
                                                {isOfflineError ? <Lock className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                                                {isOfflineError ? 'Fallo de Conexión (Modo Offline recomendado)' : 'Análisis Cognitivo Completado'}
                                            </div>
                                            <div className="text-zinc-200 text-base leading-relaxed font-medium">
                                                {isOfflineError ? (
                                                    <div className="space-y-4">
                                                        <p className="text-sm">No se pudo contactar con la IA. Es posible que no tengas conexión a internet.</p>
                                                        <button
                                                            onClick={() => setMode('manual')}
                                                            className="px-6 py-3 bg-zinc-900 text-[9px] font-black uppercase rounded-xl border border-white/5 hover:bg-zinc-800 transition-all text-white"
                                                        >
                                                            Utilizar Versión Manual Offline
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="prose prose-invert prose-p:text-zinc-300 prose-strong:text-white prose-sm max-w-none 
                                                    prose-table:w-full prose-table:border-collapse prose-table:my-8 prose-table:rounded-xl prose-table:overflow-hidden
                                                    prose-th:border prose-th:border-white/20 prose-th:p-4 prose-th:bg-purple-500/10 prose-th:text-cyan-400 prose-th:text-[11px] prose-th:font-black prose-th:uppercase prose-th:tracking-widest prose-th:text-left
                                                    prose-td:border prose-td:border-white/10 prose-td:p-4 prose-td:text-zinc-300 prose-td:text-[12px] prose-td:bg-black/20
                                                    prose-blockquote:border-l-4 prose-blockquote:border-purple-500 prose-blockquote:bg-purple-500/5 prose-blockquote:p-6 prose-blockquote:rounded-r-2xl prose-blockquote:italic
                                                    prose-code:bg-cyan-500/10 prose-code:text-cyan-300 prose-code:p-1 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
                                                    prose-pre:bg-zinc-900/50 prose-pre:border prose-pre:border-white/5 prose-pre:rounded-xl prose-pre:p-6">
                                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                            {result || ''}
                                                        </ReactMarkdown>
                                                        <div className="mt-12 pt-6 border-t border-white/5 flex items-center justify-between">
                                                            <div className="flex flex-col">
                                                                <span className="text-[7px] font-black text-zinc-700 uppercase tracking-[0.4em] italic mb-1">Blis Neural Fabric v4.0</span>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                                                    <span className="text-[8px] font-black text-white/40 uppercase tracking-tighter italic">Cálculo Certificado de Alta Precisión</span>
                                                                </div>
                                                            </div>
                                                            <span className="text-[8px] font-black text-cyan-500 uppercase tracking-tighter px-3 py-1 bg-cyan-500/5 rounded-full border border-cyan-500/10">Ref: {lastModel}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export { SmartAITool };