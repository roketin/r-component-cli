import ora from 'ora';
import { logger, highlight, dim, bold } from '../lib/logger.js';
import { fetchRegistry, getComponentNames, getComponent } from '../lib/registry.js';
import { readConfig, configExists } from '../lib/config.js';

export async function listCommand(options) {
  logger.break();
  console.log(bold('R-Component CLI'));
  logger.break();

  // Try to use config registry URL if available
  let registryUrl;
  if (configExists()) {
    const config = readConfig();
    registryUrl = config?.registry;
  }

  const spinner = ora('Fetching component registry...').start();
  
  let registry;
  try {
    registry = await fetchRegistry(registryUrl);
    spinner.succeed('Registry loaded');
  } catch (error) {
    spinner.fail('Failed to fetch registry');
    logger.error(error.message);
    return;
  }

  logger.break();

  if (options.json) {
    console.log(JSON.stringify(registry.components, null, 2));
    return;
  }

  logger.info(`Available components (${registry.components.length}):`);
  logger.break();

  for (const component of registry.components) {
    const deps = component.componentDependencies?.length
      ? dim(` → depends on: ${component.componentDependencies.join(', ')}`)
      : '';
    console.log(`  ${highlight(component.name)}${deps}`);
    if (component.description) {
      console.log(`    ${dim(component.description)}`);
    }
  }

  logger.break();
  logger.info(`Use ${highlight('npx r-component add <component>')} to add a component.`);
  logger.break();
}
