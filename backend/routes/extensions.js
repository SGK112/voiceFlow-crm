import express from 'express';
const router = express.Router();
import { protect as auth } from '../middleware/auth.js';
import { Extension, UserExtension } from '../models/Extension.js';

// Get all available extensions (marketplace)
router.get('/marketplace', auth, async (req, res) => {
  try {
    const { category, search, featured, page = 1, limit = 20 } = req.query;

    const query = { isPublished: true, status: 'active' };

    if (category) query.category = category;
    if (featured === 'true') query.isFeatured = true;
    if (search) {
      query.$or = [
        { displayName: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { tags: new RegExp(search, 'i') }
      ];
    }

    const extensions = await Extension.find(query)
      .select('-integration.oauthConfig.clientSecret -integration.webhookConfig.secret')
      .sort({ isFeatured: -1, 'stats.rating': -1, 'stats.installs': -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Extension.countDocuments(query);

    // Get user's installed extensions
    const userExtensions = await UserExtension.find({
      user: req.user.userId,
      status: 'active'
    }).select('extension');

    const installedIds = userExtensions.map(ue => ue.extension.toString());

    // Mark which extensions are installed
    const extensionsWithStatus = extensions.map(ext => {
      const extObj = ext.toObject();
      extObj.isInstalled = installedIds.includes(ext._id.toString());
      return extObj;
    });

    res.json({
      extensions: extensionsWithStatus,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get extensions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get extension categories
router.get('/categories', auth, async (req, res) => {
  try {
    const categories = await Extension.aggregate([
      { $match: { isPublished: true, status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json(categories.map(c => ({ category: c._id, count: c.count })));
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single extension details
router.get('/marketplace/:slug', auth, async (req, res) => {
  try {
    const extension = await Extension.findOne({
      slug: req.params.slug,
      isPublished: true
    }).select('-integration.oauthConfig.clientSecret -integration.webhookConfig.secret');

    if (!extension) {
      return res.status(404).json({ message: 'Extension not found' });
    }

    // Check if user has installed this extension
    const userExtension = await UserExtension.findOne({
      user: req.user.userId,
      extension: extension._id
    });

    const extensionObj = extension.toObject();
    extensionObj.isInstalled = !!userExtension;
    if (userExtension) {
      extensionObj.installStatus = userExtension.status;
    }

    res.json(extensionObj);
  } catch (error) {
    console.error('Get extension error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's installed extensions
router.get('/installed', auth, async (req, res) => {
  try {
    const userExtensions = await UserExtension.find({
      user: req.user.userId
    }).populate('extension', '-integration.oauthConfig.clientSecret -integration.webhookConfig.secret');

    res.json(userExtensions);
  } catch (error) {
    console.error('Get installed extensions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Install extension
router.post('/:extensionId/install', auth, async (req, res) => {
  try {
    const extension = await Extension.findOne({
      _id: req.params.extensionId,
      isPublished: true,
      status: 'active'
    });

    if (!extension) {
      return res.status(404).json({ message: 'Extension not found' });
    }

    // Check if already installed
    let userExtension = await UserExtension.findOne({
      user: req.user.userId,
      extension: extension._id
    });

    if (userExtension) {
      return res.status(400).json({ message: 'Extension already installed' });
    }

    // Create new installation
    userExtension = new UserExtension({
      user: req.user.userId,
      extension: extension._id,
      status: 'pending',
      settings: {
        autoSync: true,
        syncFrequency: extension.syncConfig?.frequency || 'manual',
        notifications: true
      }
    });

    // Set up trial if applicable
    if (extension.pricing.trialDays > 0) {
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + extension.pricing.trialDays);

      userExtension.trial = {
        isActive: true,
        startDate: new Date(),
        endDate: trialEndDate
      };
    }

    await userExtension.save();

    // Update extension stats
    extension.stats.installs += 1;
    extension.stats.activeInstalls += 1;
    await extension.save();

    res.json(await userExtension.populate('extension'));
  } catch (error) {
    console.error('Install extension error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Configure extension (add credentials)
router.post('/:extensionId/configure', auth, async (req, res) => {
  try {
    const userExtension = await UserExtension.findOne({
      user: req.user.userId,
      extension: req.params.extensionId
    });

    if (!userExtension) {
      return res.status(404).json({ message: 'Extension not installed' });
    }

    // Store credentials (should be encrypted in production)
    userExtension.credentials = req.body.credentials;
    userExtension.config = req.body.config;
    userExtension.status = 'active';

    await userExtension.save();

    res.json({ message: 'Extension configured successfully' });
  } catch (error) {
    console.error('Configure extension error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update extension settings
router.put('/:extensionId/settings', auth, async (req, res) => {
  try {
    const userExtension = await UserExtension.findOne({
      user: req.user.userId,
      extension: req.params.extensionId
    });

    if (!userExtension) {
      return res.status(404).json({ message: 'Extension not installed' });
    }

    userExtension.settings = {
      ...userExtension.settings,
      ...req.body
    };

    await userExtension.save();

    res.json(userExtension);
  } catch (error) {
    console.error('Update extension settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Activate/Deactivate extension
router.post('/:extensionId/:action', auth, async (req, res) => {
  try {
    const { action } = req.params;

    if (!['activate', 'deactivate'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const userExtension = await UserExtension.findOne({
      user: req.user.userId,
      extension: req.params.extensionId
    });

    if (!userExtension) {
      return res.status(404).json({ message: 'Extension not installed' });
    }

    if (action === 'activate') {
      await userExtension.activate();
    } else {
      await userExtension.deactivate();
    }

    res.json(userExtension);
  } catch (error) {
    console.error('Toggle extension error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Uninstall extension
router.delete('/:extensionId', auth, async (req, res) => {
  try {
    const userExtension = await UserExtension.findOne({
      user: req.user.userId,
      extension: req.params.extensionId
    });

    if (!userExtension) {
      return res.status(404).json({ message: 'Extension not installed' });
    }

    await userExtension.deleteOne();

    // Update extension stats
    const extension = await Extension.findById(req.params.extensionId);
    if (extension) {
      extension.stats.activeInstalls = Math.max(0, extension.stats.activeInstalls - 1);
      await extension.save();
    }

    res.json({ message: 'Extension uninstalled successfully' });
  } catch (error) {
    console.error('Uninstall extension error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Trigger manual sync
router.post('/:extensionId/sync', auth, async (req, res) => {
  try {
    const userExtension = await UserExtension.findOne({
      user: req.user.userId,
      extension: req.params.extensionId
    }).populate('extension');

    if (!userExtension) {
      return res.status(404).json({ message: 'Extension not installed' });
    }

    if (userExtension.status !== 'active') {
      return res.status(400).json({ message: 'Extension is not active' });
    }

    // Update sync status
    userExtension.syncStatus.status = 'syncing';
    userExtension.syncStatus.lastSyncAt = new Date();
    await userExtension.save();

    // TODO: Queue background job to perform actual sync
    // This would integrate with QB, Xero, etc.

    res.json({ message: 'Sync started', syncStatus: userExtension.syncStatus });
  } catch (error) {
    console.error('Sync extension error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
