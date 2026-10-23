'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Truck,
  User,
  Save,
  Check,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  UserCheck,
  X,
} from 'lucide-react';
import styles from './fleet.module.css';
import FleetMobileFilterPill from './FleetMobileFilterPill';
import FleetMobileFilterDrawer from './FleetMobileFilterDrawer';

interface AttendanceProps {
  drivers: any[];
  vehicles: any[];
  onRefreshStats?: () => void;
}

export default function FleetAttendance({
  drivers,
  vehicles,
  onRefreshStats,
}: AttendanceProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [roster, setRoster] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    totalDrivers: 0,
    present: 0,
    absent: 0,
    halfDay: 0,
    leave: 0,
  });
  const [loading, setLoading] = useState(false);
  const [savingDriverId, setSavingDriverId] = useState<string | null>(null);

  // Monthly Calendar States
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [monthlyMap, setMonthlyMap] = useState<Record<string, any>>({});
  const [monthlySummary, setMonthlySummary] = useState({
    present: 0,
    halfDay: 0,
    absent: 0,
    leave: 0,
    totalDutyHours: 0,
    totalMarkedDays: 0,
  });
  const [monthlyLoading, setMonthlyLoading] = useState(false);

  // Quick Mark Attendance Popup states
  const [modalDate, setModalDate] = useState<string | null>(null);
  const [popupStatus, setPopupStatus] = useState<'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE'>('PRESENT');
  const [popupStartTime, setPopupStartTime] = useState('08:00');
  const [popupEndTime, setPopupEndTime] = useState('18:00');
  const [popupRemarks, setPopupRemarks] = useState('');
  const [popupSaving, setPopupSaving] = useState(false);

  const handleDayClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    const existing = monthlyMap[dateStr];
    setModalDate(dateStr);
    setPopupStatus(existing?.attendance || 'PRESENT');
    setPopupStartTime(
      existing?.dutyStartTime ||
        (existing?.attendance === 'ABSENT' || existing?.attendance === 'LEAVE' ? '' : '08:00')
    );
    setPopupEndTime(
      existing?.dutyEndTime ||
        (existing?.attendance === 'ABSENT' || existing?.attendance === 'LEAVE' ? '' : '18:00')
    );
    setPopupRemarks(existing?.remarks || '');
  };

  const handleSavePopupAttendance = async () => {
    if (!modalDate || !selectedDriverId) return;
    setPopupSaving(true);
    try {
      const activeDriverObj = drivers.find((d: any) => d._id === selectedDriverId);
      const vehicleId = activeDriverObj?.assignedVehicleId?._id || activeDriverObj?.assignedVehicleId || null;

      const payload = {
        driverId: selectedDriverId,
        date: modalDate,
        attendance: popupStatus,
        dutyStartTime: popupStatus === 'ABSENT' || popupStatus === 'LEAVE' ? '' : popupStartTime,
        dutyEndTime: popupStatus === 'ABSENT' || popupStatus === 'LEAVE' ? '' : popupEndTime,
        remarks: popupRemarks,
        vehicleId,
      };

      const res = await fetch('/api/admin/fleet/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        if (modalDate === selectedDate) {
          fetchAttendance(selectedDate);
        }
        fetchMonthlyAttendance(selectedMonth, selectedDriverId);
        if (onRefreshStats) onRefreshStats();
        setModalDate(null);
      } else {
        alert(data.error || 'Failed to update attendance');
      }
    } catch (err: any) {
      alert(err.message || 'Error updating attendance');
    } finally {
      setPopupSaving(false);
    }
  };

  const scrollToDailyRoster = () => {
    const el = document.getElementById('daily-attendance-roster');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setModalDate(null);
  };

  // Auto-select driver: if only one driver (or none selected yet), default to that driver
  useEffect(() => {
    if (drivers && drivers.length > 0) {
      if (!selectedDriverId || !drivers.some((d: any) => d._id === selectedDriverId)) {
        setSelectedDriverId(drivers[0]._id);
      }
    }
  }, [drivers, selectedDriverId]);

  const handlePrevDutyDate = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const dy = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${yr}-${mo}-${dy}`);
  };

  const handleNextDutyDate = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const dy = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${yr}-${mo}-${dy}`);
  };

  const activeFiltersCount = statusFilter ? 1 : 0;

  const handleResetFilters = () => {
    setStatusFilter('');
  };

  const fetchAttendance = async (dateStr: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/fleet/attendance?date=${dateStr}`);
      const data = await res.json();
      if (data.success) {
        setRoster(data.roster || []);
        setSummary(data.summary || { totalDrivers: 0, present: 0, absent: 0, halfDay: 0, leave: 0 });
      }
    } catch (err) {
      console.error('Fetch attendance error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyAttendance = async (monthStr: string, driverId?: string) => {
    if (!driverId) return;
    setMonthlyLoading(true);
    try {
      const res = await fetch(`/api/admin/fleet/attendance?month=${monthStr}&driverId=${driverId}`);
      const data = await res.json();
      if (data.success) {
        setMonthlyMap(data.attendanceByDate || {});
        setMonthlySummary(
          data.summary || {
            present: 0,
            halfDay: 0,
            absent: 0,
            leave: 0,
            totalDutyHours: 0,
            totalMarkedDays: 0,
          }
        );
      }
    } catch (err) {
      console.error('Fetch monthly attendance error:', err);
    } finally {
      setMonthlyLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    if (selectedDriverId && selectedMonth) {
      fetchMonthlyAttendance(selectedMonth, selectedDriverId);
    }
  }, [selectedMonth, selectedDriverId]);

  const handlePrevMonth = () => {
    const [yearStr, monthStr] = selectedMonth.split('-');
    let y = parseInt(yearStr, 10);
    let m = parseInt(monthStr, 10) - 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    setSelectedMonth(`${y}-${String(m).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [yearStr, monthStr] = selectedMonth.split('-');
    let y = parseInt(yearStr, 10);
    let m = parseInt(monthStr, 10) + 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
    setSelectedMonth(`${y}-${String(m).padStart(2, '0')}`);
  };

  const getMonthDisplay = (monthStr: string) => {
    try {
      const [year, month] = monthStr.split('-');
      const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
      return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch {
      return monthStr;
    }
  };

  const getCalendarCells = () => {
    const [yearStr, monthStr] = selectedMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDayIndex = new Date(year, month - 1, 1).getDay(); // 0 = Sun

    const blanks = Array.from({ length: firstDayIndex }, (_, i) => i);
    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const dayNum = i + 1;
      const dateString = `${year}-${String(month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      return {
        day: dayNum,
        date: dateString,
      };
    });

    return { blanks, days };
  };

  const handleQuickStatusChange = async (
    driverId: string,
    newStatus: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE',
    customStartTime?: string,
    customEndTime?: string,
    remarks?: string
  ) => {
    setSavingDriverId(driverId);
    try {
      const currentItem = roster.find((r) => r.driver._id === driverId);
      const vehicleId = currentItem?.driver?.assignedVehicle?._id || null;

      const payload = {
        driverId,
        date: selectedDate,
        attendance: newStatus,
        dutyStartTime: customStartTime !== undefined ? customStartTime : currentItem?.dutyStartTime || (newStatus === 'PRESENT' ? '08:00' : ''),
        dutyEndTime: customEndTime !== undefined ? customEndTime : currentItem?.dutyEndTime || (newStatus === 'PRESENT' ? '18:00' : ''),
        remarks: remarks !== undefined ? remarks : currentItem?.remarks || '',
        vehicleId,
      };

      const res = await fetch('/api/admin/fleet/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        // Optimistically update local roster
        setRoster((prev) =>
          prev.map((r) => {
            if (r.driver._id === driverId) {
              return {
                ...r,
                status: newStatus,
                dutyStartTime: payload.dutyStartTime,
                dutyEndTime: payload.dutyEndTime,
                totalDutyHours: data.attendance.totalDutyHours,
                remarks: payload.remarks,
              };
            }
            return r;
          })
        );
        fetchAttendance(selectedDate);
        if (selectedDriverId) {
          fetchMonthlyAttendance(selectedMonth, selectedDriverId);
        }
        if (onRefreshStats) onRefreshStats();
      }
    } catch (err) {
      console.error('Update attendance failed:', err);
    } finally {
      setSavingDriverId(null);
    }
  };

  const filteredRoster = roster.filter((r) => {
    if (!statusFilter) return true;
    return r.status === statusFilter;
  });

  const selectedDriver = drivers.find((d: any) => d._id === selectedDriverId);
  const { blanks, days } = getCalendarCells();
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div id="daily-attendance-roster" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
      {/* Desktop Date Header & Quick Summary KPIs (hidden on mobile) */}
      <div className={styles.desktopFilterBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} color="#38bdf8" />
            <span style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.9rem' }}>Duty Date:</span>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className={styles.filterSelect}
            style={{ fontWeight: 600 }}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Statuses</option>
            <option value="PRESENT">Present</option>
            <option value="HALF_DAY">Half Day</option>
            <option value="ABSENT">Absent</option>
            <option value="LEAVE">Leave</option>
          </select>
        </div>

        {/* Daily Summary Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Total: <strong>{summary.totalDrivers}</strong>
          </span>
          <span className={`${styles.statusBadge} ${styles.statusActive}`}>
            {summary.present} Present
          </span>
          <span className={`${styles.statusBadge} ${styles.statusMaintenance}`}>
            {summary.halfDay} Half Day
          </span>
          <span className={`${styles.statusBadge} ${styles.statusPending}`}>
            {summary.absent} Absent
          </span>
          <span className={`${styles.statusBadge} ${styles.statusInactive}`}>
            {summary.leave} Leave
          </span>
        </div>
      </div>

      {/* Mobile Filter Bar with Pill & Daily Summary */}
      <div className={styles.mobileFilterBar}>
        <FleetMobileFilterPill
          onClick={() => setShowMobileFilters(true)}
          activeCount={activeFiltersCount}
          searchQuery={statusFilter ? `Status: ${statusFilter}` : ''}
          label="Filter Drivers"
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem' }}>
          <span className={`${styles.statusBadge} ${styles.statusActive}`}>
            {summary.present} Present
          </span>
          <span className={`${styles.statusBadge} ${styles.statusPending}`}>
            {summary.absent} Absent
          </span>
        </div>
      </div>

      {/* Mobile Filter Bottom-Sheet Drawer (Status only - date is managed on screen) */}
      <FleetMobileFilterDrawer
        isOpen={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
        title="Filter Drivers by Status"
        activeCount={activeFiltersCount}
        onReset={handleResetFilters}
      >
        <div className={styles.drawerFieldGroup}>
          <label className={styles.drawerLabel}>Driver Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.drawerSelect}
          >
            <option value="">All Drivers (Show All)</option>
            <option value="PRESENT">Present Only</option>
            <option value="HALF_DAY">Half Day Only</option>
            <option value="ABSENT">Absent Only</option>
            <option value="LEAVE">On Leave</option>
          </select>
        </div>
      </FleetMobileFilterDrawer>

      {/* Attendance Roster Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Driver</th>
              <th>Assigned Vehicle</th>
              <th>Status (1-Click Update)</th>
              <th>Punch In</th>
              <th>Punch Out</th>
              <th>Duty Hours</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {filteredRoster.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                  {loading ? 'Loading attendance roster...' : 'No active drivers found.'}
                </td>
              </tr>
            ) : (
              filteredRoster.map((item) => {
                const driver = item.driver;
                const isSaving = savingDriverId === driver._id;

                return (
                  <tr key={driver._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#ffffff' }}>{driver.fullName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{driver.phone}</div>
                    </td>
                    <td>
                      {driver.assignedVehicle ? (
                        <div className={styles.vehiclePlate} style={{ padding: '0.15rem 0.45rem', fontSize: '0.78rem' }}>
                          <span className={styles.plateIndBadge}>IND</span>
                          {driver.assignedVehicle.registrationNumber}
                        </div>
                      ) : (
                        <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Unassigned</span>
                      )}
                    </td>
                    <td>
                      {/* One-Click Quick Status Toggle Buttons */}
                      <div style={{ display: 'inline-flex', gap: '0.25rem', background: 'rgba(30, 41, 59, 0.6)', padding: '0.2rem', borderRadius: '8px' }}>
                        <button
                          onClick={() => handleQuickStatusChange(driver._id, 'PRESENT')}
                          style={{
                            background: item.status === 'PRESENT' ? '#10b981' : 'transparent',
                            color: item.status === 'PRESENT' ? '#ffffff' : '#94a3b8',
                            border: 'none',
                            padding: '0.25rem 0.6rem',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          Present
                        </button>
                        <button
                          onClick={() => handleQuickStatusChange(driver._id, 'HALF_DAY')}
                          style={{
                            background: item.status === 'HALF_DAY' ? '#f59e0b' : 'transparent',
                            color: item.status === 'HALF_DAY' ? '#ffffff' : '#94a3b8',
                            border: 'none',
                            padding: '0.25rem 0.6rem',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          Half Day
                        </button>
                        <button
                          onClick={() => handleQuickStatusChange(driver._id, 'ABSENT')}
                          style={{
                            background: item.status === 'ABSENT' ? '#ef4444' : 'transparent',
                            color: item.status === 'ABSENT' ? '#ffffff' : '#94a3b8',
                            border: 'none',
                            padding: '0.25rem 0.6rem',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          Absent
                        </button>
                        <button
                          onClick={() => handleQuickStatusChange(driver._id, 'LEAVE')}
                          style={{
                            background: item.status === 'LEAVE' ? '#64748b' : 'transparent',
                            color: item.status === 'LEAVE' ? '#ffffff' : '#94a3b8',
                            border: 'none',
                            padding: '0.25rem 0.6rem',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          Leave
                        </button>
                      </div>
                    </td>
                    <td>
                      <input
                        type="time"
                        value={item.dutyStartTime || ''}
                        onChange={(e) =>
                          handleQuickStatusChange(driver._id, item.status, e.target.value, item.dutyEndTime, item.remarks)
                        }
                        className={styles.filterSelect}
                        style={{ padding: '0.25rem 0.4rem', fontSize: '0.8rem' }}
                      />
                    </td>
                    <td>
                      <input
                        type="time"
                        value={item.dutyEndTime || ''}
                        onChange={(e) =>
                          handleQuickStatusChange(driver._id, item.status, item.dutyStartTime, e.target.value, item.remarks)
                        }
                        className={styles.filterSelect}
                        style={{ padding: '0.25rem 0.4rem', fontSize: '0.8rem' }}
                      />
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#38bdf8', fontSize: '0.85rem' }}>
                        {item.totalDutyHours || 0} hrs
                      </span>
                    </td>
                    <td>
                      <input
                        type="text"
                        placeholder="Add remark..."
                        value={item.remarks || ''}
                        onBlur={(e) =>
                          handleQuickStatusChange(driver._id, item.status, item.dutyStartTime, item.dutyEndTime, e.target.value)
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          setRoster((prev) =>
                            prev.map((r) => (r.driver._id === driver._id ? { ...r, remarks: val } : r))
                          );
                        }}
                        className={styles.searchInput}
                        style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.8rem' }}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Dedicated Duty Date Bar (Directly before attendance taking cards) */}
      <div className={styles.mobileDutyDateBar}>
        <div className={styles.mobileDutyDateHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Calendar size={15} color="#38bdf8" />
            <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.85rem' }}>Duty Date</span>
          </div>
          {selectedDate === todayStr ? (
            <span className={styles.dutyTodayPill}>Today</span>
          ) : (
            <button
              type="button"
              onClick={() => setSelectedDate(todayStr)}
              className={styles.dutyTodayBtn}
            >
              Jump to Today
            </button>
          )}
        </div>

        <div className={styles.mobileDutyDateNavRow}>
          <button
            type="button"
            onClick={handlePrevDutyDate}
            className={styles.dutyDateNavBtn}
            aria-label="Previous Day"
            title="Previous Day"
          >
            <ChevronLeft size={18} />
          </button>
          <div className={styles.dutyDateDisplayBox}>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={styles.mobileDutyDateInput}
              aria-label="Select Duty Date"
            />
            <div className={styles.dutyDateFormattedDisplay}>
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </div>
          </div>
          <button
            type="button"
            onClick={handleNextDutyDate}
            className={styles.dutyDateNavBtn}
            aria-label="Next Day"
            title="Next Day"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Mobile Responsive Roster Cards */}
      <div className={styles.mobileCardsGrid}>
        {filteredRoster.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8' }}>
            No drivers found matching status filter.
          </div>
        ) : (
          filteredRoster.map((item) => {
          const driver = item.driver;
          return (
            <div key={driver._id} className={styles.mobileCard}>
              <div className={styles.mobileCardHeader}>
                <div>
                  <div style={{ fontWeight: 700, color: '#ffffff' }}>{driver.fullName}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {driver.assignedVehicle?.registrationNumber || 'No truck assigned'}
                  </div>
                </div>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#38bdf8' }}>
                  {item.totalDutyHours || 0} hrs duty
                </span>
              </div>

              {/* Status Selector */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.25rem' }}>
                <button
                  onClick={() => handleQuickStatusChange(driver._id, 'PRESENT')}
                  style={{
                    background: item.status === 'PRESENT' ? '#10b981' : 'rgba(30, 41, 59, 0.6)',
                    color: item.status === 'PRESENT' ? '#ffffff' : '#94a3b8',
                    border: 'none',
                    padding: '0.35rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  Present
                </button>
                <button
                  onClick={() => handleQuickStatusChange(driver._id, 'HALF_DAY')}
                  style={{
                    background: item.status === 'HALF_DAY' ? '#f59e0b' : 'rgba(30, 41, 59, 0.6)',
                    color: item.status === 'HALF_DAY' ? '#ffffff' : '#94a3b8',
                    border: 'none',
                    padding: '0.35rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  Half Day
                </button>
                <button
                  onClick={() => handleQuickStatusChange(driver._id, 'ABSENT')}
                  style={{
                    background: item.status === 'ABSENT' ? '#ef4444' : 'rgba(30, 41, 59, 0.6)',
                    color: item.status === 'ABSENT' ? '#ffffff' : '#94a3b8',
                    border: 'none',
                    padding: '0.35rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  Absent
                </button>
                <button
                  onClick={() => handleQuickStatusChange(driver._id, 'LEAVE')}
                  style={{
                    background: item.status === 'LEAVE' ? '#64748b' : 'rgba(30, 41, 59, 0.6)',
                    color: item.status === 'LEAVE' ? '#ffffff' : '#94a3b8',
                    border: 'none',
                    padding: '0.35rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  Leave
                </button>
              </div>

              {/* Punch In / Out */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.2rem' }}>
                <div>
                  <label style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Punch In</label>
                  <input
                    type="time"
                    value={item.dutyStartTime || ''}
                    onChange={(e) =>
                      handleQuickStatusChange(driver._id, item.status, e.target.value, item.dutyEndTime, item.remarks)
                    }
                    className={styles.filterSelect}
                    style={{ width: '100%', padding: '0.3rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Punch Out</label>
                  <input
                    type="time"
                    value={item.dutyEndTime || ''}
                    onChange={(e) =>
                      handleQuickStatusChange(driver._id, item.status, item.dutyStartTime, e.target.value, item.remarks)
                    }
                    className={styles.filterSelect}
                    style={{ width: '100%', padding: '0.3rem' }}
                  />
                </div>
              </div>
            </div>
          );
        }))}
      </div>

      {/* Monthly Driver Attendance & Calendar Section */}
      <div className={styles.monthlyAttendanceCard}>
        {/* Header: Title, Driver Select dropdown, Month navigation */}
        <div className={styles.monthlyHeaderRow}>
          <div className={styles.monthlyHeaderTitleGroup}>
            <div className={styles.monthlyIconBadge}>
              <CalendarDays size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                  Driver Monthly Attendance Calendar
                </h3>
                {drivers.length === 1 && (
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      padding: '0.15rem 0.45rem',
                      borderRadius: '6px',
                      background: 'rgba(56, 189, 248, 0.15)',
                      color: '#38bdf8',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                    }}
                  >
                    1 Driver
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0.2rem 0 0 0' }}>
                Monthly attendance breakdown, duty shifts, and calendar status for selected driver
              </p>
            </div>
          </div>

          <div className={styles.monthlyControlsRow}>
            {/* Driver Dropdown (auto-selected when 1 driver) */}
            <div className={styles.monthlyDriverSelector}>
              <UserCheck size={16} color="#38bdf8" />
              <select
                id="driver-attendance-dropdown"
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
                className={styles.monthlyDriverSelect}
                aria-label="Select Driver"
              >
                {drivers.length === 0 && <option value="">No drivers found</option>}
                {drivers.map((d: any) => {
                  const reg = d.assignedVehicleId?.registrationNumber || d.assignedVehicle?.registrationNumber;
                  return (
                    <option key={d._id} value={d._id}>
                      {d.fullName} {d.phone ? `(${d.phone})` : ''} {reg ? `• ${reg}` : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Month Stepper & Picker */}
            <div className={styles.monthNavigator}>
              <button
                type="button"
                onClick={handlePrevMonth}
                className={styles.monthNavBtn}
                title="Previous Month"
                aria-label="Previous Month"
              >
                <ChevronLeft size={18} />
              </button>

              <div className={styles.monthDisplayBox}>
                <span className={styles.monthDisplayLabel}>
                  {getMonthDisplay(selectedMonth)}
                </span>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => {
                    if (e.target.value) setSelectedMonth(e.target.value);
                  }}
                  className={styles.monthPickerOverlay}
                  title="Jump to Month"
                  aria-label="Choose Month"
                />
              </div>

              <button
                type="button"
                onClick={handleNextMonth}
                className={styles.monthNavBtn}
                title="Next Month"
                aria-label="Next Month"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Selected Driver Banner */}
        {selectedDriver && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              background: 'rgba(30, 41, 59, 0.4)',
              border: '1px solid rgba(51, 65, 85, 0.45)',
              borderRadius: '10px',
              padding: '0.65rem 0.9rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(2, 132, 199, 0.2)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38bdf8',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                }}
              >
                {selectedDriver.fullName?.charAt(0)?.toUpperCase() || 'D'}
              </div>
              <div>
                <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.9rem' }}>
                  {selectedDriver.fullName}
                </span>
                {selectedDriver.phone && (
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '0.5rem' }}>
                    📱 {selectedDriver.phone}
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.78rem', color: '#94a3b8', flexWrap: 'wrap' }}>
              {selectedDriver.assignedVehicleId?.registrationNumber ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#38bdf8' }}>
                  <Truck size={14} /> {selectedDriver.assignedVehicleId.registrationNumber}
                </span>
              ) : (
                <span style={{ color: '#64748b' }}>Unassigned Vehicle</span>
              )}
              {selectedDriver.licenseNumber && (
                <span>• License: <strong style={{ color: '#e2e8f0' }}>{selectedDriver.licenseNumber}</strong></span>
              )}
            </div>
          </div>
        )}

        {/* Monthly Summary Statistics Grid */}
        <div className={styles.monthlyStatsGrid}>
          <div className={styles.monthlyStatCard}>
            <div className={styles.monthlyStatLabel}>
              <span>Present Days</span>
              <CheckCircle2 size={14} color="#10b981" />
            </div>
            <div className={styles.monthlyStatVal} style={{ color: '#34d399' }}>
              {monthlySummary.present}
            </div>
          </div>

          <div className={styles.monthlyStatCard}>
            <div className={styles.monthlyStatLabel}>
              <span>Half Days</span>
              <Clock size={14} color="#f59e0b" />
            </div>
            <div className={styles.monthlyStatVal} style={{ color: '#fbbf24' }}>
              {monthlySummary.halfDay}
            </div>
          </div>

          <div className={styles.monthlyStatCard}>
            <div className={styles.monthlyStatLabel}>
              <span>Absent</span>
              <XCircle size={14} color="#ef4444" />
            </div>
            <div className={styles.monthlyStatVal} style={{ color: '#f87171' }}>
              {monthlySummary.absent}
            </div>
          </div>

          <div className={styles.monthlyStatCard}>
            <div className={styles.monthlyStatLabel}>
              <span>On Leave</span>
              <AlertCircle size={14} color="#818cf8" />
            </div>
            <div className={styles.monthlyStatVal} style={{ color: '#a5b4fc' }}>
              {monthlySummary.leave}
            </div>
          </div>

          <div className={styles.monthlyStatCard}>
            <div className={styles.monthlyStatLabel}>
              <span>Total Duty Hours</span>
              <Clock size={14} color="#38bdf8" />
            </div>
            <div className={styles.monthlyStatVal} style={{ color: '#38bdf8' }}>
              {monthlySummary.totalDutyHours} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#94a3b8' }}>hrs</span>
            </div>
          </div>
        </div>

        {/* Calendar View */}
        <div className={styles.calendarContainer}>
          {/* Weekday Labels (Sun to Sat) with desktop/mobile variants */}
          <div className={styles.calendarWeekdaysRow}>
            {[
              { short: 'Sun', letter: 'S' },
              { short: 'Mon', letter: 'M' },
              { short: 'Tue', letter: 'T' },
              { short: 'Wed', letter: 'W' },
              { short: 'Thu', letter: 'T' },
              { short: 'Fri', letter: 'F' },
              { short: 'Sat', letter: 'S' },
            ].map((w, idx) => (
              <div
                key={w.short + idx}
                className={styles.calendarWeekdayLabel}
                style={{ color: idx === 0 ? '#f87171' : idx === 6 ? '#38bdf8' : '#94a3b8' }}
              >
                <span className={styles.calendarWeekdayDesktop}>{w.short}</span>
                <span className={styles.calendarWeekdayMobile}>{w.letter}</span>
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className={styles.calendarMonthGrid}>
            {/* Blanks before day 1 */}
            {blanks.map((b) => (
              <div key={`blank-${b}`} className={styles.calendarDayCellEmpty} />
            ))}

            {/* Actual Month Days */}
            {days.map(({ day, date }) => {
              const att = monthlyMap[date];
              const isToday = date === todayStr;
              const isSelected = date === selectedDate;

              return (
                <div
                  key={date}
                  onClick={() => handleDayClick(date)}
                  className={`${styles.calendarDayCell} ${isToday ? styles.calendarDayCellToday : ''} ${
                    isSelected ? styles.calendarDayCellActive : ''
                  }`}
                  title={`Date: ${date}${att ? ` | Status: ${att.attendance}${att.totalDutyHours ? ` (${att.totalDutyHours} hrs)` : ''}${att.remarks ? ` | ${att.remarks}` : ''}` : ' | Not marked'}. Click to mark status or view details.`}
                >
                  <div className={styles.calendarDayHeader}>
                    <span className={styles.calendarDayNum}>{day}</span>
                    {isToday && <span className={styles.calendarTodayBadge}>Today</span>}
                  </div>

                  <div style={{ marginTop: '0.2rem', display: 'flex', justifyContent: 'center' }}>
                    {att?.attendance === 'PRESENT' && (
                      <div className={styles.calendarStatusRow}>
                        <span className={`${styles.calendarLetterBadge} ${styles.badgeLetterP}`}>P</span>
                        <span className={styles.calendarStatusTextDesktop} style={{ color: '#34d399' }}>Present</span>
                      </div>
                    )}
                    {att?.attendance === 'HALF_DAY' && (
                      <div className={styles.calendarStatusRow}>
                        <span className={`${styles.calendarLetterBadge} ${styles.badgeLetterH}`}>H</span>
                        <span className={styles.calendarStatusTextDesktop} style={{ color: '#fbbf24' }}>Half Day</span>
                      </div>
                    )}
                    {att?.attendance === 'ABSENT' && (
                      <div className={styles.calendarStatusRow}>
                        <span className={`${styles.calendarLetterBadge} ${styles.badgeLetterA}`}>A</span>
                        <span className={styles.calendarStatusTextDesktop} style={{ color: '#f87171' }}>Absent</span>
                      </div>
                    )}
                    {att?.attendance === 'LEAVE' && (
                      <div className={styles.calendarStatusRow}>
                        <span className={`${styles.calendarLetterBadge} ${styles.badgeLetterL}`}>L</span>
                        <span className={styles.calendarStatusTextDesktop} style={{ color: '#a5b4fc' }}>Leave</span>
                      </div>
                    )}
                    {!att && (
                      <span className={styles.calendarUnmarkedDot}>•</span>
                    )}
                  </div>

                  {att && (att.totalDutyHours > 0 || att.dutyStartTime) ? (
                    <div className={styles.calendarDayDetails}>
                      <span>{att.totalDutyHours ? `${att.totalDutyHours}h` : ''}</span>
                      {att.dutyStartTime && (
                        <span className={styles.calendarPunchTimeDesktop}>
                          {att.dutyStartTime}{att.dutyEndTime ? `-${att.dutyEndTime}` : ''}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div style={{ height: '14px' }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Calendar Legend Bar */}
        <div className={styles.calendarLegendBar}>
          <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.78rem' }}>
            Status Key:
          </div>
          <div className={styles.calendarLegendItem}>
            <span className={`${styles.calendarLetterBadge} ${styles.badgeLetterP}`} style={{ width: '20px', height: '20px', fontSize: '0.65rem' }}>P</span>
            <span style={{ color: '#34d399', fontWeight: 600 }}>Present</span>
          </div>
          <div className={styles.calendarLegendItem}>
            <span className={`${styles.calendarLetterBadge} ${styles.badgeLetterH}`} style={{ width: '20px', height: '20px', fontSize: '0.65rem' }}>H</span>
            <span style={{ color: '#fbbf24', fontWeight: 600 }}>Half Day</span>
          </div>
          <div className={styles.calendarLegendItem}>
            <span className={`${styles.calendarLetterBadge} ${styles.badgeLetterA}`} style={{ width: '20px', height: '20px', fontSize: '0.65rem' }}>A</span>
            <span style={{ color: '#f87171', fontWeight: 600 }}>Absent</span>
          </div>
          <div className={styles.calendarLegendItem}>
            <span className={`${styles.calendarLetterBadge} ${styles.badgeLetterL}`} style={{ width: '20px', height: '20px', fontSize: '0.65rem' }}>L</span>
            <span style={{ color: '#a5b4fc', fontWeight: 600 }}>Leave</span>
          </div>
        </div>

        {/* Footer info note */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span>💡 Tip: Click on any date to quickly mark attendance in popup or scroll to the daily roster above.</span>
          {monthlyLoading && <span style={{ color: '#38bdf8' }}>Refreshing calendar...</span>}
        </div>
      </div>

      {/* Quick Mark Attendance Popup / Modal */}
      {modalDate && (
        <div className={styles.modalOverlay} onClick={() => setModalDate(null)}>
          <div
            className={styles.modalCard}
            style={{ maxWidth: '420px', width: '92%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle} style={{ fontSize: '1.05rem', margin: 0 }}>
                  Mark Driver Attendance
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#38bdf8', marginTop: '0.2rem', fontWeight: 600 }}>
                  📅 {new Date(modalDate).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalDate(null)}
                className={styles.modalCloseBtn}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
              {/* Selected Driver Banner */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  background: 'rgba(30, 41, 59, 0.6)',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(51, 65, 85, 0.5)',
                }}
              >
                <User size={16} color="#38bdf8" />
                <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.88rem' }}>
                  {selectedDriver?.fullName || 'Driver'}
                </span>
                {selectedDriver?.assignedVehicleId?.registrationNumber && (
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: 'auto' }}>
                    {selectedDriver.assignedVehicleId.registrationNumber}
                  </span>
                )}
              </div>

              {/* Status 1-Click Buttons */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '0.4rem' }}>
                  Select Status
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setPopupStatus('PRESENT');
                      if (!popupStartTime) setPopupStartTime('08:00');
                      if (!popupEndTime) setPopupEndTime('18:00');
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.2rem',
                      padding: '0.55rem 0.2rem',
                      borderRadius: '8px',
                      border: popupStatus === 'PRESENT' ? '2px solid #10b981' : '1px solid rgba(51, 65, 85, 0.6)',
                      background: popupStatus === 'PRESENT' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                      color: popupStatus === 'PRESENT' ? '#34d399' : '#94a3b8',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span className={`${styles.calendarLetterBadge} ${styles.badgeLetterP}`} style={{ width: '22px', height: '22px', fontSize: '0.7rem' }}>P</span>
                    <span>Present</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPopupStatus('HALF_DAY');
                      if (!popupStartTime) setPopupStartTime('08:00');
                      if (!popupEndTime) setPopupEndTime('13:00');
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.2rem',
                      padding: '0.55rem 0.2rem',
                      borderRadius: '8px',
                      border: popupStatus === 'HALF_DAY' ? '2px solid #f59e0b' : '1px solid rgba(51, 65, 85, 0.6)',
                      background: popupStatus === 'HALF_DAY' ? 'rgba(245, 158, 11, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                      color: popupStatus === 'HALF_DAY' ? '#fbbf24' : '#94a3b8',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span className={`${styles.calendarLetterBadge} ${styles.badgeLetterH}`} style={{ width: '22px', height: '22px', fontSize: '0.7rem' }}>H</span>
                    <span>Half Day</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPopupStatus('ABSENT');
                      setPopupStartTime('');
                      setPopupEndTime('');
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.2rem',
                      padding: '0.55rem 0.2rem',
                      borderRadius: '8px',
                      border: popupStatus === 'ABSENT' ? '2px solid #ef4444' : '1px solid rgba(51, 65, 85, 0.6)',
                      background: popupStatus === 'ABSENT' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                      color: popupStatus === 'ABSENT' ? '#f87171' : '#94a3b8',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span className={`${styles.calendarLetterBadge} ${styles.badgeLetterA}`} style={{ width: '22px', height: '22px', fontSize: '0.7rem' }}>A</span>
                    <span>Absent</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPopupStatus('LEAVE');
                      setPopupStartTime('');
                      setPopupEndTime('');
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.2rem',
                      padding: '0.55rem 0.2rem',
                      borderRadius: '8px',
                      border: popupStatus === 'LEAVE' ? '2px solid #818cf8' : '1px solid rgba(51, 65, 85, 0.6)',
                      background: popupStatus === 'LEAVE' ? 'rgba(129, 140, 248, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                      color: popupStatus === 'LEAVE' ? '#a5b4fc' : '#94a3b8',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span className={`${styles.calendarLetterBadge} ${styles.badgeLetterL}`} style={{ width: '22px', height: '22px', fontSize: '0.7rem' }}>L</span>
                    <span>Leave</span>
                  </button>
                </div>
              </div>

              {/* Punch Timings (if present or half-day) */}
              {(popupStatus === 'PRESENT' || popupStatus === 'HALF_DAY') && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>
                      Punch In
                    </label>
                    <input
                      type="time"
                      value={popupStartTime}
                      onChange={(e) => setPopupStartTime(e.target.value)}
                      className={styles.filterSelect}
                      style={{ width: '100%', padding: '0.45rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>
                      Punch Out
                    </label>
                    <input
                      type="time"
                      value={popupEndTime}
                      onChange={(e) => setPopupEndTime(e.target.value)}
                      className={styles.filterSelect}
                      style={{ width: '100%', padding: '0.45rem' }}
                    />
                  </div>
                </div>
              )}

              {/* Remarks */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>
                  Remarks (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. On-time duty, overtime, etc."
                  value={popupRemarks}
                  onChange={(e) => setPopupRemarks(e.target.value)}
                  className={styles.filterSelect}
                  style={{ width: '100%', padding: '0.45rem' }}
                />
              </div>
            </div>

            <div className={styles.modalFooter} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem' }}>
              <button
                type="button"
                onClick={scrollToDailyRoster}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#38bdf8',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  cursor: 'pointer',
                  padding: '0.2rem',
                }}
                title="Jump to daily roster view above"
              >
                Scroll to Daily Roster ↑
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setModalDate(null)}
                  className={styles.secondaryActionBtn}
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePopupAttendance}
                  disabled={popupSaving}
                  className={styles.primaryActionBtn}
                  style={{ padding: '0.45rem 1rem', fontSize: '0.82rem' }}
                >
                  <Save size={14} /> {popupSaving ? 'Saving...' : 'Save Status'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
