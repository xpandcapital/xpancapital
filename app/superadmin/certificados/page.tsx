"use client";

import { useActionGuard } from "@/hooks/useActionGuard";
import { useCertificados } from "./_hooks";
import { LoadingState, CertificateList, CertificateEditor } from "./_components";

export default function CertificateEngine() {
  const { guard } = useActionGuard();
  const cert = useCertificados(guard);

  if (cert.loading) return <LoadingState />;

  if (cert.view === "editor" && cert.currentTemplate) {
    return (
      <CertificateEditor
        currentTemplate={cert.currentTemplate}
        saving={cert.saving}
        selectedId={cert.selectedId}
        canvasRef={cert.canvasRef}
        onBack={() => cert.setView("list")}
        onTitleChange={cert.handleTitleChange}
        onBgUpload={cert.handleBgUpload}
        onSave={cert.saveProject}
        onDragStart={cert.handleDragStart}
        onSelectElement={cert.handleSelectElement}
        syncBounds={cert.syncBounds}
        updateElement={cert.updateElement}
        startContinuousMove={cert.startContinuousMove}
        stopContinuousMove={cert.stopContinuousMove}
        startContinuousScale={cert.startContinuousScale}
        onDeselectElement={cert.handleDeselectElement}
      />
    );
  }

  return (
    <CertificateList
      templates={cert.templates}
      onNew={cert.handleCreateNew}
      onEdit={cert.handleEditTemplate}
      onDelete={cert.handleDeleteTemplate}
    />
  );
}
