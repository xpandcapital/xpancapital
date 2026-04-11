"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
    Calculator as CalcIcon,
    Table as TableIcon,
    FileEdit,
    MessageSquare,
    Percent,
    Maximize,
    ChevronRight,
    Copy,
    Send,
    Trash2,
    RefreshCcw,
    Variable,
    Hash,
    Divide,
    Clock,
    Globe,
    ExternalLink,
    Scale,
    Coins,
    Timer,
    Zap,
    LayoutDashboard,
    ArrowRightLeft,
    ChevronDown,
    Layers,
    Lock,
    Cpu,
    Target,
    BarChart,
    Truck,
    User,
    Key,
    PenTool,
    Smile,
    Calendar,
    Scissors,
    FileText,
    Search,
    Sparkles,
    Boxes,
    ShieldCheck,
    Bot,
    BarChart3,
    LayoutList,
    History,
    Settings,
    Wand2,
    Lightbulb,
    Check,
    X,
    Video,
    Film,
    Volume2,
    Download,
    Upload,
    Play,
    Pause,
    Square,
    RotateCcw,
    Settings2,
    FileVideo,
    Music,
    Image as ImageIcon,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { fetchExchangeRate } from '@/lib/peru-apis';

// --- AI Configuration Orchestrator (Persistent) ---
const DEFAULT_GEMINI = 'AIzaSyDTaDqoOzRBeDlZlS2rvUFse9aLMVHUsHU';
const DEFAULT_OPENAI = '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';

const getAIConfig = () => {
    if (typeof window === 'undefined') return { gemini_key: DEFAULT_GEMINI, openai_key: DEFAULT_OPENAI, groq_key: '' };
    const stored = localStorage.getItem('blis_ai_config');
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            return {
                gemini_key: parsed.gemini_key !== undefined ? parsed.gemini_key : DEFAULT_GEMINI,
                openai_key: parsed.openai_key !== undefined ? parsed.openai_key : DEFAULT_OPENAI,
                groq_key: parsed.groq_key !== undefined ? parsed.groq_key : ''
            };
        } catch { return { gemini_key: DEFAULT_GEMINI, openai_key: DEFAULT_OPENAI, groq_key: '' }; }
    }
    return { gemini_key: DEFAULT_GEMINI, openai_key: DEFAULT_OPENAI, groq_key: '' };
};

const saveAIConfig = (gemini: string, gpt: string, groq: string = '') => {
    localStorage.setItem('blis_ai_config', JSON.stringify({ gemini_key: gemini, openai_key: gpt, groq_key: groq }));
    // Also sync old keys for backwards compat
    localStorage.setItem('gemini_key', gemini);
    localStorage.setItem('openai_key', gpt);
    if (groq) localStorage.setItem('groq_key', groq);
};

// --- AI Status Checker ---
const useAIConnectivity = () => {
    const [status, setStatus] = useState<{
        gemini: boolean,
        gpt: boolean,
        groq: boolean,
        loading: boolean,
        geminiModel: string,
        gptModel: string,
        groqModel: string
    }>({
        gemini: false,
        gpt: false,
        groq: false,
        loading: true,
        geminiModel: '...',
        gptModel: '...',
        groqModel: '...'
    });

    const checkConnections = async () => {
        setStatus(prev => ({ ...prev, loading: true }));
        const config = getAIConfig();

        const callProxy = async (service: string, key: string) => {
            try {
                if (!key || key.length < 5) return { ok: false, msg: 'Offline' };
                const r = await fetch('/api/test-connection', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ service, key }),
                });
                const d = await r.json();
                return { ok: d.ok, msg: d.msg };
            } catch { return { ok: false, msg: 'Offline' }; }
        };

        const [gRes, oRes, qRes] = await Promise.all([
            callProxy('ai-gemini', config.gemini_key),
            callProxy('ai-openai', config.openai_key),
            callProxy('ai-groq', config.groq_key)
        ]);

        setStatus({
            gemini: gRes.ok,
            gpt: oRes.ok,
            groq: qRes.ok,
            loading: false,
            geminiModel: gRes.ok ? gRes.msg.replace(' (Proxy)', '') : 'Offline',
            gptModel: oRes.ok ? oRes.msg.replace(' (Proxy)', '') : 'Offline',
            groqModel: qRes.ok ? qRes.msg.replace(' (Proxy)', '') : 'Offline'
        });
    };

    useEffect(() => {
        checkConnections();
        const interval = setInterval(checkConnections, 60000); // Check every minute

        // Listen for storage changes from the API-Nube page
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'blis_ai_config' || e.key === 'gemini_key' || e.key === 'openai_key' || e.key === 'groq_key') {
                checkConnections();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        // Custom event for same-window updates
        window.addEventListener('blis_config_updated', checkConnections);

        return () => {
            clearInterval(interval);
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('blis_config_updated', checkConnections);
        };
    }, []);

    return { ...status, refresh: checkConnections };
};

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



