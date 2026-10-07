'use client';

import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  Calendar,
  Phone,
  MessageCircle,
  IndianRupee,
  Edit2,
  Trash2,
  AlertCircle,
  X,
  CreditCard,
  MapPin,
  ChevronDown,
} from 'lucide-react';
import styles from './fleet.module.css';
import { calculateTripFinancials } from '@/lib/fleetCalculations';

interface TripsProps {
  trips: any[];
  vehicles: any[];
  drivers: any[];
  loading: boolean;
  onRefresh: () => void;
  onOpenRecordPayment: (tripId: string) => void;
}

export default function FleetTrips({
  trips,
  vehicles,
  drivers,
  loading,
  onRefresh,
  onOpenRecordPayment,
}: TripsProps) {
  const [search, setSearch] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [driverFilter, setDriverFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState<any | null>(null);

  // Form State
  const [form, setForm] = useState<Record<string, any>>({
    date: new Date().toISOString().split('T')[0],
    vehicleId: '',
    driverId: '',
    tripRoute: '',
    customerName: '',
    customerMobile: '',
    totalKm: '',
    tripAmount: '',
    driverReceived: '',
    managerReceived: '',
    fuelExpense: '',
    tollExpense: '',
    parkingExpense: '',
    loadingExpense: '',
    repairExpense: '',
    maintenanceExpense: '',
    otherExpense: '',
    remarks: '',
  });

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Live client-side calculation preview
  const liveCalc = calculateTripFinancials({
    tripAmount: form.tripAmount,
    driverReceived: form.driverReceived,
    managerReceived: form.managerReceived,
    fuelExpense: form.fuelExpense,
    tollExpense: form.tollExpense,
    parkingExpense: form.parkingExpense,
    loadingExpense: form.loadingExpense,
    repairExpense: form.repairExpense,
    maintenanceExpense: form.maintenanceExpense,
    otherExpense: form.otherExpense,
    totalKm: form.totalKm,
  });

  const openAddModal = () => {
    setEditingTrip(null);
    setForm({
      date: new Date().toISOString().split('T')[0],
      vehicleId: vehicles[0]?._id || '',
      driverId: drivers[0]?._id || '',
      tripRoute: '',
      customerName: '',
      customerMobile: '',
      totalKm: '',
      tripAmount: '',
      driverReceived: '',
      managerReceived: '',
      fuelExpense: '',
      tollExpense: '',
      parkingExpense: '',
      loadingExpense: '',
      repairExpense: '',
      maintenanceExpense: '',
      otherExpense: '',
      remarks: '',
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const openEditModal = (t: any) => {
    setEditingTrip(t);
    setForm({
      date: t.date ? new Date(t.date).toISOString().split('T')[0] : '',
      vehicleId: t.vehicleId?._id || t.vehicleId || '',
      driverId: t.driverId?._id || t.driverId || '',
      tripRoute: t.tripRoute || '',
      customerName: t.customerName || '',
      customerMobile: t.customerMobile || '',
      totalKm: t.totalKm !== undefined && t.totalKm !== 0 ? t.totalKm : '',
      tripAmount: t.tripAmount !== undefined && t.tripAmount !== 0 ? t.tripAmount : '',
      driverReceived: t.driverReceived !== undefined && t.driverReceived !== 0 ? t.driverReceived : '',
      managerReceived: t.managerReceived !== undefined && t.managerReceived !== 0 ? t.managerReceived : '',
      fuelExpense: t.fuelExpense !== undefined && t.fuelExpense !== 0 ? t.fuelExpense : '',
      tollExpense: t.tollExpense !== undefined && t.tollExpense !== 0 ? t.tollExpense : '',
      parkingExpense: t.parkingExpense !== undefined && t.parkingExpense !== 0 ? t.parkingExpense : '',
      loadingExpense: t.loadingExpense !== undefined && t.loadingExpense !== 0 ? t.loadingExpense : '',
      repairExpense: t.repairExpense !== undefined && t.repairExpense !== 0 ? t.repairExpense : '',
      maintenanceExpense: t.maintenanceExpense !== undefined && t.maintenanceExpense !== 0 ? t.maintenanceExpense : '',
      otherExpense: t.otherExpense !== undefined && t.otherExpense !== 0 ? t.otherExpense : '',
      remarks: t.remarks || '',
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const handleVehicleSelect = (vId: string) => {
    // Automatically select the assigned driver if exists
    const selectedVehicle = vehicles.find((v) => v._id === vId);
    setForm((prev) => ({
      ...prev,
      vehicleId: vId,
      driverId: selectedVehicle?.assignedDriverId?._id || selectedVehicle?.assignedDriverId || prev.driverId,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');

    try {
      const url = '/api/admin/fleet/trips';
      const method = editingTrip ? 'PUT' : 'POST';
      const numericPayload = {
        ...form,
        totalKm: parseFloat(form.totalKm) || 0,
        tripAmount: parseFloat(form.tripAmount) || 0,
        driverReceived: parseFloat(form.driverReceived) || 0,
        managerReceived: parseFloat(form.managerReceived) || 0,
        fuelExpense: parseFloat(form.fuelExpense) || 0,
        tollExpense: parseFloat(form.tollExpense) || 0,
        parkingExpense: parseFloat(form.parkingExpense) || 0,
        loadingExpense: parseFloat(form.loadingExpense) || 0,
        repairExpense: parseFloat(form.repairExpense) || 0,
        maintenanceExpense: parseFloat(form.maintenanceExpense) || 0,
        otherExpense: parseFloat(form.otherExpense) || 0,
      };
      const payload = editingTrip ? { id: editingTrip._id, ...numericPayload } : numericPayload;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save trip');
      }

      setShowModal(false);
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving trip');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, route: string) => {
    if (!confirm(`Are you sure you want to delete trip (${route})?`)) return;

    try {
      const res = await fetch(`/api/admin/fleet/trips?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'Failed to delete trip');
        return;
      }
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  // Filter trips
  const filteredTrips = trips.filter((t) => {
    const vNumber = t.vehicleId?.registrationNumber || '';
    const dName = t.driverId?.fullName || '';
    const cName = t.customerName || '';
    const route = t.tripRoute || '';

    const matchesSearch =
      vNumber.toLowerCase().includes(search.toLowerCase()) ||
      dName.toLowerCase().includes(search.toLowerCase()) ||
      cName.toLowerCase().includes(search.toLowerCase()) ||
      route.toLowerCase().includes(search.toLowerCase()) ||
      t.customerMobile?.includes(search);

    const matchesVehicle = !vehicleFilter || t.vehicleId?._id === vehicleFilter;
    const matchesDriver = !driverFilter || t.driverId?._id === driverFilter;
    const matchesStatus = !statusFilter || t.status === statusFilter;

    // Date range filter
    let matchesDate = true;
    if (dateRange !== 'all') {
      const tripDate = new Date(t.date);
      const now = new Date();
      if (dateRange === 'today') {
        matchesDate = tripDate.toDateString() === now.toDateString();
      } else if (dateRange === 'yesterday') {
        const y = new Date(now);
        y.setDate(y.getDate() - 1);
        matchesDate = tripDate.toDateString() === y.toDateString();
      } else if (dateRange === 'thisWeek') {
        const day = now.getDay() || 7;
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1);
        matchesDate = tripDate >= start;
      } else if (dateRange === 'thisMonth') {
        matchesDate =
          tripDate.getMonth() === now.getMonth() && tripDate.getFullYear() === now.getFullYear();
      } else if (dateRange === 'custom') {
        if (customStart && new Date(customStart) > tripDate) matchesDate = false;
        if (customEnd) {
          const ed = new Date(customEnd);
          ed.setHours(23, 59, 59, 999);
          if (ed < tripDate) matchesDate = false;
        }
      }
    }

    return matchesSearch && matchesVehicle && matchesDriver && matchesStatus && matchesDate;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* Search & Comprehensive Filters Bar */}
      <div className={styles.filterBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, flexWrap: 'wrap' }}>
          <div className={styles.searchBox}>
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Search vehicle, driver, customer, route..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="thisWeek">This Week</option>
            <option value="thisMonth">This Month</option>
            <option value="custom">Custom Range</option>
          </select>

          {dateRange === 'custom' && (
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className={styles.filterSelect}
              />
              <span style={{ color: '#64748b' }}>to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className={styles.filterSelect}
              />
            </div>
          )}

          <select
            value={vehicleFilter}
            onChange={(e) => setVehicleFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Vehicles</option>
            {vehicles.map((v) => (
              <option key={v._id} value={v._id}>
                {v.registrationNumber}
              </option>
            ))}
          </select>

          <select
            value={driverFilter}
            onChange={(e) => setDriverFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Drivers</option>
            {drivers.map((d) => (
              <option key={d._id} value={d._id}>
                {d.fullName}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Statuses</option>
            <option value="PAID">PAID</option>
            <option value="PARTIAL">PARTIAL</option>
            <option value="PENDING">PENDING</option>
          </select>
        </div>

        <button onClick={openAddModal} className={styles.primaryActionBtn}>
          <Plus size={16} /> Record Trip
        </button>
      </div>

      {/* Desktop Table View */}
      <div className={styles.tableWrapper}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Vehicle</th>
              <th>Driver</th>
              <th>Customer / Contact</th>
              <th>Route / KM</th>
              <th>Trip Revenue</th>
              <th>Collected</th>
              <th>Pending</th>
              <th>Expenses</th>
              <th>Net Profit</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTrips.length === 0 ? (
              <tr>
                <td colSpan={12} style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                  No trips found matching criteria.
                </td>
              </tr>
            ) : (
              filteredTrips.map((t) => {
                const totalCollected = (t.driverReceived || 0) + (t.managerReceived || 0);
                return (
                  <tr key={t._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>
                        {new Date(t.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <div className={styles.vehiclePlate} style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}>
                        <span className={styles.plateIndBadge}>IND</span>
                        {t.vehicleId?.registrationNumber || 'Unknown'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, color: '#ffffff' }}>{t.driverId?.fullName || 'Unassigned'}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#ffffff' }}>{t.customerName}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{t.customerMobile}</span>
                        {t.customerMobile && (
                          <>
                            <a
                              href={`tel:${t.customerMobile}`}
                              className={`${styles.actionIconBtn} ${styles.actionIconCall}`}
                              style={{ width: '22px', height: '22px' }}
                              title="Call"
                            >
                              <Phone size={11} />
                            </a>
                            <a
                              href={`https://wa.me/91${t.customerMobile.replace(/\D/g, '')}?text=${encodeURIComponent(
                                `Hello ${t.customerName}, regarding transport trip (${t.tripRoute}), balance pending: ₹${t.pendingAmount}.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`${styles.actionIconBtn} ${styles.actionIconWhatsapp}`}
                              style={{ width: '22px', height: '22px' }}
                              title="WhatsApp"
                            >
                              <MessageCircle size={11} />
                            </a>
                          </>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, color: '#e2e8f0' }}>{t.tripRoute}</div>
                      <div style={{ fontSize: '0.75rem', color: '#38bdf8' }}>{t.totalKm} KM</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#38bdf8' }}>₹{t.tripAmount.toLocaleString()}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#34d399' }}>₹{totalCollected.toLocaleString()}</div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                        Dr: ₹{t.driverReceived} | Mgr: ₹{t.managerReceived}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: t.pendingAmount > 0 ? '#fbbf24' : '#64748b' }}>
                        ₹{t.pendingAmount.toLocaleString()}
                      </div>
                    </td>
                    <td>
                      <div style={{ color: '#f87171', fontWeight: 600 }}>₹{t.totalVehicleExpense.toLocaleString()}</div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Fuel: ₹{t.fuelExpense}</div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontWeight: 700,
                          color: t.netBalance >= 0 ? '#34d399' : '#f87171',
                        }}
                      >
                        ₹{t.netBalance.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${
                          t.status === 'PAID'
                            ? styles.statusPaid
                            : t.status === 'PARTIAL'
                            ? styles.statusPartial
                            : styles.statusPending
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        {t.pendingAmount > 0 && (
                          <button
                            onClick={() => onOpenRecordPayment(t._id)}
                            className={styles.actionIconBtn}
                            style={{ color: '#fbbf24' }}
                            title="Record Payment"
                          >
                            <CreditCard size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => openEditModal(t)}
                          className={styles.actionIconBtn}
                          title="Edit Trip"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(t._id, t.tripRoute)}
                          className={styles.actionIconBtn}
                          style={{ color: '#ef4444' }}
                          title="Delete Trip"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Responsive Cards */}
      <div className={styles.mobileCardsGrid}>
        {filteredTrips.map((t) => {
          const totalCollected = (t.driverReceived || 0) + (t.managerReceived || 0);
          return (
            <div key={t._id} className={styles.mobileCard}>
              <div className={styles.mobileCardHeader}>
                <div className={styles.vehiclePlate}>
                  <span className={styles.plateIndBadge}>IND</span>
                  {t.vehicleId?.registrationNumber || 'Vehicle'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {new Date(t.date).toLocaleDateString()}
                  </span>
                  <span
                    className={`${styles.statusBadge} ${
                      t.status === 'PAID'
                        ? styles.statusPaid
                        : t.status === 'PARTIAL'
                        ? styles.statusPartial
                        : styles.statusPending
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
              </div>

              <div>
                <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '1rem' }}>{t.customerName}</div>
                <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                  {t.tripRoute} ({t.totalKm} KM)
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Driver: {t.driverId?.fullName || 'Unassigned'}
                </div>
              </div>

              <div className={styles.mobileStatRow}>
                <div className={styles.mobileStatItem}>
                  <span className={styles.mobileStatLabel}>Revenue</span>
                  <span className={styles.mobileStatVal} style={{ color: '#38bdf8' }}>
                    ₹{t.tripAmount.toLocaleString()}
                  </span>
                </div>
                <div className={styles.mobileStatItem}>
                  <span className={styles.mobileStatLabel}>Collected</span>
                  <span className={styles.mobileStatVal} style={{ color: '#34d399' }}>
                    ₹{totalCollected.toLocaleString()}
                  </span>
                </div>
                <div className={styles.mobileStatItem}>
                  <span className={styles.mobileStatLabel}>Pending</span>
                  <span className={styles.mobileStatVal} style={{ color: t.pendingAmount > 0 ? '#fbbf24' : '#64748b' }}>
                    ₹{t.pendingAmount.toLocaleString()}
                  </span>
                </div>
                <div className={styles.mobileStatItem}>
                  <span className={styles.mobileStatLabel}>Net Profit</span>
                  <span className={styles.mobileStatVal} style={{ color: t.netBalance >= 0 ? '#34d399' : '#f87171' }}>
                    ₹{t.netBalance.toLocaleString()}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {t.customerMobile && (
                    <>
                      <a href={`tel:${t.customerMobile}`} className={`${styles.actionIconBtn} ${styles.actionIconCall}`}>
                        <Phone size={14} />
                      </a>
                      <a
                        href={`https://wa.me/91${t.customerMobile.replace(/\D/g, '')}?text=${encodeURIComponent(
                          `Hello ${t.customerName}, regarding transport trip (${t.tripRoute}), balance pending: ₹${t.pendingAmount}.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${styles.actionIconBtn} ${styles.actionIconWhatsapp}`}
                      >
                        <MessageCircle size={14} />
                      </a>
                    </>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {t.pendingAmount > 0 && (
                    <button
                      onClick={() => onOpenRecordPayment(t._id)}
                      className={styles.secondaryActionBtn}
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', color: '#fbbf24' }}
                    >
                      Collect
                    </button>
                  )}
                  <button onClick={() => openEditModal(t)} className={styles.secondaryActionBtn} style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}>
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => handleDelete(t._id, t.tripRoute)} className={styles.secondaryActionBtn} style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', color: '#ef4444' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Record / Edit Trip Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard} style={{ maxWidth: '780px' }}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {editingTrip ? 'Edit Trip Record' : 'Record New Vehicle Trip'}
              </h3>
              <button onClick={() => setShowModal(false)} className={styles.modalCloseBtn}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                {errorMsg && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <AlertCircle size={16} /> {errorMsg}
                  </div>
                )}

                {/* 1. Trip Information Section */}
                <div className={styles.modalSectionTitle}>1. Trip & Vehicle Information</div>
                <div className={styles.formGrid3}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Trip Date *</label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      required
                      className={styles.formInput}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Vehicle *</label>
                    <select
                      value={form.vehicleId}
                      onChange={(e) => handleVehicleSelect(e.target.value)}
                      required
                      className={styles.formInput}
                    >
                      <option value="">-- Select Vehicle --</option>
                      {vehicles.map((v) => (
                        <option key={v._id} value={v._id}>
                          {v.registrationNumber} ({v.model})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Driver *</label>
                    <select
                      value={form.driverId}
                      onChange={(e) => setForm({ ...form, driverId: e.target.value })}
                      required
                      className={styles.formInput}
                    >
                      <option value="">-- Select Driver --</option>
                      {drivers.map((d) => (
                        <option key={d._id} value={d._id}>
                          {d.fullName} ({d.phone})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.formGrid3}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Route Description *</label>
                    <input
                      type="text"
                      placeholder="e.g. Ranchi → Jamshedpur"
                      value={form.tripRoute}
                      onChange={(e) => setForm({ ...form, tripRoute: e.target.value })}
                      required
                      className={styles.formInput}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Customer Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Anand Kumar / ABC Logistics"
                      value={form.customerName}
                      onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                      required
                      className={styles.formInput}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Customer Mobile *</label>
                    <input
                      type="tel"
                      placeholder="e.g. 9835012345"
                      value={form.customerMobile}
                      onChange={(e) => setForm({ ...form, customerMobile: e.target.value })}
                      required
                      className={styles.formInput}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Total Distance (KM) *</label>
                  <div className={styles.formInputWrapper}>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="0"
                      value={form.totalKm ?? ''}
                      onChange={(e) => setForm({ ...form, totalKm: e.target.value })}
                      required
                      className={`${styles.formInput} ${styles.formInputWithSuffix}`}
                    />
                    <span className={styles.formInputSuffix}>KM</span>
                  </div>
                </div>

                {/* 2. Revenue & Collection Section */}
                <div className={styles.modalSectionTitle}>2. Revenue & Collections</div>
                <div className={styles.formGrid3}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Trip Amount (Invoice) *</label>
                    <div className={styles.formInputWrapper}>
                      <span className={styles.formInputPrefix}>₹</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="0"
                        value={form.tripAmount ?? ''}
                        onChange={(e) => setForm({ ...form, tripAmount: e.target.value })}
                        required
                        className={`${styles.formInput} ${styles.formInputWithPrefix}`}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Driver Received Cash</label>
                    <div className={styles.formInputWrapper}>
                      <span className={styles.formInputPrefix}>₹</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="0"
                        value={form.driverReceived ?? ''}
                        onChange={(e) => setForm({ ...form, driverReceived: e.target.value })}
                        className={`${styles.formInput} ${styles.formInputWithPrefix}`}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Manager Received (UPI/Bank)</label>
                    <div className={styles.formInputWrapper}>
                      <span className={styles.formInputPrefix}>₹</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="0"
                        value={form.managerReceived ?? ''}
                        onChange={(e) => setForm({ ...form, managerReceived: e.target.value })}
                        className={`${styles.formInput} ${styles.formInputWithPrefix}`}
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Trip Expenses Section */}
                <div className={styles.modalSectionTitle}>3. Trip Expenses Incurred</div>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Fuel Expense (Diesel/Petrol/CNG)</label>
                    <div className={styles.formInputWrapper}>
                      <span className={styles.formInputPrefix}>₹</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="0"
                        value={form.fuelExpense ?? ''}
                        onChange={(e) => setForm({ ...form, fuelExpense: e.target.value })}
                        className={`${styles.formInput} ${styles.formInputWithPrefix}`}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Toll Plaza Expense</label>
                    <div className={styles.formInputWrapper}>
                      <span className={styles.formInputPrefix}>₹</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="0"
                        value={form.tollExpense ?? ''}
                        onChange={(e) => setForm({ ...form, tollExpense: e.target.value })}
                        className={`${styles.formInput} ${styles.formInputWithPrefix}`}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.formGrid3}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Parking</label>
                    <div className={styles.formInputWrapper}>
                      <span className={styles.formInputPrefix}>₹</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="0"
                        value={form.parkingExpense ?? ''}
                        onChange={(e) => setForm({ ...form, parkingExpense: e.target.value })}
                        className={`${styles.formInput} ${styles.formInputWithPrefix}`}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Loading / Labor</label>
                    <div className={styles.formInputWrapper}>
                      <span className={styles.formInputPrefix}>₹</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="0"
                        value={form.loadingExpense ?? ''}
                        onChange={(e) => setForm({ ...form, loadingExpense: e.target.value })}
                        className={`${styles.formInput} ${styles.formInputWithPrefix}`}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Repair / Breakdown</label>
                    <div className={styles.formInputWrapper}>
                      <span className={styles.formInputPrefix}>₹</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="0"
                        value={form.repairExpense ?? ''}
                        onChange={(e) => setForm({ ...form, repairExpense: e.target.value })}
                        className={`${styles.formInput} ${styles.formInputWithPrefix}`}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Maintenance / Servicing</label>
                    <div className={styles.formInputWrapper}>
                      <span className={styles.formInputPrefix}>₹</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="0"
                        value={form.maintenanceExpense ?? ''}
                        onChange={(e) => setForm({ ...form, maintenanceExpense: e.target.value })}
                        className={`${styles.formInput} ${styles.formInputWithPrefix}`}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Other Expenses</label>
                    <div className={styles.formInputWrapper}>
                      <span className={styles.formInputPrefix}>₹</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="0"
                        value={form.otherExpense ?? ''}
                        onChange={(e) => setForm({ ...form, otherExpense: e.target.value })}
                        className={`${styles.formInput} ${styles.formInputWithPrefix}`}
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Live Summary Card */}
                <div className={styles.liveSummaryBanner}>
                  <div className={styles.summaryValBlock}>
                    <span className={styles.summaryValLabel}>Gross Revenue</span>
                    <span className={styles.summaryValAmount} style={{ color: '#38bdf8' }}>
                      ₹{liveCalc.tripAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className={styles.summaryValBlock}>
                    <span className={styles.summaryValLabel}>Collected</span>
                    <span className={styles.summaryValAmount} style={{ color: '#34d399' }}>
                      ₹{liveCalc.totalCollected.toLocaleString()}
                    </span>
                  </div>
                  <div className={styles.summaryValBlock}>
                    <span className={styles.summaryValLabel}>Pending</span>
                    <span className={styles.summaryValAmount} style={{ color: liveCalc.pendingAmount > 0 ? '#fbbf24' : '#64748b' }}>
                      ₹{liveCalc.pendingAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className={styles.summaryValBlock}>
                    <span className={styles.summaryValLabel}>Total Expenses</span>
                    <span className={styles.summaryValAmount} style={{ color: '#f87171' }}>
                      ₹{liveCalc.totalVehicleExpense.toLocaleString()}
                    </span>
                  </div>
                  <div className={styles.summaryValBlock}>
                    <span className={styles.summaryValLabel}>Net Profit</span>
                    <span className={styles.summaryValAmount} style={{ color: liveCalc.netBalance >= 0 ? '#34d399' : '#f87171' }}>
                      ₹{liveCalc.netBalance.toLocaleString()}
                    </span>
                  </div>
                  <div className={styles.summaryValBlock}>
                    <span className={styles.summaryValLabel}>Fuel / KM</span>
                    <span className={styles.summaryValAmount} style={{ color: '#e2e8f0', fontSize: '0.95rem' }}>
                      ₹{liveCalc.fuelCostPerKm}
                    </span>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Trip Remarks / Notes</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Goods delivered safely, customer requested invoice on WhatsApp..."
                    value={form.remarks}
                    onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                    className={styles.formInput}
                  />
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={styles.secondaryActionBtn}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.primaryActionBtn} disabled={saving}>
                  {saving ? 'Saving...' : editingTrip ? 'Update Trip Record' : 'Save Trip Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
