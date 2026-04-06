"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';

export type Owner = {
  id: string;
  name: string;
  documentId: string;
  email: string;
  phoneCode: string;
  phone: string;
};

export type InitialPayment = {
  id: string;
  description: string;
  expected: number;
  actual: number;
  paymentDate: string;
  receiptAttached: string | null;
};

export type Payment = {
  id: number;
  month: string;
  expected: number;
  actual: number;
  receiptAttached: string | null;
  paymentDate: string;
};

export type Reminder = {
  id: string;
  text: string;
  date: string;
  completed: boolean;
};

export type Conditions = {
  authorizedHold: boolean;
  regularPayer: boolean;
};

export type AlternateContact = {
  name: string;
  phone: string;
  phone_code: string;
};

export type Lot = {
  id: string;
  project_id: string;
  lot_number: string;
  lot_area: number;
  owners: Owner[];
  client_name: string;
  total_price: number;
  expected_quota: number;
  initial_payment_expected: number;
  initial_payment_paid: number;
  start_month: string;
  signature_month: string;
  escritura_month: string;
  conditions: Conditions;
  initial_payments: InitialPayment[];
  payments: Payment[];
  documents: Array<{ name: string; type: string }>;
  reminders: Reminder[];
  special_observations: string;
  trade_in_value: number;
  agent_id: string | null;
  status: string;
  enters_raffle: boolean;
  late_fees: number;
  refund_amount: number;
  alternate_contact: AlternateContact;
  showQuotas: boolean;
  agentName: string;
  commissionType: string;
  commissionValue: number;
  commissionTriggerPercent: number;
  created_at: string;
  updated_at: string;
};

export type ProjectConfig = {
  startMonth: string;
  signatureMonth: string;
  escrituraMonth: string;
  masterplanImage: string | null;
  lotPins: Array<{ id: string; x: number; y: number; lotId: string }>;
};

export type Project = {
  id: string;
  name: string;
  status: string;
  website: string | null;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string | null;
  signature_month: string | null;
  escritura_month: string | null;
  is_active: boolean;
  config: ProjectConfig;
  lots: Lot[];
  created_at: string;
  updated_at: string;
};

type ProjectContextType = {
  projects: Project[];
  activeProject: Project | null;
  activeProjectId: string | null;
  isLoading: boolean;
  error: string | null;
  setActiveProjectId: (id: string | null) => void;
  createProject: (name: string) => Promise<Project | null>;
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  createLot: (lot: Omit<Lot, 'id' | 'created_at' | 'updated_at'>) => Promise<Lot | null>;
  updateLot: (lotId: string, updates: Partial<Lot>) => Promise<void>;
  deleteLot: (lotId: string) => Promise<void>;
  refreshProjects: () => Promise<void>;
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function useProjectContext() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjectContext must be used within ProjectProvider');
  }
  return context;
}

