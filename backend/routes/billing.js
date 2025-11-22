import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getCurrentUsage,
  getUsageHistory,
  getPlanDetails,
  getUpcomingInvoice,
  getInvoiceHistory,
  // New credit-based endpoints
  getCreditBalance,
  getCreditPackages,
  purchaseCredits,
  getCreditHistory,
  getCreditCosts
} from '../controllers/billingController.js';

const router = express.Router();

// All billing routes require authentication
router.use(protect);

// Credits endpoints (new pay-as-you-go system)
router.get('/credits/balance', getCreditBalance);
router.get('/credits/packages', getCreditPackages);
router.post('/credits/purchase', purchaseCredits);
router.get('/credits/history', getCreditHistory);
router.get('/credits/costs', getCreditCosts);

// Usage and overage endpoints (legacy)
router.get('/usage/current', getCurrentUsage);
router.get('/usage/history', getUsageHistory);

// Plan information (legacy)
router.get('/plan', getPlanDetails);

// Invoice endpoints (legacy)
router.get('/invoice/upcoming', getUpcomingInvoice);
router.get('/invoice/history', getInvoiceHistory);

export default router;
