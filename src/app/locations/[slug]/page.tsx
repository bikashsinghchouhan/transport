import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Shield, Clock, Truck } from 'lucide-react';
import Estimator from '@/components/Estimator';
import LocationCallButtons from '@/components/LocationCallButtons';
import { BUSINESS_ID, SITE_URL, pageMetadata } from '@/lib/seo';
import styles from './LocationPage.module.css';

// Interface for page params in Next.js 15+
interface LocationPageProps {
  params: Promise<{
    slug: string;
  }>;
}

interface LocationData {
  slug: string;
  name: string;
  label: string;
  title: string;
  description: string;
  hq: boolean;
  intro: string;
  // Ranchi: typical local job time. Other cities: approximate road time from Ranchi.
  travelTime: string;
  // Neighbourhoods covered (only listed where we work regularly).
  areas?: string[];
  availableVehicles: string[];
}

// Only verified facts: B2 Transport has one office, in Ranchi. Other cities are
// served from Ranchi, so never describe them as branches or offices.
const locationDatabase: Record<string, LocationData> = {
  "ranchi": {
    slug: "ranchi",
    name: "Ranchi",
    label: "Ranchi (Head Office)",
    title: "Packers and Movers in Ranchi | Home Shifting with Packing | B2 Transport",
    description: "Packers and movers in Ranchi: home shifting with packing, loading labour, office shifting and bike or car transport. See prices, or call or WhatsApp 7654722708 for a quote.",
    hq: true,
    areas: ["Harmu", "Lalpur", "Kanke Road", "Doranda", "Hatia", "Bariatu", "Morabadi", "Ratu Road", "Kokar", "Namkum", "Hinoo", "Argora", "Booty More", "Dhurwa"],
    intro: "Our head office is in Ranchi, so local moves are our main work. We handle house shifting, packing, loading and unloading, office and shop shifting, and goods transport within the city, with vehicles from a 3-wheeler loader up to a 14 ft truck.",
    travelTime: "Local shifting usually takes 2 to 4 hours",
    availableVehicles: ["3-Wheeler Loader", "Tata Ace", "Mahindra Bolero Pickup", "14 ft Truck"]
  },
  "jamshedpur": {
    slug: "jamshedpur",
    name: "Jamshedpur",
    label: "Jamshedpur (East Singhbhum)",
    title: "Packers and Movers in Jamshedpur, Jharkhand | Ranchi to Jamshedpur | B2 Transport",
    description: "House shifting and goods transport between Ranchi and Jamshedpur, plus local moves in Jamshedpur. Tata Ace, Bolero Pickup and trucks. Call 7654722708.",
    hq: false,
    intro: "We move household goods and commercial loads between Ranchi and Jamshedpur, and handle shifting within Jamshedpur areas such as Kadma, Sonari, Sakchi and Mango. Vehicles are sent from our Ranchi office.",
    travelTime: "About 3 to 4 hours by road from Ranchi",
    availableVehicles: ["Tata Ace", "Mahindra Bolero Pickup", "14 ft Truck"]
  },
  "dhanbad": {
    slug: "dhanbad",
    name: "Dhanbad",
    label: "Dhanbad district",
    title: "Packers and Movers in Dhanbad, Jharkhand | House Shifting | B2 Transport",
    description: "House shifting, packing and goods transport for Dhanbad, Jharia, Katras and Govindpur, served from Ranchi. Call 7654722708 for a quote.",
    hq: false,
    intro: "We handle house shifting and goods transport for Dhanbad, including Katras, Jharia and Govindpur, for moves to and from Ranchi or elsewhere in Jharkhand. Vehicles are sent from our Ranchi office.",
    travelTime: "About 4 to 5 hours by road from Ranchi",
    availableVehicles: ["Tata Ace", "Mahindra Bolero Pickup", "14 ft Truck"]
  },
  "bokaro": {
    slug: "bokaro",
    name: "Bokaro",
    label: "Bokaro district",
    title: "Packers and Movers in Bokaro Steel City, Jharkhand | B2 Transport",
    description: "House shifting and goods transport for Bokaro Steel City and its sectors, served from Ranchi. Pickup and truck hire available. Call 7654722708.",
    hq: false,
    intro: "We shift homes and goods across the sectors of Bokaro Steel City, and between Bokaro and Ranchi or other Jharkhand districts. Packing and loading labour are available on request.",
    travelTime: "About 3 hours by road from Ranchi",
    availableVehicles: ["Tata Ace", "Mahindra Bolero Pickup", "3-Wheeler Loader"]
  },
  "hazaribagh": {
    slug: "hazaribagh",
    name: "Hazaribagh",
    label: "Hazaribagh district",
    title: "Packers and Movers in Hazaribagh, Jharkhand | House Shifting | B2 Transport",
    description: "House shifting, student luggage moves and goods transport for Hazaribagh, served from Ranchi. Tata Ace and Bolero Pickup. Call 7654722708.",
    hq: false,
    intro: "We cover household shifting, student luggage moves near local colleges, and goods transport for Hazaribagh, including moves to and from Ranchi along NH-33.",
    travelTime: "About 2 to 3 hours by road from Ranchi",
    availableVehicles: ["Tata Ace", "Mahindra Bolero Pickup"]
  },
  "deoghar": {
    slug: "deoghar",
    name: "Deoghar",
    label: "Deoghar district",
    title: "Packers and Movers in Deoghar, Jharkhand | House Shifting | B2 Transport",
    description: "House shifting and goods transport for Deoghar and the Santhal Pargana area, served from Ranchi. Pre-book your vehicle. Call 7654722708.",
    hq: false,
    intro: "We transport household goods and shop stock to and from Deoghar and the wider Santhal Pargana area. Because of the distance from Ranchi, please book in advance.",
    travelTime: "About 6 to 7 hours by road from Ranchi",
    availableVehicles: ["Tata Ace", "Mahindra Bolero Pickup", "14 ft Truck"]
  },
  "giridih": {
    slug: "giridih",
    name: "Giridih",
    label: "Giridih district",
    title: "Packers and Movers in Giridih, Jharkhand | Goods Transport | B2 Transport",
    description: "House shifting and goods transport for Giridih, served from Ranchi. Household furniture and business goods. Call 7654722708 for a quote.",
    hq: false,
    intro: "We move household furniture and business goods for Giridih residents and shops, for moves to and from Ranchi or other districts. Please book in advance.",
    travelTime: "About 4 to 5 hours by road from Ranchi",
    availableVehicles: ["Tata Ace", "Mahindra Bolero Pickup"]
  },
  "ramgarh": {
    slug: "ramgarh",
    name: "Ramgarh",
    label: "Ramgarh district",
    title: "Packers and Movers in Ramgarh, Jharkhand | Pickup Hire | B2 Transport",
    description: "House shifting and pickup hire in Ramgarh and Ramgarh Cantt, close to our Ranchi office. Call 7654722708 for a quote.",
    hq: false,
    intro: "Ramgarh is close to our Ranchi office, so it is one of our most frequently served areas for house shifting, luggage moves and goods transport, including Ramgarh Cantt.",
    travelTime: "About 1 to 1.5 hours by road from Ranchi",
    availableVehicles: ["3-Wheeler Loader", "Tata Ace", "Mahindra Bolero Pickup", "14 ft Truck"]
  }
};

