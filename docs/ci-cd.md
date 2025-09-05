# 🚀 CI/CD Pipeline Documentation

## Overview

This project uses a comprehensive CI/CD pipeline powered by GitHub Actions, providing automated testing, building, security scanning, and deployment.

## Pipeline Stages

### 1. **Test Suite** 🧪
- **Matrix Testing**: Tests across Node.js versions 18.x, 20.x, and 22.x
- **Unit Tests**: Runs all Bun-based tests
- **Coverage**: Generates test coverage reports
- **Integration**: Uploads coverage to Codecov

### 2. **Code Quality** 🔍
- **ESLint**: Code linting for style and error checking
- **Prettier**: Code formatting validation
- **Continues on error**: Non-blocking for the pipeline

### 3. **Build and Package** 📦
- **Library Build**: Compiles source code using Vite
- **Browser Bundle**: Creates browser-compatible bundle
- **Artifact Upload**: Stores build artifacts for downstream jobs

### 4. **Browser Testing** 🌐
- **Cross-Browser**: Tests on Chromium, Firefox, and WebKit
- **Playwright**: End-to-end testing of examples
- **Visual Testing**: Screenshot comparison on failures

### 5. **Security Audit** 🔒
- **Dependency Audit**: Checks for vulnerable dependencies
- **CodeQL**: Static application security testing (SAST)
- **SARIF Upload**: Security findings uploaded to GitHub

### 6. **Publishing** 📢
- **NPM Publish**: Automatic NPM release on GitHub releases
- **GitHub Releases**: Creates release assets (tar.gz, zip)
- **Version Management**: Automated versioning workflow

### 7. **Documentation Deployment** 📚
- **GitHub Pages**: Automatically deploys docs on main branch
- **Live Examples**: Deploys working examples with the docs
- **Custom Domain**: Supports custom domain configuration

## Triggers

- **Push**: `main` and `develop` branches
- **Pull Request**: Against `main` and `develop` branches
- **Release**: When a GitHub release is published

## Required Secrets

Configure these in your GitHub repository settings:

```
CODECOV_TOKEN     # For test coverage reporting
NPM_TOKEN         # For NPM publishing
GITHUB_TOKEN      # Automatically provided by GitHub
```

## Scripts Available

### Development
```bash
bun run dev              # Start development server
bun run test             # Run all tests
bun run test:watch       # Run tests in watch mode
bun run lint             # Run ESLint
bun run format           # Format code with Prettier
```

### Build
```bash
bun run build            # Build library and browser bundle
bun run build:browser    # Build browser bundle only
bun run package          # Create NPM package
```

### Testing
```bash
bun run test             # Unit tests
bun run test:coverage    # Tests with coverage
bun run test:browser     # End-to-end browser tests
```

### Documentation
```bash
bun run docs:build       # Build documentation
bun run docs:serve       # Serve docs locally
```

### Release
```bash
bun run release          # Prepare for release
npm version patch        # Bump patch version
npm version minor        # Bump minor version
npm version major        # Bump major version
```

## Automated Processes

### Dependabot
- **Weekly Updates**: Automatically updates dependencies
- **GitHub Actions**: Updates workflow dependencies
- **Auto-merge**: Can be configured for patch updates

### Release Flow
1. **Manual**: Create GitHub release with tag
2. **Automated**: Pipeline builds, tests, and publishes
3. **NPM**: Package published automatically
4. **Assets**: Release artifacts attached to GitHub release

### Quality Gates
- All tests must pass
- Code must pass linting
- Security scan must complete
- Browser tests must pass

## Monitoring

### GitHub Actions
- **Workflow Status**: Visible in GitHub Actions tab
- **Build Logs**: Detailed logs for each step
- **Artifacts**: Download build outputs and test reports

### External Services
- **Codecov**: Test coverage trends and reports
- **NPM**: Package download statistics
- **GitHub Pages**: Documentation site analytics

## Troubleshooting

### Common Issues

1. **Test Failures**
   - Check test logs in GitHub Actions
   - Run tests locally: `bun test`
   - Verify browser compatibility

2. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript/ESLint errors

3. **Deployment Issues**
   - Verify secrets are configured
   - Check NPM token permissions
   - Ensure version numbers are incremented

### Debug Commands
```bash
# Local testing
bun test --verbose
bun run lint --debug
node scripts/build-browser.js

# Browser testing
bunx playwright test --debug
bunx playwright test --headed
```

## Best Practices

1. **Commit Messages**: Use conventional commits for automatic changelog
2. **Branching**: Use feature branches, merge to develop, release from main
3. **Versioning**: Follow semantic versioning (semver)
4. **Testing**: Write tests before pushing
5. **Documentation**: Update docs with code changes

## Configuration Files

- `.github/workflows/ci.yml` - Main CI/CD pipeline
- `.github/dependabot.yml` - Dependency updates
- `playwright.config.js` - Browser testing configuration
- `.eslintrc.json` - Code linting rules
- `.prettierrc.json` - Code formatting rules
- `package.json` - Scripts and dependencies

This CI/CD setup ensures code quality, automated testing, and reliable deployments for the RxHtmx project.
