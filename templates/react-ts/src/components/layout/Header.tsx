import { Button } from '@/components/ui/Button'
import { useTheme } from '@/hooks/useTheme'

export function Header() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <a className="mr-6 flex items-center space-x-2" href="/">
            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Viant
            </span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <a href="#features" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Features
            </a>
            <a href="#docs" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Docs
            </a>
            <a href="#github" className="transition-colors hover:text-foreground/80 text-foreground/60">
              GitHub
            </a>
          </nav>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="w-9 px-0"
          >
            {theme === 'dark' ? '🌞' : '🌙'}
          </Button>
        </div>
      </div>
    </header>
  )
}