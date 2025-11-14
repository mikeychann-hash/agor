/**
 * Platform-Specific Constants
 *
 * Provides cross-platform equivalents for OS-specific values.
 * Handles differences between Unix (Linux/macOS) and Windows.
 */

import os from 'node:os';

/**
 * Check if running on Windows
 */
export const isWindows = os.platform() === 'win32';

/**
 * Check if running on macOS
 */
export const isMacOS = os.platform() === 'darwin';

/**
 * Check if running on Linux
 */
export const isLinux = os.platform() === 'linux';

/**
 * Null device for discarding output
 * - Unix: /dev/null
 * - Windows: NUL
 */
export const NULL_DEVICE = isWindows ? 'NUL' : '/dev/null';

/**
 * Home directory path
 * - Unix: $HOME
 * - Windows: $USERPROFILE
 */
export function getHomeDir(): string {
  return process.env.HOME || process.env.USERPROFILE || os.homedir();
}

/**
 * Get platform-specific shell
 * - Unix: $SHELL or /bin/bash
 * - Windows: powershell.exe or cmd.exe
 */
export function getDefaultShell(): string {
  if (isWindows) {
    // Prefer PowerShell on Windows
    return process.env.COMSPEC || 'powershell.exe';
  }
  return process.env.SHELL || '/bin/bash';
}

/**
 * Get shell arguments for interactive mode
 * - Unix: ['-i'] for bash/zsh
 * - Windows: [] (no -i flag)
 */
export function getShellInteractiveArgs(shell: string): string[] {
  if (isWindows) {
    // Windows shells don't use -i flag
    return [];
  }
  // Unix shells use -i for interactive mode
  return ['-i'];
}

/**
 * Platform-specific temporary directory
 */
export function getTempDir(): string {
  return os.tmpdir();
}

/**
 * Path separator
 * - Unix: :
 * - Windows: ;
 */
export const PATH_SEPARATOR = isWindows ? ';' : ':';
