import express from 'express';
import { getCurrentUsage, getUsageHistory, getUsageByMonth } from '../controllers/usageController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get current month's usage
router.get('/current', getCurrentUsage);

// Get usage history
router.get('/history', getUsageHistory);

// Get usage for specific month
router.get('/:month', getUsageByMonth);

export default router;
