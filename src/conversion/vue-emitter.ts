import type { ComponentNode, ComponentTree, OutputFile, StateVariable, FrameworkOutput } from '../types/components.js';

export function emitVue(tree: ComponentTree): FrameworkOutput {
  const files: OutputFile[] = [];
  const deps: Record<string, string> = {
    vue: '^3.5.0',
  };

  // Emit extracted components
  for (const comp of tree.extractedComponents) {
    const content = emitSFC(comp.name, comp.node, []);
    files.push({ path: `components/${comp.name}.vue`, content, language: 'vue' });
  }

  // Emit main page
  const mainContent = emitSFC('Page', tree.root, tree.stateVariables);
  files.push({ path: 'pages/index.vue', content: mainContent, language: 'vue' });

  return { framework: 'vue', files, packageDependencies: deps };
}

function emitSFC(name: string, node: ComponentNode, stateVars: StateVariable[]): string {
  const template = nodeToTemplate(node, 2);
  const script = emitScript(name, node, stateVars);
  const styles = extractStyles(node);

  const parts: string[] = [
    '<template>',
    template,
    '</template>',
    '',
    '<script setup lang="ts">',
    script,
    '</script>',
  ];

  if (styles) {
    parts.push('', '<style scoped>', styles, '</style>');
  }

  return parts.join('\n');
}

function emitScript(name: string, node: ComponentNode, stateVars: StateVariable[]): string {
  const lines: string[] = [];

  if (stateVars.length > 0) {
    lines.push("import { ref } from 'vue';");
    lines.push('');
    for (const v of stateVars) {
      lines.push(`const ${v.name} = ref<${v.type}>(${v.defaultValue});`);
    }
  }

  // Collect handlers
  const handlers = new Set<string>();
  walkNode(node, n => {
    for (const evt of n.events) handlers.add(evt.handler);
  });

  if (handlers.size > 0 && lines.length > 0) lines.push('');
  for (const h of handlers) {
    lines.push(`function ${h}() {`);
    lines.push('  // TODO: implement');
    lines.push('}');
  }

  return lines.join('\n');
}

function nodeToTemplate(node: ComponentNode, indent: number): string {
  const pad = ' '.repeat(indent);
  const tag = node.mappedComponent ? node.mappedComponent.name : node.tag;

  const attrs = buildVueAttrs(node);

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
    return nodeToTemplate(child, indent + 2);
  });

  return `${pad}<${tag}${attrs}>\n${childLines.join('\n')}\n${pad}</${tag}>`;
}

function buildVueAttrs(node: ComponentNode): string {
  const parts: string[] = [];

  if (node.classes.length > 0) {
    parts.push(`class="${node.classes.join(' ')}"`);
  }

  for (const [key, value] of Object.entries(node.props)) {
    if (key === 'class') continue;
    if (typeof value === 'boolean') {
      parts.push(value ? key : `:${key}="false"`);
    } else {
      parts.push(`${key}="${value}"`);
    }
  }

  for (const evt of node.events) {
    parts.push(`@${evt.event}="${evt.handler}"`);
  }

  return parts.length > 0 ? ' ' + parts.join(' ') : '';
}

function extractStyles(_node: ComponentNode): string {
  // Tailwind-based — no scoped styles needed
  return '';
}

function walkNode(node: ComponentNode, fn: (n: ComponentNode) => void) {
  fn(node);
  for (const child of node.children) {
    if (typeof child !== 'string') walkNode(child, fn);
  }
}
