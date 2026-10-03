'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ContactProvider } from '@/context/ContactContext';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    return (
      <ContactProvider>
        <div style={{ minHeight: '100vh', width: '100%' }}>{children}</div>
      </ContactProvider>
    );
  }

  return (
    <ContactProvider>
      <Header />
      <main style={{ flex: 1, paddingTop: '80px' }}>
        {children}
      </main>
      <Footer />
    </ContactProvider>
  );
}
