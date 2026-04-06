"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { Move, Plus, Trash2, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

interface MapPoint {
  id: string;
  name: string;
  city: string;
  status: string;
  coordinates: { top: string; left: string };
  dotColor: string;
}

interface MapPointEditorProps {
  backgroundImage: string;
  points: MapPoint[];
  onChange: (points: MapPoint[]) => void;
}

export function MapPointEditor({ backgroundImage, points, onChange }: MapPointEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const parsePercent = (value: string) => {
    return parseFloat(value.replace('%', '')) || 50;
  };

  const handleMouseDown = useCallback((e: React.MouseEvent, pointId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const point = points.find(p => p.id === pointId);
    if (!point || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const pointX = (parsePercent(point.coordinates.left) / 100) * rect.width;
    const pointY = (parsePercent(point.coordinates.top) / 100) * rect.height;

    setDragOffset({
      x: e.clientX - rect.left - pointX,
      y: e.clientY - rect.top - pointY
    });
    setIsDragging(true);
    setSelectedPoint(pointId);
  }, [points]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !selectedPoint || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;

    const leftPercent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const topPercent = Math.max(0, Math.min(100, (y / rect.height) * 100));

    onChange(points.map(p => 
      p.id === selectedPoint 
        ? { ...p, coordinates: { top: `${topPercent.toFixed(1)}%`, left: `${leftPercent.toFixed(1)}%` } }
        : p
    ));
  }, [isDragging, selectedPoint, dragOffset, points, onChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const movePoint = (pointId: string, direction: 'up' | 'down' | 'left' | 'right') => {
    const step = 2;
    onChange(points.map(p => {
      if (p.id !== pointId) return p;
      
      let top = parsePercent(p.coordinates.top);
      let left = parsePercent(p.coordinates.left);

      switch (direction) {
        case 'up': top = Math.max(0, top - step); break;
        case 'down': top = Math.min(100, top + step); break;
        case 'left': left = Math.max(0, left - step); break;
        case 'right': left = Math.min(100, left + step); break;
      }

      return {
        ...p,
        coordinates: {
          top: `${top.toFixed(1)}%`,
          left: `${left.toFixed(1)}%`
        }
      };
    }));
  };

  const addPoint = () => {
    const newPoint: MapPoint = {
      id: `point-${Date.now()}`,
      name: 'Nueva Ubicación',
      city: '',
      status: 'activo',
      coordinates: { top: '50%', left: '50%' },
      dotColor: '#10B981'
    };
    onChange([...points, newPoint]);
    setSelectedPoint(newPoint.id);
  };

  const removePoint = (pointId: string) => {
    onChange(points.filter(p => p.id !== pointId));
    if (selectedPoint === pointId) {
      setSelectedPoint(null);
    }
  };

  const updatePoint = (pointId: string, updates: Partial<MapPoint>) => {
    onChange(points.map(p => p.id === pointId ? { ...p, ...updates } : p));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div 
            ref={containerRef}
            className="relative w-full aspect-[16/10] rounded-xl overflow-hidden border border-white/10 bg-zinc-900"
            style={{
              backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {backgroundImage ? (
              <img 
                src={backgroundImage} 
                alt="Map background" 
                className="absolute inset-0 w-full h-full object-contain opacity-50"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-gray-500 text-sm">Sube una imagen del mapa</p>
              </div>
            )}
            
            {points.map((point) => (
              <div
                key={point.id}
                className={`absolute cursor-move group ${isDragging && selectedPoint === point.id ? 'z-20' : 'z-10'}`}
                style={{
                  top: point.coordinates.top,
                  left: point.coordinates.left,
                  transform: 'translate(-50%, -50%)'
                }}
                onMouseDown={(e) => handleMouseDown(e, point.id)}
              >
                <div 
                  className={`w-6 h-6 rounded-full border-2 border-white shadow-lg transition-all ${
                    selectedPoint === point.id ? 'scale-125 ring-2 ring-white/50' : ''
                  }`}
                  style={{ backgroundColor: point.dotColor }}
                >
                  <div className="absolute inset-0 rounded-full bg-white/30 animate-ping" />
                </div>
                <div 
                  className={`absolute top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${
                    selectedPoint === point.id ? 'opacity-100 bg-white text-black' : 'opacity-0 group-hover:opacity-100 bg-zinc-900 text-white'
                  }`}
                >
                  {point.name}
                </div>
              </div>
            ))}
          </div>
          
          {!backgroundImage && (
            <p className="text-gray-500 text-xs text-center">
              Primero sube una imagen del mapa para poder colocar los puntos
            </p>
          )}
        </div>

        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          <div className="flex items-center justify-between sticky top-0 bg-zinc-950 py-2">
            <h4 className="text-sm font-bold text-white">Puntos ({points.length})</h4>
            <button
              onClick={addPoint}
              disabled={!backgroundImage}
              className="flex items-center gap-1 px-3 py-1.5 bg-blis-red/20 hover:bg-blis-red text-blis-red hover:text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-3 h-3" />
              Agregar
            </button>
          </div>

          {points.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-4">
              No hay puntos creados
            </p>
          )}

          {points.map((point) => (
            <div 
              key={point.id}
              className={`p-3 rounded-xl border transition-all ${
                selectedPoint === point.id 
                  ? 'bg-blis-red/10 border-blis-red/50' 
                  : 'bg-white/5 border-white/10'
              }`}
              onClick={() => setSelectedPoint(point.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <input
                  type="text"
                  value={point.name}
                  onChange={(e) => updatePoint(point.id, { name: e.target.value })}
                  className="bg-transparent text-white text-sm font-bold outline-none flex-1"
                  placeholder="Nombre"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removePoint(point.id);
                  }}
                  className="p-1 hover:bg-red-500/20 rounded text-red-400"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input
                  type="text"
                  value={point.city}
                  onChange={(e) => updatePoint(point.id, { city: e.target.value })}
                  className="bg-black/30 border border-white/10 rounded px-2 py-1 text-xs text-white"
                  placeholder="Ciudad"
                />
                <select
                  value={point.status}
                  onChange={(e) => updatePoint(point.id, { status: e.target.value })}
                  className="bg-black/30 border border-white/10 rounded px-2 py-1 text-xs text-white"
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                  <option value="proximo">Próximo</option>
                </select>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="w-5 h-5 rounded-full border border-white/30 shrink-0"
                  style={{ backgroundColor: point.dotColor }}
                />
                <input
                  type="color"
                  value={point.dotColor}
                  onChange={(e) => updatePoint(point.id, { dotColor: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={point.dotColor}
                  onChange={(e) => updatePoint(point.id, { dotColor: e.target.value })}
                  className="flex-1 bg-black/30 border border-white/10 rounded px-2 py-1 text-xs text-white font-mono"
                  placeholder="#10B981"
                />
              </div>

              <div className="flex items-center gap-1">
                <span className="text-[10px] text-gray-500">Posición:</span>
                <div className="flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      movePoint(point.id, 'up');
                    }}
                    className="p-1 hover:bg-white/10 rounded"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      movePoint(point.id, 'down');
                    }}
                    className="p-1 hover:bg-white/10 rounded"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      movePoint(point.id, 'left');
                    }}
                    className="p-1 hover:bg-white/10 rounded"
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      movePoint(point.id, 'right');
                    }}
                    className="p-1 hover:bg-white/10 rounded"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <span className="text-[10px] text-gray-400 ml-auto">
                  {point.coordinates.left}, {point.coordinates.top}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-500">
        💡 Haz clic en un punto para seleccionarlo, arrastra para moverlo, o usa las flechas para ajustar la posición
      </p>
    </div>
  );
}