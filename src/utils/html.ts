import * as parse5 from 'parse5';

type Node = parse5.DefaultTreeAdapterMap['node'];
type Element = parse5.DefaultTreeAdapterMap['element'];
type TextNode = parse5.DefaultTreeAdapterMap['textNode'];
type Document = parse5.DefaultTreeAdapterMap['document'];
type DocumentFragment = parse5.DefaultTreeAdapterMap['documentFragment'];

export function parseHtml(html: string): Document {
  return parse5.parse(html);
}

export function serializeHtml(doc: Document | DocumentFragment): string {
  return parse5.serialize(doc);
}

export function parseFragment(html: string): DocumentFragment {
  return parse5.parseFragment(html);
}

/** Extract all text content from a parse5 node tree */
export function getTextContent(node: Node): string {
  if ('value' in node && node.nodeName === '#text') {
    return (node as TextNode).value;
  }
  if ('childNodes' in node) {
    return (node as Element).childNodes.map(getTextContent).join('');
  }
  return '';
}

/** Find elements matching a tag name */
export function findElements(node: Node, tagName: string): Element[] {
  const results: Element[] = [];
  if ('tagName' in node && node.tagName === tagName) {
    results.push(node as Element);
  }
  if ('childNodes' in node) {
    for (const child of (node as Element).childNodes) {
      results.push(...findElements(child, tagName));
    }
  }
  return results;
}

/** Get attribute value from an element */
export function getAttr(el: Element, name: string): string | undefined {
  return el.attrs?.find(a => a.name === name)?.value;
}

/** Set attribute on an element */
export function setAttr(el: Element, name: string, value: string): void {
  const existing = el.attrs?.find(a => a.name === name);
  if (existing) {
    existing.value = value;
  } else {
    el.attrs = el.attrs || [];
    el.attrs.push({ name, value });
  }
}
