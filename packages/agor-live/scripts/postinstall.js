#!/usr/bin/env node

import { existsSync, mkdirSync, symlinkSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageRoot = join(__dirname, '..');

try {
  // Create node_modules/@agor directory
  const nodeModulesAgor = join(packageRoot, 'node_modules', '@agor');
  const coreSymlink = join(nodeModulesAgor, 'core');
  // Use relative path from node_modules/@agor to dist/core
  const coreTarget = join('..', '..', 'dist', 'core');

  // Create @agor directory
  if (!existsSync(nodeModulesAgor)) {
    mkdirSync(nodeModulesAgor, { recursive: true });
  }

  // Remove existing symlink if it exists
  if (existsSync(coreSymlink)) {
    try {
      unlinkSync(coreSymlink);
    } catch (_err) {
      // Ignore errors if it's not a symlink
    }
  }

  // Create symlink (use junction on Windows for compatibility - doesn't require admin rights)
  const symlinkType = process.platform === 'win32' ? 'junction' : 'dir';
  symlinkSync(coreTarget, coreSymlink, symlinkType);
  console.log(chalk.green(`✓ Created @agor/core ${symlinkType} for package resolution`));
} catch (error) {
  // Don't fail the install if symlink creation fails
  console.warn(chalk.yellow('⚠️  Could not create @agor/core symlink:'), error.message);
  console.warn(chalk.dim('   The package may still work via the "imports" field'));
}
