'use client';

import { useState } from 'react';
import { Lote } from '../../_types';
import { SubCard } from '../shared/GlassCard';
import { aiChat } from '@/lib/ai-client';
import { fallbackCopyTextToClipboard } from '../../_utils/formatters';
import { Sparkles, Copy, Loader2 } from 'lucide-react';

interface Props {
  lot: Lote;
  isDesistido: boolean;
  toPayNow: number;
  pastDueInitial: number;
  pastDueQuotas: number;
  lateFees: number;
  saldoEscritura: number;
  signatureMonth: string;
  escrituraMonth: string;
  onUpdate: (lot: Partial<Lote>) => void;
  onError: (msg: string) => void;
}

const TONES = ['Administracion', 'Asesor Comercial', 'Gerente General', 'Departamento Legal'];

export function LoteAIComposer({ lot, isDesistido, toPayNow, pastDueInitial, pastDueQuotas, lateFees, saldoEscritura, signatureMonth, escrituraMonth, onUpdate, onError }: Props) {
  const [tone, setTone] = useState('Administracion');
  const [isGenerating, setIsGenerating] = useState(false);

  const generate = async () => {
    setIsGenerating(true);
    let roleInstruction = 'Actua como el Departamento de Administracion del proyecto.';
    let toneInstructions = 'Tono amigable pero formal y colaborativo.';

    if (tone === 'Asesor Comercial') {
      roleInstruction = 'Actua como el Asesor Comercial personal del cliente.';
      toneInstructions = 'Tono cercano, entusiasta y servicial. Enfocate en el sueno de tener su nuevo hogar.';
    } else if (tone === 'Gerente General') {
      roleInstruction = 'Actua como el Gerente General del proyecto inmobiliario.';
      toneInstructions = 'Tono institucional, de alto nivel, agradecido pero asertivo.';
    } else if (tone === 'Departamento Legal') {
      roleInstruction = 'Actua como el Departamento Legal de la constructora.';
      toneInstructions = 'Tono estricto, muy formal y riguroso.';
    }

    const promptText = `
      ${roleInstruction}
      ${toneInstructions}
      ${lot.status === 'Desistido'
        ? `El cliente ha desistido del contrato. Redacta un documento formal indicando la resolucion del contrato de reserva. Menciona que se le devolvera un monto de $${lot.refundAmount || 0}.`
        : `Redacta una notificacion de cobro para el cliente del Lote ${lot.loteNumber}.
        Datos: Precio Total: $${lot.totalPrice}, Pagado: $${lot.initialPayments?.reduce((a: number, p: any) => a + p.actual, 0) || 0} de entrada + cuotas, Deuda: $${toPayNow}, Saldo a Escritura: $${saldoEscritura}, Firma: ${signatureMonth}, Escritura: ${escrituraMonth}.
        ${lot.conditions?.authorizedHold ? 'El cliente tiene retencion de cuotas autorizada por demoras.' : ''}
        Maximo 3 parrafos.`
      }
    `;

    try {
      const result = await aiChat({
        model: 'gemini-flash',
        prompt: promptText,
        systemPrompt: 'Eres un redactor profesional experto en comunicacion inmobiliaria y cobranzas.',
      });
      const text = result.error ? 'No se pudo generar el mensaje.' : (result.text || '');
      onUpdate({ generatedMessage: text });
    } catch {
      onError('Error de conexion con la IA.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <SubCard>
      <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-3">
        <Sparkles className="w-3.5 h-3.5 inline mr-1.5" />Redaccion IA
      </h3>

      <div className="flex flex-wrap gap-2 mb-3">
        {TONES.map(t => (
          <button
            key={t}
            onClick={() => setTone(t)}
            className={`text-[9px] font-bold uppercase px-2.5 py-1 rounded-lg transition-all ${
              tone === t ? 'bg-rose-500 text-white' : 'bg-white/[0.03] text-zinc-500 hover:text-white border border-white/[0.06]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <button
        onClick={generate}
        disabled={isGenerating}
        className="w-full bg-rose-600 hover:bg-rose-500 disabled:bg-zinc-800 text-white text-[10px] font-black uppercase tracking-wider py-2.5 rounded-lg transition-all flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generando...</>
        ) : (
          <><Sparkles className="w-3.5 h-3.5" /> {isDesistido ? 'Generar Documento de Resolucion' : 'Redactar Notificacion de Cobro'}</>
        )}
      </button>

      {lot.generatedMessage && (
        <div className="mt-3 bg-black/60 border border-white/[0.06] rounded-lg p-3 relative">
          <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">{lot.generatedMessage}</p>
          <button
            onClick={() => { fallbackCopyTextToClipboard(lot.generatedMessage || ''); }}
            className="absolute top-2 right-2 text-zinc-500 hover:text-white transition-colors bg-black/80 border border-white/[0.06] rounded-md p-1"
          >
            <Copy className="w-3 h-3" />
          </button>
        </div>
      )}
    </SubCard>
  );
}
