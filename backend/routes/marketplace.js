import express from 'express';
import * as marketplaceController from '../controllers/marketplaceController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All marketplace routes require authentication
router.use(protect);

/**
 * @route   GET /api/marketplace/categories
 * @desc    Get all workflow categories
 * @access  Private
 */
router.get('/categories', marketplaceController.getCategories);

/**
 * @route   GET /api/marketplace/workflows
 * @desc    Browse marketplace workflows with filters
 * @query   category, search, page, limit, sortBy
 * @access  Private
 */
router.get('/workflows', marketplaceController.browseWorkflows);

/**
 * @route   GET /api/marketplace/featured
 * @desc    Get featured/popular workflows
 * @query   limit (default: 5)
 * @access  Private
 */
router.get('/featured', marketplaceController.getFeaturedWorkflows);

/**
 * @route   GET /api/marketplace/my-workflows
 * @desc    Get user's installed marketplace workflows
 * @access  Private
 */
router.get('/my-workflows', marketplaceController.getMyMarketplaceWorkflows);

/**
 * @route   GET /api/marketplace/workflows/:id
 * @desc    Get workflow details by ID
 * @access  Private
 */
router.get('/workflows/:id', marketplaceController.getWorkflowDetails);

/**
 * @route   GET /api/marketplace/workflows/:id/access
 * @desc    Check if user has access to workflow
 * @access  Private
 */
router.get('/workflows/:id/access', marketplaceController.checkAccess);

/**
 * @route   POST /api/marketplace/workflows/:id/import
 * @desc    Import a workflow from marketplace
 * @body    { name?, customization? }
 * @access  Private
 */
router.post('/workflows/:id/import', marketplaceController.importWorkflow);

/**
 * @route   GET /api/marketplace/categories/:category/workflows
 * @desc    Get workflows by category
 * @access  Private
 */
router.get('/categories/:category/workflows', marketplaceController.getWorkflowsByCategory);

export default router;
