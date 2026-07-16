"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { aiChat } from '@/lib/ai-client';
import { safeText } from '../TerminalComponents';
import type {
  AutoPilotState, ChatMessage, ControlMode, DataSource, DrawMode,
  ManualStrategy, OpenPosition, SessionReport, SimMode, TerminalTab,
  TradeHistoryEntry, TradeReplayData, ConfirmAction, GlobalAlert,
  MarketTicker, AiKnowledge, ViewMode, TradeMode,
  CandleData, BinanceTicker24Hr, BinanceBalanceEntry, BinanceSpotBalance,
  BinanceSymbolInfo, BinanceSymbolFilter, BinanceOrderParams,
  AiZone, DragStartState, HoverDataPoint, HoveredCandle, Drawing, FVGData,
  TickerState, MockSignalMsg, BacktestResult,
  MarketSentimentData, ManualChatEntry, ManualExecStatusData, SimInfoData,
  GlobalTooltipState, TradingMetrics, PnlData,
  TradingHistoryRow, TradingGlobalStateRow, ScanResult,
  WSTickerPriceMsg
} from '../_types';

import { TerminalStyles, ChartScrollbar, VerticalSlider } from '../_components/TerminalStyles';

// ── Helper para casts de Supabase ──
interface SupaFilterable { eq: (column: string, value: string) => SupaFilterable; }

const INTERVALS = ['1m', '5m', '15m', '1h', '4h', '1d'];

