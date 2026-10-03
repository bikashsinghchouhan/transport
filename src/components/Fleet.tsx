'use client';

import React, { useState, useEffect } from 'react';
import { Truck, Weight, Box, ShieldCheck, ArrowUpRight } from 'lucide-react';
import styles from './Fleet.module.css';

interface Vehicle {
  _id?: string;
  name: string;
  capacity: string;
  dimensions?: string;
  size?: string;
  description?: string;
  useCase?: string;
  tag?: string;
  badge?: string;
  basePrice?: number;
  perKmPrice?: number;
}

const defaultFleetData: Vehicle[] = [
  {
    _id: 'three-wheeler',
    name: '3-Wheeler Loader',
    capacity: '500 Kg',
    size: '5.5 x 4 x 4 Feet',
    useCase: 'Best for narrow streets, local shop deliveries, shifting a single bed, fridge, or wardrobe.',
    badge: 'AGILE CITY LOADER'
  },
  {
    _id: 'tata-ace',
    name: 'Tata Ace (Chota Hathi)',
    capacity: '750 Kg',
    size: '7 x 4.8 x 4.8 Feet',
    useCase: 'Best for 1 BHK apartment shifting, PG luggage transport, and local distribution.',
    badge: 'POPULAR SHIFTER'
  },
  {
    _id: 'bolero-pickup',
    name: 'Mahindra Bolero Pickup',
    capacity: '1300 Kg (1.3 Tons)',
    size: '8.2 x 5.2 x 5 Feet',
    useCase: 'Perfect for 2 BHK house shifting, electronic appliances, commercial loads, and agricultural products.',
    badge: 'HEAVY DUTY PICKUP'
  },
  {
    _id: 'tata-407',
    name: '14 Ft Container Truck',
    capacity: '3500 Kg (3.5 Tons)',
    size: '14 x 6 x 6.5 Feet',
    useCase: 'Ideal for 3 BHK luxury house shifting, large office setups, machinery cargo, and long distance trips.',
    badge: 'MAX LOGISTICS'
  }
];

export default function Fleet() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(defaultFleetData);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await fetch('/api/vehicles');
      const data = await res.json();
      if (data.success && data.vehicles && data.vehicles.length > 0) {
        setVehicles(data.vehicles);
      }
    } catch (err) {
      console.error('Failed to fetch dynamic fleet data:', err);
    }
  };

  const handleSelectVehicle = () => {
    const estimatorSection = document.getElementById('estimator');
    if (estimatorSection) {
      estimatorSection.scrollIntoView({ behavior: 'smooth' });
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
          {vehicles.map((vehicle, idx) => {
            const isRecommended = idx === 1 || vehicle.tag?.toLowerCase().includes('popular');
            const vehicleBadge = vehicle.tag || vehicle.badge || 'LOGISTICS VEHICLE';
            const dimensionsText = vehicle.dimensions || vehicle.size || 'Standard Cargo Box';
            const descriptionText = vehicle.description || vehicle.useCase || 'Reliable transport vehicle for shifting and logistics.';

            return (
              <div 
                key={vehicle._id || idx} 
                className={`${styles.card} ${isRecommended ? styles.recommendedCard : ''} glass-panel`}
              >
                {isRecommended && <div className={styles.ribbon}>MOST BOOKED</div>}
                
                <div className={styles.cardHeader}>
                  <span className={styles.vehicleBadge}>{vehicleBadge}</span>
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
                      <span className={styles.specVal}>{dimensionsText}</span>
                    </div>
                  </div>
                </div>

                <p className={styles.description}>{descriptionText}</p>

                <button 
                  onClick={handleSelectVehicle}
                  className={`btn-secondary ${styles.actionBtn} ${isRecommended ? styles.recommendedBtn : ''}`}
                >
                  <span>Select & Check Price</span>
                  <ArrowUpRight size={16} />
                </button>
              </div>
            );
          })}
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
