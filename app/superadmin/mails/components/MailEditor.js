'use client';
import React, { useState } from 'react';
import { MousePointerClick, Settings, Database, Copy, Sparkles, Type, Image as ImageIcon, Video, MousePointerClick as ClickIcon, Minus, Share2, Code, Layout, ArrowUp, ArrowDown, Trash2, Grid } from 'lucide-react';
import { SOCIAL_CONFIG, FONTS, FONT_WEIGHTS } from '../_types';
import { PropertyGroup, PropertyInput, PropertyTextarea, PropertySelect, PropertyColor, PropertyAlignment, PropertyFileOrUrl, PropertyBackgroundImage } from './PropertyComponents';

function AIGenerator({ blockId, currentText, onGenerate }) {
  const [loading, setLoading] = useState(false);
  const handleAI = async () => {
    setLoading(true);
    try {
      const resp = await fetch('/api/ai/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'gemini-flash', prompt: `Reescribe de forma profesional y persuasiva para un email marketing: "${currentText}". Responde solo con el texto mejorado.`, temperature: 0.7 }) });
      const data = await resp.json();
      if (data.text) onGenerate(data.text.trim());
    } catch (e) { console.error(e); }
    setLoading(false);
  };
  return <button onClick={handleAI} disabled={loading} className="w-full mb-3 bg-red-50 dark:bg-[#2a0e16] border border-[#e11d48]/30 text-[#e11d48] text-[10px] font-bold py-1.5 rounded flex items-center justify-center gap-2"><Sparkles size={12}/> {loading ? 'Generando...' : 'Optimizar con IA'}</button>;
}

function ColToolBtn({ icon: Icon, label, onClick }) {
  return <button onClick={onClick} className="flex flex-col items-center p-2 hover:bg-white dark:hover:bg-[#222] rounded transition-colors border border-transparent hover:border-[#e11d48]/30"><Icon size={14} className="mb-1 text-gray-500" /><span className="text-[8px] font-bold text-gray-600 dark:text-gray-400">{label}</span></button>;
}

export default function MailEditor({ activeTab, setActiveTab, setSelectedBlockId, selectedBlock, selectedBlockId, settings, updateSetting, currentPalettes, handleUpdateContent, showMediaModal, setShowMediaModal, mediaCallbackRef, isEditingPalette, editingPaletteId, paletteForm, setPaletteForm, toggleCreatePalette, startEditPalette, deletePalette, movePalette, savePalette, addBlockToSpecificColumn, demoData, applyDemoData, previewWithDemo, setPreviewWithDemo, generateHTML, theme }) {
  const BLOCK_ICONS = { text: Type, image: ImageIcon, button: ClickIcon, video: Video, divider: Minus, social: Share2, html: Code, header: Layout, footer: Settings };
  const handleOpenMedia = (callback) => { setShowMediaModal(true); mediaCallbackRef.current = callback; };

  return (
    <aside className="w-80 bg-white dark:bg-[#111111] border-l border-gray-200 dark:border-[#222222] flex flex-col flex-shrink-0 z-10">
      <div className="flex border-b border-gray-200 dark:border-[#222222] bg-gray-50 dark:bg-[#161616]">
        <button onClick={() => setActiveTab('blocks')} className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'blocks' ? 'border-[#e11d48] text-[#e11d48] bg-white dark:bg-[#111111]' : 'border-transparent text-gray-500'}`}>
          <MousePointerClick size={16} /> Edición
        </button>
        <button onClick={() => { setActiveTab('global'); setSelectedBlockId(null); }} className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'global' ? 'border-[#e11d48] text-[#e11d48] bg-white dark:bg-[#111111]' : 'border-transparent text-gray-500'}`}>
          <Settings size={16} /> Global
        </button>
        <button onClick={() => { setActiveTab('variables'); setSelectedBlockId(null); }} className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'variables' ? 'border-[#f59e0b] text-[#f59e0b] bg-white dark:bg-[#111111]' : 'border-transparent text-gray-500'}`}>
          <Database size={16} /> Variables
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
        {activeTab === 'blocks' && !selectedBlockId && (
          <div className="text-center text-gray-400 mt-10">
            <MousePointerClick size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-sm font-medium">Selecciona un bloque para editar</p>
          </div>
        )}
        {activeTab === 'blocks' && selectedBlockId && selectedBlock && (
          <div className="animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-[#262626] mb-4">
              <span className="text-xs font-bold text-[#e11d48] uppercase tracking-wider bg-red-50 dark:bg-[#2a0e16] px-2 py-1 rounded">Sección: {selectedBlock.type}</span>
              <div className="flex items-center gap-1">
                <button onClick={(e) => { e.stopPropagation(); }} className="p-1.5 text-gray-400 hover:text-[#e11d48] hover:bg-gray-100 dark:hover:bg-[#222] rounded" title="Subir"><ArrowUp size={14} /></button>
                <button onClick={(e) => { }} className="p-1.5 text-gray-400 hover:text-[#e11d48] hover:bg-gray-100 dark:hover:bg-[#222] rounded" title="Bajar"><ArrowDown size={14} /></button>
                <button className="p-1.5 bg-red-50 text-red-500 rounded" title="Eliminar"><Trash2 size={14} /></button>
              </div>
            </div>
            {selectedBlock.type === 'header' && <HeaderEditor selectedBlock={selectedBlock} handleUpdateContent={handleUpdateContent} handleOpenMedia={handleOpenMedia} />}
            {selectedBlock.type === 'text' && <TextEditor selectedBlock={selectedBlock} handleUpdateContent={handleUpdateContent} handleOpenMedia={handleOpenMedia} />}
            {selectedBlock.type === 'image' && <ImageEditor selectedBlock={selectedBlock} handleUpdateContent={handleUpdateContent} handleOpenMedia={handleOpenMedia} />}
            {selectedBlock.type === 'video' && <VideoEditor selectedBlock={selectedBlock} handleUpdateContent={handleUpdateContent} handleOpenMedia={handleOpenMedia} />}
            {selectedBlock.type === 'columns' && <ColumnsEditor selectedBlock={selectedBlock} handleUpdateContent={handleUpdateContent} handleOpenMedia={handleOpenMedia} addBlockToSpecificColumn={addBlockToSpecificColumn} selectedBlockId={selectedBlockId} BLOCK_ICONS={BLOCK_ICONS} />}
            {selectedBlock.type === 'button' && <ButtonEditor selectedBlock={selectedBlock} handleUpdateContent={handleUpdateContent} handleOpenMedia={handleOpenMedia} />}
            {selectedBlock.type === 'divider' && <DividerEditor selectedBlock={selectedBlock} handleUpdateContent={handleUpdateContent} handleOpenMedia={handleOpenMedia} />}
            {selectedBlock.type === 'spacer' && <SpacerEditor selectedBlock={selectedBlock} handleUpdateContent={handleUpdateContent} handleOpenMedia={handleOpenMedia} />}
            {selectedBlock.type === 'social' && <SocialEditor selectedBlock={selectedBlock} handleUpdateContent={handleUpdateContent} addNetwork={() => {}} />}
            {selectedBlock.type === 'html' && <HtmlEditor selectedBlock={selectedBlock} handleUpdateContent={handleUpdateContent} />}
            {selectedBlock.type === 'footer' && <FooterEditor selectedBlock={selectedBlock} handleUpdateContent={handleUpdateContent} />}
          </div>
        )}
        {activeTab === 'global' && <GlobalSettings settings={settings} updateSetting={updateSetting} currentPalettes={currentPalettes} isEditingPalette={isEditingPalette} editingPaletteId={editingPaletteId} paletteForm={paletteForm} setPaletteForm={setPaletteForm} toggleCreatePalette={toggleCreatePalette} startEditPalette={startEditPalette} deletePalette={deletePalette} movePalette={movePalette} savePalette={savePalette} applyPalette={applyPalette} />}
        {activeTab === 'variables' && <VariablesPanel demoData={demoData} previewWithDemo={previewWithDemo} setPreviewWithDemo={setPreviewWithDemo} generateHTML={generateHTML} applyDemoData={applyDemoData} />}
      </div>
    </aside>
  );
}

function HeaderEditor({ selectedBlock, handleUpdateContent, handleOpenMedia }) {
  return (
    <PropertyGroup title="Logo">
      <PropertyFileOrUrl label="URL del Logo" value={selectedBlock.content.logoUrl} onChange={(v) => handleUpdateContent('logoUrl', v)} onOpenGallery={() => handleOpenMedia((url) => handleUpdateContent('logoUrl', url))} />
      <PropertyInput label="Ancho (px)" type="number" value={selectedBlock.content.logoWidth} onChange={(v) => handleUpdateContent('logoWidth', v)} />
      <PropertyColor label="Fondo" value={selectedBlock.content.bgColor} onChange={(v) => handleUpdateContent('bgColor', v)} />
      <PropertyInput label="Padding (px)" type="number" value={selectedBlock.content.padding} onChange={(v) => handleUpdateContent('padding', v)} />
      <PropertyAlignment value={selectedBlock.content.align} onChange={(v) => handleUpdateContent('align', v)} />
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-[#333]"><PropertyBackgroundImage bgImageUrl={selectedBlock.content.bgImageUrl} bgSize={selectedBlock.content.bgSize} bgPosition={selectedBlock.content.bgPosition} onChange={(key, value) => handleUpdateContent(key, value)} onOpenGallery={() => handleOpenMedia((url) => handleUpdateContent('bgImageUrl', url))} /></div>
    </PropertyGroup>
  );
}

function TextEditor({ selectedBlock, handleUpdateContent, handleOpenMedia }) {
  return (
    <PropertyGroup title="Texto">
      <AIGenerator blockId={selectedBlock.id} currentText={selectedBlock.content.text} onGenerate={(text) => handleUpdateContent('text', text)} />
      <PropertyTextarea label="Contenido" value={selectedBlock.content.text} onChange={(v) => handleUpdateContent('text', v)} />
      <div className="grid grid-cols-2 gap-3">
        <PropertyInput label="Tamaño (px)" type="number" value={selectedBlock.content.fontSize} onChange={(v) => handleUpdateContent('fontSize', v)} />
        <PropertySelect label="Peso" value={selectedBlock.content.fontWeight} onChange={(v) => handleUpdateContent('fontWeight', v)} options={FONT_WEIGHTS} />
      </div>
      <PropertyColor label="Color del texto" value={selectedBlock.content.textColor} onChange={(v) => handleUpdateContent('textColor', v)} />
      <PropertyColor label="Color de fondo" value={selectedBlock.content.bgColor} onChange={(v) => handleUpdateContent('bgColor', v)} />
      <PropertyAlignment value={selectedBlock.content.align} onChange={(v) => handleUpdateContent('align', v)} />
    </PropertyGroup>
  );
}

function ImageEditor({ selectedBlock, handleUpdateContent, handleOpenMedia }) {
  return (
    <PropertyGroup title="Imagen / GIF">
      <PropertyFileOrUrl label="URL de Imagen" value={selectedBlock.content.imageUrl} onChange={(v) => handleUpdateContent('imageUrl', v)} onOpenGallery={() => handleOpenMedia((url) => handleUpdateContent('imageUrl', url))} />
      <PropertyInput label="Ancho (%)" type="number" value={selectedBlock.content.width} onChange={(v) => handleUpdateContent('width', v)} />
      <PropertyInput label="Redondeo (px)" type="number" value={selectedBlock.content.borderRadius} onChange={(v) => handleUpdateContent('borderRadius', v)} />
      <PropertyAlignment value={selectedBlock.content.align} onChange={(v) => handleUpdateContent('align', v)} />
    </PropertyGroup>
  );
}

function VideoEditor({ selectedBlock, handleUpdateContent, handleOpenMedia }) {
  return (
    <PropertyGroup title="Video">
      <PropertySelect label="Tipo de Video" value={selectedBlock.content.type} onChange={(v) => handleUpdateContent('type', v)} options={[{value:'url', label:'URL (Youtube)'},{value:'embed', label:'Embed HTML'}]} />
      {selectedBlock.content.type === 'url' ? (<><PropertyInput label="URL de Video" value={selectedBlock.content.videoUrl} onChange={(v) => handleUpdateContent('videoUrl', v)} /><PropertyFileOrUrl label="URL de Portada" value={selectedBlock.content.coverUrl} onChange={(v) => handleUpdateContent('coverUrl', v)} onOpenGallery={() => handleOpenMedia((url) => handleUpdateContent('coverUrl', url))} /></>) : (<PropertyTextarea label="Código Embed (Iframe)" value={selectedBlock.content.embedCode} onChange={(v) => handleUpdateContent('embedCode', v)} />)}
      <PropertyInput label="Redondeo (px)" type="number" value={selectedBlock.content.borderRadius} onChange={(v) => handleUpdateContent('borderRadius', v)} />
      <PropertyAlignment value={selectedBlock.content.align} onChange={(v) => handleUpdateContent('align', v)} />
      <PropertyColor label="Fondo" value={selectedBlock.content.bgColor} onChange={(v) => handleUpdateContent('bgColor', v)} />
      <PropertyInput label="Padding (px)" type="number" value={selectedBlock.content.padding} onChange={(v) => handleUpdateContent('padding', parseInt(v)||0)} />
    </PropertyGroup>
  );
}

function ColumnsEditor({ selectedBlock, handleUpdateContent, handleOpenMedia, addBlockToSpecificColumn, selectedBlockId, BLOCK_ICONS }) {
  return (
    <div className="space-y-4">
      <PropertyGroup title="Configuración de Columnas">
        <PropertySelect label="Número de Columnas" value={selectedBlock.content.colCount} onChange={(v) => handleUpdateContent('colCount', Number(v))} options={[{value:1,label:'1 Columna'},{value:2,label:'2 Columnas'},{value:3,label:'3 Columnas'},{value:4,label:'4 Columnas'}]} />
        <PropertyColor label="Color de Fondo" value={selectedBlock.content.bgColor} onChange={(v) => handleUpdateContent('bgColor', v)} />
        <PropertyInput label="Padding (px)" type="number" value={selectedBlock.content.padding} onChange={(v) => handleUpdateContent('padding', parseInt(v)||0)} />
        <PropertySelect label="Alineación Vertical" value={selectedBlock.content.align} onChange={(v) => handleUpdateContent('align', v)} options={[{value:'top',label:'Superior'},{value:'middle',label:'Centrado'},{value:'bottom',label:'Inferior'}]} />
      </PropertyGroup>
      <PropertyGroup title="Contenido de Columnas">
        <div className="space-y-4">
          {[...Array(selectedBlock.content.colCount)].map((_, colIdx) => {
            const colBlocks = selectedBlock.content.cols?.[colIdx] || [];
            return (
              <div key={colIdx} className="border border-gray-200 dark:border-[#333] rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 bg-gray-100 dark:bg-[#1a1a1a]">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Columna {colIdx + 1}</span>
                  <span className="text-[9px] text-gray-600">{colBlocks.length} bloque{colBlocks.length !== 1 ? 's' : ''}</span>
                </div>
                {colBlocks.length > 0 && (<div className="divide-y divide-gray-100 dark:divide-[#222]">{colBlocks.map((childBlock, blockIdx) => { const IconComp = BLOCK_ICONS[childBlock.type] || Code; const preview = childBlock.content?.text?.substring(0, 30) || childBlock.content?.imageUrl?.split('/').pop()?.substring(0, 20) || childBlock.content?.url?.substring(0, 20) || childBlock.type; return (<div key={childBlock.id || blockIdx} className="group"><button onClick={() => {/* setSelectedBlockId */}} className={`w-full flex items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-blue-50 dark:hover:bg-[#1e2a3a]`}><IconComp size={12} className="text-[#e11d48] flex-shrink-0" /><span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 capitalize flex-1 truncate">{childBlock.type}</span><span className="text-[10px] text-gray-400 truncate max-w-[80px]">{preview}</span></button></div>); })}</div>)}
                <div className="p-2 bg-gray-50 dark:bg-[#0a0a0a]"><p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold mb-1.5">Agregar</p><div className="grid grid-cols-4 gap-1"><ColToolBtn icon={Type} label="Texto" onClick={() => addBlockToSpecificColumn(selectedBlock.id, colIdx, 'text')} /><ColToolBtn icon={ImageIcon} label="Imagen" onClick={() => addBlockToSpecificColumn(selectedBlock.id, colIdx, 'image')} /><ColToolBtn icon={ClickIcon} label="Botón" onClick={() => addBlockToSpecificColumn(selectedBlock.id, colIdx, 'button')} /><ColToolBtn icon={Video} label="Video" onClick={() => addBlockToSpecificColumn(selectedBlock.id, colIdx, 'video')} /></div></div>
              </div>
            );
          })}
        </div>
      </PropertyGroup>
    </div>
  );
}

