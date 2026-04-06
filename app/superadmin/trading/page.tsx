"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import { TradingTerminal } from './TerminalLogic';
import { ErrorBoundary } from './TerminalComponents';
import { ScannerConsole, ScannerLog } from './ScannerConsole';

const MAX_LOGS = 50;
const SIGNAL_TIMEOUT_MS = 30000;

export default function TradingPage() {
  const [scannerLogs, setScannerLogs] = useState<ScannerLog[]>([]);
  const [signalAlertActive, setSignalAlertActive] = useState(false);
  const signalTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onSymbolChangeRequestRef = useRef<((symbol: string) => void) | null>(null);

  const addScannerLog = useCallback((par: string, mensaje: string, tipo: 'scan' | 'warning' | 'valid') => {
    const newLog: ScannerLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      par,
      mensaje,
      tipo,
    };

    setScannerLogs(prev => [newLog, ...prev].slice(0, MAX_LOGS));

    if (tipo === 'valid') {
      setSignalAlertActive(true);
      
      if (signalTimeoutRef.current) {
        clearTimeout(signalTimeoutRef.current);
      }
      
      signalTimeoutRef.current = setTimeout(() => {
        setSignalAlertActive(false);
      }, SIGNAL_TIMEOUT_MS);
    }
  }, []);

  const handleSymbolChange = useCallback((symbol: string) => {
    if (onSymbolChangeRequestRef.current) {
      onSymbolChangeRequestRef.current(symbol);
    }
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('blis_active_symbol', symbol);
    }
  }, []);

  const handleNavigate = useCallback((par: string) => {
    const symbol = par.replace('/', '');
    handleSymbolChange(symbol);
  }, [handleSymbolChange]);

  useEffect(() => {
    return () => {
      if (signalTimeoutRef.current) {
        clearTimeout(signalTimeoutRef.current);
      }
    };
  }, []);

  return (
    <ErrorBoundary>
      <div className="w-full h-auto overflow-visible md:overflow-hidden flex flex-col">
        <div className="flex-1 min-h-0">
          <TradingTerminal 
            onScannerLog={addScannerLog} 
            onSymbolChangeRequest={handleSymbolChange}
            signalAlertActive={signalAlertActive}
          />
        </div>
        <div className="px-4 pb-4">
          <ScannerConsole 
            logs={scannerLogs} 
            onNavigate={handleNavigate}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}
