'use client';
import React, { useState } from 'react';
import { MousePointerClick, Settings, Database, Copy, Sparkles, Type, Image as ImageIcon, Video, MousePointerClick as ClickIcon, Minus, Share2, Code, Layout, ArrowUp, ArrowDown, Trash2, Grid, ChevronDown, Check, Mail } from 'lucide-react';
import { SOCIAL_CONFIG, FONTS, FONT_WEIGHTS } from '../_types';
import { PropertyGroup, PropertyInput, PropertyTextarea, PropertySelect, PropertyColor, PropertyAlignment, PropertyFileOrUrl, PropertyBackgroundImage, PropertyPadding } from './PropertyComponents';
import EventSelector from './EventSelector';
import VariablePanel from './VariablePanel';

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
  return <button onClick={handleAI} disabled={loading} className="w-full mb-3 bg-yellow-50 dark:bg-[#2a1f0a] border border-[#f5e100]/30 text-[#f5e100] text-[10px] font-bold py-1.5 rounded flex items-center justify-center gap-2"><Sparkles size={12}/> {loading ? 'Generando...' : 'Optimizar con IA'}</button>;
}

function ColToolBtn({ icon: Icon, label, onClick }) {
  return <button onClick={onClick} className="flex flex-col items-center p-2 hover:bg-white dark:hover:bg-[#222] rounded transition-colors border border-transparent hover:border-[#f5e100]/30"><Icon size={14} className="mb-1 text-gray-500" /><span className="text-[8px] font-bold text-gray-600 dark:text-gray-400">{label}</span></button>;
}

