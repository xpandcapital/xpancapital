'use client'

import { CorreoLayout } from './_components/CorreoLayout'

export default function CorreoPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Correo Corporativo</h1>
          <p className="text-sm text-gray-400 mt-1">Gestiona tus correos empresariales con IMAP</p>
        </div>
      </div>

      <CorreoLayout />
    </div>
  )
}
