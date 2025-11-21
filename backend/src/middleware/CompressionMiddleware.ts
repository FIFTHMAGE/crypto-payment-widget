/**
 * Compression Middleware
 * Handles response compression for API endpoints
 */

import compression from 'compression';
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export class CompressionMiddleware {
  /**
   * Apply compression middleware with custom options
   */
  public static compress(options: compression.CompressionOptions = {}) {
    const defaultOptions: compression.CompressionOptions = {
      // Compression level (0-9)
      level: 6,

      // Minimum response size to compress (in bytes)
      threshold: 1024, // 1KB

      // Filter function to determine what to compress
      filter: (req: Request, res: Response) => {
        // Don't compress if client doesn't accept encoding
        if (req.headers['x-no-compression']) {
          return false;
        }

        // Use compression default filter
        return compression.filter(req, res);
      },

      ...options,
    };

    return compression(defaultOptions);
  }

  /**
   * Aggressive compression for specific endpoints
   */
  public static aggressiveCompress() {
    return compression({
      level: 9, // Maximum compression
      threshold: 512, // Compress smaller responses
    });
  }

  /**
   * Fast compression for real-time endpoints
   */
  public static fastCompress() {
    return compression({
      level: 1, // Minimal compression for speed
      threshold: 2048, // Only compress larger responses
    });
  }

  /**
   * Custom compression for JSON responses
   */
  public static jsonCompress() {
    return compression({
      level: 6,
      threshold: 1024,
      filter: (req: Request, res: Response) => {
        const contentType = res.getHeader('Content-Type');
        return typeof contentType === 'string' && contentType.includes('application/json');
      },
    });
  }

  /**
   * Middleware to add compression headers
   */
  public static addCompressionHeaders() {
    return (req: Request, res: Response, next: NextFunction) => {
      // Inform client about compression capabilities
      res.setHeader('Vary', 'Accept-Encoding');

      next();
    };
  }

  /**
   * Middleware to log compression statistics
   */
  public static logCompressionStats() {
    return (req: Request, res: Response, next: NextFunction) => {
      const originalWrite = res.write;
      const originalEnd = res.end;
      let originalSize = 0;
      let compressedSize = 0;

      // Override write to track sizes
      res.write = function (chunk: any, ...args: any[]): boolean {
        if (chunk) {
          originalSize += Buffer.byteLength(chunk);
        }
        return originalWrite.apply(res, [chunk, ...args]);
      };

      // Override end to track sizes and log
      res.end = function (chunk: any, ...args: any[]): Response {
        if (chunk) {
          originalSize += Buffer.byteLength(chunk);
        }

        const encoding = res.getHeader('Content-Encoding');
        if (encoding && encoding !== 'identity') {
          compressedSize = parseInt(res.getHeader('Content-Length') as string) || 0;

          if (originalSize > 0) {
            const ratio = ((originalSize - compressedSize) / originalSize) * 100;
            logger.debug(`Compression: ${originalSize}B -> ${compressedSize}B (${ratio.toFixed(2)}% reduction)`);
          }
        }

        return originalEnd.apply(res, [chunk, ...args]) as Response;
      };

      next();
    };
  }
}

