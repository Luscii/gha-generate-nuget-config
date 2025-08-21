// @jest-environment node

// Mock validate function
jest.mock('../src/nuget-config-schema', () => {
  const originalModule = jest.requireActual('../src/nuget-config-schema');

  return {
    ...originalModule,
    validate: jest.fn().mockImplementation((config: any) => {
      // URL is required for each package source
      if (config.packageSources) {
        for (const [name, source] of Object.entries(config.packageSources)) {
          if (typeof source !== 'object' || source === null || !('url' in source)) {
            const mockValidate = jest.fn().mockReturnValue(false) as any;
            mockValidate.errors = [
              {
                instancePath: `/packageSources/${name}`,
                message: `must have required property 'url'`,
              },
            ];
            return mockValidate();
          }
        }
      }
      return true;
    }),
  };
});
