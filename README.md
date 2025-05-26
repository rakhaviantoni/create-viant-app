# Viant - Modern React App Builder

<p align="center">
  <img src="https://via.placeholder.com/200x200?text=Viant" alt="Viant Logo" width="200" height="200">
</p>

<p align="center">
  <strong>Create modern React apps with Vite - choose between TypeScript or JavaScript templates with optional Tailwind CSS and PWA support</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#templates">Templates</a> •
  <a href="#styling">Styling</a> •
  <a href="#development">Development</a> •
  <a href="#deployment">Deployment</a>
</p>

## ✨ Introduction

Viant is a modern, fast, and lightweight React template builder designed to get you up and running with a well-structured React application in seconds. It leverages the latest technologies and best practices to provide an exceptional developer experience.

## 🚀 Quick Start

### Create Your App

```bash
# Using Bun (recommended - fastest)
bun create viant-app my-awesome-app

# Using npm
npm create viant-app my-awesome-app

# Using pnpm
pnpm create viant-app my-awesome-app

# Using yarn
yarn create viant-app my-awesome-app
```

### Interactive Setup

The CLI will guide you through:
- **Template Selection**: Choose between react-ts and react-js
- **Styling Choice**: TailwindCSS, Styled Components, CSS Modules, or Sass
- **Package Manager**: Auto-detected or manually selected
- **Additional Features**: PWA, Bundle Analyzer, GitHub Actions, Docker, etc.

### Start Development

```bash
cd my-awesome-app
bun dev  # or npm run dev
```

## 🔥 Features

| Feature | Technology | Description |
|---------|------------|-------------|
| **Framework** | React 18 | Latest features with concurrent rendering |
| **Build Tool** | Vite | Lightning-fast HMR and optimized builds |
| **Language** | TypeScript/JavaScript (JSX) | Type safety and better developer experience/Modern JavaScript with JSX syntax |
| **Styling** | TailwindCSS | Utility-first, highly customizable CSS |
| **Linting** | Biome | Modern, fast, and opinionated linter and formatter |
| **Testing** | Vitest | Fast unit testing with React Testing Library |
| **Optimization** | Built-in | Code splitting, tree shaking, and more |
| **DevEx** | Scripts | Helper scripts for development and deployment |

## 📋 Templates

Viant offers templates to suit your needs:

### React + TypeScript (`react-ts`)

A comprehensive template featuring React with TypeScript, powered by Vite. Includes a solid foundation with optional Tailwind CSS and PWA support. Perfect for projects prioritizing type safety and a rich development experience.

```bash
bun create viant-app my-awesome-app --template=react-ts
```

### React + JavaScript (`react-js`)

A minimal template featuring React with JavaScript (JSX), powered by Vite. Offers a lightweight setup with optional Tailwind CSS and PWA support. Ideal for simpler projects or when you prefer plain JavaScript.

```bash
bun create viant-app my-awesome-app --template=react-js
```

## 🎨 Styling Options

Viant supports multiple styling approaches:

### TailwindCSS (Default)

```typescript
// Utility-first CSS classes
<button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
  Click me
</button>

// Using the clsx utility for conditional classes
import { clsx } from 'clsx'

<div className={clsx(
  'base-classes',
  condition && 'conditional-classes'
)}>
```

### Styled Components

```typescript
import styled from 'styled-components'

const Button = styled.button`
  padding: 0.5rem 1rem;
  background: #2563eb;
  color: white;
  border-radius: 0.375rem;
  
  &:hover {
    background: #1d4ed8;
  }
`
```

### CSS Modules

```typescript
import styles from './Button.module.css'

<button className={styles.primary}>Click me</button>
```

### Sass/SCSS

```scss
// styles/components.scss
.button {
  padding: 0.5rem 1rem;
  background: #2563eb;
  color: white;
  border-radius: 0.375rem;
  
  &:hover {
    background: #1d4ed8;
  }
}
```

## 📁 Project Structure

```
my-awesome-app/
├── public/
│   ├── icons/           # App icons and favicon
│   ├── manifest.json    # PWA manifest (if enabled)
│   └── robots.txt       # SEO robots file
├── src/
│   ├── components/
│   │   ├── ui/          # Reusable UI components
│   │   │   ├── Button.tsx/jsx
│   │   │   └── Card.tsx/jsx
│   │   └── layout/      # Layout components
│   │       └── Header.tsx/jsx
│   ├── hooks/           # Custom React hooks
│   │   └── useLocalStorage.ts/js
│   ├── utils/           # Utility functions
│   │   ├── cn.ts/js        # className utility
│   │   └── constants.ts/js # App constants
│   ├── styles/          # CSS files
│   │   ├── globals.css  # Global styles
│   │   └── components.css
│   ├── types/           # TypeScript type definitions
│   │   └── index.ts
│   ├── App.tsx/jsx          # Main app component
│   ├── main.tsx/jsx         # App entry point
│   └── vite-env.d.ts/js    # Vite type definitions
├── tests/               # Test files
│   ├── setup.ts/js         # Test setup
│   └── App.test.tsx/jsx     # Component tests
├── scripts/             # Helper scripts
│   ├── dev.sh           # Development helper
│   └── deploy.sh        # Deployment script
├── .github/             # GitHub configuration (if enabled)
│   └── workflows/
│       └── ci.yml       # CI/CD pipeline
├── biome.json           # Biome configuration
├── tailwind.config.ts/js   # TailwindCSS config
├── vite.config.ts/js       # Vite configuration
├── vitest.config.ts/js     # Testing configuration
├── tsconfig.json        # TypeScript config
├── package.json         # Dependencies and scripts
├── README.md
└── LICENSE
```

