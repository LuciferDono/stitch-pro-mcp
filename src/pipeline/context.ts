import { v4 as uuid } from 'uuid';
import type { PipelineContext, Framework, ComponentLibrary } from '../types/pipeline.js';
import type { DeviceType } from '../types/stitch.js';
import type { DesignSystem } from '../types/design-system.js';

export interface CreateContextOptions {
  prompt: string;
  deviceType?: DeviceType;
  framework?: Framework;
  componentLibrary?: ComponentLibrary;
  enableAccessibility?: boolean;
  enableResponsive?: boolean;
  designSystem?: DesignSystem;
}

export function createContext(opts: CreateContextOptions): PipelineContext {
  return {
    id: uuid(),
    originalPrompt: opts.prompt,
    deviceType: opts.deviceType ?? 'DESKTOP',
    framework: opts.framework ?? 'html',
    componentLibrary: opts.componentLibrary ?? 'none',
    enableAccessibility: opts.enableAccessibility ?? true,
    enableResponsive: opts.enableResponsive ?? true,
    designSystem: opts.designSystem,
    errors: [],
    metadata: {},
    timings: new Map(),
  };
}
