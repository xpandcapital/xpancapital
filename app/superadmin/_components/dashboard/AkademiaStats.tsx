"use client";

import { GraduationCap, BookOpen, Users, TrendingUp, Award, ClipboardCheck, ChevronRight } from "lucide-react";
import type { AkademiaStatsData } from "./useAkademiaStats";

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  bg,
  sub,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string | number;
  color: string;
  bg: string;
  sub?: string;
}) {
  return (
    <div className="bg-[#050505] border border-white/5 p-5 rounded-3xl relative overflow-hidden shadow-2xl hover:border-white/10 transition-all group">
      <div className={`absolute top-0 right-0 w-24 h-24 ${bg} blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform`} />
      <Icon className={`${color} mb-3 relative z-10`} size={22} />
      <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest relative z-10">{label}</p>
      <h4 className="text-3xl font-black text-white mt-1 relative z-10">{value}</h4>
      {sub && <p className="text-[10px] text-zinc-500 mt-1 relative z-10">{sub}</p>}
    </div>
  );
}

function ProgressDistribution({ dist }: { dist: AkademiaStatsData["distribucionProgreso"] }) {
  const total = dist.r0 + dist.r25 + dist.r50 + dist.r75 || 1;
  const ranges = [
    { label: "0-25%", value: dist.r0, color: "bg-rose-500" },
    { label: "25-50%", value: dist.r25, color: "bg-amber-500" },
    { label: "50-75%", value: dist.r50, color: "bg-emerald-500" },
    { label: "75-100%", value: dist.r75, color: "bg-blue-500" },
  ];

  return (
    <div className="bg-[#050505] border border-white/5 rounded-[2.5rem] p-6 shadow-2xl">
      <h3 className="text-sm font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
        <TrendingUp size={18} className="text-blue-500" /> Distribución de Progreso
      </h3>
      <div className="space-y-4">
        {ranges.map((r) => (
          <div key={r.label}>
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1.5">
              <span className="text-zinc-500">{r.label}</span>
              <span className="text-white">{r.value} alumnos</span>
            </div>
            <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full ${r.color} rounded-full transition-all duration-1000`}
                style={{ width: `${Math.max(2, (r.value / total) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AkademiaStats({ stats }: { stats: AkademiaStatsData }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
          <GraduationCap size={20} className="text-blue-400" />
        </div>
        <div>
          <h2 className="text-sm font-black text-white uppercase tracking-widest leading-none">Academia</h2>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
            Métricas de Estudiantes y Aprendizaje
          </p>
        </div>
      </div>

      {/* Fila 1 — KPIs principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Alumnos" value={stats.totalAlumnos} color="text-blue-400" bg="bg-blue-500/5" />
        <StatCard icon={GraduationCap} label="Iniciaron Curso" value={stats.alumnosIniciados} color="text-emerald-400" bg="bg-emerald-500/5" sub={`${stats.alumnosNoIniciados} sin iniciar`} />
        <StatCard icon={BookOpen} label="Cursos Disponibles" value={stats.totalCursos} color="text-amber-400" bg="bg-amber-500/5" sub={`${stats.totalModulos} módulos · ${stats.totalLecciones} lecciones`} />
        <StatCard icon={Award} label="Tasa Aprobación" value={`${stats.tasaAprobacion}%`} color="text-purple-400" bg="bg-purple-500/5" sub={`${stats.examenesAprobados} aprob · ${stats.examenesReprobados} reprob · ${stats.examenesPendientes} pend`} />
      </div>

      {/* Fila 2 — Distribución y KPIs secundarios */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ProgressDistribution dist={stats.distribucionProgreso} />
        </div>
        <div className="space-y-4">
          <StatCard icon={ClipboardCheck} label="Exámenes" value={stats.examenesRealizados} color="text-amber-400" bg="bg-amber-500/5" sub="total realizados" />
          <StatCard icon={Award} label="Certificados" value={stats.certificadosEmitidos} color="text-emerald-400" bg="bg-emerald-500/5" sub="emitidos" />
          {stats.cursoMasPopular && (
            <div className="bg-[#050505] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <BookOpen size={18} className="text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Curso Más Popular</p>
                <p className="text-sm font-bold text-white truncate">{stats.cursoMasPopular.nombre}</p>
                <p className="text-[10px] text-zinc-500">{stats.cursoMasPopular.inscritos} inscritos</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
