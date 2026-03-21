import type { Processor, PipelineContext } from '../../types/pipeline.js';
import { emitReact } from '../../conversion/react-emitter.js';
import { emitVue } from '../../conversion/vue-emitter.js';
import { emitSvelte } from '../../conversion/svelte-emitter.js';

export class ReactConvertProcessor implements Processor {
  readonly name = 'react-convert';
  readonly phase = 'convert' as const;

  shouldRun(ctx: PipelineContext): boolean {
    return ctx.framework === 'react' && !!ctx.componentTree;
  }

  async process(ctx: PipelineContext): Promise<PipelineContext> {
    const appRouter = (ctx.metadata.appRouter as boolean) ?? true;
    const output = emitReact(ctx.componentTree!, appRouter);
    return { ...ctx, frameworkOutput: output };
  }
}

export class VueConvertProcessor implements Processor {
  readonly name = 'vue-convert';
  readonly phase = 'convert' as const;

  shouldRun(ctx: PipelineContext): boolean {
    return ctx.framework === 'vue' && !!ctx.componentTree;
  }

  async process(ctx: PipelineContext): Promise<PipelineContext> {
    const output = emitVue(ctx.componentTree!);
    return { ...ctx, frameworkOutput: output };
  }
}

export class SvelteConvertProcessor implements Processor {
  readonly name = 'svelte-convert';
  readonly phase = 'convert' as const;

  shouldRun(ctx: PipelineContext): boolean {
    return ctx.framework === 'svelte' && !!ctx.componentTree;
  }

  async process(ctx: PipelineContext): Promise<PipelineContext> {
    const output = emitSvelte(ctx.componentTree!);
    return { ...ctx, frameworkOutput: output };
  }
}
