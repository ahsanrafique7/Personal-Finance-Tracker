import React from 'react';

const Logo = ({ className = '', size = 24, strokeWidth = 2.5 }) => {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--accent-green-light, #34d399)" />
          <stop offset="100%" stopColor="var(--accent-blue, #3b82f6)" />
        </linearGradient>
        <filter id="logo-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {/* Geometric background shield shape */}
      <path
        d="M12 3L4 7v6c0 5.25 3.42 10.16 8 11 4.58-.84 8-5.75 8-11V7l-8-4z"
        stroke="url(#logo-gradient)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#logo-glow)"
      />
      {/* Upward geometric growth path */}
      <path
        d="M8 15l2.5-2.5 2.5 2.5 4-4"
        stroke="url(#logo-gradient)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Rupee / Currency stylized tick */}
      <path
        d="M12 8.5h3"
        stroke="var(--text-primary, #f1f5f9)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <circle cx="17" cy="11" r="1" fill="var(--text-primary, #f1f5f9)" />
    </svg>
  );
};

export default Logo;
