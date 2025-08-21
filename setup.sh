#!/bin/bash
set -e

# Install dependencies
npm install

# Setup Husky
npx husky init

# Make pre-commit hook executable
chmod +x .husky/pre-commit

echo "Setup completed! You can now start developing."