const servicesOffered = "Home shifting, packing and unpacking, loading labour, office and shop shifting, and bike and car transport.";

// Unknown city slugs return the site 404 page instead of rendering on demand.
export const dynamicParams = false;

export async function generateStaticParams() {
  return Object.keys(locationDatabase).map((slug) => ({
    slug: slug,
  }));
}

export async function generateMetadata({ params }: LocationPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const location = locationDatabase[resolvedParams.slug];
  if (!location) {
    return {
      title: "Location Not Found",
    };
  }

  return pageMetadata({
    title: location.title,
    description: location.description,
    path: `/locations/${location.slug}`,
  });
}

export default async function LocationPage({ params }: LocationPageProps) {
  const resolvedParams = await params;
  const location = locationDatabase[resolvedParams.slug];

  if (!location) {
    notFound();
  }

  const pageUrl = `${SITE_URL}/locations/${location.slug}`;

  // Service offered in this area by the single Ranchi business (no per-city business entity).
  const locationSchema = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": `Packers and movers and goods transport in ${location.name}`,
      "serviceType": "Moving and goods transport",
      "description": location.description,
      "url": pageUrl,
      "provider": { "@id": BUSINESS_ID },
      "areaServed": {
        "@type": "City",
        "name": location.name,
        "containedInPlace": { "@type": "State", "name": "Jharkhand" }
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
        { "@type": "ListItem", "position": 2, "name": location.name, "item": pageUrl }
      ]
    }
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(locationSchema) }}
      />

      <div className={styles.wrapper}>
        {/* Banner Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroGlow}></div>
          <div className="container">
            <div className={styles.heroContent}>
              <div className={styles.locationBadge}>
                <MapPin size={16} className={styles.pinIcon} />
                <span>{location.label}</span>
              </div>
              <h1 className={styles.heroTitle}>
                Packers and Movers <br />
                <span className="text-gradient">in {location.name}</span>
              </h1>
              <p className={styles.heroSubtitle}>
                {location.hq
                  ? "House shifting, packing, loading labour and pickup or truck hire from our Ranchi office."
                  : `House shifting and goods transport for ${location.name}, with vehicles sent from our Ranchi office.`}
              </p>

              <LocationCallButtons locationName={location.name} stylesActionRowClass={styles.actionRow} />
            </div>
          </div>
        </section>

        {/* Localized Content */}
        <section className={`${styles.infoSection} section-padding`}>
          <div className="container">
            <div className={styles.infoGrid}>
              <div className={`glass-panel ${styles.infoCard}`}>
                <h2 className={styles.sectionTitle}>
                  Shifting and Transport in {location.name}
                </h2>
                <p className={styles.introText}>{location.intro}</p>
                {location.areas && (
                  <p className={styles.introText}>
                    <strong>Areas we cover in {location.name}:</strong> {location.areas.join(', ')} and all other parts of the city.
                  </p>
                )}
                {location.hq && (
                  <p className={styles.introText}>
                    Packers and movers price in Ranchi: see our{' '}
                    <Link href="/services/house-shifting-van-ranchi" style={{ color: 'var(--accent-cyan)', textDecoration: 'underline' }}>house shifting van rates</Link>
                    {' '}or use the fare estimator below. Contact number: <a href="tel:+917654722708" style={{ color: 'var(--accent-cyan)' }}>7654722708</a> (call or WhatsApp). Moving out of Jharkhand? See{' '}
                    <Link href="/services/interstate-shifting-ranchi" style={{ color: 'var(--accent-cyan)', textDecoration: 'underline' }}>interstate shifting from Ranchi</Link>.
                  </p>
                )}

                <div className={styles.detailsRow}>
                  <div className={styles.detailCard}>
                    <Clock size={20} className={styles.detailIcon} />
                    <div>
                      <strong>{location.hq ? "Typical Job Time" : "Travel Time"}</strong>
                      <p>{location.travelTime}</p>
                    </div>
                  </div>
                  <div className={styles.detailCard}>
                    <Shield size={20} className={styles.detailIcon} />
                    <div>
                      <strong>Services Available</strong>
                      <p>{servicesOffered}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`glass-panel-glow ${styles.fleetCard}`}>
                <h2 className={styles.fleetTitle}>Vehicles for {location.name}</h2>
                <p>Vehicles usually booked for shifting or transport in {location.name}:</p>

                <ul className={styles.vehicleList}>
                  {location.availableVehicles.map((vehicle, idx) => (
                    <li key={`vehicle-${idx}`} className={styles.vehicleItem}>
                      <Truck size={18} className={styles.checkIcon} />
                      <span>{vehicle}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Estimator embed for this location */}
        <div className={styles.estimatorWrapper}>
          <Estimator />
        </div>
      </div>
    </>
  );
}
