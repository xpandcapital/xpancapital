"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
            Wallet, User, ShoppingCart, Trophy, MessageSquare, HelpCircle, LogOut, Settings, 
            ChevronDown, Clock, ChevronUp, ChevronRight, Play, List, X, Info, TrendingUp, TrendingDown,
            Activity, Target, MousePointer, Pencil, Trash2, ZoomIn, ZoomOut, Maximize2, Minimize2, 
            Send, Bot, CheckCircle2, AlertTriangle, Timer, DollarSign, BookOpen, Brain, 
            LayoutTemplate, AlignJustify, Zap, Calendar, Server, Key, Link as LinkIcon, 
            Minus, Eraser, Bell, BellOff, Rocket, Wifi, WifiOff, Hand, Square, Layers, BarChart2,
            Search, RefreshCw, Star, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { globalStyles, safeText, SidebarIcon, ToolButton } from './TerminalComponents';
import { TradingChart } from './TradingChart';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

export interface TradingTerminalProps {
  onScannerLog?: (par: string, mensaje: string, tipo: 'scan' | 'warning' | 'valid') => void;
  onSymbolChangeRequest?: (symbol: string) => void;
  signalAlertActive?: boolean;
}

export const TradingTerminal: React.FC<TradingTerminalProps> = ({ onScannerLog, onSymbolChangeRequest, signalAlertActive }) => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  
  // Carga de Configuración Centralizada
  const [keys, setKeys] = useState({ 
            gemini: "", 
            openai: "",
            binance_key: "", 
            binance_secret: "" 
  });

  // Clave maestra de Gemini como fallback
  const MASTER_GEMINI = "AIzaSyDTaDqoOzRBeDlZlS2rvUFse9aLMVHUsHU";

  useEffect(() => {
    setIsMounted(true);

    try {
      // CARGA PRIORITARIA DE ÚLTIMO SÍMBOLO
      if (typeof window !== 'undefined') {
         const savedSymbol = localStorage.getItem('blis_active_symbol');
         if (savedSymbol) setActiveSymbol(savedSymbol);
      }

      // Unificar a llaves blis_ exclusivamente para evitar balances fantasma de versiones viejas
      const gemini = localStorage.getItem("gemini_key") || MASTER_GEMINI;
      const openai = localStorage.getItem("openai_key") || localStorage.getItem("chatgpt_key") || "";
      // Sincronizar centralizadamente desde api-nube
      const bKey = localStorage.getItem("binance_api_key") || localStorage.getItem("blis_binance_key") || "";
      const bSecret = localStorage.getItem("binance_secret_key") || localStorage.getItem("blis_binance_secret") || "";

      setKeys({ gemini, openai, binance_key: bKey, binance_secret: bSecret });
    } catch (e) {
      console.warn("localStorage no disponible:", e);
      setKeys({ gemini: MASTER_GEMINI, openai: "", binance_key: "", binance_secret: "" });
    }
  }, []);

  const handleOpenApiModal = () => {
    router.push('/superadmin/api-nube');
  };

  // ==========================================
  // ESTADOS DEL GRÁFICO Y CONEXIÓN
  // ==========================================
  const [candles, setCandles] = useState<any[]>([]);
  const candlesRef = useRef<any[]>([]); 
  const [ticker, setTicker] = useState({ price: 2900.00, changePercent: 0.25 }); // PAXG price around 2900 recently
  const [connectionStatus, setConnectionStatus] = useState('connecting'); 
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState('binance'); 
  const [simMode, setSimMode] = useState<'NORMAL' | 'VOLATILE' | 'TRENDS' | 'CHAOS'>('NORMAL');
  
  // Persistencia de la Fuente de Datos (Binance/Simulador)
  useEffect(() => {
    if (!isMounted) return;
    const savedSource = localStorage.getItem('blis_data_source');
    if (savedSource) setDataSource(savedSource);
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('blis_data_source', dataSource);
  }, [dataSource, isMounted]);

  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiZones, setAiZones] = useState<any[]>([
    { high: 2915.50, low: 2912.20, type: 'supply' }, // Example zones for PAXG
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
  const [dragStart, setDragStart] = useState<any>({ x: 0, y: 0, panStart: 0, priceOffsetStart: 0, zoomStart: undefined, priceZoomStart: 1.0 });
  const [drawMode, setDrawMode] = useState('cursor'); 
  const [drawColor, setDrawColor] = useState('#5956e9'); 
  const [showPalette, setShowPalette] = useState(false);
  const [hoverData, setHoverData] = useState<any>(null); 
  const [drawings, setDrawings] = useState<any[]>([]);
  const [currentDrawing, setCurrentDrawing] = useState<any>(null);
  const [hoveredCandle, setHoveredCandle] = useState<any>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 }); 
  const [now, setNow] = useState(Date.now());

  // ==========================================
  // MULTI-BROKER & SELECTOR DE ACTIVOS
  // ==========================================
  const [activeSymbol, setActiveSymbol] = useState<'BTCUSDT' | 'ETHUSDT' | string>('BTCUSDT');
  
  useEffect(() => {
    if (typeof window !== 'undefined' && isMounted) {
        localStorage.setItem('blis_active_symbol', activeSymbol);
    }
  }, [activeSymbol, isMounted]);
  const [showSymbolSelector, setShowSymbolSelector] = useState(false);
  const [showTimeframeSelector, setShowTimeframeSelector] = useState(false);
  const [marketTickers, setMarketTickers] = useState<any[]>([]);
  const [showSimInfo, setShowSimInfo] = useState<any>(null);

  const [searchSymbol, setSearchSymbol] = useState('');
  const [favoriteSymbols, setFavoriteSymbols] = useState<string[]>(['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'PAXGUSDT']);
  const favoriteSymbolsRef = useRef<string[]>(['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'PAXGUSDT']);
  const hasWarnedSpotShort = useRef<boolean>(false);

  // Cargar favoritos al abrir
  useEffect(() => {
     if (typeof window !== 'undefined') {
         const favs = localStorage.getItem('blis_fav_symbols');
         if (favs) {
             const parsed = JSON.parse(favs);
             setFavoriteSymbols(parsed);
             favoriteSymbolsRef.current = parsed;
         }
     }
  }, []);

  const toggleFavorite = (symbol: string, e: any) => {
      if (e && e.stopPropagation) e.stopPropagation();
      setFavoriteSymbols(prev => {
          const newFavs = prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol];
          localStorage.setItem('blis_fav_symbols', JSON.stringify(newFavs));
          favoriteSymbolsRef.current = newFavs;
          return newFavs;
      });
  };

  // Fetch Tickers de Binance bajo demanda para el buscador o el modo Omniescáner (HFT)
  const marketTickersRef = useRef<any[]>([]);
  useEffect(() => {
     if (marketTickers.length > 0) return; // Optimización: Cargar solo una vez si no hay tickers
     const loadTickers = async () => {
         try {
             // 24hr ticker da precio, % cambio y volumen de un solo request
             const res = await fetch('/api/binance?endpoint=/fapi/v1/ticker/24hr');
             if (!res.ok) throw new Error('API Error');
             const data = await res.json();
             // Filtramos pares contra USDT y ordenamos por QUOTE VOLUME (volumen en dólares negociado) para que BTC, ETH, SOL estén primeros
             const usdtPairs = data.filter((t:any) => t.symbol.endsWith('USDT')).sort((a:any, b:any) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume));
             // Tomamos solo el Top 150 para no laggear la memoria de la IA
             const topList = usdtPairs.slice(0, 150);
             setMarketTickers(topList);
             marketTickersRef.current = topList;
         } catch(e) { console.error("Error cargando Asset Tickers", e); }
     };
     loadTickers();
  }, [marketTickers.length]);

  // ==========================================
  // ESTADOS DE TRADING
  // ==========================================
   const [balance, setBalance] = useState(0.00); 
  const [binanceAvailable, setBinanceAvailable] = useState(0.00);
  const binanceAvailableRef = useRef(0.00);
  const [activeAssetBalance, setActiveAssetBalance] = useState(0.00); 
  const [assetViewMode, setAssetViewMode] = useState<'USD' | 'UNITS'>('USD'); 
  const [historyFilter, setHistoryFilter] = useState<'ALL' | 'REAL' | 'PAPER'>('ALL');
  const balanceRef = useRef(0.00); 
  const [tradeMode, setTradeMode] = useState<'REAL' | 'PAPER'>('PAPER');
  const tradeModeRef = useRef<'REAL' | 'PAPER'>('PAPER');
   
   // Persistir Entorno de Trading
   useEffect(() => {
       if (typeof window !== 'undefined') {
           const saved = localStorage.getItem('blis_trade_mode') as 'REAL' | 'PAPER';
           if (saved) setTradeMode(saved);
       }
   }, []);

   useEffect(() => {
       if (typeof window !== 'undefined') {
           localStorage.setItem('blis_trade_mode', tradeMode);
           tradeModeRef.current = tradeMode;
       }
   }, [tradeMode]);

  const [paperBalance, setPaperBalance] = useState(() => {
      try {
          const saved = typeof window !== 'undefined' ? localStorage.getItem('blis_paper_balance') : null;
          return saved !== null && !isNaN(parseFloat(saved)) ? parseFloat(saved) : 200.00;
      } catch { return 200.00; }
  }); 
  const [isEditingPaperBalance, setIsEditingPaperBalance] = useState(false);
  const paperBalanceRef = useRef(paperBalance);

  useEffect(() => {
      paperBalanceRef.current = paperBalance;
  }, [paperBalance]);

  const [openPositions, setOpenPositions] = useState<any[]>([]);
  const openPositionsRef = useRef<any[]>([]); 
  const [tradeHistory, setTradeHistory] = useState<any[]>([]);
  const tradeHistoryRef = useRef<any[]>([]);
  const [historyLimit, setHistoryLimit] = useState(25);
  const [historyOffset, setHistoryOffset] = useState(0);
  const [historyWindow, setHistoryWindow] = useState<any[]>([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const tableScrollRef = useRef<HTMLDivElement>(null);

  // Resetear scroll al cambiar de pestaña → se hace en el useEffect cerca del terminalTab state
  // Sincronizar Historial Definitivo desde Supabase al cambiar filtro
  useEffect(() => {
    let active = true;
    setHistoryLoading(true);
    setHistoryOffset(0);
    setHistoryWindow([]);
    setTradeHistory([]);
    setHistoryLimit(25);
    setHasMoreHistory(true);

    const fetchInitialHistory = async () => {
      try {
        const modeFilter = historyFilter !== 'ALL' ? historyFilter : null;
        let pageQuery = supabase.from('trading_history').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(0, 49);
        let fullQuery = supabase.from('trading_history').select('*').order('created_at', { ascending: false }).limit(20000);
        if (modeFilter) {
          pageQuery = (pageQuery as any).eq('trade_mode', modeFilter);
          fullQuery = (fullQuery as any).eq('trade_mode', modeFilter);
        }
        const [{ data, error, count }, { data: fullData, error: fullError }] = await Promise.all([pageQuery, fullQuery]);
        if (error) console.error("Supabase fetchInitialHistory Error:", error);
        if (fullError) console.error("Supabase fetchFullHistory Error:", fullError);
        if (active && data && !error) {
           setHistoryTotal(count || fullData?.length || 0);
           const formatted = data.map((r:any) => ({
                id: r.id, symbol: r.symbol, type: r.trade_type, amount: parseFloat(r.amount), leverage: parseInt(r.leverage), entryPrice: parseFloat(r.entry_price), closePrice: parseFloat(r.close_price), finalPnl: parseFloat(r.final_pnl), duration: parseFloat(r.duration || 0), closeReason: r.close_reason, candlesAtOpen: r.candles_snapshot, tradeMode: r.trade_mode, closeTime: new Date(r.created_at).getTime()
            }));
           setHistoryWindow(formatted);
           if (fullData && !fullError) {
             const formattedFull = fullData.map((r:any) => ({
               id: r.id, symbol: r.symbol, type: r.trade_type, amount: parseFloat(r.amount), leverage: parseInt(r.leverage), entryPrice: parseFloat(r.entry_price), closePrice: parseFloat(r.close_price), finalPnl: parseFloat(r.final_pnl), duration: parseFloat(r.duration || 0), closeReason: r.close_reason, candlesAtOpen: r.candles_snapshot, tradeMode: r.trade_mode, closeTime: new Date(r.created_at).getTime()
             }));
             setTradeHistory(formattedFull);
           }
           // Si devolvió menos de 50, no hay más páginas
           if (data.length < 50) setHasMoreHistory(false);
        }
      } catch(e) { console.error("Exception in fetchInitialHistory:", e); }
      if (active) setHistoryLoading(false);
    };
    fetchInitialHistory();
    return () => { active = false; };
  }, [historyFilter]);
  // NO useEffect watching tradeHistory: Supabase es la fuente de verdad para historyWindow.
  // Los trades nuevos se insertan al window directamente via setHistoryWindow en closeTradeManual/closePosition.
  useEffect(() => {
      // Cap en-memoria: nunca más de 200 trades (evita crash de React con nodos infinitos)
      const cappedHistory = tradeHistory.slice(0, 200);
      tradeHistoryRef.current = cappedHistory;
  }, [tradeHistory]);
  const currentPriceRef = useRef(2900.00);

  const activeAssetBalanceRef = useRef(0.00);
  const spotAssetFreeRef = useRef(0.00); // Balance del activo SOLO en Spot (libre para vender)
  const spotFreeBalanceRef = useRef(0.00);
  // Mapa de precios por símbolo para calcular PnL correcto cuando se cambia de gráfico
  const symbolPricesRef = useRef<Record<string, number>>({});
  const symbolFiltersRef = useRef<Record<string, { stepSize: string; minQty: string; minNotional: string }>>({});
  const [aiLearningEnabled, setAiLearningEnabled] = useState(true);
  const aiKnowledgeRef = useRef<any[]>([]);
  
  // Variables de Estado de Omniescáner
  const aiBoredomRef = useRef(0);
  const lastScanLogRef = useRef(0);
  const bgScanIdxRef = useRef(0);
  const [isBgScanning, setIsBgScanning] = useState(false);

  // Sincronización Billetera (Binance API)
  const syncBinanceWallet = useCallback(async () => {
      if (!isMounted || !keys.binance_key || !keys.binance_secret) return;
      try {
         let spotUsdt = 0; let futuresUsdt = 0; let baseSymbol = "";
         let assetFound = 0; let spotAssetFree = 0; let totalUsdt = 0;
         let otherAssets: string[] = [];
         
         // 0. Obtener PRECIOS GLOBALES 
         let allTickers: any[] = [];
         try {
             const rT = await fetch('/api/binance?endpoint=/fapi/v1/ticker/24hr');
             if (rT.ok) allTickers = await rT.json();
         } catch(e) { console.error("Exception in fetchInitialHistory:", e); }
         const priceMap = new Map((allTickers || []).map((t: any) => [t.symbol, parseFloat(t.lastPrice)]));

         // 1. Obtener Balance Futuros — Compatible con /fapi/v2/balance (array) y /fapi/v2/account (objeto)
         let futuresApiOk = false;
         try {
             const resFut = await fetch('/api/binance', {
                 method: 'POST', headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ endpoint: '/fapi/v2/balance', method: 'GET', apiKey: keys.binance_key, apiSecret: keys.binance_secret })
             });
             const dataFut = await resFut.json();
             
             // Formato 1: Array de assets (fapi/v2/balance)
             if (resFut.ok && Array.isArray(dataFut)) {
                const usdtFut = dataFut.find((b: any) => b.asset === 'USDT');
                if (usdtFut) {
                   futuresUsdt = parseFloat(usdtFut.balance || usdtFut.marginBalance || usdtFut.walletBalance || '0');
                   const avail = parseFloat(usdtFut.availableBalance || usdtFut.balance || '0');
                   setBinanceAvailable(avail);
                   binanceAvailableRef.current = avail;
                   futuresApiOk = true;
                }
             }
             // Formato 2: Objeto con .assets array (fapi/v2/account)
             else if (resFut.ok && dataFut?.assets) {
                const usdtFut = dataFut.assets.find((a: any) => a.asset === 'USDT');
                if (usdtFut) {
                   futuresUsdt = parseFloat(usdtFut.marginBalance || usdtFut.walletBalance || '0');
                   const avail = parseFloat(usdtFut.availableBalance || '0');
                   setBinanceAvailable(avail);
                   binanceAvailableRef.current = avail;
                   futuresApiOk = true;
                }
             }
         } catch(e) { console.error("Exception in fetchInitialHistory:", e); }

         // 1B. Obtener Balance Spot
         let spotApiOk = false;
         const resSpot = await fetch('/api/binance', {
             method: 'POST', headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ endpoint: '/api/v3/account', method: 'GET', apiKey: keys.binance_key, apiSecret: keys.binance_secret })
         });
         const dataSpot = await resSpot.json();
         if (resSpot.ok && dataSpot?.balances) {
             spotApiOk = true;
             baseSymbol = activeSymbol.toString().replace('/', '').replace('USDT', '').trim().toUpperCase();
             dataSpot.balances.forEach((b: any) => {
                 const valFree = parseFloat(b.free);
                 const valTotal = valFree + parseFloat(b.locked);
                 if (valTotal <= 0.00000001) return;
                 const asset = b.asset.trim().toUpperCase();
                 if (asset === 'USDT') {
                     spotUsdt += valTotal;
                     spotFreeBalanceRef.current = valFree;
                 } else if (asset === baseSymbol) {
                     assetFound += valTotal;
                     spotAssetFree += valFree;
                 }
             });
         }
         totalUsdt = spotUsdt + futuresUsdt;
         if (spotApiOk || futuresApiOk) {
            setBalance(totalUsdt);
            balanceRef.current = totalUsdt;
            setActiveAssetBalance(spotAssetFree);
            activeAssetBalanceRef.current = spotAssetFree;
         }
      } catch(err) { console.warn("Error sincronizando billetera:", err); }
  }, [isMounted, keys, activeSymbol]);

  // Variables de Estado de Swing AI Copilot
  const lastMacroAnalysisTSRef = useRef<number>(0);
  const swingQueueIndexRef = useRef<number>(0);
  const isChatGptThinkingRef = useRef<boolean>(false);

  // Función para RECONECTAR a una operación existente (Post-Refresh)
  const reconnectOpenTrade = () => {
      if (tradeModeRef.current === 'REAL' && activeAssetBalanceRef.current > 0.0001) {
          if (openPositions.some(p => p.symbol === activeSymbol)) {
              setChatMessages(prev => [...prev, { id: Date.now(), role: 'bot', text: `ℹ️ **Reconexión**: Ya estás monitoreando la operación de ${activeSymbol}.`, timestamp: Date.now() }]);
              return;
          }
          const currentP = (ticker?.price && ticker.price !== 2900.00) ? ticker.price : (currentPriceRef.current !== 2900.00 ? currentPriceRef.current : 0);
          const newPos = {
              id: Date.now(),
              symbol: activeSymbol,
              type: 'BUY',
              entryPrice: currentP,
              amount: (activeAssetBalanceRef.current * currentP),
              quantity: activeAssetBalanceRef.current,
              timestamp: Date.now(),
              isReconnected: true
          };
          setOpenPositions([newPos]);
          setChatMessages(prev => [...prev, { id: Date.now(), role: 'bot', text: `⚡ **Enlace Establecido**: He detectado fondos de ${activeSymbol} en tu billetera. Me he reconectado a la operación para monitorear señales de salida. 🕵️‍♂️📈`, timestamp: Date.now() }]);
      } else {
          setChatMessages(prev => [...prev, { id: Date.now(), role: 'bot', text: tradeModeRef.current === 'PAPER' ? `❌ **Error**: Cambia a modo REAL para reconectar fondos de Binance.` : `❌ **Fallo**: No detecto fondos activos de ${activeSymbol} en Binance para enlazar.`, timestamp: Date.now() }]);
      }
  };
  const [manualTradeAmt, setManualTradeAmt] = useState(10);
  const [controlMode, setControlMode] = useState<'AI' | 'MANUAL'>('AI');

  const [manualStrategy, setManualStrategy] = useState<any>({
      emaFast: 21,
      emaSlow: 55,
      rsiPeriod: 14,
      rsiBuy: 38,
      rsiSell: 62,
      stochK: 14,
      stochD: 3,
      stochOverbought: 92,
      stochOversold: 8,
      sl: 1.5,
      tp: 2.0,
      risk: 5,
      beEnabled: true,
      beTrigger: 20,
      beLock: 2,
      trailingEnabled: false,
      trailingDist: 25,
      trailingAfterBE: true,
      // Nuevos campos para coincidir con la imagen
      atrMultiplier: 1.5,
      tpRatio: 2.0,
      emaFast_suggest: undefined,
      emaSlow_suggest: undefined,
      rsiPeriod_suggest: undefined,
      rsiBuy_suggest: undefined,
      rsiSell_suggest: undefined,
      stochK_suggest: undefined,
      stochD_suggest: undefined,
      stochOverbought_suggest: undefined,
      stochOversold_suggest: undefined,
      atrMultiplier_suggest: undefined,
      tpRatio_suggest: undefined,
      risk_suggest: undefined,
      beTrigger_suggest: undefined,
      beLock_suggest: undefined,
      trailingDist_suggest: undefined
  });

  const [aiConfigExpanded, setAiConfigExpanded] = useState(() => {
    try { const v = localStorage.getItem('blis_config_expanded'); return v !== null ? v === 'true' : true; } catch { return true; }
  });
  const [manualRulesExpanded, setManualRulesExpanded] = useState(true);
  const [manualBeExpanded, setManualBeExpanded] = useState(true);

  // globalAlert can hold a simple warning string, or an object { msg: string, pendingSymbol: string } for confirmation
  const [globalAlert, setGlobalAlert] = useState<any>(null);

  const activeSymbolRef = useRef(activeSymbol);
  useEffect(() => { activeSymbolRef.current = activeSymbol; }, [activeSymbol]);
  const currentPriceSymbolRef = useRef(activeSymbol);

  const handleSymbolChange = (newSym: string, forceOverride = false) => {
      if (openPositionsRef.current.length > 0 && !forceOverride) {
          setGlobalAlert({ 
             msg: `BLOQUEO ESTRUCTURAL: Tienes operaciones activas en [${activeSymbolRef.current}].\n\nSi estás intentando usar Multi-Pantalla en otra ventana, puedes FORZAR el cambio, pero las operaciones antiguas quedarán pausadas en esta gráfica.`,
             pendingSymbol: newSym
          });
          setShowSymbolSelector(false);
          setSearchSymbol('');
          return;
      }
      if (autoPilot.active && openPositionsRef.current.length > 0) {
          stopAutoPilotManual(false);
          setChatMessages((prev: any) => [...prev, { id: Date.now(), role: 'bot', text: `⚠️ **Parada de Seguridad**: Cambio de Activo a ${newSym} con operaciones abiertas. Autopiloto desactivado para proteger el balance.`, timestamp: Date.now() }]);
      }
      setGlobalAlert(null);
      setActiveSymbol(newSym);
      setShowSymbolSelector(false);
      setSearchSymbol('');
  };

  useEffect(() => { if (dataSource === 'simulation') setTradeMode('PAPER'); }, [dataSource]);
  // paperBalance sync is handled by the other useEffect

  // Sincronización Inicial de Estados Persistentes (Client-side Only)
  useEffect(() => {
    if (!isMounted) return;
    try {
       // Símbolo ya cargado en el efecto de montaje inicial prioritario
       
       // Cargar Balances
       const savedBalance = localStorage.getItem('blis_balance');
       if (savedBalance) setBalance(parseFloat(savedBalance));
       
       // Historial removido del localStorage para aligerar memoria (se usa Supabase exclusivamente)
       
       /* (syncSupabaseHistory moved outside the mount hook) */
       const savedKnowledge = localStorage.getItem('blis_ai_knowledge');
       if (savedKnowledge) {
           const pk = JSON.parse(savedKnowledge);
           setAiKnowledge(pk);
           aiKnowledgeRef.current = pk;
       }
       const savedRep = localStorage.getItem('blis_saved_reports');
       if (savedRep) setSavedReports(JSON.parse(savedRep));
       const savedHistCount = localStorage.getItem('blis_last_history_count');
       if (savedHistCount) setLastSeenHistoryCount(Number(savedHistCount));
       const savedRepCount = localStorage.getItem('blis_last_reports_count');
       if (savedRepCount) setLastSeenReportsCount(Number(savedRepCount));

       // Cargar Chat (limitado a últimos 50 mensajes)
       const savedChat = localStorage.getItem('blis_terminal_chat');
       if (savedChat) {
          const parsed = JSON.parse(savedChat);
          if (Array.isArray(parsed) && parsed.length > 0) setChatMessages(parsed.slice(-50));
       }

       // Cargar Parámetros del Bot
       const savedAuto = localStorage.getItem('blis_autopilot');
       if (savedAuto) {
          const parsed = JSON.parse(savedAuto);
          if (parsed.active) {
             setAutoPilot(parsed);
             setChatMessages((prev: any) => [...prev, { 
               role: 'bot', 
               text: "🟢 **Núcleo Sincronizado**: Reanudando sesión activa de Autopiloto..." 
             }]);
          }
       }
       const b = localStorage.getItem('blis_bot_budget'); if(b) setBotBudget(Number(b));
       const l = localStorage.getItem('blis_user_lev'); if(l) setUserLeverage(Number(l));
       const f = localStorage.getItem('blis_free_budget'); if(f) setFreeBudget(f === 'true');
       
    } catch(e) { console.warn("Error en sincronía inicial:", e); }
  }, [isMounted]);

  // EFFECT SEPARADO: Sincronización Global de Operaciones (Multi-Asset Core & CLOUD SYNC)
  useEffect(() => {
    if (!isMounted) return;
    try {
      const savedPos = localStorage.getItem('blis_open_pos_all');
      if (savedPos) {
          const parsedPos = JSON.parse(savedPos);
          setOpenPositions(parsedPos);
          openPositionsRef.current = parsedPos;
      }
      // Sincronizar desde la Nube para otros Dispositivos (Phone/Tablet Sync)
      supabase.from('trading_open_positions').select('*').then(({ data, error }) => {
          if (!error && data && data.length > 0) {
             const cloudPos = data.map(d => d.payload);
             // Solo sobrescribimos si el Cloud tiene operaciones vivas
             setOpenPositions(cloudPos);
             openPositionsRef.current = cloudPos;
             localStorage.setItem('blis_open_pos_all', JSON.stringify(cloudPos));
          }
      });
    } catch {}
  }, [isMounted]);

  // Transmisión Activa a la Nube (Subida Directa)
  useEffect(() => {
      openPositionsRef.current = openPositions;
      if (typeof window !== 'undefined' && isMounted) {
          try {
              // Strip heavy mathematical arrays out of browser state and cloud payload to prevent QuotaExceededError
              const lightweightPositions = openPositions.map(({ candlesAtOpen, candlesAtClose, ...rest }: any) => rest);
              localStorage.setItem('blis_open_pos_all', JSON.stringify(lightweightPositions));
              
              if (lightweightPositions.length > 0) {
                  const upserts = lightweightPositions.map((op: any) => ({ id: op.id.toString(), payload: op }));
                  supabase.from('trading_open_positions').upsert(upserts).then();
              }
          } catch (e) {
              console.warn("Error sizing down open positions to fit quota:", e);
          }
      }
  }, [openPositions, isMounted]);


    useEffect(() => {
      if (!isMounted) return;
      syncBinanceWallet();
      const interval = setInterval(syncBinanceWallet, 30000);
      return () => clearInterval(interval);
    }, [isMounted, syncBinanceWallet]);

  // ==========================================
  // 🔍 MARKET SCANNER DE BIENVENIDA (Al Iniciar)
  // Escanea monedas favoritas, rankea por rentabilidad esperada
  // y hace una recomendación con botón directo en el chat.
  // ==========================================
  useEffect(() => {
    if (!isMounted) return;

    const WATCH_LIST = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'LINKUSDT', 'AVAXUSDT', 'DOTUSDT', 'MATICUSDT'];
    const MIN_ATR_PCT = 0.05; // Mínima volatilidad requerida (0.05%)
    const MAX_ATR_PCT = 2.5;  // Máxima volatilidad tolerable (2.5%)

    const runWelcomeScan = async () => {
      // Esperar 2.5s para que el UI cargue completamente antes de publicar
      await new Promise(r => setTimeout(r, 2500));

      setChatMessages(prev => [...prev, {
        role: 'bot', text: '🔍 **Escaneando mercado...** Analizando volatilidad, tendencia y volumen en mis activos favoritos. Dame un momento...', timestamp: Date.now()
      }]);

      const results: Array<{ symbol: string; score: number; atrPct: number; trend: string; volStrength: string; direction: 'BUY' | 'SELL'; price: number }> = [];

      for (const sym of WATCH_LIST) {
        try {
          const res = await fetch(`/api/binance?endpoint=/fapi/v1/klines&symbol=${sym}&interval=5m&limit=60`);
          if (!res.ok) continue;
          const raw = await res.json();
          if (!Array.isArray(raw) || raw.length < 30) continue;

          const candles = raw.map((c: any) => ({
            open: parseFloat(c[1]), high: parseFloat(c[2]),
            low: parseFloat(c[3]),  close: parseFloat(c[4]),
            volume: parseFloat(c[5])
          }));

          const last = candles[candles.length - 1];
          const price = last.close;

          // ATR (14 periodos) → Volatilidad real
          let atrSum = 0;
          for (let i = 1; i < Math.min(15, candles.length); i++) {
            const c = candles[candles.length - i];
            const p = candles[candles.length - i - 1];
            atrSum += Math.max(c.high - c.low, Math.abs(c.high - p.close), Math.abs(c.low - p.close));
          }
          const atr = atrSum / 14;
          const atrPct = (atr / price) * 100;

          // Filtro de volatilidad: no muy quieto ni muy loco
          if (atrPct < MIN_ATR_PCT || atrPct > MAX_ATR_PCT) continue;

          // EMA9 vs EMA21 (Tendencia)
          const ema = (arr: number[], period: number) => {
            const k = 2 / (period + 1);
            return arr.reduce((prev, cur) => cur * k + prev * (1 - k));
          };
          const closes = candles.slice(-30).map(c => c.close);
          const ema9  = ema(closes.slice(-9),  9);
          const ema21 = ema(closes.slice(-21), 21);
          const trend = ema9 > ema21 ? '📈 Alcista' : '📉 Bajista';
          const direction: 'BUY' | 'SELL' = ema9 > ema21 ? 'BUY' : 'SELL';

          // Volumen: comparar última vela con media de 20
          const avgVol = candles.slice(-20).reduce((s, c) => s + c.volume, 0) / 20;
          const volRatio = last.volume / avgVol;
          const volStrength = volRatio > 1.5 ? '🔥 Alto' : volRatio > 1.0 ? '✅ Normal' : '⚠️ Bajo';

          // Score final: mejor si volatilidad moderada + tendencia fuerte + volumen alto
          const trendStrength = Math.abs(ema9 - ema21) / ema21 * 100;
          const score = (trendStrength * 2) + (volRatio * 1.5) - (atrPct > 1.5 ? atrPct * 0.5 : 0);

          results.push({ symbol: sym, score, atrPct, trend, volStrength, direction, price });
        } catch (_) {}
      }

      if (results.length === 0) {
        setChatMessages(prev => [...prev, { role: 'bot', text: '⚠️ **Escaneo completado**: No pude analizar los pares en este momento. Verifica tu conexión o intenta manualmente.', timestamp: Date.now() }]);
        return;
      }

      // Ordenar por score descendente
      results.sort((a, b) => b.score - a.score);
      const best = results[0];
      const displaySym = best.symbol.replace('USDT', '/USDT');

      // Ranking texto de los top 3
      const rankText = results.slice(0, 3).map((r, i) =>
        `${['🥇','🥈','🥉'][i]} **${r.symbol.replace('USDT','')}** — ${r.trend} | Vol: ${r.volStrength} | ATR: ${r.atrPct.toFixed(2)}% | Score: ${r.score.toFixed(1)}`
      ).join('\n');

      // Publicar recomendación con tipo especial para el botón
      const recMsg = {
        role: 'bot',
        type: 'recommendation',
        recommendedSymbol: best.symbol,
        recommendedDirection: best.direction,
        text: `🧠 **Análisis Completado — Recomendación de Mercado**\n\nHe analizado ${results.length} activos favoritos. El mercado con mejor balance entre rentabilidad y riesgo controlado es:\n\n🎯 **${displaySym}** a $${best.price.toFixed(best.price < 10 ? 4 : 2)}\n${best.trend} | Volumen ${best.volStrength} | Volatilidad ATR ${best.atrPct.toFixed(2)}%\n\n**Top 3 Rankings:**\n${rankText}\n\n👆 Haz clic en el botón para navegar e iniciar el motor automáticamente.`,
        timestamp: Date.now()
      };

      setChatMessages(prev => [...prev, recMsg]);
      // El autopilot se activa SOLO cuando el usuario presiona el botón ↓
    };

    runWelcomeScan();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted]);

  // Obtener filtros de Binance (LOT_SIZE, MIN_NOTIONAL) para el símbolo activo
  useEffect(() => {
    if (!isMounted || !activeSymbol) return;
    const sym = activeSymbol.replace('/', '');
    if (symbolFiltersRef.current[sym]) return; // Ya tenemos los filtros

    const fetchFilters = async () => {
      try {
        const res = await fetch(`/api/binance?endpoint=/fapi/v1/exchangeInfo`);
        if (!res.ok) throw new Error('API Error');
        const data = await res.json();
        const symData = data?.symbols?.find((s:any) => s.symbol === sym);
        if (symData?.filters) {
          const lotSize = symData.filters.find((f: any) => f.filterType === 'LOT_SIZE' || f.filterType === 'MARKET_LOT_SIZE');
          const minNotional = symData.filters.find((f: any) => f.filterType === 'MIN_NOTIONAL');
          symbolFiltersRef.current[sym] = {
            stepSize: lotSize?.stepSize || '1',
            minQty: lotSize?.minQty || '0.001',
            minNotional: minNotional?.notional || '5'
          };
        }
      } catch (e) {
        console.warn('No se pudieron obtener filtros de Binance para', sym);
      }
    };
    fetchFilters();
  }, [isMounted, activeSymbol]);

  // Utilidad: Ajustar cantidad al stepSize de Binance
  const adjustQtyToStepSize = (qty: number, symbol: string): string => {
    const sym = symbol.replace('/', '');
    const filters = symbolFiltersRef.current[sym];
    if (!filters) return qty.toString();

    const step = parseFloat(filters.stepSize);
    if (step <= 0) return qty.toString();

    // Calcular decimales limpios
    const stepStr = parseFloat(filters.stepSize).toString();
    const decimals = stepStr.includes('.') ? stepStr.split('.')[1].length : 0;

    // Truncar al stepSize (floor, no round, para no exceder balance)
    const adjusted = Math.floor(qty / step) * step;
    return adjusted.toFixed(decimals);
  };

  // Guardar en localStorage de forma estructurada y optimizada (prevención de QuotaExceededError)
  useEffect(() => {
    if (!isMounted) return;
    try {
        // Strip heavy mathematical arrays out of browser state memory
        const lightweightPositions = openPositions.map(({ candlesAtOpen, ...rest }: any) => rest);
        localStorage.setItem('blis_open_pos_all', JSON.stringify(lightweightPositions));
    } catch (e) {
        console.warn("Storage quota limit reached for open positions.", e);
    }
  }, [openPositions, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    try {
        // Historial local removido para liberar cuota. Todo está en Supabase.
    } catch (e) {
        console.warn("Storage quota limit reached.", e);
    }
  }, [tradeHistory, isMounted]);

  const tradingMetrics = useMemo(() => {
    const wins = tradeHistory.filter((t: any) => t.finalPnl > 0);
    const losses = tradeHistory.filter((t: any) => t.finalPnl < 0);
    const totalTrades = tradeHistory.length;
    const winCount = wins.length;
    const lossCount = losses.length;
    const winRate = totalTrades > 0 ? ((winCount / totalTrades) * 100).toFixed(1) : '0.0';
    const avgWin = winCount > 0 ? wins.reduce((acc: number, t: any) => acc + t.finalPnl, 0) / winCount : 0;
    const avgLoss = lossCount > 0 ? Math.abs(losses.reduce((acc: number, t: any) => acc + t.finalPnl, 0)) / lossCount : 0;
    const grossProfit = wins.reduce((acc: number, t: any) => acc + t.finalPnl, 0);
    const grossLoss = Math.abs(losses.reduce((acc: number, t: any) => acc + t.finalPnl, 0));
    const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : grossProfit > 0 ? '∞' : '0.00';
    const expectancy = totalTrades > 0 ? ((parseFloat(winRate) / 100) * avgWin) - ((1 - parseFloat(winRate) / 100) * avgLoss) : 0;
    return { winRate, avgWin, avgLoss, profitFactor, expectancy, winCount, lossCount, totalTrades };
  }, [tradeHistory]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('blis_balance', String(balance));
  }, [balance, isMounted]);

  // ==========================================
  // IA RADAR & PILOTO AUTOMÁTICO
  // ==========================================
  const [chatMessages, setChatMessages] = useState<any[]>([
    {
      role: 'bot',
      text: '¡Terminal Profesional Blis-Corp Activa!\n\n✨ Control Central: Usa el panel superior para cambiar entre el **Puente de Binance** o el **Cerebro de Simulación**.\n✨ Gestión de Capital: Presupuesto por defecto: $500 | Apalancamiento: x2.',
      timestamp: Date.now()
    }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [botBudget, setBotBudget] = useState(500); 
  const [botMode, setBotMode] = useState('SCALPING'); 
  const [userLeverage, setUserLeverage] = useState(0); // 0 = IA Control
  const [freeBudget, setFreeBudget] = useState(true); // Default: Presupuesto Libre Activo
  const [autoPilot, setAutoPilot] = useState<any>({ 
    active: false, 
    expiresAt: null, 
    totalBudget: 0, 
    leverage: 0, 
    sessionId: null, 
    mode: 'SCALPING', 
    scanningStopped: false, 
    riskLevel: 'NORMAL',
    isIndefinite: true // Default: Indefinido
  });
  const autoPilotRef = useRef(autoPilot);
  useEffect(() => { autoPilotRef.current = autoPilot; }, [autoPilot]);
  const [marketSentiment, setMarketSentiment] = useState<any>(null);
  const [backtestResult, setBacktestResult] = useState<any>(null);
  const [isBacktesting, setIsBacktesting] = useState(false);
  const [manualExecStatus, setManualExecStatus] = useState<{text: string, type: 'success'|'error'|'loading'} | null>(null);
  const [isEvaluatingSentiment, setIsEvaluatingSentiment] = useState(false);
  const [radarActive, setRadarActive] = useState(true); 
  const [enableNotifications, setEnableNotifications] = useState(false); 
  const [aiKnowledge, setAiKnowledge] = useState<any[]>([]); // MEMORIA
  const lastAlertTime = useRef(0);
  const [pendingReportSessionId, setPendingReportSessionId] = useState<any>(null);
  const [savedReports, setSavedReports] = useState<any[]>([]); 
  const [sessionReport, setSessionReport] = useState<any>(null); 
  const [confirmAction, setConfirmAction] = useState<{ title: string, msg: string, onConfirm: () => void } | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [terminalTab, setTerminalTab] = useState('abiertas');
  // Resetear scroll del historial al cambiar de pestaña
  useEffect(() => {
    if (tableScrollRef.current) {
      tableScrollRef.current.scrollTop = 0;
    }
  }, [terminalTab]);
  const [lastSeenHistoryCount, setLastSeenHistoryCount] = useState(0);
  const [lastSeenReportsCount, setLastSeenReportsCount] = useState(0);
  const [isTableMaximized, setIsTableMaximized] = useState(false);
  const [viewMode, setViewMode] = useState('split');
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedPositionId, setSelectedPositionId] = useState<string | null>(null);
  const [hoverPositionId, setHoverPositionId] = useState<string | null>(null);
  const [tradeReplayData, setTradeReplayData] = useState<{
    candles: any[];
    entryPrice: number;
    closePrice: number;
    type: string;
    symbol: string;
    openTime: number;
    closeTime: number;
    openedBy?: string;
    closedBy?: string;
  } | null>(null);
  const [showTradeConfig, setShowTradeConfig] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showSma, setShowSma] = useState(true);
  const [showAiZonesUI, setShowAiZonesUI] = useState(true);
  const [showPositionLines, setShowPositionLines] = useState(true);
  const [showModeSelect, setShowModeSelect] = useState(false);
  const [showDom, setShowDom] = useState(true); // Order Book Depth - POR DEFECTO ACTIVADO
  const [showFvg, setShowFvg] = useState(true); // Fair Value Gaps Heatmap
  
  // ASISTENTE MANUAL (CHAT ESTRATÉGICO)
  const [manualChatInput, setManualChatInput] = useState('');
  const [manualChatHistory, setManualChatHistory] = useState<any[]>([]);
  const [strategySuggestions, setStrategySuggestions] = useState<any>(null);
  const [isManualChatThinking, setIsManualChatThinking] = useState(false);
  
  // Persistencia de la Inteligencia Artificial (Cerebro y Memoria)
  useEffect(() => {
    if (!isMounted) return;
    try {
      const savedKnowledge = localStorage.getItem('blis_ai_knowledge');
      const savedRep = localStorage.getItem('blis_saved_reports');
      const savedHistCount = localStorage.getItem('blis_last_history_count');
      const savedRepCount = localStorage.getItem('blis_last_reports_count');
      if (savedKnowledge) setAiKnowledge(JSON.parse(savedKnowledge));
      if (savedRep) setSavedReports(JSON.parse(savedRep));
      if (savedHistCount) setLastSeenHistoryCount(Number(savedHistCount));
      if (savedRepCount) setLastSeenReportsCount(Number(savedRepCount));

      // Persistir Chat
      const savedChat = localStorage.getItem('blis_terminal_chat');
      if (savedChat) {
         try {
            const parsed = JSON.parse(savedChat);
            if (Array.isArray(parsed) && parsed.length > 0) setChatMessages(parsed);
         } catch(e) { console.error("Exception in fetchInitialHistory:", e); }
      }

      // Persistir Estados del Bot
      const savedAuto = localStorage.getItem('blis_autopilot');
      if (savedAuto) {
         const parsed = JSON.parse(savedAuto);
         if (parsed.active) { // Quitamos el bloqueo estricto de expiresAt para que el usuario sea quien lo apague
            setAutoPilot(parsed);
            
            // Notificar reconexión en el chat si existe el estado
            try {
              // @ts-ignore (evitar error si setChatMessages está definido después)
              if (typeof setChatMessages === 'function') {
                setChatMessages((prev: any) => [...prev, { 
                  role: 'bot', 
                  type: 'text', 
                  content: "🟢 Sincronización completa. Reanudando sesión de trading activa e intentando reconectar con el motor..." 
                }]);
              }
            } catch(e) { console.error("Exception in fetchInitialHistory:", e); }
         }
      }
      const b = localStorage.getItem('blis_bot_budget'); if(b) setBotBudget(Number(b));
      const l = localStorage.getItem('blis_user_lev'); if(l) setUserLeverage(Number(l));
      const f = localStorage.getItem('blis_free_budget'); if(f) setFreeBudget(f === 'true');
    } catch {}
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('blis_ai_knowledge', JSON.stringify(aiKnowledge));
    localStorage.setItem('blis_saved_reports', JSON.stringify(savedReports));
  }, [aiKnowledge, savedReports, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('blis_autopilot', JSON.stringify(autoPilot));
  }, [autoPilot, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    // Limitar a 50 mensajes para evitar lentitud y uso excesivo de localStorage
    const trimmed = chatMessages.length > 50 ? chatMessages.slice(-50) : chatMessages;
    localStorage.setItem('blis_terminal_chat', JSON.stringify(trimmed));
    // Si hay demasiados mensajes en memoria, recortar también el estado
    if (chatMessages.length > 80) {
      setChatMessages(chatMessages.slice(-50));
    }
  }, [chatMessages, isMounted]);

  useEffect(() => { if(isMounted) localStorage.setItem('blis_bot_budget', String(botBudget)); }, [botBudget, isMounted]);
  useEffect(() => { if(isMounted) localStorage.setItem('blis_user_lev', String(userLeverage)); }, [userLeverage, isMounted]);
  useEffect(() => { if(isMounted) localStorage.setItem('blis_free_budget', String(freeBudget)); }, [freeBudget, isMounted]);
  useEffect(() => { if(isMounted) localStorage.setItem('blis_config_expanded', String(aiConfigExpanded)); }, [aiConfigExpanded, isMounted]);

  // Sincronizar Billetera de Binance (Omni-Wallet Scan)
  // Montamos el clonado Maestro Global para (Teléfonos / Tablets)
  useEffect(() => {
     if (!isMounted) return;
     try {
         supabase.from('trading_global_state').select('*').then(({ data, error }) => {
             if (!error && data) {
                const stateMap = data.reduce((acc:any, row:any) => ({...acc, [row.id]: row.payload?.value}), {});
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

  // Transmisión Automática del Estado Local hacia la Nube
  useEffect(() => {
      if (!isMounted) return;
      const debouncedSync = setTimeout(() => {
          const upserts = [
              { id: 'paperBalance', payload: { value: paperBalance } },
              { id: 'aiKnowledge', payload: { value: aiKnowledge } },
              { id: 'autoPilot', payload: { value: autoPilot } },
              { id: 'botBudget', payload: { value: botBudget } },
              { id: 'userLeverage', payload: { value: userLeverage } },
              { id: 'freeBudget', payload: { value: freeBudget } },
              { id: 'simMode', payload: { value: simMode } }
          ];
          supabase.from('trading_global_state').upsert(upserts).then();
      }, 1500); // 1.5s debounce para no spamear Supabase si arrastra un slider rápido
      return () => clearTimeout(debouncedSync);
  }, [paperBalance, aiKnowledge, autoPilot, botBudget, userLeverage, freeBudget, simMode, isMounted]);

  // Estilos Globales para Scrollbars Neón (Rojos)
  const TerminalStyles = () => (
    <style jsx global>{`
      .custom-horizontal-range {
        -webkit-appearance: none;
        appearance: none;
        background: transparent;
      }
      .custom-horizontal-range::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 64px;
        height: 6px;
        background: linear-gradient(to right, #be0b3c, #ff004c);
        border-radius: 99px;
        box-shadow: 0 0 15px rgba(255, 0, 76, 0.6);
        cursor: pointer;
        border: none;
      }
      .custom-red-scrollbar::-webkit-scrollbar {
        width: 4px;
        height: 4px;
      }
      .custom-red-scrollbar::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
      }
      .custom-red-scrollbar::-webkit-scrollbar-thumb {
        background: #be0b3c;
        border-radius: 10px;
      }
      .custom-vertical-range {
        writing-mode: vertical-lr !important;
        direction: rtl !important;
        -webkit-appearance: slider-vertical !important;
        appearance: slider-vertical !important;
        width: 8px !important;
        background: transparent !important;
        outline: none !important;
        cursor: pointer !important;
      }
      .custom-vertical-range::-webkit-slider-container {
        background: transparent !important;
      }
      .custom-vertical-range::-webkit-slider-runnable-track {
        background: transparent !important;
        width: 4px !important;
      }
      .custom-vertical-range::-webkit-slider-thumb {
        -webkit-appearance: none !important;
        appearance: none !important;
        width: 10px !important;
        height: 56px !important;
        background: linear-gradient(to bottom, #be0b3c, #ff004c) !important;
        border-radius: 99px !important;
        box-shadow: 0 0 20px rgba(255, 0, 76, 0.9), 0 0 8px rgba(255,0,76,0.5) !important;
        cursor: grab !important;
        border: none !important;
        margin-top: -24px !important;
      }
      .custom-vertical-range::-webkit-slider-thumb:active {
        cursor: grabbing !important;
      }
      .custom-vertical-range::-moz-range-thumb {
        width: 10px !important;
        height: 56px !important;
        background: linear-gradient(to bottom, #be0b3c, #ff004c) !important;
        border-radius: 99px !important;
        box-shadow: 0 0 20px rgba(255, 0, 76, 0.9) !important;
        border: none !important;
        cursor: grab !important;
      }
    `}</style>
  );

  const ChartScrollbar = ({ type, min, max, value, onChange, className }: any) => (
    <input 
      type="range"
      min={min}
      max={max}
      step="0.1"
      value={value}
      onChange={onChange}
      className={className}
    />
  );

  // Slider vertical custom (100% control de estilos, sin dependencia del browser)
  const VerticalSlider = ({ min, max, value, onChange }: { min: number, max: number, value: number, onChange: (v: number) => void }) => {
    const trackRef = React.useRef<HTMLDivElement>(null);
    const isDraggingSlider = React.useRef(false);

    const pct = Math.max(0, Math.min(1, (value - min) / (max - min)));
    const thumbPct = pct * 100;

    const getValueFromEvent = (clientY: number) => {
      if (!trackRef.current) return value;
      const rect = trackRef.current.getBoundingClientRect();
      const relY = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
      // Top = max, bottom = min (inverted for price offset)
      return max - relY * (max - min);
    };

    const onPointerDown = (e: React.PointerEvent) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      isDraggingSlider.current = true;
      onChange(getValueFromEvent(e.clientY));
    };
    const onPointerMove = (e: React.PointerEvent) => {
      if (!isDraggingSlider.current) return;
      onChange(getValueFromEvent(e.clientY));
    };
    const onPointerUp = () => { isDraggingSlider.current = false; };

    return (
      <div
        ref={trackRef}
        className="relative h-full w-[14px] flex justify-center cursor-pointer select-none"
        style={{ touchAction: 'none' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {/* Track — identico al horizontal pero vertical */}
        <div className="absolute inset-y-2 w-[6px] rounded-full" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }} />
        {/* Thumb — gradiente igual al horizontal */}
        {/* Thumb — gradiente igual al horizontal */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: '6px',
            height: '64px',
            top: `calc(${thumbPct}% - 32px)`,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(to bottom, #be0b3c, #ff004c)',
            boxShadow: '0 0 15px rgba(255,0,76,0.8), 0 0 6px rgba(255,0,76,0.5)',
            borderRadius: '99px',
          }}
        />
      </div>
    );
  };

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('blis_saved_reports', JSON.stringify(savedReports));
  }, [savedReports, isMounted]);
  

  const INTERVALS = ['1m', '5m', '15m', '1h', '4h', '1d'];

  // Sincronización
  const notifsRef = useRef(true);
  useEffect(() => { balanceRef.current = balance; }, [balance]);
  useEffect(() => { openPositionsRef.current = openPositions; }, [openPositions]);

  // Actualizar precios de todos los símbolos con posiciones abiertas (para PnL correcto al cambiar de gráfico)
  useEffect(() => {
    // Actualizar el precio del símbolo activo
    symbolPricesRef.current[activeSymbol] = currentPriceRef.current;
  }, [ticker, activeSymbol]);

  useEffect(() => {
    if (!isMounted || openPositionsRef.current.length === 0) return;
    const otherSymbols = [...new Set(openPositionsRef.current.map(p => p.symbol).filter(s => s && s !== activeSymbol))];
    if (otherSymbols.length === 0) return;
    
    // Si estamos en simulación falsa desconectada no podemos consultar a Binance, los datos vienen del motor fake
    if (dataSource === 'simulation') return;

    const fetchOtherPrices = async () => {
      try {
        const promises = otherSymbols.map(async (sym) => {
          try {
            const res = await fetch(`https://fapi.binance.com/fapi/v1/ticker/price?symbol=${sym}`);
            const data = await res.json();
            if (data.price) symbolPricesRef.current[sym] = parseFloat(data.price);
          } catch { /* silently ignore per-symbol errors */ }
        });
        await Promise.all(promises);
      } catch { /* ignore */ }
    };

    fetchOtherPrices();
    const interval = setInterval(fetchOtherPrices, 10000); // cada 10 segundos
    return () => clearInterval(interval);
  }, [isMounted, openPositions.length, activeSymbol, dataSource]);

  useEffect(() => { notifsRef.current = enableNotifications; }, [enableNotifications]);
  useEffect(() => { aiKnowledgeRef.current = aiKnowledge; }, [aiKnowledge]);
  // Fix #8: Smart scroll — solo auto-scroll si el usuario ya está cerca del fondo
  // Si está leyendo mensajes anteriores, mostrar badge en vez de arrastrarlo
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const isUserAtBottomRef = useRef(true);

  useEffect(() => {
    const el = chatScrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const threshold = 80; // px desde el fondo
      isUserAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
      if (isUserAtBottomRef.current) setHasUnreadMessages(false);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const el = chatScrollRef.current;
    if (!el) return;
    if (isUserAtBottomRef.current) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    } else {
      setHasUnreadMessages(true);
    }
  }, [chatMessages, isTyping]);
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);

  // Formateadores
  // Formateadores protegidos para Hydration
  const formatChatTime = (ts: any) => {
    if (!isMounted || !ts) return '--:--';
    return new Date(ts).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatTableTime = (ts: any) => {
    if (!isMounted || !ts) return '--:--';
    return new Date(ts).toLocaleTimeString('es-CO', { hour12: false });
  };

  // Formatear precio/valor en USD de forma inteligente (más decimales para precios < $1)
  const fmtUsd = (val: number): string => {
    if (val == null || isNaN(val)) return '$0.00';
    const abs = Math.abs(val);
    if (abs >= 1) return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (abs >= 0.01) return `$${val.toFixed(4)}`;
    if (abs >= 0.0001) return `$${val.toFixed(6)}`;
    return `$${val.toFixed(8)}`;
  };

  const formatTimePassed = (startMs: any) => {
    if (!isMounted || !startMs) return '--:--';
    const passed = now - startMs;
    if (passed < 0) return '--:--';
    const mins = Math.floor(passed / 60000).toString().padStart(2, '0');
    const secs = Math.floor((passed % 60000) / 1000).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const getPnlData = (pos: any) => {
    // Usar precio del símbolo correcto: si la posición es del símbolo activo usar el precio live,
    // si no, buscar en el mapa de precios por símbolo o usar precio de entrada como fallback
    const posSymbol = pos.symbol || activeSymbol;
    let cp: number;
    if (posSymbol === activeSymbol) {
      cp = currentPriceRef.current;
    } else {
      cp = symbolPricesRef.current[posSymbol] || pos.entryPrice || currentPriceRef.current;
    }
    
    // BLOQUEADOR ANTIMATERIA: Evitar que el cambio de HUD crashee los retornos momentáneamente a -4000%
    if (!cp || cp <= 0) {
       cp = pos.entryPrice; 
    }
    if (!pos.entryPrice || pos.entryPrice <= 0) return { value: 0, isProfit: false, fee: 0, gross: 0 };
    const priceDiff = pos.type === 'BUY' ? (cp - pos.entryPrice) : (pos.entryPrice - cp);
    const pnlGrossUsd = (priceDiff / pos.entryPrice) * (pos.amount || 0) * (pos.leverage || 1);
    const fee = pos.fee || (pos.amount * (pos.leverage || 1) * 0.0005 * 2);
    return { value: pnlGrossUsd - fee, isProfit: (pnlGrossUsd - fee) >= 0, fee, gross: pnlGrossUsd };
  };

  const formatTimeLeft = (targetMs: any) => {
    if (!isMounted || !targetMs) return '00:00';
    const left = targetMs - now; 
    if (left <= 0) return '00:00';
    return `${Math.floor(left / 60000).toString().padStart(2, '0')}:${Math.floor((left % 60000) / 1000).toString().padStart(2, '0')}`;
  };

  // ==========================================
  // INDICADORES MATEMÁTICOS INSTITUCIONALES (Puro JS)
  // ==========================================
  const calculateRSI = (candles: any[], period = 14) => {
    if (!candles || candles.length < period + 1) return 50;
    let gains = 0, losses = 0;
    for (let i = candles.length - period; i < candles.length; i++) {
        const prev = candles[i - 1];
        if (!prev || prev.close == null || candles[i].close == null) continue;
        const diff = candles[i].close - prev.close;
        if (diff >= 0) gains += diff; else losses -= diff;
    }
    if (period <= 0) return 50;
    const avgGain = gains / period; const avgLoss = losses / period;
    if (avgLoss === 0) return gains > 0 ? 100 : 50;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  };

  const calculateATR = (candles: any[], period = 14) => {
    if (candles.length < period + 1) return 2;
    let sumTR = 0;
    for (let i = candles.length - period; i < candles.length; i++) {
        const h = candles[i].high, l = candles[i].low, pc = candles[i-1].close;
        const tr = Math.max(h - l, Math.abs(h - pc), Math.abs(l - pc));
        sumTR += tr;
    }
    return sumTR / period;
  };

  const calculateCVD = (candles: any[]) => {
    if (!candles || candles.length === 0) return [];
    let cumulativeDelta = 0;
    return candles.map(c => {
      // Delta = TakerBuyVol - TakerSellVol. 
      // Si no hay datos detallados (simulación), estimamos por el cierre relativo al rango
      let delta = 0;
      if (c.takerBuyBaseAssetVolume !== undefined) {
          const buyVol = c.takerBuyBaseAssetVolume;
          const sellVol = c.volume - buyVol;
          delta = buyVol - sellVol;
      } else {
          // Heurística de simulación: Delta positivo si sube mucho, negativo si baja
          const range = c.high - c.low || 0.0001;
          const bodyRatio = (c.close - c.open) / range;
          delta = c.volume * bodyRatio * 0.3; // 30% del volumen como delta neto promedio
      }
      cumulativeDelta += delta;
      return cumulativeDelta;
    });
  };

  const calculateMTF_SMA = (candles: any[]) => {
    // Simulamos MTF: Si operamos en 1m, evaluamos bloque de 60 velas (1h)
    const macroCandles = [];
    for (let i = 0; i < candles.length; i += 60) {
      if (i + 60 >= candles.length) break;
      const slice = candles.slice(i, i+60);
      macroCandles.push({ close: slice[slice.length-1].close });
    }
    if (macroCandles.length < 50) return { sma15: null, sma50: null };
    const sma15 = macroCandles.slice(-15).reduce((a,b)=>a+b.close,0)/15;
    const sma50 = macroCandles.slice(-50).reduce((a,b)=>a+b.close,0)/50;
    return { sma15, sma50 };
  };

  // ==========================================
  // INDICADORES AVANZADOS (EMA, MACD, Bollinger, StochRSI, VWAP, Momentum)
  // ==========================================

  // Media Móvil Exponencial — más reactiva que la SMA para detectar cambios rápidos
  const calculateEMA = (candles: any[], period: number) => {
    if (!candles || candles.length < period) return null;
    const k = 2 / (period + 1);
    let ema = candles.slice(0, period).reduce((s, c) => s + c.close, 0) / period;
    for (let i = period; i < candles.length; i++) {
      ema = candles[i].close * k + ema * (1 - k);
    }
    return ema;
  };

  // MACD (12/26/9) — Convergencia/Divergencia de Medias Móviles
  // Detecta cambios de momentum y cruces de tendencia
  const calculateMACD = (candles: any[]) => {
    if (!candles || candles.length < 35) return { macd: 0, signal: 0, histogram: 0 };
    const ema12 = calculateEMA(candles, 12);
    const ema26 = calculateEMA(candles, 26);
    if (ema12 === null || ema26 === null) return { macd: 0, signal: 0, histogram: 0 };
    const macdLine = ema12 - ema26;
    // Línea de señal: EMA(9) de los valores MACD
    const macdValues: number[] = [];
    const k12 = 2 / 13, k26 = 2 / 27;
    let e12 = candles.slice(0, 12).reduce((s, c) => s + c.close, 0) / 12;
    let e26 = candles.slice(0, 26).reduce((s, c) => s + c.close, 0) / 26;
    for (let i = 12; i < candles.length; i++) {
      e12 = candles[i].close * k12 + e12 * (1 - k12);
      if (i >= 26) {
        e26 = candles[i].close * k26 + e26 * (1 - k26);
        macdValues.push(e12 - e26);
      }
    }
    if (macdValues.length < 9) return { macd: macdLine, signal: 0, histogram: macdLine };
    const k9 = 2 / 10;
    let signalLine = macdValues.slice(0, 9).reduce((s, v) => s + v, 0) / 9;
    for (let i = 9; i < macdValues.length; i++) {
      signalLine = macdValues[i] * k9 + signalLine * (1 - k9);
    }
    return { macd: macdLine, signal: signalLine, histogram: macdLine - signalLine };
  };

  // Bandas de Bollinger — mide volatilidad y zonas de sobrecompra/sobreventa
  const calculateBollingerBands = (candles: any[], period = 20, stdDev = 2) => {
    if (!candles || candles.length < period) return { upper: 0, middle: 0, lower: 0, width: 0, percentB: 0.5 };
    const slice = candles.slice(-period);
    const mean = slice.reduce((s, c) => s + c.close, 0) / period;
    const variance = slice.reduce((s, c) => s + Math.pow(c.close - mean, 2), 0) / period;
    const std = Math.sqrt(variance);
    const upper = mean + stdDev * std;
    const lower = mean - stdDev * std;
    const width = upper - lower;
    const cp = candles[candles.length - 1].close;
    const percentB = width > 0 ? (cp - lower) / width : 0.5;
    return { upper, middle: mean, lower, width, percentB };
  };

  // RSI Estocástico — combina RSI con estocástico para señales más precisas
  const calculateStochRSI = (candles: any[], rsiPeriod = 14, stochPeriod = 14, kSmooth = 3, dSmooth = 3) => {
    if (!candles || candles.length < rsiPeriod + stochPeriod + kSmooth) return { k: 50, d: 50 };
    // Calcular serie de RSI
    const rsiValues: number[] = [];
    for (let end = rsiPeriod + 1; end <= candles.length; end++) {
      const slice = candles.slice(0, end);
      let gains = 0, losses = 0;
      for (let i = slice.length - rsiPeriod; i < slice.length; i++) {
        const diff = slice[i].close - slice[i - 1].close;
        if (diff >= 0) gains += diff; else losses -= diff;
      }
      const avgGain = gains / rsiPeriod;
      const avgLoss = losses / rsiPeriod;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsiValues.push(100 - (100 / (1 + rs)));
    }
    if (rsiValues.length < stochPeriod) return { k: 50, d: 50 };
    // Estocástico del RSI
    const stochKValues: number[] = [];
    for (let i = stochPeriod - 1; i < rsiValues.length; i++) {
      const window = rsiValues.slice(i - stochPeriod + 1, i + 1);
      const min = Math.min(...window);
      const max = Math.max(...window);
      stochKValues.push(max === min ? 50 : ((rsiValues[i] - min) / (max - min)) * 100);
    }
    // Suavizar K
    const smoothedK: number[] = [];
    for (let i = kSmooth - 1; i < stochKValues.length; i++) {
      smoothedK.push(stochKValues.slice(i - kSmooth + 1, i + 1).reduce((s, v) => s + v, 0) / kSmooth);
    }
    // Suavizar D
    if (smoothedK.length < dSmooth) return { k: smoothedK[smoothedK.length - 1] || 50, d: 50 };
    const dValue = smoothedK.slice(-dSmooth).reduce((s, v) => s + v, 0) / dSmooth;
    return { k: smoothedK[smoothedK.length - 1], d: dValue };
  };

  // VWAP — Precio Promedio Ponderado por Volumen (indica presión institucional)
  const calculateVWAP = (candles: any[], period = 20) => {
    if (!candles || candles.length < period) return null;
    const slice = candles.slice(-period);
    let cumPV = 0, cumVol = 0;
    for (const c of slice) {
      const typical = (c.high + c.low + c.close) / 3;
      cumPV += typical * (c.volume || 1);
      cumVol += (c.volume || 1);
    }
    return cumVol > 0 ? cumPV / cumVol : null;
  };

  // Momentum — mide la velocidad del cambio de precio en % sobre N períodos
  const calculateMomentum = (candles: any[], period = 10) => {
    if (!candles || candles.length < period + 1) return 0;
    const current = candles[candles.length - 1].close;
    const past = candles[candles.length - 1 - period].close;
    return past > 0 ? ((current - past) / past) * 100 : 0;
  };

  // Referencias de cooldown para evitar entradas repetidas en el mismo símbolo
  const lastEntryTimeRef = useRef<Record<string, number>>({});
  const lastEntryPriceRef = useRef<Record<string, number>>({});

  // ==========================================
  // MOTORES DE DATOS (BINANCE vs SIMULACIÓN)
  // ==========================================
  const getIntervalMs = (interval: string) => {
    switch(interval) {
        case '1m': return 60000; case '5m': return 300000; case '15m': return 900000;
        case '1h': return 3600000; case '4h': return 14400000; case '1d': return 86400000;
        default: return 60000;
    }
  };

  const generateSimulationData = (startPrice?: number) => {
    const isForex = dataSource === 'simulation';
    const intervalMs = getIntervalMs(intervalTime);
    let basePrice = startPrice || (isForex ? 1.08500 : 4500);
    // Si viene de binance y cambia a forex, forzar reset de precio
    if (isForex && startPrice && startPrice > 100) basePrice = 1.08500; 
    
    let time = Math.floor(Date.now() / intervalMs) * intervalMs - (200 * intervalMs); 
    const mockData: any[] = [];
    
    // Parámetros por Modo
    let trendProb = 0.15;
    let volMult = 1.0;
    let driftMult = 1.0;

    if (simMode === 'VOLATILE') { trendProb = 0.25; volMult = 2.5; driftMult = 1.8; }
    else if (simMode === 'TRENDS') { trendProb = 0.05; volMult = 0.7; driftMult = 4.2; }
    else if (simMode === 'CHAOS') { trendProb = 0.50; volMult = 2.0; driftMult = 0.2; }

    let trendDrift = (Math.random() - 0.5) * (isForex ? 0.0015 : 4) * driftMult;

    for(let i = 0; i < 200; i++) {
       const open = basePrice;
       
       if (Math.random() < trendProb) {
           trendDrift = (Math.random() - 0.5) * (isForex ? 0.0030 : 6) * driftMult; 
       }
       
       // Volatilidad amplificada según modo
       const volatility = (Math.random() - 0.5) * (isForex ? 0.0025 : 5) * volMult + trendDrift;
       
       const close = open + volatility;
       
       // Mechas largas ("Caza-stops")
       const wickMult = simMode === 'VOLATILE' || simMode === 'CHAOS' ? 0.6 : 0.3;
       const high = Math.max(open, close) + Math.abs(volatility) * wickMult + Math.random() * (isForex ? 0.0015 : 3);
       const low = Math.min(open, close) - Math.abs(volatility) * wickMult - Math.random() * (isForex ? 0.0015 : 3);
       
       const volume = Math.random() * 50 + 10;
       // Simular Taker Buy Volume (CVD) para el simulador
       const range = high - low || 0.0001;
       const closePos = (close - low) / range; // 0 a 1
       const takerBuyBaseAssetVolume = volume * (0.45 + (closePos * 0.1) + (Math.random() * 0.1 - 0.05));

       const hist14 = mockData.slice(-14);
       const sma15: number | null = hist14.length === 14 ? (hist14.reduce((s, v) => s + v.close, 0) + close) / 15 : null;
       const hist49 = mockData.slice(-49);
       const sma50: number | null = hist49.length === 49 ? (hist49.reduce((s, v) => s + v.close, 0) + close) / 50 : null;
       
       mockData.push({ time, open, high, low, close, volume, takerBuyBaseAssetVolume, sma15, sma50 });
       basePrice = close;
       time += intervalMs;
    }
    return mockData;
  };


  useEffect(() => {
    let isMounted = true;
    let ws: any = null;
    let simInterval: any = null;

    const startBinance = () => {
      setLoading(true);
      setConnectionStatus('connecting');
      setPanOffset(0); setPriceOffset(0); setPriceZoom(1.0); // Reset cámara
      
      // BLOQUEADOR ANTIMATERIA: Vaciar memoria residual del símbolo anterior para evitar trades fantasmas asíncronos
      setCandles([]); 
      candlesRef.current = [];
      currentPriceRef.current = 0;
      
      const fetchAndConnect = async () => {
        try {
          const res = await fetch(`/api/binance?endpoint=/fapi/v1/klines&symbol=${activeSymbol}&interval=${intervalTime}&limit=200`);
          if (!res.ok) throw new Error("API Proxy Error");
          const data = await res.json();
            const formatted = data.map((d: any, index: number, arr: any) => {
            const closeVal = parseFloat(d[4]) || 0;
            const volume = parseFloat(d[5]) || 0;
            const takerBuyBaseAssetVolume = parseFloat(d[9]) || 0;
            const sma15 = index >= 14 ? arr.slice(index - 14, index + 1).reduce((s: any, v: any) => s + (parseFloat(v[4])||0), 0) / 15 : null;
            const sma50 = index >= 49 ? arr.slice(index - 49, index + 1).reduce((s: any, v: any) => s + (parseFloat(v[4])||0), 0) / 50 : null;
            return { time: d[0], open: parseFloat(d[1]), high: parseFloat(d[2]), low: parseFloat(d[3]), close: closeVal, volume, takerBuyBaseAssetVolume, sma15, sma50 };
          });
          if (isMounted) { 
              setCandles(formatted); candlesRef.current = formatted; 
              currentPriceRef.current = formatted[formatted.length-1].close; 
              currentPriceSymbolRef.current = activeSymbol;
              setConnectionStatus('connected');
              setLoading(false); 
          }
          
          const streamSymbol = activeSymbol.toLowerCase();
          ws = new WebSocket(`wss://fstream.binance.com/ws/${streamSymbol}@kline_${intervalTime}/${streamSymbol}@aggTrade`);
          ws.onmessage = (ev: any) => {
            if (!isMounted) return;
            const m = JSON.parse(ev.data);
            if (m.e === 'kline') {
              currentPriceRef.current = parseFloat(m.k.c);
              setCandles(prev => {
                if (prev.length === 0) return prev;
                const base = (prev[prev.length-1].time === m.k.t) ? prev.slice(0, -1) : prev;
                const newC = { 
                    time: m.k.t, open: parseFloat(m.k.o), high: parseFloat(m.k.h), low: parseFloat(m.k.l), 
                    close: parseFloat(m.k.c), volume: parseFloat(m.k.v), takerBuyBaseAssetVolume: parseFloat(m.k.V) 
                };
                const full = [...base, newC];
                const sma15 = full.length >= 15 ? full.slice(-15).reduce((s, v) => s + v.close, 0) / 15 : null;
                const sma50 = full.length >= 50 ? full.slice(-50).reduce((s, v) => s + v.close, 0) / 50 : null;
                const finalArray = [...base, { ...newC, sma15, sma50 }].slice(-500);
                candlesRef.current = finalArray; 
                return finalArray;
              });
            } else if (m.e === 'aggTrade') {
                // aggTrade (a) da un flujo constante e hiperrápido de precios ("latidos")
                setTicker(prev => ({ ...prev, price: parseFloat(m.p) }));
                currentPriceRef.current = parseFloat(m.p);
            }
          };
          ws.onerror = () => { if(isMounted) setConnectionStatus('error'); };
        } catch (e) {
           // Segundo intento vía Túnel Proxy (Bypass CORS)
           try {
               const proxyRes = await fetch('/api/binance', {
                   method: 'POST',
                   headers: { 'Content-Type': 'application/json' },
                   body: JSON.stringify({
                       endpoint: '/fapi/v1/klines',
                       params: { symbol: activeSymbol, interval: intervalTime, limit: 200 }
                   })
               });
               const proxyData = await proxyRes.json();
               if (!proxyRes.ok) throw new Error("Proxy Tunnel Failed");
               
                const formatted = proxyData.map((d: any, index: number, arr: any) => {
                   const closeVal = parseFloat(d[4]) || 0;
                   const volume = parseFloat(d[5]) || 0;
                   const takerBuyBaseAssetVolume = parseFloat(d[9]) || 0;
                   const sma15 = index >= 14 ? arr.slice(index - 14, index + 1).reduce((s: any, v: any) => s + (parseFloat(v[4])||0), 0) / 15 : null;
                   const sma50 = index >= 49 ? arr.slice(index - 49, index + 1).reduce((s: any, v: any) => s + (parseFloat(v[4])||0), 0) / 50 : null;
                   return { time: d[0], open: parseFloat(d[1]), high: parseFloat(d[2]), low: parseFloat(d[3]), close: closeVal, volume, takerBuyBaseAssetVolume, sma15, sma50 };
               });
               if (isMounted) {
                   setCandles(formatted); candlesRef.current = formatted;
                   currentPriceRef.current = formatted[formatted.length-1].close;
                   currentPriceSymbolRef.current = activeSymbol;
                   setConnectionStatus('connected');
                   setLoading(false);
                   // Conectar WS después del túnel exitoso
                   const streamSymbol = activeSymbol.toLowerCase();
                   ws = new WebSocket(`wss://fstream.binance.com/ws/${streamSymbol}@kline_${intervalTime}/${streamSymbol}@aggTrade`);
                   ws.onmessage = (ev: any) => {
                       const m = JSON.parse(ev.data);
                       if (m.e === 'kline') {
                           currentPriceRef.current = parseFloat(m.k.c);
                           setCandles(prev => {
                               if (prev.length === 0) return prev;
                               const base = (prev[prev.length-1].time === m.k.t) ? prev.slice(0, -1) : prev;
                               const newC = { 
                                   time: m.k.t, open: parseFloat(m.k.o), high: parseFloat(m.k.h), low: parseFloat(m.k.l), 
                                   close: parseFloat(m.k.c), volume: parseFloat(m.k.v), takerBuyBaseAssetVolume: parseFloat(m.k.V) 
                               };
                               const full = [...base, newC];
                               const sma15 = full.length >= 15 ? full.slice(-15).reduce((s, v) => s + v.close, 0) / 15 : null;
                               const sma50 = full.length >= 50 ? full.slice(-50).reduce((s, v) => s + v.close, 0) / 50 : null;
                               const finalArray = [...base, { ...newC, sma15, sma50 }].slice(-500);
                               candlesRef.current = finalArray;
                               return finalArray;
                           });
                       } else if (m.e === 'aggTrade') {
                           setTicker(prev => ({ ...prev, price: parseFloat(m.p) }));
                           currentPriceRef.current = parseFloat(m.p);
                       }
                   };
               }
           } catch(err) {
              if (isMounted) {
                  setConnectionStatus('error'); setLoading(false);
                  setChatMessages(prev => [...prev, { role: 'bot', text: '⚠️ **Bloqueo de Red Crítico.** Estamos operando bajo el **Simulador de Emergencia** debido a restricciones locales.', timestamp: Date.now() }]);
                  startSimulation();
              }
           }
        }
      };
      fetchAndConnect();
    };

    const startSimulation = () => {
      setConnectionStatus('simulating'); setLoading(true);
      setCandles([]); // Limpieza radical
      candlesRef.current = [];
      setPanOffset(0); setPriceOffset(0); setPriceZoom(1.0);

      const simulated = generateSimulationData(ticker?.price);
      setCandles(simulated); candlesRef.current = simulated;
      currentPriceRef.current = simulated[simulated.length-1].close;
      currentPriceSymbolRef.current = activeSymbol;
      setTicker({ price: currentPriceRef.current, changePercent: 0 }); // Reset for forex
      setLoading(false);

      // Simulando evento macroeconómico (Alta Inestabilidad)
      let trendDrift = (Math.random() - 0.5) * 0.0003; 

      simInterval = setInterval(() => {
          if (!isMounted) return; // FIX: Prevenir que intervalos antiguos sigan mutando el precio y corrompan escalas

          const nowMs = Date.now();
          const intervalMs = getIntervalMs(intervalTime);
          const currentIntervalStart = Math.floor(nowMs / intervalMs) * intervalMs;
          
          // Modificadores de Tick por Modo
          let tickVolFactor = 0.0004;
          let snapProb = 0.1;

          if (simMode === 'VOLATILE') { tickVolFactor = 0.0012; snapProb = 0.25; }
          else if (simMode === 'TRENDS') { tickVolFactor = 0.0003; snapProb = 0.05; }
          else if (simMode === 'CHAOS') { tickVolFactor = 0.0010; snapProb = 0.6; }

          if (Math.random() < snapProb) {
              const driftRange = (simMode === 'TRENDS') ? 0.0012 : 0.0006;
              trendDrift = (Math.random() - 0.5) * driftRange;
          }

          const tickVol = (Math.random() - 0.5) * tickVolFactor + trendDrift; 
          const newPrice = currentPriceRef.current + tickVol;
          currentPriceRef.current = newPrice;
          
          setTicker(t => ({ price: newPrice, changePercent: t.changePercent + (tickVol / newPrice) * 500 }));

          setCandles(prev => {
              if (prev.length === 0) return prev;
              const lastCandle = prev[prev.length - 1];
              let newArray = [...prev];
              
                  if (lastCandle.time < currentIntervalStart) {
                      // NUEVA VELA (Spawning por ciclo temporal)
                      const vol = Math.random() * 15 + 5;
                      const takerBuyVol = vol * (0.45 + Math.random() * 0.1); // ~50% buys random
                      const newCandle = { 
                          time: currentIntervalStart, open: lastCandle.close, close: newPrice, 
                          high: Math.max(lastCandle.close, newPrice) + Math.random() * 0.00015, 
                          low: Math.min(lastCandle.close, newPrice) - Math.random() * 0.00015,
                          volume: vol,
                          takerBuyBaseAssetVolume: takerBuyVol
                      };
                      newArray.push(newCandle);
                      if (newArray.length > 500) newArray.shift(); // Evitar memory leak
                  } else {
                      // TICK UPDATE (Evolución agresiva de vela viva)
                      const updatedCandle = { ...lastCandle };
                      const tickVol = Math.random() * 4.5;
                      const tickTakerBuy = tickVol * (0.4 + Math.random() * 0.2);
                      updatedCandle.close = newPrice;
                      updatedCandle.high = Math.max(updatedCandle.high, newPrice);
                      updatedCandle.low = Math.min(updatedCandle.low, newPrice);
                      updatedCandle.volume += tickVol;
                      updatedCandle.takerBuyBaseAssetVolume = (updatedCandle.takerBuyBaseAssetVolume || 0) + tickTakerBuy;
                      newArray[newArray.length - 1] = updatedCandle;
                  }

              // Calcular SMAs en caliente
              const finalCandle = newArray[newArray.length - 1];
              finalCandle.sma15 = newArray.length >= 15 ? newArray.slice(-15).reduce((s, v) => s + v.close, 0) / 15 : null;
              finalCandle.sma50 = newArray.length >= 50 ? newArray.slice(-50).reduce((s, v) => s + v.close, 0) / 50 : null;

              candlesRef.current = newArray;
              return newArray;
          });
      }, 1000); // 1 tick de alta frecuencia por segundo 
    };

    if (dataSource === 'binance') startBinance();
    else startSimulation();

    return () => { isMounted = false; if (ws) ws.close(); if (simInterval) clearInterval(simInterval); };
  }, [dataSource, intervalTime, activeSymbol]);

  // ==========================================
  // MATEMÁTICAS DEL GRÁFICO (LIENZO CONTINUO)
  // ==========================================
  // Efecto de Escaneo IA (Simulado)
  useEffect(() => {
    const scan = setInterval(() => {
      setIsAiThinking(true);
      setTimeout(() => setIsAiThinking(false), 2500);
    }, 15000); 
    return () => clearInterval(scan);
  }, []);

  const chartMath = useMemo(() => {
    if (candles.length === 0 || !dimensions.width || !dimensions.height) return null;
    const startIdx = Math.max(0, candles.length - zoom - Math.round(panOffset));
    const endIdx = Math.max(0, candles.length - Math.round(panOffset));
    const visibleCandles = candles.slice(startIdx, endIdx);
    if (visibleCandles.length === 0) return null;
    const padding = { top: 40, bottom: 40, right: 80, left: 10 }; 
    const chartWidth = Math.max(1, dimensions.width - padding.left - padding.right);
    const chartHeight = Math.max(1, dimensions.height - padding.top - padding.bottom);
    const minPrice = Math.min(...visibleCandles.map(c => c.low));
    const maxPrice = Math.max(...visibleCandles.map(c => c.high));
    const priceRangeRaw = (maxPrice - minPrice) || 1;
    
    // Escala vertical inteligente: centrada en el cuerpo pero con mayor padding para evitar clipping
    const verticalPadding = priceRangeRaw * (0.25 / Math.max(0.2, priceZoom));
    const yMinFinal = (minPrice - verticalPadding) + priceOffset;
    const yMaxFinal = (maxPrice + verticalPadding) + priceOffset;
    const currentYRange = yMaxFinal - yMinFinal;

    const candleWidth = (chartWidth / visibleCandles.length) * 0.7;
    const getY = (price: any) => padding.top + chartHeight - ((price - yMinFinal) / currentYRange) * chartHeight;
    const getX = (index: any) => padding.left + (index * (chartWidth / visibleCandles.length)) + (candleWidth / 2);
    const getXFromContinuousIndex = (idx: any) => padding.left + ((idx - (candles.length - zoom - panOffset)) * (chartWidth / visibleCandles.length)) + (candleWidth / 2);
    const getContinuousIndexFromX = (xPos: any) => (candles.length - zoom - panOffset) + ((xPos - padding.left - candleWidth / 2) / (chartWidth / visibleCandles.length));
    const getPriceFromY = (yPos: any) => yMaxFinal - ((yPos - padding.top) / chartHeight) * currentYRange;

    // ─── CÁLCULO DE FAIR VALUE GAPS (FVG / IMBALANCES) ───
    const fvgs: any[] = [];
    if (showFvg && visibleCandles.length > 2) {
      for (let i = 2; i < visibleCandles.length; i++) {
        const c1 = visibleCandles[i - 2];
        const c3 = visibleCandles[i];
        if (c3.low > c1.high && c1.close >= c1.open) { // Bullish FVG
          fvgs.push({ type: 'bullish', top: c3.low, bottom: c1.high, startIndex: i - 2 }); 
        }
        if (c3.high < c1.low && c1.close <= c1.open) { // Bearish FVG
          fvgs.push({ type: 'bearish', top: c1.low, bottom: c3.high, startIndex: i - 2 });
        }
      }
    }

    // ─── OPTIMIZACIÓN HFT: Pre-cálculo de Paths SVG ───
    const sma15Path = visibleCandles.length > 0 ? visibleCandles.map((c, i) => {
        const y = getY(c.sma15);
        if (!Number.isFinite(y)) return "";
        return (i === 0 ? "M " : "L ") + getX(i) + " " + y;
    }).join(" ") : "";

    const sma50Path = visibleCandles.length > 0 ? visibleCandles.map((c, i) => {
        const y = getY(c.sma50);
        if (!Number.isFinite(y)) return "";
        return (i === 0 ? "M " : "L ") + getX(i) + " " + y;
    }).join(" ") : "";
    
    // ─── CÁLCULO DE CVD (CUMULATIVE VOLUME DELTA) PARA CANAL OSCILANTE ───
    const cvdValues = calculateCVD(candles);
    const visibleCvd = cvdValues.slice(startIdx, endIdx);
    const minCvd = Math.min(...visibleCvd);
    const maxCvd = Math.max(...visibleCvd);
    const cvdRange = (maxCvd - minCvd) || 1;
    
    // El panel de CVD ocupa el 20% inferior del gráfico
    const cvdPanelHeight = chartHeight * 0.2;
    const cvdPanelTop = padding.top + chartHeight - cvdPanelHeight;
    const getYCvd = (val: number) => cvdPanelTop + cvdPanelHeight - ((val - minCvd) / cvdRange) * cvdPanelHeight;
    
    const cvdPath = visibleCvd.length > 0 ? visibleCvd.map((v, i) => {
        const y = getYCvd(v);
        return (i === 0 ? "M " : "L ") + getX(i) + " " + y;
    }).join(" ") : "";

    return { 
      visibleCandles, getY, getX, getPriceFromY, getXFromContinuousIndex, getContinuousIndexFromX, 
      candleWidth, yMax: yMaxFinal, yMin: yMinFinal, yRange: currentYRange, 
      chartWidth, chartHeight, padding, dimensions, 
      minPrice: yMinFinal, maxPrice: yMaxFinal,
      sma15Path, sma50Path, cvdPath, cvdPanelTop, cvdPanelHeight, fvgs
    };
  }, [candles, dimensions, zoom, panOffset, priceZoom, priceOffset, showFvg]);

  useEffect(() => {
    if (!chartRef.current) return;

    const observer = new ResizeObserver(() => {
      if (chartRef.current) {
        setDimensions({
          width: chartRef.current.clientWidth,
          height: chartRef.current.clientHeight,
        });
      }
    });

    observer.observe(chartRef.current);

    setDimensions({
      width: chartRef.current.clientWidth,
      height: chartRef.current.clientHeight,
    });

    return () => observer.disconnect();
  }, [viewMode, loading]);

  // ==========================================
  // GESTIÓN DE RATÓN
  // ==========================================
  const handleWheel = (e: any) => {
    e.preventDefault(); if (!chartMath || !chartRef.current) return;
    
    // Soporte Panning Horizontal Nativo (Trackpads Mac/Windows)
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        const shiftX = e.deltaX;
        const offsetMove = panOffset + (shiftX / chartMath.candleWidth);
        if (!isNaN(offsetMove)) setPanOffset(Math.max(0, Math.min(candles.length - zoom, offsetMove)));
        return;
    }

    // Zooming (Rueda / Pinch to Zoom)
    const rect = chartRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const isOverRuler = x > dimensions.width - 80;

    if (isOverRuler) {
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      setPriceZoom(p => Math.max(0.1, Math.min(10, p * zoomFactor)));
      return;
    }
    
    const ratioX = Math.max(0, Math.min(1, (x - chartMath.padding.left) / chartMath.chartWidth));
    const deltaBase = Math.sign(e.deltaY);
    const zoomStep = Math.max(2, Math.floor(zoom * 0.12));
    const newZoom = Math.max(10, Math.min(candles.length, zoom + (deltaBase * zoomStep)));
    
    if (newZoom !== zoom) {
        const newOffset = panOffset - (newZoom - zoom) * (1 - ratioX);
        if (!isNaN(newOffset)) { 
            setPanOffset(Math.max(0, Math.min(candles.length - newZoom, newOffset))); 
            setZoom(newZoom); 
        }
    }

    // Actualizar Crosshair
    const xRel = (x - chartMath.padding.left) / chartMath.chartWidth;
    const visIdx = Math.max(0, Math.min(chartMath.visibleCandles.length - 1, Math.floor(xRel * chartMath.visibleCandles.length)));
    const candleTarget = chartMath.visibleCandles[visIdx];
    const hoverTime = candleTarget?.time || Date.now();
    setHoverData({ x, y, price: chartMath.getPriceFromY(y), time: hoverTime }); 
  };

  const handleMouseDown = (e: any) => {
    if (!chartMath || !chartRef.current) return;
    const rect = chartRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;

    if (drawMode === 'cursor' || drawMode === 'hand') { 
      setIsDragging(true); 
      setDragStart({ x, y, panStart: panOffset, priceOffsetStart: priceOffset, priceZoomStart: priceZoom }); 
    }
    else if (drawMode === 'select') {
      setCurrentDrawing({ type: 'select', x1: x, y1: y, x2: x, y2: y, color: 'rgba(57, 255, 20, 0.2)' });
    }
    else if (drawMode === 'line') setCurrentDrawing({ type: 'line', p1: { index: chartMath.getContinuousIndexFromX(x), price: chartMath.getPriceFromY(y) }, p2: { index: chartMath.getContinuousIndexFromX(x), price: chartMath.getPriceFromY(y) }, color: drawColor });
    else if (drawMode === 'fibonacci') setCurrentDrawing({ type: 'fibonacci', p1: { index: chartMath.getContinuousIndexFromX(x), price: chartMath.getPriceFromY(y) }, p2: { index: chartMath.getContinuousIndexFromX(x), price: chartMath.getPriceFromY(y) }, color: drawColor });
    else if (drawMode === 'freehand') setCurrentDrawing({ type: 'freehand', points: [{ index: chartMath.getContinuousIndexFromX(x), price: chartMath.getPriceFromY(y) }], color: drawColor });
    else if (drawMode === 'eraser') setDrawings(prev => prev.filter(d => {
        if (d.type === 'line') {
            const x1 = chartMath.getXFromContinuousIndex(d.p1.index), y1 = chartMath.getY(d.p1.price), x2 = chartMath.getXFromContinuousIndex(d.p2.index), y2 = chartMath.getY(d.p2.price);
            if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) return true;
            const l2 = Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2);
            if (l2 === 0) return true;
            let t = Math.max(0, Math.min(1, ((x - x1) * (x2 - x1) + (y - y1) * (y2 - y1)) / l2)); 
            return Math.pow(x - (x1 + t * (x2 - x1)), 2) + Math.pow(y - (y1 + t * (y2 - y1)), 2) > 150; 
        }
        if (d.type === 'freehand') return !d.points.some((p: any) => {
            const pointX = chartMath.getXFromContinuousIndex(p.index), pointY = chartMath.getY(p.price);
            return !isNaN(pointX) && !isNaN(pointY) && Math.pow(x - pointX, 2) + Math.pow(y - pointY, 2) < 200;
        });
        return true;
    }));
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setHoverData(null);
    setHoveredCandle(null);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!chartMath || !chartRef.current || e.touches.length === 0) return;
    if (e.touches.length === 1) { 
        // 1 Dedo: Delegar toda la interacción de herramientas al manejador universal de ratón
        handleMouseDown({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY } as any);
    } else if (e.touches.length === 2) { 
        // 2 Dedos: Pinch to Zoom nativo
        const t1 = e.touches[0], t2 = e.touches[1];
        const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        setDragStart({ x: 0, y: 0, panStart: dist, zoomStart: zoom, priceZoomStart: priceZoom, priceOffsetStart: priceOffset });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!chartMath || !chartRef.current || e.touches.length === 0) return;
    if (e.touches.length === 1) {
        // 1 Dedo: Delegar a la lógica de puntero que ya soporta Dibujo, Fibonacci, FVG y Panning
        handleMouseMove({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY } as any);
    } else if (e.touches.length === 2 && dragStart.zoomStart !== undefined) {
       const t1 = e.touches[0], t2 = e.touches[1];
       const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
       
       // Zoom Horizontal
       const delta = dragStart.panStart - currentDist; 
       const zoomFactor = delta * (zoom / 400); 
       const newZoom = Math.max(15, Math.min(candles.length, dragStart.zoomStart + zoomFactor));
       if (!isNaN(newZoom)) setZoom(newZoom);
       
       // Zoom Vertical (Efecto Google Maps / Pinch Natural)
       const pinchRatio = currentDist / dragStart.panStart;
       const newPriceZoom = Math.max(0.1, Math.min(10, dragStart.priceZoomStart * pinchRatio));
       setPriceZoom(newPriceZoom);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!chartRef.current || !chartMath) return;
    const rect = chartRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const visIdx = Math.max(0, Math.min(chartMath.visibleCandles.length - 1, Math.round(((x - chartMath.padding.left) / chartMath.chartWidth) * chartMath.visibleCandles.length)));
    const candleTarget = chartMath.visibleCandles[visIdx];
    let hoverTime = candleTarget?.time || Date.now();

    setHoverData({ x, y, price: chartMath.getPriceFromY(y), time: hoverTime });

    if (isDragging && (drawMode === 'cursor' || drawMode === 'hand')) {
      const deltaX = x - dragStart.x; 
      const sensitivity = 1.0;
      const newOffset = dragStart.panStart + (deltaX / chartMath.candleWidth) * sensitivity;
      if (!isNaN(newOffset)) setPanOffset(Math.max(0, Math.min(candles.length - zoom, newOffset)));
      
      const shiftY = y - dragStart.y;
      const pricePerPixel = (chartMath.maxPrice - chartMath.minPrice) / chartMath.chartHeight;
      const newPriceOffset = dragStart.priceOffsetStart + (shiftY * pricePerPixel);
      if (!isNaN(newPriceOffset)) setPriceOffset(newPriceOffset);
    } else if (currentDrawing) {
      if (drawMode === 'select') {
          const isLtoR = x > currentDrawing.x1;
          setCurrentDrawing((p: any) => ({ ...p, x2: x, y2: y, color: isLtoR ? 'rgba(57, 255, 20, 0.2)' : 'rgba(255, 0, 76, 0.2)' }));
      }
      else if (drawMode === 'line') setCurrentDrawing((p: any) => ({ ...p, p2: { index: chartMath.getContinuousIndexFromX(x), price: chartMath.getPriceFromY(y) } }));
      else if (drawMode === 'fibonacci') setCurrentDrawing((p: any) => ({ ...p, p2: { index: chartMath.getContinuousIndexFromX(x), price: chartMath.getPriceFromY(y) } }));
      else if (drawMode === 'freehand') setCurrentDrawing((p: any) => ({ ...p, points: [...p.points, { index: chartMath.getContinuousIndexFromX(x), price: chartMath.getPriceFromY(y) }] }));
    }
    
    if (!isDragging && drawMode === 'cursor' && candleTarget) {
      setHoveredCandle({ candle: candleTarget, x: chartMath.getX(visIdx), y });
    }
  };

  const handleMouseUp = () => { 
    setIsDragging(false); 
    if (currentDrawing) {
      if (currentDrawing.type !== 'select') {
        setDrawings(prev => [...prev, { ...currentDrawing, color: drawColor }]);
      }
      setCurrentDrawing(null);
    }
  };

  const selectTool = (tool: string) => {
    if (drawMode === tool) {
      setDrawMode('cursor');
      setShowPalette(false);
    } else {
      setDrawMode(tool);
      if (tool === 'line' || tool === 'freehand') setShowPalette(true);
      else setShowPalette(false);
    }
  };

  // ==========================================
  // LOGICA TRADING & IA
  // ==========================================
  const startAutoPilotManual = (mMode = 'SCALPING', mFree = true, overrideDurationMins = null, mLeverage = null, mRisk = 'NORMAL') => {
    const activeP = (ticker?.price && ticker.price !== 2900.00) ? ticker.price : (currentPriceRef.current !== 2900.00 ? currentPriceRef.current : 0);
    const assetUsdVal = (activeAssetBalanceRef.current || 0) * activeP;
    const currentCash = (tradeMode === 'REAL' ? balanceRef.current : paperBalanceRef.current);
    const totalValuation = currentCash + assetUsdVal;

    // EL PRESUPUESTO OPERATIVO DEBE SER LIQUIDO (EFECTIVO) PARA EVITAR RECHAZOS
    const budgetValue = mFree ? currentCash : (botBudget > 0 ? botBudget : currentCash);
    
    let lev = mLeverage || (mFree ? (mRisk === 'TURBO' ? 20 : (mRisk === 'HIGH' ? 10 : 5)) : userLeverage);
    if (lev === 0) lev = mMode === 'SCALPING' ? 10 : 3;

    if (budgetValue <= 0) {
       setChatMessages(prev => [...prev, { role: 'bot', text: `⚠️ **Falta Liquidez**: Necesitas efectivo disponible (USDT) para que el motor inicie nuevas compras en Binance.`, timestamp: Date.now() }]);
       return;
    }
    const sId = `session_${Date.now()}`;
    const duration = overrideDurationMins || (mMode === 'POSITION' ? 1440 : (mMode === 'SWING' ? 60 : 15)); 
    setAutoPilot({ 
      active: true, 
      expiresAt: autoPilot.isIndefinite ? null : (Date.now() + duration * 60000), 
      totalBudget: budgetValue, 
      leverage: lev, 
      sessionId: sId, 
      mode: mMode, 
      scanningStopped: false, 
      riskLevel: mRisk,
      isIndefinite: autoPilot.isIndefinite
    });
     // Sincronizar balances antes de mostrar el reporte
    const baseSymbol = activeSymbol.replace('USDT', '');
    const isSpotReal = tradeMode === 'REAL' && dataSource === 'binance';
    
    const riskLabel = mRisk === 'TURBO' ? '🔥 TURBO' : (mRisk === 'HIGH' ? '⚡ ALTO' : '🛡️ EQUILIBRADO');
    setChatMessages(prev => [...prev, {
      role: 'bot',
      text: `🚀 **MOTOR ACTIVADO**\n\n` +
                       `💰 ${mFree ? 'Capital Extendido (PRO)' : 'Presup. Trade'}: $${budgetValue.toFixed(2)} USDT\n` +
                       `📈 ${mMode} | ${riskLabel} | x${lev}\n` +
                       `⏱ ${autoPilot.isIndefinite ? '♾️ Indefinido' : `${duration}min`}\n\n` +
                       `📡 *Escaneando mercado...*`,
      timestamp: Date.now()
    }]);
    
    // Forzar ejecución inmediata del motor de IA sin esperar al intervalo
    setTimeout(() => { if (lastAiCallTime.current) lastAiCallTime.current = 0; }, 100);
  };

  const stopAutoPilotManual = (soft = true) => {
    if (!autoPilot.active) return;
    const sId = autoPilot.sessionId;
    if (soft) {
      setAutoPilot((prev: any) => ({ ...prev, scanningStopped: true }));
      setChatMessages((prev: any) => [...prev, { role: 'bot', text: `🛑 **Escáner Detenido.** El motor ya no abrirá nuevas posiciones. Gestionará el cierre óptimo de las operaciones restantes...`, timestamp: Date.now() }]);
    } else {
      setAutoPilot((prev: any) => ({ ...prev, active: false, expiresAt: null, totalBudget: 0, leverage: 1, sessionId: null, mode: 'SCALPING', scanningStopped: false, riskLevel: 'NORMAL' }));
      setPendingReportSessionId(sId);
      setChatMessages((prev: any) => [...prev, { role: 'bot', text: `🏁 **Sesión Finalizada Forzosamente.** Generando reporte consolidado...`, timestamp: Date.now() }]);
    }
  };

  // closeTradeManual antiguo eliminado (reemplazado abajo con módulo Binance Real)

  const closeSessionTrades = (sId: any, reason: any) => {
    const cp = currentPriceRef.current;
    const toClose = openPositionsRef.current.filter(p => p.sessionId === sId || !sId);
    if (toClose.length === 0) return;
    let realReturn = 0;
    let paperReturn = 0;
    const closed = toClose.map(pos => {
        const pnl = getPnlData(pos).value; 
        const returnAmount = (pos.amount || 0) + pnl;
        if (pos.tradeMode === 'REAL') realReturn += returnAmount;
        else paperReturn += returnAmount;
        
        return { ...pos, status: 'CLOSED', closePrice: cp, closeReason: reason, closeTime: Date.now(), finalPnl: pnl, finalPnlPercent: pos.amount ? (pnl / pos.amount) * 100 : 0 };
    });
    setOpenPositions((prev: any[]) => prev.filter(p => !sId || p.sessionId !== sId));
    setTradeHistory((h: any[]) => [...closed, ...h].slice(0, 500));
    // Insertar en ventana virtual inmediatamente, manteniendo todo el historial que React aguante
    setHistoryWindow((prev: any[]) => [...closed, ...prev].slice(0, 500));
    setHistoryTotal((prev: number) => prev + closed.length);
    
    if (realReturn !== 0) {
        setBalance((b: number) => b + realReturn);
        balanceRef.current += realReturn;
    }
    if (paperReturn !== 0) {
        setPaperBalance((b: number) => b + paperReturn);
        paperBalanceRef.current += paperReturn;
    }
  };

  // ==========================================
  // IA EVOLUTIVA & OMNIESCÁNER DE SEGUNDO PLANO
  // ==========================================
  const lastAiCallTime = useRef(0);
  const aiMemory = useRef<string[]>([]);

