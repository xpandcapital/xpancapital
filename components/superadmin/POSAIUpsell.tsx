"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Plus, Loader2, Lightbulb, PackagePlus, ArrowRight } from 'lucide-react';
import { aiChat } from '@/lib/ai-client';
import { safeJsonParse } from '@/lib/json-parser';

interface Suggestion {
    id?: string;
    title: string;
    reason: string;
    estimated_price?: number;
}

interface POSAIUpsellProps {
    cart: any[];
    catalog: any[];
    onAddProduct: (product: any) => void;
}

export const POSAIUpsell = ({ cart, catalog, onAddProduct }: POSAIUpsellProps) => {
    const [context, setContext] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [suggestions, setSuggestions] = useState<{ catalog_suggestions: Suggestion[], ideal_suggestions: Suggestion[] } | null>(null);

    const getSuggestions = async () => {
        if (cart.length === 0 && !context) return;

        setIsGenerating(true);
        try {
            const catalogInfo = catalog.map((p: any) => `ID:${p.id} | ${p.name} | ${p.category || 'General'} | $${p.price}`).join('\n');
            const cartInfo = cart.map(c => `${c.name} ($${c.price})`).join(', ');
            const prompt = `Eres un asistente de ventas de Blis Corp. Tu tarea es analizar el catálogo REAL y el contexto del cliente para sugerir productos.

${cart.length > 0 ? `CARRITO ACTUAL: ${cartInfo}` : 'CLIENTE NO HA AGREGADO PRODUCTOS AÚN.'}
CONTEXTO DEL CLIENTE (lo que quiere lograr): "${context || 'Sin contexto adicional'}"

CATÁLOGO DISPONIBLE (estos productos existen realmente):
${catalogInfo}

INSTRUCCIONES:
1. Busca en el catálogo productos que le sirvan al cliente según su contexto. Aunque el carrito esté vacío, sugiere productos del catálogo que se relacionen con lo que quiere.
2. Siempre incluye mínimo 3 productos del catálogo en catalog_suggestions.
3. El campo "id" DEBE ser EXACTAMENTE el ID que aparece en el catálogo, cópialo textualmente.
4. En ideal_suggestions sugiere productos que NO están en el catálogo pero serían ideales.

Responde SOLO con este JSON:
{
  "catalog_suggestions": [
    {"id": "ID_EXACTO_DEL_CATALOGO", "title": "nombre del producto", "reason": "por qué le sirve al cliente", "estimated_price": precio_numero}
  ],
  "ideal_suggestions": [
    {"title": "producto ideal no en catálogo", "reason": "por qué sería útil", "estimated_price": precio_estimado}
  ]
}`;

            const result = await aiChat({ model: 'gemini-flash', prompt, systemPrompt: 'Eres un experto en estrategias de ventas y upsell. Responde siempre en JSON válido.', temperature: 0.7, responseMimeType: 'application/json' });
            
            if (result.error) {
                setSuggestions({ catalog_suggestions: [], ideal_suggestions: [], error: result.error } as any);
            } else {
                try {
                    const data = safeJsonParse(result.text);
                    setSuggestions(data);
                } catch {
                    setSuggestions({ catalog_suggestions: [], ideal_suggestions: [], error: 'No se pudieron procesar las sugerencias' } as any);
                }
            }
        } catch (error) {
            console.error("Error getting suggestions:", error);
            setSuggestions({ catalog_suggestions: [], ideal_suggestions: [], error: 'Error de conexión con la IA' } as any);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleQuickAdd = (suggestion: Suggestion) => {
        // Intentar match exacto por ID
        let fullProduct = catalog.find((p: any) => p.id === suggestion.id);
        
        // Si no hay match exacto, intentar por nombre (case-insensitive)
        if (!fullProduct && suggestion.id) {
            fullProduct = catalog.find((p: any) => 
                p.name?.toLowerCase() === suggestion.id!.toLowerCase() ||
                p.name?.toLowerCase().includes(suggestion.id!.toLowerCase())
            );
        }
        
        // Si no hay match, intentar por el título de la sugerencia
        if (!fullProduct && suggestion.title) {
            fullProduct = catalog.find((p: any) => 
                p.name?.toLowerCase() === suggestion.title.toLowerCase() ||
                p.name?.toLowerCase().includes(suggestion.title.toLowerCase()) ||
                suggestion.title.toLowerCase().includes(p.name?.toLowerCase() || '')
            );
        }
        
        if (fullProduct) {
            onAddProduct(fullProduct);
        }
    };

    return (
        <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-6 space-y-6 shadow-2xl relative overflow-hidden group/ai">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[60px] rounded-full pointer-events-none group-hover/ai:bg-purple-500/20 transition-all duration-700" />

            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                        <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Asistente AI Upsell</h3>
                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-tight">Estrategias de venta inteligente</p>
                    </div>
                </div>
                <button
                    onClick={getSuggestions}
                    disabled={isGenerating || (cart.length === 0 && !context)}
                    className="p-2.5 bg-purple-500 text-white rounded-xl shadow-lg shadow-purple-500/20 hover:scale-110 active:scale-95 transition-all disabled:opacity-30 disabled:hover:scale-100"
                >
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                </button>
            </div>

            <div className="space-y-3 relative z-10">
                <div className="text-[9px] text-zinc-500 font-black uppercase tracking-widest ml-1">¿Qué quiere lograr el cliente?</div>
                <textarea
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="Ej: Quiere pintar su cuarto, busca invertir en terrenos, necesita un contrato de alquiler..."
                    className="w-full bg-black/60 border border-white/5 p-4 rounded-2xl text-[10px] font-bold outline-none focus:border-purple-500/30 transition-all resize-none h-20 placeholder:text-zinc-800"
                />
            </div>

            <AnimatePresence mode="wait">
                {isGenerating ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="py-12 flex flex-col items-center justify-center space-y-4"
                    >
                        <div className="w-12 h-12 rounded-full border-t-2 border-purple-500 animate-spin" />
                        <p className="text-[9px] font-black text-purple-500 uppercase tracking-[0.3em] animate-pulse">Analizando catálogo...</p>
                    </motion.div>
                ) : suggestions ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Error Handling */}
                        {(suggestions as any).error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                                <p className="text-[9px] font-black text-red-500 uppercase tracking-widest text-center">Error: {(suggestions as any).error}</p>
                            </div>
                        )}

                        {/* Catalog Suggestions */}
                        {suggestions.catalog_suggestions?.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 px-1">
                                    <PackagePlus className="w-3 h-3 text-emerald-400" />
                                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Disponibles en Catálogo</span>
                                </div>
                                <div className="space-y-2">
                                    {suggestions.catalog_suggestions.map((s, i) => (
                                        <div key={i} className="bg-black/40 border border-white/5 p-3 rounded-2xl group/item hover:border-emerald-500/30 transition-all">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-[10px] font-black text-white uppercase tracking-tighter">{s.title}</span>
                                                <button
                                                    onClick={() => handleQuickAdd(s)}
                                                    className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 hover:bg-emerald-500 hover:text-black transition-all"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <p className="text-[9px] text-zinc-500 font-bold leading-relaxed">{s.reason}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Ideal Suggestions */}
                        {suggestions.ideal_suggestions?.length > 0 && (
                            <div className="space-y-3 pt-2 border-t border-white/5">
                                <div className="flex items-center gap-2 px-1">
                                    <Lightbulb className="w-3 h-3 text-amber-400" />
                                    <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Oportunidades (No en Stock)</span>
                                </div>
                                <div className="space-y-2">
                                    {suggestions.ideal_suggestions.map((s, i) => (
                                        <div key={i} className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-[10px] font-black text-amber-400 uppercase tracking-tighter">{s.title}</span>
                                                <span className="text-[9px] font-black text-amber-500/50">${s.estimated_price} Est.</span>
                                            </div>
                                            <p className="text-[9px] text-zinc-500 font-bold leading-relaxed italic">"{s.reason}"</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* No suggestions empty state */}
                        {!suggestions.catalog_suggestions?.length && !suggestions.ideal_suggestions?.length && !(suggestions as any).error && (
                            <div className="py-6 text-center opacity-40">
                                <p className="text-[8px] font-black uppercase">No hay sugerencias para este contexto</p>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <div className="py-6 text-center">
                        <p className="text-[8px] text-zinc-600 font-black uppercase tracking-[0.2em]">Agrega productos o describe una meta para recibir sugerencias</p>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
