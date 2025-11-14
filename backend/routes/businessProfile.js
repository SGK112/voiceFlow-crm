import express from 'express';
import multer from 'multer';
import path from 'path';
import { protect as auth } from '../middleware/auth.js';
import * as businessProfileController from '../controllers/businessProfileController.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'logo') {
      cb(null, 'uploads/logos/');
    } else if (file.fieldname === 'priceSheet') {
      cb(null, 'uploads/price-sheets/');
    } else {
      cb(null, 'uploads/');
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // For logos: accept images
  if (file.fieldname === 'logo') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for logos'), false);
    }
  }
  // For price sheets: accept PDF, CSV, Excel
  else if (file.fieldname === 'priceSheet') {
    const allowedMimes = [
      'application/pdf',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, CSV, or Excel files are allowed for price sheets'), false);
    }
  }
  else {
    cb(null, true);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

/**
 * Business Profile Routes
 * All routes require authentication
 */

// Get user's business profile
router.get('/', auth, businessProfileController.getProfile);

// Update business profile
router.put('/', auth, businessProfileController.updateProfile);

// Upload logo
router.post('/logo', auth, upload.single('logo'), businessProfileController.uploadLogo);

// Price Sheets
router.post('/price-sheets', auth, upload.single('priceSheet'), businessProfileController.addPriceSheet);
router.delete('/price-sheets/:sheetId', auth, businessProfileController.deletePriceSheet);

// Team Members
router.post('/team-members', auth, businessProfileController.addTeamMember);
router.put('/team-members/:memberId', auth, businessProfileController.updateTeamMember);
router.delete('/team-members/:memberId', auth, businessProfileController.deleteTeamMember);

// Integration Sync
router.post('/sync/quickbooks', auth, businessProfileController.syncQuickBooks);

// Completion Status
router.get('/completion', auth, businessProfileController.getCompletionStatus);

export default router;
