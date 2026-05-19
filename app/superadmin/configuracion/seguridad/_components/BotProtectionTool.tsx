"use client";

import { useState } from 'react';
import { Bot, Key, ExternalLink, Copy, Check, Eye, EyeOff, Code, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import type { BotProtectionConfig, BotRouteConfig } from '../_types';
import { defaultBotProtectionConfig } from '../_types';

interface Props {
  config?: BotProtectionConfig
  saving?: boolean
  onSave?: () => void
  onUpdate?: (updates: Partial<BotProtectionConfig>) => void
}

export function BotProtectionTool({ config, saving, onSave, onUpdate }: Props) {
  const bp = config || defaultBotProtectionConfig
  const [showSecret, setShowSecret] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const rutasActivas = bp.rutas.filter(r => r.habilitado).length

  const toggleRuta = (idx: number) => {
    if (!onUpdate) return
    const nuevas = [...bp.rutas]
    nuevas[idx] = { ...nuevas[idx], habilitado: !nuevas[idx].habilitado }
    onUpdate({ rutas: nuevas })
  }

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const embedCode = (siteKey: string) =>
    `<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>\n<div class="cf-turnstile" data-sitekey="${siteKey}"></div>`

  const apiCheckCode = `// En tu API route (ej: app/api/leads/route.ts)
import { createClient } from '@supabase/supabase-js'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'
import { verifyTurnstileToken } from '@/lib/bot-protection'

// Dentro del handler:
const body = await request.json()
const token = body.cf_turnstile_response

const supabase = createClient(url, serviceKey)
const { data: config } = await supabase
  .from('site_config')
  .select('security_config')
  .eq('empresa_id', DEFAULT_EMPRESA_ID)
  .single()

const bp = data?.security_config?.bot_protection
const habilitado = bp?.habilitado && bp?.rutas?.some(r => r.ruta === '/api/leads' && r.habilitado)

if (habilitado) {
  const result = await verifyTurnstileToken(token, bp.secret_key)
  if (!result.success) {
    return NextResponse.json({ error: 'Verificación de bot fallida' }, { status: 400 })
  }
}`

  const rutasRestantes = bp.rutas.filter(r => !r.habilitado).length

  return (
    <div className="bg-zinc-950 rounded-xl border border-white/5">
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center">
            <Bot className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight text-white">Bot Protection</h2>
            <p className="text-xs text-gray-500">CAPTCHA invisible · Cloudflare Turnstile · Sin cookies</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className={`text-xs ${bp.habilitado ? 'text-green-400' : 'text-gray-500'}`}>
              {bp.habilitado ? 'Activo' : 'Inactivo'}
            </span>
            <button
              onClick={() => onUpdate?.({ habilitado: !bp.habilitado })}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                bp.habilitado ? 'bg-green-500' : 'bg-zinc-700'
              }`}
            >
              <motion.div
                animate={{ x: bp.habilitado ? 20 : 2 }}
                className="w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-md"
              />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-zinc-900 rounded-lg px-3 py-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs text-gray-300">
              {rutasActivas} / {bp.rutas.length} formularios protegidos
            </span>
          </div>
          {rutasActivas > 0 && rutasRestantes > 0 && (
            <button
              onClick={() => onUpdate?.({ rutas: bp.rutas.map(r => ({ ...r, habilitado: true })) })}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg text-xs font-medium hover:bg-cyan-500/20 transition-colors"
            >
              Activar todos
            </button>
          )}
        </div>
      </div>

      {bp.habilitado && (
        <div className="p-6 space-y-5">
          {/* Step 1: Get keys */}
          <div className="bg-zinc-900 rounded-xl p-5 border border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <Key className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-bold text-white">1. Claves de Turnstile</span>
              <a
                href="https://dash.cloudflare.com/?to=/:account/turnstile"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300"
              >
                Obtener claves gratis <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">Site Key (pública)</label>
                <input
                  type="text"
                  value={bp.site_key}
                  onChange={e => onUpdate?.({ site_key: e.target.value })}
                  placeholder="0x4AAAAAA..."
                  className="w-full bg-zinc-800 rounded-lg px-3 py-2 text-xs text-white font-mono outline-none border border-white/5 focus:border-cyan-500/30"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">Secret Key (privada)</label>
                <div className="relative">
                  <input
                    type={showSecret ? 'text' : 'password'}
                    value={bp.secret_key}
                    onChange={e => onUpdate?.({ secret_key: e.target.value })}
                    placeholder="0x4AAAAAA..."
                    className="w-full bg-zinc-800 rounded-lg px-3 py-2 text-xs text-white font-mono outline-none border border-white/5 focus:border-cyan-500/30 pr-10"
                  />
                  <button
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                  >
                    {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Form routes */}
          <div className="bg-zinc-900 rounded-xl p-5 border border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <Code className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-bold text-white">2. Formularios protegidos</span>
            </div>
            <div className="space-y-1.5">
              {bp.rutas.map((ruta, i) => (
                <div
                  key={ruta.ruta}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors ${
                    ruta.habilitado ? 'bg-cyan-500/3 border-cyan-500/10' : 'bg-zinc-800 border-white/5 opacity-60'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <code className="text-xs text-gray-300 font-mono">{ruta.ruta}</code>
                    <p className="text-[10px] text-gray-500">{ruta.descripcion}</p>
                  </div>
                  <button
                    onClick={() => toggleRuta(i)}
                    className={`w-8 h-4 rounded-full transition-colors relative shrink-0 ${
                      ruta.habilitado ? 'bg-cyan-500' : 'bg-zinc-700'
                    }`}
                  >
                    <motion.div
                      animate={{ x: ruta.habilitado ? 14 : 1 }}
                      className="w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 shadow-md"
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Step 3: Embed code */}
          {bp.site_key && rutasActivas > 0 && (
            <div className="bg-zinc-900 rounded-xl p-5 border border-white/5">
              <div className="flex items-center gap-2 mb-4">
                <Code className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-bold text-white">3. Código de integración</span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] text-gray-500 uppercase font-bold">HTML — Agregar al formulario</span>
                    <button
                      onClick={() => copyToClipboard(embedCode(bp.site_key), 'html')}
                      className="text-[10px] text-gray-500 hover:text-white flex items-center gap-1"
                    >
                      {copiedKey === 'html' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                      {copiedKey === 'html' ? 'Copiado' : 'Copiar'}
                    </button>
                  </div>
                  <pre className="bg-zinc-950 rounded-lg p-3 text-[10px] text-gray-300 font-mono overflow-x-auto">
{embedCode(bp.site_key)}</pre>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] text-gray-500 uppercase font-bold">API — Verificar token en el backend</span>
                    <button
                      onClick={() => copyToClipboard(apiCheckCode, 'api')}
                      className="text-[10px] text-gray-500 hover:text-white flex items-center gap-1"
                    >
                      {copiedKey === 'api' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                      {copiedKey === 'api' ? 'Copiado' : 'Copiar'}
                    </button>
                  </div>
                  <pre className="bg-zinc-950 rounded-lg p-3 text-[10px] text-gray-300 font-mono overflow-x-auto max-h-60 overflow-y-auto">
{apiCheckCode}</pre>
                </div>
              </div>
            </div>
          )}

          {/* Save */}
          <div className="flex justify-end pt-2 border-t border-white/5">
            <button
              onClick={onSave}
              disabled={saving}
              className="px-5 py-2.5 bg-blis-red text-white text-sm font-bold rounded-xl hover:bg-blis-red/80 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar cambios'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
