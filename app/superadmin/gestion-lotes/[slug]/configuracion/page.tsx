'use client';

import { useState } from 'react';
import { useProject } from '../_hooks/ProjectContext';
import { useLotes } from '../_hooks/useLotes';
import { useProjectConfig } from '../_hooks/useProjectConfig';
import { useAIProcessing } from '../_hooks/useAIProcessing';
import { UploadDropZone } from '../_components/UploadDropZone';
import { DateConfig } from '../_components/DateConfig';
import { generateMonthList } from '../_utils/months';

export default function ConfiguracionPage() {
  const { activeProjectId, activeProjectName } = useProject();
  const lotes = useLotes(activeProjectId || '');
  const { config, updateConfig } = useProjectConfig();
  const [isDrag, setIsDrag] = useState(false);

  const paymentMonths = generateMonthList(config.startMonth, config.signatureMonth, true).join(', ');

  const { isProcessing, logs, progress, processMassiveUpload } = useAIProcessing(
    () => paymentMonths, config,
    (updated) => lotes.updateSelectedLot(updated),
    () => {}, (msg) => console.error(msg)
  );

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault(); setIsDrag(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length === 0) return;
    const updated = await processMassiveUpload(files, lotes.activeLots);
    lotes.setLots(updated);
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const updated = await processMassiveUpload(files, lotes.activeLots);
    lotes.setLots(updated);
    e.target.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <DateConfig config={config} projectName={activeProjectName || ''} onChange={updateConfig} />
      <UploadDropZone isDrag={isDrag} isProcessing={isProcessing} progress={progress} logs={logs}
        onDragEnter={(e) => { e.preventDefault(); setIsDrag(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDrag(false); }}
        onDragOver={(e) => { e.preventDefault(); }} onDrop={handleDrop}
        onFileInput={handleFileInput} onImportJSON={() => {}} />
    </div>
  );
}
