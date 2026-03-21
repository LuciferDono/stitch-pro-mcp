type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVELS: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

class Logger {
  private level: number;

  constructor() {
    const envLevel = (process.env.STITCH_PRO_LOG_LEVEL || 'info') as LogLevel;
    this.level = LEVELS[envLevel] ?? LEVELS.info;
  }

  private log(level: LogLevel, message: string, data?: Record<string, unknown>) {
    if (LEVELS[level] < this.level) return;
    const entry = {
      ts: new Date().toISOString(),
      level,
      msg: message,
      ...data,
    };
    // MCP uses stdout for protocol messages — logs go to stderr
    process.stderr.write(JSON.stringify(entry) + '\n');
  }

  debug(msg: string, data?: Record<string, unknown>) { this.log('debug', msg, data); }
  info(msg: string, data?: Record<string, unknown>) { this.log('info', msg, data); }
  warn(msg: string, data?: Record<string, unknown>) { this.log('warn', msg, data); }
  error(msg: string, data?: Record<string, unknown>) { this.log('error', msg, data); }
}

export const logger = new Logger();
