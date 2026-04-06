import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blis Corp - Villa Victoria',
  description: 'Blis Corp - Villa Victoria',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, sans-serif', background: '#000', color: '#fff' }}>
        {children}
      </body>
    </html>
  )
}