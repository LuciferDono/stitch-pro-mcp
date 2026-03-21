export interface ComponentNode {
  tag: string;
  mappedComponent?: MappedComponent;
  props: Record<string, string | boolean | number>;
  children: (ComponentNode | string)[];
  classes: string[];
  events: EventBinding[];
  isComponent: boolean;
  componentName?: string;
}

export interface MappedComponent {
  library: 'shadcn' | 'radix' | 'mui';
  name: string;
  importPath: string;
  propMapping: Record<string, Record<string, string>>;
  confidence: number;
}

export interface EventBinding {
  event: string;
  handler: string;
}

export interface ComponentTree {
  root: ComponentNode;
  extractedComponents: ExtractedComponent[];
  imports: ImportDeclaration[];
  stateVariables: StateVariable[];
}

export interface ExtractedComponent {
  name: string;
  node: ComponentNode;
  props: PropDefinition[];
}

export interface ImportDeclaration {
  source: string;
  names: string[];
  isDefault: boolean;
}

export interface StateVariable {
  name: string;
  type: string;
  defaultValue: string;
  source: 'input' | 'toggle' | 'select' | 'inferred';
}

export interface PropDefinition {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
}

export interface FrameworkOutput {
  framework: 'react' | 'vue' | 'svelte';
  files: OutputFile[];
  packageDependencies: Record<string, string>;
}

export interface OutputFile {
  path: string;
  content: string;
  language: string;
}