function ButtonEditor({ selectedBlock, handleUpdateContent, handleOpenMedia }) {
  return (
    <PropertyGroup title="Botón">
      <PropertyInput label="Texto del Botón" value={selectedBlock.content.text} onChange={(v) => handleUpdateContent('text', v)} />
      <PropertyInput label="Enlace (Link)" value={selectedBlock.content.url} onChange={(v) => handleUpdateContent('url', v)} />
      <div className="grid grid-cols-2 gap-2"><PropertyColor label="Fondo Botón" value={selectedBlock.content.buttonBgColor} onChange={(v) => handleUpdateContent('buttonBgColor', v)} /><PropertyColor label="Texto" value={selectedBlock.content.textColor} onChange={(v) => handleUpdateContent('textColor', v)} /></div>
      <PropertyInput label="Redondeo (px)" type="number" value={selectedBlock.content.borderRadius} onChange={(v) => handleUpdateContent('borderRadius', v)} />
      <PropertyAlignment value={selectedBlock.content.align} onChange={(v) => handleUpdateContent('align', v)} />
    </PropertyGroup>
  );
}

function DividerEditor({ selectedBlock, handleUpdateContent, handleOpenMedia }) {
  return (
    <PropertyGroup title="Separador">
      <PropertyColor label="Color de Línea" value={selectedBlock.content.color} onChange={(v) => handleUpdateContent('color', v)} />
      <PropertyInput label="Grosor (px)" type="number" value={selectedBlock.content.height} onChange={(v) => handleUpdateContent('height', v)} />
      <PropertySelect label="Estilo" value={selectedBlock.content.borderStyle} onChange={(v) => handleUpdateContent('borderStyle', v)} options={[{value:'solid',label:'Sólido'},{value:'dashed',label:'Guiones'},{value:'dotted',label:'Puntos'}]} />
      <PropertyInput label="Padding (px)" type="number" value={selectedBlock.content.padding} onChange={(v) => handleUpdateContent('padding', v)} />
    </PropertyGroup>
  );
}

