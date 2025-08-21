# yaml-doctor

**A practical YAML linting and validation library** for Kubernetes, Docker Compose, and GitHub Actions with scoring, badge generation, and beautiful web reports.

## Installation

```bash
npm install @darioajr/yaml-doctor
```

Or install globally for CLI usage:

```bash
npm install -g @darioajr/yaml-doctor
```

## CLI Usage

### Basic scanning
```bash
# Scan current directory
yaml-doctor

# Scan specific directory
yaml-doctor --path ./src

# Output JSON only
yaml-doctor --json
```

### Practical Examples

#### 1. Validate Kubernetes manifests
```bash
# Scan all YAML files in kubernetes directory
yaml-doctor --path ./k8s

# Example output:
# [yaml-doctor] Scanning /project/k8s ...
# [yaml-doctor] Score: 85/100 | errors=0 warnings=2 info=3
# [yaml-doctor] Generated:
#   - /project/k8s/yaml-doctor-report.json
#   - /project/k8s/yaml-doctor-report.html
#   - /project/k8s/yaml-doctor-badge.svg
```

#### 2. Validate Docker Compose files
```bash
# Scan Docker Compose files
yaml-doctor --path ./docker

# Get JSON output for CI/CD integration
yaml-doctor --path ./docker --json > docker-validation.json
```

#### 3. Validate GitHub Actions workflows
```bash
# Scan GitHub Actions workflows
yaml-doctor --path ./.github/workflows

# Example issues detected:
# WARNING: Action "actions/checkout" without version pin
# INFO: Missing "runs-on" in job definition
```

#### 4. CI/CD Integration
```bash
# In your CI/CD pipeline
yaml-doctor --path . --json | jq '.score'
# Returns: 92

# Fail build if score is below threshold
score=$(yaml-doctor --path . --json | jq '.score')
if [ $score -lt 80 ]; then
  echo "YAML quality score too low: $score/100"
  exit 1
fi
```

#### 5. Generate badge for README
```bash
# Generate badge and reports
yaml-doctor --path .

# Add badge to your README.md:
# ![YAML Doctor](./yaml-doctor-badge.svg)
```

### CLI Options
- `--path <path>` - Path to scan (default: current directory)
- `--json` - Output only JSON to stdout
- `--help, -h` - Show help message
- `--version, -v` - Show version number

## Quick Start: Add to Your Project

1. **Install in your project:**
   ```bash
   npm install --save-dev @darioajr/yaml-doctor
   ```

2. **Add to your package.json scripts:**
   ```json
   {
     "scripts": {
       "check-yaml": "yaml-doctor --path .",
       "validate-k8s": "yaml-doctor --path ./k8s",
       "validate-docker": "yaml-doctor --path ./docker",
       "pre-deploy": "yaml-doctor --path . && npm test"
     }
   }
   ```

3. **Run validation:**
   ```bash
   npm run check-yaml
   npm run validate-k8s
   npm run pre-deploy
   ```

## Custom NPM Scripts

You can create custom scripts in your project's `package.json` to integrate yaml-doctor into your workflow:

### Basic Scripts
```json
{
  "scripts": {
    "check-yaml": "yaml-doctor --path .",
    "check-k8s": "yaml-doctor --path ./k8s",
    "check-docker": "yaml-doctor --path ./docker",
    "check-workflows": "yaml-doctor --path ./.github/workflows",
    "yaml-ci": "yaml-doctor --path . --json",
    "yaml-report": "yaml-doctor --path . && echo 'Reports generated in current directory'",
    "precommit": "yaml-doctor --path . && npm test"
  }
}
```

### Usage in Your Project
```bash
# Install yaml-doctor in your project
npm install --save-dev @darioajr/yaml-doctor

# Add scripts to your package.json (see examples above)

# Run validation
npm run check-yaml

# Validate specific directories
npm run check-k8s
npm run check-docker

# CI/CD integration (JSON output)
npm run yaml-ci

# Pre-commit hook
npm run precommit
```

