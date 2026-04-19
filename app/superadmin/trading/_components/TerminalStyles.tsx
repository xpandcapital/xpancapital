"use client";

import React from 'react';

export const globalStyles = `
  @keyframes scanLine {
    0% { left: 0%; opacity: 0; }
    10% { opacity: 0.8; }
    90% { opacity: 0.8; }
    100% { left: 100%; opacity: 0; }
  }
  .scanner-beam {
    position: absolute; top: 0; bottom: 0; width: 2px;
    background: #be0b3c; box-shadow: 0 0 20px 5px rgba(190, 11, 60, 0.5);
    animation: scanLine 3s linear infinite; z-index: 5; pointer-events: none;
  }
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  .trading-main { background: #050505 !important; }
  .trading-main .chat-selectable { user-select: text; -webkit-user-select: text; cursor: text; }
  .bg-signal-green { background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.4) 100%); border: 1px solid rgba(16, 185, 129, 0.5); }
  .bg-signal-expired { background: rgba(55, 65, 81, 0.1); border: 1px solid rgba(107, 114, 128, 0.1); opacity: 0.7; }
  svg { display: block; }
  * { scrollbar-color: #be0b3c transparent; }
  .custom-horizontal-range { -webkit-appearance: none; appearance: none; background: transparent; }
  .custom-horizontal-range::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 64px; height: 6px; background: linear-gradient(to right, #be0b3c, #ff004c); border-radius: 99px; box-shadow: 0 0 15px rgba(255, 0, 76, 0.6); cursor: pointer; border: none; }
  .custom-red-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
  .custom-red-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); }
  .custom-red-scrollbar::-webkit-scrollbar-thumb { background: #be0b3c; border-radius: 10px; }
  .custom-vertical-range { writing-mode: vertical-lr !important; direction: rtl !important; -webkit-appearance: slider-vertical !important; appearance: slider-vertical !important; width: 8px !important; background: transparent !important; outline: none !important; cursor: pointer !important; }
  .custom-vertical-range::-webkit-slider-container { background: transparent !important; }
  .custom-vertical-range::-webkit-slider-runnable-track { background: transparent !important; width: 4px !important; }
  .custom-vertical-range::-webkit-slider-thumb { -webkit-appearance: none !important; appearance: none !important; width: 10px !important; height: 56px !important; background: linear-gradient(to bottom, #be0b3c, #ff004c) !important; border-radius: 99px !important; box-shadow: 0 0 20px rgba(255, 0, 76, 0.9), 0 0 8px rgba(255,0,76,0.5) !important; cursor: grab !important; border: none !important; margin-top: -24px !important; }
  .custom-vertical-range::-webkit-slider-thumb:active { cursor: grabbing !important; }
  .custom-vertical-range::-moz-range-thumb { width: 10px !important; height: 56px !important; background: linear-gradient(to bottom, #be0b3c, #ff004c) !important; border-radius: 99px !important; box-shadow: 0 0 20px rgba(255, 0, 76, 0.9) !important; border: none !important; cursor: grab !important; }
`;

export const TerminalStyles: React.FC = () => (
  <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
);

export const ChartScrollbar: React.FC<{ type: string; min: number; max: number; value: number; onChange: (e: any) => void; className?: string }> = ({ min, max, value, onChange, className }) => (
  <input type="range" min={min} max={max} step="0.1" value={value} onChange={onChange} className={className} />
);

export const VerticalSlider: React.FC<{ min: number; max: number; value: number; onChange: (v: number) => void }> = ({ min, max, value, onChange }) => {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const isDraggingSlider = React.useRef(false);
  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const thumbPct = pct * 100;
  const getValueFromEvent = (clientY: number) => {
    if (!trackRef.current) return value;
    const rect = trackRef.current.getBoundingClientRect();
    const relY = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    return max - relY * (max - min);
  };
  const onPointerDown = (e: React.PointerEvent) => { e.currentTarget.setPointerCapture(e.pointerId); isDraggingSlider.current = true; onChange(getValueFromEvent(e.clientY)); };
  const onPointerMove = (e: React.PointerEvent) => { if (!isDraggingSlider.current) return; onChange(getValueFromEvent(e.clientY)); };
  const onPointerUp = () => { isDraggingSlider.current = false; };
  return (
    <div ref={trackRef} className="relative h-full w-[14px] flex justify-center cursor-pointer select-none" style={{ touchAction: 'none' }} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp}>
      <div className="absolute inset-y-2 w-[6px] rounded-full" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }} />
      <div className="absolute rounded-full pointer-events-none" style={{ width: '6px', height: '64px', top: `calc(${thumbPct}% - 32px)`, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(to bottom, #be0b3c, #ff004c)', boxShadow: '0 0 15px rgba(255,0,76,0.8), 0 0 6px rgba(255,0,76,0.5)', borderRadius: '99px' }} />
    </div>
  );
};