function SpacerEditor({ selectedBlock, handleUpdateContent, handleOpenMedia }) {
  return (
    <PropertyGroup title="Espaciado">
      <PropertyInput label="Altura (px)" type="number" value={selectedBlock.content.height} onChange={(v) => handleUpdateContent('height', v)} />
      <PropertyColor label="Fondo" value={selectedBlock.content.bgColor} onChange={(v) => handleUpdateContent('bgColor', v)} />
    </PropertyGroup>
  );
}

function SocialEditor({ selectedBlock, handleUpdateContent, addNetwork }) {
  return (
    <PropertyGroup title="Redes Sociales">
      <div className="space-y-3">
        {selectedBlock.content.networks.map((net) => (
          <div key={net.id} className="p-2 border rounded bg-gray-50 dark:bg-[#0a0a0a] dark:border-[#333]">
            <div className="flex justify-between items-center mb-1">
              <select value={net.network} onChange={(e) => { const newNet = e.target.value; handleUpdateContent('networks', selectedBlock.content.networks.map(n => n.id === net.id ? { ...n, network: newNet, bgColor: SOCIAL_CONFIG[newNet].defaultBg } : n)); }} className="text-[10px] font-bold uppercase bg-transparent outline-none cursor-pointer border-b border-dashed border-gray-400">
                {Object.keys(SOCIAL_CONFIG).map(k => (<option key={k} value={k}>{SOCIAL_CONFIG[k].label}</option>))}
              </select>
              <button onClick={() => handleUpdateContent('networks', selectedBlock.content.networks.filter(n => n.id !== net.id))} className="text-red-500"><Trash2 size={12}/></button>
            </div>
            <input type="text" value={net.url} onChange={(e) => { const newNets = selectedBlock.content.networks.map(n => n.id === net.id ? { ...n, url: e.target.value } : n); handleUpdateContent('networks', newNets); }} className="w-full text-xs p-1 border rounded dark:bg-[#161616] mb-1" />
            <div className="grid grid-cols-2 gap-1"><PropertyColor label="Icono" value={net.iconColor} onChange={(v) => { const newNets = selectedBlock.content.networks.map(n => n.id === net.id ? { ...n, iconColor: v } : n); handleUpdateContent('networks', newNets); }} /><PropertyColor label="Fondo" value={net.bgColor} onChange={(v) => { const newNets = selectedBlock.content.networks.map(n => n.id === net.id ? { ...n, bgColor: v } : n); handleUpdateContent('networks', newNets); }} /></div>
          </div>
        ))}
        <button onClick={addNetwork} className="w-full py-1 text-xs bg-gray-100 dark:bg-[#222] font-bold">+ Añadir Red</button>
      </div>
    </PropertyGroup>
  );
}

