/**
 * Subscription Gate Middleware
 * Enforces paywall by checking user's subscription tier
 */

const TIER_HIERARCHY = ['free', 'starter', 'pro', 'enterprise'];

/**
 * Require minimum subscription tier
 * @param {string} minTier - Minimum required tier ('starter', 'pro', or 'enterprise')
 * @returns {Function} Express middleware
 */
export const requirePlan = (minTier) => {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    // Get user's current tier (default to 'free')
    const userTier = user.subscription?.tier || 'free';

    // Check if user's tier meets minimum requirement
    const userTierIndex = TIER_HIERARCHY.indexOf(userTier);
    const requiredTierIndex = TIER_HIERARCHY.indexOf(minTier);

    if (userTierIndex === -1 || requiredTierIndex === -1) {
      return res.status(500).json({
        error: 'Invalid tier configuration',
        message: 'Please contact support'
      });
    }

    // User's tier is below required tier
    if (userTierIndex < requiredTierIndex) {
      return res.status(403).json({
        error: 'Upgrade required',
        message: `This feature requires a ${minTier} plan or higher`,
        currentPlan: userTier,
        requiredPlan: minTier,
        upgradeUrl: `${process.env.CLIENT_URL}/app/settings?tab=billing`
      });
    }

    // User has required tier or higher
    next();
  };
};

/**
 * Check if user has reached limit for a resource
 * @param {string} resource - Resource type ('agents', 'phone_numbers', 'workflows', etc.)
 * @param {number} currentCount - Current count of resource
 * @returns {boolean} true if within limit, false if at/over limit
 */
export const checkResourceLimit = (user, resource, currentCount) => {
  const tier = user.subscription?.tier || 'free';

  const limits = {
    free: {
      agents: 0,
      phone_numbers: 0,
      workflows: 0,
      leads: 50,
      team_members: 1,
      ai_minutes_monthly: 0
    },
    starter: {
      agents: 2,
      phone_numbers: 1,
      workflows: 5,
      leads: 500,
      team_members: 3,
      ai_minutes_monthly: 500
    },
    pro: {
      agents: 10,
      phone_numbers: 5,
      workflows: 25,
      leads: 5000,
      team_members: 10,
      ai_minutes_monthly: 2000
    },
    enterprise: {
      agents: 999,
      phone_numbers: 999,
      workflows: 999,
      leads: 999999,
      team_members: 999,
      ai_minutes_monthly: 10000
    }
  };

  const limit = limits[tier][resource];

  if (limit === undefined) {
    throw new Error(`Unknown resource type: ${resource}`);
  }

  return currentCount < limit;
};

/**
 * Get resource limit for user's tier
 * @param {string} tier - User's subscription tier
 * @param {string} resource - Resource type
 * @returns {number} Limit for that resource
 */
export const getResourceLimit = (tier, resource) => {
  const limits = {
    free: {
      agents: 0,
      phone_numbers: 0,
      workflows: 0,
      leads: 50,
      team_members: 1,
      ai_minutes_monthly: 0
    },
    starter: {
      agents: 2,
      phone_numbers: 1,
      workflows: 5,
      leads: 500,
      team_members: 3,
      ai_minutes_monthly: 500
    },
    pro: {
      agents: 10,
      phone_numbers: 5,
      workflows: 25,
      leads: 5000,
      team_members: 10,
      ai_minutes_monthly: 2000
    },
    enterprise: {
      agents: 999,
      phone_numbers: 999,
      workflows: 999,
      leads: 999999,
      team_members: 999,
      ai_minutes_monthly: 10000
    }
  };

  return limits[tier || 'free'][resource] || 0;
};

export default {
  requirePlan,
  checkResourceLimit,
  getResourceLimit
};
