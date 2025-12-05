import prompts from 'prompts';
import path from 'path';
import ora from 'ora';
import { logger, highlight, bold, dim } from '../lib/logger.js';
import { configExists, readConfig, CONFIG_FILE_NAME } from '../lib/config.js';
import { writeFile, fileExists, ensureDir } from '../lib/fs-utils.js';
import { 
  fetchRegistry, 
  fetchFile, 
  getComponent, 
  getComponentNames,
  getAllFilesForComponent 
} from '../lib/registry.js';

export async function addCommand(components, options) {
  const cwd = options.cwd ? path.resolve(options.cwd) : process.cwd();

  logger.break();
  console.log(bold('R-Component CLI'));
  logger.break();

  // Check if config exists
  if (!configExists(cwd)) {
    logger.error(`Configuration file ${highlight(CONFIG_FILE_NAME)} not found.`);
    logger.info(`Run ${highlight('npx r-component init')} first.`);
    return;
  }

  const config = readConfig(cwd);
  
  // Fetch registry
  const spinner = ora('Fetching component registry...').start();
  let registry;
  try {
    registry = await fetchRegistry(config.registry);
    spinner.succeed('Registry loaded');
  } catch (error) {
    spinner.fail('Failed to fetch registry');
    logger.error(error.message);
    return;
  }

  // Determine which components to add
  let componentsToAdd = components || [];

  if (options.all) {
    componentsToAdd = getComponentNames(registry);
  } else if (componentsToAdd.length === 0) {
    // Interactive selection
    const availableComponents = getComponentNames(registry);
    const { selected } = await prompts({
      type: 'multiselect',
      name: 'selected',
      message: 'Select components to add:',
      choices: availableComponents.map((name) => ({
        title: name,
        value: name,
      })),
      hint: '- Space to select, Enter to confirm',
    });

    if (!selected || selected.length === 0) {
      logger.skip('No components selected.');
      return;
    }
    componentsToAdd = selected;
  }

  // Validate components
  const validComponents = [];
  const invalidComponents = [];
  for (const comp of componentsToAdd) {
    const component = getComponent(registry, comp);
    if (component) {
      validComponents.push(component.name);
    } else {
      invalidComponents.push(comp);
    }
  }

  if (invalidComponents.length > 0) {
    logger.warn(`Unknown components: ${invalidComponents.join(', ')}`);
  }

  if (validComponents.length === 0) {
    logger.error('No valid components to add.');
    return;
  }

  // Collect all files needed
  const allFiles = {
    components: new Set(),
    libs: new Set(),
    npmDependencies: new Set(),
  };

  for (const compName of validComponents) {
    const files = getAllFilesForComponent(registry, compName);
    files.components.forEach((f) => allFiles.components.add(f));
    files.libs.forEach((f) => allFiles.libs.add(f));
    files.npmDependencies.forEach((d) => allFiles.npmDependencies.add(d));
  }

  // Show what will be installed
  logger.info(`Components to add: ${highlight(validComponents.join(', '))}`);
  
  if (allFiles.libs.size > 0) {
    logger.info(`Required libs: ${dim([...allFiles.libs].join(', '))}`);
  }
  
  if (allFiles.npmDependencies.size > 0) {
    logger.info(`Required npm packages: ${dim([...allFiles.npmDependencies].join(', '))}`);
  }

  logger.break();

  // Confirm
  if (!options.yes) {
    const { proceed } = await prompts({
      type: 'confirm',
      name: 'proceed',
      message: 'Proceed with installation?',
      initial: true,
    });
    if (!proceed) {
      logger.skip('Installation cancelled.');
      return;
    }
  }

  // Install files
  const installSpinner = ora('Installing components...').start();
  
  const stats = {
    created: 0,
    skipped: 0,
    errors: [],
  };

  // Install lib files first
  for (const libFile of allFiles.libs) {
    const targetPath = path.join(cwd, config.baseDir, '..', config.libsDir, path.basename(libFile));
    
    if (fileExists(targetPath) && !options.overwrite) {
      stats.skipped++;
      continue;
    }

    try {
      const content = await fetchFile(libFile, registry.baseUrl);
      const transformedContent = transformImports(content, config);
      const result = writeFile(targetPath, transformedContent, options.overwrite);
      if (result.written) {
        stats.created++;
      } else {
        stats.skipped++;
      }
    } catch (error) {
      stats.errors.push({ file: libFile, error: error.message });
    }
  }

  // Install component files
  for (const compFile of allFiles.components) {
    const targetPath = path.join(cwd, config.baseDir, config.componentsDir, path.basename(compFile));
    
    if (fileExists(targetPath) && !options.overwrite) {
      stats.skipped++;
      continue;
    }

    try {
      const content = await fetchFile(compFile, registry.baseUrl);
      const transformedContent = transformImports(content, config);
      const result = writeFile(targetPath, transformedContent, options.overwrite);
      if (result.written) {
        stats.created++;
      } else {
        stats.skipped++;
      }
    } catch (error) {
      stats.errors.push({ file: compFile, error: error.message });
    }
  }

  installSpinner.stop();

  // Show results
  logger.break();
  if (stats.created > 0) {
    logger.success(`Created ${stats.created} file(s)`);
  }
  if (stats.skipped > 0) {
    logger.skip(`Skipped ${stats.skipped} existing file(s)`);
  }
  if (stats.errors.length > 0) {
    logger.error(`Failed ${stats.errors.length} file(s):`);
    stats.errors.forEach(({ file, error }) => {
      console.log(`  - ${file}: ${error}`);
    });
  }

  // Show npm install hint
  if (allFiles.npmDependencies.size > 0) {
    logger.break();
    logger.info('Install required dependencies:');
    const deps = [...allFiles.npmDependencies].join(' ');
    console.log(`  ${highlight(`npm install ${deps}`)}`);
    console.log(`  ${dim('or')}`);
    console.log(`  ${highlight(`pnpm add ${deps}`)}`);
  }

  logger.break();
}

/**
 * Transform import paths based on config aliases
 */
function transformImports(content, config) {
  // Replace default import paths with user's configured aliases
  let transformed = content;

  // Transform @/modules/app/components -> user's components alias
  transformed = transformed.replace(
    /@\/modules\/app\/components\/base\//g,
    `${config.aliases.components}/${config.componentsDir}/`
  );
  
  transformed = transformed.replace(
    /@\/modules\/app\/components\//g,
    `${config.aliases.components}/`
  );

  // Transform @/modules/app/libs -> user's libs alias
  transformed = transformed.replace(
    /@\/modules\/app\/libs\//g,
    `${config.aliases.libs}/`
  );

  return transformed;
}