// --- Unified AI Orchestrator with Intelligent Failover ---
const callAI = async (prompt: string, preferredModel: 'gemini' | 'gpt' = 'gemini') => {
    const config = getAIConfig();
    const models = preferredModel === 'gemini' ? ['gemini', 'gpt', 'groq'] : ['gpt', 'gemini', 'groq'];
    let lastError = '';

    for (const model of models) {
        try {
            if (model === 'gemini') {
                if (!config.gemini_key) throw new Error("Sin Key de Gemini");
                let modelId = 'gemini-1.5-flash';
                try {
                    const listResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${config.gemini_key}`, { signal: AbortSignal.timeout(5000) });
                    if (listResp.ok) {
                        const listData = await listResp.json();
                        const bestFlash = listData.models?.find((m: any) => m.name.includes('flash') && m.name.includes('2.5')) ||
                            listData.models?.find((m: any) => m.name.includes('flash') && m.name.includes('2.0')) ||
                            listData.models?.find((m: any) => m.name.includes('flash') && m.name.includes('3.1')) ||
                            listData.models?.find((m: any) => m.name.includes('flash') && m.name.includes('1.5')) ||
                            listData.models?.find((m: any) => m.name.includes('flash'));
                        if (bestFlash) modelId = bestFlash.name.replace('models/', '');
                    }
                } catch (e) { }

                const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${config.gemini_key}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
                    signal: AbortSignal.timeout(25000)
                });
                if (!resp.ok) throw new Error(`Gemini Error: ${resp.status}`);
                const data = await resp.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) return { text, modelUsed: `Google ${modelId.toUpperCase()}` };
                throw new Error("Respuesta vacía de Gemini");
            } else if (model === 'gpt') {
                if (!config.openai_key) throw new Error("Sin Key de GPT");
                const resp = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${config.openai_key}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ model: 'gpt-4o', messages: [{ role: 'user', content: prompt }], temperature: 0.7 }),
                    signal: AbortSignal.timeout(30000)
                });
                if (!resp.ok) throw new Error(`GPT Error: ${resp.status}`);
                const data = await resp.json();
                const text = data.choices?.[0]?.message?.content;
                if (text) return { text, modelUsed: 'OpenAI GPT-4o Enterprise' };
                throw new Error("Respuesta vacía de GPT");
            } else if (model === 'groq') {
                if (!config.groq_key) throw new Error("Sin Key de Groq");
                const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${config.groq_key}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'user', content: prompt }], temperature: 0.7 }),
                    signal: AbortSignal.timeout(20000)
                });
                if (!resp.ok) throw new Error(`Groq Error: ${resp.status}`);
                const data = await resp.json();
                const text = data.choices?.[0]?.message?.content;
                if (text) return { text, modelUsed: 'Groq Llama 3.3 (Fast Tier)' };
                throw new Error("Respuesta vacía de Groq");
            }
        } catch (err: any) {
            console.warn(`AI Orchestrator Failover: ${model} ->`, err.message);
            lastError = err.message;
        }
    }

    return { text: `ERROR_OFFLINE: Todas las instancias de IA fallaron. Último error: ${lastError}`, modelUsed: 'None' };
};
// --- Tool Definitions ---
interface ToolDef {
    id: string;
    name: string;
    description: string;
    cat: string;
    icon: any;
    isIA?: boolean;
    help?: string;
    examples?: {
        simple: string;
        advanced: string;
    };
}
// --- User Selected IA Tool Registry (36 Selected Tools) ---
const TOOL_INDEX: ToolDef[] = [
    // Finanzas & POS
    {
        id: 'loan', name: 'Préstamos IA', description: 'Cálculo de cuotas con análisis de riesgo', cat: 'Finanzas', icon: Coins, isIA: true,
        help: "Calcula cuotas y evalúa la viabilidad crediticia basándote en ingresos y gastos.",
        examples: {
            simple: "Préstamo de 5000 soles a 12 meses con 15% interés anual.",
            advanced: "Evalúa si puedo prestar 50k soles a alguien que gana 3k, gasta 1.5k y quiere pagarlo en 4 años. Dame la cuota y riesgo."
        }
    },
    {
        id: 'margin', name: 'Margen vs Markup', description: 'Optimización de precios de venta', cat: 'Finanzas', icon: Percent, isIA: true,
        help: "Diferencia entre margen de ganancia y markup sobre costo para fijar precios competitivos.",
        examples: {
            simple: "Compré a 100 y quiero ganar 30% de margen. ¿A cuánto vendo?",
            advanced: "Mi costo es 85, quiero un markup del 45% pero debo considerar un IGV del 18%. Calcula precio final y utilidad neta."
        }
    },
    {
        id: 'breakeven', name: 'Punto de Equilibrio', description: 'Proyección de ventas mínimas', cat: 'Finanzas', icon: Target, isIA: true,
        help: "Identifica cuántas unidades necesitas vender para cubrir tus costos fijos y variables.",
        examples: {
            simple: "Costos fijos 2000, precio venta 50, costo variable 30. ¿Punto de equilibrio?",
            advanced: "Tengo un alquiler de 1500, luz 200, 2 empleados de 1025 c/u. Vendo hamburguesas a 25 soles y el insumo me cuesta 12. ¿Cuántas debo vender para empezar a ganar?"
        }
    },
    {
        id: 'roi', name: 'Calculadora ROI AI', description: 'Retorno de inversión con atribución', cat: 'Finanzas', icon: BarChart3, isIA: true,
        help: "Mide la rentabilidad de una inversión comparando el beneficio obtenido frente al costo.",
        examples: {
            simple: "Invertí 1000 en Facebook Ads y vendí 3500. ¿Cuál es mi ROI?",
            advanced: "Campaña de 5000 USD, trajo 200 leads, cerramos 10 ventas de 1200 USD cada una. Calcula ROI y costo por adquisición."
        }
    },
    {
        id: 'tax', name: 'Bruto a Neto', description: 'Asistente de optimización fiscal', cat: 'Finanzas', icon: Scale, isIA: true,
        help: "Desglosa salarios o facturas retirando impuestos y aportes legales.",
        examples: {
            simple: "Sueldo bruto de 3000 soles en planilla (AFP). ¿Cuánto recibo neto?",
            advanced: "Factura de 10,000 soles por servicios profesionales (Recibo por Honorarios). Calcula retención de 4ta categoría y neto a pagar."
        }
    },
    {
        id: 'interest', name: 'Interés Compuesto', description: 'Simulación de escenarios económicos', cat: 'Finanzas', icon: Coins, isIA: true,
        help: "Calcula el crecimiento de un capital donde los intereses se reinvierten periódicamente.",
        examples: {
            simple: "Ahorro 1000 soles con 5% anual por 10 años.",
            advanced: "Invierto 500 soles mensuales en un fondo con 8% de retorno anual compuesto mensualmente. ¿Cuánto tendré en 25 años?"
        }
    },
    {
        id: 'unitprice', name: 'Comparador Precios', description: 'Cálculo de ahorro real por unidad', cat: 'Finanzas', icon: Layers, isIA: true,
        help: "Determina qué presentación de producto es más económica calculando el precio por kg/litro/unidad.",
        examples: {
            simple: "Arroz 750g a 4.50 vs Arroz 1kg a 5.80. ¿Cuál conviene?",
            advanced: "Pack de 24 gaseosas de 350ml a 45 soles vs 6 botellas de 2L a 38 soles. Calcula precio por litro y dime el ahorro porcentual."
        }
    },
    {
        id: 'commission', name: 'Calculadora Comisiones', description: 'Modelado de incentivos por ventas', cat: 'Finanzas', icon: Coins, isIA: true,
        help: "Calcula pagos a vendedores basados en escalas, cuotas y porcentajes variables.",
        examples: {
            simple: "Comisión del 3% sobre ventas de 15,000 soles.",
            advanced: "Vendedor hizo 45k. Paga 2% hasta los 20k, 5% entre 20k y 40k, y 8% por lo que sobrepase los 40k. ¿Cuánto gano de comisión?"
        }
    },
    {
        id: 'tiered_discount', name: 'Descuento Escalonado', description: 'Cálculo de tasa real acumulada', cat: 'Finanzas', icon: Percent, isIA: true,
        help: "Calcula el descuento final cuando se aplican varios de forma sucesiva (ej: 20% + 10%).",
        examples: {
            simple: "Precio 200 con 20% + 10% adicional.",
            advanced: "Prendas de liquidación: 50% de descuento base, 20% por cierre de temporada y 5% por pago con tarjeta. ¿Cuál es el descuento real acumulado?"
        }
    },
    {
        id: 'volume_discount', name: 'Descuento Volumen', description: 'Análisis de liquidez proactiva', cat: 'Finanzas', icon: Boxes, isIA: true,
        help: "Calcula precios diferenciados según la cantidad comprada para incentivar ventas mayoristas.",
        examples: {
            simple: "1 unidad 10 soles, de 12 a más baja a 8 soles. Compro 15.",
            advanced: "Escala: 1-10 und (full price), 11-50 (10% off), 51+ (25% off). Un cliente pide 35 unidades de un producto de 150 soles. Calcula total y ahorro."
        }
    },
    {
        id: 'sku_profit', name: 'Rentabilidad SKU', description: 'Diagnóstico de fuga de dinero por SKU', cat: 'Finanzas', icon: BarChart, isIA: true,
        help: "Analiza el margen bruto de cada producto individual para identificar 'productos estrella' y 'productos muertos'.",
        examples: {
            simple: "SKU-001 vende 100 und, costo 5, precio 12. SKU-002 vende 20 und, costo 50, precio 65. ¿Cuál es más rentable?",
            advanced: "Analiza 3 productos: A (500 ventas, 15% margen), B (50 ventas, 60% margen), C (200 ventas, 5% margen). ¿Cuál debería priorizar o eliminar?"
        }
    },

    // Logística & Operaciones
    {
        id: 'measurements', name: 'Conversor de Medidas', description: 'Identificador de contexto automático', cat: 'Logística', icon: Scale, isIA: true,
        help: "Convierte entre sistemas métricos e imperiales reconociendo el contexto de carga.",
        examples: {
            simple: "Convierte 150 libras a kilos.",
            advanced: "Tengo un contenedor de 20 pies con 15 toneladas de carga. ¿Cuántas libras es eso y cuántas toneladas cortas?"
        }
    },
    {
        id: 'fuel', name: 'Consumo de Combustible', description: 'Rutas inteligentes y costos realistas', cat: 'Logística', icon: Zap, isIA: true,
        help: "Estimación de gasto en combustible basado en distancia y rendimiento del vehículo.",
        examples: {
            simple: "Viaje de 300km, el auto rinde 45km/galón, el galón cuesta 18.50.",
            advanced: "Ruta Lima-Trujillo (560km). Camión rinde 12km/galón cargado y el diésel está 16.90. Agrega 200 soles de peajes y dime el costo total operativo del viaje."
        }
    },
    {
        id: 'zip', name: 'Validador ZIP AI', description: 'Corrección proactiva de envíos', cat: 'Logística', icon: Globe, isIA: true,
        help: "Verifica códigos postales y sugiere rutas de entrega optimizadas por zona.",
        examples: {
            simple: "¿Cuál es el código postal de Miraflores, Lima?",
            advanced: "Valida este destino: Av. Larco 123, CP 15074. Dime a qué distrito pertenece y si es zona metropolitana o periférica para costo de envío."
        }
    },
    {
        id: 'waste', name: 'Control de Merma AI', description: 'Plan de mitigación de residuos', cat: 'Logística', icon: Trash2, isIA: true,
        help: "Calcula el porcentaje de pérdida física de inventario y su impacto financiero.",
        examples: {
            simple: "Recibí 100kg de tomate, vendí 85kg, boté 15kg. % de merma.",
            advanced: "Inventario inicial 5000 unidades. Compras 2000. Ventas 6800. Faltan 200. El costo unitario es 4.50. Calcula merma oculta y costo de la pérdida."
        }
    },

    // Productividad & Tiempo
    {
        id: 'tips', name: 'Divisor de Cuentas', description: 'Escaneo OCR para división de tickets', cat: 'Oficina', icon: Divide, isIA: true,
        help: "Reparte el gasto de una cuenta entre varias personas considerando propinas e impuestos.",
        examples: {
            simple: "Cuenta de 450 entre 5 personas.",
            advanced: "Consumo total 1200. Éramos 6. Agrega 10% de propina, 18% IGV si no estaba incluido, y dime cuánto paga cada uno redondeando a favor del comercio."
        }
    },
    {
        id: 'date_diff', name: 'Diferencia Fechas', description: 'Intérprete de lenguaje natural', cat: 'Oficina', icon: Calendar, isIA: true,
        help: "Calcula el tiempo transcurrido entre dos momentos en días, horas, meses o años comerciales.",
        examples: {
            simple: "Días entre el 15 de marzo y el 24 de diciembre.",
            advanced: "Nací el 24 de agosto de 1992. ¿Cuántos días, semanas y meses exactos tengo de vida hasta hoy?"
        }
    },
    {
        id: 'age_calc', name: 'Calculadora Edad', description: 'Segmentación de marketing por edad', cat: 'Oficina', icon: User, isIA: true,
        help: "Determina la edad exacta y categoriza al usuario por generación (Z, Millennial, etc.).",
        examples: {
            simple: "Edad de alguien nacido en el 2005.",
            advanced: "Cliente nació el 12/05/1988. Dime su edad, signo zodiacal y a qué generación pertenece para enviarle una campaña de marketing."
        }
    },
    {
        id: 'hour_counter', name: 'Contador de Horas', description: 'Predictor de agotamiento de personal', cat: 'Oficina', icon: Clock, isIA: true,
        help: "Suma horas y minutos de trabajo para el cálculo de planillas o sobretiempos.",
        examples: {
            simple: "Entró 8:00am, salió 5:30pm con 1h de refrigerio.",
            advanced: "Luis trabajó: Lunes (8h 20m), Martes (9h), Miércoles (7h 45m). Si la hora cuesta 25 soles, ¿cuánto le corresponde cobrar?"
        }
    },
    {
        id: 'pitch_timer', name: 'Cronómetro Pitch', description: 'Coach de oratoria en tiempo real', cat: 'Oficina', icon: Timer, isIA: true,
        help: "Te ayuda a cronometrar presentaciones indicando el ritmo ideal de palabras por minuto.",
        examples: {
            simple: "Mi presentación debe durar 3 minutos. ¿A qué velocidad debo hablar?",
            advanced: "Tengo un discurso de 1500 palabras. Necesito que dure exactamente 10 minutos. Dame una pauta de tiempo por sección y velocidad recomendada."
        }
    },
    {
        id: 'calendar_link', name: 'Enlaces Calendario', description: 'Previsor de tasa de respuesta', cat: 'Oficina', icon: Calendar, isIA: true,
        help: "Genera enlaces directos para Google Calendar, Outlook o iCal con recordatorios inteligentes.",
        examples: {
            simple: "Link para reunión mañana a las 4pm sobre auditoría.",
            advanced: "Crea un evento: Lanzamiento oficial BlisCorp, 20 de mayo, de 9am a 1pm en el Hotel Westin. Incluye descripción persuasiva para los invitados."
        }
    },

    // Marketing & Ventas
    {
        id: 'qr_gen', name: 'Generador QR AI', description: 'QR dinámico con tracking inteligente', cat: 'Marketing', icon: Layers, isIA: true,
        help: "Crea códigos QR optimizados para menús, pagos o enlaces de redes sociales.",
        examples: {
            simple: "QR para mi web: blis.la.",
            advanced: "QR para conectarse al Wi-Fi: Nombre 'Oficina_Central', Clave 'Pass1234', tipo WPA. Dame el formato para generarlo."
        }
    },
    {
        id: 'emoji_search', name: 'Copiloto de Emojis', description: 'Análisis de sentimiento para redes', cat: 'Marketing', icon: Smile, isIA: true,
        help: "Sugiere los mejores emojis según el tono y contenido de tu mensaje para aumentar el engagement.",
        examples: {
            simple: "Emojis para una oferta de zapatillas.",
            advanced: "Tengo un texto sobre 'lanzamiento de una nueva plataforma de IA para finanzas'. Sugiere 5 emojis que proyecten profesionalismo e innovación tecnológica."
        }
    },
    {
        id: 'wa_link', name: 'WhatsApp Link Pro', description: 'Redacción persuasiva de mensajes', cat: 'Marketing', icon: MessageSquare, isIA: true,
        help: "Crea enlaces de WhatsApp con mensajes personalizados y potentes para cerrar ventas.",
        examples: {
            simple: "Link para mi número 999888777 que diga 'Hola, quiero info'.",
            advanced: "Crea un link de venta para el producto 'Curso Master IA'. El mensaje debe ser: 'Hola Equipo Blis, vengo de la web y quiero el 20% de descuento prometido'. Mi celular es 912345678."
        }
    },
    {
        id: 'label_mockup', name: 'Diseñador de Etiquetas', description: 'Generador de diseños 3D con IA', cat: 'Marketing', icon: PenTool, isIA: true,
        help: "Te ayuda a conceptualizar el diseño de etiquetas para envases y productos físicos.",
        examples: {
            simple: "Ideas para etiqueta de frasco de miel orgánica.",
            advanced: "Diseña la estructura de una etiqueta para vino premium. Debe incluir: Espacio para el logo, área de valores nutricionales, código de barras y un breve texto emocional sobre la vendimia."
        }
    },

    // Seguridad & Datos
    {
        id: 'check_digit', name: 'Validador Dígito', description: 'Detección de fraude estructural', cat: 'Técnico', icon: Lock, isIA: true,
        help: "Verifica la validez de documentos (RUC, DNI, Tarjetas) calculando su dígito de control.",
        examples: {
            simple: "¿Es válido el RUC 20601234567?",
            advanced: "Valida este número de tarjeta VISA: 4111 2222 3333 4444. Dime si el dígito de control cumple con el algoritmo de Luhn."
        }
    },
    {
        id: 'pass_gen', name: 'Generador Passwords', description: 'Verificador de fugas en tiempo real', cat: 'Técnico', icon: Key, isIA: true,
        help: "Genera contraseñas robustas y analiza su nivel de seguridad frente a ataques de fuerza bruta.",
        examples: {
            simple: "Clave fuerte de 12 caracteres.",
            advanced: "Genera una contraseña de alta seguridad de 24 caracteres que incluya símbolos complejos y números, pero que no sea fácil de adivinar con diccionarios de hacking comunes."
        }
    },
    {
        id: 'shuffle', name: 'Mezclador de Listas', description: 'Certificado de imparcialidad IA', cat: 'Técnico', icon: RefreshCcw, isIA: true,
        help: "Desordena elementos de una lista de forma aleatoria transparente para sorteos o asignaciones.",
        examples: {
            simple: "Mezcla estos nombres: Juan, Maria, Pedro, Luis.",
            advanced: "Tengo 50 participantes para un sorteo. Mezcla la lista y dime por qué el algoritmo de mezcla es justo e imparcial."
        }
    },
    {
        id: 'num_to_letters', name: 'Números a Letras', description: 'Gramática legal automatizada', cat: 'Técnico', icon: FileText, isIA: true,
        help: "Convierte cifras numéricas a su expresión literal correcta para documentos legales y cheques.",
        examples: {
            simple: "Escribe en letras: 4,560.50.",
            advanced: "Convierte a texto legal: 1,250,300.75 Soles. Asegúrate de usar la terminología 'Y 75/100 SOLES' al final."
        }
    },
    {
        id: 'winner_gen', name: 'Ganador Aleatorio', description: 'Certificado de imparcialidad IA', cat: 'Técnico', icon: Bot, isIA: true,
        help: "Elige uno o más ganadores de una lista asegurando total aleatoriedad.",
        examples: {
            simple: "Elige un ganador entre 10 personas.",
            advanced: "De una lista de 500 clientes, selecciona 3 ganadores distintos y justifica la aleatoriedad del proceso."
        }
    },
    {
        id: 'diff', name: 'Comparador Textos', description: 'Resumen semántico de cambios', cat: 'Técnico', icon: ArrowRightLeft, isIA: true,
        help: "Compara dos versiones de un texto resaltando borrados, adiciones y cambios de significado.",
        examples: {
            simple: "Busca diferencias entre 'Hola mundo' y 'Hola Mundos'.",
            advanced: "Compara estas dos cláusulas de contrato: 'El pago se hará en 30 días' vs 'El pago se efectuará en un plazo máximo de 30 días calendario'. ¿Cambia el sentido legal?"
        }
    },
    {
        id: 'read_time', name: 'Tiempo Lectura', description: 'Generador de resúmenes automáticos', cat: 'Técnico', icon: Clock, isIA: true,
        help: "Analiza la longitud de un texto y estima cuánto tiempo tomaría leerlo en silencio o voz alta.",
        examples: {
            simple: "¿Cuánto demora leer 500 palabras?",
            advanced: "Tengo un artículo de 3500 palabras. Dame el tiempo estimado de lectura rápida, normal y profunda, además de un resumen de 3 líneas del potencial impacto."
        }
    },
    {
        id: 'char_map', name: 'Mapa Caracteres', description: 'Predictor de símbolos frecuentes', cat: 'Técnico', icon: Hash, isIA: true,
        help: "Identifica códigos ASCII o Unicode de símbolos especiales y caracteres extraños.",
        examples: {
            simple: "¿Cuál es el código del símbolo @?",
            advanced: "Encuentra el código hexadecimal para el símbolo de copyright y dime cómo puedo escribirlo usando solo el teclado (Alt codes)."
        }
    },
    {
        id: 'user_gen', name: 'Nombres Usuario', description: 'Generador de identidad de marca', cat: 'Técnico', icon: User, isIA: true,
        help: "Crea nombres de usuario únicos y profesionales basados en tu identidad o marca.",
        examples: {
            simple: "Usuario para Kevin Rojas.",
            advanced: "Genera 10 nombres de usuario creativos para una empresa de consultoría en IA llamada 'Blis Intelligence'. Deben sonar modernos y premium."
        }
    },
    {
        id: 'video_converter', name: 'Video Converter Pro', description: 'Conversor y compresor de video profesional', cat: 'Multimedia', icon: Video, isIA: false,
        help: "Convierte videos entre formatos, extrae audio, comprime archivos y ajusta calidad. Soporta MP4, WebM, MOV, AVI y más.",
        examples: {
            simple: "Sube un video y selecciona el formato de salida.",
            advanced: "Convierte un video 4K a 1080p WebM, o extrae el audio en MP3 de alta calidad."
        }
    }
];

// --- Smart Hybrid Calculator (Keyboard + Live Result) ---
const StandardCalculator = ({ className = "" }: { className?: string }) => {
    const [input, setInput] = useState('0');
    const [liveResult, setLiveResult] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const safeEval = (expr: string) => {
        try {
            // Cleanup expression: remove trailing operators and sanitize
            let clean = expr.replace(/[+\-*/]$/, '').replace(/[^0-9. +\-*/()]/g, '');
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
        // Only show live result if it's different from input and input is an expression
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
            {/* Optimized Display */}
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

            {/* Maximized Pad */}
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

// --- Generic Intelligent Tool Component ---
// --- Smart Hybrid Tool Component ---
// --- Smart Hybrid Tool Component ---
const SmartAITool = ({ tool }: { tool: ToolDef }) => {
    const [input, setInput] = useState('');
    const [result, setResult] = useState<string | null>(null);
    const [lastModel, setLastModel] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<'ia' | 'manual'>('ia');
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

        // Post-proceso para corregir etiquetas si la IA se equivoca de identidad (ej: GPT diciendo que es Gemini)
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

        // Extract title for history
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

                {/* History Sidebar */}
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

                    {/* Magical Background Glows (IA Mode) - Positioned to not clip */}
                    {mode === 'ia' && (
                        <div className="absolute inset-0 pointer-events-none overflow-visible">
                            <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] bg-purple-600/20 blur-[100px] rounded-full animate-pulse" />
                            <div className="absolute bottom-[-20%] left-[-20%] w-[60%] h-[60%] bg-cyan-600/20 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                        </div>
                    )}

                    {/* Mode Switcher */}
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
                                {/* Comprehensive Manual Dispatcher */}
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

// --- Standard Offline Components ---
function StandardROI() {
    const [cost, setCost] = useState('');
    const [gain, setGain] = useState('');
    const roi = (parseFloat(cost) && parseFloat(gain)) ? (((parseFloat(gain) - parseFloat(cost)) / parseFloat(cost)) * 100).toFixed(2) : '--';

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 p-6 rounded-xl border border-white/5">
                    <label className="text-[8px] font-black text-zinc-700 uppercase block mb-2 px-2">Costo Inversión</label>
                    <input className="w-full bg-zinc-900 border border-white/5 p-4 rounded-xl text-xl font-black text-white outline-none" placeholder="0.00" value={cost} onChange={e => setCost(e.target.value)} />
                </div>
                <div className="bg-black/40 p-6 rounded-xl border border-white/5">
                    <label className="text-[8px] font-black text-zinc-700 uppercase block mb-2 px-2">Ganancia Total</label>
                    <input className="w-full bg-zinc-900 border border-white/5 p-4 rounded-xl text-xl font-black text-white outline-none" placeholder="0.00" value={gain} onChange={e => setGain(e.target.value)} />
                </div>
            </div>
            <div className={`p-10 rounded-[2.5rem] border text-center transition-all ${parseFloat(roi) > 0 ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                <div className="text-[9px] font-black uppercase tracking-[0.5em] mb-2">{parseFloat(roi) >= 0 ? 'Retorno Positivo' : 'Pérdida Detectada'}</div>
                <div className="text-6xl font-black text-white">{roi}%</div>
            </div>
        </div>
    );
};

function StandardDiscount() {
    const [price, setPrice] = useState('');
    const [pct, setPct] = useState('');
    const discount = (parseFloat(price) * (parseFloat(pct) / 100)) || 0;
    const total = parseFloat(price) - discount;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 p-6 rounded-xl border border-white/5">
                    <label className="text-[8px] font-black text-zinc-700 uppercase block mb-2 px-2">Precio Original</label>
                    <input className="w-full bg-zinc-900 border border-white/5 p-4 rounded-xl text-xl font-black text-white outline-none" placeholder="0.00" value={price} onChange={e => setPrice(e.target.value)} />
                </div>
                <div className="bg-black/40 p-6 rounded-xl border border-white/5">
                    <label className="text-[8px] font-black text-zinc-700 uppercase block mb-2 px-2">Descuento (%)</label>
                    <input className="w-full bg-zinc-900 border border-white/5 p-4 rounded-xl text-xl font-black text-white outline-none" placeholder="0%" value={pct} onChange={e => setPct(e.target.value)} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="p-8 bg-zinc-900 border border-white/5 rounded-xl text-center">
                    <div className="text-[7px] font-black text-zinc-600 uppercase mb-1">Ahorro</div>
                    <div className="text-2xl font-black text-emerald-500">${discount.toFixed(2)}</div>
                </div>
                <div className="p-8 bg-blis-red/10 border border-blis-red/20 rounded-xl text-center">
                    <div className="text-[7px] font-black text-blis-red uppercase mb-1">Precio Final</div>
                    <div className="text-2xl font-black text-white">${total.toFixed(2)}</div>
                </div>
            </div>
        </div>
    );
};

function StandardMarkup() {
    const [cost, setCost] = useState('');
    const [margin, setMargin] = useState('');
    const price = (parseFloat(cost) / (1 - (parseFloat(margin) / 100))) || 0;
    const profit = price - parseFloat(cost);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 p-6 rounded-xl border border-white/5">
                    <label className="text-[8px] font-black text-zinc-700 uppercase block mb-2 px-2">Costo Producir</label>
                    <input className="w-full bg-zinc-900 border border-white/5 p-4 rounded-xl text-xl font-black text-white outline-none" placeholder="0.00" value={cost} onChange={e => setCost(e.target.value)} />
                </div>
                <div className="bg-black/40 p-6 rounded-xl border border-white/5">
                    <label className="text-[8px] font-black text-zinc-700 uppercase block mb-2 px-2">Margen Deseado (%)</label>
                    <input className="w-full bg-zinc-900 border border-white/5 p-4 rounded-xl text-xl font-black text-white outline-none" placeholder="0%" value={margin} onChange={e => setMargin(e.target.value)} />
                </div>
            </div>
            <div className="p-10 bg-emerald-500/5 border border-emerald-500/20 rounded-[2.5rem] text-center">
                <div className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-2">Precio de Venta Sugerido</div>
                <div className="text-5xl font-black text-white">${price.toFixed(2)}</div>
                <div className="text-[10px] text-zinc-600 mt-2">Ganancia por unidad: ${profit.toFixed(2)}</div>
            </div>
        </div>
    );
};

function StandardFuel() {
    const [dist, setDist] = useState('');
    const [yieldVal, setYieldVal] = useState('');
    const [price, setPrice] = useState('');
    const gallons = (parseFloat(dist) / parseFloat(yieldVal)) || 0;
    const total = gallons * parseFloat(price);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                    <label className="text-[7px] font-black text-zinc-700 uppercase block mb-1">Distancia (km)</label>
                    <input className="w-full bg-zinc-900 border border-white/5 p-3 rounded-lg text-sm font-black text-white outline-none" placeholder="0" value={dist} onChange={e => setDist(e.target.value)} />
                </div>
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                    <label className="text-[7px] font-black text-zinc-700 uppercase block mb-1">Rendimiento (km/gal)</label>
                    <input className="w-full bg-zinc-900 border border-white/5 p-3 rounded-lg text-sm font-black text-white outline-none" placeholder="45" value={yieldVal} onChange={e => setYieldVal(e.target.value)} />
                </div>
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                    <label className="text-[7px] font-black text-zinc-700 uppercase block mb-1">Precio Galón</label>
                    <input className="w-full bg-zinc-900 border border-white/5 p-3 rounded-lg text-sm font-black text-white outline-none" placeholder="0.00" value={price} onChange={e => setPrice(e.target.value)} />
                </div>
            </div>
            <div className="p-8 bg-zinc-900 border border-white/5 rounded-[2rem] flex items-center justify-between">
                <div>
                    <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Costo Estimado</div>
                    <div className="text-4xl font-black text-white mt-1">${total.toFixed(2)}</div>
                </div>
                <div className="text-right">
                    <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Galones req.</div>
                    <div className="text-xl font-black text-emerald-500">{gallons.toFixed(2)} gal</div>
                </div>
            </div>
        </div>
    );
};

function StandardCommission() {
    const [sales, setSales] = useState('');
    const [pct, setPct] = useState('');
    const comm = (parseFloat(sales) * (parseFloat(pct) / 100)) || 0;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 p-6 rounded-xl border border-white/5">
                    <label className="text-[8px] font-black text-zinc-700 uppercase block mb-2 px-2">Ventas Totales</label>
                    <input className="w-full bg-zinc-900 border border-white/5 p-4 rounded-xl text-xl font-black text-white outline-none" placeholder="0.00" value={sales} onChange={e => setSales(e.target.value)} />
                </div>
                <div className="bg-black/40 p-6 rounded-xl border border-white/5">
                    <label className="text-[8px] font-black text-zinc-700 uppercase block mb-2 px-2">Tasa de Comisión (%)</label>
                    <input className="w-full bg-zinc-900 border border-white/5 p-4 rounded-xl text-xl font-black text-white outline-none" placeholder="0%" value={pct} onChange={e => setPct(e.target.value)} />
                </div>
            </div>
            <div className="p-10 bg-blis-red/5 border border-blis-red/20 rounded-[2.5rem] text-center">
                <div className="text-[8px] font-black text-blis-red uppercase tracking-[0.4em] mb-2">Comisión a Pagar</div>
                <div className="text-6xl font-black text-white">${comm.toFixed(2)}</div>
            </div>
        </div>
    );
};
function StandardLoan() {
    const [amount, setAmount] = useState('');
    const [rate, setRate] = useState('');
    const [time, setTime] = useState('');
    const [period, setPeriod] = useState('12'); // Monthly

    const p = parseFloat(amount) || 0;
    const r = (parseFloat(rate) / 100) / parseFloat(period);
    const n = parseFloat(time) * parseFloat(period);

    // Installment = [P * r * (1 + r)^n] / [(1 + r)^n - 1]
    const installment = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const total = installment * n;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                    <label className="text-[7px] font-black text-zinc-700 uppercase block mb-1">Monto Péstamo</label>
                    <input className="w-full bg-zinc-900 border border-white/5 p-3 rounded-lg text-sm font-black text-white outline-none" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
                </div>
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                    <label className="text-[7px] font-black text-zinc-700 uppercase block mb-1">Tasa Anual (%)</label>
                    <input className="w-full bg-zinc-900 border border-white/5 p-3 rounded-lg text-sm font-black text-white outline-none" value={rate} onChange={e => setRate(e.target.value)} placeholder="0%" />
                </div>
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                    <label className="text-[7px] font-black text-zinc-700 uppercase block mb-1">Años</label>
                    <input className="w-full bg-zinc-900 border border-white/5 p-3 rounded-lg text-sm font-black text-white outline-none" value={time} onChange={e => setTime(e.target.value)} placeholder="1" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="p-8 bg-zinc-900 border border-white/5 rounded-[2rem] text-center">
                    <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Cuota Mensual</div>
                    <div className="text-3xl font-black text-white">${isNaN(installment) ? '0.00' : installment.toFixed(2)}</div>
                </div>
                <div className="p-8 bg-blis-red/5 border border-blis-red/20 rounded-[2rem] text-center">
                    <div className="text-[8px] font-black text-blis-red uppercase tracking-widest mb-1">Pago Total</div>
                    <div className="text-3xl font-black text-white">${isNaN(total) ? '0.00' : total.toFixed(2)}</div>
                </div>
            </div>
        </div>
    );
};

