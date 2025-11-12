import rateLimit from 'express-rate-limit';

// Disable rate limiting in development for easier testing
const isDevelopment = process.env.NODE_ENV === 'development';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDevelopment ? 1000 : 100, // Much higher limit in dev
  message: 'Too many requests from this IP, please try again later.',
  skip: () => isDevelopment // Skip rate limiting entirely in development
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDevelopment ? 1000 : 5, // Much higher limit in dev
  message: 'Too many authentication attempts, please try again later.',
  skip: () => isDevelopment // Skip rate limiting entirely in development
});

export const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: isDevelopment ? 10000 : 200, // Much higher limit in dev
  message: 'Webhook rate limit exceeded',
  skip: () => isDevelopment // Skip rate limiting entirely in development
});
