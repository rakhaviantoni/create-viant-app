export function createViantLogo() {
  return `
    <div class="viant-logo">
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="viant-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#646cff" />
            <stop offset="100%" stop-color="#61dafb" />
          </linearGradient>
        </defs>
        
        <!-- Main V shape -->
        <path
          d="M20 20 L60 80 L100 20 L85 20 L60 55 L35 20 Z"
          fill="url(#viant-gradient)"
        />
        
        <!-- Accent dots -->
        <circle cx="30" cy="100" r="4" fill="url(#viant-gradient)" opacity="0.8" />
        <circle cx="60" cy="100" r="4" fill="url(#viant-gradient)" opacity="0.6" />
        <circle cx="90" cy="100" r="4" fill="url(#viant-gradient)" opacity="0.8" />
      </svg>
    </div>
  `;
}