import { useState } from 'preact/hooks';
import preactLogo from './assets/preact.svg';
import viteLogo from '/vite.svg';
import { ViantLogo } from './ViantLogo';
import './app.css';

export function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} class="logo" alt="Vite logo" />
        </a>
        <a href="https://preactjs.com" target="_blank">
          <img src={preactLogo} class="logo preact" alt="Preact logo" />
        </a>
      </div>
      <ViantLogo />
      <h1>Vite + Preact</h1>

      <div class="card">
        <button onClick={() => setCount((count: number) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/app.tsx</code> and save to test HMR
        </p>
      </div>

      <div class="features">
        <div class="feature">
          <h3>⚡ Speed</h3>
          <p>Lightning-fast development with Vite's instant HMR</p>
        </div>
        <div class="feature">
          <h3>🔒 Type Safety</h3>
          <p>Full TypeScript support for robust development</p>
        </div>
        <div class="feature">
          <h3>🎨 Styling Flexibility</h3>
          <p>Choose from CSS, Sass, Tailwind, or styled-components</p>
        </div>
        <div class="feature">
          <h3>🌟 Rich Ecosystem</h3>
          <p>Access to the entire Preact and React ecosystem</p>
        </div>
      </div>

      <p class="read-the-docs">
        Click on the Vite and Preact logos to learn more
      </p>
    </>
  );
}