export default function MailEditor({ activeTab, setActiveTab, setSelectedBlockId, selectedBlock, selectedBlockId, moveBlock, duplicateBlock, removeBlock, applyPalette, senders, addNetwork, settings, updateSetting, currentPalettes, handleUpdateContent, showMediaModal, setShowMediaModal, mediaCallbackRef, isEditingPalette, editingPaletteId, paletteForm, setPaletteForm, toggleCreatePalette, startEditPalette, deletePalette, movePalette, savePalette, addBlockToSpecificColumn, demoData, applyDemoData, previewWithDemo, setPreviewWithDemo, generateHTML, theme, savedTemplates, currentTemplateId, onLoadTemplateFromEvent, templatesLoading }) {
  const BLOCK_ICONS = { text: Type, image: ImageIcon, button: ClickIcon, video: Video, divider: Minus, social: Share2, html: Code, header: Layout, footer: Settings };
  const handleOpenMedia = (callback) => { setShowMediaModal(true); mediaCallbackRef.current = callback; };

  return (
    <aside className="w-80 bg-white dark:bg-[#111111] border-l border-gray-200 dark:border-[#222222] flex flex-col flex-shrink-0 z-10">
      <div className="flex border-b border-gray-200 dark:border-[#222222] bg-gray-50 dark:bg-[#161616]">
        <button onClick={() => setActiveTab('blocks')} className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'blocks' ? 'border-[#f5e100] text-[#f5e100] bg-white dark:bg-[#111111]' : 'border-transparent text-gray-500'}`}>
          <MousePointerClick size={16} /> Edición
        </button>
        <button onClick={() => { setActiveTab('global'); setSelectedBlockId(null); }} className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'global' ? 'border-[#f5e100] text-[#f5e100] bg-white dark:bg-[#111111]' : 'border-transparent text-gray-500'}`}>
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
              <span className="text-xs font-bold text-[#f5e100] uppercase tracking-wider bg-yellow-50 dark:bg-[#2a1f0a] px-2 py-1 rounded">Sección: {selectedBlock.type}</span>
              <div className="flex items-center gap-1">
                <button onClick={(e) => { e.stopPropagation(); moveBlock(selectedBlockId, 'up'); }} className="p-1.5 text-gray-400 hover:text-[#f5e100] hover:bg-gray-100 dark:hover:bg-[#222] rounded" title="Subir"><ArrowUp size={14} /></button>
                <button onClick={(e) => { e.stopPropagation(); moveBlock(selectedBlockId, 'down'); }} className="p-1.5 text-gray-400 hover:text-[#f5e100] hover:bg-gray-100 dark:hover:bg-[#222] rounded" title="Bajar"><ArrowDown size={14} /></button>
                <button onClick={(e) => { e.stopPropagation(); duplicateBlock(selectedBlockId, e); }} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-[#1e2a3a] rounded" title="Duplicar"><Copy size={14} /></button>
                <button onClick={(e) => { e.stopPropagation(); removeBlock(selectedBlockId, e); }} className="p-1.5 bg-yellow-50 text-yellow-500 hover:bg-yellow-100 rounded" title="Eliminar"><Trash2 size={14} /></button>
              </div>
            </div>
            {selectedBlock.type === 'header' && <HeaderEditor selectedBlock={selectedBlock} handleUpdateContent={handleUpdateContent} handleOpenMedia={handleOpenMedia} />}
            {selectedBlock.type === 'text' && <TextEditor selectedBlock={selectedBlock} handleUpdateContent={handleUpdateContent} handleOpenMedia={handleOpenMedia} />}
            {selectedBlock.type === 'image' && <ImageEditor selectedBlock={selectedBlock} handleUpdateContent={handleUpdateContent} handleOpenMedia={handleOpenMedia} />}
            {selectedBlock.type === 'video' && <VideoEditor selectedBlock={selectedBlock} handleUpdateContent={handleUpdateContent} handleOpenMedia={handleOpenMedia} />}
            {selectedBlock.type === 'columns' && <ColumnsEditor selectedBlock={selectedBlock} handleUpdateContent={handleUpdateContent} handleOpenMedia={handleOpenMedia} addBlockToSpecificColumn={addBlockToSpecificColumn} selectedBlockId={selectedBlockId} BLOCK_ICONS={BLOCK_ICONS} setSelectedBlockId={setSelectedBlockId} removeBlock={removeBlock} />}
            {selectedBlock.type === 'button' && <ButtonEditor selectedBlock={selectedBlock} handleUpdateContent={handleUpdateContent} handleOpenMedia={handleOpenMedia} />}
            {selectedBlock.type === 'divider' && <DividerEditor selectedBlock={selectedBlock} handleUpdateContent={handleUpdateContent} handleOpenMedia={handleOpenMedia} />}
            {selectedBlock.type === 'spacer' && <SpacerEditor selectedBlock={selectedBlock} handleUpdateContent={handleUpdateContent} handleOpenMedia={handleOpenMedia} />}
            {selectedBlock.type === 'social' && <SocialEditor selectedBlock={selectedBlock} handleUpdateContent={handleUpdateContent} handleOpenMedia={handleOpenMedia} addNetwork={addNetwork} />}
            {selectedBlock.type === 'html' && <HtmlEditor selectedBlock={selectedBlock} handleUpdateContent={handleUpdateContent} />}
            {selectedBlock.type === 'footer' && <FooterEditor selectedBlock={selectedBlock} handleUpdateContent={handleUpdateContent} />}
          </div>
        )}
        {activeTab === 'global' && <GlobalSettings settings={settings} updateSetting={updateSetting} currentPalettes={currentPalettes} isEditingPalette={isEditingPalette} editingPaletteId={editingPaletteId} paletteForm={paletteForm} setPaletteForm={setPaletteForm} toggleCreatePalette={toggleCreatePalette} startEditPalette={startEditPalette} deletePalette={deletePalette} movePalette={movePalette} savePalette={savePalette} applyPalette={applyPalette} senders={senders} savedTemplates={savedTemplates} currentTemplateId={currentTemplateId} onLoadTemplateFromEvent={onLoadTemplateFromEvent} templatesLoading={templatesLoading} />}
        {activeTab === 'variables' && <VariablePanel currentEvent={settings.evento || 'ninguno'} />}
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
      <PropertyPadding label="Padding (px)" value={selectedBlock.content} onChange={(v) => handleUpdateContent(Object.keys(v)[0], Object.values(v)[0])} />
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
      <PropertyPadding label="Padding (px)" value={selectedBlock.content} onChange={(v) => handleUpdateContent(Object.keys(v)[0], Object.values(v)[0])} />
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
      <PropertyPadding label="Padding (px)" value={selectedBlock.content} onChange={(v) => handleUpdateContent(Object.keys(v)[0], Object.values(v)[0])} />
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

