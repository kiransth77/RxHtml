# 🚀 Publishing Your Package - Complete Instructions

Your code has been successfully pushed to GitHub! Now you need to publish the
package using one of these methods:

## ✅ What's Already Done

- ✅ Code pushed to GitHub (master branch)
- ✅ GitHub Actions workflow configured (`.github/workflows/publish.yml`)
- ✅ Package configured as `@kiransth77/rxhtmx@2.0.0`
- ✅ All tests passing locally (14/14)

## 📦 Method 1: Create a GitHub Release (Automated - Recommended)

This will automatically trigger the GitHub Action to publish your package.

### Steps:

1. **Go to your repository releases page:**

   ```
   https://github.com/kiransth77/RxHtml/releases/new
   ```

2. **Fill in the release form:**
   - **Tag version**: `v2.0.0` (create new tag)
   - **Release title**: `v2.0.0 - Initial Package Release`
   - **Description**: Add release notes (example below)

   ```markdown
   ## 🎉 Initial Package Release

   First release of @kiransth77/rxhtmx to GitHub Packages!

   ### Features

   - 🔄 Enhanced Signal System with reactive primitives
   - 🧩 Component Architecture with full lifecycle
   - 🛣️ Client-Side Router with history API
   - 📦 State Management with actions and getters
   - ⚡ Build System with HMR and production bundler
   - 🔧 CLI Tools for project scaffolding
   - 🧪 Comprehensive Testing (14/14 tests passing)
   - 🎨 DevTools Panel with debugging features
   - 📊 Performance Monitoring utilities
   - 🌐 Network Request Inspector
   - ⏱️ Time-Travel Debugging

   ### Package Details

   - **Full Name**: @kiransth77/rxhtmx
   - **Version**: 2.0.0
   - **Size**: 66.8 KB (compressed), 284.1 KB (unpacked)
   - **Files**: 51 files (src, dist, cli, docs-dist)

   ### Installation

   \`\`\`bash echo "@kiransth77:registry=https://npm.pkg.github.com" >> .npmrc
   npm install @kiransth77/rxhtmx \`\`\`
   ```

3. **Click "Publish release"**

4. **Monitor the GitHub Action:**
   - Go to: https://github.com/kiransth77/RxHtml/actions
   - You'll see "Publish Package to GitHub Packages" running
   - Wait for it to complete (green checkmark)

## 🔧 Method 2: Manual Workflow Dispatch

If you prefer to trigger the workflow manually without creating a release:

1. **Go to GitHub Actions:**

   ```
   https://github.com/kiransth77/RxHtml/actions/workflows/publish.yml
   ```

2. **Click "Run workflow" button** (top right)

3. **Select branch**: `master`

4. **Optional**: Leave version empty to use `package.json` version

5. **Click "Run workflow"**

## 🔐 Method 3: Manual Publishing (Local)

If you want to publish manually from your computer:

### Prerequisites:

1. **Create GitHub Personal Access Token:**
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Scopes: Select `write:packages` and `read:packages`
   - Generate and copy the token

2. **Authenticate with GitHub Packages:**
   ```bash
   npm login --scope=@kiransth77 --registry=https://npm.pkg.github.com
   ```

   - Username: `kiransth77`
   - Password: `YOUR_PERSONAL_ACCESS_TOKEN` (paste the token)
   - Email: your-email@example.com

### Publish Steps:

```bash
# Make sure everything is up to date
git pull origin master

# Build the package
bun run build

# Verify package contents
npm pack --dry-run

# Publish to GitHub Packages
npm publish
```

## ✅ Verify Publication

After publishing (whichever method), verify the package is available:

1. **Check GitHub Packages page:**

   ```
   https://github.com/kiransth77?tab=packages
   ```

   or

   ```
   https://github.com/orgs/kiransth77/packages
   ```

2. **Test installation in a new project:**
   ```bash
   mkdir test-install
   cd test-install
   npm init -y
   echo "@kiransth77:registry=https://npm.pkg.github.com" >> .npmrc
   npm install @kiransth77/rxhtmx
   ```

## 📊 Expected GitHub Action Output

When the action runs successfully, you'll see:

```
✓ Checkout code
✓ Setup Bun
✓ Install dependencies
✓ Run tests (14/14 passing)
✓ Build package
✓ Setup Node.js
✓ Publish to GitHub Packages
```

## 🎯 Next Release

For future releases, follow this workflow:

```bash
# Make your changes
# Commit your changes

# Update version and create changelog
npm run release          # For patch (2.0.0 → 2.0.1)
# or
npm run release:minor    # For minor (2.0.0 → 2.1.0)
# or
npm run release:major    # For major (2.0.0 → 3.0.0)

# Push changes and tags
git push origin master --follow-tags

# Create GitHub release (same as Method 1)
```

## 🆘 Troubleshooting

### Issue: GitHub Action fails at "Publish" step

**Solution**: Check that GitHub Actions has `packages: write` permission:

1. Go to repo Settings → Actions → General
2. Scroll to "Workflow permissions"
3. Ensure "Read and write permissions" is selected

### Issue: 403 Forbidden when publishing

**Solution**:

- Verify the `GITHUB_TOKEN` has proper scopes
- Check package name matches `@kiransth77/rxhtmx` exactly
- Ensure you own the `@kiransth77` scope

### Issue: Package not appearing after publish

**Solution**:

- Wait a few minutes (GitHub Packages can take time to index)
- Check the Actions tab for any errors
- Verify the package in repository "Packages" tab

---

**Ready to publish!** I recommend **Method 1** (Create GitHub Release) as it's
fully automated and creates proper version tracking.

Let me know which method you'd like to use, and I can guide you through it!
