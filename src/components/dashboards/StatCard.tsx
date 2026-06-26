import React from 'react';
import './StatCard.scss';

interface StatCardProps {
  title:    string;
  value:    string | number;
  icon:     React.ReactElement;
  color:    string;
  trend?:   { value: number; up: boolean };
  subtitle?: string;
}

const StatCard = ({ title, value, icon, color, trend, subtitle }: StatCardProps) => (
  <div className="db-stat-card">
    <div className="db-stat-icon" style={{ background: `${color}18`, color }}>
      {icon}
    </div>
    <div className="db-stat-body">
      <p className="db-stat-title">{title}</p>
      <h3 className="db-stat-value">{value}</h3>
      {trend && (
        <span className={`db-stat-trend ${trend.up ? 'up' : 'down'}`}>
          {trend.up ? '▲' : '▼'} {Math.abs(trend.value)}%
        </span>
      )}
      {subtitle && <span className="db-stat-sub">{subtitle}</span>}
    </div>
  </div>
);

export default StatCard;
