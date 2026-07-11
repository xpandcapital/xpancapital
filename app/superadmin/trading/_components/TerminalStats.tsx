"use client";

import React from 'react';
import { TrendingUp, TrendingDown, Brain, Bot, Trash2 } from 'lucide-react';
import type {
  TerminalTab, OpenPosition, TradeHistoryEntry, SessionReport, AiKnowledge,
  TradingMetrics, TradeReplayData, PnlData, ConfirmAction
} from '../_types';

interface TerminalStatsProps {
  terminalTab: TerminalTab;
  openPositions: OpenPosition[];
  tradeHistory: TradeHistoryEntry[];
  historyFilter: 'ALL' | 'REAL' | 'PAPER';
  historyWindow: TradeHistoryEntry[];
  historyTotal: number;
  historyLoading: boolean;
  hasMoreHistory: boolean;
  tableScrollRef: React.RefObject<HTMLDivElement | null>;
  savedReports: SessionReport[];
  aiKnowledge: AiKnowledge[];
  tradingMetrics: TradingMetrics;
  activeSymbol: string;
  currentPriceRef: React.RefObject<number>;
  symbolPricesRef: React.RefObject<Record<string, number>>;
  isTableMaximized: boolean;
  viewMode: string;
  tradeReplayData: TradeReplayData | null;
  lastSeenHistoryCount: number;
  lastSeenReportsCount: number;
  isMounted: boolean;
  fmtUsd: (val: number) => string;
  formatTableTime: (ts: number) => string;
  formatTimePassed: (ms: number) => string;
  getPnlData: (pos: OpenPosition) => PnlData;
  safeText: (val: string | number | null | undefined) => string;
  onSetTerminalTab: (tab: TerminalTab) => void;
  onSetHistoryFilter: (filter: 'ALL' | 'REAL' | 'PAPER') => void;
  onSetHistoryTotal: (n: number) => void;
  onSetLastSeenHistoryCount: (n: number) => void;
  onSetLastSeenReportsCount: (n: number) => void;
  onSetSelectedPositionId: (id: string | null) => void;
  onSetHoverPositionId: (id: string | null) => void;
  onSetTradeReplayData: (data: TradeReplayData | null) => void;
  onSetConfirmAction: (action: ConfirmAction | null) => void;
  onSetAiKnowledge: (knowledge: AiKnowledge[]) => void;
  onWipeAllData: () => void;
  onSetIsTableMaximized: (v: boolean) => void;
  onSetHistoryWindow: (v: TradeHistoryEntry[]) => void;
  onSetHistoryOffset: (v: number) => void;
  onSetHistoryLoading: (v: boolean) => void;
  onSetHasMoreHistory: (v: boolean) => void;
  onCloseTradeManual: (id: string) => void;
  supabaseClient: unknown;
  now: number;
}

