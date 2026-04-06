"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
    FileText, Upload, Bot, Calculator, Save, RefreshCw, 
    Sparkles, Edit3, Home, Clock, Scale, Copy, CheckCircle2,
    AlertTriangle, HelpCircle, DollarSign, ArrowRight, MessageSquare,
    Plus, Trash2, Layers, BarChart3, Files
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';

// ==========================================
// ESTRUCTURAS DE DATOS
// ==========================================

interface PaymentReceipt {
    id: string;
    amount: number;
    date: string;
    type: 'inicial' | 'cuota' | 'refuerzo';
}

interface ContractData {
    id?: string;
    lotId: string;
    clientName: string;
    promoterName?: string;
    totalPrice: number;
    initialFee: number;
    monthlyPayment: number;
    originalSignDate: string;
    monthlyStartDate: string;
    payOnDeed: boolean;
    actualPaidAmount: number;
    payments: PaymentReceipt[];
    status: string;
}

interface FinancialReport {
    totalPaid: number;
    totalInitialPaid: number;
    totalInstallmentsPaid: number;
    installmentsOwedToDate: number; // A Abril 2026
    projectedUntilDec2026: number;  // Mayo a Dic 2026 (8 meses)
    balanceAtDeed: number;          // Lo que falta para el 100%
    pendingToRegularize: number;    // Lo que debe pagar HOY
}

const DEFAULT_GEMINI = 'AIzaSyDTaDqoOzRBeDlZlS2rvUFse9aLMVHUsHU';

