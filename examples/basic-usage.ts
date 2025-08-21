import { YamlDoctorCore } from '../src/index';

async function example() {
  console.log('🔍 Starting YAML Doctor scan...\n');

  // Create a new instance
  const doctor = new YamlDoctorCore({
    ignorePatterns: ['**/node_modules/**', '**/.git/**']
  });

  try {
    // Scan current directory
    const result = await doctor.scan(process.cwd());

    console.log('📊 Scan Results:');
    console.log(`   Score: ${result.score}/100`);
    console.log(`   Files: ${result.files.length}`);
    console.log(`   Errors: ${result.totals.error}`);
    console.log(`   Warnings: ${result.totals.warn}`);
    console.log(`   Info: ${result.totals.info}\n`);

    // Show details for each file
    result.files.forEach(file => {
      console.log(`📄 ${file.path} (${file.type})`);
      if (file.issues.length === 0) {
        console.log('   ✅ No issues found');
      } else {
        file.issues.forEach(issue => {
          const icon = issue.severity === 'error' ? '❌' : issue.severity === 'warn' ? '⚠️' : 'ℹ️';
          console.log(`   ${icon} ${issue.severity.toUpperCase()}: ${issue.message} (${issue.code})`);
        });
      }
      console.log('');
    });

    // Generate reports
    console.log('📝 Generating reports...');
    const { outputs } = await doctor.scanAndReport(process.cwd(), {
      generateJson: true,
      generateHtml: true,
      generateBadge: true
    });

    console.log('✅ Reports generated:');
    if (outputs.jsonPath) console.log(`   📄 JSON: ${outputs.jsonPath}`);
    if (outputs.htmlPath) console.log(`   🌐 HTML: ${outputs.htmlPath}`);
    if (outputs.badgePath) console.log(`   🏷️ Badge: ${outputs.badgePath}`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the example
if (require.main === module) {
  example();
}
