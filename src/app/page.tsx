import type { Metadata } from 'next';
import HomeContent from '@/components/HomeContent';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Packers and Movers in Ranchi, Jharkhand | B2 Transport',
  description:
    'Home shifting, packing, loading help, office shifting, bike and car transport, and pickup or truck hire from Ranchi to all districts of Jharkhand. Call or WhatsApp 7654722708 for a quote.',
  path: '/',
});

export default function Home() {
  return <HomeContent />;
}
