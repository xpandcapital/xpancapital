'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, XCircle, AlertTriangle, Shield, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

function CompraAprobadaContent() {
  const searchParams = useSearchParams()
  const result = searchParams.get('result')
  const reason = searchParams.get('reason')
  const compraId = searchParams.get('id')

  const getContent = () => {
    switch (result) {
      case 'success':
        return {
          icon: <CheckCircle className="w-16 h-16 text-emerald-400" />,
          title: 'Compra Aprobada',
          description: `La compra ${compraId ? `#${compraId.substring(0, 8)}` : ''} ha sido aprobada exitosamente.`,
          details: 'Al cliente se le ha enviado un correo con sus credenciales de acceso y los productos han sido activados.',
          color: 'emerald',
        }
      case 'rejected':
        return {
          icon: <XCircle className="w-16 h-16 text-red-400" />,
          title: 'Compra Rechazada',
          description: `La compra ${compraId ? `#${compraId.substring(0, 8)}` : ''} ha sido rechazada.`,
          details: 'La compra ha sido cancelada. El cliente no recibirá acceso a los productos.',
          color: 'red',
        }
      case 'error':
        const errorMessages: Record<string, string> = {
          token_invalido: 'El enlace de aprobación no es válido.',
          token_ya_usado: 'Este enlace de aprobación ya fue utilizado anteriormente.',
          token_expirado: 'El enlace de aprobación ha expirado (válido por 7 días).',
          compra_no_encontrada: 'La compra asociada a este enlace no existe.',
          compra_ya_procesada: 'Esta compra ya fue procesada anteriormente.',
          error_actualizando: 'Ocurrió un error al procesar la compra.',
          error_interno: 'Error interno del servidor.',
        }
        const msg = reason ? (errorMessages[reason] || reason) : 'Error desconocido.'
        return {
          icon: <AlertTriangle className="w-16 h-16 text-amber-400" />,
          title: 'Error',
          description: msg,
          details: 'Si el problema persiste, inicia sesión en el panel de administración para gestionar la compra manualmente.',
          color: 'amber',
        }
      default:
        return {
          icon: <AlertTriangle className="w-16 h-16 text-amber-400" />,
          title: 'Sin resultado',
          description: 'No se recibió información sobre la operación.',
          details: '',
          color: 'amber',
        }
    }
  }

  const content = getContent()

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl p-8 text-center">
          <div className="mb-6 flex justify-center">
            {content.icon}
          </div>

          <h1 className="text-2xl font-bold text-white mb-3">
            {content.title}
          </h1>

          <p className="text-gray-300 mb-4">
            {content.description}
          </p>

          {content.details && (
            <p className="text-gray-500 text-sm mb-8">
              {content.details}
            </p>
          )}

          <div className="flex flex-col gap-3">
            {result === 'error' && (
              <Link
                href="/superadmin"
                className="inline-flex items-center justify-center gap-2 bg-be0b24 hover:bg-be0b24/90 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                <Shield className="w-4 h-4" />
                Ir al Panel de Administración
              </Link>
            )}
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors py-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-blis-red animate-spin" />
    </div>
  )
}

export default function CompraAprobadaPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CompraAprobadaContent />
    </Suspense>
  )
}
