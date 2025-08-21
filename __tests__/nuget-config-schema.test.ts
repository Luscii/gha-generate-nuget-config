import * as fs from 'fs';
import { validate, schema } from '../src/nuget-config-schema';

describe('NuGet Config Schema Validation', () => {
  it('should validate a valid configuration', () => {
    const validConfig = {
      packageSources: {
        NuGet: {
          url: 'https://api.nuget.org/v3/index.json',
        },
        Private: {
          url: 'https://example.com/nuget',
          protocolVersion: '3.0',
          credentials: {
            username: 'user',
            password: 'pass',
          },
        },
      },
    };

    const isValid = validate(validConfig);
    expect(isValid).toBe(true);
    expect(validate.errors).toBe(null);
  });

  it('should reject invalid URLs', () => {
    const invalidConfig = {
      packageSources: {
        Invalid: {
          url: 'not-a-url',
        },
      },
    };

    const isValid = validate(invalidConfig);
    expect(isValid).toBe(false);
    expect(validate.errors).not.toBe(null);
    expect(validate.errors?.some(e => e.keyword === 'format')).toBe(true);
  });

  it('should reject invalid protocol version format', () => {
    const invalidConfig = {
      packageSources: {
        Invalid: {
          url: 'https://example.com',
          protocolVersion: 'invalid',
        },
      },
    };

    const isValid = validate(invalidConfig);
    expect(isValid).toBe(false);
    expect(validate.errors).not.toBe(null);
    expect(validate.errors?.some(e => e.keyword === 'pattern')).toBe(true);
  });

  it('should require both username and password in credentials', () => {
    const invalidConfig = {
      packageSources: {
        Invalid: {
          url: 'https://example.com',
          credentials: {
            username: 'user',
            // missing password
          },
        },
      },
    };

    const isValid = validate(invalidConfig);
    expect(isValid).toBe(false);
    expect(validate.errors).not.toBe(null);
    expect(validate.errors?.some(e => e.keyword === 'required')).toBe(true);
  });
});
