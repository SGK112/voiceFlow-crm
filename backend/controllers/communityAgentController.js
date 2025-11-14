import CommunityAgentTemplate from '../models/CommunityAgentTemplate.js';
import CommunityAgentInstallation from '../models/CommunityAgentInstallation.js';
import VoiceAgent from '../models/VoiceAgent.js';
import User from '../models/User.js';

// Get all published community templates (marketplace)
export const getMarketplaceTemplates = async (req, res) => {
  try {
    const {
      category,
      industry,
      search,
      sortBy = 'popular',
      page = 1,
      limit = 20
    } = req.query;

    const query = { status: 'published' };

    // Apply filters
    if (category) query.category = category;
    if (industry) query.industry = industry;
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { tags: new RegExp(search, 'i') }
      ];
    }

    // Determine sort order
    let sort = {};
    switch (sortBy) {
      case 'popular':
        sort = { 'stats.installs': -1, 'stats.rating': -1 };
        break;
      case 'rating':
        sort = { 'stats.rating': -1, 'stats.reviewCount': -1 };
        break;
      case 'newest':
        sort = { publishedAt: -1 };
        break;
      case 'price-low':
        sort = { 'pricing.basePrice': 1 };
        break;
      case 'price-high':
        sort = { 'pricing.basePrice': -1 };
        break;
      default:
        sort = { isFeatured: -1, 'stats.installs': -1 };
    }

    const templates = await CommunityAgentTemplate.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    const total = await CommunityAgentTemplate.countDocuments(query);

    // Check which templates the user has already installed
    const userInstallations = await CommunityAgentInstallation.find({
      userId: req.user.userId,
      templateId: { $in: templates.map(t => t._id) },
      isActive: true
    }).select('templateId subscriptionStatus');

    const installedMap = userInstallations.reduce((acc, inst) => {
      acc[inst.templateId.toString()] = inst.subscriptionStatus;
      return acc;
    }, {});

    // Add installation status to each template
    const templatesWithStatus = templates.map(template => ({
      ...template,
      isInstalled: !!installedMap[template._id.toString()],
      installStatus: installedMap[template._id.toString()] || null
    }));

    res.json({
      templates: templatesWithStatus,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get marketplace templates error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single template details
export const getTemplateDetails = async (req, res) => {
  try {
    const { slug } = req.params;

    const template = await CommunityAgentTemplate.findOne({
      slug,
      status: 'published'
    }).lean();

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Check if user has installed
    const installation = await CommunityAgentInstallation.findOne({
      userId: req.user.userId,
      templateId: template._id
    });

    res.json({
      ...template,
      isInstalled: !!installation,
      installStatus: installation?.subscriptionStatus || null
    });
  } catch (error) {
    console.error('Get template details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new community template (user-created)
export const createTemplate = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    const template = new CommunityAgentTemplate({
      ...req.body,
      creatorId: req.user.userId,
      creatorName: user.name || user.email,
      creatorCompany: user.company || '',
      status: 'draft'
    });

    await template.save();

    res.status(201).json(template);
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update template (only by creator)
export const updateTemplate = async (req, res) => {
  try {
    const template = await CommunityAgentTemplate.findOne({
      _id: req.params.id,
      creatorId: req.user.userId
    });

    if (!template) {
      return res.status(404).json({ message: 'Template not found or unauthorized' });
    }

    // Don't allow changing status if published
    if (template.status === 'published' && req.body.status !== 'published') {
      return res.status(400).json({ message: 'Cannot unpublish a published template' });
    }

    Object.assign(template, req.body);
    await template.save();

    res.json(template);
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Submit template for review
export const submitForReview = async (req, res) => {
  try {
    const template = await CommunityAgentTemplate.findOne({
      _id: req.params.id,
      creatorId: req.user.userId
    });

    if (!template) {
      return res.status(404).json({ message: 'Template not found or unauthorized' });
    }

    if (template.status !== 'draft') {
      return res.status(400).json({ message: 'Only draft templates can be submitted for review' });
    }

    template.status = 'pending-review';
    await template.save();

    res.json({ message: 'Template submitted for review', template });
  } catch (error) {
    console.error('Submit template error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's created templates
export const getMyTemplates = async (req, res) => {
  try {
    const templates = await CommunityAgentTemplate.find({
      creatorId: req.user.userId
    }).sort({ createdAt: -1 });

    res.json(templates);
  } catch (error) {
    console.error('Get my templates error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Install a community template
export const installTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const { setupAnswers } = req.body;

    const template = await CommunityAgentTemplate.findOne({
      _id: templateId,
      status: 'published'
    });

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Check if already installed
    const existingInstallation = await CommunityAgentInstallation.findOne({
      userId: req.user.userId,
      templateId
    });

    if (existingInstallation && existingInstallation.isActive) {
      return res.status(400).json({ message: 'Template already installed' });
    }

    const user = await User.findById(req.user.userId);

    // Generate prompt from template
    const generatedPrompt = generatePromptFromTemplate(template.promptTemplate, setupAnswers, {
      company: user.company,
      name: user.name,
      email: user.email
    });

    // Create the voice agent
    // Note: This would need to integrate with ElevenLabs API to create the actual agent
    const voiceAgent = new VoiceAgent({
      userId: req.user.userId,
      name: template.name,
      type: 'custom',
      customType: template.category,
      script: generatedPrompt,
      firstMessage: template.firstMessageTemplate,
      elevenLabsAgentId: 'pending', // Would be created via ElevenLabs API
      voiceId: 'default', // User would select during setup
      enabled: false // Not enabled by default
    });

    await voiceAgent.save();

    // Create installation record
    const installation = new CommunityAgentInstallation({
      userId: req.user.userId,
      templateId: template._id,
      agentId: voiceAgent._id,
      setupAnswers,
      subscriptionStatus: template.pricing.billingCycle === 'free' ? 'active' : 'trial',
      trial: template.pricing.billingCycle !== 'free' ? {
        isActive: true,
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 day trial
      } : undefined
    });

    await installation.save();

    // Update template stats
    template.stats.installs += 1;
    template.stats.activeInstalls += 1;
    await template.save();

    res.status(201).json({
      message: 'Template installed successfully',
      installation,
      agent: voiceAgent
    });
  } catch (error) {
    console.error('Install template error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Uninstall a community template
export const uninstallTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;

    const installation = await CommunityAgentInstallation.findOne({
      userId: req.user.userId,
      templateId
    });

    if (!installation) {
      return res.status(404).json({ message: 'Installation not found' });
    }

    // Deactivate the voice agent
    await VoiceAgent.findByIdAndUpdate(installation.agentId, {
      enabled: false,
      archived: true,
      archivedAt: new Date()
    });

    // Mark installation as inactive
    installation.isActive = false;
    installation.uninstalledAt = new Date();
    await installation.save();

    // Update template stats
    await CommunityAgentTemplate.findByIdAndUpdate(templateId, {
      $inc: { 'stats.activeInstalls': -1 }
    });

    res.json({ message: 'Template uninstalled successfully' });
  } catch (error) {
    console.error('Uninstall template error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Rate and review a template
export const rateTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const { rating, review } = req.body;

    const installation = await CommunityAgentInstallation.findOne({
      userId: req.user.userId,
      templateId
    });

    if (!installation) {
      return res.status(404).json({ message: 'Must install template before rating' });
    }

    // Update installation rating
    installation.rating = rating;
    if (review) {
      installation.review = {
        text: review,
        createdAt: new Date(),
        isPublic: true
      };
    }
    await installation.save();

    // Recalculate template average rating
    const template = await CommunityAgentTemplate.findById(templateId);
    const allRatings = await CommunityAgentInstallation.find({
      templateId,
      rating: { $exists: true }
    }).select('rating');

    const avgRating = allRatings.reduce((sum, inst) => sum + inst.rating, 0) / allRatings.length;
    template.stats.rating = Math.round(avgRating * 10) / 10; // Round to 1 decimal
    template.stats.reviewCount = allRatings.length;
    await template.save();

    res.json({ message: 'Rating submitted successfully', avgRating: template.stats.rating });
  } catch (error) {
    console.error('Rate template error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get creator revenue dashboard
export const getCreatorRevenue = async (req, res) => {
  try {
    const templates = await CommunityAgentTemplate.find({
      creatorId: req.user.userId
    }).select('name stats pricing revenueShare');

    const installations = await CommunityAgentInstallation.find({
      templateId: { $in: templates.map(t => t._id) },
      subscriptionStatus: { $in: ['active', 'trial'] }
    });

    const revenue = {
      totalRevenue: 0,
      monthlyRevenue: 0,
      templates: templates.map(template => {
        const templateInstalls = installations.filter(
          i => i.templateId.toString() === template._id.toString()
        );

        const monthlyRevenue = templateInstalls.length * template.pricing.basePrice;
        const creatorShare = monthlyRevenue * (template.revenueShare.creatorPercentage / 100);

        return {
          name: template.name,
          installs: template.stats.installs,
          activeInstalls: template.stats.activeInstalls,
          monthlyRevenue,
          creatorShare,
          rating: template.stats.rating
        };
      })
    };

    revenue.monthlyRevenue = revenue.templates.reduce((sum, t) => sum + t.creatorShare, 0);
    revenue.totalRevenue = revenue.templates.reduce((sum, t) => sum + t.totalRevenue, 0);

    res.json(revenue);
  } catch (error) {
    console.error('Get creator revenue error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to generate prompt from template
function generatePromptFromTemplate(template, answers, userInfo) {
  let prompt = template;

  // Replace {{variable}} placeholders with actual values
  Object.keys(answers).forEach(key => {
    const value = Array.isArray(answers[key]) ? answers[key].join(', ') : answers[key];
    prompt = prompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
  });

  // Replace user info placeholders
  Object.keys(userInfo).forEach(key => {
    prompt = prompt.replace(new RegExp(`{{user.${key}}}`, 'g'), userInfo[key] || '');
  });

  return prompt;
}

export default {
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
};
