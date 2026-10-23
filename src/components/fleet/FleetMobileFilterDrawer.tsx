'use client';

import React, { useState, useEffect } from 'react';
import { X, RotateCcw, Check } from 'lucide-react';
import styles from './fleet.module.css';

export interface FleetMobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  activeCount?: number;
  onReset?: () => void;
  onApply?: () => void;
  children: React.ReactNode;
}

export default function FleetMobileFilterDrawer({
  isOpen,
  onClose,
  title = 'Filters & Search',
  activeCount = 0,
  onReset,
  onApply,
  children,
}: FleetMobileFilterDrawerProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      setIsClosing(false);
      // Lock both body and html to completely freeze background scrolling across all mobile browsers
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.touchAction = '';
      setMounted(false);
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 240);
  };

  // Close on ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const touchStartY = React.useRef<number>(0);
  const currentDragY = React.useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    currentDragY.current = 0;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY.current;
    if (deltaY > 0) {
      currentDragY.current = deltaY;
      setDragOffset(deltaY);
    } else {
      currentDragY.current = 0;
      setDragOffset(0);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (currentDragY.current > 70) {
      handleClose();
    }
    setDragOffset(0);
    currentDragY.current = 0;
  };

  if (!isOpen && !mounted) return null;

  return (
    <div
      className={`${styles.bottomSheetOverlay} ${isClosing ? styles.bottomSheetOverlayClosing : ''}`}
      onClick={handleClose}
      onTouchMove={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault();
        }
      }}
    >
      <div
        className={`${styles.bottomSheetCard} ${isClosing ? styles.bottomSheetClosing : ''}`}
        style={
          isDragging && dragOffset > 0
            ? { transform: `translateY(${dragOffset}px)`, transition: 'none' }
            : dragOffset === 0 && !isClosing
            ? { transition: 'transform 0.22s ease-out' }
            : undefined
        }
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* Hold & slide down drag zone */}
        <div
          style={{ touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Drag handle / touch bar */}
          <div className={styles.bottomSheetHandle} onClick={handleClose} />

          {/* Header with Title and Cancel button */}
          <div className={styles.bottomSheetHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className={styles.bottomSheetTitle}>{title}</span>
              {activeCount > 0 && (
                <span className={styles.bottomSheetActiveBadge}>
                  {activeCount} active
                </span>
              )}
            </div>
            <button
              onClick={handleClose}
              className={styles.bottomSheetCancelBtn}
              type="button"
              aria-label="Cancel and close"
            >
              <X size={15} /> Cancel
            </button>
          </div>
        </div>

        {/* Body containing all page filters */}
        <div className={styles.bottomSheetBody}>{children}</div>

        {/* Footer actions */}
        <div className={styles.bottomSheetFooter}>
          {onReset && (
            <button
              onClick={() => {
                onReset();
              }}
              className={styles.bottomSheetResetBtn}
              type="button"
              disabled={activeCount === 0}
              style={{ opacity: activeCount === 0 ? 0.4 : 1 }}
            >
              <RotateCcw size={14} /> Clear All
            </button>
          )}
          <button
            onClick={handleClose}
            className={styles.bottomSheetCancelFooterBtn}
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (onApply) {
                onApply();
              }
              handleClose();
            }}
            className={styles.bottomSheetApplyBtn}
            type="button"
          >
            <Check size={16} /> Apply Filter
          </button>
        </div>
      </div>
    </div>
  );
}
