import type { DesignSystem } from './design-system.js';
import type { ComponentTree, FrameworkOutput } from './components.js';
import type { DeviceType } from './stitch.js';

export type ProcessorPhase = 'pre-generate' | 'post-generate' | 'convert' | 'finalize';
export type Framework = 'html' | 'react' | 'vue' | 'svelte';
export type ComponentLibrary = 'none' | 'shadcn' | 'radix' | 'mui';

export interface Processor {
  readonly name: string;
  readonly phase: ProcessorPhase;
  shouldRun(ctx: PipelineContext): boolean;
  process(ctx: PipelineContext): Promise<PipelineContext>;
}

export interface ProcessorError {
  processor: string;
  message: string;
  recoverable: boolean;
}

export interface PipelineContext {
  readonly id: string;
  readonly originalPrompt: string;
  enrichedPrompt?: string;
  deviceType: DeviceType;
  framework: Framework;
  componentLibrary: ComponentLibrary;
  enableAccessibility: boolean;
  enableResponsive: boolean;
  rawHtml?: string;
  processedHtml?: string;
  componentTree?: ComponentTree;
  frameworkOutput?: FrameworkOutput;
  designSystem?: DesignSystem;
  accessibilityReport?: A11yReport;
  errors: ProcessorError[];
  metadata: Record<string, unknown>;
  timings: Map<string, number>;
}

export interface A11yReport {
  violations: A11yViolation[];
  passes: number;
  fixesApplied: number;
}

export interface A11yViolation {
  id: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  description: string;
  help: string;
  nodes: number;
  fixed: boolean;
}

export interface PipelineResult {
  success: boolean;
  context: PipelineContext;
  warnings: string[];
  timings: Record<string, number>;
}
