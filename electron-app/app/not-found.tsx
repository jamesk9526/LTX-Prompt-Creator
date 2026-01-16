export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#0b0c10',
      color: '#e9e6df',
      fontFamily: "'Space Grotesk', sans-serif",
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '12px' }}>404</h1>
      <p style={{ fontSize: '18px', marginBottom: '24px' }}>Page not found</p>
      <a href="/" style={{
        padding: '12px 24px',
        backgroundColor: '#ff7a18',
        color: '#0b0c10',
        textDecoration: 'none',
        borderRadius: '12px',
        fontWeight: '700',
      }}>
        Return Home
      </a>
    </div>
  );
}
