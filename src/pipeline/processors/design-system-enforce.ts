import type { Processor, PipelineContext } from '../../types/pipeline.js';
import type { DesignSystem } from '../../types/design-system.js';

export class DesignSystemEnrichProcessor implements Processor {
  readonly name = 'design-system-enrich';
  readonly phase = 'pre-generate' as const;

  shouldRun(ctx: PipelineContext): boolean {
    return !!ctx.designSystem;
  }

  async process(ctx: PipelineContext): Promise<PipelineContext> {
    const ds = ctx.designSystem!;
    const enrichment = buildPromptEnrichment(ds);
    return {
      ...ctx,
      enrichedPrompt: `${ctx.originalPrompt}\n\n${enrichment}`,
    };
  }
}

export class DesignSystemEnforceProcessor implements Processor {
  readonly name = 'design-system-enforce';
  readonly phase = 'post-generate' as const;

  shouldRun(ctx: PipelineContext): boolean {
    return !!ctx.designSystem && !!ctx.processedHtml;
  }

  async process(ctx: PipelineContext): Promise<PipelineContext> {
    const ds = ctx.designSystem!;
    let html = ctx.processedHtml ?? ctx.rawHtml;
    if (!html) return ctx;

    // Inject CSS custom properties
    const cssVars = generateCssVars(ds);
    const styleBlock = `<style>\n:root {\n${cssVars}\n}\n</style>`;

    if (html.includes('</head>')) {
      html = html.replace('</head>', `${styleBlock}\n</head>`);
    } else {
      html = `${styleBlock}\n${html}`;
    }

    // Replace font families
    const { heading, body } = ds.tokens.typography.fontFamilies;
    if (heading) {
      html = html.replace(
        /font-family:\s*[^;}"]+/g,
        (match) => {
          if (match.includes('monospace') || match.includes('mono')) return match;
          return `font-family: '${body}', sans-serif`;
        },
      );
    }

    return {
      ...ctx,
      processedHtml: html,
    };
  }
}

function buildPromptEnrichment(ds: DesignSystem): string {
  const lines: string[] = [
    `DESIGN SYSTEM: ${ds.name}`,
    `Brand personality: ${ds.brand.personality.join(', ')}`,
  ];

  if (ds.brand.primaryColor) {
    lines.push(`Primary color: ${ds.brand.primaryColor}`);
  }

  const { typography } = ds.tokens;
  lines.push(`Fonts: heading="${typography.fontFamilies.heading}", body="${typography.fontFamilies.body}"`);

  const colors = ds.tokens.colors;
  if (colors.primary['500']) {
    lines.push(`Primary: ${colors.primary['500']}`);
  }
  if (colors.secondary['500']) {
    lines.push(`Secondary: ${colors.secondary['500']}`);
  }

  lines.push(`Border radius: ${Object.entries(ds.tokens.radii).map(([k, v]) => `${k}=${v}`).join(', ')}`);

  return lines.join('\n');
}

function generateCssVars(ds: DesignSystem): string {
  const vars: string[] = [];

  // Colors
  for (const [scale, shades] of Object.entries(ds.tokens.colors)) {
    for (const [shade, value] of Object.entries(shades as Record<string, string>)) {
      vars.push(`  --color-${scale}-${shade}: ${value};`);
    }
  }

  // Typography
  const { fontFamilies } = ds.tokens.typography;
  vars.push(`  --font-heading: '${fontFamilies.heading}', sans-serif;`);
  vars.push(`  --font-body: '${fontFamilies.body}', sans-serif;`);
  if (fontFamilies.mono) {
    vars.push(`  --font-mono: '${fontFamilies.mono}', monospace;`);
  }

  // Spacing
  for (const [key, value] of Object.entries(ds.tokens.spacing)) {
    vars.push(`  --spacing-${key}: ${value};`);
  }

  // Radii
  for (const [key, value] of Object.entries(ds.tokens.radii)) {
    vars.push(`  --radius-${key}: ${value};`);
  }

  return vars.join('\n');
}
