"use client";

const DEFAULT_GEMINI = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'AIzaSyDTaDqoOzRBeDlZlS2rvUFse9aLMVHUsHU';
const DEFAULT_OPENAI = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';

const getAIConfig = () => {
    if (typeof window === 'undefined') return { gemini_key: DEFAULT_GEMINI, openai_key: DEFAULT_OPENAI, groq_key: '' };
    const stored = localStorage.getItem('blis_ai_config');
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            return {
                gemini_key: parsed.gemini_key !== undefined ? parsed.gemini_key : DEFAULT_GEMINI,
                openai_key: parsed.openai_key !== undefined ? parsed.openai_key : DEFAULT_OPENAI,
                groq_key: parsed.groq_key !== undefined ? parsed.groq_key : ''
            };
        } catch { return { gemini_key: DEFAULT_GEMINI, openai_key: DEFAULT_OPENAI, groq_key: '' }; }
    }
    return { gemini_key: DEFAULT_GEMINI, openai_key: DEFAULT_OPENAI, groq_key: '' };
};

const saveAIConfig = (gemini: string, gpt: string, groq: string = '') => {
    localStorage.setItem('blis_ai_config', JSON.stringify({ gemini_key: gemini, openai_key: gpt, groq_key: groq }));
    localStorage.setItem('gemini_key', gemini);
    localStorage.setItem('openai_key', gpt);
    if (groq) localStorage.setItem('groq_key', groq);
};

export { DEFAULT_GEMINI, DEFAULT_OPENAI, getAIConfig, saveAIConfig };