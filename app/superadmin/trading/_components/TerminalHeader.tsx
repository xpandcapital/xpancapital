"use client";

import React from 'react';
import { ChevronDown, Bot, Zap, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TerminalHeaderProps {
  dataSource: string;
  activeSymbol: string;
  ticker: { price: number; changePercent: number };
  balance: number;
  binanceAvailable: number;
  paperBalance: number;
  tradeMode: string;
  autoPilot: any;
  isBgScanning: boolean;
  isMounted: boolean;
  currentPriceRef: React.RefObject<number>;
  activeAssetBalance: number;
  openPositions: any[];
  isEditingPaperBalance: boolean;
  intervalTime: string;
  showTimeframeSelector: boolean;
  now: number;
  fmtUsd: (val: number) => string;
  formatTimeLeft: (targetMs: number) => string;
  currentUsedMargin: number;
  signalAlertActive?: boolean;
  onSetDataSource: (ds: string) => void;
  onSetTradeMode: (mode: 'REAL' | 'PAPER') => void;
  onSetShowSymbolSelector: (v: boolean) => void;
  onSetShowTimeframeSelector: (v: boolean) => void;
  onSetIntervalTime: (v: string) => void;
  onSetIsEditingPaperBalance: (v: boolean) => void;
  onSetPaperBalance: (v: number) => void;
  onReconnect: () => void;
  tradeHistory: any[];
}

export const TerminalHeader: React.FC<TerminalHeaderProps> = ({
  dataSource, activeSymbol, ticker, balance, binanceAvailable, paperBalance,
  tradeMode, autoPilot, isBgScanning, isMounted, currentPriceRef,
  activeAssetBalance, openPositions, isEditingPaperBalance, intervalTime,
  showTimeframeSelector, now, fmtUsd, formatTimeLeft, currentUsedMargin,
  signalAlertActive, onSetDataSource, onSetTradeMode, onSetShowSymbolSelector,
  onSetShowTimeframeSelector, onSetIntervalTime, onSetIsEditingPaperBalance,
  onSetPaperBalance, onReconnect, tradeHistory
}) => {
  const INTERVALS = ['1m', '5m', '15m', '1h', '4h', '1d'];

  return (
    <header className="h-auto py-1.5 border-b border-white/5 bg-[#050505] flex flex-wrap lg:flex-nowrap items-center justify-between px-3 shrink-0 z-10 gap-x-2 gap-y-2 w-full no-scrollbar">
      <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 w-auto min-w-0">
        <div className="flex bg-black/40 rounded-[0.6rem] p-0.5 border border-white/5 items-center shrink-0 overflow-hidden mr-1">
          <button onClick={() => onSetDataSource('binance')} className={`w-7 h-7 flex items-center justify-center text-[11px] font-black rounded-lg transition-all ${dataSource === 'binance' ? 'bg-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.6)]' : 'text-gray-500 hover:bg-white/5'}`} title="BINANCE LIVE">B</button>
          <button onClick={() => onSetDataSource('simulation')} className={`w-7 h-7 flex items-center justify-center text-[11px] font-black rounded-lg transition-all ${dataSource === 'simulation' ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.6)]' : 'text-gray-500 hover:bg-white/5'}`} title="SIMULADOR IA">S</button>
        </div>

        <div onClick={() => onSetShowSymbolSelector(true)} className="flex items-center gap-2 border border-white/10 bg-black/50 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-white/5 transition-colors group relative shadow-inner" title="Cambiar Divisa/Cripto">
          <div className={`w-2 h-2 rounded-full ${dataSource === 'binance' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`}></div>
          <span className="text-white font-black text-xs md:text-sm tracking-tighter shrink-0">{dataSource === 'binance' ? activeSymbol.replace('USDT', '/USDT') : `${activeSymbol.replace('USDT', '')}/USD (Sim)`}</span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-500 group-hover:text-white transition-transform" />
        </div>

        {ticker && (
          <div className={`ml-1 px-3 py-1.5 rounded-xl text-[10px] md:text-[11px] font-mono font-black shrink-0 min-w-[130px] md:min-w-[150px] text-center flex justify-center items-center gap-2 shadow-inner ${ticker.changePercent >= 0 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-blis-red/10 text-blis-red-neon border border-blis-red/20"}`}>
            <span className="w-auto text-[13px]">{fmtUsd(ticker.price)}</span>
            <span className={`text-[9px] opacity-90 ${ticker.changePercent >= 0 ? 'text-emerald-400' : 'text-blis-red-neon'}`}>({ticker.changePercent >= 0 ? '+' : ''}{ticker.changePercent.toFixed(2)}%)</span>
          </div>
        )}

        <div className="relative z-50">
          <button onClick={() => onSetShowTimeframeSelector(!showTimeframeSelector)} className="flex items-center gap-1 bg-black/40 px-2.5 py-1.5 rounded-xl border border-white/5 shrink-0 hover:bg-white/5 transition-all group">
            <span className="text-[10px] md:text-[11px] font-black text-white">{intervalTime}</span>
            <ChevronDown className="w-3 h-3 text-gray-500 group-hover:text-white transition-transform" />
          </button>
          <AnimatePresence>
            {showTimeframeSelector && (
              <motion.div initial={{ opacity: 0, y: -5, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -5, scale: 0.95 }} className="absolute top-[calc(100%+8px)] left-0 bg-[#050505]/95 backdrop-blur-xl border border-white/10 rounded-xl p-1.5 shadow-2xl shadow-black flex flex-col gap-1 min-w-[60px]">
                {INTERVALS.map((t: string) => (
                  <button key={t} onClick={() => { onSetIntervalTime(t); onSetShowTimeframeSelector(false); }} className={`px-2.5 py-1.5 rounded-lg text-[10px] md:text-[11px] font-black transition-all ${intervalTime === t ? 'bg-blis-red text-white' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>{t}</button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {autoPilot.active && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className={`ml-1 md:ml-3 pointer-events-none shrink-0 ${autoPilot.scanningStopped ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'} px-2 py-1 md:px-2.5 md:py-1.5 border rounded-xl flex items-center gap-1.5 shadow-inner z-[5]`}>
              <div className="relative flex items-center justify-center">
                <div className={`w-2 h-2 rounded-full ${autoPilot.scanningStopped ? 'bg-orange-500' : 'bg-emerald-500'} animate-ping absolute`}></div>
                <Bot size={16} className={autoPilot.scanningStopped ? 'opacity-50 relative z-10' : 'relative z-10'} />
              </div>
              {!autoPilot.scanningStopped && (
                <span className="text-[11px] font-mono font-bold text-white/90 bg-white/5 px-1.5 py-0.5 rounded">
                  {autoPilot.isIndefinite || !autoPilot.expiresAt
                    ? `▶${(() => { const startTs = autoPilot.sessionId ? parseInt(autoPilot.sessionId.replace('session_', '').replace('welcome_', '')) : 0; if (!startTs) return '00:00'; const elapsed = now - startTs; if (elapsed < 0) return '00:00'; const hrs = Math.floor(elapsed / 3600000); const mins = Math.floor((elapsed % 3600000) / 60000).toString().padStart(2, '0'); const secs = Math.floor((elapsed % 60000) / 1000).toString().padStart(2, '0'); return hrs > 0 ? `${hrs}:${mins}:${secs}` : `${mins}:${secs}`; })()}`
                    : `⏱${formatTimeLeft(autoPilot.expiresAt)}`}
                </span>
              )}
              {(() => {
                const sessionStartTs = autoPilot.sessionId ? parseInt(autoPilot.sessionId.replace('session_', '').replace('welcome_', '')) : 0;
                const sessionClosedTrades = tradeHistory.filter((t: any) => (t.sessionId === autoPilot.sessionId || (sessionStartTs > 0 && t.closeTime >= sessionStartTs)) && typeof t.finalPnl === 'number');
                const realizedPnl = sessionClosedTrades.reduce((acc: number, t: any) => acc + (t.finalPnl || 0), 0);
                return (
                  <div className={`px-1.5 py-0.5 rounded font-mono font-black text-[10px] md:text-[12px] border ${realizedPnl >= 0 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-blis-red/20 text-blis-red-neon border-blis-red/40'}`}>
                    {realizedPnl >= 0 ? '+' : ''}${realizedPnl.toFixed(2)}
                  </div>
                );
              })()}
              {!autoPilot.scanningStopped && isBgScanning && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_rgba(34,211,238,0.8)] shrink-0"></span>
              )}
              {autoPilot.scanningStopped && (
                <span className="text-[9px] font-black uppercase">STOP</span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-end gap-1.5 md:gap-2 shrink-0 ml-auto lg:ml-0 overflow-hidden pr-2 md:pr-0">
        <div title="Valor del activo en USD" className={`px-2.5 py-1 md:px-3 md:py-1.5 flex items-center gap-1.5 md:gap-2 rounded-xl shrink-0 transition-all bg-cyan-500/10 border border-cyan-400/20 ${dataSource === 'binance' ? 'hidden' : ''}`}>
          <span className="text-[7px] md:text-[8px] font-black text-cyan-500/80 uppercase leading-none tracking-widest hidden sm:block">ACTIVO</span>
          <span className="text-cyan-400 font-mono font-black text-[13px] md:text-[16px] tracking-tight leading-none text-right md:text-left">
            {(() => { const activeP = (ticker?.price && ticker.price !== 2900.00) ? ticker.price : (currentPriceRef.current !== 2900.00 ? currentPriceRef.current : 0); return activeP > 0 ? `$${((activeAssetBalance || 0) * activeP).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'Sincronizando...'; })()}
          </span>
        </div>

        <div onClick={() => onSetTradeMode('REAL')} title={dataSource === 'simulation' ? "Real inactivo en Simulador Base" : "Cartera de Binance. Formato: Equity (Disponible)"} className={`px-2.5 py-1 md:px-3 md:py-1.5 flex items-center gap-1.5 md:gap-2 rounded-xl shrink-0 transition-all cursor-pointer ${dataSource === 'simulation' ? 'opacity-20 cursor-not-allowed grayscale' : ''} ${tradeMode === 'REAL' ? 'bg-emerald-500/20 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)] border' : 'bg-black/40 border border-white/5 opacity-60 hover:opacity-100'}`}>
          <span className="text-[7px] md:text-[8px] font-black text-emerald-500/60 uppercase leading-none tracking-widest hidden sm:block mt-0.5">{dataSource === 'binance' ? 'REAL' : 'USD'}</span>
          <span className="text-emerald-400 font-mono font-black text-[13px] md:text-[16px] tracking-tight leading-none text-right md:text-left">
            ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-[10px] md:text-[11px] opacity-60 ml-1.5 font-bold text-white/50">(${binanceAvailable.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })})</span>
          </span>
        </div>

        <div onClick={() => onSetTradeMode('PAPER')} className={`px-2.5 py-1 md:px-3 md:py-1.5 flex items-center gap-1.5 md:gap-2 rounded-xl shrink-0 cursor-pointer transition-all ${tradeMode === 'PAPER' ? 'bg-blue-500/20 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.3)] border' : 'bg-black/40 border border-white/5 opacity-60 hover:opacity-100'}`}>
          <div className="flex flex-col items-start leading-none gap-0.5">
            <span className="text-[7px] md:text-[8px] font-black text-blue-500/60 uppercase leading-none tracking-widest hidden sm:block">SIM</span>
            <button onClick={(e) => { e.stopPropagation(); onSetPaperBalance(200.00); }} className="text-[6px] hover:text-white text-blue-300 font-black uppercase tracking-tighter transition-colors">Reiniciar</button>
          </div>
          {isEditingPaperBalance ? (
            <input type="number" autoFocus onBlur={() => onSetIsEditingPaperBalance(false)} onChange={(e) => onSetPaperBalance(parseFloat(e.target.value) || 0)} value={paperBalance} className="bg-transparent border-none text-blue-400 font-mono font-black text-[13px] md:text-[16px] outline-none tracking-tight leading-none w-16 md:w-20 p-0 m-0 text-right md:text-left" />
          ) : (
            <span onDoubleClick={(e) => { e.stopPropagation(); onSetIsEditingPaperBalance(true); }} title="Balance total SIM. Doble clic para ajustar." className="text-blue-400 font-mono font-black text-[13px] md:text-[16px] tracking-tight leading-none text-right md:text-left">
              ${paperBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-[10px] md:text-[11px] opacity-60 ml-1.5 font-bold text-white/50" title="Capital libre disponible para nuevas operaciones">
                {(() => { const locked = openPositions.filter((p: any) => p.tradeMode === 'PAPER').reduce((s: number, p: any) => s + (p.amount || 0), 0); const avail = Math.max(0, paperBalance - locked); return locked > 0 ? `(libre $${avail.toFixed(0)})` : ''; })()}
              </span>
            </span>
          )}
        </div>

        <button onClick={onReconnect} title="Reconectar con operación existente en Binance" className="p-1.5 md:p-2 rounded-xl bg-cyan-500/10 border border-cyan-400/20 text-cyan-400 hover:bg-cyan-500/30 hover:shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all">
          <Zap size={16} fill="currentColor" className="opacity-80" />
        </button>
      </div>
    </header>
  );
};