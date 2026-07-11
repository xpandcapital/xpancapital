"use client";

import React, { useState, useEffect } from "react";
import { Plus, GripVertical, Trash2, Save, Sparkles, BookOpen, Route, ArrowRight, Library, Bot, X, Check } from "lucide-react";

// Same mock context from the Blog
const availableArticles = [
    "Diferencia: impuesto, contribuciones y tasas",
    "Preguntas frecuentes: Patrimonio familiar",
    "¿Pueden embargar mi patrimonio familiar?",
    "¿Quieres vender tu casa en San Isidro?",
    "Bienes excluidos de la sociedad conyugal",
    "Rediseño Espacial: ¡Ya no más salas pequeñas!",
    "Ingeniería: ¿Por qué tener una puerta acorazada?",
    "Tendencias Ocultas: Cocina y sala en un solo espacio (Estreno)",
    "Evolución de las construcciones: Reporte Q2 2026",
    "¿Piensas reformar o rehabilitar tu Villa? (Nuevas Normas)",
    "¿Sabes cómo son las viviendas Premium en Perú?",
    "Guía Definitiva: ¿Cómo comprar una casa?",
    "¿Qué necesito para comprar un terreno urbano?",
    "Inversiones Inteligentes: Tips para locales comerciales"
];

const mockAIRoutes = [
    {
        id: "ruta-ai-1",
        name: "Onboarding para Nuevos Agentes",
        description: "Ruta generada por IA basándose en las dudas más frecuentes de agentes junior en su primer trimestre.",
        articles: [
            "Guía Definitiva: ¿Cómo comprar una casa?",
            "¿Quieres vender tu casa en San Isidro?",
            "¿Qué necesito para comprar un terreno urbano?",
            "Inversiones Inteligentes: Tips para locales comerciales"
        ],
        isAI: true
    },
    {
        id: "ruta-ai-2",
        name: "Especialización Legal en Patrimonio",
        description: "Análisis patrimonial profundo para proteger inversiones familiares.",
        articles: [
            "Diferencia: impuesto, contribuciones y tasas",
            "Preguntas frecuentes: Patrimonio familiar",
            "¿Pueden embargar mi patrimonio familiar?",
            "Bienes excluidos de la sociedad conyugal"
        ],
        isAI: true
    }
];

