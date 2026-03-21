import type { Processor, PipelineContext } from '../../types/pipeline.js';

/** Map of common fixed-width patterns → responsive equivalents */
const RESPONSIVE_REPLACEMENTS: [RegExp, string][] = [
  // Fixed widths → responsive
  [/\bw-\[(\d{4,})px\]/g, 'w-full max-w-7xl'],
  [/\bw-screen\b/g, 'w-full'],

  // Grid columns → responsive grid
  [/\bgrid-cols-4\b/g, 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'],
  [/\bgrid-cols-3\b/g, 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'],
  [/\bgrid-cols-2\b/g, 'grid-cols-1 md:grid-cols-2'],

  // Flex direction → responsive
  [/\bflex\s+(?=.*\bgap-)/g, 'flex flex-col sm:flex-row '],

  // Fixed padding → responsive
  [/\bpx-(\d{2,})\b/g, 'px-4 sm:px-6 lg:px-$1'],
  [/\bpy-(\d{2,})\b/g, 'py-4 sm:py-6 lg:py-$1'],

  // Text sizes → responsive
  [/\btext-6xl\b/g, 'text-3xl sm:text-4xl lg:text-6xl'],
  [/\btext-5xl\b/g, 'text-2xl sm:text-3xl lg:text-5xl'],
  [/\btext-4xl\b/g, 'text-xl sm:text-2xl lg:text-4xl'],
];

export class ResponsiveInjectProcessor implements Processor {
  readonly name = 'responsive-inject';
  readonly phase = 'post-generate' as const;

  shouldRun(ctx: PipelineContext): boolean {
    return ctx.enableResponsive && !!ctx.processedHtml;
  }

  async process(ctx: PipelineContext): Promise<PipelineContext> {
    let html = ctx.processedHtml ?? ctx.rawHtml;
    if (!html) return ctx;

    // Apply responsive class replacements
    for (const [pattern, replacement] of RESPONSIVE_REPLACEMENTS) {
      html = html.replace(pattern, replacement);
    }

    // Add viewport meta tag if missing
    if (!html.includes('viewport')) {
      html = html.replace(
        '<head>',
        '<head>\n<meta name="viewport" content="width=device-width, initial-scale=1.0">',
      );
    }

    // Add container class to body's first div if it lacks one
    html = html.replace(
      /<body([^>]*)>\s*<div(?!.*\bcontainer\b)/,
      '<body$1>\n<div class="container mx-auto px-4"',
    );

    return {
      ...ctx,
      processedHtml: html,
    };
  }
}
