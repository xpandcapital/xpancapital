export interface Project {
  id: string;
  name: string;
  status: string;
  slug?: string;
  logo_url?: string;
}

export interface GestionLotesState {
  isLoading: boolean;
  projects: Project[];
  activeProjectId: string | null;
  projectNotFound: boolean;
}

export interface Owner {
  id: string;
  name: string;
  documentId: string;
  email: string;
  phoneCode: string;
  phone: string;
}

export interface AlternateContact {
  name: string;
  phoneCode: string;
  phone: string;
}

export interface InitialPayment {
  id: string;
  description: string;
  expected: number;
  actual: number;
  paymentDate: string;
  receiptAttached: string | null;
}

export interface Payment {
  id: number;
  month: string;
  expected: number;
  actual: number;
  receiptAttached: string | null;
  paymentDate: string;
}

export interface Document {
  name: string;
  type: string;
}

export interface Reminder {
  id: string;
  text: string;
  completed: boolean;
}

export interface Lote {
  id: string;
  loteNumber: string;
  lotArea: number;
  clientName: string;
  owners: Owner[];
  totalPrice: number;
  expectedQuota: number;
  initialPayments: InitialPayment[];
  payments: Payment[];
  conditions: { authorizedHold: boolean; regularPayer: boolean };
  startMonth: string;
  signatureMonth: string;
  escrituraMonth: string;
  status: string;
  specialObservations: string;
  reminders: Reminder[];
  alternateContact: AlternateContact;
  documents: Document[];
  showQuotas: boolean;
  agentName: string;
  commissionType: string;
  commissionValue: number;
  commissionTriggerPercent: number;
  tradeInValue: number;
  entersRaffle: boolean;
  lateFees: number;
  refundAmount: number;
  generatedMessage?: string;
}

export interface ProjectConfig {
  startMonth: string;
  signatureMonth: string;
  escrituraMonth: string;
  masterplanImage: string | null;
  lotPins: LotPin[];
}

export interface LotPin {
  id: string;
  loteNumber: string;
  x: number;
  y: number;
}

export interface RaffleState {
  status: 'idle' | 'running' | 'finished';
  currentDisplay: string;
  winner: Lote | null;
  audit: Record<string, any> | null;
  duration: number;
}

export interface DashboardStats {
  activeLotsCount: number;
  totalToCollectNow: number;
  totalCollectedSoFar: number;
  totalFutureQuotas: number;
  totalSaldoEscritura: number;
}

export interface ProcessingState {
  current: number;
  total: number;
  status: string;
}

export interface CountryCode {
  code: string;
  flag: string;
  name: string;
}
