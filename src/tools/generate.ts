import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { StitchClient } from '../stitch/client.js';
import type { PipelineEngine } from '../pipeline/engine.js';
import { GeneratePageInput, GenerateFlowInput } from '../types/tools.js';
import { createContext } from '../pipeline/context.js';
import type { DesignSystem } from '../types/design-system.js';
import type { PipelineContext } from '../types/pipeline.js';

export function registerGenerateTools(
  server: McpServer,
  client: StitchClient,
  pipeline: PipelineEngine,
  designSystems: Map<string, DesignSystem>,
) {
  server.registerTool(
    'stitch_pro_generate_page',
    {
      title: 'Generate Page',
      description: 'Generate a UI page with optional design system enforcement, accessibility fixes, responsive breakpoints, and framework conversion',
      inputSchema: GeneratePageInput.shape,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
    },
    async (input) => {
      const ds = input.designSystemId ? designSystems.get(input.designSystemId) : undefined;

      const ctx = createContext({
        prompt: input.prompt,
        deviceType: input.deviceType,
        framework: input.framework,
        componentLibrary: input.componentLibrary,
        enableAccessibility: input.accessibility,
        enableResponsive: input.responsive,
        designSystem: ds,
      });

      const stitchCall = async (c: PipelineContext): Promise<PipelineContext> => {
        const prompt = c.enrichedPrompt ?? c.originalPrompt;
        const screen = await client.generate(input.projectId, prompt, c.deviceType);
        return { ...c, rawHtml: screen.html, processedHtml: screen.html };
      };

      const result = await pipeline.execute(ctx, stitchCall);

      const output: Record<string, unknown> = {
        html: result.context.processedHtml ?? result.context.rawHtml,
      };

      if (result.context.frameworkOutput) {
        output.files = result.context.frameworkOutput.files;
        output.dependencies = result.context.frameworkOutput.packageDependencies;
      }

      if (result.context.accessibilityReport) {
        output.accessibility = result.context.accessibilityReport;
      }

      if (result.warnings.length > 0) {
        output.warnings = result.warnings;
      }

      output.timings = result.timings;

      return {
        content: [{ type: 'text', text: JSON.stringify(output, null, 2) }],
      };
    },
  );

  server.registerTool(
    'stitch_pro_generate_flow',
    {
      title: 'Generate Multi-Screen Flow',
      description: 'Generate multiple related screens (e.g., login → dashboard → settings) in one call with consistent design',
      inputSchema: GenerateFlowInput.shape,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
    },
    async (input) => {
      const ds = input.designSystemId ? designSystems.get(input.designSystemId) : undefined;
      const results: Record<string, unknown>[] = [];

      for (const screenDesc of input.screens) {
        const ctx = createContext({
          prompt: `${input.prompt}\n\nThis specific screen: ${screenDesc}`,
          deviceType: input.deviceType,
          framework: input.framework,
          componentLibrary: input.componentLibrary,
          enableAccessibility: input.accessibility,
          enableResponsive: input.responsive,
          designSystem: ds,
        });

        const stitchCall = async (c: PipelineContext): Promise<PipelineContext> => {
          const prompt = c.enrichedPrompt ?? c.originalPrompt;
          const screen = await client.generate(input.projectId, prompt, c.deviceType);
          return { ...c, rawHtml: screen.html, processedHtml: screen.html };
        };

        const result = await pipeline.execute(ctx, stitchCall);

        results.push({
          screen: screenDesc,
          html: result.context.processedHtml,
          files: result.context.frameworkOutput?.files,
          accessibility: result.context.accessibilityReport,
          warnings: result.warnings,
        });
      }

      return {
        content: [{ type: 'text', text: JSON.stringify({ screens: results }, null, 2) }],
      };
    },
  );
}