## 🛠 Development Workflow

### Using the Development Script

Viant comes with a powerful development helper script that simplifies common tasks:

```bash
# Make scripts executable
chmod +x scripts/dev.sh scripts/deploy.sh

# Start development server
./scripts/dev.sh dev

# Run tests in different modes
./scripts/dev.sh test          # Run once
./scripts/dev.sh test watch    # Watch mode
./scripts/dev.sh test ui       # UI mode
./scripts/dev.sh test coverage # Coverage report

# Code quality
./scripts/dev.sh lint          # Check linting
./scripts/dev.sh lint fix      # Fix issues
./scripts/dev.sh lint format   # Format code
./scripts/dev.sh type-check    # TypeScript check

# Project management
./scripts/dev.sh build         # Build for production
./scripts/dev.sh preview       # Preview build
./scripts/dev.sh analyze       # Bundle analysis
./scripts/dev.sh health        # Health check
./scripts/dev.sh clean         # Clean artifacts
./scripts/dev.sh info          # Project info
```

### Manual Commands

```bash
# Development
bun dev                # Start dev server
bun build              # Build for production
bun preview            # Preview build

# Testing
bun test               # Run tests
bun test:ui            # UI testing
bun test:coverage      # Coverage report

# Code Quality
bun lint               # Check code
bun lint:fix           # Fix issues
bun format             # Format code
bun type-check         # Type checking

# Analysis
bun analyze            # Bundle analysis (if configured)
```

## 🧪 Testing

### Component Testing

```typescript
// tests/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/Button'

test('button renders and handles click', () => {
  const handleClick = vi.fn()
  render(<Button onClick={handleClick}>Click me</Button>)
  
  const button = screen.getByRole('button')
  fireEvent.click(button)
  
  expect(handleClick).toHaveBeenCalledOnce()
})
```

### Testing Commands

```bash
# Run all tests
bun test

# Watch mode for development
bun test --watch

# UI mode with browser interface
bun test:ui

# Generate coverage report
bun test:coverage
```

## 🚢 Deployment

### Using the Deployment Script

```bash
# Deploy to different platforms
./scripts/deploy.sh vercel     # Vercel (default)
./scripts/deploy.sh netlify    # Netlify
./scripts/deploy.sh github     # GitHub Pages
./scripts/deploy.sh firebase   # Firebase Hosting
./scripts/deploy.sh docker     # Build Docker image
```

### Manual Deployment

#### Vercel
```bash
npm i -g vercel
vercel --prod
```

#### Netlify
```bash
npm i -g netlify-cli
bun build
netlify deploy --prod --dir=dist
```

#### GitHub Pages
```bash
# Build with correct base path
bun build --base=/repository-name/

# Or use the automated script
./scripts/deploy.sh github
```

#### Docker
```bash
# Build image
docker build -t viant-app .

# Run container
docker run -p 3000:80 viant-app
```

## 🔧 Configuration

### Environment Variables
```bash
# .env.local
VITE_APP_TITLE="My Awesome App"
VITE_APP_VERSION="1.0.0"
```

```typescript
// Access in code
const title = import.meta.env.VITE_APP_TITLE
```

### Vite Configuration
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['clsx']
        }
      }
    }
  }
})
```

### TypeScript Paths
```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/hooks/*": ["./src/hooks/*"]
    }
  }
}
```

## 📊 Performance Optimization

### Code Splitting
```typescript
// Lazy load components
import { lazy, Suspense } from 'react'

const Dashboard = lazy(() => import('./Dashboard'))

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Dashboard />
    </Suspense>
  )
}
```

### Bundle Analysis
```bash
# Analyze bundle size
bun analyze

# Or manually
bun add -D vite-bundle-analyzer
bun build && npx vite-bundle-analyzer dist
```

### PWA Features (Full Template)
```typescript
// Service worker registration is automatic
// Customize in vite.config.ts/js PWA options
```

## 🔍 What's Different?

### vs Create React App
- **Modern Tooling** - Vite instead of Webpack
- **Faster** - Bun runtime support
- **Lighter** - No ejection needed, full control
- **Up-to-date** - Latest React 18 features

### vs Next.js
- **Simpler** - No framework overhead
- **Static-First** - Optimized for static sites
- **Flexible** - No opinionated routing
- **Faster Dev** - Instant HMR with Vite

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

**Built with ❤️ by Rakha Viantoni**