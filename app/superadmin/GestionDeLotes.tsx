// @ts-nocheck
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { logger } from '@/lib/utils/logger';
import { aiChat } from '@/lib/ai-client';
import { 
  Upload, FileText, Calculator, AlertCircle, 
  Calendar as CalendarIcon, DollarSign, User, ChevronLeft, Save,
  PauseCircle, PlayCircle, LayoutDashboard, Users, LayoutGrid,
  CheckCircle2, Clock, FileImage, FileCheck, Receipt, FolderOpen, Sparkles,
  Download, FileSpreadsheet, UploadCloud, Settings, Paperclip, CalendarDays,
  Trash2, Eraser, X, PlusCircle, MinusCircle, ChevronDown, ChevronUp, Bell,
  Phone, Mail, CheckSquare, Square, Building, Briefcase, Ruler, Percent,
  CreditCard, UserCheck, Gift, MessageSquare, ShieldAlert, RotateCcw,
  Trophy, Dices, Scale, Ticket, Map as MapIcon, Printer, MessageCircle, Code, List,
  RefreshCw
} from 'lucide-react';

// --- FUNCIONES AUXILIARES ---
const generateMonthList = (start: string, end: string, exclusiveEnd: boolean = false): string[] => {
  const months: string[] = [];
  if (!start || !end) return months;
  let [sYear, sMonth] = start.split('-').map(Number);
  const [eYear, eMonth] = end.split('-').map(Number);
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  
  let currYear = sYear;
  let currMonth = sMonth;
  let safety = 0;
  
  while ((currYear < eYear || (currYear === eYear && currMonth <= eMonth)) && safety < 240) {
    safety++;
    if (exclusiveEnd && currYear === eYear && currMonth === eMonth) break;
    months.push(`${monthNames[currMonth - 1]} ${currYear}`);
    currMonth++;
    if (currMonth > 12) {
      currMonth = 1;
      currYear++;
    }
  }
  return months;
};

const getMonthsDifference = (start: string, end: string): number => {
  if (!start || !end) return 0;
  const [sYear, sMonth] = start.split('-').map(Number);
  const [eYear, eMonth] = end.split('-').map(Number);
  return (eYear * 12 + eMonth) - (sYear * 12 + sMonth);
};

const formatMonthYear = (yyyy_mm: string): string => {
  if (!yyyy_mm) return '';
  const [y, m] = yyyy_mm.split('-');
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return `${monthNames[parseInt(m)-1]} ${y}`;
};

const COUNTRY_CODES = [
  { code: '+593', flag: '­ƒç¬­ƒç¿', name: 'Ecuador' },
  { code: '+1', flag: '­ƒç║­ƒç©', name: 'USA' },
  { code: '+34', flag: '­ƒç¬­ƒç©', name: 'Espa├▒a' },
  { code: '+57', flag: '­ƒç¿­ƒç┤', name: 'Colombia' },
  { code: '+51', flag: '­ƒçÁ­ƒç¬', name: 'Per├║' },
  { code: '+52', flag: '­ƒç▓­ƒç¢', name: 'M├®xico' },
  { code: '+54', flag: '­ƒçª­ƒçÀ', name: 'Argentina' },
  { code: '+56', flag: '­ƒç¿­ƒç▒', name: 'Chile' },
];

const fallbackCopyTextToClipboard = (text: string): void => {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
  } catch (err) {
    logger.error('Error copiando al portapapeles', err);
  }
  document.body.removeChild(textArea);
};

