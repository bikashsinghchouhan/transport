'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, Menu, X, ArrowRight, Truck } from 'lucide-react';
import styles from './Header.module.css';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';

  const getLinkHref = (hash: string) => {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
    return isHome ? hash : `${basePath}/${hash}`;
  };

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
            <img 
              src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/b2transport_logo_circle.png`} 
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
          <a href={getLinkHref('#services')} className={styles.navLink}>Services</a>
          <a href={getLinkHref('#fleet')} className={styles.navLink}>Our Fleet</a>
          <a href={getLinkHref('#estimator')} className={styles.navLink}>Fare Estimator</a>
          <a href={getLinkHref('#locations')} className={styles.navLink}>Locations</a>
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
            <a 
              href={getLinkHref('#services')} 
              onClick={() => setIsOpen(false)} 
              className={styles.mobileNavLink}
            >
              Services
            </a>
            <a 
              href={getLinkHref('#fleet')} 
              onClick={() => setIsOpen(false)} 
              className={styles.mobileNavLink}
            >
              Our Fleet
            </a>
            <a 
              href={getLinkHref('#estimator')} 
              onClick={() => setIsOpen(false)} 
              className={styles.mobileNavLink}
            >
              Fare Estimator
            </a>
            <a 
              href={getLinkHref('#locations')} 
              onClick={() => setIsOpen(false)} 
              className={styles.mobileNavLink}
            >
              Locations
            </a>
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
