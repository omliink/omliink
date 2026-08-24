export default function LoginIllustration() {
  return (
    <svg
      viewBox="0 0 240 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto h-full w-auto max-w-[300px]"
      role="img"
      aria-label="Illustration d'un bouclier de sécurité vérifié"
    >
      {/* orbiting verification dots */}
      <circle cx="120" cy="96" r="78" stroke="white" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="2 8" />
      <circle cx="48" cy="50" r="4" fill="white" fillOpacity="0.4" />
      <circle cx="196" cy="60" r="3" fill="white" fillOpacity="0.3" />
      <circle cx="190" cy="150" r="5" fill="white" fillOpacity="0.35" />
      <circle cx="42" cy="146" r="3" fill="white" fillOpacity="0.3" />

      {/* shield */}
      <path
        d="M120 24l52 18v46c0 42-24 68-52 80-28-12-52-38-52-80V42l52-18z"
        fill="white"
        fillOpacity="0.12"
      />
      <path
        d="M120 24l52 18v46c0 42-24 68-52 80-28-12-52-38-52-80V42l52-18z"
        stroke="white"
        strokeOpacity="0.55"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* checkmark inside shield */}
      <path
        d="M96 96l17 17 33-33"
        stroke="white"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* padlock badge, bottom-right of shield */}
      <g transform="translate(150,120)">
        <circle cx="24" cy="24" r="24" fill="white" />
        <rect x="14" y="22" width="20" height="16" rx="3" stroke="#4338ca" strokeWidth="2.5" fill="none" />
        <path d="M17 22v-4a7 7 0 0114 0v4" stroke="#4338ca" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <circle cx="24" cy="30" r="2.2" fill="#4338ca" />
      </g>
    </svg>
  )
}
