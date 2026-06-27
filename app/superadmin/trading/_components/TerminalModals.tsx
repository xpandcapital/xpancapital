"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Bot, Brain, Sparkles, Trash2, X, Target, BookOpen } from 'lucide-react';
import type {
  MarketTicker, GlobalAlert, ConfirmAction, SessionReport, SimInfoData,
  OpenPosition, TradeHistoryEntry, TradeReplayData, TickerState, PnlData,
  DataSource, SimMode, CandleData
} from '../_types';

interface TerminalModalsProps {
  showSymbolSelector: boolean;
  searchSymbol: string;
  dataSource: DataSource;
  simMode: SimMode;
  marketTickers: MarketTicker[];
  favoriteSymbols: string[];
  activeSymbol: string;
  globalAlert: GlobalAlert | string | null;
  confirmAction: ConfirmAction | null;
  sessionReport: SessionReport | null;
  showSimInfo: SimInfoData | null;
  selectedPositionId: string | null;
  openPositions: OpenPosition[];
  tradeHistory: TradeHistoryEntry[];
  tradeMode: string;
  activeSymbolRef: React.RefObject<string>;
  ticker: TickerState;
  currentPriceRef: React.RefObject<number>;
  onSetShowSymbolSelector: (v: boolean) => void;
  onSetSearchSymbol: (v: string) => void;
  onSetDataSource: (v: DataSource) => void;
  onSetActiveSymbol: (v: string) => void;
  onSetSimMode: (v: SimMode) => void;
  onSetShowSimInfo: (v: SimInfoData | null) => void;
  onHandleSymbolChange: (sym: string, force?: boolean) => void;
  onToggleFavorite: (sym: string, e: React.MouseEvent) => void;
  onSetGlobalAlert: (v: GlobalAlert | string | null) => void;
  onSetConfirmAction: (v: ConfirmAction | null) => void;
  onSetSessionReport: (v: SessionReport | null) => void;
  onSetSelectedPositionId: (v: string | null) => void;
  onSetTradeReplayData: (v: TradeReplayData | null) => void;
  getPnlData: (pos: OpenPosition) => PnlData;
  fmtUsd: (val: number) => string;
  formatTimePassed: (ms: number) => string;
  safeText: (val: string | number | null | undefined) => string;
  closeTradeManual: (id: string) => void;
  candles: CandleData[];
  isMounted: boolean;
}

