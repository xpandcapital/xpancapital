"use client";

import { useState, useEffect } from 'react';

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

        const callProxy = async (service: string) => {
            try {
                const r = await fetch('/api/test-connection', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ service }),
                });
                const d = await r.json();
                return { ok: d.ok, msg: d.msg };
            } catch { return { ok: false, msg: 'Offline' }; }
        };

        const [gRes, oRes, qRes] = await Promise.all([
            callProxy('ai-gemini'),
            callProxy('ai-openai'),
            callProxy('ai-groq')
        ]);

        setStatus({
            gemini: gRes.ok,
            gpt: oRes.ok,
            groq: qRes.ok,
            loading: false,
            geminiModel: gRes.ok ? gRes.msg : 'Offline',
            gptModel: oRes.ok ? oRes.msg : 'Offline',
            groqModel: qRes.ok ? qRes.msg : 'Offline'
        });
    };

    useEffect(() => {
        checkConnections();
        const interval = setInterval(checkConnections, 60000);

        window.addEventListener('blis_config_updated', checkConnections);

        return () => {
            clearInterval(interval);
            window.removeEventListener('blis_config_updated', checkConnections);
        };
    }, []);

    return { ...status, refresh: checkConnections };
};

export { useAIConnectivity };