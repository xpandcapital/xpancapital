"use client";

import { useState, useEffect, useCallback } from "react";

interface DistribucionProgreso {
  r0: number;
  r25: number;
  r50: number;
  r75: number;
}

interface RankingItem {
  posicion: number;
  id: string;
  nombre: string;
  email: string;
  puntos_cursos: number;
  nivel: number;
}

interface CursoPopular {
  nombre: string;
  inscritos: number;
}

interface AkademiaStatsData {
  totalAlumnos: number;
  alumnosIniciados: number;
  alumnosNoIniciados: number;
  totalCursos: number;
  totalModulos: number;
  totalLecciones: number;
  examenesRealizados: number;
  examenesAprobados: number;
  examenesReprobados: number;
  examenesPendientes: number;
  tasaAprobacion: number;
  certificadosEmitidos: number;
  distribucionProgreso: DistribucionProgreso;
  cursoMasPopular: CursoPopular | null;
  ranking: RankingItem[];
}

export function useAkademiaStats() {
  const [stats, setStats] = useState<AkademiaStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/stats-academia");
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.error || "Error al cargar métricas");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}

export type { AkademiaStatsData };