function ColumnsEditor({ selectedBlock, handleUpdateContent, handleOpenMedia, addBlockToSpecificColumn, selectedBlockId, BLOCK_ICONS, setSelectedBlockId, removeBlock }) {
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
                {colBlocks.length > 0 && (<div className="divide-y divide-gray-100 dark:divide-[#222]">{colBlocks.map((childBlock, blockIdx) => { const IconComp = BLOCK_ICONS[childBlock.type] || Code; const preview = childBlock.content?.text?.substring(0, 30) || childBlock.content?.imageUrl?.split('/').pop()?.substring(0, 20) || childBlock.content?.url?.substring(0, 20) || childBlock.type; return (<div key={childBlock.id || blockIdx} className="group flex items-center"><button onClick={() => setSelectedBlockId(childBlock.id)} className={`flex-1 flex items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-blue-50 dark:hover:bg-[#1e2a3a]`}><IconComp size={12} className="text-[#f5e100] flex-shrink-0" /><span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 capitalize flex-1 truncate">{childBlock.type}</span><span className="text-[10px] text-gray-400 truncate max-w-[80px]">{preview}</span></button><button onClick={(e) => { e.stopPropagation(); removeBlock(childBlock.id, e); }} className="p-1.5 text-gray-400 hover:text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12} /></button></div>); })}</div>)}
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
      <div className="flex items-center gap-2">
        <div className="flex-1"><PropertyColor label="Fondo Botón" value={selectedBlock.content.buttonBgColor} onChange={(v) => handleUpdateContent('buttonBgColor', v)} /></div>
        <div className="flex-1"><PropertyColor label="Color Texto" value={selectedBlock.content.textColor} onChange={(v) => handleUpdateContent('textColor', v)} /></div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1"><PropertyInput label="Tamaño (px)" type="number" value={selectedBlock.content.fontSize} onChange={(v) => handleUpdateContent('fontSize', v)} /></div>
        <div className="flex-1"><PropertySelect label="Peso" value={selectedBlock.content.fontWeight} onChange={(v) => handleUpdateContent('fontWeight', v)} options={FONT_WEIGHTS} /></div>
      </div>
      <PropertyInput label="Redondeo (px)" type="number" value={selectedBlock.content.borderRadius} onChange={(v) => handleUpdateContent('borderRadius', v)} />
      <PropertyAlignment value={selectedBlock.content.align} onChange={(v) => handleUpdateContent('align', v)} />
      <div className="flex items-center gap-2">
        <div className="flex-1"><PropertyColor label="Fondo Contenedor" value={selectedBlock.content.containerBgColor} onChange={(v) => handleUpdateContent('containerBgColor', v)} /></div>
      </div>
      <PropertyBackgroundImage bgImageUrl={selectedBlock.content.bgImageUrl} bgSize={selectedBlock.content.bgSize} bgPosition={selectedBlock.content.bgPosition} onChange={(key, value) => handleUpdateContent(key, value)} onOpenGallery={() => handleOpenMedia((url) => handleUpdateContent('bgImageUrl', url))} />
      <PropertyPadding label="Padding (px)" value={selectedBlock.content} onChange={(v) => handleUpdateContent(Object.keys(v)[0], Object.values(v)[0])} />
    </PropertyGroup>
  );
}