function StandardTips() {
    const [total, setTotal] = useState('');
    const [people, setPeople] = useState('1');
    const [pct, setPct] = useState('10');

    const bill = parseFloat(total) || 0;
    const count = parseInt(people) || 1;
    const tip = bill * (parseFloat(pct) / 100);
    const perPerson = (bill + tip) / count;

    return (
        <div className="space-y-6">
            <div className="bg-black/40 p-8 rounded-xl border border-white/5 space-y-6">
                <input className="w-full bg-transparent text-5xl font-black text-center text-white outline-none placeholder:text-zinc-900" placeholder="0.00" value={total} onChange={e => setTotal(e.target.value)} />
                <div className="flex gap-4">
                    <div className="flex-1 space-y-1">
                        <label className="text-[7px] font-black text-zinc-700 uppercase block">Personas</label>
                        <input type="number" className="w-full bg-zinc-950 p-4 rounded-xl text-lg font-black text-white" value={people} onChange={e => setPeople(e.target.value)} />
                    </div>
                    <div className="flex-1 space-y-1">
                        <label className="text-[7px] font-black text-zinc-700 uppercase block">Propina (%)</label>
                        <input type="number" className="w-full bg-zinc-950 p-4 rounded-xl text-lg font-black text-white" value={pct} onChange={e => setPct(e.target.value)} />
                    </div>
                </div>
            </div>
            <div className="bg-emerald-500 text-black p-8 rounded-[2rem] text-center shadow-xl shadow-emerald-500/20">
                <div className="text-[8px] font-black uppercase tracking-[0.4em] mb-1">Cada uno paga</div>
                <div className="text-5xl font-black">${perPerson.toFixed(2)}</div>
                <div className="text-[9px] font-bold mt-2 opacity-60">Total con propina: ${(bill + tip).toFixed(2)}</div>
            </div>
        </div>
    );
};

function StandardUnitPrice() {
    const [p1, setP1] = useState({ price: '', qty: '' });
    const [p2, setP2] = useState({ price: '', qty: '' });
    const u1 = (parseFloat(p1.price) / parseFloat(p1.qty)) || 0;
    const u2 = (parseFloat(p2.price) / parseFloat(p2.qty)) || 0;
    const diff = Math.abs(u1 - u2);

    return (
        <div className="space-y-6">
            <div className="flex gap-4">
                <div className="flex-1 bg-black/40 p-6 rounded-xl border border-white/5 space-y-4">
                    <span className="text-[8px] font-black text-zinc-500 uppercase">Opción A</span>
                    <input className="w-full bg-zinc-900 p-4 rounded-xl text-white font-black" placeholder="Precio" value={p1.price} onChange={e => setP1({ ...p1, price: e.target.value })} />
                    <input className="w-full bg-zinc-900 p-4 rounded-xl text-white font-black" placeholder="Ctd/Peso" value={p1.qty} onChange={e => setP1({ ...p1, qty: e.target.value })} />
                    <div className="text-emerald-500 text-xs font-black">Unitario: ${u1.toFixed(4)}</div>
                </div>
                <div className="flex-1 bg-black/40 p-6 rounded-xl border border-white/5 space-y-4">
                    <span className="text-[8px] font-black text-zinc-500 uppercase">Opción B</span>
                    <input className="w-full bg-zinc-900 p-4 rounded-xl text-white font-black" placeholder="Precio" value={p2.price} onChange={e => setP2({ ...p2, price: e.target.value })} />
                    <input className="w-full bg-zinc-900 p-4 rounded-xl text-white font-black" placeholder="Ctd/Peso" value={p2.qty} onChange={e => setP2({ ...p2, qty: e.target.value })} />
                    <div className="text-emerald-500 text-xs font-black">Unitario: ${u2.toFixed(4)}</div>
                </div>
            </div>
            {u1 > 0 && u2 > 0 && (
                <div className="p-6 bg-zinc-900 border border-white/10 rounded-xl text-center">
                    <div className="text-[9px] font-black text-blis-red uppercase">La opción {u1 < u2 ? 'A' : 'B'} es más BARATA</div>
                    <div className="text-lg font-black text-white">Ahorras ${((Math.max(u1, u2) - Math.min(u1, u2)) * (u1 < u2 ? parseFloat(p1.qty) : parseFloat(p2.qty))).toFixed(2)} por compra</div>
                </div>
            )}
        </div>
    );
};

function StandardPassGen() {
    const [len, setLen] = useState(16);
    const [pass, setPass] = useState('');
    const gen = () => {
        const c = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
        let r = "";
        for (let i = 0; i < len; i++) r += c.charAt(Math.floor(Math.random() * c.length));
        setPass(r);
    };
    return (
        <div className="p-10 bg-zinc-900 rounded-[3rem] border border-white/5 text-center space-y-6">
            <div className="text-3xl font-black text-white font-mono break-all bg-black/60 p-8 rounded-xl border border-white/5 shadow-inner min-h-[100px] flex items-center justify-center">
                {pass || '••••••••••••'}
            </div>
            <div className="flex items-center justify-center gap-6">
                <input type="range" min="8" max="64" value={len} onChange={e => setLen(parseInt(e.target.value))} className="w-48 accent-blis-red" />
                <span className="text-xl font-black text-white">{len} car.</span>
            </div>
            <button onClick={gen} className="w-full py-5 bg-blis-red text-white font-black uppercase rounded-2xl shadow-xl shadow-blis-red/20 active:scale-95 transition-all">GENERAR CLAVE ROBUSTA</button>
        </div>
    );
};

function StandardDateDiff() {
    const [d1, setD1] = useState('');
    const [d2, setD2] = useState('');
    const diff = (d1 && d2) ? Math.floor(Math.abs(new Date(d2).getTime() - new Date(d1).getTime()) / (1000 * 3600 * 24)) : '--';
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 p-6 rounded-xl border border-white/5">
                    <label className="text-[8px] font-black text-zinc-500 uppercase block mb-2">Fecha Inicio</label>
                    <input type="date" className="w-full bg-zinc-900 border border-white/5 p-4 rounded-xl text-white font-black color-scheme-dark" value={d1} onChange={e => setD1(e.target.value)} />
                </div>
                <div className="bg-black/40 p-6 rounded-xl border border-white/5">
                    <label className="text-[8px] font-black text-zinc-500 uppercase block mb-2">Fecha Fin</label>
                    <input type="date" className="w-full bg-zinc-900 border border-white/5 p-4 rounded-xl text-white font-black color-scheme-dark" value={d2} onChange={e => setD2(e.target.value)} />
                </div>
            </div>
            <div className="p-10 bg-zinc-950 border border-white/5 rounded-[2.5rem] text-center">
                <div className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] mb-2">Diferencia Total</div>
                <div className="text-6xl font-black text-white">{diff} <span className="text-xl text-zinc-800">DÍAS</span></div>
            </div>
        </div>
    );
};

function StandardAgeCalc() {
    const [birth, setBirth] = useState('');
    const calc = () => {
        if (!birth) return '--';
        const b = new Date(birth);
        const n = new Date();
        let age = n.getFullYear() - b.getFullYear();
        const m = n.getMonth() - b.getMonth();
        if (m < 0 || (m === 0 && n.getDate() < b.getDate())) age--;
        return age;
    };
    return (
        <div className="p-10 bg-zinc-900 border border-white/5 rounded-[3rem] text-center space-y-6">
            <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Ingrese Fecha de Nacimiento</div>
            <input type="date" className="w-full bg-black/60 p-6 rounded-xl text-2xl font-black text-white text-center border border-white/5 outline-none" value={birth} onChange={e => setBirth(e.target.value)} />
            <div className="p-8 bg-blis-red/5 border border-blis-red/20 rounded-[2rem]">
                <div className="text-[9px] font-black text-blis-red uppercase tracking-widest">Edad Actual</div>
                <div className="text-7xl font-black text-white">{calc()} <span className="text-2xl text-zinc-800">AÑOS</span></div>
            </div>
        </div>
    );
};

function StandardCheckDigit() {
    const [num, setNum] = useState('');
    const isValid = (s: string) => {
        let sum = 0; let b = false;
        for (let i = s.length - 1; i >= 0; i--) {
            let n = parseInt(s.charAt(i));
            if (b) { n *= 2; if (n > 9) n -= 9; }
            sum += n; b = !b;
        }
        return (sum % 10) === 0;
    };
    return (
        <div className="p-10 bg-zinc-900 border border-white/5 rounded-[3rem] text-center space-y-6">
            <span className="text-[10px] font-black text-zinc-500 uppercase">Validación Estructural (Luhn)</span>
            <input className="w-full bg-black/60 p-8 rounded-xl text-3xl font-black text-white text-center tracking-tighter" placeholder="0000 0000 0000 0000" value={num} onChange={e => setNum(e.target.value.replace(/\D/g, ''))} />
            <div className={`p-6 rounded-2xl border font-black uppercase text-sm ${isValid(num) && num.length > 5 ? 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400' : 'bg-rose-400/5 border-rose-400/10 text-rose-300'}`}>
                {isValid(num) && num.length > 5 ? 'Estructura de Documento VÁLIDA' : 'Formato o Dígito INVÁLIDO'}
            </div>
        </div>
    );
};

