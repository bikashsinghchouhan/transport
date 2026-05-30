'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Phone, Menu, X, ArrowRight, Truck } from 'lucide-react';
import styles from './Header.module.css';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <Truck size={24} className={styles.truckIcon} />
            <div className={styles.logoGlow}></div>
          </div>
          <span className={styles.logoText}>
            b2 <span className="text-gradient">Transport</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className={styles.desktopNav}>
          <Link href="/#services" className={styles.navLink}>Services</Link>
          <Link href="/#fleet" className={styles.navLink}>Our Fleet</Link>
          <Link href="/#estimator" className={styles.navLink}>Fare Estimator</Link>
          <Link href="/#locations" className={styles.navLink}>Locations</Link>
        </nav>

        <div className={styles.actions}>
          <a href="tel:7654722708" className="btn-neon">
            <Phone size={16} />
            <span className={styles.phoneText}>7654722708</span>
          </a>
          <button 
            className={styles.mobileMenuBtn} 
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className={styles.mobileDrawer}>
          <nav className={styles.mobileNav}>
            <Link href="/#services" onClick={() => setIsOpen(false)} className={styles.mobileNavLink}>
              Services
            </Link>
            <Link href="/#fleet" onClick={() => setIsOpen(false)} className={styles.mobileNavLink}>
              Our Fleet
            </Link>
            <Link href="/#estimator" onClick={() => setIsOpen(false)} className={styles.mobileNavLink}>
              Fare Estimator
            </Link>
            <Link href="/#locations" onClick={() => setIsOpen(false)} className={styles.mobileNavLink}>
              Locations
            </Link>
            <a href="tel:7654722708" className="btn-neon" onClick={() => setIsOpen(false)} style={{ width: '100%', marginTop: '20px' }}>
              <Phone size={18} />
              Call Now: 7654722708
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
