"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type LabelLayout = 'vertical' | 'horizontal';
export type CodeType = 'qr' | 'barcode';

interface LabelSettings {
    defaultType: CodeType;
    layout: LabelLayout;
    showName: boolean;
    showSku: boolean;
    showPrice: boolean;
    showCategory: boolean;
    heightCm: number;
    titleLines: 1 | 2;
}

interface LabelContextType {
    settings: LabelSettings;
    updateSettings: (newSettings: Partial<LabelSettings>) => void;
}

const LabelContext = createContext<LabelContextType | undefined>(undefined);

export const LabelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<LabelSettings>({
        defaultType: 'qr',
        layout: 'vertical',
        showName: true,
        showSku: true,
        showPrice: true,
        showCategory: false,
        heightCm: 3,
        titleLines: 2
    });

    const updateSettings = (newSettings: Partial<LabelSettings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    return (
        <LabelContext.Provider value={{ settings, updateSettings }}>
            {children}
        </LabelContext.Provider>
    );
};

export const useLabel = () => {
    const context = useContext(LabelContext);
    if (context === undefined) {
        throw new Error('useLabel must be used within a LabelProvider');
    }
    return context;
};
