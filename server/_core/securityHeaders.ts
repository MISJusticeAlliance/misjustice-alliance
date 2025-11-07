import helmet from 'helmet';
import { Express } from 'express';

/**
 * Configure security headers using Helmet
 */
export const configureSecurityHeaders = (app: Express) => {
  // Helmet helps secure Express apps by setting various HTTP headers
  app.use(helmet({
    // Content Security Policy
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://cdn.jsdelivr.net'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://cdn.jsdelivr.net'],
        imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'https://cdn.jsdelivr.net'],
        connectSrc: ["'self'", 'https:', 'wss:'],
        frameSrc: ["'self'", 'https://maps.google.com', 'https://www.google.com'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        childSrc: ["'self'"],
      },
    },
    // Disable X-Powered-By header
    hidePoweredBy: true,
    // Prevent browsers from MIME-sniffing
    noSniff: true,
    // Enable XSS protection
    xssFilter: true,
    // Prevent clickjacking attacks
    frameguard: {
      action: 'deny',
    },
    // Referrer policy
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin',
    },

  }));

  // Additional security headers
  app.use((req, res, next) => {
    // Strict Transport Security
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    
    // X-Content-Type-Options
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // X-Frame-Options
    res.setHeader('X-Frame-Options', 'DENY');
    
    // X-XSS-Protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Referrer-Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Permissions-Policy
    res.setHeader('Permissions-Policy', 'geolocation=(self), microphone=(), camera=(), payment=(self)');
    
    // Remove server identification
    res.removeHeader('Server');
    
    next();
  });
};

/**
 * CORS configuration for security
 */
export const corsConfig = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://misjusticealliance.org', 'https://www.misjusticealliance.org']
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  exposedHeaders: ['X-CSRF-Token', 'RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset'],
  maxAge: 86400, // 24 hours
};

/**
 * Security headers for API responses
 */
export const apiSecurityHeaders = (req: any, res: any, next: any) => {
  // Disable caching for sensitive endpoints
  if (req.path.includes('/api/') && !req.path.includes('/public/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  next();
};
