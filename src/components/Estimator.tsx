'use client';

import React, { useState } from 'react';
import { Truck, Navigation, IndianRupee, Phone, Calendar, ArrowRight } from 'lucide-react';
import styles from './Estimator.module.css';

// Approximate distance from Ranchi HQ to other major districts
const distancesFromRanchi: Record<string, number> = {
  "Ranchi": 15, // Local
  "Jamshedpur": 130,
  "Dhanbad": 145,
  "Bokaro": 110,
  "Hazaribagh": 95,
  "Deoghar": 250,
  "Giridih": 190,
  "Ramgarh": 45,
  "Daltonganj": 165,
  "Koderma": 160,
  "Lohardaga": 75,
  "Gumla": 95,
  "Khunti": 35,
  "Chaibasa": 140,
  "Dumka": 280,
  "Garhwa": 210,
  "Simdega": 140,
  "Chatra": 140,
  "Seraikela": 120,
  "Kopti": 180,
};

const vehicles = [
  {
    id: 'tata-ace',
    name: 'Tata Ace (Chota Hathi)',
    capacity: '850 Kg',
    basePrice: 1500,
    perKmRate: 25,
    specs: '7 x 4.8 x 4.8 Feet',
    description: 'Best for house shifting of 1 BHK/Bachelor items and small cargo.'
  },
  {
    id: 'bolero-pickup',
    name: 'Mahindra Bolero Pickup',
    capacity: '1.5 Tons (1500 Kg)',
    basePrice: 2200,
    perKmRate: 30,
    specs: '8.2 x 5.2 x 5 Feet',
    description: 'Perfect for 2 BHK shifting, heavier commercial cargo, and industrial loads.'
  },
  {
    id: 'three-wheeler',
    name: '3-Wheeler Loader',
    capacity: '500 Kg',
    basePrice: 900,
    perKmRate: 20,
    specs: '5.5 x 4 x 4 Feet',
    description: 'Ideal for narrow streets, single appliance move, or local market delivery.'
  },
  {
    id: 'tata-407',
    name: 'Tata 407 Truck',
    capacity: '2.5 Tons (2500 Kg)',
    basePrice: 3500,
    perKmRate: 40,
    specs: '9.5 x 5.5 x 6 Feet',
    description: 'Suitable for 3 BHK house shifting, large office setups, and heavy loads.'
  }
];

