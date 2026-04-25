"use client";

import {
    UserCog, Shield, Star, Search, Calendar, User, Building2, Eye,
    Key, Smartphone, Loader2
} from 'lucide-react';
import type { Client } from '../../../_types';
import { CustomSelect } from '../../../_components/CustomSelect';
import { CustomDatePicker } from '../../../_components/CustomDatePicker';
import { useState } from 'react';
import { fetchDniData, fetchRucData } from '@/lib/peru-apis';
import { fetchEcuadorData } from '@/lib/ecuador-apis';
import { useToast } from '@/components/ui/Toast';

interface ProfileTabProps {
    client: Client;
    onUpdate: (fields: Partial<Client>) => void;
}

export function ProfileTab({ client, onUpdate }: ProfileTabProps) {
    const { showToast } = useToast();
    const [validating, setValidating] = useState(false);

    const validateIdentity = async () => {
        if (!client.dni) return showToast('Ingrese un número de documento', 'warning');
        const id = client.dni;
        setValidating(true);
        try {
            let data: any;
            if (id.length === 8) data = await fetchDniData(id);
            else if (id.length === 11) data = await fetchRucData(id);
            else if (id.length === 10 || id.length === 13) data = await fetchEcuadorData(id);
            else {
                showToast('Longitud no reconocida (8, 10, 11 o 13)', 'warning');
                return;
            }
            if (data && data.success) {
                let fName = data.firstName;
                let lName = data.lastName;
                if (!fName && data.name) {
                    const parts = data.name.trim().split(/\s+/).filter(Boolean);
                    if (parts.length >= 3) {
                        lName = parts.slice(0, 2).join(' ');
                        fName = parts.slice(2).join(' ');
                    } else if (parts.length === 2) {
                        lName = parts[0];
                        fName = parts[1];
                    } else {
                        fName = data.name;
                        lName = '';
                    }
                }
                onUpdate({
                    status: 'Verificado',
                    firstName: fName || client.firstName,
                    lastName: lName || client.lastName,
                    isCompany: data.type === 'juridica',
                    companyName: data.type === 'juridica' ? data.name : client.companyName,
                    birthday: data.birthDate || client.birthday,
                    profession: data.profession || client.profession,
                    education: data.education || client.education,
                    maritalStatus: data.maritalStatus || client.maritalStatus,
                    phone: data.phone || data.cellphone || client.phone,
                    email: data.email || client.email
                });
                showToast(`Verificación exitosa: ${data.name}`, 'success');
            } else {
                showToast(data?.message || 'Servicio no disponible', 'error');
            }
        } catch {
            showToast('Error en la consulta', 'error');
        } finally {
            setValidating(false);
        }
    };

    const handleSwitchTier = (tier: string) => {
        onUpdate({ tier });
        showToast(`Nivel cambiado a ${tier}`, 'success');
    };

    const handleResetPassword = () => {
        showToast('Enlace de reseteo enviado por email', 'success');
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center border-b border-white/5 pb-6">
                <div>
                    <h3 className="text-lg font-black uppercase tracking-tighter">Expediente del Socio</h3>
                    <p className="text-[10px] text-gray-500 uppercase font-black">ID: BLIS-{client.id.toString().padStart(4, '0')} • Miembro desde {client.joined}</p>
                </div>
                <div className="flex gap-3">
                    <a
                        href={`https://wa.me/${client.phone.replace(/\+/g, '').replace(/\s/g, '')}?text=Hola%20${client.firstName}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-emerald-600/10 text-emerald-500 border border-emerald-500/20 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all shadow-xl"
                    >
                        <Smartphone className="w-5 h-5" />
                    </a>
                    <button
                        onClick={handleResetPassword}
                        className="p-3 bg-blue-600/10 text-blue-500 border border-blue-500/20 rounded-2xl hover:bg-blue-500 hover:text-white transition-all shadow-xl"
                    >
                        <Key className="w-5 h-5" />
                    </button>
                    <button
                        onClick={validateIdentity}
                        disabled={validating}
                        className="px-6 py-2 bg-zinc-950 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase hover:bg-white hover:text-black transition-all shadow-xl flex items-center gap-2"
                    >
                        {validating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        Verificar Identidad
                    </button>
                </div>
            </div>

            <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] text-gray-600 font-black uppercase ml-1">Nombre</label>
                        <input
                            type="text"
                            value={client.firstName}
                            onChange={e => onUpdate({ firstName: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-black outline-none focus:border-blis-red transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] text-gray-600 font-black uppercase ml-1">Apellidos</label>
                        <input
                            type="text"
                            value={client.lastName}
                            onChange={e => onUpdate({ lastName: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-black outline-none focus:border-blis-red transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] text-gray-600 font-black uppercase ml-1">Email Principal</label>
                        <input
                            type="text"
                            value={client.email}
                            onChange={e => onUpdate({ email: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-blis-red transition-all"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
                    <CustomSelect
                        label="Nivel Socio"
                        value={client.tier}
                        options={[
                            { value: "Bronze Member", label: "Bronze Member" },
                            { value: "Silver Member", label: "Silver Member" },
                            { value: "Gold Member", label: "Gold Member" },
                            { value: "Platinum Member", label: "Platinum Member" }
                        ]}
                        onChange={handleSwitchTier}
                        icon={Star}
                    />
                    <CustomSelect
                        label="Tipo Doc."
                        value={client.documentType || "DNI"}
                        options={[
                            { value: "DNI", label: "DNI (8 d)" },
                            { value: "RUC", label: "RUC (11 d)" },
                            { value: "Cedula", label: "Cédula (10)" },
                            { value: "Pasaporte", label: "Pasaporte" }
                        ]}
                        onChange={(v) => onUpdate({ documentType: v as Client['documentType'] })}
                        icon={Shield}
                    />
                    <div className="space-y-2">
                        <label className="text-[10px] text-gray-600 font-black uppercase ml-1">Número Identidad</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={client.dni}
                                onChange={e => onUpdate({ dni: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-black outline-none focus:border-blis-red transition-all pr-12"
                                placeholder="Número..."
                            />
                            <button
                                onClick={validateIdentity}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-blis-red/20 text-blis-red rounded-xl hover:bg-blis-red hover:text-white transition-all"
                            >
                                <Search className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                    <CustomDatePicker
                        label="Fecha Nacimiento"
                        value={client.birthday}
                        onChange={v => onUpdate({ birthday: v })}
                    />
                    <CustomSelect
                        label="Estado Civil"
                        value={client.maritalStatus || "Soltero"}
                        options={[
                            { value: "Soltero", label: "Soltero/a" },
                            { value: "Casado", label: "Casado/a" },
                            { value: "Divorciado", label: "Divorciado/a" },
                            { value: "Viudo", label: "Viudo/a" }
                        ]}
                        onChange={(v) => onUpdate({ maritalStatus: v })}
                        icon={User}
                    />
                    <div className="space-y-2">
                        <label className="text-[10px] text-gray-600 font-black uppercase ml-1">Profesión</label>
                        <input
                            type="text"
                            value={client.profession}
                            onChange={e => onUpdate({ profession: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:border-blis-red transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] text-gray-600 font-black uppercase ml-1">Grado Académico</label>
                        <input
                            type="text"
                            value={client.education}
                            onChange={e => onUpdate({ education: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:border-blis-red transition-all"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] text-gray-600 font-black uppercase ml-1">Notas Internas Ops</label>
                    <textarea
                        value={client.internalNotes}
                        onChange={e => onUpdate({ internalNotes: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-4 text-xs outline-none focus:border-blis-red transition-all min-h-[100px]"
                        placeholder="Observaciones críticas de gestión..."
                    />
                </div>
            </div>

            {client.isCompany && (
                <div className="p-10 bg-gradient-to-br from-zinc-900/50 to-black/30 border border-white/5 rounded-[3.5rem] space-y-8">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3 text-blis-red">
                            <Building2 className="w-6 h-6" />
                            <h4 className="text-sm font-black uppercase tracking-widest">Estructura Corporativa: {client.companyName}</h4>
                        </div>
                        <span className="text-[9px] font-black px-4 py-1.5 bg-blis-red/10 text-blis-red rounded-full border border-blis-red/20 uppercase tracking-widest">Cuenta RUC Activa</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 font-black text-[9px] text-gray-500 uppercase tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Colaborador</th>
                                    <th className="px-6 py-4">Rol</th>
                                    <th className="px-6 py-4">Antigüedad</th>
                                    <th className="px-6 py-4 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {client.managedEmployees?.map((emp, i) => (
                                    <tr key={i} className="group hover:bg-white/[0.02]">
                                        <td className="px-6 py-4 text-xs font-bold text-white">{emp.name}</td>
                                        <td className="px-6 py-4 text-[10px] text-gray-400 font-black uppercase">{emp.role}</td>
                                        <td className="px-6 py-4 text-[10px] text-gray-500 uppercase">{emp.joined}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 opacity-0 group-hover:opacity-100 transition-all text-gray-600 hover:text-white">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {(!client.managedEmployees || client.managedEmployees.length === 0) && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-10 text-center text-[10px] text-gray-700 font-black uppercase italic tracking-widest">No hay colaboradores registrados.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase hover:bg-white/10 transition-all">+ Dar de Alta Colaborador</button>
                </div>
            )}
        </div>
    );
}
