'use client'

export default function SuperadminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-blis-red/10 flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-blis-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-white uppercase">Error del Sistema</h2>
        <p className="text-zinc-500 text-sm">{error.message || 'Ha ocurrido un error inesperado en el panel de administración.'}</p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-blis-red text-white font-bold uppercase text-xs tracking-widest rounded-xl hover:bg-blis-red/80 transition-all"
        >
          Reintentar
        </button>
      </div>
    </div>
  )
}