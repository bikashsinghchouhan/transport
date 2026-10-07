'use client';

import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  Edit2,
  Trash2,
  User,
  Calendar,
  IndianRupee,
  Activity,
  AlertCircle,
  X,
} from 'lucide-react';
import styles from './fleet.module.css';

interface VehicleProps {
  vehicles: any[];
  drivers: any[];
  loading: boolean;
  onRefresh: () => void;
  onSelectVehicleForTrips?: (vehicleId: string) => void;
}

export default function FleetVehicles({
  vehicles,
  drivers,
  loading,
  onRefresh,
  onSelectVehicleForTrips,
}: VehicleProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<any | null>(null);

  // Form State
  const [form, setForm] = useState({
    registrationNumber: '',
    model: '',
    vehicleType: 'Mini Truck',
    status: 'ACTIVE',
    assignedDriverId: '',
    purchaseDate: '',
    remarks: '',
  });

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const openAddModal = () => {
    setEditingVehicle(null);
    setForm({
      registrationNumber: '',
      model: '',
      vehicleType: 'Mini Truck',
      status: 'ACTIVE',
      assignedDriverId: '',
      purchaseDate: '',
      remarks: '',
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const openEditModal = (v: any) => {
    setEditingVehicle(v);
    setForm({
      registrationNumber: v.registrationNumber || '',
      model: v.model || '',
      vehicleType: v.vehicleType || 'Mini Truck',
      status: v.status || 'ACTIVE',
      assignedDriverId: v.assignedDriverId?._id || v.assignedDriverId || '',
      purchaseDate: v.purchaseDate ? new Date(v.purchaseDate).toISOString().split('T')[0] : '',
      remarks: v.remarks || '',
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');

    try {
      const url = '/api/admin/fleet/vehicles';
      const method = editingVehicle ? 'PUT' : 'POST';
      const payload = editingVehicle ? { id: editingVehicle._id, ...form } : form;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save vehicle');
      }

      setShowModal(false);
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving vehicle');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, regNo: string) => {
    if (!confirm(`Are you sure you want to delete vehicle ${regNo}?`)) return;

    try {
      const res = await fetch(`/api/admin/fleet/vehicles?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'Failed to delete vehicle');
        return;
      }
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.registrationNumber.toLowerCase().includes(search.toLowerCase()) ||
      v.model.toLowerCase().includes(search.toLowerCase()) ||
      v.vehicleType.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* Search & Actions Bar */}
      <div className={styles.filterBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, flexWrap: 'wrap' }}>
          <div className={styles.searchBox}>
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Search by vehicle number, model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="IN_MAINTENANCE">In Maintenance</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        <button onClick={openAddModal} className={styles.primaryActionBtn}>
          <Plus size={16} /> Add Vehicle
        </button>
      </div>

      {/* Desktop Table View */}
      <div className={styles.tableWrapper}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Vehicle Number</th>
              <th>Model / Type</th>
              <th>Status</th>
              <th>Assigned Driver</th>
              <th>Trips / KM</th>
              <th>Revenue / Expenses</th>
              <th>Net Profit</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                  No fleet vehicles found matching criteria.
                </td>
              </tr>
            ) : (
              filteredVehicles.map((v) => (
                <tr key={v._id}>
                  <td>
                    <div className={styles.vehiclePlate}>
                      <span className={styles.plateIndBadge}>IND</span>
                      {v.registrationNumber}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#ffffff' }}>{v.model}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{v.vehicleType}</div>
                  </td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${
                        v.status === 'ACTIVE'
                          ? styles.statusActive
                          : v.status === 'IN_MAINTENANCE'
                          ? styles.statusMaintenance
                          : styles.statusInactive
                      }`}
                    >
                      {v.status === 'IN_MAINTENANCE' ? 'Maintenance' : v.status}
                    </span>
                  </td>
                  <td>
                    {v.assignedDriverId ? (
                      <div>
                        <div style={{ fontWeight: 500, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <User size={13} color="#38bdf8" />
                          {v.assignedDriverId.fullName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{v.assignedDriverId.phone}</div>
                      </div>
                    ) : (
                      <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Unassigned</span>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#ffffff' }}>{v.stats?.totalTrips || 0} trips</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{(v.stats?.totalKm || 0).toLocaleString()} KM</div>
                  </td>
                  <td>
                    <div style={{ color: '#38bdf8', fontWeight: 600 }}>₹{(v.stats?.totalRevenue || 0).toLocaleString()}</div>
                    <div style={{ color: '#f87171', fontSize: '0.75rem' }}>-₹{(v.stats?.totalExpenses || 0).toLocaleString()}</div>
                  </td>
                  <td>
                    <span
                      style={{
                        fontWeight: 700,
                        color: (v.stats?.totalNetProfit || 0) >= 0 ? '#34d399' : '#f87171',
                      }}
                    >
                      ₹{(v.stats?.totalNetProfit || 0).toLocaleString()}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      <button
                        onClick={() => openEditModal(v)}
                        className={styles.actionIconBtn}
                        title="Edit Vehicle"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(v._id, v.registrationNumber)}
                        className={styles.actionIconBtn}
                        style={{ color: '#ef4444' }}
                        title="Delete Vehicle"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Responsive Cards View */}
      <div className={styles.mobileCardsGrid}>
        {filteredVehicles.map((v) => (
          <div key={v._id} className={styles.mobileCard}>
            <div className={styles.mobileCardHeader}>
              <div className={styles.vehiclePlate}>
                <span className={styles.plateIndBadge}>IND</span>
                {v.registrationNumber}
              </div>
              <span
                className={`${styles.statusBadge} ${
                  v.status === 'ACTIVE'
                    ? styles.statusActive
                    : v.status === 'IN_MAINTENANCE'
                    ? styles.statusMaintenance
                    : styles.statusInactive
                }`}
              >
                {v.status}
              </span>
            </div>

            <div>
              <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '1rem' }}>{v.model}</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                {v.vehicleType} • Driver: {v.assignedDriverId?.fullName || 'Unassigned'}
              </div>
            </div>

            <div className={styles.mobileStatRow}>
              <div className={styles.mobileStatItem}>
                <span className={styles.mobileStatLabel}>Trips</span>
                <span className={styles.mobileStatVal}>{v.stats?.totalTrips || 0}</span>
              </div>
              <div className={styles.mobileStatItem}>
                <span className={styles.mobileStatLabel}>Distance</span>
                <span className={styles.mobileStatVal}>{(v.stats?.totalKm || 0).toLocaleString()} KM</span>
              </div>
              <div className={styles.mobileStatItem}>
                <span className={styles.mobileStatLabel}>Revenue</span>
                <span className={styles.mobileStatVal} style={{ color: '#38bdf8' }}>
                  ₹{(v.stats?.totalRevenue || 0).toLocaleString()}
                </span>
              </div>
              <div className={styles.mobileStatItem}>
                <span className={styles.mobileStatLabel}>Net Profit</span>
                <span className={styles.mobileStatVal} style={{ color: '#34d399' }}>
                  ₹{(v.stats?.totalNetProfit || 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }}>
              <button onClick={() => openEditModal(v)} className={styles.secondaryActionBtn} style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>
                <Edit2 size={13} /> Edit
              </button>
              <button onClick={() => handleDelete(v._id, v.registrationNumber)} className={styles.secondaryActionBtn} style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', color: '#ef4444' }}>
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Vehicle Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {editingVehicle ? 'Edit Fleet Vehicle' : 'Add New Fleet Vehicle'}
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

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Registration Number *</label>
                    <input
                      type="text"
                      placeholder="e.g. JH 01 AX 1024 / KA 09 AB 1234"
                      value={form.registrationNumber}
                      onChange={(e) => setForm({ ...form, registrationNumber: e.target.value.toUpperCase() })}
                      required
                      className={styles.formInput}
                      style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Vehicle Model *</label>
                    <input
                      type="text"
                      placeholder="e.g. Tata Ace Gold / Bolero Maxi"
                      value={form.model}
                      onChange={(e) => setForm({ ...form, model: e.target.value })}
                      required
                      className={styles.formInput}
                    />
                  </div>
                </div>

                <div className={styles.formGrid3}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Vehicle Type</label>
                    <select
                      value={form.vehicleType}
                      onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
                      className={styles.formInput}
                    >
                      <option value="Mini Truck">Mini Truck (Tata Ace)</option>
                      <option value="Pickup 1.3T">Pickup 1.3T (Bolero)</option>
                      <option value="3-Wheeler Loader">3-Wheeler Loader</option>
                      <option value="Container Truck">Container Truck (14ft)</option>
                      <option value="Open Truck">Open Truck</option>
                      <option value="Trailer / Other">Trailer / Other</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className={styles.formInput}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="IN_MAINTENANCE">IN_MAINTENANCE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Assigned Driver</label>
                    <select
                      value={form.assignedDriverId}
                      onChange={(e) => setForm({ ...form, assignedDriverId: e.target.value })}
                      className={styles.formInput}
                    >
                      <option value="">-- None (Unassigned) --</option>
                      {drivers.map((d) => (
                        <option key={d._id} value={d._id}>
                          {d.fullName} ({d.phone})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Purchase / Deployment Date</label>
                  <input
                    type="date"
                    value={form.purchaseDate}
                    onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Remarks / Special Specifications</label>
                  <textarea
                    rows={2}
                    placeholder="GPS installed, fastag ID, insurance details..."
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
                  {saving ? 'Saving...' : editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
