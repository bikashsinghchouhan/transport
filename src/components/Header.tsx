'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, Menu, X, ArrowRight, MessageSquare } from 'lucide-react';
import { useContact } from '@/context/ContactContext';
import styles from './Header.module.css';

export default function Header() {
  const { contact } = useContact();
  const [isOpen, setIsOpen] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
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

  const handleOpenDrawer = () => {
    setIsOpen(true);
    setTimeout(() => {
      setAnimateIn(true);
    }, 20);
  };

  const handleCloseDrawer = () => {
    setAnimateIn(false);
    setTimeout(() => {
      setIsOpen(false);
    }, 300);
  };

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      {/* Top Call Bar for Mobile Devices */}
      <div className={styles.topNoticeBar}>
        <a href={`tel:${contact.phone}`} className={styles.topNoticeLink}>
          <Phone size={13} />
          <span>Call for Booking: <strong>{contact.phone}</strong></span>
        </a>
      </div>

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
          <Link href="/admin/login" className={styles.navLink} style={{ color: '#38bdf8' }}>Admin</Link>
        </nav>

        <div className={styles.actions}>
          <a href={`tel:${contact.phone}`} className={`${styles.headerPhoneBtn} btn-neon`}>
            <Phone size={16} />
            <span className={styles.phoneText}>{contact.phone}</span>
          </a>
          <button
            className={styles.mobileMenuBtn}
            onClick={isOpen ? handleCloseDrawer : handleOpenDrawer}
            aria-label="Toggle Navigation Menu"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* RIGHT SIDEBAR DRAWER FOR MOBILE */}
      {isOpen && (
        <>
          <div
            className={`${styles.drawerOverlay} ${animateIn ? styles.drawerOverlayOpen : ''}`}
            onClick={handleCloseDrawer}
          />
          <aside className={`${styles.drawerSidebar} ${animateIn ? styles.drawerSidebarOpen : ''}`}>
            <div>
              <div className={styles.drawerHeader}>
                <img
                  src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/b2transport_logo_circle.png`}
                  alt="B2 Transport Logo"
                  className={styles.drawerLogoImg}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className={styles.drawerBrandTitle}>b2 Transport</div>
                  <div className={styles.drawerBrandSubtitle}>Jharkhand Transit Hub</div>
                </div>
                <button onClick={handleCloseDrawer} className={styles.closeBtn} aria-label="Close menu">
                  <X size={18} />
                </button>
              </div>

              <nav className={styles.drawerNav}>
                <a
                  href={getLinkHref('#services')}
                  onClick={handleCloseDrawer}
                  className={styles.drawerNavLink}
                >
                  <span>Services</span>
                  <ArrowRight size={16} style={{ opacity: 0.6 }} />
                </a>
                <a
                  href={getLinkHref('#fleet')}
                  onClick={handleCloseDrawer}
                  className={styles.drawerNavLink}
                >
                  <span>Our Fleet</span>
                  <ArrowRight size={16} style={{ opacity: 0.6 }} />
                </a>
                <a
                  href={getLinkHref('#estimator')}
                  onClick={handleCloseDrawer}
                  className={styles.drawerNavLink}
                >
                  <span>Fare Estimator</span>
                  <ArrowRight size={16} style={{ opacity: 0.6 }} />
                </a>
                <a
                  href={getLinkHref('#locations')}
                  onClick={handleCloseDrawer}
                  className={styles.drawerNavLink}
                >
                  <span>Locations</span>
                  <ArrowRight size={16} style={{ opacity: 0.6 }} />
                </a>
                <Link
                  href="/admin/login"
                  onClick={handleCloseDrawer}
                  className={styles.drawerNavLink}
                  style={{ color: '#38bdf8' }}
                >
                  <span>Admin Portal</span>
                  <ArrowRight size={16} color="#38bdf8" />
                </Link>
              </nav>
            </div>

            <div className={styles.drawerFooter}>
              <a href={`tel:${contact.phone}`} className="btn-neon" onClick={handleCloseDrawer} style={{ width: '100%', justifyContent: 'center' }}>
                <Phone size={18} />
                <span>Call Now: {contact.phone}</span>
              </a>
              <a href={`https://wa.me/${contact.whatsapp}?text=Hello%20b2%20Transport,%20I%20want%20to%20book%20a%20vehicle.`} target="_blank" rel="noopener noreferrer" className="btn-secondary" onClick={handleCloseDrawer} style={{ width: '100%', justifyContent: 'center' }}>
                <MessageSquare size={18} />
                <span>WhatsApp Booking</span>
              </a>
            </div>
          </aside>
        </>
      )}
    </header>
  );
}
