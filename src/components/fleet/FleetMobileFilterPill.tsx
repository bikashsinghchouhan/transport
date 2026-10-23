'use client';

import React from 'react';
import { SlidersHorizontal, Search } from 'lucide-react';
import styles from './fleet.module.css';

export interface FleetMobileFilterPillProps {
  onClick: () => void;
  activeCount?: number;
  searchQuery?: string;
  className?: string;
  label?: string;
  showSearch?: boolean;
}

export default function FleetMobileFilterPill({
  onClick,
  activeCount = 0,
  searchQuery = '',
  className = '',
  label = 'Filter',
  showSearch = true,
}: FleetMobileFilterPillProps) {
  return (
    <div className={styles.mobileFilterFloatingWrapper}>
      <button
        onClick={onClick}
        className={`${styles.mobileFilterPill} ${className}`}
        type="button"
        aria-label="Open filters"
      >
        <div className={styles.mobileFilterPillSection}>
          <SlidersHorizontal size={16} className={styles.mobileFilterPillIcon} />
          <span className={styles.mobileFilterPillText}>{label}</span>
          {activeCount > 0 && (
            <span className={styles.mobileFilterPillCount}>{activeCount}</span>
          )}
        </div>
        {showSearch && (
          <>
            <div className={styles.mobileFilterPillDivider} />
            <div className={styles.mobileFilterPillSection}>
              <Search size={16} className={styles.mobileFilterPillIcon} />
              <span className={styles.mobileFilterPillText}>Search</span>
            </div>
          </>
        )}
      </button>
    </div>
  );
}