### Advanced Scripts with Quality Gates
```json
{
  "scripts": {
    "yaml-validate": "yaml-doctor --path .",
    "yaml-strict": "yaml-doctor --path . --json | node scripts/check-score.js 90",
    "yaml-ci-gate": "yaml-doctor --path . --json | jq '.totals.error == 0 and .score >= 80'",
    "deploy-ready": "npm run yaml-validate && npm run test && echo 'Ready for deployment!'",
    "quality-check": "yaml-doctor --path . && npm run lint && npm run test"
  }
}
```

### Real-World Integration Examples

#### Example 1: Microservice Project
```json
{
  "name": "my-microservice",
  "scripts": {
    "validate-k8s": "yaml-doctor --path ./k8s",
    "validate-docker": "yaml-doctor --path ./docker",
    "validate-ci": "yaml-doctor --path ./.github",
    "pre-deploy": "npm run validate-k8s && npm run validate-docker && npm run test",
    "ci-check": "yaml-doctor --path . --json | jq '.score >= 85' || exit 1"
  },
  "devDependencies": {
    "@darioajr/yaml-doctor": "^1.0.0"
  }
}
```

#### Example 2: Multi-Environment Project
```json
{
  "name": "multi-env-app",
  "scripts": {
    "yaml:dev": "yaml-doctor --path ./environments/dev",
    "yaml:staging": "yaml-doctor --path ./environments/staging", 
    "yaml:prod": "yaml-doctor --path ./environments/prod",
    "yaml:all": "npm run yaml:dev && npm run yaml:staging && npm run yaml:prod",
    "deploy:dev": "npm run yaml:dev && kubectl apply -f environments/dev/",
    "deploy:prod": "npm run yaml:prod && npm run test && kubectl apply -f environments/prod/"
  }
}
```

#### Example 3: Full DevOps Pipeline
```json
{
  "name": "devops-project",
  "scripts": {
    "validate": "yaml-doctor --path .",
    "security-check": "yaml-doctor --path . && npm run audit",
    "quality-gate": "yaml-doctor --path . --json | node scripts/quality-gate.js",
    "pre-commit": "npm run validate && npm run lint && npm run test",
    "pre-push": "npm run quality-gate && npm run integration-test",
    "deploy-check": "npm run validate && npm run security-check && echo 'Ready for deployment'"
  }
}
```

### Creating a Quality Gate Script

Create `scripts/yaml-quality-gate.js` in your project:
```javascript
#!/usr/bin/env node
const { execSync } = require('child_process');

try {
  // Run yaml-doctor and get JSON output
  const output = execSync('yaml-doctor --path . --json', { encoding: 'utf8' });
  const result = JSON.parse(output);
  
  console.log(`📊 YAML Quality Report:`);
  console.log(`   Score: ${result.score}/100`);
  console.log(`   Files: ${result.files.length}`);
  console.log(`   Errors: ${result.totals.error}`);
  console.log(`   Warnings: ${result.totals.warn}`);
  
  // Define your quality thresholds
  const minScore = 80;
  const maxErrors = 0;
  
  if (result.score >= minScore && result.totals.error <= maxErrors) {
    console.log('✅ YAML Quality Gate: PASSED');
    process.exit(0);
  } else {
    console.log('❌ YAML Quality Gate: FAILED');
    process.exit(1);
  }
  
} catch (error) {
  console.error('❌ Failed to run YAML validation:', error.message);
  process.exit(1);
}
```

Then use it in your package.json:
```json
{
  "scripts": {
    "yaml-gate": "node scripts/yaml-quality-gate.js",
    "pre-deploy": "npm run yaml-gate && npm run test"
  }
}
```

### One-liner Quality Checks

For simple quality gates without external scripts:

```json
{
  "scripts": {
    "yaml-check-errors": "yaml-doctor --path . --json | jq -e '.totals.error == 0'",
    "yaml-check-score": "yaml-doctor --path . --json | jq -e '.score >= 80'",
    "yaml-check-strict": "yaml-doctor --path . --json | jq -e '.totals.error == 0 and .score >= 90'",
    "yaml-summary": "yaml-doctor --path . --json | jq '{score: .score, errors: .totals.error, warnings: .totals.warn}'"
  }
}
```

### Integration with Popular Tools

