'use client';

import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Trash2,
  Calendar,
  AlertCircle,
  X,
  IndianRupee,
} from 'lucide-react';
import styles from './fleet.module.css';

interface ExpenseProps {
  vehicles: any[];
  drivers: any[];
  onRefreshStats?: () => void;
}

export default function FleetExpenses({
  vehicles,
  drivers,
  onRefreshStats,
}: ExpenseProps) {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Filters
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    vehicleId: '',
    driverId: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Fuel',
    amount: '',
    remarks: '',
  });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (vehicleFilter) params.append('vehicleId', vehicleFilter);
      if (categoryFilter) params.append('category', categoryFilter);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await fetch(`/api/admin/fleet/expenses?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setExpenses(data.expenses || []);
        setTotalAmount(data.totalAmount || 0);
      }
    } catch (err) {
      console.error('Fetch expenses error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [vehicleFilter, categoryFilter, startDate, endDate]);

  const openAddModal = () => {
    setForm({
      vehicleId: vehicles[0]?._id || '',
      driverId: '',
      date: new Date().toISOString().split('T')[0],
      category: 'Fuel',
      amount: '',
      remarks: '',
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/fleet/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save expense');
      }

      setShowModal(false);
      fetchExpenses();
      if (onRefreshStats) onRefreshStats();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving expense');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense record?')) return;

    try {
      const res = await fetch(`/api/admin/fleet/expenses?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'Failed to delete');
        return;
      }
      fetchExpenses();
      if (onRefreshStats) onRefreshStats();
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* Filters & Action Bar */}
      <div className={styles.filterBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, flexWrap: 'wrap' }}>
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
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Categories</option>
            <option value="Fuel">Fuel</option>
            <option value="Toll">Toll</option>
            <option value="Parking">Parking</option>
            <option value="Loading">Loading</option>
            <option value="Repair">Repair</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Other">Other</option>
          </select>

          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={styles.filterSelect}
              placeholder="Start date"
            />
            <span style={{ color: '#64748b' }}>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={styles.filterSelect}
              placeholder="End date"
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.9rem', color: '#f87171', fontWeight: 700 }}>
            Total: ₹{totalAmount.toLocaleString()}
          </span>
          <button onClick={openAddModal} className={styles.primaryActionBtn}>
            <Plus size={16} /> Record Expense
          </button>
        </div>
      </div>

      {/* Desktop Expenses Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Vehicle</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Associated Trip</th>
              <th>Driver</th>
              <th>Remarks</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                  {loading ? 'Loading expenses...' : 'No expenses found matching criteria.'}
                </td>
              </tr>
            ) : (
              expenses.map((e) => (
                <tr key={e._id}>
                  <td>
                    <span style={{ fontWeight: 500, color: '#f8fafc' }}>
                      {new Date(e.date).toLocaleDateString()}
                    </span>
                  </td>
                  <td>
                    <div className={styles.vehiclePlate} style={{ padding: '0.15rem 0.45rem', fontSize: '0.78rem' }}>
                      <span className={styles.plateIndBadge}>IND</span>
                      {e.vehicleId?.registrationNumber || 'Vehicle'}
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background:
                          e.category === 'Fuel'
                            ? 'rgba(245, 158, 11, 0.15)'
                            : e.category === 'Repair' || e.category === 'Maintenance'
                            ? 'rgba(239, 68, 68, 0.15)'
                            : 'rgba(56, 189, 248, 0.15)',
                        color:
                          e.category === 'Fuel'
                            ? '#fbbf24'
                            : e.category === 'Repair' || e.category === 'Maintenance'
                            ? '#f87171'
                            : '#38bdf8',
                      }}
                    >
                      {e.category}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#f87171', fontSize: '0.95rem' }}>
                      ₹{e.amount.toLocaleString()}
                    </span>
                  </td>
                  <td>
                    {e.tripId ? (
                      <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                        {e.tripId.tripRoute}
                      </span>
                    ) : (
                      <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Standalone Vehicle Expense</span>
                    )}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                      {e.driverId?.fullName || '-'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{e.remarks || '-'}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => handleDelete(e._id)}
                      className={styles.actionIconBtn}
                      style={{ color: '#ef4444' }}
                      title="Delete Expense"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Responsive Cards */}
      <div className={styles.mobileCardsGrid}>
        {expenses.map((e) => (
          <div key={e._id} className={styles.mobileCard}>
            <div className={styles.mobileCardHeader}>
              <div className={styles.vehiclePlate} style={{ padding: '0.15rem 0.45rem', fontSize: '0.78rem' }}>
                <span className={styles.plateIndBadge}>IND</span>
                {e.vehicleId?.registrationNumber || 'Vehicle'}
              </div>
              <span style={{ fontWeight: 700, color: '#f87171', fontSize: '1.05rem' }}>
                ₹{e.amount.toLocaleString()}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff' }}>{e.category}</span>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                {new Date(e.date).toLocaleDateString()}
              </span>
            </div>

            {e.remarks && <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>{e.remarks}</div>}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.2rem' }}>
              <button
                onClick={() => handleDelete(e._id)}
                className={styles.secondaryActionBtn}
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', color: '#ef4444' }}
              >
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Standalone Expense Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Record Fleet Expense</h3>
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
                    <label className={styles.formLabel}>Vehicle *</label>
                    <select
                      value={form.vehicleId}
                      onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
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
                    <label className={styles.formLabel}>Expense Date *</label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      required
                      className={styles.formInput}
                    />
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Expense Category *</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className={styles.formInput}
                    >
                      <option value="Fuel">Fuel (Diesel/Petrol/CNG)</option>
                      <option value="Toll">Toll Fastag</option>
                      <option value="Repair">Vehicle Repair / Breakdown</option>
                      <option value="Maintenance">Regular Servicing / Oil Change</option>
                      <option value="Parking">Parking Fee</option>
                      <option value="Loading">Labor / Loading Charge</option>
                      <option value="Other">Other Expenses</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Amount (₹) *</label>
                    <div className={styles.formInputWrapper}>
                      <span className={styles.formInputPrefix}>₹</span>
                      <input
                        type="number"
                        min="1"
                        step="any"
                        placeholder="0"
                        value={form.amount ?? ''}
                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                        required
                        className={`${styles.formInput} ${styles.formInputWithPrefix}`}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Driver (Optional)</label>
                  <select
                    value={form.driverId}
                    onChange={(e) => setForm({ ...form, driverId: e.target.value })}
                    className={styles.formInput}
                  >
                    <option value="">-- None / Admin direct expense --</option>
                    {drivers.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Remarks / Bill Number</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Petrol pump receipt #891, battery replacement..."
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
                  {saving ? 'Saving...' : 'Record Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
