import express from 'express';
const router = express.Router();
import { protect as auth } from '../middleware/auth.js';
import { UserExtension, Extension } from '../models/Extension.js';
import qbService from '../services/quickbooksService.js';
import crypto from 'crypto';
import Invoice from '../models/Invoice.js';
import Lead from '../models/Lead.js';

// Store state tokens temporarily (in production, use Redis)
const stateStore = new Map();

// Step 1: Initiate OAuth flow
router.get('/connect', auth, async (req, res) => {
  try {
    // Generate random state token for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');

    // Store state with user ID (expires in 10 minutes)
    stateStore.set(state, {
      userId: req.user.userId,
      createdAt: Date.now()
    });

    // Clean up expired states
    setTimeout(() => stateStore.delete(state), 10 * 60 * 1000);

    // Get authorization URL
    const authUrl = qbService.getAuthorizationUrl(state);

    res.json({ authUrl });
  } catch (error) {
    console.error('QB Connect error:', error);
    res.status(500).json({ message: 'Failed to initiate QuickBooks connection' });
  }
});

// Step 2: Handle OAuth callback
router.get('/callback', async (req, res) => {
  try {
    const { code, state, realmId, error } = req.query;

    // Handle user cancellation
    if (error) {
      return res.redirect(`${process.env.FRONTEND_URL}/app/extensions?qb_error=${error}`);
    }

    // Verify state token
    const storedState = stateStore.get(state);
    if (!storedState) {
      return res.redirect(`${process.env.FRONTEND_URL}/app/extensions?qb_error=invalid_state`);
    }

    const userId = storedState.userId;
    stateStore.delete(state);

    // Exchange code for tokens
    const tokens = await qbService.getTokens(code);

    // Find QuickBooks extension
    const qbExtension = await Extension.findOne({ slug: 'quickbooks-online' });
    if (!qbExtension) {
      return res.redirect(`${process.env.FRONTEND_URL}/app/extensions?qb_error=extension_not_found`);
    }

    // Create or update user extension
    let userExtension = await UserExtension.findOne({
      user: userId,
      extension: qbExtension._id
    });

    if (!userExtension) {
      userExtension = new UserExtension({
        user: userId,
        extension: qbExtension._id,
        status: 'active'
      });
    }

    // Encrypt and store tokens (in production, use proper encryption)
    userExtension.credentials = {
      realmId: realmId
    };

    userExtension.oauth = {
      accessToken: tokens.access_token,  // TODO: Encrypt in production
      refreshToken: tokens.refresh_token,  // TODO: Encrypt in production
      expiresAt: new Date(Date.now() + (tokens.expires_in * 1000)),
      tokenType: tokens.token_type,
      scope: tokens.scope?.split(' ') || []
    };

    userExtension.status = 'active';
    userExtension.syncStatus = {
      status: 'idle',
      lastSyncAt: null
    };

    await userExtension.save();

    // Update extension stats
    if (qbExtension) {
      qbExtension.stats.activeInstalls += 1;
      await qbExtension.save();
    }

    // Redirect back to frontend
    res.redirect(`${process.env.FRONTEND_URL}/app/extensions?qb_success=true`);
  } catch (error) {
    console.error('QB Callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/app/extensions?qb_error=connection_failed`);
  }
});

// Disconnect QuickBooks
router.post('/disconnect', auth, async (req, res) => {
  try {
    const qbExtension = await Extension.findOne({ slug: 'quickbooks-online' });

    const userExtension = await UserExtension.findOne({
      user: req.user.userId,
      extension: qbExtension._id
    }).select('+oauth');

    if (!userExtension) {
      return res.status(404).json({ message: 'QuickBooks not connected' });
    }

    // Revoke token
    if (userExtension.oauth?.refreshToken) {
      try {
        await qbService.revokeToken(userExtension.oauth.refreshToken);
      } catch (error) {
        console.error('Token revocation error:', error);
        // Continue anyway
      }
    }

    // Delete user extension
    await userExtension.deleteOne();

    // Update stats
    if (qbExtension) {
      qbExtension.stats.activeInstalls = Math.max(0, qbExtension.stats.activeInstalls - 1);
      await qbExtension.save();
    }

    res.json({ message: 'QuickBooks disconnected successfully' });
  } catch (error) {
    console.error('QB Disconnect error:', error);
    res.status(500).json({ message: 'Failed to disconnect QuickBooks' });
  }
});

// Manually trigger sync
router.post('/sync', auth, async (req, res) => {
  try {
    const qbExtension = await Extension.findOne({ slug: 'quickbooks-online' });

    const userExtension = await UserExtension.findOne({
      user: req.user.userId,
      extension: qbExtension._id
    }).select('+oauth +credentials');

    if (!userExtension) {
      return res.status(404).json({ message: 'QuickBooks not connected' });
    }

    // Check if token needs refresh
    if (new Date() > userExtension.oauth.expiresAt) {
      const newTokens = await qbService.refreshToken(userExtension.oauth.refreshToken);

      userExtension.oauth.accessToken = newTokens.access_token;
      userExtension.oauth.refreshToken = newTokens.refresh_token;
      userExtension.oauth.expiresAt = new Date(Date.now() + (newTokens.expires_in * 1000));

      await userExtension.save();
    }

    // Update sync status
    userExtension.syncStatus.status = 'syncing';
    await userExtension.save();

    // Queue background job to sync
    // TODO: Use Bull or Bee-Queue to queue sync job
    // For now, trigger immediate sync
    const syncResult = await performSync(
      userExtension.credentials.realmId,
      userExtension.oauth.accessToken,
      req.user.userId
    );

    // Update sync status
    userExtension.syncStatus = {
      status: 'success',
      lastSyncAt: new Date(),
      syncedEntities: syncResult.entities
    };
    await userExtension.save();

    res.json({
      message: 'Sync completed successfully',
      result: syncResult
    });
  } catch (error) {
    console.error('QB Sync error:', error);

    // Update sync status to error
    const qbExtension = await Extension.findOne({ slug: 'quickbooks-online' });
    const userExtension = await UserExtension.findOne({
      user: req.user.userId,
      extension: qbExtension._id
    });

    if (userExtension) {
      userExtension.syncStatus.status = 'error';
      userExtension.syncStatus.error = error.message;
      await userExtension.save();
    }

    res.status(500).json({ message: 'Sync failed', error: error.message });
  }
});

// Get sync status
router.get('/status', auth, async (req, res) => {
  try {
    const qbExtension = await Extension.findOne({ slug: 'quickbooks-online' });

    const userExtension = await UserExtension.findOne({
      user: req.user.userId,
      extension: qbExtension._id
    });

    if (!userExtension) {
      return res.json({ connected: false });
    }

    res.json({
      connected: true,
      status: userExtension.status,
      syncStatus: userExtension.syncStatus,
      lastSyncAt: userExtension.syncStatus.lastSyncAt
    });
  } catch (error) {
    console.error('QB Status error:', error);
    res.status(500).json({ message: 'Failed to get status' });
  }
});

// Webhook endpoint (receive updates from QuickBooks)
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['intuit-signature'];
    const payload = JSON.stringify(req.body);

    // Verify webhook signature
    const webhookToken = process.env.QB_WEBHOOK_TOKEN;
    const isValid = qbService.verifyWebhookSignature(payload, signature, webhookToken);

    if (!isValid) {
      return res.status(401).json({ message: 'Invalid signature' });
    }

    const { eventNotifications } = req.body;

    // Process each notification
    for (const notification of eventNotifications) {
      const { realmId, dataChangeEvent } = notification;

      // Find user extension by realmId
      const userExtension = await UserExtension.findOne({
        'credentials.realmId': realmId
      }).select('+oauth +credentials').populate('user');

      if (!userExtension) continue;

      // Process each entity change
      for (const entity of dataChangeEvent.entities) {
        await handleEntityChange(
          entity,
          realmId,
          userExtension.oauth.accessToken,
          userExtension.user._id
        );
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('QB Webhook error:', error);
    res.status(500).send('Error processing webhook');
  }
});

