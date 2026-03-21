import type { ComponentNode, ComponentTree, OutputFile, StateVariable, FrameworkOutput } from '../types/components.js';

export function emitSvelte(tree: ComponentTree): FrameworkOutput {
  const files: OutputFile[] = [];
  const deps: Record<string, string> = {
    svelte: '^5.0.0',
    '@sveltejs/kit': '^2.0.0',
  };

  // Emit extracted components
  for (const comp of tree.extractedComponents) {
    const content = emitSvelteComponent(comp.name, comp.node, []);
    files.push({ path: `lib/components/${comp.name}.svelte`, content, language: 'svelte' });
  }

  // Emit main page
  const mainContent = emitSvelteComponent('Page', tree.root, tree.stateVariables);
  files.push({ path: 'routes/+page.svelte', content: mainContent, language: 'svelte' });

  return { framework: 'svelte', files, packageDependencies: deps };
}

function emitSvelteComponent(name: string, node: ComponentNode, stateVars: StateVariable[]): string {
  const parts: string[] = [];

  // Script block with Svelte 5 runes
  if (stateVars.length > 0 || hasHandlers(node)) {
    parts.push('<script lang="ts">');

    for (const v of stateVars) {
      parts.push(`  let ${v.name} = $state<${v.type}>(${v.defaultValue});`);
    }

    const handlers = collectHandlers(node);
    if (handlers.size > 0 && stateVars.length > 0) parts.push('');
    for (const h of handlers) {
      parts.push(`  function ${h}() {`);
      parts.push('    // TODO: implement');
      parts.push('  }');
    }

    parts.push('</script>');
    parts.push('');
  }

  // Template
  parts.push(nodeToSvelteMarkup(node, 0));

  return parts.join('\n');
}

function nodeToSvelteMarkup(node: ComponentNode, indent: number): string {
  const pad = ' '.repeat(indent);
  const tag = node.mappedComponent ? node.mappedComponent.name : node.tag;
  const attrs = buildSvelteAttrs(node);

  // Self-closing
  if (['input', 'img', 'br', 'hr'].includes(node.tag) && node.children.length === 0) {
    return `${pad}<${tag}${attrs} />`;
  }

  // Text-only
  if (node.children.length === 1 && typeof node.children[0] === 'string') {
    return `${pad}<${tag}${attrs}>${node.children[0]}</${tag}>`;
  }

  if (node.children.length === 0) {
    return `${pad}<${tag}${attrs} />`;
  }

  const childLines = node.children.map(child => {
    if (typeof child === 'string') return `${pad}  ${child}`;
    return nodeToSvelteMarkup(child, indent + 2);
  });

  return `${pad}<${tag}${attrs}>\n${childLines.join('\n')}\n${pad}</${tag}>`;
}

function buildSvelteAttrs(node: ComponentNode): string {
  const parts: string[] = [];

  if (node.classes.length > 0) {
    parts.push(`class="${node.classes.join(' ')}"`);
  }

  for (const [key, value] of Object.entries(node.props)) {
    if (key === 'class') continue;
    if (typeof value === 'boolean') {
      parts.push(value ? key : `${key}={false}`);
    } else {
      parts.push(`${key}="${value}"`);
    }
  }

  for (const evt of node.events) {
    parts.push(`on:${evt.event}={${evt.handler}}`);
  }

  return parts.length > 0 ? ' ' + parts.join(' ') : '';
}

function hasHandlers(node: ComponentNode): boolean {
  if (node.events.length > 0) return true;
  return node.children.some(c => typeof c !== 'string' && hasHandlers(c));
}

function collectHandlers(node: ComponentNode): Set<string> {
  const handlers = new Set<string>();
  walkNode(node, n => {
    for (const evt of n.events) handlers.add(evt.handler);
  });
  return handlers;
}

function walkNode(node: ComponentNode, fn: (n: ComponentNode) => void) {
  fn(node);
  for (const child of node.children) {
    if (typeof child !== 'string') walkNode(child, fn);
  }
}
