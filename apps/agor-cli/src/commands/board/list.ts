/**
 * List all boards
 */

import { createClient } from '@agor/core/api';
import type { Board, BoardEntityObject } from '@agor/core/types';
import { Command } from '@oclif/core';
import chalk from 'chalk';
import Table from 'cli-table3';

export default class BoardList extends Command {
  static override description = 'List all boards';

  static override examples = ['<%= config.bin %> <%= command.id %>'];

  public async run(): Promise<void> {
    const client = createClient();

    try {
      // Fetch boards
      const result = await client.service('boards').find();
      const boards = (Array.isArray(result) ? result : result.data) as Board[];

      if (boards.length === 0) {
        this.log(chalk.yellow('No boards found.'));
        await this.cleanup(client);
        return;
      }

      // Fetch board objects to count worktrees per board
      const boardObjectsResult = await client.service('board-objects').find();
      const boardObjects = (
        Array.isArray(boardObjectsResult) ? boardObjectsResult : boardObjectsResult.data
      ) as BoardEntityObject[];

      // Create table
      const table = new Table({
        head: [
          chalk.cyan('ID'),
          chalk.cyan('Name'),
          chalk.cyan('Worktrees'),
          chalk.cyan('Description'),
          chalk.cyan('Created'),
        ],
        colWidths: [12, 20, 12, 40, 12],
        wordWrap: true,
      });

      // Add rows
      for (const board of boards) {
        const worktreeCount = boardObjects.filter(bo => bo.board_id === board.board_id).length;
        table.push([
          board.board_id.substring(0, 8),
          `${board.icon || '📋'} ${board.name}`,
          worktreeCount.toString(),
          board.description || '',
          new Date(board.created_at).toLocaleDateString(),
        ]);
      }

      this.log(table.toString());
      this.log(chalk.gray(`\nTotal: ${boards.length} board(s)`));
    } catch (error) {
      this.log(chalk.red('✗ Failed to fetch boards'));
      if (error instanceof Error) {
        this.log(chalk.red(error.message));
      }
      await this.cleanup(client);
      process.exit(1);
    }

    await this.cleanup(client);
  }

  private async cleanup(client: import('@agor/core/api').AgorClient): Promise<void> {
    await new Promise<void>(resolve => {
      client.io.once('disconnect', () => resolve());
      client.io.close();
      setTimeout(() => resolve(), 1000);
    });
  }
}
