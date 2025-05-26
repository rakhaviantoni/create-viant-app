#!/bin/bash
# /Users/rakhaviantoni/Projects/viant/template/scripts/deploy.sh - Universal deployment script for Viant

set -e

echo "🚀 Viant Deployment Script"
echo "========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions for logging
log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
    exit 1
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Detect package manager
PM="npm" # Default package manager
detect_package_manager() {
    if command_exists bun && [ -f "bun.lockb" ]; then
        PM="bun"
    elif command_exists pnpm && [ -f "pnpm-lock.yaml" ]; then
        PM="pnpm"
    elif command_exists yarn && [ -f "yarn.lock" ]; then
        PM="yarn"
    elif command_exists npm && [ -f "package-lock.json" ]; then
        PM="npm"
    fi
    log_info "Using $PM as package manager"
}

# Build the project
build_project() {
    log_info "Building project with $PM..."
    case $PM in
        bun)
            bun run build
            ;;
        pnpm)
            pnpm build
            ;;
        yarn)
            yarn build
            ;;
        *)
            npm run build
            ;;
    esac

    if [ ! -d "dist" ]; then
        log_error "Build failed - dist directory not found"
    fi
    log_success "Build completed successfully!"
}

# Deploy to Vercel
deploy_vercel() {
    log_info "Deploying to Vercel..."
    if ! command_exists vercel; then
        log_warn "Vercel CLI not found. Attempting to install globally..."
        npm i -g vercel || log_error "Failed to install Vercel CLI. Please install it manually: npm i -g vercel"
    fi
    vercel --prod
    log_success "Deployed to Vercel successfully!"
}

# Deploy to Netlify
deploy_netlify() {
    log_info "Deploying to Netlify..."
    if ! command_exists netlify; then
        log_warn "Netlify CLI not found. Attempting to install globally..."
        npm i -g netlify-cli || log_error "Failed to install Netlify CLI. Please install it manually: npm i -g netlify-cli"
    fi
    netlify deploy --prod --dir=dist
    log_success "Deployed to Netlify successfully!"
}

# Deploy to GitHub Pages
deploy_github_pages() {
    log_info "Deploying to GitHub Pages..."
    
    # Ensure git is available
    if ! command_exists git; then
        log_error "Git is not installed. Please install Git to deploy to GitHub Pages."
    fi 

    # Check if gh-pages branch exists, create if not
    if git show-ref --verify --quiet refs/heads/gh-pages; then
        log_info "gh-pages branch exists."
    else
        log_info "Creating orphan gh-pages branch..."
        # Temporarily stash uncommitted changes in the current branch if any
        NEEDS_STASH=false
        if ! git diff-index --quiet HEAD --; then
            git stash push -u -m "WIP: Stashing before gh-pages creation"
            NEEDS_STASH=true
        fi
        CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
        git checkout --orphan gh-pages
        git rm -rf .
        git commit --allow-empty -m "Initial gh-pages commit"
        git checkout "$CURRENT_BRANCH"
        if [ "$NEEDS_STASH" = true ] ; then
            git stash pop || log_warn "Could not automatically pop stash. Please resolve manually."
        fi
        log_info "gh-pages branch created."
    fi
    
    log_info "Deploying to gh-pages branch using git worktree..."
    # Remove existing worktree if it exists to prevent errors
    if [ -d "dist-deploy" ]; then # Using a different name to avoid conflict with build output 'dist'
        log_warn "Removing existing 'dist-deploy' worktree..."
        git worktree remove -f dist-deploy || true # true to ignore error if not a worktree or already removed
    fi
    
    git worktree add dist-deploy gh-pages
    # Copy contents of build (dist) to the worktree directory, excluding .git from source
    rsync -a --delete --exclude='.git' dist/ dist-deploy/
    cd dist-deploy
    git add --all
    # Check if there are changes to commit
    if git diff-index --quiet --cached HEAD --; then
        log_warn "No changes to commit to GitHub Pages."
    else
        git commit -m "Deploy to GitHub Pages: $(date +'%Y-%m-%d %H:%M:%S')"
        git push origin gh-pages
        log_success "Changes committed and pushed to GitHub Pages."
    fi
    cd ..
    git worktree remove dist-deploy
    
    log_success "Deployed to GitHub Pages successfully!"
}

# Deploy to Firebase Hosting
deploy_firebase() {
    log_info "Deploying to Firebase Hosting..."
    if ! command_exists firebase; then
        log_warn "Firebase CLI not found. Attempting to install globally..."
        npm i -g firebase-tools || log_error "Failed to install Firebase CLI. Please install it manually: npm i -g firebase-tools"
    fi
    firebase deploy --only hosting
    log_success "Deployed to Firebase successfully!"
}

# Deploy to Surge.sh
deploy_surge() {
    log_info "Deploying to Surge.sh..."
    if ! command_exists surge; then
        log_warn "Surge CLI not found. Attempting to install globally..."
        npm i -g surge || log_error "Failed to install Surge CLI. Please install it manually: npm i -g surge"
    fi
    surge dist
    log_success "Deployed to Surge.sh successfully!"
}

# Generate Docker image
deploy_docker() {
    log_info "Building Docker image..."
    if [ ! -f "Dockerfile" ]; then
        log_error "Dockerfile not found in the current directory. Please create one first."
    fi
    if ! command_exists docker; then
        log_error "Docker is not installed or not in PATH. Please install Docker."
    fi
    docker build -t viant-app .
    log_success "Docker image 'viant-app' built successfully!"
    log_info "To run the container: docker run -p 3000:80 viant-app"
}

# Show help
show_help() {
    echo ""
    echo "Usage: ./scripts/deploy.sh [target]"
    echo ""
    echo "Available deployment targets:"
    echo "  vercel    - Deploy to Vercel (default if no target specified)"
    echo "  netlify   - Deploy to Netlify"
    echo "  github    - Deploy to GitHub Pages"
    echo "  firebase  - Deploy to Firebase Hosting"
    echo "  surge     - Deploy to Surge.sh"
    echo "  docker    - Build Docker image"
    echo "  help      - Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./scripts/deploy.sh vercel"
    echo "  ./scripts/deploy.sh github"
    echo ""
}

# Main deployment function
main() {
    TARGET=${1:-vercel} # Default to Vercel if no argument provided

    if [ "$TARGET" = "help" ] || [ "$TARGET" = "--help" ] || [ "$TARGET" = "-h" ]; then
        show_help
        exit 0
    fi

    detect_package_manager
    
    # Build project only if not deploying Docker (Docker builds itself) or showing help
    if [ "$TARGET" != "docker" ] && [ "$TARGET" != "help" ]; then
        build_project
    fi

    log_info "Starting deployment to '$TARGET'..."

    case $TARGET in
        vercel)
            deploy_vercel
            ;;
        netlify)
            deploy_netlify
            ;;
        github|gh-pages)
            deploy_github_pages
            ;;
        firebase)
            deploy_firebase
            ;;
        surge)
            deploy_surge
            ;;
        docker)
            deploy_docker
            ;;
        *)
            log_error "Unknown deployment target: $TARGET"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all script arguments
main "$@"
