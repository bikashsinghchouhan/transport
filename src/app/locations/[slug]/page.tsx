import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MapPin, Phone, MessageSquare, Shield, Clock, Compass, Truck, Star } from 'lucide-react';
import Estimator from '@/components/Estimator';
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
  fullName: string;
  title: string;
  description: string;
  keywords: string[];
  lat: number;
  lng: number;
  hq: boolean;
  intro: string;
  shiftingTime: string;
  availableVehicles: string[];
}

const locationDatabase: Record<string, LocationData> = {
  "ranchi": {
    slug: "ranchi",
    name: "Ranchi",
    fullName: "Ranchi (Company Headquarter)",
    title: "Packers and Movers in Ranchi | House Shifting Ranchi - b2 Transport",
    description: "Looking for best packers and movers or house shifting services in Ranchi? b2 Transport Ranchi HQ provides reliable pickups and mini-trucks. Call 7654722708.",
    keywords: ["packers and movers Ranchi", "house shifting Ranchi", "pickup rental Ranchi", "goods carrier Ranchi", "b2 transport Ranchi"],
    lat: 23.3441,
    lng: 85.3096,
    hq: true,
    intro: "Welcome to b2 Transport Headquarter. We are Ranchi's premier transportation network, offering state-of-the-art house shifting, luggage moving, and commercial transport. Direct dispatch from our Ranchi hub guarantees prompt vehicle arrival within 30 minutes.",
    shiftingTime: "2 - 4 Hours for Local Shifting",
    availableVehicles: ["Tata Ace", "Mahindra Bolero Pickup", "3-Wheeler Loader", "Tata 407"]
  },
  "jamshedpur": {
    slug: "jamshedpur",
    name: "Jamshedpur",
    fullName: "Jamshedpur Branch",
    title: "Packers and Movers in Jamshedpur | Shifting Services - b2 Transport",
    description: "Affordable packers, movers, and luggage transport in Jamshedpur. Get instant rates for Tata Ace, Pickup, and trucks. Secure shifting. Call 7654722708.",
    keywords: ["packers and movers Jamshedpur", "house shifting Jamshedpur", "luggage transport Jamshedpur", "mini truck hire Jamshedpur"],
    lat: 22.8046,
    lng: 86.2029,
    hq: false,
    intro: "Need reliable goods carriage or domestic household shifting in steel city Jamshedpur? b2 Transport delivers top-tier transport vehicles for local shifting in Kadma, Sonari, Sakchi, Mango, and long-distance hauling across Jharkhand.",
    shiftingTime: "4 - 6 Hours from Ranchi HQ / Local Dispatch",
    availableVehicles: ["Tata Ace", "Mahindra Bolero Pickup", "Tata 407"]
  },
  "dhanbad": {
    slug: "dhanbad",
    name: "Dhanbad",
    fullName: "Dhanbad Service Area",
    title: "House Shifting & Packers Movers Dhanbad - b2 Transport",
    description: "Hire reliable pickup vans and house shifting vehicles in Dhanbad coal capital. Safe loading, professional drivers. Call 7654722708 for bookings.",
    keywords: ["house shifting Dhanbad", "packers movers Dhanbad", "pickup van Dhanbad", "luggage shifting Dhanbad"],
    lat: 23.7957,
    lng: 86.4304,
    hq: false,
    intro: "Serving the Coal Capital, b2 Transport Dhanbad provides expert luggage transport, house shifting, and cargo logistics. Whether shifting residential items near Katras, Jharia, or Govindpur, or transporting commercial goods, we are your trusted transit partner.",
    shiftingTime: "5 - 6 Hours Transit / Local Network",
    availableVehicles: ["Tata Ace", "Mahindra Bolero Pickup", "Tata 407"]
  },
  "bokaro": {
    slug: "bokaro",
    name: "Bokaro",
    fullName: "Bokaro Steel City Hub",
    title: "Packers & Movers Bokaro Steel City | Shifting Services - b2 Transport",
    description: "Professional house shifting and cargo logistics in Bokaro Steel City. Safe loading, low-cost truck and pickup rental. Call 7654722708 for quotes.",
    keywords: ["packers movers Bokaro", "house shifting Bokaro", "pickup hire Bokaro", "transport Bokaro Steel City"],
    lat: 23.6693,
    lng: 86.1511,
    hq: false,
    intro: "Specialized in structural shifting and residential move-outs in Bokaro Steel City. We deploy verified cargo vehicles and loading specialists to sectors across Bokaro, providing a tension-free moving experience.",
    shiftingTime: "4 - 5 Hours Transit / Fast Dispatch",
    availableVehicles: ["Tata Ace", "Bolero Pickup", "3-Wheeler Loader"]
  },
  "hazaribagh": {
    slug: "hazaribagh",
    name: "Hazaribagh",
    fullName: "Hazaribagh Service Hub",
    title: "Packers Movers Hazaribagh | House Shifting Services - b2 Transport",
    description: "Looking for local transport or shifting services in Hazaribagh? b2 Transport offers Tata Ace and Bolero Pickup for local and outstation moving. Call 7654722708.",
    keywords: ["packers movers Hazaribagh", "house shifting Hazaribagh", "luggage transport Hazaribagh", "pickup Hazaribagh"],
    lat: 23.9961,
    lng: 85.3687,
    hq: false,
    intro: "b2 Transport Hazaribagh covers household shifting, student baggage transfers (near local colleges), and agricultural freight transport. Reliable service with live coordinates and skilled loaders.",
    shiftingTime: "3 - 4 Hours from Ranchi HQ",
    availableVehicles: ["Tata Ace", "Mahindra Bolero Pickup"]
  },
  "deoghar": {
    slug: "deoghar",
    name: "Deoghar",
    fullName: "Deoghar Branch",
    title: "House Shifting and Luggage Movers Deoghar | b2 Transport",
    description: "Secure, verified house shifting and pickup loaders in Deoghar (Baba Dham). Low cost moving, zero damage assurance. Call 7654722708.",
    keywords: ["house shifting Deoghar", "packers movers Deoghar", "transport service Deoghar", "pickup hire Deoghar"],
    lat: 24.4818,
    lng: 86.7001,
    hq: false,
    intro: "Get clean, covered, and open-top pickups for safe household shifting in holy city Deoghar. We specialize in delicate transit of items, temple materials, and retail goods across Santhal Pargana division.",
    shiftingTime: "7 - 8 Hours Transit / Pre-booked Dispatch",
    availableVehicles: ["Tata Ace", "Mahindra Bolero Pickup", "Tata 407"]
  },
  "giridih": {
    slug: "giridih",
    name: "Giridih",
    fullName: "Giridih Logistics Node",
    title: "Luggage Shifting and Pickup Hire Giridih | b2 Transport",
    description: "Reliable goods transport and packers/movers in Giridih. Get affordable quotes for local and inter-state cargo shifting. Call 7654722708.",
    keywords: ["house shifting Giridih", "packers movers Giridih", "pickup van Giridih", "transport service Giridih"],
    lat: 24.1856,
    lng: 86.2949,
    hq: false,
    intro: "Providing Giridih residents and businesses with heavy-duty and lightweight carriage. Secure transit for household furniture, industrial loads, and business inventory.",
    shiftingTime: "6 - 7 Hours Transit / Pre-booked Dispatch",
    availableVehicles: ["Tata Ace", "Mahindra Bolero Pickup"]
  },
  "ramgarh": {
    slug: "ramgarh",
    name: "Ramgarh",
    fullName: "Ramgarh Transit Point",
    title: "Fast Shifting Services & Pickups in Ramgarh - b2 Transport",
    description: "Instant pickup dispatch and house shifting in Ramgarh Cantt. Only 45km from Ranchi HQ. Quick shifting, affordable rates. Call 7654722708.",
    keywords: ["house shifting Ramgarh", "packers movers Ramgarh", "pickup rental Ramgarh", "transport Ramgarh Cantt"],
    lat: 23.6338,
    lng: 85.5132,
    hq: false,
    intro: "Located just next to our Ranchi HQ, Ramgarh is served with express speed. Standard 45-minute dispatch for urgent luggage transport, house shifting, and coal-belt industrial transport requirements.",
    shiftingTime: "1.5 - 2 Hours Express Dispatch",
    availableVehicles: ["Tata Ace", "Mahindra Bolero Pickup", "3-Wheeler Loader", "Tata 407"]
  }
};

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

  return {
    title: location.title,
    description: location.description,
    keywords: location.keywords,
    alternates: {
      canonical: `/locations/${location.slug}`,
    },
  };
}

