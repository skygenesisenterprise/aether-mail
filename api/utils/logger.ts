enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

function log(level: LogLevel, message: string, meta?: unknown) {
  const now = new Date().toISOString();
  const tag = `[${level}]`;
  let out = `${now} ${tag} ${message}`;
  if (meta) {
    out += ` | ${JSON.stringify(meta)}`;
  }
  switch (level) {
    case LogLevel.WARN:
      return console.warn(`\x1b[33m${out}\x1b[0m`); // Yellow
    case LogLevel.ERROR:
      return console.error(`\x1b[31m${out}\x1b[0m`); // Red
    default:
      return console.log(out);
  }
}

export const logger = {
  info: (message: string, meta?: unknown) => log(LogLevel.INFO, message, meta),
  warn: (message: string, meta?: unknown) => log(LogLevel.WARN, message, meta),
  error: (message: string, meta?: unknown) => log(LogLevel.ERROR, message, meta),
};
