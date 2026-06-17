import React from 'react';

// Green Income Icon - modern deposit/inflow SVG
export const IncomeIcon = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{ color: 'var(--accent-green)' }}
  >
    <path d="M19 12V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" />
    <path d="M12 15V3" />
    <path d="m9 6 3-3 3 3" />
  </svg>
);

// Red Expense Icon - modern withdrawal/outflow SVG
export const ExpenseIcon = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{ color: 'var(--accent-red)' }}
  >
    <path d="M19 12V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" />
    <path d="M12 3v12" />
    <path d="m9 12 3 3 3-3" />
  </svg>
);

// Blue Net Savings / Bank Icon - modern institutional/safe vault building SVG
export const SavingsIcon = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{ color: 'var(--accent-blue)' }}
  >
    <path d="M3 21h18" />
    <path d="M19 21v-8" />
    <path d="M5 21v-8" />
    <path d="M9 21v-8" />
    <path d="M15 21v-8" />
    <path d="m20 10-8-5-8 5" />
    <path d="M12 2v3" />
  </svg>
);

// Gold Savings Rate / Percentage Icon - modern percentage SVG
export const SavingsRateIcon = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{ color: 'var(--accent-gold)' }}
  >
    <line x1="19" y1="5" x2="5" y2="19" />
    <circle cx="6.5" cy="6.5" r="2.5" fill="none" />
    <circle cx="17.5" cy="17.5" r="2.5" fill="none" />
  </svg>
);
