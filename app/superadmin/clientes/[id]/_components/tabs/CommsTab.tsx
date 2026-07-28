"use client";

import { useState } from 'react';
import {
    MessageCircle, Send, Bell, Newspaper, Gift, Loader2
} from 'lucide-react';
import type { Client } from '../../../_types';
import { useToast } from '@/components/ui/Toast';
import { SearchableSelect } from '@/components/ui/SearchableSelect';

interface CommsTabProps {
    client: Client;
    onUpdate: (fields: Partial<Client>, showToast?: boolean) => void;
}

export function CommsTab({ client, onUpdate }: CommsTabProps) {
    const { showToast } = useToast();
    const [noticeContent, setNoticeContent] = useState({ title: '', message: '', template: 'custom' });
    const [sending, setSending] = useState(false);

    const handleSend = async () => {
        if (!noticeContent.title || !noticeContent.message) {
            showToast('Completa el asunto y mensaje', 'error')
            return
        }
        setSending(true)
        try {
            const res = await fetch('/api/notificaciones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: client.id,
                    titulo: noticeContent.title,
                    mensaje: noticeContent.message,
                }),
            })
            const data = await res.json()
            if (data.success) {
                showToast('Notificación enviada correctamente', 'success')
                setNoticeContent({ template: 'custom', title: '', message: '' })
            } else {
                showToast(data.error || 'Error al enviar', 'error')
            }
        } catch {
            showToast('Error de conexión', 'error')
        }
        setSending(false)
    }

    return (
        <div className="space-y-6">
            <div className="bg-zinc-900 border border-white/5 rounded-[2.5rem] p-8 space-y-8">
                <div className="flex justify-between items-center">
                    <h3 className="text-sm font-black uppercase">Lanzar Notificación Omnicanal</h3>
                    <div className="flex gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[8px] font-black uppercase text-emerald-500">Live Backend</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] text-gray-600 font-black uppercase ml-1">Template</label>
                        <SearchableSelect
                            value={noticeContent.template}
                            onChange={v => {
                                if (v === 'welcome') setNoticeContent({ template: v, title: '¡Bienvenido a Xpand Capital!', message: `Hola ${client.firstName}, es un gusto tenerte.` });
                                else if (v === 'offer') setNoticeContent({ template: v, title: 'Oferta Exclusiva Gold', message: 'Tienes un 20% de descuento.' });
                                else setNoticeContent({ template: 'custom', title: '', message: '' });
                            }}
                            options={[
                                { value: 'custom', label: 'Mensaje Personalizado' },
                                { value: 'welcome', label: 'Bienvenida Standard' },
                                { value: 'offer', label: 'Promoción de Temporada' },
                                { value: 'alert', label: 'Alerta de Seguridad' },
                            ]}
                            className="w-full"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] text-gray-600 font-black uppercase ml-1">Asunto</label>
                        <input
                            placeholder="Asunto del mensaje..."
                            value={noticeContent.title}
                            onChange={e => setNoticeContent({ ...noticeContent, title: e.target.value })}
                            className="w-full"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] text-gray-600 font-black uppercase ml-1">Cuerpo del Mensaje</label>
                    <textarea
                        placeholder="Escribe el contenido aquí..."
                        value={noticeContent.message}
                        onChange={e => setNoticeContent({ ...noticeContent, message: e.target.value })}
                        className="w-full"
                    />
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={handleSend}
                        disabled={sending}
                        className="flex-1 py-4 bg-blis-red text-white rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl disabled:opacity-50"
                    >
                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        {sending ? 'Enviando...' : 'Despachar Notificación'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-zinc-900 border border-white/5 rounded-3xl space-y-4">
                    <h4 className="text-[10px] font-black uppercase text-gray-500">Eventos Privados</h4>
                    <div className="space-y-2">
                        {client.privateEvents.map(ev => (
                            <div key={ev.id} className="flex justify-between items-center p-3 bg-black/30 rounded-xl">
                                <span className="text-[10px] font-bold">{ev.name}</span>
                                <button
                                    onClick={() => {
                                        const newEvents = client.privateEvents.map(e => e.name === ev.name ? { ...e, access: true } : e);
                                        onUpdate({ privateEvents: newEvents }, false);
                                        showToast('Invitación confirmada', 'success');
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${ev.access ? 'bg-emerald-500 text-black' : 'bg-white/5 text-gray-500 hover:text-white'}`}
                                >
                                    {ev.access ? 'Invitado' : 'Invitar'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 bg-zinc-900 border border-white/5 rounded-3xl flex items-center justify-between">
                    <div className="flex flex-col">
                        <h4 className="text-[10px] font-black uppercase text-gray-500">Suscripción News</h4>
                        <p className="text-xs font-bold">{client.isNewsletterSubscribed ? 'Activa' : 'Desactivada'}</p>
                    </div>
                    <button
                        onClick={() => onUpdate({ isNewsletterSubscribed: !client.isNewsletterSubscribed })}
                        className={`w-12 h-6 rounded-full transition-all relative ${client.isNewsletterSubscribed ? 'bg-blis-red' : 'bg-zinc-800'}`}
                    >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${client.isNewsletterSubscribed ? 'left-7' : 'left-1'}`} />
                    </button>
                </div>
            </div>
        </div>
    );
}

