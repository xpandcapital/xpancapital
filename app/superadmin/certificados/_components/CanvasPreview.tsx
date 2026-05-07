import { QrCode, FileText } from "lucide-react";
import type { CertificateTemplate, CertificateElement } from "../_types";

interface Props {
  currentTemplate: CertificateTemplate;
  selectedId: string | null;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  onDragStart: (e: React.PointerEvent, el: CertificateElement) => void;
  onSelectElement: (id: string) => void;
  syncBounds: () => void;
}

export function CanvasPreview({
  currentTemplate,
  selectedId,
  canvasRef,
  onDragStart,
  onSelectElement,
  syncBounds,
}: Props) {
  return (
    <div
      ref={canvasRef}
      className="relative w-full aspect-[1.414/1] bg-zinc-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] cursor-crosshair group/canvas isolate"
      onMouseDownCapture={syncBounds}
      onTouchStartCapture={syncBounds}
    >
      {!currentTemplate.backgroundImage && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-zinc-800">
          <FileText className="w-20 h-20 opacity-5" />
          <p className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-700">
            Sin Fondo Seleccionado
          </p>
        </div>
      )}

      {currentTemplate.backgroundImage && (
        <img
          src={currentTemplate.backgroundImage}
          className="w-full h-full object-contain pointer-events-none select-none"
          alt="Cert"
        />
      )}

      <div className="absolute inset-0 pointer-events-none opacity-40 transition-opacity isolate">
        <div className="absolute inset-[5%] border border-dashed border-blis-red/20 rounded-xl" />
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-blis-red/30" />
        <div className="absolute left-0 right-0 top-1/2 h-px bg-blis-red/30" />
      </div>

      {currentTemplate.elements.map(el => {
        const isSelected = selectedId === el.id;
        return (
          <div
            key={el.id}
            onPointerDown={e => onDragStart(e, el)}
            onClick={() => onSelectElement(el.id)}
            className={`absolute flex items-center justify-center p-4 cursor-move transition-transform duration-75 select-none ${
              isSelected
                ? "ring-2 ring-blis-red bg-blis-red/5 z-50 rounded-xl"
                : "z-10 hover:bg-white/5 rounded-lg"
            }`}
            style={{
              left: `${Math.max(0, Math.min(100, el.x))}%`,
              top: `${Math.max(0, Math.min(100, el.y))}%`,
              transform: "translate(-50%, -50%)",
              color: el.color,
              fontWeight: el.fontWeight,
              textAlign: "center",
              whiteSpace: "nowrap",
              touchAction: "none",
            }}
          >
            {isSelected && (
              <>
                <div className="absolute inset-0 bg-blis-red/10 rounded-xl" />
                <div className="absolute top-1/2 left-[-100vw] right-[-100vw] h-px bg-blis-red/20 pointer-events-none" />
                <div className="absolute left-1/2 top-[-100vh] bottom-[-100vh] w-px bg-blis-red/20 pointer-events-none" />
              </>
            )}

            {el.type === "qr" ? (
              <div className="bg-white p-2 rounded-lg shadow-2xl border-2 border-white/10">
                <QrCode
                  className="text-black"
                  style={{ width: `${el.fontSize * 0.8}px`, height: `${el.fontSize * 0.8}px` }}
                />
              </div>
            ) : (
              <span style={{ fontSize: `${el.fontSize * 0.12}vw` }}>
                {el.type === "name"
                  ? "[NOMBRE DEL ESTUDIANTE]"
                  : el.type === "course"
                    ? "[NOMBRE DEL CURSO]"
                    : "[FECHA]"}
              </span>
            )}

            {isSelected && (
              <div className="absolute -bottom-12 whitespace-nowrap px-3 py-1 bg-black text-[9px] font-mono text-zinc-400 rounded-full border border-white/10 flex gap-4">
                <span>
                  X: <span className="text-white">{el.x.toFixed(1)}%</span>
                </span>
                <span>
                  Y: <span className="text-white">{el.y.toFixed(1)}%</span>
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
