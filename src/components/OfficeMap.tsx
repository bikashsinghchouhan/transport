'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Maximize2, Plus, Minus, X, Navigation } from 'lucide-react';
import { useContact } from '@/context/ContactContext';
import { DEFAULT_OFFICE_MAP_EMBED_URL } from '@/utils/mapUtils';
import styles from './OfficeMap.module.css';

export default function OfficeMap() {
  const { contact } = useContact();
  const [mapZoom, setMapZoom] = useState(16);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isFullscreen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  const rawEmbedUrl =
    (mounted && contact.officeMapEmbedUrl) ||
    contact.officeMapEmbedUrl ||
    DEFAULT_OFFICE_MAP_EMBED_URL;

  const embedUrlWithZoom = rawEmbedUrl.includes('z=')
    ? rawEmbedUrl.replace(/([?&]z=)\d+/, (_, p1) => `${p1}${mapZoom}`)
    : `${rawEmbedUrl}${rawEmbedUrl.includes('?') ? '&' : '?'}z=${mapZoom}`;

  return (
    <section className={styles.mapSection} aria-label="Office Location">
      <div className="container">
        {/* Section Header */}
        <div className={styles.mapHeader}>
          <div className={styles.mapTitleWrapper}>
            <div className={styles.iconCircle}>
              <MapPin size={20} className={styles.mapPinIcon} />
            </div>
            <div>
              <div className={styles.mapBadge}>OFFICE LOCATION</div>
              <h2 className={styles.mapHeading}>Our Office Location</h2>
              <p className={styles.mapSubtitle}>
                Bariatu Road, Morabadi, Ranchi — Open for inquiries, household shifting &amp; fleet dispatch
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className={styles.mapFullscreenHeaderBtn}
            title="Open Full Screen View"
          >
            <Maximize2 size={16} />
            <span>Full Screen View</span>
          </button>
        </div>

        {/* Map Container with guaranteed responsive layout */}
        <div
          className={styles.mapContainer}
          style={{
            position: 'relative',
            width: '100%',
            overflow: 'hidden',
          }}
        >
          {/* Top-Right Floating Controls (Zoom + Fullscreen) */}
          <div
            className={styles.mapControls}
            style={{
              position: 'absolute',
              top: '18px',
              right: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              zIndex: 10,
            }}
          >
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className={styles.mapBtn}
              title="Full Screen View"
              aria-label="Full Screen View"
            >
              <Maximize2 size={18} />
            </button>
            <div className={styles.zoomGroup}>
              <button
                type="button"
                onClick={() => setMapZoom((prev) => Math.min(prev + 1, 19))}
                className={styles.zoomBtn}
                title="Zoom In"
                aria-label="Zoom In"
              >
                <Plus size={18} />
              </button>
              <button
                type="button"
                onClick={() => setMapZoom((prev) => Math.max(prev - 1, 11))}
                className={styles.zoomBtn}
                title="Zoom Out"
                aria-label="Zoom Out"
              >
                <Minus size={18} />
              </button>
            </div>
          </div>

          {/* Top-Left Floating Location Badge */}
          <div className={styles.locationBadgeOverlay}>
            <div className={styles.badgePulseDot} />
            <div>
              <div className={styles.badgeTitle}>B2 Transport Head Office</div>
              <div className={styles.badgeLocation}>Bariatu Road, Morabadi, Ranchi (23.4290° N, 85.3501° E)</div>
            </div>
          </div>

          {/* Google Map Embed Iframe */}
          <iframe
            suppressHydrationWarning
            src={embedUrlWithZoom}
            title="B2 Transport Office Location - Bariatu Road, Morabadi, Ranchi"
            className={styles.mapIframe}
            style={{
              width: '100%',
              height: '100%',
              border: 0,
              display: 'block',
            }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>

      {/* Full Screen Modal View */}
      {isFullscreen && (
        <div className={styles.fullscreenOverlay} onClick={() => setIsFullscreen(false)}>
          <div className={styles.fullscreenModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.fullscreenHeader}>
              <div className={styles.fullscreenTitle}>
                <Navigation size={20} color="var(--accent-cyan, #06b6d4)" />
                <span>B2 Transport Office — Bariatu Road, Morabadi, Ranchi (23.4290, 85.3501)</span>
              </div>
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className={styles.fullscreenCloseBtn}
                title="Close Full Screen (Esc)"
                aria-label="Close"
              >
                <X size={22} />
              </button>
            </div>

            <div className={styles.fullscreenBody} style={{ position: 'relative', width: '100%', flex: 1 }}>
              <div
                className={styles.mapControls}
                style={{
                  position: 'absolute',
                  top: '18px',
                  right: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  zIndex: 10,
                }}
              >
                <div className={styles.zoomGroup}>
                  <button
                    type="button"
                    onClick={() => setMapZoom((prev) => Math.min(prev + 1, 19))}
                    className={styles.zoomBtn}
                    title="Zoom In"
                    aria-label="Zoom In"
                  >
                    <Plus size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapZoom((prev) => Math.max(prev - 1, 11))}
                    className={styles.zoomBtn}
                    title="Zoom Out"
                    aria-label="Zoom Out"
                  >
                    <Minus size={18} />
                  </button>
                </div>
              </div>

              <iframe
                suppressHydrationWarning
                src={embedUrlWithZoom}
                title="Office Location Map Fullscreen"
                className={styles.mapIframe}
                style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
