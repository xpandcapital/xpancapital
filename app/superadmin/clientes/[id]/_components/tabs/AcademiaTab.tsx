"use client";

import { useState } from 'react';
import Image from 'next/image';
import {
  GraduationCap, Award, Download, Trash2, Unlock,
  BookOpen, Clock, CheckCircle2, Circle, ChevronDown, ChevronRight,
  BarChart3, Loader2
} from 'lucide-react';
import type { AcademicCourse, Certificate } from '../../../_types';
import { motion, AnimatePresence } from 'framer-motion';

interface AcademiaTabProps {
  academicData: { progress: AcademicCourse[]; certificates: Certificate[] };
  clientId: string;
  onDesbloquear: (userId: string, cursoId: string) => Promise<void>;
  onDeleteCertificate: (certId: string) => Promise<void>;
}

export function AcademiaTab({ academicData, clientId, onDesbloquear, onDeleteCertificate }: AcademiaTabProps) {
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [desbloqueando, setDesbloqueando] = useState<string | null>(null);
  const [deletingCert, setDeletingCert] = useState<string | null>(null);

  const handleDesbloquear = async (cursoId: string) => {
    setDesbloqueando(cursoId);
    await onDesbloquear(clientId, cursoId);
    setDesbloqueando(null);
  };

  const handleDeleteCert = async (certId: string) => {
    setDeletingCert(certId);
    await onDeleteCertificate(certId);
    setDeletingCert(null);
  };

  const completados = academicData.progress.filter(c => c.progress >= 100).length;
  const enProgreso = academicData.progress.filter(c => c.progress > 0 && c.progress < 100).length;
  const promedio = academicData.progress.length
    ? Math.round(academicData.progress.reduce((s, c) => s + c.progress, 0) / academicData.progress.length)
    : 0;

  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return 'Nunca';
    const d = new Date(fecha);
    const ahora = Date.now();
    const diff = ahora - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `Hace ${mins}min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `Hace ${hrs}h`;
    const dias = Math.floor(hrs / 24);
    if (dias < 7) return `Hace ${dias}d`;
    return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="space-y-8">
      {/* Stats Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Cursos Totales', val: academicData.progress.length, icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-500/5' },
          { label: 'Completados', val: completados, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/5' },
          { label: 'En Progreso', val: enProgreso, icon: BarChart3, color: 'text-amber-400', bg: 'bg-amber-500/5' },
          { label: 'Avance Promedio', val: `${promedio}%`, icon: GraduationCap, color: 'text-indigo-400', bg: 'bg-indigo-500/5' },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} border border-white/5 rounded-2xl p-4`}>
            <s.icon className={`${s.color} mb-2`} size={18} />
            <p className="text-[9px] font-black text-gray-500 uppercase">{s.label}</p>
            <p className="text-xl font-black text-white">{s.val}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Cursos - 2/3 */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black uppercase flex items-center gap-2">
              <BookOpen size={16} className="text-indigo-400" />
              Progreso en Cursos
            </h3>
            <span className="text-[9px] text-gray-600">{academicData.progress.length} cursos</span>
          </div>

          {academicData.progress.length === 0 ? (
            <div className="p-12 border-2 border-dashed border-white/5 rounded-[2.5rem] text-center opacity-20">
              <GraduationCap className="w-12 h-12 mx-auto mb-2" />
              <span className="text-[10px] font-black uppercase">Sin cursos en progreso</span>
            </div>
          ) : (
            <div className="space-y-3">
              {academicData.progress.map((course) => (
                <div key={course.id} className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden">
                  {/* Card principal */}
                  <div className="p-4 flex items-start gap-4">
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-xl bg-zinc-800 overflow-hidden flex-shrink-0">
                      {course.imagen ? (
                        <Image src={course.imagen} alt="" width={64} height={64} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-gray-700" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <p className="text-sm font-bold text-white truncate">{course.course}</p>
                          <div className="flex items-center gap-3 mt-1">
                            {course.grade != null ? (
                              <span className="text-[10px] text-emerald-400 font-bold">{course.grade}</span>
                            ) : (
                              <span className="text-[10px] text-gray-500">Sin nota</span>
                            )}
                            <span className="text-[10px] text-gray-600 flex items-center gap-1">
                              <Clock size={10} /> {formatearFecha(course.ultimoAcceso)}
                            </span>
                            {!course.matriculado && (
                              <span className="text-[9px] font-black bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded">Comprado</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {course.examStatus === 'failed_blocked' && (
                            <button
                              onClick={() => handleDesbloquear(course.courseId)}
                              disabled={desbloqueando === course.courseId}
                              className="px-3 py-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[8px] font-black uppercase rounded-lg hover:bg-rose-500 hover:text-white transition-all flex items-center gap-1 disabled:opacity-50"
                            >
                              {desbloqueando === course.courseId ? (
                                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                              ) : (
                                <Unlock className="w-2.5 h-2.5" />
                              )}
                              Liberar
                            </button>
                          )}
                          <button
                            onClick={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)}
                            className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"
                          >
                            {expandedCourse === course.id ? (
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-500" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Barra de progreso */}
                      <div className="mt-3 space-y-1">
                        <div className="w-full h-2 bg-black rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${course.progress}%` }}
                            className={`h-full rounded-full ${course.progress >= 100 ? 'bg-emerald-500' : course.progress > 0 ? 'bg-indigo-500' : 'bg-white/10'}`}
                          />
                        </div>
                        <div className="flex justify-between text-[8px] font-black text-gray-600">
                          <span>{course.progress}%</span>
                          <span>{course.leccionesCompletadas}/{course.totalLecciones} lecciones</span>
                          <span>{course.attempts}/{course.maxAttempts} intentos</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Drill-down: módulos expandidos */}
                  <AnimatePresence>
                    {expandedCourse === course.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-white/5"
                      >
                        <div className="p-4 space-y-3">
                          <p className="text-[9px] font-black text-gray-500 uppercase flex items-center gap-2">
                            <BookOpen size={10} />
                            Módulos y Lecciones
                          </p>
                          {/* Se muestra el conteo de lecciones; el detalle de módulos requiere otra consulta */}
                          <div className="bg-black/40 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-white">
                                  {course.leccionesCompletadas} de {course.totalLecciones} lecciones completadas
                                </p>
                                <p className="text-[10px] text-gray-500">
                                  {Math.round((course.leccionesCompletadas / Math.max(course.totalLecciones, 1)) * 100)}% del curso
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Certificados - 1/3 */}
        <div className="space-y-4">
          <h3 className="text-sm font-black uppercase flex items-center gap-2">
            <Award size={16} className="text-emerald-400" />
            Certificaciones
          </h3>

          {academicData.certificates.length === 0 ? (
            <div className="p-12 border-2 border-dashed border-white/5 rounded-[2.5rem] text-center opacity-20">
              <Award className="w-12 h-12 mx-auto mb-2" />
              <span className="text-[10px] font-black uppercase">Sin certificados</span>
            </div>
          ) : (
            <div className="space-y-3">
              {academicData.certificates.map(cert => (
                <div key={cert.id} className="p-4 bg-zinc-900 border border-emerald-500/20 rounded-2xl flex justify-between items-center group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 flex-shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-black uppercase truncate">{cert.name}</span>
                      <span className="text-[8px] text-gray-500">{cert.date}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button className="p-2 bg-white/5 rounded-lg hover:bg-white/10">
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCert(cert.id)}
                      disabled={deletingCert === cert.id}
                      className="p-2 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white disabled:opacity-50"
                    >
                      {deletingCert === cert.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
