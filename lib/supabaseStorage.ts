"use client";

import { supabase } from '@/lib/supabaseClient';

const PROJECTS_KEY = 'inmo_project_list';
const ACTIVE_PROJECT_KEY = 'inmo_active_project';
const LOTS_KEY_PREFIX = 'inmo_proj_lots_';
const CONFIG_KEY_PREFIX = 'inmo_proj_config_meta_';
const CONFIG_IMG_PREFIX = 'inmo_proj_config_img_';

class SupabaseStorage {
  private cache: Map<string, any> = new Map();
  private listeners: Set<(key: string) => void> = new Set();
  private initialized: boolean = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initPromise = this.initialize();
    }
  }

  private async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .order('name');

      if (projectsData && projectsData.length > 0) {
        const projectList = projectsData.map((p: any) => ({
          id: p.id,
          name: p.name,
          status: p.status,
          start_date: p.start_date,
          end_date: p.end_date,
        }));
        
        this.cache.set(PROJECTS_KEY, JSON.stringify(projectList));
        
        const activeProjectId = projectsData[0]?.id;
        if (activeProjectId) {
          this.cache.set(ACTIVE_PROJECT_KEY, activeProjectId);
          
          for (const project of projectsData) {
            const { data: lotsData } = await supabase
              .from('project_lots')
              .select('*')
              .eq('project_id', project.id)
              .order('lot_number');

            const lotsKey = `${LOTS_KEY_PREFIX}${project.id}`;
            const lots = lotsData || [];
            
            this.cache.set(lotsKey, JSON.stringify(this.transformLotsToOldFormat(lots)));
            
            const configKey = `${CONFIG_KEY_PREFIX}${project.id}`;
            const config = {
              startMonth: project.start_date ? project.start_date.substring(0, 7) : '2025-04',
              signatureMonth: project.signature_month ? project.signature_month.substring(0, 7) : '2026-04',
              escrituraMonth: project.escritura_month ? project.escritura_month.substring(0, 7) : '2027-01',
              lotPins: [],
            };
            this.cache.set(configKey, JSON.stringify(config));
          }
        }
      }
      
      this.initialized = true;
    } catch (error) {
      console.warn('SupabaseStorage initialization error:', error);
      this.initialized = true;
    }
  }

  private transformLotsToOldFormat(lots: any[]): any[] {
    return lots.map(lot => ({
      id: lot.id,
      loteNumber: lot.lot_number,
      lotArea: lot.lot_area,
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
      })) : [],
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
      alternateContact: typeof lot.alternate_contact === 'object' ? lot.alternate_contact : { name: '', phoneCode: '+593', phone: '' },
      conditions: typeof lot.conditions === 'object' ? lot.conditions : { authorizedHold: false, regularPayer: true },
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

  private async waitForInit(): Promise<void> {
    if (this.initialized) return;
    if (this.initPromise) await this.initPromise;
  }

  private notifyListeners(key: string): void {
    this.listeners.forEach(listener => listener(key));
  }

  async getItem(key: string): Promise<string | null> {
    await this.waitForInit();
    
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    
    return null;
  }

  async setItem(key: string, value: string): Promise<void> {
    await this.waitForInit();
    
    this.cache.set(key, value);
    this.notifyListeners(key);
    
    if (key === PROJECTS_KEY) {
      await this.syncProjectsToSupabase(value);
    } else if (key.startsWith(LOTS_KEY_PREFIX)) {
      const projectId = key.replace(LOTS_KEY_PREFIX, '');
      await this.syncLotsToSupabase(projectId, value);
    } else if (key.startsWith(CONFIG_KEY_PREFIX)) {
      const projectId = key.replace(CONFIG_KEY_PREFIX, '');
      await this.syncConfigToSupabase(projectId, value);
    } else if (key.startsWith(CONFIG_IMG_PREFIX)) {
      const projectId = key.replace(CONFIG_IMG_PREFIX, '');
      await this.syncImageToSupabase(projectId, value);
    }
  }

  private async syncProjectsToSupabase(value: string): Promise<void> {
    try {
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
    } catch (error) {
      console.error('Error syncing projects to Supabase:', error);
    }
  }

  private async syncLotsToSupabase(projectId: string, value: string): Promise<void> {
    try {
      const lots = JSON.parse(value);
      
      for (const lot of lots) {
        const dbLot = {
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
          initial_payments: (lot.initialPayments || lot.initial_payments || []).map((ip: any) => ({
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
          if (error) console.error('Error inserting lot:', error);
        } else {
          const { error } = await supabase.from('project_lots').update(dbLot).eq('id', lot.id);
          if (error) console.error('Error updating lot:', error);
        }
      }
    } catch (error) {
      console.error('Error syncing lots to Supabase:', error);
    }
  }

  private async syncConfigToSupabase(projectId: string, value: string): Promise<void> {
    try {
      const config = JSON.parse(value);
      
      await supabase.from('projects').update({
        start_date: config.startMonth ? `${config.startMonth}-01` : null,
        signature_month: config.signatureMonth ? `${config.signatureMonth}-01` : null,
        escritura_month: config.escrituraMonth ? `${config.escrituraMonth}-01` : null,
      }).eq('id', projectId);
    } catch (error) {
      console.error('Error syncing config to Supabase:', error);
    }
  }

  private async syncImageToSupabase(projectId: string, value: string): Promise<void> {
    try {
      await supabase.from('projects').update({
        logo_url: value,
      }).eq('id', projectId);
    } catch (error) {
      console.error('Error syncing image to Supabase:', error);
    }
  }

  async removeItem(key: string): Promise<void> {
    await this.waitForInit();
    this.cache.delete(key);
    this.notifyListeners(key);
  }

  addListener(callback: (key: string) => void): void {
    this.listeners.add(callback);
  }

  removeListener(callback: (key: string) => void): void {
    this.listeners.delete(callback);
  }

  isReady(): boolean {
    return this.initialized;
  }
}

let supabaseStorageInstance: SupabaseStorage | null = null;

export function getSupabaseStorage(): SupabaseStorage {
  if (!supabaseStorageInstance) {
    supabaseStorageInstance = new SupabaseStorage();
  }
  return supabaseStorageInstance;
}

export function createSupabaseStorageProxy(): typeof localStorage {
  const storage = getSupabaseStorage();
  
  const handler: ProxyHandler<typeof localStorage> = {
    get(_target: any, prop: string | symbol) {
      if (prop === 'getItem') {
        return async (key: string) => await storage.getItem(key);
      }
      if (prop === 'setItem') {
        return async (key: string, value: string) => await storage.setItem(key, value);
      }
      if (prop === 'removeItem') {
        return async (key: string) => await storage.removeItem(key);
      }
      if (prop === 'addEventListener') {
        return (callback: any) => storage.addListener(callback);
      }
      if (prop === 'removeEventListener') {
        return (callback: any) => storage.removeListener(callback);
      }
      return undefined;
    },
  };

  return new Proxy<typeof localStorage>({} as typeof localStorage, handler);
}
