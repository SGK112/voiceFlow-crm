import express from 'express';
import { protect as auth } from '../middleware/auth.js';
import * as agentLibraryController from '../controllers/agentLibraryController.js';

const router = express.Router();

/**
 * Agent Library Routes
 *
 * These routes allow users to browse the agent library,
 * create agents from templates, and manage their agents.
 */

// Get all available agent templates
router.get('/templates', auth, agentLibraryController.getTemplates);

// Get single template details
router.get('/templates/:templateId', auth, agentLibraryController.getTemplate);

// Get user's configured agents
router.get('/my-agents', auth, agentLibraryController.getMyAgents);

// Get single agent
router.get('/my-agents/:agentId', auth, agentLibraryController.getAgent);

// Create agent from template
router.post('/my-agents', auth, agentLibraryController.createAgent);

// Update agent configuration
router.put('/my-agents/:agentId', auth, agentLibraryController.updateAgent);

// Activate agent
router.post('/my-agents/:agentId/activate', auth, agentLibraryController.activateAgent);

// Pause agent
router.post('/my-agents/:agentId/pause', auth, agentLibraryController.pauseAgent);

// Resume agent
router.post('/my-agents/:agentId/resume', auth, agentLibraryController.resumeAgent);

// Archive agent
router.delete('/my-agents/:agentId', auth, agentLibraryController.archiveAgent);

// Get agent statistics
router.get('/my-agents/:agentId/stats', auth, agentLibraryController.getAgentStats);

// Get agent billing info
router.get('/my-agents/:agentId/billing', auth, agentLibraryController.getAgentBilling);

// Test agent with sample call
router.post('/my-agents/:agentId/test', auth, agentLibraryController.testAgent);

// Connect integration to agent
router.post('/my-agents/:agentId/integrations/:service', auth, agentLibraryController.connectIntegration);

// Disconnect integration from agent
router.delete('/my-agents/:agentId/integrations/:service', auth, agentLibraryController.disconnectIntegration);

export default router;
