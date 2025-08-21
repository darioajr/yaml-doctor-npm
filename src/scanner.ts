import * as fs from 'fs';
import * as path from 'path';
import { globby } from 'globby';
import { parseDocument } from 'yaml';
import { ScanResult, FileResult, ScanOptions } from './types';
import { detectType, computeScore } from './utils';
import { commonStyleRules, dockerComposeRules, githubActionsRules, kubernetesRules } from './rules';

const DEFAULT_IGNORE_PATTERNS = [
  '**/node_modules/**',
  '**/.git/**',
  '**/vendor/**',
  '**/target/**',
  '**/bin/**'
];

export class YamlDoctor {
  private ignorePatterns: string[];

  constructor(options: ScanOptions = {}) {
    this.ignorePatterns = options.ignorePatterns || DEFAULT_IGNORE_PATTERNS;
  }

  private readText(filePath: string): string | null {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch {
      return null;
    }
  }

  async scan(rootPath: string): Promise<ScanResult> {
    const resolvedRoot = path.resolve(rootPath);
    const patterns = ['**/*.yml', '**/*.yaml'];
    
    const files = await globby(patterns, {
      cwd: resolvedRoot,
      gitignore: true,
      ignore: this.ignorePatterns,
      absolute: true
    });

    const results: FileResult[] = [];

    for (const filePath of files) {
      const relativePath = path.relative(resolvedRoot, filePath);
      const text = this.readText(filePath);
      
      if (text === null) continue;

      const commonIssues = commonStyleRules(text);
      let parsedObject: any = null;
      let parseError: string | null = null;

      // Try to parse YAML
      try {
        const doc = parseDocument(text, { uniqueKeys: true });
        parsedObject = doc.toJS({ maxAliasCount: 50 });
      } catch (error) {
        parseError = String(error && (error as any).message || error);
      }

      const typeSpecificIssues = [];
      let fileType: FileResult['type'] = 'generic';

      if (parseError) {
        typeSpecificIssues.push({
          severity: 'error' as const,
          code: 'yaml.parse',
          message: `Error parsing YAML: ${parseError}`
        });
      } else {
        fileType = detectType(relativePath, parsedObject);
        
        switch (fileType) {
          case 'docker-compose':
            typeSpecificIssues.push(...dockerComposeRules(parsedObject));
            break;
          case 'github-actions':
            typeSpecificIssues.push(...githubActionsRules(parsedObject));
            break;
          case 'kubernetes':
            typeSpecificIssues.push(...kubernetesRules(parsedObject));
            break;
        }
      }

      const allIssues = [...commonIssues, ...typeSpecificIssues];
      results.push({
        path: relativePath,
        type: fileType,
        issues: allIssues
      });
    }

    // Calculate totals and score
    const totals = { error: 0, warn: 0, info: 0 };
    let totalScore = 100;

    results.forEach(file => {
      file.issues.forEach(issue => {
        totals[issue.severity]++;
        totalScore -= this.getSeverityWeight(issue.severity);
      });
    });

    const finalScore = Math.max(0, totalScore);

    return {
      root: resolvedRoot,
      files: results,
      totals,
      score: finalScore
    };
  }

  private getSeverityWeight(severity: 'error' | 'warn' | 'info'): number {
    switch (severity) {
      case 'error': return 12;
      case 'warn': return 4;
      case 'info': return 1;
      default: return 0;
    }
  }
}
