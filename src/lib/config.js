import fs from 'fs';
import path from 'path';

export const CONFIG_FILE_NAME = 'r-component.json';

const defaultConfig = {
  $schema: 'https://raw.githubusercontent.com/roketin/react-base-project/refs/heads/feat/registry/registry/registry-schema.json',
  baseDir: 'src/components',
  componentsDir: 'base',
  libsDir: 'libs',
  typescript: true,
  aliases: {
    components: '@/components',
    libs: '@/libs',
  },
  registry: 'https://raw.githubusercontent.com/roketin/react-base-project/refs/heads/feat/registry/registry/registry.json',
};

/**
 * Get the config file path for a given working directory
 */
export function getConfigPath(cwd = process.cwd()) {
  return path.resolve(cwd, CONFIG_FILE_NAME);
}

/**
 * Check if config file exists
 */
export function configExists(cwd = process.cwd()) {
  return fs.existsSync(getConfigPath(cwd));
}

/**
 * Read the config file
 */
export function readConfig(cwd = process.cwd()) {
  const configPath = getConfigPath(cwd);
  if (!fs.existsSync(configPath)) {
    return null;
  }
  const content = fs.readFileSync(configPath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Write the config file
 */
export function writeConfig(config, cwd = process.cwd()) {
  const configPath = getConfigPath(cwd);
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
}

/**
 * Get default config
 */
export function getDefaultConfig() {
  return { ...defaultConfig };
}

/**
 * Resolve component installation path
 */
export function resolveComponentPath(config, componentFile) {
  return path.join(config.baseDir, config.componentsDir, componentFile);
}

/**
 * Resolve libs installation path
 */
export function resolveLibPath(config, libFile) {
  return path.join(config.baseDir, '..', config.libsDir, libFile);
}
