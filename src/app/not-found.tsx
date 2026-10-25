import Link from 'next/link';

// Next.js adds <meta name="robots" content="noindex"> to 404 responses automatically.
export default function NotFound() {
  return (
    <section className="section-padding">
      <div className="container" style={{ textAlign: 'center', maxWidth: 640 }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: 16 }}>Page not found</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>
          The page you are looking for does not exist. You can go back to the homepage or
          view our shifting services in Ranchi.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="btn-neon">Go to Homepage</Link>
          <Link href="/locations/ranchi" className="btn-secondary">Ranchi Services</Link>
        </div>
      </div>
    </section>
  );
}
