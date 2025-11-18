import UsageCredit from '../models/UsageCredit.js';
import UsageTransaction from '../models/UsageTransaction.js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * @route   GET /api/usage-credits
 * @desc    Get user's credit balance
 * @access  Private
 */
export const getCreditBalance = async (req, res) => {
  try {
    let credit = await UsageCredit.findOne({
      userId: req.user._id,
      type: 'universal'
    });

    // Create initial credit account if doesn't exist
    if (!credit) {
      credit = await UsageCredit.create({
        userId: req.user._id,
        type: 'universal',
        balance: 0
      });
    }

    res.json({
      success: true,
      credit: {
        balance: credit.balance,
        pricing: credit.pricing,
        usage: credit.usage,
        autoRecharge: credit.autoRecharge,
        estimatedMinutes: Math.floor(credit.balance / credit.pricing.voicePerMinute),
        estimatedSMS: Math.floor(credit.balance / credit.pricing.smsPerMessage),
        estimatedMMS: Math.floor(credit.balance / credit.pricing.mmsPerMessage)
      }
    });
  } catch (error) {
    console.error('Error fetching credit balance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch credit balance',
      message: error.message
    });
  }
};

/**
 * @route   POST /api/usage-credits/purchase
 * @desc    Purchase credits via Stripe
 * @body    { amount: 20 } - Amount in USD
 * @access  Private
 */
export const purchaseCredits = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount < 5) {
      return res.status(400).json({
        success: false,
        error: 'Minimum purchase is $5'
      });
    }

    if (amount > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Maximum purchase is $1000'
      });
    }

    // Get user's credit account
    let credit = await UsageCredit.findOne({
      userId: req.user._id,
      type: 'universal'
    });

    if (!credit) {
      credit = await UsageCredit.create({
        userId: req.user._id,
        type: 'universal',
        balance: 0
      });
    }

    const balanceBefore = credit.balance;

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: 'usd',
      customer: req.user.stripeCustomerId,
      description: `VoiceFlow Credits - $${amount}`,
      metadata: {
        userId: req.user._id.toString(),
        type: 'usage_credits',
        creditAmount: amount
      },
      automatic_payment_methods: {
        enabled: true,
      }
    });

    // If payment succeeds immediately, add credits
    if (paymentIntent.status === 'succeeded') {
      await credit.addCredits(amount);

      // Record transaction
      await UsageTransaction.create({
        userId: req.user._id,
        type: 'credit_purchase',
        amount: amount,
        balanceBefore: balanceBefore,
        balanceAfter: credit.balance,
        stripePaymentIntentId: paymentIntent.id,
        status: 'completed'
      });

      return res.json({
        success: true,
        message: `$${amount} added to your account`,
        balance: credit.balance,
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status
        }
      });
    }

    // Return client secret for frontend to confirm payment
    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amount
    });

  } catch (error) {
    console.error('Error purchasing credits:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to purchase credits',
      message: error.message
    });
  }
};

/**
 * @route   POST /api/usage-credits/confirm-payment
 * @desc    Confirm payment and add credits (called after Stripe webhook or frontend confirmation)
 * @body    { paymentIntentId: 'pi_xxx' }
 * @access  Private
 */
export const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        error: 'Payment intent ID is required'
      });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        error: 'Payment not completed',
        status: paymentIntent.status
      });
    }

    const amount = paymentIntent.amount / 100; // Convert from cents

    // Get user's credit account
    let credit = await UsageCredit.findOne({
      userId: req.user._id,
      type: 'universal'
    });

    if (!credit) {
      credit = await UsageCredit.create({
        userId: req.user._id,
        type: 'universal',
        balance: 0
      });
    }

    const balanceBefore = credit.balance;

    // Check if transaction already recorded
    const existingTransaction = await UsageTransaction.findOne({
      stripePaymentIntentId: paymentIntentId
    });

    if (existingTransaction) {
      return res.json({
        success: true,
        message: 'Credits already added',
        balance: credit.balance
      });
    }

    // Add credits
    await credit.addCredits(amount);

    // Record transaction
    await UsageTransaction.create({
      userId: req.user._id,
      type: 'credit_purchase',
      amount: amount,
      balanceBefore: balanceBefore,
      balanceAfter: credit.balance,
      stripePaymentIntentId: paymentIntentId,
      status: 'completed'
    });

    res.json({
      success: true,
      message: `$${amount} added to your account`,
      balance: credit.balance
    });

  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to confirm payment',
      message: error.message
    });
  }
};

