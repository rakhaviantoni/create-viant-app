#!/bin/bash

echo "🚀 Setting up Viant project..."

# Check if package manager is available
if command -v bun &> /dev/null; then
    PM="bun"
elif command -v pnpm &> /dev/null; then
    PM="pnpm"
elif command -v yarn &> /dev/null; then
    PM="yarn"
else
    PM="npm"
fi

echo "📦 Using $PM as package manager"

# Install dependencies
echo "📥 Installing dependencies..."
$PM install

# Setup git hooks
if [ -d ".git" ]; then
    echo "🪝 Setting up git hooks..."
    $PM exec husky install
    $PM exec husky add .husky/pre-commit "npx lint-staged"
fi

# Create environment file
if [ ! -f ".env.local" ]; then
    echo "⚙️ Creating environment file..."
    echo "VITE_APP_TITLE=Viant App" > .env.local
    echo "VITE_APP_VERSION=1.0.0" >> .env.local
fi

echo "✅ Setup complete!"
echo ""
echo "🎉 Ready to start developing:"
echo "  $PM run dev     # Start development server"
echo "  $PM run build   # Build for production"
echo "  $PM run test    # Run tests"
echo ""