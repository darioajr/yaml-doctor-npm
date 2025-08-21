#!/usr/bin/env node

import * as path from 'path';
import { YamlDoctorCore } from './index';

interface CliArgs {
  path?: string;
  json?: boolean;
  help?: boolean;
  version?: boolean;
}

function parseArgs(args: string[]): CliArgs {
  const parsed: CliArgs = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--path':
        parsed.path = args[++i];
        break;
      case '--json':
        parsed.json = true;
        break;
      case '--help':
      case '-h':
        parsed.help = true;
        break;
      case '--version':
      case '-v':
        parsed.version = true;
        break;
    }
  }
  
  return parsed;
}

function showHelp(): void {
  console.log(`
yaml-doctor - Practical YAML linting and validation

Usage:
  yaml-doctor [options]

Options:
  --path <path>     Path to scan (default: current directory)
  --json           Output only JSON to stdout
  --help, -h       Show this help message
  --version, -v    Show version number

Examples:
  yaml-doctor                    # Scan current directory
  yaml-doctor --path ./src       # Scan specific directory
  yaml-doctor --json             # Output JSON only
`);
}

function showVersion(): void {
  const packageJson = require('../package.json');
  console.log(packageJson.version);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  
  if (args.help) {
    showHelp();
    return;
  }
  
  if (args.version) {
    showVersion();
    return;
  }
  
  const scanPath = path.resolve(args.path || process.cwd());
  
  try {
    const doctor = new YamlDoctorCore();
    
    if (args.json) {
      // JSON-only output
      const result = await doctor.scan(scanPath);
      console.log(JSON.stringify(result, null, 2));
    } else {
      // Full scan with reports
      console.log(`[yaml-doctor] Scanning ${scanPath} ...`);
      
      const { result, outputs } = await doctor.scanAndReport(scanPath, {
        generateJson: true,
        generateHtml: true,
        generateBadge: true
      });
      
      console.log(`[yaml-doctor] Score: ${result.score}/100 | errors=${result.totals.error} warnings=${result.totals.warn} info=${result.totals.info}`);
      console.log('[yaml-doctor] Generated:');
      
      if (outputs.jsonPath) {
        console.log(`  - ${outputs.jsonPath}`);
      }
      if (outputs.htmlPath) {
        console.log(`  - ${outputs.htmlPath}`);
      }
      if (outputs.badgePath) {
        console.log(`  - ${outputs.badgePath}`);
      }
    }
  } catch (error) {
    console.error('[yaml-doctor] Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Run CLI if this file is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('[yaml-doctor] Fatal error:', error);
    process.exit(1);
  });
}
