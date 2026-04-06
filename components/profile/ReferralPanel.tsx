"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
    Copy, Share2, Users, Gift, Check, Loader2, 
    Facebook, Twitter, Mail, Link2, ChevronDown, ChevronUp
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useReferrals } from "@/lib/hooks/useReferrals";
import { useToast } from "@/components/ui/Toast";

export function ReferralPanel() {
    const { user } = useAuth();
    const { referralInfo, loading, error, useReferralCode } = useReferrals(user?.id || null);
    const { showToast } = useToast();
    const [copied, setCopied] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [referralCode, setReferralCode] = useState('');
    const [isValidating, setIsValidating] = useState(false);

    const handleCopy = async () => {
        if (!referralInfo?.referralLink) return;
        
        try {
            await navigator.clipboard.writeText(referralInfo.referralLink);
            setCopied(true);
            showToast('Enlace copiado al portapapeles', 'success');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            showToast('Error al copiar', 'error');
        }
    };

    const handleShare = (platform: 'facebook' | 'twitter' | 'email') => {
        if (!referralInfo?.referralLink) return;

        const text = '¡Únete a BLIS Corp y obtén beneficios exclusivos!';
        let url = '';

        switch (platform) {
            case 'facebook':
                url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralInfo.referralLink)}`;
                break;
            case 'twitter':
                url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(referralInfo.referralLink)}`;
                break;
            case 'email':
                url = `mailto:?subject=${encodeURIComponent('Invitación a BLIS Corp')}&body=${encodeURIComponent(`${text}\n\n${referralInfo.referralLink}`)}`;
                break;
        }

        if (url) {
            window.open(url, '_blank', 'width=600,height=400');
        }
    };

    const handleApplyCode = async () => {
        if (!referralCode.trim()) {
            showToast('Ingresa un código de referido', 'error');
            return;
        }

        setIsValidating(true);
        const result = await useReferralCode(referralCode.trim().toUpperCase());
        
        if (result.success) {
            showToast(`¡Código aplicado! Ganaste ${result.reward} BLIS Coins`, 'success');
            setReferralCode('');
        } else {
            showToast(result.error || 'Código inválido', 'error');
        }
        
        setIsValidating(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8 text-red-400">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-700 rounded-2xl flex items-center justify-center">
                    <Gift className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-white uppercase">Programa de Referidos</h2>
                    <p className="text-gray-400 text-sm">Comparte y gana BLIS Coins</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Users className="w-5 h-5 text-emerald-500" />
                        <span className="text-gray-400 text-sm">Referidos</span>
                    </div>
                    <p className="text-3xl font-black text-white">{referralInfo?.totalReferrals || 0}</p>
                </div>
                <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Gift className="w-5 h-5 text-amber-500" />
                        <span className="text-gray-400 text-sm">Coins Ganados</span>
                    </div>
                    <p className="text-3xl font-black text-white">{referralInfo?.totalEarned || 0}</p>
                </div>
                <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Link2 className="w-5 h-5 text-blue-500" />
                        <span className="text-gray-400 text-sm">Tu Código</span>
                    </div>
                    <p className="text-2xl font-black text-white font-mono">{referralInfo?.referralCode || '---'}</p>
                </div>
            </div>

            {/* Share Section */}
            <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-700/10 border border-emerald-500/20 rounded-[2rem] p-6">
                <h3 className="text-lg font-bold text-white mb-4">Comparte tu enlace</h3>
                
                <div className="bg-zinc-950 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-3">
                        <code className="flex-1 text-sm text-gray-300 truncate">
                            {referralInfo?.referralLink || '---'}
                        </code>
                        <button
                            onClick={handleCopy}
                            className="shrink-0 w-10 h-10 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center justify-center transition-colors"
                        >
                            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => handleShare('facebook')}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1877F2]/20 hover:bg-[#1877F2]/30 border border-[#1877F2]/30 text-white rounded-xl transition-colors"
                    >
                        <Facebook className="w-4 h-4" />
                        <span className="text-sm font-bold">Facebook</span>
                    </button>
                    <button
                        onClick={() => handleShare('twitter')}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1DA1F2]/20 hover:bg-[#1DA1F2]/30 border border-[#1DA1F2]/30 text-white rounded-xl transition-colors"
                    >
                        <Twitter className="w-4 h-4" />
                        <span className="text-sm font-bold">Twitter</span>
                    </button>
                    <button
                        onClick={() => handleShare('email')}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-700/50 hover:bg-zinc-700 border border-white/10 text-white rounded-xl transition-colors"
                    >
                        <Mail className="w-4 h-4" />
                        <span className="text-sm font-bold">Email</span>
                    </button>
                </div>
            </div>

            {/* Apply Referral Code */}
            {user && !referralInfo?.referralCode?.startsWith('USR') && (
                <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">¿Tienes un código de referido?</h3>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={referralCode}
                            onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                            placeholder="Ingresa el código"
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500 transition-all uppercase font-mono"
                            maxLength={8}
                        />
                        <button
                            onClick={handleApplyCode}
                            disabled={isValidating || !referralCode.trim()}
                            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors"
                        >
                            {isValidating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Aplicar'}
                        </button>
                    </div>
                </div>
            )}

            {/* Referrals History */}
            {referralInfo?.referrals && referralInfo.referrals.length > 0 && (
                <div className="bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden">
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="w-full flex items-center justify-between p-6 hover:bg-white/[0.02] transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <Users className="w-5 h-5 text-emerald-500" />
                            <span className="font-bold text-white">Mis Referidos</span>
                            <span className="text-gray-400 text-sm">({referralInfo.referrals.length})</span>
                        </div>
                        {showHistory ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                    </button>
                    
                    {showHistory && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-white/5"
                        >
                            <div className="divide-y divide-white/5">
                                {referralInfo.referrals.map((referral) => (
                                    <div key={referral.id} className="flex items-center gap-4 p-4">
                                        <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center border border-white/10">
                                            {referral.referido?.avatar_url ? (
                                                <img src={referral.referido.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                <span className="text-white font-bold text-sm">
                                                    {(referral.referido?.nombre || 'U')[0].toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-white text-sm truncate">
                                                {referral.referido?.nombre || 'Usuario'} {referral.referido?.apellido || ''}
                                            </p>
                                            <p className="text-gray-500 text-xs">
                                                {new Date(referral.creado_en).toLocaleDateString('es-ES', { 
                                                    day: 'numeric', 
                                                    month: 'short', 
                                                    year: 'numeric' 
                                                })}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                                                referral.estado === 'activo' 
                                                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                                                    : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                                            }`}>
                                                {referral.estado}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            )}
        </div>
    );
}

export default ReferralPanel;