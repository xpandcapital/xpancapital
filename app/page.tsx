export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <h1 style={{
        fontSize: '4rem',
        fontWeight: 700,
        marginBottom: '1rem',
        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textAlign: 'center'
      }}>
        Blis Corp
      </h1>
      <h2 style={{
        fontSize: '2rem',
        fontWeight: 400,
        color: '#a1a1aa',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        Villa Victoria
      </h2>
      <p style={{
        fontSize: '1.25rem',
        color: '#71717a',
        textAlign: 'center'
      }}>
        🚧 En construcción 🚧
      </p>
    </main>
  )
}