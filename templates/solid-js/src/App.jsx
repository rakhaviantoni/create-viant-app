import { createSignal } from 'solid-js'
import solidLogo from './assets/solid.svg'
import viteLogo from '/vite.svg'
import ViantLogo from './components/ViantLogo'
import './App.css'

function App() {
  const [count, setCount] = createSignal(0)

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} class="logo" alt="Vite logo" />
        </a>
        <a href="https://solidjs.com" target="_blank">
          <img src={solidLogo} class="logo solid" alt="Solid logo" />
        </a>
        <ViantLogo />
      </div>
      <h1>Viant + Solid</h1>

      <div class="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count()}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>

      <div class="features">
        <div class="feature">
          <h3>⚡️ Lightning Fast</h3>
          <p>Powered by Vite for instant dev server and optimized builds</p>
        </div>
        
        <div class="feature">
          <h3>🎯 Type Safe</h3>
          <p>Full TypeScript support with excellent IDE integration</p>
        </div>
        
        <div class="feature">
          <h3>🎨 Flexible Styling</h3>
          <p>Choose from Tailwind, CSS Modules, Sass, and more</p>
        </div>
        
        <div class="feature">
          <h3>📦 Rich Ecosystem</h3>
          <p>Optional PWA, testing, linting, and deployment configs</p>
        </div>
      </div>

      <p class="read-the-docs">
        Click on the Vite, Solid, and Viant logos to learn more
      </p>
    </>
  )
}

export default App