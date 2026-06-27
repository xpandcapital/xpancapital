"use client";

import React from 'react';
import {
    Briefcase, MapPin, DollarSign, Percent, Save
} from "lucide-react";
import { useLandingCMS } from "@/context/LandingCMSContext";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NativeSelect } from "@/components/ui/SearchableSelect";

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="bg-zinc-950 border border-white/5 rounded-[2rem] p-4 md:p-8 shadow-4xl">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    {icon}
                </div>
                <h2 className="text-xl font-black text-white uppercase tracking-wide">{title}</h2>
            </div>
            {children}
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</label>
            {children}
        </div>
    );
}

export default function ComercioSettings() {
    const { cmsData, updateSection, publishChanges } = useLandingCMS();

    const countryDefaults: Record<string, { currency: string; taxName: string; taxRate: number }> = {
        PE: { currency: 'S/', taxName: 'IGV', taxRate: 18 },
        MX: { currency: '$', taxName: 'IVA', taxRate: 16 },
        CO: { currency: '$', taxName: 'IVA', taxRate: 19 },
        CL: { currency: '$', taxName: 'IVA', taxRate: 19 },
        EC: { currency: '$', taxName: 'IVA', taxRate: 15 },
        ES: { currency: '€', taxName: 'IVA', taxRate: 21 },
        US: { currency: '$', taxName: 'Tax', taxRate: 0 },
        GLOBAL: { currency: '$', taxName: 'TAX', taxRate: 0 }
    };

    const handleCountryChange = (val: string) => {
        const defaults = countryDefaults[val];
        updateSection('commercial', { 
            country: val,
            ...(defaults || {})
        });
    };

    const handleSave = () => {
        publishChanges();
        alert("¡Configuración de comercio guardada!");
    };

    return (
        <div className="space-y-8 w-full mx-auto pb-32 px-4 md:px-8 pt-8 md:pt-8 bg-black min-h-screen">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-0">
                <div className="w-full sm:w-auto">
                    <Link 
                        href="/superadmin/ajustes" 
                        className="text-gray-400 hover:text-white active:text-white text-xs flex items-center gap-1 mb-2"
                    >
                        <ArrowLeft className="w-3 h-3" /> Volver a Ajustes
                    </Link>
                    <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter leading-none sm:leading-tight">Ajustes del Comercio</h1>
                    <p className="text-xs sm:text-sm text-gray-400 mt-2 font-light max-w-xl">Configura los parámetros fiscales y de localización de tu comercio.</p>
                </div>
                <button 
                    onClick={handleSave}
                    className="w-full sm:w-auto bg-blis-red text-white px-8 py-4 sm:py-5 rounded-3xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all flex items-center justify-center shrink-0 gap-2 shadow-[0_10px_20px_rgba(190,11,60,0.3)] mt-4 sm:mt-0"
                >
                    <Save className="w-5 h-5" /> Guardar Cambios
                </button>
            </div>

            <Section title="Comercio & Localización" icon={<Briefcase className="w-6 h-6 text-blue-500" />}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <Field label="País de Operación Fiscal">
                        <div className="relative">
                            <NativeSelect
                                value={cmsData.commercial.country}
                                onChange={handleCountryChange}
                                options={[
                                    { value: 'PE', label: 'Perú 🇵🇪' },
                                    { value: 'MX', label: 'México 🇲🇽' },
                                    { value: 'CO', label: 'Colombia 🇨🇴' },
                                    { value: 'CL', label: 'Chile 🇨🇱' },
                                    { value: 'EC', label: 'Ecuador 🇪🇨' },
                                    { value: 'ES', label: 'España 🇪🇸' },
                                    { value: 'US', label: 'Estados Unidos 🇺🇸' },
                                    { value: 'GLOBAL', label: 'Global / Otros 🌎' },
                                ]}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-blue-500/50 appearance-none font-bold"
                            />
                            <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 pointer-events-none" />
                        </div>
                    </Field>

                    <Field label="Moneda del Sistema">
                        <div className="relative">
                            <input
                                type="text"
                                value={cmsData.commercial.currency}
                                onChange={(e) => updateSection('commercial', { currency: e.target.value })}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-blue-500/50 font-bold"
                            />
                            <DollarSign className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 pointer-events-none" />
                        </div>
                    </Field>

                    <Field label="Nombre del Impuesto">
                        <input
                            type="text"
                            value={cmsData.commercial.taxName}
                            onChange={(e) => updateSection('commercial', { taxName: e.target.value })}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-blue-500/50 font-bold uppercase"
                        />
                    </Field>

                    <Field label="Tasa Impuesto (%)">
                        <div className="relative">
                            <input
                                type="number"
                                value={cmsData.commercial.taxRate}
                                onChange={(e) => updateSection('commercial', { taxRate: parseFloat(e.target.value) || 0 })}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-blue-500/50 font-bold"
                            />
                            <Percent className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 pointer-events-none" />
                        </div>
                    </Field>
                </div>
            </Section>
        </div>
    );
}