export default function Estimator() {
  const [source, setSource] = useState('Ranchi');
  const [destination, setDestination] = useState('Jamshedpur');
  const [vehicleId, setVehicleId] = useState('tata-ace');
  const [calculated, setCalculated] = useState(false);
  const [result, setResult] = useState({
    distance: 0,
    fareMin: 0,
    fareMax: 0,
    vehicleName: '',
    capacity: '',
    specs: ''
  });

  const districts = Object.keys(distancesFromRanchi).sort();

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Estimate distance
    let distance = 0;
    if (source === destination) {
      distance = 15; // Local city limits
    } else {
      // Calculate relative distance via Ranchi (if neither is Ranchi, sum their Ranchi distances as approximation)
      const distSourceToRanchi = distancesFromRanchi[source] || 0;
      const distDestToRanchi = distancesFromRanchi[destination] || 0;
      
      if (source === 'Ranchi') {
        distance = distDestToRanchi;
      } else if (destination === 'Ranchi') {
        distance = distSourceToRanchi;
      } else {
        distance = Math.abs(distSourceToRanchi - distDestToRanchi) || (distSourceToRanchi + distDestToRanchi) * 0.7;
      }
    }
    
    distance = Math.round(distance);
    
    const selectedVehicle = vehicles.find(v => v.id === vehicleId) || vehicles[0];
    
    // Calculate price
    const baseFare = selectedVehicle.basePrice;
    let computedFare = baseFare;
    
    if (distance > 15) {
      computedFare += (distance - 15) * selectedVehicle.perKmRate;
    }
    
    // Round to nearest hundred
    computedFare = Math.round(computedFare / 100) * 100;
    const fareMin = Math.round((computedFare * 0.9) / 100) * 100;
    const fareMax = Math.round((computedFare * 1.1) / 100) * 100;

    setResult({
      distance,
      fareMin,
      fareMax,
      vehicleName: selectedVehicle.name,
      capacity: selectedVehicle.capacity,
      specs: selectedVehicle.specs
    });
    setCalculated(true);

    // Scroll down to results section (especially useful on mobile layouts)
    setTimeout(() => {
      const resultSection = document.getElementById('estimator-result');
      if (resultSection) {
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  };

  const getWhatsAppLink = () => {
    const text = encodeURIComponent(
      `Hello b2 Transport! I would like to book a ${result.vehicleName} from ${source} to ${destination}. Please confirm availability and share final quotation.`
    );
    return `https://wa.me/917654722708?text=${text}`;
  };

  return (
    <section id="estimator" className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <div className={styles.badge}>AI FARE ESTIMATOR</div>
          <h2 className={styles.title}>Calculate Shifting & Transport Fare</h2>
          <p className={styles.subtitle}>
            Enter your route and select a vehicle to get an instant, transparent price estimate. No hidden costs.
          </p>
        </div>

        <div className={styles.grid}>
          {/* Form Side */}
          <div className={`glass-panel-glow ${styles.formContainer}`}>
            <form onSubmit={handleCalculate} className={styles.form}>
              <div className={styles.row}>
                <div className={styles.inputGroup}>
                  <label className="form-label" htmlFor="source">Pickup City (Origin)</label>
                  <div className={styles.selectWrapper}>
                    <Navigation size={18} className={styles.inputIcon} />
                    <select 
                      id="source"
                      value={source} 
                      onChange={(e) => setSource(e.target.value)}
                      className="form-input"
                    >
                      {districts.map(d => (
                        <option key={`src-${d}`} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className="form-label" htmlFor="destination">Drop City (Destination)</label>
                  <div className={styles.selectWrapper}>
                    <Navigation size={18} className={styles.inputIcon} style={{ transform: 'rotate(90deg)' }} />
                    <select 
                      id="destination"
                      value={destination} 
                      onChange={(e) => setDestination(e.target.value)}
                      className="form-input"
                    >
                      {districts.map(d => (
                        <option key={`dest-${d}`} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className="form-label">Select Transportation Vehicle</label>
                <div className={styles.vehicleOptions}>
                  {vehicles.map(v => (
                    <div 
                      key={v.id} 
                      className={`${styles.vehicleCard} ${vehicleId === v.id ? styles.selectedVehicle : ''}`}
                      onClick={() => setVehicleId(v.id)}
                    >
                      <div className={styles.vehicleInfo}>
                        <Truck size={20} className={styles.vehicleIcon} />
                        <div>
                          <div className={styles.vehicleName}>{v.name}</div>
                          <div className={styles.vehicleCapacity}>Capacity: {v.capacity}</div>
                        </div>
                      </div>
                      <div className={styles.radioCircle}></div>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className={`btn-neon ${styles.submitBtn}`}>
                <span>Compute Price Quote</span>
                <ArrowRight size={18} />
              </button>
            </form>
          </div>

          {/* Results Side */}
          <div id="estimator-result" className={styles.resultColumn}>
            {!calculated ? (
              <div className={`glass-panel ${styles.promptCard}`}>
                <div className={styles.aiOrb}>
                  <div className={styles.orbCore}></div>
                  <div className={styles.orbRing}></div>
                </div>
                <h3>AI Dispatch System Ready</h3>
                <p>Select your starting point, destination, and desired vehicle. Our system will analyze routes and calculate the standard tariff instantly.</p>
              </div>
            ) : (
              <div className={`glass-panel ${styles.resultCard}`}>
                <div className={styles.resultHeader}>
                  <span className={styles.routeBadge}>ROUTE SUMMARY</span>
                  <h3 className={styles.routeDisplay}>{source} <ArrowRight size={16} /> {destination}</h3>
                </div>

                <div className={styles.pricingContainer}>
                  <div className={styles.priceLabel}>Estimated Price Range</div>
                  <div className={styles.priceValue}>
                    <IndianRupee size={32} className={styles.rupeeIcon} />
                    <span>{result.fareMin.toLocaleString('en-IN')} - {result.fareMax.toLocaleString('en-IN')}</span>
                  </div>
                  <div className={styles.priceDisclaimer}>*Tolls, parking, and loading/unloading labor charges extra.</div>
                </div>

                <div className={styles.detailsGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Est. Distance</span>
                    <span className={styles.detailVal}>{result.distance} KM</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Vehicle Model</span>
                    <span className={styles.detailVal}>{result.vehicleName}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Load Capacity</span>
                    <span className={styles.detailVal}>{result.capacity}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Cargo Dimensions</span>
                    <span className={styles.detailVal}>{result.specs}</span>
                  </div>
                </div>

                <div className={styles.ctaGroup}>
                  <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer" className={`btn-neon ${styles.whatsappBtn}`}>
                    <Calendar size={18} />
                    <span>Confirm Booking (WhatsApp)</span>
                  </a>
                  <a href="tel:7654722708" className={`btn-secondary ${styles.callBtn}`}>
                    <Phone size={18} />
                    <span>Call 7654722708</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
