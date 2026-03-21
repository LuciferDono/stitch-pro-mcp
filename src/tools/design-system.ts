import { v4 as uuid } from 'uuid';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { DesignSystemCreateInput, ApplyDesignSystemInput } from '../types/tools.js';
import type { DesignSystem } from '../types/design-system.js';
import Color from 'color';

export function registerDesignSystemTools(
  server: McpServer,
  designSystems: Map<string, DesignSystem>,
) {
  server.registerTool(
    'stitch_pro_design_system_create',
    {
      title: 'Create Design System',
      description: 'Generate a design system (colors, typography, spacing, rules) from a brand description. Returns a DESIGN.md and an ID for use in generation calls.',
      inputSchema: DesignSystemCreateInput.shape,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
    },
    async (input) => {
      const id = uuid();
      const primaryColor = input.primaryColor || '#3B82F6';
      const ds = generateDesignSystem(id, input.name, {
        name: input.name,
        industry: input.industry,
        personality: input.personality,
        primaryColor,
      });

      designSystems.set(id, ds);

      const designMd = serializeToDesignMd(ds);

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            designSystemId: id,
            designMd,
            tokens: ds.tokens,
            rules: ds.rules,
          }, null, 2),
        }],
      };
    },
  );

  server.registerTool(
    'stitch_pro_apply_design_system',
    {
      title: 'Apply Design System',
      description: 'Apply a previously created design system to existing HTML — injects CSS variables, replaces fonts and colors',
      inputSchema: ApplyDesignSystemInput.shape,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    },
    async ({ html, designSystemId }) => {
      const ds = designSystems.get(designSystemId);
      if (!ds) {
        return {
          content: [{ type: 'text', text: `Error: Design system "${designSystemId}" not found. Create one first with stitch_pro_design_system_create.` }],
          isError: true,
        };
      }

      // Inject CSS custom properties
      const cssVars = Object.entries(flattenTokens(ds.tokens))
        .map(([k, v]) => `  ${k}: ${v};`)
        .join('\n');

      const styleBlock = `<style>\n:root {\n${cssVars}\n}\n</style>`;
      let result = html;

      if (result.includes('</head>')) {
        result = result.replace('</head>', `${styleBlock}\n</head>`);
      } else {
        result = `${styleBlock}\n${result}`;
      }

      return {
        content: [{ type: 'text', text: JSON.stringify({ html: result }, null, 2) }],
      };
    },
  );
}

function generateDesignSystem(id: string, name: string, brand: { name: string; industry?: string; personality: string[]; primaryColor: string }): DesignSystem {
  const primary = Color(brand.primaryColor);

  const generateScale = (base: Color): Record<string, string> => ({
    '50': base.lightness(97).hex(),
    '100': base.lightness(93).hex(),
    '200': base.lightness(85).hex(),
    '300': base.lightness(72).hex(),
    '400': base.lightness(58).hex(),
    '500': base.hex(),
    '600': base.darken(0.15).hex(),
    '700': base.darken(0.3).hex(),
    '800': base.darken(0.45).hex(),
    '900': base.darken(0.6).hex(),
  });

  return {
    id,
    name,
    version: '1.0.0',
    brand,
    tokens: {
      colors: {
        primary: generateScale(primary),
        secondary: generateScale(primary.rotate(30)),
        neutral: generateScale(Color('#6B7280')),
        success: generateScale(Color('#22C55E')),
        warning: generateScale(Color('#F59E0B')),
        error: generateScale(Color('#EF4444')),
      },
      typography: {
        fontFamilies: { heading: 'Inter', body: 'Inter', mono: 'JetBrains Mono' },
        sizes: {
          'heading-1': { size: '36px', lineHeight: '1.2', weight: '700' },
          'heading-2': { size: '28px', lineHeight: '1.3', weight: '600' },
          'heading-3': { size: '22px', lineHeight: '1.4', weight: '600' },
          'body': { size: '16px', lineHeight: '1.5', weight: '400' },
          'body-sm': { size: '14px', lineHeight: '1.5', weight: '400' },
          'caption': { size: '12px', lineHeight: '1.4', weight: '400' },
        },
      },
      spacing: {
        '0': '0px', '1': '4px', '2': '8px', '3': '12px', '4': '16px',
        '5': '20px', '6': '24px', '8': '32px', '10': '40px', '12': '48px',
        '16': '64px', '20': '80px', '24': '96px',
      },
      radii: { sm: '4px', md: '8px', lg: '12px', xl: '16px', full: '9999px' },
      shadows: {
        sm: '0 1px 2px rgba(0,0,0,0.05)',
        md: '0 4px 6px rgba(0,0,0,0.07)',
        lg: '0 10px 15px rgba(0,0,0,0.1)',
        xl: '0 20px 25px rgba(0,0,0,0.12)',
      },
    },
    rules: [
      { id: 'max-fonts', description: 'Maximum 2 font families', severity: 'error', validator: 'maxFonts' },
      { id: 'min-body-size', description: 'Minimum body text size: 16px', severity: 'warning', validator: 'minBodySize' },
      { id: 'focus-visible', description: 'All interactive elements need focus-visible ring', severity: 'error', validator: 'focusVisible' },
    ],
  };
}

function flattenTokens(tokens: DesignSystem['tokens']): Record<string, string> {
  const flat: Record<string, string> = {};
  for (const [scale, shades] of Object.entries(tokens.colors)) {
    for (const [shade, value] of Object.entries(shades as Record<string, string>)) {
      flat[`--color-${scale}-${shade}`] = value;
    }
  }
  flat['--font-heading'] = `'${tokens.typography.fontFamilies.heading}', sans-serif`;
  flat['--font-body'] = `'${tokens.typography.fontFamilies.body}', sans-serif`;
  for (const [key, value] of Object.entries(tokens.radii)) {
    flat[`--radius-${key}`] = value;
  }
  return flat;
}

function serializeToDesignMd(ds: DesignSystem): string {
  const lines: string[] = [
    `# Design System: ${ds.name}`,
    '',
    '## Brand',
    `- **Name**: ${ds.brand.name}`,
    `- **Personality**: ${ds.brand.personality.join(', ')}`,
  ];

  if (ds.brand.industry) lines.push(`- **Industry**: ${ds.brand.industry}`);
  lines.push('');

  lines.push('## Colors');
  lines.push('| Token | Value | Usage |');
  lines.push('|-------|-------|-------|');
  for (const [scale, shades] of Object.entries(ds.tokens.colors)) {
    for (const [shade, value] of Object.entries(shades as Record<string, string>)) {
      lines.push(`| ${scale}-${shade} | ${value} | ${scale} ${shade} |`);
    }
  }
  lines.push('');

  lines.push('## Typography');
  lines.push(`- Heading: ${ds.tokens.typography.fontFamilies.heading}`);
  lines.push(`- Body: ${ds.tokens.typography.fontFamilies.body}`);
  lines.push('');

  lines.push('## Rules');
  ds.rules.forEach((r, i) => lines.push(`${i + 1}. ${r.description}`));

  return lines.join('\n');
}