#### With Husky (Git Hooks)
```json
{
  "scripts": {
    "yaml-validate": "yaml-doctor --path ."
  },
  "husky": {
    "hooks": {
      "pre-commit": "npm run yaml-validate && lint-staged",
      "pre-push": "yaml-doctor --path . --json | jq -e '.score >= 85'"
    }
  }
}
```

#### With lint-staged
```json
{
  "scripts": {
    "yaml-check": "yaml-doctor --path ."
  },
  "lint-staged": {
    "*.{yml,yaml}": ["yaml-doctor --path ."]
  }
}
```

#### With Docker Compose
```json
{
  "scripts": {
    "docker:validate": "yaml-doctor --path ./docker",
    "docker:up": "npm run docker:validate && docker-compose up -d",
    "docker:deploy": "npm run docker:validate && docker-compose -f docker-compose.prod.yml up -d"
  }
}
```

### Package.json Template for New Projects

Copy this template for new projects that need YAML validation:

```json
{
  "name": "your-project-name",
  "scripts": {
    "start": "node index.js",
    "test": "jest",
    "lint": "eslint .",
    
    "yaml:validate": "yaml-doctor --path .",
    "yaml:k8s": "yaml-doctor --path ./k8s",
    "yaml:docker": "yaml-doctor --path ./docker", 
    "yaml:ci": "yaml-doctor --path ./.github/workflows",
    "yaml:report": "yaml-doctor --path . && echo '📋 YAML reports generated'",
    
    "quality:yaml": "yaml-doctor --path . --json | jq -e '.score >= 80'",
    "quality:all": "npm run lint && npm run test && npm run quality:yaml",
    
    "pre-commit": "npm run yaml:validate && npm run lint",
    "pre-deploy": "npm run quality:all",
    "deploy": "npm run pre-deploy && echo 'Deploying...' && your-deploy-command"
  },
  "devDependencies": {
    "@darioajr/yaml-doctor": "^1.0.0",
    "jq": "^1.6.0"
  }
}
```

### Environment-Specific Validation

```json
{
  "scripts": {
    "yaml:dev": "yaml-doctor --path ./environments/development",
    "yaml:staging": "yaml-doctor --path ./environments/staging",
    "yaml:production": "yaml-doctor --path ./environments/production",
    
    "deploy:dev": "npm run yaml:dev && kubectl apply -f environments/development/",
    "deploy:staging": "npm run yaml:staging && npm run test && kubectl apply -f environments/staging/",
    "deploy:prod": "npm run yaml:production && npm run test && npm run security-audit && kubectl apply -f environments/production/"
  }
}
```

## Programmatic Usage

### Basic scanning
```typescript
import { YamlDoctorCore } from '@darioajr/yaml-doctor';

const doctor = new YamlDoctorCore();
const result = await doctor.scan('./src');

console.log(`Score: ${result.score}/100`);
console.log(`Files: ${result.files.length}`);
console.log(`Errors: ${result.totals.error}`);
console.log(`Warnings: ${result.totals.warn}`);
```

### Generate reports
```typescript
import { YamlDoctorCore } from '@darioajr/yaml-doctor';

const doctor = new YamlDoctorCore({
  ignorePatterns: ['**/node_modules/**', '**/.git/**']
});

const { result, outputs } = await doctor.scanAndReport('./src', {
  generateJson: true,
  generateHtml: true,
  generateBadge: true,
  outputDir: './reports'
});

console.log('Generated reports:', outputs);
```

### Practical Programming Examples

#### 1. Custom validation in Node.js scripts
```typescript
import { YamlDoctorCore } from '@darioajr/yaml-doctor';

async function validateProjectYamls() {
  const doctor = new YamlDoctorCore();
  
  // Scan multiple directories
  const directories = ['./k8s', './docker', './.github/workflows'];
  
  for (const dir of directories) {
    console.log(`\n🔍 Validating ${dir}...`);
    const result = await doctor.scan(dir);
    
    console.log(`📊 Score: ${result.score}/100`);
    console.log(`📁 Files: ${result.files.length}`);
    
    if (result.totals.error > 0) {
      console.log(`❌ Errors: ${result.totals.error}`);
      process.exit(1); // Fail on errors
    }
    
    if (result.totals.warn > 0) {
      console.log(`⚠️  Warnings: ${result.totals.warn}`);
    }
  }
}

validateProjectYamls().catch(console.error);
```

