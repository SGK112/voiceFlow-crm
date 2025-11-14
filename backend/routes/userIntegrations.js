import express from 'express';
import * as userIntegrationController from '../controllers/userIntegrationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * @route   GET /api/user-integrations
 * @desc    Get all user integrations
 * @access  Private
 */
router.get('/', userIntegrationController.getUserIntegrations);

/**
 * @route   POST /api/user-integrations/twilio
 * @desc    Connect Twilio account
 * @body    { accountSid, authToken, from, displayName? }
 * @access  Private
 */
router.post('/twilio', userIntegrationController.connectTwilio);

/**
 * @route   POST /api/user-integrations/openai
 * @desc    Connect OpenAI account
 * @body    { apiKey, organization?, displayName? }
 * @access  Private
 */
router.post('/openai', userIntegrationController.connectOpenAI);

/**
 * @route   POST /api/user-integrations/slack
 * @desc    Connect Slack workspace
 * @body    { webhookUrl, channelId?, displayName? }
 * @access  Private
 */
router.post('/slack', userIntegrationController.connectSlack);

/**
 * @route   POST /api/user-integrations/smtp
 * @desc    Connect SMTP/Email account
 * @body    { host, port, user, password, email?, displayName? }
 * @access  Private
 */
router.post('/smtp', userIntegrationController.connectSMTP);

/**
 * @route   DELETE /api/user-integrations/:service
 * @desc    Disconnect integration
 * @access  Private
 */
router.delete('/:service', userIntegrationController.disconnectIntegration);

/**
 * @route   POST /api/user-integrations/:service/test
 * @desc    Test integration connection
 * @access  Private
 */
router.post('/:service/test', userIntegrationController.testIntegration);

export default router;
