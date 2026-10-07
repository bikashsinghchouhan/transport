'use client';

import React from 'react';
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
} from 'lucide-react';
import styles from './fleet.module.css';
import {
  RevenueExpenseTrendChart,
  ExpenseDonutChart,
  VehiclePerformanceChart,
} from './FleetCharts';

interface DashboardProps {
  stats: any;
  loading: boolean;
  onNavigateTab: (tab: string) => void;
  onOpenRecordTrip: () => void;
  onOpenRecordPayment: (tripId: string) => void;
}

export default function FleetDashboard({
  stats,
  loading,
  onNavigateTab,
  onOpenRecordTrip,
  onOpenRecordPayment,
}: DashboardProps) {
  if (loading && !stats) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
        <div style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Loading Fleet Analytics...</div>
      </div>
    );
  }

  const kpis = stats?.kpis || {
    totalTrips: 0,
    totalKm: 0,
    grossRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    pendingReceivables: 0,
    totalVehicles: 0,
    totalDrivers: 0,
  };

  const perf = stats?.performance || {
    fuelCostPerKm: 0,
    collectionEfficiency: 0,
    avgRevenuePerTrip: 0,
    avgProfitPerTrip: 0,
  };

  const charts = stats?.charts || {
    trend14Days: [],
    expenseBreakdown: [],
    vehiclePerformance: [],
  };

  const pendingSummary = stats?.pendingReceivablesSummary || {
    totalAmount: 0,
    pendingCount: 0,
    recentPending: [],
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* Quick Operations & Shortcuts (Mobile-First 1-Tap Access) */}
      <div className={styles.quickActionsPanel}>
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
                {kpis.pendingReceivables > 0 ? `₹${(kpis.pendingReceivables / 1000).toFixed(0)}k Due` : 'All cleared'}
              </span>
            </div>
          </button>

          {/* 3. Add Expense */}
          <button
            onClick={() => onNavigateTab('expenses')}
            className={styles.quickActionItem}
            title="Log fuel, toll, repair expense"
          >
            <div className={styles.quickActionIcon} style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
              <Receipt size={17} />
            </div>
            <div className={styles.quickActionContent}>
              <span className={styles.quickActionLabel}>Log Expense</span>
              <span className={styles.quickActionHint}>Fuel, toll, repairs</span>
            </div>
          </button>

          {/* 4. Mark Attendance */}
          <button
            onClick={() => onNavigateTab('attendance')}
            className={styles.quickActionItem}
            title="Mark driver duty and daily attendance"
          >
            <div className={styles.quickActionIcon} style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <CalendarCheck size={17} />
            </div>
            <div className={styles.quickActionContent}>
              <span className={styles.quickActionLabel}>Attendance</span>
              <span className={styles.quickActionHint}>Driver duty roster</span>
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
            {pendingSummary.pendingCount} unpaid customer invoices
          </div>
        </div>
      </div>

      {/* Fleet Efficiency & Performance Indicators */}
      <div className={styles.perfMetricsGrid}>
        <div className={styles.perfCard}>
          <div className={styles.perfIcon} style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <Fuel size={20} />
          </div>
          <div className={styles.perfDetails}>
            <span className={styles.perfLabel}>Fuel Cost / KM</span>
            <span className={styles.perfVal}>₹{perf.fuelCostPerKm} / KM</span>
          </div>
        </div>

        <div className={styles.perfCard}>
          <div className={styles.perfIcon} style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <Percent size={20} />
          </div>
          <div className={styles.perfDetails}>
            <span className={styles.perfLabel}>Collection Efficiency</span>
            <span className={styles.perfVal}>{perf.collectionEfficiency}%</span>
          </div>
        </div>

        <div className={styles.perfCard}>
          <div className={styles.perfIcon} style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
            <TrendingUp size={20} />
          </div>
          <div className={styles.perfDetails}>
            <span className={styles.perfLabel}>Avg Revenue / Trip</span>
            <span className={styles.perfVal}>₹{perf.avgRevenuePerTrip.toLocaleString()}</span>
          </div>
        </div>

        <div className={styles.perfCard}>
          <div className={styles.perfIcon} style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
            <Calculator size={20} />
          </div>
          <div className={styles.perfDetails}>
            <span className={styles.perfLabel}>Avg Profit / Trip</span>
            <span className={styles.perfVal}>₹{perf.avgProfitPerTrip.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className={styles.chartsGrid}>
        {/* Chart 1: Revenue vs Expense Trend (14 days) */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div>
              <h4 className={styles.chartTitle}>Revenue vs Expense Trend</h4>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Last 14 days operational performance</span>
            </div>
            <div className={styles.chartLegend}>
              <div className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: '#38bdf8' }} />
                <span>Revenue</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: '#f43f5e' }} />
                <span>Expense</span>
              </div>
            </div>
          </div>
          <RevenueExpenseTrendChart data={charts.trend14Days} />
        </div>

        {/* Chart 2: Expense Breakdown Donut */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h4 className={styles.chartTitle}>Expense Breakdown</h4>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>By Category</span>
          </div>
          <ExpenseDonutChart data={charts.expenseBreakdown} />
        </div>
      </div>

      {/* Bottom Row: Vehicle Comparison & Pending Receivables Quick Action */}
      <div className={styles.bottomChartsGrid}>
        {/* Vehicle Performance Comparison */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h4 className={styles.chartTitle}>Vehicle Performance Ranking</h4>
            <button
              onClick={() => onNavigateTab('vehicles')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#38bdf8',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              All Vehicles <ArrowUpRight size={14} />
            </button>
          </div>
          <VehiclePerformanceChart vehicles={charts.vehiclePerformance} />
        </div>

        {/* Pending Receivables Action Box */}
        <div className={styles.chartCard} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className={styles.chartHeader} style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={18} color="#fbbf24" />
                <h4 className={styles.chartTitle}>Pending Collections</h4>
              </div>
              <span className={styles.subNavItemBadge}>
                ₹{pendingSummary.totalAmount.toLocaleString()} Pending
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {pendingSummary.recentPending.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b', fontSize: '0.85rem' }}>
                  No pending collections! All trips fully collected.
                </div>
              ) : (
                pendingSummary.recentPending.map((trip: any) => (
                  <div
                    key={trip._id}
                    style={{
                      background: 'rgba(30, 41, 59, 0.5)',
                      border: '1px solid rgba(51, 65, 85, 0.6)',
                      borderRadius: '10px',
                      padding: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.88rem' }}>
                        {trip.customerName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {trip.vehicleId?.registrationNumber || 'Vehicle'} • {trip.tripRoute}
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
    </div>
  );
}