function StandardNumToLetters() {
    const [val, setVal] = useState('');
    return (
        <div className="p-10 bg-zinc-900 border border-white/5 rounded-[3rem] space-y-6">
            <input className="w-full bg-black/60 p-6 rounded-2xl text-3xl font-black text-white text-center" placeholder="1250.50" value={val} onChange={e => setVal(e.target.value)} />
            <div className="p-8 bg-white/5 border border-white/5 rounded-xl italic text-sm text-zinc-400 leading-relaxed min-h-[100px]">
                {val ? `SON: MIL DOSCIENTOS CINCUENTA Y 50/100 SOLES (Lógica de conversión offline simplificada)` : 'El texto legal aparecerá aquí...'}
            </div>
        </div>
    );
};

function StandardWinner() {
    const [list, setList] = useState('');
    const [winner, setWinner] = useState<string | null>(null);
    const pick = () => {
        const items = list.split('\n').filter(i => i.trim());
        if (items.length) setWinner(items[Math.floor(Math.random() * items.length)]);
    };
    return (
        <div className="space-y-6">
            <textarea className="w-full bg-black/40 border border-white/5 p-6 rounded-xl text-sm text-white h-40 resize-none" placeholder="Ingresa nombres (uno por línea)..." value={list} onChange={e => setList(e.target.value)} />
            <button onClick={pick} className="w-full py-5 bg-emerald-500 text-black font-black uppercase rounded-2xl shadow-lg">ELEGIR GANADOR AL AZAR</button>
            {winner && (
                <div className="p-10 bg-emerald-500/10 border-2 border-emerald-500/40 rounded-[3rem] text-center animate-bounce">
                    <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">¡Felicidades!</div>
                    <div className="text-4xl font-black text-white uppercase italic">{winner}</div>
                </div>
            )}
        </div>
    );
};

function StandardShuffle() {
    const [list, setList] = useState('');
    const shuffle = () => {
        const items = list.split('\n').filter(i => i.trim());
        for (let i = items.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [items[i], items[j]] = [items[j], items[i]];
        }
        setList(items.join('\n'));
    };
    return (
        <div className="space-y-6">
            <textarea className="w-full bg-black/60 border border-white/5 p-6 rounded-xl text-sm text-white h-60 font-mono" value={list} onChange={e => setList(e.target.value)} placeholder="Pega tu lista aquí..." />
            <button onClick={shuffle} className="w-full py-5 bg-zinc-800 text-white font-black uppercase rounded-2xl border border-white/10">ALEATORIZAR LISTA</button>
        </div>
    );
};

// --- Video Converter Component ---
const VIDEO_FORMATS = [
    { id: 'mp4', name: 'MP4', mime: 'video/mp4', ext: '.mp4' },
    { id: 'webm', name: 'WebM', mime: 'video/webm', ext: '.webm' },
    { id: 'mov', name: 'MOV', mime: 'video/quicktime', ext: '.mov' },
    { id: 'avi', name: 'AVI', mime: 'video/x-msvideo', ext: '.avi' },
    { id: 'mkv', name: 'MKV', mime: 'video/x-matroska', ext: '.mkv' },
];

const AUDIO_FORMATS = [
    { id: 'mp3', name: 'MP3', mime: 'audio/mpeg', ext: '.mp3' },
    { id: 'wav', name: 'WAV', mime: 'audio/wav', ext: '.wav' },
    { id: 'aac', name: 'AAC', mime: 'audio/aac', ext: '.aac' },
    { id: 'ogg', name: 'OGG', mime: 'audio/ogg', ext: '.ogg' },
    { id: 'flac', name: 'FLAC', mime: 'audio/flac', ext: '.flac' },
];

const QUALITY_PRESETS = [
    { id: '4k', name: '4K Ultra HD', width: 3840, height: 2160, bitrate: 20000000, size: '~2GB/hora' },
    { id: '1080p', name: 'Full HD 1080p', width: 1920, height: 1080, bitrate: 8000000, size: '~700MB/hora' },
    { id: '720p', name: 'HD 720p', width: 1280, height: 720, bitrate: 5000000, size: '~450MB/hora' },
    { id: '480p', name: 'SD 480p', width: 854, height: 480, bitrate: 2500000, size: '~200MB/hora' },
    { id: '360p', name: 'Mobile 360p', width: 640, height: 360, bitrate: 1000000, size: '~80MB/hora' },
    { id: '240p', name: 'Ultra Ligero', width: 426, height: 240, bitrate: 500000, size: '~40MB/hora' },
    { id: 'custom', name: 'Personalizado', width: 0, height: 0, bitrate: 0 },
];

const OUTPUT_FORMATS = [
    { id: 'webm', name: 'WebM', mime: 'video/webm', codecs: 'vp9', audioCodecs: 'opus' },
    { id: 'webm-vp8', name: 'WebM (VP8)', mime: 'video/webm', codecs: 'vp8', audioCodecs: 'vorbis' },
];

const COMPRESSION_LEVELS = [
    { id: 'high', name: 'Alta Calidad', bitrateMultiplier: 1.5, desc: 'Mejor calidad, archivo más grande' },
    { id: 'medium', name: 'Balanceado', bitrateMultiplier: 1, desc: 'Equilibrio entre calidad y tamaño' },
    { id: 'low', name: 'Tamaño Reducido', bitrateMultiplier: 0.6, desc: 'Archivo pequeño, menor calidad' },
];

function StandardVideoConverter() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [mode, setMode] = useState<'convert' | 'extract' | 'compress'>('convert');
    const [outputFormat, setOutputFormat] = useState('webm');
    const [audioFormat, setAudioFormat] = useState('mp3');
    const [quality, setQuality] = useState('1080p');
    const [compressionLevel, setCompressionLevel] = useState('medium');
    const [customWidth, setCustomWidth] = useState(1920);
    const [customHeight, setCustomHeight] = useState(1080);
    const [customBitrate, setCustomBitrate] = useState(8000);
    const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
    const [videoInfo, setVideoInfo] = useState<{ duration: number; width: number; height: number; size: string; name: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (!selectedFile.type.startsWith('video/')) {
            setError('Por favor selecciona un archivo de video válido');
            return;
        }

        setFile(selectedFile);
        setError(null);
        setProcessedBlob(null);
        setProgress(0);

        const url = URL.createObjectURL(selectedFile);
        setPreview(url);

        const video = document.createElement('video');
        video.src = url;
        video.onloadedmetadata = () => {
            setVideoInfo({
                duration: video.duration,
                width: video.videoWidth,
                height: video.videoHeight,
                size: formatFileSize(selectedFile.size),
                name: selectedFile.name
            });
        };
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type.startsWith('video/')) {
            const fakeEvent = { target: { files: [droppedFile] } } as any;
            handleFileSelect(fakeEvent);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + ' GB';
        if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + ' MB';
        if (bytes >= 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return bytes + ' bytes';
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return h > 0 ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}` : `${m}:${s.toString().padStart(2, '0')}`;
    };

    const compressVideo = async () => {
        if (!file || !videoRef.current) return;

        setProcessing(true);
        setProgress(0);
        setError(null);

        try {
            const video = videoRef.current;
            const selectedQuality = QUALITY_PRESETS.find(q => q.id === quality) || QUALITY_PRESETS[1];
            const compressionSetting = COMPRESSION_LEVELS.find(l => l.id === compressionLevel) || COMPRESSION_LEVELS[1];
            const selectedFormat = OUTPUT_FORMATS.find(f => f.id === outputFormat) || OUTPUT_FORMATS[0];
            
            const videoAspect = video.videoWidth / video.videoHeight;
            let targetWidth: number, targetHeight: number;
            
            if (quality === 'custom') {
                targetWidth = customWidth;
                targetHeight = customHeight;
            } else {
                const maxWidth = selectedQuality.width;
                const maxHeight = selectedQuality.height;
                
                if (videoAspect > 1) {
                    targetWidth = Math.min(maxWidth, video.videoWidth);
                    targetHeight = Math.round(targetWidth / videoAspect);
                } else {
                    targetHeight = Math.min(maxHeight, video.videoHeight);
                    targetWidth = Math.round(targetHeight * videoAspect);
                }
            }
            
            const baseBitrate = quality === 'custom' ? customBitrate * 1000 : selectedQuality.bitrate;
            const targetBitrate = Math.round(baseBitrate * compressionSetting.bitrateMultiplier);

            const canvas = document.createElement('canvas');
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const ctx = canvas.getContext('2d')!;

            // Capture video stream from canvas
            const videoStream = canvas.captureStream(30);
            
            // Capture audio stream from video element
            const audioStream = (video as any).captureStream ? (video as any).captureStream() : (video as any).mozCaptureStream();
            const audioTracks = audioStream?.getAudioTracks() || [];
            
            // Combine video and audio tracks
            const combinedStream = new MediaStream([
                ...videoStream.getVideoTracks(),
                ...audioTracks
            ]);

            const mimeType = MediaRecorder.isTypeSupported(`video/webm;codecs=${selectedFormat.codecs}`) 
                ? `video/webm;codecs=${selectedFormat.codecs}` 
                : 'video/webm';

            const mediaRecorder = new MediaRecorder(combinedStream, {
                mimeType,
                videoBitsPerSecond: targetBitrate,
                audioBitsPerSecond: 128000
            });

            const chunks: Blob[] = [];
            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: mimeType });
                setProcessedBlob(blob);
                setProcessing(false);
                setProgress(100);
                video.pause();
            };

            video.muted = false;
            video.volume = 0;
            video.currentTime = 0;
            mediaRecorder.start();
            await video.play();

            const duration = video.duration;
            const frameInterval = setInterval(() => {
                ctx.fillStyle = '#000000';
                ctx.fillRect(0, 0, targetWidth, targetHeight);
                ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
                const currentProgress = Math.round((video.currentTime / duration) * 100);
                setProgress(Math.min(currentProgress, 99));
            }, 1000 / 30);

            video.onended = () => {
                clearInterval(frameInterval);
                mediaRecorder.stop();
            };

        } catch (err: any) {
            setError(err.message || 'Error al procesar el video');
            setProcessing(false);
        }
    };

    const extractAudio = async () => {
        if (!file || !videoRef.current) return;

        setProcessing(true);
        setProgress(0);
        setError(null);

        try {
            const video = videoRef.current;
            const stream = (video as any).captureStream ? (video as any).captureStream() : (video as any).mozCaptureStream();
            
            if (!stream) {
                throw new Error('Tu navegador no soporta captura de audio desde video');
            }

            const audioTracks = stream.getAudioTracks();
            if (audioTracks.length === 0) {
                throw new Error('Este video no tiene pista de audio');
            }

            const audioStream = new MediaStream(audioTracks);
            
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
                ? 'audio/webm;codecs=opus' 
                : MediaRecorder.isTypeSupported('audio/webm') 
                    ? 'audio/webm' 
                    : 'audio/mp4';

            const chunks: Blob[] = [];
            const mediaRecorder = new MediaRecorder(audioStream, {
                mimeType,
                audioBitsPerSecond: 192000
            });

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: mimeType });
                setProcessedBlob(blob);
                setProcessing(false);
                setProgress(100);
                video.pause();
                video.muted = true;
            };

            video.muted = false;
            video.playbackRate = 1;
            video.currentTime = 0;
            mediaRecorder.start();
            await video.play();

            const duration = video.duration;
            const progressInterval = setInterval(() => {
                const currentProgress = Math.round((video.currentTime / duration) * 100);
                setProgress(Math.min(currentProgress, 99));
            }, 100);

            video.onended = () => {
                clearInterval(progressInterval);
                mediaRecorder.stop();
            };

            video.onerror = () => {
                clearInterval(progressInterval);
                setError('Error durante el procesamiento del video');
                setProcessing(false);
            };

        } catch (err: any) {
            setError(err.message || 'Error al extraer el audio');
            setProcessing(false);
        }
    };

    const audioBufferToWav = (buffer: AudioBuffer) => {
        const numChannels = buffer.numberOfChannels;
        const sampleRate = buffer.sampleRate;
        const format = 1;
        const bitDepth = 16;

        const bytesPerSample = bitDepth / 8;
        const blockAlign = numChannels * bytesPerSample;
        const byteRate = sampleRate * blockAlign;
        const dataSize = buffer.length * blockAlign;
        const bufferSize = 44 + dataSize;

        const arrayBuffer = new ArrayBuffer(bufferSize);
        const view = new DataView(arrayBuffer);

        const writeString = (offset: number, string: string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };

        writeString(0, 'RIFF');
        view.setUint32(4, bufferSize - 8, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, format, true);
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, byteRate, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, bitDepth, true);
        writeString(36, 'data');
        view.setUint32(40, dataSize, true);

        const channelData = new Float32Array(buffer.length);
        const leftChannel = buffer.getChannelData(0);
        
        for (let i = 0; i < buffer.length; i++) {
            const sample = Math.max(-1, Math.min(1, leftChannel[i]));
            view.setInt16(44 + i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        }

        return arrayBuffer;
    };

    const downloadProcessed = () => {
        if (!processedBlob) return;
        
        const format = mode === 'extract' 
            ? AUDIO_FORMATS.find(f => f.id === audioFormat)!
            : VIDEO_FORMATS.find(f => f.id === outputFormat)!;
        
        const baseName = file?.name.replace(/\.[^/.]+$/, '') || 'video';
        const url = URL.createObjectURL(processedBlob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${baseName}_converted${format.ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const resetTool = () => {
        if (preview) URL.revokeObjectURL(preview);
        setFile(null);
        setPreview(null);
        setProcessedBlob(null);
        setProgress(0);
        setVideoInfo(null);
        setError(null);
        setProcessing(false);
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            {/* Error Display */}
            {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-sm">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* Upload Zone */}
            {!file ? (
                <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    className="border-2 border-dashed border-white/10 hover:border-blis-red/50 rounded-3xl p-16 text-center transition-all cursor-pointer group"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-blis-red/10 transition-colors">
                        <Upload className="w-10 h-10 text-zinc-500 group-hover:text-blis-red transition-colors" />
                    </div>
                    <h3 className="text-xl font-black text-white uppercase italic mb-2">Arrastra o Selecciona Video</h3>
                    <p className="text-zinc-500 text-sm max-w-md mx-auto">
                        Soporta MP4, WebM, MOV, AVI, MKV y más. Máximo 2GB.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-2 justify-center">
                        {['MP4', 'WebM', 'MOV', 'AVI', 'MKV'].map((fmt) => (
                            <span key={fmt} className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black text-zinc-400 uppercase">{fmt}</span>
                        ))}
                    </div>
                </div>
            ) : (
                <>
                    {/* Video Info */}
                    {videoInfo && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                                <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Duración</div>
                                <div className="text-xl font-black text-white">{formatTime(videoInfo.duration)}</div>
                            </div>
                            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                                <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Resolución</div>
                                <div className="text-xl font-black text-white">{videoInfo.width}×{videoInfo.height}</div>
                            </div>
                            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                                <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Tamaño</div>
                                <div className="text-xl font-black text-white">{videoInfo.size}</div>
                            </div>
                            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                                <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Formato</div>
                                <div className="text-xl font-black text-white uppercase">{file.name.split('.').pop()}</div>
                            </div>
                        </div>
                    )}

                    {/* Preview */}
                    <div className="bg-black/40 rounded-2xl border border-white/5 overflow-hidden">
                        <video
                            ref={videoRef}
                            src={preview || undefined}
                            controls
                            className="w-full max-h-[400px] object-contain"
                        />
                    </div>

                    {/* Mode Tabs */}
                    <div className="flex gap-2 p-1 bg-black/40 rounded-xl border border-white/5">
                        {[
                            { id: 'convert', label: 'Convertir Formato', icon: Film },
                            { id: 'extract', label: 'Extraer Audio', icon: Music },
                            { id: 'compress', label: 'Comprimir', icon: Settings2 },
                        ].map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setMode(id as typeof mode)}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-[10px] font-black uppercase transition-all ${
                                    mode === id
                                        ? 'bg-blis-red text-white shadow-lg'
                                        : 'text-zinc-500 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Convert Mode Settings */}
                    {mode === 'convert' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Formato de Salida</label>
                                <select
                                    value={outputFormat}
                                    onChange={(e) => setOutputFormat(e.target.value)}
                                    className="w-full bg-zinc-900 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-blis-red"
                                >
                                    {VIDEO_FORMATS.map((f) => (
                                        <option key={f.id} value={f.id}>{f.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Calidad</label>
                                <select
                                    value={quality}
                                    onChange={(e) => setQuality(e.target.value)}
                                    className="w-full bg-zinc-900 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-blis-red"
                                >
                                    {QUALITY_PRESETS.map((q) => (
                                        <option key={q.id} value={q.id}>{q.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Extract Audio Settings */}
                    {mode === 'extract' && (
                        <div>
                            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Formato de Audio</label>
                            <div className="grid grid-cols-5 gap-2">
                                {AUDIO_FORMATS.map((f) => (
                                    <button
                                        key={f.id}
                                        onClick={() => setAudioFormat(f.id)}
                                        className={`p-3 rounded-xl border text-center transition-all ${
                                            audioFormat === f.id
                                                ? 'bg-blis-red/10 border-blis-red text-blis-red'
                                                : 'bg-white/[0.02] border-white/5 text-zinc-400 hover:border-white/20'
                                        }`}
                                    >
                                        <Music className="w-5 h-5 mx-auto mb-1" />
                                        <div className="text-[10px] font-black uppercase">{f.name}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Compress Settings */}
                    {mode === 'compress' && (
                        <div className="space-y-6">
                            {/* Output Preview */}
                            {videoInfo && (
                                <div className="p-4 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 border border-emerald-500/20 rounded-xl">
                                    <div className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-3">Vista Previa de Salida</div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        <div>
                                            <div className="text-[9px] text-zinc-500 uppercase">Original</div>
                                            <div className="text-sm font-black text-white">{videoInfo.width}×{videoInfo.height}</div>
                                        </div>
                                        <div>
                                            <div className="text-[9px] text-zinc-500 uppercase">Salida</div>
                                            <div className="text-sm font-black text-emerald-400">
                                                {quality === 'custom' ? `${customWidth}×${customHeight}` : 
                                                    (() => {
                                                        const va = videoInfo.width / videoInfo.height;
                                                        const preset = QUALITY_PRESETS.find(q => q.id === quality);
                                                        if (va > 1) {
                                                            const w = Math.min(preset?.width || 1920, videoInfo.width);
                                                            return `${w}×${Math.round(w / va)}`;
                                                        } else {
                                                            const h = Math.min(preset?.height || 1080, videoInfo.height);
                                                            return `${Math.round(h * va)}×${h}`;
                                                        }
                                                    })()
                                                }
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[9px] text-zinc-500 uppercase">Formato</div>
                                            <div className="text-sm font-black text-white">WebM (VP9)</div>
                                        </div>
                                        <div>
                                            <div className="text-[9px] text-zinc-500 uppercase">Audio</div>
                                            <div className="text-sm font-black text-white">128 kbps Opus</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Resolution Presets */}
                            <div>
                                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Resolución de Salida</label>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                    {QUALITY_PRESETS.filter(p => p.id !== 'custom').map((q) => (
                                        <button
                                            key={q.id}
                                            onClick={() => setQuality(q.id)}
                                            className={`p-3 rounded-xl border text-center transition-all ${
                                                quality === q.id
                                                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                                                    : 'bg-white/[0.02] border-white/5 text-zinc-400 hover:border-white/20'
                                            }`}
                                        >
                                            <div className="text-[10px] font-black uppercase">{q.id}</div>
                                            <div className="text-[8px] text-zinc-600">{q.width}×{q.height}</div>
                                            <div className="text-[7px] text-zinc-700 mt-1">{q.size}</div>
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setQuality('custom')}
                                        className={`p-3 rounded-xl border text-center transition-all ${
                                            quality === 'custom'
                                                ? 'bg-purple-500/10 border-purple-500/50 text-purple-400'
                                                : 'bg-white/[0.02] border-white/5 text-zinc-400 hover:border-white/20'
                                        }`}
                                    >
                                        <div className="text-[10px] font-black uppercase">Custom</div>
                                        <div className="text-[8px] text-zinc-600">Personalizado</div>
                                    </button>
                                </div>
                            </div>

                            {quality === 'custom' && (
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Ancho (px)</label>
                                        <input
                                            type="number"
                                            value={customWidth}
                                            onChange={(e) => setCustomWidth(parseInt(e.target.value) || 0)}
                                            className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blis-red"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Alto (px)</label>
                                        <input
                                            type="number"
                                            value={customHeight}
                                            onChange={(e) => setCustomHeight(parseInt(e.target.value) || 0)}
                                            className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blis-red"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Bitrate (kbps)</label>
                                        <input
                                            type="number"
                                            value={customBitrate}
                                            onChange={(e) => setCustomBitrate(parseInt(e.target.value) || 0)}
                                            className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blis-red"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Compression Level */}
                            <div>
                                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Nivel de Compresión</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {COMPRESSION_LEVELS.map((level) => (
                                        <button
                                            key={level.id}
                                            onClick={() => setCompressionLevel(level.id)}
                                            className={`p-4 rounded-xl border text-center transition-all ${
                                                compressionLevel === level.id
                                                    ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400'
                                                    : 'bg-white/[0.02] border-white/5 text-zinc-400 hover:border-white/20'
                                            }`}
                                        >
                                            <div className="text-[11px] font-black uppercase">{level.name}</div>
                                            <div className="text-[8px] text-zinc-600 mt-1">{level.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Output Format */}
                            <div>
                                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Formato de Salida</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {OUTPUT_FORMATS.map((format) => (
                                        <button
                                            key={format.id}
                                            onClick={() => setOutputFormat(format.id)}
                                            className={`p-3 rounded-xl border text-center transition-all ${
                                                outputFormat === format.id
                                                    ? 'bg-purple-500/10 border-purple-500/50 text-purple-400'
                                                    : 'bg-white/[0.02] border-white/5 text-zinc-400 hover:border-white/20'
                                            }`}
                                        >
                                            <div className="text-[11px] font-black uppercase">{format.name}</div>
                                            <div className="text-[8px] text-zinc-600">Codec: {format.codecs.toUpperCase()}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Progress Bar */}
                    {processing && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-[10px] font-black text-emerald-400 uppercase">
                                <span>{mode === 'extract' ? 'Extrayendo audio...' : 'Convirtiendo video...'}</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-emerald-500/20">
                                <div
                                    className="h-full bg-gradient-to-r from-emerald-400 via-green-400 to-cyan-400 transition-all duration-200 shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <div className="text-[9px] text-zinc-500 text-center">
                                {mode === 'extract' 
                                    ? 'Procesando audio a velocidad normal para preservar calidad...'
                                    : 'Convertir mantiene la duración original. Para compresión rápida, usa 16x en convertidor externo.'
                                }
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        {!processedBlob ? (
                            <button
                                onClick={mode === 'extract' ? extractAudio : compressVideo}
                                disabled={processing}
                                className="flex-1 py-4 bg-gradient-to-r from-blis-red to-red-600 text-white font-black uppercase rounded-2xl shadow-lg shadow-blis-red/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        {mode === 'extract' ? <Music className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                                        {mode === 'extract' ? 'Extraer Audio' : mode === 'compress' ? 'Comprimir Video' : 'Convertir Video'}
                                    </>
                                )}
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={downloadProcessed}
                                    className="flex-1 py-4 bg-emerald-500 text-black font-black uppercase rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                                >
                                    <Download className="w-5 h-5" />
                                    Descargar
                                </button>
                                <button
                                    onClick={resetTool}
                                    className="py-4 px-6 bg-white/5 border border-white/10 text-white font-black uppercase rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10"
                                >
                                    <RotateCcw className="w-5 h-5" />
                                    Nuevo
                                </button>
                            </>
                        )}
                    </div>

                    {/* Info Banner */}
                    <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                        <div className="flex items-start gap-3">
                            <Zap className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                            <div className="text-sm text-zinc-300">
                                <strong className="text-amber-400">Procesamiento Local:</strong> El video se procesa en tu navegador. Los tiempos varían según la duración y resolución del video. Para mejores resultados con archivos largos, considera dividir el video primero.
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

function StandardTextAnalyze({ tool }: { tool: ToolDef }) {
    const [text, setText] = useState('');
    const chars = text.length;
    const words = text.trim().split(/\s+/).filter(w => w).length;
    return (
        <div className="space-y-6">
            <textarea className="w-full bg-black/40 border border-white/5 p-8 rounded-[2.5rem] text-sm text-white min-h-[220px] outline-none focus:border-blis-red/20 transition-all font-medium" placeholder={`Escribe para ${tool.name}...`} value={text} onChange={e => setText(e.target.value)} />
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-900/60 p-6 rounded-xl border border-white/5 text-center">
                    <div className="text-[8px] font-black text-zinc-600 uppercase mb-1">Caracteres</div>
                    <div className="text-2xl font-black text-white">{chars}</div>
                </div>
                <div className="bg-zinc-900/60 p-6 rounded-xl border border-white/5 text-center">
                    <div className="text-[8px] font-black text-zinc-600 uppercase mb-1">Palabras</div>
                    <div className="text-2xl font-black text-white">{words}</div>
                </div>
            </div>
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-xl text-[10px] text-zinc-500 italic">
                {tool.name}: Modo manual optimizado para edición y conteo local. La IA (Modo IA) es requerida para generación creativa.
            </div>
        </div>
    );
};

function StandardCodeTools({ tool }: { tool: ToolDef }) {
    const [code, setCode] = useState('');
    const fmt = () => {
        try {
            if (tool.id === 'json_fmt') setCode(JSON.stringify(JSON.parse(code), null, 4));
        } catch (e) { }
    };
    return (
        <div className="space-y-6">
            <textarea className="w-full bg-zinc-950 border border-white/10 p-6 rounded-xl text-[11px] text-emerald-500/80 font-mono h-64 resize-none" value={code} onChange={e => setCode(e.target.value)} placeholder={`// Ingresa ${tool.name} aquí...`} />
            <div className="flex gap-4">
                <button onClick={fmt} className="flex-1 py-4 bg-zinc-800 text-white font-black uppercase text-[10px] rounded-xl border border-white/5">Formatear</button>
                <button onClick={() => setCode('')} className="py-4 px-6 bg-rose-500/10 text-rose-500 rounded-xl"><Trash2 className="w-4 h-4" /></button>
            </div>
        </div>
    );
};

