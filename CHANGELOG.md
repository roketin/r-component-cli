# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-12-05

### Added

- Initial release of R-Component CLI
- `init` command to initialize r-component configuration
- `add` command to add components to your project
  - Support for single and multiple component installation
  - `--all` flag to add all available components
  - `--overwrite` flag to replace existing files
  - Interactive component selection
- `list` command to display available components
  - `--json` flag for JSON output
- Automatic dependency resolution for component files
- Import path transformation based on project configuration
- Support for TypeScript and JavaScript projects
- NPM package dependency detection and notification
