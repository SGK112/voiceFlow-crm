import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  checkAIAvailability,
  improveScript,
  getScriptSuggestions,
  generateScript,
  analyzeAgentPerformance,
  getCallInsights
} from '../controllers/aiController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Check if AI service is available
router.get('/availability', checkAIAvailability);

// Script improvement and generation
router.post('/improve-script', improveScript);
router.post('/suggestions', getScriptSuggestions);
router.post('/generate-script', generateScript);

// Analytics and insights
router.get('/agent/:agentId/analyze', analyzeAgentPerformance);
router.get('/insights', getCallInsights);

export default router;
