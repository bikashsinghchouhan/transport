'use client';

import React, { useState } from 'react';
import styles from './fleet.module.css';

interface TrendItem {
  date: string;
  label: string;
  revenue: number;
  expense: number;
  trips: number;
}

interface ExpenseCategory {
  category: string;
  amount: number;
  color: string;
}

interface VehiclePerf {
  vehicleId?: string;
  registrationNumber: string;
  model: string;
  vehicleType: string;
  trips: number;
  totalKm: number;
  revenue: number;
  expense: number;
  profit: number;
}

interface FleetChartsProps {
  trend14Days: TrendItem[];
  expenseBreakdown: ExpenseCategory[];
  vehiclePerformance: VehiclePerf[];
}

export function RevenueExpenseTrendChart({ data }: { data: TrendItem[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <div style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>No trend data available</div>;
  }

  const maxVal = Math.max(...data.map((d) => Math.max(d.revenue, d.expense)), 1000);
  const chartHeight = 180;
  const chartWidth = 580;
  const paddingX = 40;
  const stepX = (chartWidth - paddingX * 2) / (data.length - 1 || 1);

  return (
    <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight + 45}`}
        style={{ width: '100%', height: 'auto', display: 'block', maxWidth: '100%' }}
      >
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#e11d48" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
          const y = chartHeight - pct * chartHeight + 10;
          return (
            <g key={idx}>
              <line x1={paddingX} y1={y} x2={chartWidth - paddingX} y2={y} stroke="rgba(51, 65, 85, 0.4)" strokeDasharray="3 3" />
              <text x={paddingX - 6} y={y + 3} textAnchor="end" fill="#64748b" fontSize="9">
                ₹{Math.round((maxVal * pct) / 1000)}k
              </text>
            </g>
          );
        })}

        {/* Grouped Bars */}
        {data.map((item, idx) => {
          const cx = paddingX + idx * stepX;
          const barW = Math.max(6, Math.min(14, stepX * 0.35));
          const revH = (item.revenue / maxVal) * chartHeight;
          const expH = (item.expense / maxVal) * chartHeight;
          const isHovered = hoveredIdx === idx;

          return (
            <g
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Highlight background bar on hover */}
              {isHovered && (
                <rect
                  x={cx - stepX * 0.45}
                  y={10}
                  width={stepX * 0.9}
                  height={chartHeight}
                  fill="rgba(56, 189, 248, 0.08)"
                  rx="4"
                />
              )}

              {/* Revenue bar */}
              <rect
                x={cx - barW - 1}
                y={chartHeight - revH + 10}
                width={barW}
                height={Math.max(2, revH)}
                fill="url(#revGrad)"
                stroke="#38bdf8"
                strokeWidth="1"
                rx="3"
              />

              {/* Expense bar */}
              <rect
                x={cx + 1}
                y={chartHeight - expH + 10}
                width={barW}
                height={Math.max(2, expH)}
                fill="url(#expGrad)"
                stroke="#f43f5e"
                strokeWidth="1"
                rx="3"
              />

              {/* X Axis Labels */}
              {(idx % 2 === 0 || idx === data.length - 1) && (
                <text x={cx} y={chartHeight + 28} textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="500">
                  {item.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Tooltip on hover */}
      {hoveredIdx !== null && data[hoveredIdx] && (
        <div
          style={{
            position: 'absolute',
            top: '0px',
            right: '10px',
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '8px',
            padding: '0.5rem 0.75rem',
            fontSize: '0.75rem',
            boxShadow: '0 8px 16px rgba(0,0,0,0.5)',
            zIndex: 10,
          }}
        >
          <div style={{ fontWeight: 600, color: '#ffffff', marginBottom: '0.2rem' }}>
            {data[hoveredIdx].date} ({data[hoveredIdx].trips} trips)
          </div>
          <div style={{ color: '#38bdf8' }}>Revenue: ₹{data[hoveredIdx].revenue.toLocaleString()}</div>
          <div style={{ color: '#f43f5e' }}>Expense: ₹{data[hoveredIdx].expense.toLocaleString()}</div>
          <div style={{ color: '#4ade80', fontWeight: 600 }}>
            Net Profit: ₹{(data[hoveredIdx].revenue - data[hoveredIdx].expense).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}

export function ExpenseDonutChart({ data }: { data: ExpenseCategory[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const totalExpense = data.reduce((sum, item) => sum + (item.amount || 0), 0);

  if (totalExpense === 0) {
    return <div style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>No expenses recorded yet</div>;
  }

  // Calculate angles for Donut slices
  let cumulativeAngle = 0;
  const radius = 65;
  const strokeWidth = 24;
  const center = 90;

  const slices = data
    .filter((d) => d.amount > 0)
    .map((item, idx) => {
      const percentage = (item.amount / totalExpense) * 100;
      const angle = (item.amount / totalExpense) * 360;
      const startAngle = cumulativeAngle;
      cumulativeAngle += angle;

      // SVG circle stroke dash calculation
      const circumference = 2 * Math.PI * radius;
      const strokeDashoffset = circumference - (angle / 360) * circumference;
      const rotation = startAngle - 90;

      return {
        ...item,
        angle,
        startAngle,
        percentage: Math.round(percentage * 10) / 10,
        circumference,
        strokeDashoffset,
        rotation,
        idx,
      };
    });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '100%' }}>
      <div style={{ position: 'relative', width: '180px', height: '180px' }}>
        <svg viewBox="0 0 180 180" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
          {slices.map((slice) => {
            const isHovered = hoveredIdx === slice.idx;
            return (
              <circle
                key={slice.idx}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={`${(slice.angle / 360) * slice.circumference} ${slice.circumference}`}
                strokeDashoffset={-((slice.startAngle || 0) / 360) * slice.circumference}
                style={{
                  cursor: 'pointer',
                  transition: 'stroke-width 0.2s ease, opacity 0.2s ease',
                  opacity: hoveredIdx !== null && !isHovered ? 0.6 : 1,
                }}
                onMouseEnter={() => setHoveredIdx(slice.idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>

        {/* Central Display */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>
            {hoveredIdx !== null ? slices.find((s) => s.idx === hoveredIdx)?.category : 'Total'}
          </span>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
            ₹
            {hoveredIdx !== null
              ? (slices.find((s) => s.idx === hoveredIdx)?.amount || 0).toLocaleString()
              : totalExpense.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Categories Legend */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem 0.8rem', width: '100%' }}>
        {data
          .filter((d) => d.amount > 0)
          .map((item, idx) => (
            <div
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                cursor: 'pointer',
                padding: '0.2rem 0.4rem',
                borderRadius: '6px',
                background: hoveredIdx === idx ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
                <span style={{ color: '#cbd5e1' }}>{item.category}</span>
              </div>
              <span style={{ color: '#94a3b8', fontWeight: 600 }}>₹{item.amount.toLocaleString()}</span>
            </div>
          ))}
      </div>
    </div>
  );
}

export function VehiclePerformanceChart({ vehicles }: { vehicles: VehiclePerf[] }) {
  if (!vehicles || vehicles.length === 0) {
    return <div style={{ color: '#64748b', textAlign: 'center', padding: '1.5rem' }}>No vehicle data recorded yet</div>;
  }

  const maxRevenue = Math.max(...vehicles.map((v) => v.revenue), 1000);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', width: '100%' }}>
      {vehicles.map((v, idx) => {
        const revPct = Math.min(100, Math.round((v.revenue / maxRevenue) * 100));
        const expPct = Math.min(100, Math.round((v.expense / maxRevenue) * 100));

        return (
          <div
            key={idx}
            style={{
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(51, 65, 85, 0.6)',
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontWeight: 700, color: '#ffffff', marginRight: '0.5rem' }}>
                  {v.registrationNumber}
                </span>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  {v.model} • {v.trips} trips ({v.totalKm} km)
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#4ade80' }}>
                  Profit: ₹{v.profit.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Comparison bar */}
            <div style={{ height: '8px', width: '100%', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
              <div
                style={{
                  height: '100%',
                  width: `${revPct}%`,
                  background: 'linear-gradient(90deg, #0284c7, #38bdf8)',
                  borderRadius: '4px',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8' }}>
              <span>Revenue: ₹{v.revenue.toLocaleString()}</span>
              <span>Expenses: ₹{v.expense.toLocaleString()}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
