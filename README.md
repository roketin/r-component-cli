# R-Component CLI

A CLI tool to install Roketin R components into your React project, similar to shadcn/ui.

## Installation

```bash
# Using npx (recommended)
npx r-component init

# Or install globally
npm install -g r-component
```

## Quick Start

### 1. Initialize your project

```bash
npx r-component init
```

This creates a `r-component.json` config file in your project root:

```json
{
  "$schema": "https://raw.githubusercontent.com/roketin/r-component/main/config-schema.json",
  "baseDir": "src/components",
  "componentsDir": "base",
  "libsDir": "libs",
  "typescript": true,
  "aliases": {
    "components": "@/components",
    "libs": "@/libs"
  },
  "registry": "https://raw.githubusercontent.com/roketin/r-component/main/registry.json"
}
```

### 2. Add components

```bash
# Add a single component
npx r-component add button

# Add multiple components
npx r-component add card input select

# Add all components
npx r-component add --all

# Interactive selection
npx r-component add
```

### 3. List available components

```bash
npx r-component list

# Output as JSON
npx r-component list --json
```

## Commands

### `init`

Initialize r-component configuration in your project.

```bash
npx r-component init [options]
```

**Options:**
- `-y, --yes` - Skip prompts and use defaults
- `-c, --cwd <path>` - Specify working directory

### `add`

Add component(s) to your project.

```bash
npx r-component add [components...] [options]
```

**Options:**
- `-y, --yes` - Skip confirmation prompts
- `-o, --overwrite` - Overwrite existing files
- `-c, --cwd <path>` - Specify working directory
- `-a, --all` - Add all available components

**Examples:**
```bash
npx r-component add r-btn
npx r-component add r-card r-input r-select
npx r-component add --all --overwrite
```

### `list`

List all available components in the registry.

```bash
npx r-component list [options]
```

**Options:**
- `--json` - Output as JSON

## Configuration

The `r-component.json` file controls where components are installed:

| Option | Description | Default |
|--------|-------------|---------|
| `baseDir` | Base directory for components | `src/components` |
| `componentsDir` | Subdirectory for component files | `base` |
| `libsDir` | Directory for utility files | `libs` |
| `typescript` | Use TypeScript files | `true` |
| `aliases.components` | Import alias for components | `@/components` |
| `aliases.libs` | Import alias for libs | `@/libs` |
| `registry` | Component registry URL | GitHub raw URL |

## How It Works

1. **Registry**: Components are defined in a `registry.json` file hosted on GitHub
2. **Dependencies**: Each component specifies its file dependencies and npm packages
3. **Transform**: Import paths are automatically transformed to match your config
4. **Skip Existing**: Files that already exist are skipped (use `--overwrite` to replace)

## Component Dependencies

When you add a component, the CLI automatically resolves and installs:
- **Component files** - The main component TSX file
- **Lib files** - Required utility files (utils.ts, ui-variants.ts, etc.)
- **Component dependencies** - Other R components this component depends on
- **NPM packages** - Required npm packages (shown after install)

## Directory Structure

After installing components, your project will look like:

```
src/
├── components/
│   └── base/           # R components go here
│       ├── r-btn.tsx
│       ├── r-card.tsx
│       └── ...
└── libs/               # Utility files go here
    ├── utils.ts
    └── ui-variants.ts
```

## Publishing Your Own Registry

You can host your own component registry by:

1. Create a public GitHub repository
2. Add component files in a `components/` folder
3. Add lib files in a `libs/` folder
4. Create a `registry.json` file
5. Update the `registry` URL in `r-component.json`

## Requirements

- Node.js 18+
- React 18+
- Tailwind CSS (for styling)

## License

MIT
