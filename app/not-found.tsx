import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blis-red/5 via-transparent to-transparent" />
      <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-blis-red/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-blis-red/3 rounded-full blur-[100px]" />

      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
        {/* 404 Number */}
        <div className="relative mb-8">
          <h1 className="text-[180px] md:text-[220px] font-black leading-none tracking-tighter"
            style={{
              background: 'linear-gradient(135deg, #d5c108 0%, #f5e100 50%, #d5c108 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <h1 className="text-[180px] md:text-[220px] font-black leading-none tracking-tighter text-white/[0.02]" aria-hidden="true">
              404
            </h1>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4 mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blis-red/10 border border-blis-red/20 rounded-full">
            <div className="w-2 h-2 rounded-full bg-blis-red animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-blis-red">Página no encontrada</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
            Este terreno ya tiene dueño
          </h2>

          <p className="text-white/40 text-sm md:text-base leading-relaxed max-w-md mx-auto">
            Parece que la página que buscas se ha mudado o ya no existe.
            <br />Pero nosotros seguimos aquí, construyendo lo mejor.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/"
            className="px-8 py-4 bg-blis-red rounded-2xl text-white font-bold hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg shadow-blis-red/20">
            Volver al Inicio
          </Link>
          <Link href="/tienda"
            className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-white/60 font-bold hover:bg-white/10 hover:text-white transition-all duration-300">
            Ver Propiedades
          </Link>
        </div>

        {/* Decorative line */}
        <div className="mt-16 flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/10">BLIS CORP</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      </div>
    </div>
  )
}
