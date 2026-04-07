"use client";

import React from 'react';
import { 
    Globe, Link as LinkIcon, Palette, Save, Video, Users, HelpCircle, 
    Image as ImageIcon, Briefcase, MapPin,
    Coins, Clock, Activity, TrendingUp, Calculator, Zap, BookOpen, Quote, Star, ListChecks, MessageSquare
} from "lucide-react";
import { useLandingCMS } from "@/context/LandingCMSContext";

export default function AdminSettings() {
    const { cmsData, updateSection, publishChanges } = useLandingCMS();

    const handleSave = () => {
        publishChanges();
        alert("¡Cambios publicados con éxito en la Landing Page!");
    };

    return (
        <div className="space-y-8 w-full mx-auto pb-32 px-4 md:px-8 pt-8 md:pt-8 bg-black min-h-screen">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-0">
                <div className="w-full sm:w-auto">
                    <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter leading-none sm:leading-tight">Configuración de Plataforma (CMS)</h1>
                    <p className="text-xs sm:text-sm text-gray-400 mt-2 font-light max-w-xl">Administra todo el contenido público de tu landing page desde un solo lugar.</p>
                </div>
                <button 
                    onClick={handleSave}
                    className="w-full sm:w-auto bg-blis-red text-white px-8 py-4 sm:py-5 rounded-3xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all flex items-center justify-center shrink-0 gap-2 shadow-[0_10px_20px_rgba(190,11,60,0.3)] mt-4 sm:mt-0"
                >
                    <Save className="w-5 h-5" /> Publicar Cambios
                </button>
            </div>

            {/* SECCIÓN HERO */}
            <Section title="Portada Principal (Hero)" icon={<Palette className="w-6 h-6 text-blis-red" />}>
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Field label="Título Principal - Parte 1">
                            <input 
                                type="text" 
                                value={cmsData.hero.title1} 
                                onChange={(e) => updateSection('hero', { title1: e.target.value })}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-blis-red/50 font-black uppercase"
                            />
                        </Field>
                        <Field label="Título Principal - Parte 2">
                            <input 
                                type="text" 
                                value={cmsData.hero.title2} 
                                onChange={(e) => updateSection('hero', { title2: e.target.value })}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-blis-red/50 font-black uppercase"
                            />
                        </Field>
                    </div>
                    <Field label="Subtítulo Principal (Llamada a la Acción)">
                        <input 
                            type="text" 
                            value={cmsData.hero.subtitle} 
                            onChange={(e) => updateSection('hero', { subtitle: e.target.value })}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-blis-red/50 font-bold"
                        />
                    </Field>
                    <Field label="Descripción Detallada">
                        <textarea 
                            rows={3} 
                            value={cmsData.hero.description} 
                            onChange={(e) => updateSection('hero', { description: e.target.value })}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-blis-red/50 transition-all resize-none font-medium"
                        />
                    </Field>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Field label="Texto Botón Primario">
                            <input 
                                type="text" 
                                value={cmsData.hero.primaryBtnText} 
                                onChange={(e) => updateSection('hero', { primaryBtnText: e.target.value })}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-blis-red/50 font-bold"
                            />
                        </Field>
                        <Field label="Texto Botón Secundario">
                            <input 
                                type="text" 
                                value={cmsData.hero.secondaryBtnText} 
                                onChange={(e) => updateSection('hero', { secondaryBtnText: e.target.value })}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-blis-red/50 font-bold"
                            />
                        </Field>
                    </div>
                </div>
            </Section>

            {/* SECCIÓN NOSOTROS */}
            <Section title="Nosotros (Trayectoria)" icon={<ImageIcon className="w-6 h-6 text-blue-400" />}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <Field label="Años Experiencia">
                        <input 
                            type="text" 
                            value={cmsData.about.yearsExperience} 
                            onChange={(e) => updateSection('about', { yearsExperience: e.target.value })}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white font-bold text-center"
                        />
                    </Field>
                    <Field label="Años Experiencia">
                        <input 
                            type="text" 
                            value={cmsData.about.yearsExperience} 
                            onChange={(e) => updateSection('about', { yearsExperience: e.target.value })}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white font-bold text-center"
                        />
                    </Field>
                    <Field label="Etiqueta Años">
                        <input 
                            type="text" 
                            value={cmsData.about.yearsLabel || ''} 
                            onChange={(e) => updateSection('about', { yearsLabel: e.target.value })}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white font-bold text-center"
                        />
                    </Field>
                    <Field label="Stat 1 Valor (ej: 100%)">
                        <input 
                            type="text" 
                            value={cmsData.about.stat1Value || ''} 
                            onChange={(e) => updateSection('about', { stat1Value: e.target.value })}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white font-bold text-center"
                        />
                    </Field>
                    <Field label="Stat 1 Etiqueta">
                        <input 
                            type="text" 
                            value={cmsData.about.stat1Label || ''} 
                            onChange={(e) => updateSection('about', { stat1Label: e.target.value })}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white font-bold text-center"
                        />
                    </Field>
                    <Field label="Stat 2 Valor (ej: +350)">
                        <input 
                            type="text" 
                            value={cmsData.about.stat2Value || ''} 
                            onChange={(e) => updateSection('about', { stat2Value: e.target.value })}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white font-bold text-center"
                        />
                    </Field>
                    <Field label="Stat 2 Etiqueta">
                        <input 
                            type="text" 
                            value={cmsData.about.stat2Label || ''} 
                            onChange={(e) => updateSection('about', { stat2Label: e.target.value })}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white font-bold text-center"
                        />
                    </Field>
                    <Field label="Stat 3 Valor Widget">
                        <input 
                            type="text" 
                            value={cmsData.about.stat3Value || ''} 
                            onChange={(e) => updateSection('about', { stat3Value: e.target.value })}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white font-bold text-center"
                        />
                    </Field>
                    <Field label="Stat 3 Etiqueta Widget">
                        <input 
                            type="text" 
                            value={cmsData.about.stat3Label || ''} 
                            onChange={(e) => updateSection('about', { stat3Label: e.target.value })}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white font-bold text-center"
                        />
                    </Field>
                    <Field label="Video URL (Embed)">
                        <input 
                            type="text" 
                            value={cmsData.about.videoUrl} 
                            onChange={(e) => updateSection('about', { videoUrl: e.target.value })}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white font-mono text-xs"
                        />
                    </Field>
                    <Field label="Miniatura Video (URL)">
                        <input 
                            type="text" 
                            value={cmsData.about.videoThumbnail} 
                            onChange={(e) => updateSection('about', { videoThumbnail: e.target.value })}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white font-mono text-xs"
                        />
                    </Field>
                </div>
                <Field label="Misión Corporativa">
                    <textarea 
                        rows={3} 
                        value={cmsData.about.missionText} 
                        onChange={(e) => updateSection('about', { missionText: e.target.value })}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white resize-none"
                    />
                </Field>
            </Section>

            {/* SECCIÓN METODOLOGÍA (PROCESS) */}
            <Section title="Metodología (Pasos)" icon={<ListChecks className="w-6 h-6 text-green-400" />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {cmsData.process.steps.map((step, idx) => (
                        <div key={idx} className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                            <h3 className="text-blis-red font-black uppercase text-xs">Paso {idx + 1}</h3>
                            <Field label="Título">
                                <input 
                                    type="text" 
                                    value={step.title} 
                                    onChange={(e) => {
                                        const newSteps = [...cmsData.process.steps];
                                        newSteps[idx] = { ...step, title: e.target.value };
                                        updateSection('process', { steps: newSteps });
                                    }}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white font-bold"
                                />
                            </Field>
                            <Field label="Descripción">
                                <textarea 
                                    rows={2} 
                                    value={step.description} 
                                    onChange={(e) => {
                                        const newSteps = [...cmsData.process.steps];
                                        newSteps[idx] = { ...step, description: e.target.value };
                                        updateSection('process', { steps: newSteps });
                                    }}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white text-xs resize-none"
                                />
                            </Field>
                        </div>
                    ))}
                </div>
            </Section>

            {/* SECCIÓN OPERACIONES (BACKSTAGE) */}
            <Section title="Backstage (Operaciones)" icon={<Activity className="w-6 h-6 text-amber-500" />}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {Object.entries(cmsData.operations.stats).map(([key, val]) => (
                        <Field label={key.toUpperCase()} key={key}>
                            <input 
                                type="text" 
                                value={val} 
                                onChange={(e) => {
                                    updateSection('operations', { 
                                        stats: { ...cmsData.operations.stats, [key]: e.target.value } 
                                    });
                                }}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white font-bold text-center"
                            />
                        </Field>
                    ))}
                </div>
            </Section>

            {/* SECCIÓN MERCADO (INTERACTIVE DATA) */}
            <Section title="Inteligencia de Mercado" icon={<Zap className="w-6 h-6 text-blue-500" />}>
                <div className="space-y-8">
                    <Field label="Descripción del Módulo">
                        <textarea 
                            rows={2} 
                            value={cmsData.market.description} 
                            onChange={(e) => updateSection('market', { description: e.target.value })}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white"
                        />
                    </Field>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {cmsData.market.stats.map((stat, idx) => (
                            <div key={idx} className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <Field label={stat.title}>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            value={stat.value} 
                                            onChange={(e) => {
                                                const newStats = [...cmsData.market.stats];
                                                newStats[idx] = { ...stat, value: e.target.value };
                                                updateSection('market', { stats: newStats });
                                            }}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white font-black"
                                        />
                                    </div>
                                </Field>
                            </div>
                        ))}
                    </div>
                </div>
            </Section>

            {/* SECCIÓN CALCULADORA (PLUSVALÍA) */}
            <Section title="Puntos de Inversión (Calculadora)" icon={<Calculator className="w-6 h-6 text-orange-500" />}>
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Field label="Título de Sección">
                            <input 
                                type="text" 
                                value={cmsData.calculator.title} 
                                onChange={(e) => updateSection('calculator', { title: e.target.value })}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white"
                            />
                        </Field>
                        <Field label="TIR Histórica (%)">
                            <input 
                                type="text" 
                                value={cmsData.calculator.tirValue} 
                                onChange={(e) => updateSection('calculator', { tirValue: e.target.value })}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white font-black"
                            />
                        </Field>
                    </div>
                    <Field label="Subtítulo / Promo">
                        <input 
                            type="text" 
                            value={cmsData.calculator.subtitle} 
                            onChange={(e) => updateSection('calculator', { subtitle: e.target.value })}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white font-bold"
                        />
                    </Field>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Field label="Ratio Planos (%)">
                            <input 
                                type="text" 
                                value={cmsData.calculator.planosRatio} 
                                onChange={(e) => updateSection('calculator', { planosRatio: e.target.value })}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white text-center font-mono"
                            />
                        </Field>
                        <Field label="Ratio Preventa (%)">
                            <input 
                                type="text" 
                                value={cmsData.calculator.preventaRatio} 
                                onChange={(e) => updateSection('calculator', { preventaRatio: e.target.value })}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white text-center font-mono"
                            />
                        </Field>
                        <Field label="Ratio Escritura (%)">
                            <input 
                                type="text" 
                                value={cmsData.calculator.escrituraRatio} 
                                onChange={(e) => updateSection('calculator', { escrituraRatio: e.target.value })}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white text-center font-mono"
                            />
                        </Field>
                    </div>
                </div>
            </Section>

            {/* SECCIÓN MAPA (DOMINIO TERRITORIAL) */}
            <Section title="Dominio Territorial (Mapa)" icon={<MapPin className="w-6 h-6 text-red-500" />}>
                <div className="space-y-8">
                    <Field label="Descripción de Cobertura">
                        <textarea 
                            rows={2} 
                            value={cmsData.map.description} 
                            onChange={(e) => updateSection('map', { description: e.target.value })}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white"
                        />
                    </Field>
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Ubicaciones Activas</h4>
                        {cmsData.map.locations.map((loc, idx) => (
                            <div key={idx} className="p-4 bg-white/5 rounded-xl border border-white/5 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Field label="Nombre">
                                    <input 
                                        type="text" 
                                        value={loc.name} 
                                        onChange={(e) => {
                                            const newLocs = [...cmsData.map.locations];
                                            newLocs[idx] = { ...loc, name: e.target.value };
                                            updateSection('map', { locations: newLocs });
                                        }}
                                        className="w-full bg-black/50 border border-white/5 rounded-lg px-3 py-2 text-white text-xs"
                                    />
                                </Field>
                                <Field label="Ciudad">
                                    <input 
                                        type="text" 
                                        value={loc.city} 
                                        onChange={(e) => {
                                            const newLocs = [...cmsData.map.locations];
                                            newLocs[idx] = { ...loc, city: e.target.value };
                                            updateSection('map', { locations: newLocs });
                                        }}
                                        className="w-full bg-black/50 border border-white/5 rounded-lg px-3 py-2 text-white text-xs"
                                    />
                                </Field>
                                <Field label="Status">
                                    <input 
                                        type="text" 
                                        value={loc.status} 
                                        onChange={(e) => {
                                            const newLocs = [...cmsData.map.locations];
                                            newLocs[idx] = { ...loc, status: e.target.value };
                                            updateSection('map', { locations: newLocs });
                                        }}
                                        className="w-full bg-black/50 border border-white/5 rounded-lg px-3 py-2 text-white text-xs"
                                    />
                                </Field>
                            </div>
                        ))}
                    </div>
                </div>
            </Section>

            {/* SECCIÓN EQUIPO */}
            <Section title="Equipo Directivo" icon={<Users className="w-6 h-6 text-purple-400" />}>
                <div className="space-y-8">
                    {cmsData.team.members.map((member, idx) => (
                        <div key={idx} className="p-6 bg-black/30 border border-white/5 rounded-2xl space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Field label="Nombre">
                                    <input 
                                        type="text" 
                                        value={member.name} 
                                        onChange={(e) => {
                                            const newMembers = [...cmsData.team.members];
                                            newMembers[idx] = { ...member, name: e.target.value };
                                            updateSection('team', { members: newMembers });
                                        }}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white"
                                    />
                                </Field>
                                <Field label="Cargo">
                                    <input 
                                        type="text" 
                                        value={member.role} 
                                        onChange={(e) => {
                                            const newMembers = [...cmsData.team.members];
                                            newMembers[idx] = { ...member, role: e.target.value };
                                            updateSection('team', { members: newMembers });
                                        }}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white"
                                    />
                                </Field>
                            </div>
                        </div>
                    ))}
                </div>
            </Section>

            {/* SECCIÓN EQUIPO (LIDERAZGO) */}
            <Section title="Liderazgo (C.E.O.)" icon={<Users className="w-6 h-6 text-blue-500" />}>
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Field label="Nombre del C.E.O.">
                            <input 
                                type="text" 
                                value={cmsData.team.ceoName} 
                                onChange={(e) => updateSection('team', { ceoName: e.target.value })}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white font-bold"
                            />
                        </Field>
                        <Field label="Cargo / Subtítulo">
                            <input 
                                type="text" 
                                value={cmsData.team.ceoRole} 
                                onChange={(e) => updateSection('team', { ceoRole: e.target.value })}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white"
                            />
                        </Field>
                    </div>
                    
                    <Field label="Frase / Cita (Quote)">
                        <input 
                            type="text" 
                            value={cmsData.team.ceoQuote} 
                            onChange={(e) => updateSection('team', { ceoQuote: e.target.value })}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white italic"
                        />
                    </Field>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Field label="Descripción Párrafo 1">
                            <textarea 
                                rows={4} 
                                value={cmsData.team.ceoDescription1} 
                                onChange={(e) => updateSection('team', { ceoDescription1: e.target.value })}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white text-sm"
                            />
                        </Field>
                        <Field label="Descripción Párrafo 2">
                            <textarea 
                                rows={4} 
                                value={cmsData.team.ceoDescription2} 
                                onChange={(e) => updateSection('team', { ceoDescription2: e.target.value })}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white text-sm"
                            />
                        </Field>
                    </div>

                    <Field label="URL Imagen C.E.O.">
                        <div className="flex gap-4">
                            <div className="w-16 h-16 rounded-lg bg-zinc-900 border border-white/10 shrink-0 overflow-hidden">
                                <img src={cmsData.team.ceoImage} alt="CEO" className="w-full h-full object-cover" />
                            </div>
                            <input 
                                type="text" 
                                value={cmsData.team.ceoImage} 
                                onChange={(e) => updateSection('team', { ceoImage: e.target.value })}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-gray-400 font-mono text-xs"
                            />
                        </div>
                    </Field>
                </div>
            </Section>

            {/* SECCIÓN TIENDA (CATÁLOGO) */}
            <Section title="Tienda (Recursos)" icon={<Briefcase className="w-6 h-6 text-purple-500" />}>
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Field label="Título de Sección">
                            <input 
                                type="text" 
                                value={cmsData.catalog.title} 
                                onChange={(e) => updateSection('catalog', { title: e.target.value })}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white"
                            />
                        </Field>
                        <Field label="Subtítulo Principal">
                            <input 
                                type="text" 
                                value={cmsData.catalog.subtitle} 
                                onChange={(e) => updateSection('catalog', { subtitle: e.target.value })}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white"
                            />
                        </Field>
                    </div>
                </div>
            </Section>

            {/* SECCIÓN TESTIMONIOS */}
            <Section title="Experiencias (Testimonios)" icon={<MessageSquare className="w-6 h-6 text-pink-500" />}>
                <div className="space-y-6">
                    {cmsData.testimonials.items.map((item, idx) => (
                        <div key={idx} className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                            <Field label={`Testimonio ${idx + 1}`}>
                                <textarea 
                                    rows={2} 
                                    value={item.quote} 
                                    onChange={(e) => {
                                        const newItems = [...cmsData.testimonials.items];
                                        newItems[idx] = { ...item, quote: e.target.value };
                                        updateSection('testimonials', { items: newItems });
                                    }}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white italic"
                                />
                            </Field>
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Autor">
                                    <input 
                                        type="text" 
                                        value={item.author} 
                                        onChange={(e) => {
                                            const newItems = [...cmsData.testimonials.items];
                                            newItems[idx] = { ...item, author: e.target.value };
                                            updateSection('testimonials', { items: newItems });
                                        }}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white text-xs font-bold"
                                    />
                                </Field>
                                <Field label="Cargo">
                                    <input 
                                        type="text" 
                                        value={item.role} 
                                        onChange={(e) => {
                                            const newItems = [...cmsData.testimonials.items];
                                            newItems[idx] = { ...item, role: e.target.value };
                                            updateSection('testimonials', { items: newItems });
                                        }}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white text-[10px]"
                                    />
                                </Field>
                            </div>
                        </div>
                    ))}
                </div>
            </Section>

            {/* SECCIÓN FAQ */}
            <Section title="Preguntas Frecuentes" icon={<HelpCircle className="w-6 h-6 text-teal-400" />}>
                <div className="space-y-6">
                    {cmsData.faq.items.map((item, idx) => (
                        <div key={idx} className="p-6 bg-black/30 border border-white/5 rounded-2xl space-y-4">
                            <Field label={`Pregunta ${idx + 1}`}>
                                <input 
                                    type="text" 
                                    value={item.question} 
                                    onChange={(e) => {
                                        const newItems = [...cmsData.faq.items];
                                        newItems[idx] = { ...item, question: e.target.value };
                                        updateSection('faq', { items: newItems });
                                    }}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white font-bold"
                                />
                            </Field>
                            <Field label="Respuesta">
                                <textarea 
                                    rows={2} 
                                    value={item.answer} 
                                    onChange={(e) => {
                                        const newItems = [...cmsData.faq.items];
                                        newItems[idx] = { ...item, answer: e.target.value };
                                        updateSection('faq', { items: newItems });
                                    }}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white text-sm"
                                />
                            </Field>
                        </div>
                    ))}
                </div>
            </Section>

            {/* PIE DE PÁGINA */}
            <Section title="Pie de Página (Footer)" icon={<LinkIcon className="w-6 h-6 text-gray-400" />}>
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Field label="Logo Vertical (URL)">
                            <div className="flex gap-4">
                                <div className="w-16 h-16 rounded-lg bg-zinc-900 border border-white/10 shrink-0 overflow-hidden bg-black flex items-center justify-center p-2">
                                    <img src={cmsData.footer.logoVertical} alt="Logo" className="max-w-full max-h-full object-contain" />
                                </div>
                                <input 
                                    type="text" 
                                    value={cmsData.footer.logoVertical} 
                                    onChange={(e) => updateSection('footer', { logoVertical: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-gray-400 font-mono text-xs"
                                />
                            </div>
                        </Field>
                        <Field label="Logo Horizontal (URL)">
                            <div className="flex gap-4">
                                <div className="w-16 h-16 rounded-lg bg-zinc-900 border border-white/10 shrink-0 overflow-hidden bg-black flex items-center justify-center p-2">
                                    <img src={cmsData.footer.logoHorizontal} alt="Logo" className="max-w-full max-h-full object-contain" />
                                </div>
                                <input 
                                    type="text" 
                                    value={cmsData.footer.logoHorizontal} 
                                    onChange={(e) => updateSection('footer', { logoHorizontal: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-gray-400 font-mono text-xs"
                                />
                            </div>
                        </Field>
                    </div>
                    <Field label="Descripción de Marca (Footer)">
                        <textarea 
                            rows={2} 
                            value={cmsData.footer.description} 
                            onChange={(e) => updateSection('footer', { description: e.target.value })}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white"
                        />
                    </Field>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {Object.entries(cmsData.footer.socials).map(([key, val]) => (
                            <Field label={key.toUpperCase()} key={key}>
                                <input 
                                    type="text" 
                                    value={val} 
                                    onChange={(e) => {
                                        updateSection('footer', { 
                                            socials: { ...cmsData.footer.socials, [key]: e.target.value } 
                                        });
                                    }}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-gray-400 font-mono text-xs"
                                />
                            </Field>
                        ))}
                    </div>
                </div>
            </Section>
        </div>
    );
}

// Utility Components
function Section({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) {
    return (
        <div className="bg-zinc-950 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
            <div className="px-8 py-6 border-b border-white/5 bg-white/[0.02] flex items-center gap-4">
                {icon}
                <h2 className="text-xl font-black text-white uppercase tracking-widest">{title}</h2>
            </div>
            <div className="p-8">{children}</div>
        </div>
    );
}

function Field({ label, children }: { label: string, children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">{label}</label>
            {children}
        </div>
    );
}
