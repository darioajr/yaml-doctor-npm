import { Issue, ContainerInfo } from './types';
import { createIssue } from './utils';

export function commonStyleRules(text: string): Issue[] {
  const issues: Issue[] = [];
  const lines = text.split(/\r?\n/);
  
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    
    // Check for tabs
    if (/\t/.test(line)) {
      issues.push(createIssue('warn', 'style.tabs', 'Tab found (use spaces)', lineNumber));
    }
    
    // Check for trailing whitespace
    if (/\s$/.test(line)) {
      issues.push(createIssue('info', 'style.trailingSpace', 'Trailing whitespace at end of line', lineNumber));
    }
    
    // Check for long lines
    if (line.length > 160) {
      issues.push(createIssue('info', 'style.lineLength', 'Line with >160 columns', lineNumber));
    }
  });
  
  return issues;
}

export function dockerComposeRules(obj: any): Issue[] {
  const issues: Issue[] = [];
  
  if (!obj.services || typeof obj.services !== 'object') {
    issues.push(createIssue('error', 'compose.missingServices', 'Missing "services" field'));
    return issues;
  }
  
  for (const [serviceName, service] of Object.entries(obj.services)) {
    if (!service || typeof service !== 'object') continue;
    
    const svc = service as any;
    const hasImage = typeof svc.image === 'string';
    const hasBuild = !!svc.build;
    
    if (!hasImage && !hasBuild) {
      issues.push(createIssue('warn', 'compose.imageOrBuild', `Service "${serviceName}" without "image" or "build"`));
    }
    
    if (hasImage && /:latest$/.test(svc.image)) {
      issues.push(createIssue('warn', 'compose.latestTag', `Service "${serviceName}" uses "latest" tag (non-deterministic)`));
    }
    
    if (!svc.restart) {
      issues.push(createIssue('info', 'compose.restart', `Service "${serviceName}" without "restart" policy`));
    }
  }
  
  return issues;
}

export function githubActionsRules(obj: any): Issue[] {
  const issues: Issue[] = [];
  
  if (!obj.jobs || typeof obj.jobs !== 'object') {
    issues.push(createIssue('error', 'gha.missingJobs', 'Missing "jobs" field'));
    return issues;
  }
  
  for (const [jobName, job] of Object.entries(obj.jobs)) {
    if (!job || typeof job !== 'object') continue;
    
    const jobObj = job as any;
    
    if (!jobObj.steps) {
      issues.push(createIssue('warn', 'gha.missingSteps', `Job "${jobName}" without "steps"`));
      continue;
    }
    
    if (Array.isArray(jobObj.steps)) {
      jobObj.steps.forEach((step: any, index: number) => {
        if (!step.uses && !step.run) {
          issues.push(createIssue('warn', 'gha.stepNoUsesOrRun', `Job "${jobName}", step ${index + 1}: use "uses" or "run"`));
        }
        
        if (typeof step.uses === 'string' && /@v?\d+(\.\d+)?(\.\d+)?$/.test(step.uses) === false && step.uses) {
          issues.push(createIssue('info', 'gha.pinVersion', `Job "${jobName}", step ${index + 1}: pin version (e.g. @v4)`));
        }
      });
    }
    
    if (!jobObj['runs-on']) {
      issues.push(createIssue('warn', 'gha.missingRunsOn', `Job "${jobName}" without "runs-on"`));
    }
  }
  
  if (!obj.on) {
    issues.push(createIssue('info', 'gha.missingOn', 'Missing "on" field (triggers)'));
  }
  
  return issues;
}

export function kubernetesRules(obj: any): Issue[] {
  const issues: Issue[] = [];
  
  if (!obj.apiVersion) {
    issues.push(createIssue('error', 'k8s.apiVersion', 'Missing apiVersion'));
  }
  
  if (!obj.kind) {
    issues.push(createIssue('error', 'k8s.kind', 'Missing kind'));
  }
  
  if (!obj.metadata || !obj.metadata.name) {
    issues.push(createIssue('error', 'k8s.metadata', 'Missing metadata.name'));
  }
  
  // Find and validate containers
  const containers = findContainers(obj);
  containers.forEach(({ container, path: containerPath }) => {
    if (!container.image) {
      issues.push(createIssue('warn', 'k8s.image', `${containerPath}: container without "image"`));
    }
    
    if (container.image && /:latest$/.test(container.image)) {
      issues.push(createIssue('warn', 'k8s.latestTag', `${containerPath}: image uses "latest" tag`));
    }
    
    if (!container.resources || !container.resources.limits) {
      issues.push(createIssue('warn', 'k8s.limits', `${containerPath}: define "resources.limits"`));
    }
    
    if (!container.livenessProbe && !container.startupProbe) {
      issues.push(createIssue('info', 'k8s.probes', `${containerPath}: consider liveness/startup probes`));
    }
  });
  
  return issues;
}

function findContainers(obj: any): ContainerInfo[] {
  const result: ContainerInfo[] = [];
  
  function walk(o: any, path = '$'): void {
    if (!o || typeof o !== 'object') return;
    
    if (o.containers && Array.isArray(o.containers)) {
      o.containers.forEach((container: any, index: number) => {
        result.push({
          container,
          path: `${path}.containers[${index}]`
        });
      });
    }
    
    for (const [key, value] of Object.entries(o)) {
      walk(value, `${path}.${key}`);
    }
  }
  
  walk(obj);
  return result;
}
