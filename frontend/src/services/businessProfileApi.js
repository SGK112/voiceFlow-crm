import api from './api';

/**
 * Business Profile API Service
 * Handles all business profile operations
 */
const businessProfileApi = {
  // Get business profile
  getProfile: async () => {
    return api.get('/business-profile');
  },

  // Update business profile
  updateProfile: async (profileData) => {
    return api.put('/business-profile', profileData);
  },

  // Upload logo
  uploadLogo: async (file) => {
    const formData = new FormData();
    formData.append('logo', file);

    return api.post('/business-profile/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Upload price sheet
  uploadPriceSheet: async (file) => {
    const formData = new FormData();
    formData.append('priceSheet', file);

    return api.post('/business-profile/price-sheets', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Delete price sheet
  deletePriceSheet: async (sheetId) => {
    return api.delete(`/business-profile/price-sheets/${sheetId}`);
  },

  // Add team member
  addTeamMember: async (memberData) => {
    return api.post('/business-profile/team-members', memberData);
  },

  // Update team member
  updateTeamMember: async (memberId, memberData) => {
    return api.put(`/business-profile/team-members/${memberId}`, memberData);
  },

  // Delete team member
  deleteTeamMember: async (memberId) => {
    return api.delete(`/business-profile/team-members/${memberId}`);
  },

  // Sync QuickBooks
  syncQuickBooks: async () => {
    return api.post('/business-profile/sync/quickbooks');
  },

  // Get completion status
  getCompletionStatus: async () => {
    return api.get('/business-profile/completion');
  }
};

export default businessProfileApi;