const App = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [view, setView] = useState('dashboard');
  const [showDesistidos, setShowDesistidos] = useState(false); 
  const [dashboardViewMode, setDashboardViewMode] = useState<'table' | 'grid'>('table');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState({ current: 0, total: 0, status: '' });
  const [processingLog, setProcessingLog] = useState([]); // NUEVO: Log de proceso
  const logEndRef = useRef(null);

  const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);
  const [messageTone, setMessageTone] = useState('Administraci├│n'); 
  const [isProcessingSingleLot, setIsProcessingSingleLot] = useState(false);
  
  const [isDragUpload, setIsDragUpload] = useState(false);
  const [isDragSingle, setIsDragSingle] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const [raffleState, setRaffleState] = useState({ status: 'idle', currentDisplay: '', winner: null, audit: null, duration: 10 });

  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; title: string; message: string; type: 'alert' | 'confirm' | 'prompt'; inputValue: string; onConfirm: ((value?: string) => void) | null }>({ isOpen: false, title: '', message: '', type: 'alert', inputValue: '', onConfirm: null });

  const showAlert = (title: string, message: string) => setModalConfig({ isOpen: true, title, message, type: 'alert', inputValue: '', onConfirm: null });
  const showConfirm = (title: string, message: string, onConfirm: () => void) => setModalConfig({ isOpen: true, title, message, type: 'confirm', inputValue: '', onConfirm });
  const showPrompt = (title: string, message: string, defaultVal: string, onConfirm: (value: string) => void) => setModalConfig({ isOpen: true, title, message, type: 'prompt', inputValue: defaultVal, onConfirm });
  const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });

  const preventDefault = (e: React.DragEvent | React.ChangeEvent<HTMLInputElement>) => { e.preventDefault(); e.stopPropagation(); };

  // Initialize states with defaults, load from localStorage after mount
  const [projectList, setProjectList] = useState([{ id: 'proj_default', name: 'Mi Primer Proyecto' }]);
  const [activeProjectId, setActiveProjectId] = useState('proj_default');

  // Cargar proyectos desde Supabase (fuente de verdad)
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const { data: projects } = await supabase
          .from('projects')
          .select('id, name, status')
          .order('name');

        if (projects && projects.length > 0) {
          const list = projects.map(p => ({ id: p.id, name: p.name, status: p.status }));
          setProjectList(list);
          localStorage.setItem('inmo_project_list', JSON.stringify(list));

          // Determinar proyecto activo
          const savedActive = localStorage.getItem('inmo_active_project');
          const validIds = list.map((p: any) => p.id);
          if (savedActive && validIds.includes(savedActive)) {
            setActiveProjectId(savedActive);
          } else {
            setActiveProjectId(list[0].id);
            localStorage.setItem('inmo_active_project', list[0].id);
          }
        } else {
          // Fallback a localStorage si Supabase falla
          const saved = localStorage.getItem('inmo_project_list');
          if (saved) setProjectList(JSON.parse(saved));
          const savedActive = localStorage.getItem('inmo_active_project');
          if (savedActive) setActiveProjectId(savedActive);
        }
      } catch (e) {
        console.warn("Error loading projects from Supabase, using localStorage", e);
        try {
          const saved = localStorage.getItem('inmo_project_list');
          if (saved) setProjectList(JSON.parse(saved));
          const savedActive = localStorage.getItem('inmo_active_project');
          if (savedActive) setActiveProjectId(savedActive);
        } catch {}
      }
      setIsMounted(true);
    };
    loadProjects();
  }, []);

  // Cargar lotes directamente desde Supabase
  const loadLotsFromSupabase = useCallback(async (projectId: string) => {
    if (!projectId) return;
    setIsSyncing(true);
    try {
      const { data, error } = await supabase
        .from('project_lots')
        .select('*')
        .eq('project_id', projectId);
      
      if (error) {
        console.error('[GestionDeLotes] Error loading from Supabase:', error);
        return;
      }
      
      if (data && data.length > 0) {
        const transformedLots = data.map((supabaseLot: any) => ({
          id: supabaseLot.id,
          loteNumber: supabaseLot.lot_number || '',
          lotArea: supabaseLot.lot_area || 0,
          clientName: supabaseLot.client_name || 'No especificado',
          owners: supabaseLot.owners || [{ id: crypto.randomUUID(), name: supabaseLot.client_name || 'No especificado', documentId: '', email: '', phoneCode: '+593', phone: '' }],
          totalPrice: supabaseLot.total_price || 0,
          expectedQuota: supabaseLot.expected_quota || 0,
          initialPayments: supabaseLot.initial_payments || [{ id: crypto.randomUUID(), description: 'Entrada Inicial', expected: 0, actual: 0, paymentDate: '', receiptAttached: null }],
          payments: supabaseLot.payments || [],
          conditions: supabaseLot.conditions || { authorizedHold: false, regularPayer: true },
          startMonth: supabaseLot.start_month || '2025-04',
          signatureMonth: supabaseLot.signature_month || '2026-04',
          escrituraMonth: supabaseLot.escritura_month || '2027-01',
          // Mapear Disponible -> Activo para compatibilidad con Gesti├│n de Lotes
          status: supabaseLot.status === 'Disponible' ? 'Activo' : supabaseLot.status || 'Activo',
          specialObservations: supabaseLot.special_observations || '',
          reminders: supabaseLot.reminders || [],
          alternateContact: supabaseLot.alternate_contact || { name: '', phoneCode: '+593', phone: '' },
          documents: [],
          showQuotas: false,
          agentName: '',
          commissionType: 'percentage',
          commissionValue: 0,
          commissionTriggerPercent: 30,
          tradeInValue: 0,
          entersRaffle: false,
          lateFees: 0,
          refundAmount: 0
        }));
        
        setLots(transformedLots);
        // Actualizar cach├® de localStorage
        try {
          localStorage.setItem(`inmo_proj_lots_${projectId}`, JSON.stringify(transformedLots));
} catch (e) {
      logger.warn('[GestionDeLotes] Error saving to localStorage:', e);
    }
        logger.debug(`[GestionDeLotes] Loaded ${transformedLots.length} lots from Supabase`);
      }
    } catch (err) {
      logger.error('[GestionDeLotes] Error in loadLotsFromSupabase:', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [processingLog]);

  const activeProjectName = useMemo(() => projectList.find(p => p.id === activeProjectId)?.name || 'Proyecto', [projectList, activeProjectId]);

  // Estado global agrupado por Lote
  const [lots, setLots] = useState([]);
  
  const [selectedLotId, setSelectedLotId] = useState(null);

  const [projectConfig, setProjectConfig] = useState({ 
    startMonth: '2025-04', 
    signatureMonth: '2026-04', 
    escrituraMonth: '2027-01',
    masterplanImage: null, 
    lotPins: [] 
  });

  // Cargar datos al cambiar de proyecto
  useEffect(() => {
    if (!activeProjectId) return;
    
    logger.debug('[GestionDeLotes] Active project changed to:', activeProjectId);
    
    try {
      localStorage.setItem('inmo_active_project', activeProjectId);
    } catch(e) {}

    const loadLots = () => {
      try {
        const savedLots = localStorage.getItem(`inmo_proj_lots_${activeProjectId}`);
        if (savedLots) {
          let parsedLots = JSON.parse(savedLots);
          parsedLots = parsedLots.map(l => {
            if (!l.initialPayments) l.initialPayments = [{ id: crypto.randomUUID(), description: 'Entrada Inicial', expected: l.initialPayment || 0, actual: l.initialPayment || 0, paymentDate: '', receiptAttached: null }];
            if (!l.owners) l.owners = [{ id: crypto.randomUUID(), name: l.clientName || 'No especificado', documentId: '', email: '', phoneCode: '+593', phone: '' }];
            l.owners = l.owners.map(o => ({ ...o, documentId: o.documentId || '' }));
            if (!l.alternateContact) l.alternateContact = { name: '', phoneCode: '+593', phone: '' };
            if (!l.reminders) l.reminders = [];
            if (l.showQuotas === undefined) l.showQuotas = false;
            if (l.lotArea === undefined) l.lotArea = 0;
            if (l.agentName === undefined) l.agentName = '';
            if (l.commissionType === undefined) l.commissionType = 'percentage';
            if (l.commissionValue === undefined) l.commissionValue = 0;
            if (l.commissionTriggerPercent === undefined) l.commissionTriggerPercent = 30;
            if (l.tradeInValue === undefined) l.tradeInValue = 0;
            if (l.specialObservations === undefined) l.specialObservations = '';
            if (l.status === undefined) l.status = 'Activo';
            if (l.refundAmount === undefined) l.refundAmount = 0;
            if (l.entersRaffle === undefined) l.entersRaffle = false;
            if (l.lateFees === undefined) l.lateFees = 0;

            // MIGRACI├ôN: Eliminar signaturePaymentExpected y pasarlo a initialPayments si existe
            if (l.signaturePaymentExpected && l.signaturePaymentExpected > 0) {
              l.initialPayments.push({
                 id: crypto.randomUUID(),
                 description: 'Abono Promesa de Compra Venta',
                 expected: l.signaturePaymentExpected,
                 actual: 0,
                 paymentDate: '',
                 receiptAttached: null
              });
              l.signaturePaymentExpected = 0;
            }

            return l;
          });
          setLots(parsedLots);
        } else {
          setLots([]);
        }
      } catch (e) {
        console.warn("Error cargando lotes", e);
      }
    };

    loadLots();

    // Tambi├®n cargar desde Supabase para asegurarnos de tener los datos m├ís recientes
    loadLotsFromSupabase(activeProjectId);

    // Escuchar cambios en localStorage de otras pesta├▒as/p├íginas
    const handleStorageChange = (e) => {
      if (e.key === `inmo_proj_lots_${activeProjectId}` || e.key === 'inmo_data_updated') {
        logger.debug('[GestionDeLotes] Detected external data update, reloading...');
        loadLots();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [activeProjectId]);

  // Seleccionar lote inicial desde URL (pasado via localStorage)
  useEffect(() => {
    const selectLotFromUrl = () => {
      const lotIdToSelect = localStorage.getItem('inmo_select_lot');
      if (lotIdToSelect && lots.length > 0) {
        const lotExists = lots.find(l => l.id === lotIdToSelect);
        if (lotExists) {
          setSelectedLotId(lotIdToSelect);
          setView('detail');
          localStorage.removeItem('inmo_select_lot');
        }
      }
    };
    
    selectLotFromUrl();
  }, [lots]);

  // Efecto separado para sincronizaci├│n con Supabase
  useEffect(() => {
    if (!activeProjectId) return;
    
    // Solo cargar desde Supabase si no hay datos en localStorage
    const savedLots = localStorage.getItem(`inmo_proj_lots_${activeProjectId}`);
    if (!savedLots) {
      loadLotsFromSupabase(activeProjectId);
    }
  }, [activeProjectId, loadLotsFromSupabase]);

  useEffect(() => {
    if (!activeProjectId || lots.length === 0) return; 
    try {
      const cleanLots = lots.map(lot => ({
        ...lot,
        documents: lot.documents?.map(doc => ({ name: doc.name, type: doc.type })) || []
      }));
      localStorage.setItem(`inmo_proj_lots_${activeProjectId}`, JSON.stringify(cleanLots));
    } catch (error) {}
}, [lots, activeProjectId]);

  // Sincronizar lotes con Supabase
  const syncLotsToSupabase = useCallback(async (lotsData) => {
    if (!activeProjectId || !lotsData || lotsData.length === 0) {
      logger.debug('[GestionDeLotes] Skipping sync - activeProjectId:', activeProjectId, 'lotsData:', lotsData?.length);
      return;
    }
    
    logger.debug(`[GestionDeLotes] Syncing ${lotsData.length} lots for project ${activeProjectId}...`);
    
    // Funci├│n para normalizar estados: Activo -> Disponible para sincronizar con Proyectos
    const normalizeStatus = (status) => {
      if (status === 'Activo') return 'Disponible';
      if (status === 'Disponible') return 'Disponible';
      if (status === 'Reservado') return 'Reservado';
      if (status === 'Vendido') return 'Vendido';
      if (status === 'Desistido') return 'Desistido';
      return 'Disponible';
    };
    
    for (const lot of lotsData) {
      try {
        // Funci├│n para convertir "YYYY-MM" a "YYYY-MM-01" para fechas v├ílidas
        const toDate = (val) => {
          if (!val) return null;
          if (typeof val === 'string' && val.match(/^\d{4}-\d{2}$/)) {
            return `${val}-01`;
          }
          return val;
        };

        const statusForSupabase = normalizeStatus(lot.status);
        
        logger.debug('[GestionDeLotes] Syncing lot:', lot.loteNumber, {
          project_id: activeProjectId,
          total_price: lot.totalPrice || 0,
          status: statusForSupabase,
          status_original: lot.status,
          client_name: lot.clientName || 'No especificado'
        });

        const supabaseLot = {
          project_id: activeProjectId,
          lot_number: lot.loteNumber,
          lot_area: lot.lotArea || 0,
          client_name: lot.clientName || 'No especificado',
          owners: lot.owners || [],
          total_price: lot.totalPrice || 0,
          expected_quota: lot.expectedQuota || 0,
          initial_payments: lot.initialPayments || [],
          payments: lot.payments || [],
          conditions: lot.conditions || { authorizedHold: false, regularPayer: true },
          start_month: toDate(lot.startMonth) || '2025-04-01',
          signature_month: toDate(lot.signatureMonth) || '2026-04-01',
          escritura_month: toDate(lot.escrituraMonth) || '2027-01-01',
          status: statusForSupabase,
          special_observations: lot.specialObservations || '',
          reminders: lot.reminders || [],
          alternate_contact: lot.alternateContact || { name: '', phoneCode: '+593', phone: '' },
          documents: lot.documents || [],
          trade_in_value: lot.tradeInValue || 0,
          late_fees: lot.lateFees || 0,
          refund_amount: lot.refundAmount || 0,
          enters_raffle: lot.entersRaffle || false,
          updated_at: new Date().toISOString()
        };

        const { data: existing, error: selectError } = await supabase
          .from('project_lots')
          .select('id, total_price, status')
          .eq('project_id', activeProjectId)
          .eq('lot_number', lot.loteNumber)
          .maybeSingle();

        if (selectError) {
          logger.error('[GestionDeLotes] Error checking existing lot:', lot.loteNumber, selectError);
          continue;
        }

        if (existing) {
          const { error: updateError } = await supabase
            .from('project_lots')
            .update(supabaseLot)
            .eq('id', existing.id);
          
          if (updateError) {
            logger.error('[GestionDeLotes] Error updating lot:', lot.loteNumber, updateError);
          } else {
            logger.debug('[GestionDeLotes] Updated lot:', lot.loteNumber, 'status:', statusForSupabase);
          }
        } else {
          const { error: insertError } = await supabase
            .from('project_lots')
            .insert(supabaseLot);
          
          if (insertError) {
            logger.error('[GestionDeLotes] Error inserting lot:', lot.loteNumber, insertError);
          } else {
            logger.debug('[GestionDeLotes] Inserted lot:', lot.loteNumber, 'status:', statusForSupabase);
          }
        }
      } catch (err) {
        logger.error('[GestionDeLotes] Unexpected error for lot:', lot.loteNumber, err);
      }
    }
    
    logger.debug(`[GestionDeLotes] Finished syncing ${lotsData.length} lots`);
  }, [activeProjectId]);

  const syncTimeoutRef = useRef(null);
  const lastSyncedLotsRef = useRef<string>('');
  
  useEffect(() => {
    if (!activeProjectId || lots.length === 0) return;
    
    const lotsHash = JSON.stringify(lots.map(l => ({
      id: l.id,
      loteNumber: l.loteNumber,
      clientName: l.clientName,
      totalPrice: l.totalPrice,
      status: l.status
    })));
    
    if (lastSyncedLotsRef.current === lotsHash) return;
    
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      logger.debug('[GestionDeLotes] Syncing lots to Supabase...');
      lastSyncedLotsRef.current = lotsHash;
      syncLotsToSupabase(lots);
    }, 2000);
    
    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [lots, activeProjectId, syncLotsToSupabase]);

  useEffect(() => {
    if (!activeProjectId) return;
    try {
      const configMeta = {
          startMonth: projectConfig.startMonth,
          signatureMonth: projectConfig.signatureMonth,
          escrituraMonth: projectConfig.escrituraMonth,
          lotPins: projectConfig.lotPins
      };
      localStorage.setItem(`inmo_proj_config_meta_${activeProjectId}`, JSON.stringify(configMeta));
      
      if (projectConfig.masterplanImage) {
          try {
              localStorage.setItem(`inmo_proj_config_img_${activeProjectId}`, projectConfig.masterplanImage);
          } catch (imgError) {}
      } else {
          localStorage.removeItem(`inmo_proj_config_img_${activeProjectId}`);
      }

    } catch (error) {}
  }, [projectConfig, activeProjectId]);

  useEffect(() => {
    try {
      localStorage.setItem('inmo_project_list', JSON.stringify(projectList));
    } catch (error) {}
  }, [projectList]);

  const createNewProject = (name) => {
    const newId = crypto.randomUUID();
    setProjectList(prev => [...prev, { id: newId, name }]);
    const newConfigMeta = { startMonth: '2025-04', signatureMonth: '2026-04', escrituraMonth: '2027-01', lotPins: [] };
    
    try {
      localStorage.setItem(`inmo_proj_lots_${newId}`, '[]');
      localStorage.setItem(`inmo_proj_config_meta_${newId}`, JSON.stringify(newConfigMeta));
    } catch (error) {}
    
    setActiveProjectId(newId);
    setView('upload');
  };

  const renameProject = () => {
    showPrompt('Renombrar Proyecto', 'Ingresa el nuevo nombre para este proyecto:', activeProjectName, (newName) => {
      if (newName && newName.trim()) {
        setProjectList(prev => prev.map(p => p.id === activeProjectId ? { ...p, name: newName.trim() } : p));
      }
    });
  };

  const deleteCurrentProject = () => {
    if (projectList.length === 1) {
      showAlert('Acci├│n Bloqueada', 'No puedes eliminar tu ├║nico proyecto. Crea uno nuevo primero si deseas borrar este.');
      return;
    }
    showConfirm('Eliminar Proyecto', `┬┐Est├ís seguro de eliminar el proyecto "${activeProjectName}" y TODOS sus lotes asociados?`, () => {
      const newList = projectList.filter(p => p.id !== activeProjectId);
      setProjectList(newList);
      try {
        localStorage.removeItem(`inmo_proj_lots_${activeProjectId}`);
        localStorage.removeItem(`inmo_proj_config_meta_${activeProjectId}`);
        localStorage.removeItem(`inmo_proj_config_img_${activeProjectId}`);
      } catch(e) {}
      setActiveProjectId(newList[0].id);
      setView('dashboard');
    });
  };

  const paymentMonthsGlobal = useMemo(() => generateMonthList(projectConfig.startMonth, projectConfig.signatureMonth, true), [projectConfig]);
  const signatureMonthNameGlobal = useMemo(() => formatMonthYear(projectConfig.signatureMonth), [projectConfig.signatureMonth]);

  const handleConfigChange = (field, value) => {
    const newConfig = { ...projectConfig, [field]: value };
    setProjectConfig(newConfig);
    
    if (field === 'startMonth' || field === 'signatureMonth') {
      setLots(prev => prev.map(lot => {
        const lotStart = projectConfig.startMonth; 
        const lotSig = lot.signatureMonth || newConfig.signatureMonth;
        const newMonthsList = generateMonthList(lotStart, lotSig, true);
        
        const newPayments = newMonthsList.map((m, i) => {
          const existing = lot.payments?.find(p => p.month === m);
          return existing ? { ...existing, id: i } : { id: i, month: m, expected: lot.expectedQuota, actual: 0, receiptAttached: null, paymentDate: '' };
        });
        return { ...lot, payments: newPayments };
      }));
    }
  };

  const exportToJSON = () => {
    const cleanLots = lots.map(lot => ({
      ...lot,
      documents: lot.documents?.map(doc => ({ name: doc.name, type: doc.type })) || []
    }));
    const dataToExport = { config: projectConfig, lots: cleanLots };
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Backup_${activeProjectName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        let migratedLots = [];
        if (importedData.config && importedData.lots) {
          setProjectConfig({
            ...importedData.config,
            lotPins: importedData.config.lotPins || []
          });
          migratedLots = importedData.lots;
        } else {
          migratedLots = importedData; 
        }

        migratedLots = migratedLots.map(l => {
          if (!l.initialPayments) l.initialPayments = [{ id: crypto.randomUUID(), description: 'Entrada Inicial', expected: l.initialPayment || 0, actual: l.initialPayment || 0, paymentDate: '', receiptAttached: null }];
          if (!l.owners) l.owners = [{ id: crypto.randomUUID(), name: l.clientName || 'No especificado', documentId: '', email: '', phoneCode: '+593', phone: '' }];
          l.owners = l.owners.map(o => ({ ...o, documentId: o.documentId || '' }));
          if (!l.alternateContact) l.alternateContact = { name: '', phoneCode: '+593', phone: '' };
          if (!l.reminders) l.reminders = [];
          if (l.showQuotas === undefined) l.showQuotas = false;
          if (l.lotArea === undefined) l.lotArea = 0;
          if (l.agentName === undefined) l.agentName = '';
          if (l.commissionType === undefined) l.commissionType = 'percentage';
          if (l.commissionValue === undefined) l.commissionValue = 0;
          if (l.commissionTriggerPercent === undefined) l.commissionTriggerPercent = 30;
          if (l.tradeInValue === undefined) l.tradeInValue = 0;
          if (l.specialObservations === undefined) l.specialObservations = '';
          if (l.status === undefined) l.status = 'Activo';
          if (l.refundAmount === undefined) l.refundAmount = 0;
          if (l.entersRaffle === undefined) l.entersRaffle = false;
          if (l.lateFees === undefined) l.lateFees = 0;
          return l;
        });

        setLots(migratedLots);
        setView('dashboard');
      } catch (error) {
        showAlert('Error', 'No se pudo leer el archivo. Aseg├║rate de que sea un respaldo v├ílido.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const exportToCSV = () => {
    const headers = [
      'Estado', 'Lote', 'Propietarios', 'Identificaciones', 'Contacto Alterno', '├ürea m2', 'Asesor', 'Precio Total', 'Total Entrada/Reserva (Pagado)', 
      'Cuotas Pagadas (Hist├│rico)', 'Descuentos/Canjes', 'Deuda Iniciales', 'Deuda Cuotas Atrasadas', 
      'Intereses Mora', 'TOTAL A COBRAR AHORA', 
      'Cuotas Futuras (Total $)', 'Saldo a Escritura', 'Estado Comisi├│n', 'Monto Comisi├│n', 'Monto Devuelto', 'Participa Sorteo', 'Observaciones'
    ];

    const rows = sortedLots.map(lot => {
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
        commissionAmount = lot.commissionType === 'percentage' ? (lot.totalPrice * ((lot.commissionValue || 0) / 100)) : (lot.commissionValue || 0);
      }

      return [
        lot.status, lot.loteNumber, `"${ownersNames}"`, `"${ownersDocs}"`, `"${altContact}"`, lot.lotArea, `"${lot.agentName}"`, lot.totalPrice, totalInitialPaid,
        totalQuotasPaid, tradeIn, pastDueInitial, pastDueQuotas, lateFees, totalToPayNow, 
        futureQuotasTotal, saldoEscritura, commissionStatus, commissionAmount, lot.refundAmount || 0, lot.entersRaffle ? 'SI' : 'NO', `"${lot.specialObservations || ''}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", `Reporte_${activeProjectName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- 2. L├ôGICA DE EXTRACCI├ôN CON IA ---
const generateAIPromptText = (validMonths) => {
    return `Eres un analista contable inmobiliario super avanzado. Analiza exhaustivamente estos documentos (promesas de compraventa y recibos).
Cada documento viene precedido por la etiqueta "--- DOCUMENTO: [nombre_del_archivo] ---".
DEBES CLASIFICAR la informaci├│n en CONTRATOS (documentos legales que definen due├▒os, ├íreas y precios) y RECIBOS (comprobantes de pago o transferencias).

Devuelve un JSON estricto con esta estructura:
{
  "contratosEncontrados": [
    {
      "loteNumber": "Identificador del lote (Ej: Lote 01, Lote 02)",
      "lotArea": "├ürea o medidas del lote en m2 (solo n├║mero, 0 si no hay)",
      "owners": [
         {"name": "Nombre completo del COMPRADOR", "documentId": "C├®dula o Pasaporte si aparece", "email": "Correo si aparece", "phone": "Celular si aparece"}
      ],
      "alternateContact": {
         "name": "Si el contrato menciona a un apoderado o persona designada, pon su nombre aqu├¡.",
         "phone": "Tel├®fono del contacto alterno si lo hay"
      },
      "startMonthOverride": "Si el contrato indica explicitamente en qu├® mes empiezan las 'cuotas mensuales' (ej. 'agosto de 2025'), devuelve el mes en formato YYYY-MM (ej. '2025-08'). Si no lo dice claro, devuelve null",
      "totalPrice": "Precio total de venta (solo n├║mero, 0 si no hay)",
      "expectedQuota": "Cuota mensual pactada regular predominante (solo n├║mero, 0 si no hay)",
      "tradeInValue": "Valor de descuentos, bonos, o canjes. 0 si no hay.",
      "specialObservations": "Extrae notas importantes o inusuales como: 'Sorteo de veh├¡culo', 'Pago con comisiones de asesor', 'Penalidades especiales', 'Letras de cambio', renegociaciones, etc. Si aparece el nombre del asesor comercial, incl├║yelo aqu├¡ con prefijo '[ASESOR]: '.",
      "initialPaymentsStructure": [
         {"description": "Concepto (Ej: Reserva, Abono Promesa, Completar Entrada)", "expected": "Monto numerico", "date": "Fecha del pago si se menciona"}
      ],
      "archivoOrigen": "Nombre EXACTO del archivo de donde sacaste este contrato"
    }
  ],
  "recibosEncontrados": [
    {
      "loteNumber": "Identificador del lote pagado (Ej: Lote 01, Lote 02)",
      "esAbonoInicial": "true o false (true si es reserva o abono a la firma, false si es cuota mensual)",
      "mes": "Mes correspondiente al pago (ej. Mayo 2025). Opciones: ${validMonths}. Vacio si esAbonoInicial es true.",
      "monto": "Numero pagado",
      "archivoOrigen": "Nombre EXACTO del archivo de donde sacaste este recibo"
    }
  ]
}

IMPORTANTE - DISTINCI├ôN COMPRADOR vs VENDEDOR/ASESOR:
- COMPRADOR: La persona que COMPRA el lote. Aparece como "El comprador", "Los compradores", "El/los adquirente(s)". Este va en el campo "owners".
- VENDEDOR/ASESOR: La persona que VENDE o el asesor comercial. Aparece como "El vendedor", "La empresa", "La promotora", o como asesor individual. NO lo pongas en "owners" - ponlo en specialObservations con prefijo '[ASESOR]: '.
- NUNCA pongas al vendedor/empresa en "owners" - SOLO los compradores.

Reglas adicionales:
1. Si hay VARIOS compradores, a├▒├ídelos a TODOS en el array de 'owners'.
2. En "initialPaymentsStructure" incluye TODO PAGO FUERTE O AISLADO que deba hacerse ANTES de que comiencen las cuotas regulares mensuales, INCLUYENDO ABONOS PARA LA PROMESA DE COMPRA VENTA.
3. Extrae SOLO el monto pagado para los recibos e ignora los saldos restantes de las im├ígenes.
4. Si en un documento imagen hay recibos de VARIOS lotes, crea un objeto en "recibosEncontrados" por cada pago y asigna correctamente a qu├® "loteNumber" pertenece.
5. Es VITAL que en "archivoOrigen" copies exactamente el nombre del documento de donde extrajiste la informaci├│n.`;
  };

  const handleSingleLotUpload = async (e) => {
    const files = Array.from(e.target?.files || e.dataTransfer?.files || []);
    if (files.length === 0) return;

    const lot = lots.find(c => c.id === selectedLotId);
    if (!lot) return;

    setIsProcessingSingleLot(true);
    setProcessingLog([`Iniciando an├ílisis de ${files.length} archivo(s) para el Lote ${lot.loteNumber}...`]);

    const fileToBase64 = (file) => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(file);
    });

    try {
      const images = [];
      const textParts = [];
      for (const file of files) {
        const base64 = await fileToBase64(file);
        images.push({ mimeType: file.type, data: base64 });
        textParts.push(`--- DOCUMENTO: ${file.name} ---`);
      }

      const validMonths = paymentMonthsGlobal.join(", ");
      const fullPrompt = textParts.join('\n') + '\n\n' + generateAIPromptText(validMonths);

      setProcessingLog(prev => [...prev, `Enviando documentos a Gemini AI...`]);

      const result = await aiChat({
        model: 'gemini-flash',
        prompt: fullPrompt,
        images,
        temperature: 0.1
      });

      if (!result.error) {
        const aiData = JSON.parse(result.text);

        let updatedLot = { ...lot };
        
        if (aiData.contratosEncontrados && aiData.contratosEncontrados.length > 0) {
          const extracted = aiData.contratosEncontrados[0]; 
          setProcessingLog(prev => [...prev, `Contrato detectado: Actualizando propietarios y estructura de pagos...`]);
          
          if (extracted.owners && extracted.owners.length > 0) {
            updatedLot.owners = extracted.owners.map(o => ({
              id: crypto.randomUUID(),
              name: o.name || '',
              documentId: o.documentId || '',
              email: o.email || '',
              phoneCode: '+593',
              phone: o.phone || ''
            }));
            updatedLot.clientName = updatedLot.owners.map(o => o.name).join(' y ');
          }

          if (extracted.alternateContact && extracted.alternateContact.name) {
            updatedLot.alternateContact = {
               name: extracted.alternateContact.name,
               phoneCode: '+593',
               phone: extracted.alternateContact.phone || ''
            };
          }
          
          if (extracted.totalPrice > 0) updatedLot.totalPrice = Number(extracted.totalPrice);
          if (extracted.expectedQuota >= 0) {
            updatedLot.expectedQuota = Number(extracted.expectedQuota);
            const hasVariedQuotas = updatedLot.payments.some(p => p.expected !== updatedLot.expectedQuota && p.expected > 0);
            if (!hasVariedQuotas) {
              updatedLot.payments = updatedLot.payments.map(p => ({ ...p, expected: updatedLot.expectedQuota }));
            }
          }
          if (extracted.lotArea > 0) updatedLot.lotArea = Number(extracted.lotArea);
          // El agente/asesor se asigna manualmente, no se extrae del documento
          if (extracted.tradeInValue > 0) updatedLot.tradeInValue = Number(extracted.tradeInValue);
          if (extracted.specialObservations) {
              updatedLot.specialObservations = updatedLot.specialObservations ? updatedLot.specialObservations + '\n' + extracted.specialObservations : extracted.specialObservations;
          }

          if (extracted.startMonthOverride) {
             updatedLot.startMonth = extracted.startMonthOverride;
             const newMonthsList = generateMonthList(updatedLot.startMonth, updatedLot.signatureMonth || projectConfig.signatureMonth, true);
             updatedLot.payments = newMonthsList.map((m, i) => {
               const existing = updatedLot.payments?.find(p => p.month === m);
               return existing ? { ...existing, id: i, expected: updatedLot.expectedQuota } : { id: i, month: m, expected: updatedLot.expectedQuota, actual: 0, receiptAttached: null, paymentDate: '' };
             });
          }

          if (extracted.initialPaymentsStructure && extracted.initialPaymentsStructure.length > 0) {
            const hasRealInitialPayments = updatedLot.initialPayments?.some(ip => ip.actual > 0 || ip.expected > 0);
            if (!hasRealInitialPayments) {
              updatedLot.initialPayments = extracted.initialPaymentsStructure.map(ip => ({
                id: crypto.randomUUID(),
                description: ip.description || 'Abono Inicial',
                expected: Number(ip.expected) || 0,
                actual: 0,
                paymentDate: '',
                receiptAttached: null
              }));
            }
          }
        }

        if (aiData.recibosEncontrados && Array.isArray(aiData.recibosEncontrados)) {
          setProcessingLog(prev => [...prev, `Se encontraron ${aiData.recibosEncontrados.length} recibos. Asign├índolos a cuotas...`]);
          aiData.recibosEncontrados.forEach(r => {
            if (r.esAbonoInicial) {
              const emptyInit = updatedLot.initialPayments?.find(ip => ip.actual === 0);
              if (emptyInit) {
                  emptyInit.actual += Number(r.monto) || 0;
                  if (r.archivoOrigen && !emptyInit.receiptAttached) emptyInit.receiptAttached = r.archivoOrigen;
              } else {
                  if (!updatedLot.initialPayments) updatedLot.initialPayments = [];
                  updatedLot.initialPayments.push({
                      id: crypto.randomUUID(),
                      description: 'Abono Extra',
                      expected: 0,
                      actual: Number(r.monto) || 0,
                      paymentDate: '',
                      receiptAttached: r.archivoOrigen || null
                  });
              }
            } else {
              const match = updatedLot.payments.find(pm => pm.month.toLowerCase() === r.mes?.toLowerCase());
              if (match) {
                match.actual += Number(r.monto) || 0;
                if (r.archivoOrigen && !match.receiptAttached) match.receiptAttached = r.archivoOrigen;
              }
            }
          });
        }

        const newDocsList = [...(updatedLot.documents || [])];
        files.forEach(f => {
          if (!newDocsList.some(d => d.name === f.name)) {
            newDocsList.push({ name: f.name, type: f.type.includes('pdf') ? 'contrato' : 'recibo' });
          }
        });
        updatedLot.documents = newDocsList;

        updateSelectedLot(updatedLot);
        setProcessingLog(prev => [...prev, `┬íProceso finalizado exitosamente!`]);
        setTimeout(() => showAlert('├ëxito', 'Documentos procesados e integrados correctamente al expediente.'), 500);
      }
    } catch (error) {
      console.error(error);
      setProcessingLog(prev => [...prev, `ÔØî Error: Hubo un problema al comunicarse con la IA.`]);
      showAlert('Error', 'Hubo un problema al procesar los documentos con la IA.');
    } finally {
      setIsProcessingSingleLot(false);
      if(e.target && e.target.value) e.target.value = '';
    }
  };

const handleMassiveUpload = async (e) => {
    const files = Array.from(e.target?.files || e.dataTransfer?.files || []);
    if (files.length === 0) return;

    setIsProcessing(true);
    setProcessingProgress({ current: 0, total: files.length, status: 'Iniciando lectura IA...' });
    setProcessingLog([`Iniciando an├ílisis masivo de ${files.length} documentos...`]);

    const fileToBase64 = (file) => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(file);
    });

    const CHUNK_SIZE = 3; 
    
    // Crear un mapa con n├║meros de lote normalizados para mejor coincidencia
    // LOTE-01, LOTE--01, Lote 01, L01, LOTE 1 deben coincidir todos
    const normalizeLotNumber = (num) => {
      if (!num) return '';
      const str = num.toString().toUpperCase().trim();
      // Extraer solo el n├║mero
      const match = str.match(/(\d+)/);
      if (match) {
        const number = match[1].padStart(2, '0'); // Rellenar con ceros: 1 -> 01, 2 -> 02
        return `LOTE${number}`;
      }
      // Alternativa: eliminar todos los no alfanum├®ricos y convertir a may├║sculas
      return str.replace(/[^A-Z0-9]/g, '');
    };
    
    let currentLotsMap = new Map();
    // Almacenar lotes con clave NORMALIZADA solo para evitar duplicados
    lots.forEach(l => {
      const normalized = normalizeLotNumber(l.loteNumber);
      if (normalized) {
        currentLotsMap.set(normalized, l);
      } else {
        currentLotsMap.set(l.loteNumber, l);
      }
    });

    let pendingReceipts = [];
    let missingContractLots = new Set();

    for (let i = 0; i < files.length; i += CHUNK_SIZE) {
      const chunk = files.slice(i, i + CHUNK_SIZE);
      setProcessingProgress({ current: Math.min(i + CHUNK_SIZE, files.length), total: files.length, status: `Leyendo documentos con IA...` });
      setProcessingLog(prev => [...prev, `Enviando paquete de ${chunk.length} documentos a Gemini IA (Archivos ${i+1} al ${Math.min(i + CHUNK_SIZE, files.length)})...`]);

      try {
        const images = [];
        const textParts = [];
        for (const file of chunk) {
          const base64 = await fileToBase64(file);
          images.push({ mimeType: file.type, data: base64 });
          textParts.push(`--- DOCUMENTO: ${file.name} ---`);
        }

        const validMonths = paymentMonthsGlobal.join(", ");
        const fullPrompt = textParts.join('\n') + '\n\n' + generateAIPromptText(validMonths);

        const result = await aiChat({
          model: 'gemini-flash',
          prompt: fullPrompt,
          images,
          temperature: 0.1
        });

        if (!result.error) {
          const aiData = JSON.parse(result.text);
          
          setProcessingLog(prev => [...prev, `Ô£à An├ílisis completado. Contratos encontrados: ${aiData.contratosEncontrados?.length || 0}. Recibos detectados: ${aiData.recibosEncontrados?.length || 0}.`]);

          if (aiData.contratosEncontrados && Array.isArray(aiData.contratosEncontrados)) {
            aiData.contratosEncontrados.forEach(extracted => {
              const lId = extracted.loteNumber;
              if (!lId) return;

              // Intentar encontrar lote existente con coincidencia normalizada
              let existingLot = currentLotsMap.get(normalizeLotNumber(lId)) || currentLotsMap.get(lId);
              let effectiveStartMonth = extracted.startMonthOverride || projectConfig.startMonth;
              
              if (!existingLot) {
                const normalizedLoteNumber = normalizeLotNumber(lId);
                setProcessingLog(prev => [...prev, `Ô£¿ Creando nuevo expediente para el Lote ${normalizedLoteNumber}...`]);
                existingLot = {
                  id: crypto.randomUUID(),
                  loteNumber: normalizedLoteNumber,
                  documents: [],
                  clientName: 'No especificado',
                  owners: [],
                  alternateContact: { name: '', phoneCode: '+593', phone: '' },
                  reminders: [],
                  showQuotas: false,
                  status: 'Activo',
                  refundAmount: 0,
                  totalPrice: Number(extracted.totalPrice) || 0,
                  expectedQuota: Number(extracted.expectedQuota) || 0,
                  initialPayments: [],
                  startMonth: effectiveStartMonth,
                  signatureMonth: projectConfig.signatureMonth,
                  escrituraMonth: projectConfig.escrituraMonth,
                  conditions: { authorizedHold: false, regularPayer: true },
                  payments: generateMonthList(effectiveStartMonth, projectConfig.signatureMonth, true).map((m, idx) => ({ id: idx, month: m, expected: Number(extracted.expectedQuota) || 0, actual: 0, receiptAttached: null, paymentDate: '' })),
                  lotArea: Number(extracted.lotArea) || 0,
                  agentName: '', // Se asigna manualmente, no se extrae del documento
                  commissionType: 'percentage',
                  commissionValue: 0,
                  commissionTriggerPercent: 30,
                  tradeInValue: Number(extracted.tradeInValue) || 0,
                  specialObservations: extracted.specialObservations || '',
                  entersRaffle: false,
                  lateFees: 0
                };

                if (extracted.owners && extracted.owners.length > 0) {
                  existingLot.owners = extracted.owners.map(o => ({ id: crypto.randomUUID(), name: o.name || '', documentId: o.documentId || '', email: o.email || '', phoneCode: '+593', phone: o.phone || '' }));
                  existingLot.clientName = existingLot.owners.map(o => o.name).join(' y ');
                } else {
                  existingLot.owners = [{ id: crypto.randomUUID(), name: 'No especificado', documentId: '', email: '', phoneCode: '+593', phone: '' }];
                }

                if (extracted.alternateContact && extracted.alternateContact.name) {
                  existingLot.alternateContact = { name: extracted.alternateContact.name, phoneCode: '+593', phone: extracted.alternateContact.phone || '' };
                }

                if (extracted.initialPaymentsStructure && extracted.initialPaymentsStructure.length > 0) {
                  existingLot.initialPayments = extracted.initialPaymentsStructure.map(ip => ({
                    id: crypto.randomUUID(), description: ip.description || 'Abono Inicial', expected: Number(ip.expected) || 0, actual: 0, paymentDate: '', receiptAttached: null
                  }));
                } else {
                   existingLot.initialPayments = [{ id: crypto.randomUUID(), description: 'Entrada Inicial', expected: 0, actual: 0, paymentDate: '', receiptAttached: null }];
                }
              } else {
                setProcessingLog(prev => [...prev, `­ƒöä Actualizando informaci├│n del contrato existente para el Lote ${lId}...`]);
                if (extracted.owners && extracted.owners.length > 0) {
                  existingLot.owners = extracted.owners.map(o => ({ id: crypto.randomUUID(), name: o.name || '', documentId: o.documentId || '', email: o.email || '', phoneCode: '+593', phone: o.phone || '' }));
                  existingLot.clientName = existingLot.owners.map(o => o.name).join(' y ');
                }
                if (extracted.alternateContact && extracted.alternateContact.name) {
                  existingLot.alternateContact = { name: extracted.alternateContact.name, phoneCode: '+593', phone: extracted.alternateContact.phone || '' };
                }
                if(extracted.totalPrice) existingLot.totalPrice = Number(extracted.totalPrice);
                if(extracted.expectedQuota >= 0) {
                  existingLot.expectedQuota = Number(extracted.expectedQuota);
                  const hasVariedQuotas = existingLot.payments.some(p => p.expected !== existingLot.expectedQuota && p.expected > 0);
                  if (!hasVariedQuotas) {
                    existingLot.payments = existingLot.payments.map(p => ({ ...p, expected: existingLot.expectedQuota }));
                  }
                }
                if(extracted.lotArea) existingLot.lotArea = Number(extracted.lotArea);
                // El agente/asesor se asigna manualmente, no se extrae del documento
                if(extracted.tradeInValue) existingLot.tradeInValue = Number(extracted.tradeInValue);
                if(extracted.specialObservations) existingLot.specialObservations = existingLot.specialObservations ? existingLot.specialObservations + '\n' + extracted.specialObservations : extracted.specialObservations;
                
                if (extracted.startMonthOverride && existingLot.startMonth !== extracted.startMonthOverride) {
                    existingLot.startMonth = extracted.startMonthOverride;
                    const newMonthsList = generateMonthList(existingLot.startMonth, existingLot.signatureMonth, true);
                    existingLot.payments = newMonthsList.map((m, i) => {
                      const existing = existingLot.payments?.find(p => p.month === m);
                      return existing ? { ...existing, id: i, expected: existingLot.expectedQuota } : { id: i, month: m, expected: existingLot.expectedQuota, actual: 0, receiptAttached: null, paymentDate: '' };
                    });
                }
              }

              if (extracted.archivoOrigen && !existingLot.documents.some(d => d.name === extracted.archivoOrigen)) {
                  existingLot.documents.push({ 
                    name: extracted.archivoOrigen, 
                    type: extracted.archivoOrigen.toLowerCase().includes('pdf') ? 'contrato' : 'documento' 
                  });
              }

              currentLotsMap.set(normalizeLotNumber(lId) || lId, existingLot);
            });
          }

          if (aiData.recibosEncontrados && Array.isArray(aiData.recibosEncontrados)) {
            pendingReceipts.push(...aiData.recibosEncontrados);
          }
        }
      } catch (error) {
        console.error(`Error procesando documentos:`, error);
        setProcessingLog(prev => [...prev, `ÔØî Error cr├¡tico al analizar el paquete de documentos.`]);
      }
    }

    setProcessingLog(prev => [...prev, `­ƒÆ│ Clasificando y enlazando ${pendingReceipts.length} recibos con sus respectivos contratos...`]);
    
    pendingReceipts.forEach(recibo => {
      const lId = recibo.loteNumber;
      if (!lId) return;

      let existingLot = currentLotsMap.get(normalizeLotNumber(lId)) || currentLotsMap.get(lId);
      
      if (existingLot) {
        if (recibo.esAbonoInicial) {
            const emptyInit = existingLot.initialPayments.find(ip => ip.actual === 0);
            if (emptyInit) {
                emptyInit.actual += Number(recibo.monto) || 0;
                if(recibo.archivoOrigen && !emptyInit.receiptAttached) emptyInit.receiptAttached = recibo.archivoOrigen;
            } else {
                existingLot.initialPayments.push({
                    id: crypto.randomUUID(),
                    description: 'Abono Extra',
                    expected: 0,
                    actual: Number(recibo.monto) || 0,
                    paymentDate: '',
                    receiptAttached: recibo.archivoOrigen || null
                });
            }
        } else {
            const match = existingLot.payments.find(pm => pm.month.toLowerCase() === recibo.mes?.toLowerCase());
            if (match) {
              match.actual += Number(recibo.monto) || 0;
              if(recibo.archivoOrigen && !match.receiptAttached) match.receiptAttached = recibo.archivoOrigen;
            }
        }

        if (recibo.archivoOrigen && !existingLot.documents.some(d => d.name === recibo.archivoOrigen)) {
            existingLot.documents.push({ name: recibo.archivoOrigen, type: 'recibo' });
        }
      } else {
        missingContractLots.add(lId);
        setProcessingLog(prev => [...prev, `ÔÜá´©Å Recibo detectado para Lote ${lId} ignorado porque no existe su contrato base.`]);
      }
    });

    setLots(Array.from(currentLotsMap.values()));
    setProcessingLog(prev => [...prev, `┬íFinalizado con ├®xito! Redirigiendo al Dashboard...`]);
    
    setTimeout(() => {
      setIsProcessing(false);
      setView('dashboard');
      if (missingContractLots.size > 0) {
        const lotesFaltantes = Array.from(missingContractLots).join(', ');
        showAlert(
          'ÔÜá´©Å Contratos Faltantes', 
          `La IA encontr├│ recibos para: ${lotesFaltantes}. \nSin embargo, NO se ha subido el Contrato principal de estos lotes. S├║belos para asociarlos correctamente.`
        );
      }
    }, 1500);
  };

  // --- 3. C├üLCULOS GLOBALES Y ORDENAMIENTO ---
  
  // Primero separar lotes activos y desistidos
  const { activeLots, desistidoLots } = useMemo(() => {
    const active: typeof lots = [];
    const desistido: typeof lots = [];
    
    lots.forEach(lot => {
      const num = (lot.loteNumber || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const isDesistidoLot = lot.status === 'Desistido' || 
                              lot.loteNumber?.toLowerCase().startsWith('z') || 
                              num.startsWith('zdes') || 
                              num === 'zdesistidos';
      
      if (isDesistidoLot) {
        desistido.push(lot);
      } else {
        active.push(lot);
      }
    });
    
    return { activeLots: active, desistidoLots: desistido };
  }, [lots]);

  // Luego calcular estad├¡sticas solo con lotes activos
  const dashboardStats = useMemo(() => {
    let totalToCollectNow = 0;
    let totalCollectedSoFar = 0;
    let totalFutureQuotas = 0;
    let totalSaldoEscritura = 0;
    let activeLotsCount = 0;

    // Solo contar lotes activos (no desistidos)
    activeLots.forEach(lot => {
      const totalInitialPaid = lot.initialPayments?.reduce((acc, p) => acc + Number(p.actual), 0) || 0;
      const totalQuotasPaid = lot.payments.reduce((acc, p) => acc + Number(p.actual), 0);
      const tradeIn = lot.tradeInValue || 0;
      const lateFees = lot.lateFees || 0;

      if (lot.status === 'Desistido') {
        const netKept = (totalInitialPaid + totalQuotasPaid) - (lot.refundAmount || 0);
        if (netKept > 0) totalCollectedSoFar += netKept;
        return; 
      }

      activeLotsCount++;

      const sigMonth = lot.signatureMonth || projectConfig.signatureMonth;
      const escMonth = lot.escrituraMonth || projectConfig.escrituraMonth;
      const lotFutureMonths = Math.max(0, getMonthsDifference(sigMonth, escMonth));

      const totalInitialExpected = lot.initialPayments?.reduce((acc, p) => acc + Number(p.expected), 0) || 0;
      const pastDueInitial = Math.max(0, totalInitialExpected - totalInitialPaid);

      const pastDueQuotas = lot.payments.reduce((acc, p) => acc + Math.max(0, p.expected - p.actual), 0);
      
      const toPayNow = pastDueInitial + pastDueQuotas + lateFees;
      
      const currentExpectedTotal = lot.payments.reduce((acc, p) => acc + Number(p.expected), 0);
      const futureQuotasTotal = currentExpectedTotal > 0 ? lotFutureMonths * lot.expectedQuota : 0;
      
      const saldoEscritura = Math.max(0, lot.totalPrice - totalInitialPaid - totalQuotasPaid - tradeIn - toPayNow - futureQuotasTotal);

      totalCollectedSoFar += (totalInitialPaid + totalQuotasPaid + tradeIn);
      totalToCollectNow += toPayNow;
      totalFutureQuotas += futureQuotasTotal;
      totalSaldoEscritura += saldoEscritura;
    });

    return { activeLotsCount, totalToCollectNow, totalCollectedSoFar, totalFutureQuotas, totalSaldoEscritura };
  }, [activeLots, projectConfig]);

  // Ordenar lotes activos
  const sortedLots = useMemo(() => {
    return [...activeLots].sort((a, b) => {
      const numA = parseInt(a.loteNumber.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.loteNumber.replace(/\D/g, ''), 10) || 0;
      if (numA !== numB) return numA - numB;
      return a.loteNumber.localeCompare(b.loteNumber);
    });
  }, [activeLots]);

  // Ordenar lotes desistidos
  const sortedDesistidoLots = useMemo(() => {
    return [...desistidoLots].sort((a, b) => {
      const numA = parseInt(a.loteNumber.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.loteNumber.replace(/\D/g, ''), 10) || 0;
      if (numA !== numB) return numA - numB;
      return a.loteNumber.localeCompare(b.loteNumber);
    });
  }, [desistidoLots]);

  // --- 4. FUNCIONES DE ACTUALIZACI├ôN ---
  const updateSelectedLot = (updates) => {
    setLots(prev => prev.map(l => l.id === selectedLotId ? { ...l, ...updates } : l));
  };

  const toggleLotStatus = (lot) => {
    // Ciclo de estados: Activo -> Reservado -> Vendido -> Desistido -> Activo
    const statusCycle = ['Activo', 'Reservado', 'Vendido', 'Desistido'];
    const currentIndex = statusCycle.indexOf(lot.status || 'Activo');
    const nextIndex = (currentIndex + 1) % statusCycle.length;
    const nextStatus = statusCycle[nextIndex];
    
    if (nextStatus === 'Desistido') {
      showPrompt('Desistir Lote', '┬┐Cu├ínto dinero se le va a devolver al cliente por este desistimiento? (Pon 0 si la penalidad es del 100% o si no pag├│ nada).', '0', (val) => {
        updateSelectedLot({ status: nextStatus, refundAmount: Number(val) || 0 });
      });
    } else {
      updateSelectedLot({ status: nextStatus, refundAmount: 0 });
    }
  };

  const handleLotDateChange = (field, newMonth) => {
    setLots(prev => prev.map(l => {
      if (l.id !== selectedLotId) return l;
      const newLot = { ...l, [field]: newMonth };
      const effectiveStart = newLot.startMonth || projectConfig.startMonth;
      const effectiveSig = newLot.signatureMonth || projectConfig.signatureMonth;
      const newMonthsList = generateMonthList(effectiveStart, effectiveSig, true);
      
      const newPayments = newMonthsList.map((m, i) => {
        const existing = l.payments?.find(p => p.month === m);
        return existing ? { ...existing, id: i } : { id: i, month: m, expected: l.expectedQuota, actual: 0, receiptAttached: null, paymentDate: '' };
      });
      return { ...newLot, signatureMonth: effectiveSig, startMonth: effectiveStart, payments: newPayments };
    }));
  };

  const deleteLot = (id) => {
    showConfirm('Eliminar Expediente', '┬┐Est├ís seguro de eliminar este expediente? Esta acci├│n no se puede deshacer.', () => {
      setLots(prev => prev.filter(l => l.id !== id));
      if (selectedLotId === id) setView('dashboard');
    });
  };

  const clearAllPayments = () => {
    showConfirm('Limpiar Todo', '┬┐Deseas vaciar todos los abonos y fechas ingresadas de este cliente?', () => {
      setLots(prev => prev.map(l => {
        if (l.id !== selectedLotId) return l;
        return {
          ...l,
          initialPayments: l.initialPayments.map(ip => ({...ip, actual: 0, receiptAttached: null, paymentDate: ''})),
          payments: l.payments.map(p => ({...p, actual: 0, receiptAttached: null, paymentDate: ''}))
        };
      }));
    });
  };

  const updatePaymentField = (paymentId, field, value) => {
    setLots(prev => prev.map(l => {
      if (l.id !== selectedLotId) return l;
      const newPayments = l.payments.map(p => p.id === paymentId ? { ...p, [field]: value } : p);
      return { ...l, payments: newPayments };
    }));
  };

  const addOwner = () => {
    setLots(prev => prev.map(l => {
      if (l.id !== selectedLotId) return l;
      const newOwners = [...l.owners, { id: crypto.randomUUID(), name: '', documentId: '', email: '', phoneCode: '+593', phone: '' }];
      return { ...l, owners: newOwners, clientName: newOwners.map(o=>o.name).join(' y ') };
    }));
  };
  const updateOwner = (ownerId, field, value) => {
    setLots(prev => prev.map(l => {
      if (l.id !== selectedLotId) return l;
      const newOwners = l.owners.map(o => o.id === ownerId ? { ...o, [field]: value } : o);
      return { ...l, owners: newOwners, clientName: newOwners.map(o=>o.name).join(' y ') };
    }));
  };
  const removeOwner = (ownerId) => {
    setLots(prev => prev.map(l => {
      if (l.id !== selectedLotId) return l;
      const newOwners = l.owners.filter(o => o.id !== ownerId);
      return { ...l, owners: newOwners, clientName: newOwners.map(o=>o.name).join(' y ') };
    }));
  };

  const addInitialPayment = () => {
    setLots(prev => prev.map(l => {
      if (l.id !== selectedLotId) return l;
      return { ...l, initialPayments: [...(l.initialPayments || []), { id: crypto.randomUUID(), description: 'Nuevo Abono', expected: 0, actual: 0, paymentDate: '', receiptAttached: null }] };
    }));
  };
  const updateInitialPayment = (id, field, value) => {
    setLots(prev => prev.map(l => {
      if (l.id !== selectedLotId) return l;
      return { ...l, initialPayments: l.initialPayments.map(p => p.id === id ? { ...p, [field]: value } : p) };
    }));
  };
  const removeInitialPayment = (id) => {
    setLots(prev => prev.map(l => {
      if (l.id !== selectedLotId) return l;
      return { ...l, initialPayments: l.initialPayments.filter(p => p.id !== id) };
    }));
  };

  const addReminder = () => {
    setLots(prev => prev.map(l => {
      if (l.id !== selectedLotId) return l;
      return { ...l, reminders: [...(l.reminders || []), { id: crypto.randomUUID(), text: '', date: '', completed: false }] };
    }));
  };
  const updateReminder = (id, field, value) => {
    setLots(prev => prev.map(l => {
      if (l.id !== selectedLotId) return l;
      return { ...l, reminders: l.reminders.map(r => r.id === id ? { ...r, [field]: value } : r) };
    }));
  };
  const removeReminder = (id) => {
    setLots(prev => prev.map(l => {
      if (l.id !== selectedLotId) return l;
      return { ...l, reminders: l.reminders.filter(r => r.id !== id) };
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(amount);
  };

  // --- 5. SORTEO CRIPTOGR├üFICO ---
  const executeRaffle = () => {
    const participants = lots.filter(l => l.entersRaffle && l.status === 'Activo');
    if (participants.length === 0) {
      return showAlert('Acci├│n no permitida', 'No hay clientes marcados para participar en el sorteo. Activa la casilla "Participa en Sorteo" en los expedientes que apliquen.');
    }

    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    const randomIndex = array[0] % participants.length;
    const realWinner = participants[randomIndex];

    const auditData = {
      timestamp: new Date().toISOString(),
      seed: array[0].toString(),
      algorithm: 'Web Crypto API (CSPRNG)',
      totalParticipants: participants.length
    };

    setRaffleState(prev => ({ ...prev, status: 'animating', currentDisplay: 'Mezclando...', winner: null, audit: null }));

    let ticks = 0;
    const intervalTime = 100;
    const maxTicks = (raffleState.duration * 1000) / intervalTime;
    
    const interval = setInterval(() => {
      const visualRandom = Math.floor(Math.random() * participants.length);
      setRaffleState(prev => ({ ...prev, currentDisplay: participants[visualRandom].clientName }));
      ticks++;
      
      if (ticks >= maxTicks) {
        clearInterval(interval);
        setRaffleState(prev => ({
          ...prev,
          status: 'finished',
          currentDisplay: realWinner.clientName,
          winner: realWinner,
          audit: auditData
        }));
      }
    }, intervalTime);
  };

  const handlePrintCertificate = () => {
    if (!raffleState.audit || !raffleState.winner) return;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Certificado de Sorteo - ${activeProjectName}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; text-align: center; color: #1a202c; }
            .cert-container { border: 8px solid #f59e0b; padding: 50px; border-radius: 24px; max-width: 800px; margin: 0 auto; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
            h1 { color: #b45309; font-size: 32px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 2px;}
            h2 { color: #4b5563; font-size: 20px; font-weight: normal; margin-bottom: 40px; }
            .winner-box { background-color: #fffbeb; padding: 30px; border-radius: 16px; margin: 30px 0; border: 2px dashed #fcd34d; }
            .winner-name { font-size: 36px; font-weight: 900; color: #d97706; margin: 0; }
            .winner-lote { font-size: 18px; color: #92400e; margin-top: 10px; }
            .audit-info { background: #f3f4f6; padding: 20px; border-radius: 12px; text-align: left; font-family: monospace; font-size: 14px; color: #4b5563; line-height: 1.6; }
            .audit-info strong { color: #1f2937; }
            .footer { margin-top: 40px; font-size: 12px; color: #9ca3af; }
          </style>
        </head>
        <body>
          <div class="cert-container">
            <h1>Certificado Oficial de Sorteo</h1>
            <h2>Proyecto Inmobiliario: <strong>${activeProjectName}</strong></h2>
            
            <p style="font-size: 18px;">Se certifica legal y p├║blicamente que el ganador es:</p>
            
            <div class="winner-box">
              <p class="winner-name">${raffleState.winner.clientName}</p>
              <p class="winner-lote">Adquiriente del Lote N┬░ ${raffleState.winner.loteNumber}</p>
            </div>
            
            <div class="audit-info">
              <p style="text-align: center; font-weight: bold; margin-top: 0; margin-bottom: 15px; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">DATOS DE AUDITOR├ìA CRIPTOGR├üFICA</p>
              <strong>Fecha y Hora Exacta:</strong> ${new Date(raffleState.audit.timestamp).toLocaleString('es-EC')}<br/>
              <strong>Algoritmo Utilizado:</strong> ${raffleState.audit.algorithm}<br/>
              <strong>Participantes Validados:</strong> ${raffleState.audit.totalParticipants}<br/>
              <strong>Semilla de Aleatoriedad (Hash):</strong><br/>
              <span style="word-break: break-all; color: #059669;">${raffleState.audit.seed}</span>
            </div>
            
            <div class="footer">
              Este documento garantiza que la selecci├│n fue realizada mediante un generador de n├║meros pseudoaleatorios seguro,<br/> 
              asegurando total imparcialidad, equidad y sin intervenci├│n humana.
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 500);
  };

  // --- 6. COMUNICACI├ôN (WHATSAPP, CORREO, PDF) Y MENSAJES ---
  const generateMessageForClient = async () => {
    const lot = lots.find(c => c.id === selectedLotId);
    if (!lot) return;

    if (lot.status === 'Desistido') {
      showAlert('Atenci├│n', 'Este lote est├í marcado como Desistido. El comunicado generado se enfocar├í en la formalizaci├│n de la resoluci├│n del contrato.');
    }

    const sigMonth = lot.signatureMonth || projectConfig.signatureMonth;
    const escMonth = lot.escrituraMonth || projectConfig.escrituraMonth;
    const lotFutureMonths = Math.max(0, getMonthsDifference(sigMonth, escMonth));
    const lotSignatureName = formatMonthYear(sigMonth);
    const lotEscrituraName = formatMonthYear(escMonth);

    const totalInitialExpected = lot.initialPayments?.reduce((acc, p) => acc + Number(p.expected), 0) || 0;
    const totalInitialPaid = lot.initialPayments?.reduce((acc, p) => acc + Number(p.actual), 0) || 0;
    const pastDueInitial = Math.max(0, totalInitialExpected - totalInitialPaid);

    const totalQuotasPaid = lot.payments.reduce((acc, p) => acc + Number(p.actual), 0);
    const pastDueQuotas = lot.payments.reduce((acc, p) => acc + Math.max(0, p.expected - p.actual), 0);
    const tradeIn = lot.tradeInValue || 0;
    const lateFees = lot.lateFees || 0;
    
    const totalToPayNow = pastDueInitial + pastDueQuotas + lateFees;
    const futureQuotasTotal = lotFutureMonths * lot.expectedQuota;
    const saldoEscritura = Math.max(0, lot.totalPrice - totalInitialPaid - totalQuotasPaid - tradeIn - totalToPayNow - futureQuotasTotal);

    setIsGeneratingMessage(true);

    let roleInstruction = "";
    let toneInstructions = "";

    if (lot.status === 'Desistido') {
        roleInstruction = "Act├║a como el Departamento Legal del proyecto.";
        toneInstructions = `El cliente ha desistido del contrato. Redacta un documento formal indicando la resoluci├│n del contrato de reserva. Menciona que se ha procedido a la liberaci├│n del lote y que se le devolver├í un monto de $${lot.refundAmount || 0} por concepto de liquidaci├│n final, dando por terminada la relaci├│n comercial.`;
    } else if (messageTone === 'Asesor Comercial') {
        roleInstruction = "Act├║a como el Asesor Comercial personal del cliente.";
        toneInstructions = "Tono muy cercano, entusiasta y servicial. Enf├│cate en el sue├▒o de tener su nuevo hogar. Minimiza la fricci├│n llamando a la deuda 'saldos pendientes para poder avanzar con tu firma'. Usa lenguaje optimista.";
    } else if (messageTone === 'Departamento Legal') {
        roleInstruction = "Act├║a como el Departamento Legal de la constructora/inmobiliaria.";
        toneInstructions = "Tono estricto, muy formal y riguroso. Usa t├®rminos como 'obligaciones contractuales', 'deuda', 'vencimiento', 'requerimiento' y 'regularizaci├│n inmediata'. Menciona que el pago es requisito indispensable para no incurrir en incumplimientos.";
    } else if (messageTone === 'Gerente General') {
        roleInstruction = "Act├║a como el Gerente General del proyecto inmobiliario.";
        toneInstructions = "Tono institucional, de alto nivel, agradecido pero asertivo y firme. Habla del compromiso mutuo, el gran avance del proyecto y la importancia de su aporte financiero para el ├®xito colectivo de la urbanizaci├│n.";
    } else {
        roleInstruction = "Act├║a como el Departamento de Administraci├│n del proyecto.";
        toneInstructions = "Tono amigable, formal y colaborativo. Si tuvo retenci├│n autorizada, pide la 'liberaci├│n de los fondos retenidos' para continuar el desarrollo. Si no, pide la integraci├│n de cuotas pendientes de forma cordial, sin usar la palabra deuda excesivamente.";
    }

    const ownersNames = lot.owners.map(o => o.name).join(' y ');

    const promptText = `
      ${roleInstruction}
      Redacta un mensaje a ${ownersNames}, adquiriente(s) del lote ${lot.loteNumber}.
      
      Datos financieros exactos de este cliente (Si est├í desistido, ignora los pagos futuros):
      - Deuda por Reservas/Entrada inicial/Firma de promesa: $${pastDueInitial}
      - Cuotas atrasadas/retenidas: $${pastDueQuotas}
      - Intereses por mora aplicados: $${lateFees}
      - TOTAL A INTEGRAR AHORA: $${totalToPayNow}
      - Saldo proyectado a la firma de escritura (${lotEscrituraName}): $${saldoEscritura}
      - ┬┐Tuvo retenci├│n de cuotas autorizada previamente por demoras?: ${lot.conditions.authorizedHold ? 'S├¡' : 'No'}

      Instrucciones de Redacci├│n:
      1. ${toneInstructions}
      2. Dir├¡gete a todos los propietarios mencionados de forma plural si son varios.
      3. ${lot.status === 'Activo' ? `Desglosa los valores claramente si son mayores a 0 (Valores iniciales: $${pastDueInitial}, Cuotas: $${pastDueQuotas}, Mora: $${lateFees}). Indica que el TOTAL a integrar para la firma de promesa es de $${totalToPayNow}.` : ''}
      4. ${lot.status === 'Activo' ? `Menciona que su saldo proyectado para la escritura definitiva en ${lotEscrituraName} ser├í de $${saldoEscritura} (tras el pago de cuotas futuras).` : ''}
      5. M├íximo 3 p├írrafos.
    `;

    try {
      const result = await aiChat({
        model: 'gemini-flash',
        prompt: promptText,
        systemPrompt: "Eres un redactor profesional experto en comunicaci├│n inmobiliaria y cobranzas. Siempre redacta en espa├▒ol de Ecuador."
      });
      const text = result.error ? "No se pudo generar el mensaje." : (result.text || "No se pudo generar el mensaje.");
      updateSelectedLot({ generatedMessage: text });
    } catch (error) {
      showAlert('Error', 'Error de conexi├│n con la IA. Por favor, intente nuevamente.');
    } finally {
      setIsGeneratingMessage(false);
    }
  };

  const handleSendWhatsApp = (lot) => {
    if (!lot.owners || lot.owners.length === 0 || !lot.owners[0].phone) {
      return showAlert('Error', 'El propietario principal no tiene un n├║mero de tel├®fono registrado.');
    }
    const phone = `${lot.owners[0].phoneCode.replace('+', '')}${lot.owners[0].phone.replace(/\D/g, '')}`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(lot.generatedMessage)}`;
    window.open(url, '_blank');
  };

  const handleSendEmail = (lot) => {
    if (!lot.owners || lot.owners.length === 0 || !lot.owners[0].email) {
      return showAlert('Error', 'El propietario principal no tiene un correo electr├│nico registrado.');
    }
    const url = `mailto:${lot.owners[0].email}?subject=Notificaci├│n Inmobiliaria - ${lot.loteNumber}&body=${encodeURIComponent(lot.generatedMessage)}`;
    window.open(url, '_blank');
  };

  const handlePrintContract = (lot) => {
    const printWindow = window.open('', '_blank');
    const ownersText = lot.owners.map(o => `${o.name} (C.I/Pasaporte: ${o.documentId || 'N/A'})`).join(' y ');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Contrato - ${lot.loteNumber}</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px; max-width: 800px; margin: auto; line-height: 1.6; color: #000; }
            h1 { text-align: center; font-size: 18px; text-decoration: underline; margin-bottom: 30px; }
            h2 { font-size: 14px; margin-top: 20px; }
            p { text-align: justify; margin-bottom: 10px; font-size: 13px; }
            .footer { margin-top: 80px; display: flex; justify-content: space-around; }
            .sign-line { border-top: 1px solid black; width: 250px; text-align: center; padding-top: 5px; font-size: 12px; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>CONTRATO DE RESERVA DE LOTE DE TERRENO - ${activeProjectName}</h1>
          <p>En la ciudad de residencia, a la fecha de suscripci├│n, comparecen para celebrar de manera libre y voluntaria el presente Contrato de Reserva de Lote de Terreno, las siguientes partes:</p>
          <p><strong>Por una parte:</strong> El PROMOTOR / INMOBILIARIA, en calidad de representante legal y propietario del proyecto <strong>${activeProjectName}</strong>.</p>
          <p><strong>Por otra parte:</strong> ${ownersText}, en calidad de COMPRADOR(ES), actuando en ejercicio de sus propios derechos.</p>
          
          <h2>CL├üUSULA PRIMERA: OBJETO DEL CONTRATO</h2>
          <p>El(Los) comprador(es) reserva(n) para s├¡ el lote <strong>${lot.loteNumber}</strong>, con un ├írea de <strong>${lot.lotArea} m2</strong>, dentro del proyecto mencionado.</p>
          
          <h2>CL├üUSULA SEGUNDA: PRECIO Y FORMA DE PAGO</h2>
          <p>Las partes acuerdan que el precio total del lote es de <strong>${formatCurrency(lot.totalPrice)}</strong>, el cual ser├í pagado de la siguiente manera:</p>
          <ul>
            <li><strong>Cuota Mensual Acordada:</strong> ${formatCurrency(lot.expectedQuota)}</li>
          </ul>
          
          <h2>CL├üUSULA TERCERA: CONDICIONES ESPECIALES</h2>
          <p>${lot.specialObservations || 'Sin condiciones especiales adicionales registradas.'}</p>
          
          <div class="footer">
             <div class="sign-line">LA EMPRESA<br/>Firma Autorizada</div>
             <div class="sign-line">EL COMPRADOR<br/>Firma y C.I.</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 500);
  };


  // --- 7. MASTERPLAN ---
  const handleMasterplanUpload = (e) => {
    const file = e.target.files[0];
    if(!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        const MAX_WIDTH = 1024;
        const MAX_HEIGHT = 768;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.4); 
        
        try {
          localStorage.setItem('test_quota', compressedBase64);
          localStorage.removeItem('test_quota');
          setProjectConfig(prev => ({...prev, masterplanImage: compressedBase64}));
        } catch(err) {
          showAlert('Memoria Llena', 'La imagen es demasiado pesada para la memoria local del navegador. Por favor, rec├│rtala o intenta con una imagen de menor resoluci├│n.');
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleMapClick = (e) => {
    if (!projectConfig.masterplanImage) return;
    const rect = e.target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    showPrompt('Asignar Lote', 'Ingresa S├ôLO el n├║mero del lote (Ej: 1, 14, 32) para colocar el pin:', '', (loteNum) => {
      if (loteNum) {
        const cleanNum = String(loteNum).replace(/\D/g, '');
        if(!cleanNum) return showAlert('Error', 'Ingresa un n├║mero v├ílido.');
        
        const lotExists = lots.find(l => String(l.loteNumber).replace(/\D/g, '') === cleanNum);
        if (!lotExists) {
          return showAlert('Lote no encontrado', `El lote ${cleanNum} no tiene un expediente creado en el sistema. Debes subir su contrato primero antes de mapearlo.`);
        }

        const alreadyPinned = projectConfig.lotPins?.find(p => String(p.loteNumber).replace(/\D/g, '') === cleanNum);
        if (alreadyPinned) {
          return showAlert('Lote ya mapeado', `El lote ${cleanNum} ya se encuentra ubicado en el mapa. Si deseas moverlo, b├│rralo de la lista lateral y vuelve a asignarlo.`);
        }

        setProjectConfig(prev => ({
          ...prev, 
          lotPins: [...(prev.lotPins || []), { id: crypto.randomUUID(), loteNumber: cleanNum, x, y }]
        }));
      }
    });
  };

  const removeMapPin = (id) => {
    setProjectConfig(prev => ({
      ...prev,
      lotPins: prev.lotPins.filter(p => p.id !== id)
    }));
  };

  const getPinColor = (loteNumber) => {
    const cleanInput = String(loteNumber).replace(/\D/g, '');
    const lot = lots.find(l => String(l.loteNumber).replace(/\D/g, '') === cleanInput && cleanInput !== '');
    
    if (!lot) return 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] border-zinc-800'; 
    if (lot.status === 'Desistido') return 'bg-zinc-600 shadow-[0_0_10px_rgba(82,82,91,0.8)] border-zinc-800'; 
    
    const totalInitialPaid = lot.initialPayments?.reduce((acc, p) => acc + Number(p.actual), 0) || 0;
    const totalQuotasPaid = lot.payments.reduce((acc, p) => acc + Number(p.actual), 0);
    const totalPaid = totalInitialPaid + totalQuotasPaid + (lot.tradeInValue || 0);
    
    const requiredForPromesa = (lot.initialPayments?.reduce((acc, p) => acc + Number(p.expected), 0) || 0);

    if (requiredForPromesa > 0 && totalPaid >= requiredForPromesa) {
      return 'bg-rose-600 shadow-[0_0_10px_rgba(225,29,72,0.8)] border-zinc-800'; 
    } else {
      return 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)] border-zinc-800 text-yellow-950'; 
    }
  };


  // --- COMPONENTES DE VISTA ---

  const renderUploadView = () => (
    <div className="max-w-4xl mx-auto mt-6 p-8 bg-zinc-900 rounded-2xl shadow-xl border border-zinc-800 animate-fadeIn text-center">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Building className="w-6 h-6 text-rose-500"/> Administrar: {activeProjectName}
        </h2>
      </div>
      
      {!isProcessing ? (
        <>
          <div className="bg-zinc-950/50 p-6 rounded-2xl shadow-sm border border-zinc-800 mb-8 text-left">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-rose-500"/> Configuraci├│n de Fechas de este Proyecto
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">Inicio de Cuotas Global</label>
                <input type="month" value={projectConfig.startMonth} onChange={(e) => handleConfigChange('startMonth', e.target.value)} className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded-md font-medium text-white outline-none focus:border-rose-500" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">Mes de Promesa (Cobro Actual)</label>
                <input type="month" value={projectConfig.signatureMonth} onChange={(e) => handleConfigChange('signatureMonth', e.target.value)} className="w-full p-2 bg-rose-950/20 border border-rose-900/50 rounded-md font-medium text-rose-400 outline-none focus:border-rose-500" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">Mes de Escrituras (Pago Final)</label>
                <input type="month" value={projectConfig.escrituraMonth} onChange={(e) => handleConfigChange('escrituraMonth', e.target.value)} className="w-full p-2 bg-emerald-950/20 border border-emerald-900/50 rounded-md font-medium text-emerald-400 outline-none focus:border-emerald-500" />
              </div>
            </div>
            <p className="text-[11px] text-zinc-500 mt-3 text-center italic">Estas fechas aplican por defecto. Podr├ís modificar fechas espec├¡ficas para cada cliente m├ís adelante.</p>
          </div>

          <label 
            onDragOver={(e) => { preventDefault(e); setIsDragUpload(true); }}
            onDragLeave={(e) => { preventDefault(e); setIsDragUpload(false); }}
            onDrop={(e) => { preventDefault(e); setIsDragUpload(false); handleMassiveUpload(e); }}
            className={`border-2 border-dashed transition-all rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer mb-8 
              ${isDragUpload ? 'border-rose-500 bg-rose-950/20 scale-[1.02] shadow-lg shadow-rose-900/20' : 'border-zinc-700 bg-zinc-950/50 hover:bg-zinc-900'}`}
          >
            <Upload className={`w-16 h-16 mb-4 transition-colors ${isDragUpload ? 'text-rose-400' : 'text-zinc-500'}`} />
            <span className="text-lg font-semibold text-white">Arrastra o Sube PDFs e Im├ígenes aqu├¡</span>
            <span className="text-sm text-zinc-400 mt-2">Nuestra IA analizar├í los documentos y agrupar├í m├║ltiples recibos en sus respectivos lotes.</span>
            <input type="file" multiple accept=".pdf,image/*" className="hidden" onChange={handleMassiveUpload} />
          </label>
          
          <div className="pt-6 border-t border-zinc-800">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">O carga tu base de datos guardada para este proyecto</h3>
            <label className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg cursor-pointer transition shadow-md font-medium">
              <UploadCloud className="w-5 h-5 text-zinc-400" />
              Cargar Archivo (.json)
              <input type="file" accept=".json" className="hidden" onChange={handleImportJSON} />
            </label>
          </div>
        </>
      ) : (
        <div className="border-2 border-dashed border-rose-900/50 bg-zinc-950/50 rounded-xl p-8 flex flex-col items-center justify-center">
          <div className="relative w-20 h-20 mb-6">
            <div className="absolute inset-0 border-4 border-zinc-800 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-rose-600 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
              {Math.round((processingProgress.current / processingProgress.total) * 100) || 0}%
            </div>
          </div>
          <h3 className="text-lg font-semibold text-rose-500 mb-4 uppercase tracking-widest">{processingProgress.status}</h3>
          
          {/* CONSOLA DE LOGS */}
          <div className="w-full bg-black border border-zinc-800 rounded-lg p-4 h-48 overflow-y-auto text-left font-mono text-[10px] text-emerald-400 shadow-inner scrollbar-thin">
             {processingLog.map((log, i) => (
                <div key={i} className="mb-1 opacity-90 hover:opacity-100">{`> ${log}`}</div>
             ))}
             <div ref={logEndRef} />
          </div>
        </div>
      )}
    </div>
  );

  const renderDashboardView = () => (
    <div className="max-w-7xl mx-auto mt-8 space-y-8 animate-fadeIn">
      <div className="bg-[#0a0a0a] rounded-3xl border border-white/5 p-6 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20">
            <LayoutDashboard className="w-6 h-6 text-rose-500" />
          </div>
          <div>
            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em]">Estado de Cobranzas</p>
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">{activeProjectName}</h2>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setDashboardViewMode(dashboardViewMode === 'table' ? 'grid' : 'table')}
            className="bg-black text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-900 border border-white/5 transition-all flex items-center gap-2"
          >
            {dashboardViewMode === 'table' ? (
              <><LayoutGrid className="w-4 h-4 text-cyan-500" /> Vista Grilla</>
            ) : (
              <><List className="w-4 h-4 text-zinc-400" /> Vista Lista</>
            )}
          </button>
          <button onClick={exportToCSV} className="bg-black text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-900 border border-white/5 transition-all flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Excel
          </button>
          <button onClick={exportToJSON} className="bg-black text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-900 border border-white/5 transition-all flex items-center gap-2">
            <Download className="w-4 h-4 text-zinc-400" /> JSON
          </button>
          <button 
            onClick={() => loadLotsFromSupabase(activeProjectId)} 
            disabled={isSyncing}
            className={`text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 border border-white/5 ${
              isSyncing ? 'bg-zinc-800 cursor-not-allowed' : 'bg-black hover:bg-zinc-900'
            }`}
          >
            <RefreshCw className={`w-4 h-4 text-cyan-500 ${isSyncing ? 'animate-spin' : ''}`} /> 
            {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
          </button>
          <button onClick={() => setView('upload')} className="bg-rose-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-rose-700 transition-all shadow-lg shadow-rose-500/20">
            <Settings className="w-4 h-4 inline mr-1" /> Configurar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-5">
        <div className="bg-[#0a0a0a] p-6 rounded-3xl border border-white/5 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-zinc-500/5 blur-2xl rounded-full" />
          <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-2 relative z-10">Lotes Activos</p>
          <div className="flex items-baseline gap-2 mt-1 relative z-10">
<p className="text-3xl font-black text-white tracking-tighter">{dashboardStats.activeLotsCount}</p>
{desistidoLots.length > 0 && <p className="text-[10px] text-rose-500 font-black">({desistidoLots.length} desistidos)</p>}
          </div>
        </div>
        <div className="bg-[#0a0a0a] p-6 rounded-3xl border border-white/5 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-2xl rounded-full" />
          <p className="text-[9px] font-black text-emerald-500/60 uppercase tracking-[0.3em] mb-2 relative z-10">Recaudado (Empresa)</p>
          <p className="text-2xl font-black text-white tracking-tighter mt-1 relative z-10">{formatCurrency(dashboardStats.totalCollectedSoFar)}</p>
        </div>
        <div className="bg-[#0a0a0a] p-6 rounded-3xl border border-white/5 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 blur-2xl rounded-full" />
          <p className="text-[9px] font-black text-rose-500/60 uppercase tracking-[0.3em] mb-2 relative z-10">A Cobrar Promesa</p>
          <p className="text-2xl font-black text-white tracking-tighter mt-1 relative z-10">{formatCurrency(dashboardStats.totalToCollectNow)}</p>
        </div>
        <div className="bg-[#0a0a0a] p-6 rounded-3xl border border-white/5 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 blur-2xl rounded-full" />
          <p className="text-[9px] font-black text-cyan-500/60 uppercase tracking-[0.3em] mb-2 relative z-10">Cuotas Futuras</p>
          <p className="text-2xl font-black text-white tracking-tighter mt-1 relative z-10">{formatCurrency(dashboardStats.totalFutureQuotas)}</p>
        </div>
        <div className="bg-[#0a0a0a] p-6 rounded-3xl border border-white/5 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-2xl rounded-full" />
          <p className="text-[9px] font-black text-amber-500/60 uppercase tracking-[0.3em] mb-2 relative z-10">Saldo a Escrituras</p>
          <p className="text-2xl font-black text-white tracking-tighter mt-1 relative z-10">{formatCurrency(dashboardStats.totalSaldoEscritura)}</p>
        </div>
      </div>

      <div className="bg-[#0a0a0a] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 bg-black/40">
          <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Resumen Detallado por Lote</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-black/60 text-zinc-500 text-[9px] uppercase tracking-[0.2em] border-b border-white/5">
                <th className="p-5 font-black">Lote / Cliente</th>
                <th className="p-5 font-black text-center">Docs</th>
                <th className="p-5 font-black">Pagado Hist├│rico</th>
                <th className="p-5 font-black text-rose-500">A Cobrar (Promesa)</th>
                <th className="p-5 font-black text-cyan-500">Cuotas Futuras</th>
                <th className="p-5 font-black text-amber-500">Saldo Escritura</th>
                <th className="p-5 font-black text-right">Acci├│n</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sortedLots.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-20 text-center bg-[#0a0a0a]">
                    <FolderOpen className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                    <p className="text-zinc-400 font-black text-lg uppercase tracking-wider">A├║n no hay lotes procesados</p>
                    <p className="text-[10px] text-zinc-600 mt-3 font-bold uppercase tracking-[0.2em]">Haz clic en el bot├│n "Configurar" para comenzar</p>
                  </td>
                </tr>
              )}
              {sortedLots.map(lot => {
                const sigMonth = lot.signatureMonth || projectConfig.signatureMonth;
                const escMonth = lot.escrituraMonth || projectConfig.escrituraMonth;
                const lotFutureMonths = Math.max(0, getMonthsDifference(sigMonth, escMonth));

                const totalInitialExpected = lot.initialPayments?.reduce((acc, p) => acc + Number(p.expected), 0) || 0;
                const totalInitialPaid = lot.initialPayments?.reduce((acc, p) => acc + Number(p.actual), 0) || 0;
                const pastDueInitial = Math.max(0, totalInitialExpected - totalInitialPaid);

                const totalQuotasPaid = lot.payments.reduce((acc, p) => acc + Number(p.actual), 0);
                const pastDueQuotas = lot.payments.reduce((acc, p) => acc + Math.max(0, p.expected - p.actual), 0);
                const tradeIn = lot.tradeInValue || 0;
                const lateFees = lot.lateFees || 0;
                
                const toPayNow = pastDueInitial + pastDueQuotas + lateFees;
                const paid = totalInitialPaid + totalQuotasPaid + tradeIn;
                
                const futureQuotasTotal = lotFutureMonths * lot.expectedQuota;
                const saldoEscritura = Math.max(0, lot.totalPrice - totalInitialPaid - totalQuotasPaid - tradeIn - toPayNow - futureQuotasTotal);

                const isDesistido = lot.status === 'Desistido';

                return (
                  <tr key={lot.id} className={`hover:bg-white/5 transition-colors ${isDesistido ? 'opacity-50' : ''}`}>
                    <td className="p-5">
                      <div className="font-black text-white flex items-center gap-2 tracking-tight">
                        {lot.loteNumber} 
                        {isDesistido && <span className="bg-rose-950 text-rose-500 border border-rose-900 text-[8px] px-2 py-0.5 rounded-lg uppercase font-black tracking-wider">Liberado</span>}
                        {lot.entersRaffle && <Ticket className="w-3 h-3 text-amber-500" title="Participa en Sorteo"/>}
                      </div>
                      <div className={`font-bold text-sm truncate max-w-[200px] ${isDesistido ? 'text-zinc-600 line-through' : 'text-zinc-400'}`} title={lot.clientName}>{lot.clientName}</div>
                      <div className="text-[9px] text-zinc-600 mt-1 font-black uppercase tracking-wider">P. Venta: {formatCurrency(lot.totalPrice)}</div>
                    </td>
                    <td className="p-5 text-center">
                      <span className="bg-black border border-white/10 px-3 py-1.5 rounded-xl text-[10px] font-black text-zinc-500">{lot.documents?.length || 0}</span>
                    </td>
                    <td className="p-5 text-zinc-300 font-bold text-sm">
                      {isDesistido ? (
                        <div>
                          <span className="line-through text-zinc-600">{formatCurrency(paid)}</span>
                          <div className="text-[8px] text-rose-500 font-black mt-1 uppercase tracking-wider">- {formatCurrency(lot.refundAmount || 0)} Devuelto</div>
                        </div>
                      ) : formatCurrency(paid)}
                    </td>
                    <td className="p-5 font-black text-sm">
                      {isDesistido ? <span className="text-zinc-600">-</span> : (toPayNow > 0 ? <span className="text-rose-500">{formatCurrency(toPayNow)} <br/><span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider">En {formatMonthYear(sigMonth)}</span></span> : <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider"><CheckCircle2 className="w-3 h-3 inline mr-1"/> Al d├¡a</span>)}
                    </td>
                    <td className="p-5 font-black text-cyan-500 text-sm">
                      {isDesistido ? <span className="text-zinc-600">-</span> : <>{formatCurrency(futureQuotasTotal)} <span className="text-[9px] font-bold text-cyan-900/50">({lotFutureMonths}m)</span></>}
                    </td>
                    <td className="p-5 font-black text-amber-500 text-sm">
                      {isDesistido ? <span className="text-zinc-600">-</span> : <>{formatCurrency(saldoEscritura)} <br/><span className="text-[9px] font-bold text-amber-900/40 uppercase tracking-wider">En {formatMonthYear(escMonth)}</span></>}
                    </td>
                    <td className="p-5 text-right">
                      <button 
                        onClick={() => { setSelectedLotId(lot.id); setView('detail'); }}
                        className="text-white border border-white/10 px-4 py-2 rounded-xl hover:bg-white/5 hover:border-white/20 transition-all text-[10px] font-black uppercase tracking-[0.2em] mr-2"
                      >
                        Auditar
                      </button>
                      <button 
                        onClick={() => deleteLot(lot.id)}
                        className="text-rose-500/70 hover:text-rose-500 transition-colors p-2 rounded-xl hover:bg-rose-950/30 inline-flex align-middle"
                        title="Eliminar Lote Completamente"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Secci├│n de Lotes Desistidos */}
      {desistidoLots.length > 0 && (
        <div className="bg-[#0a0a0a] rounded-3xl border border-white/5 overflow-hidden shadow-2xl mt-6">
          <button 
            onClick={() => setShowDesistidos(!showDesistidos)}
            className="w-full p-6 border-b border-white/5 bg-black/40 flex items-center justify-between hover:bg-black/60 transition-all"
          >
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">
                Lotes Desistidos ({desistidoLots.length})
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                {showDesistidos ? 'Ocultar' : 'Ver'}
              </span>
              <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${showDesistidos ? 'rotate-180' : ''}`} />
            </div>
          </button>
          
          {showDesistidos && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-black/60 text-zinc-500 text-[9px] uppercase tracking-[0.2em] border-b border-white/5">
                    <th className="p-4 font-black">Lote</th>
                    <th className="p-4 font-black">Cliente</th>
                    <th className="p-4 font-black">Precio</th>
                    <th className="p-4 font-black">Pagado</th>
                    <th className="p-4 font-black">Devoluci├│n</th>
                    <th className="p-4 font-black text-right">Acci├│n</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sortedDesistidoLots.map(lot => {
                    const totalPaid = (lot.initialPayments?.reduce((acc, p) => acc + Number(p.actual), 0) || 0) + 
                                       (lot.payments?.reduce((acc, p) => acc + Number(p.actual), 0) || 0);
                    const refund = lot.refundAmount || 0;
                    const netKept = totalPaid - refund;
                    
                    return (
                      <tr key={lot.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-4 font-bold text-white">{lot.loteNumber}</td>
                        <td className="p-4 text-zinc-400">{lot.clientName || 'Sin cliente'}</td>
                        <td className="p-4 text-zinc-400">{formatCurrency(lot.totalPrice)}</td>
                        <td className="p-4 text-zinc-400">{formatCurrency(totalPaid)}</td>
                        <td className="p-4">
                          <span className={netKept > 0 ? 'text-emerald-400' : 'text-zinc-500'}>
                            {netKept > 0 ? `+${formatCurrency(netKept)} (retenido)` : 'Sin retenci├│n'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => { setSelectedLotId(lot.id); setView('detail'); }}
                            className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-wider"
                          >
                            Ver Detalle
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderDetailView = () => {
    const lot = lots.find(c => c.id === selectedLotId);
    if (!lot) return null;

    const isDesistido = lot.status === 'Desistido';

    // Funci├│n para convertir fechas "YYYY-MM-DD" a "YYYY-MM" para inputs tipo month
    const toMonth = (val) => {
      if (!val) return val;
      if (typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return val.substring(0, 7);
      }
      return val;
    };

    const lotStartMonth = toMonth(lot.startMonth) || projectConfig.startMonth;
    const sigMonth = toMonth(lot.signatureMonth) || projectConfig.signatureMonth;
    const escMonth = toMonth(lot.escrituraMonth) || projectConfig.escrituraMonth;
    const lotFutureMonths = Math.max(0, getMonthsDifference(sigMonth, escMonth));
    const lotSignatureName = formatMonthYear(sigMonth);
    const lotEscrituraName = formatMonthYear(escMonth);

    const totalInitialExpected = lot.initialPayments?.reduce((acc, p) => acc + Number(p.expected), 0) || 0;
    const totalInitialPaid = lot.initialPayments?.reduce((acc, p) => acc + Number(p.actual), 0) || 0;
    const pastDueInitial = Math.max(0, totalInitialExpected - totalInitialPaid);

    const totalQuotasPaid = lot.payments.reduce((acc, curr) => acc + Number(curr.actual), 0);
    const pastDueQuotas = lot.payments.reduce((acc, curr) => acc + Math.max(0, curr.expected - curr.actual), 0);
    
    const tradeIn = lot.tradeInValue || 0;
    const lateFees = lot.lateFees || 0;
    const totalToPayNow = pastDueInitial + pastDueQuotas + lateFees;
    
    const currentExpectedTotal = lot.payments.reduce((acc, p) => acc + Number(p.expected), 0);
    
    const futureQuotasTotal = currentExpectedTotal > 0 ? lot.expectedQuota * lotFutureMonths : 0;
    const saldoEscritura = Math.max(0, lot.totalPrice - totalInitialPaid - totalQuotasPaid - tradeIn - totalToPayNow - futureQuotasTotal);

    const totalPaidSoFar = totalInitialPaid + totalQuotasPaid + tradeIn;
    const paidPercentage = lot.totalPrice > 0 ? (totalPaidSoFar / lot.totalPrice) * 100 : 0;
    const isCommissionReady = paidPercentage >= (lot.commissionTriggerPercent || 30);

    return (
      <div className="max-w-6xl mx-auto mt-8 bg-[#0a0a0a] border border-white/5 rounded-3xl shadow-2xl overflow-hidden animate-fadeIn pb-8">
        
        {/* ESTADO DESISTIDO BANNER */}
        {isDesistido && (
          <div className="bg-rose-900/80 text-white p-4 text-center font-black flex items-center justify-center gap-2 border-b border-rose-950 text-[10px] uppercase tracking-[0.3em]">
            <ShieldAlert className="w-5 h-5"/> LOTE LIBERADO - EL CLIENTE DESISTI├ô DE LA COMPRA
          </div>
        )}

        <div className="bg-black/40 text-white p-6 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-4">
            <button onClick={() => setView('dashboard')} className="p-3 hover:bg-white/5 rounded-2xl transition-all text-zinc-400 hover:text-white border border-white/5">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                Expediente {lot.loteNumber}
              </h1>
            </div>
          </div>
          <div className="text-right hidden sm:flex items-center gap-4">
             <button onClick={() => toggleLotStatus(lot)} className={`px-3 py-1.5 rounded text-xs font-bold transition-colors flex items-center gap-1 ${
               lot.status === 'Activo' ? 'bg-emerald-950/50 hover:bg-emerald-900 border border-emerald-900 text-emerald-300' :
               lot.status === 'Reservado' ? 'bg-amber-950/50 hover:bg-amber-900 border border-amber-900 text-amber-300' :
               lot.status === 'Vendido' ? 'bg-rose-950/50 hover:bg-rose-900 border border-rose-900 text-rose-300' :
               'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700'
             }`}>
               {lot.status === 'Activo' && 'Disponible'}
               {lot.status === 'Reservado' && 'Reservado'}
               {lot.status === 'Vendido' && 'Vendido'}
               {lot.status === 'Desistido' && <><RotateCcw className="w-3 h-3"/> Reactivar</>}
               {lot.status !== 'Desistido' && ' ÔåÆ'}
             </button>
             {!isDesistido && (
               <div>
                 <div className="text-sm text-zinc-500 uppercase font-bold">A Cobrar ({lotSignatureName})</div>
                 <div className={`text-2xl font-bold ${totalToPayNow > 0 ? 'text-rose-500' : 'text-emerald-400'}`}>
                    {totalToPayNow > 0 ? formatCurrency(totalToPayNow) : 'AL D├ìA'}
                 </div>
               </div>
             )}
          </div>
        </div>

        <div className={`p-6 space-y-6 ${isDesistido ? 'opacity-70' : ''}`}>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            <div className="space-y-6">
              
              <div className="bg-zinc-950/50 p-5 rounded-xl border border-zinc-800 shadow-sm">
                <h3 className="font-semibold text-white border-b border-zinc-800 pb-2 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-rose-500" /> Propietarios ({lot.owners?.length || 0})
                </h3>
                <div className="space-y-4">
                  {lot.owners?.map((owner, idx) => (
                    <div key={owner.id} className="relative p-3 bg-zinc-900 border border-zinc-800 rounded-lg">
                      {idx > 0 && (
                        <button onClick={() => removeOwner(owner.id)} className="absolute top-2 right-2 text-rose-500/70 hover:text-rose-500"><X className="w-4 h-4"/></button>
                      )}
                      <div className="space-y-2">
                        <div>
                          <label className="text-[9px] font-bold text-zinc-500 uppercase block mb-0.5">Nombre Completo</label>
                          <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded px-2 focus-within:border-rose-500">
                            <User className="w-3 h-3 text-zinc-500 mr-1" />
                            <input type="text" value={owner.name} onChange={(e) => updateOwner(owner.id, 'name', e.target.value)} className="w-full p-1 text-xs outline-none bg-transparent text-white" placeholder="Nombre del titular" />
                          </div>
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-zinc-500 uppercase block mb-0.5">C.I. / Pasaporte</label>
                          <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded px-2 focus-within:border-rose-500">
                            <CreditCard className="w-3 h-3 text-zinc-500 mr-1" />
                            <input type="text" value={owner.documentId || ''} onChange={(e) => updateOwner(owner.id, 'documentId', e.target.value)} className="w-full p-1 text-xs outline-none uppercase bg-transparent text-white" placeholder="N├║mero de Identidad" />
                          </div>
                        </div>
                        <div className="flex gap-2">
                           <div className="flex-1">
                              <label className="text-[9px] font-bold text-zinc-500 uppercase block mb-0.5">Tel├®fono</label>
                              <div className="flex bg-zinc-950 border border-zinc-800 rounded overflow-hidden focus-within:border-rose-500">
                                <select value={owner.phoneCode} onChange={(e) => updateOwner(owner.id, 'phoneCode', e.target.value)} className="bg-zinc-900 border-r border-zinc-800 text-xs px-1 outline-none w-16 text-zinc-300">
                                  {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                                </select>
                                <div className="flex items-center px-1 flex-1">
                                  <Phone className="w-3 h-3 text-zinc-500 mr-1" />
                                  <input type="tel" value={owner.phone} onChange={(e) => updateOwner(owner.id, 'phone', e.target.value)} className="w-full p-1 text-xs outline-none bg-transparent text-white" placeholder="099..." />
                                </div>
                              </div>
                           </div>
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-zinc-500 uppercase block mb-0.5">Correo Electr├│nico</label>
                          <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded px-2 focus-within:border-rose-500">
                            <Mail className="w-3 h-3 text-zinc-500 mr-1" />
                            <input type="email" value={owner.email} onChange={(e) => updateOwner(owner.id, 'email', e.target.value)} className="w-full p-1 text-xs outline-none bg-transparent text-white" placeholder="correo@ejemplo.com" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button onClick={addOwner} className="flex items-center gap-1 text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors w-full justify-center border border-dashed border-zinc-700 rounded p-2 hover:bg-zinc-800">
                    <PlusCircle className="w-4 h-4" /> A├▒adir otro titular
                  </button>
                  
                  <div className="pt-3 border-t border-zinc-800 mt-3">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-1 mb-2"><UserCheck className="w-4 h-4 text-emerald-500"/> Apoderado / Contacto Alterno</label>
                    <div className="space-y-2">
                      <input type="text" value={lot.alternateContact?.name || ''} onChange={(e) => updateSelectedLot({ alternateContact: { ...lot.alternateContact, name: e.target.value } })} className="w-full p-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded outline-none focus:border-rose-500 text-white placeholder-zinc-600" placeholder="Nombre del apoderado (Opcional)" />
                      <div className="flex bg-zinc-900 border border-zinc-800 rounded overflow-hidden focus-within:border-rose-500">
                        <select value={lot.alternateContact?.phoneCode || '+593'} onChange={(e) => updateSelectedLot({ alternateContact: { ...lot.alternateContact, phoneCode: e.target.value } })} className="bg-zinc-950 border-r border-zinc-800 text-xs px-1 outline-none w-16 text-zinc-300">
                          {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                        </select>
                        <input type="tel" value={lot.alternateContact?.phone || ''} onChange={(e) => updateSelectedLot({ alternateContact: { ...lot.alternateContact, phone: e.target.value } })} className="w-full p-1.5 text-xs bg-transparent outline-none text-white placeholder-zinc-600" placeholder="Tel├®fono (Opcional)" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-950/50 p-5 rounded-xl border border-zinc-800 shadow-sm">
                <h3 className="font-semibold text-white border-b border-zinc-800 pb-2 mb-4 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-rose-500" /> Contractual
                </h3>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-[11px] font-bold text-zinc-500 uppercase">Precio Total Lote ($)</label>
                      <input type="number" value={lot.totalPrice} onChange={(e) => updateSelectedLot({ totalPrice: Number(e.target.value) })} className="w-full p-2 border border-zinc-700 rounded-md bg-zinc-900 font-bold text-white focus:border-rose-500 outline-none" />
                    </div>
                    <div className="w-1/3">
                      <label className="text-[11px] font-bold text-zinc-500 uppercase">├ürea ($m^2$)</label>
                      <div className="relative">
                        <Ruler className="w-4 h-4 text-zinc-500 absolute left-2 top-2.5" />
                        <input type="number" value={lot.lotArea || ''} onChange={(e) => updateSelectedLot({ lotArea: Number(e.target.value) })} className="w-full p-2 pl-8 border border-zinc-700 rounded-md bg-zinc-900 font-bold text-white focus:border-rose-500 outline-none" placeholder="0" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-zinc-500 uppercase">Cuota Mensual Predominante ($)</label>
                      {lot.expectedQuota === 0 && <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-bold">Pago por hitos</span>}
                    </div>
                    <input type="number" value={lot.expectedQuota} onChange={(e) => {
                        const val = Number(e.target.value);
                        updateSelectedLot({ expectedQuota: val });
                      }} className="w-full p-2 border border-zinc-700 rounded-md bg-zinc-900 font-bold text-white mt-1 focus:border-rose-500 outline-none" />
                  </div>
                  <div className="pt-3 border-t border-zinc-800">
                    <label className="text-[11px] font-bold text-purple-400 uppercase flex items-center gap-1"><Gift className="w-3 h-3"/> Descuentos / Canjes ($)</label>
                    <input type="number" value={lot.tradeInValue || ''} onChange={(e) => updateSelectedLot({ tradeInValue: Number(e.target.value) })} className="w-full p-2 border border-purple-900/50 rounded-md bg-purple-950/20 font-bold text-purple-400 focus:border-purple-500 outline-none" placeholder="0" />
                    <p className="text-[9px] text-zinc-500 mt-1">Se resta del saldo a escriturar. ├Ütil para bonos o comisiones pagadas con el lote.</p>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-950/10 p-5 rounded-xl border border-emerald-900/30 shadow-sm">
                <h3 className="font-semibold text-emerald-400 border-b border-emerald-900/50 pb-2 mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5" /> M├│dulo Comercial (Asesor)
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-emerald-600 uppercase">Asesor / Vendedor Responsable</label>
                    <input type="text" value={lot.agentName || ''} onChange={(e) => updateSelectedLot({ agentName: e.target.value })} className="w-full p-2 border border-emerald-900/50 rounded-md bg-zinc-950 font-medium text-emerald-400 focus:border-emerald-500 outline-none placeholder-zinc-700" placeholder="Nombre del asesor" />
                  </div>
                  
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-emerald-600 uppercase block mb-1">Comisi├│n a pagar</label>
                      <div className="flex bg-zinc-950 border border-emerald-900/50 rounded overflow-hidden focus-within:border-emerald-500">
                        <select value={lot.commissionType} onChange={(e) => updateSelectedLot({ commissionType: e.target.value })} className="bg-emerald-950/50 border-r border-emerald-900/50 text-xs px-1 outline-none font-bold text-emerald-500 w-12">
                          <option value="percentage">%</option>
                          <option value="fixed">$</option>
                        </select>
                        <input type="number" value={lot.commissionValue || ''} onChange={(e) => updateSelectedLot({ commissionValue: Number(e.target.value) })} className="w-full p-2 text-sm font-bold text-emerald-400 outline-none bg-transparent" placeholder="0" />
                      </div>
                    </div>
                    <div className="w-1/2">
                      <label className="text-[10px] font-bold text-emerald-600 uppercase block mb-1">Se libera al (%)</label>
                      <div className="relative">
                        <input type="number" value={lot.commissionTriggerPercent} onChange={(e) => updateSelectedLot({ commissionTriggerPercent: Number(e.target.value) })} className="w-full p-2 pr-6 border border-emerald-900/50 rounded-md bg-zinc-950 font-bold text-emerald-400 focus:border-emerald-500 outline-none" />
                        <Percent className="w-3 h-3 text-emerald-700 absolute right-2 top-2.5" />
                      </div>
                    </div>
                  </div>

                  {lot.agentName && (
                    <div className="mt-3 p-3 bg-zinc-900 rounded border border-emerald-900/30">
                      <div className="flex justify-between text-[10px] uppercase font-bold text-zinc-500 mb-1">
                        <span>Progreso del Pago: {paidPercentage.toFixed(1)}%</span>
                        <span>Meta: {lot.commissionTriggerPercent}%</span>
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-1.5 mb-2 overflow-hidden">
                        <div className={`h-1.5 rounded-full ${isCommissionReady ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${Math.min(100, (paidPercentage / lot.commissionTriggerPercent) * 100)}%` }}></div>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs font-bold text-emerald-400">
                          Pago Asesor: {lot.commissionType === 'percentage' ? formatCurrency(lot.totalPrice * ((lot.commissionValue || 0)/100)) : formatCurrency(lot.commissionValue || 0)}
                        </span>
                        {isCommissionReady ? (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded uppercase font-bold">Ô£ô Liberada</span>
                        ) : (
                          <span className="text-[10px] bg-amber-500/20 text-amber-500 border border-amber-500/30 px-2 py-0.5 rounded uppercase font-bold">ÔÅ│ Pendiente</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-amber-950/10 p-5 rounded-xl border border-amber-900/30 shadow-sm">
                <h3 className="font-semibold text-amber-500 border-b border-amber-900/50 pb-2 mb-4 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" /> Tiempos de este Cliente
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-amber-600/70 uppercase">Mes de Inicio (Cuota 1)</label>
                    <input type="month" value={lotStartMonth} onChange={(e) => handleLotDateChange('startMonth', e.target.value)} className="w-full p-2 border border-amber-900/50 rounded-md bg-zinc-950 font-medium text-amber-400 focus:border-amber-500 outline-none color-invert" />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-amber-600/70 uppercase">Mes Firma Promesa (Cobro)</label>
                    <input type="month" value={sigMonth} onChange={(e) => handleLotDateChange('signatureMonth', e.target.value)} className="w-full p-2 border border-amber-900/50 rounded-md bg-zinc-950 font-medium text-amber-400 focus:border-amber-500 outline-none color-invert" />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-amber-600/70 uppercase">Mes Firma Escritura (Final)</label>
                    <input type="month" value={escMonth} onChange={(e) => updateSelectedLot({ escrituraMonth: e.target.value })} className="w-full p-2 border border-amber-900/50 rounded-md bg-zinc-950 font-medium text-amber-400 focus:border-amber-500 outline-none color-invert" />
                  </div>
                </div>
              </div>

              {/* PANEL DE DOCUMENTOS CON DRAG & DROP */}
              <div className="bg-zinc-950/50 p-5 rounded-xl border border-zinc-800 shadow-sm">
                <h3 className="font-semibold text-white border-b border-zinc-800 pb-2 mb-4 flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-rose-500" /> Documentos del Expediente
                </h3>
                <div className="space-y-3">
                  <div className="max-h-32 overflow-y-auto space-y-1 mb-3 scrollbar-thin">
                    {lot.documents && lot.documents.length > 0 ? (
                      lot.documents.map((doc, idx) => (
                        <div key={idx} className="text-[10px] text-zinc-300 bg-zinc-900 p-1.5 rounded border border-zinc-800 truncate flex items-center gap-2">
                           {doc.type === 'contrato' ? <FileText className="w-3 h-3 text-rose-500 shrink-0"/> : <Receipt className="w-3 h-3 text-emerald-400 shrink-0"/>}
                           {doc.name}
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] text-zinc-600 italic">No hay documentos subidos.</p>
                    )}
                  </div>
                  
                  <label 
                    onDragOver={(e) => { preventDefault(e); setIsDragSingle(true); }}
                    onDragLeave={(e) => { preventDefault(e); setIsDragSingle(false); }}
                    onDrop={(e) => { preventDefault(e); setIsDragSingle(false); handleSingleLotUpload(e); }}
                    className={`w-full flex flex-col items-center justify-center p-3 border-2 border-dashed rounded-lg text-xs font-bold transition-colors cursor-pointer 
                      ${isProcessingSingleLot ? 'border-zinc-700 text-zinc-500 bg-zinc-900/50 cursor-not-allowed' : 
                        (isDragSingle ? 'border-rose-500 bg-rose-950/20 text-rose-400 scale-105' : 'border-zinc-700 text-zinc-400 hover:bg-zinc-900 hover:text-white bg-zinc-950 shadow-sm')}`}
                  >
                    {isProcessingSingleLot ? (
                      <div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin"></div> Analizando...</div>
                    ) : (
                      <><UploadCloud className={`w-5 h-5 mb-1 ${isDragSingle ? 'text-rose-500' : ''}`} /> Arrastra o Sube Recibos/Contrato</>
                    )}
                    <input type="file" multiple accept=".pdf,image/*" className="hidden" disabled={isProcessingSingleLot} onChange={handleSingleLotUpload} />
                  </label>
                </div>
              </div>
            </div>

            <div className="xl:col-span-2 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800 flex flex-col justify-between shadow-sm">
                    <div className="mb-3">
                      <h4 className="font-semibold text-white flex items-center gap-2 mb-1"><MessageSquare className="w-4 h-4 text-rose-500" /> Bit├ícora y Observaciones Legales</h4>
                    </div>
                    <textarea 
                      value={lot.specialObservations || ''} 
                      onChange={(e) => updateSelectedLot({ specialObservations: e.target.value })}
                      placeholder="Anota aqu├¡ las renegociaciones, si dejar├ín de pagar un mes y acumular├ín en otro, promesas de p├│lizas, etc."
                      className="w-full h-full min-h-[80px] p-3 text-xs border border-zinc-800 rounded outline-none resize-none bg-zinc-900 text-zinc-300 focus:border-rose-500 focus:bg-zinc-950 placeholder-zinc-600 transition-colors"
                    ></textarea>

                    <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-400">­ƒÄ½ Participa en Sorteo Especial</span>
                      <button 
                        onClick={() => updateSelectedLot({ entersRaffle: !lot.entersRaffle })}
                        className={`w-10 h-5 rounded-full relative transition-colors ${lot.entersRaffle ? 'bg-amber-500' : 'bg-zinc-700'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${lot.entersRaffle ? 'left-5' : 'left-1'}`}></div>
                      </button>
                    </div>
                </div>

                <div className="bg-rose-950/10 p-4 rounded-xl border border-rose-900/30 shadow-sm flex flex-col">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-rose-400 flex items-center gap-2"><Bell className="w-4 h-4"/> Recordatorios</h4>
                    <button onClick={addReminder} className="text-rose-500 hover:text-rose-400 text-[10px] font-bold uppercase flex items-center gap-1 bg-rose-950/50 px-2 py-1 rounded border border-rose-900/50">
                      <PlusCircle className="w-3 h-3" /> Nuevo
                    </button>
                  </div>
                  <div className="space-y-2 flex-1 overflow-y-auto max-h-32 pr-1 scrollbar-thin">
                    {lot.reminders?.map((rem) => (
                      <div key={rem.id} className="flex items-start gap-2 bg-zinc-900 p-2 rounded border border-zinc-800">
                        <button onClick={() => updateReminder(rem.id, 'completed', !rem.completed)} className="mt-0.5 text-rose-500">
                          {rem.completed ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-zinc-600" />}
                        </button>
                        <div className="flex-1 flex flex-col gap-1">
                          <input type="text" value={rem.text} onChange={(e) => updateReminder(rem.id, 'text', e.target.value)} placeholder="Ej: Llamar para cobro de p├│liza" className={`text-xs w-full outline-none bg-transparent ${rem.completed ? 'line-through text-zinc-600' : 'text-zinc-200 font-medium'}`} />
                          <div className="flex items-center gap-1">
                            <CalendarDays className="w-3 h-3 text-zinc-600" />
                            <input type="date" value={rem.date} onChange={(e) => updateReminder(rem.id, 'date', e.target.value)} className="text-[9px] text-zinc-500 outline-none bg-transparent cursor-pointer color-invert" />
                          </div>
                        </div>
                        <button onClick={() => removeReminder(rem.id)} className="text-zinc-600 hover:text-rose-500"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                    {(!lot.reminders || lot.reminders.length === 0) && (
                      <p className="text-xs text-zinc-600 italic text-center mt-4">Sin recordatorios pendientes.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* SECCI├ôN 1: ABONOS INICIALES / RESERVA */}
              <div className="bg-zinc-950/50 p-5 rounded-xl border border-zinc-800 shadow-sm">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3 mb-4">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-500"/> 1. Entradas y Reservas
                  </h3>
                  <div className="text-sm text-zinc-400">
                    Suma Pagada: <span className="font-bold text-white">{formatCurrency(totalInitialPaid)}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {lot.initialPayments?.map((ip) => (
                    <div key={ip.id} className={`flex flex-col md:flex-row items-center gap-3 p-3 rounded-lg border ${ip.expected > 0 && ip.actual < ip.expected ? 'bg-rose-950/10 border-rose-900/50' : 'bg-zinc-900 border-zinc-800'}`}>
                      <div className="w-full md:w-1/3">
                         <input type="text" placeholder="Ej: Reserva" value={ip.description} onChange={(e) => updateInitialPayment(ip.id, 'description', e.target.value)} className="w-full p-2 text-sm font-bold text-zinc-200 bg-transparent border-b border-zinc-700 outline-none focus:border-rose-500" />
                      </div>
                      <div className="flex gap-2 w-full md:w-auto flex-1">
                         <div className="flex-1">
                            <label className="text-[9px] font-bold text-zinc-500 uppercase block mb-1">Esperado ($)</label>
                            <input type="number" value={ip.expected === 0 ? '' : ip.expected} placeholder="0" onChange={(e) => updateInitialPayment(ip.id, 'expected', Number(e.target.value))} className="w-full p-1.5 text-sm bg-zinc-950 border border-zinc-700 rounded outline-none focus:border-rose-500 text-white" />
                         </div>
                         <div className="flex-1">
                            <label className="text-[9px] font-bold text-zinc-500 uppercase block mb-1">Pagado ($)</label>
                            <input type="number" value={ip.actual === 0 ? '' : ip.actual} placeholder="0" onChange={(e) => updateInitialPayment(ip.id, 'actual', Number(e.target.value))} className={`w-full p-1.5 text-sm font-bold bg-zinc-950 border rounded outline-none focus:border-rose-500 ${ip.actual >= ip.expected && ip.expected > 0 ? 'text-emerald-400 border-emerald-500/50' : 'text-white border-zinc-700'}`} />
                         </div>
                      </div>
                      <div className="w-full md:w-1/4 flex flex-col gap-1">
                         <input type="date" value={ip.paymentDate || ''} onChange={(e) => updateInitialPayment(ip.id, 'paymentDate', e.target.value)} className="w-full text-[10px] text-zinc-300 bg-zinc-950 border border-zinc-700 rounded p-1 outline-none cursor-pointer color-invert" />
                         <label className="cursor-pointer text-[9px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700 px-2 py-1 rounded hover:bg-zinc-700 transition-colors text-center truncate" title={ip.receiptAttached}>
                           {ip.receiptAttached ? `Ô£ô ${ip.receiptAttached}` : '­ƒôÄ Subir Comp.'}
                           <input type="file" accept=".pdf,image/*" className="hidden" onChange={(e) => {
                              if(e.target.files[0]) updateInitialPayment(ip.id, 'receiptAttached', e.target.files[0].name);
                           }} />
                         </label>
                      </div>
                      <button onClick={() => removeInitialPayment(ip.id)} className="text-zinc-600 hover:text-rose-500 p-2 transition-colors"><MinusCircle className="w-4 h-4"/></button>
                    </div>
                  ))}
                  {(!lot.initialPayments || lot.initialPayments.length === 0) && (
                    <p className="text-sm text-zinc-600 italic text-center p-4">No hay abonos iniciales registrados.</p>
                  )}
                  <button onClick={addInitialPayment} className="flex items-center gap-1 text-sm font-bold text-rose-500 hover:text-rose-400 transition-colors mt-2">
                    <PlusCircle className="w-4 h-4" /> Agregar parte de entrada
                  </button>
                </div>
              </div>

              {/* SECCI├ôN 2: HIST├ôRICO DE CUOTAS (COLAPSABLE) */}
              <div className="bg-zinc-950/50 rounded-xl border border-zinc-800 shadow-sm overflow-hidden">
                <div 
                  className={`flex justify-between items-center p-5 cursor-pointer hover:bg-zinc-900 transition-colors ${lot.showQuotas ? 'border-b border-zinc-800' : ''}`}
                  onClick={() => updateSelectedLot({ showQuotas: !lot.showQuotas })}
                >
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5 text-cyan-500"/> 2. Hist├│rico de Cuotas
                    </h3>
                    <span className="text-[10px] bg-zinc-800 text-zinc-300 border border-zinc-700 px-2 py-0.5 rounded-full font-bold">
                      {lot.showQuotas ? 'Ocultar' : 'Ver Detalle'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-zinc-400">
                    <div className="hidden sm:block">Suma en Cuotas: <span className="font-bold text-white">{formatCurrency(totalQuotasPaid)}</span></div>
                    {lot.showQuotas ? <ChevronUp className="w-5 h-5 text-zinc-500" /> : <ChevronDown className="w-5 h-5 text-zinc-500" />}
                  </div>
                </div>

                {lot.showQuotas && (
                  <div className="p-5 bg-zinc-900/50">
                    <div className="flex justify-end mb-4">
                      <button onClick={clearAllPayments} className="flex items-center gap-1 text-[10px] bg-rose-950/30 text-rose-500 hover:bg-rose-900/50 px-3 py-1.5 rounded border border-rose-900/50 transition-colors font-bold uppercase shadow-sm">
                        <Eraser className="w-3 h-3" /> Limpiar Cuotas
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {lot.payments.map((payment) => {
                        let bgColor = 'bg-zinc-900 border-zinc-800';
                        let textColor = 'text-white';
                        let badge = null;

                        if (payment.actual === 0 && payment.expected > 0) {
                          bgColor = 'bg-rose-950/20 border-rose-900/50';
                          textColor = 'text-rose-400';
                          badge = <span className="absolute top-0 right-0 bg-rose-600 text-white text-[9px] px-2 py-0.5 rounded-bl-lg font-bold">Adeudada</span>;
                        } else if (payment.actual > 0 && payment.actual < payment.expected) {
                          bgColor = 'bg-amber-950/20 border-amber-900/50';
                          textColor = 'text-amber-400';
                          badge = <span className="absolute top-0 right-0 bg-amber-500 text-amber-950 text-[9px] px-2 py-0.5 rounded-bl-lg font-bold">Incompleta</span>;
                        } else if (payment.actual >= payment.expected && payment.actual > 0) {
                          bgColor = 'bg-emerald-950/20 border-emerald-900/50';
                          textColor = 'text-emerald-400';
                          badge = <span className="absolute top-0 right-0 bg-emerald-500/20 border-b border-l border-emerald-500/50 text-emerald-400 text-[9px] px-2 py-0.5 rounded-bl-lg font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Pagado</span>;
                        }

                        return (
                          <div key={payment.id} className={`border rounded-xl p-3 relative transition-all flex flex-col ${bgColor}`}>
                            {badge}
                            <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">{payment.month}</div>
                            
                            <div className="flex items-center justify-between gap-1 mb-2">
                              <div className="w-1/2">
                                 <label className="text-[8px] font-bold text-zinc-600 uppercase block mb-0.5">Esperado ($)</label>
                                 <input 
                                   type="number" 
                                   value={payment.expected} 
                                   onChange={(e) => updatePaymentField(payment.id, 'expected', Number(e.target.value))}
                                   className="w-full p-1 text-xs border-b border-zinc-700 outline-none bg-transparent focus:border-rose-500 text-zinc-300"
                                 />
                              </div>
                              <div className="w-1/2 text-right">
                                 <label className="text-[8px] font-bold text-zinc-600 uppercase block mb-0.5">Pagado ($)</label>
                                 <input 
                                   type="number" 
                                   value={payment.actual === 0 ? '' : payment.actual} 
                                   placeholder="0"
                                   onChange={(e) => updatePaymentField(payment.id, 'actual', Number(e.target.value))}
                                   className={`w-full p-1 border-b outline-none text-lg font-bold bg-transparent focus:border-rose-500 text-right ${textColor} ${payment.actual === 0 ? 'border-zinc-700' : 'border-transparent'}`}
                                 />
                              </div>
                            </div>
                            
                            <div className="mt-auto border-t border-zinc-800/60 pt-2 space-y-2">
                               <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                                     <CalendarDays className="w-3 h-3" /> D├¡a:
                                  </div>
                                  <input 
                                     type="date" 
                                     value={payment.paymentDate || ''} 
                                     onChange={(e) => updatePaymentField(payment.id, 'paymentDate', e.target.value)}
                                     className="text-[10px] text-zinc-400 bg-zinc-950 border border-zinc-700 rounded p-0.5 outline-none cursor-pointer focus:border-rose-500 color-invert"
                                  />
                               </div>

                               <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                                     <Paperclip className="w-3 h-3" /> Comp:
                                  </div>
                                  <label className="cursor-pointer text-[9px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700 px-2 py-1 rounded hover:bg-zinc-700 transition-colors">
                                     {payment.receiptAttached ? 'Cambiar' : 'Subir'}
                                     <input type="file" accept=".pdf,image/*" className="hidden" onChange={(e) => {
                                        if(e.target.files[0]) {
                                           updatePaymentField(payment.id, 'receiptAttached', e.target.files[0].name);
                                        }
                                     }} />
                                 </label>
                               </div>
                               {payment.receiptAttached && (
                                  <div className="text-[9px] text-emerald-400 font-medium truncate mt-1 bg-emerald-950/30 p-1 rounded border border-emerald-900/50" title={payment.receiptAttached}>
                                     Ô£ô {payment.receiptAttached}
                                  </div>
                               )}
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-zinc-800">
            
            <div className={`p-6 rounded-2xl flex flex-col justify-center border border-zinc-800 ${isDesistido ? 'bg-zinc-950 opacity-50' : (totalToPayNow > 0 ? 'bg-rose-950/10 border-rose-900/30' : 'bg-emerald-950/10 border-emerald-900/30')}`}>
              <div className="flex justify-between items-center mb-4">
                <h4 className={`text-sm font-bold uppercase tracking-wider ${isDesistido ? 'text-zinc-500' : (totalToPayNow > 0 ? 'text-rose-500' : 'text-emerald-500')}`}>
                  Liquidaci├│n (Firma de Promesa)
                </h4>
                {/* NUEVO: Campo Intereses por Mora */}
                {!isDesistido && (
                  <div className="bg-zinc-950 px-2 py-1 rounded border border-zinc-700 flex items-center gap-1 shadow-sm focus-within:border-rose-500 transition-colors">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Mora ($)</span>
                    <input type="number" value={lot.lateFees === 0 ? '' : lot.lateFees} placeholder="0" onChange={(e) => updateSelectedLot({ lateFees: Number(e.target.value) })} className="w-16 outline-none font-bold text-rose-500 text-right bg-transparent" />
                  </div>
                )}
              </div>
              
              <div className="space-y-2 mb-4">
                {pastDueInitial > 0 && (
                  <div className="flex justify-between text-sm text-zinc-400 border-b border-zinc-800 border-dashed pb-1">
                    <span>Deuda de Entradas/Reserva:</span>
                    <span className="font-semibold text-rose-500">{formatCurrency(pastDueInitial)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-zinc-400 border-b border-zinc-800 border-dashed pb-1">
                  <span>Deuda de Cuotas Atrasadas:</span>
                  <span className="font-semibold text-white">{formatCurrency(pastDueQuotas)}</span>
                </div>
                {lot.lateFees > 0 && !isDesistido && (
                  <div className="flex justify-between text-sm text-zinc-400 border-b border-zinc-800 border-dashed pb-1">
                    <span>Intereses por Mora aplicados:</span>
                    <span className="font-semibold text-rose-500">{formatCurrency(lot.lateFees)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-end mt-4">
                <span className={`text-lg font-bold ${isDesistido ? 'text-zinc-600' : (totalToPayNow > 0 ? 'text-rose-600' : 'text-emerald-600')}`}>TOTAL A PAGAR:</span>
                <div className={`text-4xl font-black tracking-tight ${isDesistido ? 'text-zinc-600' : (totalToPayNow > 0 ? 'text-rose-500' : 'text-emerald-400')}`}>
                  {isDesistido ? '$0,00' : formatCurrency(totalToPayNow)}
                </div>
              </div>
            </div>

            <div className={`bg-black text-white rounded-2xl p-6 relative overflow-hidden shadow-lg border border-zinc-800 ${isDesistido ? 'opacity-80' : ''}`}>
              <Calculator className="absolute -right-6 -bottom-6 w-32 h-32 text-zinc-800 opacity-30" />
              <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-zinc-400 relative z-10">Matem├ítica del Contrato</h3>
              
              <div className="space-y-1 text-sm text-zinc-300 relative z-10 font-mono">
                <div className="flex justify-between"><span>Precio de Venta:</span> <span className="text-white">{formatCurrency(lot.totalPrice)}</span></div>
                <div className="flex justify-between text-emerald-400"><span>(-) Total Entradas Pagadas:</span> <span>-{formatCurrency(totalInitialPaid)}</span></div>
                <div className="flex justify-between text-emerald-400"><span>(-) Total Cuotas Pagadas:</span> <span>-{formatCurrency(totalQuotasPaid)}</span></div>
                {tradeIn > 0 && <div className="flex justify-between text-purple-400"><span>(-) Descuentos/Canjes Aplicados:</span> <span>-{formatCurrency(tradeIn)}</span></div>}
                
                {isDesistido ? (
                  <>
                    <div className="flex justify-between text-rose-400 border-b border-zinc-800 pb-2 mt-2"><span>(+) Devoluci├│n al Cliente:</span> <span>{formatCurrency(lot.refundAmount || 0)}</span></div>
                    <div className="flex justify-between pt-2 text-amber-500"><span>Retenci├│n de Penalidad:</span> <span>{formatCurrency((totalInitialPaid + totalQuotasPaid) - (lot.refundAmount || 0))}</span></div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between text-amber-500 border-b border-zinc-800 pb-2"><span>(-) Saldo a firma de promesa:</span> <span>-{formatCurrency(totalToPayNow)}</span></div>
                    <div className="flex justify-between pt-2 text-zinc-500"><span>(-) Cuotas Futuras ({lotFutureMonths}m):</span> <span>-{formatCurrency(futureQuotasTotal)}</span></div>
                  </>
                )}
              </div>

              {!isDesistido && (
                <div className="mt-4 pt-3 border-t border-zinc-700 flex justify-between items-center relative z-10">
                  <span className="font-bold text-cyan-400">SALDO A ESCRITURA ({lotEscrituraName}):</span>
                  <span className="text-2xl font-black text-cyan-400">{formatCurrency(saldoEscritura)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 bg-zinc-950/50 border border-zinc-800 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-rose-500" />
                  {isDesistido ? 'Generar Documento de Resoluci├│n' : 'Redactar Notificaci├│n de Cobro'}
                </h3>
                
                {!isDesistido && (
                  <>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase mb-2 block">Tono del Mensaje / Remitente</label>
                    <div className="flex flex-wrap gap-2">
                      {['Administraci├│n', 'Asesor Comercial', 'Gerente General', 'Departamento Legal'].map(tone => (
                        <button
                          key={tone}
                          onClick={() => setMessageTone(tone)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${messageTone === tone ? 'bg-rose-600 text-white shadow-md' : 'bg-zinc-900 text-zinc-300 border border-zinc-800 hover:bg-zinc-800'}`}
                        >
                          {tone}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
                {!isDesistido && (
                  <button onClick={() => handlePrintContract(lot)} className="flex items-center justify-center gap-2 px-4 py-3 bg-zinc-900 text-zinc-300 border border-zinc-700 hover:bg-zinc-800 hover:text-white rounded-lg font-bold transition-all shadow-sm">
                    <Printer className="w-4 h-4" /> Generar Contrato
                  </button>
                )}
                <button
                  onClick={generateMessageForClient}
                  disabled={isGeneratingMessage}
                  className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold transition-all shadow-sm
                    ${isGeneratingMessage ? 'bg-rose-900/50 text-rose-200 cursor-not-allowed' : 'bg-rose-600 text-white hover:bg-rose-700 hover:shadow-lg hover:shadow-rose-900/20'}`}
                >
                  {isGeneratingMessage ? 'Redactando...' : 'Generar Mensaje IA'}
                </button>
              </div>
            </div>

            {lot.generatedMessage && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-inner relative animate-fadeIn overflow-hidden mt-4">
                <div className="bg-zinc-950/80 border-b border-zinc-800 px-4 py-3 flex flex-wrap gap-2 justify-between items-center">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Borrador Final {isDesistido ? '(Legal)' : `(${messageTone})`}</span>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => { fallbackCopyTextToClipboard(lot.generatedMessage); showAlert('├ëxito', '┬íCopiado al portapapeles!'); }} className="px-3 py-1.5 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700 rounded text-xs font-bold transition-colors">Copiar Texto</button>
                    {!isDesistido && (
                      <>
                        <button onClick={() => handleSendWhatsApp(lot)} className="px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-500 rounded text-xs font-bold transition-colors flex items-center gap-1 shadow-md shadow-emerald-900/20"><MessageCircle className="w-3 h-3"/> WhatsApp</button>
                        <button onClick={() => handleSendEmail(lot)} className="px-3 py-1.5 bg-rose-600 text-white hover:bg-rose-500 rounded text-xs font-bold transition-colors flex items-center gap-1 shadow-md shadow-rose-900/20"><Mail className="w-3 h-3"/> Correo</button>
                      </>
                    )}
                  </div>
                </div>
                <textarea
                  value={lot.generatedMessage}
                  onChange={(e) => updateSelectedLot({ generatedMessage: e.target.value })}
                  className="w-full min-h-[180px] p-5 text-zinc-300 bg-transparent border-none outline-none resize-y leading-relaxed font-mono text-sm"
                />
              </div>
            )}
          </div>

        </div>
      </div>
    );
  };

  const renderRaffleView = () => {
    const participants = lots.filter(l => l.entersRaffle && l.status === 'Activo');

    return (
      <div className="max-w-6xl mx-auto mt-6 space-y-6 animate-fadeIn">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-black text-rose-500 flex items-center gap-3">
              <Trophy className="w-8 h-8" /> Sorteos Especiales
            </h2>
            <p className="text-zinc-400 mt-1">Realiza sorteos aleatorios criptogr├íficamente seguros para tus clientes calificados.</p>
          </div>
          <button onClick={() => setView('dashboard')} className="text-zinc-400 hover:text-white font-bold text-sm flex items-center gap-1 transition-colors">
            <ChevronLeft className="w-4 h-4"/> Volver al Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-zinc-900 rounded-2xl shadow-xl overflow-hidden border border-zinc-800 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-950/20 to-black opacity-50"></div>
              
              <div className="relative z-10 p-8 flex flex-col items-center justify-center min-h-[400px]">
                {raffleState.status === 'idle' && (
                  <div className="text-center">
                    <Dices className="w-24 h-24 text-rose-500/50 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-white mb-2">┬┐Listo para el sorteo?</h3>
                    <p className="text-zinc-400 mb-6 max-w-md mx-auto">Hay <strong>{participants.length}</strong> clientes activos marcados con un ticket de participaci├│n.</p>
                    
                    <div className="mb-8 flex items-center justify-center gap-3">
                      <label className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Duraci├│n del Sorteo:</label>
                      <select 
                        value={raffleState.duration} 
                        onChange={(e) => setRaffleState(prev => ({...prev, duration: Number(e.target.value)}))}
                        className="bg-zinc-950 border border-zinc-700 text-white px-3 py-1.5 rounded outline-none focus:border-rose-500"
                      >
                        <option value={10}>10 Segundos</option>
                        <option value={60}>1 Minuto</option>
                        <option value={300}>5 Minutos</option>
                        <option value={3600}>1 Hora (Modo Evento)</option>
                      </select>
                    </div>

                    <button 
                      onClick={executeRaffle}
                      className="bg-rose-600 hover:bg-rose-500 text-white text-xl font-black px-10 py-4 rounded-full shadow-lg shadow-rose-900/50 transform hover:scale-105 transition-all"
                    >
                      ┬íINICIAR SORTEO!
                    </button>
                  </div>
                )}

                {raffleState.status === 'animating' && (
                  <div className="text-center w-full">
                    <p className="text-rose-500 font-bold uppercase tracking-widest mb-4 animate-pulse">Sorteando...</p>
                    <div className="bg-zinc-950 shadow-inner rounded-xl p-8 border-4 border-rose-900/50">
                       <h2 className="text-4xl md:text-5xl font-black text-white truncate">{raffleState.currentDisplay}</h2>
                    </div>
                  </div>
                )}

                {raffleState.status === 'finished' && raffleState.winner && (
                  <div className="text-center w-full animate-bounce-short">
                    <div className="inline-block bg-rose-950/50 text-rose-400 px-4 py-1 rounded-full font-bold text-sm uppercase tracking-widest mb-6 border border-rose-900/50">
                      ┬íTenemos un Ganador!
                    </div>
                    <div className="bg-gradient-to-r from-rose-600 to-pink-600 shadow-2xl shadow-rose-900/50 rounded-2xl p-1">
                      <div className="bg-zinc-950 rounded-xl p-8">
                        <Trophy className="w-16 h-16 text-rose-500 mx-auto mb-4" />
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-2">{raffleState.winner.clientName}</h2>
                        <p className="text-lg font-bold text-zinc-400">Expediente / Lote: {raffleState.winner.loteNumber}</p>
                      </div>
                    </div>
                    <div className="flex gap-4 justify-center mt-8">
                      <button onClick={() => setRaffleState({status: 'idle', currentDisplay: '', winner: null, audit: null, duration: 10})} className="text-zinc-400 font-bold hover:text-white transition-colors">
                        Realizar otro sorteo
                      </button>
                      <button onClick={handlePrintCertificate} className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors flex items-center gap-1">
                        <Printer className="w-4 h-4"/> Imprimir Certificado
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-2xl shadow-sm border border-zinc-800 overflow-hidden flex flex-col h-full max-h-[800px]">
            <div className="p-4 bg-zinc-950/50 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Ticket className="w-5 h-5 text-rose-500"/> Lista de Participantes
              </h3>
              <span className="bg-rose-950/50 border border-rose-900 text-rose-400 font-black text-xs px-2 py-1 rounded-full">{participants.length}</span>
            </div>
            <div className="p-2 overflow-y-auto flex-1 scrollbar-thin">
              {participants.length === 0 ? (
                <div className="text-center p-8 text-zinc-500 text-sm">No hay participantes habilitados. Entra a "Auditar" en un lote y marca la opci├│n de sorteo.</div>
              ) : (
                <ul className="space-y-1">
                  {participants.map(p => (
                    <li key={p.id} className={`p-3 rounded-lg border text-sm font-medium transition-colors ${raffleState.winner?.id === p.id ? 'bg-rose-950/30 border-rose-900/50 text-rose-300' : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-800'}`}>
                      <div className="flex justify-between items-center">
                        <span className="truncate pr-2">{p.clientName}</span>
                        <span className="text-[10px] bg-zinc-800 text-zinc-400 border border-zinc-700 px-1.5 py-0.5 rounded font-bold shrink-0">{p.loteNumber}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMasterplanView = () => {
    const mappedLotNumbers = projectConfig.lotPins.map(p => p.loteNumber.replace(/\D/g, ''));
    const unmappedLots = lots.filter(l => !mappedLotNumbers.includes(String(l.loteNumber).replace(/\D/g, '')) && l.status === 'Activo');

    return (
      <div className="max-w-7xl mx-auto mt-6 space-y-6 animate-fadeIn">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-black text-white flex items-center gap-3">
              <MapIcon className="w-8 h-8 text-rose-500" /> Masterplan Interactivo
            </h2>
            <p className="text-zinc-400 mt-1">Mapea los lotes sobre el plano de tu proyecto y visualiza las ventas en tiempo real.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => {
              const dummyCode = `<iframe src="https://tu-dominio.com/masterplan-embed/${activeProjectId}" width="100%" height="600px" style="border:none; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.5);"></iframe>`;
              fallbackCopyTextToClipboard(dummyCode);
              showAlert('C├│digo Copiado', 'Se ha copiado un c├│digo HTML iFrame al portapapeles. Entr├®gaselo a tu desarrollador web para incrustar este mapa en la p├ígina p├║blica del proyecto.');
            }} className="text-rose-400 bg-zinc-900 border border-zinc-800 hover:border-rose-500/50 hover:bg-zinc-800 font-bold text-sm px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
              <Code className="w-4 h-4"/> Obtener C├│digo Web
            </button>
          </div>
        </div>

        <div className="bg-zinc-900 p-4 rounded-xl shadow-sm border border-zinc-800 flex gap-4 text-xs font-bold uppercase justify-center flex-wrap">
          <div className="flex items-center gap-2 text-zinc-300"><span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span> Libre (Sin Registro)</div>
          <div className="flex items-center gap-2 text-zinc-300"><span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span> Reservado</div>
          <div className="flex items-center gap-2 text-zinc-300"><span className="w-3 h-3 rounded-full bg-rose-600 shadow-[0_0_8px_rgba(225,29,72,0.8)]"></span> Promesa Firmada</div>
          <div className="flex items-center gap-2 text-zinc-300"><span className="w-3 h-3 rounded-full bg-zinc-600 shadow-[0_0_8px_rgba(82,82,91,0.8)]"></span> Desistido</div>
        </div>

<div className="flex flex-col lg:flex-row gap-6">
          <div className="bg-black rounded-2xl shadow-xl overflow-hidden border border-zinc-800 relative max-h-[calc(100vh-280px)] flex items-center justify-center flex-1">
            {!projectConfig.masterplanImage ? (
              <label className="flex flex-col items-center justify-center p-12 cursor-pointer hover:scale-105 transition-transform group">
                <div className="bg-zinc-900 p-6 rounded-full mb-4 border border-zinc-800 group-hover:border-rose-500/50 transition-colors">
                  <FileImage className="w-16 h-16 text-zinc-500 group-hover:text-rose-500 transition-colors" />
                </div>
                <span className="text-lg font-bold text-zinc-300 group-hover:text-white transition-colors">Sube la Imagen del Plano (Render)</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleMasterplanUpload} />
              </label>
            ) : (
              <div className="relative w-full h-full flex items-center justify-center p-4 overflow-auto">
                 <img src={projectConfig.masterplanImage} alt="Masterplan" className="max-w-full max-h-[calc(100vh-320px)] object-contain cursor-crosshair relative z-0" onClick={handleMapClick} />
                  
                 {projectConfig.lotPins?.map(pin => {
                    const colorClass = getPinColor(pin.loteNumber);
                    return (
                      <div 
                        key={pin.id} 
                        className={`absolute w-8 h-8 -ml-4 -mt-4 rounded-full flex items-center justify-center text-[11px] font-black text-white cursor-pointer transform hover:scale-125 transition-transform z-10 shadow-[0_0_10px_rgba(0,0,0,0.8)] border border-white/20 ${colorClass}`}
                        style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                        title={`Lote ${pin.loteNumber}\nClic para abrir expediente`}
                        onClick={(e) => {
                          e.stopPropagation();
                          const cleanPinNum = String(pin.loteNumber).replace(/\D/g, '');
                          const lot = lots.find(l => String(l.loteNumber).replace(/\D/g, '') === cleanPinNum && cleanPinNum !== '');
                          if(lot) { setSelectedLotId(lot.id); setView('detail'); }
                          else showAlert('Lote Libre', `El lote ${pin.loteNumber} no tiene un expediente de venta creado a├║n en el sistema.`);
                        }}
                      >
                        {pin.loteNumber.replace(/\D/g, '')}
                      </div>
                    );
                 })}
                 
                 <button onClick={() => setProjectConfig(prev => ({...prev, masterplanImage: null, lotPins: []}))} className="absolute top-4 right-4 bg-black/80 backdrop-blur text-rose-500 p-2 px-3 rounded-lg text-xs font-bold hover:bg-zinc-900 shadow-md z-20 border border-zinc-800 transition-colors">
                   Cambiar Imagen
                 </button>
              </div>
            )}
          </div>
          
          {/* PANEL LATERAL DE PINES */}
          {projectConfig.masterplanImage && (
            <div className="w-full lg:w-64 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col max-h-[calc(100vh-280px)]">
              <h3 className="font-bold text-white mb-2 text-sm border-b border-zinc-800 pb-2">­ƒôì Lotes Hu├®rfanos</h3>
              <p className="text-[10px] text-zinc-400 mb-3">Haz clic en el mapa y escribe el n├║mero de uno de estos lotes para mapearlos.</p>
              <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto mb-4 scrollbar-thin">
                {unmappedLots.length === 0 ? <span className="text-emerald-400 font-bold text-xs mt-1">┬íTodos mapeados!</span> : 
                  unmappedLots.map(l => (
                    <span key={l.id} className="bg-zinc-800 text-zinc-300 px-2 py-1 rounded text-[10px] font-bold border border-zinc-700">
                      {l.loteNumber}
                    </span>
                  ))
                }
              </div>
              
              <h3 className="font-bold text-white mb-2 text-sm border-b border-zinc-800 pb-2 mt-2">­ƒôî Pines Colocados</h3>
              <div className="flex-1 overflow-y-auto scrollbar-thin space-y-1 pr-1">
                {projectConfig.lotPins?.length === 0 ? <span className="text-zinc-500 text-xs">No hay pines en el mapa.</span> :
                  projectConfig.lotPins?.map(pin => (
                    <div key={pin.id} className="flex justify-between items-center bg-zinc-950 p-2 rounded border border-zinc-800">
                      <span className="text-xs font-bold text-zinc-300">Lote {pin.loteNumber}</span>
                      <button onClick={() => removeMapPin(pin.id)} className="text-rose-500/70 hover:text-rose-500"><Trash2 className="w-3 h-3"/></button>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

return (
    <div className="min-h-[calc(100vh-80px)] font-sans text-zinc-100 relative bg-[#050505] overflow-hidden">
      {/* GLOBAL STYLES FOR FONTS & SCROLLBAR */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        body {
          font-family: 'Outfit', sans-serif;
          background-color: #050505;
          color: #f4f4f5;
        }
        .color-invert::-webkit-calendar-picker-indicator {
          filter: invert(1);
        }
        .scrollbar-thin::-webkit-scrollbar { width: 6px; height: 6px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: #050505; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #27272a; border-radius: 4px; }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      {/* MENÚ SUPERIOR MULTI-PROYECTO */}
      <div className="bg-[#0a0a0a] rounded-2xl border border-white/5 shadow-2xl sticky top-20 z-40 mx-4 mt-4 mb-0">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-rose-500/20 rounded-2xl border border-rose-500/20">
              <Calculator className="w-8 h-8 text-rose-500" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black uppercase tracking-tighter italic text-white">Gesti├│n de Lotes <span className="text-rose-500">Pro</span></h1>
              <div className="flex items-center mt-1.5">
                <select
                  value={activeProjectId}
                  onChange={(e) => {
                    setActiveProjectId(e.target.value);
                    setView('dashboard');
                  }}
                  className="bg-transparent text-zinc-500 text-[9px] font-black uppercase tracking-[0.3em] outline-none cursor-pointer hover:text-white transition-colors max-w-[200px] truncate"
                >
                  {projectList.map(p => <option key={p.id} value={p.id} className="text-zinc-900">{p.name}</option>)}
                </select>
              </div>
            </div>
          </div>
          
          <div className="flex bg-black p-1.5 rounded-2xl border border-white/5 overflow-x-auto hide-scrollbar">
            <button onClick={() => setView('dashboard')} className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all tracking-[0.2em] whitespace-nowrap ${view === 'dashboard' ? 'bg-rose-500 text-white shadow-lg' : 'text-zinc-600 hover:text-white'}`}>Dashboard</button>
            <button onClick={() => setView('calendar')} className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all tracking-[0.2em] whitespace-nowrap flex items-center gap-1 ${view === 'calendar' ? 'bg-rose-500 text-white shadow-lg' : 'text-zinc-600 hover:text-white'}`}><CalendarIcon className="w-3 h-3"/> Calendario</button>
            <button onClick={() => setView('masterplan')} className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all tracking-[0.2em] whitespace-nowrap flex items-center gap-1 ${view === 'masterplan' ? 'bg-rose-500 text-white shadow-lg' : 'text-zinc-600 hover:text-white'}`}><MapIcon className="w-3 h-3"/> Masterplan</button>
            <button onClick={() => setView('raffle')} className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all tracking-[0.2em] whitespace-nowrap flex items-center gap-1 ${view === 'raffle' ? 'bg-amber-500 text-black shadow-lg' : 'text-amber-500 hover:text-amber-400'}`}><Trophy className="w-3 h-3"/> Sorteos</button>
            <button onClick={() => setView('upload')} className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all tracking-[0.2em] whitespace-nowrap ${view === 'upload' ? 'bg-rose-500 text-white shadow-lg' : 'text-zinc-600 hover:text-white'}`}>Configuraci├│n</button>
          </div>
        </div>
      </div>

      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl shadow-2xl p-8 w-full max-w-sm animate-fadeIn">
            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
              <h3 className="text-lg font-black text-white uppercase tracking-tighter italic">{modalConfig.title}</h3>
              <button onClick={closeModal} className="text-zinc-500 hover:text-rose-500 transition-colors"><X className="w-5 h-5"/></button>
            </div>
            <p className="text-zinc-400 mb-8 text-sm leading-relaxed whitespace-pre-wrap">{modalConfig.message}</p>
            
            {modalConfig.type === 'prompt' && (
              <input 
                type="text" 
                autoFocus
                value={modalConfig.inputValue} 
                onChange={e => setModalConfig({...modalConfig, inputValue: e.target.value})} 
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (modalConfig.onConfirm) modalConfig.onConfirm(modalConfig.inputValue);
                    closeModal();
                  }
                }}
                className="w-full mb-8 p-4 bg-black border border-white/10 text-white rounded-2xl outline-none focus:border-rose-500 font-black text-lg transition-all"
              />
            )}

            <div className="flex justify-end gap-3">
              {(modalConfig.type === 'confirm' || modalConfig.type === 'prompt') && (
                <button onClick={closeModal} className="px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:bg-white/5 hover:text-white transition-all">Cancelar</button>
              )}
              <button 
                onClick={() => {
                  if (modalConfig.onConfirm) {
                    modalConfig.type === 'prompt' ? modalConfig.onConfirm(modalConfig.inputValue) : modalConfig.onConfirm();
                  }
                  closeModal();
                }} 
                className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all shadow-lg ${modalConfig.type === 'confirm' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'}`}
              >
                {modalConfig.type === 'confirm' ? 'S├¡, continuar' : (modalConfig.type === 'prompt' ? 'Guardar' : 'Entendido')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 md:p-6 pb-24">
        {view === 'upload' && renderUploadView()}
        {view === 'dashboard' && renderDashboardView()}
        {view === 'detail' && renderDetailView()}
        {view === 'raffle' && renderRaffleView()}
        {view === 'masterplan' && renderMasterplanView()}
      </div>
    </div>
  );
};

export default App;
