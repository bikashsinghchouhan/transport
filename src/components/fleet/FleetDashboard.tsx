'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  MapPin,
  IndianRupee,
  Receipt,
  Wallet,
  Clock,
  Fuel,
  Percent,
  Calculator,
  Phone,
  MessageCircle,
  Truck,
  ArrowUpRight,
  AlertTriangle,
  Plus,
  Users,
  Navigation,
  CalendarCheck,
  CreditCard,
  FileSpreadsheet,
  Zap,
  Calendar,
  Filter,
  RotateCcw,
  Check,
  Info,
  X,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import styles from './fleet.module.css';
import {
  RevenueExpenseTrendChart,
  ExpenseDonutChart,
  VehiclePerformanceChart,
} from './FleetCharts';
import FleetMobileFilterDrawer from './FleetMobileFilterDrawer';
import FleetMobileFilterPill from './FleetMobileFilterPill';

interface DashboardProps {
  stats: any;
  loading: boolean;
  onNavigateTab: (tab: string) => void;
  onOpenRecordTrip: () => void;
  onOpenRecordPayment: (tripId: string) => void;
  onRefresh?: () => void;
}

const toYMD = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const formatDateLabel = (dateStr: string) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return dateStr;
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function FleetDashboard({
  stats: initialStats,
  loading: initialLoading,
  onNavigateTab,
  onOpenRecordTrip,
  onOpenRecordPayment,
  onRefresh,
}: DashboardProps) {
  const [currentStats, setCurrentStats] = useState<any>(initialStats);
  const [loading, setLoading] = useState<boolean>(initialLoading);

  // Date Filter State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [datePreset, setDatePreset] = useState<'all' | 'today' | 'yesterday' | 'thisWeek' | 'thisMonth' | 'lastMonth' | 'custom'>('all');

  // Mobile Drawer State
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [drawerStart, setDrawerStart] = useState('');
  const [drawerEnd, setDrawerEnd] = useState('');
  const [drawerPreset, setDrawerPreset] = useState<'all' | 'today' | 'yesterday' | 'thisWeek' | 'thisMonth' | 'lastMonth' | 'custom'>('all');

  // Synchronize when initialStats prop updates
  useEffect(() => {
    if (initialStats && datePreset === 'all' && !startDate && !endDate) {
      setCurrentStats(initialStats);
    }
  }, [initialStats, datePreset, startDate, endDate]);

  const fetchFilteredStats = useCallback(async (s: string, e: string, preset: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (s) params.set('startDate', s);
      if (e) params.set('endDate', e);
      if (preset && preset !== 'all' && preset !== 'custom') {
        params.set('dateRange', preset);
      }

      const res = await fetch(`/api/admin/fleet/stats?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setCurrentStats(data);
      }
    } catch (err) {
      console.error('Failed to load filtered dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const calculatePresetDates = (preset: string) => {
    const now = new Date();
    let s = '';
    let e = '';

    if (preset === 'today') {
      s = toYMD(now);
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      e = toYMD(tomorrow);
    } else if (preset === 'yesterday') {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      s = toYMD(y);
      e = toYMD(now);
    } else if (preset === 'thisWeek') {
      const day = now.getDay() || 7; // Monday = 1
      const mon = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1);
      const nextMon = new Date(mon);
      nextMon.setDate(nextMon.getDate() + 7);
      s = toYMD(mon);
      e = toYMD(nextMon);
    } else if (preset === 'thisMonth') {
      const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      s = toYMD(startMonth);
      e = toYMD(nextMonth);
    } else if (preset === 'lastMonth') {
      const startLast = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const startThis = new Date(now.getFullYear(), now.getMonth(), 1);
      s = toYMD(startLast);
      e = toYMD(startThis);
    }

    return { s, e };
  };

  const handleSelectPreset = (preset: any) => {
    setDatePreset(preset);
    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
      fetchFilteredStats('', '', 'all');
      return;
    }

    if (preset === 'custom') {
      // Keep existing custom dates, do not fetch immediately
      return;
    }

    const { s, e } = calculatePresetDates(preset);
    setStartDate(s);
    setEndDate(e);
    fetchFilteredStats(s, e, preset);
  };

  const handleApplyCustomFilter = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setDatePreset('custom');
    fetchFilteredStats(startDate, endDate, 'custom');
  };

  const handleResetFilter = () => {
    setDatePreset('all');
    setStartDate('');
    setEndDate('');
    setDrawerStart('');
    setDrawerEnd('');
    setDrawerPreset('all');
    setMobileDrawerOpen(false);
    fetchFilteredStats('', '', 'all');
  };

  // Open mobile drawer
  const handleOpenMobileDrawer = () => {
    setDrawerStart(startDate);
    setDrawerEnd(endDate);
    setDrawerPreset(datePreset);
    setMobileDrawerOpen(true);
  };

  // Apply in mobile drawer
  const handleApplyMobileDrawer = () => {
    setStartDate(drawerStart);
    setEndDate(drawerEnd);
    setDatePreset(drawerPreset);
    setMobileDrawerOpen(false);
    fetchFilteredStats(drawerStart, drawerEnd, drawerPreset);
  };

  const isFilterActive = datePreset !== 'all' || Boolean(startDate || endDate);

  const kpis = currentStats?.kpis || {
    totalTrips: 0,
    totalKm: 0,
    grossRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    pendingReceivables: 0,
    totalVehicles: 0,
    totalDrivers: 0,
  };

  const perf = currentStats?.performance || {
    fuelCostPerKm: 0,
    collectionEfficiency: 0,
    avgRevenuePerTrip: 0,
    avgProfitPerTrip: 0,
  };

  const charts = currentStats?.charts || {
    trend14Days: [],
    expenseBreakdown: [],
    vehiclePerformance: [],
  };

  const pendingSummary = currentStats?.pendingReceivablesSummary || {
    totalAmount: 0,
    pendingCount: 0,
    recentPending: [],
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', position: 'relative' }}>
      {/* 1. Dashboard Date Filter Bar */}
      <div className={styles.dashboardFilterContainer}>
        <div className={styles.dashboardFilterHeader}>
          <div className={styles.dashboardFilterTitle}>
            <Calendar size={18} color="#38bdf8" />
            <span>Dashboard Date Filter</span>
            {loading && <Loader2 size={16} className={styles.spinner} style={{ color: '#38bdf8' }} />}
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                className={styles.dashboardResetBtn}
                style={{ padding: '0.2rem 0.55rem', fontSize: '0.75rem', marginLeft: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                title="Refresh fleet & dashboard data"
              >
                <RefreshCw size={12} className={(loading || initialLoading) ? styles.spinner : ''} /> Refresh
              </button>
            )}
          </div>

          {/* Quick Presets */}
          <div className={styles.dashboardFilterPresets}>
            <button
              type="button"
              onClick={() => handleSelectPreset('all')}
              className={`${styles.dashboardPresetBtn} ${datePreset === 'all' ? styles.dashboardPresetBtnActive : ''}`}
            >
              All Time
            </button>
            <button
              type="button"
              onClick={() => handleSelectPreset('today')}
              className={`${styles.dashboardPresetBtn} ${datePreset === 'today' ? styles.dashboardPresetBtnActive : ''}`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => handleSelectPreset('thisWeek')}
              className={`${styles.dashboardPresetBtn} ${datePreset === 'thisWeek' ? styles.dashboardPresetBtnActive : ''}`}
            >
              This Week
            </button>
            <button
              type="button"
              onClick={() => handleSelectPreset('thisMonth')}
              className={`${styles.dashboardPresetBtn} ${datePreset === 'thisMonth' ? styles.dashboardPresetBtnActive : ''}`}
            >
              This Month
            </button>
            <button
              type="button"
              onClick={() => handleSelectPreset('lastMonth')}
              className={`${styles.dashboardPresetBtn} ${datePreset === 'lastMonth' ? styles.dashboardPresetBtnActive : ''}`}
            >
              Last Month
            </button>
          </div>
        </div>

        {/* Date Inputs Row (Start Date inclusive, End Date exclusive) */}
        <form onSubmit={handleApplyCustomFilter} className={styles.dashboardFilterInputsRow}>
          <div className={styles.dashboardDateGroup}>
            <label className={styles.dashboardDateLabel}>
              <span>From Date (Included)</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setDatePreset('custom');
              }}
              className={styles.dashboardDateInput}
            />
          </div>

          <div className={styles.dashboardDateGroup}>
            <label className={styles.dashboardDateLabel}>
              <span>To Date (Excluded)</span>
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setDatePreset('custom');
              }}
              className={styles.dashboardDateInput}
            />
          </div>

          <div className={styles.dashboardFilterActions}>
            <button
              type="submit"
              disabled={loading}
              className={styles.primaryActionBtn}
              style={{ padding: '0.45rem 0.95rem', fontSize: '0.82rem', height: '36px' }}
            >
              <Filter size={14} /> Apply Filter
            </button>
            {isFilterActive && (
              <button
                type="button"
                onClick={handleResetFilter}
                className={styles.dashboardResetBtn}
                title="Clear filter & show all time"
              >
                <RotateCcw size={13} /> Reset
              </button>
            )}
          </div>

          {/* Rule note explaining the interval */}
          <div className={styles.dashboardRuleHint}>
            <Info size={14} color="#38bdf8" style={{ flexShrink: 0 }} />
            <span>
              <strong>Rule:</strong> From date is <strong>included</strong> in data; To date is <strong>excluded</strong> (e.g. 15 Aug to 15 Sep reflects trips from 15 Aug up to 14 Sep midnight).
            </span>
          </div>
        </form>

        {/* Active Filter Summary Banner */}
        {isFilterActive && (
          <div className={styles.dashboardActiveBanner}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 600, color: '#38bdf8' }}>Active Filter Window:</span>
              <span>
                {startDate ? formatDateLabel(startDate) : 'Earliest'} → {endDate ? `${formatDateLabel(endDate)} (Excluded)` : 'Latest'}
              </span>
              <span style={{ color: '#94a3b8' }}>• Reflected in all KPIs & Charts ({kpis.totalTrips} trips found)</span>
            </div>
            <button
              onClick={handleResetFilter}
              style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.75rem', fontWeight: 600 }}
            >
              <X size={14} /> Clear
            </button>
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className={styles.kpiGrid}>
        {/* Total Trips */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiCardHeader}>
            <span className={styles.kpiTitle}>Total Trips</span>
            <div className={styles.kpiIconWrapper} style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <Truck size={20} />
            </div>
          </div>
          <div className={styles.kpiValue}>{kpis.totalTrips.toLocaleString()}</div>
          <div className={styles.kpiSubtitle}>
            {kpis.totalVehicles} active vehicles • {kpis.totalDrivers} drivers
          </div>
        </div>

        {/* Total Distance */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiCardHeader}>
            <span className={styles.kpiTitle}>Total Distance</span>
            <div className={styles.kpiIconWrapper} style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
              <MapPin size={20} />
            </div>
          </div>
          <div className={styles.kpiValue}>{kpis.totalKm.toLocaleString()} KM</div>
          <div className={styles.kpiSubtitle}>Cumulative fleet log</div>
        </div>

        {/* Gross Revenue */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiCardHeader}>
            <span className={styles.kpiTitle}>Gross Revenue</span>
            <div className={styles.kpiIconWrapper} style={{ background: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8' }}>
              <IndianRupee size={20} />
            </div>
          </div>
          <div className={styles.kpiValue} style={{ color: '#38bdf8' }}>
            ₹{kpis.grossRevenue.toLocaleString()}
          </div>
          <div className={styles.kpiSubtitle}>Total invoiced trip value</div>
        </div>

        {/* Total Expenses */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiCardHeader}>
            <span className={styles.kpiTitle}>Total Expenses</span>
            <div className={styles.kpiIconWrapper} style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
              <Receipt size={20} />
            </div>
          </div>
          <div className={styles.kpiValue} style={{ color: '#f87171' }}>
            ₹{kpis.totalExpenses.toLocaleString()}
          </div>
          <div className={styles.kpiSubtitle}>Fuel, tolls, repairs, maintenance</div>
        </div>

        {/* Net Profit */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiCardHeader}>
            <span className={styles.kpiTitle}>Net Profit</span>
            <div className={styles.kpiIconWrapper} style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <Wallet size={20} />
            </div>
          </div>
          <div className={styles.kpiValue} style={{ color: '#34d399' }}>
            ₹{kpis.netProfit.toLocaleString()}
          </div>
          <div className={styles.kpiSubtitle}>Revenue minus vehicle expenses</div>
        </div>

        {/* Pending Receivables */}
        <div className={styles.kpiCard} style={{ borderColor: kpis.pendingReceivables > 0 ? 'rgba(245, 158, 11, 0.4)' : undefined }}>
          <div className={styles.kpiCardHeader}>
            <span className={styles.kpiTitle}>Pending Receivables</span>
            <div className={styles.kpiIconWrapper} style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <Clock size={20} />
            </div>
          </div>
          <div className={styles.kpiValue} style={{ color: '#fbbf24' }}>
            ₹{kpis.pendingReceivables.toLocaleString()}
          </div>
          <div className={styles.kpiSubtitle}>
            {pendingSummary.pendingCount} unpaid trip balances
          </div>
        </div>
      </div>

      {/* Operational Efficiency Meters */}
      <div className={styles.statsCardGrid}>
        <div className={styles.statMetricCard}>
          <div className={styles.statMetricHeader}>
            <span className={styles.statMetricLabel}>Fuel Cost / KM</span>
            <Fuel size={16} color="#f59e0b" />
          </div>
          <div className={styles.statMetricVal}>₹{perf.fuelCostPerKm}</div>
          <div className={styles.statMetricDesc}>Average fleet fuel consumption</div>
        </div>

        <div className={styles.statMetricCard}>
          <div className={styles.statMetricHeader}>
            <span className={styles.statMetricLabel}>Collection Rate</span>
            <Percent size={16} color="#34d399" />
          </div>
          <div className={styles.statMetricVal} style={{ color: perf.collectionEfficiency >= 80 ? '#34d399' : '#f59e0b' }}>
            {perf.collectionEfficiency}%
          </div>
          <div className={styles.statMetricDesc}>Collected vs total billed amount</div>
        </div>

        <div className={styles.statMetricCard}>
          <div className={styles.statMetricHeader}>
            <span className={styles.statMetricLabel}>Avg Revenue / Trip</span>
            <TrendingUp size={16} color="#38bdf8" />
          </div>
          <div className={styles.statMetricVal}>₹{perf.avgRevenuePerTrip.toLocaleString()}</div>
          <div className={styles.statMetricDesc}>Gross earning per dispatch</div>
        </div>

        <div className={styles.statMetricCard}>
          <div className={styles.statMetricHeader}>
            <span className={styles.statMetricLabel}>Avg Profit / Trip</span>
            <Calculator size={16} color="#a855f7" />
          </div>
          <div className={styles.statMetricVal} style={{ color: perf.avgProfitPerTrip >= 0 ? '#34d399' : '#ef4444' }}>
            ₹{perf.avgProfitPerTrip.toLocaleString()}
          </div>
          <div className={styles.statMetricDesc}>Net operational gain per trip</div>
        </div>
      </div>

      {/* Visual Analytics Row: 14-Day Trend + Expense Donut */}
      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div>
              <h4 className={styles.chartTitle}>Revenue vs Expense Trend</h4>
              <p className={styles.chartDesc}>
                {isFilterActive
                  ? `Filtered window: ${startDate ? formatDateLabel(startDate) : 'Start'} to ${endDate ? formatDateLabel(endDate) : 'End'}`
                  : 'Daily timeline performance overview'}
              </p>
            </div>
          </div>
          <RevenueExpenseTrendChart data={charts.trend14Days} />
        </div>

        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div>
              <h4 className={styles.chartTitle}>Expense Breakdown</h4>
              <p className={styles.chartDesc}>Cost distribution by expense category</p>
            </div>
          </div>
          <ExpenseDonutChart data={charts.expenseBreakdown} />
        </div>
      </div>

      {/* Bottom Grid: Vehicle Performance + High Priority Pending Collections */}
      <div className={styles.splitGrid}>
        {/* Vehicle Performance Comparison */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div>
              <h4 className={styles.chartTitle}>Vehicle Leaderboard</h4>
              <p className={styles.chartDesc}>Top performing vehicles by revenue & profit</p>
            </div>
            <button
              onClick={() => onNavigateTab('vehicles')}
              className={styles.secondaryActionBtn}
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
            >
              All Vehicles <ArrowUpRight size={13} />
            </button>
          </div>
          <VehiclePerformanceChart data={charts.vehiclePerformance} />
        </div>

        {/* High-Priority Pending Collections */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div>
              <h4 className={styles.chartTitle}>High-Priority Pending Collections</h4>
              <p className={styles.chartDesc}>Top unpaid balances requiring customer follow-up</p>
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#fbbf24',
                padding: '0.2rem 0.55rem',
                borderRadius: '6px',
                fontWeight: 600,
              }}
            >
              {pendingSummary.pendingCount} Pending
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.5rem' }}>
            {pendingSummary.recentPending.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                🎉 Great job! All customer receivables are cleared.
              </div>
            ) : (
              pendingSummary.recentPending.map((trip: any) => (
                <div key={trip._id} className={styles.tableRow} style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(30, 41, 59, 0.4)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.88rem' }}>
                        {trip.customerName}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        • {trip.vehicleId?.registrationNumber || 'N/A'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                      {trip.tripRoute} • Total: ₹{trip.tripAmount.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fbbf24', marginTop: '0.2rem' }}>
                      Pending: ₹{trip.pendingAmount.toLocaleString()}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {trip.customerMobile && (
                      <>
                        <a
                          href={`tel:${trip.customerMobile}`}
                          className={`${styles.actionIconBtn} ${styles.actionIconCall}`}
                          title={`Call ${trip.customerMobile}`}
                        >
                          <Phone size={14} />
                        </a>
                        <a
                          href={`https://wa.me/91${trip.customerMobile.replace(/\D/g, '')}?text=${encodeURIComponent(
                            `Hello ${trip.customerName}, this is regarding pending payment of ₹${trip.pendingAmount} for transport trip (${trip.tripRoute}). Kindly clear the balance.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${styles.actionIconBtn} ${styles.actionIconWhatsapp}`}
                          title="WhatsApp reminder"
                        >
                          <MessageCircle size={14} />
                        </a>
                      </>
                    )}
                    <button
                      onClick={() => onOpenRecordPayment(trip._id)}
                      className={styles.secondaryActionBtn}
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', color: '#38bdf8' }}
                    >
                      Collect
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => onNavigateTab('payments')}
            className={styles.secondaryActionBtn}
            style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}
          >
            View All Pending Invoices →
          </button>
        </div>
      </div>

      {/* Quick Operations & Shortcuts (Bottom Section) */}
      <div className={styles.quickActionsPanel} style={{ marginTop: '2rem' }}>
        <div className={styles.quickActionsHeader}>
          <span className={styles.quickActionsTitle}>
            <Zap size={15} color="#38bdf8" /> Quick Operations & Shortcuts
          </span>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>1-Tap Direct Navigation</span>
        </div>

        <div className={styles.quickActionsGrid}>
          {/* 1. Record Trip */}
          <button
            onClick={onOpenRecordTrip}
            className={`${styles.quickActionItem} ${styles.quickActionPrimary}`}
            title="Create & record a new trip"
          >
            <div className={styles.quickActionIcon} style={{ background: 'rgba(2, 132, 199, 0.4)', color: '#38bdf8' }}>
              <Plus size={18} />
            </div>
            <div className={styles.quickActionContent}>
              <span className={styles.quickActionLabel}>+ Record Trip</span>
              <span className={styles.quickActionHint}>New freight dispatch</span>
            </div>
          </button>

          {/* 2. All Trips Log */}
          <button
            onClick={() => onNavigateTab('trips')}
            className={styles.quickActionItem}
            title="Browse all recorded trips"
          >
            <div className={styles.quickActionIcon} style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <Navigation size={17} />
            </div>
            <div className={styles.quickActionContent}>
              <span className={styles.quickActionLabel}>Trips Log ({kpis.totalTrips})</span>
              <span className={styles.quickActionHint}>Dispatches & status</span>
            </div>
          </button>

          {/* 3. Pending Payments */}
          <button
            onClick={() => onNavigateTab('payments')}
            className={styles.quickActionItem}
            title="Manage receivables & freight payments"
          >
            <div className={styles.quickActionIcon} style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <CreditCard size={17} />
            </div>
            <div className={styles.quickActionContent}>
              <span className={styles.quickActionLabel}>Collect Due</span>
              <span className={styles.quickActionHint}>
                ₹{kpis.pendingReceivables.toLocaleString()} pending
              </span>
            </div>
          </button>

          {/* 4. Driver Attendance */}
          <button
            onClick={() => onNavigateTab('attendance')}
            className={styles.quickActionItem}
            title="Driver daily roster & trip duty"
          >
            <div className={styles.quickActionIcon} style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' }}>
              <CalendarCheck size={17} />
            </div>
            <div className={styles.quickActionContent}>
              <span className={styles.quickActionLabel}>Attendance</span>
              <span className={styles.quickActionHint}>Daily driver roster</span>
            </div>
          </button>

          {/* 5. Drivers */}
          <button
            onClick={() => onNavigateTab('drivers')}
            className={styles.quickActionItem}
            title="Manage drivers & salary advances"
          >
            <div className={styles.quickActionIcon} style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
              <Users size={17} />
            </div>
            <div className={styles.quickActionContent}>
              <span className={styles.quickActionLabel}>Drivers ({kpis.totalDrivers})</span>
              <span className={styles.quickActionHint}>Salaries & advances</span>
            </div>
          </button>

          {/* 6. Vehicles */}
          <button
            onClick={() => onNavigateTab('vehicles')}
            className={styles.quickActionItem}
            title="Manage fleet vehicles & service records"
          >
            <div className={styles.quickActionIcon} style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <Truck size={17} />
            </div>
            <div className={styles.quickActionContent}>
              <span className={styles.quickActionLabel}>Vehicles ({kpis.totalVehicles})</span>
              <span className={styles.quickActionHint}>Fleet & status</span>
            </div>
          </button>

          {/* 7. Reports */}
          <button
            onClick={() => onNavigateTab('reports')}
            className={styles.quickActionItem}
            title="Generate P&L and monthly transport reports"
          >
            <div className={styles.quickActionIcon} style={{ background: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8' }}>
              <FileSpreadsheet size={17} />
            </div>
            <div className={styles.quickActionContent}>
              <span className={styles.quickActionLabel}>Reports & P&L</span>
              <span className={styles.quickActionHint}>Monthly analytics</span>
            </div>
          </button>
        </div>
      </div>

      {/* Floating Bottom Center Mobile Filter Pill */}
      <FleetMobileFilterPill
        onClick={handleOpenMobileDrawer}
        activeCount={isFilterActive ? 1 : 0}
        label="Date Filter"
        showSearch={false}
      />

      {/* Mobile Filter Bottom-Sheet Drawer */}
      <FleetMobileFilterDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        title="Dashboard Date Filter"
        activeCount={(drawerPreset !== 'all' || drawerStart || drawerEnd || isFilterActive) ? 1 : 0}
        onReset={handleResetFilter}
        onApply={handleApplyMobileDrawer}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Quick Presets */}
          <div className={styles.drawerFieldGroup}>
            <label className={styles.drawerLabel}>Quick Date Presets</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              {(['all', 'today', 'thisWeek', 'thisMonth', 'lastMonth'] as const).map((presetKey) => {
                const labels: Record<string, string> = {
                  all: 'All Time',
                  today: 'Today',
                  thisWeek: 'This Week',
                  thisMonth: 'This Month',
                  lastMonth: 'Last Month',
                };
                const isActive = drawerPreset === presetKey;
                return (
                  <button
                    key={presetKey}
                    type="button"
                    onClick={() => {
                      setDrawerPreset(presetKey);
                      if (presetKey === 'all') {
                        setDrawerStart('');
                        setDrawerEnd('');
                      } else {
                        const { s, e } = calculatePresetDates(presetKey);
                        setDrawerStart(s);
                        setDrawerEnd(e);
                      }
                    }}
                    className={`${styles.dashboardPresetBtn} ${isActive ? styles.dashboardPresetBtnActive : ''}`}
                    style={{ padding: '0.5rem 0.4rem', textAlign: 'center' }}
                  >
                    {labels[presetKey]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* From Date */}
          <div className={styles.drawerFieldGroup}>
            <label className={styles.drawerLabel}>From Date (Included)</label>
            <input
              type="date"
              value={drawerStart}
              onChange={(e) => {
                setDrawerStart(e.target.value);
                setDrawerPreset('custom');
              }}
              className={styles.drawerSelect}
            />
          </div>

          {/* To Date */}
          <div className={styles.drawerFieldGroup}>
            <label className={styles.drawerLabel}>To Date (Excluded)</label>
            <input
              type="date"
              value={drawerEnd}
              onChange={(e) => {
                setDrawerEnd(e.target.value);
                setDrawerPreset('custom');
              }}
              className={styles.drawerSelect}
            />
          </div>

          {/* Explanation Rule */}
          <div className={styles.dashboardRuleHint}>
            <Info size={14} color="#38bdf8" style={{ flexShrink: 0 }} />
            <span>
              <strong>Rule:</strong> Start date is included in data, but End date is excluded (e.g. 15 Aug to 15 Sep reflects trips from 15 Aug to 14 Sep midnight).
            </span>
          </div>
        </div>
      </FleetMobileFilterDrawer>
    </div>
  );
}
