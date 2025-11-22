import {
  previewCurrentMonthOverage,
  getMonthlyUsage,
  calculateOverageForUser,
  PLAN_CONFIG
} from '../services/overageBillingService.js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Get current billing usage and overage preview
 */
export const getCurrentUsage = async (req, res) => {
  try {
    const userId = req.user._id;
    const overagePreview = await previewCurrentMonthOverage(userId);

    res.json({
      success: true,
      data: overagePreview
    });
  } catch (error) {
    console.error('Error fetching current usage:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get usage history for a specific month
 */
export const getUsageHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: 'Year and month are required'
      });
    }

    const usage = await getMonthlyUsage(userId, parseInt(year), parseInt(month));
    const overageData = await calculateOverageForUser(userId, usage.totalMinutes);

    res.json({
      success: true,
      data: {
        ...usage,
        ...overageData
      }
    });
  } catch (error) {
    console.error('Error fetching usage history:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get plan details and limits
 */
export const getPlanDetails = async (req, res) => {
  try {
    const userPlan = req.user.plan;
    const planConfig = PLAN_CONFIG[userPlan];

    if (!planConfig) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    res.json({
      success: true,
      data: {
        currentPlan: userPlan,
        ...planConfig,
        allPlans: PLAN_CONFIG
      }
    });
  } catch (error) {
    console.error('Error fetching plan details:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get upcoming invoice with overage charges
 */
export const getUpcomingInvoice = async (req, res) => {
  try {
    const user = req.user;

    if (!user.stripeCustomerId) {
      return res.status(400).json({
        success: false,
        message: 'No Stripe customer ID found'
      });
    }

    // Get upcoming invoice from Stripe
    const upcomingInvoice = await stripe.invoices.retrieveUpcoming({
      customer: user.stripeCustomerId
    });

    // Parse invoice items to separate subscription and overage charges
    const subscriptionItems = [];
    const overageItems = [];

    upcomingInvoice.lines.data.forEach(line => {
      if (line.metadata?.type === 'overage') {
        overageItems.push(line);
      } else {
        subscriptionItems.push(line);
      }
    });

    res.json({
      success: true,
      data: {
        invoiceId: upcomingInvoice.id,
        amountDue: upcomingInvoice.amount_due / 100,
        currency: upcomingInvoice.currency,
        periodStart: new Date(upcomingInvoice.period_start * 1000),
        periodEnd: new Date(upcomingInvoice.period_end * 1000),
        subscriptionTotal: upcomingInvoice.subtotal / 100,
        overageTotal: overageItems.reduce((sum, item) => sum + item.amount, 0) / 100,
        subscriptionItems: subscriptionItems.map(item => ({
          description: item.description,
          amount: item.amount / 100,
          quantity: item.quantity,
          period: {
            start: new Date(item.period.start * 1000),
            end: new Date(item.period.end * 1000)
          }
        })),
        overageItems: overageItems.map(item => ({
          description: item.description,
          amount: item.amount / 100,
          metadata: item.metadata
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching upcoming invoice:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get invoice history
 */
export const getInvoiceHistory = async (req, res) => {
  try {
    const user = req.user;

    if (!user.stripeCustomerId) {
      return res.status(400).json({
        success: false,
        message: 'No Stripe customer ID found'
      });
    }

    const { limit = 12 } = req.query;

    const invoices = await stripe.invoices.list({
      customer: user.stripeCustomerId,
      limit: parseInt(limit)
    });

    const invoiceData = invoices.data.map(invoice => ({
      id: invoice.id,
      number: invoice.number,
      status: invoice.status,
      amountPaid: invoice.amount_paid / 100,
      amountDue: invoice.amount_due / 100,
      currency: invoice.currency,
      created: new Date(invoice.created * 1000),
      periodStart: new Date(invoice.period_start * 1000),
      periodEnd: new Date(invoice.period_end * 1000),
      pdfUrl: invoice.invoice_pdf,
      hostedUrl: invoice.hosted_invoice_url
    }));

    res.json({
      success: true,
      data: {
        invoices: invoiceData,
        hasMore: invoices.has_more
      }
    });
  } catch (error) {
    console.error('Error fetching invoice history:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get user's current credit balance
 */
export const getCreditBalance = async (req, res) => {
  try {
    const user = req.user;

    res.json({
      success: true,
      data: {
        credits: user.credits || user.creditBalance || 0,
        totalUsed: user.totalCreditsUsed || 0,
        totalPurchased: user.totalCreditsPurchased || 0
      }
    });
  } catch (error) {
    console.error('Error fetching credit balance:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get available credit packages
 */
export const getCreditPackages = async (req, res) => {
  try {
    const { CREDIT_PACKAGES } = await import('../config/creditPackages.js');

    res.json({
      success: true,
      data: {
        packages: CREDIT_PACKAGES
      }
    });
  } catch (error) {
    console.error('Error fetching credit packages:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Purchase credits
 */
export const purchaseCredits = async (req, res) => {
  try {
    const userId = req.user._id;
    const { packageId, paymentMethodId } = req.body;

    if (!packageId) {
      return res.status(400).json({
        success: false,
        message: 'Package ID is required'
      });
    }

    const { getCreditPackage } = await import('../config/creditPackages.js');
    const User = (await import('../models/User.js')).default;
    const CreditPurchase = (await import('../models/CreditPurchase.js')).default;

    const package_ = getCreditPackage(packageId);
    if (!package_) {
      return res.status(400).json({
        success: false,
        message: 'Invalid package ID'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(package_.price * 100), // Convert to cents
      currency: 'usd',
      customer: user.stripeCustomerId,
      payment_method: paymentMethodId,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      },
      metadata: {
        userId: userId.toString(),
        packageId,
        credits: package_.credits
      }
    });

    // Create purchase record
    const purchase = await CreditPurchase.create({
      userId,
      packageName: package_.name,
      creditsAmount: package_.credits,
      priceUSD: package_.price,
      stripePaymentIntentId: paymentIntent.id,
      stripeChargeId: paymentIntent.latest_charge,
      status: paymentIntent.status === 'succeeded' ? 'completed' : 'pending'
    });

    // If payment succeeded, add credits to user account
    if (paymentIntent.status === 'succeeded') {
      user.credits = (user.credits || 0) + package_.credits;
      user.creditBalance = (user.creditBalance || 0) + package_.credits;
      user.totalCreditsPurchased = (user.totalCreditsPurchased || 0) + package_.credits;
      await user.save();
    }

    res.json({
      success: true,
      data: {
        purchase,
        credits: user.credits,
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status
        }
      }
    });
  } catch (error) {
    console.error('Error purchasing credits:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get credit purchase history
 */
export const getCreditHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 20, offset = 0 } = req.query;

    const CreditPurchase = (await import('../models/CreditPurchase.js')).default;

    const purchases = await CreditPurchase.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await CreditPurchase.countDocuments({ userId });

    res.json({
      success: true,
      data: {
        purchases,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Error fetching credit history:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get credit costs for different actions
 */
export const getCreditCosts = async (req, res) => {
  try {
    const { CREDIT_COSTS } = await import('../config/creditPackages.js');

    res.json({
      success: true,
      data: {
        costs: CREDIT_COSTS
      }
    });
  } catch (error) {
    console.error('Error fetching credit costs:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export default {
  getCurrentUsage,
  getUsageHistory,
  getPlanDetails,
  getUpcomingInvoice,
  getInvoiceHistory,
  // Credit system
  getCreditBalance,
  getCreditPackages,
  purchaseCredits,
  getCreditHistory,
  getCreditCosts
};
