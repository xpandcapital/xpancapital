"use client";

import { useState } from 'react';
import type { Client } from '../../_types';
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
    onUpdate: (fields: Partial<Client>, showToast?: boolean) => void;
    onAdjustCoins: (amount: number, reason: string) => void;
    onClose?: () => void;
}

export function ClientDetail({ client, onUpdate, onAdjustCoins, onClose }: ClientDetailProps) {
    const [activeTab, setActiveTab] = useState('profile');

    const renderTab = () => {
        const props = { client, onUpdate, onAdjustCoins };
        switch (activeTab) {
            case 'profile': return <ProfileTab {...props} />;
            case 'economy': return <EconomyTab {...props} />;
            case 'sales': return <SalesTab {...props} />;
            case 'addresses': return <AddressesTab {...props} />;
            case 'academia': return <AcademiaTab {...props} />;
            case 'referrals': return <ReferralsTab {...props} />;
            case 'comms': return <CommsTab {...props} />;
            case 'ai': return <AiInsightsTab {...props} />;
            case 'automations': return <AutomationsTab {...props} />;
            case 'history': return <HistoryTab {...props} />;
            default: return <ProfileTab {...props} />;
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
