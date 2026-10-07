'use client';

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Truck,
  Users,
  Navigation,
  CalendarCheck,
  Receipt,
  CreditCard,
  FileSpreadsheet,
  Plus,
  RefreshCw,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import styles from './fleet.module.css';
import FleetDashboard from './FleetDashboard';
import FleetVehicles from './FleetVehicles';
import FleetDrivers from './FleetDrivers';
import FleetTrips from './FleetTrips';
import FleetAttendance from './FleetAttendance';
import FleetExpenses from './FleetExpenses';
import FleetPayments from './FleetPayments';
import FleetReports from './FleetReports';

export type FleetSubTab =
  | 'dashboard'
  | 'trips'
  | 'attendance'
  | 'expenses'
  | 'payments'
  | 'drivers'
  | 'vehicles'
  | 'reports';

export interface FleetManagementProps {
  activeSubTab?: FleetSubTab;
  onSubTabChange?: (tab: FleetSubTab) => void;
}

export default function FleetManagement({
  activeSubTab: externalSubTab,
  onSubTabChange,
}: FleetManagementProps = {}) {
  const [internalSubTab, setInternalSubTab] = useState<FleetSubTab>('dashboard');
  const activeSubTab = externalSubTab || internalSubTab;

  const setActiveSubTab = (tab: FleetSubTab) => {
    setInternalSubTab(tab);
    if (onSubTabChange) {
      onSubTabChange(tab);
    }
  };

  const [stats, setStats] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedSuccessMsg, setSeedSuccessMsg] = useState('');

  // Target trip for payments modal triggered from another tab
  const [targetTripForPayment, setTargetTripForPayment] = useState<string | null>(null);

  const fetchAllFleetData = async () => {
    setLoading(true);
    try {
      const [statsRes, vehRes, drivRes, tripsRes] = await Promise.all([
        fetch('/api/admin/fleet/stats'),
        fetch('/api/admin/fleet/vehicles'),
        fetch('/api/admin/fleet/drivers'),
        fetch('/api/admin/fleet/trips'),
      ]);

      const [statsData, vehData, drivData, tripsData] = await Promise.all([
        statsRes.json(),
        vehRes.json(),
        drivRes.json(),
        tripsRes.json(),
      ]);

      if (statsData.success) setStats(statsData);
      if (vehData.success) setVehicles(vehData.vehicles || []);
      if (drivData.success) setDrivers(drivData.drivers || []);
      if (tripsData.success) setTrips(tripsData.trips || []);
    } catch (err) {
      console.error('Failed to load fleet data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllFleetData();
  }, []);

  const handleSeedDemoData = async () => {
    setSeeding(true);
    setSeedSuccessMsg('');
    try {
      const res = await fetch('/api/admin/fleet/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSeedSuccessMsg(data.message || 'Demo fleet data ready!');
        fetchAllFleetData();
        setTimeout(() => setSeedSuccessMsg(''), 5000);
      } else {
        alert(data.error || 'Failed to seed data');
      }
    } catch (err: any) {
      alert(err.message || 'Seeding error');
    } finally {
      setSeeding(false);
    }
  };

  const handleOpenRecordPayment = (tripId: string) => {
    setTargetTripForPayment(tripId);
    setActiveSubTab('payments');
  };

  return (
    <div className={styles.fleetContainer}>
      {/* Sub-Navigation & Quick Action Bar */}
      <div className={styles.subNavBar}>
        <div className={styles.subNavList}>
          <button
            className={`${styles.subNavItem} ${activeSubTab === 'dashboard' ? styles.subNavItemActive : ''}`}
            onClick={() => setActiveSubTab('dashboard')}
          >
            <LayoutDashboard size={15} /> Dashboard
          </button>

          <button
            className={`${styles.subNavItem} ${activeSubTab === 'trips' ? styles.subNavItemActive : ''}`}
            onClick={() => setActiveSubTab('trips')}
          >
            <Navigation size={15} /> Trips ({trips.length})
          </button>

          <button
            className={`${styles.subNavItem} ${activeSubTab === 'attendance' ? styles.subNavItemActive : ''}`}
            onClick={() => setActiveSubTab('attendance')}
          >
            <CalendarCheck size={15} /> Attendance
          </button>

          <button
            className={`${styles.subNavItem} ${activeSubTab === 'expenses' ? styles.subNavItemActive : ''}`}
            onClick={() => setActiveSubTab('expenses')}
          >
            <Receipt size={15} /> Expenses
          </button>

          <button
            className={`${styles.subNavItem} ${activeSubTab === 'payments' ? styles.subNavItemActive : ''}`}
            onClick={() => setActiveSubTab('payments')}
          >
            <CreditCard size={15} /> Payments
            {stats?.kpis?.pendingReceivables > 0 && (
              <span className={styles.subNavItemBadge}>
                ₹{(stats.kpis.pendingReceivables / 1000).toFixed(0)}k
              </span>
            )}
          </button>

          <button
            className={`${styles.subNavItem} ${activeSubTab === 'drivers' ? styles.subNavItemActive : ''}`}
            onClick={() => setActiveSubTab('drivers')}
          >
            <Users size={15} /> Drivers ({drivers.length})
          </button>

          <button
            className={`${styles.subNavItem} ${activeSubTab === 'vehicles' ? styles.subNavItemActive : ''}`}
            onClick={() => setActiveSubTab('vehicles')}
          >
            <Truck size={15} /> Vehicles ({vehicles.length})
          </button>

          <button
            className={`${styles.subNavItem} ${activeSubTab === 'reports' ? styles.subNavItemActive : ''}`}
            onClick={() => setActiveSubTab('reports')}
          >
            <FileSpreadsheet size={15} /> Reports
          </button>
        </div>

        <div className={styles.actionBtnGroup}>
          <button
            onClick={fetchAllFleetData}
            className={styles.secondaryActionBtn}
            title="Refresh fleet data"
          >
            <RefreshCw size={14} className={loading ? styles.spinner : ''} />
          </button>

          {vehicles.length === 0 && (
            <button
              onClick={handleSeedDemoData}
              className={styles.secondaryActionBtn}
              style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)' }}
              disabled={seeding}
            >
              <Sparkles size={14} /> {seeding ? 'Seeding...' : 'Load Demo Fleet'}
            </button>
          )}

          {activeSubTab !== 'trips' && (
            <button
              onClick={() => setActiveSubTab('trips')}
              className={styles.primaryActionBtn}
            >
              <Plus size={15} /> Record Trip
            </button>
          )}
        </div>
      </div>

      {seedSuccessMsg && (
        <div style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.4)', color: '#4ade80', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={16} /> {seedSuccessMsg}
        </div>
      )}

      {/* Render Active Sub Tab Content */}
      {activeSubTab === 'dashboard' && (
        <FleetDashboard
          stats={stats}
          loading={loading}
          onNavigateTab={(tab) => setActiveSubTab(tab as any)}
          onOpenRecordTrip={() => setActiveSubTab('trips')}
          onOpenRecordPayment={handleOpenRecordPayment}
        />
      )}

      {activeSubTab === 'vehicles' && (
        <FleetVehicles
          vehicles={vehicles}
          drivers={drivers}
          loading={loading}
          onRefresh={fetchAllFleetData}
        />
      )}

      {activeSubTab === 'drivers' && (
        <FleetDrivers
          drivers={drivers}
          vehicles={vehicles}
          loading={loading}
          onRefresh={fetchAllFleetData}
        />
      )}

      {activeSubTab === 'trips' && (
        <FleetTrips
          trips={trips}
          vehicles={vehicles}
          drivers={drivers}
          loading={loading}
          onRefresh={fetchAllFleetData}
          onOpenRecordPayment={handleOpenRecordPayment}
        />
      )}

      {activeSubTab === 'attendance' && (
        <FleetAttendance
          drivers={drivers}
          vehicles={vehicles}
          onRefreshStats={fetchAllFleetData}
        />
      )}

      {activeSubTab === 'expenses' && (
        <FleetExpenses
          vehicles={vehicles}
          drivers={drivers}
          onRefreshStats={fetchAllFleetData}
        />
      )}

      {activeSubTab === 'payments' && (
        <FleetPayments
          onRefreshStats={fetchAllFleetData}
          targetTripId={targetTripForPayment}
          onClearTargetTrip={() => setTargetTripForPayment(null)}
        />
      )}

      {activeSubTab === 'reports' && <FleetReports />}
    </div>
  );
}
