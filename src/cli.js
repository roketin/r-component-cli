import { program } from 'commander';
import { initCommand } from './commands/init.js';
import { addCommand } from './commands/add.js';
import { listCommand } from './commands/list.js';
import { version, name, description } from './lib/package-info.js';

export async function run() {
  program
    .name(name)
    .description(description)
    .version(version);

  program
    .command('init')
    .description('Initialize r-component configuration in your project')
    .option('-y, --yes', 'Skip confirmation prompts and use defaults')
    .option('-c, --cwd <path>', 'Working directory (default: current directory)')
    .action(initCommand);

  program
    .command('add [components...]')
    .description('Add component(s) to your project')
    .option('-y, --yes', 'Skip confirmation prompts')
    .option('-o, --overwrite', 'Overwrite existing files')
    .option('-c, --cwd <path>', 'Working directory (default: current directory)')
    .option('-a, --all', 'Add all available components')
    .action(addCommand);

  program
    .command('list')
    .description('List all available components')
    .option('--json', 'Output as JSON')
    .action(listCommand);

  program.parse();
}
