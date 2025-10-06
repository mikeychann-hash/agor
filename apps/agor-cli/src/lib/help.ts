/**
 * Custom Help Class
 *
 * Extends oclif's default help to show our hero banner
 */

import { Help } from '@oclif/core';
import { getBanner } from './banner.js';

export default class CustomHelp extends Help {
  async showRootHelp(): Promise<void> {
    // Show hero banner first
    this.log(getBanner());

    // Then show standard help
    return super.showRootHelp();
  }
}
