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

### CLI Options
- `--path <path>` - Path to scan (default: current directory)
- `--json` - Output only JSON to stdout
- `--help, -h` - Show help message
- `--version, -v` - Show version number

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
