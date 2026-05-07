import { CheckCircle2 } from "lucide-react";

export function TipsPanel() {
  return (
    <div className="bg-blis-red/5 border border-blis-red/20 rounded-[2.5rem] p-8">
      <h4 className="text-[10px] font-black text-blis-red uppercase tracking-widest mb-4 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4" /> Recomendaciones
      </h4>
      <ul className="space-y-3">
        {[
          "Usa fondos HD para evitar pixelado.",
          "El QR se genera dinámicamente por alumno.",
          "Los cambios se guardan en la base de datos.",
          "La alineación de centros es automática.",
        ].map((tip, i) => (
          <li key={i} className="text-xs text-zinc-400 flex items-start gap-3">
            <div className="w-1.5 h-1.5 bg-blis-red rounded-full mt-1.5 flex-shrink-0" />
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
}
