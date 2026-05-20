"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Shield,
  ShieldCheck,
  Gauge,
  Wrench,
  Search,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Bell,
  ScrollText,
  Bot,
  Cpu,
  Dot,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SECURITY_TOOLS } from './tool-index';
import { GeobloqueoTool } from './GeobloqueoTool';
import { SecurityHeadersTool } from './SecurityHeadersTool';
import { RateLimitingTool } from './RateLimitingTool';
import { AccessLogsTool } from './AccessLogsTool';
import { BotProtectionTool } from './BotProtectionTool';
import { AlertsTool } from './AlertsTool';
import { ScannerTool } from './ScannerTool';
import { LoginGeoTool } from './LoginGeoTool';
import { SecurityDashboard } from './SecurityDashboard';
import { PlaceholderTool } from './PlaceholderTool';
import type { SecurityToolDef, SecurityHeadersConfig, RateLimitingConfig, BotProtectionConfig, AlertsConfig } from '../_types';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Shield,
  ShieldCheck,
  Gauge,
  Wrench,
  Search,
  Bell,
  ScrollText,
  Bot,
  Cpu,
  Search,
  Globe,
};

interface Props {
  initialTool?: string;
  geobloqueoConfig?: import('../_types').GeobloqueoConfig;
  securityHeadersConfig?: import('../_types').SecurityHeadersConfig;
  rateLimitingConfig?: import('../_types').RateLimitingConfig;
  botProtectionConfig?: import('../_types').BotProtectionConfig;
  alertsConfig?: import('../_types').AlertsConfig;
  saving?: boolean;
  onSave?: (toolId: string) => Promise<void>;
  onUpdateGeobloqueo?: (updates: Partial<import('../_types').GeobloqueoConfig>) => void;
  onUpdateSecurityHeaders?: (updates: Partial<import('../_types').SecurityHeadersConfig>) => void;
  onUpdateRateLimiting?: (updates: Partial<import('../_types').RateLimitingConfig>) => void;
  onUpdateBotProtection?: (updates: Partial<import('../_types').BotProtectionConfig>) => void;
  onUpdateAlerts?: (updates: Partial<import('../_types').AlertsConfig>) => void;
}

const CAT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'Principal': Cpu,
  'Control de Acceso': Shield,
  'Protección Web': Wrench,
  'Monitoreo': Gauge,
};

