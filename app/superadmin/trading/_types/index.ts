export interface TradingTerminalProps {
  onScannerLog?: (par: string, mensaje: string, tipo: 'scan' | 'warning' | 'valid') => void;
  onSymbolChangeRequest?: (symbol: string) => void;
  signalAlertActive?: boolean;
}

export type TradeMode = 'REAL' | 'PAPER';
export type SimMode = 'NORMAL' | 'VOLATILE' | 'TRENDS' | 'CHAOS';
export type ControlMode = 'AI' | 'MANUAL';
export type DrawMode = 'cursor' | 'hand' | 'select' | 'line' | 'fibonacci' | 'freehand' | 'eraser';
export type ViewMode = 'split' | 'chart';
export type DataSource = 'binance' | 'simulation';
export type TerminalTab = 'abiertas' | 'historial' | 'reportes' | 'memoria';

export interface AutoPilotState {
  active: boolean;
  expiresAt: number | null;
  totalBudget: number;
  leverage: number;
  sessionId: string | null;
  mode: string;
  scanningStopped: boolean;
  riskLevel: string;
  isIndefinite: boolean;
}

export interface ChatMessage {
  id?: number | string;
  role: 'bot' | 'user' | 'system';
  text: string;
  timestamp: number;
  type?: string;
  status?: string;
  expiresAt?: number;
  signalData?: {
    type: 'BUY' | 'SELL';
    amount?: number;
    symbol?: string;
    entryPrice?: number;
    reason?: string;
    leverage?: number;
    mode?: string;
    targetPrice?: number;
    stopPrice?: number;
    strategy?: string;
    _lastLevLog?: number;
  };
  recommendedSymbol?: string;
  recommendedDirection?: string;
}

export interface OpenPosition {
  id: number | string;
  symbol: string;
  type: 'BUY' | 'SELL';
  entryPrice: number;
  amount: number;
  quantity?: number;
  timestamp?: number;
  openTime?: number;
  leverage: number;
  fee?: number;
  status?: string;
  mode?: string;
  sessionId?: string | null;
  tradeMode?: string;
  explanation?: string;
  isManual?: boolean;
  openedBy?: string;
  closedBy?: string | null;
  candlesAtOpen?: CandleData[];
  targetPrice?: number | null;
  stopPrice?: number | null;
  binanceQty?: string;
  isReconnected?: boolean;
  _maxNetPercent?: number;
  _autoReverse?: string | boolean;
  _lastCloseFail?: number;
  predictionExpiresAt?: number;
  closePrice?: number;
  closeReason?: string;
  closeTime?: number;
  finalPnl?: number;
  finalPnlPercent?: number;
  duration?: number;
  finalBalance?: number;
  candlesAtClose?: CandleData[];
}

export interface TradeHistoryEntry {
  id: string | number;
  symbol: string;
  type: string;
  amount: number;
  leverage: number;
  entryPrice: number;
  closePrice: number;
  finalPnl: number;
  duration: number;
  closeReason: string;
  candlesAtOpen?: CandleData[];
  candlesAtClose?: CandleData[];
  tradeMode?: string;
  closeTime: number;
  openTime?: number;
  sessionId?: string;
  openedBy?: string;
  closedBy?: string;
  finalPnlPercent?: number;
  mode?: string;
  status?: string;
  fee?: number;
  explanation?: string;
  targetPrice?: number | null;
  stopPrice?: number | null;
}

export interface ManualStrategy {
  emaFast: number;
  emaSlow: number;
  rsiPeriod: number;
  rsiBuy: number;
  rsiSell: number;
  stochK: number;
  stochD: number;
  stochOverbought: number;
  stochOversold: number;
  sl: number;
  tp: number;
  risk: number;
  beEnabled: boolean;
  beTrigger: number;
  beLock: number;
  trailingEnabled: boolean;
  trailingDist: number;
  trailingAfterBE: boolean;
  atrMultiplier: number;
  tpRatio: number;
  emaFast_suggest?: number;
  emaSlow_suggest?: number;
  rsiPeriod_suggest?: number;
  rsiBuy_suggest?: number;
  rsiSell_suggest?: number;
  stochK_suggest?: number;
  stochD_suggest?: number;
  stochOverbought_suggest?: number;
  stochOversold_suggest?: number;
  atrMultiplier_suggest?: number;
  tpRatio_suggest?: number;
  risk_suggest?: number;
  beTrigger_suggest?: number;
  beLock_suggest?: number;
  trailingDist_suggest?: number;
}

export interface Drawing {
  type: string;
  color: string;
  p1?: { index: number; price: number };
  p2?: { index: number; price: number };
  points?: { index: number; price: number }[];
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
}

export interface TradeReplayData {
  candles: CandleData[];
  entryPrice: number;
  closePrice: number;
  type: string;
  symbol: string;
  openTime: number;
  closeTime: number;
  openedBy?: string;
  closedBy?: string;
}

export interface ConfirmAction {
  title: string;
  msg: string;
  onConfirm: () => void;
}

export interface GlobalAlert {
  msg: string;
  pendingSymbol?: string;
}

export interface SessionReport {
  id: string;
  date: number;
  totalPnl: number;
  winRate: string;
  title?: string;
  performanceOpinion?: string;
  educationalLesson?: string;
}

export interface MarketTicker {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  quoteVolume: string;
}

export interface AiKnowledge {
  id: string;
  timestamp: number;
  symbol: string;
  type: string;
  outcome: string;
  profit: number;
  rule: string;
}

// ── Datos de vela OHLCV ──
export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  takerBuyBaseAssetVolume?: number;
  sma15: number | null;
  sma50: number | null;
}

