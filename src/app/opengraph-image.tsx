import { ImageResponse } from 'next/og';

// Default social share image for every page (unless a route provides its own).
export const alt = 'B2 Transport - Packers and Movers and Goods Transport in Ranchi, Jharkhand';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: 'linear-gradient(135deg, #030712 0%, #0b1730 60%, #0e3a4a 100%)',
          color: '#f8fafc',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 88, fontWeight: 800, display: 'flex' }}>
          B2&nbsp;<span style={{ color: '#22d3ee' }}>Transport</span>
        </div>
        <div style={{ fontSize: 46, marginTop: 24, color: '#e2e8f0' }}>
          Packers &amp; Movers · Goods Transport
        </div>
        <div style={{ fontSize: 36, marginTop: 16, color: '#94a3b8' }}>
          Ranchi, Jharkhand · All 24 districts
        </div>
        <div style={{ fontSize: 40, marginTop: 48, color: '#22d3ee', fontWeight: 700 }}>
          Call / WhatsApp: 76547 22708
        </div>
      </div>
    ),
    { ...size }
  );
}
