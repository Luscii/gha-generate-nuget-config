import { generateNuGetConfigXml, escapeXml, NuGetConfig } from '../src/xml-generator';

describe('XML Generator', () => {
  describe('escapeXml', () => {
    it('should escape XML special characters', () => {
      const unescaped = '&<>"\'';
      const escaped = '&amp;&lt;&gt;&quot;&apos;';
      expect(escapeXml(unescaped)).toBe(escaped);
    });

    it('should handle regular text without changes', () => {
      const text = 'regular text 123';
      expect(escapeXml(text)).toBe(text);
    });
  });

  describe('generateNuGetConfigXml', () => {
    it('should generate XML with package sources', () => {
      const config: NuGetConfig = {
        packageSources: {
          NuGet: {
            url: 'https://api.nuget.org/v3/index.json',
          },
          GitHub: {
            url: 'https://nuget.pkg.github.com/owner/index.json',
            protocolVersion: '3.0',
          },
        },
      };

      const xml = generateNuGetConfigXml(config);

      expect(xml).toContain('<?xml version="1.0" encoding="utf-8"?>');
      expect(xml).toContain('<packageSources>');
      expect(xml).toContain('key="NuGet"');
      expect(xml).toContain('key="GitHub"');
      expect(xml).toContain('protocolVersion="3.0"');
      expect(xml).toContain('</packageSources>');
    });

    it('should generate XML with disabled sources', () => {
      const config: NuGetConfig = {
        packageSources: {
          NuGet: {
            url: 'https://api.nuget.org/v3/index.json',
          },
        },
        disabledPackageSources: {
          NuGet: true,
        },
      };

      const xml = generateNuGetConfigXml(config);

      expect(xml).toContain('<disabledPackageSources>');
      expect(xml).toContain('key="NuGet" value="true"');
      expect(xml).toContain('</disabledPackageSources>');
    });

    it('should generate XML with credentials', () => {
      const config: NuGetConfig = {
        packageSources: {
          Private: {
            url: 'https://private.feed/index.json',
            credentials: {
              username: 'user',
              password: 'pass',
            },
          },
        },
      };

      const xml = generateNuGetConfigXml(config);

      expect(xml).toContain('<packageSourceCredentials>');
      expect(xml).toContain('<Private>');
      expect(xml).toContain('key="Username" value="user"');
      expect(xml).toContain('key="ClearTextPassword" value="pass"');
      expect(xml).toContain('</Private>');
      expect(xml).toContain('</packageSourceCredentials>');
    });

    it('should properly escape special characters in XML', () => {
      const config: NuGetConfig = {
        packageSources: {
          'Special & Characters': {
            url: 'https://example.com/feed?param=value&other=value',
            credentials: {
              username: 'user<name>',
              password: 'pass"word\'',
            },
          },
        },
      };

      const xml = generateNuGetConfigXml(config);

      expect(xml).toContain('key="Special &amp; Characters"');
      expect(xml).toContain('value="https://example.com/feed?param=value&amp;other=value"');
      expect(xml).toContain('value="user&lt;name&gt;"');
      expect(xml).toContain('value="pass&quot;word&apos;"');
    });

    it('should handle special characters in source names for credential elements', () => {
      const config: NuGetConfig = {
        packageSources: {
          'Special & Characters': {
            url: 'https://example.com',
            credentials: {
              username: 'user',
              password: 'pass',
            },
          },
        },
      };

      const xml = generateNuGetConfigXml(config);

      // Source name should be converted to a valid XML element name
      expect(xml).toContain('<Special__Characters>');
      expect(xml).toContain('</Special__Characters>');
    });

    it('should generate empty configuration if no sources', () => {
      const config: NuGetConfig = {};

      const xml = generateNuGetConfigXml(config);

      expect(xml).toContain('<?xml version="1.0" encoding="utf-8"?>');
      expect(xml).toContain('<configuration>');
      expect(xml).toContain('</configuration>');
      expect(xml).not.toContain('<packageSources>');
    });
  });
});
