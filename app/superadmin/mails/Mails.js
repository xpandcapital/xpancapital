'use client';
import React from 'react';
import { useMails } from './hooks';
import { generateHTML } from './lib/htmlGenerator';
import { MailSidebar, MailPreview, MailToolbar, MailEditor } from './components';
import { ExportHtmlModal, SaveTemplateModal, TemplatesModal, SendModal, MediaModal, SettingsModal, ZipModal } from './components';

export default function Mails() {
  const mail = useMails();
  const htmlOutput = () => generateHTML(mail.displayBlocks, mail.settings);

  return (
    <div id="blismail-cms-root" className={`flex flex-col h-screen font-sans overflow-hidden transition-colors duration-300 ${mail.theme === 'dark' ? 'dark bg-[#0a0a0a] text-gray-200' : 'bg-gray-100 text-gray-800'}`}>
      <MailToolbar
        theme={mail.theme}
        setTheme={mail.setTheme}
        previewMode={mail.previewMode}
        setPreviewMode={mail.setPreviewMode}
        setShowSettingsModal={mail.setShowSettingsModal}
        onNewTemplate={mail.handleNewTemplate}
        setShowTemplatesModal={mail.setShowTemplatesModal}
        importTemplate={mail.importTemplate}
        fileInputRef={mail.fileInputRef}
        setShowSaveModal={mail.setShowSaveModal}
        setShowExportHtml={mail.setShowExportHtml}
        onOpenSend={() => mail.handleOpenSendModal()}
        onSaveCurrent={() => mail.currentTemplateId ? mail.handleSaveTemplate(false) : mail.setShowSaveModal(true)}
        currentTemplateId={mail.currentTemplateId}
      />

      <div className="flex flex-1 overflow-hidden">
        <MailSidebar
          leftPanelTab={mail.leftPanelTab}
          setLeftPanelTab={mail.setLeftPanelTab}
          addBlock={mail.addBlock}
          zipLoading={mail.zipLoading}
          onZipUpload={(e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            e.target.value = '';
            if (file.name.toLowerCase().endsWith('.zip')) {
              mail.processZipFile(file);
              return;
            }
            const reader = new FileReader();
            reader.onload = (ev) => {
              const html = ev.target.result;
              if (!html) return;
              mail.importFromHTML(html, mail.PLATFORM_LABELS_MAP?.[mail.detectEnvatoPlatform(html)] || 'HTML Genérico');
            };
            reader.readAsText(file);
          }}
          envatoQuery={mail.envatoQuery}
          setEnvatoQuery={mail.setEnvatoQuery}
          searchEnvato={mail.searchEnvato}
          envatoLoading={mail.envatoLoading}
          envatoResults={mail.envatoResults}
          envatoStatus={mail.envatoStatus}
          downloadEnvatoItem={mail.downloadEnvatoItem}
          envatoDownloading={mail.envatoDownloading}
          checkEnvatoAndSearch={mail.checkEnvatoAndSearch}
          pasteEnvatoSession={mail.pasteEnvatoSession}
        />

        <MailPreview
          displayBlocks={mail.displayBlocks}
          selectedBlockId={mail.selectedBlockId}
          setSelectedBlockId={mail.setSelectedBlockId}
          setActiveTab={mail.setActiveTab}
          settings={mail.settings}
          previewMode={mail.previewMode}
          previewWithDemo={mail.previewWithDemo}
          moveBlock={mail.moveBlock}
          removeBlock={mail.removeBlock}
          updateBlockTree={mail.updateBlockTree}
          blocks={mail.blocks}
        />

        <MailEditor
          activeTab={mail.activeTab}
          setActiveTab={mail.setActiveTab}
          setSelectedBlockId={mail.setSelectedBlockId}
          selectedBlock={mail.selectedBlock}
          selectedBlockId={mail.selectedBlockId}
          moveBlock={mail.moveBlock}
          duplicateBlock={mail.duplicateBlock}
          removeBlock={mail.removeBlock}
          applyPalette={mail.applyPalette}
          senders={mail.senders}
          settings={mail.settings}
          updateSetting={mail.updateSetting}
          currentPalettes={mail.currentPalettes}
          handleUpdateContent={mail.handleUpdateContent}
          showMediaModal={mail.showMediaModal}
          setShowMediaModal={mail.setShowMediaModal}
          mediaCallbackRef={mail.mediaCallbackRef}
          isEditingPalette={mail.isEditingPalette}
          editingPaletteId={mail.editingPaletteId}
          paletteForm={mail.paletteForm}
          setPaletteForm={mail.setPaletteForm}
          toggleCreatePalette={mail.toggleCreatePalette}
          startEditPalette={mail.startEditPalette}
          deletePalette={mail.deletePalette}
          movePalette={mail.movePalette}
          savePalette={mail.savePalette}
          addBlockToSpecificColumn={mail.addBlockToSpecificColumn}
          addNetwork={mail.addNetwork}
          demoData={mail.demoData}
          applyDemoData={mail.applyDemoData}
          previewWithDemo={mail.previewWithDemo}
          setPreviewWithDemo={mail.setPreviewWithDemo}
          generateHTML={htmlOutput}
          theme={mail.theme}
          applyPalette={mail.applyPalette}
        />
      </div>

      <ExportHtmlModal show={mail.showExportHtml} onClose={() => mail.setShowExportHtml(false)} generateHTML={htmlOutput} copied={mail.copied} setCopied={mail.setCopied} />
      <SaveTemplateModal show={mail.showSaveModal} onClose={() => mail.setShowSaveModal(false)} templateName={mail.templateName} setTemplateName={mail.setTemplateName} currentTemplateId={mail.currentTemplateId} onSave={mail.handleSaveTemplate} templatesLoading={mail.templatesLoading} />
      <TemplatesModal show={mail.showTemplatesModal} onClose={() => mail.setShowTemplatesModal(false)} savedTemplates={mail.savedTemplates} onLoadTemplate={mail.handleLoadTemplate} onDeleteTemplate={mail.deleteTemplateFromDb} />
      <SendModal show={mail.showSendModal} onClose={() => mail.setShowSendModal(false)} campaignConfig={mail.campaignConfig} setCampaignConfig={mail.setCampaignConfig} senders={mail.senders} sendTab={mail.sendTab} setSendTab={mail.setSendTab} sendingEmail={mail.sendingEmail} onSend={() => mail.handleSendCampaign()} attachments={mail.attachments} setAttachments={mail.setAttachments} />
      <MediaModal show={mail.showMediaModal} onClose={() => mail.setShowMediaModal(false)} media={mail.media} mediaLoading={mail.mediaLoading} mediaTab={mail.mediaTab} setMediaTab={mail.setMediaTab} uploadMedia={mail.uploadMedia} deleteMedia={mail.deleteMedia} mediaCallbackRef={mail.mediaCallbackRef} />
      <SettingsModal show={mail.showSettingsModal} onClose={() => mail.setShowSettingsModal(false)} senders={mail.senders} editingSender={mail.editingSender} setEditingSender={mail.setEditingSender} saveSender={mail.saveSender} deleteSender={mail.deleteSender} testingConnection={mail.testingConnection} testResult={mail.testResult} setTestResult={mail.setTestResult} settingsTab={mail.settingsTab} setSettingsTab={mail.setSettingsTab} />
      <ZipModal show={mail.zipModal} onClose={() => mail.setZipModal(false)} zipFiles={mail.zipFiles} onImport={mail.importFromHTML} />

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        .custom-scrollbar-main::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar-main::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
}