function StandardBreakEven() {
    const [fixed, setFixed] = useState('');
    const [price, setPrice] = useState('');
    const [variable, setVariable] = useState('');

    const f = parseFloat(fixed) || 0;
    const p = parseFloat(price) || 0;
    const v = parseFloat(variable) || 0;
    const units = (f / (p - v)) || 0;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                    <label className="text-[7px] font-black text-zinc-500 uppercase block mb-1">Costos Fijos</label>
                    <input className="w-full bg-zinc-900 border border-white/5 p-3 rounded-lg text-sm text-white font-black" placeholder="0" value={fixed} onChange={e => setFixed(e.target.value)} />
                </div>
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                    <label className="text-[7px] font-black text-zinc-500 uppercase block mb-1">Precio Venta</label>
                    <input className="w-full bg-zinc-900 border border-white/5 p-3 rounded-lg text-sm text-white font-black" placeholder="0" value={price} onChange={e => setPrice(e.target.value)} />
                </div>
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                    <label className="text-[7px] font-black text-zinc-500 uppercase block mb-1">Costo Var.</label>
                    <input className="w-full bg-zinc-900 border border-white/5 p-3 rounded-lg text-sm text-white font-black" placeholder="0" value={variable} onChange={e => setVariable(e.target.value)} />
                </div>
            </div>
            <div className="p-10 bg-cyan-500/5 border border-cyan-500/20 rounded-[2.5rem] text-center">
                <div className="text-[8px] font-black text-cyan-500 uppercase tracking-[0.4em] mb-2">Punto de Equilibrio</div>
                <div className="text-6xl font-black text-white">{isFinite(units) ? Math.ceil(units) : '0'} <span className="text-xl text-zinc-800 uppercase">Unidades</span></div>
                <div className="text-[9px] text-zinc-600 mt-2 font-black uppercase">Ingreso mínimo: ${(Math.ceil(units) * p).toFixed(2)}</div>
            </div>
        </div>
    );
};

function StandardTax() {
    const [amount, setAmount] = useState('');
    const igv_rate = 0.18;
    const val = parseFloat(amount) || 0;
    const base = val / (1 + igv_rate);
    const igv = val - base;

    return (
        <div className="space-y-6 text-center">
            <div className="bg-black/40 p-8 rounded-[2.5rem] border border-white/5">
                <label className="text-[8px] font-black text-zinc-500 uppercase block mb-3">Monto Total (Inc. IGV)</label>
                <input className="w-full bg-transparent text-5xl font-black text-white text-center outline-none" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="p-8 bg-zinc-900 border border-white/5 rounded-xl">
                    <div className="text-[7px] font-black text-zinc-600 uppercase mb-1">Sub-Total (Base)</div>
                    <div className="text-2xl font-black text-white">${base.toFixed(2)}</div>
                </div>
                <div className="p-8 bg-zinc-900 border border-white/5 rounded-xl">
                    <div className="text-[7px] font-black text-blis-red uppercase mb-1">Impuesto (18%)</div>
                    <div className="text-2xl font-black text-blis-red">${igv.toFixed(2)}</div>
                </div>
            </div>
        </div>
    );
};

function StandardWaste() {
    const [initial, setInitial] = useState('');
    const [final, setFinal] = useState('');
    const loss = (parseFloat(initial) - parseFloat(final)) || 0;
    const pct = (loss / parseFloat(initial)) * 100 || 0;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 p-6 rounded-xl border border-white/5">
                    <label className="text-[8px] font-black text-zinc-500 uppercase block mb-2">Inv. Inicial</label>
                    <input className="w-full bg-zinc-900 p-4 rounded-xl text-white font-black" placeholder="0" value={initial} onChange={e => setInitial(e.target.value)} />
                </div>
                <div className="bg-black/40 p-6 rounded-xl border border-white/5">
                    <label className="text-[8px] font-black text-zinc-500 uppercase block mb-2">Ventas/Fin</label>
                    <input className="w-full bg-zinc-900 p-4 rounded-xl text-white font-black" placeholder="0" value={final} onChange={e => setFinal(e.target.value)} />
                </div>
            </div>
            <div className="p-10 bg-rose-500/5 border border-rose-500/20 rounded-[2.5rem] text-center">
                <div className="text-[8px] font-black text-rose-500 uppercase mb-2">Merma Detectada</div>
                <div className="text-5xl font-black text-white">{pct.toFixed(2)}%</div>
                <div className="text-[9px] text-zinc-600 mt-2">Pérdida física: {loss.toFixed(2)} unidades</div>
            </div>
        </div>
    );
};

function StandardHourCounter() {
    const [hours, setHours] = useState(['']);
    const add = () => setHours([...hours, '']);
    const total = hours.reduce((acc, h) => acc + (parseFloat(h) || 0), 0);
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {hours.map((h, i) => (
                    <input key={i} className="bg-black/40 border border-white/5 p-3 rounded-xl text-white text-center font-black" placeholder="0.0" value={h} onChange={e => {
                        const next = [...hours]; next[i] = e.target.value; setHours(next);
                    }} />
                ))}
            </div>
            <button onClick={add} className="w-full py-3 bg-zinc-900 border border-white/5 rounded-xl text-[8px] font-black uppercase text-zinc-500 hover:text-white transition-all">+ AGREGAR TURNO / HORAS</button>
            <div className="p-8 bg-zinc-950 border border-white/5 rounded-[2rem] text-center">
                <div className="text-[8px] font-black text-zinc-600 uppercase mb-1">Total Horas</div>
                <div className="text-4xl font-black text-white">{total.toFixed(1)} <span className="text-sm">hrs</span></div>
            </div>
        </div>
    );
};

