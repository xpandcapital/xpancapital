import { CountryCode, Owner, AlternateContact, InitialPayment, Reminder, Lote } from '../_types';
import { PAISES_TELEFONO } from '@/lib/paises';

export const COUNTRY_CODES: CountryCode[] = PAISES_TELEFONO.map(p => ({
  code: p.code,
  flag: p.flag,
  name: p.pais,
}));

export const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export const DEFAULT_OWNER: Owner = {
  id: '',
  name: 'No especificado',
  documentId: '',
  email: '',
  phoneCode: '+593',
  phone: '',
};

export const DEFAULT_ALT_CONTACT: AlternateContact = {
  name: '',
  phoneCode: '+593',
  phone: '',
};

export const DEFAULT_INITIAL_PAYMENT: InitialPayment = {
  id: '',
  description: 'Entrada Inicial',
  expected: 0,
  actual: 0,
  paymentDate: '',
  receiptAttached: null,
};

export const DEFAULT_REMINDER: Reminder = {
  id: '',
  text: '',
  completed: false,
};

export function createDefaultLote(loteNumber: string, startMonth: string, signatureMonth: string, escrituraMonth: string, expectedQuota: number = 0): Lote {
  return {
    id: crypto.randomUUID(),
    loteNumber,
    lotArea: 0,
    clientName: 'No especificado',
    owners: [{ ...DEFAULT_OWNER, id: crypto.randomUUID(), name: 'No especificado' }],
    totalPrice: 0,
    expectedQuota,
    initialPayments: [{ ...DEFAULT_INITIAL_PAYMENT, id: crypto.randomUUID() }],
    payments: [],
    conditions: { authorizedHold: false, regularPayer: true },
    startMonth,
    signatureMonth,
    escrituraMonth,
    status: 'Activo',
    specialObservations: '',
    reminders: [],
    alternateContact: { ...DEFAULT_ALT_CONTACT },
    documents: [],
    showQuotas: false,
    agentName: '',
    commissionType: 'porcentaje',
    commissionValue: 0,
    commissionTriggerPercent: 30,
    tradeInValue: 0,
    entersRaffle: false,
    lateFees: 0,
    refundAmount: 0,
  };
}

export function normalizeLotNumber(num: string | undefined): string {
  if (!num) return '';
  const str = num.toString().toUpperCase().trim();
  const match = str.match(/(\d+)/);
  if (match) {
    return `LOTE${match[1].padStart(2, '0')}`;
  }
  return str.replace(/[^A-Z0-9]/g, '');
}
