"use client";

import { supabase } from '@/lib/supabaseClient';

const LOTS_KEY_PREFIX = 'inmo_proj_lots_';
const CONFIG_KEY_PREFIX = 'inmo_proj_config_meta_';
const CONFIG_IMG_PREFIX = 'inmo_proj_config_img_';
const PROJECT_LIST_KEY = 'inmo_project_list';
const ACTIVE_PROJECT_KEY = 'inmo_active_project';

class CachedSupabaseStorage {
  private cache: Map<string, string> = new Map();
  private listeners: Set<(key: string) => void> = new Set();
  private initialized: boolean = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initPromise = this.initialize();
    }
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      console.log('[CachedSupabaseStorage] Starting initialization...');
      
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('name');

      if (projectsError) {
        console.error('[CachedSupabaseStorage] Error loading projects:', projectsError);
        this.initialized = true;
        return;
      }

      if (projectsData && projectsData.length > 0) {
        const projectList = projectsData.map((p: any) => ({
          id: p.id,
          name: p.name,
          status: p.status,
          start_date: p.start_date,
          end_date: p.end_date,
        }));
        
        this.cache.set(PROJECT_LIST_KEY, JSON.stringify(projectList));
        this.cache.set(ACTIVE_PROJECT_KEY, projectsData[0].id);
        
        for (const project of projectsData) {
          const { data: lotsData } = await supabase
            .from('project_lots')
            .select('*')
            .eq('project_id', project.id)
            .order('lot_number');

          const lotsKey = `${LOTS_KEY_PREFIX}${project.id}`;
          const transformedLots = this.transformLotsToOldFormat(lotsData || []);
          this.cache.set(lotsKey, JSON.stringify(transformedLots));
          
          const configKey = `${CONFIG_KEY_PREFIX}${project.id}`;
          const config = {
            startMonth: project.start_date ? this.formatDateToMonth(project.start_date) : '2025-04',
            signatureMonth: project.signature_month ? this.formatDateToMonth(project.signature_month) : '2026-04',
            escrituraMonth: project.escritura_month ? this.formatDateToMonth(project.escritura_month) : '2027-01',
            lotPins: [],
          };
          this.cache.set(configKey, JSON.stringify(config));
          
          if (project.logo_url) {
            const imgKey = `${CONFIG_IMG_PREFIX}${project.id}`;
            this.cache.set(imgKey, project.logo_url);
          }
        }
        
        console.log('[CachedSupabaseStorage] Initialized with', projectsData.length, 'projects');
      } else {
        this.cache.set(PROJECT_LIST_KEY, JSON.stringify([{ id: 'proj_default', name: 'Mi Primer Proyecto' }]));
        this.cache.set(ACTIVE_PROJECT_KEY, 'proj_default');
        console.log('[CachedSupabaseStorage] No projects found, using default');
      }
      
      this.initialized = true;
    } catch (error) {
      console.error('[CachedSupabaseStorage] Initialization error:', error);
      this.cache.set(PROJECT_LIST_KEY, JSON.stringify([{ id: 'proj_default', name: 'Mi Primer Proyecto' }]));
      this.cache.set(ACTIVE_PROJECT_KEY, 'proj_default');
      this.initialized = true;
    }
  }

  private formatDateToMonth(dateStr: string): string {
    if (!dateStr) return '2025-04';
    return dateStr.substring(0, 7);
  }

  private transformLotsToOldFormat(lots: any[]): any[] {
    return lots.map(lot => ({
      id: lot.id,
      loteNumber: lot.lot_number,
      lotArea: lot.lot_area || 0,
      clientName: lot.client_name || 'No especificado',
      owners: Array.isArray(lot.owners) ? lot.owners.map((o: any) => ({
        id: o.id || crypto.randomUUID(),
        name: o.name || '',
        documentId: o.documentId || o.document_id || '',
        email: o.email || '',
        phoneCode: o.phoneCode || o.phone_code || '+593',
        phone: o.phone || '',
      })) : [],
      totalPrice: lot.total_price || 0,
      expectedQuota: lot.expected_quota || 0,
      initialPayments: Array.isArray(lot.initial_payments) ? lot.initial_payments.map((ip: any) => ({
        id: ip.id || crypto.randomUUID(),
        description: ip.description || 'Entrada Inicial',
        expected: ip.expected || 0,
        actual: ip.actual || 0,
        paymentDate: ip.paymentDate || ip.payment_date || '',
        receiptAttached: ip.receiptAttached || ip.receipt_attached || null,
      })) : [{
        id: crypto.randomUUID(),
        description: 'Entrada Inicial',
        expected: lot.initial_payment_expected || 0,
        actual: lot.initial_payment_paid || 0,
        paymentDate: '',
        receiptAttached: null,
      }],
      payments: Array.isArray(lot.payments) ? lot.payments.map((p: any) => ({
        id: p.id || 0,
        month: p.month || '',
        expected: p.expected || 0,
        actual: p.actual || 0,
        receiptAttached: p.receiptAttached || p.receipt_attached || null,
        paymentDate: p.paymentDate || p.payment_date || '',
      })) : [],
      documents: Array.isArray(lot.documents) ? lot.documents : [],
      reminders: Array.isArray(lot.reminders) ? lot.reminders : [],
      alternateContact: lot.alternateContact || lot.alternate_contact || { name: '', phoneCode: '+593', phone: '' },
      conditions: lot.conditions || { authorizedHold: false, regularPayer: true },
      startMonth: lot.start_month || '2025-04',
      signatureMonth: lot.signature_month || '2026-04',
      escrituraMonth: lot.escritura_month || '2027-01',
      specialObservations: lot.special_observations || '',
      tradeInValue: lot.trade_in_value || 0,
      agentId: lot.agent_id || null,
      agentName: lot.agent_name || '',
      status: lot.status || 'Disponible',
      entersRaffle: lot.enters_raffle || false,
      lateFees: lot.late_fees || 0,
      refundAmount: lot.refund_amount || 0,
      showQuotas: lot.showQuotas || false,
      commissionType: lot.commissionType || 'percentage',
      commissionValue: lot.commissionValue || 0,
      commissionTriggerPercent: lot.commissionTriggerPercent || 30,
    }));
  }

  async waitForInit(): Promise<void> {
    if (this.initialized) return;
    if (this.initPromise) await this.initPromise;
  }

  getItem(key: string): string | null {
    return this.cache.get(key) || null;
  }

  setItem(key: string, value: string): void {
    this.cache.set(key, value);
    this.notifyListeners(key);
    this.syncToSupabase(key, value);
  }

  removeItem(key: string): void {
    this.cache.delete(key);
    this.notifyListeners(key);
  }

  private notifyListeners(key: string): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new StorageEvent('storage', { key }));
    }
  }

  private syncToSupabase(key: string, value: string): void {
    setTimeout(() => {
      this.performSync(key, value);
    }, 0);
  }

  private async performSync(key: string, value: string): Promise<void> {
    try {
      if (key === PROJECT_LIST_KEY) {
        await this.syncProjects(value);
      } else if (key.startsWith(LOTS_KEY_PREFIX)) {
        const projectId = key.replace(LOTS_KEY_PREFIX, '');
        await this.syncLots(projectId, value);
      } else if (key.startsWith(CONFIG_KEY_PREFIX)) {
        const projectId = key.replace(CONFIG_KEY_PREFIX, '');
        await this.syncConfig(projectId, value);
      } else if (key.startsWith(CONFIG_IMG_PREFIX)) {
        const projectId = key.replace(CONFIG_IMG_PREFIX, '');
        await this.syncImage(projectId, value);
      } else if (key === ACTIVE_PROJECT_KEY) {
        // Active project tracking - no supabase sync needed
      }
    } catch (error) {
      console.error('[CachedSupabaseStorage] Sync error for key', key, ':', error);
    }
  }

  private async syncProjects(value: string): Promise<void> {
    const projects = JSON.parse(value);
    
    for (const project of projects) {
      const { data: existing } = await supabase
        .from('projects')
        .select('id')
        .eq('id', project.id)
        .single();

      if (!existing) {
        await supabase.from('projects').insert([{
          id: project.id,
          name: project.name,
          status: project.status || 'EN PLANOS',
          start_date: project.start_date || new Date().toISOString().split('T')[0],
          is_active: true,
          primary_color: '#be0b3c',
        }]);
      } else {
        await supabase.from('projects').update({
          name: project.name,
          status: project.status,
        }).eq('id', project.id);
      }
    }
  }

  private async syncLots(projectId: string, value: string): Promise<void> {
    const lots = JSON.parse(value);
    
    for (const lot of lots) {
      const dbLot = this.transformLotToDbFormat(lot, projectId);
      
      const { data: existing } = await supabase
        .from('project_lots')
        .select('id')
        .eq('id', lot.id)
        .single();

      if (!existing) {
        const { error } = await supabase.from('project_lots').insert([{
          ...dbLot,
          id: lot.id || crypto.randomUUID(),
        }]);
        if (error) console.warn('Error inserting lot:', error.message);
      } else {
        const { error } = await supabase.from('project_lots').update(dbLot).eq('id', lot.id);
        if (error) console.warn('Error updating lot:', error.message);
      }
    }
  }

  private transformLotToDbFormat(lot: any, projectId: string): any {
    return {
      project_id: projectId,
      lot_number: lot.loteNumber || lot.lotNumber,
      lot_area: lot.lotArea || lot.lot_area || 0,
      client_name: lot.clientName || lot.client_name || 'No especificado',
      owners: (lot.owners || []).map((o: any) => ({
        id: o.id || crypto.randomUUID(),
        name: o.name || '',
        documentId: o.documentId || o.document_id || '',
        email: o.email || '',
        phoneCode: o.phoneCode || o.phone_code || '+593',
        phone: o.phone || '',
      })),
      total_price: lot.totalPrice || lot.total_price || 0,
      expected_quota: lot.expectedQuota || lot.expected_quota || 0,
      initial_payment_expected: lot.initialPayments?.[0]?.expected || lot.initial_payment_expected || 0,
      initial_payment_paid: lot.initialPayments?.[0]?.actual || lot.initial_payment_paid || 0,
      initial_payments: (lot.initialPayments || []).map((ip: any) => ({
        id: ip.id || crypto.randomUUID(),
        description: ip.description || 'Entrada Inicial',
        expected: ip.expected || 0,
        actual: ip.actual || 0,
        paymentDate: ip.paymentDate || ip.payment_date || '',
        receiptAttached: ip.receiptAttached || ip.receipt_attached || null,
      })),
      payments: (lot.payments || []).map((p: any) => ({
        id: p.id || 0,
        month: p.month || '',
        expected: p.expected || 0,
        actual: p.actual || 0,
        receiptAttached: p.receiptAttached || p.receipt_attached || null,
        paymentDate: p.paymentDate || p.payment_date || '',
      })),
      documents: lot.documents || [],
      reminders: lot.reminders || [],
      alternate_contact: lot.alternateContact || lot.alternate_contact || { name: '', phone_code: '+593', phone: '' },
      conditions: lot.conditions || { authorizedHold: false, regularPayer: true },
      start_month: lot.startMonth || lot.start_month || '2025-04',
      signature_month: lot.signatureMonth || lot.signature_month || '2026-04',
      escritura_month: lot.escrituraMonth || lot.escritura_month || '2027-01',
      special_observations: lot.specialObservations || lot.special_observations || '',
      trade_in_value: lot.tradeInValue || lot.trade_in_value || 0,
      agent_id: lot.agentId || lot.agent_id || null,
      agent_name: lot.agentName || lot.agent_name || '',
      status: lot.status || 'Disponible',
      enters_raffle: lot.entersRaffle || lot.enters_raffle || false,
      late_fees: lot.lateFees || lot.late_fees || 0,
      refund_amount: lot.refundAmount || lot.refund_amount || 0,
      showQuotas: lot.showQuotas || false,
      commissionType: lot.commissionType || 'percentage',
      commissionValue: lot.commissionValue || 0,
      commissionTriggerPercent: lot.commissionTriggerPercent || 30,
    };
  }

  private async syncConfig(projectId: string, value: string): Promise<void> {
    const config = JSON.parse(value);
    
    await supabase.from('projects').update({
      start_date: config.startMonth ? `${config.startMonth}-01` : null,
      signature_month: config.signatureMonth ? `${config.signatureMonth}-01` : null,
      escritura_month: config.escrituraMonth ? `${config.escrituraMonth}-01` : null,
    }).eq('id', projectId);
  }

  private async syncImage(projectId: string, value: string): Promise<void> {
    await supabase.from('projects').update({
      logo_url: value,
    }).eq('id', projectId);
  }

  isReady(): boolean {
    return this.initialized;
  }

  async ensureInitialized(): Promise<void> {
    await this.waitForInit();
  }

  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }
}

let cachedStorageInstance: CachedSupabaseStorage | null = null;

export function getCachedSupabaseStorage(): CachedSupabaseStorage {
  if (!cachedStorageInstance) {
    cachedStorageInstance = new CachedSupabaseStorage();
  }
  return cachedStorageInstance;
}

export function createLocalStorageProxy(): typeof localStorage {
  const storage = getCachedSupabaseStorage();
  
  return {
    getItem: (key: string) => storage.getItem(key),
    setItem: (key: string, value: string) => storage.setItem(key, value),
    removeItem: (key: string) => storage.removeItem(key),
    key: (index: number) => {
      const keys = storage.getKeys();
      return keys[index] || null;
    },
    get length() {
      return storage.getKeys().length;
    },
    clear: () => {
      storage.getKeys().forEach(key => storage.removeItem(key));
    },
  } as typeof localStorage;
}
