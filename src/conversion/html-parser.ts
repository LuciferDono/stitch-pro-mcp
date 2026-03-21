import * as parse5 from 'parse5';
import type { ComponentNode, StateVariable, EventBinding } from '../types/components.js';

type Element = parse5.DefaultTreeAdapterMap['element'];
type TextNode = parse5.DefaultTreeAdapterMap['textNode'];
type Node = parse5.DefaultTreeAdapterMap['node'];

/** Parse HTML string into our framework-agnostic ComponentNode tree */
export function htmlToComponentTree(html: string): ComponentNode {
  const doc = parse5.parse(html);
  const body = findBody(doc);
  if (!body) {
    return { tag: 'div', props: {}, children: [html], classes: [], events: [], isComponent: false };
  }
  return elementToNode(body);
}

/** Extract state variables from the component tree (form inputs, toggles, etc.) */
export function extractStateVariables(node: ComponentNode): StateVariable[] {
  const vars: StateVariable[] = [];
  walkTree(node, (n) => {
    if (n.tag === 'input') {
      const type = (n.props.type as string) || 'text';
      const name = (n.props.name as string) || (n.props.id as string) || `input_${vars.length}`;
      if (type === 'checkbox' || type === 'radio') {
        vars.push({ name: camelCase(name), type: 'boolean', defaultValue: 'false', source: 'toggle' });
      } else {
        vars.push({ name: camelCase(name), type: 'string', defaultValue: "''", source: 'input' });
      }
    } else if (n.tag === 'select') {
      const name = (n.props.name as string) || `select_${vars.length}`;
      vars.push({ name: camelCase(name), type: 'string', defaultValue: "''", source: 'select' });
    } else if (n.tag === 'textarea') {
      const name = (n.props.name as string) || `textarea_${vars.length}`;
      vars.push({ name: camelCase(name), type: 'string', defaultValue: "''", source: 'input' });
    }
  });
  return dedupeVars(vars);
}

function elementToNode(el: Element): ComponentNode {
  const classes = getClasses(el);
  const props = extractProps(el);
  const events = extractEvents(el);
  const children: (ComponentNode | string)[] = [];

  for (const child of el.childNodes || []) {
    if (child.nodeName === '#text') {
      const text = (child as TextNode).value.trim();
      if (text) children.push(text);
    } else if ('tagName' in child) {
      children.push(elementToNode(child as Element));
    }
  }

  const isComponent = shouldExtractAsComponent(el, classes, children);
  const componentName = isComponent ? generateComponentName(el, classes) : undefined;

  return { tag: el.tagName, props, children, classes, events, isComponent, componentName };
}

function getClasses(el: Element): string[] {
  const cls = el.attrs?.find(a => a.name === 'class')?.value || '';
  return cls.split(/\s+/).filter(Boolean);
}

function extractProps(el: Element): Record<string, string | boolean> {
  const props: Record<string, string | boolean> = {};
  for (const attr of el.attrs || []) {
    if (attr.name === 'class' || attr.name === 'style') continue;
    if (attr.name.startsWith('on')) continue; // events handled separately
    if (attr.value === '') {
      props[attr.name] = true;
    } else {
      props[attr.name] = attr.value;
    }
  }
  return props;
}

function extractEvents(el: Element): EventBinding[] {
  const events: EventBinding[] = [];
  for (const attr of el.attrs || []) {
    if (attr.name.startsWith('on')) {
      events.push({
        event: attr.name.slice(2), // onclick → click
        handler: attr.value,
      });
    }
  }
  // Infer click handlers for buttons/links
  if ((el.tagName === 'button' || el.tagName === 'a') && events.length === 0) {
    events.push({ event: 'click', handler: 'handleClick' });
  }
  return events;
}

/** Heuristic: should this subtree be extracted as its own component? */
function shouldExtractAsComponent(el: Element, classes: string[], children: (ComponentNode | string)[]): boolean {
  // Sections, articles, nav, header, footer, aside → always extract
  if (['section', 'article', 'nav', 'header', 'footer', 'aside'].includes(el.tagName)) {
    return true;
  }
  // Divs with an id or data-component attribute
  const id = el.attrs?.find(a => a.name === 'id')?.value;
  if (id) return true;
  // Large subtrees (> 5 direct children)
  if (children.length > 5) return true;
  // Card-like patterns
  if (classes.some(c => /card|modal|dialog|sidebar|drawer|panel|hero/.test(c))) return true;
  return false;
}

function generateComponentName(el: Element, classes: string[]): string {
  // Try id first
  const id = el.attrs?.find(a => a.name === 'id')?.value;
  if (id) return pascalCase(id);
  // Try semantic tag
  if (['nav', 'header', 'footer', 'aside'].includes(el.tagName)) {
    return pascalCase(el.tagName);
  }
  // Try class hints
  for (const cls of classes) {
    if (/hero|card|sidebar|modal|dialog|drawer|panel|banner/.test(cls)) {
      return pascalCase(cls.replace(/[^a-zA-Z]/g, '-'));
    }
  }
  return pascalCase(el.tagName + '-section');
}

function walkTree(node: ComponentNode, fn: (n: ComponentNode) => void) {
  fn(node);
  for (const child of node.children) {
    if (typeof child !== 'string') walkTree(child, fn);
  }
}

function findBody(doc: parse5.DefaultTreeAdapterMap['document']): Element | null {
  for (const child of doc.childNodes) {
    if ('tagName' in child && child.tagName === 'html') {
      for (const htmlChild of (child as Element).childNodes) {
        if ('tagName' in htmlChild && (htmlChild as Element).tagName === 'body') {
          return htmlChild as Element;
        }
      }
    }
  }
  return null;
}

function camelCase(str: string): string {
  return str.replace(/[-_](\w)/g, (_, c) => c.toUpperCase()).replace(/^[A-Z]/, c => c.toLowerCase());
}

function pascalCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
}

function dedupeVars(vars: StateVariable[]): StateVariable[] {
  const seen = new Set<string>();
  return vars.filter(v => {
    if (seen.has(v.name)) return false;
    seen.add(v.name);
    return true;
  });
}