#### 2. Quality gate integration
```typescript
import { YamlDoctorCore } from '@darioajr/yaml-doctor';

async function qualityGate() {
  const doctor = new YamlDoctorCore();
  const result = await doctor.scan('.');
  
  // Define quality thresholds
  const minScore = 80;
  const maxErrors = 0;
  const maxWarnings = 5;
  
  let passed = true;
  
  if (result.score < minScore) {
    console.error(`❌ Score too low: ${result.score}/${minScore}`);
    passed = false;
  }
  
  if (result.totals.error > maxErrors) {
    console.error(`❌ Too many errors: ${result.totals.error}/${maxErrors}`);
    passed = false;
  }
  
  if (result.totals.warn > maxWarnings) {
    console.error(`❌ Too many warnings: ${result.totals.warn}/${maxWarnings}`);
    passed = false;
  }
  
  if (passed) {
    console.log('✅ Quality gate passed!');
  } else {
    process.exit(1);
  }
}
```

#### 3. Custom reporting
```typescript
import { YamlDoctorCore } from '@darioajr/yaml-doctor';
import * as fs from 'fs';

async function generateCustomReport() {
  const doctor = new YamlDoctorCore();
  const result = await doctor.scan('.');
  
  // Group issues by severity
  const issuesBySeverity = {
    error: [],
    warn: [],
    info: []
  };
  
  result.files.forEach(file => {
    file.issues.forEach(issue => {
      issuesBySeverity[issue.severity].push({
        file: file.path,
        type: file.type,
        ...issue
      });
    });
  });
  
  // Generate custom report
  const report = {
    summary: {
      score: result.score,
      filesScanned: result.files.length,
      totalIssues: result.totals.error + result.totals.warn + result.totals.info
    },
    details: issuesBySeverity
  };
  
  fs.writeFileSync('custom-yaml-report.json', JSON.stringify(report, null, 2));
  console.log('📋 Custom report generated: custom-yaml-report.json');
}
```

## What does it check?

### Common Issues
- **Tabs**: Detects tab characters (recommends spaces)
- **Trailing spaces**: Finds trailing whitespace
- **Long lines**: Flags lines over 160 characters
- **Parse errors**: Invalid YAML syntax

### Docker Compose
- **Services**: Validates presence of `services` field
- **Images**: Ensures containers have `image` or `build`
- **Latest tags**: Warns against `:latest` tag usage
- **Restart policies**: Suggests restart policies

### GitHub Actions
- **Jobs**: Validates `jobs` structure
- **Steps**: Ensures steps have `uses` or `run`
- **Version pinning**: Suggests pinning action versions
- **Triggers**: Checks for `on` field

### Kubernetes
- **Required fields**: `apiVersion`, `kind`, `metadata.name`
- **Container images**: Validates image specifications
- **Resource limits**: Suggests resource limits
- **Health probes**: Recommends liveness/startup probes
- **Latest tags**: Warns against `:latest` in production

## DevOps Integration Examples

### 1. Pre-commit Hook
Add to your `.pre-commit-config.yaml`:
```yaml
repos:
  - repo: local
    hooks:
      - id: yaml-doctor
        name: YAML Doctor
        entry: yaml-doctor
        args: ['--path', '.']
        language: node
        pass_filenames: false
        always_run: true
```

### 2. Makefile Integration
```makefile
.PHONY: validate-yaml
validate-yaml:
	@echo "🔍 Validating YAML files..."
	@npx yaml-doctor --path .
	@echo "✅ YAML validation completed"

.PHONY: yaml-quality-gate
yaml-quality-gate:
	@echo "🚦 Running YAML quality gate..."
	@score=$$(npx yaml-doctor --json | jq '.score'); \
	if [ $$score -lt 80 ]; then \
		echo "❌ YAML quality gate failed: $$score/100"; \
		exit 1; \
	else \
		echo "✅ YAML quality gate passed: $$score/100"; \
	fi
```

### 3. Docker Integration
```dockerfile
# Multi-stage build with YAML validation
FROM node:18-alpine AS validator
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx yaml-doctor --path .

FROM nginx:alpine AS runtime
COPY --from=validator /app/dist /usr/share/nginx/html
```