export const TerminalStats = React.memo(function TerminalStats({
  terminalTab, openPositions, tradeHistory, historyFilter, historyWindow,
  historyTotal, historyLoading, hasMoreHistory, tableScrollRef, savedReports,
  aiKnowledge, tradingMetrics, activeSymbol, currentPriceRef, symbolPricesRef,
  isTableMaximized, viewMode, tradeReplayData, lastSeenHistoryCount,
  lastSeenReportsCount, isMounted, fmtUsd, formatTableTime, formatTimePassed,
  getPnlData, safeText, onSetTerminalTab, onSetHistoryFilter, onSetHistoryTotal,
  onSetLastSeenHistoryCount, onSetLastSeenReportsCount, onSetSelectedPositionId,
  onSetHoverPositionId, onSetTradeReplayData, onSetConfirmAction, onSetAiKnowledge,
  onWipeAllData, onSetIsTableMaximized, onSetHistoryWindow, onSetHistoryOffset,
  onSetHistoryLoading, onSetHasMoreHistory, onCloseTradeManual, supabaseClient, now
}: TerminalStatsProps) {
  if (viewMode !== 'split') return null;

  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  return (
    <div className={`${isTableMaximized ? 'absolute inset-x-0 bottom-0 top-[52px] z-40' : 'relative h-56 sm:h-64 lg:h-72 shrink-0'} border-t border-white/5 bg-[#050505] flex flex-col transition-all duration-300`}>
      <div className="h-10 sm:h-12 flex items-center px-4 sm:px-6 lg:px-8 gap-4 sm:gap-6 lg:gap-12 text-[10px] sm:text-[11px] font-black uppercase tracking-wider sm:tracking-widest border-b border-white/5 shrink-0 bg-black/40 overflow-x-auto no-scrollbar">
        <button onClick={() => onSetTerminalTab('abiertas')} className={`h-full border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${terminalTab === 'abiertas' ? 'border-blis-red text-blis-red-neon' : 'border-transparent text-gray-500 hover:text-white'}`}>Abiertas ({openPositions.length})</button>
        <button onClick={() => { onSetTerminalTab('historial'); onSetLastSeenHistoryCount(historyTotal); localStorage.setItem('blis_last_history_count', String(historyTotal)); }} className={`h-full border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${terminalTab === 'historial' ? 'border-blis-red text-blis-red-neon' : 'border-transparent text-gray-500 hover:text-white'}`}>
          Historial {(historyTotal - lastSeenHistoryCount) > 0 ? <span className="text-emerald-400 ml-1">{historyTotal - lastSeenHistoryCount}/{historyTotal}</span> : <span className="text-gray-600 ml-1">{historyTotal}</span>}
        </button>
        <button onClick={() => { onSetTerminalTab('reportes'); onSetLastSeenReportsCount(savedReports.length); localStorage.setItem('blis_last_reports_count', String(savedReports.length)); }} className={`h-full border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${terminalTab === 'reportes' ? 'border-blis-red text-blis-red-neon' : 'border-transparent text-gray-500 hover:text-white'}`}>
          Reportes IA {(savedReports.length - lastSeenReportsCount) > 0 ? <span className="text-emerald-400 ml-1">{savedReports.length - lastSeenReportsCount}/{savedReports.length}</span> : <span className="text-gray-600 ml-1">{savedReports.length}</span>}
        </button>
        <button onClick={() => onSetTerminalTab('memoria')} className={`h-full border-b-2 transition-all flex items-center gap-2 px-6 uppercase text-[10px] font-black tracking-widest relative ${terminalTab === 'memoria' ? 'border-blis-red text-white bg-white/5' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
          <Brain size={13} /> IA
        </button>
      </div>

      <div ref={tableScrollRef} className="flex-1 overflow-y-auto custom-red-scrollbar">
        {terminalTab === 'abiertas' && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] md:min-w-full text-[11px] md:text-[12px] text-left border-collapse">
              <thead className="text-gray-500 uppercase font-black tracking-[0.15em] sticky top-0 bg-[#050505] border-b border-white/5 z-10 whitespace-nowrap">
                <tr>
                  <th className="p-3 md:p-4 pl-4 md:pl-6">Hora</th>
                  <th className="p-3 md:p-4">Activos</th>
                  <th className="p-3 md:p-4 text-center">Acción</th>
                  <th className="p-3 md:p-4">Utilidad</th>
                  <th className="p-3 md:p-4 text-center">ROI %</th>
                  <th className="p-3 md:p-4">Invertido</th>
                  <th className="p-3 md:p-4">Saldo Est.</th>
                  <th className="p-3 md:p-4">Duración</th>
                  <th className="p-3 md:p-4 hidden lg:table-cell">P. Entrada</th>
                  <th className="p-3 md:p-4 hidden lg:table-cell">P. Actual</th>
                  <th className="p-3 md:p-4 hidden lg:table-cell">P. Objetivo</th>
                  <th className="p-3 md:p-4 hidden lg:table-cell pr-4 md:pr-6">T. Estimado</th>
                </tr>
              </thead>
              <tbody>
                {openPositions.map(p => {
                  const pnl = getPnlData(p);
                  const roiPct = p.amount > 0 ? (pnl.value / p.amount) * 100 : 0;
                  const saldoEst = (p.amount || 0) + pnl.value;
                  const posSymbol = p.symbol || activeSymbol;
                  const currentPrice = posSymbol === activeSymbol ? (currentPriceRef.current || 0) : (symbolPricesRef.current[posSymbol] || p.entryPrice);
                  const elapsed = p.openTime ? (Date.now() - p.openTime) / 60000 : 0;
                  const maxEstimate = p.mode === 'SWING' ? 60 : 15;
                  let remaining = 0;
                  if (p.targetPrice && currentPrice > 0) {
                    const distToTarget = Math.abs(p.targetPrice - currentPrice);
                    const priceMovedSoFar = Math.abs(currentPrice - p.entryPrice);
                    const speed = elapsed > 1 ? priceMovedSoFar / elapsed : 0;
                    remaining = speed > 0 ? Math.min(distToTarget / speed, maxEstimate) : Math.min((distToTarget / currentPrice) * 100 * 5, maxEstimate);
                  } else { remaining = Math.max(0, maxEstimate - elapsed); }
                  return (
                    <tr key={p.id} onMouseEnter={() => onSetHoverPositionId(String(p.id))} onMouseLeave={() => onSetHoverPositionId(null)} onClick={() => onSetSelectedPositionId(String(p.id))}
                      className={`border-b border-white/[0.03] group transition-all whitespace-nowrap cursor-pointer ${pnl.isProfit ? 'bg-emerald-900/10 hover:bg-emerald-900/15' : 'bg-red-900/10 hover:bg-red-900/15'} ${String(p.id) === (null) ? 'bg-white/[0.06]' : ''}`}>
                      <td className="p-3 md:p-4 pl-4 md:pl-6 font-mono"><div className="text-white/70 text-[11px]">{formatTableTime(p.openTime || 0)}</div></td>
                      <td className="p-3 md:p-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[14px] font-black ${p.type === 'BUY' ? 'text-emerald-400' : 'text-blis-red-neon'}`}>{p.type === 'BUY' ? '▲' : '▼'}</span>
                          <span className={`px-2 py-1 rounded text-[10px] font-black border uppercase ${p.type === 'BUY' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-blis-red-neon'}`}>{(p.symbol || 'USD').replace(/USDT$/, ' / USDT')}</span>
                        </div>
                      </td>
                      <td className="p-3 md:p-4 text-center"><button onClick={(e) => { e.stopPropagation(); onCloseTradeManual(String(p.id)); }} className="bg-white/5 hover:bg-blis-red text-gray-400 hover:text-white px-3 py-1.5 rounded-lg text-[9px] font-bold transition-all uppercase tracking-tighter border border-white/10 hover:border-blis-red">Cerrar</button></td>
                      <td className={`p-3 md:p-4 font-black text-[13px] ${pnl.isProfit ? 'text-emerald-400' : 'text-blis-red-neon'}`}>{pnl.isProfit ? '+' : ''}${pnl.value.toFixed(2)}</td>
                      <td className={`p-3 md:p-4 text-center font-black text-[12px] ${pnl.isProfit ? 'text-emerald-400' : 'text-blis-red-neon'}`}>{roiPct >= 0 ? '+' : ''}{roiPct.toFixed(2)}%</td>
                      <td className="p-3 md:p-4 font-mono text-white/70 text-[11px]">${p.amount.toFixed(2)}<span className="opacity-50 text-[9px] block mt-0.5">x{p.leverage || 1}</span></td>
                      <td className={`p-3 md:p-4 font-mono font-bold text-[11px] ${saldoEst >= (p.amount || 0) ? 'text-emerald-400' : 'text-blis-red-neon'}`}>${Math.max(0, saldoEst).toFixed(2)}</td>
                      <td className="p-3 md:p-4 text-cyan-400 font-mono font-bold text-[11px]">{formatTimePassed(p.openTime || 0)}</td>
                      <td className="p-3 md:p-4 text-white font-mono font-bold text-[11px] hidden lg:table-cell">{fmtUsd(p.entryPrice)}</td>
                      <td className="p-3 md:p-4 text-white/70 font-mono text-[11px] hidden lg:table-cell">{fmtUsd(currentPrice)}</td>
                      <td className="p-3 md:p-4 font-mono text-[11px] hidden lg:table-cell">
                        {p.targetPrice ? <span className={`font-bold ${p.type === 'BUY' ? 'text-emerald-400' : 'text-blis-red-neon'}`}>{p.type === 'BUY' ? '⬆' : '⬇'} {fmtUsd(p.targetPrice)}</span> : <span className="text-white/30">—</span>}
                      </td>
                      <td className="p-3 md:p-4 font-mono text-[10px] hidden lg:table-cell pr-4 md:pr-6">
                        <div className="flex flex-col"><span className={remaining > 0 ? 'text-yellow-400/80' : (pnl.isProfit ? 'text-emerald-400' : 'text-orange-400')}>{remaining > 0 ? `~${remaining >= 60 ? `${Math.floor(remaining / 60)}h ${Math.ceil(remaining % 60)}m` : `${Math.ceil(remaining)}m`}` : (pnl.isProfit ? '✓ Listo' : '⏳ Esperando')}</span><span className="text-white/30 text-[8px]">{p.mode === 'SWING' ? 'Swing' : 'Scalp'}</span></div>
                      </td>
                    </tr>
                  );
                })}
                {openPositions.length === 0 && <tr><td colSpan={11} className="p-20 text-center text-gray-600 font-bold uppercase tracking-[0.3em] opacity-20 text-xs">Sin posiciones activas</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {terminalTab === 'historial' && (
          <div className="flex flex-col h-full min-h-0">
            <div className="text-[11px] md:text-[12px] flex flex-wrap justify-between items-center px-4 sm:px-6 py-2.5 sm:py-3 border-b border-white/5 bg-black/20 gap-3 shrink-0">
              <div className="text-gray-400 font-mono">
                WinRate: <span className={parseFloat(tradingMetrics.winRate) >= 50 ? 'text-emerald-400 font-bold' : 'text-blis-red-neon font-bold'}>{tradingMetrics.winRate}%</span>
                {' | '}AvgWin: <span className="text-emerald-400">${tradingMetrics.avgWin.toFixed(2)}</span>
                {' | '}AvgLoss: <span className="text-blis-red-neon">${tradingMetrics.avgLoss.toFixed(2)}</span>
                {' | '}PF: <span className={parseFloat(tradingMetrics.profitFactor) >= 1 ? 'text-emerald-400 font-bold' : 'text-blis-red-neon font-bold'}>{tradingMetrics.profitFactor}</span>
              </div>
              <div className="flex gap-2">
                {['ALL', 'REAL', 'PAPER'].map(f => (
                  <button key={f} onClick={() => onSetHistoryFilter(f as 'ALL' | 'REAL' | 'PAPER')} className={`text-[10px] font-black uppercase tracking-wider transition-all ${historyFilter === f ? 'text-white border-b border-white' : 'text-gray-500 hover:text-gray-300'}`}>{f === 'ALL' ? 'Todos' : f}</button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto overflow-x-auto custom-red-scrollbar" ref={tableScrollRef}>
              <table className="w-full min-w-[900px] md:min-w-full text-[11px] md:text-[12px] text-left border-collapse">
                <thead className="text-gray-500 uppercase font-black tracking-[0.15em] sticky top-0 bg-[#050505] border-b border-white/5 z-10 whitespace-nowrap">
                  <tr>
                    <th className="p-3 md:p-4 pl-4 md:pl-6">Hora</th>
                    <th className="p-3 md:p-4">Activos</th>
                    <th className="p-3 md:p-4">Utilidad</th>
                    <th className="p-3 md:p-4 text-center">ROI %</th>
                    <th className="p-3 md:p-4">Invertido</th>
                    <th className="p-3 md:p-4">Saldo Final</th>
                    <th className="p-3 md:p-4 hidden lg:table-cell">Duración</th>
                    <th className="p-3 md:p-4 hidden lg:table-cell">P. Compra</th>
                    <th className="p-3 md:p-4 hidden lg:table-cell">P. Cierre</th>
                    <th className="p-3 md:p-4">Replay</th>
                    <th className="p-3 md:p-4 pr-4 md:pr-6">ID</th>
                  </tr>
                </thead>
                <tbody>
                  {historyWindow.filter(t => historyFilter === 'ALL' || t.tradeMode === historyFilter).map((t: TradeHistoryEntry, i: number) => {
                    const isWin = t.finalPnl >= 0;
                    const shortId = (t.id || '').toString().slice(-6).toUpperCase();
                    const openTag = t.openedBy === 'IA' ? 'IA' : 'H';
                    const closeTag = t.closedBy === 'IA' ? 'IA' : 'H';
                    const tradeId = `${openTag}-${shortId}-${closeTag}`;
                    const roiPercent = t.finalPnlPercent != null ? t.finalPnlPercent : (t.amount > 0 ? (t.finalPnl / t.amount) * 100 : 0);
                    const saldoFinal = (t.amount || 0) + (t.finalPnl || 0);
                    return (
                      <tr key={`${t.id}_${i}_${t.closeTime}`} onClick={() => onSetSelectedPositionId(String(t.id))}
                        className={`border-b border-white/[0.03] group cursor-pointer whitespace-nowrap transition-all ${isWin ? 'bg-emerald-900/10 hover:bg-emerald-900/15 text-gray-300' : 'bg-red-900/10 hover:bg-red-900/15 text-gray-300'}`}>
                        <td className="p-3 md:p-4 pl-4 md:pl-6 font-mono"><div className="text-white/70 text-[13px]">{formatTableTime(t.closeTime)}</div></td>
                        <td className="p-3 md:p-4"><div className="flex items-center gap-1.5"><span className={`text-[14px] font-black ${t.type === 'BUY' ? 'text-emerald-400' : 'text-blis-red-neon'}`}>{t.type === 'BUY' ? '▲' : '▼'}</span><span className={`px-2 py-1 rounded text-[13px] font-black border uppercase ${t.type === 'BUY' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-blis-red-neon'}`}>{(t.symbol || 'USD').replace(/USDT$/, ' / USDT')}</span></div></td>
                        <td className={`p-3 md:p-4 font-black text-[13px] ${isWin ? 'text-emerald-400' : 'text-blis-red-neon'}`}>{isWin ? '+' : ''}${t.finalPnl.toFixed(2)}</td>
                        <td className={`p-3 md:p-4 text-center font-black text-[13px] ${isWin ? 'text-emerald-400' : 'text-blis-red-neon'}`}>{roiPercent >= 0 ? '+' : ''}{roiPercent.toFixed(2)}%</td>
                        <td className="p-3 md:p-4 font-mono text-white/70 text-[13px]">${t.amount?.toFixed(2)}<span className="opacity-50 text-[11px] block mt-0.5">x{t.leverage || 1}</span></td>
                        <td className={`p-3 md:p-4 font-mono font-bold text-[13px] ${saldoFinal >= (t.amount || 0) ? 'text-emerald-400' : 'text-blis-red-neon'}`}>${Math.max(0, saldoFinal).toFixed(2)}</td>
                        <td className="p-3 md:p-4 font-mono text-[13px] text-white/60 hidden lg:table-cell">{(() => { const dur = (t.duration || 0); return `${Math.floor(dur / 60000)}m ${Math.floor((dur % 60000) / 1000)}s`; })()}</td>
                        <td className="p-3 md:p-4 font-mono text-white/70 text-[13px] hidden lg:table-cell">{fmtUsd(t.entryPrice)}</td>
                        <td className="p-3 md:p-4 font-mono text-white/70 text-[13px] hidden lg:table-cell">{fmtUsd(t.closePrice)}</td>
                        <td className="p-3 md:p-4">
                          {(t.candlesAtClose || t.candlesAtOpen) ? (
                            <button onClick={(e) => { e.stopPropagation(); const rc = t.candlesAtClose || t.candlesAtOpen || []; if (tradeReplayData && tradeReplayData.openTime === t.openTime) { onSetTradeReplayData(null); } else { onSetTradeReplayData({ candles: rc, entryPrice: t.entryPrice, closePrice: t.closePrice, type: t.type as string, symbol: t.symbol, openTime: t.openTime || Date.now(), closeTime: t.closeTime, openedBy: t.openedBy, closedBy: t.closedBy }); } }}
                              className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg transition-all ${tradeReplayData && tradeReplayData.openTime === t.openTime ? 'bg-blis-red text-white shadow-[0_0_12px_rgba(213,193,8,0.4)]' : 'bg-white/5 text-gray-400 hover:bg-blis-red/20 hover:text-blis-red-neon border border-white/10'}`}>
                              {tradeReplayData && tradeReplayData.openTime === t.openTime ? '✕' : '▶'}
                            </button>
                          ) : <span className="text-[9px] text-white/20">—</span>}
                        </td>
                        <td className="p-3 md:p-4 pr-4 md:pr-6"><span className="font-mono text-[9px] text-white/50 bg-white/5 px-2 py-1 rounded border border-white/10">{tradeId}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {terminalTab === 'reportes' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 md:p-8 text-[11px]">
            {savedReports.map(r => (
              <div key={r.id} onClick={() => {/* setSessionReport handled by parent */}} className="bg-black/40 border border-white/5 p-6 rounded-[2rem] cursor-pointer hover:border-blis-red transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blis-red/5 blur-3xl group-hover:bg-blis-red/10 transition-all"></div>
                <div className="flex justify-between items-center mb-4"><h4 className="text-white font-black uppercase tracking-widest">Sesión IA</h4><span className="text-[9px] text-gray-600 font-mono">{formatTableTime(r.date)}</span></div>
                <div className="flex justify-between items-end">
                  <div><span className="text-emerald-400 font-black text-lg">{r.winRate}%</span><p className="text-[8px] text-gray-500 font-black uppercase">Éxito</p></div>
                  <div className="text-right font-black"><span className={r.totalPnl >= 0 ? 'text-emerald-400' : 'text-blis-red-neon'}>${r.totalPnl.toFixed(2)}</span><p className="text-[8px] text-gray-500 uppercase">Profit</p></div>
                </div>
              </div>
            ))}
            {savedReports.length === 0 && <div className="col-span-full py-16 text-center text-gray-600 font-black uppercase tracking-[0.4em] opacity-20">No hay reportes generados</div>}
          </div>
        )}

        {terminalTab === 'memoria' && (
          <div className="flex flex-col h-full w-full">
            <div className="flex justify-between items-center px-6 py-4 shrink-0 bg-[#0b0e11] border-b border-white/5">
              <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Memoria de Errores</h3>
              <button onClick={() => onSetConfirmAction({ title: 'Resetear Cerebro', msg: '¿Confirmas que deseas borrar toda la memoria adaptativa acumulada? La IA volverá a su estado base de fábrica.', onConfirm: () => onSetAiKnowledge([]) })} className="text-[9px] font-black text-blis-red-neon hover:text-white transition-all uppercase tracking-widest">Vaciar Memoria</button>
              <button onClick={() => onSetConfirmAction({ title: 'Limpiar Sistema', msg: '¿Deseas eliminar la memoria de la IA y todo el historial de operaciones de usuario? El contador del simulador volverá a cero.', onConfirm: onWipeAllData })} className="text-[9px] font-black text-blis-red-neon hover:text-white transition-all bg-blis-red/10 px-3 py-1 rounded-full border border-blis-red/20 uppercase tracking-widest ml-4">Limpiar Todo el Sistema</button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto flex-1 h-[250px] custom-scrollbar">
              {aiKnowledge.length === 0 ? (
                <div className="py-16 text-center text-gray-600 font-black uppercase tracking-[0.4em] opacity-20">Ninguna heurística registrada.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {aiKnowledge.map((mem: AiKnowledge, idx: number) => {
                    const isWin = mem.outcome === 'WIN';
                    return (
                      <div key={`mem-${mem.id}-${idx}`} className={`${isWin ? 'bg-emerald-500/5' : 'bg-blis-red/5'} border ${isWin ? 'border-emerald-500/20' : 'border-blis-red/20'} p-5 rounded-2xl flex flex-col gap-2 relative overflow-hidden group hover:border-opacity-50 transition-all`}>
                        <div className={`absolute -left-10 top-1/2 -translate-y-1/2 w-20 h-20 ${isWin ? 'bg-emerald-500/10' : 'bg-blis-red-neon/10'} rounded-full blur-xl`}></div>
                        <div className="flex justify-between items-center z-10">
                          <span className={`${isWin ? 'text-emerald-400' : 'text-blis-red-neon'} text-[9px] font-black uppercase tracking-wider`}>{isWin ? 'Refuerzo Positivo' : 'Trauma Heurístico'}</span>
                          <span className="text-[8px] font-mono text-gray-600">{new Date(mem.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-gray-300 font-bold italic text-[11px] leading-relaxed pl-3 border-l-2 border-white/10 z-10">{mem.rule}</p>
                        <div className="pt-2 mt-auto border-t border-white/5 flex gap-4 text-[8px] font-mono opacity-70 z-10">
                          <span className="text-gray-400">Token: <span className="text-white font-black">{mem.symbol?.replace('USDT', '') || 'N/A'} ({mem.type})</span></span>
                          <span className="text-gray-400">Rendimiento: <span className={`${isWin ? 'text-emerald-400' : 'text-blis-red-neon'} font-black`}>{isWin ? '+' : '-'}{mem.profit?.toFixed(2)}%</span></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
