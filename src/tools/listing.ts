import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { StitchClient } from '../stitch/client.js';
import { ListProjectsInput, ListScreensInput, GetScreenInput } from '../types/tools.js';

export function registerListingTools(server: McpServer, client: StitchClient) {
  server.registerTool(
    'stitch_pro_list_projects',
    {
      title: 'List Stitch Projects',
      description: 'List all projects in your Stitch account',
      inputSchema: ListProjectsInput.shape,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    },
    async () => {
      const projects = await client.listProjects();
      return {
        content: [{ type: 'text', text: JSON.stringify(projects, null, 2) }],
      };
    },
  );

  server.registerTool(
    'stitch_pro_list_screens',
    {
      title: 'List Screens in Project',
      description: 'List all screens in a Stitch project',
      inputSchema: ListScreensInput.shape,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    },
    async ({ projectId }) => {
      const screens = await client.listScreens(projectId);
      const summary = screens.map(s => ({
        screenId: s.screenId,
        projectId: s.projectId,
        hasHtml: !!s.html,
        hasImage: !!s.imageUrl,
      }));
      return {
        content: [{ type: 'text', text: JSON.stringify(summary, null, 2) }],
      };
    },
  );

  server.registerTool(
    'stitch_pro_get_screen',
    {
      title: 'Get Screen Details',
      description: 'Get a specific screen with its HTML source and image URL',
      inputSchema: GetScreenInput.shape,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    },
    async ({ projectId, screenId, includeHtml }) => {
      const screen = await client.getScreen(projectId, screenId);
      const result: Record<string, unknown> = {
        screenId: screen.screenId,
        projectId: screen.projectId,
        imageUrl: screen.imageUrl,
      };
      if (includeHtml) {
        result.html = screen.html;
      }
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    },
  );
}
