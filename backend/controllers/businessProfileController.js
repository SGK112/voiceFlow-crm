import BusinessProfile from '../models/BusinessProfile.js';
import agentContextService from '../services/agentContextService.js';

/**
 * Business Profile Controller
 *
 * Handles all business profile operations
 */

// Get user's business profile
export const getProfile = async (req, res) => {
  try {
    const profile = await BusinessProfile.findOrCreateForUser(req.user._id);

    res.json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to fetch business profile' });
  }
};

// Update business profile
export const updateProfile = async (req, res) => {
  try {
    const profile = await BusinessProfile.findOne({ userId: req.user._id });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Update allowed fields
    const {
      companyName,
      legalName,
      phone,
      email,
      website,
      taxId,
      address,
      billingAddress,
      serviceArea,
      industry,
      businessType,
      yearsInBusiness,
      numberOfEmployees,
      procedures
    } = req.body;

    // Update basic info
    if (companyName !== undefined) profile.companyName = companyName;
    if (legalName !== undefined) profile.legalName = legalName;
    if (phone !== undefined) profile.phone = phone;
    if (email !== undefined) profile.email = email;
    if (website !== undefined) profile.website = website;
    if (taxId !== undefined) profile.taxId = taxId;

    // Update address
    if (address) {
      profile.address = { ...profile.address, ...address };
    }

    // Update billing address
    if (billingAddress) {
      profile.billingAddress = billingAddress;
    }

    // Update service area
    if (serviceArea) {
      profile.serviceArea = { ...profile.serviceArea, ...serviceArea };
    }

    // Update business details
    if (industry !== undefined) profile.industry = industry;
    if (businessType !== undefined) profile.businessType = businessType;
    if (yearsInBusiness !== undefined) profile.yearsInBusiness = yearsInBusiness;
    if (numberOfEmployees !== undefined) profile.numberOfEmployees = numberOfEmployees;

    // Update procedures
    if (procedures) {
      profile.procedures = { ...profile.procedures, ...procedures };
    }

    await profile.save();

    // Auto-sync price sheets to knowledge base in background (don't wait)
    if (profile.priceSheets && profile.priceSheets.length > 0) {
      agentContextService.syncPriceSheetsToKnowledgeBase(req.user._id).catch(err => {
        console.error('Background price sheet sync failed:', err);
      });
    }

    res.json({
      message: 'Profile updated successfully',
      profile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};

// Upload logo
export const uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const profile = await BusinessProfile.findOne({ userId: req.user._id });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // In a real app, you'd upload to S3 or similar
    // For now, store the file path
    profile.logo = `/uploads/logos/${req.file.filename}`;
    await profile.save();

    res.json({
      message: 'Logo uploaded successfully',
      logoUrl: profile.logo
    });
  } catch (error) {
    console.error('Upload logo error:', error);
    res.status(500).json({ message: 'Failed to upload logo' });
  }
};

// Add price sheet
export const addPriceSheet = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const profile = await BusinessProfile.findOne({ userId: req.user._id });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Determine file type
    const fileType = req.file.mimetype.includes('pdf') ? 'pdf' :
                     req.file.mimetype.includes('csv') ? 'csv' :
                     req.file.mimetype.includes('spreadsheet') || req.file.mimetype.includes('excel') ? 'xlsx' :
                     'other';

    // Add price sheet
    profile.priceSheets.push({
      filename: req.file.originalname,
      url: `/uploads/price-sheets/${req.file.filename}`,
      fileType,
      fileSize: req.file.size
    });

    await profile.save();

    res.json({
      message: 'Price sheet uploaded successfully',
      priceSheet: profile.priceSheets[profile.priceSheets.length - 1]
    });
  } catch (error) {
    console.error('Upload price sheet error:', error);
    res.status(500).json({ message: 'Failed to upload price sheet' });
  }
};

// Delete price sheet
export const deletePriceSheet = async (req, res) => {
  try {
    const { sheetId } = req.params;

    const profile = await BusinessProfile.findOne({ userId: req.user._id });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    profile.priceSheets = profile.priceSheets.filter(
      sheet => sheet._id.toString() !== sheetId
    );

    await profile.save();

    res.json({ message: 'Price sheet deleted successfully' });
  } catch (error) {
    console.error('Delete price sheet error:', error);
    res.status(500).json({ message: 'Failed to delete price sheet' });
  }
};

// Add team member
export const addTeamMember = async (req, res) => {
  try {
    const { name, email, phone, role } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const profile = await BusinessProfile.findOne({ userId: req.user._id });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    profile.teamMembers.push({
      name,
      email,
      phone,
      role: role || 'other'
    });

    await profile.save();

    res.json({
      message: 'Team member added successfully',
      teamMember: profile.teamMembers[profile.teamMembers.length - 1]
    });
  } catch (error) {
    console.error('Add team member error:', error);
    res.status(500).json({ message: 'Failed to add team member' });
  }
};

// Update team member
export const updateTeamMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { name, email, phone, role, isActive } = req.body;

    const profile = await BusinessProfile.findOne({ userId: req.user._id });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const member = profile.teamMembers.id(memberId);

    if (!member) {
      return res.status(404).json({ message: 'Team member not found' });
    }

    if (name !== undefined) member.name = name;
    if (email !== undefined) member.email = email;
    if (phone !== undefined) member.phone = phone;
    if (role !== undefined) member.role = role;
    if (isActive !== undefined) member.isActive = isActive;

    await profile.save();

    res.json({
      message: 'Team member updated successfully',
      teamMember: member
    });
  } catch (error) {
    console.error('Update team member error:', error);
    res.status(500).json({ message: 'Failed to update team member' });
  }
};

// Delete team member
export const deleteTeamMember = async (req, res) => {
  try {
    const { memberId } = req.params;

    const profile = await BusinessProfile.findOne({ userId: req.user._id });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    profile.teamMembers = profile.teamMembers.filter(
      member => member._id.toString() !== memberId
    );

    await profile.save();

    res.json({ message: 'Team member deleted successfully' });
  } catch (error) {
    console.error('Delete team member error:', error);
    res.status(500).json({ message: 'Failed to delete team member' });
  }
};

// Sync QuickBooks data
export const syncQuickBooks = async (req, res) => {
  try {
    const profile = await BusinessProfile.findOne({ userId: req.user._id });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // TODO: Implement actual QuickBooks sync
    // For now, just update sync status
    profile.integrationSync.quickbooks.enabled = true;
    profile.integrationSync.quickbooks.lastSync = new Date();
    // profile.integrationSync.quickbooks.customerCount = syncedCustomers.length;
    // profile.integrationSync.quickbooks.vendorCount = syncedVendors.length;

    await profile.save();

    res.json({
      message: 'QuickBooks sync initiated',
      syncStatus: profile.integrationSync.quickbooks
    });
  } catch (error) {
    console.error('Sync QuickBooks error:', error);
    res.status(500).json({ message: 'Failed to sync QuickBooks' });
  }
};

// Get completion status
export const getCompletionStatus = async (req, res) => {
  try {
    const profile = await BusinessProfile.findOne({ userId: req.user._id });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    profile.calculateCompletion();

    res.json({
      completionStatus: profile.completionStatus,
      percentComplete: profile.completionStatus.percentComplete
    });
  } catch (error) {
    console.error('Get completion status error:', error);
    res.status(500).json({ message: 'Failed to get completion status' });
  }
};

export default {
  getProfile,
  updateProfile,
  uploadLogo,
  addPriceSheet,
  deletePriceSheet,
  addTeamMember,
  updateTeamMember,
  deleteTeamMember,
  syncQuickBooks,
  getCompletionStatus
};
