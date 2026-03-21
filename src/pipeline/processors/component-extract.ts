import type { Processor, PipelineContext } from '../../types/pipeline.js';
import type { ComponentTree, ExtractedComponent } from '../../types/components.js';
import { htmlToComponentTree, extractStateVariables } from '../../conversion/html-parser.js';
import { mapAllComponents } from '../../conversion/component-mapper.js';

export class ComponentExtractProcessor implements Processor {
  readonly name = 'component-extract';
  readonly phase = 'convert' as const;

  shouldRun(ctx: PipelineContext): boolean {
    return ctx.framework !== 'html' && !!(ctx.processedHtml ?? ctx.rawHtml);
  }

  async process(ctx: PipelineContext): Promise<PipelineContext> {
    const html = ctx.processedHtml ?? ctx.rawHtml;
    if (!html) return ctx;

    // Parse HTML → ComponentNode tree
    let root = htmlToComponentTree(html);

    // Map to component library if specified
    root = mapAllComponents(root, ctx.componentLibrary);

    // Extract state variables
    const stateVariables = extractStateVariables(root);

    // Extract marked components
    const extractedComponents: ExtractedComponent[] = [];
    collectExtracted(root, extractedComponents);

    const tree: ComponentTree = {
      root,
      extractedComponents,
      imports: [],
      stateVariables,
    };

    return { ...ctx, componentTree: tree };
  }
}

function collectExtracted(node: import('../../types/components.js').ComponentNode, out: ExtractedComponent[]) {
  if (node.isComponent && node.componentName) {
    out.push({
      name: node.componentName,
      node,
      props: [],
    });
  }
  for (const child of node.children) {
    if (typeof child !== 'string') collectExtracted(child, out);
  }
}
