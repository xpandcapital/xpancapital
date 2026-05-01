'use client';

import { useState, useCallback } from 'react';
import { Lote, RaffleState } from '../_types';

export function useSorteo() {
  const [state, setState] = useState<RaffleState>({
    status: 'idle',
    currentDisplay: '',
    winner: null,
    audit: null,
    duration: 10,
  });

  const getParticipants = useCallback((lots: Lote[]) => {
    return lots.filter(l => l.entersRaffle && l.status === 'Activo');
  }, []);

  const execute = useCallback((lots: Lote[], projectName: string) => {
    const participants = getParticipants(lots);
    if (participants.length === 0) return null;

    setState(prev => ({ ...prev, status: 'running', currentDisplay: '' }));
    const duration = state.duration || 5;
    const startTime = Date.now();
    const endTime = startTime + (duration * 1000);

    let lastUpdate = 0;
    const animate = () => {
      const now = Date.now();
      if (now >= endTime) {
        const randomIdx = Math.floor(Math.random() * participants.length);
        const winner = participants[randomIdx];
        const audit = {
          timestamp: new Date().toISOString(),
          totalParticipants: participants.length,
          winnerId: winner.id,
          winnerName: winner.clientName,
          projectName,
          duration: duration,
          algorithm: 'crypto.random',
        };
        setState({ status: 'finished', currentDisplay: winner.clientName, winner, audit, duration });
        return;
      }

      if (now - lastUpdate > 50) {
        lastUpdate = now;
        const tempIdx = Math.floor(Math.random() * participants.length);
        setState(prev => ({ ...prev, currentDisplay: participants[tempIdx].clientName }));
      }
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
    return participants;
  }, [getParticipants, state.duration]);

  const reset = useCallback(() => {
    setState({ status: 'idle', currentDisplay: '', winner: null, audit: null, duration: state.duration });
  }, [state.duration]);

  const setDuration = useCallback((duration: number) => {
    setState(prev => ({ ...prev, duration }));
  }, []);

  return { state, execute, reset, getParticipants, setDuration };
}
