/**
 * Cross-Platform Executable Finder
 *
 * Provides utilities for finding executables in a cross-platform manner.
 * Replaces Unix-specific `which` command with Node.js fs checks.
 */

import { execSync } from 'node:child_process';
import { accessSync, constants, existsSync } from 'node:fs';
import { basename } from 'node:path';
import { isWindows } from './platform-constants';

/**
 * Common installation paths for executables by platform
 */
const COMMON_PATHS = {
  git: isWindows
    ? [
        'C:\\Program Files\\Git\\bin\\git.exe',
        'C:\\Program Files (x86)\\Git\\bin\\git.exe',
        process.env.LOCALAPPDATA
          ? `${process.env.LOCALAPPDATA}\\Programs\\Git\\bin\\git.exe`
          : null,
        process.env.ProgramFiles ? `${process.env.ProgramFiles}\\Git\\bin\\git.exe` : null,
      ].filter(Boolean)
    : [
        '/opt/homebrew/bin/git', // Homebrew on Apple Silicon
        '/usr/local/bin/git', // Homebrew on Intel
        '/usr/bin/git', // System git (Docker and Linux)
      ],
  claude: isWindows
    ? [
        process.env.LOCALAPPDATA ? `${process.env.LOCALAPPDATA}\\npm\\claude.cmd` : null,
        process.env.APPDATA ? `${process.env.APPDATA}\\npm\\claude.cmd` : null,
        process.env.ProgramFiles ? `${process.env.ProgramFiles}\\nodejs\\claude.cmd` : null,
      ].filter(Boolean)
    : [
        '/usr/local/bin/claude',
        '/opt/homebrew/bin/claude',
        process.env.HOME ? `${process.env.HOME}/.nvm/versions/node/v20.19.4/bin/claude` : null,
      ].filter(Boolean),
  codex: isWindows
    ? [
        process.env.LOCALAPPDATA ? `${process.env.LOCALAPPDATA}\\npm\\codex.cmd` : null,
        process.env.APPDATA ? `${process.env.APPDATA}\\npm\\codex.cmd` : null,
      ].filter(Boolean)
    : ['/usr/local/bin/codex', '/opt/homebrew/bin/codex'],
  gemini: isWindows
    ? [
        process.env.LOCALAPPDATA ? `${process.env.LOCALAPPDATA}\\npm\\gemini.cmd` : null,
        process.env.APPDATA ? `${process.env.APPDATA}\\npm\\gemini.cmd` : null,
      ].filter(Boolean)
    : ['/usr/local/bin/gemini', '/opt/homebrew/bin/gemini'],
};

/**
 * Check if an executable exists and is executable
 * Replaces: execSync('test -x "${path}"')
 *
 * On Windows: Only checks if file exists (no +x bit)
 * On Unix: Checks both existence and executable permission
 */
export function isExecutable(path: string): boolean {
  try {
    if (!existsSync(path)) {
      return false;
    }

    // Windows doesn't use executable bit - just check existence
    if (isWindows) {
      return true;
    }

    // On Unix, check executable permission
    accessSync(path, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Find an executable in common paths or PATH
 * Replaces: execSync('which <name>')
 *
 * @param name - Executable name (e.g., 'git', 'claude', 'codex')
 * @param commonPaths - Optional array of common paths to check first
 * @returns Path to executable or null if not found
 */
export function findExecutable(name: string, commonPaths?: string[]): string | null {
  // Check common paths first
  const paths = commonPaths || COMMON_PATHS[name as keyof typeof COMMON_PATHS] || [];

  for (const path of paths) {
    if (path && isExecutable(path)) {
      return path;
    }
  }

  // Fall back to checking PATH using where (Windows) or which (Unix)
  try {
    const command = isWindows ? `where ${name}` : `which ${name}`;
    const result = execSync(command, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] });
    const foundPath = result.trim().split('\n')[0]; // where can return multiple paths
    if (foundPath && existsSync(foundPath)) {
      return foundPath;
    }
  } catch {
    // Command failed - executable not in PATH
  }

  return null;
}

/**
 * Get git binary path with cross-platform fallbacks
 */
export function getGitBinary(): string | undefined {
  return findExecutable('git') || undefined;
}

/**
 * Get Claude Code executable path with cross-platform fallbacks
 */
export function getClaudeCodePath(): string {
  const path = findExecutable('claude');
  if (path) return path;

  throw new Error(
    'Claude Code executable not found. Install with: npm install -g @anthropic-ai/claude-code'
  );
}

/**
 * Get Codex executable path with cross-platform fallbacks
 */
export function getCodexPath(): string | null {
  return findExecutable('codex');
}

/**
 * Get Gemini executable path with cross-platform fallbacks
 */
export function getGeminiPath(): string | null {
  return findExecutable('gemini');
}
