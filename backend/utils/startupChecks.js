/**
 * Startup Checks - Validate all required modules before server starts
 * This prevents crashes from missing exports or invalid imports
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function validateRoutes() {
  const routesDir = join(__dirname, '../routes');
  const issues = [];

  try {
    const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));

    console.log(`\n🔍 Validating ${files.length} route files...`);

    for (const file of files) {
      const filePath = join(routesDir, file);

      try {
        // Attempt to import the route
        const module = await import(`file://${filePath}`);

        // Check if it has a default export (required for Express routes)
        if (!module.default) {
          issues.push({
            file,
            issue: 'Missing default export',
            severity: 'ERROR'
          });
        }
      } catch (error) {
        issues.push({
          file,
          issue: error.message,
          severity: 'ERROR'
        });
      }
    }

    if (issues.length > 0) {
      console.error('\n❌ Route Validation Issues:\n');
      issues.forEach(({ file, issue, severity }) => {
        console.error(`  [${severity}] ${file}: ${issue}`);
      });
      return false;
    }

    console.log('✅ All routes validated successfully\n');
    return true;
  } catch (error) {
    console.error('❌ Route validation failed:', error.message);
    return false;
  }
}

export async function validateControllers() {
  const controllersDir = join(__dirname, '../controllers');
  const issues = [];

  try {
    const files = fs.readdirSync(controllersDir).filter(f => f.endsWith('.js'));

    console.log(`🔍 Validating ${files.length} controller files...`);

    for (const file of files) {
      const filePath = join(controllersDir, file);

      try {
        // Attempt to import the controller
        await import(`file://${filePath}`);
      } catch (error) {
        issues.push({
          file,
          issue: error.message,
          severity: 'ERROR'
        });
      }
    }

    if (issues.length > 0) {
      console.error('\n❌ Controller Validation Issues:\n');
      issues.forEach(({ file, issue, severity }) => {
        console.error(`  [${severity}] ${file}: ${issue}`);
      });
      return false;
    }

    console.log('✅ All controllers validated successfully\n');
    return true;
  } catch (error) {
    console.error('❌ Controller validation failed:', error.message);
    return false;
  }
}

export async function validateModels() {
  const modelsDir = join(__dirname, '../models');
  const issues = [];

  try {
    const files = fs.readdirSync(modelsDir).filter(f => f.endsWith('.js'));

    console.log(`🔍 Validating ${files.length} model files...`);

    for (const file of files) {
      const filePath = join(modelsDir, file);

      try {
        // Attempt to import the model
        const module = await import(`file://${filePath}`);

        // Check if it has a default export
        if (!module.default) {
          issues.push({
            file,
            issue: 'Missing default export',
            severity: 'WARNING'
          });
        }
      } catch (error) {
        issues.push({
          file,
          issue: error.message,
          severity: 'ERROR'
        });
      }
    }

    if (issues.filter(i => i.severity === 'ERROR').length > 0) {
      console.error('\n❌ Model Validation Issues:\n');
      issues.forEach(({ file, issue, severity }) => {
        console.error(`  [${severity}] ${file}: ${issue}`);
      });
      return false;
    }

    console.log('✅ All models validated successfully\n');
    return true;
  } catch (error) {
    console.error('❌ Model validation failed:', error.message);
    return false;
  }
}

export async function runStartupChecks() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 Running Startup Validation Checks');
  console.log('='.repeat(60));

  const checks = [
    { name: 'Models', fn: validateModels },
    { name: 'Controllers', fn: validateControllers },
    { name: 'Routes', fn: validateRoutes }
  ];

  for (const check of checks) {
    const passed = await check.fn();
    if (!passed) {
      console.error(`\n❌ ${check.name} validation failed. Server will NOT start.`);
      console.error('   Fix the issues above and restart the server.\n');
      process.exit(1);
    }
  }

  console.log('='.repeat(60));
  console.log('✅ All startup checks passed!');
  console.log('='.repeat(60) + '\n');
}
