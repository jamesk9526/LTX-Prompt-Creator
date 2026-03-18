export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#f5f3f0',
      color: '#2d2a26',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '12px', fontWeight: 700 }}>404</h1>
      <p style={{ fontSize: '18px', marginBottom: '24px', color: '#8a8580' }}>Page not found</p>
      <a href="/" style={{
        padding: '12px 24px',
        backgroundColor: '#2d2a26',
        color: '#fff',
        textDecoration: 'none',
        borderRadius: '10px',
        fontWeight: '600',
      }}>
        Return Home
      </a>
    </div>
  );
}
