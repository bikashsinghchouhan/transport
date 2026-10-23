'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Layers,
  MapPin,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import styles from './fleet.module.css';
import FleetMobileFilterPill from './FleetMobileFilterPill';
import FleetMobileFilterDrawer from './FleetMobileFilterDrawer';

interface ExpenseProps {
  vehicles: any[];
  drivers: any[];
  onRefreshStats?: () => void;
  action?: string | null;
  onActionChange?: (action: string | null) => void;
}

export default function FleetExpenses({
  vehicles,
  drivers,
  onRefreshStats,
  action,
  onActionChange,
}: ExpenseProps) {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Group by Trip toggle (default: true)
  const [groupByTrip, setGroupByTrip] = useState(true);
  const [expandedTripKeys, setExpandedTripKeys] = useState<Record<string, boolean>>({});

  // Filters
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const activeFiltersCount =
    (vehicleFilter ? 1 : 0) +
    (categoryFilter ? 1 : 0) +
    (startDate || endDate ? 1 : 0);

  const handleResetFilters = () => {
    setVehicleFilter('');
    setCategoryFilter('');
    setStartDate('');
    setEndDate('');
  };

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

  const closeModal = () => {
    setShowModal(false);
    if (onActionChange) onActionChange(null);
  };

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
    if (onActionChange) onActionChange('add');
  };

  useEffect(() => {
    if (action === 'add' && !showModal) {
      openAddModal();
    }
  }, [action]);

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

      closeModal();
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

  const handleDeleteTripExpenses = async (tripId: string, routeName?: string) => {
    if (!confirm(`Are you sure you want to delete all expenses associated with trip "${routeName || ''}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/fleet/expenses?tripId=${tripId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'Failed to delete trip expenses');
        return;
      }
      fetchExpenses();
      if (onRefreshStats) onRefreshStats();
    } catch (err: any) {
      alert(err.message || 'Failed to delete trip expenses');
    }
  };

  const toggleTripExpand = (key: string) => {
    setExpandedTripKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getCategoryChipClass = (cat: string) => {
    switch (cat) {
      case 'Fuel':
        return styles.expenseChipFuel;
      case 'Toll':
        return styles.expenseChipToll;
      case 'Parking':
        return styles.expenseChipParking;
      case 'Loading':
        return styles.expenseChipLoading;
      case 'Repair':
        return styles.expenseChipRepair;
      case 'Maintenance':
        return styles.expenseChipMaintenance;
      default:
        return styles.expenseChipOther;
    }
  };

  // Grouping logic: merge expenses by tripId
  const groupedExpenses = useMemo(() => {
    if (!groupByTrip) {
      return expenses.map((e) => ({
        key: e._id,
        isTrip: !!(e.tripId && (e.tripId._id || e.tripId.tripRoute)),
        tripId: e.tripId?._id || (typeof e.tripId === 'string' ? e.tripId : null),
        tripRoute: e.tripId?.tripRoute || '',
        customerName: e.tripId?.customerName || '',
        date: e.date,
        vehicle: e.vehicleId,
        driver: e.driverId,
        remarks: e.remarks || '',
        totalAmount: e.amount || 0,
        items: [e],
      }));
    }

    const groupsMap: Record<string, any> = {};
    const result: any[] = [];

    expenses.forEach((e) => {
      const tId = e.tripId?._id || (typeof e.tripId === 'string' ? e.tripId : null);
      if (tId) {
        const tripKey = `trip_${tId}`;
        if (!groupsMap[tripKey]) {
          groupsMap[tripKey] = {
            key: tripKey,
            isTrip: true,
            tripId: tId,
            tripRoute: e.tripId?.tripRoute || '',
            customerName: e.tripId?.customerName || '',
            date: e.date,
            vehicle: e.vehicleId,
            driver: e.driverId,
            remarks: e.remarks || '',
            totalAmount: 0,
            items: [],
          };
          result.push(groupsMap[tripKey]);
        }
        groupsMap[tripKey].totalAmount += e.amount || 0;
        groupsMap[tripKey].items.push(e);
        if (!groupsMap[tripKey].driver && e.driverId) groupsMap[tripKey].driver = e.driverId;
        if (!groupsMap[tripKey].vehicle && e.vehicleId) groupsMap[tripKey].vehicle = e.vehicleId;
      } else {
        result.push({
          key: `single_${e._id}`,
          isTrip: false,
          tripId: null,
          tripRoute: '',
          customerName: '',
          date: e.date,
          vehicle: e.vehicleId,
          driver: e.driverId,
          remarks: e.remarks || '',
          totalAmount: e.amount || 0,
          items: [e],
        });
      }
    });

    return result;
  }, [expenses, groupByTrip]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
      {/* Desktop Filters Bar (hidden on mobile) */}
      <div className={styles.desktopFilterBar}>
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

          {/* Group by Trip Toggle */}
          <button
            type="button"
            onClick={() => setGroupByTrip(!groupByTrip)}
            className={groupByTrip ? `${styles.toggleViewBtn} ${styles.toggleViewBtnActive}` : `${styles.toggleViewBtn} ${styles.toggleViewBtnInactive}`}
            title="Toggle between grouping expenses by trip or flat individual item rows"
          >
            <Layers size={14} /> {groupByTrip ? 'Grouped by Trip' : 'All Items'}
          </button>
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

      {/* Mobile Filter Bar with Pill & Action Button */}
      <div className={styles.mobileFilterBar}>
        <FleetMobileFilterPill
          onClick={() => setShowMobileFilters(true)}
          activeCount={activeFiltersCount}
          searchQuery={categoryFilter || vehicleFilter ? (categoryFilter || 'Vehicle Filter') : ''}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <button
            type="button"
            onClick={() => setGroupByTrip(!groupByTrip)}
            className={groupByTrip ? `${styles.toggleViewBtn} ${styles.toggleViewBtnActive}` : `${styles.toggleViewBtn} ${styles.toggleViewBtnInactive}`}
            style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}
          >
            <Layers size={13} /> {groupByTrip ? 'Trip Group' : 'Flat'}
          </button>
          <button onClick={openAddModal} className={styles.primaryActionBtn} style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>
            <Plus size={15} /> Record
          </button>
        </div>
      </div>

      {/* Mobile Filter Bottom-Sheet Drawer */}
      <FleetMobileFilterDrawer
        isOpen={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
        title="Filter Expenses"
        activeCount={activeFiltersCount}
        onReset={handleResetFilters}
      >
        <div className={styles.drawerFieldGroup}>
          <label className={styles.drawerLabel}>Vehicle</label>
          <select
            value={vehicleFilter}
            onChange={(e) => setVehicleFilter(e.target.value)}
            className={styles.drawerSelect}
          >
            <option value="">All Vehicles</option>
            {vehicles.map((v) => (
              <option key={v._id} value={v._id}>
                {v.registrationNumber} {v.model ? `(${v.model})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.drawerFieldGroup}>
          <label className={styles.drawerLabel}>Expense Category</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={styles.drawerSelect}
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
        </div>

        <div className={styles.drawerFieldGroup}>
          <label className={styles.drawerLabel}>Date Range</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>From</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={styles.drawerSelect}
              />
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>To</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={styles.drawerSelect}
              />
            </div>
          </div>
        </div>

        <div className={styles.drawerFieldGroup}>
          <label className={styles.drawerLabel}>Display Mode</label>
          <button
            type="button"
            onClick={() => setGroupByTrip(!groupByTrip)}
            className={groupByTrip ? `${styles.toggleViewBtn} ${styles.toggleViewBtnActive}` : `${styles.toggleViewBtn} ${styles.toggleViewBtnInactive}`}
            style={{ width: '100%', justifyContent: 'center', padding: '0.6rem' }}
          >
            <Layers size={14} /> {groupByTrip ? 'Mode: Grouped by Trip (Active)' : 'Mode: Show All Raw Rows'}
          </button>
        </div>
      </FleetMobileFilterDrawer>

      {/* Desktop Expenses Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th style={{ minWidth: '240px' }}>Associated Trip & Details</th>
              <th style={{ minWidth: '150px' }}>Vehicle</th>
              <th style={{ minWidth: '280px' }}>Expense Breakdown</th>
              <th style={{ minWidth: '130px' }}>Total Amount</th>
              <th style={{ minWidth: '90px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {groupedExpenses.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                  {loading ? 'Loading expenses...' : 'No expenses found matching criteria.'}
                </td>
              </tr>
            ) : (
              groupedExpenses.map((group) => {
                const isExpanded = !!expandedTripKeys[group.key];
                return (
                  <React.Fragment key={group.key}>
                    <tr>
                      {/* Merged Column: Associated Trip, Date, Driver, Remarks */}
                      <td>
                        <div className={styles.tripMergedInfoCell}>
                          {group.isTrip ? (
                            <div className={styles.tripMergedRoute}>
                              <span className={styles.tripRouteBadge}>
                                <MapPin size={12} /> Trip: {group.tripRoute || 'Route'}
                              </span>
                            </div>
                          ) : (
                            <div>
                              <span className={styles.standaloneBadge}>
                                Standalone Expense
                              </span>
                            </div>
                          )}

                          <div className={styles.tripMergedMeta}>
                            <span>📅 {new Date(group.date).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>👤 {group.driver?.fullName || 'Unassigned'}</span>
                          </div>

                          {group.remarks && (
                            <div className={styles.tripMergedRemarks} title={group.remarks}>
                              💬 {group.remarks}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Vehicle */}
                      <td>
                        <div className={styles.vehiclePlate} style={{ padding: '0.15rem 0.45rem', fontSize: '0.78rem' }}>
                          <span className={styles.plateIndBadge}>IND</span>
                          {group.vehicle?.registrationNumber || 'Vehicle'}
                        </div>
                      </td>

                      {/* Expense Breakdown */}
                      <td>
                        <div className={styles.expenseChipsWrapper}>
                          {group.items.map((item: any) => (
                            <span
                              key={item._id}
                              className={`${styles.expenseChip} ${getCategoryChipClass(item.category)}`}
                              title={`${item.category}: ₹${item.amount.toLocaleString()}${item.remarks ? ` - ${item.remarks}` : ''}`}
                            >
                              {item.category}: ₹{item.amount.toLocaleString()}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                          <span style={{ fontWeight: 700, color: '#f87171', fontSize: '1rem' }}>
                            ₹{group.totalAmount.toLocaleString()}
                          </span>
                          {group.items.length > 1 && (
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                              {group.items.length} items combined
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          {group.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => toggleTripExpand(group.key)}
                              className={styles.tripExpandBtn}
                              title={isExpanded ? 'Hide breakdown items' : 'View breakdown items'}
                            >
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              if (group.isTrip && group.tripId && group.items.length > 1) {
                                handleDeleteTripExpenses(group.tripId, group.tripRoute);
                              } else {
                                handleDelete(group.items[0]._id);
                              }
                            }}
                            className={styles.actionIconBtn}
                            style={{ color: '#ef4444' }}
                            title={group.items.length > 1 ? 'Delete all expenses for this trip' : 'Delete Expense'}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded breakdown row */}
                    {isExpanded && group.items.length > 1 && (
                      <tr>
                        <td colSpan={5} style={{ background: 'rgba(15, 23, 42, 0.45)', padding: '0.5rem 1rem' }}>
                          <div className={styles.tripExpandedSubTable}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.2rem' }}>
                              Itemized Breakdown for Trip: {group.tripRoute}
                            </div>
                            {group.items.map((subItem: any) => (
                              <div key={subItem._id} className={styles.tripSubItemRow}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <span className={`${styles.expenseChip} ${getCategoryChipClass(subItem.category)}`} style={{ fontSize: '0.72rem', padding: '0.15rem 0.45rem' }}>
                                    {subItem.category}
                                  </span>
                                  <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                                    {subItem.remarks || 'No remarks'}
                                  </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                  <span style={{ fontWeight: 600, color: '#f87171' }}>
                                    ₹{subItem.amount.toLocaleString()}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(subItem._id)}
                                    className={styles.actionIconBtn}
                                    style={{ color: '#ef4444' }}
                                    title="Delete this specific item"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Responsive Cards */}
      <div className={styles.mobileCardsGrid}>
        {groupedExpenses.map((group) => {
          const isExpanded = !!expandedTripKeys[group.key];
          return (
            <div key={group.key} className={styles.mobileCard}>
              <div className={styles.mobileCardHeader}>
                <div className={styles.vehiclePlate} style={{ padding: '0.15rem 0.45rem', fontSize: '0.78rem' }}>
                  <span className={styles.plateIndBadge}>IND</span>
                  {group.vehicle?.registrationNumber || 'Vehicle'}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: '#f87171', fontSize: '1.05rem' }}>
                    ₹{group.totalAmount.toLocaleString()}
                  </div>
                  {group.items.length > 1 && (
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                      {group.items.length} items combined
                    </div>
                  )}
                </div>
              </div>

              {group.isTrip ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span className={styles.tripRouteBadge}>
                    <MapPin size={11} /> Trip: {group.tripRoute || 'Route'}
                  </span>
                </div>
              ) : (
                <div>
                  <span className={styles.standaloneBadge}>Standalone Vehicle Expense</span>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94a3b8' }}>
                <span>📅 {new Date(group.date).toLocaleDateString()}</span>
                <span>👤 {group.driver?.fullName || 'Unassigned'}</span>
              </div>

              {group.remarks && (
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1', fontStyle: 'italic' }}>
                  💬 {group.remarks}
                </div>
              )}

              {/* Expense Category Chips */}
              <div className={styles.expenseChipsWrapper} style={{ marginTop: '0.2rem' }}>
                {group.items.map((item: any) => (
                  <span
                    key={item._id}
                    className={`${styles.expenseChip} ${getCategoryChipClass(item.category)}`}
                    style={{ fontSize: '0.72rem', padding: '0.15rem 0.45rem' }}
                  >
                    {item.category}: ₹{item.amount.toLocaleString()}
                  </span>
                ))}
              </div>

              {/* Mobile Card Footer */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.35rem', paddingTop: '0.35rem', borderTop: '1px solid rgba(51, 65, 85, 0.4)' }}>
                {group.items.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => toggleTripExpand(group.key)}
                    style={{ background: 'transparent', border: 'none', color: '#38bdf8', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem', cursor: 'pointer' }}
                  >
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    {isExpanded ? 'Hide items' : `View ${group.items.length} items`}
                  </button>
                ) : <span />}

                <button
                  type="button"
                  onClick={() => {
                    if (group.isTrip && group.tripId && group.items.length > 1) {
                      handleDeleteTripExpenses(group.tripId, group.tripRoute);
                    } else {
                      handleDelete(group.items[0]._id);
                    }
                  }}
                  className={styles.secondaryActionBtn}
                  style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem', color: '#ef4444' }}
                >
                  <Trash2 size={12} /> {group.items.length > 1 ? 'Delete Trip Expenses' : 'Delete'}
                </button>
              </div>

              {/* Expanded items inside mobile card */}
              {isExpanded && group.items.length > 1 && (
                <div className={styles.tripExpandedSubTable} style={{ marginTop: '0.4rem', padding: '0.5rem' }}>
                  {group.items.map((subItem: any) => (
                    <div key={subItem._id} className={styles.tripSubItemRow} style={{ padding: '0.3rem 0' }}>
                      <span className={`${styles.expenseChip} ${getCategoryChipClass(subItem.category)}`} style={{ fontSize: '0.68rem', padding: '0.1rem 0.35rem' }}>
                        {subItem.category}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 600, color: '#f87171', fontSize: '0.78rem' }}>
                          ₹{subItem.amount.toLocaleString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDelete(subItem._id)}
                          className={styles.actionIconBtn}
                          style={{ color: '#ef4444', padding: '0.2rem' }}
                          title="Delete item"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Standalone Expense Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Record Fleet Expense</h3>
              <button onClick={closeModal} className={styles.modalCloseBtn}>
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
                  onClick={closeModal}
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
