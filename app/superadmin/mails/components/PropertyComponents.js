import React from 'react';
import { Trash2, ArrowUp, ArrowDown, Grid, Upload, X, Loader2 } from 'lucide-react';

// Componentes base
export function PropertyGroup({ title, children }) {
  return (
    <div className="mb-4">
      <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">{title}</h4>
      {children}
    </div>
  );
}

export function PropertyInput({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div className="mb-3">
      {label && <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">{label}</label>}
      <input
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(type === 'number' ? (e.target.value ? Number(e.target.value) : '') : e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 dark:border-[#333] bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-200 rounded text-sm focus:outline-none focus:border-[#f5e100]"
      />
    </div>
  );
}

export function PropertyTextarea({ label, value, onChange, rows = 4 }) {
  return (
    <div className="mb-3">
      {label && <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">{label}</label>}
      <textarea
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full px-3 py-2 border border-gray-300 dark:border-[#333] bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-200 rounded text-sm focus:outline-none focus:border-[#f5e100] resize-none"
      />
    </div>
  );
}

export function PropertySelect({ label, value, onChange, options }) {
  return (
    <div className="mb-3">
      {label && <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">{label}</label>}
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 dark:border-[#333] bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-200 rounded text-sm focus:outline-none focus:border-[#f5e100]"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

export function PropertyColor({ label, value, onChange }) {
  return (
    <div className="mb-3">
      <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">{label}</label>
      <div className="flex gap-2">
        <input
          type="color"
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 border border-gray-300 dark:border-[#333] rounded cursor-pointer bg-transparent"
        />
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-[#333] bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-200 rounded text-sm font-mono"
        />
      </div>
    </div>
  );
}

export function PropertyAlignment({ value, onChange }) {
  return (
    <div className="mb-3">
      <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">Alineación</label>
      <div className="flex bg-gray-100 dark:bg-[#0a0a0a] p-1 rounded border border-gray-200 dark:border-[#333]">
        <button
          onClick={() => onChange('left')}
          className={`flex-1 flex justify-center py-1.5 rounded ${value === 'left' ? 'bg-white dark:bg-[#222] text-[#f5e100] shadow-sm' : 'text-gray-500'}`}
        >
          ←
        </button>
        <button
          onClick={() => onChange('center')}
          className={`flex-1 flex justify-center py-1.5 rounded ${value === 'center' ? 'bg-white dark:bg-[#222] text-[#f5e100] shadow-sm' : 'text-gray-500'}`}
        >
          ↔
        </button>
        <button
          onClick={() => onChange('right')}
          className={`flex-1 flex justify-center py-1.5 rounded ${value === 'right' ? 'bg-white dark:bg-[#222] text-[#f5e100] shadow-sm' : 'text-gray-500'}`}
        >
          →
        </button>
      </div>
    </div>
  );
}

export function PropertyFileOrUrl({ label, value, onChange, onOpenGallery }) {
  return (
    <div className="mb-3">
      {label && <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">{label}</label>}
      <div className="flex gap-1">
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="URL de imagen..."
          className="flex-1 px-2 py-1.5 text-xs border border-gray-300 dark:border-[#333] bg-white dark:bg-[#0a0a0a] rounded"
        />
        <button
          type="button"
          onClick={onOpenGallery}
          className="p-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded"
          title="Galería"
        >
          <Grid size={14} />
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="p-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded"
            title="Quitar"
          >
            <X size={14} />
          </button>
        )}
      </div>
      {value && (
        <div className="mt-2 rounded overflow-hidden border border-gray-200 dark:border-[#333]">
          <img 
            src={value} 
            alt="Preview" 
            className="w-full h-20 object-contain bg-gray-100 dark:bg-[#222]"
            onError={(e) => { e.currentTarget.src = 'https://placehold.co/150/333/FFF?text=Error'; }}
          />
        </div>
      )}
    </div>
  );
}

export function PropertyBackgroundImage({ bgImageUrl, bgSize, bgPosition, onChange, onOpenGallery }) {
  return (
    <div className="mb-3">
      <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">Imagen de Fondo</label>
      <div className="flex gap-1">
        <input
          type="text"
          value={bgImageUrl || ''}
          onChange={(e) => onChange('bgImageUrl', e.target.value)}
          placeholder="URL de imagen..."
          className="flex-1 px-2 py-1.5 text-xs border border-gray-300 dark:border-[#333] bg-white dark:bg-[#0a0a0a] rounded"
        />
        <button
          onClick={onOpenGallery}
          className="p-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded"
          title="Galería"
        >
          <Grid size={14} />
        </button>
        {bgImageUrl && (
          <button
            onClick={() => onChange('bgImageUrl', '')}
            className="p-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded"
            title="Quitar"
          >
            <X size={14} />
          </button>
        )}
      </div>
      {bgImageUrl && (
        <>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <label className="block text-[9px] text-gray-500 mb-1">Tamaño</label>
              <select
                value={bgSize || 'cover'}
                onChange={(e) => onChange('bgSize', e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-[#333] bg-white dark:bg-[#0a0a0a] rounded"
              >
                <option value="cover">Cubrir</option>
                <option value="contain">Contener</option>
                <option value="100% 100%">Estirar</option>
                <option value="auto">Original</option>
              </select>
            </div>
            <div>
              <label className="block text-[9px] text-gray-500 mb-1">Posición</label>
              <select
                value={bgPosition || 'center'}
                onChange={(e) => onChange('bgPosition', e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-[#333] bg-white dark:bg-[#0a0a0a] rounded"
              >
                <option value="center">Centro</option>
                <option value="top">Arriba</option>
                <option value="bottom">Abajo</option>
                <option value="left">Izquierda</option>
                <option value="right">Derecha</option>
              </select>
            </div>
          </div>
          <div className="mt-2 rounded overflow-hidden border border-gray-200 dark:border-[#333]">
            <div 
              className="h-16 bg-cover bg-center"
              style={{ backgroundImage: `url(${bgImageUrl})` }}
            />
          </div>
        </>
      )}
    </div>
  );
}

export function BlockActions({ selectedBlockId, moveBlock, removeBlock }) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={(e) => { e.stopPropagation(); moveBlock(selectedBlockId, 'up', e); }}
        className="p-1.5 text-gray-400 hover:text-[#f5e100] hover:bg-gray-100 dark:hover:bg-[#222] rounded"
        title="Subir"
      >
        <ArrowUp size={14} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); moveBlock(selectedBlockId, 'down', e); }}
        className="p-1.5 text-gray-400 hover:text-[#f5e100] hover:bg-gray-100 dark:hover:bg-[#222] rounded"
        title="Bajar"
      >
        <ArrowDown size={14} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); removeBlock(selectedBlockId, e); }}
        className="p-1.5 text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded"
        title="Eliminar"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

export function PropertyPadding({ label, value, onChange }) {
  const getPad = (side) => {
    if (value?.[`padding${side}`] != null) return value[`padding${side}`];
    if (value?.padding != null) return value.padding;
    return 0;
  };
  const setPad = (side, v) => onChange({ [`padding${side}`]: parseInt(v) || 0 });
  return (
    <div className="mb-3">
      {label && <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">{label}</label>}
      <div className="grid grid-cols-4 gap-1">
        <div className="text-center">
          <span className="text-[9px] text-gray-500 block mb-0.5">↑ Arriba</span>
          <PropertyInputNoLabel type="number" value={getPad('Top')} onChange={(v) => setPad('Top', v)} />
        </div>
        <div className="text-center">
          <span className="text-[9px] text-gray-500 block mb-0.5">↓ Abajo</span>
          <PropertyInputNoLabel type="number" value={getPad('Bottom')} onChange={(v) => setPad('Bottom', v)} />
        </div>
        <div className="text-center">
          <span className="text-[9px] text-gray-500 block mb-0.5">← Izq</span>
          <PropertyInputNoLabel type="number" value={getPad('Left')} onChange={(v) => setPad('Left', v)} />
        </div>
        <div className="text-center">
          <span className="text-[9px] text-gray-500 block mb-0.5">→ Der</span>
          <PropertyInputNoLabel type="number" value={getPad('Right')} onChange={(v) => setPad('Right', v)} />
        </div>
      </div>
    </div>
  );
}

function PropertyInputNoLabel({ value, onChange, type = 'text' }) {
  return (
    <input
      type={type}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-2 py-1.5 border border-gray-300 dark:border-[#333] bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-200 rounded text-[10px] font-mono text-center"
    />
  );
}