function StandardPitchTimer() {
    const [words, setWords] = useState('');
    const wCount = words.trim().split(/\s+/).filter(w => w).length;
    const mins = wCount / 130; // Avg speaking speed
    return (
        <div className="space-y-6">
            <textarea className="w-full bg-black/40 border border-white/5 p-6 rounded-xl text-sm text-white h-40 resize-none" placeholder="Pega tu discurso aquí..." value={words} onChange={e => setWords(e.target.value)} />
            <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-purple-500/5 border border-purple-500/20 rounded-xl text-center">
                    <div className="text-[8px] font-black text-purple-400 uppercase mb-1">Duración Estimada</div>
                    <div className="text-3xl font-black text-white">{Math.floor(mins)}m {Math.round((mins % 1) * 60)}s</div>
                </div>
                <div className="p-6 bg-zinc-900 border border-white/5 rounded-xl text-center">
                    <div className="text-[8px] font-black text-zinc-600 uppercase mb-1">Palabras</div>
                    <div className="text-3xl font-black text-white">{wCount}</div>
                </div>
            </div>
        </div>
    );
};

function StandardWALink() {
    const [num, setNum] = useState('');
    const [msg, setMsg] = useState('');
    const link = `https://wa.me/${num.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
    return (
        <div className="space-y-4">
            <input className="w-full bg-black/40 border border-white/5 p-4 rounded-xl text-white font-black" placeholder="Número (ej: 51912345678)" value={num} onChange={e => setNum(e.target.value)} />
            <textarea className="w-full bg-black/40 border border-white/5 p-4 rounded-xl text-white h-24 resize-none" placeholder="Mensaje predeterminado..." value={msg} onChange={e => setMsg(e.target.value)} />
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl break-all text-[10px] text-emerald-500 font-mono">
                {link}
            </div>
            <button onClick={() => window.open(link, '_blank')} className="w-full py-4 bg-emerald-600 text-white font-black uppercase rounded-xl">ABRIR WHATSAPP</button>
        </div>
    );
};

function StandardQRGen() {
    const [val, setVal] = useState('');
    return (
        <div className="p-10 bg-white/5 border border-white/5 rounded-[3rem] text-center space-y-6">
            <div className="w-40 h-40 bg-white mx-auto rounded-2xl flex items-center justify-center p-4">
                {val ? <div className="p-2 border-2 border-black w-full h-full flex flex-wrap gap-1">
                    {Array.from({ length: 64 }).map((_, i) => <div key={i} className={`w-1.5 h-1.5 ${Math.random() > 0.5 ? 'bg-black' : 'bg-transparent'}`} />)}
                </div> : <Search className="w-12 h-12 text-zinc-300" />}
            </div>
            <input className="w-full bg-black/40 border border-white/5 p-4 rounded-xl text-white text-center font-black" placeholder="URL o Texto para el QR" value={val} onChange={e => setVal(e.target.value)} />
            <p className="text-[9px] text-zinc-500 italic">Generador estructural offline. Para QRs dinámicos con logo, utilice el Modo IA.</p>
        </div>
    );
};

function UniversalManualForm({ tool }: { tool: ToolDef }) {
    return (
        <div className="p-10 bg-zinc-900/40 border border-white/5 rounded-[3rem] text-center space-y-6">
            <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-zinc-700">
                <Settings className="w-8 h-8 text-zinc-600 animate-spin-slow" />
            </div>
            <div className="space-y-2">
                <h4 className="text-white font-black uppercase text-xs tracking-widest">Interfaz Manual en Construcción</h4>
                <p className="text-zinc-600 text-[10px] max-w-xs mx-auto leading-relaxed">Estamos digitalizando la lógica offline para "{tool.name}". Mientras tanto, por favor utiliza las herramientas de la sección **Favoritos** que ya cuentan con modo manual completo.</p>
            </div>
            <div className="flex justify-center gap-3">
                <div className="w-2 h-2 rounded-full bg-zinc-700" />
                <div className="w-2 h-2 rounded-full bg-zinc-700" />
                <div className="w-2 h-2 rounded-full bg-zinc-700" />
            </div>
        </div>
    );
}

function CurrencyConverter() {
    const [soles, setSoles] = useState('');
    const [usd, setUsd] = useState('');
    const [rate, setRate] = useState('3.70');
    const [loading, setLoading] = useState(false);
    const [lastSync, setLastSync] = useState<string | null>(null);

    const loadRate = async () => {
        setLoading(true);
        const res = await fetchExchangeRate();
        if (res.success) {
            setRate(res.sell.toString());
            setLastSync(new Date().toLocaleTimeString());
        }
        setLoading(false);
    };

    useEffect(() => {
        loadRate();
    }, []);

    const updateSoles = (v: string) => {
        setSoles(v);
        const n = parseFloat(v);
        if (!isNaN(n)) setUsd((n / parseFloat(rate)).toFixed(2));
        else setUsd('');
    };

    const updateUsd = (v: string) => {
        setUsd(v);
        const n = parseFloat(v);
        if (!isNaN(n)) setSoles((n * parseFloat(rate)).toFixed(2));
        else setSoles('');
    };

    return (
        <div className="space-y-6 p-8 bg-zinc-900/40 rounded-xl border border-white/5 max-w-xl mx-auto shadow-2xl backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <ArrowRightLeft className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                        <h4 className="text-xs font-black text-white uppercase tracking-widest">Conversor PEN / USD</h4>
                        <p className="text-[9px] text-zinc-500 font-bold uppercase">Datos en tiempo real (API)</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-black/60 px-4 py-2 rounded-2xl border border-white/5">
                    <div className="text-right">
                        <div className="text-[7px] font-black text-zinc-500 uppercase tracking-tighter">Tipo de Cambio</div>
                        <input
                            className="bg-transparent text-sm font-black text-emerald-500 outline-none text-right w-12"
                            value={rate}
                            onChange={e => setRate(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={loadRate}
                        className={`p-1.5 rounded-lg hover:bg-white/5 transition-all ${loading ? 'animate-spin' : ''}`}
                    >
                        <RefreshCcw className="w-3.5 h-3.5 text-zinc-600" />
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <img src="https://flagcdn.com/w20/pe.png" className="w-4 h-3 rounded-sm opacity-60" />
                        <span className="text-[10px] font-black text-zinc-600">S/.</span>
                    </div>
                    <input
                        placeholder="Monto en Soles"
                        className="w-full bg-black/40 border border-white/5 p-6 pl-20 rounded-xl text-xl font-black text-white outline-none focus:border-emerald-500/30 transition-all placeholder:text-zinc-900"
                        value={soles}
                        onChange={e => updateSoles(e.target.value)}
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-zinc-800 tracking-widest uppercase">PEN</div>
                </div>

                <div className="flex justify-center -my-2 relative z-10">
                    <div className="w-12 h-12 bg-zinc-950 border border-white/5 rounded-2xl flex items-center justify-center shadow-2xl">
                        <ArrowRightLeft className="w-5 h-5 text-zinc-700 rotate-90" />
                    </div>
                </div>

                <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <img src="https://flagcdn.com/w20/us.png" className="w-4 h-3 rounded-sm opacity-60" />
                        <span className="text-[10px] font-black text-zinc-600">$</span>
                    </div>
                    <input
                        placeholder="Monto en Dólares"
                        className="w-full bg-black/40 border border-white/5 p-6 pl-20 rounded-xl text-xl font-black text-white outline-none focus:border-blis-red/30 transition-all placeholder:text-zinc-900"
                        value={usd}
                        onChange={e => updateUsd(e.target.value)}
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-zinc-800 tracking-widest uppercase">USD</div>
                </div>
            </div>

            {lastSync && (
                <div className="text-center pt-2">
                    <span className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.2em]">Última sincronización: {lastSync}</span>
                </div>
            )}
        </div>
    );
};

// --- Unit Converter ---
function UnitConverter() {
    const [mode, setMode] = useState<'len' | 'weight'>('len');
    const [val, setVal] = useState('');
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [result, setResult] = useState<number | null>(null);

    const units = {
        len: { units: ['Metros', 'Kilómetros', 'Millas', 'Pies', 'Pulgadas'], rates: { 'Metros': 1, 'Kilómetros': 1000, 'Millas': 1609.34, 'Pies': 0.3048, 'Pulgadas': 0.0254 } },
        weight: { units: ['Kilogramos', 'Libras', 'Gramos', 'Onzas'], rates: { 'Kilogramos': 1, 'Libras': 0.453592, 'Gramos': 0.001, 'Onzas': 0.0283495 } }
    };

    useEffect(() => {
        setFrom(units[mode].units[0]);
        setTo(units[mode].units[1]);
        setResult(null);
    }, [mode]);

    const convert = () => {
        const num = parseFloat(val);
        if (isNaN(num)) return;
        // @ts-ignore
        const r = (num * units[mode].rates[from]) / units[mode].rates[to];
        setResult(r);
    };

    return (
        <div className="space-y-4 p-8 bg-zinc-900/40 rounded-xl border border-white/5 max-w-lg mx-auto shadow-2xl">
            <div className="flex bg-black/40 p-1.5 rounded-2xl gap-1">
                {(['len', 'weight'] as const).map(m => (
                    <button key={m} onClick={() => setMode(m)} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${mode === m ? 'bg-zinc-800 text-white shadow-xl' : 'text-zinc-600 hover:text-white'}`}>
                        {m === 'len' ? 'Medidas Longitud' : 'Cargas de Peso'}
                    </button>
                ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <label className="text-[8px] font-black text-zinc-600 uppercase ml-2 tracking-widest">Origen</label>
                    <select value={from} onChange={e => setFrom(e.target.value)} className="w-full bg-black/60 border border-white/5 p-4 rounded-2xl text-[11px] font-black text-white outline-none appearance-none cursor-pointer hover:border-white/20 transition-all">
                        {units[mode].units.map(u => <option key={u} value={u} className="bg-zinc-900">{u}</option>)}
                    </select>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[8px] font-black text-zinc-600 uppercase ml-2 tracking-widest">Destino</label>
                    <select value={to} onChange={e => setTo(e.target.value)} className="w-full bg-black/60 border border-white/5 p-4 rounded-2xl text-[11px] font-black text-white outline-none appearance-none cursor-pointer hover:border-white/20 transition-all">
                        {units[mode].units.map(u => <option key={u} value={u} className="bg-zinc-900">{u}</option>)}
                    </select>
                </div>
            </div>
            <div className="relative">
                <input
                    type="number"
                    placeholder="Ingrese el valor a convertir..."
                    className="w-full bg-black/60 border border-white/5 p-6 rounded-xl text-center text-2xl font-black outline-none focus:border-blis-red/30 transition-all placeholder:text-zinc-900"
                    value={val}
                    onChange={e => setVal(e.target.value)}
                />
            </div>
            <button onClick={convert} className="w-full py-4 bg-blis-red text-white text-[11px] font-black uppercase rounded-[1.5rem] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-blis-red/20">Procesar Conversión</button>
            {result !== null && (
                <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 text-center animate-in zoom-in-95 duration-500 shadow-inner">
                    <div className="text-[8px] font-black text-gray-600 uppercase tracking-[0.3em] mb-2">Equivalencia Resultante</div>
                    <div className="text-3xl font-black text-white tracking-tighter">{result.toLocaleString(undefined, { maximumFractionDigits: 6 })} <span className="text-xs text-zinc-700 ml-2 uppercase">{to}</span></div>
                </div>
            )}
        </div>
    );
};

