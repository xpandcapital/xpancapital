'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="bg-zinc-950 min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full text-center space-y-6 p-8">
          <div className="w-20 h-20 rounded-full bg-blis-red/10 flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-blis-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Error Crítico</h2>
          <p className="text-zinc-500 text-sm">Ha ocurrido un error inesperado. Por favor, recarga la página.</p>
          <button
            onClick={reset}
            className="px-8 py-4 bg-blis-red text-white font-bold uppercase text-xs tracking-widest rounded-xl hover:bg-blis-red/80 transition-all"
          >
            Recargar Página
          </button>
        </div>
      </div>
  )
}