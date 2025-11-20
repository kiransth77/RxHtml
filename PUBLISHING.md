# Publishing to GitHub Packages

This guide explains how to publish the RxHtmx package to GitHub's npm registry.

## Prerequisites

1. **GitHub Personal Access Token (PAT)**
   - Go to GitHub Settings → Developer settings → Personal access tokens →
     Tokens (classic)
   - Click "Generate new token (classic)"
   - Select scopes:
     - `write:packages` - Upload packages to GitHub Package Registry
     - `read:packages` - Download packages from GitHub Package Registry
     - `delete:packages` - Delete packages from GitHub Package Registry
       (optional)
   - Copy the generated token

2. **Authenticate with GitHub Packages**

   ```bash
   # Login to GitHub Packages
   npm login --scope=@kiransth77 --registry=https://npm.pkg.github.com

   # Enter your credentials:
   # Username: your-github-username
   # Password: your-personal-access-token (NOT your GitHub password)
   # Email: your-email@example.com
   ```

3. **Or use .npmrc file** (recommended for CI/CD)
   ```bash
   # Add to ~/.npmrc (your home directory)
   //npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
   @kiransth77:registry=https://npm.pkg.github.com
   ```

## Manual Publishing

### Step 1: Prepare the Package

```bash
# Install dependencies
bun install

# Run tests
bun test

# Build the package
bun run build

# Check package contents
npm pack --dry-run
```

### Step 2: Update Version

```bash
# For patch version (2.0.0 → 2.0.1)
bun run release

# For minor version (2.0.0 → 2.1.0)
bun run release:minor

# For major version (2.0.0 → 3.0.0)
bun run release:major
```

This will:

- Run tests and linting
- Build the package
- Update version in package.json
- Generate CHANGELOG.md
- Create a git tag
- Push to GitHub

### Step 3: Publish to GitHub Packages

```bash
# Publish the package
npm publish

# Or publish a specific version
npm publish --tag beta
npm publish --tag next
```

## Automated Publishing via GitHub Actions

The package is configured to automatically publish when you create a GitHub
release.

### Option 1: Create Release via GitHub UI

1. Go to your repository on GitHub
2. Click "Releases" → "Create a new release"
3. Choose or create a tag (e.g., `v2.0.0`)
4. Add release notes
5. Click "Publish release"

The GitHub Action will automatically:

- Install dependencies
- Run tests
- Build the package
- Publish to GitHub Packages

### Option 2: Manual Workflow Trigger

1. Go to Actions tab in your GitHub repository
2. Select "Publish Package to GitHub Packages" workflow
3. Click "Run workflow"
4. Optionally specify a version
5. Click "Run workflow"

## Installing the Published Package

Once published, users can install your package:

```bash
# Create .npmrc in their project
echo "@kiransth77:registry=https://npm.pkg.github.com" > .npmrc

# Install the package
npm install @kiransth77/rxhtmx

# Or with Bun
bun add @kiransth77/rxhtmx
```

### For authenticated access:

```bash
# Users need to authenticate first
npm login --scope=@kiransth77 --registry=https://npm.pkg.github.com

# Then install
npm install @kiransth77/rxhtmx
```

## Package Versions

The package uses semantic versioning:

- **Patch** (2.0.X): Bug fixes, minor updates
- **Minor** (2.X.0): New features, backward compatible
- **Major** (X.0.0): Breaking changes

## Troubleshooting

### Authentication Issues

```bash
# Clear npm cache
npm cache clean --force

# Re-authenticate
npm logout --scope=@kiransth77 --registry=https://npm.pkg.github.com
npm login --scope=@kiransth77 --registry=https://npm.pkg.github.com
```

### Publishing Issues

```bash
# Check if package name is available
npm view @kiransth77/rxhtmx

# Check current authentication
npm whoami --registry=https://npm.pkg.github.com

# Verify package.json configuration
cat package.json | grep -A 3 publishConfig
```

### Common Errors

1. **403 Forbidden**: Check your PAT has `write:packages` scope
2. **404 Not Found**: Verify package name matches `@username/package-name`
   format
3. **Version exists**: Increment version number or use a different tag

## CI/CD Best Practices

1. **Environment Secrets**: Store `GITHUB_TOKEN` in repository secrets
2. **Branch Protection**: Only publish from `main` or `master` branch
3. **Version Validation**: Ensure version is updated before publishing
4. **Changelog**: Auto-generate with `standard-version`
5. **Testing**: Always run full test suite before publishing

## Package Information

- **Registry**: GitHub Packages (npm.pkg.github.com)
- **Scope**: @kiransth77
- **Package Name**: rxhtmx
- **Full Name**: @kiransth77/rxhtmx
- **Repository**: https://github.com/kiransth77/RxHtml

## Files Included in Package

The following files are included (see `files` in package.json):

- `src/` - Source code
- `dist/` - Built bundles
- `cli/` - CLI tools
- `docs-dist/` - Built documentation
- `README.md` - Package documentation
- `LICENSE` - License file

Files excluded (see `.npmignore`):

- Tests and examples
- Development configuration
- Build scripts
- Documentation source files
