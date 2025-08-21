import * as core from '@actions/core';
import * as fs from 'fs';
import * as path from 'path';
import { validate } from './nuget-config-schema';
import { NuGetConfig, generateNuGetConfigXml } from './xml-generator';

/**
 * Main function that runs the GitHub Action
 */
export async function run(): Promise<void> {
  try {
    // Get inputs from action
    const configJson = core.getInput('config-json', { required: true });
    const outputPath = core.getInput('output-path') || 'nuget.config';

    // Parse JSON config
    const config: NuGetConfig = JSON.parse(configJson);

    // Validate the configuration using the schema
    const isValid = validate(config);

    if (!isValid) {
      const validationErrors = validate.errors
        ?.map(err => `${err.instancePath} ${err.message}`)
        .join(', ');

      throw new Error(`Invalid NuGet configuration: ${validationErrors}`);
    }

    core.info('Configuration validated successfully');

    // Generate NuGet config XML
    const nugetConfigXml = generateNuGetConfigXml(config);

    // Ensure directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write to output file
    fs.writeFileSync(outputPath, nugetConfigXml);

    core.info(`NuGet config generated at ${outputPath}`);
    core.setOutput('config-path', outputPath);
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed('An unknown error occurred');
    }
  }
}

// Run the action
run();
