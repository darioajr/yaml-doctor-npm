import { Issue } from './types';

export function createIssue(
  severity: 'error' | 'warn' | 'info',
  code: string,
  message: string,
  line?: number
): Issue {
  return { severity, code, message, line };
}

export function severityWeight(severity: 'error' | 'warn' | 'info'): number {
  switch (severity) {
    case 'error':
      return 12;
    case 'warn':
      return 4;
    case 'info':
      return 1;
    default:
      return 0;
  }
}

export function computeScore(issues: Issue[]): number {
  let score = 100;
  for (const issue of issues) {
    score -= severityWeight(issue.severity);
  }
  return Math.max(0, score);
}

export function detectType(filePath: string, rootObj: any): 'docker-compose' | 'github-actions' | 'kubernetes' | 'generic' {
  const lower = filePath.toLowerCase();
  
  if (lower.includes('.github/workflows/')) {
    return 'github-actions';
  }
  
  if (rootObj && typeof rootObj === 'object') {
    const keys = Object.keys(rootObj || {});
    
    if (keys.includes('services')) {
      return 'docker-compose';
    }
    
    if (keys.includes('apiVersion') && keys.includes('kind')) {
      return 'kubernetes';
    }
  }
  
  return 'generic';
}
