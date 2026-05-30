import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, Truck, Shield, Clock, Compass } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.glowOverlay}></div>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Brand Info */}
          <div className={styles.brand}>
            <Link href="/" className={styles.logo}>
              <Truck size={24} className={styles.truckIcon} />
              <span>b2 <span className="text-gradient">Transport</span></span>
            </Link>
            <p className={styles.desc}>
              Next-generation logistics & shifting solutions in Jharkhand. We provide transparent pricing, real-time dispatch, and professional shifting services.
            </p>
            <div className={styles.contactList}>
              <a href="tel:7654722708" className={styles.contactItem}>
                <Phone size={16} />
                <span>+91-7654722708</span>
              </a>
              <div className={styles.contactItem}>
                <MapPin size={16} />
                <span>Ranchi, Jharkhand (HQ)</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.linksGroup}>
            <h3 className={styles.title}>Services</h3>
            <ul className={styles.list}>
              <li><Link href="/#services" className={styles.link}>House Shifting</Link></li>
              <li><Link href="/#services" className={styles.link}>Office Relocation</Link></li>
              <li><Link href="/#services" className={styles.link}>Interdistrict Logistics</Link></li>
              <li><Link href="/#services" className={styles.link}>Pickup Vehicle Hire</Link></li>
            </ul>
          </div>

          {/* Popular Locations */}
          <div className={styles.linksGroup}>
            <h3 className={styles.title}>Service Areas</h3>
            <div className={styles.locationsGrid}>
              <ul className={styles.list}>
                <li><Link href="/locations/ranchi" className={styles.link}>Ranchi (HQ)</Link></li>
                <li><Link href="/locations/jamshedpur" className={styles.link}>Jamshedpur</Link></li>
                <li><Link href="/locations/dhanbad" className={styles.link}>Dhanbad</Link></li>
                <li><Link href="/locations/bokaro" className={styles.link}>Bokaro Steel City</Link></li>
              </ul>
              <ul className={styles.list}>
                <li><Link href="/locations/hazaribagh" className={styles.link}>Hazaribagh</Link></li>
                <li><Link href="/locations/deoghar" className={styles.link}>Deoghar</Link></li>
                <li><Link href="/locations/giridih" className={styles.link}>Giridih</Link></li>
                <li><Link href="/locations/ramgarh" className={styles.link}>Ramgarh</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copy}>
            &copy; {currentYear} b2 Transport. All Rights Reserved. Ranchi, Jharkhand.
          </p>
          <p className={styles.aiTag}>
            <Compass size={14} className={styles.aiIcon} />
            <span>AI-Optimized Route & Dispatch Systems</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
