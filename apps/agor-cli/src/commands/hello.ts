import { Command } from '@oclif/core';

export default class Hello extends Command {
  static description = 'Test command to verify CLI setup';

  static examples = ['<%= config.bin %> <%= command.id %>'];

  async run(): Promise<void> {
    this.log('🚀 Agor CLI is working!');
    this.log('Next steps: Implement session management commands');
  }
}
