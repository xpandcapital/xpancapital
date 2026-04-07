"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { MapPin, Trash2, Plus, Move, Image as ImageIcon, X, ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { ImageUpload } from "./ImageUpload";
import { supabase } from "@/lib/supabase";

interface MapLocation {
  name: string;
  fullName: string;
  city: string;
  province: string;
  coordinates: { top: string; left: string };
  status: string;
  dotColor: string;
}

interface MapEditorProps {
  backgroundImage: string;
  locations: MapLocation[];
  onChange: (data: { backgroundImage?: string; locations?: MapLocation[] }) => void;
  projects?: Array<{ id: string; name: string; primary_color?: string }>;
}

const STATUS_OPTIONS = [
  'En Planos',
  'Preventa',
  'Con Escritura',
  'Culminado',
  'Entregado'
];

const DOT_COLORS = [
  { name: 'Rojo', value: '#be0b3c' },
  { name: 'Verde', value: '#10b981' },
  { name: 'Azul', value: '#3b82f6' },
  { name: 'Amarillo', value: '#fbbf24' },
  { name: 'Morado', value: '#8b5cf6' },
  { name: 'Naranja', value: '#f97316' },
  { name: 'Celeste', value: '#06b6d4' },
  { name: 'Rosa', value: '#ec4899' },
];

