#!/bin/bash
# /Users/rakhaviantoni/Projects/viant/template/scripts/dev.sh - Development helper script for Viant

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Helper functions for logging
log_info() { echo -e "${BLUE}ℹ${NC} $1"; }
log_success() { echo -e "${GREEN}✓${NC} $1"; }
log_warn() { echo -e "${YELLOW}⚠${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1"; exit 1; } # Exit on error
log_step() { echo -e "${CYAN}▶${NC} $1"; }

# Banner for Viant
show_banner() {
    echo -e "${PURPLE}"
    echo "██╗   ██╗██╗ █████╗ ███╗   ██╗████████╗"
    echo "██║   ██║██║██╔══██╗████╗  ██║╚══██╔══╝"
    echo "██║   ██║██║███████║██╔██╗ ██║   ██║   "
    echo "██║   ██║██║██╔══██║██║╚██╗██║   ██║   "
    echo "╚██████╔╝██║██║  ██║██║ ╚████║   ██║   "
    echo " ╚═════╝ ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝   "
    echo -e "${NC}"
    echo -e "${CYAN}Viant Development Helper Script${NC}"
    echo "================================="
    echo ""
}

# Detect package manager
PM="npm" # Default package manager
detect_package_manager() {
    if command -v bun >/dev/null 2>&1 && [ -f "bun.lockb" ]; then
        PM="bun"
    elif command -v pnpm >/dev/null 2>&1 && [ -f "pnpm-lock.yaml" ]; then
        PM="pnpm"
    elif command -v yarn >/dev/null 2>&1 && [ -f "yarn.lock" ]; then
        PM="yarn"
    elif command -v npm >/dev/null 2>&1 && [ -f "package-lock.json" ]; then
        PM="npm"
    fi
    log_info "Using $PM as package manager"
}

# Run development server
run_dev_server() {
    log_step "Starting development server with $PM..."
    case $PM in
        bun) bun run dev ;; # Assuming 'bun dev' is the command
        pnpm) pnpm dev ;;   # Assuming 'pnpm dev' is the command
        yarn) yarn dev ;;   # Assuming 'yarn dev' is the command
        *) npm run dev ;;
    esac
}

# Build project
run_build_project() {
    log_step "Building project for production with $PM..."
    case $PM in
        bun) bun run build ;; # Assuming 'bun build' is the command
        pnpm) pnpm build ;;   # Assuming 'pnpm build' is the command
        yarn) yarn build ;;   # Assuming 'yarn build' is the command
        *) npm run build ;;
    esac
    log_success "Build completed!"
}

# Preview production build
run_preview_build() {
    log_step "Previewing production build with $PM..."
    # Some frameworks require build before preview, others might not.
    # Assuming build is handled by the preview script if needed, or run_build_project was called before.
    case $PM in
        bun) bun run preview ;; # Assuming 'bun preview' is the command
        pnpm) pnpm preview ;;   # Assuming 'pnpm preview' is the command
        yarn) yarn preview ;;   # Assuming 'yarn preview' is the command
        *) npm run preview ;;
    esac
}

# Run tests
run_tests() {
    local mode=${1:-run} # Default to 'run' if no mode specified
    log_step "Running tests with $PM (mode: $mode)..."
    case $mode in
        watch)
            case $PM in
                bun) bun run test --watch ;; # Adjust if bun has different watch syntax
                pnpm) pnpm test --watch ;;
                yarn) yarn test --watch ;;
                *) npm run test -- --watch ;;
            esac
            ;;
        coverage)
            case $PM in
                bun) bun run test:coverage ;; # Assuming a 'test:coverage' script exists
                pnpm) pnpm test:coverage ;;
                yarn) yarn test:coverage ;;
                *) npm run test:coverage ;;
            esac
            ;;
        ui) # Example for UI tests, if applicable
            case $PM in
                bun) bun run test:ui ;; # Assuming a 'test:ui' script exists
                pnpm) pnpm test:ui ;;
                yarn) yarn test:ui ;;
                *) npm run test:ui ;;
            esac
            ;;
        *)
            case $PM in
                bun) bun run test ;; # Assuming 'bun test' is the command
                pnpm) pnpm test ;;
                yarn) yarn test ;;
                *) npm run test ;;
            esac
            ;;
    esac
}

# Lint and format code
run_lint_code() {
    local action=${1:-check} # Default to 'check' if no action specified
    case $action in
        fix)
            log_step "Fixing linting issues with $PM..."
            case $PM in
                bun) bun run lint:fix ;; # Assuming 'bun lint:fix' is the command
                pnpm) pnpm lint:fix ;;
                yarn) yarn lint:fix ;;
                *) npm run lint:fix ;;
            esac
            ;;
        format) # Example for a dedicated format command
            log_step "Formatting code with $PM..."
            case $PM in
                bun) bun run format ;; # Assuming a 'format' script exists
                pnpm) pnpm format ;;
                yarn) yarn format ;;
                *) npm run format ;;
            esac
            ;;
        *)
            log_step "Linting code with $PM..."
            case $PM in
                bun) bun run lint ;; # Assuming 'bun lint' is the command
                pnpm) pnpm lint ;;
                yarn) yarn lint ;;
                *) npm run lint ;;
            esac
            ;;
    esac
}

