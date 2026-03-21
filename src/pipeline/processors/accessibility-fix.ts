import { JSDOM } from 'jsdom';
import axe from 'axe-core';
import type { Processor, PipelineContext, A11yReport } from '../../types/pipeline.js';
import { logger } from '../../utils/logger.js';

export class AccessibilityFixProcessor implements Processor {
  readonly name = 'accessibility-fix';
  readonly phase = 'post-generate' as const;

  shouldRun(ctx: PipelineContext): boolean {
    return ctx.enableAccessibility && !!ctx.processedHtml;
  }

  async process(ctx: PipelineContext): Promise<PipelineContext> {
    const html = ctx.processedHtml ?? ctx.rawHtml;
    if (!html) return ctx;

    const dom = new JSDOM(html, { runScripts: 'outside-only' });
    const document = dom.window.document;

    // Run axe-core audit
    const results = await axe.run(document.documentElement, {
      rules: {
        'color-contrast': { enabled: true },
        'image-alt': { enabled: true },
        'label': { enabled: true },
        'link-name': { enabled: true },
        'button-name': { enabled: true },
        'html-has-lang': { enabled: true },
        'landmark-one-main': { enabled: true },
        'region': { enabled: true },
      },
    });

    let fixesApplied = 0;

    // Auto-fix: missing alt attributes
    const imgs = document.querySelectorAll('img:not([alt])');
    imgs.forEach(img => {
      img.setAttribute('alt', '');
      fixesApplied++;
    });

    // Auto-fix: buttons without accessible names
    const buttons = document.querySelectorAll('button:empty');
    buttons.forEach(btn => {
      if (!btn.getAttribute('aria-label')) {
        btn.setAttribute('aria-label', 'Button');
        fixesApplied++;
      }
    });

    // Auto-fix: links without text
    const links = document.querySelectorAll('a:not([aria-label])');
    links.forEach(link => {
      if (!link.textContent?.trim() && !link.querySelector('img')) {
        link.setAttribute('aria-label', 'Link');
        fixesApplied++;
      }
    });

    // Auto-fix: missing lang attribute
    const htmlEl = document.querySelector('html');
    if (htmlEl && !htmlEl.getAttribute('lang')) {
      htmlEl.setAttribute('lang', 'en');
      fixesApplied++;
    }

    // Auto-fix: semantic structure
    const body = document.querySelector('body');
    if (body && !document.querySelector('main')) {
      // Wrap body content in <main> if no main exists
      const main = document.createElement('main');
      while (body.firstChild) {
        main.appendChild(body.firstChild);
      }
      body.appendChild(main);
      fixesApplied++;
    }

    // Auto-fix: touch targets (min 44x44)
    const clickables = document.querySelectorAll('button, a, input, select, textarea');
    clickables.forEach(el => {
      const style = el.getAttribute('style') || '';
      if (!style.includes('min-height') && !style.includes('min-width')) {
        const classes = el.getAttribute('class') || '';
        if (!classes.includes('min-h-') && !classes.includes('min-w-')) {
          el.setAttribute('class', `${classes} min-h-[44px] min-w-[44px]`.trim());
          fixesApplied++;
        }
      }
    });

    const report: A11yReport = {
      violations: results.violations.map(v => ({
        id: v.id,
        impact: v.impact as A11yReport['violations'][0]['impact'],
        description: v.description,
        help: v.help,
        nodes: v.nodes.length,
        fixed: false,
      })),
      passes: results.passes.length,
      fixesApplied,
    };

    logger.info('Accessibility audit complete', {
      violations: results.violations.length,
      passes: results.passes.length,
      fixesApplied,
    });

    return {
      ...ctx,
      processedHtml: dom.serialize(),
      accessibilityReport: report,
    };
  }
}
