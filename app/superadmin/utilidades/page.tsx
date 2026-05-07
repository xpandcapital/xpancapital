"use client";

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { SidebarTools } from '@/components/superadmin/sidebar-tools/SidebarTools';
import { motion } from 'framer-motion';
import { Boxes } from 'lucide-react';

export default function UtilidadesPage() {
    const searchParams = useSearchParams();
    const initialTool = searchParams.get('tool') || undefined;

    return (
        <div className="h-screen flex flex-col bg-zinc-950 overflow-hidden">
            {/* Minimal Header */}
            <div className="flex items-center justify-between px-10 py-6 border-b border-white/5 shrink-0 bg-black/20">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blis-red/20 rounded-2xl">
                        <Boxes className="w-8 h-8 text-blis-red" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic leading-none">
                            TOOL<span className="text-blis-red">BOX</span>
                        </h1>
                        <p className="text-gray-500 text-[9px] font-black uppercase tracking-[0.5em] mt-2 ml-0.5">
                            SISTEMA DE GESTIÓN OPERATIVA v3.2
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex flex-col items-end">
                        <div className="text-[10px] font-black text-zinc-700 uppercase tracking-widest leading-none mb-1">Entorno de Gestión</div>
                        <div className="text-xs font-black text-white uppercase tracking-tighter">CENTRAL DE CONTROL</div>
                    </div>
                    <div className="h-10 w-[1px] bg-white/10" />
                    <div className="bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-black text-emerald-500 uppercase">Sincronizado</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Layout Full Width / Height */}
            <div className="flex-1 overflow-hidden">
                <SidebarTools initialTool={initialTool} />
            </div>
        </div>
    );
}
