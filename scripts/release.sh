#!/bin/bash

# Release helper script for creating GitHub releases
# Usage: ./scripts/release.sh <version-type>
# Version types: patch, minor, major

set -e

VERSION_TYPE=${1:-patch}

echo "🚀 Preparing release..."

# Check if GitHub CLI is available
if ! command -v gh &> /dev/null; then
  echo "❌ GitHub CLI (gh) is required but not installed."
  echo "Install it from: https://cli.github.com/"
  exit 1
fi

# Check if authenticated with GitHub
if ! gh auth status &> /dev/null; then
  echo "❌ Not authenticated with GitHub. Please run: gh auth login"
  exit 1
fi

# Ensure we're on main branch
if [ "$(git branch --show-current)" != "main" ]; then
  echo "❌ Must be on main branch to create a release"
  exit 1
fi

# Ensure working directory is clean
if [ -n "$(git status --porcelain)" ]; then
  echo "❌ Working directory must be clean"
  exit 1
fi

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Run tests to ensure everything is working
echo "🧪 Running tests..."
yarn test

# Run linting
echo "🔍 Running linting..."
yarn lint:check

# Build the project
echo "🏗️  Building project..."
yarn build

# Calculate new version without modifying package.json
echo "📝 Fetching latest release from GitHub..."

# Get the latest release tag from GitHub (excluding pre-releases/betas)
LATEST_RELEASE=$(gh release list --limit 1 --exclude-pre-releases --json tagName --jq '.[0].tagName' 2>/dev/null || echo "")

if [ -z "$LATEST_RELEASE" ]; then
  # No releases found, use package.json version as base
  CURRENT_VERSION=$(node -p "require('./package.json').version")
  echo "📝 No releases found, using package.json version: $CURRENT_VERSION"
else
  # Remove 'v' prefix if present
  CURRENT_VERSION=${LATEST_RELEASE#v}
  echo "📝 Latest release: $LATEST_RELEASE (version: $CURRENT_VERSION)"
fi

# Calculate new version based on type
if [ "$VERSION_TYPE" = "patch" ]; then
  NEW_VERSION=$(node -p "
    const v = '$CURRENT_VERSION'.split('.');
    v[2] = parseInt(v[2]) + 1;
    v.join('.');
  ")
elif [ "$VERSION_TYPE" = "minor" ]; then
  NEW_VERSION=$(node -p "
    const v = '$CURRENT_VERSION'.split('.');
    v[1] = parseInt(v[1]) + 1;
    v[2] = 0;
    v.join('.');
  ")
elif [ "$VERSION_TYPE" = "major" ]; then
  NEW_VERSION=$(node -p "
    const v = '$CURRENT_VERSION'.split('.');
    v[0] = parseInt(v[0]) + 1;
    v[1] = 0;
    v[2] = 0;
    v.join('.');
  ")
else
  echo "❌ Invalid version type. Use: patch, minor, or major"
  exit 1
fi

echo "✅ New version will be: $NEW_VERSION"

# Show recent releases for context
echo ""
echo "📋 Recent releases:"
gh release list --limit 5 --json tagName,createdAt --template '{{range .}}{{.tagName}} ({{timeago .createdAt}}){{"\n"}}{{end}}' 2>/dev/null || echo "No releases found"
echo ""

# Confirm with user
read -p "Continue with release v$NEW_VERSION? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Release cancelled"
  exit 1
fi

# Create tag without modifying main branch
echo "🏷️  Creating release tag..."
git tag "v$NEW_VERSION"

# Push only the tag (not main branch changes)
echo "📤 Pushing tag..."
git push origin "v$NEW_VERSION"

echo "🎉 Release tag v$NEW_VERSION has been created!"
echo "🌐 Go to GitHub to publish the release: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^/]*\/[^.]*\).*/\1/')/releases/tag/v$NEW_VERSION"
echo ""
echo "⚠️  Note: The package.json version will be updated automatically during the GitHub Action release process."