export default function AdminBlogRoutes() {
    const [routes, setRoutes] = useState<any[]>([]);
    const [isSuggesting, setIsSuggesting] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem('blis_blog_routes');
            if (saved) {
                setRoutes(JSON.parse(saved));
            } else {
                // If empty, pre-populate basic route
                const initial = [{
                    id: "route-" + Date.now(),
                    name: "Guía para Inversores Principiantes",
                    description: "Conoce desde cero cómo adquirir y rentabilizar propiedades.",
                    articles: ["Guía Definitiva: ¿Cómo comprar una casa?", "¿Sabes cómo son las viviendas Premium en Perú?"],
                    isAI: false
                }];
                setRoutes(initial);
                localStorage.setItem('blis_blog_routes', JSON.stringify(initial));
            }
        }
    }, []);

    const saveRoutes = (newRoutes: any[]) => {
        setRoutes(newRoutes);
        localStorage.setItem('blis_blog_routes', JSON.stringify(newRoutes));
    };

    const addEmptyRoute = () => {
        const newRoute = {
            id: "route-" + Date.now(),
            name: "Nueva Ruta de Aprendizaje",
            description: "Describe para quién es esta ruta",
            articles: [],
            isAI: false
        };
        saveRoutes([...routes, newRoute]);
    };

    const deleteRoute = (id: string) => {
        saveRoutes(routes.filter(r => r.id !== id));
    };

    const runAIGenerator = () => {
        setIsSuggesting(true);
        setTimeout(() => {
            const index = Math.floor(Math.random() * mockAIRoutes.length);
            const generated = mockAIRoutes[index];
            generated.id = "ruta-" + Date.now();
            saveRoutes([generated, ...routes]);
            setIsSuggesting(false);
            alert(`¡La IA de Xpand Capital ha generado la ruta: "${generated.name}"!`);
        }, 2000);
    };

    const updateRoute = (id: string, key: string, value: any) => {
        const updated = routes.map(r => {
            if (r.id === id) {
                return { ...r, [key]: value };
            }
            return r;
        });
        saveRoutes(updated);
    };

    const addArticleToRoute = (routeId: string, articleTitle: string) => {
        const route = routes.find(r => r.id === routeId);
        if (!route || route.articles.includes(articleTitle)) return;
        updateRoute(routeId, 'articles', [...route.articles, articleTitle]);
    };

    const removeArticleFromRoute = (routeId: string, articleTitle: string) => {
        const route = routes.find(r => r.id === routeId);
        if (!route) return;
        updateRoute(routeId, 'articles', route.articles.filter((a: string) => a !== articleTitle));
    };

    return (
        <div className="min-h-screen bg-black text-white p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-widest text-white flex items-center gap-3">
                            <Route className="w-8 h-8 text-emerald-500" />
                            Rutas de Lectura / Playlist
                        </h1>
                        <p className="text-gray-400 mt-2 text-sm max-w-2xl">
                            Crea secuencias de estudio y líneas de tiempo con tus artículos. Los usuarios públicos podrán seguir esta ruta paso a paso para educarse, ganando experiencia (y Xpand Coins) ordenadamente.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={addEmptyRoute} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors">
                            <Plus className="w-4 h-4" /> Crear Ruta Manual
                        </button>
                        <button onClick={runAIGenerator} disabled={isSuggesting} className="flex items-center gap-2 bg-white/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-5 py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-all">
                            {isSuggesting ? <span className="animate-spin w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full" /> : <Bot className="w-4 h-4" />}
                            {isSuggesting ? "Generando..." : "Sugerir con IA"}
                        </button>
                    </div>
                </div>

                <div className="space-y-8">
                    {routes.map((route) => (
                        <div key={route.id} className={`bg-zinc-950/80 backdrop-blur-xl border ${route.isAI ? 'border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'border-white/10'} rounded-3xl overflow-hidden p-6 md:p-8 relative`}>
                            {route.isAI && (
                                <div className="absolute top-0 right-0 px-4 py-1 bg-emerald-500/20 text-emerald-400 font-bold uppercase tracking-widest text-[10px] rounded-bl-xl flex items-center gap-2">
                                    <Sparkles className="w-3 h-3" /> Generado por IA
                                </div>
                            )}

                            <div className="flex justify-between items-start mb-6">
                                <div className="flex-1 mr-6 space-y-4">
                                    <input 
                                        type="text" 
                                        value={route.name} 
                                        onChange={(e) => updateRoute(route.id, 'name', e.target.value)}
                                        className="w-full bg-transparent text-2xl font-black uppercase text-white focus:outline-none focus:border-b border-emerald-500/50 pb-1"
                                        placeholder="Nombre de la Ruta"
                                    />
                                    <input 
                                        type="text" 
                                        value={route.description} 
                                        onChange={(e) => updateRoute(route.id, 'description', e.target.value)}
                                        className="w-full bg-transparent text-sm text-gray-400 focus:outline-none focus:border-b border-white/20 pb-1"
                                        placeholder="Descripción o propósito de esta ruta..."
                                    />
                                </div>
                                <button onClick={() => deleteRoute(route.id)} className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Lista de Artículos Añadidos */}
                                <div className="bg-black/40 border border-white/5 rounded-2xl p-5">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-4 flex items-center gap-2">
                                        <Route className="w-4 h-4" /> Línea de Tiempo ({route.articles.length} Pasos)
                                    </h3>
                                    
                                    {route.articles.length === 0 ? (
                                        <div className="text-center p-8 text-gray-600 text-sm border border-dashed border-white/10 rounded-xl">
                                            Añade artículos desde el panel de la derecha
                                        </div>
                                    ) : (
                                        <div className="space-y-3 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-emerald-500/20 before:to-transparent">
                                            {route.articles.map((art: string, idx: number) => (
                                                <div key={idx} className="relative flex items-center justify-between group bg-zinc-900 border border-white/5 rounded-xl p-3 pr-4 pl-12 z-10 transition-colors hover:border-emerald-500/30">
                                                    <div className="absolute left-4 w-6 h-6 bg-black border-2 border-emerald-500/50 rounded-full flex items-center justify-center text-[10px] font-black text-emerald-400">
                                                        {idx + 1}
                                                    </div>
                                                    <span className="text-sm font-semibold text-gray-300 truncate mr-4">{art}</span>
                                                    <button onClick={() => removeArticleFromRoute(route.id, art)} className="p-1.5 text-gray-600 hover:text-red-400 transition-colors">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Base de Datos de Artículos */}
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
                                        <Library className="w-4 h-4" /> Artículos Disponibles
                                    </h3>
                                    <div className="bg-black/40 border border-white/5 rounded-2xl p-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                                        {availableArticles.map((art, idx) => {
                                            const isAdded = route.articles.includes(art);
                                            return (
                                                <div key={`av-${idx}`} className={`flex items-center justify-between p-3 rounded-lg text-sm transition-colors ${isAdded ? 'opacity-50 pointer-events-none' : 'hover:bg-white/5 cursor-pointer'}`} onClick={() => !isAdded && addArticleToRoute(route.id, art)}>
                                                    <span className="text-gray-400 truncate pr-4">{art}</span>
                                                    {!isAdded ? (
                                                        <Plus className="w-4 h-4 text-emerald-500 shrink-0" />
                                                    ) : (
                                                        <Check className="w-4 h-4 text-gray-600 shrink-0" />
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {routes.length === 0 && (
                        <div className="text-center py-20 border-2 border-dashed border-white/10 rounded-3xl">
                            <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-black text-gray-400 uppercase tracking-widest">No hay Rutas Creadas</h3>
                            <button onClick={runAIGenerator} className="mt-6 uppercase text-xs font-bold bg-white/5 px-6 py-3 rounded-lg text-emerald-500 hover:bg-white/10 transition-colors">¡Generar la primera con IA!</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}


