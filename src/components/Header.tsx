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
        <Link href="/transport" className={styles.logo}>
          <div className={styles.logoIcon}>
            <img 
              src="/transport/b2transport_logo_circle.png" 
              alt="B2 Transport Logo" 
              className={styles.logoImg} 
            />
            <div className={styles.logoGlow}></div>
          </div>
          <span className={styles.logoText}>
            B2 <span className="text-gradient">Transport</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className={styles.desktopNav}>
          <Link href="/transport/#services" className={styles.navLink}>Services</Link>
          <Link href="/transport/#fleet" className={styles.navLink}>Our Fleet</Link>
          <Link href="/transport/#estimator" className={styles.navLink}>Fare Estimator</Link>
          <Link href="/transport/#locations" className={styles.navLink}>Locations</Link>
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
            <Link href="/transport/#services" onClick={() => setIsOpen(false)} className={styles.mobileNavLink}>
              Services
            </Link>
            <Link href="/transport/#fleet" onClick={() => setIsOpen(false)} className={styles.mobileNavLink}>
              Our Fleet
            </Link>
            <Link href="/transport/#estimator" onClick={() => setIsOpen(false)} className={styles.mobileNavLink}>
              Fare Estimator
            </Link>
            <Link href="/transport/#locations" onClick={() => setIsOpen(false)} className={styles.mobileNavLink}>
              Locations
            </Link>
            <a href="tel:7654722708" className="btn-neon" onClick={() => setIsOpen(false)} style={{ width: '100%', marginTop: '12px' }}>
              <Phone size={18} />
              Call Now: 7654722708
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
