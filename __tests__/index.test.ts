import * as path from 'path';
import * as fs from 'fs';
import { afterEach } from '@jest/globals';

// Include the mocks
import './mocks';

// Mock the GitHub Actions core library
const mockSetFailed = jest.fn();
const mockGetInput = jest.fn();
const mockSetOutput = jest.fn();
const mockInfo = jest.fn();

jest.mock('@actions/core', () => ({
  setFailed: mockSetFailed,
  getInput: mockGetInput,
  setOutput: mockSetOutput,
  info: mockInfo,
}));

// Mock file system operations
jest.mock('fs', () => ({
  writeFileSync: jest.fn(),
  mkdirSync: jest.fn(),
  existsSync: jest.fn(),
  unlinkSync: jest.fn(),
}));

// Mock xml-generator
jest.mock('../src/xml-generator', () => {
  return {
    generateNuGetConfigXml: jest
      .fn()
      .mockReturnValue(
        '<?xml version="1.0" encoding="utf-8"?>\n<configuration>\n<packageSources>\n</packageSources>\n</configuration>'
      ),
  };
});

// Import the action module after mocking dependencies
import { run } from '../src/index';

describe('Generate NuGet Config Action', () => {
  const testOutputPath = 'test-nuget.config';

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Set up mock for existsSync to return true
    (fs.existsSync as jest.Mock).mockReturnValue(true);
  });

  afterEach(() => {
    // Clean up any test files
    if (fs.existsSync(testOutputPath)) {
      fs.unlinkSync(testOutputPath);
    }
  });

  it('should generate a valid NuGet config file', async () => {
    // Sample config JSON
    const configJson = JSON.stringify({
      packageSources: {
        NuGet: {
          url: 'https://api.nuget.org/v3/index.json',
        },
        'Private Feed': {
          url: 'https://private.feed/nuget/index.json',
          credentials: {
            username: 'username',
            password: 'password',
          },
        },
      },
      disabledPackageSources: {
        'Private Feed': true,
      },
    });

    // Set up mocks
    mockGetInput.mockImplementation(name => {
      if (name === 'config-json') {
        return configJson;
      }
      if (name === 'output-path') {
        return testOutputPath;
      }
      return '';
    });

    // Run the action
    await run();

    // Verify outputs
    expect(mockSetOutput).toHaveBeenCalledWith('config-path', testOutputPath);
    expect(mockSetFailed).not.toHaveBeenCalled();

    // Verify file was written
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      testOutputPath,
      expect.stringContaining('<packageSources>')
    );
  });

  it('should handle errors gracefully', async () => {
    // Set up mock to throw error
    mockGetInput.mockImplementation(() => {
      throw new Error('Test error');
    });

    // Run the action
    await run();

    // Verify error handling
    expect(mockSetFailed).toHaveBeenCalledWith('Test error');
  });

  it('should validate the schema and fail on invalid inputs', async () => {
    // Invalid config JSON (missing required url field)
    const configJson = JSON.stringify({
      packageSources: {
        NuGet: {
          // url is missing, which should fail validation
          protocolVersion: '3.0',
        },
      },
    });

    // Set up mocks
    mockGetInput.mockImplementation(name => {
      if (name === 'config-json') {
        return configJson;
      }
      if (name === 'output-path') {
        return testOutputPath;
      }
      return '';
    });

    // Run the action
    await run();

    // Verify error was reported
    expect(mockSetFailed).toHaveBeenCalled();
    expect(mockSetFailed.mock.calls[0][0]).toContain('Invalid NuGet configuration');
  });
});
