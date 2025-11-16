import express from 'express';
import {
  getCredentials,
  checkCredential,
  getOAuthUrl,
  checkWorkflowCredentials,
  getPopularCredentials,
  getNodeCredentialInfo,
  deleteCredential
} from '../controllers/credentialController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get all user credentials
router.get('/', protect, getCredentials);

// Get popular credentials
router.get('/popular', protect, getPopularCredentials);

// Check if user has specific credential
router.get('/check/:type', protect, checkCredential);

// Get OAuth URL for credential type
router.get('/oauth/:type', protect, getOAuthUrl);

// Get credential info for node type
router.get('/node/:nodeType', protect, getNodeCredentialInfo);

// Check credentials for entire workflow
router.post('/check-workflow', protect, checkWorkflowCredentials);

// Delete credential
router.delete('/:id', protect, deleteCredential);

export default router;
