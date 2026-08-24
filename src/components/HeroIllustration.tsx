export default function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 560 480"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
      role="img"
      aria-label="Illustration abstraite représentant un réseau de personnes connectées"
    >
      <defs>
        <linearGradient id="omliink-blob-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
        <linearGradient id="omliink-blob-b" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff5a3d" />
          <stop offset="100%" stopColor="#ff8a6d" />
        </linearGradient>
        <radialGradient id="omliink-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="280" cy="240" r="220" fill="url(#omliink-glow)" />

      <path
        d="M92 160c0-48 42-88 108-88 58 0 96 34 118 34 30 0 52-24 92-24 62 0 108 46 108 104 0 54-40 92-88 106-14 4-24 16-24 32 0 36-30 64-70 64-26 0-46-12-60-30-10-12-26-18-42-14-16 4-34 6-52 6-70 0-126-52-126-118 0-16 4-30 10-42-42-10-74-42-74-30z"
        fill="url(#omliink-blob-a)"
        opacity="0.12"
      />

      <circle cx="180" cy="200" r="46" fill="url(#omliink-blob-a)" />
      <circle cx="370" cy="150" r="34" fill="url(#omliink-blob-b)" />
      <circle cx="400" cy="310" r="52" fill="url(#omliink-blob-a)" opacity="0.9" />
      <circle cx="200" cy="350" r="28" fill="url(#omliink-blob-b)" opacity="0.9" />

      <g stroke="#c7d2fe" strokeWidth="2" strokeLinecap="round">
        <line x1="180" y1="200" x2="370" y2="150" />
        <line x1="180" y1="200" x2="400" y2="310" />
        <line x1="370" y1="150" x2="400" y2="310" />
        <line x1="200" y1="350" x2="400" y2="310" />
        <line x1="200" y1="350" x2="180" y2="200" />
      </g>

      <circle cx="180" cy="200" r="6" fill="#ffffff" />
      <circle cx="370" cy="150" r="5" fill="#ffffff" />
      <circle cx="400" cy="310" r="6" fill="#ffffff" />
      <circle cx="200" cy="350" r="5" fill="#ffffff" />

      <g transform="translate(160,180)">
        <rect width="40" height="40" rx="20" fill="#ffffff" opacity="0.9" />
        <path d="M10 20l6 6 14-14" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>

      <g transform="translate(378,292)">
        <rect width="36" height="36" rx="18" fill="#ffffff" opacity="0.9" />
        <path d="M9 18l5.5 5.5L27 10" stroke="#ff5a3d" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
    </svg>
  )
}
