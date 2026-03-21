import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { PipelineEngine } from '../pipeline/engine.js';
import { AccessibilityAuditInput } from '../types/tools.js';
import { createContext } from '../pipeline/context.js';

export function registerAccessibilityTools(server: McpServer, pipeline: PipelineEngine) {
  server.registerTool(
    'stitch_pro_accessibility_audit',
    {
      title: 'Accessibility Audit',
      description: 'Run WCAG 2.1 AA accessibility audit on HTML and auto-fix issues (contrast, semantics, ARIA, touch targets)',
      inputSchema: AccessibilityAuditInput.shape,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    },
    async ({ html, autoFix }) => {
      const ctx = createContext({
        prompt: '',
        enableAccessibility: autoFix,
        enableResponsive: false,
      });

      const ctxWithHtml = { ...ctx, rawHtml: html, processedHtml: html };
      const result = await pipeline.execute(ctxWithHtml, undefined, ['post-generate']);

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            fixedHtml: autoFix ? result.context.processedHtml : undefined,
            report: result.context.accessibilityReport,
            warnings: result.warnings,
          }, null, 2),
        }],
      };
    },
  );
}
