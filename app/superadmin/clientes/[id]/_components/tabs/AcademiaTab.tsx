"use client";

import { GraduationCap, Award, Download, Trash2, Unlock } from 'lucide-react';
import type { AcademicCourse, Certificate } from '../../../_types';
import { motion } from 'framer-motion';

interface AcademiaTabProps {
    academicData: { progress: AcademicCourse[]; certificates: Certificate[] };
}

export function AcademiaTab({ academicData }: AcademiaTabProps) {

    return (
        <div className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-black uppercase">Progreso en Cursos</h3>
                        <GraduationCap className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div className="space-y-4">
                        {academicData.progress.length === 0 ? (
                            <div className="p-12 border-2 border-dashed border-white/5 rounded-[2.5rem] text-center opacity-20">
                                <GraduationCap className="w-12 h-12 mx-auto mb-2" />
                                <span className="text-[10px] font-black uppercase">Sin cursos en progreso</span>
                            </div>
                        ) : (
                            academicData.progress.map((course, idx) => (
                                <div key={idx} className="p-6 bg-zinc-900 border border-white/5 rounded-3xl space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-black uppercase leading-tight max-w-[200px]">{course.course}</span>
                                            <span className="text-[9px] text-gray-500">Nota Final: {course.grade || 'Pendiente'}</span>
                                        </div>
                                        {course.examStatus === 'failed_blocked' && (
                                            <button
                                                className="px-3 py-1 bg-rose-500 text-black text-[8px] font-black uppercase rounded-lg hover:bg-rose-600 transition-all flex items-center gap-1"
                                            >
                                                <Unlock className="w-2.5 h-2.5" /> Liberar
                                            </button>
                                        )}
                                    </div>
                                    <div className="w-full h-2 bg-black rounded-full overflow-hidden flex">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${course.progress}%` }}
                                            className={`h-full ${course.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[8px] font-black uppercase text-gray-600">
                                        <span>{course.progress}% Completado</span>
                                        <span>{course.attempts}/{course.maxAttempts} Intentos</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-sm font-black uppercase">Certificaciones</h3>
                    <div className="grid grid-cols-1 gap-4">
                        {academicData.certificates.length === 0 ? (
                            <div className="p-12 border-2 border-dashed border-white/5 rounded-[2.5rem] text-center opacity-20">
                                <Award className="w-12 h-12 mx-auto mb-2" />
                                <span className="text-[10px] font-black uppercase">Sin certificados</span>
                            </div>
                        ) : (
                            academicData.certificates.map(cert => (
                                <div key={cert.id} className="p-5 bg-zinc-900 border border-emerald-500/20 rounded-2xl flex justify-between items-center group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                                            <Award className="w-5 h-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase max-w-[150px] truncate">{cert.name}</span>
                                            <span className="text-[8px] text-gray-500">{cert.date}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                        <button className="p-2 bg-white/5 rounded-lg hover:bg-white/10">
                                            <Download className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCertificate(cert.id)}
                                            className="p-2 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-8 bg-indigo-600/10 border border-indigo-500/20 rounded-[2.5rem] space-y-4">
                        <h4 className="text-[10px] font-black uppercase text-indigo-400">Generar Diplomas</h4>
                        <p className="text-[9px] text-gray-500">Otorga un certificado manual a este socio.</p>
                        <button className="w-full py-4 bg-indigo-500 text-black rounded-2xl font-black uppercase text-[10px] hover:bg-indigo-400">
                            Crear Certificado
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
