import './style.css';
import { setupCounter } from './counter.js';
import { createViantLogo } from './viant-logo.js';
import javascriptLogo from './javascript.svg';
import viteLogo from '/vite.svg';

document.querySelector('#app').innerHTML = `
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
      <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
    </a>
  </div>
  ${createViantLogo()}
  <h1>Vite + JavaScript</h1>

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
    Click on the Vite and JavaScript logos to learn more
  </p>
`;

setupCounter(document.querySelector('#counter'));