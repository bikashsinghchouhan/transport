'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Truck,
  MapPin,
  ShieldCheck,
  Phone,
  MessageSquare,
  Activity,
  ArrowRight,
  Package,
  CheckCircle,
  HelpCircle,
  Compass,
  Building2,
  Bike
} from 'lucide-react';
import Estimator from '@/components/Estimator';
import Fleet from '@/components/Fleet';
import { useContact } from '@/context/ContactContext';
import { telHref } from '@/lib/seo';
import styles from '@/app/page.module.css';

export default function HomeContent() {
  const { contact } = useContact();

  const localDistricts = [
    { name: "Ranchi", slug: "ranchi", role: "Head office" },
    { name: "Jamshedpur", slug: "jamshedpur", role: "East Singhbhum" },
    { name: "Dhanbad", slug: "dhanbad", role: "Dhanbad district" },
    { name: "Bokaro", slug: "bokaro", role: "Bokaro district" },
    { name: "Hazaribagh", slug: "hazaribagh", role: "Hazaribagh district" },
    { name: "Deoghar", slug: "deoghar", role: "Deoghar district" },
    { name: "Giridih", slug: "giridih", role: "Giridih district" },
    { name: "Ramgarh", slug: "ramgarh", role: "Ramgarh district" }
  ];

  return (
    <div className={styles.wrapper}>
      {/* 1. HERO SECTION */}
      <section className={styles.heroSection}>
        <div className={styles.container}>
          <div className={styles.heroGrid}>
            <div className={styles.heroLeft}>
              <div className={styles.badgeRow}>
                <Activity size={14} className={styles.pulseIcon} />
                <span>RANCHI-BASED SHIFTING &amp; TRANSPORT</span>
              </div>
              <h1 className={styles.heroTitle}>
                Packers and Movers in Ranchi <br />
                <span className="text-gradient">Across Jharkhand</span>
              </h1>
              <p className={styles.heroDescription}>
                Need to shift your house or transport goods? <strong>B2 Transport</strong> is based in Ranchi and provides home shifting, packing, loading help and pickup or truck hire across all districts of Jharkhand.
              </p>

              <div className={styles.heroCtas}>
                <Link href="#estimator" className="btn-neon">
                  <span>Calculate Fare Estimate</span>
                  <ArrowRight size={18} />
                </Link>
                <a href={telHref(contact.phone)} className="btn-secondary">
                  <Phone size={18} />
                  <span>Call {contact.phone}</span>
                </a>
              </div>

              <div className={styles.heroTrust}>
                <div className={styles.trustItem}>
                  <CheckCircle size={16} className={styles.trustIcon} />
                  <span>Packing &amp; Loading Help</span>
                </div>
                <div className={styles.trustItem}>
                  <CheckCircle size={16} className={styles.trustIcon} />
                  <span>Fare Estimate Before Booking</span>
                </div>
              </div>
            </div>

            <div className={styles.heroRight}>
              <div className={styles.imageContainer}>
                <Image
                  src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/hero.png`}
                  alt="Illustration of a goods transport truck"
                  width={600}
                  height={450}
                  sizes="(max-width: 992px) 100vw, 600px"
                  className={styles.heroImage}
                  priority
                />
                <div className={styles.heroBadgesWrapper}>
                  <div className={styles.glassBadgeHq}>
                    <MapPin size={18} className={styles.hqPin} />
                    <div>
                      <strong>Ranchi Head Office</strong>
                      <p>Serving all of Jharkhand</p>
                    </div>
                  </div>
                  <div className={styles.glassBadgeActive}>
                    <Package size={18} className={styles.activeUsers} />
                    <div>
                      <strong>Local &amp; Interstate</strong>
                      <p>House &amp; goods shifting</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. KEY FACTS BAR */}
      <section className={styles.statsSection}>
        <div className="container">
          <div className={`${styles.statsGrid} glass-panel`}>
            <div className={styles.statBox}>
              <div className={styles.statNum}>Ranchi</div>
              <div className={styles.statLabel}>Head Office</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statNum}>24</div>
              <div className={styles.statLabel}>Jharkhand Districts Served</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statNum}>3W to 14 ft</div>
              <div className={styles.statLabel}>Vehicle Sizes</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statNum}>Interstate</div>
              <div className={styles.statLabel}>Moves Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SERVICES SECTION */}
      <section id="services" className="section-padding">
        <div className="container">
          <div className={styles.sectionHeader}>
            <div className={styles.secBadge}>SERVICES</div>
            <h2>Shifting and Transport Services</h2>
            <p>From household shifting within Ranchi to goods transport between districts and states, choose the service that fits your move.</p>
          </div>

          <div className={styles.servicesGrid}>
            <div className={`glass-panel ${styles.serviceCard}`}>
              <div className={styles.serviceHeader}>
                <div className={styles.serviceIconWrapper}>
                  <Compass size={24} className={styles.serviceIcon} />
                </div>
                <h3>Home Shifting &amp; Packing</h3>
              </div>
              <p className={styles.serviceText}>
                Complete household shifting. We pack beds, wardrobes, televisions, refrigerators, kitchen items and furniture, then load and transport them to your new home.
              </p>
              <ul className={styles.serviceList}>
                <li>Packing &amp; Unpacking</li>
                <li>Loading &amp; Unloading Labour</li>
                <li>Local, Intercity &amp; Interstate Moves</li>
              </ul>
              <Link href="/locations/ranchi" className={styles.locAction}>
                <span>Packers and movers in Ranchi</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className={`glass-panel ${styles.serviceCard}`}>
              <div className={styles.serviceHeader}>
                <div className={styles.serviceIconWrapper}>
                  <Truck size={24} className={styles.serviceIcon} />
                </div>
                <h3>Goods Transport</h3>
              </div>
              <p className={styles.serviceText}>
                Move goods from Ranchi to Jamshedpur, Dhanbad, Bokaro, any other Jharkhand district, or neighbouring states.
              </p>
              <ul className={styles.serviceList}>
                <li>District-to-District Transport</li>
                <li>Interstate Transport</li>
                <li>Door-to-Door Pickup and Drop</li>
              </ul>
              <Link href="/services/goods-transport-ranchi" className={styles.locAction}>
                <span>Transport service in Ranchi</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className={`glass-panel ${styles.serviceCard}`}>
              <div className={styles.serviceHeader}>
                <div className={styles.serviceIconWrapper}>
                  <ShieldCheck size={24} className={styles.serviceIcon} />
                </div>
                <h3>Pickup &amp; Truck Hire</h3>
              </div>
              <p className={styles.serviceText}>
                Hire a goods vehicle with driver. Choose a 3-wheeler loader, Tata Ace, Bolero Pickup or 14 ft truck for local deliveries and shifting.
              </p>
              <ul className={styles.serviceList}>
                <li>Per-KM Pricing</li>
                <li>Vehicle With Driver</li>
                <li>Dispatch From Ranchi</li>
              </ul>
              <Link href="/services/house-shifting-van-ranchi" className={styles.locAction}>
                <span>House shifting van rates in Ranchi</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className={`glass-panel ${styles.serviceCard}`}>
              <div className={styles.serviceHeader}>
                <div className={styles.serviceIconWrapper}>
                  <Building2 size={24} className={styles.serviceIcon} />
                </div>
                <h3>Office &amp; Shop Shifting</h3>
              </div>
              <p className={styles.serviceText}>
                Shift office furniture, files, computers, shop fittings and stock, with packing and loading labour on request.
              </p>
              <ul className={styles.serviceList}>
                <li>Office Relocation</li>
                <li>Shop &amp; Commercial Goods</li>
                <li>Packing &amp; Labour on Request</li>
              </ul>
            </div>

            <div className={`glass-panel ${styles.serviceCard}`}>
              <div className={styles.serviceHeader}>
                <div className={styles.serviceIconWrapper}>
                  <Bike size={24} className={styles.serviceIcon} />
                </div>
                <h3>Bike &amp; Car Transport</h3>
              </div>
              <p className={styles.serviceText}>
                Transport your bike or car along with your household goods, or on its own, within Jharkhand and to other states.
              </p>
              <ul className={styles.serviceList}>
                <li>Bike Transport</li>
                <li>Car Transport</li>
                <li>Local &amp; Interstate</li>
              </ul>
              <Link href="/services/bike-car-transport-ranchi" className={styles.locAction}>
                <span>Bike and car transport in Ranchi</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FLEET SECTION */}
      <Fleet />

      {/* 5. ESTIMATOR SECTION */}
      <Estimator />

      {/* 6. LOCATIONS LIST (LOCAL SEO CORNER) */}
      <section id="locations" className={`${styles.locationsSection} section-padding`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div className={styles.secBadge} style={{ borderColor: 'rgba(139, 92, 246, 0.3)', color: 'var(--accent-purple)' }}>SERVICE AREAS</div>
            <h2>Shifting Services by Location</h2>
            <p>Select your city to see vehicles, travel time from Ranchi and booking options.</p>
          </div>

          <div className={styles.locationsGrid}>
            {localDistricts.map((dist, idx) => (
              <Link href={`/locations/${dist.slug}`} key={`dist-${idx}`} className={`glass-panel ${styles.locationCard}`}>
                <div className={styles.locHeader}>
                  <MapPin size={18} className={styles.locPin} />
                  <h3>{dist.name}</h3>
                </div>
                <p className={styles.locRole}>{dist.role}</p>
                <div className={styles.locAction}>
                  <span>View {dist.name} Services</span>
                  <ArrowRight size={14} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FAQ SECTION */}
      <section className="section-padding" style={{ background: 'rgba(3, 7, 18, 0.3)' }}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div className={styles.secBadge}>FAQ</div>
            <h2>Frequently Asked Questions</h2>
            <p>Answers to common questions about house shifting, pickup hire, and regional transport.</p>
          </div>

          <div className={styles.faqContainer}>
            <div className={`glass-panel ${styles.faqCard}`}>
              <div className={styles.faqHeader}>
                <HelpCircle size={20} className={styles.faqIcon} />
                <h3>How do I calculate the shifting cost?</h3>
              </div>
              <p className={styles.faqAnswer}>
                Use the <strong>Fare Estimator</strong> above. Select your pickup and drop location and a vehicle (like Tata Ace or Bolero Pickup) to see an estimated fare range. Call or WhatsApp us for a final quote.
              </p>
            </div>

            <div className={`glass-panel ${styles.faqCard}`}>
              <div className={styles.faqHeader}>
                <HelpCircle size={20} className={styles.faqIcon} />
                <h3>Do you provide labour for loading and unloading?</h3>
              </div>
              <p className={styles.faqAnswer}>
                Yes. We can provide loaders for heavy goods like cupboards, double beds, refrigerators, and sofas, and we also offer packing and unpacking. Labour charges are quoted separately based on the number of items and floor levels.
              </p>
            </div>

            <div className={`glass-panel ${styles.faqCard}`}>
              <div className={styles.faqHeader}>
                <HelpCircle size={20} className={styles.faqIcon} />
                <h3>Can I book vehicles for moving outside Ranchi?</h3>
              </div>
              <p className={styles.faqAnswer}>
                Yes. Our head office is in Ranchi, and we transport goods to all 24 districts of Jharkhand, including Jamshedpur, Dhanbad, Bokaro, Hazaribagh, and Giridih, as well as to other states such as West Bengal, Bihar and Odisha. See <Link href="/services/interstate-shifting-ranchi">interstate shifting from Ranchi</Link>.
              </p>
            </div>

            <div className={`glass-panel ${styles.faqCard}`}>
              <div className={styles.faqHeader}>
                <HelpCircle size={20} className={styles.faqIcon} />
                <h3>Do you transport bikes and cars?</h3>
              </div>
              <p className={styles.faqAnswer}>
                Yes. We transport bikes and cars, either together with your household shifting or as a separate booking. Call or WhatsApp us with the vehicle model and route for a quote.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CALL TO ACTION BAR */}
      <section className={styles.ctaBar}>
        <div className="container">
          <div className={`glass-panel-glow ${styles.ctaContainer}`}>
            <h2 className={styles.ctaTitle}>Ready to Book Your Shifting or Transport?</h2>
            <p className={styles.ctaSubtitle}>
              Call or WhatsApp our Ranchi office to book a vehicle, with packing and loading help if you need it.
            </p>
            <div className={styles.ctaButtonGroup}>
              <a href={telHref(contact.phone)} className="btn-neon">
                <Phone size={18} />
                <span>Call Now: {contact.phone}</span>
              </a>
              <a href={`https://wa.me/${contact.whatsapp}?text=Hello%20B2%20Transport,%20I%20want%20to%20book%20a%20vehicle%20for%20household%20shifting.`} target="_blank" rel="noopener noreferrer" className={`btn-secondary ${styles.whatsappBtn}`}>
                <MessageSquare size={18} />
                <span>Inquire on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