// --- Time Master (Stopwatch, Countdown, World Clock) ---
function TaskTimer() {
    const [mode, setMode] = useState<'stopwatch' | 'countdown' | 'world'>('stopwatch');
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);

    // Countdown specific
    const [cdHours, setCdHours] = useState(0);
    const [cdMins, setCdMins] = useState(5);
    const [cdSecs, setCdSecs] = useState(0);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const playBeep = () => {
        try {
            const context = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = context.createOscillator();
            const gain = context.createGain();
            oscillator.connect(gain);
            gain.connect(context.destination);
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, context.currentTime); // A5
            gain.gain.setValueAtTime(0, context.currentTime);
            gain.gain.linearRampToValueAtTime(0.5, context.currentTime + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 1);
            oscillator.start(context.currentTime);
            oscillator.stop(context.currentTime + 1);
        } catch (e) { console.error("Audio failed", e); }
    };

    useEffect(() => {
        if (isActive) {
            timerRef.current = setInterval(() => {
                setSeconds(s => {
                    if (mode === 'countdown') {
                        if (s <= 1) {
                            setIsActive(false);
                            playBeep();
                            return 0;
                        }
                        return s - 1;
                    }
                    return s + 1;
                });
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isActive, mode]);

    const formatTime = (s: number) => {
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    const startCountdown = () => {
        const total = (cdHours * 3600) + (cdMins * 60) + cdSecs;
        if (total > 0) {
            setSeconds(total);
            setIsActive(true);
        }
    };

    return (
        <div className="p-8 bg-zinc-900/40 rounded-[3rem] border border-white/5 space-y-6 max-w-xl mx-auto shadow-2xl backdrop-blur-md">
            <div className="flex bg-black/60 p-1.5 rounded-2xl gap-1">
                {[
                    { id: 'stopwatch', label: 'Cronómetro', icon: Timer },
                    { id: 'countdown', label: 'Temporizador', icon: Clock },
                    { id: 'world', label: 'Reloj Global', icon: Globe }
                ].map(m => (
                    <button
                        key={m.id}
                        onClick={() => { setMode(m.id as any); setIsActive(false); setSeconds(0); }}
                        className={`flex-1 py-3 flex flex-col items-center gap-1 rounded-xl transition-all ${mode === m.id ? 'bg-zinc-800 text-white shadow-xl' : 'text-zinc-600 hover:text-zinc-400'}`}
                    >
                        <m.icon className="w-4 h-4" />
                        <span className="text-[7px] font-black uppercase tracking-widest">{m.label}</span>
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {mode === 'world' ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-4 py-4">
                        {[
                            { city: 'Lima', zone: 'America/Lima' },
                            { city: 'Madrid', zone: 'Europe/Madrid' },
                            { city: 'Miami', zone: 'America/New_York' },
                            { city: 'Tokio', zone: 'Asia/Tokyo' }
                        ].map(c => (
                            <div key={c.city} className="bg-black/40 p-4 rounded-2xl border border-white/5 text-center">
                                <div className="text-[8px] font-black text-zinc-600 uppercase mb-1 tracking-widest">{c.city}</div>
                                <div className="text-xl font-black text-white">
                                    {new Date().toLocaleTimeString('en-US', { timeZone: c.zone, hour12: false, hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                        <div className="text-7xl font-black text-white font-mono tracking-widest bg-black/80 py-12 rounded-[2.5rem] border border-white/5 text-center shadow-inner relative overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(230,0,50,0.05),transparent)] pointer-events-none" />
                            {formatTime(seconds)}
                        </div>

                        {mode === 'countdown' && !isActive && (
                            <div className="flex items-center justify-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                <div className="text-center">
                                    <input type="number" value={cdHours} onChange={e => setCdHours(parseInt(e.target.value) || 0)} className="w-12 bg-transparent text-xl font-black text-white outline-none border-b border-white/10" />
                                    <div className="text-[7px] font-black text-zinc-600 uppercase">H</div>
                                </div>
                                <span className="text-xl font-black text-zinc-800">:</span>
                                <div className="text-center">
                                    <input type="number" value={cdMins} onChange={e => setCdMins(parseInt(e.target.value) || 0)} className="w-12 bg-transparent text-xl font-black text-white outline-none border-b border-white/10" />
                                    <div className="text-[7px] font-black text-zinc-600 uppercase">M</div>
                                </div>
                                <span className="text-xl font-black text-zinc-800">:</span>
                                <div className="text-center">
                                    <input type="number" value={cdSecs} onChange={e => setCdSecs(parseInt(e.target.value) || 0)} className="w-12 bg-transparent text-xl font-black text-white outline-none border-b border-white/10" />
                                    <div className="text-[7px] font-black text-zinc-600 uppercase">S</div>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button
                                onClick={() => mode === 'countdown' && !isActive ? startCountdown() : setIsActive(!isActive)}
                                className={`flex-[2] py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest transition-all ${isActive ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30' : 'bg-blis-red text-white shadow-xl shadow-blis-red/20'}`}
                            >
                                {isActive ? 'PAUSAR' : (mode === 'countdown' && seconds === 0 ? 'ESTABLECER' : 'EJECUTAR')}
                            </button>
                            <button onClick={() => { setIsActive(false); setSeconds(0); }} className="px-8 bg-zinc-900 text-zinc-600 rounded-[2rem] border border-white/5 hover:text-white transition-all">
                                <RefreshCcw className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- Variable IGV Calculator ---
function IgvTool() {
    const [raw, setRaw] = useState({ total: '', sub: '', igv: '18' });

    const update = (field: 'total' | 'sub', val: string) => {
        const num = parseFloat(val) || 0;
        const rate = (parseFloat(raw.igv) || 0) / 100;
        if (field === 'total') setRaw({ ...raw, total: val, sub: (num / (1 + rate)).toFixed(2) });
        else setRaw({ ...raw, sub: val, total: (num * (1 + rate)).toFixed(2) });
    };

    return (
        <div className="space-y-6 p-8 bg-zinc-900/40 rounded-xl border border-white/5 max-w-xl mx-auto shadow-2xl relative group">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                    <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Cálculo Impositivo IA</h4>
                    <button
                        onClick={async () => {
                            const res = await callAI(`Dada una base imponible de ${raw.sub || '0'}, sugiere una estrategia de optimización fiscal legal en una frase corta.`);
                            alert(res);
                        }}
                        className="p-1 px-3 bg-blis-red/10 rounded-full hover:bg-blis-red/20 transition-all flex items-center gap-2 group/ia"
                    >
                        <Sparkles className="w-2.5 h-2.5 text-blis-red animate-pulse" />
                        <span className="text-[6px] font-black text-blis-red uppercase">Smart Strategy</span>
                    </button>
                </div>
                <div className="flex items-center gap-3 bg-black/60 px-4 py-2 rounded-2xl border border-white/5">
                    <span className="text-[8px] font-black text-zinc-700 uppercase">% TASA</span>
                    <input className="w-12 bg-transparent text-sm font-black text-blis-red outline-none text-center" value={raw.igv} onChange={e => setRaw({ ...raw, igv: e.target.value })} />
                </div>
            </div>
            <div className="space-y-4">
                {/* Improved Readability for IGV Inputs */}
                <div className="relative">
                    <label className="absolute left-6 top-3 text-[9px] font-black text-zinc-700 uppercase tracking-widest">Importe Base (Sin Impuestos)</label>
                    <input placeholder="0.00" className="w-full bg-black/60 border border-white/5 p-8 pt-12 rounded-[2rem] text-3xl font-black text-white outline-none focus:border-emerald-500/30 transition-all placeholder:text-zinc-900" value={raw.sub} onChange={e => update('sub', e.target.value)} />
                    <div className="absolute right-6 bottom-5 flex items-center gap-2">
                        <span className="text-[10px] font-black text-zinc-800 uppercase trackers-widest">NETO</span>
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    </div>
                </div>
                <div className="relative">
                    <label className="absolute left-6 top-3 text-[9px] font-black text-zinc-700 uppercase tracking-widest">Importe Final (Incluye Impuestos)</label>
                    <input placeholder="0.00" className="w-full bg-black/60 border border-white/5 p-8 pt-12 rounded-[2rem] text-3xl font-black text-white outline-none focus:border-blis-red/30 transition-all placeholder:text-zinc-900" value={raw.total} onChange={e => update('total', e.target.value)} />
                    <div className="absolute right-6 bottom-5 flex items-center gap-2">
                        <span className="text-[10px] font-black text-zinc-800 uppercase trailers-widest">TOTAL</span>
                        <div className="w-2.5 h-2.5 rounded-full bg-blis-red shadow-[0_0_10px_rgba(230,0,50,0.5)]" />
                    </div>
                </div>
            </div>
            <div className="p-10 bg-zinc-950/80 rounded-[2rem] border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-3">
                <div className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">Carga Impositiva Reservada</div>
                <div className="text-5xl font-black text-white tracking-tighter">${(parseFloat(raw.total || '0') - parseFloat(raw.sub || '0')).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            </div>
        </div>
    );
};

// --- Notepad + WhatsApp ---
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

// --- Mini Spreadsheet ---
function MiniSpreadsheet() {
    const [data, setData] = useState(Array(10).fill(0).map(() => Array(3).fill('')));
    const [activeCell, setActiveCell] = useState<{ r: number, c: number } | null>(null);

    const updateCell = (r: number, c: number, v: string) => {
        const n = [...data];
        n[r][c] = v;
        setData(n);
    };

    const handleCellClick = (r: number, c: number) => {
        // Safe check for formula injection mode
        if (activeCell && data[activeCell.r][activeCell.c].startsWith('=') && (activeCell.r !== r || activeCell.c !== c)) {
            const cellRef = `${String.fromCharCode(65 + c)}${r + 1}`;
            const currentVal = data[activeCell.r][activeCell.c];
            updateCell(activeCell.r, activeCell.c, currentVal + cellRef);
            return;
        }
        setActiveCell({ r, c });
    };

    const evaluate = (val: string) => {
        if (typeof val !== 'string' || !val.startsWith('=')) return val;
        try {
            let f = val.substring(1).toUpperCase();
            // Replace cell references A1, B2... with their values
            f = f.replace(/([A-C])([1-9]|10)/g, (m, c, r) => {
                const cellVal = data[parseInt(r) - 1][c.charCodeAt(0) - 65];
                // If the referenced cell is also a formula, we'd need recursion. 
                // For simplicity, let's just use its raw or evaluated value if it's a number.
                return cellVal && !cellVal.startsWith('=') ? (parseFloat(cellVal) || 0).toString() : '0';
            });
            // Safe eval for basic math
            // eslint-disable-next-line no-eval
            const result = eval(f);
            return isFinite(result) ? result.toString() : "ERR";
        } catch { return "ERR"; }
    };

    return (
        <div className="p-6 bg-zinc-900/60 rounded-xl border border-white/5 space-y-4 max-w-5xl mx-auto shadow-2xl backdrop-blur-md overflow-hidden">
            {/* Header section */}
            <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <TableIcon className="w-4 h-4 text-emerald-500" />
                    </div>
                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Blis Sheets v2.0</h4>
                </div>
                <button
                    onClick={() => { setData(Array(10).fill(0).map(() => Array(3).fill(''))); setActiveCell(null); }}
                    className="text-[8px] font-black text-zinc-600 hover:text-rose-500 transition-colors uppercase tracking-[0.2em]"
                >
                    Limpiar Todo
                </button>
            </div>

            {/* Formula Bar (Google Sheets style) */}
            <div className="flex items-center gap-2 bg-black/40 border border-white/5 p-2 rounded-xl">
                <div className="px-3 py-1 bg-zinc-800 rounded-lg text-[10px] font-black text-zinc-500 border border-white/5 min-w-[50px] text-center">
                    {activeCell ? `${String.fromCharCode(65 + activeCell.c)}${activeCell.r + 1}` : '--'}
                </div>
                <div className="text-zinc-700 font-bold text-sm italic">ƒx</div>
                <input
                    className="flex-1 bg-transparent text-sm font-medium text-white outline-none placeholder:text-zinc-800"
                    placeholder="Ingrese valor o formula (=A1+B1)"
                    value={activeCell ? data[activeCell.r][activeCell.c] : ''}
                    onChange={e => activeCell && updateCell(activeCell.r, activeCell.c, e.target.value)}
                />
            </div>

            {/* Spreadsheet Grid */}
            <div className="bg-black/20 rounded-2xl border border-white/5 p-1">
                <div className="grid grid-cols-[40px_1fr_1fr_1fr] gap-[1px] bg-white/5">
                    {/* Top Row headers */}
                    <div className="bg-zinc-950 p-2 border-b border-white/5"></div>
                    {['A', 'B', 'C'].map(c => (
                        <div key={c} className="bg-zinc-900 p-2 text-center text-[9px] font-black text-zinc-600 uppercase border-b border-white/5">
                            {c}
                        </div>
                    ))}

                    {/* Cell Rows */}
                    {[...Array(10)].map((_, ri) => (
                        <React.Fragment key={ri}>
                            <div className="bg-zinc-900 p-2 text-center text-[9px] font-black text-zinc-700 flex items-center justify-center border-r border-white/5">
                                {ri + 1}
                            </div>
                            {[0, 1, 2].map(ci => {
                                const isActive = activeCell?.r === ri && activeCell?.c === ci;
                                const rawValue = data[ri][ci];
                                const isFormula = rawValue.startsWith('=');
                                return (
                                    <div key={ci} className="bg-zinc-950 min-h-[40px] relative">
                                        <input
                                            className={`w-full h-full p-2 text-xs text-center border-0 outline-none transition-all
                                                ${isActive ? 'bg-zinc-800 text-white ring-1 ring-emerald-500/50 z-10' : 'bg-transparent text-zinc-400'}
                                                ${isFormula && !isActive ? 'font-bold text-emerald-400' : ''}
                                            `}
                                            value={isActive ? rawValue : evaluate(rawValue)}
                                            onChange={e => updateCell(ri, ci, e.target.value)}
                                            onFocus={() => setActiveCell({ r: ri, c: ci })}
                                            onClick={() => handleCellClick(ri, ci)}
                                            spellCheck={false}
                                        />
                                        {isFormula && !isActive && (
                                            <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-emerald-500 opacity-20" />
                                        )}
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Bottom summary */}
            <div className="grid grid-cols-3 gap-3 px-1 mt-2">
                {['A', 'B', 'C'].map((col, ci) => (
                    <div key={col} className="bg-emerald-500/[0.03] border border-emerald-500/10 p-3 rounded-xl flex justify-between items-center group">
                        <span className="text-[7px] font-black text-emerald-500/40 uppercase tracking-widest">SUMA {col}</span>
                        <span className="text-xs font-black text-white">
                            {evaluate(`=${col}1+${col}2+${col}3+${col}4+${col}5+${col}6+${col}7+${col}8+${col}9+${col}10`)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Formula Calc ---
function FormulaCalc() {
    const [mode, setMode] = useState<'pct' | 'area'>('pct');
    const [val, setVal] = useState({ a: '', b: '' });
    const [res, setRes] = useState('');
    const calc = () => {
        const a = parseFloat(val.a) || 0; const b = parseFloat(val.b) || 0;
        if (mode === 'pct') setRes(`${(a * b / 100).toFixed(2)}`);
        else setRes(`${(Math.PI * a * a).toFixed(2)}`);
    };

    return (
        <div className="p-8 bg-zinc-900/30 rounded-xl border border-white/5 space-y-8 max-w-md mx-auto shadow-2xl backdrop-blur-sm">
            <div className="flex bg-black/60 p-2 rounded-2xl gap-2">
                {['pct', 'area'].map(m => (
                    <button key={m} onClick={() => setMode(m as any)} className={`flex-1 py-4 text-[10px] font-black uppercase rounded-xl transition-all ${mode === m ? 'bg-blis-red text-white shadow-lg' : 'text-zinc-700 hover:text-white'}`}>
                        {m === 'pct' ? 'PORCENTAJES' : 'ÁREA CÍRCULO'}
                    </button>
                ))}
            </div>
            <div className="space-y-4">
                <div className="relative">
                    <input placeholder={mode === 'pct' ? 'Importe Base' : 'Radio del Círculo'} className="w-full bg-black/60 border border-white/5 p-6 rounded-xl text-xl font-black text-white text-center outline-none focus:border-blis-red/30 transition-all placeholder:text-zinc-900" value={val.a} onChange={e => setVal({ ...val, a: e.target.value })} />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[9px] font-black text-zinc-800 uppercase tracking-widest">{mode === 'pct' ? 'VALOR' : 'RAD'}</div>
                </div>
                {mode === 'pct' && (
                    <div className="relative">
                        <input placeholder="Porcentaje (%)" className="w-full bg-black/60 border border-white/5 p-6 rounded-xl text-xl font-black text-white text-center outline-none focus:border-blis-red/30 transition-all placeholder:text-zinc-900" value={val.b} onChange={e => setVal({ ...val, b: e.target.value })} />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[12px] font-black text-zinc-800">%</div>
                    </div>
                )}
            </div>
            <button onClick={calc} className="w-full py-5 bg-zinc-800 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] hover:bg-zinc-700 transition-all shadow-xl">PROCESAR FÓRMULA</button>
            <AnimatePresence>
                {res && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-8 bg-blis-red/5 rounded-[2.5rem] border border-blis-red/20 shadow-inner">
                        <div className="text-[8px] font-black text-blis-red uppercase tracking-[0.5em] mb-2">Resultado Matemático</div>
                        <div className="text-5xl font-black text-white tracking-tighter">{res}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- Advanced Utility Tools (Native Style) ---
function PercentageTool() {
    const [a, setA] = useState('');
    const [b, setB] = useState('');
    const res = (parseFloat(a) && parseFloat(b)) ? ((parseFloat(a) / parseFloat(b)) * 100).toFixed(2) : '--';
    return (
        <div className="space-y-6">
            <div className="bg-black/40 p-6 rounded-xl border border-white/5">
                <div className="text-[10px] font-black text-zinc-500 uppercase mb-4 tracking-widest">Calcular Porcentaje (A respecto de B)</div>
                <div className="flex items-center gap-4">
                    <div className="flex-1 space-y-2">
                        <label className="text-[8px] font-black text-zinc-700 uppercase block pl-2">Valor A</label>
                        <input className="w-full bg-zinc-900 border border-white/5 p-4 rounded-2xl text-xl font-black text-white outline-none focus:border-blis-red/30" value={a} onChange={e => setA(e.target.value)} placeholder="0" />
                    </div>
                    <ArrowRightLeft className="w-4 h-4 text-zinc-800 mt-6" />
                    <div className="flex-1 space-y-2">
                        <label className="text-[8px] font-black text-zinc-700 uppercase block pl-2">Valor B (Total)</label>
                        <input className="w-full bg-zinc-900 border border-white/5 p-4 rounded-2xl text-xl font-black text-white outline-none focus:border-blis-red/30" value={b} onChange={e => setB(e.target.value)} placeholder="0" />
                    </div>
                </div>
            </div>
            <div className="bg-blis-red/5 border border-blis-red/20 p-8 rounded-[2rem] text-center">
                <div className="text-[8px] font-black text-blis-red uppercase tracking-[0.4em] mb-2">Resultado Porcentual</div>
                <div className="text-5xl font-black text-white">{res}%</div>
            </div>
        </div>
    );
};

function AverageTool() {
    const [vals, setVals] = useState<string[]>(['', '']);
    const numbers = vals.map(v => parseFloat(v)).filter(n => !isNaN(n));
    const mean = numbers.length ? (numbers.reduce((s, n) => s + n, 0) / numbers.length).toFixed(2) : '--';

    return (
        <div className="space-y-6">
            <div className="bg-black/40 p-6 rounded-xl border border-white/5">
                <div className="text-[10px] font-black text-zinc-500 uppercase mb-4 tracking-widest italic">Promedios Dinámicos</div>
                <div className="grid grid-cols-2 gap-3">
                    {vals.map((v, i) => (
                        <input key={i} className="bg-zinc-900 border border-white/5 p-4 rounded-xl text-sm font-bold text-white outline-none focus:border-emerald-500/30" value={v} onChange={e => {
                            const n = [...vals]; n[i] = e.target.value;
                            if (i === vals.length - 1 && e.target.value) n.push('');
                            setVals(n);
                        }} placeholder={`Valor ${i + 1}`} />
                    ))}
                </div>
            </div>
            <div className="bg-emerald-500/5 border border-emerald-500/20 p-8 rounded-[2rem] flex items-center justify-between">
                <div className="text-left">
                    <div className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.4em]">Media Aritmética</div>
                    <div className="text-4xl font-black text-white mt-1">{mean}</div>
                </div>
                <button onClick={() => setVals(['', ''])} className="p-4 bg-zinc-900 rounded-2xl hover:bg-zinc-800 transition-colors"><Trash2 className="w-4 h-4 text-zinc-600" /></button>
            </div>
        </div>
    );
};

function FractionTool() {
    const [dec, setDec] = useState('');
    const toFraction = (n: number) => {
        let len = n.toString().includes('.') ? n.toString().split('.')[1].length : 0;
        let den = Math.pow(10, len);
        let num = n * den;
        const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a;
        let common = gcd(num, den);
        return { num: num / common, den: den / common };
    };
    const f = dec ? toFraction(parseFloat(dec)) : null;

    return (
        <div className="space-y-6">
            <div className="bg-black/40 p-8 rounded-xl border border-white/5 text-center">
                <div className="text-[10px] font-black text-zinc-500 uppercase mb-4 tracking-widest">Decimal a Fracción</div>
                <input className="w-full bg-zinc-900 border border-white/5 p-6 rounded-2xl text-3xl font-black text-white text-center outline-none" value={dec} onChange={e => setDec(e.target.value)} placeholder="0.5" />
            </div>
            {f && (
                <div className="flex items-center justify-center gap-8 py-4">
                    <div className="text-6xl font-black text-white border-b-4 border-blis-red pb-2">{f.num}</div>
                    <div className="text-6xl font-black text-white">{f.den}</div>
                </div>
            )}
        </div>
    );
};

function NumberGenerator() {
    const [min, setMin] = useState('1');
    const [max, setMax] = useState('100');
    const [qty, setQty] = useState('1');
    const [res, setRes] = useState<number[]>([]);

    const gen = () => {
        let r = [];
        for (let i = 0; i < parseInt(qty); i++) r.push(Math.floor(Math.random() * (parseInt(max) - parseInt(min) + 1)) + parseInt(min));
        setRes(r);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                    <label className="text-[7px] font-black text-zinc-700 uppercase pl-2">Mínimo</label>
                    <input className="w-full bg-zinc-900 border border-white/5 p-4 rounded-xl text-center font-black text-white" value={min} onChange={e => setMin(e.target.value)} />
                </div>
                <div className="space-y-1">
                    <label className="text-[7px] font-black text-zinc-700 uppercase pl-2">Máximo</label>
                    <input className="w-full bg-zinc-900 border border-white/5 p-4 rounded-xl text-center font-black text-white" value={max} onChange={e => setMax(e.target.value)} />
                </div>
                <div className="space-y-1">
                    <label className="text-[7px] font-black text-zinc-700 uppercase pl-2">Cantidad</label>
                    <input className="w-full bg-zinc-900 border border-white/5 p-4 rounded-xl text-center font-black text-white" value={qty} onChange={e => setQty(e.target.value)} />
                </div>
            </div>
            <button onClick={gen} className="w-full py-5 bg-emerald-500 text-black font-black uppercase text-xs rounded-2xl shadow-lg shadow-emerald-500/10">Generar Aleatorios</button>
            <div className="flex flex-wrap gap-2 justify-center">
                {res.map((n, i) => (
                    <div key={i} className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-lg font-black text-white">{n}</div>
                ))}
            </div>
        </div>
    );
};

function CalculatorSuite() {
    const [activeSmartTool, setActiveSmartTool] = useState<string | null>(null);

    const smartTools = [
        { id: 'pct', name: 'Porcentaje', cat: 'Álgebra', icon: Percent, component: <PercentageTool /> },
        { id: 'avg', name: 'Promedio', cat: 'Estadística', icon: Hash, component: <AverageTool /> },
        { id: 'frac', name: 'Fracciones', cat: 'Álgebra', icon: Divide, component: <FractionTool /> },
        { id: 'gen', name: 'Generador', cat: 'Lógica', icon: Zap, component: <NumberGenerator /> },
        { id: 'area', name: 'Geometría', cat: 'Formas', icon: Maximize, component: <FormulaCalc /> },
    ];

    return (
        <div className="flex gap-6 w-full max-w-7xl mx-auto items-start p-2">
            {/* Standard Calculator (LEFT - ALWAYS VISIBLE) */}
            <div className="sticky top-0 shrink-0">
                <StandardCalculator />
            </div>

            {/* Smart Toolbox (RIGHT) */}
            <div className="flex-1 bg-zinc-900/40 border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl backdrop-blur-md min-h-[460px]">
                <AnimatePresence mode="wait">
                    {!activeSmartTool ? (
                        <motion.div
                            key="menu"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-6 space-y-6"
                        >
                            <div className="border-b border-white/5 pb-3">
                                <h4 className="text-[9px] font-black text-white uppercase tracking-[0.4em]">Tools Especializadas</h4>
                                <p className="text-[6px] text-zinc-600 font-black uppercase mt-1">Lógica y Cálculo Avanzado</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {smartTools.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setActiveSmartTool(t.id)}
                                        className="w-full bg-black/40 border border-white/5 p-4 rounded-xl flex items-center gap-4 hover:bg-zinc-800 transition-all group overflow-hidden"
                                    >
                                        <div className="w-9 h-9 shrink-0 rounded-lg bg-zinc-900 flex items-center justify-center border border-white/5 group-hover:border-blis-red/30 transition-all">
                                            <t.icon className="w-4 h-4 text-zinc-500 group-hover:text-blis-red" />
                                        </div>
                                        <div className="text-left truncate">
                                            <div className="text-[10px] font-black text-white uppercase tracking-wider truncate">{t.name}</div>
                                            <div className="text-[7px] font-black text-zinc-700 uppercase tracking-tighter mt-0.5 truncate">{t.cat}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="tool"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="p-6"
                        >
                            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setActiveSmartTool(null)} className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center hover:bg-zinc-800 transition-all">
                                        <ChevronRight className="w-3 h-3 text-white rotate-180" />
                                    </button>
                                    <div>
                                        <h4 className="text-[11px] font-black text-white uppercase tracking-widest leading-none">{smartTools.find(t => t.id === activeSmartTool)?.name}</h4>
                                        <span className="text-[6px] font-black text-zinc-700 uppercase tracking-[0.3em] mt-1 block">{smartTools.find(t => t.id === activeSmartTool)?.cat}</span>
                                    </div>
                                </div>
                                <div className="w-1.5 h-1.5 rounded-full bg-blis-red animate-pulse" />
                            </div>
                            <div className="max-w-2xl mx-auto">
                                {smartTools.find(t => t.id === activeSmartTool)?.component}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export const SidebarTools = () => {
    const [activeTool, setActiveTool] = useState<string>('calc');
    const [selectedCountry, setSelectedCountry] = useState('Perú');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCats, setExpandedCats] = useState<string[]>(['Favoritos', 'Finanzas']);
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        const handleOpenTool = (e: any) => {
            if (e.detail) {
                setActiveTool(e.detail);
                setIsCollapsed(false);
            }
        };
        window.addEventListener('open-blis-tool', handleOpenTool);
        return () => window.removeEventListener('open-blis-tool', handleOpenTool);
    }, []);

    const toggleCat = (cat: string) => {
        if (isCollapsed) setIsCollapsed(false);
        setExpandedCats(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
    };

    const favorites = [
        { id: 'calc', name: 'Calculadora IA', icon: CalcIcon, component: <CalculatorSuite />, cat: 'Favoritos' },
        { id: 'igv', name: 'Impuestos IA', icon: Percent, component: <IgvTool />, cat: 'Favoritos' },
        { id: 'currency', name: 'Divisas IA', icon: Coins, component: <CurrencyConverter />, cat: 'Favoritos' },
        { id: 'timer', name: 'Productividad', icon: Timer, component: <TaskTimer />, cat: 'Favoritos' },
        { id: 'unit', name: 'Metodología', icon: Scale, component: <UnitConverter />, cat: 'Favoritos' },
        { id: 'excel', name: 'Análisis Matriz', icon: TableIcon, component: <MiniSpreadsheet />, cat: 'Favoritos' },
        { id: 'formulas', name: 'Inteligencia', icon: Variable, component: <FormulaCalc />, cat: 'Favoritos' },
        { id: 'wa', name: 'Enlace Rápido', icon: MessageSquare, component: <NoteTool />, cat: 'Favoritos' },
    ];

    const allCategories = ['Favoritos', 'Finanzas', 'Logística', 'Oficina', 'Marketing', 'Técnico', 'Multimedia'];

    const filteredTools = TOOL_INDEX.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.cat.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const regionalLinks: Record<string, { name: string, url: string }[]> = {
        'Perú': [
            { name: 'SUNAT', url: 'https://www.sunat.gob.pe/' },
            { name: 'RUC / Datos', url: 'https://e-consultaruc.sunat.gob.pe/' },
            { name: 'Dólar Hoy', url: 'https://cuantoestaeldolar.pe/' },
            { name: 'Gobierno', url: 'https://www.gob.pe/' },
            { name: 'Indecopi', url: 'https://www.gob.pe/indecopi' },
            { name: 'VUCE', url: 'https://www.vuce.gob.pe/' }
        ],
        'Ecuador': [
            { name: 'SRI', url: 'https://www.sri.gob.ec/' },
            { name: 'Gob Ecuador', url: 'https://www.gob.ec/' },
            { name: 'Aduana', url: 'https://www.aduana.gob.ec/' },
            { name: 'Defensa', url: 'https://www.defensadelconsumidor.gob.ec/' }
        ],
        'Chile': [
            { name: 'SII Chile', url: 'https://www.sii.cl/' },
            { name: 'SERNAC', url: 'https://www.sernac.cl/' },
            { name: 'Aduanas', url: 'https://www.aduna.cl/' },
            { name: 'Trámites', url: 'https://www.chileatiende.gob.cl/' }
        ],
        'Colombia': [
            { name: 'DIAN', url: 'https://www.dian.gov.co/' },
            { name: 'SIC', url: 'https://www.sic.gov.co/' },
            { name: 'MUISCA', url: 'https://muisca.dian.gov.co/' }
        ],
        'Internacional': [
            { name: 'OMC', url: 'https://www.wto.org/' },
            { name: 'FedEx', url: 'https://www.fedex.com/tracking' },
            { name: 'DHL', url: 'https://www.dhl.com/' },
            { name: 'Alibaba', url: 'https://www.alibaba.com/' }
        ]
    };

    return (
        <div className="flex bg-black/40 backdrop-blur-xl border border-white/5 rounded-xl overflow-hidden h-full shadow-2xl relative">
            {/* Intelligent Sidebar */}
            <motion.div
                animate={{ width: isCollapsed ? 64 : 220 }}
                className="border-r border-white/5 bg-zinc-950/60 flex flex-col shrink-0 relative transition-all duration-300 ease-in-out"
            >
                {/* AI Status Header (Moved Here to save space) */}
                <CompactAIStatus isCollapsed={isCollapsed} />

                {/* Collapse Toggle */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-10 w-6 h-6 bg-blis-red rounded-full flex items-center justify-center text-white shadow-lg shadow-blis-red/20 z-50 hover:scale-110 transition-transform"
                >
                    {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5 rotate-180" />}
                </button>

                {/* AI Search Bar */}
                <div className="p-4 border-b border-white/5 bg-black/40 group overflow-hidden">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder={isCollapsed ? "" : "Buscar (IA)..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full bg-zinc-900/50 border border-white/10 rounded-xl text-[10px] font-black text-white placeholder:text-zinc-600 outline-none focus:border-blis-red/40 transition-all font-outfit
                                ${isCollapsed ? 'p-2 w-8 h-8' : 'p-2 pl-8'}
                            `}
                        />
                        <Search className={`absolute transition-all text-zinc-600 group-hover:text-blis-red
                            ${isCollapsed ? 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4' : 'left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5'}
                        `} />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar scrollbar-hide overflow-x-hidden">
                    {searchQuery && !isCollapsed ? (
                        <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
                            <span className="px-3 py-2 text-[7px] font-black text-zinc-700 uppercase tracking-widest block">Inteligencia Detectada</span>
                            {filteredTools.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => { setActiveTool(t.id); setSearchQuery(''); }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all text-left group"
                                >
                                    <t.icon className="w-4 h-4 shrink-0 text-zinc-700 group-hover:text-blis-red" />
                                    <div className="truncate">
                                        <div className="text-[9px] font-black uppercase truncate">{t.name}</div>
                                        <span className="text-[6px] text-blis-red font-black uppercase tracking-tighter">AI READY</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        allCategories.map(cat => (
                            <div key={cat} className="space-y-0.5">
                                {!isCollapsed && (
                                    <button
                                        onClick={() => toggleCat(cat)}
                                        className="w-full flex items-center justify-between px-3 py-2 text-[9px] font-black text-zinc-700 uppercase tracking-[0.2em] hover:text-zinc-500 transition-colors group"
                                    >
                                        <span>{cat}</span>
                                        <ChevronDown className={`w-3 h-3 transition-transform ${expandedCats.includes(cat) ? 'rotate-180' : ''}`} />
                                    </button>
                                )}

                                <AnimatePresence>
                                    {(expandedCats.includes(cat) || isCollapsed) && (
                                        <motion.div
                                            initial={isCollapsed ? { opacity: 1 } : { height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden space-y-0.5"
                                        >
                                            {(cat === 'Favoritos' ? favorites : TOOL_INDEX.filter(t => t.cat === cat)).map(t => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => setActiveTool(t.id)}
                                                    title={isCollapsed ? t.name : ""}
                                                    className={`w-full flex items-center rounded-xl transition-all group relative
                                                        ${isCollapsed ? 'justify-center py-4' : 'gap-4 px-4 py-3'}
                                                        ${activeTool === t.id
                                                            ? 'bg-white/5 text-white'
                                                            : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.01]'}
                                                    `}
                                                >
                                                    <t.icon className={`transition-transform flex-shrink-0
                                                        ${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}
                                                        ${activeTool === t.id ? 'text-blis-red scale-110' : 'text-zinc-800 group-hover:text-zinc-500'}
                                                    `} />
                                                    {!isCollapsed && (
                                                        <span className="text-[10px] font-black uppercase tracking-[0.1em] truncate">{t.name}</span>
                                                    )}
                                                    {activeTool === t.id && (
                                                        <motion.div layoutId="sidebar-active" className="absolute left-0 top-1 bottom-1 w-0.5 bg-blis-red rounded-full shadow-[0_0_8px_rgba(230,0,50,0.4)]" />
                                                    )}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))
                    )}
                </div>

                {/* Regional Utils (Bottom Fixed) */}
                <div className="p-4 border-t border-white/5 space-y-3 bg-black/20 overflow-hidden">
                    <div className="relative">
                        <select
                            value={selectedCountry}
                            onChange={(e) => setSelectedCountry(e.target.value)}
                            className={`w-full bg-zinc-900/80 border border-white/5 rounded-xl font-black text-zinc-500 outline-none appearance-none cursor-pointer hover:bg-zinc-800 transition-all
                                ${isCollapsed ? 'h-8 w-8 text-[0px] p-0' : 'p-2 text-[9px]'}
                            `}
                        >
                            {Object.keys(regionalLinks).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        {!isCollapsed && <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 w-2.5 h-2.5 text-zinc-700 pointer-events-none" />}
                        {isCollapsed && <Globe className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 pointer-events-none" />}
                    </div>
                </div>
            </motion.div>

            {/* Main Area */}
            <div className="flex-1 overflow-hidden flex flex-col items-center bg-[radial-gradient(circle_at_top_right,rgba(230,0,50,0.02),transparent)] relative">

                <div className="flex-1 w-full overflow-y-auto p-12 pb-24 flex flex-col items-center custom-scrollbar">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTool}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="w-full max-w-6xl mx-auto flex items-center justify-center"
                        >
                            {(() => {
                                const staticTool = favorites.find(t => t.id === activeTool);
                                if (staticTool) return staticTool.component;

                                const registryTool = TOOL_INDEX.find(t => t.id === activeTool);
                                if (registryTool) return <SmartAITool tool={registryTool} />;

                                return (
                                    <div className="bg-zinc-950 p-12 rounded-xl border border-white/5 text-center space-y-6 max-w-md shadow-2xl relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-blis-red/5 animate-pulse" />
                                        <Sparkles className="w-16 h-16 text-blis-red mx-auto relative z-10" />
                                        <div className="relative z-10 space-y-2">
                                            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Motor Cognitivo</h3>
                                            <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest">Alineando inteligencia para {activeTool}...</p>
                                            <div className="pt-6">
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blis-red animate-bounce [animation-delay:-0.3s]" />
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blis-red animate-bounce [animation-delay:-0.15s]" />
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blis-red animate-bounce" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
