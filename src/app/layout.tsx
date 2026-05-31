import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Outfit } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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

export const metadata: Metadata = {
  title: {
    default: "B2 Transport | Packers & Movers, House Shifting Ranchi Jharkhand",
    template: "%s | B2 Transport Jharkhand"
  },
  description: "B2 Transport provides premium, affordable house shifting, goods logistics, and pickup van rental services in Ranchi and all districts of Jharkhand. Call 7654722708 today for a free quote.",
  keywords: [
    "house shifting Ranchi",
    "packers and movers Ranchi",
    "b2 Transport Ranchi",
    "goods transport Jharkhand",
    "pickup van hire Ranchi",
    "chota hathi Ranchi",
    "transport vehicle Jharkhand",
    "house item moving Ranchi",
    "office shifting Ranchi",
    "best packers and movers Jharkhand"
  ],
  metadataBase: new URL("https://www.b2transport.in"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "B2 Transport | House Shifting & Logistics Services Ranchi",
    description: "Reliable packers, movers, and cargo vehicles in Ranchi and across Jharkhand. Transparent, affordable, and safe shifting.",
    url: "https://www.b2transport.in",
    siteName: "B2 Transport",
    locale: "en_IN",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // LocalBusiness structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "B2 Transport",
    "image": "https://www.b2transport.in/hero-og.jpg", // placeholder, can be generated
    "@id": "https://www.b2transport.in/#localbusiness",
    "url": "https://www.b2transport.in",
    "telephone": "+91-7654722708",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Main Road",
      "addressLocality": "Ranchi",
      "addressRegion": "Jharkhand",
      "postalCode": "834001",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 23.3441,
      "longitude": 85.3096
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "opens": "00:00",
      "closes": "23:59"
    },
    "sameAs": []
  };

  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${outfit.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <Header />
        <main style={{ flex: 1, paddingTop: '80px' }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
