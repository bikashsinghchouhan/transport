import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | B2 Transport Admin Console',
    default: 'Admin Console | B2 Transport',
  },
  description: 'B2 Transport secure internal operations and administration portal.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'none',
      'max-snippet': -1,
    },
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
