import type { Processor, PipelineContext, PipelineResult, ProcessorPhase } from '../types/pipeline.js';
import { ProcessorFatalError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

const PHASE_ORDER: ProcessorPhase[] = ['pre-generate', 'post-generate', 'convert', 'finalize'];

export class PipelineEngine {
  private processors: Processor[] = [];

  register(processor: Processor): this {
    this.processors.push(processor);
    this.processors.sort(
      (a, b) => PHASE_ORDER.indexOf(a.phase) - PHASE_ORDER.indexOf(b.phase),
    );
    return this;
  }

  async execute(
    initialCtx: PipelineContext,
    stitchCall?: (ctx: PipelineContext) => Promise<PipelineContext>,
    phases?: ProcessorPhase[],
  ): Promise<PipelineResult> {
    let ctx = { ...initialCtx };
    const activePhases = phases ?? PHASE_ORDER;

    // Pre-generate phase
    if (activePhases.includes('pre-generate')) {
      ctx = await this.runPhase('pre-generate', ctx);
    }

    // Stitch API call (injected)
    if (stitchCall) {
      try {
        ctx = await stitchCall(ctx);
      } catch (err: any) {
        return {
          success: false,
          context: ctx,
          warnings: [`Stitch API error: ${err.message}`],
          timings: Object.fromEntries(ctx.timings),
        };
      }
    }

    // Remaining phases
    for (const phase of ['post-generate', 'convert', 'finalize'] as const) {
      if (!activePhases.includes(phase)) continue;
      ctx = await this.runPhase(phase, ctx);
    }

    return {
      success: ctx.errors.length === 0,
      context: ctx,
      warnings: ctx.errors.map(e => `[${e.processor}] ${e.message}`),
      timings: Object.fromEntries(ctx.timings),
    };
  }

  private async runPhase(phase: ProcessorPhase, ctx: PipelineContext): Promise<PipelineContext> {
    const phaseProcessors = this.processors.filter(p => p.phase === phase);
    for (const processor of phaseProcessors) {
      if (!processor.shouldRun(ctx)) {
        logger.debug(`Skipping ${processor.name}`, { phase });
        continue;
      }

      const start = Date.now();
      try {
        ctx = await processor.process(ctx);
        logger.info(`${processor.name} completed`, { phase, ms: Date.now() - start });
      } catch (err) {
        if (err instanceof ProcessorFatalError) {
          throw err;
        }
        const message = err instanceof Error ? err.message : String(err);
        logger.warn(`${processor.name} failed (non-fatal)`, { phase, error: message });
        ctx = {
          ...ctx,
          errors: [...ctx.errors, { processor: processor.name, message, recoverable: true }],
        };
      }
      ctx.timings.set(processor.name, Date.now() - start);
    }
    return ctx;
  }
}
