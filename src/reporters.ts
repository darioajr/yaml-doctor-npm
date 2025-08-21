import { ScanResult } from './types';

export function generateBadgeSVG(score: number): string {
  const color = score >= 90 ? '#2ebc4f' : score >= 75 ? '#dfb317' : '#e05d44';
  const label = 'yaml-doctor';
  const value = `${score}/100`;
  const w1 = 88;
  const w2 = 62;
  
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${w1 + w2}" height="20" role="img" aria-label="${label}: ${value}">
  <linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient>
  <rect rx="3" width="${w1 + w2}" height="20" fill="#555"/>
  <rect rx="3" x="${w1}" width="${w2}" height="20" fill="${color}"/>
  <path fill="${color}" d="M${w1} 0h4v20h-4z"/>
  <rect rx="3" width="${w1 + w2}" height="20" fill="url(#s)"/>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
    <text x="${w1/2}" y="14">${label}</text>
    <text x="${w1 + w2/2}" y="14">${value}</text>
  </g>
</svg>`.trim();
}

export function generateHTMLReport(result: ScanResult): string {
  const rows = result.files.map(file => {
    const issuesList = file.issues.map(issue =>
      `<li class="i ${issue.severity}"><span class="sev">${issue.severity.toUpperCase()}</span> ${issue.message}${issue.line ? ` <em>(line ${issue.line})</em>` : ''} <code>${issue.code}</code></li>`
    ).join('');
    
    return `<section class="file"><h3>${file.path} <small>(${file.type})</small></h3><ul>${issuesList || '<li class="ok">No issues</li>'}</ul></section>`;
  }).join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>yaml-doctor – report</title>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<style>
body{font:14px system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial; margin:24px; color:#222}
h1{margin:0 0 4px} .muted{color:#666}
.sum{display:flex;align-items:center;gap:16px;margin:8px 0 24px}
.badge{border:1px solid #ddd;border-radius:6px;padding:8px;background:#fafafa}
.file{margin:16px 0}
ul{padding-left:18px}
.i{margin:4px 0}
.i .sev{font-weight:700;margin-right:6px}
.i.error{color:#b00020} .i.warn{color:#b19600} .i.info{color:#444}
.ok{color:#2e7d32}
code{background:#f5f5f5;padding:1px 4px;border-radius:4px}
small{color:#666}
footer{margin-top:32px;color:#777}
a.btn{display:inline-block;padding:6px 10px;border:1px solid #ddd;border-radius:6px;text-decoration:none}
</style>
</head>
<body>
<h1>yaml-doctor</h1>
<div class="muted">Scan at: <code>${result.root}</code> • Files: ${result.files.length}</div>

<div class="sum">
  <div class="badge"><img src="./yaml-doctor-badge.svg" alt="badge"/></div>
  <div>
    <div><b>Score:</b> ${result.score}/100</div>
    <div>Errors: ${result.totals.error} • Warnings: ${result.totals.warn} • Info: ${result.totals.info}</div>
    <div style="margin-top:8px">
      <a class="btn" href="./yaml-doctor-report.json" download>Download JSON</a>
      <a class="btn" href="./yaml-doctor-badge.svg" download>Download badge</a>
    </div>
  </div>
</div>

${rows}

<footer>
  <p>Tip: post the badge image and tag <code>#yaml</code> <code>#kubernetes</code> <code>#docker</code> <code>#devops</code>.</p>
</footer>
</body>
</html>`;
}
