import prompts from 'prompts';
import path from 'path';
import { logger, highlight, bold } from '../lib/logger.js';
import { 
  configExists, 
  writeConfig, 
  getDefaultConfig,
  CONFIG_FILE_NAME 
} from '../lib/config.js';
import { fileExists } from '../lib/fs-utils.js';

export async function initCommand(options) {
  const cwd = options.cwd ? path.resolve(options.cwd) : process.cwd();

  logger.break();
  console.log(bold('R-Component CLI'));
  logger.info('Initializing project configuration...');
  logger.break();

  // Check if config already exists
  if (configExists(cwd)) {
    if (!options.yes) {
      const { overwrite } = await prompts({
        type: 'confirm',
        name: 'overwrite',
        message: `${CONFIG_FILE_NAME} already exists. Overwrite?`,
        initial: false,
      });
      if (!overwrite) {
        logger.skip('Initialization cancelled.');
        return;
      }
    }
  }

  // Check for TypeScript
  const hasTypescript = fileExists(path.join(cwd, 'tsconfig.json'));
  
  // Check for common src structures
  const hasSrcDir = fileExists(path.join(cwd, 'src'));
  
  const defaultConfig = getDefaultConfig();
  let config = { ...defaultConfig };

  if (!options.yes) {
    const responses = await prompts([
      {
        type: 'text',
        name: 'baseDir',
        message: 'Where would you like to install components?',
        initial: hasSrcDir ? 'src/components' : 'components',
      },
      {
        type: 'text',
        name: 'componentsDir',
        message: 'Component subdirectory name:',
        initial: 'base',
      },
      {
        type: 'text',
        name: 'libsDir',
        message: 'Libs directory (relative to baseDir parent):',
        initial: 'libs',
      },
      {
        type: 'confirm',
        name: 'typescript',
        message: 'Are you using TypeScript?',
        initial: hasTypescript,
      },
      {
        type: 'text',
        name: 'componentsAlias',
        message: 'Path alias for components:',
        initial: '@/components',
      },
      {
        type: 'text',
        name: 'libsAlias',
        message: 'Path alias for libs:',
        initial: '@/libs',
      },
    ]);

    if (!responses.baseDir) {
      logger.skip('Initialization cancelled.');
      return;
    }

    config = {
      ...config,
      baseDir: responses.baseDir,
      componentsDir: responses.componentsDir,
      libsDir: responses.libsDir,
      typescript: responses.typescript,
      aliases: {
        components: responses.componentsAlias,
        libs: responses.libsAlias,
      },
    };
  } else {
    config.typescript = hasTypescript;
    if (hasSrcDir) {
      config.baseDir = 'src/components';
    }
  }

  // Remove schema and registry from consumer config (kept only in CLI defaults)
  const consumerConfig = {
    baseDir: config.baseDir,
    componentsDir: config.componentsDir,
    libsDir: config.libsDir,
    typescript: config.typescript,
    aliases: config.aliases,
  };

  writeConfig(consumerConfig, cwd);

  logger.break();
  logger.success(`Created ${highlight(CONFIG_FILE_NAME)}`);
  logger.break();
  logger.info('You can now add components using:');
  console.log(`  ${highlight('npx r-component add button')}`);
  console.log(`  ${highlight('npx r-component add card input select')}`);
  console.log(`  ${highlight('npx r-component add --all')}`);
  logger.break();
}
