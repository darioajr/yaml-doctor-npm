# 🧪 Testing @darioajr/yaml-doctor

This document shows how to test the yaml-doctor package after installation.

## Quick Test Commands

### 1. Install the package globally
```bash
npm install -g @darioajr/yaml-doctor
```

### 2. Test CLI functionality
```bash
# Show help
yaml-doctor --help

# Scan current directory
yaml-doctor

# Scan specific directory
yaml-doctor --path ./src

# JSON output only
yaml-doctor --path ./src --json
```

### 3. Test programmatic usage

Create a test file `test-yaml-doctor.js`:

```javascript
const { YamlDoctorCore } = require('@darioajr/yaml-doctor');

async function test() {
  const doctor = new YamlDoctorCore();
  
  // Scan current directory
  const result = await doctor.scan('.');
  
  console.log('🎯 Results:');
  console.log(`Score: ${result.score}/100`);
  console.log(`Files scanned: ${result.files.length}`);
  console.log(`Errors: ${result.totals.error}`);
  console.log(`Warnings: ${result.totals.warn}`);
  console.log(`Info: ${result.totals.info}`);
  
  // Generate reports
  const { outputs } = await doctor.scanAndReport('.', {
    generateJson: true,
    generateHtml: true,
    generateBadge: true
  });
  
  console.log('\n📁 Generated files:');
  Object.entries(outputs).forEach(([type, path]) => {
    if (path) console.log(`${type}: ${path}`);
  });
}

test().catch(console.error);
```

Run it:
```bash
node test-yaml-doctor.js
```

### 4. Test TypeScript usage

Create a test file `test-yaml-doctor.ts`:

```typescript
import { YamlDoctorCore, ScanResult } from '@darioajr/yaml-doctor';

async function testTypeScript(): Promise<void> {
  const doctor = new YamlDoctorCore({
    ignorePatterns: ['**/node_modules/**']
  });
  
  try {
    const result: ScanResult = await doctor.scan('./src');
    
    console.log(`TypeScript test - Score: ${result.score}/100`);
    
    // Process each file
    result.files.forEach(file => {
      console.log(`\n📄 ${file.path} (${file.type})`);
      file.issues.forEach(issue => {
        console.log(`  ${issue.severity}: ${issue.message}`);
      });
    });
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testTypeScript();
```

Compile and run:
```bash
npx tsc test-yaml-doctor.ts --target es2020 --module commonjs
node test-yaml-doctor.js
```

## Expected Outputs

### CLI Help Output
```
yaml-doctor - Practical YAML linting and validation

Usage:
  yaml-doctor [options]

Options:
  --path <path>     Path to scan (default: current directory)
  --json           Output only JSON to stdout
  --help, -h       Show this help message
  --version, -v    Show version number
```

### Scan Results
```
[yaml-doctor] Scanning /path/to/project ...
[yaml-doctor] Score: 85/100 | errors=0 warnings=2 info=3
[yaml-doctor] Generated:
  - /path/to/project/yaml-doctor-report.json
  - /path/to/project/yaml-doctor-report.html
  - /path/to/project/yaml-doctor-badge.svg
```

### JSON Output Sample
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
          "message": "Service \"web\" uses \"latest\" tag (non-deterministic)"
        }
      ]
    }
  ],
  "totals": { "error": 0, "warn": 1, "info": 0 },
  "score": 96
}
```

## Troubleshooting

### Issue: Command not found
```bash
# Make sure the package is installed globally
npm list -g @darioajr/yaml-doctor

# Or install it
npm install -g @darioajr/yaml-doctor
```

### Issue: TypeScript types not found
```bash
# Install types (if needed)
npm install @types/node

# Or use the built-in TypeScript definitions
# (they're included in the package)
```

### Issue: Permission errors
```bash
# On Linux/Mac, you might need sudo for global installation
sudo npm install -g @darioajr/yaml-doctor
```
