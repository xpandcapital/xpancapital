'use client';
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Check, Circle, Loader2 } from 'lucide-react';
import { EVENT_GROUPS } from '../_types/events';

export default function EventSelector({ savedTemplates, currentTemplateId, currentEvent, onAssignEvent, onLoadTemplate, templatesLoading }) {
  const [expandedGroups, setExpandedGroups] = useState({});
  const [confirmReassign, setConfirmReassign] = useState(null);

  const eventAssignments = {};
  (savedTemplates || []).forEach(t => {
    if (t.evento && t.evento !== 'ninguno') {
      eventAssignments[t.evento] = t;
    }
  });

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const handleEventClick = (eventValue) => {
    if (eventValue === currentEvent) {
      onAssignEvent('ninguno');
      return;
    }
    const assigned = eventAssignments[eventValue];
    if (!assigned) {
      onAssignEvent(eventValue);
      return;
    }
    if (assigned.id === currentTemplateId) {
      onAssignEvent('ninguno');
      return;
    }
    setConfirmReassign({ eventValue, template: assigned });
  };

  const doReassign = () => {
    if (!confirmReassign) return;
    onAssignEvent(confirmReassign.eventValue);
    setConfirmReassign(null);
  };

  const doLoadTemplate = () => {
    if (!confirmReassign) return;
    onLoadTemplate(confirmReassign.template.id);
    setConfirmReassign(null);
  };

  return (
    <div className="space-y-1 max-h-[50vh] overflow-y-auto custom-scrollbar">
      {confirmReassign && (
        <div className="mb-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs">
          <p className="text-amber-400 font-bold mb-2">
            «{confirmReassign.eventValue.replace(/_/g, ' ')}» ya esta asignado a «{confirmReassign.template.nombre}»
          </p>
          <div className="flex gap-2">
            <button onClick={doReassign} className="px-3 py-1 bg-amber-500 text-white rounded text-xs font-bold">Reasignar a esta plantilla</button>
            <button onClick={doLoadTemplate} className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-bold">Abrir «{confirmReassign.template.nombre}»</button>
            <button onClick={() => setConfirmReassign(null)} className="px-3 py-1 border border-gray-500 text-gray-300 rounded text-xs">Cancelar</button>
          </div>
        </div>
      )}

      <div
        className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${currentEvent === 'ninguno' || !currentEvent ? 'bg-emerald-500/10 border border-emerald-500/30' : 'hover:bg-gray-500/5'}`}
        onClick={() => handleEventClick('ninguno')}
      >
        <span className="text-xs font-medium text-gray-300">Sin evento (uso manual)</span>
        {(currentEvent === 'ninguno' || !currentEvent) && <Check size={14} className="text-emerald-400" />}
      </div>

      {EVENT_GROUPS.map(group => {
        const groupAssignments = group.events.filter(e => eventAssignments[e.value]);
        const isExpanded = expandedGroups[group.id] || group.events.some(e => e.value === currentEvent);

        return (
          <div key={group.id}>
            <div
              className="flex items-center justify-between p-2 rounded cursor-pointer hover:bg-gray-500/10 transition-colors"
              onClick={() => toggleGroup(group.id)}
            >
              <div className="flex items-center gap-2">
                {isExpanded ? <ChevronDown size={12} className="text-gray-400" /> : <ChevronRight size={12} className="text-gray-400" />}
                <span className="text-xs font-bold text-gray-300">{group.icon ? group.label : group.label}</span>
              </div>
              <span className="text-[10px] text-gray-500">{groupAssignments.length}/{group.events.length}</span>
            </div>

            {isExpanded && (
              <div className="ml-4 space-y-0.5">
                {group.events.map(event => {
                  const assigned = eventAssignments[event.value];
                  const isOurs = assigned && assigned.id === currentTemplateId;
                  const isCurrent = event.value === currentEvent;

                  return (
                    <div key={event.value} className="flex items-center justify-between">
                      <div
                        className={`flex-1 flex items-center justify-between p-2 rounded cursor-pointer transition-colors text-xs ${isCurrent ? 'bg-[#e11d48]/10 border border-[#e11d48]/30' : isOurs ? 'bg-blue-500/10 border border-blue-500/30' : assigned ? 'bg-gray-500/5 border border-gray-500/10 opacity-60' : 'hover:bg-gray-500/5'}`}
                        onClick={() => handleEventClick(event.value)}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {isCurrent || isOurs ? (
                            <Check size={12} className="text-emerald-400 flex-shrink-0" />
                          ) : assigned ? (
                            <Circle size={12} className="text-gray-500 flex-shrink-0" />
                          ) : (
                            <Circle size={12} className="text-gray-700 flex-shrink-0" />
                          )}
                          <span className="truncate">{event.label}</span>
                        </div>
                      </div>
                      {assigned && assigned.id !== currentTemplateId && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onLoadTemplate(assigned.id); }}
                          className="text-[10px] text-blue-400 hover:text-blue-300 hover:underline ml-2 flex-shrink-0 truncate max-w-[120px]"
                          title={assigned.nombre}
                        >
                          {assigned.nombre}
                        </button>
                      )}
                      {isOurs && (
                        <span className="text-[10px] text-emerald-500 ml-2 flex-shrink-0">asignado</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
