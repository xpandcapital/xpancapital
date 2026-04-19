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
  signalData?: any;
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
  candlesAtOpen?: any[];
  targetPrice?: number | null;
  stopPrice?: number | null;
  binanceQty?: string;
  isReconnected?: boolean;
  _maxNetPercent?: number;
  _autoReverse?: string | boolean;
  _lastCloseFail?: number;
  closePrice?: number;
  closeReason?: string;
  closeTime?: number;
  finalPnl?: number;
  finalPnlPercent?: number;
  duration?: number;
  finalBalance?: number;
  candlesAtClose?: any[];
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
  candlesAtOpen?: any[];
  tradeMode?: string;
  closeTime: number;
  sessionId?: string;
  openedBy?: string;
  closedBy?: string;
  finalPnlPercent?: number;
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
  candles: any[];
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