export const TerminalModals: React.FC<TerminalModalsProps> = ({
  showSymbolSelector, searchSymbol, dataSource, simMode, marketTickers,
  favoriteSymbols, activeSymbol, globalAlert, confirmAction, sessionReport,
  showSimInfo, selectedPositionId, openPositions, tradeHistory, tradeMode,
  ticker, getPnlData, fmtUsd, formatTimePassed, safeText, closeTradeManual,
  onSetShowSymbolSelector, onSetSearchSymbol, onSetDataSource, onSetActiveSymbol,
  onSetSimMode, onSetShowSimInfo, onHandleSymbolChange, onToggleFavorite,
  onSetGlobalAlert, onSetConfirmAction, onSetSessionReport, onSetSelectedPositionId,
  currentPriceRef, onSetTradeReplayData, isMounted, candles
}) => {
  return (
    <>
      <AnimatePresence>
        {selectedPositionId && (() => {
          const p = openPositions.find(x => x.id === selectedPositionId) || tradeHistory.find(x => x.id === selectedPositionId);
          if (!p) return null;
          const pnl = getPnlData(p as any);
          const popupRoi = p.finalPnlPercent != null ? p.finalPnlPercent : (p.amount > 0 ? ((p.finalPnl || 0) / p.amount) * 100 : 0);
          const popupOpenTag = p.openedBy === 'IA' ? 'IA' : 'H';
          const popupCloseTag = p.closedBy === 'IA' ? 'IA' : 'H';
          const popupIdShort = (p.id || '').toString().slice(-6).toUpperCase();
          return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4">
              <motion.div initial={{ scale: 0.95, y: 40 }} animate={{ scale: 1, y: 0 }} className="bg-[#0a0a0f] border border-white/10 rounded-t-[28px] sm:rounded-[28px] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className={`p-4 sm:p-6 border-b border-white/5 flex justify-between items-center ${p.type === 'BUY' ? 'bg-emerald-500/10' : 'bg-blis-red/10'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl ${p.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blis-red/20 text-blis-red-neon'}`}>
                      {p.type === 'BUY' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-white">{p.type} {p.mode}</h3>
                      <p className="text-[10px] text-gray-500 font-mono">{popupOpenTag}-{popupIdShort}-{popupCloseTag}</p>
                    </div>
                  </div>
                  <button onClick={() => onSetSelectedPositionId(null)} className="text-gray-500 hover:text-white p-2"><X size={20} /></button>
                </div>
                <div className="p-5 sm:p-8 space-y-5">
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 text-center">
                    <div className="bg-white/5 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/5"><span className="text-[9px] text-gray-500 block uppercase mb-1">{p.status === 'CLOSED' ? 'P/L Final' : 'P/L Vivo'}</span><span className={`text-lg sm:text-xl font-black ${p.status === 'CLOSED' ? ((p.finalPnl || 0) >= 0 ? 'text-emerald-400' : 'text-blis-red-neon') : (pnl.isProfit ? 'text-emerald-400' : 'text-blis-red-neon')}`}>${p.status === 'CLOSED' ? (p.finalPnl || 0).toFixed(2) : pnl.value.toFixed(2)}</span></div>
                    <div className="bg-white/5 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/5"><span className="text-[9px] text-gray-500 block uppercase mb-1">Apalancamiento</span><span className="text-lg sm:text-xl font-black text-white">x{p.leverage}</span></div>
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-[11px]"><span className="text-gray-500">Inversión (Total)</span><span className="text-white font-mono">${(p.amount * p.leverage).toFixed(2)}</span></div>
                    <div className="flex justify-between text-[11px]"><span className="text-gray-500">Precio Entrada</span><span className="text-white font-mono">${p.entryPrice < 100 ? p.entryPrice.toFixed(6) : p.entryPrice.toFixed(2)}</span></div>
                    {p.status === 'CLOSED' ? (
                      <>
                        <div className="flex justify-between text-[11px]"><span className="text-gray-500">Precio Cierre</span><span className="text-white font-mono font-bold">${(p.closePrice || 0) < 100 ? (p.closePrice || 0).toFixed(6) : (p.closePrice || 0).toFixed(2)}</span></div>
                        <div className="flex justify-between text-[11px]"><span className="text-gray-500 font-black text-emerald-500/60 uppercase">ROI Final</span><span className={`font-mono font-bold ${(p.finalPnl || 0) >= 0 ? 'text-emerald-400' : 'text-blis-red-neon'}`}>{popupRoi >= 0 ? '+' : ''}{popupRoi.toFixed(2)}%</span></div>
                        <div className="flex justify-between text-[11px]"><span className="text-gray-500">Tiempo Ejecución</span><span className="text-gray-300 font-mono italic">{(() => { const dur = (p.closeTime || Date.now()) - (p.openTime || Date.now()); return `${Math.floor(dur / 60000)}m ${Math.floor((dur % 60000) / 1000)}s`; })()}</span></div>
                        <div className="flex justify-between text-[11px]"><span className="text-gray-500">Operado por</span><span className="text-white font-mono">{p.openedBy === 'IA' ? '🤖 IA' : '👤 Humano'} → {p.closedBy === 'IA' ? '🤖 IA' : '👤 Humano'}</span></div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between text-[11px]"><span className="text-gray-500 font-black text-emerald-500/60 uppercase">Objetivo IA</span><span className="text-emerald-400 font-mono font-bold">${p.targetPrice?.toFixed(2) || 'N/A'}</span></div>
                        <div className="flex justify-between text-[11px]"><span className="text-gray-500 font-black text-blis-red-neon/60 uppercase">Stop Loss IA</span><span className="text-blis-red-neon font-mono font-bold">${p.stopPrice?.toFixed(2) || 'N/A'}</span></div>
                      </>
                    )}
                    <div className="flex justify-between text-[11px]"><span className="text-gray-500 uppercase">Comisión Broker</span><span className="text-rose-400 font-mono">-${p.status === 'CLOSED' ? (p.fee || 0).toFixed(2) : pnl.fee.toFixed(2)}</span></div>
                  </div>
                  <div className="pt-4 border-t border-white/5">
                    <h4 className="text-[10px] font-black text-blis-red-neon mb-2 uppercase flex items-center gap-2"><Bot size={14} /> Análisis de Ejecución</h4>
                    <p className="text-[11px] text-gray-400 leading-relaxed italic">"{p.explanation || 'Análisis matemático basado en confluencias SMA y acción de precio HFT.'}"</p>
                    {p.closeReason && <p className="text-[10px] text-gray-500 mt-2 font-mono">Motivo: {safeText(p.closeReason)}</p>}
                  </div>
                  <button onClick={() => onSetSelectedPositionId(null)} className="w-full bg-white text-black py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[11px] tracking-widest uppercase mt-3">ENTENDIDO</button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {sessionReport && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
          <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#050505] border border-white/10 rounded-[40px] w-full max-w-2xl overflow-hidden shadow-[0_0_100px_rgba(190,11,60,0.3)]">
            <div className="p-8 border-b border-white/5 bg-gradient-to-br from-blis-red/10 to-transparent flex justify-between items-center">
              <div className="flex items-center gap-4"><div className="p-4 bg-blis-red/20 rounded-3xl text-blis-red-neon"><Brain size={32} /></div><div><h2 className="text-2xl font-black text-white">{sessionReport.title}</h2><p className="text-[9px] text-blis-red-neon font-black tracking-[0.2em] uppercase mt-1">SISTEMA FINALIZADO</p></div></div>
              <button onClick={() => onSetSessionReport(null)} className="text-gray-500 hover:text-white"><X size={24} /></button>
            </div>
            <div className="p-10 space-y-8">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-black/40 p-6 rounded-[30px] border border-white/5 text-center"><span className="text-[9px] text-gray-500 font-black block mb-2 uppercase">Win Rate</span><span className="text-3xl font-black text-emerald-400">{sessionReport.winRate}%</span></div>
                <div className="bg-black/40 p-6 rounded-[30px] border border-white/5 text-center"><span className="text-[9px] text-gray-500 font-black block mb-2 uppercase">Trades</span><span className="text-3xl font-black text-white">{tradeHistory.filter((t: TradeHistoryEntry) => t.sessionId === sessionReport.id).length}</span></div>
                <div className="bg-blis-red/20 p-6 rounded-[30px] border border-blis-red/30 text-center"><span className="text-[9px] text-blis-red-neon font-black block mb-2 uppercase">PNL NETO</span><span className={`text-3xl font-black ${sessionReport.totalPnl >= 0 ? 'text-emerald-400' : 'text-blis-red-neon'}`}>${sessionReport.totalPnl.toFixed(1)}</span></div>
              </div>
              <div className="space-y-6">
                <div className="space-y-2"><h3 className="text-blis-red-neon font-black text-[10px] flex items-center gap-2 uppercase tracking-widest"><Target size={14} /> Análisis Evolutivo</h3><p className="text-xs text-gray-400 leading-relaxed font-medium">{sessionReport.performanceOpinion}</p></div>
                <div className="space-y-2"><h3 className="text-blis-red-neon font-black text-[10px] flex items-center gap-2 uppercase tracking-widest"><BookOpen size={14} /> Axioma de Trading</h3><p className="text-xs text-white leading-relaxed font-bold italic">"{sessionReport.educationalLesson}"</p></div>
              </div>
              <button onClick={() => onSetSessionReport(null)} className="w-full bg-white text-black py-4 rounded-2xl font-black text-xs hover:bg-gray-200 transition-all active:scale-95 shadow-2xl tracking-[0.3em] uppercase mt-4">SINCRONIZAR Y CONTINUAR</button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <AnimatePresence>
        {showSimInfo && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="fixed inset-0 z-[7000] flex items-center justify-center p-4">
            <div className="bg-[#0a0a0a] border border-emerald-500/30 p-8 rounded-[2.5rem] max-w-sm shadow-[0_0_50px_rgba(16,185,129,0.2)] relative">
              <button onClick={() => onSetShowSimInfo(null)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"><X size={20} /></button>
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400"><Brain size={24} /></div>
                <div><h3 className="text-white font-black uppercase tracking-tight">{showSimInfo.name}</h3><p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Protocolo de Entrenamiento</p></div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-6 font-medium tracking-tight whitespace-pre-wrap">{showSimInfo.desc}</p>
              <div className="bg-white/5 p-4 rounded-2xl space-y-3">
                <div className="flex justify-between items-center"><span className="text-[10px] text-gray-600 font-bold uppercase">Volatilidad</span><span className="text-[10px] text-white font-black uppercase">{showSimInfo.mode === 'VOLATILE' ? 'EXTREMA (2.5x)' : showSimInfo.mode === 'TRENDS' ? 'CONTROLADA (0.7x)' : 'REALISTA (1.0x)'}</span></div>
                <div className="flex justify-between items-center"><span className="text-[10px] text-gray-600 font-bold uppercase">Inercia Drástica</span><span className="text-[10px] text-white font-black uppercase">{showSimInfo.mode === 'VOLATILE' ? 'ALTA' : showSimInfo.mode === 'TRENDS' ? 'MUY ALTA' : 'NORMAL'}</span></div>
                <div className="flex justify-between items-center"><span className="text-[10px] text-gray-600 font-bold uppercase">Objetivo IA</span><span className="text-[10px] text-emerald-400 font-black uppercase">{showSimInfo.mode === 'VOLATILE' ? 'Psicología' : showSimInfo.mode === 'TRENDS' ? 'Inercia' : 'Precisión'}</span></div>
              </div>
              <button onClick={() => onSetShowSimInfo(null)} className="w-full mt-6 py-4 bg-emerald-500 text-black font-black uppercase text-[11px] tracking-widest rounded-2xl hover:bg-emerald-400 transition-all active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.3)]">ENTENDIDO</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSymbolSelector && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#0a0a0a] border border-white/10 rounded-3xl w-full max-w-md h-[70vh] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
              <div className="p-4 border-b border-white/5 flex gap-3 items-center shrink-0 bg-white/[0.02]">
                {dataSource === 'binance' ? (
                  <>
                    <input autoFocus type="text" value={searchSymbol} onChange={e => onSetSearchSymbol(e.target.value.toUpperCase())} placeholder="Buscar cripto o divisa (Ej: BTC, ETH...)" className="bg-transparent border-none outline-none text-white font-black text-lg w-full placeholder:text-gray-600 placeholder:font-normal" />
                  </>
                ) : (
                  <div className="flex-1 flex items-center gap-3"><Brain className="text-emerald-500 w-5 h-5" /><span className="text-white font-black text-lg uppercase tracking-tight font-sans">Entornos de Entrenamiento</span></div>
                )}
                <button onClick={() => onSetShowSymbolSelector(false)} className="text-gray-500 hover:text-blis-red-neon transition-colors p-1"><X size={24} /></button>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar relative p-2 text-left">
                {dataSource === 'simulation' ? (
                  <div className="p-2 space-y-1 mt-2">
                    <div className="px-3 py-2 flex items-center gap-2 mb-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div><span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.25em]">Algoritmos Generativos</span></div>
                    {[
                      { id: 'NORMAL', symbol: 'NRM/USDT', name: 'Simulación Realista', desc: 'Reflejo fiel del mercado real pero en entorno controlado. Ideal para validación de estrategias estándar y ajustes finos de precisión en ambientes de baja latencia.' },
                      { id: 'VOLATILE', symbol: 'VLT/USDT', name: 'Simulación Volátil', desc: 'Algoritmo agresivo con mayor frecuencia de "Caza-Stops" y latigazos de precio. Diseñado para probar la resistencia psicológica de la IA y su capacidad de gestionar Drawdowns bruscos.' },
                      { id: 'TRENDS', symbol: 'TRN/USDT', name: 'Inercia Tendencial', desc: 'Genera inercias institucionales masivas con muy pocos retrocesos. Perfecto para entrenar el seguimiento de tendencias parabólicas y optimizar el trailing stop.' },
                      { id: 'CHAOS', symbol: 'CHA/USDT', name: 'Caos Estructural', desc: 'Ruido aleatorio de alta frecuencia sin tendencia clara. Diseñado para estresar los filtros de señal de la IA y evitar el overtrading en rangos laterales sucios.' }
                    ].map(m => (
                      <div key={m.id} className="flex justify-between items-center px-4 py-4 hover:bg-emerald-500/5 rounded-[1.8rem] group transition-all border border-transparent hover:border-emerald-500/20">
                        <div className="flex items-center gap-5 cursor-pointer flex-1" onClick={() => { onSetSimMode(m.id as SimMode); onSetDataSource('simulation'); onSetActiveSymbol(m.symbol.replace('/', '')); onSetShowSymbolSelector(false); }}>
                          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-[12px] font-black text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-black transition-all shrink-0 shadow-lg">{m.symbol.split('/')[0]}</div>
                          <div className="flex flex-col leading-tight text-left"><span className="text-white font-black text-lg tracking-tight group-hover:text-emerald-400 transition-colors uppercase">{m.id === 'NORMAL' ? 'BTC/USDT' : m.symbol} <span className="text-[10px] text-emerald-500/40 ml-1 font-mono tracking-widest">PRO</span></span><span className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">{m.name}</span></div>
                        </div>
                        <button onClick={() => onSetShowSimInfo({...m, mode: m.id})} className="p-3 text-gray-600 hover:text-emerald-400 transition-colors group/info relative flex items-center justify-center bg-white/5 rounded-xl"><span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 opacity-0 group-hover/info:opacity-100 transition-all">INFO</span></button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-2 space-y-1 mt-2">
                    {marketTickers.length === 0 ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 gap-4"><span className="text-xs uppercase tracking-[0.2em] font-black opacity-50 text-center">Iniciando Enlace de<br/>Datos Globales...</span></div>
                    ) : (
                      <>
                        <div className="px-3 py-2 flex items-center gap-2 mb-1"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div><span className="text-[10px] font-black text-amber-500/60 uppercase tracking-[0.25em]">Mercado Binance Real</span></div>
                        {marketTickers.filter(t => t.symbol.includes(searchSymbol)).sort((a, b) => { const aFav = favoriteSymbols.includes(a.symbol) ? 1 : 0; const bFav = favoriteSymbols.includes(b.symbol) ? 1 : 0; return bFav - aFav; }).map(t => {
                          const changeVal = Math.abs(parseFloat(t.priceChangePercent));
                          const stability = Math.max(0, Math.min(100, Math.round(100 - (changeVal * 20))));
                          const stabilityColor = stability < 30 ? 'text-blis-red-neon' : stability < 70 ? 'text-amber-500' : 'text-cyan-400';
                          return (
                            <div key={t.symbol} onClick={() => onHandleSymbolChange(t.symbol)} className="flex justify-between items-center px-4 py-3 hover:bg-white/5 rounded-2xl cursor-pointer transition-all group">
                              <div className="flex items-center gap-4">
                                <button onClick={(e) => onToggleFavorite(t.symbol, e)} className="p-1 -ml-2 text-gray-500 hover:text-amber-400 transition-colors shrink-0" title="Marcar como Favorito">
                                  <span className={`text-[14px] ${favoriteSymbols.includes(t.symbol) ? 'text-amber-400' : ''}`}>★</span>
                                </button>
                                <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-[10px] font-black text-gray-400 group-hover:text-amber-400 border border-white/5 shadow-inner transition-colors shrink-0">{t.symbol.replace('USDT', '').slice(0, 3)}</div>
                                <div className="flex flex-col leading-tight"><span className="text-white font-black text-[15px] tracking-tighter group-hover:text-amber-400 transition-colors uppercase">{t.symbol.replace('USDT', '')}/USDT</span><span className={`text-[8px] font-black uppercase tracking-widest ${stabilityColor}`}>EST: {stability}</span></div>
                              </div>
                              <div className="text-right flex flex-col justify-end shrink-0">
                                <span className="text-white font-mono font-black text-sm tracking-tighter">${parseFloat(t.lastPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                <span className={`text-[10px] font-black tracking-wider ${parseFloat(t.priceChangePercent) >= 0 ? 'text-emerald-500' : 'text-blis-red-neon'}`}>{parseFloat(t.priceChangePercent) >= 0 ? '+' : ''}{parseFloat(t.priceChangePercent).toFixed(2)}%</span>
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {globalAlert && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute z-[9000] inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-[#0b0e11] border border-blis-red shadow-[0_20px_60px_rgba(255,0,76,0.3)] max-w-sm rounded-[2rem] p-8 text-center flex flex-col items-center gap-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blis-red to-transparent opacity-50"></div>
              <span className="text-blis-red-neon text-5xl">⚠</span>
              <h3 className="text-white font-black text-xl tracking-tighter uppercase leading-tight">Acción<br/>Restringida</h3>
              <p className="text-gray-400 text-sm font-medium tracking-wide whitespace-pre-wrap">{typeof globalAlert === 'string' ? globalAlert : globalAlert.msg}</p>
              <div className="mt-2 w-full flex flex-col gap-2">
                <button onClick={() => onSetGlobalAlert(null)} className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-black uppercase text-[10px] tracking-[0.2em] transition-all">CANCELAR</button>
                {typeof globalAlert === 'object' && globalAlert.pendingSymbol && (
                  <button onClick={() => onHandleSymbolChange(globalAlert.pendingSymbol!, true)} className="w-full py-3 rounded-xl bg-blis-red/10 hover:bg-blis-red border border-blis-red/50 text-blis-red-neon hover:text-white font-black uppercase text-[10px] tracking-[0.2em] transition-all">FORZAR CAMBIO (MULTI-TAB)</button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmAction && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed z-[9999] inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-[#0b0e11] border border-blis-red/50 shadow-[0_20px_60px_rgba(255,0,76,0.3)] max-w-sm w-[calc(100%-2rem)] rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-10 text-center flex flex-col items-center gap-4 sm:gap-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blis-red to-transparent"></div>
              <span className="text-blis-red-neon text-5xl">⚠</span>
              <h3 className="text-white font-black text-2xl tracking-tighter uppercase leading-tight">{confirmAction.title || 'Acción Restringida'}</h3>
              <p className="text-gray-400 text-sm font-medium tracking-wide leading-relaxed">{confirmAction.msg}</p>
              <div className="mt-2 w-full flex flex-col gap-2">
                <button onClick={() => { confirmAction.onConfirm(); onSetConfirmAction(null); }} className="w-full py-4 rounded-xl bg-blis-red hover:bg-blis-red-neon text-white font-black uppercase text-[11px] tracking-[0.2em] transition-all shadow-xl shadow-blis-red/20 active:scale-95">ACEPTAR</button>
                <button onClick={() => onSetConfirmAction(null)} className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-black uppercase text-[10px] tracking-[0.2em] transition-all">CANCELAR</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};