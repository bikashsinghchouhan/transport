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
} from 'lucide-react';
import styles from './fleet.module.css';

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

  useEffect(() => {
    fetchAttendance(selectedDate);
  }, [selectedDate]);

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
        if (onRefreshStats) onRefreshStats();
      }
    } catch (err) {
      console.error('Update attendance failed:', err);
    } finally {
      setSavingDriverId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* Date Header & Quick Summary KPIs */}
      <div className={styles.filterBar}>
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
            {roster.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                  {loading ? 'Loading attendance roster...' : 'No active drivers found.'}
                </td>
              </tr>
            ) : (
              roster.map((item) => {
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

      {/* Mobile Responsive Roster Cards */}
      <div className={styles.mobileCardsGrid}>
        {roster.map((item) => {
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
        })}
      </div>
    </div>
  );
}
