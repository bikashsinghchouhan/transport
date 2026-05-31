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
  Users,
  CheckCircle,
  HelpCircle,
  Compass
} from 'lucide-react';
import Estimator from '@/components/Estimator';
import Fleet from '@/components/Fleet';
import styles from './page.module.css';

export default function Home() {
  const localDistricts = [
    { name: "Ranchi", slug: "ranchi", role: "Company Headquarter (HQ)" },
    { name: "Jamshedpur", slug: "jamshedpur", role: "Industrial Logistical Node" },
    { name: "Dhanbad", slug: "dhanbad", role: "Coal Belt Service Hub" },
    { name: "Bokaro", slug: "bokaro", role: "Steel City Branch Network" },
    { name: "Hazaribagh", slug: "hazaribagh", role: "North Chotanagpur Hub" },
    { name: "Deoghar", slug: "deoghar", role: "Santhal Pargana Node" },
    { name: "Giridih", slug: "giridih", role: "Mining & Trade Service Node" },
    { name: "Ramgarh", slug: "ramgarh", role: "Express Transit Hub" }
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
                <span>ACTIVE SHIFTING DISPATCH NETWORK</span>
              </div>
              <h1 className={styles.heroTitle}>
                B2 Transport <br />
                <span className="text-gradient">Simplified. Secure.</span>
              </h1>
              <p className={styles.heroDescription}>
                Need to shift your house or transport cargo from one place to another? **B2 Transport** Ranchi provides top-rated packers, movers, and instant pickup van bookings across all districts of Jharkhand.
              </p>

              <div className={styles.heroCtas}>
                <Link href="#estimator" className="btn-neon">
                  <span>Calculate Fare Estimate</span>
                  <ArrowRight size={18} />
                </Link>
                <a href="tel:7654722708" className="btn-secondary">
                  <Phone size={18} />
                  <span>Call 7654722708</span>
                </a>
              </div>

              <div className={styles.heroTrust}>
                <div className={styles.trustItem}>
                  <CheckCircle size={16} className={styles.trustIcon} />
                  <span>100% Verified Drivers</span>
                </div>
                <div className={styles.trustItem}>
                  <CheckCircle size={16} className={styles.trustIcon} />
                  <span>No Hidden Charges</span>
                </div>
              </div>
            </div>

            <div className={styles.heroRight}>
              <div className={styles.imageContainer}>
                <Image
                  src="/transport/hero.png"
                  alt="Futuristic Logistics Truck in Ranchi Jharkhand"
                  width={600}
                  height={450}
                  className={styles.heroImage}
                  priority
                />
                <div className={styles.glassBadgeHq}>
                  <MapPin size={18} className={styles.hqPin} />
                  <div>
                    <h5>Ranchi HQ</h5>
                    <p>Jharkhand Central Hub</p>
                  </div>
                </div>
                <div className={styles.glassBadgeActive}>
                  <Users size={18} className={styles.activeUsers} />
                  <div>
                    <h5>99.8% Safe</h5>
                    <p>Damage-Free Moves</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS BAR */}
      <section className={styles.statsSection}>
        <div className="container">
          <div className={`${styles.statsGrid} glass-panel`}>
            <div className={styles.statBox}>
              <div className={styles.statNum}>10,000+</div>
              <div className={styles.statLabel}>Shifting Projects Completed</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statNum}>24/7</div>
              <div className={styles.statLabel}>Dispatch Availability</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statNum}>50+</div>
              <div className={styles.statLabel}>Verified Pickups & Loaders</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statNum}>24</div>
              <div className={styles.statLabel}>Jharkhand Districts Serviced</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SERVICES SECTION */}
      <section id="services" className="section-padding">
        <div className="container">
          <div className={styles.sectionHeader}>
            <div className={styles.secBadge}>SERVICES</div>
            <h2>Professional Transport Solutions</h2>
            <p>From house items shifting to interdistrict heavy cargo logistics, we provide efficient transit solutions customized for you.</p>
          </div>

          <div className={styles.servicesGrid}>
            <div className={`glass-panel ${styles.serviceCard}`}>
              <div className={styles.serviceHeader}>
                <div className={styles.serviceIconWrapper}>
                  <Compass size={24} className={styles.serviceIcon} />
                </div>
                <h3>House Items Shifting</h3>
              </div>
              <p className={styles.serviceText}>
                Complete household shifting. We pack your beds, wardrobes, television, refrigerators, kitchen utensils, and furniture carefully and transport them safely.
              </p>
              <ul className={styles.serviceList}>
                <li>Professional Packing & Unpacking</li>
                <li>Experienced Luggage Handling</li>
                <li>Local & Inter-City Domestic Moves</li>
              </ul>
            </div>

            <div className={`glass-panel ${styles.serviceCard}`}>
              <div className={styles.serviceHeader}>
                <div className={styles.serviceIconWrapper}>
                  <Truck size={24} className={styles.serviceIcon} />
                </div>
                <h3>Interdistrict Transport</h3>
              </div>
              <p className={styles.serviceText}>
                Need to move items from Ranchi to Jamshedpur, Dhanbad, Bokaro or other districts? We provide seamless regional cargo transport with dedicated routes.
              </p>
              <ul className={styles.serviceList}>
                <li>Fixed Transparent District Rates</li>
                <li>Express Single-Day Delivery</li>
                <li>Door-to-Door Pickup and Drop</li>
              </ul>
            </div>

            <div className={`glass-panel ${styles.serviceCard}`}>
              <div className={styles.serviceHeader}>
                <div className={styles.serviceIconWrapper}>
                  <ShieldCheck size={24} className={styles.serviceIcon} />
                </div>
                <h3>Pickup & Truck Rentals</h3>
              </div>
              <p className={styles.serviceText}>
                Hire individual loader vehicles on-demand. Choose from Tata Ace, Bolero Pickup, 3-Wheelers, or trucks for local commercial deliveries and custom tasks.
              </p>
              <ul className={styles.serviceList}>
                <li>Flexible Hourly or KM Pricing</li>
                <li>Trained Drivers who know routes</li>
                <li>Immediate dispatch from Ranchi HQ</li>
              </ul>
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
            <div className={styles.secBadge} style={{ borderColor: 'rgba(139, 92, 246, 0.3)', color: 'var(--accent-purple)' }}>DISTRICT DIRECTORY</div>
            <h2>Location Specific Services</h2>
            <p>Select your district to find local shifting rates, vehicle availability, and quick booking options.</p>
          </div>

          <div className={styles.locationsGrid}>
            {localDistricts.map((dist, idx) => (
              <Link href={`/transport/locations/${dist.slug}`} key={`dist-${idx}`} className={`glass-panel ${styles.locationCard}`}>
                <div className={styles.locHeader}>
                  <MapPin size={18} className={styles.locPin} />
                  <h4>{dist.name}</h4>
                </div>
                <p className={styles.locRole}>{dist.role}</p>
                <div className={styles.locAction}>
                  <span>Explore Rates</span>
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
            <p>Answers to common questions about house shifting, pickup rentals, and regional transport.</p>
          </div>

          <div className={styles.faqContainer}>
            <div className={`glass-panel ${styles.faqCard}`}>
              <div className={styles.faqHeader}>
                <HelpCircle size={20} className={styles.faqIcon} />
                <h4>How do I calculate the shifting cost?</h4>
              </div>
              <p className={styles.faqAnswer}>
                You can use our interactive **AI Fare Estimator** above. Simply select your pickup and drop city, select the vehicle (like Tata Ace or Bolero Pickup), and the system will output the standard fare range.
              </p>
            </div>

            <div className={`glass-panel ${styles.faqCard}`}>
              <div className={styles.faqHeader}>
                <HelpCircle size={20} className={styles.faqIcon} />
                <h4>Do you provide laborers (labor) for loading and unloading?</h4>
              </div>
              <p className={styles.faqAnswer}>
                Yes! We can provide professional loaders/laborers on request for carrying heavy goods like cupboards, double beds, refrigerators, and sofas. Loading/unloading charges are quoted separately based on the number of items and floor levels.
              </p>
            </div>

            <div className={`glass-panel ${styles.faqCard}`}>
              <div className={styles.faqHeader}>
                <HelpCircle size={20} className={styles.faqIcon} />
                <h4>Can I book vehicles for moving outside Ranchi?</h4>
              </div>
              <p className={styles.faqAnswer}>
                Absolutely. While our main headquarter is in Ranchi, Jharkhand, we specialize in inter-district cargo transport to all 24 districts including Jamshedpur, Dhanbad, Bokaro, Hazaribagh, and Giridih.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CALL TO ACTION BAR */}
      <section className={styles.ctaBar}>
        <div className="container">
          <div className={`glass-panel-glow ${styles.ctaContainer}`}>
            <h2 className={styles.ctaTitle}>Ready to Shifting or Transports?</h2>
            <p className={styles.ctaSubtitle}>
              Get immediate vehicle allocation from Ranchi HQ. Quick booking with expert loading assistance.
            </p>
            <div className={styles.ctaButtonGroup}>
              <a href="tel:7654722708" className="btn-neon">
                <Phone size={18} />
                <span>Call Now: 7654722708</span>
              </a>
              <a href="https://wa.me/917654722708?text=Hello%20b2%20Transport,%20I%20want%20to%20book%20a%20vehicle%20for%20household%20shifting." target="_blank" rel="noopener noreferrer" className={`btn-secondary ${styles.whatsappBtn}`}>
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
