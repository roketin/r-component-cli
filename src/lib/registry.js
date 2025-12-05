// Default GitHub raw URL for the component registry
const DEFAULT_REGISTRY_URL = 'https://raw.githubusercontent.com/roketin/react-base-project/refs/heads/feat/registry/registry/registry.json';
const DEFAULT_BASE_URL = 'https://raw.githubusercontent.com/roketin/react-base-project/feat/registry';

/**
 * Fetch registry from remote
 */
export async function fetchRegistry(registryUrl = DEFAULT_REGISTRY_URL) {
  try {
    const response = await fetch(registryUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch registry: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    throw new Error(`Failed to fetch registry from ${registryUrl}: ${error.message}`);
  }
}

/**
 * Fetch a single file from the registry
 */
export async function fetchFile(filePath, baseUrl = DEFAULT_BASE_URL) {
  const url = `${baseUrl}/${filePath}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    throw new Error(`Failed to fetch ${filePath}: ${error.message}`);
  }
}

/**
 * Get component definition from registry
 */
export function getComponent(registry, componentName) {
  return registry.components.find(
    (c) => c.name === componentName || c.name === `r-${componentName}`
  );
}

/**
 * Get all component names
 */
export function getComponentNames(registry) {
  return registry.components.map((c) => c.name);
}

/**
 * Resolve all dependencies for a component (recursive)
 */
export function resolveDependencies(registry, componentName, resolved = new Set()) {
  const component = getComponent(registry, componentName);
  if (!component) {
    return resolved;
  }

  // Add this component
  resolved.add(component.name);

  // Resolve registry dependencies (other components/libs this component depends on)
  if (component.registryDependencies) {
    for (const dep of component.registryDependencies) {
      if (!resolved.has(dep)) {
        resolveDependencies(registry, dep, resolved);
      }
    }
  }

  return resolved;
}

/**
 * Get all files needed for a component (including dependencies)
 */
export function getAllFilesForComponent(registry, componentName) {
  const allComponents = resolveDependencies(registry, componentName);
  const files = {
    components: [],
    libs: [],
    ui: [],
    npmDependencies: new Set(),
  };

  for (const compName of allComponents) {
    const component = getComponent(registry, compName);
    if (component) {
      // Categorize files based on their type
      for (const file of component.files) {
        if (file.type === 'registry:component') {
          files.components.push(file);
        } else if (file.type === 'registry:lib') {
          files.libs.push(file);
        } else if (file.type === 'registry:ui') {
          files.ui.push(file);
        } else {
          // Default to components if type is unknown
          files.components.push(file);
        }
      }
      
      // Collect npm dependencies
      if (component.dependencies) {
        component.dependencies.forEach((dep) => files.npmDependencies.add(dep));
      }
    }
  }

  // Deduplicate files by path
  const dedupeByPath = (arr) => {
    const seen = new Set();
    return arr.filter((item) => {
      const key = item.path;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  files.components = dedupeByPath(files.components);
  files.libs = dedupeByPath(files.libs);
  files.ui = dedupeByPath(files.ui);
  files.npmDependencies = [...files.npmDependencies];

  return files;
}
