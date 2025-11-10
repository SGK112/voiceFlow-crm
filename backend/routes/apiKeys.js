import express from 'express';
import {
  getApiKeys,
  createApiKey,
  updateApiKey,
  deleteApiKey
} from '../controllers/apiKeyController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// API Key management routes
router.get('/', getApiKeys);
router.post('/', createApiKey);
router.put('/:keyId', updateApiKey);
router.delete('/:keyId', deleteApiKey);

export default router;
