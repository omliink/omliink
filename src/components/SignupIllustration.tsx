function PersonGlyph({ scale = 1 }: { scale?: number }) {
  return (
    <g transform={`scale(${scale})`}>
      <circle cx="0" cy="-11" r="8" fill="white" />
      <path d="M-15 16c0-10 6.7-17 15-17s15 7 15 17" fill="white" />
    </g>
  )
}

export default function SignupIllustration() {
  return (
    <svg
      viewBox="0 0 240 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto h-full w-auto max-w-[300px]"
      role="img"
      aria-label="Illustration d'une communauté de particuliers connectés"
    >
      {/* connecting network lines */}
      <g stroke="white" strokeOpacity="0.4" strokeWidth="2" strokeDasharray="3 6" strokeLinecap="round">
        <line x1="66" y1="76" x2="120" y2="128" />
        <line x1="174" y1="76" x2="120" y2="128" />
        <line x1="66" y1="76" x2="174" y2="76" />
      </g>

      {/* avatar: top-left */}
      <circle cx="66" cy="76" r="30" fill="white" fillOpacity="0.16" />
      <g transform="translate(66,76)">
        <PersonGlyph scale={0.9} />
      </g>

      {/* avatar: top-right */}
      <circle cx="174" cy="76" r="30" fill="white" fillOpacity="0.16" />
      <g transform="translate(174,76)">
        <PersonGlyph scale={0.9} />
      </g>

      {/* avatar: front-center, larger */}
      <circle cx="120" cy="140" r="40" fill="white" fillOpacity="0.2" />
      <g transform="translate(120,140)">
        <PersonGlyph scale={1.2} />
      </g>

      {/* welcome badge at the network's center */}
      <g transform="translate(120,90)">
        <circle cx="0" cy="0" r="18" fill="white" />
        <path
          d="M0 7.5C-6 2.5-10-1-10-6c0-3.3 2.5-6 5.6-6 2 0 3.6 1 4.4 2.6C0.8-11 2.4-12 4.4-12 7.5-12 10-9.3 10-6c0 5-4 8.5-10 13.5z"
          fill="#ff5a3d"
        />
      </g>
    </svg>
  )
}
