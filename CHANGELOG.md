# Changelog

All notable changes to this project will be documented in this file.

## [2.0.1] - 2024-12-15

### Fixed
- 🐛 **Font File Dependencies**: Removed figlet dependency that was causing "ENOENT: no such file or directory" errors when using the CLI via npm/pnpm/yarn/bun
- 🎨 **ASCII Banner**: Replaced figlet-generated banner with custom ASCII art to eliminate external font file dependencies
- 📦 **Package Size**: Reduced package size by removing unnecessary figlet and @types/figlet dependencies

### Added
- 🌐 **Documentation Website**: Added comprehensive documentation website in `/docs`
- 🚀 **GitHub Actions**: Added CI/CD workflows for testing and documentation deployment
- 📚 **Enhanced README**: Improved documentation with troubleshooting section, stats, and roadmap
- 🔧 **Non-Interactive Mode**: Better documentation for CLI flags and non-interactive usage

### Changed
- ⚡ **CLI Performance**: Faster startup time due to removed figlet dependency
- 📖 **Documentation**: Enhanced README with badges, troubleshooting, and comprehensive feature list

## [2.0.0] - 2024-12-15

### Added
- 🚀 **Modern Dependencies**: Updated all dependencies to latest versions
  - React 19, Vue 3.5, Svelte 5, Solid 1.9, Preact 10.25
  - Vite 6, TypeScript 5.7, Tailwind CSS 4
  - Biome 1.9, Vitest 3, Playwright 1.49
- 🎯 **Multi-Framework Support**: 12 template combinations (6 frameworks × 2 languages)
- 🎨 **Modern Styling**: Tailwind CSS 4, styled-components, UnoCSS, vanilla-extract, Sass
- 🧪 **Testing**: Vitest, Playwright, property-based testing with fast-check
- 🔧 **Linting**: Biome for fast, modern linting and formatting
- 📱 **PWA Support**: Vite PWA plugin with Workbox
- 🏪 **State Management**: Redux Toolkit, Zustand, Jotai, Pinia
- 🌐 **API Clients**: TanStack Query, SWR, Axios, tRPC
- 📦 **Package Manager Detection**: Auto-detection of bun, pnpm, yarn, npm
- 🎛️ **Rich Features**: Storybook, Husky, i18n, Docker, GitHub Actions

### Changed
- ⚡ **Performance**: Significantly faster project generation and build times
- 🛠️ **Developer Experience**: Better error handling, progress indicators, and completion messages
- 📁 **Project Structure**: Modern, organized folder structure with proper TypeScript configuration
- 🔒 **Type Safety**: Strict TypeScript configuration by default with optional strict mode

### Technical
- ✅ **Property-Based Testing**: 77 comprehensive tests ensuring correctness
- 🏗️ **Build System**: Modern ESM modules with proper bundling
- 🔧 **Error Handling**: Comprehensive error handling with cleanup on failure
- 📊 **Validation**: Package.json validation and project structure verification

## [1.0.0] - Initial Release

### Added
- Basic CLI functionality
- React and Vue templates
- Basic styling options
- Package manager support