import express from 'express';
import {
  getMarketplaceTemplates,
  getTemplateDetails,
  createTemplate,
  updateTemplate,
  submitForReview,
  getMyTemplates,
  installTemplate,
  uninstallTemplate,
  rateTemplate,
  getCreatorRevenue
} from '../controllers/communityAgentController.js';
import { protect as auth } from '../middleware/auth.js';

const router = express.Router();

// Public marketplace routes (require auth to see installation status)
router.get('/marketplace', auth, getMarketplaceTemplates);
router.get('/marketplace/:slug', auth, getTemplateDetails);

// User installation management
router.post('/:templateId/install', auth, installTemplate);
router.delete('/:templateId/uninstall', auth, uninstallTemplate);
router.post('/:templateId/rate', auth, rateTemplate);

// Template creation and management (for creators)
router.get('/my-templates', auth, getMyTemplates);
router.post('/create', auth, createTemplate);
router.put('/:id', auth, updateTemplate);
router.post('/:id/submit', auth, submitForReview);

// Revenue dashboard for creators
router.get('/creator/revenue', auth, getCreatorRevenue);

export default router;
