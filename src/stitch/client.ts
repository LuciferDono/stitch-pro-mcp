import { stitch as stitchSingleton } from '@google/stitch-sdk';
import type { Stitch, Screen } from '@google/stitch-sdk';
import { LRUCache } from 'lru-cache';
import { logger } from '../utils/logger.js';
import { StitchApiError } from '../utils/errors.js';
import type { DeviceType, ScreenData, ProjectData, VariantOptions } from '../types/stitch.js';

const RETRY_DELAYS = [1000, 2000, 4000];
const RETRYABLE_CODES = new Set(['RATE_LIMITED', 'NETWORK_ERROR', 'UNKNOWN_ERROR']);

export class StitchClient {
  private stitch: Stitch;
  private htmlCache: LRUCache<string, string>;

  constructor() {
    // Uses pre-configured singleton that reads STITCH_API_KEY from env
    this.stitch = stitchSingleton;
    this.htmlCache = new LRUCache({ max: 50, ttl: 1000 * 60 * 30 }); // 30 min
  }

  async listProjects(): Promise<ProjectData[]> {
    const projects = await this.withRetry(() => this.stitch.projects());
    return projects.map(p => ({
      projectId: p.projectId,
      title: p.projectId, // SDK doesn't expose title directly
      screenCount: 0,
    }));
  }

  async listScreens(projectId: string): Promise<ScreenData[]> {
    const project = this.stitch.project(projectId);
    const screens = await this.withRetry(() => project.screens());
    return Promise.all(screens.map(s => this.screenToData(s)));
  }

  async getScreen(projectId: string, screenId: string): Promise<ScreenData> {
    const project = this.stitch.project(projectId);
    const screen = await this.withRetry(() => project.getScreen(screenId));
    return this.screenToData(screen);
  }

  async generate(projectId: string, prompt: string, deviceType: DeviceType = 'DESKTOP'): Promise<ScreenData> {
    const project = this.stitch.project(projectId);
    const screen = await this.withRetry(() => project.generate(prompt, deviceType));
    return this.screenToData(screen);
  }

  async edit(projectId: string, screenId: string, prompt: string, deviceType?: DeviceType): Promise<ScreenData> {
    const project = this.stitch.project(projectId);
    const screen = await this.withRetry(() => project.getScreen(screenId));
    const edited = await this.withRetry(() => screen.edit(prompt, deviceType));
    return this.screenToData(edited);
  }

  async variants(projectId: string, screenId: string, prompt: string, options: VariantOptions = {}): Promise<ScreenData[]> {
    const project = this.stitch.project(projectId);
    const screen = await this.withRetry(() => project.getScreen(screenId));
    const variantScreens = await this.withRetry(() => screen.variants(prompt, {
      variantCount: options.variantCount ?? 3,
      creativeRange: options.creativeRange ?? 'EXPLORE',
      aspects: options.aspects,
    }));
    return Promise.all(variantScreens.map(s => this.screenToData(s)));
  }

  async createProject(title: string): Promise<string> {
    // SDK uses callTool for project creation
    const client = this.stitch as any;
    if (client.callTool) {
      const result = await client.callTool('create_project', { title });
      return result?.projectId ?? title;
    }
    return title;
  }

  private async screenToData(screen: Screen): Promise<ScreenData> {
    const cacheKey = `${screen.projectId}:${screen.screenId}`;
    let html = this.htmlCache.get(cacheKey);
    if (!html) {
      const htmlUrl = await screen.getHtml();
      html = await this.fetchContent(htmlUrl);
      this.htmlCache.set(cacheKey, html);
    }
    const imageUrl = await screen.getImage().catch(() => undefined);
    return {
      screenId: screen.screenId,
      projectId: screen.projectId,
      html,
      imageUrl,
    };
  }

  private async fetchContent(url: string): Promise<string> {
    const res = await fetch(url);
    if (!res.ok) throw new StitchApiError(`Failed to fetch: ${url}`, res.status);
    return res.text();
  }

  private async withRetry<T>(fn: () => Promise<T>, attempt = 0): Promise<T> {
    try {
      return await fn();
    } catch (err: any) {
      const code = err?.code ?? '';
      if (RETRYABLE_CODES.has(code) && attempt < RETRY_DELAYS.length) {
        const delay = RETRY_DELAYS[attempt] + Math.random() * 500;
        logger.warn(`Retrying after ${Math.round(delay)}ms`, { code, attempt });
        await new Promise(r => setTimeout(r, delay));
        return this.withRetry(fn, attempt + 1);
      }
      throw new StitchApiError(err?.message ?? 'Stitch API error', err?.statusCode);
    }
  }
}
