import express from 'express';
import {
  createDemoAgent,
  startConversationalSession,
  getWidgetCode,
  testTextMessage,
  getActiveSessions
} from '../controllers/conversationalAgentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Create demo multimodal agent
router.post('/demo', protect, createDemoAgent);

// Start conversational session
router.post('/session/start', protect, startConversationalSession);

// Get widget embed code
router.get('/:id/widget', protect, getWidgetCode);

// Test text messaging
router.post('/test-text', protect, testTextMessage);

// Get active sessions
router.get('/sessions', protect, getActiveSessions);

export default router;
