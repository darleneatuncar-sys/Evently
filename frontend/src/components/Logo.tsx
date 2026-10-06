import { useId } from 'react'

interface LogoProps {
  className?: string
}

function Logo({ className = 'h-8 w-8' }: LogoProps) {
  const uid = useId().replace(/:/g, '')
  const gradientId = `logo-grad-${uid}`

  return (
    <svg viewBox="0 0 36 40" className={className} role="img" aria-label="Evently" fill="none">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#d8ccff" />
          <stop offset="45%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#5b21b6" />
        </linearGradient>
      </defs>

      {/* extrusion (3D depth) */}
      <g fill="#3b0764" transform="translate(1.7 1.7)">
        <rect x="4" y="4" width="10" height="32" rx="4.5" />
        <rect x="4" y="4" width="28" height="10" rx="4.5" />
        <rect x="4" y="15" width="16" height="9" rx="4" />
        <rect x="4" y="26" width="28" height="10" rx="4.5" />
      </g>

      {/* face */}
      <g fill={`url(#${gradientId})`}>
        <rect x="4" y="4" width="10" height="32" rx="4.5" />
        <rect x="4" y="4" width="28" height="10" rx="4.5" />
        <rect x="4" y="15" width="16" height="9" rx="4" />
        <rect x="4" y="26" width="28" height="10" rx="4.5" />
      </g>

      {/* sparkle */}
      <path
        d="M25 14.6 Q25.9 18.6 29.9 19.5 Q25.9 20.4 25 24.4 Q24.1 20.4 20.1 19.5 Q24.1 18.6 25 14.6 Z"
        fill="#ede9fe"
      />
    </svg>
  )
}

export default Logo
