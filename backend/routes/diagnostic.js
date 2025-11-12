import express from 'express';

const router = express.Router();

// Diagnostic endpoint to check environment variables in production
router.get('/env-check', (req, res) => {
  const envVars = {
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT,

    // Database
    mongodbConfigured: !!process.env.MONGODB_URI,
    redisConfigured: !!process.env.REDIS_URI,

    // Stripe
    stripeSecretKey: process.env.STRIPE_SECRET_KEY ? `${process.env.STRIPE_SECRET_KEY.substring(0, 12)}...` : 'MISSING',
    stripeStarterPrice: process.env.STRIPE_STARTER_PRICE_ID ? `${process.env.STRIPE_STARTER_PRICE_ID.substring(0, 15)}...` : 'MISSING',
    stripeProfessionalPrice: process.env.STRIPE_PROFESSIONAL_PRICE_ID ? `${process.env.STRIPE_PROFESSIONAL_PRICE_ID.substring(0, 15)}...` : 'MISSING',
    stripeEnterprisePrice: process.env.STRIPE_ENTERPRISE_PRICE_ID ? `${process.env.STRIPE_ENTERPRISE_PRICE_ID.substring(0, 15)}...` : 'MISSING',

    // AI Providers
    openaiKey: process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.substring(0, 12)}...` : 'MISSING',
    anthropicKey: process.env.ANTHROPIC_API_KEY ? `${process.env.ANTHROPIC_API_KEY.substring(0, 12)}...` : 'MISSING',
    googleAiKey: process.env.GOOGLE_AI_API_KEY ? `${process.env.GOOGLE_AI_API_KEY.substring(0, 12)}...` : 'MISSING',

    // ElevenLabs
    elevenlabsKey: process.env.ELEVENLABS_API_KEY ? `${process.env.ELEVENLABS_API_KEY.substring(0, 12)}...` : 'MISSING',
    elevenlabsPhoneId: process.env.ELEVENLABS_PHONE_NUMBER_ID || 'MISSING',

    // Email
    smtpUser: process.env.SMTP_USER ? `${process.env.SMTP_USER.substring(0, 10)}...` : 'MISSING',
    smtpPassword: process.env.SMTP_PASSWORD ? '***SET***' : 'MISSING',

    // Auth
    jwtSecret: process.env.JWT_SECRET ? '***SET***' : 'MISSING',

    // URLs
    clientUrl: process.env.CLIENT_URL || 'MISSING',
    apiUrl: process.env.API_URL || 'MISSING',
  };

  res.json({
    timestamp: new Date().toISOString(),
    environment: envVars,
    summary: {
      total: Object.keys(envVars).length,
      configured: Object.values(envVars).filter(v => v !== 'MISSING' && v !== false).length,
      missing: Object.values(envVars).filter(v => v === 'MISSING' || v === false).length,
    }
  });
});

export default router;
