'use client';
import React from 'react';
import { Layers, FolderOpen, Upload, Loader2 } from 'lucide-react';
import { AVAILABLE_BLOCKS } from '../_types';

export default function MailSidebar({ leftPanelTab, setLeftPanelTab, addBlock, zipLoading, onZipUpload, envatoQuery, setEnvatoQuery, searchEnvato, envatoLoading, envatoResults, envatoStatus, downloadEnvatoItem, envatoDownloading, checkEnvatoAndSearch, pasteEnvatoSession }) {
  return (
    <aside className="w-64 bg-white dark:bg-[#111111] border-r border-gray-200 dark:border-[#222222] flex flex-col flex-shrink-0 z-10">
      <div className="flex border-b border-gray-200 dark:border-[#222222] bg-gray-50 dark:bg-[#161616]">
        <button onClick={() => setLeftPanelTab('blocks')} className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-colors ${leftPanelTab === 'blocks' ? 'border-[#f5e100] text-[#f5e100] bg-white dark:bg-[#111111]' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
          <Layers size={13} /> Bloques
        </button>
        <button onClick={() => { setLeftPanelTab('envato'); if (!envatoStatus) checkEnvatoAndSearch?.(); else if (envatoResults.length === 0) searchEnvato(envatoQuery); }} className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-colors ${leftPanelTab === 'envato' ? 'border-[#82b440] text-[#82b440] bg-white dark:bg-[#111111]' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
          <FolderOpen size={13} /> Envato
        </button>
      </div>
      {leftPanelTab === 'blocks' && (
        <div className="p-2 grid grid-cols-3 gap-1 overflow-y-auto custom-scrollbar flex-1" style={{ gridAutoRows: '48px' }}>
          {AVAILABLE_BLOCKS.map(block => {
            const IconComp = block.Icon;
            return (
              <button key={block.type} onClick={() => addBlock(block.type)} title={block.label} className="flex flex-col items-center justify-center h-full bg-gray-50 dark:bg-[#161616] border border-gray-200 dark:border-[#262626] hover:border-[#f5e100] hover:bg-yellow-50 dark:hover:bg-[#1a1a0a] text-gray-500 dark:text-gray-400 hover:text-[#f5e100] rounded-lg transition-all group">
                <IconComp size={14} className="mb-0.5 group-hover:text-[#f5e100]" />
                <span className="text-[9px] font-bold leading-none">{block.label}</span>
              </button>
            );
          })}
        </div>
      )}
      {leftPanelTab === 'envato' && (
        <div className="flex flex-col flex-1 p-3 gap-3">
          <button onClick={() => window.open('https://app.envato.com/search?itemType=web-templates&term=&filter.categories=Email+Templates&sort=popular', '_blank')} className="w-full flex items-center justify-center gap-2 py-3 bg-[#82b440] hover:bg-[#6c9635] text-white rounded-xl text-[11px] font-black uppercase tracking-wide transition-all shadow">
            <FolderOpen size={13} /> Abrir Envato Elements
          </button>
          <div className="text-center">
            <p className="text-[10px] text-gray-500 leading-relaxed">Descarga el <b className="text-gray-300">.zip</b> de la plantilla y súbelo abajo</p>
          </div>
          <input type="file" accept=".html,.zip,.rar" id="envato-import-sidebar" className="hidden" onChange={onZipUpload} />
          <button onClick={() => document.getElementById('envato-import-sidebar').click()} disabled={zipLoading} className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-[#82b440]/50 hover:border-[#82b440] text-[#82b440] hover:bg-[#82b440]/5 disabled:opacity-60 rounded-xl text-[11px] font-bold transition-all">
            {zipLoading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
            {zipLoading ? 'Procesando...' : 'Subir .zip / .html'}
          </button>
        </div>
      )}
    </aside>
  );
}