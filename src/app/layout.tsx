import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Outfit } from "next/font/google";
import "./globals.css";
import SiteLayout from "@/components/SiteLayout";
import { BUSINESS_ID, SITE_NAME, SITE_URL } from "@/lib/seo";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
});

export const viewport: Viewport = {
  themeColor: "#030712",
  width: "device-width",
  initialScale: 1,
};

// Site-wide defaults only. Canonical, Open Graph URL and robots are set per page
// (see src/lib/seo.ts) so the 404 page and future pages never inherit the homepage's.
export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: "B2 Transport: home shifting, packers and movers, pickup and truck hire, and goods transport from Ranchi across Jharkhand.",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    siteName: SITE_NAME,
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Only verified facts here. Add streetAddress, postalCode, geo and
  // openingHoursSpecification once the exact office address and hours are confirmed.
  // WebSite + business, with brand spellings people type ("b2transport").
  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    "name": SITE_NAME,
    "alternateName": ["B2Transport", "B2 Transport Ranchi", "b2transport.in"],
    "url": SITE_URL,
    "publisher": { "@id": BUSINESS_ID }
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MovingCompany",
    "@id": BUSINESS_ID,
    "name": SITE_NAME,
    "alternateName": ["B2Transport", "B2 Transport Ranchi"],
    "description": "Packers and movers, house shifting, goods transport, and bike and car transport from Ranchi to all districts of Jharkhand and other states.",
    "url": SITE_URL,
    "logo": `${SITE_URL}/brand/b2-logo-512.png`,
    "image": `${SITE_URL}/opengraph-image`,
    "telephone": "+91-7654722708",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Ranchi",
      "addressRegion": "Jharkhand",
      "addressCountry": "IN"
    },
    "areaServed": {
      "@type": "State",
      "name": "Jharkhand"
    }
  };

  return (
    <html lang="en-IN" className={`${spaceGrotesk.variable} ${outfit.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([websiteLd, jsonLd]) }}
        />
      </head>
      <body>
        <SiteLayout>{children}</SiteLayout>
      </body>
    </html>
  );
}
