"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useMonedas } from "@/lib/hooks/useMonedas";

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
    selectedCurrency: Currency; // Moneda para visualización
    taxCurrency: Currency; // Moneda fiscal para impuestos
    fiscalCurrency: Currency; // Moneda en la que se cobra (siempre PEN para Perú)
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
    convertToFiscal: (amount: number, fromCurrency: string) => number; // Convertir a moneda fiscal
    convertFromFiscal: (amount: number, toCurrency: string) => number; // Convertir desde moneda fiscal
    refreshRates: () => Promise<void>;
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

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { config, tasas, loading, updateConfig, refreshRatesFromAPI } = useMonedas();
    
    const [selectedCurrency, setCurrencyState] = useState<Currency>(INITIAL_CURRENCIES.find(c => c.code === "USD") || INITIAL_CURRENCIES[0]);
    const [taxCurrency, setTaxCurrencyState] = useState<Currency>(INITIAL_CURRENCIES.find(c => c.code === "PEN") || INITIAL_CURRENCIES[0]);
    const [fiscalCurrency, setFiscalCurrencyState] = useState<Currency>(INITIAL_CURRENCIES.find(c => c.code === "PEN") || INITIAL_CURRENCIES[0]);
    const [isMultiCurrencyEnabled, setIsMultiCurrencyEnabled] = useState<boolean>(false);
    const [isBlisCoinsEnabled, setIsBlisCoinsEnabled] = useState<boolean>(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const activeCurrencyCodes = config?.monedas_activas || ["USD", "PEN", "MXN", "EUR"];
    const exchangeRates = tasas;
    const safetyMarkup = config?.margen_seguridad || 0.02;

    useEffect(() => {
        if (config?.ultima_actualizacion) {
            setLastUpdated(new Date(config.ultima_actualizacion));
        }
    }, [config?.ultima_actualizacion]);

    const refreshRates = useCallback(async () => {
        const result = await refreshRatesFromAPI();
        if (result.success) {
            setLastUpdated(new Date());
        }
    }, [refreshRatesFromAPI]);

    const convertAmount = useCallback((amount: number, from: string, to: string) => {
        if (from === to) return amount;

        const rateFrom = exchangeRates[from] || 1;
        const rateTo = exchangeRates[to] || 1;

        const amountInUSD = amount / rateFrom;
        let converted = amountInUSD * rateTo;

        if (from !== to) {
            converted = converted * (1 + safetyMarkup);
        }

        return Number(converted.toFixed(2));
    }, [exchangeRates, safetyMarkup]);

    const setSelectedCurrency = useCallback((code: string) => {
        const found = INITIAL_CURRENCIES.find(c => c.code === code);
        if (found) setCurrencyState(found);
    }, []);

    const setTaxCurrency = useCallback((code: string) => {
        const found = INITIAL_CURRENCIES.find(c => c.code === code);
        if (found) setTaxCurrencyState(found);
    }, []);

    const setFiscalCurrency = useCallback((code: string) => {
        const found = INITIAL_CURRENCIES.find(c => c.code === code);
        if (found) setFiscalCurrencyState(found);
    }, []);

    // Convertir cualquier moneda a moneda fiscal (para checkout/pagos)
    const convertToFiscal = useCallback((amount: number, fromCurrency: string) => {
        return convertAmount(amount, fromCurrency, fiscalCurrency.code);
    }, [convertAmount, fiscalCurrency]);

    // Convertir desde moneda fiscal a moneda de visualización
    const convertFromFiscal = useCallback((amount: number, toCurrency: string) => {
        return convertAmount(amount, fiscalCurrency.code, toCurrency);
    }, [convertAmount, fiscalCurrency]);

    const toggleActiveCurrency = useCallback((code: string) => {
        const newCodes = activeCurrencyCodes.includes(code)
            ? activeCurrencyCodes.filter(c => c !== code)
            : [...activeCurrencyCodes, code];
        updateConfig({ monedas_activas: newCodes });
    }, [activeCurrencyCodes, updateConfig]);

    const handleSetActiveCurrencyCodes = useCallback((codes: string[]) => {
        updateConfig({ monedas_activas: codes });
    }, [updateConfig]);

    const handleSetSafetyMarkup = useCallback((markup: number) => {
        updateConfig({ margen_seguridad: markup });
    }, [updateConfig]);

    return (
        <CurrencyContext.Provider
            value={{
                currencies: INITIAL_CURRENCIES,
                selectedCurrency,
                taxCurrency,
                fiscalCurrency,
                activeCurrencyCodes,
                isMultiCurrencyEnabled,
                isBlisCoinsEnabled,
                exchangeRates,
                safetyMarkup,
                lastUpdated,
                setSelectedCurrency,
                setTaxCurrency,
                setFiscalCurrency,
                toggleActiveCurrency,
                setActiveCurrencyCodes: handleSetActiveCurrencyCodes,
                setIsMultiCurrencyEnabled,
                setIsBlisCoinsEnabled,
                setSafetyMarkup: handleSetSafetyMarkup,
                convertAmount,
                convertToFiscal,
                convertFromFiscal,
                refreshRates,
                loading,
            }}
        >
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
