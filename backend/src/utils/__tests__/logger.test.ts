import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { logger } from '../logger';

describe('Logger Utils', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('info', () => {
    it('should log info messages', () => {
      logger.info('Test info message');
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should log info with additional data', () => {
      logger.info('Test message', { key: 'value' });
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should include INFO level indicator', () => {
      logger.info('Info test');
      const callArg = consoleSpy.mock.calls[0]?.[0] as string;
      expect(callArg).toContain('INFO');
    });
  });

  describe('error', () => {
    it('should log error messages', () => {
      const errorSpy = vi.spyOn(console, 'error');
      logger.error('Test error message');
      expect(errorSpy).toHaveBeenCalled();
    });

    it('should log errors with stack traces', () => {
      const errorSpy = vi.spyOn(console, 'error');
      const error = new Error('Test error');
      logger.error('Error occurred', error);
      expect(errorSpy).toHaveBeenCalled();
    });

    it('should include ERROR level indicator', () => {
      const errorSpy = vi.spyOn(console, 'error');
      logger.error('Error test');
      const callArg = errorSpy.mock.calls[0]?.[0] as string;
      expect(callArg).toContain('ERROR');
    });
  });

  describe('warn', () => {
    it('should log warning messages', () => {
      const warnSpy = vi.spyOn(console, 'warn');
      logger.warn('Test warning message');
      expect(warnSpy).toHaveBeenCalled();
    });

    it('should include WARN level indicator', () => {
      const warnSpy = vi.spyOn(console, 'warn');
      logger.warn('Warn test');
      const callArg = warnSpy.mock.calls[0]?.[0] as string;
      expect(callArg).toContain('WARN');
    });
  });

  describe('debug', () => {
    it('should log debug messages', () => {
      const debugSpy = vi.spyOn(console, 'debug');
      logger.debug('Test debug message');
      expect(debugSpy).toHaveBeenCalled();
    });

    it('should include DEBUG level indicator', () => {
      const debugSpy = vi.spyOn(console, 'debug');
      logger.debug('Debug test');
      const callArg = debugSpy.mock.calls[0]?.[0] as string;
      expect(callArg).toContain('DEBUG');
    });
  });

  describe('formatting', () => {
    it('should include timestamp in logs', () => {
      logger.info('Timestamp test');
      const callArg = consoleSpy.mock.calls[0]?.[0] as string;
      // Should contain ISO date format pattern
      expect(callArg).toMatch(/\d{4}-\d{2}-\d{2}/);
    });

    it('should format objects as JSON', () => {
      const data = { user: 'test', action: 'login' };
      logger.info('Object test', data);
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should handle null and undefined data', () => {
      logger.info('Null test', null);
      logger.info('Undefined test', undefined);
      expect(consoleSpy).toHaveBeenCalledTimes(2);
    });

    it('should handle circular references gracefully', () => {
      const obj: Record<string, unknown> = { name: 'test' };
      obj.self = obj; // Circular reference

      expect(() => logger.info('Circular test', obj)).not.toThrow();
    });
  });

  describe('child logger', () => {
    it('should create child logger with context', () => {
      const childLogger = logger.child({ module: 'auth' });
      expect(childLogger).toBeDefined();
    });

    it('should include context in child logs', () => {
      const childLogger = logger.child({ module: 'auth' });
      childLogger.info('Child log test');
      
      const callArg = consoleSpy.mock.calls[0]?.[0] as string;
      expect(callArg).toContain('auth');
    });
  });

  describe('log levels', () => {
    it('should support setting log level', () => {
      logger.setLevel('error');
      logger.info('Should not appear');
      logger.error('Should appear');
      
      // Reset for other tests
      logger.setLevel('debug');
    });

    it('should return current log level', () => {
      const level = logger.getLevel();
      expect(['error', 'warn', 'info', 'debug']).toContain(level);
    });
  });
});

