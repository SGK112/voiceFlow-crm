import N8nService from '../services/n8nService.js';
import User from '../models/User.js';

const n8nService = new N8nService();

/**
 * GET /api/workflow-marketplace
 * Browse all available n8n workflows
 */
export const getWorkflowMarketplace = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;

    console.log('📚 [WORKFLOW MARKETPLACE] Fetching workflows...');

    // Get all workflows from n8n
    const allWorkflows = await n8nService.listWorkflows();

    console.log('📊 [WORKFLOW MARKETPLACE] n8n Response:', {
      hasData: !!allWorkflows,
      isArray: Array.isArray(allWorkflows),
      length: allWorkflows?.length,
      dataLength: allWorkflows?.data?.length,
      type: typeof allWorkflows
    });

    if (!allWorkflows || allWorkflows.length === 0) {
      return res.json({
        success: true,
        data: {
          workflows: [],
          total: 0,
          page: parseInt(page),
          totalPages: 0
        }
      });
    }

    let workflows = allWorkflows.data || allWorkflows;

    // Filter by search query
    if (search) {
      const searchLower = search.toLowerCase();
      workflows = workflows.filter(w =>
        w.name.toLowerCase().includes(searchLower) ||
        w.tags?.some(t => (t.name || t).toLowerCase().includes(searchLower))
      );
    }

    // Filter by category (using tags)
    if (category && category !== 'all') {
      workflows = workflows.filter(w =>
        w.tags?.some(t => (t.name || t).toLowerCase() === category.toLowerCase())
      );
    }

    // Extract unique categories from all workflows
    const categoriesSet = new Set();
    workflows.forEach(w => {
      if (w.tags && Array.isArray(w.tags)) {
        w.tags.forEach(tag => {
          const tagName = tag.name || tag;
          if (tagName && tagName !== 'templates' && tagName !== 'creator') {
            categoriesSet.add(tagName);
          }
        });
      }
    });
    const categories = Array.from(categoriesSet)
      .sort()
      .map(cat => ({ id: cat, name: cat }));

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedWorkflows = workflows.slice(startIndex, endIndex);

    // Enhance workflow data with descriptions and categories
    const enhancedWorkflows = paginatedWorkflows.map(w => ({
      id: w.id,
      name: w.name.replace(/^\d+-/, '').replace(/_/g, ' '), // Clean up names
      description: generateDescription(w),
      category: w.tags?.[0]?.name || w.tags?.[0] || 'General',
      tags: w.tags || [],
      createdAt: w.createdAt,
      updatedAt: w.updatedAt,
      active: w.active,
      isPremium: isPremiumWorkflow(w)
    }));

    res.json({
      success: true,
      data: {
        workflows: enhancedWorkflows,
        total: workflows.length,
        page: parseInt(page),
        totalPages: Math.ceil(workflows.length / limit),
        categories
      }
    });

  } catch (error) {
    console.error('❌ [WORKFLOW MARKETPLACE] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * GET /api/workflow-marketplace/:workflowId
 * Get detailed information about a specific workflow
 */
export const getWorkflowDetails = async (req, res) => {
  try {
    const { workflowId } = req.params;

    console.log(`📄 [WORKFLOW MARKETPLACE] Fetching workflow: ${workflowId}`);

    const workflow = await n8nService.getWorkflow(workflowId);

    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found'
      });
    }

    res.json({
      success: true,
      data: {
        workflow: {
          id: workflow.id,
          name: workflow.name.replace(/^\d+-/, '').replace(/_/g, ' '),
          description: generateDescription(workflow),
          category: workflow.tags?.[0]?.name || workflow.tags?.[0] || 'General',
          tags: workflow.tags || [],
          createdAt: workflow.createdAt,
          updatedAt: workflow.updatedAt,
          active: workflow.active,
          nodes: workflow.nodes?.length || 0,
          isPremium: isPremiumWorkflow(workflow)
        }
      }
    });

  } catch (error) {
    console.error('❌ [WORKFLOW MARKETPLACE] Error fetching workflow:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * POST /api/workflow-marketplace/:workflowId/install
 * Install/activate a workflow for the current user
 */
export const installWorkflow = async (req, res) => {
  try {
    const { workflowId } = req.params;
    const userId = req.user._id;

    console.log(`⚙️  [WORKFLOW MARKETPLACE] Installing workflow ${workflowId} for user ${userId}`);

    // Get workflow details
    const workflow = await n8nService.getWorkflow(workflowId);

    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found'
      });
    }

    // Check if user has permission (based on plan)
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if premium workflow and user has access
    if (isPremiumWorkflow(workflow) && !hasAccessToPremium(user)) {
      return res.status(403).json({
        success: false,
        message: 'This workflow requires a premium plan. Please upgrade to access premium workflows.'
      });
    }

    // Activate the workflow
    const activatedWorkflow = await n8nService.activateWorkflow(workflowId);

    if (!activatedWorkflow) {
      return res.status(500).json({
        success: false,
        message: 'Failed to activate workflow'
      });
    }

    // Track installation (you could add this to user's profile)
    console.log(`✅ [WORKFLOW MARKETPLACE] Workflow ${workflowId} installed for user ${userId}`);

    res.json({
      success: true,
      message: 'Workflow installed and activated successfully!',
      data: {
        workflow: {
          id: activatedWorkflow.id,
          name: activatedWorkflow.name,
          active: activatedWorkflow.active
        }
      }
    });

  } catch (error) {
    console.error('❌ [WORKFLOW MARKETPLACE] Error installing workflow:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * POST /api/workflow-marketplace/:workflowId/uninstall
 * Deactivate a workflow
 */
export const uninstallWorkflow = async (req, res) => {
  try {
    const { workflowId } = req.params;
    const userId = req.user._id;

    console.log(`⚙️  [WORKFLOW MARKETPLACE] Uninstalling workflow ${workflowId} for user ${userId}`);

    // Deactivate the workflow
    const deactivatedWorkflow = await n8nService.deactivateWorkflow(workflowId);

    if (!deactivatedWorkflow) {
      return res.status(500).json({
        success: false,
        message: 'Failed to deactivate workflow'
      });
    }

    console.log(`✅ [WORKFLOW MARKETPLACE] Workflow ${workflowId} uninstalled for user ${userId}`);

    res.json({
      success: true,
      message: 'Workflow deactivated successfully!',
      data: {
        workflow: {
          id: deactivatedWorkflow.id,
          name: deactivatedWorkflow.name,
          active: deactivatedWorkflow.active
        }
      }
    });

  } catch (error) {
    console.error('❌ [WORKFLOW MARKETPLACE] Error uninstalling workflow:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * GET /api/workflow-marketplace/my-workflows
 * Get user's installed/active workflows
 */
export const getMyWorkflows = async (req, res) => {
  try {
    const userId = req.user._id;

    console.log(`📋 [WORKFLOW MARKETPLACE] Fetching active workflows for user ${userId}`);

    // Get all workflows
    const allWorkflows = await n8nService.listWorkflows();

    if (!allWorkflows || allWorkflows.length === 0) {
      return res.json({
        success: true,
        data: { workflows: [] }
      });
    }

    const workflows = allWorkflows.data || allWorkflows;

    // Filter only active workflows
    const activeWorkflows = workflows
      .filter(w => w.active)
      .map(w => ({
        id: w.id,
        name: w.name.replace(/^\d+-/, '').replace(/_/g, ' '),
        description: generateDescription(w),
        category: w.tags?.[0]?.name || w.tags?.[0] || 'General',
        tags: w.tags || [],
        createdAt: w.createdAt,
        updatedAt: w.updatedAt,
        active: w.active
      }));

    res.json({
      success: true,
      data: { workflows: activeWorkflows }
    });

  } catch (error) {
    console.error('❌ [WORKFLOW MARKETPLACE] Error fetching user workflows:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Helper functions
function generateDescription(workflow) {
  const name = workflow.name.replace(/^\d+-/, '').replace(/_/g, ' ');

  // Generate description based on workflow name and tags
  if (name.includes('WhatsApp')) return 'Automate WhatsApp messaging and customer interactions';
  if (name.includes('Instagram')) return 'Automate Instagram content creation and posting';
  if (name.includes('TikTok')) return 'Create and publish TikTok videos automatically';
  if (name.includes('LinkedIn')) return 'Automate LinkedIn posts and professional networking';
  if (name.includes('Email') || name.includes('Gmail')) return 'Automate email responses and marketing';
  if (name.includes('Telegram')) return 'Build Telegram bots and automate messaging';
  if (name.includes('WordPress')) return 'Automate WordPress content creation and publishing';
  if (name.includes('Shopify') || name.includes('WooCommerce')) return 'Automate e-commerce operations and order fulfillment';
  if (name.includes('Voice') || name.includes('Call') || name.includes('ElevenLabs')) return 'AI voice agents for customer calls';
  if (name.includes('Lead')) return 'Generate and qualify leads automatically';
  if (name.includes('Appointment') || name.includes('Booking')) return 'Automate appointment scheduling';
  if (name.includes('Video')) return 'AI-powered video creation and editing';
  if (name.includes('SEO')) return 'SEO optimization and content analysis';
  if (name.includes('Customer Support') || name.includes('Chatbot')) return 'AI-powered customer support automation';

  return 'Automate your workflow with AI-powered tools';
}

function isPremiumWorkflow(workflow) {
  // Premium workflows have OpenAI, WooCommerce, or creator tags
  const premiumTags = ['OpenAI', 'WooCommerce', 'creator', 'templates'];
  return workflow.tags?.some(tag =>
    premiumTags.includes(tag.name || tag)
  );
}

function hasAccessToPremium(user) {
  // Enterprise plan has access to all workflows
  // Professional plan has access to some premium workflows
  return user.plan === 'enterprise' || user.plan === 'professional';
}