const getAIConfig = () => {
    if (typeof window === 'undefined') return { gemini_key: DEFAULT_GEMINI };
    const stored = localStorage.getItem('blis_ai_config');
    return { gemini_key: (stored ? JSON.parse(stored).gemini_key : DEFAULT_GEMINI) };
};

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export default function BulkContractReconciliation() {
    const [activeView, setActiveView] = useState<'new' | 'history' | 'report'>('new');
    const [contractHistory, setContractHistory] = useState<any[]>([]);
    const [aiThinking, setAiThinking] = useState(false);
    const [processingQueue, setProcessingQueue] = useState<string[]>([]);

    const [contract, setContract] = useState<ContractData>({
        lotId: '', clientName: '', promoterName: '', totalPrice: 0, initialFee: 0, monthlyPayment: 0,
        originalSignDate: '', monthlyStartDate: '', payOnDeed: false,
        actualPaidAmount: 0, payments: [], status: 'pending'
    });

    const [report, setReport] = useState<FinancialReport | null>(null);

    // --- Cargar Historial ---
    const loadHistory = useCallback(async () => {
        const { data } = await supabase.from('contract_reconciliation').select('*').order('created_at', { ascending: false });
        setContractHistory(data || []);
    }, []);

    useEffect(() => { loadHistory(); }, [loadHistory]);

    // --- Motor de IA para Clasificación y Extracción ---
    const processFileWithIA = async (base64: string, mime: string, fileName: string) => {
        const config = getAIConfig();
        setAiThinking(true);
        setProcessingQueue(prev => [...prev, fileName]);

        try {
            const prompt = `Analiza este documento (${fileName}). Determina si es un CONTRATO o un RECIBO DE PAGO.
            Si es CONTRATO, debes identificar y extraer:
            - lotId: número de lote (ej: "LOTE 01")
            - clientName: nombre COMPLETO del COMPRADOR (la persona que está comprando el lote)
            - promoterName: nombre COMPLETO del PROMOTOR/VENDEDOR (la empresa o persona que vende el lote, DUEÑO del proyecto)
            - totalPrice: precio total del lote
            - initialFee: cuota inicial pagada
            - monthlyPayment: valor de la cuota mensual
            - originalSignDate: fecha de firma del contrato
            - monthlyStartDate: fecha inicio de cuotas
            IMPORTANTE: El COMPRADOR es quien adquiere el lote. El PROMOTOR/VENDEDOR es el DUEÑO del proyecto. NO confundas ambos roles.
            Si es RECIBO, extrae: amount, date, type (inicial o cuota).
            Responde SOLO con este JSON:
            { "docType": "CONTRATO" | "RECIBO", "data": { ... } }`;

            const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${config.gemini_key}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType: mime, data: base64 } }] }],
                    generationConfig: { temperature: 0.1, responseMimeType: "application/json" }
                })
            });

            const res = await resp.json();
            const parsed = JSON.parse(res.candidates[0].content.parts[0].text);

            if (parsed.docType === 'CONTRATO') {
                setContract(prev => ({ ...prev, ...parsed.data, status: 'analyzed' }));
            } else {
                const newPayment: PaymentReceipt = {
                    id: Math.random().toString(36).substr(2, 9),
                    amount: parseFloat(parsed.data.amount) || 0,
                    date: parsed.data.date || '',
                    type: parsed.data.type || 'cuota'
                };
                setContract(prev => ({ ...prev, payments: [...prev.payments, newPayment] }));
            }
        } catch (e) { console.error("Error procesando:", fileName, e); }
        finally { 
            setAiThinking(false);
            setProcessingQueue(prev => prev.filter(f => f !== fileName));
        }
    };

    const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = () => processFileWithIA((reader.result as string).split(',')[1], file.type, file.name);
            reader.readAsDataURL(file);
        });
    };

    // --- Motor Lógico Inmobiliario ---
    const runFinancialEngine = () => {
        if (!contract.totalPrice) return;

        const dateApril2026 = new Date("2026-04-01");
        const dateJuly2025 = new Date("2025-07-01");
        const startPayments = new Date(contract.monthlyStartDate);

        // 1. Cálculos de Abonos
        const totalPaid = contract.payments.reduce((acc, p) => acc + p.amount, 0);
        const totalInitialPaid = contract.payments.filter(p => p.type === 'inicial').reduce((acc, p) => acc + p.amount, 0);
        const totalInstallmentsPaid = contract.payments.filter(p => p.type === 'cuota').reduce((acc, p) => acc + p.amount, 0);

        // 2. Deuda en Cuotas (Hasta Abril 2026 = 9 meses desde hito)
        const monthsOwedToDate = 9;
        const installmentsExpected = (contract.totalPrice * 0.5) + (monthsOwedToDate * contract.monthlyPayment);
        
        // 3. Proyección Dic 2026 (8 meses: Mayo, Jun, Jul, Ago, Sep, Oct, Nov, Dic)
        const projectedUntilDec2026 = 8 * contract.monthlyPayment;

        // 4. Saldo Escritura (Total Venta - Todo lo que debería estar pagado)
        const balanceAtDeed = contract.totalPrice - installmentsExpected - projectedUntilDec2026;

        setReport({
            totalPaid,
            totalInitialPaid,
            totalInstallmentsPaid,
            installmentsOwedToDate: installmentsExpected,
            projectedUntilDec2026,
            balanceAtDeed,
            pendingToRegularize: Math.max(0, installmentsExpected - totalPaid)
        });
        setActiveView('report');
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 font-sans select-none">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Header Masivo */}
                <div className="flex items-center justify-between bg-[#0a0a0a] p-6 rounded-3xl border border-white/5 shadow-2xl">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-emerald-500/20 rounded-2xl border border-emerald-500/20"><Layers className="w-8 h-8 text-emerald-500" /></div>
                        <div>
                            <h1 className="text-xl font-black uppercase tracking-tighter italic">Bulk Reconciliation <span className="text-emerald-500">Pro</span></h1>
                            <p className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.3em] mt-1.5">Motor de Auditoría y Proyección 2026-2027</p>
                        </div>
                    </div>
                    <div className="flex bg-black p-1.5 rounded-2xl border border-white/5">
                        <button onClick={() => setActiveView('new')} className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all ${activeView==='new' ? 'bg-emerald-500 text-black shadow-lg' : 'text-zinc-600 hover:text-white'}`}>Carga de Expediente</button>
                        <button onClick={() => setActiveView('history')} className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all ${activeView==='history' ? 'bg-zinc-800 text-white' : 'text-zinc-600'}`}>Historial</button>
                    </div>
                </div>

                {activeView === 'new' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* 1. Dropzone Masivo */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-3xl relative group overflow-hidden">
                                <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500/10 blur-3xl rounded-full" />
                                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2 relative z-10"><Files size={16}/> Carga de Archivos</h3>
                                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-white/10 rounded-[2.5rem] cursor-pointer hover:border-emerald-500/50 transition-all bg-black/40 hover:bg-black/60 relative z-10">
                                    <div className="text-center p-6">
                                        <Upload className="w-12 h-12 text-zinc-800 mb-4 mx-auto group-hover:text-emerald-500 transition-colors" />
                                        <p className="text-sm font-black uppercase tracking-widest text-zinc-400">Suelte Contratos y Recibos</p>
                                        <p className="text-[9px] text-zinc-600 mt-2 font-bold uppercase">Procesamiento IA Masivo Activo</p>
                                    </div>
                                    <input type="file" multiple className="hidden" onChange={handleBulkUpload} />
                                </label>

                                {/* Cola de procesamiento */}
                                <AnimatePresence>
                                    {processingQueue.length > 0 && (
                                        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="mt-6 space-y-2">
                                            <p className="text-[8px] font-black text-emerald-500 uppercase animate-pulse">Analizando con IA ({processingQueue.length} restantes)...</p>
                                            {processingQueue.slice(0,3).map(f => (
                                                <div key={f} className="flex items-center gap-2 bg-black/60 p-2 rounded-lg border border-white/5">
                                                    <RefreshCw size={10} className="animate-spin text-emerald-500" />
                                                    <span className="text-[9px] font-bold text-zinc-500 truncate">{f}</span>
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Acciones de Motor */}
                            <button onClick={runFinancialEngine} className="w-full py-6 bg-white text-black rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
                                <Calculator size={20}/> Ejecutar Auditoría Final
                            </button>
                        </div>

                        {/* 2. Resumen de Expediente */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-3xl space-y-8">
                                <div className="flex items-center justify-between border-b border-white/5 pb-6">
                                    <div>
                                        <h2 className="text-2xl font-black tracking-tighter uppercase italic">{contract.clientName || 'Esperando Cliente...'}</h2>
                                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-1">Lote Identificado: <span className="text-emerald-500">{contract.lotId || '--'}</span></p>
                                        {contract.promoterName && (
                                            <p className="text-[9px] font-medium text-zinc-500 mt-1">Promotor/Vendedor: <span className="text-blis-red">{contract.promoterName}</span></p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-zinc-700 uppercase">Precio de Venta Pactado</p>
                                        <h3 className="text-3xl font-black text-white">${contract.totalPrice.toLocaleString()}</h3>
                                    </div>
                                </div>

                                {/* Lista de Abonos Detectados */}
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2"><DollarSign size={14} className="text-emerald-500"/> Abonos Detectados ({contract.payments.length})</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        {contract.payments.map(p => (
                                            <div key={p.id} className="bg-black/60 border border-white/5 p-4 rounded-2xl flex items-center justify-between group">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${p.type === 'inicial' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'}`}><CheckCircle2 size={12}/></div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-white capitalize">{p.type} Recibido</p>
                                                        <p className="text-[8px] font-bold text-zinc-600">{p.date}</p>
                                                    </div>
                                                </div>
                                                <span className="text-sm font-black text-white">${p.amount.toLocaleString()}</span>
                                            </div>
                                        ))}
                                        {contract.payments.length === 0 && <div className="col-span-full py-12 text-center border-2 border-dashed border-white/5 rounded-3xl text-[9px] font-black text-zinc-700 uppercase italic">Suelte las fotos de los recibos para auditarlos</div>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeView === 'report' && report && (
                    <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="max-w-5xl mx-auto space-y-6">
                        <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-[3rem] space-y-10 relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-blue-500 to-amber-500" />
                            
                            <div className="text-center">
                                <h2 className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.5em] mb-4 italic">Auditoría Financiera Blis Corp - Abril 2026</h2>
                                <h3 className="text-5xl font-black text-white tracking-tighter uppercase italic">{contract.clientName}</h3>
                                {contract.promoterName && (
                                    <p className="text-[10px] font-medium text-zinc-500 mt-2">vs. {contract.promoterName}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="p-6 bg-black/60 border border-white/5 rounded-3xl text-center">
                                    <p className="text-[9px] font-black text-zinc-600 uppercase mb-2 tracking-widest">Abonado a la Fecha</p>
                                    <h4 className="text-3xl font-black text-white">${report.totalPaid.toLocaleString()}</h4>
                                </div>
                                <div className="p-6 bg-black/60 border border-white/5 rounded-3xl text-center border-t-emerald-500/40 border-t-2">
                                    <p className="text-[9px] font-black text-emerald-500 uppercase mb-2 tracking-widest">Meta Firma (50% + Cuotas)</p>
                                    <h4 className="text-3xl font-black text-white">${report.installmentsOwedToDate.toLocaleString()}</h4>
                                </div>
                                <div className="p-6 bg-black/60 border border-white/5 rounded-3xl text-center">
                                    <p className="text-[9px] font-black text-zinc-600 uppercase mb-2 tracking-widest">Proyección Cuotas (Dic 2026)</p>
                                    <h4 className="text-3xl font-black text-zinc-400">${report.projectedUntilDec2026.toLocaleString()}</h4>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-10 bg-emerald-500/5 border border-emerald-500/20 rounded-[3rem] text-center shadow-[0_0_60px_rgba(16,185,129,0.05)]">
                                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-4">Saldo Firma Escritura Final</p>
                                    <h4 className="text-6xl font-black text-white tracking-tighter">${report.balanceAtDeed.toLocaleString()}</h4>
                                    <p className="text-[8px] text-zinc-600 mt-4 uppercase font-bold tracking-widest italic italic">Monto proyectado para liquidación del lote</p>
                                </div>
                                <div className="p-10 bg-amber-500/5 border border-amber-500/30 rounded-[3rem] text-center shadow-[0_0_60px_rgba(245,158,11,0.1)] relative">
                                    <div className="absolute top-6 right-8 w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.5em] mb-4">Monto para Regularizar YA</p>
                                    <h4 className="text-7xl font-black text-white tracking-tighter drop-shadow-2xl">${report.pendingToRegularize.toLocaleString()}</h4>
                                    <div className="mt-8 flex items-center justify-center gap-3"><span className="text-[9px] font-black text-amber-500 uppercase tracking-widest italic italic">Requerido para Promesa de Compraventa</span></div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button onClick={() => window.print()} className="flex-1 py-6 bg-white text-black rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center justify-center gap-3">Descargar Reporte de Cliente</button>
                                <button onClick={async () => {
                                    await supabase.from('contract_reconciliation').insert([{
                                        lot_id: contract.lotId, client_name: contract.clientName, promoter_name: contract.promoterName,
                                        actual_balance_owed: report.pendingToRegularize,
                                        balance_due_deed: report.balanceAtDeed,
                                        projected_installments_dec2026: report.projectedUntilDec2026,
                                        status: 'reconciled'
                                    }]);
                                    alert('Expediente Guardado'); setActiveView('history');
                                }} className="p-6 bg-zinc-900 border border-white/10 rounded-3xl hover:border-emerald-500 transition-all"><Save size={24}/></button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeView === 'history' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {contractHistory.map(item => (
                            <div key={item.id} className="bg-[#0a0a0a] border border-white/5 p-6 rounded-[2rem] text-left hover:border-emerald-500/30 transition-all shadow-xl group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-2xl rounded-full" />
                                <div className="flex justify-between mb-5 relative z-10">
                                    <div className="p-3 bg-zinc-900 rounded-xl group-hover:bg-emerald-500/20 transition-colors"><Home size={20} className="text-emerald-500" /></div>
                                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{new Date(item.created_at).toLocaleDateString()}</span>
                                </div>
                                <h4 className="text-xl font-black text-white italic tracking-tighter">({item.lot_id} - {item.client_name})</h4>
                                <div className="mt-4 pt-4 border-t border-white/5 space-y-2 relative z-10">
                                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest flex justify-between">Deuda Regularización: <span className="text-amber-500 font-black">${item.actual_balance_owed.toLocaleString()}</span></p>
                                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest flex justify-between">A la Escritura: <span className="text-white font-black">${item.balance_due_deed.toLocaleString()}</span></p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
