#!/usr/bin/env node
import { main } from '../src/index.js';

main().catch((err) => {
  console.error('stitch-pro-mcp-server failed to start:', err.message);
  process.exit(1);
});
