import { pino } from 'pino';
import { EnvironmentConfig } from '../config/env.validation';

// Create Pino logger instance with configuration based on environment
export function createLogger(config: EnvironmentConfig) {
  const isDevelopment = config.NODE_ENV === 'development';
  const isTest = config.NODE_ENV === 'test';

  if (isDevelopment) {
    return pino({
      level: isTest ? 'silent' : (process.env.LOG_LEVEL || 'debug'),
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l',
          ignore: 'pid,hostname',
        },
      },
    });
  }

  return pino({
    level: isTest ? 'silent' : (process.env.LOG_LEVEL || 'info'),
    formatters: {
      level: (label) => {
        return { level: label };
      },
    },
    timestamp: () => `,"time":"${new Date().toISOString()}"`,
    base: {
      env: config.NODE_ENV,
    },
  });
}

// Global logger instance
// Do not bootstrap a global logger from process.env directly; use DI-provided logger instead.
export const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

// Request ID generator for tracing
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
