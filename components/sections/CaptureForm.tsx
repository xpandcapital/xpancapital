"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, CheckCircle, User, Mail, Phone, MapPin, MessageSquare } from "lucide-react";

declare global {
  interface Window { turnstile: { render: (el: string | HTMLElement, opts: { sitekey: string; callback: (token: string) => void }) => string; remove: (id: string) => void; reset: (id: string) => void } }
}

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'select' | 'textarea' | 'checkbox' | 'radio';
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

interface CaptureFormProps {
  data?: {
    title?: string;
    subtitle?: string;
    fields?: FormField[];
    submitText?: string;
    successTitle?: string;
    successMessage?: string;
    accentColor?: string;
    privacyText?: string;
    redirectUrl?: string;
    externalRedirectUrl?: string;
    campana_id?: string;
    asesor_id?: string;
    template_id?: string;
  };
}

export function CaptureForm({ data = {} }: CaptureFormProps) {
  const [formData, setFormData] = useState<Record<string, string | boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [turnstileSiteKey, setTurnstileSiteKey] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileSolved, setTurnstileSolved] = useState(false);
  const turnstileContainerRef = useRef<HTMLDivElement>(null);

  // Cargar script + site_key
  useEffect(() => {
    fetch('/api/admin/seguridad').then(r => r.json()).then(d => {
      if (d?.data?.bot_protection?.habilitado) {
        const key = d.data.bot_protection.site_key
        if (key) {
          setTurnstileSiteKey(key)
          if (!document.querySelector('script[src*="turnstile"]')) {
            const script = document.createElement('script')
            script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
            script.async = true
            script.defer = true
            document.head.appendChild(script)
          }
        }
      }
    }).catch(() => {})
  }, [])

  // Renderizar widget cuando siteKey está lista
  useEffect(() => {
    if (!turnstileSiteKey || !turnstileContainerRef.current) return
    const el = turnstileContainerRef.current
    if (el.hasAttribute('data-rendered')) return
    let attempts = 0
    const tryRender = () => {
      if (window.turnstile) {
        window.turnstile.render(el, {
          sitekey: turnstileSiteKey,
          theme: 'dark',
          language: 'es',
          size: 'normal',
          appearance: 'always',
          callback: (token: string) => {
            setTurnstileToken(token)
            setTurnstileSolved(true)
          }
        })
        el.setAttribute('data-rendered', '1')
      } else if (attempts < 30) {
        attempts++
        setTimeout(tryRender, 200)
      }
    }
    tryRender()
  }, [turnstileSiteKey])

  const {
    title = "Regístrate Ahora",
    subtitle = "Completa el formulario para acceder",
    fields = [
      { name: 'nombre', label: 'Nombre Completo', type: 'text', placeholder: 'Tu nombre', required: true },
      { name: 'email', label: 'Email', type: 'email', placeholder: 'tu@email.com', required: true },
      { name: 'telefono', label: 'WhatsApp', type: 'tel', placeholder: '+51 999 999 999', required: true }
    ],
    submitText = "Enviar",
    successTitle = "¡Registro Exitoso!",
    successMessage = "Te contactaremos a la brevedad.",
    accentColor = "#B10D24",
    privacyText = "Al enviar aceptas los términos y condiciones.",
    redirectUrl,
    externalRedirectUrl,
    campana_id,
    asesor_id,
    template_id
  } = data;

  const handleChange = (name: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    fields.forEach(field => {
      const value = formData[field.name];
      
      if (field.required) {
        if (field.type === 'checkbox') {
          if (!value) {
            newErrors[field.name] = `Debes aceptar ${field.label.toLowerCase()}`;
          }
        } else if (typeof value === 'string' && !value.trim()) {
          newErrors[field.name] = `${field.label} es requerido`;
        }
      }
      
      if (field.type === 'email' && typeof value === 'string' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          newErrors[field.name] = 'Email inválido';
        }
      }
      
      if (field.type === 'tel' && typeof value === 'string' && value) {
        const phoneRegex = /^[+]?[\d\s-]{7,15}$/;
        if (!phoneRegex.test(value.replace(/\s/g, ''))) {
          newErrors[field.name] = 'Teléfono inválido';
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      // Convert formData to proper format
      const leadData: Record<string, string | boolean> = {};
      fields.forEach(field => {
        if (formData[field.name] !== undefined) {
          leadData[field.name] = formData[field.name];
        }
      });

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...leadData,
          nombre: leadData.nombre || leadData.name || '',
          email: leadData.email || '',
          telefono: leadData.telefono || leadData.phone || '',
          whatsapp: leadData.whatsapp || leadData.telefono || '',
          ciudad: leadData.ciudad || leadData.city || '',
          presupuesto: leadData.presupuesto || leadData.budget || '',
          mensaje: leadData.mensaje || leadData.message || '',
          campana_id,
          asesor_id,
          template_id,
          fuente: 'formulario_web',
          datos: leadData,
          cf_turnstile_response: turnstileToken || undefined
        })
      });
      
      if (response.ok) {
        setIsSuccess(true);
        
        // Handle redirect
        const redirectTarget = externalRedirectUrl || redirectUrl;
        if (redirectTarget) {
          setTimeout(() => {
            window.location.href = redirectTarget;
          }, 1500);
        }
      } else {
        const errorData = await response.json();
        setErrors({ submit: errorData.error || 'Error al enviar. Intenta de nuevo.' });
      }
    } catch {
      setErrors({ submit: 'Error al enviar. Intenta de nuevo.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldIcon = (type: string, name: string) => {
    if (name === 'nombre' || name === 'name') return <User className="w-5 h-5" />;
    if (name === 'email' || type === 'email') return <Mail className="w-5 h-5" />;
    if (name === 'telefono' || name === 'phone' || name === 'whatsapp' || type === 'tel') return <Phone className="w-5 h-5" />;
    if (name === 'ubicacion' || name === 'ciudad' || name === 'city') return <MapPin className="w-5 h-5" />;
    if (name === 'mensaje' || name === 'message' || type === 'textarea') return <MessageSquare className="w-5 h-5" />;
    return null;
  };

  const renderField = (field: FormField, index: number) => {
    const icon = getFieldIcon(field.type, field.name);
    
    if (field.type === 'select') {
      return (
        <select
          value={String(formData[field.name] || '')}
          onChange={(e) => handleChange(field.name, e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-[var(--accent)] transition-all appearance-none"
          style={{ '--accent': accentColor } as React.CSSProperties}
        >
          <option value="" disabled className="bg-zinc-900">{field.placeholder || 'Seleccionar...'}</option>
          {field.options?.map(opt => (
            <option key={opt} value={opt} className="bg-zinc-900">{opt}</option>
          ))}
        </select>
      );
    }
    
    if (field.type === 'textarea') {
      return (
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-4 text-gray-500">
              {icon}
            </div>
          )}
          <textarea
            name={field.name}
            value={String(formData[field.name] || '')}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            className={`w-full bg-white/5 border rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-[var(--accent)] transition-all resize-none ${errors[field.name] ? 'border-red-500' : 'border-white/10'} ${icon ? 'pl-12' : ''}`}
            style={{ '--accent': accentColor } as React.CSSProperties}
          />
        </div>
      );
    }
    
    if (field.type === 'checkbox') {
      return (
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={Boolean(formData[field.name])}
            onChange={(e) => handleChange(field.name, e.target.checked)}
            className="w-5 h-5 mt-0.5 rounded accent-blis-red"
            style={{ accentColor }}
          />
          <span className="text-sm text-gray-300">{field.label}</span>
        </label>
      );
    }
    
    if (field.type === 'radio' && field.options) {
      return (
        <div className="space-y-2">
          {field.options.map((opt, optIdx) => (
            <label key={optIdx} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name={field.name}
                value={opt}
                checked={formData[field.name] === opt}
                onChange={(e) => handleChange(field.name, e.target.value)}
                className="w-5 h-5 accent-blis-red"
                style={{ accentColor }}
              />
              <span className="text-sm text-gray-300">{opt}</span>
            </label>
          ))}
        </div>
      );
    }
    
    // Default: text, email, tel
    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
            {icon}
          </div>
        )}
        <input
          type={field.type}
          name={field.name}
          value={String(formData[field.name] || '')}
          onChange={(e) => handleChange(field.name, e.target.value)}
          placeholder={field.placeholder}
          className={`w-full bg-white/5 border rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-[var(--accent)] transition-all ${errors[field.name] ? 'border-red-500' : 'border-white/10'} ${icon ? 'pl-12' : ''}`}
          style={{ '--accent': accentColor } as React.CSSProperties}
        />
      </div>
    );
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-12"
          >
            <div 
              className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6"
              style={{ backgroundColor: `${accentColor}20` }}
            >
              <CheckCircle className="w-10 h-10" style={{ color: accentColor }} />
            </div>
            <h3 className="text-2xl font-black text-white mb-2">{successTitle}</h3>
            <p className="text-gray-400">{successMessage}</p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-2">
                {title}
              </h3>
              {subtitle && (
                <p className="text-gray-400 text-sm">{subtitle}</p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.name || index}>
                  {field.type !== 'checkbox' && field.type !== 'radio' && (
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      {field.label}
                      {field.required && <span style={{ color: accentColor }}>*</span>}
                    </label>
                  )}
                  
                  {renderField(field, index)}
                  
                  {errors[field.name] && (
                    <p className="text-red-400 text-xs mt-1">{errors[field.name]}</p>
                  )}
                </div>
              ))}

              {errors.submit && (
                <p className="text-red-400 text-sm text-center">{errors.submit}</p>
              )}

              {turnstileSiteKey && (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    {turnstileSolved ? (
                      <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5" />
                        ✓ Humano verificado
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-red-400 font-bold uppercase tracking-wider animate-pulse">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400 mr-1.5" />
                        Escaneando conexión...
                      </span>
                    )}
                  </div>
                  <div className={`border-2 transition-all duration-500 overflow-hidden w-fit mx-auto ${
                    turnstileSolved
                      ? 'border-emerald-500/60 shadow-[0_0_16px_rgba(16,185,129,0.4)]'
                      : 'border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.3)]'
                  }`}>
                    <div ref={turnstileContainerRef} className="[&>iframe]:block [&>iframe]:m-0 leading-[0]" />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 shadow-2xl"
                style={{ backgroundColor: accentColor, color: '#fff' }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    {submitText}
                    <Send className="w-5 h-5" />
                  </>
                )}
              </button>

              {privacyText && (
                <p className="text-center text-[10px] text-gray-500 mt-4">
                  {privacyText}
                </p>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}