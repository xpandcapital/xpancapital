"use client";

import React from 'react';
import { ChartCanvas } from './_components/ChartCanvas';
import { ChartToolbar } from './_components/ChartToolbar';
import { ChartControls } from './_components/ChartControls';
import type { CandleData, Drawing, OpenPosition, AiZone, FVGData, TradeReplayData, TickerState, HoverDataPoint } from './_types';

const TradingChart = React.memo(function TradingChart({
  data,
  ticker,
  dimensions: dims,
  drawings,
  positions,
  chartMath,
  isAiThinking,
  aiZones,
  drawMode,
  isDragging,
  currentDrawing,
  hoverData,
  hoverPositionId,
  setHoverPositionId,
  setSelectedPositionId,
  showGrid = true,
  showSma = true,
  showAiZonesUI = true,
  showPositionLines = true,
  selectedPositionId = null,
  showDom = false,
  tradeReplayData = null
}: {
  data: CandleData[],
  ticker: TickerState,
  dimensions: { width: number; height: number },
  drawings: Drawing[],
  positions: OpenPosition[],
  chartMath: {
    getY: (price: number) => number;
    getX: (index: number) => number;
    getXFromContinuousIndex: (idx: number) => number;
    minPrice: number;
    maxPrice: number;
    visibleCandles: CandleData[];
    candleWidth: number;
    padding: { right: number; top: number; bottom: number; left: number };
    sma15Path: string;
    sma50Path: string;
    chartWidth: number;
    fvgs: FVGData[];
  } | null,
  isAiThinking?: boolean,
  aiZones?: AiZone[],
  drawMode?: string,
  isDragging?: boolean,
  currentDrawing?: Drawing | null,
  hoverData?: HoverDataPoint | null,
  hoverPositionId?: string | null,
  setHoverPositionId?: (id: string | null) => void,
  setSelectedPositionId?: (id: string | null) => void,
  showGrid?: boolean,
  showSma?: boolean,
  showAiZonesUI?: boolean,
  showPositionLines?: boolean,
  selectedPositionId?: string | null,
  showDom?: boolean,
  tradeReplayData?: TradeReplayData | null
}) {
  if (!chartMath) return null;
  if (!dims || dims.width <= 0 || dims.height <= 0) return null;

  const priceRange = chartMath.maxPrice - chartMath.minPrice;
  if (!Number.isFinite(priceRange) || priceRange <= 0) return null;

  const RULER_X = dims.width - (chartMath.padding?.right ?? 80);
  const RULER_W = chartMath.padding?.right ?? 80;

  return (
    <svg width={dims.width} height={dims.height} className="select-none bg-[#0b0e11]">
      <defs>
        <clipPath id="candleArea">
          <rect x={0} y={20} width={RULER_X} height={dims.height - 20} />
        </clipPath>
      </defs>

      <ChartToolbar
        dimensions={dims}
        ticker={ticker}
        chartMath={chartMath}
        RULER_X={RULER_X}
        RULER_W={RULER_W}
        showGrid={showGrid}
        showSma={showSma}
      />

      <ChartCanvas
        data={data}
        ticker={ticker}
        dimensions={dims}
        drawings={drawings}
        positions={positions}
        chartMath={chartMath}
        isAiThinking={isAiThinking}
        aiZones={aiZones}
        drawMode={drawMode}
        isDragging={isDragging}
        currentDrawing={currentDrawing}
        hoverData={hoverData}
        hoverPositionId={hoverPositionId}
        setHoverPositionId={setHoverPositionId}
        setSelectedPositionId={setSelectedPositionId}
        showGrid={showGrid}
        showSma={showSma}
        showAiZonesUI={showAiZonesUI}
        showPositionLines={showPositionLines}
        selectedPositionId={selectedPositionId}
        showDom={showDom}
        tradeReplayData={tradeReplayData}
        RULER_X={RULER_X}
        RULER_W={RULER_W}
      />

      <ChartControls
        showGrid={showGrid}
        showSma={showSma}
        showAiZonesUI={showAiZonesUI}
        showPositionLines={showPositionLines}
        showDom={showDom}
      />
    </svg>
  );
});

export { TradingChart };