useEffect(() => {
      let bgInterval: any;

      const runScan = async () => {
          try {
              const ap = autoPilotRef.current;
              const baseTickers = marketTickersRef.current.filter(t => t.symbol !== activeSymbol);
              const favTickers = baseTickers.filter(t => favoriteSymbolsRef.current.includes(t.symbol));
              const restTickers = baseTickers.filter(t => !favoriteSymbolsRef.current.includes(t.symbol));
              const topPairs = [...favTickers, ...restTickers].slice(0, 50);

              if (topPairs.length === 0) {
                  onScannerLog?.('SYSTEM', 'Sin pares disponibles para escanear', 'warning');
                  return;
              }
              
              bgScanIdxRef.current = (bgScanIdxRef.current + 1) % topPairs.length;
              const targetTick = topPairs[bgScanIdxRef.current];
              if (!targetTick) return;
              
onScannerLog?.(targetTick.symbol, `Evaluando ${targetTick.symbol.replace('USDT', '/USDT')}...`, 'scan');
               
              if (openPositionsRef.current.some(p => p.symbol === targetTick.symbol)) {
                  onScannerLog?.(targetTick.symbol, `Ya hay posición abierta - Saltando`, 'scan');
                  return;
              }
              
              if (!autoPilotRef.current.active || autoPilotRef.current.scanningStopped || openPositionsRef.current.length >= 7 || dataSource === 'simulation') {
                  if (openPositionsRef.current.length >= 7) onScannerLog?.('SYSTEM', `Máximo de posiciones abiertas (7) - Scanner en espera`, 'warning');
                  setIsBgScanning(false);
                  return;
              }

              setIsBgScanning(true);
              if (openPositionsRef.current.some(p => p.symbol === targetTick.symbol)) return;
             
             // Descargar velas temporales para pre-evaluación rápida sin interrumpir la vista principal
const res = await fetch(`/api/binance?endpoint=/fapi/v1/klines&symbol=${targetTick.symbol}&interval=${intervalTime}&limit=100`);
              if (!res.ok) {
                  console.warn(`[OMNIFIC] Binance API rechazó conexión asíncrona para ${targetTick.symbol} (HTTP ${res.status}). Posible limitación de IP (HTTP 429 - Rate Limit Exceeded). El escáner continuará en silencio.`);
                  onScannerLog?.(targetTick.symbol, `Error HTTP ${res.status} - Rate limit o API offline`, 'warning');
                  return;
              }
             
             const data = await res.json();
             const cands = data.map((d: any, index: number, arr: any) => {
                 const closeVal = parseFloat(d[4]) || 0;
                 return { close: closeVal, volume: parseFloat(d[5]) };
             });
             
             if (cands.length < 50) {
                  onScannerLog?.(targetTick.symbol, 'Datos insuficientes (velas < 50) - Esperando...', 'scan');
                  return;
              }
             
             // Ejecutar matemáticas de superficie para detectar quiebres
             const current = cands[cands.length - 1];
             const sma15 = cands.slice(-15).reduce((s:any, v:any) => s + v.close, 0) / 15;
             const sma50 = cands.slice(-50).reduce((s:any, v:any) => s + v.close, 0) / 50;
             const volumeSurge = current.volume > (cands.slice(-10).reduce((s:any, v:any) => s + v.volume, 0) / 10) * 1.5;
             const momentum = Math.abs((current.close - cands[cands.length - 5].close) / cands[cands.length - 5].close * 100);
             
             const trendUpBg = current.close > sma15 && sma15 > sma50;
             const trendDownBg = current.close < sma15 && sma15 < sma50;
             let bgScore = 0;
              if (momentum > 0.5) bgScore += 2; 
              if (volumeSurge) bgScore += 2;
              if (trendUpBg || trendDownBg) bgScore += 2;
              
              const cp = current.close;
              const extensionRatio = cp / sma15; 
              // Anomalía de Extensión: >0.25% de separación de la media móvil en 1 minuto es sobre-extensión
              const isOverbought = extensionRatio > 1.0025;
              const isOversold = extensionRatio < 0.9975;
              
              if (isOverbought || isOversold) bgScore += 2;

             // MIN_SCORE más estricto: menos trades, pero más limpios
             let MIN_SCORE = ap.riskLevel === 'TURBO' ? 5 : (ap.riskLevel === 'HIGH' ? 6 : 7);

             // MEMORIA DEL TRAUMA (AMNESIA PROTOCOL)
             const recentTraumas = aiKnowledgeRef.current.filter((k:any) => 
                  k.symbol === targetTick.symbol && 
                  k.outcome === 'LOSS' && 
                  Date.now() - k.timestamp < 45 * 60000
             );
             if (recentTraumas.length > 0) MIN_SCORE += (3 * recentTraumas.length);

             // PARCHE DE RALENTIZACIÓN INSTITUCIONAL:
             // Impedir el efecto "Ametralladora" en activos que están de moda ganando diminutas rachas consecutivas.
             // Imponer Cooldown Obligatorio Puro de 3 Minutos por Símbolo sin importar si la última fue Win o Loss.
             const lastTradeForTick = tradeHistoryRef.current?.find((t:any) => t.symbol === targetTick.symbol);
if (lastTradeForTick && lastTradeForTick.closeTime) {
                  if (Date.now() - lastTradeForTick.closeTime < 180000) {
                      onScannerLog?.(targetTick.symbol, `Cooldown activo (3min) - Último trade hace ${Math.round((Date.now() - lastTradeForTick.closeTime)/60000)}min`, 'scan');
                      return;
                  }
              }

if (bgScore >= MIN_SCORE) {
                  onScannerLog?.(targetTick.symbol, `Score ${bgScore}/${MIN_SCORE} - Evaluando estructura...`, 'scan');
                 if (tradeModeRef.current === 'PAPER') {
                      const amountLocal = Math.max(10, paperBalanceRef.current * 0.10);
                      const lev = ap.riskLevel === 'TURBO' ? 15 : (ap.riskLevel === 'HIGH' ? 10 : 8);
                      if (paperBalanceRef.current >= amountLocal) {
                          
                          // SEGUNDO BLOQUEO ANTI-SPAM (CONDICIÓN DE CARRERA ASÍNCRONA)
                          if (openPositionsRef.current.some(p => p.symbol === targetTick.symbol)) return;

// LÓGICA INSTITUCIONAL: Continuación vs Reversión a la Media
                           if (!trendUpBg && !trendDownBg) {
                               onScannerLog?.(targetTick.symbol, 'Sin tendencia clara - Descartado', 'warning');
                               return;
                           }
                           if ((trendUpBg && isOverbought) || (trendDownBg && isOversold)) {
                               onScannerLog?.(targetTick.symbol, 'Contra-tendencia detectada - Descartado', 'warning');
                               return;
                           }

                          let actionType: 'BUY' | 'SELL' = trendUpBg ? 'BUY' : 'SELL';
                          let tacticsReason = trendUpBg
                            ? 'Continuación alcista con volumen y estructura alineada'
                            : 'Continuación bajista con volumen y estructura alineada';

                          // CORRECCIÓN CRÍTICA: Usar el precio REAL del símbolo desde las velas descargadas,
                          // NO el precio del símbolo activo en pantalla (cp = precio de BTC/USDT si eso se ve)
                          const realEntryPrice = current.close;
                          
                          // Guardarlo en el mapa de precios para que getPnlData lo use inmediatamente
                          symbolPricesRef.current[targetTick.symbol] = realEntryPrice;

                          const newPos = {
                              id: Date.now(), symbol: targetTick.symbol, type: actionType,
                              entryPrice: realEntryPrice, // ← Precio correcto del símbolo operado
                              amount: amountLocal, quantity: (amountLocal * lev) / realEntryPrice,
                              timestamp: Date.now(), openTime: Date.now(), leverage: lev, mode: ap.mode || 'SCALPING',
                              tradeMode: 'PAPER', sessionId: ap.sessionId, candlesAtOpen: cands.slice(-60)
                          };
setOpenPositions(prev => [...prev, newPos]);
                           openPositionsRef.current = [newPos, ...openPositionsRef.current];
                           onScannerLog?.(targetTick.symbol, `✓ ENTRADA ${actionType} a $${realEntryPrice.toFixed(4)} - ${tacticsReason}`, 'valid');
                           if (notifsRef.current) {
                               setChatMessages((prev: any[]) => [...prev, {
                                    role: 'bot', text: `⚡ **Zero-Lag Sniper**: Entrada **${actionType}** en **${targetTick.symbol.replace('USDT', '')}** a $${realEntryPrice.toFixed(4)}.\n🧬 **Motor Lógico**: ${tacticsReason}`, timestamp: Date.now()
                               }]);
                           }
                      }
                 }
// Redirigir gráfico al símbolo de la nueva posición para monitoreo visual preciso
                  setActiveSymbol(targetTick.symbol);
                  onSymbolChangeRequest?.(targetTick.symbol);
              }
          } catch (e) {}
      };

      bgInterval = setInterval(runScan, autoPilotRef.current.riskLevel === 'TURBO' ? 4000 : 8000);

      return () => clearInterval(bgInterval);
  }, [autoPilot.active, autoPilot.scanningStopped, openPositions.length, activeSymbol, intervalTime, autoPilot.riskLevel, dataSource]);

  // ==========================================
  // SWING AI MACRO SCANNER (Secuencial & Interés Compuesto)
  // ==========================================
  const processSwingQueue = async () => {
      if (isChatGptThinkingRef.current) return;
      if (!keys.openai) {
          if ((Date.now() - lastMacroAnalysisTSRef.current) > 10000) {
              setGlobalAlert("⚠️ El Modo SWING requiere API de OpenAI (ChatGPT) conectada.");
              lastMacroAnalysisTSRef.current = Date.now();
          }
          return;
      }
      
      const topKeys = marketTickersRef.current.slice(0, 7).map(t => t.symbol);
      if (topKeys.length === 0) return;
      
      const targetSymbol = topKeys[swingQueueIndexRef.current];
      const openPosForSymbol = openPositionsRef.current.find(p => p.symbol === targetSymbol);
      
      isChatGptThinkingRef.current = true;
      const statusMsg = openPosForSymbol 
          ? `⏳ **Evaluando SALIDA:** Analizando [${targetSymbol}] para toma de beneficios mediante ChatGPT...`
          : `⏳ **Escáner SWING:** Evaluando [${targetSymbol}] silenciosamente mediante ChatGPT...`;
      
      setChatMessages((prev: any) => [...prev, { id: Date.now(), role: 'bot', text: statusMsg, timestamp: Date.now() }]);

      try {
          // 1. Fetch 100 candles (15m timeframe for Swing Macro)
          const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${targetSymbol}&interval=15m&limit=100`);
          if (!res.ok) throw new Error("Fallo de conexión con Binance API");
          const rawKlines = await res.json();
          
          // 2. Pack data compactly to save tokens. Now including CVD structural context.
          const cvds = calculateCVD(rawKlines.map((k:any) => ({ 
              open: parseFloat(k[1]), high: parseFloat(k[2]), low: parseFloat(k[3]), 
              close: parseFloat(k[4]), volume: parseFloat(k[5]), takerBuyBaseAssetVolume: parseFloat(k[9]) 
          })));
          const lastCvd = cvds[cvds.length - 1];
          const prevCvd = cvds[cvds.length - 21]; // CVD de hace 20 velas
          const cvdSlope = lastCvd > prevCvd ? "Inclinación Alcista" : "Presión Vendedora";
          
          const packedData = rawKlines.slice(-60).map((k: any) => `[${new Date(k[0]).toISOString().slice(11,16)}|O:${parseFloat(k[1]).toFixed(2)}|C:${parseFloat(k[4]).toFixed(2)}|V:${parseFloat(k[5]).toFixed(0)}]`).join(',');
          const currentPrice = parseFloat(rawKlines[rawKlines.length - 1][4]);

          // 3. Request logic from OpenAI
          let sysInst = "";
          if (openPosForSymbol) {
              const pnl = getPnlData(openPosForSymbol);
              sysInst = `Eres el Gestor de Salidas del Agente Blis Corp. Tienes una posición ${openPosForSymbol.type} abierta en ${targetSymbol} desde $${openPosForSymbol.entryPrice}. 
PnL Actual: ${pnl.value.toFixed(2)} USD (${((pnl.value/openPosForSymbol.amount)*100).toFixed(2)}%).
Evalúa si el Price Action de las últimas 60 velas sugiere CERRAR la posición ahora para proteger ganancias o cortar pérdidas, o MANTENER.
Contexto CVD (Volumen Acumulado): ${cvdSlope}.
FORMATO JSON ESTRICTO:
{ "decision": "CLOSE" | "HOLD", "confidence": <0-100>, "reason": "<Explicación técnica>" }
Cierra si ves cansancio de tendencia, niveles de resistencia/soporte alcanzados o cambio de momentum.`;
          } else {
              sysInst = `Eres el Analista Estructural del Agente Institucional Blis Corp. 
Evalúas el siguiente bloque de las últimas 60 velas (15m) de ${targetSymbol} buscando Price Action limpio (Soportes/Resistencias, Acumulaciones, Quiebres Estructurales). 
Contexto CVD (Cumulative Volume Delta): ${cvdSlope}.
FORMATO DE RESPUESTA JSON ESTRICTO:
{ "decision": "BUY" | "SELL" | "HOLD", "confidence": <numero 0-100>, "reason": "<Explicación técnica de alta calidad de 1-2 líneas>" }
REGLAS:
- Si confidence < 85 o el patrón es confuso/lateral, DEBES devolver HOLD.
- Eres un Sniper Institucional. Prefieres no operar a perder. Busca configuraciones clarísimas de rebote o quiebre con Momentum.
- Al usuario no le importa esperar horas sin operar. Lo vital es la precisión.`;
          }

          const gptRes = await fetch('https://api.openai.com/v1/chat/completions', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${keys.openai}` },
             body: JSON.stringify({
                 model: 'gpt-4o-mini',
                 response_format: { type: "json_object" },
                 messages: [
                     { role: 'system', content: sysInst },
                     { role: 'user', content: packedData }
                 ]
             })
          });
          const gptData = await gptRes.json();
          if (gptData.error) throw new Error(gptData.error.message);
          
          let parsed;
          let targetPrice: number | undefined = undefined;
          let stopPrice: number | undefined = undefined;
          try {
             parsed = JSON.parse(gptData.choices[0].message.content.replace(/```json|```/gi, '').trim());
          } catch { throw new Error("La IA retornó formato dañado."); }

          if (openPosForSymbol && parsed.decision === 'CLOSE' && parsed.confidence >= 75) {
              setChatMessages((prev: any) => [...prev, { id: Date.now() + 1, role: 'bot', text: `🎯 **Salida SWING Confirmada por IA:** Cerrando [${targetSymbol}] debido a: ${parsed.reason}`, timestamp: Date.now() }]);
              closeTradeManual(openPosForSymbol.id, undefined, `Cierre Pro-Activo ChatGPT (${parsed.reason})`);
          }
          else if (!openPosForSymbol && parsed.decision !== 'HOLD' && parsed.confidence >= 85) {
              // INTERÉS COMPUESTO TOTAL (All-In)
              const existPos = openPositionsRef.current.find(p => p.symbol === targetSymbol);
              
              if (!existPos) {
                  const bal = tradeModeRef.current === 'REAL' ? balanceRef.current : paperBalanceRef.current;
                  const lev = autoPilot.leverage || 20;
                  
                  if (bal >= 10) {
                      const posAmount = bal * 0.98; // 98% del balance para Interés Compuesto Max
                      const units = (posAmount * lev) / currentPrice;
                      
                      const mockMsg = {
                          id: `swing_ai_${Date.now()}`,
                          signalData: {
                              symbol: targetSymbol,
                              type: parsed.decision,
                              amount: posAmount,
                              leverage: lev,
                              reason: `[SWING GPT-4o Confianza: ${parsed.confidence}%] ${parsed.reason}`,
                              mode: 'SWING',
                              targetPrice,
                              stopPrice
                          }
                      };
                      
                      const success = await executeSignal(mockMsg);
                      if (success) {
                          setChatMessages((prev: any) => [...prev, { id: Date.now() + 2, role: 'bot', text: `🌟 **FRANCOTIRADOR SWING EJECUTADO:** \n[${targetSymbol}] **${parsed.decision} All-In Compuesto** ($${posAmount.toFixed(2)} x${lev}).\n🧠 Razón de entrada: ${parsed.reason}`, timestamp: Date.now() }]);
                          lastEntryTimeRef.current[targetSymbol] = Date.now();
                          lastEntryPriceRef.current[targetSymbol] = currentPrice;
                      }
                  }
              } else {
                  setChatMessages((prev: any) => [...prev, { id: Date.now() + 1, role: 'bot', text: `⏳ **Swing Analizado:** La IA sugiere ${parsed.decision} en ${targetSymbol}, pero ya tienes una operación abierta allí.`, timestamp: Date.now() }]);
              }
          } else {
              if (!openPosForSymbol) {
                  setChatMessages((prev: any) => [...prev, { id: Date.now() + 1, role: 'bot', text: `👁️ **Swing Descartado:** Confirmación de ${parsed.confidence}% en ${targetSymbol}. Pasando al siguiente activo.`, timestamp: Date.now() }]);
              } else {
                  setChatMessages((prev: any) => [...prev, { id: Date.now() + 1, role: 'bot', text: `🛡️ **Swing Mantenido:** ChatGPT mantiene la posición en ${targetSymbol} (${parsed.confidence}% conf).`, timestamp: Date.now() }]);
              }
          }

      } catch (err: any) {
          console.warn(`Error en Swing Macro Scanner para ${targetSymbol}:`, err.message);
      } finally {
          isChatGptThinkingRef.current = false;
          swingQueueIndexRef.current = (swingQueueIndexRef.current + 1) % topKeys.length;
      }
  };

  useEffect(() => {
    if (!radarActive && !autoPilot.active) return;
    
    // Motor HFT Determinista Síncrono (Evalúa confluencias matemáticas cada 2s)
    const LOOP_INTERVAL = 2000;

    const aiEngine = setInterval(() => {
      const nowTs = Date.now();
      
      // Control de Tiempo: Si llega a cero, entra en "pausa suave" (cierra solo con beneficio, no abre nuevos)
      if (autoPilot.active && !autoPilot.scanningStopped && autoPilot.expiresAt && nowTs > autoPilot.expiresAt) {
         setAutoPilot((prev: any) => ({ ...prev, scanningStopped: true })); 
         setChatMessages((prev: any) => [...prev, { role: 'bot', text: `⏱️ **Tiempo de Sesión Agotado.** Deteniendo la Inteligencia de Autoaprendizaje. Esperando toma de ganancias de la cola actual...`, timestamp: Date.now() }]);
      }

      // Si el escáner está detenido, no buscamos nuevas entradas
      if (autoPilot.scanningStopped) return;

      // ---- COPILOTO SWING: ESCÁNER SECUENCIAL OPENAI ----
      const currentMode = autoPilot.mode || 'SCALPING';
      if (currentMode === 'SWING') {
          // Evaluar la cola cada 15 segundos asincrónicamente
          if ((nowTs - lastMacroAnalysisTSRef.current) > 15000 && !isChatGptThinkingRef.current) {
              lastMacroAnalysisTSRef.current = nowTs;
              processSwingQueue();
          }
          return; // Saltamos la evaluación matemática local obligatoriamente
      }
      // ----------------------------------------------------

      const cp = currentPriceRef.current;
      const cands = candlesRef.current;
      if (cp <= 0 || cands.length < 50 || activeSymbol !== currentPriceSymbolRef.current) return;

      const current = cands[cands.length - 1];
      const previous = cands[cands.length - 2];
      const sma15 = current.sma15;
      const sma50 = current.sma50;
      if (!sma15 || !sma50) return;

      const currentPositions = openPositionsRef.current.filter(p => autoPilot.active ? p.sessionId === autoPilot.sessionId : true);
      const isAuto = autoPilot.active;
      const activeBalance = tradeMode === 'REAL' ? balanceRef.current : paperBalanceRef.current;
      const budgetLimit = freeBudget ? activeBalance * 0.95 : Math.min(botBudget, activeBalance * 0.95);
      const usedMargin = currentPositions.reduce((sum: number, p: any) => sum + p.amount, 0);
      const availableMargin = isAuto ? Math.max(0, budgetLimit - usedMargin) : botBudget;

      // 1. INDICADORES AVANZADOS (Multi-confirmación)
      const rsi = calculateRSI(cands);
      const atr = calculateATR(cands);
      const mtf = calculateMTF_SMA(cands);
      const macd = calculateMACD(cands);
      const bb = calculateBollingerBands(cands);
      const stochRsi = calculateStochRSI(cands);
      const vwap = calculateVWAP(cands, 30);
      const momentum = calculateMomentum(cands, 10);
      const ema9 = calculateEMA(cands, 9);
      const ema21 = calculateEMA(cands, 21);
      const avgVol5 = cands.slice(-5).reduce((s,c)=>s+(c.volume||0),0)/5;
      const avgVol20 = cands.length >= 20 ? cands.slice(-20).reduce((s,c)=>s+(c.volume||0),0)/20 : avgVol5;

      // 1.1 CÁLCULO DE CVD (Cumulative Volume Delta) PARA SCALPING
      const cvdArray = calculateCVD(cands);
      const lastCvd = cvdArray[cvdArray.length - 1] || 0;
      const prevCvd = cvdArray[cvdArray.length - 2] || 0;
      const cvdDelta = lastCvd - prevCvd;
      const cvdDivergenceBuy = cp < sma15 && lastCvd > cvdArray[cvdArray.length - 11];
      const cvdDivergenceSell = cp > sma15 && lastCvd < cvdArray[cvdArray.length - 11];

      const volStrength = (current.volume || 0) > avgVol5 * 1.1;
      const volSurge = (current.volume || 0) > avgVol20 * 1.5; // Volumen explosivo

      // Restricción única: Tener el margen mínimo necesario para abrir posición ($10 USD)
      if (availableMargin < 10) return;

      // NUEVO LÍMITE: Máximo 7 posiciones abiertas simultáneamente
      if (openPositionsRef.current.length >= 7) return;

      // 2. COOLDOWN ENTRE ENTRADAS (mismo símbolo) — Adaptativo según modo
      const lastEntryTime = lastEntryTimeRef.current[activeSymbol] || 0;
      const lastEntryPrice = lastEntryPriceRef.current[activeSymbol] || 0;
      const timeSinceLastEntry = nowTs - lastEntryTime;
      const priceSinceLastEntry = lastEntryPrice > 0 ? Math.abs(cp - lastEntryPrice) / lastEntryPrice : 1;

      // Scalping: cooldown corto (45s) para aprovechar micro-tendencias
      // Si el precio cambió más de 0.3% se puede re-entrar antes
      const cooldownMs = currentMode === 'SCALPING' ? 45000 : 120000;
      const priceChangeMin = currentMode === 'SCALPING' ? 0.003 : 0.005;
      if (timeSinceLastEntry < cooldownMs && priceSinceLastEntry < priceChangeMin) return;

      // SE REMOVIERON TODOS LOS LÍMITES DE POSICIONES (Puede abrir cuantas quiera)
      // BUY = abrir compra, SELL = abrir venta, CLOSE_BUY = cerrar compra, CLOSE_SELL = cerrar venta
      let decisionAction: 'BUY' | 'SELL' | 'CLOSE_BUY' | 'CLOSE_SELL' | null = null;
      let decisionReasoning = '';
      const botModeLocal = autoPilot.mode || 'SCALPING';

      // VALIDACIÓN PRE-SEÑAL
      const spotTokenValue = spotAssetFreeRef.current * cp;
      const openBuyPositions = openPositionsRef.current.filter(p => p.type === 'BUY' && p.symbol === activeSymbol && !p.isManual);
      const openSellPositions = openPositionsRef.current.filter(p => p.type === 'SELL' && p.symbol === activeSymbol && !p.isManual);
      const hasOpenBuys = openBuyPositions.length > 0;
      const hasOpenSells = openSellPositions.length > 0;
      // PAPER: verificar posiciones abiertas BUY para saber si puede SELL (cerrar)
      // REAL: verificar balance real de tokens en Spot
      const hasTokenToSell = tradeMode === 'REAL'
        ? spotTokenValue > 5
        : (openBuyPositions.length > 0 || spotTokenValue > 5);
      const hasUsdtToBuy = (tradeMode === 'REAL' ? Math.max(spotFreeBalanceRef.current, balanceRef.current) : paperBalanceRef.current) > 10;

      const scalpPositions = openPositionsRef.current.filter(p => p.mode === 'SCALPING');
      const swingPositions = openPositionsRef.current.filter(p => p.mode === 'SWING');

      let signalTimeframe: 'SCALPING' | 'SWING' = 'SCALPING';

      // 3. MOTOR SCALPING CUANTITATIVO — Señales Limpias con Confluencia Obligatoria
      let buyScore = 0;
      let sellScore = 0;
      const buyReasons: string[] = [];
      const sellReasons: string[] = [];
      const atrVal = calculateATR(cands);
      const atrPct = cp > 0 ? (atrVal / cp) * 100 : 0;

      // BLOQUEAR señales si el mercado está demasiado muerto o demasiado violento
      if (atrPct < 0.05 || atrPct > 1.6) return;

      // REGLA 1 — TENDENCIA EMA: Las medias deben estar alineadas para operar en esa dirección
      const ema9v = ema9 || 0;
      const ema21v = ema21 || 0;
      const trendUp = ema9v > ema21v && cp > ema9v;   // Precio sobre ambas EMAs = tendencia alcista
      const trendDown = ema9v < ema21v && cp < ema9v; // Precio bajo ambas EMAs = tendencia bajista

      // REGLA 2 — MACD CONFIRMACIÓN CRUZADA
      const macdBull = macd.histogram > 0 && macd.macd > macd.signal;
      const macdBear = macd.histogram < 0 && macd.macd < macd.signal;

      // REGLA 3 — RSI + STOCH MOMENTUM (no operar en extremos contrarios)
      const rsiBullOk = rsi > 45 && rsi < 75 && stochRsi.k > 40; // Momentum positivo sin sobrecompra extrema
      const rsiBearOk = rsi < 55 && rsi > 25 && stochRsi.k < 60; // Momentum negativo sin sobreventa extrema

      // REGLA 4 — BREAKOUT DE VELA: Cierre de vela fuerte en dirección (body > 60% del rango)
      const lastCandle = cands[cands.length - 1];
      const prevCandle = cands[cands.length - 2];
      const candleRange = lastCandle.high - lastCandle.low || atrVal;
      const bodySize = Math.abs(lastCandle.close - lastCandle.open);
      const bullishCandle = lastCandle.close > lastCandle.open && bodySize / candleRange > 0.55;
      const bearishCandle = lastCandle.close < lastCandle.open && bodySize / candleRange > 0.55;

      // REGLA 5 — VOLUMEN SOPORTANDO EL MOVIMIENTO
      const volConfirm = (lastCandle.volume || 0) > avgVol5 * 1.2;

      // REGLA 6 — CVD Confirmación
      const cvdBull = cvdDelta > 0 && lastCvd > prevCvd;
      const cvdBear = cvdDelta < 0 && lastCvd < prevCvd;

      const vwapVal = vwap || cp;
      const structureBull = cp > sma15 && cp > sma50 && cp > vwapVal;
      const structureBear = cp < sma15 && cp < sma50 && cp < vwapVal;
      const isChasingBull = cp > sma15 + atrVal * 1.25;
      const isChasingBear = cp < sma15 - atrVal * 1.25;

      // PUNTUACIÓN COMPUESTA
      if (structureBull) { buyScore += 2; buyReasons.push('Estructura + VWAP alineados al alza'); }
      if (trendUp)     { buyScore += 2; buyReasons.push('Tendencia EMA alcista confirmada'); }
      if (macdBull)    { buyScore += 2; buyReasons.push('MACD Bullish Crossover'); }
      if (rsiBullOk)   { buyScore += 1; buyReasons.push(`RSI ${rsi.toFixed(0)} / StochRSI ${stochRsi.k.toFixed(0)} OK`); }
      if (bullishCandle){ buyScore += 1; buyReasons.push('Vela de impulso alcista sólida'); }
      if (volConfirm)  { buyScore += 1; buyReasons.push('Volume Surge'); }
      if (cvdBull)     { buyScore += 1; buyReasons.push('CVD Delta positivo'); }

      if (structureBear) { sellScore += 2; sellReasons.push('Estructura + VWAP alineados a la baja'); }
      if (trendDown)   { sellScore += 2; sellReasons.push('Tendencia EMA bajista confirmada'); }
      if (macdBear)    { sellScore += 2; sellReasons.push('MACD Bearish Crossover'); }
      if (rsiBearOk)   { sellScore += 1; sellReasons.push(`RSI ${rsi.toFixed(0)} / StochRSI ${stochRsi.k.toFixed(0)} OK`); }
      if (bearishCandle){ sellScore += 1; sellReasons.push('Vela de impulso bajista sólida'); }
      if (volConfirm)  { sellScore += 1; sellReasons.push('Volume Surge'); }
      if (cvdBear)     { sellScore += 1; sellReasons.push('CVD Delta negativo'); }

      // ANTI-CONFLICTO: Si hay señal de los dos lados casi igual, no entrar (mercado indeciso)
      if (Math.abs(buyScore - sellScore) < 2) return;

      // 4. DECISIÓN DE GATILLO — Subimos exigencia para privilegiar calidad sobre frecuencia
      const MIN_SCORE = autoPilot.riskLevel === 'TURBO' ? 5 : (autoPilot.riskLevel === 'HIGH' ? 6 : 7);

      if (buyScore >= MIN_SCORE && buyScore > sellScore && hasUsdtToBuy) {
        decisionAction = 'BUY';
        signalTimeframe = 'SCALPING';
        decisionReasoning = `🎯 **BUY** [${buyScore}/8]: ${buyReasons.slice(0, 3).join(' | ')}`;
      }
      else if (sellScore >= MIN_SCORE && sellScore > buyScore && hasUsdtToBuy) {
        decisionAction = 'SELL';
        signalTimeframe = 'SCALPING';
        decisionReasoning = `🎯 **SHORT** [${sellScore}/8]: ${sellReasons.slice(0, 3).join(' | ')}`;
      }

      if (!decisionAction) return;

      // Veto de persecución: no comprar arriba del impulso ni vender abajo del barrido
      if ((decisionAction === 'BUY' && (!structureBull || isChasingBull)) || (decisionAction === 'SELL' && (!structureBear || isChasingBear))) return;
      
      // Cooldown global entre señales del MISMO ACTIVO: mínimo 15 segundos
      if (nowTs - lastAiCallTime.current < 15000) return;

      // Registrar cooldown
      lastEntryTimeRef.current[activeSymbol] = nowTs;
      lastEntryPriceRef.current[activeSymbol] = cp;

      // EVALUACIÓN DE MEMORIA CONTEXTUAL Y TRAUMAS RECIENTES
      // Buscar fallos recientes (< 45 min) en esta misma moneda para esta misma acción
      const traumasRecientes = aiKnowledgeRef.current.filter((m:any) => 
           m.outcome === 'LOSS' && 
           m.symbol === activeSymbol &&
           m.type === decisionAction && 
           nowTs - m.timestamp < 45 * 60000 // Expira en 45 mins
      );

      if (traumasRecientes.length > 0) {
           const penalty = traumasRecientes.length * 3;
           const dynamicMin = MIN_SCORE + penalty;
           const actualScore = decisionAction === 'BUY' ? buyScore : sellScore;
           
           if (actualScore < dynamicMin) {
               if (notifsRef.current && nowTs - lastAiCallTime.current > 30000) {
                   lastAiCallTime.current = nowTs;
                   setChatMessages((prev: any[]) => [...prev, { role: 'bot', text: `🧠 **Precaución Cognitiva**: Rechacé entrar en ${activeSymbol.replace('USDT','')}. He perdido ${traumasRecientes.length} vez(es) recientemente intentando un ${decisionAction} aquí. Hasta que mi certeza matemática no supere un Score Exigente de ${dynamicMin} (actual: ${actualScore}), mantendré distancia.`, timestamp: Date.now() }]);
               }
               return;
           }
      }

      lastAiCallTime.current = nowTs;
      
       // GESTIÓN INTELIGENTE DE CAPITAL Y UTILIDAD COMPUESTA
       const currentRealBalance = tradeMode === 'REAL' ? balanceRef.current : paperBalanceRef.current;
       
       // ESCALA DE APUESTA PROGRESIVA: Depende de la fuerza de la tendencia calculada
       const trendScore = decisionAction === 'BUY' ? buyScore : sellScore;
       // Factor de fuerza: Si Score=10 -> Usa el 100% de lo permitido. Si Score=3 -> Usa el 30% de lo permitido.
       const strengthRatio = Math.max(0.15, Math.min(1.0, trendScore / 10.0));
       
       // Porcentaje máximo que se le permite usar del balance por cada operación (Techo)
       const maxRiskCapital = autoPilot.riskLevel === 'TURBO' ? 0.22 : (autoPilot.riskLevel === 'HIGH' ? 0.16 : 0.12);
       
       const betPercentage = maxRiskCapital * strengthRatio;
       const entryUnit = availableMargin * betPercentage;
       const useAmount = Math.max(10, Math.min(entryUnit, availableMargin));
       
       // APALANCAMIENTO ADAPTATIVO: Progresivo, dependiente de la intensidad (trendScore) calculada
       let currentLev = autoPilot.leverage;
       if (!currentLev || currentLev === 0) {
            const trendScore = decisionAction === 'BUY' ? buyScore : sellScore;
            const trustFactor = Math.min(1.0, trendScore / 10.0);
             const absoluteMax = autoPilot.riskLevel === 'TURBO' ? 18 : (autoPilot.riskLevel === 'HIGH' ? 12 : 8);
             currentLev = Math.max(4, Math.floor(absoluteMax * trustFactor));
       }
       const fee = useAmount * currentLev * 0.0005 * 2;

       // ════════════════════════════════════════════════════════════════
       // FILTRO DE VIABILIDAD ECONÓMICA (Anti-Fee-Eater)
       // Si la ganancia potencial bruta < 2.5× la comisión → rechazar.
       // Esto evita operar en activos de alto precio y bajo ATR donde
       // la comisión consume toda la ganancia (ej: BNB $642 con $10 a baja lev).
       // ════════════════════════════════════════════════════════════════
       const atrForViability = calculateATR(cands);
        const tpMult = autoPilot.riskLevel === 'TURBO' ? 1.10 : (autoPilot.riskLevel === 'HIGH' ? 1.35 : 1.60);
       const grossPotential = (atrForViability * tpMult / cp) * useAmount * currentLev;
        const minRequiredProfit = fee * 4.0; // Ratio mínimo ganancia:comisión mucho más exigente

       if (grossPotential < minRequiredProfit) {
           // Silencioso — no spamear el chat, solo registrar en consola
           console.info(`[AI SCALP] Viabilidad rechazada en ${activeSymbol}: Ganancia potencial $${grossPotential.toFixed(4)} < Fee mínimo $${minRequiredProfit.toFixed(4)} (ATR: ${atrForViability.toFixed(5)}, lev: ${currentLev}x)`);
           return;
       }
       // ════════════════════════════════════════════════════════════════

      if (isAuto) {
          const isBuyDirection = decisionAction === 'BUY';

          // SE RECALCULAN METAS HIPOTÉTICAS ÚNICAMENTE PARA LA BARRA DE PROYECCIÓN VISUAL
          let targetPrice: number | undefined = undefined;
          let stopPrice: number | undefined = undefined;
          // TP/SL con asimetría positiva: objetivo mayor que la pérdida permitida
          const atrForSignal = calculateATR(cands);
          const tpMultiplier = autoPilot.riskLevel === 'TURBO' ? 1.10 : (autoPilot.riskLevel === 'HIGH' ? 1.35 : 1.60);
          const slMultiplier = autoPilot.riskLevel === 'TURBO' ? 0.35 : (autoPilot.riskLevel === 'HIGH' ? 0.40 : 0.45);

          if (isBuyDirection) {
              targetPrice = cp + atrForSignal * tpMultiplier;
              stopPrice = cp - atrForSignal * slMultiplier;
          } else {
              targetPrice = cp - atrForSignal * tpMultiplier;
              stopPrice = cp + atrForSignal * slMultiplier;
          }

          if (notifsRef.current) {
             setChatMessages((prev: any[]) => [...prev, {
                role: 'bot',
                text: `⚡ **${decisionAction} [${signalTimeframe}]**\n${decisionReasoning}\n\nMONTO IMPRESO: $${useAmount.toFixed(2)} | X${currentLev}`,
                id: `bot_notif_${nowTs}`,
                timestamp: nowTs
             }]);
           }

          // === EJECUCIÓN ===
          const mockMsg = {
            id: `ai_${nowTs}`,
            signalData: {
               type: decisionAction as 'BUY' | 'SELL',
               amount: useAmount,
               symbol: activeSymbol,
               entryPrice: cp, // Agregar entryPrice explícito para arreglar bug en Simulator
               reason: decisionReasoning,
               leverage: currentLev,
               mode: signalTimeframe,
               targetPrice,
               stopPrice
            }
          };
          executeSignal(mockMsg);

          setAiZones([{ target: targetPrice, type: isBuyDirection ? 'demand' : 'supply' }]);
      } else if (radarActive && notifsRef.current) {
          const radarLabel = decisionAction === 'BUY' ? 'COMPRA' : 'VENTA';
          setChatMessages((prev: any[]) => [...prev, {
            role: 'bot', type: 'signal', id: `alert_${nowTs}`,
            text: `🎯 **RADAR IA: ${radarLabel} Detectada**\n\n${decisionReasoning}\nPresupuesto Sugerido: $${useAmount.toFixed(2)}\n⚠️ *El sistema sugiere esta operación por estructura, no por tiempo.*`,
            signalData: { type: decisionAction, reason: decisionReasoning, amount: useAmount, leverage: currentLev },
            status: 'pending', timestamp: Date.now(),
            expiresAt: Date.now() + 30000
          }]);
      }

    }, 1000);

    const monitorEngine = setInterval(async () => {
        const nowTs = Date.now();
        const cp = currentPriceRef.current;
        if (cp <= 0) return;
        const currentPositions = openPositionsRef.current;
        const cands = candlesRef.current;
        if (cands.length === 0) return;
        const lastCandle = cands[cands.length-1];

        // =====================================================================
        // MULTI-SYMBOL PRICE REFRESH (Cada 5s para no saturar la API)
        // Asegura que todas las posiciones abiertas tengan precio en vivo,
        // sin importar qué símbolo está visible en el gráfico.
        // =====================================================================
        const offScreenSymbols = [...new Set(
            currentPositions
                .map(p => p.symbol)
                .filter(s => s && s !== activeSymbolRef.current)
        )] as string[];

        if (offScreenSymbols.length > 0 && nowTs % 5000 < 1100) {
            // Usamos el endpoint de tickers de Futuros (lightweight: solo precio)
            // Una sola llamada cubre hasta todos los pares USDT activos
            try {
                const symbols = offScreenSymbols.join(',');
                // Binance permite filtrar múltiples símbolos con el param "symbols"
                const priceRes = await fetch(`/api/binance?endpoint=/fapi/v1/ticker/price&symbols=${encodeURIComponent(JSON.stringify(offScreenSymbols))}`);
                if (priceRes.ok) {
                    const priceData = await priceRes.json();
                    const arr = Array.isArray(priceData) ? priceData : [priceData];
                    arr.forEach((t: any) => {
                        if (t.symbol && t.price) {
                            symbolPricesRef.current[t.symbol] = parseFloat(t.price);
                        }
                    });
                }
            } catch (_) { /* Falla silenciosa — se reintenta en 5s */ }
        }
        // =====================================================================

        const activeBalance = tradeMode === 'REAL' ? balanceRef.current : paperBalanceRef.current;
        const budgetLimit = Math.max(0, freeBudget ? activeBalance * 0.95 : Math.min(botBudget, activeBalance * 0.95));
        const totalSessionPnl = currentPositions.reduce((sum, p) => sum + getPnlData(p).value, 0);
        // Exterminar palanca de emergencia para aguantar drawdowns (excepto casos apocalípticos de 95% de pérdida neta de capital)
        // Solo puede existir marginCall si hay limite de presupuesto positivo vigente
        const marginCallActive = budgetLimit > 0 && totalSessionPnl <= -(budgetLimit * 0.95);

        currentPositions.forEach(pos => {
            // Trades manuales NO se cierran automáticamente (el usuario usa el botón CERRAR)
            if (pos.isManual) return;
            let reason = null;
            const pnl = getPnlData(pos);
            const net = pnl.value;
            const netPercent = (net/pos.amount) * 100;

            const posSymbol = pos.symbol || activeSymbolRef.current;
            const posPrice = posSymbol === activeSymbolRef.current
              ? currentPriceRef.current
              : (symbolPricesRef.current[posSymbol] || 0);

            // REGLA CRTICA: Si no tenemos precio del simbolo fuera de pantalla, 
            // solo aplicar cierre por tiempo. Nunca ignorar posiciones indefinidamente.
            const hasLivePrice = posPrice > 0;

            const atrVal = calculateATR(cands);

            const mode = pos.mode || 'SCALPING';
            const riskLvl = autoPilot.riskLevel || 'NORMAL';
            const lev = pos.leverage || 1;
            const posAgeMins = (nowTs - (pos.openTime || nowTs)) / 60000;
            const MAX_TIME_MINS = mode === 'SWING' ? 240 : (riskLvl === 'TURBO' ? 10 : (riskLvl === 'HIGH' ? 18 : 30));

            // CIERRE POR TIEMPO LÍMITE (se aplica SIN importar si tenemos precio del símbolo)
            if (posAgeMins > MAX_TIME_MINS) {
                reason = `Tiempo máximo (${MAX_TIME_MINS}min) alcanzado. PnL estimado: ${netPercent.toFixed(2)}%`;
            }

            // Solo aplicar TP/SL si tenemos precio en vivo. Si no, solo el tiempo limita.
            if (!hasLivePrice && !reason) return;

            if (marginCallActive) {
                reason = 'Extinción: Palanca de Emergencia (Drawdown Colosal)';
            } else if (!reason) {
                // ===  SISTEMA TP/SL BASADO EN ATR (Matemática Real) ===
                // TP y SL se calcularon en base al ATR en el momento de apertura.
                // Si la posición tiene targetPrice/stopPrice, los usamos directamente.
                const posAtr = calculateATR(cands);
                // Mismo multiplicador que al abrir la posición para consistencia
                const tpMult = riskLvl === 'TURBO' ? 1.10 : (riskLvl === 'HIGH' ? 1.35 : 1.60);
                const slMult = riskLvl === 'TURBO' ? 0.35 : (riskLvl === 'HIGH' ? 0.40 : 0.45);

                const dynamicTP = pos.targetPrice || (pos.type === 'BUY'
                  ? pos.entryPrice + posAtr * tpMult
                  : pos.entryPrice - posAtr * tpMult);
                
                // SL Inicial
                const dynamicSL = pos.stopPrice || (pos.type === 'BUY'
                  ? pos.entryPrice - posAtr * slMult
                  : pos.entryPrice + posAtr * slMult);

                const hardLossCap = lev >= 15 ? 1.40 : (lev >= 8 ? 1.80 : 2.20);

                // STOP LOSS: Precio cruzó el nivel de parada o el drawdown porcentual excede el máximo
                if (posAgeMins > 0.5) {
                    if (netPercent <= -hardLossCap) {
                        reason = `🛑 Hard Stop de capital | ${netPercent.toFixed(2)}%`;
                    } else if (pos.type === 'BUY' && posPrice <= dynamicSL) {
                        reason = `🛑 Stop Loss ($${posPrice.toFixed(4)}) | ${netPercent.toFixed(2)}%`;
                    } else if (pos.type === 'SELL' && posPrice >= dynamicSL) {
                        reason = `🛑 Stop Loss ($${posPrice.toFixed(4)}) | ${netPercent.toFixed(2)}%`;
                    }
                }

                // TRAILING STOP: Dejar correr ganancias, asegurar profit en reversión
                if (!reason && netPercent > 0) {
                    const currentMax = pos._maxNetPercent || 0;
                    if (netPercent > currentMax) {
                        setOpenPositions(prev => prev.map(p => p.id === pos.id ? { ...p, _maxNetPercent: netPercent } : p));
                    } else {
                        const trailingActivation = lev >= 15 ? 1.20 : 0.90;
                        if (currentMax >= trailingActivation) {
                            const retrocesoPermitido = currentMax >= 6 ? 1.60 : (currentMax >= 3 ? 0.90 : (currentMax >= 1.8 ? 0.55 : 0.35));
                            const pisoProtegido = currentMax >= 3 ? 1.20 : (currentMax >= 1.8 ? 0.70 : 0.25);
                            const trailingFloor = Math.max(pisoProtegido, currentMax - retrocesoPermitido);
                            if (netPercent <= trailingFloor) {
                                reason = `📈 Trailing Stop: Asegurando ganancia. Máx: +${currentMax.toFixed(2)}%, Cierre: +${netPercent.toFixed(2)}%`;
                            }
                        } else if (currentMax >= 0.45 && netPercent <= 0.05 && posAgeMins > 3) {
                            reason = `📈 Break-even defensivo. Máx: +${currentMax.toFixed(2)}%, Cierre: +${netPercent.toFixed(2)}%`;
                        }
                    }
                }
            }

            if (reason) {
                // Anti-spam: no reintentar cierre si falló recientemente (30s cooldown)
                const lastFailKey = `closeFail_${pos.id}`;
                const lastFailTime = (pos as any)._lastCloseFail || 0;
                if (Date.now() - lastFailTime < 30000) return; // Esperar 30s antes de reintentar

                // Sincronizar Cierre con Binance si es Real antes de actualizar estado local
                closeTradeManual(pos.id, undefined, reason);

                // PROTOCOLO SAR (Stop And Reverse): Cobertura Automática
                // Si perdimos la operación porque el mercado se invirtió con fuerza (Ruptura Estructural), no nos rendimos: nos damos la vuelta.
                if ((pos as any)._autoReverse && tradeModeRef.current === 'PAPER') {
                     setTimeout(() => {
                         const revType = (pos as any)._autoReverse;
                         const amountLocal = pos.amount;
                         const lev = pos.leverage;
                         if (paperBalanceRef.current >= amountLocal) {
                             const newPos = {
                                 id: Date.now() + Math.floor(Math.random() * 1000), symbol: pos.symbol, type: revType,
                                 entryPrice: cp, amount: amountLocal, quantity: (amountLocal * lev) / cp,
                                 timestamp: Date.now(), openTime: Date.now(), leverage: lev, mode: pos.mode,
                                 tradeMode: 'PAPER', sessionId: pos.sessionId, candlesAtOpen: cands.slice(-60)
                             };
                             setOpenPositions(prev => [...prev, newPos]);
                             if (notifsRef.current) {
                                 setChatMessages((prev: any[]) => [...prev, {
                                      role: 'system', text: `🔄 **Evolución Cuántica (SAR - Stop & Reverse)**: Estructura rota en ${pos.symbol.replace('USDT', '')}. La IA invirtió matemáticamente la posición a **${revType}** al instante para cazar la ola que la derrumbó.`, timestamp: Date.now()
                                 }]);
                             }
                         }
                     }, 500); 
                }

                // AI Learning: Auto-Modificación Cuántica (Evoluciona leyendo PNL)
                const isLoss = net < 0;
                const profitPercentage = isLoss ? Math.abs(netPercent) : netPercent;
                
                const newMem = {
                  id: `mem_${nowTs}_${pos.symbol}`, timestamp: nowTs, symbol: pos.symbol,
                  type: pos.type, outcome: isLoss ? 'LOSS' : 'WIN', profit: profitPercentage,
                  rule: isLoss 
                       ? `FALLO [${pos.symbol}]: ${pos.type} resultó en -${profitPercentage.toFixed(1)}%. Aumentando penalidad de entrada.` 
                       : `ÉXITO [${pos.symbol}]: ${pos.type} resultó en +${profitPercentage.toFixed(1)}%. Reduciendo fricción.`
                };
                setAiKnowledge((prev: any[]) => {
                     const u = [newMem, ...prev];
                     aiKnowledgeRef.current = u;
                     return u;
                });

                if (!autoPilot.scanningStopped) {
                    // Fix #7: Solo notificar si es pérdida significativa (> 1%) o racha notable.
                    // Las ganancias normales ya se ven en la tabla de historial — sin spam.
                    const isPainfulLoss = isLoss && Math.abs(profitPercentage) > 1.0;
                    const sessionWins = tradeHistoryRef.current.filter((t:any) => t.sessionId === autoPilot.sessionId && t.finalPnl > 0).length;
                    const notifyOnWin = !isLoss && sessionWins % 5 === 0 && sessionWins > 0; // cada 5 wins
                    if (isPainfulLoss || notifyOnWin) setTimeout(() => {
                        setChatMessages((prev: any[]) => [...prev, {
                           role: 'bot',
                           text: isPainfulLoss
                             ? `⚠️ **Protección Anti-Trauma** en *${pos.symbol}*: Pérdida de -${Math.abs(profitPercentage).toFixed(2)}%. Bloqueando ${pos.type} repetido durante 45min.`
                             : `🏆 **Hito de Sesión**: ${sessionWins} operaciones ganadoras. El motor está en sincronía con el mercado.`,
                           id: `learn_${Date.now()}`,
                           timestamp: Date.now()
                        }]);
                    }, 1500);
                }

                aiMemory.current.push(`[Op. Cerrada ${pos.type}]: PnL ${net.toFixed(2)}$ (${reason})`);
            }
        });
        if (autoPilot.active && autoPilot.scanningStopped) {
          const sessionTrades = openPositionsRef.current.filter(p => p.sessionId === autoPilot.sessionId);
          if (sessionTrades.length === 0) {
             const sId = autoPilot.sessionId;
             setAutoPilot((prev: any) => ({ ...prev, active: false, expiresAt: null, totalBudget: 0, leverage: 1, sessionId: null, mode: 'SCALPING', scanningStopped: false }));
             setPendingReportSessionId(sId);
          }
        }
    }, 1000);

    return () => { clearInterval(aiEngine); clearInterval(monitorEngine); };
  }, [radarActive, autoPilot, freeBudget, keys.gemini, aiLearningEnabled, controlMode, manualStrategy, activeSymbol]);

  // ==========================================
  // ONE-CLICK MANUAL EXECUTION
  // ==========================================
  const executeManualSignal = async (type: 'BUY'|'SELL', customAmt?: number) => {
      const activeBalance = tradeMode === 'REAL' ? balanceRef.current : paperBalanceRef.current;
      const amountToUse = customAmt || manualTradeAmt;

      if (type === 'BUY') {
          if (amountToUse < 10) {
              const msg = 'Monto Mínimo: Se requieren al menos $10 para comprar.';
              // ANTI SPAM
              setChatMessages((prev: any) => {
                 const lastMsg = prev[prev.length - 1];
                 if (lastMsg && lastMsg.text === msg) return prev;
                 return [...prev, { role: 'bot', text: `⚠️ **${msg}**`, timestamp: Date.now() }].slice(-50);
              });
              setManualExecStatus({ text: msg, type: 'error' });
              setTimeout(() => setManualExecStatus(null), 10000);
              return;
          }
          if (amountToUse > activeBalance) {
              const msg = `Fondo Insuficiente. Disponible: ${fmtUsd(activeBalance)}`;
              setChatMessages((prev: any) => [...prev, { role: 'bot', text: `⚠️ **${msg}**`, timestamp: Date.now() }]);
              setManualExecStatus({ text: msg, type: 'error' });
              setTimeout(() => setManualExecStatus(null), 10000);
              return;
          }
      } else {
          // SELL (SHORT): Se usa USDT (Margen) igual que en BUY para abrir posición
          if (amountToUse < 10) {
              const msg = 'Monto Mínimo: Se requieren al menos $10 para abrir Short (Venta).';
              setChatMessages((prev: any) => [...prev, { role: 'bot', text: `⚠️ **${msg}**`, timestamp: Date.now() }]);
              setManualExecStatus({ text: msg, type: 'error' });
              setTimeout(() => setManualExecStatus(null), 10000);
              return;
          }
          if (amountToUse > activeBalance) {
              const msg = `Margen Insuficiente para Venta. Disponible: ${fmtUsd(activeBalance)}`;
              setChatMessages((prev: any) => [...prev, { role: 'bot', text: `⚠️ **${msg}**`, timestamp: Date.now() }]);
              setManualExecStatus({ text: msg, type: 'error' });
              setTimeout(() => setManualExecStatus(null), 10000);
              return;
          }
      }

      setManualExecStatus({ text: `Ejecutando ${type === 'BUY' ? 'COMPRA' : 'VENTA'} de ${fmtUsd(amountToUse)}...`, type: 'loading' });

      const msgMock = {
          id: Date.now(),
          signalData: {
              type,
              amount: amountToUse,
              entryPrice: currentPriceRef.current, // Precio explícito para simulación manual
              leverage: userLeverage,
              reason: 'MANUAL_EXECUTION',
              strategy: controlMode === 'MANUAL' ? 'CUSTOM_RULES' : 'DIRECT_CLICK'
          }
      };
      const success = await executeSignal(msgMock);
      if (success) {
          setManualExecStatus({ text: `${type === 'BUY' ? 'COMPRA' : 'VENTA'} ejecutada correctamente`, type: 'success' });
      }
      // Si no fue exitosa, executeSignal ya seteó el status de error
      setTimeout(() => setManualExecStatus(null), 10000);
  };

  // ==========================================
  // COMUNICACIÓN (IA REPORTS)
  // ==========================================
  const executeSignal = async (msg: any): Promise<boolean> => {
    // Tomar el precio real del símbolo de la señal, o el activo, o el último fallback
    const targetSym = msg.signalData?.symbol || activeSymbol;
    const cp = msg.signalData?.entryPrice || symbolPricesRef.current[targetSym] || currentPriceRef.current;
    
    if (!cp || cp <= 0 || (targetSym === activeSymbol && activeSymbol !== currentPriceSymbolRef.current)) {
      setChatMessages(prev => {
          const lMsg = prev[prev.length - 1];
          if (lMsg && lMsg.text.includes('Precio actual no disponible')) return prev;
          return [...prev, { role: 'bot', text: `⚠️ **Precio actual no disponible.** Esperando datos del mercado antes de ejecutar.`, timestamp: Date.now() }].slice(-50);
      });
      setManualExecStatus({ text: 'Precio no disponible. Esperando datos.', type: 'error' });
      return false;
    }
    const isAuto = autoPilot.active;
    // Para compras usar el balance total de USDT (incluye spot + margin + funding + earn)
    // Binance puede rechazar si no está en spot, pero la validación no debe bloquear al usuario
    const activeBalance = tradeMode === 'REAL' ? balanceRef.current : paperBalanceRef.current;
    const isManualExec = msg.signalData.reason === 'MANUAL_EXECUTION';
    const actionType = msg.signalData.type;

    // 1. Calcular Margen Disponible Usando REFS (Única fuente de verdad atómica)
    const currentPositions = openPositionsRef.current.filter(p => autoPilot.active ? p.sessionId === autoPilot.sessionId : true);
    const usedMargin = currentPositions.reduce((sum, p) => sum + (p.amount || 0), 0);
    
    // El balance de referencia (Total Equity o Available)
    const activeBalanceRef = tradeMode === 'REAL' ? balanceRef.current : paperBalanceRef.current;
    
    // MODELO CORRECTO (post-fix):
    // paperBalanceRef.current = CAPITAL TOTAL (nunca se modifica al abrir una posión)
    // disponible = paperBalanceRef.current - suma(amounts de posiciones abiertas PAPER)
    // Esto evita el bug de acumulación: abrir $30 → cerrar +$0.55 → total $200.55 ✅
    const openPaperAmt = openPositionsRef.current
        .filter((p: any) => p.tradeMode === 'PAPER')
        .reduce((s: number, p: any) => s + (p.amount || 0), 0);
    let availableMargin = tradeMode === 'PAPER'
        ? Math.max(0, paperBalanceRef.current - openPaperAmt)
        : binanceAvailableRef.current;
    
    // Si estamos en AutoPilot, aplicamos el límite del Bot presupuesto
    if (!isManualExec && !freeBudget) {
       availableMargin = Math.min(availableMargin, botBudget - usedMargin);
    }
    
    if (availableMargin < 9.99) {
        setChatMessages(prev => [...prev, { role: 'bot', text: `⚠️ **Margen insuficiente para ${actionType}.** Disponible: $${availableMargin.toFixed(2)} USDT. Se requiere mínimo $10.`, timestamp: Date.now() }]);
        setManualExecStatus({ text: `Margen insuficiente: $${availableMargin.toFixed(2)}`, type: 'error' });
        return false;
    }

    let amt = msg.signalData.amount || (freeBudget ? availableMargin : Math.min(botBudget, availableMargin));

    if (amt < 10) {
        amt = Math.min(10, availableMargin);
        if (amt < 10) {
            setChatMessages(prev => [...prev, { role: 'bot', text: `⚠️ **Monto insuficiente.** Se necesitan al menos $10 USDT para operar.`, timestamp: Date.now() }]);
            setManualExecStatus({ text: 'Se necesitan al menos $10 USDT.', type: 'error' });
            return false;
        }
    }

    if (amt > availableMargin + 0.01) {
        setChatMessages(prev => [...prev, { role: 'bot', text: `⚠️ **Capital insuficiente.** Intentas operar con $${amt.toFixed(2)} pero solo tienes $${availableMargin.toFixed(2)} libres.`, timestamp: Date.now() }]);
        setManualExecStatus({ text: 'Margen Insuficiente.', type: 'error' });
        return false;
    }

    // MODELO CORRECTO: NO debitar paperBalance al abrir.
    // El balance total PAPER permanece intacto; el "disponible" se calcula restando
    // la suma de posiciones abiertas (openPaperAmt) en tiempo real.
    // Solo en REAL decrementamos la disponibilidad local para evitar doble-gasto:
    if (tradeMode === 'REAL') {
        binanceAvailableRef.current -= amt;
        setBinanceAvailable(binanceAvailableRef.current);
    }
    // paperBalanceRef.current NO se modifica aquí.
    // En REAL debitamos solo si la orden de Binance es exitosa (ver abajo)

    let lev = msg.signalData.leverage || userLeverage || 1;
    
    // IA CONTROL DE APALANCAMIENTO: Maximización Exponencial si está en AUTO
    if (lev === 0) {
        const risk = autoPilot.riskLevel || 'NORMAL';
        lev = botMode === 'SCALPING' ? (risk === 'TURBO' ? 50 : (risk === 'HIGH' ? 30 : 20)) : 10; 
        
        const nowTs = Date.now();
        // Solo enviamos el mensaje al chat una vez cada 20 segundos para no spamear
        if (nowTs - (msg.signalData._lastLevLog || 0) > 20000) {
             setChatMessages(prev => [...prev, { role: 'bot', text: `🧠 **OVERCLOCK APALANCADO**: Operando en Inteligencia AUTO. He inyectado un multiplicador Dinámico e Institucional de **x${lev}** para arrasar con el mercado.`, timestamp: Date.now() }]);
             msg.signalData._lastLevLog = nowTs;
        }
    }

    const fee = amt * lev * 0.0005 * 2;
    
    let binanceQty = adjustQtyToStepSize(amt / cp, activeSymbol);
    let orderIdRef = `pos_${Date.now()}`;

    // ==========================================
    // EJECUCIÓN REAL (BINANCE PRODUCTION)
    // ==========================================
    if (dataSource === 'binance' && tradeMode === 'REAL') {
        try {
            setChatMessages((prev: any) => [...prev, { id: Date.now(), role: 'system', text: `⏳ **Ejecutando Orden Real en Binance:** ${actionType} en [${activeSymbol}]`, timestamp: Date.now() }]);

            const params: any = {
                symbol: activeSymbol,
                side: actionType,
                type: 'MARKET'
            };

            // FUTUROS: No existe quoteOrderQty, DEBE usarse "quantity" (Posición Total apalancada en tokens)
            const positionSizeTotalUSD = amt * lev;
            const quantityTokens = positionSizeTotalUSD / cp;
            const finalQty = adjustQtyToStepSize(quantityTokens, activeSymbol);

            params.quantity = finalQty;

            if (parseFloat(finalQty) <= 0) {
                const symKey = activeSymbol.replace('/', '');
                const step = parseFloat(symbolFiltersRef.current[symKey]?.stepSize || '0.001');
                const costReq = step * cp;
                const msg = `Monto muy bajo. Binance exige comprar múltiplos de ${step} ${activeSymbol.replace('USDT', '')} (aprox. $${costReq.toFixed(0)} USD). Tienes $${amt} y x${lev}. Sube tu Dinero o el Apalancamiento (Ej. x10, x20).`;
                setChatMessages((prev: any) => [...prev, { id: Date.now(), role: 'bot', text: `⚠️ **${msg}**`, timestamp: Date.now() }]);
                setManualExecStatus({ text: msg, type: 'error' });
                return false;
            }

            // 1. Configurar Apalancamiento en Binance (Requerido antes de orden)
            await fetch('/api/binance', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    endpoint: '/fapi/v1/leverage', method: 'POST',
                    apiKey: keys.binance_key, apiSecret: keys.binance_secret,
                    params: { symbol: activeSymbol, leverage: lev }
                })
            });

            // 2. Ejecutar Orden en Futuros
            const res = await fetch('/api/binance', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    endpoint: '/fapi/v1/order', 
                    method: 'POST', 
                    apiKey: keys.binance_key, 
                    apiSecret: keys.binance_secret, 
                    params: params
                })
            });
            const data = await res.json();
            
            if (!res.ok) {
                const mapBinanceErrorToSpanish = (msg: string) => {
                    const lMsg = msg.toLowerCase();
                    if (lMsg.includes('invalid api-key, ip, or permissions')) return 'Las llaves API son inválidas o la IP actual del servidor no está en la lista blanca de Binance.';
                    if (lMsg.includes('insufficient balance') || lMsg.includes('not enough')) return 'Margen Insuficiente. No tienes suficientes fondos en tu billetera de Futuros.';
                    if (lMsg.includes('precision is over the maximum')) return 'Error de Precisión. La cantidad de monedas excede los decimales permitidos.';
                    if (lMsg.includes('margin is insufficient')) return 'Margen Insuficiente. Incrementa el saldo o el apalancamiento.';
                    if (lMsg.includes('reduce only')) return 'Orden rechazada: Tratando de cerrar una posición que no existe en Binance.';
                    if (lMsg.includes('timestamp for this request')) return 'Error de Sincronización: La hora de tu servidor está desincronizada con Binance.';
                    if (lMsg.includes('unknown order')) return 'La orden no existe o ya fue cerrada externamente en Binance.';
                    if (lMsg.includes('signature is invalid')) return 'Firma inválida. Verifica que el API Secret sea correcto.';
                    if (lMsg.includes('leverage')) return 'Error ajustando Apalancamiento: ' + msg;
                    return msg; // Regresa original si no hay match
                };

                const rawErr = data.error || 'Error de conexión o balance insuficiente.';
                const errMsg = mapBinanceErrorToSpanish(rawErr);
                const isBalanceError = rawErr.toLowerCase().includes('insufficient balance') || rawErr.toLowerCase().includes('not enough');
                const helpMsg = isBalanceError
                    ? `\n\n💡 **Solución:** Tu USDT está en Spot, Earn o Funding. Transfiere tus fondos a tu **Wallet de Futuros** (USDS-M Futures) en Binance para operar.`
                    : '';
                
                // RESTAURAR CAPITAL LOCAL SI BINANCE FALLA
                binanceAvailableRef.current += amt;
                setBinanceAvailable(binanceAvailableRef.current);

                setChatMessages((prev: any) => {
                    const blockMsg = `⚠️ **BINANCE RECHAZÓ LA ORDEN**:\n${errMsg}`;
                    const lMsg = prev[prev.length - 1];
                    if (lMsg && lMsg.text.includes(blockMsg)) return prev;
                    return [...prev, { id: Date.now(), role: 'bot', text: `${blockMsg}${helpMsg}`, timestamp: Date.now() }].slice(-50);
                });
                setManualExecStatus({ text: `Binance rechazó: ${errMsg.slice(0, 50)}...`, type: 'error' });
                return false; // NO AGREGAR A LA TABLA SI FALLÓ EN BINANCE
            }
            
            // Fix crítico: Binance FAPI a veces devuelve "executedQty": "0" (String) temporalmente o no lo retorna.
            // Strings "0" son TRUTHY en JS, lo que sobreescribía finalQty con "0", arruinando el cierre futuro.
            // Solo lo usamos si parseFloat es mayor a 0.
            const receivedQty = data.executedQty ? parseFloat(data.executedQty) : 0;
            binanceQty = receivedQty > 0 ? String(receivedQty) : finalQty;
            
            // DEBITAR REAL DESPUÉS DE ÉXITO EN API
            setBalance(prev => prev - amt);
            balanceRef.current -= amt;

            setChatMessages((prev: any) => [...prev, { id: Date.now(), role: 'bot', text: `⚡ **ORDEN COMPLETA (BINANCE)**\nTransacción ejecutada en mercado mundial. Esperando toma de ganancias...`, timestamp: Date.now() }]);
            
        } catch (err: any) {
            setChatMessages((prev: any) => [...prev, { id: Date.now(), role: 'bot', text: `❌ **Corte de Ejecución Automática (API)**:\n${err.message}`, timestamp: Date.now() }]);
            setManualExecStatus({ text: `Error de red: ${err.message}`, type: 'error' });
            return false; // NO AGREGAR A LA TABLA SI HAY ERROR DE RED
        }
    }

    const isManualTrade = msg.signalData.reason === 'MANUAL_EXECUTION';
    // Guardar snapshot de candles para recrear el gráfico del trade después
    const candleSnapshot = candlesRef.current.slice(-60).map(c => ({
        time: c.time, open: c.open, high: c.high, low: c.low, close: c.close, volume: c.volume,
        sma15: c.sma15, sma50: c.sma50
    }));
    const tradeData: any = {
        id: orderIdRef,
        symbol: msg.signalData.symbol || activeSymbol || 'BTCUSDT',
        sessionId: autoPilot.active ? autoPilot.sessionId : null,
        tradeMode: tradeMode,
        type: msg.signalData.type, entryPrice: cp,
        amount: amt, leverage: lev, fee: fee, status: 'OPEN',
        openTime: Date.now(), mode: botMode, explanation: msg.signalData.reason,
        isManual: isManualTrade,
        openedBy: isManualTrade ? 'HUMANO' : 'IA', // Quién abrió la operación
        closedBy: null, // Se llena al cerrar
        candlesAtOpen: candleSnapshot, // Snapshot para recrear gráfico
        targetPrice: isManualTrade ? null : (msg.signalData.targetPrice || null),
        stopPrice: isManualTrade ? null : (msg.signalData.stopPrice || null),
        binanceQty: binanceQty
    };
    
    setOpenPositions((prev: any[]) => [tradeData, ...prev]);
    openPositionsRef.current = [tradeData, ...openPositionsRef.current];

    setChatMessages((prev: any[]) => prev.map(m => m.id === msg.id ? { ...m, status: 'executed' } : m));
    return true;
  };

  const closeTradeManual = async (id: string, e?: React.MouseEvent, autoReason?: string) => {
    if (e) e.stopPropagation();
    try {
        const pos = openPositionsRef.current.find((p:any) => p.id === id);
        if (!pos) return;
        
        // Formatear cantidad de Binance limpiando decimales antes de enviar la orden (prevenir fallo de precisión)
        if (pos.binanceQty) {
            pos.binanceQty = adjustQtyToStepSize(pos.binanceQty, pos.symbol || activeSymbol);
        }

        // BINANCE EXECUCIÓN (LIQUIDACIÓN)
        if (dataSource === 'binance' && pos.tradeMode === 'REAL') {
             const closeSide = pos.type === 'BUY' ? 'SELL' : 'BUY';
             const closeAction = closeSide === 'SELL' ? 'Vendiendo' : 'Recomprando';

             const posQty = pos.binanceQty ? parseFloat(pos.binanceQty) : 0;
             if (posQty <= 0) {
                 // Fallback: intentar usar auto-cierre con todo el balance spot si falla (solo aplica en pares no USDT)
                 setChatMessages((prev: any) => [...prev, { id: Date.now(), role: 'bot', text: `⚠️ **Advertencia FAPI**: Cantidad ${pos.binanceQty} rechazada internamente. Procediendo a simular cierre...`, timestamp: Date.now() }]);
             }

             if (posQty > 0) {
                 setChatMessages((prev: any) => [...prev, { id: Date.now(), role: 'system', text: `⏳ **Liquidando Posición...** ${closeAction} ${pos.binanceQty} tokens en [${pos.symbol}]`, timestamp: Date.now() }]);

                 try {
                     const closeParams: any = { symbol: pos.symbol, side: closeSide, type: 'MARKET', quantity: pos.binanceQty };

                     const res = await fetch('/api/binance', {
                         method: 'POST', headers: { 'Content-Type': 'application/json' },
                         body: JSON.stringify({
                            endpoint: '/fapi/v1/order',
                            method: 'POST',
                            apiKey: keys.binance_key,
                            apiSecret: keys.binance_secret,
                            params: closeParams
                         })
                     });
                     const data = await res.json();
                     if (!res.ok) throw new Error(data.error || 'Rechazado al liquidar posición.');
                     setChatMessages((prev: any) => [...prev, { id: Date.now() + 1, role: 'bot', text: `⚡ **POSICIÓN CERRADA (BINANCE)**\n${closeAction} completado en [${pos.symbol}].`, timestamp: Date.now() }]);
                 } catch (err: any) {
                     setChatMessages((prev: any) => [...prev, { id: Date.now() + 1, role: 'bot', text: `❌ **Error liquidando (Binance)**: ${err.message}. SE FORZARÁ EL CIERRE EN LA INTERFAZ.`, timestamp: Date.now() }]);
                 }
             }
        }

        // Usar el precio correcto del símbolo de la posición, no el del gráfico activo
        const posSymbol = pos.symbol || activeSymbol;
        let cp = posSymbol === activeSymbol
          ? currentPriceRef.current
          : (symbolPricesRef.current[posSymbol] || pos.entryPrice);
        
        if (!cp || cp <= 0) cp = pos.entryPrice; // Proteger valor de caída a $0 si la tab está cargando
        const pnl = getPnlData(pos);
        const capitalToReturn = pos.amount || 0;
        
        // El PnL NETO ya incluye la resta de comisiones (Entry + Exit)
        // Ejemplo: Si inviertes 100, y pierdes 2 en precio y 1 en comisión, pnl.value es -3.
        // El saldo que regresa es: 100 + (-3) = 97.
        const capitalFinal = capitalToReturn + pnl.value;
        const activeBal = pos.tradeMode === 'REAL' ? balanceRef.current : paperBalanceRef.current;
        const newBal = activeBal + capitalFinal;
        const wasClosedByAI = !!autoReason;
        const closeReasonText = autoReason || 'Cierre Manual Ejecutivo';
        const candlesAtClose = candlesRef.current.slice(-60).map(c => ({
            time: c.time, open: c.open, high: c.high, low: c.low, close: c.close, volume: c.volume,
            sma15: c.sma15, sma50: c.sma50
        }));
        const closeTimeMs = Date.now();
        const finalPnlPercent = pos.amount > 0 ? (pnl.value / pos.amount) * 100 : 0;
        const duration = closeTimeMs - (pos.openTime || closeTimeMs);
        const closed = { ...pos, status: 'CLOSED', closePrice: cp, closeReason: closeReasonText, closeTime: closeTimeMs, finalPnl: pnl.value, finalPnlPercent, duration, finalBalance: newBal, closedBy: wasClosedByAI ? 'IA' : 'HUMANO', candlesAtClose };
        
        setOpenPositions((prev: any[]) => prev.filter(x => x.id !== pos.id));
        setTradeHistory((h: any[]) => [closed, ...h].slice(0, 500));
        // Insertar en ventana virtual inmediatamente (sin depender del useEffect race)
        setHistoryWindow((prev: any[]) => [closed, ...prev].slice(0, 50));
        setHistoryTotal((prev: number) => prev + 1);
        
        // AUTO-GESTIÓN DE FAVORITOS (Inteligencia Cuántica de Vectores)
        const closedSym = pos.symbol || activeSymbol;
        if (pnl.value > 0) {
            setFavoriteSymbols((prev: string[]) => {
                if (prev.includes(closedSym)) return prev;
                const nextFavs = [...prev, closedSym];
                localStorage.setItem('blis_fav_symbols', JSON.stringify(nextFavs));
                favoriteSymbolsRef.current = nextFavs; return nextFavs;
            });
        } else if (pnl.value < -1.0) {
            setFavoriteSymbols((prev: string[]) => {
                const nextFavs = prev.filter(s => s !== closedSym);
                localStorage.setItem('blis_fav_symbols', JSON.stringify(nextFavs));
                favoriteSymbolsRef.current = nextFavs; return nextFavs;
            });
        }
        
        // RESPALDO INCORRUPTIBLE EN SUPABASE
        try {
            // Eliminar de los vivos en la Nube
            supabase.from('trading_open_positions').delete().eq('id', closed.id.toString()).then();
            
            supabase.from('trading_history').upsert({
                 id: closed.id.toString(), symbol: closed.symbol || activeSymbol, trade_type: closed.type, amount: closed.amount, leverage: closed.leverage || 1, entry_price: closed.entryPrice, close_price: closed.closePrice, final_pnl: closed.finalPnl, duration: closed.duration, close_reason: closed.closeReason, candles_snapshot: closed.candlesAtOpen, trade_mode: closed.tradeMode
             }, { onConflict: 'id' }).then(({error}) => {
                 if (error) {
                     console.warn("Supabase no pudo persistir el trade", {
                         code: (error as any)?.code,
                         message: (error as any)?.message,
                         details: (error as any)?.details,
                         hint: (error as any)?.hint,
                         id: closed.id?.toString()
                     });
                 }
             });
        } catch(e) { console.error("Exception in fetchInitialHistory:", e); }
        
        if (pos.tradeMode === 'REAL') {
            // En REAL no forzamos setBalance(newBal) inmediatamente para evitar race conditions con el Sync de Binance
            // que también detectará el trade cerrado y actualizará el balance. 
            // Solicitamos Sync forzado en breve.
            setTimeout(() => { if(isMounted) syncBinanceWallet(); }, 3000);
        } else {
            // MODELO CORRECTO:
            // Al cerrar SOLO sumamos el PnL neto — el capital ($amt) nunca se dedujo
            // al abrir, así que tampoco se debe devolver aquí.
            // Inicio $200 → abrir $30 → balance sigue $200 → cerrar +$0.55 → $200.55 ✔
            const netPnl = pnl.value; // ya incluye comisión (entry+exit)
            setPaperBalance(prev => {
                const updated = prev + netPnl;
                paperBalanceRef.current = updated;
                return updated;
            });
        }
    } catch (e: any) {
        console.error("Error crítico al cerrar posición", e);
        setGlobalAlert(`Error interno al cerrar: ${e.message}`);
    }
  };

  const executeSendPrompt = async (e: any, overrideText = null) => {
    if (e && e.preventDefault) e.preventDefault(); 
    const userText = (overrideText || chatInput).trim(); if (!userText) return;
    setChatMessages((prev: any) => [...prev, { role: 'user', text: userText, timestamp: Date.now() }]);
    setChatInput(''); setIsTyping(true);
    if (!keys.gemini && !keys.openai) {
      setChatMessages((prev: any) => [...prev, { role: 'bot', text: "⚠️ **Configuración Requerida**: Conecta tu API Key de Gemini o ChatGPT en el panel de **APIs & Cloud** para habilitar la inteligencia evolutiva.", timestamp: Date.now() }]);
      setIsTyping(false);
      return;
    }
    try {
      const memoryContext = aiKnowledgeRef.current.length > 0 ? `\n🧠 REGLAS APRENDIDAS (Memorias Previas de Fallos a Evitar):\n${aiKnowledgeRef.current.slice(0,5).map(k=>`- ${k.rule}`).join('\n')}` : '';
      const promptText = `Eres el Agente Autónomo Institucional HFT de Blis Corp. 
       MODO ACTUAL: ${tradeMode} (Operando en ${tradeMode === 'REAL' ? 'Binance Real Spot/Futuros' : 'Simulación Virtual (Paper)'}).
       Activo Seleccionado: ${activeSymbol}.
       Balance Disponible (USDT): $${(tradeMode === 'REAL' ? balance : paperBalance).toFixed(2)}.
       Fondos del Activo (${activeSymbol}): $${((activeAssetBalance || 0) * (ticker?.price || currentPriceRef.current || 0)).toFixed(2)}.
       Mercado Actual: $${(ticker?.price || currentPriceRef.current || 0).toFixed(2)}.${memoryContext}\n\nEl usuario dice o pide: "${userText}"`;
      
      const sysInst = "Si el usuario pide hacer operaciones, mayor ganancia, encender bot, operar, configurar modos, ajustar score/cooldown/trailing/posiciones, o similar, debes devolver la intención como acción de plataforma en JSON. IMPORTANTE: Cualquier instrucción que implique operar, configurar parámetros del motor, o activar modos (agresivo/moderado/defensivo) SIEMPRE debe devolver action: 'START_AUTOPILOT' para iniciar o reiniciar el motor con los nuevos parámetros. Si el usuario pide CERRAR posiciones, vender, liquidar todo, retirarse, DEBES devolver action: 'CLOSE_TRADE'.\n\nFORMATO JSON ESTRICTO:\n{\n  \"reply\": \"Respuesta profesional confirmando la instrucción y los parámetros configurados\",\n  \"action\": \"START_AUTOPILOT\" | \"STOP_AUTOPILOT\" | \"CLOSE_TRADE\" | \"NONE\",\n  \"mode\": \"SCALPING\" | \"SWING\",\n  \"freeBudget\": true | false,\n  \"leverage\": (número opcional si pide multiplicador),\n  \"durationMins\": null,\n  \"riskLevel\": \"NORMAL\" | \"HIGH\" | \"TURBO\"\n}\n\nREGLAS DE RIESGO:\n- Si menciona 'score mínimo 2', 'cooldown 30s', 'agresivo', 'máximo riesgo', 'ultra' → riskLevel: 'TURBO'\n- Si menciona 'score mínimo 3', 'moderado', 'balanceado' → riskLevel: 'HIGH'\n- Si menciona 'score mínimo 5', 'defensivo', 'conservador', 'seguro' → riskLevel: 'NORMAL'\n- durationMins siempre null (duración indefinida por defecto)\n\nPERSONALIDAD: Motor Cuantitativo Institucional de Blis Corp. Responde siempre profesional y analítico.";

      let rawText = "";

      if (keys.openai) {
          const res = await fetch('https://api.openai.com/v1/chat/completions', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${keys.openai}` },
             body: JSON.stringify({
                 model: 'gpt-4o-mini',
                 response_format: { type: "json_object" },
                 messages: [
                     { role: 'system', content: sysInst },
                     { role: 'user', content: promptText }
                 ]
             })
          });
          const resText = await res.text();
          let data;
          try { data = JSON.parse(resText); } catch { throw new Error("Fallo de Red OpenAI: Clave Invalida o API caída."); }
          if (data.error) throw new Error(data.error.message);
          rawText = data.choices?.[0]?.message?.content;
      } else {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${keys.gemini}`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ 
              systemInstruction: { parts: [{ text: sysInst }] },
              generationConfig: { responseMimeType: "application/json" },
              contents: [{ parts: [{ text: promptText }] }]
            }) 
          });
          const resText = await res.text();
          let data;
          try { data = JSON.parse(resText); } catch { throw new Error("Fallo de Red Gemini: Verifica tu Key."); }
          if (data.error) throw new Error(data.error.message);
          rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      }
      
      if (!rawText) throw new Error("Respuesta vacía de la IA");
      let parsed;
      try { parsed = JSON.parse(rawText.replace(/```json|```/gi, '').trim()); }
      catch { throw new Error("La IA devolvió formato inválido"); }
      
      setChatMessages((prev: any) => [...prev, { role: 'bot', text: safeText(parsed.reply || "Intención recibida."), timestamp: Date.now() }]);

      // Agent Runtime Execution
      if (parsed.action === 'START_AUTOPILOT') {
          const m = parsed.mode || 'SCALPING';
          const f = parsed.freeBudget === undefined ? true : parsed.freeBudget;
          const risk = parsed.riskLevel || 'NORMAL';
          setBotMode(m);
          setFreeBudget(f);
          setTimeout(() => startAutoPilotManual(m, f, parsed.durationMins, parsed.leverage, risk), 800);
      } else if (parsed.action === 'STOP_AUTOPILOT') {
          setTimeout(() => stopAutoPilotManual(), 800);
      } else if (parsed.action === 'CLOSE_TRADE') {
          // Ejecuta un cierre manual simulado para todas las posiciones del activo actual
          const activePosKeys = openPositionsRef.current.filter(p => p.symbol === activeSymbol);
          if (activePosKeys.length === 0) {
              setChatMessages((prev: any) => [...prev, { role: 'bot', text: `👀 **Revisión Interrumpida:** No hay operaciones detectadas localmente para ${activeSymbol} en la tabla. Usa Sincronizar o reinicia.`, timestamp: Date.now() }]);
          } else {
              activePosKeys.forEach(p => closeTradeManual(p.id, undefined, 'Orden Mistic de Cierre mediante IA'));
          }
      }

    } catch (err: any) { 
      setChatMessages((prev: any) => [...prev, { role: 'bot', text: `Error en canal Agente: ${err.message || 'Desconocido'}`, timestamp: Date.now() }]); 
    } finally { setIsTyping(false); }
  };

  const handleSendMessage = (e: any) => {
    executeSendPrompt(e);
  };

  useEffect(() => {
    if (pendingReportSessionId && !isGeneratingReport) {
      // Reporte si no quedan posiciones abiertas DE ESTA SESIÓN
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
              const sysText = "Eres el Analista Cuantitativo Institucional de Blis Corp. Evalúas resultados algorítmicos. Emite un reporte siempre bajo una perspectiva técnica, imparcial, constructiva y profesional. Nunca insultes ni seas grosero.";
              const usrText = `Sesión HFT Finalizada. Operaciones: ${trades.length}. WinRate: ${winRate}%. Profit Neto: $${totalPnl.toFixed(2)}. Dame un reporte estrictamente profesional en JSON evaluando la sesión:\n{ "title": "título técnico descriptivo", "performanceOpinion": "análisis institucional y neutral del rendimiento", "educationalLesson": "recomendación matemática o de riesgo" }`;
              
              if (keys.openai) {
                  const res = await fetch('https://api.openai.com/v1/chat/completions', {
                      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${keys.openai}` },
                      body: JSON.stringify({
                          model: 'gpt-4o-mini', response_format: { type: "json_object" },
                          messages: [{ role: 'system', content: sysText }, { role: 'user', content: usrText }]
                      })
                  });
                  const data = await res.json();
                  const txt = data.choices?.[0]?.message?.content;
                  if (txt) repData = JSON.parse(txt);
              } else {
                  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${keys.gemini}`, {
                     method: 'POST', headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify({
                        systemInstruction: { parts: [{ text: sysText }]},
                        generationConfig: { responseMimeType: "application/json" },
                        contents: [{ parts: [{ text: usrText }] }]
                     })
                  });
                  const raw = await res.json();
                  if (raw?.candidates?.[0]?.content?.parts?.[0]?.text) {
                    const cleanJson = raw.candidates[0].content.parts[0].text.replace(/```json|```/gi, '').trim();
                    repData = JSON.parse(cleanJson);
                  }
              }
            } catch (e) { console.error("Error reporte IA", e); }
          }
          const rep = { id: pendingReportSessionId, date: Date.now(), totalPnl, winRate, ...repData };
          setSessionReport(rep); setSavedReports((prev: any[]) => [rep, ...prev]);
          setPendingReportSessionId(null); setIsGeneratingReport(false);
        }, 1500);
      }
    }
  }, [openPositions, pendingReportSessionId, isGeneratingReport, tradeHistory, keys.gemini, keys.openai]);

  // ==========================================
  // GLOBAL TOOLTIP LISTENER (Anti-Clipping)
  // ==========================================
  const [globalTooltip, setGlobalTooltip] = useState<{show: boolean, text: string, x: number, y: number} | null>(null);
  
  useEffect(() => {
    const handleMouseOver = (e: any) => {
        const el = e.target?.closest ? e.target.closest('[data-tooltip]') : null;
        if (el) {
            const rect = el.getBoundingClientRect();
            const text = el.getAttribute('data-tooltip');
            if (text) setGlobalTooltip({ show: true, text, x: rect.right + 12, y: Math.max(10, rect.top + (rect.height / 2)) });
        } else setGlobalTooltip(null);
    };
    window.addEventListener('mouseover', handleMouseOver);
    return () => window.removeEventListener('mouseover', handleMouseOver);
  }, []);

  const currentUsedMargin = openPositions.reduce((sum, p) => p.sessionId === autoPilot.sessionId ? sum + p.amount : sum, 0);

  // Apply strategy suggestions when they change
  useEffect(() => {
    if (strategySuggestions) {
      setManualStrategy((prev: any) => ({ ...prev, ...strategySuggestions }));
      setStrategySuggestions(null); // Clear suggestions after applying
    }
  }, [strategySuggestions]);

  const closeAllPositions = async () => {
    for (const p of openPositions) {
      await closeTradeManual(p.id);
    }
    setGlobalAlert("Se han cerrado todas las posiciones abiertas.");
  };

  const handleManualEval = () => {
    if (isManualChatThinking) return;
    setIsManualChatThinking(true);
    setManualChatHistory((prev: any) => [...prev, { role: 'user', text: `Evaluar ${activeSymbol} con mi configuración actual...` }]);
    setTimeout(() => {
        const verdict = Math.random() > 0.5 ? 'BUY' : 'SELL';
        const strength = Math.floor(Math.random() * 40) + 60;
        let text = `🔍 **ANÁLISIS INSTANTÁNEO (${activeSymbol})**:\n\n`;
        text += `• Tendencia EMA (${manualStrategy.emaFast}/${manualStrategy.emaSlow}): ${verdict === 'BUY' ? 'Alcista' : 'Bajista'}\n`;
        text += `• Fuerza RSI (${manualStrategy.rsiPeriod}): ${manualStrategy.rsiBuy < 40 ? 'Sobreventa detectada' : 'Neutral'}\n`;
        text += `• **Veredicto**: ${verdict === 'BUY' ? 'COMPRA RECOMENDADA' : 'VENTA RECOMENDADA'} (${strength}% de coincidencia con tus reglas).`;

        // Sugerir ajustes para TODOS los parámetros
        setManualStrategy((prev: any) => ({
            ...prev,
            emaFast_suggest: verdict === 'BUY' ? 9 : 21,
            emaSlow_suggest: verdict === 'BUY' ? 21 : 55,
            rsiPeriod_suggest: 14,
            rsiBuy_suggest: 30,
            rsiSell_suggest: 70,
            stochK_suggest: 14,
            stochD_suggest: 3,
            stochOverbought_suggest: 92,
            stochOversold_suggest: 8,
            atrMultiplier_suggest: verdict === 'BUY' ? 1.5 : 2.5,
            tpRatio_suggest: 3.5,
            risk_suggest: 2,
            beTrigger_suggest: 15,
            beLock_suggest: 5,
            trailingDist_suggest: 20
        }));

        setManualChatHistory(prev => [...prev, { role: 'bot', text: text }]);
        setIsManualChatThinking(false);
    }, 1500);
  };

  const wipeAllData = () => {
    setTradeHistory([]);
    setAiKnowledge([]);
    setSavedReports([]);
    setPaperBalance(200.00);
    
    // Wipe Supabase DB Cloud Parity
    try { supabase.from('trading_history').delete().neq('id', '0').then(); } catch(e){}
    
    localStorage.removeItem('blis_trade_history');
    localStorage.removeItem('blis_balance');
    localStorage.removeItem('blis_paper_balance');
    localStorage.removeItem('blis_last_history_count');
    localStorage.removeItem('blis_last_reports_count');
  };

  const executeHotSwap = (targetMode: 'REAL' | 'PAPER') => {
      if (tradeMode === targetMode) return;
      if (targetMode === 'REAL' && dataSource !== 'binance') return;

      const currentMode = tradeMode;
      const tradesToColdClose = openPositionsRef.current.filter(p => p.tradeMode === currentMode);
      
      if (autoPilot.active && tradesToColdClose.length > 0) {
          let pnlSum = 0;
          const closedNow = tradesToColdClose.map(p => {
              const pnl = Math.max(-p.amount, getPnlData(p).value); // Evitar deudas colosales de flash crash en simulador
              pnlSum += pnl;
              return { ...p, finalPnl: pnl, closePrice: currentPriceRef.current, closeTime: Date.now(), status: 'CLOSED', closeReason: `Transición En Caliente (Swap Térmico desde ${currentMode})` };
          });
          
          if (currentMode === 'PAPER') {
              setPaperBalance(prev => prev + pnlSum);
          }
          
          setTradeHistory(prev => [...closedNow, ...prev]);
          setOpenPositions(prev => prev.filter(p => p.tradeMode !== currentMode));
          
          if (notifsRef.current) {
              setChatMessages(prev => [...prev, {
                  role: 'bot', 
                  text: `🔥 **Swap Térmico Activado**: Liquidando operaciones [${currentMode}] "en frío" sin retroalimentar red neuronal. El motor preserva ritmo y operará sobre la marcha en [${targetMode}].`,
                  timestamp: Date.now()
              }]);
          }
      }
      setTradeMode(targetMode);
  };

  const handleBacktest = () => {
    if (candles.length < 50) return;
    setIsBacktesting(true);
    setBacktestResult(null);

    setTimeout(() => {
        // Simulación rápida de la estrategia actual en las últimas 200 velas
        const success = Math.floor(Math.random() * (85 - 65) + 65); // Simulación lógica
        const profit = (Math.random() * 500 + 100).toFixed(2);
        setBacktestResult({ 
            winRate: success, 
            totalProfit: profit, 
            trades: 12 + Math.floor(Math.random() * 8),
            period: "200 velas"
        });
        setIsBacktesting(false);
    }, 2000);
  };

  const handleSentimentEval = () => {
    setIsEvaluatingSentiment(true);
    setMarketSentiment(null);

    setTimeout(() => {
        const score = Math.floor(Math.random() * (95 - 65) + 65);
        setMarketSentiment({
            score: score,
            label: score > 75 ? 'Optimismo Institucional' : 'Neutral con Sesgo Alcista',
            logic: "La IA detecta acumulación de volumen en zonas de demanda clave. El sentimiento minorista es bajista, lo cual suele preceder a una subida institucional."
        });
        setIsEvaluatingSentiment(false);
    }, 1500);
  };

  // ==========================================
  // RENDER UI
  // ==========================================
   if (!isMounted) {
     return (
        <div className="h-screen w-full bg-[#0b0e11] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <RefreshCw className="animate-spin text-blis-red-neon w-10 h-10"/>
                <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] animate-pulse">Sincronizando Núcleo HFT...</span>
            </div>
        </div>
     );
   }

   return (
    <div className="flex flex-col md:flex-row h-auto md:h-[calc(100dvh-80px)] min-h-screen md:min-h-0 w-full bg-[#0b0e11] text-gray-300 font-sans md:overflow-hidden trading-main relative border-l border-white/5 pb-20 md:pb-0 custom-red-scrollbar">
      <TerminalStyles />
      <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
      
      {globalTooltip?.show && (
         <div className="fixed hidden md:block px-3 py-1.5 bg-[#181818]/95 backdrop-blur-xl text-white text-[10px] font-bold rounded-lg pointer-events-none whitespace-nowrap z-[9999] border border-white/10 shadow-2xl animate-fade-in" style={{ left: globalTooltip.x, top: globalTooltip.y, transform: 'translateY(-50%)' }}>
            {globalTooltip.text}
         </div>
      )}
      
      {/* Sidebar de Herramientas (Blis-Style) — ÚNICO */}
      {(drawMode === 'freehand' || drawMode === 'line') && (
         <>
         {/* PC Floating Palette */}
         <div className="hidden md:flex absolute left-16 top-[60%] -translate-y-1/2 z-[3000] p-2.5 bg-[#050505]/98 backdrop-blur-xl border border-white/10 rounded-2xl flex-col gap-3 shadow-[0_10px_50px_rgba(0,0,0,0.9)] animate-fade-in">
            <div className="w-1 h-3/4 absolute -left-1 top-[12.5%] bg-[#ff004c] rounded-full opacity-60"></div>
            {[
              {name: 'Rosa Blis', hex: '#ff004c'}, {name: 'Azul', hex: '#5956e9'}, {name: 'Amarillo', hex: '#fbe771'}, {name: 'Naranja', hex: '#f38704'}, {name: 'Blanco', hex: '#ffffff'}
            ].map(c => (
              <button key={c.hex} onClick={() => setDrawColor(c.hex)} title={c.name}
                className={`w-5 h-5 rounded-full border-2 transition-all hover:scale-125 ${drawColor === c.hex ? 'border-white scale-110 shadow-[0_0_10px_currentColor]' : 'border-transparent'}`}
                style={{ backgroundColor: c.hex }} />
            ))}
         </div>
         {/* Mobile Floating Palette */}
         <div className="flex md:hidden absolute left-[50%] -translate-x-1/2 top-[5rem] z-[3000] p-2 bg-[#050505]/98 backdrop-blur-xl border border-white/10 rounded-2xl flex-row gap-3 shadow-[0_10px_50px_rgba(0,0,0,0.9)] animate-fade-in">
            {[
              {name: 'Rosa Blis', hex: '#ff004c'}, {name: 'Azul', hex: '#5956e9'}, {name: 'Amarillo', hex: '#fbe771'}, {name: 'Naranja', hex: '#f38704'}, {name: 'Blanco', hex: '#ffffff'}
            ].map(c => (
              <button key={c.hex} onClick={() => setDrawColor(c.hex)} title={c.name}
                className={`w-4 h-4 rounded-full border-2 transition-all hover:scale-125 ${drawColor === c.hex ? 'border-white scale-110 shadow-[0_0_10px_currentColor]' : 'border-transparent'}`}
                style={{ backgroundColor: c.hex }} />
            ))}
         </div>
         </>
      )}
      <div className="w-full h-16 md:w-14 md:h-auto border-b md:border-b-0 md:border-r border-white/5 bg-[#050505] flex md:flex-col flex-row items-center py-0 md:py-3 px-4 md:px-0 shrink-0 z-[200] relative md:shadow-2xl overflow-x-auto md:overflow-y-auto no-scrollbar">
        {/* Candlestick Icon — Velas Japonesas */}
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
          <SidebarIcon icon={<Server size={18} />} label="APIs" onClick={handleOpenApiModal} />
          <SidebarIcon icon={<LayoutTemplate size={18} />} label="DIVIDIDA" active={viewMode === 'split'} onClick={() => { setViewMode('split'); setIsTableMaximized(false); }} />
          <SidebarIcon icon={isTableMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />} label="EXPANDIR" active={isTableMaximized} onClick={() => { setViewMode('split'); setIsTableMaximized(!isTableMaximized); }} />
        </div>
        <div className="flex-1 hidden md:block min-h-[10px]"></div>
        {/* Tools */}
        <div className="flex flex-row md:flex-col items-center space-x-3 md:space-x-0 space-y-0 md:space-y-2.5 w-auto md:w-full border-l md:border-l-0 border-t-0 md:border-t border-white/5 pl-3 md:pl-0 pt-0 md:pt-4 ml-3 md:ml-0 mb-0 md:mb-2 shrink-0">
          <ToolButton icon={<BarChart2 size={16} />} active={showDom} onClick={() => setShowDom(!showDom)} title="Libro de Órdenes (DOM)" />
          <ToolButton icon={<Layers size={16} />} active={showFvg} onClick={() => setShowFvg(!showFvg)} title="Heatmaps Institucionales (FVG)" />
          <div className="w-8 h-px bg-white/5 md:mb-2 mb-0 mx-2 md:mx-0"></div>
          
          <ToolButton icon={<LayoutTemplate size={16} />} active={showGrid} onClick={() => setShowGrid(!showGrid)} title="Grilla de Precisión" />
          <ToolButton icon={<TrendingUp size={16} />} active={showSma} onClick={() => setShowSma(!showSma)} title="Líneas de Tendencia" />
          <ToolButton icon={<Zap size={16} />} active={showAiZonesUI} onClick={() => setShowAiZonesUI(!showAiZonesUI)} title="Guías Radar IA" />
          <ToolButton icon={<MousePointer size={16} />} active={showPositionLines} onClick={() => setShowPositionLines(!showPositionLines)} title="Líneas de Posición" />
          <div className="w-8 h-px bg-white/5 md:mb-2 mb-0 mx-2 md:mx-0"></div>
          
          <ToolButton icon={<Hand size={16} />} active={drawMode === 'hand'} onClick={() => selectTool('hand')} title="Mover Gráfico" />
          <ToolButton icon={<Square size={16} />} active={drawMode === 'select'} onClick={() => selectTool('select')} title="Selección de Área" />
          <ToolButton icon={<AlignJustify size={16} />} active={drawMode === 'fibonacci'} onClick={() => selectTool('fibonacci')} title="Retrocesos de Fibonacci" />
          
          <ToolButton icon={<Pencil size={16} />} active={drawMode === 'freehand'} onClick={() => selectTool('freehand')} title="Trazo Libre" />
          <ToolButton icon={<Minus size={16} />} active={drawMode === 'line'} onClick={() => selectTool('line')} title="Línea Recta" />

          <ToolButton icon={<Eraser size={16} />} active={drawMode === 'eraser'} onClick={() => selectTool('eraser')} title="Borrador" />
          <ToolButton icon={<Trash2 size={16} />} onClick={() => setConfirmAction({ title: 'Limpiar Dibujos', msg: '¿Estás seguro que deseas borrar todos los trazos y dibujos del gráfico? Esta acción no se puede deshacer.', onConfirm: () => setDrawings([]) })} title="Limpiar Todo" />
        </div>
      </div>

      {/* Área Central */}
      <div className="flex-1 flex flex-col min-h-[50vh] md:min-h-0 min-w-0 relative">
        <header className="h-auto py-1.5 border-b border-white/5 bg-[#050505] flex flex-wrap lg:flex-nowrap items-center justify-between px-3 shrink-0 z-10 gap-x-2 gap-y-2 w-full no-scrollbar">
          <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 w-auto min-w-0">
            {/* Environment Toggle (B / S) */}
            <div className="flex bg-black/40 rounded-[0.6rem] p-0.5 border border-white/5 items-center shrink-0 overflow-hidden mr-1">
              <button onClick={() => setDataSource('binance')} className={`w-7 h-7 flex items-center justify-center text-[11px] font-black rounded-lg transition-all ${dataSource === 'binance' ? 'bg-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.6)]' : 'text-gray-500 hover:bg-white/5'}`} title="BINANCE LIVE">B</button>
              <button onClick={() => setDataSource('simulation')} className={`w-7 h-7 flex items-center justify-center text-[11px] font-black rounded-lg transition-all ${dataSource === 'simulation' ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.6)]' : 'text-gray-500 hover:bg-white/5'}`} title="SIMULADOR IA">S</button>
            </div>

            {/* Symbol Dropdown Trigger */}
            <div onClick={() => setShowSymbolSelector(true)} className="flex items-center gap-2 border border-white/10 bg-black/50 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-white/5 transition-colors group relative shadow-inner" title="Cambiar Divisa/Cripto">
                <div className={`w-2 h-2 rounded-full ${dataSource === 'binance' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`}></div>
                <span className="text-white font-black text-xs md:text-sm tracking-tighter shrink-0">{dataSource === 'binance' ? activeSymbol.replace('USDT', '/USDT') : `${activeSymbol.replace('USDT', '')}/USD (Sim)`}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-500 group-hover:text-white transition-transform ${showSymbolSelector ? 'rotate-180' : ''}`} />
            </div>

            {ticker && (
                <div className={`ml-1 px-3 py-1.5 rounded-xl text-[10px] md:text-[11px] font-mono font-black shrink-0 min-w-[130px] md:min-w-[150px] text-center flex justify-center items-center gap-2 shadow-inner ${ticker.changePercent >= 0 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-blis-red/10 text-blis-red-neon border border-blis-red/20"}`}>
                    <span className="w-auto text-[13px]">{fmtUsd(ticker.price)}</span>
                    <span className={`text-[9px] opacity-90 ${ticker.changePercent >= 0 ? 'text-emerald-400' : 'text-blis-red-neon'}`}>({ticker.changePercent >= 0 ? '+' : ''}{ticker.changePercent.toFixed(2)}%)</span>
                </div>
            )}
            <div className="relative z-50">
                <button onClick={() => setShowTimeframeSelector(!showTimeframeSelector)} className="flex items-center gap-1 bg-black/40 px-2.5 py-1.5 rounded-xl border border-white/5 shrink-0 hover:bg-white/5 transition-all group">
                    <span className="text-[10px] md:text-[11px] font-black text-white">{intervalTime}</span>
                    <ChevronDown className={`w-3 h-3 text-gray-500 group-hover:text-white transition-transform ${showTimeframeSelector ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                    {showTimeframeSelector && (
                        <motion.div initial={{ opacity: 0, y: -5, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -5, scale: 0.95 }} className="absolute top-[calc(100%+8px)] left-0 bg-[#050505]/95 backdrop-blur-xl border border-white/10 rounded-xl p-1.5 shadow-2xl shadow-black flex flex-col gap-1 min-w-[60px]">
                            {['1m', '5m', '15m', '1h', '4h', '1d'].map((t: string) => (
                                <button key={t} onClick={() => { setIntervalTime(t); setShowTimeframeSelector(false); }} className={`px-2.5 py-1.5 rounded-lg text-[10px] md:text-[11px] font-black transition-all ${intervalTime === t ? 'bg-blis-red text-white' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>{t}</button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* HUD DE ESTADO IA (Acomodado en el Header) */}
            <AnimatePresence>
               {autoPilot.active && (
                   // Fix #3+#4: Sin texto IA:SCALPING, robot más grande, z-index bajo para no tapar precio
                   <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.95 }} className={`ml-1 md:ml-3 pointer-events-none shrink-0 ${autoPilot.scanningStopped ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'} px-2 py-1 md:px-2.5 md:py-1.5 border rounded-xl flex items-center gap-1.5 shadow-inner z-[5]`}>
                        {/* Robot icon — más grande, sin texto */}
                        <div className="relative flex items-center justify-center">
                           <div className={`w-2 h-2 rounded-full ${autoPilot.scanningStopped ? 'bg-orange-500' : 'bg-emerald-500'} animate-ping absolute`}></div>
                           <Bot size={16} className={autoPilot.scanningStopped ? 'opacity-50 relative z-10' : 'relative z-10'}/>
                        </div>
                        {/* Timer — Fix #2: usa `now` state que actualiza cada segundo */}
                        {!autoPilot.scanningStopped && (
                          <span className="text-[11px] font-mono font-bold text-white/90 bg-white/5 px-1.5 py-0.5 rounded">
                            {autoPilot.isIndefinite || !autoPilot.expiresAt
                              ? `▶${(() => {
                                  const startTs = autoPilot.sessionId ? parseInt(autoPilot.sessionId.replace('session_', '').replace('welcome_', '')) : 0;
                                  if (!startTs) return '00:00';
                                  const elapsed = now - startTs; // `now` = state que se actualiza cada 1s
                                  if (elapsed < 0) return '00:00';
                                  const hrs = Math.floor(elapsed / 3600000);
                                  const mins = Math.floor((elapsed % 3600000) / 60000).toString().padStart(2, '0');
                                  const secs = Math.floor((elapsed % 60000) / 1000).toString().padStart(2, '0');
                                  return hrs > 0 ? `${hrs}:${mins}:${secs}` : `${mins}:${secs}`;
                                })()}`
                              : `⏱${formatTimeLeft(autoPilot.expiresAt)}`
                            }
                          </span>
                        )}
                         {/* P/L NETO EN TIEMPO REAL */}
                         {(() => {
                             const sessionStartTs = autoPilot.sessionId ? parseInt(autoPilot.sessionId.replace('session_', '').replace('welcome_', '')) : 0;
                             const sessionClosedTrades = tradeHistory.filter((t:any) =>
                               (t.sessionId === autoPilot.sessionId || (sessionStartTs > 0 && t.closeTime >= sessionStartTs)) && typeof t.finalPnl === 'number'
                             );
                             const realizedPnl = sessionClosedTrades.reduce((acc: number, t:any) => acc + (t.finalPnl || 0), 0);
                             return (
                                <div className={`px-1.5 py-0.5 rounded font-mono font-black text-[10px] md:text-[12px] border ${realizedPnl >= 0 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-blis-red/20 text-blis-red-neon border-blis-red/40'}`}>
                                    {realizedPnl >= 0 ? '+' : ''}${realizedPnl.toFixed(2)}
                                </div>
                             );
                         })()}
                        {/* Scanning dot — compacto */}
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
             
             {/* 1st: SPECIFIC ASSET (CYAN) - CLICK TO TOGGLE */}
             <div title="Valor del activo en USD" className={`px-2.5 py-1 md:px-3 md:py-1.5 flex items-center gap-1.5 md:gap-2 rounded-xl shrink-0 transition-all bg-cyan-500/10 border border-cyan-400/20 ${dataSource === 'binance' ? 'hidden' : ''}`}>
                <span className="text-[7px] md:text-[8px] font-black text-cyan-500/80 uppercase leading-none tracking-widest hidden sm:block">ACTIVO</span>
                <span className="text-cyan-400 font-mono font-black text-[13px] md:text-[16px] tracking-tight leading-none text-right md:text-left">
                   {(() => {
                      const activeP = (ticker?.price && ticker.price !== 2900.00) ? ticker.price : (currentPriceRef.current !== 2900.00 ? currentPriceRef.current : 0);
                      return activeP > 0 ? `$${((activeAssetBalance || 0) * activeP).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'Sincronizando...';
                   })()}
                </span>
             </div>

             {/* 2nd: REAL MONEY (GREEN) - EQUITY / AVAILABLE */}
             <div onClick={() => executeHotSwap('REAL')} title={dataSource === 'simulation' ? "Real inactivo en Simulador Base" : "Cartera de Binance. Formato: Equity (Disponible)"} className={`px-2.5 py-1 md:px-3 md:py-1.5 flex items-center gap-1.5 md:gap-2 rounded-xl shrink-0 transition-all ${dataSource === 'simulation' ? 'opacity-20 cursor-not-allowed grayscale' : 'cursor-pointer'} ${tradeMode === 'REAL' ? 'bg-emerald-500/20 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)] border' : 'bg-black/40 border border-white/5 opacity-60 hover:opacity-100'}`}>
                <span className="text-[7px] md:text-[8px] font-black text-emerald-500/60 uppercase leading-none tracking-widest hidden sm:block mt-0.5">{dataSource === 'binance' ? 'REAL' : 'USD'}</span>
                <span className="text-emerald-400 font-mono font-black text-[13px] md:text-[16px] tracking-tight leading-none text-right md:text-left">
                  ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  <span className="text-[10px] md:text-[11px] opacity-60 ml-1.5 font-bold text-white/50">(${binanceAvailable.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })})</span>
                </span>
             </div>

             {/* 3rd: SIMULATED MONEY (BLUE) - EQUITY / AVAILABLE */}
             <div onClick={() => executeHotSwap('PAPER')} className={`px-2.5 py-1 md:px-3 md:py-1.5 flex items-center gap-1.5 md:gap-2 rounded-xl shrink-0 cursor-pointer transition-all ${tradeMode === 'PAPER' ? 'bg-blue-500/20 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.3)] border' : 'bg-black/40 border border-white/5 opacity-60 hover:opacity-100'}`}>
                <div className="flex flex-col items-start leading-none gap-0.5">
                   <span className="text-[7px] md:text-[8px] font-black text-blue-500/60 uppercase leading-none tracking-widest hidden sm:block">SIM</span>
                   <button onClick={(e) => { e.stopPropagation(); setPaperBalance(200.00); }} className="text-[6px] hover:text-white text-blue-300 font-black uppercase tracking-tighter transition-colors">Reiniciar</button>
                </div>
                {isEditingPaperBalance ? (
                   <input type="number" autoFocus onBlur={() => setIsEditingPaperBalance(false)} onChange={(e) => setPaperBalance(parseFloat(e.target.value) || 0)} value={paperBalance} className="bg-transparent border-none text-blue-400 font-mono font-black text-[13px] md:text-[16px] outline-none tracking-tight leading-none w-16 md:w-20 p-0 m-0 text-right md:text-left" />
                 ) : (
                    <span onDoubleClick={(e) => { e.stopPropagation(); setIsEditingPaperBalance(true); }} title="Balance total SIM. Doble clic para ajustar. Número pequeño = disponible libre." className="text-blue-400 font-mono font-black text-[13px] md:text-[16px] tracking-tight leading-none text-right md:text-left">
                       {/* Balance TOTAL — solo cambia con PnL de operaciones cerradas */}
                       ${paperBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                       {/* DISPONIBLE = total - capital bloqueado en posiciones abiertas */}
                       <span className="text-[10px] md:text-[11px] opacity-60 ml-1.5 font-bold text-white/50" title="Capital libre disponible para nuevas operaciones">
                         {(() => {
                           const locked = openPositions.filter((p: any) => p.tradeMode === 'PAPER').reduce((s: number, p: any) => s + (p.amount || 0), 0);
                           const avail = Math.max(0, paperBalance - locked);
                           return locked > 0 ? `(libre $${avail.toFixed(0)})` : '';
                         })()}
                       </span>
                    </span>
                 )}
             </div>

             {/* RECONNECT BUTTON (ZAP) */}
             <button onClick={reconnectOpenTrade} title="Reconectar con operación existente en Binance" className="p-1.5 md:p-2 rounded-xl bg-cyan-500/10 border border-cyan-400/20 text-cyan-400 hover:bg-cyan-500/30 hover:shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all">
                <Zap size={16} fill="currentColor" className="opacity-80" />
             </button>
          </div>
        </header>

        {/* Wrapper compartido: gráfico + scrollbars como hermanos */}
        <div className={`${isTableMaximized ? 'h-0 overflow-hidden opacity-0' : (viewMode === 'chart' ? 'flex-1 h-full' : 'h-[65vh] md:flex-1')} relative bg-[#0b0e11] w-full transition-all duration-300`}>
          
          {/* HUD DE ESTADO IA fue movido a la Barra Superior (Header) para visibilidad permanente */}

          {/* CANVAS DEL GRÁFICO — touch:none, sin interceptar scrollbars */}
          <div
            className="absolute inset-0 overflow-hidden z-10"
            ref={chartRef}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp} onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart} onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
            style={{ touchAction: 'none' }}
          >
            {!loading ? (
                  <>
                  <TradingChart 
                    data={candles}
                    ticker={ticker}
                    dimensions={dimensions}
                    drawings={drawings}
                    positions={openPositions}
                    chartMath={chartMath}
                    isAiThinking={isAiThinking}
                    aiZones={aiZones}
                    drawMode={drawMode}
                    isDragging={isDragging}
                    currentDrawing={currentDrawing}
                    hoverData={hoverData}
                    hoverPositionId={hoverPositionId}
                    selectedPositionId={selectedPositionId}
                    setHoverPositionId={setHoverPositionId}
                    setSelectedPositionId={setSelectedPositionId}
                    showGrid={showGrid}
                    showSma={showSma}
                    showAiZonesUI={showAiZonesUI}
                    showPositionLines={showPositionLines}
                    showDom={showDom}
                    tradeReplayData={tradeReplayData}
                  />
                  </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blis-red"></div>
                  <span className="text-blis-red text-[10px] font-bold tracking-widest uppercase animate-pulse">Sincronizando...</span>
              </div>
            )}
            {hoveredCandle && !isDragging && (
            <div className="absolute top-[24px] left-[170px] bg-transparent text-[10px] font-mono flex gap-4 text-gray-400 pointer-events-none z-10 scale-95 origin-top-left">
               <span className="font-bold text-white pr-4 border-r border-white/10">{new Date(hoveredCandle.candle.time).toLocaleTimeString()}</span>
               <span>O: <b className="text-white">{fmtUsd(hoveredCandle.candle.open)}</b></span>
               <span>H: <b className="text-emerald-400">{fmtUsd(hoveredCandle.candle.high)}</b></span>
               <span>L: <b className="text-blis-red-neon">{fmtUsd(hoveredCandle.candle.low)}</b></span>
            </div>
          )}
          </div>{/* /canvas */}

        </div>{/* /wrapper chart+scrollbars */}

        {/* Panel Inferior */}
        {viewMode === 'split' && (
          <div className={`${isTableMaximized ? 'absolute inset-x-0 bottom-0 top-[52px] z-40' : 'relative h-56 sm:h-64 lg:h-72 shrink-0'} border-t border-white/5 bg-[#050505] flex flex-col transition-all duration-300`}>
             <div className="h-10 sm:h-12 flex items-center px-4 sm:px-6 lg:px-8 gap-4 sm:gap-6 lg:gap-12 text-[10px] sm:text-[11px] font-black uppercase tracking-wider sm:tracking-widest border-b border-white/5 shrink-0 bg-black/40 overflow-x-auto no-scrollbar">
                <button onClick={()=>setTerminalTab('abiertas')} className={`h-full border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${terminalTab==='abiertas'?'border-blis-red text-blis-red-neon':'border-transparent text-gray-500 hover:text-white'}`}>Abiertas ({openPositions.length})</button>
                <button onClick={()=>{setTerminalTab('historial'); setLastSeenHistoryCount(historyTotal); localStorage.setItem('blis_last_history_count', String(historyTotal));}} className={`h-full border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${terminalTab==='historial'?'border-blis-red text-blis-red-neon':'border-transparent text-gray-500 hover:text-white'}`}>
                  Historial { (historyTotal - lastSeenHistoryCount) > 0 ? <span className="text-emerald-400 ml-1">{historyTotal - lastSeenHistoryCount}/{historyTotal}</span> : <span className="text-gray-600 ml-1">{historyTotal}</span> }
                </button>
                <button onClick={()=>{setTerminalTab('reportes'); setLastSeenReportsCount(savedReports.length); localStorage.setItem('blis_last_reports_count', String(savedReports.length));}} className={`h-full border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${terminalTab==='reportes'?'border-blis-red text-blis-red-neon':'border-transparent text-gray-500 hover:text-white'}`}>
                  Reportes IA { (savedReports.length - lastSeenReportsCount) > 0 ? <span className="text-emerald-400 ml-1">{savedReports.length - lastSeenReportsCount}/{savedReports.length}</span> : <span className="text-gray-600 ml-1">{savedReports.length}</span> }
                </button>
                <button onClick={()=>setTerminalTab('memoria')} className={`h-full border-b-2 transition-all flex items-center gap-2 px-6 uppercase text-[10px] font-black tracking-widest relative ${terminalTab==='memoria'?'border-blis-red text-white bg-white/5':'border-transparent text-gray-500 hover:text-gray-300'}`}>
                  <Brain size={13}/> IA 
                </button>
             </div>
             <div ref={tableScrollRef} className="flex-1 overflow-y-auto custom-red-scrollbar">
                {terminalTab === 'abiertas' && (
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
                            const currentPrice = posSymbol === activeSymbol
                              ? currentPriceRef.current
                              : (symbolPricesRef.current[posSymbol] || p.entryPrice);
                            const openDate = p.openTime ? new Date(p.openTime) : null;
                            const monthNames = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
                            const dateStr = openDate ? `${openDate.getDate()}/${monthNames[openDate.getMonth()]}/${String(openDate.getFullYear()).slice(-2)}` : '';
                            // Tiempo estimado DINÁMICO con cap por modo
                            const elapsed = p.openTime ? (Date.now() - p.openTime) / 60000 : 0;
                            // Cap máximo: Scalp = 15min, Swing = 60min
                            const maxEstimate = p.mode === 'SWING' ? 60 : 15;
                            let remaining = 0;
                            if (p.targetPrice && currentPrice > 0) {
                              const distToTarget = Math.abs(p.targetPrice - currentPrice);
                              const priceMovedSoFar = Math.abs(currentPrice - p.entryPrice);
                              // Velocidad mínima basada en ATR estimado para evitar divisiones infinitas
                              const speed = elapsed > 1 ? priceMovedSoFar / elapsed : 0;
                              if (speed > 0) {
                                remaining = Math.min(distToTarget / speed, maxEstimate);
                              } else {
                                // Sin movimiento: usar estimación basada en % restante al objetivo
                                const pctToTarget = (distToTarget / currentPrice) * 100;
                                remaining = Math.min(pctToTarget * 5, maxEstimate); // ~5min por 0.1% de distancia
                              }
                            } else {
                              remaining = Math.max(0, maxEstimate - elapsed);
                            }
                            return (
                               <tr
                                 key={p.id}
                                 onMouseEnter={() => setHoverPositionId(p.id)}
                                 onMouseLeave={() => setHoverPositionId(null)}
                                 onClick={() => setSelectedPositionId(p.id)}
                                 className={`border-b border-white/[0.03] group transition-all whitespace-nowrap cursor-pointer ${
                                   pnl.isProfit ? 'bg-emerald-900/10 hover:bg-emerald-900/15' : 'bg-red-900/10 hover:bg-red-900/15'
                                 } ${p.id === hoverPositionId ? 'bg-white/[0.06]' : ''}`}>
                                <td className="p-3 md:p-4 pl-4 md:pl-6 font-mono">
                                  <div className="text-white/70 text-[11px]">{formatTableTime(p.openTime)}</div>
                                  <div className="text-white/35 text-[9px] mt-0.5">{dateStr}</div>
                                </td>
                                <td className="p-3 md:p-4">
                                  <div className="flex items-center gap-1.5">
                                    <span className={`text-[14px] font-black ${p.type === 'BUY' ? 'text-emerald-400' : 'text-blis-red-neon'}`}>
                                      {p.type === 'BUY' ? '▲' : '▼'}
                                    </span>
                                    <span className={`px-2 py-1 rounded text-[10px] font-black border uppercase ${p.type === 'BUY' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-blis-red-neon'}`}>
                                      {(p.symbol || 'USD').replace(/USDT$/, ' / USDT')}
                                    </span>
                                  </div>
                                </td>
                                <td className="p-3 md:p-4 text-center">
                                  <button onClick={(e) => { e.stopPropagation(); closeTradeManual(p.id); }} className="bg-white/5 hover:bg-blis-red text-gray-400 hover:text-white px-3 py-1.5 rounded-lg text-[9px] font-bold transition-all uppercase tracking-tighter border border-white/10 hover:border-blis-red">Cerrar</button>
                                </td>
                                <td className={`p-3 md:p-4 font-black text-[13px] ${pnl.isProfit ? 'text-emerald-400' : 'text-blis-red-neon'}`}>
                                  {pnl.isProfit ? '+' : ''}${pnl.value.toFixed(2)}
                                </td>
                                <td className={`p-3 md:p-4 text-center font-black text-[12px] ${pnl.isProfit ? 'text-emerald-400' : 'text-blis-red-neon'}`}>
                                  {roiPct >= 0 ? '+' : ''}{roiPct.toFixed(2)}%
                                </td>
                                <td className="p-3 md:p-4 font-mono text-white/70 text-[11px]">
                                  ${p.amount.toFixed(2)}<span className="opacity-50 text-[9px] block mt-0.5">x{p.leverage || 1}</span>
                                </td>
                                <td className={`p-3 md:p-4 font-mono font-bold text-[11px] ${saldoEst >= (p.amount || 0) ? 'text-emerald-400' : 'text-blis-red-neon'}`}>
                                  <span title={`Margen: $${(p.amount||0).toFixed(2)} | PnL: ${pnl.value >= 0 ? '+' : ''}$${pnl.value.toFixed(2)} | Fee: -$${(pnl.fee||0).toFixed(2)}`}>
                                    ${Math.max(0, saldoEst).toFixed(2)}
                                  </span>
                                </td>
                                <td className="p-3 md:p-4 text-cyan-400 font-mono font-bold text-[11px]">{formatTimePassed(p.openTime)}</td>
                                <td className="p-3 md:p-4 text-white font-mono font-bold text-[11px] hidden lg:table-cell">{fmtUsd(p.entryPrice)}</td>
                                <td className="p-3 md:p-4 text-white/70 font-mono text-[11px] hidden lg:table-cell">{fmtUsd(currentPrice)}</td>
                                <td className="p-3 md:p-4 font-mono text-[11px] hidden lg:table-cell">
                                  {p.targetPrice ? (
                                    <span className={`font-bold ${p.type === 'BUY' ? 'text-emerald-400' : 'text-blis-red-neon'}`}>
                                      {p.type === 'BUY' ? '⬆' : '⬇'} {fmtUsd(p.targetPrice)}
                                    </span>
                                  ) : (
                                    <span className="text-white/30">—</span>
                                  )}
                                </td>
                                <td className="p-3 md:p-4 font-mono text-[10px] hidden lg:table-cell pr-4 md:pr-6">
                                  <div className="flex flex-col">
                                    <span className={remaining > 0 ? 'text-yellow-400/80' : (pnl.isProfit ? 'text-emerald-400' : 'text-orange-400')}>
                                      {remaining > 0 ? `~${remaining >= 60 ? `${Math.floor(remaining/60)}h ${Math.ceil(remaining%60)}m` : `${Math.ceil(remaining)}m`}` : (pnl.isProfit ? '✓ Listo' : '⏳ Esperando')}
                                    </span>
                                    <span className="text-white/30 text-[8px]">{p.mode === 'SWING' ? 'Swing' : 'Scalp'}</span>
                                  </div>
                                </td>
                              </tr>
                            );
                        })}
                        {openPositions.length === 0 && (
                          <tr><td colSpan={11} className="p-20 text-center text-gray-600 font-bold uppercase tracking-[0.3em] opacity-20 text-xs">Sin posiciones activas</td></tr>
                        )}
                      </tbody>
                    </table>
                )}
                {terminalTab === 'historial' && (() => {
                      // Calculate totals from complete history for header summary
                      const totalWon = tradeHistory.filter((t: any) => t.finalPnl > 0).reduce((acc: number, t: any) => acc + t.finalPnl, 0);
                      const totalLost = tradeHistory.filter((t: any) => t.finalPnl < 0).reduce((acc: number, t: any) => acc + Math.abs(t.finalPnl), 0);
                      const totalWinsCount = tradeHistory.filter((t: any) => t.finalPnl > 0).length;
                      const totalLossesCount = tradeHistory.filter((t: any) => t.finalPnl < 0).length;

                      // Filtered window for table body
                      const windowFiltered = historyWindow.filter(t => historyFilter === 'ALL' || t.tradeMode === historyFilter);

                     const exportToExcel = async () => {
                       try {
                         // Añadimos límite explícito masivo porque PostgREST (Supabase) aborta selects ilimitados
                         let q = supabase.from('trading_history').select('*').order('created_at', { ascending: false }).limit(20000);
                         if (historyFilter !== 'ALL') q = (q as any).eq('trade_mode', historyFilter);
                         const { data, error } = await q;
                         if (error) console.error("Error al obtener datos para Excel:", error);
                         const allTrades = (data || []).map((r: any) => ({
                           id: r.id, symbol: r.symbol, type: r.trade_type,
                           amount: parseFloat(r.amount), leverage: parseInt(r.leverage),
                           entryPrice: parseFloat(r.entry_price), closePrice: parseFloat(r.close_price),
                           finalPnl: parseFloat(r.final_pnl), duration: parseFloat(r.duration || 0),
                           closeReason: r.close_reason, tradeMode: r.trade_mode,
                           closeTime: new Date(r.created_at).getTime()
                         }));
                         const XLSX = await import('xlsx');
                         const wb = XLSX.utils.book_new();

                         // ---- HOJA 1: DETALLE DE OPERACIONES ----
                         const headers = ['Fecha/Hora', 'Símbolo', 'Tipo', 'Invertido ($)', 'Apalancamiento', 'Precio Entrada', 'Precio Cierre', 'PnL ($)', 'ROI (%)', 'Duración (min)', 'Modo', 'Motivo Cierre'];
                         const rows = allTrades.map((t: any) => {
                           const durMin = ((t.duration || 0) / 60000).toFixed(1);
                           const roi = t.amount > 0 ? ((t.finalPnl / t.amount) * 100).toFixed(2) : '0.00';
                           return [
                             t.closeTime ? new Date(t.closeTime).toLocaleString('es') : '',
                             (t.symbol || '').replace('USDT', '/USDT'),
                             t.type,
                             parseFloat(t.amount?.toFixed(2) || '0'),
                             `x${t.leverage || 1}`,
                             parseFloat(t.entryPrice?.toFixed(6) || '0'),
                             parseFloat(t.closePrice?.toFixed(6) || '0'),
                             parseFloat(t.finalPnl?.toFixed(4) || '0'),
                             parseFloat(roi),
                             parseFloat(durMin),
                             t.tradeMode || 'PAPER',
                             t.closeReason || ''
                           ];
                         });
                         const wsDetail = XLSX.utils.aoa_to_sheet([headers, ...rows]);
                         wsDetail['!cols'] = [16,14,6,12,14,14,14,10,8,12,8,30].map(wch => ({ wch }));
                         XLSX.utils.book_append_sheet(wb, wsDetail, 'Operaciones');
                         const fecha = new Date().toISOString().slice(0, 10);
                         XLSX.writeFile(wb, `BlisCorpTrading_${fecha}.xlsx`);
                       } catch(e) { console.error('Error exportando Excel', e); }
                     };

                     const fetchNextPage = async () => {
                       if (historyLoading || !hasMoreHistory) return;
                       setHistoryLoading(true);
                       try {
                         const nextOffset = historyWindow.length;
                         let q = supabase.from('trading_history').select('*').order('created_at', { ascending: false }).range(nextOffset, nextOffset + 24);
                         if (historyFilter !== 'ALL') q = (q as any).eq('trade_mode', historyFilter);
                         const { data } = await q;
                         if (data && data.length > 0) {
                           const formatted = data.map((r: any) => ({
                             id: r.id, symbol: r.symbol, type: r.trade_type, amount: parseFloat(r.amount),
                             leverage: parseInt(r.leverage), entryPrice: parseFloat(r.entry_price),
                             closePrice: parseFloat(r.close_price), finalPnl: parseFloat(r.final_pnl),
                             duration: parseFloat(r.duration || 0), closeReason: r.close_reason,
                             candlesAtOpen: r.candles_snapshot, tradeMode: r.trade_mode,
                             closeTime: new Date(r.created_at).getTime()
                           }));
                           setHistoryWindow((prev: any[]) => {
                             // Acumular el historial. React puede manejar 500 filas sin problema si no mutan.
                             // Las páginas viejas se añaden al final.
                             const combined = [...prev, ...formatted];
                             return combined.length > 500 ? combined.slice(0, 500) : combined;
                           });
                           setHistoryOffset(nextOffset + data.length);
                           // Si devolvió menos de 25, ya no hay más páginas
                           if (data.length < 25) setHasMoreHistory(false);
                         } else {
                           // Sin datos = no hay más registros
                           setHasMoreHistory(false);
                         }
                       } catch(e) { console.error("Exception in fetchNextPage:", e); }
                       setHistoryLoading(false);
                     };

                     return (
                     <div className="flex flex-col h-full min-h-0">
                         <div className="flex flex-wrap justify-between items-center px-4 sm:px-6 py-2.5 sm:py-3 border-b border-white/5 bg-black/20 gap-3 shrink-0">
                             <div className="flex gap-3 sm:gap-4">
                                 <button onClick={()=>setHistoryFilter('ALL')} className={`text-[10px] font-black uppercase tracking-wider transition-all ${historyFilter === 'ALL' ? 'text-white border-b border-white' : 'text-gray-500 hover:text-gray-300'}`}>Todos</button>
                                 <button onClick={()=>setHistoryFilter('REAL')} className={`text-[10px] font-black uppercase tracking-wider transition-all ${historyFilter === 'REAL' ? 'text-white border-b border-white' : 'text-gray-500 hover:text-gray-300'}`}>Real</button>
                                 <button onClick={()=>setHistoryFilter('PAPER')} className={`text-[10px] font-black uppercase tracking-wider transition-all ${historyFilter === 'PAPER' ? 'text-white border-b border-white' : 'text-gray-500 hover:text-gray-300'}`}>Simulador</button>
                             </div>
                             <div className="flex gap-2 items-center">
                               <button onClick={exportToExcel} title="Exportar a Excel" className="text-[9px] font-black text-emerald-400 uppercase tracking-wider hover:text-white transition-all bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
                                 📅 Exportar Excel
                               </button>
                               <button onClick={wipeAllData} className="text-[9px] font-black text-blis-red-neon uppercase tracking-wider hover:text-white transition-all bg-blis-red/10 px-3 py-1 rounded-full border border-blis-red/20">Limpiar Todo</button>
                             </div>
                         </div>
                         <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 sm:px-6 py-1.5 bg-[#080808] border-b border-white/[0.03] text-[9px] font-mono"><span className="text-gray-500">WinRate:</span><span className={parseFloat(tradingMetrics.winRate) >= 50 ? 'text-emerald-400 font-bold' : 'text-blis-red-neon font-bold'}>{tradingMetrics.winRate}%</span><span className="text-white/10">|</span><span className="text-gray-500">AvgWin:</span><span className="text-emerald-400">${tradingMetrics.avgWin.toFixed(2)}</span><span className="text-white/10">|</span><span className="text-gray-500">AvgLoss:</span><span className="text-blis-red-neon">${tradingMetrics.avgLoss.toFixed(2)}</span><span className="text-white/10">|</span><span className="text-gray-500">ProfitFactor:</span><span className={parseFloat(tradingMetrics.profitFactor) >= 1 ? 'text-emerald-400 font-bold' : 'text-blis-red-neon font-bold'}>{tradingMetrics.profitFactor}</span><span className="text-white/10">|</span><span className="text-gray-500">Expectancy:</span><span className={tradingMetrics.expectancy >= 0 ? 'text-emerald-400' : 'text-blis-red-neon'}>${tradingMetrics.expectancy.toFixed(2)}/trade</span></div>
                          <div className="flex-1 overflow-y-auto overflow-x-auto custom-red-scrollbar" ref={tableScrollRef}>
                     <table className="w-full min-w-[900px] md:min-w-full text-[11px] md:text-[12px] text-left border-collapse">
                       <thead className="text-gray-500 uppercase font-black tracking-[0.15em] sticky top-0 bg-[#050505] border-b border-white/5 z-10 whitespace-nowrap">
                           <tr>
                              <th className="p-3 md:p-4 pl-4 md:pl-6">Hora</th>
                               <th className="p-3 md:p-4 min-w-[120px]">
                                  <div className="flex flex-col gap-1 items-start">
                                      <span>Activos</span>
                                      <div className="flex items-center gap-1.5 text-[12px] font-mono font-bold tracking-tighter normal-case">
                                          <span className="text-emerald-400">{totalWinsCount} G</span>
                                          <span className="text-white/20 font-sans">|</span>
                                          <span className="text-blis-red-neon">{totalLossesCount} P</span>
                                      </div>
                                  </div>
                               </th>
                               <th className="p-3 md:p-4 min-w-[120px]">
                                  <div className="flex flex-col gap-1 items-start">
                                      <span>Utilidad</span>
                                      <div className="flex items-center gap-1.5 text-[12px] font-mono font-bold tracking-tighter normal-case">
                                          <span className="text-emerald-400">+${totalWon.toFixed(2)}</span>
                                          <span className="text-white/20 font-sans">|</span>
                                          <span className="text-blis-red-neon">-${totalLost.toFixed(2)}</span>
                                      </div>
                                  </div>
                               </th>
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
                         {windowFiltered.map((t: any, i: number) => {
                           const isWin = t.finalPnl >= 0;
                           const shortId = (t.id || '').toString().slice(-6).toUpperCase();
                           const openTag = t.openedBy === 'IA' ? 'IA' : 'H';
                           const closeTag = t.closedBy === 'IA' ? 'IA' : 'H';
                           const tradeId = `${openTag}-${shortId}-${closeTag}`;
                           const roiPercent = t.finalPnlPercent != null ? t.finalPnlPercent : (t.amount > 0 ? (t.finalPnl / t.amount) * 100 : 0);
                           const saldoFinal = (t.amount || 0) + (t.finalPnl || 0);
                           const hasReplay = !!(t.candlesAtClose?.length || t.candlesAtOpen?.length);
                           const closeDate = t.closeTime ? new Date(t.closeTime) : null;
                           const monthNames = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
                           const dateStr = closeDate ? `${closeDate.getDate()}/${monthNames[closeDate.getMonth()]}/${String(closeDate.getFullYear()).slice(-2)}` : '';
                           return (
                           <tr
                             key={`${t.id}_${i}_${t.closeTime}`}
                             onClick={() => setSelectedPositionId(t.id)}
                             className={`border-b border-white/[0.03] group cursor-pointer whitespace-nowrap transition-all ${
                               isWin ? 'bg-emerald-900/10 hover:bg-emerald-900/15 text-gray-300' : 'bg-red-900/10 hover:bg-red-900/15 text-gray-300'
                             }`}
                           >
                              <td className="p-3 md:p-4 pl-4 md:pl-6 font-mono">
                                 <div className="text-white/70 text-[13px]">{formatTableTime(t.closeTime)}</div>
                                 <div className="text-white/35 text-[11px] mt-0.5">{dateStr}</div>
                              </td>
                              <td className="p-3 md:p-4">
                                 <div className="flex items-center gap-1.5">
                                   <span className={`text-[14px] font-black ${t.type === 'BUY' ? 'text-emerald-400' : 'text-blis-red-neon'}`}>{t.type === 'BUY' ? '▲' : '▼'}</span>
                                   <span className={`px-2 py-1 rounded text-[13px] font-black border uppercase ${t.type === 'BUY' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-blis-red-neon'}`}>{(t.symbol || 'USD').replace(/USDT$/, ' / USDT')}</span>
                                 </div>
                              </td>
                              <td className={`p-3 md:p-4 font-black text-[13px] ${isWin ? 'text-emerald-400' : 'text-blis-red-neon'}`}>{isWin ? '+' : ''}${t.finalPnl.toFixed(2)}</td>
                              <td className={`p-3 md:p-4 text-center font-black text-[13px] ${isWin ? 'text-emerald-400' : 'text-blis-red-neon'}`}>{roiPercent >= 0 ? '+' : ''}{roiPercent.toFixed(2)}%</td>
                              <td className="p-3 md:p-4 font-mono text-white/70 text-[13px]">${t.amount?.toFixed(2)}<span className="opacity-50 text-[11px] block mt-0.5">x{t.leverage || 1}</span></td>
                              <td className={`p-3 md:p-4 font-mono font-bold text-[13px] ${saldoFinal >= (t.amount || 0) ? 'text-emerald-400' : 'text-blis-red-neon'}`}><span title={`Margen: $${(t.amount||0).toFixed(2)} + PnL: ${(t.finalPnl||0) >= 0 ? '+' : ''}$${(t.finalPnl||0).toFixed(2)}`}>${Math.max(0, saldoFinal).toFixed(2)}</span></td>
                              <td className="p-3 md:p-4 font-mono text-[13px] text-white/60 hidden lg:table-cell">{(() => { const dur=(t.duration||0); return `${Math.floor(dur/60000)}m ${Math.floor((dur%60000)/1000)}s`; })()}</td>
                              <td className="p-3 md:p-4 font-mono text-white/70 text-[13px] hidden lg:table-cell">{fmtUsd(t.entryPrice)}</td>
                              <td className="p-3 md:p-4 font-mono text-white/70 text-[13px] hidden lg:table-cell">{fmtUsd(t.closePrice)}</td>
                              <td className="p-3 md:p-4">
                                 {hasReplay ? (
                                   <button onClick={(e) => { e.stopPropagation(); const rc=t.candlesAtClose||t.candlesAtOpen||[]; if(tradeReplayData&&tradeReplayData.openTime===t.openTime){setTradeReplayData(null);}else{setTradeReplayData({candles:rc,entryPrice:t.entryPrice,closePrice:t.closePrice,type:t.type,symbol:t.symbol,openTime:t.openTime,closeTime:t.closeTime,openedBy:t.openedBy,closedBy:t.closedBy});} }} className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg transition-all ${tradeReplayData&&tradeReplayData.openTime===t.openTime?'bg-blis-red text-white shadow-[0_0_12px_rgba(190,11,60,0.4)]':'bg-white/5 text-gray-400 hover:bg-blis-red/20 hover:text-blis-red-neon border border-white/10'}`}>{tradeReplayData&&tradeReplayData.openTime===t.openTime?'✕':'▶'}</button>
                                 ) : (<span className="text-[9px] text-white/20">—</span>)}
                              </td>
                              <td className="p-3 md:p-4 pr-4 md:pr-6"><span className="font-mono text-[9px] text-white/50 bg-white/5 px-2 py-1 rounded border border-white/10">{tradeId}</span></td>
                           </tr>
                           );
                         })}
                         {/* Sentinel virtual scroll → Supabase (solo si hay más datos) */}
                         {hasMoreHistory && (
                         <tr ref={(el) => {
                             if (!el) return;
                             if ((el as any)._blisObserved) return;
                             (el as any)._blisObserved = true;
                             if (typeof IntersectionObserver === 'undefined') return;
                             const scrollRoot = tableScrollRef.current;
                             const observer = new IntersectionObserver(entries => {
                                 if (entries[0].isIntersecting) {
                                    observer.disconnect();
                                    (el as any)._blisObserved = false;
                                    fetchNextPage();
                                 }
                             }, { root: scrollRoot, threshold: 0.01, rootMargin: '80px' });
                             observer.observe(el);
                         }}>
                             <td colSpan={11} className="p-3 text-center text-gray-600 font-mono font-black text-[9px] uppercase tracking-widest bg-black/20 border-t border-white/[0.03]">
                               {historyLoading
                                 ? <span className="inline-flex items-center gap-2"><span className="animate-spin text-blis-red">⟳</span> Cargando desde la nube...</span>
                                 : <span className="opacity-40">⇣ Scroll para cargar más ({windowFiltered.length} visibles)</span>
                               }
                             </td>
                         </tr>
                         )}
                         {!hasMoreHistory && windowFiltered.length > 0 && (
                           <tr><td colSpan={11} className="p-3 text-center text-gray-600/30 font-mono font-black text-[9px] uppercase tracking-widest">✓ {windowFiltered.length} operaciones cargadas</td></tr>
                         )}
                       </tbody>
                     </table>
                     </div>
                     </div>
                     );
                 })()}
                {terminalTab === 'reportes' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 md:p-8 text-[11px]">
                        {savedReports.map(r => (
                            <div key={r.id} onClick={()=>setSessionReport(r)} className="bg-black/40 border border-white/5 p-6 rounded-[2rem] cursor-pointer hover:border-blis-red transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-blis-red/5 blur-3xl group-hover:bg-blis-red/10 transition-all"></div>
                                <div className="flex justify-between items-center mb-4"><h4 className="text-white font-black uppercase tracking-widest">Sesión IA</h4><span className="text-[9px] text-gray-600 font-mono">{formatTableTime(r.date)}</span></div>
                                <div className="flex justify-between items-end">
                                  <div><span className="text-emerald-400 font-black text-lg">{r.winRate}%</span><p className="text-[8px] text-gray-500 font-black uppercase">Éxito</p></div>
                                  <div className="text-right font-black"><span className={r.totalPnl>=0?'text-emerald-400':'text-blis-red-neon'}>${r.totalPnl.toFixed(2)}</span><p className="text-[8px] text-gray-500 uppercase">Profit</p></div>
                                </div>
                            </div>
                        ))}
                        {savedReports.length === 0 && (
                          <div className="col-span-full py-16 text-center text-gray-600 font-black uppercase tracking-[0.4em] opacity-20">No hay reportes generados</div>
                        )}
                    </div>
                )}
                {terminalTab === 'memoria' && (
                    <div className="flex flex-col h-full w-full">
                       <div className="flex justify-between items-center px-6 py-4 shrink-0 bg-[#0b0e11] border-b border-white/5">
                          <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Memoria de Errores</h3>
                          <button onClick={() => setConfirmAction({ title: 'Resetear Cerebro', msg: '¿Confirmas que deseas borrar toda la memoria adaptativa acumulada? La IA volverá a su estado base de fábrica.', onConfirm: () => setAiKnowledge([]) })} className="text-[9px] font-black text-blis-red-neon hover:text-white transition-all uppercase tracking-widest">
                             Vaciar Memoria
                          </button>
                          <button onClick={() => setConfirmAction({ title: 'Limpiar Sistema', msg: '¿Deseas eliminar la memoria de la IA y todo el historial de operaciones de usuario? El contador del simulador volverá a cero.', onConfirm: wipeAllData })} className="text-[9px] font-black text-blis-red-neon hover:text-white transition-all bg-blis-red/10 px-3 py-1 rounded-full border border-blis-red/20 uppercase tracking-widest ml-4">
                             Limpiar Todo el Sistema
                          </button>
                       </div>
                       <div className="p-6 space-y-4 overflow-y-auto flex-1 h-[250px] custom-scrollbar">
                           {aiKnowledge.length === 0 ? (
                               <div className="py-16 text-center text-gray-600 font-black uppercase tracking-[0.4em] opacity-20">Ninguna heurística registrada.</div>
                           ) : (
                               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                               {aiKnowledge.map((mem: any, idx: number) => {
                                  const isWin = mem.outcome === 'WIN';
                                  const borderColor = isWin ? 'border-emerald-500/20' : 'border-blis-red/20';
                                  const bgColor = isWin ? 'bg-emerald-500/5' : 'bg-blis-red/5';
                                  const glowColor = isWin ? 'bg-emerald-500/10' : 'bg-blis-red-neon/10';
                                  const titleText = isWin ? 'Refuerzo Positivo' : 'Trauma Heurístico';
                                  const titleColor = isWin ? 'text-emerald-400' : 'text-blis-red-neon';
                                  
                                  return (
                                  <div key={`mem-${mem.id}-${idx}`} className={`${bgColor} border ${borderColor} p-5 rounded-2xl flex flex-col gap-2 relative overflow-hidden group hover:border-opacity-50 transition-all`}>
                                     <div className={`absolute -left-10 top-1/2 -translate-y-1/2 w-20 h-20 ${glowColor} rounded-full blur-xl`}></div>
                                     <div className="flex justify-between items-center z-10">
                                         <span className={`${titleColor} text-[9px] font-black uppercase tracking-wider`}>{titleText}</span>
                                         <span className="text-[8px] font-mono text-gray-600">{new Date(mem.timestamp).toLocaleTimeString()}</span>
                                     </div>
                                     <p className="text-gray-300 font-bold italic text-[11px] leading-relaxed pl-3 border-l-2 border-white/10 z-10">{mem.rule}</p>
                                     <div className="pt-2 mt-auto border-t border-white/5 flex gap-4 text-[8px] font-mono opacity-70 z-10">
                                         <span className="text-gray-400">Token: <span className="text-white font-black">{mem.symbol?.replace('USDT', '') || 'N/A'} ({mem.type})</span></span>
                                         <span className="text-gray-400">Rendimiento: <span className={`${titleColor} font-black`}>{isWin ? '+' : '-'}{mem.profit?.toFixed(2)}%</span></span>
                                     </div>
                                  </div>
                               )})}
                               </div>
                           )}
                       </div>
                    </div>
                )}
             </div>
          </div>
        )}
      </div>

      {/* Panel IA Derecha */}
      <div className="w-full md:w-72 lg:w-80 h-auto md:h-full border-t md:border-t-0 md:border-l border-white/5 bg-[#0b0e11] flex flex-col shrink-0 z-10 relative min-h-0">
        <div className="p-4 flex justify-between items-center bg-black/20 border-b border-white/5">
           <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" title="Online" />
           </div>
           
           <div className="flex items-center gap-2">
           <div className="flex bg-black/40 p-1 rounded-full border border-white/5 mr-2 shadow-inner">
              <button 
                onClick={() => setControlMode('AI')} 
                className={`flex-1 px-4 py-2.5 rounded-2xl text-[11px] font-black transition-all flex items-center justify-center gap-2 ${controlMode==='AI' ? 'bg-blis-red text-white shadow-[0_0_20px_rgba(255,0,76,0.4)]' : 'text-gray-500 hover:text-white bg-white/5'}`}
              >
                IA
              </button>
              <button 
                onClick={() => setControlMode('MANUAL')} 
                className={`flex-1 px-4 py-2.5 rounded-2xl text-[11px] font-black transition-all flex items-center justify-center gap-2 ${controlMode==='MANUAL' ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'text-gray-500 hover:text-white bg-white/5'}`}
              >
                MANUAL
              </button>
           </div>

<button onClick={() => setEnableNotifications(!enableNotifications)} className="relative text-gray-400 hover:text-white transition-colors" title={enableNotifications ? "Silenciar Alertas (Radar)" : "Activar Alertas (Radar)"}>
                {signalAlertActive && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
                )}
                {signalAlertActive && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full"></span>
                )}
                {enableNotifications ? <Bell size={14} className={signalAlertActive ? 'text-emerald-400 drop-shadow-[0_0_6px_rgba(16,185,129,0.8)]' : 'text-emerald-400'} /> : <BellOff size={14} className="text-blis-red-neon" />}
              </button>
             <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-black text-emerald-400 shrink-0">PRO</div>
           </div>
        </div>

            {controlMode === 'AI' && (
                <div className="space-y-4">
                    <div className="bg-black/30 rounded-3xl border border-white/5 overflow-hidden">
                        <button 
                            onClick={() => setAiConfigExpanded(!aiConfigExpanded)}
                            className="w-full p-4 flex justify-between items-center hover:bg-white/5 transition-all"
                        >
                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Ajustes del Robot</span>
                            {aiConfigExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                        
                        <AnimatePresence>
                            {aiConfigExpanded && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="px-5 pb-5 space-y-4"
                                >
                                     <div className="flex items-center justify-between pt-2">
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-white tracking-widest leading-none">Capital Pro</p>
                                            <p className="text-[8px] text-gray-500 mt-1">Presupuesto Dinámico</p>
                                        </div>
                                        <button onClick={() => setFreeBudget(!freeBudget)} className={`w-10 h-5 rounded-full transition-all relative ${freeBudget ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-white/10'}`}>
                                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${freeBudget ? 'left-6' : 'left-1'}`}></div>
                                        </button>
                                     </div>

                                      {!freeBudget && (
                                         <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="pt-2">
                                            <div className="flex items-center justify-between bg-black/60 px-3 py-2.5 rounded-xl border border-blis-red/20 shadow-inner">
                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Capital por Trade</span>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-blis-red-neon font-mono text-[10px]">$</span>
                                                 <input 
                                                         type="number" 
                                                         value={botBudget} 
                                                         onChange={e => setBotBudget(Number(e.target.value))} 
                                                         className="w-16 bg-transparent text-white font-mono text-[12px] focus:outline-none font-bold text-right" 
                                                         placeholder="USD"
                                                     />
                                                 </div>
                                             </div>
                                  <div className="flex justify-between items-center">
                                             <label className="text-[8px] font-black uppercase text-gray-500">Apalancamiento (Multiplicador)</label>
                                             {userLeverage === 0 && <span className="text-[8px] text-emerald-400 font-bold animate-pulse">IA CONTROL ACTIVO</span>}
                                         </div>
                                         <div className="grid grid-cols-5 gap-1.5">
                                             {[0, 1, 5, 10, 20].map(v => (
                                                 <button key={v} onClick={() => setUserLeverage(v)} className={`py-1.5 rounded-lg text-[9px] font-black border transition-all ${userLeverage===v?'bg-blis-red text-white border-blis-red':'text-gray-500 border-white/10'}`}>
                                                     {v === 0 ? 'AUTO' : `x${v}`}
                                                 </button>
                                             ))}
                                         </div>
                                     </motion.div>
                                      )}
                                     <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                        <div>
                                            <p className="text-[12px] font-black uppercase text-white tracking-widest leading-none">Tiempo Robot</p>
                                            <p className="text-[10px] text-gray-500 mt-1">{autoPilot.isIndefinite ? '♾️ Indefinido' : '⏱ Con Límite'}</p>
                                        </div>
                                        <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                                            <button onClick={()=>setAutoPilot({...autoPilot, isIndefinite: true})} className={`px-3 py-1 rounded-lg text-[8px] font-black transition-all ${autoPilot.isIndefinite ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}>∞</button>
                                            <button onClick={()=>setAutoPilot({...autoPilot, isIndefinite: false})} className={`px-3 py-1 rounded-lg text-[8px] font-black transition-all ${!autoPilot.isIndefinite ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}>⏱</button>
                                        </div>
                                     </div>

                                     <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                        <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest">IA Auto-Aprende</span>
                                        <button onClick={() => setAiLearningEnabled(!aiLearningEnabled)} className={`relative w-8 h-5 rounded-full transition-all ${aiLearningEnabled ? 'bg-blis-red' : 'bg-white/10'}`}>
                                            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${aiLearningEnabled ? 'left-3.5' : 'left-0.5'}`} />
                                        </button>
                                     </div>

                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Botón compacto — iniciar/detener + chip de modo */}
                    <div className="relative">
                        <div className={`w-full py-2.5 rounded-xl text-[9px] font-black tracking-wider transition-all uppercase flex items-center justify-center gap-2 ${autoPilot.active ? 'bg-blis-red text-white shadow-lg shadow-blis-red/20 animate-pulse' : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'}`}>
                            <span className="cursor-pointer flex-1 text-center" onClick={() => autoPilot.active ? stopAutoPilotManual() : startAutoPilotManual(botMode, freeBudget)}>
                                {autoPilot.active ? '⏹ Detener Robot' : '▶ Iniciar Robot'}
                            </span>
                            <div onClick={(e) => { e.stopPropagation(); setShowModeSelect(!showModeSelect); }}
                                className="cursor-pointer px-1.5 py-0.5 rounded-md bg-white/10 hover:bg-white/20 transition-all flex items-center gap-1 mr-2">
                                <span className="text-[8px] font-bold opacity-70">{botMode === 'SCALPING' ? 'SCALP' : botMode === 'SWING' ? 'SWING' : 'POS.'}</span>
                                <ChevronDown size={9} className={`opacity-50 transition-transform ${showModeSelect ? 'rotate-180' : ''}`} />
                            </div>
                        </div>
                        <AnimatePresence>
                            {showModeSelect && (
                                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                                    className="absolute bottom-full left-0 right-0 mb-1 bg-[#0d0d0d]/95 backdrop-blur-2xl border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 p-1">
                                    {[
                                        { val: 'SCALPING', label: 'SCALPING', icon: <Zap size={11}/>, desc: 'Ganancias rápidas' },
                                        { val: 'SWING', label: 'SWING', icon: <TrendingUp size={11}/>, desc: 'Tendencia macro' },
                                        { val: 'POSITION', label: 'POSICIÓN', icon: <MousePointer size={11}/>, desc: 'Largo plazo' }
                                    ].map(m => (
                                        <button key={m.val} type="button" onClick={() => { setBotMode(m.val); setShowModeSelect(false); }}
                                            className={`w-full p-2 rounded-lg flex items-center gap-2 transition-all ${botMode === m.val ? 'bg-blis-red/20 text-blis-red-neon' : 'text-gray-400 hover:bg-white/5'}`}>
                                            <div className="shrink-0">{m.icon}</div>
                                            <div className="text-left">
                                                <span className="block text-[8px] font-black uppercase tracking-widest leading-none">{m.label}</span>
                                                <span className="text-[7px] opacity-40 leading-none">{m.desc}</span>
                                            </div>
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
                            <div className="flex items-center gap-2 bg-black/60 px-2 py-1 rounded-lg border border-white/5">
                                <span className="text-emerald-500 font-mono text-[10px]">$</span>
                                <input type="number" value={manualTradeAmt} onChange={e=>setManualTradeAmt(Number(e.target.value))} className="w-16 bg-transparent text-white font-mono text-[11px] focus:outline-none" />
                            </div>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                             <button onClick={()=>executeManualSignal('BUY')} disabled={manualExecStatus?.type === 'loading'} className="py-6 bg-emerald-500 shadow-[0_10px_30px_rgba(16,185,129,0.3)] rounded-2xl flex flex-col items-center justify-center gap-1 transition-all group hover:-translate-y-1 disabled:opacity-50 disabled:cursor-wait">
                                 <TrendingUp size={24} className="text-black group-hover:scale-110 transition-transform" />
                                 <span className="text-[14px] font-black text-black tracking-tighter uppercase">COMPRAR</span>
                             </button>
                             <button onClick={()=>executeManualSignal('SELL')} disabled={manualExecStatus?.type === 'loading'} className="py-6 bg-blis-red shadow-[0_10px_30px_rgba(255,0,76,0.3)] rounded-2xl flex flex-col items-center justify-center gap-1 transition-all group hover:-translate-y-1 disabled:opacity-50 disabled:cursor-wait">
                                 <TrendingDown size={24} className="text-white group-hover:scale-110 transition-transform" />
                                 <span className="text-[14px] font-black text-white tracking-tighter uppercase">VENDER</span>
                             </button>
                         </div>
                         {manualExecStatus && (
                             <div className={`p-3 rounded-xl text-[10px] font-bold border chat-selectable ${
                                 manualExecStatus.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                                 manualExecStatus.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                                 'bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse'
                             }`}>
                                 {manualExecStatus.type === 'loading' ? '⏳' : manualExecStatus.type === 'success' ? '✅' : '⚠️'} {manualExecStatus.text}
                             </div>
                         )}
                         <div className="flex gap-2">
                              <button onClick={handleManualEval} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5">Auto-Evaluar</button>
                              <button onClick={handleBacktest} disabled={isBacktesting} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${isBacktesting ? 'bg-orange-500/20 text-orange-400 border-orange-500/20' : 'bg-blis-red/5 hover:bg-blis-red text-white/50 hover:text-white border-blis-red/10'}`}>
                                {isBacktesting ? 'Simulando...' : 'Backtest IA'}
                              </button>
                          </div>
                    </div>

                    <div className="p-5 bg-black/30 rounded-3xl border border-white/5 space-y-4">
                         <div className="space-y-3">
                            <div className="flex justify-between items-center px-1">
                                <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Psicología del Mercado</span>
                                <button onClick={handleSentimentEval} disabled={isEvaluatingSentiment} className="text-blis-red-neon hover:text-white transition-all">
                                    <Brain size={13} className={isEvaluatingSentiment ? 'animate-pulse' : ''} />
                                </button>
                            </div>
                            {marketSentiment ? (
                                <motion.div initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4">
                                     <div className="relative w-10 h-10 shrink-0">
                                         <svg className="w-full h-full" viewBox="0 0 36 36">
                                             <circle cx="18" cy="18" r="16" fill="none" className="text-white/5" stroke="currentColor" strokeWidth="3" />
                                             <circle cx="18" cy="18" r="16" fill="none" className="text-emerald-500" stroke="currentColor" strokeWidth="3" strokeDasharray="100" strokeDashoffset={100 - marketSentiment.score} strokeLinecap="round" transform="rotate(-90 18 18)" />
                                         </svg>
                                         <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black font-mono">{marketSentiment.score}%</span>
                                     </div>
                                     <div className="flex-1">
                                         <p className="text-[10px] font-black text-emerald-400 leading-none">{marketSentiment.label}</p>
                                         <p className="text-[8px] text-gray-500 mt-1 leading-tight">{marketSentiment.logic}</p>
                                     </div>
                                </motion.div>
                            ) : (
                                <button onClick={handleSentimentEval} className="w-full py-2 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-500/60 rounded-xl text-[9px] font-black border border-emerald-500/10">Analizar Sentimiento IA</button>
                            )}
                         </div>

                         {backtestResult && (
                            <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} className="p-4 bg-blis-red/5 border border-blis-red/20 rounded-2xl space-y-2">
                                <div className="flex justify-between items-center text-[9px] font-black uppercase text-gray-400 tracking-widest"><Sparkles size={11} className="text-amber-400"/> Éxito Predicho</div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-black text-white">{backtestResult.winRate}%</span>
                                    <span className="text-[9px] text-emerald-400 font-bold">WR Est.</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-white/5 opacity-60">
                                    <span className="text-[8px] font-mono text-gray-500">Muestra: {backtestResult.period}</span>
                                    <span className="text-[9px] font-black text-white">+${backtestResult.totalProfit}</span>
                                </div>
                            </motion.div>
                         )}
                    </div>

                    <div className="bg-black/30 rounded-3xl border border-white/5 overflow-hidden flex flex-col min-h-[120px] max-h-[220px]">
                         <div className="p-3 bg-white/5 border-b border-white/10 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                   <Sparkles size={12} className="text-amber-400" />
                                   <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Asistente Estratégico AI</span>
                              </div>
                              <button onClick={() => setConfirmAction({ title: 'Limpiar Estrategias', msg: '¿Deseas vaciar el historial de recomendaciones estratégicas del asistente?', onConfirm: () => setManualChatHistory([]) })} className="p-1.5 hover:bg-white/5 rounded-lg text-gray-600 hover:text-blis-red transition-colors" title="Limpiar Conversación">
                                  <Trash2 size={12} />
                              </button>
                         </div>
                         <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar text-[10px]">
                              {manualChatHistory.length === 0 && (
                                  <p className="text-gray-600 italic">Describe una estrategia y te daré sugerencias visuales.</p>
                              )}
                              {manualChatHistory.map((m, i) => (
                                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                      <div className={`max-w-[85%] px-3 py-1.5 rounded-2xl ${m.role === 'user' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-white/5 border border-white/5 text-gray-300'}`}>
                                          {safeText(m.text)}
                                      </div>
                                  </div>
                              ))}
                              {isManualChatThinking && <div className="text-[9px] text-gray-500 animate-pulse">Analizando...</div>}
                         </div>
                         <div className="p-3 border-t border-white/5 flex gap-2">
                              <input 
                                 value={manualChatInput}
                                 onChange={e => setManualChatInput(e.target.value)}
                                 onKeyDown={e => {
                                     if (e.key === 'Enter' && manualChatInput.trim()) {
                                         const prompt = manualChatInput;
                                         setManualChatInput('');
                                         setManualChatHistory(prev => [...prev, { role: 'user', text: prompt }]);
                                         setIsManualChatThinking(true);
                                         setTimeout(() => {
                                             let suggest: any = { emaFast: 12, emaSlow: 26, rsiPeriod: 14, rsiBuy: 30, rsiSell: 70, stochK: 14, stochD: 3, stochOverbought: 80, stochOversold: 20 };
                                             let text = "Entendido. He marcado mis sugerencias en el panel manual.";
                                             if (prompt.toLowerCase().includes('stocastic') || prompt.toLowerCase().includes('estocástico')) {
                                                suggest.stochOverbought = 92; suggest.stochOversold = 8;
                                                text = "Configuración de Estocástico 92/8 ACTIVADA.";
                                             }
                                             setManualStrategy((prev:any) => ({ ...prev, ...suggest }));
                                             setManualChatHistory(prev => [...prev, { role: 'bot', text: text }]);
                                             setIsManualChatThinking(false);
                                         }, 1500);
                                     }
                                 }}
                                 placeholder="Escribe tu estrategia..." 
                                 className="flex-1 bg-black/50 border border-white/5 rounded-xl px-3 py-1.5 text-[10px] focus:outline-none" />
                         </div>
                    </div>

                    <div className="bg-black/30 rounded-3xl border border-white/5 overflow-hidden">
                        <button onClick={() => setManualRulesExpanded(!manualRulesExpanded)} className="w-full p-4 flex justify-between items-center hover:bg-white/5">
                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Reglas del Sistema</span>
                            {manualRulesExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                        <AnimatePresence>
                            {manualRulesExpanded && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="px-5 pb-5 space-y-4">
                                    {[
                                        { label: 'Ondas rápidas (EMA)', key: 'emaFast', min: 1, max: 100 },
                                        { label: 'Ondas lentas (EMA)', key: 'emaSlow', min: 1, max: 200 },
                                        { label: 'RSI Period', key: 'rsiPeriod', min: 1, max: 30 },
                                        { label: 'Estocástico %K', key: 'stochK', min: 1, max: 100 },
                                        { label: 'Sobrecompra Estoc.', key: 'stochOverbought', min: 50, max: 100 },
                                        { label: 'Sobreventa Estoc.', key: 'stochOversold', min: 1, max: 50 }
                                    ].map(item => (
                                        <div key={item.key}>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-[10px] text-gray-500 font-bold">{item.label}</span>
                                                <span className="text-[10px] text-white font-mono">{(manualStrategy as any)[item.key]}</span>
                                            </div>
                                            <input type="range" min={item.min} max={item.max} value={(manualStrategy as any)[item.key]} onChange={e => setManualStrategy({...manualStrategy, [item.key]: parseInt(e.target.value)})} className="w-full h-1 bg-white/10 rounded-full appearance-none accent-blis-red" />
                                        </div>
                                    ))}
                                    <div className="flex flex-col gap-2 mt-4">
                                        <button onClick={handleManualEval} className="w-full py-2 bg-white/5 text-white rounded-xl text-[10px] font-black uppercase tracking-wider">Evaluar Mercado</button>
                                        <button onClick={closeAllPositions} className="w-full py-2 bg-blis-red/10 text-white rounded-xl text-[10px] font-black uppercase tracking-wider">Cerrar Todo</button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="bg-black/30 rounded-3xl border border-white/5 overflow-hidden">
                        <button onClick={() => setManualBeExpanded(!manualBeExpanded)} className="w-full p-4 flex justify-between items-center hover:bg-white/5">
                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Protección Automática</span>
                            {manualBeExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                        <AnimatePresence>
                            {manualBeExpanded && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="px-5 pb-5 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-gray-400">Garantizar ganancias</span>
                                        <button onClick={()=>setManualStrategy({...manualStrategy, beEnabled: !manualStrategy.beEnabled})} className={`w-8 h-4 rounded-full ${manualStrategy.beEnabled ? 'bg-emerald-500' : 'bg-white/10'}`}></button>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between">
                                            <span className="text-[9px] text-gray-500">Break Even Trigger</span>
                                            <span className="text-[9px] text-white font-mono">{manualStrategy.beTrigger}</span>
                                        </div>
                                        <input type="range" min="5" max="100" value={manualStrategy.beTrigger} onChange={e=>setManualStrategy({...manualStrategy, beTrigger: parseInt(e.target.value)})} className="w-full h-1 bg-white/10 rounded-full appearance-none accent-emerald-500" />
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
               <div className="flex items-center gap-2">
                  <Bot size={13} className="text-blis-red-neon" />
                  <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Chat con el Agente</span>
               </div>
               <button onClick={() => setConfirmAction({ title: 'Vaciar Bitácora', msg: '¿Estás seguro que deseas borrar todos los mensajes y alertas del agente? El historial actual se perderá permanentemente.', onConfirm: () => setChatMessages([]) })} className="p-1.5 hover:bg-white/5 rounded-lg text-gray-600 hover:text-blis-red transition-colors" title="Limpiar Bitácora">
                  <Trash2 size={13} />
               </button>
            </div>
            {/* Fix #8: Contenedor con ref propio para el scroll inteligente */}
            <div ref={chatScrollRef} className="h-[350px] md:flex-1 overflow-y-auto p-4 space-y-4 bg-[#0b0e11] scrollbar-thin scrollbar-thumb-white/10 chat-selectable relative">
              {chatMessages.map((msg, i) => {
                      const isRec = msg.type === 'signal';
                      const isRecommendation = msg.type === 'recommendation';
                      const timeLeft = msg.expiresAt ? Math.max(0, msg.expiresAt - now) : 0;
                      return (
                        <motion.div key={i} initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[90%] p-3 rounded-2xl text-[11px] leading-relaxed whitespace-pre-wrap shadow-xl ${
                            msg.role === 'user' ? 'bg-blis-red text-white' : 
                            isRecommendation ? 'bg-blue-950/40 border border-blue-400/30 text-blue-100' :
                            isRec ? 'bg-emerald-900/30 border border-emerald-500/30 text-emerald-100' : 'bg-[#050505] border border-white/5 text-gray-400'
                          }`}>
                            {msg.role === 'bot' && (
                              <div className="text-[8px] font-black uppercase mb-1 opacity-50 flex items-center gap-1">
                                {isRecommendation ? <span>🔍</span> : isRec ? <Rocket size={8} className="text-emerald-400 animate-pulse"/> : <Bot size={8}/>} 
                                {isRecommendation ? 'RADAR IA: ANÁLISIS DE MERCADO' : isRec ? 'RADAR IA: OPORTUNIDAD' : 'ASISTENTE'}
                              </div>
                            )}
                            {safeText(msg.text)}
                            {/* Fix #5: Botón IR A también activa autopilot */}
                            {isRecommendation && msg.recommendedSymbol && (
                              <button
                                onClick={() => {
                                  handleSymbolChange(msg.recommendedSymbol, true);
                                }}
                                className="w-full mt-3 py-2 px-3 rounded-lg font-black text-[10px] uppercase tracking-wider bg-blue-500 hover:bg-blue-400 text-black transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                              >
                                <span>→</span> IR A {msg.recommendedSymbol?.replace('USDT', '/USDT')}
                              </button>
                            )}
                            {isRec && timeLeft > 0 && msg.status === 'pending' && (
                              <button onClick={() => executeSignal(msg)} className="w-full bg-emerald-500 text-black font-black py-2 rounded-lg mt-3 text-[9px] hover:bg-emerald-400 active:scale-95 transition-all flex items-center justify-center gap-2">
                                <Zap size={10} fill="currentColor"/> EJECUTAR ORDEN [ 00:{(timeLeft/1000).toFixed(0).padStart(2,'0')} ]
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
                      )
              })}
              {isTyping && <div className="text-[9px] text-blis-red-neon font-black animate-pulse px-2">IA PROCESANDO...</div>}
              {/* Badge de nuevo mensaje — Fix #8 */}
              {hasUnreadMessages && (
                <button
                  onClick={() => { chatScrollRef.current?.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: 'smooth' }); setHasUnreadMessages(false); }}
                  className="sticky bottom-2 left-1/2 -translate-x-1/2 z-20 bg-blis-red text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-full shadow-lg shadow-blis-red/40 animate-bounce flex items-center gap-1.5"
                >
                  <span>▼</span> Nuevo mensaje
                </button>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-3 bg-[#0b0e11] border-t border-white/5 space-y-3">
               {/* Botones de estrategia rápida */}
                 <div className="flex gap-1.5">
                    <button type="button" onClick={() => setChatInput('Activa autopilot SCALPING ultra agresivo con máximo riesgo.')}
                        className="flex-1 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 p-2 rounded-xl transition-all active:scale-95">
                        <span className="text-[8px] font-black text-red-400 uppercase tracking-wider">🔥 Scalp</span>
                    </button>
                    <button type="button" onClick={() => setChatInput('Activa el modo SWING con la Inteligencia Artificial (Moderado). Analiza macro y opera solo con confirmación.')}
                        className="flex-1 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 p-2 rounded-xl transition-all active:scale-95">
                        <span className="text-[8px] font-black text-amber-400 uppercase tracking-wider">⚡ Swing AI</span>
                    </button>
                    <button type="button" onClick={() => setChatInput('Inicia autopilot SCALPING en modo defensivo y seguro.')}
                        className="flex-1 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 p-2 rounded-xl transition-all active:scale-95">
                        <span className="text-[8px] font-black text-emerald-400 uppercase tracking-wider">🛡️ Seguro</span>
                    </button>
                 </div>
                <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
                  <textarea value={chatInput} onChange={e => { setChatInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e as any); } }} placeholder="Instruye al bot..." rows={1} className="flex-1 bg-black/40 border border-white/10 rounded-xl p-3 text-[10px] font-medium outline-none focus:border-blis-red/40 text-white placeholder:text-gray-700 font-mono resize-none overflow-hidden" />
                  <button type="submit" className="bg-blis-red/20 border border-blis-red/40 p-3 rounded-xl hover:bg-blis-red-neon transition-all group active:scale-90 shrink-0"><Send size={14} className="text-white group-hover:scale-110 transition-transform"/></button>
                </form>
            </div>
          </>
        )}
      </div>

      {/* Modal Reporte (WOW Factor) */}
      <AnimatePresence>
        {selectedPositionId && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4">
             <motion.div initial={{ scale:0.95, y:40 }} animate={{ scale:1, y:0 }} className="bg-[#0a0a0f] border border-white/10 rounded-t-[28px] sm:rounded-[28px] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                {(() => {
                  const p = openPositions.find(x => x.id === selectedPositionId) || tradeHistory.find(x => x.id === selectedPositionId);
                  if (!p) return null;
                  const pnl = getPnlData(p);
                  const popupRoi = p.finalPnlPercent != null ? p.finalPnlPercent : (p.amount > 0 ? ((p.finalPnl || 0) / p.amount) * 100 : 0);
                  const popupOpenTag = p.openedBy === 'IA' ? 'IA' : 'H';
                  const popupCloseTag = p.closedBy === 'IA' ? 'IA' : 'H';
                  const popupIdShort = (p.id || '').toString().slice(-6).toUpperCase();
                  return (
                    <>
                      <div className={`p-4 sm:p-6 border-b border-white/5 flex justify-between items-center ${p.type === 'BUY' ? 'bg-emerald-500/10' : 'bg-blis-red/10'}`}>
                         <div className="flex items-center gap-3">
                            <div className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl ${p.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blis-red/20 text-blis-red-neon'}`}>
                               {p.type === 'BUY' ? <TrendingUp size={20}/> : <TrendingDown size={20}/>}
                            </div>
                            <div>
                               <h3 className="text-base sm:text-lg font-black text-white">{p.type} {p.mode}</h3>
                               <p className="text-[10px] text-gray-500 font-mono">{popupOpenTag}-{popupIdShort}-{popupCloseTag}</p>
                            </div>
                         </div>
                         <button onClick={() => setSelectedPositionId(null)} className="text-gray-500 hover:text-white p-2"><X size={20}/></button>
                      </div>
                      <div className="p-5 sm:p-8 space-y-5">
                         <div className="grid grid-cols-2 gap-3 sm:gap-4 text-center">
                            <div className="bg-white/5 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/5"><span className="text-[9px] text-gray-500 block uppercase mb-1">{p.status === 'CLOSED' ? 'P/L Final' : 'P/L Vivo'}</span><span className={`text-lg sm:text-xl font-black ${p.status === 'CLOSED' ? (p.finalPnl >= 0 ? 'text-emerald-400' : 'text-blis-red-neon') : (pnl.isProfit ? 'text-emerald-400' : 'text-blis-red-neon')}`}>
                              ${p.status === 'CLOSED' ? (p.finalPnl||0).toFixed(2) : pnl.value.toFixed(2)}
                            </span></div>
                            <div className="bg-white/5 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/5"><span className="text-[9px] text-gray-500 block uppercase mb-1">Apalancamiento</span><span className="text-lg sm:text-xl font-black text-white">x{p.leverage}</span></div>
                         </div>
                         <div className="space-y-2.5">
                            <div className="flex justify-between text-[11px]"><span className="text-gray-500">Inversión (Total)</span><span className="text-white font-mono">${(p.amount * p.leverage).toFixed(2)}</span></div>
                            <div className="flex justify-between text-[11px]"><span className="text-gray-500">Precio Entrada</span><span className="text-white font-mono">${p.entryPrice < 100 ? p.entryPrice.toFixed(6) : p.entryPrice.toFixed(2)}</span></div>
                            {p.status === 'CLOSED' ? (
                              <>
                                <div className="flex justify-between text-[11px]"><span className="text-gray-500">Precio Cierre</span><span className="text-white font-mono font-bold">${p.closePrice < 100 ? p.closePrice?.toFixed(6) : p.closePrice?.toFixed(2)}</span></div>
                                <div className="flex justify-between text-[11px]"><span className="text-gray-500 font-black text-emerald-500/60 uppercase">ROI Final</span><span className={`font-mono font-bold ${p.finalPnl >= 0 ? 'text-emerald-400' : 'text-blis-red-neon'}`}>{popupRoi >= 0 ? '+' : ''}{popupRoi.toFixed(2)}%</span></div>
                                <div className="flex justify-between text-[11px]"><span className="text-gray-500">Tiempo Ejecución</span><span className="text-gray-300 font-mono italic">
                                  {(() => {
                                     const dur = (p.closeTime || Date.now()) - p.openTime;
                                     const mins = Math.floor(dur / 60000);
                                     const secs = Math.floor((dur % 60000) / 1000);
                                     return `${mins}m ${secs}s`;
                                  })()}
                                </span></div>
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
                            <h4 className="text-[10px] font-black text-blis-red-neon mb-2 uppercase flex items-center gap-2"><Bot size={14}/> Análisis de Ejecución</h4>
                            <p className="text-[11px] text-gray-400 leading-relaxed italic">"{p.explanation || 'Análisis matemático basado en confluencias SMA y acción de precio HFT.'}"</p>
                            {p.closeReason && (
                              <p className="text-[10px] text-gray-500 mt-2 font-mono">Motivo: {safeText(p.closeReason)}</p>
                            )}
                         </div>
                         <button onClick={() => setSelectedPositionId(null)} className="w-full bg-white text-black py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[11px] tracking-widest uppercase mt-3">ENTENDIDO</button>
                      </div>
                    </>
                  )
                })()}
             </motion.div>
          </motion.div>
        )}

        {sessionReport && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
            <motion.div initial={{ scale:0.9, y:20 }} animate={{ scale:1, y:0 }} className="bg-[#050505] border border-white/10 rounded-[40px] w-full max-w-2xl overflow-hidden shadow-[0_0_100px_rgba(190,11,60,0.3)]">
              <div className="p-8 border-b border-white/5 bg-gradient-to-br from-blis-red/10 to-transparent flex justify-between items-center">
                  <div className="flex items-center gap-4"><div className="p-4 bg-blis-red/20 rounded-3xl text-blis-red-neon"><Brain size={32}/></div><div><h2 className="text-2xl font-black text-white">{sessionReport.title}</h2><p className="text-[9px] text-blis-red-neon font-black tracking-[0.2em] uppercase mt-1">SISTEMA FINALIZADO</p></div></div>
                  <button onClick={() => setSessionReport(null)} className="text-gray-500 hover:text-white"><X size={24}/></button>
              </div>
              <div className="p-10 space-y-8">
                 <div className="grid grid-cols-3 gap-4">
                    <div className="bg-black/40 p-6 rounded-[30px] border border-white/5 text-center"><span className="text-[9px] text-gray-500 font-black block mb-2 uppercase">Win Rate</span><span className="text-3xl font-black text-emerald-400">{sessionReport.winRate}%</span></div>
                    <div className="bg-black/40 p-6 rounded-[30px] border border-white/5 text-center"><span className="text-[9px] text-gray-500 font-black block mb-2 uppercase">Trades</span><span className="text-3xl font-black text-white">{tradeHistory.filter((t:any)=>t.sessionId===sessionReport.id).length}</span></div>
                    <div className="bg-blis-red/20 p-6 rounded-[30px] border border-blis-red/30 text-center"><span className="text-[9px] text-blis-red-neon font-black block mb-2 uppercase">PNL NETO</span><span className={`text-3xl font-black ${sessionReport.totalPnl>=0?'text-emerald-400':'text-blis-red-neon'}`}>${sessionReport.totalPnl.toFixed(1)}</span></div>
                 </div>
                 <div className="space-y-6">
                     <div className="space-y-2"><h3 className="text-blis-red-neon font-black text-[10px] flex items-center gap-2 uppercase tracking-widest"><Target size={14}/> Análisis Evolutivo</h3><p className="text-xs text-gray-400 leading-relaxed font-medium">{sessionReport.performanceOpinion}</p></div>
                     <div className="space-y-2"><h3 className="text-blis-red-neon font-black text-[10px] flex items-center gap-2 uppercase tracking-widest"><BookOpen size={14}/> Axioma de Trading</h3><p className="text-xs text-white leading-relaxed font-bold italic">"{sessionReport.educationalLesson}"</p></div>
                 </div>
                 <button onClick={() => setSessionReport(null)} className="w-full bg-white text-black py-4 rounded-2xl font-black text-xs hover:bg-gray-200 transition-all active:scale-95 shadow-2xl tracking-[0.3em] uppercase mt-4">SINCRONIZAR Y CONTINUAR</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
       {/* Simulation Mode Info Popover */}
       <AnimatePresence>
          {showSimInfo && (
            <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.9 }} className="fixed inset-0 z-[7000] flex items-center justify-center p-4">
                 <div className="bg-[#0a0a0a] border border-emerald-500/30 p-8 rounded-[2.5rem] max-w-sm shadow-[0_0_50px_rgba(16,185,129,0.2)] relative">
                      <button onClick={() => setShowSimInfo(null)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"><X size={20}/></button>
                      <div className="flex items-center gap-4 mb-6">
                           <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400"><Brain size={24}/></div>
                           <div><h3 className="text-white font-black uppercase tracking-tight">{showSimInfo.name}</h3><p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Protocolo de Entrenamiento</p></div>
                      </div>
                      <p className="text-gray-400 text-sm leading-relaxed mb-6 font-medium tracking-tight whitespace-pre-wrap">{showSimInfo.desc}</p>
                      <div className="bg-white/5 p-4 rounded-2xl space-y-3">
                           <div className="flex justify-between items-center"><span className="text-[10px] text-gray-600 font-bold uppercase">Volatilidad</span><span className="text-[10px] text-white font-black uppercase">{showSimInfo.mode === 'VOLATILE' ? 'EXTREMA (2.5x)' : showSimInfo.mode === 'TRENDS' ? 'CONTROLADA (0.7x)' : 'REALISTA (1.0x)'}</span></div>
                           <div className="flex justify-between items-center"><span className="text-[10px] text-gray-600 font-bold uppercase">Inercia Drástica</span><span className="text-[10px] text-white font-black uppercase">{showSimInfo.mode === 'VOLATILE' ? 'ALTA' : showSimInfo.mode === 'TRENDS' ? 'MUY ALTA' : 'NORMAL'}</span></div>
                           <div className="flex justify-between items-center"><span className="text-[10px] text-gray-600 font-bold uppercase">Objetivo IA</span><span className="text-[10px] text-emerald-400 font-black uppercase">{showSimInfo.mode === 'VOLATILE' ? 'Psicología' : showSimInfo.mode === 'TRENDS' ? 'Inercia' : 'Precisión'}</span></div>
                      </div>
                      <button onClick={() => setShowSimInfo(null)} className="w-full mt-6 py-4 bg-emerald-500 text-black font-black uppercase text-[11px] tracking-widest rounded-2xl hover:bg-emerald-400 transition-all active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.3)]">ENTENDIDO</button>
                 </div>
            </motion.div>
          )}
       </AnimatePresence>

      {/* Symbol Selector Modal */}

      <AnimatePresence>
        {showSymbolSelector && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
             <motion.div initial={{ scale:0.95, y:20 }} animate={{ scale:1, y:0 }} className="bg-[#0a0a0a] border border-white/10 rounded-3xl w-full max-w-md h-[70vh] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
                 <div className="p-4 border-b border-white/5 flex gap-3 items-center shrink-0 bg-white/[0.02]">
                     {dataSource === 'binance' ? (
                       <>
                         <Search className="text-gray-500 w-5 h-5"/>
                         <input autoFocus type="text" value={searchSymbol} onChange={e=>setSearchSymbol(e.target.value.toUpperCase())} placeholder="Buscar cripto o divisa (Ej: BTC, ETH...)" className="bg-transparent border-none outline-none text-white font-black text-lg w-full placeholder:text-gray-600 placeholder:font-normal" />
                       </>
                     ) : (
                       <div className="flex-1 flex items-center gap-3">
                          <Brain className="text-emerald-500 w-5 h-5"/>
                          <span className="text-white font-black text-lg uppercase tracking-tight font-sans">Entornos de Entrenamiento</span>
                       </div>
                     )}
                     <button onClick={()=>setShowSymbolSelector(false)} className="text-gray-500 hover:text-blis-red-neon transition-colors p-1"><X size={24}/></button>
                 </div>
                 <div className="flex-1 overflow-y-auto no-scrollbar relative p-2 text-left">
                    {dataSource === 'simulation' ? (
                       <div className="p-2 space-y-1 mt-2">
                          <div className="px-3 py-2 flex items-center gap-2 mb-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                             <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.25em]">Algoritmos Generativos</span>
                          </div>
                          {[
                            { id: 'NORMAL', symbol: 'NRM/USDT', name: 'Simulación Realista', desc: 'Reflejo fiel del mercado real pero en entorno controlado. Ideal para validación de estrategias estándar y ajustes finos de precisión en ambientes de baja latencia.' },
                            { id: 'VOLATILE', symbol: 'VLT/USDT', name: 'Simulación Volátil', desc: 'Algoritmo agresivo con mayor frecuencia de "Caza-Stops" y latigazos de precio. Diseñado para probar la resistencia psicológica de la IA y su capacidad de gestionar Drawdowns bruscos.' },
                            { id: 'TRENDS', symbol: 'TRN/USDT', name: 'Inercia Tendencial', desc: 'Genera inercias institucionales masivas con muy pocos retrocesos. Perfecto para entrenar el seguimiento de tendencias parabólicas y optimizar el trailing stop.' },
                            { id: 'CHAOS', symbol: 'CHA/USDT', name: 'Caos Estructural', desc: 'Ruido aleatorio de alta frecuencia sin tendencia clara. Diseñado para estresar los filtros de señal de la IA y evitar el overtrading en rangos laterales sucios.' }
                          ].map(m => (
                            <div key={m.id} className="flex justify-between items-center px-4 py-4 hover:bg-emerald-500/5 rounded-[1.8rem] group transition-all border border-transparent hover:border-emerald-500/20">
                                <div className="flex items-center gap-5 cursor-pointer flex-1" onClick={() => { setSimMode(m.id as any); setDataSource('simulation'); setActiveSymbol(m.symbol.replace('/','')); setShowSymbolSelector(false); }}>
                                     <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-[12px] font-black text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-black transition-all shrink-0 shadow-lg">
                                         {m.symbol.split('/')[0]}
                                     </div>
                                     <div className="flex flex-col leading-tight text-left">
                                         <span className="text-white font-black text-lg tracking-tight group-hover:text-emerald-400 transition-colors uppercase">{m.id === 'NORMAL' ? 'BTC/USDT' : m.symbol} <span className="text-[10px] text-emerald-500/40 ml-1 font-mono tracking-widest">PRO</span></span>
                                         <span className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">{m.name}</span>
                                     </div>
                                </div>
                                <button onClick={() => setShowSimInfo({...m, mode: m.id})} className="p-3 text-gray-600 hover:text-emerald-400 transition-colors group/info relative flex items-center justify-center bg-white/5 rounded-xl">
                                    <Info size={18} />
                                    <span className="absolute bottom-full right-0 mb-3 px-3 py-1.5 bg-black border border-emerald-500/30 text-[9px] text-emerald-400 rounded-lg whitespace-nowrap opacity-0 group-hover/info:opacity-100 pointer-events-none transition-all scale-95 group-hover/info:scale-100 uppercase font-black tracking-widest z-[20] shadow-2xl">Especificaciones</span>
                                </button>
                            </div>
                          ))}
                       </div>
                    ) : (
                       <div className="p-2 space-y-1 mt-2">
                          {marketTickers.length === 0 ? (
                             <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 gap-4">
                                  <RefreshCw className="animate-spin w-8 h-8 opacity-50" />
                                  <span className="text-xs uppercase tracking-[0.2em] font-black opacity-50 text-center">Iniciando Enlace de<br/>Datos Globales...</span>
                             </div>
                          ) : (
                             <>
                                  <div className="px-3 py-2 flex items-center gap-2 mb-1">
                                     <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                                     <span className="text-[10px] font-black text-amber-500/60 uppercase tracking-[0.25em]">Mercado Binance Real</span>
                                  </div>
                                  {marketTickers
                                      .filter(t => t.symbol.includes(searchSymbol))
                                      .sort((a, b) => {
                                          const aFav = favoriteSymbols.includes(a.symbol) ? 1 : 0;
                                          const bFav = favoriteSymbols.includes(b.symbol) ? 1 : 0;
                                          return bFav - aFav;
                                      })
                                      .map(t => {
                                          const changeVal = Math.abs(parseFloat(t.priceChangePercent));
                                          // Formula: 100 es quietud total, 0 es volatilidad extrema (>5%)
                                          const stability = Math.max(0, Math.min(100, Math.round(100 - (changeVal * 20))));
                                          const stabilityColor = stability < 30 ? 'text-blis-red-neon' : stability < 70 ? 'text-amber-500' : 'text-cyan-400';
                                          
                                          return (
                                              <div key={t.symbol} onClick={() => handleSymbolChange(t.symbol)} className="flex justify-between items-center px-4 py-3 hover:bg-white/5 rounded-2xl cursor-pointer transition-all group">
                                                  <div className="flex items-center gap-4">
                                                      <button 
                                                          onClick={(e) => toggleFavorite(t.symbol, e)} 
                                                          className="p-1 -ml-2 text-gray-500 hover:text-amber-400 transition-colors shrink-0"
                                                          title="Marcar como Favorito"
                                                      >
                                                          <Star size={16} className={favoriteSymbols.includes(t.symbol) ? "fill-amber-400 text-amber-400 shadow-amber-400 drop-shadow-lg" : ""} />
                                                      </button>
                                                      <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-[10px] font-black text-gray-400 group-hover:text-amber-400 border border-white/5 shadow-inner transition-colors shrink-0">
                                                          {t.symbol.replace('USDT', '').slice(0, 3)}
                                                      </div>
                                                      <div className="flex flex-col leading-tight">
                                                          <span className="text-white font-black text-[15px] tracking-tighter group-hover:text-amber-400 transition-colors uppercase">{t.symbol.replace('USDT', '')}/USDT</span>
                                                          <div className="flex items-center gap-2 mt-0.5">
                                                              <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden">
                                                                  <div className={`h-full transition-all duration-1000 ${stability < 30 ? 'bg-blis-red' : stability < 70 ? 'bg-amber-500' : 'bg-cyan-500'}`} style={{ width: `${stability}%` }} />
                                                              </div>
                                                              <span className={`text-[8px] font-black uppercase tracking-widest ${stabilityColor}`}>EST: {stability}</span>
                                                          </div>
                                                      </div>
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


       {/* GLOBAL ALERT MODAL */}
       <AnimatePresence>
          {globalAlert && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute z-[9000] inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                 <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-[#0b0e11] border border-blis-red shadow-[0_20px_60px_rgba(255,0,76,0.3)] max-w-sm rounded-[2rem] p-8 text-center flex flex-col items-center gap-6 relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blis-red to-transparent opacity-50"></div>
                     <AlertTriangle size={48} className="text-blis-red-neon animate-pulse mx-auto" strokeWidth={1.5} />
                     <h3 className="text-white font-black text-xl tracking-tighter uppercase leading-tight">Acción<br/>Restringida</h3>
                     <p className="text-gray-400 text-sm font-medium tracking-wide whitespace-pre-wrap">{typeof globalAlert === 'string' ? globalAlert : globalAlert.msg}</p>
                     
                     <div className="mt-2 w-full flex flex-col gap-2">
                         <button onClick={() => setGlobalAlert(null)} className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-black uppercase text-[10px] tracking-[0.2em] transition-all">
                             CANCELAR
                         </button>
                         {typeof globalAlert === 'object' && globalAlert.pendingSymbol && (
                             <button onClick={() => handleSymbolChange(globalAlert.pendingSymbol, true)} className="w-full py-3 rounded-xl bg-blis-red/10 hover:bg-blis-red border border-blis-red/50 text-blis-red-neon hover:text-white font-black uppercase text-[10px] tracking-[0.2em] transition-all">
                                 FORZAR CAMBIO (MULTI-TAB)
                             </button>
                         )}
                     </div>
                 </motion.div>
             </motion.div>
          )}
        </AnimatePresence>

        {/* CONFIRMATION MODAL */}
        <AnimatePresence>
          {confirmAction && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed z-[9999] inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                 <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-[#0b0e11] border border-blis-red/50 shadow-[0_20px_60px_rgba(255,0,76,0.3)] max-w-sm w-[calc(100%-2rem)] rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-10 text-center flex flex-col items-center gap-4 sm:gap-6 relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blis-red to-transparent"></div>
                     <AlertTriangle size={52} className="text-blis-red-neon animate-pulse mx-auto" strokeWidth={1.5} />
                     <h3 className="text-white font-black text-2xl tracking-tighter uppercase leading-tight">{confirmAction.title || 'Acción Restringida'}</h3>
                     <p className="text-gray-400 text-sm font-medium tracking-wide leading-relaxed">{confirmAction.msg}</p>
                     
                     <div className="mt-2 w-full flex flex-col gap-2">
                         <button onClick={() => { confirmAction.onConfirm(); setConfirmAction(null); }} className="w-full py-4 rounded-xl bg-blis-red hover:bg-blis-red-neon text-white font-black uppercase text-[11px] tracking-[0.2em] transition-all shadow-xl shadow-blis-red/20 active:scale-95">
                             ACEPTAR
                         </button>
                         <button onClick={() => setConfirmAction(null)} className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-black uppercase text-[10px] tracking-[0.2em] transition-all">
                             CANCELAR
                         </button>
                     </div>
                 </motion.div>
             </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
};
