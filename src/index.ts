import * as fs from 'fs';
import * as path from 'path';
import { YamlDoctor } from './scanner';
import { generateBadgeSVG, generateHTMLReport } from './reporters';
import { ScanResult, ScanOptions, OutputOptions } from './types';

export { YamlDoctor, ScanResult, ScanOptions, OutputOptions };
export * from './types';
export * from './utils';
export * from './rules';
export * from './reporters';

export class YamlDoctorCore {
  private doctor: YamlDoctor;

  constructor(options: ScanOptions = {}) {
    this.doctor = new YamlDoctor(options);
  }

  async scan(rootPath: string): Promise<ScanResult> {
    return this.doctor.scan(rootPath);
  }

  async scanAndReport(
    rootPath: string,
    outputOptions: OutputOptions = {}
  ): Promise<{
    result: ScanResult;
    outputs: {
      jsonPath?: string;
      htmlPath?: string;
      badgePath?: string;
    };
  }> {
    const result = await this.scan(rootPath);
    const outputs: { jsonPath?: string; htmlPath?: string; badgePath?: string } = {};
    
    const outputDir = outputOptions.outputDir || rootPath;

    // Generate JSON report
    if (outputOptions.generateJson !== false) {
      const jsonPath = path.join(outputDir, 'yaml-doctor-report.json');
      fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2), 'utf8');
      outputs.jsonPath = jsonPath;
    }

    // Generate HTML report
    if (outputOptions.generateHtml !== false) {
      const htmlPath = path.join(outputDir, 'yaml-doctor-report.html');
      const htmlContent = generateHTMLReport(result);
      fs.writeFileSync(htmlPath, htmlContent, 'utf8');
      outputs.htmlPath = htmlPath;
    }

    // Generate badge SVG
    if (outputOptions.generateBadge !== false) {
      const badgePath = path.join(outputDir, 'yaml-doctor-badge.svg');
      const badgeContent = generateBadgeSVG(result.score);
      fs.writeFileSync(badgePath, badgeContent, 'utf8');
      outputs.badgePath = badgePath;
    }

    return { result, outputs };
  }
}

// Default export for convenience
export default YamlDoctorCore;
