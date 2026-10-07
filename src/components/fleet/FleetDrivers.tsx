'use client';

import React, { useState } from 'react';
import {
  User,
  Plus,
  Search,
  Phone,
  MessageCircle,
  Truck,
  Edit2,
  Trash2,
  Calendar,
  ShieldCheck,
  AlertCircle,
  X,
  CreditCard,
} from 'lucide-react';
import styles from './fleet.module.css';

interface DriverProps {
  drivers: any[];
  vehicles: any[];
  loading: boolean;
  onRefresh: () => void;
}

export default function FleetDrivers({
  drivers,
  vehicles,
  loading,
  onRefresh,
}: DriverProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState<any | null>(null);

  // Form State
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    licenseNumber: '',
    licenseExpiryDate: '',
    assignedVehicleId: '',
    status: 'ACTIVE',
    remarks: '',
  });

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const openAddModal = () => {
    setEditingDriver(null);
    setForm({
      fullName: '',
      phone: '',
      licenseNumber: '',
      licenseExpiryDate: '',
      assignedVehicleId: '',
      status: 'ACTIVE',
      remarks: '',
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const openEditModal = (d: any) => {
    setEditingDriver(d);
    setForm({
      fullName: d.fullName || '',
      phone: d.phone || '',
      licenseNumber: d.licenseNumber || '',
      licenseExpiryDate: d.licenseExpiryDate
        ? new Date(d.licenseExpiryDate).toISOString().split('T')[0]
        : '',
      assignedVehicleId: d.assignedVehicleId?._id || d.assignedVehicleId || '',
      status: d.status || 'ACTIVE',
      remarks: d.remarks || '',
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');

    try {
      const url = '/api/admin/fleet/drivers';
      const method = editingDriver ? 'PUT' : 'POST';
      const payload = editingDriver ? { id: editingDriver._id, ...form } : form;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save driver');
      }

      setShowModal(false);
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving driver');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove driver ${name}?`)) return;

    try {
      const res = await fetch(`/api/admin/fleet/drivers?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'Failed to delete driver');
        return;
      }
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  const filteredDrivers = drivers.filter((d) => {
    const matchesSearch =
      d.fullName.toLowerCase().includes(search.toLowerCase()) ||
      d.phone.includes(search) ||
      d.licenseNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || d.status === statusFilter;
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
              placeholder="Search by driver name, phone, license..."
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
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        <button onClick={openAddModal} className={styles.primaryActionBtn}>
          <Plus size={16} /> Add Driver
        </button>
      </div>

      {/* Desktop Table View */}
      <div className={styles.tableWrapper}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Driver Info</th>
              <th>Contact & Quick Reach</th>
              <th>License / Expiry</th>
              <th>Assigned Vehicle</th>
              <th>Attendance</th>
              <th>Trips / KM</th>
              <th>Cash Collected</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDrivers.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                  No drivers found matching criteria.
                </td>
              </tr>
            ) : (
              filteredDrivers.map((d) => {
                const cleanPhone = d.phone.replace(/\D/g, '');
                return (
                  <tr key={d._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#ffffff' }}>{d.fullName}</div>
                      {d.remarks && (
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {d.remarks}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{d.phone}</span>
                        <a
                          href={`tel:${d.phone}`}
                          className={`${styles.actionIconBtn} ${styles.actionIconCall}`}
                          title={`Call ${d.fullName}`}
                        >
                          <Phone size={13} />
                        </a>
                        <a
                          href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
                            `Hello ${d.fullName}, this is B2 Transport Fleet Admin.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${styles.actionIconBtn} ${styles.actionIconWhatsapp}`}
                          title="WhatsApp Driver"
                        >
                          <MessageCircle size={13} />
                        </a>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontFamily: 'monospace', fontWeight: 600, color: '#38bdf8' }}>
                        {d.licenseNumber}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        {d.licenseExpiryDate
                          ? `Expires: ${new Date(d.licenseExpiryDate).toLocaleDateString()}`
                          : 'No Expiry Set'}
                      </div>
                    </td>
                    <td>
                      {d.assignedVehicleId ? (
                        <div className={styles.vehiclePlate} style={{ padding: '0.2rem 0.5rem', fontSize: '0.82rem' }}>
                          <span className={styles.plateIndBadge}>IND</span>
                          {d.assignedVehicleId.registrationNumber}
                        </div>
                      ) : (
                        <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Unassigned</span>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#34d399' }}>
                        {d.stats?.presentDays || 0} Present Days
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        Total logged: {d.stats?.totalDays || 0}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#ffffff' }}>{d.stats?.totalTrips || 0} trips</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{(d.stats?.totalKm || 0).toLocaleString()} KM</div>
                    </td>
                    <td>
                      <div style={{ color: '#fbbf24', fontWeight: 600 }}>
                        ₹{(d.stats?.driverCollected || 0).toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        Total Revenue: ₹{(d.stats?.totalRevenue || 0).toLocaleString()}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${
                          d.status === 'ACTIVE' ? styles.statusActive : styles.statusInactive
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => openEditModal(d)}
                          className={styles.actionIconBtn}
                          title="Edit Driver"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(d._id, d.fullName)}
                          className={styles.actionIconBtn}
                          style={{ color: '#ef4444' }}
                          title="Delete Driver"
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
        {filteredDrivers.map((d) => {
          const cleanPhone = d.phone.replace(/\D/g, '');
          return (
            <div key={d._id} className={styles.mobileCard}>
              <div className={styles.mobileCardHeader}>
                <div>
                  <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '1rem' }}>{d.fullName}</div>
                  <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontFamily: 'monospace' }}>
                    {d.licenseNumber}
                  </div>
                </div>
                <span
                  className={`${styles.statusBadge} ${
                    d.status === 'ACTIVE' ? styles.statusActive : styles.statusInactive
                  }`}
                >
                  {d.status}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{d.phone}</span>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <a
                    href={`tel:${d.phone}`}
                    className={`${styles.actionIconBtn} ${styles.actionIconCall}`}
                    title="Call"
                  >
                    <Phone size={14} />
                  </a>
                  <a
                    href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
                      `Hello ${d.fullName}, this is B2 Transport Fleet Admin.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${styles.actionIconBtn} ${styles.actionIconWhatsapp}`}
                    title="WhatsApp"
                  >
                    <MessageCircle size={14} />
                  </a>
                </div>
              </div>

              <div className={styles.mobileStatRow}>
                <div className={styles.mobileStatItem}>
                  <span className={styles.mobileStatLabel}>Assigned Truck</span>
                  <span className={styles.mobileStatVal} style={{ fontSize: '0.85rem' }}>
                    {d.assignedVehicleId?.registrationNumber || 'None'}
                  </span>
                </div>
                <div className={styles.mobileStatItem}>
                  <span className={styles.mobileStatLabel}>Present Days</span>
                  <span className={styles.mobileStatVal} style={{ color: '#34d399' }}>
                    {d.stats?.presentDays || 0}
                  </span>
                </div>
                <div className={styles.mobileStatItem}>
                  <span className={styles.mobileStatLabel}>Trips</span>
                  <span className={styles.mobileStatVal}>{d.stats?.totalTrips || 0}</span>
                </div>
                <div className={styles.mobileStatItem}>
                  <span className={styles.mobileStatLabel}>Driver Cash</span>
                  <span className={styles.mobileStatVal} style={{ color: '#fbbf24' }}>
                    ₹{(d.stats?.driverCollected || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }}>
                <button onClick={() => openEditModal(d)} className={styles.secondaryActionBtn} style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>
                  <Edit2 size={13} /> Edit
                </button>
                <button onClick={() => handleDelete(d._id, d.fullName)} className={styles.secondaryActionBtn} style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', color: '#ef4444' }}>
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Driver Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {editingDriver ? 'Edit Driver Profile' : 'Add New Driver'}
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
                    <label className={styles.formLabel}>Full Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Rameshwar Mahato"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      required
                      className={styles.formInput}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Phone Number *</label>
                    <input
                      type="tel"
                      placeholder="e.g. 7654722708"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      required
                      className={styles.formInput}
                    />
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Driving License Number *</label>
                    <input
                      type="text"
                      placeholder="e.g. JH0120190038411"
                      value={form.licenseNumber}
                      onChange={(e) => setForm({ ...form, licenseNumber: e.target.value.toUpperCase() })}
                      required
                      className={styles.formInput}
                      style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>License Expiry Date</label>
                    <input
                      type="date"
                      value={form.licenseExpiryDate}
                      onChange={(e) => setForm({ ...form, licenseExpiryDate: e.target.value })}
                      className={styles.formInput}
                    />
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Assign Primary Vehicle</label>
                    <select
                      value={form.assignedVehicleId}
                      onChange={(e) => setForm({ ...form, assignedVehicleId: e.target.value })}
                      className={styles.formInput}
                    >
                      <option value="">-- None (Unassigned) --</option>
                      {vehicles.map((v) => (
                        <option key={v._id} value={v._id}>
                          {v.registrationNumber} ({v.model})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Driver Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className={styles.formInput}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Remarks / Experience Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Route expertise, background check status..."
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
                  {saving ? 'Saving...' : editingDriver ? 'Update Driver' : 'Add Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
