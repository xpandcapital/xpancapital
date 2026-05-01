'use client';

import { useState, useCallback } from 'react';
import { aiChat } from '@/lib/ai-client';
import { Lote, ProcessingState } from '../_types';
import { generateMonthList } from '../_utils/months';

function generateAIPromptText(validMonths: string): string {
  return `Eres un analista contable inmobiliario super avanzado. Analiza exhaustivamente estos documentos (promesas de compraventa y recibos).
Cada documento viene precedido por la etiqueta "--- DOCUMENTO: [nombre_del_archivo] ---".
DEBES CLASIFICAR la informacion en CONTRATOS y RECIBOS.

Devuelve un JSON estricto con esta estructura:
{
  "contratosEncontrados": [
    {
      "loteNumber": "Identificador del lote (Ej: Lote 01, Lote 02)",
      "lotArea": "Area o medidas del lote en m2 (solo numero, 0 si no hay)",
      "owners": [
         {"name": "Nombre completo del COMPRADOR", "documentId": "Cedula o Pasaporte si aparece", "email": "Correo si aparece", "phone": "Celular si aparece"}
      ],
      "alternateContact": {
         "name": "Si el contrato menciona a un apoderado o persona designada, pon su nombre aqui.",
         "phone": "Telefono del contacto alterno si lo hay"
      },
      "totalPrice": "Precio total de venta (solo numero, 0 si no hay)",
      "expectedQuota": "Cuota mensual pactada regular predominante (solo numero, 0 si no hay)",
      "specialObservations": "Notas importantes como: 'Sorteo de vehiculo', 'Pago con comisiones de asesor', etc."
    }
  ],
  "recibosEncontrados": [
    {
      "loteNumber": "Identificador del lote pagado (Ej: Lote 01, Lote 02)",
      "mes": "Mes correspondiente al pago. Opciones: ${validMonths}. Vacio si es abono inicial.",
      "monto": "Numero pagado"
    }
  ]
}

IMPORTANTE: NUNCA pongas al vendedor/empresa en "owners" - SOLO los compradores.`;
}

