import { z } from 'zod';

export const GeneratePageInput = z.object({
  prompt: z.string().min(5).describe('Description of the page to generate'),
  projectId: z.string().describe('Stitch project ID'),
  deviceType: z.enum(['MOBILE', 'DESKTOP', 'TABLET', 'AGNOSTIC']).default('DESKTOP').describe('Target device'),
  framework: z.enum(['html', 'react', 'vue', 'svelte']).default('html').describe('Output framework'),
  componentLibrary: z.enum(['none', 'shadcn', 'radix', 'mui']).default('none').describe('Component library to map to'),
  accessibility: z.boolean().default(true).describe('Run WCAG 2.1 AA audit and auto-fix'),
  responsive: z.boolean().default(true).describe('Inject responsive breakpoints'),
  designSystemId: z.string().optional().describe('ID of a previously created design system'),
});

export const GenerateFlowInput = z.object({
  prompt: z.string().min(5).describe('Description of the multi-screen flow'),
  projectId: z.string().describe('Stitch project ID'),
  screens: z.array(z.string()).min(1).max(5).describe('Names/descriptions of each screen in the flow'),
  deviceType: z.enum(['MOBILE', 'DESKTOP', 'TABLET', 'AGNOSTIC']).default('DESKTOP'),
  framework: z.enum(['html', 'react', 'vue', 'svelte']).default('html'),
  componentLibrary: z.enum(['none', 'shadcn', 'radix', 'mui']).default('none'),
  accessibility: z.boolean().default(true),
  responsive: z.boolean().default(true),
  designSystemId: z.string().optional(),
});

export const DesignSystemCreateInput = z.object({
  name: z.string().describe('Name for the design system'),
  brandDescription: z.string().describe('Natural language description of the brand'),
  industry: z.string().optional().describe('Industry (e.g., fintech, healthcare, e-commerce)'),
  personality: z.array(z.string()).default(['modern', 'professional']).describe('Brand personality traits'),
  primaryColor: z.string().optional().describe('Primary brand color (hex)'),
});

export const ApplyDesignSystemInput = z.object({
  html: z.string().describe('HTML to apply design system to'),
  designSystemId: z.string().describe('ID of the design system to apply'),
});

export const ToFrameworkInput = z.object({
  html: z.string().describe('HTML/Tailwind source to convert'),
  componentLibrary: z.enum(['none', 'shadcn', 'radix', 'mui']).default('none'),
  appRouter: z.boolean().default(true).describe('Use Next.js App Router (React only)'),
});

export const ResponsiveAdaptInput = z.object({
  html: z.string().describe('HTML to make responsive'),
});

export const AccessibilityAuditInput = z.object({
  html: z.string().describe('HTML to audit for accessibility'),
  autoFix: z.boolean().default(true).describe('Automatically fix issues where possible'),
});

export const ExtractComponentsInput = z.object({
  html: z.string().describe('HTML to extract components from'),
  library: z.enum(['shadcn', 'radix', 'mui']).describe('Component library to map to'),
  confidenceThreshold: z.number().min(0).max(1).default(0.6).describe('Minimum confidence for mapping'),
});

export const ListProjectsInput = z.object({});

export const ListScreensInput = z.object({
  projectId: z.string().describe('Stitch project ID'),
});

export const GetScreenInput = z.object({
  projectId: z.string().describe('Stitch project ID'),
  screenId: z.string().describe('Screen ID'),
  includeHtml: z.boolean().default(true).describe('Include HTML source'),
});
