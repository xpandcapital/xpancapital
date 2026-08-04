'use client';
import React from 'react';
import { Monitor, Smartphone, Sun, Moon, Settings, Plus, FolderOpen, Upload, Database, Code, Send, Mail, Save } from 'lucide-react';

export default function MailToolbar({ theme, setTheme, previewMode, setPreviewMode, setShowSettingsModal, onNewTemplate, setShowTemplatesModal, importTemplate, fileInputRef, setShowSaveModal, onSaveAsNew, onSaveCurrent, currentTemplateId, setShowExportHtml, onOpenSend }) {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white dark:bg-[#111111] border-b border-gray-200 dark:border-[#222222] shadow-sm z-20 flex-shrink-0">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-[#f5e100] rounded-lg flex items-center justify-center shadow-md">
          <Mail className="text-white w-5 h-5" />
        </div>
        <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">XpandMail <span className="text-[#f5e100] font-black">CMS</span></h1>
      </div>
      <div className="hidden md:flex bg-gray-100 dark:bg-[#161616] p-1 rounded-lg border border-gray-200 dark:border-[#262626]">
        <button onClick={() => setPreviewMode('desktop')} title="Escritorio" className={`p-2 rounded-md flex items-center justify-center transition-all ${previewMode === 'desktop' ? 'bg-white dark:bg-[#222222] shadow-sm text-[#f5e100]' : 'text-gray-500'}`}>
          <Monitor size={18} />
        </button>
        <button onClick={() => setPreviewMode('mobile')} title="Móvil" className={`p-2 rounded-md flex items-center justify-center transition-all ${previewMode === 'mobile' ? 'bg-white dark:bg-[#222222] shadow-sm text-[#f5e100]' : 'text-gray-500'}`}>
          <Smartphone size={18} />
        </button>
      </div>
      <div className="flex items-center space-x-2">
        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} title={theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'} className="p-2 rounded-full bg-gray-100 dark:bg-[#161616] border border-gray-200 dark:border-[#262626] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#222]">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button onClick={() => setShowSettingsModal(true)} title="Configuración de Remitentes" className="p-2 rounded-full bg-gray-100 dark:bg-[#161616] border border-gray-200 dark:border-[#262626] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#222]">
          <Settings size={18} />
        </button>
        <button onClick={onNewTemplate} title="Nueva Plantilla en Blanco" className="p-2 flex items-center justify-center bg-white dark:bg-[#161616] border border-gray-300 dark:border-[#262626] text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-[#222]">
          <Plus size={18} />
        </button>
        <button onClick={() => setShowTemplatesModal(true)} title="Cargar Plantillas" className="p-2 flex items-center justify-center bg-white dark:bg-[#161616] border border-gray-300 dark:border-[#262626] text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-[#222]">
          <FolderOpen size={18} />
        </button>
        <input type="file" ref={fileInputRef} onChange={importTemplate} accept=".json" className="hidden" />
        <button onClick={() => fileInputRef.current?.click()} title="Importar JSON" className="p-2 flex items-center justify-center bg-white dark:bg-[#161616] border border-gray-300 dark:border-[#262626] text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-[#222]">
          <Upload size={18} />
        </button>
        <button onClick={onSaveCurrent} title="Guardar (sobrescribir)" className="p-2 flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white rounded-md">
          <Save size={18} />
        </button>
        <button onClick={onSaveAsNew} title="Guardar como Nueva Plantilla" className="p-2 flex items-center justify-center bg-emerald-500/80 hover:bg-emerald-500 text-white rounded-md text-[10px] font-bold gap-1">
          <Plus size={14} /> Nuevo
        </button>
        <button onClick={() => setShowExportHtml(true)} title="Exportar HTML" className="p-2 flex items-center justify-center bg-[#f5e100] hover:bg-[#d4c000] text-white rounded-md transition-colors">
          <Code size={18} />
        </button>
        <button onClick={onOpenSend} title="Enviar Campaña" className="p-2 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
          <Send size={18} />
        </button>
      </div>
    </header>
  );
}