/**
 * `agor repo add <url>` - Clone a repository for use with Agor
 *
 * Clones the repo to ~/.agor/repos/<name> and registers it with the daemon.
 */

import { createClient, isDaemonRunning } from '@agor/core/api';
import { extractRepoName } from '@agor/core/git';
import type { Repo } from '@agor/core/types';
import { Args, Command } from '@oclif/core';
import chalk from 'chalk';

export default class RepoAdd extends Command {
  static description = 'Clone and register a Git repository';

  static examples = [
    '<%= config.bin %> <%= command.id %> git@github.com:apache/superset.git',
    '<%= config.bin %> <%= command.id %> https://github.com/facebook/react.git',
  ];

  static args = {
    url: Args.string({
      description: 'Git repository URL (SSH or HTTPS)',
      required: true,
    }),
  };

  async run(): Promise<void> {
    const { args } = await this.parse(RepoAdd);

    // Check if daemon is running
    const daemonUrl = process.env.AGOR_DAEMON_URL || 'http://localhost:3030';
    const running = await isDaemonRunning(daemonUrl);

    if (!running) {
      this.error(
        `Daemon not running. Start it with: ${chalk.cyan('cd apps/agor-daemon && pnpm dev')}`
      );
    }

    try {
      const repoName = extractRepoName(args.url);

      this.log('');
      this.log(chalk.bold(`Cloning ${chalk.cyan(repoName)}...`));
      this.log(chalk.dim(`URL: ${args.url}`));
      this.log('');

      // Call daemon API to clone repo
      const client = createClient(daemonUrl);

      const repo = (await client.service('repos/clone').create({
        url: args.url,
        slug: repoName,
      })) as Repo;

      this.log(`${chalk.green('✓')} Repository cloned and registered`);
      this.log(chalk.dim(`  Path: ${repo.local_path}`));
      this.log(chalk.dim(`  Default branch: ${repo.default_branch}`));
      this.log('');
      this.log(chalk.bold('Repository Details:'));
      this.log(`  ${chalk.cyan('ID')}: ${repo.repo_id}`);
      this.log(`  ${chalk.cyan('Name')}: ${repo.name}`);
      this.log(`  ${chalk.cyan('Path')}: ${repo.local_path}`);
      this.log(`  ${chalk.cyan('Default Branch')}: ${repo.default_branch}`);
      this.log('');

      // Close socket
      client.io.close();
      process.exit(0);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      // Check for common errors
      if (message.includes('already exists')) {
        this.error(
          `Repository already exists. Use ${chalk.cyan('agor repo list')} to see registered repos.`
        );
      } else if (message.includes('Permission denied')) {
        this.error('Permission denied. Make sure you have SSH keys configured or use HTTPS URL.');
      } else if (message.includes('Could not resolve host')) {
        this.error('Network error. Check your internet connection and try again.');
      }

      this.error(`Failed to add repository: ${message}`);
    }
  }
}
