'use client';

import React from 'react';
import { Truck, Weight, Box, ShieldCheck, ArrowUpRight } from 'lucide-react';
import styles from './Fleet.module.css';

const fleetData = [
  {
    id: 'three-wheeler',
    name: '3-Wheeler Loader',
    capacity: 'Up to 500 Kg',
    size: '5.5 x 4 x 4 Feet',
    useCase: 'Best for narrow streets, local shop deliveries, shifting a single bed, fridge, or wardrobe.',
    badge: 'AGILE CITY LOADER'
  },
  {
    id: 'tata-ace',
    name: 'Tata Ace (Chota Hathi)',
    capacity: 'Up to 850 Kg',
    size: '7 x 4.8 x 4.8 Feet',
    useCase: 'Best for 1 BHK apartment shifting, PG luggage transport, and local distribution.',
    badge: 'POPULAR SHIFTER'
  },
  {
    id: 'bolero-pickup',
    name: 'Mahindra Bolero Pickup',
    capacity: 'Up to 2.0 Tons (2000 Kg)',
    size: '8.2 x 5.2 x 5 Feet',
    useCase: 'Perfect for 2 BHK house shifting, electronic appliances, commercial loads, and agricultural products.',
    badge: 'HEAVY DUTY PICKUP',
    recommended: true
  },
  {
    id: 'tata-407',
    name: 'Tata 407 Truck',
    capacity: 'Up to 3.5 Tons (3500 Kg)',
    size: '9.5 x 5.5 x 6 Feet',
    useCase: 'Ideal for 3 BHK luxury house shifting, large office setups, machinery cargo, and long distance trips.',
    badge: 'MAX LOGISTICS'
  }
];

export default function Fleet() {
  const handleSelectVehicle = (id: string) => {
    // Find estimator element
    const estimatorSection = document.getElementById('estimator');
    if (estimatorSection) {
      estimatorSection.scrollIntoView({ behavior: 'smooth' });
      // Find the card or radio in DOM and trigger select or update state (handled natively by the element scroll)
      setTimeout(() => {
        const vehicleSelectCard = document.querySelector(`[class*="vehicleCard"]`);
        // We can just scroll there, the user will interact with the card easily.
      }, 500);
    }
  };

  return (
    <section id="fleet" className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <div className={styles.badge}>OUR LOGISTICS FLEET</div>
          <h2 className={styles.title}>High-Performance Vehicles for Every Need</h2>
          <p className={styles.subtitle}>
            Choose from our modern, fully-maintained fleet of pickup vans and cargo trucks. Serviced regularly for zero delays.
          </p>
        </div>

        <div className={styles.grid}>
          {fleetData.map((vehicle) => (
            <div 
              key={vehicle.id} 
              className={`${styles.card} ${vehicle.recommended ? styles.recommendedCard : ''} glass-panel`}
            >
              {vehicle.recommended && <div className={styles.ribbon}>MOST BOOKED</div>}
              
              <div className={styles.cardHeader}>
                <span className={styles.vehicleBadge}>{vehicle.badge}</span>
                <h3 className={styles.vehicleName}>{vehicle.name}</h3>
              </div>

              <div className={styles.visualPlaceholder}>
                <Truck size={48} className={styles.truckIcon} />
                <div className={styles.radarWave}></div>
              </div>

              <div className={styles.specifications}>
                <div className={styles.specRow}>
                  <Weight size={18} className={styles.specIcon} />
                  <div>
                    <span className={styles.specLabel}>Weight Capacity</span>
                    <span className={styles.specVal}>{vehicle.capacity}</span>
                  </div>
                </div>
                <div className={styles.specRow}>
                  <Box size={18} className={styles.specIcon} />
                  <div>
                    <span className={styles.specLabel}>Cargo Dimensions</span>
                    <span className={styles.specVal}>{vehicle.size}</span>
                  </div>
                </div>
              </div>

              <p className={styles.description}>{vehicle.useCase}</p>

              <button 
                onClick={() => handleSelectVehicle(vehicle.id)}
                className={`btn-secondary ${styles.actionBtn} ${vehicle.recommended ? styles.recommendedBtn : ''}`}
              >
                <span>Select & Check Price</span>
                <ArrowUpRight size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className={`glass-panel-glow ${styles.guaranteeBanner}`}>
          <div className={styles.bannerItem}>
            <ShieldCheck size={24} className={styles.bannerIcon} />
            <div>
              <h4>Safe Cargo Guarantee</h4>
              <p>Every trip is handled by experienced, verified drivers with GPS tracking.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