export function SidebarSecurity({ initialTool, geobloqueoConfig, securityHeadersConfig, rateLimitingConfig, botProtectionConfig, alertsConfig, saving, onSave, onUpdateGeobloqueo, onUpdateSecurityHeaders, onUpdateRateLimiting, onUpdateBotProtection, onUpdateAlerts }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTool, setActiveTool] = useState<string>(initialTool || 'dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCats, setExpandedCats] = useState<string[]>(['Principal', 'Control de Acceso', 'Protección Web', 'Monitoreo']);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSetTool = (id: string) => {
    setActiveTool(id);
    setIsCollapsed(false);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tool', id);
    router.replace(`/superadmin/configuracion/seguridad?${params.toString()}`, { scroll: false });
  };

  const toggleCat = (cat: string) => {
    setExpandedCats(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const filteredTools = SECURITY_TOOLS.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.cat.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedByCat = searchQuery
    ? []
    : SECURITY_TOOLS.reduce<Record<string, SecurityToolDef[]>>((acc, t) => {
        if (!acc[t.cat]) acc[t.cat] = [];
        acc[t.cat].push(t);
        return acc;
      }, {});

  const renderToolList = (tools: SecurityToolDef[]) => (
    <div className="space-y-0.5">
      {tools.map(tool => {
        const IconComp = ICON_MAP[tool.icon];
        const isActive = activeTool === tool.id;
        return (
          <button
            key={tool.id}
            onClick={() => tool.status !== 'coming_soon' ? handleSetTool(tool.id) : null}
            disabled={tool.status === 'coming_soon'}
            className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-xs transition-all ${
              isActive
                ? 'bg-blis-red/15 text-blis-red border border-blis-red/20'
                : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
            } ${tool.status === 'coming_soon' ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            {IconComp ? <IconComp className="w-3.5 h-3.5 shrink-0" /> : <Dot className="w-3.5 h-3.5 shrink-0" />}
            <span className="flex-1 text-left truncate">{tool.name}</span>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              tool.status === 'active' ? 'bg-green-400' : 'bg-gray-600'
            }`} />
          </button>
        );
      })}
    </div>
  );

  const resolveComponent = () => {
    const tool = SECURITY_TOOLS.find(t => t.id === activeTool);
    if (!tool || tool.status === 'coming_soon') {
      return <PlaceholderTool toolId={activeTool} />;
    }
    switch (activeTool) {
      case 'dashboard':
        return <SecurityDashboard />;
      case 'geobloqueo':
        return (
          <GeobloqueoTool
            config={geobloqueoConfig}
            saving={saving}
            onSave={() => onSave?.('geobloqueo')}
            onUpdateGeobloqueo={onUpdateGeobloqueo}
          />
        );
      case 'security_headers':
        return (
          <SecurityHeadersTool
            config={securityHeadersConfig}
            saving={saving}
            onSave={() => onSave?.('security_headers')}
            onUpdate={onUpdateSecurityHeaders}
          />
        );
      case 'rate_limiting':
        return (
          <RateLimitingTool
            config={rateLimitingConfig}
            saving={saving}
            onSave={() => onSave?.('rate_limiting')}
            onUpdate={onUpdateRateLimiting}
          />
        );
      case 'access_logs':
        return <AccessLogsTool />;
      case 'bot_protection':
        return (
          <BotProtectionTool
            config={botProtectionConfig}
            saving={saving}
            onSave={() => onSave?.('bot_protection')}
            onUpdate={onUpdateBotProtection}
          />
        );
      case 'alerts':
        return (
          <AlertsTool
            config={alertsConfig}
            saving={saving}
            onSave={() => onSave?.('alerts')}
            onUpdate={onUpdateAlerts}
          />
        );
      case 'scanner':
        return <ScannerTool />;
      case 'login_geo':
        return <LoginGeoTool />;
      default:
        return <PlaceholderTool toolId={activeTool} />;
    }
  };

  const activeStatus = SECURITY_TOOLS.find(t => t.id === activeTool)?.status;

  return (
    <div className="h-full flex overflow-hidden">
      {/* Sidebar */}
      <motion.div
        animate={{ width: isCollapsed ? 56 : 220 }}
        className="h-full border-r border-white/5 bg-zinc-950 flex flex-col shrink-0 transition-none relative"
      >
        {/* Collapse toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-4 w-6 h-6 bg-blis-red rounded-full flex items-center justify-center z-10 hover:bg-blis-red/80 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-3 h-3 text-white" />
          ) : (
            <ChevronLeft className="w-3 h-3 text-white" />
          )}
        </button>

        {/* Search */}
        <div className="p-2">
          {isCollapsed ? (
            <button
              onClick={() => setIsCollapsed(false)}
              className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-gray-500 hover:text-white transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          ) : (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 outline-none border border-white/5 focus:border-blis-red/30 transition-colors"
              />
            </div>
          )}
        </div>

        {/* Tools */}
        <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-3">
          {searchQuery ? (
            <div>
              <div className="px-2 py-1 text-[10px] font-black uppercase tracking-widest text-gray-500">
                Resultados
              </div>
              {renderToolList(filteredTools)}
            </div>
          ) : (
            Object.entries(groupedByCat).map(([cat, tools]) => {
              const CatIcon = CAT_ICONS[cat];
              const isExpanded = expandedCats.includes(cat);
              return (
                <div key={cat}>
                  <button
                    onClick={() => toggleCat(cat)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-3 h-3" />
                    ) : (
                      <ChevronRight className="w-3 h-3" />
                    )}
                    {isCollapsed ? (CatIcon ? <CatIcon className="w-3 h-3" /> : null) : cat}
                  </button>
                  {!isCollapsed && isExpanded && renderToolList(tools)}
                </div>
              );
            })
          )}
        </div>

        {/* Status badge collapsed */}
        {isCollapsed && (
          <div className="p-2 flex flex-col items-center gap-1">
            {SECURITY_TOOLS.map(tool => (
              <div
                key={tool.id}
                className={`w-1.5 h-1.5 rounded-full ${
                  tool.status === 'active' ? 'bg-green-400' : 'bg-gray-600'
                }`}
                title={tool.name}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Panel derecho */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTool}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {resolveComponent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
