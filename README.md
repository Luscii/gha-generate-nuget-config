# Generate NuGet Config GitHub Action

A GitHub Action that generates a NuGet config file from a JSON input. Includes schema validation to ensure your NuGet configuration is valid.

## Usage

```yaml
- name: Generate NuGet Config
  uses: Luscii/gha-generate-nuget-config@v1
  with:
    config-json: |
      {
        "packageSources": {
          "NuGet": {
            "url": "https://api.nuget.org/v3/index.json"
          },
          "Private Feed": {
            "url": "https://private.feed/nuget/index.json",
            "protocolVersion": "3.0",
            "credentials": {
              "username": "${{ secrets.FEED_USERNAME }}",
              "password": "${{ secrets.FEED_PASSWORD }}"
            }
          }
        },
        "disabledPackageSources": {
          "Private Feed": true
        }
      }
    output-path: 'path/to/nuget.config'
```

## Inputs

| Input         | Description                                        | Required | Default        |
| ------------- | -------------------------------------------------- | -------- | -------------- |
| `config-json` | JSON string containing NuGet configuration         | Yes      | N/A            |
| `output-path` | Path where the nuget.config file should be written | No       | `nuget.config` |

## Outputs

| Output        | Description                             |
| ------------- | --------------------------------------- |
| `config-path` | Path to the generated NuGet config file |

## Configuration Schema

The `config-json` input must follow this schema structure:

```typescript
interface NugetConfig {
  packageSources?: {
    [name: string]: {
      url: string; // Required - URL of the package source
      protocolVersion?: string; // Optional - Must be in format x.y like "3.0"
      credentials?: {
        username: string; // Required if credentials object is provided
        password: string; // Required if credentials object is provided
      };
    };
  };
  disabledPackageSources?: {
    [name: string]: boolean; // Package source name -> disabled status
  };
}
```

The JSON is validated against this schema before generating the NuGet config file. Any validation errors will cause the action to fail with a descriptive error message.

### Example JSON

```json
{
  "packageSources": {
    "NuGet": {
      "url": "https://api.nuget.org/v3/index.json"
    },
    "GitHub": {
      "url": "https://nuget.pkg.github.com/owner/index.json",
      "protocolVersion": "3.0",
      "credentials": {
        "username": "USERNAME",
        "password": "TOKEN"
      }
    }
  },
  "disabledPackageSources": {
    "NuGet": false,
    "GitHub": true
  }
}
```

## Development

This project is written in TypeScript and uses the following technologies:

- TypeScript for type-safe code
- Ajv for JSON schema validation
- Jest for testing
- ESLint and Prettier for code quality
- Husky and lint-staged for pre-commit hooks
- @vercel/ncc for bundling

### Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the action: `npm run build`
4. Run tests: `npm test`

### Pre-commit Hooks

This project uses Husky to run pre-commit hooks that:

1. Format code with Prettier
2. Lint with ESLint
3. Build the action to ensure it compiles