function generateUUID() {
  return crypto.randomUUID();
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activeProject = projects.find(p => p.id === activeProjectId) || null;

  const mapDbProjectToProject = useCallback((dbProject: any): Project => {
    return {
      ...dbProject,
      config: {
        startMonth: dbProject.config?.startMonth || '2025-04',
        signatureMonth: dbProject.config?.signatureMonth || '2026-04',
        escrituraMonth: dbProject.config?.escrituraMonth || '2027-01',
        masterplanImage: dbProject.config?.masterplanImage || null,
        lotPins: dbProject.config?.lotPins || [],
      },
      lots: (dbProject.lots || []).map((lot: any) => ({
        ...lot,
        owners: Array.isArray(lot.owners) ? lot.owners : [],
        conditions: typeof lot.conditions === 'object' ? lot.conditions : { authorizedHold: false, regularPayer: true },
        initial_payments: Array.isArray(lot.initial_payments) ? lot.initial_payments : [],
        payments: Array.isArray(lot.payments) ? lot.payments : [],
        documents: Array.isArray(lot.documents) ? lot.documents : [],
        reminders: Array.isArray(lot.reminders) ? lot.reminders : [],
        alternate_contact: typeof lot.alternate_contact === 'object' ? lot.alternate_contact : { name: '', phone: '', phone_code: '+593' },
        showQuotas: lot.showQuotas || false,
        agentName: lot.agentName || '',
        commissionType: lot.commissionType || 'percentage',
        commissionValue: lot.commissionValue || 0,
        commissionTriggerPercent: lot.commissionTriggerPercent || 30,
      })),
    };
  }, []);

  const loadProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('name');

      if (projectsError) throw projectsError;

      const loadedProjects: Project[] = [];

      for (const dbProject of projectsData || []) {
        const { data: lotsData, error: lotsError } = await supabase
          .from('project_lots')
          .select('*')
          .eq('project_id', dbProject.id)
          .order('lot_number');

        if (lotsError) throw lotsError;

        loadedProjects.push(mapDbProjectToProject({
          ...dbProject,
          lots: lotsData || [],
        }));
      }

      setProjects(loadedProjects);

      if (loadedProjects.length > 0 && !activeProjectId) {
        setActiveProjectId(loadedProjects[0].id);
      }
    } catch (e) {
      console.error('Error loading projects:', e);
      setError(e instanceof Error ? e.message : 'Error loading projects');
    } finally {
      setIsLoading(false);
    }
  }, [activeProjectId, mapDbProjectToProject]);

  useEffect(() => {
    loadProjects();
  }, []);

  const createProject = async (name: string): Promise<Project | null> => {
    try {
      const newProjectId = generateUUID();
      const newProject = {
        id: newProjectId,
        name,
        status: 'EN PLANOS',
        website: null,
        location: null,
        start_date: new Date().toISOString().split('T')[0],
        end_date: null,
        logo_url: null,
        primary_color: '#be0b3c',
        secondary_color: null,
        signature_month: '2026-04',
        escritura_month: '2027-01',
        is_active: true,
        config: {
          startMonth: '2025-04',
          signatureMonth: '2026-04',
          escrituraMonth: '2027-01',
          masterplanImage: null,
          lotPins: [],
        },
      };

      const { data, error } = await supabase
        .from('projects')
        .insert([newProject])
        .select()
        .single();

      if (error) throw error;

      const project: Project = {
        ...mapDbProjectToProject(data),
        lots: [],
      };

      setProjects(prev => [...prev, project]);
      return project;
    } catch (e) {
      console.error('Error creating project:', e);
      return null;
    }
  };

  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    try {
      const dbUpdates: any = { ...updates };
      delete dbUpdates.lots;
      delete dbUpdates.config;

      if (updates.config) {
        dbUpdates.signature_month = updates.config.signatureMonth;
        dbUpdates.escritura_month = updates.config.escrituraMonth;
      }

      const { data, error } = await supabase
        .from('projects')
        .update(dbUpdates)
        .eq('id', projectId)
        .select()
        .single();

      if (error) throw error;

      setProjects(prev => prev.map(p => 
        p.id === projectId ? mapDbProjectToProject({ ...p, ...data, lots: p.lots }) : p
      ));
    } catch (e) {
      console.error('Error updating project:', e);
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      setProjects(prev => prev.filter(p => p.id !== projectId));
      
      if (activeProjectId === projectId) {
        const remaining = projects.filter(p => p.id !== projectId);
        setActiveProjectId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (e) {
      console.error('Error deleting project:', e);
    }
  };

  const createLot = async (lotData: Omit<Lot, 'id' | 'created_at' | 'updated_at'>): Promise<Lot | null> => {
    try {
      if (!activeProjectId) return null;

      const dbLot = {
        ...lotData,
        project_id: activeProjectId,
      };

      const { data, error } = await supabase
        .from('project_lots')
        .insert([dbLot])
        .select()
        .single();

      if (error) throw error;

      const newLot: Lot = {
        ...data,
        owners: Array.isArray(data.owners) ? data.owners : [],
        conditions: typeof data.conditions === 'object' ? data.conditions : { authorizedHold: false, regularPayer: true },
        initial_payments: Array.isArray(data.initial_payments) ? data.initial_payments : [],
        payments: Array.isArray(data.payments) ? data.payments : [],
        documents: Array.isArray(data.documents) ? data.documents : [],
        reminders: Array.isArray(data.reminders) ? data.reminders : [],
        alternate_contact: typeof data.alternate_contact === 'object' ? data.alternate_contact : { name: '', phone: '', phone_code: '+593' },
        showQuotas: data.showQuotas || false,
        agentName: data.agentName || '',
        commissionType: data.commissionType || 'percentage',
        commissionValue: data.commissionValue || 0,
        commissionTriggerPercent: data.commissionTriggerPercent || 30,
      };

      setProjects(prev => prev.map(p => 
        p.id === activeProjectId ? { ...p, lots: [...p.lots, newLot] } : p
      ));

      return newLot;
    } catch (e) {
      console.error('Error creating lot:', e);
      return null;
    }
  };

  const updateLot = async (lotId: string, updates: Partial<Lot>) => {
    try {
      const dbUpdates = { ...updates };

      setProjects(prev => prev.map(p => ({
        ...p,
        lots: p.lots.map(lot => 
          lot.id === lotId ? { ...lot, ...dbUpdates } : lot
        ),
      })));

      const { data, error } = await supabase
        .from('project_lots')
        .update(dbUpdates)
        .eq('id', lotId)
        .select()
        .single();

      if (error) {
        console.warn('Supabase update failed, keeping local state:', error.message);
      }
    } catch (e) {
      console.error('Error updating lot:', e);
    }
  };

  const deleteLot = async (lotId: string) => {
    try {
      const { error } = await supabase
        .from('project_lots')
        .delete()
        .eq('id', lotId);

      if (error) throw error;

      setProjects(prev => prev.map(p => ({
        ...p,
        lots: p.lots.filter(lot => lot.id !== lotId),
      })));
    } catch (e) {
      console.error('Error deleting lot:', e);
    }
  };

  const value: ProjectContextType = {
    projects,
    activeProject,
    activeProjectId,
    isLoading,
    error,
    setActiveProjectId,
    createProject,
    updateProject,
    deleteProject,
    createLot,
    updateLot,
    deleteLot,
    refreshProjects: loadProjects,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}
