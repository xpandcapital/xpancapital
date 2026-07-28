"use client";

import React, { createContext, useContext } from "react";

export interface Currency {
    code: string;
    symbol: string;
    name: string;
}

export interface ExchangeRates {
    [key: string]: number;
}

interface CurrencyContextType {
    currencies: Currency[];
    selectedCurrency: Currency;
    taxCurrency: Currency;
    fiscalCurrency: Currency;
    activeCurrencyCodes: string[];
    isMultiCurrencyEnabled: boolean;
    isBlisCoinsEnabled: boolean;
    exchangeRates: ExchangeRates;
    safetyMarkup: number;
    lastUpdated: Date | null;
    setSelectedCurrency: (code: string) => void;
    setTaxCurrency: (code: string) => void;
    setFiscalCurrency: (code: string) => void;
    toggleActiveCurrency: (code: string) => void;
    setActiveCurrencyCodes: (codes: string[]) => void;
    setIsMultiCurrencyEnabled: (enabled: boolean) => void;
    setIsBlisCoinsEnabled: (enabled: boolean) => void;
    setSafetyMarkup: (markup: number) => void;
    convertAmount: (amount: number, from: string, to: string) => number;
    convertToFiscal: (amount: number, fromCurrency: string) => number;
    convertFromFiscal: (amount: number, toCurrency: string) => number;
    refreshRates: () => Promise<{ success: boolean }>;
    loading: boolean;
}

const INITIAL_CURRENCIES: Currency[] = [
    { code: "ARS", symbol: "$", name: "Peso Argentino" },
    { code: "BOB", symbol: "Bs", name: "Boliviano" },
    { code: "CLP", symbol: "$", name: "Peso Chileno" },
    { code: "COP", symbol: "$", name: "Peso Colombiano" },
    { code: "CRC", symbol: "₡", name: "Colón Costarricense" },
    { code: "CUP", symbol: "$", name: "Peso Cubano" },
    { code: "DOP", symbol: "RD$", name: "Peso Dominicano" },
    { code: "EUR", symbol: "€", name: "Euro (España)" },
    { code: "GTQ", symbol: "Q", name: "Quetzal Guatemalteco" },
    { code: "HNL", symbol: "L", name: "Lempira Hondureño" },
    { code: "MXN", symbol: "$", name: "Peso Mexicano" },
    { code: "NIO", symbol: "C$", name: "Córdoba Nicaragüense" },
    { code: "PAB", symbol: "B/.", name: "Balboa Panameño" },
    { code: "PEN", symbol: "S/", name: "Sol Peruano" },
    { code: "PYG", symbol: "₲", name: "Guaraní Paraguayo" },
    { code: "SVC", symbol: "$", name: "Colón Salvadoreño" },
    { code: "USD", symbol: "$", name: "Dólar Estadounidense" },
    { code: "UYU", symbol: "$U", name: "Peso Uruguayo" },
    { code: "VES", symbol: "Bs.S", name: "Bolívar Soberano" },
].sort((a, b) => a.name.localeCompare(b.name));

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const USD_CURRENCY = INITIAL_CURRENCIES.find(c => c.code === "USD") || INITIAL_CURRENCIES[0];

const noop = () => {};
const noopCodes = (_: string[]) => {};
const identity = (v: number) => v;

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    
    const value: CurrencyContextType = {
        currencies: INITIAL_CURRENCIES,
        selectedCurrency: USD_CURRENCY,
        taxCurrency: USD_CURRENCY,
        fiscalCurrency: USD_CURRENCY,
        activeCurrencyCodes: ["USD"],
        isMultiCurrencyEnabled: false,
        isBlisCoinsEnabled: true,
        exchangeRates: {},
        safetyMarkup: 0,
        lastUpdated: null,
        setSelectedCurrency: noop,
        setTaxCurrency: noop,
        setFiscalCurrency: noop,
        toggleActiveCurrency: noop,
        setActiveCurrencyCodes: noopCodes,
        setIsMultiCurrencyEnabled: noop,
        setIsBlisCoinsEnabled: noop,
        setSafetyMarkup: noop,
        convertAmount: identity,
        convertToFiscal: identity,
        convertFromFiscal: identity,
        refreshRates: async () => ({ success: true }),
        loading: false,
    };

    return (
        <CurrencyContext.Provider value={value}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error("useCurrency must be used within a CurrencyProvider");
    }
    return context;
};
