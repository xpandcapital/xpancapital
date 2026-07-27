"use client"

import { useState } from 'react'

export default function SeedBlog() {
  const [status, setStatus] = useState('')

  const run = async () => {
    setStatus('Cargando artículos...')
    try {
      const res = await fetch('/api/blog/seed', { method: 'POST' })
      const data = await res.json()
      setStatus(data.message || JSON.stringify(data))
    } catch (e: any) {
      setStatus('Error: ' + e.message)
    }
  }

  return (
    <div className="p-8 text-white">
      <button onClick={run} className="px-6 py-3 bg-blis-red rounded-xl font-bold">
        Insertar 20 Artículos
      </button>
      <pre className="mt-4 text-xs">{status}</pre>
    </div>
  )
}
