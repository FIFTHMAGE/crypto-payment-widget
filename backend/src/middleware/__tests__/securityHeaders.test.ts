import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type NextFunction, type Request, type Response } from 'express';

import { securityHeaders } from '../securityHeaders';

describe('Security Headers Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      setHeader: vi.fn(),
      removeHeader: vi.fn(),
    };
    mockNext = vi.fn();
    vi.clearAllMocks();
  });

  it('should call next', () => {
    securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  describe('X-Content-Type-Options', () => {
    it('should set X-Content-Type-Options header', () => {
      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'X-Content-Type-Options',
        'nosniff'
      );
    });
  });

  describe('X-Frame-Options', () => {
    it('should set X-Frame-Options header', () => {
      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'X-Frame-Options',
        expect.stringMatching(/DENY|SAMEORIGIN/)
      );
    });
  });

  describe('X-XSS-Protection', () => {
    it('should set X-XSS-Protection header', () => {
      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'X-XSS-Protection',
        '1; mode=block'
      );
    });
  });

  describe('Strict-Transport-Security', () => {
    it('should set HSTS header', () => {
      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Strict-Transport-Security',
        expect.stringContaining('max-age')
      );
    });

    it('should include includeSubDomains', () => {
      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

      const setHeaderCalls = (mockResponse.setHeader as ReturnType<typeof vi.fn>).mock.calls;
      const hstsCall = setHeaderCalls.find((call) => call[0] === 'Strict-Transport-Security');

      expect(hstsCall?.[1]).toContain('includeSubDomains');
    });
  });

  describe('Content-Security-Policy', () => {
    it('should set CSP header', () => {
      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Security-Policy',
        expect.any(String)
      );
    });

    it('should include default-src directive', () => {
      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

      const setHeaderCalls = (mockResponse.setHeader as ReturnType<typeof vi.fn>).mock.calls;
      const cspCall = setHeaderCalls.find((call) => call[0] === 'Content-Security-Policy');

      expect(cspCall?.[1]).toContain("default-src");
    });
  });

  describe('Referrer-Policy', () => {
    it('should set Referrer-Policy header', () => {
      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Referrer-Policy',
        expect.stringMatching(/no-referrer|strict-origin|same-origin|strict-origin-when-cross-origin/)
      );
    });
  });

  describe('X-DNS-Prefetch-Control', () => {
    it('should set X-DNS-Prefetch-Control header', () => {
      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'X-DNS-Prefetch-Control',
        expect.stringMatching(/off|on/)
      );
    });
  });

  describe('Permissions-Policy', () => {
    it('should set Permissions-Policy header', () => {
      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Permissions-Policy',
        expect.any(String)
      );
    });
  });

  describe('X-Permitted-Cross-Domain-Policies', () => {
    it('should set X-Permitted-Cross-Domain-Policies header', () => {
      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'X-Permitted-Cross-Domain-Policies',
        'none'
      );
    });
  });

  describe('removeHeader', () => {
    it('should remove X-Powered-By header', () => {
      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.removeHeader).toHaveBeenCalledWith('X-Powered-By');
    });
  });
});

