'use client';
import React, { memo } from 'react';
import { Layers } from 'lucide-react';
import BlockRenderer from './BlockRenderer';

const MailPreview = memo(function MailPreview({ displayBlocks, selectedBlockId, setSelectedBlockId, setActiveTab, settings, previewMode, previewWithDemo, moveBlock, removeBlock, updateBlockTree, blocks }) {
  return (
    <main className="flex-1 overflow-y-auto bg-gray-200 dark:bg-[#16161a] custom-scrollbar-main relative" onClick={() => setSelectedBlockId(null)}>
      <div className="flex flex-col items-center min-h-full pb-20 pt-10" style={{ backgroundColor: settings.bodyBg }}>
        {previewWithDemo && (
          <div className="w-full max-w-[600px] mb-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-2.5 flex items-center gap-2 text-amber-400 text-xs font-bold">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Vista previa con datos demo activa — las variables muestran valores de ejemplo
          </div>
        )}
        {blocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-gray-400 opacity-60">
            <Layers size={64} className="mb-4" />
            <h3 className="text-xl font-bold">Lienzo en Blanco</h3>
            <p className="text-sm">Arrastra o haz clic en un elemento del panel izquierdo para comenzar.</p>
          </div>
        ) : (
          <div className={`shadow-2xl transition-all duration-300 relative bg-white dark:bg-[#111111]`} style={{ fontFamily: settings.fontFamily, width: previewMode === 'mobile' ? '375px' : `${settings.width}px`, minHeight: '600px', backgroundColor: settings.containerBg, borderRadius: previewMode === 'mobile' ? '30px' : '8px', border: previewMode === 'mobile' ? '12px solid #222222' : 'none', overflow: 'hidden' }}>
            {displayBlocks.map((block, index) => (
              <div key={block.id} className="relative group" onClick={(e) => { e.stopPropagation(); setSelectedBlockId(block.id); setActiveTab('blocks'); }} style={{ marginBottom: index < displayBlocks.length - 1 ? `${Math.max(0, parseInt(settings.sectionGap) || 0)}px` : 0, outline: selectedBlockId === block.id ? '2px solid #f5e100' : 'none', outlineOffset: '-2px' }}
                onMouseEnter={(e) => { if (selectedBlockId !== block.id) e.currentTarget.style.outline = '1px dashed rgba(225,29,72,0.3)'; }}
                onMouseLeave={(e) => { if (selectedBlockId !== block.id) e.currentTarget.style.outline = 'none'; }}>
                <div className={`absolute right-0 top-0 translate-x-full ml-1 flex-col space-y-1 bg-white dark:bg-[#161616] p-1 rounded-lg shadow-xl border border-gray-200 dark:border-[#333333] z-50 ${selectedBlockId === block.id ? 'flex' : 'hidden group-hover:flex'}`}>
                  <button onClick={(e) => moveBlock(block.id, 'up', e)} className="p-1 text-gray-500 hover:text-[#f5e100]" disabled={index === 0}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                  </button>
                  <button onClick={(e) => moveBlock(block.id, 'down', e)} className="p-1 text-gray-500 hover:text-[#f5e100]" disabled={index === blocks.length - 1}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </button>
                  <button onClick={(e) => removeBlock(block.id, e)} className="p-1 text-yellow-500">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                </div>
                <BlockRenderer block={block} settings={settings} selectedBlockId={selectedBlockId} setSelectedBlockId={setSelectedBlockId} updateTree={updateBlockTree} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
});

export default MailPreview;