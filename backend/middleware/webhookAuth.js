import crypto from 'crypto';

/**
 * Webhook Authentication Middleware
 *
 * Protects webhook endpoints from unauthorized access using:
 * 1. Webhook Secret validation (for ElevenLabs and other services)
 * 2. IP whitelist verification
 * 3. Timestamp validation to prevent replay attacks
 */

// ElevenLabs IP ranges (you should update this with actual ElevenLabs IPs)
const ELEVENLABS_IP_WHITELIST = [
  // Add ElevenLabs webhook IP addresses here
  // Example: '54.234.123.45', '52.11.22.33'
  // For development, you can allow all IPs by leaving this empty
];

/**
 * Verify webhook signature from ElevenLabs
 * ElevenLabs sends a signature header that we can verify
 */
export const verifyElevenLabsWebhook = (req, res, next) => {
  try {
    // Get webhook secret from environment
    const webhookSecret = process.env.ELEVENLABS_WEBHOOK_SECRET;

    // If no secret is configured, log warning but allow (for development)
    if (!webhookSecret) {
      console.warn('⚠️  ELEVENLABS_WEBHOOK_SECRET not configured - webhook is UNPROTECTED!');
      return next();
    }

    // Get signature from header (adjust header name based on ElevenLabs docs)
    const signature = req.headers['x-elevenlabs-signature'] || req.headers['x-webhook-signature'];

    if (!signature) {
      console.error('❌ Webhook rejected: No signature provided');
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing webhook signature'
      });
    }

    // Verify signature
    const payload = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('❌ Webhook rejected: Invalid signature');
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid webhook signature'
      });
    }

    console.log('✅ Webhook signature verified');
    next();
  } catch (error) {
    console.error('❌ Webhook verification error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to verify webhook'
    });
  }
};

/**
 * Verify webhook using simple bearer token
 * Use this if ElevenLabs doesn't support HMAC signatures
 */
export const verifyWebhookToken = (req, res, next) => {
  try {
    const webhookToken = process.env.WEBHOOK_SECRET_TOKEN;

    // If no token is configured, log warning but allow (for development)
    if (!webhookToken) {
      console.warn('⚠️  WEBHOOK_SECRET_TOKEN not configured - webhook is UNPROTECTED!');
      return next();
    }

    // Check for token in Authorization header or query parameter
    const authHeader = req.headers.authorization;
    const queryToken = req.query.token;

    let providedToken = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      providedToken = authHeader.substring(7);
    } else if (queryToken) {
      providedToken = queryToken;
    }

    if (!providedToken) {
      console.error('❌ Webhook rejected: No token provided');
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing webhook token'
      });
    }

    // Use timing-safe comparison to prevent timing attacks
    const expectedBuffer = Buffer.from(webhookToken);
    const providedBuffer = Buffer.from(providedToken);

    if (expectedBuffer.length !== providedBuffer.length ||
        !crypto.timingSafeEqual(expectedBuffer, providedBuffer)) {
      console.error('❌ Webhook rejected: Invalid token');
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid webhook token'
      });
    }

    console.log('✅ Webhook token verified');
    next();
  } catch (error) {
    console.error('❌ Webhook token verification error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to verify webhook token'
    });
  }
};

/**
 * Verify webhook timestamp to prevent replay attacks
 */
export const verifyWebhookTimestamp = (maxAgeSeconds = 300) => {
  return (req, res, next) => {
    try {
      const timestamp = req.headers['x-webhook-timestamp'] || req.body.timestamp;

      if (!timestamp) {
        // If no timestamp provided, skip this check (optional security layer)
        return next();
      }

      const requestTime = new Date(timestamp).getTime();
      const currentTime = Date.now();
      const age = (currentTime - requestTime) / 1000;

      if (age > maxAgeSeconds) {
        console.error(`❌ Webhook rejected: Timestamp too old (${age}s)`);
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Webhook timestamp expired'
        });
      }

      if (age < -60) {
        console.error(`❌ Webhook rejected: Timestamp in future (${age}s)`);
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid webhook timestamp'
        });
      }

      next();
    } catch (error) {
      console.error('❌ Webhook timestamp verification error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to verify webhook timestamp'
      });
    }
  };
};

/**
 * Verify webhook source IP
 */
export const verifyWebhookIP = (allowedIPs = ELEVENLABS_IP_WHITELIST) => {
  return (req, res, next) => {
    try {
      // Skip IP check if whitelist is empty (development mode)
      if (!allowedIPs || allowedIPs.length === 0) {
        console.warn('⚠️  IP whitelist is empty - accepting webhooks from all IPs');
        return next();
      }

      // Get client IP (accounting for proxies)
      const clientIP = req.headers['x-forwarded-for']?.split(',')[0].trim() ||
                       req.headers['x-real-ip'] ||
                       req.connection.remoteAddress ||
                       req.socket.remoteAddress;

      if (!allowedIPs.includes(clientIP)) {
        console.error(`❌ Webhook rejected: IP ${clientIP} not in whitelist`);
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Webhook source IP not authorized'
        });
      }

      console.log(`✅ Webhook IP verified: ${clientIP}`);
      next();
    } catch (error) {
      console.error('❌ Webhook IP verification error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to verify webhook IP'
      });
    }
  };
};

/**
 * Rate limiting for webhook endpoints
 */
export const webhookRateLimit = (maxRequests = 100, windowMs = 60000) => {
  const requests = new Map();

  return (req, res, next) => {
    const key = req.headers['x-forwarded-for']?.split(',')[0].trim() ||
                req.connection.remoteAddress ||
                'unknown';

    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean up old entries
    if (requests.has(key)) {
      const timestamps = requests.get(key).filter(t => t > windowStart);
      requests.set(key, timestamps);
    }

    // Get current count
    const count = requests.get(key)?.length || 0;

    if (count >= maxRequests) {
      console.error(`❌ Webhook rate limit exceeded for ${key}: ${count} requests`);
      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'Webhook rate limit exceeded'
      });
    }

    // Add new request
    const timestamps = requests.get(key) || [];
    timestamps.push(now);
    requests.set(key, timestamps);

    next();
  };
};
