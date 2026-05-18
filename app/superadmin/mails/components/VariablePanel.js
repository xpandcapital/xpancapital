'use client';
import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Copy, Search, Check } from 'lucide-react';
import { UNIVERSAL_VARIABLES, EVENT_GROUPS } from '../_types/events';

export default function VariablePanel({ currentEvent }) {
  const [search, setSearch] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({});
  const [copiedVar, setCopiedVar] = useState(null);

  const variableGroups = useMemo(() => {
    const groups = [
      {
        id: 'universales',
        label: 'Universales',
        icon: 'Globe',
        vars: UNIVERSAL_VARIABLES
      }
    ];

    EVENT_GROUPS.forEach(group => {
      const allVars = new Set();
      group.events.forEach(event => {
        event.vars.forEach(v => allVars.add(v));
      });
      if (allVars.size > 0) {
        const groupVars = Array.from(allVars).map(v => ({
          var: `{{${v}}}`,
          desc: v.replace(/_/g, ' ')
        }));
        groups.push({
          id: group.id,
          label: group.label,
          icon: group.icon,
          vars: groupVars
        });
      }
    });

    return groups;
  }, []);

  const filteredGroups = useMemo(() => {
    if (!search.trim()) return variableGroups;
    const q = search.toLowerCase();
    return variableGroups.map(g => ({
      ...g,
      vars: g.vars.filter(v => v.var.toLowerCase().includes(q) || v.desc.toLowerCase().includes(q))
    })).filter(g => g.vars.length > 0);
  }, [variableGroups, search]);

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const copyToClipboard = (varName) => {
    navigator.clipboard.writeText(varName).then(() => {
      setCopiedVar(varName);
      setTimeout(() => setCopiedVar(null), 1500);
    });
  };

  const getCurrentEventVars = () => {
    if (!currentEvent || currentEvent === 'ninguno') return new Set();
    for (const group of EVENT_GROUPS) {
      for (const event of group.events) {
        if (event.value === currentEvent) return new Set(event.vars.map(v => `{{${v}}}`));
      }
    }
    return new Set();
  };

  const currentEventVarsSet = useMemo(() => getCurrentEventVars(), [currentEvent]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Buscar variable..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-7 pr-3 py-1.5 text-xs border rounded dark:bg-[#0a0a0a] dark:border-[#333] text-gray-300 focus:outline-none focus:border-[#e11d48]"
        />
      </div>

      {currentEvent && currentEvent !== 'ninguno' && (
        <div className="text-[10px] text-emerald-400 bg-emerald-500/5 border border-emerald-500/20 rounded p-2">
          Variables del evento: {currentEvent.replace(/_/g, ' ')}
        </div>
      )}

      <div className="max-h-[50vh] overflow-y-auto custom-scrollbar space-y-1">
        {filteredGroups.map(group => {
          const isExpanded = expandedGroups[group.id] !== false;

          return (
            <div key={group.id}>
              <div
                className="flex items-center justify-between p-1.5 rounded cursor-pointer hover:bg-gray-500/10 transition-colors"
                onClick={() => toggleGroup(group.id)}
              >
                <div className="flex items-center gap-1.5">
                  {isExpanded ? <ChevronDown size={10} className="text-gray-400" /> : <ChevronRight size={10} className="text-gray-400" />}
                  <span className="text-[11px] font-bold text-gray-400">{group.label}</span>
                  <span className="text-[10px] text-gray-600">({group.vars.length})</span>
                </div>
              </div>

              {isExpanded && (
                <div className="ml-3 space-y-0.5">
                  {group.vars.map(v => {
                    const isCurrentEvent = currentEventVarsSet.has(v.var);
                    return (
                      <div
                        key={v.var}
                        onClick={() => copyToClipboard(v.var)}
                        className={`flex items-center justify-between p-1.5 rounded cursor-pointer transition-colors text-[11px] group ${isCurrentEvent ? 'bg-emerald-500/5 border border-emerald-500/10' : 'hover:bg-gray-500/5'}`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <code className={`text-[11px] ${isCurrentEvent ? 'text-emerald-400' : 'text-blue-400'}`}>{v.var}</code>
                          <span className="text-gray-500 truncate">{v.desc}</span>
                        </div>
                        {copiedVar === v.var ? (
                          <Check size={12} className="text-emerald-400 flex-shrink-0" />
                        ) : (
                          <Copy size={12} className="text-gray-600 opacity-0 group-hover:opacity-100 flex-shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {filteredGroups.length === 0 && (
          <p className="text-xs text-gray-500 text-center py-4">Sin resultados</p>
        )}
      </div>

      {copiedVar && (
        <div className="text-center text-[10px] text-emerald-400 bg-emerald-500/10 rounded p-1.5">
          Copiado: <code className="font-bold">{copiedVar}</code>
        </div>
      )}
    </div>
  );
}
