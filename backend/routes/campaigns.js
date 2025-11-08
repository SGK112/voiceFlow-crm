import express from 'express';
import multer from 'multer';
import {
  getCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  uploadContacts,
  addContact,
  startCampaign,
  pauseCampaign,
  resumeCampaign,
  getCampaignStats
} from '../controllers/campaignController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for CSV uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
});

// All routes require authentication
router.use(protect);

// Campaign CRUD
router.get('/', getCampaigns);
router.get('/:id', getCampaignById);
router.post('/', createCampaign);
router.put('/:id', updateCampaign);
router.delete('/:id', deleteCampaign);

// Contact management
router.post('/:id/contacts/upload', upload.single('csv'), uploadContacts);
router.post('/:id/contacts', addContact);

// Campaign control
router.post('/:id/start', startCampaign);
router.post('/:id/pause', pauseCampaign);
router.post('/:id/resume', resumeCampaign);

// Statistics
router.get('/:id/stats', getCampaignStats);

export default router;
