import N8nMarketplaceService from '../services/n8nMarketplaceService.js';

const marketplaceService = new N8nMarketplaceService();

/**
 * Get all workflow categories
 * GET /api/marketplace/categories
 */
export const getCategories = async (req, res) => {
  try {
    const categories = marketplaceService.getCategories();

    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
};

/**
 * Browse marketplace workflows with filters
 * GET /api/marketplace/workflows
 * Query params: category, search, page, limit, sortBy
 */
export const browseWorkflows = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = req.user;

    const filters = {
      category: req.query.category,
      search: req.query.search,
      tier: user.subscription?.tier || 'starter',
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      sortBy: req.query.sortBy || 'popular'
    };

    const result = await marketplaceService.browseWorkflows(filters);

    res.json({
      success: true,
      ...result,
      userTier: filters.tier
    });
  } catch (error) {
    console.error('Error browsing workflows:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to browse workflows',
      error: error.message
    });
  }
};

/**
 * Get workflow details by ID
 * GET /api/marketplace/workflows/:id
 */
export const getWorkflowDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const workflow = await marketplaceService.getWorkflowDetails(id);
    const accessCheck = await marketplaceService.checkWorkflowAccess(userId, id);

    res.json({
      success: true,
      workflow,
      access: accessCheck
    });
  } catch (error) {
    console.error('Error fetching workflow details:', error);

    if (error.message === 'Workflow not found') {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch workflow details',
      error: error.message
    });
  }
};

/**
 * Import a workflow from marketplace
 * POST /api/marketplace/workflows/:id/import
 * Body: { name?, customization? }
 */
export const importWorkflow = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const customization = req.body;

    const result = await marketplaceService.importWorkflow(userId, id, customization);

    res.json({
      success: true,
      message: 'Workflow imported successfully',
      ...result
    });
  } catch (error) {
    console.error('Error importing workflow:', error);

    // Handle tier access errors
    if (error.message.includes('requires') && error.message.includes('tier')) {
      return res.status(403).json({
        success: false,
        message: error.message,
        upgradeRequired: true,
        upgradeUrl: '/app/settings?tab=billing'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to import workflow',
      error: error.message
    });
  }
};

/**
 * Get user's installed marketplace workflows
 * GET /api/marketplace/my-workflows
 */
export const getMyMarketplaceWorkflows = async (req, res) => {
  try {
    const userId = req.user.id;

    const workflows = await marketplaceService.getUserMarketplaceWorkflows(userId);

    res.json({
      success: true,
      workflows,
      count: workflows.length
    });
  } catch (error) {
    console.error('Error fetching user marketplace workflows:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch workflows',
      error: error.message
    });
  }
};

/**
 * Get popular/featured workflows
 * GET /api/marketplace/featured
 */
export const getFeaturedWorkflows = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const workflows = marketplaceService.getPopularWorkflows(limit);

    res.json({
      success: true,
      workflows
    });
  } catch (error) {
    console.error('Error fetching featured workflows:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured workflows',
      error: error.message
    });
  }
};

/**
 * Get workflows by category
 * GET /api/marketplace/categories/:category/workflows
 */
export const getWorkflowsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const workflows = marketplaceService.getWorkflowsByCategory(category);

    res.json({
      success: true,
      category,
      workflows,
      count: workflows.length
    });
  } catch (error) {
    console.error('Error fetching category workflows:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch workflows',
      error: error.message
    });
  }
};

/**
 * Check if user has access to a workflow
 * GET /api/marketplace/workflows/:id/access
 */
export const checkAccess = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const accessCheck = await marketplaceService.checkWorkflowAccess(userId, id);

    res.json({
      success: true,
      ...accessCheck
    });
  } catch (error) {
    console.error('Error checking workflow access:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check access',
      error: error.message
    });
  }
};