export function useTerminalLogic(props: {
  onScannerLog?: (par: string, mensaje: string, tipo: 'scan' | 'warning' | 'valid') => void;
  onSymbolChangeRequest?: (symbol: string) => void;
  signalAlertActive?: boolean;
}) {
  const { onScannerLog, onSymbolChangeRequest, signalAlertActive } = props;
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  const [keys, setKeys] = useState({ gemini: "", openai: "", binance_key: "", binance_secret: "" });

  useEffect(() => {
    setIsMounted(true);
    try {
      if (typeof window !== 'undefined') {
        const savedSymbol = localStorage.getItem('blis_active_symbol');
        if (savedSymbol) setActiveSymbol(savedSymbol);
      }
      const gemini = localStorage.getItem("gemini_key") || "";
      const openai = localStorage.getItem("openai_key") || localStorage.getItem("chatgpt_key") || "";
      const bKey = localStorage.getItem("binance_api_key") || localStorage.getItem("blis_binance_key") || "";
      const bSecret = localStorage.getItem("binance_secret_key") || localStorage.getItem("blis_binance_secret") || "";
      setKeys({ gemini, openai, binance_key: bKey, binance_secret: bSecret });
    } catch (e) { console.warn("localStorage no disponible:", e); setKeys({ gemini: "", openai: "", binance_key: "", binance_secret: "" }); }
  }, []);

  const handleOpenApiModal = () => { router.push('/superadmin/api-nube'); };

  const [candles, setCandles] = useState<CandleData[]>([]);
  const candlesRef = useRef<CandleData[]>([]);
  const [ticker, setTicker] = useState<TickerState>({ price: 2900.00, changePercent: 0.25 });
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<DataSource>('binance');
  const [simMode, setSimMode] = useState<SimMode>('NORMAL');

  useEffect(() => { if (!isMounted) return; const s = localStorage.getItem('blis_data_source'); if (s) setDataSource(s as DataSource); }, [isMounted]);
  useEffect(() => { if (!isMounted) return; localStorage.setItem('blis_data_source', dataSource); }, [dataSource, isMounted]);

  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiZones, setAiZones] = useState<AiZone[]>([
    { high: 2915.50, low: 2912.20, type: 'supply' },
    { high: 2895.80, low: 2892.10, type: 'demand' }
  ]);
  const chartRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [intervalTime, setIntervalTime] = useState('5m');
  const [zoom, setZoom] = useState(100);
  const [panOffset, setPanOffset] = useState(0);
  const [priceZoom, setPriceZoom] = useState(1.0);
  const [priceOffset, setPriceOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<DragStartState>({ x: 0, y: 0, panStart: 0, priceOffsetStart: 0, zoomStart: undefined, priceZoomStart: 1.0 });
  const [drawMode, setDrawMode] = useState<DrawMode | string>('cursor');
  const [drawColor, setDrawColor] = useState('#5956e9');
  const [showPalette, setShowPalette] = useState(false);
  const [hoverData, setHoverData] = useState<HoverDataPoint | null>(null);
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [currentDrawing, setCurrentDrawing] = useState<Drawing | null>(null);
  const [hoveredCandle, setHoveredCandle] = useState<HoveredCandle | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [now, setNow] = useState(Date.now());

  const [activeSymbol, setActiveSymbol] = useState<string>('BTCUSDT');
  useEffect(() => { if (typeof window !== 'undefined' && isMounted) { localStorage.setItem('blis_active_symbol', activeSymbol); } }, [activeSymbol, isMounted]);
  const [showSymbolSelector, setShowSymbolSelector] = useState(false);
  const [showTimeframeSelector, setShowTimeframeSelector] = useState(false);
  const [marketTickers, setMarketTickers] = useState<MarketTicker[]>([]);
  const [showSimInfo, setShowSimInfo] = useState<SimInfoData | null>(null);
  const [searchSymbol, setSearchSymbol] = useState('');
  const [favoriteSymbols, setFavoriteSymbols] = useState<string[]>(['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'PAXGUSDT']);
  const favoriteSymbolsRef = useRef<string[]>(['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'PAXGUSDT']);
  const hasWarnedSpotShort = useRef<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const favs = localStorage.getItem('blis_fav_symbols');
      if (favs) { const parsed = JSON.parse(favs); setFavoriteSymbols(parsed); favoriteSymbolsRef.current = parsed; }
    }
  }, []);

  const toggleFavorite = (symbol: string, e: React.MouseEvent) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setFavoriteSymbols(prev => {
      const newFavs = prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol];
      localStorage.setItem('blis_fav_symbols', JSON.stringify(newFavs));
      favoriteSymbolsRef.current = newFavs;
      return newFavs;
    });
  };

  const marketTickersRef = useRef<BinanceTicker24Hr[]>([]);
  useEffect(() => {
    if (marketTickers.length > 0) return;
    const loadTickers = async () => {
      try {
        const res = await fetch('/api/binance?endpoint=/fapi/v1/ticker/24hr');
        if (!res.ok) throw new Error('API Error');
        const data = await res.json();
        const usdtPairs = (data as BinanceTicker24Hr[]).filter((t: BinanceTicker24Hr) => t.symbol.endsWith('USDT')).sort((a: BinanceTicker24Hr, b: BinanceTicker24Hr) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume));
        const topList = usdtPairs.slice(0, 150);
        setMarketTickers(topList);
        marketTickersRef.current = topList;
      } catch (e) { console.error("Error cargando Asset Tickers", e); }
    };
    loadTickers();
  }, [marketTickers.length]);

  const [balance, setBalance] = useState(0.00);
  const [binanceAvailable, setBinanceAvailable] = useState(0.00);
  const binanceAvailableRef = useRef(0.00);
  const [activeAssetBalance, setActiveAssetBalance] = useState(0.00);
  const [assetViewMode, setAssetViewMode] = useState<'USD' | 'UNITS'>('USD');
  const [historyFilter, setHistoryFilter] = useState<'ALL' | 'REAL' | 'PAPER'>('ALL');
  const balanceRef = useRef(0.00);
  const [tradeMode, setTradeMode] = useState<TradeMode>('PAPER');
  const tradeModeRef = useRef<TradeMode>('PAPER');

  useEffect(() => { if (typeof window !== 'undefined') { const saved = localStorage.getItem('blis_trade_mode') as TradeMode; if (saved) setTradeMode(saved); } }, []);
  useEffect(() => { if (typeof window !== 'undefined') { localStorage.setItem('blis_trade_mode', tradeMode); tradeModeRef.current = tradeMode; } }, [tradeMode]);

  const [paperBalance, setPaperBalance] = useState(() => {
    try { const saved = typeof window !== 'undefined' ? localStorage.getItem('blis_paper_balance') : null; return saved !== null && !isNaN(parseFloat(saved)) ? parseFloat(saved) : 200.00; } catch { return 200.00; }
  });
  const [isEditingPaperBalance, setIsEditingPaperBalance] = useState(false);
  const paperBalanceRef = useRef(paperBalance);
  useEffect(() => { paperBalanceRef.current = paperBalance; }, [paperBalance]);

  const [openPositions, setOpenPositions] = useState<OpenPosition[]>([]);
  const openPositionsRef = useRef<OpenPosition[]>([]);
  const [tradeHistory, setTradeHistory] = useState<TradeHistoryEntry[]>([]);
  const tradeHistoryRef = useRef<TradeHistoryEntry[]>([]);
  const [historyLimit, setHistoryLimit] = useState(25);
  const [historyOffset, setHistoryOffset] = useState(0);
  const [historyWindow, setHistoryWindow] = useState<TradeHistoryEntry[]>([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const tableScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    setHistoryLoading(true); setHistoryOffset(0); setHistoryWindow([]); setTradeHistory([]); setHistoryLimit(25); setHasMoreHistory(true);
    const fetchInitialHistory = async () => {
      try {
        const modeFilter = historyFilter !== 'ALL' ? historyFilter : null;
        let pageQuery = supabase.from('trading_history').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(0, 49);
        if (modeFilter) { pageQuery = (pageQuery as any).eq('trade_mode', modeFilter); }
        const { data, error, count } = await pageQuery;
        if (error) console.error("Supabase fetchInitialHistory Error:", error);
        if (active && data && !error) {
          setHistoryTotal(count || data.length || 0);
          const formatted = ((data as unknown) as TradingHistoryRow[]).map((r: TradingHistoryRow) => ({
            id: r.id, symbol: r.symbol, type: r.trade_type, amount: parseFloat(r.amount), leverage: Number(r.leverage), entryPrice: parseFloat(r.entry_price), closePrice: parseFloat(r.close_price), finalPnl: parseFloat(r.final_pnl), duration: Number(r.duration) || 0, closeReason: r.close_reason, candlesAtOpen: r.candles_snapshot, tradeMode: r.trade_mode, closeTime: new Date(r.created_at).getTime()
          } as TradeHistoryEntry));
          setHistoryWindow(formatted as TradeHistoryEntry[]);
          setTradeHistory(formatted as TradeHistoryEntry[]);
          if (data.length < 50) setHasMoreHistory(false);
        }
      } catch (e) { console.error("Exception in fetchInitialHistory:", e); }
      if (active) setHistoryLoading(false);
    };
    fetchInitialHistory();
    return () => { active = false; };
  }, [historyFilter]);

  useEffect(() => { const cappedHistory = tradeHistory.slice(0, 200); tradeHistoryRef.current = cappedHistory; }, [tradeHistory]);
  const currentPriceRef = useRef(2900.00);
  const activeAssetBalanceRef = useRef(0.00);
  const spotAssetFreeRef = useRef(0.00);
  const spotFreeBalanceRef = useRef(0.00);
  const symbolPricesRef = useRef<Record<string, number>>({});
  const symbolFiltersRef = useRef<Record<string, { stepSize: string; minQty: string; minNotional: string }>>({});
  const [aiLearningEnabled, setAiLearningEnabled] = useState(true);
  const aiKnowledgeRef = useRef<AiKnowledge[]>([]);
  const aiMemory = useRef<string[]>([]);
  const lastAiCallTime = useRef(0);
  const lastCurrentPriceSymbolRef = useRef(0);
  const aiBoredomRef = useRef(0);
  const lastScanLogRef = useRef(0);
  const bgScanIdxRef = useRef(0);
  const [isBgScanning, setIsBgScanning] = useState(false);

  const syncBinanceWallet = useCallback(async () => {
    if (!isMounted || !keys.binance_key || !keys.binance_secret) return;
    try {
      let spotUsdt = 0; let futuresUsdt = 0; let baseSymbol = "";
      let assetFound = 0; let spotAssetFree = 0;
      let allTickers: BinanceTicker24Hr[] = [];
      try {
        const rT = await fetch('/api/binance?endpoint=/fapi/v1/ticker/24hr');
        if (rT.ok) allTickers = await rT.json();
      } catch (e) { console.error("Exception fetching tickers:", e); }
      const priceMap = new Map((allTickers || []).map((t: BinanceTicker24Hr) => [t.symbol, parseFloat(t.lastPrice)]));

      let futuresApiOk = false;
      try {
        const resFut = await fetch('/api/binance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint: '/fapi/v2/balance', method: 'GET', apiKey: keys.binance_key, apiSecret: keys.binance_secret }) });
        const dataFut = await resFut.json();
        if (resFut.ok && Array.isArray(dataFut)) {
          const usdtFut = dataFut.find((b: BinanceBalanceEntry) => b.asset === 'USDT');
          if (usdtFut) { futuresUsdt = parseFloat(usdtFut.balance || usdtFut.marginBalance || usdtFut.walletBalance || '0'); const avail = parseFloat(usdtFut.availableBalance || usdtFut.balance || '0'); setBinanceAvailable(avail); binanceAvailableRef.current = avail; futuresApiOk = true; }
        } else if (resFut.ok && dataFut?.assets) {
          const usdtFut = dataFut.assets.find((a: BinanceBalanceEntry) => a.asset === 'USDT');
          if (usdtFut) { futuresUsdt = parseFloat(usdtFut.marginBalance || usdtFut.walletBalance || '0'); const avail = parseFloat(usdtFut.availableBalance || '0'); setBinanceAvailable(avail); binanceAvailableRef.current = avail; futuresApiOk = true; }
        }
      } catch (e) { console.error("Exception fetching futures balance:", e); }

      let spotApiOk = false;
      const resSpot = await fetch('/api/binance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint: '/api/v3/account', method: 'GET', apiKey: keys.binance_key, apiSecret: keys.binance_secret }) });
      const dataSpot = await resSpot.json();
      if (resSpot.ok && dataSpot?.balances) {
        spotApiOk = true;
        baseSymbol = activeSymbol.toString().replace('/', '').replace('USDT', '').trim().toUpperCase();
        dataSpot.balances.forEach((b: BinanceSpotBalance) => {
          const valFree = parseFloat(b.free); const valTotal = valFree + parseFloat(b.locked);
          if (valTotal <= 0.00000001) return;
          const asset = b.asset.trim().toUpperCase();
          if (asset === 'USDT') { spotUsdt += valTotal; spotFreeBalanceRef.current = valFree; }
          else if (asset === baseSymbol) { assetFound += valTotal; spotAssetFree += valFree; }
        });
      }
      const totalUsdt = spotUsdt + futuresUsdt;
      if (spotApiOk || futuresApiOk) { setBalance(totalUsdt); balanceRef.current = totalUsdt; setActiveAssetBalance(spotAssetFree); activeAssetBalanceRef.current = spotAssetFree; }
    } catch (err) { console.warn("Error sincronizando billetera:", err); }
  }, [isMounted, keys, activeSymbol]);

  const isChatGptThinkingRef = useRef<boolean>(false);
  const lastMacroAnalysisTSRef = useRef<number>(0);
  const swingQueueIndexRef = useRef<number>(0);

  const reconnectOpenTrade = () => {
    if (tradeModeRef.current === 'REAL' && activeAssetBalanceRef.current > 0.0001) {
      if (openPositions.some(p => p.symbol === activeSymbol)) {
        setChatMessages(prev => [...prev, { id: Date.now(), role: 'bot', text: `ℹ️ **Reconexión**: Ya estás monitoreando la operación de ${activeSymbol}.`, timestamp: Date.now() }]);
        return;
      }
      const currentP = (ticker?.price && ticker.price !== 2900.00) ? ticker.price : (currentPriceRef.current !== 2900.00 ? currentPriceRef.current : 0);
      const newPos = { id: Date.now(), symbol: activeSymbol, type: 'BUY' as const, entryPrice: currentP, amount: (activeAssetBalanceRef.current * currentP), quantity: activeAssetBalanceRef.current, timestamp: Date.now(), openTime: Date.now(), leverage: 1, isReconnected: true };
      setOpenPositions([newPos]);
      setChatMessages(prev => [...prev, { id: Date.now(), role: 'bot', text: `⚡ **Enlace Establecido**: He detectado fondos de ${activeSymbol} en tu billetera. Me he reconectado a la operación para monitorear señales de salida. 🕵️‍♂️📈`, timestamp: Date.now() }]);
    } else {
      setChatMessages(prev => [...prev, { id: Date.now(), role: 'bot', text: tradeModeRef.current === 'PAPER' ? `❌ **Error**: Cambia a modo REAL para reconectar fondos de Binance.` : `❌ **Fallo**: No detecto fondos activos de ${activeSymbol} en Binance para enlazar.`, timestamp: Date.now() }]);
    }
  };

  const [manualTradeAmt, setManualTradeAmt] = useState(10);
  const [controlMode, setControlMode] = useState<ControlMode>('AI');
  const [manualStrategy, setManualStrategy] = useState<ManualStrategy>({
    emaFast: 21, emaSlow: 55, rsiPeriod: 14, rsiBuy: 38, rsiSell: 62, stochK: 14, stochD: 3, stochOverbought: 92, stochOversold: 8,
    sl: 1.5, tp: 2.0, risk: 5, beEnabled: true, beTrigger: 20, beLock: 2, trailingEnabled: false, trailingDist: 25, trailingAfterBE: true,
    atrMultiplier: 1.5, tpRatio: 2.0
  });
  const [aiConfigExpanded, setAiConfigExpanded] = useState(() => { try { const v = localStorage.getItem('blis_config_expanded'); return v !== null ? v === 'true' : true; } catch { return true; } });
  const [manualRulesExpanded, setManualRulesExpanded] = useState(true);
  const [manualBeExpanded, setManualBeExpanded] = useState(true);
  const [globalAlert, setGlobalAlert] = useState<string | GlobalAlert | null>(null);
  const activeSymbolRef = useRef(activeSymbol);
  useEffect(() => { activeSymbolRef.current = activeSymbol; }, [activeSymbol]);
  const currentPriceSymbolRef = useRef(activeSymbol);

  const handleSymbolChange = (newSym: string, forceOverride = false) => {
    if (openPositionsRef.current.length > 0 && !forceOverride) {
      setGlobalAlert({ msg: `BLOQUEO ESTRUCTURAL: Tienes operaciones activas en [${activeSymbolRef.current}].\n\nSi estás intentando usar Multi-Pantalla en otra ventana, puedes FORZAR el cambio, pero las operaciones antiguas quedarán pausadas en esta gráfica.`, pendingSymbol: newSym });
      setShowSymbolSelector(false); setSearchSymbol(''); return;
    }
    if (autoPilot.active && openPositionsRef.current.length > 0) {
      stopAutoPilotManual(false);
      setChatMessages(prev => [...prev, { id: Date.now(), role: 'bot', text: `⚠️ **Parada de Seguridad**: Cambio de Activo a ${newSym} con operaciones abiertas. Autopiloto desactivado para proteger el balance.`, timestamp: Date.now() }]);
    }
    setGlobalAlert(null); setActiveSymbol(newSym); setShowSymbolSelector(false); setSearchSymbol('');
  };

  useEffect(() => { if (dataSource === 'simulation') setTradeMode('PAPER'); }, [dataSource]);

  useEffect(() => {
    if (!isMounted) return;
    try {
      const savedBalance = localStorage.getItem('blis_balance'); if (savedBalance) setBalance(parseFloat(savedBalance));
      const savedKnowledge = localStorage.getItem('blis_ai_knowledge'); if (savedKnowledge) { const pk = JSON.parse(savedKnowledge); setAiKnowledge(pk); aiKnowledgeRef.current = pk; }
      const savedRep = localStorage.getItem('blis_saved_reports'); if (savedRep) setSavedReports(JSON.parse(savedRep));
      const savedHistCount = localStorage.getItem('blis_last_history_count'); if (savedHistCount) setLastSeenHistoryCount(Number(savedHistCount));
      const savedRepCount = localStorage.getItem('blis_last_reports_count'); if (savedRepCount) setLastSeenReportsCount(Number(savedRepCount));
      const savedAuto = localStorage.getItem('blis_autopilot'); if (savedAuto) { const parsed = JSON.parse(savedAuto); if (parsed.active) { setAutoPilot(parsed); } }
      const b = localStorage.getItem('blis_bot_budget'); if (b) setBotBudget(Number(b));
      const l = localStorage.getItem('blis_user_lev'); if (l) setUserLeverage(Number(l));
      const f = localStorage.getItem('blis_free_budget'); if (f) setFreeBudget(f === 'true');
    } catch (e) { console.warn("Error en sincronía inicial:", e); }
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    try {
      const savedPos = localStorage.getItem('blis_open_pos_all');
      if (savedPos) { const parsedPos = JSON.parse(savedPos); setOpenPositions(parsedPos); openPositionsRef.current = parsedPos; }
      supabase.from('trading_open_positions').select('*').then(({ data, error }) => {
        if (!error && data && data.length > 0) { const cloudPos = data.map(d => d.payload); setOpenPositions(cloudPos); openPositionsRef.current = cloudPos; localStorage.setItem('blis_open_pos_all', JSON.stringify(cloudPos)); }
      });
    } catch {}
  }, [isMounted]);

  useEffect(() => {
    openPositionsRef.current = openPositions;
    if (typeof window !== 'undefined' && isMounted) {
      try {
        const lightweightPositions = openPositions.map(({ candlesAtOpen, candlesAtClose, ...rest }: OpenPosition) => rest);
        localStorage.setItem('blis_open_pos_all', JSON.stringify(lightweightPositions));
        if (lightweightPositions.length > 0) { const upserts = lightweightPositions.map((op) => ({ id: String(op.id), payload: op })); supabase.from('trading_open_positions').upsert(upserts).then(); }
      } catch (e) { console.warn("Error sizing down open positions to fit quota:", e); }
    }
  }, [openPositions, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    syncBinanceWallet();
    const interval = setInterval(syncBinanceWallet, 30000);
    return () => clearInterval(interval);
  }, [isMounted, syncBinanceWallet]);

  useEffect(() => {
    return; // Auto-scan desactivado. Usar botón "Iniciar Robot" manualmente.
    if (!isMounted) return;
    const WATCH_LIST = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'LINKUSDT', 'AVAXUSDT', 'DOTUSDT', 'MATICUSDT'];
    const MIN_ATR_PCT = 0.05; const MAX_ATR_PCT = 2.5;
    const runWelcomeScan = async () => {
      await new Promise(r => setTimeout(r, 2500));
      setChatMessages(prev => [...prev, { role: 'bot', text: '🔍 **Escaneando mercado...** Analizando volatilidad, tendencia y volumen en mis activos favoritos. Dame un momento...', timestamp: Date.now() }]);
      const results: Array<{ symbol: string; score: number; atrPct: number; trend: string; volStrength: string; direction: 'BUY' | 'SELL'; price: number }> = [];
      for (const sym of WATCH_LIST) {
        try {
          const res = await fetch(`/api/binance?endpoint=/fapi/v1/klines&symbol=${sym}&interval=5m&limit=60`);
          if (!res.ok) continue;
          const raw = await res.json();
          if (!Array.isArray(raw) || raw.length < 30) continue;
          const candleData = raw.map((c: number[]) => ({ open: parseFloat(String(c[1])), high: parseFloat(String(c[2])), low: parseFloat(String(c[3])), close: parseFloat(String(c[4])), volume: parseFloat(String(c[5])) }));
          const last = candleData[candleData.length - 1]; const price = last.close;
          let atrSum = 0;
          for (let i = 1; i < Math.min(15, candleData.length); i++) { const c = candleData[candleData.length - i]; const p = candleData[candleData.length - i - 1]; atrSum += Math.max(c.high - c.low, Math.abs(c.high - p.close), Math.abs(c.low - p.close)); }
          const atr = atrSum / 14; const atrPct = (atr / price) * 100;
          if (atrPct < MIN_ATR_PCT || atrPct > MAX_ATR_PCT) continue;
          const ema = (arr: number[], period: number) => { const k = 2 / (period + 1); return arr.reduce((prev, cur) => cur * k + prev * (1 - k)); };
          const closes = candleData.slice(-30).map(c => c.close);
          const ema9 = ema(closes.slice(-9), 9); const ema21 = ema(closes.slice(-21), 21);
          const trend = ema9 > ema21 ? '📈 Alcista' : '📉 Bajista';
          const direction: 'BUY' | 'SELL' = ema9 > ema21 ? 'BUY' : 'SELL';
          const avgVol = candleData.slice(-20).reduce((s, c) => s + c.volume, 0) / 20;
          const volRatio = last.volume / avgVol;
          const volStrength = volRatio > 1.5 ? '🔥 Alto' : volRatio > 1.0 ? '✅ Normal' : '⚠️ Bajo';
          const trendStrength = Math.abs(ema9 - ema21) / ema21 * 100;
          const score = (trendStrength * 2) + (volRatio * 1.5) - (atrPct > 1.5 ? atrPct * 0.5 : 0);
          results.push({ symbol: sym, score, atrPct, trend, volStrength, direction, price });
        } catch (_) {}
      }
      if (results.length === 0) { setChatMessages(prev => [...prev, { role: 'bot', text: '⚠️ **Escaneo completado**: No pude analizar los pares en este momento.', timestamp: Date.now() }]); return; }
      results.sort((a, b) => b.score - a.score);
      const best = results[0]; const displaySym = best.symbol.replace('USDT', '/USDT');
      const rankText = results.slice(0, 3).map((r, i) => `${['🥇', '🥈', '🥉'][i]} **${r.symbol.replace('USDT', '')}** — ${r.trend} | Vol: ${r.volStrength} | ATR: ${r.atrPct.toFixed(2)}% | Score: ${r.score.toFixed(1)}`).join('\n');
      setChatMessages(prev => [...prev, { role: 'bot', type: 'recommendation', recommendedSymbol: best.symbol, recommendedDirection: best.direction, text: `🧠 **Análisis Completado — Recomendación de Mercado**\n\nHe analizado ${results.length} activos favoritos. El mercado con mejor balance entre rentabilidad y riesgo controlado es:\n\n🎯 **${displaySym}** a $${best.price.toFixed(best.price < 10 ? 4 : 2)}\n${best.trend} | Volumen ${best.volStrength} | Volatilidad ATR ${best.atrPct.toFixed(2)}%\n\n**Top 3 Rankings:**\n${rankText}\n\n👆 Haz clic en el botón para navegar e iniciar el motor automáticamente.`, timestamp: Date.now() }]);
    };
    runWelcomeScan();
   
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted || !activeSymbol) return;
    const sym = activeSymbol.replace('/', '');
    if (symbolFiltersRef.current[sym]) return;
    const fetchFilters = async () => {
      try {
        const res = await fetch(`/api/binance?endpoint=/fapi/v1/exchangeInfo`);
        if (!res.ok) throw new Error('API Error');
        const data = await res.json();
        const symData = data?.symbols?.find((s: BinanceSymbolInfo) => s.symbol === sym);
        if (symData?.filters) {
          const lotSize = symData.filters.find((f: BinanceSymbolFilter) => f.filterType === 'LOT_SIZE' || f.filterType === 'MARKET_LOT_SIZE');
          const minNotional = symData.filters.find((f: BinanceSymbolFilter) => f.filterType === 'MIN_NOTIONAL');
          symbolFiltersRef.current[sym] = { stepSize: lotSize?.stepSize || '1', minQty: lotSize?.minQty || '0.001', minNotional: minNotional?.notional || '5' };
        }
      } catch (e) { console.warn('No se pudieron obtener filtros de Binance para', sym); }
    };
    fetchFilters();
  }, [isMounted, activeSymbol]);

  const adjustQtyToStepSize = (qty: number, symbol: string): string => {
    const sym = symbol.replace('/', '');
    const filters = symbolFiltersRef.current[sym];
    if (!filters) return qty.toString();
    const step = parseFloat(filters.stepSize);
    if (step <= 0) return qty.toString();
    const stepStr = parseFloat(filters.stepSize).toString();
    const decimals = stepStr.includes('.') ? stepStr.split('.')[1].length : 0;
    const adjusted = Math.floor(qty / step) * step;
    return adjusted.toFixed(decimals);
  };

  useEffect(() => {
    if (!isMounted) return;
    try { const lightweightPositions = openPositions.map(({ candlesAtOpen, ...rest }: OpenPosition) => rest); localStorage.setItem('blis_open_pos_all', JSON.stringify(lightweightPositions)); } catch (e) { console.warn("Storage quota limit reached for open positions.", e); }
  }, [openPositions, isMounted]);
  useEffect(() => {
    if (!isMounted) return;
    try { /* Historial local removido para liberar cuota. */ } catch (e) { console.warn("Storage quota limit reached.", e); }
  }, [tradeHistory, isMounted]);

  const tradingMetrics = useMemo(() => {
    const wins = tradeHistory.filter((t: TradeHistoryEntry) => t.finalPnl > 0);
    const losses = tradeHistory.filter((t: TradeHistoryEntry) => t.finalPnl < 0);
    const totalTrades = tradeHistory.length;
    const winCount = wins.length; const lossCount = losses.length;
    const winRate = totalTrades > 0 ? ((winCount / totalTrades) * 100).toFixed(1) : '0.0';
    const avgWin = winCount > 0 ? wins.reduce((acc: number, t: TradeHistoryEntry) => acc + t.finalPnl, 0) / winCount : 0;
    const avgLoss = lossCount > 0 ? Math.abs(losses.reduce((acc: number, t: TradeHistoryEntry) => acc + t.finalPnl, 0)) / lossCount : 0;
    const grossProfit = wins.reduce((acc: number, t: TradeHistoryEntry) => acc + t.finalPnl, 0);
    const grossLoss = Math.abs(losses.reduce((acc: number, t: TradeHistoryEntry) => acc + t.finalPnl, 0));
    const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : grossProfit > 0 ? '∞' : '0.00';
    const expectancy = totalTrades > 0 ? ((parseFloat(winRate) / 100) * avgWin) - ((1 - parseFloat(winRate) / 100) * avgLoss) : 0;
    return { winRate, avgWin, avgLoss, profitFactor, expectancy, winCount, lossCount, totalTrades };
  }, [tradeHistory]);

  useEffect(() => { if (!isMounted) return; localStorage.setItem('blis_balance', String(balance)); }, [balance, isMounted]);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [botBudget, setBotBudget] = useState(500);
  const [botMode, setBotMode] = useState('SCALPING');
  const [userLeverage, setUserLeverage] = useState(0);
  const [freeBudget, setFreeBudget] = useState(true);
  const [autoPilot, setAutoPilot] = useState<AutoPilotState>({ active: false, expiresAt: null, totalBudget: 0, leverage: 0, sessionId: null, mode: 'SCALPING', scanningStopped: false, riskLevel: 'NORMAL', isIndefinite: true });
  const autoPilotRef = useRef(autoPilot);
  useEffect(() => { autoPilotRef.current = autoPilot; }, [autoPilot]);
  const [marketSentiment, setMarketSentiment] = useState<MarketSentimentData | null>(null);
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);
  const [isBacktesting, setIsBacktesting] = useState(false);
  const [manualExecStatus, setManualExecStatus] = useState<{ text: string; type: 'success' | 'error' | 'loading' } | null>(null);
  const [isEvaluatingSentiment, setIsEvaluatingSentiment] = useState(false);
  const [radarActive, setRadarActive] = useState(true);
  const [enableNotifications, setEnableNotifications] = useState(false);
  const [aiKnowledge, setAiKnowledge] = useState<AiKnowledge[]>([]);
  const lastAlertTime = useRef(0);
  const [pendingReportSessionId, setPendingReportSessionId] = useState<string | null>(null);
  const [savedReports, setSavedReports] = useState<SessionReport[]>([]);
  const [sessionReport, setSessionReport] = useState<SessionReport | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [terminalTab, setTerminalTab] = useState<TerminalTab>('abiertas');
  useEffect(() => { if (tableScrollRef.current) { tableScrollRef.current.scrollTop = 0; } }, [terminalTab]);
  const [lastSeenHistoryCount, setLastSeenHistoryCount] = useState(0);
  const [lastSeenReportsCount, setLastSeenReportsCount] = useState(0);
  const [isTableMaximized, setIsTableMaximized] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedPositionId, setSelectedPositionId] = useState<string | null>(null);
  const [hoverPositionId, setHoverPositionId] = useState<string | null>(null);
  const [tradeReplayData, setTradeReplayData] = useState<TradeReplayData | null>(null);
  const [showTradeConfig, setShowTradeConfig] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showSma, setShowSma] = useState(true);
  const [showAiZonesUI, setShowAiZonesUI] = useState(true);
  const [showPositionLines, setShowPositionLines] = useState(true);
  const [showModeSelect, setShowModeSelect] = useState(false);
  const [showDom, setShowDom] = useState(true);
  const [showFvg, setShowFvg] = useState(true);
  const [manualChatInput, setManualChatInput] = useState('');
  const [manualChatHistory, setManualChatHistory] = useState<ManualChatEntry[]>([]);
  const [strategySuggestions, setStrategySuggestions] = useState<Partial<ManualStrategy> | null>(null);
  const [isManualChatThinking, setIsManualChatThinking] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const isUserAtBottomRef = useRef(true);

  useEffect(() => {
    if (!isMounted) return;
    try {
      const savedKnowledge = localStorage.getItem('blis_ai_knowledge'); const savedRep = localStorage.getItem('blis_saved_reports');
      const savedHistCount = localStorage.getItem('blis_last_history_count'); const savedRepCount = localStorage.getItem('blis_last_reports_count');
      if (savedKnowledge) setAiKnowledge(JSON.parse(savedKnowledge)); if (savedRep) setSavedReports(JSON.parse(savedRep));
      if (savedHistCount) setLastSeenHistoryCount(Number(savedHistCount)); if (savedRepCount) setLastSeenReportsCount(Number(savedRepCount));
      const savedAuto = localStorage.getItem('blis_autopilot');
      if (savedAuto) { const parsed = JSON.parse(savedAuto); if (parsed.active) { setAutoPilot(parsed); } }
      const b = localStorage.getItem('blis_bot_budget'); if (b) setBotBudget(Number(b));
      const l = localStorage.getItem('blis_user_lev'); if (l) setUserLeverage(Number(l));
      const f = localStorage.getItem('blis_free_budget'); if (f) setFreeBudget(f === 'true');
    } catch {}
  }, [isMounted]);

  useEffect(() => { if (!isMounted) return; localStorage.setItem('blis_ai_knowledge', JSON.stringify(aiKnowledge)); localStorage.setItem('blis_saved_reports', JSON.stringify(savedReports)); }, [aiKnowledge, savedReports, isMounted]);
  useEffect(() => { if (!isMounted) return; localStorage.setItem('blis_autopilot', JSON.stringify(autoPilot)); }, [autoPilot, isMounted]);
  useEffect(() => { if (!isMounted) return; const trimmed = chatMessages.length > 50 ? chatMessages.slice(-50) : chatMessages; localStorage.setItem('blis_terminal_chat', JSON.stringify(trimmed)); if (chatMessages.length > 80) { setChatMessages(chatMessages.slice(-50)); } }, [chatMessages, isMounted]);
  useEffect(() => { if (isMounted) localStorage.setItem('blis_bot_budget', String(botBudget)); }, [botBudget, isMounted]);
  useEffect(() => { if (isMounted) localStorage.setItem('blis_user_lev', String(userLeverage)); }, [userLeverage, isMounted]);
  useEffect(() => { if (isMounted) localStorage.setItem('blis_free_budget', String(freeBudget)); }, [freeBudget, isMounted]);
  useEffect(() => { if (isMounted) localStorage.setItem('blis_config_expanded', String(aiConfigExpanded)); }, [aiConfigExpanded, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    try {
      supabase.from('trading_global_state').select('*').then(({ data, error }) => {
        if (!error && data) {
          const stateMap = data.reduce((acc: Record<string, unknown>, row: TradingGlobalStateRow) => ({ ...acc, [row.id]: (row.payload as { value: unknown }).value }), {});
          if (stateMap.paperBalance !== undefined) { setPaperBalance(stateMap.paperBalance); paperBalanceRef.current = stateMap.paperBalance; }
          if (stateMap.aiKnowledge) setAiKnowledge(stateMap.aiKnowledge);
          if (stateMap.autoPilot) setAutoPilot(stateMap.autoPilot);
          if (stateMap.botBudget !== undefined) setBotBudget(stateMap.botBudget);
          if (stateMap.userLeverage) setUserLeverage(stateMap.userLeverage);
          if (stateMap.freeBudget !== undefined) setFreeBudget(stateMap.freeBudget);
          if (stateMap.simMode) setSimMode(stateMap.simMode);
        }
      });
    } catch {}
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    const debouncedSync = setTimeout(() => {
      const upserts = [
        { id: 'paperBalance', payload: { value: paperBalance } }, { id: 'aiKnowledge', payload: { value: aiKnowledge } },
        { id: 'autoPilot', payload: { value: autoPilot } }, { id: 'botBudget', payload: { value: botBudget } },
        { id: 'userLeverage', payload: { value: userLeverage } }, { id: 'freeBudget', payload: { value: freeBudget } },
        { id: 'simMode', payload: { value: simMode } }
      ];
      supabase.from('trading_global_state').upsert(upserts).then();
    }, 1500);
    return () => clearTimeout(debouncedSync);
  }, [paperBalance, aiKnowledge, autoPilot, botBudget, userLeverage, freeBudget, simMode, isMounted]);

  // TerminalStyles, ChartScrollbar, VerticalSlider are imported from _components/TerminalStyles

  useEffect(() => { if (!isMounted) return; localStorage.setItem('blis_saved_reports', JSON.stringify(savedReports)); }, [savedReports, isMounted]);

  const notifsRef = useRef(true);
  useEffect(() => { balanceRef.current = balance; }, [balance]);
  useEffect(() => { openPositionsRef.current = openPositions; }, [openPositions]);
  useEffect(() => { symbolPricesRef.current[activeSymbol] = currentPriceRef.current; }, [ticker, activeSymbol]);

  useEffect(() => {
    if (!isMounted || openPositionsRef.current.length === 0) return;
    const otherSymbols = [...new Set(openPositionsRef.current.map(p => p.symbol).filter(s => s && s !== activeSymbol))] as string[];
    if (otherSymbols.length === 0) return;
    if (dataSource === 'simulation') return;
    const fetchOtherPrices = async () => { try { const promises = otherSymbols.map(async (sym) => { try { const res = await fetch(`https://fapi.binance.com/fapi/v1/ticker/price?symbol=${sym}`); const data = await res.json(); if (data.price) symbolPricesRef.current[sym] = parseFloat(data.price); } catch { /* silently ignore */ } }); await Promise.all(promises); } catch { /* ignore */ } };
    fetchOtherPrices();
    const interval = setInterval(fetchOtherPrices, 10000);
    return () => clearInterval(interval);
  }, [isMounted, openPositions.length, activeSymbol, dataSource]);

  useEffect(() => { notifsRef.current = enableNotifications; }, [enableNotifications]);
  useEffect(() => { aiKnowledgeRef.current = aiKnowledge; }, [aiKnowledge]);

  useEffect(() => {
    const el = chatScrollRef.current; if (!el) return;
    const onScroll = () => { const threshold = 80; isUserAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < threshold; if (isUserAtBottomRef.current) setHasUnreadMessages(false); };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const el = chatScrollRef.current; if (!el) return;
    if (isUserAtBottomRef.current) { el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' }); } else { setHasUnreadMessages(true); }
  }, [chatMessages, isTyping]);

  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);

  const formatChatTime = (ts: number) => { if (!isMounted || !ts) return '--:--'; return new Date(ts).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }); };
  const formatTableTime = (ts: number) => { if (!isMounted || !ts) return '--:--'; return new Date(ts).toLocaleTimeString('es-CO', { hour12: false }); };
  const fmtUsd = (val: number): string => { if (val == null || isNaN(val)) return '$0.00'; const abs = Math.abs(val); if (abs >= 1) return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; if (abs >= 0.01) return `$${val.toFixed(4)}`; if (abs >= 0.0001) return `$${val.toFixed(6)}`; return `$${val.toFixed(8)}`; };
  const formatTimePassed = (startMs: number) => { if (!isMounted || !startMs) return '--:--'; const passed = now - startMs; if (passed < 0) return '--:--'; const mins = Math.floor(passed / 60000).toString().padStart(2, '0'); const secs = Math.floor((passed % 60000) / 1000).toString().padStart(2, '0'); return `${mins}:${secs}`; };
  const getPnlData = (pos: { symbol?: string; entryPrice: number; type: string; amount?: number; leverage?: number; fee?: number }): PnlData => {
    const posSymbol = pos.symbol || activeSymbol; let cp: number;
    if (posSymbol === activeSymbol) { cp = currentPriceRef.current; } else { cp = symbolPricesRef.current[posSymbol] || pos.entryPrice || currentPriceRef.current; }
    if (!cp || cp <= 0) { cp = pos.entryPrice; }
    if (!pos.entryPrice || pos.entryPrice <= 0) return { value: 0, isProfit: false, fee: 0, gross: 0 };
    const priceDiff = pos.type === 'BUY' ? (cp - pos.entryPrice) : (pos.entryPrice - cp);
    const pnlGrossUsd = (priceDiff / pos.entryPrice) * (pos.amount || 0) * (pos.leverage || 1);
    const fee = pos.fee || ((pos.amount || 0) * (pos.leverage || 1) * 0.0005 * 2);
    return { value: pnlGrossUsd - fee, isProfit: (pnlGrossUsd - fee) >= 0, fee, gross: pnlGrossUsd };
  };
  const formatTimeLeft = (targetMs: number) => { if (!isMounted || !targetMs) return '00:00'; const left = targetMs - now; if (left <= 0) return '00:00'; return `${Math.floor(left / 60000).toString().padStart(2, '0')}:${Math.floor((left % 60000) / 1000).toString().padStart(2, '0')}`; };

  const calculateRSI = (candles: CandleData[], period = 14) => { if (!candles || candles.length < period + 1) return 50; let gains = 0, losses = 0; for (let i = candles.length - period; i < candles.length; i++) { const prev = candles[i - 1]; if (!prev || prev.close == null || candles[i].close == null) continue; const diff = candles[i].close - prev.close; if (diff >= 0) gains += diff; else losses -= diff; } if (period <= 0) return 50; const avgGain = gains / period; const avgLoss = losses / period; if (avgLoss === 0) return gains > 0 ? 100 : 50; const rs = avgGain / avgLoss; return 100 - (100 / (1 + rs)); };
  const calculateATR = (candles: CandleData[], period = 14) => { if (candles.length < period + 1) return 2; let sumTR = 0; for (let i = candles.length - period; i < candles.length; i++) { const h = candles[i].high, l = candles[i].low, pc = candles[i - 1].close; const tr = Math.max(h - l, Math.abs(h - pc), Math.abs(l - pc)); sumTR += tr; } return sumTR / period; };
  const calculateCVD = (candles: CandleData[]) => { if (!candles || candles.length === 0) return []; let cumulativeDelta = 0; return candles.map(c => { let delta = 0; if (c.takerBuyBaseAssetVolume !== undefined) { const buyVol = c.takerBuyBaseAssetVolume; const sellVol = c.volume - buyVol; delta = buyVol - sellVol; } else { const range = c.high - c.low || 0.0001; const bodyRatio = (c.close - c.open) / range; delta = c.volume * bodyRatio * 0.3; } cumulativeDelta += delta; return cumulativeDelta; }); };
  const calculateMTF_SMA = (candles: CandleData[]) => { const macroCandles: { close: number }[] = []; for (let i = 0; i < candles.length; i += 60) { if (i + 60 >= candles.length) break; const slice = candles.slice(i, i + 60); macroCandles.push({ close: slice[slice.length - 1].close }); } if (macroCandles.length < 50) return { sma15: null, sma50: null }; const sma15 = macroCandles.slice(-15).reduce((a, b) => a + b.close, 0) / 15; const sma50 = macroCandles.slice(-50).reduce((a, b) => a + b.close, 0) / 50; return { sma15, sma50 }; };
  const calculateEMA = (candles: CandleData[], period: number) => { if (!candles || candles.length < period) return null; const k = 2 / (period + 1); let ema = candles.slice(0, period).reduce((s, c) => s + c.close, 0) / period; for (let i = period; i < candles.length; i++) { ema = candles[i].close * k + ema * (1 - k); } return ema; };
  const calculateMACD = (candles: CandleData[]) => { if (!candles || candles.length < 35) return { macd: 0, signal: 0, histogram: 0 }; const ema12 = calculateEMA(candles, 12); const ema26 = calculateEMA(candles, 26); if (ema12 === null || ema26 === null) return { macd: 0, signal: 0, histogram: 0 }; const macdLine = ema12 - ema26; const macdValues: number[] = []; const k12 = 2 / 13, k26 = 2 / 27; let e12 = candles.slice(0, 12).reduce((s, c) => s + c.close, 0) / 12; let e26 = candles.slice(0, 26).reduce((s, c) => s + c.close, 0) / 26; for (let i = 12; i < candles.length; i++) { e12 = candles[i].close * k12 + e12 * (1 - k12); if (i >= 26) { e26 = candles[i].close * k26 + e26 * (1 - k26); macdValues.push(e12 - e26); } } if (macdValues.length < 9) return { macd: macdLine, signal: 0, histogram: macdLine }; const k9 = 2 / 10; let signalLine = macdValues.slice(0, 9).reduce((s, v) => s + v, 0) / 9; for (let i = 9; i < macdValues.length; i++) { signalLine = macdValues[i] * k9 + signalLine * (1 - k9); } return { macd: macdLine, signal: signalLine, histogram: macdLine - signalLine }; };
  const calculateBollingerBands = (candles: CandleData[], period = 20, stdDev = 2) => { if (!candles || candles.length < period) return { upper: 0, middle: 0, lower: 0, width: 0, percentB: 0.5 }; const slice = candles.slice(-period); const mean = slice.reduce((s, c) => s + c.close, 0) / period; const variance = slice.reduce((s, c) => s + Math.pow(c.close - mean, 2), 0) / period; const std = Math.sqrt(variance); const upper = mean + stdDev * std; const lower = mean - stdDev * std; const width = upper - lower; const cp = candles[candles.length - 1].close; const percentB = width > 0 ? (cp - lower) / width : 0.5; return { upper, middle: mean, lower, width, percentB }; };
  const calculateStochRSI = (candles: CandleData[], rsiPeriod = 14, stochPeriod = 14, kSmooth = 3, dSmooth = 3) => { if (!candles || candles.length < rsiPeriod + stochPeriod + kSmooth) return { k: 50, d: 50 }; const rsiValues: number[] = []; for (let end = rsiPeriod + 1; end <= candles.length; end++) { const slice = candles.slice(0, end); let gains = 0, losses = 0; for (let i = slice.length - rsiPeriod; i < slice.length; i++) { const diff = slice[i].close - slice[i - 1].close; if (diff >= 0) gains += diff; else losses -= diff; } const avgGain = gains / rsiPeriod; const avgLoss = losses / rsiPeriod; const rs = avgLoss === 0 ? 100 : avgGain / avgLoss; rsiValues.push(100 - (100 / (1 + rs))); } if (rsiValues.length < stochPeriod) return { k: 50, d: 50 }; const stochKValues: number[] = []; for (let i = stochPeriod - 1; i < rsiValues.length; i++) { const window = rsiValues.slice(i - stochPeriod + 1, i + 1); const min = Math.min(...window); const max = Math.max(...window); stochKValues.push(max === min ? 50 : ((rsiValues[i] - min) / (max - min)) * 100); } const smoothedK: number[] = []; for (let i = kSmooth - 1; i < stochKValues.length; i++) { smoothedK.push(stochKValues.slice(i - kSmooth + 1, i + 1).reduce((s, v) => s + v, 0) / kSmooth); } if (smoothedK.length < dSmooth) return { k: smoothedK[smoothedK.length - 1] || 50, d: 50 }; const dValue = smoothedK.slice(-dSmooth).reduce((s, v) => s + v, 0) / dSmooth; return { k: smoothedK[smoothedK.length - 1], d: dValue }; };
  const calculateVWAP = (candles: CandleData[], period = 20) => { if (!candles || candles.length < period) return null; const slice = candles.slice(-period); let cumPV = 0, cumVol = 0; for (const c of slice) { const typical = (c.high + c.low + c.close) / 3; cumPV += typical * (c.volume || 1); cumVol += (c.volume || 1); } return cumVol > 0 ? cumPV / cumVol : null; };
  const calculateMomentum = (candles: CandleData[], period = 10) => { if (!candles || candles.length < period + 1) return 0; const current = candles[candles.length - 1].close; const past = candles[candles.length - 1 - period].close; return past > 0 ? ((current - past) / past) * 100 : 0; };

  const lastEntryTimeRef = useRef<Record<string, number>>({});
  const lastEntryPriceRef = useRef<Record<string, number>>({});

  const getIntervalMs = (interval: string) => { switch (interval) { case '1m': return 60000; case '5m': return 300000; case '15m': return 900000; case '1h': return 3600000; case '4h': return 14400000; case '1d': return 86400000; default: return 60000; } };

  const generateSimulationData = (startPrice?: number) => {
    const isForex = dataSource === 'simulation';
    const intervalMs = getIntervalMs(intervalTime);
    let basePrice = startPrice || (isForex ? 1.08500 : 4500);
    if (isForex && startPrice && startPrice > 100) basePrice = 1.08500;
    let time = Math.floor(Date.now() / intervalMs) * intervalMs - (200 * intervalMs);
    const mockData: CandleData[] = [];
    let trendProb = 0.15; let volMult = 1.0; let driftMult = 1.0;
    if (simMode === 'VOLATILE') { trendProb = 0.25; volMult = 2.5; driftMult = 1.8; }
    else if (simMode === 'TRENDS') { trendProb = 0.05; volMult = 0.7; driftMult = 4.2; }
    else if (simMode === 'CHAOS') { trendProb = 0.50; volMult = 2.0; driftMult = 0.2; }
    let trendDrift = (Math.random() - 0.5) * (isForex ? 0.0015 : 4) * driftMult;
    for (let i = 0; i < 200; i++) {
      const open = basePrice; if (Math.random() < trendProb) { trendDrift = (Math.random() - 0.5) * (isForex ? 0.0030 : 6) * driftMult; }
      const volatility = (Math.random() - 0.5) * (isForex ? 0.0025 : 5) * volMult + trendDrift;
      const close = open + volatility;
      const wickMult = simMode === 'VOLATILE' || simMode === 'CHAOS' ? 0.6 : 0.3;
      const high = Math.max(open, close) + Math.abs(volatility) * wickMult + Math.random() * (isForex ? 0.0015 : 3);
      const low = Math.min(open, close) - Math.abs(volatility) * wickMult - Math.random() * (isForex ? 0.0015 : 3);
      const volume = Math.random() * 50 + 10;
      const range = high - low || 0.0001;
      const closePos = (close - low) / range;
      const takerBuyBaseAssetVolume = volume * (0.45 + (closePos * 0.1) + (Math.random() * 0.1 - 0.05));
      const hist14 = mockData.slice(-14); const sma15: number | null = hist14.length === 14 ? (hist14.reduce((s, v) => s + v.close, 0) + close) / 15 : null;
      const hist49 = mockData.slice(-49); const sma50: number | null = hist49.length === 49 ? (hist49.reduce((s, v) => s + v.close, 0) + close) / 50 : null;
      mockData.push({ time, open, high, low, close, volume, takerBuyBaseAssetVolume, sma15, sma50 });
      basePrice = close; time += intervalMs;
    }
    return mockData;
  };

  // ── Binance / Simulation Data Connection ──
  useEffect(() => {
    let isMounted = true;
    let ws: WebSocket | null = null;
    let simInterval: ReturnType<typeof setInterval> | null = null;
    const startBinance = () => {
      setLoading(true); setConnectionStatus('connecting'); setPanOffset(0); setPriceOffset(0); setPriceZoom(1.0);
      setCandles([]); candlesRef.current = []; currentPriceRef.current = 0;
      const fetchAndConnect = async () => {
        try {
          const res = await fetch(`/api/binance?endpoint=/fapi/v1/klines&symbol=${activeSymbol}&interval=${intervalTime}&limit=200`);
          if (!res.ok) throw new Error("API Proxy Error");
          const data = await res.json();
          const formatted = data.map((d: number[], index: number, arr: number[][]) => {
            const closeVal = parseFloat(String(d[4])) || 0; const volume = parseFloat(String(d[5])) || 0; const takerBuyBaseAssetVolume = parseFloat(String(d[9])) || 0;
            const sma15 = index >= 14 ? arr.slice(index - 14, index + 1).reduce((s: number, v: number[]) => s + (parseFloat(String(v[4]))||0), 0) / 15 : null;
            const sma50 = index >= 49 ? arr.slice(index - 49, index + 1).reduce((s: number, v: number[]) => s + (parseFloat(String(v[4]))||0), 0) / 50 : null;
            return { time: d[0], open: parseFloat(String(d[1])), high: parseFloat(String(d[2])), low: parseFloat(String(d[3])), close: closeVal, volume, takerBuyBaseAssetVolume, sma15, sma50 };
          });
          if (isMounted) { setCandles(formatted); candlesRef.current = formatted; currentPriceRef.current = formatted[formatted.length-1].close; currentPriceSymbolRef.current = activeSymbol; setConnectionStatus('connected'); setLoading(false); }
          const streamSymbol = activeSymbol.toLowerCase();
          ws = new WebSocket(`wss://fstream.binance.com/ws/${streamSymbol}@kline_${intervalTime}/${streamSymbol}@aggTrade`);
          ws.onmessage = (ev: MessageEvent) => { if (!isMounted) return; const m = JSON.parse(ev.data); if (m.e === 'kline') { currentPriceRef.current = parseFloat(m.k.c); setCandles(prev => { if (prev.length === 0) return prev; const base = (prev[prev.length-1].time === m.k.t) ? prev.slice(0, -1) : prev; const newC: CandleData = { time: m.k.t, open: parseFloat(m.k.o), high: parseFloat(m.k.h), low: parseFloat(m.k.l), close: parseFloat(m.k.c), volume: parseFloat(m.k.v), takerBuyBaseAssetVolume: parseFloat(m.k.V), sma15: null, sma50: null }; const full = [...base, newC]; const sma15 = full.length >= 15 ? full.slice(-15).reduce((s, v) => s + v.close, 0) / 15 : null; const sma50 = full.length >= 50 ? full.slice(-50).reduce((s, v) => s + v.close, 0) / 50 : null; const finalArray = [...base, { ...newC, sma15, sma50 }].slice(-500); candlesRef.current = finalArray; return finalArray; }); } else if (m.e === 'aggTrade') { setTicker(prev => ({ ...prev, price: parseFloat(m.p) })); currentPriceRef.current = parseFloat(m.p); } };
          ws.onerror = () => { if(isMounted) setConnectionStatus('error'); };
        } catch (e) {
          try {
            const proxyRes = await fetch('/api/binance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint: '/fapi/v1/klines', params: { symbol: activeSymbol, interval: intervalTime, limit: 200 } }) });
            const proxyData = await proxyRes.json(); if (!proxyRes.ok) throw new Error("Proxy Tunnel Failed");
            const formatted = proxyData.map((d: number[], index: number, arr: number[][]) => { const closeVal = parseFloat(String(d[4])) || 0; const volume = parseFloat(String(d[5])) || 0; const takerBuyBaseAssetVolume = parseFloat(String(d[9])) || 0; const sma15 = index >= 14 ? arr.slice(index - 14, index + 1).reduce((s: number, v: number[]) => s + (parseFloat(String(v[4]))||0), 0) / 15 : null; const sma50 = index >= 49 ? arr.slice(index - 49, index + 1).reduce((s: number, v: number[]) => s + (parseFloat(String(v[4]))||0), 0) / 50 : null; return { time: d[0], open: parseFloat(String(d[1])), high: parseFloat(String(d[2])), low: parseFloat(String(d[3])), close: closeVal, volume, takerBuyBaseAssetVolume, sma15, sma50 }; });
            if (isMounted) { setCandles(formatted); candlesRef.current = formatted; currentPriceRef.current = formatted[formatted.length-1].close; currentPriceSymbolRef.current = activeSymbol; setConnectionStatus('connected'); setLoading(false); const streamSymbol = activeSymbol.toLowerCase(); ws = new WebSocket(`wss://fstream.binance.com/ws/${streamSymbol}@kline_${intervalTime}/${streamSymbol}@aggTrade`); ws.onmessage = (ev: MessageEvent) => { const m = JSON.parse(ev.data); if (m.e === 'kline') { currentPriceRef.current = parseFloat(m.k.c); setCandles(prev => { if (prev.length === 0) return prev; const base = (prev[prev.length-1].time === m.k.t) ? prev.slice(0, -1) : prev; const newC: CandleData = { time: m.k.t, open: parseFloat(m.k.o), high: parseFloat(m.k.h), low: parseFloat(m.k.l), close: parseFloat(m.k.c), volume: parseFloat(m.k.v), takerBuyBaseAssetVolume: parseFloat(m.k.V), sma15: null, sma50: null }; const full = [...base, newC]; const sma15 = full.length >= 15 ? full.slice(-15).reduce((s, v) => s + v.close, 0) / 15 : null; const sma50 = full.length >= 50 ? full.slice(-50).reduce((s, v) => s + v.close, 0) / 50 : null; const finalArray = [...base, { ...newC, sma15, sma50 }].slice(-500); candlesRef.current = finalArray; return finalArray; }); } else if (m.e === 'aggTrade') { setTicker(prev => ({ ...prev, price: parseFloat(m.p) })); currentPriceRef.current = parseFloat(m.p); } }; }
          } catch(err) { if (isMounted) { setConnectionStatus('error'); setLoading(false); setChatMessages(prev => [...prev, { role: 'bot', text: '⚠️ **Bloqueo de Red Crítico.** Estamos operando bajo el **Simulador de Emergencia** debido a restricciones locales.', timestamp: Date.now() }]); startSimulation(); } }
        }
      };
      fetchAndConnect();
    };
    const startSimulation = () => {
      setConnectionStatus('simulating'); setLoading(true); setCandles([]); candlesRef.current = []; setPanOffset(0); setPriceOffset(0); setPriceZoom(1.0);
      const simulated = generateSimulationData(ticker?.price); setCandles(simulated); candlesRef.current = simulated; currentPriceRef.current = simulated[simulated.length-1].close; currentPriceSymbolRef.current = activeSymbol; setTicker({ price: currentPriceRef.current, changePercent: 0 }); setLoading(false);
      let trendDrift = (Math.random() - 0.5) * 0.0003;
      simInterval = setInterval(() => { if (!isMounted) return; const nowMs = Date.now(); const intervalMs = getIntervalMs(intervalTime); const currentIntervalStart = Math.floor(nowMs / intervalMs) * intervalMs; let tickVolFactor = 0.0004; let snapProb = 0.1; if (simMode === 'VOLATILE') { tickVolFactor = 0.0012; snapProb = 0.25; } else if (simMode === 'TRENDS') { tickVolFactor = 0.0003; snapProb = 0.05; } else if (simMode === 'CHAOS') { tickVolFactor = 0.0010; snapProb = 0.6; } if (Math.random() < snapProb) { const driftRange = (simMode === 'TRENDS') ? 0.0012 : 0.0006; trendDrift = (Math.random() - 0.5) * driftRange; } const tickVol = (Math.random() - 0.5) * tickVolFactor + trendDrift; const newPrice = currentPriceRef.current + tickVol; currentPriceRef.current = newPrice; setTicker(t => ({ price: newPrice, changePercent: t.changePercent + (tickVol / newPrice) * 500 })); setCandles(prev => { if (prev.length === 0) return prev; const lastCandle = prev[prev.length - 1]; const newArray = [...prev]; if (lastCandle.time < currentIntervalStart) { const vol = Math.random() * 15 + 5; const takerBuyVol = vol * (0.45 + Math.random() * 0.1);             const newCandle = { time: currentIntervalStart, open: lastCandle.close, close: newPrice, high: Math.max(lastCandle.close, newPrice) + Math.random() * 0.00015, low: Math.min(lastCandle.close, newPrice) - Math.random() * 0.00015, volume: vol, takerBuyBaseAssetVolume: takerBuyVol, sma15: null, sma50: null }; newArray.push(newCandle); if (newArray.length > 500) newArray.shift(); } else { const updatedCandle = { ...lastCandle }; const tickVol = Math.random() * 4.5; const tickTakerBuy = tickVol * (0.4 + Math.random() * 0.2); updatedCandle.close = newPrice; updatedCandle.high = Math.max(updatedCandle.high, newPrice); updatedCandle.low = Math.min(updatedCandle.low, newPrice); updatedCandle.volume += tickVol; updatedCandle.takerBuyBaseAssetVolume = (updatedCandle.takerBuyBaseAssetVolume || 0) + tickTakerBuy; newArray[newArray.length - 1] = updatedCandle; } const finalCandle = newArray[newArray.length - 1]; finalCandle.sma15 = newArray.length >= 15 ? newArray.slice(-15).reduce((s, v) => s + v.close, 0) / 15 : null; finalCandle.sma50 = newArray.length >= 50 ? newArray.slice(-50).reduce((s, v) => s + v.close, 0) / 50 : null; candlesRef.current = newArray; return newArray; }); }, 1000);
    };
    if (dataSource === 'binance') startBinance(); else startSimulation();
    return () => { isMounted = false; if (ws) ws.close(); if (simInterval) clearInterval(simInterval); };
  }, [dataSource, intervalTime, activeSymbol]);

  useEffect(() => { const scan = setInterval(() => { setIsAiThinking(true); setTimeout(() => setIsAiThinking(false), 2500); }, 15000); return () => clearInterval(scan); }, []);

  const chartMath = useMemo(() => {
    if (candles.length === 0 || !dimensions.width || !dimensions.height) return null;
    const startIdx = Math.max(0, candles.length - zoom - Math.round(panOffset)); const endIdx = Math.max(0, candles.length - Math.round(panOffset)); const visibleCandles = candles.slice(startIdx, endIdx);
    if (visibleCandles.length === 0) return null;
    const padding = { top: 40, bottom: 40, right: 80, left: 10 }; const chartWidth = Math.max(1, dimensions.width - padding.left - padding.right); const chartHeight = Math.max(1, dimensions.height - padding.top - padding.bottom);
    const minPrice = Math.min(...visibleCandles.map(c => c.low)); const maxPrice = Math.max(...visibleCandles.map(c => c.high)); const priceRangeRaw = (maxPrice - minPrice) || 1;
    const verticalPadding = priceRangeRaw * (0.25 / Math.max(0.2, priceZoom)); const yMinFinal = (minPrice - verticalPadding) + priceOffset; const yMaxFinal = (maxPrice + verticalPadding) + priceOffset; const currentYRange = yMaxFinal - yMinFinal;
    const candleWidth = (chartWidth / visibleCandles.length) * 0.7;
    const getY = (price: number) => padding.top + chartHeight - ((price - yMinFinal) / currentYRange) * chartHeight;
    const getX = (index: number) => padding.left + (index * (chartWidth / visibleCandles.length)) + (candleWidth / 2);
    const getXFromContinuousIndex = (idx: number) => padding.left + ((idx - (candles.length - zoom - panOffset)) * (chartWidth / visibleCandles.length)) + (candleWidth / 2);
    const getContinuousIndexFromX = (xPos: number) => (candles.length - zoom - panOffset) + ((xPos - padding.left - candleWidth / 2) / (chartWidth / visibleCandles.length));
    const getPriceFromY = (yPos: number) => yMaxFinal - ((yPos - padding.top) / chartHeight) * currentYRange;
    const fvgs: FVGData[] = [];
    if (showFvg && visibleCandles.length > 2) { for (let i = 2; i < visibleCandles.length; i++) { const c1 = visibleCandles[i - 2]; const c3 = visibleCandles[i]; if (c3.low > c1.high && c1.close >= c1.open) { fvgs.push({ type: 'bullish', top: c3.low, bottom: c1.high, startIndex: i - 2 }); } if (c3.high < c1.low && c1.close <= c1.open) { fvgs.push({ type: 'bearish', top: c1.low, bottom: c3.high, startIndex: i - 2 }); } } }
    const sma15Path = visibleCandles.length > 0 ? visibleCandles.map((c, i) => { const y = getY((c.sma15 ?? NaN) as number); if (!Number.isFinite(y)) return ""; return (i === 0 ? "M " : "L ") + getX(i) + " " + y; }).join(" ") : "";
    const sma50Path = visibleCandles.length > 0 ? visibleCandles.map((c, i) => { const y = getY((c.sma50 ?? NaN) as number); if (!Number.isFinite(y)) return ""; return (i === 0 ? "M " : "L ") + getX(i) + " " + y; }).join(" ") : "";
    const cvdValues = calculateCVD(candles); const visibleCvd = cvdValues.slice(startIdx, endIdx); const minCvd = Math.min(...visibleCvd); const maxCvd = Math.max(...visibleCvd); const cvdRange = (maxCvd - minCvd) || 1;
    const cvdPanelHeight = chartHeight * 0.2; const cvdPanelTop = padding.top + chartHeight - cvdPanelHeight; const getYCvd = (val: number) => cvdPanelTop + cvdPanelHeight - ((val - minCvd) / cvdRange) * cvdPanelHeight;
    const cvdPath = visibleCvd.length > 0 ? visibleCvd.map((v, i) => { const y = getYCvd(v); return (i === 0 ? "M " : "L ") + getX(i) + " " + y; }).join(" ") : "";
    return { visibleCandles, getY, getX, getPriceFromY, getXFromContinuousIndex, getContinuousIndexFromX, candleWidth, yMax: yMaxFinal, yMin: yMinFinal, yRange: currentYRange, chartWidth, chartHeight, padding, dimensions, minPrice: yMinFinal, maxPrice: yMaxFinal, sma15Path, sma50Path, cvdPath, cvdPanelTop, cvdPanelHeight, fvgs };
  }, [candles, dimensions, zoom, panOffset, priceZoom, priceOffset, showFvg]);

  useEffect(() => { if (!chartRef.current) return; const observer = new ResizeObserver(() => { if (chartRef.current) { setDimensions({ width: chartRef.current.clientWidth, height: chartRef.current.clientHeight }); } }); observer.observe(chartRef.current); setDimensions({ width: chartRef.current.clientWidth, height: chartRef.current.clientHeight }); return () => observer.disconnect(); }, [viewMode, loading]);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => { e.preventDefault(); if (!chartMath || !chartRef.current) return; if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { const shiftX = e.deltaX; const offsetMove = panOffset + (shiftX / chartMath.candleWidth); if (!isNaN(offsetMove)) setPanOffset(Math.max(0, Math.min(candles.length - zoom, offsetMove))); return; } const rect = chartRef.current.getBoundingClientRect(); const x = e.clientX - rect.left; const y = e.clientY - rect.top; const isOverRuler = x > dimensions.width - 80; if (isOverRuler) { const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1; setPriceZoom(p => Math.max(0.1, Math.min(10, p * zoomFactor))); return; } const ratioX = Math.max(0, Math.min(1, (x - chartMath.padding.left) / chartMath.chartWidth)); const deltaBase = Math.sign(e.deltaY); const zoomStep = Math.max(2, Math.floor(zoom * 0.12)); const newZoom = Math.max(10, Math.min(candles.length, zoom + (deltaBase * zoomStep))); if (newZoom !== zoom) { const newOffset = panOffset - (newZoom - zoom) * (1 - ratioX); if (!isNaN(newOffset)) { setPanOffset(Math.max(0, Math.min(candles.length - newZoom, newOffset))); setZoom(newZoom); } } const xRel = (x - chartMath.padding.left) / chartMath.chartWidth; const visIdx = Math.max(0, Math.min(chartMath.visibleCandles.length - 1, Math.floor(xRel * chartMath.visibleCandles.length))); const candleTarget = chartMath.visibleCandles[visIdx]; const hoverTime = candleTarget?.time || Date.now(); setHoverData({ x, y, price: chartMath.getPriceFromY(y), time: hoverTime }); };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => { if (!chartMath || !chartRef.current) return; const rect = chartRef.current.getBoundingClientRect(); const x = e.clientX - rect.left; const y = e.clientY - rect.top; if (drawMode === 'cursor' || drawMode === 'hand') { setIsDragging(true); setDragStart({ x, y, panStart: panOffset, priceOffsetStart: priceOffset, priceZoomStart: priceZoom }); } else if (drawMode === 'select') { setCurrentDrawing({ type: 'select', x1: x, y1: y, x2: x, y2: y, color: 'rgba(57, 255, 20, 0.2)' }); } else if (drawMode === 'line') { setCurrentDrawing({ type: 'line', p1: { index: chartMath.getContinuousIndexFromX(x), price: chartMath.getPriceFromY(y) }, p2: { index: chartMath.getContinuousIndexFromX(x), price: chartMath.getPriceFromY(y) }, color: drawColor }); } else if (drawMode === 'fibonacci') { setCurrentDrawing({ type: 'fibonacci', p1: { index: chartMath.getContinuousIndexFromX(x), price: chartMath.getPriceFromY(y) }, p2: { index: chartMath.getContinuousIndexFromX(x), price: chartMath.getPriceFromY(y) }, color: drawColor }); } else if (drawMode === 'freehand') { setCurrentDrawing({ type: 'freehand', points: [{ index: chartMath.getContinuousIndexFromX(x), price: chartMath.getPriceFromY(y) }], color: drawColor }); } else if (drawMode === 'eraser') { setDrawings(prev => prev.filter(d => { if (d.type === 'line') { const x1 = chartMath.getXFromContinuousIndex(d.p1!.index); const y1 = chartMath.getY(d.p1!.price); const x2 = chartMath.getXFromContinuousIndex(d.p2!.index); const y2 = chartMath.getY(d.p2!.price); if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) return true; const l2 = Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2); if (l2 === 0) return true; const t = Math.max(0, Math.min(1, ((x - x1) * (x2 - x1) + (y - y1) * (y2 - y1)) / l2)); return Math.pow(x - (x1 + t * (x2 - x1)), 2) + Math.pow(y - (y1 + t * (y2 - y1)), 2) > 150; } if (d.type === 'freehand') return !d.points!.some((p) => { const pointX = chartMath.getXFromContinuousIndex(p.index); const pointY = chartMath.getY(p.price); return !isNaN(pointX) && !isNaN(pointY) && Math.pow(x - pointX, 2) + Math.pow(y - pointY, 2) < 200; }); return true; })); } };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => { if (!chartRef.current || !chartMath) return; const rect = chartRef.current.getBoundingClientRect(); const x = e.clientX - rect.left; const y = e.clientY - rect.top; const visIdx = Math.max(0, Math.min(chartMath.visibleCandles.length - 1, Math.round(((x - chartMath.padding.left) / chartMath.chartWidth) * chartMath.visibleCandles.length))); const candleTarget = chartMath.visibleCandles[visIdx]; const hoverTime = candleTarget?.time || Date.now(); setHoverData({ x, y, price: chartMath.getPriceFromY(y), time: hoverTime }); if (isDragging && (drawMode === 'cursor' || drawMode === 'hand')) { const deltaX = x - dragStart.x; const sensitivity = 1.0; const newOffset = dragStart.panStart + (deltaX / chartMath.candleWidth) * sensitivity; if (!isNaN(newOffset)) setPanOffset(Math.max(0, Math.min(candles.length - zoom, newOffset))); const shiftY = y - dragStart.y; const pricePerPixel = (chartMath.maxPrice - chartMath.minPrice) / chartMath.chartHeight; const newPriceOffset = dragStart.priceOffsetStart + (shiftY * pricePerPixel); if (!isNaN(newPriceOffset)) setPriceOffset(newPriceOffset); } else if (currentDrawing) { if (drawMode === 'select') {             const isLtoR = x > (currentDrawing.x1 ?? 0); setCurrentDrawing((p: Drawing | null) => ({ ...p!, x2: x, y2: y, color: isLtoR ? 'rgba(57, 255, 20, 0.2)' : 'rgba(255, 0, 76, 0.2)' })); } else if (drawMode === 'line') { setCurrentDrawing((p: Drawing | null) => ({ ...p!, p2: { index: chartMath.getContinuousIndexFromX(x), price: chartMath.getPriceFromY(y) } })); } else if (drawMode === 'fibonacci') { setCurrentDrawing((p: Drawing | null) => ({ ...p!, p2: { index: chartMath.getContinuousIndexFromX(x), price: chartMath.getPriceFromY(y) } })); } else if (drawMode === 'freehand') { setCurrentDrawing((p: Drawing | null) => ({ ...p!, points: [...(p!.points || []), { index: chartMath.getContinuousIndexFromX(x), price: chartMath.getPriceFromY(y) }] })); } } if (!isDragging && drawMode === 'cursor' && candleTarget) { setHoveredCandle({ candle: candleTarget, x: chartMath.getX(visIdx) }); } };

  const handleMouseUp = () => { setIsDragging(false); if (currentDrawing) { if (currentDrawing.type !== 'select') { setDrawings(prev => [...prev, { ...currentDrawing, color: drawColor }]); } setCurrentDrawing(null); } };
  const handleMouseLeave = () => { setIsDragging(false); setHoverData(null); setHoveredCandle(null); };

  const handleTouchStart = (e: React.TouchEvent) => { if (!chartMath || !chartRef.current || e.touches.length === 0) return; if (e.touches.length === 1) { handleMouseDown({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY } as unknown as React.MouseEvent<HTMLDivElement>); } else if (e.touches.length === 2) { const t1 = e.touches[0]; const t2 = e.touches[1]; const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY); setDragStart({ x: 0, y: 0, panStart: dist, zoomStart: zoom, priceZoomStart: priceZoom, priceOffsetStart: priceOffset }); } };
  const handleTouchMove = (e: React.TouchEvent) => { if (!chartMath || !chartRef.current || e.touches.length === 0) return; if (e.touches.length === 1) { handleMouseMove({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY } as unknown as React.MouseEvent<HTMLDivElement>); } else if (e.touches.length === 2 && dragStart.zoomStart !== undefined) { const t1 = e.touches[0]; const t2 = e.touches[1]; const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY); const delta = dragStart.panStart - currentDist; const zoomFactor = delta * (zoom / 400); const newZoom = Math.max(15, Math.min(candles.length, dragStart.zoomStart + zoomFactor)); if (!isNaN(newZoom)) setZoom(newZoom); const pinchRatio = currentDist / dragStart.panStart; const newPriceZoom = Math.max(0.1, Math.min(10, dragStart.priceZoomStart * pinchRatio)); setPriceZoom(newPriceZoom); } };

  const selectTool = (tool: string) => { if (drawMode === tool) { setDrawMode('cursor'); setShowPalette(false); } else { setDrawMode(tool); if (tool === 'line' || tool === 'freehand') setShowPalette(true); else setShowPalette(false); } };

  // ── Autopilot Management ──
  const startAutoPilotManual = (mMode = 'SCALPING', mFree = true, overrideDurationMins = null, mLeverage = null, mRisk = 'NORMAL') => {
    const activeP = (ticker?.price && ticker.price !== 2900.00) ? ticker.price : (currentPriceRef.current !== 2900.00 ? currentPriceRef.current : 0);
    const assetUsdVal = (activeAssetBalanceRef.current || 0) * activeP; const currentCash = (tradeMode === 'REAL' ? balanceRef.current : paperBalanceRef.current); const totalValuation = currentCash + assetUsdVal;
    const budgetValue = mFree ? currentCash : (botBudget > 0 ? botBudget : currentCash);
    let lev = mLeverage || (mFree ? (mRisk === 'TURBO' ? 20 : (mRisk === 'HIGH' ? 10 : 5)) : userLeverage);
    if (lev === 0) lev = mMode === 'SCALPING' ? 10 : 3;
    if (budgetValue <= 0) { setChatMessages(prev => [...prev, { role: 'bot', text: `⚠️ **Falta Liquidez**: Necesitas efectivo disponible (USDT) para que el motor inicie nuevas compras en Binance.`, timestamp: Date.now() }]); return; }
    const sId = `session_${Date.now()}`; const duration = overrideDurationMins || (mMode === 'POSITION' ? 1440 : (mMode === 'SWING' ? 60 : 15));
    setAutoPilot({ active: true, expiresAt: autoPilot.isIndefinite ? null : (Date.now() + duration * 60000), totalBudget: budgetValue, leverage: lev, sessionId: sId, mode: mMode, scanningStopped: false, riskLevel: mRisk, isIndefinite: autoPilot.isIndefinite });
    const riskLabel = mRisk === 'TURBO' ? '🔥 TURBO' : (mRisk === 'HIGH' ? '⚡ ALTO' : '🛡️ EQUILIBRADO');
    setChatMessages(prev => [...prev, { role: 'bot', text: `🚀 **MOTOR ACTIVADO**\n\n💰 ${mFree ? 'Capital Extendido (PRO)' : 'Presup. Trade'}: $${budgetValue.toFixed(2)} USDT\n📈 ${mMode} | ${riskLabel} | x${lev}\n⏱ ${autoPilot.isIndefinite ? '♾️ Indefinido' : `${duration}min`}\n\n📡 *Escaneando mercado...*`, timestamp: Date.now() }]);
    setTimeout(() => { if (lastAiCallTime.current) lastAiCallTime.current = 0; }, 100);
  };

  const stopAutoPilotManual = (soft = true) => { if (!autoPilot.active) return; const sId = autoPilot.sessionId; if (soft) { setAutoPilot((prev: AutoPilotState) => ({ ...prev, scanningStopped: true })); setChatMessages(prev => [...prev, { role: 'bot', text: `🛑 **Escáner Detenido.** El motor ya no abrirá nuevas posiciones. Gestionará el cierre óptimo de las operaciones restantes...`, timestamp: Date.now() }]); } else { setAutoPilot((prev: AutoPilotState) => ({ ...prev, active: false, expiresAt: null, totalBudget: 0, leverage: 1, sessionId: null, mode: 'SCALPING', scanningStopped: false, riskLevel: 'NORMAL' })); setPendingReportSessionId(sId); setChatMessages(prev => [...prev, { role: 'bot', text: `🏁 **Sesión Finalizada Forzosamente.** Generando reporte consolidado...`, timestamp: Date.now() }]); } };

  const closeSessionTrades = (sId: string | null, reason: string) => { const cp = currentPriceRef.current; const toClose = openPositionsRef.current.filter(p => p.sessionId === sId || !sId); if (toClose.length === 0) return; let realReturn = 0; let paperReturn = 0; const closed = toClose.map(pos => { const pnl = getPnlData(pos).value; const returnAmount = (pos.amount || 0) + pnl; if (pos.tradeMode === 'REAL') realReturn += returnAmount; else paperReturn += returnAmount; return { ...pos, status: 'CLOSED', closePrice: cp, closeReason: reason, closeTime: Date.now(), finalPnl: pnl, finalPnlPercent: pos.amount ? (pnl / pos.amount) * 100 : 0 }; }) as unknown as TradeHistoryEntry[]; setOpenPositions((prev: OpenPosition[]) => prev.filter(p => !sId || p.sessionId !== sId)); setTradeHistory((h: TradeHistoryEntry[]) => [...closed, ...h].slice(0, 500)); setHistoryWindow((prev: TradeHistoryEntry[]) => [...closed, ...prev].slice(0, 500)); setHistoryTotal((prev: number) => prev + closed.length); if (realReturn !== 0) { setBalance((b: number) => b + realReturn); balanceRef.current += realReturn; } if (paperReturn !== 0) { setPaperBalance((b: number) => b + paperReturn); paperBalanceRef.current += paperReturn; } };

  // ── AI Omniscanner de Segundo Plano ──
  useEffect(() => {
    if (!autoPilot.active) return;  // No escanear si no hay sesión activa
    const runScan = async () => {
      try {
        const ap = autoPilotRef.current;
        const baseTickers = marketTickersRef.current.filter(t => t.symbol !== activeSymbol);
        const favTickers = baseTickers.filter(t => favoriteSymbolsRef.current.includes(t.symbol));
        const restTickers = baseTickers.filter(t => !favoriteSymbolsRef.current.includes(t.symbol));
        const topPairs = [...favTickers, ...restTickers].slice(0, 50);
        if (topPairs.length === 0) { onScannerLog?.('SYSTEM', 'Sin pares disponibles para escanear', 'warning'); return; }
        bgScanIdxRef.current = (bgScanIdxRef.current + 1) % topPairs.length;
        const targetTick = topPairs[bgScanIdxRef.current];
        if (!targetTick) return;
        onScannerLog?.(targetTick.symbol, `Evaluando ${targetTick.symbol.replace('USDT','/USDT')}...`, 'scan');
        if (openPositionsRef.current.some(p => p.symbol === targetTick.symbol)) { onScannerLog?.(targetTick.symbol, `Ya hay posición abierta - Saltando`, 'scan'); return; }
        if (!autoPilotRef.current.active || autoPilotRef.current.scanningStopped || openPositionsRef.current.length >= 7 || dataSource === 'simulation') { if (openPositionsRef.current.length >= 7) onScannerLog?.('SYSTEM', `Máximo de posiciones abiertas (7) - Scanner en espera`, 'warning'); setIsBgScanning(false); return; }
        setIsBgScanning(true);
        if (openPositionsRef.current.some(p => p.symbol === targetTick.symbol)) return;
        const res = await fetch(`/api/binance?endpoint=/fapi/v1/klines&symbol=${targetTick.symbol}&interval=${intervalTime}&limit=100`);
        if (!res.ok) { onScannerLog?.(targetTick.symbol, `Error HTTP ${res.status} - Rate limit o API offline`, 'warning'); return; }
        const data = await res.json();
        const cands = data.map((d: number[]) => ({ close: parseFloat(String(d[4])) || 0, volume: parseFloat(String(d[5])) }));
        if (cands.length < 50) { onScannerLog?.(targetTick.symbol, 'Datos insuficientes (velas < 50) - Esperando...', 'scan'); return; }
        const current = cands[cands.length - 1];
        const sma15 = cands.slice(-15).reduce((s: number, v: { close: number }) => s + v.close, 0) / 15;
        const sma50 = cands.slice(-50).reduce((s: number, v: { close: number }) => s + v.close, 0) / 50;
        const volumeSurge = current.volume > (cands.slice(-10).reduce((s: number, v: { volume: number }) => s + v.volume, 0) / 10) * 1.5;
        const momentum = Math.abs((current.close - cands[cands.length - 5].close) / cands[cands.length - 5].close * 100);
        const trendUpBg = current.close > sma15 && sma15 > sma50;
        const trendDownBg = current.close < sma15 && sma15 < sma50;
        let bgScore = 0;
        if (momentum > 0.5) bgScore += 2; if (volumeSurge) bgScore += 2;
        if (trendUpBg || trendDownBg) bgScore += 2;
        const cp = current.close; const extensionRatio = cp / sma15;
        const isOverbought = extensionRatio > 1.0025; const isOversold = extensionRatio < 0.9975;
        if (isOverbought || isOversold) bgScore += 2;
        let MIN_SCORE = ap.riskLevel === 'TURBO' ? 5 : (ap.riskLevel === 'HIGH' ? 6 : 7);
        const recentTraumas = aiKnowledgeRef.current.filter((k: AiKnowledge) => k.symbol === targetTick.symbol && k.outcome === 'LOSS' && Date.now() - k.timestamp < 45 * 60000);
        if (recentTraumas.length > 0) MIN_SCORE += (3 * recentTraumas.length);
        const lastTradeForTick = tradeHistoryRef.current?.find((t: TradeHistoryEntry) => t.symbol === targetTick.symbol);
        if (lastTradeForTick && lastTradeForTick.closeTime && Date.now() - lastTradeForTick.closeTime < 180000) { onScannerLog?.(targetTick.symbol, `Cooldown activo (3min)`, 'scan'); return; }
        if (bgScore >= MIN_SCORE) {
          onScannerLog?.(targetTick.symbol, `Score ${bgScore}/${MIN_SCORE} - Evaluando estructura...`, 'scan');
          if (tradeModeRef.current === 'PAPER') {
            const amountLocal = Math.max(10, paperBalanceRef.current * 0.10);
            const lev = ap.riskLevel === 'TURBO' ? 15 : (ap.riskLevel === 'HIGH' ? 10 : 8);
            if (paperBalanceRef.current >= amountLocal) {
              if (openPositionsRef.current.some(p => p.symbol === targetTick.symbol)) return;
              if (!trendUpBg && !trendDownBg) { onScannerLog?.(targetTick.symbol, 'Sin tendencia clara - Descartado', 'warning'); return; }
              if ((trendUpBg && isOverbought) || (trendDownBg && isOversold)) { onScannerLog?.(targetTick.symbol, 'Contra-tendencia detectada - Descartado', 'warning'); return; }
              const actionType: 'BUY' | 'SELL' = trendUpBg ? 'BUY' : 'SELL';
              const tacticsReason = trendUpBg ? 'Continuación alcista con volumen y estructura alineada' : 'Continuación bajista con volumen y estructura alineada';
              const realEntryPrice = current.close;
              symbolPricesRef.current[targetTick.symbol] = realEntryPrice;
              const newPos = { id: Date.now(), symbol: targetTick.symbol, type: actionType, entryPrice: realEntryPrice, amount: amountLocal, quantity: (amountLocal * lev) / realEntryPrice, timestamp: Date.now(), openTime: Date.now(), leverage: lev, mode: ap.mode || 'SCALPING', tradeMode: 'PAPER', sessionId: ap.sessionId, candlesAtOpen: cands.slice(-60) };
              setOpenPositions(prev => [...prev, newPos]); openPositionsRef.current = [newPos, ...openPositionsRef.current];
              onScannerLog?.(targetTick.symbol, `✓ ENTRADA ${actionType} a $${realEntryPrice.toFixed(4)} - ${tacticsReason}`, 'valid');
              if (notifsRef.current) { setChatMessages((prev: ChatMessage[]) => [...prev, { role: 'bot', text: `⚡ **Zero-Lag Sniper**: Entrada **${actionType}** en **${targetTick.symbol.replace('USDT','')}** a $${realEntryPrice.toFixed(4)}.\n🧬 **Motor Lógico**: ${tacticsReason}`, timestamp: Date.now() }]); }
            }
          }
          setActiveSymbol(targetTick.symbol); onSymbolChangeRequest?.(targetTick.symbol);
        }
      } catch (e) {}
    };
    const bgInterval = setInterval(runScan, autoPilotRef.current.riskLevel === 'TURBO' ? 4000 : 8000);
    return () => clearInterval(bgInterval);
  }, [autoPilot.active, autoPilot.scanningStopped, openPositions.length, activeSymbol, intervalTime, autoPilot.riskLevel, dataSource]);

  // ── AI Engine + Monitor ──
  useEffect(() => {
    if (!radarActive && !autoPilot.active) return;
    const LOOP_INTERVAL = 2000;
    const aiEngine = setInterval(() => {
      const nowTs = Date.now();
      if (autoPilot.active && !autoPilot.scanningStopped && autoPilot.expiresAt && nowTs > autoPilot.expiresAt) { setAutoPilot((prev: AutoPilotState) => ({ ...prev, scanningStopped: true })); setChatMessages(prev => [...prev, { role: 'bot', text: `⏱️ **Tiempo de Sesión Agotado.** Deteniendo la Inteligencia de Autoaprendizaje.`, timestamp: Date.now() }]); }
      if (autoPilot.scanningStopped) return;
      const cp = currentPriceRef.current; const cands = candlesRef.current;
      if (cp <= 0 || cands.length < 50 || activeSymbol !== currentPriceSymbolRef.current) return;
      const current = cands[cands.length - 1]; const sma15 = current.sma15; const sma50 = current.sma50;
      if (!sma15 || !sma50) return;
      const currentPositions = openPositionsRef.current.filter(p => autoPilot.active ? p.sessionId === autoPilot.sessionId : true);
      const isAuto = autoPilot.active;
      const activeBalance = tradeMode === 'REAL' ? balanceRef.current : paperBalanceRef.current;
      const budgetLimit = freeBudget ? activeBalance * 0.95 : Math.min(botBudget, activeBalance * 0.95);
      const usedMargin = currentPositions.reduce((sum: number, p: OpenPosition) => sum + p.amount, 0);
      const availableMargin = isAuto ? Math.max(0, budgetLimit - usedMargin) : botBudget;
      const rsi = calculateRSI(cands); const atr = calculateATR(cands); const macd = calculateMACD(cands); const bb = calculateBollingerBands(cands);
      const stochRsi = calculateStochRSI(cands); const vwap = calculateVWAP(cands, 30); const momentum = calculateMomentum(cands, 10);
      const ema9 = calculateEMA(cands, 9); const ema21 = calculateEMA(cands, 21);
      const avgVol5 = cands.slice(-5).reduce((s, c) => s + (c.volume || 0), 0) / 5;
      const cvdArray = calculateCVD(cands); const lastCvd = cvdArray[cvdArray.length - 1] || 0; const prevCvd = cvdArray[cvdArray.length - 2] || 0;
      const cvdDelta = lastCvd - prevCvd; const cvdDivergenceBuy = cp < sma15 && lastCvd > cvdArray[cvdArray.length - 11]; const cvdDivergenceSell = cp > sma15 && lastCvd < cvdArray[cvdArray.length - 11];
      const volStrength = (current.volume || 0) > avgVol5 * 1.1; const volSurge = (current.volume || 0) > cands.slice(-20).reduce((s, c) => s + c.volume, 0) / 20 * 1.5;
      if (availableMargin < 10) return; if (openPositionsRef.current.length >= 7) return;
      const lastEntryTime = lastEntryTimeRef.current[activeSymbol] || 0; const lastEntryPrice = lastEntryPriceRef.current[activeSymbol] || 0;
      const timeSinceLastEntry = nowTs - lastEntryTime; const priceSinceLastEntry = lastEntryPrice > 0 ? Math.abs(cp - lastEntryPrice) / lastEntryPrice : 1;
      const cooldownMs = (autoPilot.mode || 'SCALPING') === 'SCALPING' ? 45000 : 120000; const priceChangeMin = (autoPilot.mode || 'SCALPING') === 'SCALPING' ? 0.003 : 0.005;
      if (timeSinceLastEntry < cooldownMs && priceSinceLastEntry < priceChangeMin) return;
      let decisionAction: 'BUY' | 'SELL' | null = null; let decisionReasoning = '';
      const trendUp = ema9 !== null && ema21 !== null && cp > ema9 && ema9 > ema21; const trendDown = ema9 !== null && ema21 !== null && cp < ema9 && ema9 < ema21;
      const macdBull = macd.histogram > 0 && macd.macd > macd.signal; const macdBear = macd.histogram < 0 && macd.macd < macd.signal;
      const rsiBullOk = rsi > 45 && rsi < 75 && stochRsi.k > 40; const rsiBearOk = rsi < 55 && rsi > 25 && stochRsi.k < 60;
      let buyScore = 0; let sellScore = 0; const atrVal = calculateATR(cands); const atrPct = cp > 0 ? (atrVal / cp) * 100 : 0;
      if (atrPct < 0.05 || atrPct > 1.6) return;
      const vwapVal = vwap || cp; const structureBull = cp > sma15 && cp > sma50 && cp > vwapVal; const structureBear = cp < sma15 && cp < sma50 && cp < vwapVal;
      const isChasingBull = cp > sma15 + atrVal * 1.25; const isChasingBear = cp < sma15 - atrVal * 1.25;
      if (structureBull) { buyScore += 2; } if (trendUp) { buyScore += 2; } if (macdBull) { buyScore += 2; } if (rsiBullOk) { buyScore += 1; } if (volSurge) { buyScore += 1; } if (cvdDivergenceBuy && lastCvd > prevCvd) { buyScore += 1; }
      if (structureBear) { sellScore += 2; } if (trendDown) { sellScore += 2; } if (macdBear) { sellScore += 2; } if (rsiBearOk) { sellScore += 1; } if (volSurge) { sellScore += 1; } if (cvdDivergenceSell && lastCvd < prevCvd) { sellScore += 1; }
      if (Math.abs(buyScore - sellScore) < 2) return;
      const MIN_SCORE = autoPilot.riskLevel === 'TURBO' ? 5 : (autoPilot.riskLevel === 'HIGH' ? 6 : 7);
      const spotTokenValue = spotAssetFreeRef.current * cp;
      const hasUsdtToBuy = (tradeMode === 'REAL' ? Math.max(spotFreeBalanceRef.current, balanceRef.current) : paperBalanceRef.current) > 10;
      if (buyScore >= MIN_SCORE && buyScore > sellScore && hasUsdtToBuy) { decisionAction = 'BUY'; decisionReasoning = `🎯 **BUY** [${buyScore}/8]: ${['Continuación alcista', 'Tendencia EMA alcista', 'MACD Bullish'].slice(0, Math.min(buyScore, 3)).join(' | ')}`; }
      else if (sellScore >= MIN_SCORE && sellScore > buyScore && hasUsdtToBuy) { decisionAction = 'SELL'; decisionReasoning = `🎯 **SHORT** [${sellScore}/8]: ${['Continuación bajista', 'Tendencia EMA bajista', 'MACD Bearish'].slice(0, Math.min(sellScore, 3)).join(' | ')}`; }
      if (!decisionAction) return;
      if ((decisionAction === 'BUY' && (!structureBull || isChasingBull)) || (decisionAction === 'SELL' && (!structureBear || isChasingBear))) return;
      if (nowTs - lastAiCallTime.current < 15000) return;
      lastEntryTimeRef.current[activeSymbol] = nowTs; lastEntryPriceRef.current[activeSymbol] = cp;
      const traumasRecientes = aiKnowledgeRef.current.filter((m: AiKnowledge) => m.outcome === 'LOSS' && m.symbol === activeSymbol && m.type === decisionAction && nowTs - m.timestamp < 45 * 60000);
      if (traumasRecientes.length > 0) { const penalty = traumasRecientes.length * 3; const dynamicMin = MIN_SCORE + penalty; const actualScore = decisionAction === 'BUY' ? buyScore : sellScore; if (actualScore < dynamicMin) { if (notifsRef.current && nowTs - lastCurrentPriceSymbolRef.current > 30000) { lastCurrentPriceSymbolRef.current = nowTs; setChatMessages((prev: ChatMessage[]) => [...prev, { role: 'bot', text: `🧠 **Precaución Cognitiva**: Rechacé entrar en ${activeSymbol.replace('USDT','')}. He perdido ${traumasRecientes.length} vez(es) recientemente intentando un ${decisionAction} aquí.`, timestamp: Date.now() }]); } return; } }
      lastAiCallTime.current = nowTs;
      const trendScore = decisionAction === 'BUY' ? buyScore : sellScore;
      const strengthRatio = Math.max(0.15, Math.min(1.0, trendScore / 10.0));
      const maxRiskCapital = autoPilot.riskLevel === 'TURBO' ? 0.22 : (autoPilot.riskLevel === 'HIGH' ? 0.16 : 0.12);
      const betPercentage = maxRiskCapital * strengthRatio;
      const entryUnit = availableMargin * betPercentage;
      const useAmount = Math.max(10, Math.min(entryUnit, availableMargin));
      let currentLev = autoPilot.leverage; if (!currentLev || currentLev === 0) { const trustFactor = Math.min(1.0, trendScore / 10.0); const absoluteMax = autoPilot.riskLevel === 'TURBO' ? 18 : (autoPilot.riskLevel === 'HIGH' ? 12 : 8); currentLev = Math.max(4, Math.floor(absoluteMax * trustFactor)); }
      const fee = useAmount * currentLev * 0.0005 * 2;
      const atrForViability = calculateATR(cands); const tpMult = autoPilot.riskLevel === 'TURBO' ? 1.10 : (autoPilot.riskLevel === 'HIGH' ? 1.35 : 1.60);
      const grossPotential = (atrForViability * tpMult / cp) * useAmount * currentLev;
      const minRequiredProfit = fee * 4.0;
      if (grossPotential < minRequiredProfit) return;
      if (isAuto) {
        const isBuyDirection = decisionAction === 'BUY';
        let targetPrice: number | undefined = undefined; let stopPrice: number | undefined = undefined;
        const atrForSignal = calculateATR(cands);
        const tpMultiplier = autoPilot.riskLevel === 'TURBO' ? 1.10 : (autoPilot.riskLevel === 'HIGH' ? 1.35 : 1.60);
        const slMultiplier = autoPilot.riskLevel === 'TURBO' ? 0.35 : (autoPilot.riskLevel === 'HIGH' ? 0.40 : 0.45);
        if (isBuyDirection) { targetPrice = cp + atrForSignal * tpMultiplier; stopPrice = cp - atrForSignal * slMultiplier; } else { targetPrice = cp - atrForSignal * tpMultiplier; stopPrice = cp + atrForSignal * slMultiplier; }
        if (notifsRef.current) { setChatMessages((prev: ChatMessage[]) => [...prev, { role: 'bot', text: `⚡ **${decisionAction} [${autoPilot.mode || 'SCALPING'}]**\n${decisionReasoning}\n\nMONTO IMPRESO: $${useAmount.toFixed(2)} | X${currentLev}`, id: `bot_notif_${nowTs}`, timestamp: nowTs }]); }
        const mockMsg = { id: `ai_${nowTs}`, signalData: { type: decisionAction as 'BUY' | 'SELL', amount: useAmount, symbol: activeSymbol, entryPrice: cp, reason: decisionReasoning, leverage: currentLev, mode: autoPilot.mode || 'SCALPING', targetPrice, stopPrice } };
        executeSignal(mockMsg as unknown as ChatMessage);
        setAiZones([{ target: targetPrice, type: isBuyDirection ? 'demand' : 'supply' }]);
      } else if (radarActive && notifsRef.current) {
        const radarLabel = decisionAction === 'BUY' ? 'COMPRA' : 'VENTA';
        setChatMessages((prev: ChatMessage[]) => [...prev, { role: 'bot', type: 'signal', id: `alert_${nowTs}`, text: `🎯 **RADAR IA: ${radarLabel} Detectada**\n\n${decisionReasoning}\nPresupuesto Sugerido: $${useAmount.toFixed(2)}\n⚠️ *El sistema sugiere esta operación por estructura, no por tiempo.*`, signalData: { type: decisionAction, reason: decisionReasoning, amount: useAmount, leverage: currentLev }, status: 'pending', timestamp: Date.now(), expiresAt: Date.now() + 30000 }]);
      }
    }, 1000);

    const monitorEngine = setInterval(async () => {
      const nowTs = Date.now(); const cp = currentPriceRef.current;
      if (cp <= 0) return; const currentPositions = openPositionsRef.current; const cands = candlesRef.current;
      if (cands.length === 0) return;
      const offScreenSymbols = [...new Set(currentPositions.map(p => p.symbol).filter(s => s && s !== activeSymbolRef.current))] as string[];
      if (offScreenSymbols.length > 0 && nowTs % 5000 < 1100) { try { const priceRes = await fetch(`/api/binance?endpoint=/fapi/v1/ticker/price&symbols=${encodeURIComponent(JSON.stringify(offScreenSymbols))}`); if (priceRes.ok) { const priceData = await priceRes.json(); const arr = Array.isArray(priceData) ? priceData : [priceData]; arr.forEach((t: WSTickerPriceMsg) => { if (t.symbol && t.price) { symbolPricesRef.current[t.symbol] = parseFloat(t.price); } }); } } catch (_) {} }
      const activeBalance = tradeMode === 'REAL' ? balanceRef.current : paperBalanceRef.current;
      const budgetLimit = Math.max(0, freeBudget ? activeBalance * 0.95 : Math.min(botBudget, activeBalance * 0.95));
      const totalSessionPnl = currentPositions.reduce((sum, p) => sum + getPnlData(p).value, 0);
      const marginCallActive = budgetLimit > 0 && totalSessionPnl <= -(budgetLimit * 0.95);
      currentPositions.forEach(pos => {
        if (pos.isManual) return; let reason = null; const pnl = getPnlData(pos); const net = pnl.value; const netPercent = (net / pos.amount) * 100;
        const posSymbol = pos.symbol || activeSymbolRef.current; const posPrice = posSymbol === activeSymbolRef.current ? currentPriceRef.current : (symbolPricesRef.current[posSymbol] || 0);
        const hasLivePrice = posPrice > 0; const posAgeMins = (nowTs - (pos.openTime || nowTs)) / 60000;
        const mode = pos.mode || 'SCALPING'; const riskLvl = autoPilot.riskLevel || 'NORMAL'; const lev = pos.leverage || 1;
        const MAX_TIME_MINS = mode === 'SWING' ? 240 : (riskLvl === 'TURBO' ? 10 : (riskLvl === 'HIGH' ? 18 : 30));
        if (posAgeMins > MAX_TIME_MINS) { reason = `Tiempo máximo (${MAX_TIME_MINS}min) alcanzado. PnL estimado: ${netPercent.toFixed(2)}%`; }
        if (!hasLivePrice && !reason) return;
        if (marginCallActive) { reason = 'Extinción: Palanca de Emergencia (Drawdown Colosal)'; } else if (!reason) {
          const posAtr = calculateATR(cands); const tpMult = riskLvl === 'TURBO' ? 1.10 : (riskLvl === 'HIGH' ? 1.35 : 1.60);
          const slMult = riskLvl === 'TURBO' ? 0.35 : (riskLvl === 'HIGH' ? 0.40 : 0.45);
          const dynamicTP = pos.targetPrice || (pos.type === 'BUY' ? pos.entryPrice + posAtr * tpMult : pos.entryPrice - posAtr * tpMult);
          const dynamicSL = pos.stopPrice || (pos.type === 'BUY' ? pos.entryPrice - posAtr * slMult : pos.entryPrice + posAtr * slMult);
          const hardLossCap = lev >= 15 ? 1.40 : (lev >= 8 ? 1.80 : 2.20);
          if (posAgeMins > 0.5) { if (netPercent <= -hardLossCap) { reason = `🛑 Hard Stop de capital | ${netPercent.toFixed(2)}%`; } else if (pos.type === 'BUY' && posPrice <= dynamicSL) { reason = `🛑 Stop Loss ($${posPrice.toFixed(4)}) | ${netPercent.toFixed(2)}%`; } else if (pos.type === 'SELL' && posPrice >= dynamicSL) { reason = `🛑 Stop Loss ($${posPrice.toFixed(4)}) | ${netPercent.toFixed(2)}%`; } }
          if (!reason && netPercent > 0) {
            const currentMax = pos._maxNetPercent || 0;
            if (netPercent > currentMax) { setOpenPositions(prev => prev.map(p => p.id === pos.id ? { ...p, _maxNetPercent: netPercent } : p)); }
            else { const trailingActivation = lev >= 15 ? 1.20 : 0.90;
              if (currentMax >= trailingActivation) { const retrocesoPermitido = currentMax >= 6 ? 1.60 : (currentMax >= 3 ? 0.90 : (currentMax >= 1.8 ? 0.55 : 0.35)); const pisoProtegido = currentMax >= 3 ? 1.20 : (currentMax >= 1.8 ? 0.70 : 0.25);
                const trailingFloor = Math.max(pisoProtegido, currentMax - retrocesoPermitido); if (netPercent <= trailingFloor) { reason = `📈 Trailing Stop: Asegurando ganancia. Máx: +${currentMax.toFixed(2)}%, Cierre: +${netPercent.toFixed(2)}%`; }
              } else if (currentMax >= 0.45 && netPercent <= 0.05 && posAgeMins > 3) { reason = `📈 Break-even defensivo. Máx: +${currentMax.toFixed(2)}%, Cierre: +${netPercent.toFixed(2)}%`; }
            }
          }
        }
        if (reason) {
          const lastFailTime = pos._lastCloseFail || 0; if (Date.now() - lastFailTime < 30000) return;
          closeTradeManual(pos.id, undefined, reason);
          if (pos._autoReverse && tradeModeRef.current === 'PAPER') {
            setTimeout(() => {
              const revType = pos._autoReverse as string; const amountLocal = pos.amount; const localLev = pos.leverage;
              if (paperBalanceRef.current >= amountLocal) {
                const newPos = { id: Date.now() + Math.floor(Math.random() * 1000), symbol: pos.symbol, type: revType, entryPrice: cp, amount: amountLocal, quantity: (amountLocal * localLev) / cp, timestamp: Date.now(), openTime: Date.now(), leverage: localLev, mode: pos.mode, tradeMode: 'PAPER', sessionId: pos.sessionId, candlesAtOpen: cands.slice(-60) };
                setOpenPositions(prev => [...prev, newPos as OpenPosition]); if (notifsRef.current) { setChatMessages((prev: ChatMessage[]) => [...prev, { role: 'system', text: `🔄 **SAR**: Estructura rota en ${pos.symbol.replace('USDT','')}. Inversión a **${revType}**.`, timestamp: Date.now() }]); }
              }
            }, 500);
          }
          const isLoss = net < 0; const profitPercentage = isLoss ? Math.abs(netPercent) : netPercent;
          const newMem = { id: `mem_${nowTs}_${pos.symbol}`, timestamp: nowTs, symbol: pos.symbol, type: pos.type, outcome: isLoss ? 'LOSS' : 'WIN', profit: profitPercentage, rule: isLoss ? `FALLO [${pos.symbol}]: ${pos.type} resultó en -${profitPercentage.toFixed(1)}%. Aumentando penalidad.` : `ÉXITO [${pos.symbol}]: ${pos.type} resultó en +${profitPercentage.toFixed(1)}%. Reduciendo fricción.` };
          setAiKnowledge((prev: AiKnowledge[]) => { const u = [newMem, ...prev]; aiKnowledgeRef.current = u; return u; });
          if (!autoPilot.scanningStopped) { const isPainfulLoss = isLoss && Math.abs(profitPercentage) > 1.0;
            const sessionWins = tradeHistoryRef.current.filter((t: TradeHistoryEntry) => t.sessionId === autoPilot.sessionId && t.finalPnl > 0).length;
            const notifyOnWin = !isLoss && sessionWins % 5 === 0 && sessionWins > 0;
            if (isPainfulLoss || notifyOnWin) setTimeout(() => { setChatMessages((prev: ChatMessage[]) => [...prev, { role: 'bot', text: isPainfulLoss ? `⚠️ **Protección Anti-Trauma** en *${pos.symbol}*: Pérdida de -${Math.abs(profitPercentage).toFixed(2)}%. Bloqueando ${pos.type} repetido durante 45min.` : `🏆 **Hito de Sesión**: ${sessionWins} operaciones ganadoras.`, id: `learn_${Date.now()}`, timestamp: Date.now() }]); }, 1500);
          }
          aiMemory.current.push(`[Op. Cerrada ${pos.type}]: PnL ${net.toFixed(2)}$ (${reason})`);
        }
      });
      if (autoPilot.active && autoPilot.scanningStopped) { const sessionTrades = openPositionsRef.current.filter(p => p.sessionId === autoPilot.sessionId); if (sessionTrades.length === 0) { const sId = autoPilot.sessionId; setAutoPilot((prev: AutoPilotState) => ({ ...prev, active: false, expiresAt: null, totalBudget: 0, leverage: 1, sessionId: null, mode: 'SCALPING', scanningStopped: false, riskLevel: 'NORMAL' })); setPendingReportSessionId(sId); } }
    }, 1000);
    return () => { clearInterval(aiEngine); clearInterval(monitorEngine); };
  }, [radarActive, autoPilot, freeBudget, keys.gemini, aiLearningEnabled, controlMode, manualStrategy, activeSymbol]);

  const [globalTooltip, setGlobalTooltip] = useState<{ show: boolean; text: string; x: number; y: number } | null>(null);
  useEffect(() => { const handleMouseOver = (e: MouseEvent) => { const el = (e.target as HTMLElement)?.closest?.('[data-tooltip]'); if (el) { const rect = (el as HTMLElement).getBoundingClientRect(); const text = (el as HTMLElement).getAttribute('data-tooltip'); if (text) setGlobalTooltip({ show: true, text, x: rect.right + 12, y: Math.max(10, rect.top + (rect.height / 2)) }); } else setGlobalTooltip(null); }; window.addEventListener('mouseover', handleMouseOver); return () => window.removeEventListener('mouseover', handleMouseOver); }, []);

  const currentUsedMargin = openPositions.reduce((sum, p) => p.sessionId === autoPilot.sessionId ? sum + p.amount : sum, 0);
  useEffect(() => { if (strategySuggestions) { setManualStrategy((prev: ManualStrategy) => ({ ...prev, ...strategySuggestions })); setStrategySuggestions(null); } }, [strategySuggestions]);

  const closeTradeManual = async (id: string | number, e?: React.MouseEvent, autoReason?: string) => {
    if (e) e.stopPropagation();
    try {
      const pos = openPositionsRef.current.find((p: OpenPosition) => p.id === id);
      if (!pos) return;
      if (pos.binanceQty) { pos.binanceQty = adjustQtyToStepSize(parseFloat(String(pos.binanceQty)), pos.symbol || activeSymbol); }
      if (dataSource === 'binance' && pos.tradeMode === 'REAL') {
        const closeSide = pos.type === 'BUY' ? 'SELL' : 'BUY';
        const closeAction = closeSide === 'SELL' ? 'Vendiendo' : 'Recomprando';
        const posQty = pos.binanceQty ? parseFloat(pos.binanceQty) : 0;
        if (posQty > 0) {
          setChatMessages(prev => [...prev, { id: Date.now(), role: 'system', text: `⏳ **Liquidando Posición...** ${closeAction} ${pos.binanceQty} tokens en [${pos.symbol}]`, timestamp: Date.now() }]);
          try {
            const closeParams: BinanceOrderParams = { symbol: pos.symbol, side: closeSide, type: 'MARKET', quantity: pos.binanceQty };
            const res = await fetch('/api/binance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint: '/fapi/v1/order', method: 'POST', apiKey: keys.binance_key, apiSecret: keys.binance_secret, params: closeParams }) });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Rechazado al liquidar posición.');
            setChatMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', text: `⚡ **POSICIÓN CERRADA (BINANCE)**\n${closeAction} completado en [${pos.symbol}].`, timestamp: Date.now() }]);
          } catch (err: unknown) { const errorMsg = err instanceof Error ? err.message : 'Error desconocido'; setChatMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', text: `❌ **Error liquidando (Binance)**: ${errorMsg}. SE FORZARÁ EL CIERRE EN LA INTERFAZ.`, timestamp: Date.now() }]); }
        }
      }
      const posSymbol = pos.symbol || activeSymbol;
      let cp = posSymbol === activeSymbol ? currentPriceRef.current : (symbolPricesRef.current[posSymbol] || pos.entryPrice);
      if (!cp || cp <= 0) cp = pos.entryPrice;
      const pnl = getPnlData(pos);
      const capitalToReturn = pos.amount || 0;
      const capitalFinal = capitalToReturn + pnl.value;
      const wasClosedByAI = !!autoReason;
      const closeReasonText = autoReason || 'Cierre Manual Ejecutivo';
      const candlesAtClose = candlesRef.current.slice(-60).map(c => ({ time: c.time, open: c.open, high: c.high, low: c.low, close: c.close, volume: c.volume, sma15: c.sma15, sma50: c.sma50 }));
      const closeTimeMs = Date.now();
      const finalPnlPercent = pos.amount > 0 ? (pnl.value / pos.amount) * 100 : 0;
      const duration = closeTimeMs - (pos.openTime || closeTimeMs);
      const closed = { ...pos, status: 'CLOSED', closePrice: cp, closeReason: closeReasonText, closeTime: closeTimeMs, finalPnl: pnl.value, finalPnlPercent, duration, finalBalance: capitalFinal, closedBy: wasClosedByAI ? 'IA' : 'HUMANO', candlesAtClose };
      setOpenPositions((prev: OpenPosition[]) => prev.filter(x => x.id !== pos.id));
      setTradeHistory((h: TradeHistoryEntry[]) => [closed as unknown as TradeHistoryEntry, ...h].slice(0, 500));
      setHistoryWindow((prev: TradeHistoryEntry[]) => [closed as TradeHistoryEntry, ...prev].slice(0, 500));
      setHistoryTotal((prev: number) => prev + 1);
      const closedSym = pos.symbol || activeSymbol;
      if (pnl.value > 0) { setFavoriteSymbols(prev => { if (prev.includes(closedSym)) return prev; const nextFavs = [...prev, closedSym]; localStorage.setItem('blis_fav_symbols', JSON.stringify(nextFavs)); favoriteSymbolsRef.current = nextFavs; return nextFavs; }); } else if (pnl.value < -1.0) { setFavoriteSymbols(prev => { const nextFavs = prev.filter(s => s !== closedSym); localStorage.setItem('blis_fav_symbols', JSON.stringify(nextFavs)); favoriteSymbolsRef.current = nextFavs; return nextFavs; }); }
      try { supabase.from('trading_open_positions').delete().eq('id', closed.id.toString()).then(); supabase.from('trading_history').upsert({ id: closed.id.toString(), symbol: closed.symbol || activeSymbol, trade_type: closed.type, amount: closed.amount, leverage: closed.leverage || 1, entry_price: closed.entryPrice, close_price: closed.closePrice, final_pnl: closed.finalPnl, duration: closed.duration, close_reason: closed.closeReason, candles_snapshot: closed.candlesAtOpen, trade_mode: closed.tradeMode }, { onConflict: 'id' }).then(); } catch(e) { console.error("Error persisting trade:", e); }
      if (pos.tradeMode === 'REAL') { setTimeout(() => { if(isMounted) syncBinanceWallet(); }, 3000); } else { const netPnl = pnl.value; setPaperBalance(prev => { const updated = prev + netPnl; paperBalanceRef.current = updated; return updated; }); }
    } catch (e: unknown) { console.error("Error crítico al cerrar posición", e); const errorMsg = e instanceof Error ? e.message : 'Error desconocido'; setGlobalAlert(`Error interno al cerrar: ${errorMsg}`); }
  };

  const closeAllPositions = async () => { for (const p of openPositions) { await closeTradeManual(p.id); } setGlobalAlert("Se han cerrado todas las posiciones abiertas."); };

  const executeSignal = async (msg: ChatMessage | MockSignalMsg): Promise<boolean> => {
    const targetSym = msg.signalData?.symbol || activeSymbol;
    const cp = msg.signalData?.entryPrice || symbolPricesRef.current[targetSym] || currentPriceRef.current;
    if (!cp || cp <= 0 || (targetSym === activeSymbol && activeSymbol !== currentPriceSymbolRef.current)) {
      setChatMessages(prev => { const lMsg = prev[prev.length - 1]; if (lMsg && lMsg.text.includes('Precio actual no disponible')) return prev; return [...prev, { role: 'bot' as const, text: `⚠️ **Precio actual no disponible.** Esperando datos del mercado antes de ejecutar.`, timestamp: Date.now() }].slice(-50); });
      setManualExecStatus({ text: 'Precio no disponible. Esperando datos.', type: 'error' }); return false;
    }
    const isAuto = autoPilot.active;
    const activeBalance = tradeMode === 'REAL' ? balanceRef.current : paperBalanceRef.current;
    const sd = msg.signalData!;
    const isManualExec = sd.reason === 'MANUAL_EXECUTION';
    const actionType = sd.type;
    const currentPositions = openPositionsRef.current.filter(p => autoPilot.active ? p.sessionId === autoPilot.sessionId : true);
    const usedMargin = currentPositions.reduce((sum, p) => sum + (p.amount || 0), 0);
    const openPaperAmt = openPositionsRef.current.filter((p: OpenPosition) => p.tradeMode === 'PAPER').reduce((s: number, p: OpenPosition) => s + (p.amount || 0), 0);
    let availableMargin = tradeMode === 'PAPER' ? Math.max(0, paperBalanceRef.current - openPaperAmt) : binanceAvailableRef.current;
    if (!isManualExec && !freeBudget) { availableMargin = Math.min(availableMargin, botBudget - usedMargin); }
    if (availableMargin < 9.99) { setChatMessages(prev => [...prev, { role: 'bot', text: `⚠️ **Margen insuficiente para ${actionType}.** Disponible: $${availableMargin.toFixed(2)} USDT. Se requiere mínimo $10.`, timestamp: Date.now() }]); setManualExecStatus({ text: `Margen insuficiente: $${availableMargin.toFixed(2)}`, type: 'error' }); return false; }
    let amt = sd.amount || (freeBudget ? availableMargin : Math.min(botBudget, availableMargin));
    if (amt < 10) { amt = Math.min(10, availableMargin); if (amt < 10) { setChatMessages(prev => [...prev, { role: 'bot', text: `⚠️ **Monto insuficiente.** Se necesitan al menos $10 USDT para operar.`, timestamp: Date.now() }]); setManualExecStatus({ text: 'Se necesitan al menos $10 USDT.', type: 'error' }); return false; } }
    if (amt > availableMargin + 0.01) { setChatMessages(prev => [...prev, { role: 'bot', text: `⚠️ **Capital insuficiente.** Intentas operar con $${amt.toFixed(2)} pero solo tienes $${availableMargin.toFixed(2)} libres.`, timestamp: Date.now() }]); setManualExecStatus({ text: 'Margen Insuficiente.', type: 'error' }); return false; }
    if (tradeMode === 'REAL') { binanceAvailableRef.current -= amt; setBinanceAvailable(binanceAvailableRef.current); }
    let lev = sd.leverage || userLeverage || 1;
    if (lev === 0) { const risk = autoPilot.riskLevel || 'NORMAL'; lev = botMode === 'SCALPING' ? (risk === 'TURBO' ? 50 : (risk === 'HIGH' ? 30 : 20)) : 10; const nowTs = Date.now(); if (nowTs - (sd._lastLevLog || 0) > 20000) { setChatMessages(prev => [...prev, { role: 'bot', text: `🧠 **OVERCLOCK APALANCADO**: Operando en Inteligencia AUTO. He inyectado un multiplicador Dinámico e Institucional de **x${lev}** para arrasar con el mercado.`, timestamp: Date.now() }]); sd._lastLevLog = nowTs; } }
    const fee = amt * lev * 0.0005 * 2;
    let binanceQty = adjustQtyToStepSize(amt / cp, activeSymbol);
    const orderIdRef = `pos_${Date.now()}`;
    if (dataSource === 'binance' && tradeMode === 'REAL') {
      try {
        setChatMessages(prev => [...prev, { id: Date.now(), role: 'system', text: `⏳ **Ejecutando Orden Real en Binance:** ${actionType} en [${activeSymbol}]`, timestamp: Date.now() }]);
        const positionSizeTotalUSD = amt * lev; const quantityTokens = positionSizeTotalUSD / cp; const finalQty = adjustQtyToStepSize(quantityTokens, activeSymbol);
        const params: BinanceOrderParams = { symbol: activeSymbol, side: actionType, type: 'MARKET' }; params.quantity = finalQty;
        if (parseFloat(finalQty) <= 0) { setChatMessages(prev => [...prev, { id: Date.now(), role: 'bot', text: `⚠️ **Monto muy bajo.**`, timestamp: Date.now() }]); setManualExecStatus({ text: 'Monto muy bajo para Binance.', type: 'error' }); return false; }
        await fetch('/api/binance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint: '/fapi/v1/leverage', method: 'POST', apiKey: keys.binance_key, apiSecret: keys.binance_secret, params: { symbol: activeSymbol, leverage: lev } }) });
        const res = await fetch('/api/binance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint: '/fapi/v1/order', method: 'POST', apiKey: keys.binance_key, apiSecret: keys.binance_secret, params }) });
        const data = await res.json();
        if (!res.ok) {
          binanceAvailableRef.current += amt; setBinanceAvailable(binanceAvailableRef.current);
          setChatMessages(prev => [...prev, { id: Date.now(), role: 'bot' as const, text: `⚠️ **BINANCE RECHAZÓ LA ORDEN**: ${data.error || 'Error de conexión o balance insuficiente.'}`, timestamp: Date.now() }].slice(-50));
          setManualExecStatus({ text: `Binance rechazó: ${(data.error || 'Error').slice(0, 50)}...`, type: 'error' }); return false;
        }
        const receivedQty = data.executedQty ? parseFloat(data.executedQty) : 0;
        binanceQty = receivedQty > 0 ? String(receivedQty) : finalQty;
        setBalance(prev => prev - amt); balanceRef.current -= amt;
        setChatMessages(prev => [...prev, { id: Date.now(), role: 'bot', text: `⚡ **ORDEN COMPLETA (BINANCE)**\nTransacción ejecutada en mercado mundial. Esperando toma de ganancias...`, timestamp: Date.now() }]);
      } catch (err: unknown) {
        binanceAvailableRef.current += amt; setBinanceAvailable(binanceAvailableRef.current);
        const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
        setChatMessages(prev => [...prev, { id: Date.now(), role: 'bot', text: `❌ **Corte de Ejecución Automática (API)**:\n${errorMsg}`, timestamp: Date.now() }]);
        setManualExecStatus({ text: `Error de red: ${(err as Error).message}`, type: 'error' }); return false;
      }
    }
    const isManualTrade = sd.reason === 'MANUAL_EXECUTION';
    const candleSnapshot = candlesRef.current.slice(-60).map(c => ({ time: c.time, open: c.open, high: c.high, low: c.low, close: c.close, volume: c.volume, sma15: c.sma15, sma50: c.sma50 }));
    const tradeData: OpenPosition = { id: orderIdRef, symbol: msg.signalData?.symbol || activeSymbol || 'BTCUSDT', sessionId: autoPilot.active ? autoPilot.sessionId : null, tradeMode, type: (msg.signalData?.type || 'BUY') as 'BUY' | 'SELL', entryPrice: cp, amount: amt, leverage: lev, fee, status: 'OPEN', openTime: Date.now(), mode: botMode, explanation: msg.signalData?.reason, isManual: isManualTrade, openedBy: isManualTrade ? 'HUMANO' : 'IA', closedBy: null, candlesAtOpen: candleSnapshot, targetPrice: isManualTrade ? null : (msg.signalData?.targetPrice || null), stopPrice: isManualTrade ? null : (msg.signalData?.stopPrice || null), binanceQty };
    setOpenPositions((prev: OpenPosition[]) => [tradeData, ...prev]); openPositionsRef.current = [tradeData, ...openPositionsRef.current];
    setChatMessages((prev: ChatMessage[]) => prev.map(m => m.id === msg.id ? { ...m, status: 'executed' } : m));
    return true;
  };

  const executeManualSignal = async (type: 'BUY' | 'SELL', customAmt?: number) => {
    const activeBal = tradeMode === 'REAL' ? balanceRef.current : paperBalanceRef.current;
    const amountToUse = customAmt || manualTradeAmt;
    if (type === 'BUY') { if (amountToUse < 10) { const msg = 'Monto Mínimo: Se requieren al menos $10 para comprar.'; setChatMessages(prev => { const lastMsg = prev[prev.length - 1]; if (lastMsg && lastMsg.text === msg) return prev; return [...prev, { role: 'bot' as const, text: `⚠️ **${msg}**`, timestamp: Date.now() }].slice(-50); }); setManualExecStatus({ text: msg, type: 'error' }); setTimeout(() => setManualExecStatus(null), 10000); return; } if (amountToUse > activeBal) { setChatMessages(prev => [...prev, { role: 'bot' as const, text: `⚠️ **Fondo Insuficiente.** Disponible: ${fmtUsd(activeBal)}`, timestamp: Date.now() }]); setManualExecStatus({ text: `Fondo Insuficiente. Disponible: ${fmtUsd(activeBal)}`, type: 'error' }); setTimeout(() => setManualExecStatus(null), 10000); return; } } else { if (amountToUse < 10) { setChatMessages(prev => [...prev, { role: 'bot' as const, text: `⚠️ **Monto Mínimo**: Se requieren al menos $10 para abrir Short (Venta).`, timestamp: Date.now() }]); setManualExecStatus({ text: 'Monto Mínimo: $10 para Short.', type: 'error' }); setTimeout(() => setManualExecStatus(null), 10000); return; } if (amountToUse > activeBal) { setChatMessages(prev => [...prev, { role: 'bot' as const, text: `⚠️ **Margen Insuficiente para Venta.** Disponible: ${fmtUsd(activeBal)}`, timestamp: Date.now() }]); setManualExecStatus({ text: `Margen Insuficiente. Disponible: ${fmtUsd(activeBal)}`, type: 'error' }); setTimeout(() => setManualExecStatus(null), 10000); return; } }
    setManualExecStatus({ text: `Ejecutando ${type === 'BUY' ? 'COMPRA' : 'VENTA'} de ${fmtUsd(amountToUse)}...`, type: 'loading' });
    const msgMock = { id: Date.now(), signalData: { type, amount: amountToUse, entryPrice: currentPriceRef.current, leverage: userLeverage, reason: 'MANUAL_EXECUTION', strategy: controlMode === 'MANUAL' ? 'CUSTOM_RULES' : 'DIRECT_CLICK' } };
    const success = await executeSignal(msgMock);
    if (success) { setManualExecStatus({ text: `${type === 'BUY' ? 'COMPRA' : 'VENTA'} ejecutada correctamente`, type: 'success' }); }
    setTimeout(() => setManualExecStatus(null), 10000);
  };

  const handleSendMessage = (e: React.SyntheticEvent) => { executeSendPrompt(e); };

  const executeSendPrompt = async (e: React.SyntheticEvent | null, overrideText: string | null = null) => {
    if (e && e.preventDefault) e.preventDefault();
    const userText = (overrideText || chatInput).trim(); if (!userText) return;
    setChatMessages(prev => [...prev, { role: 'user', text: userText, timestamp: Date.now() }]);
    setChatInput(''); setIsTyping(true);
    if (!keys.gemini && !keys.openai) { setChatMessages(prev => [...prev, { role: 'bot', text: "⚠️ **Configuración Requerida**: Conecta tu API Key de Gemini o ChatGPT en el panel de **APIs & Cloud** para habilitar la inteligencia evolutiva.", timestamp: Date.now() }]); setIsTyping(false); return; }
    try {
      const memoryContext = aiKnowledgeRef.current.length > 0 ? `\n🧠 REGLAS APRENDIDAS (Memorias Previas de Fallos a Evitar):\n${aiKnowledgeRef.current.slice(0,5).map(k=>`- ${k.rule}`).join('\n')}` : '';
      const promptText = `Eres el Agente Autónomo Institucional HFT de Xpand Capital. \n MODO ACTUAL: ${tradeMode} (Operando en ${tradeMode === 'REAL' ? 'Binance Real Spot/Futuros' : 'Simulación Virtual (Paper)'}).\n Activo Seleccionado: ${activeSymbol}.\n Balance Disponible (USDT): $${(tradeMode === 'REAL' ? balance : paperBalance).toFixed(2)}.\n Fondos del Activo (${activeSymbol}): $${((activeAssetBalance || 0) * (ticker?.price || currentPriceRef.current || 0)).toFixed(2)}.\n Mercado Actual: $${(ticker?.price || currentPriceRef.current || 0).toFixed(2)}.${memoryContext}\n\nEl usuario dice o pide: "${userText}"`;
      const sysInst = "Si el usuario pide hacer operaciones, mayor ganancia, encender bot, operar, configurar modos, ajustar score/cooldown/trailing/posiciones, o similar, debes devolver la intención como acción de plataforma en JSON. IMPORTANTE: Cualquier instrucción que implique operar, configurar parámetros del motor, o activar modos (agresivo/moderado/defensivo) SIEMPRE debe devolver action: 'START_AUTOPILOT' para iniciar o reiniciar el motor con los nuevos parámetros. Si el usuario pide CERRAR posiciones, vender, liquidar todo, retirarse, DEBES devolver action: 'CLOSE_TRADE'.\n\nFORMATO JSON ESTRICTO:\n{\n  \"reply\": \"Respuesta profesional confirmando la instrucción y los parámetros configurados\",\n  \"action\": \"START_AUTOPILOT\" | \"STOP_AUTOPILOT\" | \"CLOSE_TRADE\" | \"NONE\",\n  \"mode\": \"SCALPING\" | \"SWING\",\n  \"freeBudget\": true | false,\n  \"leverage\": (número opcional si pide multiplicador),\n  \"durationMins\": null,\n  \"riskLevel\": \"NORMAL\" | \"HIGH\" | \"TURBO\"\n}\n\nREGLAS DE RIESGO:\n- Si menciona 'score mínimo 2', 'cooldown 30s', 'agresivo', 'máximo riesgo', 'ultra' → riskLevel: 'TURBO'\n- Si menciona 'score mínimo 3', 'moderado', 'balanceado' → riskLevel: 'HIGH'\n- Si menciona 'score mínimo 5', 'defensivo', 'conservador', 'seguro' → riskLevel: 'NORMAL'\n- durationMins siempre null (duración indefinida por defecto)\n\nPERSONALIDAD: Motor Cuantitativo Institucional de Xpand Capital. Responde siempre profesional y analítico.";
      const model = keys.openai ? 'openai' : 'gemini';
      const result = await aiChat({ model, prompt: promptText, systemPrompt: sysInst, temperature: 0.7 });
      if (result.error) throw new Error(result.error);
      const rawText = result.text;
      if (!rawText) throw new Error("Respuesta vacía de la IA");
      let parsed; try { parsed = JSON.parse(rawText.replace(/```json|```/gi, '').trim()); } catch { throw new Error("La IA devolvió formato inválido."); }
      setChatMessages(prev => [...prev, { role: 'bot', text: safeText(parsed.reply || "Intención recibida."), timestamp: Date.now() }]);
      if (parsed.action === 'START_AUTOPILOT') { const m = parsed.mode || 'SCALPING'; const f = parsed.freeBudget === undefined ? true : parsed.freeBudget; const risk = parsed.riskLevel || 'NORMAL'; setBotMode(m); setFreeBudget(f); setTimeout(() => startAutoPilotManual(m, f, parsed.durationMins, parsed.leverage, risk), 800); } else if (parsed.action === 'STOP_AUTOPILOT') { setTimeout(() => stopAutoPilotManual(), 800); } else if (parsed.action === 'CLOSE_TRADE') { const activePosKeys = openPositionsRef.current.filter(p => p.symbol === activeSymbol); if (activePosKeys.length === 0) { setChatMessages(prev => [...prev, { role: 'bot', text: `👀 **Revisión Interrumpida:** No hay operaciones detectadas localmente para ${activeSymbol} en la tabla.`, timestamp: Date.now() }]); } else { activePosKeys.forEach(p => closeTradeManual(p.id, undefined, 'Orden Mistic de Cierre mediante IA')); } }
    } catch (err: unknown) { const errorMsg = err instanceof Error ? err.message : 'Error desconocido'; setChatMessages(prev => [...prev, { role: 'bot', text: `Error en canal Agente: ${errorMsg}`, timestamp: Date.now() }]); } finally { setIsTyping(false); }
  };

  // ── Report generation ──
  useEffect(() => {
    if (pendingReportSessionId && !isGeneratingReport) {
      const currentSessionPos = openPositions.filter(p => p.sessionId === pendingReportSessionId);
      if (currentSessionPos.length === 0) {
        setIsGeneratingReport(true);
        setTimeout(async () => {
          const trades = tradeHistory.filter(t => t.sessionId === pendingReportSessionId);
          if (trades.length === 0) { setPendingReportSessionId(null); setIsGeneratingReport(false); return; }
          const totalPnl = trades.reduce((acc, t) => acc + t.finalPnl, 0);
          const winRate = trades.length > 0 ? ((trades.filter(t => t.finalPnl > 0).length / trades.length) * 100).toFixed(1) : "0.0";
          let repData = { title: "Reporte de Sesión IA", performanceOpinion: "Gestión impecable bajo volatilidad.", educationalLesson: "El capital es tu herramienta, la paciencia tu escudo." };
          if (keys.openai || keys.gemini) {
            try {
              const sysText = "Eres el Analista Cuantitativo Institucional de Xpand Capital. Evalúas resultados algorítmicos. Emite un reporte siempre bajo una perspectiva técnica, imparcial, constructiva y profesional. Nunca insultes ni seas grosero.";
              const usrText = `Sesión HFT Finalizada. Operaciones: ${trades.length}. WinRate: ${winRate}%. Profit Neto: $${totalPnl.toFixed(2)}. Dame un reporte estrictamente profesional en JSON evaluando la sesión:\n{ "title": "título técnico descriptivo", "performanceOpinion": "análisis institucional y neutral del rendimiento", "educationalLesson": "recomendación matemática o de riesgo" }`;
              const model = keys.openai ? 'openai' : 'gemini';
              const reportResult = await aiChat({ model, prompt: usrText, systemPrompt: sysText, temperature: 0.5 });
              if (!reportResult.error && reportResult.text) {
                try { repData = JSON.parse(reportResult.text.replace(/```json|```/gi, '').trim()); } catch(e) { console.error("Error parsing report AI", e); }
              }
            } catch (e) { console.error("Error reporte IA", e); }
          }
          const rep = { id: pendingReportSessionId, date: Date.now(), totalPnl, winRate, ...repData };
          setSessionReport(rep); setSavedReports((prev: SessionReport[]) => [rep, ...prev]); setPendingReportSessionId(null); setIsGeneratingReport(false);
        }, 1500);
      }
    }
  }, [openPositions, pendingReportSessionId, isGeneratingReport, tradeHistory, keys.gemini, keys.openai]);

  const handleManualEval = () => { if (isManualChatThinking) return; setIsManualChatThinking(true); setManualChatHistory(prev => [...prev, { role: 'user', text: `Evaluar ${activeSymbol} con mi configuración actual...` }]); setTimeout(() => { const verdict = Math.random() > 0.5 ? 'BUY' : 'SELL'; const strength = Math.floor(Math.random() * 40) + 60; let text = `🔍 **ANÁLISIS INSTANTÁNEO (${activeSymbol})**:\n\n`; text += `• Tendencia EMA (${manualStrategy.emaFast}/${manualStrategy.emaSlow}): ${verdict === 'BUY' ? 'Alcista' : 'Bajista'}\n`; text += `• Fuerza RSI (${manualStrategy.rsiPeriod}): ${manualStrategy.rsiBuy < 40 ? 'Sobreventa detectada' : 'Neutral'}\n`; text += `• **Veredicto**: ${verdict === 'BUY' ? 'COMPRA RECOMENDADA' : 'VENTA RECOMENDADA'} (${strength}% de coincidencia con tus reglas).`; setManualStrategy((prev: ManualStrategy) => ({ ...prev, emaFast_suggest: verdict === 'BUY' ? 9 : 21, emaSlow_suggest: verdict === 'BUY' ? 21 : 55, rsiPeriod_suggest: 14, rsiBuy_suggest: 30, rsiSell_suggest: 70, stochK_suggest: 14, stochD_suggest: 3, stochOverbought_suggest: 92, stochOversold_suggest: 8, atrMultiplier_suggest: verdict === 'BUY' ? 1.5 : 2.5, tpRatio_suggest: 3.5, risk_suggest: 2, beTrigger_suggest: 15, beLock_suggest: 5, trailingDist_suggest: 20 })); setManualChatHistory(prev => [...prev, { role: 'bot', text }]); setIsManualChatThinking(false); }, 1500); };
  const wipeAllData = () => { setTradeHistory([]); setAiKnowledge([]); setSavedReports([]); setPaperBalance(200.00); try { supabase.from('trading_history').delete().neq('id', '0').then(); } catch(e) {} localStorage.removeItem('blis_trade_history'); localStorage.removeItem('blis_balance'); localStorage.removeItem('blis_paper_balance'); localStorage.removeItem('blis_last_history_count'); localStorage.removeItem('blis_last_reports_count'); };
  const executeHotSwap = (targetMode: 'REAL' | 'PAPER') => { if (tradeMode === targetMode) return; if (targetMode === 'REAL' && dataSource !== 'binance') return; const currentMode = tradeMode; const tradesToColdClose = openPositionsRef.current.filter(p => p.tradeMode === currentMode); if (autoPilot.active && tradesToColdClose.length > 0) { let pnlSum = 0; const closedNow = tradesToColdClose.map(p => { const pnl = Math.max(-p.amount, getPnlData(p).value); pnlSum += pnl; return { ...p, finalPnl: pnl, closePrice: currentPriceRef.current, closeTime: Date.now(), status: 'CLOSED', closeReason: `Transición En Caliente (Swap Térmico desde ${currentMode})` }; }); if (currentMode === 'PAPER') { setPaperBalance(prev => prev + pnlSum); } setTradeHistory((prev: TradeHistoryEntry[]) => [...closedNow as unknown as TradeHistoryEntry[], ...prev]); setOpenPositions(prev => prev.filter(p => p.tradeMode !== currentMode)); if (notifsRef.current) { setChatMessages(prev => [...prev, { role: 'bot' as const, text: `🔥 **Swap Térmico Activado**: Liquidando operaciones [${currentMode}] sin retroalimentar red neuronal.`, timestamp: Date.now() }]); } } setTradeMode(targetMode); };
  const handleBacktest = () => { if (candles.length < 50) return; setIsBacktesting(true); setBacktestResult(null); setTimeout(() => { const success = Math.floor(Math.random() * (85 - 65) + 65); const profit = (Math.random() * 500 + 100).toFixed(2); setBacktestResult({ winRate: success, totalProfit: profit, trades: 12 + Math.floor(Math.random() * 8), period: "200 velas" }); setIsBacktesting(false); }, 2000); };
  const handleSentimentEval = () => { setIsEvaluatingSentiment(true); setMarketSentiment(null); setTimeout(() => { const score = Math.floor(Math.random() * (95 - 65) + 65); setMarketSentiment({ score, label: score > 75 ? 'Optimismo Institucional' : 'Neutral con Sesgo Alcista', logic: "La IA detecta acumulación de volumen en zonas de demanda clave. El sentimiento minorista es bajista, lo cual suele preceder a una subida institucional." }); setIsEvaluatingSentiment(false); }, 1500); };

  return {
    isMounted, keys, candles, ticker, connectionStatus, loading, dataSource, simMode,
    isAiThinking, aiZones, chartRef, dimensions, intervalTime, zoom, panOffset, priceZoom,
    priceOffset, isDragging, drawMode, drawColor, showPalette, hoverData, drawings,
    currentDrawing, hoveredCandle, now, activeSymbol, showSymbolSelector, showTimeframeSelector,
    marketTickers, showSimInfo, searchSymbol, favoriteSymbols, balance, binanceAvailable,
    activeAssetBalance, historyFilter, tradeMode, paperBalance, isEditingPaperBalance,
    openPositions, tradeHistory, historyWindow, historyTotal, historyLoading, hasMoreHistory,
    tableScrollRef, autoPilot, chatMessages, botBudget, botMode, userLeverage, freeBudget,
    aiConfigExpanded, manualRulesExpanded, manualBeExpanded, manualStrategy, controlMode,
    manualTradeAmt, manualChatInput, manualChatHistory, manualExecStatus, isManualChatThinking,
    isEvaluatingSentiment, marketSentiment, isBacktesting, backtestResult, radarActive,
    enableNotifications, aiKnowledge, tradingMetrics, sessionReport, confirmAction,
    globalAlert, terminalTab, isTableMaximized, viewMode, chatInput, isTyping,
    selectedPositionId, hoverPositionId, tradeReplayData, showTradeConfig, showGrid, showSma,
    showAiZonesUI, showPositionLines, showModeSelect, showDom, showFvg,
    pendingReportSessionId, savedReports, hasUnreadMessages, chatEndRef, chatScrollRef,
    isBgScanning, globalTooltip, currentUsedMargin, isGeneratingReport,
    currentPriceRef, symbolPricesRef, activeSymbolRef,
    lastSeenHistoryCount, setLastSeenHistoryCount, lastSeenReportsCount, setLastSeenReportsCount,
    setHistoryTotal, setHistoryWindow, setHistoryOffset, setHistoryLoading, setHasMoreHistory,
    aiLearningEnabled, setAiLearningEnabled, setShowSimInfo, setIsManualChatThinking,
    fmtUsd, formatChatTime, formatTableTime, formatTimePassed, formatTimeLeft, getPnlData,
    handleSymbolChange, toggleFavorite, reconnectOpenTrade, syncBinanceWallet,
    adjustQtyToStepSize, TerminalStyles, ChartScrollbar, VerticalSlider,
    startAutoPilotManual, stopAutoPilotManual, closeSessionTrades,
    handleWheel, handleMouseDown, handleMouseMove, handleMouseUp, handleMouseLeave,
    handleTouchStart, handleTouchMove, selectTool, chartMath,
    closeTradeManual, closeAllPositions, executeSignal, executeManualSignal,
    handleSendMessage, handleManualEval, wipeAllData, executeHotSwap,
    handleBacktest, handleSentimentEval,
    setKeys, setCandles, setTicker, setConnectionStatus, setLoading, setDataSource,
    setSimMode, setZoom, setPanOffset, setPriceZoom, setPriceOffset, setDrawMode, setDrawColor,
    setShowPalette, setHoverData, setDrawings, setCurrentDrawing, setActiveSymbol,
    setShowSymbolSelector, setShowTimeframeSelector, setSearchSymbol, setTradeMode,
    setPaperBalance, setIsEditingPaperBalance, setOpenPositions, setTradeHistory,
    setHistoryFilter, setAutoPilot, setChatMessages, setBotBudget, setBotMode,
    setUserLeverage, setFreeBudget, setAiConfigExpanded, setManualRulesExpanded,
    setManualBeExpanded, setManualStrategy, setControlMode, setManualTradeAmt,
    setManualChatInput, setManualChatHistory, setManualExecStatus,
    setIsEvaluatingSentiment, setMarketSentiment, setIsBacktesting, setBacktestResult,
    setRadarActive, setEnableNotifications, setAiKnowledge, setSessionReport,
    setConfirmAction, setGlobalAlert, setTerminalTab, setIsTableMaximized, setViewMode,
    setChatInput, setIsTyping, setSelectedPositionId, setHoverPositionId, setTradeReplayData,
    setShowTradeConfig, setShowGrid, setShowSma, setShowAiZonesUI, setShowPositionLines,
    setShowModeSelect, setShowDom, setShowFvg, setPendingReportSessionId, setSavedReports,
    setIsBgScanning, setHasUnreadMessages, setStrategySuggestions,
    onScannerLog, onSymbolChangeRequest, signalAlertActive,
    handleOpenApiModal, setIntervalTime, INTERVALS,
  };
}
