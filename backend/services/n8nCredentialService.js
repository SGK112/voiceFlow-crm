import axios from 'axios';

/**
 * n8n Credential Service
 * Manages OAuth credentials and detects required credentials for nodes
 */
class N8nCredentialService {
  constructor() {
    this.apiUrl = process.env.N8N_API_URL || 'http://5.183.8.119:5678';
    this.apiKey = process.env.N8N_API_KEY;

    this.client = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': this.apiKey
      }
    });

    // Map of node types to required credential types
    this.nodeCredentialMap = {
      // Google Services
      'google_sheets': { type: 'googleSheetsOAuth2Api', name: 'Google Sheets', provider: 'Google' },
      'google_calendar': { type: 'googleCalendarOAuth2Api', name: 'Google Calendar', provider: 'Google' },
      'google_drive': { type: 'googleDriveOAuth2Api', name: 'Google Drive', provider: 'Google' },
      'gmail': { type: 'gmailOAuth2', name: 'Gmail', provider: 'Google' },

      // Social Media
      'facebook': { type: 'facebookGraphApi', name: 'Facebook', provider: 'Facebook' },
      'facebook_page': { type: 'facebookGraphApi', name: 'Facebook Page', provider: 'Facebook' },
      'instagram': { type: 'instagramBusinessAccount', name: 'Instagram Business', provider: 'Facebook' },
      'twitter': { type: 'twitterOAuth2Api', name: 'Twitter/X', provider: 'Twitter' },
      'linkedin': { type: 'linkedInOAuth2Api', name: 'LinkedIn', provider: 'LinkedIn' },

      // Accounting & CRM
      'quickbooks': { type: 'quickBooksOAuth2Api', name: 'QuickBooks', provider: 'QuickBooks' },
      'salesforce': { type: 'salesforceOAuth2Api', name: 'Salesforce', provider: 'Salesforce' },
      'hubspot': { type: 'hubspotOAuth2Api', name: 'HubSpot', provider: 'HubSpot' },

      // Communication
      'slack': { type: 'slackOAuth2Api', name: 'Slack', provider: 'Slack' },
      'microsoft_teams': { type: 'microsoftTeamsOAuth2Api', name: 'Microsoft Teams', provider: 'Microsoft' },
      'zoom': { type: 'zoomOAuth2Api', name: 'Zoom', provider: 'Zoom' },

      // Payment & E-commerce
      'stripe': { type: 'stripeApi', name: 'Stripe', provider: 'Stripe' },
      'shopify': { type: 'shopifyOAuth2Api', name: 'Shopify', provider: 'Shopify' },
      'woocommerce': { type: 'wooCommerceApi', name: 'WooCommerce', provider: 'WooCommerce' },

      // Email & Marketing
      'mailchimp': { type: 'mailchimpOAuth2Api', name: 'Mailchimp', provider: 'Mailchimp' },
      'sendgrid': { type: 'sendGridApi', name: 'SendGrid', provider: 'SendGrid' },

      // Project Management
      'asana': { type: 'asanaOAuth2Api', name: 'Asana', provider: 'Asana' },
      'trello': { type: 'trelloApi', name: 'Trello', provider: 'Trello' },
      'notion': { type: 'notionOAuth2Api', name: 'Notion', provider: 'Notion' },

      // File Storage
      'dropbox': { type: 'dropboxOAuth2Api', name: 'Dropbox', provider: 'Dropbox' },
      'onedrive': { type: 'microsoftOneDriveOAuth2Api', name: 'OneDrive', provider: 'Microsoft' },

      // Already configured (no OAuth needed)
      'send_sms': null, // Uses Twilio - already configured
      'send_email': null, // Uses SMTP - already configured
      'save_lead': null, // HTTP request - no credentials
      'webhook': null, // No credentials needed
      'condition': null, // No credentials needed
      'wait': null, // No credentials needed
      'custom_code': null // No credentials needed
    };
  }

  /**
   * Check if a node type requires credentials
   */
  requiresCredential(nodeType) {
    const credInfo = this.nodeCredentialMap[nodeType];
    return credInfo !== null && credInfo !== undefined;
  }

  /**
   * Get required credential info for a node type
   */
  getRequiredCredential(nodeType) {
    return this.nodeCredentialMap[nodeType] || null;
  }

  /**
   * Check if user has a specific credential type configured
   */
  async hasCredential(credentialType) {
    try {
      const response = await this.client.get('/api/v1/credentials');
      const credentials = response.data.data || [];

      return credentials.some(cred => cred.type === credentialType);
    } catch (error) {
      console.error('Error checking credentials:', error.message);
      return false;
    }
  }

  /**
   * Get all user credentials
   */
  async getUserCredentials() {
    try {
      const response = await this.client.get('/api/v1/credentials');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching credentials:', error.message);
      return [];
    }
  }

  /**
   * Get OAuth authorization URL for a credential type
   */
  getOAuthUrl(credentialType, callbackUrl) {
    const baseUrl = this.apiUrl;
    const encodedCallback = encodeURIComponent(callbackUrl);

    // n8n OAuth URL format
    return `${baseUrl}/rest/oauth2-credential/auth?credentialType=${credentialType}&callback=${encodedCallback}`;
  }

  /**
   * Create a new credential (for non-OAuth credentials like API keys)
   */
  async createCredential(credentialData) {
    try {
      const response = await this.client.post('/api/v1/credentials', credentialData);
      return response.data;
    } catch (error) {
      console.error('Error creating credential:', error.message);
      throw error;
    }
  }

  /**
   * Delete a credential
   */
  async deleteCredential(credentialId) {
    try {
      await this.client.delete(`/api/v1/credentials/${credentialId}`);
      return true;
    } catch (error) {
      console.error('Error deleting credential:', error.message);
      return false;
    }
  }

  /**
   * Get credential by type
   */
  async getCredentialByType(credentialType) {
    try {
      const credentials = await this.getUserCredentials();
      return credentials.find(cred => cred.type === credentialType);
    } catch (error) {
      console.error('Error finding credential:', error.message);
      return null;
    }
  }

  /**
   * Check credentials status for a workflow
   */
  async checkWorkflowCredentials(workflowNodes) {
    const credentialStatus = [];

    for (const node of workflowNodes) {
      const nodeType = node.data?.type || node.type;
      const credInfo = this.getRequiredCredential(nodeType);

      if (credInfo) {
        const hasCredential = await this.hasCredential(credInfo.type);
        credentialStatus.push({
          nodeId: node.id,
          nodeType,
          credentialType: credInfo.type,
          credentialName: credInfo.name,
          provider: credInfo.provider,
          isConfigured: hasCredential,
          oauthUrl: this.getOAuthUrl(credInfo.type, process.env.CLIENT_URL + '/app/workflows')
        });
      }
    }

    return credentialStatus;
  }

  /**
   * Get popular credential types
   */
  getPopularCredentials() {
    return [
      { type: 'googleSheetsOAuth2Api', name: 'Google Sheets', icon: '📊', category: 'Productivity' },
      { type: 'gmailOAuth2', name: 'Gmail', icon: '📧', category: 'Communication' },
      { type: 'slackOAuth2Api', name: 'Slack', icon: '💬', category: 'Communication' },
      { type: 'googleCalendarOAuth2Api', name: 'Google Calendar', icon: '📅', category: 'Productivity' },
      { type: 'stripeApi', name: 'Stripe', icon: '💳', category: 'Payment' },
      { type: 'quickBooksOAuth2Api', name: 'QuickBooks', icon: '💰', category: 'Accounting' },
      { type: 'salesforceOAuth2Api', name: 'Salesforce', icon: '☁️', category: 'CRM' },
      { type: 'facebookGraphApi', name: 'Facebook', icon: '📘', category: 'Social Media' },
      { type: 'hubspotOAuth2Api', name: 'HubSpot', icon: '🟠', category: 'CRM' },
      { type: 'shopifyOAuth2Api', name: 'Shopify', icon: '🛍️', category: 'E-commerce' }
    ];
  }

  /**
   * Get credential categories
   */
  getCredentialCategories() {
    return {
      'Communication': ['Slack', 'Microsoft Teams', 'Gmail', 'Zoom'],
      'Productivity': ['Google Sheets', 'Google Calendar', 'Google Drive', 'Notion', 'Asana'],
      'Social Media': ['Facebook', 'Instagram', 'Twitter', 'LinkedIn'],
      'CRM': ['Salesforce', 'HubSpot'],
      'Accounting': ['QuickBooks', 'Stripe'],
      'E-commerce': ['Shopify', 'WooCommerce'],
      'Marketing': ['Mailchimp', 'SendGrid']
    };
  }
}

export default N8nCredentialService;
