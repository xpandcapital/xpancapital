"use client";

import { useParams, useRouter } from 'next/navigation';
import { useClientDetail } from './_hooks/useClientDetail';
import { ClientDetail as ClientDetailComponent } from './_components/ClientDetail';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function ClientDetailPage() {
    const params = useParams();
    const router = useRouter();
    const {
        client,
        loading,
        orders,
        transactions,
        history,
        events,
        referrals,
        academicData,
        updateClient,
        adjustCoins,
        desbloquearCurso,
        deleteCertificate
    } = useClientDetail(params.id as string);

    if (loading) {
        return (
            <div className="h-[70vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blis-red" />
            </div>
        );
    }

    if (!client) {
        return (
            <div className="p-10 text-center space-y-4">
                <p className="text-gray-500">Cliente no encontrado</p>
                <button
                    onClick={() => router.push('/superadmin/clientes')}
                    className="px-6 py-3 bg-white/5 rounded-xl text-sm font-black uppercase hover:bg-white/10"
                >
                    Volver a Clientes
                </button>
            </div>
        );
    }

    return (
        <div className="h-full">
            <div className="md:hidden p-4 border-b border-white/5">
                <button
                    onClick={() => router.push('/superadmin/clientes')}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-white"
                >
                    <ArrowLeft className="w-4 h-4" /> Volver
                </button>
            </div>
            <ClientDetailComponent
                client={client}
                orders={orders}
                transactions={transactions}
                history={history}
                events={events}
                referrals={referrals}
                academicData={academicData}
                onUpdate={updateClient}
                onAdjustCoins={adjustCoins}
                onDesbloquear={desbloquearCurso}
                onDeleteCertificate={deleteCertificate}
                onClose={() => router.push('/superadmin/clientes')}
            />
        </div>
    );
}
