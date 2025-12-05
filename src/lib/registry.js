// Default GitHub raw URL for the component registry
const DEFAULT_REGISTRY_URL = 'https://raw.githubusercontent.com/roketin/react-base-project/feat/registry/registry/index.json';
const DEFAULT_BASE_URL = 'https://raw.githubusercontent.com/roketin/react-base-project/feat/registry';
const DEFAULT_COMPONENTS_URL = 'https://raw.githubusercontent.com/roketin/react-base-project/feat/registry/registry/components';

/**
 * Fetch registry index from remote
 */
export async function fetchRegistry(registryUrl = DEFAULT_REGISTRY_URL) {
  try {
    const response = await fetch(registryUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch registry: ${response.status}`);
    }
    const registry = await response.json();
    
    // Return registry with baseUrl for fetching individual components
    return {
      ...registry,
      baseUrl: DEFAULT_BASE_URL,
      componentsUrl: DEFAULT_COMPONENTS_URL,
    };
  } catch (error) {
    throw new Error(`Failed to fetch registry from ${registryUrl}: ${error.message}`);
  }
}

/**
 * Fetch a single component definition from the registry
 */
export async function fetchComponentDefinition(componentName, componentsUrl = DEFAULT_COMPONENTS_URL) {
  const url = `${componentsUrl}/${componentName}.json`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch component definition: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    throw new Error(`Failed to fetch component ${componentName}: ${error.message}`);
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
 * Get component info from registry index (basic info only - name)
 * Registry index now contains arrays of component names as strings
 */
export function getComponentInfo(registry, componentName) {
  if (!registry.components) return null;
  
  // Components in index are now just strings (names)
  const found = registry.components.find(
    (name) => name === componentName || name === `r-${componentName}`
  );
  
  // Return as object with name property for consistency
  return found ? { name: found } : null;
}

/**
 * Get full component definition (fetches from individual component file)
 */
export async function getComponent(registry, componentName) {
  const info = getComponentInfo(registry, componentName);
  if (!info) return null;
  
  try {
    const definition = await fetchComponentDefinition(info.name, registry.componentsUrl);
    return definition;
  } catch (error) {
    console.error(`Failed to fetch component ${componentName}:`, error.message);
    return null;
  }
}

/**
 * Get all component names from registry index
 */
export function getComponentNames(registry) {
  if (!registry.components) return [];
  // Components in index are strings, return as-is
  return registry.components;
}

/**
 * Resolve all dependencies for a component (recursive, async)
 */
export async function resolveDependencies(registry, componentName, resolved = new Map()) {
  // Skip if already resolved
  if (resolved.has(componentName)) {
    return resolved;
  }

  const component = await getComponent(registry, componentName);
  if (!component) {
    return resolved;
  }

  // Add this component
  resolved.set(component.name, component);

  // Resolve registry dependencies (other components/libs this component depends on)
  if (component.registryDependencies) {
    for (const dep of component.registryDependencies) {
      if (!resolved.has(dep)) {
        await resolveDependencies(registry, dep, resolved);
      }
    }
  }

  return resolved;
}

/**
 * Get all files needed for a component (including dependencies)
 */
export async function getAllFilesForComponent(registry, componentName) {
  const allComponents = await resolveDependencies(registry, componentName);
  const files = {
    components: [],
    libs: [],
    ui: [],
    npmDependencies: new Set(),
  };

  for (const [compName, component] of allComponents) {
    if (component && component.files) {
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
