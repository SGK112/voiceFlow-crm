import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getWorkflowMarketplace,
  getWorkflowDetails,
  installWorkflow,
  uninstallWorkflow,
  getMyWorkflows
} from '../controllers/workflowMarketplaceController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * GET /api/workflow-marketplace
 * Browse all available workflows
 */
router.get('/', getWorkflowMarketplace);

/**
 * GET /api/workflow-marketplace/my-workflows
 * Get user's installed workflows
 */
router.get('/my-workflows', getMyWorkflows);

/**
 * GET /api/workflow-marketplace/:workflowId
 * Get workflow details
 */
router.get('/:workflowId', getWorkflowDetails);

/**
 * POST /api/workflow-marketplace/:workflowId/install
 * Install/activate a workflow
 */
router.post('/:workflowId/install', installWorkflow);

/**
 * POST /api/workflow-marketplace/:workflowId/uninstall
 * Uninstall/deactivate a workflow
 */
router.post('/:workflowId/uninstall', uninstallWorkflow);

export default router;
