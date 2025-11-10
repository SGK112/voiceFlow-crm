import { verifyApiKey } from '../controllers/apiKeyController.js';
import User from '../models/User.js';

/**
 * Middleware to authenticate requests using API keys
 * Supports both JWT tokens and API keys
 */
export const apiKeyAuth = async (req, res, next) => {
  try {
    // Check for API key in Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: 'No authorization header provided' });
    }

    // Support both formats:
    // Bearer rwcrm_live_xxx (API key)
    // Bearer eyJhbGc... (JWT token)
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Check if it's an API key (starts with rwcrm_)
    if (token.startsWith('rwcrm_')) {
      const verification = await verifyApiKey(token);

      if (!verification.valid) {
        return res.status(401).json({ message: verification.error || 'Invalid API key' });
      }

      // Attach user info to request
      req.user = { _id: verification.userId };
      req.apiKey = {
        scopes: verification.scopes,
        environment: verification.environment
      };

      return next();
    }

    // If not an API key, fall back to JWT validation
    // (handled by the existing protect middleware)
    return res.status(401).json({
      message: 'Invalid token format. Use either a valid JWT or API key starting with rwcrm_'
    });
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed', error: error.message });
  }
};

/**
 * Middleware to check if API key has required scope
 */
export const requireScope = (requiredScope) => {
  return (req, res, next) => {
    // If using JWT (not API key), skip scope check
    if (!req.apiKey) {
      return next();
    }

    const { scopes } = req.apiKey;

    // 'all' scope grants access to everything
    if (scopes.includes('all')) {
      return next();
    }

    // Check if required scope is present
    if (!scopes.includes(requiredScope)) {
      return res.status(403).json({
        message: `This API key does not have the required '${requiredScope}' permission`
      });
    }

    next();
  };
};

/**
 * Combined auth middleware - accepts both JWT and API keys
 */
export const protectWithApiKey = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'No authorization provided' });
  }

  const token = authHeader.split(' ')[1];

  // Check if it's an API key
  if (token && token.startsWith('rwcrm_')) {
    return apiKeyAuth(req, res, next);
  }

  // Otherwise use regular JWT protection
  // Import the protect middleware
  const { protect } = await import('./auth.js');
  return protect(req, res, next);
};
