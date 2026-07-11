"use client";

import React from 'react';
import type { CandleData, FVGData, TickerState } from '../_types';

const NEON_RED    = '#f2d600';
const NEON_YELLOW = '#fff200';

export const ChartToolbar = ({
  dimensions: dims,
  ticker,
  chartMath,
  RULER_X,
  RULER_W,
  showGrid = true,
  showSma = true,
}: {
  dimensions: { width: number; height: number },
  ticker: TickerState,
  chartMath: {
    getY: (price: number) => number;
    getX: (index: number) => number;
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
  RULER_X: number,
  RULER_W: number,
  showGrid?: boolean,
  showSma?: boolean,
}) => {
  if (!chartMath) return null;
  if (!dims || dims.width <= 0 || dims.height <= 0) return null;

  const { getY, getX, minPrice, maxPrice, visibleCandles, padding, sma15Path, sma50Path } = chartMath;
  const cp = ticker?.price ?? 0;
  const priceRange = maxPrice - minPrice;
  if (!Number.isFinite(priceRange) || priceRange <= 0) return null;

  const baseSteps = Math.max(15, Math.floor(dims.height / 28));
  const priceStepCount = Math.min(40, baseSteps);
  const stepSize = priceRange / priceStepCount;
  const candleCount = visibleCandles?.length ?? 0;
  const labelSkip = candleCount > 150 ? 4 : candleCount > 80 ? 2 : 1;

  return (
    <>
      <g style={{ pointerEvents: 'none', userSelect: 'none' }}>
        <text
          x={dims.width / 2}
          y={dims.height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="rgba(255,255,255,0.04)"
          fontSize={dims.width > 800 ? 72 : 32}
          fontFamily="Arial Black, sans-serif"
          fontWeight="bold"
          letterSpacing="0.2em"
        >
          XPAND CORP
        </text>
      </g>

      <g>
        <rect x={0} y={0} width={dims.width} height={20} fill="rgba(0,0,0,0.6)" />
        <line x1={0} y1={20} x2={dims.width} y2={20} stroke="rgba(255,255,255,0.08)" />
        {visibleCandles.map((c: any, i: number) => {
          if (!c?.time) return null;
          const x = getX(i);
          if (!Number.isFinite(x) || x < 0 || x > RULER_X) return null;
          if (i % 5 !== 0) return null;
          const isMajor = i % 15 === 0;
          const label = new Date(c.time).toLocaleTimeString('es-CO', {
            hour: '2-digit', minute: '2-digit', hour12: false
          });
          return (
            <g key={`t-${i}`}>
              <line
                x1={x} y1={isMajor ? 0 : 14}
                x2={x} y2={20}
                stroke={isMajor ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.07)'}
                strokeWidth={isMajor ? 0.8 : 0.5}
              />
              {isMajor && (
                <text x={x + 2} y={13} fill="rgba(255,255,255,0.5)" fontSize="7.5" fontFamily="monospace">
                  {label}
                </text>
              )}
            </g>
          );
        })}
      </g>

      <g transform={`translate(${RULER_X}, 0)`}>
        <rect x={0} y={0} width={RULER_W} height={dims.height} fill="rgba(0,0,0,0.55)" />
        <line x1={0} y1={0} x2={0} y2={dims.height} stroke="rgba(255,255,255,0.12)" />

        {Array.from({ length: priceStepCount + 1 }).map((_, i) => {
          if (i % labelSkip !== 0 && labelSkip > 1) return null;
          const price = minPrice + i * stepSize;
          const y = getY(price);
          if (!Number.isFinite(y) || y < 22 || y > dims.height - 6) return null;
          const isMajor = i % (labelSkip > 1 ? 1 : 2) === 0;
          const isNear = Math.abs(price - cp) < stepSize * 0.45;
          return (
            <g key={`ruler-${i}`}>
              <line
                x1={0} y1={y}
                x2={isMajor ? 8 : 4} y2={y}
                stroke={isNear ? NEON_RED : isMajor ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.18)'}
                strokeWidth={isNear ? 1.5 : isMajor ? 0.8 : 0.5}
              />
              {isMajor && (
                <text
                  x={11} y={y + 4}
                  fill={isNear ? NEON_RED : 'rgba(255,255,255,0.82)'}
                  fontSize={isNear ? '10.5' : '9.5'}
                  fontFamily="monospace"
                  fontWeight={isNear ? 'bold' : '500'}
                  style={{ filter: isNear ? 'drop-shadow(0 0 5px rgba(255,0,76,0.95))' : undefined }}
                >
                  {price < 100 ? price.toFixed(5) : price.toFixed(2)}
                </text>
              )}
            </g>
          );
        })}
      </g>

      {showGrid && (
        <g opacity={0.07}>
          {Array.from({ length: 12 }).map((_, idx) => {
            const price = minPrice + ((maxPrice - minPrice) / 11) * idx;
            const y = getY(price);
            return <line key={`gh-${idx}`} x1={0} y1={y} x2={dims.width - 80} y2={y} stroke="white" strokeWidth={0.5} strokeDasharray="3 3" />;
          })}
          {visibleCandles.map((c: CandleData, i: number) => {
            if (i % (Math.ceil(visibleCandles.length / 8)) !== 0) return null;
            const x = getX(i);
            return <line key={`gv-${i}`} x1={x} y1={padding.top} x2={x} y2={dims.height - padding.bottom} stroke="white" strokeWidth={0.5} strokeDasharray="3 3" />;
          })}
        </g>
      )}

      {showSma && (
        <g transform="translate(15, 24)" opacity={0.95}>
          <g transform="translate(0, 5)">
            <line x1={0} y1={6} x2={16} y2={6} stroke={NEON_RED} strokeWidth={3} strokeLinecap="round" />
            <text x={24} y={6} fill="white" fontSize="10.5" fontWeight="black" fontFamily="monospace" dominantBaseline="middle">SMA 15 (Trend)</text>
          </g>
          <g transform="translate(0, 19)">
            <line x1={0} y1={6} x2={16} y2={6} stroke={NEON_YELLOW} strokeWidth={3} strokeLinecap="round" />
            <text x={24} y={6} fill="white" fontSize="10.5" fontWeight="black" fontFamily="monospace" dominantBaseline="middle">SMA 50 (Support)</text>
          </g>
        </g>
      )}
    </>
  );
};


