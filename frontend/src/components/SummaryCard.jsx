import { useEffect, useRef } from 'react';
import { formatCurrency, formatPercent } from '../utils/formatters.js';

const ICONS = {
  budget: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  ),
  spent: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  ),
  remaining: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
      <path d="M9 12h6M12 9v6" />
    </svg>
  ),
  percent: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <line x1="19" y1="5" x2="5" y2="19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  ),
};

const WARNING_COLORS = {
  safe: 'var(--color-safe)',
  warning: 'var(--color-warning)',
  danger: 'var(--color-danger)',
};

// Animated number counter using requestAnimationFrame
const useCountUp = (target, duration = 400) => {
  const ref = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    if (ref.current === null || target === undefined) return;
    const start = 0;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOut cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      ref.current = start + (target - start) * eased;
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        ref.current = target;
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);
};

const SummaryCard = ({ title, value, type = 'budget', warning = 'safe', isPercent = false, subtitle, currency = 'INR' }) => {
  const displayColor = WARNING_COLORS[warning] || WARNING_COLORS.safe;
  const icon = ICONS[type] || ICONS.budget;

  return (
    <div
      className="rounded-2xl border p-6 fade-in-up relative overflow-hidden"
      style={{
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        borderLeftWidth: '3px',
        borderLeftColor: displayColor,
      }}
    >
      {/* Icon */}
      <div
        className="flex items-center justify-between mb-4"
      >
        <span style={{ color: 'var(--color-text-muted)', fontSize: '13px', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {title}
        </span>
        <span style={{ color: displayColor, opacity: 0.8 }}>{icon}</span>
      </div>

      {/* Value */}
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '1.75rem',
          fontWeight: 600,
          color: isPercent ? displayColor : 'var(--color-text)',
          lineHeight: 1,
          marginBottom: '8px',
        }}
      >
        {isPercent ? formatPercent(value) : formatCurrency(value, currency)}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <p style={{ color: 'var(--color-text-muted)', fontSize: '12px', margin: 0 }}>{subtitle}</p>
      )}
    </div>
  );
};

export default SummaryCard;
