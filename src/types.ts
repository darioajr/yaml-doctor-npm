export interface Issue {
  severity: 'error' | 'warn' | 'info';
  code: string;
  message: string;
  line?: number;
}

export interface FileResult {
  path: string;
  type: 'docker-compose' | 'github-actions' | 'kubernetes' | 'generic';
  issues: Issue[];
}

export interface ScanResult {
  root: string;
  files: FileResult[];
  totals: {
    error: number;
    warn: number;
    info: number;
  };
  score: number;
}

export interface ScanOptions {
  path?: string;
  ignorePatterns?: string[];
  maxScore?: number;
}

export interface OutputOptions {
  generateJson?: boolean;
  generateHtml?: boolean;
  generateBadge?: boolean;
  outputDir?: string;
}

export interface Container {
  image?: string;
  resources?: {
    limits?: Record<string, string>;
  };
  livenessProbe?: any;
  startupProbe?: any;
}

export interface ContainerInfo {
  container: Container;
  path: string;
}
