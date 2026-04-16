'use client'

import React from 'react'

export function Section({ title, icon, children }: { 
  title: string
  icon: React.ReactNode
  children: React.ReactNode 
}) {
  return (
    <div className="bg-zinc-950 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
      <div className="px-8 py-6 border-b border-white/5 bg-white/[0.02] flex items-center gap-4">
        {icon}
        <h2 className="text-xl font-black text-white uppercase tracking-widest">{title}</h2>
      </div>
      <div className="p-8">{children}</div>
    </div>
  )
}

export function Field({ label, children }: { 
  label: string
  children: React.ReactNode 
}) {
  return (
    <div>
      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">{label}</label>
      {children}
    </div>
  )
}

export function InputField({ label, value, onChange, placeholder, type = 'text' }: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <Field label={label}>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-blis-red/50 font-bold"
      />
    </Field>
  )
}

export function TextAreaField({ label, value, onChange, placeholder, rows = 3 }: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
}) {
  return (
    <Field label={label}>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-blis-red/50 transition-all resize-none font-medium"
      />
    </Field>
  )
}