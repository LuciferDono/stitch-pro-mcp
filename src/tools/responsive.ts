import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { PipelineEngine } from '../pipeline/engine.js';
import { ResponsiveAdaptInput } from '../types/tools.js';
import { createContext } from '../pipeline/context.js';

export function registerResponsiveTools(server: McpServer, pipeline: PipelineEngine) {
  server.registerTool(
    'sp_responsive',
    {
      title: 'Responsive Adaptation',
      description: 'Make HTML responsive by injecting Tailwind breakpoints for mobile, tablet, and desktop',
      inputSchema: ResponsiveAdaptInput.shape,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    },
    async ({ html }) => {
      const ctx = createContext({
        prompt: '',
        enableAccessibility: false,
        enableResponsive: true,
      });

      const ctxWithHtml = { ...ctx, rawHtml: html, processedHtml: html };
      const result = await pipeline.execute(ctxWithHtml, undefined, ['post-generate']);

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            html: result.context.processedHtml,
          }, null, 2),
        }],
      };
    },
  );
}
