import express from 'express';
import {
  getAIAgents,
  getAIAgent,
  createAIAgent,
  updateAIAgent,
  deleteAIAgent,
  chatWithAgent,
  deployAIAgent,
  pauseAIAgent,
  getAvailableModels,
  getAIAgentTemplates,
  testAIAgent
} from '../controllers/aiAgentController.js';
import { protect } from '../middleware/auth.js';
import { requirePlan } from '../middleware/subscriptionGate.js';

const router = express.Router();

// AI Agent CRUD
router.get('/', protect, getAIAgents);
router.get('/helpers/models', protect, getAvailableModels);
router.get('/helpers/templates', protect, getAIAgentTemplates);
router.get('/:id', protect, getAIAgent);
// Requires Starter plan or higher to create AI agents
router.post('/create', protect, requirePlan('starter'), createAIAgent);
router.patch('/:id', protect, updateAIAgent);
router.delete('/:id', protect, deleteAIAgent);

// AI Agent Operations
router.post('/:id/chat', protect, chatWithAgent);
// Requires Starter plan or higher to deploy AI agents
router.post('/:id/deploy', protect, requirePlan('starter'), deployAIAgent);
router.post('/:id/pause', protect, pauseAIAgent);
router.post('/:id/test', protect, testAIAgent);

export default router;
