"use client";

const getAIConfig = () => {
    if (typeof window === 'undefined') return { gemini_key: '', openai_key: '', groq_key: '' };
    const stored = localStorage.getItem('blis_ai_config');
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            return {
                gemini_key: parsed.gemini_key || '',
                openai_key: parsed.openai_key || '',
                groq_key: parsed.groq_key || ''
            };
        } catch { return { gemini_key: '', openai_key: '', groq_key: '' }; }
    }
    return { gemini_key: '', openai_key: '', groq_key: '' };
};

const saveAIConfig = (gemini: string, gpt: string, groq: string = '') => {
    localStorage.setItem('blis_ai_config', JSON.stringify({ gemini_key: gemini, openai_key: gpt, groq_key: groq }));
};

export { getAIConfig, saveAIConfig };