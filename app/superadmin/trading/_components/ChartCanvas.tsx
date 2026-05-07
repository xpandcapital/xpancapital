"use client";

import React from 'react';
import type { CandleData, Drawing, OpenPosition, AiZone, FVGData, TradeReplayData, TickerState, HoverDataPoint } from '../_types';

const NEON_RED    = '#ff004c';
const NEON_CYAN   = '#00f2ff';
const NEON_GREEN  = '#0ecb81';
const NEON_YELLOW = '#fff200';

export const ChartCanvas = ({
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
  tradeReplayData = null,
  RULER_X,
  RULER_W,
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
  },
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
  tradeReplayData?: TradeReplayData | null,
  RULER_X: number,
  RULER_W: number,
}) => {
  const { getY, getX, getXFromContinuousIndex, minPrice, maxPrice, visibleCandles, candleWidth, padding, sma15Path, sma50Path } = chartMath;
  const cp = ticker?.price ?? 0;

  const StaticContent = React.useMemo(() => (
    <>
      <g clipPath="url(#candleArea)">
        {(() => {
          const allLabels: { y: number; text: string; col: string; type: 'zone' | 'tp'; lineY: number; entryY?: number; startX?: number; opacity: number }[] = [];

          aiZones?.forEach((zone: any) => {
            const tgtY = getY(zone.target || (zone.type === 'demand' ? zone.high : zone.low));
            if (!Number.isFinite(tgtY)) return;
            const isBuy = zone.type === 'demand';
            const col = isBuy ? '#0ecb81' : '#ff004c';
            const t = zone.target || 0;
            const priceStr = t < 1 ? t.toPrecision(4) : t.toFixed(2);
            allLabels.push({ y: tgtY - 22, text: `⚡ OBJETIVO @ ${priceStr}`, col, type: 'zone', lineY: tgtY, opacity: 1 });
          });

          positions.forEach((p: any) => {
            if (!p.targetPrice) return;
            const tgtY = getY(p.targetPrice);
            const eY = getY(p.entryPrice);
            if (!Number.isFinite(tgtY) || !Number.isFinite(eY)) return;
            const isHov = p.id === hoverPositionId;
            const col = isHov ? NEON_YELLOW : (p.type === 'BUY' ? NEON_GREEN : NEON_RED);
            const priceLabel = p.targetPrice < 1 ? p.targetPrice.toPrecision(4) : p.targetPrice.toFixed(2);
            const entryCIdx = visibleCandles.findIndex((c:any) => c.time <= p.openTime);
            const sX = entryCIdx !== -1 ? getX(entryCIdx) : 0;
            allLabels.push({ y: tgtY - 15, text: `TP ${priceLabel}`, col, type: 'tp', lineY: tgtY, entryY: eY, startX: sX, opacity: isHov ? 1 : 0.5 });
          });

          allLabels.sort((a, b) => a.y - b.y);
          const MIN_GAP = 22;
          for (let i = 1; i < allLabels.length; i++) {
            const prev = allLabels[i - 1];
            const curr = allLabels[i];
            if (curr.y - prev.y < MIN_GAP) {
              curr.y = prev.y + MIN_GAP;
            }
          }

          return allLabels.map((label, idx) => (
            <g key={`ia-label-${idx}`} opacity={label.opacity} style={{ pointerEvents: 'none' }}>
              <line x1={0} y1={label.lineY} x2={RULER_X} y2={label.lineY}
                stroke={label.col} strokeWidth={label.type === 'zone' ? 0.8 : 0.5}
                strokeDasharray={label.type === 'zone' ? '8,4' : '3,3'} opacity={0.3} />
              {label.type === 'tp' && label.entryY != null && label.startX != null && (
                <line x1={label.startX} y1={label.entryY} x2={RULER_X} y2={label.lineY}
                  stroke={label.col} strokeWidth={0.7} strokeDasharray="6,4" opacity={0.4} />
              )}
              {label.type === 'zone' && (
                <circle cx={RULER_X - 5} cy={label.lineY} r={3} fill={label.col}>
                  <animate attributeName="r" values="2;5;2" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              <rect x={6} y={label.y} width={label.type === 'zone' ? 165 : 105}
                height={18} rx={4} fill="#0a0a0f" fillOpacity={0.92}
                stroke={label.col} strokeWidth={0.6} strokeOpacity={0.4} />
              <text x={12} y={label.y + 13} fill={label.col}
                fontSize={label.type === 'zone' ? '11' : '10'} fontWeight="bold" fontFamily="monospace">
                {label.text}
              </text>
            </g>
          ));
        })()}
        {showAiZonesUI && aiZones && aiZones.map((z: any, idx: number) => {
            const yH = getY(z.high), yL = getY(z.low);
            if (!Number.isFinite(yH) || !Number.isFinite(yL)) return null;
            return (
                <rect key={`zone-${idx}`} x={0} y={yH} width={dims.width - 80} height={Math.max(2, yL - yH)} fill={z.type==='demand'?NEON_GREEN:NEON_RED} opacity={0.1} />
            );
        })}
      </g>

      {showSma && (
        <g>
            <g clipPath="url(#candleArea)">
                {sma15Path && (
                    <g>
                        <path d={sma15Path} fill="none" stroke={NEON_RED} strokeWidth={1.3} opacity={0.4}
                            style={{ filter: 'drop-shadow(0 0 3px rgba(255,0,76,0.5))' }} />
                        {visibleCandles.length > 0 && (
                            <text x={getX(visibleCandles.length - 1) + 10} y={getY(visibleCandles[visibleCandles.length-1].sma15!) + 3}
                                fill={NEON_RED} fontSize="7" fontWeight="bold" fontFamily="monospace" opacity={0.6}>SMA15</text>
                        )}
                    </g>
                )}
                {sma50Path && (
                    <g>
                        <path d={sma50Path} fill="none" stroke={NEON_YELLOW} strokeWidth={1.3} opacity={0.35}
                            style={{ filter: 'drop-shadow(0 0 3px rgba(255,242,0,0.4))' }} />
                        {visibleCandles.length > 0 && (
                            <text x={getX(visibleCandles.length - 1) + 10} y={getY(visibleCandles[visibleCandles.length-1].sma50!) + 3}
                                fill={NEON_YELLOW} fontSize="7" fontWeight="bold" fontFamily="monospace" opacity={0.6}>SMA50</text>
                        )}
                    </g>
                )}
            </g>
        </g>
      )}

      <g clipPath="url(#candleArea)">
        {chartMath.fvgs && chartMath.fvgs.map((fvg: any, i: number) => {
          const x = getX(fvg.startIndex);
          const yTop = getY(fvg.top);
          const yBot = getY(fvg.bottom);
          const w = chartMath.chartWidth;
          const h = Math.abs(yBot - yTop);
          if (!Number.isFinite(x) || !Number.isFinite(yTop) || !Number.isFinite(yBot)) return null;
          return (
            <rect key={`fvg-${i}`} x={x} y={Math.min(yTop, yBot)} width={Math.max(1, w - x)} height={h} fill={fvg.type === 'bullish' ? 'rgba(57, 255, 20, 0.08)' : 'rgba(255, 0, 76, 0.08)'} />
          );
        })}
      </g>

      {showDom && (
        <g clipPath="url(#candleArea)">
           {Array.from({ length: 50 }).map((_, i) => {
                const pRange = maxPrice - minPrice;
                const priceLvl = minPrice + (i * (pRange / 50));
                const yLvl = getY(priceLvl);
                const isAsk = priceLvl > cp;
                const distFromPrice = Math.abs(priceLvl - cp);
                const weight = Math.max(0.1, 1 - (distFromPrice / (pRange * 0.3)));
                const noise = Math.abs(Math.sin(priceLvl * 1000));
                const volumeStr = (weight * 60) + (noise * 40);
                const rWidth = Math.min(120, volumeStr);
                if (!Number.isFinite(yLvl)) return null;
                return (
                    <rect
                      key={`dom-${i}`}
                      x={(dims.width - 80) - rWidth}
                      y={yLvl - 3}
                      width={rWidth}
                      height={6}
                      fill={isAsk ? 'rgba(255, 0, 76, 0.25)' : 'rgba(57, 255, 20, 0.25)'}
                    />
                )
            })}
        </g>
      )}

      <g clipPath="url(#candleArea)">
        {[...drawings, currentDrawing].filter(Boolean).map((d: any, i: number) => {
           if (d.type === 'line' && d.p1 && d.p2) {
            const x1 = getXFromContinuousIndex(d.p1.index), y1 = getY(d.p1.price);
            const x2 = getXFromContinuousIndex(d.p2.index), y2 = getY(d.p2.price);
            if (!Number.isFinite(x1) || !Number.isFinite(y1) || !Number.isFinite(x2) || !Number.isFinite(y2)) return null;
            return <line key={`draw-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={d.color || '#ff004c'} strokeWidth={2} />;
          }
          if (d.type === 'fibonacci' && d.p1 && d.p2) {
             const x1 = getXFromContinuousIndex(d.p1.index), y1 = getY(d.p1.price);
             const x2 = getXFromContinuousIndex(d.p2.index), y2 = getY(d.p2.price);
             if (!Number.isFinite(x1) || !Number.isFinite(y1) || !Number.isFinite(x2) || !Number.isFinite(y2)) return null;
             const levels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
             const yDiff = y2 - y1;
             const pDiff = d.p2.price - d.p1.price;
             const leftX = Math.min(x1, x2);
             const rightX = Math.max(x1, x2) + 150;
             return (
               <g key={`fibo-${i}`}>
                 <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.4)" strokeWidth={1} strokeDasharray="3,3" />
                 {levels.map(level => {
                     const lvlY = y1 + (yDiff * level);
                     const lvlPrice = d.p1.price + (pDiff * level);
                     return (
                         <g key={`flvl-${i}-${level}`}>
                             <line x1={leftX} y1={lvlY} x2={rightX} y2={lvlY} stroke={d.color || '#fff'} strokeWidth={1} opacity={level === 0 || level === 1 ? 0.8 : 0.4} />
                             <text x={rightX + 5} y={lvlY + 3} fill={d.color || '#fff'} fontSize="9" fontWeight="bold">{level} (${lvlPrice.toFixed(2)})</text>
                         </g>
                     )
                 })}
               </g>
             );
          }
          if (d.type === 'freehand' && d.points) {
            const pathData = d.points.map((p: any, idx: number) => {
              const x = getXFromContinuousIndex(p.index), y = getY(p.price);
              if (!Number.isFinite(x) || !Number.isFinite(y)) return '';
              return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).filter(Boolean).join(' ');
            if (!pathData) return null;
            return <path key={`draw-${i}`} d={pathData} fill="none" stroke={d.color || '#ff004c'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />;
          }
          if (d.type === 'select') {
            const x = Math.min(d.x1, d.x2);
            const y = Math.min(d.y1, d.y2);
            const w = Math.abs(d.x1 - d.x2);
            const h = Math.abs(d.y1 - d.y2);
            return <rect key={`draw-sel-${i}`} x={x} y={y} width={w} height={h} fill={d.color} stroke={d.color.replace('0.2', '0.6')} strokeWidth={1} strokeDasharray="3,3" />;
          }
          return null;
        })}
      </g>

      <g clipPath="url(#candleArea)">
        {visibleCandles.map((c: any, i: number) => {
          if (!c || !Number.isFinite(c.open) || !Number.isFinite(c.close)) return null;
          const bull = c.close >= c.open;
          const color = bull ? NEON_GREEN : NEON_RED;
          const x = getX(i);
          const yH = getY(c.high), yL = getY(c.low);
          const yO = getY(Math.max(c.open, c.close));
          const yC = getY(Math.min(c.open, c.close));
          if (!Number.isFinite(x) || !Number.isFinite(yH) || !Number.isFinite(yL)) return null;
          const bodyH = Math.max(1, Math.abs(yO - yC));
          const w = Math.max(2, candleWidth - 1);
          return (
            <g key={`c-${c.time}-${i}`}>
              <line x1={x} y1={yH} x2={x} y2={yL} stroke={color} strokeWidth={1} opacity={1} />
              <rect x={x - w / 2} y={yO} width={w} height={bodyH} fill={color} rx={0.5} opacity={1} />
            </g>
          );
        })}
        {positions.map((p: any) => {
          const y = getY(p.entryPrice);
          if (!Number.isFinite(y)) return null;
          const col = p.type === 'BUY' ? NEON_GREEN : NEON_RED;
          const targetY = p.targetPrice ? getY(p.targetPrice) : null;
          const stopY = p.stopPrice ? getY(p.stopPrice) : null;
          const isHovered = p.id === hoverPositionId;

          const now = Date.now();
          const remains = p.predictionExpiresAt ? p.predictionExpiresAt - now : 0;
          const isOverdue = remains < 0;
          const absRemains = Math.abs(remains);
          const cooldownStr = `${isOverdue ? '-' : ''}${Math.floor(absRemains / 60000)}:${Math.floor((absRemains % 60000) / 1000).toString().padStart(2, '0')}`;

          return (
            <g key={`pos-${p.id}`} style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoverPositionId && setHoverPositionId(p.id)}
              onMouseLeave={() => setHoverPositionId && setHoverPositionId(null)}
              onClick={() => setSelectedPositionId && setSelectedPositionId(p.id)}
            >
              {(showPositionLines || isHovered || p.id === selectedPositionId) && (
                <line x1={0} y1={y} x2={RULER_X} y2={y}
                  stroke={isHovered || p.id === selectedPositionId ? NEON_YELLOW : col}
                  strokeWidth={isHovered || p.id === selectedPositionId ? 2 : 0.9}
                  strokeDasharray={isHovered || p.id === selectedPositionId ? "0" : "8,5"}
                  opacity={isHovered || p.id === selectedPositionId ? 1 : 0.55}
                />
              )}
              {showAiZonesUI && targetY && Number.isFinite(targetY) && (
                <g>
                  <line x1={0} y1={targetY} x2={RULER_X} y2={targetY}
                    stroke={isHovered ? NEON_YELLOW : (p.type === 'BUY' ? NEON_GREEN : NEON_RED)}
                    strokeWidth={isHovered ? 2 : 0.8} strokeDasharray="2,4"
                    opacity={isHovered ? 1 : 0.30} />
                  {(() => {
                    const arrowX = 60;
                    const arrowCol = p.type === 'BUY' ? NEON_GREEN : NEON_RED;
                    return (
                      <g opacity={0.65}>
                        <line
                          x1={arrowX} y1={y}
                          x2={arrowX} y2={targetY}
                          stroke={arrowCol} strokeWidth={1.5} strokeDasharray="3,2"
                        />
                        <polygon
                          points={p.type === 'BUY'
                            ? `${arrowX-5},${targetY+8} ${arrowX+5},${targetY+8} ${arrowX},${targetY}`
                            : `${arrowX-5},${targetY-8} ${arrowX+5},${targetY-8} ${arrowX},${targetY}`
                          }
                          fill={arrowCol}
                        />
                        <text x={arrowX + 8} y={targetY - 4}
                          fill={arrowCol} fontSize={7} fontFamily="monospace" fontWeight="black" opacity={0.9}>
                          {p.type === 'BUY' ? '▲ TP' : '▼ TP'}
                        </text>
                      </g>
                    );
                  })()}
                  {isHovered && <text x={10} y={targetY - 5} fill={p.type === 'BUY' ? NEON_GREEN : NEON_RED} fontSize={7} opacity={0.9} fontFamily="monospace" fontWeight="black">{p.type === 'BUY' ? '▲ TP OBJETIVO' : '▼ TP OBJETIVO'}</text>}
                </g>
              )}
              {showAiZonesUI && stopY && Number.isFinite(stopY) && (
                <g>
                  <line x1={0} y1={stopY} x2={RULER_X} y2={stopY}
                    stroke={isHovered ? NEON_YELLOW : NEON_RED}
                    strokeWidth={isHovered ? 2 : 0.8} strokeDasharray="2,4"
                    opacity={isHovered ? 1 : 0.25} />
                  {isHovered && <text x={10} y={stopY + 10} fill={NEON_RED} fontSize={7} opacity={0.9} fontFamily="monospace" fontWeight="black">SL RIESGO</text>}
                </g>
              )}
              <g>
                <polygon
                  points={`${RULER_X - 6},${y} ${RULER_X},${y - 5} ${RULER_X},${y + 5}`}
                  fill={isHovered ? NEON_YELLOW : col}
                  opacity={isHovered ? 1 : 0.85}
                />
                <rect
                  x={RULER_X} y={y - 10}
                  width={RULER_W - 2} height={20}
                  fill={isHovered ? NEON_YELLOW : col}
                  rx={3}
                  opacity={isHovered ? 1 : 0.85}
                  style={{ filter: isHovered ? `drop-shadow(0 0 10px #fff200)` : `drop-shadow(0 0 6px ${col}90)` }}
                />
                <text x={RULER_X + 5} y={y - 1}
                  fill="rgba(0,0,0,0.9)" fontSize="8" fontWeight="black" fontFamily="monospace"
                >
                  {p.type} {p.entryPrice.toFixed(1)}
                </text>
                <text x={RULER_X + 5} y={y + 8}
                  fill="rgba(0,0,0,0.7)" fontSize="6.5" fontFamily="monospace" fontWeight="bold"
                >
                  {isOverdue ? `⏱-${cooldownStr}` : cooldownStr}
                </text>
              </g>
            </g>
          );
        })}
      </g>
    </>
  ), [chartMath, drawings, currentDrawing, positions, ticker?.price, aiZones, hoverPositionId, selectedPositionId, dims.height, dims.width, RULER_X, RULER_W, minPrice, maxPrice, visibleCandles, candleWidth, padding, sma15Path, sma50Path, setHoverPositionId, setSelectedPositionId, cp, showAiZonesUI, showPositionLines]);

  return (
    <>
      {StaticContent}

      {hoverData && !isDragging && (
        <g>
          <line x1={0} y1={hoverData.y} x2={RULER_X} y2={hoverData.y} stroke="rgba(255,255,255,0.3)" strokeDasharray="3,5" />
          <line x1={hoverData.x} y1={20} x2={hoverData.x} y2={dims.height} stroke="rgba(255,255,255,0.3)" strokeDasharray="3,5" />
          <circle cx={hoverData.x} cy={hoverData.y} r={3} fill="white" opacity={0.7} />
          <g transform={`translate(${RULER_X}, ${hoverData.y - 11})`}>
            <rect width={RULER_W} height={22} fill="#1a1a2e" stroke={NEON_CYAN} strokeWidth={0.8} rx={3} />
            <text x={RULER_W / 2} y={15} fill={NEON_CYAN} fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
              {hoverData.price < 100 ? hoverData.price.toFixed(5) : hoverData.price.toFixed(2)}
            </text>
          </g>
          {(() => {
            const bx = Math.min(Math.max(hoverData.x - 35, 0), RULER_X - 70);
            return (
              <g transform={`translate(${bx}, 0)`}>
                <rect width={70} height={20} fill="#1a1a2e" stroke={NEON_CYAN} strokeWidth={0.8} rx={3} />
                <text x={35} y={13} fill={NEON_CYAN} fontSize="8" textAnchor="middle" fontFamily="monospace">
                  {new Date(hoverData.time).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                </text>
              </g>
            );
          })()}
        </g>
      )}

      {(() => {
        const y = getY(cp);
        if (!Number.isFinite(y)) return null;
        return (
          <g style={{ pointerEvents: 'none' }}>
            <line
              x1={0} y1={y} x2={RULER_X} y2={y}
              stroke="rgba(255,255,255,0.35)"
              strokeWidth={0.8}
              strokeDasharray="6,4"
              style={{ filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.3))' }}
            />
            <g transform={`translate(${RULER_X}, 0)`}>
              <rect x={0} y={y - 11} width={RULER_W} height={22}
                fill="rgba(20,20,30,0.92)" stroke="rgba(255,255,255,0.7)"
                strokeWidth={1} rx={3}
              />
              <text x={RULER_W / 2} y={y + 5}
                fill="white" fontSize="10" fontFamily="monospace"
                fontWeight="black" textAnchor="middle"
                style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.9))' }}
              >
                {cp < 100 ? cp.toFixed(5) : cp.toFixed(2)}
              </text>
            </g>
          </g>
        );
      })()}

      {tradeReplayData && tradeReplayData.candles.length > 0 && (() => {
        const rc = tradeReplayData.candles;
        const rMinP = Math.min(...rc.map((c: any) => c.low), tradeReplayData.entryPrice, tradeReplayData.closePrice);
        const rMaxP = Math.max(...rc.map((c: any) => c.high), tradeReplayData.entryPrice, tradeReplayData.closePrice);
        const rRange = (rMaxP - rMinP) || 1;
        const rPad = rRange * 0.08;
        const rMin = rMinP - rPad;
        const rMax = rMaxP + rPad;
        const rTotalRange = rMax - rMin;

        const ox = 40;
        const oy = 35;
        const ow = RULER_X - 60;
        const oh = dims.height - 70;
        const rGetY = (p: number) => oy + oh - ((p - rMin) / rTotalRange) * oh;
        const rCandleW = Math.max(2, Math.min(8, (ow / rc.length) * 0.7));
        const rGetX = (i: number) => ox + (i * (ow / rc.length)) + (rCandleW / 2);

        const entryY = rGetY(tradeReplayData.entryPrice);
        const closeY = rGetY(tradeReplayData.closePrice);
        const isProfit = tradeReplayData.type === 'BUY'
          ? tradeReplayData.closePrice >= tradeReplayData.entryPrice
          : tradeReplayData.closePrice <= tradeReplayData.entryPrice;

        return (
          <g style={{ pointerEvents: 'none' }}>
            <rect x={0} y={20} width={RULER_X} height={dims.height - 20}
              fill="rgba(5,5,5,0.92)" rx={0} />

            <text x={ox + 8} y={oy - 8} fill="rgba(255,255,255,0.7)" fontSize="10" fontFamily="monospace" fontWeight="bold">
              REPLAY: {tradeReplayData.symbol} — {tradeReplayData.type} — {tradeReplayData.openedBy === 'IA' ? '🤖 IA' : '👤 Manual'}
            </text>
            <text x={RULER_X - 20} y={oy - 8} fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="monospace" textAnchor="end">
              {new Date(tradeReplayData.openTime).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })} → {new Date(tradeReplayData.closeTime).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
            </text>

            {Array.from({ length: 6 }).map((_, gi) => {
              const gp = rMin + (rTotalRange / 5) * gi;
              const gy = rGetY(gp);
              return (
                <g key={`rg-${gi}`}>
                  <line x1={ox} y1={gy} x2={ox + ow} y2={gy} stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />
                  <text x={ox - 4} y={gy + 3} fill="rgba(255,255,255,0.25)" fontSize="7" fontFamily="monospace" textAnchor="end">
                    {gp < 100 ? gp.toFixed(4) : gp.toFixed(2)}
                  </text>
                </g>
              );
            })}

            {rc.map((c: any, i: number) => {
              const x = rGetX(i);
              const isBull = c.close >= c.open;
              const bodyTop = rGetY(Math.max(c.open, c.close));
              const bodyBot = rGetY(Math.min(c.open, c.close));
              const bodyH = Math.max(1, bodyBot - bodyTop);
              const wickTop = rGetY(c.high);
              const wickBot = rGetY(c.low);
              const color = isBull ? NEON_GREEN : NEON_RED;
              return (
                <g key={`rc-${i}`}>
                  <line x1={x} y1={wickTop} x2={x} y2={wickBot} stroke={color} strokeWidth={0.8} opacity={0.7} />
                  <rect x={x - rCandleW / 2} y={bodyTop} width={rCandleW} height={bodyH}
                    fill={isBull ? color : 'transparent'} stroke={color} strokeWidth={0.8} opacity={0.85} />
                </g>
              );
            })}

            {rc[0]?.sma15 && (() => {
              const sma15 = rc.map((c: any, i: number) => {
                const y = rGetY(c.sma15);
                return Number.isFinite(y) ? `${i === 0 ? 'M' : 'L'} ${rGetX(i)} ${y}` : '';
              }).join(' ');
              const sma50 = rc.map((c: any, i: number) => {
                const y = rGetY(c.sma50);
                return Number.isFinite(y) ? `${i === 0 ? 'M' : 'L'} ${rGetX(i)} ${y}` : '';
              }).join(' ');
              return (
                <>
                  <path d={sma15} fill="none" stroke={NEON_CYAN} strokeWidth={1} opacity={0.5} />
                  <path d={sma50} fill="none" stroke={NEON_YELLOW} strokeWidth={1} opacity={0.5} />
                </>
              );
            })()}

            <line x1={ox} y1={entryY} x2={ox + ow} y2={entryY}
              stroke={NEON_CYAN} strokeWidth={1.2} strokeDasharray="6,4" opacity={0.9} />
            <rect x={ox} y={entryY - 9} width={90} height={18} rx={3}
              fill="rgba(0,242,255,0.15)" stroke={NEON_CYAN} strokeWidth={0.8} />
            <text x={ox + 6} y={entryY + 4} fill={NEON_CYAN} fontSize="9" fontFamily="monospace" fontWeight="bold">
              ▸ ENTRY {tradeReplayData.entryPrice < 100 ? tradeReplayData.entryPrice.toFixed(5) : tradeReplayData.entryPrice.toFixed(2)}
            </text>

            <line x1={ox} y1={closeY} x2={ox + ow} y2={closeY}
              stroke={isProfit ? NEON_GREEN : NEON_RED} strokeWidth={1.2} strokeDasharray="6,4" opacity={0.9} />
            <rect x={ox} y={closeY - 9} width={90} height={18} rx={3}
              fill={isProfit ? 'rgba(14,203,129,0.15)' : 'rgba(255,0,76,0.15)'}
              stroke={isProfit ? NEON_GREEN : NEON_RED} strokeWidth={0.8} />
            <text x={ox + 6} y={closeY + 4} fill={isProfit ? NEON_GREEN : NEON_RED} fontSize="9" fontFamily="monospace" fontWeight="bold">
              ◼ EXIT {tradeReplayData.closePrice < 100 ? tradeReplayData.closePrice.toFixed(5) : tradeReplayData.closePrice.toFixed(2)}
            </text>

            {(() => {
              const pnlPercent = tradeReplayData.type === 'BUY'
                ? ((tradeReplayData.closePrice - tradeReplayData.entryPrice) / tradeReplayData.entryPrice * 100)
                : ((tradeReplayData.entryPrice - tradeReplayData.closePrice) / tradeReplayData.entryPrice * 100);
              const midY = (entryY + closeY) / 2;
              return (
                <g>
                  <rect x={ox + ow - 110} y={midY - 14} width={105} height={28} rx={6}
                    fill={isProfit ? 'rgba(14,203,129,0.2)' : 'rgba(255,0,76,0.2)'}
                    stroke={isProfit ? NEON_GREEN : NEON_RED} strokeWidth={1} />
                  <text x={ox + ow - 58} y={midY + 5}
                    fill={isProfit ? NEON_GREEN : NEON_RED}
                    fontSize="13" fontFamily="monospace" fontWeight="black" textAnchor="middle">
                    {isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%
                  </text>
                </g>
              );
            })()}

            <line x1={ox + ow - 20} y1={entryY} x2={ox + ow - 20} y2={closeY}
              stroke={isProfit ? NEON_GREEN : NEON_RED} strokeWidth={1.5} opacity={0.5}
              markerEnd="url(#replayArrow)" />
            <defs>
              <marker id="replayArrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill={isProfit ? NEON_GREEN : NEON_RED} opacity={0.7} />
              </marker>
            </defs>
          </g>
        );
      })()}
    </>
  );
};
