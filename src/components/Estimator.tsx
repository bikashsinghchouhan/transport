'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Truck, 
  Navigation, 
  IndianRupee, 
  Phone, 
  Calendar, 
  ArrowRight, 
  Search, 
  MapPin, 
  Info,
  ChevronDown,
  Locate
} from 'lucide-react';
import dynamic from 'next/dynamic';
import styles from './Estimator.module.css';
import { getStatesList, getDistrictsOfState } from '@/utils/indiaGeoData';

// Dynamically import Leaflet Map Component with SSR disabled
const MapComponent = dynamic(() => import('./MapComponent'), { 
  ssr: false,
  loading: () => (
    <div className={styles.mapPlaceholder}>
      <div className={styles.pulseOrb}></div>
      <p>Loading GPS Satellite Map...</p>
    </div>
  )
});

// Configure Vehicles with Base price and Distance multiplier
const vehicles = [
  {
    id: 'tata-ace',
    name: 'Tata Ace (Chota Hathi)',
    capacity: '850 Kg',
    rateFirst100: 25,
    rateAfter100: 20,
    specs: '7 x 4.8 x 4.8 Feet',
    description: 'Best for house shifting of 1 BHK/Bachelor items and small cargo.'
  },
  {
    id: 'bolero-pickup',
    name: 'Mahindra Bolero Pickup',
    capacity: '1.5 Tons (1500 Kg)',
    rateFirst100: 30,
    rateAfter100: 25,
    specs: '8.2 x 5.2 x 5 Feet',
    description: 'Perfect for 2 BHK shifting, heavier commercial cargo, and industrial loads.'
  },
  {
    id: 'three-wheeler',
    name: '3-Wheeler Loader',
    capacity: '500 Kg',
    rateFirst100: 20,
    rateAfter100: 15,
    specs: '5.5 x 4 x 4 Feet',
    description: 'Ideal for narrow streets, single appliance move, or local market delivery.'
  },
  {
    id: 'tata-407',
    name: 'Tata 407 Truck',
    capacity: '2.5 Tons (2500 Kg)',
    rateFirst100: 40,
    rateAfter100: 32,
    specs: '9.5 x 5.5 x 6 Feet',
    description: 'Suitable for 3 BHK house shifting, large office setups, and heavy loads.'
  }
];

