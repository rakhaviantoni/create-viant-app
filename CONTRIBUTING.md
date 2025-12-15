# Contributing to Viant

Thank you for your interest in contributing to Viant! This document provides guidelines and information for contributors.

## 🚀 Quick Start

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/YOUR_USERNAME/create-viant-app.git`
3. **Install** dependencies: `npm install`
4. **Create** a branch: `git checkout -b feature/your-feature-name`
5. **Make** your changes
6. **Test** your changes: `npm test`
7. **Build** the CLI: `npm run build`
8. **Test** the CLI: `node dist/index.js test-project --template react-ts --styling tailwind --skip-install --skip-git --skip-dev`
9. **Commit** your changes: `git commit -m 'Add amazing feature'`
10. **Push** to your fork: `git push origin feature/your-feature-name`
11. **Create** a Pull Request

## 🧪 Development Setup

### Prerequisites
- Node.js 18+ 
- npm, pnpm, yarn, or bun

### Local Development
```bash
# Clone the repository
git clone https://github.com/rakhaviantoni/create-viant-app.git
cd create-viant-app

# Install dependencies
npm install

# Run tests
npm test

# Build the CLI
npm run build

# Test the CLI locally
node dist/index.js my-test-app --template react-ts --styling tailwind --skip-install --skip-git --skip-dev
```

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npx vitest src/versions.property.test.ts
```

## 📝 Code Guidelines

### Code Style
- Use TypeScript for all new code
- Follow existing code formatting (we use Biome)
- Write descriptive variable and function names
- Add JSDoc comments for public APIs

### Testing
- Write property-based tests for new functionality using fast-check
- Ensure all tests pass before submitting PR
- Add unit tests for edge cases
- Test CLI functionality manually

### Commits
- Use conventional commit messages: `feat:`, `fix:`, `docs:`, `test:`, etc.
- Keep commits focused and atomic
- Write clear commit messages

## 🎯 Areas for Contribution

### High Priority
- 🐛 **Bug Fixes**: Fix issues reported in GitHub Issues
- 📚 **Documentation**: Improve README, add examples, write guides
- 🧪 **Testing**: Add more test coverage, especially edge cases
- 🎨 **Templates**: Improve existing templates, add new features

### Medium Priority
- 🚀 **New Frameworks**: Add support for Qwik, Astro, etc.
- 🔧 **Features**: Add new CLI options, improve UX
- 📦 **Dependencies**: Keep dependencies up to date
- 🌐 **Internationalization**: Add support for multiple languages

### Low Priority
- 🎨 **UI/UX**: Improve CLI interface, better error messages
- 📊 **Analytics**: Add usage analytics (opt-in)
- 🔌 **Plugins**: Plugin system for extensibility

## 🏗️ Project Structure

```
create-viant-app/
├── src/                    # Source code for utilities
│   ├── versions.ts         # Version constants
│   ├── detectPackageManagers.ts
│   ├── errorHandling.ts
│   └── *.property.test.ts  # Property-based tests
├── templates/              # Project templates
│   ├── react-ts/
│   ├── react-js/
│   ├── vue-ts/
│   └── ...
├── docs/                   # Documentation website
├── .github/workflows/      # CI/CD workflows
├── index.ts               # Main CLI entry point
├── package.json
└── README.md
```

## 🔧 Adding New Templates

1. Create template directory: `templates/framework-language/`
2. Add all necessary files (package.json, vite.config, etc.)
3. Update `VERSIONS` constant in `src/versions.ts`
4. Add template to the CLI options in `index.ts`
5. Write property-based tests
6. Update documentation

### Template Requirements
- Must use Vite as build tool
- Must include proper TypeScript configuration (if TS template)
- Must include proper package.json with correct dependencies
- Must build successfully: `npm run build`
- Must start dev server: `npm run dev`

## 🐛 Reporting Issues

### Bug Reports
- Use the bug report template
- Include steps to reproduce
- Include system information (OS, Node.js version, package manager)
- Include CLI command that caused the issue
- Include error messages and stack traces

### Feature Requests
- Use the feature request template
- Explain the use case and benefits
- Provide examples if possible
- Consider implementation complexity

## 📋 Pull Request Process

1. **Fork** and create a feature branch
2. **Make** your changes with tests
3. **Update** documentation if needed
4. **Ensure** all tests pass: `npm test`
5. **Build** and test CLI: `npm run build && node dist/index.js test-app`
6. **Create** PR with clear description
7. **Respond** to review feedback

### PR Requirements
- ✅ All tests pass
- ✅ Code follows style guidelines
- ✅ Documentation updated (if needed)
- ✅ No breaking changes (unless major version)
- ✅ Clear description of changes

## 🏷️ Release Process

Releases are handled by maintainers:

1. Update version in `package.json` and `index.ts`
2. Update `CHANGELOG.md`
3. Create git tag: `git tag v2.0.1`
4. Push tag: `git push origin v2.0.1`
5. Publish to npm: `npm publish`
6. Create GitHub release with changelog

## 💬 Getting Help

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/rakhaviantoni/create-viant-app/issues)
- 💬 **Questions**: [GitHub Discussions](https://github.com/rakhaviantoni/create-viant-app/discussions)
- 📧 **Email**: [rakhaviantoni@gmail.com](mailto:rakhaviantoni@gmail.com)

## 📄 License

By contributing to Viant, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Viant! 🚀