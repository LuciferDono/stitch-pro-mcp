import type { ComponentNode, MappedComponent } from '../types/components.js';
import type { ComponentLibrary } from '../types/pipeline.js';

interface ComponentPattern {
  name: string;
  importPath: string;
  match: (node: ComponentNode) => number; // 0-1 confidence
  propMapping: Record<string, Record<string, string>>;
}

const SHADCN_PATTERNS: ComponentPattern[] = [
  {
    name: 'Button',
    importPath: '@/components/ui/button',
    match: (node) => {
      if (node.tag !== 'button' && node.tag !== 'a') return 0;
      const cls = node.classes.join(' ');
      let score = 0.3;
      if (/inline-flex.*items-center/.test(cls)) score += 0.2;
      if (/rounded/.test(cls)) score += 0.1;
      if (/bg-primary|bg-secondary|bg-destructive/.test(cls)) score += 0.2;
      if (/px-\d+.*py-\d+/.test(cls)) score += 0.1;
      return Math.min(score, 1.0);
    },
    propMapping: {
      'bg-destructive': { variant: 'destructive' },
      'bg-secondary': { variant: 'secondary' },
      'bg-ghost': { variant: 'ghost' },
      'bg-outline': { variant: 'outline' },
    },
  },
  {
    name: 'Card',
    importPath: '@/components/ui/card',
    match: (node) => {
      if (node.tag !== 'div') return 0;
      const cls = node.classes.join(' ');
      let score = 0;
      if (/rounded.*border/.test(cls) || /shadow/.test(cls)) score += 0.4;
      if (/bg-card|bg-white|bg-background/.test(cls)) score += 0.2;
      if (/p-\d+/.test(cls)) score += 0.2;
      if (node.children.length >= 2) score += 0.1;
      return Math.min(score, 1.0);
    },
    propMapping: {},
  },
  {
    name: 'Input',
    importPath: '@/components/ui/input',
    match: (node) => {
      if (node.tag !== 'input') return 0;
      const type = node.props.type as string || 'text';
      if (['text', 'email', 'password', 'search', 'tel', 'url', 'number'].includes(type)) {
        return 0.8;
      }
      return 0.3;
    },
    propMapping: {},
  },
  {
    name: 'Badge',
    importPath: '@/components/ui/badge',
    match: (node) => {
      if (node.tag !== 'span' && node.tag !== 'div') return 0;
      const cls = node.classes.join(' ');
      let score = 0;
      if (/inline-flex.*items-center.*rounded/.test(cls)) score += 0.5;
      if (/text-xs|text-sm/.test(cls) && /px-\d+/.test(cls)) score += 0.3;
      if (/badge/.test(cls)) score += 0.3;
      return Math.min(score, 1.0);
    },
    propMapping: {},
  },
  {
    name: 'Avatar',
    importPath: '@/components/ui/avatar',
    match: (node) => {
      if (node.tag !== 'div' && node.tag !== 'span') return 0;
      const cls = node.classes.join(' ');
      let score = 0;
      if (/rounded-full/.test(cls)) score += 0.3;
      if (/w-\d+.*h-\d+/.test(cls) || /size-\d+/.test(cls)) score += 0.2;
      if (/overflow-hidden/.test(cls)) score += 0.2;
      // Check for img child
      const hasImg = node.children.some(c => typeof c !== 'string' && c.tag === 'img');
      if (hasImg) score += 0.3;
      return Math.min(score, 1.0);
    },
    propMapping: {},
  },
  {
    name: 'Separator',
    importPath: '@/components/ui/separator',
    match: (node) => {
      if (node.tag === 'hr') return 0.9;
      if (node.tag !== 'div') return 0;
      const cls = node.classes.join(' ');
      if (/border-t|border-b|divide/.test(cls) && /h-px|h-\[1px\]/.test(cls)) return 0.7;
      return 0;
    },
    propMapping: {},
  },
];

const LIBRARY_PATTERNS: Record<string, ComponentPattern[]> = {
  shadcn: SHADCN_PATTERNS,
  radix: SHADCN_PATTERNS.map(p => ({
    ...p,
    importPath: p.importPath.replace('@/components/ui/', '@radix-ui/react-').replace(/\//g, '-'),
  })),
  mui: SHADCN_PATTERNS.map(p => ({
    ...p,
    importPath: `@mui/material/${p.name}`,
  })),
};

/** Map a ComponentNode to a library component if confidence exceeds threshold */
export function mapComponent(
  node: ComponentNode,
  library: ComponentLibrary,
  threshold: number = 0.6,
): MappedComponent | undefined {
  if (library === 'none') return undefined;

  const patterns = LIBRARY_PATTERNS[library];
  if (!patterns) return undefined;

  let bestMatch: { pattern: ComponentPattern; confidence: number } | null = null;

  for (const pattern of patterns) {
    const confidence = pattern.match(node);
    if (confidence >= threshold && (!bestMatch || confidence > bestMatch.confidence)) {
      bestMatch = { pattern, confidence };
    }
  }

  if (!bestMatch) return undefined;

  return {
    library: library as MappedComponent['library'],
    name: bestMatch.pattern.name,
    importPath: bestMatch.pattern.importPath,
    propMapping: bestMatch.pattern.propMapping,
    confidence: bestMatch.confidence,
  };
}

/** Recursively map all nodes in a tree */
export function mapAllComponents(
  node: ComponentNode,
  library: ComponentLibrary,
  threshold: number = 0.6,
): ComponentNode {
  const mapped = mapComponent(node, library, threshold);
  const children = node.children.map(child => {
    if (typeof child === 'string') return child;
    return mapAllComponents(child, library, threshold);
  });

  return {
    ...node,
    mappedComponent: mapped,
    children,
  };
}
