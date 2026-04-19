"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Server, LayoutTemplate, Maximize2, Minimize2,
  BarChart2, Layers, TrendingUp, Zap, Hand, Square,
  AlignJustify, MousePointer, Pencil, Minus, Eraser, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { globalStyles, safeText, SidebarIcon, ToolButton } from './TerminalComponents';
import { TradingChart } from './TradingChart';
import { useTerminalLogic } from './_hooks';
import { TerminalHeader, TerminalChat, TerminalStats, TerminalModals, TerminalStyles, ChartScrollbar, VerticalSlider } from './_components';
import type { AutoPilotState, ChatMessage, ControlMode, DataSource, DrawMode, GlobalAlert, ManualStrategy, OpenPosition, SessionReport, SimMode, TerminalTab, TradeHistoryEntry, TradeReplayData, MarketTicker, AiKnowledge, ViewMode, TradeMode } from './_types';

export interface TradingTerminalProps {
  onScannerLog?: (par: string, mensaje: string, tipo: 'scan' | 'warning' | 'valid') => void;
  onSymbolChangeRequest?: (symbol: string) => void;
  signalAlertActive?: boolean;
}

export const TradingTerminal: React.FC<TradingTerminalProps> = ({ onScannerLog, onSymbolChangeRequest, signalAlertActive }) => {
  const t = useTerminalLogic({ onScannerLog, onSymbolChangeRequest, signalAlertActive });

  const loadingSpinner = (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blis-red"></div>
      <span className="text-blis-red text-[10px] font-bold tracking-widest uppercase animate-pulse">Sincronizando...</span>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row h-auto md:h-[calc(100dvh-80px)] min-h-screen md:min-h-0 w-full bg-[#0b0e11] text-gray-300 font-sans md:overflow-hidden trading-main relative border-l border-white/5 pb-20 md:pb-0 custom-red-scrollbar">
      <TerminalStyles />
      <style dangerouslySetInnerHTML={{ __html: globalStyles }} />

      {t.globalTooltip?.show && (
        <div className="fixed hidden md:block px-3 py-1.5 bg-[#181818]/95 backdrop-blur-xl text-white text-[10px] font-bold rounded-lg pointer-events-none whitespace-nowrap z-[9999] border border-white/10 shadow-2xl animate-fade-in" style={{ left: t.globalTooltip.x, top: t.globalTooltip.y, transform: 'translateY(-50%)' }}>
          {t.globalTooltip.text}
        </div>
      )}

      {(t.drawMode === 'freehand' || t.drawMode === 'line') && (
        <>
          <div className="hidden md:flex absolute left-16 top-[60%] -translate-y-1/2 z-[3000] p-2.5 bg-[#050505]/98 backdrop-blur-xl border border-white/10 rounded-2xl flex-col gap-3 shadow-[0_10px_50px_rgba(0,0,0,0.9)] animate-fade-in">
            <div className="w-1 h-3/4 absolute -left-1 top-[12.5%] bg-[#ff004c] rounded-full opacity-60"></div>
            {[
              {name: 'Rosa Blis', hex: '#ff004c'}, {name: 'Azul', hex: '#5956e9'}, {name: 'Amarillo', hex: '#fbe771'}, {name: 'Naranja', hex: '#f38704'}, {name: 'Blanco', hex: '#ffffff'}
            ].map(c => (
              <button key={c.hex} onClick={() => t.setDrawColor(c.hex)} title={c.name}
                className={`w-5 h-5 rounded-full border-2 transition-all hover:scale-125 ${t.drawColor === c.hex ? 'border-white scale-110 shadow-[0_0_10px_currentColor]' : 'border-transparent'}`}
                style={{ backgroundColor: c.hex }} />
            ))}
          </div>
          <div className="flex md:hidden absolute left-[50%] -translate-x-1/2 top-[5rem] z-[3000] p-2 bg-[#050505]/98 backdrop-blur-xl border border-white/10 rounded-2xl flex-row gap-3 shadow-[0_10px_50px_rgba(0,0,0,0.9)] animate-fade-in">
            {[
              {name: 'Rosa Blis', hex: '#ff004c'}, {name: 'Azul', hex: '#5956e9'}, {name: 'Amarillo', hex: '#fbe771'}, {name: 'Naranja', hex: '#f38704'}, {name: 'Blanco', hex: '#ffffff'}
            ].map(c => (
              <button key={c.hex} onClick={() => t.setDrawColor(c.hex)} title={c.name}
                className={`w-4 h-4 rounded-full border-2 transition-all hover:scale-125 ${t.drawColor === c.hex ? 'border-white scale-110 shadow-[0_0_10px_currentColor]' : 'border-transparent'}`}
                style={{ backgroundColor: c.hex }} />
            ))}
          </div>
        </>
      )}

      <div className="w-full h-16 md:w-14 md:h-auto border-b md:border-b-0 md:border-r border-white/5 bg-[#050505] flex md:flex-col flex-row items-center py-0 md:py-3 px-4 md:px-0 shrink-0 z-[200] relative md:shadow-2xl overflow-x-auto md:overflow-y-auto no-scrollbar">
        <div className="text-[#ff004c] mr-6 md:mr-0 md:mb-5 shrink-0 scale-90 md:scale-100">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect x="6" y="10" width="4" height="12" fill="#ff004c" rx="0.5"/>
            <line x1="8" y1="6" x2="8" y2="10" stroke="#ff004c" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="8" y1="22" x2="8" y2="26" stroke="#ff004c" strokeWidth="1.5" strokeLinecap="round"/>
            <rect x="13" y="7" width="4" height="10" fill="#0ecb81" rx="0.5"/>
            <line x1="15" y1="3" x2="15" y2="7" stroke="#0ecb81" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="15" y1="17" x2="15" y2="21" stroke="#0ecb81" strokeWidth="1.5" strokeLinecap="round"/>
            <rect x="20" y="12" width="4" height="9" fill="#ff004c" rx="0.5"/>
            <line x1="22" y1="8" x2="22" y2="12" stroke="#ff004c" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="22" y1="21" x2="22" y2="25" stroke="#ff004c" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="flex md:flex-col flex-row md:space-y-4 space-x-3 md:space-x-0 w-auto md:w-full items-center shrink-0">
          <SidebarIcon icon={<Server size={18} />} label="APIs" onClick={t.handleOpenApiModal} />
          <SidebarIcon icon={<LayoutTemplate size={18} />} label="DIVIDIDA" active={t.viewMode === 'split'} onClick={() => { t.setViewMode('split'); t.setIsTableMaximized(false); }} />
          <SidebarIcon icon={t.isTableMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />} label="EXPANDIR" active={t.isTableMaximized} onClick={() => { t.setViewMode('split'); t.setIsTableMaximized(!t.isTableMaximized); }} />
        </div>
        <div className="flex-1 hidden md:block min-h-[10px]"></div>
        <div className="flex flex-row md:flex-col items-center space-x-3 md:space-x-0 space-y-0 md:space-y-2.5 w-auto md:w-full border-l md:border-l-0 border-t-0 md:border-t border-white/5 pl-3 md:pl-0 pt-0 md:pt-4 ml-3 md:ml-0 mb-0 md:mb-2 shrink-0">
          <ToolButton icon={<BarChart2 size={16} />} active={t.showDom} onClick={() => t.setShowDom(!t.showDom)} title="Libro de Órdenes (DOM)" />
          <ToolButton icon={<Layers size={16} />} active={t.showFvg} onClick={() => t.setShowFvg(!t.showFvg)} title="Heatmaps Institucionales (FVG)" />
          <div className="w-8 h-px bg-white/5 md:mb-2 mb-0 mx-2 md:mx-0"></div>
          <ToolButton icon={<LayoutTemplate size={16} />} active={t.showGrid} onClick={() => t.setShowGrid(!t.showGrid)} title="Grilla de Precisión" />
          <ToolButton icon={<TrendingUp size={16} />} active={t.showSma} onClick={() => t.setShowSma(!t.showSma)} title="Líneas de Tendencia" />
          <ToolButton icon={<Zap size={16} />} active={t.showAiZonesUI} onClick={() => t.setShowAiZonesUI(!t.showAiZonesUI)} title="Guías Radar IA" />
          <ToolButton icon={<MousePointer size={16} />} active={t.showPositionLines} onClick={() => t.setShowPositionLines(!t.showPositionLines)} title="Líneas de Posición" />
          <div className="w-8 h-px bg-white/5 md:mb-2 mb-0 mx-2 md:mx-0"></div>
          <ToolButton icon={<Hand size={16} />} active={t.drawMode === 'hand'} onClick={() => t.selectTool('hand')} title="Mover Gráfico" />
          <ToolButton icon={<Square size={16} />} active={t.drawMode === 'select'} onClick={() => t.selectTool('select')} title="Selección de Área" />
          <ToolButton icon={<AlignJustify size={16} />} active={t.drawMode === 'fibonacci'} onClick={() => t.selectTool('fibonacci')} title="Retrocesos de Fibonacci" />
          <ToolButton icon={<Pencil size={16} />} active={t.drawMode === 'freehand'} onClick={() => t.selectTool('freehand')} title="Trazo Libre" />
          <ToolButton icon={<Minus size={16} />} active={t.drawMode === 'line'} onClick={() => t.selectTool('line')} title="Línea Recta" />
          <ToolButton icon={<Eraser size={16} />} active={t.drawMode === 'eraser'} onClick={() => t.selectTool('eraser')} title="Borrador" />
          <ToolButton icon={<Trash2 size={16} />} onClick={() => t.setConfirmAction({ title: 'Limpiar Dibujos', msg: '¿Estás seguro que deseas borrar todos los trazos y dibujos del gráfico? Esta acción no se puede deshacer.', onConfirm: () => t.setDrawings([]) })} title="Limpiar Todo" />
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-[50vh] md:min-h-0 min-w-0 relative">
        <TerminalHeader
          dataSource={t.dataSource}
          activeSymbol={t.activeSymbol}
          ticker={t.ticker}
          balance={t.balance}
          binanceAvailable={t.binanceAvailable}
          paperBalance={t.paperBalance}
          tradeMode={t.tradeMode}
          autoPilot={t.autoPilot}
          isBgScanning={t.isBgScanning}
          isMounted={t.isMounted}
          currentPriceRef={t.currentPriceRef}
          activeAssetBalance={t.activeAssetBalance}
          openPositions={t.openPositions}
          isEditingPaperBalance={t.isEditingPaperBalance}
          intervalTime={t.intervalTime}
          showTimeframeSelector={t.showTimeframeSelector}
          now={t.now}
          fmtUsd={t.fmtUsd}
          formatTimeLeft={t.formatTimeLeft}
          currentUsedMargin={t.currentUsedMargin}
          signalAlertActive={signalAlertActive}
          onSetDataSource={(ds: string) => { t.setDataSource(ds as DataSource); if (ds === 'simulation') t.setTradeMode('PAPER'); }}
          onSetTradeMode={(m: string) => t.setTradeMode(m as TradeMode)}
          onSetShowSymbolSelector={t.setShowSymbolSelector}
          onSetShowTimeframeSelector={t.setShowTimeframeSelector}
          onSetIntervalTime={t.setIntervalTime}
          onSetIsEditingPaperBalance={t.setIsEditingPaperBalance}
          onSetPaperBalance={t.setPaperBalance}
          onReconnect={t.reconnectOpenTrade}
          tradeHistory={t.tradeHistory}
        />

        <div className={`${t.isTableMaximized ? 'h-0 overflow-hidden opacity-0' : (t.viewMode === 'chart' ? 'flex-1 h-full' : 'h-[65vh] md:flex-1')} relative bg-[#0b0e11] w-full transition-all duration-300`}>
          <div
            className="absolute inset-0 overflow-hidden z-10"
            ref={t.chartRef}
            onWheel={t.handleWheel}
            onMouseDown={t.handleMouseDown} onMouseMove={t.handleMouseMove}
            onMouseUp={t.handleMouseUp} onMouseLeave={t.handleMouseLeave}
            onTouchStart={t.handleTouchStart} onTouchMove={t.handleTouchMove}
            onTouchEnd={t.handleMouseUp}
            style={{ touchAction: 'none' }}
          >
            {!t.loading ? (
              <>
                <TradingChart
                  data={t.candles}
                  ticker={t.ticker}
                  dimensions={t.dimensions}
                  drawings={t.drawings}
                  positions={t.openPositions}
                  chartMath={t.chartMath}
                  isAiThinking={t.isAiThinking}
                  aiZones={t.aiZones}
                  drawMode={t.drawMode}
                  isDragging={t.isDragging}
                  currentDrawing={t.currentDrawing}
                  hoverData={t.hoverData}
                  hoverPositionId={t.hoverPositionId}
                  setHoverPositionId={t.setHoverPositionId}
                  setSelectedPositionId={t.setSelectedPositionId}
                  showGrid={t.showGrid}
                  showSma={t.showSma}
                  showAiZonesUI={t.showAiZonesUI}
                  showPositionLines={t.showPositionLines}
                  selectedPositionId={t.selectedPositionId}
                  showDom={t.showDom}
                  tradeReplayData={t.tradeReplayData}
                />
              </>
            ) : loadingSpinner}
            {t.hoveredCandle && !t.isDragging && (
              <div className="absolute top-[24px] left-[170px] bg-transparent text-[10px] font-mono flex gap-4 text-gray-400 pointer-events-none z-10 scale-95 origin-top-left">
                <span className="font-bold text-white pr-4 border-r border-white/10">{new Date(t.hoveredCandle.candle.time).toLocaleTimeString()}</span>
                <span>O: <b className="text-white">{t.fmtUsd(t.hoveredCandle.candle.open)}</b></span>
                <span>H: <b className="text-emerald-400">{t.fmtUsd(t.hoveredCandle.candle.high)}</b></span>
                <span>L: <b className="text-blis-red-neon">{t.fmtUsd(t.hoveredCandle.candle.low)}</b></span>
              </div>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-14 h-5 z-20">
            <ChartScrollbar
              type="horizontal"
              min={0}
              max={Math.max(1, t.candles.length)}
              value={t.candles.length - t.panOffset}
              onChange={(e: any) => t.setPanOffset(Math.max(0, Math.min(t.candles.length - t.zoom, t.candles.length - parseFloat(e.target.value))))}
              className="custom-horizontal-range w-full h-full cursor-ew-resize"
            />
          </div>
          <div className="absolute top-0 right-0 bottom-5 w-3.5 z-20">
            <VerticalSlider
              min={0.1}
              max={10}
              value={t.priceZoom}
              onChange={(v: number) => t.setPriceZoom(v)}
            />
          </div>
        </div>

        {t.viewMode === 'split' && (
          <TerminalStats
            terminalTab={t.terminalTab}
            openPositions={t.openPositions}
            tradeHistory={t.tradeHistory}
            historyFilter={t.historyFilter}
            historyWindow={t.historyWindow}
            historyTotal={t.historyTotal}
            historyLoading={t.historyLoading}
            hasMoreHistory={t.hasMoreHistory}
            tableScrollRef={t.tableScrollRef}
            savedReports={t.savedReports}
            aiKnowledge={t.aiKnowledge}
            tradingMetrics={t.tradingMetrics}
            activeSymbol={t.activeSymbol}
            currentPriceRef={t.currentPriceRef}
            symbolPricesRef={t.symbolPricesRef}
            isTableMaximized={t.isTableMaximized}
            viewMode={t.viewMode}
            tradeReplayData={t.tradeReplayData}
            lastSeenHistoryCount={t.lastSeenHistoryCount}
            lastSeenReportsCount={t.lastSeenReportsCount}
            isMounted={t.isMounted}
            fmtUsd={t.fmtUsd}
            formatTableTime={t.formatTableTime}
            formatTimePassed={t.formatTimePassed}
            getPnlData={t.getPnlData}
            safeText={safeText}
            onSetTerminalTab={t.setTerminalTab}
            onSetHistoryFilter={t.setHistoryFilter}
            onSetHistoryTotal={t.setHistoryTotal}
            onSetLastSeenHistoryCount={t.setLastSeenHistoryCount}
            onSetLastSeenReportsCount={t.setLastSeenReportsCount}
            onSetSelectedPositionId={t.setSelectedPositionId}
            onSetHoverPositionId={t.setHoverPositionId}
            onSetTradeReplayData={t.setTradeReplayData}
            onSetConfirmAction={t.setConfirmAction}
            onSetAiKnowledge={t.setAiKnowledge}
            onWipeAllData={t.wipeAllData}
            onSetIsTableMaximized={t.setIsTableMaximized}
            onSetHistoryWindow={t.setHistoryWindow}
            onSetHistoryOffset={t.setHistoryOffset}
            onSetHistoryLoading={t.setHistoryLoading}
            onSetHasMoreHistory={t.setHasMoreHistory}
            onCloseTradeManual={t.closeTradeManual}
            supabaseClient={null}
            now={t.now}
          />
        )}
      </div>

      <TerminalChat
        controlMode={t.controlMode}
        setControlMode={t.setControlMode}
        autoPilot={t.autoPilot}
        setAutoPilot={t.setAutoPilot}
        botBudget={t.botBudget}
        setBotBudget={t.setBotBudget}
        freeBudget={t.freeBudget}
        setFreeBudget={t.setFreeBudget}
        userLeverage={t.userLeverage}
        setUserLeverage={t.setUserLeverage}
        aiConfigExpanded={t.aiConfigExpanded}
        setAiConfigExpanded={t.setAiConfigExpanded}
        aiLearningEnabled={t.aiLearningEnabled}
        setAiLearningEnabled={t.setAiLearningEnabled}
        enableNotifications={t.enableNotifications}
        setEnableNotifications={t.setEnableNotifications}
        signalAlertActive={signalAlertActive}
        botMode={t.botMode}
        setBotMode={t.setBotMode}
        showModeSelect={t.showModeSelect}
        setShowModeSelect={t.setShowModeSelect}
        startAutoPilotManual={t.startAutoPilotManual}
        stopAutoPilotManual={t.stopAutoPilotManual}
        chatMessages={t.chatMessages}
        chatInput={t.chatInput}
        setChatInput={t.setChatInput}
        isTyping={t.isTyping}
        chatScrollRef={t.chatScrollRef}
        hasUnreadMessages={t.hasUnreadMessages}
        setHasUnreadMessages={t.setHasUnreadMessages}
        chatEndRef={t.chatEndRef}
        formatChatTime={t.formatChatTime}
        handleSendMessage={t.handleSendMessage}
        setConfirmAction={t.setConfirmAction}
        manualTradeAmt={t.manualTradeAmt}
        setManualTradeAmt={t.setManualTradeAmt}
        manualStrategy={t.manualStrategy}
        setManualStrategy={t.setManualStrategy}
        manualExecStatus={t.manualExecStatus}
        executeManualSignal={t.executeManualSignal}
        isManualChatThinking={t.isManualChatThinking}
        setIsManualChatThinking={t.setIsManualChatThinking}
        manualChatInput={t.manualChatInput}
        setManualChatInput={t.setManualChatInput}
        manualChatHistory={t.manualChatHistory}
        setManualChatHistory={t.setManualChatHistory}
        handleManualEval={t.handleManualEval}
        handleBacktest={t.handleBacktest}
        isBacktesting={t.isBacktesting}
        backtestResult={t.backtestResult}
        marketSentiment={t.marketSentiment}
        isEvaluatingSentiment={t.isEvaluatingSentiment}
        handleSentimentEval={t.handleSentimentEval}
        aiKnowledge={t.aiKnowledge}
        manualRulesExpanded={t.manualRulesExpanded}
        setManualRulesExpanded={t.setManualRulesExpanded}
        manualBeExpanded={t.manualBeExpanded}
        setManualBeExpanded={t.setManualBeExpanded}
        closeAllPositions={t.closeAllPositions}
        now={t.now}
        handleSymbolChange={t.handleSymbolChange}
        onScannerLog={onScannerLog}
      />

      <TerminalModals
        showSymbolSelector={t.showSymbolSelector}
        searchSymbol={t.searchSymbol}
        dataSource={t.dataSource}
        simMode={t.simMode}
        marketTickers={t.marketTickers}
        favoriteSymbols={t.favoriteSymbols}
        activeSymbol={t.activeSymbol}
        globalAlert={t.globalAlert}
        confirmAction={t.confirmAction}
        sessionReport={t.sessionReport}
        showSimInfo={t.showSimInfo}
        selectedPositionId={t.selectedPositionId}
        openPositions={t.openPositions}
        tradeHistory={t.tradeHistory}
        tradeMode={t.tradeMode}
        activeSymbolRef={t.activeSymbolRef}
        ticker={t.ticker}
        currentPriceRef={t.currentPriceRef}
        onSetShowSymbolSelector={t.setShowSymbolSelector}
        onSetSearchSymbol={t.setSearchSymbol}
        onSetDataSource={(ds: string) => { t.setDataSource(ds as DataSource); if (ds === 'simulation') t.setTradeMode('PAPER'); }}
        onSetActiveSymbol={t.setActiveSymbol}
        onSetSimMode={(m: string) => t.setSimMode(m as SimMode)}
        onSetShowSimInfo={t.setShowSimInfo}
        onHandleSymbolChange={t.handleSymbolChange}
        onToggleFavorite={t.toggleFavorite}
        onSetGlobalAlert={t.setGlobalAlert}
        onSetConfirmAction={t.setConfirmAction}
        onSetSessionReport={t.setSessionReport}
        onSetSelectedPositionId={t.setSelectedPositionId}
        onSetTradeReplayData={t.setTradeReplayData}
        getPnlData={t.getPnlData}
        fmtUsd={t.fmtUsd}
        formatTimePassed={t.formatTimePassed}
        safeText={safeText}
        closeTradeManual={t.closeTradeManual}
        candles={t.candles}
        isMounted={t.isMounted}
      />
    </div>
  );
};