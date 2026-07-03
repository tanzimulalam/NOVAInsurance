import React from 'react';
import { Database, Info } from 'lucide-react';

// Free-tier database limit is often cited as ~500 MB per project; used only as a
// rough visual reference — not an official Supabase API reading.
const REFERENCE_LIMIT_MB = 500;

const formatBytes = (bytes) => {
  if (!bytes || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const formatShortDay = (dayStr) => {
  const d = new Date(`${dayStr}T12:00:00`);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const fillDailyCounts = (dailyCounts = []) => {
  const map = new Map(dailyCounts.map((d) => [d.day, d.count]));
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ day: key, count: map.get(key) || 0 });
  }
  return days;
};

const UsagePanel = ({ stats, loading, error }) => {
  if (loading && !stats) {
    return (
      <div className="glass-panel usage-panel">
        <p style={{ color: 'var(--slate-500)' }}>Loading usage estimate...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel usage-panel usage-panel-error">
        <p><strong>Usage estimate unavailable.</strong> {error}</p>
      </div>
    );
  }

  if (!stats) return null;

  const estimatedBytes = Number(stats.estimated_bytes) || 0;
  const estimatedMb = estimatedBytes / (1024 * 1024);
  const refPercent = Math.min((estimatedMb / REFERENCE_LIMIT_MB) * 100, 100);
  const barTone = refPercent >= 85 ? 'critical' : refPercent >= 65 ? 'warning' : 'ok';

  const daily = fillDailyCounts(stats.daily_counts || []);
  const maxCount = Math.max(...daily.map((d) => d.count), 1);

  return (
    <div className="glass-panel usage-panel">
      <div className="usage-panel-head">
        <div>
          <h3 className="usage-panel-title">
            <Database size={20} /> Estimated data usage
          </h3>
          <p className="usage-panel-sub">
            Approximate size of lead records in your database — not official Supabase billing data.
          </p>
        </div>
        <div className="usage-panel-stat">
          <span className="usage-panel-stat-value">{formatBytes(estimatedBytes)}</span>
          <span className="usage-panel-stat-label">estimated lead data</span>
        </div>
      </div>

      <div className="usage-meter-wrap">
        <div className="usage-meter-labels">
          <span>0 MB</span>
          <span>~{REFERENCE_LIMIT_MB} MB reference (Free tier projects, approximate)</span>
        </div>
        <div className="usage-meter">
          <div className={`usage-meter-fill usage-meter-${barTone}`} style={{ width: `${refPercent}%` }} />
        </div>
        <p className="usage-meter-caption">
          ~{estimatedMb.toFixed(2)} MB of lead data vs. a rough {REFERENCE_LIMIT_MB} MB project reference line
          {refPercent >= 65 && ' — consider reviewing old leads or checking the Supabase Dashboard.'}
        </p>
      </div>

      <div className="usage-chart-section">
        <h4>Leads submitted — last 30 days</h4>
        <div className="usage-chart" role="img" aria-label="Bar chart of leads submitted per day for the last 30 days">
          {daily.map(({ day, count }) => (
            <div key={day} className="usage-bar-col" title={`${formatShortDay(day)}: ${count} lead(s)`}>
              <span className="usage-bar-value">{count > 0 ? count : ''}</span>
              <div className="usage-bar-track">
                <div className="usage-bar-fill" style={{ height: `${(count / maxCount) * 100}%` }} />
              </div>
              <span className="usage-bar-day">{formatShortDay(day)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="usage-disclaimer">
        <Info size={16} />
        <p>
          <strong>Estimate only — not 100% accurate.</strong> This counts probable lead form data
          (including ID photos stored as text). It does <em>not</em> include Supabase system overhead,
          indexes, auth tables, or other services. Official quota and storage numbers are in the
          Supabase Dashboard under <strong>Project Settings → Usage</strong>.
        </p>
      </div>
    </div>
  );
};

export default UsagePanel;
