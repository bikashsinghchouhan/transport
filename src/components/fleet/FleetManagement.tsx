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
  action?: string | null;
  onActionChange?: (action: string | null) => void;
  onNavigateTabAndAction?: (tab: FleetSubTab, action?: string | null) => void;
}

export default function FleetManagement({
  activeSubTab: externalSubTab,
  onSubTabChange,
  action,
  onActionChange,
  onNavigateTabAndAction,
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
          onNavigateTab={(tab) => {
            if (onNavigateTabAndAction) {
              onNavigateTabAndAction(tab as any);
            } else {
              setActiveSubTab(tab as any);
            }
          }}
          onOpenRecordTrip={() => {
            if (onNavigateTabAndAction) {
              onNavigateTabAndAction('trips', 'add');
            } else {
              setActiveSubTab('trips');
              if (onActionChange) onActionChange('add');
            }
          }}
          onOpenRecordPayment={handleOpenRecordPayment}
          onRefresh={fetchAllFleetData}
        />
      )}

      {activeSubTab === 'vehicles' && (
        <FleetVehicles
          vehicles={vehicles}
          drivers={drivers}
          loading={loading}
          onRefresh={fetchAllFleetData}
          action={activeSubTab === 'vehicles' ? action : null}
          onActionChange={onActionChange}
        />
      )}

      {activeSubTab === 'drivers' && (
        <FleetDrivers
          drivers={drivers}
          vehicles={vehicles}
          loading={loading}
          onRefresh={fetchAllFleetData}
          action={activeSubTab === 'drivers' ? action : null}
          onActionChange={onActionChange}
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
          action={activeSubTab === 'trips' ? action : null}
          onActionChange={onActionChange}
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
          action={activeSubTab === 'expenses' ? action : null}
          onActionChange={onActionChange}
        />
      )}

      {activeSubTab === 'payments' && (
        <FleetPayments
          onRefreshStats={fetchAllFleetData}
          targetTripId={targetTripForPayment}
          onClearTargetTrip={() => setTargetTripForPayment(null)}
          action={activeSubTab === 'payments' ? action : null}
          onActionChange={onActionChange}
        />
      )}

      {activeSubTab === 'reports' && <FleetReports />}
    </div>
  );
}
