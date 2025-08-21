import { NugetConfig } from './nuget-config-schema';

/**
 * Interface for combined NuGet config using the schema
 */
export type NuGetConfig = NugetConfig;

/**
 * Generate NuGet config XML from config object
 */
export function generateNuGetConfigXml(config: NuGetConfig): string {
  let xml = '<?xml version="1.0" encoding="utf-8"?>\n';
  xml += '<configuration>\n';

  // Package sources
  if (config.packageSources && Object.keys(config.packageSources).length > 0) {
    xml += '  <packageSources>\n';

    for (const [name, sourceConfig] of Object.entries(config.packageSources)) {
      const attributes = [`key="${escapeXml(name)}"`, `value="${escapeXml(sourceConfig.url)}"`];

      // Add protocolVersion if it exists
      if (sourceConfig.protocolVersion) {
        attributes.push(`protocolVersion="${escapeXml(sourceConfig.protocolVersion)}"`);
      }

      xml += `    <add ${attributes.join(' ')} />\n`;
    }

    xml += '  </packageSources>\n';
  }

  // Disabled package sources
  if (config.disabledPackageSources) {
    xml += '  <disabledPackageSources>\n';

    for (const [name, isDisabled] of Object.entries(config.disabledPackageSources)) {
      if (isDisabled) {
        xml += `    <add key="${escapeXml(name)}" value="true" />\n`;
      }
    }

    xml += '  </disabledPackageSources>\n';
  }

  // Package source credentials
  const hasInlineCredentials =
    config.packageSources &&
    Object.values(config.packageSources).some(source => source.credentials !== undefined);

  if (hasInlineCredentials) {
    xml += '  <packageSourceCredentials>\n';

    // Add credentials from source objects
    for (const [name, sourceConfig] of Object.entries(config.packageSources || {})) {
      if (sourceConfig.credentials) {
        // Clean the name for use as an XML element name (replace spaces and special chars)
        const cleanName = name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');

        xml += `    <${escapeXml(cleanName)}>\n`;
        xml += `      <add key="Username" value="${escapeXml(
          sourceConfig.credentials.username
        )}" />\n`;
        xml += `      <add key="ClearTextPassword" value="${escapeXml(
          sourceConfig.credentials.password
        )}" />\n`;
        xml += `    </${escapeXml(cleanName)}>\n`;
      }
    }

    xml += '  </packageSourceCredentials>\n';
  }

  xml += '</configuration>';

  return xml;
}

/**
 * Escape XML special characters in a string
 */
export function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