# Type check
run_type_check() {
    log_step "Running TypeScript type check with $PM..."
    case $PM in
        bun) bun run type-check ;; # Assuming 'bun type-check' is the command
        pnpm) pnpm type-check ;;
        yarn) yarn type-check ;;
        *) npm run type-check ;;
    esac
}

# Clean project
run_clean_project() {
    log_step "Cleaning build artifacts and caches..."
    # Add project-specific clean commands if $PM run clean is not enough
    # For example, removing node_modules, .cache, etc.
    # This is a generic example, adjust to your project's needs.
    case $PM in
        bun) bun run clean ;; # Assuming a 'clean' script exists
        pnpm) pnpm clean ;;
        yarn) yarn clean ;;
        *) npm run clean ;;
    esac
    # Example additional cleaning:
    rm -rf dist/ .vite/ coverage/ storybook-static/ node_modules/.cache/ .turbo/
    log_success "Project cleaned!"
}

# Install dependencies
run_install_deps() {
    log_step "Installing dependencies with $PM..."
    case $PM in
        bun) bun install ;;
        pnpm) pnpm install ;;
        yarn) yarn install ;; # yarn install is preferred over just yarn
        *) npm install ;;
    esac
    log_success "Dependencies installed!"
}

# Update dependencies
run_update_deps() {
    log_step "Updating dependencies with $PM..."
    case $PM in
        bun) bun update ;;
        pnpm) pnpm update ;;
        yarn) yarn upgrade ;;
        *) npm update ;;
    esac
    log_success "Dependencies updated!"
    log_info "Consider running '$PM audit' to check for vulnerabilities."
}

# Analyze bundle
run_analyze_bundle() {
    log_step "Analyzing bundle size with $PM..."
    # Check if an analyze script exists in package.json
    if ! grep -q "bundle-analyze" package.json && ! grep -q "analyze" package.json ; then
        log_warn "'bundle-analyze' or 'analyze' script not found in package.json."
        log_info "You might need to set up a bundle analyzer (e.g., vite-bundle-visualizer, webpack-bundle-analyzer)."
        return 1
    fi
    # Some analyzers require a build first
    # run_build_project # Uncomment if build is needed before analyze
    case $PM in
        bun) bun run bundle-analyze || bun run analyze ;; # Try both common names
        pnpm) pnpm bundle-analyze || pnpm analyze ;;
        yarn) yarn bundle-analyze || yarn analyze ;;
        *) npm run bundle-analyze || npm run analyze ;;
    esac
}

# Setup project (initial setup)
run_setup_project() {
    log_step "Setting up Viant project..."
    run_install_deps
    # Initialize git hooks if husky is present
    if grep -q "husky" package.json && [ -d ".husky" ]; then
        log_step "Setting up git hooks (Husky detected)..."
        $PM run prepare 2>/dev/null || true # 'prepare' script often sets up husky
    fi
    # Optional: run initial checks
    # run_type_check
    # run_lint_code
    log_success "Project setup completed!"
}

# Health check
run_health_check() {
    log_step "Running Viant project health check..."
    local errors=0
    # Check for essential files/folders
    [ ! -f "package.json" ] && { log_warn "package.json not found"; ((errors++)); }
    [ ! -d "src" ] && { log_warn "src directory not found"; ((errors++)); }
    # Add more checks specific to Viant (e.g., main entry point, config files)
    [ ! -f "src/main.tsx" ] && [ ! -f "src/main.ts" ] && [ ! -f "src/index.ts" ] && [ ! -f "src/index.tsx" ] && { log_warn "Main entry file (main.tsx/ts or index.tsx/ts) not found in src/"; ((errors++)); }
    [ ! -f "vite.config.ts" ] && [ ! -f "vite.config.js" ] && { log_warn "Vite config (vite.config.ts/js) not found"; }
    [ ! -f "tsconfig.json" ] && { log_warn "tsconfig.json not found"; }

    log_info "Attempting type check..."
    if ! $PM run type-check >/dev/null 2>&1; then
        log_warn "Type check failed or 'type-check' script not found/functional."
        # ((errors++)) # Decide if this should be a hard error
    else
        log_success "Type check passed (or script not found)."
    fi

    log_info "Attempting lint check..."
    if ! $PM run lint >/dev/null 2>&1; then
        log_warn "Lint check failed or 'lint' script not found/functional."
    else
        log_success "Lint check passed (or script not found)."
    fi

    if [ $errors -eq 0 ]; then
        log_success "Basic health check passed!"
    else
        log_error "Health check found $errors potential issues."
        return 1
    fi
}

