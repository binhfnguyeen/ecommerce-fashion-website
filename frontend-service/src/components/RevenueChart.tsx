import React, { useState } from 'react';
import { ChartDataResponse } from '../types/statistics';
import { formatCurrency } from '../utils/formatters';

interface RevenueChartProps {
  data: ChartDataResponse[];
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="chart-container-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '320px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>No chart statistics data available</p>
      </div>
    );
  }

  // Dimension settings
  const width = 600;
  const height = 250;
  const paddingLeft = 75;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxVal = Math.max(...data.map(d => d.revenue), 100000);
  const minVal = 0;
  const valueRange = maxVal - minVal;

  const points = data.map((d, i) => {
    const x = paddingLeft + (i / (data.length - 1 || 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((d.revenue - minVal) / (valueRange || 1)) * chartHeight;
    return { x, y, date: d.date, revenue: d.revenue };
  });

  // Construct line path
  const linePath = points.length > 0 
    ? `M ${points.map(p => `${p.x} ${p.y}`).join(' L ')}`
    : '';

  // Construct closed area path for gradient filling
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`
    : '';

  // Horizontal Grid Lines
  const gridLinesCount = 4;
  const gridLines = Array.from({ length: gridLinesCount + 1 }).map((_, i) => {
    const ratio = i / gridLinesCount;
    const val = minVal + ratio * valueRange;
    const y = paddingTop + chartHeight - ratio * chartHeight;
    return { y, value: val };
  });

  return (
    <div className="chart-container-card">
      <div className="chart-header">
        <h3 className="chart-title">Daily Revenue Chart</h3>
      </div>
      <div className="svg-chart-wrapper">
        <svg viewBox={`0 0 ${width} ${height}`} className="svg-chart" preserveAspectRatio="xMidYMid meet">
          <defs>
            {/* Gradient for Line */}
            <linearGradient id="chart-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#00f2fe" />
              <stop offset="100%" stopColor="#4facfe" />
            </linearGradient>
            {/* Gradient for Area Fill */}
            <linearGradient id="chart-area-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00d2ff" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#4facfe" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {gridLines.map((gl, i) => (
            <g key={i}>
              <line
                x1={paddingLeft}
                y1={gl.y}
                x2={width - paddingRight}
                y2={gl.y}
                className="chart-grid-line"
              />
              <text
                x={paddingLeft - 10}
                y={gl.y + 4}
                textAnchor="end"
                className="chart-axis-text"
              >
                {formatCurrency(gl.value).replace(' ₫', '')}
              </text>
            </g>
          ))}

          {/* Area Fill */}
          <path d={areaPath} className="chart-area" />

          {/* Path Line */}
          <path d={linePath} className="chart-line" />

          {/* Data Points */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={hoveredIndex === i ? 7 : 4.5}
              className="chart-dot"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          ))}

          {/* X Axis dates */}
          {points.map((p, i) => {
            const shouldDraw = data.length < 8 || i % Math.ceil(data.length / 7) === 0 || i === data.length - 1;
            if (!shouldDraw) return null;

            const dateParts = p.date.split('-');
            const displayDate = dateParts.length >= 3 ? `${dateParts[2]}/${dateParts[1]}` : p.date;

            return (
              <text
                key={i}
                x={p.x}
                y={paddingTop + chartHeight + 20}
                textAnchor="middle"
                className="chart-axis-text"
              >
                {displayDate}
              </text>
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <div
            className="chart-tooltip"
            style={{
              display: 'block',
              left: `${(points[hoveredIndex].x / width) * 100}%`,
              top: `${(points[hoveredIndex].y / height) * 100}%`,
            }}
          >
            <div style={{ color: 'var(--text-secondary)', fontSize: '10px', marginBottom: '2px' }}>
              {points[hoveredIndex].date}
            </div>
            <div style={{ color: 'var(--accent-primary)', fontSize: '13px', fontWeight: 'bold' }}>
              {formatCurrency(points[hoveredIndex].revenue)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