function DividerEditor({ selectedBlock, handleUpdateContent, handleOpenMedia }) {
  return (
    <PropertyGroup title="Separador">
      <PropertyColor label="Color de Línea" value={selectedBlock.content.color} onChange={(v) => handleUpdateContent('color', v)} />
      <PropertyInput label="Grosor (px)" type="number" value={selectedBlock.content.height} onChange={(v) => handleUpdateContent('height', v)} />
      <PropertySelect label="Estilo" value={selectedBlock.content.borderStyle} onChange={(v) => handleUpdateContent('borderStyle', v)} options={[{value:'solid',label:'Sólido'},{value:'dashed',label:'Guiones'},{value:'dotted',label:'Puntos'}]} />
      <PropertyPadding label="Padding (px)" value={selectedBlock.content} onChange={(v) => handleUpdateContent(Object.keys(v)[0], Object.values(v)[0])} />
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

function SocialEditor({ selectedBlock, handleUpdateContent, handleOpenMedia, addNetwork }) {
  return (
    <PropertyGroup title="Redes Sociales">
      <PropertyAlignment value={selectedBlock.content.align} onChange={(v) => handleUpdateContent('align', v)} />
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] text-gray-500">Tamaño iconos: </span>
        <input type="number" value={selectedBlock.content.iconSize} onChange={(v) => handleUpdateContent('iconSize', parseInt(v.target.value)||24)} className="w-16 px-2 py-1 border rounded text-xs dark:bg-[#0a0a0a] text-center" />
        <span className="text-[10px] text-gray-500">Redondeo: </span>
        <input type="number" value={selectedBlock.content.borderRadius} onChange={(v) => handleUpdateContent('borderRadius', parseInt(v.target.value)||8)} className="w-16 px-2 py-1 border rounded text-xs dark:bg-[#0a0a0a] text-center" />
      </div>
      <PropertyColor label="Color de Fondo" value={selectedBlock.content.bgColor} onChange={(v) => handleUpdateContent('bgColor', v)} />
      <PropertyBackgroundImage bgImageUrl={selectedBlock.content.bgImageUrl} bgSize={selectedBlock.content.bgSize} bgPosition={selectedBlock.content.bgPosition} onChange={(key, value) => handleUpdateContent(key, value)} onOpenGallery={() => handleOpenMedia((url) => handleUpdateContent('bgImageUrl', url))} />
      <PropertyPadding label="Padding (px)" value={selectedBlock.content} onChange={(v) => handleUpdateContent(Object.keys(v)[0], Object.values(v)[0])} />
      <div className="space-y-3 mt-2">
        {selectedBlock.content.networks.map((net) => (
          <div key={net.id} className="p-3 border rounded bg-gray-50 dark:bg-[#0a0a0a] dark:border-[#333]">
            <div className="flex justify-between items-center mb-2">
              <select value={net.network} onChange={(e) => { const newNet = e.target.value; handleUpdateContent('networks', selectedBlock.content.networks.map(n => n.id === net.id ? { ...n, network: newNet, bgColor: SOCIAL_CONFIG[newNet].defaultBg } : n)); }} className="text-[11px] font-bold uppercase bg-transparent outline-none cursor-pointer">
                {Object.keys(SOCIAL_CONFIG).map(k => (<option key={k} value={k}>{SOCIAL_CONFIG[k].label}</option>))}
              </select>
              <button onClick={() => handleUpdateContent('networks', selectedBlock.content.networks.filter(n => n.id !== net.id))} className="text-yellow-500 hover:bg-yellow-50 rounded p-0.5"><Trash2 size={12}/></button>
            </div>
            <input type="text" value={net.url} onChange={(e) => { const newNets = selectedBlock.content.networks.map(n => n.id === net.id ? { ...n, url: e.target.value } : n); handleUpdateContent('networks', newNets); }} placeholder="https://..." className="w-full text-xs p-1.5 border rounded dark:bg-[#161616] mb-2" />
<div className="flex flex-col gap-2">
              <div className="flex-1"><PropertyColor label="Icono" value={net.iconColor} onChange={(v) => { const newNets = selectedBlock.content.networks.map(n => n.id === net.id ? { ...n, iconColor: v } : n); handleUpdateContent('networks', newNets); }} /></div>
              <div className="flex-1"><PropertyColor label="Fondo" value={net.bgColor} onChange={(v) => { const newNets = selectedBlock.content.networks.map(n => n.id === net.id ? { ...n, bgColor: v } : n); handleUpdateContent('networks', newNets); }} /></div>
            </div>
          </div>
        ))}
        <button onClick={addNetwork} className="w-full py-2 text-xs bg-gray-100 dark:bg-[#222] font-bold rounded-lg border border-dashed border-gray-300 dark:border-[#444]">+ Añadir Red</button>
      </div>
    </PropertyGroup>
  );
}

function HtmlEditor({ selectedBlock, handleUpdateContent }) {
  return (<PropertyGroup title="Código HTML"><PropertyTextarea label="Código" value={selectedBlock.content.code} onChange={(v) => handleUpdateContent('code', v)} /></PropertyGroup>);
}
function FooterEditor({ selectedBlock, handleUpdateContent }) {
  return (<PropertyGroup title="Pie de Página"><PropertyTextarea label="Texto Legal" value={selectedBlock.content.text} onChange={(v) => handleUpdateContent('text', v)} /><PropertyColor label="Color de Texto" value={selectedBlock.content.textColor} onChange={(v) => handleUpdateContent('textColor', v)} /><PropertyInput label="Tamaño (px)" type="number" value={selectedBlock.content.fontSize} onChange={(v) => handleUpdateContent('fontSize', v)} /><PropertyAlignment value={selectedBlock.content.align} onChange={(v) => handleUpdateContent('align', v)} /><PropertyPadding label="Padding (px)" value={selectedBlock.content} onChange={(v) => handleUpdateContent(Object.keys(v)[0], Object.values(v)[0])} /></PropertyGroup>);
}

function GlobalSettings({ settings, updateSetting, currentPalettes, isEditingPalette, editingPaletteId, paletteForm, setPaletteForm, toggleCreatePalette, startEditPalette, deletePalette, movePalette, savePalette, applyPalette, senders, savedTemplates, currentTemplateId, onLoadTemplateFromEvent, templatesLoading }) {
  const [senderDropdownOpen, setSenderDropdownOpen] = useState(false);
  
  // Saneo: si el senderId guardado no existe en los senders disponibles, tratarlo como vacío
  const senderValido = (senders || []).some(s => s.id === settings.senderId);
  const senderEfectivoId = senderValido ? settings.senderId : '';
  const senderActual = (senders || []).find(s => s.id === senderEfectivoId) || null;
  const senderDefault = (senders || []).find(s => s.is_default) || null;
  
  return (
    <div className="space-y-6">
      <PropertyGroup title="Evento del Sistema">
        <EventSelector
          savedTemplates={savedTemplates}
          currentTemplateId={currentTemplateId}
          currentEvent={settings.evento || 'ninguno'}
          onAssignEvent={(value) => updateSetting('evento', value)}
          onLoadTemplate={onLoadTemplateFromEvent}
          templatesLoading={templatesLoading}
        />
      </PropertyGroup>
      <PropertyGroup title="Remitente por defecto">
        <div className="relative mb-3">
          <button
            type="button"
            onClick={() => setSenderDropdownOpen(!senderDropdownOpen)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 border rounded-xl text-left transition-all ${
              senderDropdownOpen
                ? 'border-[#f5e100]/60 bg-white dark:bg-[#161616] ring-1 ring-[#f5e100]/30'
                : 'border-gray-300 dark:border-[#333] bg-white dark:bg-[#0a0a0a] hover:border-gray-400 dark:hover:border-[#444]'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${senderActual ? 'bg-[#f5e100]/15 text-[#f5e100]' : 'bg-white/5 text-gray-500'}`}>
              <Mail size={15} />
            </div>
            <div className="flex-1 min-w-0">
              {senderActual ? (
                <>
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate flex items-center gap-1.5">
                    {senderActual.from_name}
                    {senderActual.is_default && <span className="text-[9px] bg-[#f5e100]/15 text-[#f5e100] px-1.5 py-0.5 rounded font-black uppercase tracking-widest">DEFAULT</span>}
                  </p>
                  <p className="text-[11px] text-gray-500 truncate">{senderActual.from_email}</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Sin remitente asignado</p>
                  <p className="text-[11px] text-gray-600">Selecciona un remitente</p>
                </>
              )}
            </div>
            <ChevronDown size={16} className={`shrink-0 text-gray-400 transition-transform ${senderDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {senderDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setSenderDropdownOpen(false)} />
              <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-white dark:bg-[#161616] border border-gray-200 dark:border-[#333] rounded-xl shadow-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => { updateSetting('senderId', ''); setSenderDropdownOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-[#222] transition-colors ${!senderEfectivoId ? 'bg-[#f5e100]/5' : ''}`}
                >
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-500"><Mail size={15} /></div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Sin remitente asignado</p>
                    <p className="text-[11px] text-gray-500">Usará el remitente global por defecto</p>
                  </div>
                  {!senderEfectivoId && <Check size={16} className="text-[#f5e100]" />}
                </button>
                {(senders || []).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => { updateSetting('senderId', s.id); setSenderDropdownOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-[#222] transition-colors ${senderEfectivoId === s.id ? 'bg-[#f5e100]/5' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${senderEfectivoId === s.id ? 'bg-[#f5e100]/15 text-[#f5e100]' : 'bg-white/5 text-gray-500'}`}>
                      <Mail size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate flex items-center gap-1.5">
                        {s.from_name}
                        {s.is_default && <span className="text-[9px] bg-[#f5e100]/15 text-[#f5e100] px-1.5 py-0.5 rounded font-black uppercase tracking-widest">DEFAULT</span>}
                      </p>
                      <p className="text-[11px] text-gray-500 truncate">{s.from_email}</p>
                    </div>
                    {senderEfectivoId === s.id && <Check size={16} className="text-[#f5e100]" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <p className="text-[10px] text-gray-500 mt-1">Remitente que usará esta plantilla al enviarse automáticamente</p>
        {senderDefault && (
          <p className="text-[10px] text-gray-500 mt-1.5 flex items-start gap-1.5 bg-white/[0.03] border border-white/5 rounded-lg p-2">
            <span className="text-[#f5e100] mt-0.5">✦</span>
            <span>En envíos automáticos (compra, creación de usuario) se usará el remitente global: <b className="text-gray-300">{senderDefault.from_name}</b> ({senderDefault.from_email})</span>
          </p>
        )}
      </PropertyGroup>
      <PropertyGroup title="Asunto y Previsualización">
        <PropertyInput label="Asunto del Correo" value={settings.subject || ''} onChange={(v) => updateSetting('subject', v)} placeholder="Ej: ¡Oferta especial para ti!" />
        <PropertyInput label="Texto de Previsualización" value={settings.previewText || ''} onChange={(v) => updateSetting('previewText', v)} placeholder="Aparece junto al asunto en la bandeja..." />
      </PropertyGroup>
      <PropertyGroup title="Todas las Paletas">
        <div className="grid grid-cols-2 gap-2 mb-3">
          {currentPalettes.map((p, index) => (
            <div key={p.id} className={`relative flex flex-col rounded border-2 overflow-hidden ${settings.activePaletteId === p.id ? 'border-[#f5e100] bg-[#f5e100]/10 text-[#f5e100]' : 'border-gray-200 dark:border-[#333] text-gray-500'}`}>
              <button onClick={() => applyPalette(p.id)} className="w-full text-xs font-bold pt-2 pb-6 px-1"><div className="flex justify-center gap-1 mb-1"><span className="w-3 h-3 rounded-full border" style={{background: p.bodyBg}}></span><span className="w-3 h-3 rounded-full border" style={{background: p.containerBg}}></span><span className="w-3 h-3 rounded-full" style={{background: p.primary}}></span></div>{p.name}</button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/5 p-1 flex justify-center items-center border-t border-gray-200 dark:border-[#333]">
                <button onClick={(e) => movePalette(index, 'up', e)} disabled={index === 0} className="px-1 text-gray-400 hover:text-gray-600"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m18 15-6-6-6 6"/></svg></button>
                <button onClick={(e) => movePalette(index, 'down', e)} disabled={index === currentPalettes.length - 1} className="px-1 text-gray-400 hover:text-gray-600"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg></button>
                <button onClick={(e) => startEditPalette(p, e)} className="px-1 text-gray-400 hover:text-blue-500"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg></button>
                <button onClick={(e) => deletePalette(p.id, e)} className="px-1 text-gray-400 hover:text-yellow-500"><Trash2 size={12}/></button>
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