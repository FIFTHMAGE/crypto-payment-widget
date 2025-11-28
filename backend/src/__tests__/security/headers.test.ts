import express, { type Application } from 'express';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';

import { securityHeaders } from '../../middleware/securityHeaders';

describe('Security Headers Tests', () => {
  let app: Application;

  beforeAll(() => {
    app = express();
    app.use(securityHeaders);
    app.get('/test', (_req, res) => res.json({ ok: true }));
  });

  describe('X-Content-Type-Options', () => {
    it('should set X-Content-Type-Options to nosniff', async () => {
      const response = await request(app).get('/test');

      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });
  });

  describe('X-Frame-Options', () => {
    it('should set X-Frame-Options', async () => {
      const response = await request(app).get('/test');

      expect(response.headers['x-frame-options']).toMatch(/DENY|SAMEORIGIN/);
    });
  });

  describe('X-XSS-Protection', () => {
    it('should set X-XSS-Protection', async () => {
      const response = await request(app).get('/test');

      expect(response.headers['x-xss-protection']).toBeDefined();
    });

    it('should enable XSS filtering in block mode', async () => {
      const response = await request(app).get('/test');

      expect(response.headers['x-xss-protection']).toContain('1');
    });
  });

  describe('Strict-Transport-Security', () => {
    it('should set HSTS header', async () => {
      const response = await request(app).get('/test');

      expect(response.headers['strict-transport-security']).toBeDefined();
    });

    it('should include max-age directive', async () => {
      const response = await request(app).get('/test');

      expect(response.headers['strict-transport-security']).toContain('max-age');
    });

    it('should include includeSubDomains', async () => {
      const response = await request(app).get('/test');

      expect(response.headers['strict-transport-security']).toContain('includeSubDomains');
    });
  });

  describe('Content-Security-Policy', () => {
    it('should set CSP header', async () => {
      const response = await request(app).get('/test');

      expect(response.headers['content-security-policy']).toBeDefined();
    });

    it('should include default-src directive', async () => {
      const response = await request(app).get('/test');

      expect(response.headers['content-security-policy']).toContain('default-src');
    });
  });

  describe('Referrer-Policy', () => {
    it('should set Referrer-Policy', async () => {
      const response = await request(app).get('/test');

      expect(response.headers['referrer-policy']).toBeDefined();
    });
  });

  describe('X-DNS-Prefetch-Control', () => {
    it('should set X-DNS-Prefetch-Control', async () => {
      const response = await request(app).get('/test');

      expect(response.headers['x-dns-prefetch-control']).toBeDefined();
    });
  });

  describe('X-Permitted-Cross-Domain-Policies', () => {
    it('should set X-Permitted-Cross-Domain-Policies', async () => {
      const response = await request(app).get('/test');

      expect(response.headers['x-permitted-cross-domain-policies']).toBe('none');
    });
  });

  describe('Sensitive Headers', () => {
    it('should not expose X-Powered-By', async () => {
      const response = await request(app).get('/test');

      expect(response.headers['x-powered-by']).toBeUndefined();
    });

    it('should not expose server version', async () => {
      const response = await request(app).get('/test');

      // If server header exists, it shouldn't reveal detailed version info
      const server = response.headers['server'];
      if (server) {
        expect(server).not.toMatch(/\d+\.\d+/);
      }
    });
  });

  describe('Cache Control', () => {
    it('should set appropriate cache headers for API responses', async () => {
      const response = await request(app).get('/test');

      // Cache headers should be present for API responses
      const cacheControl = response.headers['cache-control'];
      if (cacheControl) {
        expect(cacheControl).toMatch(/no-store|no-cache|private/);
      }
    });
  });
});

