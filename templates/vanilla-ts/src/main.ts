import './style.css';
import { setupCounter } from './counter.ts';
import { createViantLogo } from './viant-logo.ts';
import typescriptLogo from './typescript.svg';
import viteLogo from '/vite.svg';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank">
      <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
    </a>
  </div>
  ${createViantLogo()}
  <h1>Vite + TypeScript</h1>

  <div class="card">
    <button id="counter" type="button"></button>
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
      <p>Choose from CSS, Sass, Tailwind, or any styling solution</p>
    </div>
    <div class="feature">
      <h3>🌟 Rich Ecosystem</h3>
      <p>Access to the entire JavaScript ecosystem</p>
    </div>
  </div>

  <p class="read-the-docs">
    Click on the Vite and TypeScript logos to learn more
  </p>
`;

setupCounter(document.querySelector<HTMLButtonElement>('#counter')!);