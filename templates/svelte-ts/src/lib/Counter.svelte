<script lang="ts">
  let count: number = 0
  const increment = () => {
    count += 1
  }
</script>

<button on:click={increment}>
  count is {count}
</button>

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

<style>
  .features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin: 2rem 0;
    max-width: 800px;
  }

  .feature {
    padding: 1.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    text-align: left;
    transition: all 0.3s ease;
  }

  .feature:hover {
    border-color: #ff3e00;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 62, 0, 0.15);
  }

  .feature h3 {
    margin: 0 0 0.5rem 0;
    color: #ff3e00;
    font-size: 1.1rem;
  }

  .feature p {
    margin: 0;
    color: #64748b;
    font-size: 0.9rem;
    line-height: 1.5;
  }
</style>