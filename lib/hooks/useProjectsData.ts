import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Project } from './useProjects';

export type ProjectLot = {
  id: string;
  project_id: string;
  lot_number: string;
  lot_area: number;
  client_name: string;
  owners: Array<{
    id: string;
    name: string;
    documentId: string;
    email: string;
    phoneCode: string;
    phone: string;
  }>;
  total_price: number;
  expected_quota: number;
  initial_payments: Array<{
    id: string;
    description: string;
    expected: number;
    actual: number;
    paymentDate: string;
    receiptAttached: string | null;
  }>;
  payments: Array<{
    id: number;
    month: string;
    expected: number;
    actual: number;
    receiptAttached: string | null;
    paymentDate: string;
  }>;
  conditions: {
    authorizedHold: boolean;
    regularPayer: boolean;
  };
  start_month: string;
  signature_month: string;
  escritura_month: string;
  status: string;
  special_observations: string;
  reminders: Array<{
    id: string;
    text: string;
    date: string;
  }>;
  documents: Array<{
    name: string;
    type: string;
  }>;
  alternate_contact: {
    name: string;
    phoneCode: string;
    phone: string;
  };
  created_at: string;
  updated_at: string;
};

export function useProjectsData() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [lots, setLots] = useState<Record<string, ProjectLot[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('name');

      if (projectsError) throw projectsError;
      setProjects(projectsData || []);

      const lotsMap: Record<string, ProjectLot[]> = {};
      for (const project of projectsData || []) {
        const { data: lotsData } = await supabase
          .from('project_lots')
          .select('*')
          .eq('project_id', project.id)
          .order('lot_number');
        
        lotsMap[project.id] = lotsData || [];
      }
      setLots(lotsMap);
      setError(null);
    } catch (e) {
      console.error('Error loading projects data:', e);
      setError(e instanceof Error ? e.message : 'Error loading data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const createLot = async (projectId: string, lot: Partial<ProjectLot>) => {
    try {
      const { data, error: insertError } = await supabase
        .from('project_lots')
        .insert([{ ...lot, project_id: projectId }])
        .select()
        .single();

      if (insertError) throw insertError;
      setLots(prev => ({
        ...prev,
        [projectId]: [...(prev[projectId] || []), data]
      }));
      return data;
    } catch (e) {
      console.error('Error creating lot:', e);
      throw e;
    }
  };

  const updateLot = async (lotId: string, projectId: string, updates: Partial<ProjectLot>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('project_lots')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', lotId)
        .select()
        .single();

      if (updateError) throw updateError;
      setLots(prev => ({
        ...prev,
        [projectId]: prev[projectId]?.map(l => l.id === lotId ? data : l) || []
      }));
      return data;
    } catch (e) {
      console.error('Error updating lot:', e);
      throw e;
    }
  };

  const deleteLot = async (lotId: string, projectId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('project_lots')
        .delete()
        .eq('id', lotId);

      if (deleteError) throw deleteError;
      setLots(prev => ({
        ...prev,
        [projectId]: prev[projectId]?.filter(l => l.id !== lotId) || []
      }));
    } catch (e) {
      console.error('Error deleting lot:', e);
      throw e;
    }
  };

  return {
    projects,
    lots,
    isLoading,
    error,
    loadData,
    createLot,
    updateLot,
    deleteLot,
  };
}