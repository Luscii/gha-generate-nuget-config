import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv();
addFormats(ajv);

export interface NugetConfig {
  packageSources?: {
    [name: string]: {
      url: string;
      protocolVersion?: string;
      credentials?: {
        username: string;
        password: string;
      };
    };
  };
  disabledPackageSources?: {
    [name: string]: boolean;
  };
}

export const schema = {
  type: 'object',
  properties: {
    packageSources: {
      type: 'object',
      required: [],
      additionalProperties: {
        type: 'object',
        properties: {
          url: { type: 'string', format: 'uri' },
          protocolVersion: { type: 'string', pattern: '^\\d+$', nullable: true },
          credentials: {
            type: 'object',
            properties: {
              username: { type: 'string' },
              password: { type: 'string' },
            },
            required: ['username', 'password'],
            nullable: true,
          },
        },
        required: ['url'],
      },
      nullable: true,
    },
    disabledPackageSources: {
      type: 'object',
      required: [],
      additionalProperties: {
        type: 'boolean',
      },
      nullable: true,
    },
  },
  required: [],
};

export const validate = ajv.compile(schema);
