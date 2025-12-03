# Publishing to npm & GitHub Packages

Your package is now configured to publish to **both npm and GitHub Packages**.

## 🔧 CRITICAL: Setup Required

**⚠️ The workflow will fail if you don't add the npm token first!**

### Step 1: Create npm Token

1. Go to: https://www.npmjs.com/settings/tokens/new
2. Select **Automation** token type (for CI/CD - recommended for security)
3. Click **Generate Token**
4. Copy the token immediately (you won't see it again!)

### Step 2: Add to GitHub Secrets

1. Go to: https://github.com/kiransth77/RxHtml/settings/secrets/actions/new
2. **Secret name**: `NPM_TOKEN`
3. **Secret value**: Paste your npm token from step 1
4. Click **"Add secret"**

**✅ Done!** Now GitHub Actions can publish to npm.

## 📦 Publishing Methods

### Method 1: Create a GitHub Release (Automated - Recommended)

This is the easiest way - just create a release and GitHub Actions handles
everything:

```bash
# Go to releases page
https://github.com/kiransth77/RxHtml/releases/new

# Fill in the form:
# Tag: v2.0.0 (or next version)
# Title: v2.0.0 - Your Release Title
# Description: Write your release notes here

# Click "Publish release"
```

The GitHub Actions workflow will automatically:

- ✅ Run tests
- ✅ Build the package
- ✅ Publish to npm (public registry)
- ✅ Publish to GitHub Packages

Monitor progress at: https://github.com/kiransth77/RxHtml/actions

### Method 2: Manual Workflow Dispatch

If you don't want to create a release tag:

# Go to

https://github.com/kiransth77/RxHtml/actions/workflows/publish.yml

# Click "Run workflow"

# Select branch: master

# Click "Run workflow"

````

### Method 3: Manual Local Publishing

```bash
# Verify setup
bun install
bun test

# Build
bun run build

# Publish to npm
npm publish

# Publish to GitHub Packages (optional)
npm publish --registry https://npm.pkg.github.com
````

## ✅ Verification

After publishing, verify the package is available:

```bash
# Check npm
npm view @kiransth77/rxhtmx

# Try installing
npm install @kiransth77/rxhtmx

# Check GitHub Packages
npm view @kiransth77/rxhtmx --registry https://npm.pkg.github.com
```

## 📋 Checklist

- [ ] npm token created and added to GitHub Secrets (`NPM_TOKEN`)
- [ ] GITHUB_TOKEN already available (default)
- [ ] `.npmrc` configured for both registries
- [ ] `package.json` has no restrictive `publishConfig`
- [ ] GitHub Actions workflow updated
- [ ] Ready to publish!

## 🚀 Next Steps

1. Complete the setup above
2. Create a GitHub release tagged `v2.0.0`
3. Watch the Actions tab as it publishes
4. Install with: `npm install @kiransth77/rxhtmx`
