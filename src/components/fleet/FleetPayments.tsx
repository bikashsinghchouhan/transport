'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Phone,
  MessageCircle,
  IndianRupee,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  History,
  Truck,
  User,
} from 'lucide-react';
import styles from './fleet.module.css';

interface PaymentsProps {
  onRefreshStats?: () => void;
  targetTripId?: string | null;
  onClearTargetTrip?: () => void;
}

export default function FleetPayments({
  onRefreshStats,
  targetTripId,
  onClearTargetTrip,
}: PaymentsProps) {
  const [pendingData, setPendingData] = useState<any>({
    pendingTrips: [],
    totalPendingAmount: 0,
    totalPendingTrips: 0,
    uniqueCustomers: 0,
  });
  const [loading, setLoading] = useState(false);

  // Record Payment Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<any | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMode: 'UPI',
    collectedBy: 'MANAGER',
    date: new Date().toISOString().split('T')[0],
    remarks: '',
  });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchPendingPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/fleet/payments');
      const data = await res.json();
      if (data.success) {
        setPendingData(data);
      }
    } catch (err) {
      console.error('Fetch pending payments error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  // If a target trip is passed from parent (e.g. from Dashboard or Trips table)
  useEffect(() => {
    if (targetTripId && pendingData.pendingTrips.length > 0) {
      const found = pendingData.pendingTrips.find((t: any) => t._id === targetTripId);
      if (found) {
        openPaymentModal(found);
      }
    }
  }, [targetTripId, pendingData.pendingTrips]);

  const openPaymentModal = async (trip: any) => {
    setSelectedTrip(trip);
    setPaymentForm({
      amount: trip.pendingAmount.toString(),
      paymentMode: 'UPI',
      collectedBy: 'MANAGER',
      date: new Date().toISOString().split('T')[0],
      remarks: '',
    });
    setErrorMsg('');
    setShowModal(true);

    // Fetch payment transaction history for this trip
    try {
      const res = await fetch(`/api/admin/fleet/payments?tripId=${trip._id}`);
      const data = await res.json();
      if (data.success) {
        setPaymentHistory(data.payments || []);
      }
    } catch {
      setPaymentHistory([]);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTrip(null);
    if (onClearTargetTrip) onClearTargetTrip();
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrip) return;

    setSaving(true);
    setErrorMsg('');

    try {
      const payload = {
        tripId: selectedTrip._id,
        amount: parseFloat(paymentForm.amount) || 0,
        paymentMode: paymentForm.paymentMode,
        collectedBy: paymentForm.collectedBy,
        date: paymentForm.date,
        remarks: paymentForm.remarks,
      };

      const res = await fetch('/api/admin/fleet/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to record payment');
      }

      handleCloseModal();
      fetchPendingPayments();
      if (onRefreshStats) onRefreshStats();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error recording payment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* Pending Summary KPI Cards */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard} style={{ borderColor: 'rgba(245, 158, 11, 0.4)' }}>
          <div className={styles.kpiCardHeader}>
            <span className={styles.kpiTitle}>Total Pending Receivables</span>
            <div className={styles.kpiIconWrapper} style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <IndianRupee size={20} />
            </div>
          </div>
          <div className={styles.kpiValue} style={{ color: '#fbbf24' }}>
            ₹{(pendingData.totalPendingAmount || 0).toLocaleString()}
          </div>
          <div className={styles.kpiSubtitle}>Awaiting customer collection</div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiCardHeader}>
            <span className={styles.kpiTitle}>Unpaid Invoices</span>
            <div className={styles.kpiIconWrapper} style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <Clock size={20} />
            </div>
          </div>
          <div className={styles.kpiValue}>{pendingData.totalPendingTrips || 0}</div>
          <div className={styles.kpiSubtitle}>Across completed trips</div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiCardHeader}>
            <span className={styles.kpiTitle}>Customers with Balance</span>
            <div className={styles.kpiIconWrapper} style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
              <User size={20} />
            </div>
          </div>
          <div className={styles.kpiValue}>{pendingData.uniqueCustomers || 0}</div>
          <div className={styles.kpiSubtitle}>Direct customer accounts</div>
        </div>
      </div>

      {/* Desktop Pending List Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Contact & Reminder</th>
              <th>Vehicle</th>
              <th>Trip Date</th>
              <th>Route</th>
              <th>Invoice Amount</th>
              <th>Received</th>
              <th>Pending Balance</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingData.pendingTrips.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  <CheckCircle2 size={32} color="#34d399" style={{ margin: '0 auto 0.5rem auto' }} />
                  <div>All receivables are clear! No pending customer payments.</div>
                </td>
              </tr>
            ) : (
              pendingData.pendingTrips.map((t: any) => {
                const totalCollected = (t.driverReceived || 0) + (t.managerReceived || 0);
                const cleanPhone = (t.customerMobile || '').replace(/\D/g, '');

                return (
                  <tr key={t._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#ffffff' }}>{t.customerName}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{t.customerMobile}</span>
                        {t.customerMobile && (
                          <>
                            <a
                              href={`tel:${t.customerMobile}`}
                              className={`${styles.actionIconBtn} ${styles.actionIconCall}`}
                              title={`Call ${t.customerName}`}
                            >
                              <Phone size={13} />
                            </a>
                            <a
                              href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
                                `Hello ${t.customerName}, gentle reminder regarding pending balance of ₹${t.pendingAmount} for trip ${t.tripRoute}. Kindly process payment.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`${styles.actionIconBtn} ${styles.actionIconWhatsapp}`}
                              title="WhatsApp Reminder"
                            >
                              <MessageCircle size={13} />
                            </a>
                          </>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className={styles.vehiclePlate} style={{ padding: '0.15rem 0.45rem', fontSize: '0.78rem' }}>
                        <span className={styles.plateIndBadge}>IND</span>
                        {t.vehicleId?.registrationNumber || 'Vehicle'}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                        {new Date(t.date).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.82rem', color: '#e2e8f0' }}>{t.tripRoute}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#38bdf8' }}>₹{t.tripAmount.toLocaleString()}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#34d399' }}>₹{totalCollected.toLocaleString()}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#fbbf24', fontSize: '1rem' }}>
                        ₹{t.pendingAmount.toLocaleString()}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => openPaymentModal(t)}
                        className={styles.primaryActionBtn}
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                      >
                        <CreditCard size={13} /> Record Payment
                      </button>
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
        {pendingData.pendingTrips.map((t: any) => {
          const totalCollected = (t.driverReceived || 0) + (t.managerReceived || 0);
          const cleanPhone = (t.customerMobile || '').replace(/\D/g, '');

          return (
            <div key={t._id} className={styles.mobileCard}>
              <div className={styles.mobileCardHeader}>
                <div>
                  <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '1rem' }}>{t.customerName}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {t.tripRoute} • {new Date(t.date).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Pending</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fbbf24' }}>
                    ₹{t.pendingAmount.toLocaleString()}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{t.customerMobile}</span>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {t.customerMobile && (
                    <>
                      <a href={`tel:${t.customerMobile}`} className={`${styles.actionIconBtn} ${styles.actionIconCall}`}>
                        <Phone size={14} />
                      </a>
                      <a
                        href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
                          `Hello ${t.customerName}, gentle reminder regarding pending balance of ₹${t.pendingAmount} for trip ${t.tripRoute}. Kindly process payment.`
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
              </div>

              <div className={styles.mobileStatRow}>
                <div className={styles.mobileStatItem}>
                  <span className={styles.mobileStatLabel}>Invoice</span>
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
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.2rem' }}>
                <button
                  onClick={() => openPaymentModal(t)}
                  className={styles.primaryActionBtn}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <CreditCard size={14} /> Record Payment Collection
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Record Payment Collection Modal */}
      {showModal && selectedTrip && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>Record Payment Collection</h3>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  Customer: <strong>{selectedTrip.customerName}</strong> ({selectedTrip.tripRoute})
                </span>
              </div>
              <button onClick={handleCloseModal} className={styles.modalCloseBtn}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitPayment}>
              <div className={styles.modalBody}>
                {errorMsg && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <AlertCircle size={16} /> {errorMsg}
                  </div>
                )}

                {/* Trip Financial Snapshot */}
                <div
                  style={{
                    background: 'rgba(30, 41, 59, 0.6)',
                    border: '1px solid rgba(51, 65, 85, 0.8)',
                    borderRadius: '12px',
                    padding: '0.85rem 1rem',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '0.5rem',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Invoice</span>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#38bdf8' }}>
                      ₹{selectedTrip.tripAmount.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Previously Received</span>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#34d399' }}>
                      ₹{((selectedTrip.driverReceived || 0) + (selectedTrip.managerReceived || 0)).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Current Pending</span>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fbbf24' }}>
                      ₹{selectedTrip.pendingAmount.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Payment Amount Collected (₹) *</label>
                    <div className={styles.formInputWrapper}>
                      <span className={styles.formInputPrefix}>₹</span>
                      <input
                        type="number"
                        min="1"
                        max={selectedTrip.pendingAmount}
                        placeholder="0"
                        value={paymentForm.amount ?? ''}
                        onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                        required
                        className={`${styles.formInput} ${styles.formInputWithPrefix}`}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Collection Date *</label>
                    <input
                      type="date"
                      value={paymentForm.date}
                      onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                      required
                      className={styles.formInput}
                    />
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Payment Mode *</label>
                    <select
                      value={paymentForm.paymentMode}
                      onChange={(e) => setPaymentForm({ ...paymentForm, paymentMode: e.target.value })}
                      className={styles.formInput}
                    >
                      <option value="UPI">UPI (Google Pay, PhonePe, Paytm)</option>
                      <option value="CASH">Cash</option>
                      <option value="BANK_TRANSFER">Direct Bank Transfer (NEFT/IMPS)</option>
                      <option value="CHEQUE">Cheque</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Collected By *</label>
                    <select
                      value={paymentForm.collectedBy}
                      onChange={(e) => setPaymentForm({ ...paymentForm, collectedBy: e.target.value })}
                      className={styles.formInput}
                    >
                      <option value="MANAGER">Manager / Office directly</option>
                      <option value="DRIVER">Driver on field</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Transaction Reference / Remarks</label>
                  <input
                    type="text"
                    placeholder="e.g. UPI Ref #40291928, cash handed at office..."
                    value={paymentForm.remarks}
                    onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
                    className={styles.formInput}
                  />
                </div>

                {/* Historical Payment Logs for this Trip */}
                {paymentHistory.length > 0 && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#38bdf8', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <History size={14} /> Collection Transaction History
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '120px', overflowY: 'auto' }}>
                      {paymentHistory.map((p: any) => (
                        <div
                          key={p._id}
                          style={{
                            background: 'rgba(15, 23, 42, 0.7)',
                            padding: '0.4rem 0.65rem',
                            borderRadius: '6px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '0.78rem',
                          }}
                        >
                          <span style={{ color: '#cbd5e1' }}>
                            {new Date(p.date).toLocaleDateString()} via {p.paymentMode} ({p.collectedBy})
                          </span>
                          <span style={{ color: '#34d399', fontWeight: 600 }}>+₹{p.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className={styles.secondaryActionBtn}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.primaryActionBtn} disabled={saving}>
                  {saving ? 'Processing...' : 'Save Payment Collection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
