"use client";

import React from 'react';
import { Bot, Send, TrendingUp, TrendingDown, ChevronUp, ChevronDown, Zap, Brain, Bell, BellOff, Trash2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { safeText } from '../TerminalComponents';
import type {
  ChatMessage, ControlMode, AutoPilotState, ManualStrategy, BacktestResult,
  MarketSentimentData, ManualChatEntry, AiKnowledge, ConfirmAction, ManualExecStatusData
} from '../_types';

interface TerminalChatProps {
  controlMode: ControlMode;
  setControlMode: (mode: ControlMode) => void;
  autoPilot: AutoPilotState;
  setAutoPilot: (v: AutoPilotState | ((prev: AutoPilotState) => AutoPilotState)) => void;
  botBudget: number;
  setBotBudget: (v: number) => void;
  freeBudget: boolean;
  setFreeBudget: (v: boolean) => void;
  userLeverage: number;
  setUserLeverage: (v: number) => void;
  aiConfigExpanded: boolean;
  setAiConfigExpanded: (v: boolean) => void;
  aiLearningEnabled: boolean;
  setAiLearningEnabled: (v: boolean) => void;
  enableNotifications: boolean;
  setEnableNotifications: (v: boolean) => void;
  signalAlertActive?: boolean;
  botMode: string;
  setBotMode: (v: string) => void;
  showModeSelect: boolean;
  setShowModeSelect: (v: boolean) => void;
  startAutoPilotManual: (mode?: string, freeBudget?: boolean) => void;
  stopAutoPilotManual: (soft?: boolean) => void;
  chatMessages: ChatMessage[];
  chatInput: string;
  setChatInput: (v: string) => void;
  isTyping: boolean;
  chatScrollRef: React.RefObject<HTMLDivElement | null>;
  hasUnreadMessages: boolean;
  setHasUnreadMessages: (v: boolean) => void;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  formatChatTime: (ts: number) => string;
  handleSendMessage: (e: React.FormEvent) => void;
  setConfirmAction: (v: ConfirmAction | null) => void;
  manualTradeAmt: number;
  setManualTradeAmt: (v: number) => void;
  manualStrategy: ManualStrategy;
  setManualStrategy: (v: ManualStrategy | ((prev: ManualStrategy) => ManualStrategy)) => void;
  manualExecStatus: ManualExecStatusData | null;
  executeManualSignal: (type: 'BUY' | 'SELL', customAmt?: number) => void;
  isManualChatThinking: boolean;
  setIsManualChatThinking: (v: boolean) => void;
  manualChatInput: string;
  setManualChatInput: (v: string) => void;
  manualChatHistory: ManualChatEntry[];
  setManualChatHistory: (v: ManualChatEntry[] | ((prev: ManualChatEntry[]) => ManualChatEntry[])) => void;
  handleManualEval: () => void;
  handleBacktest: () => void;
  isBacktesting: boolean;
  backtestResult: BacktestResult | null;
  marketSentiment: MarketSentimentData | null;
  onClearChat?: () => void;
  isEvaluatingSentiment: boolean;
  handleSentimentEval: () => void;
  aiKnowledge: AiKnowledge[];
  manualRulesExpanded: boolean;
  setManualRulesExpanded: (v: boolean) => void;
  manualBeExpanded: boolean;
  setManualBeExpanded: (v: boolean) => void;
  closeAllPositions: () => void;
  now: number;
  handleSymbolChange: (sym: string, force?: boolean) => void;
  onScannerLog?: (par: string, mensaje: string, tipo: 'scan' | 'warning' | 'valid') => void;
}

export const TerminalChat: React.FC<TerminalChatProps> = ({
  controlMode, setControlMode, autoPilot, setAutoPilot, botBudget, setBotBudget, freeBudget, setFreeBudget,
  userLeverage, setUserLeverage, aiConfigExpanded, setAiConfigExpanded, aiLearningEnabled,
  setAiLearningEnabled, enableNotifications, setEnableNotifications, signalAlertActive,
  botMode, setBotMode, showModeSelect, setShowModeSelect, startAutoPilotManual, stopAutoPilotManual,
  chatMessages, chatInput, setChatInput, isTyping, chatScrollRef, hasUnreadMessages,
  setHasUnreadMessages, chatEndRef, formatChatTime, handleSendMessage, setConfirmAction,
  manualTradeAmt, setManualTradeAmt, manualStrategy, setManualStrategy, manualExecStatus,
  executeManualSignal, isManualChatThinking, setIsManualChatThinking, manualChatInput, setManualChatInput,
  manualChatHistory, setManualChatHistory, handleManualEval, handleBacktest, isBacktesting,
  backtestResult, marketSentiment, isEvaluatingSentiment, handleSentimentEval,
  aiKnowledge, manualRulesExpanded, setManualRulesExpanded, manualBeExpanded,
  setManualBeExpanded, closeAllPositions, now, handleSymbolChange, onScannerLog, onClearChat
}) => {
  return (
    <div className="w-full md:w-72 lg:w-80 h-auto md:h-full border-t md:border-t-0 md:border-l border-white/5 bg-[#0b0e11] flex flex-col shrink-0 z-10 relative min-h-0">
      <div className="p-4 flex justify-between items-center bg-black/20 border-b border-white/5">
        <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" title="Online" /></div>
        <div className="flex items-center gap-2">
          <div className="flex bg-black/40 p-1 rounded-full border border-white/5 mr-2 shadow-inner">
            <button onClick={() => setControlMode('AI')} className={`flex-1 px-4 py-2.5 rounded-2xl text-[11px] font-black transition-all flex items-center justify-center gap-2 ${controlMode === 'AI' ? 'bg-blis-red text-white shadow-[0_0_20px_rgba(255,0,76,0.4)]' : 'text-gray-500 hover:text-white bg-white/5'}`}>IA</button>
            <button onClick={() => setControlMode('MANUAL')} className={`flex-1 px-4 py-2.5 rounded-2xl text-[11px] font-black transition-all flex items-center justify-center gap-2 ${controlMode === 'MANUAL' ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'text-gray-500 hover:text-white bg-white/5'}`}>MANUAL</button>
          </div>
          <button onClick={() => setEnableNotifications(!enableNotifications)} className="relative text-gray-400 hover:text-white transition-colors" title={enableNotifications ? "Silenciar Alertas (Radar)" : "Activar Alertas (Radar)"}>
            {signalAlertActive && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>}
            {signalAlertActive && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full"></span>}
            {enableNotifications ? <Bell size={14} className={signalAlertActive ? 'text-emerald-400 drop-shadow-[0_0_6px_rgba(16,185,129,0.8)]' : 'text-emerald-400'} /> : <BellOff size={14} className="text-blis-red-neon" />}
          </button>
          <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-black text-emerald-400 shrink-0">PRO</div>
        </div>
      </div>

      {controlMode === 'AI' && (
        <div className="space-y-4">
          <div className="bg-black/30 rounded-3xl border border-white/5 overflow-hidden">
            <button onClick={() => setAiConfigExpanded(!aiConfigExpanded)} className="w-full p-4 flex justify-between items-center hover:bg-white/5 transition-all">
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Ajustes del Robot</span>
              {aiConfigExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            <AnimatePresence>
              {aiConfigExpanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-5 pb-5 space-y-4">
                  <div className="flex items-center justify-between pt-2">
                    <div><p className="text-[10px] font-black uppercase text-white tracking-widest leading-none">Capital Pro</p><p className="text-[8px] text-gray-500 mt-1">Presupuesto Dinámico</p></div>
                    <button onClick={() => setFreeBudget(!freeBudget)} className={`w-10 h-5 rounded-full transition-all relative ${freeBudget ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-white/10'}`}><div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${freeBudget ? 'left-6' : 'left-1'}`}></div></button>
                  </div>
                  {!freeBudget && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="pt-2">
                      <div className="flex items-center justify-between bg-black/60 px-3 py-2.5 rounded-xl border border-blis-red/20 shadow-inner">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Capital por Trade</span>
                        <div className="flex items-center gap-1"><span className="text-blis-red-neon font-mono text-[10px]">$</span><input type="number" value={botBudget} onChange={e => setBotBudget(Number(e.target.value))} className="w-16 bg-transparent text-white font-mono text-[12px] focus:outline-none font-bold text-right" placeholder="USD" /></div>
                      </div>
                      <div className="flex justify-between items-center"><label className="text-[8px] font-black uppercase text-gray-500">Apalancamiento (Multiplicador)</label>{userLeverage === 0 && <span className="text-[8px] text-emerald-400 font-bold animate-pulse">IA CONTROL ACTIVO</span>}</div>
                      <div className="grid grid-cols-5 gap-1.5">{[0, 1, 5, 10, 20].map(v => (<button key={v} onClick={() => setUserLeverage(v)} className={`py-1.5 rounded-lg text-[9px] font-black border transition-all ${userLeverage === v ? 'bg-blis-red text-white border-blis-red' : 'text-gray-500 border-white/10'}`}>{v === 0 ? 'AUTO' : `x${v}`}</button>))}</div>
                    </motion.div>
                  )}
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <div><p className="text-[12px] font-black uppercase text-white tracking-widest leading-none">Tiempo Robot</p><p className="text-[10px] text-gray-500 mt-1">{autoPilot.isIndefinite ? '♾️ Indefinido' : '⏱ Con Límite'}</p></div>
                    <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                      <button onClick={() => setAutoPilot({...autoPilot, isIndefinite: true})} className={`px-3 py-1 rounded-lg text-[8px] font-black transition-all ${autoPilot.isIndefinite ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}>∞</button>
                      <button onClick={() => setAutoPilot({...autoPilot, isIndefinite: false})} className={`px-3 py-1 rounded-lg text-[8px] font-black transition-all ${!autoPilot.isIndefinite ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}>⏱</button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest">IA Auto-Aprende</span>
                    <button onClick={() => setAiLearningEnabled(!aiLearningEnabled)} className={`relative w-8 h-5 rounded-full transition-all ${aiLearningEnabled ? 'bg-blis-red' : 'bg-white/10'}`}><div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${aiLearningEnabled ? 'left-3.5' : 'left-0.5'}`} /></button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <div className={`w-full py-2.5 rounded-xl text-[9px] font-black tracking-wider transition-all uppercase flex items-center justify-center gap-2 ${autoPilot.active ? 'bg-blis-red text-white shadow-lg shadow-blis-red/20 animate-pulse' : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'}`}>
              <span className="cursor-pointer flex-1 text-center" onClick={() => autoPilot.active ? stopAutoPilotManual() : startAutoPilotManual(botMode, freeBudget)}>{autoPilot.active ? '⏹ Detener Robot' : '▶ Iniciar Robot'}</span>
              <div onClick={(e) => { e.stopPropagation(); setShowModeSelect(!showModeSelect); }} className="cursor-pointer px-1.5 py-0.5 rounded-md bg-white/10 hover:bg-white/20 transition-all flex items-center gap-1 mr-2">
                <span className="text-[8px] font-bold opacity-70">{botMode === 'SCALPING' ? 'SCALP' : botMode === 'SWING' ? 'SWING' : 'POS.'}</span>
                <ChevronDown size={9} className={`opacity-50 transition-transform ${showModeSelect ? 'rotate-180' : ''}`} />
              </div>
            </div>
            <AnimatePresence>
              {showModeSelect && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="absolute bottom-full left-0 right-0 mb-1 bg-[#0d0d0d]/95 backdrop-blur-2xl border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 p-1">
                  {[
                    { val: 'SCALPING', label: 'SCALPING', icon: <Zap size={11} />, desc: 'Ganancias rápidas' },
                    { val: 'SWING', label: 'SWING', icon: <TrendingUp size={11} />, desc: 'Tendencia macro' },
                    { val: 'POSITION', label: 'POSICIÓN', icon: <Brain size={11} />, desc: 'Largo plazo' }
                  ].map(m => (
                    <button key={m.val} type="button" onClick={() => { setBotMode(m.val); setShowModeSelect(false); }} className={`w-full p-2 rounded-lg flex items-center gap-2 transition-all ${botMode === m.val ? 'bg-blis-red/20 text-blis-red-neon' : 'text-gray-400 hover:bg-white/5'}`}>
                      <div className="shrink-0">{m.icon}</div>
                      <div className="text-left"><span className="block text-[8px] font-black uppercase tracking-widest leading-none">{m.label}</span><span className="text-[7px] opacity-40 leading-none">{m.desc}</span></div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {controlMode === 'MANUAL' && (
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-4 pb-10">
          <div className="p-5 border-b border-white/5 bg-black/40 space-y-4 rounded-3xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Ejecución Directa</span>
              <div className="flex items-center gap-2 bg-black/60 px-2 py-1 rounded-lg border border-white/5"><span className="text-emerald-500 font-mono text-[10px]">$</span><input type="number" value={manualTradeAmt} onChange={e => setManualTradeAmt(Number(e.target.value))} className="w-16 bg-transparent text-white font-mono text-[11px] focus:outline-none" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => executeManualSignal('BUY')} disabled={manualExecStatus?.type === 'loading'} className="py-6 bg-emerald-500 shadow-[0_10px_30px_rgba(16,185,129,0.3)] rounded-2xl flex flex-col items-center justify-center gap-1 transition-all group hover:-translate-y-1 disabled:opacity-50 disabled:cursor-wait">
                <TrendingUp size={24} className="text-black group-hover:scale-110 transition-transform" />
                <span className="text-[14px] font-black text-black tracking-tighter uppercase">COMPRAR</span>
              </button>
              <button onClick={() => executeManualSignal('SELL')} disabled={manualExecStatus?.type === 'loading'} className="py-6 bg-blis-red shadow-[0_10px_30px_rgba(255,0,76,0.3)] rounded-2xl flex flex-col items-center justify-center gap-1 transition-all group hover:-translate-y-1 disabled:opacity-50 disabled:cursor-wait">
                <TrendingDown size={24} className="text-white group-hover:scale-110 transition-transform" />
                <span className="text-[14px] font-black text-white tracking-tighter uppercase">VENDER</span>
              </button>
            </div>
            {manualExecStatus && (
              <div className={`p-3 rounded-xl text-[10px] font-bold border chat-selectable ${manualExecStatus.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : manualExecStatus.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse'}`}>
                {manualExecStatus.type === 'loading' ? '⏳' : manualExecStatus.type === 'success' ? '✅' : '⚠️'} {manualExecStatus.text}
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={handleManualEval} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5">Auto-Evaluar</button>
              <button onClick={handleBacktest} disabled={isBacktesting} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${isBacktesting ? 'bg-orange-500/20 text-orange-400 border-orange-500/20' : 'bg-blis-red/5 hover:bg-blis-red text-white/50 hover:text-white border-blis-red/10'}`}>{isBacktesting ? 'Simulando...' : 'Backtest IA'}</button>
            </div>
          </div>

          <div className="p-5 bg-black/30 rounded-3xl border border-white/5 space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Psicología del Mercado</span>
                <button onClick={handleSentimentEval} disabled={isEvaluatingSentiment} className="text-blis-red-neon hover:text-white transition-all"><Brain size={13} className={isEvaluatingSentiment ? 'animate-pulse' : ''} /></button>
              </div>
              {marketSentiment ? (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4">
                  <div className="relative w-10 h-10 shrink-0">
                    <svg className="w-full h-full" viewBox="0 0 36 36"><circle cx="18" cy="18" r="16" fill="none" className="text-white/5" stroke="currentColor" strokeWidth="3" /><circle cx="18" cy="18" r="16" fill="none" className="text-emerald-500" stroke="currentColor" strokeWidth="3" strokeDasharray="100" strokeDashoffset={100 - marketSentiment.score} strokeLinecap="round" transform="rotate(-90 18 18)" /></svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black font-mono">{marketSentiment.score}%</span>
                  </div>
                  <div className="flex-1"><p className="text-[10px] font-black text-emerald-400 leading-none">{marketSentiment.label}</p><p className="text-[8px] text-gray-500 mt-1 leading-tight">{marketSentiment.logic}</p></div>
                </motion.div>
              ) : (
                <button onClick={handleSentimentEval} className="w-full py-2 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-500/60 rounded-xl text-[9px] font-black border border-emerald-500/10">Analizar Sentimiento IA</button>
              )}
            </div>
            {backtestResult && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 bg-blis-red/5 border border-blis-red/20 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-[9px] font-black uppercase text-gray-400 tracking-widest"><Sparkles size={11} className="text-amber-400" /> Éxito Predicho</div>
                <div className="flex items-baseline gap-2"><span className="text-2xl font-black text-white">{backtestResult.winRate}%</span><span className="text-[9px] text-emerald-400 font-bold">WR Est.</span></div>
                <div className="flex justify-between items-center pt-2 border-t border-white/5 opacity-60"><span className="text-[8px] font-mono text-gray-500">Muestra: {backtestResult.period}</span><span className="text-[9px] font-black text-white">+${backtestResult.totalProfit}</span></div>
              </motion.div>
            )}
          </div>

          <div className="bg-black/30 rounded-3xl border border-white/5 overflow-hidden flex flex-col min-h-[120px] max-h-[220px]">
            <div className="p-3 bg-white/5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2"><Sparkles size={12} className="text-amber-400" /><span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Asistente Estratégico AI</span></div>
              <button onClick={() => setConfirmAction({ title: 'Limpiar Estrategias', msg: '¿Deseas vaciar el historial de recomendaciones estratégicas del asistente?', onConfirm: () => setManualChatHistory([]) })} className="p-1.5 hover:bg-white/5 rounded-lg text-gray-600 hover:text-blis-red transition-colors" title="Limpiar Conversación"><Trash2 size={12} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar text-[10px]">
              {manualChatHistory.length === 0 && <p className="text-gray-600 italic">Describe una estrategia y te daré sugerencias visuales.</p>}
              {manualChatHistory.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3 py-1.5 rounded-2xl ${m.role === 'user' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-white/5 border border-white/5 text-gray-300'}`}>{safeText(m.text)}</div>
                </div>
              ))}
              {isManualChatThinking && <div className="text-[9px] text-gray-500 animate-pulse">Analizando...</div>}
            </div>
            <div className="p-3 border-t border-white/5 flex gap-2">
              <input value={manualChatInput} onChange={e => setManualChatInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && manualChatInput.trim()) { const prompt = manualChatInput; setManualChatInput(''); setManualChatHistory((prev: ManualChatEntry[]) => [...prev, { role: 'user', text: prompt }]); setIsManualChatThinking(true); setTimeout(() => { setManualStrategy((prev: ManualStrategy) => ({ ...prev, emaFast: 12, emaSlow: 26, rsiPeriod: 14, rsiBuy: 30, rsiSell: 70, stochK: 14, stochD: 3, stochOverbought: 80, stochOversold: 20 })); setManualChatHistory((prev: ManualChatEntry[]) => [...prev, { role: 'bot', text: "Entendido. He marcado mis sugerencias en el panel manual." }]); setIsManualChatThinking(false); }, 1500); } }} placeholder="Escribe tu estrategia..." className="flex-1 bg-black/50 border border-white/5 rounded-xl px-3 py-1.5 text-[10px] focus:outline-none" />
            </div>
          </div>

          <div className="bg-black/30 rounded-3xl border border-white/5 overflow-hidden">
            <button onClick={() => setManualRulesExpanded(!manualRulesExpanded)} className="w-full p-4 flex justify-between items-center hover:bg-white/5"><span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Reglas del Sistema</span>{manualRulesExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</button>
            <AnimatePresence>
              {manualRulesExpanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-5 pb-5 space-y-4">
                  {[
                    { label: 'Ondas rápidas (EMA)', key: 'emaFast', min: 1, max: 100 }, { label: 'Ondas lentas (EMA)', key: 'emaSlow', min: 1, max: 200 },
                    { label: 'RSI Period', key: 'rsiPeriod', min: 1, max: 30 }, { label: 'Estocástico %K', key: 'stochK', min: 1, max: 100 },
                    { label: 'Sobrecompra Estoc.', key: 'stochOverbought', min: 50, max: 100 }, { label: 'Sobreventa Estoc.', key: 'stochOversold', min: 1, max: 50 }
                  ].map(item => (
                    <div key={item.key}><div className="flex justify-between items-center mb-1"><span className="text-[10px] text-gray-500 font-bold">{item.label}</span><span className="text-[10px] text-white font-mono">{String(manualStrategy[item.key as keyof ManualStrategy])}</span></div>
                    <input type="range" min={item.min} max={item.max} value={Number(manualStrategy[item.key as keyof ManualStrategy])} onChange={e => setManualStrategy({...manualStrategy, [item.key]: parseInt(e.target.value)})} className="w-full h-1 bg-white/10 rounded-full appearance-none accent-blis-red" /></div>
                  ))}
                  <div className="flex flex-col gap-2 mt-4">
                    <button onClick={handleManualEval} className="w-full py-2 bg-white/5 text-white rounded-xl text-[10px] font-black uppercase tracking-wider">Evaluar Mercado</button>
                    <button onClick={closeAllPositions} className="w-full py-2 bg-blis-red/10 text-white rounded-xl text-[10px] font-black uppercase tracking-wider">Cerrar Todo</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {controlMode === 'AI' && (
        <>
          <div className="px-4 py-3 bg-[#050505] border-b border-white/5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2"><Bot size={13} className="text-blis-red-neon" /><span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Chat con el Agente</span></div>
            <button onClick={() => setConfirmAction({ title: 'Vaciar Bitácora', msg: '¿Estás seguro que deseas borrar todos los mensajes y alertas del agente? El historial actual se perderá permanentemente.', onConfirm: () => { onClearChat?.() } })} className="p-1.5 hover:bg-white/5 rounded-lg text-gray-600 hover:text-blis-red transition-colors" title="Limpiar Bitácora"><Trash2 size={13} /></button>
          </div>
          <div ref={chatScrollRef} className="h-[350px] md:flex-1 overflow-y-auto p-4 space-y-4 bg-[#0b0e11] scrollbar-thin scrollbar-thumb-white/10 chat-selectable relative">
            {chatMessages.map((msg, i) => {
              const isRec = msg.type === 'signal';
              const isRecommendation = msg.type === 'recommendation';
              const timeLeft = msg.expiresAt ? Math.max(0, msg.expiresAt - now) : 0;
              return (
                <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] p-3 rounded-2xl text-[11px] leading-relaxed whitespace-pre-wrap shadow-xl ${msg.role === 'user' ? 'bg-blis-red text-white' : isRecommendation ? 'bg-blue-950/40 border border-blue-400/30 text-blue-100' : isRec ? 'bg-emerald-900/30 border border-emerald-500/30 text-emerald-100' : 'bg-[#050505] border border-white/5 text-gray-400'}`}>
                    {msg.role === 'bot' && (
                      <div className="text-[8px] font-black uppercase mb-1 opacity-50 flex items-center gap-1">
                        {isRecommendation ? <span>🔍</span> : isRec ? <Zap size={8} className="text-emerald-400 animate-pulse" /> : <Bot size={8} />}
                        {isRecommendation ? 'RADAR IA: ANÁLISIS DE MERCADO' : isRec ? 'RADAR IA: OPORTUNIDAD' : 'ASISTENTE'}
                      </div>
                    )}
                    {safeText(msg.text)}
                    {isRecommendation && msg.recommendedSymbol && (
                      <button onClick={() => handleSymbolChange(msg.recommendedSymbol || '', true)} className="w-full mt-3 py-2 px-3 rounded-lg font-black text-[10px] uppercase tracking-wider bg-blue-500 hover:bg-blue-400 text-black transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20">
                        <span>→</span> IR A {msg.recommendedSymbol?.replace('USDT', '/USDT')}
                      </button>
                    )}
                    {isRec && timeLeft > 0 && msg.status === 'pending' && (
                      <button className="w-full bg-emerald-500 text-black font-black py-2 rounded-lg mt-3 text-[9px] hover:bg-emerald-400 active:scale-95 transition-all flex items-center justify-center gap-2">
                        <Zap size={10} fill="currentColor" /> EJECUTAR ORDEN [ 00:{(timeLeft / 1000).toFixed(0).padStart(2, '0')} ]
                      </button>
                    )}
                    {isRec && (msg.status === 'executed' || timeLeft <= 0) && msg.status !== 'executed' && (
                      <div className="w-full bg-white/5 text-gray-500 py-2 rounded-lg mt-3 text-[9px] text-center border border-white/5">ALERTA EXPIRADA</div>
                    )}
                    {isRec && msg.status === 'executed' && (
                      <div className="w-full bg-emerald-500/10 text-emerald-400 py-2 rounded-lg mt-3 text-[9px] text-center border border-emerald-500/20 font-black">POSICIÓN ABIERTA</div>
                    )}
                    <div className="text-[10px] text-right mt-2 opacity-50 font-mono">{formatChatTime(msg.timestamp)}</div>
                  </div>
                </motion.div>
              );
            })}
            {isTyping && <div className="text-[9px] text-blis-red-neon font-black animate-pulse px-2">IA PROCESANDO...</div>}
            {hasUnreadMessages && (
              <button onClick={() => { chatScrollRef.current?.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: 'smooth' }); setHasUnreadMessages(false); }} className="sticky bottom-2 left-1/2 -translate-x-1/2 z-20 bg-blis-red text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-full shadow-lg shadow-blis-red/40 animate-bounce flex items-center gap-1.5">
                <span>▼</span> Nuevo mensaje
              </button>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-3 bg-[#0b0e11] border-t border-white/5 space-y-3">
            <div className="flex gap-1.5">
              <button type="button" onClick={() => setChatInput('Activa autopilot SCALPING ultra agresivo con máximo riesgo.')} className="flex-1 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 p-2 rounded-xl transition-all active:scale-95"><span className="text-[8px] font-black text-red-400 uppercase tracking-wider">🔥 Scalp</span></button>
              <button type="button" onClick={() => setChatInput('Activa el modo SWING con la Inteligencia Artificial (Moderado). Analiza macro y opera solo con confirmación.')} className="flex-1 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 p-2 rounded-xl transition-all active:scale-95"><span className="text-[8px] font-black text-amber-400 uppercase tracking-wider">⚡ Swing AI</span></button>
              <button type="button" onClick={() => setChatInput('Inicia autopilot SCALPING en modo defensivo y seguro.')} className="flex-1 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 p-2 rounded-xl transition-all active:scale-95"><span className="text-[8px] font-black text-emerald-400 uppercase tracking-wider">🛡️ Seguro</span></button>
            </div>
            <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
              <textarea value={chatInput} onChange={e => { setChatInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e as unknown as React.FormEvent); } }} placeholder="Instruye al bot..." rows={1} className="flex-1 bg-black/40 border border-white/10 rounded-xl p-3 text-[10px] font-medium outline-none focus:border-blis-red/40 text-white placeholder:text-gray-700 font-mono resize-none overflow-hidden" />
              <button type="submit" className="bg-blis-red/20 border border-blis-red/40 p-3 rounded-xl hover:bg-blis-red-neon transition-all group active:scale-90 shrink-0"><Send size={14} className="text-white group-hover:scale-110 transition-transform" /></button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};