/**
 * @route   GET /api/usage-credits/transactions
 * @desc    Get usage transaction history
 * @query   limit, offset, type
 * @access  Private
 */
export const getTransactions = async (req, res) => {
  try {
    const { limit = 50, offset = 0, type } = req.query;

    const query = { userId: req.user._id };
    if (type) {
      query.type = type;
    }

    const transactions = await UsageTransaction.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .populate('agentId', 'name type')
      .populate('callId', 'duration status');

    const total = await UsageTransaction.countDocuments(query);

    res.json({
      success: true,
      transactions,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > (parseInt(offset) + parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transactions',
      message: error.message
    });
  }
};

/**
 * @route   GET /api/usage-credits/summary
 * @desc    Get usage summary for date range
 * @query   startDate, endDate
 * @access  Private
 */
export const getUsageSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
    const end = endDate ? new Date(endDate) : new Date();

    const summary = await UsageTransaction.getUserUsageSummary(
      req.user._id,
      start,
      end
    );

    // Format summary
    const formattedSummary = {
      voice: { count: 0, totalAmount: 0, totalMinutes: 0 },
      sms: { count: 0, totalAmount: 0 },
      mms: { count: 0, totalAmount: 0 },
      total: { count: 0, totalAmount: 0 }
    };

    summary.forEach(item => {
      if (item._id === 'voice') {
        formattedSummary.voice = {
          count: item.count,
          totalAmount: item.totalAmount,
          totalMinutes: Math.round(item.totalDuration / 60)
        };
      } else if (item._id === 'sms') {
        formattedSummary.sms = {
          count: item.count,
          totalAmount: item.totalAmount
        };
      } else if (item._id === 'mms') {
        formattedSummary.mms = {
          count: item.count,
          totalAmount: item.totalAmount
        };
      }

      formattedSummary.total.count += item.count;
      formattedSummary.total.totalAmount += item.totalAmount;
    });

    res.json({
      success: true,
      summary: formattedSummary,
      dateRange: { start, end }
    });

  } catch (error) {
    console.error('Error fetching usage summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch usage summary',
      message: error.message
    });
  }
};

/**
 * @route   PATCH /api/usage-credits/auto-recharge
 * @desc    Update auto-recharge settings
 * @body    { enabled, threshold, amount }
 * @access  Private
 */
export const updateAutoRecharge = async (req, res) => {
  try {
    const { enabled, threshold, amount } = req.body;

    let credit = await UsageCredit.findOne({
      userId: req.user._id,
      type: 'universal'
    });

    if (!credit) {
      credit = await UsageCredit.create({
        userId: req.user._id,
        type: 'universal',
        balance: 0
      });
    }

    if (enabled !== undefined) {
      credit.autoRecharge.enabled = enabled;
    }

    if (threshold !== undefined && threshold >= 0) {
      credit.autoRecharge.threshold = threshold;
    }

    if (amount !== undefined && amount >= 5) {
      credit.autoRecharge.amount = amount;
    }

    await credit.save();

    res.json({
      success: true,
      message: 'Auto-recharge settings updated',
      autoRecharge: credit.autoRecharge
    });

  } catch (error) {
    console.error('Error updating auto-recharge:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update auto-recharge settings',
      message: error.message
    });
  }
};

export default {
  getCreditBalance,
  purchaseCredits,
  confirmPayment,
  getTransactions,
  getUsageSummary,
  updateAutoRecharge
};
