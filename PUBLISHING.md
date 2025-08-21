# Publishing Guide for @darioajr/yaml-doctor

## Pre-requisites

1. **NPM Account**: Create an account at [npmjs.com](https://www.npmjs.com)
2. **NPM Token**: Generate an access token in your NPM account settings
3. **GitHub Secrets**: Add the NPM_TOKEN to your GitHub repository secrets

## Manual Publishing

### 1. Login to NPM
```bash
npm login
```

### 2. Build the project
```bash
npm run build
```

### 3. Publish to NPM
```bash
npm publish --access public
```

## Automatic Publishing via GitHub Actions

The repository includes two GitHub Actions workflows:

### 1. Build and Release (`.github/workflows/build.yml`)
- **Triggers**: Push to main branch, Pull Requests
- **Purpose**: Validates code, runs tests, and builds packages
- **Matrix Testing**: Tests on Node.js 18, 20, and 22
- **Artifacts**: Uploads .tgz package for main branch pushes

### 2. Publish to npm (`.github/workflows/publish.yml`)
- **Triggers**: Version tags (v*)
- **Purpose**: Publishes to npm registry
- **Features**: 
  - Full validation and testing
  - Package generation
  - Automatic npm publishing

### Setup Instructions

1. **Set up NPM Token in GitHub**
   1. Go to your repository on GitHub
   2. Navigate to Settings → Secrets and variables → Actions
   3. Create a new repository secret:
      - Name: `NPM_TOKEN`
      - Value: Your NPM access token

2. **Create and push a version tag**
   ```bash
   # Update version in package.json (or use npm version)
   npm version patch  # or minor, major

   # Push the tag to trigger publishing
   git push origin --tags
   ```

### Workflow Features

Both workflows include:
- ✅ Dependency installation
- ✅ ESLint validation
- ✅ TypeScript compilation
- ✅ CLI testing with sample files
- ✅ JSON output validation
- ✅ Package generation (.tgz)
- ✅ Artifact upload
- ✅ Automatic npm publishing (on tag push)

## Version Management

Use semantic versioning:
- `npm version patch` for bug fixes (1.0.0 → 1.0.1)
- `npm version minor` for new features (1.0.0 → 1.1.0)
- `npm version major` for breaking changes (1.0.0 → 2.0.0)

## Testing Before Publishing

Always test your package locally:

```bash
# Build the project
npm run build

# Test the CLI
node dist/cli.js --help
node dist/cli.js --path test-files

# Test programmatic usage
npm run build && node -e "
const { YamlDoctorCore } = require('./dist/index.js');
const doctor = new YamlDoctorCore();
doctor.scan('./test-files').then(result => console.log('Score:', result.score));
"
```

## Verifying Publication

After publishing, verify your package:

1. Check on NPM: https://www.npmjs.com/package/@darioajr/yaml-doctor
2. Test installation: `npm install @darioajr/yaml-doctor`
3. Test global installation: `npm install -g @darioajr/yaml-doctor`

## Package Structure

The published package will include:
- `dist/` - Compiled JavaScript and TypeScript definitions
- `README.md` - Documentation
- `LICENSE` - Apache 2.0 license
- `package.json` - Package metadata

Source files (`src/`, `examples/`, `test-files/`) are excluded via `.npmignore`.
