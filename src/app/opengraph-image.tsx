import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

// Default social share image for every page (WhatsApp, Facebook, X, Google share).
// Content is centred: WhatsApp's small preview crops the middle square (x 285-915).
export const alt = 'B2 Transport - Packers and Movers and Goods Transport in Ranchi, Jharkhand';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const NAVY = '#0b2f66';
const NAVY_DARK = '#071d42';
const ORANGE = '#f47a0f';
const SLATE = '#475569';

export default async function OpengraphImage() {
  const root = process.cwd();
  const [logo, extraBoldItalic, bold, medium] = await Promise.all([
    readFile(join(root, 'public/brand/b2-logo-mark.png')),
    readFile(join(root, 'assets/fonts/Montserrat-ExtraBoldItalic.woff')),
    readFile(join(root, 'assets/fonts/Montserrat-Bold.woff')),
    readFile(join(root, 'assets/fonts/Montserrat-Medium.woff')),
  ]);
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          background: 'linear-gradient(180deg, #ffffff 0%, #f2f5fa 100%)',
          fontFamily: 'Montserrat',
        }}
      >
        {/* Top brand stripe */}
        <div style={{ display: 'flex', width: '100%', height: 12 }}>
          <div style={{ flex: 3, background: NAVY }} />
          <div style={{ flex: 1, background: ORANGE }} />
        </div>

        {/* Decorative speed lines, outside the centre crop */}
        <div style={{ position: 'absolute', top: 150, right: 60, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 22 }}>
          <div style={{ width: 190, height: 10, borderRadius: 5, background: ORANGE, opacity: 0.85 }} />
          <div style={{ width: 130, height: 10, borderRadius: 5, background: ORANGE, opacity: 0.6 }} />
          <div style={{ width: 80, height: 10, borderRadius: 5, background: ORANGE, opacity: 0.35 }} />
        </div>
        <div style={{ position: 'absolute', top: 150, left: 60, display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ width: 80, height: 10, borderRadius: 5, background: NAVY, opacity: 0.35 }} />
          <div style={{ width: 130, height: 10, borderRadius: 5, background: NAVY, opacity: 0.6 }} />
          <div style={{ width: 190, height: 10, borderRadius: 5, background: NAVY, opacity: 0.85 }} />
        </div>

        {/* Logo + wordmark */}
        <img src={logoSrc} width={372} height={188} style={{ marginTop: 50 }} alt="" />
        <div
          style={{
            marginTop: 22,
            fontSize: 72,
            fontWeight: 800,
            fontStyle: 'italic',
            color: NAVY,
            letterSpacing: 1,
            lineHeight: 1,
          }}
        >
          B2 TRANSPORT
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginTop: 24, gap: 14, color: SLATE, fontSize: 23, fontWeight: 500, letterSpacing: 1.5 }}>
          <div style={{ width: 10, height: 10, borderRadius: 5, background: ORANGE }} />
          <span>PACKERS &amp; MOVERS</span>
          <div style={{ width: 10, height: 10, borderRadius: 5, background: ORANGE }} />
          <span>GOODS TRANSPORT</span>
          <div style={{ width: 10, height: 10, borderRadius: 5, background: ORANGE }} />
        </div>
        <div style={{ marginTop: 16, color: SLATE, fontSize: 24, fontWeight: 500 }}>
          Ranchi, Jharkhand · All 24 districts · Interstate
        </div>

        {/* Contact band */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 112,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 22,
            background: `linear-gradient(90deg, ${NAVY_DARK} 0%, ${NAVY} 50%, ${NAVY_DARK} 100%)`,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 60,
              height: 60,
              borderRadius: 30,
              background: ORANGE,
            }}
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ color: '#cbd5e1', fontSize: 20, fontWeight: 500, letterSpacing: 2 }}>CALL / WHATSAPP</div>
            <div style={{ color: '#ffffff', fontSize: 42, fontWeight: 700, letterSpacing: 1, lineHeight: 1.1 }}>76547 22708</div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Montserrat', data: extraBoldItalic, weight: 800, style: 'italic' },
        { name: 'Montserrat', data: bold, weight: 700, style: 'normal' },
        { name: 'Montserrat', data: medium, weight: 500, style: 'normal' },
      ],
    }
  );
}