export function MapEditor({ backgroundImage, locations, onChange, projects = [] }: MapEditorProps) {
  const [localBgImage, setLocalBgImage] = useState(backgroundImage || '');
  const [localLocations, setLocalLocations] = useState<MapLocation[]>(locations || []);
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [showProjectsList, setShowProjectsList] = useState(false);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setLocalBgImage(backgroundImage || '');
  }, [backgroundImage]);

  useEffect(() => {
    setLocalLocations(locations || []);
  }, [locations]);

  const handleBackgroundChange = (url: string) => {
    setLocalBgImage(url);
    onChange({ backgroundImage: url });
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddingMode || !mapRef.current) return;
    
    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const newLocation: MapLocation = {
      name: `Ubicación ${(localLocations?.length || 0) +1}`,
      fullName: '',
      city: '',
      province: '',
      coordinates: { top: `${y.toFixed(1)}%`, left: `${x.toFixed(1)}%` },
      status: 'Preventa',
      dotColor: '#be0b3c'
    };
    
    const newLocations = [...(localLocations || []), newLocation];
    setLocalLocations(newLocations);
    onChange({ locations: newLocations });
    setIsAddingMode(false);
    setSelectedLocation(newLocations.length - 1);
  };

  const handleLocationDrag = useCallback((index: number, e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current) return;
    
    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const newLocations = [...localLocations];
    newLocations[index] = {
      ...newLocations[index],
      coordinates: { top: `${Math.max(0, Math.min(100, y)).toFixed(1)}%`, left: `${Math.max(0, Math.min(100, x)).toFixed(1)}%` }
    };
    
    setLocalLocations(newLocations);
  }, [localLocations, onChange]);

  const handleMouseDown = (index: number, e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setDraggedIndex(index);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (draggedIndex === null || !mapRef.current) return;
    
    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const newLocations = [...localLocations];
    newLocations[draggedIndex] = {
      ...newLocations[draggedIndex],
      coordinates: { 
        top: `${Math.max(0, Math.min(95, y)).toFixed(1)}%`, 
        left: `${Math.max(0, Math.min(95, x)).toFixed(1)}%` 
      }
    };
    
    setLocalLocations(newLocations);
  }, [draggedIndex, localLocations]);

  const handleMouseUp = useCallback(() => {
    if (draggedIndex !== null) {
      onChange({ locations: localLocations });
    }
    setDraggedIndex(null);
    dragStartPos.current = null;
  }, [draggedIndex, localLocations, onChange]);

  useEffect(() => {
    if (draggedIndex !== null) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedIndex, handleMouseMove, handleMouseUp]);

  const updateLocation = (index: number, field: keyof MapLocation, value: any) => {
    const newLocations = [...localLocations];
    if (field === 'coordinates') {
      newLocations[index] = {
        ...newLocations[index],
        coordinates: { ...newLocations[index].coordinates, ...value }
      };
    } else {
      newLocations[index] = { ...newLocations[index], [field]: value };
    }
    setLocalLocations(newLocations);
    onChange({ locations: newLocations });
  };

  const deleteLocation = (index: number) => {
    const newLocations = localLocations.filter((_, i) => i !== index);
    setLocalLocations(newLocations);
    onChange({ locations: newLocations });
    setSelectedLocation(null);
  };

  const addLocation = () => {
    const newLocation: MapLocation = {
      name: `Ubicación ${(localLocations?.length || 0) + 1}`,
      fullName: '',
      city: '',
      province: '',
      coordinates: { top: '50%', left: '50%' },
      status: 'Preventa',
      dotColor: '#be0b3c'
    };
    const newLocations = [...(localLocations || []), newLocation];
    setLocalLocations(newLocations);
    onChange({ locations: newLocations });
    setSelectedLocation(newLocations.length - 1);
  };

  const addFromProject = (project: { id: string; name: string; primary_color?: string }) => {
    const newLocation: MapLocation = {
      name: project.name,
      fullName: project.name,
      city: '',
      province: '',
      coordinates: { top: '50%', left: '50%' },
      status: 'Preventa',
      dotColor: project.primary_color || '#be0b3c'
    };
    const newLocations = [...(localLocations || []), newLocation];
    setLocalLocations(newLocations);
    onChange({ locations: newLocations });
    setShowProjectsList(false);
  };

  const moveLocation = (fromIndex: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= localLocations.length) return;
    
    const newLocations = [...localLocations];
    [newLocations[fromIndex], newLocations[toIndex]] = [newLocations[toIndex], newLocations[fromIndex]];
    setLocalLocations(newLocations);
    onChange({ locations: newLocations });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Map Preview */}
      <div className="space-y-4">
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4">
          <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Vista Previa del Mapa</h4>
          
          <div
            ref={mapRef}
            className="relative w-full aspect-video bg-zinc-800 rounded-xl overflow-hidden border border-white/10 cursor-crosshair"
            onClick={handleMapClick}
            style={{
              backgroundImage: localBgImage ? `url(${localBgImage})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {!localBgImage && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-600">
                <div className="text-center">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Sube una imagen de fondo</p>
                </div>
              </div>
            )}
            
            {/* Location Pins */}
            {localLocations?.map((loc, index) => (
              <div
                key={index}
                className={`absolute group z-20 ${draggedIndex === index ? 'z-30 cursor-grabbing' : 'cursor-grab'}`}
                style={{ top: loc.coordinates.top, left: loc.coordinates.left, transform: 'translate(-50%, -50%)' }}
                onMouseDown={(e) => handleMouseDown(index, e)}
                onClick={(e) => { e.stopPropagation(); setSelectedLocation(index); }}
              >
                {/* Pin */}
                <div
                  className={`w-5 h-5 rounded-full border-2 border-white shadow-lg transition-transform ${selectedLocation === index ? 'scale-125 ring-2 ring-white' : 'hover:scale-110'}`}
                  style={{ backgroundColor: loc.dotColor, boxShadow: `0 0 12px ${loc.dotColor}` }}
                />
                
                {/* Label */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5 bg-black/90 rounded text-[9px] font-bold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {loc.name}
                </div>
              </div>
            ))}
            
            {/* Adding mode indicator */}
            {isAddingMode && (
              <div className="absolute inset-0 bg-blis-red/10 flex items-center justify-center pointer-events-none">
                <div className="bg-black/80 px-4 py-2 rounded-xl text-white text-sm font-bold">
                  Haz clic para agregar ubicación
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setIsAddingMode(!isAddingMode)}
              className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                isAddingMode ? 'bg-blis-red text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              Agregar en Mapa
            </button>
            <button
              onClick={addLocation}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <MapPin className="w-3.5 h-3.5" />
              Centro
            </button>
          </div>
        </div>
        
        {/* Background Image Upload */}
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4">
          <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Imagen de Fondo</h4>
          <ImageUpload value={localBgImage} onChange={handleBackgroundChange} folder="cms/maps" />
        </div>
        
        {/* Add from Projects */}
        {projects && projects.length > 0 && (
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Agregar desde Proyectos Existentes</h4>
            <button
              onClick={() => setShowProjectsList(!showProjectsList)}
              className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Plus className="w-3.5 h-3.5" />
                Seleccionar Proyecto
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showProjectsList ? 'rotate-180' : ''}`} />
            </button>
            
            {showProjectsList && (
              <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => addFromProject(project)}
                    className="w-full px-3 py-2 rounded-lg text-left text-sm bg-white/5 text-white hover:bg-white/10 transition-all flex items-center gap-2"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: project.primary_color || '#be0b3c' }}
                    />
                    {project.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Right: Locations List */}
      <div className="space-y-4">
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4">
          <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5" />
            Ubicaciones ({localLocations?.length || 0})
          </h4>
          
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
            {localLocations?.map((loc, index) => (
              <div
                key={index}
                className={`bg-white/5 rounded-xl border transition-all ${
                  selectedLocation === index ? 'border-blis-red/50 bg-blis-red/5' : 'border-white/5'
                }`}
              >
                {/* Header */}
                <div
                  className="p-3 flex items-center justify-between cursor-pointer"
                  onClick={() => setSelectedLocation(selectedLocation === index ? null : index)}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <GripVertical className="w-3 h-3 text-gray-600 cursor-grab" />
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: loc.dotColor, boxShadow: `0 0 8px ${loc.dotColor}` }}
                      />
                    </div>
                    <span className="text-sm text-white font-bold truncate">{loc.name}</span>
                    {loc.city && <span className="text-xs text-gray-500 truncate">({loc.city})</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); moveLocation(index, 'up'); }}
                      disabled={index === 0}
                      className="p-1 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronUp className="w-3 h-3 text-gray-400" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); moveLocation(index, 'down'); }}
                      disabled={index === localLocations.length - 1}
                      className="p-1 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronDown className="w-3 h-3 text-gray-400" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteLocation(index); }}
                      className="p-1 rounded hover:bg-red-500/20 text-red-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                
                {/* Expanded Content */}
                {selectedLocation === index && (
                  <div className="px-3 pb-3 pt-0 space-y-3 border-t border-white/5 mt-2">
                    <div className="grid grid-cols-2 gap-2 pt-3">
                      <div>
                        <label className="text-[9px] text-gray-500 uppercase block mb-1">Nombre Corto</label>
                        <input
                          type="text"
                          value={loc.name}
                          onChange={(e) => updateLocation(index, 'name', e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white"
                          placeholder="Montana"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-gray-500 uppercase block mb-1">Nombre Completo</label>
                        <input
                          type="text"
                          value={loc.fullName}
                          onChange={(e) => updateLocation(index, 'fullName', e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white"
                          placeholder="Residencial Montana"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] text-gray-500 uppercase block mb-1">Ciudad</label>
                        <input
                          type="text"
                          value={loc.city}
                          onChange={(e) => updateLocation(index, 'city', e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white"
                          placeholder="Latacunga"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-gray-500 uppercase block mb-1">Provincia</label>
                        <input
                          type="text"
                          value={loc.province}
                          onChange={(e) => updateLocation(index, 'province', e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white"
                          placeholder="Cotopaxi"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] text-gray-500 uppercase block mb-1">Estado</label>
                        <select
                          value={loc.status}
                          onChange={(e) => updateLocation(index, 'status', e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white"
                        >
                          {STATUS_OPTIONS.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[9px] text-gray-500 uppercase block mb-1">Color</label>
                        <div className="flex gap-1 flex-wrap">
                          {DOT_COLORS.map(color => (
                            <button
                              key={color.value}
                              onClick={() => updateLocation(index, 'dotColor', color.value)}
                              className={`w-5 h-5 rounded-full border-2 transition-transform ${
                                loc.dotColor === color.value ? 'border-white scale-110' : 'border-transparent hover:scale-110'
                              }`}
                              style={{ backgroundColor: color.value }}
                              title={color.name}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] text-gray-500 uppercase block mb-1">Posición Top</label>
                        <input
                          type="text"
                          value={loc.coordinates.top}
                          onChange={(e) => updateLocation(index, 'coordinates', { ...loc.coordinates, top: e.target.value })}
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white"
                          placeholder="50%"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-gray-500 uppercase block mb-1">Posición Left</label>
                        <input
                          type="text"
                          value={loc.coordinates.left}
                          onChange={(e) => updateLocation(index, 'coordinates', { ...loc.coordinates, left: e.target.value })}
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white"
                          placeholder="50%"
                        />
                      </div>
                    </div>
                    
                    <p className="text-[9px] text-gray-600 italic">
                      Arrastra el punto en el mapa para ajustar su posición
                    </p>
                  </div>
                )}
              </div>
            ))}
            
            {(!localLocations || localLocations.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No hay ubicaciones</p>
                <p className="text-xs mt-1">Haz clic en "Agregar en Mapa" o selecciona un proyecto</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}