function HtmlEditor({ selectedBlock, handleUpdateContent }) {
  return (<PropertyGroup title="Código HTML"><PropertyTextarea label="Código" value={selectedBlock.content.code} onChange={(v) => handleUpdateContent('code', v)} /></PropertyGroup>);
}
function FooterEditor({ selectedBlock, handleUpdateContent }) {
  return (<PropertyGroup title="Pie de Página"><PropertyTextarea label="Texto Legal" value={selectedBlock.content.text} onChange={(v) => handleUpdateContent('text', v)} /><PropertyColor label="Color de Texto" value={selectedBlock.content.textColor} onChange={(v) => handleUpdateContent('textColor', v)} /><PropertyInput label="Tamaño (px)" type="number" value={selectedBlock.content.fontSize} onChange={(v) => handleUpdateContent('fontSize', v)} /><PropertyAlignment value={selectedBlock.content.align} onChange={(v) => handleUpdateContent('align', v)} /></PropertyGroup>);
}

function GlobalSettings({ settings, updateSetting, currentPalettes, isEditingPalette, editingPaletteId, paletteForm, setPaletteForm, toggleCreatePalette, startEditPalette, deletePalette, movePalette, savePalette, applyPalette }) {
  return (
    <div className="space-y-6">
      <PropertyGroup title="Asunto y Previsualización">
        <PropertyInput label="Asunto del Correo" value={settings.subject || ''} onChange={(v) => updateSetting('subject', v)} placeholder="Ej: ¡Oferta especial para ti!" />
        <PropertyInput label="Texto de Previsualización" value={settings.previewText || ''} onChange={(v) => updateSetting('previewText', v)} placeholder="Aparece junto al asunto en la bandeja..." />
      </PropertyGroup>
      <PropertyGroup title="Todas las Paletas">
        <div className="grid grid-cols-2 gap-2 mb-3">
          {currentPalettes.map((p, index) => (
            <div key={p.id} className={`relative flex flex-col rounded border-2 overflow-hidden ${settings.activePaletteId === p.id ? 'border-[#e11d48] bg-[#e11d48]/10 text-[#e11d48]' : 'border-gray-200 dark:border-[#333] text-gray-500'}`}>
              <button onClick={() => applyPalette(p.id)} className="w-full text-xs font-bold pt-2 pb-6 px-1"><div className="flex justify-center gap-1 mb-1"><span className="w-3 h-3 rounded-full border" style={{background: p.bodyBg}}></span><span className="w-3 h-3 rounded-full border" style={{background: p.containerBg}}></span><span className="w-3 h-3 rounded-full" style={{background: p.primary}}></span></div>{p.name}</button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/5 p-1 flex justify-center items-center border-t border-gray-200 dark:border-[#333]">
                <button onClick={(e) => movePalette(index, 'up', e)} disabled={index === 0} className="px-1 text-gray-400 hover:text-gray-600"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m18 15-6-6-6 6"/></svg></button>
                <button onClick={(e) => movePalette(index, 'down', e)} disabled={index === currentPalettes.length - 1} className="px-1 text-gray-400 hover:text-gray-600"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg></button>
                <button onClick={(e) => startEditPalette(p, e)} className="px-1 text-gray-400 hover:text-blue-500"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg></button>
                <button onClick={(e) => deletePalette(p.id, e)} className="px-1 text-gray-400 hover:text-red-500"><Trash2 size={12}/></button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={toggleCreatePalette} className="w-full py-1.5 bg-gray-100 dark:bg-[#222] text-xs font-bold rounded border-dashed border-2 border-gray-300 dark:border-[#444]">{isEditingPalette && !editingPaletteId ? '- Cancelar' : '+ Añadir Nueva Paleta'}</button>
      </PropertyGroup>
      <PropertyGroup title="Estructura General">
        <PropertyInput label="Ancho Correo (px)" type="number" value={settings.width} onChange={(v) => updateSetting('width', v)} />
        <PropertySelect label="Tipografía Global" value={settings.fontFamily} onChange={(v) => updateSetting('fontFamily', v)} options={FONTS} />
        <PropertyInput label="Separación de Secciones (px)" type="number" value={settings.sectionGap} onChange={(v) => updateSetting('sectionGap', parseInt(v)||0)} />
      </PropertyGroup>
    </div>
  );
}

function VariablesPanel({ demoData, previewWithDemo, setPreviewWithDemo, generateHTML, applyDemoData }) {
  const [copied, setCopied] = useState(false);
  const groups = [
    { label: '👤 Cliente', color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20', vars: [{ key: 'nombre', desc: 'Nombre completo' }, { key: 'email', desc: 'Email' }, { key: 'telefono', desc: 'Teléfono' }, { key: 'ciudad', desc: 'Ciudad' }] },
    { label: '🔐 Acceso', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', vars: [{ key: 'password', desc: 'Contraseña temporal' }, { key: 'enlace_acceso', desc: 'URL acceso' }, { key: 'enlace_baja', desc: 'URL baja' }] },
    { label: '🛒 Compra', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', vars: [{ key: 'total', desc: 'Monto total' }, { key: 'subtotal', desc: 'Subtotal' }, { key: 'descuento_monto', desc: 'Descuento' }, { key: 'metodo_pago', desc: 'Método de pago' }, { key: 'fecha', desc: 'Fecha' }] },
    { label: '📦 Productos', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', vars: [{ key: 'producto_1_nombre', desc: 'Producto 1' }, { key: 'producto_1_precio', desc: 'Precio 1' }, { key: 'producto_2_nombre', desc: 'Producto 2' }, { key: 'producto_2_precio', desc: 'Precio 2' }] },
    { label: '🎁 Ofertas', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', vars: [{ key: 'campana', desc: 'Campaña' }, { key: 'descuento', desc: '% descuento' }, { key: 'cupon', desc: 'Código cupón' }, { key: 'vencimiento', desc: 'Vencimiento' }] },
    { label: '🏢 Empresa', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', vars: [{ key: 'empresa', desc: 'Nombre empresa' }, { key: 'whatsapp', desc: 'WhatsApp' }] },
  ];
  return (
    <div className="space-y-5">
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4"><h3 className="text-amber-400 font-black text-xs uppercase tracking-widest mb-1 flex items-center gap-2"><Database size={14} /> Variables Disponibles</h3><p className="text-xs text-gray-400 leading-relaxed">Escribe <code className="text-amber-400 bg-black/40 px-1 rounded">{'{{nombre}}'}</code> en cualquier bloque y se reemplazará al enviar.</p></div>
      <div className="flex items-center justify-between bg-gray-100 dark:bg-[#1a1a1a] rounded-xl p-3"><div><p className="text-xs font-bold text-gray-700 dark:text-gray-200">Vista previa con datos demo</p><p className="text-[10px] text-gray-500">Ver cómo se verá el email con datos reales</p></div><button onClick={() => setPreviewWithDemo(p => !p)} className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${previewWithDemo ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'}`}><span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${previewWithDemo ? 'translate-x-5' : 'translate-x-0.5'}`} /></button></div>
      {groups.map(group => (<div key={group.label} className={`rounded-xl border p-3 ${group.bg}`}><p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${group.color}`}>{group.label}</p><div className="space-y-1">{group.vars.map(v => (<button key={v.key} onClick={() => { navigator.clipboard.writeText(`{{${v.key}}}`); }} title={`Clic para copiar {{${v.key}}}`} className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-black/20 hover:bg-black/40 transition-colors group text-left"><div className="min-w-0"><code className={`text-[11px] font-black ${group.color}`}>{`{{${v.key}}}`}</code><p className="text-[10px] text-gray-500 truncate">{v.desc}</p></div><Copy size={11} className="text-gray-600 group-hover:text-gray-300 transition-colors flex-shrink-0" /></button>))}</div></div>))}
    </div>
  );
}