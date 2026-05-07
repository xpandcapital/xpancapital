import type { CertificateTemplate, CertificateElement } from "../_types";
import { EditorToolbar } from "./EditorToolbar";
import { CanvasPreview } from "./CanvasPreview";
import { ElementSettings } from "./ElementSettings";
import { TipsPanel } from "./TipsPanel";

interface Props {
  currentTemplate: CertificateTemplate;
  saving: boolean;
  selectedId: string | null;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  onBack: () => void;
  onTitleChange: (title: string) => void;
  onBgUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
  onDragStart: (e: React.PointerEvent, el: CertificateElement) => void;
  onSelectElement: (id: string) => void;
  syncBounds: () => void;
  updateElement: (id: string, data: Partial<CertificateElement>) => void;
  startContinuousMove: (dx: number, dy: number) => void;
  stopContinuousMove: () => void;
  startContinuousScale: (delta: number) => void;
  onDeselectElement: () => void;
}

export function CertificateEditor({
  currentTemplate,
  saving,
  selectedId,
  canvasRef,
  onBack,
  onTitleChange,
  onBgUpload,
  onSave,
  onDragStart,
  onSelectElement,
  syncBounds,
  updateElement,
  startContinuousMove,
  stopContinuousMove,
  startContinuousScale,
  onDeselectElement,
}: Props) {
  const activeElement = currentTemplate.elements.find(e => e.id === selectedId);

  return (
    <div className="w-full space-y-8 pb-32 animate-in fade-in duration-700 px-4 md:px-8 pt-8 md:pt-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full min-w-0">
        <div className="lg:col-span-8 w-full min-w-0 space-y-6">
          <EditorToolbar
            currentTemplate={currentTemplate}
            saving={saving}
            onBack={onBack}
            onTitleChange={onTitleChange}
            onBgUpload={onBgUpload}
            onSave={onSave}
          />

          <CanvasPreview
            currentTemplate={currentTemplate}
            selectedId={selectedId}
            canvasRef={canvasRef}
            onDragStart={onDragStart}
            onSelectElement={onSelectElement}
            syncBounds={syncBounds}
          />
        </div>

        <div className="lg:col-span-4 space-y-6">
          <ElementSettings
            selectedId={selectedId}
            activeElement={activeElement}
            onUpdate={updateElement}
            onDeselect={onDeselectElement}
            startContinuousMove={startContinuousMove}
            stopContinuousMove={stopContinuousMove}
            startContinuousScale={startContinuousScale}
          />

          <TipsPanel />
        </div>
      </div>
    </div>
  );
}