// Helper function to perform sync
async function performSync(realmId, accessToken, userId) {

  const entities = [];

  // Sync customers
  const qbCustomers = await qbService.queryCustomers(realmId, accessToken);
  // TODO: Map and save to Lead model
  entities.push({ entity: 'customers', count: qbCustomers.QueryResponse?.Customer?.length || 0 });

  // Sync invoices
  const qbInvoices = await qbService.makeRequest(
    'GET',
    '/query?query=' + encodeURIComponent('SELECT * FROM Invoice'),
    realmId,
    accessToken
  );

  // TODO: Map and save to Invoice model
  entities.push({ entity: 'invoices', count: qbInvoices.QueryResponse?.Invoice?.length || 0 });

  return { entities };
}

// Helper function to handle entity changes from webhook
async function handleEntityChange(entity, realmId, accessToken, userId) {
  const { name, id, operation } = entity;

  if (name === 'Invoice') {

    if (operation === 'Create' || operation === 'Update') {
      const qbInvoice = await qbService.getInvoice(realmId, accessToken, id);
      const crmInvoice = qbService.mapQBInvoiceToCRM(qbInvoice.Invoice);

      // Find and update or create
      await Invoice.findOneAndUpdate(
        { user: userId, quickbooksId: id },
        { ...crmInvoice, quickbooksId: id, syncStatus: 'synced' },
        { upsert: true, new: true }
      );
    } else if (operation === 'Delete') {
      await Invoice.findOneAndUpdate(
        { user: userId, quickbooksId: id },
        { status: 'cancelled' }
      );
    }
  }

  // Handle other entities (Customer, Estimate, Payment)
  // TODO: Implement handlers for other entity types
}

export default router;
