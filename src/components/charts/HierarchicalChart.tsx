import { useState } from 'react';
import { Select } from 'antd';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Cell, LabelList,
} from 'recharts';
import './HierarchicalChart.scss';

interface ChartItem {
  id:          string | number;
  name:        string;
  revenue:     number;
  image?:      string;
  branchName?: string;
}

interface HierarchicalChartProps {
  title?:          string;
  amount?:         string | number;
  period?:         string;
  data?:           ChartItem[];
  type?:           'sales' | 'trainers';
  onPeriodChange?: (value: string) => void;
}

const SALES_COLORS   = ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff'];
const TRAINER_COLORS = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'];

const initials = (name = '') =>
  name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

const fmt = (v: number) =>
  v >= 100000 ? `₹${(v / 100000).toFixed(1)}L`
  : v >= 1000  ? `₹${(v / 1000).toFixed(1)}K`
  : `₹${v}`;

/* ── Amount badge above avatar ───────────────────── */
const AmountLabel = (props: any) => {
  const { x, y, width, index, chartData, colors } = props;
  const item = chartData?.[index];
  if (!item) return null;

  const text    = `₹${item.revenue.toLocaleString('en-IN')}`;
  const color   = (colors as string[])?.[0] ?? '#6366f1';
  const bWidth  = Math.max(text.length * 7 + 14, 46);
  const bHeight = 20;
  const cx      = x + width / 2;
  const foY     = y - 26 - 6 - bHeight - 4;

  return (
    <foreignObject
      x={cx - bWidth / 2}
      y={foY}
      width={bWidth}
      height={bHeight}
      style={{ overflow: 'visible' }}
    >
      <div
        className="hc-bar-amount-badge"
        style={{
          animationDelay: `${index * 80}ms`,
          background: color,
          borderColor: color,
        }}
      >
        {text}
      </div>
    </foreignObject>
  );
};

/* ── Custom Bar Label (avatar on top) ────────────── */
const AvatarLabel = (props: any) => {
  const { x, y, width, index, chartData } = props;
  const item  = chartData?.[index];
  const cx    = x + width / 2;
  const size  = 26;
  const imgsz = size;

  if (!item) return null;

  return (
    <foreignObject
      x={cx - size / 2}
      y={y - size - 6}
      width={size}
      height={size}
      style={{ overflow: 'visible' }}
    >
      <div
        className="hc-bar-avatar"
        title={`${item.name}: ₹${item.revenue.toLocaleString('en-IN')}`}
      >
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            width={imgsz}
            height={imgsz}
            style={{ borderRadius: '50%', objectFit: 'cover' }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <span className="hc-bar-init">{initials(item.name)}</span>
        )}
      </div>
    </foreignObject>
  );
};

/* ── Component ───────────────────────────────────── */
const HierarchicalChart = ({
  title, amount, period = '', data = [], type = 'sales', onPeriodChange,
}: HierarchicalChartProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  const chartData  = Array.isArray(data) ? data : [];
  const colors     = type === 'trainers' ? TRAINER_COLORS : SALES_COLORS;
  const accentMain = colors[0];

  return (
    <div className="hc-card">

      {/* Header */}
      <div className="hc-header">
        <div className="hc-header-left">
          <span className="hc-dot-accent" style={{ background: accentMain }} />
          <span className="hc-title">{title}</span>
        </div>
        <div className="hc-header-r">
          {period !== '' && (
            <Select
              value={period}
              size="small"
              className="hc-select"
              onChange={onPeriodChange}
              options={[
                { value: '0',   label: 'This Month'    },
                { value: '1',   label: 'Last Month'    },
                { value: '3',   label: 'Last 3 Months' },
                { value: '6',   label: 'Last 6 Months' },
                { value: 'all', label: 'All Time'      },
              ]}
            />
          )}
          <div className="hc-total">
            <span className="hc-total-lbl">Total</span>
            <span className="hc-total-val">₹{amount}</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      {chartData.length === 0 ? (
        <div className="hc-empty">
          <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="hc-empty-svg">
            <rect x="8"  y="55" width="18" height="35" rx="4" opacity="0.15" fill="currentColor"/>
            <rect x="32" y="38" width="18" height="52" rx="4" opacity="0.15" fill="currentColor"/>
            <rect x="56" y="22" width="18" height="68" rx="4" opacity="0.15" fill="currentColor"/>
            <rect x="80" y="42" width="18" height="48" rx="4" opacity="0.15" fill="currentColor"/>
            <rect x="104" y="30" width="8"  height="60" rx="3" opacity="0.08" fill="currentColor"/>
            <circle cx="17" cy="49" r="7" opacity="0.2" fill="currentColor"/>
            <circle cx="41" cy="32" r="7" opacity="0.2" fill="currentColor"/>
            <circle cx="65" cy="16" r="7" opacity="0.2" fill="currentColor"/>
            <circle cx="89" cy="36" r="7" opacity="0.2" fill="currentColor"/>
            <polyline
              points="17,49 41,32 65,16 89,36"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="4 3"
              opacity="0.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="60" cy="52" r="18" fill="currentColor" opacity="0.06"/>
            <path
              d="M54 52h12M60 46v12"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.3"
            />
          </svg>
          <span className="hc-empty-text">No data for this period</span>
        </div>
      ) : (
        <div className="hc-chart-wrap">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={chartData}
              margin={{ top: 58, right: 10, left: -10, bottom: 20 }}
              barCategoryGap="30%"
              onMouseLeave={() => setHovered(null)}
            >
              <defs>
                {colors.map((c, i) => (
                  <linearGradient key={i} id={`hcGrad${type}${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={c} stopOpacity={1}    />
                    <stop offset="100%" stopColor={c} stopOpacity={0.45} />
                  </linearGradient>
                ))}
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--muted)"
                strokeOpacity={0.3}
              />
              <XAxis
                dataKey="name"
                tickFormatter={(v) => v.split(' ')[0]}
                tick={{ fill: 'var(--sider-text)', fontSize: 11, opacity: 0.5 }}
                axisLine={false}
                tickLine={false}
                interval={0}
              />
              <YAxis
                tickFormatter={fmt}
                tick={{ fill: 'var(--sider-text)', fontSize: 10, opacity: 0.4 }}
                axisLine={false}
                tickLine={false}
                width={46}
              />
              <Bar
                dataKey="revenue"
                radius={[8, 8, 3, 3]}
                onMouseEnter={(_: any, index: number) => setHovered(index)}
                isAnimationActive={true}
                animationDuration={600}
                animationEasing="ease-out"
              >
                {chartData.map((_, idx) => (
                  <Cell
                    key={idx}
                    fill={`url(#hcGrad${type}${Math.min(idx, colors.length - 1)})`}
                    opacity={hovered === null || hovered === idx ? 1 : 0.45}
                    style={{ transition: 'opacity .2s' }}
                  />
                ))}
                <LabelList
                  content={(props: any) => (
                    <AmountLabel {...props} chartData={chartData} colors={colors} />
                  )}
                />
                <LabelList
                  content={(props: any) => (
                    <AvatarLabel {...props} chartData={chartData} />
                  )}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default HierarchicalChart;