### 4. GitHub Actions Workflow
```yaml
name: YAML Validation
on: [push, pull_request]

jobs:
  yaml-quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install yaml-doctor
        run: npm install -g @darioajr/yaml-doctor
        
      - name: Validate YAML files
        run: yaml-doctor --path .
        
      - name: Check quality gate
        run: |
          score=$(yaml-doctor --json | jq '.score')
          if [ $score -lt 85 ]; then
            echo "Quality gate failed: $score/100"
            exit 1
          fi
```

### 5. Jenkins Pipeline
```groovy
pipeline {
    agent any
    stages {
        stage('YAML Validation') {
            steps {
                sh 'npm install -g @darioajr/yaml-doctor'
                sh 'yaml-doctor --path .'
                
                script {
                    def score = sh(
                        script: 'yaml-doctor --json | jq .score',
                        returnStdout: true
                    ).trim() as Integer
                    
                    if (score < 80) {
                        error("YAML quality gate failed: ${score}/100")
                    }
                    
                    echo "YAML quality gate passed: ${score}/100"
                }
            }
        }
    }
    post {
        always {
            archiveArtifacts artifacts: 'yaml-doctor-report.*', fingerprint: true
        }
    }
}
```

## API Reference

### YamlDoctorCore

```typescript
class YamlDoctorCore {
  constructor(options?: ScanOptions)
  scan(rootPath: string): Promise<ScanResult>
  scanAndReport(rootPath: string, outputOptions?: OutputOptions): Promise<{
    result: ScanResult;
    outputs: { jsonPath?: string; htmlPath?: string; badgePath?: string; };
  }>
}
```

### Types

```typescript
interface ScanResult {
  root: string;
  files: FileResult[];
  totals: { error: number; warn: number; info: number; };
  score: number;
}

interface FileResult {
  path: string;
  type: 'docker-compose' | 'github-actions' | 'kubernetes' | 'generic';
  issues: Issue[];
}

interface Issue {
  severity: 'error' | 'warn' | 'info';
  code: string;
  message: string;
  line?: number;
}

interface ScanOptions {
  path?: string;
  ignorePatterns?: string[];
  maxScore?: number;
}

interface OutputOptions {
  generateJson?: boolean;
  generateHtml?: boolean;
  generateBadge?: boolean;
  outputDir?: string;
}
```

## Generated Files

yaml-doctor generates three types of output files:

1. **JSON Report** (`yaml-doctor-report.json`) - Complete scan results in JSON format
2. **HTML Report** (`yaml-doctor-report.html`) - Beautiful web report with styling
3. **Badge SVG** (`yaml-doctor-badge.svg`) - Score badge for README files

## Example Output

```json
{
  "root": "/path/to/project",
  "files": [
    {
      "path": "docker-compose.yml",
      "type": "docker-compose",
      "issues": [
        {
          "severity": "warn",
          "code": "compose.latestTag",
          "message": "Service \"web\" uses \"latest\" tag (non-deterministic)",
          "line": 8
        }
      ]
    }
  ],
  "totals": { "error": 0, "warn": 1, "info": 0 },
  "score": 96
}
```

## Scoring System

- **Errors**: -12 points each
- **Warnings**: -4 points each  
- **Info**: -1 point each
- **Maximum**: 100 points
- **Minimum**: 0 points

## Badge Colors

- **Green** (90-100): Excellent
- **Yellow** (75-89): Good  
- **Red** (0-74): Needs improvement

## 🚀 Automation with GitHub Actions

This project can be published automatically to npm with a `v*` tag push. The repository includes two workflows:

1. **Build and Release** (`.github/workflows/build.yml`) - Runs on every push/PR to validate the code
2. **Publish to npm** (`.github/workflows/publish.yml`) - Publishes to npm when a version tag is pushed

### Setting up automatic publishing:

1. **NPM Token**: Generate an access token in your NPM account settings
2. **GitHub Secret**: Add `NPM_TOKEN` to your repository secrets
3. **Create version tag**:
   ```bash
   npm version patch  # or minor, major
   git push origin --tags
   ```

## License

Apache-2.0

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
