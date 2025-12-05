# Contributing to R-Component CLI

Thank you for your interest in contributing to R-Component CLI! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/roketin/r-component-cli/issues)
2. If not, create a new issue with:
   - A clear, descriptive title
   - Steps to reproduce the bug
   - Expected behavior
   - Actual behavior
   - Your environment (Node.js version, OS, etc.)

### Suggesting Features

1. Check existing issues for similar suggestions
2. Create a new issue with:
   - A clear description of the feature
   - Why this feature would be useful
   - Any implementation ideas you have

### Pull Requests

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Test your changes thoroughly
5. Commit with clear, descriptive messages
6. Push to your fork
7. Open a Pull Request

## Development Setup

```bash
# Clone the repository
git clone https://github.com/roketin/r-component-cli.git
cd r-component-cli

# Install dependencies
npm install

# Link for local development
npm link

# Now you can use 'r-component' command locally
r-component --version
```

## Coding Standards

- Use ES modules (import/export)
- Follow existing code style
- Add comments for complex logic
- Keep functions small and focused

## Commit Messages

Use clear, descriptive commit messages:

- `feat: add new command for component updates`
- `fix: resolve path resolution on Windows`
- `docs: update README with new options`
- `refactor: simplify registry fetching logic`

## Questions?

Feel free to open an issue for any questions about contributing.