// ── Binance 24hr Ticker ──
export interface BinanceTicker24Hr {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  quoteVolume: string;
}

// ── Binance Balance / Account ──
export interface BinanceBalanceEntry {
  asset: string;
  balance?: string;
  marginBalance?: string;
  walletBalance?: string;
  availableBalance?: string;
}

export interface BinanceSpotBalance {
  asset: string;
  free: string;
  locked: string;
}

export interface BinanceSpotAccount {
  balances: BinanceSpotBalance[];
}

// ── Binance Exchange Info ──
export interface BinanceSymbolFilter {
  filterType: string;
  stepSize?: string;
  minQty?: string;
  notional?: string;
  tickSize?: string;
}

export interface BinanceSymbolInfo {
  symbol: string;
  filters: BinanceSymbolFilter[];
}

export interface BinanceExchangeInfo {
  symbols: BinanceSymbolInfo[];
}

// ── WebSocket ──
export interface WSKlineMsg {
  e: 'kline';
  k: {
    t: number;
    o: string;
    h: string;
    l: string;
    c: string;
    v: string;
    V: string;
  };
}

export interface WSAggTradeMsg {
  e: 'aggTrade';
  p: string;
}

export interface WSTickerPriceMsg {
  symbol: string;
  price: string;
}

// ── Estado de Precio ──
export interface TickerState {
  price: number;
  changePercent: number;
}

// ── Arrastre del gráfico ──
export interface DragStartState {
  x: number;
  y: number;
  panStart: number;
  priceOffsetStart: number;
  zoomStart?: number;
  priceZoomStart: number;
}

// ── Crosshair ──
export interface HoverDataPoint {
  x: number;
  y: number;
  price: number;
  time: number;
}

// ── Vela bajo el cursor ──
export interface HoveredCandle {
  candle: CandleData;
  x: number;
}

// ── FVG (Fair Value Gap) ──
export interface FVGData {
  type: 'bullish' | 'bearish';
  top: number;
  bottom: number;
  startIndex: number;
}

// ── Cálculos del gráfico ──
export interface ChartMathResult {
  visibleCandles: CandleData[];
  getY: (price: number) => number;
  getX: (index: number) => number;
  getPriceFromY: (yPos: number) => number;
  getXFromContinuousIndex: (idx: number) => number;
  getContinuousIndexFromX: (xPos: number) => number;
  candleWidth: number;
  yMax: number;
  yMin: number;
  yRange: number;
  chartWidth: number;
  chartHeight: number;
  padding: { top: number; bottom: number; right: number; left: number };
  dimensions: { width: number; height: number };
  minPrice: number;
  maxPrice: number;
  sma15Path: string;
  sma50Path: string;
  cvdPath: string;
  cvdPanelTop: number;
  cvdPanelHeight: number;
  fvgs: FVGData[];
}

// ── Zona IA ──
export interface AiZone {
  high?: number;
  low?: number;
  type: 'supply' | 'demand';
  target?: number;
}

// ── Resultado de Backtest ──
export interface BacktestResult {
  winRate: number;
  totalProfit: string;
  trades: number;
  period: string;
}

// ── Sentimiento de Mercado ──
export interface MarketSentimentData {
  score: number;
  label: string;
  logic: string;
}

// ── Chat Manual ──
export interface ManualChatEntry {
  role: 'user' | 'bot';
  text: string;
}

// ── Estado de Ejecución Manual ──
export interface ManualExecStatusData {
  text: string;
  type: 'success' | 'error' | 'loading';
}

// ── Mensaje Mock para Señal ──
export interface MockSignalMsg {
  id?: number;
  signalData: {
    type: 'BUY' | 'SELL';
    amount?: number;
    symbol?: string;
    entryPrice?: number;
    reason?: string;
    leverage?: number;
    mode?: string;
    targetPrice?: number;
    stopPrice?: number;
    strategy?: string;
    _lastLevLog?: number;
  };
}

// ── Orden de Binance ──
export interface BinanceOrderParams {
  symbol: string;
  side: string;
  type: string;
  quantity?: string;
  [key: string]: unknown;
}

export interface BinanceOrderResponse {
  error?: string;
  executedQty?: string;
}

// ── Info de Simulación ──
export interface SimInfoData {
  id: string;
  symbol: string;
  name: string;
  desc: string;
  mode: string;
}

// ── Tooltip Global ──
export interface GlobalTooltipState {
  show: boolean;
  text: string;
  x: number;
  y: number;
}

// ── Trade Metrics ──
export interface TradingMetrics {
  winRate: string;
  avgWin: number;
  avgLoss: number;
  profitFactor: string;
  expectancy: number;
  winCount: number;
  lossCount: number;
  totalTrades: number;
}

// ── PnL Data ──
export interface PnlData {
  value: number;
  isProfit: boolean;
  fee: number;
  gross: number;
}

// ── Supabase Row Types ──
export interface TradingHistoryRow {
  id: string;
  symbol: string;
  trade_type: string;
  amount: string;
  leverage: string;
  entry_price: string;
  close_price: string;
  final_pnl: string;
  duration: string;
  close_reason: string;
  candles_snapshot: CandleData[];
  trade_mode: string;
  created_at: string;
}

export interface TradingGlobalStateRow {
  id: string;
  payload: { value: unknown };
}

// ── Resultado de Escaneo ──
export interface ScanResult {
  symbol: string;
  score: number;
  atrPct: number;
  trend: string;
  volStrength: string;
  direction: 'BUY' | 'SELL';
  price: number;
}

// ── TradingResult de AI ──
export interface AIChatResult {
  text: string;
  error?: string;
}
