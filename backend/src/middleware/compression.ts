import { type NextFunction, type Request, type Response } from 'express';
import { promisify } from 'util';
import zlib from 'zlib';

const gzipAsync = promisify(zlib.gzip);
const brotliCompressAsync = promisify(zlib.brotliCompress);

export interface CompressionOptions {
  threshold?: number;
  level?: number;
  brotli?: boolean;
}

type JsonSendFunction = (data: unknown) => Response;

/**
 * Custom compression middleware for JSON responses
 */
export const compressionMiddleware = (options: CompressionOptions = {}) => {
  const { threshold = 1024, level = 6, brotli = true } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const originalJson = res.json.bind(res) as JsonSendFunction;

    res.json = function (data: unknown): Response {
      const acceptEncoding = req.headers['accept-encoding'] || '';
      const jsonString = JSON.stringify(data);

      // Skip compression for small responses
      if (jsonString.length < threshold) {
        return originalJson(data);
      }

      // Check for Brotli support (preferred)
      if (brotli && acceptEncoding.includes('br')) {
        brotliCompressAsync(Buffer.from(jsonString), {
          params: {
            [zlib.constants.BROTLI_PARAM_QUALITY]: level,
          },
        })
          .then((compressed) => {
            res.setHeader('Content-Encoding', 'br');
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Vary', 'Accept-Encoding');
            res.send(compressed);
          })
          .catch(() => {
            // Fallback to uncompressed
            originalJson(data);
          });
        return res;
      }

      // Check for gzip support
      if (acceptEncoding.includes('gzip')) {
        gzipAsync(Buffer.from(jsonString), { level })
          .then((compressed) => {
            res.setHeader('Content-Encoding', 'gzip');
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Vary', 'Accept-Encoding');
            res.send(compressed);
          })
          .catch(() => {
            // Fallback to uncompressed
            originalJson(data);
          });
        return res;
      }

      // No compression support
      return originalJson(data);
    };

    next();
  };
};

/**
 * Get compression stats for monitoring
 */
export const getCompressionStats = (
  originalSize: number,
  compressedSize: number
): {
  originalSize: number;
  compressedSize: number;
  ratio: number;
  savedBytes: number;
  savedPercent: number;
} => {
  const savedBytes = originalSize - compressedSize;
  const savedPercent = (savedBytes / originalSize) * 100;
  const ratio = originalSize / compressedSize;

  return {
    originalSize,
    compressedSize,
    ratio: Math.round(ratio * 100) / 100,
    savedBytes,
    savedPercent: Math.round(savedPercent * 100) / 100,
  };
};

export default compressionMiddleware;