export default function Estimator() {
  // Input Modes: 'search' (Map search) or 'manual' (State/District/City dropdowns)
  const [sourceMode, setSourceMode] = useState<'search' | 'manual'>('search');
  const [destMode, setDestMode] = useState<'search' | 'manual'>('search');

  // Map Search state
  const [sourceSearch, setSourceSearch] = useState('');
  const [destSearch, setDestSearch] = useState('');
  const [sourceSuggestions, setSourceSuggestions] = useState<any[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState({ source: false, dest: false });

  // Manual input state
  const [sourceState, setSourceState] = useState('Jharkhand');
  const [sourceDistrict, setSourceDistrict] = useState('');
  const [sourceCity, setSourceCity] = useState('');
  const [destState, setDestState] = useState('Jharkhand');
  const [destDistrict, setDestDistrict] = useState('');
  const [destCity, setDestCity] = useState('');

  // Map markers and route state
  const [sourceCoords, setSourceCoords] = useState<[number, number] | null>(null);
  const [destCoords, setDestCoords] = useState<[number, number] | null>(null);
  const [routeCoords, setRouteCoords] = useState<[number, number][] | null>(null);
  
  // Calculation result state
  const [vehicleId, setVehicleId] = useState('tata-ace');
  const [distance, setDistance] = useState<number>(0);
  const [calculated, setCalculated] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [routingError, setRoutingError] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [result, setResult] = useState({
    distance: 0,
    baseFare: 0,
    distanceFare: 0,
    fareMin: 0,
    fareMax: 0,
    vehicleName: 'Tata Ace (Chota Hathi)',
    capacity: '850 Kg',
    specs: '7 x 4.8 x 4.8 Feet'
  });

  const selectedVehicle = vehicles.find(v => v.id === vehicleId) || vehicles[0];
  const statesList = getStatesList();
  const sourceDistricts = getDistrictsOfState(sourceState);
  const destDistricts = getDistrictsOfState(destState);

  // Debounced search for Source suggestions
  useEffect(() => {
    if (sourceMode !== 'search' || sourceSearch.trim().length < 3) {
      setSourceSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingSuggestions(prev => ({ ...prev, source: true }));
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(sourceSearch)}&countrycodes=in&limit=5&addressdetails=1`
        );
        const data = await res.json();
        setSourceSuggestions(data);
      } catch (err) {
        console.error("Source geocoding search failed:", err);
      } finally {
        setLoadingSuggestions(prev => ({ ...prev, source: false }));
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [sourceSearch, sourceMode]);

  // Debounced search for Destination suggestions
  useEffect(() => {
    if (destMode !== 'search' || destSearch.trim().length < 3) {
      setDestSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingSuggestions(prev => ({ ...prev, dest: true }));
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destSearch)}&countrycodes=in&limit=5&addressdetails=1`
        );
        const data = await res.json();
        setDestSuggestions(data);
      } catch (err) {
        console.error("Destination geocoding search failed:", err);
      } finally {
        setLoadingSuggestions(prev => ({ ...prev, dest: false }));
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [destSearch, destMode]);

  // Handle select source suggestion
  const handleSelectSourceSuggestion = (item: any) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    setSourceCoords([lat, lon]);
    setSourceSearch(item.display_name);
    setSourceSuggestions([]);

    // Populate manual selectors as fallback
    const addr = item.address;
    if (addr) {
      const stateName = addr.state || '';
      const matchedState = statesList.find(s => s.toLowerCase() === stateName.toLowerCase() || stateName.toLowerCase().includes(s.toLowerCase()));
      if (matchedState) {
        setSourceState(matchedState);
        const districts = getDistrictsOfState(matchedState);
        const districtName = addr.county || addr.district || addr.state_district || '';
        const matchedDistrict = districts.find(d => d.toLowerCase() === districtName.toLowerCase() || districtName.toLowerCase().includes(d.toLowerCase()));
        if (matchedDistrict) setSourceDistrict(matchedDistrict);
      }
      setSourceCity(addr.city || addr.town || addr.village || addr.suburb || addr.neighbourhood || 'Selected Area');
    }
  };

  // Handle select destination suggestion
  const handleSelectDestSuggestion = (item: any) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    setDestCoords([lat, lon]);
    setDestSearch(item.display_name);
    setDestSuggestions([]);

    // Populate manual selectors as fallback
    const addr = item.address;
    if (addr) {
      const stateName = addr.state || '';
      const matchedState = statesList.find(s => s.toLowerCase() === stateName.toLowerCase() || stateName.toLowerCase().includes(s.toLowerCase()));
      if (matchedState) {
        setDestState(matchedState);
        const districts = getDistrictsOfState(matchedState);
        const districtName = addr.county || addr.district || addr.state_district || '';
        const matchedDistrict = districts.find(d => d.toLowerCase() === districtName.toLowerCase() || districtName.toLowerCase().includes(d.toLowerCase()));
        if (matchedDistrict) setDestDistrict(matchedDistrict);
      }
      setDestCity(addr.city || addr.town || addr.village || addr.suburb || addr.neighbourhood || 'Selected Area');
    }
  };

  // Helper: Geocode location manually
  const geocodeManualLocation = async (state: string, district: string, city: string): Promise<[number, number] | null> => {
    const query = `${city ? city + ', ' : ''}${district}, ${state}, India`;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
    } catch (err) {
      console.error("Geocoding failed for manual selection:", err);
    }
    return null;
  };

  // Helper: Haversine distance for routing fallback
  const calculateHaversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = R * c;
    return Math.round(dist * 1.35); // Scale factor for driving road routing
  };

  // Calculate pricing based on rule: first 100km - ₹25/km, thereafter ₹20/km
  const computePriceBreakdown = (distKm: number, selectedVehicle: typeof vehicles[0]) => {
    let distanceFare = 0;
    if (distKm <= 100) {
      distanceFare = distKm * selectedVehicle.rateFirst100;
    } else {
      distanceFare = (100 * selectedVehicle.rateFirst100) + ((distKm - 100) * selectedVehicle.rateAfter100);
    }

    const baseFare = 0;
    const computedFare = distanceFare;

    // Set range to exact calculated price
    const fareMin = computedFare;
    const fareMax = computedFare;

    return {
      baseFare,
      distanceFare,
      fareMin,
      fareMax
    };
  };

  // Main compute and route fetcher
  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCalculating(true);
    setRoutingError(false);
    setValidationError(null);

    // Validation checks
    if (sourceMode === 'search' && !sourceCoords) {
      setValidationError('Please type and select a pickup location from the map search suggestions.');
      setCalculating(false);
      return;
    }
    if (destMode === 'search' && !destCoords) {
      setValidationError('Please type and select a drop location from the map search suggestions.');
      setCalculating(false);
      return;
    }
    if (sourceMode === 'manual' && !sourceDistrict) {
      setValidationError('Please select a pickup district.');
      setCalculating(false);
      return;
    }
    if (destMode === 'manual' && !destDistrict) {
      setValidationError('Please select a drop district.');
      setCalculating(false);
      return;
    }

    let startCoords = sourceCoords;
    let endCoords = destCoords;

    // 1. Geocode manual choices if selected mode is manual
    if (sourceMode === 'manual') {
      const coords = await geocodeManualLocation(sourceState, sourceDistrict, sourceCity);
      if (coords) {
        startCoords = coords;
        setSourceCoords(coords);
      } else {
        setRoutingError(true);
        setCalculating(false);
        return;
      }
    }

    if (destMode === 'manual') {
      const coords = await geocodeManualLocation(destState, destDistrict, destCity);
      if (coords) {
        endCoords = coords;
        setDestCoords(coords);
      } else {
        setRoutingError(true);
        setCalculating(false);
        return;
      }
    }

    if (!startCoords || !endCoords) {
      setRoutingError(true);
      setCalculating(false);
      return;
    }

    // 2. Fetch OSRM Road Route
    let computedDistance = 0;
    let coordsRoute: [number, number][] = [];

    try {
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${startCoords[1]},${startCoords[0]};${endCoords[1]},${endCoords[0]}?overview=full&geometries=geojson`
      );
      const data = await res.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        computedDistance = Math.round(route.distance / 1000);
        coordsRoute = route.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
        setRouteCoords(coordsRoute);
      } else {
        throw new Error("No routes returned");
      }
    } catch (err) {
      console.warn("OSRM Route API failed, falling back to Haversine approximation:", err);
      // Fallback
      computedDistance = calculateHaversineDistance(
        startCoords[0], startCoords[1], 
        endCoords[0], endCoords[1]
      );
      setRouteCoords([[startCoords[0], startCoords[1]], [endCoords[0], endCoords[1]]]);
    }

    if (computedDistance === 0) computedDistance = 15; // Local city fallback
    setDistance(computedDistance);

    // 3. Compute pricing breakdown
    const prices = computePriceBreakdown(computedDistance, selectedVehicle);

    setResult({
      distance: computedDistance,
      baseFare: prices.baseFare,
      distanceFare: prices.distanceFare,
      fareMin: prices.fareMin,
      fareMax: prices.fareMax,
      vehicleName: selectedVehicle.name,
      capacity: selectedVehicle.capacity,
      specs: selectedVehicle.specs
    });

    setCalculated(true);
    setCalculating(false);

    // Smooth scroll down to results section
    setTimeout(() => {
      const resultSection = document.getElementById('estimator-result');
      if (resultSection) {
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 150);
  };

  const getWhatsAppLink = () => {
    const originLabel = sourceMode === 'search' ? sourceSearch : `${sourceCity}, ${sourceDistrict}, ${sourceState}`;
    const destLabel = destMode === 'search' ? destSearch : `${destCity}, ${destDistrict}, ${destState}`;
    const text = encodeURIComponent(
      `Hello B2 Transport! I would like to book a ${result.vehicleName} for a distance of ${result.distance} KM.\n` + 
      `Pickup: ${originLabel}\n` +
      `Drop: ${destLabel}\n` +
      `Estimated Price: ₹${result.fareMin} - ₹${result.fareMax}.\n` +
      `Please confirm driver availability and final rates.`
    );
    return `https://wa.me/917654722708?text=${text}`;
  };

  // Sync initial map route when coordinates are set
  useEffect(() => {
    if (sourceCoords && destCoords) {
      // Background route fetch
      fetch(
        `https://router.project-osrm.org/route/v1/driving/${sourceCoords[1]},${sourceCoords[0]};${destCoords[1]},${destCoords[0]}?overview=full&geometries=geojson`
      )
      .then(res => res.json())
      .then(data => {
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          setRouteCoords(route.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]));
        }
      })
      .catch(e => console.error("Initial routing error:", e));
    }
  }, []);

  const handleUseCurrentLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    
    setSourceMode('search');
    setSourceSearch('Locating current address...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setSourceCoords([lat, lon]);

        // Reverse geocode to get display address name
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`);
          const data = await res.json();
          if (data && data.display_name) {
            setSourceSearch(data.display_name);
            
            // Populate manual selectors in background
            const addr = data.address;
            if (addr) {
              const stateName = addr.state || '';
              const matchedState = statesList.find(s => s.toLowerCase() === stateName.toLowerCase() || stateName.toLowerCase().includes(s.toLowerCase()));
              if (matchedState) {
                setSourceState(matchedState);
                const districts = getDistrictsOfState(matchedState);
                const districtName = addr.county || addr.district || addr.state_district || '';
                const matchedDistrict = districts.find(d => d.toLowerCase() === districtName.toLowerCase() || districtName.toLowerCase().includes(d.toLowerCase()));
                if (matchedDistrict) setSourceDistrict(matchedDistrict);
              }
              setSourceCity(addr.city || addr.town || addr.village || addr.suburb || addr.neighbourhood || 'Current Location');
            }
          } else {
            setSourceSearch(`GPS Coords: ${lat.toFixed(4)}, ${lon.toFixed(4)}`);
          }
        } catch (err) {
          console.error("Reverse geocoding current location failed:", err);
          setSourceSearch(`GPS Coords: ${lat.toFixed(4)}, ${lon.toFixed(4)}`);
        }
      },
      (error) => {
        console.error("GPS access error:", error);
        alert("Failed to access your location. Please check your browser permissions.");
        setSourceSearch('');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleMarkerDrag = async (type: 'source' | 'destination', coords: [number, number]) => {
    if (type === 'source') {
      setSourceCoords(coords);
      // Reverse geocode to update label
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords[0]}&lon=${coords[1]}`);
        const data = await res.json();
        if (data && data.display_name) {
          setSourceSearch(data.display_name);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setDestCoords(coords);
      // Reverse geocode
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords[0]}&lon=${coords[1]}`);
        const data = await res.json();
        if (data && data.display_name) {
          setDestSearch(data.display_name);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const getSourceLabel = () => {
    if (sourceMode === 'search') return sourceSearch || 'Not selected';
    return sourceDistrict ? `${sourceCity ? sourceCity + ', ' : ''}${sourceDistrict}` : 'Not selected';
  };

  const getDestLabel = () => {
    if (destMode === 'search') return destSearch || 'Not selected';
    return destDistrict ? `${destCity ? destCity + ', ' : ''}${destDistrict}` : 'Not selected';
  };

  return (
    <section id="estimator" className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <div className={styles.badge}>REALTIME GIS ROUTING</div>
          <h2 className={styles.title}>Calculate Shifting & Transport Fare</h2>
          <p className={styles.subtitle}>
            Choose state, district, or search coordinates on the map. Get instant driving calculations and transparent tiered rates.
          </p>
        </div>

        <div className={styles.grid}>
          {/* Form Panel */}
          <div className={`glass-panel-glow ${styles.formContainer}`}>
            <form onSubmit={handleCalculate} className={styles.form}>
              
              {/* PICKUP ADDRESS SELECTOR */}
              <div className={styles.addressBlock}>
                <div className={styles.blockTitleRow}>
                  <div className={styles.blockIndicator} style={{ backgroundColor: 'var(--accent-cyan)' }}></div>
                  <h3 className={styles.blockTitle}>1. Pickup Location (Origin)</h3>
                  <div className={styles.toggleGroup}>
                    <button 
                      type="button" 
                      onClick={() => setSourceMode('search')}
                      className={`${styles.toggleBtn} ${sourceMode === 'search' ? styles.toggleActive : ''}`}
                    >
                      Search Map
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setSourceMode('manual')}
                      className={`${styles.toggleBtn} ${sourceMode === 'manual' ? styles.toggleActive : ''}`}
                    >
                      Region Select
                    </button>
                  </div>
                </div>

                {sourceMode === 'search' ? (
                  <div className={styles.inputGroup} style={{ position: 'relative' }}>
                    <div className={styles.inputWrapper}>
                      <Search size={18} className={styles.inputIcon} />
                      <input 
                        type="text" 
                        placeholder="Search city, town, or road in India..." 
                        value={sourceSearch}
                        onChange={(e) => setSourceSearch(e.target.value)}
                        className="form-input"
                        style={{ paddingLeft: '48px', paddingRight: '48px' }}
                      />
                      {loadingSuggestions.source && (
                        <span className={styles.spinner} style={{ right: '48px' }}></span>
                      )}
                      <button
                        type="button"
                        onClick={handleUseCurrentLocation}
                        className={styles.locateBtn}
                        title="Use current GPS location"
                      >
                        <Locate size={18} />
                      </button>
                    </div>
                    {sourceSuggestions.length > 0 && (
                      <div className={styles.suggestionsList}>
                        {sourceSuggestions.map((item, idx) => (
                          <div 
                            key={`src-sug-${idx}`} 
                            className={styles.suggestionItem}
                            onClick={() => handleSelectSourceSuggestion(item)}
                          >
                            <MapPin size={14} style={{ marginRight: '8px', color: 'var(--accent-cyan)' }} />
                            <span>{item.display_name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={styles.manualAddressGrid}>
                    <div className={styles.inputGroup}>
                      <label className="form-label">State</label>
                      <div className={styles.selectWrapper}>
                        <select 
                          value={sourceState} 
                          onChange={(e) => {
                            setSourceState(e.target.value);
                            const districts = getDistrictsOfState(e.target.value);
                            setSourceDistrict(districts[0] || '');
                          }}
                          className="form-input"
                        >
                          {statesList.map(s => <option key={`src-st-${s}`} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className={styles.inputGroup}>
                      <label className="form-label">District</label>
                      <div className={styles.selectWrapper}>
                        <select 
                          value={sourceDistrict} 
                          onChange={(e) => setSourceDistrict(e.target.value)}
                          className="form-input"
                        >
                          <option value="">Select District</option>
                          {sourceDistricts.map(d => <option key={`src-dt-${d}`} value={d}>{d}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className={styles.inputGroup} style={{ gridColumn: 'span 2' }}>
                      <label className="form-label">City / Town / Area</label>
                      <input 
                        type="text" 
                        value={sourceCity} 
                        onChange={(e) => setSourceCity(e.target.value)} 
                        className="form-input"
                        placeholder="E.g. Kanke Road, Lalpur, Doranda"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* DROP ADDRESS SELECTOR */}
              <div className={styles.addressBlock}>
                <div className={styles.blockTitleRow}>
                  <div className={styles.blockIndicator} style={{ backgroundColor: 'var(--accent-purple)' }}></div>
                  <h3 className={styles.blockTitle}>2. Drop Location (Destination)</h3>
                  <div className={styles.toggleGroup}>
                    <button 
                      type="button" 
                      onClick={() => setDestMode('search')}
                      className={`${styles.toggleBtn} ${destMode === 'search' ? styles.toggleActive : ''}`}
                    >
                      Search Map
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setDestMode('manual')}
                      className={`${styles.toggleBtn} ${destMode === 'manual' ? styles.toggleActive : ''}`}
                    >
                      Region Select
                    </button>
                  </div>
                </div>

                {destMode === 'search' ? (
                  <div className={styles.inputGroup} style={{ position: 'relative' }}>
                    <div className={styles.inputWrapper}>
                      <Search size={18} className={styles.inputIcon} />
                      <input 
                        type="text" 
                        placeholder="Search city, town, or road in India..." 
                        value={destSearch}
                        onChange={(e) => setDestSearch(e.target.value)}
                        className="form-input"
                        style={{ paddingLeft: '48px' }}
                      />
                      {loadingSuggestions.dest && <span className={styles.spinner}></span>}
                    </div>
                    {destSuggestions.length > 0 && (
                      <div className={styles.suggestionsList}>
                        {destSuggestions.map((item, idx) => (
                          <div 
                            key={`dest-sug-${idx}`} 
                            className={styles.suggestionItem}
                            onClick={() => handleSelectDestSuggestion(item)}
                          >
                            <MapPin size={14} style={{ marginRight: '8px', color: 'var(--accent-purple)' }} />
                            <span>{item.display_name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={styles.manualAddressGrid}>
                    <div className={styles.inputGroup}>
                      <label className="form-label">State</label>
                      <div className={styles.selectWrapper}>
                        <select 
                          value={destState} 
                          onChange={(e) => {
                            setDestState(e.target.value);
                            const districts = getDistrictsOfState(e.target.value);
                            setDestDistrict(districts[0] || '');
                          }}
                          className="form-input"
                        >
                          {statesList.map(s => <option key={`dest-st-${s}`} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className={styles.inputGroup}>
                      <label className="form-label">District</label>
                      <div className={styles.selectWrapper}>
                        <select 
                          value={destDistrict} 
                          onChange={(e) => setDestDistrict(e.target.value)}
                          className="form-input"
                        >
                          <option value="">Select District</option>
                          {destDistricts.map(d => <option key={`dest-dt-${d}`} value={d}>{d}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className={styles.inputGroup} style={{ gridColumn: 'span 2' }}>
                      <label className="form-label">City / Town / Area</label>
                      <input 
                        type="text" 
                        value={destCity} 
                        onChange={(e) => setDestCity(e.target.value)} 
                        className="form-input"
                        placeholder="E.g. Sakchi, Bistupur, Mango"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* VEHICLE PICKER */}
              <div className={styles.inputGroup}>
                <label className="form-label">3. Select Transportation Vehicle</label>
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
                          <div className={styles.vehicleCapacity}>Payload Capacity: {v.capacity}</div>
                        </div>
                      </div>
                      <div className={styles.radioCircle}></div>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                type="submit" 
                disabled={calculating} 
                className={`btn-neon ${styles.submitBtn}`}
              >
                <span>{calculating ? 'Optimizing GPS Dispatch...' : 'Compute Price Quote'}</span>
                <ArrowRight size={18} />
              </button>

              {validationError && (
                <div className={styles.errorMessage}>
                  {validationError}
                </div>
              )}

              {routingError && (
                <div className={styles.errorMessage}>
                  Could not plot route or verify locations. Please search again or adjust your manual selection.
                </div>
              )}
            </form>
          </div>

          {/* Results & Interactive Map Panel */}
          <div id="estimator-result" className={styles.resultColumn}>
            <div className={`glass-panel ${styles.interactiveMapBox}`}>
              <MapComponent 
                sourceCoords={sourceCoords}
                destCoords={destCoords}
                routeCoords={routeCoords}
                onMarkerDrag={handleMarkerDrag}
              />
              <div className={styles.mapHintBadge}>
                <Info size={12} />
                <span>Drag markers on the map to adjust location coordinates directly.</span>
              </div>
            </div>

            {!calculated ? (
              <div className={`glass-panel ${styles.promptCard}`}>
                <h3>AI Route Pricing Activated</h3>
                <p>Click "Compute Price Quote" to get the exact road mileage distance and a transparent breakdown of your logistics fare.</p>
                <div className={styles.pricingFormulaAlert}>
                  <div className={styles.formulaHeader}>
                    <Info size={14} style={{ color: 'var(--accent-cyan)' }} />
                    <span>Standard Shifting Rates (Tata Ace):</span>
                  </div>
                  <ul>
                    <li>First 100 KM: ₹25/KM</li>
                    <li>Above 100 KM: ₹20/KM</li>
                    <li>Rates tailored dynamically based on selected vehicle size</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className={`glass-panel ${styles.resultCard}`}>
                <div className={styles.resultHeader}>
                  <span className={styles.routeBadge}>ROUTE ESTIMATION SUMMARY</span>
                  <h3 className={styles.routeDisplay}>
                    <span className={styles.locName}>{getSourceLabel()}</span> 
                    <ArrowRight size={16} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} /> 
                    <span className={styles.locName}>{getDestLabel()}</span>
                  </h3>
                </div>

                <div className={styles.pricingContainer}>
                  <div className={styles.priceLabel}>Estimated Shifting Price (Jharkhand Special Rate)</div>
                  <div className={styles.priceValue}>
                    <IndianRupee size={30} className={styles.rupeeIcon} />
                    <span>{result.distanceFare.toLocaleString('en-IN')}</span>
                  </div>
                  <div className={styles.priceDisclaimer}>*Tolls, parking, and helper loading/unloading labor costs extra.</div>
                </div>

                {/* Pricing Breakdown */}
                <div className={styles.breakdownBox}>
                  <h4 className={styles.breakdownTitle}>Fare Computation Details</h4>
                  <div className={styles.breakdownRow}>
                    <span>Distance Fare ({result.distance} KM):</span>
                    <span>₹{result.distanceFare}</span>
                  </div>
                  <div className={styles.breakdownDivider}></div>
                  <div className={styles.breakdownRow} style={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}>
                    <span>Computed Total:</span>
                    <span>₹{result.distanceFare}</span>
                  </div>
                  <p className={styles.formulaDetailText}>
                    Formula: First 100km @ ₹{selectedVehicle.rateFirst100}/km, remainder @ ₹{selectedVehicle.rateAfter100}/km.
                  </p>
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
                    <span className={styles.detailLabel}>Cargo Space</span>
                    <span className={styles.detailVal}>{result.specs}</span>
                  </div>
                </div>

                <div className={styles.ctaGroup}>
                  <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer" className={`btn-neon ${styles.whatsappBtn}`}>
                    <Calendar size={18} />
                    <span>Confirm Booking & Route (WhatsApp)</span>
                  </a>
                  <a href="tel:7654722708" className={`btn-secondary ${styles.callBtn}`}>
                    <Phone size={18} />
                    <span>Call Dispatch: 7654722708</span>
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
