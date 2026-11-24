'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Filter,
  Truck,
  User,
  IndianRupee,
  Activity,
} from 'lucide-react';
import styles from './fleet.module.css';
import FleetMobileFilterPill from './FleetMobileFilterPill';
import FleetMobileFilterDrawer from './FleetMobileFilterDrawer';

export default function FleetReports() {
  const [reportType, setReportType] = useState<'vehicle' | 'driver' | 'daily' | 'monthly'>('vehicle');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const activeFiltersCount =
    (reportType !== 'vehicle' ? 1 : 0) + (startDate || endDate ? 1 : 0);

  const handleResetFilters = () => {
    setReportType('vehicle');
    setStartDate('');
    setEndDate('');
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('type', reportType);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await fetch(`/api/admin/fleet/reports?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setReportData(data.report || []);
      }
    } catch (err) {
      console.error('Fetch report error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType, startDate, endDate]);

  // Export to CSV / Excel
  const handleExportCSV = (isExcel = false) => {
    if (reportData.length === 0) {
      alert('No data to export');
      return;
    }

    let csvContent = '';
    const headers = Object.keys(reportData[0]).filter((k) => k !== 'id');
    csvContent += headers.join(',') + '\r\n';

    reportData.forEach((row) => {
      const values = headers.map((h) => {
        const val = row[h] !== undefined ? row[h] : '';
        return `"${val}"`;
      });
      csvContent += values.join(',') + '\r\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `b2_fleet_${reportType}_report_${new Date().toISOString().split('T')[0]}.${isExcel ? 'csv' : 'csv'}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
      {/* Desktop Controls Bar (hidden on mobile) */}
      <div className={styles.desktopFilterBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as any)}
            className={styles.filterSelect}
            style={{ fontWeight: 600 }}
          >
            <option value="vehicle">Vehicle Performance Report</option>
            <option value="driver">Driver Productivity Report</option>
            <option value="daily">Daily Financial Report</option>
            <option value="monthly">Monthly Financial Report</option>
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button onClick={() => handleExportCSV(false)} className={styles.secondaryActionBtn}>
            <Download size={15} /> Export CSV
          </button>
          <button onClick={() => handleExportCSV(true)} className={styles.secondaryActionBtn}>
            <Download size={15} /> Export Excel
          </button>
          <button onClick={handlePrint} className={styles.primaryActionBtn}>
            <Printer size={15} /> Print Report
          </button>
        </div>
      </div>

      {/* Mobile Filter Bar with Actions & Bottom Center Floating Pill */}
      <div className={styles.mobileFilterBar}>
        <FleetMobileFilterPill
          onClick={() => setShowMobileFilters(true)}
          activeCount={activeFiltersCount}
          searchQuery={reportType}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button onClick={() => handleExportCSV(false)} className={styles.secondaryActionBtn} style={{ padding: '0.45rem 0.65rem' }}>
            <Download size={14} /> CSV
          </button>
          <button onClick={handlePrint} className={styles.primaryActionBtn} style={{ padding: '0.45rem 0.75rem' }}>
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      {/* Mobile Filter Bottom-Sheet Drawer */}
      <FleetMobileFilterDrawer
        isOpen={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
        title="Configure Report Filters"
        activeCount={activeFiltersCount}
        onReset={handleResetFilters}
      >
        <div className={styles.drawerFieldGroup}>
          <label className={styles.drawerLabel}>Report Category</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as any)}
            className={styles.drawerSelect}
          >
            <option value="vehicle">Vehicle Performance Report</option>
            <option value="driver">Driver Productivity Report</option>
            <option value="daily">Daily Financial Report</option>
            <option value="monthly">Monthly Financial Report</option>
          </select>
        </div>

        <div className={styles.drawerFieldGroup}>
          <label className={styles.drawerLabel}>Date Range</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '0.6rem' }}>
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
      </FleetMobileFilterDrawer>

      {/* Printable Report View */}
      <div className={`${styles.tableWrapper} ${styles.printableReport}`}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid color-mix(in srgb, var(--c-700) 60%, transparent)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--a-text)' }}>
                b2 Transport —{' '}
                {reportType === 'vehicle'
                  ? 'Vehicle Fleet Report'
                  : reportType === 'driver'
                  ? 'Driver Productivity Report'
                  : reportType === 'daily'
                  ? 'Daily Revenue & Expense Report'
                  : 'Monthly Financial Summary'}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--a-text-3)', margin: '0.2rem 0 0 0' }}>
                Date Range: {startDate || 'All records'} {endDate ? `to ${endDate}` : ''} • Generated on:{' '}
                {new Date().toLocaleString()}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className={styles.statusBadge} style={{ background: 'rgba(56, 189, 248, 0.15)', color: 'var(--a-sky)' }}>
                {reportData.length} Entries
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Table according to report type */}
        <table className={styles.dataTable}>
          <thead>
            {reportType === 'vehicle' && (
              <tr>
                <th>Vehicle Number</th>
                <th>Model / Type</th>
                <th>Trips</th>
                <th>Distance (KM)</th>
                <th>Revenue</th>
                <th>Expenses</th>
                <th>Net Profit</th>
                <th>Pending</th>
              </tr>
            )}
            {reportType === 'driver' && (
              <tr>
                <th>Driver Name</th>
                <th>Phone</th>
                <th>License</th>
                <th>Trips</th>
                <th>Present Days</th>
                <th>Distance (KM)</th>
                <th>Revenue</th>
                <th>Total Collected</th>
              </tr>
            )}
            {reportType === 'daily' && (
              <tr>
                <th>Date</th>
                <th>Trips Completed</th>
                <th>Distance (KM)</th>
                <th>Revenue</th>
                <th>Expenses</th>
                <th>Net Profit</th>
                <th>Pending</th>
              </tr>
            )}
            {reportType === 'monthly' && (
              <tr>
                <th>Month</th>
                <th>Total Trips</th>
                <th>Total KM</th>
                <th>Gross Revenue</th>
                <th>Total Expenses</th>
                <th>Net Profit</th>
                <th>Pending Receivables</th>
              </tr>
            )}
          </thead>
          <tbody>
            {reportData.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--a-text-3)' }}>
                  {loading ? 'Generating report data...' : 'No records found for the selected criteria.'}
                </td>
              </tr>
            ) : (
              reportData.map((row, idx) => (
                <tr key={idx}>
                  {reportType === 'vehicle' && (
                    <>
                      <td>
                        <div className={styles.vehiclePlate} style={{ padding: '0.15rem 0.45rem', fontSize: '0.8rem' }}>
                          <span className={styles.plateIndBadge}>IND</span>
                          {row.vehicle}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 500, color: 'var(--a-text)' }}>{row.model}</span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--a-text-3)' }}>{row.vehicleType}</div>
                      </td>
                      <td>{row.trips}</td>
                      <td>{row.totalKm.toLocaleString()} KM</td>
                      <td style={{ color: 'var(--a-sky)', fontWeight: 600 }}>₹{row.revenue.toLocaleString()}</td>
                      <td style={{ color: 'var(--a-red)' }}>₹{row.expenses.toLocaleString()}</td>
                      <td style={{ color: row.profit >= 0 ? 'var(--a-green)' : 'var(--a-red)', fontWeight: 700 }}>
                        ₹{row.profit.toLocaleString()}
                      </td>
                      <td style={{ color: row.pending > 0 ? 'var(--a-amber)' : '#64748b' }}>₹{row.pending.toLocaleString()}</td>
                    </>
                  )}

                  {reportType === 'driver' && (
                    <>
                      <td style={{ fontWeight: 600, color: 'var(--a-text)' }}>{row.driver}</td>
                      <td>{row.phone}</td>
                      <td style={{ fontFamily: 'monospace', color: 'var(--a-sky)' }}>{row.licenseNumber}</td>
                      <td>{row.trips}</td>
                      <td style={{ color: 'var(--a-green)', fontWeight: 600 }}>{row.attendance} days</td>
                      <td>{row.totalKm.toLocaleString()} KM</td>
                      <td style={{ color: 'var(--a-sky)', fontWeight: 600 }}>₹{row.revenue.toLocaleString()}</td>
                      <td style={{ color: 'var(--a-amber)', fontWeight: 700 }}>₹{row.collection.toLocaleString()}</td>
                    </>
                  )}

                  {reportType === 'daily' && (
                    <>
                      <td style={{ fontWeight: 600, color: 'var(--a-text)' }}>{row.date}</td>
                      <td>{row.trips}</td>
                      <td>{row.totalKm.toLocaleString()} KM</td>
                      <td style={{ color: 'var(--a-sky)', fontWeight: 600 }}>₹{row.revenue.toLocaleString()}</td>
                      <td style={{ color: 'var(--a-red)' }}>₹{row.expenses.toLocaleString()}</td>
                      <td style={{ color: row.profit >= 0 ? 'var(--a-green)' : 'var(--a-red)', fontWeight: 700 }}>
                        ₹{row.profit.toLocaleString()}
                      </td>
                      <td style={{ color: row.pending > 0 ? 'var(--a-amber)' : '#64748b' }}>₹{row.pending.toLocaleString()}</td>
                    </>
                  )}

                  {reportType === 'monthly' && (
                    <>
                      <td style={{ fontWeight: 700, color: 'var(--a-text)' }}>{row.month}</td>
                      <td>{row.trips}</td>
                      <td>{row.totalKm.toLocaleString()} KM</td>
                      <td style={{ color: 'var(--a-sky)', fontWeight: 600 }}>₹{row.revenue.toLocaleString()}</td>
                      <td style={{ color: 'var(--a-red)' }}>₹{row.expenses.toLocaleString()}</td>
                      <td style={{ color: row.profit >= 0 ? 'var(--a-green)' : 'var(--a-red)', fontWeight: 700 }}>
                        ₹{row.profit.toLocaleString()}
                      </td>
                      <td style={{ color: row.pending > 0 ? 'var(--a-amber)' : '#64748b' }}>₹{row.pending.toLocaleString()}</td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
