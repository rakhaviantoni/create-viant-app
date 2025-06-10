import { Component } from 'solid-js'

const ViantLogo: Component = () => {
  return (
    <svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="viant-logo logo"
    >
      <defs>
        <linearGradient id="viant-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ff6b6b" />
          <stop offset="50%" stop-color="#4ecdc4" />
          <stop offset="100%" stop-color="#45b7d1" />
        </linearGradient>
      </defs>
      
      {/* V shape */}
      <path
        d="M20 25 L35 65 L50 25 L65 65 L80 25"
        stroke="url(#viant-gradient)"
        stroke-width="4"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"
      />
      
      {/* Accent dots */}
      <circle cx="25" cy="75" r="3" fill="url(#viant-gradient)" />
      <circle cx="50" cy="75" r="3" fill="url(#viant-gradient)" />
      <circle cx="75" cy="75" r="3" fill="url(#viant-gradient)" />
    </svg>
  )
}

export default ViantLogo