export function useAIProcessing(
  getPaymentMonths: () => string,
  projectConfig: { startMonth: string; signatureMonth: string; escrituraMonth: string },
  updateLot: (lot: Lote) => void,
  onLog: (msg: string) => void,
  onError: (msg: string) => void
) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ProcessingState>({ current: 0, total: 0, status: '' });
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = useCallback((msg: string) => {
    setLogs(prev => [...prev, msg]);
    onLog(msg);
  }, [onLog]);

  const clearLogs = useCallback(() => setLogs([]), []);

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(file);
    });

  const processSingleLot = useCallback(async (
    files: File[],
    lot: Lote
  ): Promise<Lote | null> => {
    if (files.length === 0 || !lot) return null;

    setIsProcessing(true);
    addLog(`Iniciando analisis de ${files.length} archivo(s) para el Lote ${lot.loteNumber}...`);

    try {
      const images = [];
      const textParts = [];
      for (const file of files) {
        const base64 = await fileToBase64(file);
        images.push({ mimeType: file.type, data: base64 });
        textParts.push(`--- DOCUMENTO: ${file.name} ---`);
      }

      const fullPrompt = textParts.join('\n') + '\n\n' + generateAIPromptText(getPaymentMonths());

      addLog('Enviando documentos a Gemini AI...');
      const result = await aiChat({ model: 'gemini-flash', prompt: fullPrompt, images, temperature: 0.1 });

      if (!result.error) {
        const aiData = JSON.parse(result.text);
        let updatedLot = { ...lot };

        if (aiData.contratosEncontrados?.[0]) {
          const extracted = aiData.contratosEncontrados[0];
          addLog('Contrato detectado: Actualizando propietarios...');

          if (extracted.owners?.length > 0) {
            updatedLot.owners = extracted.owners.map((o: any) => ({
              id: crypto.randomUUID(), name: o.name || '', documentId: o.documentId || '', email: o.email || '', phoneCode: '+593', phone: o.phone || ''
            }));
            updatedLot.clientName = updatedLot.owners.map((o: any) => o.name).join(' y ');
          }
          if (extracted.alternateContact?.name) {
            updatedLot.alternateContact = { name: extracted.alternateContact.name, phoneCode: '+593', phone: extracted.alternateContact.phone || '' };
          }
          if (extracted.totalPrice > 0) updatedLot.totalPrice = Number(extracted.totalPrice);
          if (extracted.expectedQuota >= 0) updatedLot.expectedQuota = Number(extracted.expectedQuota);
        }

        const newDocs = [...(updatedLot.documents || [])];
        files.forEach(f => {
          if (!newDocs.some(d => d.name === f.name)) newDocs.push({ name: f.name, type: f.type.includes('pdf') ? 'contrato' : 'recibo' });
        });
        updatedLot.documents = newDocs;

        addLog('Proceso finalizado exitosamente!');
        return updatedLot;
      } else {
        onError('Error en la comunicacion con la IA');
        return null;
      }
    } catch (error) {
      console.error(error);
      onError('Error al procesar los documentos');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [getPaymentMonths, addLog, onError]);

  const processMassiveUpload = useCallback(async (
    files: File[],
    existingLots: Lote[]
  ): Promise<Lote[]> => {
    if (files.length === 0) return existingLots;

    setIsProcessing(true);
    setProgress({ current: 0, total: files.length, status: 'Iniciando...' });
    addLog(`Iniciando analisis masivo de ${files.length} documentos...`);

    const CHUNK_SIZE = 3;
    const lotsMap = new Map<string, Lote>();

    const normalizeNum = (num: string) => {
      if (!num) return '';
      const str = num.toString().toUpperCase().trim();
      const match = str.match(/(\d+)/);
      return match ? `LOTE${match[1].padStart(2, '0')}` : str.replace(/[^A-Z0-9]/g, '');
    };

    existingLots.forEach(l => lotsMap.set(normalizeNum(l.loteNumber) || l.loteNumber, l));

    for (let i = 0; i < files.length; i += CHUNK_SIZE) {
      const chunk = files.slice(i, i + CHUNK_SIZE);
      setProgress({ current: Math.min(i + CHUNK_SIZE, files.length), total: files.length, status: 'Analizando...' });
      addLog(`Enviando lote ${Math.floor(i / CHUNK_SIZE) + 1} a Gemini AI...`);

      try {
        const images = [];
        const textParts = [];
        for (const file of chunk) {
          images.push({ mimeType: file.type, data: await fileToBase64(file) });
          textParts.push(`--- DOCUMENTO: ${file.name} ---`);
        }

        const result = await aiChat({
          model: 'gemini-flash',
          prompt: textParts.join('\n') + '\n\n' + generateAIPromptText(getPaymentMonths()),
          images,
          temperature: 0.1,
        });

        if (!result.error) {
          const aiData = JSON.parse(result.text);
          addLog(`Contratos: ${aiData.contratosEncontrados?.length || 0}, Recibos: ${aiData.recibosEncontrados?.length || 0}`);

          if (aiData.contratosEncontrados) {
            for (const extracted of aiData.contratosEncontrados) {
              const lId = extracted.loteNumber;
              if (!lId) continue;
              const normId = normalizeNum(lId);
              let existing = lotsMap.get(normId) || lotsMap.get(lId);
              if (!existing) {
                existing = {
                  id: crypto.randomUUID(), loteNumber: normId, lotArea: Number(extracted.lotArea) || 0,
                  clientName: 'No especificado', owners: [],
                  totalPrice: Number(extracted.totalPrice) || 0, expectedQuota: Number(extracted.expectedQuota) || 0,
                  initialPayments: [{ id: crypto.randomUUID(), description: 'Entrada Inicial', expected: 0, actual: 0, paymentDate: '', receiptAttached: null }],
                  payments: generateMonthList(projectConfig.startMonth, projectConfig.signatureMonth, true).map((m, idx) => ({
                    id: idx, month: m, expected: Number(extracted.expectedQuota) || 0, actual: 0, receiptAttached: null, paymentDate: '',
                  })),
                  conditions: { authorizedHold: false, regularPayer: true },
                  startMonth: projectConfig.startMonth, signatureMonth: projectConfig.signatureMonth,
                  escrituraMonth: projectConfig.escrituraMonth, status: 'Activo',
                  specialObservations: extracted.specialObservations || '',
                  reminders: [], alternateContact: { name: '', phoneCode: '+593', phone: '' },
                  documents: [], showQuotas: false, agentName: '',
                  commissionType: 'porcentaje', commissionValue: 0, commissionTriggerPercent: 30,
                  tradeInValue: 0, entersRaffle: false, lateFees: 0, refundAmount: 0,
                };
                if (extracted.owners?.length > 0) {
                  existing.owners = extracted.owners.map((o: any) => ({ id: crypto.randomUUID(), name: o.name || '', documentId: o.documentId || '', email: o.email || '', phoneCode: '+593', phone: o.phone || '' }));
                  existing.clientName = existing.owners.map((o: any) => o.name).join(' y ');
                }
              } else {
                if (extracted.owners?.length > 0) {
                  existing.owners = extracted.owners.map((o: any) => ({ id: crypto.randomUUID(), name: o.name || '', documentId: o.documentId || '', email: o.email || '', phoneCode: '+593', phone: o.phone || '' }));
                  existing.clientName = existing.owners.map((o: any) => o.name).join(' y ');
                }
                if (extracted.totalPrice) existing.totalPrice = Number(extracted.totalPrice);
                if (extracted.expectedQuota >= 0) existing.expectedQuota = Number(extracted.expectedQuota);
              }
              lotsMap.set(normId || lId, existing);
            }
          }
        }
      } catch (err) {
        addLog('Error analizando documentos');
      }
    }

    setIsProcessing(false);
    return Array.from(lotsMap.values());
  }, [getPaymentMonths, addLog, projectConfig]);

  return {
    isProcessing, progress, logs, addLog, clearLogs,
    processSingleLot, processMassiveUpload,
  };
}
