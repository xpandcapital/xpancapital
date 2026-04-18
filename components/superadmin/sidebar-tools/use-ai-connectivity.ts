"use client";

import { useState, useEffect } from 'react';
import { getAIConfig } from './ai-config';

const useAIConnectivity = () => {
    const [status, setStatus] = useState<{
        gemini: boolean,
        gpt: boolean,
        groq: boolean,
        loading: boolean,
        geminiModel: string,
        gptModel: string,
        groqModel: string
    }>({
        gemini: false,
        gpt: false,
        groq: false,
        loading: true,
        geminiModel: '...',
        gptModel: '...',
        groqModel: '...'
    });

    const checkConnections = async () => {
        setStatus(prev => ({ ...prev, loading: true }));
        const config = getAIConfig();

        const callProxy = async (service: string, key: string) => {
            try {
                if (!key || key.length < 5) return { ok: false, msg: 'Offline' };
                const r = await fetch('/api/test-connection', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ service, key }),
                });
                const d = await r.json();
                return { ok: d.ok, msg: d.msg };
            } catch { return { ok: false, msg: 'Offline' }; }
        };

        const [gRes, oRes, qRes] = await Promise.all([
            callProxy('ai-gemini', config.gemini_key),
            callProxy('ai-openai', config.openai_key),
            callProxy('ai-groq', config.groq_key)
        ]);

        setStatus({
            gemini: gRes.ok,
            gpt: oRes.ok,
            groq: qRes.ok,
            loading: false,
            geminiModel: gRes.ok ? gRes.msg.replace(' (Proxy)', '') : 'Offline',
            gptModel: oRes.ok ? oRes.msg.replace(' (Proxy)', '') : 'Offline',
            groqModel: qRes.ok ? qRes.msg.replace(' (Proxy)', '') : 'Offline'
        });
    };

    useEffect(() => {
        checkConnections();
        const interval = setInterval(checkConnections, 60000);

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'blis_ai_config' || e.key === 'gemini_key' || e.key === 'openai_key' || e.key === 'groq_key') {
                checkConnections();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('blis_config_updated', checkConnections);

        return () => {
            clearInterval(interval);
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('blis_config_updated', checkConnections);
        };
    }, []);

    return { ...status, refresh: checkConnections };
};

export { useAIConnectivity };