# Show project information
run_show_info() {
    echo -e "${CYAN}Viant Project Information${NC}"
    echo "========================="
    detect_package_manager # Ensure PM is set
    echo "Package Manager: $PM"
    echo "Node Version   : $(node --version 2>/dev/null || echo 'Not found')"
    echo "Project Name   : $(jq -r '.name' package.json 2>/dev/null || echo 'N/A - jq not found or package.json issue')"
    echo "Project Version: $(jq -r '.version' package.json 2>/dev/null || echo 'N/A - jq not found or package.json issue')"
    echo ""

    if [ -f "package.json" ]; then
        echo -e "${CYAN}Available Scripts (from package.json)${NC}"
        echo "---------------------------------------"
        jq -r '.scripts | to_entries[] | "  \(.key): \(.value)"' package.json 2>/dev/null || echo "  Could not parse scripts. Is jq installed and package.json valid?"
        echo ""
    fi
}

# Show help message
show_help() {
    echo -e "${CYAN}Viant Development Helper${NC}"
    echo "-------------------------"
    echo "Usage: ./scripts/dev.sh [command] [options]"
    echo ""
    echo -e "${YELLOW}Core Commands:${NC}"
    echo "  start, dev       Start development server"
    echo "  build            Build for production"
    echo "  preview          Preview production build (usually after build)"
    echo ""
    echo -e "${YELLOW}Testing & Quality:${NC}"
    echo "  test [mode]      Run tests. Modes: [run (default)], watch, coverage, ui"
    echo "  lint [action]    Lint code. Actions: [check (default)], fix, format"
    echo "  type-check       Run TypeScript type checking"
    echo ""
    echo -e "${YELLOW}Project Management:${NC}"
    echo "  install, i       Install dependencies"
    echo "  update           Update dependencies"
    echo "  clean            Clean build artifacts and caches"
    echo "  setup            Run initial project setup (install deps, etc.)"
    echo "  health           Run a project health check"
    echo "  analyze          Analyze bundle size (if configured)"
    echo ""
    echo -e "${YELLOW}Information:${NC}"
    echo "  info             Show project information"
    echo "  help, --help, -h Show this help message"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  ./scripts/dev.sh start"
    echo "  ./scripts/dev.sh test watch"
    echo "  ./scripts/dev.sh lint fix"
    echo ""
}

# Main script execution
main() {
    COMMAND=${1:-help} # Default to 'help' if no command provided
    OPTION=${2:-}    # Second argument as option

    # Always detect package manager first, unless just showing help
    if [ "$COMMAND" != "help" ] && [ "$COMMAND" != "--help" ] && [ "$COMMAND" != "-h" ]; then
      show_banner # Show banner for most commands
      detect_package_manager
    fi

    case $COMMAND in
        start|dev)
            run_dev_server
            ;;
        build)
            run_build_project
            ;;
        preview)
            run_preview_build
            ;;
        test)
            run_tests "$OPTION"
            ;;
        lint)
            run_lint_code "$OPTION"
            ;;
        type-check|typecheck)
            run_type_check
            ;;
        install|i)
            run_install_deps
            ;;
        update)
            run_update_deps
            ;;
        clean)
            run_clean_project
            ;;
        setup)
            run_setup_project
            ;;
        health)
            run_health_check
            ;;
        analyze)
            run_analyze_bundle
            ;;
        info)
            run_show_info
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "Unknown command: $COMMAND"
            show_help
            exit 1
            ;;
    esac
}

# Check if jq is available (for JSON parsing in show_info)
# This is a simple check; a more robust solution might involve prompting to install jq.
if ! command -v jq >/dev/null 2>&1; then
    # Define a basic fallback if jq is not present for the info command.
    # This won't parse JSON but prevents the script from erroring out if jq is called.
    jq() {
        if [ "$1" = "-r" ] && [ "$2" = ".name" ] && [ "$3" = "package.json" ]; then echo "(jq not found)";
        elif [ "$1" = "-r" ] && [ "$2" = ".version" ] && [ "$3" = "package.json" ]; then echo "(jq not found)";
        elif [ "$1" = "-r" ] && [ "$2" = ".scripts | to_entries[] | \"  \\(.key): \\(.value)\"" ] && [ "$3" = "package.json" ]; then echo "  (jq not found, cannot list scripts)";
        else cat; # Default to cat if unknown jq usage
        fi
    }
    export -f jq # Make the function available to subshells if needed
fi

# Execute main function with all script arguments
main "$@"