export default async function LocationPage({ params }: LocationPageProps) {
  const resolvedParams = await params;
  const location = locationDatabase[resolvedParams.slug];

  if (!location) {
    notFound();
  }

  // Dynamic schema for this location page
  const locationSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": `b2 Transport - ${location.name} Services`,
    "description": location.description,
    "telephone": "+91-7654722708",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": location.name,
      "addressRegion": "Jharkhand",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": location.lat,
      "longitude": location.lng
    },
    "areaServed": `${location.name}, Jharkhand, India`
  };

  const getWhatsAppLink = () => {
    const text = encodeURIComponent(
      `Hi b2 Transport! I saw your page for ${location.name} and I want to inquire about shifting services in my area.`
    );
    return `https://wa.me/917654722708?text=${text}`;
  };

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
                <span>{location.fullName}</span>
              </div>
              <h1 className={styles.heroTitle}>
                House Shifting & Logistics <br />
                <span className="text-gradient">in {location.name}</span>
              </h1>
              <p className={styles.heroSubtitle}>
                Hire local Tata Ace, Bolero Pickup, and loaders for stress-free home, luggage, or commercial transport. 24/7 Service.
              </p>
              
              <div className={styles.actionRow}>
                <a href="tel:7654722708" className="btn-neon">
                  <Phone size={18} />
                  <span>Call: 7654722708</span>
                </a>
                <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                  <MessageSquare size={18} />
                  <span>WhatsApp Booking</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Localized Content */}
        <section className={`${styles.infoSection} section-padding`}>
          <div className="container">
            <div className={styles.infoGrid}>
              <div className={`glass-panel ${styles.infoCard}`}>
                <h2 className={styles.sectionTitle}>
                  Reliable Shifting in {location.name}
                </h2>
                <p className={styles.introText}>{location.intro}</p>

                <div className={styles.detailsRow}>
                  <div className={styles.detailCard}>
                    <Clock size={20} className={styles.detailIcon} />
                    <div>
                      <h5>Response / Transit Time</h5>
                      <p>{location.shiftingTime}</p>
                    </div>
                  </div>
                  <div className={styles.detailCard}>
                    <Shield size={20} className={styles.detailIcon} />
                    <div>
                      <h5>Security Standard</h5>
                      <p>Full transit damage protection & active driver verification</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`glass-panel-glow ${styles.fleetCard}`}>
                <h3>Available Fleets in {location.name}</h3>
                <p>These vehicles are readily dispatchable for your shifting or transport request:</p>
                
                <ul className={styles.vehicleList}>
                  {location.availableVehicles.map((vehicle, idx) => (
                    <li key={`vehicle-${idx}`} className={styles.vehicleItem}>
                      <Truck size={18} className={styles.checkIcon} />
                      <span>{vehicle}</span>
                    </li>
                  ))}
                </ul>

                <div className={styles.ratingCard}>
                  <div className={styles.stars}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill="#06b6d4" color="#06b6d4" />
                    ))}
                  </div>
                  <span className={styles.ratingText}>Rated 4.9/5 based on 240+ shifts in {location.name}</span>
                </div>
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
