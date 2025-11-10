import User from '../models/User.js';
import crypto from 'crypto';

/**
 * Generate a secure API key
 * Format: rwcrm_live_xxxxxxxxxxxxx or rwcrm_test_xxxxxxxxxxxxx
 */
const generateApiKey = (environment = 'production') => {
  const randomBytes = crypto.randomBytes(32).toString('hex');
  const prefix = environment === 'production' ? 'rwcrm_live' : 'rwcrm_test';
  const key = `${prefix}_${randomBytes}`;
  return {
    key,
    prefix: key.substring(0, 20) // First 20 chars for display (rwcrm_live_xxxxx...)
  };
};

/**
 * Get all API keys for the authenticated user
 * @route GET /api/api-keys
 */
export const getApiKeys = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('userApiKeys');

    // Don't send full keys, only prefixes
    const sanitizedKeys = user.userApiKeys.map(key => ({
      _id: key._id,
      name: key.name,
      prefix: key.prefix,
      scopes: key.scopes,
      environment: key.environment,
      lastUsedAt: key.lastUsedAt,
      expiresAt: key.expiresAt,
      createdAt: key.createdAt
    }));

    res.json(sanitizedKeys);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Create a new API key
 * @route POST /api/api-keys
 */
export const createApiKey = async (req, res) => {
  try {
    const { name, scopes, environment, expiresInDays } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'API key name is required' });
    }

    if (!scopes || scopes.length === 0) {
      return res.status(400).json({ message: 'At least one scope is required' });
    }

    const user = await User.findById(req.user._id);

    // Check plan limits
    const planLimits = {
      trial: 1,
      starter: 2,
      professional: 10,
      enterprise: Infinity
    };

    const maxKeys = planLimits[user.plan] || 1;
    if (user.userApiKeys.length >= maxKeys) {
      return res.status(403).json({
        message: `Your ${user.plan} plan allows up to ${maxKeys} API key(s). Upgrade to create more.`
      });
    }

    // Generate key
    const { key, prefix } = generateApiKey(environment || 'production');

    // Calculate expiration
    let expiresAt = null;
    if (expiresInDays && expiresInDays > 0) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    }

    // Hash the key for storage
    const hashedKey = crypto.createHash('sha256').update(key).digest('hex');

    // Add to user
    user.userApiKeys.push({
      name,
      key: hashedKey,
      prefix,
      scopes,
      environment: environment || 'production',
      expiresAt
    });

    await user.save();

    // Return the key ONLY this one time
    res.status(201).json({
      message: 'API key created successfully',
      key: key, // Full key - user must save this
      apiKey: {
        _id: user.userApiKeys[user.userApiKeys.length - 1]._id,
        name,
        prefix,
        scopes,
        environment: environment || 'production',
        expiresAt,
        createdAt: user.userApiKeys[user.userApiKeys.length - 1].createdAt
      },
      warning: 'Save this key securely. You will not be able to see it again.'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update an API key (name, scopes only - cannot change the key itself)
 * @route PUT /api/api-keys/:keyId
 */
export const updateApiKey = async (req, res) => {
  try {
    const { keyId } = req.params;
    const { name, scopes } = req.body;

    const user = await User.findById(req.user._id);
    const apiKey = user.userApiKeys.id(keyId);

    if (!apiKey) {
      return res.status(404).json({ message: 'API key not found' });
    }

    if (name) apiKey.name = name;
    if (scopes) apiKey.scopes = scopes;

    await user.save();

    res.json({
      message: 'API key updated successfully',
      apiKey: {
        _id: apiKey._id,
        name: apiKey.name,
        prefix: apiKey.prefix,
        scopes: apiKey.scopes,
        environment: apiKey.environment,
        lastUsedAt: apiKey.lastUsedAt,
        expiresAt: apiKey.expiresAt,
        createdAt: apiKey.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Delete an API key
 * @route DELETE /api/api-keys/:keyId
 */
export const deleteApiKey = async (req, res) => {
  try {
    const { keyId } = req.params;

    const user = await User.findById(req.user._id);

    // Use pull to remove the subdocument
    user.userApiKeys.pull(keyId);
    await user.save();

    res.json({ message: 'API key deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Verify an API key (for external API calls)
 * This is used by the API key middleware
 */
export const verifyApiKey = async (apiKey) => {
  try {
    // Hash the provided key
    const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');

    // Find user with this key
    const user = await User.findOne({
      'userApiKeys.key': hashedKey
    }).select('+userApiKeys.key');

    if (!user) {
      return { valid: false, error: 'Invalid API key' };
    }

    // Find the specific key
    const keyObj = user.userApiKeys.find(k => k.key === hashedKey);

    if (!keyObj) {
      return { valid: false, error: 'Invalid API key' };
    }

    // Check if expired
    if (keyObj.expiresAt && keyObj.expiresAt < new Date()) {
      return { valid: false, error: 'API key has expired' };
    }

    // Update last used
    keyObj.lastUsedAt = new Date();
    await user.save();

    return {
      valid: true,
      userId: user._id,
      scopes: keyObj.scopes,
      environment: keyObj.environment
    };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};
