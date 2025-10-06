/**
 * `agor repo worktree add <repo-slug> <name>` - Create a git worktree
 *
 * Creates an isolated working directory for a specific branch.
 */

import { createClient, isDaemonRunning } from '@agor/core/api';
import { hasRemoteBranch } from '@agor/core/git';
import type { Repo } from '@agor/core/types';
import { Args, Command, Flags } from '@oclif/core';
import chalk from 'chalk';

export default class WorktreeAdd extends Command {
  static description = 'Create a git worktree for isolated development';

  static examples = [
    '<%= config.bin %> <%= command.id %> myapp feat-auth',
    '<%= config.bin %> <%= command.id %> myapp fix-cors --ref main',
  ];

  static args = {
    repoSlug: Args.string({
      description: 'Repository slug',
      required: true,
    }),
    name: Args.string({
      description: 'Worktree name (becomes branch name if creating new)',
      required: true,
    }),
  };

  static flags = {
    ref: Flags.string({
      char: 'r',
      description: 'Branch/tag/commit to checkout (defaults to matching branch or default branch)',
    }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(WorktreeAdd);

    // Check if daemon is running
    const daemonUrl = process.env.AGOR_DAEMON_URL || 'http://localhost:3030';
    const running = await isDaemonRunning(daemonUrl);

    if (!running) {
      this.error(
        `Daemon not running. Start it with: ${chalk.cyan('cd apps/agor-daemon && pnpm dev')}`
      );
    }

    try {
      const client = createClient(daemonUrl);
      const reposService = client.service('repos');

      // Fetch repo by slug
      // biome-ignore lint/suspicious/noExplicitAny: Feathers service methods not properly typed
      const repos = await (reposService as any).find({
        query: { slug: args.repoSlug, $limit: 1 },
      });

      const reposList = Array.isArray(repos) ? repos : repos.data;
      if (!reposList || reposList.length === 0) {
        this.error(
          `Repository '${args.repoSlug}' not found. Use ${chalk.cyan('agor repo list')} to see available repos.`
        );
      }

      const repo = reposList[0] as Repo;

      if (!repo.managed_by_agor) {
        this.error(
          `Repository '${args.repoSlug}' is not managed by Agor. Only Agor-managed repos support worktrees.`
        );
      }

      // Check if worktree already exists
      const existing = repo.worktrees.find((w) => w.name === args.name);
      if (existing) {
        this.error(`Worktree '${args.name}' already exists at ${existing.path}`);
      }

      this.log('');
      this.log(
        chalk.bold(
          `Creating worktree ${chalk.cyan(args.name)} in repository ${chalk.cyan(args.repoSlug)}...`
        )
      );
      this.log('');

      // Determine ref
      const ref = flags.ref || args.name;
      let createBranch = false;

      // Check if remote branch exists
      const remoteBranchExists = await hasRemoteBranch(repo.local_path, ref);

      if (remoteBranchExists) {
        this.log(chalk.dim(`  Remote branch ${chalk.cyan(`origin/${ref}`)} found`));
      } else {
        this.log(chalk.dim(`  Branch ${chalk.cyan(ref)} does not exist`));
        this.log(
          chalk.dim(`  Creating new branch from ${chalk.cyan(repo.default_branch || 'HEAD')}`)
        );
        createBranch = true;
      }

      // Call daemon API to create worktree
      // biome-ignore lint/suspicious/noExplicitAny: Dynamic Feathers service route not in ServiceTypes
      const updatedRepo = (await (
        // biome-ignore lint/suspicious/noExplicitAny: Feathers service typing limitation for custom routes
        client.service(`repos/${repo.repo_id}/worktrees` as any) as any
      ).create({
        name: args.name,
        ref,
        createBranch,
      })) as Repo;

      this.log(`${chalk.green('✓')} Worktree created and registered`);

      const worktree = updatedRepo.worktrees.find((w) => w.name === args.name);
      if (worktree) {
        this.log(chalk.dim(`  Path: ${worktree.path}`));
      }

      this.log('');
      this.log(chalk.bold('Next steps:'));
      this.log(`  ${chalk.dim('cd')} ${worktree?.path}`);
      this.log(
        `  ${chalk.dim('or start session:')} ${chalk.cyan(`agor session start --repo ${args.repoSlug} --worktree ${args.name}`)}`
      );
      this.log('');

      // Close socket
      client.io.close();
      process.exit(0);
    } catch (error) {
      this.error(
        `Failed to create worktree: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
