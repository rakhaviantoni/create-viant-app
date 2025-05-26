import { useState } from 'react'
import { Button } from './components/ui/Button'
import { Card } from './components/ui/Card'
import { Layout } from './components/layout/Layout'
import { useTheme } from './hooks/useTheme'

function App() {
  const [count, setCount] = useState(0)
  const { theme, toggleTheme } = useTheme()

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="container mx-auto px-4 py-8 md:py-16">
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Viant
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              A modern React template built with Vite, TypeScript, and Tailwind CSS
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">⚡ Lightning Fast</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Built with Vite for instant hot module replacement and optimized builds
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">🎨 Beautiful UI</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Pre-configured with Tailwind CSS and a modern design system
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">🛠️ Developer Ready</h3>
              <p className="text-gray-600 dark:text-gray-300">
                TypeScript, testing, linting, and formatting configured out of the box
              </p>
            </Card>
          </div>

          <div className="text-center mt-8 md:mt-12">
            <Card className="inline-block p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-semibold mb-4">Interactive Counter</h2>
              <div className="flex items-center justify-center gap-4 mb-6">
                <Button 
                  onClick={() => setCount(count - 1)}
                  variant="outline"
                >
                  -
                </Button>
                <span className="text-3xl font-bold w-20">{count}</span>
                <Button 
                  onClick={() => setCount(count + 1)}
                >
                  +
                </Button>
              </div>
              <Button 
                onClick={toggleTheme}
                variant="secondary"
                className="mb-4"
              >
                Toggle {theme === 'dark' ? 'Light' : 'Dark'} Mode
              </Button>
              <p className="text-xs md:text-sm text-gray-500">
                Edit <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">src/App.jsx</code> and save to test HMR
              </p>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default App