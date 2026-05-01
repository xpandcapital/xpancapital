import { Lote, ProjectConfig } from '../_types';
import { getMonthsDifference } from './months';

export function exportToCSV(lots: Lote[], projectConfig: ProjectConfig, projectName: string): void {
  const headers = [
    'Estado', 'Lote', 'Propietarios', 'Identificaciones', 'Contacto Alterno', 'Área m2', 'Asesor', 'Precio Total', 'Total Entrada/Reserva (Pagado)',
    'Cuotas Pagadas (Histórico)', 'Descuentos/Canjes', 'Deuda Iniciales', 'Deuda Cuotas Atrasadas',
    'Intereses Mora', 'TOTAL A COBRAR AHORA',
    'Cuotas Futuras (Total $)', 'Saldo a Escritura', 'Estado Comisión', 'Monto Comisión', 'Monto Devuelto', 'Participa Sorteo', 'Observaciones'
  ];

  const rows = lots.map(lot => {
    const sigMonth = lot.signatureMonth || projectConfig.signatureMonth;
    const escMonth = lot.escrituraMonth || projectConfig.escrituraMonth;
    const lotFutureMonths = Math.max(0, getMonthsDifference(sigMonth, escMonth));

    const ownersNames = lot.owners.map(o => o.name).join(' y ');
    const ownersDocs = lot.owners.map(o => o.documentId).filter(Boolean).join(' / ');
    const altContact = lot.alternateContact?.name ? `${lot.alternateContact.name} (${lot.alternateContact.phone})` : 'Ninguno';

    const totalInitialExpected = lot.initialPayments?.reduce((acc, p) => acc + Number(p.expected), 0) || 0;
    const totalInitialPaid = lot.initialPayments?.reduce((acc, p) => acc + Number(p.actual), 0) || 0;
    const totalQuotasPaid = lot.payments.reduce((acc, p) => acc + Number(p.actual), 0);
    const tradeIn = lot.tradeInValue || 0;
    const lateFees = lot.lateFees || 0;

    let pastDueInitial = 0, pastDueQuotas = 0, totalToPayNow = 0, futureQuotasTotal = 0, saldoEscritura = 0;
    let commissionStatus = 'Desistido', commissionAmount = 0;

    if (lot.status === 'Activo') {
      pastDueInitial = Math.max(0, totalInitialExpected - totalInitialPaid);
      pastDueQuotas = lot.payments.reduce((acc, p) => acc + Math.max(0, p.expected - p.actual), 0);
      totalToPayNow = pastDueInitial + pastDueQuotas + lateFees;
      futureQuotasTotal = lot.payments.reduce((acc, p) => acc + Number(p.expected), 0) > 0 ? lotFutureMonths * lot.expectedQuota : 0;
      saldoEscritura = Math.max(0, lot.totalPrice - totalInitialPaid - totalQuotasPaid - tradeIn - totalToPayNow - futureQuotasTotal);

      const totalPaidSoFar = totalInitialPaid + totalQuotasPaid + tradeIn;
      const paidPercentage = lot.totalPrice > 0 ? (totalPaidSoFar / lot.totalPrice) * 100 : 0;
      const isCommissionReady = paidPercentage >= (lot.commissionTriggerPercent || 30);
      commissionStatus = isCommissionReady ? 'Liberada' : `Pendiente (Falta ${(lot.commissionTriggerPercent - paidPercentage).toFixed(1)}%)`;
      commissionAmount = lot.commissionType === 'porcentaje' ? (lot.totalPrice * ((lot.commissionValue || 0) / 100)) : (lot.commissionValue || 0);
    }

    return [
      lot.status, lot.loteNumber, `"${ownersNames}"`, `"${ownersDocs}"`, `"${altContact}"`, lot.lotArea, `"${lot.agentName}"`, lot.totalPrice, totalInitialPaid,
      totalQuotasPaid, tradeIn, pastDueInitial, pastDueQuotas, lateFees, totalToPayNow,
      futureQuotasTotal, saldoEscritura, commissionStatus, commissionAmount, lot.refundAmount || 0, lot.entersRaffle ? 'SI' : 'NO', `"${lot.specialObservations || ''}"`
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.setAttribute('href', URL.createObjectURL(blob));
  link.setAttribute('download', `Reporte_${projectName.replace(/\s+/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToJSON(lots: Lote[], config: ProjectConfig, projectName: string): void {
  const cleanLots = lots.map(lot => ({
    ...lot,
    documents: lot.documents?.map(doc => ({ name: doc.name, type: doc.type })) || []
  }));
  const dataToExport = { config, lots: cleanLots };
  const dataStr = JSON.stringify(dataToExport, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Backup_${projectName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
}
