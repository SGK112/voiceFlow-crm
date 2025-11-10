import Usage from '../models/Usage.js';
import User from '../models/User.js';

// Get current month's usage for the authenticated user
export const getCurrentUsage = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const usage = await Usage.getOrCreateForUser(userId, user);

    // Get plan limits for the user's current plan
    const planLimits = Usage.getPlanLimits(user.plan);

    res.json({
      usage,
      planLimits,
      user: {
        plan: user.plan,
        email: user.email,
        company: user.company
      }
    });
  } catch (error) {
    console.error('Get current usage error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get usage history (last 12 months)
export const getUsageHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 12 } = req.query;

    const usageHistory = await Usage.find({ userId })
      .sort({ month: -1 })
      .limit(parseInt(limit));

    res.json(usageHistory);
  } catch (error) {
    console.error('Get usage history error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get usage for a specific month
export const getUsageByMonth = async (req, res) => {
  try {
    const userId = req.user._id;
    const { month } = req.params; // Format: "2025-01"

    const usage = await Usage.findOne({ userId, month });

    if (!usage) {
      return res.status(404).json({ message: 'No usage data found for this month' });
    }

    res.json(usage);
  } catch (error) {
    console.error('Get usage by month error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
