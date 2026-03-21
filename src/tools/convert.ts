import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { PipelineEngine } from '../pipeline/engine.js';
import { ToFrameworkInput, ExtractComponentsInput } from '../types/tools.js';
import { createContext } from '../pipeline/context.js';

export function registerConvertTools(server: McpServer, pipeline: PipelineEngine) {
  server.registerTool(
    'sp_to_react',
    {
      title: 'Convert to React',
      description: 'Convert HTML/Tailwind to Next.js/React components with proper state, props, hooks, and optional shadcn/radix/MUI mapping',
      inputSchema: ToFrameworkInput.shape,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    },
    async ({ html, componentLibrary, appRouter }) => {
      const ctx = createContext({
        prompt: '',
        framework: 'react',
        componentLibrary,
        enableAccessibility: false,
        enableResponsive: false,
      });
      const ctxWithHtml = { ...ctx, rawHtml: html, processedHtml: html, metadata: { ...ctx.metadata, appRouter } };
      const result = await pipeline.execute(ctxWithHtml, undefined, ['convert']);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            files: result.context.frameworkOutput?.files ?? [],
            dependencies: result.context.frameworkOutput?.packageDependencies ?? {},
            warnings: result.warnings,
          }, null, 2),
        }],
      };
    },
  );

  server.registerTool(
    'sp_to_vue',
    {
      title: 'Convert to Vue',
      description: 'Convert HTML/Tailwind to Vue 3 Single File Components with Composition API and optional component library mapping',
      inputSchema: ToFrameworkInput.shape,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    },
    async ({ html, componentLibrary }) => {
      const ctx = createContext({
        prompt: '',
        framework: 'vue',
        componentLibrary,
        enableAccessibility: false,
        enableResponsive: false,
      });
      const ctxWithHtml = { ...ctx, rawHtml: html, processedHtml: html };
      const result = await pipeline.execute(ctxWithHtml, undefined, ['convert']);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            files: result.context.frameworkOutput?.files ?? [],
            dependencies: result.context.frameworkOutput?.packageDependencies ?? {},
            warnings: result.warnings,
          }, null, 2),
        }],
      };
    },
  );

  server.registerTool(
    'sp_to_svelte',
    {
      title: 'Convert to Svelte',
      description: 'Convert HTML/Tailwind to SvelteKit components with Svelte 5 runes ($state) and optional component library mapping',
      inputSchema: ToFrameworkInput.shape,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    },
    async ({ html, componentLibrary }) => {
      const ctx = createContext({
        prompt: '',
        framework: 'svelte',
        componentLibrary,
        enableAccessibility: false,
        enableResponsive: false,
      });
      const ctxWithHtml = { ...ctx, rawHtml: html, processedHtml: html };
      const result = await pipeline.execute(ctxWithHtml, undefined, ['convert']);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            files: result.context.frameworkOutput?.files ?? [],
            dependencies: result.context.frameworkOutput?.packageDependencies ?? {},
            warnings: result.warnings,
          }, null, 2),
        }],
      };
    },
  );

  server.registerTool(
    'sp_extract',
    {
      title: 'Extract Components',
      description: 'Parse HTML into reusable components and map them to shadcn/radix/MUI equivalents with confidence scoring',
      inputSchema: ExtractComponentsInput.shape,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    },
    async ({ html, library, confidenceThreshold }) => {
      const ctx = createContext({
        prompt: '',
        framework: 'react',
        componentLibrary: library,
        enableAccessibility: false,
        enableResponsive: false,
      });
      const ctxWithHtml = { ...ctx, rawHtml: html, processedHtml: html };
      const result = await pipeline.execute(ctxWithHtml, undefined, ['convert']);
      const tree = result.context.componentTree;

      const mappings: Record<string, unknown>[] = [];
      if (tree) {
        collectMappings(tree.root, mappings, confidenceThreshold);
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            components: tree?.extractedComponents.map(c => ({
              name: c.name,
              mapping: c.node.mappedComponent,
            })) ?? [],
            allMappings: mappings,
            stateVariables: tree?.stateVariables ?? [],
          }, null, 2),
        }],
      };
    },
  );
}

function collectMappings(
  node: import('../types/components.js').ComponentNode,
  out: Record<string, unknown>[],
  threshold: number,
) {
  if (node.mappedComponent && node.mappedComponent.confidence >= threshold) {
    out.push({
      originalTag: node.tag,
      mappedTo: node.mappedComponent.name,
      library: node.mappedComponent.library,
      importPath: node.mappedComponent.importPath,
      confidence: node.mappedComponent.confidence,
    });
  }
  for (const child of node.children) {
    if (typeof child !== 'string') collectMappings(child, out, threshold);
  }
}
