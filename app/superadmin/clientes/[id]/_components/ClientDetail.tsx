"use client";

import { useState } from 'react';
import type { Client, Transaction, Order, AuditLog, PrivateEvent, AcademicCourse, Certificate, Referral } from '../../_types';
import { ClientSidebar } from './ClientSidebar';
import { ProfileTab } from './tabs/ProfileTab';
import { EconomyTab } from './tabs/EconomyTab';
import { SalesTab } from './tabs/SalesTab';
import { AddressesTab } from './tabs/AddressesTab';
import { AcademiaTab } from './tabs/AcademiaTab';
import { ReferralsTab } from './tabs/ReferralsTab';
import { CommsTab } from './tabs/CommsTab';
import { AiInsightsTab } from './tabs/AiInsightsTab';
import { AutomationsTab } from './tabs/AutomationsTab';
import { HistoryTab } from './tabs/HistoryTab';

interface ClientDetailProps {
    client: Client;
    orders: Order[];
    transactions: Transaction[];
    history: AuditLog[];
    events: PrivateEvent[];
    insights: any[];
    automations: any[];
    referrals: Referral[];
    academicData: { progress: AcademicCourse[]; certificates: Certificate[] };
    onUpdate: (fields: Partial<Client>, showToast?: boolean) => void;
    onAdjustCoins: (amount: number, reason: string) => void;
    onClose?: () => void;
}

export function ClientDetail({
    client,
    orders,
    transactions,
    history,
    events,
    insights,
    automations,
    referrals,
    academicData,
    onUpdate,
    onAdjustCoins,
    onClose
}: ClientDetailProps) {
    const [activeTab, setActiveTab] = useState('profile');

    const renderTab = () => {
        const baseProps = { client, onUpdate, onAdjustCoins };
        switch (activeTab) {
            case 'profile': return <ProfileTab {...baseProps} />;
            case 'economy': return <EconomyTab {...baseProps} transactions={transactions} />;
            case 'sales': return <SalesTab {...baseProps} orders={orders} />;
            case 'addresses': return <AddressesTab {...baseProps} />;
            case 'academia': return <AcademiaTab {...baseProps} academicData={academicData} />;
            case 'referrals': return <ReferralsTab {...baseProps} referrals={referrals} />;
            case 'comms': return <CommsTab client={client} onUpdate={onUpdate} />;
            case 'ai': return <AiInsightsTab {...baseProps} insights={insights} />;
            case 'automations': return <AutomationsTab {...baseProps} automations={automations} />;
            case 'history': return <HistoryTab {...baseProps} history={history} />;
            default: return <ProfileTab {...baseProps} />;
        }
    };

    return (
        <div className="flex h-full">
            <div className="hidden md:block w-80 flex-shrink-0">
                <ClientSidebar
                    client={client}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    onClose={onClose}
                />
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="p-6 md:p-10">
                    {renderTab()}
                </div>
            </div>
        </div>
    );
}
