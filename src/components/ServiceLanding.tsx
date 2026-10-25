import React from 'react';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import LocationCallButtons from '@/components/LocationCallButtons';
import { BUSINESS_ID, SITE_URL } from '@/lib/seo';
import hero from '@/app/locations/[slug]/LocationPage.module.css';
import styles from '@/components/ServicePage.module.css';

export interface Faq {
  q: string;
  a: string;
}

interface ServiceLandingProps {
  path: string;
  badge: string;
  titleLine1: string;
  titleLine2: string;
  subtitle: string;
  /** Used in the WhatsApp message: "I saw your page for {enquiryLabel}". */
  enquiryLabel: string;
  serviceName: string;
  serviceType: string;
  breadcrumbName: string;
  /** City name for areaServed; omit to use the state of Jharkhand. */
  city?: string;
  faqs: Faq[];
  faqTitle: string;
  related: { href: string; label: string }[];
  children: React.ReactNode;
}

// Card section used inside a service page.
export function ServiceSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className={styles.section}>
      <div className={`container ${styles.narrow}`}>
        <div className={`glass-panel ${styles.card}`}>
          <h2>{title}</h2>
          {children}
        </div>
      </div>
    </section>
  );
}

// Shared layout for service landing pages: hero, content sections, FAQ,
// related links, Service + BreadcrumbList schema.
export default function ServiceLanding(props: ServiceLandingProps) {
  const pageUrl = `${SITE_URL}${props.path}`;
  const areaServed = props.city
    ? { '@type': 'City', name: props.city, containedInPlace: { '@type': 'State', name: 'Jharkhand' } }
    : { '@type': 'State', name: 'Jharkhand' };

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: props.serviceName,
      serviceType: props.serviceType,
      url: pageUrl,
      provider: { '@id': BUSINESS_ID },
      areaServed,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: props.breadcrumbName, item: pageUrl },
      ],
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div className={hero.wrapper}>
        <section className={hero.heroSection}>
          <div className={hero.heroGlow}></div>
          <div className="container">
            <div className={hero.heroContent}>
              <div className={hero.locationBadge}>
                <MapPin size={16} className={hero.pinIcon} />
                <span>{props.badge}</span>
              </div>
              <h1 className={hero.heroTitle}>
                {props.titleLine1} <br />
                <span className="text-gradient">{props.titleLine2}</span>
              </h1>
              <p className={hero.heroSubtitle}>{props.subtitle}</p>
              <LocationCallButtons locationName={props.enquiryLabel} stylesActionRowClass={hero.actionRow} />
            </div>
          </div>
        </section>

        {props.children}

        <ServiceSection title={props.faqTitle}>
          <div className={styles.faq}>
            {props.faqs.map((f) => (
              <div className={styles.faqItem} key={f.q}>
                <h3>{f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </div>
        </ServiceSection>

        <ServiceSection title="Related Services">
          <div className={styles.links}>
            {props.related.map((r) => (
              <Link key={r.href} href={r.href}>{r.label}</Link>
            ))}
          </div>
        </ServiceSection>
      </div>
    </>
  );
}
