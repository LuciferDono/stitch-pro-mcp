import type { ComponentNode, ComponentTree, OutputFile, StateVariable, ImportDeclaration, FrameworkOutput } from '../types/components.js';

export function emitReact(tree: ComponentTree, appRouter: boolean = true): FrameworkOutput {
  const files: OutputFile[] = [];
  const imports: ImportDeclaration[] = [];
  const deps: Record<string, string> = {
    react: '^19.0.0',
    'react-dom': '^19.0.0',
  };

  if (appRouter) {
    deps.next = '^15.0.0';
  }

  // Collect component library imports
  collectImports(tree.root, imports);

  // Emit extracted components
  for (const comp of tree.extractedComponents) {
    const content = emitComponent(comp.name, comp.node, comp.props.length > 0 ? comp.props : undefined, []);
    files.push({
      path: `components/${comp.name}.tsx`,
      content: appRouter ? `'use client';\n\n${content}` : content,
      language: 'tsx',
    });
  }

  // Emit main page
  const mainContent = emitComponent('Page', tree.root, undefined, tree.stateVariables, imports);
  files.push({
    path: appRouter ? 'app/page.tsx' : 'pages/index.tsx',
    content: appRouter ? `'use client';\n\n${mainContent}` : mainContent,
    language: 'tsx',
  });

  // Add shadcn imports to deps if used
  for (const imp of imports) {
    if (imp.source.startsWith('@radix-ui/')) {
      deps[imp.source] = 'latest';
    }
  }

  return { framework: 'react', files, packageDependencies: deps };
}

function emitComponent(
  name: string,
  node: ComponentNode,
  props?: { name: string; type: string; required: boolean }[],
  stateVars?: StateVariable[],
  extraImports?: ImportDeclaration[],
): string {
  const lines: string[] = [];

  // Imports
  const reactImports = new Set<string>();
  if (stateVars && stateVars.length > 0) reactImports.add('useState');

  lines.push(`import React${reactImports.size > 0 ? `, { ${[...reactImports].join(', ')} }` : ''} from 'react';`);

  // Component library imports
  if (extraImports) {
    const grouped = groupImports(extraImports);
    for (const [source, names] of Object.entries(grouped)) {
      lines.push(`import { ${names.join(', ')} } from '${source}';`);
    }
  }

  lines.push('');

  // Props interface
  if (props && props.length > 0) {
    lines.push(`interface ${name}Props {`);
    for (const p of props) {
      lines.push(`  ${p.name}${p.required ? '' : '?'}: ${p.type};`);
    }
    lines.push('}');
    lines.push('');
  }

  // Component function
  const propsArg = props && props.length > 0 ? `{ ${props.map(p => p.name).join(', ')} }: ${name}Props` : '';
  lines.push(`export default function ${name}(${propsArg}) {`);

  // State declarations
  if (stateVars) {
    for (const v of stateVars) {
      lines.push(`  const [${v.name}, set${capitalize(v.name)}] = useState<${v.type}>(${v.defaultValue});`);
    }
    if (stateVars.length > 0) lines.push('');
  }

  // Event handlers
  const handlers = collectHandlers(node);
  for (const h of handlers) {
    lines.push(`  const ${h} = () => {`);
    lines.push(`    // TODO: implement`);
    lines.push(`  };`);
    lines.push('');
  }

  // JSX
  lines.push('  return (');
  lines.push(nodeToJsx(node, 4));
  lines.push('  );');
  lines.push('}');

  return lines.join('\n');
}

function nodeToJsx(node: ComponentNode, indent: number): string {
  const pad = ' '.repeat(indent);
  const tag = node.mappedComponent ? node.mappedComponent.name : node.tag;

  // Self-closing tags
  if (['input', 'img', 'br', 'hr', 'meta', 'link'].includes(node.tag) && node.children.length === 0) {
    return `${pad}<${tag}${propsToJsx(node)} />`;
  }

  // Text-only children
  if (node.children.length === 1 && typeof node.children[0] === 'string') {
    return `${pad}<${tag}${propsToJsx(node)}>${node.children[0]}</${tag}>`;
  }

  // No children
  if (node.children.length === 0) {
    return `${pad}<${tag}${propsToJsx(node)} />`;
  }

  // Complex children
  const childLines = node.children.map(child => {
    if (typeof child === 'string') return `${pad}  ${child}`;
    return nodeToJsx(child, indent + 2);
  });

  return `${pad}<${tag}${propsToJsx(node)}>\n${childLines.join('\n')}\n${pad}</${tag}>`;
}

function propsToJsx(node: ComponentNode): string {
  const parts: string[] = [];

  // Classes → className
  if (node.classes.length > 0) {
    parts.push(`className="${node.classes.join(' ')}"`);
  }

  // Props
  for (const [key, value] of Object.entries(node.props)) {
    if (key === 'class') continue;
    const jsxKey = key === 'for' ? 'htmlFor' : key;
    if (typeof value === 'boolean') {
      parts.push(value ? jsxKey : `${jsxKey}={false}`);
    } else {
      parts.push(`${jsxKey}="${value}"`);
    }
  }

  // Events
  for (const evt of node.events) {
    parts.push(`on${capitalize(evt.event)}={${evt.handler}}`);
  }

  return parts.length > 0 ? ' ' + parts.join(' ') : '';
}

function collectImports(node: ComponentNode, imports: ImportDeclaration[]) {
  if (node.mappedComponent) {
    const existing = imports.find(i => i.source === node.mappedComponent!.importPath);
    if (existing) {
      if (!existing.names.includes(node.mappedComponent.name)) {
        existing.names.push(node.mappedComponent.name);
      }
    } else {
      imports.push({
        source: node.mappedComponent.importPath,
        names: [node.mappedComponent.name],
        isDefault: false,
      });
    }
  }
  for (const child of node.children) {
    if (typeof child !== 'string') collectImports(child, imports);
  }
}

function collectHandlers(node: ComponentNode): string[] {
  const handlers = new Set<string>();
  walkNode(node, n => {
    for (const evt of n.events) {
      handlers.add(evt.handler);
    }
  });
  return [...handlers];
}

function walkNode(node: ComponentNode, fn: (n: ComponentNode) => void) {
  fn(node);
  for (const child of node.children) {
    if (typeof child !== 'string') walkNode(child, fn);
  }
}

function groupImports(imports: ImportDeclaration[]): Record<string, string[]> {
  const grouped: Record<string, string[]> = {};
  for (const imp of imports) {
    if (!grouped[imp.source]) grouped[imp.source] = [];
    for (const name of imp.names) {
      if (!grouped[imp.source].includes(name)) grouped[imp.source].push(name);
    }
  }
  return grouped;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
