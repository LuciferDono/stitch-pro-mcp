import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StitchClient } from './stitch/client.js';
import { PipelineEngine } from './pipeline/engine.js';
import { AccessibilityFixProcessor } from './pipeline/processors/accessibility-fix.js';
import { ResponsiveInjectProcessor } from './pipeline/processors/responsive-inject.js';
import { DesignSystemEnrichProcessor, DesignSystemEnforceProcessor } from './pipeline/processors/design-system-enforce.js';
import { ComponentExtractProcessor } from './pipeline/processors/component-extract.js';
import { ReactConvertProcessor, VueConvertProcessor, SvelteConvertProcessor } from './pipeline/processors/framework-convert.js';
import { registerListingTools } from './tools/listing.js';
import { registerGenerateTools } from './tools/generate.js';
import { registerAccessibilityTools } from './tools/accessibility.js';
import { registerResponsiveTools } from './tools/responsive.js';
import { registerDesignSystemTools } from './tools/design-system.js';
import { registerConvertTools } from './tools/convert.js';
import { logger } from './utils/logger.js';
import type { DesignSystem } from './types/design-system.js';

export function createServer() {
  const server = new McpServer({
    name: 'stitch-pro',
    version: '0.1.0',
  });

  // Core dependencies
  const client = new StitchClient();
  const designSystems = new Map<string, DesignSystem>();

  // Pipeline with processors
  const pipeline = new PipelineEngine();
  pipeline
    .register(new DesignSystemEnrichProcessor())
    .register(new DesignSystemEnforceProcessor())
    .register(new AccessibilityFixProcessor())
    .register(new ResponsiveInjectProcessor())
    .register(new ComponentExtractProcessor())
    .register(new ReactConvertProcessor())
    .register(new VueConvertProcessor())
    .register(new SvelteConvertProcessor());

  // Register all tools
  registerListingTools(server, client);
  registerGenerateTools(server, client, pipeline, designSystems);
  registerAccessibilityTools(server, pipeline);
  registerResponsiveTools(server, pipeline);
  registerDesignSystemTools(server, designSystems);
  registerConvertTools(server, pipeline);

  return server;
}

export async function main() {
  logger.info('Starting stitch-pro v0.1.0');

  const server = createServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);

  logger.info('Server connected via stdio');
}

// Auto-start when run directly
main().catch((err) => {
  logger.error('Fatal error', { error: err.message });
  process.exit(1);
});
